<template>
  <ElDialog
    v-model="dialogVisible"
    :title="isEdit ? '编辑企业账号' : '新增企业账号'"
    width="680px"
    align-center
    destroy-on-close
    class="account-dialog"
    @closed="resetForm"
  >
    <div class="dialog-intro">
      <div class="intro-icon">
        <ElIcon><OfficeBuilding /></ElIcon>
      </div>
      <div>
        <div class="intro-title">{{ isEdit ? '完善企业资料' : '创建新的企业账号' }}</div>
        <div class="intro-description">
          {{ isEdit ? '修改企业名称和头像信息' : '填写企业基本资料并设置登录密码' }}
        </div>
      </div>
    </div>

    <ElForm ref="formRef" :model="formData" :rules="rules" label-position="top">
      <section class="form-section profile-section">
        <div class="section-heading">
          <span class="section-title">企业头像</span>
          <span class="section-tip">支持 JPG、PNG 等图片格式，文件不超过 5MB</span>
        </div>

        <div class="avatar-row">
          <ElUpload
            class="avatar-uploader"
            accept="image/*"
            :show-file-list="false"
            :disabled="uploading"
            :before-upload="beforeAvatarUpload"
            :http-request="handleAvatarUpload"
          >
            <div class="avatar-preview">
              <ElImage v-if="formData.img" :src="formData.img" fit="cover">
                <template #error>
                  <div class="avatar-placeholder"><Picture /></div>
                </template>
              </ElImage>
              <div v-else class="avatar-placeholder">
                <ElIcon><Plus /></ElIcon>
              </div>
              <div v-if="uploading" class="upload-mask">
                <ElIcon class="is-loading"><Loading /></ElIcon>
              </div>
            </div>
          </ElUpload>

          <div class="avatar-actions">
            <ElUpload
              accept="image/*"
              :show-file-list="false"
              :disabled="uploading"
              :before-upload="beforeAvatarUpload"
              :http-request="handleAvatarUpload"
            >
              <ElButton type="primary" plain :loading="uploading">选择图片</ElButton>
            </ElUpload>
            <ElButton v-if="formData.img" :disabled="uploading" @click="formData.img = ''">
              移除
            </ElButton>
            <span class="upload-tip">上传成功后将在保存账号时生效</span>
          </div>
        </div>
      </section>

      <section class="form-section">
        <div class="section-heading">
          <span class="section-title">基本信息</span>
        </div>

        <ElRow :gutter="16">
          <ElCol :span="12">
            <ElFormItem label="企业名称" prop="accountName">
              <ElInput v-model="formData.accountName" placeholder="请输入企业名称" clearable />
            </ElFormItem>
          </ElCol>
          <ElCol :span="12">
            <ElFormItem label="企业账号" prop="account">
              <ElInput
                v-model="formData.account"
                :disabled="isEdit"
                placeholder="请输入企业账号"
                clearable
              />
            </ElFormItem>
          </ElCol>
          <ElCol :span="12">
            <ElFormItem label="手机号" prop="phoneNumber">
              <ElInput
                v-model="formData.phoneNumber"
                :disabled="isEdit"
                placeholder="请输入手机号"
                maxlength="11"
                clearable
              />
            </ElFormItem>
          </ElCol>
          <ElCol v-if="isEdit" :span="12">
            <ElFormItem label="账号状态">
              <ElTag :type="accountData?.status === 0 ? 'success' : 'info'">
                {{ accountData?.status === 0 ? '启用' : '禁用' }}
              </ElTag>
            </ElFormItem>
          </ElCol>
        </ElRow>
      </section>

      <section v-if="!isEdit" class="form-section login-section">
        <div class="section-heading">
          <span class="section-title">登录密码</span>
          <span class="section-tip">请设置企业端登录时使用的密码</span>
        </div>

        <ElRow :gutter="16">
          <ElCol :span="12">
            <ElFormItem label="密码" prop="password">
              <ElInput
                v-model="formData.password"
                type="password"
                placeholder="请输入密码"
                show-password
              />
            </ElFormItem>
          </ElCol>
          <ElCol :span="12">
            <ElFormItem label="确认密码" prop="confirmPassword">
              <ElInput
                v-model="formData.confirmPassword"
                type="password"
                placeholder="请再次输入密码"
                show-password
              />
            </ElFormItem>
          </ElCol>
        </ElRow>
      </section>
    </ElForm>

    <template #footer>
      <ElButton :disabled="submitting" @click="dialogVisible = false">取消</ElButton>
      <ElButton type="primary" :loading="submitting" @click="handleSubmit">保存</ElButton>
    </template>
  </ElDialog>
</template>

<script setup lang="ts">
  import { Loading, OfficeBuilding, Picture, Plus } from '@element-plus/icons-vue'
  import type { FormInstance, FormItemRule, FormRules } from 'element-plus'
  import type { UploadRawFile, UploadRequestOptions } from 'element-plus'
  import { addAccount, updateAccountInfo, uploadAccountAvatar } from '@/api/account'

  interface Props {
    visible: boolean
    mode?: 'add' | 'edit'
    accountData?: Api.AccountManage.AccountListItem
  }

  interface Emits {
    (e: 'update:visible', value: boolean): void
    (e: 'success'): void
  }

  interface AccountForm {
    accountName: string
    account: string
    phoneNumber: string
    img: string
    password: string
    confirmPassword: string
  }

  const props = withDefaults(defineProps<Props>(), {
    mode: 'add',
    accountData: undefined
  })
  const emit = defineEmits<Emits>()
  const isEdit = computed(() => props.mode === 'edit')

  const dialogVisible = computed({
    get: () => props.visible,
    set: (value) => emit('update:visible', value)
  })

  const createEmptyForm = (): AccountForm => ({
    accountName: '',
    account: '',
    phoneNumber: '',
    img: '',
    password: '',
    confirmPassword: ''
  })

  const formRef = ref<FormInstance>()
  const submitting = ref(false)
  const uploading = ref(false)
  const formData = reactive<AccountForm>(createEmptyForm())

  const validateConfirmPassword: FormItemRule['validator'] = (_rule, value, callback) => {
    if (value !== formData.password) {
      callback(new Error('两次输入的密码不一致'))
      return
    }
    callback()
  }

  const rules: FormRules<AccountForm> = {
    accountName: [{ required: true, message: '请输入企业名称', trigger: 'blur' }],
    account: [{ required: true, message: '请输入企业账号', trigger: 'blur' }],
    phoneNumber: [{ pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号', trigger: 'blur' }],
    password: [{ required: true, message: '请输入密码', trigger: 'blur' }],
    confirmPassword: [
      { required: true, message: '请再次输入密码', trigger: 'blur' },
      { validator: validateConfirmPassword, trigger: 'blur' }
    ]
  }

  const initializeForm = () => {
    Object.assign(formData, createEmptyForm(), {
      accountName: isEdit.value ? props.accountData?.accountName || '' : '',
      account: isEdit.value ? props.accountData?.account || '' : '',
      phoneNumber: isEdit.value ? String(props.accountData?.phoneNumber || '') : '',
      img: isEdit.value ? props.accountData?.img || '' : ''
    })
    submitting.value = false
    uploading.value = false
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

  const beforeAvatarUpload = (file: UploadRawFile) => {
    if (!file.type.startsWith('image/')) {
      ElMessage.error('只能上传图片文件')
      return false
    }
    if (file.size / 1024 / 1024 > 5) {
      ElMessage.error('图片大小不能超过 5MB')
      return false
    }
    return true
  }

  const handleAvatarUpload = async (options: UploadRequestOptions) => {
    uploading.value = true
    try {
      const result = await uploadAccountAvatar(options.file)
      formData.img = result.filePath
      options.onSuccess(result)
      ElMessage.success('头像上传成功')
    } catch (error) {
      options.onError(error as Parameters<UploadRequestOptions['onError']>[0])
    } finally {
      uploading.value = false
    }
  }

  const handleSubmit = async () => {
    if (!formRef.value || submitting.value) return

    const valid = await formRef.value.validate().catch(() => false)
    if (!valid) return

    submitting.value = true
    try {
      if (isEdit.value) {
        if (props.accountData?.id == null) {
          ElMessage.error('企业账号 id 为空，无法保存')
          return
        }
        await updateAccountInfo({
          id: props.accountData.id,
          accountName: formData.accountName.trim(),
          img: formData.img.trim() || undefined
        })
      } else {
        await addAccount({
          accountName: formData.accountName.trim(),
          account: formData.account.trim(),
          phoneNumber: formData.phoneNumber ? Number(formData.phoneNumber) : undefined,
          img: formData.img.trim() || undefined,
          password: formData.password,
          confirmPassword: formData.confirmPassword,
          status: 0
        })
      }

      ElMessage.success(isEdit.value ? '修改成功' : '新增成功')
      dialogVisible.value = false
      emit('success')
    } catch {
      // 请求错误由统一 HTTP 拦截器提示，失败时保留用户输入。
    } finally {
      submitting.value = false
    }
  }
</script>

<style scoped lang="scss">
  .dialog-intro {
    display: flex;
    gap: 14px;
    align-items: center;
    padding: 14px 16px;
    margin-bottom: 16px;
    background: var(--el-fill-color-light);
    border-radius: 10px;

    .intro-icon {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 42px;
      height: 42px;
      font-size: 22px;
      color: var(--el-color-primary);
      background: var(--el-color-primary-light-9);
      border-radius: 10px;
    }

    .intro-title {
      font-size: 15px;
      font-weight: 600;
      color: var(--el-text-color-primary);
    }

    .intro-description {
      margin-top: 3px;
      font-size: 12px;
      color: var(--el-text-color-secondary);
    }
  }

  .form-section {
    padding: 16px 18px 2px;
    margin-bottom: 14px;
    border: 1px solid var(--el-border-color-lighter);
    border-radius: 10px;
  }

  .profile-section {
    padding-bottom: 16px;
  }

  .login-section {
    margin-bottom: 0;
    background: var(--el-fill-color-extra-light);
  }

  .section-heading {
    display: flex;
    gap: 10px;
    align-items: center;
    margin-bottom: 14px;
  }

  .section-title {
    font-size: 14px;
    font-weight: 600;
    color: var(--el-text-color-primary);
  }

  .section-tip,
  .upload-tip {
    font-size: 12px;
    color: var(--el-text-color-secondary);
  }

  .avatar-row {
    display: flex;
    gap: 18px;
    align-items: center;
  }

  .avatar-preview {
    position: relative;
    width: 88px;
    height: 88px;
    overflow: hidden;
    cursor: pointer;
    background: var(--el-fill-color-lighter);
    border: 1px dashed var(--el-border-color);
    border-radius: 12px;
    transition: border-color 0.2s;

    &:hover {
      border-color: var(--el-color-primary);
    }

    :deep(.el-image) {
      width: 100%;
      height: 100%;
    }
  }

  .avatar-placeholder,
  .upload-mask {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 100%;
    height: 100%;
    font-size: 24px;
    color: var(--el-text-color-placeholder);
  }

  .upload-mask {
    position: absolute;
    inset: 0;
    color: #fff;
    background: rgb(0 0 0 / 45%);
  }

  .avatar-actions {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    align-items: center;

    .upload-tip {
      flex-basis: 100%;
    }
  }

  :deep(.el-form-item__label) {
    font-weight: 500;
  }
</style>
