<template>
  <div class="player-online-management">
    <!-- 搜索区域 -->
    <div class="gva-search-box">
      <el-form ref="searchForm" :inline="true" :model="searchInfo">
        <el-form-item label="玩家ID">
          <el-input v-model="searchInfo.playerId" placeholder="玩家ID" clearable />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" icon="Search" @click="onSubmit">查询</el-button>
          <el-button icon="Refresh" @click="onReset">重置</el-button>
        </el-form-item>
      </el-form>
    </div>

    <!-- 统计卡片 -->
    <div class="stats-cards">
      <el-row :gutter="20">
        <el-col :span="6">
          <el-card shadow="hover" class="stats-card">
            <div class="stats-content">
              <div class="stats-value">{{ onlineCount }}</div>
              <div class="stats-label">当前在线人数</div>
            </div>
          </el-card>
        </el-col>
      </el-row>
    </div>

    <!-- 表格区域 -->
    <div class="gva-table-box">
      <el-table :data="tableData" row-key="ID" stripe>
        <el-table-column align="center" label="玩家ID" min-width="120" prop="playerId" />
        <el-table-column align="center" label="昵称" min-width="120" prop="nickname" />
        <el-table-column align="center" label="在线状态" min-width="100">
          <template #default="scope">
            <el-tag type="success" size="small">在线</el-tag>
          </template>
        </el-table-column>
        <el-table-column align="center" label="当前房间" min-width="100" prop="roomId" />
        <el-table-column align="center" label="登录IP" min-width="120" prop="loginIp" />
        <el-table-column align="center" label="登录时间" min-width="160" prop="loginAt" />
        <el-table-column align="center" label="在线时长" min-width="100">
          <template #default="scope">
            {{ formatDuration(scope.row.onlineDuration) }}
          </template>
        </el-table-column>
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
import { getPlayerOnlineList } from '@/api/ddz/playerOnline'

defineOptions({
  name: 'DDZPlayerOnline'
})

const searchInfo = ref({ playerId: '' })
const page = ref(1)
const total = ref(0)
const pageSize = ref(10)
const tableData = ref([])
const onlineCount = ref(0)

const formatDuration = (seconds) => {
  if (!seconds) return '-'
  const hours = Math.floor(seconds / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  return `${hours}时${minutes}分`
}

const onSubmit = () => { page.value = 1; getTableData() }
const onReset = () => { searchInfo.value = { playerId: '' }; getTableData() }
const handleSizeChange = (val) => { pageSize.value = val; getTableData() }
const handleCurrentChange = (val) => { page.value = val; getTableData() }

const getTableData = async () => {
  const res = await getPlayerOnlineList({ page: page.value, pageSize: pageSize.value, ...searchInfo.value })
  if (res.code === 0) {
    tableData.value = res.data.list || []
    total.value = res.data.total || 0
    onlineCount.value = res.data.onlineCount || 0
  }
}

getTableData()
</script>

<style scoped>
.stats-cards {
  margin-bottom: 20px;
}
.stats-card {
  text-align: center;
}
.stats-value {
  font-size: 28px;
  font-weight: bold;
  color: #409eff;
}
.stats-label {
  color: #909399;
  margin-top: 8px;
}
</style>
