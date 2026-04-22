/**
 * 全局模块
 * 纯全局变量方式，延迟初始化
 * 确保所有依赖都已加载
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
        _initialized: false
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
            console.error("缺少依赖:", missing.join(', '));
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
            
            console.log("myglobal 初始化完成");
            console.log("  - socket:", !!this.socket);
            console.log("  - playerData:", !!this.playerData);
            console.log("  - eventlister:", !!this.eventlister);
            
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
        var maxAttempts = 10;
        
        var tryInit = function() {
            attempts++;
            console.log("尝试初始化 myglobal (第 " + attempts + " 次)");
            
            if (self.init()) {
                console.log("myglobal 自动初始化成功");
            } else if (attempts < maxAttempts) {
                // 延迟重试
                setTimeout(tryInit, 100);
            } else {
                console.error("myglobal 自动初始化失败，已达到最大重试次数");
            }
        };
        
        // 延迟执行，确保所有插件脚本都已加载
        setTimeout(tryInit, 50);
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
    
    console.log("mygolbal.js loaded");
})();
