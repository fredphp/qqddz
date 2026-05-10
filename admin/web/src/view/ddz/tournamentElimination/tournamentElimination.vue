<template>
  <div class="tournament-elimination-management">
    <!-- 搜索区域 -->
    <div class="gva-search-box">
      <el-form ref="searchForm" :inline="true" :model="searchInfo">
        <el-form-item label="期号">
          <el-input v-model="searchInfo.periodNo" placeholder="期号" clearable />
        </el-form-item>
        <el-form-item label="玩家ID">
          <el-input v-model="searchInfo.playerId" placeholder="玩家ID" clearable />
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
        <el-table-column align="center" label="玩家ID" min-width="120" prop="playerId" />
        <el-table-column align="center" label="淘汰轮次" min-width="100" prop="eliminatedRound" />
        <el-table-column align="center" label="最终排名" min-width="100" prop="finalRank" />
        <el-table-column align="center" label="淘汰原因" min-width="120" prop="eliminationReason" />
        <el-table-column align="center" label="淘汰时间" min-width="160" prop="eliminatedAt" />
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
import { getTournamentEliminationList } from '@/api/ddz/tournamentElimination'

defineOptions({
  name: 'DDZTournamentElimination'
})

const searchInfo = ref({ periodNo: '', playerId: '' })
const page = ref(1)
const total = ref(0)
const pageSize = ref(10)
const tableData = ref([])

const onSubmit = () => { page.value = 1; getTableData() }
const onReset = () => { searchInfo.value = { periodNo: '', playerId: '' }; getTableData() }
const handleSizeChange = (val) => { pageSize.value = val; getTableData() }
const handleCurrentChange = (val) => { page.value = val; getTableData() }

const getTableData = async () => {
  const res = await getTournamentEliminationList({ page: page.value, pageSize: pageSize.value, ...searchInfo.value })
  if (res.code === 0) {
    tableData.value = res.data.list || []
    total.value = res.data.total || 0
  }
}

getTableData()
</script>
