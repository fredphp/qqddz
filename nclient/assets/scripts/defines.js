// 斗地主配置文件
// 纯全局变量方式，不使用 module.exports

var defines = {};

// Go 后端 WebSocket 地址
defines.serverUrl = "ws://localhost:1780/ws";

// Go 后端 HTTP API 地址 (如果Go服务不可用，可使用Next.js API: "")
// 使用虚拟域名 ddzapi.qqddz.local (通过代理访问)
defines.apiUrl = "http://ddzapi.qqddz.local";

// API 数据加密密钥（与服务端配置一致，必须是32字节）
defines.cryptoKey = "qqddz2026gameaes256secretkey123!";

// 设置全局变量
window.defines = defines;

// 房间状态
window.RoomState = {
    ROOM_INVALID: -1,
    ROOM_WAITREADY: 1,  // 等待游戏
    ROOM_GAMESTART: 2,  // 开始游戏
    ROOM_PUSHCARD: 3,   // 发牌
    ROOM_ROBSTATE: 4,   // 抢地主
    ROOM_SHOWBOTTOMCARD: 5, // 显示底牌
    ROOM_PLAYING: 6,    // 出牌阶段
};

// 抢地主状态
window.qian_state = {
    "buqiang": 0,
    "qian": 1,
};

// 创建房间配置
window.createRoomConfig = {
    'rate_1': { needCostGold: 10, bottom: 1, rate: 1 },
    'rate_2': { needCostGold: 100, bottom: 10, rate: 2 },
    'rate_3': { needCostGold: 200, bottom: 20, rate: 3 },
    'rate_4': { needCostGold: 500, bottom: 50, rate: 4 }
};

// 牌型定义
window.CardsValue = {
    'one': { name: 'One', value: 1 },
    'double': { name: 'Double', value: 1 },
    'three': { name: 'Three', value: 1 },
    'boom': { name: 'Boom', value: 2 },
    'threeWithOne': { name: 'ThreeWithOne', value: 1 },
    'threeWithTwo': { name: 'ThreeWithTwo', value: 1 },
    'plane': { name: 'Plane', value: 1 },
    'planeWithOne': { name: 'PlaneWithOne', value: 1 },
    'planeWithTwo': { name: 'PlaneWithTwo', value: 1 },
    'scroll': { name: 'Scroll', value: 1 },
    'doubleScroll': { name: 'DoubleScroll', value: 1 },
    'kingboom': { name: 'kingboom', value: 3 },
};

// 音效开关
window.isopen_sound = 1;

console.log("defines.js loaded");
