<template>
  <div class="leaderboard-management">
    <!-- 搜索区域 -->
    <div class="gva-search-box">
      <el-form ref="searchForm" :inline="true" :model="searchInfo">
        <el-form-item label="排行榜类型">
          <el-select v-model="searchInfo.type" placeholder="排行榜类型" clearable style="width: 150px">
            <el-option label="金币榜" :value="1" />
            <el-option label="胜率榜" :value="2" />
            <el-option label="场次榜" :value="3" />
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
        <el-table-column align="center" label="排名" min-width="80">
          <template #default="scope">
            <el-tag v-if="scope.$index < 3" :type="['danger', 'warning', ''][scope.$index]" size="small">
              {{ scope.$index + 1 }}
            </el-tag>
            <span v-else>{{ scope.$index + 1 }}</span>
          </template>
        </el-table-column>
        <el-table-column align="center" label="玩家ID" min-width="120" prop="playerId" />
        <el-table-column align="center" label="昵称" min-width="120" prop="nickname" />
        <el-table-column align="center" label="金币" min-width="120">
          <template #default="scope">
            <span class="currency-value gold">{{ formatNumber(scope.row.coins) }}</span>
          </template>
        </el-table-column>
        <el-table-column align="center" label="胜场" min-width="80" prop="winCount" />
        <el-table-column align="center" label="败场" min-width="80" prop="loseCount" />
        <el-table-column align="center" label="胜率" min-width="100">
          <template #default="scope">
            <span>{{ scope.row.winRate }}%</span>
          </template>
        </el-table-column>
        <el-table-column align="center" label="更新时间" min-width="160" prop="updatedAt" />
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
import { getLeaderboardList } from '@/api/ddz/leaderboard'

defineOptions({
  name: 'DDZLeaderboard'
})

const searchInfo = ref({ type: null })
const page = ref(1)
const total = ref(0)
const pageSize = ref(10)
const tableData = ref([])

const formatNumber = (num) => {
  if (num === null || num === undefined) return '0'
  if (num >= 100000000) return (num / 100000000).toFixed(2) + '亿'
  if (num >= 10000) return (num / 10000).toFixed(2) + '万'
  return num.toLocaleString()
}

const onSubmit = () => { page.value = 1; getTableData() }
const onReset = () => { searchInfo.value = { type: null }; getTableData() }
const handleSizeChange = (val) => { pageSize.value = val; getTableData() }
const handleCurrentChange = (val) => { page.value = val; getTableData() }

const getTableData = async () => {
  const res = await getLeaderboardList({ page: page.value, pageSize: pageSize.value, ...searchInfo.value })
  if (res.code === 0) {
    tableData.value = res.data.list || []
    total.value = res.data.total || 0
  }
}

getTableData()
</script>

<style scoped>
.currency-value.gold {
  color: #e6a23c;
  font-weight: bold;
}
</style>
