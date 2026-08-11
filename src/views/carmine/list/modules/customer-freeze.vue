<template>
  <ElDialog v-model="dialogVisible" title="批量冻结" width="40%" align-center>
    <ElForm ref="formRef" :model="formData" :rules="rules" label-width="80px">
      <ElFormItem label="卡密列表" prop="carmines">
        <ElInput v-model="formData.carmines" :autosize="{ minRows: 8, maxRows: 8 }" type="textarea" placeholder="请输入需要冻结的卡密，冻结时不同卡密请换行,必须是有效才会冻结成功" />
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
import { batchFreezeCarmineApi} from '@/api/customer'
import type { FormInstance, FormRules } from 'element-plus'

interface Props {
  visible: boolean
}

interface Emits {
  (e: 'update:visible', value: boolean): void
  (e: 'submit'): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

// 角色列表数据
// const roleList = ref(ROLE_LIST_DATA)

// 对话框显示控制
const dialogVisible = computed({
  get: () => props.visible,
  set: (value) => emit('update:visible', value)
})

// const dialogType = computed(() => props.type)

// 表单实例
const formRef = ref<FormInstance>()

// 表单数据
const formData = reactive({
  days: 0,
  maxNumber: 0,
  carmines: ""
})

// 表单验证规则
const rules: FormRules = {
  carmines: [{ required: true, message: '请输入卡密'}],
  // days: [{ required: true, message: '请输入到期天数', }],
  // maxNumber: [{ required: true, message: '请输入限制人数', }]
}

/**
 * 初始化表单数据
 * 根据对话框类型（新增/编辑）填充表单
 */
const initFormData = () => {
  // const isEdit = props.type === 'edit' && props.userData
  // const row = props.userData

//   Object.assign(formData, {
//     username: isEdit && row ? row.userName || '' : '',
//     phone: isEdit && row ? row.userPhone || '' : '',
//     gender: isEdit && row ? row.userGender || '男' : '男',
//     role: isEdit && row ? (Array.isArray(row.userRoles) ? row.userRoles : []) : []
//   })
}

/**
 * 监听对话框状态变化
 * 当对话框打开时初始化表单数据并清除验证状态
 */
// watch(
//   () => [props.visible, props.type, props.userData],
//   ([visible]) => {
//     if (visible) {
//       initFormData()
//       nextTick(() => {
//         formRef.value?.clearValidate()
//       })
//     }
//   },
//   { immediate: true }
// )

/**
 * 提交表单
 * 验证通过后触发提交事件
 */
const handleSubmit = async () => {
  if (!formRef.value) return

  await formRef.value.validate(async (valid) => {
    if (valid) {

      let request = {
						carmines: formData.carmines.split(/[(\r\n)\r\n]+/).join(','),
						// days: formData.days,
						// maxNumber: formData.maxNumber
			}

      let result = await batchFreezeCarmineApi(request)

      if(result.code === 200){
        ElMessage.success("续费成功")
        dialogVisible.value = false
        emit('submit')
      }
      
      // if(result.code === 200){
      //   ElMessage.success("生成成功")
      //   dialogVisible.value = false
      //   emit('submit')
      // }
    }
  })
}
</script>
