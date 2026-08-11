<template>
  <ArtSearchBar ref="searchBarRef" v-model="formData" :items="formItems" :rules="rules" @reset="handleReset"
    @search="handleSearch">
  </ArtSearchBar>
</template>

<script setup lang="ts">
interface Props {
  modelValue: Api.SystemManage.UserSearchParams
}
interface Emits {
  (e: 'update:modelValue', value: Api.SystemManage.UserSearchParams): void
  (e: 'search', params: Api.SystemManage.UserSearchParams): void
  (e: 'reset'): void
}
const props = defineProps<Props>()
const emit = defineEmits<Emits>()

// 表单数据双向绑定
const searchBarRef = ref()
const formData = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val)
})

// 校验规则
const rules = {
  // userName: [{ required: true, message: '请输入用户名', trigger: 'blur' }]
}

// 动态 options
const statusOptions = ref<{ label: string; value: string; disabled?: boolean }[]>([])

// 模拟接口返回状态数据
// function fetchStatusOptions(): Promise<typeof statusOptions.value> {
//   return new Promise((resolve) => {
//     setTimeout(() => {
//       resolve([
//         { label: '启用', value: '0' },
//         { label: '禁用', value: '1' },
//       ])
//     }, 1000)
//   })
// }

onMounted(async () => {
  // statusOptions.value = await fetchStatusOptions()
})

// 表单配置
const formItems = computed(() => [
  {
    label: '用户名',
    key: 'userName',
    type: 'input',
    placeholder: '用户名/卡密',
    clearable: true
  },
  {
    label: '卡密类型',
    key: 'testCard',
    type: 'select',
    props: {
      placeholder: '请选择启用状态',
      options: [
        { label: '会员卡', value: '0' },
        { label: '测试卡', value: '1' },
      ]
    }
  },
  {
    label: '启用状态',
    key: 'status',
    type: 'select',
    props: {
      placeholder: '请选择启用状态',
      options: [
        { label: '启用', value: '0' },
        { label: '禁用', value: '1' },
      ]
    }
  },
  {
    label: '卡密状态',
    key: 'activeState',
    type: 'select',
    props: {
      placeholder: '请选择卡密激活状态',
      options: [
        { label: '未激活', value: '0' },
        { label: '已激活', value: '1' },
        { label: '已充值', value: '2' },
        { label: '已过期', value: '3' },
      ]
    }
  }
])

// 事件
function handleReset() {
  console.log('重置表单')
  emit('reset')
}

async function handleSearch(params: Api.SystemManage.UserSearchParams) {
  await searchBarRef.value.validate()
  emit('search', params)
  console.log('表单数据', params)
}
</script>
