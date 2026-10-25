/** Copy from a direct user action; use the selection fallback when Clipboard API is unavailable. */
export async function copyText(text: string): Promise<void> {
  if (typeof text !== 'string' || text.length === 0) throw new Error('Nothing to copy')
  if (window.isSecureContext !== false && typeof navigator.clipboard?.writeText === 'function') {
    try {
      await navigator.clipboard.writeText(text)
      return
    } catch {
      // Permission restrictions and embedded browsers can reject the modern API.
    }
  }

  const previousFocus = document.activeElement as HTMLElement | null
  const textarea = document.createElement('textarea')
  textarea.value = text
  textarea.readOnly = true
  textarea.style.cssText = 'position:fixed;top:0;left:0;width:1px;height:1px;padding:0;border:0;opacity:0;font-size:16px;'
  document.body.appendChild(textarea)
  try {
    textarea.focus({ preventScroll: true })
    textarea.select()
    textarea.setSelectionRange(0, textarea.value.length)
    if (typeof document.execCommand !== 'function' || !document.execCommand('copy')) {
      throw new Error('Automatic clipboard access is unavailable')
    }
  } finally {
    textarea.remove()
    previousFocus?.focus({ preventScroll: true })
  }
}
