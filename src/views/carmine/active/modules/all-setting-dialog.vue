<template>
  <ElDialog
    v-model="visible"
    title="劫持默认设置"
    width="500px"
    align-center
    destroy-on-close
    @closed="handleClosed"
  >
    <ElForm ref="formRef" :model="form" :rules="rules" label-width="120px">
      <ElFormItem label="卡类型" prop="type">
        <ElRadioGroup v-model="form.type">
          <ElRadio :value="1">普通卡</ElRadio>
          <ElRadio :value="2">劫持卡</ElRadio>
        </ElRadioGroup>
      </ElFormItem>

      <ElFormItem label="比例开关" prop="switchCodeTwo">
        <ElRadioGroup v-model="form.switchCodeTwo">
          <ElRadio :value="0">开</ElRadio>
          <ElRadio :value="1">关</ElRadio>
        </ElRadioGroup>
      </ElFormItem>

      <ElFormItem label="主卡2人数" prop="mainRadioNumberTwo">
        <ElInputNumber
          v-model="form.mainRadioNumberTwo"
          :min="0"
          :step="1"
          :precision="0"
          class="number-input"
        />
      </ElFormItem>

      <ElFormItem label="副卡2人数" prop="subRadioNumberTwo">
        <ElInputNumber
          v-model="form.subRadioNumberTwo"
          :min="0"
          :step="1"
          :precision="0"
          class="number-input"
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
  import { ElMessage, type FormInstance, type FormRules } from 'element-plus'
  import { batchUpdateAllEntryRatio } from '@/api/carmine'

  type AllSettingForm = Api.CarmineMange.BatchUpdateAllEntryRatioParams

  interface Props {
    modelValue: boolean
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

  const createDefaultForm = (): AllSettingForm => ({
    type: 1,
    switchCodeTwo: 0,
    mainRadioNumberTwo: 0,
    subRadioNumberTwo: 0
  })

  const form = reactive<AllSettingForm>(createDefaultForm())

  const validateNonNegativeInteger = (
    _rule: unknown,
    value: unknown,
    callback: (error?: Error) => void
  ) => {
    if (value === undefined || value === null || value === '') {
      callback(new Error('请输入人数'))
      return
    }
    if (typeof value !== 'number' || !Number.isInteger(value) || value < 0) {
      callback(new Error('请输入不小于 0 的整数'))
      return
    }
    callback()
  }

  const rules: FormRules<AllSettingForm> = {
    type: [{ required: true, message: '请选择卡类型', trigger: 'change' }],
    switchCodeTwo: [{ required: true, message: '请选择比例开关', trigger: 'change' }],
    mainRadioNumberTwo: [
      { required: true, validator: validateNonNegativeInteger, trigger: 'change' }
    ],
    subRadioNumberTwo: [
      { required: true, validator: validateNonNegativeInteger, trigger: 'change' }
    ]
  }

  const resetForm = () => {
    Object.assign(form, createDefaultForm())
    formRef.value?.clearValidate()
  }

  watch(
    () => props.modelValue,
    (isVisible) => {
      if (isVisible) {
        resetForm()
        nextTick(() => formRef.value?.clearValidate())
      }
    }
  )

  const handleClose = () => {
    if (saving.value) return
    visible.value = false
  }

  const handleClosed = () => {
    resetForm()
  }

  const handleSubmit = async () => {
    if (!formRef.value) return
    const valid = await formRef.value.validate().catch(() => false)
    if (!valid) return

    saving.value = true
    try {
      await batchUpdateAllEntryRatio({ ...form })
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
</style>
