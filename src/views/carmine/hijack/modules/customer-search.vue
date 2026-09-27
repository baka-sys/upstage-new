<template>
  <ArtSearchBar
    ref="searchBarRef"
    v-model="formData"
    :items="formItems"
    :rules="{}"
    :search-loading="loading"
    :span="6"
    :show-expand="false"
    label-width="0"
    @reset="emit('reset')"
    @search="handleSearch"
  />
</template>

<script setup lang="ts">
  import { fetchHijackAccountList } from '@/api/carmine'

  type SearchForm = Pick<Api.CarmineMange.EntryRatioPageParams, 'accountId'>

  interface Props {
    modelValue: SearchForm
    loading?: boolean
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
  const accountOptions = ref<Array<{ label: string; value: number }>>([])

  const formData = computed({
    get: () => props.modelValue,
    set: (value) => emit('update:modelValue', value)
  })

  const formItems = computed(() => [
    {
      label: '',
      key: 'accountId',
      type: 'select',
      span: 6,
      props: {
        placeholder: '请选择企业账户',
        options: accountOptions.value,
        loading: accountLoading.value,
        clearable: true,
        filterable: true
      }
    }
  ])

  const loadAccountOptions = async () => {
    accountLoading.value = true
    try {
      const accounts = await fetchHijackAccountList()
      accountOptions.value = accounts.map((account) => ({
        label: account.accountName || account.account || String(account.id),
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
