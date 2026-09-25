<template>
  <ElDialog
    v-model="dialogVisible"
    title="企业账号充值"
    width="480px"
    align-center
    destroy-on-close
    @closed="resetForm"
  >
    <div class="account-summary">
      <div class="summary-icon">
        <ElIcon><Wallet /></ElIcon>
      </div>
      <div class="summary-content">
        <div class="account-name">{{ accountData?.accountName || '--' }}</div>
        <div class="account-detail">
          账号：{{ accountData?.account || '--' }} · 当前积分：{{ accountData?.points ?? 0 }}
        </div>
      </div>
    </div>

    <ElForm ref="formRef" :model="formData" :rules="rules" label-position="top">
      <ElFormItem label="充值金额" prop="coin">
        <ElInputNumber
          v-model="formData.coin"
          :min="0.01"
          :precision="2"
          :step="100"
          :controls="false"
          placeholder="请输入充值金额"
          class="coin-input"
        />
        <div class="form-tip">实际到账积分将按照系统配置的充值比例计算</div>
      </ElFormItem>
    </ElForm>

    <template #footer>
      <ElButton :disabled="submitting" @click="dialogVisible = false">取消</ElButton>
      <ElButton type="primary" :loading="submitting" @click="handleSubmit">确认充值</ElButton>
    </template>
  </ElDialog>
</template>

<script setup lang="ts">
  import { Wallet } from '@element-plus/icons-vue'
  import type { FormInstance, FormRules } from 'element-plus'
  import { rechargeAccount } from '@/api/account'

  interface Props {
    visible: boolean
    accountData?: Api.AccountManage.AccountListItem
  }

  interface Emits {
    (e: 'update:visible', value: boolean): void
    (e: 'success'): void
  }

  interface RechargeForm {
    coin?: number
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
  const formData = reactive<RechargeForm>({ coin: undefined })

  const rules: FormRules<RechargeForm> = {
    coin: [
      { required: true, message: '请输入充值金额', trigger: 'blur' },
      { type: 'number', min: 0.01, message: '充值金额必须大于 0', trigger: 'change' }
    ]
  }

  const resetForm = () => {
    formData.coin = undefined
    submitting.value = false
    formRef.value?.clearValidate()
  }

  const handleSubmit = async () => {
    if (!formRef.value || submitting.value) return

    const valid = await formRef.value.validate().catch(() => false)
    if (!valid || formData.coin == null) return
    if (props.accountData?.id == null) {
      ElMessage.error('企业账号 id 为空，无法充值')
      return
    }

    submitting.value = true
    try {
      await rechargeAccount({
        accountId: props.accountData.id,
        coin: formData.coin
      })
      ElMessage.success('充值成功')
      dialogVisible.value = false
      emit('success')
    } catch {
      // 请求错误由统一 HTTP 拦截器提示，失败时保留当前输入。
    } finally {
      submitting.value = false
    }
  }
</script>

<style scoped lang="scss">
  .account-summary {
    display: flex;
    gap: 14px;
    align-items: center;
    padding: 16px;
    margin-bottom: 20px;
    background: var(--el-fill-color-light);
    border-radius: 10px;
  }

  .summary-icon {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 44px;
    height: 44px;
    font-size: 22px;
    color: var(--el-color-primary);
    background: var(--el-color-primary-light-9);
    border-radius: 10px;
  }

  .summary-content {
    min-width: 0;
  }

  .account-name {
    overflow: hidden;
    font-size: 15px;
    font-weight: 600;
    color: var(--el-text-color-primary);
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .account-detail,
  .form-tip {
    margin-top: 4px;
    font-size: 12px;
    color: var(--el-text-color-secondary);
  }

  .coin-input {
    width: 100%;
  }
</style>
