export const DOMAIN_TYPE_MAP: Record<number, string> = {
  1: '直连域名',
  2: '图片域名',
  3: '上传域名'
}

export const DOMAIN_TYPE_TAG_MAP = {
  1: 'primary',
  2: 'success',
  3: 'warning'
} as const

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
