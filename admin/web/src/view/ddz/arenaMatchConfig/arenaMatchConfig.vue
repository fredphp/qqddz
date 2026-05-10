<template>
  <div class="arena-match-config-management">
    <!-- 搜索区域 -->
    <div class="gva-search-box">
      <el-form ref="searchForm" :inline="true" :model="searchInfo">
        <el-form-item label="配置名称">
          <el-input v-model="searchInfo.name" placeholder="配置名称" clearable />
        </el-form-item>
        <el-form-item label="状态">
          <el-select v-model="searchInfo.status" placeholder="状态" clearable style="width: 120px">
            <el-option label="启用" :value="1" />
            <el-option label="禁用" :value="0" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" icon="Search" @click="onSubmit">查询</el-button>
          <el-button icon="Refresh" @click="onReset">重置</el-button>
          <el-button type="primary" icon="Plus" @click="openCreateDialog">新增配置</el-button>
        </el-form-item>
      </el-form>
    </div>

    <!-- 表格区域 -->
    <div class="gva-table-box">
      <el-table :data="tableData" row-key="ID" stripe>
        <el-table-column align="center" label="ID" min-width="80" prop="ID" />
        <el-table-column align="center" label="配置名称" min-width="120" prop="name" />
        <el-table-column align="center" label="报名费" min-width="100" prop="entryFee" />
        <el-table-column align="center" label="初始金币" min-width="100" prop="initGold" />
        <el-table-column align="center" label="底注" min-width="80" prop="baseScore" />
        <el-table-column align="center" label="最大玩家数" min-width="100" prop="maxPlayers" />
        <el-table-column align="center" label="阶段时长(秒)" min-width="110" prop="phaseDuration" />
        <el-table-column align="center" label="状态" min-width="80">
          <template #default="scope">
            <el-tag :type="scope.row.status === 1 ? 'success' : 'danger'" size="small">
              {{ scope.row.status === 1 ? '启用' : '禁用' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column align="center" label="创建时间" min-width="160" prop="createdAt" />
        <el-table-column align="center" label="操作" min-width="150" fixed="right">
          <template #default="scope">
            <el-button type="primary" link icon="Edit" @click="openEditDialog(scope.row)">编辑</el-button>
            <el-button type="danger" link icon="Delete" @click="handleDelete(scope.row)">删除</el-button>
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
    <el-dialog v-model="dialogVisible" :title="dialogTitle" width="600px" destroy-on-close>
      <el-form ref="formRef" :model="form" :rules="rules" label-width="100px">
        <el-form-item label="配置名称" prop="name">
          <el-input v-model="form.name" placeholder="请输入配置名称" />
        </el-form-item>
        <el-form-item label="报名费" prop="entryFee">
          <el-input-number v-model="form.entryFee" :min="0" style="width: 200px" />
        </el-form-item>
        <el-form-item label="初始金币" prop="initGold">
          <el-input-number v-model="form.initGold" :min="0" style="width: 200px" />
        </el-form-item>
        <el-form-item label="底注" prop="baseScore">
          <el-input-number v-model="form.baseScore" :min="0" style="width: 200px" />
        </el-form-item>
        <el-form-item label="最大玩家数" prop="maxPlayers">
          <el-input-number v-model="form.maxPlayers" :min="2" :max="100" style="width: 200px" />
        </el-form-item>
        <el-form-item label="阶段时长" prop="phaseDuration">
          <el-input-number v-model="form.phaseDuration" :min="30" :max="3600" style="width: 200px" />
          <span style="margin-left: 10px">秒</span>
        </el-form-item>
        <el-form-item label="状态" prop="status">
          <el-radio-group v-model="form.status">
            <el-radio :value="1">启用</el-radio>
            <el-radio :value="0">禁用</el-radio>
          </el-radio-group>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSubmit">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { getArenaMatchConfigList, createArenaMatchConfig, updateArenaMatchConfig, deleteArenaMatchConfig } from '@/api/ddz/arenaMatchConfig'

defineOptions({
  name: 'DDZArenaMatchConfig'
})

// 搜索相关
const searchInfo = ref({
  name: '',
  status: null
})

// 分页相关
const page = ref(1)
const total = ref(0)
const pageSize = ref(10)
const tableData = ref([])

// 对话框相关
const dialogVisible = ref(false)
const dialogTitle = ref('新增配置')
const formRef = ref(null)
const form = ref({
  ID: null,
  name: '',
  entryFee: 100,
  initGold: 1000,
  baseScore: 40,
  maxPlayers: 36,
  phaseDuration: 300,
  status: 1
})

const rules = {
  name: [{ required: true, message: '请输入配置名称', trigger: 'blur' }]
}

// 打开创建对话框
const openCreateDialog = () => {
  dialogTitle.value = '新增配置'
  form.value = {
    ID: null,
    name: '',
    entryFee: 100,
    initGold: 1000,
    baseScore: 40,
    maxPlayers: 36,
    phaseDuration: 300,
    status: 1
  }
  dialogVisible.value = true
}

// 打开编辑对话框
const openEditDialog = (row) => {
  dialogTitle.value = '编辑配置'
  form.value = { ...row }
  dialogVisible.value = true
}

// 提交表单
const handleSubmit = async () => {
  await formRef.value.validate()
  const res = form.value.ID
    ? await updateArenaMatchConfig(form.value)
    : await createArenaMatchConfig(form.value)
  if (res.code === 0) {
    ElMessage.success(form.value.ID ? '更新成功' : '创建成功')
    dialogVisible.value = false
    getTableData()
  }
}

// 删除配置
const handleDelete = async (row) => {
  await ElMessageBox.confirm('确定要删除该配置吗？', '提示', { type: 'warning' })
  const res = await deleteArenaMatchConfig({ ID: row.ID })
  if (res.code === 0) {
    ElMessage.success('删除成功')
    getTableData()
  }
}

// 搜索方法
const onSubmit = () => {
  page.value = 1
  getTableData()
}

const onReset = () => {
  searchInfo.value = { name: '', status: null }
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

// 获取表格数据
const getTableData = async () => {
  const res = await getArenaMatchConfigList({
    page: page.value,
    pageSize: pageSize.value,
    ...searchInfo.value
  })
  if (res.code === 0) {
    tableData.value = res.data.list || []
    total.value = res.data.total || 0
  }
}

// 初始化
getTableData()
</script>
