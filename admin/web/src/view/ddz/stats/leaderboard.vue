<template>
  <div class="leaderboard-page">
    <!-- 搜索区域 -->
    <div class="search-section">
      <el-form ref="searchForm" :inline="true" :model="searchInfo" class="search-form">
        <el-form-item label="竞技场期数">
          <el-select
            v-model="selectedPeriodId"
            placeholder="请选择期数"
            filterable
            clearable
            @change="onPeriodChange"
            style="width: 300px"
          >
            <el-option
              v-for="period in periodOptions"
              :key="period.ID"
              :label="`${period.periodNo} - ${period.roomName || '竞技场'}`"
              :value="period.ID"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="房间类型">
          <el-select v-model="searchInfo.roomType" placeholder="全部" clearable @change="loadPeriodList" style="width: 140px">
            <el-option label="初级场" :value="1" />
            <el-option label="中级场" :value="2" />
            <el-option label="高级场" :value="3" />
            <el-option label="专家场" :value="4" />
          </el-select>
        </el-form-item>
        <el-form-item label="状态">
          <el-select v-model="searchInfo.status" placeholder="全部" clearable @change="loadPeriodList" style="width: 140px">
            <el-option label="准备中" :value="0" />
            <el-option label="报名中" :value="1" />
            <el-option label="等待开赛" :value="2" />
            <el-option label="比赛进行中" :value="3" />
            <el-option label="已结束" :value="4" />
            <el-option label="已取消" :value="5" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" :icon="Search" @click="loadPeriodList">查询</el-button>
          <el-button :icon="Refresh" @click="onReset">重置</el-button>
        </el-form-item>
      </el-form>
    </div>

    <!-- 选中期数信息展示 -->
    <div v-if="selectedPeriod" class="period-section">
      <div class="period-header">
        <div class="period-title-area">
          <span class="period-icon">🏆</span>
          <div class="period-title-text">
            <div class="period-main-title">{{ selectedPeriod.periodNo }} - {{ selectedPeriod.roomName || '竞技场' }}</div>
            <div class="period-sub-title">
              <el-icon><Clock /></el-icon>
              {{ selectedPeriod.startTime }}
            </div>
          </div>
        </div>
        <el-tag :type="getStatusTagType(selectedPeriod.status)" size="large" class="status-tag">
          {{ selectedPeriod.statusText }}
        </el-tag>
      </div>
      
      <!-- 统计卡片 -->
      <div class="stats-grid">
        <div class="stat-card stat-card--signup">
          <div class="stat-card__icon">
            <el-icon :size="24"><User /></el-icon>
          </div>
          <div class="stat-card__content">
            <div class="stat-card__value">{{ selectedPeriod.totalSignup || 0 }}</div>
            <div class="stat-card__label">报名人数</div>
          </div>
        </div>
        <div class="stat-card stat-card--players">
          <div class="stat-card__icon">
            <el-icon :size="24"><UserFilled /></el-icon>
          </div>
          <div class="stat-card__content">
            <div class="stat-card__value">{{ selectedPeriod.finalPlayers || 0 }}</div>
            <div class="stat-card__label">参赛人数</div>
          </div>
        </div>
        <div class="stat-card stat-card--room">
          <div class="stat-card__icon">
            <span class="room-icon">🎮</span>
          </div>
          <div class="stat-card__content">
            <div class="stat-card__value">{{ selectedPeriod.roomTypeText || '-' }}</div>
            <div class="stat-card__label">房间类型</div>
          </div>
        </div>
        <div class="stat-card stat-card--rank">
          <div class="stat-card__icon">
            <el-icon :size="24"><Trophy /></el-icon>
          </div>
          <div class="stat-card__content">
            <div class="stat-card__value">{{ leaderboardData.length }}</div>
            <div class="stat-card__label">排行榜人数</div>
          </div>
        </div>
      </div>
    </div>

    <!-- 排行榜内容 -->
    <div class="leaderboard-section">
      <!-- 未选择期数提示 -->
      <div v-if="!selectedPeriodId" class="empty-state">
        <el-empty description="请先选择一个竞技场期数查看排行榜">
          <template #image>
            <el-icon :size="80" color="#c0c4cc"><Trophy /></el-icon>
          </template>
        </el-empty>
      </div>

      <!-- 排行榜列表 -->
      <div v-else class="leaderboard-list">
        <!-- 前三名特殊展示 -->
        <div v-if="topThree.length > 0" class="top-three-section">
          <!-- 第二名 -->
          <div v-if="topThree[1]" class="top-player silver">
            <div class="top-player__rank">🥈</div>
            <div class="top-player__avatar">
              <el-avatar :size="64" :src="topThree[1].playerAvatar">
                {{ topThree[1].playerName?.charAt(0) || '?' }}
              </el-avatar>
            </div>
            <div class="top-player__name">{{ topThree[1].playerName || '未知玩家' }}</div>
            <div class="top-player__score">{{ formatNumber(topThree[1].matchCoin) }} 金币</div>
            <div class="top-player__label">亚军</div>
          </div>

          <!-- 第一名 -->
          <div v-if="topThree[0]" class="top-player gold">
            <div class="top-player__crown">👑</div>
            <div class="top-player__rank">🥇</div>
            <div class="top-player__avatar">
              <el-avatar :size="80" :src="topThree[0].playerAvatar">
                {{ topThree[0].playerName?.charAt(0) || '?' }}
              </el-avatar>
            </div>
            <div class="top-player__name">{{ topThree[0].playerName || '未知玩家' }}</div>
            <div class="top-player__score">{{ formatNumber(topThree[0].matchCoin) }} 金币</div>
            <div class="top-player__label champion">🏆 冠军</div>
          </div>

          <!-- 第三名 -->
          <div v-if="topThree[2]" class="top-player bronze">
            <div class="top-player__rank">🥉</div>
            <div class="top-player__avatar">
              <el-avatar :size="64" :src="topThree[2].playerAvatar">
                {{ topThree[2].playerName?.charAt(0) || '?' }}
              </el-avatar>
            </div>
            <div class="top-player__name">{{ topThree[2].playerName || '未知玩家' }}</div>
            <div class="top-player__score">{{ formatNumber(topThree[2].matchCoin) }} 金币</div>
            <div class="top-player__label">季军</div>
          </div>
        </div>

        <!-- 其他排名列表 -->
        <div v-if="otherRanks.length > 0" class="rank-list">
          <div 
            v-for="player in paginatedOtherRanks" 
            :key="player.playerId" 
            class="rank-item"
            :class="{ 'eliminated': player.isEliminated }"
          >
            <div class="rank-item__rank">
              <span class="rank-number">{{ player.rank }}</span>
            </div>
            <div class="rank-item__player">
              <el-avatar :size="40" :src="player.playerAvatar">
                {{ player.playerName?.charAt(0) || '?' }}
              </el-avatar>
              <div class="player-detail">
                <div class="player-name">
                  {{ player.playerName || '未知玩家' }}
                  <el-tag v-if="player.isChampion" type="danger" effect="dark" size="small" class="champion-tag">冠军</el-tag>
                </div>
                <div class="player-id">ID: {{ player.playerId }}</div>
              </div>
            </div>
            <div class="rank-item__score">
              <span class="score-value">{{ formatNumber(player.matchCoin) }}</span>
              <span class="score-unit">金币</span>
            </div>
            <div class="rank-item__status">
              <el-tag v-if="player.isChampion" type="danger" effect="dark">冠军</el-tag>
              <el-tag v-else-if="!player.isEliminated" type="success">存活</el-tag>
              <el-tag v-else type="info">已淘汰</el-tag>
            </div>
            <div class="rank-item__round">
              <span v-if="player.isEliminated && player.eliminatedRound > 0">第{{ player.eliminatedRound }}轮淘汰</span>
              <span v-else>-</span>
            </div>
          </div>
        </div>

        <!-- 无数据 -->
        <div v-if="selectedPeriodId && leaderboardData.length === 0" class="no-data">
          <el-empty description="该期数暂无排行榜数据" />
        </div>

        <!-- 分页 -->
        <div v-if="otherRanks.length > pageSize" class="pagination-section">
          <el-pagination
            :current-page="page"
            :page-size="pageSize"
            :page-sizes="[10, 20, 50]"
            :total="otherRanks.length"
            layout="total, sizes, prev, pager, next, jumper"
            @current-change="handleCurrentChange"
            @size-change="handleSizeChange"
            background
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { getArenaPeriodList, getArenaPeriodLeaderboard } from '@/api/ddz/arenaPeriod'
import { Search, Refresh, Clock, User, UserFilled, Trophy } from '@element-plus/icons-vue'

defineOptions({
  name: 'DDZLeaderboard'
})

const searchInfo = ref({
  roomType: null,
  status: null
})

const page = ref(1)
const pageSize = ref(10)
const selectedPeriodId = ref(null)
const selectedPeriod = ref(null)
const periodOptions = ref([])
const leaderboardData = ref([])

// 前三名
const topThree = computed(() => {
  return leaderboardData.value.slice(0, 3)
})

// 其他排名（第4名开始）
const otherRanks = computed(() => {
  return leaderboardData.value.slice(3)
})

// 分页后的其他排名
const paginatedOtherRanks = computed(() => {
  const start = (page.value - 1) * pageSize.value
  const end = start + pageSize.value
  return otherRanks.value.slice(start, end)
})

const formatNumber = (num) => {
  if (!num) return '0'
  return num.toLocaleString()
}

const getStatusTagType = (status) => {
  switch (status) {
    case 0: return 'info'
    case 1: return 'primary'
    case 2: return 'warning'
    case 3: return 'danger'
    case 4: return 'success'
    case 5: return 'info'
    default: return 'info'
  }
}

const loadPeriodList = async () => {
  const res = await getArenaPeriodList({
    page: 1,
    pageSize: 100,
    roomType: searchInfo.value.roomType,
    status: searchInfo.value.status
  })
  if (res.code === 0) {
    periodOptions.value = res.data.list || []
  }
}

const onPeriodChange = async (periodId) => {
  if (!periodId) {
    selectedPeriod.value = null
    leaderboardData.value = []
    return
  }

  // 找到选中的期数信息
  selectedPeriod.value = periodOptions.value.find(p => p.ID === periodId)

  // 加载排行榜数据
  await loadLeaderboard()
}

const loadLeaderboard = async () => {
  if (!selectedPeriodId.value) return

  const res = await getArenaPeriodLeaderboard({
    periodId: selectedPeriodId.value,
    limit: 100
  })
  if (res.code === 0) {
    leaderboardData.value = res.data || []
    page.value = 1 // 重置页码
  }
}

const onReset = () => {
  searchInfo.value = {
    roomType: null,
    status: null
  }
  selectedPeriodId.value = null
  selectedPeriod.value = null
  leaderboardData.value = []
  loadPeriodList()
}

const handleSizeChange = (val) => {
  pageSize.value = val
  page.value = 1
}

const handleCurrentChange = (val) => {
  page.value = val
}

onMounted(() => {
  loadPeriodList()
})
</script>

<style scoped>
.leaderboard-page {
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

/* 期数信息区域 */
.period-section {
  background: #fff;
  border-radius: 12px;
  padding: 24px;
  margin-bottom: 20px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
}

.period-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  padding-bottom: 16px;
  border-bottom: 1px solid #f0f0f0;
}

.period-title-area {
  display: flex;
  align-items: center;
  gap: 16px;
}

.period-icon {
  font-size: 40px;
}

.period-title-text {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.period-main-title {
  font-size: 20px;
  font-weight: 700;
  color: #1a1a2e;
}

.period-sub-title {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 14px;
  color: #8c8c8c;
}

.status-tag {
  font-size: 14px;
  padding: 8px 16px;
}

/* 统计卡片 */
.stats-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
}

@media (max-width: 1200px) {
  .stats-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 768px) {
  .stats-grid {
    grid-template-columns: 1fr;
  }
}

.stat-card {
  background: #f8f9fa;
  border-radius: 12px;
  padding: 20px;
  display: flex;
  align-items: center;
  gap: 16px;
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

.stat-card--signup::before { background: linear-gradient(180deg, #667eea 0%, #764ba2 100%); }
.stat-card--players::before { background: linear-gradient(180deg, #11998e 0%, #38ef7d 100%); }
.stat-card--room::before { background: linear-gradient(180deg, #f093fb 0%, #f5576c 100%); }
.stat-card--rank::before { background: linear-gradient(180deg, #ffd700 0%, #ffaa00 100%); }

.stat-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
}

.stat-card__icon {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
}

.stat-card--signup .stat-card__icon { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); }
.stat-card--players .stat-card__icon { background: linear-gradient(135deg, #11998e 0%, #38ef7d 100%); }
.stat-card--room .stat-card__icon { background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); }
.stat-card--rank .stat-card__icon { background: linear-gradient(135deg, #ffd700 0%, #ffaa00 100%); }

.room-icon {
  font-size: 24px;
}

.stat-card__value {
  font-size: 24px;
  font-weight: 700;
  color: #1a1a2e;
  line-height: 1.2;
}

.stat-card__label {
  font-size: 13px;
  color: #8c8c8c;
  margin-top: 4px;
}

/* 排行榜区域 */
.leaderboard-section {
  background: #fff;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  min-height: 400px;
}

.empty-state {
  padding: 60px 20px;
  text-align: center;
}

/* 前三名展示 */
.top-three-section {
  display: flex;
  justify-content: center;
  align-items: flex-end;
  gap: 24px;
  padding: 40px 20px 30px;
  background: linear-gradient(135deg, #fffbe6 0%, #fff7e6 50%, #fff 100%);
  border-radius: 12px;
  margin-bottom: 24px;
}

.top-player {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 20px;
  border-radius: 16px;
  background: #fff;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.08);
  position: relative;
  min-width: 160px;
}

.top-player.gold {
  transform: scale(1.1);
  background: linear-gradient(145deg, #fffbe6 0%, #fff 100%);
  border: 2px solid #ffd700;
}

.top-player.silver {
  background: linear-gradient(145deg, #f5f5f5 0%, #fff 100%);
  border: 2px solid #c0c0c0;
}

.top-player.bronze {
  background: linear-gradient(145deg, #fff5eb 0%, #fff 100%);
  border: 2px solid #cd7f32;
}

.top-player__crown {
  position: absolute;
  top: -20px;
  font-size: 32px;
}

.top-player__rank {
  font-size: 32px;
  margin-bottom: 8px;
}

.top-player__avatar {
  margin-bottom: 12px;
}

.top-player__avatar .el-avatar {
  border: 3px solid #e8e8e8;
}

.top-player.gold .el-avatar {
  border-color: #ffd700;
}

.top-player.silver .el-avatar {
  border-color: #c0c0c0;
}

.top-player.bronze .el-avatar {
  border-color: #cd7f32;
}

.top-player__name {
  font-size: 16px;
  font-weight: 600;
  color: #1a1a2e;
  margin-bottom: 4px;
  text-align: center;
}

.top-player__score {
  font-size: 18px;
  font-weight: 700;
  color: #fa8c16;
  margin-bottom: 8px;
}

.top-player__label {
  font-size: 12px;
  color: #8c8c8c;
  padding: 4px 12px;
  background: #f5f5f5;
  border-radius: 12px;
}

.top-player__label.champion {
  background: linear-gradient(135deg, #ffd700 0%, #ffaa00 100%);
  color: #7c5800;
  font-weight: 600;
}

/* 排名列表 */
.rank-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.rank-item {
  display: flex;
  align-items: center;
  padding: 16px 20px;
  background: #fafbfc;
  border-radius: 12px;
  transition: all 0.3s ease;
}

.rank-item:hover {
  background: #f0f7ff;
  transform: translateX(4px);
}

.rank-item.eliminated {
  opacity: 0.7;
}

.rank-item__rank {
  min-width: 60px;
}

.rank-number {
  font-size: 18px;
  font-weight: 700;
  color: #606266;
}

.rank-item__player {
  display: flex;
  align-items: center;
  gap: 12px;
  flex: 1;
  min-width: 200px;
}

.player-detail {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.player-name {
  font-size: 15px;
  font-weight: 600;
  color: #1a1a2e;
  display: flex;
  align-items: center;
  gap: 8px;
}

.champion-tag {
  margin-left: 0;
}

.player-id {
  font-size: 12px;
  color: #8c8c8c;
}

.rank-item__score {
  min-width: 120px;
  text-align: right;
}

.score-value {
  font-size: 18px;
  font-weight: 700;
  color: #fa8c16;
}

.score-unit {
  font-size: 12px;
  color: #8c8c8c;
  margin-left: 4px;
}

.rank-item__status {
  min-width: 80px;
  text-align: center;
}

.rank-item__round {
  min-width: 100px;
  text-align: center;
  font-size: 13px;
  color: #8c8c8c;
}

/* 无数据 */
.no-data {
  padding: 40px 20px;
  text-align: center;
}

/* 分页 */
.pagination-section {
  display: flex;
  justify-content: flex-end;
  padding: 20px 0 0;
  border-top: 1px solid #f0f0f0;
  margin-top: 16px;
}

/* 响应式 */
@media (max-width: 900px) {
  .top-three-section {
    flex-direction: column;
    align-items: center;
  }
  
  .top-player.gold {
    order: -1;
    transform: scale(1);
  }
  
  .rank-item {
    flex-wrap: wrap;
    gap: 12px;
  }
  
  .rank-item__rank {
    min-width: 50px;
  }
  
  .rank-item__player {
    min-width: 180px;
  }
  
  .rank-item__score {
    min-width: auto;
  }
  
  .rank-item__status,
  .rank-item__round {
    min-width: auto;
  }
}
</style>
