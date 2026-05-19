<template>
  <div class="scan-upload">
    <div class="gva-table-box">
      <el-divider content-position="left">扫码上传</el-divider>
      
      <div class="upload-container">
        <el-card class="upload-card">
          <template #header>
            <div class="card-header">
              <span>二维码扫码上传</span>
            </div>
          </template>
          
          <div class="qrcode-area">
            <div v-if="!qrcodeUrl" class="qrcode-placeholder">
              <el-button type="primary" @click="generateQrcode">生成二维码</el-button>
            </div>
            <div v-else class="qrcode-display">
              <img :src="qrcodeUrl" alt="扫码上传二维码" class="qrcode-image" />
              <p class="qrcode-tip">请使用手机扫描二维码上传文件</p>
            </div>
          </div>
          
          <div class="upload-info">
            <el-descriptions :column="1" border>
              <el-descriptions-item label="上传状态">
                <el-tag :type="uploadStatus === 'waiting' ? 'info' : uploadStatus === 'uploading' ? 'warning' : 'success'">
                  {{ uploadStatusText }}
                </el-tag>
              </el-descriptions-item>
              <el-descriptions-item label="已上传文件">
                {{ uploadedFiles.length }} 个
              </el-descriptions-item>
            </el-descriptions>
          </div>
          
          <div v-if="uploadedFiles.length > 0" class="file-list">
            <el-divider content-position="left">已上传文件</el-divider>
            <el-table :data="uploadedFiles" style="width: 100%">
              <el-table-column prop="name" label="文件名" />
              <el-table-column prop="size" label="大小" width="120">
                <template #default="scope">
                  {{ formatFileSize(scope.row.size) }}
                </template>
              </el-table-column>
              <el-table-column prop="uploadTime" label="上传时间" width="180" />
            </el-table>
          </div>
        </el-card>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { ElMessage } from 'element-plus'

defineOptions({
  name: 'ScanUpload'
})

const qrcodeUrl = ref('')
const uploadStatus = ref('waiting') // waiting, uploading, completed
const uploadedFiles = ref([])

const uploadStatusText = computed(() => {
  const statusMap = {
    waiting: '等待扫码',
    uploading: '上传中',
    completed: '上传完成'
  }
  return statusMap[uploadStatus.value]
})

const generateQrcode = () => {
  // 模拟生成二维码
  // 实际项目中应该调用后端API生成二维码
  qrcodeUrl.value = 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyMDAiIGhlaWdodD0iMjAwIiB2aWV3Qm94PSIwIDAgMjAwIDIwMCI+PHJlY3Qgd2lkdGg9IjIwMCIgaGVpZ2h0PSIyMDAiIGZpbGw9IiNmZmYiLz48dGV4dCB4PSIxMDAiIHk9IjEwMCIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iIGZvbnQtc2l6ZT0iMTYiIGZpbGw9IiM2NjYiPuaxvei9puezu+m7mjwvdGV4dD48L3N2Zz4='
  ElMessage.success('二维码已生成，请扫描上传')
}

const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}
</script>

<style lang="scss" scoped>
.scan-upload {
  padding: 20px;
}

.gva-table-box {
  display: block;
}

.upload-container {
  display: flex;
  justify-content: center;
  padding: 20px;
}

.upload-card {
  width: 100%;
  max-width: 600px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.qrcode-area {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 200px;
  margin-bottom: 20px;
}

.qrcode-placeholder {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 200px;
  height: 200px;
  border: 2px dashed #dcdfe6;
  border-radius: 8px;
}

.qrcode-display {
  text-align: center;
}

.qrcode-image {
  width: 200px;
  height: 200px;
  border: 1px solid #ebeef5;
  border-radius: 8px;
}

.qrcode-tip {
  margin-top: 10px;
  color: #909399;
  font-size: 14px;
}

.upload-info {
  margin-top: 20px;
}

.file-list {
  margin-top: 20px;
}

.el-divider {
  margin: 20px 0;
}
</style>
