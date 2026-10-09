import request from '@/utils/http'

/**
 * 登录
 * @param params 登录参数
 * @returns 登录响应
 */
export function fetchLogin(params: any) {
  return request.post<any>({
    url: '/admin/login',
    params,
    // 后端使用 @RequestParam；显式保留空请求体，避免请求封装把 params 转成 JSON Body。
    data: {},
    //showSuccessMessage: true // 显示成功消息
    //showErrorMessage: false // 不显示错误消息
  })
}
