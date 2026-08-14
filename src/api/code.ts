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

/** 批量添加商户域名 */
export function addCodeBatch(params: Api.CodeManage.AddCodeBatchParams) {
  return request.post<void>({
    url: '/code/addBatch',
    data: params
  })
}

/** 逻辑批量重置活码域名；参数通过 query 提交 */
export function resetCodeBatch(params: Api.CodeManage.ResetCodeBatchParams) {
  return request.post<void>({
    url: '/code/deleteSet',
    params,
    // request 封装会把无 data 的 POST params 转成 JSON body；显式传空 body 以保留 query。
    data: {}
  })
}

/** 逻辑批量删除活码域名；参数通过 query 提交 */
export function deleteCodeBatch(params: Api.CodeManage.DeleteCodeBatchParams) {
  return request.post<void>({
    url: '/code/deleteBatch',
    params,
    // deleteBatch 同样由后端 @RequestParam 接收，必须保留在 URL query 中。
    data: {}
  })
}

/** 切换单个活码域名状态；参数通过 JSON body 提交 */
export function updateCodeStatus(data: Api.CodeManage.UpdateCodeStatusParams) {
  return request.put<void>({
    url: '/code/status',
    data
  })
}
