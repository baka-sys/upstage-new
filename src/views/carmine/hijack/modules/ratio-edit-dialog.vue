<template>
  <ElDialog
    v-model="visible"
    title="修改劫持比例"
    width="560px"
    align-center
    destroy-on-close
    @closed="handleClosed"
  >
    <ElForm ref="formRef" :model="form" :rules="rules" label-width="110px">
      <ElFormItem label="主卡">
        <ElInput v-model="form.mainCarmine" disabled />
      </ElFormItem>
      <ElFormItem label="副卡" prop="subCarmine">
        <ElInput v-model.trim="form.subCarmine" clearable placeholder="请输入副卡卡密" />
      </ElFormItem>
      <ElFormItem label="主卡人数" prop="mainRadioNumber">
        <ElInputNumber v-model="form.mainRadioNumber" :min="0" :precision="0" />
      </ElFormItem>
      <ElFormItem label="副卡人数" prop="subRadioNumber">
        <ElInputNumber v-model="form.subRadioNumber" :min="0" :precision="0" />
      </ElFormItem>
      <ElFormItem label="头寸数量" prop="systemTotalNumber">
        <ElInputNumber v-model="form.systemTotalNumber" :min="0" :precision="0" />
      </ElFormItem>
      <ElFormItem label="状态" prop="switchCode">
        <ElRadioGroup v-model="form.switchCode">
          <ElRadio :value="0">开启</ElRadio>
          <ElRadio :value="1">暂停</ElRadio>
        </ElRadioGroup>
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
  import { updateEntryRatio } from '@/api/carmine'

  interface Props {
    modelValue: boolean
    ratioData?: Api.CarmineMange.EntryRatioItem
  }

  interface Emits {
    (e: 'update:modelValue', value: boolean): void
    (e: 'success'): void
  }

  interface RatioForm {
    id?: number
    mainUserId?: number
    mainCarmine: string
    subCarmine: string
    mainRadioNumber: number
    subRadioNumber: number
    systemTotalNumber: number
    switchCode: 0 | 1
  }

  const props = defineProps<Props>()
  const emit = defineEmits<Emits>()
  const formRef = ref<FormInstance>()
  const saving = ref(false)

  const visible = computed({
    get: () => props.modelValue,
    set: (value) => emit('update:modelValue', value)
  })

  const createEmptyForm = (): RatioForm => ({
    id: undefined,
    mainUserId: undefined,
    mainCarmine: '',
    subCarmine: '',
    mainRadioNumber: 0,
    subRadioNumber: 0,
    systemTotalNumber: 0,
    switchCode: 0
  })

  const form = reactive<RatioForm>(createEmptyForm())

  const validateNonNegativeInteger = (
    _rule: unknown,
    value: unknown,
    callback: (error?: Error) => void
  ) => {
    if (typeof value !== 'number' || !Number.isInteger(value) || value < 0) {
      callback(new Error('请输入不小于 0 的整数'))
      return
    }
    callback()
  }

  const rules: FormRules<RatioForm> = {
    subCarmine: [{ required: true, message: '请输入副卡卡密', trigger: 'blur' }],
    mainRadioNumber: [{ validator: validateNonNegativeInteger, trigger: 'change' }],
    subRadioNumber: [{ validator: validateNonNegativeInteger, trigger: 'change' }],
    systemTotalNumber: [{ validator: validateNonNegativeInteger, trigger: 'change' }],
    switchCode: [{ required: true, message: '请选择状态', trigger: 'change' }]
  }

  const initForm = () => {
    const ratio = props.ratioData
    Object.assign(form, createEmptyForm(), {
      id: ratio?.id,
      mainUserId: ratio?.mainUserId,
      mainCarmine: ratio?.mainCarmine ?? '',
      subCarmine: ratio?.subCarmine ?? '',
      mainRadioNumber: ratio?.mainRadioNumber ?? 0,
      subRadioNumber: ratio?.subRadioNumber ?? 0,
      systemTotalNumber: ratio?.systemTotalNumber ?? 0,
      switchCode: ratio?.switchCode ?? 0
    })
    nextTick(() => formRef.value?.clearValidate())
  }

  watch(
    () => [props.modelValue, props.ratioData] as const,
    ([isVisible]) => {
      if (isVisible) initForm()
    },
    { deep: true }
  )

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
    const valid = await formRef.value.validate().catch(() => false)
    if (!valid) return
    if (!form.id || !form.mainUserId) {
      ElMessage.error('劫持配置 id 为空，无法保存')
      return
    }

    const payload: Api.CarmineMange.SaveEntryRatioParams = {
      ...props.ratioData,
      id: form.id,
      mainUserId: form.mainUserId,
      mainCarmine: form.mainCarmine,
      subCarmine: form.subCarmine,
      mainRadioNumber: form.mainRadioNumber,
      subRadioNumber: form.subRadioNumber,
      systemTotalNumber: form.systemTotalNumber,
      switchCode: form.switchCode
    }

    saving.value = true
    try {
      await updateEntryRatio(payload)
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
  :deep(.el-input-number) {
    width: 100%;
  }
</style>
