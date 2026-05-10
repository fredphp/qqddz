<template>
  <el-upload
    :action="path"
    :headers="headers"
    :show-file-list="false"
    :on-success="handleSuccess"
    :before-upload="beforeUpload"
    :data="uploadData"
    class="qrcode-upload"
  >
    <el-button type="primary" :icon="Camera">二维码上传</el-button>
  </el-upload>
</template>

<script setup>
import { ref, computed } from 'vue'
import { ElMessage } from 'element-plus'
import { Camera } from '@element-plus/icons-vue'
import { useUserStore } from '@/pinia/modules/user'

const props = defineProps({
  classId: {
    type: Number,
    default: 0
  }
})

const emit = defineEmits(['on-success'])

const userStore = useUserStore()
const path = ref(import.meta.env.VITE_BASE_API + '/fileUploadAndDownload/upload')
const headers = computed(() => {
  return {
    'x-token': userStore.token,
    'x-user-id': userStore.userInfo.ID
  }
})

const uploadData = computed(() => ({
  classId: props.classId
}))

const beforeUpload = (file) => {
  const isImage = file.type.startsWith('image/')
  const isLt2M = file.size / 1024 / 1024 < 2

  if (!isImage) {
    ElMessage.error('只能上传图片文件!')
    return false
  }
  if (!isLt2M) {
    ElMessage.error('图片大小不能超过 2MB!')
    return false
  }
  return true
}

const handleSuccess = (res) => {
  if (res.code === 0) {
    emit('on-success', res.data)
    ElMessage.success('上传成功')
  } else {
    ElMessage.error(res.msg || '上传失败')
  }
}
</script>

<style scoped>
.qrcode-upload {
  display: inline-block;
}
</style>
