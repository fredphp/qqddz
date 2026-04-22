<template>
  <div>
    <el-tabs v-model="activeTab">
      <el-tab-pane label="房间配置" name="room">
        <div class="gva-search-box">
          <el-form ref="searchForm" :inline="true" :model="roomSearch">
            <el-form-item label="房间类型">
              <el-select v-model="roomSearch.roomType" placeholder="房间类型" clearable>
                <el-option label="普通房间" :value="1" />
                <el-option label="VIP房间" :value="2" />
              </el-select>
            </el-form-item>
            <el-form-item label="状态">
              <el-select v-model="roomSearch.status" placeholder="状态" clearable>
                <el-option label="启用" :value="1" />
                <el-option label="禁用" :value="2" />
              </el-select>
            </el-form-item>
            <el-form-item>
              <el-button type="primary" icon="search" @click="getRoomList">查询</el-button>
              <el-button type="primary" icon="plus" @click="addRoom">新增</el-button>
            </el-form-item>
          </el-form>
        </div>
        <div class="gva-table-box">
          <el-table :data="roomList" row-key="ID">
            <el-table-column align="center" label="ID" min-width="60" prop="ID" />
            <el-table-column align="center" label="房间名称" min-width="120" prop="name" />
            <el-table-column align="center" label="房间类型" min-width="100">
              <template #default="scope">
                <el-tag :type="scope.row.roomType === 1 ? '' : 'warning'">
                  {{ scope.row.roomType === 1 ? '普通' : 'VIP' }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column align="center" label="房间等级" min-width="80" prop="roomLevel" />
            <el-table-column align="center" label="底分" min-width="80" prop="baseScore" />
            <el-table-column align="center" label="最低金币" min-width="100">
              <template #default="scope">
                {{ formatNumber(scope.row.minCoins) }}
              </template>
            </el-table-column>
            <el-table-column align="center" label="最高金币" min-width="100">
              <template #default="scope">
                {{ scope.row.maxCoins > 0 ? formatNumber(scope.row.maxCoins) : '无上限' }}
              </template>
            </el-table-column>
            <el-table-column align="center" label="最大倍数" min-width="80" prop="maxMultiple" />
            <el-table-column align="center" label="超时(秒)" min-width="80" prop="timeout" />
            <el-table-column align="center" label="状态" min-width="80">
              <template #default="scope">
                <el-switch
                  v-model="scope.row.status"
                  :active-value="1"
                  :inactive-value="2"
                  @change="handleRoomStatusChange(scope.row)"
                />
              </template>
            </el-table-column>
            <el-table-column align="center" label="操作" min-width="120" fixed="right">
              <template #default="scope">
                <el-button type="primary" link icon="edit" @click="editRoom(scope.row)">编辑</el-button>
                <el-button type="danger" link icon="delete" @click="deleteRoom(scope.row)">删除</el-button>
              </template>
            </el-table-column>
          </el-table>
        </div>
      </el-tab-pane>

      <el-tab-pane label="游戏配置" name="game">
        <div class="gva-search-box">
          <el-form ref="gameSearchForm" :inline="true" :model="gameSearch">
            <el-form-item label="配置键">
              <el-input v-model="gameSearch.configKey" placeholder="配置键" />
            </el-form-item>
            <el-form-item>
              <el-button type="primary" icon="search" @click="getGameConfigList">查询</el-button>
            </el-form-item>
          </el-form>
        </div>
        <div class="gva-table-box">
          <el-table :data="gameConfigList" row-key="ID">
            <el-table-column align="center" label="ID" min-width="60" prop="ID" />
            <el-table-column align="center" label="配置键" min-width="150" prop="configKey" />
            <el-table-column align="center" label="配置值" min-width="200">
              <template #default="scope">
                <el-tooltip :content="scope.row.configValue" placement="top">
                  <span class="config-value-preview">{{ scope.row.configValue?.substring(0, 30) }}...</span>
                </el-tooltip>
              </template>
            </el-table-column>
            <el-table-column align="center" label="类型" min-width="80" prop="configType" />
            <el-table-column align="center" label="描述" min-width="200" prop="description" />
            <el-table-column align="center" label="状态" min-width="80">
              <template #default="scope">
                <el-switch
                  v-model="scope.row.status"
                  :active-value="1"
                  :inactive-value="2"
                  @change="handleGameConfigStatusChange(scope.row)"
                />
              </template>
            </el-table-column>
            <el-table-column align="center" label="操作" min-width="100" fixed="right">
              <template #default="scope">
                <el-button type="primary" link icon="edit" @click="editGameConfig(scope.row)">编辑</el-button>
              </template>
            </el-table-column>
          </el-table>
        </div>
      </el-tab-pane>
    </el-tabs>

    <!-- 房间配置编辑对话框 -->
    <el-dialog v-model="roomDialog" :title="roomDialogTitle" width="600px">
      <el-form ref="roomForm" :model="roomForm" :rules="roomRules" label-width="100px">
        <el-form-item label="房间名称" prop="name">
          <el-input v-model="roomForm.name" placeholder="请输入房间名称" />
        </el-form-item>
        <el-form-item label="房间类型" prop="roomType">
          <el-select v-model="roomForm.roomType" placeholder="请选择房间类型">
            <el-option label="普通房间" :value="1" />
            <el-option label="VIP房间" :value="2" />
          </el-select>
        </el-form-item>
        <el-form-item label="房间等级" prop="roomLevel">
          <el-input-number v-model="roomForm.roomLevel" :min="1" :max="10" />
        </el-form-item>
        <el-form-item label="底分" prop="baseScore">
          <el-input-number v-model="roomForm.baseScore" :min="1" :max="1000" />
        </el-form-item>
        <el-form-item label="最低金币">
          <el-input-number v-model="roomForm.minCoins" :min="0" />
        </el-form-item>
        <el-form-item label="最高金币">
          <el-input-number v-model="roomForm.maxCoins" :min="0" placeholder="0表示无上限" />
        </el-form-item>
        <el-form-item label="服务费比例">
          <el-input-number v-model="roomForm.serviceFee" :min="0" :max="100" />
          <span style="margin-left: 10px;">%</span>
        </el-form-item>
        <el-form-item label="最大倍数">
          <el-input-number v-model="roomForm.maxMultiple" :min="1" :max="100" />
        </el-form-item>
        <el-form-item label="出牌超时">
          <el-input-number v-model="roomForm.timeout" :min="10" :max="120" />
          <span style="margin-left: 10px;">秒</span>
        </el-form-item>
        <el-form-item label="允许春天">
          <el-switch v-model="roomForm.allowSpring" :active-value="1" :inactive-value="0" />
        </el-form-item>
        <el-form-item label="允许炸弹">
          <el-switch v-model="roomForm.allowBomb" :active-value="1" :inactive-value="0" />
        </el-form-item>
        <el-form-item label="允许王炸">
          <el-switch v-model="roomForm.allowRocket" :active-value="1" :inactive-value="0" />
        </el-form-item>
        <el-form-item label="排序">
          <el-input-number v-model="roomForm.sort" :min="0" />
        </el-form-item>
        <el-form-item label="描述">
          <el-input v-model="roomForm.description" type="textarea" :rows="3" placeholder="房间描述" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="roomDialog = false">取消</el-button>
        <el-button type="primary" @click="saveRoom">确定</el-button>
      </template>
    </el-dialog>

    <!-- 游戏配置编辑对话框 -->
    <el-dialog v-model="gameConfigDialog" title="编辑游戏配置" width="500px">
      <el-form ref="gameConfigForm" :model="gameConfigForm" label-width="100px">
        <el-form-item label="配置键">
          <el-input v-model="gameConfigForm.configKey" disabled />
        </el-form-item>
        <el-form-item label="配置值">
          <el-input v-model="gameConfigForm.configValue" type="textarea" :rows="5" placeholder="请输入配置值" />
        </el-form-item>
        <el-form-item label="描述">
          <el-input v-model="gameConfigForm.description" placeholder="配置描述" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="gameConfigDialog = false">取消</el-button>
        <el-button type="primary" @click="saveGameConfig">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  getRoomConfigList,
  createRoomConfig,
  updateRoomConfig,
  deleteRoomConfig,
  getGameConfigList,
  updateGameConfig
} from '@/api/ddz/config'

defineOptions({
  name: 'DDZConfig'
})

const activeTab = ref('room')

const roomSearch = ref({
  roomType: null,
  status: null
})

const roomList = ref([])
const roomDialog = ref(false)
const roomDialogTitle = ref('新增房间')
const roomForm = ref({
  ID: null,
  name: '',
  roomType: 1,
  roomLevel: 1,
  baseScore: 100,
  minCoins: 0,
  maxCoins: 0,
  serviceFee: 0,
  maxMultiple: 20,
  timeout: 30,
  allowSpring: 1,
  allowBomb: 1,
  allowRocket: 1,
  status: 1,
  sort: 0,
  description: ''
})

const roomRules = {
  name: [{ required: true, message: '请输入房间名称', trigger: 'blur' }],
  roomType: [{ required: true, message: '请选择房间类型', trigger: 'change' }],
  roomLevel: [{ required: true, message: '请输入房间等级', trigger: 'blur' }],
  baseScore: [{ required: true, message: '请输入底分', trigger: 'blur' }]
}

const gameSearch = ref({
  configKey: ''
})

const gameConfigList = ref([])
const gameConfigDialog = ref(false)
const gameConfigForm = ref({
  ID: null,
  configKey: '',
  configValue: '',
  configType: 'string',
  description: '',
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

const getRoomList = async () => {
  const res = await getRoomConfigList({
    page: 1,
    pageSize: 100,
    ...roomSearch.value
  })
  if (res.code === 0) {
    roomList.value = res.data.list
  }
}

const addRoom = () => {
  roomDialogTitle.value = '新增房间'
  roomForm.value = {
    ID: null,
    name: '',
    roomType: 1,
    roomLevel: 1,
    baseScore: 100,
    minCoins: 0,
    maxCoins: 0,
    serviceFee: 0,
    maxMultiple: 20,
    timeout: 30,
    allowSpring: 1,
    allowBomb: 1,
    allowRocket: 1,
    status: 1,
    sort: 0,
    description: ''
  }
  roomDialog.value = true
}

const editRoom = (row) => {
  roomDialogTitle.value = '编辑房间'
  roomForm.value = { ...row }
  roomDialog.value = true
}

const saveRoom = async () => {
  let res
  if (roomForm.value.ID) {
    res = await updateRoomConfig(roomForm.value)
  } else {
    res = await createRoomConfig(roomForm.value)
  }
  if (res.code === 0) {
    ElMessage.success('保存成功')
    roomDialog.value = false
    getRoomList()
  }
}

const deleteRoom = (row) => {
  ElMessageBox.confirm('确定要删除该房间配置吗?', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(async () => {
    const res = await deleteRoomConfig({ id: row.ID })
    if (res.code === 0) {
      ElMessage.success('删除成功')
      getRoomList()
    }
  })
}

const handleRoomStatusChange = async (row) => {
  await updateRoomConfig({ ID: row.ID, status: row.status })
  ElMessage.success('状态更新成功')
}

const getGameConfigList = async () => {
  const res = await getGameConfigList({
    page: 1,
    pageSize: 100,
    ...gameSearch.value
  })
  if (res.code === 0) {
    gameConfigList.value = res.data.list
  }
}

const editGameConfig = (row) => {
  gameConfigForm.value = { ...row }
  gameConfigDialog.value = true
}

const saveGameConfig = async () => {
  const res = await updateGameConfig(gameConfigForm.value)
  if (res.code === 0) {
    ElMessage.success('保存成功')
    gameConfigDialog.value = false
    getGameConfigList()
  }
}

const handleGameConfigStatusChange = async (row) => {
  await updateGameConfig({ ID: row.ID, status: row.status })
  ElMessage.success('状态更新成功')
}

// 初始化
getRoomList()
getGameConfigList()
</script>

<style scoped>
.config-value-preview {
  color: #409eff;
  cursor: pointer;
}
</style>
