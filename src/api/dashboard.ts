import request from '@/utils/http'

/** 获取总后台卡密统计 */
export function fetchUserCount() {
  return request.get<Api.Dashboard.UserCount>({
    url: '/user/count'
  })
}

/** 获取总后台劫持统计 */
export function fetchHackCount() {
  return request.get<Api.Dashboard.HackCount>({
    url: '/user/countRadio'
  })
}
