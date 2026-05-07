<template>
  <div class="arena-registration">
    <!-- 搜索区域 -->
    <div class="gva-search-box">
      <el-form ref="searchForm" :inline="true" :model="searchInfo">
        <el-form-item label="玩家ID">
          <el-input v-model="searchInfo.playerId" placeholder="输入玩家ID" clearable />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" icon="search" @click="loadArenaList">查询</el-button>
        </el-form-item>
      </el-form>
    </div>

    <!-- 玩家信息 -->
    <div v-if="playerInfo" class="player-info-card">
      <el-card>
        <div class="player-info">
          <el-avatar :size="64" :src="playerInfo.avatar || defaultAvatar" />
          <div class="player-details">
            <div class="player-name">{{ playerInfo.nickname }}</div>
            <div class="player-id">ID: {{ playerInfo.id }}</div>
            <div class="player-coin">
              <el-icon><Coin /></el-icon>
              <span>竞技币: {{ formatNumber(playerInfo.arenaCoin) }}</span>
            </div>
          </div>
          <div v-if="registrationStatus.isRegistered" class="registration-status">
            <el-tag type="success" size="large">
              已报名{{ registrationStatus.arenaLevelName }}
            </el-tag>
          </div>
        </div>
      </el-card>
    </div>

    <!-- 竞技场列表 -->
    <div v-if="playerInfo" class="arena-list">
      <div class="arena-title">竞技场报名</div>
      <div class="arena-cards">
        <div
          v-for="arena in arenaList"
          :key="arena.arenaLevel"
          class="arena-card"
          :class="{
            'arena-registered': arena.isRegistered,
            'arena-disabled': !arena.canRegister && !arena.isRegistered
          }"
        >
          <div class="arena-header">
            <div class="arena-name">{{ arena.arenaLevelName }}</div>
            <el-tag v-if="arena.isRegistered" type="success" size="small">已报名</el-tag>
          </div>
          <div class="arena-info">
            <div class="info-item">
              <span class="label">报名费:</span>
              <span class="value coin">{{ formatNumber(arena.arenaCoinCost) }} 竞技币</span>
            </div>
            <div class="info-item">
              <span class="label">开赛时间:</span>
              <span class="value" :class="{ 'text-warning': !arena.inMatchTime }">
                {{ arena.inMatchTime ? '报名中' : arena.nextMatchTime || '未配置' }}
              </span>
            </div>
          </div>
          <div class="arena-actions">
            <!-- 已报名状态 -->
            <template v-if="arena.isRegistered">
              <el-button
                v-if="arena.inMatchTime"
                type="danger"
                :loading="operating === arena.arenaLevel"
                @click="handleCancel(arena)"
              >
                取消报名
              </el-button>
              <el-button
                v-else
                type="info"
                disabled
              >
                等待开赛
              </el-button>
            </template>
            <!-- 未报名状态 -->
            <template v-else-if="registrationStatus.isRegistered">
              <el-button type="info" disabled>
                已报名其他场
              </el-button>
            </template>
            <template v-else-if="!arena.inMatchTime">
              <el-button type="info" disabled>
                非开赛时间
              </el-button>
            </template>
            <template v-else-if="playerInfo.arenaCoin < arena.arenaCoinCost">
              <el-button type="info" disabled>
                竞技币不足
              </el-button>
            </template>
            <template v-else>
              <el-button
                type="primary"
                :loading="operating === arena.arenaLevel"
                @click="handleRegister(arena)"
              >
                报名
              </el-button>
            </template>
          </div>
        </div>
      </div>
    </div>

    <!-- 报名记录 -->
    <div v-if="playerInfo" class="registration-records">
      <el-collapse v-model="activeCollapse">
        <el-collapse-item title="报名记录" name="records">
          <el-table :data="recordList" size="small" max-height="300">
            <el-table-column prop="arenaLevelName" label="竞技场" width="100" />
            <el-table-column prop="arenaCoinCost" label="费用" width="100">
              <template #default="scope">
                {{ formatNumber(scope.row.arenaCoinCost) }}
              </template>
            </el-table-column>
            <el-table-column prop="statusText" label="状态" width="80">
              <template #default="scope">
                <el-tag :type="getStatusType(scope.row.status)" size="small">
                  {{ scope.row.statusText }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="registeredAt" label="报名时间" width="160" />
            <el-table-column prop="cancelledAt" label="取消时间" width="160">
              <template #default="scope">
                {{ scope.row.cancelledAt || '-' }}
              </template>
            </el-table-column>
          </el-table>
          <el-pagination
            v-model:current-page="recordPage"
            v-model:page-size="recordPageSize"
            :total="recordTotal"
            layout="total, prev, pager, next"
            small
            @current-change="loadRecordList"
          />
        </el-collapse-item>
      </el-collapse>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Coin } from '@element-plus/icons-vue'
import {
  getArenaList,
  getArenaStatus,
  arenaRegister,
  arenaCancel,
  getArenaRegistrationList
} from '@/api/ddz/arena'
import { getPlayerInfo } from '@/api/ddz/player'

defineOptions({
  name: 'DDZArenaRegistration'
})

const defaultAvatar = 'https://cube.elemecdn.com/3/7c/3ea6beec64369c2642b92c6726f1epng.png'

const searchInfo = reactive({
  playerId: ''
})

const playerInfo = ref(null)
const arenaList = ref([])
const registrationStatus = ref({
  isRegistered: false,
  arenaLevel: 0,
  arenaLevelName: '',
  arenaCoinCost: 0,
  registeredAt: '',
  playerArenaCoin: 0
})

const operating = ref(0) // 当前正在操作的竞技场等级
const activeCollapse = ref([])

// 报名记录
const recordList = ref([])
const recordPage = ref(1)
const recordPageSize = ref(10)
const recordTotal = ref(0)

// 格式化数字
const formatNumber = (num) => {
  if (num === null || num === undefined) return '0'
  return num.toLocaleString()
}

// 获取状态类型
const getStatusType = (status) => {
  switch (status) {
    case 1:
      return 'success'
    case 2:
      return 'info'
    case 3:
      return 'warning'
    default:
      return ''
  }
}

// 加载玩家信息
const loadPlayerInfo = async () => {
  if (!searchInfo.playerId) {
    ElMessage.warning('请输入玩家ID')
    return false
  }

  try {
    const res = await getPlayerInfo(searchInfo.playerId)
    if (res.code === 0) {
      playerInfo.value = res.data
      return true
    } else {
      ElMessage.error('玩家不存在')
      return false
    }
  } catch (error) {
    ElMessage.error('查询玩家失败')
    return false
  }
}

// 加载竞技场列表
const loadArenaList = async () => {
  const success = await loadPlayerInfo()
  if (!success) return

  try {
    // 加载报名状态
    const statusRes = await getArenaStatus(playerInfo.value.id)
    if (statusRes.code === 0) {
      registrationStatus.value = statusRes.data
    }

    // 加载竞技场列表
    const listRes = await getArenaList(playerInfo.value.id)
    if (listRes.code === 0) {
      arenaList.value = listRes.data
    }

    // 加载报名记录
    loadRecordList()
  } catch (error) {
    ElMessage.error('加载数据失败')
  }
}

// 加载报名记录
const loadRecordList = async () => {
  if (!playerInfo.value) return

  try {
    const res = await getArenaRegistrationList({
      page: recordPage.value,
      pageSize: recordPageSize.value,
      playerId: playerInfo.value.id
    })
    if (res.code === 0) {
      recordList.value = res.data.list
      recordTotal.value = res.data.total
    }
  } catch (error) {
    console.error('加载报名记录失败', error)
  }
}

// 报名
const handleRegister = async (arena) => {
  try {
    await ElMessageBox.confirm(
      `确定报名${arena.arenaLevelName}？将扣除${formatNumber(arena.arenaCoinCost)}竞技币`,
      '报名确认',
      {
        confirmButtonText: '确定报名',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )

    operating.value = arena.arenaLevel

    const res = await arenaRegister({
      playerId: playerInfo.value.id,
      arenaLevel: arena.arenaLevel
    })

    if (res.code === 0) {
      ElMessage.success(res.data.message)
      // 更新玩家竞技币
      playerInfo.value.arenaCoin = res.data.playerArenaCoin
      // 刷新列表
      await loadArenaList()
    } else {
      ElMessage.error(res.msg || '报名失败')
    }
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('报名失败，请稍后重试')
    }
  } finally {
    operating.value = 0
  }
}

// 取消报名
const handleCancel = async (arena) => {
  try {
    await ElMessageBox.confirm(
      `确定取消${arena.arenaLevelName}报名？将返还${formatNumber(arena.arenaCoinCost)}竞技币`,
      '取消确认',
      {
        confirmButtonText: '确定取消',
        cancelButtonText: '返回',
        type: 'warning'
      }
    )

    operating.value = arena.arenaLevel

    const res = await arenaCancel({
      playerId: playerInfo.value.id
    })

    if (res.code === 0) {
      ElMessage.success(res.data.message)
      // 更新玩家竞技币
      playerInfo.value.arenaCoin = res.data.playerArenaCoin
      // 刷新列表
      await loadArenaList()
    } else {
      ElMessage.error(res.msg || '取消报名失败')
    }
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('取消报名失败，请稍后重试')
    }
  } finally {
    operating.value = 0
  }
}
</script>

<style scoped>
.arena-registration {
  padding: 20px;
}

.player-info-card {
  margin-bottom: 20px;
}

.player-info {
  display: flex;
  align-items: center;
  gap: 20px;
}

.player-details {
  flex: 1;
}

.player-name {
  font-size: 18px;
  font-weight: bold;
  margin-bottom: 5px;
}

.player-id {
  color: #666;
  margin-bottom: 5px;
}

.player-coin {
  display: flex;
  align-items: center;
  gap: 5px;
  color: #e6a23c;
}

.registration-status {
  margin-left: auto;
}

.arena-list {
  margin-bottom: 20px;
}

.arena-title {
  font-size: 18px;
  font-weight: bold;
  margin-bottom: 15px;
  padding-left: 10px;
  border-left: 4px solid #409eff;
}

.arena-cards {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 20px;
}

.arena-card {
  background: #fff;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
  transition: all 0.3s;
}

.arena-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 4px 16px 0 rgba(0, 0, 0, 0.15);
}

.arena-card.arena-registered {
  border: 2px solid #67c23a;
}

.arena-card.arena-disabled {
  opacity: 0.7;
}

.arena-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
}

.arena-name {
  font-size: 18px;
  font-weight: bold;
}

.arena-info {
  margin-bottom: 15px;
}

.info-item {
  display: flex;
  justify-content: space-between;
  margin-bottom: 8px;
  font-size: 14px;
}

.info-item .label {
  color: #666;
}

.info-item .value {
  font-weight: bold;
}

.info-item .value.coin {
  color: #e6a23c;
}

.info-item .value.text-warning {
  color: #e6a23c;
}

.arena-actions {
  text-align: center;
}

.arena-actions .el-button {
  width: 100%;
}

.registration-records {
  margin-top: 20px;
}
</style>
