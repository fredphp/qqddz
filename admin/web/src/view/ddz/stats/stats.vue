<template>
  <div>
    <!-- 概览统计卡片 -->
    <el-row :gutter="20" class="stat-cards">
      <el-col :span="6">
        <el-card shadow="hover">
          <div class="stat-card">
            <div class="stat-icon" style="background: #409eff;">
              <el-icon size="32"><User /></el-icon>
            </div>
            <div class="stat-info">
              <div class="stat-value">{{ overviewStats.totalPlayers }}</div>
              <div class="stat-label">总玩家数</div>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card shadow="hover">
          <div class="stat-card">
            <div class="stat-icon" style="background: #67c23a;">
              <el-icon size="32"><TrendCharts /></el-icon>
            </div>
            <div class="stat-info">
              <div class="stat-value">{{ overviewStats.activePlayers }}</div>
              <div class="stat-label">活跃玩家(7天)</div>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card shadow="hover">
          <div class="stat-card">
            <div class="stat-icon" style="background: #e6a23c;">
              <el-icon size="32"><Trophy /></el-icon>
            </div>
            <div class="stat-info">
              <div class="stat-value">{{ overviewStats.totalGames }}</div>
              <div class="stat-label">总游戏场次</div>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card shadow="hover">
          <div class="stat-card">
            <div class="stat-icon" style="background: #f56c6c;">
              <el-icon size="32"><Calendar /></el-icon>
            </div>
            <div class="stat-info">
              <div class="stat-value">{{ overviewStats.todayGames }}</div>
              <div class="stat-label">今日场次</div>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 图表区域 -->
    <el-row :gutter="20">
      <el-col :span="12">
        <el-card shadow="hover">
          <template #header>
            <div class="card-header">
              <span>每日活跃玩家</span>
              <el-date-picker
                v-model="chartDateRange"
                type="daterange"
                range-separator="至"
                start-placeholder="开始日期"
                end-placeholder="结束日期"
                format="YYYY-MM-DD"
                value-format="YYYY-MM-DD"
                @change="loadCharts"
              />
            </div>
          </template>
          <div class="chart-container" ref="activeChartRef"></div>
        </el-card>
      </el-col>
      <el-col :span="12">
        <el-card shadow="hover">
          <template #header>
            <div class="card-header">
              <span>每日游戏场次</span>
            </div>
          </template>
          <div class="chart-container" ref="gamesChartRef"></div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 排行榜区域 -->
    <el-row :gutter="20" style="margin-top: 20px;">
      <el-col :span="8">
        <el-card shadow="hover">
          <template #header>
            <div class="card-header">
              <span>金币排行</span>
            </div>
          </template>
          <el-table :data="coinsLeaderboard" max-height="300">
            <el-table-column align="center" label="排名" width="60">
              <template #default="scope">
                <el-tag v-if="scope.row.rank === 1" type="danger" effect="dark">1</el-tag>
                <el-tag v-else-if="scope.row.rank === 2" type="warning" effect="dark">2</el-tag>
                <el-tag v-else-if="scope.row.rank === 3" type="success" effect="dark">3</el-tag>
                <span v-else>{{ scope.row.rank }}</span>
              </template>
            </el-table-column>
            <el-table-column align="center" label="玩家" prop="nickname" />
            <el-table-column align="center" label="金币">
              <template #default="scope">
                {{ formatNumber(scope.row.score) }}
              </template>
            </el-table-column>
          </el-table>
        </el-card>
      </el-col>
      <el-col :span="8">
        <el-card shadow="hover">
          <template #header>
            <div class="card-header">
              <span>胜率排行</span>
            </div>
          </template>
          <el-table :data="winrateLeaderboard" max-height="300">
            <el-table-column align="center" label="排名" width="60">
              <template #default="scope">
                <el-tag v-if="scope.row.rank === 1" type="danger" effect="dark">1</el-tag>
                <el-tag v-else-if="scope.row.rank === 2" type="warning" effect="dark">2</el-tag>
                <el-tag v-else-if="scope.row.rank === 3" type="success" effect="dark">3</el-tag>
                <span v-else>{{ scope.row.rank }}</span>
              </template>
            </el-table-column>
            <el-table-column align="center" label="玩家" prop="nickname" />
            <el-table-column align="center" label="胜率">
              <template #default="scope">
                {{ scope.row.winRate?.toFixed(1) }}%
              </template>
            </el-table-column>
          </el-table>
        </el-card>
      </el-col>
      <el-col :span="8">
        <el-card shadow="hover">
          <template #header>
            <div class="card-header">
              <span>胜场排行</span>
            </div>
          </template>
          <el-table :data="winsLeaderboard" max-height="300">
            <el-table-column align="center" label="排名" width="60">
              <template #default="scope">
                <el-tag v-if="scope.row.rank === 1" type="danger" effect="dark">1</el-tag>
                <el-tag v-else-if="scope.row.rank === 2" type="warning" effect="dark">2</el-tag>
                <el-tag v-else-if="scope.row.rank === 3" type="success" effect="dark">3</el-tag>
                <span v-else>{{ scope.row.rank }}</span>
              </template>
            </el-table-column>
            <el-table-column align="center" label="玩家" prop="nickname" />
            <el-table-column align="center" label="胜场" prop="score" />
          </el-table>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup>
import { ref, onMounted, nextTick } from 'vue'
import { User, TrendCharts, Trophy, Calendar } from '@element-plus/icons-vue'
import * as echarts from 'echarts'
import { getOverviewStats, getLeaderboard, getDailyActiveChart, getDailyGamesChart } from '@/api/ddz/stats'

defineOptions({
  name: 'DDZStats'
})

const overviewStats = ref({
  totalPlayers: 0,
  activePlayers: 0,
  totalGames: 0,
  todayGames: 0
})
const coinsLeaderboard = ref([])
const winrateLeaderboard = ref([])
const winsLeaderboard = ref([])
const chartDateRange = ref([])
const activeChartRef = ref(null)
const gamesChartRef = ref(null)

let activeChart = null
let gamesChart = null

const formatNumber = (num) => {
  if (num >= 100000000) {
    return (num / 100000000).toFixed(2) + '亿'
  } else if (num >= 10000) {
    return (num / 10000).toFixed(2) + '万'
  }
  return num?.toLocaleString() || '0'
}

const loadOverview = async () => {
  const res = await getOverviewStats()
  if (res.code === 0) {
    overviewStats.value = res.data
  }
}

const loadLeaderboards = async () => {
  const [coinsRes, winrateRes, winsRes] = await Promise.all([
    getLeaderboard({ rankType: 'coins', limit: 10 }),
    getLeaderboard({ rankType: 'winrate', limit: 10 }),
    getLeaderboard({ rankType: 'wins', limit: 10 })
  ])
  if (coinsRes.code === 0) {
    coinsLeaderboard.value = coinsRes.data.list
  }
  if (winrateRes.code === 0) {
    winrateLeaderboard.value = winrateRes.data.list
  }
  if (winsRes.code === 0) {
    winsLeaderboard.value = winsRes.data.list
  }
}

const loadCharts = async () => {
  const endDate = new Date()
  const startDate = new Date()
  startDate.setDate(startDate.getDate() - 7)

  const start = chartDateRange.value?.[0] || formatDate(startDate)
  const end = chartDateRange.value?.[1] || formatDate(endDate)

  const [activeRes, gamesRes] = await Promise.all([
    getDailyActiveChart(start, end),
    getDailyGamesChart(start, end)
  ])

  await nextTick()

  if (activeRes.code === 0) {
    renderActiveChart(activeRes.data)
  }
  if (gamesRes.code === 0) {
    renderGamesChart(gamesRes.data)
  }
}

const formatDate = (date) => {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

const renderActiveChart = (data) => {
  if (!activeChartRef.value) return
  if (activeChart) {
    activeChart.dispose()
  }
  activeChart = echarts.init(activeChartRef.value)
  activeChart.setOption({
    tooltip: {
      trigger: 'axis'
    },
    xAxis: {
      type: 'category',
      data: data.labels
    },
    yAxis: {
      type: 'value'
    },
    series: [{
      data: data.data,
      type: 'line',
      smooth: true,
      areaStyle: {
        color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
          { offset: 0, color: 'rgba(64, 158, 255, 0.5)' },
          { offset: 1, color: 'rgba(64, 158, 255, 0.1)' }
        ])
      },
      lineStyle: {
        color: '#409eff'
      },
      itemStyle: {
        color: '#409eff'
      }
    }]
  })
}

const renderGamesChart = (data) => {
  if (!gamesChartRef.value) return
  if (gamesChart) {
    gamesChart.dispose()
  }
  gamesChart = echarts.init(gamesChartRef.value)
  gamesChart.setOption({
    tooltip: {
      trigger: 'axis'
    },
    xAxis: {
      type: 'category',
      data: data.labels
    },
    yAxis: {
      type: 'value'
    },
    series: [{
      data: data.data,
      type: 'bar',
      itemStyle: {
        color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
          { offset: 0, color: '#e6a23c' },
          { offset: 1, color: '#f5dab1' }
        ])
      }
    }]
  })
}

onMounted(() => {
  loadOverview()
  loadLeaderboards()
  loadCharts()
})
</script>

<style scoped>
.stat-cards {
  margin-bottom: 20px;
}
.stat-card {
  display: flex;
  align-items: center;
}
.stat-icon {
  width: 60px;
  height: 60px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
}
.stat-info {
  margin-left: 16px;
}
.stat-value {
  font-size: 24px;
  font-weight: bold;
  color: #303133;
}
.stat-label {
  font-size: 14px;
  color: #909399;
  margin-top: 4px;
}
.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.chart-container {
  height: 300px;
}
</style>
