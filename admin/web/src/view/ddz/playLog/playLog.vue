<template>
  <div class="play-log-page">
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
        <el-form-item label="出牌类型">
          <el-select v-model="searchInfo.playType" placeholder="全部" clearable style="width: 140px">
            <el-option label="出牌" :value="1" />
            <el-option label="不出/过" :value="2" />
            <el-option label="超时自动出牌" :value="3" />
          </el-select>
        </el-form-item>
        <el-form-item label="牌型">
          <el-input 
            v-model="searchInfo.cardPattern" 
            placeholder="牌型" 
            clearable 
            style="width: 120px" 
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
        <div class="stat-card stat-card--rounds">
          <div class="stat-card__icon">
            <el-icon :size="28"><RefreshRight /></el-icon>
          </div>
          <div class="stat-card__content">
            <div class="stat-card__value">{{ overviewStats.totalRounds }}</div>
            <div class="stat-card__label">总回合数</div>
          </div>
        </div>
      </div>
      <div class="stat-card-wrapper">
        <div class="stat-card stat-card--bombs">
          <div class="stat-card__icon">
            <span class="bomb-emoji">💣</span>
          </div>
          <div class="stat-card__content">
            <div class="stat-card__value">{{ overviewStats.totalBombs }}</div>
            <div class="stat-card__label">炸弹数</div>
          </div>
        </div>
      </div>
      <div class="stat-card-wrapper">
        <div class="stat-card stat-card--rockets">
          <div class="stat-card__icon">
            <span class="rocket-emoji">🚀</span>
          </div>
          <div class="stat-card__content">
            <div class="stat-card__value">{{ overviewStats.totalRockets }}</div>
            <div class="stat-card__label">火箭数</div>
          </div>
        </div>
      </div>
    </div>

    <!-- 游戏列表 -->
    <div class="game-list-section">
      <div v-if="groupedGames.length === 0" class="empty-state">
        <el-empty description="暂无出牌记录" />
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
            <div class="game-stats">
              <el-tag size="small" type="info">{{ game.rounds.length }}回合</el-tag>
              <el-tag v-if="game.totalBombs > 0" size="small" type="warning">💣{{ game.totalBombs }}</el-tag>
              <el-tag v-if="game.totalRockets > 0" size="small" type="danger">🚀{{ game.totalRockets }}</el-tag>
            </div>
            <div class="game-time">
              <el-icon><Clock /></el-icon>
              {{ game.records[0]?.createdAt || '-' }}
            </div>
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
            <!-- 回合列表 -->
            <div 
              v-for="round in game.rounds" 
              :key="round.roundNum" 
              class="round-section"
            >
              <div class="round-header">
                <span class="round-num">第{{ round.roundNum }}回合</span>
                <span class="round-info">共{{ round.plays.length }}次出牌</span>
              </div>
              
              <div class="plays-list">
                <div 
                  v-for="play in round.plays" 
                  :key="play.ID" 
                  class="play-item"
                  :class="{
                    'play-item--pass': play.playType === 2,
                    'play-item--timeout': play.playType === 3,
                    'play-item--bomb': play.isBomb === 1,
                    'play-item--rocket': play.isRocket === 1
                  }"
                >
                  <!-- 玩家信息 -->
                  <div class="play-player">
                    <div class="player-avatar-area">
                      <el-avatar 
                        v-if="play.playerAvatar" 
                        :size="36" 
                        :src="getUrl(play.playerAvatar)"
                        class="player-avatar"
                      />
                      <el-avatar v-else :size="36" class="player-avatar avatar-default">
                        {{ (play.playerName || '?').substring(0, 1) }}
                      </el-avatar>
                      <span class="role-badge" :class="play.playerRole === 1 ? 'landlord' : 'farmer'">
                        {{ play.playerRole === 1 ? '👑' : '🌾' }}
                      </span>
                    </div>
                    <div class="player-info">
                      <div class="player-name">{{ play.playerName || '未知玩家' }}</div>
                      <div class="player-id">ID: {{ play.playerId }}</div>
                    </div>
                  </div>
                  
                  <!-- 出牌内容 -->
                  <div class="play-content">
                    <div class="play-order">顺序: {{ play.playOrder }}</div>
                    
                    <!-- 出牌类型标签 -->
                    <div class="play-type">
                      <el-tag 
                        v-if="play.playType === 2" 
                        size="small" 
                        type="info"
                      >不出</el-tag>
                      <el-tag 
                        v-else-if="play.playType === 3" 
                        size="small" 
                        type="warning"
                      >超时自动出牌</el-tag>
                    </div>
                    
                    <!-- 出的牌 -->
                    <div v-if="play.cards && play.playType !== 2" class="cards-area">
                      <div class="cards-info">
                        <span class="cards-count">{{ play.cardsCount }}张</span>
                        <span v-if="play.cardPattern" class="card-pattern">{{ play.cardPattern }}</span>
                        <el-tag v-if="play.isBomb === 1" size="small" type="warning">💣炸弹</el-tag>
                        <el-tag v-if="play.isRocket === 1" size="small" type="danger">🚀火箭</el-tag>
                      </div>
                      <div class="cards-display">
                        <span 
                          v-for="(card, idx) in parseCards(play.cards)" 
                          :key="idx"
                          class="card-item"
                          :class="getCardClass(card)"
                        >
                          {{ formatCard(card) }}
                        </span>
                      </div>
                    </div>
                    
                    <!-- 不出 -->
                    <div v-else-if="play.playType === 2" class="pass-text">
                      <el-icon><Close /></el-icon>
                      不出
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
import { getPlayLogList } from '@/api/ddz/gameLog'
import { 
  Search, Refresh, User, Tickets, RefreshRight, 
  Clock, CopyDocument, ArrowDown, Close
} from '@element-plus/icons-vue'
import { getUrl } from '@/utils/image'
import { ElMessage } from 'element-plus'

defineOptions({
  name: 'DDZPlayLog'
})

const searchInfo = ref({
  gameId: '',
  playerId: '',
  playType: null,
  cardPattern: ''
})

const page = ref(1)
const total = ref(0)
const pageSize = ref(10)
const tableData = ref([])
const expandedGames = ref([])

// 按游戏ID和回合分组
const groupedGames = computed(() => {
  const groups = {}
  
  tableData.value.forEach(record => {
    if (!groups[record.gameId]) {
      groups[record.gameId] = {
        gameId: record.gameId,
        records: [],
        rounds: [],
        totalBombs: 0,
        totalRockets: 0
      }
    }
    groups[record.gameId].records.push(record)
    groups[record.gameId].totalBombs += record.isBomb || 0
    groups[record.gameId].totalRockets += record.isRocket || 0
  })
  
  // 为每个游戏按回合分组
  Object.values(groups).forEach(game => {
    const roundMap = {}
    game.records.forEach(record => {
      const roundNum = record.roundNum || 1
      if (!roundMap[roundNum]) {
        roundMap[roundNum] = {
          roundNum,
          plays: []
        }
      }
      roundMap[roundNum].plays.push(record)
    })
    
    // 按回合数排序，每个回合内按出牌顺序排序
    game.rounds = Object.values(roundMap).sort((a, b) => a.roundNum - b.roundNum)
    game.rounds.forEach(round => {
      round.plays.sort((a, b) => a.playOrder - b.playOrder)
    })
  })
  
  return Object.values(groups)
})

// 计算概览统计
const overviewStats = computed(() => {
  const records = tableData.value
  if (!records.length) {
    return { totalRounds: 0, totalBombs: 0, totalRockets: 0, gameCount: 0 }
  }
  
  const gameIds = new Set(records.map(r => r.gameId))
  const rounds = new Set(records.map(r => `${r.gameId}-${r.roundNum}`))
  const totalBombs = records.reduce((sum, r) => sum + (r.isBomb || 0), 0)
  const totalRockets = records.reduce((sum, r) => sum + (r.isRocket || 0), 0)
  
  return {
    totalRounds: rounds.size,
    totalBombs,
    totalRockets,
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
    playerId: '',
    playType: null,
    cardPattern: ''
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
  const res = await getPlayLogList({
    page: page.value,
    pageSize: pageSize.value * 20, // 获取更多数据以分组
    ...searchInfo.value
  })
  if (res.code === 0) {
    tableData.value = res.data.list
    total.value = Math.ceil(res.data.total / 20) // 估算游戏数
    // 默认展开第一个
    if (groupedGames.value.length > 0 && expandedGames.value.length === 0) {
      expandedGames.value.push(groupedGames.value[0].gameId)
    }
  }
}

getTableData()
</script>

<style scoped>
.play-log-page {
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
.stat-card--rounds::before { background: linear-gradient(180deg, #667eea 0%, #764ba2 100%); }
.stat-card--bombs::before { background: linear-gradient(180deg, #f093fb 0%, #f5576c 100%); }
.stat-card--rockets::before { background: linear-gradient(180deg, #4facfe 0%, #00f2fe 100%); }

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
.stat-card--rounds .stat-card__icon { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); }
.stat-card--bombs .stat-card__icon { background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); }
.stat-card--rockets .stat-card__icon { background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%); }

.bomb-emoji, .rocket-emoji { font-size: 28px; }

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
  flex-wrap: wrap;
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

.game-stats {
  display: flex;
  gap: 8px;
}

.game-time {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  color: #8c8c8c;
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

/* 回合区域 */
.round-section {
  margin-bottom: 20px;
  background: #fff;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
}

.round-section:last-child {
  margin-bottom: 0;
}

.round-header {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  background: linear-gradient(135deg, #e6f7ff 0%, #f0faff 100%);
  border-bottom: 1px solid #e8e8e8;
}

.round-num {
  font-size: 15px;
  font-weight: 600;
  color: #1890ff;
}

.round-info {
  font-size: 13px;
  color: #8c8c8c;
}

/* 出牌列表 */
.plays-list {
  padding: 12px;
}

.play-item {
  display: flex;
  align-items: flex-start;
  gap: 16px;
  padding: 12px;
  margin-bottom: 8px;
  background: #fafafa;
  border-radius: 8px;
  border-left: 3px solid #e8e8e8;
  transition: all 0.2s ease;
}

.play-item:last-child {
  margin-bottom: 0;
}

.play-item:hover {
  background: #f0f0f0;
}

.play-item--pass {
  border-left-color: #8c8c8c;
  opacity: 0.7;
}

.play-item--timeout {
  border-left-color: #faad14;
  background: #fffbe6;
}

.play-item--bomb {
  border-left-color: #ff4d4f;
  background: #fff1f0;
}

.play-item--rocket {
  border-left-color: #722ed1;
  background: #f9f0ff;
}

/* 玩家信息 */
.play-player {
  display: flex;
  align-items: center;
  gap: 10px;
  min-width: 140px;
}

.player-avatar-area {
  position: relative;
}

.player-avatar {
  border: 2px solid #e8e8e8;
}

.avatar-default {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: #fff;
  font-weight: 600;
}

.role-badge {
  position: absolute;
  bottom: -4px;
  right: -4px;
  font-size: 12px;
}

.player-info {
  flex: 1;
  min-width: 0;
}

.player-name {
  font-size: 14px;
  font-weight: 600;
  color: #1a1a2e;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.player-id {
  font-size: 12px;
  color: #8c8c8c;
}

/* 出牌内容 */
.play-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.play-order {
  font-size: 12px;
  color: #8c8c8c;
}

.play-type {
  display: inline-flex;
}

/* 扑克牌区域 */
.cards-area {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.cards-info {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}

.cards-count {
  font-size: 12px;
  color: #595959;
  background: #f0f0f0;
  padding: 2px 8px;
  border-radius: 4px;
}

.card-pattern {
  font-size: 12px;
  color: #1890ff;
  font-weight: 500;
}

.cards-display {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
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

.pass-text {
  display: flex;
  align-items: center;
  gap: 6px;
  color: #8c8c8c;
  font-size: 14px;
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
