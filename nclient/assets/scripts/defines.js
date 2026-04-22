/**
 * 常量定义文件
 * 定义游戏中使用的所有常量、枚举和配置
 */

// 游戏配置
var GameConfig = {
    // 游戏版本
    VERSION: '1.0.0',
    
    // 设计分辨率
    DESIGN_WIDTH: 1280,
    DESIGN_HEIGHT: 720,
    
    // 服务器配置
    SERVER: {
        HTTP_URL: 'http://localhost:3000',
        WS_URL: 'ws://localhost:3003',
        API_VERSION: 'v1'
    },
    
    // 超时时间（毫秒）
    TIMEOUT: {
        HTTP: 10000,
        WEBSOCKET: 30000,
        HEARTBEAT: 30000
    },
    
    // 重连配置
    RECONNECT: {
        MAX_ATTEMPTS: 5,
        INTERVAL: 3000
    },
    
    // 存储键名
    STORAGE_KEYS: {
        USER_TOKEN: 'user_token',
        USER_INFO: 'user_info',
        USER_SETTINGS: 'user_settings',
        LAST_ACCOUNT: 'last_account',
        AGREEMENT_ACCEPTED: 'agreement_accepted'
    },
    
    // 房间配置
    ROOM: {
        MAX_PLAYERS: 4,
        MIN_PLAYERS: 2,
        DEFAULT_ROUND: 5,
        BASE_SCORE: 100
    },
    
    // 游戏状态
    GAME_STATE: {
        WAITING: 'waiting',       // 等待中
        READY: 'ready',           // 准备中
        DEALING: 'dealing',       // 发牌中
        BIDDING: 'bidding',       // 叫地主中
        PLAYING: 'playing',       // 游戏中
        FINISHED: 'finished'      // 已结束
    },
    
    // 玩家状态
    PLAYER_STATE: {
        OFFLINE: 'offline',       // 离线
        ONLINE: 'online',         // 在线
        READY: 'ready',           // 准备
        PLAYING: 'playing',       // 游戏中
        WATCHING: 'watching'      // 观战中
    },
    
    // 卡牌花色
    CARD_SUIT: {
        SPADE: 0,     // 黑桃
        HEART: 1,     // 红桃
        CLUB: 2,      // 梅花
        DIAMOND: 3,   // 方块
        JOKER: 4      // 王
    },
    
    // 卡牌类型
    CARD_TYPE: {
        NONE: 0,          // 无效
        SINGLE: 1,        // 单张
        PAIR: 2,          // 对子
        TRIPLE: 3,        // 三张
        TRIPLE_SINGLE: 4, // 三带一
        TRIPLE_PAIR: 5,   // 三带二
        STRAIGHT: 6,      // 顺子
        STRAIGHT_PAIR: 7, // 连对
        PLANE: 8,         // 飞机不带
        PLANE_SINGLE: 9,  // 飞机带单
        PLANE_PAIR: 10,   // 飞机带对
        FOUR_TWO: 11,     // 四带二
        BOMB: 12,         // 炸弹
        ROCKET: 13        // 王炸
    },
    
    // 游戏结果
    GAME_RESULT: {
        WIN: 'win',
        LOSE: 'lose',
        DRAW: 'draw'
    }
};

// HTTP API 路径
var APIPaths = {
    // 用户相关
    LOGIN: '/api/user/login',
    REGISTER: '/api/user/register',
    LOGOUT: '/api/user/logout',
    USER_INFO: '/api/user/info',
    UPDATE_INFO: '/api/user/update',
    
    // 房间相关
    CREATE_ROOM: '/api/room/create',
    JOIN_ROOM: '/api/room/join',
    LEAVE_ROOM: '/api/room/leave',
    ROOM_INFO: '/api/room/info',
    ROOM_LIST: '/api/room/list',
    
    // 游戏相关
    GAME_START: '/api/game/start',
    GAME_END: '/api/game/end',
    GAME_RECORD: '/api/game/record',
    
    // 其他
    USER_AGREEMENT: '/api/agreement',
    SERVER_STATUS: '/api/status'
};

// WebSocket 消息类型
var WSMsgType = {
    // 连接相关
    CONNECT: 'connect',
    DISCONNECT: 'disconnect',
    HEARTBEAT: 'heartbeat',
    RECONNECT: 'reconnect',
    
    // 房间相关
    ROOM_CREATE: 'room_create',
    ROOM_JOIN: 'room_join',
    ROOM_LEAVE: 'room_leave',
    ROOM_UPDATE: 'room_update',
    PLAYER_READY: 'player_ready',
    
    // 游戏相关
    GAME_START: 'game_start',
    GAME_DEAL: 'game_deal',
    GAME_BID: 'game_bid',
    GAME_PLAY: 'game_play',
    GAME_TURN: 'game_turn',
    GAME_END: 'game_end',
    
    // 聊天相关
    CHAT_MESSAGE: 'chat_message',
    CHAT_EMOJI: 'chat_emoji',
    
    // 系统消息
    SYSTEM_NOTICE: 'system_notice',
    ERROR: 'error'
};

// 错误码定义
var ErrorCode = {
    SUCCESS: 0,
    
    // 通用错误 1-99
    UNKNOWN_ERROR: 1,
    NETWORK_ERROR: 2,
    SERVER_ERROR: 3,
    TIMEOUT_ERROR: 4,
    PARAM_ERROR: 5,
    
    // 用户相关错误 100-199
    USER_NOT_FOUND: 100,
    USER_ALREADY_EXISTS: 101,
    PASSWORD_ERROR: 102,
    TOKEN_EXPIRED: 103,
    TOKEN_INVALID: 104,
    USER_BANNED: 105,
    NOT_LOGIN: 106,
    
    // 房间相关错误 200-299
    ROOM_NOT_FOUND: 200,
    ROOM_FULL: 201,
    ROOM_ALREADY_EXISTS: 202,
    NOT_IN_ROOM: 203,
    ALREADY_IN_ROOM: 204,
    ROOM_GAME_STARTED: 205,
    ROOM_PASSWORD_ERROR: 206,
    
    // 游戏相关错误 300-399
    GAME_NOT_STARTED: 300,
    GAME_ALREADY_STARTED: 301,
    NOT_YOUR_TURN: 302,
    INVALID_CARD: 303,
    INVALID_PLAY: 304,
    NOT_ENOUGH_CARDS: 305,
    
    // 其他错误 400-499
    INSUFFICIENT_BALANCE: 400,
    FEATURE_LOCKED: 401,
    PERMISSION_DENIED: 402
};

// 错误消息映射
var ErrorMsg = {
    0: '成功',
    1: '未知错误',
    2: '网络连接失败',
    3: '服务器错误',
    4: '请求超时',
    5: '参数错误',
    100: '用户不存在',
    101: '用户已存在',
    102: '密码错误',
    103: '登录已过期，请重新登录',
    104: '登录状态无效',
    105: '账号已被封禁',
    106: '请先登录',
    200: '房间不存在',
    201: '房间已满',
    202: '房间已存在',
    203: '您不在房间中',
    204: '您已在房间中',
    205: '游戏已开始，无法加入',
    206: '房间密码错误',
    300: '游戏尚未开始',
    301: '游戏已经开始',
    302: '还没轮到您',
    303: '无效的卡牌',
    304: '无效的出牌',
    305: '卡牌数量不足',
    400: '余额不足',
    401: '功能已锁定',
    402: '没有权限'
};

/**
 * 获取错误消息
 * @param {number} code - 错误码
 * @returns {string} 错误消息
 */
function getErrorMsg(code) {
    return ErrorMsg[code] || '未知错误';
}

/**
 * 检查是否为成功
 * @param {number} code - 错误码
 * @returns {boolean} 是否成功
 */
function isSuccess(code) {
    return code === ErrorCode.SUCCESS;
}

/**
 * 判断是否为网络错误
 * @param {number} code - 错误码
 * @returns {boolean} 是否为网络错误
 */
function isNetworkError(code) {
    return code === ErrorCode.NETWORK_ERROR || code === ErrorCode.TIMEOUT_ERROR;
}

/**
 * 判断是否需要重新登录
 * @param {number} code - 错误码
 * @returns {boolean} 是否需要重新登录
 */
function needRelogin(code) {
    return code === ErrorCode.TOKEN_EXPIRED || 
           code === ErrorCode.TOKEN_INVALID || 
           code === ErrorCode.NOT_LOGIN;
}

// 卡牌定义
var CardDefines = {
    // 卡牌值（3-17，17是大小王）
    CARD_VALUES: {
        THREE: 3,
        FOUR: 4,
        FIVE: 5,
        SIX: 6,
        SEVEN: 7,
        EIGHT: 8,
        NINE: 9,
        TEN: 10,
        JACK: 11,
        QUEEN: 12,
        KING: 13,
        ACE: 14,
        TWO: 15,
        SMALL_JOKER: 16,
        BIG_JOKER: 17
    },
    
    // 卡牌显示名称
    CARD_NAMES: {
        3: '3', 4: '4', 5: '5', 6: '6', 7: '7',
        8: '8', 9: '9', 10: '10', 11: 'J', 12: 'Q',
        13: 'K', 14: 'A', 15: '2', 16: '小王', 17: '大王'
    },
    
    // 花色名称
    SUIT_NAMES: {
        0: '黑桃',
        1: '红桃',
        2: '梅花',
        3: '方块'
    }
};

/**
 * 获取卡牌显示名称
 * @param {number} value - 卡牌值
 * @returns {string} 卡牌名称
 */
function getCardName(value) {
    return CardDefines.CARD_NAMES[value] || '';
}

/**
 * 获取花色名称
 * @param {number} suit - 花色值
 * @returns {string} 花色名称
 */
function getSuitName(suit) {
    return CardDefines.SUIT_NAMES[suit] || '';
}

/**
 * 比较两张卡牌大小
 * @param {number} card1 - 第一张卡牌值
 * @param {number} card2 - 第二张卡牌值
 * @returns {number} >0 表示card1大，<0 表示card2大，0 表示相等
 */
function compareCards(card1, card2) {
    return card1 - card2;
}

// 导出模块
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        GameConfig: GameConfig,
        APIPaths: APIPaths,
        WSMsgType: WSMsgType,
        ErrorCode: ErrorCode,
        ErrorMsg: ErrorMsg,
        CardDefines: CardDefines,
        getErrorMsg: getErrorMsg,
        isSuccess: isSuccess,
        isNetworkError: isNetworkError,
        needRelogin: needRelogin,
        getCardName: getCardName,
        getSuitName: getSuitName,
        compareCards: compareCards
    };
}

// 挂载到全局
if (typeof window !== 'undefined') {
    window.GameConfig = GameConfig;
    window.APIPaths = APIPaths;
    window.WSMsgType = WSMsgType;
    window.ErrorCode = ErrorCode;
    window.ErrorMsg = ErrorMsg;
    window.CardDefines = CardDefines;
    window.getErrorMsg = getErrorMsg;
    window.isSuccess = isSuccess;
    window.isNetworkError = isNetworkError;
    window.needRelogin = needRelogin;
    window.getCardName = getCardName;
    window.getSuitName = getSuitName;
    window.compareCards = compareCards;
}
