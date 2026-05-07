<template>
  <div>
    <div class="gva-search-box">
      <el-form ref="searchForm" :inline="true" :model="searchInfo">
        <el-form-item label="玩家ID">
          <el-input v-model="searchInfo.playerId" placeholder="玩家ID" />
        </el-form-item>
        <el-form-item label="统计日期">
          <el-date-picker
            v-model="searchInfo.statDate"
            type="daterange"
            range-separator="至"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
            value-format="YYYY-MM-DD"
          />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" icon="search" @click="onSubmit">查询</el-button>
          <el-button icon="refresh" @click="onReset">重置</el-button>
        </el-form-item>
      </el-form>
    </div>
    <div class="gva-table-box">
      <el-table :data="tableData" row-key="ID">
        <el-table-column align="center" label="玩家ID" min-width="100" prop="playerId" />
        <el-table-column align="center" label="统计日期" min-width="120" prop="statDate" />
        <el-table-column align="center" label="总场次" min-width="80" prop="totalGames" />
        <el-table-column align="center" label="胜场" min-width="80" prop="winGames" />
        <el-table-column align="center" label="负场" min-width="80" prop="loseGames" />
        <el-table-column align="center" label="胜率" min-width="80">
          <template #default="scope">
            <span :class="scope.row.winRate >= 50 ? 'text-success' : 'text-danger'">
              {{ scope.row.winRate }}%
            </span>
          </template>
        </el-table-column>
        <el-table-column align="center" label="地主场次" min-width="80" prop="landlordGames" />
        <el-table-column align="center" label="地主胜场" min-width="80" prop="landlordWins" />
        <el-table-column align="center" label="农民场次" min-width="80" prop="farmerGames" />
        <el-table-column align="center" label="农民胜场" min-width="80" prop="farmerWins" />
        <el-table-column align="center" label="金币变化" min-width="100">
          <template #default="scope">
            <span :class="scope.row.totalGoldChange >= 0 ? 'text-success' : 'text-danger'">
              {{ scope.row.totalGoldChange >= 0 ? '+' : '' }}{{ scope.row.totalGoldChange }}
            </span>
          </template>
        </el-table-column>
        <el-table-column align="center" label="炸弹数" min-width="80" prop="totalBombs" />
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
import { getPlayerStatList } from '@/api/ddz/gameLog'

defineOptions({
  name: 'DDZPlayerStat'
})

const searchInfo = ref({
  playerId: '',
  statDate: []
})

const page = ref(1)
const total = ref(0)
const pageSize = ref(10)
const tableData = ref([])

const onSubmit = () => {
  page.value = 1
  getTableData()
}

const onReset = () => {
  searchInfo.value = {
    playerId: '',
    statDate: []
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

const getTableData = async () => {
  const res = await getPlayerStatList({
    page: page.value,
    pageSize: pageSize.value,
    ...searchInfo.value
  })
  if (res.code === 0) {
    tableData.value = res.data.list
    total.value = res.data.total
  }
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
