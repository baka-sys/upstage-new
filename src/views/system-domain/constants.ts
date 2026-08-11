export const DOMAIN_TYPE_MAP: Record<number, string> = {
  1: '直连',
  2: '图片',
  3: '上传'
}

export const DOMAIN_TYPE_OPTIONS = Object.entries(DOMAIN_TYPE_MAP).map(([value, label]) => ({
  label,
  value: Number(value)
}))

export const DOMAIN_STATUS_MAP: Record<number, string> = {
  0: '未使用',
  1: '使用中'
}

export const DOMAIN_STATUS_OPTIONS = Object.entries(DOMAIN_STATUS_MAP).map(([value, label]) => ({
  label,
  value: Number(value)
}))
