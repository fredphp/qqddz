<template>
  <div class="qrcode-upload">
    <el-button @click="showDialog = true" type="primary" plain>
      <el-icon><Iphone /></el-icon>
      扫码上传
    </el-button>
    <el-dialog v-model="showDialog" title="扫码上传" width="400px" destroy-on-close>
      <div class="qrcode-content">
        <p class="tip">使用手机扫描二维码上传文件</p>
        <div class="qrcode-placeholder">
          <el-icon :size="80"><Iphone /></el-icon>
          <p>二维码功能暂未开放</p>
        </div>
      </div>
      <template #footer>
        <el-button @click="showDialog = false">关闭</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { Iphone } from '@element-plus/icons-vue'

const props = defineProps({
  classId: {
    type: Number,
    default: 0
  }
})

const emit = defineEmits(['on-success'])

const showDialog = ref(false)
</script>

<style scoped>
.qrcode-content {
  text-align: center;
  padding: 20px;
}
.tip {
  color: #606266;
  margin-bottom: 20px;
}
.qrcode-placeholder {
  padding: 40px;
  background: #f5f7fa;
  border-radius: 8px;
  color: #909399;
}
</style>
