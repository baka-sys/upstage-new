import { AppRouteRecord } from '@/types/router'

/** 活码域名 */
export const codeRoutes: AppRouteRecord = {
  path: '/code',
  name: 'CodeDomain',
  component: '/code',
  meta: {
    title: 'menus.code.title',
    icon: 'ri:code-box-line',
    keepAlive: false,
    fixedTab: false
  }
}
