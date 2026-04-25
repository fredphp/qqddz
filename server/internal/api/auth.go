package api

import (
        "encoding/json"
        "fmt"
        "log"
        "math/rand"
        "net/http"
        "sync"
        "time"

        "github.com/palemoky/fight-the-landlord/internal/game/database"
)

// 验证码存储
var (
        codeStore     = make(map[string]*CodeInfo)
        codeStoreLock sync.RWMutex
)

// CodeInfo 验证码信息
type CodeInfo struct {
        Code      string
        ExpiresAt time.Time
        Phone     string
}

// AuthHandler 认证处理器
type AuthHandler struct {
}

// NewAuthHandler 创建认证处理器
func NewAuthHandler() *AuthHandler {
        return &AuthHandler{
        }
}

// SendCodeRequest 发送验证码请求
type SendCodeRequest struct {
        Phone string `json:"phone"`
}

// PhoneLoginRequest 手机号登录请求
type PhoneLoginRequest struct {
        Phone string `json:"phone"`
        Code  string `json:"code"`
}

// WxLoginRequest 微信登录请求
type WxLoginRequest struct {
        Code     string `json:"code"`     // 微信授权码
        NickName string `json:"nickName"` // 昵称
        Avatar   string `json:"avatar"`   // 头像
}

// LoginResponse 登录响应
type LoginResponse struct {
        UniqueID  string `json:"uniqueID"`
        AccountID string `json:"accountID"`
        NickName  string `json:"nickName"`
        AvatarUrl string `json:"avatarUrl"`
        GoldCount int    `json:"goldcount"`
        Token     string `json:"token"`
        IsNewUser bool   `json:"isNewUser"`
}

// SendVerificationCode 发送验证码
func (h *AuthHandler) SendVerificationCode(w http.ResponseWriter, r *http.Request) {
        if r.Method != http.MethodPost {
                writeJSONError(w, http.StatusMethodNotAllowed, "方法不允许")
                return
        }

        // 获取请求数据
        var req SendCodeRequest
        if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
                writeJSONError(w, http.StatusBadRequest, "请求格式错误")
                return
        }

        // 验证手机号
        if !isValidPhone(req.Phone) {
                writeJSONError(w, http.StatusBadRequest, "手机号格式不正确")
                return
        }

        // 生成6位验证码
        code := generateCode(6)

        // 存储验证码（5分钟有效期）
        codeStoreLock.Lock()
        codeStore[req.Phone] = &CodeInfo{
                Code:      code,
                ExpiresAt: time.Now().Add(5 * time.Minute),
                Phone:     req.Phone,
        }
        codeStoreLock.Unlock()

        // 开发环境：直接返回验证码（生产环境应该调用短信服务）
        log.Printf("📱 验证码已生成 - 手机号: %s, 验证码: %s", req.Phone, code)

        // TODO: 生产环境调用短信服务发送验证码
        // err := sendSMS(req.Phone, code)

        writeJSONSuccess(w, map[string]interface{}{
                "message": "验证码已发送",
                "code":    code, // 开发环境返回验证码，生产环境需移除
        })
}

// PhoneLogin 手机号登录/注册
func (h *AuthHandler) PhoneLogin(w http.ResponseWriter, r *http.Request) {
        if r.Method != http.MethodPost {
                writeJSONError(w, http.StatusMethodNotAllowed, "方法不允许")
                return
        }

        var req PhoneLoginRequest
        if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
                writeJSONError(w, http.StatusBadRequest, "请求格式错误")
                return
        }

        // 验证手机号
        if !isValidPhone(req.Phone) {
                writeJSONError(w, http.StatusBadRequest, "手机号格式不正确")
                return
        }

        // TODO: 验证码验证功能暂时屏蔽，测试阶段跳过验证
        // 生产环境需要取消以下注释，启用验证码验证
        /*
        // 验证验证码
        codeStoreLock.RLock()
        codeInfo, exists := codeStore[req.Phone]
        codeStoreLock.RUnlock()

        if !exists {
                writeJSONError(w, http.StatusBadRequest, "请先获取验证码")
                return
        }

        if time.Now().After(codeInfo.ExpiresAt) {
                codeStoreLock.Lock()
                delete(codeStore, req.Phone)
                codeStoreLock.Unlock()
                writeJSONError(w, http.StatusBadRequest, "验证码已过期")
                return
        }

        if codeInfo.Code != req.Code {
                writeJSONError(w, http.StatusBadRequest, "验证码错误")
                return
        }

        // 验证成功，删除验证码
        codeStoreLock.Lock()
        delete(codeStore, req.Phone)
        codeStoreLock.Unlock()
        */

        // 测试阶段：跳过验证码验证，直接登录
        log.Printf("⚠️ 测试模式：跳过验证码验证 - 手机号: %s", req.Phone)

        // 检查数据库是否已连接
        if !database.GetInstance().IsConnected() {
                log.Printf("⚠️ 数据库未连接，使用模拟登录")
                h.mockPhoneLogin(w, req.Phone)
                return
        }

        // 查询或创建用户
        player, account, isNewUser, err := h.getOrCreatePlayerByPhone(req.Phone)
        if err != nil {
                log.Printf("❌ 登录失败: %v", err)
                writeJSONError(w, http.StatusInternalServerError, "登录失败")
                return
        }

        // 生成token
        token := generateToken(32)
        now := time.Now()
        tokenExpire := now.Add(7 * 24 * time.Hour) // 7天过期

        // 更新账户Token
        db := database.DB()
        if db != nil {
                db.Model(&database.UserAccount{}).Where("id = ?", account.ID).Updates(map[string]interface{}{
                        "token":             token,
                        "token_expire_at":   &tokenExpire,
                        "last_login_at":     &now,
                        "last_login_ip":     r.RemoteAddr,
                        "login_count":       account.LoginCount + 1,
                })

                // 更新玩家最后登录时间
                db.Model(&database.Player{}).Where("id = ?", player.ID).Updates(map[string]interface{}{
                        "last_login_at": &now,
                        "last_login_ip": r.RemoteAddr,
                })
        }

        log.Printf("✅ 手机号登录成功 - 手机号: %s, 玩家ID: %d, 新用户: %v", req.Phone, player.ID, isNewUser)

        writeJSONSuccess(w, &LoginResponse{
                UniqueID:  fmt.Sprintf("%d", player.ID),
                AccountID: fmt.Sprintf("%d", account.ID),
                NickName:  player.Nickname,
                AvatarUrl: player.Avatar,
                GoldCount: int(player.Gold),
                Token:     token,
                IsNewUser: isNewUser,
        })
}

// getOrCreatePlayerByPhone 根据手机号获取或创建玩家
func (h *AuthHandler) getOrCreatePlayerByPhone(phone string) (*database.Player, *database.UserAccount, bool, error) {
        db := database.DB()
        if db == nil {
                return nil, nil, false, fmt.Errorf("数据库未初始化")
        }

        // 查询账户是否存在
        var account database.UserAccount
        result := db.Where("phone = ?", phone).First(&account)

        if result.Error == nil {
                // 账户已存在，获取玩家信息
                var player database.Player
                if err := db.First(&player, account.PlayerID).Error; err != nil {
                        return nil, nil, false, err
                }
                return &player, &account, false, nil
        }

        // 账户不存在，创建新用户
        nickName := "用户" + phone[len(phone)-4:]
        now := time.Now()

        // 创建玩家
        player := &database.Player{
                Nickname:    nickName,
                Gold:        1000, // 初始金币
                Status:      database.PlayerStatusNormal,
                CreatedAt:   now,
                UpdatedAt:   now,
        }

        if err := database.CreatePlayer(player); err != nil {
                return nil, nil, false, fmt.Errorf("创建玩家失败: %w", err)
        }

        // 创建账户
        account = database.UserAccount{
                PlayerID:   player.ID,
                Phone:      phone,
                LoginType:  database.LoginTypePhone,
                Status:     database.PlayerStatusNormal,
                CreatedAt:  now,
                UpdatedAt:  now,
        }

        if err := db.Create(&account).Error; err != nil {
                return nil, nil, false, fmt.Errorf("创建账户失败: %w", err)
        }

        log.Printf("✅ 创建新用户 - 手机号: %s, 玩家ID: %d", phone, player.ID)

        return player, &account, true, nil
}

// mockPhoneLogin 模拟登录（数据库未连接时使用）
func (h *AuthHandler) mockPhoneLogin(w http.ResponseWriter, phone string) {
        accountID := "phone_" + phone
        nickName := "用户" + phone[len(phone)-4:]
        token := generateToken(32)

        log.Printf("✅ 模拟登录成功 - 手机号: %s", phone)

        writeJSONSuccess(w, &LoginResponse{
                UniqueID:  accountID,
                AccountID: accountID,
                NickName:  nickName,
                AvatarUrl: "",
                GoldCount: 1000,
                Token:     token,
                IsNewUser: true,
        })
}

// WxLogin 微信登录（用于网页扫码或App授权）
func (h *AuthHandler) WxLogin(w http.ResponseWriter, r *http.Request) {
        if r.Method != http.MethodPost {
                writeJSONError(w, http.StatusMethodNotAllowed, "方法不允许")
                return
        }

        var req WxLoginRequest
        if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
                writeJSONError(w, http.StatusBadRequest, "请求格式错误")
                return
        }

        // 微信授权码
        if req.Code == "" {
                writeJSONError(w, http.StatusBadRequest, "缺少微信授权码")
                return
        }

        // TODO: 生产环境应该调用微信API获取用户信息
        // 1. 使用code换取access_token
        // 2. 使用access_token获取用户信息
        // accessToken, openid, err := getWxAccessToken(req.Code)
        // userInfo, err := getWxUserInfo(accessToken, openid)

        // 模拟微信登录
        accountID := "wx_" + generateToken(16)
        nickName := req.NickName
        if nickName == "" {
                nickName = "微信用户"
        }
        token := generateToken(32)

        log.Printf("✅ 微信登录成功 - 授权码: %s, 账号ID: %s", req.Code, accountID)

        writeJSONSuccess(w, &LoginResponse{
                UniqueID:  accountID,
                AccountID: accountID,
                NickName:  nickName,
                AvatarUrl: req.Avatar,
                GoldCount: 1000,
                Token:     token,
                IsNewUser: true,
        })
}

// WxAppLogin 微信APP授权登录（用于App调用，已获取到用户信息）
func (h *AuthHandler) WxAppLogin(w http.ResponseWriter, r *http.Request) {
        if r.Method != http.MethodPost {
                writeJSONError(w, http.StatusMethodNotAllowed, "方法不允许")
                return
        }

        var req struct {
                OpenID    string `json:"openId"`
                UnionID   string `json:"unionId"`
                NickName  string `json:"nickName"`
                AvatarUrl string `json:"avatarUrl"`
        }

        if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
                writeJSONError(w, http.StatusBadRequest, "请求格式错误")
                return
        }

        // 使用OpenID或UnionID作为唯一标识
        uniqueID := req.OpenID
        if uniqueID == "" {
                uniqueID = req.UnionID
        }
        if uniqueID == "" {
                writeJSONError(w, http.StatusBadRequest, "缺少用户标识")
                return
        }

        accountID := "wxapp_" + uniqueID[:16]
        nickName := req.NickName
        if nickName == "" {
                nickName = "微信用户"
        }
        token := generateToken(32)

        log.Printf("✅ 微信APP登录成功 - OpenID: %s, 账号ID: %s", uniqueID, accountID)

        writeJSONSuccess(w, &LoginResponse{
                UniqueID:  accountID,
                AccountID: accountID,
                NickName:  nickName,
                AvatarUrl: req.AvatarUrl,
                GoldCount: 1000,
                Token:     token,
                IsNewUser: true,
        })
}

// 辅助函数

// isValidPhone 验证手机号格式
func isValidPhone(phone string) bool {
        if len(phone) != 11 {
                return false
        }
        // 简单验证：以1开头的11位数字
        if phone[0] != '1' {
                return false
        }
        for _, c := range phone {
                if c < '0' || c > '9' {
                        return false
                }
        }
        return true
}

// generateCode 生成指定长度的数字验证码
func generateCode(length int) string {
        r := rand.New(rand.NewSource(time.Now().UnixNano()))
        code := ""
        for i := 0; i < length; i++ {
                code += fmt.Sprintf("%d", r.Intn(10))
        }
        return code
}

// generateToken 生成随机token
func generateToken(length int) string {
        const charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"
        r := rand.New(rand.NewSource(time.Now().UnixNano()))
        token := make([]byte, length)
        for i := range token {
                token[i] = charset[r.Intn(len(charset))]
        }
        return string(token)
}

// StartCodeCleaner 启动验证码清理器
func StartCodeCleaner() {
        go func() {
                ticker := time.NewTicker(1 * time.Minute)
                for range ticker.C {
                        codeStoreLock.Lock()
                        now := time.Now()
                        for phone, info := range codeStore {
                                if now.After(info.ExpiresAt) {
                                        delete(codeStore, phone)
                                }
                        }
                        codeStoreLock.Unlock()
                }
        }()
}
