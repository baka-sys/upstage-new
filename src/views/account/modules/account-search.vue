<template>
  <ArtSearchBar
    ref="searchBarRef"
    v-model="formData"
    :items="formItems"
    :rules="{}"
    :span="5"
    :show-expand="false"
    label-width="0"
    @reset="emit('reset')"
    @search="handleSearch"
  />
</template>

<script setup lang="ts">
  type SearchForm = Pick<Api.AccountManage.AccountPageParams, 'keyword'>

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
      label: '',
      key: 'keyword',
      type: 'input',
      span: 6,
      props: {
        placeholder: '请输入企业名称或账号',
        clearable: true
      }
    }
  ])

  const handleSearch = async (params: SearchForm) => {
    await searchBarRef.value.validate()
    emit('search', params)
  }
</script>
