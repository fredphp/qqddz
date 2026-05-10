<template>
  <div class="player-stat-page">
    <!-- 搜索区域 -->
    <div class="search-section">
      <el-form ref="searchForm" :inline="true" :model="searchInfo" class="search-form">
        <el-form-item label="玩家ID">
          <el-input 
            v-model="searchInfo.playerId" 
            placeholder="请输入玩家ID" 
            clearable 
            :prefix-icon="Search"
            style="width: 200px" 
          />
        </el-form-item>
        <el-form-item label="日期范围">
          <el-date-picker
            v-model="searchInfo.statDate"
            type="daterange"
            range-separator="至"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
            value-format="YYYY-MM-DD"
            style="width: 280px"
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
        <div class="stat-card stat-card--players">
          <div class="stat-card__icon">
            <el-icon :size="28"><User /></el-icon>
          </div>
          <div class="stat-card__content">
            <div class="stat-card__value">{{ overviewStats.totalPlayers }}</div>
            <div class="stat-card__label">统计玩家数</div>
          </div>
        </div>
      </div>
      <div class="stat-card-wrapper">
        <div class="stat-card stat-card--games">
          <div class="stat-card__icon">
            <el-icon :size="28"><TrendCharts /></el-icon>
          </div>
          <div class="stat-card__content">
            <div class="stat-card__value">{{ overviewStats.totalGames }}</div>
            <div class="stat-card__label">总游戏场次</div>
          </div>
        </div>
      </div>
      <div class="stat-card-wrapper">
        <div class="stat-card stat-card--winrate">
          <div class="stat-card__icon">
            <el-icon :size="28"><Trophy /></el-icon>
          </div>
          <div class="stat-card__content">
            <div class="stat-card__value">{{ overviewStats.avgWinRate }}%</div>
            <div class="stat-card__label">平均胜率</div>
          </div>
        </div>
      </div>
      <div class="stat-card-wrapper">
        <div class="stat-card stat-card--bombs">
          <div class="stat-card__icon">
            <el-icon :size="28"><Flag /></el-icon>
          </div>
          <div class="stat-card__content">
            <div class="stat-card__value">{{ overviewStats.totalBombs }}</div>
            <div class="stat-card__label">炸弹总数</div>
          </div>
        </div>
      </div>
    </div>

    <!-- 数据表格 -->
    <div class="table-section">
      <el-table 
        :data="tableData" 
        row-key="playerId"
        class="custom-table"
        :header-cell-style="{ 
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', 
          color: '#fff', 
          fontWeight: '600',
          fontSize: '14px',
          height: '50px'
        }"
        :cell-style="{ padding: '16px 12px' }"
      >
        <!-- 玩家信息列 -->
        <el-table-column label="玩家信息" min-width="200">
          <template #default="scope">
            <div class="player-cell">
              <div class="player-avatar-wrapper">
                <el-avatar 
                  v-if="scope.row.playerAvatar" 
                  :size="48" 
                  :src="scope.row.playerAvatar" 
                  class="player-avatar"
                />
                <el-avatar 
                  v-else 
                  :size="48" 
                  class="player-avatar player-avatar--default"
                >
                  {{ (scope.row.playerName || scope.row.playerId || '?').substring(0, 1).toUpperCase() }}
                </el-avatar>
                <span v-if="scope.row.vipLevel > 0" class="vip-badge">VIP{{ scope.row.vipLevel }}</span>
              </div>
              <div class="player-info">
                <div class="player-name">{{ scope.row.playerName || '未知玩家' }}</div>
                <div class="player-id">
                  <el-icon :size="12"><User /></el-icon>
                  {{ scope.row.playerId }}
                </div>
              </div>
            </div>
          </template>
        </el-table-column>

        <!-- 游戏数据列 -->
        <el-table-column label="游戏数据" min-width="260" align="center">
          <template #default="scope">
            <div class="game-data-cell">
              <div class="game-data-item game-data-item--total">
                <div class="game-data-value">{{ scope.row.totalGames || 0 }}</div>
                <div class="game-data-label">总场次</div>
              </div>
              <div class="game-data-divider"></div>
              <div class="game-data-item game-data-item--win">
                <div class="game-data-value">{{ scope.row.winGames || 0 }}</div>
                <div class="game-data-label">胜场</div>
              </div>
              <div class="game-data-divider"></div>
              <div class="game-data-item game-data-item--lose">
                <div class="game-data-value">{{ scope.row.loseGames || 0 }}</div>
                <div class="game-data-label">负场</div>
              </div>
            </div>
          </template>
        </el-table-column>

        <!-- 胜率列 -->
        <el-table-column label="胜率" min-width="160" align="center">
          <template #default="scope">
            <div class="winrate-cell">
              <div class="winrate-progress">
                <el-progress 
                  :percentage="scope.row.winRate || 0" 
                  :color="getWinRateColor(scope.row.winRate)"
                  :stroke-width="8"
                  :show-text="false"
                />
              </div>
              <span 
                class="winrate-value" 
                :style="{ color: getWinRateColor(scope.row.winRate) }"
              >
                {{ formatWinRate(scope.row.winRate) }}%
              </span>
            </div>
          </template>
        </el-table-column>

        <!-- 角色统计列 -->
        <el-table-column label="角色统计" min-width="200" align="center">
          <template #default="scope">
            <div class="role-stats-cell">
              <div class="role-stat role-stat--landlord">
                <span class="role-icon">👑</span>
                <span class="role-name">地主</span>
                <span class="role-games">{{ scope.row.landlordGames || 0 }}场</span>
                <span class="role-wins">{{ scope.row.landlordWins || 0 }}胜</span>
              </div>
              <div class="role-stat role-stat--farmer">
                <span class="role-icon">🌾</span>
                <span class="role-name">农民</span>
                <span class="role-games">{{ scope.row.farmerGames || 0 }}场</span>
                <span class="role-wins">{{ scope.row.farmerWins || 0 }}胜</span>
              </div>
            </div>
          </template>
        </el-table-column>

        <!-- 金币变化列 -->
        <el-table-column label="金币变化" min-width="120" align="center">
          <template #default="scope">
            <div 
              class="gold-cell" 
              :class="{ 'gold-cell--positive': scope.row.totalGoldChange >= 0, 'gold-cell--negative': scope.row.totalGoldChange < 0 }"
            >
              <el-icon v-if="scope.row.totalGoldChange >= 0" :size="16"><CaretTop /></el-icon>
              <el-icon v-else :size="16"><CaretBottom /></el-icon>
              <span>{{ Math.abs(scope.row.totalGoldChange || 0).toLocaleString() }}</span>
            </div>
          </template>
        </el-table-column>

        <!-- 炸弹统计列 -->
        <el-table-column label="炸弹/火箭" min-width="100" align="center">
          <template #default="scope">
            <div class="bomb-cell">
              <template v-if="scope.row.totalBombs > 0">
                <span class="bomb-icon">💣</span>
                <span class="bomb-count">{{ scope.row.totalBombs }}</span>
              </template>
              <span v-else class="no-data">-</span>
            </div>
          </template>
        </el-table-column>

        <!-- 统计日期列 -->
        <el-table-column label="统计日期" min-width="120" align="center" prop="statDate" />

        <!-- 操作列 -->
        <el-table-column label="操作" min-width="100" align="center" fixed="right">
          <template #default="scope">
            <el-button 
              type="primary" 
              link 
              :icon="View" 
              @click="viewDetail(scope.row)"
              class="action-btn"
            >
              详情
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页 -->
      <div class="pagination-section">
        <el-pagination
          :current-page="page"
          :page-size="pageSize"
          :page-sizes="[10, 20, 50, 100]"
          :total="total"
          layout="total, sizes, prev, pager, next, jumper"
          @current-change="handleCurrentChange"
          @size-change="handleSizeChange"
          background
        />
      </div>
    </div>

    <!-- 详情弹窗 -->
    <el-dialog 
      v-model="detailDialog" 
      title="玩家统计详情" 
      width="750px"
      class="detail-dialog"
      :close-on-click-modal="false"
    >
      <div v-if="currentPlayer" class="detail-content">
        <!-- 玩家信息头部 -->
        <div class="detail-header">
          <el-avatar 
            v-if="currentPlayer.playerAvatar" 
            :size="64" 
            :src="currentPlayer.playerAvatar"
            class="detail-avatar"
          />
          <el-avatar 
            v-else 
            :size="64" 
            class="detail-avatar detail-avatar--default"
          >
            {{ (currentPlayer.playerName || currentPlayer.playerId || '?').substring(0, 1).toUpperCase() }}
          </el-avatar>
          <div class="detail-player-info">
            <div class="detail-player-name">{{ currentPlayer.playerName || '未知玩家' }}</div>
            <div class="detail-player-id">ID: {{ currentPlayer.playerId }}</div>
          </div>
        </div>

        <!-- 统计数据 -->
        <div class="detail-stats">
          <div class="detail-stats-row">
            <div class="detail-stat-item">
              <div class="detail-stat-label">统计日期</div>
              <div class="detail-stat-value">{{ currentPlayer.statDate || '-' }}</div>
            </div>
            <div class="detail-stat-item">
              <div class="detail-stat-label">总场次</div>
              <div class="detail-stat-value">{{ currentPlayer.totalGames || 0 }}</div>
            </div>
            <div class="detail-stat-item">
              <div class="detail-stat-label">胜场</div>
              <div class="detail-stat-value detail-stat-value--success">{{ currentPlayer.winGames || 0 }}</div>
            </div>
            <div class="detail-stat-item">
              <div class="detail-stat-label">负场</div>
              <div class="detail-stat-value detail-stat-value--danger">{{ currentPlayer.loseGames || 0 }}</div>
            </div>
          </div>
          <div class="detail-stats-row">
            <div class="detail-stat-item">
              <div class="detail-stat-label">胜率</div>
              <div class="detail-stat-value" :style="{ color: getWinRateColor(currentPlayer.winRate) }">
                {{ formatWinRate(currentPlayer.winRate) }}%
              </div>
            </div>
            <div class="detail-stat-item">
              <div class="detail-stat-label">金币变化</div>
              <div 
                class="detail-stat-value"
                :class="currentPlayer.totalGoldChange >= 0 ? 'detail-stat-value--success' : 'detail-stat-value--danger'"
              >
                {{ currentPlayer.totalGoldChange >= 0 ? '+' : '' }}{{ currentPlayer.totalGoldChange || 0 }}
              </div>
            </div>
            <div class="detail-stat-item">
              <div class="detail-stat-label">炸弹数</div>
              <div class="detail-stat-value">{{ currentPlayer.totalBombs || 0 }}</div>
            </div>
            <div class="detail-stat-item">
              <div class="detail-stat-label">春天次数</div>
              <div class="detail-stat-value">{{ currentPlayer.springCount || 0 }}</div>
            </div>
          </div>
        </div>

        <!-- 角色统计 -->
        <div class="detail-role-section">
          <div class="detail-role-card">
            <div class="detail-role-header">
              <span class="detail-role-icon">👑</span>
              <span class="detail-role-title">地主统计</span>
            </div>
            <div class="detail-role-stats">
              <div class="detail-role-stat">
                <span class="detail-role-label">总场次</span>
                <span class="detail-role-value">{{ currentPlayer.landlordGames || 0 }}</span>
              </div>
              <div class="detail-role-stat">
                <span class="detail-role-label">胜场</span>
                <span class="detail-role-value">{{ currentPlayer.landlordWins || 0 }}</span>
              </div>
              <div class="detail-role-stat">
                <span class="detail-role-label">胜率</span>
                <span class="detail-role-value">{{ formatWinRate(currentPlayer.landlordWinRate) }}%</span>
              </div>
            </div>
          </div>
          <div class="detail-role-card">
            <div class="detail-role-header">
              <span class="detail-role-icon">🌾</span>
              <span class="detail-role-title">农民统计</span>
            </div>
            <div class="detail-role-stats">
              <div class="detail-role-stat">
                <span class="detail-role-label">总场次</span>
                <span class="detail-role-value">{{ currentPlayer.farmerGames || 0 }}</span>
              </div>
              <div class="detail-role-stat">
                <span class="detail-role-label">胜场</span>
                <span class="detail-role-value">{{ currentPlayer.farmerWins || 0 }}</span>
              </div>
              <div class="detail-role-stat">
                <span class="detail-role-label">胜率</span>
                <span class="detail-role-value">{{ formatWinRate(currentPlayer.farmerWinRate) }}%</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { getPlayerStatList } from '@/api/ddz/gameLog'
import { User, TrendCharts, Trophy, Flag, CaretTop, CaretBottom, Search, Refresh, View } from '@element-plus/icons-vue'

defineOptions({
  name: 'DDZPlayerStat'
})

const searchInfo = ref({
  playerId: '',
  statDate: []
})

const page = ref(1)
const total = ref(0)
const pageSize = ref(10)
const tableData = ref([])

const detailDialog = ref(false)
const currentPlayer = ref(null)

// 计算概览统计
const overviewStats = computed(() => {
  const players = tableData.value
  if (!players.length) {
    return { totalPlayers: 0, totalGames: 0, avgWinRate: 0, totalBombs: 0 }
  }
  
  const totalGames = players.reduce((sum, p) => sum + (p.totalGames || 0), 0)
  const avgWinRate = players.reduce((sum, p) => sum + (p.winRate || 0), 0) / players.length
  const totalBombs = players.reduce((sum, p) => sum + (p.totalBombs || 0), 0)
  
  return {
    totalPlayers: total.value,
    totalGames: totalGames.toLocaleString(),
    avgWinRate: avgWinRate.toFixed(1),
    totalBombs: totalBombs.toLocaleString()
  }
})

// 格式化胜率
const formatWinRate = (rate) => {
  if (!rate && rate !== 0) return '0.0'
  return rate.toFixed(1)
}

// 根据胜率获取颜色
const getWinRateColor = (rate) => {
  if (rate >= 60) return '#52c41a'
  if (rate >= 40) return '#faad14'
  return '#ff4d4f'
}

const onSubmit = () => {
  page.value = 1
  getTableData()
}

const onReset = () => {
  searchInfo.value = {
    playerId: '',
    statDate: []
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

const viewDetail = (row) => {
  currentPlayer.value = row
  detailDialog.value = true
}

const getTableData = async () => {
  const res = await getPlayerStatList({
    page: page.value,
    pageSize: pageSize.value,
    playerId: searchInfo.value.playerId,
    startDate: searchInfo.value.statDate?.[0] || '',
    endDate: searchInfo.value.statDate?.[1] || ''
  })
  if (res.code === 0) {
    tableData.value = res.data.list
    total.value = res.data.total
  }
}

getTableData()
</script>

<style scoped>
.player-stat-page {
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

.stat-card--players::before {
  background: linear-gradient(180deg, #667eea 0%, #764ba2 100%);
}

.stat-card--games::before {
  background: linear-gradient(180deg, #f093fb 0%, #f5576c 100%);
}

.stat-card--winrate::before {
  background: linear-gradient(180deg, #4facfe 0%, #00f2fe 100%);
}

.stat-card--bombs::before {
  background: linear-gradient(180deg, #fa709a 0%, #fee140 100%);
}

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

.stat-card--players .stat-card__icon {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.stat-card--games .stat-card__icon {
  background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
}

.stat-card--winrate .stat-card__icon {
  background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
}

.stat-card--bombs .stat-card__icon {
  background: linear-gradient(135deg, #fa709a 0%, #fee140 100%);
}

.stat-card__content {
  flex: 1;
}

.stat-card__value {
  font-size: 28px;
  font-weight: 700;
  color: #1a1a2e;
  line-height: 1.2;
}

.stat-card__label {
  font-size: 14px;
  color: #8c8c8c;
  margin-top: 4px;
}

/* 表格区域 */
.table-section {
  background: #fff;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
}

.custom-table {
  border-radius: 8px;
  overflow: hidden;
}

/* 玩家单元格 */
.player-cell {
  display: flex;
  align-items: center;
  gap: 12px;
}

.player-avatar-wrapper {
  position: relative;
  flex-shrink: 0;
}

.player-avatar {
  border: 2px solid #e8e8e8;
  transition: all 0.3s ease;
}

.player-avatar--default {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: #fff;
  font-weight: 600;
}

.player-avatar-wrapper:hover .player-avatar {
  transform: scale(1.05);
  border-color: #667eea;
}

.vip-badge {
  position: absolute;
  bottom: -4px;
  right: -4px;
  background: linear-gradient(135deg, #ffd700 0%, #ffaa00 100%);
  color: #7c5800;
  font-size: 10px;
  font-weight: 600;
  padding: 1px 4px;
  border-radius: 4px;
  white-space: nowrap;
}

.player-info {
  text-align: left;
}

.player-name {
  font-weight: 600;
  color: #1a1a2e;
  font-size: 14px;
  margin-bottom: 2px;
}

.player-id {
  font-size: 12px;
  color: #8c8c8c;
  display: flex;
  align-items: center;
  gap: 4px;
}

/* 游戏数据单元格 */
.game-data-cell {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 16px;
}

.game-data-item {
  text-align: center;
}

.game-data-value {
  font-size: 18px;
  font-weight: 700;
}

.game-data-item--total .game-data-value {
  color: #1890ff;
}

.game-data-item--win .game-data-value {
  color: #52c41a;
}

.game-data-item--lose .game-data-value {
  color: #ff4d4f;
}

.game-data-label {
  font-size: 12px;
  color: #8c8c8c;
  margin-top: 2px;
}

.game-data-divider {
  width: 1px;
  height: 32px;
  background: #f0f0f0;
}

/* 胜率单元格 */
.winrate-cell {
  display: flex;
  align-items: center;
  gap: 10px;
  justify-content: center;
}

.winrate-progress {
  width: 60px;
}

.winrate-value {
  font-weight: 700;
  font-size: 14px;
  min-width: 45px;
}

/* 角色统计单元格 */
.role-stats-cell {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.role-stat {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  padding: 4px 8px;
  background: #fafafa;
  border-radius: 4px;
}

.role-icon {
  font-size: 14px;
}

.role-name {
  font-weight: 600;
  min-width: 32px;
}

.role-stat--landlord .role-name {
  color: #ff4d4f;
}

.role-stat--farmer .role-name {
  color: #52c41a;
}

.role-games {
  color: #595959;
}

.role-wins {
  color: #8c8c8c;
}

/* 金币变化单元格 */
.gold-cell {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
  font-weight: 700;
  font-size: 15px;
}

.gold-cell--positive {
  color: #52c41a;
}

.gold-cell--negative {
  color: #ff4d4f;
}

/* 炸弹单元格 */
.bomb-cell {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
}

.bomb-icon {
  font-size: 16px;
}

.bomb-count {
  font-weight: 600;
  color: #fa8c16;
}

.no-data {
  color: #d9d9d9;
}

/* 操作按钮 */
.action-btn {
  font-weight: 500;
}

/* 分页区域 */
.pagination-section {
  display: flex;
  justify-content: flex-end;
  padding: 16px 0 0;
}

/* 详情弹窗 */
.detail-dialog :deep(.el-dialog__header) {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 16px 20px;
  margin-right: 0;
}

.detail-dialog :deep(.el-dialog__title) {
  color: #fff;
  font-weight: 600;
}

.detail-dialog :deep(.el-dialog__headerbtn .el-dialog__close) {
  color: #fff;
}

.detail-content {
  padding: 20px 0;
}

.detail-header {
  display: flex;
  align-items: center;
  gap: 16px;
  padding-bottom: 20px;
  border-bottom: 1px solid #f0f0f0;
  margin-bottom: 20px;
}

.detail-avatar {
  border: 3px solid #667eea;
}

.detail-avatar--default {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: #fff;
  font-size: 24px;
  font-weight: 600;
}

.detail-player-info {
  flex: 1;
}

.detail-player-name {
  font-size: 20px;
  font-weight: 700;
  color: #1a1a2e;
  margin-bottom: 4px;
}

.detail-player-id {
  font-size: 14px;
  color: #8c8c8c;
}

.detail-stats {
  margin-bottom: 20px;
}

.detail-stats-row {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 12px;
  margin-bottom: 12px;
}

.detail-stat-item {
  background: #fafafa;
  border-radius: 8px;
  padding: 12px;
  text-align: center;
}

.detail-stat-label {
  font-size: 12px;
  color: #8c8c8c;
  margin-bottom: 4px;
}

.detail-stat-value {
  font-size: 18px;
  font-weight: 700;
  color: #1a1a2e;
}

.detail-stat-value--success {
  color: #52c41a;
}

.detail-stat-value--danger {
  color: #ff4d4f;
}

.detail-role-section {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;
}

.detail-role-card {
  background: #fafafa;
  border-radius: 8px;
  padding: 16px;
}

.detail-role-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 12px;
  padding-bottom: 8px;
  border-bottom: 1px solid #e8e8e8;
}

.detail-role-icon {
  font-size: 18px;
}

.detail-role-title {
  font-weight: 600;
  color: #1a1a2e;
}

.detail-role-stats {
  display: flex;
  gap: 20px;
}

.detail-role-stat {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.detail-role-label {
  font-size: 12px;
  color: #8c8c8c;
}

.detail-role-value {
  font-size: 16px;
  font-weight: 600;
  color: #1a1a2e;
}
</style>
