import service from '@/utils/request'

// getFileList 获取文件列表
export const getFileList = (data) => {
  return service({
    url: '/fileUploadAndDownload/getFileList',
    method: 'post',
    data
  })
}

// editFileName 编辑文件名
export const editFileName = (data) => {
  return service({
    url: '/fileUploadAndDownload/editFileName',
    method: 'post',
    data
  })
}

// deleteFile 删除文件
export const deleteFile = (data) => {
  return service({
    url: '/fileUploadAndDownload/deleteFile',
    method: 'post',
    data
  })
}

// uploadFile 上传文件
export const uploadFile = (data) => {
  return service({
    url: '/fileUploadAndDownload/upload',
    method: 'post',
    data
  })
}
