import request from '@/utils/http'

/**
 * 登录
 * @param params 登录参数
 * @returns 登录响应
 */
export function generateCardApi(data: any) {
    return request.post<Blob>({
      url: '/customer/generate',
      data: data,
      responseType: 'blob',
      skipCodeCheck: true
      // showSuccessMessage: true // 显示成功消息
      // showErrorMessage: false // 不显示错误消息
    })
}

export function batchRenewCarmineApi(data:any) {
  return request.post<any>({
    url: '/customer/renew',
    data: data,
    // skipCodeCheck: true
    showSuccessMessage: true // 显示成功消息
    // showErrorMessage: false // 不显示错误消息
  })
}

export function batchFreezeCarmineApi(data:any) {
  return request.post<any>({
    url: '/customer/batchFreeze',
    data: data,
    // skipCodeCheck: true
    showSuccessMessage: true // 显示成功消息
    // showErrorMessage: false // 不显示错误消息
  })
}