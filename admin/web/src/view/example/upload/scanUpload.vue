<template>
  <div class="scan-upload-container">
    <div class="upload-header">
      <h2>扫码上传</h2>
      <p>请选择要上传的文件</p>
    </div>
    
    <div class="upload-area">
      <el-upload
        class="upload-dragger"
        drag
        action="/api/fileUploadAndDownload/upload"
        :headers="headers"
        :on-success="handleSuccess"
        :on-error="handleError"
        :before-upload="beforeUpload"
        :show-file-list="true"
      >
        <el-icon class="el-icon--upload"><upload-filled /></el-icon>
        <div class="el-upload__text">
          将文件拖到此处，或<em>点击上传</em>
        </div>
        <template #tip>
          <div class="el-upload__tip">
            支持上传图片、文档等文件
          </div>
        </template>
      </el-upload>
    </div>

    <div class="file-list" v-if="fileList.length > 0">
      <h3>已上传文件</h3>
      <el-table :data="fileList" style="width: 100%">
        <el-table-column prop="name" label="文件名" />
        <el-table-column prop="url" label="链接">
          <template #default="scope">
            <a :href="scope.row.url" target="_blank">{{ scope.row.url }}</a>
          </template>
        </el-table-column>
        <el-table-column prop="tag" label="类型" width="100" />
      </el-table>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { UploadFilled } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import { useUserStore } from '@/pinia/modules/user'

const userStore = useUserStore()

const headers = computed(() => {
  return {
    'x-token': userStore.token
  }
})

const fileList = ref([])

const beforeUpload = (file) => {
  const isLt10M = file.size / 1024 / 1024 < 10
  if (!isLt10M) {
    ElMessage.error('文件大小不能超过 10MB!')
    return false
  }
  return true
}

const handleSuccess = (response) => {
  if (response.code === 0) {
    ElMessage.success('上传成功')
    fileList.value.push({
      name: response.data.name,
      url: response.data.url,
      tag: response.data.tag
    })
  } else {
    ElMessage.error(response.msg || '上传失败')
  }
}

const handleError = () => {
  ElMessage.error('上传失败，请重试')
}
</script>

<style scoped>
.scan-upload-container {
  padding: 20px;
  max-width: 800px;
  margin: 0 auto;
}

.upload-header {
  text-align: center;
  margin-bottom: 30px;
}

.upload-header h2 {
  margin-bottom: 10px;
  color: #303133;
}

.upload-header p {
  color: #909399;
}

.upload-area {
  margin-bottom: 30px;
}

.upload-dragger {
  width: 100%;
}

.file-list h3 {
  margin-bottom: 15px;
  color: #303133;
}
</style>
