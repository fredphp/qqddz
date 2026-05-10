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
        <el-form-item label="游戏ID">
          <el-input v-model="searchInfo.gameId" placeholder="游戏ID" />
        </el-form-item>
        <el-form-item label="房间ID">
          <el-input v-model="searchInfo.roomId" placeholder="房间ID" />
        </el-form-item>
        <el-form-item label="房间类型">
          <el-select v-model="searchInfo.roomType" placeholder="房间类型" clearable>
            <el-option label="初级场" :value="2" />
            <el-option label="中级场" :value="3" />
            <el-option label="高级场" :value="4" />
            <el-option label="大师场" :value="5" />
            <el-option label="至尊场" :value="6" />
          </el-select>
        </el-form-item>
        <el-form-item label="房间分类">
          <el-select v-model="searchInfo.roomCategory" placeholder="房间分类" clearable>
            <el-option label="普通场" :value="1" />
            <el-option label="竞技场" :value="2" />
          </el-select>
        </el-form-item>
        <el-form-item label="游戏结果">
          <el-select v-model="searchInfo.result" placeholder="游戏结果" clearable>
            <el-option label="地主胜" :value="1" />
            <el-option label="农民胜" :value="2" />
          </el-select>
        </el-form-item>
        <el-form-item label="玩家ID">
          <el-input v-model="searchInfo.playerId" placeholder="玩家ID" />
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
        <el-table-column align="center" label="游戏ID" min-width="120" prop="gameId" show-overflow-tooltip />
        <el-table-column align="center" label="房间ID" min-width="120" prop="roomId" show-overflow-tooltip />
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
        <el-table-column align="center" label="地主" min-width="100">
          <template #default="scope">
            <div>{{ scope.row.landlordName || scope.row.landlordId }}</div>
          </template>
        </el-table-column>
        <el-table-column align="center" label="农民1" min-width="100">
          <template #default="scope">
            <div>{{ scope.row.farmer1Name || scope.row.farmer1Id }}</div>
          </template>
        </el-table-column>
        <el-table-column align="center" label="农民2" min-width="100">
          <template #default="scope">
            <div>{{ scope.row.farmer2Name || scope.row.farmer2Id }}</div>
          </template>
        </el-table-column>
        <el-table-column align="center" label="底分/倍数" min-width="80">
          <template #default="scope">
            {{ scope.row.baseScore }}/{{ scope.row.multiplier }}
          </template>
        </el-table-column>
        <el-table-column align="center" label="炸弹" min-width="60" prop="bombCount" />
        <el-table-column align="center" label="春天" min-width="70">
          <template #default="scope">
            <el-tag v-if="scope.row.spring > 0" :type="scope.row.spring === 1 ? 'danger' : 'success'">
              {{ scope.row.springText }}
            </el-tag>
            <span v-else>-</span>
          </template>
        </el-table-column>
        <el-table-column align="center" label="结果" min-width="70">
          <template #default="scope">
            <el-tag :type="scope.row.result === 1 ? 'danger' : 'success'">
              {{ scope.row.resultText }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column align="center" label="金币输赢" min-width="100">
          <template #default="scope">
            <div v-if="scope.row.roomCategory === 1 || !scope.row.roomCategory">
              <div class="text-xs">地主: <span :class="scope.row.landlordWinGold >= 0 ? 'text-success' : 'text-danger'">{{ scope.row.landlordWinGold >= 0 ? '+' : '' }}{{ scope.row.landlordWinGold }}</span></div>
              <div class="text-xs">农民: <span :class="scope.row.farmer1WinGold >= 0 ? 'text-success' : 'text-danger'">{{ scope.row.farmer1WinGold >= 0 ? '+' : '' }}{{ scope.row.farmer1WinGold }}</span></div>
            </div>
            <span v-else class="text-gray-400">-</span>
          </template>
        </el-table-column>
        <el-table-column align="center" label="竞技币输赢" min-width="100">
          <template #default="scope">
            <div v-if="scope.row.roomCategory === 2">
              <div class="text-xs">地主: <span :class="scope.row.landlordWinArenaCoin >= 0 ? 'text-success' : 'text-danger'">{{ scope.row.landlordWinArenaCoin >= 0 ? '+' : '' }}{{ scope.row.landlordWinArenaCoin }}</span></div>
              <div class="text-xs">农民: <span :class="scope.row.farmer1WinArenaCoin >= 0 ? 'text-success' : 'text-danger'">{{ scope.row.farmer1WinArenaCoin >= 0 ? '+' : '' }}{{ scope.row.farmer1WinArenaCoin }}</span></div>
            </div>
            <span v-else class="text-gray-400">-</span>
          </template>
        </el-table-column>
        <el-table-column align="center" label="时长" min-width="70" prop="durationText" />
        <el-table-column align="center" label="开始时间" min-width="150" prop="startedAt" />
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
    <el-dialog v-model="detailDialog" title="游戏记录详情" width="1100px" top="5vh">
      <div v-if="detailLoading" class="loading-container">
        <el-icon class="is-loading"><loading /></el-icon>
        <span>加载中...</span>
      </div>
      <template v-else>
        <!-- 游戏基本信息 -->
        <el-descriptions :column="4" border>
          <el-descriptions-item label="游戏ID">{{ currentRecord.gameId }}</el-descriptions-item>
          <el-descriptions-item label="房间类型">{{ currentRecord.roomTypeName }}</el-descriptions-item>
          <el-descriptions-item label="房间分类">
            <el-tag :type="currentRecord.roomCategory === 2 ? 'danger' : 'success'">
              {{ currentRecord.roomCategory === 2 ? '竞技场' : '普通场' }}
            </el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="游戏结果">
            <el-tag :type="currentRecord.result === 1 ? 'danger' : 'success'">
              {{ currentRecord.resultText }}
            </el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="地主">{{ currentRecord.landlordName || currentRecord.landlordId }}</el-descriptions-item>
          <el-descriptions-item label="农民1">{{ currentRecord.farmer1Name || currentRecord.farmer1Id }}</el-descriptions-item>
          <el-descriptions-item label="农民2">{{ currentRecord.farmer2Name || currentRecord.farmer2Id }}</el-descriptions-item>
          <el-descriptions-item label="底分/倍数">{{ currentRecord.baseScore }}/{{ currentRecord.multiplier }}</el-descriptions-item>
        </el-descriptions>

        <!-- 输赢信息 -->
        <el-divider content-position="left">输赢详情</el-divider>
        <el-row :gutter="20">
          <el-col :span="8">
            <div class="player-result landlord">
              <div class="player-name">{{ currentRecord.landlordName || '地主' }} (地主)</div>
              <div class="player-score" :class="currentRecord.landlordWinGold >= 0 ? 'positive' : 'negative'">
                金币: {{ currentRecord.landlordWinGold >= 0 ? '+' : '' }}{{ currentRecord.landlordWinGold }}
              </div>
              <div class="player-score" v-if="currentRecord.landlordWinArenaCoin" :class="currentRecord.landlordWinArenaCoin >= 0 ? 'positive' : 'negative'">
                竞技币: {{ currentRecord.landlordWinArenaCoin >= 0 ? '+' : '' }}{{ currentRecord.landlordWinArenaCoin }}
              </div>
            </div>
          </el-col>
          <el-col :span="8">
            <div class="player-result farmer">
              <div class="player-name">{{ currentRecord.farmer1Name || '农民1' }}</div>
              <div class="player-score" :class="currentRecord.farmer1WinGold >= 0 ? 'positive' : 'negative'">
                金币: {{ currentRecord.farmer1WinGold >= 0 ? '+' : '' }}{{ currentRecord.farmer1WinGold }}
              </div>
              <div class="player-score" v-if="currentRecord.farmer1WinArenaCoin" :class="currentRecord.farmer1WinArenaCoin >= 0 ? 'positive' : 'negative'">
                竞技币: {{ currentRecord.farmer1WinArenaCoin >= 0 ? '+' : '' }}{{ currentRecord.farmer1WinArenaCoin }}
              </div>
            </div>
          </el-col>
          <el-col :span="8">
            <div class="player-result farmer">
              <div class="player-name">{{ currentRecord.farmer2Name || '农民2' }}</div>
              <div class="player-score" :class="currentRecord.farmer2WinGold >= 0 ? 'positive' : 'negative'">
                金币: {{ currentRecord.farmer2WinGold >= 0 ? '+' : '' }}{{ currentRecord.farmer2WinGold }}
              </div>
              <div class="player-score" v-if="currentRecord.farmer2WinArenaCoin" :class="currentRecord.farmer2WinArenaCoin >= 0 ? 'positive' : 'negative'">
                竞技币: {{ currentRecord.farmer2WinArenaCoin >= 0 ? '+' : '' }}{{ currentRecord.farmer2WinArenaCoin }}
              </div>
            </div>
          </el-col>
        </el-row>

        <!-- 时间信息 -->
        <el-divider content-position="left">时间信息</el-divider>
        <el-descriptions :column="3" border>
          <el-descriptions-item label="开始时间">{{ currentRecord.startedAt }}</el-descriptions-item>
          <el-descriptions-item label="结束时间">{{ currentRecord.endedAt }}</el-descriptions-item>
          <el-descriptions-item label="游戏时长">{{ currentRecord.durationText }}</el-descriptions-item>
        </el-descriptions>

        <!-- 详细日志Tab -->
        <el-divider content-position="left">详细日志</el-divider>
        <el-tabs type="border-card" size="small">
          <el-tab-pane label="叫地主">
            <el-table :data="currentRecord.bidLogs" size="small" v-if="currentRecord.bidLogs && currentRecord.bidLogs.length > 0">
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
            <el-table :data="currentRecord.dealLogs" size="small" v-if="currentRecord.dealLogs && currentRecord.dealLogs.length > 0">
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
            <el-table :data="currentRecord.playLogs" size="small" max-height="300" v-if="currentRecord.playLogs && currentRecord.playLogs.length > 0">
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
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { getGameRecordList, getGameRecordDetail } from '@/api/ddz/gameLog'
import { Loading } from '@element-plus/icons-vue'

defineOptions({
  name: 'DDZGameRecord'
})

const searchInfo = ref({
  month: '',
  gameId: '',
  roomId: '',
  roomType: null,
  roomCategory: null,
  result: null,
  playerId: ''
})

const page = ref(1)
const total = ref(0)
const pageSize = ref(10)
const tableData = ref([])

const detailDialog = ref(false)
const detailLoading = ref(false)
const currentRecord = ref({})

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
    gameId: '',
    roomId: '',
    roomType: null,
    roomCategory: null,
    result: null,
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
  const res = await getGameRecordList({
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
  detailDialog.value = true
  detailLoading.value = true
  currentRecord.value = {}

  try {
    const res = await getGameRecordDetail(row.ID, searchInfo.value.month)
    if (res.code === 0) {
      currentRecord.value = res.data.gameRecord
      currentRecord.value.bidLogs = res.data.bidLogs || []
      currentRecord.value.dealLogs = res.data.dealLogs || []
      currentRecord.value.playLogs = res.data.playLogs || []
    }
  } finally {
    detailLoading.value = false
  }
}

getTableData()
</script>

<style scoped>
.text-success {
  color: #67c23a;
}
.text-danger {
  color: #f56c6c;
}
.text-warning {
  color: #e6a23c;
}
.text-gray-400 {
  color: #9ca3af;
}
.text-xs {
  font-size: 12px;
}

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
