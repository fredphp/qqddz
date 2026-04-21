/**
 * 全局模块
 * Cocos Creator 2.x CommonJS 风格
 */

var socketCtr = require("./data/socket_ctr.js")
var playerData = require("./data/player.js")
var eventLister = require("./util/event_lister.js")

var myglobal = myglobal || {}

myglobal.socket = socketCtr()
myglobal.playerData = playerData()
myglobal.eventlister = eventLister({})

// 设置全局变量
if (typeof window !== 'undefined') {
    window.myglobal = myglobal
}

// Cocos Creator 2.x CommonJS 导出
module.exports = myglobal;
