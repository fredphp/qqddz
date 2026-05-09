<template>
  <div class="arena-gold-log-management">
    <!-- 搜索区域 -->
    <div class="gva-search-box">
      <el-form ref="searchForm" :inline="true" :model="searchInfo">
        <el-form-item label="期号">
          <el-input v-model="searchInfo.periodNo" placeholder="期号" clearable />
        </el-form-item>
        <el-form-item label="玩家ID">
          <el-input v-model="searchInfo.playerId" placeholder="玩家ID" clearable />
        </el-form-item>
        <el-form-item label="变动原因">
          <el-select v-model="searchInfo.reason" placeholder="变动原因" clearable style="width: 150px">
            <el-option label="初始化" value="INIT" />
            <el-option label="赢取" value="WIN" />
            <el-option label="输掉" value="LOSE" />
          </el-select>
        </el-form-item>
        <el-form-item label="时间范围">
          <el-date-picker
            v-model="searchInfo.dateRange"
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
        <el-table-column align="center" label="ID" min-width="80" prop="ID" />
        <el-table-column align="center" label="期号" min-width="140" prop="periodNo" />
        <el-table-column align="center" label="房间ID" min-width="80" prop="roomId" />
        <el-table-column align="center" label="玩家ID" min-width="100" prop="playerId" />
        <el-table-column align="center" label="对局ID" min-width="100" prop="matchId" />
        <el-table-column align="center" label="变动前金币" min-width="120">
          <template #default="scope">
            <span>{{ formatNumber(scope.row.beforeGold) }}</span>
          </template>
        </el-table-column>
        <el-table-column align="center" label="变动金币" min-width="120">
          <template #default="scope">
            <span :class="scope.row.changeGold >= 0 ? 'text-success' : 'text-danger'">
              {{ scope.row.changeGold >= 0 ? '+' : '' }}{{ formatNumber(scope.row.changeGold) }}
            </span>
          </template>
        </el-table-column>
        <el-table-column align="center" label="变动后金币" min-width="120">
          <template #default="scope">
            <span>{{ formatNumber(scope.row.afterGold) }}</span>
          </template>
        </el-table-column>
        <el-table-column align="center" label="变动原因" min-width="100">
          <template #default="scope">
            <el-tag :type="getReasonTag(scope.row.reason)" size="small">
              {{ scope.row.reason }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column align="center" label="创建时间" min-width="160" prop="createdAt" />
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
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { getArenaGoldLogList } from '@/api/ddz/arenaGoldLog'

defineOptions({
  name: 'DDZArenaGoldLog'
})

// 搜索相关
const searchInfo = ref({
  periodNo: '',
  playerId: '',
  reason: '',
  dateRange: []
})

// 分页相关
const page = ref(1)
const total = ref(0)
const pageSize = ref(10)
const tableData = ref([])

// 获取变动原因标签
const getReasonTag = (reason) => {
  const tags = {
    INIT: 'info',
    WIN: 'success',
    LOSE: 'danger'
  }
  return tags[reason] || ''
}

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

// 搜索方法
const onSubmit = () => {
  page.value = 1
  getTableData()
}

const onReset = () => {
  searchInfo.value = {
    periodNo: '',
    playerId: '',
    reason: '',
    dateRange: []
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

// 获取表格数据
const getTableData = async () => {
  const params = {
    page: page.value,
    pageSize: pageSize.value,
    periodNo: searchInfo.value.periodNo,
    playerId: searchInfo.value.playerId,
    reason: searchInfo.value.reason
  }
  if (searchInfo.value.dateRange && searchInfo.value.dateRange.length === 2) {
    params.startDate = searchInfo.value.dateRange[0]
    params.endDate = searchInfo.value.dateRange[1]
  }
  const res = await getArenaGoldLogList(params)
  if (res.code === 0) {
    tableData.value = res.data.list || []
    total.value = res.data.total || 0
  }
}

// 初始化
getTableData()
</script>

<style scoped>
.text-success {
  color: #67c23a;
  font-weight: bold;
}
.text-danger {
  color: #f56c6c;
  font-weight: bold;
}
</style>
