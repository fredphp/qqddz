# 用户登录状态管理系统实现

## 实现日期
2025-01-XX

## 功能概述
实现了完整的用户登录状态管理系统，支持：
1. **跨平台本地存储** - Web浏览器、iOS App、Android App
2. **持久化登录状态** - 7天自动登录，Token验证
3. **强制下线功能** - 后台管理员可强制用户下线
4. **实时通知** - WebSocket实时推送强制下线消息

---

## 客户端修改

### 1. 新增文件: `nclient/assets/scripts/util/storage_util.js`
跨平台本地存储工具，使用 Cocos Creator 的 `cc.sys.localStorage` API：
- 支持 Web 浏览器、iOS App、Android App
- 自动检测平台并选择合适的存储方式
- 提供玩家数据专用存储方法
- 支持强制下线标记存储

### 2. 修改: `nclient/assets/scripts/data/player.js`
增强玩家数据管理：
- 使用跨平台存储工具 StorageUtil
- 添加自动保存功能
- 支持强制下线标记管理
- 增强数据安全性

### 3. 修改: `nclient/assets/scripts/data/socket_ctr.js`
WebSocket 通信增强：
- 添加 `force_logout` 消息类型
- 实现 `_handleForceLogout()` 强制下线处理
- 添加 `disconnect()` 方法用于主动断开连接
- 强制下线时通知 myglobal 模块

### 4. 修改: `nclient/assets/scripts/loginscene/loginScene.js`
登录流程完善：
- 登录成功后调用 `myglobal.onLoginSuccess()` 保存状态
- 统一手机登录和微信登录的状态保存逻辑
- 支持模拟登录时的状态保存

### 5. 修改: `nclient/assets/scripts/mygolbal.js`
全局状态管理增强：
- 支持自动登录检查
- Token 验证功能
- 强制下线处理

---

## 服务端修改

### 1. 修改: `server/internal/protocol/message.go`
添加消息类型：MsgForceLogout

### 2. 修改: `server/internal/protocol/payloads.go`
添加 ForceLogoutPayload 结构体

### 3. 新增: `server/internal/api/ws_manager.go`
WebSocket 服务器管理器：
- SetWSServer/GetWSServer - 管理服务器引用
- ForceLogoutPlayer - 强制玩家下线
- IsPlayerOnline - 检查玩家在线状态

### 4. 修改: `server/internal/server/broadcast.go`
添加强制下线方法：
- GetClientByPlayerID
- ForceLogoutPlayer
- ForceLogoutAllPlayers

### 5. 修改: `server/internal/api/auth.go`
ForceLogout 方法增强，支持 WebSocket 通知

### 6. 修改: `server/cmd/server/main.go`
设置 WebSocket 服务器引用到 API 包

---

## API 接口

### 强制下线接口
```
POST /api/v1/auth/force-logout
```

请求参数：player_id, reason
响应：success, wasOnline

---

## 数据流程

### 登录流程
1. 用户输入手机号/验证码
2. 客户端发送加密登录请求
3. 服务端验证并返回 Token
4. 客户端保存登录状态到本地存储

### 自动登录流程
1. 启动时检查本地登录信息
2. 检查强制下线标记
3. Token 验证
4. 验证成功自动登录

### 强制下线流程
1. 后台调用强制下线 API
2. Token 失效
3. WebSocket 发送强制下线消息
4. 客户端设置标记并跳转登录页

---

## 本地存储

存储键名：
- ddz_player_data - 玩家数据
- ddz_auth_token - Token备份  
- ddz_force_logout - 强制下线标记

Token有效期：7天
强制下线标记有效期：24小时
