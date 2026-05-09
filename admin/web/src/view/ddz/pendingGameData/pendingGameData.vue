<template>
  <div class="pending-game-data-management">
    <!-- 搜索区域 -->
    <div class="gva-search-box">
      <el-form ref="searchForm" :inline="true" :model="searchInfo">
        <el-form-item label="数据类型">
          <el-select v-model="searchInfo.dataType" placeholder="数据类型" clearable style="width: 150px">
            <el-option label="游戏记录" :value="1" />
            <el-option label="玩家记录" :value="2" />
            <el-option label="出牌记录" :value="3" />
          </el-select>
        </el-form-item>
        <el-form-item label="处理状态">
          <el-select v-model="searchInfo.status" placeholder="处理状态" clearable style="width: 120px">
            <el-option label="待处理" :value="0" />
            <el-option label="已处理" :value="1" />
            <el-option label="处理失败" :value="2" />
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
        <el-table-column align="center" label="ID" min-width="80" prop="ID" />
        <el-table-column align="center" label="数据类型" min-width="100">
          <template #default="scope">
            <el-tag type="info" size="small">{{ getDataTypeText(scope.row.dataType) }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column align="center" label="数据ID" min-width="120" prop="dataId" />
        <el-table-column align="center" label="重试次数" min-width="80" prop="retryCount" />
        <el-table-column align="center" label="状态" min-width="100">
          <template #default="scope">
            <el-tag :type="getStatusTag(scope.row.status)" size="small">
              {{ getStatusText(scope.row.status) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column align="center" label="错误信息" min-width="200" prop="errorMessage" show-overflow-tooltip />
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
import { getPendingGameDataList } from '@/api/ddz/pendingGameData'

defineOptions({
  name: 'DDZPendingGameData'
})

const searchInfo = ref({ dataType: null, status: null })
const page = ref(1)
const total = ref(0)
const pageSize = ref(10)
const tableData = ref([])

const getDataTypeText = (type) => {
  const types = { 1: '游戏记录', 2: '玩家记录', 3: '出牌记录' }
  return types[type] || '未知'
}

const getStatusText = (status) => {
  const texts = { 0: '待处理', 1: '已处理', 2: '处理失败' }
  return texts[status] || '未知'
}

const getStatusTag = (status) => {
  const tags = { 0: 'warning', 1: 'success', 2: 'danger' }
  return tags[status] || ''
}

const onSubmit = () => { page.value = 1; getTableData() }
const onReset = () => { searchInfo.value = { dataType: null, status: null }; getTableData() }
const handleSizeChange = (val) => { pageSize.value = val; getTableData() }
const handleCurrentChange = (val) => { page.value = val; getTableData() }

const getTableData = async () => {
  const res = await getPendingGameDataList({ page: page.value, pageSize: pageSize.value, ...searchInfo.value })
  if (res.code === 0) {
    tableData.value = res.data.list || []
    total.value = res.data.total || 0
  }
}

getTableData()
</script>
