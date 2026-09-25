import request from '@/utils/http'

export type SystemConfigCodeType = 1

export interface ConfigJsonParams {
  codeType: SystemConfigCodeType
}

export type ConfigControlType =
  | 'input'
  | 'textarea'
  | 'radio'
  | 'checkbox'
  | 'select'
  | 'switch'
  | 'upload'

export interface ConfigJsonOption {
  value: string
  label: string
}

/** 后端返回的动态表单字段描述。 */
export interface ConfigJsonItem {
  field: string
  options: ConfigJsonOption[] | null
  props: Record<string, unknown> | null
  title: string
  type: ConfigControlType
  value: unknown
}

export type ConfigJsonData = ConfigJsonItem[]

export type UpdateConfigValuesParams = Record<string, string>

export interface ConfigImageUploadResult {
  fileName: string
  filePath: string
}

/** 获取系统配置表单数据 */
export function getConfigJson(params: ConfigJsonParams) {
  return request.get<ConfigJsonData>({
    url: '/config/getJson',
    params,
    // 页面按当前业务文案提示错误，避免与请求层重复提示。
    showErrorMessage: false
  })
}

/** 保存系统配置表单 */
export function updateConfigValues(data: UpdateConfigValuesParams) {
  return request.post<void>({
    url: '/config/editOne',
    data
  })
}

/** 上传系统配置图片 */
export function uploadConfigImage(file: File) {
  const data = new FormData()
  data.append('file', file)

  return request.post<ConfigImageUploadResult>({
    url: '/other/uploadImg',
    data
  })
}
