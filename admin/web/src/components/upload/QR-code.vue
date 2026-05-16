<template>
  <el-button type="primary" :icon="Camera" @click="showDialog = true">扫码上传</el-button>
  
  <el-dialog v-model="showDialog" title="扫码上传" width="400">
    <div class="text-center p-4">
      <p class="text-gray-500 mb-4">此功能需要后端支持，当前为简化版本</p>
      <el-upload
        :action="`${baseUrl}/fileUploadAndDownload/upload`"
        :headers="headers"
        :data="uploadData"
        :show-file-list="false"
        :on-success="handleSuccess"
        accept="image/*"
      >
        <el-button type="primary">选择图片上传</el-button>
      </el-upload>
    </div>
  </el-dialog>
</template>

<script setup>
import { ref, computed } from 'vue'
import { ElMessage } from 'element-plus'
import { Camera } from '@element-plus/icons-vue'
import { useUserStore } from '@/pinia'
import { getBaseUrl } from '@/utils/format'

defineOptions({
  name: 'QRCodeUpload'
})

defineProps({
  classId: {
    type: Number,
    default: 0
  }
})

const props = defineProps({
  classId: {
    type: Number,
    default: 0
  }
})

const emits = defineEmits(['on-success'])

const userStore = useUserStore()
const baseUrl = getBaseUrl()
const showDialog = ref(false)

const headers = computed(() => ({
  'x-token': userStore.token
}))

const uploadData = computed(() => ({
  classId: props.classId
}))

const handleSuccess = (response) => {
  if (response.code === 0) {
    ElMessage.success('上传成功')
    showDialog.value = false
    emits('on-success', response)
  } else {
    ElMessage.error(response.msg || '上传失败')
  }
}
</script>
