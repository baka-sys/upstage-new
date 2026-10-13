import request from '@/utils/http'

interface CarminePageResponse {
  success: boolean
  code: number
  message?: string
  data: Api.CarmineMange.CardListItem[]
  total: number
}

/** 获取卡密列表 */
export async function fetchCarmineList(
  params: Api.CarmineMange.CarminePageParams
): Promise<Api.CarmineMange.CardList> {
  const response = await request.get<CarminePageResponse>({
    url: '/user/page',
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

/** 批量生成卡密并下载 */
export function generateCarmines(params: Api.CarmineMange.GenerateCarmineParams) {
  return request.get<Blob>({
    url: '/user/generate',
    params,
    responseType: 'blob',
    skipCodeCheck: true
  })
}

/** 批量续费卡密 */
export function renewCarmines(params: Api.CarmineMange.RenewCarmineParams) {
  return request.post<void>({
    url: '/user/renew',
    params,
    data: {}
  })
}

/** 批量禁用卡密 */
export function freezeCarmines(params: Api.CarmineMange.FreezeCarmineParams) {
  return request.post<void>({
    url: '/user/batchFreeze',
    params,
    data: {}
  })
}

/**
 * 修改卡密状态
 * @param params 
 * @returns 
 */
export function handleUpdateStatusApi(params:any){
  return request.post<any>({
    url: '/user/switch',
    params,
    data: {}
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

/** 获取劫持默认配置 */
export async function getEntryRatioSetting(): Promise<Api.CarmineMange.EntryRatioSetting> {
  const response = await request.get<{ data: Api.CarmineMange.EntryRatioSetting }>({
    url: '/entryRatioSetting/get'
  })
  return response.data
}

/** 修改劫持默认配置 */
export function updateEntryRatioSetting(params: any) {
  return request.post<void>({
    url: '/entryRatioSetting/update',
    data: params
  })
}

/** 全部修改比例配置 */
export function batchUpdateAllEntryRatio(params: Api.CarmineMange.BatchUpdateAllEntryRatioParams) {
  return request.post<void>({
    url: '/entryRatio/batchUpdateAll',
    data: params
  })
}

/** 修改单条劫持比例 */
export function updateEntryRatio(params: Api.CarmineMange.SaveEntryRatioParams) {
  return request.post<void>({
    url: '/entryRatio/update',
    data: params
  })
}

/** 全部开启或暂停劫持比例 */
export function updateAllEntryRatioStatus(params:any) {
  return request.post<any>({
    url: '/entryRatio/stopOrStart',
    params: params,
    data: {},
    showErrorMessage: true
  })
}

/** 同步劫持配置 */
export function synchronizeEntryRatioConfiguration(params:any) {
  return request.post<any>({
    url: '/entryRatio/synchronizationConfiguration',
    params: params,
    data: {},
    showErrorMessage: true
  })
}

interface EntryRatioPageResponse {
  success: boolean
  code: number
  message?: string
  data?: Api.CarmineMange.EntryRatioItem[]
  total?: number
}

/** 获取劫持管理分页列表 */
export async function fetchEntryRatioPage(
  params: Api.CarmineMange.EntryRatioPageParams
): Promise<Api.CarmineMange.EntryRatioPageList> {
  const response = await request.get<EntryRatioPageResponse>({
    url: '/entryRatio/page',
    params
  })

  return {
    records: response.data ?? [],
    total: response.total ?? 0,
    current: params.page,
    size: params.limit
  }
}

/** 获取全部企业账户列表 */
export async function fetchAccountList(): Promise<any> {
  return request.get<any>({
    url: '/account/list'
  })
}

/** 获取劫持管理企业账户下拉列表 */
export async function fetchHijackAccountList(): Promise<Api.CarmineMange.HijackAccountItem[]> {
  return fetchAccountList()
}
