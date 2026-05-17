<template>
  <div class="qrcode-upload">
    <el-button type="info" @click="showDialog = true">
      <el-icon><Iphone /></el-icon>
      扫码上传
    </el-button>
    
    <el-dialog v-model="showDialog" title="扫码上传" width="400px">
      <div class="qrcode-content">
        <p class="tip">使用手机扫描下方二维码上传文件</p>
        <div class="qrcode-placeholder">
          <el-icon :size="64"><QrCode /></el-icon>
          <p>扫码上传功能暂未开放</p>
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { Iphone, QrCode } from '@element-plus/icons-vue'

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
.qrcode-upload {
  display: inline-block;
}

.qrcode-content {
  text-align: center;
  padding: 20px;
}

.tip {
  margin-bottom: 20px;
  color: #666;
}

.qrcode-placeholder {
  padding: 40px;
  background: #f5f5f5;
  border-radius: 8px;
  color: #999;
}
</style>
