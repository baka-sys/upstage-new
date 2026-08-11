<template>
  <div class="art-full-height code-page">
    <ElCard class="art-table-card" shadow="never">
      <ElTabs v-model="activeType" class="code-tabs" @tab-change="handleTabChange">
        <ElTabPane
          v-for="tab in CODE_TYPE_TABS"
          :key="tab.value"
          :label="tab.label"
          :name="tab.value"
        />
      </ElTabs>

      <ArtTableHeader :loading="loading" layout="">
        <template #left>
          <ElSpace wrap>
            <ElButton type="primary" :icon="Plus" v-ripple @click="handleBatchImport">
              批量录入
            </ElButton>
            <ElButton :icon="Refresh" v-ripple @click="handleBatchReset">批量重置</ElButton>
            <ElButton
              type="danger"
              plain
              :icon="Delete"
              :disabled="selectedRows.length === 0"
              v-ripple
              @click="handleBatchDelete"
            >
              删除
            </ElButton>
          </ElSpace>
        </template>
        <template #right>
          <CodeSearch v-model="searchForm" @search="handleSearch" @reset="handleReset" />
        </template>
      </ArtTableHeader>

      <ArtTable
        :loading="loading"
        :data="data"
        :columns="columns"
        :pagination="pagination"
        row-key="id"
        @selection-change="handleSelectionChange"
        @pagination:size-change="handleSizeChange"
        @pagination:current-change="handleCurrentChange"
      />
    </ElCard>
  </div>
</template>

<script setup lang="ts">
  import { Delete, MoreFilled, Plus, Refresh } from '@element-plus/icons-vue'
  import { ElButton, ElTag } from 'element-plus'
  import { getCodePage } from '@/api/code'
  import { useTable } from '@/hooks/core/useTable'
  import { CODE_TYPE_TABS, PLATFORM_TYPE_MAP } from './constants'
  import CodeSearch from './modules/code-search.vue'

  defineOptions({ name: 'CodeDomain' })

  type CodeListItem = Api.CodeManage.CodePageListItem
  type SearchForm = Pick<Api.CodeManage.CodePageParams, 'domainName' | 'platformType'>

  const activeType = ref<Api.CodeManage.CodeType>(0)
  const searchForm = ref<SearchForm>({})
  const selectedRows = ref<CodeListItem[]>([])

  const formatPlatformType = (platformType?: number) => {
    if (platformType == null) return '--'
    return PLATFORM_TYPE_MAP[platformType] ?? String(platformType)
  }

  const {
    columns,
    data,
    loading,
    pagination,
    getData,
    replaceSearchParams,
    handleSizeChange,
    handleCurrentChange
  } = useTable({
    core: {
      apiFn: getCodePage,
      apiParams: {
        type: 0,
        page: 1,
        limit: 20
      },
      columnsFactory: () => [
        { type: 'selection', width: 50 },
        {
          prop: 'platformType',
          label: '平台类型',
          minWidth: 120,
          formatter: (row) =>
            h(ElTag, { type: row.platformType === 2 ? 'success' : 'primary' }, () =>
              formatPlatformType(row.platformType)
            )
        },
        {
          prop: 'domainName',
          label: '域名',
          minWidth: 360,
          showOverflowTooltip: true,
          formatter: (row) => row.domainName || '--'
        },
        {
          prop: 'number',
          label: '占用',
          width: 120,
          formatter: (row) => row.number ?? '--'
        },
        {
          prop: 'status',
          label: '状态',
          width: 120,
          formatter: (row) => {
            // TODO: 后端确认 status = 0 的业务文案是否为“开启”。
            if (row.status === 0) return h(ElTag, { type: 'success' }, () => '开启')
            if (row.status === 1) return h(ElTag, { type: 'danger' }, () => '异常')
            return '--'
          }
        },
        {
          prop: 'operation',
          label: '操作',
          width: 150,
          fixed: 'right',
          formatter: (row) =>
            h('div', { class: 'code-operation' }, [
              h(
                ElButton,
                { link: true, type: 'primary', onClick: () => handleClose(row) },
                () => '关闭'
              ),
              h(ElButton, {
                link: true,
                type: 'primary',
                icon: MoreFilled,
                title: '更多',
                onClick: () => handleMore(row)
              })
            ])
        }
      ]
    }
  })

  const requestFirstPage = () => {
    replaceSearchParams({
      type: activeType.value,
      ...searchForm.value
    })
    getData()
  }

  const handleTabChange = (name: string | number) => {
    activeType.value = Number(name) as Api.CodeManage.CodeType
    selectedRows.value = []
    requestFirstPage()
  }

  const handleSearch = (params: SearchForm) => {
    searchForm.value = params
    requestFirstPage()
  }

  const handleReset = () => {
    searchForm.value = {}
    requestFirstPage()
  }

  const handleSelectionChange = (selection: CodeListItem[]) => {
    selectedRows.value = selection
  }

  const handleBatchImport = () => {
    // TODO: 接入批量录入功能及后端接口。
  }

  const handleBatchReset = () => {
    // TODO: 接入批量重置功能及后端接口。
  }

  const handleBatchDelete = () => {
    // TODO: 接入批量删除接口。
  }

  const handleClose = (row: CodeListItem) => {
    void row
    // TODO: 接入关闭域名接口。
  }

  const handleMore = (row: CodeListItem) => {
    void row
    // TODO: 后端确认更多操作项及对应接口后实现。
  }
</script>

<style scoped lang="scss">
  .code-page {
    .code-tabs {
      margin: -4px 0 2px;
    }

    :deep(#art-table-header) {
      gap: 16px;
      margin-bottom: 12px;
    }
  }
</style>
