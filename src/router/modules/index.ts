import { AppRouteRecord } from '@/types/router'
import { dashboardRoutes } from './dashboard'
import { systemRoutes } from './system'
import { carmineRoutes } from './carmine'
import { recordRoutes } from './record'
import { codeRoutes } from './code'
import { systemDomainRoutes } from './system-domain'
import { planConfigRoutes } from './plan-config'
import { systemConfigRoutes } from './system-config'

/**
 * 导出所有模块化路由
 */
export const routeModules: AppRouteRecord[] = [
  dashboardRoutes,
  carmineRoutes,
  recordRoutes,
  codeRoutes,
  systemDomainRoutes,
  planConfigRoutes,
  systemConfigRoutes,
  systemRoutes
  // resultRoutes,
  // exceptionRoutes
]
