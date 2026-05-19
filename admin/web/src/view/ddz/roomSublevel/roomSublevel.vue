<template>
  <div>
    <!-- 说明提示 -->
    <el-alert
      title="子分区配置说明"
      type="info"
      :closable="false"
      show-icon
      class="mb-4"
    >
      <template #default>
        <p style="margin: 0;">
          <strong>功能说明：</strong>子分区用于练级区（普通房间）的不同底分场次配置。
        </p>
        <p style="margin: 8px 0 0 0;">
          1. 子分区分为：10分场、50分场、200分场、500分场、1000分场等<br>
          2. 升级规则：玩家达到50倍基础分时自动升级到下一场次<br>
          3. 只有普通房间（room_category=1）才能配置子分区
        </p>
      </template>
    </el-alert>

    <div class="gva-search-box">
      <el-form ref="searchForm" :inline="true" :model="searchInfo">
        <el-form-item label="房间配置">
          <el-select v-model="searchInfo.roomConfigId" placeholder="选择房间配置" clearable style="width: 200px">
            <el-option 
              v-for="item in roomConfigOptions" 
              :key="item.ID" 
              :label="item.roomName + (item.roomCategory === 1 ? '(练级区)' : '(竞技场)')" 
              :value="item.ID"
              :disabled="item.roomCategory !== 1"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="子分区名称">
          <el-input v-model="searchInfo.sublevelName" placeholder="子分区名称" clearable />
        </el-form-item>
        <el-form-item label="状态">
          <el-select v-model="searchInfo.status" placeholder="状态" clearable>
            <el-option label="开启" :value="1" />
            <el-option label="关闭" :value="0" />
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
        <el-button type="primary" icon="plus" @click="openDialog('add')">新增子分区</el-button>
        <el-button type="success" icon="magic-stick" @click="openBatchDialog">批量创建默认子分区</el-button>
        <el-button type="warning" icon="refresh" @click="handleRefreshCache">刷新缓存</el-button>
      </div>
      <el-table :data="tableData" row-key="ID">
        <el-table-column align="center" label="ID" min-width="60" prop="ID" />
        <el-table-column align="center" label="所属房间" min-width="120">
          <template #default="scope">
            {{ getRoomConfigName(scope.row.roomConfigId) }}
          </template>
        </el-table-column>
        <el-table-column align="center" label="子分区名称" min-width="100" prop="sublevelName" />
        <el-table-column align="center" label="底分" min-width="80">
          <template #default="scope">
            <el-tag type="primary">{{ scope.row.baseScore }}分</el-tag>
          </template>
        </el-table-column>
        <el-table-column align="center" label="升级分数" min-width="100">
          <template #default="scope">
            <span class="text-warning">{{ formatGold(scope.row.upgradeScore) }}</span>
            <span class="text-xs text-gray-400 ml-1">({{ scope.row.baseScore * 50 }}倍)</span>
          </template>
        </el-table-column>
        <el-table-column align="center" label="最低入场" min-width="100">
          <template #default="scope">
            {{ formatGold(scope.row.minGold) }}
          </template>
        </el-table-column>
        <el-table-column align="center" label="最高入场" min-width="100">
          <template #default="scope">
            {{ scope.row.maxGold > 0 ? formatGold(scope.row.maxGold) : '无限制' }}
          </template>
        </el-table-column>
        <el-table-column align="center" label="下一子分区" min-width="100">
          <template #default="scope">
            <span v-if="scope.row.nextSublevelId > 0">{{ getSublevelName(scope.row.nextSublevelId) }}</span>
            <span v-else class="text-gray-400">最高级</span>
          </template>
        </el-table-column>
        <el-table-column align="center" label="上一子分区" min-width="100">
          <template #default="scope">
            <span v-if="scope.row.prevSublevelId > 0">{{ getSublevelName(scope.row.prevSublevelId) }}</span>
            <span v-else class="text-gray-400">最低级</span>
          </template>
        </el-table-column>
        <el-table-column align="center" label="机器人" min-width="80">
          <template #default="scope">
            {{ scope.row.botEnabled ? '是(' + scope.row.botCount + ')' : '否' }}
          </template>
        </el-table-column>
        <el-table-column align="center" label="超时时间" min-width="80">
          <template #default="scope">
            {{ scope.row.timeoutSeconds }}秒
          </template>
        </el-table-column>
        <el-table-column align="center" label="状态" min-width="80">
          <template #default="scope">
            <el-tag :type="scope.row.status === 1 ? 'success' : 'danger'">
              {{ scope.row.status === 1 ? '开启' : '关闭' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column align="center" label="排序" min-width="60" prop="sortOrder" />
        <el-table-column align="center" label="操作" min-width="120" fixed="right">
          <template #default="scope">
            <el-button type="primary" link icon="edit" @click="openDialog('edit', scope.row)">编辑</el-button>
            <el-popconfirm title="确定删除吗？" @confirm="deleteRow(scope.row)">
              <template #reference>
                <el-button type="danger" link icon="delete">删除</el-button>
              </template>
            </el-popconfirm>
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

    <!-- 编辑对话框 -->
    <el-dialog v-model="dialogVisible" :title="dialogType === 'add' ? '新增子分区' : '编辑子分区'" width="700px">
      <el-form ref="formRef" :model="formData" label-width="100px">
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="所属房间" prop="roomConfigId" required>
              <el-select v-model="formData.roomConfigId" placeholder="选择房间配置" style="width: 100%" :disabled="dialogType === 'edit'">
                <el-option 
                  v-for="item in roomConfigOptions" 
                  :key="item.ID" 
                  :label="item.roomName" 
                  :value="item.ID"
                  :disabled="item.roomCategory !== 1"
                />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="子分区名称" prop="sublevelName" required>
              <el-input v-model="formData.sublevelName" placeholder="如：10分场、50分场" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="底分" prop="baseScore" required>
              <el-select v-model="formData.baseScore" placeholder="选择底分" style="width: 100%">
                <el-option label="10分场" :value="10" />
                <el-option label="50分场" :value="50" />
                <el-option label="200分场" :value="200" />
                <el-option label="500分场" :value="500" />
                <el-option label="1000分场" :value="1000" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="升级分数" prop="upgradeScore">
              <el-input-number v-model="formData.upgradeScore" :min="0" style="width: 100%" />
              <div class="text-xs text-gray-500 mt-1">留空自动计算为底分×50</div>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="最低入场金币" prop="minGold">
              <el-input-number v-model="formData.minGold" :min="0" :step="1000" style="width: 100%" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="最高入场金币" prop="maxGold">
              <el-input-number v-model="formData.maxGold" :min="0" :step="1000" style="width: 100%" />
              <div class="text-xs text-gray-500 mt-1">0表示无限制</div>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="下一子分区" prop="nextSublevelId">
              <el-select v-model="formData.nextSublevelId" placeholder="选择下一子分区" clearable style="width: 100%">
                <el-option 
                  v-for="item in sublevelOptions" 
                  :key="item.ID" 
                  :label="item.sublevelName" 
                  :value="item.ID"
                  :disabled="item.ID === formData.ID"
                />
              </el-select>
              <div class="text-xs text-gray-500 mt-1">升级后进入的子分区</div>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="上一子分区" prop="prevSublevelId">
              <el-select v-model="formData.prevSublevelId" placeholder="选择上一子分区" clearable style="width: 100%">
                <el-option 
                  v-for="item in sublevelOptions" 
                  :key="item.ID" 
                  :label="item.sublevelName" 
                  :value="item.ID"
                  :disabled="item.ID === formData.ID"
                />
              </el-select>
              <div class="text-xs text-gray-500 mt-1">降级后进入的子分区</div>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="允许机器人" prop="botEnabled">
              <el-switch v-model="formData.botEnabled" :active-value="1" :inactive-value="0" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item v-if="formData.botEnabled" label="机器人数量" prop="botCount">
              <el-input-number v-model="formData.botCount" :min="0" :max="10" style="width: 100%" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="超时时间(秒)" prop="timeoutSeconds">
              <el-input-number v-model="formData.timeoutSeconds" :min="10" :max="120" style="width: 100%" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="状态" prop="status">
              <el-switch v-model="formData.status" :active-value="1" :inactive-value="0" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="排序权重" prop="sortOrder">
              <el-input-number v-model="formData.sortOrder" :min="0" style="width: 100%" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-form-item label="描述" prop="description">
          <el-input v-model="formData.description" type="textarea" rows="2" placeholder="请输入描述" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="submitForm">确定</el-button>
      </template>
    </el-dialog>

    <!-- 批量创建对话框 -->
    <el-dialog v-model="batchDialogVisible" title="批量创建默认子分区" width="500px">
      <el-form label-width="100px">
        <el-form-item label="选择房间">
          <el-select v-model="selectedRoomConfigId" placeholder="选择房间配置" style="width: 100%">
            <el-option 
              v-for="item in roomConfigOptions.filter(r => r.roomCategory === 1)" 
              :key="item.ID" 
              :label="item.roomName" 
              :value="item.ID"
            />
          </el-select>
        </el-form-item>
        <el-alert type="info" :closable="false" class="mt-4">
          <template #default>
            <p>将自动创建以下子分区：</p>
            <ul style="margin: 8px 0 0 0; padding-left: 20px;">
              <li>10分场 - 底分10，入场500-5000</li>
              <li>50分场 - 底分50，入场2500-25000</li>
              <li>200分场 - 底分200，入场10000-100000</li>
              <li>500分场 - 底分500，入场25000-250000</li>
              <li>1000分场 - 底分1000，入场50000-500000</li>
            </ul>
            <p class="mt-2 text-warning">注意：已存在子分区的房间将无法创建</p>
          </template>
        </el-alert>
      </el-form>
      <template #footer>
        <el-button @click="batchDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleBatchCreate" :loading="batchCreating">确定创建</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { 
  getRoomSublevelList, 
  createRoomSublevel, 
  updateRoomSublevel, 
  deleteRoomSublevel,
  batchCreateDefaultSublevels,
  refreshSublevelCache
} from '@/api/ddz/roomSublevel'
import { getRoomConfigList } from '@/api/ddz/gameLog'
import { ElMessage } from 'element-plus'

defineOptions({
  name: 'DDZRoomSublevel'
})

const searchInfo = ref({
  roomConfigId: null,
  sublevelName: '',
  status: null
})

const page = ref(1)
const total = ref(0)
const pageSize = ref(10)
const tableData = ref([])
const roomConfigOptions = ref([])
const sublevelOptions = ref([])

const dialogVisible = ref(false)
const dialogType = ref('add')
const formRef = ref(null)

const batchDialogVisible = ref(false)
const selectedRoomConfigId = ref(null)
const batchCreating = ref(false)

const formData = ref({
  ID: 0,
  roomConfigId: null,
  sublevelName: '',
  baseScore: 10,
  minGold: 500,
  maxGold: 5000,
  upgradeScore: 0,
  nextSublevelId: 0,
  prevSublevelId: 0,
  botEnabled: 1,
  botCount: 2,
  timeoutSeconds: 30,
  status: 1,
  sortOrder: 0,
  description: ''
})

const formatGold = (gold) => {
  if (gold >= 10000) {
    return (gold / 10000).toFixed(1) + '万'
  }
  return gold ? gold.toLocaleString() : '0'
}

const getRoomConfigName = (id) => {
  const room = roomConfigOptions.value.find(r => r.ID === id)
  return room ? room.roomName : '-'
}

const getSublevelName = (id) => {
  const sublevel = sublevelOptions.value.find(s => s.ID === id)
  return sublevel ? sublevel.sublevelName : '-'
}

const onSubmit = () => {
  page.value = 1
  getTableData()
}

const onReset = () => {
  searchInfo.value = {
    roomConfigId: null,
    sublevelName: '',
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
  const params = {
    page: page.value,
    pageSize: pageSize.value,
    ...searchInfo.value
  }
  const res = await getRoomSublevelList(params)
  if (res.code === 0) {
    tableData.value = res.data.list || []
    total.value = res.data.total
    // 更新子分区选项
    sublevelOptions.value = tableData.value
  }
}

const getRoomConfigData = async () => {
  const res = await getRoomConfigList({ page: 1, pageSize: 100 })
  if (res.code === 0) {
    roomConfigOptions.value = res.data.list || []
  }
}

const openDialog = (type, row = null) => {
  dialogType.value = type
  if (type === 'edit' && row) {
    formData.value = { ...row }
  } else {
    formData.value = {
      ID: 0,
      roomConfigId: null,
      sublevelName: '',
      baseScore: 10,
      minGold: 500,
      maxGold: 5000,
      upgradeScore: 0,
      nextSublevelId: 0,
      prevSublevelId: 0,
      botEnabled: 1,
      botCount: 2,
      timeoutSeconds: 30,
      status: 1,
      sortOrder: 0,
      description: ''
    }
  }
  dialogVisible.value = true
}

const openBatchDialog = () => {
  selectedRoomConfigId.value = null
  batchDialogVisible.value = true
}

const submitForm = async () => {
  const api = dialogType.value === 'add' ? createRoomSublevel : updateRoomSublevel
  const res = await api(formData.value)
  if (res.code === 0) {
    ElMessage.success('操作成功')
    dialogVisible.value = false
    getTableData()
  }
}

const deleteRow = async (row) => {
  const res = await deleteRoomSublevel(row.ID)
  if (res.code === 0) {
    ElMessage.success('删除成功')
    getTableData()
  }
}

const handleBatchCreate = async () => {
  if (!selectedRoomConfigId.value) {
    ElMessage.warning('请选择房间配置')
    return
  }
  
  batchCreating.value = true
  try {
    const res = await batchCreateDefaultSublevels(selectedRoomConfigId.value)
    if (res.code === 0) {
      ElMessage.success('批量创建成功')
      batchDialogVisible.value = false
      getTableData()
    }
  } finally {
    batchCreating.value = false
  }
}

const handleRefreshCache = async () => {
  const res = await refreshSublevelCache()
  if (res.code === 0) {
    ElMessage.success('缓存刷新成功')
  }
}

onMounted(() => {
  getTableData()
  getRoomConfigData()
})
</script>

<style scoped>
.mb-4 {
  margin-bottom: 16px;
}
.mt-4 {
  margin-top: 16px;
}
.mt-2 {
  margin-top: 8px;
}
.ml-1 {
  margin-left: 4px;
}
.text-warning {
  color: #e6a23c;
}
.text-gray-400 {
  color: #9ca3af;
}
.text-xs {
  font-size: 12px;
}
</style>
