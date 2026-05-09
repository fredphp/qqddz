<template>
  <div class="arena-signup-log-management">
    <!-- 搜索区域 -->
    <div class="gva-search-box">
      <el-form ref="searchForm" :inline="true" :model="searchInfo">
        <el-form-item label="期号">
          <el-input v-model="searchInfo.periodNo" placeholder="期号" clearable />
        </el-form-item>
        <el-form-item label="玩家ID">
          <el-input v-model="searchInfo.playerId" placeholder="玩家ID" clearable />
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
        <el-table-column align="center" label="玩家ID" min-width="120" prop="playerId" />
        <el-table-column align="center" label="报名费" min-width="100">
          <template #default="scope">
            <span>{{ formatNumber(scope.row.entryFee) }}</span>
          </template>
        </el-table-column>
        <el-table-column align="center" label="报名前竞技币" min-width="120">
          <template #default="scope">
            <span>{{ formatNumber(scope.row.beforeBalance) }}</span>
          </template>
        </el-table-column>
        <el-table-column align="center" label="报名后竞技币" min-width="120">
          <template #default="scope">
            <span>{{ formatNumber(scope.row.afterBalance) }}</span>
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
import { getArenaSignupLogList } from '@/api/ddz/arenaSignupLog'

defineOptions({
  name: 'DDZArenaSignupLog'
})

const searchInfo = ref({
  periodNo: '',
  playerId: '',
  dateRange: []
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
  searchInfo.value = { periodNo: '', playerId: '', dateRange: [] }
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
  const params = {
    page: page.value,
    pageSize: pageSize.value,
    periodNo: searchInfo.value.periodNo,
    playerId: searchInfo.value.playerId
  }
  if (searchInfo.value.dateRange && searchInfo.value.dateRange.length === 2) {
    params.startDate = searchInfo.value.dateRange[0]
    params.endDate = searchInfo.value.dateRange[1]
  }
  const res = await getArenaSignupLogList(params)
  if (res.code === 0) {
    tableData.value = res.data.list || []
    total.value = res.data.total || 0
  }
}

getTableData()
</script>
