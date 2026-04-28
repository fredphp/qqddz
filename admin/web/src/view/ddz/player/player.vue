<template>
  <div>
    <div class="gva-search-box">
      <el-form ref="searchForm" :inline="true" :model="searchInfo">
        <el-form-item label="玩家ID">
          <el-input v-model="searchInfo.playerId" placeholder="玩家ID" />
        </el-form-item>
        <el-form-item label="昵称">
          <el-input v-model="searchInfo.nickname" placeholder="昵称" />
        </el-form-item>
        <el-form-item label="状态">
          <el-select v-model="searchInfo.status" placeholder="状态" clearable>
            <el-option label="正常" :value="1" />
            <el-option label="封禁" :value="2" />
          </el-select>
        </el-form-item>
        <el-form-item label="VIP等级">
          <el-select v-model="searchInfo.vipLevel" placeholder="VIP等级" clearable>
            <el-option v-for="i in 10" :key="i" :label="'VIP' + i" :value="i" />
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
        <el-table-column align="center" label="玩家ID" min-width="120" prop="playerId" />
        <el-table-column align="center" label="头像" min-width="80">
          <template #default="scope">
            <el-avatar :size="40" :src="scope.row.avatar || 'https://cube.elemecdn.com/3/7c/3ea6beec64369c2642b92c6726f1epng.png'" />
          </template>
        </el-table-column>
        <el-table-column align="center" label="昵称" min-width="120" prop="nickname" />
        <el-table-column align="center" label="金币" min-width="120" prop="coins">
          <template #default="scope">
            <span :class="scope.row.coins >= 0 ? 'text-success' : 'text-danger'">{{ formatNumber(scope.row.coins) }}</span>
          </template>
        </el-table-column>
        <el-table-column align="center" label="竞技币" min-width="120" prop="arenaCoin">
          <template #default="scope">
            <span class="text-warning">{{ formatNumber(scope.row.arenaCoin) }}</span>
          </template>
        </el-table-column>
        <el-table-column align="center" label="钻石" min-width="100" prop="diamonds">
          <template #default="scope">
            {{ formatNumber(scope.row.diamonds) }}
          </template>
        </el-table-column>
        <el-table-column align="center" label="等级" min-width="80" prop="level" />
        <el-table-column align="center" label="VIP" min-width="80">
          <template #default="scope">
            <el-tag v-if="scope.row.vipLevel > 0" type="warning">VIP{{ scope.row.vipLevel }}</el-tag>
            <span v-else>-</span>
          </template>
        </el-table-column>
        <el-table-column align="center" label="胜率" min-width="100">
          <template #default="scope">
            <span>{{ scope.row.winRate.toFixed(1) }}%</span>
          </template>
        </el-table-column>
        <el-table-column align="center" label="总场次" min-width="100" prop="totalGames" />
        <el-table-column align="center" label="状态" min-width="80">
          <template #default="scope">
            <el-tag :type="scope.row.status === 1 ? 'success' : 'danger'">
              {{ scope.row.status === 1 ? '正常' : '封禁' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column align="center" label="最后登录" min-width="160" prop="lastLoginAt" />
        <el-table-column align="center" label="操作" min-width="220" fixed="right">
          <template #default="scope">
            <el-button type="primary" link icon="view" @click="viewPlayer(scope.row)">详情</el-button>
            <el-button type="primary" link icon="edit" @click="editPlayer(scope.row)">编辑</el-button>
            <el-button v-if="scope.row.status === 1" type="danger" link icon="lock" @click="banPlayerDialog(scope.row)">封禁</el-button>
            <el-button v-else type="success" link icon="unlock" @click="handleUnban(scope.row)">解封</el-button>
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

    <!-- 玩家详情对话框 -->
    <el-dialog v-model="detailDialog" title="玩家详情" width="600px">
      <el-descriptions :column="2" border>
        <el-descriptions-item label="玩家ID">{{ currentPlayer.playerId }}</el-descriptions-item>
        <el-descriptions-item label="昵称">{{ currentPlayer.nickname }}</el-descriptions-item>
        <el-descriptions-item label="金币">{{ formatNumber(currentPlayer.coins) }}</el-descriptions-item>
        <el-descriptions-item label="竞技币">{{ formatNumber(currentPlayer.arenaCoin) }}</el-descriptions-item>
        <el-descriptions-item label="钻石">{{ formatNumber(currentPlayer.diamonds) }}</el-descriptions-item>
        <el-descriptions-item label="等级">{{ currentPlayer.level }}</el-descriptions-item>
        <el-descriptions-item label="VIP等级">VIP{{ currentPlayer.vipLevel }}</el-descriptions-item>
        <el-descriptions-item label="胜场">{{ currentPlayer.winCount }}</el-descriptions-item>
        <el-descriptions-item label="败场">{{ currentPlayer.loseCount }}</el-descriptions-item>
        <el-descriptions-item label="平局">{{ currentPlayer.drawCount }}</el-descriptions-item>
        <el-descriptions-item label="总场次">{{ currentPlayer.totalGames }}</el-descriptions-item>
        <el-descriptions-item label="胜率">{{ currentPlayer.winRate?.toFixed(2) }}%</el-descriptions-item>
        <el-descriptions-item label="最大连胜">{{ currentPlayer.maxWinStreak }}</el-descriptions-item>
        <el-descriptions-item label="注册IP">{{ currentPlayer.registerIp }}</el-descriptions-item>
        <el-descriptions-item label="最后登录IP">{{ currentPlayer.lastLoginIp }}</el-descriptions-item>
        <el-descriptions-item label="最后登录">{{ currentPlayer.lastLoginAt }}</el-descriptions-item>
        <el-descriptions-item label="状态">
          <el-tag :type="currentPlayer.status === 1 ? 'success' : 'danger'">
            {{ currentPlayer.status === 1 ? '正常' : '封禁' }}
          </el-tag>
        </el-descriptions-item>
      </el-descriptions>
      <template v-if="currentPlayer.status === 2">
        <el-divider />
        <el-descriptions :column="1" border>
          <el-descriptions-item label="封禁原因">{{ currentPlayer.banReason }}</el-descriptions-item>
          <el-descriptions-item label="封禁时间">{{ currentPlayer.banTime }}</el-descriptions-item>
          <el-descriptions-item label="解封时间">{{ currentPlayer.unbanTime || '永久封禁' }}</el-descriptions-item>
        </el-descriptions>
      </template>
    </el-dialog>

    <!-- 编辑玩家对话框 -->
    <el-dialog v-model="editDialog" title="编辑玩家" width="500px">
      <el-form ref="editForm" :model="editForm" label-width="80px">
        <el-form-item label="昵称">
          <el-input v-model="editForm.nickname" />
        </el-form-item>
        <el-form-item label="头像">
          <el-input v-model="editForm.avatar" />
        </el-form-item>
        <el-form-item label="性别">
          <el-radio-group v-model="editForm.gender">
            <el-radio :label="0">未知</el-radio>
            <el-radio :label="1">男</el-radio>
            <el-radio :label="2">女</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="VIP等级">
          <el-input-number v-model="editForm.vipLevel" :min="0" :max="10" />
        </el-form-item>
        <el-form-item label="金币">
          <el-input-number v-model="editForm.coins" :min="-999999999" :max="999999999" />
        </el-form-item>
        <el-form-item label="竞技币">
          <el-input-number v-model="editForm.arenaCoin" :min="0" :max="999999999" />
        </el-form-item>
        <el-form-item label="钻石">
          <el-input-number v-model="editForm.diamonds" :min="0" :max="999999999" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="editDialog = false">取消</el-button>
        <el-button type="primary" @click="handleEdit">确定</el-button>
      </template>
    </el-dialog>

    <!-- 封禁玩家对话框 -->
    <el-dialog v-model="banDialog" title="封禁玩家" width="400px">
      <el-form ref="banForm" :model="banForm" :rules="banRules" label-width="80px">
        <el-form-item label="玩家ID">
          <el-input v-model="banForm.playerId" disabled />
        </el-form-item>
        <el-form-item label="封禁原因" prop="reason">
          <el-input v-model="banForm.reason" type="textarea" :rows="3" placeholder="请输入封禁原因" />
        </el-form-item>
        <el-form-item label="封禁时长">
          <el-select v-model="banForm.duration" placeholder="选择封禁时长">
            <el-option label="1小时" :value="1" />
            <el-option label="24小时" :value="24" />
            <el-option label="7天" :value="168" />
            <el-option label="30天" :value="720" />
            <el-option label="永久" :value="0" />
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="banDialog = false">取消</el-button>
        <el-button type="danger" @click="handleBan">确认封禁</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { getPlayerList, banPlayer, unbanPlayer, updatePlayer } from '@/api/ddz/player'

defineOptions({
  name: 'DDZPlayer'
})

const searchInfo = ref({
  playerId: '',
  nickname: '',
  status: null,
  vipLevel: null
})

const page = ref(1)
const total = ref(0)
const pageSize = ref(10)
const tableData = ref([])

const detailDialog = ref(false)
const editDialog = ref(false)
const banDialog = ref(false)
const currentPlayer = ref({})
const editForm = ref({
  ID: null,
  nickname: '',
  avatar: '',
  gender: 0,
  vipLevel: 0,
  coins: 0,
  arenaCoin: 0,
  diamonds: 0
})
const banForm = ref({
  playerId: '',
  reason: '',
  duration: 24
})
const banRules = {
  reason: [{ required: true, message: '请输入封禁原因', trigger: 'blur' }]
}

const formatNumber = (num) => {
  if (num >= 100000000) {
    return (num / 100000000).toFixed(2) + '亿'
  } else if (num >= 10000) {
    return (num / 10000).toFixed(2) + '万'
  }
  return num?.toLocaleString() || '0'
}

const onSubmit = () => {
  page.value = 1
  getTableData()
}

const onReset = () => {
  searchInfo.value = {
    playerId: '',
    nickname: '',
    status: null,
    vipLevel: null
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
  const res = await getPlayerList({
    page: page.value,
    pageSize: pageSize.value,
    ...searchInfo.value
  })
  if (res.code === 0) {
    tableData.value = res.data.list
    total.value = res.data.total
  }
}

const viewPlayer = (row) => {
  currentPlayer.value = row
  detailDialog.value = true
}

const editPlayer = (row) => {
  editForm.value = {
    ID: row.ID,
    nickname: row.nickname,
    avatar: row.avatar,
    gender: row.gender,
    vipLevel: row.vipLevel,
    coins: row.coins,
    arenaCoin: row.arenaCoin || 0,
    diamonds: row.diamonds
  }
  editDialog.value = true
}

const handleEdit = async () => {
  const res = await updatePlayer(editForm.value)
  if (res.code === 0) {
    ElMessage.success('更新成功')
    editDialog.value = false
    getTableData()
  }
}

const banPlayerDialog = (row) => {
  banForm.value = {
    playerId: row.playerId,
    reason: '',
    duration: 24
  }
  banDialog.value = true
}

const handleBan = async () => {
  if (!banForm.value.reason) {
    ElMessage.warning('请输入封禁原因')
    return
  }
  const res = await banPlayer(banForm.value)
  if (res.code === 0) {
    ElMessage.success('封禁成功')
    banDialog.value = false
    getTableData()
  }
}

const handleUnban = async (row) => {
  ElMessageBox.confirm('确定要解封该玩家吗?', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(async () => {
    const res = await unbanPlayer({ playerId: row.playerId })
    if (res.code === 0) {
      ElMessage.success('解封成功')
      getTableData()
    }
  })
}

getTableData()
</script>

<style scoped>
.text-success {
  color: #67c23a;
}
.text-danger {
  color: #f56c6c;
}
.text-warning {
  color: #e6a23c;
}
</style>
