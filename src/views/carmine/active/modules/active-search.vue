<template>
  <ArtSearchBar
    ref="searchBarRef"
    v-model="formData"
    :items="formItems"
    :rules="{}"
    :search-loading="loading"
    label-width="120px"
    @reset="emit('reset')"
    @search="handleSearch"
  />
</template>

<script setup lang="ts">
import { fetchAccountList } from '@/api/carmine';

  type SearchForm = Pick<Api.CarmineMange.ActivePageParams, 'carmine' | 'keywords'>

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

  const formData = computed({
    get: () => props.modelValue,
    set: (value) => emit('update:modelValue', value)
  })

  const formItems = computed(() => [
    {
      label: '账号/卡密',
      key: 'carmine',
      type: 'input',
      placeholder: '请输入账号/卡密',
      clearable: true
    },
    {
      label: '企业',
      key: 'accountId',
      type: 'select',
      props: {
        placeholder: '请选择企业',
        options: accountOptions.value
      }
    },
    {
      label: '打招呼关键词',
      key: 'keywords',
      type: 'input',
      placeholder: '请输入搜索打招呼关键词',
      clearable: true
    }
  ])

  const handleSearch = async (params: SearchForm) => {
    await searchBarRef.value.validate()
    emit('search', params)
  }

  const accountLoading = ref(false)
  const accountOptions = ref([])
  async function loadAccountOptions() {
    accountLoading.value = true
    try {
      let result = await fetchAccountList()
      let optionsData:any = []
      result.data.forEach((element:any) => {
        let optionObj = { label: element.accountName, value: element.id }
        optionsData.push(optionObj)
      })
      accountOptions.value = optionsData
    } finally {
      accountLoading.value = false
    }
  }

  onMounted(()=>{
    // 初始化企业数据
    loadAccountOptions()
  })
</script>
