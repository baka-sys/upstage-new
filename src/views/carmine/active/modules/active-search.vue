<template>
  <ArtSearchBar
    ref="searchBarRef"
    v-model="formData"
    :items="formItems"
    :rules="{}"
    label-width="120px"
    @reset="emit('reset')"
    @search="handleSearch"
  />
</template>

<script setup lang="ts">
  type SearchForm = Pick<Api.CarmineMange.ActivePageParams, 'carmine' | 'keywords'>

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
</script>
