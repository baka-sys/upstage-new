<template>
  <section v-loading="loading" class="mb-2">
    <div class="mb-4 flex items-center justify-between gap-4">
      <div class="flex items-center gap-3">
        <div class="size-10 shrink-0 rounded-xl bg-theme/10 text-theme flex-cc">
          <ArtSvgIcon icon="ri:bank-card-line" class="text-xl" />
        </div>
        <div>
          <h2 class="m-0 text-lg font-semibold text-g-900">卡密统计</h2>
          <p class="mt-1 text-xs text-g-500">卡密状态与今日使用情况</p>
        </div>
      </div>
      <span class="rounded-full bg-theme/8 px-3 py-1 text-xs text-theme">
        {{ userCards.length }} 项数据
      </span>
    </div>

    <ElRow :gutter="20">
      <ElCol
        v-for="item in userCards"
        :key="item.key"
        :xs="24"
        :sm="12"
        :md="8"
        :lg="6"
        class="mb-5"
      >
        <div
          class="art-card statistic-card h-full min-h-38 px-5 py-5"
          :class="toneStyles[item.tone].card"
        >
          <div class="flex items-start justify-between">
            <div class="size-11 rounded-xl flex-cc" :class="toneStyles[item.tone].icon">
              <ArtSvgIcon :icon="item.icon" class="text-xl" />
            </div>
            <span class="rounded-md bg-g-100 px-2 py-1 text-[11px] text-g-500">实时统计</span>
          </div>
          <ArtCountTo
            class="mt-4 block text-[30px] leading-none font-semibold tracking-tight text-g-900"
            :target="item.value"
            :duration="1000"
            :decimals="item.decimals"
          />
          <div class="mt-3 text-sm font-semibold text-g-800">{{ item.title }}</div>
          <p class="mt-1 text-xs leading-5 text-g-500">{{ item.description }}</p>
        </div>
      </ElCol>
    </ElRow>
  </section>

  <section v-loading="loading">
    <div class="mb-4 flex items-center justify-between gap-4">
      <div class="flex items-center gap-3">
        <div class="size-10 shrink-0 rounded-xl bg-warning/12 text-warning flex-cc">
          <ArtSvgIcon icon="ri:line-chart-line" class="text-xl" />
        </div>
        <div>
          <h2 class="m-0 text-lg font-semibold text-g-900">劫持统计</h2>
          <p class="mt-1 text-xs text-g-500">普通卡与劫持卡今日数据</p>
        </div>
      </div>
      <span class="rounded-full bg-warning/10 px-3 py-1 text-xs text-warning">
        {{ hackCards.length }} 项数据
      </span>
    </div>

    <ElRow :gutter="20">
      <ElCol
        v-for="item in hackCards"
        :key="item.key"
        :xs="24"
        :sm="12"
        :md="8"
        :lg="6"
        class="mb-5"
      >
        <div
          class="art-card statistic-card h-full min-h-38 px-5 py-5"
          :class="toneStyles[item.tone].card"
        >
          <div class="flex items-start justify-between">
            <div class="size-11 rounded-xl flex-cc" :class="toneStyles[item.tone].icon">
              <ArtSvgIcon :icon="item.icon" class="text-xl" />
            </div>
            <span class="rounded-md bg-g-100 px-2 py-1 text-[11px] text-g-500">今日数据</span>
          </div>
          <ArtCountTo
            class="mt-4 block text-[30px] leading-none font-semibold tracking-tight text-g-900"
            :target="item.value"
            :duration="1000"
          />
          <div class="mt-3 text-sm font-semibold text-g-800">{{ item.title }}</div>
          <p class="mt-1 text-xs leading-5 text-g-500">{{ item.description }}</p>
        </div>
      </ElCol>
    </ElRow>
  </section>
</template>

<script setup lang="ts">
  import { fetchHackCount, fetchUserCount } from '@/api/dashboard'

  type StatisticTone = 'primary' | 'secondary' | 'success' | 'warning' | 'danger'

  interface StatisticCard {
    key: string
    title: string
    value: number
    description: string
    icon: string
    tone: StatisticTone
    decimals?: number
  }

  const toneStyles: Record<StatisticTone, { icon: string; card: string }> = {
    primary: { icon: 'bg-primary/12 text-primary', card: 'statistic-card--primary' },
    secondary: { icon: 'bg-secondary/12 text-secondary', card: 'statistic-card--secondary' },
    success: { icon: 'bg-success/12 text-success', card: 'statistic-card--success' },
    warning: { icon: 'bg-warning/12 text-warning', card: 'statistic-card--warning' },
    danger: { icon: 'bg-danger/12 text-danger', card: 'statistic-card--danger' }
  }

  const loading = ref(false)
  const userCount = ref<Api.Dashboard.UserCount | null>(null)
  const hackCount = ref<Api.Dashboard.HackCount | null>(null)

  const toNumber = (value: number | null | undefined) => value ?? 0

  const userCards = computed<StatisticCard[]>(() => [
    {
      key: 'total',
      title: '卡密总数',
      value: toNumber(userCount.value?.total),
      description: '全部会员卡数量',
      icon: 'ri:bank-card-line',
      tone: 'primary'
    },
    {
      key: 'useTotal',
      title: '今日使用卡密',
      value: toNumber(userCount.value?.useTotal),
      description: '今日已登录使用',
      icon: 'ri:user-follow-line',
      tone: 'success'
    },
    {
      key: 'stopTotal',
      title: '停用卡密',
      value: toNumber(userCount.value?.stopTotal),
      description: '已激活且已过期',
      icon: 'ri:stop-circle-line',
      tone: 'danger'
    },
    {
      key: 'notActiveTotal',
      title: '未激活卡密',
      value: toNumber(userCount.value?.notActiveTotal),
      description: '尚未激活使用',
      icon: 'ri:time-line',
      tone: 'warning'
    },
    {
      key: 'rechargedTotal',
      title: '已充值卡密',
      value: toNumber(userCount.value?.rechargedTotal),
      description: '今日充值统计',
      icon: 'ri:refresh-line',
      tone: 'secondary'
    },
    {
      key: 'rechargedDays',
      title: '今日充值天数',
      value: toNumber(userCount.value?.rechargedDays),
      description: '今日累计充值天数',
      icon: 'ri:calendar-check-line',
      tone: 'primary',
      decimals: 1
    },
    {
      key: 'userLoginTotal',
      title: '今日进人总数',
      value: toNumber(userCount.value?.userLoginTotal),
      description: '今日累计进人数量',
      icon: 'ri:group-line',
      tone: 'success'
    },
    {
      key: 'customerOnlineTotal',
      title: '今日开卡数量',
      value: toNumber(userCount.value?.customerOnlineTotal),
      description: '今日激活会员卡',
      icon: 'ri:user-add-line',
      tone: 'warning'
    },
    {
      key: 'points',
      title: '今日积分消耗',
      value: toNumber(userCount.value?.points),
      description: '今日累计消耗积分',
      icon: 'ri:coins-line',
      tone: 'danger'
    }
  ])

  const hackCards = computed<StatisticCard[]>(() => [
    {
      key: 'localTotal',
      title: '普通卡今日进人',
      value: toNumber(hackCount.value?.localTotal),
      description: '普通卡今日进人统计',
      icon: 'ri:user-line',
      tone: 'primary'
    },
    {
      key: 'hackTotal',
      title: '劫持卡今日进人',
      value: toNumber(hackCount.value?.hackTotal),
      description: '劫持卡今日进人统计',
      icon: 'ri:user-search-line',
      tone: 'success'
    },
    {
      key: 'ahackTotal',
      title: 'A卡劫持统计',
      value: toNumber(hackCount.value?.ahackTotal),
      description: 'A卡今日统计',
      icon: 'ri:bar-chart-box-line',
      tone: 'warning'
    },
    {
      key: 'bhackTotal',
      title: 'B卡劫持统计',
      value: toNumber(hackCount.value?.bhackTotal),
      description: 'B卡今日统计',
      icon: 'ri:bar-chart-box-line',
      tone: 'secondary'
    },
    {
      key: 'chackTotal',
      title: 'C卡劫持统计',
      value: toNumber(hackCount.value?.chackTotal),
      description: 'C卡今日统计',
      icon: 'ri:bar-chart-box-line',
      tone: 'primary'
    },
    {
      key: 'todayHackTotal',
      title: '今日实际劫持量',
      value: toNumber(hackCount.value?.todayHackTotal),
      description: '今日实际劫持统计',
      icon: 'ri:line-chart-line',
      tone: 'danger'
    }
  ])

  const loadStatistics = async () => {
    loading.value = true
    try {
      const [userData, hackData] = await Promise.all([fetchUserCount(), fetchHackCount()])
      userCount.value = userData
      hackCount.value = hackData
    } finally {
      loading.value = false
    }
  }

  onMounted(loadStatistics)
</script>

<style scoped>
  .statistic-card {
    background: linear-gradient(
      145deg,
      color-mix(in srgb, var(--statistic-color) 7%, var(--default-box-color)),
      var(--default-box-color) 72%
    ) !important;
    border-color: color-mix(in srgb, var(--statistic-color) 16%, var(--art-card-border)) !important;
    transition:
      transform 0.2s ease,
      box-shadow 0.2s ease;
  }

  .statistic-card:hover {
    box-shadow: 0 10px 28px color-mix(in srgb, var(--statistic-color) 12%, transparent) !important;
    transform: translateY(-3px);
  }

  .statistic-card--primary {
    --statistic-color: var(--art-primary);
  }

  .statistic-card--secondary {
    --statistic-color: var(--art-secondary);
  }

  .statistic-card--success {
    --statistic-color: var(--art-success);
  }

  .statistic-card--warning {
    --statistic-color: var(--art-warning);
  }

  .statistic-card--danger {
    --statistic-color: var(--art-danger);
  }
</style>
