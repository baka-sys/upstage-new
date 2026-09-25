<template>
  <div class="art-full-height account-url-main-page">
    <ElCard class="art-table-card" shadow="never">
      <ArtTableHeader :loading="loading" layout="" @refresh="refreshData">
        <template #left>
          <div class="copy-actions">
            <ElSelect v-model="copyUrlType" clearable placeholder="全部链接类型">
              <ElOption
                v-for="option in URL_TYPE_OPTIONS"
                :key="option.value"
                :label="option.label"
                :value="option.value"
              />
            </ElSelect>
            <ElButton type="primary" :icon="CopyDocument" :loading="copying" @click="handleCopyAll">
              一键复制
            </ElButton>
          </div>
        </template>
        <template #right>
          <AccountUrlMainSearch v-model="searchForm" @search="handleSearch" @reset="handleReset" />
        </template>
      </ArtTableHeader>

      <ArtTable
        :loading="loading"
        :data="data"
        :columns="columns"
        :pagination="pagination"
        row-key="id"
        @pagination:size-change="handleSizeChange"
        @pagination:current-change="handleCurrentChange"
      />
    </ElCard>

    <AccountUrlMainEditDialog
      v-model:visible="editDialogVisible"
      :link-data="currentLink"
      @success="handleUpdateSuccess"
    />
  </div>
</template>

<script setup lang="ts">
  import { CopyDocument } from '@element-plus/icons-vue'
  import { ElButton, ElTag } from 'element-plus'
  import { getAccountUrlMainCopyList, getAccountUrlMainPage } from '@/api/account-url-main'
  import { useTable } from '@/hooks/core/useTable'
  import {
    RELATION_TYPE_MAP,
    RELATION_TYPE_TAG_MAP,
    URL_TYPE_MAP,
    URL_TYPE_OPTIONS,
    URL_TYPE_TAG_MAP
  } from './constants'
  import AccountUrlMainSearch from './modules/account-url-main-search.vue'
  import AccountUrlMainEditDialog from './modules/account-url-main-edit-dialog.vue'

  defineOptions({ name: 'AccountUrlMainManage' })

  type LinkListItem = Api.AccountUrlMainManage.AccountUrlMainListItem
  type SearchForm = Pick<
    Api.AccountUrlMainManage.AccountUrlMainPageParams,
    'urlType' | 'relationType'
  >

  const searchForm = ref<SearchForm>({})
  const copyUrlType = ref<Api.AccountUrlMainManage.UrlType>()
  const copying = ref(false)
  const editDialogVisible = ref(false)
  const currentLink = ref<LinkListItem>()

  const {
    columns,
    data,
    loading,
    pagination,
    getData,
    replaceSearchParams,
    resetSearchParams,
    handleSizeChange,
    handleCurrentChange,
    refreshData,
    refreshUpdate
  } = useTable({
    core: {
      apiFn: getAccountUrlMainPage,
      apiParams: {
        page: 1,
        limit: 20
      },
      columnsFactory: () => [
        {
          prop: 'urlType',
          label: '链接类型',
          width: 130,
          formatter: (row) => {
            const label = URL_TYPE_MAP[row.urlType]
            const tagType = URL_TYPE_TAG_MAP[row.urlType as keyof typeof URL_TYPE_TAG_MAP]
            return label && tagType ? h(ElTag, { type: tagType }, () => label) : '--'
          }
        },
        {
          prop: 'mainVisitUrl',
          label: '访问地址',
          minWidth: 360,
          showOverflowTooltip: true,
          formatter: (row) => row.mainVisitUrl || '--'
        },
        {
          prop: 'relationType',
          label: '主备类型',
          width: 110,
          formatter: (row) => {
            const label = RELATION_TYPE_MAP[row.relationType]
            const tagType =
              RELATION_TYPE_TAG_MAP[row.relationType as keyof typeof RELATION_TYPE_TAG_MAP]
            return label && tagType ? h(ElTag, { type: tagType }, () => label) : '--'
          }
        },
        {
          prop: 'createTime',
          label: '创建时间',
          minWidth: 180,
          formatter: (row) => row.createTime || '--'
        },
        {
          prop: 'updateTime',
          label: '更新时间',
          minWidth: 180,
          formatter: (row) => row.updateTime || '--'
        },
        {
          prop: 'operation',
          label: '操作',
          width: 150,
          fixed: 'right',
          formatter: (row) =>
            h('div', [
              // h(
              //   ElButton,
              //   { link: true, type: 'primary', onClick: () => handleCopyOne(row) },
              //   () => '复制'
              // ),
              h(
                ElButton,
                { link: true, type: 'primary', onClick: () => handleEdit(row) },
                () => '编辑'
              )
            ])
        }
      ]
    }
  })

  const writeClipboard = async (text: string) => {
    await navigator.clipboard.writeText(text)
  }

  const handleSearch = (params: SearchForm) => {
    searchForm.value = params
    replaceSearchParams(params)
    getData()
  }

  const handleReset = async () => {
    searchForm.value = {}
    await resetSearchParams()
  }

  // const handleCopyOne = async (row: LinkListItem) => {
  //   if (!row.mainVisitUrl) {
  //     ElMessage.warning('当前链接地址为空')
  //     return
  //   }

  //   try {
  //     await writeClipboard(row.mainVisitUrl)
  //     ElMessage.success('复制成功')
  //   } catch {
  //     ElMessage.error('复制失败，请检查浏览器剪贴板权限')
  //   }
  // }

  const handleCopyAll = async () => {
    if (copying.value) return

    copying.value = true
    try {
      const list = await getAccountUrlMainCopyList(
        copyUrlType.value == null ? undefined : { urlType: copyUrlType.value }
      )
      const addresses = list.map((item) => item.mainVisitUrl).filter(Boolean)
      if (addresses.length === 0) {
        ElMessage.warning('没有可复制的链接')
        return
      }

      await writeClipboard(addresses.join('\r\n\r\n'))
      ElMessage.success(`已复制 ${addresses.length} 个链接`)
    } catch {
      ElMessage.error('复制失败，请稍后重试')
    } finally {
      copying.value = false
    }
  }

  const handleEdit = (row: LinkListItem) => {
    currentLink.value = row
    editDialogVisible.value = true
  }

  const handleUpdateSuccess = async () => {
    await refreshUpdate()
  }
</script>

<style scoped lang="scss">
  .account-url-main-page {
    :deep(#art-table-header) {
      gap: 16px;
      margin-bottom: 12px;
    }
  }

  .copy-actions {
    display: flex;
    gap: 10px;
    align-items: center;

    :deep(.el-select) {
      width: 170px;
    }
  }
</style>
