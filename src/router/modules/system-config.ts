import { AppRouteRecord } from '@/types/router'

/** 系统配置 */
export const systemConfigRoutes: AppRouteRecord = {
  path: '/system-config',
  name: 'SystemConfig',
  component: '/system-config',
  meta: {
    title: 'menus.systemConfig.title',
    icon: 'ri:settings-3-line',
    keepAlive: false,
    fixedTab: false
  }
}
