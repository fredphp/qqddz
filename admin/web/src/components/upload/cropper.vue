<template>
  <div class="cropper-upload">
    <el-button @click="showDialog = true" type="primary" plain>
      <el-icon><Crop /></el-icon>
      裁剪上传
    </el-button>
    <el-dialog v-model="showDialog" title="裁剪图片" width="600px" destroy-on-close>
      <div class="cropper-content">
        <el-upload
          :action="uploadUrl"
          :headers="headers"
          :show-file-list="false"
          :on-success="handleSuccess"
          :before-upload="beforeUpload"
          accept="image/*"
        >
          <el-button type="primary">选择图片</el-button>
        </el-upload>
        <p class="tip">请选择要裁剪的图片</p>
      </div>
      <template #footer>
        <el-button @click="showDialog = false">取消</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { ElMessage } from 'element-plus'
import { Crop } from '@element-plus/icons-vue'
import { useUserStore } from '@/pinia/modules/user'

const userStore = useUserStore()

const props = defineProps({
  classId: {
    type: Number,
    default: 0
  }
})

const emit = defineEmits(['on-success'])

const showDialog = ref(false)

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
    showDialog.value = false
    ElMessage.success('上传成功')
  } else {
    ElMessage.error(response.msg || '上传失败')
  }
}
</script>

<style scoped>
.cropper-content {
  text-align: center;
  padding: 20px;
}
.tip {
  margin-top: 16px;
  color: #909399;
  font-size: 14px;
}
</style>
