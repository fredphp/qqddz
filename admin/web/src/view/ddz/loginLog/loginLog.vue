<template>
  <div>
    <div class="gva-search-box">
      <el-form ref="searchForm" :inline="true" :model="searchInfo">
        <el-form-item label="玩家ID">
          <el-input v-model="searchInfo.playerId" placeholder="玩家ID" clearable />
        </el-form-item>
        <el-form-item label="登录类型">
          <el-select v-model="searchInfo.loginType" placeholder="登录类型" clearable style="width: 120px;">
            <el-option label="手机号" :value="1" />
            <el-option label="微信" :value="2" />
            <el-option label="游客" :value="3" />
          </el-select>
        </el-form-item>
        <el-form-item label="登录结果">
          <el-select v-model="searchInfo.loginResult" placeholder="登录结果" clearable style="width: 100px;">
            <el-option label="失败" :value="0" />
            <el-option label="成功" :value="1" />
          </el-select>
        </el-form-item>
        <el-form-item label="登录IP">
          <el-input v-model="searchInfo.ip" placeholder="登录IP" clearable />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" icon="search" @click="onSubmit">查询</el-button>
          <el-button icon="refresh" @click="onReset">重置</el-button>
        </el-form-item>
      </el-form>
    </div>
    <div class="gva-table-box">
      <div class="gva-btn-list">
        <el-button
          icon="delete"
          type="danger"
          :disabled="!multipleSelection.length"
          @click="onDelete"
        >批量删除</el-button>
      </div>
      <el-table
        ref="multipleTable"
        :data="tableData"
        row-key="ID"
        v-loading="loading"
        @selection-change="handleSelectionChange"
      >
        <el-table-column type="selection" width="55" />
        <el-table-column align="center" label="ID" min-width="80" prop="ID" />
        <el-table-column align="center" label="玩家ID" min-width="100" prop="playerId" />
        <el-table-column align="center" label="玩家昵称" min-width="120" prop="playerNickname">
          <template #default="scope">
            {{ scope.row.playerNickname || '-' }}
          </template>
        </el-table-column>
        <el-table-column align="center" label="账户ID" min-width="100" prop="accountId" />
        <el-table-column align="center" label="登录类型" min-width="100">
          <template #default="scope">
            <el-tag :type="getLoginTypeTagType(scope.row.loginType)">
              {{ scope.row.loginTypeText || getLoginTypeText(scope.row.loginType) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column align="center" label="登录结果" min-width="90">
          <template #default="scope">
            <el-tag :type="scope.row.loginResult === 1 ? 'success' : 'danger'">
              {{ scope.row.loginResultText || (scope.row.loginResult === 1 ? '成功' : '失败') }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column align="center" label="失败原因" min-width="180" prop="failReason" show-overflow-tooltip>
          <template #default="scope">
            {{ scope.row.loginResult === 1 ? '-' : (scope.row.failReason || '-') }}
          </template>
        </el-table-column>
        <el-table-column align="center" label="登录IP" min-width="130" prop="ip" />
        <el-table-column align="center" label="设备类型" min-width="100" prop="deviceType">
          <template #default="scope">
            {{ scope.row.deviceType || '-' }}
          </template>
        </el-table-column>
        <el-table-column align="center" label="设备ID" min-width="150" prop="deviceId" show-overflow-tooltip>
          <template #default="scope">
            {{ scope.row.deviceId || '-' }}
          </template>
        </el-table-column>
        <el-table-column align="center" label="登录地点" min-width="120" prop="location" show-overflow-tooltip>
          <template #default="scope">
            {{ scope.row.location || '-' }}
          </template>
        </el-table-column>
        <el-table-column align="center" label="User-Agent" min-width="200" prop="userAgent" show-overflow-tooltip>
          <template #default="scope">
            {{ scope.row.userAgent || '-' }}
          </template>
        </el-table-column>
        <el-table-column align="center" label="登录时间" min-width="170" prop="createdAt" />
        <el-table-column align="center" label="操作" width="100" fixed="right">
          <template #default="scope">
            <el-popover v-model:visible="scope.row.visible" placement="top" width="160">
              <p>确定要删除此记录吗？</p>
              <div style="text-align: right; margin: 0">
                <el-button size="small" type="primary" link @click="scope.row.visible = false">取消</el-button>
                <el-button size="small" type="primary" @click="deleteRow(scope.row)">确定</el-button>
              </div>
              <template #reference>
                <el-button icon="delete" type="danger" link @click="scope.row.visible = true">删除</el-button>
              </template>
            </el-popover>
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
import { getLoginLogList } from '@/api/ddz/userAccount'
import { ElMessage, ElMessageBox } from 'element-plus'

defineOptions({
  name: 'DDZLoginLog'
})

const searchInfo = ref({
  playerId: '',
  loginType: null,
  loginResult: null,
  ip: ''
})

const page = ref(1)
const total = ref(0)
const pageSize = ref(10)
const tableData = ref([])
const loading = ref(false)
const multipleSelection = ref([])

const getLoginTypeText = (type) => {
  const map = { 1: '手机号', 2: '微信', 3: '游客' }
  return map[type] || '未知'
}

const getLoginTypeTagType = (type) => {
  const map = { 1: 'primary', 2: 'success', 3: 'warning' }
  return map[type] || 'info'
}

const handleSelectionChange = (val) => {
  multipleSelection.value = val
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
    ip: ''
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
  loading.value = true
  try {
    const params = {
      page: page.value,
      pageSize: pageSize.value,
      ...searchInfo.value
    }
    // 移除空值参数
    Object.keys(params).forEach(key => {
      if (params[key] === '' || params[key] === null) {
        delete params[key]
      }
    })

    const res = await getLoginLogList(params)
    if (res.code === 0) {
      tableData.value = res.data.list || []
      total.value = res.data.total || 0
      page.value = res.data.page || 1
      pageSize.value = res.data.pageSize || 10
    } else {
      ElMessage.error(res.msg || '获取登录日志列表失败')
    }
  } catch (error) {
    console.error('获取登录日志列表失败:', error)
    ElMessage.error('获取登录日志列表失败')
  } finally {
    loading.value = false
  }
}

const deleteRow = async (row) => {
  row.visible = false
  // TODO: 实现删除单条记录的API
  ElMessage.info('删除功能待实现')
}

const onDelete = async () => {
  ElMessageBox.confirm('确定要删除选中的记录吗？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    const ids = multipleSelection.value.map(item => item.ID)
    // TODO: 实现批量删除的API
    ElMessage.info('批量删除功能待实现')
  })
}

getTableData()
</script>

<style scoped>
</style>
