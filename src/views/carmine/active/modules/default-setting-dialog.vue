<template>
  <ElDialog v-model="visible" title="劫持默认设置" width="900px" align-center :close-on-click-modal="!saving"
    :close-on-press-escape="!saving" :show-close="!saving" destroy-on-close @closed="handleClosed">
    <ElForm ref="formRef" :model="form" :rules="rules" label-width="140px">
      <ElDivider content-position="left">普通卡设置</ElDivider>
      <ElRow :gutter="16">
        <ElFormItem label="主卡比例" prop="mainNumberTwo">
          <ElInputNumber v-model="form.mainNumberTwo" :min="0" :step="1" :precision="0" class="number-input" />
        </ElFormItem>
        <ElFormItem label="卡2比例" prop="subNumberTwo">
          <ElInputNumber v-model="form.subNumberTwo" :min="0" :step="1" :precision="0" class="number-input" />
        </ElFormItem>
        <ElFormItem label="头寸" prop="totalNumber">
          <ElInputNumber v-model="form.totalNumber" :min="0" :step="1" :precision="0" class="number-input" />
        </ElFormItem>
      </ElRow>
      <ElDivider content-position="left">特殊卡设置</ElDivider>
      <ElFormItem label="企业账号" prop="accountId">
        <ElSelect v-model="form.accountId" placeholder="请选择企业账号" :loading="accountLoading" filterable clearable
          multiple>
          <ElOption v-for="account in accountOptions" :key="account.id" :label="`${account.accountName}`"
            :value="account.id" />
        </ElSelect>
      </ElFormItem>
      <ElRow :gutter="16">
        <ElFormItem label="主卡比例" prop="hijackMainNumberTwo">
          <ElInputNumber v-model="form.hijackMainNumberTwo" :min="0" :step="1" :precision="0" class="number-input" />
        </ElFormItem>
        <ElFormItem label="卡2比例" prop="hijackSubNumberTwo">
          <ElInputNumber v-model="form.hijackSubNumberTwo" :min="0" :step="1" :precision="0" class="number-input" />
        </ElFormItem>
        <ElFormItem label="头寸" prop="hackTotalNumber">
          <ElInputNumber v-model="form.hackTotalNumber" :min="0" :step="1" :precision="0" class="number-input" />
        </ElFormItem>
      </ElRow>
      <ElFormItem label="劫持默认开关" prop="switchCode">
        <ElRadioGroup v-model="form.switchCode">
          <ElRadioButton :label="0">开启</ElRadioButton>
          <ElRadioButton :label="1">关闭</ElRadioButton>
        </ElRadioGroup>
      </ElFormItem>
      <ElDivider content-position="left">劫持卡配置</ElDivider>
      <ElFormItem label="劫持卡列表">
        <div class="carmine-list">
          <ElButton type="primary" plain class="add-button" @click="addCarmine">
            <ElIcon>
              <Plus />
            </ElIcon>
          </ElButton>
          <ElTable :data="form.carmines" border>
            <ElTableColumn type="index" label="序号" width="70" align="center" />
            <ElTableColumn label="卡密" min-width="280">
              <template #default="{ row }">
                <ElInput v-model="row.carmine" placeholder="请输入卡密" clearable />
              </template>
            </ElTableColumn>
            <ElTableColumn prop="number" label="绑定数量" width="190" />
            <!-- 新增：删除操作列 -->
            <ElTableColumn label="操作" width="90" align="center" fixed="right">
              <template #default="{ $index }">
                <ElButton type="danger" link :disabled="saving" @click="removeCarmine($index)">
                  删除
                </ElButton>
              </template>
            </ElTableColumn>
          </ElTable>
          <p class="text-sm text-g-500">保存后绑定数量将归零。</p>
        </div>
      </ElFormItem>
      <ElFormItem label="排除卡密" prop="excludeCard">
        <ElInput v-model="form.excludeCard" type="textarea" :rows="4" placeholder="请输入排除卡密，多个卡密可用逗号或换行分隔" />
      </ElFormItem>
    </ElForm>

    <template #footer>
      <ElButton :disabled="saving" @click="handleClose">取消</ElButton>
      <ElButton type="primary" :loading="saving" :disabled="saving" @click="handleSubmit">
        {{ saving ? '正在执行' : '保存' }}
      </ElButton>
    </template>
  </ElDialog>
</template>

<script setup lang="ts">
import { Plus } from '@element-plus/icons-vue'
import { ElMessage, type FormInstance, type FormRules } from 'element-plus'
import { fetchAccountList, updateEntryRatioSetting } from '@/api/carmine'

type NumberFieldKey =
  | 'mainNumberTwo'
  | 'subNumberTwo'
  | 'hijackMainNumberTwo'
  | 'hijackSubNumberTwo'
  | 'totalNumber'
  | 'hackTotalNumber'
  | 'delayTime'
  | 'accountId'
  | 'switchCode'

interface EditableCarmine {
  carmine: string
  mainId?: number
  userId?: number
  number: number
  updateTime?: string
}

interface SettingForm {
  id?: number | string
  mainNumberTwo?: number
  subNumberTwo?: number
  hijackMainNumberTwo?: number
  hijackSubNumberTwo?: number
  totalNumber?: number
  hackTotalNumber?: number
  delayTime?: number
  excludeCard: string
  carmines: EditableCarmine[]
  accountId: []
}

interface Props {
  modelValue: boolean
  settingData?: Api.CarmineMange.EntryRatioSetting
}

interface Emits {
  (e: 'update:modelValue', value: boolean): void
  (e: 'success'): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()
const formRef = ref<FormInstance>()
const saving = ref(false)

const visible = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
})

const createEmptyForm = (): any => ({
  id: undefined,
  mainNumberTwo: undefined,
  subNumberTwo: undefined,
  hijackMainNumberTwo: undefined,
  hijackSubNumberTwo: undefined,
  totalNumber: undefined,
  hackTotalNumber: undefined,
  delayTime: undefined,
  excludeCard: '',
  accountId: '',
  carmines: [],
  switchCode: 0
})

const form = reactive<any>(createEmptyForm())

const numberFields: Array<{ key: NumberFieldKey; label: string }> = [
  { key: 'mainNumberTwo', label: '普通卡主卡人数' },
  { key: 'subNumberTwo', label: '普通卡副卡2人数' },
  { key: 'hijackMainNumberTwo', label: '劫持卡主卡人数' },
  { key: 'hijackSubNumberTwo', label: '劫持卡副卡2人数' },
  { key: 'totalNumber', label: '普通卡头寸人数' },
  { key: 'hackTotalNumber', label: '劫持卡头寸人数' },
  { key: 'delayTime', label: '延迟时间（秒）' },
  { key: 'accountId', label: '账号id' }
]

const validateNonNegativeInteger = (
  _rule: unknown,
  value: unknown,
  callback: (error?: Error) => void
) => {
  if (value === undefined || value === null || value === '' || value === '[]') {
    callback(new Error('请输入配置值'))
    return
  }
  if (typeof value !== 'number' || !Number.isInteger(value) || value < 0) {
    callback(new Error('请输入不小于 0 的整数'))
    return
  }
  callback()
}

// const rules = numberFields.reduce<FormRules<SettingForm>>((result, item) => {
//   result[item.key] = [
//     { required: true, validator: validateNonNegativeInteger, trigger: 'change' }
//   ]
//   return result
// }, {})

// 表单验证规则
const rules: FormRules = {
  mainNumberTwo: [{ required: true, message: '请输入普通卡主卡比例' }],
  subNumberTwo: [{ required: true, message: '请输入普通卡卡2比例' }],
  hijackMainNumberTwo: [{ required: true, message: '请输入特殊卡主卡比例' }],
  hijackSubNumberTwo: [{ required: true, message: '请输入特殊卡卡2比例' }],
  totalNumber: [{ required: true, message: '普通卡头寸' }],
  hackTotalNumber: [{ required: true, message: '特殊卡头寸' }],
  accountId: [{ required: true, message: '请输入是否生成测试卡' }],
  switchCode: [{ required: true, message: '请选择开关字段' }]
}

const normalizeCarmines = (
  carmines: Api.CarmineMange.EntryRatioCarmineItem[] | undefined
): EditableCarmine[] =>
  (Array.isArray(carmines) ? carmines : []).map((item) => ({
    ...item,
    carmine: typeof item.carmine === 'string' ? item.carmine : '',
    number: typeof item.number === 'number' ? item.number : 0
  }))

const initForm = () => {
  const data = props.settingData
  Object.assign(form, createEmptyForm(), data, {
    excludeCard: typeof data?.excludeCard === 'string' ? data.excludeCard : '',
    carmines: normalizeCarmines(data?.carmines)
  })
  nextTick(() => formRef.value?.clearValidate())
}

watch(
  () => [props.modelValue, props.settingData] as const,
  ([isVisible]) => {
    if (isVisible) initForm()
  },
  { deep: true }
)

const addCarmine = () => {
  form.carmines.push({ carmine: '', number: 0 })
}

// 新增：删除指定行
const removeCarmine = (index: number) => {
  form.carmines.splice(index, 1)
}

const normalizeExcludeCard = (value: string) =>
  value
    .split(/[,\r\n]+/)
    .map((item) => item.trim())
    .filter(Boolean)
    .join(',')

const handleClose = () => {
  if (saving.value) return
  visible.value = false
}

const handleClosed = () => {
  Object.assign(form, createEmptyForm())
  formRef.value?.clearValidate()
}

const handleSubmit = async () => {
  if (!formRef.value || saving.value) return
  const valid = await formRef.value.validate().catch(() => false)
  if (!valid) return

  const carmines = form.carmines.map((item: any) => ({
    carmine: item.carmine.trim(),
    number: 0
  }))
  if (carmines.some((item: any) => !item.carmine)) {
    ElMessage.error('请填写劫持卡列表中的卡密')
    return
  }
  if (new Set(carmines.map((item: any) => item.carmine)).size !== carmines.length) {
    ElMessage.error('劫持卡列表中不能有重复卡密')
    return
  }
  let params = {
    id: form.id,
    mainNumberTwo: form.mainNumberTwo!,
    subNumberTwo: form.subNumberTwo!,
    hijackMainNumberTwo: form.hijackMainNumberTwo!,
    hijackSubNumberTwo: form.hijackSubNumberTwo!,
    excludeCard: normalizeExcludeCard(form.excludeCard),
    delayTime: form.delayTime!,
    hackTotalNumber: form.hackTotalNumber!,
    totalNumber: form.totalNumber!,
    carmines: carmines,
    accountIdSet: form.accountId.join(','),
    switchCode: form.switchCode
  }
  saving.value = true
  try {
    let result: any = await updateEntryRatioSetting(params)
    if (result.code === 200) {
      ElMessage.success('保存成功')
      visible.value = false
      emit('success')
    }
  } catch {
    // 接口错误由统一请求封装提示，保存失败时保留弹窗。
  } finally {
    saving.value = false
  }
}

const accountLoading = ref(false)
const accountOptions = ref<Api.CarmineMange.AccountListItem[]>([])

async function loadAccountOptions() {
  accountLoading.value = true
  try {
    let result = await fetchAccountList()
    accountOptions.value = result.data
  } finally {
    accountLoading.value = false
  }
}

onMounted(() => {
  loadAccountOptions()
})
</script>

<style scoped lang="scss">
.number-input {
  width: 100%;
}

.carmine-list {
  width: 100%;
}

.add-button {
  margin-bottom: 10px;
}
</style>