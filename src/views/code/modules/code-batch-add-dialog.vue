<template>
  <ElDialog
    v-model="dialogVisible"
    title="批量录入"
    width="560px"
    align-center
    destroy-on-close
    @closed="resetForm"
  >
    <ElForm ref="formRef" :model="formData" :rules="rules" label-width="110px">
      <ElFormItem :label="isExclusiveType ? '活码地址' : '域名集合'" prop="domainNames">
        <ElInput
          v-model="formData.domainNames"
          type="textarea"
          :rows="7"
          placeholder="请输入域名，多个域名可换行或逗号分隔"
        />
      </ElFormItem>

      <ElFormItem label="域名类型" prop="type">
        <ElRadioGroup v-model="formData.type">
          <ElRadio :value="0">公共域名</ElRadio>
          <ElRadio :value="1">专属域名</ElRadio>
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

      <ElFormItem v-if="!isExclusiveType" label="是否直连域名" prop="direct">
        <ElRadioGroup v-model="formData.direct">
          <ElRadio :value="0">否</ElRadio>
          <ElRadio :value="1">是</ElRadio>
        </ElRadioGroup>
      </ElFormItem>
    </ElForm>

    <template #footer>
      <ElButton :disabled="submitting" @click="dialogVisible = false">取消</ElButton>
      <ElButton type="primary" :loading="submitting" @click="handleSubmit">保存</ElButton>
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
    direct: 0 | 1
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
    direct: 0
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
    if (!normalizeDomainNames(value || '')) {
      callback(new Error('请至少输入一个有效域名'))
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

  const rules: FormRules<BatchAddForm> = {
    domainNames: [{ validator: validateDomainNames, trigger: 'blur' }],
    type: [{ validator: validateRequiredNumber, trigger: 'change' }],
    platformType: [
      {
        validator: (_rule, value, callback) => {
          if (isExclusiveType.value) {
            callback()
            return
          }
          validateRequiredNumber(_rule, value, callback)
        },
        trigger: 'change'
      }
    ],
    direct: [
      {
        validator: (_rule, value, callback) => {
          if (isExclusiveType.value) {
            callback()
            return
          }
          validateRequiredNumber(_rule, value, callback)
        },
        trigger: 'change'
      }
    ]
  }

  const initializeForm = () => {
    Object.assign(formData, {
      domainNames: '',
      type: props.initialType,
      platformType: undefined,
      direct: 0
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

      if (!isExclusiveType.value) {
        params.platformType = formData.platformType
        // TODO: 后端确认 direct = 0/1 是否分别代表否/是。
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
