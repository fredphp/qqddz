<template>
  <div class="arena-registration">
    <!-- 搜索区域 -->
    <div class="gva-search-box">
      <el-form ref="searchForm" :inline="true" :model="searchInfo">
        <el-form-item label="玩家ID（可选）">
          <el-input v-model="searchInfo.playerId" placeholder="输入玩家ID查询报名状态" clearable />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" icon="search" @click="loadPlayerStatus">查询玩家状态</el-button>
        </el-form-item>
      </el-form>
    </div>

    <!-- 玩家信息 -->
    <div v-if="playerInfo" class="player-info-card">
      <el-card>
        <div class="player-info">
          <el-avatar :size="64" :src="getAvatarUrl(playerInfo.avatar)" />
          <div class="player-details">
            <div class="player-name">{{ playerInfo.nickname }}</div>
            <div class="player-id">ID: {{ playerInfo.ID }}</div>
            <div class="player-coin">
              <el-icon><Coin /></el-icon>
              <span>竞技币: {{ formatNumber(registrationStatus.playerArenaCoin || playerInfo.arenaCoin) }}</span>
            </div>
          </div>
          <div class="registration-status">
            <el-tag v-if="registrationStatus.isRegistered" type="success" size="large">
              已报名{{ registrationStatus.arenaLevelName }}
            </el-tag>
            <el-tag v-else type="info" size="large">
              未报名
            </el-tag>
          </div>
        </div>
        <!-- 报名状态详情 -->
        <div v-if="registrationStatus.isRegistered" class="registration-details">
          <el-descriptions :column="3" border size="small">
            <el-descriptions-item label="报名等级">{{ registrationStatus.arenaLevelName || `等级 ${registrationStatus.arenaLevel}` }}</el-descriptions-item>
            <el-descriptions-item label="报名费用">{{ formatNumber(registrationStatus.arenaCoinCost) }} 竞技币</el-descriptions-item>
            <el-descriptions-item label="报名时间">{{ registrationStatus.registeredAt || '-' }}</el-descriptions-item>
          </el-descriptions>
        </div>
      </el-card>
    </div>

    <!-- 竞技场列表 -->
    <div class="arena-list">
      <div class="arena-title">竞技场配置列表</div>
      <el-table :data="arenaList" border stripe size="small">
        <el-table-column prop="roomName" label="竞技场名称" width="120" />
        <el-table-column prop="roomType" label="房间类型" width="100" />
        <el-table-column label="报名费" width="120">
          <template #default="scope">
            <span class="text-warning">{{ formatNumber(scope.row.minArenaCoin) }} 竞技币</span>
          </template>
        </el-table-column>
        <el-table-column label="开赛时间段" min-width="200">
          <template #default="scope">
            <span>{{ formatTimeRanges(scope.row.matchTimeRanges) }}</span>
          </template>
        </el-table-column>
        <el-table-column label="每场时长" width="100">
          <template #default="scope">
            {{ scope.row.matchRoundDuration || 5 }} 分钟
          </template>
        </el-table-column>
        <el-table-column label="轮次" width="80">
          <template #default="scope">
            {{ scope.row.matchRoundCount || 3 }}
          </template>
        </el-table-column>
        <el-table-column label="人数限制" width="120">
          <template #default="scope">
            {{ scope.row.minPlayers || 3 }} - {{ scope.row.maxPlayers || 9 }} 人
          </template>
        </el-table-column>
        <el-table-column label="状态" width="80">
          <template #default="scope">
            <el-tag :type="scope.row.status === 1 ? 'success' : 'danger'" size="small">
              {{ scope.row.status === 1 ? '开启' : '关闭' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column v-if="playerInfo" label="玩家报名状态" width="120">
          <template #default="scope">
            <el-tag v-if="isPlayerRegistered(scope.row)" type="success" size="small">已报名</el-tag>
            <el-tag v-else type="info" size="small">未报名</el-tag>
          </template>
        </el-table-column>
        <el-table-column v-if="playerInfo" label="操作" width="120" fixed="right">
          <template #default="scope">
            <template v-if="isPlayerRegistered(scope.row)">
              <el-button type="danger" size="small" @click="handleCancel(scope.row)">取消报名</el-button>
            </template>
            <template v-else>
              <el-button type="primary" size="small" @click="handleRegister(scope.row)">报名</el-button>
            </template>
          </template>
        </el-table-column>
      </el-table>
    </div>

    <!-- 报名记录 -->
    <div v-if="playerInfo" class="registration-records">
      <div class="arena-title">玩家报名记录</div>
      <el-table :data="recordList" size="small" border stripe>
        <el-table-column prop="arenaLevelName" label="竞技场" width="120" />
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
        size="small"
        class="pagination"
        @current-change="loadRecordList"
      />
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Coin } from '@element-plus/icons-vue'
import { getRoomConfigList } from '@/api/ddz/gameLog'
import { getPlayerInfo } from '@/api/ddz/player'
import {
  getArenaStatus,
  arenaRegister,
  arenaCancel,
  getArenaRegistrationList
} from '@/api/ddz/arena'

defineOptions({
  name: 'DDZArenaRegistration'
})

const defaultAvatar = 'https://cube.elemecdn.com/3/7c/3ea6beec64369c2642b92c6726f1epng.png'

// 获取完整的头像URL
const getAvatarUrl = (avatar) => {
  if (!avatar) return defaultAvatar
  // 如果已经是完整URL，直接返回
  if (avatar.startsWith('http://') || avatar.startsWith('https://')) {
    return avatar
  }
  // 如果是相对路径，添加后端域名
  // 处理以 / 开头的路径
  if (avatar.startsWith('/')) {
    return 'http://admin.qqddz.local' + avatar
  }
  // 处理不以 / 开头的相对路径（如 uploads/file/...）
  return 'http://admin.qqddz.local/' + avatar
}

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

const operating = ref(0)

// 报名记录
const recordList = ref([])
const recordPage = ref(1)
const recordPageSize = ref(10)
const recordTotal = ref(0)

// 页面加载时直接获取竞技场配置
onMounted(() => {
  loadArenaConfigList()
})

// 格式化数字
const formatNumber = (num) => {
  if (num === null || num === undefined) return '0'
  return num.toLocaleString()
}

// 格式化时间段
const formatTimeRanges = (ranges) => {
  if (!ranges) return '未配置'
  try {
    const arr = typeof ranges === 'string' ? JSON.parse(ranges) : ranges
    if (!Array.isArray(arr) || arr.length === 0) return '未配置'
    return arr.map(r => `${r.start}-${r.end}`).join(', ')
  } catch {
    return ranges || '未配置'
  }
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

// 直接从数据库获取竞技场配置列表
const loadArenaConfigList = async () => {
  try {
    const res = await getRoomConfigList({
      page: 1,
      pageSize: 100,
      roomCategory: 2  // 只获取竞技场房间
    })
    if (res.code === 0) {
      arenaList.value = res.data.list || []
    }
  } catch (error) {
    console.error('加载竞技场配置失败', error)
    ElMessage.error('加载竞技场配置失败')
  }
}

// 检查玩家是否已报名该竞技场
const isPlayerRegistered = (arena) => {
  if (!playerInfo.value || !registrationStatus.value.isRegistered) return false
  // arenaLevel = roomType - 1
  return registrationStatus.value.arenaLevel === arena.roomType - 1
}

// 加载玩家状态（可选功能）
const loadPlayerStatus = async () => {
  if (!searchInfo.playerId) {
    ElMessage.warning('请输入玩家ID')
    return
  }

  try {
    // 获取玩家信息
    const playerRes = await getPlayerInfo(searchInfo.playerId)
    console.log('getPlayerInfo response:', playerRes)
    
    if (playerRes.code === 0) {
      playerInfo.value = playerRes.data
      console.log('playerInfo:', playerInfo.value)
    } else {
      ElMessage.error('玩家不存在')
      return
    }

    // 获取报名状态 - 使用 playerInfo.value.ID (大写，与后端JSON标签一致)
    console.log('Calling getArenaStatus with ID:', playerInfo.value.ID)
    const statusRes = await getArenaStatus(playerInfo.value.ID)
    if (statusRes.code === 0) {
      registrationStatus.value = statusRes.data
    }

    // 加载报名记录
    loadRecordList()
  } catch (error) {
    console.error('查询玩家失败:', error)
    ElMessage.error('查询玩家失败')
  }
}

// 加载报名记录
const loadRecordList = async () => {
  if (!playerInfo.value) return

  try {
    const res = await getArenaRegistrationList({
      page: recordPage.value,
      pageSize: recordPageSize.value,
      playerId: playerInfo.value.ID
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
      `确定报名${arena.roomName}？将扣除${formatNumber(arena.minArenaCoin)}竞技币`,
      '报名确认',
      {
        confirmButtonText: '确定报名',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )

    operating.value = arena.roomType

    const res = await arenaRegister({
      playerId: playerInfo.value.ID,
      arenaLevel: arena.roomType - 1
    })

    if (res.code === 0) {
      ElMessage.success(res.data.message)
      playerInfo.value.arenaCoin = res.data.playerArenaCoin
      await loadPlayerStatus()
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
      `确定取消${arena.roomName}报名？将返还${formatNumber(arena.minArenaCoin)}竞技币`,
      '取消确认',
      {
        confirmButtonText: '确定取消',
        cancelButtonText: '返回',
        type: 'warning'
      }
    )

    operating.value = arena.roomType

    const res = await arenaCancel({
      playerId: playerInfo.value.ID
    })

    if (res.code === 0) {
      ElMessage.success(res.data.message)
      playerInfo.value.arenaCoin = res.data.playerArenaCoin
      await loadPlayerStatus()
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

.registration-details {
  margin-top: 15px;
  padding-top: 15px;
  border-top: 1px solid #ebeef5;
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

.text-warning {
  color: #e6a23c;
}

.registration-records {
  margin-top: 20px;
}

.pagination {
  margin-top: 15px;
  justify-content: flex-end;
}
</style>
