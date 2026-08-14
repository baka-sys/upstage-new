import { AppRouteRecord } from '@/types/router'

/** 方案设置 */
export const planConfigRoutes: AppRouteRecord = {
  path: '/plan-config',
  name: 'PlanConfig',
  component: '/plan-config',
  meta: {
    title: 'menus.planConfig.title',
    icon: 'ri:list-settings-line',
    keepAlive: false,
    fixedTab: false
  }
}
