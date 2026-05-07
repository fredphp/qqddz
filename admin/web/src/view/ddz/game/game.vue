<template>
  <div>
    <div class="gva-search-box">
      <el-form ref="searchForm" :inline="true" :model="searchInfo">
        <el-form-item label="房间ID">
          <el-input v-model="searchInfo.roomId" placeholder="房间ID" />
        </el-form-item>
        <el-form-item label="玩家ID">
          <el-input v-model="searchInfo.playerId" placeholder="玩家ID" />
        </el-form-item>
        <el-form-item label="房间类型">
          <el-select v-model="searchInfo.roomType" placeholder="房间类型" clearable>
            <el-option label="普通房间" :value="1" />
            <el-option label="VIP房间" :value="2" />
          </el-select>
        </el-form-item>
        <el-form-item label="赢家">
          <el-select v-model="searchInfo.winner" placeholder="赢家" clearable>
            <el-option label="地主" :value="1" />
            <el-option label="农民" :value="2" />
          </el-select>
        </el-form-item>
        <el-form-item label="开始时间">
          <el-date-picker
            v-model="searchInfo.startTime"
            type="datetime"
            placeholder="开始时间"
            format="YYYY-MM-DD HH:mm:ss"
            value-format="YYYY-MM-DD HH:mm:ss"
          />
        </el-form-item>
        <el-form-item label="结束时间">
          <el-date-picker
            v-model="searchInfo.endTime"
            type="datetime"
            placeholder="结束时间"
            format="YYYY-MM-DD HH:mm:ss"
            value-format="YYYY-MM-DD HH:mm:ss"
          />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" icon="search" @click="onSubmit">查询</el-button>
          <el-button icon="refresh" @click="onReset">重置</el-button>
        </el-form-item>
      </el-form>
    </div>
    <div class="gva-table-box">
      <el-table :data="tableData" row-key="ID">
        <el-table-column align="center" label="ID" min-width="60" prop="ID" />
        <el-table-column align="center" label="房间ID" min-width="120" prop="roomId" />
        <el-table-column align="center" label="房间类型" min-width="100">
          <template #default="scope">
            <el-tag :type="scope.row.roomType === 1 ? '' : 'warning'">
              {{ scope.row.roomType === 1 ? '普通' : 'VIP' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column align="center" label="底分" min-width="80" prop="baseScore" />
        <el-table-column align="center" label="倍数" min-width="80" prop="multiple" />
        <el-table-column align="center" label="地主" min-width="120" prop="landlordId" />
        <el-table-column align="center" label="赢家" min-width="100">
          <template #default="scope">
            <el-tag :type="scope.row.winner === 1 ? 'danger' : 'success'">
              {{ scope.row.winner === 1 ? '地主' : '农民' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column align="center" label="游戏时长" min-width="100">
          <template #default="scope">
            {{ formatDuration(scope.row.gameDuration) }}
          </template>
        </el-table-column>
        <el-table-column align="center" label="炸弹数" min-width="80" prop="bombCount" />
        <el-table-column align="center" label="春天" min-width="80">
          <template #default="scope">
            <el-tag v-if="scope.row.spring === 1" type="danger">春天</el-tag>
            <el-tag v-else-if="scope.row.spring === 2" type="warning">反春</el-tag>
            <span v-else>-</span>
          </template>
        </el-table-column>
        <el-table-column align="center" label="游戏时间" min-width="160" prop="gameTime" />
        <el-table-column align="center" label="操作" min-width="100" fixed="right">
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

    <!-- 游戏详情对话框 -->
    <el-dialog v-model="detailDialog" title="游戏记录详情" width="900px">
      <el-descriptions :column="3" border>
        <el-descriptions-item label="房间ID">{{ gameDetail.gameRecord?.roomId }}</el-descriptions-item>
        <el-descriptions-item label="房间类型">
          <el-tag :type="gameDetail.gameRecord?.roomType === 1 ? '' : 'warning'">
            {{ gameDetail.gameRecord?.roomType === 1 ? '普通' : 'VIP' }}
          </el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="底分">{{ gameDetail.gameRecord?.baseScore }}</el-descriptions-item>
        <el-descriptions-item label="倍数">{{ gameDetail.gameRecord?.multiple }}</el-descriptions-item>
        <el-descriptions-item label="地主ID">{{ gameDetail.gameRecord?.landlordId }}</el-descriptions-item>
        <el-descriptions-item label="赢家">
          <el-tag :type="gameDetail.gameRecord?.winner === 1 ? 'danger' : 'success'">
            {{ gameDetail.gameRecord?.winner === 1 ? '地主' : '农民' }}
          </el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="游戏时长">{{ formatDuration(gameDetail.gameRecord?.gameDuration) }}</el-descriptions-item>
        <el-descriptions-item label="炸弹数">{{ gameDetail.gameRecord?.bombCount }}</el-descriptions-item>
        <el-descriptions-item label="春天">
          <el-tag v-if="gameDetail.gameRecord?.spring === 1" type="danger">春天</el-tag>
          <el-tag v-else-if="gameDetail.gameRecord?.spring === 2" type="warning">反春</el-tag>
          <span v-else>否</span>
        </el-descriptions-item>
      </el-descriptions>

      <el-divider content-position="left">发牌记录</el-divider>
      <el-descriptions :column="2" border>
        <el-descriptions-item label="玩家0手牌">
          <div class="card-display">{{ gameDetail.dealRecord?.player0Cards || '-' }}</div>
        </el-descriptions-item>
        <el-descriptions-item label="玩家1手牌">
          <div class="card-display">{{ gameDetail.dealRecord?.player1Cards || '-' }}</div>
        </el-descriptions-item>
        <el-descriptions-item label="玩家2手牌">
          <div class="card-display">{{ gameDetail.dealRecord?.player2Cards || '-' }}</div>
        </el-descriptions-item>
        <el-descriptions-item label="地主牌(底牌)">
          <div class="card-display dizhu-cards">{{ gameDetail.dealRecord?.dizhuCards || '-' }}</div>
        </el-descriptions-item>
      </el-descriptions>

      <el-divider content-position="left">玩家记录</el-divider>
      <el-table :data="gameDetail.gameRecord?.players || []" border>
        <el-table-column align="center" label="玩家ID" prop="playerId" />
        <el-table-column align="center" label="昵称" prop="nickname" />
        <el-table-column align="center" label="位置" prop="playerIndex" />
        <el-table-column align="center" label="身份">
          <template #default="scope">
            <el-tag :type="scope.row.isLandlord === 1 ? 'danger' : 'info'">
              {{ scope.row.isLandlord === 1 ? '地主' : '农民' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column align="center" label="结果">
          <template #default="scope">
            <el-tag :type="scope.row.isWinner === 1 ? 'success' : 'danger'">
              {{ scope.row.isWinner === 1 ? '胜利' : '失败' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column align="center" label="得分">
          <template #default="scope">
            <span :class="scope.row.score >= 0 ? 'text-success' : 'text-danger'">
              {{ scope.row.score >= 0 ? '+' : '' }}{{ scope.row.score }}
            </span>
          </template>
        </el-table-column>
        <el-table-column align="center" label="手牌">
          <template #default="scope">
            <el-tooltip :content="scope.row.cards" placement="top">
              <span class="card-preview">{{ scope.row.cards?.substring(0, 20) }}...</span>
            </el-tooltip>
          </template>
        </el-table-column>
      </el-table>

      <el-divider content-position="left">出牌记录</el-divider>
      <el-table :data="gameDetail.playRecords || []" border max-height="300">
        <el-table-column align="center" label="回合" prop="turnIndex" width="80" />
        <el-table-column align="center" label="玩家位置" prop="playerIndex" width="100">
          <template #default="scope">
            <el-tag :type="scope.row.playerIndex === 0 ? 'primary' : scope.row.playerIndex === 1 ? 'success' : 'warning'">
              玩家{{ scope.row.playerIndex }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column align="center" label="操作" width="100">
          <template #default="scope">
            <el-tag v-if="scope.row.actionType === 1" type="success">出牌</el-tag>
            <el-tag v-else-if="scope.row.actionType === 2" type="info">不出</el-tag>
            <el-tag v-else-if="scope.row.actionType === 3" type="danger">叫地主</el-tag>
            <el-tag v-else-if="scope.row.actionType === 4" type="info">不叫</el-tag>
            <el-tag v-else-if="scope.row.actionType === 5" type="danger">抢地主</el-tag>
            <el-tag v-else-if="scope.row.actionType === 6" type="info">不抢</el-tag>
            <span v-else>未知</span>
          </template>
        </el-table-column>
        <el-table-column align="center" label="出的牌" prop="cards" />
        <el-table-column align="center" label="时间" prop="timestamp" width="160" />
      </el-table>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { getGameList, getGameDetail } from '@/api/ddz/game'

defineOptions({
  name: 'DDZGame'
})

const searchInfo = ref({
  roomId: '',
  playerId: '',
  roomType: null,
  winner: null,
  startTime: '',
  endTime: ''
})

const page = ref(1)
const total = ref(0)
const pageSize = ref(10)
const tableData = ref([])
const detailDialog = ref(false)
const gameDetail = ref({
  gameRecord: {},
  dealRecord: {},
  playRecords: []
})

const formatDuration = (seconds) => {
  if (!seconds) return '0秒'
  const minutes = Math.floor(seconds / 60)
  const secs = seconds % 60
  if (minutes > 0) {
    return `${minutes}分${secs}秒`
  }
  return `${secs}秒`
}

const onSubmit = () => {
  page.value = 1
  getTableData()
}

const onReset = () => {
  searchInfo.value = {
    roomId: '',
    playerId: '',
    roomType: null,
    winner: null,
    startTime: '',
    endTime: ''
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
  const res = await getGameList({
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
  const res = await getGameDetail(row.ID)
  if (res.code === 0) {
    gameDetail.value = res.data
    detailDialog.value = true
  }
}

getTableData()
</script>

<style scoped>
.card-display {
  font-family: monospace;
  padding: 8px;
  background: #f5f7fa;
  border-radius: 4px;
  white-space: pre-wrap;
  word-break: break-all;
}
.dizhu-cards {
  color: #f56c6c;
  font-weight: bold;
}
.card-preview {
  color: #409eff;
  cursor: pointer;
}
.text-success {
  color: #67c23a;
}
.text-danger {
  color: #f56c6c;
}
</style>
