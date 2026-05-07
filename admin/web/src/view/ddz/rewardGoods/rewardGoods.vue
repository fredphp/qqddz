<template>
  <div>
    <div class="gva-search-box">
      <el-form ref="searchForm" :inline="true" :model="searchInfo">
        <el-form-item label="商品名称">
          <el-input v-model="searchInfo.name" placeholder="商品名称" clearable />
        </el-form-item>
        <el-form-item label="奖励类型">
          <el-select v-model="searchInfo.rewardType" placeholder="奖励类型" clearable>
            <el-option label="实物" :value="1" />
            <el-option label="虚拟货币" :value="2" />
            <el-option label="虚拟道具" :value="3" />
          </el-select>
        </el-form-item>
        <el-form-item label="状态">
          <el-select v-model="searchInfo.status" placeholder="状态" clearable>
            <el-option label="上架" :value="1" />
            <el-option label="下架" :value="0" />
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
        <el-button type="primary" icon="plus" @click="openDialog('add')">新增商品</el-button>
      </div>
      <el-table :data="tableData" row-key="ID">
        <el-table-column align="center" label="ID" min-width="60" prop="ID" />
        <el-table-column align="center" label="商品名称" min-width="120" prop="name" />
        <el-table-column align="center" label="商品图片" min-width="100">
          <template #default="scope">
            <div class="w-12 h-12 rounded overflow-hidden border border-gray-200">
              <el-image
                v-if="scope.row.image"
                :src="getImageUrl(scope.row.image)"
                :preview-src-list="[getImageUrl(scope.row.image)]"
                fit="cover"
                class="w-full h-full"
              >
                <template #error>
                  <div class="w-full h-full flex items-center justify-center bg-gray-100">
                    <el-icon><Picture /></el-icon>
                  </div>
                </template>
              </el-image>
              <div v-else class="w-full h-full flex items-center justify-center bg-gray-100">
                <el-icon><Picture /></el-icon>
              </div>
            </div>
          </template>
        </el-table-column>
        <el-table-column align="center" label="奖励类型" min-width="100">
          <template #default="scope">
            <el-tag :type="getRewardTypeTag(scope.row.rewardType)">
              {{ getRewardTypeName(scope.row.rewardType) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column align="center" label="奖励价值" min-width="100">
          <template #default="scope">
            <span v-if="scope.row.rewardType === 2">{{ scope.row.rewardValue }} 金币</span>
            <span v-else-if="scope.row.rewardType === 3">{{ scope.row.rewardValue }}</span>
            <span v-else>-</span>
          </template>
        </el-table-column>
        <el-table-column align="center" label="库存" min-width="80" prop="stock" />
        <el-table-column align="center" label="状态" min-width="80">
          <template #default="scope">
            <el-tag :type="scope.row.status === 1 ? 'success' : 'danger'">
              {{ scope.row.status === 1 ? '上架' : '下架' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column align="center" label="排序" min-width="80" prop="sortOrder" />
        <el-table-column align="center" label="绑定房间" min-width="150">
          <template #default="scope">
            <div v-if="scope.row.roomConfigIds && parseRoomIds(scope.row.roomConfigIds).length > 0">
              <el-tag
                v-for="id in parseRoomIds(scope.row.roomConfigIds)"
                :key="id"
                size="small"
                class="mr-1 mb-1"
              >
                {{ getRoomName(id) }}
              </el-tag>
            </div>
            <span v-else class="text-gray-400">全部房间</span>
          </template>
        </el-table-column>
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

    <!-- 新增/编辑对话框 -->
    <el-dialog v-model="dialogVisible" :title="dialogType === 'add' ? '新增商品' : '编辑商品'" width="800px" destroy-on-close>
      <el-form ref="formRef" :model="formData" :rules="formRules" label-width="100px">
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="商品名称" prop="name">
              <el-input v-model="formData.name" placeholder="请输入商品名称" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="奖励类型" prop="rewardType">
              <el-select v-model="formData.rewardType" placeholder="请选择奖励类型" style="width: 100%">
                <el-option label="实物" :value="1" />
                <el-option label="虚拟货币" :value="2" />
                <el-option label="虚拟道具" :value="3" />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="商品图片" prop="image">
              <select-image v-model="formData.image" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="绑定房间" prop="roomConfigIds">
              <el-select
                v-model="formData.roomConfigIds"
                multiple
                collapse-tags
                collapse-tags-tooltip
                placeholder="不选择则适用于所有房间"
                clearable
                style="width: 100%"
              >
                <el-option
                  v-for="room in roomOptions"
                  :key="room.value"
                  :label="room.label"
                  :value="room.value"
                />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item
              v-if="formData.rewardType === 2 || formData.rewardType === 3"
              label="奖励价值"
              prop="rewardValue"
            >
              <el-input-number
                v-model="formData.rewardValue"
                :min="1"
                :step="100"
                style="width: 100%"
              />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="库存" prop="stock">
              <el-input-number v-model="formData.stock" :min="0" style="width: 100%" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="状态" prop="status">
              <el-switch
                v-model="formData.status"
                :active-value="1"
                :inactive-value="0"
                active-text="上架"
                inactive-text="下架"
              />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="排序" prop="sortOrder">
              <el-input-number v-model="formData.sortOrder" :min="0" style="width: 100%" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-form-item label="商品详情" prop="description">
          <rich-edit v-model="formData.description" class="w-full" />
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
import {
  getRewardGoodsList,
  createRewardGoods,
  updateRewardGoods,
  deleteRewardGoods,
  getRoomOptions
} from '@/api/ddz/reward'
import { ElMessage } from 'element-plus'
import { Picture } from '@element-plus/icons-vue'
import SelectImage from '@/components/selectImage/selectImage.vue'
import RichEdit from '@/components/richtext/rich-edit.vue'
import { getUrl } from '@/utils/image'

defineOptions({
  name: 'DDZRewardGoods'
})

const searchInfo = ref({
  name: '',
  rewardType: null,
  status: null
})

const page = ref(1)
const total = ref(0)
const pageSize = ref(10)
const tableData = ref([])
const roomOptions = ref([])

const dialogVisible = ref(false)
const dialogType = ref('add')
const formRef = ref(null)
const formData = ref({
  ID: 0,
  name: '',
  image: '',
  roomConfigIds: [],
  rewardType: 1,
  rewardValue: 0,
  stock: 0,
  status: 1,
  sortOrder: 0,
  description: ''
})

const formRules = {
  name: [{ required: true, message: '请输入商品名称', trigger: 'blur' }],
  rewardType: [{ required: true, message: '请选择奖励类型', trigger: 'change' }],
  stock: [{ required: true, message: '请输入库存', trigger: 'blur' }]
}

const getRewardTypeTag = (type) => {
  const tags = {
    1: 'primary',
    2: 'warning',
    3: 'success'
  }
  return tags[type] || ''
}

const getRewardTypeName = (type) => {
  const names = {
    1: '实物',
    2: '虚拟货币',
    3: '虚拟道具'
  }
  return names[type] || '未知'
}

const getImageUrl = (url) => {
  return getUrl(url)
}

// 解析房间ID字符串为数组
const parseRoomIds = (idsStr) => {
  if (!idsStr) return []
  try {
    const parsed = JSON.parse(idsStr)
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

const onSubmit = () => {
  page.value = 1
  getTableData()
}

const onReset = () => {
  searchInfo.value = {
    name: '',
    rewardType: null,
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
  const res = await getRewardGoodsList({
    page: page.value,
    pageSize: pageSize.value,
    ...searchInfo.value
  })
  if (res.code === 0) {
    tableData.value = res.data.list || []
    total.value = res.data.total || 0
  }
}

const getRoomOptionsData = async () => {
  const res = await getRoomOptions()
  if (res.code === 0) {
    roomOptions.value = res.data || []
  }
}

const openDialog = (type, row = null) => {
  dialogType.value = type
  if (type === 'edit' && row) {
    // 编辑模式：解析已有的房间ID
    const roomIds = parseRoomIds(row.roomConfigIds)
    formData.value = {
      ...row,
      roomConfigIds: roomIds
    }
  } else {
    formData.value = {
      ID: 0,
      name: '',
      image: '',
      roomConfigIds: [],
      rewardType: 1,
      rewardValue: 0,
      stock: 0,
      status: 1,
      sortOrder: 0,
      description: ''
    }
  }
  dialogVisible.value = true
}

// 根据房间ID获取房间名称
const getRoomName = (roomConfigId) => {
  if (!roomConfigId) return ''
  const room = roomOptions.value.find(r => r.value === roomConfigId)
  return room ? room.label : '未知房间'
}

const submitForm = async () => {
  const valid = await formRef.value.validate().catch(() => false)
  if (!valid) return

  // 将房间ID数组转为JSON字符串
  const roomConfigIdsStr = formData.value.roomConfigIds && formData.value.roomConfigIds.length > 0
    ? JSON.stringify(formData.value.roomConfigIds)
    : ''

  // 只提交需要的字段，排除旧字段
  const submitData = {
    ID: formData.value.ID,
    name: formData.value.name,
    image: formData.value.image,
    roomConfigIds: roomConfigIdsStr,
    detailRichtext: formData.value.detailRichtext,
    rewardType: formData.value.rewardType,
    rewardValue: formData.value.rewardValue,
    stock: formData.value.stock,
    status: formData.value.status,
    sortOrder: formData.value.sortOrder
  }

  const api = dialogType.value === 'add' ? createRewardGoods : updateRewardGoods
  const res = await api(submitData)
  if (res.code === 0) {
    ElMessage.success('操作成功')
    dialogVisible.value = false
    getTableData()
  }
}

const deleteRow = async (row) => {
  const res = await deleteRewardGoods({ ID: row.ID })
  if (res.code === 0) {
    ElMessage.success('删除成功')
    getTableData()
  }
}

getTableData()
getRoomOptionsData()
</script>

<style scoped>
.text-gray-400 {
  color: #9ca3af;
}
.mr-1 {
  margin-right: 4px;
}
.mb-1 {
  margin-bottom: 4px;
}
</style>
