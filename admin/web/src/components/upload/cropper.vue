<template>
  <el-button type="primary" :icon="Crop" @click="showDrawer = true">裁剪上传</el-button>
  
  <el-drawer v-model="showDrawer" title="裁剪上传" :size="500">
    <div class="p-4">
      <el-upload
        :action="`${baseUrl}/fileUploadAndDownload/upload`"
        :headers="headers"
        :data="uploadData"
        :show-file-list="false"
        :on-success="handleSuccess"
        accept="image/*"
      >
        <el-button type="primary">选择图片</el-button>
      </el-upload>
      <p class="mt-4 text-gray-500 text-sm">选择图片后直接上传（简化版）</p>
    </div>
  </el-drawer>
</template>

<script setup>
import { ref, computed } from 'vue'
import { ElMessage } from 'element-plus'
import { Crop } from '@element-plus/icons-vue'
import { useUserStore } from '@/pinia'
import { getBaseUrl } from '@/utils/format'

defineOptions({
  name: 'CropperImage'
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
const showDrawer = ref(false)

const headers = computed(() => ({
  'x-token': userStore.token
}))

const uploadData = computed(() => ({
  classId: props.classId
}))

const handleSuccess = (response) => {
  if (response.code === 0) {
    ElMessage.success('上传成功')
    showDrawer.value = false
    emits('on-success', response)
  } else {
    ElMessage.error(response.msg || '上传失败')
  }
}
</script>
