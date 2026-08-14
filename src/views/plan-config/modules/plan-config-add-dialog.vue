<template>
  <ElDialog
    v-model="dialogVisible"
    :title="dialogTitle"
    width="1100px"
    align-center
    destroy-on-close
    @closed="resetForm"
  >
    <ElForm ref="formRef" :model="formData" :rules="rules" label-width="130px">
      <ElFormItem label="方案标题" prop="title">
        <ElInput
          v-model="formData.title"
          placeholder="请输入方案标题"
          maxlength="50"
          show-word-limit
          clearable
        />
      </ElFormItem>

      <ElFormItem label="问答验证码背景" prop="img">
        <!-- TODO: 等待后端提供通用图片上传接口后，替换为项目图片上传组件。 -->
        <ElInput v-model="formData.img" placeholder="请输入背景图片地址" clearable />
        <div class="form-tip">暂未提供图片上传接口，请先填写图片地址</div>
      </ElFormItem>

      <ElFormItem label="问答列表">
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
                      placeholder="请输入问答选项，如：选项A,选项B"
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
            </ElTable>
          </VueDraggable>
        </div>
      </ElFormItem>
    </ElForm>

    <template #footer>
      <ElButton :disabled="submitting" @click="dialogVisible = false">取消</ElButton>
      <ElButton type="primary" :loading="submitting" @click="handleSubmit">保存</ElButton>
    </template>
  </ElDialog>
</template>

<script setup lang="ts">
  import { Plus, Rank } from '@element-plus/icons-vue'
  import type { FormInstance, FormItemRule, FormRules } from 'element-plus'
  import { VueDraggable } from 'vue-draggable-plus'
  import { addPlanConfig, updatePlanConfig } from '@/api/plan-config'

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
    /** TODO: 待后端确认 content 中“不通过提示”的字段名是否为 failPrompt。 */
    failPrompt: string
  }

  interface PlanConfigAddForm {
    title: string
    img: string
    content: string
    status: Api.PlanConfigManage.PlanStatus
    questionList: QuestionItem[]
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
    questionList: []
  })

  const formRef = ref<FormInstance>()
  const submitting = ref(false)
  const formData = reactive<PlanConfigAddForm>(createEmptyForm())

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
    img: [{ validator: validateRequiredText('请输入背景图片地址'), trigger: 'blur' }],
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
      // TODO: 如果后端 content 后续改为非 JSON 数组格式，需要同步调整解析逻辑。
      return []
    }
  }

  const initializeForm = () => {
    const planData = props.planData
    Object.assign(formData, createEmptyForm(), {
      title: isEdit.value ? planData?.title || '' : '',
      img: isEdit.value ? planData?.img || '' : '',
      content: isEdit.value ? planData?.content || '' : '',
      status:
        isEdit.value && (planData?.status === 0 || planData?.status === 1) ? planData.status : 0,
      questionList: isEdit.value ? parseQuestionList(planData?.content) : []
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

  const addQuestion = () => {
    formData.questionList.push({
      questionTitle: '',
      options: '',
      answer: '',
      failPrompt: ''
    })
  }

  const normalizeQuestionList = (): QuestionItem[] =>
    formData.questionList.map((item) => ({
      questionTitle: item.questionTitle.trim(),
      options: item.options.trim(),
      answer: item.answer.trim(),
      failPrompt: item.failPrompt.trim()
    }))

  const handleSubmit = async () => {
    if (!formRef.value || submitting.value) return

    const valid = await formRef.value.validate().catch(() => false)
    if (!valid || formData.status == null) return

    // TODO: 待后端确认问答列表是否至少需要一条，以及 options/answer 的最终数据格式。
    const questionList = normalizeQuestionList()
    formData.content = JSON.stringify(questionList)

    submitting.value = true
    try {
      const params: Api.PlanConfigManage.AddPlanConfigParams = {
        title: formData.title.trim(),
        img: formData.img.trim(),
        content: formData.content,
        status: formData.status
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
      // 请求错误由统一 HTTP 拦截器提示；失败时保留弹窗和用户输入。
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
