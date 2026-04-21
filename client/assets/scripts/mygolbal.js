/**
 * 全局模块
 * 在 Cocos Creator 2.x 中确保正确初始化
 */

// 确保全局对象存在
if (typeof window !== 'undefined' && !window.myglobal) {
    window.myglobal = {};
}

// 使用立即执行函数避免模块加载顺序问题
const initMyGlobal = function() {
    var myglobal = window.myglobal || {};
    
    // 延迟加载依赖，避免循环引用
    myglobal._socket = null;
    myglobal._playerData = null;
    myglobal._eventlister = null;
    
    // 获取 socket 实例（延迟初始化）
    myglobal.__defineGetter__('socket', function() {
        if (!myglobal._socket) {
            // 尝试使用全局的 socketCtr
            if (typeof socketCtr !== 'undefined') {
                myglobal._socket = socketCtr();
            } else if (window.socketCtr) {
                myglobal._socket = window.socketCtr();
            }
        }
        return myglobal._socket;
    });
    
    // 获取 playerData 实例（延迟初始化）
    myglobal.__defineGetter__('playerData', function() {
        if (!myglobal._playerData) {
            // 创建简单的玩家数据
            myglobal._playerData = {
                uniqueID: "1" + Math.floor(Math.random() * 1000000),
                accountID: "2" + Math.floor(Math.random() * 1000000),
                nickName: "玩家" + Math.floor(Math.random() * 1000),
                avatarUrl: "avatar_" + (Math.floor(Math.random() * 3) + 1),
                gobal_count: 0,
                master_accountid: 0
            };
        }
        return myglobal._playerData;
    });
    
    // 获取事件监听器（延迟初始化）
    myglobal.__defineGetter__('eventlister', function() {
        if (!myglobal._eventlister) {
            // 创建简单的事件系统
            myglobal._eventlister = {
                _listeners: {},
                on: function(type, callback) {
                    if (!this._listeners[type]) {
                        this._listeners[type] = [];
                    }
                    this._listeners[type].push(callback);
                },
                fire: function(type, data) {
                    var listeners = this._listeners[type];
                    if (listeners) {
                        for (var i = 0; i < listeners.length; i++) {
                            listeners[i](data);
                        }
                    }
                },
                removeLister: function(type) {
                    this._listeners[type] = [];
                }
            };
        }
        return myglobal._eventlister;
    });
    
    return myglobal;
};

// 立即初始化
var myglobal = initMyGlobal();

// 设置全局引用
if (typeof window !== 'undefined') {
    window.myglobal = myglobal;
}

// 导出
export default myglobal;
