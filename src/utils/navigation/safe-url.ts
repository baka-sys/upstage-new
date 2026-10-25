/** Navigation accepts only HTTP(S) URLs without embedded credentials. */
export function safeHttpUrl(value: unknown, base: string = window.location.origin): string {
  if (typeof value !== 'string' || !value || /[\u0000-\u0020\u007f]/.test(value)) return ''
  try {
    const url = new URL(value, base)
    if (!['http:', 'https:'].includes(url.protocol) || url.username || url.password) return ''
    return url.href
  } catch {
    return ''
  }
}

export function visitUrlWithNonce(value?: string, nonce?: string): string {
  const safe = safeHttpUrl(value)
  if (!safe || !nonce) return ''
  const url = new URL(safe)
  url.searchParams.set('nonce', nonce)
  return url.href
}
