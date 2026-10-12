<template>
  <ElDialog
    v-model="visible"
    title="修改劫持比例"
    width="760px"
    align-center
    :close-on-click-modal="!saving"
    :close-on-press-escape="!saving"
    :show-close="!saving"
    destroy-on-close
    @closed="handleClosed"
  >
    <ElForm ref="formRef" :model="form" :rules="rules" label-width="120px">
      <ElFormItem label="主卡">
        <ElInput :model-value="form.mainCarmine" disabled />
      </ElFormItem>
      <ElDivider content-position="left">副卡1比例</ElDivider>
      <ElFormItem label="副卡1" prop="subCarmine">
        <ElInput :model-value="form.subCarmine" disabled placeholder="暂无副卡1卡密" />
      </ElFormItem>
      <ElRow :gutter="16">
        <ElCol :span="12"
          ><ElFormItem label="主卡比例人数" prop="mainRadioNumber"
            ><ElInputNumber
              v-model="form.mainRadioNumber"
              :min="0"
              :max="2147483647"
              :precision="0" /></ElFormItem
        ></ElCol>
        <ElCol :span="12"
          ><ElFormItem label="副卡1比例人数" prop="subRadioNumber"
            ><ElInputNumber
              v-model="form.subRadioNumber"
              :min="0"
              :max="2147483647"
              :precision="0" /></ElFormItem
        ></ElCol>
      </ElRow>
      <ElFormItem label="头寸数量" prop="systemTotalNumber"
        ><ElInputNumber v-model="form.systemTotalNumber" :min="0" :max="2147483647" :precision="0"
      /></ElFormItem>
      <ElFormItem label="副卡1开关"
        ><ElRadioGroup v-model="form.switchCode"
          ><ElRadio :value="0">开启</ElRadio><ElRadio :value="1">暂停</ElRadio></ElRadioGroup
        ></ElFormItem
      >
      <ElDivider content-position="left">副卡2比例</ElDivider>
      <ElFormItem label="副卡2" prop="subCarmineTwo">
        <ElInput v-model.trim="form.subCarmineTwo" placeholder="请输入副卡2卡密" />
      </ElFormItem>
      <ElRow :gutter="16">
        <ElCol :span="12"
          ><ElFormItem label="主卡比例人数" prop="mainRadioNumberTwo"
            ><ElInputNumber
              v-model="form.mainRadioNumberTwo"
              :min="0"
              :max="2147483647"
              :precision="0" /></ElFormItem
        ></ElCol>
        <ElCol :span="12"
          ><ElFormItem label="副卡2比例人数" prop="subRadioNumberTwo"
            ><ElInputNumber
              v-model="form.subRadioNumberTwo"
              :min="0"
              :max="2147483647"
              :precision="0" /></ElFormItem
        ></ElCol>
      </ElRow>
      <ElFormItem label="头寸数量" prop="systemTotalNumberTwo"
        ><ElInputNumber
          v-model="form.systemTotalNumberTwo"
          :min="0"
          :max="2147483647"
          :precision="0"
      /></ElFormItem>
      <ElFormItem label="副卡2开关"
        ><ElRadioGroup v-model="form.switchCodeTwo"
          ><ElRadio :value="0">开启</ElRadio><ElRadio :value="1">暂停</ElRadio></ElRadioGroup
        ></ElFormItem
      >
    </ElForm>
    <template #footer>
      <ElButton :disabled="saving" @click="handleClose">取消</ElButton>
      <ElButton type="primary" :loading="saving" :disabled="saving" @click="handleSubmit"
        >保存</ElButton
      >
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
  interface RatioForm {
    id?: number
    mainUserId?: number
    mainCarmine: string
    subCarmine: string
    mainRadioNumber: number
    subRadioNumber: number
    systemTotalNumber: number
    switchCode: 0 | 1
    subCarmineTwo: string
    mainRadioNumberTwo: number
    subRadioNumberTwo: number
    systemTotalNumberTwo: number
    switchCodeTwo: 0 | 1
  }
  const props = defineProps<Props>()
  const emit = defineEmits<{
    (e: 'update:modelValue', value: boolean): void
    (e: 'success'): void
  }>()
  const formRef = ref<FormInstance>()
  const saving = ref(false)
  const visible = computed({
    get: () => props.modelValue,
    set: (value) => emit('update:modelValue', value)
  })
  const emptyForm = (): RatioForm => ({
    id: undefined,
    mainUserId: undefined,
    mainCarmine: '',
    subCarmine: '',
    mainRadioNumber: 0,
    subRadioNumber: 0,
    systemTotalNumber: 0,
    switchCode: 0,
    subCarmineTwo: '',
    mainRadioNumberTwo: 0,
    subRadioNumberTwo: 0,
    systemTotalNumberTwo: 0,
    switchCodeTwo: 0
  })
  const form = reactive<RatioForm>(emptyForm())
  const validateInteger = (_rule: unknown, value: unknown, callback: (error?: Error) => void) => {
    if (typeof value !== 'number' || !Number.isInteger(value) || value < 0 || value > 2147483647) {
      callback(new Error('请输入 0 到 2147483647 之间的整数'))
      return
    }
    callback()
  }
  const rules = [
    'mainRadioNumber',
    'subRadioNumber',
    'systemTotalNumber',
    'mainRadioNumberTwo',
    'subRadioNumberTwo',
    'systemTotalNumberTwo'
  ].reduce<FormRules<RatioForm>>((result, key) => {
    result[key as keyof RatioForm] = [{ validator: validateInteger, trigger: 'change' }]
    return result
  }, {})
  const initForm = () => {
    const ratio = props.ratioData
    const values = emptyForm()
    Object.keys(values).forEach((key) => {
      const value = ratio?.[key as keyof RatioForm]
      if (value != null) Object.assign(values, { [key]: value })
    })
    Object.assign(form, values)
    nextTick(() => formRef.value?.clearValidate())
  }
  watch(
    () => [props.modelValue, props.ratioData] as const,
    ([isVisible]) => {
      if (isVisible) initForm()
    }
  )
  const handleClose = () => {
    if (!saving.value) visible.value = false
  }
  const handleClosed = () => {
    Object.assign(form, emptyForm())
    formRef.value?.clearValidate()
  }
  const handleSubmit = async () => {
    if (!formRef.value || saving.value) return
    const valid = await formRef.value.validate().catch(() => false)
    if (!valid || saving.value) return
    if (form.id == null || form.mainUserId == null) {
      ElMessage.error('比例记录或主卡信息不完整，无法保存')
      return
    }
    const subCarmine = (props.ratioData?.subCarmine || '').trim()
    const subCarmineTwo = form.subCarmineTwo.trim()
    if (!subCarmine && !subCarmineTwo) {
      ElMessage.error('请至少填写一张副卡卡密')
      return
    }
    if (
      (!subCarmine &&
        (props.ratioData?.subCarmine || form.mainRadioNumber > 0 || form.subRadioNumber > 0)) ||
      (!subCarmineTwo &&
        (props.ratioData?.subCarmineTwo ||
          form.mainRadioNumberTwo > 0 ||
          form.subRadioNumberTwo > 0))
    ) {
      ElMessage.error('请填写对应副卡卡密，已有副卡不能在此清空')
      return
    }
    const payload: Api.CarmineMange.SaveEntryRatioParams = {
      ...form,
      mainUserId: form.mainUserId,
      subCarmine,
      subCarmineTwo
    }
    saving.value = true
    try {
      await updateEntryRatio(payload)
      ElMessage.success('比例修改成功')
      visible.value = false
      emit('success')
    } catch {
      // 接口错误由 HTTP 封装提示，保留弹窗及用户输入。
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
