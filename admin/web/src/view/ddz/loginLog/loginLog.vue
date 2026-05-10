<template>
  <div class="login-log-page">
    <!-- 搜索区域 -->
    <div class="search-section">
      <el-form ref="searchForm" :inline="true" :model="searchInfo" class="search-form">
        <el-form-item label="玩家ID">
          <el-input 
            v-model="searchInfo.playerId" 
            placeholder="请输入玩家ID" 
            clearable 
            :prefix-icon="User"
            style="width: 160px" 
          />
        </el-form-item>
        <el-form-item label="登录类型">
          <el-select 
            v-model="searchInfo.loginType" 
            placeholder="全部" 
            clearable 
            style="width: 120px"
          >
            <el-option label="手机号" :value="1" />
            <el-option label="微信" :value="2" />
            <el-option label="游客" :value="3" />
          </el-select>
        </el-form-item>
        <el-form-item label="登录结果">
          <el-select 
            v-model="searchInfo.loginResult" 
            placeholder="全部" 
            clearable 
            style="width: 100px"
          >
            <el-option label="成功" :value="1" />
            <el-option label="失败" :value="0" />
          </el-select>
        </el-form-item>
        <el-form-item label="登录IP">
          <el-input 
            v-model="searchInfo.ip" 
            placeholder="请输入IP" 
            clearable 
            style="width: 140px" 
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
        <div class="stat-card stat-card--total">
          <div class="stat-card__icon">
            <el-icon :size="28"><Document /></el-icon>
          </div>
          <div class="stat-card__content">
            <div class="stat-card__value">{{ overviewStats.total }}</div>
            <div class="stat-card__label">总登录次数</div>
          </div>
        </div>
      </div>
      <div class="stat-card-wrapper">
        <div class="stat-card stat-card--success">
          <div class="stat-card__icon">
            <el-icon :size="28"><CircleCheck /></el-icon>
          </div>
          <div class="stat-card__content">
            <div class="stat-card__value">{{ overviewStats.successCount }}</div>
            <div class="stat-card__label">登录成功</div>
          </div>
        </div>
      </div>
      <div class="stat-card-wrapper">
        <div class="stat-card stat-card--fail">
          <div class="stat-card__icon">
            <el-icon :size="28"><CircleClose /></el-icon>
          </div>
          <div class="stat-card__content">
            <div class="stat-card__value">{{ overviewStats.failCount }}</div>
            <div class="stat-card__label">登录失败</div>
          </div>
        </div>
      </div>
      <div class="stat-card-wrapper">
        <div class="stat-card stat-card--rate">
          <div class="stat-card__icon">
            <el-icon :size="28"><TrendCharts /></el-icon>
          </div>
          <div class="stat-card__content">
            <div class="stat-card__value">{{ overviewStats.successRate }}%</div>
            <div class="stat-card__label">成功率</div>
          </div>
        </div>
      </div>
    </div>

    <!-- 表格区域 -->
    <div class="table-section">
      <!-- 工具栏 -->
      <div class="table-toolbar">
        <div class="toolbar-left">
          <el-button 
            :icon="Delete" 
            type="danger" 
            plain
            :disabled="!multipleSelection.length"
            @click="onDelete"
          >
            批量删除
            <span v-if="multipleSelection.length">({{ multipleSelection.length }})</span>
          </el-button>
        </div>
        <div class="toolbar-right">
          <el-button :icon="Download" @click="onExport">导出</el-button>
        </div>
      </div>

      <!-- 表格 -->
      <el-table
        ref="multipleTable"
        :data="tableData"
        row-key="ID"
        v-loading="loading"
        @selection-change="handleSelectionChange"
        class="data-table"
        :header-cell-style="{ background: '#f5f7fa', color: '#606266', fontWeight: '600' }"
      >
        <el-table-column type="selection" width="55" align="center" />
        <el-table-column align="center" label="ID" min-width="80" prop="ID" />
        <el-table-column align="center" label="玩家ID" min-width="100" prop="playerId">
          <template #default="scope">
            <span class="player-id">{{ scope.row.playerId }}</span>
          </template>
        </el-table-column>
        <el-table-column align="center" label="玩家昵称" min-width="120">
          <template #default="scope">
            <span>{{ scope.row.playerNickname || '-' }}</span>
          </template>
        </el-table-column>
        <el-table-column align="center" label="账户ID" min-width="100" prop="accountId">
          <template #default="scope">
            <span class="account-id">{{ scope.row.accountId }}</span>
          </template>
        </el-table-column>
        <el-table-column align="center" label="登录类型" min-width="100">
          <template #default="scope">
            <el-tag :type="getLoginTypeTagType(scope.row.loginType)" effect="plain">
              {{ scope.row.loginTypeText || getLoginTypeText(scope.row.loginType) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column align="center" label="登录结果" min-width="90">
          <template #default="scope">
            <el-tag :type="scope.row.loginResult === 1 ? 'success' : 'danger'" effect="dark">
              {{ scope.row.loginResultText || (scope.row.loginResult === 1 ? '成功' : '失败') }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column align="center" label="失败原因" min-width="180" show-overflow-tooltip>
          <template #default="scope">
            <span v-if="scope.row.loginResult === 1" class="text-muted">-</span>
            <span v-else class="fail-reason">{{ scope.row.failReason || '-' }}</span>
          </template>
        </el-table-column>
        <el-table-column align="center" label="登录IP" min-width="130" prop="ip">
          <template #default="scope">
            <span class="ip-address">{{ scope.row.ip || '-' }}</span>
          </template>
        </el-table-column>
        <el-table-column align="center" label="设备类型" min-width="100" prop="deviceType">
          <template #default="scope">
            <el-tag v-if="scope.row.deviceType" size="small" type="info" effect="plain">
              {{ scope.row.deviceType }}
            </el-tag>
            <span v-else class="text-muted">-</span>
          </template>
        </el-table-column>
        <el-table-column align="center" label="设备ID" min-width="150" show-overflow-tooltip>
          <template #default="scope">
            <span class="device-id">{{ scope.row.deviceId || '-' }}</span>
          </template>
        </el-table-column>
        <el-table-column align="center" label="登录地点" min-width="120" show-overflow-tooltip>
          <template #default="scope">
            <div v-if="scope.row.location" class="location-cell">
              <el-icon><Location /></el-icon>
              <span>{{ scope.row.location }}</span>
            </div>
            <span v-else class="text-muted">-</span>
          </template>
        </el-table-column>
        <el-table-column align="center" label="User-Agent" min-width="200" show-overflow-tooltip>
          <template #default="scope">
            <el-tooltip :content="scope.row.userAgent" placement="top" :disabled="!scope.row.userAgent">
              <span class="user-agent">{{ scope.row.userAgent || '-' }}</span>
            </el-tooltip>
          </template>
        </el-table-column>
        <el-table-column align="center" label="登录时间" min-width="170" prop="createdAt">
          <template #default="scope">
            <div class="time-cell">
              <el-icon><Clock /></el-icon>
              <span>{{ scope.row.createdAt }}</span>
            </div>
          </template>
        </el-table-column>
        <el-table-column align="center" label="操作" width="100" fixed="right">
          <template #default="scope">
            <el-popover v-model:visible="scope.row.visible" placement="top" width="160">
              <p>确定要删除此记录吗？</p>
              <div style="text-align: right; margin: 0">
                <el-button size="small" type="primary" link @click="scope.row.visible = false">取消</el-button>
                <el-button size="small" type="primary" @click="deleteRow(scope.row)">确定</el-button>
              </div>
              <template #reference>
                <el-button icon="Delete" type="danger" link @click="scope.row.visible = true">删除</el-button>
              </template>
            </el-popover>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页 -->
      <div class="pagination-section">
        <el-pagination
          :current-page="page"
          :page-size="pageSize"
          :page-sizes="[10, 30, 50, 100]"
          :total="total"
          layout="total, sizes, prev, pager, next, jumper"
          @current-change="handleCurrentChange"
          @size-change="handleSizeChange"
          background
        />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { getLoginLogList } from '@/api/ddz/userAccount'
import { ElMessage, ElMessageBox } from 'element-plus'
import { 
  Search, Refresh, User, Document, CircleCheck, CircleClose, 
  TrendCharts, Delete, Download, Location, Clock 
} from '@element-plus/icons-vue'

defineOptions({
  name: 'DDZLoginLog'
})

const searchInfo = ref({
  playerId: '',
  loginType: null,
  loginResult: null,
  ip: ''
})

const page = ref(1)
const total = ref(0)
const pageSize = ref(10)
const tableData = ref([])
const loading = ref(false)
const multipleSelection = ref([])

// 计算概览统计
const overviewStats = computed(() => {
  const records = tableData.value
  if (!records.length) {
    return { total: 0, successCount: 0, failCount: 0, successRate: 0 }
  }
  
  const successCount = records.filter(r => r.loginResult === 1).length
  const failCount = records.filter(r => r.loginResult !== 1).length
  const successRate = records.length > 0 
    ? ((successCount / records.length) * 100).toFixed(1) 
    : 0
  
  return {
    total: total.value,
    successCount,
    failCount,
    successRate
  }
})

const getLoginTypeText = (type) => {
  const map = { 1: '手机号', 2: '微信', 3: '游客' }
  return map[type] || '未知'
}

const getLoginTypeTagType = (type) => {
  const map = { 1: 'primary', 2: 'success', 3: 'warning' }
  return map[type] || 'info'
}

const handleSelectionChange = (val) => {
  multipleSelection.value = val
}

const onSubmit = () => {
  page.value = 1
  getTableData()
}

const onReset = () => {
  searchInfo.value = {
    playerId: '',
    loginType: null,
    loginResult: null,
    ip: ''
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
  loading.value = true
  try {
    const params = {
      page: page.value,
      pageSize: pageSize.value,
      ...searchInfo.value
    }
    // 移除空值参数
    Object.keys(params).forEach(key => {
      if (params[key] === '' || params[key] === null) {
        delete params[key]
      }
    })

    const res = await getLoginLogList(params)
    if (res.code === 0) {
      tableData.value = res.data.list || []
      total.value = res.data.total || 0
      page.value = res.data.page || 1
      pageSize.value = res.data.pageSize || 10
    } else {
      ElMessage.error(res.msg || '获取登录日志列表失败')
    }
  } catch (error) {
    console.error('获取登录日志列表失败:', error)
    ElMessage.error('获取登录日志列表失败')
  } finally {
    loading.value = false
  }
}

const deleteRow = async (row) => {
  row.visible = false
  // TODO: 实现删除单条记录的API
  ElMessage.info('删除功能待实现')
}

const onDelete = async () => {
  ElMessageBox.confirm('确定要删除选中的记录吗？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    const ids = multipleSelection.value.map(item => item.ID)
    // TODO: 实现批量删除的API
    ElMessage.info('批量删除功能待实现')
  })
}

const onExport = () => {
  ElMessage.info('导出功能待实现')
}

getTableData()
</script>

<style scoped>
.login-log-page {
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

.stat-card--total::before { background: linear-gradient(180deg, #667eea 0%, #764ba2 100%); }
.stat-card--success::before { background: linear-gradient(180deg, #11998e 0%, #38ef7d 100%); }
.stat-card--fail::before { background: linear-gradient(180deg, #f093fb 0%, #f5576c 100%); }
.stat-card--rate::before { background: linear-gradient(180deg, #4facfe 0%, #00f2fe 100%); }

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

.stat-card--total .stat-card__icon { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); }
.stat-card--success .stat-card__icon { background: linear-gradient(135deg, #11998e 0%, #38ef7d 100%); }
.stat-card--fail .stat-card__icon { background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); }
.stat-card--rate .stat-card__icon { background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%); }

.stat-card__content { flex: 1; }
.stat-card__value { font-size: 28px; font-weight: 700; color: #1a1a2e; line-height: 1.2; }
.stat-card__label { font-size: 14px; color: #8c8c8c; margin-top: 4px; }

/* 表格区域 */
.table-section {
  background: #fff;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
}

.table-toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
  padding-bottom: 16px;
  border-bottom: 1px solid #f0f0f0;
}

.toolbar-left, .toolbar-right {
  display: flex;
  gap: 10px;
}

.data-table {
  width: 100%;
}

/* 表格内单元格样式 */
.player-id, .account-id {
  font-family: 'Monaco', 'Consolas', monospace;
  color: #1890ff;
  font-weight: 500;
}

.device-id {
  font-family: 'Monaco', 'Consolas', monospace;
  font-size: 12px;
  color: #8c8c8c;
}

.ip-address {
  font-family: 'Monaco', 'Consolas', monospace;
  color: #595959;
}

.fail-reason {
  color: #ff4d4f;
}

.text-muted {
  color: #bfbfbf;
}

.user-agent {
  color: #8c8c8c;
  font-size: 12px;
  display: -webkit-box;
  -webkit-line-clamp: 1;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.location-cell {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
  color: #595959;
}

.time-cell {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
  color: #595959;
  font-size: 13px;
}

/* 分页区域 */
.pagination-section {
  display: flex;
  justify-content: flex-end;
  padding-top: 20px;
  margin-top: 16px;
  border-top: 1px solid #f0f0f0;
}
</style>
