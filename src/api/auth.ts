import request from '@/utils/http'
import { formRequest } from '@/utils/http/form-request'

/**
 * 登录
 * @param params 登录参数
 * @returns 登录响应
 */
export function fetchLogin(params: any) {
  return request.post<any>({
    url: '/admin/login',
    ...formRequest(params)
    //showSuccessMessage: true // 显示成功消息
    //showErrorMessage: false // 不显示错误消息
  })
}
