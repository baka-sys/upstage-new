<template>
  <div class="art-full-height">
    <ActiveSearch v-model="searchForm" @search="handleSearch" @reset="handleReset" />

    <ElCard class="art-table-card">
      <ArtTableHeader v-model:columns="columnChecks" :loading="loading" @refresh="refreshData">
        <template #left>
          <ElSpace wrap>
            <ElButton v-ripple>默认设置</ElButton>
            <ElButton v-ripple>同步配置</ElButton>
            <ElButton v-ripple>全部开启</ElButton>
            <ElButton v-ripple>全部暂停</ElButton>
            <ElButton v-ripple>全部配置</ElButton>
          </ElSpace>
        </template>
      </ArtTableHeader>

      <ArtTable
        :loading="loading"
        :data="data"
        :columns="columns"
        :pagination="pagination"
        @selection-change="handleSelectionChange"
        @pagination:size-change="handleSizeChange"
        @pagination:current-change="handleCurrentChange"
      />
    </ElCard>
  </div>
</template>

<script setup lang="ts">
  import { ElButton, ElTag } from 'element-plus'
  import { activePage } from '@/api/carmine'
  import { useTable } from '@/hooks/core/useTable'
  import ActiveSearch from './modules/active-search.vue'

  defineOptions({ name: 'CarmineActive' })

  type ActiveListItem = Api.CarmineMange.ActivePageListItem
  type SearchForm = Pick<Api.CarmineMange.ActivePageParams, 'carmine' | 'keywords'>

  const searchForm = ref<SearchForm>({
    carmine: undefined,
    keywords: undefined
  })
  const selectedRows = ref<ActiveListItem[]>([])

  const hasRatioSetting = (row: ActiveListItem) => Boolean(row.entryRatio || row.isSearch)

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
        { prop: 'carmine', label: '卡密', minWidth: 180, showOverflowTooltip: true },
        { prop: 'name', label: '名称', minWidth: 120, showOverflowTooltip: true },
        { prop: 'maxNumber', label: '限制人数', width: 100 },
        {
          prop: 'number',
          label: '人数已用',
          width: 100,
          formatter: (row) => row.number ?? '--'
        },
        {
          prop: 'todayTotal',
          label: '今日进粉',
          width: 100,
          formatter: (row) => row.todayTotal ?? row.number ?? '--'
        },
        {
          prop: 'shellType',
          label: '卡类型',
          width: 120,
          formatter: (row) => {
            if (row.shellType === 0) return '普通卡'
            if (row.shellType === 1) return '劫持卡/S型卡'
            return '--'
          }
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
          prop: 'secondaryCard1',
          label: '副卡1',
          width: 100,
          // TODO: 后端需确认副卡1对应的接口字段。
          formatter: () => '--'
        },
        {
          prop: 'secondaryCard2',
          label: '副卡2',
          width: 100,
          // TODO: 后端需确认副卡2对应的接口字段。
          formatter: () => '--'
        },
        {
          prop: 'status',
          label: '卡1状态',
          width: 90,
          formatter: (row) => {
            if (row.status === 0) return '开'
            if (row.status === 1) return '停'
            return '--'
          }
        },
        {
          prop: 'secondaryCardStatus',
          label: '卡2状态',
          width: 90,
          // TODO: 后端需确认卡2状态对应的接口字段。
          formatter: () => '--'
        },
        {
          prop: 'operation',
          label: '操作',
          width: 160,
          fixed: 'right',
          formatter: () =>
            h('div', [
              h(ElButton, { link: true, type: 'primary' }, () => '打招呼'),
              h(ElButton, { link: true, type: 'primary' }, () => '修改比例')
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
</script>
