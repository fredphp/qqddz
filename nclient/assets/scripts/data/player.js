/**
 * 玩家数据管理
 * 负责玩家信息的存储、更新和管理
 */

var PlayerData = cc.Class({
    extends: cc.Component,

    properties: {
        // 玩家ID
        playerId: '',
        // 玩家名称
        playerName: '',
        // 玩家头像URL
        avatar: '',
        // 金币数量
        coins: {
            default: 0,
            type: cc.Integer
        },
        // 钻石数量
        diamonds: {
            default: 0,
            type: cc.Integer
        },
        // 等级
        level: {
            default: 1,
            type: cc.Integer
        },
        // 经验值
        exp: {
            default: 0,
            type: cc.Integer
        },
        // 胜利场次
        winCount: {
            default: 0,
            type: cc.Integer
        },
        // 失败场次
        loseCount: {
            default: 0,
            type: cc.Integer
        },
        // 登录Token
        token: '',
        // 是否已登录
        isLogin: false
    },

    statics: {
        instance: null,

        /**
         * 获取单例实例
         */
        getInstance: function() {
            if (!PlayerData.instance) {
                var node = new cc.Node('PlayerData');
                cc.game.addPersistRootNode(node);
                PlayerData.instance = node.addComponent(PlayerData);
                PlayerData.instance.init();
            }
            return PlayerData.instance;
        }
    },

    // 玩家完整数据
    data: null,
    // 数据变更回调
    onChangeCallbacks: [],

    onLoad: function() {
        // 初始化数据
        this.init();
    },

    onDestroy: function() {
        this.clearCallbacks();
    },

    /**
     * 初始化玩家数据
     */
    init: function() {
        this.data = {
            id: '',
            name: '',
            avatar: '',
            coins: 0,
            diamonds: 0,
            level: 1,
            exp: 0,
            winCount: 0,
            loseCount: 0,
            token: '',
            isLogin: false,
            vipLevel: 0,
            createTime: 0,
            lastLoginTime: 0
        };
        
        this.onChangeCallbacks = [];
        
        cc.log('[PlayerData] 初始化完成');
    },

    /**
     * 重置玩家数据
     */
    reset: function() {
        this.data = {
            id: '',
            name: '',
            avatar: '',
            coins: 0,
            diamonds: 0,
            level: 1,
            exp: 0,
            winCount: 0,
            loseCount: 0,
            token: '',
            isLogin: false,
            vipLevel: 0,
            createTime: 0,
            lastLoginTime: 0
        };
        
        this.playerId = '';
        this.playerName = '';
        this.avatar = '';
        this.coins = 0;
        this.diamonds = 0;
        this.level = 1;
        this.exp = 0;
        this.winCount = 0;
        this.loseCount = 0;
        this.token = '';
        this.isLogin = false;
        
        cc.log('[PlayerData] 数据已重置');
        
        this.notifyChange('reset');
    },

    /**
     * 设置玩家数据
     * @param {Object} data - 玩家数据
     */
    setData: function(data) {
        if (!data) return;

        for (var key in data) {
            if (data.hasOwnProperty(key) && this.data.hasOwnProperty(key)) {
                this.data[key] = data[key];
            }
        }

        // 同步到属性
        this.syncProperties();
        
        cc.log('[PlayerData] 数据已更新:', JSON.stringify(this.data));
        
        this.notifyChange('update');
    },

    /**
     * 获取玩家数据
     * @returns {Object} 玩家数据
     */
    getData: function() {
        return this.data;
    },

    /**
     * 同步数据到属性
     */
    syncProperties: function() {
        this.playerId = this.data.id;
        this.playerName = this.data.name;
        this.avatar = this.data.avatar;
        this.coins = this.data.coins;
        this.diamonds = this.data.diamonds;
        this.level = this.data.level;
        this.exp = this.data.exp;
        this.winCount = this.data.winCount;
        this.loseCount = this.data.loseCount;
        this.token = this.data.token;
        this.isLogin = this.data.isLogin;
    },

    /**
     * 获取玩家ID
     * @returns {string} 玩家ID
     */
    getId: function() {
        return this.data.id;
    },

    /**
     * 获取玩家名称
     * @returns {string} 玩家名称
     */
    getName: function() {
        return this.data.name;
    },

    /**
     * 设置玩家名称
     * @param {string} name - 玩家名称
     */
    setName: function(name) {
        this.data.name = name;
        this.playerName = name;
        this.notifyChange('name');
    },

    /**
     * 获取头像URL
     * @returns {string} 头像URL
     */
    getAvatar: function() {
        return this.data.avatar;
    },

    /**
     * 设置头像URL
     * @param {string} avatar - 头像URL
     */
    setAvatar: function(avatar) {
        this.data.avatar = avatar;
        this.avatar = avatar;
        this.notifyChange('avatar');
    },

    /**
     * 获取金币数量
     * @returns {number} 金币数量
     */
    getCoins: function() {
        return this.data.coins;
    },

    /**
     * 设置金币数量
     * @param {number} coins - 金币数量
     */
    setCoins: function(coins) {
        this.data.coins = coins;
        this.coins = coins;
        this.notifyChange('coins');
    },

    /**
     * 增加金币
     * @param {number} amount - 增加数量
     */
    addCoins: function(amount) {
        this.setCoins(this.data.coins + amount);
    },

    /**
     * 减少金币
     * @param {number} amount - 减少数量
     * @returns {boolean} 是否成功
     */
    reduceCoins: function(amount) {
        if (this.data.coins < amount) {
            return false;
        }
        this.setCoins(this.data.coins - amount);
        return true;
    },

    /**
     * 获取钻石数量
     * @returns {number} 钻石数量
     */
    getDiamonds: function() {
        return this.data.diamonds;
    },

    /**
     * 设置钻石数量
     * @param {number} diamonds - 钻石数量
     */
    setDiamonds: function(diamonds) {
        this.data.diamonds = diamonds;
        this.diamonds = diamonds;
        this.notifyChange('diamonds');
    },

    /**
     * 增加钻石
     * @param {number} amount - 增加数量
     */
    addDiamonds: function(amount) {
        this.setDiamonds(this.data.diamonds + amount);
    },

    /**
     * 减少钻石
     * @param {number} amount - 减少数量
     * @returns {boolean} 是否成功
     */
    reduceDiamonds: function(amount) {
        if (this.data.diamonds < amount) {
            return false;
        }
        this.setDiamonds(this.data.diamonds - amount);
        return true;
    },

    /**
     * 获取等级
     * @returns {number} 等级
     */
    getLevel: function() {
        return this.data.level;
    },

    /**
     * 设置等级
     * @param {number} level - 等级
     */
    setLevel: function(level) {
        this.data.level = level;
        this.level = level;
        this.notifyChange('level');
    },

    /**
     * 增加经验值
     * @param {number} amount - 经验值数量
     */
    addExp: function(amount) {
        this.data.exp += amount;
        this.exp = this.data.exp;
        
        // 检查是否升级（每100经验升一级）
        var expForNextLevel = this.data.level * 100;
        while (this.data.exp >= expForNextLevel) {
            this.data.exp -= expForNextLevel;
            this.data.level++;
            expForNextLevel = this.data.level * 100;
        }
        
        this.level = this.data.level;
        this.notifyChange('exp');
        this.notifyChange('level');
    },

    /**
     * 获取胜率
     * @returns {number} 胜率（百分比）
     */
    getWinRate: function() {
        var total = this.data.winCount + this.data.loseCount;
        if (total === 0) return 0;
        return Math.round((this.data.winCount / total) * 100);
    },

    /**
     * 增加胜利场次
     */
    addWin: function() {
        this.data.winCount++;
        this.winCount = this.data.winCount;
        this.notifyChange('winCount');
    },

    /**
     * 增加失败场次
     */
    addLose: function() {
        this.data.loseCount++;
        this.loseCount = this.data.loseCount;
        this.notifyChange('loseCount');
    },

    /**
     * 获取Token
     * @returns {string} Token
     */
    getToken: function() {
        return this.data.token;
    },

    /**
     * 设置Token
     * @param {string} token - Token
     */
    setToken: function(token) {
        this.data.token = token;
        this.token = token;
        
        // 保存到本地存储
        if (typeof myglobal !== 'undefined') {
            myglobal.setLocalData(GameConfig.STORAGE_KEYS.USER_TOKEN, token);
        }
    },

    /**
     * 检查是否已登录
     * @returns {boolean} 是否已登录
     */
    isLoggedIn: function() {
        return this.data.isLogin && this.data.token !== '';
    },

    /**
     * 设置登录状态
     * @param {boolean} isLogin - 是否已登录
     */
    setLogin: function(isLogin) {
        this.data.isLogin = isLogin;
        this.isLogin = isLogin;
        
        if (isLogin) {
            this.data.lastLoginTime = Date.now();
        }
        
        this.notifyChange('login');
    },

    /**
     * 登出
     */
    logout: function() {
        this.reset();
        
        // 清除本地存储
        if (typeof myglobal !== 'undefined') {
            myglobal.removeLocalData(GameConfig.STORAGE_KEYS.USER_TOKEN);
            myglobal.removeLocalData(GameConfig.STORAGE_KEYS.USER_INFO);
        }
        
        cc.log('[PlayerData] 已登出');
    },

    /**
     * 从本地存储加载数据
     */
    loadFromStorage: function() {
        if (typeof myglobal === 'undefined') return;
        
        var token = myglobal.getLocalData(GameConfig.STORAGE_KEYS.USER_TOKEN);
        if (token) {
            this.data.token = token;
            this.token = token;
        }
        
        var userInfo = myglobal.getLocalData(GameConfig.STORAGE_KEYS.USER_INFO);
        if (userInfo) {
            this.setData(userInfo);
        }
        
        cc.log('[PlayerData] 从本地存储加载完成');
    },

    /**
     * 保存数据到本地存储
     */
    saveToStorage: function() {
        if (typeof myglobal === 'undefined') return;
        
        var saveData = {
            id: this.data.id,
            name: this.data.name,
            avatar: this.data.avatar,
            coins: this.data.coins,
            diamonds: this.data.diamonds,
            level: this.data.level,
            exp: this.data.exp,
            winCount: this.data.winCount,
            loseCount: this.data.loseCount
        };
        
        myglobal.setLocalData(GameConfig.STORAGE_KEYS.USER_INFO, saveData);
        
        cc.log('[PlayerData] 已保存到本地存储');
    },

    /**
     * 注册数据变更回调
     * @param {Function} callback - 回调函数
     * @param {Object} target - 目标对象
     */
    onChange: function(callback, target) {
        this.onChangeCallbacks.push({
            callback: callback,
            target: target
        });
    },

    /**
     * 取消数据变更回调
     * @param {Function} callback - 回调函数
     * @param {Object} target - 目标对象
     */
    offChange: function(callback, target) {
        for (var i = this.onChangeCallbacks.length - 1; i >= 0; i--) {
            if (this.onChangeCallbacks[i].callback === callback && 
                this.onChangeCallbacks[i].target === target) {
                this.onChangeCallbacks.splice(i, 1);
            }
        }
    },

    /**
     * 清除所有回调
     */
    clearCallbacks: function() {
        this.onChangeCallbacks = [];
    },

    /**
     * 通知数据变更
     * @param {string} changeType - 变更类型
     */
    notifyChange: function(changeType) {
        for (var i = 0; i < this.onChangeCallbacks.length; i++) {
            var cb = this.onChangeCallbacks[i];
            cb.callback.call(cb.target, changeType, this.data);
        }
    },

    /**
     * 转换为JSON字符串
     * @returns {string} JSON字符串
     */
    toJson: function() {
        return JSON.stringify(this.data);
    },

    /**
     * 从JSON字符串解析
     * @param {string} jsonStr - JSON字符串
     */
    fromJson: function(jsonStr) {
        try {
            var data = JSON.parse(jsonStr);
            this.setData(data);
        } catch (e) {
            cc.error('[PlayerData] JSON解析失败:', e);
        }
    }
});

// 导出模块
if (typeof module !== 'undefined' && module.exports) {
    module.exports = PlayerData;
}

// 挂载到全局
if (typeof window !== 'undefined') {
    window.PlayerData = PlayerData;
}
