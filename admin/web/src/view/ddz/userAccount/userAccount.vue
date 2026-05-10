<template>
  <div>
    <div class="gva-search-box">
      <el-form ref="searchForm" :inline="true" :model="searchInfo">
        <el-form-item label="手机号">
          <el-input v-model="searchInfo.phone" placeholder="手机号" />
        </el-form-item>
        <el-form-item label="玩家ID">
          <el-input v-model="searchInfo.playerId" placeholder="玩家ID" />
        </el-form-item>
        <el-form-item label="登录类型">
          <el-select v-model="searchInfo.loginType" placeholder="登录类型" clearable>
            <el-option label="手机号" :value="1" />
            <el-option label="微信" :value="2" />
            <el-option label="游客" :value="3" />
          </el-select>
        </el-form-item>
        <el-form-item label="状态">
          <el-select v-model="searchInfo.status" placeholder="状态" clearable>
            <el-option label="正常" :value="1" />
            <el-option label="禁用" :value="0" />
            <el-option label="封禁" :value="2" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" icon="search" @click="onSubmit">查询</el-button>
          <el-button icon="refresh" @click="onReset">重置</el-button>
        </el-form-item>
      </el-form>
    </div>
    <div class="gva-table-box">
      <div class="gva-btn-list">
        <el-button type="primary" icon="plus" @click="createDialog = true">新建用户账户</el-button>
      </div>
      <el-table :data="tableData" row-key="ID">
        <el-table-column align="center" label="玩家ID" min-width="80" prop="playerId" />
        <el-table-column align="center" label="玩家信息" min-width="180">
          <template #default="scope">
            <div class="player-info">
              <el-avatar :size="40" :src="getUrl(scope.row.playerAvatar) || defaultAvatar" shape="square">
                <el-icon :size="20"><User /></el-icon>
              </el-avatar>
              <div class="player-detail">
                <div class="player-name">{{ scope.row.playerNickname || '-' }}</div>
                <div class="player-meta">
                  <el-tag v-if="scope.row.playerVipLevel > 0" type="warning" size="small" class="mr-1">VIP{{ scope.row.playerVipLevel }}</el-tag>
                  <el-tag type="info" size="small">Lv.{{ scope.row.playerLevel || 1 }}</el-tag>
                </div>
              </div>
            </div>
          </template>
        </el-table-column>
        <el-table-column align="center" label="金币" min-width="100">
          <template #default="scope">
            <span class="currency-value gold">{{ formatNumber(scope.row.playerCoins) }}</span>
          </template>
        </el-table-column>
        <el-table-column align="center" label="手机号" min-width="120" prop="phone">
          <template #default="scope">
            {{ scope.row.phone || '-' }}
          </template>
        </el-table-column>
        <el-table-column align="center" label="登录类型" min-width="100">
          <template #default="scope">
            <el-tag :type="getLoginTypeTag(scope.row.loginType)">
              {{ scope.row.loginTypeText }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column align="center" label="设备" min-width="80">
          <template #default="scope">
            <el-tag v-if="scope.row.deviceType" :type="getDeviceTypeTag(scope.row.deviceType)" size="small">
              {{ getDeviceTypeText(scope.row.deviceType) }}
            </el-tag>
            <span v-else>-</span>
          </template>
        </el-table-column>
        <el-table-column align="center" label="登录次数" min-width="80" prop="loginCount" />
        <el-table-column align="center" label="最后登录" min-width="160">
          <template #default="scope">
            <div>{{ scope.row.lastLoginAt || '-' }}</div>
            <div class="text-gray">{{ scope.row.lastLoginIp || '-' }}</div>
          </template>
        </el-table-column>
        <el-table-column align="center" label="状态" min-width="80">
          <template #default="scope">
            <el-tag :type="getStatusTag(scope.row.status)">
              {{ scope.row.statusText }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column align="center" label="操作" min-width="280" fixed="right">
          <template #default="scope">
            <el-dropdown trigger="click">
              <el-button type="primary" link>
                查看玩家 <el-icon class="el-icon--right"><ArrowDown /></el-icon>
              </el-button>
              <template #dropdown>
                <el-dropdown-menu>
                  <el-dropdown-item @click="viewPlayerDetail(scope.row)">玩家详情</el-dropdown-item>
                  <el-dropdown-item @click="viewPlayerCoins(scope.row)">资金流水</el-dropdown-item>
                </el-dropdown-menu>
              </template>
            </el-dropdown>
            <el-button type="primary" link icon="view" @click="viewUser(scope.row)">账户详情</el-button>
            <el-button type="primary" link icon="edit" @click="editUser(scope.row)">编辑</el-button>
            <el-button type="danger" link icon="delete" @click="handleDelete(scope.row)">删除</el-button>
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

    <!-- 创建用户账户对话框 -->
    <el-dialog v-model="createDialog" title="创建用户账户" width="500px">
      <el-form ref="createForm" :model="createForm" :rules="createRules" label-width="100px">
        <el-form-item label="玩家ID" prop="playerId">
          <el-input-number v-model="createForm.playerId" :min="1" style="width: 100%" />
        </el-form-item>
        <el-form-item label="手机号">
          <el-input v-model="createForm.phone" placeholder="选填" />
        </el-form-item>
        <el-form-item label="登录类型" prop="loginType">
          <el-select v-model="createForm.loginType" style="width: 100%">
            <el-option label="手机号" :value="1" />
            <el-option label="微信" :value="2" />
            <el-option label="游客" :value="3" />
          </el-select>
        </el-form-item>
        <el-form-item label="设备ID">
          <el-input v-model="createForm.deviceId" placeholder="选填" />
        </el-form-item>
        <el-form-item label="设备类型">
          <el-select v-model="createForm.deviceType" style="width: 100%">
            <el-option label="iOS" value="ios" />
            <el-option label="Android" value="android" />
            <el-option label="Web" value="web" />
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="createDialog = false">取消</el-button>
        <el-button type="primary" @click="handleCreate">确定</el-button>
      </template>
    </el-dialog>

    <!-- 用户详情对话框 -->
    <el-dialog v-model="detailDialog" title="用户账户详情" width="700px">
      <el-descriptions :column="2" border>
        <el-descriptions-item label="账户ID">{{ currentUser.ID }}</el-descriptions-item>
        <el-descriptions-item label="玩家ID">{{ currentUser.playerId }}</el-descriptions-item>
        <el-descriptions-item label="玩家昵称">{{ currentUser.playerNickname || '-' }}</el-descriptions-item>
        <el-descriptions-item label="玩家等级">Lv.{{ currentUser.playerLevel || 1 }}</el-descriptions-item>
        <el-descriptions-item label="VIP等级">
          <el-tag v-if="currentUser.playerVipLevel > 0" type="warning">VIP{{ currentUser.playerVipLevel }}</el-tag>
          <span v-else>普通用户</span>
        </el-descriptions-item>
        <el-descriptions-item label="金币">
          <span class="currency-value gold">{{ formatNumber(currentUser.playerCoins) }}</span>
        </el-descriptions-item>
        <el-descriptions-item label="手机号">{{ currentUser.phone || '-' }}</el-descriptions-item>
        <el-descriptions-item label="微信OpenID">{{ currentUser.wxOpenId || '-' }}</el-descriptions-item>
        <el-descriptions-item label="微信昵称">{{ currentUser.wxNickname || '-' }}</el-descriptions-item>
        <el-descriptions-item label="微信头像">
          <el-avatar v-if="currentUser.wxAvatar" :src="currentUser.wxAvatar" :size="32" />
          <span v-else>-</span>
        </el-descriptions-item>
        <el-descriptions-item label="登录类型">{{ currentUser.loginTypeText }}</el-descriptions-item>
        <el-descriptions-item label="设备类型">{{ currentUser.deviceType || '-' }}</el-descriptions-item>
        <el-descriptions-item label="设备ID">{{ currentUser.deviceId || '-' }}</el-descriptions-item>
        <el-descriptions-item label="登录次数">{{ currentUser.loginCount }}</el-descriptions-item>
        <el-descriptions-item label="状态">
          <el-tag :type="getStatusTag(currentUser.status)">
            {{ currentUser.statusText }}
          </el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="最后登录时间">{{ currentUser.lastLoginAt || '-' }}</el-descriptions-item>
        <el-descriptions-item label="最后登录IP">{{ currentUser.lastLoginIp || '-' }}</el-descriptions-item>
        <el-descriptions-item label="Token过期">{{ currentUser.tokenExpireAt || '-' }}</el-descriptions-item>
        <el-descriptions-item label="创建时间">{{ currentUser.createdAt }}</el-descriptions-item>
        <el-descriptions-item label="更新时间" :span="2">{{ currentUser.updatedAt }}</el-descriptions-item>
      </el-descriptions>
    </el-dialog>

    <!-- 玩家详情对话框 -->
    <el-dialog v-model="playerDetailDialog" title="玩家详情" width="700px" destroy-on-close>
      <el-descriptions :column="2" border>
        <el-descriptions-item label="玩家ID">{{ currentPlayerInfo.ID }}</el-descriptions-item>
        <el-descriptions-item label="玩家编号">{{ currentPlayerInfo.playerId }}</el-descriptions-item>
        <el-descriptions-item label="昵称">{{ currentPlayerInfo.nickname || '-' }}</el-descriptions-item>
        <el-descriptions-item label="等级">Lv.{{ currentPlayerInfo.level || 1 }}</el-descriptions-item>
        <el-descriptions-item label="VIP等级">
          <el-tag v-if="currentPlayerInfo.vipLevel > 0" type="warning">VIP{{ currentPlayerInfo.vipLevel }}</el-tag>
          <span v-else>普通用户</span>
        </el-descriptions-item>
        <el-descriptions-item label="状态">
          <el-tag :type="currentPlayerInfo.status === 1 ? 'success' : 'danger'">
            {{ currentPlayerInfo.status === 1 ? '正常' : '封禁' }}
          </el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="金币">
          <span class="currency-value gold">{{ formatNumber(currentPlayerInfo.coins) }}</span>
        </el-descriptions-item>
        <el-descriptions-item label="竞技币">
          <span class="currency-value arena">{{ formatNumber(currentPlayerInfo.arenaCoin) }}</span>
        </el-descriptions-item>
        <el-descriptions-item label="钻石">
          <span class="currency-value diamond">{{ formatNumber(currentPlayerInfo.diamonds) }}</span>
        </el-descriptions-item>
        <el-descriptions-item label="胜场">{{ currentPlayerInfo.winCount || 0 }}</el-descriptions-item>
        <el-descriptions-item label="败场">{{ currentPlayerInfo.loseCount || 0 }}</el-descriptions-item>
        <el-descriptions-item label="胜率">{{ (currentPlayerInfo.winRate || 0).toFixed(2) }}%</el-descriptions-item>
        <el-descriptions-item label="最后登录">{{ currentPlayerInfo.lastLoginAt || '-' }}</el-descriptions-item>
        <el-descriptions-item label="注册时间">{{ currentPlayerInfo.createdAt || '-' }}</el-descriptions-item>
      </el-descriptions>
    </el-dialog>

    <!-- 资金流水对话框 -->
    <el-dialog v-model="coinLogDialog" title="资金流水" width="900px" destroy-on-close>
      <div class="coin-log-header">
        <el-radio-group v-model="coinLogType" @change="loadPlayerCoinLogs">
          <el-radio-button value="gold">金币流水</el-radio-button>
          <el-radio-button value="arenaCoin">竞技币流水</el-radio-button>
          <el-radio-button value="diamond">钻石流水</el-radio-button>
        </el-radio-group>
      </div>
      <el-table :data="coinLogData" stripe max-height="400">
        <el-table-column align="center" label="时间" min-width="150" prop="createdAt" />
        <el-table-column align="center" label="变化" min-width="120">
          <template #default="scope">
            <span :class="scope.row.changeAmount >= 0 ? 'log-add' : 'log-subtract'">
              {{ scope.row.changeAmount >= 0 ? '+' : '' }}{{ formatNumber(scope.row.changeAmount) }}
            </span>
          </template>
        </el-table-column>
        <el-table-column align="center" label="余额" min-width="100">
          <template #default="scope">
            <span>{{ formatNumber(scope.row.balanceAfter) }}</span>
          </template>
        </el-table-column>
        <el-table-column align="center" label="类型" min-width="100" prop="changeTypeText" />
        <el-table-column align="center" label="备注" min-width="150" prop="remark" show-overflow-tooltip />
      </el-table>
      <div class="coin-log-pagination">
        <el-pagination
          v-model:current-page="coinLogPage"
          v-model:page-size="coinLogPageSize"
          :total="coinLogTotal"
          layout="total, prev, pager, next"
          @current-change="loadPlayerCoinLogs"
        />
      </div>
    </el-dialog>

    <!-- 编辑用户对话框 -->
    <el-dialog v-model="editDialog" title="编辑用户账户" width="550px" destroy-on-close>
      <div class="edit-dialog-content">
        <!-- 玩家信息卡片 -->
        <div class="player-info-card">
          <el-avatar :size="56" :src="getUrl(editForm.playerAvatar) || defaultAvatar" shape="square">
            <el-icon :size="28"><User /></el-icon>
          </el-avatar>
          <div class="player-info-details">
            <div class="player-info-name">{{ editForm.playerNickname || '未知玩家' }}</div>
            <div class="player-info-meta">
              <span class="player-id-label">玩家ID: {{ editForm.playerId }}</span>
              <el-tag v-if="editForm.playerVipLevel > 0" type="warning" size="small">VIP{{ editForm.playerVipLevel }}</el-tag>
              <el-tag type="info" size="small">Lv.{{ editForm.playerLevel || 1 }}</el-tag>
            </div>
            <div class="player-info-coins">
              <span class="coin-label">金币:</span>
              <span class="coin-value gold">{{ formatNumber(editForm.playerCoins) }}</span>
            </div>
          </div>
        </div>

        <el-divider content-position="left">账户信息</el-divider>

        <el-form ref="editForm" :model="editForm" label-width="80px" class="edit-form">
          <el-row :gutter="20">
            <el-col :span="12">
              <el-form-item label="手机号">
                <el-input v-model="editForm.phone" placeholder="请输入手机号" clearable />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="状态">
                <el-select v-model="editForm.status" style="width: 100%">
                  <el-option label="正常" :value="1">
                    <el-tag type="success" size="small">正常</el-tag>
                  </el-option>
                  <el-option label="禁用" :value="0">
                    <el-tag type="danger" size="small">禁用</el-tag>
                  </el-option>
                  <el-option label="封禁" :value="2">
                    <el-tag type="danger" size="small">封禁</el-tag>
                  </el-option>
                </el-select>
              </el-form-item>
            </el-col>
          </el-row>
          <el-form-item label="登录类型">
            <el-tag :type="getLoginTypeTag(editForm.loginType)">
              {{ editForm.loginTypeText || '-' }}
            </el-tag>
            <span class="readonly-hint">（登录类型不可修改）</span>
          </el-form-item>
          <el-form-item label="设备类型">
            <el-tag v-if="editForm.deviceType" :type="getDeviceTypeTag(editForm.deviceType)">
              {{ getDeviceTypeText(editForm.deviceType) }}
            </el-tag>
            <span v-else class="text-muted">-</span>
            <span class="readonly-hint">（设备类型不可修改）</span>
          </el-form-item>
        </el-form>

        <div class="edit-tips">
          <el-icon><InfoFilled /></el-icon>
          <span>提示：如需修改玩家头像或昵称，请前往玩家管理页面操作</span>
        </div>
      </div>
      <template #footer>
        <el-button @click="editDialog = false">取消</el-button>
        <el-button type="primary" @click="handleEdit">保存修改</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { ArrowDown, User, InfoFilled } from '@element-plus/icons-vue'
import { getUrl } from '@/utils/image'
import {
  getUserAccountList,
  createUserAccount,
  deleteUserAccount,
  updateUserAccount
} from '@/api/ddz/userAccount'
import { getPlayerList, getCoinLogList } from '@/api/ddz/player'

defineOptions({
  name: 'DDZUserAccount'
})

const searchInfo = ref({
  phone: '',
  playerId: '',
  loginType: null,
  status: null
})

const page = ref(1)
const total = ref(0)
const pageSize = ref(10)
const tableData = ref([])

const createDialog = ref(false)
const detailDialog = ref(false)
const editDialog = ref(false)
const currentUser = ref({})

// 玩家详情相关
const playerDetailDialog = ref(false)
const currentPlayerInfo = ref({})

// 资金流水相关
const coinLogDialog = ref(false)
const coinLogType = ref('gold')
const coinLogData = ref([])
const coinLogPage = ref(1)
const coinLogPageSize = ref(10)
const coinLogTotal = ref(0)
const currentCoinLogPlayerId = ref(null)

const createForm = ref({
  playerId: null,
  phone: '',
  loginType: 1,
  deviceId: '',
  deviceType: 'web'
})

const createRules = {
  playerId: [{ required: true, message: '请输入玩家ID', trigger: 'blur' }],
  loginType: [{ required: true, message: '请选择登录类型', trigger: 'change' }]
}

const editForm = ref({
  ID: null,
  playerId: '',
  phone: '',
  status: 1,
  loginType: 0,
  loginTypeText: '',
  deviceType: '',
  playerNickname: '',
  playerAvatar: '',
  playerLevel: 1,
  playerVipLevel: 0,
  playerCoins: 0
})

// 默认头像
const defaultAvatar = 'https://cube.elemecdn.com/3/7c/3ea6beec64369c2642b92c6726f1epng.png'

const formatNumber = (num) => {
  if (!num) return '0'
  if (num >= 100000000) {
    return (num / 100000000).toFixed(2) + '亿'
  } else if (num >= 10000) {
    return (num / 10000).toFixed(2) + '万'
  }
  return num.toLocaleString()
}

const getLoginTypeTag = (type) => {
  const tags = { 1: 'primary', 2: 'success', 3: 'info' }
  return tags[type] || 'info'
}

const getDeviceTypeTag = (type) => {
  const tags = { 'ios': 'primary', 'android': 'success', 'web': 'info' }
  return tags[type] || 'info'
}

const getDeviceTypeText = (type) => {
  const texts = { 'ios': 'iOS', 'android': '安卓', 'web': 'Web' }
  return texts[type] || type
}

const getStatusTag = (status) => {
  const tags = { 0: 'danger', 1: 'success', 2: 'danger' }
  return tags[status] || 'info'
}

const onSubmit = () => {
  page.value = 1
  getTableData()
}

const onReset = () => {
  searchInfo.value = {
    phone: '',
    playerId: '',
    loginType: null,
    status: null
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
  const res = await getUserAccountList({
    page: page.value,
    pageSize: pageSize.value,
    ...searchInfo.value
  })
  if (res.code === 0) {
    tableData.value = res.data.list
    total.value = res.data.total
  }
}

const viewUser = (row) => {
  currentUser.value = row
  detailDialog.value = true
}

const editUser = (row) => {
  editForm.value = {
    ID: row.ID,
    playerId: row.playerId,
    phone: row.phone || '',
    status: row.status,
    loginType: row.loginType,
    loginTypeText: row.loginTypeText,
    deviceType: row.deviceType,
    playerNickname: row.playerNickname,
    playerAvatar: row.playerAvatar,
    playerLevel: row.playerLevel,
    playerVipLevel: row.playerVipLevel,
    playerCoins: row.playerCoins
  }
  editDialog.value = true
}

const handleCreate = async () => {
  const res = await createUserAccount(createForm.value)
  if (res.code === 0) {
    ElMessage.success('创建成功')
    createDialog.value = false
    createForm.value = {
      playerId: null,
      phone: '',
      loginType: 1,
      deviceId: '',
      deviceType: 'web'
    }
    getTableData()
  }
}

const handleEdit = async () => {
  const res = await updateUserAccount(editForm.value)
  if (res.code === 0) {
    ElMessage.success('更新成功')
    editDialog.value = false
    getTableData()
  }
}

const handleDelete = (row) => {
  ElMessageBox.confirm('确定要删除该用户账户吗？此操作不可恢复!', '警告', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(async () => {
    const res = await deleteUserAccount({ ID: row.ID })
    if (res.code === 0) {
      ElMessage.success('删除成功')
      getTableData()
    }
  })
}

// 查看玩家详情
const viewPlayerDetail = async (row) => {
  if (!row.playerId) {
    ElMessage.warning('该账户没有关联玩家')
    return
  }
  const res = await getPlayerList({ playerId: row.playerId, page: 1, pageSize: 1 })
  if (res.code === 0 && res.data.list && res.data.list.length > 0) {
    currentPlayerInfo.value = res.data.list[0]
    playerDetailDialog.value = true
  } else {
    ElMessage.warning('未找到玩家信息')
  }
}

// 查看资金流水
const viewPlayerCoins = async (row) => {
  if (!row.playerId) {
    ElMessage.warning('该账户没有关联玩家')
    return
  }
  // 先获取玩家ID（数据库主键）
  const playerRes = await getPlayerList({ playerId: row.playerId, page: 1, pageSize: 1 })
  if (playerRes.code === 0 && playerRes.data.list && playerRes.data.list.length > 0) {
    currentCoinLogPlayerId.value = playerRes.data.list[0].ID
    coinLogType.value = 'gold'
    coinLogPage.value = 1
    await loadPlayerCoinLogs()
    coinLogDialog.value = true
  } else {
    ElMessage.warning('未找到玩家信息')
  }
}

// 加载资金流水
const loadPlayerCoinLogs = async () => {
  if (!currentCoinLogPlayerId.value) return
  const res = await getCoinLogList({
    page: coinLogPage.value,
    pageSize: coinLogPageSize.value,
    playerId: currentCoinLogPlayerId.value,
    currencyType: coinLogType.value
  })
  if (res.code === 0) {
    coinLogData.value = res.data.list
    coinLogTotal.value = res.data.total
  }
}

getTableData()
</script>

<style scoped>
.player-info {
  display: flex;
  align-items: center;
  gap: 12px;
}
.player-detail {
  text-align: left;
}
.player-name {
  font-weight: 500;
  margin-bottom: 4px;
}
.player-meta {
  display: flex;
  gap: 4px;
}
.mr-1 {
  margin-right: 4px;
}
.text-gray {
  color: #909399;
  font-size: 12px;
}
.gva-btn-list {
  margin-bottom: 10px;
}

/* 货币颜色 */
.currency-value {
  font-weight: 600;
}
.currency-value.gold {
  color: #f59e0b;
}
.currency-value.arena {
  color: #3b82f6;
}
.currency-value.diamond {
  color: #8b5cf6;
}

/* 资金流水 */
.coin-log-header {
  margin-bottom: 16px;
}
.coin-log-pagination {
  margin-top: 16px;
  display: flex;
  justify-content: center;
}
.log-add {
  color: #67c23a;
  font-weight: 600;
}
.log-subtract {
  color: #f56c6c;
  font-weight: 600;
}

/* 编辑弹窗样式 */
.edit-dialog-content {
  padding: 0 10px;
}

.player-info-card {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 16px;
  background: linear-gradient(135deg, #f5f7fa 0%, #e4e7ed 100%);
  border-radius: 8px;
  margin-bottom: 10px;
}

.player-info-details {
  flex: 1;
}

.player-info-name {
  font-size: 16px;
  font-weight: 600;
  color: #303133;
  margin-bottom: 6px;
}

.player-info-meta {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 4px;
}

.player-id-label {
  color: #909399;
  font-size: 12px;
}

.player-info-coins {
  margin-top: 4px;
}

.coin-label {
  color: #909399;
  font-size: 12px;
  margin-right: 4px;
}

.coin-value {
  font-weight: 600;
}

.coin-value.gold {
  color: #f59e0b;
}

.edit-form {
  margin-top: 10px;
}

.readonly-hint {
  color: #909399;
  font-size: 12px;
  margin-left: 8px;
}

.text-muted {
  color: #c0c4cc;
}

.edit-tips {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 10px 12px;
  background: #fdf6ec;
  border-radius: 4px;
  color: #e6a23c;
  font-size: 13px;
  margin-top: 16px;
}
</style>
