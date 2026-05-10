<template>
  <div class="game-config-management">
    <!-- 搜索区域 -->
    <div class="gva-search-box">
      <el-form ref="searchForm" :inline="true" :model="searchInfo">
        <el-form-item label="配置名称">
          <el-input v-model="searchInfo.name" placeholder="配置名称" clearable />
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
        <el-table-column align="center" label="配置键" min-width="120" prop="configKey" />
        <el-table-column align="center" label="配置值" min-width="150" prop="configValue" show-overflow-tooltip />
        <el-table-column align="center" label="描述" min-width="200" prop="description" show-overflow-tooltip />
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
    <el-dialog v-model="dialogVisible" :title="dialogTitle" width="500px" destroy-on-close>
      <el-form ref="formRef" :model="form" :rules="rules" label-width="80px">
        <el-form-item label="名称" prop="name">
          <el-input v-model="form.name" placeholder="请输入配置名称" />
        </el-form-item>
        <el-form-item label="键" prop="configKey">
          <el-input v-model="form.configKey" placeholder="请输入配置键" />
        </el-form-item>
        <el-form-item label="值" prop="configValue">
          <el-input v-model="form.configValue" placeholder="请输入配置值" />
        </el-form-item>
        <el-form-item label="描述" prop="description">
          <el-input v-model="form.description" type="textarea" :rows="2" placeholder="请输入描述" />
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
import { getGameConfigList, createGameConfig, updateGameConfig, deleteGameConfig } from '@/api/ddz/gameConfig'

defineOptions({
  name: 'DDZGameConfig'
})

const searchInfo = ref({ name: '' })
const page = ref(1)
const total = ref(0)
const pageSize = ref(10)
const tableData = ref([])

const dialogVisible = ref(false)
const dialogTitle = ref('新增配置')
const formRef = ref(null)
const form = ref({ ID: null, name: '', configKey: '', configValue: '', description: '' })
const rules = {
  name: [{ required: true, message: '请输入配置名称', trigger: 'blur' }],
  configKey: [{ required: true, message: '请输入配置键', trigger: 'blur' }]
}

const openCreateDialog = () => {
  dialogTitle.value = '新增配置'
  form.value = { ID: null, name: '', configKey: '', configValue: '', description: '' }
  dialogVisible.value = true
}

const openEditDialog = (row) => {
  dialogTitle.value = '编辑配置'
  form.value = { ...row }
  dialogVisible.value = true
}

const handleSubmit = async () => {
  await formRef.value.validate()
  const res = form.value.ID ? await updateGameConfig(form.value) : await createGameConfig(form.value)
  if (res.code === 0) {
    ElMessage.success(form.value.ID ? '更新成功' : '创建成功')
    dialogVisible.value = false
    getTableData()
  }
}

const handleDelete = async (row) => {
  await ElMessageBox.confirm('确定要删除该配置吗？', '提示', { type: 'warning' })
  const res = await deleteGameConfig({ ID: row.ID })
  if (res.code === 0) {
    ElMessage.success('删除成功')
    getTableData()
  }
}

const onSubmit = () => { page.value = 1; getTableData() }
const onReset = () => { searchInfo.value = { name: '' }; getTableData() }
const handleSizeChange = (val) => { pageSize.value = val; getTableData() }
const handleCurrentChange = (val) => { page.value = val; getTableData() }

const getTableData = async () => {
  const res = await getGameConfigList({ page: page.value, pageSize: pageSize.value, ...searchInfo.value })
  if (res.code === 0) {
    tableData.value = res.data.list || []
    total.value = res.data.total || 0
  }
}

getTableData()
</script>
