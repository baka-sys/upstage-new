import request from '@/utils/http'

interface SystemDomainPageResponse {
  success: boolean
  code: number
  message?: string
  data?: Api.SystemDomainManage.SystemDomainPageListItem[]
  total?: number
}

/** 获取系统配置域名分页列表 */
export async function getSystemDomainPage(
  params: Api.SystemDomainManage.SystemDomainPageParams
): Promise<Api.SystemDomainManage.SystemDomainPageList> {
  const response = await request.get<SystemDomainPageResponse>({
    url: '/systemDomain/page',
    params,
    returnFullResponse: true
  })

  return {
    records: response.data ?? [],
    total: response.total ?? 0,
    current: params.page,
    size: params.limit
  }
}

/** 批量添加系统配置域名 */
export function batchAddSystemDomain(params: Api.SystemDomainManage.BatchAddSystemDomainParams) {
  return request.post<void>({
    url: '/systemDomain/batchAdd',
    data: params
  })
}
