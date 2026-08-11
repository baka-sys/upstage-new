import { AppRouteRecord } from '@/types/router'

/** 系统域名 */
export const systemDomainRoutes: AppRouteRecord = {
  path: '/system-domain',
  name: 'SystemDomain',
  component: '/system-domain',
  meta: {
    title: 'menus.systemDomain.title',
    icon: 'ri:code-box-line',
    keepAlive: false,
    fixedTab: false
  }
}
