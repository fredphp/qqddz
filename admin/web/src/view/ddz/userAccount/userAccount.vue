<template>
  <div>
    <div class="gva-search-box">
      <el-form ref="searchForm" :inline="true" :model="searchInfo">
        <el-form-item label="手机号">
          <el-input v-model="searchInfo.phone" placeholder="手机号" />
        </el-form-item>
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
        <el-form-item label="状态">
          <el-select v-model="searchInfo.status" placeholder="状态" clearable>
            <el-option label="正常" :value="1" />
            <el-option label="禁用" :value="0" />
            <el-option label="封禁" :value="2" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" icon="search" @click="onSubmit">查询</el-button>
          <el-button icon="refresh" @click="onReset">重置</el-button>
        </el-form-item>
      </el-form>
    </div>
    <div class="gva-table-box">
      <div class="gva-btn-list">
        <el-button type="primary" icon="plus" @click="createDialog = true">新建用户账户</el-button>
      </div>
      <el-table :data="tableData" row-key="ID">
        <el-table-column align="center" label="ID" min-width="60" prop="ID" />
        <el-table-column align="center" label="玩家ID" min-width="80" prop="playerId" />
        <el-table-column align="center" label="玩家昵称" min-width="120">
          <template #default="scope">
            <div class="player-info">
              <el-avatar :size="30" :src="scope.row.playerAvatar || 'https://cube.elemecdn.com/3/7c/3ea6beec64369c2642b92c6726f1epng.png'" />
              <span class="player-nickname">{{ scope.row.playerNickname || '-' }}</span>
            </div>
          </template>
        </el-table-column>
        <el-table-column align="center" label="手机号" min-width="120" prop="phone">
          <template #default="scope">
            {{ scope.row.phone || '-' }}
          </template>
        </el-table-column>
        <el-table-column align="center" label="微信昵称" min-width="120">
          <template #default="scope">
            <div v-if="scope.row.wxNickname" class="player-info">
              <el-avatar :size="24" :src="scope.row.wxAvatar" />
              <span>{{ scope.row.wxNickname }}</span>
            </div>
            <span v-else>-</span>
          </template>
        </el-table-column>
        <el-table-column align="center" label="登录类型" min-width="100">
          <template #default="scope">
            <el-tag :type="getLoginTypeTag(scope.row.loginType)">
              {{ scope.row.loginTypeText }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column align="center" label="玩家等级" min-width="100">
          <template #default="scope">
            <span>Lv.{{ scope.row.playerLevel || 1 }}</span>
            <el-tag v-if="scope.row.playerVipLevel > 0" type="warning" size="small" style="margin-left: 4px">
              VIP{{ scope.row.playerVipLevel }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column align="center" label="金币" min-width="100">
          <template #default="scope">
            {{ formatNumber(scope.row.playerCoins) }}
          </template>
        </el-table-column>
        <el-table-column align="center" label="登录次数" min-width="80" prop="loginCount" />
        <el-table-column align="center" label="最后登录" min-width="160">
          <template #default="scope">
            <div>{{ scope.row.lastLoginAt || '-' }}</div>
            <div class="text-gray">{{ scope.row.lastLoginIp || '-' }}</div>
          </template>
        </el-table-column>
        <el-table-column align="center" label="状态" min-width="80">
          <template #default="scope">
            <el-tag :type="getStatusTag(scope.row.status)">
              {{ scope.row.statusText }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column align="center" label="操作" min-width="260" fixed="right">
          <template #default="scope">
            <el-button type="primary" link icon="view" @click="viewUser(scope.row)">详情</el-button>
            <el-button type="primary" link icon="edit" @click="editUser(scope.row)">编辑</el-button>
            <el-button type="warning" link icon="key" @click="handleResetToken(scope.row)">强制下线</el-button>
            <el-button type="danger" link icon="delete" @click="handleDelete(scope.row)">删除</el-button>
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

    <!-- 创建用户账户对话框 -->
    <el-dialog v-model="createDialog" title="创建用户账户" width="500px">
      <el-form ref="createForm" :model="createForm" :rules="createRules" label-width="100px">
        <el-form-item label="玩家ID" prop="playerId">
          <el-input-number v-model="createForm.playerId" :min="1" style="width: 100%" />
        </el-form-item>
        <el-form-item label="手机号">
          <el-input v-model="createForm.phone" placeholder="选填" />
        </el-form-item>
        <el-form-item label="登录类型" prop="loginType">
          <el-select v-model="createForm.loginType" style="width: 100%">
            <el-option label="手机号" :value="1" />
            <el-option label="微信" :value="2" />
            <el-option label="游客" :value="3" />
          </el-select>
        </el-form-item>
        <el-form-item label="设备ID">
          <el-input v-model="createForm.deviceId" placeholder="选填" />
        </el-form-item>
        <el-form-item label="设备类型">
          <el-select v-model="createForm.deviceType" style="width: 100%">
            <el-option label="iOS" value="ios" />
            <el-option label="Android" value="android" />
            <el-option label="Web" value="web" />
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="createDialog = false">取消</el-button>
        <el-button type="primary" @click="handleCreate">确定</el-button>
      </template>
    </el-dialog>

    <!-- 用户详情对话框 -->
    <el-dialog v-model="detailDialog" title="用户账户详情" width="700px">
      <el-descriptions :column="2" border>
        <el-descriptions-item label="账户ID">{{ currentUser.ID }}</el-descriptions-item>
        <el-descriptions-item label="玩家ID">{{ currentUser.playerId }}</el-descriptions-item>
        <el-descriptions-item label="玩家昵称">{{ currentUser.playerNickname || '-' }}</el-descriptions-item>
        <el-descriptions-item label="玩家等级">Lv.{{ currentUser.playerLevel || 1 }}</el-descriptions-item>
        <el-descriptions-item label="手机号">{{ currentUser.phone || '-' }}</el-descriptions-item>
        <el-descriptions-item label="微信OpenID">{{ currentUser.wxOpenId || '-' }}</el-descriptions-item>
        <el-descriptions-item label="微信昵称">{{ currentUser.wxNickname || '-' }}</el-descriptions-item>
        <el-descriptions-item label="登录类型">{{ currentUser.loginTypeText }}</el-descriptions-item>
        <el-form-item label="设备类型">{{ currentUser.deviceType || '-' }}</el-form-item>
        <el-descriptions-item label="设备ID">{{ currentUser.deviceId || '-' }}</el-descriptions-item>
        <el-descriptions-item label="登录次数">{{ currentUser.loginCount }}</el-descriptions-item>
        <el-descriptions-item label="状态">
          <el-tag :type="getStatusTag(currentUser.status)">
            {{ currentUser.statusText }}
          </el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="最后登录时间">{{ currentUser.lastLoginAt || '-' }}</el-descriptions-item>
        <el-descriptions-item label="最后登录IP">{{ currentUser.lastLoginIp || '-' }}</el-descriptions-item>
        <el-descriptions-item label="Token过期时间">{{ currentUser.tokenExpireAt || '-' }}</el-descriptions-item>
        <el-descriptions-item label="创建时间">{{ currentUser.createdAt }}</el-descriptions-item>
      </el-descriptions>
      <el-divider content-position="left">关联玩家信息</el-divider>
      <el-descriptions :column="2" border>
        <el-descriptions-item label="玩家金币">{{ formatNumber(currentUser.playerCoins) }}</el-descriptions-item>
        <el-descriptions-item label="VIP等级">VIP{{ currentUser.playerVipLevel || 0 }}</el-descriptions-item>
      </el-descriptions>
    </el-dialog>

    <!-- 编辑用户对话框 -->
    <el-dialog v-model="editDialog" title="编辑用户账户" width="500px">
      <el-form ref="editForm" :model="editForm" label-width="100px">
        <el-form-item label="手机号">
          <el-input v-model="editForm.phone" />
        </el-form-item>
        <el-form-item label="微信昵称">
          <el-input v-model="editForm.wxNickname" />
        </el-form-item>
        <el-form-item label="微信头像">
          <el-input v-model="editForm.wxAvatar" />
        </el-form-item>
        <el-form-item label="状态">
          <el-select v-model="editForm.status" style="width: 100%">
            <el-option label="正常" :value="1" />
            <el-option label="禁用" :value="0" />
            <el-option label="封禁" :value="2" />
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="editDialog = false">取消</el-button>
        <el-button type="primary" @click="handleEdit">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  getUserAccountList,
  createUserAccount,
  deleteUserAccount,
  updateUserAccount,
  resetToken
} from '@/api/ddz/userAccount'

defineOptions({
  name: 'DDZUserAccount'
})

const searchInfo = ref({
  phone: '',
  playerId: '',
  loginType: null,
  status: null
})

const page = ref(1)
const total = ref(0)
const pageSize = ref(10)
const tableData = ref([])

const createDialog = ref(false)
const detailDialog = ref(false)
const editDialog = ref(false)
const currentUser = ref({})

const createForm = ref({
  playerId: null,
  phone: '',
  loginType: 1,
  deviceId: '',
  deviceType: 'web'
})

const createRules = {
  playerId: [{ required: true, message: '请输入玩家ID', trigger: 'blur' }],
  loginType: [{ required: true, message: '请选择登录类型', trigger: 'change' }]
}

const editForm = ref({
  ID: null,
  phone: '',
  wxNickname: '',
  wxAvatar: '',
  status: 1
})

const formatNumber = (num) => {
  if (num >= 100000000) {
    return (num / 100000000).toFixed(2) + '亿'
  } else if (num >= 10000) {
    return (num / 10000).toFixed(2) + '万'
  }
  return num?.toLocaleString() || '0'
}

const getLoginTypeTag = (type) => {
  const tags = { 1: 'primary', 2: 'success', 3: 'info' }
  return tags[type] || 'info'
}

const getStatusTag = (status) => {
  const tags = { 0: 'danger', 1: 'success', 2: 'danger' }
  return tags[status] || 'info'
}

const onSubmit = () => {
  page.value = 1
  getTableData()
}

const onReset = () => {
  searchInfo.value = {
    phone: '',
    playerId: '',
    loginType: null,
    status: null
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
  const res = await getUserAccountList({
    page: page.value,
    pageSize: pageSize.value,
    ...searchInfo.value
  })
  if (res.code === 0) {
    tableData.value = res.data.list
    total.value = res.data.total
  }
}

const viewUser = (row) => {
  currentUser.value = row
  detailDialog.value = true
}

const editUser = (row) => {
  editForm.value = {
    ID: row.ID,
    phone: row.phone || '',
    wxNickname: row.wxNickname || '',
    wxAvatar: row.wxAvatar || '',
    status: row.status
  }
  editDialog.value = true
}

const handleCreate = async () => {
  const res = await createUserAccount(createForm.value)
  if (res.code === 0) {
    ElMessage.success('创建成功')
    createDialog.value = false
    createForm.value = {
      playerId: null,
      phone: '',
      loginType: 1,
      deviceId: '',
      deviceType: 'web'
    }
    getTableData()
  }
}

const handleEdit = async () => {
  const res = await updateUserAccount(editForm.value)
  if (res.code === 0) {
    ElMessage.success('更新成功')
    editDialog.value = false
    getTableData()
  }
}

const handleDelete = (row) => {
  ElMessageBox.confirm('确定要删除该用户账户吗？此操作不可恢复!', '警告', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(async () => {
    const res = await deleteUserAccount({ ID: row.ID })
    if (res.code === 0) {
      ElMessage.success('删除成功')
      getTableData()
    }
  })
}

const handleResetToken = (row) => {
  ElMessageBox.confirm('确定要强制该用户下线吗？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(async () => {
    const res = await resetToken({ ID: row.ID })
    if (res.code === 0) {
      ElMessage.success('用户已被强制下线')
      getTableData()
    }
  })
}

getTableData()
</script>

<style scoped>
.player-info {
  display: flex;
  align-items: center;
  gap: 8px;
}
.player-nickname {
  max-width: 100px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.text-gray {
  color: #909399;
  font-size: 12px;
}
.gva-btn-list {
  margin-bottom: 10px;
}
</style>
