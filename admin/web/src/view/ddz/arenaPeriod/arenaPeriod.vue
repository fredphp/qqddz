<template>
  <div class="arena-period-management">
    <!-- 统计卡片 -->
    <div class="stats-cards">
      <div class="stat-card">
        <div class="stat-icon total">
          <el-icon><Tickets /></el-icon>
        </div>
        <div class="stat-info">
          <div class="stat-value">{{ stats.totalPeriods }}</div>
          <div class="stat-label">总期号数</div>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon today">
          <el-icon><Calendar /></el-icon>
        </div>
        <div class="stat-info">
          <div class="stat-value">{{ stats.todayPeriods }}</div>
          <div class="stat-label">今日期号</div>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon active">
          <el-icon><Clock /></el-icon>
        </div>
        <div class="stat-info">
          <div class="stat-value">{{ stats.activePeriods }}</div>
          <div class="stat-label">进行中</div>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon signup">
          <el-icon><User /></el-icon>
        </div>
        <div class="stat-info">
          <div class="stat-value">{{ formatNumber(stats.todaySignup) }}</div>
          <div class="stat-label">今日报名</div>
        </div>
      </div>
    </div>

    <!-- 搜索区域 -->
    <div class="gva-search-box">
      <el-form ref="searchForm" :inline="true" :model="searchInfo">
        <el-form-item label="期号">
          <el-input v-model="searchInfo.periodNo" placeholder="请输入期号" clearable style="width: 180px" />
        </el-form-item>
        <el-form-item label="房间类型">
          <el-select v-model="searchInfo.roomType" placeholder="全部" clearable style="width: 140px">
            <el-option
              v-for="room in roomConfigOptions"
              :key="room.ID"
              :label="room.roomName"
              :value="room.roomType"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="状态">
          <el-select v-model="searchInfo.status" placeholder="全部" clearable style="width: 120px">
            <el-option label="准备中" :value="0" />
            <el-option label="报名中" :value="1" />
            <el-option label="等待开赛" :value="2" />
            <el-option label="比赛进行中" :value="3" />
            <el-option label="已结束" :value="4" />
            <el-option label="已取消" :value="5" />
          </el-select>
        </el-form-item>
        <el-form-item label="开始日期">
          <el-date-picker
            v-model="dateRange"
            type="daterange"
            range-separator="至"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
            value-format="YYYY-MM-DD"
            style="width: 240px"
          />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" icon="Search" @click="onSubmit">查询</el-button>
          <el-button icon="Refresh" @click="onReset">重置</el-button>
        </el-form-item>
      </el-form>
    </div>

    <!-- 表格区域 -->
    <div class="gva-table-box">
      <el-table :data="tableData" row-key="ID" stripe>
        <el-table-column align="center" label="期号" min-width="150" prop="periodNo">
          <template #default="scope">
            <span class="period-no">{{ scope.row.periodNo }}</span>
          </template>
        </el-table-column>
        <el-table-column align="center" label="房间" min-width="100">
          <template #default="scope">
            <el-tag :type="getRoomTagType(scope.row.roomType)" size="small">
              {{ scope.row.roomTypeText }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column align="center" label="场次" min-width="60" prop="periodIndex" />
        <el-table-column align="center" label="开始时间" min-width="150" prop="startTime" />
        <el-table-column align="center" label="报名时间" min-width="180">
          <template #default="scope">
            <div class="time-range">
              {{ scope.row.signupStartTime }}<br />
              ~ {{ scope.row.signupEndTime }}
            </div>
          </template>
        </el-table-column>
        <el-table-column align="center" label="结束时间" min-width="150" prop="endTime" />
        <el-table-column align="center" label="报名/参赛" min-width="100">
          <template #default="scope">
            <span class="signup-count">{{ scope.row.totalSignup }}</span>
            <span class="text-muted">/</span>
            <span class="final-count">{{ scope.row.finalPlayers }}</span>
          </template>
        </el-table-column>
        <el-table-column align="center" label="取消" min-width="60" prop="totalCancel" />
        <el-table-column align="center" label="状态" min-width="100">
          <template #default="scope">
            <el-tag :type="getStatusTagType(scope.row.status)" size="small">
              {{ scope.row.statusText }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column align="center" label="操作" min-width="180" fixed="right">
          <template #default="scope">
            <el-button type="primary" link icon="View" @click="viewPeriod(scope.row)">详情</el-button>
            <el-button type="primary" link icon="User" @click="viewPlayers(scope.row)">玩家</el-button>
            <el-button type="warning" link icon="Document" @click="viewLogs(scope.row)">日志</el-button>
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

    <!-- 期号详情对话框 -->
    <el-dialog v-model="detailDialog" title="期号详情" width="650px" destroy-on-close>
      <el-descriptions :column="2" border>
        <el-descriptions-item label="期号" :span="2">
          <span class="period-no">{{ currentPeriod.periodNo }}</span>
        </el-descriptions-item>
        <el-descriptions-item label="房间">{{ currentPeriod.roomName }}</el-descriptions-item>
        <el-descriptions-item label="房间类型">{{ currentPeriod.roomTypeText }}</el-descriptions-item>
        <el-descriptions-item label="场次号">{{ currentPeriod.periodIndex }}</el-descriptions-item>
        <el-descriptions-item label="状态">
          <el-tag :type="getStatusTagType(currentPeriod.status)" size="small">
            {{ currentPeriod.statusText }}
          </el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="开始时间">{{ currentPeriod.startTime }}</el-descriptions-item>
        <el-descriptions-item label="结束时间">{{ currentPeriod.endTime }}</el-descriptions-item>
        <el-descriptions-item label="报名开始">{{ currentPeriod.signupStartTime }}</el-descriptions-item>
        <el-descriptions-item label="报名截止">{{ currentPeriod.signupEndTime }}</el-descriptions-item>
        <el-descriptions-item label="报名人数">{{ currentPeriod.totalSignup }}</el-descriptions-item>
        <el-descriptions-item label="取消人数">{{ currentPeriod.totalCancel }}</el-descriptions-item>
        <el-descriptions-item label="参赛人数">{{ currentPeriod.finalPlayers }}</el-descriptions-item>
        <el-descriptions-item label="创建时间">{{ currentPeriod.createdAt }}</el-descriptions-item>
        <el-descriptions-item label="更新时间">{{ currentPeriod.updatedAt }}</el-descriptions-item>
      </el-descriptions>
      <template #footer>
        <el-button @click="detailDialog = false">关闭</el-button>
      </template>
    </el-dialog>

    <!-- 玩家列表对话框 -->
    <el-dialog v-model="playersDialog" title="期号玩家列表" width="800px" destroy-on-close>
      <div class="dialog-header">
        <span class="period-label">期号: {{ currentPeriod.periodNo }}</span>
      </div>
      <el-table :data="playersData" stripe max-height="400">
        <el-table-column align="center" label="报名顺序" min-width="80" prop="signupOrder" />
        <el-table-column align="center" label="玩家ID" min-width="100" prop="playerId" />
        <el-table-column align="center" label="昵称" min-width="120" prop="playerName" />
        <el-table-column align="center" label="报名时间" min-width="150" prop="signupTime" />
        <el-table-column align="center" label="报名费" min-width="80">
          <template #default="scope">
            <span class="currency-value">{{ formatNumber(scope.row.signupFee) }}</span>
          </template>
        </el-table-column>
        <el-table-column align="center" label="状态" min-width="80">
          <template #default="scope">
            <el-tag :type="getPlayerStatusTagType(scope.row.status)" size="small">
              {{ scope.row.statusText }}
            </el-tag>
          </template>
        </el-table-column>
      </el-table>
      <div class="dialog-pagination">
        <el-pagination
          v-model:current-page="playersPage"
          v-model:page-size="playersPageSize"
          :total="playersTotal"
          layout="total, prev, pager, next"
          @current-change="loadPlayers"
        />
      </div>
    </el-dialog>

    <!-- 报名日志对话框 -->
    <el-dialog v-model="logsDialog" title="报名日志" width="800px" destroy-on-close>
      <div class="dialog-header">
        <span class="period-label">期号: {{ currentPeriod.periodNo }}</span>
      </div>
      <el-table :data="logsData" stripe max-height="400">
        <el-table-column align="center" label="时间" min-width="150" prop="createdAt" />
        <el-table-column align="center" label="玩家ID" min-width="100" prop="playerId" />
        <el-table-column align="center" label="昵称" min-width="120" prop="playerName" />
        <el-table-column align="center" label="操作" min-width="80">
          <template #default="scope">
            <el-tag :type="scope.row.actionType === 1 ? 'success' : 'danger'" size="small">
              {{ scope.row.actionText }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column align="center" label="报名费" min-width="80">
          <template #default="scope">
            <span class="currency-value">{{ formatNumber(scope.row.signupFee) }}</span>
          </template>
        </el-table-column>
        <el-table-column align="center" label="变动前" min-width="100">
          <template #default="scope">
            <span>{{ formatNumber(scope.row.balanceBefore) }}</span>
          </template>
        </el-table-column>
        <el-table-column align="center" label="变动后" min-width="100">
          <template #default="scope">
            <span>{{ formatNumber(scope.row.balanceAfter) }}</span>
          </template>
        </el-table-column>
        <el-table-column align="center" label="备注" min-width="120" prop="remark" show-overflow-tooltip />
      </el-table>
      <div class="dialog-pagination">
        <el-pagination
          v-model:current-page="logsPage"
          v-model:page-size="logsPageSize"
          :total="logsTotal"
          layout="total, prev, pager, next"
          @current-change="loadLogs"
        />
      </div>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { ElMessage } from 'element-plus'
import { Tickets, Calendar, Clock, User } from '@element-plus/icons-vue'
import {
  getArenaPeriodList,
  getArenaPeriodStats,
  getArenaPeriodPlayers,
  getArenaPeriodSignupLogs
} from '@/api/ddz/arenaPeriod'
import { getRoomConfigList } from '@/api/ddz/gameLog'

defineOptions({
  name: 'DDZArenaPeriod'
})

// 统计数据
const stats = ref({
  totalPeriods: 0,
  todayPeriods: 0,
  activePeriods: 0,
  totalSignup: 0,
  todaySignup: 0,
  todayPlayers: 0
})

// 房间配置列表（竞技场）
const roomConfigOptions = ref([])

// 搜索相关
const searchInfo = ref({
  periodNo: '',
  roomType: null,
  status: null
})
const dateRange = ref([])

// 分页相关
const page = ref(1)
const total = ref(0)
const pageSize = ref(10)
const tableData = ref([])

// 对话框控制
const detailDialog = ref(false)
const playersDialog = ref(false)
const logsDialog = ref(false)

// 当前期号
const currentPeriod = ref({})

// 玩家列表相关
const playersData = ref([])
const playersPage = ref(1)
const playersPageSize = ref(10)
const playersTotal = ref(0)

// 日志列表相关
const logsData = ref([])
const logsPage = ref(1)
const logsPageSize = ref(10)
const logsTotal = ref(0)

// 格式化数字
const formatNumber = (num) => {
  if (num === null || num === undefined) return '0'
  if (num >= 100000000) {
    return (num / 100000000).toFixed(2) + '亿'
  } else if (num >= 10000) {
    return (num / 10000).toFixed(2) + '万'
  }
  return num.toLocaleString()
}

// 获取房间标签类型
const getRoomTagType = (roomType) => {
  const types = { 1: 'success', 2: 'warning', 3: 'danger', 4: '' }
  return types[roomType] || ''
}

// 获取状态标签类型
const getStatusTagType = (status) => {
  const types = {
    0: 'info',
    1: 'success',
    2: 'warning',
    3: 'primary',
    4: 'info',
    5: 'danger'
  }
  return types[status] || 'info'
}

// 获取玩家状态标签类型
const getPlayerStatusTagType = (status) => {
  const types = { 1: 'success', 2: 'warning', 3: 'danger' }
  return types[status] || 'info'
}

// 搜索方法
const onSubmit = () => {
  page.value = 1
  getTableData()
}

const onReset = () => {
  searchInfo.value = {
    periodNo: '',
    roomType: null,
    status: null
  }
  dateRange.value = []
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

// 获取表格数据
const getTableData = async () => {
  const params = {
    page: page.value,
    pageSize: pageSize.value,
    ...searchInfo.value
  }

  if (dateRange.value && dateRange.value.length === 2) {
    params.startDate = dateRange.value[0]
    params.endDate = dateRange.value[1]
  }

  const res = await getArenaPeriodList(params)
  if (res.code === 0) {
    tableData.value = res.data.list
    total.value = res.data.total
  }
}

// 获取统计数据
const getStats = async () => {
  const res = await getArenaPeriodStats()
  if (res.code === 0) {
    stats.value = res.data
  }
}

// 获取房间配置列表（竞技场）
const getRoomConfigs = async () => {
  const res = await getRoomConfigList({ page: 1, pageSize: 100, roomCategory: 2, status: 1 })
  if (res.code === 0) {
    roomConfigOptions.value = res.data.list || []
  }
}

// 查看期号详情
const viewPeriod = (row) => {
  currentPeriod.value = row
  detailDialog.value = true
}

// 查看玩家列表
const viewPlayers = async (row) => {
  currentPeriod.value = row
  playersPage.value = 1
  await loadPlayers()
  playersDialog.value = true
}

// 加载玩家列表
const loadPlayers = async () => {
  const res = await getArenaPeriodPlayers({
    page: playersPage.value,
    pageSize: playersPageSize.value,
    periodId: currentPeriod.value.ID
  })
  if (res.code === 0) {
    playersData.value = res.data.list
    playersTotal.value = res.data.total
  }
}

// 查看报名日志
const viewLogs = async (row) => {
  currentPeriod.value = row
  logsPage.value = 1
  await loadLogs()
  logsDialog.value = true
}

// 加载日志列表
const loadLogs = async () => {
  const res = await getArenaPeriodSignupLogs({
    page: logsPage.value,
    pageSize: logsPageSize.value,
    periodId: currentPeriod.value.ID
  })
  if (res.code === 0) {
    logsData.value = res.data.list
    logsTotal.value = res.data.total
  }
}

// 初始化
getStats()
getRoomConfigs()
getTableData()
</script>

<style scoped>
.arena-period-management {
  padding: 0;
}

/* 统计卡片 */
.stats-cards {
  display: flex;
  gap: 16px;
  margin-bottom: 16px;
}

.stat-card {
  flex: 1;
  display: flex;
  align-items: center;
  padding: 16px;
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
}

.stat-icon {
  width: 48px;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 12px;
  font-size: 24px;
  margin-right: 16px;
}

.stat-icon.total {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.stat-icon.today {
  background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
  color: white;
}

.stat-icon.active {
  background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
  color: white;
}

.stat-icon.signup {
  background: linear-gradient(135deg, #43e97b 0%, #38f9d7 100%);
  color: white;
}

.stat-info {
  flex: 1;
}

.stat-value {
  font-size: 24px;
  font-weight: 700;
  color: #303133;
}

.stat-label {
  font-size: 13px;
  color: #909399;
  margin-top: 4px;
}

/* 期号样式 */
.period-no {
  font-family: 'Courier New', monospace;
  font-weight: 600;
  color: #409eff;
}

/* 时间范围 */
.time-range {
  font-size: 12px;
  line-height: 1.5;
  color: #606266;
}

/* 报名/参赛人数 */
.signup-count {
  color: #409eff;
  font-weight: 600;
}

.final-count {
  color: #67c23a;
  font-weight: 600;
}

.text-muted {
  color: #909399;
  margin: 0 4px;
}

/* 货币值 */
.currency-value {
  color: #f59e0b;
  font-weight: 600;
}

/* 对话框头部 */
.dialog-header {
  margin-bottom: 16px;
}

.period-label {
  font-size: 14px;
  font-weight: 600;
  color: #606266;
}

/* 对话框分页 */
.dialog-pagination {
  margin-top: 16px;
  display: flex;
  justify-content: center;
}

/* 响应式 */
@media (max-width: 1200px) {
  .stats-cards {
    flex-wrap: wrap;
  }

  .stat-card {
    flex: 1 1 45%;
    min-width: 200px;
  }
}

@media (max-width: 768px) {
  .stat-card {
    flex: 1 1 100%;
  }
}
</style>
