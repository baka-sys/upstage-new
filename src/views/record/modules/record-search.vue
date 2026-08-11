<template>
  <ArtSearchBar
    ref="searchBarRef"
    v-model="formData"
    :items="formItems"
    :rules="{}"
    :span="4"
    :show-expand="false"
    label-width="0"
    @reset="emit('reset')"
    @search="handleSearch"
  />
</template>

<script setup lang="ts">
  import { accountList } from '@/api/record'

  type SearchForm = Pick<
    Api.RecordManage.RecordPageParams,
    'accountId' | 'type' | 'startTime' | 'endTime'
  >

  interface Props {
    modelValue: SearchForm
  }

  interface Emits {
    (e: 'update:modelValue', value: SearchForm): void
    (e: 'search', params: SearchForm): void
    (e: 'reset'): void
  }

  const props = defineProps<Props>()
  const emit = defineEmits<Emits>()
  const searchBarRef = ref()
  const accountLoading = ref(false)
  const accountOptions = ref<Array<{ label: string; value: number | string }>>([])

  const formData = computed({
    get: () => props.modelValue,
    set: (value) => emit('update:modelValue', value)
  })

  const formItems = computed(() => [
    {
      label: '',
      key: 'accountId',
      type: 'select',
      span: 5,
      props: {
        placeholder: '请选择企业账户',
        options: accountOptions.value,
        loading: accountLoading.value,
        clearable: true,
        filterable: true
      }
    },
    {
      label: '',
      key: 'type',
      type: 'select',
      span: 5,
      props: {
        placeholder: '请选择类型',
        options: [
          { label: '充值', value: 1 },
          { label: '消费', value: 2 }
        ],
        clearable: true
      }
    },
    {
      label: '',
      key: 'startTime',
      type: 'datetime',
      span: 5,
      props: {
        type: 'datetime',
        placeholder: '请选择开始时间',
        valueFormat: 'YYYY-MM-DD HH:mm:ss',
        clearable: true,
        style: { width: '100%' }
      }
    },
    {
      label: '',
      key: 'endTime',
      type: 'datetime',
      span: 5,
      props: {
        type: 'datetime',
        placeholder: '请选择结束时间',
        valueFormat: 'YYYY-MM-DD HH:mm:ss',
        clearable: true,
        style: { width: '100%' }
      }
    }
  ])

  const loadAccountOptions = async () => {
    accountLoading.value = true
    try {
      const accounts = await accountList()
      accountOptions.value = accounts.map((account) => ({
        // TODO: 后端确认 account/list 中用于展示企业账户名称的字段。
        label: String(account.id),
        value: account.id
      }))
    } finally {
      accountLoading.value = false
    }
  }

  const handleSearch = async (params: SearchForm) => {
    await searchBarRef.value.validate()
    emit('search', params)
  }

  onMounted(loadAccountOptions)
</script>
