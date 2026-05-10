<template>
  <el-upload
    :action="path"
    :headers="headers"
    :show-file-list="false"
    :on-success="handleSuccess"
    :before-upload="beforeUpload"
    :data="uploadData"
    class="common-upload"
  >
    <el-button type="primary" :icon="Upload">普通上传</el-button>
  </el-upload>
</template>

<script setup>
import { ref, computed } from 'vue'
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
  const isLt10M = file.size / 1024 / 1024 < 10
  if (!isLt10M) {
    ElMessage.error('文件大小不能超过 10MB!')
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
.common-upload {
  display: inline-block;
}
</style>
