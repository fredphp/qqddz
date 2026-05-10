<template>
  <div class="gold-log-page">
    <!-- 搜索区域 -->
    <div class="search-section">
      <el-form ref="searchForm" :inline="true" :model="searchInfo" class="search-form">
        <el-form-item label="玩家ID">
          <el-input 
            v-model="searchInfo.playerId" 
            placeholder="请输入玩家ID" 
            clearable 
            :prefix-icon="User"
            style="width: 160px" 
          />
        </el-form-item>
        <el-form-item label="变化类型">
          <el-select 
            v-model="searchInfo.changeType" 
            placeholder="全部" 
            clearable 
            style="width: 140px"
          >
            <el-option label="游戏结算" :value="1" />
            <el-option label="系统赠送" :value="2" />
            <el-option label="后台调整" :value="3" />
            <el-option label="兑换消耗" :value="4" />
            <el-option label="其他" :value="5" />
          </el-select>
        </el-form-item>
        <el-form-item label="时间范围">
          <el-date-picker
            v-model="searchInfo.dateRange"
            type="daterange"
            range-separator="至"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
            value-format="YYYY-MM-DD"
            style="width: 240px"
          />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" :icon="Search" @click="onSubmit">查询</el-button>
          <el-button :icon="Refresh" @click="onReset">重置</el-button>
        </el-form-item>
      </el-form>
    </div>

    <!-- 统计概览卡片 -->
    <div class="overview-section">
      <div class="stat-card-wrapper">
        <div class="stat-card stat-card--total">
          <div class="stat-card__icon">
            <el-icon :size="28"><Coin /></el-icon>
          </div>
          <div class="stat-card__content">
            <div class="stat-card__value">{{ formatNumber(overviewStats.totalChange) }}</div>
            <div class="stat-card__label">总变化金额</div>
          </div>
        </div>
      </div>
      <div class="stat-card-wrapper">
        <div class="stat-card stat-card--income">
          <div class="stat-card__icon">
            <el-icon :size="28"><Top /></el-icon>
          </div>
          <div class="stat-card__content">
            <div class="stat-card__value income-text">+{{ formatNumber(overviewStats.totalIncome) }}</div>
            <div class="stat-card__label">总收入</div>
          </div>
        </div>
      </div>
      <div class="stat-card-wrapper">
        <div class="stat-card stat-card--expense">
          <div class="stat-card__icon">
            <el-icon :size="28"><Bottom /></el-icon>
          </div>
          <div class="stat-card__content">
            <div class="stat-card__value expense-text">{{ formatNumber(overviewStats.totalExpense) }}</div>
            <div class="stat-card__label">总支出</div>
          </div>
        </div>
      </div>
      <div class="stat-card-wrapper">
        <div class="stat-card stat-card--count">
          <div class="stat-card__icon">
            <el-icon :size="28"><Document /></el-icon>
          </div>
          <div class="stat-card__content">
            <div class="stat-card__value">{{ overviewStats.recordCount }}</div>
            <div class="stat-card__label">记录条数</div>
          </div>
        </div>
      </div>
    </div>

    <!-- 表格区域 -->
    <div class="table-section">
      <el-table
        :data="tableData"
        row-key="ID"
        v-loading="loading"
        class="data-table"
        :header-cell-style="{ background: '#f5f7fa', color: '#606266', fontWeight: '600' }"
      >
        <el-table-column align="center" label="ID" min-width="80" prop="ID" />
        <el-table-column align="center" label="玩家信息" min-width="180">
          <template #default="scope">
            <div class="player-cell">
              <el-avatar 
                v-if="scope.row.playerAvatar" 
                :size="36" 
                :src="getUrl(scope.row.playerAvatar)"
                class="player-avatar"
              />
              <el-avatar v-else :size="36" class="player-avatar avatar-default">
                {{ (scope.row.playerName || '?').substring(0, 1) }}
              </el-avatar>
              <div class="player-info">
                <div class="player-name">{{ scope.row.playerName || '未知玩家' }}</div>
                <div class="player-id">ID: {{ scope.row.playerId }}</div>
              </div>
            </div>
          </template>
        </el-table-column>
        <el-table-column align="center" label="变化前金币" min-width="130">
          <template #default="scope">
            <span class="gold-amount">{{ formatNumber(scope.row.beforeGold) }}</span>
          </template>
        </el-table-column>
        <el-table-column align="center" label="变化金额" min-width="130">
          <template #default="scope">
            <div class="change-amount" :class="scope.row.changeAmount >= 0 ? 'income' : 'expense'">
              <el-icon v-if="scope.row.changeAmount >= 0"><Top /></el-icon>
              <el-icon v-else><Bottom /></el-icon>
              <span>{{ scope.row.changeAmount >= 0 ? '+' : '' }}{{ formatNumber(scope.row.changeAmount) }}</span>
            </div>
          </template>
        </el-table-column>
        <el-table-column align="center" label="变化后金币" min-width="130">
          <template #default="scope">
            <span class="gold-amount">{{ formatNumber(scope.row.balanceAfter) }}</span>
          </template>
        </el-table-column>
        <el-table-column align="center" label="变化类型" min-width="100">
          <template #default="scope">
            <el-tag :type="getChangeTypeTag(scope.row.changeType)" effect="plain">
              {{ scope.row.changeTypeText || getChangeTypeText(scope.row.changeType) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column align="center" label="关联ID" min-width="120" show-overflow-tooltip>
          <template #default="scope">
            <span class="related-id">{{ scope.row.relatedId || '-' }}</span>
          </template>
        </el-table-column>
        <el-table-column align="center" label="备注" min-width="150" show-overflow-tooltip>
          <template #default="scope">
            <span class="remark-text">{{ scope.row.remark || '-' }}</span>
          </template>
        </el-table-column>
        <el-table-column align="center" label="时间" min-width="170">
          <template #default="scope">
            <div class="time-cell">
              <el-icon><Clock /></el-icon>
              <span>{{ scope.row.createdAt }}</span>
            </div>
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
import { ref, computed } from 'vue'
import { getGoldLogList } from '@/api/ddz/goldLog'
import { Search, Refresh, User, Coin, Top, Bottom, Document, Clock } from '@element-plus/icons-vue'
import { getUrl } from '@/utils/image'

defineOptions({
  name: 'DDZGoldLog'
})

const searchInfo = ref({
  playerId: '',
  changeType: null,
  dateRange: []
})

const page = ref(1)
const total = ref(0)
const pageSize = ref(10)
const tableData = ref([])
const loading = ref(false)

// 计算概览统计
const overviewStats = computed(() => {
  const records = tableData.value
  if (!records.length) {
    return { totalChange: 0, totalIncome: 0, totalExpense: 0, recordCount: 0 }
  }
  
  let totalIncome = 0
  let totalExpense = 0
  
  records.forEach(r => {
    if (r.changeAmount >= 0) {
      totalIncome += r.changeAmount
    } else {
      totalExpense += Math.abs(r.changeAmount)
    }
  })
  
  return {
    totalChange: totalIncome - totalExpense,
    totalIncome,
    totalExpense,
    recordCount: total.value
  }
})

const getChangeTypeText = (type) => {
  const types = {
    1: '游戏结算',
    2: '系统赠送',
    3: '后台调整',
    4: '兑换消耗',
    5: '其他'
  }
  return types[type] || '未知'
}

const getChangeTypeTag = (type) => {
  const tags = {
    1: 'primary',
    2: 'success',
    3: 'warning',
    4: 'info',
    5: ''
  }
  return tags[type] || ''
}

const formatNumber = (num) => {
  if (num === null || num === undefined) return '0'
  return num.toLocaleString()
}

const onSubmit = () => {
  page.value = 1
  getTableData()
}

const onReset = () => {
  searchInfo.value = {
    playerId: '',
    changeType: null,
    dateRange: []
  }
  getTableData()
}

const handleSizeChange = (val) => {
  pageSize.value = val
  getTableData()
}

const handleCurrentChange = (val) => {
  page.value = val
  getTableData()
}

const getTableData = async () => {
  loading.value = true
  try {
    const params = {
      page: page.value,
      pageSize: pageSize.value,
      playerId: searchInfo.value.playerId,
      changeType: searchInfo.value.changeType
    }
    if (searchInfo.value.dateRange && searchInfo.value.dateRange.length === 2) {
      params.startDate = searchInfo.value.dateRange[0]
      params.endDate = searchInfo.value.dateRange[1]
    }
    const res = await getGoldLogList(params)
    if (res.code === 0) {
      tableData.value = res.data.list || []
      total.value = res.data.total || 0
    }
  } finally {
    loading.value = false
  }
}

getTableData()
</script>

<style scoped>
.gold-log-page {
  padding: 20px;
  background: #f0f2f5;
  min-height: calc(100vh - 100px);
}

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

/* 统计概览区域 */
.overview-section {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
  margin-bottom: 20px;
}

@media (max-width: 1200px) {
  .overview-section {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 768px) {
  .overview-section {
    grid-template-columns: 1fr;
  }
}

.stat-card-wrapper {
  height: 100%;
}

.stat-card {
  background: #fff;
  border-radius: 12px;
  padding: 20px;
  display: flex;
  align-items: center;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  transition: all 0.3s ease;
  height: 100%;
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

.stat-card--total::before { background: linear-gradient(180deg, #f5af19 0%, #f12711 100%); }
.stat-card--income::before { background: linear-gradient(180deg, #11998e 0%, #38ef7d 100%); }
.stat-card--expense::before { background: linear-gradient(180deg, #f093fb 0%, #f5576c 100%); }
.stat-card--count::before { background: linear-gradient(180deg, #667eea 0%, #764ba2 100%); }

.stat-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.1);
}

.stat-card__icon {
  width: 56px;
  height: 56px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 16px;
  color: #fff;
}

.stat-card--total .stat-card__icon { background: linear-gradient(135deg, #f5af19 0%, #f12711 100%); }
.stat-card--income .stat-card__icon { background: linear-gradient(135deg, #11998e 0%, #38ef7d 100%); }
.stat-card--expense .stat-card__icon { background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); }
.stat-card--count .stat-card__icon { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); }

.stat-card__content { flex: 1; }
.stat-card__value { font-size: 24px; font-weight: 700; color: #1a1a2e; line-height: 1.2; }
.stat-card__label { font-size: 14px; color: #8c8c8c; margin-top: 4px; }

.income-text { color: #52c41a; }
.expense-text { color: #ff4d4f; }

/* 表格区域 */
.table-section {
  background: #fff;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
}

.data-table {
  width: 100%;
}

/* 玩家单元格 */
.player-cell {
  display: flex;
  align-items: center;
  gap: 10px;
  justify-content: flex-start;
}

.player-avatar {
  border: 2px solid #e8e8e8;
  flex-shrink: 0;
}

.avatar-default {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: #fff;
  font-weight: 600;
}

.player-info {
  text-align: left;
}

.player-name {
  font-size: 14px;
  font-weight: 600;
  color: #1a1a2e;
}

.player-id {
  font-size: 12px;
  color: #8c8c8c;
}

/* 金币金额 */
.gold-amount {
  font-family: 'Monaco', 'Consolas', monospace;
  font-weight: 600;
  color: #595959;
}

/* 变化金额 */
.change-amount {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
  font-family: 'Monaco', 'Consolas', monospace;
  font-weight: 700;
}

.change-amount.income {
  color: #52c41a;
}

.change-amount.expense {
  color: #ff4d4f;
}

.related-id {
  font-family: 'Monaco', 'Consolas', monospace;
  font-size: 12px;
  color: #8c8c8c;
}

.remark-text {
  color: #595959;
  font-size: 13px;
}

.time-cell {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
  color: #8c8c8c;
  font-size: 13px;
}

/* 分页区域 */
.pagination-section {
  display: flex;
  justify-content: flex-end;
  padding-top: 20px;
  margin-top: 16px;
  border-top: 1px solid #f0f0f0;
}
</style>
