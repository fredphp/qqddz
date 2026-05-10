<template>
  <div>
    <!-- 期数选择区域 -->
    <div class="gva-search-box">
      <el-form ref="searchForm" :inline="true" :model="searchInfo">
        <el-form-item label="竞技场期数">
          <el-select
            v-model="selectedPeriodId"
            placeholder="请选择期数"
            filterable
            clearable
            @change="onPeriodChange"
          >
            <el-option
              v-for="period in periodOptions"
              :key="period.ID"
              :label="`${period.periodNo} - ${period.roomName || '竞技场'} (${period.startTime})`"
              :value="period.ID"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="房间类型">
          <el-select v-model="searchInfo.roomType" placeholder="房间类型" clearable @change="loadPeriodList">
            <el-option label="初级场" :value="1" />
            <el-option label="中级场" :value="2" />
            <el-option label="高级场" :value="3" />
            <el-option label="专家场" :value="4" />
          </el-select>
        </el-form-item>
        <el-form-item label="状态">
          <el-select v-model="searchInfo.status" placeholder="状态" clearable @change="loadPeriodList">
            <el-option label="准备中" :value="0" />
            <el-option label="报名中" :value="1" />
            <el-option label="等待开赛" :value="2" />
            <el-option label="比赛进行中" :value="3" />
            <el-option label="已结束" :value="4" />
            <el-option label="已取消" :value="5" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" icon="search" @click="loadPeriodList">查询</el-button>
          <el-button icon="refresh" @click="onReset">重置</el-button>
        </el-form-item>
      </el-form>
    </div>

    <!-- 选中期数信息展示 -->
    <div v-if="selectedPeriod" class="period-info-card">
      <el-card shadow="hover">
        <template #header>
          <div class="card-header">
            <span class="period-title">
              <el-icon><Trophy /></el-icon>
              {{ selectedPeriod.periodNo }} - {{ selectedPeriod.roomName || '竞技场' }}
            </span>
            <el-tag :type="getStatusTagType(selectedPeriod.status)" size="large">
              {{ selectedPeriod.statusText }}
            </el-tag>
          </div>
        </template>
        <el-row :gutter="20">
          <el-col :span="6">
            <div class="info-item">
              <span class="label">开始时间</span>
              <span class="value">{{ selectedPeriod.startTime }}</span>
            </div>
          </el-col>
          <el-col :span="6">
            <div class="info-item">
              <span class="label">报名人数</span>
              <span class="value">{{ selectedPeriod.totalSignup }} 人</span>
            </div>
          </el-col>
          <el-col :span="6">
            <div class="info-item">
              <span class="label">参赛人数</span>
              <span class="value">{{ selectedPeriod.finalPlayers }} 人</span>
            </div>
          </el-col>
          <el-col :span="6">
            <div class="info-item">
              <span class="label">房间类型</span>
              <span class="value">{{ selectedPeriod.roomTypeText }}</span>
            </div>
          </el-col>
        </el-row>
      </el-card>
    </div>

    <!-- 排行榜表格 -->
    <div class="gva-table-box">
      <div v-if="!selectedPeriodId" class="empty-tip">
        <el-empty description="请先选择一个竞技场期数查看排行榜" />
      </div>
      <el-table v-else :data="leaderboardData" row-key="playerId" stripe>
        <el-table-column align="center" label="排名" min-width="100">
          <template #default="scope">
            <div class="rank-cell">
              <span v-if="scope.row.rank === 1" class="rank-badge gold">🥇</span>
              <span v-else-if="scope.row.rank === 2" class="rank-badge silver">🥈</span>
              <span v-else-if="scope.row.rank === 3" class="rank-badge bronze">🥉</span>
              <span v-else class="rank-number">{{ scope.row.rank }}</span>
            </div>
          </template>
        </el-table-column>
        <el-table-column align="center" label="玩家" min-width="180">
          <template #default="scope">
            <div class="player-cell">
              <el-avatar :size="40" :src="scope.row.playerAvatar">
                {{ scope.row.playerName?.charAt(0) || '?' }}
              </el-avatar>
              <div class="player-info">
                <span class="player-name">{{ scope.row.playerName || '未知玩家' }}</span>
                <span class="player-id">ID: {{ scope.row.playerId }}</span>
              </div>
              <el-tag v-if="scope.row.isChampion" type="danger" effect="dark" size="small" class="champion-tag">
                冠军
              </el-tag>
            </div>
          </template>
        </el-table-column>
        <el-table-column align="center" label="比赛金币" min-width="120">
          <template #default="scope">
            <span class="gold-value">{{ formatNumber(scope.row.matchCoin) }}</span>
          </template>
        </el-table-column>
        <el-table-column align="center" label="状态" min-width="100">
          <template #default="scope">
            <el-tag v-if="scope.row.isChampion" type="danger" effect="dark">冠军</el-tag>
            <el-tag v-else-if="!scope.row.isEliminated" type="success">存活</el-tag>
            <el-tag v-else type="info">已淘汰</el-tag>
          </template>
        </el-table-column>
        <el-table-column align="center" label="淘汰轮次" min-width="100">
          <template #default="scope">
            <span v-if="scope.row.isEliminated && scope.row.eliminatedRound > 0">
              第 {{ scope.row.eliminatedRound }} 轮
            </span>
            <span v-else>-</span>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页 -->
      <div v-if="selectedPeriodId && total > 0" class="gva-pagination">
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
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { getArenaPeriodList, getArenaPeriodLeaderboard } from '@/api/ddz/arenaPeriod'
import { Trophy } from '@element-plus/icons-vue'

defineOptions({
  name: 'DDZLeaderboard'
})

const searchInfo = ref({
  roomType: null,
  status: null
})

const page = ref(1)
const total = ref(0)
const pageSize = ref(20)
const selectedPeriodId = ref(null)
const selectedPeriod = ref(null)
const periodOptions = ref([])
const leaderboardData = ref([])

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
    total.value = leaderboardData.value.length
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
}

const handleCurrentChange = (val) => {
  page.value = val
}

onMounted(() => {
  loadPeriodList()
})
</script>

<style scoped>
.period-info-card {
  margin-bottom: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.period-title {
  font-size: 18px;
  font-weight: bold;
  display: flex;
  align-items: center;
  gap: 8px;
}

.info-item {
  text-align: center;
}

.info-item .label {
  display: block;
  color: #909399;
  font-size: 12px;
  margin-bottom: 5px;
}

.info-item .value {
  display: block;
  font-size: 16px;
  font-weight: bold;
  color: #303133;
}

.empty-tip {
  padding: 40px 0;
}

.rank-cell {
  display: flex;
  justify-content: center;
  align-items: center;
}

.rank-badge {
  font-size: 28px;
}

.rank-number {
  font-size: 18px;
  font-weight: bold;
  color: #606266;
}

.player-cell {
  display: flex;
  align-items: center;
  gap: 10px;
}

.player-info {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
}

.player-name {
  font-weight: bold;
  color: #303133;
}

.player-id {
  font-size: 12px;
  color: #909399;
}

.champion-tag {
  margin-left: 8px;
}

.gold-value {
  font-size: 16px;
  font-weight: bold;
  color: #E6A23C;
}
</style>
