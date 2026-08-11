import request from '@/utils/http'

interface CodePageResponse {
  success: boolean
  code: number
  message?: string
  data?: Api.CodeManage.CodePageListItem[]
  total?: number
}

/** 获取活码域名分页列表 */
export async function getCodePage(
  params: Api.CodeManage.CodePageParams
): Promise<Api.CodeManage.CodePageList> {
  const response = await request.get<CodePageResponse>({
    url: '/code/page',
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
