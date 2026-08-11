<template>
  <div class="user-page art-full-height">
    <!-- 搜索栏 -->
    <UserSearch v-model="searchForm" @search="handleSearch" @reset="resetSearchParams"></UserSearch>

    <ElCard class="art-table-card">
      <!-- 表格头部 -->
      <ArtTableHeader v-model:columns="columnChecks" :loading="loading" @refresh="refreshData">
        <template #left>
          <ElSpace wrap>
            <ElButton @click="showDialog('add')" v-ripple>批量生成</ElButton>
          </ElSpace>
          <ElSpace wrap>
            <ElButton @click="batchRenewalDialog" v-ripple>批量续费</ElButton>
          </ElSpace>
          <ElSpace wrap>
            <ElButton @click="batchFreezeDialog" v-ripple>批量禁用</ElButton>
          </ElSpace>
        </template>
      </ArtTableHeader>

      <!-- 表格 -->
      <ArtTable :loading="loading" :data="data" :columns="columns" :pagination="pagination"
        @selection-change="handleSelectionChange" @pagination:size-change="handleSizeChange"
        @pagination:current-change="handleCurrentChange">
      </ArtTable>

      <!-- 用户弹窗 -->
      <UserDialog v-model:visible="dialogVisible" :type="dialogType" :user-data="currentUserData"
        @submit="handleDialogSubmit" />
      
      <!--批量续费弹窗-->
      <UserRenew v-model:visible="renewDialogVisible" @submit="handleDialogRenewSubmit"></UserRenew>

      <UserFreeze v-model:visible="freezeDialogVisible" @submit="handleDialogFreezeSubmit"></UserFreeze>
    </ElCard>
  </div>
</template>

<script setup lang="ts">
import { useTable } from '@/hooks/core/useTable'
import { fetchGetCustomerList } from '@/api/carmine'
import UserSearch from './modules/customer-search.vue'
import UserDialog from './modules/customer-dialog.vue'
import UserRenew from './modules/customer-renew.vue'
import UserFreeze from './modules/customer-freeze.vue'
import { ElTag, ElMessageBox, ElImage } from 'element-plus'
import { DialogType } from '@/types'

defineOptions({ name: 'User' })

type UserListItem = Api.SystemManage.UserListItem

// 弹窗相关
const dialogType = ref<DialogType>('add')
const dialogVisible = ref(false)
const currentUserData = ref<Partial<UserListItem>>({})

// 续费弹窗
const renewDialogVisible = ref(false)

// 禁用弹框
const freezeDialogVisible = ref(false)

// 选中行
const selectedRows = ref<UserListItem[]>([])

// 搜索表单
const searchForm = ref({
  userName: undefined,
  testCard: undefined,
  activeState: undefined,
  status: undefined
})

// 激活状态配置
const USER_STATUS_CONFIG = {
  1: { type: 'danger' as const, text: '禁用' },
  0: { type: 'success' as const, text: '启用' }
} as const

/**
 * 获取用户状态配置
 */
const getUserStatusConfig = (status: number) => {
  return (
    USER_STATUS_CONFIG[status as keyof typeof USER_STATUS_CONFIG] || {
      type: 'info' as const,
      text: '未知'
    }
  )
}

const ACTIVE_STATE_CONFIG = {
  0: { type: 'info' as const, text: '未激活' },
  1: { type: 'success' as const, text: '已激活' },
  2: { type: 'danger' as const, text: '已过期' },
  3: { type: 'danger' as const, text: '已充值' },
} as const

/**
 * 
 * 获取用户激活状态配置
 */
const getUserActiveConfig = (status: number) => {
  return (
    ACTIVE_STATE_CONFIG[status as keyof typeof ACTIVE_STATE_CONFIG] || {
      type: 'info' as const,
      text: '未知'
    }
  )
}

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
  refreshData
} = useTable({
  // 核心配置
  core: {
    apiFn: fetchGetCustomerList,
    apiParams: {
      ...searchForm.value
    },
    // 自定义分页字段映射，未设置时将使用全局配置 tableConfig.ts 中的 paginationKey
    // paginationKey: {
    //   current: 'pageNum',
    //   size: 'pageSize'
    // },
    columnsFactory: () => [
      // { type: 'selection' }, // 勾选列
      //{ type: 'index', width: 60, label: '序号' }, // 序号
      {
        prop: 'carmine',
        label: '卡密',
        width: 280
      },
      // {
      //   prop: 'userGender',
      //   label: '性别',
      //   sortable: true,
      //   formatter: (row) => row.userGender
      // },
      // { prop: 'userPhone', label: '手机号' },
      {
        prop: 'status',
        label: '禁用状态',
        formatter: (row) => {
          const statusConfig = getUserStatusConfig(row.status)
          return h(ElTag, { type: statusConfig.type }, () => statusConfig.text)
        }
      },
      {
        prop: 'activeState',
        label: '激活状态',
        formatter: (row) => {
          const activeConfig = getUserActiveConfig(row.activeState)
          return h(ElTag, { type: activeConfig.type }, () => activeConfig.text)
        }
      },
      {
        prop: 'createTime',
        label: '创建日期',
        sortable: true
      },
      // {
      //   prop: 'operation',
      //   label: '操作',
      //   width: 120,
      //   fixed: 'right', // 固定列
      // formatter: (row) => {
      //   if (row.status === 0) {
      //     return h('div', [
      //       h(ArtButtonTable, {
      //         type: 'delete',
      //         text: '关闭',
      //         onClick: () => showDialog('edit', row)
      //       }),
      //       // h(ArtButtonTable, {
      //       //   type: 'delete',
      //       //   onClick: () => deleteUser(row)
      //       // })
      //     ])
      //   } else {
      //     return h('div', [
      //       h(ArtButtonTable, {
      //         type: 'add',
      //         text: '开启',
      //         onClick: () => showDialog('edit', row)
      //       }),
      //       // h(ArtButtonTable, {
      //       //   type: 'delete',
      //       //   onClick: () => deleteUser(row)
      //       // })
      //     ])
      //   }
      // }
      // }
    ]
  }
})

/**
 * 搜索处理
 * @param params 参数
 */
const handleSearch = (params: Api.SystemManage.UserSearchParams) => {
  replaceSearchParams(params)
  getData()
}

/**
 * 显示用户弹窗
 */
const showDialog = (type: DialogType, row?: any): void => {
  // console.log('打开弹窗:', { type, row })
  dialogType.value = type
  currentUserData.value = row || {}
  nextTick(() => {
    dialogVisible.value = true
  })
}

/**
 * 批量续费
 */
const batchRenewalDialog = () => {
  nextTick(() => {
    renewDialogVisible.value = true
  })
}

/**
 * 批量冻结
 */
const batchFreezeDialog = () => {
  nextTick(() => {
    freezeDialogVisible.value = true
  })
}

/**
 * 删除用户
 */
const deleteUser = (row: UserListItem): void => {
  console.log('删除用户:', row)
  ElMessageBox.confirm(`确定要注销该用户吗？`, '注销用户', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'error'
  }).then(() => {
    ElMessage.success('注销成功')
  })
}

/**
 * 处理弹窗提交事件,刷新数据并关闭弹框
 */
const handleDialogSubmit = async () => {
  try {
    dialogVisible.value = false
    currentUserData.value = {}
  } catch (error) {
    console.error('提交失败:', error)
  }
}

/**
 * 续费窗口关闭
 */
const handleDialogRenewSubmit = async () => {
  try {
    renewDialogVisible.value = false
    currentUserData.value = {}
  } catch (error) {
    console.error('提交失败:', error)
  }
}

/**
 * 禁用窗口关闭
 */
const handleDialogFreezeSubmit = async ()=> {
  try {
    freezeDialogVisible.value = false
    currentUserData.value = {}
  } catch (error) {
    console.error('提交失败:', error)
  }
}

/**
 * 处理表格行选择变化
 */
const handleSelectionChange = (selection: UserListItem[]): void => {
  selectedRows.value = selection
  console.log('选中行数据:', selectedRows.value)
}
</script>