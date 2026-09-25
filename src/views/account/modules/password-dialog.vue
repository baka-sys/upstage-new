<template>
  <ElDialog
    v-model="dialogVisible"
    title="修改企业账号密码"
    width="480px"
    align-center
    destroy-on-close
    @closed="resetForm"
  >
    <ElForm ref="formRef" :model="formData" :rules="rules" label-width="100px">
      <ElFormItem label="企业账号">
        <ElInput :model-value="accountData?.account || '--'" disabled />
      </ElFormItem>
      <ElFormItem label="新密码" prop="newPassword">
        <ElInput
          v-model="formData.newPassword"
          type="password"
          placeholder="请输入新密码"
          show-password
        />
      </ElFormItem>
      <ElFormItem label="确认密码" prop="confirmPassword">
        <ElInput
          v-model="formData.confirmPassword"
          type="password"
          placeholder="请再次输入新密码"
          show-password
        />
      </ElFormItem>
    </ElForm>

    <template #footer>
      <ElButton :disabled="submitting" @click="dialogVisible = false">取消</ElButton>
      <ElButton type="primary" :loading="submitting" @click="handleSubmit">保存</ElButton>
    </template>
  </ElDialog>
</template>

<script setup lang="ts">
  import type { FormInstance, FormItemRule, FormRules } from 'element-plus'
  import { updateAccountPassword } from '@/api/account'

  interface Props {
    visible: boolean
    accountData?: Api.AccountManage.AccountListItem
  }

  interface Emits {
    (e: 'update:visible', value: boolean): void
    (e: 'success'): void
  }

  interface PasswordForm {
    newPassword: string
    confirmPassword: string
  }

  const props = withDefaults(defineProps<Props>(), {
    accountData: undefined
  })
  const emit = defineEmits<Emits>()

  const dialogVisible = computed({
    get: () => props.visible,
    set: (value) => emit('update:visible', value)
  })

  const formRef = ref<FormInstance>()
  const submitting = ref(false)
  const formData = reactive<PasswordForm>({
    newPassword: '',
    confirmPassword: ''
  })

  const validateConfirmPassword: FormItemRule['validator'] = (_rule, value, callback) => {
    if (value !== formData.newPassword) {
      callback(new Error('两次输入的密码不一致'))
      return
    }
    callback()
  }

  const rules: FormRules<PasswordForm> = {
    newPassword: [{ required: true, message: '请输入新密码', trigger: 'blur' }],
    confirmPassword: [
      { required: true, message: '请再次输入新密码', trigger: 'blur' },
      { validator: validateConfirmPassword, trigger: 'blur' }
    ]
  }

  const resetForm = () => {
    formData.newPassword = ''
    formData.confirmPassword = ''
    submitting.value = false
    formRef.value?.clearValidate()
  }

  const handleSubmit = async () => {
    if (!formRef.value || submitting.value) return

    const valid = await formRef.value.validate().catch(() => false)
    if (!valid) return
    if (props.accountData?.id == null) {
      ElMessage.error('企业账号 id 为空，无法修改密码')
      return
    }

    submitting.value = true
    try {
      await updateAccountPassword({
        id: props.accountData.id,
        newPassword: formData.newPassword,
        confirmPassword: formData.confirmPassword
      })
      ElMessage.success('密码修改成功')
      dialogVisible.value = false
      emit('success')
    } catch {
      // 请求错误由统一 HTTP 拦截器提示，失败时保留用户输入。
    } finally {
      submitting.value = false
    }
  }
</script>
