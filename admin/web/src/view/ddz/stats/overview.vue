<template>
  <div class="overview-page">
    <!-- 概览统计卡片 -->
    <div class="overview-section">
      <div class="stat-card stat-card--players">
        <div class="stat-card__icon">
          <el-icon :size="32"><User /></el-icon>
        </div>
        <div class="stat-card__content">
          <div class="stat-card__value">{{ formatNumber(overviewData.totalPlayers) }}</div>
          <div class="stat-card__label">总玩家数</div>
        </div>
      </div>
      <div class="stat-card stat-card--active">
        <div class="stat-card__icon">
          <el-icon :size="32"><UserFilled /></el-icon>
        </div>
        <div class="stat-card__content">
          <div class="stat-card__value">{{ formatNumber(overviewData.activePlayers) }}</div>
          <div class="stat-card__label">活跃玩家(7天)</div>
        </div>
      </div>
      <div class="stat-card stat-card--games">
        <div class="stat-card__icon">
          <el-icon :size="32"><Trophy /></el-icon>
        </div>
        <div class="stat-card__content">
          <div class="stat-card__value">{{ formatNumber(overviewData.totalGames) }}</div>
          <div class="stat-card__label">总游戏场次</div>
        </div>
      </div>
      <div class="stat-card stat-card--today-games">
        <div class="stat-card__icon">
          <el-icon :size="32"><Timer /></el-icon>
        </div>
        <div class="stat-card__content">
          <div class="stat-card__value">{{ formatNumber(overviewData.todayGames) }}</div>
          <div class="stat-card__label">今日游戏场次</div>
        </div>
      </div>
      <div class="stat-card stat-card--new-players">
        <div class="stat-card__icon">
          <el-icon :size="32"><Plus /></el-icon>
        </div>
        <div class="stat-card__content">
          <div class="stat-card__value">{{ formatNumber(overviewData.todayNewPlayers) }}</div>
          <div class="stat-card__label">今日新增玩家</div>
        </div>
      </div>
      <div class="stat-card stat-card--coins">
        <div class="stat-card__icon">
          <el-icon :size="32"><Coin /></el-icon>
        </div>
        <div class="stat-card__content">
          <div class="stat-card__value">{{ formatNumber(overviewData.totalCoins) }}</div>
          <div class="stat-card__label">总金币存量</div>
        </div>
      </div>
    </div>

    <!-- 搜索区域 -->
    <div class="search-section">
      <el-form ref="searchForm" :inline="true" :model="searchInfo" class="search-form">
        <el-form-item label="日期范围">
          <el-date-picker
            v-model="searchInfo.dateRange"
            type="daterange"
            range-separator="至"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
            value-format="YYYY-MM-DD"
            style="width: 260px"
          />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" :icon="Search" @click="onSubmit">查询</el-button>
          <el-button :icon="Refresh" @click="onReset">重置</el-button>
        </el-form-item>
      </el-form>
    </div>

    <!-- 每日统计表格 -->
    <div class="table-section">
      <div class="table-header">
        <h3 class="table-title">每日统计</h3>
      </div>
      <el-table
        :data="tableData"
        row-key="date"
        v-loading="loading"
        class="data-table"
        :header-cell-style="{ background: '#f5f7fa', color: '#606266', fontWeight: '600' }"
      >
        <el-table-column align="center" label="统计日期" min-width="120" prop="date" />
        <el-table-column align="center" label="活跃玩家" min-width="100" prop="activePlayers">
          <template #default="scope">
            <span class="stat-num">{{ formatNumber(scope.row.activePlayers) }}</span>
          </template>
        </el-table-column>
        <el-table-column align="center" label="新增玩家" min-width="100" prop="newPlayers">
          <template #default="scope">
            <span class="stat-num text-success">{{ formatNumber(scope.row.newPlayers) }}</span>
          </template>
        </el-table-column>
        <el-table-column align="center" label="总玩家数" min-width="100" prop="totalPlayers">
          <template #default="scope">
            <span class="stat-num">{{ formatNumber(scope.row.totalPlayers) }}</span>
          </template>
        </el-table-column>
        <el-table-column align="center" label="游戏场次" min-width="100" prop="totalGames">
          <template #default="scope">
            <span class="stat-num">{{ formatNumber(scope.row.totalGames) }}</span>
          </template>
        </el-table-column>
        <el-table-column align="center" label="峰值在线" min-width="100" prop="maxOnline">
          <template #default="scope">
            <span class="stat-num text-primary">{{ formatNumber(scope.row.maxOnline) }}</span>
          </template>
        </el-table-column>
        <el-table-column align="center" label="平均时长" min-width="100">
          <template #default="scope">
            <span>{{ formatDuration(scope.row.avgGameDuration) }}</span>
          </template>
        </el-table-column>
        <el-table-column align="center" label="峰值时间" min-width="100" prop="peakTime">
          <template #default="scope">
            <span>{{ scope.row.peakTime || '-' }}</span>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页 -->
      <div class="pagination-section">
        <el-pagination
          :current-page="page"
          :page-size="pageSize"
          :page-sizes="[10, 30, 50, 100]"
          :total="total"
          layout="total, sizes, prev, pager, next, jumper"
          @current-change="handleCurrentChange"
          @size-change="handleSizeChange"
          background
        />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { getOverviewStats, getDailyStats } from '@/api/ddz/stats'
import { Search, Refresh, User, UserFilled, Trophy, Timer, Plus, Coin } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'

defineOptions({
  name: 'DDZOverview'
})

const searchInfo = ref({
  dateRange: []
})

const page = ref(1)
const total = ref(0)
const pageSize = ref(10)
const tableData = ref([])
const loading = ref(false)

const overviewData = ref({
  totalPlayers: 0,
  activePlayers: 0,
  todayGames: 0,
  todayNewPlayers: 0,
  totalGames: 0,
  totalCoins: 0
})

const formatNumber = (num) => {
  if (num === null || num === undefined) return '0'
  return num.toLocaleString()
}

const formatDuration = (minutes) => {
  if (!minutes) return '-'
  if (minutes < 60) {
    return `${Math.round(minutes)}分钟`
  }
  const hours = Math.floor(minutes / 60)
  const mins = Math.round(minutes % 60)
  return `${hours}小时${mins}分钟`
}

// 获取概览数据
const fetchOverviewData = async () => {
  try {
    const res = await getOverviewStats()
    if (res.code === 0) {
      overviewData.value = res.data || {}
    }
  } catch (error) {
    console.error('获取概览统计失败:', error)
  }
}

// 获取每日统计数据
const fetchDailyStats = async () => {
  loading.value = true
  try {
    const params = {
      page: page.value,
      pageSize: pageSize.value
    }
    
    if (searchInfo.value.dateRange && searchInfo.value.dateRange.length === 2) {
      params.startDate = searchInfo.value.dateRange[0]
      params.endDate = searchInfo.value.dateRange[1]
    }
    
    const res = await getDailyStats(params)
    if (res.code === 0) {
      tableData.value = res.data?.list || []
      total.value = res.data?.total || tableData.value.length
    } else {
      ElMessage.error(res.msg || '获取每日统计失败')
    }
  } catch (error) {
    console.error('获取每日统计失败:', error)
    ElMessage.error('获取每日统计失败')
  } finally {
    loading.value = false
  }
}

const onSubmit = () => {
  page.value = 1
  fetchDailyStats()
}

const onReset = () => {
  searchInfo.value = {
    dateRange: []
  }
  page.value = 1
  fetchDailyStats()
}

const handleSizeChange = (val) => {
  pageSize.value = val
  fetchDailyStats()
}

const handleCurrentChange = (val) => {
  page.value = val
  fetchDailyStats()
}

onMounted(() => {
  fetchOverviewData()
  fetchDailyStats()
})
</script>

<style scoped>
.overview-page {
  padding: 20px;
  background: #f0f2f5;
  min-height: calc(100vh - 100px);
}

/* 概览统计卡片 */
.overview-section {
  display: grid;
  grid-template-columns: repeat(6, 1fr);
  gap: 16px;
  margin-bottom: 20px;
}

@media (max-width: 1600px) {
  .overview-section {
    grid-template-columns: repeat(3, 1fr);
  }
}

@media (max-width: 992px) {
  .overview-section {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 576px) {
  .overview-section {
    grid-template-columns: 1fr;
  }
}

.stat-card {
  background: #fff;
  border-radius: 12px;
  padding: 20px;
  display: flex;
  align-items: center;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
}

.stat-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 4px;
  height: 100%;
}

.stat-card--players::before { background: linear-gradient(180deg, #667eea 0%, #764ba2 100%); }
.stat-card--active::before { background: linear-gradient(180deg, #11998e 0%, #38ef7d 100%); }
.stat-card--games::before { background: linear-gradient(180deg, #f093fb 0%, #f5576c 100%); }
.stat-card--today-games::before { background: linear-gradient(180deg, #4facfe 0%, #00f2fe 100%); }
.stat-card--new-players::before { background: linear-gradient(180deg, #fa709a 0%, #fee140 100%); }
.stat-card--coins::before { background: linear-gradient(180deg, #f5af19 0%, #f12711 100%); }

.stat-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.1);
}

.stat-card__icon {
  width: 64px;
  height: 64px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 16px;
  color: #fff;
}

.stat-card--players .stat-card__icon { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); }
.stat-card--active .stat-card__icon { background: linear-gradient(135deg, #11998e 0%, #38ef7d 100%); }
.stat-card--games .stat-card__icon { background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); }
.stat-card--today-games .stat-card__icon { background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%); }
.stat-card--new-players .stat-card__icon { background: linear-gradient(135deg, #fa709a 0%, #fee140 100%); }
.stat-card--coins .stat-card__icon { background: linear-gradient(135deg, #f5af19 0%, #f12711 100%); }

.stat-card__content { flex: 1; }
.stat-card__value { font-size: 28px; font-weight: 700; color: #1a1a2e; line-height: 1.2; }
.stat-card__label { font-size: 14px; color: #8c8c8c; margin-top: 4px; }

/* 搜索区域 */
.search-section {
  background: #fff;
  border-radius: 8px;
  padding: 20px;
  margin-bottom: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
}

.search-form {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

/* 表格区域 */
.table-section {
  background: #fff;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
}

.table-header {
  margin-bottom: 16px;
  padding-bottom: 16px;
  border-bottom: 1px solid #f0f0f0;
}

.table-title {
  font-size: 16px;
  font-weight: 600;
  color: #1a1a2e;
  margin: 0;
}

.data-table {
  width: 100%;
}

.stat-num {
  font-family: 'Monaco', 'Consolas', monospace;
  font-weight: 600;
}

.text-success { color: #52c41a; }
.text-primary { color: #1890ff; }

/* 分页区域 */
.pagination-section {
  display: flex;
  justify-content: flex-end;
  padding-top: 20px;
  margin-top: 16px;
  border-top: 1px solid #f0f0f0;
}
</style>
