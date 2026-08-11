<template>
  <ElForm class="system-domain-search" :model="formData" inline @submit.prevent>
    <ElFormItem>
      <ElSelect v-model="formData.type" clearable placeholder="请选择域名类型">
        <ElOption
          v-for="option in DOMAIN_TYPE_OPTIONS"
          :key="option.value"
          :label="option.label"
          :value="option.value"
        />
      </ElSelect>
    </ElFormItem>
    <ElFormItem>
      <ElSelect v-model="formData.status" clearable placeholder="请选择使用类型">
        <ElOption
          v-for="option in DOMAIN_STATUS_OPTIONS"
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
  import { DOMAIN_STATUS_OPTIONS, DOMAIN_TYPE_OPTIONS } from '../constants'

  type SearchForm = Pick<Api.SystemDomainManage.SystemDomainPageParams, 'type' | 'status'>

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
    emit('search', {
      type: formData.value.type,
      status: formData.value.status
    })
  }

  const handleReset = () => {
    emit('update:modelValue', {})
    emit('reset')
  }
</script>

<style scoped lang="scss">
  .system-domain-search {
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

    :deep(.el-select) {
      width: 210px;
    }
  }

  @media (width <= 900px) {
    .system-domain-search {
      justify-content: flex-start;
      margin-top: 12px;

      :deep(.el-form-item) {
        margin-bottom: 8px;
      }
    }
  }
</style>
