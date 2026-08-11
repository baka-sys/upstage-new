<template>
  <ElForm class="code-search-form" :model="formData" inline @submit.prevent>
    <ElFormItem>
      <ElInput
        v-model="formData.domainName"
        clearable
        placeholder="域名"
        @keyup.enter="handleSearch"
      />
    </ElFormItem>
    <ElFormItem>
      <ElSelect
        v-model="formData.platformType"
        clearable
        placeholder="请选择平台类型"
        @keyup.enter="handleSearch"
      >
        <ElOption
          v-for="option in PLATFORM_TYPE_OPTIONS"
          :key="option.value"
          :label="option.label"
          :value="option.value"
        />
      </ElSelect>
    </ElFormItem>
    <ElFormItem>
      <ElButton v-ripple @click="handleReset">重置</ElButton>
      <ElButton v-ripple type="primary" :icon="Search" @click="handleSearch">搜索</ElButton>
    </ElFormItem>
  </ElForm>
</template>

<script setup lang="ts">
  import { Search } from '@element-plus/icons-vue'
  import { PLATFORM_TYPE_OPTIONS } from '../constants'

  type SearchForm = Pick<Api.CodeManage.CodePageParams, 'domainName' | 'platformType'>

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

  const formData = computed({
    get: () => props.modelValue,
    set: (value) => emit('update:modelValue', value)
  })

  const handleSearch = () => {
    const domainName = formData.value.domainName?.trim()
    emit('search', {
      domainName: domainName || undefined,
      platformType: formData.value.platformType
    })
  }

  const handleReset = () => {
    emit('update:modelValue', {})
    emit('reset')
  }
</script>

<style scoped lang="scss">
  .code-search-form {
    display: flex;
    flex-wrap: wrap;
    justify-content: flex-end;

    :deep(.el-form-item) {
      margin-right: 10px;
      margin-bottom: 0;

      &:last-child {
        margin-right: 0;
      }
    }

    :deep(.el-input),
    :deep(.el-select) {
      width: 210px;
    }
  }

  @media (width <= 900px) {
    .code-search-form {
      justify-content: flex-start;
      margin-top: 12px;

      :deep(.el-form-item) {
        margin-bottom: 8px;
      }
    }
  }
</style>
