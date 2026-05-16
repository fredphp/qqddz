<template>
  <div class="scan-upload-container">
    <div class="scan-upload-card">
      <div class="header">
        <h2>扫码上传</h2>
        <p class="subtitle">请扫描二维码上传文件</p>
      </div>

      <div class="qrcode-section">
        <div v-if="loading" class="loading-placeholder">
          <el-icon class="is-loading" :size="60"><Loading /></el-icon>
          <p>加载中...</p>
        </div>
        <div v-else-if="qrcodeUrl" class="qrcode-image">
          <img :src="qrcodeUrl" alt="扫码上传二维码" />
          <p class="expire-tip" v-if="expireTime > 0">
            二维码有效期: {{ formatCountdown(expireTime) }}
          </p>
        </div>
        <div v-else class="qrcode-placeholder">
          <el-icon :size="80"><Iphone /></el-icon>
          <p>二维码生成失败</p>
          <el-button type="primary" @click="generateQRCode">重新生成</el-button>
        </div>
      </div>

      <div class="upload-info" v-if="uploadStatus">
        <el-alert
          :title="uploadStatus.title"
          :type="uploadStatus.type"
          :description="uploadStatus.description"
          show-icon
          :closable="false"
        />
      </div>

      <div class="tips-section">
        <el-divider content-position="left">使用说明</el-divider>
        <ul class="tips-list">
          <li>使用手机扫描上方二维码</li>
          <li>在手机端选择要上传的文件</li>
          <li>上传完成后此页面将自动显示结果</li>
          <li>二维码有效期为5分钟，过期请刷新</li>
        </ul>
      </div>

      <div class="action-buttons">
        <el-button @click="generateQRCode" :loading="loading">
          <el-icon><Refresh /></el-icon>
          刷新二维码
        </el-button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { Iphone, Loading, Refresh } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'

defineOptions({
  name: 'ScanUpload'
})

const loading = ref(false)
const qrcodeUrl = ref('')
const expireTime = ref(0)
const uploadStatus = ref(null)
let countdownTimer = null

// 格式化倒计时
const formatCountdown = (seconds) => {
  const mins = Math.floor(seconds / 60)
  const secs = seconds % 60
  return `${mins}:${secs.toString().padStart(2, '0')}`
}

// 生成二维码 (示例实现)
const generateQRCode = async () => {
  loading.value = true
  uploadStatus.value = null

  try {
    // 模拟生成二维码的过程
    // 实际项目中应该调用后端API生成二维码
    await new Promise(resolve => setTimeout(resolve, 1000))

    // 这里使用一个占位图片，实际项目中应该使用后端返回的二维码图片
    // 或者使用 qrcode 库在前端生成
    qrcodeUrl.value = 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyMDAiIGhlaWdodD0iMjAwIiB2aWV3Qm94PSIwIDAgMjAwIDIwMCI+PHJlY3Qgd2lkdGg9IjIwMCIgaGVpZ2h0PSIyMDAiIGZpbGw9IiNmZmYiLz48dGV4dCB4PSIxMDAiIHk9IjEwMCIgZm9udC1zaXplPSIxNCIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iIGZpbGw9IiM2NjYiPuexu+WFpeS4u+WwieWQjeensDwvdGV4dD48L3N2Zz4='

    // 设置5分钟有效期
    expireTime.value = 300

    // 开始倒计时
    startCountdown()

    ElMessage.success('二维码已生成')
  } catch (error) {
    console.error('生成二维码失败:', error)
    qrcodeUrl.value = ''
    ElMessage.error('生成二维码失败，请重试')
  } finally {
    loading.value = false
  }
}

// 开始倒计时
const startCountdown = () => {
  if (countdownTimer) {
    clearInterval(countdownTimer)
  }

  countdownTimer = setInterval(() => {
    if (expireTime.value > 0) {
      expireTime.value--
    } else {
      clearInterval(countdownTimer)
      ElMessage.warning('二维码已过期，请刷新')
    }
  }, 1000)
}

onMounted(() => {
  generateQRCode()
})

onUnmounted(() => {
  if (countdownTimer) {
    clearInterval(countdownTimer)
  }
})
</script>

<style lang="scss" scoped>
.scan-upload-container {
  min-height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 20px;
}

.scan-upload-card {
  background: #fff;
  border-radius: 16px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.1);
  padding: 40px;
  max-width: 400px;
  width: 100%;
}

.header {
  text-align: center;
  margin-bottom: 30px;

  h2 {
    margin: 0 0 8px;
    font-size: 24px;
    color: #303133;
  }

  .subtitle {
    margin: 0;
    color: #909399;
    font-size: 14px;
  }
}

.qrcode-section {
  display: flex;
  justify-content: center;
  margin-bottom: 20px;
}

.loading-placeholder,
.qrcode-placeholder {
  width: 200px;
  height: 200px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  background: #f5f7fa;
  border-radius: 8px;
  color: #909399;

  p {
    margin: 10px 0 0;
  }
}

.qrcode-image {
  text-align: center;

  img {
    width: 200px;
    height: 200px;
    border-radius: 8px;
    border: 1px solid #ebeef5;
  }

  .expire-tip {
    margin: 10px 0 0;
    font-size: 12px;
    color: #e6a23c;
  }
}

.upload-info {
  margin-bottom: 20px;
}

.tips-section {
  margin-bottom: 20px;

  .tips-list {
    padding-left: 20px;
    margin: 0;
    color: #606266;
    font-size: 13px;
    line-height: 2;
  }
}

.action-buttons {
  display: flex;
  justify-content: center;
}
</style>
