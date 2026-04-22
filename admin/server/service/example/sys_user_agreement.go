package example

import (
	"errors"
	"github.com/flipped-aurora/gin-vue-admin/server/global"
	"github.com/flipped-aurora/gin-vue-admin/server/model/example"
	exampleReq "github.com/flipped-aurora/gin-vue-admin/server/model/example/request"
	"gorm.io/gorm"
)

type SysUserAgreementService struct{}

// CreateSysUserAgreement 创建用户协议记录
// Author [piexlmax](https://github.com/piexlmax)
func (sysUserAgreementService *SysUserAgreementService) CreateSysUserAgreement(sysUserAgreement *example.SysUserAgreement) (err error) {
	err = global.GVA_DB.Create(sysUserAgreement).Error
	return err
}

// DeleteSysUserAgreement 删除用户协议记录
// Author [piexlmax](https://github.com/piexlmax)
func (sysUserAgreementService *SysUserAgreementService) DeleteSysUserAgreement(ID string) (err error) {
	err = global.GVA_DB.Delete(&example.SysUserAgreement{}, "id = ?", ID).Error
	return err
}

// DeleteSysUserAgreementByIds 批量删除用户协议记录
// Author [piexlmax](https://github.com/piexlmax)
func (sysUserAgreementService *SysUserAgreementService) DeleteSysUserAgreementByIds(IDs []string) (err error) {
	err = global.GVA_DB.Delete(&[]example.SysUserAgreement{}, "id in ?", IDs).Error
	return err
}

// UpdateSysUserAgreement 更新用户协议记录
// Author [piexlmax](https://github.com/piexlmax)
func (sysUserAgreementService *SysUserAgreementService) UpdateSysUserAgreement(sysUserAgreement example.SysUserAgreement) (err error) {
	err = global.GVA_DB.Model(&example.SysUserAgreement{}).Where("id = ?", sysUserAgreement.ID).Updates(&sysUserAgreement).Error
	return err
}

// GetSysUserAgreement 根据ID获取用户协议记录
// Author [piexlmax](https://github.com/piexlmax)
func (sysUserAgreementService *SysUserAgreementService) GetSysUserAgreement(ID string) (sysUserAgreement example.SysUserAgreement, err error) {
	err = global.GVA_DB.Where("id = ?", ID).First(&sysUserAgreement).Error
	return
}

// GetSysUserAgreementInfoList 分页获取用户协议记录列表
// Author [piexlmax](https://github.com/piexlmax)
func (sysUserAgreementService *SysUserAgreementService) GetSysUserAgreementInfoList(info exampleReq.SysUserAgreementSearch) (list []example.SysUserAgreement, total int64, err error) {
	limit := info.PageSize
	offset := info.PageSize * (info.Page - 1)
	// 创建db
	db := global.GVA_DB.Model(&example.SysUserAgreement{})
	var sysUserAgreements []example.SysUserAgreement
	// 如果有条件搜索 下方会自动创建搜索语句
	if info.StartCreatedAt != nil && info.EndCreatedAt != nil {
		db = db.Where("created_at BETWEEN ? AND ?", info.StartCreatedAt, info.EndCreatedAt)
	}
	if info.Title != "" {
		db = db.Where("title LIKE ?", "%"+info.Title+"%")
	}
	if info.Version != "" {
		db = db.Where("version LIKE ?", "%"+info.Version+"%")
	}
	if info.Status != nil {
		db = db.Where("status = ?", *info.Status)
	}
	err = db.Count(&total).Error
	if err != nil {
		return
	}

	if limit != 0 {
		db = db.Limit(limit).Offset(offset)
	}

	err = db.Order("sort asc, created_at desc").Find(&sysUserAgreements).Error
	return sysUserAgreements, total, err
}

// GetLatestUserAgreement 获取最新的启用的用户协议
// Author [piexlmax](https://github.com/piexlmax)
func (sysUserAgreementService *SysUserAgreementService) GetLatestUserAgreement() (sysUserAgreement example.SysUserAgreement, err error) {
	err = global.GVA_DB.Where("status = ?", 1).Order("sort asc, created_at desc").First(&sysUserAgreement).Error
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return example.SysUserAgreement{}, nil
		}
		return
	}
	return
}
