<template>
  <div>
    <!-- 背景图配置提示 -->
    <el-alert
      title="背景图配置说明"
      type="info"
      :closable="false"
      show-icon
      class="mb-4"
    >
      <template #default>
        <p style="margin: 0;">
          <strong>重要提示：</strong>背景图需要同时在<strong>后台管理</strong>和<strong>客户端资源</strong>中配置才能正常显示。
        </p>
        <p style="margin: 8px 0 0 0;">
          1. 后台管理：在下方"背景图编号"字段选择对应的编号（2-5）<br>
          2. 客户端资源：将背景图文件放置在 <code>nclient/assets/resources/UI/</code> 目录下，文件名格式为 <code>btn_happy_{编号}.png</code><br>
          3. 例如：选择编号2，客户端需要有 <code>btn_happy_2.png</code> 文件
        </p>
      </template>
    </el-alert>

    <div class="gva-search-box">
      <el-form ref="searchForm" :inline="true" :model="searchInfo">
        <el-form-item label="房间名称">
          <el-input v-model="searchInfo.roomName" placeholder="房间名称" />
        </el-form-item>
        <el-form-item label="房间类型">
          <el-select v-model="searchInfo.roomType" placeholder="房间类型" clearable>
            <el-option label="初级场" :value="2" />
            <el-option label="中级场" :value="3" />
            <el-option label="高级场" :value="4" />
            <el-option label="大师场" :value="5" />
            <el-option label="至尊场" :value="6" />
          </el-select>
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
        <el-button type="primary" icon="plus" @click="openDialog('add')">新增房间配置</el-button>
        <el-button type="warning" icon="refresh" @click="handleRefreshCache">刷新缓存</el-button>
      </div>
      <el-table :data="tableData" row-key="ID">
        <el-table-column align="center" label="ID" min-width="60" prop="ID" />
        <el-table-column align="center" label="房间名称" min-width="100" prop="roomName" />
        <el-table-column align="center" label="房间类型" min-width="80">
          <template #default="scope">
            <el-tag :type="getRoomTypeTag(scope.row.roomType)">
              {{ getRoomTypeName(scope.row.roomType) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column align="center" label="背景图" min-width="150">
          <template #default="scope">
            <div class="flex items-center gap-2">
              <div
                class="w-16 h-10 rounded border border-gray-300 overflow-hidden"
              >
                <img 
                  :src="getBgImageUrl(scope.row.bgImageNum || 2)" 
                  :alt="'btn_happy_' + (scope.row.bgImageNum || 2) + '.png'"
                  class="w-full h-full object-cover"
                  @error="(e) => e.target.style.display = 'none'"
                />
              </div>
              <span class="text-xs text-gray-500">btn_happy_{{ scope.row.bgImageNum || 2 }}.png</span>
            </div>
          </template>
        </el-table-column>
        <el-table-column align="center" label="底分" min-width="60" prop="baseScore" />
        <el-table-column align="center" label="倍数" min-width="60" prop="multiplier" />
        <el-table-column align="center" label="最低金币" min-width="100">
          <template #default="scope">
            {{ formatGold(scope.row.minGold) }}
          </template>
        </el-table-column>
        <el-table-column align="center" label="最高金币" min-width="100">
          <template #default="scope">
            {{ scope.row.maxGold > 0 ? formatGold(scope.row.maxGold) : '无限制' }}
          </template>
        </el-table-column>
        <el-table-column align="center" label="机器人" min-width="80">
          <template #default="scope">
            {{ scope.row.botEnabled ? '是(' + scope.row.botCount + ')' : '否' }}
          </template>
        </el-table-column>
        <el-table-column align="center" label="状态" min-width="80">
          <template #default="scope">
            <el-tag :type="scope.row.status === 1 ? 'success' : 'danger'">
              {{ scope.row.status === 1 ? '开启' : '关闭' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column align="center" label="描述" min-width="200" prop="description" show-overflow-tooltip />
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
    <el-dialog v-model="dialogVisible" :title="dialogType === 'add' ? '新增房间配置' : '编辑房间配置'" width="650px">
      <el-form ref="formRef" :model="formData" label-width="110px">
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="房间名称" prop="roomName" required>
              <el-input v-model="formData.roomName" placeholder="请输入房间名称" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="房间类型" prop="roomType" required>
              <el-select v-model="formData.roomType" placeholder="请选择房间类型" style="width: 100%">
                <el-option label="初级场" :value="2" />
                <el-option label="中级场" :value="3" />
                <el-option label="高级场" :value="4" />
                <el-option label="大师场" :value="5" />
                <el-option label="至尊场" :value="6" />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
        
        <!-- 背景图配置 -->
        <el-form-item label="背景图编号" prop="bgImageNum">
          <div class="flex items-center gap-4">
            <el-select v-model="formData.bgImageNum" placeholder="选择背景图编号" style="width: 200px">
              <el-option v-for="num in [2, 3, 4, 5]" :key="num" :label="`btn_happy_${num}.png`" :value="num">
                <div class="flex items-center gap-2">
                  <div
                    class="w-8 h-6 rounded overflow-hidden"
                  >
                    <img 
                      :src="getBgImageUrl(num)" 
                      :alt="'btn_happy_' + num + '.png'"
                      class="w-full h-full object-cover"
                      @error="(e) => e.target.style.display = 'none'"
                    />
                  </div>
                  <span>编号 {{ num }} (btn_happy_{{ num }}.png)</span>
                </div>
              </el-option>
            </el-select>
            <div
              class="w-24 h-14 rounded border border-gray-300 overflow-hidden"
            >
              <img 
                :src="getBgImageUrl(formData.bgImageNum || 2)" 
                :alt="'btn_happy_' + (formData.bgImageNum || 2) + '.png'"
                class="w-full h-full object-cover"
                @error="(e) => e.target.style.display = 'none'"
              />
            </div>
          </div>
          <div class="text-xs text-gray-500 mt-1">
            提示：选择编号后，客户端需要有对应的 btn_happy_{{ formData.bgImageNum || 2 }}.png 文件
          </div>
        </el-form-item>

        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="底分" prop="baseScore" required>
              <el-input-number v-model="formData.baseScore" :min="1" style="width: 100%" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="倍数" prop="multiplier" required>
              <el-input-number v-model="formData.multiplier" :min="1" style="width: 100%" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="最低金币" prop="minGold" required>
              <el-input-number v-model="formData.minGold" :min="0" :step="1000" style="width: 100%" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="最高金币" prop="maxGold">
              <el-input-number v-model="formData.maxGold" :min="0" :step="1000" placeholder="0表示无限制" style="width: 100%" />
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
        <el-form-item label="排序" prop="sortOrder">
          <el-input-number v-model="formData.sortOrder" :min="0" style="width: 200px" />
        </el-form-item>
        <el-form-item label="描述" prop="description">
          <el-input v-model="formData.description" type="textarea" rows="2" placeholder="请输入描述" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="submitForm">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { getRoomConfigList, createRoomConfig, updateRoomConfig, deleteRoomConfig, refreshRoomConfigCache } from '@/api/ddz/gameLog'
import { ElMessage } from 'element-plus'

defineOptions({
  name: 'DDZRoomConfig'
})

const searchInfo = ref({
  roomName: '',
  roomType: null,
  status: null
})

const page = ref(1)
const total = ref(0)
const pageSize = ref(10)
const tableData = ref([])

const dialogVisible = ref(false)
const dialogType = ref('add')
const formRef = ref(null)
const formData = ref({
  ID: 0,
  roomName: '',
  roomType: 2,
  baseScore: 1,
  multiplier: 1,
  minGold: 1000,
  maxGold: 0,
  bgImageNum: 2,  // 默认背景图编号
  botEnabled: 1,
  botCount: 5,
  feeRate: 0,
  maxRound: 20,
  timeoutSeconds: 30,
  status: 1,
  sortOrder: 0,
  description: ''
})

const getRoomTypeTag = (type) => {
  const tags = {
    2: 'success',
    3: 'warning',
    4: 'danger',
    5: 'info',
    6: ''
  }
  return tags[type] || ''
}

const getRoomTypeName = (type) => {
  const names = {
    2: '初级场',
    3: '中级场',
    4: '高级场',
    5: '大师场',
    6: '至尊场'
  }
  return names[type] || '未知'
}

// 根据背景图编号获取渐变色（用于预览）
const getBgGradient = (num) => {
  const gradients = {
    2: 'linear-gradient(135deg, #3b82f6, #1d4ed8)',  // 蓝色 - 中级房
    3: 'linear-gradient(135deg, #8b5cf6, #6d28d9)',  // 紫色 - 高级房
    4: 'linear-gradient(135deg, #f97316, #ea580c)',  // 橙色 - 富豪场
    5: 'linear-gradient(135deg, #ef4444, #dc2626)'   // 红色 - 至尊场
  }
  return gradients[num] || 'linear-gradient(135deg, #6b7280, #4b5563)'
}

// 获取背景图URL
const getBgImageUrl = (num) => {
  return `/images/room/btn_happy_${num}.png`
}

const formatGold = (gold) => {
  if (gold >= 10000) {
    return (gold / 10000).toFixed(1) + '万'
  }
  return gold.toLocaleString()
}

const onSubmit = () => {
  page.value = 1
  getTableData()
}

const onReset = () => {
  searchInfo.value = {
    roomName: '',
    roomType: null,
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
  const res = await getRoomConfigList({
    page: page.value,
    pageSize: pageSize.value,
    ...searchInfo.value
  })
  if (res.code === 0) {
    tableData.value = res.data.list
    total.value = res.data.total
  }
}

const openDialog = (type, row = null) => {
  dialogType.value = type
  if (type === 'edit' && row) {
    formData.value = { ...row }
    // 确保bgImageNum有默认值
    if (!formData.value.bgImageNum) {
      formData.value.bgImageNum = 2
    }
  } else {
    formData.value = {
      ID: 0,
      roomName: '',
      roomType: 2,
      baseScore: 1,
      multiplier: 1,
      minGold: 1000,
      maxGold: 0,
      bgImageNum: 2,  // 默认背景图编号
      botEnabled: 1,
      botCount: 5,
      feeRate: 0,
      maxRound: 20,
      timeoutSeconds: 30,
      status: 1,
      sortOrder: 0,
      description: ''
    }
  }
  dialogVisible.value = true
}

const submitForm = async () => {
  const api = dialogType.value === 'add' ? createRoomConfig : updateRoomConfig
  const res = await api(formData.value)
  if (res.code === 0) {
    ElMessage.success('操作成功')
    dialogVisible.value = false
    getTableData()
  }
}

const deleteRow = async (row) => {
  const res = await deleteRoomConfig({ ID: row.ID })
  if (res.code === 0) {
    ElMessage.success('删除成功')
    getTableData()
  }
}

// 刷新缓存
const handleRefreshCache = async () => {
  const res = await refreshRoomConfigCache()
  if (res.code === 0) {
    ElMessage.success('缓存刷新成功')
  }
}

getTableData()
</script>

<style scoped>
.mb-4 {
  margin-bottom: 16px;
}
</style>
