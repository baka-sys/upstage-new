<template>
  <div class="art-full-height system-config-page">
    <ElCard class="system-config-card" shadow="never">
      <template #header>
        <div class="card-header">
          <span class="card-title">系统配置参数</span>
          <ElButton type="primary" :icon="Plus" v-ripple @click="handleAdd" />
        </div>
      </template>

      <div v-loading="loading" class="form-container">
        <!-- TODO: 待产品确认表单是否允许编辑；当前无保存接口，因此统一只读展示。 -->
        <ElForm label-width="190px" label-position="right">
          <ElFormItem
            v-for="(item, index) in configItems"
            :key="item.field || index"
            :label="item.title || item.field || '--'"
          >
            <!-- TODO: 后端提供图片上传接口且产品确认可编辑后，再接入上传组件。 -->
            <div v-if="isImageItem(item)" class="logo-preview">
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
            <ElInput v-else :model-value="formatValue(item.value)" readonly placeholder="--" />
          </ElFormItem>
        </ElForm>
      </div>
    </ElCard>
  </div>
</template>

<script setup lang="ts">
  import { Picture, Plus } from '@element-plus/icons-vue'
  import { ElMessage } from 'element-plus'
  import {
    getConfigJson,
    type ConfigJsonData,
    type ConfigJsonItem,
    type SystemConfigCodeType
  } from '@/api/system-config'

  defineOptions({ name: 'SystemConfig' })

  const loading = ref(false)
  const configItems = ref<ConfigJsonItem[]>([])
  const SYSTEM_CONFIG_CODE_TYPE: SystemConfigCodeType = 1

  const isConfigJsonItem = (value: unknown): value is ConfigJsonItem =>
    typeof value === 'object' &&
    value !== null &&
    !Array.isArray(value) &&
    typeof (value as Partial<ConfigJsonItem>).field === 'string'

  const normalizeConfigItems = (data: ConfigJsonData | null | undefined): ConfigJsonItem[] => {
    if (!data) return []
    if (Array.isArray(data)) return data.filter(isConfigJsonItem)
    if (isConfigJsonItem(data)) return [data]
    if (typeof data === 'object') return Object.values(data).filter(isConfigJsonItem)
    return []
  }

  const formatValue = (value: unknown): string => {
    if (value === undefined || value === null || value === '') return ''
    if (Array.isArray(value)) return value.map(String).join(', ')
    if (['string', 'number', 'boolean'].includes(typeof value)) return String(value)
    try {
      return JSON.stringify(value)
    } catch {
      return String(value)
    }
  }

  const isImageItem = ({ field, title, type }: ConfigJsonItem): boolean =>
    /image|upload|picture/i.test(type) || /logo|头像|图标/i.test(`${field} ${title}`)

  const getImageUrl = (item: ConfigJsonItem): string =>
    typeof item.value === 'string' ? item.value : ''

  const loadConfig = async () => {
    loading.value = true
    try {
      const data = await getConfigJson({ codeType: SYSTEM_CONFIG_CODE_TYPE })
      configItems.value = normalizeConfigItems(data)
    } catch (error) {
      configItems.value = []
      ElMessage.error(error instanceof Error ? error.message : '获取系统配置失败')
    } finally {
      loading.value = false
    }
  }

  const handleAdd = () => {
    // TODO: 等待后端提供新增/保存配置接口，并确认“+”按钮对应的功能。
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
