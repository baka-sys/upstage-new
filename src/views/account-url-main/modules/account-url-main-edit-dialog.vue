<template>
  <ElDialog
    v-model="dialogVisible"
    title="编辑链接"
    width="540px"
    align-center
    destroy-on-close
    @closed="resetForm"
  >
    <ElForm ref="formRef" :model="formData" :rules="rules" label-position="top">
      <ElRow :gutter="16">
        <ElCol :span="12">
          <ElFormItem label="链接类型" prop="urlType">
            <ElSelect v-model="formData.urlType" placeholder="请选择链接类型" class="full-width">
              <ElOption
                v-for="option in URL_TYPE_OPTIONS"
                :key="option.value"
                :label="option.label"
                :value="option.value"
              />
            </ElSelect>
          </ElFormItem>
        </ElCol>
        <ElCol :span="12">
          <ElFormItem label="主备类型" prop="relationType">
            <ElSelect
              v-model="formData.relationType"
              placeholder="请选择主备类型"
              class="full-width"
            >
              <ElOption
                v-for="option in RELATION_TYPE_OPTIONS"
                :key="option.value"
                :label="option.label"
                :value="option.value"
              />
            </ElSelect>
          </ElFormItem>
        </ElCol>
      </ElRow>

      <ElFormItem label="访问地址" prop="mainVisitUrl">
        <ElInput v-model="formData.mainVisitUrl" placeholder="请输入完整访问地址" clearable />
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
  import { updateAccountUrlMain } from '@/api/account-url-main'
  import { RELATION_TYPE_OPTIONS, URL_TYPE_OPTIONS } from '../constants'

  interface Props {
    visible: boolean
    linkData?: Api.AccountUrlMainManage.AccountUrlMainListItem
  }

  interface Emits {
    (e: 'update:visible', value: boolean): void
    (e: 'success'): void
  }

  interface LinkForm {
    urlType?: Api.AccountUrlMainManage.UrlType
    relationType?: Api.AccountUrlMainManage.RelationType
    mainVisitUrl: string
  }

  const props = withDefaults(defineProps<Props>(), {
    linkData: undefined
  })
  const emit = defineEmits<Emits>()

  const dialogVisible = computed({
    get: () => props.visible,
    set: (value) => emit('update:visible', value)
  })

  const formRef = ref<FormInstance>()
  const submitting = ref(false)
  const formData = reactive<LinkForm>({
    urlType: undefined,
    relationType: undefined,
    mainVisitUrl: ''
  })

  const rules: FormRules<LinkForm> = {
    urlType: [{ required: true, message: '请选择链接类型', trigger: 'change' }],
    relationType: [{ required: true, message: '请选择主备类型', trigger: 'change' }],
    mainVisitUrl: [{ required: true, message: '请输入访问地址', trigger: 'blur' }]
  }

  const initializeForm = () => {
    formData.urlType = props.linkData?.urlType as Api.AccountUrlMainManage.UrlType | undefined
    formData.relationType = props.linkData?.relationType as
      | Api.AccountUrlMainManage.RelationType
      | undefined
    formData.mainVisitUrl = props.linkData?.mainVisitUrl || ''
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
    if (!valid) return
    if (props.linkData?.id == null || formData.urlType == null || formData.relationType == null) {
      ElMessage.error('链接信息不完整，无法保存')
      return
    }

    submitting.value = true
    try {
      await updateAccountUrlMain({
        id: props.linkData.id,
        urlType: formData.urlType,
        relationType: formData.relationType,
        mainVisitUrl: formData.mainVisitUrl.trim()
      })
      ElMessage.success('修改成功')
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
  .full-width {
    width: 100%;
  }
</style>
