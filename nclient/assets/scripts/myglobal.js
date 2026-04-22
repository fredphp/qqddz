/**
 * 全局管理器
 * 负责全局数据管理、事件分发、WebSocket通信等
 */
window.myglobal = {
    // 玩家数据
    playerData: null,
    
    // Socket连接
    socket: null,
    
    // 房间数据
    roomData: null,
    
    // 游戏配置
    config: {
        serverUrl: 'ws://localhost:3003',
        httpUrl: 'http://localhost:3000',
        heartbeatInterval: 30000,
        reconnectInterval: 3000,
        maxReconnectAttempts: 5
    },
    
    // 事件监听器
    eventListeners: {},
    
    // 是否已初始化
    initialized: false,

    /**
     * 初始化全局管理器
     */
    init: function() {
        if (this.initialized) {
            return;
        }
        this.initialized = true;
        cc.log('[myglobal] 初始化全局管理器');
        
        // 初始化玩家数据
        this.playerData = {
            id: '',
            name: '',
            avatar: '',
            coins: 0,
            diamonds: 0,
            level: 1,
            exp: 0,
            winCount: 0,
            loseCount: 0,
            token: ''
        };
        
        // 初始化房间数据
        this.roomData = {
            roomId: '',
            players: [],
            gameState: 'waiting', // waiting, playing, finished
            currentRound: 0,
            maxRounds: 1,
            ownerId: ''
        };
    },

    /**
     * 重置玩家数据
     */
    resetPlayerData: function() {
        this.playerData = {
            id: '',
            name: '',
            avatar: '',
            coins: 0,
            diamonds: 0,
            level: 1,
            exp: 0,
            winCount: 0,
            loseCount: 0,
            token: ''
        };
        cc.log('[myglobal] 玩家数据已重置');
    },

    /**
     * 重置房间数据
     */
    resetRoomData: function() {
        this.roomData = {
            roomId: '',
            players: [],
            gameState: 'waiting',
            currentRound: 0,
            maxRounds: 1,
            ownerId: ''
        };
        cc.log('[myglobal] 房间数据已重置');
    },

    /**
     * 更新玩家数据
     * @param {Object} data - 玩家数据
     */
    updatePlayerData: function(data) {
        if (!data) return;
        
        for (var key in data) {
            if (data.hasOwnProperty(key)) {
                this.playerData[key] = data[key];
            }
        }
        cc.log('[myglobal] 更新玩家数据:', JSON.stringify(this.playerData));
    },

    /**
     * 更新房间数据
     * @param {Object} data - 房间数据
     */
    updateRoomData: function(data) {
        if (!data) return;
        
        for (var key in data) {
            if (data.hasOwnProperty(key)) {
                this.roomData[key] = data[key];
            }
        }
        cc.log('[myglobal] 更新房间数据:', JSON.stringify(this.roomData));
    },

    /**
     * 获取服务器URL
     */
    getServerUrl: function() {
        return this.config.serverUrl;
    },

    /**
     * 获取HTTP URL
     */
    getHttpUrl: function() {
        return this.config.httpUrl;
    },

    /**
     * 显示提示信息
     * @param {string} message - 提示信息
     * @param {number} duration - 显示时长（秒）
     */
    showToast: function(message, duration) {
        duration = duration || 2;
        cc.log('[myglobal] Toast:', message);
        
        // 尝试获取当前场景
        var scene = cc.director.getScene();
        if (!scene) {
            cc.warn('[myglobal] 无法获取当前场景');
            return;
        }
        
        // 创建提示节点
        var toastNode = new cc.Node('ToastNode');
        toastNode.zIndex = 9999;
        
        // 添加背景
        var bgNode = new cc.Node('Background');
        bgNode.color = cc.color(0, 0, 0, 180);
        var bgSprite = bgNode.addComponent(cc.Sprite);
        bgSprite.type = cc.Sprite.Type.SLICED;
        
        // 添加标签
        var labelNode = new cc.Node('Label');
        var label = labelNode.addComponent(cc.Label);
        label.string = message;
        label.fontSize = 24;
        label.lineHeight = 30;
        label.overflow = cc.Label.Overflow.NONE;
        label.horizontalAlign = cc.Label.HorizontalAlign.CENTER;
        label.verticalAlign = cc.Label.VerticalAlign.CENTER;
        
        // 设置节点尺寸
        var labelSize = labelNode.getContentSize();
        var bgWidth = Math.max(labelSize.width + 40, 200);
        var bgHeight = Math.max(labelSize.height + 20, 50);
        bgNode.setContentSize(bgWidth, bgHeight);
        
        // 添加到场景
        toastNode.addChild(bgNode);
        toastNode.addChild(labelNode);
        scene.addChild(toastNode);
        
        // 设置位置到屏幕中心偏下
        var canvas = scene.getComponentInChildren(cc.Canvas);
        if (canvas) {
            var visibleSize = cc.view.getVisibleSize();
            toastNode.setPosition(0, -visibleSize.height * 0.3);
        }
        
        // 自动移除
        toastNode.runAction(cc.sequence(
            cc.delayTime(duration),
            cc.fadeOut(0.3),
            cc.removeSelf()
        ));
    },

    /**
     * 显示加载动画
     * @param {string} message - 加载提示信息
     */
    showLoading: function(message) {
        message = message || '加载中...';
        cc.log('[myglobal] Loading:', message);
        
        var scene = cc.director.getScene();
        if (!scene) return;
        
        // 检查是否已存在
        var existingNode = scene.getChildByName('LoadingNode');
        if (existingNode) {
            return;
        }
        
        var loadingNode = new cc.Node('LoadingNode');
        loadingNode.zIndex = 10000;
        
        // 半透明背景
        var maskNode = new cc.Node('Mask');
        maskNode.color = cc.color(0, 0, 0, 150);
        var maskSprite = maskNode.addComponent(cc.Sprite);
        maskSprite.type = cc.Sprite.Type.SLICED;
        var visibleSize = cc.view.getVisibleSize();
        maskNode.setContentSize(visibleSize.width * 2, visibleSize.height * 2);
        loadingNode.addChild(maskNode);
        
        // 提示文字
        var labelNode = new cc.Node('Label');
        var label = labelNode.addComponent(cc.Label);
        label.string = message;
        label.fontSize = 28;
        label.lineHeight = 36;
        loadingNode.addChild(labelNode);
        
        scene.addChild(loadingNode);
    },

    /**
     * 隐藏加载动画
     */
    hideLoading: function() {
        var scene = cc.director.getScene();
        if (!scene) return;
        
        var loadingNode = scene.getChildByName('LoadingNode');
        if (loadingNode) {
            loadingNode.removeFromParent(true);
        }
    },

    /**
     * 注册事件监听
     * @param {string} eventName - 事件名称
     * @param {Function} callback - 回调函数
     * @param {Object} target - 目标对象
     */
    on: function(eventName, callback, target) {
        if (!this.eventListeners[eventName]) {
            this.eventListeners[eventName] = [];
        }
        this.eventListeners[eventName].push({
            callback: callback,
            target: target
        });
    },

    /**
     * 取消事件监听
     * @param {string} eventName - 事件名称
     * @param {Function} callback - 回调函数
     * @param {Object} target - 目标对象
     */
    off: function(eventName, callback, target) {
        var listeners = this.eventListeners[eventName];
        if (!listeners) return;
        
        for (var i = listeners.length - 1; i >= 0; i--) {
            if (listeners[i].callback === callback && listeners[i].target === target) {
                listeners.splice(i, 1);
            }
        }
    },

    /**
     * 触发事件
     * @param {string} eventName - 事件名称
     * @param {any} data - 事件数据
     */
    emit: function(eventName, data) {
        var listeners = this.eventListeners[eventName];
        if (!listeners || listeners.length === 0) return;
        
        for (var i = 0; i < listeners.length; i++) {
            var listener = listeners[i];
            listener.callback.call(listener.target, data);
        }
    },

    /**
     * 清除所有事件监听
     */
    clearAllListeners: function() {
        this.eventListeners = {};
    },

    /**
     * 存储数据到本地
     * @param {string} key - 键名
     * @param {any} value - 值
     */
    setLocalData: function(key, value) {
        try {
            var str = JSON.stringify(value);
            cc.sys.localStorage.setItem(key, str);
        } catch (e) {
            cc.error('[myglobal] 存储数据失败:', e);
        }
    },

    /**
     * 从本地读取数据
     * @param {string} key - 键名
     * @param {any} defaultValue - 默认值
     * @returns {any} 读取的值
     */
    getLocalData: function(key, defaultValue) {
        try {
            var str = cc.sys.localStorage.getItem(key);
            if (str === null || str === '') {
                return defaultValue;
            }
            return JSON.parse(str);
        } catch (e) {
            cc.error('[myglobal] 读取数据失败:', e);
            return defaultValue;
        }
    },

    /**
     * 删除本地数据
     * @param {string} key - 键名
     */
    removeLocalData: function(key) {
        cc.sys.localStorage.removeItem(key);
    },

    /**
     * 清除所有本地数据
     */
    clearAllLocalData: function() {
        cc.sys.localStorage.clear();
    }
};

// 初始化全局管理器
if (typeof cc !== 'undefined' && cc.game) {
    // 在游戏启动后初始化
    cc.game.on(cc.game.EVENT_GAME_INITED, function() {
        window.myglobal.init();
    });
}

// 模块导出
if (typeof module !== 'undefined' && module.exports) {
    module.exports = window.myglobal;
}
