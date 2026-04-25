// 玩家数据 - 纯全局变量方式
// 支持本地存储，持久化登录状态

var getRandomStr = function (count) {
    var str = '';
    for (var i = 0; i < count; i++) {
        str += Math.floor(Math.random() * 10);
    }
    return str;
};

// 本地存储键名
var STORAGE_KEY = 'ddz_player_data';
var TOKEN_KEY = 'ddz_auth_token';

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

    // ==================== 本地存储方法 ====================

    // 保存到本地存储
    that.saveToLocal = function() {
        try {
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
                savedAt: Date.now()
            };
            localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
            if (this.token) {
                localStorage.setItem(TOKEN_KEY, this.token);
            }
            console.log("✅ 玩家数据已保存到本地存储");
            return true;
        } catch (e) {
            console.error("保存玩家数据失败:", e);
            return false;
        }
    };

    // 从本地存储加载
    that.loadFromLocal = function() {
        try {
            var dataStr = localStorage.getItem(STORAGE_KEY);
            if (!dataStr) {
                console.log("本地无存储的玩家数据");
                return false;
            }

            var data = JSON.parse(dataStr);
            
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
            this.token = data.token || localStorage.getItem(TOKEN_KEY) || "";
            this.phone = data.phone || "";
            this.loginType = data.loginType || 0;

            console.log("✅ 从本地存储恢复玩家数据:", this.nickName);
            return true;
        } catch (e) {
            console.error("加载玩家数据失败:", e);
            return false;
        }
    };

    // 清除本地存储
    that.clearLocal = function() {
        try {
            localStorage.removeItem(STORAGE_KEY);
            localStorage.removeItem(TOKEN_KEY);
            console.log("✅ 已清除本地玩家数据");
        } catch (e) {
            console.error("清除玩家数据失败:", e);
        }
    };

    // 检查是否已登录（有token）
    that.isLoggedIn = function() {
        return !!this.token && this.token.length > 0;
    };

    // 检查本地是否有保存的登录信息
    that.hasLocalSession = function() {
        try {
            var dataStr = localStorage.getItem(STORAGE_KEY);
            if (!dataStr) return false;
            
            var data = JSON.parse(dataStr);
            if (!data.token) return false;
            
            // 检查是否过期
            var savedAt = data.savedAt || 0;
            var expireTime = 7 * 24 * 60 * 60 * 1000; // 7天
            if (Date.now() - savedAt > expireTime) {
                return false;
            }
            
            return true;
        } catch (e) {
            return false;
        }
    };

    // 登出
    that.logout = function() {
        this.token = "";
        this.clearLocal();
        console.log("✅ 用户已登出");
    };

    // 更新玩家信息（登录成功后调用）
    that.updateFromLogin = function(loginData) {
        if (!loginData) return;
        
        this.uniqueID = loginData.uniqueID || loginData.player_id || this.uniqueID;
        this.accountID = loginData.accountID || loginData.account_id || this.accountID;
        this.nickName = loginData.nickName || loginData.nickname || this.nickName;
        this.avatarUrl = loginData.avatarUrl || loginData.avatar || this.avatarUrl;
        this.gobal_count = loginData.goldCount || loginData.gold || this.gobal_count;
        this.token = loginData.token || this.token;
        this.loginType = loginData.loginType || this.loginType;
        
        if (loginData.phone) {
            this.phone = loginData.phone;
        }

        // 保存到本地
        this.saveToLocal();
        
        console.log("✅ 玩家信息已更新:", this.nickName);
    };

    return that;
};

console.log("player.js loaded with localStorage support");
