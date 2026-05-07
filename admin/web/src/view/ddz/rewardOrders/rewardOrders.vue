<template>
  <div>
    <div class="gva-search-box">
      <el-form ref="searchForm" :inline="true" :model="searchInfo">
        <el-form-item label="订单编号">
          <el-input v-model="searchInfo.orderNo" placeholder="订单编号" clearable />
        </el-form-item>
        <el-form-item label="玩家ID">
          <el-input v-model="searchInfo.playerId" placeholder="玩家ID" clearable />
        </el-form-item>
        <el-form-item label="订单状态">
          <el-select v-model="searchInfo.status" placeholder="订单状态" clearable>
            <el-option label="待填写" :value="1" />
            <el-option label="待发货" :value="2" />
            <el-option label="已发货" :value="3" />
            <el-option label="已完成" :value="4" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" icon="search" @click="onSubmit">查询</el-button>
          <el-button icon="refresh" @click="onReset">重置</el-button>
        </el-form-item>
      </el-form>
    </div>
    <div class="gva-table-box">
      <!-- 状态标签页 -->
      <el-tabs v-model="activeStatus" class="mb-4" @tab-change="handleTabChange">
        <el-tab-pane label="全部" name="0" />
        <el-tab-pane label="待填写" name="1" />
        <el-tab-pane label="待发货" name="2" />
        <el-tab-pane label="已发货" name="3" />
        <el-tab-pane label="已完成" name="4" />
      </el-tabs>

      <el-table :data="tableData" row-key="ID">
        <el-table-column align="center" label="订单编号" min-width="180" prop="orderNo" />
        <el-table-column align="center" label="玩家信息" min-width="150">
          <template #default="scope">
            <div class="text-left">
              <div>昵称：{{ scope.row.playerName || '-' }}</div>
              <div class="text-gray-400 text-xs">ID：{{ scope.row.playerId }}</div>
            </div>
          </template>
        </el-table-column>
        <el-table-column align="center" label="奖励商品" min-width="120">
          <template #default="scope">
            <div class="flex items-center gap-2">
              <div class="w-10 h-10 rounded overflow-hidden border border-gray-200">
                <el-image
                  v-if="scope.row.goodsImage"
                  :src="getImageUrl(scope.row.goodsImage)"
                  fit="cover"
                  class="w-full h-full"
                >
                  <template #error>
                    <div class="w-full h-full flex items-center justify-center bg-gray-100">
                      <el-icon><Picture /></el-icon>
                    </div>
                  </template>
                </el-image>
              </div>
              <span>{{ scope.row.goodsName }}</span>
            </div>
          </template>
        </el-table-column>
        <el-table-column align="center" label="获得排名" min-width="80">
          <template #default="scope">
            <el-tag :type="getRankTag(scope.row.rank)">
              第 {{ scope.row.rank }} 名
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column align="center" label="订单状态" min-width="100">
          <template #default="scope">
            <el-tag :type="getStatusTag(scope.row.status)">
              {{ getStatusName(scope.row.status) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column align="center" label="收货人信息" min-width="180">
          <template #default="scope">
            <div v-if="scope.row.receiverName" class="text-left text-sm">
              <div>姓名：{{ scope.row.receiverName }}</div>
              <div>电话：{{ scope.row.receiverPhone }}</div>
              <div class="text-gray-400 text-xs">地址：{{ scope.row.receiverAddress }}</div>
            </div>
            <span v-else class="text-gray-400">未填写</span>
          </template>
        </el-table-column>
        <el-table-column align="center" label="快递信息" min-width="150">
          <template #default="scope">
            <div v-if="scope.row.expressCompany" class="text-left text-sm">
              <div>{{ scope.row.expressCompany }}</div>
              <div class="text-gray-400 text-xs">{{ scope.row.expressNo }}</div>
            </div>
            <span v-else class="text-gray-400">未发货</span>
          </template>
        </el-table-column>
        <el-table-column align="center" label="创建时间" min-width="160">
          <template #default="scope">
            {{ formatDateTime(scope.row.createdAt) }}
          </template>
        </el-table-column>
        <el-table-column align="center" label="操作" min-width="150" fixed="right">
          <template #default="scope">
            <el-button type="primary" link icon="view" @click="viewDetail(scope.row)">查看</el-button>
            <el-button
              v-if="scope.row.status === 2"
              type="success"
              link
              icon="van"
              @click="openShipDialog(scope.row)"
            >
              发货
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

    <!-- 订单详情对话框 -->
    <el-dialog v-model="detailDialogVisible" title="订单详情" width="600px">
      <el-descriptions :column="2" border>
        <el-descriptions-item label="订单编号" :span="2">
          {{ detailData.orderNo }}
        </el-descriptions-item>
        <el-descriptions-item label="玩家昵称">
          {{ detailData.playerName || '-' }}
        </el-descriptions-item>
        <el-descriptions-item label="玩家ID">
          {{ detailData.playerId }}
        </el-descriptions-item>
        <el-descriptions-item label="商品名称" :span="2">
          {{ detailData.goodsName }}
        </el-descriptions-item>
        <el-descriptions-item label="商品图片" :span="2">
          <div class="w-20 h-20 rounded overflow-hidden border border-gray-200">
            <el-image
              v-if="detailData.goodsImage"
              :src="getImageUrl(detailData.goodsImage)"
              :preview-src-list="[getImageUrl(detailData.goodsImage)]"
              fit="cover"
              class="w-full h-full"
            />
          </div>
        </el-descriptions-item>
        <el-descriptions-item label="获得排名">
          <el-tag :type="getRankTag(detailData.rank)">第 {{ detailData.rank }} 名</el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="订单状态">
          <el-tag :type="getStatusTag(detailData.status)">
            {{ getStatusName(detailData.status) }}
          </el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="收货人姓名">
          {{ detailData.receiverName || '-' }}
        </el-descriptions-item>
        <el-descriptions-item label="联系电话">
          {{ detailData.receiverPhone || '-' }}
        </el-descriptions-item>
        <el-descriptions-item label="收货地址" :span="2">
          {{ detailData.receiverAddress || '-' }}
        </el-descriptions-item>
        <el-descriptions-item label="快递公司">
          {{ detailData.expressCompany || '-' }}
        </el-descriptions-item>
        <el-descriptions-item label="快递单号">
          {{ detailData.expressNo || '-' }}
        </el-descriptions-item>
        <el-descriptions-item label="创建时间" :span="2">
          {{ formatDateTime(detailData.createdAt) }}
        </el-descriptions-item>
        <el-descriptions-item label="发货时间" :span="2">
          {{ detailData.shippedAt ? formatDateTime(detailData.shippedAt) : '-' }}
        </el-descriptions-item>
      </el-descriptions>
      <template #footer>
        <el-button @click="detailDialogVisible = false">关闭</el-button>
      </template>
    </el-dialog>

    <!-- 发货对话框 -->
    <el-dialog v-model="shipDialogVisible" title="填写发货信息" width="450px">
      <el-form ref="shipFormRef" :model="shipFormData" :rules="shipFormRules" label-width="80px">
        <el-form-item label="快递公司" prop="expressCompany">
          <el-select v-model="shipFormData.expressCompany" placeholder="请选择快递公司" style="width: 100%">
            <el-option label="顺丰速运" value="顺丰速运" />
            <el-option label="圆通快递" value="圆通快递" />
            <el-option label="中通快递" value="中通快递" />
            <el-option label="韵达快递" value="韵达快递" />
            <el-option label="申通快递" value="申通快递" />
            <el-option label="邮政EMS" value="邮政EMS" />
            <el-option label="京东快递" value="京东快递" />
            <el-option label="百世快递" value="百世快递" />
            <el-option label="极兔速递" value="极兔速递" />
            <el-option label="其他" value="其他" />
          </el-select>
        </el-form-item>
        <el-form-item label="快递单号" prop="expressNo">
          <el-input v-model="shipFormData.expressNo" placeholder="请输入快递单号" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="shipDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="submitShip">确定发货</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import {
  getRewardOrdersList,
  getOrderDetail,
  updateOrderShipInfo
} from '@/api/ddz/reward'
import { ElMessage } from 'element-plus'
import { Picture } from '@element-plus/icons-vue'
import { getUrl } from '@/utils/image'
import { formatDate } from '@/utils/format'

defineOptions({
  name: 'DDZRewardOrders'
})

const searchInfo = ref({
  orderNo: '',
  playerId: '',
  status: null
})

const activeStatus = ref('0')
const page = ref(1)
const total = ref(0)
const pageSize = ref(10)
const tableData = ref([])

const detailDialogVisible = ref(false)
const detailData = ref({})

const shipDialogVisible = ref(false)
const shipFormRef = ref(null)
const shipFormData = ref({
  ID: 0,
  expressCompany: '',
  expressNo: ''
})

const shipFormRules = {
  expressCompany: [{ required: true, message: '请选择快递公司', trigger: 'change' }],
  expressNo: [{ required: true, message: '请输入快递单号', trigger: 'blur' }]
}

const getStatusTag = (status) => {
  const tags = {
    1: 'warning',
    2: 'info',
    3: 'primary',
    4: 'success'
  }
  return tags[status] || ''
}

const getStatusName = (status) => {
  const names = {
    1: '待填写',
    2: '待发货',
    3: '已发货',
    4: '已完成'
  }
  return names[status] || '未知'
}

const getRankTag = (rank) => {
  if (rank === 1) return 'danger'
  if (rank === 2) return 'warning'
  if (rank === 3) return 'success'
  return ''
}

const getImageUrl = (url) => {
  return getUrl(url)
}

const formatDateTime = (date) => {
  if (!date) return '-'
  return formatDate(date)
}

const handleTabChange = (tab) => {
  if (tab === '0') {
    searchInfo.value.status = null
  } else {
    searchInfo.value.status = parseInt(tab)
  }
  page.value = 1
  getTableData()
}

const onSubmit = () => {
  page.value = 1
  getTableData()
}

const onReset = () => {
  searchInfo.value = {
    orderNo: '',
    playerId: '',
    status: null
  }
  activeStatus.value = '0'
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
  const res = await getRewardOrdersList({
    page: page.value,
    pageSize: pageSize.value,
    ...searchInfo.value
  })
  if (res.code === 0) {
    tableData.value = res.data.list || []
    total.value = res.data.total || 0
  }
}

const viewDetail = async (row) => {
  const res = await getOrderDetail(row.ID)
  if (res.code === 0) {
    detailData.value = res.data
    detailDialogVisible.value = true
  }
}

const openShipDialog = (row) => {
  shipFormData.value = {
    ID: row.ID,
    expressCompany: '',
    expressNo: ''
  }
  shipDialogVisible.value = true
}

const submitShip = async () => {
  const valid = await shipFormRef.value.validate().catch(() => false)
  if (!valid) return

  const res = await updateOrderShipInfo(shipFormData.value)
  if (res.code === 0) {
    ElMessage.success('发货成功')
    shipDialogVisible.value = false
    getTableData()
  }
}

getTableData()
</script>

<style scoped>
.mb-4 {
  margin-bottom: 16px;
}
.text-gray-400 {
  color: #9ca3af;
}
.text-xs {
  font-size: 12px;
}
.text-sm {
  font-size: 14px;
}
.text-left {
  text-align: left;
}
</style>
