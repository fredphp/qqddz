<template>
  <div class="arena-table-management">
    <!-- 搜索区域 -->
    <div class="gva-search-box">
      <el-form ref="searchForm" :inline="true" :model="searchInfo">
        <el-form-item label="期号">
          <el-input v-model="searchInfo.periodNo" placeholder="期号" clearable />
        </el-form-item>
        <el-form-item label="桌号">
          <el-input v-model="searchInfo.tableId" placeholder="桌号" clearable style="width: 120px" />
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
        <el-table-column align="center" label="桌号" min-width="80" prop="tableId" />
        <el-table-column align="center" label="房间ID" min-width="80" prop="roomId" />
        <el-table-column align="center" label="当前底注" min-width="100">
          <template #default="scope">
            <span>{{ formatNumber(scope.row.currentBaseScore) }}</span>
          </template>
        </el-table-column>
        <el-table-column align="center" label="当前轮次" min-width="100" prop="currentRound" />
        <el-table-column align="center" label="玩家数" min-width="80" prop="playerCount" />
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
import { getArenaTableList } from '@/api/ddz/arenaTable'

defineOptions({
  name: 'DDZArenaTable'
})

const searchInfo = ref({
  periodNo: '',
  tableId: ''
})

const page = ref(1)
const total = ref(0)
const pageSize = ref(10)
const tableData = ref([])

const formatNumber = (num) => {
  if (num === null || num === undefined) return '0'
  return num.toLocaleString()
}

const onSubmit = () => {
  page.value = 1
  getTableData()
}

const onReset = () => {
  searchInfo.value = { periodNo: '', tableId: '' }
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
  const res = await getArenaTableList({
    page: page.value,
    pageSize: pageSize.value,
    ...searchInfo.value
  })
  if (res.code === 0) {
    tableData.value = res.data.list || []
    total.value = res.data.total || 0
  }
}

getTableData()
</script>
