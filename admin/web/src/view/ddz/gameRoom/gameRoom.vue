<template>
  <div>
    <div class="gva-search-box">
      <el-form ref="searchForm" :inline="true" :model="searchInfo">
        <el-form-item label="月份">
          <el-date-picker
            v-model="searchInfo.month"
            type="month"
            placeholder="选择月份"
            format="YYYY-MM"
            value-format="YYYYMM"
            clearable
          />
        </el-form-item>
        <el-form-item label="房间ID">
          <el-input v-model="searchInfo.roomId" placeholder="房间ID" />
        </el-form-item>
        <el-form-item label="房间名称">
          <el-input v-model="searchInfo.roomName" placeholder="房间名称" />
        </el-form-item>
        <el-form-item label="房间类型">
          <el-select v-model="searchInfo.roomType" placeholder="房间类型" clearable>
            <el-option label="新手场" :value="1" />
            <el-option label="普通场" :value="2" />
            <el-option label="高级场" :value="3" />
            <el-option label="富豪场" :value="4" />
            <el-option label="至尊场" :value="5" />
          </el-select>
        </el-form-item>
        <el-form-item label="房间分类">
          <el-select v-model="searchInfo.roomCategory" placeholder="房间分类" clearable>
            <el-option label="普通场" :value="1" />
            <el-option label="竞技场" :value="2" />
          </el-select>
        </el-form-item>
        <el-form-item label="房间状态">
          <el-select v-model="searchInfo.status" placeholder="房间状态" clearable>
            <el-option label="已关闭" :value="0" />
            <el-option label="等待中" :value="1" />
            <el-option label="游戏中" :value="2" />
            <el-option label="已结束" :value="3" />
          </el-select>
        </el-form-item>
        <el-form-item label="创建者ID">
          <el-input v-model="searchInfo.creatorId" placeholder="创建者ID" />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" icon="search" @click="onSubmit">查询</el-button>
          <el-button icon="refresh" @click="onReset">重置</el-button>
        </el-form-item>
      </el-form>
      <div class="search-tip">
        <el-tag type="info" size="small">默认查询当月数据，可通过月份筛选查看历史记录</el-tag>
      </div>
    </div>
    <div class="gva-table-box">
      <el-table :data="tableData" row-key="ID">
        <el-table-column align="center" label="ID" min-width="60" prop="ID" />
        <el-table-column align="center" label="房间ID" min-width="120" prop="roomId" show-overflow-tooltip />
        <el-table-column align="center" label="房间名称" min-width="100" prop="roomName" />
        <el-table-column align="center" label="房间类型" min-width="80">
          <template #default="scope">
            <el-tag>{{ scope.row.roomTypeName }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column align="center" label="房间分类" min-width="80">
          <template #default="scope">
            <el-tag :type="scope.row.roomCategory === 2 ? 'danger' : 'success'">
              {{ scope.row.roomCategory === 2 ? '竞技场' : '普通场' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column align="center" label="状态" min-width="80">
          <template #default="scope">
            <el-tag :type="getStatusType(scope.row.status)">
              {{ scope.row.statusText }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column align="center" label="玩家数" min-width="80">
          <template #default="scope">
            {{ scope.row.playerCount }}/{{ scope.row.maxPlayers }}
          </template>
        </el-table-column>
        <el-table-column align="center" label="创建者" min-width="100">
          <template #default="scope">
            <div>{{ scope.row.creatorName || scope.row.creatorId || '-' }}</div>
          </template>
        </el-table-column>
        <el-table-column align="center" label="底分/倍数" min-width="80">
          <template #default="scope">
            {{ scope.row.baseScore }}/{{ scope.row.multiplier }}
          </template>
        </el-table-column>
        <el-table-column align="center" label="当前游戏ID" min-width="120" prop="currentGameId" show-overflow-tooltip>
          <template #default="scope">
            {{ scope.row.currentGameId || '-' }}
          </template>
        </el-table-column>
        <el-table-column align="center" label="开始时间" min-width="150" prop="startedAt">
          <template #default="scope">
            {{ scope.row.startedAt || '-' }}
          </template>
        </el-table-column>
        <el-table-column align="center" label="创建时间" min-width="150" prop="createdAt" />
        <el-table-column align="center" label="操作" min-width="80" fixed="right">
          <template #default="scope">
            <el-button type="primary" link icon="view" @click="viewDetail(scope.row)">详情</el-button>
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

    <!-- 详情对话框 -->
    <el-dialog v-model="detailDialog" title="房间详情" width="700px">
      <el-descriptions :column="2" border>
        <el-descriptions-item label="房间ID">{{ currentRecord.roomId }}</el-descriptions-item>
        <el-descriptions-item label="房间名称">{{ currentRecord.roomName }}</el-descriptions-item>
        <el-descriptions-item label="房间类型">{{ currentRecord.roomTypeName }}</el-descriptions-item>
        <el-descriptions-item label="房间分类">
          <el-tag :type="currentRecord.roomCategory === 2 ? 'danger' : 'success'">
            {{ currentRecord.roomCategory === 2 ? '竞技场' : '普通场' }}
          </el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="房间状态">
          <el-tag :type="getStatusType(currentRecord.status)">
            {{ currentRecord.statusText }}
          </el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="玩家数">{{ currentRecord.playerCount }}/{{ currentRecord.maxPlayers }}</el-descriptions-item>
        <el-descriptions-item label="创建者">{{ currentRecord.creatorName || currentRecord.creatorId || '-' }}</el-descriptions-item>
        <el-descriptions-item label="底分">{{ currentRecord.baseScore }}</el-descriptions-item>
        <el-descriptions-item label="倍数">{{ currentRecord.multiplier }}</el-descriptions-item>
        <el-descriptions-item label="当前游戏ID">{{ currentRecord.currentGameId || '-' }}</el-descriptions-item>
        <el-descriptions-item label="开始时间">{{ currentRecord.startedAt || '-' }}</el-descriptions-item>
        <el-descriptions-item label="结束时间">{{ currentRecord.endedAt || '-' }}</el-descriptions-item>
        <el-descriptions-item label="创建时间">{{ currentRecord.createdAt }}</el-descriptions-item>
      </el-descriptions>

      <el-divider v-if="currentRecord.players && currentRecord.players.length > 0" content-position="left">房间玩家</el-divider>
      <el-table v-if="currentRecord.players && currentRecord.players.length > 0" :data="currentRecord.players" size="small">
        <el-table-column prop="seatIndex" label="座位" width="60" />
        <el-table-column prop="nickname" label="昵称" />
        <el-table-column prop="playerId" label="玩家ID" />
        <el-table-column label="准备状态">
          <template #default="scope">
            <el-tag :type="scope.row.isReady ? 'success' : 'info'">
              {{ scope.row.isReady ? '已准备' : '未准备' }}
            </el-tag>
          </template>
        </el-table-column>
      </el-table>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { getRoomList, getRoomDetail } from '@/api/ddz/gameLog'

defineOptions({
  name: 'DDZGameRoom'
})

const searchInfo = ref({
  month: '',
  roomId: '',
  roomName: '',
  roomType: null,
  roomCategory: null,
  status: null,
  creatorId: ''
})

const page = ref(1)
const total = ref(0)
const pageSize = ref(10)
const tableData = ref([])

const detailDialog = ref(false)
const currentRecord = ref({})

const getStatusType = (status) => {
  switch (status) {
    case 1:
      return 'warning'
    case 2:
      return 'success'
    case 3:
      return 'info'
    default:
      return ''
  }
}

const onSubmit = () => {
  page.value = 1
  getTableData()
}

const onReset = () => {
  searchInfo.value = {
    month: '',
    roomId: '',
    roomName: '',
    roomType: null,
    roomCategory: null,
    status: null,
    creatorId: ''
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
  const res = await getRoomList({
    page: page.value,
    pageSize: pageSize.value,
    ...searchInfo.value
  })
  if (res.code === 0) {
    tableData.value = res.data.list
    total.value = res.data.total
  }
}

const viewDetail = async (row) => {
  const res = await getRoomDetail(row.ID)
  if (res.code === 0) {
    currentRecord.value = res.data
    detailDialog.value = true
  }
}

getTableData()
</script>

<style scoped>
</style>
