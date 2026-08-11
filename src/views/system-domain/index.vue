<template>
  <div class="art-full-height system-domain-page">
    <ElCard class="art-table-card" shadow="never">
      <ArtTableHeader :loading="loading" layout="">
        <template #left>
          <ElButton type="primary" :icon="Plus" v-ripple @click="handleBatchAdd">
            批量添加
          </ElButton>
        </template>
        <template #right>
          <SystemDomainSearch v-model="searchForm" @search="handleSearch" @reset="handleReset" />
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

      <SystemDomainBatchAddDialog
        v-model:visible="batchAddDialogVisible"
        @success="handleBatchAddSuccess"
      />
    </ElCard>
  </div>
</template>

<script setup lang="ts">
  import { Plus } from '@element-plus/icons-vue'
  import { ElButton, ElTag } from 'element-plus'
  import { getSystemDomainPage } from '@/api/system-domain'
  import { useTable } from '@/hooks/core/useTable'
  import { DOMAIN_STATUS_MAP, DOMAIN_TYPE_MAP } from './constants'
  import SystemDomainBatchAddDialog from './modules/system-domain-batch-add-dialog.vue'
  import SystemDomainSearch from './modules/system-domain-search.vue'

  defineOptions({ name: 'SystemDomain' })

  type SystemDomainListItem = Api.SystemDomainManage.SystemDomainPageListItem
  type SearchForm = Pick<Api.SystemDomainManage.SystemDomainPageParams, 'type' | 'status'>

  const searchForm = ref<SearchForm>({})
  const selectedRows = ref<SystemDomainListItem[]>([])
  const batchAddDialogVisible = ref(false)

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
    refreshCreate
  } = useTable({
    core: {
      apiFn: getSystemDomainPage,
      apiParams: {
        page: 1,
        limit: 20
      },
      columnsFactory: () => [
        { type: 'selection', width: 50 },
        {
          prop: 'type',
          label: '域名类型',
          minWidth: 140,
          formatter: (row) => DOMAIN_TYPE_MAP[row.type] ?? '--'
        },
        {
          prop: 'domainUrl',
          label: '域名',
          minWidth: 360,
          showOverflowTooltip: true,
          formatter: (row) => row.domainUrl || '--'
        },
        {
          prop: 'status',
          label: '状态',
          width: 120,
          formatter: (row) => {
            if (row.status === 0) return h(ElTag, { type: 'info' }, () => DOMAIN_STATUS_MAP[0])
            if (row.status === 1) return h(ElTag, { type: 'success' }, () => DOMAIN_STATUS_MAP[1])
            return '--'
          }
        },
        {
          prop: 'operation',
          label: '操作',
          width: 140,
          fixed: 'right',
          formatter: (row) =>
            h('div', { class: 'system-domain-operation' }, [
              h(
                ElButton,
                { link: true, type: 'primary', onClick: () => handleEdit(row) },
                () => '编辑'
              ),
              h(
                ElButton,
                { link: true, type: 'danger', onClick: () => handleDelete(row) },
                () => '删除'
              )
            ])
        }
      ]
    }
  })

  const handleSearch = (params: SearchForm) => {
    searchForm.value = params
    replaceSearchParams(params)
    getData()
  }

  const handleReset = async () => {
    searchForm.value = {}
    await resetSearchParams()
  }

  const handleSelectionChange = (selection: SystemDomainListItem[]) => {
    selectedRows.value = selection
  }

  const handleBatchAdd = () => {
    batchAddDialogVisible.value = true
  }

  const handleBatchAddSuccess = async () => {
    await refreshCreate()
  }

  const handleEdit = (row: SystemDomainListItem) => {
    void row
    // TODO: 后端确认编辑接口后实现真实业务逻辑。
  }

  const handleDelete = (row: SystemDomainListItem) => {
    void row
    // TODO: 后端确认删除接口后实现真实业务逻辑。
  }
</script>

<style scoped lang="scss">
  .system-domain-page {
    :deep(#art-table-header) {
      gap: 16px;
      margin-bottom: 12px;
    }
  }
</style>
