/**
 * API 接口类型定义模块
 *
 * 提供所有后端接口的类型定义
 *
 * ## 主要功能
 *
 * - 通用类型（分页参数、响应结构等）
 * - 认证类型（登录、用户信息等）
 * - 系统管理类型（用户、角色等）
 * - 全局命名空间声明
 *
 * ## 使用场景
 *
 * - API 请求参数类型约束
 * - API 响应数据类型定义
 * - 接口文档类型同步
 *
 * ## 注意事项
 *
 * - 在 .vue 文件使用需要在 eslint.config.mjs 中配置 globals: { Api: 'readonly' }
 * - 使用全局命名空间，无需导入即可使用
 *
 * ## 使用方式
 *
 * ```typescript
 * const params: Api.Auth.LoginParams = { userName: 'admin', password: '123456' }
 * const response: Api.Auth.UserInfo = await fetchUserInfo()
 * ```
 *
 * @module types/api/api
 * @author Art Design Pro Team
 */

declare namespace Api {
  /** 通用类型 */
  namespace Common {
    /** 分页参数 */
    interface PaginationParams {
      /** 当前页码 */
      current: number
      /** 每页条数 */
      size: number
      /** 总条数 */
      total: number
    }

    /** 通用搜索参数 */
    type CommonSearchParams = Pick<PaginationParams, 'page' | 'limit'>

    /** 分页响应基础结构 */
    interface PaginatedResponse<T = any> {
      records: T[]
      current: number
      size: number
      total: number
    }

    /** 启用状态 */
    type EnableStatus = '1' | '2'
  }

  /** 认证类型 */
  namespace Auth {
    /** 登录参数 */
    interface LoginParams {
      account: string
      password: string
    }

    /** 登录响应 */
    interface LoginResponse {
      token: string
      refreshToken: string
      imageUrl: string
    }

    /** 用户信息 */
    interface UserInfo {
      buttons: string[]
      roles: string[]
      userId: number
      username: string
      email: string
      avatar?: string
    }
  }

  /** 仪表盘统计 */
  namespace Dashboard {
    /** 卡密与使用情况统计（GET /user/count） */
    interface UserCount {
      total: number | null
      useTotal: number | null
      stopTotal: number | null
      notActiveTotal: number | null
      rechargedTotal: number | null
      rechargedDays: number | null
      userLoginTotal: number | null
      customerOnlineTotal: number | null
      points: number | null
    }

    /** 劫持统计（GET /user/countRadio） */
    interface HackCount {
      localTotal: number | null
      hackTotal: number | null
      ahackTotal: number | null
      bhackTotal: number | null
      chackTotal: number | null
      todayHackTotal: number | null
    }
  }

  /** 企业账号管理 */
  namespace AccountManage {
    /** 0：启用；1：禁用 */
    type AccountStatus = 0 | 1

    interface AccountPageParams {
      keyword?: string
      page: number
      limit: number
    }

    interface AccountListItem {
      id: number | string
      accountName: string
      img?: string
      account: string
      phoneNumber?: number | string
      accountKey?: string
      status: AccountStatus
      points?: number
      creditPoints?: number
      hackRate?: number
      createTime?: string
      updateTime?: string
      loginTime?: string
    }

    type AccountPageList = Api.Common.PaginatedResponse<AccountListItem>

    interface AddAccountParams {
      accountName: string
      img?: string
      account: string
      password: string
      confirmPassword: string
      phoneNumber?: number
      status: AccountStatus
    }

    interface UpdateAccountInfoParams {
      id: number | string
      accountName: string
      img?: string
    }

    interface UpdateAccountPasswordParams {
      id: number | string
      newPassword: string
      confirmPassword: string
    }

    interface UpdateAccountStatusParams {
      id: number | string
      status: AccountStatus
    }

    interface RechargeAccountParams {
      accountId: number | string
      coin: number
    }
  }

  /** 系统管理类型 */
  namespace SystemManage {
    /** 用户列表 */
    type UserList = Api.Common.PaginatedResponse<UserListItem>

    /** 用户列表项 */
    interface UserListItem {
      id: number
      avatar: string
      status: string
      userName: string
      userGender: string
      nickName: string
      userPhone: string
      userEmail: string
      userRoles: string[]
      createBy: string
      createTime: string
      updateBy: string
      updateTime: string
    }

    /** 用户搜索参数 */
    type UserSearchParams = Partial<
      Pick<UserListItem, 'id' | 'userName' | 'userGender' | 'userPhone' | 'userEmail' | 'status'> &
        Api.Common.CommonSearchParams
    >

    /** 角色列表 */
    type RoleList = Api.Common.PaginatedResponse<RoleListItem>

    /** 角色列表项 */
    interface RoleListItem {
      roleId: number
      roleName: string
      roleCode: string
      description: string
      enabled: boolean
      createTime: string
    }

    /** 角色搜索参数 */
    type RoleSearchParams = Partial<
      Pick<RoleListItem, 'roleId' | 'roleName' | 'roleCode' | 'description' | 'enabled'> &
        Api.Common.CommonSearchParams & {
          startTime: string | null
          endTime: string | null
        }
    >
  }
  /**
   * 卡密管理
   */
  namespace CarmineMange {
    /** 账号状态：0 启用，1 禁用 */
    type CarmineStatus = 0 | 1

    /** 卡密状态：0 未激活，1 已激活，2 已续费，3 已过期 */
    type CarmineActiveState = 0 | 1 | 2 | 3

    /** 卡密类型：0 会员卡，1 测试卡 */
    type CarmineType = 0 | 1

    /** 卡密列表 */
    type CarmineList = Api.Common.PaginatedResponse<CarmineListItem>

    /** 卡密列表项 */
    interface CarmineListItem {
      img: string
      id: number
      name: string
      status: number
      carmine: string
      password: string
      activeState: number
      phoneNumber: string
      expirationDate: string
      loginTime: string
      activeTime: string
      updateTime: string
    }

    /** 总后台卡密列表 */
    type CardList = Api.Common.PaginatedResponse<CardListItem>

    /** 总后台卡密列表实际返回项 */
    interface CardListItem {
      carmine?: string
      status?: CarmineStatus
      activeState?: CarmineActiveState
      expirationDate?: string
      loginTime?: string
    }

    /** 卡密列表请求参数 */
    interface CarminePageParams {
      userName?: string
      status?: CarmineStatus
      activeState?: CarmineActiveState
      testCard?: CarmineType
      pastDue?: 0 | 1
      page: number
      limit: number
    }

    /** 卡密列表搜索表单 */
    type CarmineSearchParams = Partial<Omit<CarminePageParams, 'page' | 'limit'>>

    /** 批量生成卡密参数 */
    interface GenerateCarmineParams {
      lines: number
      password?: string
      shellType?: number
      days: number
      testCard: CarmineType
      qrcodeSwitch?: 0 | 1 | 2
      prefixString?: string
      maxNumber?: number
      /** 1 普通卡，2 劫持卡 */
      isSearch?: 1 | 2
      accountId?: number
    }

    /** 批量续费卡密参数 */
    interface RenewCarmineParams {
      carmines: string
      days: number
      maxNumber: number
    }

    /** 批量禁用卡密参数 */
    interface FreezeCarmineParams {
      carmines: string
    }

    /** 卡密截图列表请求参数 */
    interface ActivePageParams {
      carmine?: string
      keywords?: string
      page: number
      limit: number
    }

    /** 卡密截图列表 */
    type ActivePageList = Api.Common.PaginatedResponse<ActivePageListItem>

    /** 卡密截图列表项 */
    interface ActivePageListItem {
      id?: number
      carmine?: string
      name?: string
      notes?: string
      img?: string
      userAccount?: string
      phoneNumber?: string
      maxNumber?: number
      totalNumber?: number
      number?: number
      todayTotal?: number
      type?: number
      shellType?: number
      status?: number
      ipAddress?: string
      accountId?: number | string
      accountName?: string
      equipmentCode?: string
      ipDistrict?: string
      browserName?: string
      platform?: string
      userKey?: string
      createTime?: string
      updateTime?: string
      loginTime?: string
      days?: number
      expirationDate?: string
      activeState?: number
      url?: string
      testCard?: number
      scanNumber?: number
      isSearch?: number | boolean
      sayHellos?: string
      dosage?: number
      entryRatio?: number | string
    }

    /** 劫持比例配置（EntryRatioDTO / EntryRatioVO） */
    interface EntryRatioItem {
      id?: number
      mainUserId?: number
      mainCarmine?: string
      subUserId?: number
      subCarmine?: string
      mainRadioNumber?: number
      subRadioNumber?: number
      mainNumber?: number
      subNumber?: number
      switchCode?: 0 | 1
      mainNumberTotal?: number
      systemTotalNumber?: number
      mainNumberTotalTwo?: number
      systemTotalNumberTwo?: number
      subUserIdTwo?: number
      subCarmineTwo?: string
      mainRadioNumberTwo?: number
      subRadioNumberTwo?: number
      mainNumberTwo?: number
      subNumberTwo?: number
      switchCodeTwo?: 0 | 1
      hackNumber?: number
      bcHackNumber?: number
      dosage?: number
      startTime?: string
      createTime?: string
      updateTime?: string
    }

    /** 新增或修改劫持比例参数 */
    interface SaveEntryRatioParams extends EntryRatioItem {
      mainUserId: number
    }

    /** 劫持管理分页参数 */
    interface EntryRatioPageParams {
      accountId?: number
      page: number
      limit: number
    }

    /** 劫持管理分页结果 */
    type EntryRatioPageList = Api.Common.PaginatedResponse<EntryRatioItem>

    /** 企业账户下拉项（GET /account/list） */
    interface AccountListItem {
      id: number
      accountName: string
      account: string
    }

    type HijackAccountItem = AccountListItem

    /** 劫持默认配置中的卡密项 */
    interface EntryRatioCarmineItem {
      carmine: string
      /** 主表 cs_setting id */
      mainId?: number
      /** 劫持卡密 id */
      userId?: number
      /** 已劫持数量 */
      number: number
      updateTime?: string
    }

    /** 劫持默认配置 */
    interface EntryRatioSetting {
      id?: number | string
      mainNumberTwo?: number
      subNumberTwo?: number
      hijackMainNumberTwo?: number
      hijackSubNumberTwo?: number
      excludeCard?: string
      delayTime?: number
      hackTotalNumber?: number
      totalNumber?: number
      updateTime?: string
      carmines?: EntryRatioCarmineItem[]
    }

    /** 修改劫持默认配置请求参数 */
    interface UpdateEntryRatioSettingParams {
      id: number | string
      mainNumberTwo: number
      subNumberTwo: number
      hijackMainNumberTwo: number
      hijackSubNumberTwo: number
      excludeCard: string
      delayTime: number
      hackTotalNumber: number
      totalNumber: number
      carmines: EntryRatioCarmineItem[]
    }

    /** 全部修改比例配置请求参数 */
    interface BatchUpdateAllEntryRatioParams {
      /** 1：普通卡；2：劫持卡 */
      type: 1 | 2
      mainRadioNumberTwo: number
      subRadioNumberTwo: number
      /** 0：开；1：关 */
      switchCodeTwo: 0 | 1
    }
  }

  /** 积分记录 */
  namespace RecordManage {
    type RecordType = 1 | 2 | 3

    interface RecordPageParams {
      type?: RecordType
      accountId?: number | string
      startTime?: string
      endTime?: string
      page: number
      limit: number
    }

    interface RecordListItem {
      id: number
      accountId: number | string
      type: RecordType
      points: number
      beforeOperation: number
      afterOperation: number
      remark?: string
      ipAddress?: string
      createTime: string
    }

    type RecordPageList = Api.Common.PaginatedResponse<RecordListItem>

    interface AccountListItem {
      id: number | string
      accountName: string
      account: string
    }
  }

  /** 活码域名 */
  namespace CodeManage {
    type CodeType = 0 | 1 | 2
    type BatchAddCodeType = 0 | 1

    interface CodePageParams {
      type: CodeType
      domainName?: string
      platformType?: number
      page: number
      limit: number
    }

    interface CodePageListItem {
      id: number
      type: CodeType
      shellType?: number
      platformType?: number
      domainName?: string
      sort?: number
      number?: number
      requestNumber?: number
      status?: number
      deleted?: number
      deleteTime?: string
      createTime?: string
      updateTime?: string
      direct?: string
      carmineSet?: unknown
    }

    type CodePageList = Api.Common.PaginatedResponse<CodePageListItem>

    interface AddCodeBatchParams {
      domainNames: string
      type: BatchAddCodeType
      platformType?: number
      direct?: 0 | 1
    }

    interface ResetCodeBatchParams {
      /** 主键以英文逗号分隔 */
      ids: string
      /** 使用当前 Tab 类型；0、1、2 均支持批量重置 */
      type: CodeType
    }

    interface DeleteCodeBatchParams {
      /** 主键以英文逗号分隔；公共、专属、备用活码均支持批量删除 */
      ids: string
    }

    interface UpdateCodeStatusParams {
      id: number
    }
  }

  /** 系统配置域名 */
  namespace SystemDomainManage {
    type DomainType = 1 | 2 | 3
    type DomainStatus = 0 | 1

    interface SystemDomainPageParams {
      type?: DomainType
      status?: DomainStatus
      page: number
      limit: number
    }

    interface BatchAddSystemDomainParams {
      domainNames: string
      type: DomainType
    }

    interface SystemDomainPageListItem {
      id: number
      domainUrl: string
      type: DomainType | number
      status: DomainStatus | number
      updateTime?: string
      createTime?: string
    }

    type SystemDomainPageList = Api.Common.PaginatedResponse<SystemDomainPageListItem>
  }

  /** 问答方案设置 */
  namespace PlanConfigManage {
    type PlanStatus = 0 | 1
    /** 当前后端仅定义 0：验证码。 */
    type PlanType = 0
    /** 0：默认；1：非默认。 */
    type PlanDefaultStatus = 0 | 1

    interface PlanConfigPageParams {
      page: number
      limit: number
    }

    interface AddPlanConfigParams {
      title: string
      img: string
      content: string
      /** 0：开启；1：关闭。新增方案默认传 0。 */
      status: PlanStatus
      type: PlanType
      defaultStatus: PlanDefaultStatus
    }

    interface UpdatePlanConfigParams extends AddPlanConfigParams {
      id: number
    }

    interface DeletePlanConfigParams {
      id: number
    }

    interface UpdatePlanConfigStatusParams {
      id: number
      /** 0：开启；1：关闭。 */
      status: PlanStatus
    }

    interface SetPlanConfigDefaultParams {
      id: number
    }

    interface PlanConfigPageListItem {
      id: number
      title: string
      /** 后续详情或编辑页面使用。 */
      img?: string
      /** 后续详情或编辑页面使用。 */
      content?: string
      /** 0：开启；1：关闭。 */
      status: PlanStatus | number
      /** 当前后端仅定义 0：验证码。 */
      type: PlanType | number
      /** 0：默认；1：非默认。 */
      defaultStatus: PlanDefaultStatus | number
      createTime?: string
      updateTime?: string
    }

    type PlanConfigPageList = Api.Common.PaginatedResponse<PlanConfigPageListItem>
  }

  /** 链接管理 */
  namespace AccountUrlMainManage {
    type UrlType = 1 | 2 | 3
    type RelationType = 1 | 2

    interface AccountUrlMainPageParams {
      urlType?: UrlType
      relationType?: RelationType
      page: number
      limit: number
    }

    interface AccountUrlMainListItem {
      id: number
      urlType: UrlType | number
      mainVisitUrl: string
      relationType: RelationType | number
      accountUrl?: unknown
      visitUrl?: string
      createTime?: string
      updateTime?: string
    }

    type AccountUrlMainPageList = Api.Common.PaginatedResponse<AccountUrlMainListItem>

    interface UpdateAccountUrlMainParams {
      id: number
      urlType: UrlType
      mainVisitUrl: string
      relationType: RelationType
    }

    interface CopyAccountUrlMainParams {
      urlType?: UrlType
    }
  }
}
