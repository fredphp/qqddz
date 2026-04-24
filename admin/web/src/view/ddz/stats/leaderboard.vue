<template>
  <div>
    <div class="gva-search-box">
      <el-form ref="searchForm" :inline="true" :model="searchInfo">
        <el-form-item label="排行榜类型">
          <el-select v-model="searchInfo.type" placeholder="排行榜类型">
            <el-option label="金币排行" value="gold" />
            <el-option label="胜率排行" value="winRate" />
            <el-option label="场次排行" value="games" />
            <el-option label="等级排行" value="level" />
          </el-select>
        </el-form-item>
        <el-form-item label="时间范围">
          <el-select v-model="searchInfo.timeRange" placeholder="时间范围">
            <el-option label="今日" value="today" />
            <el-option label="本周" value="week" />
            <el-option label="本月" value="month" />
            <el-option label="总榜" value="all" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" icon="search" @click="onSubmit">查询</el-button>
          <el-button icon="refresh" @click="onReset">重置</el-button>
        </el-form-item>
      </el-form>
    </div>
    <div class="gva-table-box">
      <el-table :data="tableData" row-key="playerId">
        <el-table-column align="center" label="排名" min-width="80">
          <template #default="scope">
            <el-tag v-if="scope.$index === 0" type="danger" effect="dark" size="large">🥇 第1名</el-tag>
            <el-tag v-else-if="scope.$index === 1" type="warning" effect="dark" size="large">🥈 第2名</el-tag>
            <el-tag v-else-if="scope.$index === 2" type="success" effect="dark" size="large">🥉 第3名</el-tag>
            <span v-else style="font-weight: bold;">第{{ scope.$index + 1 }}名</span>
          </template>
        </el-table-column>
        <el-table-column align="center" label="玩家ID" min-width="100" prop="playerId" />
        <el-table-column align="center" label="昵称" min-width="120" prop="nickname" />
        <el-table-column align="center" label="头像" min-width="80">
          <template #default="scope">
            <el-avatar :size="40" :src="scope.row.avatar">
              {{ scope.row.nickname?.charAt(0) || '?' }}
            </el-avatar>
          </template>
        </el-table-column>
        <el-table-column align="center" label="等级" min-width="80" prop="level" />
        <el-table-column align="center" label="金币" min-width="120">
          <template #default="scope">
            <span style="color: #E6A23C; font-weight: bold;">{{ formatNumber(scope.row.gold) }}</span>
          </template>
        </el-table-column>
        <el-table-column align="center" label="总场次" min-width="80" prop="totalGames" />
        <el-table-column align="center" label="胜场" min-width="80" prop="winGames" />
        <el-table-column align="center" label="胜率" min-width="80">
          <template #default="scope">
            <span :class="scope.row.winRate >= 50 ? 'text-success' : 'text-danger'">
              {{ scope.row.winRate }}%
            </span>
          </template>
        </el-table-column>
      </el-table>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'

defineOptions({
  name: 'DDZLeaderboard'
})

const searchInfo = ref({
  type: 'gold',
  timeRange: 'all'
})

const tableData = ref([])

const formatNumber = (num) => {
  if (!num) return '0'
  return num.toLocaleString()
}

const onSubmit = () => {
  getTableData()
}

const onReset = () => {
  searchInfo.value = {
    type: 'gold',
    timeRange: 'all'
  }
  getTableData()
}

const getTableData = async () => {
  // TODO: 调用API获取数据
  tableData.value = []
}

getTableData()
</script>

<style scoped>
.text-success {
  color: #67c23a;
}
.text-danger {
  color: #f56c6c;
}
</style>
