<template>
  <div class="art-full-height">
    <HijackSearch v-model="searchForm" @search="handleSearch" @reset="handleReset" />

    <ElCard class="art-table-card">
      <ArtTableHeader v-model:columns="columnChecks" :loading="loading" @refresh="refreshData">
        <template #left>
          <ElSpace wrap>
            <ElButton :loading="defaultSettingLoading" @click="openDefaultSetting" v-ripple>
              默认设置
            </ElButton>
            <ElButton
              :loading="batchActionLoading === 'sync'"
              @click="handleSynchronizeConfiguration"
              v-ripple
            >
              同步设置
            </ElButton>
            <ElButton
              :loading="batchActionLoading === 'start'"
              @click="handleUpdateAllStatus(0)"
              v-ripple
            >
              全部开启
            </ElButton>
            <ElButton
              :loading="batchActionLoading === 'stop'"
              @click="handleUpdateAllStatus(1)"
              v-ripple
            >
              全部暂停
            </ElButton>
            <ElButton @click="allSettingVisible = true" v-ripple>修改配置</ElButton>
          </ElSpace>
        </template>
      </ArtTableHeader>

      <ArtTable
        :loading="loading"
        :data="data"
        :columns="columns"
        :pagination="pagination"
        @pagination:size-change="handleSizeChange"
        @pagination:current-change="handleCurrentChange"
      />
    </ElCard>

    <DefaultSettingDialog
      v-model="defaultSettingVisible"
      :setting-data="defaultSettingData"
      @success="handleDialogSuccess"
    />
    <AllSettingDialog v-model="allSettingVisible" @success="handleDialogSuccess" />
    <RatioEditDialog
      v-model="ratioEditVisible"
      :ratio-data="currentRatio"
      @success="handleDialogSuccess"
    />
  </div>
</template>

<script setup lang="ts">
  import { ElButton, ElMessage, ElMessageBox, ElTag } from 'element-plus'
  import {
    fetchEntryRatioPage,
    getEntryRatioSetting,
    synchronizeEntryRatioConfiguration,
    updateAllEntryRatioStatus
  } from '@/api/carmine'
  import { useTable } from '@/hooks/core/useTable'
  import HijackSearch from './modules/customer-search.vue'
  import DefaultSettingDialog from '../active/modules/default-setting-dialog.vue'
  import AllSettingDialog from '../active/modules/all-setting-dialog.vue'
  import RatioEditDialog from './modules/ratio-edit-dialog.vue'

  defineOptions({ name: 'CarmineHijack' })

  type EntryRatioItem = Api.CarmineMange.EntryRatioItem
  type SearchForm = Pick<Api.CarmineMange.EntryRatioPageParams, 'accountId'>

  const searchForm = ref<SearchForm>({ accountId: undefined })
  const defaultSettingVisible = ref(false)
  const defaultSettingLoading = ref(false)
  const defaultSettingData = ref<Api.CarmineMange.EntryRatioSetting>()
  const allSettingVisible = ref(false)
  const ratioEditVisible = ref(false)
  const currentRatio = ref<EntryRatioItem>()
  const batchActionLoading = ref<'sync' | 'start' | 'stop' | null>(null)

  const formatSwitch = (switchCode?: 0 | 1) => {
    if (switchCode === 0) return h(ElTag, { type: 'success' }, () => '开启')
    if (switchCode === 1) return h(ElTag, { type: 'danger' }, () => '暂停')
    return '--'
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
    core: {
      apiFn: fetchEntryRatioPage,
      apiParams: { page: 1, limit: 20 },
      columnsFactory: () => [
        { prop: 'mainCarmine', label: '主卡', minWidth: 190, showOverflowTooltip: true },
        { prop: 'subCarmine', label: '副卡', minWidth: 190, showOverflowTooltip: true },
        {
          prop: 'ratio',
          label: '劫持比例',
          width: 110,
          formatter: (row) => `${row.mainRadioNumber ?? 0}:${row.subRadioNumber ?? 0}`
        },
        { prop: 'mainNumber', label: '主卡人数', width: 100 },
        { prop: 'subNumber', label: '副卡人数', width: 100 },
        { prop: 'systemTotalNumber', label: '头寸数量', width: 100 },
        { prop: 'dosage', label: '总用量', width: 100 },
        {
          prop: 'switchCode',
          label: '状态',
          width: 90,
          formatter: (row) => formatSwitch(row.switchCode)
        },
        { prop: 'createTime', label: '创建时间', minWidth: 165 },
        {
          prop: 'operation',
          label: '操作',
          width: 100,
          fixed: 'right',
          formatter: (row) =>
            h(
              ElButton,
              { link: true, type: 'primary', onClick: () => openRatioEdit(row) },
              () => '修改比例'
            )
        }
      ]
    }
  })

  const handleSearch = (params: SearchForm) => {
    replaceSearchParams(params)
    getData()
  }

  const handleReset = async () => {
    searchForm.value = { accountId: undefined }
    await resetSearchParams()
  }

  const openDefaultSetting = async () => {
    defaultSettingLoading.value = true
    try {
      defaultSettingData.value = await getEntryRatioSetting()
      defaultSettingVisible.value = true
    } finally {
      defaultSettingLoading.value = false
    }
  }

  const openRatioEdit = (row: EntryRatioItem) => {
    currentRatio.value = row
    ratioEditVisible.value = true
  }

  const handleDialogSuccess = async () => {
    currentRatio.value = undefined
    await refreshData()
  }

  const handleSynchronizeConfiguration = async () => {
    try {
      await ElMessageBox.confirm('确定同步当前劫持配置吗？', '同步设置', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      })
      batchActionLoading.value = 'sync'
      await synchronizeEntryRatioConfiguration()
      ElMessage.success('同步任务已提交')
      await refreshData()
    } catch {
      // 取消操作或接口错误时保持当前页面状态。
    } finally {
      batchActionLoading.value = null
    }
  }

  const handleUpdateAllStatus = async (switchCode: 0 | 1) => {
    const action = switchCode === 0 ? '开启' : '暂停'
    try {
      await ElMessageBox.confirm(`确定${action}全部劫持配置吗？`, `全部${action}`, {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      })
      batchActionLoading.value = switchCode === 0 ? 'start' : 'stop'
      await updateAllEntryRatioStatus(switchCode)
      ElMessage.success(`全部${action}任务已提交`)
      await refreshData()
    } catch {
      // 取消操作或接口错误时保持当前页面状态。
    } finally {
      batchActionLoading.value = null
    }
  }
</script>
