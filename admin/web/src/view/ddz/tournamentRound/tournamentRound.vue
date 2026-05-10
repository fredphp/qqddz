<template>
  <div class="tournament-round-management">
    <!-- 搜索区域 -->
    <div class="gva-search-box">
      <el-form ref="searchForm" :inline="true" :model="searchInfo">
        <el-form-item label="期号">
          <el-input v-model="searchInfo.periodNo" placeholder="期号" clearable />
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
        <el-table-column align="center" label="轮次" min-width="80" prop="roundNumber" />
        <el-table-column align="center" label="轮次类型" min-width="100">
          <template #default="scope">
            <el-tag type="primary" size="small">{{ getRoundTypeText(scope.row.roundType) }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column align="center" label="玩家数" min-width="80" prop="playerCount" />
        <el-table-column align="center" label="状态" min-width="100">
          <template #default="scope">
            <el-tag :type="getStatusTag(scope.row.status)" size="small">
              {{ getStatusText(scope.row.status) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column align="center" label="开始时间" min-width="160" prop="startTime" />
        <el-table-column align="center" label="结束时间" min-width="160" prop="endTime" />
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
import { getTournamentRoundList } from '@/api/ddz/tournamentRound'

defineOptions({
  name: 'DDZTournamentRound'
})

const searchInfo = ref({ periodNo: '' })
const page = ref(1)
const total = ref(0)
const pageSize = ref(10)
const tableData = ref([])

const getRoundTypeText = (type) => {
  const types = { 1: '预选赛', 2: '正赛', 3: '决赛' }
  return types[type] || '未知'
}

const getStatusText = (status) => {
  const texts = { 1: '待开始', 2: '进行中', 3: '已结束' }
  return texts[status] || '未知'
}

const getStatusTag = (status) => {
  const tags = { 1: 'info', 2: 'primary', 3: 'success' }
  return tags[status] || ''
}

const onSubmit = () => { page.value = 1; getTableData() }
const onReset = () => { searchInfo.value = { periodNo: '' }; getTableData() }
const handleSizeChange = (val) => { pageSize.value = val; getTableData() }
const handleCurrentChange = (val) => { page.value = val; getTableData() }

const getTableData = async () => {
  const res = await getTournamentRoundList({ page: page.value, pageSize: pageSize.value, ...searchInfo.value })
  if (res.code === 0) {
    tableData.value = res.data.list || []
    total.value = res.data.total || 0
  }
}

getTableData()
</script>
