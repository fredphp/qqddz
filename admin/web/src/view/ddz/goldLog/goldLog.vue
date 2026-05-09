<template>
  <div class="gold-log-management">
    <!-- 搜索区域 -->
    <div class="gva-search-box">
      <el-form ref="searchForm" :inline="true" :model="searchInfo">
        <el-form-item label="玩家ID">
          <el-input v-model="searchInfo.playerId" placeholder="玩家ID" clearable />
        </el-form-item>
        <el-form-item label="变化类型">
          <el-select v-model="searchInfo.changeType" placeholder="变化类型" clearable style="width: 150px">
            <el-option label="游戏结算" :value="1" />
            <el-option label="系统赠送" :value="2" />
            <el-option label="后台调整" :value="3" />
            <el-option label="兑换消耗" :value="4" />
            <el-option label="其他" :value="5" />
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
        <el-table-column align="center" label="变化前金币" min-width="120">
          <template #default="scope">
            <span>{{ formatNumber(scope.row.beforeGold) }}</span>
          </template>
        </el-table-column>
        <el-table-column align="center" label="变化金额" min-width="120">
          <template #default="scope">
            <span :class="scope.row.changeAmount >= 0 ? 'text-success' : 'text-danger'">
              {{ scope.row.changeAmount >= 0 ? '+' : '' }}{{ formatNumber(scope.row.changeAmount) }}
            </span>
          </template>
        </el-table-column>
        <el-table-column align="center" label="变化后金币" min-width="120">
          <template #default="scope">
            <span>{{ formatNumber(scope.row.afterGold) }}</span>
          </template>
        </el-table-column>
        <el-table-column align="center" label="变化类型" min-width="100">
          <template #default="scope">
            <el-tag :type="getChangeTypeTag(scope.row.changeType)" size="small">
              {{ getChangeTypeText(scope.row.changeType) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column align="center" label="关联ID" min-width="120" prop="relatedId" show-overflow-tooltip />
        <el-table-column align="center" label="备注" min-width="150" prop="remark" show-overflow-tooltip />
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
import { getGoldLogList } from '@/api/ddz/goldLog'

defineOptions({
  name: 'DDZGoldLog'
})

// 搜索相关
const searchInfo = ref({
  playerId: '',
  changeType: null,
  dateRange: []
})

// 分页相关
const page = ref(1)
const total = ref(0)
const pageSize = ref(10)
const tableData = ref([])

// 获取变化类型文本
const getChangeTypeText = (type) => {
  const types = {
    1: '游戏结算',
    2: '系统赠送',
    3: '后台调整',
    4: '兑换消耗',
    5: '其他'
  }
  return types[type] || '未知'
}

// 获取变化类型标签
const getChangeTypeTag = (type) => {
  const tags = {
    1: 'primary',
    2: 'success',
    3: 'warning',
    4: 'info',
    5: ''
  }
  return tags[type] || ''
}

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
    changeType: null,
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
    changeType: searchInfo.value.changeType
  }
  if (searchInfo.value.dateRange && searchInfo.value.dateRange.length === 2) {
    params.startDate = searchInfo.value.dateRange[0]
    params.endDate = searchInfo.value.dateRange[1]
  }
  const res = await getGoldLogList(params)
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
.text-danger {
  color: #f56c6c;
  font-weight: bold;
}
</style>
