<template>
    <ElDialog v-model="visible" title="开/关劫持" width="900px" align-center :close-on-click-modal="!saving"
        :close-on-press-escape="!saving" :show-close="!saving" destroy-on-close @closed="handleClosed">
        <ElForm ref="formRef" :model="form" :rules="rules" label-width="140px">
            <ElFormItem label="企业账号" prop="accountId">
                <ElSelect v-model="form.accountId" placeholder="请选择企业账号" :loading="accountLoading" filterable clearable
                    multiple>
                    <ElOption label="普通卡" :value="0" />
                    <ElOption v-for="account in accountOptions" :key="account.id" :label="`${account.accountName}`"
                        :value="account.id" />
                </ElSelect>
            </ElFormItem>
            <ElFormItem label="劫持开关" prop="switchCode">
                <ElRadioGroup v-model="form.switchCode">
                    <ElRadioButton :label="0">开启</ElRadioButton>
                    <ElRadioButton :label="1">关闭</ElRadioButton>
                </ElRadioGroup>
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
import { ElMessage, type FormInstance, type FormRules } from 'element-plus'
import { fetchAccountList, synchronizeEntryRatioConfiguration, updateAllEntryRatioStatus, updateEntryRatioSetting } from '@/api/carmine'

interface Props {
    modelValue: boolean
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
    accountId: [],
    switchCode: 0
})

const form = reactive<any>(createEmptyForm())


// 表单验证规则
const rules: FormRules = {
    accountId: [{ required: true, message: '请输入是否生成测试卡' }],
}


const initForm = () => {
    form.accountId = []
    nextTick(() => formRef.value?.clearValidate())
}

watch(
    () => [props.modelValue] as const,
    ([isVisible]) => {
        if (isVisible) initForm()
    },
    { deep: true }
)

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
    let params = {
        accountIdSetString: form.accountId.join(','),
        switchCode: form.switchCode
    }
    saving.value = true
    try {
        let result: any = await updateAllEntryRatioStatus(params)
        if (result.code === 200) {
            ElMessage.success('任务已提交，等待执行')
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