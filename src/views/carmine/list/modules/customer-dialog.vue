<template>
  <ElDialog v-model="dialogVisible" title="批量生成卡密" width="40%" align-center>
    <ElForm ref="formRef" :model="formData" :rules="rules" label-width="80px">
      <ElFormItem label="卡密张数" prop="lines">
        <ElInput v-model="formData.lines" type="number" :min="0" :max="100" placeholder="请输入卡密张数" />
      </ElFormItem>
      <ElFormItem label="卡密前缀" prop="prefixString">
        <ElInput v-model="formData.prefixString" type="text" placeholder="请输入卡密前缀" />
      </ElFormItem>
      <ElFormItem label="有效天数" prop="days">
        <ElInput v-model="formData.days" type="number" :min="0" :max="10" placeholder="请输入有效天数" />
      </ElFormItem>
      <ElFormItem label="人数限制" prop="maxNumber">
        <ElInput v-model="formData.maxNumber" type="number" :min="0" :max="5000" placeholder="请输入最大进人数" />
      </ElFormItem>
      <ElFormItem label="测试卡" prop="testCard">
        <ElRadioGroup v-model="formData.testCard">
          <ElRadioButton :label="0">否</ElRadioButton>
          <ElRadioButton :label="1">是</ElRadioButton>
        </ElRadioGroup>
      </ElFormItem>
      <ElFormItem label="劫持类型" prop="isSearch">
        <ElRadioGroup v-model="formData.isSearch">
          <ElRadioButton :label="1">普通卡</ElRadioButton>
          <ElRadioButton :label="2">劫持卡</ElRadioButton>
        </ElRadioGroup>
      </ElFormItem>
      <ElFormItem label="引流类型" prop="qrcodeSwitch">
        <ElSelect v-model="formData.qrcodeSwitch">
          <ElOption label="全网" :value="0" />
          <ElOption label="浏览器" :value="1" />
          <ElOption label="微信" :value="2" />
          <ElOption label="QQ" :value="3" />
          <ElOption label="抖音" :value="4" />
        </ElSelect>
      </ElFormItem>
    </ElForm>
    <template #footer>
      <div class="dialog-footer">
        <ElButton @click="dialogVisible = false">取消</ElButton>
        <ElButton type="primary" @click="handleSubmit">提交</ElButton>
      </div>
    </template>
  </ElDialog>
</template>

<script setup lang="ts">
import { generateCardApi } from '@/api/customer'
import { ROLE_LIST_DATA } from '@/mock/temp/formData'
import type { FormInstance, FormRules } from 'element-plus'

interface Props {
  visible: boolean
  type: string
  userData?: Partial<Api.SystemManage.UserListItem>
}

interface Emits {
  (e: 'update:visible', value: boolean): void
  (e: 'submit'): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

// 角色列表数据
const roleList = ref(ROLE_LIST_DATA)

// 对话框显示控制
const dialogVisible = computed({
  get: () => props.visible,
  set: (value) => emit('update:visible', value)
})

const dialogType = computed(() => props.type)

// 表单实例
const formRef = ref<FormInstance>()

// 表单数据
const formData = reactive({
  lines: 0,
  days: 0,
  testCard: 0,
  maxNumber: 0,
  qrcodeSwitch: undefined,
  isSearch: 1,
  prefixString: ""
})

// 表单验证规则
const rules: FormRules = {
  prefixString: [{ required: true, message: '请输入卡密前缀'}],
  qrcodeSwitch: [{ required: true, message: '请输入生成条数', trigger:"chage"}],
  lines: [{ required: true, message: '请输入生成条数', }],
  days: [{ required: true, message: '请输入到期天数', }],
  maxNumber: [{ required: true, message: '请输入限制人数', }],
  testCard: [{ required: true, message: '请输入是否生成测试卡' }],
  isSearch: [{ required: true, message: '请输入劫持类型', trigger: 'change' }],
  // password: [{ required: true, message: '请输入密码' }],
}

/**
 * 初始化表单数据
 * 根据对话框类型（新增/编辑）填充表单
 */
const initFormData = () => {
  const isEdit = props.type === 'edit' && props.userData
  const row = props.userData

  Object.assign(formData, {
    username: isEdit && row ? row.userName || '' : '',
    phone: isEdit && row ? row.userPhone || '' : '',
    gender: isEdit && row ? row.userGender || '男' : '男',
    role: isEdit && row ? (Array.isArray(row.userRoles) ? row.userRoles : []) : []
  })
}

/**
 * 监听对话框状态变化
 * 当对话框打开时初始化表单数据并清除验证状态
 */
watch(
  () => [props.visible, props.type, props.userData],
  ([visible]) => {
    if (visible) {
      initFormData()
      nextTick(() => {
        formRef.value?.clearValidate()
      })
    }
  },
  { immediate: true }
)

/**
 * 提交表单
 * 验证通过后触发提交事件
 */
const handleSubmit = async () => {
  if (!formRef.value) return

  await formRef.value.validate(async (valid) => {
    if (valid) {
      let result:any = await generateCardApi(formData)
      console.error(result)
      const url = window.URL.createObjectURL(new Blob([result]))
      const link = document.createElement('a')
      link.href = url;
      link.setAttribute('download', '卡密列表.txt') // 设置下载文件的名称
      document.body.appendChild(link)
      link.click();
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)
      ElMessage.success("生成成功")
      dialogVisible.value = false
      emit('submit')
      // if(result.code === 200){
      //   ElMessage.success("生成成功")
      //   dialogVisible.value = false
      //   emit('submit')
      // }
    }
  })
}
</script>
