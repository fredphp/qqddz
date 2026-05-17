<template>
  <div class="cropper-upload">
    <el-upload
      :action="`${path}/fileUploadAndDownload/upload`"
      :show-file-list="false"
      :on-success="handleSuccess"
      :before-upload="beforeUpload"
      :data="{ classId: props.classId }"
      :headers="{ 'x-token': userStore.token }"
      accept="image/*"
    >
      <el-button type="warning">
        <el-icon><Crop /></el-icon>
        裁剪上传
      </el-button>
    </el-upload>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { ElMessage } from 'element-plus'
import { Crop } from '@element-plus/icons-vue'
import { useUserStore } from '@/pinia/modules/user'

const props = defineProps({
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
  if (!isImage) {
    ElMessage.error('只能上传图片文件!')
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
.cropper-upload {
  display: inline-block;
}
</style>
