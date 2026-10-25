<template>
  <ElDialog
    v-model="dialogVisible"
    title="批量录入"
    width="560px"
    align-center
    :close-on-click-modal="!submitting"
    :close-on-press-escape="!submitting"
    :show-close="!submitting"
    destroy-on-close
    @closed="resetForm"
  >
    <ElForm ref="formRef" :model="formData" :rules="rules" label-width="110px">
      <ElFormItem :label="isExclusiveType ? '活码地址' : '域名集合'" prop="domainNames">
        <ElInput
          v-model="formData.domainNames"
          type="textarea"
          :rows="7"
          placeholder="请输入完整地址（如 https://example.com），多个地址可换行或逗号分隔"
        />
      </ElFormItem>

      <ElFormItem label="域名类型" prop="type">
        <ElRadioGroup v-model="formData.type">
          <ElRadio :value="0">公共域名</ElRadio>
          <ElRadio :value="1">专属域名</ElRadio>
          <ElRadio :value="2">备用域名</ElRadio>
        </ElRadioGroup>
      </ElFormItem>

      <ElFormItem v-if="!isExclusiveType" label="平台类型" prop="platformType">
        <ElSelect v-model="formData.platformType" class="full-width" placeholder="请选择平台类型">
          <ElOption
            v-for="option in BATCH_PLATFORM_TYPE_OPTIONS"
            :key="option.value"
            :label="option.label"
            :value="option.value"
          />
        </ElSelect>
      </ElFormItem>

      <ElFormItem v-if="!isExclusiveType" label="域名类型" prop="direct">
        <ElSelect v-model="formData.direct" class="full-width" placeholder="请选择域名类型">
          <ElOption label="口子域名" :value="0" />
          <ElOption label="直连域名" :value="1" />
          <ElOption label="备案域名" :value="2" />
          <ElOption label="嵌套域名" :value="3" />
        </ElSelect>
      </ElFormItem>

      <ElFormItem v-if="formData.type === 0" label="是否支持扫码" prop="isScan">
        <ElRadioGroup v-model="formData.isScan">
          <ElRadio :value="0">支持</ElRadio>
          <ElRadio :value="1">不支持</ElRadio>
        </ElRadioGroup>
      </ElFormItem>
    </ElForm>

    <template #footer>
      <ElButton :disabled="submitting" @click="dialogVisible = false">取消</ElButton>
      <ElButton type="primary" :loading="submitting" :disabled="submitting" @click="handleSubmit">
        {{ submitting ? '正在执行' : '保存' }}
      </ElButton>
    </template>
  </ElDialog>
</template>

<script setup lang="ts">
  import type { FormInstance, FormRules } from 'element-plus'
  import { addCodeBatch } from '@/api/code'
  import { BATCH_PLATFORM_TYPE_OPTIONS } from '../constants'

  interface Props {
    visible: boolean
    initialType: Api.CodeManage.BatchAddCodeType
  }

  interface Emits {
    (e: 'update:visible', value: boolean): void
    (e: 'success'): void
  }

  interface BatchAddForm {
    domainNames: string
    type: Api.CodeManage.BatchAddCodeType
    platformType?: number
    direct: Api.CodeManage.DirectType
    isScan: 0 | 1
  }

  const props = defineProps<Props>()
  const emit = defineEmits<Emits>()

  const dialogVisible = computed({
    get: () => props.visible,
    set: (value) => emit('update:visible', value)
  })

  const formRef = ref<FormInstance>()
  const submitting = ref(false)
  const isExclusiveType = computed(() => formData.type === 1)
  const formData = reactive<BatchAddForm>({
    domainNames: '',
    type: 0,
    platformType: undefined,
    direct: 0,
    isScan: 0
  })

  /** 将换行、中英文逗号输入统一清洗为接口要求的英文逗号分隔字符串。 */
  const normalizeDomainNames = (domainNames: string) =>
    domainNames
      .replace(/，/g, ',')
      .replace(/\r?\n/g, ',')
      .split(',')
      .map((domainName) => domainName.trim())
      .filter(Boolean)
      .join(',')

  const validateDomainNames = (
    _rule: unknown,
    value: string,
    callback: (error?: Error) => void
  ) => {
    const domains = normalizeDomainNames(value || '')
      .split(',')
      .filter(Boolean)
    if (domains.length === 0) {
      callback(new Error('请至少输入一个有效域名'))
      return
    }
    if (new Set(domains).size !== domains.length) {
      callback(new Error('请勿重复输入相同域名'))
      return
    }
    try {
      domains.forEach((domain) => {
        const url = new URL(domain)
        if (!['http:', 'https:'].includes(url.protocol)) throw new Error('invalid protocol')
      })
    } catch {
      callback(new Error('请输入以 http:// 或 https:// 开头的完整地址'))
      return
    }
    callback()
  }

  const validateRequiredNumber = (
    _rule: unknown,
    value: number | undefined,
    callback: (error?: Error) => void
  ) => {
    if (value == null) {
      callback(new Error('请选择该项'))
      return
    }
    callback()
  }

  const rules = computed<FormRules>(() => ({
    domainNames: [{ required: true, validator: validateDomainNames, trigger: 'blur' }],
    type: [{ required: true, validator: validateRequiredNumber, trigger: 'change' }],
    ...(formData.type === 0
      ? { isScan: [{ required: true, validator: validateRequiredNumber, trigger: 'change' }] }
      : {}),
    ...(!isExclusiveType.value
      ? {
          platformType: [{ required: true, validator: validateRequiredNumber, trigger: 'change' }],
          direct: [{ required: true, validator: validateRequiredNumber, trigger: 'change' }]
        }
      : {})
  }))

  const initializeForm = () => {
    Object.assign(formData, {
      domainNames: '',
      type: props.initialType,
      platformType: undefined,
      direct: 0,
      isScan: 0
    })
    submitting.value = false
    nextTick(() => formRef.value?.clearValidate())
  }

  const resetForm = () => {
    formRef.value?.resetFields()
    initializeForm()
  }

  watch(
    () => props.visible,
    (visible) => {
      if (visible) initializeForm()
    }
  )

  const handleSubmit = async () => {
    if (!formRef.value || submitting.value) return

    const valid = await formRef.value.validate().catch(() => false)
    const domainNames = normalizeDomainNames(formData.domainNames)
    if (!valid || !domainNames || (!isExclusiveType.value && formData.platformType == null)) return

    submitting.value = true
    try {
      const params: Api.CodeManage.AddCodeBatchParams = {
        domainNames,
        type: formData.type
      }

      if (formData.type === 0) params.isScan = formData.isScan

      if (!isExclusiveType.value) {
        params.platformType = formData.platformType
        params.direct = formData.direct
      }

      await addCodeBatch(params)
      ElMessage.success('保存成功')
      dialogVisible.value = false
      emit('success')
    } catch {
      // 请求错误由统一 HTTP 拦截器提示；失败时保留弹窗及用户输入。
    } finally {
      submitting.value = false
    }
  }
</script>

<style scoped lang="scss">
  .full-width {
    width: 100%;
  }
</style>
