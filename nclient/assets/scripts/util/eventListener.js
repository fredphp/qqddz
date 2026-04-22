/**
 * 事件监听器
 * 提供全局事件注册、触发和移除功能
 */

var EventListener = {};

// 事件注册表
EventListener._register = {};

/**
 * 注册事件监听
 * @param {string} type - 事件类型
 * @param {Function} method - 回调函数
 * @param {Object} target - 目标对象（可选）
 */
EventListener.on = function(type, method, target) {
    if (!type || typeof method !== 'function') {
        cc.warn('[EventListener] 无效的事件注册参数');
        return;
    }
    
    if (!this._register.hasOwnProperty(type)) {
        this._register[type] = [];
    }
    
    this._register[type].push({
        method: method,
        target: target || null
    });
    
    cc.log('[EventListener] 注册事件:', type);
};

/**
 * 触发事件
 * @param {string} type - 事件类型
 * @param {...any} args - 事件参数
 */
EventListener.fire = function(type) {
    if (!this._register.hasOwnProperty(type)) {
        return;
    }
    
    var methodList = this._register[type];
    var args = [];
    for (var i = 1; i < arguments.length; i++) {
        args.push(arguments[i]);
    }
    
    cc.log('[EventListener] 触发事件:', type, '监听器数量:', methodList.length);
    
    for (var i = 0; i < methodList.length; i++) {
        var handle = methodList[i];
        try {
            if (handle.target) {
                handle.method.apply(handle.target, args);
            } else {
                handle.method.apply(null, args);
            }
        } catch (e) {
            cc.error('[EventListener] 事件处理错误:', type, e);
        }
    }
};

/**
 * 移除指定类型的所有监听
 * @param {string} type - 事件类型
 */
EventListener.removeLister = function(type) {
    if (this._register.hasOwnProperty(type)) {
        this._register[type] = [];
        cc.log('[EventListener] 移除事件监听:', type);
    }
};

/**
 * 移除指定监听器
 * @param {string} type - 事件类型
 * @param {Function} method - 回调函数
 * @param {Object} target - 目标对象（可选）
 */
EventListener.off = function(type, method, target) {
    if (!this._register.hasOwnProperty(type)) {
        return;
    }
    
    var methodList = this._register[type];
    for (var i = methodList.length - 1; i >= 0; i--) {
        var handle = methodList[i];
        if (handle.method === method) {
            if (target === undefined || handle.target === target) {
                methodList.splice(i, 1);
            }
        }
    }
    
    cc.log('[EventListener] 移除指定监听器:', type);
};

/**
 * 移除所有监听
 */
EventListener.removeAllLister = function() {
    this._register = {};
    cc.log('[EventListener] 移除所有事件监听');
};

/**
 * 检查是否有指定类型的事件监听
 * @param {string} type - 事件类型
 * @returns {boolean} 是否存在监听
 */
EventListener.hasListener = function(type) {
    return this._register.hasOwnProperty(type) && this._register[type].length > 0;
};

/**
 * 获取指定类型事件的监听器数量
 * @param {string} type - 事件类型
 * @returns {number} 监听器数量
 */
EventListener.getListenerCount = function(type) {
    if (!this._register.hasOwnProperty(type)) {
        return 0;
    }
    return this._register[type].length;
};

/**
 * 为对象添加事件监听能力
 * @param {Object} obj - 目标对象
 * @returns {Object} 添加了事件监听能力的对象
 */
window.eventLister = function(obj) {
    var register = {};

    obj.on = function(type, method, target) {
        if (!type || typeof method !== 'function') {
            return;
        }
        
        if (register.hasOwnProperty(type)) {
            register[type].push({ method: method, target: target });
        } else {
            register[type] = [{ method: method, target: target }];
        }
    };

    obj.fire = function(type) {
        if (!register.hasOwnProperty(type)) {
            return;
        }
        
        var methodList = register[type];
        var args = [];
        for (var j = 1; j < arguments.length; j++) {
            args.push(arguments[j]);
        }
        
        for (var i = 0; i < methodList.length; i++) {
            var handle = methodList[i];
            try {
                if (handle.target) {
                    handle.method.apply(handle.target, args);
                } else {
                    handle.method.apply(this, args);
                }
            } catch (e) {
                cc.error('[eventLister] 事件处理错误:', type, e);
            }
        }
    };

    obj.removeLister = function(type) {
        register[type] = [];
    };

    obj.removeAllLister = function() {
        register = {};
    };

    return obj;
};

// 设置全局变量
if (typeof window !== 'undefined') {
    window.EventListener = EventListener;
}

// 模块导出
if (typeof module !== 'undefined' && module.exports) {
    module.exports = EventListener;
}

cc.log('[EventListener] 事件监听器加载完成');
