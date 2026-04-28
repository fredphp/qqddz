<template>
  <div>
    <div class="gva-search-box">
      <el-form ref="searchForm" :inline="true" :model="searchInfo">
        <el-form-item label="游戏ID">
          <el-input v-model="searchInfo.gameId" placeholder="游戏ID" />
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
    </div>
    <div class="gva-table-box">
      <el-table :data="tableData" row-key="ID">
        <el-table-column align="center" label="ID" min-width="60" prop="ID" />
        <el-table-column align="center" label="游戏ID" min-width="120" prop="gameId" show-overflow-tooltip />
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
    <el-dialog v-model="detailDialog" title="游戏记录详情" width="900px">
      <el-tabs v-model="activeTab">
        <el-tab-pane label="基本信息" name="info">
          <el-descriptions :column="3" border>
            <el-descriptions-item label="游戏ID">{{ currentRecord.gameId }}</el-descriptions-item>
            <el-descriptions-item label="房间类型">{{ currentRecord.roomTypeName }}</el-descriptions-item>
            <el-descriptions-item label="房间分类">
              <el-tag :type="currentRecord.roomCategory === 2 ? 'danger' : 'success'">
                {{ currentRecord.roomCategory === 2 ? '竞技场' : '普通场' }}
              </el-tag>
            </el-descriptions-item>
            <el-descriptions-item label="地主">{{ currentRecord.landlordName }}</el-descriptions-item>
            <el-descriptions-item label="农民1">{{ currentRecord.farmer1Name }}</el-descriptions-item>
            <el-descriptions-item label="农民2">{{ currentRecord.farmer2Name }}</el-descriptions-item>
            <el-descriptions-item label="底分">{{ currentRecord.baseScore }}</el-descriptions-item>
            <el-descriptions-item label="倍数">{{ currentRecord.multiplier }}</el-descriptions-item>
            <el-descriptions-item label="炸弹数">{{ currentRecord.bombCount }}</el-descriptions-item>
          </el-descriptions>

          <!-- 金币输赢（普通场显示） -->
          <el-divider v-if="currentRecord.roomCategory === 1 || !currentRecord.roomCategory" content-position="left">金币输赢</el-divider>
          <el-descriptions v-if="currentRecord.roomCategory === 1 || !currentRecord.roomCategory" :column="3" border>
            <el-descriptions-item label="地主输赢">
              <span :class="currentRecord.landlordWinGold >= 0 ? 'text-success' : 'text-danger'">
                {{ currentRecord.landlordWinGold >= 0 ? '+' : '' }}{{ currentRecord.landlordWinGold }}
              </span>
            </el-descriptions-item>
            <el-descriptions-item label="农民1输赢">
              <span :class="currentRecord.farmer1WinGold >= 0 ? 'text-success' : 'text-danger'">
                {{ currentRecord.farmer1WinGold >= 0 ? '+' : '' }}{{ currentRecord.farmer1WinGold }}
              </span>
            </el-descriptions-item>
            <el-descriptions-item label="农民2输赢">
              <span :class="currentRecord.farmer2WinGold >= 0 ? 'text-success' : 'text-danger'">
                {{ currentRecord.farmer2WinGold >= 0 ? '+' : '' }}{{ currentRecord.farmer2WinGold }}
              </span>
            </el-descriptions-item>
          </el-descriptions>

          <!-- 竞技币输赢（竞技场显示） -->
          <el-divider v-if="currentRecord.roomCategory === 2" content-position="left">竞技币输赢</el-divider>
          <el-descriptions v-if="currentRecord.roomCategory === 2" :column="3" border>
            <el-descriptions-item label="地主输赢">
              <span :class="currentRecord.landlordWinArenaCoin >= 0 ? 'text-success' : 'text-danger'">
                {{ currentRecord.landlordWinArenaCoin >= 0 ? '+' : '' }}{{ currentRecord.landlordWinArenaCoin }}
              </span>
            </el-descriptions-item>
            <el-descriptions-item label="农民1输赢">
              <span :class="currentRecord.farmer1WinArenaCoin >= 0 ? 'text-success' : 'text-danger'">
                {{ currentRecord.farmer1WinArenaCoin >= 0 ? '+' : '' }}{{ currentRecord.farmer1WinArenaCoin }}
              </span>
            </el-descriptions-item>
            <el-descriptions-item label="农民2输赢">
              <span :class="currentRecord.farmer2WinArenaCoin >= 0 ? 'text-success' : 'text-danger'">
                {{ currentRecord.farmer2WinArenaCoin >= 0 ? '+' : '' }}{{ currentRecord.farmer2WinArenaCoin }}
              </span>
            </el-descriptions-item>
          </el-descriptions>

          <el-divider content-position="left">时间信息</el-divider>
          <el-descriptions :column="3" border>
            <el-descriptions-item label="开始时间">{{ currentRecord.startedAt }}</el-descriptions-item>
            <el-descriptions-item label="结束时间">{{ currentRecord.endedAt }}</el-descriptions-item>
            <el-descriptions-item label="游戏时长">{{ currentRecord.durationText }}</el-descriptions-item>
          </el-descriptions>
        </el-tab-pane>
        <el-tab-pane label="叫地主" name="bid">
          <el-table :data="currentRecord.bidLogs" size="small">
            <el-table-column prop="bidOrder" label="顺序" width="60" />
            <el-table-column prop="playerName" label="玩家" />
            <el-table-column prop="bidTypeText" label="操作" />
            <el-table-column prop="bidScore" label="叫分" />
            <el-table-column prop="successText" label="成为地主" />
          </el-table>
        </el-tab-pane>
        <el-tab-pane label="发牌记录" name="deal">
          <el-table :data="currentRecord.dealLogs" size="small">
            <el-table-column prop="playerName" label="玩家" />
            <el-table-column prop="playerRoleText" label="角色" />
            <el-table-column prop="cardsCount" label="牌数" />
            <el-table-column prop="handCards" label="手牌" show-overflow-tooltip />
            <el-table-column prop="landlordCards" label="底牌" />
          </el-table>
        </el-tab-pane>
        <el-tab-pane label="出牌记录" name="play">
          <el-table :data="currentRecord.playLogs" size="small" max-height="400">
            <el-table-column prop="roundNum" label="回合" width="60" />
            <el-table-column prop="playerName" label="玩家" />
            <el-table-column prop="playTypeText" label="操作" />
            <el-table-column prop="cards" label="出的牌" show-overflow-tooltip />
            <el-table-column prop="cardPattern" label="牌型" />
          </el-table>
        </el-tab-pane>
      </el-tabs>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { getGameRecordList, getGameRecordDetail } from '@/api/ddz/gameLog'

defineOptions({
  name: 'DDZGameRecord'
})

const searchInfo = ref({
  gameId: '',
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
const activeTab = ref('info')
const currentRecord = ref({})

const onSubmit = () => {
  page.value = 1
  getTableData()
}

const onReset = () => {
  searchInfo.value = {
    gameId: '',
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
  const res = await getGameRecordDetail(row.ID)
  if (res.code === 0) {
    currentRecord.value = res.data.gameRecord
    currentRecord.value.bidLogs = res.data.bidLogs || []
    currentRecord.value.dealLogs = res.data.dealLogs || []
    currentRecord.value.playLogs = res.data.playLogs || []
    activeTab.value = 'info'
    detailDialog.value = true
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
</style>
