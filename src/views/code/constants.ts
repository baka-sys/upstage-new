export const CODE_TYPE_TABS: Array<{ label: string; value: Api.CodeManage.CodeType }> = [
  { label: '公共活码', value: 0 },
  { label: '专属活码', value: 1 },
  // TODO: 后端确认“备用活码”是否对应 type = 2（接口文档中描述为短域名）。
  { label: '备用活码', value: 2 }
]

// TODO: 后端确认 platformType 的完整枚举；未知值暂时回显原始值。
export const PLATFORM_TYPE_MAP: Record<number, string> = {
  1: '微信',
  2: '嵌套'
}

export const PLATFORM_TYPE_OPTIONS = Object.entries(PLATFORM_TYPE_MAP).map(([value, label]) => ({
  label,
  value: Number(value)
}))

/** 批量录入接口的平台选项。TODO: 等待后端确认 platformType 的真实枚举值。 */
export const BATCH_PLATFORM_TYPE_OPTIONS = [
  { label: '全网', value: 0 },
  { label: '浏览器', value: 1 },
  { label: '微信', value: 2 },
  { label: 'QQ', value: 3 },
  { label: '抖音', value: 4 },
  { label: '微博', value: 5 },
  { label: '支付宝', value: 6 }
]
