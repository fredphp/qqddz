<template>
  <div class="deal-log-page">
    <!-- 搜索区域 -->
    <div class="search-section">
      <el-form ref="searchForm" :inline="true" :model="searchInfo" class="search-form">
        <el-form-item label="游戏ID">
          <el-input 
            v-model="searchInfo.gameId" 
            placeholder="请输入游戏ID" 
            clearable 
            :prefix-icon="Search"
            style="width: 200px" 
          />
        </el-form-item>
        <el-form-item label="玩家ID">
          <el-input 
            v-model="searchInfo.playerId" 
            placeholder="请输入玩家ID" 
            clearable 
            :prefix-icon="User"
            style="width: 160px" 
          />
        </el-form-item>
        <el-form-item label="玩家角色">
          <el-select v-model="searchInfo.playerRole" placeholder="全部角色" clearable style="width: 120px">
            <el-option label="地主" :value="1" />
            <el-option label="农民" :value="2" />
          </el-select>
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
            <el-icon :size="28"><Tickets /></el-icon>
          </div>
          <div class="stat-card__content">
            <div class="stat-card__value">{{ overviewStats.totalRecords }}</div>
            <div class="stat-card__label">总发牌记录</div>
          </div>
        </div>
      </div>
      <div class="stat-card-wrapper">
        <div class="stat-card stat-card--landlord">
          <div class="stat-card__icon">
            <span class="role-emoji">👑</span>
          </div>
          <div class="stat-card__content">
            <div class="stat-card__value">{{ overviewStats.landlordCount }}</div>
            <div class="stat-card__label">地主发牌次数</div>
          </div>
        </div>
      </div>
      <div class="stat-card-wrapper">
        <div class="stat-card stat-card--farmer">
          <div class="stat-card__icon">
            <span class="role-emoji">🌾</span>
          </div>
          <div class="stat-card__content">
            <div class="stat-card__value">{{ overviewStats.farmerCount }}</div>
            <div class="stat-card__label">农民发牌次数</div>
          </div>
        </div>
      </div>
      <div class="stat-card-wrapper">
        <div class="stat-card stat-card--games">
          <div class="stat-card__icon">
            <el-icon :size="28"><VideoGame /></el-icon>
          </div>
          <div class="stat-card__content">
            <div class="stat-card__value">{{ overviewStats.gameCount }}</div>
            <div class="stat-card__label">涉及游戏局数</div>
          </div>
        </div>
      </div>
    </div>

    <!-- 数据表格 -->
    <div class="table-section">
      <el-table 
        :data="tableData" 
        row-key="ID"
        class="custom-table"
        :header-cell-style="{ 
          background: 'linear-gradient(135deg, #11998e 0%, #38ef7d 100%)', 
          color: '#fff', 
          fontWeight: '600',
          fontSize: '14px',
          height: '50px'
        }"
        :cell-style="{ padding: '14px 12px' }"
      >
        <!-- 玩家信息列 -->
        <el-table-column label="玩家信息" min-width="150">
          <template #default="scope">
            <div class="player-cell">
              <div class="player-avatar-wrapper">
                <el-avatar 
                  v-if="scope.row.playerAvatar" 
                  :size="40" 
                  :src="getUrl(scope.row.playerAvatar)" 
                  class="player-avatar"
                />
                <el-avatar 
                  v-else 
                  :size="40" 
                  class="player-avatar player-avatar--default"
                >
                  {{ (scope.row.playerName || scope.row.playerId || '?').toString().substring(0, 1).toUpperCase() }}
                </el-avatar>
                <span class="role-badge" :class="scope.row.playerRole === 1 ? 'landlord' : 'farmer'">
                  {{ scope.row.playerRole === 1 ? '👑' : '🌾' }}
                </span>
              </div>
              <div class="player-info">
                <div class="player-name">{{ scope.row.playerName || '未知玩家' }}</div>
                <div class="player-id">ID: {{ scope.row.playerId }}</div>
              </div>
            </div>
          </template>
        </el-table-column>

        <!-- 角色列 -->
        <el-table-column label="角色" min-width="100" align="center">
          <template #default="scope">
            <div class="role-cell" :class="scope.row.playerRole === 1 ? 'is-landlord' : 'is-farmer'">
              <span class="role-icon">{{ scope.row.playerRole === 1 ? '👑' : '🌾' }}</span>
              <span class="role-text">{{ scope.row.playerRole === 1 ? '地主' : '农民' }}</span>
            </div>
          </template>
        </el-table-column>

        <!-- 手牌列 -->
        <el-table-column label="手牌" min-width="320">
          <template #default="scope">
            <div class="cards-cell">
              <div class="cards-preview">
                <div class="cards-container">
                  <template v-if="scope.row.handCards">
                    <span 
                      v-for="(card, index) in parseCards(scope.row.handCards).slice(0, 8)" 
                      :key="index"
                      class="card-item"
                      :class="getCardClass(card)"
                    >
                      {{ formatCard(card) }}
                    </span>
                    <span v-if="parseCards(scope.row.handCards).length > 8" class="card-more">
                      +{{ parseCards(scope.row.handCards).length - 8 }}
                    </span>
                  </template>
                  <span v-else class="no-cards">-</span>
                </div>
              </div>
              <div class="cards-count-badge">{{ scope.row.cardsCount || 0 }}张</div>
            </div>
          </template>
        </el-table-column>

        <!-- 底牌列 -->
        <el-table-column label="底牌" min-width="150" align="center">
          <template #default="scope">
            <div v-if="scope.row.landlordCards && scope.row.playerRole === 1" class="landlord-cards">
              <div class="cards-container small">
                <span 
                  v-for="(card, index) in parseCards(scope.row.landlordCards)" 
                  :key="index"
                  class="card-item small"
                  :class="getCardClass(card)"
                >
                  {{ formatCard(card) }}
                </span>
              </div>
            </div>
            <span v-else class="no-landlord-cards">—</span>
          </template>
        </el-table-column>

        <!-- 游戏ID列 -->
        <el-table-column label="游戏ID" min-width="160" align="center">
          <template #default="scope">
            <div class="game-id-cell">
              <el-tooltip :content="scope.row.gameId" placement="top">
                <span class="game-id-text">{{ formatGameId(scope.row.gameId) }}</span>
              </el-tooltip>
              <el-button 
                type="primary" 
                link 
                size="small" 
                :icon="CopyDocument"
                @click="copyGameId(scope.row.gameId)"
                class="copy-btn"
              />
            </div>
          </template>
        </el-table-column>

        <!-- 时间列 -->
        <el-table-column label="发牌时间" min-width="160" align="center">
          <template #default="scope">
            <div class="time-cell">
              <el-icon :size="14"><Clock /></el-icon>
              <span>{{ scope.row.createdAt }}</span>
            </div>
          </template>
        </el-table-column>

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
      title="发牌日志详情" 
      width="700px"
      class="detail-dialog"
      :close-on-click-modal="false"
    >
      <div v-if="currentLog" class="detail-content">
        <!-- 玩家信息 -->
        <div class="detail-header">
          <el-avatar 
            v-if="currentLog.playerAvatar" 
            :size="56" 
            :src="getUrl(currentLog.playerAvatar)"
            class="detail-avatar"
          />
          <el-avatar 
            v-else 
            :size="56" 
            class="detail-avatar detail-avatar--default"
          >
            {{ (currentLog.playerName || currentLog.playerId || '?').toString().substring(0, 1).toUpperCase() }}
          </el-avatar>
          <div class="detail-player-info">
            <div class="detail-player-name">{{ currentLog.playerName || '未知玩家' }}</div>
            <div class="detail-player-id">玩家ID: {{ currentLog.playerId }}</div>
          </div>
          <div class="detail-role-badge" :class="currentLog.playerRole === 1 ? 'landlord' : 'farmer'">
            {{ currentLog.playerRole === 1 ? '👑 地主' : '🌾 农民' }}
          </div>
        </div>

        <!-- 手牌展示 -->
        <div class="detail-section">
          <div class="detail-section-title">手牌 ({{ currentLog.cardsCount || 0 }}张)</div>
          <div class="detail-cards-display">
            <template v-if="currentLog.handCards">
              <span 
                v-for="(card, index) in parseCards(currentLog.handCards)" 
                :key="index"
                class="detail-card-item"
                :class="getCardClass(card)"
              >
                {{ formatCard(card) }}
              </span>
            </template>
            <span v-else class="no-cards">暂无手牌数据</span>
          </div>
        </div>

        <!-- 底牌展示（仅地主） -->
        <div class="detail-section" v-if="currentLog.playerRole === 1 && currentLog.landlordCards">
          <div class="detail-section-title">底牌 (3张)</div>
          <div class="detail-cards-display landlord">
            <span 
              v-for="(card, index) in parseCards(currentLog.landlordCards)" 
              :key="index"
              class="detail-card-item"
              :class="getCardClass(card)"
            >
              {{ formatCard(card) }}
            </span>
          </div>
        </div>

        <!-- 游戏信息 -->
        <div class="detail-section">
          <div class="detail-section-title">游戏信息</div>
          <div class="detail-grid">
            <div class="detail-item full-width">
              <span class="detail-label">游戏ID</span>
              <span class="detail-value game-id">{{ currentLog.gameId }}</span>
            </div>
            <div class="detail-item">
              <span class="detail-label">记录ID</span>
              <span class="detail-value">{{ currentLog.ID }}</span>
            </div>
            <div class="detail-item">
              <span class="detail-label">发牌时间</span>
              <span class="detail-value">{{ currentLog.createdAt }}</span>
            </div>
          </div>
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { getDealLogList } from '@/api/ddz/gameLog'
import { 
  Search, Refresh, User, Tickets, VideoGame, 
  Clock, View, CopyDocument 
} from '@element-plus/icons-vue'
import { getUrl } from '@/utils/image'
import { ElMessage } from 'element-plus'

defineOptions({
  name: 'DDZDealLog'
})

const searchInfo = ref({
  gameId: '',
  playerId: '',
  playerRole: null
})

const page = ref(1)
const total = ref(0)
const pageSize = ref(10)
const tableData = ref([])

const detailDialog = ref(false)
const currentLog = ref(null)

// 计算概览统计
const overviewStats = computed(() => {
  const records = tableData.value
  if (!records.length) {
    return { totalRecords: 0, landlordCount: 0, farmerCount: 0, gameCount: 0 }
  }
  
  const landlordCount = records.filter(r => r.playerRole === 1).length
  const farmerCount = records.filter(r => r.playerRole === 2).length
  const gameIds = new Set(records.map(r => r.gameId))
  
  return {
    totalRecords: total.value,
    landlordCount,
    farmerCount,
    gameCount: gameIds.size
  }
})

// 解析手牌字符串
const parseCards = (cardsStr) => {
  if (!cardsStr) return []
  return cardsStr.split(',').filter(c => c.trim())
}

// 格式化单张牌
const formatCard = (card) => {
  if (!card) return ''
  const cardMap = {
    '14': 'A', '15': '2', '16': '3', '17': '4', '18': '5', '19': '6', '20': '7',
    '21': '8', '22': '9', '23': '10', '24': 'J', '25': 'Q', '26': 'K',
    '27': '小王', '28': '大王',
    '1': 'A', '2': '2', '3': '3', '4': '4', '5': '5', '6': '6', '7': '7',
    '8': '8', '9': '9', '10': '10', '11': 'J', '12': 'Q', '13': 'K'
  }
  // 提取牌面值（去掉花色前缀）
  const value = card.replace(/^[shdc]/i, '')
  return cardMap[value] || value
}

// 获取牌的样式类
const getCardClass = (card) => {
  if (!card) return ''
  // 小王
  if (card === '27' || card.toLowerCase().includes('joker1')) return 'card-joker-small'
  // 大王
  if (card === '28' || card.toLowerCase().includes('joker2')) return 'card-joker-big'
  
  // 红色牌（红桃、方块）
  if (card.startsWith('h') || card.startsWith('d') || 
      card.startsWith('H') || card.startsWith('D')) {
    return 'card-red'
  }
  return 'card-black'
}

const formatGameId = (gameId) => {
  if (!gameId) return '-'
  if (gameId.length <= 16) return gameId
  return gameId.substring(0, 8) + '...' + gameId.substring(gameId.length - 4)
}

const copyGameId = (gameId) => {
  navigator.clipboard.writeText(gameId).then(() => {
    ElMessage.success('游戏ID已复制')
  })
}

const onSubmit = () => {
  page.value = 1
  getTableData()
}

const onReset = () => {
  searchInfo.value = {
    gameId: '',
    playerId: '',
    playerRole: null
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
  currentLog.value = row
  detailDialog.value = true
}

const getTableData = async () => {
  const res = await getDealLogList({
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
.deal-log-page {
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

.stat-card--total::before {
  background: linear-gradient(180deg, #11998e 0%, #38ef7d 100%);
}

.stat-card--landlord::before {
  background: linear-gradient(180deg, #f093fb 0%, #f5576c 100%);
}

.stat-card--farmer::before {
  background: linear-gradient(180deg, #4facfe 0%, #00f2fe 100%);
}

.stat-card--games::before {
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

.stat-card--total .stat-card__icon {
  background: linear-gradient(135deg, #11998e 0%, #38ef7d 100%);
}

.stat-card--landlord .stat-card__icon {
  background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
}

.stat-card--farmer .stat-card__icon {
  background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
}

.stat-card--games .stat-card__icon {
  background: linear-gradient(135deg, #fa709a 0%, #fee140 100%);
}

.role-emoji {
  font-size: 28px;
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
  gap: 10px;
}

.player-avatar-wrapper {
  position: relative;
  flex-shrink: 0;
}

.player-avatar {
  border: 2px solid #e8e8e8;
}

.player-avatar--default {
  background: linear-gradient(135deg, #11998e 0%, #38ef7d 100%);
  color: #fff;
  font-weight: 600;
}

.role-badge {
  position: absolute;
  bottom: -4px;
  right: -4px;
  width: 18px;
  height: 18px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 10px;
}

.role-badge.landlord {
  background: linear-gradient(135deg, #ffd700 0%, #ffaa00 100%);
}

.role-badge.farmer {
  background: linear-gradient(135deg, #43e97b 0%, #38f9d7 100%);
}

.player-info {
  text-align: left;
}

.player-name {
  font-weight: 600;
  color: #1a1a2e;
  font-size: 14px;
}

.player-id {
  font-size: 12px;
  color: #8c8c8c;
}

/* 角色单元格 */
.role-cell {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 4px 12px;
  border-radius: 16px;
  font-weight: 600;
  font-size: 13px;
}

.role-cell.is-landlord {
  background: linear-gradient(135deg, #ffd700 0%, #ffaa00 100%);
  color: #7c5800;
}

.role-cell.is-farmer {
  background: #e6f7ff;
  color: #1890ff;
}

.role-icon {
  font-size: 14px;
}

/* 手牌单元格 */
.cards-cell {
  display: flex;
  align-items: center;
  gap: 10px;
}

.cards-preview {
  flex: 1;
}

.cards-container {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
}

.cards-container.small {
  gap: 2px;
}

.card-item {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 28px;
  height: 36px;
  padding: 0 6px;
  background: linear-gradient(145deg, #fff 0%, #f5f5f5 100%);
  border: 1px solid #d9d9d9;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 600;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.card-item.small {
  min-width: 24px;
  height: 30px;
  font-size: 11px;
}

.card-item.card-red {
  color: #ff4d4f;
}

.card-item.card-black {
  color: #262626;
}

.card-item.card-joker-small {
  background: linear-gradient(145deg, #000 0%, #333 100%);
  color: #fff;
  border-color: #000;
}

.card-item.card-joker-big {
  background: linear-gradient(145deg, #ff4d4f 0%, #ff7875 100%);
  color: #fff;
  border-color: #ff4d4f;
}

.card-more {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 28px;
  height: 36px;
  background: #f0f0f0;
  border-radius: 4px;
  font-size: 12px;
  color: #8c8c8c;
}

.cards-count-badge {
  background: linear-gradient(135deg, #11998e 0%, #38ef7d 100%);
  color: #fff;
  font-size: 12px;
  font-weight: 600;
  padding: 2px 8px;
  border-radius: 10px;
  white-space: nowrap;
}

.no-cards {
  color: #bfbfbf;
  font-size: 13px;
}

/* 底牌 */
.landlord-cards {
  display: flex;
  justify-content: center;
}

.no-landlord-cards {
  color: #bfbfbf;
}

/* 游戏ID单元格 */
.game-id-cell {
  display: flex;
  align-items: center;
  gap: 6px;
  justify-content: center;
}

.game-id-text {
  font-family: 'Monaco', 'Consolas', monospace;
  font-size: 12px;
  color: #595959;
  background: #f5f5f5;
  padding: 4px 8px;
  border-radius: 4px;
}

.copy-btn {
  opacity: 0;
  transition: opacity 0.2s;
}

.game-id-cell:hover .copy-btn {
  opacity: 1;
}

/* 时间单元格 */
.time-cell {
  display: flex;
  align-items: center;
  gap: 6px;
  color: #595959;
  font-size: 13px;
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
  background: linear-gradient(135deg, #11998e 0%, #38ef7d 100%);
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
  border: 3px solid #11998e;
}

.detail-avatar--default {
  background: linear-gradient(135deg, #11998e 0%, #38ef7d 100%);
  color: #fff;
  font-size: 20px;
  font-weight: 600;
}

.detail-player-info {
  flex: 1;
}

.detail-player-name {
  font-size: 18px;
  font-weight: 700;
  color: #1a1a2e;
  margin-bottom: 4px;
}

.detail-player-id {
  font-size: 13px;
  color: #8c8c8c;
}

.detail-role-badge {
  padding: 6px 16px;
  border-radius: 20px;
  font-size: 14px;
  font-weight: 600;
}

.detail-role-badge.landlord {
  background: linear-gradient(135deg, #ffd700 0%, #ffaa00 100%);
  color: #7c5800;
}

.detail-role-badge.farmer {
  background: #e6f7ff;
  color: #1890ff;
}

.detail-section {
  margin-bottom: 20px;
}

.detail-section-title {
  font-size: 14px;
  font-weight: 600;
  color: #1a1a2e;
  margin-bottom: 12px;
  padding-left: 10px;
  border-left: 3px solid #11998e;
}

.detail-cards-display {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  padding: 16px;
  background: #fafafa;
  border-radius: 8px;
}

.detail-cards-display.landlord {
  background: linear-gradient(135deg, #fffbe6 0%, #fff1b8 100%);
}

.detail-card-item {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 36px;
  height: 48px;
  padding: 0 8px;
  background: linear-gradient(145deg, #fff 0%, #f5f5f5 100%);
  border: 1px solid #d9d9d9;
  border-radius: 6px;
  font-size: 16px;
  font-weight: 700;
  box-shadow: 0 3px 6px rgba(0, 0, 0, 0.1);
}

.detail-card-item.card-red {
  color: #ff4d4f;
}

.detail-card-item.card-black {
  color: #262626;
}

.detail-card-item.card-joker-small {
  background: linear-gradient(145deg, #000 0%, #333 100%);
  color: #fff;
  border-color: #000;
}

.detail-card-item.card-joker-big {
  background: linear-gradient(145deg, #ff4d4f 0%, #ff7875 100%);
  color: #fff;
  border-color: #ff4d4f;
}

.detail-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
}

.detail-item {
  background: #fafafa;
  border-radius: 8px;
  padding: 12px 16px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.detail-item.full-width {
  grid-column: span 2;
}

.detail-label {
  font-size: 13px;
  color: #8c8c8c;
}

.detail-value {
  font-size: 14px;
  font-weight: 600;
  color: #1a1a2e;
}

.detail-value.game-id {
  font-family: 'Monaco', 'Consolas', monospace;
  font-size: 12px;
  word-break: break-all;
}
</style>
