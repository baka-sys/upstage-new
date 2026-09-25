import { AppRouteRecord } from '@/types/router'

/** 企业账号管理 */
export const accountRoutes: AppRouteRecord = {
  path: '/account',
  name: 'AccountManage',
  component: '/account',
  meta: {
    title: 'menus.accountManage.title',
    icon: 'ri:building-2-line',
    keepAlive: false,
    fixedTab: false
  }
}
