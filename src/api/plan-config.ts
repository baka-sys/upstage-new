import request from '@/utils/http'

interface PlanConfigPageResponse {
  success: boolean
  code: number
  message?: string
  data?: Api.PlanConfigManage.PlanConfigPageListItem[]
  total?: number
}

/** 添加问答方案 */
export function addPlanConfig(data: Api.PlanConfigManage.AddPlanConfigParams) {
  return request.post<void>({
    url: '/planConfig/add',
    data
  })
}

/** 修改问答方案 */
export function updatePlanConfig(data: Api.PlanConfigManage.UpdatePlanConfigParams) {
  return request.post<void>({
    url: '/planConfig/update',
    data
  })
}

/** 删除问答方案；主键通过 query 提交 */
export function deletePlanConfig(params: Api.PlanConfigManage.DeletePlanConfigParams) {
  return request.post<void>({
    url: '/planConfig/delete',
    params,
    // request 封装会把无 data 的 POST params 转成 JSON body；显式传空 body 以保留 query 参数。
    data: {}
  })
}

/** 获取问答方案配置分页列表 */
export async function getPlanConfigPage(
  params: Api.PlanConfigManage.PlanConfigPageParams
): Promise<Api.PlanConfigManage.PlanConfigPageList> {
  const response = await request.get<PlanConfigPageResponse>({
    url: '/planConfig/page',
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

/** 切换问答方案启用状态；参数通过 query 提交 */
export function updatePlanConfigStatus(params: Api.PlanConfigManage.UpdatePlanConfigStatusParams) {
  return request.post<void>({
    url: '/planConfig/status',
    params,
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    // request 封装会把无 data 的 POST params 转成 JSON body；显式传空 body 以保留 query 参数。
    data: {}
  })
}
