<template>
  <div>
    <div class="gva-search-box">
      <el-form ref="searchForm" :inline="true" :model="searchInfo">
        <el-form-item label="游戏ID">
          <el-input v-model="searchInfo.gameId" placeholder="游戏ID" />
        </el-form-item>
        <el-form-item label="玩家ID">
          <el-input v-model="searchInfo.playerId" placeholder="玩家ID" />
        </el-form-item>
        <el-form-item label="叫地主类型">
          <el-select v-model="searchInfo.bidType" placeholder="叫地主类型" clearable>
            <el-option label="不叫" :value="0" />
            <el-option label="叫地主" :value="1" />
            <el-option label="抢地主" :value="2" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" icon="search" @click="onSubmit">查询</el-button>
          <el-button icon="refresh" @click="onReset">重置</el-button>
        </el-form-item>
      </el-form>
    </div>
    <div class="gva-table-box">
      <el-table :data="tableData" row-key="ID">
        <el-table-column align="center" label="ID" min-width="60" prop="ID" />
        <el-table-column align="center" label="游戏ID" min-width="120" prop="gameId" show-overflow-tooltip />
        <el-table-column align="center" label="玩家ID" min-width="100" prop="playerId" />
        <el-table-column align="center" label="叫地主顺序" min-width="100" prop="bidOrder" />
        <el-table-column align="center" label="叫地主类型" min-width="100">
          <template #default="scope">
            <el-tag :type="getBidTypeTag(scope.row.bidType)">
              {{ getBidTypeText(scope.row.bidType) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column align="center" label="叫分" min-width="60" prop="bidScore" />
        <el-table-column align="center" label="成为地主" min-width="80">
          <template #default="scope">
            <el-tag :type="scope.row.isSuccess ? 'success' : 'info'">
              {{ scope.row.isSuccess ? '是' : '否' }}
            </el-tag>
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
import { getBidLogList } from '@/api/ddz/gameLog'

defineOptions({
  name: 'DDZBidLog'
})

const searchInfo = ref({
  gameId: '',
  playerId: '',
  bidType: null
})

const page = ref(1)
const total = ref(0)
const pageSize = ref(10)
const tableData = ref([])

const getBidTypeText = (type) => {
  const map = { 0: '不叫', 1: '叫地主', 2: '抢地主' }
  return map[type] || '未知'
}

const getBidTypeTag = (type) => {
  const map = { 0: 'info', 1: 'primary', 2: 'warning' }
  return map[type] || 'info'
}

const onSubmit = () => {
  page.value = 1
  getTableData()
}

const onReset = () => {
  searchInfo.value = {
    gameId: '',
    playerId: '',
    bidType: null
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
  const res = await getBidLogList({
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
