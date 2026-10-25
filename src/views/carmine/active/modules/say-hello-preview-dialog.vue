<template>
  <ElDialog
    v-model="dialogVisible"
    :title="`打招呼预览 - ${cardData?.carmine || '--'}`"
    width="640px"
    align-center
    destroy-on-close
  >
    <template #header="{ titleId, titleClass }">
      <span :id="titleId" :class="titleClass">
        打招呼预览 - <CarmineCopy :value="cardData?.carmine" />
      </span>
    </template>
    <ElScrollbar max-height="60vh">
      <ElEmpty v-if="messages.length === 0" description="暂无打招呼文字" :image-size="100" />
      <div v-else class="say-hello-list">
        <div v-for="item in messages" :key="item.id" class="say-hello-item">
          <div class="say-hello-text">{{ item.content }}</div>
        </div>
      </div>
    </ElScrollbar>
    <template #footer>
      <ElButton @click="dialogVisible = false">关闭</ElButton>
    </template>
  </ElDialog>
</template>

<script setup lang="ts">
  import CarmineCopy from '../../components/carmine-copy.vue'

  interface Props {
    visible: boolean
    cardData?: Api.CarmineMange.ActivePageListItem
  }

  const props = defineProps<Props>()
  const emit = defineEmits<{
    (e: 'update:visible', value: boolean): void
  }>()

  const dialogVisible = computed({
    get: () => props.visible,
    set: (value) => emit('update:visible', value)
  })
  const getPlainText = (content?: string | null) => {
    if (!content) return ''

    // 在未挂载的 template 中提取文字，不加载图片或渲染原始 HTML。
    const template = document.createElement('template')
    template.innerHTML = content
    template.content.querySelectorAll('script, style, iframe, object, embed').forEach((node) => {
      node.remove()
    })
    template.content.querySelectorAll('br').forEach((node) => node.replaceWith('\n'))
    template.content
      .querySelectorAll('p, div, li, h1, h2, h3, h4, h5, h6, blockquote, pre, tr')
      .forEach((node) => node.append('\n'))
    return (template.content.textContent || '').replace(/\u00a0/g, ' ').trim()
  }

  const messages = computed(() => {
    if (!Array.isArray(props.cardData?.sayHellos)) return []
    return props.cardData.sayHellos
      .map((item, index) => ({ id: item.id ?? index, content: getPlainText(item.content) }))
      .filter((item) => item.content.length > 0)
  })
</script>

<style scoped lang="scss">
  .say-hello-list {
    display: flex;
    flex-direction: column;
    gap: 12px;
    padding: 4px;
  }

  .say-hello-item {
    padding: 12px;
    background: var(--el-fill-color-light);
    border-radius: 8px;
  }

  .say-hello-text {
    overflow-wrap: anywhere;
    white-space: pre-wrap;
  }
</style>
