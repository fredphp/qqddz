<template>
  <div class="room-player-management">
    <!-- 搜索区域 -->
    <div class="gva-search-box">
      <el-form ref="searchForm" :inline="true" :model="searchInfo">
        <el-form-item label="房间ID">
          <el-input v-model="searchInfo.roomId" placeholder="房间ID" clearable />
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
        <el-table-column align="center" label="房间ID" min-width="100" prop="roomId" />
        <el-table-column align="center" label="玩家ID" min-width="120" prop="playerId" />
        <el-table-column align="center" label="座位号" min-width="80" prop="seatIndex" />
        <el-table-column align="center" label="是否准备" min-width="100">
          <template #default="scope">
            <el-tag :type="scope.row.isReady ? 'success' : 'info'" size="small">
              {{ scope.row.isReady ? '已准备' : '未准备' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column align="center" label="在线状态" min-width="100">
          <template #default="scope">
            <el-tag :type="scope.row.isOnline ? 'success' : 'danger'" size="small">
              {{ scope.row.isOnline ? '在线' : '离线' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column align="center" label="加入时间" min-width="160" prop="joinedAt" />
        <el-table-column align="center" label="离开时间" min-width="160" prop="leftAt" />
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
import { getRoomPlayerList } from '@/api/ddz/roomPlayer'

defineOptions({
  name: 'DDZRoomPlayer'
})

const searchInfo = ref({ roomId: '', playerId: '' })
const page = ref(1)
const total = ref(0)
const pageSize = ref(10)
const tableData = ref([])

const onSubmit = () => { page.value = 1; getTableData() }
const onReset = () => { searchInfo.value = { roomId: '', playerId: '' }; getTableData() }
const handleSizeChange = (val) => { pageSize.value = val; getTableData() }
const handleCurrentChange = (val) => { page.value = val; getTableData() }

const getTableData = async () => {
  const res = await getRoomPlayerList({ page: page.value, pageSize: pageSize.value, ...searchInfo.value })
  if (res.code === 0) {
    tableData.value = res.data.list || []
    total.value = res.data.total || 0
  }
}

getTableData()
</script>
