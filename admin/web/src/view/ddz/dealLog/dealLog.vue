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
            style="width: 220px" 
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
        <el-form-item>
          <el-button type="primary" :icon="Search" @click="onSubmit">查询</el-button>
          <el-button :icon="Refresh" @click="onReset">重置</el-button>
        </el-form-item>
      </el-form>
    </div>

    <!-- 统计概览卡片 -->
    <div class="overview-section">
      <div class="stat-card-wrapper">
        <div class="stat-card stat-card--games">
          <div class="stat-card__icon">
            <el-icon :size="28"><Tickets /></el-icon>
          </div>
          <div class="stat-card__content">
            <div class="stat-card__value">{{ overviewStats.gameCount }}</div>
            <div class="stat-card__label">游戏局数</div>
          </div>
        </div>
      </div>
      <div class="stat-card-wrapper">
        <div class="stat-card stat-card--records">
          <div class="stat-card__icon">
            <el-icon :size="28"><Document /></el-icon>
          </div>
          <div class="stat-card__content">
            <div class="stat-card__value">{{ overviewStats.totalRecords }}</div>
            <div class="stat-card__label">发牌记录</div>
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
            <div class="stat-card__label">地主次数</div>
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
            <div class="stat-card__label">农民次数</div>
          </div>
        </div>
      </div>
    </div>

    <!-- 游戏列表 -->
    <div class="game-list-section">
      <div v-if="groupedGames.length === 0" class="empty-state">
        <el-empty description="暂无发牌记录" />
      </div>
      
      <div v-for="(game, index) in groupedGames" :key="game.gameId" class="game-card">
        <!-- 游戏头部 -->
        <div class="game-header" @click="toggleGame(game.gameId)">
          <div class="game-info">
            <div class="game-number">#{{ (page - 1) * pageSize + index + 1 }}</div>
            <div class="game-id">
              <el-tooltip :content="game.gameId" placement="top">
                <span>游戏ID: {{ formatGameId(game.gameId) }}</span>
              </el-tooltip>
              <el-button 
                type="primary" 
                link 
                size="small" 
                :icon="CopyDocument"
                @click.stop="copyGameId(game.gameId)"
                class="copy-btn"
              />
            </div>
            <div class="game-time">
              <el-icon><Clock /></el-icon>
              {{ game.records[0]?.createdAt || '-' }}
            </div>
          </div>
          <div class="game-players">
            <template v-for="record in game.records" :key="record.ID">
              <div class="player-mini-card" :class="record.playerRole === 1 ? 'landlord' : 'farmer'">
                <el-avatar 
                  v-if="record.playerAvatar" 
                  :size="32" 
                  :src="getUrl(record.playerAvatar)"
                />
                <el-avatar v-else :size="32" class="avatar-default">
                  {{ (record.playerName || '?').substring(0, 1) }}
                </el-avatar>
                <span class="player-mini-role">{{ record.playerRole === 1 ? '👑' : '🌾' }}</span>
              </div>
            </template>
          </div>
          <div class="game-expand">
            <el-icon :class="{ 'is-expanded': expandedGames.includes(game.gameId) }">
              <ArrowDown />
            </el-icon>
          </div>
        </div>

        <!-- 游戏详情 -->
        <el-collapse-transition>
          <div v-show="expandedGames.includes(game.gameId)" class="game-detail">
            <!-- 地主区域 -->
            <div class="player-section landlord-section" v-if="game.landlord">
              <div class="player-header">
                <div class="player-avatar-area">
                  <el-avatar 
                    v-if="game.landlord.playerAvatar" 
                    :size="48" 
                    :src="getUrl(game.landlord.playerAvatar)"
                    class="player-avatar"
                  />
                  <el-avatar v-else :size="48" class="player-avatar avatar-default">
                    {{ (game.landlord.playerName || '?').substring(0, 1) }}
                  </el-avatar>
                  <span class="role-badge landlord">👑 地主</span>
                </div>
                <div class="player-info">
                  <div class="player-name">{{ game.landlord.playerName || '未知玩家' }}</div>
                  <div class="player-id">ID: {{ game.landlord.playerId }}</div>
                </div>
              </div>
              
              <div class="cards-area">
                <div class="cards-row">
                  <div class="cards-label">手牌 ({{ game.landlord.cardsCount || 20 }}张)</div>
                  <div class="cards-display">
                    <span 
                      v-for="(card, idx) in parseCards(game.landlord.handCards)" 
                      :key="idx"
                      class="card-item"
                      :class="getCardClass(card)"
                    >
                      {{ formatCard(card) }}
                    </span>
                  </div>
                </div>
                <div class="cards-row landlord-cards-row" v-if="game.landlord.landlordCards">
                  <div class="cards-label highlight">底牌 ({{ parseCards(game.landlord.landlordCards).length }}张)</div>
                  <div class="cards-display landlord-cards">
                    <span 
                      v-for="(card, idx) in parseCards(game.landlord.landlordCards)" 
                      :key="idx"
                      class="card-item"
                      :class="getCardClass(card)"
                    >
                      {{ formatCard(card) }}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <!-- 农民区域 -->
            <div class="farmers-section">
              <div 
                v-for="farmer in game.farmers" 
                :key="farmer.ID" 
                class="player-section farmer-section"
              >
                <div class="player-header">
                  <div class="player-avatar-area">
                    <el-avatar 
                      v-if="farmer.playerAvatar" 
                      :size="48" 
                      :src="getUrl(farmer.playerAvatar)"
                      class="player-avatar"
                    />
                    <el-avatar v-else :size="48" class="player-avatar avatar-default">
                      {{ (farmer.playerName || '?').substring(0, 1) }}
                    </el-avatar>
                    <span class="role-badge farmer">🌾 农民</span>
                  </div>
                  <div class="player-info">
                    <div class="player-name">{{ farmer.playerName || '未知玩家' }}</div>
                    <div class="player-id">ID: {{ farmer.playerId }}</div>
                  </div>
                </div>
                
                <div class="cards-area">
                  <div class="cards-row">
                    <div class="cards-label">手牌 ({{ farmer.cardsCount || 17 }}张)</div>
                    <div class="cards-display">
                      <span 
                        v-for="(card, idx) in parseCards(farmer.handCards)" 
                        :key="idx"
                        class="card-item"
                        :class="getCardClass(card)"
                      >
                        {{ formatCard(card) }}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </el-collapse-transition>
      </div>
    </div>

    <!-- 分页 -->
    <div class="pagination-section" v-if="total > 0">
      <el-pagination
        :current-page="page"
        :page-size="pageSize"
        :page-sizes="[10, 20, 50]"
        :total="total"
        layout="total, sizes, prev, pager, next, jumper"
        @current-change="handleCurrentChange"
        @size-change="handleSizeChange"
        background
      />
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { getDealLogList } from '@/api/ddz/gameLog'
import { 
  Search, Refresh, User, Tickets, Document, Grid, 
  Clock, CopyDocument, ArrowDown 
} from '@element-plus/icons-vue'
import { getUrl } from '@/utils/image'
import { ElMessage } from 'element-plus'

defineOptions({
  name: 'DDZDealLog'
})

const searchInfo = ref({
  gameId: '',
  playerId: ''
})

const page = ref(1)
const total = ref(0)
const pageSize = ref(10)
const tableData = ref([])
const expandedGames = ref([])

// 按游戏ID分组
const groupedGames = computed(() => {
  const groups = {}
  
  tableData.value.forEach(record => {
    if (!groups[record.gameId]) {
      groups[record.gameId] = {
        gameId: record.gameId,
        records: [],
        landlord: null,
        farmers: []
      }
    }
    groups[record.gameId].records.push(record)
    
    if (record.playerRole === 1) {
      groups[record.gameId].landlord = record
    } else {
      groups[record.gameId].farmers.push(record)
    }
  })
  
  return Object.values(groups)
})

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
    '27': '小', '28': '大',
    '1': 'A', '2': '2', '3': '3', '4': '4', '5': '5', '6': '6', '7': '7',
    '8': '8', '9': '9', '10': '10', '11': 'J', '12': 'Q', '13': 'K'
  }
  const value = card.replace(/^[shdc]/i, '')
  return cardMap[value] || value
}

// 获取牌的样式类
const getCardClass = (card) => {
  if (!card) return ''
  if (card === '27' || card.toLowerCase().includes('joker1')) return 'card-joker-small'
  if (card === '28' || card.toLowerCase().includes('joker2')) return 'card-joker-big'
  if (card.startsWith('h') || card.startsWith('d') || card.startsWith('H') || card.startsWith('D')) {
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

const toggleGame = (gameId) => {
  const index = expandedGames.value.indexOf(gameId)
  if (index > -1) {
    expandedGames.value.splice(index, 1)
  } else {
    expandedGames.value.push(gameId)
  }
}

const onSubmit = () => {
  page.value = 1
  getTableData()
}

const onReset = () => {
  searchInfo.value = {
    gameId: '',
    playerId: ''
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
  const res = await getDealLogList({
    page: page.value,
    pageSize: pageSize.value * 3, // 获取3倍数据以分组
    ...searchInfo.value
  })
  if (res.code === 0) {
    tableData.value = res.data.list
    total.value = Math.ceil(res.data.total / 3) // 按3人一局计算
    // 默认展开第一个
    if (groupedGames.value.length > 0 && expandedGames.value.length === 0) {
      expandedGames.value.push(groupedGames.value[0].gameId)
    }
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

.stat-card--games::before { background: linear-gradient(180deg, #11998e 0%, #38ef7d 100%); }
.stat-card--records::before { background: linear-gradient(180deg, #667eea 0%, #764ba2 100%); }
.stat-card--landlord::before { background: linear-gradient(180deg, #f093fb 0%, #f5576c 100%); }
.stat-card--farmer::before { background: linear-gradient(180deg, #4facfe 0%, #00f2fe 100%); }

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

.stat-card--games .stat-card__icon { background: linear-gradient(135deg, #11998e 0%, #38ef7d 100%); }
.stat-card--records .stat-card__icon { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); }
.stat-card--landlord .stat-card__icon { background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); }
.stat-card--farmer .stat-card__icon { background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%); }

.role-emoji { font-size: 28px; }

.stat-card__content { flex: 1; }
.stat-card__value { font-size: 28px; font-weight: 700; color: #1a1a2e; line-height: 1.2; }
.stat-card__label { font-size: 14px; color: #8c8c8c; margin-top: 4px; }

/* 游戏列表 */
.game-list-section {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.empty-state {
  background: #fff;
  border-radius: 12px;
  padding: 60px 20px;
  text-align: center;
}

.game-card {
  background: #fff;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  transition: all 0.3s ease;
}

.game-card:hover {
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.1);
}

.game-header {
  display: flex;
  align-items: center;
  padding: 16px 20px;
  cursor: pointer;
  background: linear-gradient(135deg, #f6f8fc 0%, #fff 100%);
  border-bottom: 1px solid #f0f0f0;
}

.game-header:hover {
  background: linear-gradient(135deg, #e6f7ff 0%, #f0faff 100%);
}

.game-info {
  display: flex;
  align-items: center;
  gap: 16px;
  flex: 1;
}

.game-number {
  font-size: 16px;
  font-weight: 700;
  color: #1890ff;
  min-width: 50px;
}

.game-id {
  display: flex;
  align-items: center;
  gap: 8px;
  font-family: 'Monaco', 'Consolas', monospace;
  font-size: 13px;
  color: #595959;
  background: #f5f5f5;
  padding: 6px 12px;
  border-radius: 6px;
}

.copy-btn { opacity: 0.6; }
.copy-btn:hover { opacity: 1; }

.game-time {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  color: #8c8c8c;
}

.game-players {
  display: flex;
  gap: 8px;
  margin: 0 20px;
}

.player-mini-card {
  position: relative;
}

.player-mini-card.landlord .avatar-default {
  background: linear-gradient(135deg, #ffd700 0%, #ffaa00 100%);
  color: #7c5800;
}

.player-mini-card.farmer .avatar-default {
  background: linear-gradient(135deg, #43e97b 0%, #38f9d7 100%);
  color: #fff;
}

.player-mini-role {
  position: absolute;
  bottom: -4px;
  right: -4px;
  font-size: 12px;
}

.game-expand {
  color: #8c8c8c;
  transition: transform 0.3s ease;
}

.game-expand .is-expanded {
  transform: rotate(180deg);
}

/* 游戏详情 */
.game-detail {
  padding: 20px;
  background: #fafbfc;
}

.player-section {
  background: #fff;
  border-radius: 12px;
  padding: 20px;
  margin-bottom: 16px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
}

.player-section:last-child {
  margin-bottom: 0;
}

.landlord-section {
  border-left: 4px solid #ffd700;
  background: linear-gradient(135deg, #fffbe6 0%, #fff 100%);
}

.farmer-section {
  border-left: 4px solid #52c41a;
}

.farmers-section {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;
  margin-top: 16px;
}

@media (max-width: 768px) {
  .farmers-section {
    grid-template-columns: 1fr;
  }
}

.player-header {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 16px;
}

.player-avatar-area {
  position: relative;
}

.player-avatar {
  border: 3px solid #e8e8e8;
}

.avatar-default {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: #fff;
  font-weight: 600;
}

.role-badge {
  position: absolute;
  bottom: -8px;
  left: 50%;
  transform: translateX(-50%);
  font-size: 11px;
  font-weight: 600;
  padding: 2px 8px;
  border-radius: 10px;
  white-space: nowrap;
}

.role-badge.landlord {
  background: linear-gradient(135deg, #ffd700 0%, #ffaa00 100%);
  color: #7c5800;
}

.role-badge.farmer {
  background: linear-gradient(135deg, #43e97b 0%, #38f9d7 100%);
  color: #fff;
}

.player-info {
  flex: 1;
}

.player-name {
  font-size: 16px;
  font-weight: 600;
  color: #1a1a2e;
  margin-bottom: 4px;
}

.player-id {
  font-size: 13px;
  color: #8c8c8c;
}

/* 扑克牌区域 */
.cards-area {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.cards-row {
  display: flex;
  align-items: flex-start;
  gap: 12px;
}

.cards-label {
  font-size: 13px;
  color: #8c8c8c;
  min-width: 70px;
  padding-top: 8px;
}

.cards-label.highlight {
  color: #fa8c16;
  font-weight: 600;
}

.cards-display {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
}

.landlord-cards {
  background: linear-gradient(135deg, #fff7e6 0%, #fffbe6 100%);
  padding: 8px;
  border-radius: 8px;
}

.card-item {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 26px;
  height: 36px;
  padding: 0 6px;
  background: linear-gradient(145deg, #fff 0%, #f5f5f5 100%);
  border: 1px solid #d9d9d9;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 600;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.08);
}

.card-item.card-red { color: #ff4d4f; }
.card-item.card-black { color: #262626; }
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

/* 分页区域 */
.pagination-section {
  display: flex;
  justify-content: flex-end;
  padding: 20px 0;
  background: #fff;
  border-radius: 12px;
  padding: 16px 20px;
  margin-top: 16px;
}
</style>
