import request from '@/utils/http'

/**
 * 获取用户信息
 * @returns 用户信息
 */
export function fetchGetCustomerList(params: Api.SystemManage.UserSearchParams) {
  return request.get<Api.CarmineMange.CarmineList>({
    url: '/customer/page',
    params
    // 自定义请求头
    // headers: {
    //   'X-Custom-Header': 'your-custom-value'
    // }
  })
}

interface ActivePageResponse {
  code: number
  msg?: string
  data: Api.CarmineMange.ActivePageListItem[]
  total: number
}

/** 获取卡密截图列表 */
export async function activePage(
  params: Api.CarmineMange.ActivePageParams
): Promise<Api.CarmineMange.ActivePageList> {
  const response = await request.get<ActivePageResponse>({
    url: '/user/activePage',
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
