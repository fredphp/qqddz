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
        <el-form-item label="房间分类">
          <el-select v-model="searchInfo.roomCategory" placeholder="房间分类" clearable>
            <el-option label="普通场" :value="1" />
            <el-option label="竞技场" :value="2" />
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
        <el-table-column align="center" label="房间分类" min-width="80">
          <template #default="scope">
            <el-tag :type="scope.row.roomCategory === 2 ? 'danger' : 'success'">
              {{ scope.row.roomCategory === 2 ? '竞技场' : '普通场' }}
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
        <el-table-column align="center" label="每场时长" min-width="80">
          <template #default="scope">
            <span v-if="scope.row.roomCategory === 2">{{ scope.row.matchRoundDuration || 5 }}分钟</span>
            <span v-else class="text-gray-400">-</span>
          </template>
        </el-table-column>
        <el-table-column align="center" label="轮次" min-width="60">
          <template #default="scope">
            <span v-if="scope.row.roomCategory === 2">{{ scope.row.matchRoundCount || 3 }}</span>
            <span v-else class="text-gray-400">-</span>
          </template>
        </el-table-column>
        <el-table-column align="center" label="报名费" min-width="100">
          <template #default="scope">
            <span v-if="scope.row.roomCategory === 2" class="text-warning">{{ formatGold(scope.row.minArenaCoin || 0) }}</span>
            <span v-else class="text-gray-400">-</span>
          </template>
        </el-table-column>
        <el-table-column align="center" label="人数限制" min-width="100">
          <template #default="scope">
            <span v-if="scope.row.roomCategory === 2">{{ scope.row.minPlayers || 3 }}-{{ scope.row.maxPlayers || 9 }}人</span>
            <span v-else class="text-gray-400">-</span>
          </template>
        </el-table-column>
        <el-table-column align="center" label="开赛时间" min-width="180">
          <template #default="scope">
            <span v-if="scope.row.roomCategory === 2">{{ formatTimeRanges(scope.row.matchTimeRanges) }}</span>
            <span v-else class="text-gray-400">-</span>
          </template>
        </el-table-column>
        <el-table-column align="center" label="冠军奖励" min-width="100">
          <template #default="scope">
            <span v-if="scope.row.roomCategory === 2">{{ getRewardGoodsName(scope.row.championRewardId) }}</span>
            <span v-else class="text-gray-400">-</span>
          </template>
        </el-table-column>
        <el-table-column align="center" label="淘汰规则" min-width="140">
          <template #default="scope">
            <span v-if="scope.row.roomCategory === 2" class="text-xs">{{ scope.row.eliminationRules || '[60,30,18,9,3]' }}</span>
            <span v-else class="text-gray-400">-</span>
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
    <el-dialog v-model="dialogVisible" :title="dialogType === 'add' ? '新增房间配置' : '编辑房间配置'" width="800px">
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
          <el-col :span="12">
            <el-form-item label="房间分类" prop="roomCategory">
              <el-select v-model="formData.roomCategory" placeholder="请选择房间分类" style="width: 100%">
                <el-option label="普通场" :value="1" />
                <el-option label="竞技场" :value="2" />
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
        
        <!-- 普通场金币配置 -->
        <template v-if="formData.roomCategory === 1">
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
              <el-form-item label="最低竞技币" prop="minArenaCoin" required>
                <el-input-number v-model="formData.minArenaCoin" :min="0" :step="1000" style="width: 100%" />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="最高竞技币" prop="maxArenaCoin">
                <el-input-number v-model="formData.maxArenaCoin" :min="0" :step="1000" placeholder="0表示无限制" style="width: 100%" />
              </el-form-item>
            </el-col>
          </el-row>
        </template>
        
        <!-- 竞技场配置 -->
        <template v-if="formData.roomCategory === 2">
          <el-divider content-position="left">竞技场配置</el-divider>
          <el-row :gutter="20">
            <el-col :span="12">
              <el-form-item label="初始金币" prop="minGold" required>
                <el-input-number v-model="formData.minGold" :min="0" :step="1000" style="width: 100%" />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="报名费(竞技币)" prop="minArenaCoin" required>
                <el-input-number v-model="formData.minArenaCoin" :min="0" :step="100" style="width: 100%" />
              </el-form-item>
            </el-col>
          </el-row>
          <el-row :gutter="20">
            <el-col :span="12">
              <el-form-item label="每场时长(分)" prop="matchRoundDuration">
                <el-input-number v-model="formData.matchRoundDuration" :min="1" :max="60" style="width: 100%" />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="轮次" prop="matchRoundCount">
                <el-input-number v-model="formData.matchRoundCount" :min="1" :max="20" style="width: 100%" />
              </el-form-item>
            </el-col>
          </el-row>
          <el-row :gutter="20">
            <el-col :span="12">
              <el-form-item label="冠军奖励" prop="championRewardId">
                <el-select v-model="formData.championRewardId" placeholder="请选择冠军奖励" clearable style="width: 100%">
                  <el-option 
                    v-for="item in rewardGoodsOptions" 
                    :key="item.ID" 
                    :label="item.goodsName" 
                    :value="item.ID"
                  />
                </el-select>
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="最大人数" prop="maxPlayers">
                <el-input-number v-model="formData.maxPlayers" :min="3" :max="100" style="width: 100%" />
              </el-form-item>
            </el-col>
          </el-row>
          <el-row :gutter="20">
            <el-col :span="12">
              <el-form-item label="最小开赛人数" prop="minPlayers">
                <el-input-number v-model="formData.minPlayers" :min="2" :max="100" style="width: 100%" />
              </el-form-item>
            </el-col>
          </el-row>
          <!-- 开赛时间段配置 -->
          <el-form-item label="开赛时间段" prop="matchTimeRanges">
            <div class="w-full">
              <div v-for="(range, index) in formData.matchTimeRanges" :key="index" class="flex items-center gap-2 mb-2">
                <el-time-picker
                  v-model="range.start"
                  format="HH:mm"
                  value-format="HH:mm"
                  placeholder="开始时间"
                  style="width: 120px"
                />
                <span>-</span>
                <el-time-picker
                  v-model="range.end"
                  format="HH:mm"
                  value-format="HH:mm"
                  placeholder="结束时间"
                  style="width: 120px"
                />
                <el-button type="danger" icon="delete" circle @click="removeTimeRange(index)" />
              </div>
              <el-button type="primary" icon="plus" @click="addTimeRange">添加时间段</el-button>
            </div>
          </el-form-item>
          
          <!-- 动态淘汰赛配置 -->
          <el-divider content-position="left">动态淘汰赛配置</el-divider>
          <el-row :gutter="20">
            <el-col :span="24">
              <el-form-item label="淘汰规则" prop="eliminationRules">
                <el-input v-model="formData.eliminationRules" placeholder="如: [60,30,18,9,3] 表示每轮保留人数" style="width: 100%" />
                <div class="text-xs text-gray-500 mt-1">
                  JSON数组格式，表示每轮结束后保留的人数。例如 [60,30,18,9,3] 表示：<br/>
                  - 第1轮保留60人，淘汰其余<br/>
                  - 第2轮保留30人，淘汰其余<br/>
                  - 第3轮保留18人，淘汰其余<br/>
                  - 第4轮保留9人，淘汰其余<br/>
                  - 第5轮(决赛)保留3人，产生冠亚季军
                </div>
              </el-form-item>
            </el-col>
          </el-row>
          <el-row :gutter="20">
            <el-col :span="12">
              <el-form-item label="排行榜等待(秒)" prop="rankWaitSeconds">
                <el-input-number v-model="formData.rankWaitSeconds" :min="10" :max="120" style="width: 100%" />
                <div class="text-xs text-gray-500 mt-1">每轮结束后显示排行榜的等待时间</div>
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="最小匹配人数" prop="minMatchPlayers">
                <el-input-number v-model="formData.minMatchPlayers" :min="1" :max="10" style="width: 100%" />
                <div class="text-xs text-gray-500 mt-1">不足时自动补机器人</div>
              </el-form-item>
            </el-col>
          </el-row>
        </template>
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
import { ref, onMounted, watch } from 'vue'
import { getRoomConfigList, createRoomConfig, updateRoomConfig, deleteRoomConfig, refreshRoomConfigCache } from '@/api/ddz/gameLog'
import { getRewardGoodsList } from '@/api/ddz/reward'
import { ElMessage } from 'element-plus'

defineOptions({
  name: 'DDZRoomConfig'
})

const searchInfo = ref({
  roomName: '',
  roomType: null,
  roomCategory: null,
  status: null
})

const page = ref(1)
const total = ref(0)
const pageSize = ref(10)
const tableData = ref([])

const dialogVisible = ref(false)
const dialogType = ref('add')
const formRef = ref(null)
// 奖励商品选项列表
const rewardGoodsOptions = ref([])

// 竞技场默认时间范围
const defaultTimeRange = () => ({ start: '', end: '' })

const formData = ref({
  ID: 0,
  roomName: '',
  roomType: 2,
  roomCategory: 1,  // 默认普通场
  baseScore: 1,
  multiplier: 1,
  minGold: 1000,
  maxGold: 0,
  minArenaCoin: 0,
  maxArenaCoin: 0,
  bgImageNum: 2,  // 默认背景图编号
  botEnabled: 1,
  botCount: 5,
  feeRate: 0,
  maxRound: 20,
  timeoutSeconds: 30,
  status: 1,
  sortOrder: 0,
  description: '',
  // 竞技场专属字段
  matchTimeRanges: [],  // 开赛时间段
  matchRoundDuration: 5,  // 每场时长（分钟）
  matchRoundCount: 3,  // 轮次
  maxPlayers: 9,  // 最大人数
  minPlayers: 3,  // 最小开赛人数
  championRewardId: null,  // 冠军奖励ID
  // 动态淘汰赛字段
  eliminationRules: '[60,30,18,9,3]',  // 淘汰规则
  rankWaitSeconds: 30,  // 排行榜等待秒数
  minMatchPlayers: 1  // 最小匹配人数
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
    roomCategory: null,
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
    // 确保竞技场字段有默认值
    // 解析 matchTimeRanges，可能是 JSON 字符串或数组
    if (!formData.value.matchTimeRanges) {
      formData.value.matchTimeRanges = []
    } else if (typeof formData.value.matchTimeRanges === 'string') {
      try {
        formData.value.matchTimeRanges = JSON.parse(formData.value.matchTimeRanges)
      } catch (e) {
        formData.value.matchTimeRanges = []
      }
    }
    if (formData.value.matchRoundDuration === undefined || formData.value.matchRoundDuration === null) {
      formData.value.matchRoundDuration = 5
    }
    if (formData.value.matchRoundCount === undefined || formData.value.matchRoundCount === null) {
      formData.value.matchRoundCount = 3
    }
    if (formData.value.maxPlayers === undefined || formData.value.maxPlayers === null) {
      formData.value.maxPlayers = 9
    }
    if (formData.value.minPlayers === undefined || formData.value.minPlayers === null) {
      formData.value.minPlayers = 3
    }
    if (formData.value.championRewardId === undefined) {
      formData.value.championRewardId = null
    }
    // 动态淘汰赛字段默认值
    if (!formData.value.eliminationRules) {
      formData.value.eliminationRules = '[60,30,18,9,3]'
    }
    if (formData.value.rankWaitSeconds === undefined || formData.value.rankWaitSeconds === null) {
      formData.value.rankWaitSeconds = 30
    }
    if (formData.value.minMatchPlayers === undefined || formData.value.minMatchPlayers === null) {
      formData.value.minMatchPlayers = 1
    }

  } else {
    formData.value = {
      ID: 0,
      roomName: '',
      roomType: 2,
      roomCategory: 1,  // 默认普通场
      baseScore: 1,
      multiplier: 1,
      minGold: 1000,
      maxGold: 0,
      minArenaCoin: 0,
      maxArenaCoin: 0,
      bgImageNum: 2,  // 默认背景图编号
      botEnabled: 1,
      botCount: 5,
      feeRate: 0,
      maxRound: 20,
      timeoutSeconds: 30,
      status: 1,
      sortOrder: 0,
      description: '',
      // 竞技场专属字段
      matchTimeRanges: [],
      matchRoundDuration: 5,
      matchRoundCount: 3,
      maxPlayers: 9,
      minPlayers: 3,
      championRewardId: null,
      // 动态淘汰赛字段
      eliminationRules: '[60,30,18,9,3]',
      rankWaitSeconds: 30,
      minMatchPlayers: 1
    }
  }
  dialogVisible.value = true
}

const submitForm = async () => {
  const api = dialogType.value === 'add' ? createRoomConfig : updateRoomConfig
  // 准备提交数据，将 matchTimeRanges 数组转为 JSON 字符串
  const submitData = {
    ...formData.value,
    matchTimeRanges: formData.value.matchTimeRanges && formData.value.matchTimeRanges.length > 0 
      ? JSON.stringify(formData.value.matchTimeRanges) 
      : ''
  }
  const res = await api(submitData)
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

// 获取奖励商品列表
const fetchRewardGoodsList = async () => {
  try {
    const res = await getRewardGoodsList({ page: 1, pageSize: 1000 })
    if (res.code === 0) {
      rewardGoodsOptions.value = res.data.list || []
    }
  } catch (e) {
    console.error('获取奖励商品列表失败', e)
  }
}

// 添加时间段
const addTimeRange = () => {
  if (!formData.value.matchTimeRanges) {
    formData.value.matchTimeRanges = []
  }
  formData.value.matchTimeRanges.push({ start: '', end: '' })
}

// 删除时间段
const removeTimeRange = (index) => {
  formData.value.matchTimeRanges.splice(index, 1)
}

// 格式化时间范围显示
const formatTimeRanges = (ranges) => {
  if (!ranges) return '-'
  
  // 如果是字符串，先解析为数组
  let parsedRanges = ranges
  if (typeof ranges === 'string') {
    if (ranges === '' || ranges === 'null') return '-'
    try {
      parsedRanges = JSON.parse(ranges)
    } catch (e) {
      return '-'
    }
  }
  
  if (!Array.isArray(parsedRanges) || parsedRanges.length === 0) {
    return '-'
  }
  return parsedRanges.map(r => `${r.start}-${r.end}`).join(', ')
}

// 获取奖励商品名称
const getRewardGoodsName = (id) => {
  if (!id) return '-'
  const goods = rewardGoodsOptions.value.find(g => g.ID === id)
  return goods ? goods.goodsName : '-'
}

getTableData()
fetchRewardGoodsList()
</script>

<style scoped>
.mb-4 {
  margin-bottom: 16px;
}
.text-warning {
  color: #e6a23c;
}
.text-gray-400 {
  color: #9ca3af;
}
.w-full {
  width: 100%;
}
.flex {
  display: flex;
}
.items-center {
  align-items: center;
}
.gap-2 {
  gap: 8px;
}
.mb-2 {
  margin-bottom: 8px;
}
</style>
