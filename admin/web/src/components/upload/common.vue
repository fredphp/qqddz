<template>
  <el-upload
    class="upload-common"
    :action="uploadUrl"
    :headers="headers"
    :show-file-list="false"
    :on-success="handleSuccess"
    :before-upload="beforeUpload"
  >
    <el-button type="primary">
      <el-icon><Upload /></el-icon>
      上传文件
    </el-button>
  </el-upload>
</template>

<script setup>
import { computed } from 'vue'
import { ElMessage } from 'element-plus'
import { Upload } from '@element-plus/icons-vue'
import { useUserStore } from '@/pinia/modules/user'

const userStore = useUserStore()

const props = defineProps({
  imageCommon: {
    type: String,
    default: ''
  },
  classId: {
    type: Number,
    default: 0
  }
})

const emit = defineEmits(['on-success'])

const uploadUrl = computed(() => {
  const baseUrl = import.meta.env.VITE_BASE_API || ''
  return `${baseUrl}/fileUploadAndDownload/upload`
})

const headers = computed(() => {
  return {
    'x-token': userStore.token || ''
  }
})

const beforeUpload = (file) => {
  const isLtSize = file.size / 1024 / 1024 < 10
  if (!isLtSize) {
    ElMessage.error('文件大小不能超过 10MB!')
    return false
  }
  return true
}

const handleSuccess = (response) => {
  if (response.code === 0) {
    emit('on-success', response.data)
    ElMessage.success('上传成功')
  } else {
    ElMessage.error(response.msg || '上传失败')
  }
}
</script>

<style scoped>
.upload-common {
  display: inline-block;
}
</style>
