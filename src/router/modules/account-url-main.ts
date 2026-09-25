import { AppRouteRecord } from '@/types/router'

/** 链接管理 */
export const accountUrlMainRoutes: AppRouteRecord = {
  path: '/account-url-main',
  name: 'AccountUrlMainManage',
  component: '/account-url-main',
  meta: {
    title: 'menus.accountUrlMain.title',
    icon: 'ri:links-line',
    keepAlive: false,
    fixedTab: false
  }
}
