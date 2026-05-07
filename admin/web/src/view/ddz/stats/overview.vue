<template>
  <div>
    <div class="gva-search-box">
      <el-form ref="searchForm" :inline="true" :model="searchInfo">
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
      <!-- 统计卡片 -->
      <el-row :gutter="20" style="margin-bottom: 20px;">
        <el-col :span="6">
          <el-card shadow="hover">
            <div style="text-align: center;">
              <div style="font-size: 14px; color: #909399;">总玩家数</div>
              <div style="font-size: 28px; font-weight: bold; color: #409EFF;">{{ overviewData.totalPlayers }}</div>
            </div>
          </el-card>
        </el-col>
        <el-col :span="6">
          <el-card shadow="hover">
            <div style="text-align: center;">
              <div style="font-size: 14px; color: #909399;">今日活跃</div>
              <div style="font-size: 28px; font-weight: bold; color: #67C23A;">{{ overviewData.todayActive }}</div>
            </div>
          </el-card>
        </el-col>
        <el-col :span="6">
          <el-card shadow="hover">
            <div style="text-align: center;">
              <div style="font-size: 14px; color: #909399;">今日游戏场次</div>
              <div style="font-size: 28px; font-weight: bold; color: #E6A23C;">{{ overviewData.todayGames }}</div>
            </div>
          </el-card>
        </el-col>
        <el-col :span="6">
          <el-card shadow="hover">
            <div style="text-align: center;">
              <div style="font-size: 14px; color: #909399;">今日新增玩家</div>
              <div style="font-size: 28px; font-weight: bold; color: #F56C6C;">{{ overviewData.todayNewPlayers }}</div>
            </div>
          </el-card>
        </el-col>
      </el-row>

      <el-table :data="tableData" row-key="statDate">
        <el-table-column align="center" label="统计日期" min-width="120" prop="statDate" />
        <el-table-column align="center" label="活跃玩家" min-width="100" prop="activePlayers" />
        <el-table-column align="center" label="新增玩家" min-width="100" prop="newPlayers" />
        <el-table-column align="center" label="游戏场次" min-width="100" prop="totalGames" />
        <el-table-column align="center" label="地主胜场" min-width="100" prop="landlordWins" />
        <el-table-column align="center" label="农民胜场" min-width="100" prop="farmerWins" />
        <el-table-column align="center" label="总金币流动" min-width="120">
          <template #default="scope">
            <span>{{ formatNumber(scope.row.totalGoldFlow) }}</span>
          </template>
        </el-table-column>
        <el-table-column align="center" label="平均游戏时长" min-width="100" prop="avgDuration" />
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

defineOptions({
  name: 'DDZOverview'
})

const searchInfo = ref({
  statDate: []
})

const page = ref(1)
const total = ref(0)
const pageSize = ref(10)
const tableData = ref([])

const overviewData = ref({
  totalPlayers: 0,
  todayActive: 0,
  todayGames: 0,
  todayNewPlayers: 0
})

const formatNumber = (num) => {
  if (!num) return '0'
  return num.toLocaleString()
}

const onSubmit = () => {
  page.value = 1
  getTableData()
}

const onReset = () => {
  searchInfo.value = {
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
  // TODO: 调用API获取数据
  tableData.value = []
  total.value = 0
}

getTableData()
</script>
