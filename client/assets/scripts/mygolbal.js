/**
 * 全局模块
 * 纯全局变量方式，延迟初始化
 */

var myglobal = myglobal || {}

// 初始化函数 - 在其他脚本加载后调用
myglobal.init = function() {
    // 检查依赖
    if (typeof window.socketCtr === 'undefined') {
        console.error("socketCtr 未定义，请确保 socket_ctr.js 已加载")
        return false
    }
    if (typeof window.playerData === 'undefined') {
        console.error("playerData 未定义，请确保 player.js 已加载")
        return false
    }
    if (typeof window.eventLister === 'undefined') {
        console.error("eventLister 未定义，请确保 event_lister.js 已加载")
        return false
    }
    
    // 初始化全局对象
    myglobal.socket = window.socketCtr()
    myglobal.playerData = window.playerData()
    myglobal.eventlister = window.eventLister({})
    
    console.log("myglobal 初始化完成")
    return true
}

// 设置全局变量
window.myglobal = myglobal

console.log("mygolbal.js loaded");
