// 玩家数据 - Cocos Creator 2.x CommonJS 风格

var getRandomStr = function (count) {
    var str = '';
    for (var i = 0; i < count; i++) {
        str += Math.floor(Math.random() * 10);
    }
    return str;
};

var playerData = function(){
    var that = {}

    that.uniqueID = "1" + getRandomStr(6)
    that.accountID = "2" + getRandomStr(6)
    that.nickName = "玩家" + getRandomStr(3)
    var str = "avatar_" + (Math.floor(Math.random() * 3) + 1)
    that.avatarUrl = str
    that.gobal_count = 0
    that.master_accountid = 0
    that.bottom = 100
    that.rate = 1
    that.housemanageid = ""
    
    return that;
}

// Cocos Creator 2.x CommonJS 导出
module.exports = playerData;
