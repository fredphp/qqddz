<template>
  <div class="arena-session-management">
    <!-- 搜索区域 -->
    <div class="gva-search-box">
      <el-form ref="searchForm" :inline="true" :model="searchInfo">
        <el-form-item label="期号">
          <el-input v-model="searchInfo.periodNo" placeholder="期号" clearable />
        </el-form-item>
        <el-form-item label="会话状态">
          <el-select v-model="searchInfo.status" placeholder="会话状态" clearable style="width: 120px">
            <el-option label="等待中" :value="1" />
            <el-option label="进行中" :value="2" />
            <el-option label="已结束" :value="3" />
          </el-select>
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
        <el-table-column align="center" label="当前金币" min-width="120">
          <template #default="scope">
            <span>{{ formatNumber(scope.row.currentGold) }}</span>
          </template>
        </el-table-column>
        <el-table-column align="center" label="状态" min-width="100">
          <template #default="scope">
            <el-tag :type="getStatusTag(scope.row.status)" size="small">
              {{ getStatusText(scope.row.status) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column align="center" label="加入时间" min-width="160" prop="joinedAt" />
        <el-table-column align="center" label="离开时间" min-width="160" prop="leftAt" />
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
import { getArenaSessionList } from '@/api/ddz/arenaSession'

defineOptions({
  name: 'DDZArenaSession'
})

// 搜索相关
const searchInfo = ref({
  periodNo: '',
  status: null
})

// 分页相关
const page = ref(1)
const total = ref(0)
const pageSize = ref(10)
const tableData = ref([])

// 获取状态文本
const getStatusText = (status) => {
  const texts = { 1: '等待中', 2: '进行中', 3: '已结束' }
  return texts[status] || '未知'
}

// 获取状态标签
const getStatusTag = (status) => {
  const tags = { 1: 'warning', 2: 'primary', 3: 'info' }
  return tags[status] || ''
}

// 格式化数字
const formatNumber = (num) => {
  if (num === null || num === undefined) return '0'
  return num.toLocaleString()
}

// 搜索方法
const onSubmit = () => {
  page.value = 1
  getTableData()
}

const onReset = () => {
  searchInfo.value = { periodNo: '', status: null }
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
  const res = await getArenaSessionList({
    page: page.value,
    pageSize: pageSize.value,
    ...searchInfo.value
  })
  if (res.code === 0) {
    tableData.value = res.data.list || []
    total.value = res.data.total || 0
  }
}

// 初始化
getTableData()
</script>
