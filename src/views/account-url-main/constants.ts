export const URL_TYPE_MAP: Record<number, string> = {
  1: '快捷地址',
  2: '粉商地址',
  3: '客服地址'
}

export const URL_TYPE_TAG_MAP = {
  1: 'primary',
  2: 'success',
  3: 'warning'
} as const

export const URL_TYPE_OPTIONS = Object.entries(URL_TYPE_MAP).map(([value, label]) => ({
  label,
  value: Number(value) as Api.AccountUrlMainManage.UrlType
}))

export const RELATION_TYPE_MAP: Record<number, string> = {
  1: '主用',
  2: '备用'
}

export const RELATION_TYPE_TAG_MAP = {
  1: 'success',
  2: 'info'
} as const

export const RELATION_TYPE_OPTIONS = Object.entries(RELATION_TYPE_MAP).map(([value, label]) => ({
  label,
  value: Number(value) as Api.AccountUrlMainManage.RelationType
}))
