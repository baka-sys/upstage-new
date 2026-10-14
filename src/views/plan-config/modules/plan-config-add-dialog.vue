<template>
  <ElDialog
    v-model="dialogVisible"
    :title="dialogTitle"
    width="1100px"
    align-center
    destroy-on-close
    :close-on-click-modal="!submitting && !uploading"
    :close-on-press-escape="!submitting && !uploading"
    :show-close="!submitting && !uploading"
    @closed="resetForm"
  >
    <ElForm
      ref="formRef"
      :model="formData"
      :rules="rules"
      :disabled="submitting || uploading"
      label-width="130px"
    >
      <ElFormItem label="方案标题" prop="title">
        <ElInput
          v-model="formData.title"
          placeholder="请输入方案标题"
          maxlength="50"
          show-word-limit
          clearable
        />
      </ElFormItem>

      <ElFormItem label="方案类型" prop="type">
        <ElRadioGroup v-model="formData.type">
          <ElRadio :value="0">验证码</ElRadio>
          <ElRadio :value="2">问答</ElRadio>
        </ElRadioGroup>
      </ElFormItem>

      <ElFormItem label="页面背景" prop="img">
        <div class="background-upload">
          <ElImage
            v-if="formData.img"
            class="background-preview"
            :src="backgroundPreviewUrl"
            :preview-src-list="[backgroundPreviewUrl]"
            preview-teleported
            fit="contain"
          />
          <ElUpload
            accept="image/png,image/jpeg,image/gif,image/bmp"
            :show-file-list="false"
            :before-upload="beforeBackgroundUpload"
            :http-request="handleBackgroundUpload"
            :disabled="submitting || uploading"
          >
            <ElButton type="primary" :loading="uploading" :disabled="submitting || uploading">
              {{ formData.img ? '更换背景' : '上传背景' }}
            </ElButton>
          </ElUpload>
          <div class="form-tip">支持 PNG、JPG、GIF、BMP，不超过 5MB</div>
        </div>
      </ElFormItem>

      <ElFormItem v-if="formData.type === 2" label="问答列表" prop="questionList">
        <div class="question-list">
          <ElButton type="primary" plain :icon="Plus" class="add-row-button" @click="addQuestion">
            添加问答
          </ElButton>

          <VueDraggable
            v-model="formData.questionList"
            target=".el-table__body-wrapper tbody"
            handle=".drag-handle"
            :animation="150"
          >
            <ElTable :data="formData.questionList" border>
              <ElTableColumn type="index" label="序号" width="70" align="center" />
              <ElTableColumn label="排序" width="70" align="center">
                <template #default>
                  <ElIcon class="drag-handle"><Rank /></ElIcon>
                </template>
              </ElTableColumn>
              <ElTableColumn label="问答标题" min-width="200">
                <template #default="{ row, $index }">
                  <ElFormItem
                    :prop="`questionList.${$index}.questionTitle`"
                    :rules="questionFieldRules.questionTitle"
                    class="table-form-item"
                  >
                    <ElInput
                      v-model="row.questionTitle"
                      placeholder="请输入问答标题"
                      maxlength="50"
                      show-word-limit
                      clearable
                    />
                  </ElFormItem>
                </template>
              </ElTableColumn>
              <ElTableColumn label="问答选项" min-width="240">
                <template #default="{ row, $index }">
                  <ElFormItem
                    :prop="`questionList.${$index}.options`"
                    :rules="questionFieldRules.options"
                    class="table-form-item"
                  >
                    <ElInput
                      v-model="row.options"
                      type="textarea"
                      :rows="2"
                      placeholder="请输入问答选项，如：选项A+选项B"
                    />
                  </ElFormItem>
                </template>
              </ElTableColumn>
              <ElTableColumn label="问答答案" min-width="180">
                <template #default="{ row, $index }">
                  <ElFormItem
                    :prop="`questionList.${$index}.answer`"
                    :rules="questionFieldRules.answer"
                    class="table-form-item"
                  >
                    <ElInput v-model="row.answer" placeholder="请输入问答答案" clearable />
                  </ElFormItem>
                </template>
              </ElTableColumn>
              <ElTableColumn label="不通过提示" min-width="220">
                <template #default="{ row, $index }">
                  <ElFormItem
                    :prop="`questionList.${$index}.failPrompt`"
                    :rules="questionFieldRules.failPrompt"
                    class="table-form-item"
                  >
                    <ElInput
                      v-model="row.failPrompt"
                      type="textarea"
                      :rows="2"
                      placeholder="请输入不通过提示"
                    />
                  </ElFormItem>
                </template>
              </ElTableColumn>
              <ElTableColumn label="操作" width="90" align="center">
                <template #default="{ $index }">
                  <ElButton type="danger" link @click="removeQuestion($index)">删除</ElButton>
                </template>
              </ElTableColumn>
            </ElTable>
          </VueDraggable>
        </div>
      </ElFormItem>
    </ElForm>

    <template #footer>
      <ElButton :disabled="submitting || uploading" @click="dialogVisible = false">取消</ElButton>
      <ElButton
        type="primary"
        :loading="submitting"
        :disabled="submitting || uploading"
        @click="handleSubmit"
      >
        {{ submitting ? '正在执行' : '保存' }}
      </ElButton>
    </template>
  </ElDialog>
</template>

<script setup lang="ts">
  import { Plus, Rank } from '@element-plus/icons-vue'
  import type {
    FormInstance,
    FormItemRule,
    FormRules,
    UploadRawFile,
    UploadRequestOptions
  } from 'element-plus'
  import { VueDraggable } from 'vue-draggable-plus'
  import {
    addPlanConfig,
    updatePlanConfig,
    uploadPlanConfigBackground,
    getUploadUrl
  } from '@/api/plan-config'

  interface Props {
    visible: boolean
    mode?: 'add' | 'edit'
    planData?: Api.PlanConfigManage.PlanConfigPageListItem
  }

  interface Emits {
    (e: 'update:visible', value: boolean): void
    (e: 'success'): void
  }

  interface QuestionItem {
    questionTitle: string
    options: string
    answer: string
    failPrompt: string
  }

  interface PlanConfigAddForm {
    title: string
    img: string
    content: string
    status: number
    type: number
    questionList: []
  }

  const props = withDefaults(defineProps<Props>(), {
    mode: 'add',
    planData: undefined
  })
  const emit = defineEmits<Emits>()

  const isEdit = computed(() => props.mode === 'edit')
  const dialogTitle = computed(() => (isEdit.value ? '编辑方案' : '新增方案'))

  const dialogVisible = computed({
    get: () => props.visible,
    set: (value) => emit('update:visible', value)
  })

  const createEmptyForm = (): PlanConfigAddForm => ({
    title: '',
    img: '',
    content: '',
    status: 0,
    type: 0,
    questionList: []
  })

  const formRef = ref<FormInstance>()
  const submitting = ref(false)
  const uploading = ref(false)
  const uploadUrl = ref('')
  const backgroundPreviewUrl = ref('')
  const formData = reactive<any>(createEmptyForm())

  const validateRequiredText =
    (message: string): FormItemRule['validator'] =>
    (_rule, value, callback) => {
      if (typeof value !== 'string' || !value.trim()) {
        callback(new Error(message))
        return
      }
      callback()
    }

  const rules: FormRules<PlanConfigAddForm> = {
    title: [
      { validator: validateRequiredText('请输入方案标题'), trigger: 'blur' },
      { max: 50, message: '方案标题最多 50 字', trigger: 'blur' }
    ],
    type: [{ required: true, message: '请选择方案类型', trigger: 'change' }],
    img: [
      {
        validator: (_rule, value, callback) => {
          if (formData.type === 0 && (typeof value !== 'string' || !value.trim())) {
            callback(new Error('请上传验证码背景'))
            return
          }
          callback()
        },
        trigger: 'change'
      }
    ],
    questionList: [
      {
        validator: (_rule, value, callback) => {
          if (formData.type === 1 && (!Array.isArray(value) || value.length === 0)) {
            callback(new Error('请至少添加一条问答'))
            return
          }
          callback()
        },
        trigger: 'change'
      }
    ],
    status: [{ required: true, message: '请选择状态', trigger: 'change' }]
  }

  const questionFieldRules: Record<keyof QuestionItem, FormItemRule[]> = {
    questionTitle: [
      { validator: validateRequiredText('请输入问答标题'), trigger: 'blur' },
      { max: 50, message: '问答标题最多 50 字', trigger: 'blur' }
    ],
    options: [{ validator: validateRequiredText('请输入问答选项'), trigger: 'blur' }],
    answer: [{ validator: validateRequiredText('请输入问答答案'), trigger: 'blur' }],
    failPrompt: [{ validator: validateRequiredText('请输入不通过提示'), trigger: 'blur' }]
  }

  const parseQuestionList = (content?: string): QuestionItem[] => {
    if (!content) return []

    try {
      const questionList = JSON.parse(content)
      if (!Array.isArray(questionList)) return []

      return questionList.map((item) => ({
        questionTitle: typeof item?.questionTitle === 'string' ? item.questionTitle : '',
        options: typeof item?.options === 'string' ? item.options : '',
        answer: typeof item?.answer === 'string' ? item.answer : '',
        failPrompt: typeof item?.failPrompt === 'string' ? item.failPrompt : ''
      }))
    } catch {
      return []
    }
  }

  // 拼接图片地址：img 已是完整 URL 就直接用，否则拼 uploadUrl
  const buildBackgroundUrl = (img?: string) => {
    if (!img) return ''
    if (/^(https?:)?\/\//i.test(img)) return img
    return uploadUrl.value.replace(/\/+$/, '') + '/' + img.replace(/^\/+/, '')
  }

  const initializeForm = async () => {
    const planData = props.planData
    Object.assign(formData, createEmptyForm(), {
      title: isEdit.value ? planData?.title || '' : '',
      img: planData?.img,
      content: isEdit.value ? planData?.content || '' : '',
      status:
        isEdit.value && (planData?.status === 0 || planData?.status === 1) ? planData.status : 0,
      type: planData?.type,
      questionList: isEdit.value ? parseQuestionList(planData?.content) : []
    })

    const result = await getUploadUrl()
    if (result?.code === 200) {
      uploadUrl.value = result.data?.value ?? ''
    }

    submitting.value = false
    uploading.value = false
    backgroundPreviewUrl.value = uploadUrl.value + formData.img
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

  const addQuestion = () => {
    formData.questionList.push({
      questionTitle: '',
      options: '',
      answer: '',
      failPrompt: ''
    })
  }

  const removeQuestion = (index: number) => {
    formData.questionList.splice(index, 1)
    nextTick(() => formRef.value?.clearValidate())
  }

  watch(
    () => formData.type,
    () => nextTick(() => formRef.value?.clearValidate())
  )

  const beforeBackgroundUpload = (file: UploadRawFile) => {
    if (!['image/png', 'image/jpeg', 'image/gif', 'image/bmp'].includes(file.type)) {
      ElMessage.error('仅支持 PNG、JPG、GIF、BMP 图片')
      return false
    }
    if (file.size > 5 * 1024 * 1024) {
      ElMessage.error('图片大小不能超过 5MB')
      return false
    }
    return true
  }

  const handleBackgroundUpload = async (options: UploadRequestOptions) => {
    if (submitting.value || uploading.value) return
    uploading.value = true
    try {
      const result = await uploadPlanConfigBackground(uploadUrl.value, options.file)
      if (!result?.filePath) throw new Error('上传接口未返回图片地址')

      formData.img = result.filePath
      backgroundPreviewUrl.value = uploadUrl.value + formData.img
      formRef.value?.clearValidate('img')
      options.onSuccess(result)
      ElMessage.success('验证码背景上传成功')
    } catch (error) {
      options.onError(error as Parameters<UploadRequestOptions['onError']>[0])
      ElMessage.error(error instanceof Error ? error.message : '背景上传失败')
    } finally {
      uploading.value = false
    }
  }

  const normalizeQuestionList = (): any =>
    formData.questionList.map((item:any) => ({
      questionTitle: item.questionTitle.trim(),
      options: item.options.trim(),
      answer: item.answer.trim(),
      failPrompt: item.failPrompt.trim()
    }))

  const handleSubmit = async () => {
    if (!formRef.value || submitting.value || uploading.value) return

    const valid = await formRef.value.validate().catch(() => false)
    if (!valid || formData.status == null || submitting.value || uploading.value) return

    const questionList = formData.type === 2 ? normalizeQuestionList() : []
    formData.content = formData.type === 2 ? JSON.stringify(questionList) : ''

    submitting.value = true
    try {
      const params: Api.PlanConfigManage.AddPlanConfigParams = {
        title: formData.title.trim(),
        img: formData.img.trim(),
        content: formData.content,
        status: formData.status,
        type: formData.type
      }

      if (isEdit.value) {
        if (props.planData?.id == null) {
          ElMessage.error('方案 id 为空，无法保存')
          return
        }
        await updatePlanConfig({ ...params, id: props.planData.id })
      } else {
        await addPlanConfig(params)
      }

      ElMessage.success(isEdit.value ? '修改成功' : '添加成功')
      dialogVisible.value = false
      emit('success')
    } catch {
      // 请求错误由统一 HTTP 拦截器提示
    } finally {
      submitting.value = false
    }
  }
</script>

<style scoped lang="scss">
  .form-tip {
    margin-top: 4px;
    font-size: 12px;
    line-height: 20px;
    color: var(--el-text-color-secondary);
  }

  .background-upload {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
  }

  .background-preview {
    width: 240px;
    height: 140px;
    border: 1px solid var(--el-border-color);
    border-radius: 6px;
  }

  .question-list {
    width: 100%;
  }

  .add-row-button {
    margin-bottom: 10px;
  }

  .table-form-item {
    margin-bottom: 0;
  }

  .drag-handle {
    color: var(--el-text-color-secondary);
    cursor: move;
  }
</style>