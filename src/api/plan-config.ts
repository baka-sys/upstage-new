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

/** 设置或取消默认方案；同类型默认方案由后端在事务中切换。 */
export function setPlanConfigDefault(params: Api.PlanConfigManage.SetPlanConfigDefaultParams) {
  return request.post<void>({
    url: '/planConfig/defaultStatus',
    params,
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    data: {}
  })
}

/** 解析图片地址，保留后台代理路径，七牛图片优先使用HTTPS。 */
export function resolvePlanBackgroundUrl(filePath: string) {
  const configuredBase = import.meta.env.VITE_API_URL || '/'
  const apiBase = new URL(configuredBase.replace(/\/+$/, '') + '/', window.location.origin)
  const imageUrl =
    /^https?:\/\//i.test(filePath) || filePath.startsWith('//')
      ? new URL(filePath, window.location.origin)
      : new URL(filePath.replace(/^\/+/, ''), apiBase)
  if (imageUrl.hostname === 'pic.cqdragon.top') imageUrl.protocol = 'https:'
  return imageUrl.href
}

/** 同名本地备用图片可从七牛方案地址恢复，无需新增数据库字段。 */
export function getPlanBackgroundFallbackUrl(imageUrl: string) {
  try {
    const url = new URL(imageUrl, window.location.origin)
    if (
      url.hostname !== 'pic.cqdragon.top' ||
      !/^\/[a-f0-9]{32}\.(png|jpg|jpeg|gif|bmp)$/i.test(url.pathname)
    )
      return ''
    return resolvePlanBackgroundUrl('/plan-backgrounds' + url.pathname)
  } catch {
    return ''
  }
}

/** 上传背景；浏览器确认主图片可访问后使用主图，否则使用本地备用图。 */
export async function uploadPlanConfigBackground(uploadUrl: any, file: File) {
  const data = new FormData()
  data.append('file', file)
  const response = await request.post<{
    code: number
    data: { filePath: string; localFilePath?: string; fileName?: string }
  }>({ url: uploadUrl + '/api/other/uploadImg', data, showErrorMessage: false })
  const filePath = response.data?.filePath?.trim()
  if (!filePath) throw new Error('上传接口未返回图片地址')
  const imageUrl = response.data.filePath
  return {
    ...response.data,
    filePath: imageUrl
  }
}

// 获取上传地址
export async function getUploadUrl() {
  return request.get<any>({
    url: '/config/one',
    params: { systemCode: 'image_url' }
  })
}
