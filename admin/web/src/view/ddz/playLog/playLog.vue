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
        <el-form-item label="出牌类型">
          <el-select v-model="searchInfo.playType" placeholder="出牌类型" clearable>
            <el-option label="出牌" :value="1" />
            <el-option label="不出/过" :value="2" />
            <el-option label="超时自动出牌" :value="3" />
          </el-select>
        </el-form-item>
        <el-form-item label="牌型">
          <el-input v-model="searchInfo.cardPattern" placeholder="牌型" />
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
        <el-table-column align="center" label="玩家角色" min-width="80">
          <template #default="scope">
            <el-tag :type="scope.row.playerRole === 1 ? 'danger' : 'success'">
              {{ scope.row.playerRole === 1 ? '地主' : '农民' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column align="center" label="回合数" min-width="60" prop="roundNum" />
        <el-table-column align="center" label="出牌顺序" min-width="80" prop="playOrder" />
        <el-table-column align="center" label="出牌类型" min-width="100">
          <template #default="scope">
            <el-tag :type="getPlayTypeTag(scope.row.playType)">
              {{ getPlayTypeText(scope.row.playType) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column align="center" label="出的牌" min-width="150" prop="cards" show-overflow-tooltip />
        <el-table-column align="center" label="牌数" min-width="60" prop="cardsCount" />
        <el-table-column align="center" label="牌型" min-width="80" prop="cardPattern" />
        <el-table-column align="center" label="炸弹" min-width="60">
          <template #default="scope">
            <el-tag v-if="scope.row.isBomb" type="warning">炸弹</el-tag>
            <span v-else>-</span>
          </template>
        </el-table-column>
        <el-table-column align="center" label="火箭" min-width="60">
          <template #default="scope">
            <el-tag v-if="scope.row.isRocket" type="danger">火箭</el-tag>
            <span v-else>-</span>
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
import { getPlayLogList } from '@/api/ddz/gameLog'

defineOptions({
  name: 'DDZPlayLog'
})

const searchInfo = ref({
  gameId: '',
  playerId: '',
  playType: null,
  cardPattern: ''
})

const page = ref(1)
const total = ref(0)
const pageSize = ref(10)
const tableData = ref([])

const getPlayTypeText = (type) => {
  const map = { 1: '出牌', 2: '不出/过', 3: '超时自动出牌' }
  return map[type] || '未知'
}

const getPlayTypeTag = (type) => {
  const map = { 1: 'primary', 2: 'info', 3: 'warning' }
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
    playType: null,
    cardPattern: ''
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
  const res = await getPlayLogList({
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
