<template>
  <div class="h-full gva-container2 overflow-auto bg-slate-50/60 dark:bg-slate-900">
    <div class="space-y-4 p-4 lg:p-6">
      <!-- 欢迎区域 -->
      <section
        class="relative overflow-hidden rounded-xl border border-slate-200/80 bg-white px-5 py-6 shadow-sm dark:border-slate-700 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900"
      >
        <div class="relative flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p class="text-xs tracking-[0.2em] text-slate-500 dark:text-slate-400">DASHBOARD</p>
            <h1 class="mt-2 text-xl font-semibold text-slate-900 dark:text-slate-100 lg:text-2xl">
              欢迎使用柴米油盐后台管理系统
            </h1>
            <p class="mt-2 text-sm text-slate-600 dark:text-slate-300">
              {{ today }} · 斗地主游戏后台管理系统
            </p>
          </div>
          <div class="flex items-center gap-2">
            <el-button type="primary" @click="refreshData">
              <el-icon class="mr-1"><Refresh /></el-icon>
              刷新数据
            </el-button>
          </div>
        </div>
      </section>

      <!-- 核心数据统计卡片 -->
      <div class="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6">
        <stats-card
          title="总玩家数"
          :value="overviewStats.totalPlayers"
          icon="User"
          color="blue"
          :loading="loading"
        />
        <stats-card
          title="活跃玩家(7日)"
          :value="overviewStats.activePlayers"
          icon="UserFilled"
          color="green"
          :loading="loading"
        />
        <stats-card
          title="今日新增"
          :value="overviewStats.todayNewPlayers"
          icon="Plus"
          color="orange"
          :loading="loading"
        />
        <stats-card
          title="总游戏场次"
          :value="overviewStats.totalGames"
          icon="TrendCharts"
          color="purple"
          :loading="loading"
        />
        <stats-card
          title="今日游戏"
          :value="overviewStats.todayGames"
          icon="Calendar"
          color="cyan"
          :loading="loading"
        />
        <stats-card
          title="总金币存量"
          :value="overviewStats.totalCoins"
          icon="Coin"
          color="yellow"
          :loading="loading"
        />
      </div>

      <div class="grid grid-cols-1 items-stretch gap-4 xl:grid-cols-12">
        <!-- 左侧图表区域 -->
        <div class="grid grid-cols-1 gap-4 content-start xl:col-span-8 xl:h-full">
          <!-- 活跃趋势图 -->
          <gva-card title="活跃玩家趋势">
            <div class="h-[300px]">
              <active-chart :data="activeChartData" :loading="chartLoading" />
            </div>
          </gva-card>

          <!-- 游戏场次趋势图 -->
          <gva-card title="游戏场次趋势">
            <div class="h-[300px]">
              <games-chart :data="gamesChartData" :loading="chartLoading" />
            </div>
          </gva-card>

          <!-- 排行榜 -->
          <gva-card title="金币排行榜 TOP 10">
            <leaderboard-table :data="leaderboardData" :loading="leaderboardLoading" />
          </gva-card>
        </div>

        <!-- 右侧快捷入口 -->
        <div class="flex flex-col gap-4 xl:col-span-4 xl:h-full">
          <gva-card title="快捷功能" show-action custom-class="min-h-[200px]">
            <gva-quick-link />
          </gva-card>

          <!-- 今日数据概览 -->
          <gva-card title="今日数据" custom-class="min-h-[200px]">
            <div class="space-y-4">
              <div class="flex items-center justify-between p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <span class="text-sm text-slate-600 dark:text-slate-300">今日新增玩家</span>
                <span class="text-xl font-bold text-blue-600">{{ overviewStats.todayNewPlayers }}</span>
              </div>
              <div class="flex items-center justify-between p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                <span class="text-sm text-slate-600 dark:text-slate-300">今日游戏场次</span>
                <span class="text-xl font-bold text-green-600">{{ overviewStats.todayGames }}</span>
              </div>
              <div class="flex items-center justify-between p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                <span class="text-sm text-slate-600 dark:text-slate-300">活跃玩家(7日)</span>
                <span class="text-xl font-bold text-purple-600">{{ overviewStats.activePlayers }}</span>
              </div>
              <div class="flex items-center justify-between p-3 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
                <span class="text-sm text-slate-600 dark:text-slate-300">总玩家数</span>
                <span class="text-xl font-bold text-orange-600">{{ overviewStats.totalPlayers }}</span>
              </div>
            </div>
          </gva-card>

          <!-- 游戏类型分布 -->
          <gva-card title="游戏类型分布" custom-class="min-h-[200px]">
            <div class="space-y-3">
              <div>
                <div class="flex justify-between text-sm mb-1">
                  <span class="text-slate-600 dark:text-slate-300">普通场</span>
                  <span class="font-medium">65%</span>
                </div>
                <el-progress :percentage="65" :show-text="false" color="#3b82f6" />
              </div>
              <div>
                <div class="flex justify-between text-sm mb-1">
                  <span class="text-slate-600 dark:text-slate-300">初级场</span>
                  <span class="font-medium">20%</span>
                </div>
                <el-progress :percentage="20" :show-text="false" color="#22c55e" />
              </div>
              <div>
                <div class="flex justify-between text-sm mb-1">
                  <span class="text-slate-600 dark:text-slate-300">中级场</span>
                  <span class="font-medium">10%</span>
                </div>
                <el-progress :percentage="10" :show-text="false" color="#f59e0b" />
              </div>
              <div>
                <div class="flex justify-between text-sm mb-1">
                  <span class="text-slate-600 dark:text-slate-300">高级场</span>
                  <span class="font-medium">5%</span>
                </div>
                <el-progress :percentage="5" :show-text="false" color="#ef4444" />
              </div>
            </div>
          </gva-card>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
  import { ref, onMounted, computed } from 'vue'
  import { Refresh } from '@element-plus/icons-vue'
  import {
    getOverviewStats,
    getLeaderboard,
    getDailyActiveChart,
    getDailyGamesChart
  } from '@/api/ddz/stats'
  import StatsCard from './components/statsCard.vue'
  import ActiveChart from './components/activeChart.vue'
  import GamesChart from './components/gamesChart.vue'
  import LeaderboardTable from './components/leaderboardTable.vue'
  import { GvaCard, GvaQuickLink } from './components'

  const loading = ref(true)
  const chartLoading = ref(true)
  const leaderboardLoading = ref(true)

  const overviewStats = ref({
    totalPlayers: 0,
    activePlayers: 0,
    onlinePlayers: 0,
    totalGames: 0,
    todayGames: 0,
    todayNewPlayers: 0,
    avgOnlineTime: 0,
    avgGameDuration: 0,
    totalCoins: 0
  })

  const activeChartData = ref({
    labels: [],
    data: []
  })

  const gamesChartData = ref({
    labels: [],
    data: []
  })

  const leaderboardData = ref([])

  const today = computed(() => {
    try {
      const d = new Date()
      return d.toLocaleDateString('zh-CN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
      })
    } catch (e) {
      return new Date().toISOString().slice(0, 10)
    }
  })

  // 获取日期范围（最近7天）
  const getDateRange = () => {
    const end = new Date()
    const start = new Date()
    start.setDate(start.getDate() - 7)
    return {
      startDate: start.toISOString().split('T')[0],
      endDate: end.toISOString().split('T')[0]
    }
  }

  // 获取概览统计
  const fetchOverviewStats = async () => {
    loading.value = true
    try {
      const res = await getOverviewStats()
      if (res.code === 0) {
        overviewStats.value = res.data
      }
    } catch (error) {
      console.error('获取概览统计失败:', error)
    } finally {
      loading.value = false
    }
  }

  // 获取活跃图表数据
  const fetchActiveChartData = async () => {
    chartLoading.value = true
    try {
      const { startDate, endDate } = getDateRange()
      const res = await getDailyActiveChart(startDate, endDate)
      if (res.code === 0) {
        activeChartData.value = res.data
      }
    } catch (error) {
      console.error('获取活跃数据失败:', error)
    } finally {
      chartLoading.value = false
    }
  }

  // 获取游戏场次图表数据
  const fetchGamesChartData = async () => {
    try {
      const { startDate, endDate } = getDateRange()
      const res = await getDailyGamesChart(startDate, endDate)
      if (res.code === 0) {
        gamesChartData.value = res.data
      }
    } catch (error) {
      console.error('获取游戏数据失败:', error)
    }
  }

  // 获取排行榜
  const fetchLeaderboard = async () => {
    leaderboardLoading.value = true
    try {
      const res = await getLeaderboard({ rankType: 'coins', limit: 10 })
      if (res.code === 0) {
        leaderboardData.value = res.data.list || []
      }
    } catch (error) {
      console.error('获取排行榜失败:', error)
    } finally {
      leaderboardLoading.value = false
    }
  }

  // 刷新所有数据
  const refreshData = async () => {
    await Promise.all([
      fetchOverviewStats(),
      fetchActiveChartData(),
      fetchGamesChartData(),
      fetchLeaderboard()
    ])
  }

  onMounted(() => {
    refreshData()
  })

  defineOptions({
    name: 'Dashboard'
  })
</script>

<style lang="scss" scoped></style>
