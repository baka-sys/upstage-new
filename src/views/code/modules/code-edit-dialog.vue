<template>
  <ElDialog
    v-model="dialogVisible"
    title="编辑活码域名"
    width="560px"
    align-center
    :close-on-click-modal="!saving"
    :close-on-press-escape="!saving"
    :show-close="!saving"
    destroy-on-close
    @closed="resetForm"
  >
    <ElForm ref="formRef" :model="formData" :rules="rules" label-width="110px">
      <ElFormItem label="活码类型">
        <ElInput :model-value="codeTypeLabel" disabled />
      </ElFormItem>
      <ElFormItem label="域名地址" prop="domainName">
        <ElInput
          v-model="formData.domainName"
          placeholder="请输入完整地址，如 https://example.com"
          clearable
        />
      </ElFormItem>
      <ElFormItem v-if="props.codeData?.type !== 1" label="平台类型">
        <ElSelect v-model="formData.platformType" placeholder="请选择平台类型" class="full-width">
          <ElOption
            v-for="option in PLATFORM_TYPE_OPTIONS"
            :key="option.value"
            :label="option.label"
            :value="option.value"
          />
        </ElSelect>
      </ElFormItem>
      <ElFormItem v-if="props.codeData?.type !== 1" label="域名类型">
        <ElSelect v-model="formData.direct" placeholder="请选择域名类型" class="full-width">
          <ElOption label="口子域名" :value="0" />
          <ElOption label="直连域名" :value="1" />
          <ElOption label="备案域名" :value="2" />
        </ElSelect>
      </ElFormItem>
    </ElForm>
    <template #footer>
      <ElButton :disabled="saving" @click="dialogVisible = false">取消</ElButton>
      <ElButton type="primary" :loading="saving" :disabled="saving" @click="handleSubmit"
        >保存</ElButton
      >
    </template>
  </ElDialog>
</template>

<script setup lang="ts">
  import { ElMessage, type FormInstance, type FormRules } from 'element-plus'
  import { updateCode } from '@/api/code'
  import { CODE_TYPE_TABS, PLATFORM_TYPE_OPTIONS } from '../constants'

  interface Props {
    visible: boolean
    codeData?: Api.CodeManage.CodePageListItem
  }
  const props = defineProps<Props>()
  const emit = defineEmits<{
    (e: 'update:visible', value: boolean): void
    (e: 'success'): void
  }>()
  const formRef = ref<FormInstance>()
  const saving = ref(false)
  const formData = reactive({
    domainName: '',
    platformType: undefined as number | undefined,
    direct: undefined as Api.CodeManage.DirectType | undefined
  })
  const dialogVisible = computed({
    get: () => props.visible,
    set: (value) => emit('update:visible', value)
  })
  const codeTypeLabel = computed(
    () => CODE_TYPE_TABS.find((tab) => tab.value === props.codeData?.type)?.label ?? ''
  )
  const validateDomainName = (_rule: unknown, value: string, callback: (error?: Error) => void) => {
    try {
      const url = new URL(value.trim())
      if (!['http:', 'https:'].includes(url.protocol)) throw new Error('invalid protocol')
      callback()
    } catch {
      callback(new Error('请输入以 http:// 或 https:// 开头的完整地址'))
    }
  }
  const rules: FormRules = {
    domainName: [{ required: true, validator: validateDomainName, trigger: 'blur' }]
  }
  const resetForm = () => {
    Object.assign(formData, { domainName: '', platformType: undefined, direct: undefined })
    formRef.value?.clearValidate()
  }
  watch(
    () => props.visible,
    (visible) => {
      if (!visible) return
      Object.assign(formData, {
        domainName: props.codeData?.domainName ?? '',
        platformType: props.codeData?.platformType,
        direct: props.codeData?.direct
      })
      nextTick(() => formRef.value?.clearValidate())
    }
  )
  const handleSubmit = async () => {
    if (!formRef.value || saving.value) return
    const id = props.codeData?.id
    if (id == null) {
      ElMessage.error('数据 id 为空，无法保存')
      return
    }
    const valid = await formRef.value.validate().catch(() => false)
    if (!valid || saving.value) return
    const data: Api.CodeManage.UpdateCodeParams = { id, domainName: formData.domainName.trim() }
    if (props.codeData?.type !== 1) {
      if (formData.platformType != null) data.platformType = formData.platformType
      if (formData.direct != null) data.direct = formData.direct
    }
    saving.value = true
    try {
      await updateCode(data)
      ElMessage.success('修改成功')
      dialogVisible.value = false
      emit('success')
    } catch {
      // 请求失败由统一 HTTP 封装提示，保留用户输入。
    } finally {
      saving.value = false
    }
  }
</script>

<style scoped lang="scss">
  .full-width {
    width: 100%;
  }
</style>
