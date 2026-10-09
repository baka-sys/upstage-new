/**
 * HTTP 请求封装模块
 * 基于 Axios 封装的 HTTP 请求工具，提供统一的请求/响应处理
 *
 * ## 主要功能
 *
 * - 请求/响应拦截器（自动添加 Token、统一错误处理）
 * - 401 未授权自动登出（带防抖机制）
 * - 请求失败自动重试（可配置）
 * - 统一的成功/错误消息提示
 * - 支持 GET/POST/PUT/DELETE 等常用方法
 *
 * @module utils/http
 * @author Art Design Pro Team
 */

import axios, {
  AxiosRequestConfig,
  AxiosResponse,
  InternalAxiosRequestConfig
} from 'axios'
import { useUserStore } from '@/store/modules/user'
import { ApiStatus } from './status'
import { HttpError, handleError, showError, showSuccess } from './error'
import { $t } from '@/locales'
import { BaseResponse } from '@/types'

/** 请求配置常量 */
const REQUEST_TIMEOUT = 15000
const LOGOUT_DELAY = 500
const MAX_RETRIES = 0
const RETRY_DELAY = 1000
const UNAUTHORIZED_DEBOUNCE_TIME = 3000

/** 401 防抖状态 */
let isUnauthorizedErrorShown = false
let unauthorizedTimer: ReturnType<typeof setTimeout> | null = null

/** 扩展 AxiosRequestConfig */
interface ExtendedAxiosRequestConfig extends AxiosRequestConfig {
  showErrorMessage?: boolean
  showSuccessMessage?: boolean
  skipCodeCheck?: boolean
}

const { VITE_API_URL, VITE_WITH_CREDENTIALS } = import.meta.env

/** Axios 实例 */
const axiosInstance = axios.create({
  timeout: REQUEST_TIMEOUT,
  baseURL: VITE_API_URL,
  withCredentials: VITE_WITH_CREDENTIALS === 'true',
  validateStatus: (status) => status >= 200 && status < 300,
  transformResponse: [
    // ✅ 修复 1：第二个参数是 headers，不是 response
    (data, headers) => {
      const contentType =
        (headers && (headers['content-type'] || headers['Content-Type'])) || ''

      if (typeof contentType === 'string' && contentType.includes('application/json')) {
        try {
          return typeof data === 'string' ? JSON.parse(data) : data
        } catch {
          return data
        }
      }
      return data
    }
  ]
})

/** 请求拦截器 */
axiosInstance.interceptors.request.use(
  (request: InternalAxiosRequestConfig) => {
    const { accessToken } = useUserStore()
    if (accessToken) {
      request.headers.set('Authorization', 'Bearer ' + accessToken)
    }

    // ✅ 修复：用 headers.get 判断，AxiosHeaders 大小写不敏感
    if (
      request.data &&
      !(request.data instanceof FormData) &&
      !request.headers.get('Content-Type')
    ) {
      request.headers.set('Content-Type', 'application/json')
      request.data = JSON.stringify(request.data)
    }

    return request
  },
  (error) => {
    showError(createHttpError($t('httpMsg.requestConfigError'), ApiStatus.error))
    return Promise.reject(error)
  }
)

/** 响应拦截器 */
axiosInstance.interceptors.response.use(
  (response: AxiosResponse<BaseResponse>) => {
    // 类型断言，将 config 转为扩展类型
    const config = response.config as ExtendedAxiosRequestConfig

    // 如果配置了跳过校验，直接返回原始响应
    if (config.skipCodeCheck) {
      return response
    }

    const { status, data } = response

    // ✅ 修复 2：优先读业务码 code，兼容 message / msg
    const code = (data as any)?.code ?? status
    const message =
      (data as any)?.message ??
      (data as any)?.msg ??
      undefined

    // ✅ 修复 3：按业务码判断成功
    if (code === ApiStatus.success) {
      return response
    }

    if (code === ApiStatus.unauthorized) {
      handleUnauthorizedError(message, getRequestAccessToken(response.config))
    }

    throw createHttpError(message || $t('httpMsg.requestFailed'), code)
  },
  (error) => {
    if (error.response?.status === ApiStatus.unauthorized) {
      handleUnauthorizedError(undefined, getRequestAccessToken(error.config))
    }
    return Promise.reject(handleError(error))
  }
)

/** 统一创建 HttpError */
function createHttpError(message: string, code: number) {
  return new HttpError(message, code)
}

/** 处理 401 错误（带防抖） */
function handleUnauthorizedError(message?: string, requestToken?: string): never {
  const error = createHttpError(
    message || $t('httpMsg.unauthorized'),
    ApiStatus.unauthorized
  )

  if (!isUnauthorizedErrorShown) {
    isUnauthorizedErrorShown = true
    logOut(requestToken)

    unauthorizedTimer = setTimeout(resetUnauthorizedError, UNAUTHORIZED_DEBOUNCE_TIME)

    showError(error, true)
    throw error
  }

  throw error
}

/** 重置 401 防抖状态 */
function resetUnauthorizedError() {
  isUnauthorizedErrorShown = false
  if (unauthorizedTimer) clearTimeout(unauthorizedTimer)
  unauthorizedTimer = null
}

/** 退出登录函数 */
function logOut(requestToken?: string) {
  setTimeout(() => {
    const userStore = useUserStore()

    // 旧请求的 401 可能晚于新一轮登录返回，不能清除刚写入的新 Token
    if (requestToken && userStore.accessToken !== requestToken) {
      return
    }

    userStore.logOut()
  }, LOGOUT_DELAY)
}

/** 获取请求发出时携带的访问令牌，用于避免旧 401 退出新会话 */
function getRequestAccessToken(config?: AxiosRequestConfig): string | undefined {
  if (!config?.headers) return undefined

  const authorization = axios.AxiosHeaders.from(config.headers).get('Authorization')
  if (typeof authorization !== 'string') return undefined

  return authorization.replace(/^Bearer\s+/i, '')
}

/** 是否需要重试 */
function shouldRetry(statusCode: number) {
  return [
    ApiStatus.requestTimeout,
    ApiStatus.internalServerError,
    ApiStatus.badGateway,
    ApiStatus.serviceUnavailable,
    ApiStatus.gatewayTimeout
  ].includes(statusCode)
}

/** 请求重试逻辑 */
async function retryRequest<T>(
  config: ExtendedAxiosRequestConfig,
  retries: number = MAX_RETRIES
): Promise<T> {
  try {
    return await request<T>(config)
  } catch (error) {
    if (retries > 0 && error instanceof HttpError && shouldRetry(error.code)) {
      await delay(RETRY_DELAY)
      return retryRequest<T>(config, retries - 1)
    }
    throw error
  }
}

/** 延迟函数 */
function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

/** 请求函数 */
async function request<T = any>(config: ExtendedAxiosRequestConfig): Promise<T> {
  try {
    const res = await axiosInstance.request<BaseResponse<T>>(config)

    // ✅ 跳过业务码校验（如文件下载），直接返回原始数据
    if (config.skipCodeCheck) {
      return res.data as T
    }

    // ✅ 兼容 message / msg
    const successMessage =
      (res.data as any)?.message ?? (res.data as any)?.msg

    if (config.showSuccessMessage && successMessage) {
      showSuccess(successMessage)
    }

    return res.data as T
  } catch (error) {
    // 错误处理
    if (error instanceof HttpError) {
      const showMsg = config.showErrorMessage !== false
      showError(error, showMsg)
    }
    return Promise.reject(error)
  }
}

/** API 方法集合 */
const api = {
  get<T>(config: ExtendedAxiosRequestConfig) {
    return retryRequest<T>({ ...config, method: 'GET' })
  },
  post<T>(config: ExtendedAxiosRequestConfig) {
    return retryRequest<T>({ ...config, method: 'POST' })
  },
  put<T>(config: ExtendedAxiosRequestConfig) {
    return retryRequest<T>({ ...config, method: 'PUT' })
  },
  del<T>(config: ExtendedAxiosRequestConfig) {
    return retryRequest<T>({ ...config, method: 'DELETE' })
  },
  request<T>(config: ExtendedAxiosRequestConfig) {
    return retryRequest<T>(config)
  }
}

export default api