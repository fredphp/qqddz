<template>
  <div class="deal-record-management">
    <!-- 搜索区域 -->
    <div class="gva-search-box">
      <el-form ref="searchForm" :inline="true" :model="searchInfo">
        <el-form-item label="游戏ID">
          <el-input v-model="searchInfo.gameId" placeholder="游戏ID" clearable />
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
        <el-table-column align="center" label="游戏ID" min-width="120" prop="gameId" />
        <el-table-column align="center" label="玩家ID" min-width="120" prop="playerId" />
        <el-table-column align="center" label="手牌" min-width="200">
          <template #default="scope">
            <div class="card-display">
              {{ scope.row.cards }}
            </div>
          </template>
        </el-table-column>
        <el-table-column align="center" label="是否地主" min-width="100">
          <template #default="scope">
            <el-tag :type="scope.row.isLandlord ? 'warning' : 'info'" size="small">
              {{ scope.row.isLandlord ? '地主' : '农民' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column align="center" label="底牌" min-width="150">
          <template #default="scope">
            <span v-if="scope.row.bottomCards">{{ scope.row.bottomCards }}</span>
            <span v-else>-</span>
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
import { getDealRecordList } from '@/api/ddz/dealRecord'

defineOptions({
  name: 'DDZDealRecord'
})

const searchInfo = ref({ gameId: '', playerId: '' })
const page = ref(1)
const total = ref(0)
const pageSize = ref(10)
const tableData = ref([])

const onSubmit = () => { page.value = 1; getTableData() }
const onReset = () => { searchInfo.value = { gameId: '', playerId: '' }; getTableData() }
const handleSizeChange = (val) => { pageSize.value = val; getTableData() }
const handleCurrentChange = (val) => { page.value = val; getTableData() }

const getTableData = async () => {
  const res = await getDealRecordList({ page: page.value, pageSize: pageSize.value, ...searchInfo.value })
  if (res.code === 0) {
    tableData.value = res.data.list || []
    total.value = res.data.total || 0
  }
}

getTableData()
</script>

<style scoped>
.card-display {
  font-family: monospace;
  font-size: 14px;
  white-space: pre-wrap;
}
</style>
