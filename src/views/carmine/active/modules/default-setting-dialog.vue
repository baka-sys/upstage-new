<template>
  <ElDialog
    v-model="visible"
    title="劫持默认设置"
    width="900px"
    align-center
    destroy-on-close
    @closed="handleClosed"
  >
    <ElForm ref="formRef" :model="form" :rules="rules" label-width="140px">
      <ElRow :gutter="16">
        <ElCol v-for="item in numberFields" :key="item.key" :xs="24" :sm="12" :md="8">
          <ElFormItem :label="item.label" :prop="item.key">
            <ElInputNumber
              v-model="form[item.key]"
              :min="0"
              :step="1"
              :precision="0"
              class="number-input"
            />
          </ElFormItem>
        </ElCol>
      </ElRow>

      <ElFormItem label="劫持卡列表">
        <div class="carmine-list">
          <ElButton type="primary" plain class="add-button" @click="addCarmine">
            <ElIcon><Plus /></ElIcon>
          </ElButton>
          <VueDraggable
            v-model="form.carmines"
            target=".el-table__body-wrapper tbody"
            handle=".drag-handle"
            :animation="150"
          >
            <ElTable :data="form.carmines" border>
              <ElTableColumn type="index" label="序号" width="70" align="center" />
              <ElTableColumn label="排序" width="70" align="center">
                <template #default>
                  <ElIcon class="drag-handle"><Rank /></ElIcon>
                </template>
              </ElTableColumn>
              <ElTableColumn label="卡密" min-width="280">
                <template #default="{ row }">
                  <ElInput v-model="row.carmine" placeholder="请输入卡密" clearable />
                </template>
              </ElTableColumn>
              <ElTableColumn label="已劫持数量" width="190">
                <template #default="{ row }">
                  <ElInputNumber v-model="row.number" :min="0" :step="1" :precision="0" />
                </template>
              </ElTableColumn>
            </ElTable>
          </VueDraggable>
        </div>
      </ElFormItem>

      <ElFormItem label="排除卡密" prop="excludeCard">
        <ElInput
          v-model="form.excludeCard"
          type="textarea"
          :rows="4"
          placeholder="请输入排除卡密，多个卡密可用逗号或换行分隔"
        />
      </ElFormItem>
    </ElForm>

    <template #footer>
      <ElButton :disabled="saving" @click="handleClose">取消</ElButton>
      <ElButton type="primary" :loading="saving" @click="handleSubmit">保存</ElButton>
    </template>
  </ElDialog>
</template>

<script setup lang="ts">
  import { Plus, Rank } from '@element-plus/icons-vue'
  import { ElMessage, type FormInstance, type FormRules } from 'element-plus'
  import { VueDraggable } from 'vue-draggable-plus'
  import { updateEntryRatioSetting } from '@/api/carmine'

  type NumberFieldKey =
    | 'mainNumberTwo'
    | 'subNumberTwo'
    | 'hijackMainNumberTwo'
    | 'hijackSubNumberTwo'
    | 'totalNumber'
    | 'hackTotalNumber'
    | 'delayTime'

  interface EditableCarmine {
    carmine: string
    mainId?: number
    userId?: number
    number: number
    updateTime?: string
  }

  interface SettingForm {
    id?: number | string
    mainNumberTwo?: number
    subNumberTwo?: number
    hijackMainNumberTwo?: number
    hijackSubNumberTwo?: number
    totalNumber?: number
    hackTotalNumber?: number
    delayTime?: number
    excludeCard: string
    carmines: EditableCarmine[]
  }

  interface Props {
    modelValue: boolean
    settingData?: Api.CarmineMange.EntryRatioSetting
  }

  interface Emits {
    (e: 'update:modelValue', value: boolean): void
    (e: 'success'): void
  }

  const props = defineProps<Props>()
  const emit = defineEmits<Emits>()
  const formRef = ref<FormInstance>()
  const saving = ref(false)

  const visible = computed({
    get: () => props.modelValue,
    set: (value) => emit('update:modelValue', value)
  })

  const createEmptyForm = (): SettingForm => ({
    id: undefined,
    mainNumberTwo: undefined,
    subNumberTwo: undefined,
    hijackMainNumberTwo: undefined,
    hijackSubNumberTwo: undefined,
    totalNumber: undefined,
    hackTotalNumber: undefined,
    delayTime: undefined,
    excludeCard: '',
    carmines: []
  })

  const form = reactive<SettingForm>(createEmptyForm())

  const numberFields: Array<{ key: NumberFieldKey; label: string }> = [
    { key: 'mainNumberTwo', label: '普通卡主卡人数' },
    { key: 'subNumberTwo', label: '普通卡副卡2人数' },
    { key: 'hijackMainNumberTwo', label: '劫持卡主卡人数' },
    { key: 'hijackSubNumberTwo', label: '劫持卡副卡2人数' },
    { key: 'totalNumber', label: '普通卡头寸人数' },
    { key: 'hackTotalNumber', label: '劫持卡头寸人数' },
    { key: 'delayTime', label: '延迟时间（秒）' }
  ]

  const validateNonNegativeInteger = (
    _rule: unknown,
    value: unknown,
    callback: (error?: Error) => void
  ) => {
    if (value === undefined || value === null || value === '') {
      callback(new Error('请输入配置值'))
      return
    }
    if (typeof value !== 'number' || !Number.isInteger(value) || value < 0) {
      callback(new Error('请输入不小于 0 的整数'))
      return
    }
    callback()
  }

  const rules = numberFields.reduce<FormRules<SettingForm>>((result, item) => {
    result[item.key] = [
      { required: true, validator: validateNonNegativeInteger, trigger: 'change' }
    ]
    return result
  }, {})

  const normalizeCarmines = (
    carmines: Api.CarmineMange.EntryRatioCarmineItem[] | undefined
  ): EditableCarmine[] =>
    (Array.isArray(carmines) ? carmines : []).map((item) => ({
      ...item,
      carmine: typeof item.carmine === 'string' ? item.carmine : '',
      number: typeof item.number === 'number' ? item.number : 0
    }))

  const initForm = () => {
    const data = props.settingData
    Object.assign(form, createEmptyForm(), data, {
      excludeCard: typeof data?.excludeCard === 'string' ? data.excludeCard : '',
      carmines: normalizeCarmines(data?.carmines)
    })
    nextTick(() => formRef.value?.clearValidate())
  }

  watch(
    () => [props.modelValue, props.settingData] as const,
    ([isVisible]) => {
      if (isVisible) initForm()
    },
    { deep: true }
  )

  const addCarmine = () => {
    form.carmines.push({ carmine: '', number: 0 })
  }

  const normalizeExcludeCard = (value: string) =>
    value
      .split(/[,\r\n]+/)
      .map((item) => item.trim())
      .filter(Boolean)
      .join(',')

  const handleClose = () => {
    if (saving.value) return
    visible.value = false
  }

  const handleClosed = () => {
    Object.assign(form, createEmptyForm())
    formRef.value?.clearValidate()
  }

  const handleSubmit = async () => {
    if (!formRef.value) return
    if (form.id === undefined || form.id === null || form.id === '') {
      ElMessage.error('配置 id 为空，无法保存')
      return
    }

    const valid = await formRef.value.validate().catch(() => false)
    if (!valid) return

    saving.value = true
    try {
      await updateEntryRatioSetting({
        id: form.id,
        mainNumberTwo: form.mainNumberTwo!,
        subNumberTwo: form.subNumberTwo!,
        hijackMainNumberTwo: form.hijackMainNumberTwo!,
        hijackSubNumberTwo: form.hijackSubNumberTwo!,
        excludeCard: normalizeExcludeCard(form.excludeCard),
        delayTime: form.delayTime!,
        hackTotalNumber: form.hackTotalNumber!,
        totalNumber: form.totalNumber!,
        carmines: form.carmines
      })
      ElMessage.success('保存成功')
      visible.value = false
      emit('success')
    } catch {
      // 接口错误由统一请求封装提示，保存失败时保留弹窗。
    } finally {
      saving.value = false
    }
  }
</script>

<style scoped lang="scss">
  .number-input {
    width: 100%;
  }

  .carmine-list {
    width: 100%;
  }

  .add-button {
    margin-bottom: 10px;
  }

  .drag-handle {
    color: var(--el-text-color-secondary);
    cursor: move;
  }
</style>
