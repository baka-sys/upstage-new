import request from '@/utils/http'

interface AccountUrlMainPageResponse {
  success: boolean
  code: number
  message?: string
  data?: Api.AccountUrlMainManage.AccountUrlMainListItem[]
  total?: number
}

/** 获取链接主表分页列表 */
export async function getAccountUrlMainPage(
  params: Api.AccountUrlMainManage.AccountUrlMainPageParams
): Promise<Api.AccountUrlMainManage.AccountUrlMainPageList> {
  const response = await request.get<AccountUrlMainPageResponse>({
    url: '/accountUrlMain/page',
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

/** 修改链接主表 */
export function updateAccountUrlMain(data: Api.AccountUrlMainManage.UpdateAccountUrlMainParams) {
  return request.post<void>({
    url: '/accountUrlMain/update',
    data
  })
}

/** 一键获取全部链接，可按链接类型筛选 */
export function getAccountUrlMainCopyList(
  params?: Api.AccountUrlMainManage.CopyAccountUrlMainParams
) {
  return request.get<Api.AccountUrlMainManage.AccountUrlMainListItem[]>({
    url: '/accountUrlMain/copy',
    params
  })
}
