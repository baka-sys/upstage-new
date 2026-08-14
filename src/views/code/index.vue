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
            <ElButton
              :icon="Refresh"
              :disabled="selectedIds.length === 0 || resetting"
              :loading="resetting"
              v-ripple
              @click="handleBatchReset"
            >
              批量重置
            </ElButton>
            <ElButton
              type="danger"
              plain
              :icon="Delete"
              :disabled="selectedIds.length === 0 || deleting"
              :loading="deleting"
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
        ref="tableRef"
        :loading="loading"
        :data="data"
        :columns="columns"
        :pagination="pagination"
        row-key="id"
        @selection-change="handleSelectionChange"
        @pagination:size-change="handleSizeChange"
        @pagination:current-change="handleCurrentChange"
      />

      <CodeBatchAddDialog
        v-model:visible="batchAddDialogVisible"
        :initial-type="batchAddInitialType"
        @success="handleBatchAddSuccess"
      />
    </ElCard>
  </div>
</template>

<script setup lang="ts">
  import { Delete, MoreFilled, Plus, Refresh } from '@element-plus/icons-vue'
  import { ElButton, ElMessageBox, ElTag } from 'element-plus'
  import { deleteCodeBatch, getCodePage, resetCodeBatch, updateCodeStatus } from '@/api/code'
  import { useTable } from '@/hooks/core/useTable'
  import { CODE_TYPE_TABS, PLATFORM_TYPE_MAP } from './constants'
  import CodeBatchAddDialog from './modules/code-batch-add-dialog.vue'
  import CodeSearch from './modules/code-search.vue'

  defineOptions({ name: 'CodeDomain' })

  type CodeListItem = Api.CodeManage.CodePageListItem
  type SearchForm = Pick<Api.CodeManage.CodePageParams, 'domainName' | 'platformType'>

  const activeType = ref<Api.CodeManage.CodeType>(0)
  const searchForm = ref<SearchForm>({})
  const selectedRows = ref<CodeListItem[]>([])
  const selectedIds = computed(() =>
    selectedRows.value.map((row) => row.id).filter((id): id is number => id != null)
  )
  const tableRef = ref<{ elTableRef?: { clearSelection: () => void } }>()
  const resetting = ref(false)
  const deleting = ref(false)
  const statusUpdatingId = ref<number>()
  const batchAddDialogVisible = ref(false)
  const batchAddInitialType = ref<Api.CodeManage.BatchAddCodeType>(0)

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
    handleCurrentChange,
    refreshCreate,
    refreshRemove,
    refreshUpdate
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
                {
                  link: true,
                  type: 'primary',
                  loading: statusUpdatingId.value === row.id,
                  disabled: ![0, 1].includes(row.status ?? -1),
                  onClick: () => handleToggleStatus(row)
                },
                () => {
                  if (row.status === 0) return '关闭'
                  if (row.status === 1) return '开启'
                  return '切换状态'
                }
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
    if (activeType.value === 2) {
      // TODO: 后端确认备用活码/短域名是否支持 /code/addBatch。
      ElMessage.warning('当前类型暂不支持批量录入')
      return
    }

    batchAddInitialType.value = activeType.value
    batchAddDialogVisible.value = true
  }

  const handleBatchAddSuccess = async () => {
    await refreshCreate()
  }

  const handleBatchReset = async () => {
    if (selectedIds.value.length === 0 || resetting.value) return

    try {
      await ElMessageBox.confirm(
        `确定要重置选中的 ${selectedIds.value.length} 条活码域名吗？`,
        '确认重置',
        {
          confirmButtonText: '确认',
          cancelButtonText: '取消',
          type: 'warning'
        }
      )
    } catch {
      // 用户取消确认时保留当前勾选状态，不调用接口。
      return
    }

    resetting.value = true
    try {
      await resetCodeBatch({
        // 后端要求多个主键使用英文逗号分隔。
        ids: selectedIds.value.join(','),
        // 公共、专属、备用三个 Tab 均支持，直接使用当前 Tab 类型。
        type: activeType.value
      })
      ElMessage.success('重置成功')
      tableRef.value?.elTableRef?.clearSelection()
      selectedRows.value = []
      // 暂无固定返回第一页要求：保留当前页，若该页为空则自动退到上一页。
      await refreshRemove()
    } catch {
      // 请求错误由统一 HTTP 拦截器提示；失败时保留表格勾选状态。
    } finally {
      resetting.value = false
    }
  }

  const handleBatchDelete = async () => {
    if (selectedIds.value.length === 0 || deleting.value) return

    try {
      await ElMessageBox.confirm(
        `确定要删除选中的 ${selectedIds.value.length} 条活码域名吗？删除后不可恢复，请谨慎操作。`,
        '确认删除',
        {
          confirmButtonText: '确认删除',
          cancelButtonText: '取消',
          type: 'warning'
        }
      )
    } catch {
      // 用户取消确认时保留当前勾选状态，不调用接口。
      return
    }

    deleting.value = true
    try {
      await deleteCodeBatch({
        // 后端要求多个主键使用英文逗号分隔，公共、专属、备用三个 Tab 均支持。
        ids: selectedIds.value.join(',')
      })
      ElMessage.success('删除成功')
      tableRef.value?.elTableRef?.clearSelection()
      selectedRows.value = []
      // 后端确认删除后保持当前页；若该页已为空则自动退到上一页。
      await refreshRemove()
    } catch {
      // 请求错误由统一 HTTP 拦截器提示；失败时保留表格勾选状态。
    } finally {
      deleting.value = false
    }
  }

  const handleToggleStatus = async (row: CodeListItem) => {
    if (row.id == null) {
      ElMessage.warning('数据 id 为空，无法操作')
      return
    }
    if (![0, 1].includes(row.status ?? -1) || statusUpdatingId.value != null) return

    const actionText = row.status === 0 ? '关闭' : '开启'
    try {
      await ElMessageBox.confirm(`确定要${actionText}该活码域名吗？`, `确认${actionText}`, {
        confirmButtonText: '确认',
        cancelButtonText: '取消',
        type: 'warning'
      })
    } catch {
      // 用户取消确认时不调用接口，也不修改本地状态。
      return
    }

    statusUpdatingId.value = row.id
    try {
      await updateCodeStatus({ id: row.id })
      ElMessage.success(`${actionText}成功`)
      // 保留当前 Tab、搜索条件、页码和每页条数，并以后端返回状态为准。
      await refreshUpdate()
    } catch {
      // 请求错误由统一 HTTP 拦截器提示，不手动修改当前行状态。
    } finally {
      statusUpdatingId.value = undefined
    }
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
