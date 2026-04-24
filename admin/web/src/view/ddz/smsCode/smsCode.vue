<template>
  <div>
    <div class="gva-search-box">
      <el-form ref="searchForm" :inline="true" :model="searchInfo">
        <el-form-item label="手机号">
          <el-input v-model="searchInfo.phone" placeholder="手机号" />
        </el-form-item>
        <el-form-item label="类型">
          <el-select v-model="searchInfo.type" placeholder="类型" clearable>
            <el-option label="登录" :value="1" />
            <el-option label="注册" :value="2" />
            <el-option label="绑定手机" :value="3" />
            <el-option label="修改密码" :value="4" />
          </el-select>
        </el-form-item>
        <el-form-item label="是否使用">
          <el-select v-model="searchInfo.isUsed" placeholder="是否使用" clearable>
            <el-option label="未使用" :value="0" />
            <el-option label="已使用" :value="1" />
          </el-select>
        </el-form-item>
        <el-form-item label="创建时间">
          <el-date-picker
            v-model="searchInfo.createdAt"
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
        <el-table-column align="center" label="手机号" min-width="120" prop="phone" />
        <el-table-column align="center" label="验证码" min-width="80" prop="code" />
        <el-table-column align="center" label="类型" min-width="80">
          <template #default="scope">
            <el-tag>{{ getTypeText(scope.row.type) }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column align="center" label="是否使用" min-width="80">
          <template #default="scope">
            <el-tag :type="scope.row.isUsed === 1 ? 'success' : 'info'">
              {{ scope.row.isUsed === 1 ? '已使用' : '未使用' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column align="center" label="过期时间" min-width="160" prop="expireAt" />
        <el-table-column align="center" label="使用时间" min-width="160" prop="usedAt" />
        <el-table-column align="center" label="请求IP" min-width="120" prop="ip" />
        <el-table-column align="center" label="创建时间" min-width="160" prop="createdAt" />
        <el-table-column align="center" label="操作" min-width="80" fixed="right">
          <template #default="scope">
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
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { getSmsCodeList, deleteSmsCode } from '@/api/ddz/gameLog'
import { ElMessage } from 'element-plus'

defineOptions({
  name: 'DDZSmsCode'
})

const searchInfo = ref({
  phone: '',
  type: null,
  isUsed: null,
  createdAt: []
})

const page = ref(1)
const total = ref(0)
const pageSize = ref(10)
const tableData = ref([])

const getTypeText = (type) => {
  const map = { 1: '登录', 2: '注册', 3: '绑定手机', 4: '修改密码' }
  return map[type] || '未知'
}

const onSubmit = () => {
  page.value = 1
  getTableData()
}

const onReset = () => {
  searchInfo.value = {
    phone: '',
    type: null,
    isUsed: null,
    createdAt: []
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
  const res = await getSmsCodeList({
    page: page.value,
    pageSize: pageSize.value,
    ...searchInfo.value
  })
  if (res.code === 0) {
    tableData.value = res.data.list
    total.value = res.data.total
  }
}

const deleteRow = async (row) => {
  const res = await deleteSmsCode({ ID: row.ID })
  if (res.code === 0) {
    ElMessage.success('删除成功')
    getTableData()
  }
}

getTableData()
</script>
