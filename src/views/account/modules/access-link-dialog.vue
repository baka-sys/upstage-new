<template>
  <ElDialog
    v-model="dialogVisible"
    :title="`访问链接 - ${accountData?.accountName || accountData?.account || ''}`"
    width="880px"
    align-center
    destroy-on-close
  >
    <ElTable v-loading="loading" :data="links" row-key="id" empty-text="暂无已生成的访问链接">
      <ElTableColumn label="类型" width="120">
        <template #default="{ row }">
          <ElTag
            v-if="URL_TYPE_MAP[row.type]"
            :type="URL_TYPE_TAG_MAP[row.type as keyof typeof URL_TYPE_TAG_MAP]"
          >
            {{ URL_TYPE_MAP[row.type] }}
          </ElTag>
          <span v-else>--</span>
        </template>
      </ElTableColumn>
      <ElTableColumn label="链接" min-width="420" show-overflow-tooltip>
        <template #default="{ row }">
          <ElLink
            v-if="getVisitUrl(row.mainVisitUrl, row.nonceStr)"
            :href="getVisitUrl(row.mainVisitUrl, row.nonceStr)"
            target="_blank"
            rel="noopener noreferrer"
            type="primary"
          >
            {{ getVisitUrl(row.mainVisitUrl, row.nonceStr) }}
          </ElLink>
          <span v-else>--</span>
        </template>
      </ElTableColumn>
      <ElTableColumn label="主用／备用类型" width="150">
        <template #default="{ row }">
          <ElTag
            v-if="RELATION_TYPE_MAP[row.relationType]"
            :type="RELATION_TYPE_TAG_MAP[row.relationType as keyof typeof RELATION_TYPE_TAG_MAP]"
          >
            {{ RELATION_TYPE_MAP[row.relationType] }}
          </ElTag>
          <span v-else>--</span>
        </template>
      </ElTableColumn>
    </ElTable>
    <template #footer>
      <ElButton @click="dialogVisible = false">关闭</ElButton>
    </template>
  </ElDialog>
</template>

<script setup lang="ts">
  import { getAccountAccessUrls } from '@/api/account'
  import { visitUrlWithNonce as getVisitUrl } from '@/utils/navigation/safe-url'
  import {
    RELATION_TYPE_MAP,
    RELATION_TYPE_TAG_MAP,
    URL_TYPE_MAP,
    URL_TYPE_TAG_MAP
  } from '@/views/account-url-main/constants'

  interface Props {
    visible: boolean
    accountData?: Api.AccountManage.AccountListItem
  }

  const props = defineProps<Props>()
  const emit = defineEmits<{
    (e: 'update:visible', value: boolean): void
  }>()

  const dialogVisible = computed({
    get: () => props.visible,
    set: (value) => emit('update:visible', value)
  })
  const links = ref<Api.AccountManage.AccessUrlListItem[]>([])
  const loading = ref(false)

  // 与后端 AccountUrlMainDTO 的快捷、粉商地址拼接规则保持一致。


  watch(
    () => [props.visible, props.accountData?.id] as const,
    async ([visible, accountId], _previous, onCleanup) => {
      let active = true
      onCleanup(() => {
        active = false
      })
      links.value = []
      loading.value = false
      if (!visible || accountId == null) return

      loading.value = true
      try {
        const result = await getAccountAccessUrls({ accountId })
        if (active) links.value = result
      } catch {
        // 请求错误由统一 HTTP 拦截器提示。
      } finally {
        if (active) loading.value = false
      }
    },
    { immediate: true }
  )
</script>
