<template>
  <el-upload
    class="avatar-uploader"
    :action="uploadUrl"
    :headers="headers"
    :show-file-list="false"
    :on-success="handleSuccess"
    :before-upload="beforeUpload"
    :accept="acceptTypes"
  >
    <el-button type="primary">
      <el-icon><Upload /></el-icon>
      上传图片
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
  imageUrl: {
    type: String,
    default: ''
  },
  fileSize: {
    type: Number,
    default: 2048
  },
  maxWH: {
    type: Number,
    default: 1920
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

const acceptTypes = 'image/jpeg,image/jpg,image/png,image/gif,image/webp'

const beforeUpload = (file) => {
  const isImage = acceptTypes.split(',').includes(file.type)
  const isLtSize = file.size / 1024 < props.fileSize

  if (!isImage) {
    ElMessage.error('只能上传 JPG/PNG/GIF/WEBP 格式的图片!')
    return false
  }
  if (!isLtSize) {
    ElMessage.error(`图片大小不能超过 ${props.fileSize}KB!`)
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
.avatar-uploader {
  display: inline-block;
}
</style>
