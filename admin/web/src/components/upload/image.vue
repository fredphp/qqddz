<template>
  <el-upload
    :action="`${path}/fileUploadAndDownload/upload`"
    :show-file-list="false"
    :on-success="handleSuccess"
    :before-upload="beforeUpload"
    :data="{ classId: props.classId }"
    :headers="{ 'x-token': userStore.token }"
    accept="image/*"
  >
    <el-button type="primary">
      <el-icon><Upload /></el-icon>
      上传图片
    </el-button>
  </el-upload>
</template>

<script setup>
import { ref } from 'vue'
import { ElMessage } from 'element-plus'
import { Upload } from '@element-plus/icons-vue'
import { useUserStore } from '@/pinia/modules/user'

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
const userStore = useUserStore()
const path = ref(import.meta.env.VITE_BASE_API || '')

const beforeUpload = (file) => {
  const isImage = file.type.startsWith('image/')
  const isLt2M = file.size / 1024 / 1024 < (props.fileSize / 1024)

  if (!isImage) {
    ElMessage.error('只能上传图片文件!')
    return false
  }
  if (!isLt2M) {
    ElMessage.error(`图片大小不能超过 ${Math.round(props.fileSize / 1024)}MB!`)
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
