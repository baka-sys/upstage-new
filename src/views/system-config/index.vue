<template>
  <div class="art-full-height system-config-page">
    <ElCard class="system-config-card" shadow="never">
      <template #header>
        <div class="card-header">
          <span class="card-title">系统配置参数</span>
          <ElButton
            type="primary"
            :icon="Check"
            :loading="saving"
            :disabled="configItems.length === 0"
            v-ripple
            @click="handleSave"
          >
            保存配置
          </ElButton>
        </div>
      </template>

      <div v-loading="loading" class="form-container">
        <ElForm :model="configValues" label-width="190px" label-position="right">
          <ElFormItem
            v-for="(item, index) in configItems"
            :key="item.field || index"
            :label="item.title || item.field || '--'"
          >
            <ElInput v-if="item.type === 'input'" v-model="configValues[item.field]" clearable />

            <ElInput
              v-else-if="item.type === 'textarea'"
              v-model="configValues[item.field]"
              type="textarea"
              :rows="4"
            />

            <ElRadioGroup v-else-if="item.type === 'radio'" v-model="configValues[item.field]">
              <ElRadio
                v-for="option in item.options || []"
                :key="option.value"
                :value="option.value"
              >
                {{ option.label }}
              </ElRadio>
            </ElRadioGroup>

            <ElCheckboxGroup
              v-else-if="item.type === 'checkbox'"
              v-model="configValues[item.field]"
            >
              <ElCheckbox
                v-for="option in item.options || []"
                :key="option.value"
                :value="option.value"
              >
                {{ option.label }}
              </ElCheckbox>
            </ElCheckboxGroup>

            <ElSelect
              v-else-if="item.type === 'select'"
              v-model="configValues[item.field]"
              :multiple="isMultipleSelect(item)"
              clearable
              filterable
            >
              <ElOption
                v-for="option in item.options || []"
                :key="option.value"
                :label="option.label"
                :value="option.value"
              />
            </ElSelect>

            <ElSwitch
              v-else-if="item.type === 'switch'"
              v-model="configValues[item.field]"
              :active-value="getSwitchValue(item, 'activeValue', '1')"
              :inactive-value="getSwitchValue(item, 'inactiveValue', '0')"
            />

            <div v-else-if="item.type === 'upload'" class="upload-field">
              <div class="logo-preview">
                <ElImage
                  v-if="getImageUrl(item)"
                  :src="getImageUrl(item)"
                  fit="contain"
                  :preview-src-list="[getImageUrl(item)]"
                  preview-teleported
                >
                  <template #error>
                    <div class="image-placeholder">
                      <ElIcon>
                        <Picture />
                      </ElIcon>
                    </div>
                  </template>
                </ElImage>
                <div v-else class="image-placeholder">
                  <ElIcon>
                    <Picture />
                  </ElIcon>
                </div>
              </div>
              <ElUpload
                accept="image/*"
                :show-file-list="false"
                :http-request="createUploadRequest(item)"
              >
                <ElButton :loading="uploadingField === item.field">选择图片</ElButton>
              </ElUpload>
            </div>

            <ElInput v-else v-model="configValues[item.field]" clearable />
          </ElFormItem>
        </ElForm>
      </div>
    </ElCard>
  </div>
</template>

<script setup lang="ts">
  import { Check, Picture } from '@element-plus/icons-vue'
  import type { UploadRequestOptions } from 'element-plus'
  import { ElMessage } from 'element-plus'
  import {
    getConfigJson,
    updateConfigValues,
    uploadConfigImage,
    type ConfigJsonItem,
    type SystemConfigCodeType
  } from '@/api/system-config'

  defineOptions({ name: 'SystemConfig' })

  const loading = ref(false)
  const saving = ref(false)
  const uploadingField = ref<string>()
  const configItems = ref<ConfigJsonItem[]>([])
  const configValues = reactive<Record<string, any>>({})
  const SYSTEM_CONFIG_CODE_TYPE: SystemConfigCodeType = 1

  const parseSelectValues = (value: unknown): string[] => {
    if (Array.isArray(value)) return value.map(String)
    if (typeof value !== 'string' || !value) return []
    try {
      const parsed = JSON.parse(value)
      return Array.isArray(parsed) ? parsed.map(String) : [String(parsed)]
    } catch {
      return value.split(',').filter(Boolean)
    }
  }

  const isMultipleSelect = (item: ConfigJsonItem): boolean =>
    item.props?.multiple === true || item.props?.multiple === 'true'

  const normalizeValue = (item: ConfigJsonItem) => {
    if (item.type === 'checkbox') {
      return Array.isArray(item.value) ? item.value.map(String) : []
    }
    if (item.type === 'select') {
      const values = parseSelectValues(item.value)
      return isMultipleSelect(item) ? values : (values[0] ?? '')
    }
    return item.value == null ? '' : String(item.value)
  }

  const resetConfigValues = (items: ConfigJsonItem[]) => {
    Object.keys(configValues).forEach((key) => delete configValues[key])
    items.forEach((item) => {
      configValues[item.field] = normalizeValue(item)
    })
  }

  const getSwitchValue = (item: ConfigJsonItem, key: string, fallback: string): string => {
    const value = item.props?.[key]
    return typeof value === 'string' ? value : fallback
  }

  const getImageUrl = (item: ConfigJsonItem): string =>
    typeof configValues[item.field] === 'string' ? configValues[item.field] : ''

  const loadConfig = async () => {
    loading.value = true
    try {
      const data = await getConfigJson({ codeType: SYSTEM_CONFIG_CODE_TYPE })
      configItems.value = data
      resetConfigValues(data)
    } catch (error) {
      configItems.value = []
      ElMessage.error(error instanceof Error ? error.message : '获取系统配置失败')
    } finally {
      loading.value = false
    }
  }

  const serializeValue = (value: unknown): string => {
    if (Array.isArray(value)) return value.map(String).join(',')
    return value == null ? '' : String(value)
  }

  const handleSave = async () => {
    if (saving.value || configItems.value.length === 0) return

    const data = Object.fromEntries(
      configItems.value.map((item) => [item.field, serializeValue(configValues[item.field])])
    )

    saving.value = true
    try {
      await updateConfigValues(data)
      ElMessage.success('系统配置保存成功')
      await loadConfig()
    } finally {
      saving.value = false
    }
  }

  const createUploadRequest = (item: ConfigJsonItem) => async (options: UploadRequestOptions) => {
    uploadingField.value = item.field
    try {
      const result = await uploadConfigImage(options.file)
      configValues[item.field] = result.filePath
      options.onSuccess(result)
    } catch (error) {
      options.onError(error as Parameters<UploadRequestOptions['onError']>[0])
    } finally {
      uploadingField.value = undefined
    }
  }

  onMounted(loadConfig)
</script>

<style scoped lang="scss">
  .system-config-card {
    display: flex;
    flex: 1;
    flex-direction: column;
    min-height: 0;

    :deep(.el-card__body) {
      flex: 1;
      min-height: 0;
      overflow-y: auto;
    }
  }

  .card-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
  }

  .card-title {
    font-size: 16px;
    font-weight: 600;
    color: var(--el-text-color-primary);
  }

  .form-container {
    min-height: 420px;
  }

  :deep(.el-form-item) {
    margin-bottom: 20px;
  }

  :deep(.el-input) {
    width: 100%;
  }

  .logo-preview {
    width: 120px;
    height: 120px;
    overflow: hidden;
    border: 1px dashed var(--el-border-color);
    border-radius: 6px;
  }

  .upload-field {
    display: flex;
    gap: 12px;
    align-items: flex-end;
  }

  .logo-preview :deep(.el-image),
  .image-placeholder {
    width: 100%;
    height: 100%;
  }

  .image-placeholder {
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 28px;
    color: var(--el-text-color-placeholder);
    background: var(--el-fill-color-light);
  }

  @media only screen and (width <= 768px) {
    :deep(.el-form-item__label) {
      width: 150px !important;
    }

    :deep(.el-form-item__content) {
      margin-left: 150px !important;
    }
  }
</style>
