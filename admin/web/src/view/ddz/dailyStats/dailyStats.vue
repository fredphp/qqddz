<template>
  <div class="daily-stats-management">
    <!-- 搜索区域 -->
    <div class="gva-search-box">
      <el-form ref="searchForm" :inline="true" :model="searchInfo">
        <el-form-item label="日期范围">
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
        <el-table-column align="center" label="日期" min-width="120" prop="date" />
        <el-table-column align="center" label="新增用户" min-width="100" prop="newUsers" />
        <el-table-column align="center" label="活跃用户" min-width="100" prop="activeUsers" />
        <el-table-column align="center" label="总对局数" min-width="100" prop="totalGames" />
        <el-table-column align="center" label="总流水" min-width="120">
          <template #default="scope">
            <span>{{ formatNumber(scope.row.totalRevenue) }}</span>
          </template>
        </el-table-column>
        <el-table-column align="center" label="平均在线" min-width="100" prop="avgOnline" />
        <el-table-column align="center" label="峰值在线" min-width="100" prop="peakOnline" />
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
import { getDailyStatsList } from '@/api/ddz/dailyStats'

defineOptions({
  name: 'DDZDailyStats'
})

const searchInfo = ref({ dateRange: [] })
const page = ref(1)
const total = ref(0)
const pageSize = ref(10)
const tableData = ref([])

const formatNumber = (num) => {
  if (num === null || num === undefined) return '0'
  return num.toLocaleString()
}

const onSubmit = () => { page.value = 1; getTableData() }
const onReset = () => { searchInfo.value = { dateRange: [] }; getTableData() }
const handleSizeChange = (val) => { pageSize.value = val; getTableData() }
const handleCurrentChange = (val) => { page.value = val; getTableData() }

const getTableData = async () => {
  const params = { page: page.value, pageSize: pageSize.value }
  if (searchInfo.value.dateRange && searchInfo.value.dateRange.length === 2) {
    params.startDate = searchInfo.value.dateRange[0]
    params.endDate = searchInfo.value.dateRange[1]
  }
  const res = await getDailyStatsList(params)
  if (res.code === 0) {
    tableData.value = res.data.list || []
    total.value = res.data.total || 0
  }
}

getTableData()
</script>
