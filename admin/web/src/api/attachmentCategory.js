import service from '@/utils/request'

// getCategoryList 获取附件分类列表
export const getCategoryList = () => {
  return service({
    url: '/attachmentCategory/getAttachmentCategoryList',
    method: 'get'
  })
}

// addCategory 添加附件分类
export const addCategory = (data) => {
  return service({
    url: '/attachmentCategory/addAttachmentCategory',
    method: 'post',
    data
  })
}

// deleteCategory 删除附件分类
export const deleteCategory = (data) => {
  return service({
    url: '/attachmentCategory/deleteAttachmentCategory',
    method: 'post',
    data
  })
}
