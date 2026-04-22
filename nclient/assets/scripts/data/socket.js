/**
 * WebSocket通信管理器
 * 负责WebSocket连接、消息发送和接收
 */

var SocketManager = cc.Class({
    extends: cc.Component,

    properties: {
        // 是否启用调试日志
        debug: true,
        // 心跳间隔（毫秒）
        heartbeatInterval: 30000,
        // 重连间隔（毫秒）
        reconnectInterval: 3000,
        // 最大重连次数
        maxReconnectAttempts: 5
    },

    statics: {
        instance: null,

        /**
         * 获取单例实例
         */
        getInstance: function() {
            if (!SocketManager.instance) {
                var node = new cc.Node('SocketManager');
                cc.game.addPersistRootNode(node);
                SocketManager.instance = node.addComponent(SocketManager);
                SocketManager.instance.init();
            }
            return SocketManager.instance;
        }
    },

    // WebSocket实例
    ws: null,
    // 是否已连接
    connected: false,
    // 是否正在连接
    connecting: false,
    // 重连次数
    reconnectAttempts: 0,
    // 心跳定时器
    heartbeatTimer: null,
    // 消息队列（连接未建立时缓存消息）
    messageQueue: [],
    // 消息回调映射
    callbacks: {},
    // 连接回调
    connectionCallbacks: [],
    // 断开回调
    disconnectionCallbacks: [],

    onLoad: function() {
        // 保持节点不销毁
        // cc.game.addPersistRootNode(this.node);
    },

    onDestroy: function() {
        this.disconnect();
    },

    /**
     * 初始化
     */
    init: function() {
        this.ws = null;
        this.connected = false;
        this.connecting = false;
        this.reconnectAttempts = 0;
        this.messageQueue = [];
        this.callbacks = {};
        this.connectionCallbacks = [];
        this.disconnectionCallbacks = [];
        
        this.log('[SocketManager] 初始化完成');
    },

    /**
     * 连接服务器
     * @param {string} url - WebSocket服务器地址
     * @param {Function} callback - 连接回调
     */
    connect: function(url, callback) {
        var self = this;
        
        if (this.connected) {
            this.log('[SocketManager] 已经连接');
            if (callback) callback(true, '已连接');
            return;
        }

        if (this.connecting) {
            this.log('[SocketManager] 正在连接中');
            if (callback) callback(false, '正在连接中');
            return;
        }

        // 检查WebSocket支持
        if (typeof WebSocket === 'undefined') {
            this.log('[SocketManager] WebSocket不支持');
            if (callback) callback(false, 'WebSocket不支持');
            return;
        }

        this.connecting = true;
        this.reconnectAttempts = 0;

        // 保存连接回调
        if (callback) {
            this.connectionCallbacks.push(callback);
        }

        try {
            this.log('[SocketManager] 开始连接:', url);
            this.ws = new WebSocket(url);

            this.ws.onopen = function(event) {
                self.onOpen(event);
            };

            this.ws.onmessage = function(event) {
                self.onMessage(event);
            };

            this.ws.onerror = function(event) {
                self.onError(event);
            };

            this.ws.onclose = function(event) {
                self.onClose(event);
            };

        } catch (e) {
            this.log('[SocketManager] 连接异常:', e);
            this.connecting = false;
            this.notifyConnectionCallbacks(false, '连接异常: ' + e.message);
        }
    },

    /**
     * 断开连接
     */
    disconnect: function() {
        this.log('[SocketManager] 断开连接');
        
        this.stopHeartbeat();
        
        if (this.ws) {
            try {
                this.ws.close();
            } catch (e) {
                this.log('[SocketManager] 关闭连接异常:', e);
            }
            this.ws = null;
        }

        this.connected = false;
        this.connecting = false;
        
        // 通知断开回调
        this.notifyDisconnectionCallbacks('主动断开');
    },

    /**
     * WebSocket打开事件
     */
    onOpen: function(event) {
        this.log('[SocketManager] 连接成功');
        
        this.connected = true;
        this.connecting = false;
        this.reconnectAttempts = 0;

        // 开始心跳
        this.startHeartbeat();

        // 发送队列中的消息
        this.flushMessageQueue();

        // 通知连接回调
        this.notifyConnectionCallbacks(true, '连接成功');
    },

    /**
     * WebSocket消息事件
     */
    onMessage: function(event) {
        var data = event.data;
        this.log('[SocketManager] 收到消息:', data);

        try {
            var message = JSON.parse(data);
            this.handleMessage(message);
        } catch (e) {
            this.log('[SocketManager] 消息解析失败:', e);
            // 非JSON格式消息，直接触发通用回调
            this.emit('message', data);
        }
    },

    /**
     * WebSocket错误事件
     */
    onError: function(event) {
        this.log('[SocketManager] 连接错误:', event);
        
        this.connected = false;
        this.connecting = false;

        // 尝试重连
        this.tryReconnect();
    },

    /**
     * WebSocket关闭事件
     */
    onClose: function(event) {
        this.log('[SocketManager] 连接关闭, code:', event.code, 'reason:', event.reason);
        
        var wasConnected = this.connected;
        this.connected = false;
        this.connecting = false;
        this.ws = null;

        this.stopHeartbeat();

        // 如果之前是连接状态，尝试重连
        if (wasConnected) {
            this.notifyDisconnectionCallbacks('连接断开');
            this.tryReconnect();
        } else {
            this.notifyConnectionCallbacks(false, '连接失败');
        }
    },

    /**
     * 处理收到的消息
     * @param {Object} message - 消息对象
     */
    handleMessage: function(message) {
        var type = message.type || message.cmd || 'unknown';
        var data = message.data || message.payload || {};

        this.log('[SocketManager] 处理消息 type:', type);

        // 触发对应类型的回调
        this.emit(type, data);

        // 触发消息ID回调（如果有）
        if (message.id && this.callbacks[message.id]) {
            var callback = this.callbacks[message.id];
            delete this.callbacks[message.id];
            callback(data);
        }
    },

    /**
     * 发送消息
     * @param {string} type - 消息类型
     * @param {Object} data - 消息数据
     * @param {Function} callback - 回调函数（可选）
     */
    send: function(type, data, callback) {
        var message = {
            type: type,
            data: data || {},
            timestamp: Date.now()
        };

        // 如果有回调，生成消息ID
        if (callback) {
            message.id = this.generateMessageId();
            this.callbacks[message.id] = callback;
        }

        this.sendRaw(message);
    },

    /**
     * 发送原始消息
     * @param {Object} message - 消息对象
     */
    sendRaw: function(message) {
        if (!this.connected) {
            this.log('[SocketManager] 未连接，消息加入队列');
            this.messageQueue.push(message);
            return;
        }

        try {
            var json = JSON.stringify(message);
            this.log('[SocketManager] 发送消息:', json);
            this.ws.send(json);
        } catch (e) {
            this.log('[SocketManager] 发送消息失败:', e);
        }
    },

    /**
     * 发送队列中的消息
     */
    flushMessageQueue: function() {
        if (this.messageQueue.length === 0) return;

        this.log('[SocketManager] 发送队列消息, 数量:', this.messageQueue.length);

        var queue = this.messageQueue.slice();
        this.messageQueue = [];

        for (var i = 0; i < queue.length; i++) {
            this.sendRaw(queue[i]);
        }
    },

    /**
     * 生成消息ID
     */
    generateMessageId: function() {
        return 'msg_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    },

    /**
     * 开始心跳
     */
    startHeartbeat: function() {
        var self = this;
        this.stopHeartbeat();

        this.heartbeatTimer = setInterval(function() {
            if (self.connected) {
                self.send('heartbeat', { timestamp: Date.now() });
            }
        }, this.heartbeatInterval);
    },

    /**
     * 停止心跳
     */
    stopHeartbeat: function() {
        if (this.heartbeatTimer) {
            clearInterval(this.heartbeatTimer);
            this.heartbeatTimer = null;
        }
    },

    /**
     * 尝试重连
     */
    tryReconnect: function() {
        var self = this;

        if (this.reconnectAttempts >= this.maxReconnectAttempts) {
            this.log('[SocketManager] 达到最大重连次数');
            this.emit('reconnect_failed', { attempts: this.reconnectAttempts });
            return;
        }

        this.reconnectAttempts++;
        this.log('[SocketManager] 尝试重连, 第', this.reconnectAttempts, '次');

        setTimeout(function() {
            var url = myglobal ? myglobal.getServerUrl() : null;
            if (url) {
                self.connect(url);
            }
        }, this.reconnectInterval);
    },

    /**
     * 注册消息监听
     * @param {string} type - 消息类型
     * @param {Function} callback - 回调函数
     * @param {Object} target - 目标对象（可选）
     */
    on: function(type, callback, target) {
        if (!this._listeners) {
            this._listeners = {};
        }

        if (!this._listeners[type]) {
            this._listeners[type] = [];
        }

        this._listeners[type].push({
            callback: callback,
            target: target
        });
    },

    /**
     * 取消消息监听
     * @param {string} type - 消息类型
     * @param {Function} callback - 回调函数
     * @param {Object} target - 目标对象
     */
    off: function(type, callback, target) {
        if (!this._listeners || !this._listeners[type]) return;

        var listeners = this._listeners[type];
        for (var i = listeners.length - 1; i >= 0; i--) {
            if (listeners[i].callback === callback && listeners[i].target === target) {
                listeners.splice(i, 1);
            }
        }
    },

    /**
     * 触发消息事件
     * @param {string} type - 消息类型
     * @param {Object} data - 消息数据
     */
    emit: function(type, data) {
        if (!this._listeners || !this._listeners[type]) return;

        var listeners = this._listeners[type];
        for (var i = 0; i < listeners.length; i++) {
            var listener = listeners[i];
            listener.callback.call(listener.target, data);
        }
    },

    /**
     * 通知连接回调
     * @param {boolean} success - 是否成功
     * @param {string} message - 消息
     */
    notifyConnectionCallbacks: function(success, message) {
        var callbacks = this.connectionCallbacks.slice();
        this.connectionCallbacks = [];

        for (var i = 0; i < callbacks.length; i++) {
            callbacks[i](success, message);
        }
    },

    /**
     * 通知断开回调
     * @param {string} reason - 断开原因
     */
    notifyDisconnectionCallbacks: function(reason) {
        var callbacks = this.disconnectionCallbacks.slice();
        this.disconnectionCallbacks = [];

        for (var i = 0; i < callbacks.length; i++) {
            callbacks[i](reason);
        }
    },

    /**
     * 注册断开回调
     * @param {Function} callback - 回调函数
     */
    onDisconnect: function(callback) {
        this.disconnectionCallbacks.push(callback);
    },

    /**
     * 检查是否已连接
     */
    isConnected: function() {
        return this.connected;
    },

    /**
     * 日志输出
     */
    log: function() {
        if (this.debug) {
            var args = Array.prototype.slice.call(arguments);
            cc.log.apply(cc, args);
        }
    }
});

// 导出模块
if (typeof module !== 'undefined' && module.exports) {
    module.exports = SocketManager;
}

// 挂载到全局
if (typeof window !== 'undefined') {
    window.SocketManager = SocketManager;
}
