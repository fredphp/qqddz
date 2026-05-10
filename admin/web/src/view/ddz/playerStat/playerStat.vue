<template>
  <div class="player-stat-page">
    <!-- 搜索区域 -->
    <div class="gva-search-box">
      <el-form ref="searchForm" :inline="true" :model="searchInfo">
        <el-form-item label="玩家ID">
          <el-input v-model="searchInfo.playerId" placeholder="输入玩家ID" clearable style="width: 150px" />
        </el-form-item>
        <el-form-item label="日期范围">
          <el-date-picker
            v-model="searchInfo.statDate"
            type="daterange"
            range-separator="至"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
            value-format="YYYY-MM-DD"
            style="width: 260px"
          />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" icon="Search" @click="onSubmit">查询</el-button>
          <el-button icon="Refresh" @click="onReset">重置</el-button>
        </el-form-item>
      </el-form>
    </div>

    <!-- 统计概览卡片 -->
    <div class="stat-cards">
      <el-row :gutter="20">
        <el-col :xs="24" :sm="12" :md="6">
          <div class="stat-card total-players">
            <div class="stat-icon">
              <el-icon size="32"><User /></el-icon>
            </div>
            <div class="stat-content">
              <div class="stat-value">{{ overviewStats.totalPlayers }}</div>
              <div class="stat-label">统计玩家数</div>
            </div>
          </div>
        </el-col>
        <el-col :xs="24" :sm="12" :md="6">
          <div class="stat-card total-games">
            <div class="stat-icon">
              <el-icon size="32"><TrendCharts /></el-icon>
            </div>
            <div class="stat-content">
              <div class="stat-value">{{ overviewStats.totalGames }}</div>
              <div class="stat-label">总游戏场次</div>
            </div>
          </div>
        </el-col>
        <el-col :xs="24" :sm="12" :md="6">
          <div class="stat-card avg-winrate">
            <div class="stat-icon">
              <el-icon size="32"><Trophy /></el-icon>
            </div>
            <div class="stat-content">
              <div class="stat-value">{{ overviewStats.avgWinRate }}%</div>
              <div class="stat-label">平均胜率</div>
            </div>
          </div>
        </el-col>
        <el-col :xs="24" :sm="12" :md="6">
          <div class="stat-card total-bombs">
            <div class="stat-icon">
              <el-icon size="32"><Flag /></el-icon>
            </div>
            <div class="stat-content">
              <div class="stat-value">{{ overviewStats.totalBombs }}</div>
              <div class="stat-label">炸弹总数</div>
            </div>
          </div>
        </el-col>
      </el-row>
    </div>

    <!-- 数据表格 -->
    <div class="gva-table-box">
      <el-table 
        :data="tableData" 
        row-key="ID"
        stripe
        :header-cell-style="{ background: '#f5f7fa', color: '#606266', fontWeight: '600' }"
      >
        <el-table-column align="center" label="玩家信息" min-width="180">
          <template #default="scope">
            <div class="player-info">
              <el-avatar :size="36" :src="scope.row.playerAvatar" class="player-avatar">
                {{ (scope.row.playerName || scope.row.playerId || '').substring(0, 1) }}
              </el-avatar>
              <div class="player-detail">
                <div class="player-name">{{ scope.row.playerName || '-' }}</div>
                <div class="player-id">ID: {{ scope.row.playerId }}</div>
              </div>
            </div>
          </template>
        </el-table-column>
        
        <el-table-column align="center" label="游戏统计" min-width="280">
          <template #default="scope">
            <div class="game-stats">
              <div class="stat-item">
                <span class="stat-num total">{{ scope.row.totalGames }}</span>
                <span class="stat-desc">总场次</span>
              </div>
              <div class="stat-divider"></div>
              <div class="stat-item">
                <span class="stat-num win">{{ scope.row.winGames }}</span>
                <span class="stat-desc">胜场</span>
              </div>
              <div class="stat-divider"></div>
              <div class="stat-item">
                <span class="stat-num lose">{{ scope.row.loseGames }}</span>
                <span class="stat-desc">负场</span>
              </div>
            </div>
          </template>
        </el-table-column>

        <el-table-column align="center" label="胜率" min-width="150">
          <template #default="scope">
            <div class="winrate-cell">
              <el-progress 
                :percentage="scope.row.winRate" 
                :color="getWinRateColor(scope.row.winRate)"
                :stroke-width="10"
                :show-text="false"
                style="width: 80px"
              />
              <span class="winrate-text" :style="{ color: getWinRateColor(scope.row.winRate) }">
                {{ formatWinRate(scope.row.winRate) }}%
              </span>
            </div>
          </template>
        </el-table-column>

        <el-table-column align="center" label="角色分析" min-width="200">
          <template #default="scope">
            <div class="role-stats">
              <div class="role-item landlord">
                <span class="role-label">地主</span>
                <span class="role-count">{{ scope.row.landlordGames }}场</span>
                <span class="role-win">{{ scope.row.landlordWins || 0 }}胜</span>
              </div>
              <div class="role-item farmer">
                <span class="role-label">农民</span>
                <span class="role-count">{{ scope.row.farmerGames }}场</span>
                <span class="role-win">{{ scope.row.farmerWins || 0 }}胜</span>
              </div>
            </div>
          </template>
        </el-table-column>

        <el-table-column align="center" label="金币变化" min-width="100">
          <template #default="scope">
            <div class="gold-change" :class="scope.row.totalGoldChange >= 0 ? 'positive' : 'negative'">
              <el-icon v-if="scope.row.totalGoldChange >= 0"><CaretTop /></el-icon>
              <el-icon v-else><CaretBottom /></el-icon>
              <span>{{ Math.abs(scope.row.totalGoldChange).toLocaleString() }}</span>
            </div>
          </template>
        </el-table-column>

        <el-table-column align="center" label="炸弹/火箭" min-width="100">
          <template #default="scope">
            <div class="bomb-stats">
              <el-tag v-if="scope.row.totalBombs > 0" type="warning" size="small">
                <el-icon><Flag /></el-icon> {{ scope.row.totalBombs }}
              </el-tag>
              <span v-else class="text-muted">-</span>
            </div>
          </template>
        </el-table-column>

        <el-table-column align="center" label="统计日期" min-width="120" prop="statDate" />

        <el-table-column align="center" label="操作" min-width="100" fixed="right">
          <template #default="scope">
            <el-button type="primary" link icon="View" @click="viewDetail(scope.row)">详情</el-button>
          </template>
        </el-table-column>
      </el-table>

      <div class="gva-pagination">
        <el-pagination
          :current-page="page"
          :page-size="pageSize"
          :page-sizes="[10, 20, 50, 100]"
          :total="total"
          layout="total, sizes, prev, pager, next, jumper"
          @current-change="handleCurrentChange"
          @size-change="handleSizeChange"
        />
      </div>
    </div>

    <!-- 详情弹窗 -->
    <el-dialog v-model="detailDialog" title="玩家统计详情" width="700px">
      <el-descriptions :column="2" border v-if="currentPlayer">
        <el-descriptions-item label="玩家ID">{{ currentPlayer.playerId }}</el-descriptions-item>
        <el-descriptions-item label="玩家昵称">{{ currentPlayer.playerName || '-' }}</el-descriptions-item>
        <el-descriptions-item label="统计日期">{{ currentPlayer.statDate }}</el-descriptions-item>
        <el-descriptions-item label="总场次">{{ currentPlayer.totalGames }}</el-descriptions-item>
        <el-descriptions-item label="胜场">{{ currentPlayer.winGames }}</el-descriptions-item>
        <el-descriptions-item label="负场">{{ currentPlayer.loseGames }}</el-descriptions-item>
        <el-descriptions-item label="胜率">
          <el-tag :type="currentPlayer.winRate >= 50 ? 'success' : 'danger'">
            {{ formatWinRate(currentPlayer.winRate) }}%
          </el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="金币变化">
          <span :class="currentPlayer.totalGoldChange >= 0 ? 'text-success' : 'text-danger'">
            {{ currentPlayer.totalGoldChange >= 0 ? '+' : '' }}{{ currentPlayer.totalGoldChange }}
          </span>
        </el-descriptions-item>
        <el-descriptions-item label="地主场次">{{ currentPlayer.landlordGames }}</el-descriptions-item>
        <el-descriptions-item label="地主胜场">{{ currentPlayer.landlordWins || 0 }}</el-descriptions-item>
        <el-descriptions-item label="农民场次">{{ currentPlayer.farmerGames }}</el-descriptions-item>
        <el-descriptions-item label="农民胜场">{{ currentPlayer.farmerWins || 0 }}</el-descriptions-item>
        <el-descriptions-item label="炸弹数">{{ currentPlayer.totalBombs }}</el-descriptions-item>
        <el-descriptions-item label="火箭数">{{ currentPlayer.totalRockets || 0 }}</el-descriptions-item>
        <el-descriptions-item label="春天次数">{{ currentPlayer.springCount || 0 }}</el-descriptions-item>
        <el-descriptions-item label="反春天次数">{{ currentPlayer.antiSpringCount || 0 }}</el-descriptions-item>
      </el-descriptions>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { getPlayerStatList } from '@/api/ddz/gameLog'
import { User, TrendCharts, Trophy, Flag, CaretTop, CaretBottom } from '@element-plus/icons-vue'

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
  if (rate >= 60) return '#67c23a'
  if (rate >= 40) return '#e6a23c'
  return '#f56c6c'
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
    ...searchInfo.value
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
  padding: 0;
}

/* 统计卡片样式 */
.stat-cards {
  margin-bottom: 20px;
}

.stat-card {
  background: #fff;
  border-radius: 8px;
  padding: 20px;
  display: flex;
  align-items: center;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.05);
  transition: all 0.3s ease;
  margin-bottom: 10px;
}

.stat-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
}

.stat-icon {
  width: 60px;
  height: 60px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 16px;
  color: #fff;
}

.total-players .stat-icon {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.total-games .stat-icon {
  background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
}

.avg-winrate .stat-icon {
  background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
}

.total-bombs .stat-icon {
  background: linear-gradient(135deg, #fa709a 0%, #fee140 100%);
}

.stat-content {
  flex: 1;
}

.stat-value {
  font-size: 28px;
  font-weight: 700;
  color: #303133;
  line-height: 1.2;
}

.stat-label {
  font-size: 14px;
  color: #909399;
  margin-top: 4px;
}

/* 玩家信息样式 */
.player-info {
  display: flex;
  align-items: center;
  justify-content: flex-start;
  padding: 8px 0;
}

.player-avatar {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: #fff;
  margin-right: 12px;
  flex-shrink: 0;
}

.player-detail {
  text-align: left;
}

.player-name {
  font-weight: 600;
  color: #303133;
  font-size: 14px;
}

.player-id {
  font-size: 12px;
  color: #909399;
  margin-top: 2px;
}

/* 游戏统计样式 */
.game-stats {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
}

.stat-item {
  text-align: center;
}

.stat-num {
  display: block;
  font-size: 18px;
  font-weight: 600;
}

.stat-num.total {
  color: #409eff;
}

.stat-num.win {
  color: #67c23a;
}

.stat-num.lose {
  color: #f56c6c;
}

.stat-desc {
  font-size: 12px;
  color: #909399;
}

.stat-divider {
  width: 1px;
  height: 30px;
  background: #ebeef5;
}

/* 胜率进度条样式 */
.winrate-cell {
  display: flex;
  align-items: center;
  gap: 8px;
  justify-content: center;
}

.winrate-text {
  font-weight: 600;
  font-size: 14px;
  min-width: 50px;
}

/* 角色分析样式 */
.role-stats {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.role-item {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
}

.role-item.landlord .role-label {
  color: #f56c6c;
}

.role-item.farmer .role-label {
  color: #67c23a;
}

.role-label {
  font-weight: 600;
  min-width: 36px;
}

.role-count {
  color: #606266;
}

.role-win {
  color: #909399;
}

/* 金币变化样式 */
.gold-change {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 2px;
  font-weight: 600;
  font-size: 16px;
}

.gold-change.positive {
  color: #67c23a;
}

.gold-change.negative {
  color: #f56c6c;
}

.bomb-stats {
  display: flex;
  justify-content: center;
}

.text-muted {
  color: #c0c4cc;
}

.text-success {
  color: #67c23a;
}

.text-danger {
  color: #f56c6c;
}
</style>
