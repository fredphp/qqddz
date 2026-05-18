<template>
  <el-upload
    :action="`${baseUrl}/fileUploadAndDownload/upload?noSave=${noSave ? 1 : 0}&classId=${classId}`"
    :headers="headers"
    :show-file-list="false"
    :on-success="handleSuccess"
    :on-error="handleError"
    :before-upload="beforeUpload"
    accept="image/*"
  >
    <el-button type="primary" :icon="Upload">上传图片</el-button>
  </el-upload>
</template>

<script setup>
import { computed } from 'vue'
import { ElMessage } from 'element-plus'
import { Upload } from '@element-plus/icons-vue'
import { useUserStore } from '@/pinia'
import { getBaseUrl } from '@/utils/format'

defineOptions({
  name: 'UploadImage'
})

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
  },
  noSave: {
    type: Boolean,
    default: true
  }
})

const emits = defineEmits(['on-success'])

const userStore = useUserStore()
const baseUrl = getBaseUrl()

const headers = computed(() => ({
  'x-token': userStore.token
}))

const beforeUpload = (file) => {
  const isImage = file.type.startsWith('image/')
  const isLtSize = file.size / 1024 / 1024 < props.fileSize / 1024

  if (!isImage) {
    ElMessage.error('只能上传图片文件!')
    return false
  }
  if (!isLtSize) {
    ElMessage.error(`图片大小不能超过 ${Math.floor(props.fileSize / 1024)}MB!`)
    return false
  }
  return true
}

const handleSuccess = (response) => {
  if (response.code === 0) {
    ElMessage.success('上传成功')
    emits('on-success', response)
  } else {
    ElMessage.error(response.msg || '上传失败')
  }
}

const handleError = () => {
  ElMessage.error('上传失败')
}
</script>
