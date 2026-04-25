package api

import (
        "encoding/json"
        "fmt"
        "log"
        "math/rand"
        "net/http"
        "strings"
        "sync"
        "time"

        "github.com/palemoky/fight-the-landlord/internal/game/database"
        "gorm.io/gorm"
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

        // 获取请求数据 - 优先从上下文获取解密后的数据
        var req SendCodeRequest
        if reqData := GetRequestData(r); reqData != nil {
                // 从加密请求中获取参数
                if params, ok := reqData.Params.(map[string]interface{}); ok {
                        if phone, ok := params["phone"].(string); ok {
                                req.Phone = phone
                        }
                }
                log.Printf("🔐 从加密请求获取参数 - 手机号: %s", req.Phone)
        } else {
                // 从原始请求体解析
                if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
                        writeJSONError(w, http.StatusBadRequest, "请求格式错误")
                        return
                }
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

        log.Printf("=== PhoneLogin 开始处理 ===")

        // 获取请求数据 - 优先从上下文获取解密后的数据
        var req PhoneLoginRequest
        if reqData := GetRequestData(r); reqData != nil {
                log.Printf("🔐 从加密请求获取到数据: action=%s", reqData.Action)
                // 从加密请求中获取参数
                if params, ok := reqData.Params.(map[string]interface{}); ok {
                        log.Printf("🔐 params 类型: %T, 内容: %+v", reqData.Params, params)
                        if phone, ok := params["phone"].(string); ok {
                                req.Phone = phone
                                log.Printf("🔐 获取到手机号: %s", req.Phone)
                        } else {
                                log.Printf("⚠️ params['phone'] 类型断言失败或不存在, phone值: %+v", params["phone"])
                        }
                        if code, ok := params["code"].(string); ok {
                                req.Code = code
                                log.Printf("🔐 获取到验证码: %s", req.Code)
                        } else {
                                log.Printf("⚠️ params['code'] 类型断言失败或不存在, code值: %+v", params["code"])
                        }
                } else {
                        log.Printf("⚠️ reqData.Params 不是 map[string]interface{}, 类型: %T", reqData.Params)
                }
                log.Printf("🔐 从加密请求获取参数完成 - 手机号: %s, 验证码: %s", req.Phone, req.Code)
        } else {
                log.Printf("⚠️ 未从上下文获取到加密数据，尝试解析原始请求体")
                // 从原始请求体解析
                if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
                        log.Printf("❌ 解析原始请求体失败: %v", err)
                        writeJSONError(w, http.StatusBadRequest, "请求格式错误")
                        return
                }
                log.Printf("📄 从原始请求体获取参数 - 手机号: %s, 验证码: %s", req.Phone, req.Code)
        }

        // 验证手机号
        if !isValidPhone(req.Phone) {
                log.Printf("❌ 手机号格式不正确: '%s', 长度: %d", req.Phone, len(req.Phone))
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

        // 获取客户端信息
        clientIP := getClientIP(r)
        userAgent := r.Header.Get("User-Agent")
        deviceID := r.Header.Get("X-Device-ID")
        deviceType := r.Header.Get("X-Device-Type")
        if deviceType == "" {
                deviceType = parseDeviceType(userAgent)
        }

        // 检查数据库是否已连接
        db := database.DB()
        log.Printf("🔍 数据库检查: db=%v, IsConnected=%v", db != nil, database.GetInstance().IsConnected())
        
        if db == nil {
                log.Printf("⚠️ 数据库DB实例为nil，使用模拟登录 - 请检查数据库配置")
                h.mockPhoneLogin(w, req.Phone)
                return
        }

        if !database.GetInstance().IsConnected() {
                log.Printf("⚠️ 数据库连接检查失败(IsConnected=false)，使用模拟登录 - 请检查数据库配置")
                h.mockPhoneLogin(w, req.Phone)
                return
        }

        log.Printf("📊 数据库已连接，开始处理登录请求 - 手机号: %s", req.Phone)

        // 查询或创建用户
        player, account, isNewUser, err := h.getOrCreatePlayerByPhone(req.Phone)
        if err != nil {
                log.Printf("❌ 登录失败: %v", err)
                // 记录登录失败日志
                h.createLoginLog(0, 0, database.LoginTypePhone, false, err.Error(), clientIP, deviceID, deviceType, userAgent)
                writeJSONError(w, http.StatusInternalServerError, "登录失败: "+err.Error())
                return
        }

        log.Printf("✅ 登录成功 - 玩家ID: %d, 账户ID: %d, 新用户: %v", player.ID, account.ID, isNewUser)

        // 生成token
        token := generateToken(32)
        now := time.Now()
        tokenExpire := now.Add(7 * 24 * time.Hour) // 7天过期

        // 更新账户Token
        if db != nil {
                db.Model(&database.UserAccount{}).Where("id = ?", account.ID).Updates(map[string]interface{}{
                        "token":             token,
                        "token_expire_at":   &tokenExpire,
                        "last_login_at":     &now,
                        "last_login_ip":     clientIP,
                        "login_count":       account.LoginCount + 1,
                        "device_id":         deviceID,
                        "device_type":       deviceType,
                })

                // 更新玩家最后登录时间
                db.Model(&database.Player{}).Where("id = ?", player.ID).Updates(map[string]interface{}{
                        "last_login_at": &now,
                        "last_login_ip": clientIP,
                })
        }

        // 记录登录成功日志
        h.createLoginLog(player.ID, account.ID, database.LoginTypePhone, true, "", clientIP, deviceID, deviceType, userAgent)

        log.Printf("✅ 手机号登录成功 - 手机号: %s, 玩家ID: %d, 新用户: %v, IP: %s, 设备: %s", req.Phone, player.ID, isNewUser, clientIP, deviceType)

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

        log.Printf("🔍 查询手机号 %s 对应的账户...", phone)

        // 查询账户是否存在
        var account database.UserAccount
        result := db.Where("phone = ?", phone).First(&account)

        if result.Error == nil {
                log.Printf("✅ 账户已存在 - 账户ID: %d, 玩家ID: %d", account.ID, account.PlayerID)
                // 账户已存在，获取玩家信息
                var player database.Player
                if err := db.First(&player, account.PlayerID).Error; err != nil {
                        log.Printf("❌ 获取玩家信息失败: %v", err)
                        return nil, nil, false, fmt.Errorf("获取玩家信息失败: %w", err)
                }
                return &player, &account, false, nil
        }

        // 如果是其他错误（非记录未找到），返回错误
        if result.Error != gorm.ErrRecordNotFound {
                log.Printf("❌ 查询账户失败: %v", result.Error)
                return nil, nil, false, fmt.Errorf("查询账户失败: %w", result.Error)
        }

        log.Printf("📝 账户不存在，创建新用户 - 手机号: %s", phone)

        // 账户不存在，创建新用户
        // 生成唯一昵称：用户 + 手机号后4位 + 4位随机数
        randomSuffix := generateCode(4)
        nickName := "用户" + phone[len(phone)-4:] + randomSuffix
        now := time.Now()

        var newPlayer *database.Player
        var newAccount *database.UserAccount

        log.Printf("🔨 开始执行事务创建玩家和账户...")
        
        // 使用事务创建玩家和账户
        err := database.Transaction(func(tx *gorm.DB) error {
                // 创建玩家 - 使用手机号作为用户名确保唯一性
                newPlayer = &database.Player{
                        Username:    "phone_" + phone,
                        Nickname:    nickName,
                        Gold:        1000, // 初始金币
                        Status:      database.PlayerStatusNormal,
                        CreatedAt:   now,
                        UpdatedAt:   now,
                }

                log.Printf("🔨 创建玩家记录 - 用户名: phone_%s, 昵称: %s", phone, nickName)
                if err := tx.Create(newPlayer).Error; err != nil {
                        log.Printf("❌ 创建玩家失败: %v", err)
                        return fmt.Errorf("创建玩家失败: %w", err)
                }
                log.Printf("✅ 玩家创建成功 - 玩家ID: %d, 昵称: %s", newPlayer.ID, nickName)

                // 创建账户
                newAccount = &database.UserAccount{
                        PlayerID:   newPlayer.ID,
                        Phone:      phone,
                        LoginType:  database.LoginTypePhone,
                        Status:     database.PlayerStatusNormal,
                        CreatedAt:  now,
                        UpdatedAt:  now,
                }

                log.Printf("🔨 创建账户记录 - 玩家ID: %d, 手机号: %s", newPlayer.ID, phone)
                if err := tx.Create(newAccount).Error; err != nil {
                        log.Printf("❌ 创建账户失败: %v", err)
                        return fmt.Errorf("创建账户失败: %w", err)
                }
                log.Printf("✅ 账户创建成功 - 账户ID: %d", newAccount.ID)

                return nil
        })

        if err != nil {
                log.Printf("❌ 事务执行失败: %v", err)
                return nil, nil, false, err
        }
        
        log.Printf("✅ 事务执行成功！")

        log.Printf("✅ 创建新用户完成 - 手机号: %s, 玩家ID: %d, 账户ID: %d", phone, newPlayer.ID, newAccount.ID)

        return newPlayer, newAccount, true, nil
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

        // 获取请求数据 - 优先从上下文获取解密后的数据
        var req WxLoginRequest
        if reqData := GetRequestData(r); reqData != nil {
                // 从加密请求中获取参数
                if params, ok := reqData.Params.(map[string]interface{}); ok {
                        if code, ok := params["code"].(string); ok {
                                req.Code = code
                        }
                        if nickName, ok := params["nickName"].(string); ok {
                                req.NickName = nickName
                        }
                        if avatar, ok := params["avatar"].(string); ok {
                                req.Avatar = avatar
                        }
                }
                log.Printf("🔐 从加密请求获取参数 - 授权码: %s", req.Code)
        } else {
                // 从原始请求体解析
                if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
                        writeJSONError(w, http.StatusBadRequest, "请求格式错误")
                        return
                }
        }

        // 微信授权码
        if req.Code == "" {
                writeJSONError(w, http.StatusBadRequest, "缺少微信授权码")
                return
        }

        // 获取客户端信息
        clientIP := getClientIP(r)
        userAgent := r.Header.Get("User-Agent")
        deviceID := r.Header.Get("X-Device-ID")
        deviceType := r.Header.Get("X-Device-Type")
        if deviceType == "" {
                deviceType = parseDeviceType(userAgent)
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

        // 记录登录日志
        h.createLoginLog(0, 0, database.LoginTypeWechat, true, "", clientIP, deviceID, deviceType, userAgent)

        log.Printf("✅ 微信登录成功 - 授权码: %s, 账号ID: %s, IP: %s, 设备: %s", req.Code, accountID, clientIP, deviceType)

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

        // 获取请求数据 - 优先从上下文获取解密后的数据
        if reqData := GetRequestData(r); reqData != nil {
                // 从加密请求中获取参数
                if params, ok := reqData.Params.(map[string]interface{}); ok {
                        if openId, ok := params["openId"].(string); ok {
                                req.OpenID = openId
                        }
                        if unionId, ok := params["unionId"].(string); ok {
                                req.UnionID = unionId
                        }
                        if nickName, ok := params["nickName"].(string); ok {
                                req.NickName = nickName
                        }
                        if avatarUrl, ok := params["avatarUrl"].(string); ok {
                                req.AvatarUrl = avatarUrl
                        }
                }
                log.Printf("🔐 从加密请求获取参数 - OpenID: %s", req.OpenID)
        } else {
                // 从原始请求体解析
                if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
                        writeJSONError(w, http.StatusBadRequest, "请求格式错误")
                        return
                }
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

        // 获取客户端信息
        clientIP := getClientIP(r)
        userAgent := r.Header.Get("User-Agent")
        deviceID := r.Header.Get("X-Device-ID")
        deviceType := r.Header.Get("X-Device-Type")
        if deviceType == "" {
                deviceType = parseDeviceType(userAgent)
        }

        accountID := "wxapp_" + uniqueID[:16]
        nickName := req.NickName
        if nickName == "" {
                nickName = "微信用户"
        }
        token := generateToken(32)

        // 记录登录日志
        h.createLoginLog(0, 0, database.LoginTypeWechat, true, "", clientIP, deviceID, deviceType, userAgent)

        log.Printf("✅ 微信APP登录成功 - OpenID: %s, 账号ID: %s, IP: %s, 设备: %s", uniqueID, accountID, clientIP, deviceType)

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

// getClientIP 获取客户端真实IP
func getClientIP(r *http.Request) string {
        // 优先从代理头获取
        ip := r.Header.Get("X-Forwarded-For")
        if ip != "" {
                // X-Forwarded-For可能包含多个IP，取第一个
                ips := strings.Split(ip, ",")
                if len(ips) > 0 {
                        return strings.TrimSpace(ips[0])
                }
        }

        ip = r.Header.Get("X-Real-IP")
        if ip != "" {
                return ip
        }

        ip = r.Header.Get("X-Client-IP")
        if ip != "" {
                return ip
        }

        // 最后使用RemoteAddr
        ip = r.RemoteAddr
        if idx := strings.LastIndex(ip, ":"); idx != -1 {
                ip = ip[:idx]
        }
        return ip
}

// parseDeviceType 从User-Agent解析设备类型
func parseDeviceType(userAgent string) string {
        userAgent = strings.ToLower(userAgent)

        if strings.Contains(userAgent, "iphone") || strings.Contains(userAgent, "ipad") {
                if strings.Contains(userAgent, "ipad") {
                        return "iPad"
                }
                return "iPhone"
        }

        if strings.Contains(userAgent, "android") {
                if strings.Contains(userAgent, "mobile") {
                        return "Android"
                }
                return "Android Tablet"
        }

        if strings.Contains(userAgent, "windows phone") {
                return "Windows Phone"
        }

        if strings.Contains(userAgent, "macintosh") || strings.Contains(userAgent, "mac os x") {
                return "Mac"
        }

        if strings.Contains(userAgent, "windows") {
                return "Windows"
        }

        if strings.Contains(userAgent, "linux") {
                return "Linux"
        }

        if strings.Contains(userAgent, "micromessenger") {
                return "WeChat"
        }

        return "Unknown"
}

// createLoginLog 创建登录日志
func (h *AuthHandler) createLoginLog(playerID, accountID uint64, loginType uint8, success bool, failReason, ip, deviceID, deviceType, userAgent string) {
        db := database.DB()
        if db == nil {
                return
        }

        var loginResult uint8
        if success {
                loginResult = database.LoginResultSuccess
        } else {
                loginResult = database.LoginResultFail
        }

        loginLog := &database.LoginLog{
                PlayerID:    playerID,
                AccountID:   accountID,
                LoginType:   loginType,
                LoginResult: loginResult,
                FailReason:  failReason,
                IP:          ip,
                DeviceID:    deviceID,
                DeviceType:  deviceType,
                UserAgent:   userAgent,
                CreatedAt:   time.Now(),
        }

        if err := db.Create(loginLog).Error; err != nil {
                log.Printf("⚠️ 创建登录日志失败: %v", err)
        }
}

// VerifyTokenRequest Token验证请求
type VerifyTokenRequest struct {
        Token    string `json:"token"`
        PlayerID string `json:"player_id"`
}

// VerifyToken 验证Token是否有效
func (h *AuthHandler) VerifyToken(w http.ResponseWriter, r *http.Request) {
        if r.Method != http.MethodPost {
                writeJSONError(w, http.StatusMethodNotAllowed, "方法不允许")
                return
        }

        log.Printf("=== VerifyToken 开始处理 ===")

        // 获取请求数据
        var req VerifyTokenRequest
        if reqData := GetRequestData(r); reqData != nil {
                // 从加密请求中获取参数
                if params, ok := reqData.Params.(map[string]interface{}); ok {
                        if token, ok := params["token"].(string); ok {
                                req.Token = token
                        }
                        if playerID, ok := params["player_id"].(string); ok {
                                req.PlayerID = playerID
                        }
                }
        } else {
                // 从原始请求体解析
                if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
                        writeJSONError(w, http.StatusBadRequest, "请求格式错误")
                        return
                }
        }

        log.Printf("🔐 验证Token - PlayerID: %s, Token长度: %d", req.PlayerID, len(req.Token))

        if req.Token == "" {
                writeJSONError(w, http.StatusBadRequest, "缺少Token")
                return
        }

        db := database.DB()
        if db == nil {
                // 无数据库连接，简单验证
                writeJSONSuccess(w, map[string]interface{}{
                        "valid": true,
                        "message": "验证成功（无数据库模式）",
                })
                return
        }

        // 查询账户
        var account database.UserAccount
        result := db.Where("token = ?", req.Token).First(&account)
        if result.Error != nil {
                log.Printf("❌ Token无效: %v", result.Error)
                writeJSONSuccess(w, map[string]interface{}{
                        "valid":   false,
                        "message": "Token无效或已过期",
                })
                return
        }

        // 检查Token是否过期
        if account.TokenExpireAt != nil && account.TokenExpireAt.Before(time.Now()) {
                log.Printf("❌ Token已过期: %v", account.TokenExpireAt)
                writeJSONSuccess(w, map[string]interface{}{
                        "valid":   false,
                        "message": "Token已过期",
                })
                return
        }

        // 检查账户状态
        if account.Status != database.PlayerStatusNormal {
                log.Printf("❌ 账户状态异常: %d", account.Status)
                writeJSONSuccess(w, map[string]interface{}{
                        "valid":   false,
                        "message": "账户已被禁用",
                })
                return
        }

        // 获取玩家信息
        var player database.Player
        if err := db.First(&player, account.PlayerID).Error; err != nil {
                log.Printf("❌ 获取玩家信息失败: %v", err)
                writeJSONSuccess(w, map[string]interface{}{
                        "valid":   false,
                        "message": "玩家信息不存在",
                })
                return
        }

        log.Printf("✅ Token验证成功 - 玩家: %s", player.Nickname)

        writeJSONSuccess(w, map[string]interface{}{
                "valid":   true,
                "message": "验证成功",
                "player": map[string]interface{}{
                        "uniqueID":  fmt.Sprintf("%d", player.ID),
                        "accountID": fmt.Sprintf("%d", account.ID),
                        "nickName":  player.Nickname,
                        "avatarUrl": player.Avatar,
                        "goldCount": player.Gold,
                        "token":     account.Token,
                },
        })
}

// ForceLogoutRequest 强制下线请求
type ForceLogoutRequest struct {
        PlayerID string `json:"player_id"`
        Reason   string `json:"reason"`
}

// ForceLogout 强制用户下线（管理员调用）
func (h *AuthHandler) ForceLogout(w http.ResponseWriter, r *http.Request) {
        if r.Method != http.MethodPost {
                writeJSONError(w, http.StatusMethodNotAllowed, "方法不允许")
                return
        }

        log.Printf("=== ForceLogout 开始处理 ===")

        // 获取请求数据
        var req ForceLogoutRequest
        if reqData := GetRequestData(r); reqData != nil {
                if params, ok := reqData.Params.(map[string]interface{}); ok {
                        if playerID, ok := params["player_id"].(string); ok {
                                req.PlayerID = playerID
                        }
                        if reason, ok := params["reason"].(string); ok {
                                req.Reason = reason
                        }
                }
        } else {
                if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
                        writeJSONError(w, http.StatusBadRequest, "请求格式错误")
                        return
                }
        }

        log.Printf("🔐 强制下线 - PlayerID: %s, Reason: %s", req.PlayerID, req.Reason)

        if req.PlayerID == "" {
                writeJSONError(w, http.StatusBadRequest, "缺少玩家ID")
                return
        }

        // 使 Token 失效
        db := database.DB()
        if db != nil {
                db.Model(&database.UserAccount{}).Where("player_id = ?", req.PlayerID).Updates(map[string]interface{}{
                        "token":           "",
                        "token_expire_at": nil,
                })
        }

        // 通知 WebSocket 服务强制下线
        offline := !ForceLogoutPlayer(req.PlayerID, req.Reason)

        log.Printf("✅ 强制下线成功 - PlayerID: %s, 是否在线: %v", req.PlayerID, !offline)

        writeJSONSuccess(w, map[string]interface{}{
                "success":  true,
                "message":  "强制下线成功",
                "playerId": req.PlayerID,
                "wasOnline": !offline,
        })
}

// Logout 登出
func (h *AuthHandler) Logout(w http.ResponseWriter, r *http.Request) {
        if r.Method != http.MethodPost {
                writeJSONError(w, http.StatusMethodNotAllowed, "方法不允许")
                return
        }

        log.Printf("=== Logout 开始处理 ===")

        // 获取请求数据
        var req struct {
                Token string `json:"token"`
        }
        if reqData := GetRequestData(r); reqData != nil {
                if params, ok := reqData.Params.(map[string]interface{}); ok {
                        if token, ok := params["token"].(string); ok {
                                req.Token = token
                        }
                }
        } else {
                if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
                        writeJSONError(w, http.StatusBadRequest, "请求格式错误")
                        return
                }
        }

        // 使 Token 失效
        db := database.DB()
        if db != nil && req.Token != "" {
                db.Model(&database.UserAccount{}).Where("token = ?", req.Token).Updates(map[string]interface{}{
                        "token":           "",
                        "token_expire_at": nil,
                })
        }

        log.Printf("✅ 登出成功")

        writeJSONSuccess(w, map[string]interface{}{
                "success": true,
                "message": "登出成功",
        })
}
