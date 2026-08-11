import { AppRouteRecord } from '@/types/router'
/**
 * 卡密管理
 */
export const carmineRoutes: AppRouteRecord = {
  name: 'carmine',
  path: '/carmine',
  component: '/index/index',
  meta: {
    title: 'menus.carmine.title',
    icon: 'ri:bank-card-2-fill'
  },
  children: [
    {
      path: 'list',
      name: 'List',
      component: '/carmine/list',
      meta: {
        title: 'menus.carmine.list',
        keepAlive: false,
        fixedTab: false
      }
    },
    {
      path: 'active',
      name: 'CarmineActive',
      component: '/carmine/active',
      meta: {
        title: 'menus.carmine.active',
        keepAlive: false,
        fixedTab: false
      }
    },
    {
      path: 'hijhack',
      name: 'Hijack',
      component: '/carmine/hijack',
      meta: {
        title: 'menus.carmine.hijack',
        keepAlive: false,
        fixedTab: false
      }
    },
    {
      path: 'screenshot',
      name: 'Screenshot',
      component: '/carmine/screenshot',
      meta: {
        title: 'menus.carmine.screenshot',
        keepAlive: false,
        fixedTab: false
      }
    }
  ]
}
