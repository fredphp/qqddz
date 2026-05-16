<template>
  <el-upload
    :action="`${baseUrl}/fileUploadAndDownload/upload`"
    :headers="headers"
    :data="uploadData"
    :show-file-list="false"
    :on-success="handleSuccess"
    :on-error="handleError"
  >
    <el-button type="primary" :icon="Upload">上传文件</el-button>
  </el-upload>
</template>

<script setup>
import { computed } from 'vue'
import { ElMessage } from 'element-plus'
import { Upload } from '@element-plus/icons-vue'
import { useUserStore } from '@/pinia'
import { getBaseUrl } from '@/utils/format'

defineOptions({
  name: 'UploadCommon'
})

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

const emits = defineEmits(['on-success'])

const userStore = useUserStore()
const baseUrl = getBaseUrl()

const headers = computed(() => ({
  'x-token': userStore.token
}))

const uploadData = computed(() => ({
  classId: props.classId
}))

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
