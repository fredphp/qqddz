<template>
  <div class="ad-reward-management">
    <!-- 搜索区域 -->
    <div class="gva-search-box">
      <el-form ref="searchForm" :inline="true" :model="searchInfo">
        <el-form-item label="玩家ID">
          <el-input v-model="searchInfo.playerId" placeholder="玩家ID" clearable />
        </el-form-item>
        <el-form-item label="广告类型">
          <el-select v-model="searchInfo.adType" placeholder="广告类型" clearable style="width: 150px">
            <el-option label="金币广告" value="bean" />
            <el-option label="竞技币广告" value="arena_coin" />
          </el-select>
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
        <el-table-column align="center" label="玩家ID" min-width="120" prop="playerId" />
        <el-table-column align="center" label="广告类型" min-width="100">
          <template #default="scope">
            <el-tag :type="scope.row.adType === 'bean' ? 'warning' : 'primary'" size="small">
              {{ scope.row.adType === 'bean' ? '金币广告' : '竞技币广告' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column align="center" label="奖励数量" min-width="100">
          <template #default="scope">
            <span class="text-success">+{{ formatNumber(scope.row.rewardAmount) }}</span>
          </template>
        </el-table-column>
        <el-table-column align="center" label="货币类型" min-width="100">
          <template #default="scope">
            {{ scope.row.currencyType === 'gold' ? '金币' : '竞技币' }}
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
import { getAdRewardList } from '@/api/ddz/adReward'

defineOptions({
  name: 'DDZAdReward'
})

// 搜索相关
const searchInfo = ref({
  playerId: '',
  adType: '',
  dateRange: []
})

// 分页相关
const page = ref(1)
const total = ref(0)
const pageSize = ref(10)
const tableData = ref([])

// 格式化数字
const formatNumber = (num) => {
  if (num === null || num === undefined) return '0'
  return num.toLocaleString()
}

// 搜索方法
const onSubmit = () => {
  page.value = 1
  getTableData()
}

const onReset = () => {
  searchInfo.value = {
    playerId: '',
    adType: '',
    dateRange: []
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

// 获取表格数据
const getTableData = async () => {
  const params = {
    page: page.value,
    pageSize: pageSize.value,
    playerId: searchInfo.value.playerId,
    adType: searchInfo.value.adType
  }
  if (searchInfo.value.dateRange && searchInfo.value.dateRange.length === 2) {
    params.startDate = searchInfo.value.dateRange[0]
    params.endDate = searchInfo.value.dateRange[1]
  }
  const res = await getAdRewardList(params)
  if (res.code === 0) {
    tableData.value = res.data.list || []
    total.value = res.data.total || 0
  }
}

// 初始化
getTableData()
</script>

<style scoped>
.text-success {
  color: #67c23a;
  font-weight: bold;
}
</style>
