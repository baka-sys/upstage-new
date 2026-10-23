<template>
  <ElButton
    v-if="value?.trim()"
    class="carmine-copy"
    link
    type="primary"
    native-type="button"
    title="点击复制卡密"
    @click.stop="handleCopy"
  >
    {{ label || value }}
  </ElButton>
  <span v-else>--</span>
</template>

<script setup lang="ts">
  import { ElButton, ElMessage } from 'element-plus'

  const props = defineProps<{
    value?: string | null
    label?: string
  }>()

  const handleCopy = async (event: MouseEvent) => {
    const value = props.value
    if (!value?.trim()) return

    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(value)
      } else {
        // HTTP 环境使用传统复制，放在当前弹窗内以兼容弹窗的焦点限制。
        const trigger = event.currentTarget as HTMLElement
        const activeElement = document.activeElement as HTMLElement | null
        const textarea = document.createElement('textarea')
        const container = trigger.closest('.el-dialog') || document.body
        textarea.value = value
        textarea.style.position = 'fixed'
        textarea.style.opacity = '0'
        container.appendChild(textarea)
        try {
          textarea.select()
          if (!document.execCommand('copy')) throw new Error('复制失败')
        } finally {
          textarea.remove()
          activeElement?.focus({ preventScroll: true })
        }
      }
      ElMessage.success('复制成功')
    } catch {
      ElMessage.error('复制失败，请检查浏览器剪贴板权限')
    }
  }
</script>

<style scoped lang="scss">
  .carmine-copy {
    max-width: 100%;
    vertical-align: middle;

    :deep(span) {
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
  }
</style>
