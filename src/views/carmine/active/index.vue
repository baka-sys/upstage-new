<template>
  <div class="art-full-height">
    <ActiveSearch v-model="searchForm" :loading="loading" @search="handleSearch" @reset="handleReset" />

    <ElCard class="art-table-card">
      <ArtTableHeader v-model:columns="columnChecks" :loading="loading" @refresh="refreshData">
        <template #left>
          <ElSpace wrap>
            <ElButton :loading="defaultSettingLoading" @click="openDefaultSetting" v-ripple>
              默认设置
            </ElButton>
            <ElButton :loading="batchActionLoading === 'sync'" :disabled="batchActionLoading !== null"
              @click="openSynchronizationConfig" v-ripple>同步配置</ElButton>
            <ElButton :loading="batchActionLoading === 'start'" :disabled="batchActionLoading !== null"
              @click="handleUpdateAllStatus()" v-ripple>开启/关闭</ElButton>
            <!-- <ElButton :loading="batchActionLoading === 'stop'" :disabled="batchActionLoading !== null"
              @click="handleUpdateAllStatus(1)" v-ripple>配置关闭</ElButton> -->
            <ElButton @click="allSettingVisible = true" v-ripple>更改配置</ElButton>
          </ElSpace>
        </template>
      </ArtTableHeader>

      <ArtTable :loading="loading" :data="data" :columns="columns" :pagination="pagination"
        @selection-change="handleSelectionChange" @pagination:size-change="handleSizeChange"
        @pagination:current-change="handleCurrentChange" />
    </ElCard>

    <DefaultSettingDialog v-model="defaultSettingVisible" :setting-data="defaultSettingData"
      @success="handleDefaultSettingSuccess" />
    <AllSettingDialog v-model="allSettingVisible" @success="handleAllSettingSuccess" />
    <RatioEditDialog v-model="ratioEditVisible" :ratio-data="currentRatio" @success="handleRatioEditSuccess" />

    <SynchronizationConfig v-model="synchronizationVisible" @success="handleConfigEditSuccess"></SynchronizationConfig>

    <StartConfig v-model="startConfigVisible" @success="handleConfigEditSuccess"></StartConfig>
    <SayHelloPreviewDialog v-model:visible="sayHelloPreviewVisible" :card-data="currentSayHelloCard" />
  </div>
</template>

<script setup lang="ts">
import { ElButton, ElMessage, ElTag } from 'element-plus'
import {
  activePage,
  getEntryRatioSetting,
  updateAllEntryRatioStatus
} from '@/api/carmine'
import { useTable } from '@/hooks/core/useTable'
import ActiveSearch from './modules/active-search.vue'
import DefaultSettingDialog from './modules/default-setting-dialog.vue'
import AllSettingDialog from './modules/all-setting-dialog.vue'
import RatioEditDialog from './modules/ratio-edit-dialog.vue'
import SynchronizationConfig from './modules/synchronization-config.vue'
import StartConfig from './modules/start-config.vue'
import SayHelloPreviewDialog from './modules/say-hello-preview-dialog.vue'
import CarmineCopy from '../components/carmine-copy.vue'

defineOptions({ name: 'CarmineActive' })

type ActiveListItem = Api.CarmineMange.ActivePageListItem
type SearchForm = Pick<Api.CarmineMange.ActivePageParams, 'carmine' | 'keywords'>

const searchForm = ref<SearchForm>({
  carmine: undefined,
  keywords: undefined
})
const selectedRows = ref<ActiveListItem[]>([])
const defaultSettingVisible = ref(false)
const defaultSettingLoading = ref(false)
const defaultSettingData = ref<any>({
  id: undefined,
  mainNumberTwo: 0,
  subNumberTwo: 0,
  hijackMainNumberTwo: 0,
  hijackSubNumberTwo: 0,
  excludeCard: '',
  delayTime: 0,
  hackTotalNumber: 0,
  totalNumber: 0,
  updateTime: '',
  carmines: [],
})
const allSettingVisible = ref(false)
const ratioEditVisible = ref(false)
const synchronizationVisible = ref(false)
const startConfigVisible = ref(false)
const sayHelloPreviewVisible = ref(false)
const currentSayHelloCard = ref<ActiveListItem>()
const currentRatio = ref<Api.CarmineMange.EntryRatioItem>()
const batchActionLoading = ref<'sync' | 'start' | 'stop' | null>(null)

const hasRatioSetting = (row: any) => row.entryRatio?.id != null


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
  core: {
    apiFn: activePage,
    apiParams: {
      page: 1,
      limit: 20
    },
    columnsFactory: () => [
      { type: 'selection', width: 50 },
      {
        prop: 'carmine',
        label: '卡密',
        minWidth: 180,
        showOverflowTooltip: true,
        formatter: (row) => h(CarmineCopy, { value: row.carmine })
      },
      { prop: 'name', label: '名称', minWidth: 120, showOverflowTooltip: true },
      // { prop: 'maxNumber', label: '限制人数', width: 100 },
      {
        prop: 'hackNumber',
        label: '劫持数量',
        width: 100,
        formatter: (row:any) => row.hackNumber ?? '--'
      },
      {
        prop: 'todayTotal',
        label: '今日进粉',
        width: 100,
        formatter: (row) => row.todayTotal ?? row.number ?? '--'
      },
      {
        prop: 'activeTime',
        label: '激活时间',
        width: 180,
        formatter: (row:any) => row.activeTime
      },
      {
        prop: 'expirationDate',
        label: '到期时间',
        width: 180,
        formatter: (row:any) => row.expirationDate
      },
      {
        prop: 'accountName',
        label: '企业账号名称',
        minWidth: 150,
        showOverflowTooltip: true,
        formatter: (row) => row.accountName?.trim() || (row.accountId == null ? '普通卡' : '--')
      },
      {
        prop: 'entryRatio',
        label: '劫持比例',
        width: 100,
        formatter: (row) =>
          h(ElTag, { type: hasRatioSetting(row) ? 'success' : 'info' }, () =>
            hasRatioSetting(row) ? '已设置' : '未设置'
          )
      },
      {
        prop: 'entryRatio.subCarmine',
        label: '副卡1',
        minWidth: 180,
        showOverflowTooltip: true,
        formatter: (row) => h(CarmineCopy, { value: row.entryRatio?.subCarmine })
      },
      {
        prop: 'entryRatio.subCarmineTwo',
        label: '副卡2',
        minWidth: 180,
        showOverflowTooltip: true,
        formatter: (row) => h(CarmineCopy, { value: row.entryRatio?.subCarmineTwo })
      },
      {
        prop: 'status',
        label: '卡1状态',
        width: 90,
        formatter: (row) => {
          if (hasRatioSetting(row) && row.entryRatio) {
            if(row.entryRatio?.subUserId === 0){
              return '--'
            } else {
              let rowStatus = row.entryRatio?.switchCode === 0
              return h(ElTag, { type: rowStatus ? 'success':'danger'}, () => rowStatus ? '开启' : '关闭')
            }
          } else {
            return '--'
          }
        }
      },
      {
        prop: 'secondaryCardStatus',
        label: '卡2状态',
        width: 90,
        // TODO: 后端需确认卡2状态对应的接口字段。
        formatter: (row) => {
          if (hasRatioSetting(row) && row.entryRatio) {
            if(row.entryRatio?.subUserIdTwo === 0){
              return '--'
            } else {
              let rowStatus = row.entryRatio?.switchCodeTwo === 0
              return h(ElTag, { type: rowStatus ? 'success':'danger'}, () => rowStatus ? '开启' : '关闭')
            }
          } else {
            return '--'
          }
        }
      },
      {
        prop: 'operation',
        label: '操作',
        width: 160,
        fixed: 'right',
        formatter: (row) =>
          h('div', [
            h(
              ElButton,
              { link: true, type: 'primary', onClick: () => openSayHelloPreview(row) },
              () => '打招呼'
            ),
            h(
              ElButton,
              { link: true, type: 'primary', onClick: () => openRatioEdit(row) },
              () => '设置劫持'
            )
          ])
        
      }
    ]
  }
})

const handleSearch = (params: SearchForm) => {
  replaceSearchParams(params)
  getData()
}

const handleReset = async () => {
  searchForm.value = { carmine: undefined, keywords: undefined }
  await resetSearchParams()
}

const handleSelectionChange = (selection: ActiveListItem[]) => {
  selectedRows.value = selection
}

const openSayHelloPreview = (row: ActiveListItem) => {
  currentSayHelloCard.value = row
  sayHelloPreviewVisible.value = true
}

const openRatioEdit = (row: ActiveListItem) => {
  const ratio:any = row.entryRatio
  // if (!ratio || typeof ratio !== 'object' || ratio.id == null) {
  //   ElMessage.warning('该卡密尚未配置劫持比例，请先同步配置后刷新列表')
  //   return
  // }
  const mainUserId = row.id
  // if (mainUserId == null) {
  //   ElMessage.warning('主卡信息不完整，无法修改比例')
  //   return
  // }
  currentRatio.value = {
    ...ratio,
    mainUserId,
    mainCarmine: row.carmine
  }
  ratioEditVisible.value = true
}

const handleRatioEditSuccess = async () => {
  currentRatio.value = undefined
  await refreshData()
}

const handleConfigEditSuccess = async()=> {
  currentRatio.value = undefined
  await refreshData()
}

const openDefaultSetting = async () => {
  if (defaultSettingLoading.value) return
  defaultSettingLoading.value = true
  try {
    let setting:any = await getEntryRatioSetting()
    if(setting !== null){
      let accountIdSet = setting.accountIdSet.split(',').map(Number)
      let carmines = setting.excludeCard.replace(/,/g, '\n');
      defaultSettingData.value = setting
      defaultSettingData.value.accountId = accountIdSet
      defaultSettingData.value.excludeCard = carmines
    }
    defaultSettingVisible.value = true
  } catch {
    // 接口错误由统一请求封装提示，获取失败时不打开弹窗。
  } finally {
    defaultSettingLoading.value = false
  }
}

const openSynchronizationConfig = () => {
  if(synchronizationVisible.value) return
  synchronizationVisible.value = true
}

const handleUpdateAllStatus = async () => {
  startConfigVisible.value = true
  // if (batchActionLoading.value !== null) return
  // batchActionLoading.value = switchCode === 0 ? 'start' : 'stop'
  // try {
  //   await updateAllEntryRatioStatus(switchCode)
  //   const action = switchCode === 0 ? '开启' : '暂停'
  //   ElMessage.success('全部' + action + '任务已提交，请稍后刷新查看结果')
  //   await refreshData()
  // } catch {
  //   // 请求失败由统一 HTTP 封装提示。
  // } finally {
  //   batchActionLoading.value = null
  // }
}

const handleDefaultSettingSuccess = async () => {
  await refreshData()
}

const handleAllSettingSuccess = async () => {
  await refreshData()
}
</script>
