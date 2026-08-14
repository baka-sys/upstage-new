<template>
  <div class="art-full-height plan-config-page">
    <ElCard class="art-table-card" shadow="never">
      <ArtTableHeader :loading="loading" layout="">
        <template #left>
          <ElButton type="primary" :icon="Plus" v-ripple @click="handleAdd">添加</ElButton>
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

      <PlanConfigAddDialog v-model:visible="addDialogVisible" @success="handleAddSuccess" />
      <PlanConfigAddDialog
        v-model:visible="editDialogVisible"
        mode="edit"
        :plan-data="editingPlan"
        @success="handleEditSuccess"
      />
    </ElCard>
  </div>
</template>

<script setup lang="ts">
  import { Plus } from '@element-plus/icons-vue'
  import { ElButton, ElMessageBox, ElTag } from 'element-plus'
  import { deletePlanConfig, getPlanConfigPage, updatePlanConfigStatus } from '@/api/plan-config'
  import { useTable } from '@/hooks/core/useTable'
  import PlanConfigAddDialog from './modules/plan-config-add-dialog.vue'

  defineOptions({ name: 'PlanConfig' })

  type PlanConfigListItem = Api.PlanConfigManage.PlanConfigPageListItem

  const statusUpdatingId = ref<number>()
  const deletingId = ref<number>()
  const addDialogVisible = ref(false)
  const editDialogVisible = ref(false)
  const editingPlan = ref<PlanConfigListItem>()

  const PLAN_STATUS_MAP: Record<0 | 1, { label: string; tagType: 'info' | 'success' }> = {
    0: { label: '开启', tagType: 'success' },
    1: { label: '关闭', tagType: 'info' }
  }

  const {
    columns,
    data,
    loading,
    pagination,
    handleSizeChange,
    handleCurrentChange,
    refreshCreate,
    refreshRemove,
    refreshUpdate
  } = useTable({
    core: {
      apiFn: getPlanConfigPage,
      apiParams: {
        page: 1,
        limit: 20
      },
      columnsFactory: () => [
        {
          prop: 'title',
          label: '方案标题',
          minWidth: 360,
          showOverflowTooltip: true,
          formatter: (row) => row.title || '--'
        },
        {
          prop: 'status',
          label: '状态',
          width: 120,
          formatter: (row) => {
            const status = PLAN_STATUS_MAP[row.status as 0 | 1]
            return status ? h(ElTag, { type: status.tagType }, () => status.label) : '--'
          }
        },
        {
          prop: 'operation',
          label: '操作',
          width: 220,
          fixed: 'right',
          formatter: (row) => {
            const actionText = row.status === 0 ? '关闭' : row.status === 1 ? '开启' : '--'

            return h('div', { class: 'plan-config-operation' }, [
              h(
                ElButton,
                {
                  link: true,
                  type: 'primary',
                  loading: statusUpdatingId.value === row.id,
                  disabled: actionText === '--' || statusUpdatingId.value != null,
                  onClick: () => handleToggleStatus(row)
                },
                () => actionText
              ),
              h(
                ElButton,
                { link: true, type: 'primary', onClick: () => handleEdit(row) },
                () => '编辑'
              ),
              h(
                ElButton,
                {
                  link: true,
                  type: 'danger',
                  loading: deletingId.value === row.id,
                  disabled: deletingId.value != null,
                  onClick: () => handleDelete(row)
                },
                () => '删除'
              )
            ])
          }
        }
      ]
    }
  })

  const handleAdd = () => {
    addDialogVisible.value = true
  }

  const handleAddSuccess = async () => {
    await refreshCreate()
  }

  const handleToggleStatus = async (row: PlanConfigListItem) => {
    if (![0, 1].includes(row.status) || statusUpdatingId.value != null) return

    const targetStatus: Api.PlanConfigManage.PlanStatus = row.status === 0 ? 1 : 0
    const actionText = targetStatus === 0 ? '开启' : '关闭'

    try {
      await ElMessageBox.confirm(`确定要${actionText}该方案吗？`, `确认${actionText}`, {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      })
    } catch {
      return
    }

    statusUpdatingId.value = row.id
    try {
      await updatePlanConfigStatus({ id: row.id, status: targetStatus })
      ElMessage.success(`${actionText}成功`)
      await refreshUpdate()
    } catch {
      // 请求错误由统一 HTTP 拦截器提示，列表保持后端返回的原状态。
    } finally {
      statusUpdatingId.value = undefined
    }
  }

  const handleEdit = (row: PlanConfigListItem) => {
    editingPlan.value = row
    editDialogVisible.value = true
  }

  const handleEditSuccess = async () => {
    await refreshUpdate()
  }

  const handleDelete = async (row: PlanConfigListItem) => {
    if (row.id == null || deletingId.value != null) return

    try {
      await ElMessageBox.confirm(`确定要删除方案“${row.title || '--'}”吗？`, '确认删除', {
        confirmButtonText: '确定删除',
        cancelButtonText: '取消',
        type: 'warning'
      })
    } catch {
      return
    }

    deletingId.value = row.id
    try {
      await deletePlanConfig({ id: row.id })
      ElMessage.success('删除成功')
      await refreshRemove()
    } catch {
      // 请求错误由统一 HTTP 拦截器提示，删除失败时保留当前列表。
    } finally {
      deletingId.value = undefined
    }
  }
</script>

<style scoped lang="scss">
  .plan-config-page {
    :deep(#art-table-header) {
      margin-bottom: 12px;
    }
  }
</style>
