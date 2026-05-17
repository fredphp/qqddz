<template>
  <el-upload
    :action="`${path}/fileUploadAndDownload/upload`"
    :show-file-list="false"
    :on-success="handleSuccess"
    :before-upload="beforeUpload"
    :data="{ classId: props.classId }"
    :headers="{ 'x-token': userStore.token }"
  >
    <el-button type="primary">
      <el-icon><Upload /></el-icon>
      上传文件
    </el-button>
  </el-upload>
</template>

<script setup>
import { ref } from 'vue'
import { ElMessage } from 'element-plus'
import { Upload } from '@element-plus/icons-vue'
import { useUserStore } from '@/pinia/modules/user'

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
const userStore = useUserStore()
const path = ref(import.meta.env.VITE_BASE_API || '')

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
    emit('on-success', response.data)
    ElMessage.success('上传成功')
  } else {
    ElMessage.error(response.msg || '上传失败')
  }
}
</script>
