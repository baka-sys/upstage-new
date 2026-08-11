<template>
  <ElDialog
    v-model="dialogVisible"
    title="新增配置域名"
    width="520px"
    align-center
    destroy-on-close
    @closed="resetForm"
  >
    <ElForm ref="formRef" :model="formData" :rules="rules" label-width="90px">
      <ElFormItem label="域名地址" prop="domainNames">
        <ElInput
          v-model="formData.domainNames"
          type="textarea"
          :rows="7"
          placeholder="请输入活码地址，批量录入请换行"
        />
        <div class="form-tip">支持一次输入多个域名，可换行或使用英文逗号分隔</div>
      </ElFormItem>
      <ElFormItem label="域名类型" prop="type">
        <ElSelect v-model="formData.type" placeholder="请选择" class="full-width">
          <ElOption
            v-for="option in DOMAIN_TYPE_OPTIONS"
            :key="option.value"
            :label="option.label"
            :value="option.value"
          />
        </ElSelect>
      </ElFormItem>
    </ElForm>

    <template #footer>
      <div class="dialog-footer">
        <ElButton :disabled="submitting" @click="dialogVisible = false">取消</ElButton>
        <ElButton type="primary" :loading="submitting" @click="handleSubmit">保存</ElButton>
      </div>
    </template>
  </ElDialog>
</template>

<script setup lang="ts">
  import type { FormInstance, FormRules } from 'element-plus'
  import { batchAddSystemDomain } from '@/api/system-domain'
  import { DOMAIN_TYPE_OPTIONS } from '../constants'

  interface Props {
    visible: boolean
  }

  interface Emits {
    (e: 'update:visible', value: boolean): void
    (e: 'success'): void
  }

  interface BatchAddForm {
    domainNames: string
    type?: Api.SystemDomainManage.DomainType
  }

  const props = defineProps<Props>()
  const emit = defineEmits<Emits>()

  const dialogVisible = computed({
    get: () => props.visible,
    set: (value) => emit('update:visible', value)
  })

  const formRef = ref<FormInstance>()
  const submitting = ref(false)
  const formData = reactive<BatchAddForm>({
    domainNames: '',
    type: undefined
  })

  const validateDomainNames = (
    _rule: unknown,
    value: string,
    callback: (error?: Error) => void
  ) => {
    if (!value || !value.trim()) {
      callback(new Error('请输入域名地址'))
      return
    }
    callback()
  }

  const rules: FormRules<BatchAddForm> = {
    domainNames: [{ required: true, validator: validateDomainNames, trigger: 'blur' }],
    type: [{ required: true, message: '请选择域名类型', trigger: 'change' }]
  }

  const resetForm = () => {
    formData.domainNames = ''
    formData.type = undefined
    submitting.value = false
    nextTick(() => formRef.value?.clearValidate())
  }

  /** 后端按英文逗号拆分，提交前兼容换行和英文逗号两种输入方式。 */
  const normalizeDomainNames = (domainNames: string) =>
    domainNames
      .trim()
      .replace(/\s*(?:\r?\n|,)\s*/g, ',')
      .replace(/,+/g, ',')

  const handleSubmit = async () => {
    if (!formRef.value || submitting.value) return

    const valid = await formRef.value.validate().catch(() => false)
    if (!valid || formData.type == null) return

    submitting.value = true
    try {
      await batchAddSystemDomain({
        domainNames: normalizeDomainNames(formData.domainNames),
        type: formData.type
      })
      ElMessage.success('添加成功')
      dialogVisible.value = false
      emit('success')
    } catch {
      // 请求错误由项目统一 HTTP 拦截器提示，失败时保留弹窗和表单内容。
    } finally {
      submitting.value = false
    }
  }
</script>

<style scoped lang="scss">
  .full-width {
    width: 100%;
  }

  .form-tip {
    margin-top: 4px;
    font-size: 12px;
    line-height: 20px;
    color: var(--el-text-color-secondary);
  }
</style>
