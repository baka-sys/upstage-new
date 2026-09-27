<template>
  <ElForm class="account-url-main-search" :model="formData" inline @submit.prevent>
    <ElFormItem>
      <ElSelect v-model="formData.urlType" clearable placeholder="请选择链接类型">
        <ElOption
          v-for="option in URL_TYPE_OPTIONS"
          :key="option.value"
          :label="option.label"
          :value="option.value"
        />
      </ElSelect>
    </ElFormItem>
    <ElFormItem>
      <ElSelect v-model="formData.relationType" clearable placeholder="请选择主备类型">
        <ElOption
          v-for="option in RELATION_TYPE_OPTIONS"
          :key="option.value"
          :label="option.label"
          :value="option.value"
        />
      </ElSelect>
    </ElFormItem>
    <ElFormItem>
      <ElButton v-ripple :disabled="loading" @click="handleReset">重置</ElButton>
      <ElButton
        v-ripple
        type="primary"
        :icon="Search"
        :loading="loading"
        :disabled="loading"
        @click="handleSearch"
      >
        {{ loading ? '正在执行' : '搜索' }}
      </ElButton>
    </ElFormItem>
  </ElForm>
</template>

<script setup lang="ts">
  import { Search } from '@element-plus/icons-vue'
  import { RELATION_TYPE_OPTIONS, URL_TYPE_OPTIONS } from '../constants'

  type SearchForm = Pick<
    Api.AccountUrlMainManage.AccountUrlMainPageParams,
    'urlType' | 'relationType'
  >

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

  const formData = computed({
    get: () => props.modelValue,
    set: (value) => emit('update:modelValue', value)
  })

  const handleSearch = () => {
    if (props.loading) return
    emit('search', {
      urlType: formData.value.urlType,
      relationType: formData.value.relationType
    })
  }

  const handleReset = () => {
    if (props.loading) return
    emit('update:modelValue', {})
    emit('reset')
  }
</script>

<style scoped lang="scss">
  .account-url-main-search {
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
      width: 190px;
    }
  }

  @media (width <= 900px) {
    .account-url-main-search {
      justify-content: flex-start;
      margin-top: 12px;

      :deep(.el-form-item) {
        margin-bottom: 8px;
      }
    }
  }
</style>
