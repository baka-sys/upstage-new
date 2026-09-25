<template>
  <div class="art-full-height">
    <AccountSearch v-model="searchForm" @search="handleSearch" @reset="handleReset" />

    <ElCard class="art-table-card">
      <ArtTableHeader v-model:columns="columnChecks" :loading="loading" @refresh="refreshData">
        <template #left>
          <ElButton type="primary" :icon="Plus" v-ripple @click="openAddDialog">
            新增企业账号
          </ElButton>
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

    <AccountDialog v-model:visible="accountDialogVisible" @success="handleCreateSuccess" />
    <AccountDialog
      v-model:visible="editDialogVisible"
      mode="edit"
      :account-data="currentAccount"
      @success="handleUpdateSuccess"
    />
    <PasswordDialog
      v-model:visible="passwordDialogVisible"
      :account-data="currentAccount"
      @success="handleUpdateSuccess"
    />
    <RechargeDialog
      v-model:visible="rechargeDialogVisible"
      :account-data="currentAccount"
      @success="handleUpdateSuccess"
    />
  </div>
</template>

<script setup lang="ts">
  import { Plus } from '@element-plus/icons-vue'
  import { ElButton, ElMessageBox, ElTag } from 'element-plus'
  import { getAccountPage, updateAccountStatus } from '@/api/account'
  import { useTable } from '@/hooks/core/useTable'
  import AccountSearch from './modules/account-search.vue'
  import AccountDialog from './modules/account-dialog.vue'
  import PasswordDialog from './modules/password-dialog.vue'
  import RechargeDialog from './modules/recharge-dialog.vue'

  defineOptions({ name: 'AccountManage' })

  type AccountListItem = Api.AccountManage.AccountListItem
  type SearchForm = Pick<Api.AccountManage.AccountPageParams, 'keyword'>

  const searchForm = ref<SearchForm>({ keyword: undefined })
  const accountDialogVisible = ref(false)
  const editDialogVisible = ref(false)
  const passwordDialogVisible = ref(false)
  const rechargeDialogVisible = ref(false)
  const currentAccount = ref<AccountListItem>()
  const statusUpdatingId = ref<number | string>()

  const formatValue = (value: unknown) => value ?? '--'

  const {
    columns,
    columnChecks,
    data,
    loading,
    pagination,
    getData,
    replaceSearchParams,
    resetSearchParams,
    handleSizeChange,
    handleCurrentChange,
    refreshData,
    refreshCreate,
    refreshUpdate
  } = useTable({
    core: {
      apiFn: getAccountPage,
      apiParams: {
        page: 1,
        limit: 20
      },
      columnsFactory: () => [
        { prop: 'accountName', label: '企业名称', minWidth: 150, showOverflowTooltip: true },
        { prop: 'account', label: '企业账号', minWidth: 150, showOverflowTooltip: true },
        {
          prop: 'phoneNumber',
          label: '手机号',
          minWidth: 130,
          formatter: (row) => formatValue(row.phoneNumber)
        },
        {
          prop: 'points',
          label: '积分',
          minWidth: 100,
          formatter: (row) => formatValue(row.points)
        },
        {
          prop: 'creditPoints',
          label: '信用积分',
          minWidth: 110,
          formatter: (row) => formatValue(row.creditPoints)
        },
        {
          prop: 'hackRate',
          label: '劫持比例限制',
          minWidth: 130,
          formatter: (row) => formatValue(row.hackRate)
        },
        {
          prop: 'status',
          label: '状态',
          width: 100,
          formatter: (row) =>
            row.status === 0
              ? h(ElTag, { type: 'success' }, () => '启用')
              : row.status === 1
                ? h(ElTag, { type: 'info' }, () => '禁用')
                : '--'
        },
        {
          prop: 'createTime',
          label: '创建时间',
          minWidth: 180,
          formatter: (row) => formatValue(row.createTime)
        },
        {
          prop: 'loginTime',
          label: '最近登录时间',
          minWidth: 180,
          formatter: (row) => formatValue(row.loginTime)
        },
        {
          prop: 'operation',
          label: '操作',
          width: 310,
          fixed: 'right',
          formatter: (row) => {
            const statusAction = row.status === 0 ? '禁用' : row.status === 1 ? '启用' : '--'

            return h('div', [
              h(
                ElButton,
                { link: true, type: 'warning', onClick: () => openRechargeDialog(row) },
                () => '充值'
              ),
              h(
                ElButton,
                { link: true, type: 'primary', onClick: () => openEditDialog(row) },
                () => '编辑'
              ),
              h(
                ElButton,
                { link: true, type: 'primary', onClick: () => openPasswordDialog(row) },
                () => '修改密码'
              ),
              h(
                ElButton,
                {
                  link: true,
                  type: row.status === 0 ? 'danger' : 'success',
                  loading: statusUpdatingId.value === row.id,
                  disabled: statusAction === '--' || statusUpdatingId.value != null,
                  onClick: () => handleToggleStatus(row)
                },
                () => statusAction
              )
            ])
          }
        }
      ]
    }
  })

  const handleSearch = (params: SearchForm) => {
    replaceSearchParams(params)
    getData()
  }

  const handleReset = async () => {
    searchForm.value = { keyword: undefined }
    await resetSearchParams()
  }

  const openAddDialog = () => {
    accountDialogVisible.value = true
  }

  const openEditDialog = (row: AccountListItem) => {
    currentAccount.value = row
    editDialogVisible.value = true
  }

  const openPasswordDialog = (row: AccountListItem) => {
    currentAccount.value = row
    passwordDialogVisible.value = true
  }

  const openRechargeDialog = (row: AccountListItem) => {
    currentAccount.value = row
    rechargeDialogVisible.value = true
  }

  const handleCreateSuccess = async () => {
    await refreshCreate()
  }

  const handleUpdateSuccess = async () => {
    await refreshUpdate()
  }

  const handleToggleStatus = async (row: AccountListItem) => {
    if (
      row.id == null ||
      (row.status !== 0 && row.status !== 1) ||
      statusUpdatingId.value != null
    ) {
      return
    }

    const targetStatus: Api.AccountManage.AccountStatus = row.status === 0 ? 1 : 0
    const actionText = targetStatus === 0 ? '启用' : '禁用'

    try {
      await ElMessageBox.confirm(
        `确定要${actionText}企业账号“${row.accountName}”吗？`,
        `确认${actionText}`,
        {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }
      )
    } catch {
      return
    }

    statusUpdatingId.value = row.id
    try {
      await updateAccountStatus({ id: row.id, status: targetStatus })
      ElMessage.success(`${actionText}成功`)
      await refreshUpdate()
    } catch {
      // 请求错误由统一 HTTP 拦截器提示，失败时保留当前状态。
    } finally {
      statusUpdatingId.value = undefined
    }
  }
</script>
