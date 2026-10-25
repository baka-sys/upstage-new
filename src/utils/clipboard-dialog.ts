import { h } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { copyText } from '@/utils/clipboard'

let previewSequence = 0

/** Use after asynchronous loading so Safari gets a new, explicit user gesture for copying. */
export async function requestTextCopy(text: string, title = '复制内容'): Promise<boolean> {
  const previewId = `clipboard-preview-${++previewSequence}`
  let copied = false
  try {
    await ElMessageBox({
      title,
      message: h('div', [
        h('p', { style: 'margin:0 0 12px;line-height:1.6;' }, '内容已准备好，请点击“复制”。浏览器限制自动复制时，也可长按或选择下方文本手动复制。'),
        h('textarea', {
          id: previewId,
          value: text,
          readonly: true,
          'aria-label': '待复制内容',
          style: 'box-sizing:border-box;width:100%;height:180px;padding:8px;font-size:16px;line-height:1.5;resize:vertical;',
          onFocus: (event: FocusEvent) => (event.target as HTMLTextAreaElement).select()
        })
      ]),
      confirmButtonText: '复制',
      cancelButtonText: '关闭',
      showCancelButton: true,
      closeOnClickModal: false,
      beforeClose(action, instance, done) {
        if (action !== 'confirm') {
          done()
          return
        }
        if (instance.confirmButtonLoading) return
        instance.confirmButtonLoading = true
        // Invoke synchronously in the confirmation click, before any awaited operation.
        void copyText(text).then(() => {
          copied = true
          done()
        }).catch(() => {
          const preview = document.getElementById(previewId) as HTMLTextAreaElement | null
          preview?.focus({ preventScroll: true })
          preview?.select()
          ElMessage.warning('浏览器限制自动复制，请长按或选择文本后手动复制')
        }).finally(() => {
          instance.confirmButtonLoading = false
        })
      }
    })
  } catch {
    // Closing the preview is an ordinary cancellation.
  }
  return copied
}

/** Keep direct copies one-click, but always offer selectable text when automatic copying fails. */
export async function copyTextOrPrompt(text: string, title = '复制内容'): Promise<boolean> {
  try {
    await copyText(text)
    return true
  } catch {
    return requestTextCopy(text, title)
  }
}
