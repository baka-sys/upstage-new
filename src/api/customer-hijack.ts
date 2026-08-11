import request from '@/utils/http'


/**
 * 添加劫持
 */
export function addCustomerHijackApi(data: any) {
    return request.post<any>({
      url: '/entryRatio/add',
      data: data
    })
}

/**
 * 修改劫持
 */
export function updateCustomerHijackApi(data: any) {
    return request.post<any>({
        url: '/entryRatio/update',
        data: data
    })
}

/**
 * 全部开启或者全部停止
 */
export function startOrStopCustomerHijackApi(data: any){
    return request.post<any>({
        url: '/entryRatio/stopOrStart',
        data: data
    })
}