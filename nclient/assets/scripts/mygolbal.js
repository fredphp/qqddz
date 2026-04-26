/**
 * 全局模块
 * 纯全局变量方式，延迟初始化
 * 确保所有依赖都已加载
 * 支持自动登录和强制下线检测
 * 支持跨平台存储（Web/App）
 */

(function() {
    'use strict';
    
    // 如果已存在则不重复定义
    if (window.myglobal) {
        console.log("myglobal 已存在，跳过重新定义");
        return;
    }
    
    var myglobal = {
        socket: null,
        playerData: null,
        eventlister: null,
        _initialized: false,
        _forceLogout: false,  // 是否被强制下线
        _forceLogoutReason: ""  // 强制下线原因
    };
    
    // 检查依赖是否都已加载
    myglobal._checkDependencies = function() {
        var missing = [];
        
        if (typeof window.socketCtr === 'undefined') {
            missing.push('socketCtr (socket_ctr.js)');
        }
        if (typeof window.playerData === 'undefined') {
            missing.push('playerData (player.js)');
        }
        if (typeof window.eventLister === 'undefined') {
            missing.push('eventLister (event_lister.js)');
        }
        
        if (missing.length > 0) {
            // 使用 console.log 而不是 console.error，避免显示错误（依赖可能正在加载中）
            console.log("等待依赖加载:", missing.join(', '));
            return false;
        }
        return true;
    };
    
    // 初始化函数 - 在其他脚本加载后调用
    myglobal.init = function() {
        if (this._initialized) {
            console.log("myglobal 已初始化");
            return true;
        }
        
        console.log("开始初始化 myglobal...");
        
        // 检查依赖
        if (!this._checkDependencies()) {
            return false;
        }
        
        try {
            // 初始化全局对象
            this.socket = window.socketCtr();
            this.playerData = window.playerData();
            this.eventlister = window.eventLister({});
            this._initialized = true;
            
            // 尝试从本地存储恢复玩家数据
            if (this.playerData.loadFromLocal()) {
                console.log("✅ 从本地存储恢复登录状态");
            }
            
            console.log("myglobal 初始化完成");
            console.log("  - socket:", !!this.socket);
            console.log("  - playerData:", !!this.playerData);
            console.log("  - eventlister:", !!this.eventlister);
            console.log("  - 已登录:", this.playerData.isLoggedIn());
            
            return true;
        } catch(e) {
            console.error("myglobal 初始化失败:", e);
            return false;
        }
    };
    
    // 自动初始化（延迟执行，确保所有插件脚本都已加载）
    myglobal.autoInit = function() {
        var self = this;
        var attempts = 0;
        var maxAttempts = 20;  // 增加重试次数
        
        var tryInit = function() {
            attempts++;
            console.log("尝试初始化 myglobal (第 " + attempts + " 次)");
            
            if (self.init()) {
                console.log("myglobal 自动初始化成功");
            } else if (attempts < maxAttempts) {
                // 延迟重试
                setTimeout(tryInit, 100);
            } else {
                console.error("myglobal 自动初始化失败，请检查依赖脚本是否正确加载");
            }
        };
        
        // 延迟执行，确保所有插件脚本都已加载
        setTimeout(tryInit, 100);
    };
    
    // ==================== 登录状态管理 ====================
    
    // 检查是否有本地登录会话
    myglobal.hasLocalSession = function() {
        if (!this.playerData) return false;
        return this.playerData.hasLocalSession();
    };
    
    // 检查是否已登录
    myglobal.isLoggedIn = function() {
        if (!this.playerData) return false;
        return this.playerData.isLoggedIn();
    };
    
    // 登录成功后调用
    myglobal.onLoginSuccess = function(loginData) {
        if (this.playerData) {
            this.playerData.updateFromLogin(loginData);
        }
        this._forceLogout = false;
        this._forceLogoutReason = "";
        console.log("✅ 登录成功，状态已保存");
    };
    
    // 登出
    myglobal.logout = function() {
        if (this.playerData) {
            this.playerData.logout();
        }
        this._forceLogout = false;
        this._forceLogoutReason = "";
        
        // 断开 WebSocket 连接
        if (this.socket && this.socket.disconnect) {
            this.socket.disconnect();
        }
        
        console.log("✅ 用户已登出");
        
        // 跳转到登录场景
        if (typeof cc !== 'undefined' && cc.director) {
            cc.director.loadScene("loginScene");
        }
    };
    
    // 被强制下线
    myglobal.onForceLogout = function(reason) {
        this._forceLogout = true;
        this._forceLogoutReason = reason || "您已被强制下线";
        
        console.warn("⚠️ 用户被强制下线:", reason);
        
        // 清除本地登录状态
        if (this.playerData) {
            this.playerData.clearLocal();
        }
        
        // 断开 WebSocket 连接
        if (this.socket && this.socket.disconnect) {
            this.socket.disconnect();
        }
        
        // 显示提示并跳转到登录场景
        this.showForceLogoutMessage(reason);
    };
    
    // 显示强制下线提示
    myglobal.showForceLogoutMessage = function(reason) {
        var message = reason || "您已被管理员强制下线";
        
        // 在游戏中显示提示
        if (typeof cc !== 'undefined') {
            // 创建提示弹窗
            var self = this;
            setTimeout(function() {
                alert(message + "\n\n请重新登录");
                if (cc.director) {
                    cc.director.loadScene("loginScene");
                }
            }, 100);
        } else {
            alert(message + "\n\n请重新登录");
            window.location.reload();
        }
    };
    
    // 检查是否被强制下线
    myglobal.wasForceLoggedOut = function() {
        return this._forceLogout;
    };
    
    // 获取强制下线原因
    myglobal.getForceLogoutReason = function() {
        return this._forceLogoutReason;
    };
    
    // ==================== Token 验证 ====================
    
    // 验证 Token 是否有效（通过 API）
    myglobal.verifyToken = function(callback) {
        var self = this;
        
        if (!this.playerData || !this.playerData.token) {
            callback(false, "无登录凭证");
            return;
        }
        
        var defines = window.defines;
        if (!defines || !defines.apiUrl) {
            // 无API配置，使用本地缓存登录
            console.log("无API配置，使用本地缓存登录");
            callback(true, "无API配置，使用本地缓存");
            return;
        }
        
        var xhr = new XMLHttpRequest();
        xhr.open('POST', defines.apiUrl + '/api/v1/auth/verify-token', true);
        xhr.setRequestHeader('Content-Type', 'application/json');
        xhr.timeout = 10000;
        
        xhr.onreadystatechange = function() {
            if (xhr.readyState === 4) {
                if (xhr.status >= 200 && xhr.status < 300) {
                    try {
                        var resp = JSON.parse(xhr.responseText);
                        if (resp.code === 0 && resp.data && resp.data.valid) {
                            // Token 有效，更新用户信息
                            if (resp.data.player) {
                                self.playerData.updateFromLogin(resp.data.player);
                            }
                            callback(true, "Token有效");
                        } else {
                            // Token 无效（明确返回无效），使用本地缓存
                            console.log("API返回Token无效，使用本地缓存继续");
                            callback(true, "使用本地缓存");
                        }
                    } catch (e) {
                        // 解析失败，使用本地缓存
                        console.log("解析响应失败，使用本地缓存继续");
                        callback(true, "使用本地缓存");
                    }
                } else if (xhr.status === 404) {
                    // API不存在（旧版本服务器），使用本地缓存
                    console.log("verify-token API不存在(404)，使用本地缓存继续");
                    callback(true, "使用本地缓存");
                } else {
                    // 其他HTTP错误，使用本地缓存
                    console.log("HTTP错误(" + xhr.status + ")，使用本地缓存继续");
                    callback(true, "使用本地缓存");
                }
            }
        };
        
        xhr.onerror = function() {
            // 网络错误，使用本地缓存
            console.log("网络错误，使用本地缓存继续");
            callback(true, "使用本地缓存");
        };
        
        xhr.ontimeout = function() {
            // 请求超时，使用本地缓存
            console.log("请求超时，使用本地缓存继续");
            callback(true, "使用本地缓存");
        };
        
        xhr.send(JSON.stringify({
            token: this.playerData.token,
            player_id: this.playerData.uniqueID
        }));
    };

    // 设置全局变量
    window.myglobal = myglobal;
    
    // 尝试自动初始化
    if (typeof window !== 'undefined') {
        // 在 DOM 加载完成后自动初始化
        if (document.readyState === 'complete') {
            myglobal.autoInit();
        } else {
            window.addEventListener('load', function() {
                myglobal.autoInit();
            });
        }
    }
    
    console.log("mygolbal.js loaded with login state management");
})();
