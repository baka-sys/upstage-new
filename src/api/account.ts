import request from '@/utils/http'

interface AccountPageResponse {
  success: boolean
  code: number
  message?: string
  data?: Api.AccountManage.AccountListItem[]
  total?: number
}

export interface AccountAvatarUploadResult {
  fileName: string
  filePath: string
}

/** 获取企业账号分页列表 */
export async function getAccountPage(
  params: Api.AccountManage.AccountPageParams
): Promise<Api.AccountManage.AccountPageList> {
  const response = await request.get<AccountPageResponse>({
    url: '/account/page',
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

/** 新增企业账号 */
export function addAccount(data: Api.AccountManage.AddAccountParams) {
  return request.post<void>({
    url: '/account/add',
    data
  })
}

/** 修改企业账号资料 */
export function updateAccountInfo(data: Api.AccountManage.UpdateAccountInfoParams) {
  return request.post<void>({
    url: '/account/updateInfo',
    data
  })
}

/** 修改企业账号密码，后端通过 RequestParam 接收 */
export function updateAccountPassword(params: Api.AccountManage.UpdateAccountPasswordParams) {
  return request.post<void>({
    url: '/account/updatePassword',
    params,
    data: {}
  })
}

/** 修改企业账号状态，后端通过 RequestParam 接收 */
export function updateAccountStatus(params: Api.AccountManage.UpdateAccountStatusParams) {
  return request.post<void>({
    url: '/account/updateStatus',
    params,
    data: {}
  })
}

/** 企业账号充值，后端通过 RequestParam 接收 */
export function rechargeAccount(params: Api.AccountManage.RechargeAccountParams) {
  return request.post<void>({
    url: '/account/recharge',
    params,
    data: {}
  })
}

/** 上传企业账号头像 */
export function uploadAccountAvatar(file: File) {
  const data = new FormData()
  data.append('file', file)

  return request.post<AccountAvatarUploadResult>({
    url: '/other/uploadImg',
    data
  })
}
