<template>
  <ElDialog v-model="dialogVisible" title="批量续费" width="40%" align-center>
    <ElForm ref="formRef" :model="formData" :rules="rules" label-width="80px">
      <ElFormItem label="卡密列表" prop="carmines">
        <ElInput
          v-model="formData.carmines"
          :autosize="{ minRows: 8, maxRows: 8 }"
          type="textarea"
          placeholder="请输入需要充值的卡密，充值时不同卡密请换行,必须是有效才会充值成功"
        />
      </ElFormItem>
      <ElFormItem label="充值天数" prop="days">
        <ElInput
          v-model="formData.days"
          type="number"
          :min="0"
          :max="10"
          placeholder="请输入有效天数"
        />
      </ElFormItem>
      <ElFormItem label="续费人数" prop="maxNumber">
        <ElInput
          v-model="formData.maxNumber"
          type="number"
          :min="0"
          :max="5000"
          placeholder="请输入最大进人数"
        />
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
  import { renewCarmines } from '@/api/carmine'
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
  const formData = reactive<Api.CarmineMange.RenewCarmineParams>({
    days: 0,
    maxNumber: 0,
    carmines: ''
  })

  // 表单验证规则
  const rules: FormRules = {
    carmines: [{ required: true, message: '请输入卡密' }],
    days: [{ required: true, message: '请输入到期天数' }],
    maxNumber: [{ required: true, message: '请输入限制人数' }]
  }

  /**
   * 提交表单
   * 验证通过后触发提交事件
   */
  const handleSubmit = async () => {
    if (!formRef.value) return

    await formRef.value.validate(async (valid) => {
      if (valid) {
        const request: Api.CarmineMange.RenewCarmineParams = {
          carmines: formData.carmines
            .split(/\r?\n/)
            .map((carmine) => carmine.trim())
            .filter(Boolean)
            .join(','),
          days: formData.days,
          maxNumber: formData.maxNumber
        }

        await renewCarmines(request)
        ElMessage.success('续费成功')
        dialogVisible.value = false
        emit('submit')
      }
    })
  }
</script>
