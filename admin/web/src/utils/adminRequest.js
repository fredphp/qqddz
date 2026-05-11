import axios from 'axios'
import { useUserStore } from '@/pinia/modules/user'
import { ElLoading, ElMessage } from 'element-plus'
import { emitter } from '@/utils/bus'
import router from '@/router/index'

const DEFAULT_REQUEST_TIMEOUT = 1000 * 60 * 10

// Admin 后端专用的 axios 实例，直接请求 Admin 后端（不走游戏服务端）
// 直接使用虚拟域名 admin.qqddz.local
const adminService = axios.create({
  baseURL: 'http://admin.qqddz.local'
})

let activeAxios = 0
let loadingInstance = null
let isLoadingVisible = false

const showLoading = () => {
  activeAxios++
  if (activeAxios > 0 && !isLoadingVisible) {
    loadingInstance = ElLoading.service({
      target: document.getElementById('gva-base-load-dom')
    })
    isLoadingVisible = true
  }
}

const closeLoading = () => {
  activeAxios--
  if (activeAxios <= 0) {
    activeAxios = 0
    if (loadingInstance) {
      loadingInstance.close()
      loadingInstance = null
    }
    isLoadingVisible = false
  }
}

adminService.interceptors.request.use(
  (config) => {
    if (typeof config.timeout === 'undefined') {
      config.timeout = DEFAULT_REQUEST_TIMEOUT
    }

    if (!config.donNotShowLoading) {
      showLoading()
    }

    const userStore = useUserStore()
    config.headers = {
      'Content-Type': 'application/json',
      'x-token': userStore.token,
      'x-user-id': userStore.userInfo?.ID,
      ...config.headers
    }

    return config
  },
  (error) => {
    closeLoading()
    return Promise.reject(error)
  }
)

adminService.interceptors.response.use(
  (response) => {
    closeLoading()

    if (typeof response.data.code === 'undefined') {
      return response
    }

    if (response.data.code === 0) {
      return response.data
    }

    ElMessage({
      showClose: true,
      message: response.data.msg || '请求失败',
      type: 'error'
    })

    return response.data
  },
  (error) => {
    closeLoading()

    if (error.response?.status === 401) {
      const userStore = useUserStore()
      userStore.ClearStorage()
      router.push({ name: 'Login', replace: true })
    }

    return Promise.reject(error)
  }
)

export default adminService
