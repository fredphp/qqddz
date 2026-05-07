<template>
  <div>
    <div class="gva-search-box">
      <el-form
        ref="elSearchFormRef"
        :inline="true"
        :model="searchInfo"
        class="demo-form-inline"
        :rules="searchRule"
        @keyup.enter="onSubmit"
      >
        <el-form-item label="创建日期" prop="createdAt">
          <template #label>
            <span>
              创建日期
              <el-tooltip content="搜索范围是开始日期（包含）至结束日期（不包含）">
                <el-icon><QuestionFilled /></el-icon>
              </el-tooltip>
            </span>
          </template>
          <el-date-picker
            v-model="searchInfo.startCreatedAt"
            type="datetime"
            placeholder="开始日期"
            :disabled-date="(time) => searchInfo.endCreatedAt ? time.getTime() > searchInfo.endCreatedAt.getTime() : false"
          ></el-date-picker>
          —
          <el-date-picker
            v-model="searchInfo.endCreatedAt"
            type="datetime"
            placeholder="结束日期"
            :disabled-date="(time) => searchInfo.startCreatedAt ? time.getTime() < searchInfo.startCreatedAt.getTime() : false"
          ></el-date-picker>
        </el-form-item>

        <el-form-item label="协议标题" prop="title">
          <el-input v-model="searchInfo.title" placeholder="搜索条件" />
        </el-form-item>
        <el-form-item label="版本号" prop="version">
          <el-input v-model="searchInfo.version" placeholder="搜索条件" />
        </el-form-item>
        <el-form-item label="状态" prop="status">
          <el-select v-model="searchInfo.status" placeholder="请选择" clearable>
            <el-option label="启用" :value="1" />
            <el-option label="禁用" :value="0" />
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
        <el-button type="primary" icon="plus" @click="openDialog">新增</el-button>
        <el-button
          icon="delete"
          style="margin-left: 10px"
          :disabled="!multipleSelection.length"
          @click="onDelete"
        >删除</el-button>
      </div>
      <el-table
        ref="multipleTable"
        style="width: 100%"
        tooltip-effect="dark"
        :data="tableData"
        row-key="ID"
        @selection-change="handleSelectionChange"
      >
        <el-table-column type="selection" width="55" />

        <el-table-column align="center" label="日期" prop="createdAt" width="180">
          <template #default="scope">{{ formatDate(scope.row.CreatedAt) }}</template>
        </el-table-column>

        <el-table-column align="center" label="协议标题" prop="title" min-width="150" />
        <el-table-column align="center" label="版本号" prop="version" width="100" />
        <el-table-column align="center" label="排序" prop="sort" width="80" />
        <el-table-column align="center" label="状态" prop="status" width="100">
          <template #default="scope">
            <el-tag :type="scope.row.status === 1 ? 'success' : 'danger'">
              {{ scope.row.status === 1 ? '启用' : '禁用' }}
            </el-tag>
          </template>
        </el-table-column>

        <el-table-column align="center" label="操作" fixed="right" min-width="280">
          <template #default="scope">
            <el-button
              type="primary"
              link
              icon="edit"
              class="table-button"
              @click="updateSysUserAgreementFunc(scope.row)"
            >编辑</el-button>
            <el-button
              type="primary"
              link
              @click="toggleStatus(scope.row)"
            >
              {{ scope.row.status === 1 ? '禁用' : '启用' }}
            </el-button>
            <el-button
              type="danger"
              link
              icon="delete"
              @click="deleteRow(scope.row)"
            >删除</el-button>
          </template>
        </el-table-column>
      </el-table>
      <div class="gva-pagination">
        <el-pagination
          layout="total, sizes, prev, pager, next, jumper"
          :current-page="page"
          :page-size="pageSize"
          :page-sizes="[10, 30, 50, 100]"
          :total="total"
          @current-change="handleCurrentChange"
          @size-change="handleSizeChange"
        />
      </div>
    </div>
    <el-drawer
      destroy-on-close
      size="900"
      v-model="dialogFormVisible"
      :show-close="false"
      :before-close="closeDialog"
    >
      <template #header>
        <div class="flex justify-between items-center">
          <span class="text-lg">{{ type === 'create' ? '添加用户协议' : '修改用户协议' }}</span>
          <div>
            <el-button type="primary" @click="enterDialog">确 定</el-button>
            <el-button @click="closeDialog">取 消</el-button>
          </div>
        </div>
      </template>

      <el-form
        :model="formData"
        label-position="top"
        ref="elFormRef"
        :rules="rule"
        label-width="80px"
      >
        <el-form-item label="协议标题:" prop="title">
          <el-input
            v-model="formData.title"
            :clearable="true"
            placeholder="请输入协议标题"
          />
        </el-form-item>
        <el-form-item label="版本号:" prop="version">
          <el-input
            v-model="formData.version"
            :clearable="true"
            placeholder="请输入版本号，如：v1.0.0"
          />
        </el-form-item>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="排序:" prop="sort">
              <el-input-number v-model="formData.sort" :min="0" placeholder="数字越小越靠前" style="width: 100%;" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="状态:" prop="status">
              <el-select v-model="formData.status" placeholder="请选择" style="width: 100%;">
                <el-option label="启用" :value="1" />
                <el-option label="禁用" :value="0" />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
        <el-form-item label="协议内容:" prop="content">
          <RichEdit v-model="formData.content" />
        </el-form-item>
      </el-form>
    </el-drawer>
  </div>
</template>

<script setup>
import {
  createSysUserAgreement,
  deleteSysUserAgreement,
  deleteSysUserAgreementByIds,
  updateSysUserAgreement,
  findSysUserAgreement,
  getSysUserAgreementList,
  setUserAgreementStatus
} from '@/api/sysUserAgreement'

import { formatDate } from '@/utils/format'
import { ElMessage, ElMessageBox } from 'element-plus'
import { ref, reactive } from 'vue'
import RichEdit from '@/components/richtext/rich-edit.vue'

defineOptions({
  name: 'SysUserAgreement'
})

const formData = ref({
  title: '',
  content: '',
  version: '',
  status: 1,
  sort: 0
})

const rule = reactive({
  title: [
    { required: true, message: '请输入协议标题', trigger: ['input', 'blur'] },
    { whitespace: true, message: '不能只输入空格', trigger: ['input', 'blur'] }
  ],
  content: [
    { required: true, message: '请输入协议内容', trigger: ['input', 'blur'] }
  ]
})

const searchRule = reactive({
  createdAt: [
    {
      validator: (rule, value, callback) => {
        if (searchInfo.value.startCreatedAt && !searchInfo.value.endCreatedAt) {
          callback(new Error('请填写结束日期'))
        } else if (!searchInfo.value.startCreatedAt && searchInfo.value.endCreatedAt) {
          callback(new Error('请填写开始日期'))
        } else if (
          searchInfo.value.startCreatedAt &&
          searchInfo.value.endCreatedAt &&
          (searchInfo.value.startCreatedAt.getTime() === searchInfo.value.endCreatedAt.getTime() ||
            searchInfo.value.startCreatedAt.getTime() > searchInfo.value.endCreatedAt.getTime())
        ) {
          callback(new Error('开始日期应当早于结束日期'))
        } else {
          callback()
        }
      },
      trigger: 'change'
    }
  ]
})

const elFormRef = ref()
const elSearchFormRef = ref()

const page = ref(1)
const total = ref(0)
const pageSize = ref(10)
const tableData = ref([])
const searchInfo = ref({})

const onReset = () => {
  searchInfo.value = {}
  getTableData()
}

const onSubmit = () => {
  elSearchFormRef.value?.validate(async (valid) => {
    if (!valid) return
    page.value = 1
    getTableData()
  })
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
  const table = await getSysUserAgreementList({
    page: page.value,
    pageSize: pageSize.value,
    ...searchInfo.value
  })
  if (table.code === 0) {
    tableData.value = table.data.list
    total.value = table.data.total
    page.value = table.data.page
    pageSize.value = table.data.pageSize
  }
}

getTableData()

const multipleSelection = ref([])
const handleSelectionChange = (val) => {
  multipleSelection.value = val
}

const deleteRow = (row) => {
  ElMessageBox.confirm('确定要删除吗?', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    deleteSysUserAgreementFunc(row)
  })
}

const onDelete = async () => {
  ElMessageBox.confirm('确定要删除吗?', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(async () => {
    const IDs = []
    if (multipleSelection.value.length === 0) {
      ElMessage({ type: 'warning', message: '请选择要删除的数据' })
      return
    }
    multipleSelection.value.map((item) => {
      IDs.push(item.ID)
    })
    const res = await deleteSysUserAgreementByIds({ IDs })
    if (res.code === 0) {
      ElMessage({ type: 'success', message: '删除成功' })
      if (tableData.value.length === IDs.length && page.value > 1) {
        page.value--
      }
      getTableData()
    }
  })
}

const type = ref('')

const updateSysUserAgreementFunc = async (row) => {
  const res = await findSysUserAgreement({ ID: row.ID })
  type.value = 'update'
  if (res.code === 0) {
    formData.value = res.data
    dialogFormVisible.value = true
  }
}

const deleteSysUserAgreementFunc = async (row) => {
  const res = await deleteSysUserAgreement({ ID: row.ID })
  if (res.code === 0) {
    ElMessage({ type: 'success', message: '删除成功' })
    if (tableData.value.length === 1 && page.value > 1) {
      page.value--
    }
    getTableData()
  }
}

const toggleStatus = async (row) => {
  const newStatus = row.status === 1 ? 0 : 1
  const res = await setUserAgreementStatus({ id: row.ID, status: newStatus })
  if (res.code === 0) {
    ElMessage({ type: 'success', message: '状态更新成功' })
    getTableData()
  }
}

const dialogFormVisible = ref(false)

const openDialog = () => {
  type.value = 'create'
  formData.value = {
    title: '',
    content: '',
    version: '',
    status: 1,
    sort: 0
  }
  dialogFormVisible.value = true
}

const closeDialog = () => {
  dialogFormVisible.value = false
  formData.value = {
    title: '',
    content: '',
    version: '',
    status: 1,
    sort: 0
  }
}

const enterDialog = async () => {
  elFormRef.value?.validate(async (valid) => {
    if (!valid) return
    let res
    switch (type.value) {
      case 'create':
        res = await createSysUserAgreement(formData.value)
        break
      case 'update':
        res = await updateSysUserAgreement(formData.value)
        break
      default:
        res = await createSysUserAgreement(formData.value)
        break
    }
    if (res.code === 0) {
      ElMessage({ type: 'success', message: '操作成功' })
      closeDialog()
      getTableData()
    }
  })
}
</script>

<style></style>
