// 玩家数据 - 纯全局变量方式
// 支持跨平台本地存储，持久化登录状态
// 兼容 Web 浏览器、iOS App、Android App

var getRandomStr = function (count) {
    var str = '';
    for (var i = 0; i < count; i++) {
        str += Math.floor(Math.random() * 10);
    }
    return str;
};

// 玩家数据管理
window.playerData = function(){
    var that = {};

    // 默认值
    that.uniqueID = "1" + getRandomStr(6);
    that.accountID = "2" + getRandomStr(6);
    that.nickName = "玩家" + getRandomStr(3);
    var str = "avatar_" + (Math.floor(Math.random() * 3) + 1);
    that.avatarUrl = str;
    that.gobal_count = 0;
    that.master_accountid = 0;
    that.bottom = 100;
    that.rate = 1;
    that.housemanageid = "";
    that.token = "";  // 登录令牌
    that.phone = "";  // 手机号
    that.loginType = 0; // 登录类型: 1-手机号, 2-微信, 3-游客
    that.lastSaveTime = 0; // 最后保存时间

    // ==================== 获取存储工具 ====================
    
    var getStorage = function() {
        // 优先使用跨平台存储工具
        if (typeof window.StorageUtil !== 'undefined') {
            return window.StorageUtil;
        }
        // 降级：简单封装 localStorage
        return {
            savePlayerData: function(data) {
                try {
                    localStorage.setItem('ddz_player_data', JSON.stringify(data));
                    return true;
                } catch (e) {
                    console.error("保存失败:", e);
                    return false;
                }
            },
            loadPlayerData: function() {
                try {
                    var dataStr = localStorage.getItem('ddz_player_data');
                    return dataStr ? JSON.parse(dataStr) : null;
                } catch (e) {
                    return null;
                }
            },
            clearPlayerSession: function() {
                localStorage.removeItem('ddz_player_data');
                localStorage.removeItem('ddz_auth_token');
            },
            setForceLogout: function(reason) {
                localStorage.setItem('ddz_force_logout', JSON.stringify({
                    forced: true,
                    reason: reason,
                    timestamp: Date.now()
                }));
            },
            getForceLogout: function() {
                try {
                    var data = JSON.parse(localStorage.getItem('ddz_force_logout'));
                    if (!data || !data.forced) return null;
                    // 24小时过期
                    if (Date.now() - (data.timestamp || 0) > 24 * 60 * 60 * 1000) {
                        localStorage.removeItem('ddz_force_logout');
                        return null;
                    }
                    return data;
                } catch (e) {
                    return null;
                }
            },
            clearForceLogout: function() {
                localStorage.removeItem('ddz_force_logout');
            },
            hasLocalSession: function() {
                var data = this.loadPlayerData();
                if (!data || !data.token) return false;
                var expireTime = 7 * 24 * 60 * 60 * 1000;
                if (Date.now() - (data.savedAt || 0) > expireTime) return false;
                return true;
            }
        };
    };

    // ==================== 本地存储方法 ====================

    // 保存到本地存储（跨平台）
    that.saveToLocal = function() {
        var storage = getStorage();
        
        var data = {
            uniqueID: this.uniqueID,
            accountID: this.accountID,
            nickName: this.nickName,
            avatarUrl: this.avatarUrl,
            gobal_count: this.gobal_count,
            master_accountid: this.master_accountid,
            bottom: this.bottom,
            rate: this.rate,
            housemanageid: this.housemanageid,
            token: this.token,
            phone: this.phone,
            loginType: this.loginType,
            savedAt: Date.now(),
            version: 2
        };
        
        var result = storage.savePlayerData(data);
        if (result) {
            this.lastSaveTime = Date.now();
            console.log("✅ 玩家数据已保存到本地存储");
            
            // 打印存储类型
            if (typeof window.StorageUtil !== 'undefined') {
                console.log("   存储类型:", window.StorageUtil.getStorageType());
                console.log("   是否原生App:", window.StorageUtil.isNativeApp());
            }
        }
        return result;
    };

    // 从本地存储加载（跨平台）
    that.loadFromLocal = function() {
        var storage = getStorage();
        var data = storage.loadPlayerData();
        
        if (!data) {
            console.log("本地无存储的玩家数据");
            return false;
        }

        // 检查数据是否过期（7天）
        var savedAt = data.savedAt || 0;
        var expireTime = 7 * 24 * 60 * 60 * 1000; // 7天
        if (Date.now() - savedAt > expireTime) {
            console.log("本地玩家数据已过期，清除");
            this.clearLocal();
            return false;
        }

        // 恢复数据
        this.uniqueID = data.uniqueID || this.uniqueID;
        this.accountID = data.accountID || this.accountID;
        this.nickName = data.nickName || this.nickName;
        this.avatarUrl = data.avatarUrl || this.avatarUrl;
        this.gobal_count = data.gobal_count || 0;
        this.master_accountid = data.master_accountid || 0;
        this.bottom = data.bottom || 100;
        this.rate = data.rate || 1;
        this.housemanageid = data.housemanageid || "";
        this.token = data.token || "";
        this.phone = data.phone || "";
        this.loginType = data.loginType || 0;

        console.log("✅ 从本地存储恢复玩家数据:", this.nickName);
        console.log("   Token存在:", !!this.token);
        
        return true;
    };

    // 清除本地存储
    that.clearLocal = function() {
        var storage = getStorage();
        storage.clearPlayerSession();
        
        // 重置内存数据
        this.token = "";
        this.phone = "";
        this.loginType = 0;
        
        console.log("✅ 已清除本地玩家数据");
    };

    // 检查是否已登录（有token）
    that.isLoggedIn = function() {
        return !!this.token && this.token.length > 0;
    };

    // 检查本地是否有保存的登录信息
    that.hasLocalSession = function() {
        var storage = getStorage();
        return storage.hasLocalSession();
    };

    // 登出
    that.logout = function() {
        // 调用服务端登出接口
        this.callLogoutAPI();
        
        // 清除本地状态
        this.token = "";
        this.clearLocal();
        console.log("✅ 用户已登出");
    };
    
    // 调用服务端登出API
    that.callLogoutAPI = function() {
        var defines = window.defines;
        if (!defines || !defines.apiUrl || !this.token) {
            return;
        }
        
        try {
            var xhr = new XMLHttpRequest();
            xhr.open('POST', defines.apiUrl + '/api/v1/auth/logout', true);
            xhr.setRequestHeader('Content-Type', 'application/json');
            xhr.timeout = 5000;
            xhr.send(JSON.stringify({ token: this.token }));
        } catch (e) {
            console.warn("调用登出API失败:", e);
        }
    };

    // 更新玩家信息（登录成功后调用）
    that.updateFromLogin = function(loginData) {
        if (!loginData) return;
        
        this.uniqueID = loginData.uniqueID || loginData.player_id || this.uniqueID;
        this.accountID = loginData.accountID || loginData.account_id || this.accountID;
        this.nickName = loginData.nickName || loginData.nickname || this.nickName;
        this.avatarUrl = loginData.avatarUrl || loginData.avatar || this.avatarUrl;
        this.gobal_count = loginData.goldCount || loginData.gold || loginData.goldcount || this.gobal_count;
        this.token = loginData.token || this.token;
        this.loginType = loginData.loginType || this.loginType;
        
        if (loginData.phone) {
            this.phone = loginData.phone;
        }
        
        // 清除强制下线标记（登录成功后）
        var storage = getStorage();
        storage.clearForceLogout();

        // 保存到本地
        this.saveToLocal();
        
        console.log("✅ 玩家信息已更新:", this.nickName);
        console.log("   uniqueID:", this.uniqueID);
        console.log("   accountID:", this.accountID);
        console.log("   Token:", this.token ? "已保存" : "无");
    };

    // ==================== 强制下线相关 ====================
    
    // 设置强制下线标记
    that.setForceLogout = function(reason) {
        var storage = getStorage();
        storage.setForceLogout(reason);
        console.log("⚠️ 已设置强制下线标记:", reason);
    };
    
    // 检查是否被强制下线
    that.wasForceLoggedOut = function() {
        var storage = getStorage();
        var data = storage.getForceLogout();
        return data !== null;
    };
    
    // 获取强制下线原因
    that.getForceLogoutReason = function() {
        var storage = getStorage();
        var data = storage.getForceLogout();
        return data ? data.reason : "";
    };
    
    // 清除强制下线标记
    that.clearForceLogout = function() {
        var storage = getStorage();
        storage.clearForceLogout();
    };

    // ==================== 数据同步 ====================
    
    // 定期自动保存（游戏过程中）
    that.autoSave = function() {
        var now = Date.now();
        // 每 30 秒自动保存一次
        if (now - this.lastSaveTime > 30000) {
            this.saveToLocal();
        }
    };
    
    // 更新金币
    that.updateGold = function(amount) {
        this.gobal_count += amount;
        this.saveToLocal();
    };
    
    // 设置金币
    this.setGold = function(amount) {
        this.gobal_count = amount;
        this.saveToLocal();
    };

    return that;
};

console.log("player.js loaded with cross-platform storage support");
