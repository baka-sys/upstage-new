<template>
  <ElDialog v-model="dialogVisible" title="批量冻结" width="40%" align-center>
    <ElForm ref="formRef" :model="formData" :rules="rules" label-width="80px">
      <ElFormItem label="卡密列表" prop="carmines">
        <ElInput
          v-model="formData.carmines"
          :autosize="{ minRows: 8, maxRows: 8 }"
          type="textarea"
          placeholder="请输入需要冻结的卡密，冻结时不同卡密请换行,必须是有效才会冻结成功"
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
  import { freezeCarmines } from '@/api/carmine'
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
  const formData = reactive<Api.CarmineMange.FreezeCarmineParams>({
    carmines: ''
  })

  // 表单验证规则
  const rules: FormRules = {
    carmines: [{ required: true, message: '请输入卡密' }]
  }

  /**
   * 提交表单
   * 验证通过后触发提交事件
   */
  const handleSubmit = async () => {
    if (!formRef.value) return

    await formRef.value.validate(async (valid) => {
      if (valid) {
        const request: Api.CarmineMange.FreezeCarmineParams = {
          carmines: formData.carmines
            .split(/\r?\n/)
            .map((carmine) => carmine.trim())
            .filter(Boolean)
            .join(',')
        }

        await freezeCarmines(request)
        ElMessage.success('禁用成功')
        dialogVisible.value = false
        emit('submit')
      }
    })
  }
</script>
