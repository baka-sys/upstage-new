import { AppRouteRecord } from '@/types/router'

/** 积分记录 */
export const recordRoutes: AppRouteRecord = {
  path: '/record',
  name: 'PointRecord',
  component: '/record',
  meta: {
    title: 'menus.record.title',
    icon: 'ri:exchange-dollar-line',
    keepAlive: false,
    fixedTab: false
  }
}
