import request from '@/utils/http'

export type SystemConfigCodeType = 1

export interface ConfigJsonParams {
  codeType: SystemConfigCodeType
}

/** 后端返回的动态表单字段描述。 */
export interface ConfigJsonItem {
  field: string
  options: unknown
  props: Record<string, unknown>
  title: string
  type: string
  value: unknown
}

/** 兼容接口将表单描述项作为数组、单项或按字段索引对象返回。 */
export type ConfigJsonData = ConfigJsonItem | ConfigJsonItem[] | Record<string, ConfigJsonItem>

/** 获取系统配置表单数据 */
export function getConfigJson(params: ConfigJsonParams) {
  return request.get<ConfigJsonData>({
    url: '/config/getJson',
    params,
    // 页面按当前业务文案提示错误，避免与请求层重复提示。
    showErrorMessage: false
  })
}
