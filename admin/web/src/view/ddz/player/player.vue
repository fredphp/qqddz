<template>
  <div class="player-management">
    <!-- 搜索区域 -->
    <div class="gva-search-box">
      <el-form ref="searchForm" :inline="true" :model="searchInfo">
        <el-form-item label="玩家ID">
          <el-input v-model="searchInfo.playerId" placeholder="玩家ID" clearable />
        </el-form-item>
        <el-form-item label="昵称">
          <el-input v-model="searchInfo.nickname" placeholder="昵称" clearable />
        </el-form-item>
        <el-form-item label="状态">
          <el-select v-model="searchInfo.status" placeholder="状态" clearable style="width: 120px">
            <el-option label="正常" :value="1" />
            <el-option label="封禁" :value="2" />
            <el-option label="冻结" :value="3" />
          </el-select>
        </el-form-item>
        <el-form-item label="VIP等级">
          <el-select v-model="searchInfo.vipLevel" placeholder="VIP等级" clearable style="width: 120px">
            <el-option v-for="i in 10" :key="i" :label="'VIP' + i" :value="i" />
          </el-select>
        </el-form-item>
        <el-form-item label="用户类型">
          <el-select v-model="searchInfo.playerType" placeholder="用户类型" clearable style="width: 120px">
            <el-option label="平台用户" :value="1" />
            <el-option label="机器人" :value="2" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" icon="Search" @click="onSubmit">查询</el-button>
          <el-button icon="Refresh" @click="onReset">重置</el-button>
          <el-button type="success" icon="User" @click="openGenerateRobotsDialog">生成机器人</el-button>
        </el-form-item>
      </el-form>
    </div>

    <!-- 表格区域 -->
    <div class="gva-table-box">
      <el-table :data="tableData" row-key="ID" stripe>
        <el-table-column align="center" label="ID" min-width="60" prop="ID" />
        <el-table-column align="center" label="玩家ID" min-width="120" prop="playerId" />
        <el-table-column align="center" label="头像" min-width="70">
          <template #default="scope">
            <el-avatar
              :size="36"
              :src="getUrl(scope.row.avatar) || defaultAvatar"
              class="avatar-clickable"
              @click="openAvatarPreview(scope.row.avatar)"
            />
          </template>
        </el-table-column>
        <el-table-column align="center" label="昵称" min-width="100" prop="nickname" />
        <el-table-column align="center" label="类型" min-width="90">
          <template #default="scope">
            <el-tag :type="scope.row.playerType === 2 ? 'info' : 'primary'" size="small">
              {{ scope.row.playerTypeText }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column align="center" label="金币" min-width="100">
          <template #default="scope">
            <span class="currency-value gold">{{ formatNumber(scope.row.coins) }}</span>
          </template>
        </el-table-column>
        <el-table-column align="center" label="竞技币" min-width="100">
          <template #default="scope">
            <span class="currency-value arena">{{ formatNumber(scope.row.arenaCoin) }}</span>
          </template>
        </el-table-column>
        <el-table-column align="center" label="钻石" min-width="80">
          <template #default="scope">
            <span class="currency-value diamond">{{ formatNumber(scope.row.diamonds) }}</span>
          </template>
        </el-table-column>
        <el-table-column align="center" label="等级" min-width="60" prop="level" />
        <el-table-column align="center" label="VIP" min-width="70">
          <template #default="scope">
            <el-tag v-if="scope.row.vipLevel > 0" type="warning" size="small">VIP{{ scope.row.vipLevel }}</el-tag>
            <span v-else class="text-muted">-</span>
          </template>
        </el-table-column>
        <el-table-column align="center" label="状态" min-width="90">
          <template #default="scope">
            <el-tag :type="getStatusType(scope.row.status)" size="small">
              {{ scope.row.statusText }}
            </el-tag>
            <div v-if="scope.row.status !== 1 && scope.row.statusExpire" class="status-expire">
              至 {{ scope.row.statusExpire }}
            </div>
          </template>
        </el-table-column>
        <el-table-column align="center" label="最后登录" min-width="150" prop="lastLoginAt" />
        <el-table-column align="center" label="操作" min-width="280" fixed="right">
          <template #default="scope">
            <el-button type="primary" link icon="View" @click="viewPlayer(scope.row)">详情</el-button>
            <el-button type="primary" link icon="Edit" @click="openEditDialog(scope.row)">编辑</el-button>
            <el-button type="warning" link icon="Coin" @click="openCurrencyDialog(scope.row)">调币</el-button>
            <el-dropdown trigger="click" class="action-dropdown">
              <el-button type="info" link>
                更多<el-icon class="el-icon--right"><ArrowDown /></el-icon>
              </el-button>
              <template #dropdown>
                <el-dropdown-menu>
                  <el-dropdown-item v-if="scope.row.status === 1" @click="openFreezeDialog(scope.row)">
                    <el-icon><Lock /></el-icon>冻结
                  </el-dropdown-item>
                  <el-dropdown-item v-if="scope.row.status === 3" @click="openUnfreezeDialog(scope.row)">
                    <el-icon><Unlock /></el-icon>解冻
                  </el-dropdown-item>
                  <el-dropdown-item v-if="scope.row.status === 1" @click="openBanDialog(scope.row)">
                    <el-icon><CircleClose /></el-icon>封号
                  </el-dropdown-item>
                  <el-dropdown-item v-if="scope.row.status === 2" @click="openUnbanDialog(scope.row)">
                    <el-icon><CircleCheck /></el-icon>解封
                  </el-dropdown-item>
                  <el-dropdown-item divided @click="openStatusLogDialog(scope.row)">
                    <el-icon><Document /></el-icon>操作记录
                  </el-dropdown-item>
                </el-dropdown-menu>
              </template>
            </el-dropdown>
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

    <!-- 玩家详情对话框 -->
    <el-dialog v-model="detailDialog" title="玩家详情" width="650px" destroy-on-close>
      <el-descriptions :column="2" border>
        <el-descriptions-item label="玩家ID">{{ currentPlayer.playerId }}</el-descriptions-item>
        <el-descriptions-item label="昵称">{{ currentPlayer.nickname }}</el-descriptions-item>
        <el-descriptions-item label="用户类型">
          <el-tag :type="currentPlayer.playerType === 2 ? 'info' : 'primary'" size="small">
            {{ currentPlayer.playerTypeText }}
          </el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="金币">
          <span class="currency-value gold">{{ formatNumber(currentPlayer.coins) }}</span>
        </el-descriptions-item>
        <el-descriptions-item label="竞技币">
          <span class="currency-value arena">{{ formatNumber(currentPlayer.arenaCoin) }}</span>
        </el-descriptions-item>
        <el-descriptions-item label="钻石">
          <span class="currency-value diamond">{{ formatNumber(currentPlayer.diamonds) }}</span>
        </el-descriptions-item>
        <el-descriptions-item label="等级">{{ currentPlayer.level }}</el-descriptions-item>
        <el-descriptions-item label="VIP等级">VIP{{ currentPlayer.vipLevel }}</el-descriptions-item>
        <el-descriptions-item label="胜场">{{ currentPlayer.winCount }}</el-descriptions-item>
        <el-descriptions-item label="败场">{{ currentPlayer.loseCount }}</el-descriptions-item>
        <el-descriptions-item label="总场次">{{ currentPlayer.totalGames }}</el-descriptions-item>
        <el-descriptions-item label="胜率">{{ currentPlayer.winRate?.toFixed(2) }}%</el-descriptions-item>
        <el-descriptions-item label="最后登录IP">{{ currentPlayer.lastLoginIp }}</el-descriptions-item>
        <el-descriptions-item label="最后登录">{{ currentPlayer.lastLoginAt }}</el-descriptions-item>
        <el-descriptions-item label="状态">
          <el-tag :type="getStatusType(currentPlayer.status)">
            {{ currentPlayer.statusText }}
          </el-tag>
        </el-descriptions-item>
        <el-descriptions-item v-if="currentPlayer.statusReason" label="状态原因">
          {{ currentPlayer.statusReason }}
        </el-descriptions-item>
        <el-descriptions-item v-if="currentPlayer.statusExpire" label="到期时间">
          {{ currentPlayer.statusExpire }}
        </el-descriptions-item>
      </el-descriptions>
      <template #footer>
        <el-button @click="detailDialog = false">关闭</el-button>
      </template>
    </el-dialog>

    <!-- 编辑玩家对话框 -->
    <el-dialog v-model="editDialog" title="编辑玩家信息" width="500px" destroy-on-close>
      <el-form ref="editFormRef" :model="editForm" label-width="80px">
        <el-form-item label="昵称">
          <el-input v-model="editForm.nickname" placeholder="请输入昵称" />
        </el-form-item>
        <el-form-item label="头像">
          <div class="avatar-upload-section">
            <SelectImage v-model="editForm.avatar" file-type="image" :rounded="true" />
            <div class="avatar-tip">点击头像从媒体库选择或上传图片</div>
          </div>
        </el-form-item>
        <el-form-item label="性别">
          <el-radio-group v-model="editForm.gender">
            <el-radio :value="0">未知</el-radio>
            <el-radio :value="1">男</el-radio>
            <el-radio :value="2">女</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="VIP等级">
          <el-select v-model="editForm.vipLevel" style="width: 150px">
            <el-option v-for="i in 11" :key="i-1" :label="i-1 === 0 ? '普通用户' : 'VIP' + (i-1)" :value="i-1" />
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="editDialog = false">取消</el-button>
        <el-button type="primary" @click="handleEdit">保存</el-button>
      </template>
    </el-dialog>

    <!-- 货币调整对话框 -->
    <el-dialog v-model="currencyDialog" title="货币调整" width="550px" destroy-on-close>
      <div class="currency-dialog-content">
        <!-- 玩家信息 -->
        <div class="player-info-card">
          <el-avatar :size="48" :src="getUrl(currencyForm.avatar) || defaultAvatar" />
          <div class="player-details">
            <div class="player-name">{{ currencyForm.nickname }}</div>
            <div class="player-id">ID: {{ currencyForm.playerId }}</div>
          </div>
        </div>

        <!-- 当前余额 -->
        <div class="balance-cards">
          <div class="balance-card gold">
            <div class="balance-label">金币</div>
            <div class="balance-value">{{ formatNumber(currencyForm.coins) }}</div>
          </div>
          <div class="balance-card arena">
            <div class="balance-label">竞技币</div>
            <div class="balance-value">{{ formatNumber(currencyForm.arenaCoin) }}</div>
          </div>
          <div class="balance-card diamond">
            <div class="balance-label">钻石</div>
            <div class="balance-value">{{ formatNumber(currencyForm.diamonds) }}</div>
          </div>
        </div>

        <!-- 调整表单 -->
        <el-form ref="currencyFormRef" :model="currencyForm" label-width="80px" class="currency-form">
          <el-form-item label="货币类型">
            <el-radio-group v-model="currencyForm.currencyType">
              <el-radio-button value="gold">
                <span class="currency-radio gold">金币</span>
              </el-radio-button>
              <el-radio-button value="arenaCoin">
                <span class="currency-radio arena">竞技币</span>
              </el-radio-button>
              <el-radio-button value="diamond">
                <span class="currency-radio diamond">钻石</span>
              </el-radio-button>
            </el-radio-group>
          </el-form-item>
          <el-form-item label="调整方式">
            <el-radio-group v-model="currencyForm.operationType">
              <el-radio-button value="add">
                <el-icon><Plus /></el-icon> 增加
              </el-radio-button>
              <el-radio-button value="subtract">
                <el-icon><Minus /></el-icon> 扣除
              </el-radio-button>
            </el-radio-group>
          </el-form-item>
          <el-form-item label="调整数量">
            <el-input-number
              v-model="currencyForm.amount"
              :min="1"
              :max="999999999"
              :step="100"
              style="width: 200px"
            />
          </el-form-item>
          <el-form-item label="调整备注">
            <el-input
              v-model="currencyForm.remark"
              type="textarea"
              :rows="2"
              placeholder="请输入调整原因（选填）"
            />
          </el-form-item>
          <el-form-item label="预计结果">
            <div class="preview-result">
              <span class="preview-label">调整后余额：</span>
              <span class="preview-value" :class="previewClass">
                {{ formatNumber(previewBalance) }}
              </span>
              <span class="preview-change" :class="currencyForm.operationType">
                ({{ currencyForm.operationType === 'add' ? '+' : '-' }}{{ formatNumber(currencyForm.amount) }})
              </span>
            </div>
          </el-form-item>
        </el-form>
      </div>
      <template #footer>
        <el-button @click="openLogDialog">查看流水</el-button>
        <el-button @click="currencyDialog = false">取消</el-button>
        <el-button type="primary" @click="handleCurrencyUpdate">确认调整</el-button>
      </template>
    </el-dialog>

    <!-- 流水日志对话框 -->
    <el-dialog v-model="logDialog" title="货币流水记录" width="800px" destroy-on-close>
      <div class="log-dialog-content">
        <div class="log-header">
          <el-radio-group v-model="logCurrencyType" @change="loadCoinLogs">
            <el-radio-button value="gold">金币流水</el-radio-button>
            <el-radio-button value="arenaCoin">竞技币流水</el-radio-button>
            <el-radio-button value="diamond">钻石流水</el-radio-button>
          </el-radio-group>
        </div>
        <el-table :data="logData" stripe max-height="400">
          <el-table-column align="center" label="时间" min-width="150" prop="createdAt" />
          <el-table-column align="center" label="变化" min-width="120">
            <template #default="scope">
              <span :class="scope.row.changeAmount >= 0 ? 'log-add' : 'log-subtract'">
                {{ scope.row.changeAmount >= 0 ? '+' : '' }}{{ formatNumber(scope.row.changeAmount) }}
              </span>
            </template>
          </el-table-column>
          <el-table-column align="center" label="余额" min-width="100">
            <template #default="scope">
              <span>{{ formatNumber(scope.row.balanceAfter) }}</span>
            </template>
          </el-table-column>
          <el-table-column align="center" label="类型" min-width="100" prop="changeTypeText" />
          <el-table-column align="center" label="备注" min-width="150" prop="remark" show-overflow-tooltip />
        </el-table>
        <div class="log-pagination">
          <el-pagination
            v-model:current-page="logPage"
            v-model:page-size="logPageSize"
            :total="logTotal"
            layout="total, prev, pager, next"
            @current-change="loadCoinLogs"
          />
        </div>
      </div>
    </el-dialog>

    <!-- 冻结对话框 -->
    <el-dialog v-model="freezeDialog" title="冻结玩家" width="450px" destroy-on-close>
      <div class="action-dialog-content">
        <div class="action-player-info">
          <el-avatar :size="48" :src="getUrl(freezeForm.avatar) || defaultAvatar" />
          <div class="action-player-details">
            <div class="action-player-name">{{ freezeForm.nickname }}</div>
            <div class="action-player-id">ID: {{ freezeForm.playerId }}</div>
          </div>
        </div>
        <el-form ref="freezeFormRef" :model="freezeForm" label-width="80px" class="action-form">
          <el-form-item label="冻结时长">
            <el-radio-group v-model="freezeForm.durationType">
              <el-radio value="permanent">永久</el-radio>
              <el-radio value="temporary">限时</el-radio>
            </el-radio-group>
          </el-form-item>
          <el-form-item v-if="freezeForm.durationType === 'temporary'" label="时长">
            <el-input-number v-model="freezeForm.duration" :min="1" :max="9999" style="width: 150px" />
            <el-select v-model="freezeForm.durationUnit" style="width: 100px; margin-left: 8px">
              <el-option label="小时" value="hour" />
              <el-option label="天" value="day" />
            </el-select>
          </el-form-item>
          <el-form-item label="冻结原因" required>
            <el-input
              v-model="freezeForm.reason"
              type="textarea"
              :rows="3"
              placeholder="请输入冻结原因"
            />
          </el-form-item>
        </el-form>
      </div>
      <template #footer>
        <el-button @click="freezeDialog = false">取消</el-button>
        <el-button type="warning" @click="handleFreeze">确认冻结</el-button>
      </template>
    </el-dialog>

    <!-- 解冻对话框 -->
    <el-dialog v-model="unfreezeDialog" title="解冻玩家" width="450px" destroy-on-close>
      <div class="action-dialog-content">
        <div class="action-player-info">
          <el-avatar :size="48" :src="getUrl(unfreezeForm.avatar) || defaultAvatar" />
          <div class="action-player-details">
            <div class="action-player-name">{{ unfreezeForm.nickname }}</div>
            <div class="action-player-id">ID: {{ unfreezeForm.playerId }}</div>
          </div>
        </div>
        <el-form ref="unfreezeFormRef" :model="unfreezeForm" label-width="80px" class="action-form">
          <el-form-item label="解冻原因" required>
            <el-input
              v-model="unfreezeForm.reason"
              type="textarea"
              :rows="3"
              placeholder="请输入解冻原因"
            />
          </el-form-item>
        </el-form>
      </div>
      <template #footer>
        <el-button @click="unfreezeDialog = false">取消</el-button>
        <el-button type="success" @click="handleUnfreeze">确认解冻</el-button>
      </template>
    </el-dialog>

    <!-- 封号对话框 -->
    <el-dialog v-model="banDialog" title="封号玩家" width="450px" destroy-on-close>
      <div class="action-dialog-content">
        <div class="action-player-info">
          <el-avatar :size="48" :src="getUrl(banForm.avatar) || defaultAvatar" />
          <div class="action-player-details">
            <div class="action-player-name">{{ banForm.nickname }}</div>
            <div class="action-player-id">ID: {{ banForm.playerId }}</div>
          </div>
        </div>
        <el-form ref="banFormRef" :model="banForm" label-width="80px" class="action-form">
          <el-form-item label="封号时长">
            <el-radio-group v-model="banForm.durationType">
              <el-radio value="permanent">永久</el-radio>
              <el-radio value="temporary">限时</el-radio>
            </el-radio-group>
          </el-form-item>
          <el-form-item v-if="banForm.durationType === 'temporary'" label="时长">
            <el-input-number v-model="banForm.duration" :min="1" :max="9999" style="width: 150px" />
            <el-select v-model="banForm.durationUnit" style="width: 100px; margin-left: 8px">
              <el-option label="小时" value="hour" />
              <el-option label="天" value="day" />
            </el-select>
          </el-form-item>
          <el-form-item label="封号原因" required>
            <el-input
              v-model="banForm.reason"
              type="textarea"
              :rows="3"
              placeholder="请输入封号原因"
            />
          </el-form-item>
        </el-form>
      </div>
      <template #footer>
        <el-button @click="banDialog = false">取消</el-button>
        <el-button type="danger" @click="handleBan">确认封号</el-button>
      </template>
    </el-dialog>

    <!-- 解封对话框 -->
    <el-dialog v-model="unbanDialog" title="解封玩家" width="450px" destroy-on-close>
      <div class="action-dialog-content">
        <div class="action-player-info">
          <el-avatar :size="48" :src="getUrl(unbanForm.avatar) || defaultAvatar" />
          <div class="action-player-details">
            <div class="action-player-name">{{ unbanForm.nickname }}</div>
            <div class="action-player-id">ID: {{ unbanForm.playerId }}</div>
          </div>
        </div>
        <el-form ref="unbanFormRef" :model="unbanForm" label-width="80px" class="action-form">
          <el-form-item label="解封原因" required>
            <el-input
              v-model="unbanForm.reason"
              type="textarea"
              :rows="3"
              placeholder="请输入解封原因"
            />
          </el-form-item>
        </el-form>
      </div>
      <template #footer>
        <el-button @click="unbanDialog = false">取消</el-button>
        <el-button type="success" @click="handleUnban">确认解封</el-button>
      </template>
    </el-dialog>

    <!-- 状态变更日志对话框 -->
    <el-dialog v-model="statusLogDialog" title="操作记录" width="700px" destroy-on-close>
      <div class="status-log-content">
        <el-table :data="statusLogData" stripe max-height="450">
          <el-table-column align="center" label="时间" min-width="150" prop="createdAt" />
          <el-table-column align="center" label="操作" min-width="80">
            <template #default="scope">
              <el-tag :type="getActionTagType(scope.row.actionType)" size="small">
                {{ scope.row.actionTypeText }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column align="center" label="时长" min-width="100">
            <template #default="scope">
              {{ scope.row.durationText || '-' }}
            </template>
          </el-table-column>
          <el-table-column align="center" label="到期时间" min-width="150">
            <template #default="scope">
              {{ scope.row.expireAt || '-' }}
            </template>
          </el-table-column>
          <el-table-column align="center" label="原因" min-width="150" prop="reason" show-overflow-tooltip />
          <el-table-column align="center" label="操作人" min-width="100" prop="operatorName" />
        </el-table>
        <div class="log-pagination">
          <el-pagination
            v-model:current-page="statusLogPage"
            v-model:page-size="statusLogPageSize"
            :total="statusLogTotal"
            layout="total, prev, pager, next"
            @current-change="loadStatusLogs"
          />
        </div>
      </div>
    </el-dialog>

    <!-- 头像预览弹窗 -->
    <el-dialog
      v-model="avatarPreviewVisible"
      :show-close="false"
      :close-on-click-modal="true"
      :close-on-press-escape="true"
      width="auto"
      class="avatar-preview-dialog"
      @click="avatarPreviewVisible = false"
    >
      <img :src="avatarPreviewUrl" class="avatar-preview-image" @click.stop />
      <div class="avatar-preview-close" @click="avatarPreviewVisible = false">
        <el-icon :size="24"><Close /></el-icon>
      </div>
    </el-dialog>

    <!-- 生成机器人对话框 -->
    <el-dialog v-model="generateRobotsDialog" title="批量生成机器人" width="600px" destroy-on-close>
      <div class="generate-robots-content">
        <div class="generate-info-card">
          <el-icon :size="48" color="#67c23a"><User /></el-icon>
          <div class="generate-info-text">
            <div class="generate-info-title">模拟微信授权注册</div>
            <div class="generate-info-desc">机器人将自动生成唯一的玩家ID、随机昵称和头像</div>
          </div>
        </div>

        <el-form :model="generateRobotsForm" label-width="100px" class="generate-form">
          <el-form-item label="生成数量">
            <el-slider
              v-model="generateRobotsForm.count"
              :min="5"
              :max="20"
              :step="1"
              :marks="robotCountMarks"
              show-input
              style="width: 100%"
            />
          </el-form-item>
          <el-form-item label="说明">
            <div class="generate-tips">
              <p>• 机器人ID格式：robot_时间戳_随机数</p>
              <p>• 昵称从预设的150个常用昵称中随机选择</p>
              <p>• 头像从 uploads/file/avatar 文件夹随机选择</p>
              <p>• Token使用16位（正常用户32位）</p>
              <p>• 初始金币范围：1,000 ~ 10,000</p>
              <p>• 性别随机生成（未知/男/女）</p>
              <p>• 自动创建微信授权类型的用户账户</p>
            </div>
          </el-form-item>
        </el-form>

        <!-- 生成结果 -->
        <div v-if="generateResult.successCount > 0" class="generate-result">
          <el-alert
            :title="`成功生成 ${generateResult.successCount} 个机器人`"
            type="success"
            :closable="false"
            show-icon
          />
          <div v-if="generateResult.robots.length > 0" class="generated-robots-list">
            <div v-for="robot in generateResult.robots" :key="robot.ID" class="robot-item">
              <el-avatar :size="32" :src="getUrl(robot.avatar) || defaultAvatar" />
              <div class="robot-info">
                <span class="robot-nickname">{{ robot.nickname }}</span>
                <span class="robot-id">{{ robot.playerId }}</span>
              </div>
              <span class="robot-gold">{{ formatNumber(robot.coins) }} 金币</span>
            </div>
          </div>
        </div>
      </div>
      <template #footer>
        <el-button @click="generateRobotsDialog = false">关闭</el-button>
        <el-button type="success" :loading="generateLoading" @click="handleGenerateRobots">
          {{ generateLoading ? '生成中...' : '开始生成' }}
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus, Minus, Close, ArrowDown, Lock, Unlock, CircleClose, CircleCheck, Document, User } from '@element-plus/icons-vue'
import {
  getPlayerList,
  updatePlayer,
  updatePlayerCurrency,
  getCoinLogList,
  freezePlayer,
  unfreezePlayer,
  banPlayer,
  unbanPlayer,
  getPlayerStatusLogs,
  generateRobots
} from '@/api/ddz/player'
import SelectImage from '@/components/selectImage/selectImage.vue'
import { getUrl } from '@/utils/image'

defineOptions({
  name: 'DDZPlayer'
})

// 默认头像
const defaultAvatar = 'https://cube.elemecdn.com/3/7c/3ea6beec64369c2642b92c6726f1epng.png'

// 搜索相关
const searchInfo = ref({
  playerId: '',
  nickname: '',
  status: null,
  vipLevel: null,
  playerType: null
})

// 分页相关
const page = ref(1)
const total = ref(0)
const pageSize = ref(10)
const tableData = ref([])

// 对话框控制
const detailDialog = ref(false)
const editDialog = ref(false)
const currencyDialog = ref(false)
const logDialog = ref(false)
const freezeDialog = ref(false)
const unfreezeDialog = ref(false)
const banDialog = ref(false)
const unbanDialog = ref(false)
const statusLogDialog = ref(false)

// 当前选中玩家
const currentPlayer = ref({})

// 编辑表单
const editForm = ref({
  ID: null,
  nickname: '',
  avatar: '',
  gender: 0,
  vipLevel: 0
})

// 货币调整表单
const currencyForm = ref({
  ID: null,
  playerId: '',
  nickname: '',
  avatar: '',
  coins: 0,
  arenaCoin: 0,
  diamonds: 0,
  currencyType: 'gold',
  operationType: 'add',
  amount: 100,
  remark: ''
})

// 冻结表单
const freezeForm = ref({
  playerId: null,
  nickname: '',
  avatar: '',
  durationType: 'permanent',
  duration: 1,
  durationUnit: 'day',
  reason: ''
})

// 解冻表单
const unfreezeForm = ref({
  playerId: null,
  nickname: '',
  avatar: '',
  reason: ''
})

// 封号表单
const banForm = ref({
  playerId: '',
  nickname: '',
  avatar: '',
  durationType: 'permanent',
  duration: 1,
  durationUnit: 'day',
  reason: ''
})

// 解封表单
const unbanForm = ref({
  playerId: '',
  nickname: '',
  avatar: '',
  reason: ''
})

// 流水日志相关
const logCurrencyType = ref('gold')
const logData = ref([])
const logPage = ref(1)
const logPageSize = ref(10)
const logTotal = ref(0)

// 状态日志相关
const statusLogData = ref([])
const statusLogPage = ref(1)
const statusLogPageSize = ref(10)
const statusLogTotal = ref(0)
const statusLogPlayerId = ref(null)

// 头像预览相关
const avatarPreviewVisible = ref(false)
const avatarPreviewUrl = ref('')

// 生成机器人相关
const generateRobotsDialog = ref(false)
const generateLoading = ref(false)
const generateRobotsForm = ref({
  count: 10
})
const generateResult = ref({
  successCount: 0,
  failedCount: 0,
  robots: []
})
const robotCountMarks = {
  5: '5个',
  10: '10个',
  15: '15个',
  20: '20个'
}

// 打开头像预览
const openAvatarPreview = (avatar) => {
  if (avatar) {
    avatarPreviewUrl.value = getUrl(avatar)
    avatarPreviewVisible.value = true
  }
}

// 获取状态类型
const getStatusType = (status) => {
  switch (status) {
    case 1: return 'success'
    case 2: return 'danger'
    case 3: return 'warning'
    default: return 'info'
  }
}

// 获取操作类型标签类型
const getActionTagType = (actionType) => {
  switch (actionType) {
    case 1: return 'warning' // 冻结
    case 2: return 'success' // 解冻
    case 3: return 'danger'  // 封号
    case 4: return 'success' // 解封
    default: return 'info'
  }
}

// 预计余额计算
const previewBalance = computed(() => {
  const current = currencyForm.value[currencyForm.value.currencyType] || 0
  const amount = currencyForm.value.operationType === 'add'
    ? currencyForm.value.amount
    : -currencyForm.value.amount
  return current + amount
})

const previewClass = computed(() => {
  return previewBalance.value < 0 ? 'negative' : 'positive'
})

// 格式化数字
const formatNumber = (num) => {
  if (num === null || num === undefined) return '0'
  if (num >= 100000000) {
    return (num / 100000000).toFixed(2) + '亿'
  } else if (num >= 10000) {
    return (num / 10000).toFixed(2) + '万'
  }
  return num.toLocaleString()
}

// 搜索方法
const onSubmit = () => {
  page.value = 1
  getTableData()
}

const onReset = () => {
  searchInfo.value = {
    playerId: '',
    nickname: '',
    status: null,
    vipLevel: null,
    playerType: null
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

// 获取表格数据
const getTableData = async () => {
  const res = await getPlayerList({
    page: page.value,
    pageSize: pageSize.value,
    ...searchInfo.value
  })
  if (res.code === 0) {
    tableData.value = res.data.list
    total.value = res.data.total
  }
}

// 查看玩家详情
const viewPlayer = (row) => {
  currentPlayer.value = row
  detailDialog.value = true
}

// 打开编辑对话框
const openEditDialog = (row) => {
  editForm.value = {
    ID: row.ID,
    nickname: row.nickname || '',
    avatar: row.avatar || '',
    gender: row.gender !== undefined ? row.gender : 0,
    vipLevel: row.vipLevel || 0
  }
  editDialog.value = true
}

// 保存编辑
const handleEdit = async () => {
  const res = await updatePlayer(editForm.value)
  if (res.code === 0) {
    ElMessage.success('保存成功')
    editDialog.value = false
    getTableData()
  }
}

// 打开货币调整对话框
const openCurrencyDialog = (row) => {
  currencyForm.value = {
    ID: row.ID,
    playerId: row.playerId,
    nickname: row.nickname,
    avatar: row.avatar,
    coins: row.coins || 0,
    arenaCoin: row.arenaCoin || 0,
    diamonds: row.diamonds || 0,
    currencyType: 'gold',
    operationType: 'add',
    amount: 100,
    remark: ''
  }
  currencyDialog.value = true
}

// 执行货币调整
const handleCurrencyUpdate = async () => {
  if (currencyForm.value.amount <= 0) {
    ElMessage.warning('请输入有效的调整数量')
    return
  }

  // 检查余额是否足够
  if (currencyForm.value.operationType === 'subtract') {
    const current = currencyForm.value[currencyForm.value.currencyType]
    if (current < currencyForm.value.amount) {
      ElMessage.warning('余额不足，无法扣除')
      return
    }
  }

  const amount = currencyForm.value.operationType === 'add'
    ? currencyForm.value.amount
    : -currencyForm.value.amount

  const operationText = currencyForm.value.operationType === 'add' ? '增加' : '扣除'
  const currencyText = {
    gold: '金币',
    arenaCoin: '竞技币',
    diamond: '钻石'
  }[currencyForm.value.currencyType]

  try {
    await ElMessageBox.confirm(
      `确定要为玩家【${currencyForm.value.nickname}】${operationText} ${formatNumber(currencyForm.value.amount)} ${currencyText}吗？`,
      '确认调整',
      { type: 'warning' }
    )

    const res = await updatePlayerCurrency({
      ID: currencyForm.value.ID,
      currencyType: currencyForm.value.currencyType,
      amount: amount,
      remark: currencyForm.value.remark || `${operationText}${currencyText}`
    })

    if (res.code === 0) {
      ElMessage.success('调整成功')
      // 更新本地余额显示
      currencyForm.value[currencyForm.value.currencyType] = previewBalance.value
      getTableData()
    }
  } catch {
    // 用户取消
  }
}

// 打开流水日志对话框
const openLogDialog = () => {
  logCurrencyType.value = currencyForm.value.currencyType
  logPage.value = 1
  loadCoinLogs()
  logDialog.value = true
}

// 加载流水日志
const loadCoinLogs = async () => {
  const res = await getCoinLogList({
    page: logPage.value,
    pageSize: logPageSize.value,
    playerId: currencyForm.value.ID,
    currencyType: logCurrencyType.value
  })
  if (res.code === 0) {
    logData.value = res.data.list
    logTotal.value = res.data.total
  }
}

// 打开冻结对话框
const openFreezeDialog = (row) => {
  freezeForm.value = {
    playerId: row.ID,
    nickname: row.nickname,
    avatar: row.avatar,
    durationType: 'permanent',
    duration: 1,
    durationUnit: 'day',
    reason: ''
  }
  freezeDialog.value = true
}

// 执行冻结
const handleFreeze = async () => {
  if (!freezeForm.value.reason) {
    ElMessage.warning('请输入冻结原因')
    return
  }

  let duration = 0
  if (freezeForm.value.durationType === 'temporary') {
    duration = freezeForm.value.durationUnit === 'day'
      ? freezeForm.value.duration * 24
      : freezeForm.value.duration
  }

  try {
    await ElMessageBox.confirm(
      `确定要冻结玩家【${freezeForm.value.nickname}】吗？`,
      '确认冻结',
      { type: 'warning' }
    )

    const res = await freezePlayer({
      playerId: freezeForm.value.playerId,
      reason: freezeForm.value.reason,
      duration: duration
    })

    if (res.code === 0) {
      ElMessage.success('冻结成功')
      freezeDialog.value = false
      getTableData()
    }
  } catch {
    // 用户取消
  }
}

// 打开解冻对话框
const openUnfreezeDialog = (row) => {
  unfreezeForm.value = {
    playerId: row.ID,
    nickname: row.nickname,
    avatar: row.avatar,
    reason: ''
  }
  unfreezeDialog.value = true
}

// 执行解冻
const handleUnfreeze = async () => {
  if (!unfreezeForm.value.reason) {
    ElMessage.warning('请输入解冻原因')
    return
  }

  try {
    await ElMessageBox.confirm(
      `确定要解冻玩家【${unfreezeForm.value.nickname}】吗？`,
      '确认解冻',
      { type: 'warning' }
    )

    const res = await unfreezePlayer({
      playerId: unfreezeForm.value.playerId,
      reason: unfreezeForm.value.reason
    })

    if (res.code === 0) {
      ElMessage.success('解冻成功')
      unfreezeDialog.value = false
      getTableData()
    }
  } catch {
    // 用户取消
  }
}

// 打开封号对话框
const openBanDialog = (row) => {
  banForm.value = {
    playerId: row.playerId,
    nickname: row.nickname,
    avatar: row.avatar,
    durationType: 'permanent',
    duration: 1,
    durationUnit: 'day',
    reason: ''
  }
  banDialog.value = true
}

// 执行封号
const handleBan = async () => {
  if (!banForm.value.reason) {
    ElMessage.warning('请输入封号原因')
    return
  }

  let duration = 0
  if (banForm.value.durationType === 'temporary') {
    duration = banForm.value.durationUnit === 'day'
      ? banForm.value.duration * 24
      : banForm.value.duration
  }

  try {
    await ElMessageBox.confirm(
      `确定要封号玩家【${banForm.value.nickname}】吗？`,
      '确认封号',
      { type: 'warning' }
    )

    const res = await banPlayer({
      playerId: banForm.value.playerId,
      reason: banForm.value.reason,
      duration: duration
    })

    if (res.code === 0) {
      ElMessage.success('封号成功')
      banDialog.value = false
      getTableData()
    }
  } catch {
    // 用户取消
  }
}

// 打开解封对话框
const openUnbanDialog = (row) => {
  unbanForm.value = {
    playerId: row.playerId,
    nickname: row.nickname,
    avatar: row.avatar,
    reason: ''
  }
  unbanDialog.value = true
}

// 执行解封
const handleUnban = async () => {
  if (!unbanForm.value.reason) {
    ElMessage.warning('请输入解封原因')
    return
  }

  try {
    await ElMessageBox.confirm(
      `确定要解封玩家【${unbanForm.value.nickname}】吗？`,
      '确认解封',
      { type: 'warning' }
    )

    const res = await unbanPlayer({
      playerId: unbanForm.value.playerId,
      reason: unbanForm.value.reason
    })

    if (res.code === 0) {
      ElMessage.success('解封成功')
      unbanDialog.value = false
      getTableData()
    }
  } catch {
    // 用户取消
  }
}

// 打开状态日志对话框
const openStatusLogDialog = (row) => {
  statusLogPlayerId.value = row.ID
  statusLogPage.value = 1
  loadStatusLogs()
  statusLogDialog.value = true
}

// 加载状态日志
const loadStatusLogs = async () => {
  const res = await getPlayerStatusLogs({
    page: statusLogPage.value,
    pageSize: statusLogPageSize.value,
    playerId: statusLogPlayerId.value
  })
  if (res.code === 0) {
    statusLogData.value = res.data.list
    statusLogTotal.value = res.data.total
  }
}

// 初始化
getTableData()

// 打开生成机器人对话框
const openGenerateRobotsDialog = () => {
  generateResult.value = {
    successCount: 0,
    failedCount: 0,
    robots: []
  }
  generateRobotsForm.value.count = 10
  generateRobotsDialog.value = true
}

// 执行生成机器人
const handleGenerateRobots = async () => {
  generateLoading.value = true
  try {
    const res = await generateRobots({ count: generateRobotsForm.value.count })
    if (res.code === 0) {
      generateResult.value = res.data
      ElMessage.success(res.msg || `成功生成 ${res.data.successCount} 个机器人`)
      getTableData()
    }
  } catch (error) {
    ElMessage.error('生成机器人失败')
  } finally {
    generateLoading.value = false
  }
}
</script>

<style scoped>
.player-management {
  padding: 0;
}

/* 货币颜色 */
.currency-value {
  font-weight: 600;
}
.currency-value.gold {
  color: #f59e0b;
}
.currency-value.arena {
  color: #3b82f6;
}
.currency-value.diamond {
  color: #8b5cf6;
}

.text-muted {
  color: #9ca3af;
}

/* 状态过期时间 */
.status-expire {
  font-size: 10px;
  color: #909399;
  margin-top: 2px;
}

/* 操作下拉菜单 */
.action-dropdown {
  margin-left: 8px;
}

/* 头像可点击 */
.avatar-clickable {
  cursor: pointer;
  transition: transform 0.2s;
}
.avatar-clickable:hover {
  transform: scale(1.1);
}

/* 头像上传部分 */
.avatar-upload-section {
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.avatar-tip {
  font-size: 12px;
  color: #909399;
}

/* 货币对话框 */
.currency-dialog-content {
  padding: 0 10px;
}

.player-info-card {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 12px;
  color: white;
  margin-bottom: 20px;
}
.player-details {
  flex: 1;
}
.player-name {
  font-size: 18px;
  font-weight: 600;
}
.player-id {
  font-size: 12px;
  opacity: 0.8;
}

/* 余额卡片 */
.balance-cards {
  display: flex;
  gap: 12px;
  margin-bottom: 20px;
}
.balance-card {
  flex: 1;
  padding: 16px;
  border-radius: 10px;
  text-align: center;
  color: white;
}
.balance-card.gold {
  background: linear-gradient(135deg, #f59e0b 0%, #fbbf24 100%);
}
.balance-card.arena {
  background: linear-gradient(135deg, #3b82f6 0%, #60a5fa 100%);
}
.balance-card.diamond {
  background: linear-gradient(135deg, #8b5cf6 0%, #a78bfa 100%);
}
.balance-label {
  font-size: 12px;
  opacity: 0.9;
  margin-bottom: 4px;
}
.balance-value {
  font-size: 18px;
  font-weight: 700;
}

/* 货币选择按钮 */
.currency-radio.gold { color: #f59e0b; }
.currency-radio.arena { color: #3b82f6; }
.currency-radio.diamond { color: #8b5cf6; }

/* 预览结果 */
.preview-result {
  display: flex;
  align-items: center;
  gap: 8px;
}
.preview-label {
  color: #606266;
}
.preview-value {
  font-size: 18px;
  font-weight: 700;
}
.preview-value.positive { color: #67c23a; }
.preview-value.negative { color: #f56c6c; }
.preview-change.add { color: #67c23a; }
.preview-change.subtract { color: #f56c6c; }

/* 货币表单 */
.currency-form {
  margin-top: 16px;
}

/* 流水日志 */
.log-dialog-content {
  padding: 0 10px;
}
.log-header {
  margin-bottom: 16px;
}
.log-pagination {
  margin-top: 16px;
  display: flex;
  justify-content: center;
}
.log-add { color: #67c23a; font-weight: 600; }
.log-subtract { color: #f56c6c; font-weight: 600; }

/* 操作对话框样式 */
.action-dialog-content {
  padding: 0 10px;
}
.action-player-info {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px;
  background: #f5f7fa;
  border-radius: 8px;
  margin-bottom: 20px;
}
.action-player-details {
  flex: 1;
}
.action-player-name {
  font-size: 16px;
  font-weight: 600;
}
.action-player-id {
  font-size: 12px;
  color: #909399;
}
.action-form {
  margin-top: 16px;
}

/* 生成机器人对话框样式 */
.generate-robots-content {
  padding: 0 10px;
}
.generate-info-card {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 20px;
  background: linear-gradient(135deg, #67c23a 0%, #85ce61 100%);
  border-radius: 12px;
  color: white;
  margin-bottom: 20px;
}
.generate-info-title {
  font-size: 18px;
  font-weight: 600;
  margin-bottom: 4px;
}
.generate-info-desc {
  font-size: 13px;
  opacity: 0.9;
}
.generate-form {
  margin-bottom: 20px;
}
.generate-tips {
  background: #f5f7fa;
  padding: 12px 16px;
  border-radius: 8px;
  color: #606266;
}
.generate-tips p {
  margin: 6px 0;
  font-size: 13px;
}
.generate-result {
  margin-top: 16px;
}
.generated-robots-list {
  margin-top: 12px;
  max-height: 250px;
  overflow-y: auto;
  border: 1px solid #e4e7ed;
  border-radius: 8px;
}
.robot-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 12px;
  border-bottom: 1px solid #ebeef5;
}
.robot-item:last-child {
  border-bottom: none;
}
.robot-info {
  flex: 1;
  display: flex;
  flex-direction: column;
}
.robot-nickname {
  font-weight: 500;
  color: #303133;
}
.robot-id {
  font-size: 12px;
  color: #909399;
}
.robot-gold {
  font-size: 13px;
  color: #f59e0b;
  font-weight: 500;
}

/* 状态日志 */
.status-log-content {
  padding: 0 10px;
}

/* 修复 el-radio-button 选中状态文字颜色 */
:deep(.el-radio-button__original-radio:checked + .el-radio-button__inner) {
  color: #ffffff !important;
  background-color: #409eff !important;
  border-color: #409eff !important;
  box-shadow: -1px 0 0 0 #409eff !important;
}

/* 确保未选中状态文字也清晰 */
:deep(.el-radio-button__inner) {
  color: #606266 !important;
}

/* 头像预览弹窗 */
.avatar-preview-dialog :deep(.el-dialog) {
  background: transparent;
  box-shadow: none;
}
.avatar-preview-dialog :deep(.el-dialog__header) {
  display: none;
}
.avatar-preview-dialog :deep(.el-dialog__body) {
  padding: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
}
.avatar-preview-image {
  max-width: 80vw;
  max-height: 80vh;
  border-radius: 8px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
}
.avatar-preview-close {
  position: fixed;
  top: 20px;
  right: 20px;
  width: 40px;
  height: 40px;
  background: rgba(255, 255, 255, 0.9);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s;
  z-index: 9999;
}
.avatar-preview-close:hover {
  background: #fff;
  transform: scale(1.1);
}
</style>
