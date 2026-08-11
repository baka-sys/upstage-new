<template>
  <div class="art-full-height">
    <ScreenshotSearch v-model="searchForm" @search="handleSearch" @reset="handleReset" />

    <ElCard class="art-table-card">
      <ArtTableHeader v-model:columns="columnChecks" :loading="loading" @refresh="refreshData" />

      <ArtTable
        :loading="loading"
        :data="data"
        :columns="columns"
        :pagination="pagination"
        @pagination:size-change="handleSizeChange"
        @pagination:current-change="handleCurrentChange"
      />
    </ElCard>
  </div>
</template>

<script setup lang="ts">
  import { ElTag } from 'element-plus'
  import { activePage } from '@/api/carmine'
  import { useTable } from '@/hooks/core/useTable'
  import ScreenshotSearch from './modules/screenshot-search.vue'

  defineOptions({ name: 'CarmineScreenshot' })

  type ActiveListItem = Api.CarmineMange.ActivePageListItem
  type SearchForm = Pick<Api.CarmineMange.ActivePageParams, 'carmine' | 'keywords'>

  const searchForm = ref<SearchForm>({
    carmine: undefined,
    keywords: undefined
  })

  const hasRatioSetting = (row: ActiveListItem) => {
    const hasEntryRatio =
      row.entryRatio !== undefined && row.entryRatio !== null && row.entryRatio !== ''
    return hasEntryRatio || Boolean(row.isSearch)
  }

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
          minWidth: 200,
          showOverflowTooltip: true,
          formatter: (row) => formatValue(row.carmine)
        },
        {
          prop: 'name',
          label: '名称',
          minWidth: 140,
          showOverflowTooltip: true,
          formatter: (row) => formatValue(row.name)
        },
        {
          prop: 'maxNumber',
          label: '限制人数',
          minWidth: 110,
          formatter: (row) => formatValue(row.maxNumber)
        },
        {
          prop: 'totalNumber',
          label: '人数已用',
          minWidth: 110,
          formatter: (row) => formatValue(row.totalNumber)
        },
        {
          prop: 'number',
          label: '今日进粉',
          minWidth: 110,
          formatter: (row) => formatValue(row.number ?? row.todayTotal)
        },
        {
          prop: 'entryRatio',
          label: '劫持比例',
          minWidth: 110,
          formatter: (row) => {
            const isSet = hasRatioSetting(row)
            return h(ElTag, { type: isSet ? 'success' : 'info' }, () =>
              isSet ? '已设置' : '未设置'
            )
          }
        },
        {
          prop: 'secondaryCard1',
          label: '副卡1',
          minWidth: 120,
          // TODO: 后端确认副卡1对应的接口字段后替换占位内容。
          formatter: () => '--'
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
</script>
