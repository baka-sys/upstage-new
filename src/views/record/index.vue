<template>
  <div class="art-full-height">
    <RecordSearch v-model="searchForm" @search="handleSearch" @reset="handleReset" />

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
  import { recordPage } from '@/api/record'
  import { useTable } from '@/hooks/core/useTable'
  import RecordSearch from './modules/record-search.vue'

  defineOptions({ name: 'PointRecord' })

  type SearchForm = Pick<
    Api.RecordManage.RecordPageParams,
    'accountId' | 'type' | 'startTime' | 'endTime'
  >

  const pointTypeMap: Record<number, string> = {
    1: '充值',
    2: '消费',
    3: '批量开卡'
  }

  const createEmptySearchForm = (): SearchForm => ({
    accountId: undefined,
    type: undefined,
    startTime: undefined,
    endTime: undefined
  })

  const searchForm = ref<SearchForm>(createEmptySearchForm())
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
      apiFn: recordPage,
      apiParams: {
        page: 1,
        limit: 20
      },
      columnsFactory: () => [
        {
          prop: 'accountId',
          label: '企业账户ID',
          minWidth: 130,
          formatter: (row) => formatValue(row.accountId)
        },
        {
          prop: 'type',
          label: '积分类型',
          minWidth: 120,
          formatter: (row) => pointTypeMap[row.type] ?? '--'
        },
        {
          prop: 'points',
          label: '积分',
          minWidth: 120,
          formatter: (row) => formatValue(row.points)
        },
        {
          prop: 'beforeOperation',
          label: '操作前积分',
          minWidth: 140,
          formatter: (row) => formatValue(row.beforeOperation)
        },
        {
          prop: 'afterOperation',
          label: '操作后积分',
          minWidth: 140,
          formatter: (row) => formatValue(row.afterOperation)
        },
        {
          prop: 'remark',
          label: '备注',
          minWidth: 220,
          showOverflowTooltip: true,
          formatter: (row) => formatValue(row.remark)
        },
        {
          prop: 'ipAddress',
          label: 'IP地址',
          minWidth: 150,
          formatter: (row) => formatValue(row.ipAddress)
        },
        {
          prop: 'createTime',
          label: '创建时间',
          minWidth: 180,
          formatter: (row) => formatValue(row.createTime)
        }
      ]
    }
  })

  const handleSearch = (params: SearchForm) => {
    replaceSearchParams(params)
    getData()
  }

  const handleReset = async () => {
    searchForm.value = createEmptySearchForm()
    await resetSearchParams()
  }
</script>
