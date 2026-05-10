<template>
  <div class="bid-log-page">
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
        <el-form-item label="叫地主类型">
          <el-select v-model="searchInfo.bidType" placeholder="全部类型" clearable style="width: 140px">
            <el-option label="不叫" :value="0" />
            <el-option label="叫地主" :value="1" />
            <el-option label="抢地主" :value="2" />
          </el-select>
        </el-form-item>
        <el-form-item label="成为地主">
          <el-select v-model="searchInfo.isSuccess" placeholder="全部" clearable style="width: 120px">
            <el-option label="是" :value="true" />
            <el-option label="否" :value="false" />
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
            <el-icon :size="28"><Document /></el-icon>
          </div>
          <div class="stat-card__content">
            <div class="stat-card__value">{{ overviewStats.totalRecords }}</div>
            <div class="stat-card__label">总记录数</div>
          </div>
        </div>
      </div>
      <div class="stat-card-wrapper">
        <div class="stat-card stat-card--bid">
          <div class="stat-card__icon">
            <el-icon :size="28"><Microphone /></el-icon>
          </div>
          <div class="stat-card__content">
            <div class="stat-card__value">{{ overviewStats.bidCount }}</div>
            <div class="stat-card__label">叫地主次数</div>
          </div>
        </div>
      </div>
      <div class="stat-card-wrapper">
        <div class="stat-card stat-card--grab">
          <div class="stat-card__icon">
            <el-icon :size="28"><Star /></el-icon>
          </div>
          <div class="stat-card__content">
            <div class="stat-card__value">{{ overviewStats.grabCount }}</div>
            <div class="stat-card__label">抢地主次数</div>
          </div>
        </div>
      </div>
      <div class="stat-card-wrapper">
        <div class="stat-card stat-card--success">
          <div class="stat-card__icon">
            <el-icon :size="28"><Trophy /></el-icon>
          </div>
          <div class="stat-card__content">
            <div class="stat-card__value">{{ overviewStats.landlordCount }}</div>
            <div class="stat-card__label">成为地主次数</div>
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
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', 
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
              </div>
              <div class="player-info">
                <div class="player-name">{{ scope.row.playerName || '未知玩家' }}</div>
                <div class="player-id">ID: {{ scope.row.playerId }}</div>
              </div>
            </div>
          </template>
        </el-table-column>

        <!-- 叫分行为列 -->
        <el-table-column label="叫分行为" min-width="200" align="center">
          <template #default="scope">
            <div class="bid-action-cell">
              <div class="bid-type-tag" :class="getBidTypeClass(scope.row.bidType)">
                <span class="bid-icon">{{ getBidTypeIcon(scope.row.bidType) }}</span>
                <span class="bid-text">{{ getBidTypeText(scope.row.bidType) }}</span>
              </div>
              <div class="bid-detail">
                <span class="bid-score" v-if="scope.row.bidScore > 0">
                  叫分: <strong>{{ scope.row.bidScore }}</strong>分
                </span>
                <span class="bid-order">第{{ scope.row.bidOrder }}位叫分</span>
              </div>
            </div>
          </template>
        </el-table-column>

        <!-- 成为地主列 -->
        <el-table-column label="成为地主" min-width="120" align="center">
          <template #default="scope">
            <div class="landlord-result" :class="scope.row.isSuccess ? 'is-landlord' : 'not-landlord'">
              <span class="result-icon">{{ scope.row.isSuccess ? '👑' : '—' }}</span>
              <span class="result-text">{{ scope.row.isSuccess ? '是' : '否' }}</span>
            </div>
          </template>
        </el-table-column>

        <!-- 游戏ID列 -->
        <el-table-column label="游戏ID" min-width="180" align="center">
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
        <el-table-column label="叫分时间" min-width="160" align="center">
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
      title="叫分日志详情" 
      width="600px"
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
          <div class="detail-result-badge" :class="currentLog.isSuccess ? 'success' : 'fail'">
            {{ currentLog.isSuccess ? '👑 成为地主' : '未成为地主' }}
          </div>
        </div>

        <!-- 叫分详情 -->
        <div class="detail-section">
          <div class="detail-section-title">叫分信息</div>
          <div class="detail-grid">
            <div class="detail-item">
              <span class="detail-label">叫分类型</span>
              <span class="detail-value" :class="getBidTypeClass(currentLog.bidType)">
                {{ getBidTypeIcon(currentLog.bidType) }} {{ getBidTypeText(currentLog.bidType) }}
              </span>
            </div>
            <div class="detail-item">
              <span class="detail-label">叫分顺序</span>
              <span class="detail-value">第 {{ currentLog.bidOrder }} 位</span>
            </div>
            <div class="detail-item">
              <span class="detail-label">叫分值</span>
              <span class="detail-value">{{ currentLog.bidScore || 0 }} 分</span>
            </div>
            <div class="detail-item">
              <span class="detail-label">是否成功</span>
              <span class="detail-value" :class="currentLog.isSuccess ? 'text-success' : 'text-muted'">
                {{ currentLog.isSuccess ? '是' : '否' }}
              </span>
            </div>
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
              <span class="detail-label">叫分时间</span>
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
import { getBidLogList } from '@/api/ddz/gameLog'
import { 
  Search, Refresh, User, Document, Microphone, Star, Trophy, 
  Clock, View, CopyDocument 
} from '@element-plus/icons-vue'
import { getUrl } from '@/utils/image'
import { ElMessage } from 'element-plus'

defineOptions({
  name: 'DDZBidLog'
})

const searchInfo = ref({
  gameId: '',
  playerId: '',
  bidType: null,
  isSuccess: null
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
    return { totalRecords: 0, bidCount: 0, grabCount: 0, landlordCount: 0 }
  }
  
  const bidCount = records.filter(r => r.bidType === 1).length
  const grabCount = records.filter(r => r.bidType === 2).length
  const landlordCount = records.filter(r => r.isSuccess).length
  
  return {
    totalRecords: total.value,
    bidCount,
    grabCount,
    landlordCount
  }
})

const getBidTypeText = (type) => {
  const map = { 0: '不叫', 1: '叫地主', 2: '抢地主' }
  return map[type] || '未知'
}

const getBidTypeIcon = (type) => {
  const map = { 0: '🙅', 1: '🙋', 2: '🔥' }
  return map[type] || '❓'
}

const getBidTypeClass = (type) => {
  const map = { 0: 'type-pass', 1: 'type-bid', 2: 'type-grab' }
  return map[type] || ''
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
    bidType: null,
    isSuccess: null
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
  const res = await getBidLogList({
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
.bid-log-page {
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
  background: linear-gradient(180deg, #667eea 0%, #764ba2 100%);
}

.stat-card--bid::before {
  background: linear-gradient(180deg, #4facfe 0%, #00f2fe 100%);
}

.stat-card--grab::before {
  background: linear-gradient(180deg, #fa709a 0%, #fee140 100%);
}

.stat-card--success::before {
  background: linear-gradient(180deg, #43e97b 0%, #38f9d7 100%);
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
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.stat-card--bid .stat-card__icon {
  background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
}

.stat-card--grab .stat-card__icon {
  background: linear-gradient(135deg, #fa709a 0%, #fee140 100%);
}

.stat-card--success .stat-card__icon {
  background: linear-gradient(135deg, #43e97b 0%, #38f9d7 100%);
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
  flex-shrink: 0;
}

.player-avatar {
  border: 2px solid #e8e8e8;
}

.player-avatar--default {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: #fff;
  font-weight: 600;
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

/* 叫分行为单元格 */
.bid-action-cell {
  display: flex;
  flex-direction: column;
  gap: 6px;
  align-items: center;
}

.bid-type-tag {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 4px 12px;
  border-radius: 16px;
  font-size: 13px;
  font-weight: 600;
}

.bid-type-tag.type-pass {
  background: #f5f5f5;
  color: #8c8c8c;
}

.bid-type-tag.type-bid {
  background: #e6f7ff;
  color: #1890ff;
}

.bid-type-tag.type-grab {
  background: #fff7e6;
  color: #fa8c16;
}

.bid-icon {
  font-size: 14px;
}

.bid-detail {
  display: flex;
  gap: 12px;
  font-size: 12px;
  color: #8c8c8c;
}

.bid-score strong {
  color: #faad14;
}

/* 成为地主结果 */
.landlord-result {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 4px 12px;
  border-radius: 16px;
}

.landlord-result.is-landlord {
  background: linear-gradient(135deg, #ffd700 0%, #ffaa00 100%);
  color: #7c5800;
}

.landlord-result.not-landlord {
  background: #f5f5f5;
  color: #8c8c8c;
}

.result-icon {
  font-size: 16px;
}

.result-text {
  font-weight: 600;
  font-size: 13px;
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

.detail-result-badge {
  padding: 6px 16px;
  border-radius: 20px;
  font-size: 14px;
  font-weight: 600;
}

.detail-result-badge.success {
  background: linear-gradient(135deg, #ffd700 0%, #ffaa00 100%);
  color: #7c5800;
}

.detail-result-badge.fail {
  background: #f5f5f5;
  color: #8c8c8c;
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
  border-left: 3px solid #667eea;
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

.detail-value.type-pass {
  color: #8c8c8c;
}

.detail-value.type-bid {
  color: #1890ff;
}

.detail-value.type-grab {
  color: #fa8c16;
}

.detail-value.text-success {
  color: #52c41a;
}

.detail-value.text-muted {
  color: #8c8c8c;
}

.detail-value.game-id {
  font-family: 'Monaco', 'Consolas', monospace;
  font-size: 12px;
  word-break: break-all;
}
</style>
