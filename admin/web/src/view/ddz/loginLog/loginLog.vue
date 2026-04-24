<template>
  <div>
    <div class="gva-search-box">
      <el-form ref="searchForm" :inline="true" :model="searchInfo">
        <el-form-item label="玩家ID">
          <el-input v-model="searchInfo.playerId" placeholder="玩家ID" />
        </el-form-item>
        <el-form-item label="登录类型">
          <el-select v-model="searchInfo.loginType" placeholder="登录类型" clearable>
            <el-option label="手机号" :value="1" />
            <el-option label="微信" :value="2" />
            <el-option label="游客" :value="3" />
          </el-select>
        </el-form-item>
        <el-form-item label="登录结果">
          <el-select v-model="searchInfo.loginResult" placeholder="登录结果" clearable>
            <el-option label="失败" :value="0" />
            <el-option label="成功" :value="1" />
          </el-select>
        </el-form-item>
        <el-form-item label="登录时间">
          <el-date-picker
            v-model="searchInfo.loginTime"
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
        <el-table-column align="center" label="ID" min-width="60" prop="ID" />
        <el-table-column align="center" label="玩家ID" min-width="100" prop="playerId" />
        <el-table-column align="center" label="账户ID" min-width="100" prop="accountId" />
        <el-table-column align="center" label="登录类型" min-width="80">
          <template #default="scope">
            <el-tag>{{ getLoginTypeText(scope.row.loginType) }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column align="center" label="登录结果" min-width="80">
          <template #default="scope">
            <el-tag :type="scope.row.loginResult === 1 ? 'success' : 'danger'">
              {{ scope.row.loginResult === 1 ? '成功' : '失败' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column align="center" label="失败原因" min-width="150" prop="failReason" show-overflow-tooltip />
        <el-table-column align="center" label="登录IP" min-width="120" prop="ip" />
        <el-table-column align="center" label="设备类型" min-width="80" prop="deviceType" />
        <el-table-column align="center" label="登录地点" min-width="100" prop="location" />
        <el-table-column align="center" label="登录时间" min-width="160" prop="createdAt" />
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
  name: 'DDZLoginLog'
})

const searchInfo = ref({
  playerId: '',
  loginType: null,
  loginResult: null,
  loginTime: []
})

const page = ref(1)
const total = ref(0)
const pageSize = ref(10)
const tableData = ref([])

const getLoginTypeText = (type) => {
  const map = { 1: '手机号', 2: '微信', 3: '游客' }
  return map[type] || '未知'
}

const onSubmit = () => {
  page.value = 1
  getTableData()
}

const onReset = () => {
  searchInfo.value = {
    playerId: '',
    loginType: null,
    loginResult: null,
    loginTime: []
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
