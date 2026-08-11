import request from '@/utils/http'

interface RecordPageResponse {
  success: boolean
  code: number
  message?: string
  data?: Api.RecordManage.RecordListItem[]
  total?: number
}

/** 获取积分变动记录分页列表 */
export async function recordPage(
  params: Api.RecordManage.RecordPageParams
): Promise<Api.RecordManage.RecordPageList> {
  const response = await request.get<RecordPageResponse>({
    url: '/record/page',
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

/** 获取企业账户列表 */
export async function accountList(): Promise<Api.RecordManage.AccountListItem[]> {
  const data = await request.get<Api.RecordManage.AccountListItem[] | null>({
    url: '/account/list'
  })

  return Array.isArray(data) ? data : []
}
