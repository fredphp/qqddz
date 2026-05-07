<template>
  <div class="robot-config-management">
    <!-- 搜索区域 -->
    <div class="gva-search-box">
      <el-form ref="searchForm" :inline="true" :model="searchInfo">
        <el-form-item label="配置名称">
          <el-input v-model="searchInfo.configName" placeholder="配置名称" clearable />
        </el-form-item>
        <el-form-item label="状态">
          <el-select v-model="searchInfo.status" placeholder="状态" clearable style="width: 120px">
            <el-option label="启用" :value="1" />
            <el-option label="禁用" :value="0" />
          </el-select>
        </el-form-item>
        <el-form-item label="默认配置">
          <el-select v-model="searchInfo.isDefault" placeholder="是否默认" clearable style="width: 120px">
            <el-option label="是" :value="1" />
            <el-option label="否" :value="0" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" icon="Search" @click="onSubmit">查询</el-button>
          <el-button icon="Refresh" @click="onReset">重置</el-button>
        </el-form-item>
      </el-form>
    </div>

    <!-- 表格区域 -->
    <div class="gva-table-box">
      <div class="gva-btn-list">
        <el-button type="primary" icon="Plus" @click="openCreateDialog">新建配置</el-button>
      </div>

      <el-table :data="tableData" row-key="id" stripe>
        <el-table-column align="center" label="ID" min-width="60" prop="id" />
        <el-table-column align="center" label="配置名称" min-width="120" prop="configName" />
        <el-table-column align="center" label="思考时间(ms)" min-width="140">
          <template #default="scope">
            <span>{{ scope.row.minThinkTime }} ~ {{ scope.row.maxThinkTime }}</span>
          </template>
        </el-table-column>
        <el-table-column align="center" label="炸弹思考(ms)" min-width="100" prop="bombThinkTime" />
        <el-table-column align="center" label="炸弹概率" min-width="80">
          <template #default="scope">
            <span>{{ (scope.row.bombProbability * 100).toFixed(0) }}%</span>
          </template>
        </el-table-column>
        <el-table-column align="center" label="抢地主概率" min-width="90">
          <template #default="scope">
            <span>{{ (scope.row.landlordBidProbability * 100).toFixed(0) }}%</span>
          </template>
        </el-table-column>
        <el-table-column align="center" label="让牌概率" min-width="80">
          <template #default="scope">
            <span>{{ (scope.row.letWinProbability * 100).toFixed(0) }}%</span>
          </template>
        </el-table-column>
        <el-table-column align="center" label="让牌排名" min-width="80" prop="letWinMinRank" />
        <el-table-column align="center" label="状态" min-width="80">
          <template #default="scope">
            <el-tag :type="scope.row.status === 1 ? 'success' : 'danger'" size="small">
              {{ scope.row.status === 1 ? '启用' : '禁用' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column align="center" label="默认" min-width="70">
          <template #default="scope">
            <el-tag v-if="scope.row.isDefault === 1" type="warning" size="small">默认</el-tag>
            <span v-else class="text-muted">-</span>
          </template>
        </el-table-column>
        <el-table-column align="center" label="描述" min-width="150" prop="description" show-overflow-tooltip />
        <el-table-column align="center" label="创建时间" min-width="150" prop="createdAt" />
        <el-table-column align="center" label="操作" min-width="200" fixed="right">
          <template #default="scope">
            <el-button type="primary" link icon="Edit" @click="openEditDialog(scope.row)">编辑</el-button>
            <el-button
              v-if="scope.row.isDefault !== 1"
              type="warning"
              link
              icon="Star"
              @click="handleSetDefault(scope.row)"
            >
              设为默认
            </el-button>
            <el-button
              v-if="scope.row.isDefault !== 1"
              type="danger"
              link
              icon="Delete"
              @click="handleDelete(scope.row)"
            >
              删除
            </el-button>
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

    <!-- 创建/编辑对话框 -->
    <el-dialog v-model="dialogVisible" :title="dialogTitle" width="650px" destroy-on-close>
      <el-form ref="formRef" :model="formData" :rules="formRules" label-width="120px">
        <el-form-item label="配置名称" prop="configName">
          <el-input v-model="formData.configName" placeholder="请输入配置名称" />
        </el-form-item>

        <el-divider content-position="left">思考时间设置</el-divider>

        <el-form-item label="最小思考时间" prop="minThinkTime">
          <el-input-number v-model="formData.minThinkTime" :min="500" :max="10000" :step="100" />
          <span class="form-tip">毫秒</span>
        </el-form-item>
        <el-form-item label="最大思考时间" prop="maxThinkTime">
          <el-input-number v-model="formData.maxThinkTime" :min="500" :max="10000" :step="100" />
          <span class="form-tip">毫秒</span>
        </el-form-item>
        <el-form-item label="炸弹思考时间" prop="bombThinkTime">
          <el-input-number v-model="formData.bombThinkTime" :min="500" :max="10000" :step="100" />
          <span class="form-tip">毫秒</span>
        </el-form-item>

        <el-divider content-position="left">行为概率设置</el-divider>

        <el-form-item label="炸弹使用概率" prop="bombProbability">
          <el-slider v-model="formData.bombProbability" :min="0" :max="1" :step="0.01" show-input />
        </el-form-item>
        <el-form-item label="抢地主概率" prop="landlordBidProbability">
          <el-slider v-model="formData.landlordBidProbability" :min="0" :max="1" :step="0.01" show-input />
        </el-form-item>

        <el-divider content-position="left">让牌策略设置</el-divider>

        <el-form-item label="让牌概率" prop="letWinProbability">
          <el-slider v-model="formData.letWinProbability" :min="0" :max="1" :step="0.01" show-input />
        </el-form-item>
        <el-form-item label="触发让牌排名" prop="letWinMinRank">
          <el-input-number v-model="formData.letWinMinRank" :min="1" :max="10" />
          <span class="form-tip">剩余人数≤此值时触发</span>
        </el-form-item>

        <el-divider content-position="left">其他设置</el-divider>

        <el-form-item label="状态">
          <el-radio-group v-model="formData.status">
            <el-radio :value="1">启用</el-radio>
            <el-radio :value="0">禁用</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="设为默认">
          <el-switch v-model="formData.isDefault" :active-value="1" :inactive-value="0" />
        </el-form-item>
        <el-form-item label="描述">
          <el-input v-model="formData.description" type="textarea" :rows="3" placeholder="请输入配置描述（选填）" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="submitLoading" @click="handleSubmit">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  getRobotConfigList,
  getRobotConfigInfo,
  createRobotConfig,
  updateRobotConfig,
  deleteRobotConfig,
  setDefaultConfig
} from '@/api/ddz/robotConfig'

defineOptions({
  name: 'DDZRobotConfig'
})

// 搜索相关
const searchInfo = ref({
  configName: '',
  status: null,
  isDefault: null
})

// 分页相关
const page = ref(1)
const total = ref(0)
const pageSize = ref(10)
const tableData = ref([])

// 对话框相关
const dialogVisible = ref(false)
const dialogTitle = ref('新建配置')
const isEdit = ref(false)
const submitLoading = ref(false)

// 表单数据
const formData = ref({
  id: null,
  configName: '',
  minThinkTime: 1500,
  maxThinkTime: 3000,
  bombThinkTime: 4000,
  bombProbability: 0.6,
  landlordBidProbability: 0.5,
  letWinProbability: 0.85,
  letWinMinRank: 3,
  status: 1,
  isDefault: 0,
  description: ''
})

// 表单验证规则
const formRules = {
  configName: [
    { required: true, message: '请输入配置名称', trigger: 'blur' }
  ],
  minThinkTime: [
    { required: true, message: '请输入最小思考时间', trigger: 'blur' }
  ],
  maxThinkTime: [
    { required: true, message: '请输入最大思考时间', trigger: 'blur' }
  ],
  bombThinkTime: [
    { required: true, message: '请输入炸弹思考时间', trigger: 'blur' }
  ]
}

// 获取表格数据
const getTableData = async () => {
  const res = await getRobotConfigList({
    page: page.value,
    pageSize: pageSize.value,
    ...searchInfo.value
  })
  if (res.code === 0) {
    tableData.value = res.data.list
    total.value = res.data.total
  }
}

// 搜索方法
const onSubmit = () => {
  page.value = 1
  getTableData()
}

const onReset = () => {
  searchInfo.value = {
    configName: '',
    status: null,
    isDefault: null
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

// 打开创建对话框
const openCreateDialog = () => {
  isEdit.value = false
  dialogTitle.value = '新建配置'
  formData.value = {
    id: null,
    configName: '',
    minThinkTime: 1500,
    maxThinkTime: 3000,
    bombThinkTime: 4000,
    bombProbability: 0.6,
    landlordBidProbability: 0.5,
    letWinProbability: 0.85,
    letWinMinRank: 3,
    status: 1,
    isDefault: 0,
    description: ''
  }
  dialogVisible.value = true
}

// 打开编辑对话框
const openEditDialog = async (row) => {
  isEdit.value = true
  dialogTitle.value = '编辑配置'
  const res = await getRobotConfigInfo(row.id)
  if (res.code === 0) {
    formData.value = {
      id: res.data.id,
      configName: res.data.configName,
      minThinkTime: res.data.minThinkTime,
      maxThinkTime: res.data.maxThinkTime,
      bombThinkTime: res.data.bombThinkTime,
      bombProbability: res.data.bombProbability,
      landlordBidProbability: res.data.landlordBidProbability,
      letWinProbability: res.data.letWinProbability,
      letWinMinRank: res.data.letWinMinRank,
      status: res.data.status,
      isDefault: res.data.isDefault,
      description: res.data.description || ''
    }
    dialogVisible.value = true
  }
}

// 提交表单
const handleSubmit = async () => {
  submitLoading.value = true
  try {
    let res
    if (isEdit.value) {
      res = await updateRobotConfig(formData.value)
    } else {
      res = await createRobotConfig(formData.value)
    }
    if (res.code === 0) {
      ElMessage.success(isEdit.value ? '更新成功' : '创建成功')
      dialogVisible.value = false
      getTableData()
    }
  } finally {
    submitLoading.value = false
  }
}

// 设置默认配置
const handleSetDefault = async (row) => {
  try {
    await ElMessageBox.confirm(
      `确定要将【${row.configName}】设置为默认配置吗？`,
      '确认操作',
      { type: 'warning' }
    )
    const res = await setDefaultConfig(row.id)
    if (res.code === 0) {
      ElMessage.success('设置成功')
      getTableData()
    }
  } catch {
    // 用户取消
  }
}

// 删除配置
const handleDelete = async (row) => {
  try {
    await ElMessageBox.confirm(
      `确定要删除【${row.configName}】吗？`,
      '确认删除',
      { type: 'warning' }
    )
    const res = await deleteRobotConfig(row.id)
    if (res.code === 0) {
      ElMessage.success('删除成功')
      getTableData()
    }
  } catch {
    // 用户取消
  }
}

// 初始化
getTableData()
</script>

<style scoped>
.robot-config-management {
  padding: 0;
}

.form-tip {
  margin-left: 10px;
  color: #909399;
  font-size: 12px;
}

.text-muted {
  color: #909399;
}

:deep(.el-divider__text) {
  font-weight: 500;
  color: #303133;
}

:deep(.el-slider) {
  width: 300px;
}
</style>
