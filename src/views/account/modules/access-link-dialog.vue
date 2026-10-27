<template>
  <ElDialog
    v-model="dialogVisible"
    title="企业访问链接"
    width="1060px"
    :style="{ maxWidth: 'calc(100vw - 24px)' }"
    align-center
    destroy-on-close
    class="account-access-dialog"
    :close-on-click-modal="!busy"
    :close-on-press-escape="!busy"
    :show-close="!busy"
  >
    <div class="access-content">
      <div class="account-summary">
        <div>
          <strong>{{ accountData?.accountName || accountData?.account || '企业' }}</strong>
          <div class="account-detail"
            >企业ID：{{ accountData?.id ?? '--' }} · 账号：{{ accountData?.account || '--' }}</div
          >
        </div>
        <ElTag type="info">仅操作当前企业</ElTag>
      </div>

      <section v-loading="loading" class="links-section" aria-label="当前企业链接">
        <div class="section-heading">
          <h3>现有链接</h3>
          <div class="section-actions">
            <ElButton :disabled="busy || loading" @click="refreshLinks">刷新</ElButton>
            <ElButton
              :disabled="busy || loading || loadError || !usableRows.length"
              @click="copyAll"
              >复制全部有效链接</ElButton
            >
          </div>
        </div>
        <ElAlert
          v-if="loadError"
          title="读取链接失败，请刷新后再生成，避免误判旧链接状态。"
          type="error"
          :closable="false"
          show-icon
        />
        <template v-else>
          <ElTable
            :data="rows"
            row-key="id"
            max-height="42vh"
            empty-text="暂无已生成的访问链接"
            class="desktop-links"
          >
            <ElTableColumn label="类型／用途" width="138">
              <template #default="{ row }">
                <div class="type-cell">
                  <ElTag :type="row.typeTagType">{{ row.typeName }}</ElTag>
                  <ElTag :type="row.relationTagType">{{ row.relationName }}</ElTag>
                </div>
              </template>
            </ElTableColumn>
            <ElTableColumn label="链接" min-width="260">
              <template #default="{ row }">
                <ElLink
                  v-if="row.visitUrl"
                  :href="row.visitUrl"
                  target="_blank"
                  rel="noopener noreferrer"
                  type="primary"
                  class="link-text"
                  >{{ row.visitUrl }}</ElLink
                >
                <span v-else>暂无可用地址</span>
              </template>
            </ElTableColumn>
            <ElTableColumn label="状态" width="110">
              <template #default="{ row }"
                ><ElTag :type="row.tagType">{{ row.statusText }}</ElTag></template
              >
            </ElTableColumn>
            <ElTableColumn label="到期时间" width="180">
              <template #default="{ row }">{{ row.expirationText }}</template>
            </ElTableColumn>
            <ElTableColumn label="操作" width="88">
              <template #default="{ row }">
                <ElButton
                  link
                  type="primary"
                  :disabled="busy || !row.visitUrl"
                  @click="copyLink(row.visitUrl)"
                  >复制</ElButton
                >
              </template>
            </ElTableColumn>
          </ElTable>
          <div class="mobile-links">
            <ElEmpty v-if="!rows.length" description="暂无已生成的访问链接" :image-size="60" />
            <article v-for="row in rows" :key="row.id" class="link-card">
              <div class="link-card-header">
                <div class="link-card-tags">
                  <ElTag :type="row.typeTagType">{{ row.typeName }}</ElTag>
                  <ElTag :type="row.relationTagType">{{ row.relationName }}</ElTag>
                </div>
                <ElTag :type="row.tagType">{{ row.statusText }}</ElTag>
              </div>
              <ElLink
                v-if="row.visitUrl"
                :href="row.visitUrl"
                target="_blank"
                rel="noopener noreferrer"
                type="primary"
                class="link-text"
                >{{ row.visitUrl }}</ElLink
              >
              <span v-else class="account-detail">暂无可用地址</span>
              <div class="link-card-footer"
                ><span>{{ row.type === 3 ? '长期有效' : `到期：${row.expirationText}` }}</span
                ><ElButton
                  type="primary"
                  plain
                  :disabled="busy || !row.visitUrl"
                  @click="copyLink(row.visitUrl)"
                  >复制</ElButton
                ></div
              >
            </article>
          </div>
        </template>
      </section>

      <section class="generation-section" aria-label="生成链接">
        <h3>生成链接</h3>
        <ElAlert
          :title="generationHint"
          :type="activeCount || expiredCount || invalidCount ? 'warning' : 'info'"
          :closable="false"
          show-icon
        />
        <ElForm label-position="top" class="generation-form" @submit.prevent="handleGenerate">
          <ElFormItem label="快捷、粉商地址有效时长">
            <div class="duration-input">
              <ElInputNumber
                :key="busy || loading ? 'locked' : 'editable'"
                v-model="duration"
                :min="1"
                :max="36500"
                :precision="0"
                :step="1"
                :disabled="busy || loading"
              />
              <ElSelect v-model="durationUnit" :disabled="busy || loading" aria-label="时长单位">
                <ElOption label="日" value="DAY" /><ElOption label="周" value="WEEK" /><ElOption
                  label="月"
                  value="MONTH"
                />
              </ElSelect>
            </div>
          </ElFormItem>
        </ElForm>
        <p class="generation-note">1周按7天、1月按30天计算。客服地址不带随机串，长期有效。</p>
      </section>
    </div>
    <template #footer>
      <div class="dialog-actions">
        <ElButton :disabled="busy" @click="dialogVisible = false">关闭</ElButton>
        <ElButton
          type="primary"
          :loading="generating"
          :disabled="busy || loading || loadError || accountData?.id == null"
          @click="handleGenerate"
          >生成链接</ElButton
        >
      </div>
    </template>
  </ElDialog>
</template>

<script setup lang="ts">
  import { useNow } from '@vueuse/core'
  import { ElMessage, ElMessageBox } from 'element-plus'
  import { generateEnterpriseLinks, getAccountAccessUrls } from '@/api/account'
  import { copyTextOrPrompt } from '@/utils/clipboard-dialog'
  import { safeHttpUrl, visitUrlWithNonce } from '@/utils/navigation/safe-url'
  import {
    URL_TYPE_MAP,
    URL_TYPE_TAG_MAP,
    RELATION_TYPE_MAP,
    RELATION_TYPE_TAG_MAP
  } from '@/views/account-url-main/constants'

  const props = defineProps<{ visible: boolean; accountData?: Api.AccountManage.AccountListItem }>()
  const emit = defineEmits<{ (e: 'update:visible', value: boolean): void }>()
  const links = ref<Api.AccountManage.AccessUrlListItem[]>([])
  const loading = ref(false)
  const loadError = ref(false)
  const generating = ref(false)
  const copying = ref(false)
  const duration = ref<number | undefined>(1)
  const durationUnit = ref<Api.AccountManage.EnterpriseLinkGenerateParams['durationUnit']>('DAY')
  const now = useNow({ interval: 1000 })
  const busy = computed(() => generating.value || copying.value)
  let contextVersion = 0
  let requestVersion = 0
  const dialogVisible = computed({
    get: () => props.visible,
    set: (value) => {
      if (!busy.value) emit('update:visible', value)
    }
  })

  const getVisitUrl = (row: Api.AccountManage.AccessUrlListItem) => {
    if (row.type !== 3) return visitUrlWithNonce(row.mainVisitUrl, row.nonceStr)
    const baseUrl = safeHttpUrl(row.mainVisitUrl)
    if (!baseUrl) return ''
    const url = new URL(baseUrl)
    url.searchParams.delete('nonce')
    return url.href
  }
  const expirationTimestamp = (value?: string | null) => {
    if (!value) return NaN
    // 后端日期格式固定为 GMT+8，显式时区避免手机浏览器解析和本机时区差异。
    const formatted = /^\d{4}-\d{2}-\d{2}[ T]\d{2}:\d{2}:\d{2}(\.\d+)?$/.test(value)
      ? value.replace(' ', 'T') + '+08:00'
      : value
    return Date.parse(formatted)
  }
  const rows = computed(() =>
    links.value.map((row) => {
      const visitUrl = getVisitUrl(row)
      const expiry = expirationTimestamp(row.expirationTime)
      const status = !visitUrl
        ? 'invalid'
        : row.type === 3
          ? 'permanent'
          : !Number.isFinite(expiry)
            ? 'invalid'
            : expiry <= now.value.getTime()
              ? 'expired'
              : 'active'
      const statusText = {
        invalid: '地址不完整',
        permanent: '长期有效',
        expired: '已过期',
        active: '未过期'
      }[status]
      const tagType: 'info' | 'success' | 'danger' =
        status === 'expired' || status === 'invalid'
          ? 'danger'
          : status === 'permanent'
            ? 'info'
            : 'success'
      return {
        ...row,
        visitUrl,
        status,
        statusText,
        tagType,
        typeName: URL_TYPE_MAP[row.type] || '未知类型',
        typeTagType: URL_TYPE_TAG_MAP[row.type as keyof typeof URL_TYPE_TAG_MAP] || 'info',
        relationName: RELATION_TYPE_MAP[row.relationType ?? 0] || '--',
        relationTagType:
          RELATION_TYPE_TAG_MAP[(row.relationType ?? 0) as keyof typeof RELATION_TYPE_TAG_MAP] ||
          'info',
        expirationText: row.type === 3 ? '长期有效' : row.expirationTime || '未设置'
      }
    })
  )
  const usableRows = computed(() =>
    rows.value.filter((row) => row.status === 'active' || row.status === 'permanent')
  )
  const timedRows = computed(() => rows.value.filter((row) => row.type !== 3))
  const activeCount = computed(
    () => timedRows.value.filter((row) => row.status === 'active').length
  )
  const expiredCount = computed(
    () => timedRows.value.filter((row) => row.status === 'expired').length
  )
  const invalidCount = computed(
    () => timedRows.value.filter((row) => row.status === 'invalid').length
  )
  const generationHint = computed(() => {
    if (loading.value) return '正在读取当前企业的旧链接状态。'
    if (loadError.value) return '请先刷新并确认旧链接状态。'
    if (activeCount.value)
      return `有${activeCount.value}条快捷、粉商链接未过期${expiredCount.value ? `，${expiredCount.value}条已过期` : ''}。重新生成会使当前企业的旧快捷、粉商链接立即失效。`
    if (expiredCount.value) return '旧快捷、粉商链接已过期，生成后请保存并使用新链接。'
    if (invalidCount.value) return '现有快捷、粉商地址不完整，请重新生成。'
    return '暂无快捷、粉商链接，可为当前企业首次生成。客服地址长期有效。'
  })
  const isCurrent = (id: number | string, version: number) =>
    props.visible && contextVersion === version && String(props.accountData?.id) === String(id)
  const loadLinks = async (id: number | string, version: number) => {
    const request = ++requestVersion
    loading.value = true
    loadError.value = false
    try {
      const result = await getAccountAccessUrls({ accountId: id })
      if (!isCurrent(id, version) || request !== requestVersion) return false
      links.value = result
      return true
    } catch {
      if (isCurrent(id, version) && request === requestVersion) loadError.value = true
      return false
    } finally {
      if (isCurrent(id, version) && request === requestVersion) loading.value = false
    }
  }
  const refreshLinks = () => {
    const id = props.accountData?.id
    if (id != null && !busy.value) void loadLinks(id, contextVersion)
  }
  watch(
    () => [props.visible, props.accountData?.id] as const,
    ([visible, id]) => {
      const version = ++contextVersion
      links.value = []
      loading.value = false
      loadError.value = false
      duration.value = 1
      durationUnit.value = 'DAY'
      if (visible && id != null) void loadLinks(id, version)
    },
    { immediate: true }
  )

  const handleGenerate = async () => {
    const id = props.accountData?.id
    if (busy.value || loading.value || loadError.value || id == null) return
    if (
      !duration.value ||
      !Number.isInteger(duration.value) ||
      duration.value < 1 ||
      duration.value > 36500
    ) {
      ElMessage.warning('请输入1至36500的整数时长')
      return
    }
    const version = contextVersion
    const params = { accountIds: [id], duration: duration.value, durationUnit: durationUnit.value }
    generating.value = true
    try {
      // 点击生成时再读取一次，避免打开弹窗后旧链接状态已发生变化。
      if (!(await loadLinks(id, version))) return
      const prompt = activeCount.value
        ? `${generationHint.value}是否继续重新生成？`
        : expiredCount.value
          ? '旧快捷、粉商链接已过期，重新生成后请保存并使用新链接。是否继续？'
          : invalidCount.value
            ? '当前快捷、粉商地址不完整，重新生成后请使用新链接。是否继续？'
            : ''
      if (prompt) {
        try {
          await ElMessageBox.confirm(
            prompt,
            activeCount.value
              ? '旧链接尚未过期'
              : expiredCount.value
                ? '旧链接已过期'
                : '重新生成链接',
            {
              confirmButtonText: '确认重新生成',
              cancelButtonText: '取消',
              type: 'warning',
              closeOnClickModal: false
            }
          )
        } catch {
          return
        }
      }
      if (!isCurrent(id, version)) return
      await generateEnterpriseLinks(params)
      if (!isCurrent(id, version)) return
      links.value = []
      await loadLinks(id, version)
      ElMessage.success('当前企业链接已生成，旧快捷、粉商链接已失效')
    } catch {
      // 统一请求封装提示错误，保留当前企业与时长以便重试。
    } finally {
      generating.value = false
    }
  }
  const copyLink = async (text: string) => {
    if (busy.value || !text) return
    copying.value = true
    try {
      if (await copyTextOrPrompt(text, '复制企业链接')) ElMessage.success('链接已复制')
    } finally {
      copying.value = false
    }
  }
  const copyAll = () =>
    copyLink(
      usableRows.value
        .map((row) => `${row.visitUrl}  /${row.typeName}·${row.relationName}`)
        .join('\n')
    )
</script>

<style scoped>
  .access-content {
    max-height: calc(100vh - 180px);
    max-height: calc(100dvh - 180px);
    overflow-y: auto;
    padding-right: 4px;
  }
  .dialog-actions {
    display: flex;
    justify-content: flex-end;
    gap: 8px;
  }
  .account-summary {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    padding: 16px;
    background: var(--el-fill-color-light);
    border-radius: 10px;
  }
  .account-summary strong {
    font-size: 17px;
  }
  .account-detail,
  .generation-note {
    color: var(--el-text-color-secondary);
    font-size: 13px;
    line-height: 1.7;
  }
  .account-detail {
    margin-top: 6px;
  }
  .links-section,
  .generation-section {
    margin-top: 22px;
  }
  .section-heading,
  .section-actions {
    display: flex;
    align-items: center;
    flex-wrap: wrap;
    gap: 8px;
  }
  .section-heading {
    justify-content: space-between;
    margin-bottom: 12px;
  }
  h3 {
    margin: 0;
    font-size: 15px;
  }
  .type-cell {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    gap: 6px;
  }
  .link-text {
    word-break: break-all;
    white-space: normal;
    text-align: left;
    line-height: 1.7;
  }
  .generation-section {
    padding-top: 18px;
    border-top: 1px solid var(--el-border-color-light);
  }
  .generation-section h3 {
    margin-bottom: 12px;
  }
  .generation-form {
    display: flex;
    flex-wrap: wrap;
    align-items: flex-end;
    gap: 12px;
    margin-top: 16px;
  }
  .generation-form :deep(.el-form-item) {
    margin-bottom: 0;
  }
  .duration-input {
    display: flex;
    gap: 8px;
  }
  .duration-input .el-select {
    width: 92px;
  }
  .generation-note {
    margin: 10px 0 0;
  }
  .mobile-links {
    display: none;
  }
  @media (max-width: 700px) {
    .desktop-links {
      display: none;
    }
    .mobile-links {
      display: block;
      max-height: 32vh;
      overflow-y: auto;
      overscroll-behavior: contain;
      -webkit-overflow-scrolling: touch;
    }
    .link-card {
      padding: 14px 0;
      border-bottom: 1px solid var(--el-border-color-light);
    }
    .link-card-header,
    .link-card-footer {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 8px;
    }
    .link-card-header {
      margin-bottom: 8px;
    }
    .link-card-tags {
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      gap: 6px;
    }
    .link-card-footer {
      margin-top: 10px;
      color: var(--el-text-color-secondary);
      font-size: 12px;
    }
    .link-card-footer .el-button {
      min-height: 40px;
    }
    .section-actions {
      width: 100%;
    }
    .generation-form {
      align-items: stretch;
    }
    .dialog-actions .el-button {
      flex: 1;
      min-height: 40px;
    }
    .duration-input .el-input-number {
      width: 154px;
    }
  }
</style>
