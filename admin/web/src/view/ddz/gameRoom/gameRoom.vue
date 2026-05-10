<template>
  <div>
    <div class="gva-search-box">
      <el-form ref="searchForm" :inline="true" :model="searchInfo">
        <el-form-item label="月份">
          <el-date-picker
            v-model="searchInfo.month"
            type="month"
            placeholder="选择月份"
            format="YYYY-MM"
            value-format="YYYYMM"
            clearable
          />
        </el-form-item>
        <el-form-item label="房间ID">
          <el-input v-model="searchInfo.roomId" placeholder="房间ID" />
        </el-form-item>
        <el-form-item label="房间名称">
          <el-input v-model="searchInfo.roomName" placeholder="房间名称" />
        </el-form-item>
        <el-form-item label="房间类型">
          <el-select v-model="searchInfo.roomType" placeholder="房间类型" clearable>
            <el-option label="新手场" :value="1" />
            <el-option label="普通场" :value="2" />
            <el-option label="高级场" :value="3" />
            <el-option label="富豪场" :value="4" />
            <el-option label="至尊场" :value="5" />
          </el-select>
        </el-form-item>
        <el-form-item label="房间分类">
          <el-select v-model="searchInfo.roomCategory" placeholder="房间分类" clearable>
            <el-option label="普通场" :value="1" />
            <el-option label="竞技场" :value="2" />
          </el-select>
        </el-form-item>
        <el-form-item label="房间状态">
          <el-select v-model="searchInfo.status" placeholder="房间状态" clearable>
            <el-option label="已关闭" :value="0" />
            <el-option label="等待中" :value="1" />
            <el-option label="游戏中" :value="2" />
            <el-option label="已结束" :value="3" />
          </el-select>
        </el-form-item>
        <el-form-item label="创建者ID">
          <el-input v-model="searchInfo.creatorId" placeholder="创建者ID" />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" icon="search" @click="onSubmit">查询</el-button>
          <el-button icon="refresh" @click="onReset">重置</el-button>
        </el-form-item>
      </el-form>
      <div class="search-tip">
        <el-tag type="info" size="small">默认查询当月数据，可通过月份筛选查看历史记录</el-tag>
      </div>
    </div>
    <div class="gva-table-box">
      <el-table :data="tableData" row-key="ID">
        <el-table-column align="center" label="ID" min-width="60" prop="ID" />
        <el-table-column align="center" label="房间ID" min-width="120" prop="roomId" show-overflow-tooltip />
        <el-table-column align="center" label="房间名称" min-width="100" prop="roomName" />
        <el-table-column align="center" label="房间类型" min-width="80">
          <template #default="scope">
            <el-tag>{{ scope.row.roomTypeName }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column align="center" label="房间分类" min-width="80">
          <template #default="scope">
            <el-tag :type="scope.row.roomCategory === 2 ? 'danger' : 'success'">
              {{ scope.row.roomCategory === 2 ? '竞技场' : '普通场' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column align="center" label="状态" min-width="80">
          <template #default="scope">
            <el-tag :type="getStatusType(scope.row.status)">
              {{ scope.row.statusText }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column align="center" label="玩家数" min-width="80">
          <template #default="scope">
            {{ scope.row.playerCount }}/{{ scope.row.maxPlayers }}
          </template>
        </el-table-column>
        <el-table-column align="center" label="创建者" min-width="100">
          <template #default="scope">
            <div>{{ scope.row.creatorName || scope.row.creatorId || '-' }}</div>
          </template>
        </el-table-column>
        <el-table-column align="center" label="底分/倍数" min-width="80">
          <template #default="scope">
            {{ scope.row.baseScore }}/{{ scope.row.multiplier }}
          </template>
        </el-table-column>
        <el-table-column align="center" label="当前游戏ID" min-width="120" prop="currentGameId" show-overflow-tooltip>
          <template #default="scope">
            {{ scope.row.currentGameId || '-' }}
          </template>
        </el-table-column>
        <el-table-column align="center" label="开始时间" min-width="150" prop="startedAt">
          <template #default="scope">
            {{ scope.row.startedAt || '-' }}
          </template>
        </el-table-column>
        <el-table-column align="center" label="创建时间" min-width="150" prop="createdAt" />
        <el-table-column align="center" label="操作" min-width="80" fixed="right">
          <template #default="scope">
            <el-button type="primary" link icon="view" @click="viewDetail(scope.row)">详情</el-button>
          </template>
        </el-table-column>
      </el-table>
      <div class="gva-pagination">
        <el-pagination
          :current-page="page"
          :page-size="pageSize"
          :page-sizes="[10, 30, 50, 100]"
          :total="total"
          layout="total, sizes, prev, pager, next, jumper"
          @current-change="handleCurrentChange"
          @size-change="handleSizeChange"
        />
      </div>
    </div>

    <!-- 详情对话框 -->
    <el-dialog v-model="detailDialog" title="房间详情" width="1100px" top="5vh">
      <el-tabs v-model="activeTab">
        <el-tab-pane label="房间信息" name="info">
          <el-descriptions :column="2" border>
            <el-descriptions-item label="房间ID">{{ currentRecord.roomId }}</el-descriptions-item>
            <el-descriptions-item label="房间名称">{{ currentRecord.roomName }}</el-descriptions-item>
            <el-descriptions-item label="房间类型">{{ currentRecord.roomTypeName }}</el-descriptions-item>
            <el-descriptions-item label="房间分类">
              <el-tag :type="currentRecord.roomCategory === 2 ? 'danger' : 'success'">
                {{ currentRecord.roomCategory === 2 ? '竞技场' : '普通场' }}
              </el-tag>
            </el-descriptions-item>
            <el-descriptions-item label="房间状态">
              <el-tag :type="getStatusType(currentRecord.status)">
                {{ currentRecord.statusText }}
              </el-tag>
            </el-descriptions-item>
            <el-descriptions-item label="玩家数">{{ currentRecord.playerCount }}/{{ currentRecord.maxPlayers }}</el-descriptions-item>
            <el-descriptions-item label="创建者">{{ currentRecord.creatorName || currentRecord.creatorId || '-' }}</el-descriptions-item>
            <el-descriptions-item label="底分">{{ currentRecord.baseScore }}</el-descriptions-item>
            <el-descriptions-item label="倍数">{{ currentRecord.multiplier }}</el-descriptions-item>
            <el-descriptions-item label="当前游戏ID">{{ currentRecord.currentGameId || '-' }}</el-descriptions-item>
            <el-descriptions-item label="开始时间">{{ currentRecord.startedAt || '-' }}</el-descriptions-item>
            <el-descriptions-item label="结束时间">{{ currentRecord.endedAt || '-' }}</el-descriptions-item>
            <el-descriptions-item label="创建时间">{{ currentRecord.createdAt }}</el-descriptions-item>
          </el-descriptions>

          <el-divider v-if="currentRecord.players && currentRecord.players.length > 0" content-position="left">房间玩家</el-divider>
          <el-table v-if="currentRecord.players && currentRecord.players.length > 0" :data="currentRecord.players" size="small">
            <el-table-column prop="seatIndex" label="座位" width="60" />
            <el-table-column prop="nickname" label="昵称" />
            <el-table-column prop="playerId" label="玩家ID" />
            <el-table-column label="准备状态">
              <template #default="scope">
                <el-tag :type="scope.row.isReady ? 'success' : 'info'">
                  {{ scope.row.isReady ? '已准备' : '未准备' }}
                </el-tag>
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>

        <!-- 活动日志Tab -->
        <el-tab-pane label="活动日志" name="logs">
          <div v-if="gameRecordsLoading" class="loading-container">
            <el-icon class="is-loading"><loading /></el-icon>
            <span>加载中...</span>
          </div>
          <div v-else-if="gameRecords.length === 0" class="empty-container">
            <el-empty description="暂无游戏记录" />
          </div>
          <div v-else>
            <div class="logs-header">
              <el-tag type="info">共 {{ gameRecordsTotal }} 局游戏</el-tag>
            </div>
            
            <!-- 游戏记录列表 -->
            <el-collapse v-model="expandedGames" accordion>
              <el-collapse-item
                v-for="(game, index) in gameRecords"
                :key="game.ID"
                :name="game.ID"
              >
                <template #title>
                  <div class="game-record-title">
                    <span class="game-index">第{{ gameRecordsTotal - ((gameRecordsPage - 1) * gameRecordsPageSize) - index }}局</span>
                    <span class="game-time">{{ game.startedAt }}</span>
                    <span class="game-players">
                      <el-tag size="small" type="danger">{{ game.landlordName || '地主' }}</el-tag>
                      <span> VS </span>
                      <el-tag size="small" type="success">{{ game.farmer1Name || '农民1' }}</el-tag>
                      <el-tag size="small" type="success">{{ game.farmer2Name || '农民2' }}</el-tag>
                    </span>
                    <span class="game-result">
                      <el-tag :type="game.result === 1 ? 'danger' : 'success'" size="small">
                        {{ game.resultText }}
                      </el-tag>
                    </span>
                    <span class="game-duration">时长: {{ game.durationText || game.gameDuration + '秒' }}</span>
                    <span class="game-bomb" v-if="game.bombCount > 0">
                      <el-tag type="warning" size="small">炸弹×{{ game.bombCount }}</el-tag>
                    </span>
                  </div>
                </template>
                
                <!-- 游戏详情内容 -->
                <div class="game-detail-content">
                  <!-- 基本信息 -->
                  <el-descriptions :column="4" size="small" border>
                    <el-descriptions-item label="游戏ID">{{ game.ID }}</el-descriptions-item>
                    <el-descriptions-item label="底分/倍数">{{ game.baseScore }}/{{ game.multiplier }}</el-descriptions-item>
                    <el-descriptions-item label="炸弹数">{{ game.bombCount }}</el-descriptions-item>
                    <el-descriptions-item label="春天">
                      <el-tag v-if="game.spring > 0" :type="game.spring === 1 ? 'danger' : 'success'" size="small">
                        {{ game.springText }}
                      </el-tag>
                      <span v-else>-</span>
                    </el-descriptions-item>
                  </el-descriptions>
                  
                  <!-- 输赢信息 -->
                  <el-divider content-position="left">输赢详情</el-divider>
                  <el-row :gutter="20">
                    <el-col :span="8">
                      <div class="player-result landlord">
                        <div class="player-name">{{ game.landlordName || '地主' }} (地主)</div>
                        <div class="player-score" :class="game.landlordWinGold >= 0 ? 'positive' : 'negative'">
                          金币: {{ game.landlordWinGold >= 0 ? '+' : '' }}{{ game.landlordWinGold }}
                        </div>
                        <div class="player-score" v-if="game.landlordWinArenaCoin" :class="game.landlordWinArenaCoin >= 0 ? 'positive' : 'negative'">
                          竞技币: {{ game.landlordWinArenaCoin >= 0 ? '+' : '' }}{{ game.landlordWinArenaCoin }}
                        </div>
                      </div>
                    </el-col>
                    <el-col :span="8">
                      <div class="player-result farmer">
                        <div class="player-name">{{ game.farmer1Name || '农民1' }}</div>
                        <div class="player-score" :class="game.farmer1WinGold >= 0 ? 'positive' : 'negative'">
                          金币: {{ game.farmer1WinGold >= 0 ? '+' : '' }}{{ game.farmer1WinGold }}
                        </div>
                        <div class="player-score" v-if="game.farmer1WinArenaCoin" :class="game.farmer1WinArenaCoin >= 0 ? 'positive' : 'negative'">
                          竞技币: {{ game.farmer1WinArenaCoin >= 0 ? '+' : '' }}{{ game.farmer1WinArenaCoin }}
                        </div>
                      </div>
                    </el-col>
                    <el-col :span="8">
                      <div class="player-result farmer">
                        <div class="player-name">{{ game.farmer2Name || '农民2' }}</div>
                        <div class="player-score" :class="game.farmer2WinGold >= 0 ? 'positive' : 'negative'">
                          金币: {{ game.farmer2WinGold >= 0 ? '+' : '' }}{{ game.farmer2WinGold }}
                        </div>
                        <div class="player-score" v-if="game.farmer2WinArenaCoin" :class="game.farmer2WinArenaCoin >= 0 ? 'positive' : 'negative'">
                          竞技币: {{ game.farmer2WinArenaCoin >= 0 ? '+' : '' }}{{ game.farmer2WinArenaCoin }}
                        </div>
                      </div>
                    </el-col>
                  </el-row>
                  
                  <!-- 详细日志Tab -->
                  <el-divider content-position="left">详细日志</el-divider>
                  <el-tabs type="border-card" size="small">
                    <el-tab-pane label="叫地主">
                      <el-table :data="game.bidLogs" size="small" v-if="game.bidLogs && game.bidLogs.length > 0">
                        <el-table-column prop="bidOrder" label="顺序" width="60" />
                        <el-table-column prop="playerName" label="玩家" width="120" />
                        <el-table-column label="操作" width="100">
                          <template #default="scope">
                            <el-tag :type="getBidTypeTag(scope.row.bidType)" size="small">
                              {{ scope.row.bidTypeText }}
                            </el-tag>
                          </template>
                        </el-table-column>
                        <el-table-column prop="bidScore" label="叫分" width="80" />
                        <el-table-column label="成为地主" width="100">
                          <template #default="scope">
                            <el-tag :type="scope.row.isSuccess ? 'success' : 'info'" size="small">
                              {{ scope.row.successText }}
                            </el-tag>
                          </template>
                        </el-table-column>
                      </el-table>
                      <el-empty v-else description="无叫地主记录" :image-size="60" />
                    </el-tab-pane>
                    <el-tab-pane label="发牌记录">
                      <el-table :data="game.dealLogs" size="small" v-if="game.dealLogs && game.dealLogs.length > 0">
                        <el-table-column prop="playerName" label="玩家" width="120" />
                        <el-table-column label="角色" width="80">
                          <template #default="scope">
                            <el-tag :type="scope.row.playerRole === 1 ? 'danger' : 'success'" size="small">
                              {{ scope.row.playerRoleText }}
                            </el-tag>
                          </template>
                        </el-table-column>
                        <el-table-column prop="cardsCount" label="牌数" width="60" />
                        <el-table-column prop="handCards" label="手牌" show-overflow-tooltip />
                        <el-table-column prop="landlordCards" label="底牌" width="80" />
                      </el-table>
                      <el-empty v-else description="无发牌记录" :image-size="60" />
                    </el-tab-pane>
                    <el-tab-pane label="出牌记录">
                      <el-table :data="game.playLogs" size="small" max-height="300" v-if="game.playLogs && game.playLogs.length > 0">
                        <el-table-column prop="roundNum" label="回合" width="60" />
                        <el-table-column prop="playerName" label="玩家" width="100" />
                        <el-table-column label="角色" width="70">
                          <template #default="scope">
                            <el-tag :type="scope.row.playerRole === 1 ? 'danger' : 'success'" size="small">
                              {{ scope.row.playerRoleText }}
                            </el-tag>
                          </template>
                        </el-table-column>
                        <el-table-column label="操作" width="90">
                          <template #default="scope">
                            <el-tag :type="scope.row.playType === 1 ? 'primary' : 'info'" size="small">
                              {{ scope.row.playTypeText }}
                            </el-tag>
                          </template>
                        </el-table-column>
                        <el-table-column prop="cards" label="出的牌" show-overflow-tooltip />
                        <el-table-column prop="cardPattern" label="牌型" width="80" />
                        <el-table-column label="特殊" width="80">
                          <template #default="scope">
                            <el-tag v-if="scope.row.isRocket" type="danger" size="small">火箭</el-tag>
                            <el-tag v-else-if="scope.row.isBomb" type="warning" size="small">炸弹</el-tag>
                            <span v-else>-</span>
                          </template>
                        </el-table-column>
                      </el-table>
                      <el-empty v-else description="无出牌记录" :image-size="60" />
                    </el-tab-pane>
                  </el-tabs>
                </div>
              </el-collapse-item>
            </el-collapse>
            
            <!-- 分页 -->
            <div class="gva-pagination" style="margin-top: 15px;">
              <el-pagination
                :current-page="gameRecordsPage"
                :page-size="gameRecordsPageSize"
                :page-sizes="[5, 10, 20]"
                :total="gameRecordsTotal"
                layout="total, sizes, prev, pager, next"
                @current-change="handleGameRecordsPageChange"
                @size-change="handleGameRecordsSizeChange"
              />
            </div>
          </div>
        </el-tab-pane>
      </el-tabs>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { getRoomList, getRoomDetail, getRoomGameRecords } from '@/api/ddz/gameLog'
import { Loading } from '@element-plus/icons-vue'

defineOptions({
  name: 'DDZGameRoom'
})

const searchInfo = ref({
  month: '',
  roomId: '',
  roomName: '',
  roomType: null,
  roomCategory: null,
  status: null,
  creatorId: ''
})

const page = ref(1)
const total = ref(0)
const pageSize = ref(10)
const tableData = ref([])

const detailDialog = ref(false)
const activeTab = ref('info')
const currentRecord = ref({})

// 游戏记录相关
const gameRecords = ref([])
const gameRecordsTotal = ref(0)
const gameRecordsPage = ref(1)
const gameRecordsPageSize = ref(5)
const gameRecordsLoading = ref(false)
const expandedGames = ref([])

const getStatusType = (status) => {
  switch (status) {
    case 1:
      return 'warning'
    case 2:
      return 'success'
    case 3:
      return 'info'
    default:
      return ''
  }
}

const getBidTypeTag = (type) => {
  const map = { 0: 'info', 1: 'primary', 2: 'warning' }
  return map[type] || 'info'
}

const onSubmit = () => {
  page.value = 1
  getTableData()
}

const onReset = () => {
  searchInfo.value = {
    month: '',
    roomId: '',
    roomName: '',
    roomType: null,
    roomCategory: null,
    status: null,
    creatorId: ''
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
  const res = await getRoomList({
    page: page.value,
    pageSize: pageSize.value,
    ...searchInfo.value
  })
  if (res.code === 0) {
    tableData.value = res.data.list
    total.value = res.data.total
  }
}

const viewDetail = async (row) => {
  // 获取房间详情
  const res = await getRoomDetail(row.ID)
  if (res.code === 0) {
    currentRecord.value = res.data
    detailDialog.value = true
    activeTab.value = 'info'
    
    // 重置游戏记录
    gameRecords.value = []
    gameRecordsTotal.value = 0
    gameRecordsPage.value = 1
    expandedGames.value = []
    
    // 自动加载游戏记录
    loadGameRecords()
  }
}

const loadGameRecords = async () => {
  if (!currentRecord.value.roomId) return
  
  gameRecordsLoading.value = true
  try {
    const res = await getRoomGameRecords({
      roomCode: currentRecord.value.roomId,
      page: gameRecordsPage.value,
      pageSize: gameRecordsPageSize.value,
      month: searchInfo.value.month
    })
    if (res.code === 0) {
      gameRecords.value = res.data.gameRecords || []
      gameRecordsTotal.value = res.data.total || 0
    }
  } finally {
    gameRecordsLoading.value = false
  }
}

const handleGameRecordsPageChange = (val) => {
  gameRecordsPage.value = val
  loadGameRecords()
}

const handleGameRecordsSizeChange = (val) => {
  gameRecordsPageSize.value = val
  gameRecordsPage.value = 1
  loadGameRecords()
}

getTableData()
</script>

<style scoped>
.loading-container {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 40px;
  color: #909399;
}

.loading-container .el-icon {
  margin-right: 8px;
  font-size: 20px;
}

.empty-container {
  padding: 20px;
}

.logs-header {
  margin-bottom: 15px;
  padding: 10px;
  background: #f5f7fa;
  border-radius: 4px;
}

.game-record-title {
  display: flex;
  align-items: center;
  gap: 15px;
  width: 100%;
  padding: 5px 0;
}

.game-index {
  font-weight: bold;
  color: #409eff;
  min-width: 60px;
}

.game-time {
  color: #909399;
  font-size: 13px;
  min-width: 150px;
}

.game-players {
  display: flex;
  align-items: center;
  gap: 5px;
}

.game-result {
  min-width: 60px;
}

.game-duration {
  color: #606266;
  font-size: 13px;
}

.game-bomb {
  margin-left: auto;
}

.game-detail-content {
  padding: 15px;
  background: #fafafa;
  border-radius: 4px;
}

.player-result {
  padding: 15px;
  background: #fff;
  border-radius: 4px;
  text-align: center;
  border: 1px solid #ebeef5;
}

.player-result.landlord {
  border-left: 3px solid #f56c6c;
}

.player-result.farmer {
  border-left: 3px solid #67c23a;
}

.player-name {
  font-weight: bold;
  margin-bottom: 8px;
  color: #303133;
}

.player-score {
  font-size: 14px;
  margin-top: 5px;
}

.player-score.positive {
  color: #67c23a;
}

.player-score.negative {
  color: #f56c6c;
}
</style>
