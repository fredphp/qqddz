package ddz

import (
        "errors"
        "time"

        "github.com/flipped-aurora/gin-vue-admin/server/global"
        "github.com/flipped-aurora/gin-vue-admin/server/model/ddz"
        ddzReq "github.com/flipped-aurora/gin-vue-admin/server/model/ddz/request"
        ddzRes "github.com/flipped-aurora/gin-vue-admin/server/model/ddz/response"
        "go.uber.org/zap"
)

type DDZUserAccountService struct{}

var DDZUserAccountServiceApp = new(DDZUserAccountService)

// CreateUserAccount 创建用户账户
func (s *DDZUserAccountService) CreateUserAccount(req ddzReq.DDZUserAccountCreate) (ddzRes.DDZUserAccountResponse, error) {
        db := GetDDZDB()
        // 检查PlayerID是否已存在
        var count int64
        db.Model(&ddz.DDZUserAccount{}).Where("player_id = ?", req.PlayerID).Count(&count)
        if count > 0 {
                return ddzRes.DDZUserAccountResponse{}, errors.New("该玩家已有账户")
        }

        // 检查手机号是否已被使用
        if req.Phone != "" {
                db.Model(&ddz.DDZUserAccount{}).Where("phone = ?", req.Phone).Count(&count)
                if count > 0 {
                        return ddzRes.DDZUserAccountResponse{}, errors.New("手机号已被使用")
                }
        }

        // 创建账户
        account := ddz.DDZUserAccount{
                PlayerID:   req.PlayerID,
                Phone:      req.Phone,
                WxOpenID:   req.WxOpenID,
                WxUnionID:  req.WxUnionID,
                WxNickname: req.WxNickname,
                WxAvatar:   req.WxAvatar,
                LoginType:  req.LoginType,
                DeviceID:   req.DeviceID,
                DeviceType: req.DeviceType,
                Status:     1,
        }

        if account.LoginType == 0 {
                account.LoginType = 1 // 默认手机号登录
        }

        err := db.Create(&account).Error
        if err != nil {
                return ddzRes.DDZUserAccountResponse{}, err
        }

        return s.toUserAccountResponse(account), nil
}

// DeleteUserAccount 删除用户账户
func (s *DDZUserAccountService) DeleteUserAccount(id uint) error {
        db := GetDDZDB()
        var account ddz.DDZUserAccount
        err := db.First(&account, id).Error
        if err != nil {
                return errors.New("账户不存在")
        }

        return db.Delete(&account).Error
}

// GetUserAccountList 获取用户账户列表
func (s *DDZUserAccountService) GetUserAccountList(req ddzReq.DDZUserAccountSearch) (list interface{}, total int64, err error) {
        db := GetDDZDB()
        limit := req.PageSize
        offset := req.PageSize * (req.Page - 1)
        query := db.Model(&ddz.DDZUserAccount{})

        if req.Phone != "" {
                query = query.Where("phone LIKE ?", "%"+req.Phone+"%")
        }
        if req.PlayerID != "" {
                query = query.Where("player_id = ?", req.PlayerID)
        }
        if req.LoginType != nil {
                query = query.Where("login_type = ?", *req.LoginType)
        }
        if req.Status != nil {
                query = query.Where("status = ?", *req.Status)
        }
        if req.WxNickname != "" {
                query = query.Where("wx_nickname LIKE ?", "%"+req.WxNickname+"%")
        }

        err = query.Count(&total).Error
        if err != nil {
                return nil, 0, err
        }

        var accounts []ddz.DDZUserAccount
        err = query.Limit(limit).Offset(offset).Order("id desc").Find(&accounts).Error
        if err != nil {
                return nil, 0, err
        }

        // 转换为响应格式并关联玩家信息
        accountList := make([]ddzRes.DDZUserAccountResponse, 0, len(accounts))
        for _, a := range accounts {
                resp := s.toUserAccountResponse(a)
                // 获取关联玩家信息
                var player ddz.DDZPlayer
                if err := db.Where("player_id = ?", a.PlayerID).First(&player).Error; err == nil {
                        resp.PlayerNickname = player.Nickname
                        resp.PlayerAvatar = player.Avatar
                        resp.PlayerLevel = player.Level
                        resp.PlayerVipLevel = player.VipLevel
                        resp.PlayerCoins = player.Coins
                }
                accountList = append(accountList, resp)
        }

        return accountList, total, nil
}

// GetUserAccountByID 根据ID获取用户账户
func (s *DDZUserAccountService) GetUserAccountByID(id uint) (ddzRes.DDZUserAccountResponse, error) {
        db := GetDDZDB()
        var account ddz.DDZUserAccount
        err := db.First(&account, id).Error
        if err != nil {
                return ddzRes.DDZUserAccountResponse{}, err
        }

        resp := s.toUserAccountResponse(account)
        // 获取关联玩家信息
        var player ddz.DDZPlayer
        if err := db.Where("player_id = ?", account.PlayerID).First(&player).Error; err == nil {
                resp.PlayerNickname = player.Nickname
                resp.PlayerAvatar = player.Avatar
                resp.PlayerLevel = player.Level
                resp.PlayerVipLevel = player.VipLevel
                resp.PlayerCoins = player.Coins
        }

        return resp, nil
}

// UpdateUserAccount 更新用户账户
func (s *DDZUserAccountService) UpdateUserAccount(req ddzReq.DDZUserAccountUpdate) error {
        db := GetDDZDB()
        var account ddz.DDZUserAccount
        err := db.First(&account, req.ID).Error
        if err != nil {
                return errors.New("账户不存在")
        }

        updates := map[string]interface{}{
                "updated_at": time.Now(),
        }

        if req.Phone != "" {
                // 检查手机号是否已被其他账户使用
                var count int64
                db.Model(&ddz.DDZUserAccount{}).Where("phone = ? AND id != ?", req.Phone, req.ID).Count(&count)
                if count > 0 {
                        return errors.New("手机号已被其他账户使用")
                }
                updates["phone"] = req.Phone
        }
        if req.WxNickname != "" {
                updates["wx_nickname"] = req.WxNickname
        }
        if req.WxAvatar != "" {
                updates["wx_avatar"] = req.WxAvatar
        }
        if req.Status != nil {
                updates["status"] = *req.Status
        }

        return db.Model(&account).Updates(updates).Error
}

// UpdateUserAccountStatus 更新账户状态
func (s *DDZUserAccountService) UpdateUserAccountStatus(req ddzReq.DDZUserAccountStatus) error {
        db := GetDDZDB()
        var account ddz.DDZUserAccount
        err := db.First(&account, req.ID).Error
        if err != nil {
                return errors.New("账户不存在")
        }

        return db.Model(&account).Updates(map[string]interface{}{
                "status":     req.Status,
                "updated_at": time.Now(),
        }).Error
}

// GetLoginLogList 获取登录日志列表
func (s *DDZUserAccountService) GetLoginLogList(req ddzReq.DDZLoginLogSearch) (list interface{}, total int64, err error) {
        db := GetDDZDB()
        if db == nil {
                global.GVA_LOG.Error("获取DDZ数据库连接失败!", zap.String("method", "GetLoginLogList"))
                return nil, 0, errors.New("数据库连接失败")
        }
        
        limit := req.PageSize
        offset := req.PageSize * (req.Page - 1)
        query := db.Model(&ddz.DDZLoginLog{})

        if req.PlayerID != "" {
                query = query.Where("player_id = ?", req.PlayerID)
        }
        if req.LoginType != nil {
                query = query.Where("login_type = ?", *req.LoginType)
        }
        if req.LoginResult != nil {
                query = query.Where("login_result = ?", *req.LoginResult)
        }
        if req.IP != "" {
                query = query.Where("ip LIKE ?", "%"+req.IP+"%")
        }
        if req.StartDate != "" {
                query = query.Where("created_at >= ?", req.StartDate)
        }
        if req.EndDate != "" {
                query = query.Where("created_at <= ?", req.EndDate+" 23:59:59")
        }

        err = query.Count(&total).Error
        if err != nil {
                global.GVA_LOG.Error("统计登录日志数量失败!", zap.Error(err))
                return nil, 0, err
        }

        var logs []ddz.DDZLoginLog
        err = query.Limit(limit).Offset(offset).Order("id desc").Find(&logs).Error
        if err != nil {
                global.GVA_LOG.Error("查询登录日志列表失败!", zap.Error(err))
                return nil, 0, err
        }

        // 转换为响应格式
        logList := make([]ddzRes.DDZLoginLogResponse, 0, len(logs))
        for _, l := range logs {
                resp := s.toLoginLogResponse(l)
                // 获取玩家昵称
                var player ddz.DDZPlayer
                if err := db.Where("player_id = ?", l.PlayerID).First(&player).Error; err == nil {
                        resp.PlayerNickname = player.Nickname
                }
                logList = append(logList, resp)
        }

        return logList, total, nil
}

// toUserAccountResponse 转换为响应格式
func (s *DDZUserAccountService) toUserAccountResponse(a ddz.DDZUserAccount) ddzRes.DDZUserAccountResponse {
        loginTypeText := "手机号"
        switch a.LoginType {
        case 2:
                loginTypeText = "微信"
        case 3:
                loginTypeText = "游客"
        }

        statusText := "正常"
        switch a.Status {
        case 0:
                statusText = "禁用"
        case 2:
                statusText = "封禁"
        }

        var lastLoginAt, tokenExpireAt, refreshTokenExpireAt string
        if a.LastLoginAt != nil {
                lastLoginAt = *a.LastLoginAt
        }
        if a.TokenExpireAt != nil {
                tokenExpireAt = *a.TokenExpireAt
        }
        if a.RefreshTokenExpireAt != nil {
                refreshTokenExpireAt = *a.RefreshTokenExpireAt
        }

        return ddzRes.DDZUserAccountResponse{
                ID:                   a.ID,
                PlayerID:             a.PlayerID,
                Phone:                a.Phone,
                WxOpenID:             a.WxOpenID,
                WxUnionID:            a.WxUnionID,
                WxNickname:           a.WxNickname,
                WxAvatar:             a.WxAvatar,
                LoginType:            a.LoginType,
                LoginTypeText:        loginTypeText,
                DeviceID:             a.DeviceID,
                DeviceType:           a.DeviceType,
                LastLoginAt:          lastLoginAt,
                LastLoginIP:          a.LastLoginIP,
                LoginCount:           a.LoginCount,
                Status:               a.Status,
                StatusText:           statusText,
                TokenExpireAt:        tokenExpireAt,
                RefreshTokenExpireAt: refreshTokenExpireAt,
                CreatedAt:            a.CreatedAt.Format("2006-01-02 15:04:05"),
                UpdatedAt:            a.UpdatedAt.Format("2006-01-02 15:04:05"),
        }
}

// toLoginLogResponse 转换为登录日志响应格式
func (s *DDZUserAccountService) toLoginLogResponse(l ddz.DDZLoginLog) ddzRes.DDZLoginLogResponse {
        loginTypeText := "手机号"
        switch l.LoginType {
        case 2:
                loginTypeText = "微信"
        case 3:
                loginTypeText = "游客"
        }

        loginResultText := "失败"
        if l.LoginResult == 1 {
                loginResultText = "成功"
        }

        return ddzRes.DDZLoginLogResponse{
                ID:              l.ID,
                PlayerID:        l.PlayerID,
                AccountID:       l.AccountID,
                LoginType:       l.LoginType,
                LoginTypeText:   loginTypeText,
                LoginResult:     l.LoginResult,
                LoginResultText: loginResultText,
                FailReason:      l.FailReason,
                IP:              l.IP,
                DeviceID:        l.DeviceID,
                DeviceType:      l.DeviceType,
                UserAgent:       l.UserAgent,
                Location:        l.Location,
                CreatedAt:       l.CreatedAt.Format("2006-01-02 15:04:05"),
        }
}

// BindPhone 绑定手机号
func (s *DDZUserAccountService) BindPhone(accountID uint, phone string) error {
        db := GetDDZDB()
        var account ddz.DDZUserAccount
        err := db.First(&account, accountID).Error
        if err != nil {
                return errors.New("账户不存在")
        }

        // 检查手机号是否已被使用
        var count int64
        db.Model(&ddz.DDZUserAccount{}).Where("phone = ? AND id != ?", phone, accountID).Count(&count)
        if count > 0 {
                return errors.New("手机号已被其他账户使用")
        }

        return db.Model(&account).Updates(map[string]interface{}{
                "phone":      phone,
                "updated_at": time.Now(),
        }).Error
}

// UnbindWeChat 解绑微信
func (s *DDZUserAccountService) UnbindWeChat(accountID uint) error {
        db := GetDDZDB()
        var account ddz.DDZUserAccount
        err := db.First(&account, accountID).Error
        if err != nil {
                return errors.New("账户不存在")
        }

        return db.Model(&account).Updates(map[string]interface{}{
                "wx_open_id":     "",
                "wx_union_id":    "",
                "wx_session_key": "",
                "wx_nickname":    "",
                "wx_avatar":      "",
                "updated_at":     time.Now(),
        }).Error
}

// ResetToken 重置Token（强制下线）
func (s *DDZUserAccountService) ResetToken(accountID uint) error {
        db := GetDDZDB()
        return db.Model(&ddz.DDZUserAccount{}).Where("id = ?", accountID).Updates(map[string]interface{}{
                "token":                   "",
                "token_expire_at":         nil,
                "refresh_token":           "",
                "refresh_token_expire_at": nil,
                "updated_at":              time.Now(),
        }).Error
}
