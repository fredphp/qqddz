
                (function() {
                    var nodeEnv = typeof require !== 'undefined' && typeof process !== 'undefined';
                    var __module = nodeEnv ? module : {exports:{}};
                    var __filename = 'preview-scripts/__qc_index__.js';
                    var __require = nodeEnv ? function (request) {
                        return cc.require(request);
                    } : function (request) {
                        return __quick_compile_project__.require(request, __filename);
                    };
                    function __define (exports, require, module) {
                        if (!nodeEnv) {__quick_compile_project__.registerModule(__filename, module);}
require('./assets/scripts/data/arenaData');
require('./assets/scripts/ddz/tournament/TournamentFinalRankDialog');
require('./assets/scripts/ddz/tournament/TournamentWaitingScene');
require('./assets/scripts/hallscene/prefabs_script/creatroom');
require('./assets/scripts/hallscene/prefabs_script/joinroom');

                    }
                    if (nodeEnv) {
                        __define(__module.exports, __require, __module);
                    }
                    else {
                        __quick_compile_project__.registerModuleFunc(__filename, function () {
                            __define(__module.exports, __require, __module);
                        });
                    }
                })();
//------QC-SOURCE-SPLIT------

                (function() {
                    var nodeEnv = typeof require !== 'undefined' && typeof process !== 'undefined';
                    var __module = nodeEnv ? module : {exports:{}};
                    var __filename = 'preview-scripts/assets/scripts/data/arenaData.js';
                    var __require = nodeEnv ? function (request) {
                        return cc.require(request);
                    } : function (request) {
                        return __quick_compile_project__.require(request, __filename);
                    };
                    function __define (exports, require, module) {
                        if (!nodeEnv) {__quick_compile_project__.registerModule(__filename, module);}"use strict";
cc._RF.push(module, '813dcvepIxFjad6cNQB7j3m', 'arenaData');
// scripts/data/arenaData.js

"use strict";

/**
 * 竞技场数据管理模块
 * 用于管理竞技场报名、倒计时、奖励等数据
 * 
 * 功能：
 * 1. 获取竞技场房间列表
 * 2. 报名/取消报名
 * 3. 获取开赛倒计时
 * 4. 获取已报名状态
 */

window.arenaData = function () {
  var that = {};

  // ==================== 竞技场状态数据 ====================

  // 已报名的竞技场列表 { roomId: { signupTime, status, countdownEnd } }
  that._signedUpArenas = {};

  // 竞技场详情缓存 { roomId: arenaConfig }
  that._arenaDetails = {};

  // 倒计时定时器
  that._countdownTimers = {};

  // 状态变更监听器
  that._statusListeners = [];

  // ==================== API 方法 ====================

  /**
   * 获取竞技场房间列表
   * @param {Function} callback - 回调函数 (err, arenaList)
   */
  that.getArenaList = function (callback) {
    var apiUrl = window.defines ? window.defines.apiUrl : '';
    var cryptoKey = window.defines ? window.defines.cryptoKey : '';
    if (!apiUrl || !window.HttpAPI) {
      callback && callback('API未配置', null);
      return;
    }
    HttpAPI.get(apiUrl + '/api/v1/arena/list', cryptoKey, function (err, result) {
      if (err) {
        callback && callback(err, null);
        return;
      }
      var arenaList = null;
      if (result && result.code === 0 && result.data) {
        arenaList = result.data;
      } else if (result && Array.isArray(result)) {
        arenaList = result;
      }
      if (arenaList) {
        // 缓存竞技场详情
        for (var i = 0; i < arenaList.length; i++) {
          var arena = arenaList[i];
          that._arenaDetails[arena.id] = arena;
        }
        callback && callback(null, arenaList);
      } else {
        callback && callback('获取竞技场列表失败', null);
      }
    });
  };

  /**
   * 报名竞技场
   * @param {Number} roomId - 竞技场房间ID
   * @param {Function} callback - 回调函数 (err, result)
   */
  that.signup = function (roomId, callback) {
    var apiUrl = window.defines ? window.defines.apiUrl : '';
    var cryptoKey = window.defines ? window.defines.cryptoKey : '';
    var token = window.myglobal && window.myglobal.playerData ? window.myglobal.playerData.token : '';
    if (!apiUrl || !window.HttpAPI) {
      callback && callback('API未配置', null);
      return;
    }
    var requestData = {
      room_id: roomId,
      token: token
    };
    HttpAPI.post(apiUrl + '/api/v1/arena/signup', requestData, cryptoKey, function (err, result) {
      if (err) {
        callback && callback(err, null);
        return;
      }
      if (result && (result.code === 0 || result.success)) {
        var _result$data;
        // 记录报名成功
        var arenaConfig = that._arenaDetails[roomId] || {};
        that._signedUpArenas[roomId] = {
          signupTime: Date.now(),
          status: 'signed_up',
          countdownEnd: result.data ? result.data.start_time : null,
          arenaConfig: arenaConfig,
          periodNo: result.period_no || ((_result$data = result.data) == null ? void 0 : _result$data.period_no)
        };

        // 🔧【新增】保存到本地存储
        that.saveToLocal();

        // 通知状态变更
        that._notifyStatusChange(roomId, 'signed_up');
        callback && callback(null, {
          success: true,
          message: result.message || '报名成功',
          start_time: result.data ? result.data.start_time : null
        });
      } else {
        callback && callback(result ? result.message : '报名失败', null);
      }
    });
  };

  /**
   * 取消报名
   * @param {Number} roomId - 竞技场房间ID
   * @param {Function} callback - 回调函数 (err, result)
   */
  that.cancelSignup = function (roomId, callback) {
    var apiUrl = window.defines ? window.defines.apiUrl : '';
    var cryptoKey = window.defines ? window.defines.cryptoKey : '';
    var token = window.myglobal && window.myglobal.playerData ? window.myglobal.playerData.token : '';
    if (!apiUrl || !window.HttpAPI) {
      callback && callback('API未配置', null);
      return;
    }
    var requestData = {
      room_id: roomId,
      token: token
    };
    HttpAPI.post(apiUrl + '/api/v1/arena/cancel', requestData, cryptoKey, function (err, result) {
      if (err) {
        callback && callback(err, null);
        return;
      }
      if (result && (result.code === 0 || result.success)) {
        // 清除报名记录
        delete that._signedUpArenas[roomId];

        // 🔧【新增】保存到本地存储
        that.saveToLocal();

        // 清除倒计时定时器
        if (that._countdownTimers[roomId]) {
          clearInterval(that._countdownTimers[roomId]);
          delete that._countdownTimers[roomId];
        }

        // 通知状态变更
        that._notifyStatusChange(roomId, 'cancelled');
        callback && callback(null, {
          success: true,
          message: '取消报名成功'
        });
      } else {
        callback && callback(result ? result.message : '取消报名失败', null);
      }
    });
  };

  /**
   * 获取已报名状态
   * @param {Number} roomId - 竞技场房间ID
   * @returns {Object|null} 报名信息或null
   */
  that.getSignupStatus = function (roomId) {
    return that._signedUpArenas[roomId] || null;
  };

  /**
   * 检查是否已报名
   * @param {Number} roomId - 竞技场房间ID
   * @returns {Boolean}
   */
  that.isSignedUp = function (roomId) {
    return !!that._signedUpArenas[roomId];
  };

  /**
   * 获取开赛倒计时（秒）
   * @param {Number} roomId - 竞技场房间ID
   * @returns {Number} 倒计时秒数，-1表示未报名或无倒计时
   */
  that.getCountdown = function (roomId) {
    var signup = that._signedUpArenas[roomId];
    if (!signup || !signup.countdownEnd) {
      return -1;
    }
    var now = Date.now();
    var remaining = Math.floor((signup.countdownEnd - now) / 1000);
    return remaining > 0 ? remaining : 0;
  };

  /**
   * 格式化倒计时显示
   * @param {Number} seconds - 秒数
   * @returns {String} 格式化后的时间字符串
   */
  that.formatCountdown = function (seconds) {
    if (seconds < 0) return '';
    if (seconds === 0) return '即将开赛';
    var hours = Math.floor(seconds / 3600);
    var minutes = Math.floor(seconds % 3600 / 60);
    var secs = seconds % 60;
    if (hours > 0) {
      return hours + ':' + (minutes < 10 ? '0' : '') + minutes + ':' + (secs < 10 ? '0' : '') + secs;
    } else {
      return (minutes < 10 ? '0' : '') + minutes + ':' + (secs < 10 ? '0' : '') + secs;
    }
  };

  /**
   * 获取竞技场配置
   * @param {Number} roomId - 竞技场房间ID
   * @returns {Object|null}
   */
  that.getArenaConfig = function (roomId) {
    return that._arenaDetails[roomId] || null;
  };

  /**
   * 获取报名费
   * @param {Object} roomConfig - 房间配置
   * @returns {Number} 报名费（竞技币）
   */
  that.getSignupFee = function (roomConfig) {
    return roomConfig.signup_fee || roomConfig.signupFee || 0;
  };

  /**
   * 获取冠军奖励预览
   * @param {Object} roomConfig - 房间配置
   * @returns {Object} { coins: Number, items: Array }
   */
  that.getChampionReward = function (roomConfig) {
    return roomConfig.champion_reward || roomConfig.championReward || {
      coins: 0,
      items: []
    };
  };

  /**
   * 观看广告获取奖励
   * @param {String} type - 奖励类型 ('gold' 或 'arena_coin')
   * @param {Function} callback - 回调函数 (err, result)
   */
  that.watchAdForReward = function (type, callback) {
    var apiUrl = window.defines ? window.defines.apiUrl : '';
    var cryptoKey = window.defines ? window.defines.cryptoKey : '';
    var token = window.myglobal && window.myglobal.playerData ? window.myglobal.playerData.token : '';
    if (!apiUrl || !window.HttpAPI) {
      callback && callback('API未配置', null);
      return;
    }
    var requestData = {
      token: token,
      type: type,
      ad_type: 'reward_video'
    };
    HttpAPI.post(apiUrl + '/api/ad/reward', requestData, cryptoKey, function (err, result) {
      if (err) {
        callback && callback(err, null);
        return;
      }
      if (result && (result.code === 0 || result.success)) {
        // 更新玩家数据
        if (window.myglobal && window.myglobal.playerData) {
          if (result.data) {
            if (result.data.gold) {
              window.myglobal.playerData.gobal_count = result.data.gold;
            }
            if (result.data.arena_coin) {
              window.myglobal.playerData.arena_coin = result.data.arena_coin;
            }
            window.myglobal.playerData.saveToLocal();
          }
        }
        callback && callback(null, {
          success: true,
          reward: result.data || {}
        });
      } else {
        callback && callback(result ? result.message : '获取奖励失败', null);
      }
    });
  };

  /**
   * 刷新玩家货币余额
   * @param {Function} callback - 回调函数 (err, data)
   */
  that.refreshBalance = function (callback) {
    var apiUrl = window.defines ? window.defines.apiUrl : '';
    var cryptoKey = window.defines ? window.defines.cryptoKey : '';
    var token = window.myglobal && window.myglobal.playerData ? window.myglobal.playerData.token : '';
    if (!apiUrl || !window.HttpAPI) {
      callback && callback('API未配置', null);
      return;
    }
    HttpAPI.get(apiUrl + '/api/v1/player/balance?token=' + encodeURIComponent(token), cryptoKey, function (err, result) {
      if (err) {
        callback && callback(err, null);
        return;
      }
      if (result && (result.code === 0 || result.data)) {
        var data = result.data || result;

        // 更新玩家数据
        if (window.myglobal && window.myglobal.playerData) {
          if (data.gold !== undefined) {
            window.myglobal.playerData.gobal_count = data.gold;
          }
          if (data.arena_coin !== undefined) {
            window.myglobal.playerData.arena_coin = data.arena_coin;
          }
          window.myglobal.playerData.saveToLocal();
        }
        callback && callback(null, data);
      } else {
        callback && callback(result ? result.message : '获取余额失败', null);
      }
    });
  };

  // ==================== 状态监听 ====================

  /**
   * 添加状态变更监听器
   * @param {Function} listener - 监听函数 (roomId, status)
   */
  that.addStatusListener = function (listener) {
    that._statusListeners.push(listener);
  };

  /**
   * 移除状态变更监听器
   * @param {Function} listener - 监听函数
   */
  that.removeStatusListener = function (listener) {
    var index = that._statusListeners.indexOf(listener);
    if (index > -1) {
      that._statusListeners.splice(index, 1);
    }
  };

  /**
   * 通知状态变更
   * @param {Number} roomId - 房间ID
   * @param {String} status - 新状态
   */
  that._notifyStatusChange = function (roomId, status) {
    for (var i = 0; i < that._statusListeners.length; i++) {
      try {
        that._statusListeners[i](roomId, status);
      } catch (e) {
        console.error('状态监听器执行错误:', e);
      }
    }
  };

  // ==================== 倒计时管理 ====================

  /**
   * 启动倒计时更新
   * @param {Number} roomId - 房间ID
   * @param {Function} onUpdate - 更新回调 (seconds)
   */
  that.startCountdown = function (roomId, onUpdate) {
    // 清除旧的定时器
    if (that._countdownTimers[roomId]) {
      clearInterval(that._countdownTimers[roomId]);
    }
    that._countdownTimers[roomId] = setInterval(function () {
      var seconds = that.getCountdown(roomId);
      onUpdate && onUpdate(seconds);

      // 倒计时结束
      if (seconds <= 0) {
        clearInterval(that._countdownTimers[roomId]);
        delete that._countdownTimers[roomId];
        that._notifyStatusChange(roomId, 'starting');
      }
    }, 1000);
  };

  /**
   * 停止倒计时
   * @param {Number} roomId - 房间ID
   */
  that.stopCountdown = function (roomId) {
    if (that._countdownTimers[roomId]) {
      clearInterval(that._countdownTimers[roomId]);
      delete that._countdownTimers[roomId];
    }
  };

  /**
   * 清除所有倒计时
   */
  that.clearAllCountdowns = function () {
    for (var roomId in that._countdownTimers) {
      clearInterval(that._countdownTimers[roomId]);
    }
    that._countdownTimers = {};
  };

  // ==================== 本地存储 ====================

  /**
   * 保存报名状态到本地
   */
  that.saveToLocal = function () {
    try {
      var data = {
        signedUpArenas: that._signedUpArenas,
        savedAt: Date.now()
      };
      localStorage.setItem('arena_data', JSON.stringify(data));
    } catch (e) {
      console.error('保存竞技场数据失败:', e);
    }
  };

  /**
   * 从本地加载报名状态
   */
  that.loadFromLocal = function () {
    try {
      var dataStr = localStorage.getItem('arena_data');
      if (dataStr) {
        var data = JSON.parse(dataStr);
        // 检查数据是否过期（1天）
        if (Date.now() - (data.savedAt || 0) < 24 * 60 * 60 * 1000) {
          that._signedUpArenas = data.signedUpArenas || {};
        }
      }
    } catch (e) {
      console.error('加载竞技场数据失败:', e);
    }
  };

  /**
   * 🔧【新增】从服务端获取报名状态
   * @param {Function} callback - 回调函数 (err, signedUpRooms)
   */
  that.fetchSignupStatusFromServer = function (callback) {
    var apiUrl = window.defines ? window.defines.apiUrl : '';
    var cryptoKey = window.defines ? window.defines.cryptoKey : '';
    var token = window.myglobal && window.myglobal.playerData ? window.myglobal.playerData.token : '';
    if (!apiUrl || !window.HttpAPI) {
      callback && callback('API未配置', null);
      return;
    }
    HttpAPI.get(apiUrl + '/api/v1/arena/signup-status?token=' + encodeURIComponent(token), cryptoKey, function (err, result) {
      if (err) {
        console.error("🏟️ [arenaData] 获取报名状态失败:", err);
        callback && callback(err, null);
        return;
      }
      var signedUpRooms = [];
      if (result && (result.code === 0 || result.data)) {
        var data = result.data || result;
        signedUpRooms = data.signed_up_rooms || [];

        // 更新本地缓存
        that._signedUpArenas = {};
        for (var i = 0; i < signedUpRooms.length; i++) {
          var room = signedUpRooms[i];
          that._signedUpArenas[room.room_id] = {
            signupTime: room.signup_time,
            status: 'signed_up',
            periodNo: room.period_no,
            signupFee: room.signup_fee
          };
        }

        // 保存到本地
        that.saveToLocal();
      }
      callback && callback(null, signedUpRooms);
    });
  };

  /**
   * 清除所有报名状态（用于测试或重置）
   */
  that.clearAllSignupStatus = function () {
    that._signedUpArenas = {};
    that.saveToLocal();
  };

  // 初始化时加载本地数据
  that.loadFromLocal();
  return that;
}();

cc._RF.pop();
                    }
                    if (nodeEnv) {
                        __define(__module.exports, __require, __module);
                    }
                    else {
                        __quick_compile_project__.registerModuleFunc(__filename, function () {
                            __define(__module.exports, __require, __module);
                        });
                    }
                })();
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImFzc2V0c1xcc2NyaXB0c1xcZGF0YVxcYXJlbmFEYXRhLmpzIl0sIm5hbWVzIjpbIndpbmRvdyIsImFyZW5hRGF0YSIsInRoYXQiLCJfc2lnbmVkVXBBcmVuYXMiLCJfYXJlbmFEZXRhaWxzIiwiX2NvdW50ZG93blRpbWVycyIsIl9zdGF0dXNMaXN0ZW5lcnMiLCJnZXRBcmVuYUxpc3QiLCJjYWxsYmFjayIsImFwaVVybCIsImRlZmluZXMiLCJjcnlwdG9LZXkiLCJIdHRwQVBJIiwiZ2V0IiwiZXJyIiwicmVzdWx0IiwiYXJlbmFMaXN0IiwiY29kZSIsImRhdGEiLCJBcnJheSIsImlzQXJyYXkiLCJpIiwibGVuZ3RoIiwiYXJlbmEiLCJpZCIsInNpZ251cCIsInJvb21JZCIsInRva2VuIiwibXlnbG9iYWwiLCJwbGF5ZXJEYXRhIiwicmVxdWVzdERhdGEiLCJyb29tX2lkIiwicG9zdCIsInN1Y2Nlc3MiLCJfcmVzdWx0JGRhdGEiLCJhcmVuYUNvbmZpZyIsInNpZ251cFRpbWUiLCJEYXRlIiwibm93Iiwic3RhdHVzIiwiY291bnRkb3duRW5kIiwic3RhcnRfdGltZSIsInBlcmlvZE5vIiwicGVyaW9kX25vIiwic2F2ZVRvTG9jYWwiLCJfbm90aWZ5U3RhdHVzQ2hhbmdlIiwibWVzc2FnZSIsImNhbmNlbFNpZ251cCIsImNsZWFySW50ZXJ2YWwiLCJnZXRTaWdudXBTdGF0dXMiLCJpc1NpZ25lZFVwIiwiZ2V0Q291bnRkb3duIiwicmVtYWluaW5nIiwiTWF0aCIsImZsb29yIiwiZm9ybWF0Q291bnRkb3duIiwic2Vjb25kcyIsImhvdXJzIiwibWludXRlcyIsInNlY3MiLCJnZXRBcmVuYUNvbmZpZyIsImdldFNpZ251cEZlZSIsInJvb21Db25maWciLCJzaWdudXBfZmVlIiwic2lnbnVwRmVlIiwiZ2V0Q2hhbXBpb25SZXdhcmQiLCJjaGFtcGlvbl9yZXdhcmQiLCJjaGFtcGlvblJld2FyZCIsImNvaW5zIiwiaXRlbXMiLCJ3YXRjaEFkRm9yUmV3YXJkIiwidHlwZSIsImFkX3R5cGUiLCJnb2xkIiwiZ29iYWxfY291bnQiLCJhcmVuYV9jb2luIiwicmV3YXJkIiwicmVmcmVzaEJhbGFuY2UiLCJlbmNvZGVVUklDb21wb25lbnQiLCJ1bmRlZmluZWQiLCJhZGRTdGF0dXNMaXN0ZW5lciIsImxpc3RlbmVyIiwicHVzaCIsInJlbW92ZVN0YXR1c0xpc3RlbmVyIiwiaW5kZXgiLCJpbmRleE9mIiwic3BsaWNlIiwiZSIsImNvbnNvbGUiLCJlcnJvciIsInN0YXJ0Q291bnRkb3duIiwib25VcGRhdGUiLCJzZXRJbnRlcnZhbCIsInN0b3BDb3VudGRvd24iLCJjbGVhckFsbENvdW50ZG93bnMiLCJzaWduZWRVcEFyZW5hcyIsInNhdmVkQXQiLCJsb2NhbFN0b3JhZ2UiLCJzZXRJdGVtIiwiSlNPTiIsInN0cmluZ2lmeSIsImxvYWRGcm9tTG9jYWwiLCJkYXRhU3RyIiwiZ2V0SXRlbSIsInBhcnNlIiwiZmV0Y2hTaWdudXBTdGF0dXNGcm9tU2VydmVyIiwic2lnbmVkVXBSb29tcyIsInNpZ25lZF91cF9yb29tcyIsInJvb20iLCJzaWdudXBfdGltZSIsImNsZWFyQWxsU2lnbnVwU3RhdHVzIl0sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7OztBQUFBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBQSxNQUFNLENBQUNDLFNBQVMsR0FBRyxZQUFXO0VBQzFCLElBQUlDLElBQUksR0FBRyxDQUFDLENBQUM7O0VBRWI7O0VBRUE7RUFDQUEsSUFBSSxDQUFDQyxlQUFlLEdBQUcsQ0FBQyxDQUFDOztFQUV6QjtFQUNBRCxJQUFJLENBQUNFLGFBQWEsR0FBRyxDQUFDLENBQUM7O0VBRXZCO0VBQ0FGLElBQUksQ0FBQ0csZ0JBQWdCLEdBQUcsQ0FBQyxDQUFDOztFQUUxQjtFQUNBSCxJQUFJLENBQUNJLGdCQUFnQixHQUFHLEVBQUU7O0VBRTFCOztFQUVBO0FBQ0o7QUFDQTtBQUNBO0VBQ0lKLElBQUksQ0FBQ0ssWUFBWSxHQUFH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LENBQUNyRixDQUFDLENBQUM7VUFDM0JuQixJQUFJLENBQUNDLGVBQWUsQ0FBQ3lHLElBQUksQ0FBQzdFLE9BQU8sQ0FBQyxHQUFHO1lBQ2pDSyxVQUFVLEVBQUV3RSxJQUFJLENBQUNDLFdBQVc7WUFDNUJ0RSxNQUFNLEVBQUUsV0FBVztZQUNuQkcsUUFBUSxFQUFFa0UsSUFBSSxDQUFDakUsU0FBUztZQUN4QnFCLFNBQVMsRUFBRTRDLElBQUksQ0FBQzdDO1VBQ3BCLENBQUM7UUFDTDs7UUFFQTtRQUNBN0QsSUFBSSxDQUFDMEMsV0FBVyxFQUFFO01BQ3RCO01BRUFwQyxRQUFRLElBQUlBLFFBQVEsQ0FBQyxJQUFJLEVBQUVrRyxhQUFhLENBQUM7SUFDN0MsQ0FBQyxDQUNKO0VBQ0wsQ0FBQzs7RUFFRDtBQUNKO0FBQ0E7RUFDSXhHLElBQUksQ0FBQzRHLG9CQUFvQixHQUFHLFlBQVc7SUFDbkM1RyxJQUFJLENBQUNDLGVBQWUsR0FBRyxDQUFDLENBQUM7SUFDekJELElBQUksQ0FBQzBDLFdBQVcsRUFBRTtFQUN0QixDQUFDOztFQUVEO0VBQ0ExQyxJQUFJLENBQUNtRyxhQUFhLEVBQUU7RUFFcEIsT0FBT25HLElBQUk7QUFDZixDQUFDLEVBQUUiLCJzb3VyY2VSb290IjoiLyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICog56ue5oqA5Zy65pWw5o2u566h55CG5qih5Z2XXG4gKiDnlKjkuo7nrqHnkIbnq57mioDlnLrmiqXlkI3jgIHlgJLorqHml7bjgIHlpZblirHnrYnmlbDmja5cbiAqIFxuICog5Yqf6IO977yaXG4gKiAxLiDojrflj5bnq57mioDlnLrmiL/pl7TliJfooahcbiAqIDIuIOaKpeWQjS/lj5bmtojmiqXlkI1cbiAqIDMuIOiOt+WPluW8gOi1m+WAkuiuoeaXtlxuICogNC4g6I635Y+W5bey5oql5ZCN54q25oCBXG4gKi9cblxud2luZG93LmFyZW5hRGF0YSA9IGZ1bmN0aW9uKCkge1xuICAgIHZhciB0aGF0ID0ge307XG4gICAgXG4gICAgLy8gPT09PT09PT09PT09PT09PT09PT0g56ue5oqA5Zy654q25oCB5pWw5o2uID09PT09PT09PT09PT09PT09PT09XG4gICAgXG4gICAgLy8g5bey5oql5ZCN55qE56ue5oqA5Zy65YiX6KGoIHsgcm9vbUlkOiB7IHNpZ251cFRpbWUsIHN0YXR1cywgY291bnRkb3duRW5kIH0gfVxuICAgIHRoYXQuX3NpZ25lZFVwQXJlbmFzID0ge307XG4gICAgXG4gICAgLy8g56ue5oqA5Zy66K+m5oOF57yT5a2YIHsgcm9vbUlkOiBhcmVuYUNvbmZpZyB9XG4gICAgdGhhdC5fYXJlbmFEZXRhaWxzID0ge307XG4gICAgXG4gICAgLy8g5YCS6K6h5pe25a6a5pe25ZmoXG4gICAgdGhhdC5fY291bnRkb3duVGltZXJzID0ge307XG4gICAgXG4gICAgLy8g54q25oCB5Y+Y5pu055uR5ZCs5ZmoXG4gICAgdGhhdC5fc3RhdHVzTGlzdGVuZXJzID0gW107XG4gICAgXG4gICAgLy8gPT09PT09PT09PT09PT09PT09PT0gQVBJIOaWueazlSA9PT09PT09PT09PT09PT09PT09PVxuICAgIFxuICAgIC8qKlxuICAgICAqIOiOt+WPluernuaKgOWcuuaIv+mXtOWIl+ihqFxuICAgICAqIEBwYXJhbSB7RnVuY3Rpb259IGNhbGxiYWNrIC0g5Zue6LCD5Ye95pWwIChlcnIsIGFyZW5hTGlzdClcbiAgICAgKi9cbiAgICB0aGF0LmdldEFyZW5hTGlzdCA9IGZ1bmN0aW9uKGNhbGxiYWNrKSB7XG4gICAgICAgIHZhciBhcGlVcmwgPSB3aW5kb3cuZGVmaW5lcyA/IHdpbmRvdy5kZWZpbmVzLmFwaVVybCA6ICcnO1xuICAgICAgICB2YXIgY3J5cHRvS2V5ID0gd2luZG93LmRlZmluZXMgPyB3aW5kb3cuZGVmaW5lcy5jcnlwdG9LZXkgOiAnJztcbiAgICAgICAgXG4gICAgICAgIGlmICghYXBpVXJsIHx8ICF3aW5kb3cuSHR0cEFQSSkge1xuICAgICAgICAgICAgY2FsbGJhY2sgJiYgY2FsbGJhY2soJ0FQSeacqumFjee9ricsIG51bGwpO1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIFxuICAgICAgICBIdHRwQVBJLmdldChcbiAgICAgICAgICAgIGFwaVVybCArICcvYXBpL3YxL2FyZW5hL2xpc3QnLFxuICAgICAgICAgICAgY3J5cHRvS2V5LFxuICAgICAgICAgICAgZnVuY3Rpb24oZXJyLCByZXN1bHQpIHtcbiAgICAgICAgICAgICAgICBpZiAoZXJyKSB7XG4gICAgICAgICAgICAgICAgICAgIGNhbGxiYWNrICYmIGNhbGxiYWNrKGVyciwgbnVsbCk7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgdmFyIGFyZW5hTGlzdCA9IG51bGw7XG4gICAgICAgICAgICAgICAgaWYgKHJlc3VsdCAmJiByZXN1bHQuY29kZSA9PT0gMCAmJiByZXN1bHQuZGF0YSkge1xuICAgICAgICAgICAgICAgICAgICBhcmVuYUxpc3QgPSByZXN1bHQuZGF0YTtcbiAgICAgICAgICAgICAgICB9IGVsc2UgaWYgKHJlc3VsdCAmJiBBcnJheS5pc0FycmF5KHJlc3VsdCkpIHtcbiAgICAgICAgICAgICAgICAgICAgYXJlbmFMaXN0ID0gcmVzdWx0O1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICBpZiAoYXJlbmFMaXN0KSB7XG4gICAgICAgICAgICAgICAgICAgIC8vIOe8k+WtmOernuaKgOWcuuivpuaDhVxuICAgICAgICAgICAgICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IGFyZW5hTGlzdC5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgICAgICAgICAgICAgdmFyIGFyZW5hID0gYXJlbmFMaXN0W2ldO1xuICAgICAgICAgICAgICAgICAgICAgICAgdGhhdC5fYXJlbmFEZXRhaWxzW2FyZW5hLmlkXSA9IGFyZW5hO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIGNhbGxiYWNrICYmIGNhbGxiYWNrKG51bGwsIGFyZW5hTGlzdCk7XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgY2FsbGJhY2sgJiYgY2FsbGJhY2soJ+iOt+WPluernuaKgOWcuuWIl+ihqOWksei0pScsIG51bGwpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgKTtcbiAgICB9O1xuICAgIFxuICAgIC8qKlxuICAgICAqIOaKpeWQjeernuaKgOWculxuICAgICAqIEBwYXJhbSB7TnVtYmVyfSByb29tSWQgLSDnq57mioDlnLrmiL/pl7RJRFxuICAgICAqIEBwYXJhbSB7RnVuY3Rpb259IGNhbGxiYWNrIC0g5Zue6LCD5Ye95pWwIChlcnIsIHJlc3VsdClcbiAgICAgKi9cbiAgICB0aGF0LnNpZ251cCA9IGZ1bmN0aW9uKHJvb21JZCwgY2FsbGJhY2spIHtcbiAgICAgICAgdmFyIGFwaVVybCA9IHdpbmRvdy5kZWZpbmVzID8gd2luZG93LmRlZmluZXMuYXBpVXJsIDogJyc7XG4gICAgICAgIHZhciBjcnlwdG9LZXkgPSB3aW5kb3cuZGVmaW5lcyA/IHdpbmRvdy5kZWZpbmVzLmNyeXB0b0tleSA6ICcnO1xuICAgICAgICB2YXIgdG9rZW4gPSB3aW5kb3cubXlnbG9iYWwgJiYgd2luZG93Lm15Z2xvYmFsLnBsYXllckRhdGEgPyB3aW5kb3cubXlnbG9iYWwucGxheWVyRGF0YS50b2tlbiA6ICcnO1xuICAgICAgICBcbiAgICAgICAgaWYgKCFhcGlVcmwgfHwgIXdpbmRvdy5IdHRwQVBJKSB7XG4gICAgICAgICAgICBjYWxsYmFjayAmJiBjYWxsYmFjaygnQVBJ5pyq6YWN572uJywgbnVsbCk7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgICAgXG4gICAgICAgIHZhciByZXF1ZXN0RGF0YSA9IHtcbiAgICAgICAgICAgIHJvb21faWQ6IHJvb21JZCxcbiAgICAgICAgICAgIHRva2VuOiB0b2tlblxuICAgICAgICB9O1xuICAgICAgICBcbiAgICAgICAgSHR0cEFQSS5wb3N0KFxuICAgICAgICAgICAgYXBpVXJsICsgJy9hcGkvdjEvYXJlbmEvc2lnbnVwJyxcbiAgICAgICAgICAgIHJlcXVlc3REYXRhLFxuICAgICAgICAgICAgY3J5cHRvS2V5LFxuICAgICAgICAgICAgZnVuY3Rpb24oZXJyLCByZXN1bHQpIHtcbiAgICAgICAgICAgICAgICBpZiAoZXJyKSB7XG4gICAgICAgICAgICAgICAgICAgIGNhbGxiYWNrICYmIGNhbGxiYWNrKGVyciwgbnVsbCk7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgaWYgKHJlc3VsdCAmJiAocmVzdWx0LmNvZGUgPT09IDAgfHwgcmVzdWx0LnN1Y2Nlc3MpKSB7XG4gICAgICAgICAgICAgICAgICAgIC8vIOiusOW9leaKpeWQjeaIkOWKn1xuICAgICAgICAgICAgICAgICAgICB2YXIgYXJlbmFDb25maWcgPSB0aGF0Ll9hcmVuYURldGFpbHNbcm9vbUlkXSB8fCB7fTtcbiAgICAgICAgICAgICAgICAgICAgdGhhdC5fc2lnbmVkVXBBcmVuYXNbcm9vbUlkXSA9IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHNpZ251cFRpbWU6IERhdGUubm93KCksXG4gICAgICAgICAgICAgICAgICAgICAgICBzdGF0dXM6ICdzaWduZWRfdXAnLFxuICAgICAgICAgICAgICAgICAgICAgICAgY291bnRkb3duRW5kOiByZXN1bHQuZGF0YSA/IHJlc3VsdC5kYXRhLnN0YXJ0X3RpbWUgOiBudWxsLFxuICAgICAgICAgICAgICAgICAgICAgICAgYXJlbmFDb25maWc6IGFyZW5hQ29uZmlnLFxuICAgICAgICAgICAgICAgICAgICAgICAgcGVyaW9kTm86IHJlc3VsdC5wZXJpb2Rfbm8gfHwgcmVzdWx0LmRhdGE/LnBlcmlvZF9ub1xuICAgICAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICAgICAgLy8g8J+Up+OAkOaWsOWinuOAkeS/neWtmOWIsOacrOWcsOWtmOWCqFxuICAgICAgICAgICAgICAgICAgICB0aGF0LnNhdmVUb0xvY2FsKCk7XG4gICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgICAgICAvLyDpgJrnn6XnirbmgIHlj5jmm7RcbiAgICAgICAgICAgICAgICAgICAgdGhhdC5fbm90aWZ5U3RhdHVzQ2hhbmdlKHJvb21JZCwgJ3NpZ25lZF91cCcpO1xuICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICAgICAgY2FsbGJhY2sgJiYgY2FsbGJhY2sobnVsbCwge1xuICAgICAgICAgICAgICAgICAgICAgICAgc3VjY2VzczogdHJ1ZSxcbiAgICAgICAgICAgICAgICAgICAgICAgIG1lc3NhZ2U6IHJlc3VsdC5tZXNzYWdlIHx8ICfmiqXlkI3miJDlip8nLFxuICAgICAgICAgICAgICAgICAgICAgICAgc3RhcnRfdGltZTogcmVzdWx0LmRhdGEgPyByZXN1bHQuZGF0YS5zdGFydF90aW1lIDogbnVsbFxuICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICBjYWxsYmFjayAmJiBjYWxsYmFjayhyZXN1bHQgPyByZXN1bHQubWVzc2FnZSA6ICfmiqXlkI3lpLHotKUnLCBudWxsKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICk7XG4gICAgfTtcbiAgICBcbiAgICAvKipcbiAgICAgKiDlj5bmtojmiqXlkI1cbiAgICAgKiBAcGFyYW0ge051bWJlcn0gcm9vbUlkIC0g56ue5oqA5Zy65oi/6Ze0SURcbiAgICAgKiBAcGFyYW0ge0Z1bmN0aW9ufSBjYWxsYmFjayAtIOWbnuiwg+WHveaVsCAoZXJyLCByZXN1bHQpXG4gICAgICovXG4gICAgdGhhdC5jYW5jZWxTaWdudXAgPSBmdW5jdGlvbihyb29tSWQsIGNhbGxiYWNrKSB7XG4gICAgICAgIHZhciBhcGlVcmwgPSB3aW5kb3cuZGVmaW5lcyA/IHdpbmRvdy5kZWZpbmVzLmFwaVVybCA6ICcnO1xuICAgICAgICB2YXIgY3J5cHRvS2V5ID0gd2luZG93LmRlZmluZXMgPyB3aW5kb3cuZGVmaW5lcy5jcnlwdG9LZXkgOiAnJztcbiAgICAgICAgdmFyIHRva2VuID0gd2luZG93Lm15Z2xvYmFsICYmIHdpbmRvdy5teWdsb2JhbC5wbGF5ZXJEYXRhID8gd2luZG93Lm15Z2xvYmFsLnBsYXllckRhdGEudG9rZW4gOiAnJztcbiAgICAgICAgXG4gICAgICAgIGlmICghYXBpVXJsIHx8ICF3aW5kb3cuSHR0cEFQSSkge1xuICAgICAgICAgICAgY2FsbGJhY2sgJiYgY2FsbGJhY2soJ0FQSeacqumFjee9ricsIG51bGwpO1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIFxuICAgICAgICB2YXIgcmVxdWVzdERhdGEgPSB7XG4gICAgICAgICAgICByb29tX2lkOiByb29tSWQsXG4gICAgICAgICAgICB0b2tlbjogdG9rZW5cbiAgICAgICAgfTtcbiAgICAgICAgXG4gICAgICAgIEh0dHBBUEkucG9zdChcbiAgICAgICAgICAgIGFwaVVybCArICcvYXBpL3YxL2FyZW5hL2NhbmNlbCcsXG4gICAgICAgICAgICByZXF1ZXN0RGF0YSxcbiAgICAgICAgICAgIGNyeXB0b0tleSxcbiAgICAgICAgICAgIGZ1bmN0aW9uKGVyciwgcmVzdWx0KSB7XG4gICAgICAgICAgICAgICAgaWYgKGVycikge1xuICAgICAgICAgICAgICAgICAgICBjYWxsYmFjayAmJiBjYWxsYmFjayhlcnIsIG51bGwpO1xuICAgICAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgIGlmIChyZXN1bHQgJiYgKHJlc3VsdC5jb2RlID09PSAwIHx8IHJlc3VsdC5zdWNjZXNzKSkge1xuICAgICAgICAgICAgICAgICAgICAvLyDmuIXpmaTmiqXlkI3orrDlvZVcbiAgICAgICAgICAgICAgICAgICAgZGVsZXRlIHRoYXQuX3NpZ25lZFVwQXJlbmFzW3Jvb21JZF07XG4gICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgICAgICAvLyDwn5Sn44CQ5paw5aKe44CR5L+d5a2Y5Yiw5pys5Zyw5a2Y5YKoXG4gICAgICAgICAgICAgICAgICAgIHRoYXQuc2F2ZVRvTG9jYWwoKTtcbiAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgICAgIC8vIOa4hemZpOWAkuiuoeaXtuWumuaXtuWZqFxuICAgICAgICAgICAgICAgICAgICBpZiAodGhhdC5fY291bnRkb3duVGltZXJzW3Jvb21JZF0pIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNsZWFySW50ZXJ2YWwodGhhdC5fY291bnRkb3duVGltZXJzW3Jvb21JZF0pO1xuICAgICAgICAgICAgICAgICAgICAgICAgZGVsZXRlIHRoYXQuX2NvdW50ZG93blRpbWVyc1tyb29tSWRdO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgICAgICAvLyDpgJrnn6XnirbmgIHlj5jmm7RcbiAgICAgICAgICAgICAgICAgICAgdGhhdC5fbm90aWZ5U3RhdHVzQ2hhbmdlKHJvb21JZCwgJ2NhbmNlbGxlZCcpO1xuICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICAgICAgY2FsbGJhY2sgJiYgY2FsbGJhY2sobnVsbCwgeyBzdWNjZXNzOiB0cnVlLCBtZXNzYWdlOiAn5Y+W5raI5oql5ZCN5oiQ5YqfJyB9KTtcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICBjYWxsYmFjayAmJiBjYWxsYmFjayhyZXN1bHQgPyByZXN1bHQubWVzc2FnZSA6ICflj5bmtojmiqXlkI3lpLHotKUnLCBudWxsKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICk7XG4gICAgfTtcbiAgICBcbiAgICAvKipcbiAgICAgKiDojrflj5blt7LmiqXlkI3nirbmgIFcbiAgICAgKiBAcGFyYW0ge051bWJlcn0gcm9vbUlkIC0g56ue5oqA5Zy65oi/6Ze0SURcbiAgICAgKiBAcmV0dXJucyB7T2JqZWN0fG51bGx9IOaKpeWQjeS/oeaBr+aIlm51bGxcbiAgICAgKi9cbiAgICB0aGF0LmdldFNpZ251cFN0YXR1cyA9IGZ1bmN0aW9uKHJvb21JZCkge1xuICAgICAgICByZXR1cm4gdGhhdC5fc2lnbmVkVXBBcmVuYXNbcm9vbUlkXSB8fCBudWxsO1xuICAgIH07XG4gICAgXG4gICAgLyoqXG4gICAgICog5qOA5p+l5piv5ZCm5bey5oql5ZCNXG4gICAgICogQHBhcmFtIHtOdW1iZXJ9IHJvb21JZCAtIOernuaKgOWcuuaIv+mXtElEXG4gICAgICogQHJldHVybnMge0Jvb2xlYW59XG4gICAgICovXG4gICAgdGhhdC5pc1NpZ25lZFVwID0gZnVuY3Rpb24ocm9vbUlkKSB7XG4gICAgICAgIHJldHVybiAhIXRoYXQuX3NpZ25lZFVwQXJlbmFzW3Jvb21JZF07XG4gICAgfTtcbiAgICBcbiAgICAvKipcbiAgICAgKiDojrflj5blvIDotZvlgJLorqHml7bvvIjnp5LvvIlcbiAgICAgKiBAcGFyYW0ge051bWJlcn0gcm9vbUlkIC0g56ue5oqA5Zy65oi/6Ze0SURcbiAgICAgKiBAcmV0dXJucyB7TnVtYmVyfSDlgJLorqHml7bnp5LmlbDvvIwtMeihqOekuuacquaKpeWQjeaIluaXoOWAkuiuoeaXtlxuICAgICAqL1xuICAgIHRoYXQuZ2V0Q291bnRkb3duID0gZnVuY3Rpb24ocm9vbUlkKSB7XG4gICAgICAgIHZhciBzaWdudXAgPSB0aGF0Ll9zaWduZWRVcEFyZW5hc1tyb29tSWRdO1xuICAgICAgICBpZiAoIXNpZ251cCB8fCAhc2lnbnVwLmNvdW50ZG93bkVuZCkge1xuICAgICAgICAgICAgcmV0dXJuIC0xO1xuICAgICAgICB9XG4gICAgICAgIFxuICAgICAgICB2YXIgbm93ID0gRGF0ZS5ub3coKTtcbiAgICAgICAgdmFyIHJlbWFpbmluZyA9IE1hdGguZmxvb3IoKHNpZ251cC5jb3VudGRvd25FbmQgLSBub3cpIC8gMTAwMCk7XG4gICAgICAgIHJldHVybiByZW1haW5pbmcgPiAwID8gcmVtYWluaW5nIDogMDtcbiAgICB9O1xuICAgIFxuICAgIC8qKlxuICAgICAqIOagvOW8j+WMluWAkuiuoeaXtuaYvuekulxuICAgICAqIEBwYXJhbSB7TnVtYmVyfSBzZWNvbmRzIC0g56eS5pWwXG4gICAgICogQHJldHVybnMge1N0cmluZ30g5qC85byP5YyW5ZCO55qE5pe26Ze05a2X56ym5LiyXG4gICAgICovXG4gICAgdGhhdC5mb3JtYXRDb3VudGRvd24gPSBmdW5jdGlvbihzZWNvbmRzKSB7XG4gICAgICAgIGlmIChzZWNvbmRzIDwgMCkgcmV0dXJuICcnO1xuICAgICAgICBpZiAoc2Vjb25kcyA9PT0gMCkgcmV0dXJuICfljbPlsIblvIDotZsnO1xuICAgICAgICBcbiAgICAgICAgdmFyIGhvdXJzID0gTWF0aC5mbG9vcihzZWNvbmRzIC8gMzYwMCk7XG4gICAgICAgIHZhciBtaW51dGVzID0gTWF0aC5mbG9vcigoc2Vjb25kcyAlIDM2MDApIC8gNjApO1xuICAgICAgICB2YXIgc2VjcyA9IHNlY29uZHMgJSA2MDtcbiAgICAgICAgXG4gICAgICAgIGlmIChob3VycyA+IDApIHtcbiAgICAgICAgICAgIHJldHVybiBob3VycyArICc6JyArIChtaW51dGVzIDwgMTAgPyAnMCcgOiAnJykgKyBtaW51dGVzICsgJzonICsgKHNlY3MgPCAxMCA/ICcwJyA6ICcnKSArIHNlY3M7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICByZXR1cm4gKG1pbnV0ZXMgPCAxMCA/ICcwJyA6ICcnKSArIG1pbnV0ZXMgKyAnOicgKyAoc2VjcyA8IDEwID8gJzAnIDogJycpICsgc2VjcztcbiAgICAgICAgfVxuICAgIH07XG4gICAgXG4gICAgLyoqXG4gICAgICog6I635Y+W56ue5oqA5Zy66YWN572uXG4gICAgICogQHBhcmFtIHtOdW1iZXJ9IHJvb21JZCAtIOernuaKgOWcuuaIv+mXtElEXG4gICAgICogQHJldHVybnMge09iamVjdHxudWxsfVxuICAgICAqL1xuICAgIHRoYXQuZ2V0QXJlbmFDb25maWcgPSBmdW5jdGlvbihyb29tSWQpIHtcbiAgICAgICAgcmV0dXJuIHRoYXQuX2FyZW5hRGV0YWlsc1tyb29tSWRdIHx8IG51bGw7XG4gICAgfTtcbiAgICBcbiAgICAvKipcbiAgICAgKiDojrflj5bmiqXlkI3otLlcbiAgICAgKiBAcGFyYW0ge09iamVjdH0gcm9vbUNvbmZpZyAtIOaIv+mXtOmFjee9rlxuICAgICAqIEByZXR1cm5zIHtOdW1iZXJ9IOaKpeWQjei0ue+8iOernuaKgOW4ge+8iVxuICAgICAqL1xuICAgIHRoYXQuZ2V0U2lnbnVwRmVlID0gZnVuY3Rpb24ocm9vbUNvbmZpZykge1xuICAgICAgICByZXR1cm4gcm9vbUNvbmZpZy5zaWdudXBfZmVlIHx8IHJvb21Db25maWcuc2lnbnVwRmVlIHx8IDA7XG4gICAgfTtcbiAgICBcbiAgICAvKipcbiAgICAgKiDojrflj5blhqDlhpvlpZblirHpooTop4hcbiAgICAgKiBAcGFyYW0ge09iamVjdH0gcm9vbUNvbmZpZyAtIOaIv+mXtOmFjee9rlxuICAgICAqIEByZXR1cm5zIHtPYmplY3R9IHsgY29pbnM6IE51bWJlciwgaXRlbXM6IEFycmF5IH1cbiAgICAgKi9cbiAgICB0aGF0LmdldENoYW1waW9uUmV3YXJkID0gZnVuY3Rpb24ocm9vbUNvbmZpZykge1xuICAgICAgICByZXR1cm4gcm9vbUNvbmZpZy5jaGFtcGlvbl9yZXdhcmQgfHwgcm9vbUNvbmZpZy5jaGFtcGlvblJld2FyZCB8fCB7IGNvaW5zOiAwLCBpdGVtczogW10gfTtcbiAgICB9O1xuICAgIFxuICAgIC8qKlxuICAgICAqIOingueci+W5v+WRiuiOt+WPluWlluWKsVxuICAgICAqIEBwYXJhbSB7U3RyaW5nfSB0eXBlIC0g5aWW5Yqx57G75Z6LICgnZ29sZCcg5oiWICdhcmVuYV9jb2luJylcbiAgICAgKiBAcGFyYW0ge0Z1bmN0aW9ufSBjYWxsYmFjayAtIOWbnuiwg+WHveaVsCAoZXJyLCByZXN1bHQpXG4gICAgICovXG4gICAgdGhhdC53YXRjaEFkRm9yUmV3YXJkID0gZnVuY3Rpb24odHlwZSwgY2FsbGJhY2spIHtcbiAgICAgICAgdmFyIGFwaVVybCA9IHdpbmRvdy5kZWZpbmVzID8gd2luZG93LmRlZmluZXMuYXBpVXJsIDogJyc7XG4gICAgICAgIHZhciBjcnlwdG9LZXkgPSB3aW5kb3cuZGVmaW5lcyA/IHdpbmRvdy5kZWZpbmVzLmNyeXB0b0tleSA6ICcnO1xuICAgICAgICB2YXIgdG9rZW4gPSB3aW5kb3cubXlnbG9iYWwgJiYgd2luZG93Lm15Z2xvYmFsLnBsYXllckRhdGEgPyB3aW5kb3cubXlnbG9iYWwucGxheWVyRGF0YS50b2tlbiA6ICcnO1xuICAgICAgICBcbiAgICAgICAgaWYgKCFhcGlVcmwgfHwgIXdpbmRvdy5IdHRwQVBJKSB7XG4gICAgICAgICAgICBjYWxsYmFjayAmJiBjYWxsYmFjaygnQVBJ5pyq6YWN572uJywgbnVsbCk7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgICAgXG4gICAgICAgIHZhciByZXF1ZXN0RGF0YSA9IHtcbiAgICAgICAgICAgIHRva2VuOiB0b2tlbixcbiAgICAgICAgICAgIHR5cGU6IHR5cGUsXG4gICAgICAgICAgICBhZF90eXBlOiAncmV3YXJkX3ZpZGVvJ1xuICAgICAgICB9O1xuICAgICAgICBcbiAgICAgICAgSHR0cEFQSS5wb3N0KFxuICAgICAgICAgICAgYXBpVXJsICsgJy9hcGkvYWQvcmV3YXJkJyxcbiAgICAgICAgICAgIHJlcXVlc3REYXRhLFxuICAgICAgICAgICAgY3J5cHRvS2V5LFxuICAgICAgICAgICAgZnVuY3Rpb24oZXJyLCByZXN1bHQpIHtcbiAgICAgICAgICAgICAgICBpZiAoZXJyKSB7XG4gICAgICAgICAgICAgICAgICAgIGNhbGxiYWNrICYmIGNhbGxiYWNrKGVyciwgbnVsbCk7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgaWYgKHJlc3VsdCAmJiAocmVzdWx0LmNvZGUgPT09IDAgfHwgcmVzdWx0LnN1Y2Nlc3MpKSB7XG4gICAgICAgICAgICAgICAgICAgIC8vIOabtOaWsOeOqeWutuaVsOaNrlxuICAgICAgICAgICAgICAgICAgICBpZiAod2luZG93Lm15Z2xvYmFsICYmIHdpbmRvdy5teWdsb2JhbC5wbGF5ZXJEYXRhKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAocmVzdWx0LmRhdGEpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAocmVzdWx0LmRhdGEuZ29sZCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB3aW5kb3cubXlnbG9iYWwucGxheWVyRGF0YS5nb2JhbF9jb3VudCA9IHJlc3VsdC5kYXRhLmdvbGQ7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChyZXN1bHQuZGF0YS5hcmVuYV9jb2luKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHdpbmRvdy5teWdsb2JhbC5wbGF5ZXJEYXRhLmFyZW5hX2NvaW4gPSByZXN1bHQuZGF0YS5hcmVuYV9jb2luO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB3aW5kb3cubXlnbG9iYWwucGxheWVyRGF0YS5zYXZlVG9Mb2NhbCgpO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgICAgICBjYWxsYmFjayAmJiBjYWxsYmFjayhudWxsLCB7XG4gICAgICAgICAgICAgICAgICAgICAgICBzdWNjZXNzOiB0cnVlLFxuICAgICAgICAgICAgICAgICAgICAgICAgcmV3YXJkOiByZXN1bHQuZGF0YSB8fCB7fVxuICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICBjYWxsYmFjayAmJiBjYWxsYmFjayhyZXN1bHQgPyByZXN1bHQubWVzc2FnZSA6ICfojrflj5blpZblirHlpLHotKUnLCBudWxsKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICk7XG4gICAgfTtcbiAgICBcbiAgICAvKipcbiAgICAgKiDliLfmlrDnjqnlrrbotKfluIHkvZnpop1cbiAgICAgKiBAcGFyYW0ge0Z1bmN0aW9ufSBjYWxsYmFjayAtIOWbnuiwg+WHveaVsCAoZXJyLCBkYXRhKVxuICAgICAqL1xuICAgIHRoYXQucmVmcmVzaEJhbGFuY2UgPSBmdW5jdGlvbihjYWxsYmFjaykge1xuICAgICAgICB2YXIgYXBpVXJsID0gd2luZG93LmRlZmluZXMgPyB3aW5kb3cuZGVmaW5lcy5hcGlVcmwgOiAnJztcbiAgICAgICAgdmFyIGNyeXB0b0tleSA9IHdpbmRvdy5kZWZpbmVzID8gd2luZG93LmRlZmluZXMuY3J5cHRvS2V5IDogJyc7XG4gICAgICAgIHZhciB0b2tlbiA9IHdpbmRvdy5teWdsb2JhbCAmJiB3aW5kb3cubXlnbG9iYWwucGxheWVyRGF0YSA/IHdpbmRvdy5teWdsb2JhbC5wbGF5ZXJEYXRhLnRva2VuIDogJyc7XG4gICAgICAgIFxuICAgICAgICBpZiAoIWFwaVVybCB8fCAhd2luZG93Lkh0dHBBUEkpIHtcbiAgICAgICAgICAgIGNhbGxiYWNrICYmIGNhbGxiYWNrKCdBUEnmnKrphY3nva4nLCBudWxsKTtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgICBcbiAgICAgICAgSHR0cEFQSS5nZXQoXG4gICAgICAgICAgICBhcGlVcmwgKyAnL2FwaS92MS9wbGF5ZXIvYmFsYW5jZT90b2tlbj0nICsgZW5jb2RlVVJJQ29tcG9uZW50KHRva2VuKSxcbiAgICAgICAgICAgIGNyeXB0b0tleSxcbiAgICAgICAgICAgIGZ1bmN0aW9uKGVyciwgcmVzdWx0KSB7XG4gICAgICAgICAgICAgICAgaWYgKGVycikge1xuICAgICAgICAgICAgICAgICAgICBjYWxsYmFjayAmJiBjYWxsYmFjayhlcnIsIG51bGwpO1xuICAgICAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgIGlmIChyZXN1bHQgJiYgKHJlc3VsdC5jb2RlID09PSAwIHx8IHJlc3VsdC5kYXRhKSkge1xuICAgICAgICAgICAgICAgICAgICB2YXIgZGF0YSA9IHJlc3VsdC5kYXRhIHx8IHJlc3VsdDtcbiAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgICAgIC8vIOabtOaWsOeOqeWutuaVsOaNrlxuICAgICAgICAgICAgICAgICAgICBpZiAod2luZG93Lm15Z2xvYmFsICYmIHdpbmRvdy5teWdsb2JhbC5wbGF5ZXJEYXRhKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoZGF0YS5nb2xkICE9PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB3aW5kb3cubXlnbG9iYWwucGxheWVyRGF0YS5nb2JhbF9jb3VudCA9IGRhdGEuZ29sZDtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChkYXRhLmFyZW5hX2NvaW4gIT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHdpbmRvdy5teWdsb2JhbC5wbGF5ZXJEYXRhLmFyZW5hX2NvaW4gPSBkYXRhLmFyZW5hX2NvaW47XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICB3aW5kb3cubXlnbG9iYWwucGxheWVyRGF0YS5zYXZlVG9Mb2NhbCgpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgICAgICBjYWxsYmFjayAmJiBjYWxsYmFjayhudWxsLCBkYXRhKTtcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICBjYWxsYmFjayAmJiBjYWxsYmFjayhyZXN1bHQgPyByZXN1bHQubWVzc2FnZSA6ICfojrflj5bkvZnpop3lpLHotKUnLCBudWxsKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICk7XG4gICAgfTtcbiAgICBcbiAgICAvLyA9PT09PT09PT09PT09PT09PT09PSDnirbmgIHnm5HlkKwgPT09PT09PT09PT09PT09PT09PT1cbiAgICBcbiAgICAvKipcbiAgICAgKiDmt7vliqDnirbmgIHlj5jmm7Tnm5HlkKzlmahcbiAgICAgKiBAcGFyYW0ge0Z1bmN0aW9ufSBsaXN0ZW5lciAtIOebkeWQrOWHveaVsCAocm9vbUlkLCBzdGF0dXMpXG4gICAgICovXG4gICAgdGhhdC5hZGRTdGF0dXNMaXN0ZW5lciA9IGZ1bmN0aW9uKGxpc3RlbmVyKSB7XG4gICAgICAgIHRoYXQuX3N0YXR1c0xpc3RlbmVycy5wdXNoKGxpc3RlbmVyKTtcbiAgICB9O1xuICAgIFxuICAgIC8qKlxuICAgICAqIOenu+mZpOeKtuaAgeWPmOabtOebkeWQrOWZqFxuICAgICAqIEBwYXJhbSB7RnVuY3Rpb259IGxpc3RlbmVyIC0g55uR5ZCs5Ye95pWwXG4gICAgICovXG4gICAgdGhhdC5yZW1vdmVTdGF0dXNMaXN0ZW5lciA9IGZ1bmN0aW9uKGxpc3RlbmVyKSB7XG4gICAgICAgIHZhciBpbmRleCA9IHRoYXQuX3N0YXR1c0xpc3RlbmVycy5pbmRleE9mKGxpc3RlbmVyKTtcbiAgICAgICAgaWYgKGluZGV4ID4gLTEpIHtcbiAgICAgICAgICAgIHRoYXQuX3N0YXR1c0xpc3RlbmVycy5zcGxpY2UoaW5kZXgsIDEpO1xuICAgICAgICB9XG4gICAgfTtcbiAgICBcbiAgICAvKipcbiAgICAgKiDpgJrnn6XnirbmgIHlj5jmm7RcbiAgICAgKiBAcGFyYW0ge051bWJlcn0gcm9vbUlkIC0g5oi/6Ze0SURcbiAgICAgKiBAcGFyYW0ge1N0cmluZ30gc3RhdHVzIC0g5paw54q25oCBXG4gICAgICovXG4gICAgdGhhdC5fbm90aWZ5U3RhdHVzQ2hhbmdlID0gZnVuY3Rpb24ocm9vbUlkLCBzdGF0dXMpIHtcbiAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCB0aGF0Ll9zdGF0dXNMaXN0ZW5lcnMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgICAgdGhhdC5fc3RhdHVzTGlzdGVuZXJzW2ldKHJvb21JZCwgc3RhdHVzKTtcbiAgICAgICAgICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgICAgICAgICAgICBjb25zb2xlLmVycm9yKCfnirbmgIHnm5HlkKzlmajmiafooYzplJnor686JywgZSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9O1xuICAgIFxuICAgIC8vID09PT09PT09PT09PT09PT09PT09IOWAkuiuoeaXtueuoeeQhiA9PT09PT09PT09PT09PT09PT09PVxuICAgIFxuICAgIC8qKlxuICAgICAqIOWQr+WKqOWAkuiuoeaXtuabtOaWsFxuICAgICAqIEBwYXJhbSB7TnVtYmVyfSByb29tSWQgLSDmiL/pl7RJRFxuICAgICAqIEBwYXJhbSB7RnVuY3Rpb259IG9uVXBkYXRlIC0g5pu05paw5Zue6LCDIChzZWNvbmRzKVxuICAgICAqL1xuICAgIHRoYXQuc3RhcnRDb3VudGRvd24gPSBmdW5jdGlvbihyb29tSWQsIG9uVXBkYXRlKSB7XG4gICAgICAgIC8vIOa4hemZpOaXp+eahOWumuaXtuWZqFxuICAgICAgICBpZiAodGhhdC5fY291bnRkb3duVGltZXJzW3Jvb21JZF0pIHtcbiAgICAgICAgICAgIGNsZWFySW50ZXJ2YWwodGhhdC5fY291bnRkb3duVGltZXJzW3Jvb21JZF0pO1xuICAgICAgICB9XG4gICAgICAgIFxuICAgICAgICB0aGF0Ll9jb3VudGRvd25UaW1lcnNbcm9vbUlkXSA9IHNldEludGVydmFsKGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgdmFyIHNlY29uZHMgPSB0aGF0LmdldENvdW50ZG93bihyb29tSWQpO1xuICAgICAgICAgICAgb25VcGRhdGUgJiYgb25VcGRhdGUoc2Vjb25kcyk7XG4gICAgICAgICAgICBcbiAgICAgICAgICAgIC8vIOWAkuiuoeaXtue7k+adn1xuICAgICAgICAgICAgaWYgKHNlY29uZHMgPD0gMCkge1xuICAgICAgICAgICAgICAgIGNsZWFySW50ZXJ2YWwodGhhdC5fY291bnRkb3duVGltZXJzW3Jvb21JZF0pO1xuICAgICAgICAgICAgICAgIGRlbGV0ZSB0aGF0Ll9jb3VudGRvd25UaW1lcnNbcm9vbUlkXTtcbiAgICAgICAgICAgICAgICB0aGF0Ll9ub3RpZnlTdGF0dXNDaGFuZ2Uocm9vbUlkLCAnc3RhcnRpbmcnKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSwgMTAwMCk7XG4gICAgfTtcbiAgICBcbiAgICAvKipcbiAgICAgKiDlgZzmraLlgJLorqHml7ZcbiAgICAgKiBAcGFyYW0ge051bWJlcn0gcm9vbUlkIC0g5oi/6Ze0SURcbiAgICAgKi9cbiAgICB0aGF0LnN0b3BDb3VudGRvd24gPSBmdW5jdGlvbihyb29tSWQpIHtcbiAgICAgICAgaWYgKHRoYXQuX2NvdW50ZG93blRpbWVyc1tyb29tSWRdKSB7XG4gICAgICAgICAgICBjbGVhckludGVydmFsKHRoYXQuX2NvdW50ZG93blRpbWVyc1tyb29tSWRdKTtcbiAgICAgICAgICAgIGRlbGV0ZSB0aGF0Ll9jb3VudGRvd25UaW1lcnNbcm9vbUlkXTtcbiAgICAgICAgfVxuICAgIH07XG4gICAgXG4gICAgLyoqXG4gICAgICog5riF6Zmk5omA5pyJ5YCS6K6h5pe2XG4gICAgICovXG4gICAgdGhhdC5jbGVhckFsbENvdW50ZG93bnMgPSBmdW5jdGlvbigpIHtcbiAgICAgICAgZm9yICh2YXIgcm9vbUlkIGluIHRoYXQuX2NvdW50ZG93blRpbWVycykge1xuICAgICAgICAgICAgY2xlYXJJbnRlcnZhbCh0aGF0Ll9jb3VudGRvd25UaW1lcnNbcm9vbUlkXSk7XG4gICAgICAgIH1cbiAgICAgICAgdGhhdC5fY291bnRkb3duVGltZXJzID0ge307XG4gICAgfTtcbiAgICBcbiAgICAvLyA9PT09PT09PT09PT09PT09PT09PSDmnKzlnLDlrZjlgqggPT09PT09PT09PT09PT09PT09PT1cbiAgICBcbiAgICAvKipcbiAgICAgKiDkv53lrZjmiqXlkI3nirbmgIHliLDmnKzlnLBcbiAgICAgKi9cbiAgICB0aGF0LnNhdmVUb0xvY2FsID0gZnVuY3Rpb24oKSB7XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgICB2YXIgZGF0YSA9IHtcbiAgICAgICAgICAgICAgICBzaWduZWRVcEFyZW5hczogdGhhdC5fc2lnbmVkVXBBcmVuYXMsXG4gICAgICAgICAgICAgICAgc2F2ZWRBdDogRGF0ZS5ub3coKVxuICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIGxvY2FsU3RvcmFnZS5zZXRJdGVtKCdhcmVuYV9kYXRhJywgSlNPTi5zdHJpbmdpZnkoZGF0YSkpO1xuICAgICAgICB9IGNhdGNoIChlKSB7XG4gICAgICAgICAgICBjb25zb2xlLmVycm9yKCfkv53lrZjnq57mioDlnLrmlbDmja7lpLHotKU6JywgZSk7XG4gICAgICAgIH1cbiAgICB9O1xuICAgIFxuICAgIC8qKlxuICAgICAqIOS7juacrOWcsOWKoOi9veaKpeWQjeeKtuaAgVxuICAgICAqL1xuICAgIHRoYXQubG9hZEZyb21Mb2NhbCA9IGZ1bmN0aW9uKCkge1xuICAgICAgICB0cnkge1xuICAgICAgICAgICAgdmFyIGRhdGFTdHIgPSBsb2NhbFN0b3JhZ2UuZ2V0SXRlbSgnYXJlbmFfZGF0YScpO1xuICAgICAgICAgICAgaWYgKGRhdGFTdHIpIHtcbiAgICAgICAgICAgICAgICB2YXIgZGF0YSA9IEpTT04ucGFyc2UoZGF0YVN0cik7XG4gICAgICAgICAgICAgICAgLy8g5qOA5p+l5pWw5o2u5piv5ZCm6L+H5pyf77yIMeWkqe+8iVxuICAgICAgICAgICAgICAgIGlmIChEYXRlLm5vdygpIC0gKGRhdGEuc2F2ZWRBdCB8fCAwKSA8IDI0ICogNjAgKiA2MCAqIDEwMDApIHtcbiAgICAgICAgICAgICAgICAgICAgdGhhdC5fc2lnbmVkVXBBcmVuYXMgPSBkYXRhLnNpZ25lZFVwQXJlbmFzIHx8IHt9O1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfSBjYXRjaCAoZSkge1xuICAgICAgICAgICAgY29uc29sZS5lcnJvcign5Yqg6L2956ue5oqA5Zy65pWw5o2u5aSx6LSlOicsIGUpO1xuICAgICAgICB9XG4gICAgfTtcbiAgICBcbiAgICAvKipcbiAgICAgKiDwn5Sn44CQ5paw5aKe44CR5LuO5pyN5Yqh56uv6I635Y+W5oql5ZCN54q25oCBXG4gICAgICogQHBhcmFtIHtGdW5jdGlvbn0gY2FsbGJhY2sgLSDlm57osIPlh73mlbAgKGVyciwgc2lnbmVkVXBSb29tcylcbiAgICAgKi9cbiAgICB0aGF0LmZldGNoU2lnbnVwU3RhdHVzRnJvbVNlcnZlciA9IGZ1bmN0aW9uKGNhbGxiYWNrKSB7XG4gICAgICAgIHZhciBhcGlVcmwgPSB3aW5kb3cuZGVmaW5lcyA/IHdpbmRvdy5kZWZpbmVzLmFwaVVybCA6ICcnO1xuICAgICAgICB2YXIgY3J5cHRvS2V5ID0gd2luZG93LmRlZmluZXMgPyB3aW5kb3cuZGVmaW5lcy5jcnlwdG9LZXkgOiAnJztcbiAgICAgICAgdmFyIHRva2VuID0gd2luZG93Lm15Z2xvYmFsICYmIHdpbmRvdy5teWdsb2JhbC5wbGF5ZXJEYXRhID8gd2luZG93Lm15Z2xvYmFsLnBsYXllckRhdGEudG9rZW4gOiAnJztcbiAgICAgICAgXG4gICAgICAgIGlmICghYXBpVXJsIHx8ICF3aW5kb3cuSHR0cEFQSSkge1xuICAgICAgICAgICAgY2FsbGJhY2sgJiYgY2FsbGJhY2soJ0FQSeacqumFjee9ricsIG51bGwpO1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIFxuICAgICAgICBIdHRwQVBJLmdldChcbiAgICAgICAgICAgIGFwaVVybCArICcvYXBpL3YxL2FyZW5hL3NpZ251cC1zdGF0dXM/dG9rZW49JyArIGVuY29kZVVSSUNvbXBvbmVudCh0b2tlbiksXG4gICAgICAgICAgICBjcnlwdG9LZXksXG4gICAgICAgICAgICBmdW5jdGlvbihlcnIsIHJlc3VsdCkge1xuICAgICAgICAgICAgICAgIGlmIChlcnIpIHtcbiAgICAgICAgICAgICAgICAgICAgY29uc29sZS5lcnJvcihcIvCfj5/vuI8gW2FyZW5hRGF0YV0g6I635Y+W5oql5ZCN54q25oCB5aSx6LSlOlwiLCBlcnIpO1xuICAgICAgICAgICAgICAgICAgICBjYWxsYmFjayAmJiBjYWxsYmFjayhlcnIsIG51bGwpO1xuICAgICAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgIHZhciBzaWduZWRVcFJvb21zID0gW107XG4gICAgICAgICAgICAgICAgaWYgKHJlc3VsdCAmJiAocmVzdWx0LmNvZGUgPT09IDAgfHwgcmVzdWx0LmRhdGEpKSB7XG4gICAgICAgICAgICAgICAgICAgIHZhciBkYXRhID0gcmVzdWx0LmRhdGEgfHwgcmVzdWx0O1xuICAgICAgICAgICAgICAgICAgICBzaWduZWRVcFJvb21zID0gZGF0YS5zaWduZWRfdXBfcm9vbXMgfHwgW107XG4gICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgICAgICAvLyDmm7TmlrDmnKzlnLDnvJPlrZhcbiAgICAgICAgICAgICAgICAgICAgdGhhdC5fc2lnbmVkVXBBcmVuYXMgPSB7fTtcbiAgICAgICAgICAgICAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBzaWduZWRVcFJvb21zLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICB2YXIgcm9vbSA9IHNpZ25lZFVwUm9vbXNbaV07XG4gICAgICAgICAgICAgICAgICAgICAgICB0aGF0Ll9zaWduZWRVcEFyZW5hc1tyb29tLnJvb21faWRdID0ge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHNpZ251cFRpbWU6IHJvb20uc2lnbnVwX3RpbWUsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgc3RhdHVzOiAnc2lnbmVkX3VwJyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBwZXJpb2RObzogcm9vbS5wZXJpb2Rfbm8sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgc2lnbnVwRmVlOiByb29tLnNpZ251cF9mZWVcbiAgICAgICAgICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgICAgIC8vIOS/neWtmOWIsOacrOWcsFxuICAgICAgICAgICAgICAgICAgICB0aGF0LnNhdmVUb0xvY2FsKCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgIGNhbGxiYWNrICYmIGNhbGxiYWNrKG51bGwsIHNpZ25lZFVwUm9vbXMpO1xuICAgICAgICAgICAgfVxuICAgICAgICApO1xuICAgIH07XG4gICAgXG4gICAgLyoqXG4gICAgICog5riF6Zmk5omA5pyJ5oql5ZCN54q25oCB77yI55So5LqO5rWL6K+V5oiW6YeN572u77yJXG4gICAgICovXG4gICAgdGhhdC5jbGVhckFsbFNpZ251cFN0YXR1cyA9IGZ1bmN0aW9uKCkge1xuICAgICAgICB0aGF0Ll9zaWduZWRVcEFyZW5hcyA9IHt9O1xuICAgICAgICB0aGF0LnNhdmVUb0xvY2FsKCk7XG4gICAgfTtcbiAgICBcbiAgICAvLyDliJ3lp4vljJbml7bliqDovb3mnKzlnLDmlbDmja5cbiAgICB0aGF0LmxvYWRGcm9tTG9jYWwoKTtcbiAgICBcbiAgICByZXR1cm4gdGhhdDtcbn0oKTtcbiJdfQ==
//------QC-SOURCE-SPLIT------

                (function() {
                    var nodeEnv = typeof require !== 'undefined' && typeof process !== 'undefined';
                    var __module = nodeEnv ? module : {exports:{}};
                    var __filename = 'preview-scripts/assets/scripts/ddz/tournament/TournamentWaitingScene.js';
                    var __require = nodeEnv ? function (request) {
                        return cc.require(request);
                    } : function (request) {
                        return __quick_compile_project__.require(request, __filename);
                    };
                    function __define (exports, require, module) {
                        if (!nodeEnv) {__quick_compile_project__.registerModule(__filename, module);}"use strict";
cc._RF.push(module, 'b64d2wKIqJAt7GneSYVRndp', 'TournamentWaitingScene');
// scripts/ddz/tournament/TournamentWaitingScene.js

"use strict";

/**
 * TournamentWaitingScene - 竞技场多桌等待页
 * 
 * 功能：
 * 1. 显示期号、轮次信息
 * 2. 实时显示完成进度（已完成桌数/总桌数）
 * 3. 扑克牌loading动画
 * 4. 接收服务端进度更新
 * 5. 三种状态提示：WAITING / CALCULATING / MATCHING
 * 
 * 设计风格：中国风斗地主竞技场 - 蓝金色
 */

// 状态常量
var TournamentStatus = {
  WAITING: "WAITING",
  CALCULATING: "CALCULATING",
  MATCHING: "MATCHING"
};
cc.Class({
  "extends": cc.Component,
  properties: {
    // 期号标签
    periodNoLabel: {
      type: cc.Label,
      "default": null
    },
    // 轮次标签
    roundLabel: {
      type: cc.Label,
      "default": null
    },
    // 进度标签（已完成/总数）
    progressLabel: {
      type: cc.Label,
      "default": null
    },
    // 进度条
    progressBar: {
      type: cc.ProgressBar,
      "default": null
    },
    // 提示文字
    tipLabel: {
      type: cc.Label,
      "default": null
    },
    // 状态标签
    statusLabel: {
      type: cc.Label,
      "default": null
    },
    // loading动画节点
    loadingNode: {
      type: cc.Node,
      "default": null
    },
    // 扑克牌sprite（用于loading动画）
    pokerSprite: {
      type: cc.Sprite,
      "default": null
    }
  },
  // LIFE-CYCLE CALLBACKS:
  onLoad: function onLoad() {
    // 初始化数据
    this._periodNo = "";
    this._round = 1;
    this._totalRounds = 1;
    this._finishedTables = 0;
    this._totalTables = 0;
    this._isWaiting = false;
    this._status = TournamentStatus.WAITING;

    // 注册事件监听
    this._registerEvents();
  },
  start: function start() {
    // 启动loading动画
    this._startLoadingAnimation();
  },
  onDestroy: function onDestroy() {
    // 取消事件监听
    this._unregisterEvents();
  },
  // ============================================================
  // 事件监听
  // ============================================================

  _registerEvents: function _registerEvents() {
    var self = this;

    // 监听等待进度更新
    if (window.socketCtr) {
      window.socketCtr().onTournamentWaitProgress(function (data) {
        self._onWaitProgress(data);
      });
      window.socketCtr().onTournamentRoundAdvance(function (data) {
        self._onRoundAdvance(data);
      });
      window.socketCtr().onTournamentFinalRank(function (data) {
        self._onFinalRank(data);
      });
    }
  },
  _unregisterEvents: function _unregisterEvents() {
    // 事件会随节点销毁自动取消
  },
  // ============================================================
  // 公共方法
  // ============================================================

  /**
   * 设置等待页数据
   * @param {Object} data - { period_no, round, total_rounds, finished_tables, total_tables }
   */
  setData: function setData(data) {
    this._periodNo = data.period_no || "";
    this._round = data.round || 1;
    this._totalRounds = data.total_rounds || 1;
    this._finishedTables = data.finished_tables || 0;
    this._totalTables = data.total_tables || 0;
    this._status = data.status || TournamentStatus.WAITING;
    this._updateUI();
  },
  /**
   * 更新进度
   * @param {number} finishedTables - 已完成桌数
   */
  updateProgress: function updateProgress(finishedTables) {
    this._finishedTables = finishedTables;
    this._updateProgressUI();
  },
  // ============================================================
  // 事件处理
  // ============================================================

  _onWaitProgress: function _onWaitProgress(data) {
    console.log("🏆 [TournamentWaiting] 收到进度更新:", JSON.stringify(data));

    // 检查期号是否匹配
    if (this._periodNo && data.period_no !== this._periodNo) {
      return;
    }
    this._periodNo = data.period_no;
    this._round = data.round;
    this._totalRounds = data.total_rounds;
    this._finishedTables = data.finished_tables;
    this._totalTables = data.total_tables;
    this._status = data.status || TournamentStatus.WAITING;
    this._updateUI();
  },
  _onRoundAdvance: function _onRoundAdvance(data) {
    console.log("🏆 [TournamentWaiting] 进入下一轮:", JSON.stringify(data));

    // 检查期号是否匹配
    if (this._periodNo && data.period_no !== this._periodNo) {
      return;
    }

    // 更新轮次
    this._round = data.new_round;
    this._totalRounds = data.total_rounds;

    // 重置进度
    this._finishedTables = 0;
    this._status = TournamentStatus.MATCHING;

    // 更新提示文字
    if (this.tipLabel) {
      this.tipLabel.string = data.message || "进入下一轮...";
    }

    // 可以添加轮次切换动画
    this._playRoundChangeAnimation();
  },
  _onFinalRank: function _onFinalRank(data) {
    console.log("🏆 [TournamentWaiting] 比赛结束，显示最终榜单:", JSON.stringify(data));

    // 检查期号是否匹配
    if (this._periodNo && data.period_no !== this._periodNo) {
      return;
    }

    // 关闭等待页，显示最终榜单
    this._showFinalRankDialog(data);
  },
  // ============================================================
  // UI更新
  // ============================================================

  _updateUI: function _updateUI() {
    // 更新期号
    if (this.periodNoLabel) {
      this.periodNoLabel.string = "第" + this._periodNo + "期";
    }

    // 更新轮次
    if (this.roundLabel) {
      this.roundLabel.string = "第" + this._round + "轮 / 共" + this._totalRounds + "轮";
    }

    // 更新进度
    this._updateProgressUI();

    // 更新状态显示
    this._updateStatusUI();
  },
  _updateProgressUI: function _updateProgressUI() {
    // 更新进度文字
    if (this.progressLabel) {
      this.progressLabel.string = this._finishedTables + " / " + this._totalTables;
    }

    // 更新进度条
    if (this.progressBar && this._totalTables > 0) {
      var progress = this._finishedTables / this._totalTables;
      this.progressBar.progress = Math.min(progress, 1.0);
    }

    // 更新提示文字
    if (this.tipLabel) {
      if (this._finishedTables >= this._totalTables) {
        this.tipLabel.string = "全部完成，即将进入下一轮...";
      } else {
        var remaining = this._totalTables - this._finishedTables;
        this.tipLabel.string = "正在等待其他玩家完成... (剩余" + remaining + "桌)";
      }
    }
  },
  /**
   * 更新状态显示
   */
  _updateStatusUI: function _updateStatusUI() {
    if (this.statusLabel) {
      switch (this._status) {
        case TournamentStatus.CALCULATING:
          this.statusLabel.string = "正在统计全场排名...";
          this.statusLabel.node.color = new cc.Color(255, 200, 100);
          break;
        case TournamentStatus.MATCHING:
          this.statusLabel.string = "晋级成功！正在匹配下一轮...";
          this.statusLabel.node.color = new cc.Color(100, 255, 100);
          break;
        default:
          if (this._finishedTables >= this._totalTables) {
            this.statusLabel.string = "本轮结束，请稍候...";
            this.statusLabel.node.color = new cc.Color(255, 220, 150);
          } else {
            this.statusLabel.string = "正在等待其他玩家完成...";
            this.statusLabel.node.color = new cc.Color(200, 200, 220);
          }
      }
    }

    // 根据状态更新提示文字
    if (this.tipLabel) {
      switch (this._status) {
        case TournamentStatus.CALCULATING:
          this.tipLabel.string = "正在统计全场排名...";
          break;
        case TournamentStatus.MATCHING:
          this.tipLabel.string = "晋级成功！正在匹配下一轮...";
          break;
        default:
          if (this._finishedTables >= this._totalTables) {
            this.tipLabel.string = "全部完成，即将进入下一轮...";
          } else {
            var remaining = this._totalTables - this._finishedTables;
            this.tipLabel.string = "正在等待其他玩家完成... (剩余" + remaining + "桌)";
          }
      }
    }
  },
  // ============================================================
  // 动画
  // ============================================================

  _startLoadingAnimation: function _startLoadingAnimation() {
    if (!this.pokerSprite) return;
    var self = this;
    var rotateAction = cc.rotateBy(2, 360);
    var repeatAction = cc.repeatForever(rotateAction);
    this.pokerSprite.node.runAction(repeatAction);
  },
  _stopLoadingAnimation: function _stopLoadingAnimation() {
    if (this.pokerSprite) {
      this.pokerSprite.node.stopAllActions();
    }
  },
  _playRoundChangeAnimation: function _playRoundChangeAnimation() {
    // 轮次切换动画：放大-缩小
    if (this.roundLabel) {
      var scaleUp = cc.scaleTo(0.3, 1.2);
      var scaleDown = cc.scaleTo(0.3, 1.0);
      var sequence = cc.sequence(scaleUp, scaleDown);
      this.roundLabel.node.runAction(sequence);
    }
  },
  // ============================================================
  // 显示最终榜单
  // ============================================================

  _showFinalRankDialog: function _showFinalRankDialog(data) {
    // 停止loading动画
    this._stopLoadingAnimation();

    // 🔧【修复】动态创建弹窗，不依赖prefab文件
    var dialogNode = new cc.Node("TournamentFinalRankDialog");
    dialogNode.setPosition(0, 0);
    dialogNode.setContentSize(cc.winSize.width, cc.winSize.height);

    // 添加脚本组件
    var dialogComp = dialogNode.addComponent("TournamentFinalRankDialog");

    // 添加到当前场景
    this.node.addChild(dialogNode);

    // 设置数据
    if (dialogComp) {
      dialogComp.setData(data);
    }
    console.log("🏆 [TournamentWaiting] 最终榜单弹窗已创建");
  },
  // ============================================================
  // 返回大厅
  // ============================================================

  onBackToHallClick: function onBackToHallClick() {
    // 返回大厅场景
    cc.director.loadScene("hallScene");
  }
});

cc._RF.pop();
                    }
                    if (nodeEnv) {
                        __define(__module.exports, __require, __module);
                    }
                    else {
                        __quick_compile_project__.registerModuleFunc(__filename, function () {
                            __define(__module.exports, __require, __module);
                        });
                    }
                })();
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImFzc2V0c1xcc2NyaXB0c1xcZGR6XFx0b3VybmFtZW50XFxUb3VybmFtZW50V2FpdGluZ1NjZW5lLmpzIl0sIm5hbWVzIjpbIlRvdXJuYW1lbnRTdGF0dXMiLCJXQUlUSU5HIiwiQ0FMQ1VMQVRJTkciLCJNQVRDSElORyIsImNjIiwiQ2xhc3MiLCJDb21wb25lbnQiLCJwcm9wZXJ0aWVzIiwicGVyaW9kTm9MYWJlbCIsInR5cGUiLCJMYWJlbCIsInJvdW5kTGFiZWwiLCJwcm9ncmVzc0xhYmVsIiwicHJvZ3Jlc3NCYXIiLCJQcm9ncmVzc0JhciIsInRpcExhYmVsIiwic3RhdHVzTGFiZWwiLCJsb2FkaW5nTm9kZSIsIk5vZGUiLCJwb2tlclNwcml0ZSIsIlNwcml0ZSIsIm9uTG9hZCIsIl9wZXJpb2RObyIsIl9yb3VuZCIsIl90b3RhbFJvdW5kcyIsIl9maW5pc2hlZFRhYmxlcyIsIl90b3RhbFRhYmxlcyIsIl9pc1dhaXRpbmciLCJfc3RhdHVzIiwiX3JlZ2lzdGVyRXZlbnRzIiwic3RhcnQiLCJfc3RhcnRMb2FkaW5nQW5pbWF0aW9uIiwib25EZXN0cm95IiwiX3VucmVnaXN0ZXJFdmVudHMiLCJzZWxmIiwid2luZG93Iiwic29ja2V0Q3RyIiwib25Ub3VybmFtZW50V2FpdFByb2dyZXNzIiwiZGF0YSIsIl9vbldhaXRQcm9ncmVzcyIsIm9uVG91cm5hbWVudFJvdW5kQWR2YW5jZSIsIl9vblJvdW5kQWR2YW5jZSIsIm9uVG91cm5hbWVudEZpbmFsUmFuayIsIl9vbkZpbmFsUmFuayIsInNldERhdGEiLCJwZXJpb2Rfbm8iLCJyb3VuZCIsInRvdGFsX3JvdW5kcyIsImZpbmlzaGVkX3RhYmxlcyIsInRvdGFsX3RhYmxlcyIsInN0YXR1cyIsIl91cGRhdGVVSSIsInVwZGF0ZVByb2dyZXNzIiwiZmluaXNoZWRUYWJsZXMiLCJfdXBkYXRlUHJvZ3Jlc3NVSSIsImNvbnNvbGUiLCJsb2ciLCJKU09OIiwic3RyaW5naWZ5IiwibmV3X3JvdW5kIiwic3RyaW5nIiwibWVzc2FnZSIsIl9wbGF5Um91bmRDaGFuZ2VBbmltYXRpb24iLCJfc2hvd0ZpbmFsUmFua0RpYWxvZyIsIl91cGRhdGVTdGF0dXNVSSIsInByb2dyZXNzIiwiTWF0aCIsIm1pbiIsInJlbWFpbmluZyIsIm5vZGUiLCJjb2xvciIsIkNvbG9yIiwicm90YXRlQWN0aW9uIiwicm90YXRlQnkiLCJyZXBlYXRBY3Rpb24iLCJyZXBlYXRGb3JldmVyIiwicnVuQWN0aW9uIiwiX3N0b3BMb2FkaW5nQW5pbWF0aW9uIiwic3RvcEFsbEFjdGlvbnMiLCJzY2FsZVVwIiwic2NhbGVUbyIsInNjYWxlRG93biIsInNlcXVlbmNlIiwiZGlhbG9nTm9kZSIsInNldFBvc2l0aW9uIiwic2V0Q29udGVudFNpemUiLCJ3aW5TaXplIiwid2lkdGgiLCJoZWlnaHQiLCJkaWFsb2dDb21wIiwiYWRkQ29tcG9uZW50IiwiYWRkQ2hpbGQiLCJvbkJhY2tUb0hhbGxDbGljayIsImRpcmVjdG9yIiwibG9hZFNjZW5lIl0sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7OztBQUFBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBLElBQU1BLGdCQUFnQixHQUFHO0VBQ3JCQyxPQUFPLEVBQUUsU0FBUztFQUNsQkMsV0FBVyxFQUFFLGFBQWE7RUFDMUJDLFFBQVEsRUFBRTtBQUNkLENBQUM7QUFFREMsRUFBRSxDQUFDQyxLQUFLLENBQUM7RUFDTCxXQUFTRCxFQUFFLENBQUNFLFNBQVM7RUFFckJDLFVBQVUsRUFBRTtJQUNSO0lBQ0FDLGFBQWEsRUFBRTtNQUNYQyxJQUFJLEVBQUVMLEVBQUUsQ0FBQ00sS0FBSztNQUNkLFdBQVM7SUFDYixDQUFDO0lBQ0Q7SUFDQUMsVUFBVSxFQUFFO01BQ1JGLElBQUksRUFBRUwsRUFBRSxDQUFDTSxLQUFLO01BQ2QsV0FBUztJQUNiLENBQUM7SUFDRDtJQUNBRSxhQUFhLEVBQUU7TUFDWEgsSUFBSSxFQUFFTCxFQUFFLENB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QTtFQUNBOztFQUVBb0MsaUJBQWlCLEVBQUUsU0FBQUEsa0JBQUEsRUFBVztJQUMxQjtJQUNBeEYsRUFBRSxDQUFDeUYsUUFBUSxDQUFDQyxTQUFTLENBQUMsV0FBVyxDQUFDO0VBQ3RDO0FBQ0osQ0FBQyxDQUFDIiwic291cmNlUm9vdCI6Ii8iLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIFRvdXJuYW1lbnRXYWl0aW5nU2NlbmUgLSDnq57mioDlnLrlpJrmoYznrYnlvoXpobVcbiAqIFxuICog5Yqf6IO977yaXG4gKiAxLiDmmL7npLrmnJ/lj7fjgIHova7mrKHkv6Hmga9cbiAqIDIuIOWunuaXtuaYvuekuuWujOaIkOi/m+W6pu+8iOW3suWujOaIkOahjOaVsC/mgLvmoYzmlbDvvIlcbiAqIDMuIOaJkeWFi+eJjGxvYWRpbmfliqjnlLtcbiAqIDQuIOaOpeaUtuacjeWKoeerr+i/m+W6puabtOaWsFxuICogNS4g5LiJ56eN54q25oCB5o+Q56S677yaV0FJVElORyAvIENBTENVTEFUSU5HIC8gTUFUQ0hJTkdcbiAqIFxuICog6K6+6K6h6aOO5qC877ya5Lit5Zu96aOO5paX5Zyw5Li756ue5oqA5Zy6IC0g6JOd6YeR6ImyXG4gKi9cblxuLy8g54q25oCB5bi46YePXG5jb25zdCBUb3VybmFtZW50U3RhdHVzID0ge1xuICAgIFdBSVRJTkc6IFwiV0FJVElOR1wiLFxuICAgIENBTENVTEFUSU5HOiBcIkNBTENVTEFUSU5HXCIsIFxuICAgIE1BVENISU5HOiBcIk1BVENISU5HXCJcbn07XG5cbmNjLkNsYXNzKHtcbiAgICBleHRlbmRzOiBjYy5Db21wb25lbnQsXG5cbiAgICBwcm9wZXJ0aWVzOiB7XG4gICAgICAgIC8vIOacn+WPt+agh+etvlxuICAgICAgICBwZXJpb2ROb0xhYmVsOiB7XG4gICAgICAgICAgICB0eXBlOiBjYy5MYWJlbCxcbiAgICAgICAgICAgIGRlZmF1bHQ6IG51bGxcbiAgICAgICAgfSxcbiAgICAgICAgLy8g6L2u5qyh5qCH562+XG4gICAgICAgIHJvdW5kTGFiZWw6IHtcbiAgICAgICAgICAgIHR5cGU6IGNjLkxhYmVsLFxuICAgICAgICAgICAgZGVmYXVsdDogbnVsbFxuICAgICAgICB9LFxuICAgICAgICAvLyDov5vluqbmoIfnrb7vvIjlt7LlrozmiJAv5oC75pWw77yJXG4gICAgICAgIHByb2dyZXNzTGFiZWw6IHtcbiAgICAgICAgICAgIHR5cGU6IGNjLkxhYmVsLFxuICAgICAgICAgICAgZGVmYXVsdDogbnVsbFxuICAgICAgICB9LFxuICAgICAgICAvLyDov5vluqbmnaFcbiAgICAgICAgcHJvZ3Jlc3NCYXI6IHtcbiAgICAgICAgICAgIHR5cGU6IGNjLlByb2dyZXNzQmFyLFxuICAgICAgICAgICAgZGVmYXVsdDogbnVsbFxuICAgICAgICB9LFxuICAgICAgICAvLyDmj5DnpLrmloflrZdcbiAgICAgICAgdGlwTGFiZWw6IHtcbiAgICAgICAgICAgIHR5cGU6IGNjLkxhYmVsLFxuICAgICAgICAgICAgZGVmYXVsdDogbnVsbFxuICAgICAgICB9LFxuICAgICAgICAvLyDnirbmgIHmoIfnrb5cbiAgICAgICAgc3RhdHVzTGFiZWw6IHtcbiAgICAgICAgICAgIHR5cGU6IGNjLkxhYmVsLFxuICAgICAgICAgICAgZGVmYXVsdDogbnVsbFxuICAgICAgICB9LFxuICAgICAgICAvLyBsb2FkaW5n5Yqo55S76IqC54K5XG4gICAgICAgIGxvYWRpbmdOb2RlOiB7XG4gICAgICAgICAgICB0eXBlOiBjYy5Ob2RlLFxuICAgICAgICAgICAgZGVmYXVsdDogbnVsbFxuICAgICAgICB9LFxuICAgICAgICAvLyDmiZHlhYvniYxzcHJpdGXvvIjnlKjkuo5sb2FkaW5n5Yqo55S777yJXG4gICAgICAgIHBva2VyU3ByaXRlOiB7XG4gICAgICAgICAgICB0eXBlOiBjYy5TcHJpdGUsXG4gICAgICAgICAgICBkZWZhdWx0OiBudWxsXG4gICAgICAgIH1cbiAgICB9LFxuXG4gICAgLy8gTElGRS1DWUNMRSBDQUxMQkFDS1M6XG5cbiAgICBvbkxvYWQgKCkge1xuICAgICAgICAvLyDliJ3lp4vljJbmlbDmja5cbiAgICAgICAgdGhpcy5fcGVyaW9kTm8gPSBcIlwiXG4gICAgICAgIHRoaXMuX3JvdW5kID0gMVxuICAgICAgICB0aGlzLl90b3RhbFJvdW5kcyA9IDFcbiAgICAgICAgdGhpcy5fZmluaXNoZWRUYWJsZXMgPSAwXG4gICAgICAgIHRoaXMuX3RvdGFsVGFibGVzID0gMFxuICAgICAgICB0aGlzLl9pc1dhaXRpbmcgPSBmYWxzZVxuICAgICAgICB0aGlzLl9zdGF0dXMgPSBUb3VybmFtZW50U3RhdHVzLldBSVRJTkdcblxuICAgICAgICAvLyDms6jlhozkuovku7bnm5HlkKxcbiAgICAgICAgdGhpcy5fcmVnaXN0ZXJFdmVudHMoKVxuICAgIH0sXG5cbiAgICBzdGFydCAoKSB7XG4gICAgICAgIC8vIOWQr+WKqGxvYWRpbmfliqjnlLtcbiAgICAgICAgdGhpcy5fc3RhcnRMb2FkaW5nQW5pbWF0aW9uKClcbiAgICB9LFxuXG4gICAgb25EZXN0cm95ICgpIHtcbiAgICAgICAgLy8g5Y+W5raI5LqL5Lu255uR5ZCsXG4gICAgICAgIHRoaXMuX3VucmVnaXN0ZXJFdmVudHMoKVxuICAgIH0sXG5cbiAgICAvLyA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cbiAgICAvLyDkuovku7bnm5HlkKxcbiAgICAvLyA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cblxuICAgIF9yZWdpc3RlckV2ZW50czogZnVuY3Rpb24oKSB7XG4gICAgICAgIHZhciBzZWxmID0gdGhpc1xuXG4gICAgICAgIC8vIOebkeWQrOetieW+hei/m+W6puabtOaWsFxuICAgICAgICBpZiAod2luZG93LnNvY2tldEN0cikge1xuICAgICAgICAgICAgd2luZG93LnNvY2tldEN0cigpLm9uVG91cm5hbWVudFdhaXRQcm9ncmVzcyhmdW5jdGlvbihkYXRhKSB7XG4gICAgICAgICAgICAgICAgc2VsZi5fb25XYWl0UHJvZ3Jlc3MoZGF0YSlcbiAgICAgICAgICAgIH0pXG5cbiAgICAgICAgICAgIHdpbmRvdy5zb2NrZXRDdHIoKS5vblRvdXJuYW1lbnRSb3VuZEFkdmFuY2UoZnVuY3Rpb24oZGF0YSkge1xuICAgICAgICAgICAgICAgIHNlbGYuX29uUm91bmRBZHZhbmNlKGRhdGEpXG4gICAgICAgICAgICB9KVxuXG4gICAgICAgICAgICB3aW5kb3cuc29ja2V0Q3RyKCkub25Ub3VybmFtZW50RmluYWxSYW5rKGZ1bmN0aW9uKGRhdGEpIHtcbiAgICAgICAgICAgICAgICBzZWxmLl9vbkZpbmFsUmFuayhkYXRhKVxuICAgICAgICAgICAgfSlcbiAgICAgICAgfVxuICAgIH0sXG5cbiAgICBfdW5yZWdpc3RlckV2ZW50czogZnVuY3Rpb24oKSB7XG4gICAgICAgIC8vIOS6i+S7tuS8mumaj+iKgueCuemUgOavgeiHquWKqOWPlua2iFxuICAgIH0sXG5cbiAgICAvLyA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cbiAgICAvLyDlhazlhbHmlrnms5VcbiAgICAvLyA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cblxuICAgIC8qKlxuICAgICAqIOiuvue9ruetieW+hemhteaVsOaNrlxuICAgICAqIEBwYXJhbSB7T2JqZWN0fSBkYXRhIC0geyBwZXJpb2Rfbm8sIHJvdW5kLCB0b3RhbF9yb3VuZHMsIGZpbmlzaGVkX3RhYmxlcywgdG90YWxfdGFibGVzIH1cbiAgICAgKi9cbiAgICBzZXREYXRhOiBmdW5jdGlvbihkYXRhKSB7XG4gICAgICAgIHRoaXMuX3BlcmlvZE5vID0gZGF0YS5wZXJpb2Rfbm8gfHwgXCJcIlxuICAgICAgICB0aGlzLl9yb3VuZCA9IGRhdGEucm91bmQgfHwgMVxuICAgICAgICB0aGlzLl90b3RhbFJvdW5kcyA9IGRhdGEudG90YWxfcm91bmRzIHx8IDFcbiAgICAgICAgdGhpcy5fZmluaXNoZWRUYWJsZXMgPSBkYXRhLmZpbmlzaGVkX3RhYmxlcyB8fCAwXG4gICAgICAgIHRoaXMuX3RvdGFsVGFibGVzID0gZGF0YS50b3RhbF90YWJsZXMgfHwgMFxuICAgICAgICB0aGlzLl9zdGF0dXMgPSBkYXRhLnN0YXR1cyB8fCBUb3VybmFtZW50U3RhdHVzLldBSVRJTkdcblxuICAgICAgICB0aGlzLl91cGRhdGVVSSgpXG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIOabtOaWsOi/m+W6plxuICAgICAqIEBwYXJhbSB7bnVtYmVyfSBmaW5pc2hlZFRhYmxlcyAtIOW3suWujOaIkOahjOaVsFxuICAgICAqL1xuICAgIHVwZGF0ZVByb2dyZXNzOiBmdW5jdGlvbihmaW5pc2hlZFRhYmxlcykge1xuICAgICAgICB0aGlzLl9maW5pc2hlZFRhYmxlcyA9IGZpbmlzaGVkVGFibGVzXG4gICAgICAgIHRoaXMuX3VwZGF0ZVByb2dyZXNzVUkoKVxuICAgIH0sXG5cbiAgICAvLyA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cbiAgICAvLyDkuovku7blpITnkIZcbiAgICAvLyA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cblxuICAgIF9vbldhaXRQcm9ncmVzczogZnVuY3Rpb24oZGF0YSkge1xuICAgICAgICBjb25zb2xlLmxvZyhcIvCfj4YgW1RvdXJuYW1lbnRXYWl0aW5nXSDmlLbliLDov5vluqbmm7TmlrA6XCIsIEpTT04uc3RyaW5naWZ5KGRhdGEpKVxuICAgICAgICBcbiAgICAgICAgLy8g5qOA5p+l5pyf5Y+35piv5ZCm5Yy56YWNXG4gICAgICAgIGlmICh0aGlzLl9wZXJpb2RObyAmJiBkYXRhLnBlcmlvZF9ubyAhPT0gdGhpcy5fcGVyaW9kTm8pIHtcbiAgICAgICAgICAgIHJldHVyblxuICAgICAgICB9XG5cbiAgICAgICAgdGhpcy5fcGVyaW9kTm8gPSBkYXRhLnBlcmlvZF9ub1xuICAgICAgICB0aGlzLl9yb3VuZCA9IGRhdGEucm91bmRcbiAgICAgICAgdGhpcy5fdG90YWxSb3VuZHMgPSBkYXRhLnRvdGFsX3JvdW5kc1xuICAgICAgICB0aGlzLl9maW5pc2hlZFRhYmxlcyA9IGRhdGEuZmluaXNoZWRfdGFibGVzXG4gICAgICAgIHRoaXMuX3RvdGFsVGFibGVzID0gZGF0YS50b3RhbF90YWJsZXNcbiAgICAgICAgdGhpcy5fc3RhdHVzID0gZGF0YS5zdGF0dXMgfHwgVG91cm5hbWVudFN0YXR1cy5XQUlUSU5HXG5cbiAgICAgICAgdGhpcy5fdXBkYXRlVUkoKVxuICAgIH0sXG5cbiAgICBfb25Sb3VuZEFkdmFuY2U6IGZ1bmN0aW9uKGRhdGEpIHtcbiAgICAgICAgY29uc29sZS5sb2coXCLwn4+GIFtUb3VybmFtZW50V2FpdGluZ10g6L+b5YWl5LiL5LiA6L2uOlwiLCBKU09OLnN0cmluZ2lmeShkYXRhKSlcbiAgICAgICAgXG4gICAgICAgIC8vIOajgOafpeacn+WPt+aYr+WQpuWMuemFjVxuICAgICAgICBpZiAodGhpcy5fcGVyaW9kTm8gJiYgZGF0YS5wZXJpb2Rfbm8gIT09IHRoaXMuX3BlcmlvZE5vKSB7XG4gICAgICAgICAgICByZXR1cm5cbiAgICAgICAgfVxuXG4gICAgICAgIC8vIOabtOaWsOi9ruasoVxuICAgICAgICB0aGlzLl9yb3VuZCA9IGRhdGEubmV3X3JvdW5kXG4gICAgICAgIHRoaXMuX3RvdGFsUm91bmRzID0gZGF0YS50b3RhbF9yb3VuZHNcblxuICAgICAgICAvLyDph43nva7ov5vluqZcbiAgICAgICAgdGhpcy5fZmluaXNoZWRUYWJsZXMgPSAwXG4gICAgICAgIHRoaXMuX3N0YXR1cyA9IFRvdXJuYW1lbnRTdGF0dXMuTUFUQ0hJTkdcbiAgICAgICAgXG4gICAgICAgIC8vIOabtOaWsOaPkOekuuaWh+Wtl1xuICAgICAgICBpZiAodGhpcy50aXBMYWJlbCkge1xuICAgICAgICAgICAgdGhpcy50aXBMYWJlbC5zdHJpbmcgPSBkYXRhLm1lc3NhZ2UgfHwgXCLov5vlhaXkuIvkuIDova4uLi5cIlxuICAgICAgICB9XG5cbiAgICAgICAgLy8g5Y+v5Lul5re75Yqg6L2u5qyh5YiH5o2i5Yqo55S7XG4gICAgICAgIHRoaXMuX3BsYXlSb3VuZENoYW5nZUFuaW1hdGlvbigpXG4gICAgfSxcblxuICAgIF9vbkZpbmFsUmFuazogZnVuY3Rpb24oZGF0YSkge1xuICAgICAgICBjb25zb2xlLmxvZyhcIvCfj4YgW1RvdXJuYW1lbnRXYWl0aW5nXSDmr5TotZvnu5PmnZ/vvIzmmL7npLrmnIDnu4jmppzljZU6XCIsIEpTT04uc3RyaW5naWZ5KGRhdGEpKVxuICAgICAgICBcbiAgICAgICAgLy8g5qOA5p+l5pyf5Y+35piv5ZCm5Yy56YWNXG4gICAgICAgIGlmICh0aGlzLl9wZXJpb2RObyAmJiBkYXRhLnBlcmlvZF9ubyAhPT0gdGhpcy5fcGVyaW9kTm8pIHtcbiAgICAgICAgICAgIHJldHVyblxuICAgICAgICB9XG5cbiAgICAgICAgLy8g5YWz6Zet562J5b6F6aG177yM5pi+56S65pyA57uI5qac5Y2VXG4gICAgICAgIHRoaXMuX3Nob3dGaW5hbFJhbmtEaWFsb2coZGF0YSlcbiAgICB9LFxuXG4gICAgLy8gPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XG4gICAgLy8gVUnmm7TmlrBcbiAgICAvLyA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cblxuICAgIF91cGRhdGVVSTogZnVuY3Rpb24oKSB7XG4gICAgICAgIC8vIOabtOaWsOacn+WPt1xuICAgICAgICBpZiAodGhpcy5wZXJpb2ROb0xhYmVsKSB7XG4gICAgICAgICAgICB0aGlzLnBlcmlvZE5vTGFiZWwuc3RyaW5nID0gXCLnrKxcIiArIHRoaXMuX3BlcmlvZE5vICsgXCLmnJ9cIlxuICAgICAgICB9XG5cbiAgICAgICAgLy8g5pu05paw6L2u5qyhXG4gICAgICAgIGlmICh0aGlzLnJvdW5kTGFiZWwpIHtcbiAgICAgICAgICAgIHRoaXMucm91bmRMYWJlbC5zdHJpbmcgPSBcIuesrFwiICsgdGhpcy5fcm91bmQgKyBcIui9riAvIOWFsVwiICsgdGhpcy5fdG90YWxSb3VuZHMgKyBcIui9rlwiXG4gICAgICAgIH1cblxuICAgICAgICAvLyDmm7TmlrDov5vluqZcbiAgICAgICAgdGhpcy5fdXBkYXRlUHJvZ3Jlc3NVSSgpXG4gICAgICAgIFxuICAgICAgICAvLyDmm7TmlrDnirbmgIHmmL7npLpcbiAgICAgICAgdGhpcy5fdXBkYXRlU3RhdHVzVUkoKVxuICAgIH0sXG5cbiAgICBfdXBkYXRlUHJvZ3Jlc3NVSTogZnVuY3Rpb24oKSB7XG4gICAgICAgIC8vIOabtOaWsOi/m+W6puaWh+Wtl1xuICAgICAgICBpZiAodGhpcy5wcm9ncmVzc0xhYmVsKSB7XG4gICAgICAgICAgICB0aGlzLnByb2dyZXNzTGFiZWwuc3RyaW5nID0gdGhpcy5fZmluaXNoZWRUYWJsZXMgKyBcIiAvIFwiICsgdGhpcy5fdG90YWxUYWJsZXNcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIOabtOaWsOi/m+W6puadoVxuICAgICAgICBpZiAodGhpcy5wcm9ncmVzc0JhciAmJiB0aGlzLl90b3RhbFRhYmxlcyA+IDApIHtcbiAgICAgICAgICAgIHZhciBwcm9ncmVzcyA9IHRoaXMuX2ZpbmlzaGVkVGFibGVzIC8gdGhpcy5fdG90YWxUYWJsZXNcbiAgICAgICAgICAgIHRoaXMucHJvZ3Jlc3NCYXIucHJvZ3Jlc3MgPSBNYXRoLm1pbihwcm9ncmVzcywgMS4wKVxuICAgICAgICB9XG5cbiAgICAgICAgLy8g5pu05paw5o+Q56S65paH5a2XXG4gICAgICAgIGlmICh0aGlzLnRpcExhYmVsKSB7XG4gICAgICAgICAgICBpZiAodGhpcy5fZmluaXNoZWRUYWJsZXMgPj0gdGhpcy5fdG90YWxUYWJsZXMpIHtcbiAgICAgICAgICAgICAgICB0aGlzLnRpcExhYmVsLnN0cmluZyA9IFwi5YWo6YOo5a6M5oiQ77yM5Y2z5bCG6L+b5YWl5LiL5LiA6L2uLi4uXCJcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgdmFyIHJlbWFpbmluZyA9IHRoaXMuX3RvdGFsVGFibGVzIC0gdGhpcy5fZmluaXNoZWRUYWJsZXNcbiAgICAgICAgICAgICAgICB0aGlzLnRpcExhYmVsLnN0cmluZyA9IFwi5q2j5Zyo562J5b6F5YW25LuW546p5a625a6M5oiQLi4uICjliankvZlcIiArIHJlbWFpbmluZyArIFwi5qGMKVwiXG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9LFxuICAgIFxuICAgIC8qKlxuICAgICAqIOabtOaWsOeKtuaAgeaYvuekulxuICAgICAqL1xuICAgIF91cGRhdGVTdGF0dXNVSTogZnVuY3Rpb24oKSB7XG4gICAgICAgIGlmICh0aGlzLnN0YXR1c0xhYmVsKSB7XG4gICAgICAgICAgICBzd2l0Y2ggKHRoaXMuX3N0YXR1cykge1xuICAgICAgICAgICAgICAgIGNhc2UgVG91cm5hbWVudFN0YXR1cy5DQUxDVUxBVElORzpcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5zdGF0dXNMYWJlbC5zdHJpbmcgPSBcIuato+WcqOe7n+iuoeWFqOWcuuaOkuWQjS4uLlwiXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuc3RhdHVzTGFiZWwubm9kZS5jb2xvciA9IG5ldyBjYy5Db2xvcigyNTUsIDIwMCwgMTAwKVxuICAgICAgICAgICAgICAgICAgICBicmVha1xuICAgICAgICAgICAgICAgIGNhc2UgVG91cm5hbWVudFN0YXR1cy5NQVRDSElORzpcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5zdGF0dXNMYWJlbC5zdHJpbmcgPSBcIuaZi+e6p+aIkOWKn++8geato+WcqOWMuemFjeS4i+S4gOi9ri4uLlwiXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuc3RhdHVzTGFiZWwubm9kZS5jb2xvciA9IG5ldyBjYy5Db2xvcigxMDAsIDI1NSwgMTAwKVxuICAgICAgICAgICAgICAgICAgICBicmVha1xuICAgICAgICAgICAgICAgIGRlZmF1bHQ6XG4gICAgICAgICAgICAgICAgICAgIGlmICh0aGlzLl9maW5pc2hlZFRhYmxlcyA+PSB0aGlzLl90b3RhbFRhYmxlcykge1xuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5zdGF0dXNMYWJlbC5zdHJpbmcgPSBcIuacrOi9rue7k+adn++8jOivt+eojeWAmS4uLlwiXG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLnN0YXR1c0xhYmVsLm5vZGUuY29sb3IgPSBuZXcgY2MuQ29sb3IoMjU1LCAyMjAsIDE1MClcbiAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuc3RhdHVzTGFiZWwuc3RyaW5nID0gXCLmraPlnKjnrYnlvoXlhbbku5bnjqnlrrblrozmiJAuLi5cIlxuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5zdGF0dXNMYWJlbC5ub2RlLmNvbG9yID0gbmV3IGNjLkNvbG9yKDIwMCwgMjAwLCAyMjApXG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBcbiAgICAgICAgLy8g5qC55o2u54q25oCB5pu05paw5o+Q56S65paH5a2XXG4gICAgICAgIGlmICh0aGlzLnRpcExhYmVsKSB7XG4gICAgICAgICAgICBzd2l0Y2ggKHRoaXMuX3N0YXR1cykge1xuICAgICAgICAgICAgICAgIGNhc2UgVG91cm5hbWVudFN0YXR1cy5DQUxDVUxBVElORzpcbiAgICAgICAgICAgICAgICAgICAgdGhpcy50aXBMYWJlbC5zdHJpbmcgPSBcIuato+WcqOe7n+iuoeWFqOWcuuaOkuWQjS4uLlwiXG4gICAgICAgICAgICAgICAgICAgIGJyZWFrXG4gICAgICAgICAgICAgICAgY2FzZSBUb3VybmFtZW50U3RhdHVzLk1BVENISU5HOlxuICAgICAgICAgICAgICAgICAgICB0aGlzLnRpcExhYmVsLnN0cmluZyA9IFwi5pmL57qn5oiQ5Yqf77yB5q2j5Zyo5Yy56YWN5LiL5LiA6L2uLi4uXCJcbiAgICAgICAgICAgICAgICAgICAgYnJlYWtcbiAgICAgICAgICAgICAgICBkZWZhdWx0OlxuICAgICAgICAgICAgICAgICAgICBpZiAodGhpcy5fZmluaXNoZWRUYWJsZXMgPj0gdGhpcy5fdG90YWxUYWJsZXMpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMudGlwTGFiZWwuc3RyaW5nID0gXCLlhajpg6jlrozmiJDvvIzljbPlsIbov5vlhaXkuIvkuIDova4uLi5cIlxuICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgdmFyIHJlbWFpbmluZyA9IHRoaXMuX3RvdGFsVGFibGVzIC0gdGhpcy5fZmluaXNoZWRUYWJsZXNcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMudGlwTGFiZWwuc3RyaW5nID0gXCLmraPlnKjnrYnlvoXlhbbku5bnjqnlrrblrozmiJAuLi4gKOWJqeS9mVwiICsgcmVtYWluaW5nICsgXCLmoYwpXCJcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfSxcblxuICAgIC8vID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxuICAgIC8vIOWKqOeUu1xuICAgIC8vID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxuXG4gICAgX3N0YXJ0TG9hZGluZ0FuaW1hdGlvbjogZnVuY3Rpb24oKSB7XG4gICAgICAgIGlmICghdGhpcy5wb2tlclNwcml0ZSkgcmV0dXJuXG5cbiAgICAgICAgdmFyIHNlbGYgPSB0aGlzXG4gICAgICAgIHZhciByb3RhdGVBY3Rpb24gPSBjYy5yb3RhdGVCeSgyLCAzNjApXG4gICAgICAgIHZhciByZXBlYXRBY3Rpb24gPSBjYy5yZXBlYXRGb3JldmVyKHJvdGF0ZUFjdGlvbilcbiAgICAgICAgdGhpcy5wb2tlclNwcml0ZS5ub2RlLnJ1bkFjdGlvbihyZXBlYXRBY3Rpb24pXG4gICAgfSxcblxuICAgIF9zdG9wTG9hZGluZ0FuaW1hdGlvbjogZnVuY3Rpb24oKSB7XG4gICAgICAgIGlmICh0aGlzLnBva2VyU3ByaXRlKSB7XG4gICAgICAgICAgICB0aGlzLnBva2VyU3ByaXRlLm5vZGUuc3RvcEFsbEFjdGlvbnMoKVxuICAgICAgICB9XG4gICAgfSxcblxuICAgIF9wbGF5Um91bmRDaGFuZ2VBbmltYXRpb246IGZ1bmN0aW9uKCkge1xuICAgICAgICAvLyDova7mrKHliIfmjaLliqjnlLvvvJrmlL7lpKct57yp5bCPXG4gICAgICAgIGlmICh0aGlzLnJvdW5kTGFiZWwpIHtcbiAgICAgICAgICAgIHZhciBzY2FsZVVwID0gY2Muc2NhbGVUbygwLjMsIDEuMilcbiAgICAgICAgICAgIHZhciBzY2FsZURvd24gPSBjYy5zY2FsZVRvKDAuMywgMS4wKVxuICAgICAgICAgICAgdmFyIHNlcXVlbmNlID0gY2Muc2VxdWVuY2Uoc2NhbGVVcCwgc2NhbGVEb3duKVxuICAgICAgICAgICAgdGhpcy5yb3VuZExhYmVsLm5vZGUucnVuQWN0aW9uKHNlcXVlbmNlKVxuICAgICAgICB9XG4gICAgfSxcblxuICAgIC8vID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxuICAgIC8vIOaYvuekuuacgOe7iOamnOWNlVxuICAgIC8vID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxuXG4gICAgX3Nob3dGaW5hbFJhbmtEaWFsb2c6IGZ1bmN0aW9uKGRhdGEpIHtcbiAgICAgICAgLy8g5YGc5q2ibG9hZGluZ+WKqOeUu1xuICAgICAgICB0aGlzLl9zdG9wTG9hZGluZ0FuaW1hdGlvbigpXG5cbiAgICAgICAgLy8g8J+Up+OAkOS/ruWkjeOAkeWKqOaAgeWIm+W7uuW8ueeql++8jOS4jeS+nei1lnByZWZhYuaWh+S7tlxuICAgICAgICB2YXIgZGlhbG9nTm9kZSA9IG5ldyBjYy5Ob2RlKFwiVG91cm5hbWVudEZpbmFsUmFua0RpYWxvZ1wiKVxuICAgICAgICBkaWFsb2dOb2RlLnNldFBvc2l0aW9uKDAsIDApXG4gICAgICAgIGRpYWxvZ05vZGUuc2V0Q29udGVudFNpemUoY2Mud2luU2l6ZS53aWR0aCwgY2Mud2luU2l6ZS5oZWlnaHQpXG4gICAgICAgIFxuICAgICAgICAvLyDmt7vliqDohJrmnKznu4Tku7ZcbiAgICAgICAgdmFyIGRpYWxvZ0NvbXAgPSBkaWFsb2dOb2RlLmFkZENvbXBvbmVudChcIlRvdXJuYW1lbnRGaW5hbFJhbmtEaWFsb2dcIilcbiAgICAgICAgXG4gICAgICAgIC8vIOa3u+WKoOWIsOW9k+WJjeWcuuaZr1xuICAgICAgICB0aGlzLm5vZGUuYWRkQ2hpbGQoZGlhbG9nTm9kZSlcbiAgICAgICAgXG4gICAgICAgIC8vIOiuvue9ruaVsOaNrlxuICAgICAgICBpZiAoZGlhbG9nQ29tcCkge1xuICAgICAgICAgICAgZGlhbG9nQ29tcC5zZXREYXRhKGRhdGEpXG4gICAgICAgIH1cbiAgICAgICAgXG4gICAgICAgIGNvbnNvbGUubG9nKFwi8J+PhiBbVG91cm5hbWVudFdhaXRpbmddIOacgOe7iOamnOWNleW8ueeql+W3suWIm+W7ulwiKVxuICAgIH0sXG5cbiAgICAvLyA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cbiAgICAvLyDov5Tlm57lpKfljoVcbiAgICAvLyA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cblxuICAgIG9uQmFja1RvSGFsbENsaWNrOiBmdW5jdGlvbigpIHtcbiAgICAgICAgLy8g6L+U5Zue5aSn5Y6F5Zy65pmvXG4gICAgICAgIGNjLmRpcmVjdG9yLmxvYWRTY2VuZShcImhhbGxTY2VuZVwiKVxuICAgIH1cbn0pO1xuIl19
//------QC-SOURCE-SPLIT------

                (function() {
                    var nodeEnv = typeof require !== 'undefined' && typeof process !== 'undefined';
                    var __module = nodeEnv ? module : {exports:{}};
                    var __filename = 'preview-scripts/assets/scripts/hallscene/prefabs_script/creatroom.js';
                    var __require = nodeEnv ? function (request) {
                        return cc.require(request);
                    } : function (request) {
                        return __quick_compile_project__.require(request, __filename);
                    };
                    function __define (exports, require, module) {
                        if (!nodeEnv) {__quick_compile_project__.registerModule(__filename, module);}"use strict";
cc._RF.push(module, '7bce5zzoXI04qsNEuZ579+P', 'creatroom');
// scripts/hallscene/prefabs_script/creatroom.js

"use strict";

// 创建房间脚本

cc.Class({
  "extends": cc.Component,
  properties: {
    // 房间配置选项可以在这里添加
  },
  // LIFE-CYCLE CALLBACKS:
  onLoad: function onLoad() {
    // 初始化
  },
  start: function start() {
    // 开始
  },
  // 按钮点击事件处理
  onButtonClick: function onButtonClick(event, customData) {
    var myglobal = window.myglobal;
    if (!myglobal || !myglobal.socket) {
      console.error("socket 未连接");
      return;
    }
    switch (customData) {
      case "create_room_1":
        this._createRoom(1); // 房间配置ID = 1
        break;
      case "create_room_2":
        this._createRoom(2); // 房间配置ID = 2
        break;
      case "create_room_3":
        this._createRoom(3); // 房间配置ID = 3
        break;
      case "create_room_4":
        this._createRoom(4); // 房间配置ID = 4
        break;
      case "create_room_close":
        this.node.destroy();
        break;
      default:
        break;
    }
  },
  _createRoom: function _createRoom(roomConfigId) {
    var myglobal = window.myglobal;
    if (myglobal && myglobal.socket) {
      // 发送创建房间请求，携带房间配置ID
      myglobal.socket.createRoom(roomConfigId, function (result, data) {
        if (result === 0) {
          // 保存房间信息到 playerData
          myglobal.playerData.roomid = data.room_code;
          myglobal.playerData.bottom = 100;
          myglobal.playerData.rate = 1;

          // 保存重连信息到 localStorage
          myglobal.socket.saveReconnectInfo();

          // 🚀【性能优化】跳转到游戏场景（已预加载，应秒进）
          var startTime = Date.now();
          cc.director.loadScene("gameScene", function (err) {
            if (err) {
              console.error("🚀 [创建房间] 加载游戏场景失败:", err);
              return;
            }
            var elapsed = Date.now() - startTime;
          });
        } else {
          console.error("创建房间失败");
        }
      });
    }
  }
});

cc._RF.pop();
                    }
                    if (nodeEnv) {
                        __define(__module.exports, __require, __module);
                    }
                    else {
                        __quick_compile_project__.registerModuleFunc(__filename, function () {
                            __define(__module.exports, __require, __module);
                        });
                    }
                })();
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImFzc2V0c1xcc2NyaXB0c1xcaGFsbHNjZW5lXFxwcmVmYWJzX3NjcmlwdFxcY3JlYXRyb29tLmpzIl0sIm5hbWVzIjpbImNjIiwiQ2xhc3MiLCJDb21wb25lbnQiLCJwcm9wZXJ0aWVzIiwib25Mb2FkIiwic3RhcnQiLCJvbkJ1dHRvbkNsaWNrIiwiZXZlbnQiLCJjdXN0b21EYXRhIiwibXlnbG9iYWwiLCJ3aW5kb3ciLCJzb2NrZXQiLCJjb25zb2xlIiwiZXJyb3IiLCJfY3JlYXRlUm9vbSIsIm5vZGUiLCJkZXN0cm95Iiwicm9vbUNvbmZpZ0lkIiwiY3JlYXRlUm9vbSIsInJlc3VsdCIsImRhdGEiLCJwbGF5ZXJEYXRhIiwicm9vbWlkIiwicm9vbV9jb2RlIiwiYm90dG9tIiwicmF0ZSIsInNhdmVSZWNvbm5lY3RJbmZvIiwic3RhcnRUaW1lIiwiRGF0ZSIsIm5vdyIsImRpcmVjdG9yIiwibG9hZFNjZW5lIiwiZXJyIiwiZWxhcHNlZCJdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFBQTs7QUFFQUEsRUFBRSxDQUFDQyxLQUFLLENBQUM7RUFDTCxXQUFTRCxFQUFFLENBQUNFLFNBQVM7RUFFckJDLFVBQVUsRUFBRTtJQUNSO0VBQUEsQ0FDSDtFQUVEO0VBRUFDLE1BQU0sV0FBQUEsT0FBQSxFQUFJO0lBQ047RUFBQSxDQUNIO0VBRURDLEtBQUssV0FBQUEsTUFBQSxFQUFJO0lBQ0w7RUFBQSxDQUNIO0VBRUQ7RUFDQUMsYUFBYSxXQUFBQSxjQUFDQyxLQUFLLEVBQUVDLFVBQVUsRUFBRTtJQUM3QixJQUFJQyxRQUFRLEdBQUdDLE1BQU0sQ0FBQ0QsUUFBUTtJQUM5QixJQUFJLENBQUNBLFFBQVEsSUFBSSxDQUFDQSxRQUFRLENBQUNFLE1BQU0sRUFBRTtNQUMvQkMsT0FBTyxDQUFDQyxLQUFLLENBQUMsWUFBWSxDQUFDO01BQzNCO0lBQ0o7SUFFQSxRQUFRTCxVQUFVO01BQ2QsS0FBSyxlQUFlO1FBQ2hCLElBQUksQ0FBQ00sV0FBVyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUU7UUFDdEI7TUFDSixLQUFLLGVBQWU7UUFDaEIsSUFBSSxDQUFDQSxXQUFXLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBRTtRQUN0QjtNQUNKLEtBQUssZUFBZTtRQUNoQixJQUFJLENBQUNBLFdBQVcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFFO1FBQ3RCO01BQ0osS0FBSyxlQUFlO1FBQ2hCLElBQUksQ0FBQ0EsV0FBVyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUU7UUFDdEI7TUFDSixLQUFLLG1CQUFtQjtRQUNwQixJQUFJLENBQUNDLElBQUksQ0FBQ0MsT0FBTyxFQUFFO1FBQ25CO01BQ0o7UUFDSTtJQUFNO0VBRWxCLENBQUM7RUFFREYsV0FBVyxXQUFBQSxZQUFDRyxZQUFZLEVBQUU7SUFDdEIsSUFBSVIsUUFBUSxHQUFHQyxNQUFNLENBQUNELFFBQVE7SUFDOUIsSUFBSUEsUUFBUSxJQUFJQSxRQUFRLENBQUNFLE1BQU0sRUFBRTtNQUM3QjtNQUNBRixRQUFRLENBQUNFLE1BQU0sQ0FBQ08sVUFBVSxDQUFDRCxZQUFZLEVBQUUsVUFBU0UsTUFBTSxFQUFFQyxJQUFJLEVBQUU7UUFDNUQsSUFBSUQsTUFBTSxLQUFLLENBQUMsRUFBRTtVQUVkO1VBQ0FWLFFBQVEsQ0FBQ1ksVUFBVSxDQUFDQyxNQUFNLEdBQUdGLElBQUksQ0FBQ0csU0FBUztVQUMzQ2QsUUFBUSxDQUFDWSxVQUFVLENBQUNHLE1BQU0sR0FBRyxHQUFHO1VBQ2hDZixRQUFRLENBQUNZLFVBQVUsQ0FBQ0ksSUFBSSxHQUFHLENBQUM7O1VBRTVCO1VBQ0FoQixRQUFRLENBQUNFLE1BQU0sQ0FBQ2UsaUJBQWlCLEVBQUU7O1VBRW5DO1VBQ0EsSUFBSUMsU0FBUyxHQUFHQyxJQUFJLENBQUNDLEdBQUcsRUFBRTtVQUMxQjdCLEVBQUUsQ0FBQzhCLFFBQVEsQ0FBQ0MsU0FBUyxDQUFDLFdBQVcsRUFBRSxVQUFTQyxHQUFHLEVBQUU7WUFDN0MsSUFBSUEsR0FBRyxFQUFFO2NBQ0xwQixPQUFPLENBQUNDLEtBQUssQ0FBQyxxQkFBcUIsRUFBRW1CLEdBQUcsQ0FBQztjQUN6QztZQUNKO1lBQ0EsSUFBSUMsT0FBTyxHQUFHTCxJQUFJLENBQUNDLEdBQUcsRUFBRSxHQUFHRixTQUFTO1VBQ3hDLENBQUMsQ0FBQztRQUNOLENBQUMsTUFBTTtVQUNIZixPQUFPLENBQUNDLEtBQUssQ0FBQyxRQUFRLENBQUM7UUFDM0I7TUFDSixDQUFDLENBQUM7SUFDTjtFQUNKO0FBQ0osQ0FBQyxDQUFDIiwic291cmNlUm9vdCI6Ii8iLCJzb3VyY2VzQ29udGVudCI6WyIvLyDliJvlu7rmiL/pl7TohJrmnKxcblxuY2MuQ2xhc3Moe1xuICAgIGV4dGVuZHM6IGNjLkNvbXBvbmVudCxcblxuICAgIHByb3BlcnRpZXM6IHtcbiAgICAgICAgLy8g5oi/6Ze06YWN572u6YCJ6aG55Y+v5Lul5Zyo6L+Z6YeM5re75YqgXG4gICAgfSxcblxuICAgIC8vIExJRkUtQ1lDTEUgQ0FMTEJBQ0tTOlxuXG4gICAgb25Mb2FkICgpIHtcbiAgICAgICAgLy8g5Yid5aeL5YyWXG4gICAgfSxcblxuICAgIHN0YXJ0ICgpIHtcbiAgICAgICAgLy8g5byA5aeLXG4gICAgfSxcblxuICAgIC8vIOaMiemSrueCueWHu+S6i+S7tuWkhOeQhlxuICAgIG9uQnV0dG9uQ2xpY2soZXZlbnQsIGN1c3RvbURhdGEpIHtcbiAgICAgICAgdmFyIG15Z2xvYmFsID0gd2luZG93Lm15Z2xvYmFsO1xuICAgICAgICBpZiAoIW15Z2xvYmFsIHx8ICFteWdsb2JhbC5zb2NrZXQpIHtcbiAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoXCJzb2NrZXQg5pyq6L+e5o6lXCIpO1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgICAgc3dpdGNoIChjdXN0b21EYXRhKSB7XG4gICAgICAgICAgICBjYXNlIFwiY3JlYXRlX3Jvb21fMVwiOlxuICAgICAgICAgICAgICAgIHRoaXMuX2NyZWF0ZVJvb20oMSk7ICAvLyDmiL/pl7TphY3nva5JRCA9IDFcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIGNhc2UgXCJjcmVhdGVfcm9vbV8yXCI6XG4gICAgICAgICAgICAgICAgdGhpcy5fY3JlYXRlUm9vbSgyKTsgIC8vIOaIv+mXtOmFjee9rklEID0gMlxuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgY2FzZSBcImNyZWF0ZV9yb29tXzNcIjpcbiAgICAgICAgICAgICAgICB0aGlzLl9jcmVhdGVSb29tKDMpOyAgLy8g5oi/6Ze06YWN572uSUQgPSAzXG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICBjYXNlIFwiY3JlYXRlX3Jvb21fNFwiOlxuICAgICAgICAgICAgICAgIHRoaXMuX2NyZWF0ZVJvb20oNCk7ICAvLyDmiL/pl7TphY3nva5JRCA9IDRcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIGNhc2UgXCJjcmVhdGVfcm9vbV9jbG9zZVwiOlxuICAgICAgICAgICAgICAgIHRoaXMubm9kZS5kZXN0cm95KCk7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICBkZWZhdWx0OlxuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICB9XG4gICAgfSxcblxuICAgIF9jcmVhdGVSb29tKHJvb21Db25maWdJZCkge1xuICAgICAgICB2YXIgbXlnbG9iYWwgPSB3aW5kb3cubXlnbG9iYWw7XG4gICAgICAgIGlmIChteWdsb2JhbCAmJiBteWdsb2JhbC5zb2NrZXQpIHtcbiAgICAgICAgICAgIC8vIOWPkemAgeWIm+W7uuaIv+mXtOivt+axgu+8jOaQuuW4puaIv+mXtOmFjee9rklEXG4gICAgICAgICAgICBteWdsb2JhbC5zb2NrZXQuY3JlYXRlUm9vbShyb29tQ29uZmlnSWQsIGZ1bmN0aW9uKHJlc3VsdCwgZGF0YSkge1xuICAgICAgICAgICAgICAgIGlmIChyZXN1bHQgPT09IDApIHtcbiAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgICAgIC8vIOS/neWtmOaIv+mXtOS/oeaBr+WIsCBwbGF5ZXJEYXRhXG4gICAgICAgICAgICAgICAgICAgIG15Z2xvYmFsLnBsYXllckRhdGEucm9vbWlkID0gZGF0YS5yb29tX2NvZGVcbiAgICAgICAgICAgICAgICAgICAgbXlnbG9iYWwucGxheWVyRGF0YS5ib3R0b20gPSAxMDBcbiAgICAgICAgICAgICAgICAgICAgbXlnbG9iYWwucGxheWVyRGF0YS5yYXRlID0gMVxuICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICAgICAgLy8g5L+d5a2Y6YeN6L+e5L+h5oGv5YiwIGxvY2FsU3RvcmFnZVxuICAgICAgICAgICAgICAgICAgICBteWdsb2JhbC5zb2NrZXQuc2F2ZVJlY29ubmVjdEluZm8oKVxuICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICAgICAgLy8g8J+agOOAkOaAp+iDveS8mOWMluOAkei3s+i9rOWIsOa4uOaIj+WcuuaZr++8iOW3sumihOWKoOi9ve+8jOW6lOenkui/m++8iVxuICAgICAgICAgICAgICAgICAgICB2YXIgc3RhcnRUaW1lID0gRGF0ZS5ub3coKTtcbiAgICAgICAgICAgICAgICAgICAgY2MuZGlyZWN0b3IubG9hZFNjZW5lKFwiZ2FtZVNjZW5lXCIsIGZ1bmN0aW9uKGVycikge1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGVycikge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoXCLwn5qAIFvliJvlu7rmiL/pl7RdIOWKoOi9vea4uOaIj+WcuuaZr+Wksei0pTpcIiwgZXJyKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICB2YXIgZWxhcHNlZCA9IERhdGUubm93KCkgLSBzdGFydFRpbWU7XG4gICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoXCLliJvlu7rmiL/pl7TlpLHotKVcIik7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICB9XG59KTtcbiJdfQ==
//------QC-SOURCE-SPLIT------

                (function() {
                    var nodeEnv = typeof require !== 'undefined' && typeof process !== 'undefined';
                    var __module = nodeEnv ? module : {exports:{}};
                    var __filename = 'preview-scripts/assets/scripts/hallscene/prefabs_script/joinroom.js';
                    var __require = nodeEnv ? function (request) {
                        return cc.require(request);
                    } : function (request) {
                        return __quick_compile_project__.require(request, __filename);
                    };
                    function __define (exports, require, module) {
                        if (!nodeEnv) {__quick_compile_project__.registerModule(__filename, module);}"use strict";
cc._RF.push(module, 'f5be7jebVDi+qr1Px4nfSdB', 'joinroom');
// scripts/hallscene/prefabs_script/joinroom.js

"use strict";

// 加入房间脚本

cc.Class({
  "extends": cc.Component,
  properties: {
    room_id_input: {
      type: cc.EditBox,
      "default": null
    }
  },
  // LIFE-CYCLE CALLBACKS:
  onLoad: function onLoad() {
    // 初始化
  },
  start: function start() {
    // 开始
  },
  // 按钮点击事件处理
  onButtonClick: function onButtonClick(event, customData) {
    var myglobal = window.myglobal;
    if (!myglobal || !myglobal.socket) {
      console.error("socket 未连接");
      return;
    }
    switch (customData) {
      case "join_room_confirm":
        this._joinRoom();
        break;
      case "join_room_close":
        this.node.destroy();
        break;
      default:
        break;
    }
  },
  _joinRoom: function _joinRoom() {
    var myglobal = window.myglobal;
    if (this.room_id_input && myglobal && myglobal.socket) {
      var roomId = this.room_id_input.string;
      if (roomId && roomId.length > 0) {
        // 发送加入房间请求
        // myglobal.socket.joinRoom(roomId);
      } else {}
    }
  }
});

cc._RF.pop();
                    }
                    if (nodeEnv) {
                        __define(__module.exports, __require, __module);
                    }
                    else {
                        __quick_compile_project__.registerModuleFunc(__filename, function () {
                            __define(__module.exports, __require, __module);
                        });
                    }
                })();
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImFzc2V0c1xcc2NyaXB0c1xcaGFsbHNjZW5lXFxwcmVmYWJzX3NjcmlwdFxcam9pbnJvb20uanMiXSwibmFtZXMiOlsiY2MiLCJDbGFzcyIsIkNvbXBvbmVudCIsInByb3BlcnRpZXMiLCJyb29tX2lkX2lucHV0IiwidHlwZSIsIkVkaXRCb3giLCJvbkxvYWQiLCJzdGFydCIsIm9uQnV0dG9uQ2xpY2siLCJldmVudCIsImN1c3RvbURhdGEiLCJteWdsb2JhbCIsIndpbmRvdyIsInNvY2tldCIsImNvbnNvbGUiLCJlcnJvciIsIl9qb2luUm9vbSIsIm5vZGUiLCJkZXN0cm95Iiwicm9vbUlkIiwic3RyaW5nIiwibGVuZ3RoIl0sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7OztBQUFBOztBQUVBQSxFQUFFLENBQUNDLEtBQUssQ0FBQztFQUNMLFdBQVNELEVBQUUsQ0FBQ0UsU0FBUztFQUVyQkMsVUFBVSxFQUFFO0lBQ1JDLGFBQWEsRUFBRTtNQUNYQyxJQUFJLEVBQUVMLEVBQUUsQ0FBQ00sT0FBTztNQUNoQixXQUFTO0lBQ2I7RUFDSixDQUFDO0VBRUQ7RUFFQUMsTUFBTSxXQUFBQSxPQUFBLEVBQUk7SUFDTjtFQUFBLENBQ0g7RUFFREMsS0FBSyxXQUFBQSxNQUFBLEVBQUk7SUFDTDtFQUFBLENBQ0g7RUFFRDtFQUNBQyxhQUFhLFdBQUFBLGNBQUNDLEtBQUssRUFBRUMsVUFBVSxFQUFFO0lBQzdCLElBQUlDLFFBQVEsR0FBR0MsTUFBTSxDQUFDRCxRQUFRO0lBQzlCLElBQUksQ0FBQ0EsUUFBUSxJQUFJLENBQUNBLFFBQVEsQ0FBQ0UsTUFBTSxFQUFFO01BQy9CQyxPQUFPLENBQUNDLEtBQUssQ0FBQyxZQUFZLENBQUM7TUFDM0I7SUFDSjtJQUVBLFFBQVFMLFVBQVU7TUFDZCxLQUFLLG1CQUFtQjtRQUNwQixJQUFJLENBQUNNLFNBQVMsRUFBRTtRQUNoQjtNQUNKLEtBQUssaUJBQWlCO1FBQ2xCLElBQUksQ0FBQ0MsSUFBSSxDQUFDQyxPQUFPLEVBQUU7UUFDbkI7TUFDSjtRQUNJO0lBQU07RUFFbEIsQ0FBQztFQUVERixTQUFTLFdBQUFBLFVBQUEsRUFBRztJQUNSLElBQUlMLFFBQVEsR0FBR0MsTUFBTSxDQUFDRCxRQUFRO0lBQzlCLElBQUksSUFBSSxDQUFDUixhQUFhLElBQUlRLFFBQVEsSUFBSUEsUUFBUSxDQUFDRSxNQUFNLEVBQUU7TUFDbkQsSUFBSU0sTUFBTSxHQUFHLElBQUksQ0FBQ2hCLGFBQWEsQ0FBQ2lCLE1BQU07TUFDdEMsSUFBSUQsTUFBTSxJQUFJQSxNQUFNLENBQUNFLE1BQU0sR0FBRyxDQUFDLEVBQUU7UUFDN0I7UUFDQTtNQUFBLENBQ0gsTUFBTSxDQUNQO0lBQ0o7RUFDSjtBQUNKLENBQUMsQ0FBQyIsInNvdXJjZVJvb3QiOiIvIiwic291cmNlc0NvbnRlbnQiOlsiLy8g5Yqg5YWl5oi/6Ze06ISa5pysXG5cbmNjLkNsYXNzKHtcbiAgICBleHRlbmRzOiBjYy5Db21wb25lbnQsXG5cbiAgICBwcm9wZXJ0aWVzOiB7XG4gICAgICAgIHJvb21faWRfaW5wdXQ6IHtcbiAgICAgICAgICAgIHR5cGU6IGNjLkVkaXRCb3gsXG4gICAgICAgICAgICBkZWZhdWx0OiBudWxsXG4gICAgICAgIH1cbiAgICB9LFxuXG4gICAgLy8gTElGRS1DWUNMRSBDQUxMQkFDS1M6XG5cbiAgICBvbkxvYWQgKCkge1xuICAgICAgICAvLyDliJ3lp4vljJZcbiAgICB9LFxuXG4gICAgc3RhcnQgKCkge1xuICAgICAgICAvLyDlvIDlp4tcbiAgICB9LFxuXG4gICAgLy8g5oyJ6ZKu54K55Ye75LqL5Lu25aSE55CGXG4gICAgb25CdXR0b25DbGljayhldmVudCwgY3VzdG9tRGF0YSkge1xuICAgICAgICB2YXIgbXlnbG9iYWwgPSB3aW5kb3cubXlnbG9iYWw7XG4gICAgICAgIGlmICghbXlnbG9iYWwgfHwgIW15Z2xvYmFsLnNvY2tldCkge1xuICAgICAgICAgICAgY29uc29sZS5lcnJvcihcInNvY2tldCDmnKrov57mjqVcIik7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICBzd2l0Y2ggKGN1c3RvbURhdGEpIHtcbiAgICAgICAgICAgIGNhc2UgXCJqb2luX3Jvb21fY29uZmlybVwiOlxuICAgICAgICAgICAgICAgIHRoaXMuX2pvaW5Sb29tKCk7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICBjYXNlIFwiam9pbl9yb29tX2Nsb3NlXCI6XG4gICAgICAgICAgICAgICAgdGhpcy5ub2RlLmRlc3Ryb3koKTtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIGRlZmF1bHQ6XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgIH1cbiAgICB9LFxuXG4gICAgX2pvaW5Sb29tKCkge1xuICAgICAgICB2YXIgbXlnbG9iYWwgPSB3aW5kb3cubXlnbG9iYWw7XG4gICAgICAgIGlmICh0aGlzLnJvb21faWRfaW5wdXQgJiYgbXlnbG9iYWwgJiYgbXlnbG9iYWwuc29ja2V0KSB7XG4gICAgICAgICAgICB2YXIgcm9vbUlkID0gdGhpcy5yb29tX2lkX2lucHV0LnN0cmluZztcbiAgICAgICAgICAgIGlmIChyb29tSWQgJiYgcm9vbUlkLmxlbmd0aCA+IDApIHtcbiAgICAgICAgICAgICAgICAvLyDlj5HpgIHliqDlhaXmiL/pl7Tor7fmsYJcbiAgICAgICAgICAgICAgICAvLyBteWdsb2JhbC5zb2NrZXQuam9pblJvb20ocm9vbUlkKTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG59KTtcbiJdfQ==
//------QC-SOURCE-SPLIT------

                (function() {
                    var nodeEnv = typeof require !== 'undefined' && typeof process !== 'undefined';
                    var __module = nodeEnv ? module : {exports:{}};
                    var __filename = 'preview-scripts/assets/scripts/ddz/tournament/TournamentFinalRankDialog.js';
                    var __require = nodeEnv ? function (request) {
                        return cc.require(request);
                    } : function (request) {
                        return __quick_compile_project__.require(request, __filename);
                    };
                    function __define (exports, require, module) {
                        if (!nodeEnv) {__quick_compile_project__.registerModule(__filename, module);}"use strict";
cc._RF.push(module, 'd534bqBYA5JGadVgedCNtkf', 'TournamentFinalRankDialog');
// scripts/ddz/tournament/TournamentFinalRankDialog.js

"use strict";

/**
 * TournamentFinalRankDialog - 竞技场决赛冠军排行榜弹窗
 * 
 * 功能：
 * 1. 显示期号和比赛结束标题
 * 2. 前三名领奖台展示（冠军最大，居中高亮）
 * 3. TOP20 ScrollView列表
 * 4. 显示排名、头像、昵称、最终金币
 * 5. 确认按钮返回大厅
 * 
 * 设计风格：中国风斗地主竞技场 - 金色 + 红色
 * 冠军特效：发光、粒子、奖杯动画
 * 
 * 🔧【修复】优化布局：修复名次、头像、用户名挤在一起的问题
 */

cc.Class({
  "extends": cc.Component,
  properties: {
    // 期号标签
    periodNoLabel: {
      type: cc.Label,
      "default": null
    },
    // 总参赛人数标签
    totalPlayersLabel: {
      type: cc.Label,
      "default": null
    },
    // 冠军节点
    championNode: {
      type: cc.Node,
      "default": null
    },
    // 亚军节点
    runnerUpNode: {
      type: cc.Node,
      "default": null
    },
    // 季军节点
    thirdPlaceNode: {
      type: cc.Node,
      "default": null
    },
    // TOP20 ScrollView
    top20ScrollView: {
      type: cc.ScrollView,
      "default": null
    },
    // 排行榜item模板
    rankItemPrefab: {
      type: cc.Prefab,
      "default": null
    },
    // 我的排名标签
    myRankLabel: {
      type: cc.Label,
      "default": null
    },
    // 我的金币标签
    myCoinLabel: {
      type: cc.Label,
      "default": null
    },
    // 确认按钮
    confirmBtn: {
      type: cc.Button,
      "default": null
    },
    // 冠军奖杯节点
    trophyNode: {
      type: cc.Node,
      "default": null
    },
    // 冠军发光效果节点
    championGlowNode: {
      type: cc.Node,
      "default": null
    }
  },
  // LIFE-CYCLE CALLBACKS:
  onLoad: function onLoad() {
    // 初始化数据
    this._data = null;
    this._top3 = [];
    this._top20 = [];
    this._myRank = 0;
    this._myMatchCoin = 0;

    // 🔧【新增】检查是否需要动态创建UI（prefab不存在时）
    this._checkAndCreateDynamicUI();

    // 注册按钮事件
    if (this.confirmBtn) {
      this.confirmBtn.node.on('click', this.onConfirmClick, this);
    }
  },
  start: function start() {
    // 启动冠军特效动画
    this._startChampionEffects();
  },
  /**
   * 🔧【新增】检查并动态创建UI（prefab不存在时）
   */
  _checkAndCreateDynamicUI: function _checkAndCreateDynamicUI() {
    // 如果关键节点不存在，说明prefab未正确加载，需要动态创建UI
    if (!this.championNode || !this.runnerUpNode || !this.thirdPlaceNode) {
      console.log("🏆 [TournamentFinalRankDialog] 检测到prefab未加载，动态创建UI");
      this._createDynamicUI();
    }
  },
  /**
   * 🔧【新增】动态创建完整的弹窗UI
   */
  _createDynamicUI: function _createDynamicUI() {
    var canvas = cc.find('Canvas');
    if (!canvas) {
      console.error("找不到Canvas节点");
      return;
    }
    var screenWidth = 1280;
    var screenHeight = 720;

    // 设置当前节点为全屏遮罩
    this.node.setContentSize(screenWidth, screenHeight);
    this.node.setPosition(0, 0);

    // 添加半透明背景
    var bgNode = new cc.Node("Background");
    bgNode.setContentSize(screenWidth, screenHeight);
    var bgGraphics = bgNode.addComponent(cc.Graphics);
    bgGraphics.fillColor = new cc.Color(0, 0, 0, 180);
    bgGraphics.rect(-screenWidth / 2, -screenHeight / 2, screenWidth, screenHeight);
    bgGraphics.fill();
    bgNode.parent = this.node;

    // 主弹窗容器 - 增大尺寸以容纳所有元素
    var dialogNode = new cc.Node("DialogContainer");
    dialogNode.setContentSize(1000, 650);
    dialogNode.setPosition(0, 0);

    // 弹窗背景
    var dialogBg = new cc.Node("DialogBg");
    var dialogBgGraphics = dialogBg.addComponent(cc.Graphics);
    dialogBgGraphics.fillColor = new cc.Color(25, 35, 60, 250);
    dialogBgGraphics.roundRect(-500, -325, 1000, 650, 25);
    dialogBgGraphics.fill();
    dialogBgGraphics.strokeColor = new cc.Color(180, 140, 60);
    dialogBgGraphics.lineWidth = 4;
    dialogBgGraphics.roundRect(-500, -325, 1000, 650, 25);
    dialogBgGraphics.stroke();
    dialogBg.parent = dialogNode;
    dialogNode.parent = this.node;

    // ========== 标题区域 ==========
    var titleNode = new cc.Node("TitleNode");
    titleNode.setPosition(0, 280); // 上移

    var titleLabel = titleNode.addComponent(cc.Label);
    titleLabel.string = "🏆 比赛结束 🏆";
    titleLabel.fontSize = 40;
    titleLabel.lineHeight = 48;
    titleLabel.horizontalAlign = cc.Label.HorizontalAlign.CENTER;
    titleNode.color = new cc.Color(255, 215, 0);
    var titleOutline = titleNode.addComponent(cc.LabelOutline);
    titleOutline.color = new cc.Color(100, 60, 0);
    titleOutline.width = 3;
    titleNode.parent = dialogNode;

    // ========== 期号和参赛人数 ==========
    this._periodNoNode = new cc.Node("PeriodNoNode");
    this._periodNoNode.setPosition(0, 230); // 上移
    var periodLabel = this._periodNoNode.addComponent(cc.Label);
    periodLabel.string = "第---期赛事结束";
    periodLabel.fontSize = 26;
    periodLabel.lineHeight = 32;
    this._periodNoNode.color = new cc.Color(200, 200, 220);
    this._periodNoNode.parent = dialogNode;
    this.periodNoLabel = periodLabel;
    this._totalPlayersNode = new cc.Node("TotalPlayersNode");
    this._totalPlayersNode.setPosition(0, 195); // 上移
    var totalLabel = this._totalPlayersNode.addComponent(cc.Label);
    totalLabel.string = "共0人参赛";
    totalLabel.fontSize = 22;
    totalLabel.lineHeight = 28;
    this._totalPlayersNode.color = new cc.Color(180, 180, 200);
    this._totalPlayersNode.parent = dialogNode;
    this.totalPlayersLabel = totalLabel;

    // ========== 前三名领奖台 ==========
    // 🔧【修复】优化布局间距，避免元素挤在一起
    this._createTop3Podium(dialogNode);

    // ========== 我的排名区域 ==========
    // 🔧【修复】排名文本框文字上下居中
    this._createMyRankArea(dialogNode);

    // ========== 确认按钮 ==========
    this._createConfirmButton(dialogNode);
    console.log("🏆 [TournamentFinalRankDialog] 动态UI创建完成");
  },
  /**
   * 🔧【修复】创建前三名领奖台
   * 布局优化：确保冠军居中高亮，亚季军对称分布
   */
  _createTop3Podium: function _createTop3Podium(parentNode) {
    // 领奖台Y坐标基准 - 整体上移，留出更多空间
    var podiumY = 50;

    // 水平间距 - 增大间距避免重叠
    var spacingX = 280;

    // 冠军（中间，最大，位置最高）
    this.championNode = this._createPodiumItem(1, 0, podiumY + 40, 1.15);
    this.championNode.parent = parentNode;

    // 亚军（左侧，位置略低）
    this.runnerUpNode = this._createPodiumItem(2, -spacingX, podiumY, 1.0);
    this.runnerUpNode.parent = parentNode;

    // 季军（右侧，位置略低）
    this.thirdPlaceNode = this._createPodiumItem(3, spacingX, podiumY, 1.0);
    this.thirdPlaceNode.parent = parentNode;

    // 创建领奖台底部
    var podiumBaseY = podiumY - 100;
    this._createPodiumBase(parentNode, podiumBaseY);
  },
  /**
   * 🔧【修复】创建单个领奖台项目
   * 布局顺序（从上到下）：名次 → 头像 → 昵称 → 金币
   * 修复：增大元素间距，确保不挤在一起
   */
  _createPodiumItem: function _createPodiumItem(rank, x, y, scale) {
    var node = new cc.Node("PodiumItem_" + rank);
    node.setPosition(x, y);
    node.scale = scale || 1;

    // ========== 布局计算（修复间距）==========
    // 以头像中心为基准(Y=0)，其他元素相对定位
    // 从上到下依次排列：名次 → 头像 → 昵称 → 金币
    // 🔧【修复】增大各元素之间的间距
    var layoutConfig = {
      rankY: 65,
      // 名次Y坐标（头像上方65px，增大间距）
      avatarY: 0,
      // 头像Y坐标（基准位置）
      nameY: -60,
      // 昵称Y坐标（头像下方60px，增大间距）
      coinY: -90 // 金币Y坐标（昵称下方30px，增大间距）
    };

    // ========== 名次标签（最上面）==========
    var rankLabelNode = new cc.Node("RankLabel");
    rankLabelNode.setPosition(0, layoutConfig.rankY);
    var rankLabel = rankLabelNode.addComponent(cc.Label);
    rankLabel.string = this._getRankText(rank);
    rankLabel.fontSize = 22;
    rankLabel.horizontalAlign = cc.Label.HorizontalAlign.CENTER;
    rankLabelNode.color = rank === 1 ? new cc.Color(255, 215, 0) : new cc.Color(200, 200, 220);
    var rankOutline = rankLabelNode.addComponent(cc.LabelOutline);
    rankOutline.color = new cc.Color(50, 50, 80);
    rankOutline.width = 2;
    rankLabelNode.parent = node;

    // ========== 头像区域（名次下方）==========
    // 🔧【修复】根据排名调整头像大小
    var avatarSize = rank === 1 ? 70 : 60; // 冠军头像更大
    var avatarRadius = avatarSize / 2 + 2;
    var avatarContainer = new cc.Node("AvatarContainer");
    avatarContainer.setPosition(0, layoutConfig.avatarY);
    avatarContainer.setContentSize(avatarSize, avatarSize);

    // 头像背景（圆形）
    var avatarBg = new cc.Node("AvatarBg");
    var avatarBgGraphics = avatarBg.addComponent(cc.Graphics);
    avatarBgGraphics.fillColor = new cc.Color(60, 70, 100);
    avatarBgGraphics.circle(0, 0, avatarRadius);
    avatarBgGraphics.fill();
    avatarBgGraphics.strokeColor = rank === 1 ? new cc.Color(255, 215, 0) : new cc.Color(150, 150, 180);
    avatarBgGraphics.lineWidth = rank === 1 ? 3 : 2;
    avatarBgGraphics.circle(0, 0, avatarRadius);
    avatarBgGraphics.stroke();
    avatarBg.parent = avatarContainer;

    // 头像精灵
    var avatarSpriteNode = new cc.Node("AvatarSprite");
    var avatarSprite = avatarSpriteNode.addComponent(cc.Sprite);
    avatarSprite.sizeMode = cc.Sprite.SizeMode.CUSTOM;
    avatarSpriteNode.setContentSize(avatarSize - 4, avatarSize - 4);
    avatarSpriteNode.parent = avatarContainer;
    avatarContainer.parent = node;

    // ========== 昵称标签（头像下方）==========
    // 🔧【修复】增大字体，限制宽度防止溢出
    var nameLabelNode = new cc.Node("NameLabel");
    nameLabelNode.setPosition(0, layoutConfig.nameY);
    nameLabelNode.setContentSize(120, 30); // 限制宽度
    var nameLabel = nameLabelNode.addComponent(cc.Label);
    nameLabel.string = "玩家昵称";
    nameLabel.fontSize = rank === 1 ? 20 : 18; // 冠军字体稍大
    nameLabel.lineHeight = 24;
    nameLabel.horizontalAlign = cc.Label.HorizontalAlign.CENTER;
    nameLabel.overflow = cc.Label.Overflow.CLAMP; // 防止溢出
    nameLabelNode.color = new cc.Color(255, 255, 255);
    var nameOutline = nameLabelNode.addComponent(cc.LabelOutline);
    nameOutline.color = new cc.Color(30, 30, 50);
    nameOutline.width = 1;
    nameLabelNode.parent = node;

    // ========== 金币标签（昵称下方）==========
    // 🔧【修复】增大字体和间距，更醒目
    var coinLabelNode = new cc.Node("CoinLabel");
    coinLabelNode.setPosition(0, layoutConfig.coinY);
    var coinLabel = coinLabelNode.addComponent(cc.Label);
    coinLabel.string = "0金币";
    coinLabel.fontSize = rank === 1 ? 18 : 16; // 冠军字体稍大
    coinLabel.lineHeight = 20;
    coinLabel.horizontalAlign = cc.Label.HorizontalAlign.CENTER;
    coinLabelNode.color = rank === 1 ? new cc.Color(255, 215, 0) : new cc.Color(255, 200, 100); // 冠军金色
    var coinOutline = coinLabelNode.addComponent(cc.LabelOutline);
    coinOutline.color = new cc.Color(80, 50, 0);
    coinOutline.width = 1;
    coinLabelNode.parent = node;
    return node;
  },
  /**
   * 🔧【修复】创建领奖台底部
   * 修复：调整位置与领奖台项目对齐
   */
  _createPodiumBase: function _createPodiumBase(parentNode, y) {
    var spacingX = 280; // 与领奖台项目间距一致

    // 冠军台（最高，最宽）
    var championBase = new cc.Node("ChampionBase");
    championBase.setPosition(0, y - 20); // 对齐冠军位置
    var cg1 = championBase.addComponent(cc.Graphics);
    cg1.fillColor = new cc.Color(180, 140, 60, 200);
    cg1.roundRect(-80, -30, 160, 60, 10);
    cg1.fill();
    cg1.strokeColor = new cc.Color(220, 180, 80);
    cg1.lineWidth = 2;
    cg1.roundRect(-80, -30, 160, 60, 10);
    cg1.stroke();
    championBase.parent = parentNode;

    // 亚军台（中等）
    var runnerUpBase = new cc.Node("RunnerUpBase");
    runnerUpBase.setPosition(-spacingX, y - 30); // 对齐亚军位置
    var cg2 = runnerUpBase.addComponent(cc.Graphics);
    cg2.fillColor = new cc.Color(120, 130, 150, 200);
    cg2.roundRect(-65, -25, 130, 50, 8);
    cg2.fill();
    cg2.strokeColor = new cc.Color(160, 170, 190);
    cg2.lineWidth = 2;
    cg2.roundRect(-65, -25, 130, 50, 8);
    cg2.stroke();
    runnerUpBase.parent = parentNode;

    // 季军台（最低）
    var thirdBase = new cc.Node("ThirdBase");
    thirdBase.setPosition(spacingX, y - 30); // 对齐季军位置
    var cg3 = thirdBase.addComponent(cc.Graphics);
    cg3.fillColor = new cc.Color(150, 110, 90, 200);
    cg3.roundRect(-65, -25, 130, 50, 8);
    cg3.fill();
    cg3.strokeColor = new cc.Color(180, 140, 110);
    cg3.lineWidth = 2;
    cg3.roundRect(-65, -25, 130, 50, 8);
    cg3.stroke();
    thirdBase.parent = parentNode;
  },
  /**
   * 🔧【修复】创建我的排名区域
   * 修复：调整位置、居中对齐、增大容器尺寸
   */
  _createMyRankArea: function _createMyRankArea(parentNode) {
    var container = new cc.Node("MyRankContainer");
    container.setPosition(0, -200); // 下移避免与领奖台重叠
    container.setContentSize(600, 60); // 增大容器尺寸

    // 背景框 - 更宽更清晰
    var bgNode = new cc.Node("Bg");
    var bgGraphics = bgNode.addComponent(cc.Graphics);
    bgGraphics.fillColor = new cc.Color(40, 50, 80, 230);
    bgGraphics.roundRect(-300, -30, 600, 60, 12);
    bgGraphics.fill();
    bgGraphics.strokeColor = new cc.Color(100, 120, 160);
    bgGraphics.lineWidth = 2;
    bgGraphics.roundRect(-300, -30, 600, 60, 12);
    bgGraphics.stroke();
    bgNode.parent = container;

    // 我的排名标签 - 居中对齐
    var myRankNode = new cc.Node("MyRankLabel");
    myRankNode.setPosition(-140, 0); // 左侧位置
    myRankNode.setContentSize(200, 40);
    var myRankLabel = myRankNode.addComponent(cc.Label);
    myRankLabel.string = "我的排名：第--名";
    myRankLabel.fontSize = 22;
    myRankLabel.lineHeight = 28;
    myRankLabel.horizontalAlign = cc.Label.HorizontalAlign.CENTER;
    myRankLabel.verticalAlign = cc.Label.VerticalAlign.CENTER;
    myRankNode.color = new cc.Color(100, 200, 255);
    myRankNode.parent = container;
    this.myRankLabel = myRankLabel;

    // 分隔符
    var separatorNode = new cc.Node("Separator");
    separatorNode.setPosition(0, 0);
    var sepLabel = separatorNode.addComponent(cc.Label);
    sepLabel.string = "|";
    sepLabel.fontSize = 24;
    sepLabel.lineHeight = 28;
    separatorNode.color = new cc.Color(150, 150, 180);
    separatorNode.parent = container;

    // 金币标签
    var myCoinNode = new cc.Node("MyCoinLabel");
    myCoinNode.setPosition(150, 0); // 右侧位置
    myCoinNode.setContentSize(200, 40);
    var myCoinLabel = myCoinNode.addComponent(cc.Label);
    myCoinLabel.string = "比赛金币：0";
    myCoinLabel.fontSize = 22;
    myCoinLabel.lineHeight = 28;
    myCoinLabel.horizontalAlign = cc.Label.HorizontalAlign.CENTER;
    myCoinLabel.verticalAlign = cc.Label.VerticalAlign.CENTER;
    myCoinNode.color = new cc.Color(255, 200, 100);
    myCoinNode.parent = container;
    this.myCoinLabel = myCoinLabel;
    container.parent = parentNode;
  },
  /**
   * 🔧【修复】创建确认按钮
   * 修复：调整位置，确保不与状态栏重叠，增加按钮样式
   */
  _createConfirmButton: function _createConfirmButton(parentNode) {
    var btnNode = new cc.Node("ConfirmBtn");
    btnNode.setPosition(0, -270); // 下移确保与状态栏有足够间距
    btnNode.setContentSize(200, 55);

    // 按钮背景 - 更醒目的样式
    var btnBg = btnNode.addComponent(cc.Graphics);
    btnBg.fillColor = new cc.Color(80, 160, 80); // 绿色按钮
    btnBg.roundRect(-100, -27.5, 200, 55, 12);
    btnBg.fill();
    btnBg.strokeColor = new cc.Color(120, 200, 120);
    btnBg.lineWidth = 3;
    btnBg.roundRect(-100, -27.5, 200, 55, 12);
    btnBg.stroke();

    // 按钮文字
    var btnLabelNode = new cc.Node("Label");
    var btnLabel = btnLabelNode.addComponent(cc.Label);
    btnLabel.string = "确 定";
    btnLabel.fontSize = 26;
    btnLabel.lineHeight = 32;
    btnLabel.horizontalAlign = cc.Label.HorizontalAlign.CENTER;
    btnLabelNode.color = new cc.Color(255, 255, 255);
    var btnOutline = btnLabelNode.addComponent(cc.LabelOutline);
    btnOutline.color = new cc.Color(30, 80, 30);
    btnOutline.width = 2;
    btnLabelNode.parent = btnNode;

    // 添加按钮组件
    var btn = btnNode.addComponent(cc.Button);
    btnNode.on('click', this.onConfirmClick, this);
    btnNode.parent = parentNode;
    this.confirmBtn = btn;
  },
  // ============================================================
  // 公共方法
  // ============================================================

  /**
   * 设置数据
   * @param {Object} data - { period_no, total_players, top3, top20, my_rank, my_match_coin }
   */
  setData: function setData(data) {
    console.log("🏆 [TournamentFinalRankDialog] 收到数据:", JSON.stringify(data));
    this._data = data;
    this._periodNo = data.period_no || "";
    this._totalPlayers = data.total_players || 0;
    this._top3 = data.top3 || [];
    this._top20 = data.top20 || [];
    this._myRank = data.my_rank || 0;
    this._myMatchCoin = data.my_match_coin || 0;

    // 🔧【调试】打印TOP3数据
    console.log("🏆 [TournamentFinalRankDialog] TOP3数据:");
    for (var i = 0; i < this._top3.length; i++) {
      console.log("  #" + (i + 1) + ":", this._top3[i].player_name, "金币:", this._top3[i].match_coin, "机器人:", this._top3[i].is_robot);
    }
    this._updateUI();
  },
  // ============================================================
  // UI更新
  // ============================================================

  _updateUI: function _updateUI() {
    // 更新期号
    if (this.periodNoLabel) {
      this.periodNoLabel.string = "第" + this._periodNo + "期赛事结束";
    }

    // 更新总参赛人数
    if (this.totalPlayersLabel) {
      this.totalPlayersLabel.string = "共" + this._totalPlayers + "人参赛";
    }

    // 更新前三名
    this._updateTop3();

    // 更新我的排名
    if (this.myRankLabel) {
      if (this._myRank > 0) {
        this.myRankLabel.string = "我的排名：第" + this._myRank + "名";
      } else {
        this.myRankLabel.string = "我的排名：未上榜";
      }
    }

    // 更新我的金币
    if (this.myCoinLabel) {
      this.myCoinLabel.string = "比赛金币：" + this._myMatchCoin;
    }
  },
  _updateTop3: function _updateTop3() {
    // 更新冠军
    if (this._top3.length >= 1 && this.championNode) {
      this._updatePodiumNode(this.championNode, this._top3[0], 1);
    }

    // 更新亚军
    if (this._top3.length >= 2 && this.runnerUpNode) {
      this._updatePodiumNode(this.runnerUpNode, this._top3[1], 2);
    }

    // 更新季军
    if (this._top3.length >= 3 && this.thirdPlaceNode) {
      this._updatePodiumNode(this.thirdPlaceNode, this._top3[2], 3);
    }
  },
  /**
   * 更新领奖台节点
   * @param {cc.Node} node - 领奖台节点
   * @param {Object} data - 玩家数据 { player_name, match_coin, avatar, is_robot, player_id }
   * @param {number} rank - 排名
   */
  _updatePodiumNode: function _updatePodiumNode(node, data, rank) {
    // 名次标签
    var rankLabel = node.getChildByName("RankLabel");
    if (rankLabel) {
      var label = rankLabel.getComponent(cc.Label);
      if (label) {
        label.string = this._getRankText(rank);
      }
    }

    // 🔧【修复】处理机器人昵称显示
    var displayName = data.player_name || "玩家";
    if (data.is_robot) {
      displayName = this._getRobotDisplayName(data.player_id, data.player_name);
    }

    // 昵称标签
    var nameLabel = node.getChildByName("NameLabel");
    if (nameLabel) {
      var label = nameLabel.getComponent(cc.Label);
      if (label) {
        label.string = displayName;
      }
    }

    // 金币标签
    var coinLabel = node.getChildByName("CoinLabel");
    if (coinLabel) {
      var label = coinLabel.getComponent(cc.Label);
      if (label) {
        label.string = this._formatCoin(data.match_coin || 0) + "金币";
      }
    }

    // 🔧【新增】加载头像
    var avatarContainer = node.getChildByName("AvatarContainer");
    if (avatarContainer) {
      var avatarSpriteNode = avatarContainer.getChildByName("AvatarSprite");
      if (avatarSpriteNode) {
        var avatarSprite = avatarSpriteNode.getComponent(cc.Sprite);
        if (avatarSprite) {
          this._loadAvatar(avatarSprite, data.avatar, data.is_robot);
        }
      }
    }
    console.log("🏆 [_updatePodiumNode] 排名#" + rank + ": " + displayName + ", 金币=" + data.match_coin + ", 机器人=" + data.is_robot);
  },
  /**
   * 🔧【新增】加载头像
   */
  _loadAvatar: function _loadAvatar(sprite, avatarUrl, isRobot) {
    if (!sprite) return;

    // 机器人使用默认头像
    if (isRobot) {
      var robotAvatarIndex = Math.floor(Math.random() * 3) + 1;
      var defaultPath = "UI/headimage/avatar_" + robotAvatarIndex;
      cc.resources.load(defaultPath, cc.SpriteFrame, function (err, spriteFrame) {
        if (!err && spriteFrame) {
          sprite.spriteFrame = spriteFrame;
        }
      });
      return;
    }

    // 空值处理
    if (!avatarUrl || avatarUrl === "") {
      cc.resources.load("UI/headimage/avatar_1", cc.SpriteFrame, function (err, spriteFrame) {
        if (!err && spriteFrame) {
          sprite.spriteFrame = spriteFrame;
        }
      });
      return;
    }

    // 远程URL
    if (avatarUrl.indexOf("http") === 0 || avatarUrl.indexOf("//") === 0) {
      cc.assetManager.loadRemote(avatarUrl, {
        ext: '.png'
      }, function (err, texture) {
        if (err || !texture) {
          cc.resources.load("UI/headimage/avatar_1", cc.SpriteFrame, function (err2, fallbackSprite) {
            if (!err2 && fallbackSprite) {
              sprite.spriteFrame = fallbackSprite;
            }
          });
          return;
        }
        var spriteFrame = new cc.SpriteFrame(texture);
        sprite.spriteFrame = spriteFrame;
      });
    } else {
      // 本地资源
      var localPath = "UI/headimage/" + avatarUrl;
      cc.resources.load(localPath, cc.SpriteFrame, function (err, spriteFrame) {
        if (err || !spriteFrame) {
          cc.resources.load("UI/headimage/avatar_1", cc.SpriteFrame, function (err2, fallbackSprite) {
            if (!err2 && fallbackSprite) {
              sprite.spriteFrame = fallbackSprite;
            }
          });
          return;
        }
        sprite.spriteFrame = spriteFrame;
      });
    }
  },
  /**
   * 🔧【新增】格式化金币显示
   */
  _formatCoin: function _formatCoin(coin) {
    if (coin >= 10000) {
      return (coin / 10000).toFixed(1) + "万";
    }
    return coin.toString();
  },
  // ============================================================
  // 动画效果
  // ============================================================

  _startChampionEffects: function _startChampionEffects() {
    // 奖杯弹跳动画
    if (this.trophyNode) {
      var jumpUp = cc.moveBy(0.5, cc.v2(0, 10));
      var jumpDown = cc.moveBy(0.5, cc.v2(0, -10));
      var sequence = cc.sequence(jumpUp, jumpDown);
      var repeat = cc.repeatForever(sequence);
      this.trophyNode.runAction(repeat);
    }

    // 发光效果闪烁
    if (this.championGlowNode) {
      var fadeIn = cc.fadeIn(0.5);
      var fadeOut = cc.fadeOut(0.5);
      var sequence = cc.sequence(fadeIn, fadeOut);
      var repeat = cc.repeatForever(sequence);
      this.championGlowNode.runAction(repeat);
    }

    // 冠军节点缩放呼吸效果
    if (this.championNode) {
      var scaleUp = cc.scaleTo(0.8, 1.05);
      var scaleDown = cc.scaleTo(0.8, 1.0);
      var sequence = cc.sequence(scaleUp, scaleDown);
      var repeat = cc.repeatForever(sequence);
      this.championNode.runAction(repeat);
    }
  },
  _stopChampionEffects: function _stopChampionEffects() {
    if (this.trophyNode) {
      this.trophyNode.stopAllActions();
    }
    if (this.championGlowNode) {
      this.championGlowNode.stopAllActions();
    }
    if (this.championNode) {
      this.championNode.stopAllActions();
    }
  },
  // ============================================================
  // 按钮事件
  // ============================================================

  onConfirmClick: function onConfirmClick() {
    console.log("🏆 [TournamentFinalRank] 点击确认，返回大厅");

    // 停止动画
    this._stopChampionEffects();

    // 关闭弹窗
    this.node.destroy();

    // 返回大厅
    cc.director.loadScene("hallScene");
  },
  // ============================================================
  // 辅助方法
  // ============================================================

  _getRankText: function _getRankText(rank) {
    switch (rank) {
      case 1:
        return "🥇 冠军";
      case 2:
        return "🥈 亚军";
      case 3:
        return "🥉 季军";
      default:
        return "第" + rank + "名";
    }
  },
  /**
   * 🔧【新增】获取机器人显示名称
   * @param {String} playerId - 玩家ID
   * @param {String} originalName - 原始昵称
   * @returns {String} 显示名称
   */
  _getRobotDisplayName: function _getRobotDisplayName(playerId, originalName) {
    // 如果原始名称已经是"智能陪练X号"格式，直接返回
    if (originalName && originalName.indexOf("智能陪练") === 0) {
      return originalName;
    }

    // 否则，生成"智能陪练X号"格式的名称
    var robotIndex = 1;
    if (playerId) {
      var lastChar = playerId.toString().slice(-1);
      robotIndex = parseInt(lastChar) || 1;
    }
    return "智能陪练" + robotIndex + "号";
  }
});

cc._RF.pop();
                    }
                    if (nodeEnv) {
                        __define(__module.exports, __require, __module);
                    }
                    else {
                        __quick_compile_project__.registerModuleFunc(__filename, function () {
                            __define(__module.exports, __require, __module);
                        });
                    }
                })();
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImFzc2V0c1xcc2NyaXB0c1xcZGR6XFx0b3VybmFtZW50XFxUb3VybmFtZW50RmluYWxSYW5rRGlhbG9nLmpzIl0sIm5hbWVzIjpbImNjIiwiQ2xhc3MiLCJDb21wb25lbnQiLCJwcm9wZXJ0aWVzIiwicGVyaW9kTm9MYWJlbCIsInR5cGUiLCJMYWJlbCIsInRvdGFsUGxheWVyc0xhYmVsIiwiY2hhbXBpb25Ob2RlIiwiTm9kZSIsInJ1bm5lclVwTm9kZSIsInRoaXJkUGxhY2VOb2RlIiwidG9wMjBTY3JvbGxWaWV3IiwiU2Nyb2xsVmlldyIsInJhbmtJdGVtUHJlZmFiIiwiUHJlZmFiIiwibXlSYW5rTGFiZWwiLCJteUNvaW5MYWJlbCIsImNvbmZpcm1CdG4iLCJCdXR0b24iLCJ0cm9waHlOb2RlIiwiY2hhbXBpb25HbG93Tm9kZSIsIm9uTG9hZCIsIl9kYXRhIiwiX3RvcDMiLCJfdG9wMjAiLCJfbXlSYW5rIiwiX215TWF0Y2hDb2luIiwiX2NoZWNrQW5kQ3JlYXRlRHluYW1pY1VJIiwibm9kZSIsIm9uIiwib25Db25maXJtQ2xpY2siLCJzdGFydCIsIl9zdGFydENoYW1waW9uRWZmZWN0cyIsImNvbnNvbGUiLCJsb2ciLCJfY3JlYXRlRHluYW1pY1VJIiwiY2FudmFzIiwiZmluZCIsImVycm9yIiwic2NyZWVuV2lkdGgiLCJzY3JlZW5IZWlnaHQiLCJzZXRDb250ZW50U2l6ZSIsInNldFBvc2l0aW9uIiwiYmdOb2RlIiwiYmdHcmFwaGljcyIsImFkZENvbXBvbmVudCIsIkdyYXBoaWNzIiwiZmlsbENvbG9yIiwiQ29sb3IiLCJyZWN0IiwiZmlsbCIsInBhcmVudCIsImRpYWxvZ05vZGUiLCJkaWFsb2dCZyIsImRpYWxvZ0JnR3JhcGhpY3MiLCJyb3VuZFJlY3QiLCJzdHJva2VDb2xvciIsImxpbmVXaWR0aCIsInN0cm9rZSIsInRpdGxlTm9kZSIsInRpdGxlTGFiZWwiLCJzdHJpbmciLCJmb250U2l6ZSIsImxpbmVIZWlnaHQiLCJob3Jpem9udGFsQWxpZ24iLCJIb3Jpem9udGFsQWxpZ24iLCJDRU5URVIiLCJjb2xvciIsInRpdGxlT3V0bGluZSIsIkxhYmVsT3V0bGluZSIsIndpZHRoIiwiX3BlcmlvZE5vTm9kZSIsInBlcmlvZExhYmVsIiwiX3RvdGFsUGxheWVyc05vZGUiLCJ0b3RhbExhYmVsIiwiX2NyZWF0ZVRvcDNQb2RpdW0iLCJfY3JlYXRlTXlSYW5rQXJlYSIsIl9jcmVhdGVDb25maXJtQnV0dG9uIiwicGFyZW50Tm9kZSIsInBvZGl1bVkiLCJzcGFjaW5nWCIsIl9jcmVhdGVQb2RpdW1JdGVtIiwicG9kaXVtQmFzZVkiLCJfY3JlYXRlUG9kaXVtQmFzZSIsInJhbmsiLCJ4IiwieSIsInNjYWxlIiwibGF5b3V0Q29uZmlnIiwicmFua1kiLCJhdmF0YXJZIiwibmFtZVkiLCJjb2luWSIsInJhbmtMYWJlbE5vZGUiLCJyYW5rTGFiZWwiLCJfZ2V0UmFua1RleHQiLCJyYW5rT3V0bGluZSIsImF2YXRhclNpemUiLCJhdmF0YXJSYWRpdXMiLCJhdmF0YXJDb250YWluZXIiLCJhdmF0YXJCZyIsImF2YXRhckJnR3JhcGhpY3MiLCJjaXJjbGUiLCJhdmF0YXJTcHJpdGVOb2RlIiwiYXZhdGFyU3ByaXRlIiwiU3ByaXRlIiwic2l6ZU1vZGUiLCJTaXplTW9kZSIsIkNVU1RPTSIsIm5hbWVMYWJlbE5vZGUiLCJuYW1lTGFiZWwiLCJvdmVyZmxvdyIsIk92ZXJmbG93IiwiQ0xBTVAiLCJuYW1lT3V0bGluZSIsImNvaW5MYWJlbE5vZGUiLCJjb2luTGFiZWwiLCJjb2luT3V0bGluZSIsImNoYW1waW9uQmFzZSIsImNnMSIsInJ1bm5lclVwQmFzZSIsImNnMiIsInRoaXJkQmFzZSIsImNnMyIsImNvbnRhaW5lciIsIm15UmFua05vZGUiLCJ2ZXJ0aWNhbEFsaWduIiwiVmVydGljYWxBbGlnbiIsInNlcGFyYXRvck5vZGUiLCJzZXBMYWJlbCIsIm15Q29pbk5vZGUiLCJidG5Ob2RlIiwiYnRuQmciLCJidG5MYWJlbE5vZGUiLCJidG5MYWJlbCIsImJ0bk91dGxpbmUiLCJidG4iLCJzZXREYXRhIiwiZGF0YSIsIkpTT04iLCJzdHJpbmdpZnkiLCJfcGVyaW9kTm8iLCJwZXJpb2Rfbm8iLCJfdG90YWxQbGF5ZXJzIiwidG90YWxfcGxheWVycyIsInRvcDMiLCJ0b3AyMCIsIm15X3JhbmsiLCJteV9tYXRjaF9jb2luIiwiaSIsImxlbmd0aCIsInBsYXllcl9uYW1lIiwibWF0Y2hfY29pbiIsImlzX3JvYm90IiwiX3VwZGF0ZVVJIiwiX3VwZGF0ZVRvcDMiLCJfdXBkYXRlUG9kaXVtTm9kZSIsImdldENoaWxkQnlOYW1lIiwibGFiZWwiLCJnZXRDb21wb25lbnQiLCJkaXNwbGF5TmFtZSIsIl9nZXRSb2JvdERpc3BsYXlOYW1lIiwicGxheWVyX2lkIiwiX2Zvcm1hdENvaW4iLCJfbG9hZEF2YXRhciIsImF2YXRhciIsInNwcml0ZSIsImF2YXRhclVybCIsImlzUm9ib3QiLCJyb2JvdEF2YXRhckluZGV4IiwiTWF0aCIsImZsb29yIiwicmFuZG9tIiwiZGVmYXVsdFBhdGgiLCJyZXNvdXJjZXMiLCJsb2FkIiwiU3ByaXRlRnJhbWUiLCJlcnIiLCJzcHJpdGVGcmFtZSIsImluZGV4T2YiLCJhc3NldE1hbmFnZXIiLCJsb2FkUmVtb3RlIiwiZXh0IiwidGV4dHVyZSIsImVycjIiLCJmYWxsYmFja1Nwcml0ZSIsImxvY2FsUGF0aCIsImNvaW4iLCJ0b0ZpeGVkIiwidG9TdHJpbmciLCJqdW1wVXAiLCJtb3ZlQnkiLCJ2MiIsImp1bXBEb3duIiwic2VxdWVuY2UiLCJyZXBlYXQiLCJyZXBlYXRGb3JldmVyIiwicnVuQWN0aW9uIiwiZmFkZUluIiwiZmFkZU91dCIsInNjYWxlVXAiLCJzY2FsZVRvIiwic2NhbGVEb3duIiwiX3N0b3BDaGFtcGlvbkVmZmVjdHMiLCJzdG9wQWxsQWN0aW9ucyIsImRlc3Ryb3kiLCJkaXJlY3RvciIsImxvYWRTY2VuZSIsInBsYXllcklkIiwib3JpZ2luYWxOYW1lIiwicm9ib3RJbmRleCIsImxhc3RDaGFyIiwic2xpY2UiLCJwYXJzZUlu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O01BQ2xCLEtBQUssQ0FBQztRQUNGLE9BQU8sT0FBTztNQUNsQixLQUFLLENBQUM7UUFDRixPQUFPLE9BQU87TUFDbEI7UUFDSSxPQUFPLEdBQUcsR0FBR0EsSUFBSSxHQUFHLEdBQUc7SUFBQTtFQUVuQyxDQUFDO0VBRUQ7QUFDSjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0VBQ0k2RSxvQkFBb0IsRUFBRSxTQUFBQSxxQkFBUytDLFFBQVEsRUFBRUMsWUFBWSxFQUFFO0lBQ25EO0lBQ0EsSUFBSUEsWUFBWSxJQUFJQSxZQUFZLENBQUM5QixPQUFPLENBQUMsTUFBTSxDQUFDLEtBQUssQ0FBQyxFQUFFO01BQ3BELE9BQU84QixZQUFZO0lBQ3ZCOztJQUVBO0lBQ0EsSUFBSUMsVUFBVSxHQUFHLENBQUM7SUFDbEIsSUFBSUYsUUFBUSxFQUFFO01BQ1YsSUFBSUcsUUFBUSxHQUFHSCxRQUFRLENBQUNuQixRQUFRLEVBQUUsQ0FBQ3VCLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQztNQUM1Q0YsVUFBVSxHQUFHRyxRQUFRLENBQUNGLFFBQVEsQ0FBQyxJQUFJLENBQUM7SUFDeEM7SUFFQSxPQUFPLE1BQU0sR0FBR0QsVUFBVSxHQUFHLEdBQUc7RUFDcEM7QUFDSixDQUFDLENBQUMiLCJzb3VyY2VSb290IjoiLyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogVG91cm5hbWVudEZpbmFsUmFua0RpYWxvZyAtIOernuaKgOWcuuWGs+i1m+WGoOWGm+aOkuihjOamnOW8ueeql1xuICogXG4gKiDlip/og73vvJpcbiAqIDEuIOaYvuekuuacn+WPt+WSjOavlOi1m+e7k+adn+agh+mimFxuICogMi4g5YmN5LiJ5ZCN6aKG5aWW5Y+w5bGV56S677yI5Yag5Yab5pyA5aSn77yM5bGF5Lit6auY5Lqu77yJXG4gKiAzLiBUT1AyMCBTY3JvbGxWaWV35YiX6KGoXG4gKiA0LiDmmL7npLrmjpLlkI3jgIHlpLTlg4/jgIHmmLXnp7DjgIHmnIDnu4jph5HluIFcbiAqIDUuIOehruiupOaMiemSrui/lOWbnuWkp+WOhVxuICogXG4gKiDorr7orqHpo47moLzvvJrkuK3lm73po47mlpflnLDkuLvnq57mioDlnLogLSDph5HoibIgKyDnuqLoibJcbiAqIOWGoOWGm+eJueaViO+8muWPkeWFieOAgeeykuWtkOOAgeWlluadr+WKqOeUu1xuICogXG4gKiDwn5Sn44CQ5L+u5aSN44CR5LyY5YyW5biD5bGA77ya5L+u5aSN5ZCN5qyh44CB5aS05YOP44CB55So5oi35ZCN5oyk5Zyo5LiA6LW355qE6Zeu6aKYXG4gKi9cblxuY2MuQ2xhc3Moe1xuICAgIGV4dGVuZHM6IGNjLkNvbXBvbmVudCxcblxuICAgIHByb3BlcnRpZXM6IHtcbiAgICAgICAgLy8g5pyf5Y+35qCH562+XG4gICAgICAgIHBlcmlvZE5vTGFiZWw6IHtcbiAgICAgICAgICAgIHR5cGU6IGNjLkxhYmVsLFxuICAgICAgICAgICAgZGVmYXVsdDogbnVsbFxuICAgICAgICB9LFxuICAgICAgICAvLyDmgLvlj4LotZvkurrmlbDmoIfnrb5cbiAgICAgICAgdG90YWxQbGF5ZXJzTGFiZWw6IHtcbiAgICAgICAgICAgIHR5cGU6IGNjLkxhYmVsLFxuICAgICAgICAgICAgZGVmYXVsdDogbnVsbFxuICAgICAgICB9LFxuICAgICAgICAvLyDlhqDlhpvoioLngrlcbiAgICAgICAgY2hhbXBpb25Ob2RlOiB7XG4gICAgICAgICAgICB0eXBlOiBjYy5Ob2RlLFxuICAgICAgICAgICAgZGVmYXVsdDogbnVsbFxuICAgICAgICB9LFxuICAgICAgICAvLyDkuprlhpvoioLngrlcbiAgICAgICAgcnVubmVyVXBOb2RlOiB7XG4gICAgICAgICAgICB0eXBlOiBjYy5Ob2RlLFxuICAgICAgICAgICAgZGVmYXVsdDogbnVsbFxuICAgICAgICB9LFxuICAgICAgICAvLyDlraPlhpvoioLngrlcbiAgICAgICAgdGhpcmRQbGFjZU5vZGU6IHtcbiAgICAgICAgICAgIHR5cGU6IGNjLk5vZGUsXG4gICAgICAgICAgICBkZWZhdWx0OiBudWxsXG4gICAgICAgIH0sXG4gICAgICAgIC8vIFRPUDIwIFNjcm9sbFZpZXdcbiAgICAgICAgdG9wMjBTY3JvbGxWaWV3OiB7XG4gICAgICAgICAgICB0eXBlOiBjYy5TY3JvbGxWaWV3LFxuICAgICAgICAgICAgZGVmYXVsdDogbnVsbFxuICAgICAgICB9LFxuICAgICAgICAvLyDmjpLooYzmppxpdGVt5qih5p2/XG4gICAgICAgIHJhbmtJdGVtUHJlZmFiOiB7XG4gICAgICAgICAgICB0eXBlOiBjYy5QcmVmYWIsXG4gICAgICAgICAgICBkZWZhdWx0OiBudWxsXG4gICAgICAgIH0sXG4gICAgICAgIC8vIOaIkeeahOaOkuWQjeagh+etvlxuICAgICAgICBteVJhbmtMYWJlbDoge1xuICAgICAgICAgICAgdHlwZTogY2MuTGFiZWwsXG4gICAgICAgICAgICBkZWZhdWx0OiBudWxsXG4gICAgICAgIH0sXG4gICAgICAgIC8vIOaIkeeahOmHkeW4geagh+etvlxuICAgICAgICBteUNvaW5MYWJlbDoge1xuICAgICAgICAgICAgdHlwZTogY2MuTGFiZWwsXG4gICAgICAgICAgICBkZWZhdWx0OiBudWxsXG4gICAgICAgIH0sXG4gICAgICAgIC8vIOehruiupOaMiemSrlxuICAgICAgICBjb25maXJtQnRuOiB7XG4gICAgICAgICAgICB0eXBlOiBjYy5CdXR0b24sXG4gICAgICAgICAgICBkZWZhdWx0OiBudWxsXG4gICAgICAgIH0sXG4gICAgICAgIC8vIOWGoOWGm+Wlluadr+iKgueCuVxuICAgICAgICB0cm9waHlOb2RlOiB7XG4gICAgICAgICAgICB0eXBlOiBjYy5Ob2RlLFxuICAgICAgICAgICAgZGVmYXVsdDogbnVsbFxuICAgICAgICB9LFxuICAgICAgICAvLyDlhqDlhpvlj5HlhYnmlYjmnpzoioLngrlcbiAgICAgICAgY2hhbXBpb25HbG93Tm9kZToge1xuICAgICAgICAgICAgdHlwZTogY2MuTm9kZSxcbiAgICAgICAgICAgIGRlZmF1bHQ6IG51bGxcbiAgICAgICAgfVxuICAgIH0sXG5cbiAgICAvLyBMSUZFLUNZQ0xFIENBTExCQUNLUzpcblxuICAgIG9uTG9hZCAoKSB7XG4gICAgICAgIC8vIOWIneWni+WMluaVsOaNrlxuICAgICAgICB0aGlzLl9kYXRhID0gbnVsbFxuICAgICAgICB0aGlzLl90b3AzID0gW11cbiAgICAgICAgdGhpcy5fdG9wMjAgPSBbXVxuICAgICAgICB0aGlzLl9teVJhbmsgPSAwXG4gICAgICAgIHRoaXMuX215TWF0Y2hDb2luID0gMFxuXG4gICAgICAgIC8vIPCflKfjgJDmlrDlop7jgJHmo4Dmn6XmmK/lkKbpnIDopoHliqjmgIHliJvlu7pVSe+8iHByZWZhYuS4jeWtmOWcqOaXtu+8iVxuICAgICAgICB0aGlzLl9jaGVja0FuZENyZWF0ZUR5bmFtaWNVSSgpXG5cbiAgICAgICAgLy8g5rOo5YaM5oyJ6ZKu5LqL5Lu2XG4gICAgICAgIGlmICh0aGlzLmNvbmZpcm1CdG4pIHtcbiAgICAgICAgICAgIHRoaXMuY29uZmlybUJ0bi5ub2RlLm9uKCdjbGljaycsIHRoaXMub25Db25maXJtQ2xpY2ssIHRoaXMpXG4gICAgICAgIH1cbiAgICB9LFxuXG4gICAgc3RhcnQgKCkge1xuICAgICAgICAvLyDlkK/liqjlhqDlhpvnibnmlYjliqjnlLtcbiAgICAgICAgdGhpcy5fc3RhcnRDaGFtcGlvbkVmZmVjdHMoKVxuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiDwn5Sn44CQ5paw5aKe44CR5qOA5p+l5bm25Yqo5oCB5Yib5bu6VUnvvIhwcmVmYWLkuI3lrZjlnKjml7bvvIlcbiAgICAgKi9cbiAgICBfY2hlY2tBbmRDcmVhdGVEeW5hbWljVUk6IGZ1bmN0aW9uKCkge1xuICAgICAgICAvLyDlpoLmnpzlhbPplK7oioLngrnkuI3lrZjlnKjvvIzor7TmmI5wcmVmYWLmnKrmraPnoa7liqDovb3vvIzpnIDopoHliqjmgIHliJvlu7pVSVxuICAgICAgICBpZiAoIXRoaXMuY2hhbXBpb25Ob2RlIHx8ICF0aGlzLnJ1bm5lclVwTm9kZSB8fCAhdGhpcy50aGlyZFBsYWNlTm9kZSkge1xuICAgICAgICAgICAgY29uc29sZS5sb2coXCLwn4+GIFtUb3VybmFtZW50RmluYWxSYW5rRGlhbG9nXSDmo4DmtYvliLBwcmVmYWLmnKrliqDovb3vvIzliqjmgIHliJvlu7pVSVwiKVxuICAgICAgICAgICAgdGhpcy5fY3JlYXRlRHluYW1pY1VJKClcbiAgICAgICAgfVxuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiDwn5Sn44CQ5paw5aKe44CR5Yqo5oCB5Yib5bu65a6M5pW055qE5by556qXVUlcbiAgICAgKi9cbiAgICBfY3JlYXRlRHluYW1pY1VJOiBmdW5jdGlvbigpIHtcbiAgICAgICAgdmFyIGNhbnZhcyA9IGNjLmZpbmQoJ0NhbnZhcycpXG4gICAgICAgIGlmICghY2FudmFzKSB7XG4gICAgICAgICAgICBjb25zb2xlLmVycm9yKFwi5om+5LiN5YiwQ2FudmFz6IqC54K5XCIpXG4gICAgICAgICAgICByZXR1cm5cbiAgICAgICAgfVxuXG4gICAgICAgIHZhciBzY3JlZW5XaWR0aCA9IDEyODBcbiAgICAgICAgdmFyIHNjcmVlbkhlaWdodCA9IDcyMFxuXG4gICAgICAgIC8vIOiuvue9ruW9k+WJjeiKgueCueS4uuWFqOWxj+mBrue9qVxuICAgICAgICB0aGlzLm5vZGUuc2V0Q29udGVudFNpemUoc2NyZWVuV2lkdGgsIHNjcmVlbkhlaWdodClcbiAgICAgICAgdGhpcy5ub2RlLnNldFBvc2l0aW9uKDAsIDApXG4gICAgICAgIFxuICAgICAgICAvLyDmt7vliqDljYrpgI/mmI7og4zmma9cbiAgICAgICAgdmFyIGJnTm9kZSA9IG5ldyBjYy5Ob2RlKFwiQmFja2dyb3VuZFwiKVxuICAgICAgICBiZ05vZGUuc2V0Q29udGVudFNpemUoc2NyZWVuV2lkdGgsIHNjcmVlbkhlaWdodClcbiAgICAgICAgdmFyIGJnR3JhcGhpY3MgPSBiZ05vZGUuYWRkQ29tcG9uZW50KGNjLkdyYXBoaWNzKVxuICAgICAgICBiZ0dyYXBoaWNzLmZpbGxDb2xvciA9IG5ldyBjYy5Db2xvcigwLCAwLCAwLCAxODApXG4gICAgICAgIGJnR3JhcGhpY3MucmVjdCgtc2NyZWVuV2lkdGgvMiwgLXNjcmVlbkhlaWdodC8yLCBzY3JlZW5XaWR0aCwgc2NyZWVuSGVpZ2h0KVxuICAgICAgICBiZ0dyYXBoaWNzLmZpbGwoKVxuICAgICAgICBiZ05vZGUucGFyZW50ID0gdGhpcy5ub2RlXG5cbiAgICAgICAgLy8g5Li75by556qX5a655ZmoIC0g5aKe5aSn5bC65a+45Lul5a6557qz5omA5pyJ5YWD57SgXG4gICAgICAgIHZhciBkaWFsb2dOb2RlID0gbmV3IGNjLk5vZGUoXCJEaWFsb2dDb250YWluZXJcIilcbiAgICAgICAgZGlhbG9nTm9kZS5zZXRDb250ZW50U2l6ZSgxMDAwLCA2NTApXG4gICAgICAgIGRpYWxvZ05vZGUuc2V0UG9zaXRpb24oMCwgMClcbiAgICAgICAgXG4gICAgICAgIC8vIOW8ueeql+iDjOaZr1xuICAgICAgICB2YXIgZGlhbG9nQmcgPSBuZXcgY2MuTm9kZShcIkRpYWxvZ0JnXCIpXG4gICAgICAgIHZhciBkaWFsb2dCZ0dyYXBoaWNzID0gZGlhbG9nQmcuYWRkQ29tcG9uZW50KGNjLkdyYXBoaWNzKVxuICAgICAgICBkaWFsb2dCZ0dyYXBoaWNzLmZpbGxDb2xvciA9IG5ldyBjYy5Db2xvcigyNSwgMzUsIDYwLCAyNTApXG4gICAgICAgIGRpYWxvZ0JnR3JhcGhpY3Mucm91bmRSZWN0KC01MDAsIC0zMjUsIDEwMDAsIDY1MCwgMjUpXG4gICAgICAgIGRpYWxvZ0JnR3JhcGhpY3MuZmlsbCgpXG4gICAgICAgIGRpYWxvZ0JnR3JhcGhpY3Muc3Ryb2tlQ29sb3IgPSBuZXcgY2MuQ29sb3IoMTgwLCAxNDAsIDYwKVxuICAgICAgICBkaWFsb2dCZ0dyYXBoaWNzLmxpbmVXaWR0aCA9IDRcbiAgICAgICAgZGlhbG9nQmdHcmFwaGljcy5yb3VuZFJlY3QoLTUwMCwgLTMyNSwgMTAwMCwgNjUwLCAyNSlcbiAgICAgICAgZGlhbG9nQmdHcmFwaGljcy5zdHJva2UoKVxuICAgICAgICBkaWFsb2dCZy5wYXJlbnQgPSBkaWFsb2dOb2RlXG4gICAgICAgIGRpYWxvZ05vZGUucGFyZW50ID0gdGhpcy5ub2RlXG5cbiAgICAgICAgLy8gPT09PT09PT09PSDmoIfpopjljLrln58gPT09PT09PT09PVxuICAgICAgICB2YXIgdGl0bGVOb2RlID0gbmV3IGNjLk5vZGUoXCJUaXRsZU5vZGVcIilcbiAgICAgICAgdGl0bGVOb2RlLnNldFBvc2l0aW9uKDAsIDI4MCkgIC8vIOS4iuenu1xuICAgICAgICBcbiAgICAgICAgdmFyIHRpdGxlTGFiZWwgPSB0aXRsZU5vZGUuYWRkQ29tcG9uZW50KGNjLkxhYmVsKVxuICAgICAgICB0aXRsZUxhYmVsLnN0cmluZyA9IFwi8J+PhiDmr5TotZvnu5PmnZ8g8J+PhlwiXG4gICAgICAgIHRpdGxlTGFiZWwuZm9udFNpemUgPSA0MFxuICAgICAgICB0aXRsZUxhYmVsLmxpbmVIZWlnaHQgPSA0OFxuICAgICAgICB0aXRsZUxhYmVsLmhvcml6b250YWxBbGlnbiA9IGNjLkxhYmVsLkhvcml6b250YWxBbGlnbi5DRU5URVJcbiAgICAgICAgdGl0bGVOb2RlLmNvbG9yID0gbmV3IGNjLkNvbG9yKDI1NSwgMjE1LCAwKVxuICAgICAgICBcbiAgICAgICAgdmFyIHRpdGxlT3V0bGluZSA9IHRpdGxlTm9kZS5hZGRDb21wb25lbnQoY2MuTGFiZWxPdXRsaW5lKVxuICAgICAgICB0aXRsZU91dGxpbmUuY29sb3IgPSBuZXcgY2MuQ29sb3IoMTAwLCA2MCwgMClcbiAgICAgICAgdGl0bGVPdXRsaW5lLndpZHRoID0gM1xuICAgICAgICB0aXRsZU5vZGUucGFyZW50ID0gZGlhbG9nTm9kZVxuXG4gICAgICAgIC8vID09PT09PT09PT0g5pyf5Y+35ZKM5Y+C6LWb5Lq65pWwID09PT09PT09PT1cbiAgICAgICAgdGhpcy5fcGVyaW9kTm9Ob2RlID0gbmV3IGNjLk5vZGUoXCJQZXJpb2ROb05vZGVcIilcbiAgICAgICAgdGhpcy5fcGVyaW9kTm9Ob2RlLnNldFBvc2l0aW9uKDAsIDIzMCkgIC8vIOS4iuenu1xuICAgICAgICB2YXIgcGVyaW9kTGFiZWwgPSB0aGlzLl9wZXJpb2ROb05vZGUuYWRkQ29tcG9uZW50KGNjLkxhYmVsKVxuICAgICAgICBwZXJpb2RMYWJlbC5zdHJpbmcgPSBcIuesrC0tLeacn+i1m+S6i+e7k+adn1wiXG4gICAgICAgIHBlcmlvZExhYmVsLmZvbnRTaXplID0gMjZcbiAgICAgICAgcGVyaW9kTGFiZWwubGluZUhlaWdodCA9IDMyXG4gICAgICAgIHRoaXMuX3BlcmlvZE5vTm9kZS5jb2xvciA9IG5ldyBjYy5Db2xvcigyMDAsIDIwMCwgMjIwKVxuICAgICAgICB0aGlzLl9wZXJpb2ROb05vZGUucGFyZW50ID0gZGlhbG9nTm9kZVxuICAgICAgICB0aGlzLnBlcmlvZE5vTGFiZWwgPSBwZXJpb2RMYWJlbFxuXG4gICAgICAgIHRoaXMuX3RvdGFsUGxheWVyc05vZGUgPSBuZXcgY2MuTm9kZShcIlRvdGFsUGxheWVyc05vZGVcIilcbiAgICAgICAgdGhpcy5fdG90YWxQbGF5ZXJzTm9kZS5zZXRQb3NpdGlvbigwLCAxOTUpICAvLyDkuIrnp7tcbiAgICAgICAgdmFyIHRvdGFsTGFiZWwgPSB0aGlzLl90b3RhbFBsYXllcnNOb2RlLmFkZENvbXBvbmVudChjYy5MYWJlbClcbiAgICAgICAgdG90YWxMYWJlbC5zdHJpbmcgPSBcIuWFsTDkurrlj4LotZtcIlxuICAgICAgICB0b3RhbExhYmVsLmZvbnRTaXplID0gMjJcbiAgICAgICAgdG90YWxMYWJlbC5saW5lSGVpZ2h0ID0gMjhcbiAgICAgICAgdGhpcy5fdG90YWxQbGF5ZXJzTm9kZS5jb2xvciA9IG5ldyBjYy5Db2xvcigxODAsIDE4MCwgMjAwKVxuICAgICAgICB0aGlzLl90b3RhbFBsYXllcnNOb2RlLnBhcmVudCA9IGRpYWxvZ05vZGVcbiAgICAgICAgdGhpcy50b3RhbFBsYXllcnNMYWJlbCA9IHRvdGFsTGFiZWxcblxuICAgICAgICAvLyA9PT09PT09PT09IOWJjeS4ieWQjemihuWlluWPsCA9PT09PT09PT09XG4gICAgICAgIC8vIPCflKfjgJDkv67lpI3jgJHkvJjljJbluIPlsYDpl7Tot53vvIzpgb/lhY3lhYPntKDmjKTlnKjkuIDotbdcbiAgICAgICAgdGhpcy5fY3JlYXRlVG9wM1BvZGl1bShkaWFsb2dOb2RlKVxuXG4gICAgICAgIC8vID09PT09PT09PT0g5oiR55qE5o6S5ZCN5Yy65Z+fID09PT09PT09PT1cbiAgICAgICAgLy8g8J+Up+OAkOS/ruWkjeOAkeaOkuWQjeaWh+acrOahhuaWh+Wtl+S4iuS4i+WxheS4rVxuICAgICAgICB0aGlzLl9jcmVhdGVNeVJhbmtBcmVhKGRpYWxvZ05vZGUpXG5cbiAgICAgICAgLy8gPT09PT09PT09PSDnoa7orqTmjInpkq4gPT09PT09PT09PVxuICAgICAgICB0aGlzLl9jcmVhdGVDb25maXJtQnV0dG9uKGRpYWxvZ05vZGUpXG5cbiAgICAgICAgY29uc29sZS5sb2coXCLwn4+GIFtUb3VybmFtZW50RmluYWxSYW5rRGlhbG9nXSDliqjmgIFVSeWIm+W7uuWujOaIkFwiKVxuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiDwn5Sn44CQ5L+u5aSN44CR5Yib5bu65YmN5LiJ5ZCN6aKG5aWW5Y+wXG4gICAgICog5biD5bGA5LyY5YyW77ya56Gu5L+d5Yag5Yab5bGF5Lit6auY5Lqu77yM5Lqa5a2j5Yab5a+556ew5YiG5biDXG4gICAgICovXG4gICAgX2NyZWF0ZVRvcDNQb2RpdW06IGZ1bmN0aW9uKHBhcmVudE5vZGUpIHtcbiAgICAgICAgLy8g6aKG5aWW5Y+wWeWdkOagh+WfuuWHhiAtIOaVtOS9k+S4iuenu++8jOeVmeWHuuabtOWkmuepuumXtFxuICAgICAgICB2YXIgcG9kaXVtWSA9IDUwXG4gICAgICAgIFxuICAgICAgICAvLyDmsLTlubPpl7Tot50gLSDlop7lpKfpl7Tot53pgb/lhY3ph43lj6BcbiAgICAgICAgdmFyIHNwYWNpbmdYID0gMjgwXG4gICAgICAgIFxuICAgICAgICAvLyDlhqDlhpvvvIjkuK3pl7TvvIzmnIDlpKfvvIzkvY3nva7mnIDpq5jvvIlcbiAgICAgICAgdGhpcy5jaGFtcGlvbk5vZGUgPSB0aGlzLl9jcmVhdGVQb2RpdW1JdGVtKDEsIDAsIHBvZGl1bVkgKyA0MCwgMS4xNSlcbiAgICAgICAgdGhpcy5jaGFtcGlvbk5vZGUucGFyZW50ID0gcGFyZW50Tm9kZVxuXG4gICAgICAgIC8vIOS6muWGm++8iOW3puS+p++8jOS9jee9rueVpeS9ju+8iVxuICAgICAgICB0aGlzLnJ1bm5lclVwTm9kZSA9IHRoaXMuX2NyZWF0ZVBvZGl1bUl0ZW0oMiwgLXNwYWNpbmdYLCBwb2RpdW1ZLCAxLjApXG4gICAgICAgIHRoaXMucnVubmVyVXBOb2RlLnBhcmVudCA9IHBhcmVudE5vZGVcblxuICAgICAgICAvLyDlraPlhpvvvIjlj7PkvqfvvIzkvY3nva7nlaXkvY7vvIlcbiAgICAgICAgdGhpcy50aGlyZFBsYWNlTm9kZSA9IHRoaXMuX2NyZWF0ZVBvZGl1bUl0ZW0oMywgc3BhY2luZ1gsIHBvZGl1bVksIDEuMClcbiAgICAgICAgdGhpcy50aGlyZFBsYWNlTm9kZS5wYXJlbnQgPSBwYXJlbnROb2RlXG5cbiAgICAgICAgLy8g5Yib5bu66aKG5aWW5Y+w5bqV6YOoXG4gICAgICAgIHZhciBwb2RpdW1CYXNlWSA9IHBvZGl1bVkgLSAxMDBcbiAgICAgICAgdGhpcy5fY3JlYXRlUG9kaXVtQmFzZShwYXJlbnROb2RlLCBwb2RpdW1CYXNlWSlcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICog8J+Up+OAkOS/ruWkjeOAkeWIm+W7uuWNleS4qumihuWlluWPsOmhueebrlxuICAgICAqIOW4g+WxgOmhuuW6j++8iOS7juS4iuWIsOS4i++8ie+8muWQjeasoSDihpIg5aS05YOPIOKGkiDmmLXnp7Ag4oaSIOmHkeW4gVxuICAgICAqIOS/ruWkje+8muWinuWkp+WFg+e0oOmXtOi3ne+8jOehruS/neS4jeaMpOWcqOS4gOi1t1xuICAgICAqL1xuICAgIF9jcmVhdGVQb2RpdW1JdGVtOiBmdW5jdGlvbihyYW5rLCB4LCB5LCBzY2FsZSkge1xuICAgICAgICB2YXIgbm9kZSA9IG5ldyBjYy5Ob2RlKFwiUG9kaXVtSXRlbV9cIiArIHJhbmspXG4gICAgICAgIG5vZGUuc2V0UG9zaXRpb24oeCwgeSlcbiAgICAgICAgbm9kZS5zY2FsZSA9IHNjYWxlIHx8IDFcblxuICAgICAgICAvLyA9PT09PT09PT09IOW4g+WxgOiuoeeul++8iOS/ruWkjemXtOi3ne+8iT09PT09PT09PT1cbiAgICAgICAgLy8g5Lul5aS05YOP5Lit5b+D5Li65Z+65YeGKFk9MCnvvIzlhbbku5blhYPntKDnm7jlr7nlrprkvY1cbiAgICAgICAgLy8g5LuO5LiK5Yiw5LiL5L6d5qyh5o6S5YiX77ya5ZCN5qyhIOKGkiDlpLTlg48g4oaSIOaYteensCDihpIg6YeR5biBXG4gICAgICAgIC8vIPCflKfjgJDkv67lpI3jgJHlop7lpKflkITlhYPntKDkuYvpl7TnmoTpl7Tot51cbiAgICAgICAgdmFyIGxheW91dENvbmZpZyA9IHtcbiAgICAgICAgICAgIHJhbmtZOiA2NSwgICAgICAgLy8g5ZCN5qyhWeWdkOagh++8iOWktOWDj+S4iuaWuTY1cHjvvIzlop7lpKfpl7Tot53vvIlcbiAgICAgICAgICAgIGF2YXRhclk6IDAsICAgICAgLy8g5aS05YOPWeWdkOagh++8iOWfuuWHhuS9jee9ru+8iVxuICAgICAgICAgICAgbmFtZVk6IC02MCwgICAgICAvLyDmmLXnp7BZ5Z2Q5qCH77yI5aS05YOP5LiL5pa5NjBweO+8jOWinuWkp+mXtOi3ne+8iVxuICAgICAgICAgICAgY29pblk6IC05MCAgICAgICAvLyDph5HluIFZ5Z2Q5qCH77yI5pi156ew5LiL5pa5MzBweO+8jOWinuWkp+mXtOi3ne+8iVxuICAgICAgICB9O1xuXG4gICAgICAgIC8vID09PT09PT09PT0g5ZCN5qyh5qCH562+77yI5pyA5LiK6Z2i77yJPT09PT09PT09PVxuICAgICAgICB2YXIgcmFua0xhYmVsTm9kZSA9IG5ldyBjYy5Ob2RlKFwiUmFua0xhYmVsXCIpXG4gICAgICAgIHJhbmtMYWJlbE5vZGUuc2V0UG9zaXRpb24oMCwgbGF5b3V0Q29uZmlnLnJhbmtZKVxuICAgICAgICB2YXIgcmFua0xhYmVsID0gcmFua0xhYmVsTm9kZS5hZGRDb21wb25lbnQoY2MuTGFiZWwpXG4gICAgICAgIHJhbmtMYWJlbC5zdHJpbmcgPSB0aGlzLl9nZXRSYW5rVGV4dChyYW5rKVxuICAgICAgICByYW5rTGFiZWwuZm9udFNpemUgPSAyMlxuICAgICAgICByYW5rTGFiZWwuaG9yaXpvbnRhbEFsaWduID0gY2MuTGFiZWwuSG9yaXpvbnRhbEFsaWduLkNFTlRFUlxuICAgICAgICByYW5rTGFiZWxOb2RlLmNvbG9yID0gcmFuayA9PT0gMSA/IG5ldyBjYy5Db2xvcigyNTUsIDIxNSwgMCkgOiBuZXcgY2MuQ29sb3IoMjAwLCAyMDAsIDIyMClcbiAgICAgICAgdmFyIHJhbmtPdXRsaW5lID0gcmFua0xhYmVsTm9kZS5hZGRDb21wb25lbnQoY2MuTGFiZWxPdXRsaW5lKVxuICAgICAgICByYW5rT3V0bGluZS5jb2xvciA9IG5ldyBjYy5Db2xvcig1MCwgNTAsIDgwKVxuICAgICAgICByYW5rT3V0bGluZS53aWR0aCA9IDJcbiAgICAgICAgcmFua0xhYmVsTm9kZS5wYXJlbnQgPSBub2RlXG5cbiAgICAgICAgLy8gPT09PT09PT09PSDlpLTlg4/ljLrln5/vvIjlkI3mrKHkuIvmlrnvvIk9PT09PT09PT09XG4gICAgICAgIC8vIPCflKfjgJDkv67lpI3jgJHmoLnmja7mjpLlkI3osIPmlbTlpLTlg4/lpKflsI9cbiAgICAgICAgdmFyIGF2YXRhclNpemUgPSByYW5rID09PSAxID8gNzAgOiA2MCAgLy8g5Yag5Yab5aS05YOP5pu05aSnXG4gICAgICAgIHZhciBhdmF0YXJSYWRpdXMgPSBhdmF0YXJTaXplIC8gMiArIDJcbiAgICAgICAgXG4gICAgICAgIHZhciBhdmF0YXJDb250YWluZXIgPSBuZXcgY2MuTm9kZShcIkF2YXRhckNvbnRhaW5lclwiKVxuICAgICAgICBhdmF0YXJDb250YWluZXIuc2V0UG9zaXRpb24oMCwgbGF5b3V0Q29uZmlnLmF2YXRhclkpXG4gICAgICAgIGF2YXRhckNvbnRhaW5lci5zZXRDb250ZW50U2l6ZShhdmF0YXJTaXplLCBhdmF0YXJTaXplKVxuICAgICAgICBcbiAgICAgICAgLy8g5aS05YOP6IOM5pmv77yI5ZyG5b2i77yJXG4gICAgICAgIHZhciBhdmF0YXJCZyA9IG5ldyBjYy5Ob2RlKFwiQXZhdGFyQmdcIilcbiAgICAgICAgdmFyIGF2YXRhckJnR3JhcGhpY3MgPSBhdmF0YXJCZy5hZGRDb21wb25lbnQoY2MuR3JhcGhpY3MpXG4gICAgICAgIGF2YXRhckJnR3JhcGhpY3MuZmlsbENvbG9yID0gbmV3IGNjLkNvbG9yKDYwLCA3MCwgMTAwKVxuICAgICAgICBhdmF0YXJCZ0dyYXBoaWNzLmNpcmNsZSgwLCAwLCBhdmF0YXJSYWRpdXMpXG4gICAgICAgIGF2YXRhckJnR3JhcGhpY3MuZmlsbCgpXG4gICAgICAgIGF2YXRhckJnR3JhcGhpY3Muc3Ryb2tlQ29sb3IgPSByYW5rID09PSAxID8gbmV3IGNjLkNvbG9yKDI1NSwgMjE1LCAwKSA6IG5ldyBjYy5Db2xvcigxNTAsIDE1MCwgMTgwKVxuICAgICAgICBhdmF0YXJCZ0dyYXBoaWNzLmxpbmVXaWR0aCA9IHJhbmsgPT09IDEgPyAzIDogMlxuICAgICAgICBhdmF0YXJCZ0dyYXBoaWNzLmNpcmNsZSgwLCAwLCBhdmF0YXJSYWRpdXMpXG4gICAgICAgIGF2YXRhckJnR3JhcGhpY3Muc3Ryb2tlKClcbiAgICAgICAgYXZhdGFyQmcucGFyZW50ID0gYXZhdGFyQ29udGFpbmVyXG5cbiAgICAgICAgLy8g5aS05YOP57K+54G1XG4gICAgICAgIHZhciBhdmF0YXJTcHJpdGVOb2RlID0gbmV3IGNjLk5vZGUoXCJBdmF0YXJTcHJpdGVcIilcbiAgICAgICAgdmFyIGF2YXRhclNwcml0ZSA9IGF2YXRhclNwcml0ZU5vZGUuYWRkQ29tcG9uZW50KGNjLlNwcml0ZSlcbiAgICAgICAgYXZhdGFyU3ByaXRlLnNpemVNb2RlID0gY2MuU3ByaXRlLlNpemVNb2RlLkNVU1RPTVxuICAgICAgICBhdmF0YXJTcHJpdGVOb2RlLnNldENvbnRlbnRTaXplKGF2YXRhclNpemUgLSA0LCBhdmF0YXJTaXplIC0gNClcbiAgICAgICAgYXZhdGFyU3ByaXRlTm9kZS5wYXJlbnQgPSBhdmF0YXJDb250YWluZXJcblxuICAgICAgICBhdmF0YXJDb250YWluZXIucGFyZW50ID0gbm9kZVxuXG4gICAgICAgIC8vID09PT09PT09PT0g5pi156ew5qCH562+77yI5aS05YOP5LiL5pa577yJPT09PT09PT09PVxuICAgICAgICAvLyDwn5Sn44CQ5L+u5aSN44CR5aKe5aSn5a2X5L2T77yM6ZmQ5Yi25a695bqm6Ziy5q2i5rqi5Ye6XG4gICAgICAgIHZhciBuYW1lTGFiZWxOb2RlID0gbmV3IGNjLk5vZGUoXCJOYW1lTGFiZWxcIilcbiAgICAgICAgbmFtZUxhYmVsTm9kZS5zZXRQb3NpdGlvbigwLCBsYXlvdXRDb25maWcubmFtZVkpXG4gICAgICAgIG5hbWVMYWJlbE5vZGUuc2V0Q29udGVudFNpemUoMTIwLCAzMCkgIC8vIOmZkOWItuWuveW6plxuICAgICAgICB2YXIgbmFtZUxhYmVsID0gbmFtZUxhYmVsTm9kZS5hZGRDb21wb25lbnQoY2MuTGFiZWwpXG4gICAgICAgIG5hbWVMYWJlbC5zdHJpbmcgPSBcIueOqeWutuaYteensFwiXG4gICAgICAgIG5hbWVMYWJlbC5mb250U2l6ZSA9IHJhbmsgPT09IDEgPyAyMCA6IDE4ICAvLyDlhqDlhpvlrZfkvZPnqI3lpKdcbiAgICAgICAgbmFtZUxhYmVsLmxpbmVIZWlnaHQgPSAyNFxuICAgICAgICBuYW1lTGFiZWwuaG9yaXpvbnRhbEFsaWduID0gY2MuTGFiZWwuSG9yaXpvbnRhbEFsaWduLkNFTlRFUlxuICAgICAgICBuYW1lTGFiZWwub3ZlcmZsb3cgPSBjYy5MYWJlbC5PdmVyZmxvdy5DTEFNUCAgLy8g6Ziy5q2i5rqi5Ye6XG4gICAgICAgIG5hbWVMYWJlbE5vZGUuY29sb3IgPSBuZXcgY2MuQ29sb3IoMjU1LCAyNTUsIDI1NSlcbiAgICAgICAgdmFyIG5hbWVPdXRsaW5lID0gbmFtZUxhYmVsTm9kZS5hZGRDb21wb25lbnQoY2MuTGFiZWxPdXRsaW5lKVxuICAgICAgICBuYW1lT3V0bGluZS5jb2xvciA9IG5ldyBjYy5Db2xvcigzMCwgMzAsIDUwKVxuICAgICAgICBuYW1lT3V0bGluZS53aWR0aCA9IDFcbiAgICAgICAgbmFtZUxhYmVsTm9kZS5wYXJlbnQgPSBub2RlXG5cbiAgICAgICAgLy8gPT09PT09PT09PSDph5HluIHmoIfnrb7vvIjmmLXnp7DkuIvmlrnvvIk9PT09PT09PT09XG4gICAgICAgIC8vIPCflKfjgJDkv67lpI3jgJHlop7lpKflrZfkvZPlkozpl7Tot53vvIzmm7TphpLnm65cbiAgICAgICAgdmFyIGNvaW5MYWJlbE5vZGUgPSBuZXcgY2MuTm9kZShcIkNvaW5MYWJlbFwiKVxuICAgICAgICBjb2luTGFiZWxOb2RlLnNldFBvc2l0aW9uKDAsIGxheW91dENvbmZpZy5jb2luWSlcbiAgICAgICAgdmFyIGNvaW5MYWJlbCA9IGNvaW5MYWJlbE5vZGUuYWRkQ29tcG9uZW50KGNjLkxhYmVsKVxuICAgICAgICBjb2luTGFiZWwuc3RyaW5nID0gXCIw6YeR5biBXCJcbiAgICAgICAgY29pbkxhYmVsLmZvbnRTaXplID0gcmFuayA9PT0gMSA/IDE4IDogMTYgIC8vIOWGoOWGm+Wtl+S9k+eojeWkp1xuICAgICAgICBjb2luTGFiZWwubGluZUhlaWdodCA9IDIwXG4gICAgICAgIGNvaW5MYWJlbC5ob3Jpem9udGFsQWxpZ24gPSBjYy5MYWJlbC5Ib3Jpem9udGFsQWxpZ24uQ0VOVEVSXG4gICAgICAgIGNvaW5MYWJlbE5vZGUuY29sb3IgPSByYW5rID09PSAxID8gbmV3IGNjLkNvbG9yKDI1NSwgMjE1LCAwKSA6IG5ldyBjYy5Db2xvcigyNTUsIDIwMCwgMTAwKSAgLy8g5Yag5Yab6YeR6ImyXG4gICAgICAgIHZhciBjb2luT3V0bGluZSA9IGNvaW5MYWJlbE5vZGUuYWRkQ29tcG9uZW50KGNjLkxhYmVsT3V0bGluZSlcbiAgICAgICAgY29pbk91dGxpbmUuY29sb3IgPSBuZXcgY2MuQ29sb3IoODAsIDUwLCAwKVxuICAgICAgICBjb2luT3V0bGluZS53aWR0aCA9IDFcbiAgICAgICAgY29pbkxhYmVsTm9kZS5wYXJlbnQgPSBub2RlXG5cbiAgICAgICAgcmV0dXJuIG5vZGVcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICog8J+Up+OAkOS/ruWkjeOAkeWIm+W7uumihuWlluWPsOW6lemDqFxuICAgICAqIOS/ruWkje+8muiwg+aVtOS9jee9ruS4jumihuWlluWPsOmhueebruWvuem9kFxuICAgICAqL1xuICAgIF9jcmVhdGVQb2RpdW1CYXNlOiBmdW5jdGlvbihwYXJlbnROb2RlLCB5KSB7XG4gICAgICAgIHZhciBzcGFjaW5nWCA9IDI4MCAgLy8g5LiO6aKG5aWW5Y+w6aG555uu6Ze06Led5LiA6Ie0XG4gICAgICAgIFxuICAgICAgICAvLyDlhqDlhpvlj7DvvIjmnIDpq5jvvIzmnIDlrr3vvIlcbiAgICAgICAgdmFyIGNoYW1waW9uQmFzZSA9IG5ldyBjYy5Ob2RlKFwiQ2hhbXBpb25CYXNlXCIpXG4gICAgICAgIGNoYW1waW9uQmFzZS5zZXRQb3NpdGlvbigwLCB5IC0gMjApICAvLyDlr7npvZDlhqDlhpvkvY3nva5cbiAgICAgICAgdmFyIGNnMSA9IGNoYW1waW9uQmFzZS5hZGRDb21wb25lbnQoY2MuR3JhcGhpY3MpXG4gICAgICAgIGNnMS5maWxsQ29sb3IgPSBuZXcgY2MuQ29sb3IoMTgwLCAxNDAsIDYwLCAyMDApXG4gICAgICAgIGNnMS5yb3VuZFJlY3QoLTgwLCAtMzAsIDE2MCwgNjAsIDEwKVxuICAgICAgICBjZzEuZmlsbCgpXG4gICAgICAgIGNnMS5zdHJva2VDb2xvciA9IG5ldyBjYy5Db2xvcigyMjAsIDE4MCwgODApXG4gICAgICAgIGNnMS5saW5lV2lkdGggPSAyXG4gICAgICAgIGNnMS5yb3VuZFJlY3QoLTgwLCAtMzAsIDE2MCwgNjAsIDEwKVxuICAgICAgICBjZzEuc3Ryb2tlKClcbiAgICAgICAgY2hhbXBpb25CYXNlLnBhcmVudCA9IHBhcmVudE5vZGVcblxuICAgICAgICAvLyDkuprlhpvlj7DvvIjkuK3nrYnvvIlcbiAgICAgICAgdmFyIHJ1bm5lclVwQmFzZSA9IG5ldyBjYy5Ob2RlKFwiUnVubmVyVXBCYXNlXCIpXG4gICAgICAgIHJ1bm5lclVwQmFzZS5zZXRQb3NpdGlvbigtc3BhY2luZ1gsIHkgLSAzMCkgIC8vIOWvuem9kOS6muWGm+S9jee9rlxuICAgICAgICB2YXIgY2cyID0gcnVubmVyVXBCYXNlLmFkZENvbXBvbmVudChjYy5HcmFwaGljcylcbiAgICAgICAgY2cyLmZpbGxDb2xvciA9IG5ldyBjYy5Db2xvcigxMjAsIDEzMCwgMTUwLCAyMDApXG4gICAgICAgIGNnMi5yb3VuZFJlY3QoLTY1LCAtMjUsIDEzMCwgNTAsIDgpXG4gICAgICAgIGNnMi5maWxsKClcbiAgICAgICAgY2cyLnN0cm9rZUNvbG9yID0gbmV3IGNjLkNvbG9yKDE2MCwgMTcwLCAxOTApXG4gICAgICAgIGNnMi5saW5lV2lkdGggPSAyXG4gICAgICAgIGNnMi5yb3VuZFJlY3QoLTY1LCAtMjUsIDEzMCwgNTAsIDgpXG4gICAgICAgIGNnMi5zdHJva2UoKVxuICAgICAgICBydW5uZXJVcEJhc2UucGFyZW50ID0gcGFyZW50Tm9kZVxuXG4gICAgICAgIC8vIOWto+WGm+WPsO+8iOacgOS9ju+8iVxuICAgICAgICB2YXIgdGhpcmRCYXNlID0gbmV3IGNjLk5vZGUoXCJUaGlyZEJhc2VcIilcbiAgICAgICAgdGhpcmRCYXNlLnNldFBvc2l0aW9uKHNwYWNpbmdYLCB5IC0gMzApICAvLyDlr7npvZDlraPlhpvkvY3nva5cbiAgICAgICAgdmFyIGNnMyA9IHRoaXJkQmFzZS5hZGRDb21wb25lbnQoY2MuR3JhcGhpY3MpXG4gICAgICAgIGNnMy5maWxsQ29sb3IgPSBuZXcgY2MuQ29sb3IoMTUwLCAxMTAsIDkwLCAyMDApXG4gICAgICAgIGNnMy5yb3VuZFJlY3QoLTY1LCAtMjUsIDEzMCwgNTAsIDgpXG4gICAgICAgIGNnMy5maWxsKClcbiAgICAgICAgY2czLnN0cm9rZUNvbG9yID0gbmV3IGNjLkNvbG9yKDE4MCwgMTQwLCAxMTApXG4gICAgICAgIGNnMy5saW5lV2lkdGggPSAyXG4gICAgICAgIGNnMy5yb3VuZFJlY3QoLTY1LCAtMjUsIDEzMCwgNTAsIDgpXG4gICAgICAgIGNnMy5zdHJva2UoKVxuICAgICAgICB0aGlyZEJhc2UucGFyZW50ID0gcGFyZW50Tm9kZVxuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiDwn5Sn44CQ5L+u5aSN44CR5Yib5bu65oiR55qE5o6S5ZCN5Yy65Z+fXG4gICAgICog5L+u5aSN77ya6LCD5pW05L2N572u44CB5bGF5Lit5a+56b2Q44CB5aKe5aSn5a655Zmo5bC65a+4XG4gICAgICovXG4gICAgX2NyZWF0ZU15UmFua0FyZWE6IGZ1bmN0aW9uKHBhcmVudE5vZGUpIHtcbiAgICAgICAgdmFyIGNvbnRhaW5lciA9IG5ldyBjYy5Ob2RlKFwiTXlSYW5rQ29udGFpbmVyXCIpXG4gICAgICAgIGNvbnRhaW5lci5zZXRQb3NpdGlvbigwLCAtMjAwKSAgLy8g5LiL56e76YG/5YWN5LiO6aKG5aWW5Y+w6YeN5Y+gXG4gICAgICAgIGNvbnRhaW5lci5zZXRDb250ZW50U2l6ZSg2MDAsIDYwKSAgLy8g5aKe5aSn5a655Zmo5bC65a+4XG5cbiAgICAgICAgLy8g6IOM5pmv5qGGIC0g5pu05a695pu05riF5pmwXG4gICAgICAgIHZhciBiZ05vZGUgPSBuZXcgY2MuTm9kZShcIkJnXCIpXG4gICAgICAgIHZhciBiZ0dyYXBoaWNzID0gYmdOb2RlLmFkZENvbXBvbmVudChjYy5HcmFwaGljcylcbiAgICAgICAgYmdHcmFwaGljcy5maWxsQ29sb3IgPSBuZXcgY2MuQ29sb3IoNDAsIDUwLCA4MCwgMjMwKVxuICAgICAgICBiZ0dyYXBoaWNzLnJvdW5kUmVjdCgtMzAwLCAtMzAsIDYwMCwgNjAsIDEyKVxuICAgICAgICBiZ0dyYXBoaWNzLmZpbGwoKVxuICAgICAgICBiZ0dyYXBoaWNzLnN0cm9rZUNvbG9yID0gbmV3IGNjLkNvbG9yKDEwMCwgMTIwLCAxNjApXG4gICAgICAgIGJnR3JhcGhpY3MubGluZVdpZHRoID0gMlxuICAgICAgICBiZ0dyYXBoaWNzLnJvdW5kUmVjdCgtMzAwLCAtMzAsIDYwMCwgNjAsIDEyKVxuICAgICAgICBiZ0dyYXBoaWNzLnN0cm9rZSgpXG4gICAgICAgIGJnTm9kZS5wYXJlbnQgPSBjb250YWluZXJcblxuICAgICAgICAvLyDmiJHnmoTmjpLlkI3moIfnrb4gLSDlsYXkuK3lr7npvZBcbiAgICAgICAgdmFyIG15UmFua05vZGUgPSBuZXcgY2MuTm9kZShcIk15UmFua0xhYmVsXCIpXG4gICAgICAgIG15UmFua05vZGUuc2V0UG9zaXRpb24oLTE0MCwgMCkgIC8vIOW3puS+p+S9jee9rlxuICAgICAgICBteVJhbmtOb2RlLnNldENvbnRlbnRTaXplKDIwMCwgNDApXG4gICAgICAgIHZhciBteVJhbmtMYWJlbCA9IG15UmFua05vZGUuYWRkQ29tcG9uZW50KGNjLkxhYmVsKVxuICAgICAgICBteVJhbmtMYWJlbC5zdHJpbmcgPSBcIuaIkeeahOaOkuWQje+8muesrC0t5ZCNXCJcbiAgICAgICAgbXlSYW5rTGFiZWwuZm9udFNpemUgPSAyMlxuICAgICAgICBteVJhbmtMYWJlbC5saW5lSGVpZ2h0ID0gMjhcbiAgICAgICAgbXlSYW5rTGFiZWwuaG9yaXpvbnRhbEFsaWduID0gY2MuTGFiZWwuSG9yaXpvbnRhbEFsaWduLkNFTlRFUlxuICAgICAgICBteVJhbmtMYWJlbC52ZXJ0aWNhbEFsaWduID0gY2MuTGFiZWwuVmVydGljYWxBbGlnbi5DRU5URVJcbiAgICAgICAgbXlSYW5rTm9kZS5jb2xvciA9IG5ldyBjYy5Db2xvcigxMDAsIDIwMCwgMjU1KVxuICAgICAgICBteVJhbmtOb2RlLnBhcmVudCA9IGNvbnRhaW5lclxuICAgICAgICB0aGlzLm15UmFua0xhYmVsID0gbXlSYW5rTGFiZWxcblxuICAgICAgICAvLyDliIbpmpTnrKZcbiAgICAgICAgdmFyIHNlcGFyYXRvck5vZGUgPSBuZXcgY2MuTm9kZShcIlNlcGFyYXRvclwiKVxuICAgICAgICBzZXBhcmF0b3JOb2RlLnNldFBvc2l0aW9uKDAsIDApXG4gICAgICAgIHZhciBzZXBMYWJlbCA9IHNlcGFyYXRvck5vZGUuYWRkQ29tcG9uZW50KGNjLkxhYmVsKVxuICAgICAgICBzZXBMYWJlbC5zdHJpbmcgPSBcInxcIlxuICAgICAgICBzZXBMYWJlbC5mb250U2l6ZSA9IDI0XG4gICAgICAgIHNlcExhYmVsLmxpbmVIZWlnaHQgPSAyOFxuICAgICAgICBzZXBhcmF0b3JOb2RlLmNvbG9yID0gbmV3IGNjLkNvbG9yKDE1MCwgMTUwLCAxODApXG4gICAgICAgIHNlcGFyYXRvck5vZGUucGFyZW50ID0gY29udGFpbmVyXG5cbiAgICAgICAgLy8g6YeR5biB5qCH562+XG4gICAgICAgIHZhciBteUNvaW5Ob2RlID0gbmV3IGNjLk5vZGUoXCJNeUNvaW5MYWJlbFwiKVxuICAgICAgICBteUNvaW5Ob2RlLnNldFBvc2l0aW9uKDE1MCwgMCkgIC8vIOWPs+S+p+S9jee9rlxuICAgICAgICBteUNvaW5Ob2RlLnNldENvbnRlbnRTaXplKDIwMCwgNDApXG4gICAgICAgIHZhciBteUNvaW5MYWJlbCA9IG15Q29pbk5vZGUuYWRkQ29tcG9uZW50KGNjLkxhYmVsKVxuICAgICAgICBteUNvaW5MYWJlbC5zdHJpbmcgPSBcIuavlOi1m+mHkeW4ge+8mjBcIlxuICAgICAgICBteUNvaW5MYWJlbC5mb250U2l6ZSA9IDIyXG4gICAgICAgIG15Q29pbkxhYmVsLmxpbmVIZWlnaHQgPSAyOFxuICAgICAgICBteUNvaW5MYWJlbC5ob3Jpem9udGFsQWxpZ24gPSBjYy5MYWJlbC5Ib3Jpem9udGFsQWxpZ24uQ0VOVEVSXG4gICAgICAgIG15Q29pbkxhYmVsLnZlcnRpY2FsQWxpZ24gPSBjYy5MYWJlbC5WZXJ0aWNhbEFsaWduLkNFTlRFUlxuICAgICAgICBteUNvaW5Ob2RlLmNvbG9yID0gbmV3IGNjLkNvbG9yKDI1NSwgMjAwLCAxMDApXG4gICAgICAgIG15Q29pbk5vZGUucGFyZW50ID0gY29udGFpbmVyXG4gICAgICAgIHRoaXMubXlDb2luTGFiZWwgPSBteUNvaW5MYWJlbFxuXG4gICAgICAgIGNvbnRhaW5lci5wYXJlbnQgPSBwYXJlbnROb2RlXG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIPCflKfjgJDkv67lpI3jgJHliJvlu7rnoa7orqTmjInpkq5cbiAgICAgKiDkv67lpI3vvJrosIPmlbTkvY3nva7vvIznoa7kv53kuI3kuI7nirbmgIHmoI/ph43lj6DvvIzlop7liqDmjInpkq7moLflvI9cbiAgICAgKi9cbiAgICBfY3JlYXRlQ29uZmlybUJ1dHRvbjogZnVuY3Rpb24ocGFyZW50Tm9kZSkge1xuICAgICAgICB2YXIgYnRuTm9kZSA9IG5ldyBjYy5Ob2RlKFwiQ29uZmlybUJ0blwiKVxuICAgICAgICBidG5Ob2RlLnNldFBvc2l0aW9uKDAsIC0yNzApICAvLyDkuIvnp7vnoa7kv53kuI7nirbmgIHmoI/mnInotrPlpJ/pl7Tot51cbiAgICAgICAgYnRuTm9kZS5zZXRDb250ZW50U2l6ZSgyMDAsIDU1KVxuXG4gICAgICAgIC8vIOaMiemSruiDjOaZryAtIOabtOmGkuebrueahOagt+W8j1xuICAgICAgICB2YXIgYnRuQmcgPSBidG5Ob2RlLmFkZENvbXBvbmVudChjYy5HcmFwaGljcylcbiAgICAgICAgYnRuQmcuZmlsbENvbG9yID0gbmV3IGNjLkNvbG9yKDgwLCAxNjAsIDgwKSAgLy8g57u/6Imy5oyJ6ZKuXG4gICAgICAgIGJ0bkJnLnJvdW5kUmVjdCgtMTAwLCAtMjcuNSwgMjAwLCA1NSwgMTIpXG4gICAgICAgIGJ0bkJnLmZpbGwoKVxuICAgICAgICBidG5CZy5zdHJva2VDb2xvciA9IG5ldyBjYy5Db2xvcigxMjAsIDIwMCwgMTIwKVxuICAgICAgICBidG5CZy5saW5lV2lkdGggPSAzXG4gICAgICAgIGJ0bkJnLnJvdW5kUmVjdCgtMTAwLCAtMjcuNSwgMjAwLCA1NSwgMTIpXG4gICAgICAgIGJ0bkJnLnN0cm9rZSgpXG5cbiAgICAgICAgLy8g5oyJ6ZKu5paH5a2XXG4gICAgICAgIHZhciBidG5MYWJlbE5vZGUgPSBuZXcgY2MuTm9kZShcIkxhYmVsXCIpXG4gICAgICAgIHZhciBidG5MYWJlbCA9IGJ0bkxhYmVsTm9kZS5hZGRDb21wb25lbnQoY2MuTGFiZWwpXG4gICAgICAgIGJ0bkxhYmVsLnN0cmluZyA9IFwi56GuIOWumlwiXG4gICAgICAgIGJ0bkxhYmVsLmZvbnRTaXplID0gMjZcbiAgICAgICAgYnRuTGFiZWwubGluZUhlaWdodCA9IDMyXG4gICAgICAgIGJ0bkxhYmVsLmhvcml6b250YWxBbGlnbiA9IGNjLkxhYmVsLkhvcml6b250YWxBbGlnbi5DRU5URVJcbiAgICAgICAgYnRuTGFiZWxOb2RlLmNvbG9yID0gbmV3IGNjLkNvbG9yKDI1NSwgMjU1LCAyNTUpXG4gICAgICAgIHZhciBidG5PdXRsaW5lID0gYnRuTGFiZWxOb2RlLmFkZENvbXBvbmVudChjYy5MYWJlbE91dGxpbmUpXG4gICAgICAgIGJ0bk91dGxpbmUuY29sb3IgPSBuZXcgY2MuQ29sb3IoMzAsIDgwLCAzMClcbiAgICAgICAgYnRuT3V0bGluZS53aWR0aCA9IDJcbiAgICAgICAgYnRuTGFiZWxOb2RlLnBhcmVudCA9IGJ0bk5vZGVcblxuICAgICAgICAvLyDmt7vliqDmjInpkq7nu4Tku7ZcbiAgICAgICAgdmFyIGJ0biA9IGJ0bk5vZGUuYWRkQ29tcG9uZW50KGNjLkJ1dHRvbilcbiAgICAgICAgYnRuTm9kZS5vbignY2xpY2snLCB0aGlzLm9uQ29uZmlybUNsaWNrLCB0aGlzKVxuICAgICAgICBidG5Ob2RlLnBhcmVudCA9IHBhcmVudE5vZGVcblxuICAgICAgICB0aGlzLmNvbmZpcm1CdG4gPSBidG5cbiAgICB9LFxuXG4gICAgLy8gPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XG4gICAgLy8g5YWs5YWx5pa55rOVXG4gICAgLy8gPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XG5cbiAgICAvKipcbiAgICAgKiDorr7nva7mlbDmja5cbiAgICAgKiBAcGFyYW0ge09iamVjdH0gZGF0YSAtIHsgcGVyaW9kX25vLCB0b3RhbF9wbGF5ZXJzLCB0b3AzLCB0b3AyMCwgbXlfcmFuaywgbXlfbWF0Y2hfY29pbiB9XG4gICAgICovXG4gICAgc2V0RGF0YTogZnVuY3Rpb24oZGF0YSkge1xuICAgICAgICBjb25zb2xlLmxvZyhcIvCfj4YgW1RvdXJuYW1lbnRGaW5hbFJhbmtEaWFsb2ddIOaUtuWIsOaVsOaNrjpcIiwgSlNPTi5zdHJpbmdpZnkoZGF0YSkpXG4gICAgICAgIFxuICAgICAgICB0aGlzLl9kYXRhID0gZGF0YVxuICAgICAgICB0aGlzLl9wZXJpb2RObyA9IGRhdGEucGVyaW9kX25vIHx8IFwiXCJcbiAgICAgICAgdGhpcy5fdG90YWxQbGF5ZXJzID0gZGF0YS50b3RhbF9wbGF5ZXJzIHx8IDBcbiAgICAgICAgdGhpcy5fdG9wMyA9IGRhdGEudG9wMyB8fCBbXVxuICAgICAgICB0aGlzLl90b3AyMCA9IGRhdGEudG9wMjAgfHwgW11cbiAgICAgICAgdGhpcy5fbXlSYW5rID0gZGF0YS5teV9yYW5rIHx8IDBcbiAgICAgICAgdGhpcy5fbXlNYXRjaENvaW4gPSBkYXRhLm15X21hdGNoX2NvaW4gfHwgMFxuXG4gICAgICAgIC8vIPCflKfjgJDosIPor5XjgJHmiZPljbBUT1Az5pWw5o2uXG4gICAgICAgIGNvbnNvbGUubG9nKFwi8J+PhiBbVG91cm5hbWVudEZpbmFsUmFua0RpYWxvZ10gVE9QM+aVsOaNrjpcIilcbiAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCB0aGlzLl90b3AzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICBjb25zb2xlLmxvZyhcIiAgI1wiICsgKGkrMSkgKyBcIjpcIiwgdGhpcy5fdG9wM1tpXS5wbGF5ZXJfbmFtZSwgXCLph5HluIE6XCIsIHRoaXMuX3RvcDNbaV0ubWF0Y2hfY29pbiwgXCLmnLrlmajkuro6XCIsIHRoaXMuX3RvcDNbaV0uaXNfcm9ib3QpXG4gICAgICAgIH1cblxuICAgICAgICB0aGlzLl91cGRhdGVVSSgpXG4gICAgfSxcblxuICAgIC8vID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxuICAgIC8vIFVJ5pu05pawXG4gICAgLy8gPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XG5cbiAgICBfdXBkYXRlVUk6IGZ1bmN0aW9uKCkge1xuICAgICAgICAvLyDmm7TmlrDmnJ/lj7dcbiAgICAgICAgaWYgKHRoaXMucGVyaW9kTm9MYWJlbCkge1xuICAgICAgICAgICAgdGhpcy5wZXJpb2ROb0xhYmVsLnN0cmluZyA9IFwi56ysXCIgKyB0aGlzLl9wZXJpb2RObyArIFwi5pyf6LWb5LqL57uT5p2fXCJcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIOabtOaWsOaAu+WPgui1m+S6uuaVsFxuICAgICAgICBpZiAodGhpcy50b3RhbFBsYXllcnNMYWJlbCkge1xuICAgICAgICAgICAgdGhpcy50b3RhbFBsYXllcnNMYWJlbC5zdHJpbmcgPSBcIuWFsVwiICsgdGhpcy5fdG90YWxQbGF5ZXJzICsgXCLkurrlj4LotZtcIlxuICAgICAgICB9XG5cbiAgICAgICAgLy8g5pu05paw5YmN5LiJ5ZCNXG4gICAgICAgIHRoaXMuX3VwZGF0ZVRvcDMoKVxuXG4gICAgICAgIC8vIOabtOaWsOaIkeeahOaOkuWQjVxuICAgICAgICBpZiAodGhpcy5teVJhbmtMYWJlbCkge1xuICAgICAgICAgICAgaWYgKHRoaXMuX215UmFuayA+IDApIHtcbiAgICAgICAgICAgICAgICB0aGlzLm15UmFua0xhYmVsLnN0cmluZyA9IFwi5oiR55qE5o6S5ZCN77ya56ysXCIgKyB0aGlzLl9teVJhbmsgKyBcIuWQjVwiXG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIHRoaXMubXlSYW5rTGFiZWwuc3RyaW5nID0gXCLmiJHnmoTmjpLlkI3vvJrmnKrkuIrmppxcIlxuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgLy8g5pu05paw5oiR55qE6YeR5biBXG4gICAgICAgIGlmICh0aGlzLm15Q29pbkxhYmVsKSB7XG4gICAgICAgICAgICB0aGlzLm15Q29pbkxhYmVsLnN0cmluZyA9IFwi5q+U6LWb6YeR5biB77yaXCIgKyB0aGlzLl9teU1hdGNoQ29pblxuICAgICAgICB9XG4gICAgfSxcblxuICAgIF91cGRhdGVUb3AzOiBmdW5jdGlvbigpIHtcbiAgICAgICAgLy8g5pu05paw5Yag5YabXG4gICAgICAgIGlmICh0aGlzLl90b3AzLmxlbmd0aCA+PSAxICYmIHRoaXMuY2hhbXBpb25Ob2RlKSB7XG4gICAgICAgICAgICB0aGlzLl91cGRhdGVQb2RpdW1Ob2RlKHRoaXMuY2hhbXBpb25Ob2RlLCB0aGlzLl90b3AzWzBdLCAxKVxuICAgICAgICB9XG5cbiAgICAgICAgLy8g5pu05paw5Lqa5YabXG4gICAgICAgIGlmICh0aGlzLl90b3AzLmxlbmd0aCA+PSAyICYmIHRoaXMucnVubmVyVXBOb2RlKSB7XG4gICAgICAgICAgICB0aGlzLl91cGRhdGVQb2RpdW1Ob2RlKHRoaXMucnVubmVyVXBOb2RlLCB0aGlzLl90b3AzWzFdLCAyKVxuICAgICAgICB9XG5cbiAgICAgICAgLy8g5pu05paw5a2j5YabXG4gICAgICAgIGlmICh0aGlzLl90b3AzLmxlbmd0aCA+PSAzICYmIHRoaXMudGhpcmRQbGFjZU5vZGUpIHtcbiAgICAgICAgICAgIHRoaXMuX3VwZGF0ZVBvZGl1bU5vZGUodGhpcy50aGlyZFBsYWNlTm9kZSwgdGhpcy5fdG9wM1syXSwgMylcbiAgICAgICAgfVxuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiDmm7TmlrDpooblpZblj7DoioLngrlcbiAgICAgKiBAcGFyYW0ge2NjLk5vZGV9IG5vZGUgLSDpooblpZblj7DoioLngrlcbiAgICAgKiBAcGFyYW0ge09iamVjdH0gZGF0YSAtIOeOqeWutuaVsOaNriB7IHBsYXllcl9uYW1lLCBtYXRjaF9jb2luLCBhdmF0YXIsIGlzX3JvYm90LCBwbGF5ZXJfaWQgfVxuICAgICAqIEBwYXJhbSB7bnVtYmVyfSByYW5rIC0g5o6S5ZCNXG4gICAgICovXG4gICAgX3VwZGF0ZVBvZGl1bU5vZGU6IGZ1bmN0aW9uKG5vZGUsIGRhdGEsIHJhbmspIHtcbiAgICAgICAgLy8g5ZCN5qyh5qCH562+XG4gICAgICAgIHZhciByYW5rTGFiZWwgPSBub2RlLmdldENoaWxkQnlOYW1lKFwiUmFua0xhYmVsXCIpXG4gICAgICAgIGlmIChyYW5rTGFiZWwpIHtcbiAgICAgICAgICAgIHZhciBsYWJlbCA9IHJhbmtMYWJlbC5nZXRDb21wb25lbnQoY2MuTGFiZWwpXG4gICAgICAgICAgICBpZiAobGFiZWwpIHtcbiAgICAgICAgICAgICAgICBsYWJlbC5zdHJpbmcgPSB0aGlzLl9nZXRSYW5rVGV4dChyYW5rKVxuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgLy8g8J+Up+OAkOS/ruWkjeOAkeWkhOeQhuacuuWZqOS6uuaYteensOaYvuekulxuICAgICAgICB2YXIgZGlzcGxheU5hbWUgPSBkYXRhLnBsYXllcl9uYW1lIHx8IFwi546p5a62XCJcbiAgICAgICAgaWYgKGRhdGEuaXNfcm9ib3QpIHtcbiAgICAgICAgICAgIGRpc3BsYXlOYW1lID0gdGhpcy5fZ2V0Um9ib3REaXNwbGF5TmFtZShkYXRhLnBsYXllcl9pZCwgZGF0YS5wbGF5ZXJfbmFtZSlcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIOaYteensOagh+etvlxuICAgICAgICB2YXIgbmFtZUxhYmVsID0gbm9kZS5nZXRDaGlsZEJ5TmFtZShcIk5hbWVMYWJlbFwiKVxuICAgICAgICBpZiAobmFtZUxhYmVsKSB7XG4gICAgICAgICAgICB2YXIgbGFiZWwgPSBuYW1lTGFiZWwuZ2V0Q29tcG9uZW50KGNjLkxhYmVsKVxuICAgICAgICAgICAgaWYgKGxhYmVsKSB7XG4gICAgICAgICAgICAgICAgbGFiZWwuc3RyaW5nID0gZGlzcGxheU5hbWVcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIC8vIOmHkeW4geagh+etvlxuICAgICAgICB2YXIgY29pbkxhYmVsID0gbm9kZS5nZXRDaGlsZEJ5TmFtZShcIkNvaW5MYWJlbFwiKVxuICAgICAgICBpZiAoY29pbkxhYmVsKSB7XG4gICAgICAgICAgICB2YXIgbGFiZWwgPSBjb2luTGFiZWwuZ2V0Q29tcG9uZW50KGNjLkxhYmVsKVxuICAgICAgICAgICAgaWYgKGxhYmVsKSB7XG4gICAgICAgICAgICAgICAgbGFiZWwuc3RyaW5nID0gdGhpcy5fZm9ybWF0Q29pbihkYXRhLm1hdGNoX2NvaW4gfHwgMCkgKyBcIumHkeW4gVwiXG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICAvLyDwn5Sn44CQ5paw5aKe44CR5Yqg6L295aS05YOPXG4gICAgICAgIHZhciBhdmF0YXJDb250YWluZXIgPSBub2RlLmdldENoaWxkQnlOYW1lKFwiQXZhdGFyQ29udGFpbmVyXCIpXG4gICAgICAgIGlmIChhdmF0YXJDb250YWluZXIpIHtcbiAgICAgICAgICAgIHZhciBhdmF0YXJTcHJpdGVOb2RlID0gYXZhdGFyQ29udGFpbmVyLmdldENoaWxkQnlOYW1lKFwiQXZhdGFyU3ByaXRlXCIpXG4gICAgICAgICAgICBpZiAoYXZhdGFyU3ByaXRlTm9kZSkge1xuICAgICAgICAgICAgICAgIHZhciBhdmF0YXJTcHJpdGUgPSBhdmF0YXJTcHJpdGVOb2RlLmdldENvbXBvbmVudChjYy5TcHJpdGUpXG4gICAgICAgICAgICAgICAgaWYgKGF2YXRhclNwcml0ZSkge1xuICAgICAgICAgICAgICAgICAgICB0aGlzLl9sb2FkQXZhdGFyKGF2YXRhclNwcml0ZSwgZGF0YS5hdmF0YXIsIGRhdGEuaXNfcm9ib3QpXG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIFxuICAgICAgICBjb25zb2xlLmxvZyhcIvCfj4YgW191cGRhdGVQb2RpdW1Ob2RlXSDmjpLlkI0jXCIgKyByYW5rICsgXCI6IFwiICsgZGlzcGxheU5hbWUgKyBcIiwg6YeR5biBPVwiICsgZGF0YS5tYXRjaF9jb2luICsgXCIsIOacuuWZqOS6uj1cIiArIGRhdGEuaXNfcm9ib3QpXG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIPCflKfjgJDmlrDlop7jgJHliqDovb3lpLTlg49cbiAgICAgKi9cbiAgICBfbG9hZEF2YXRhcjogZnVuY3Rpb24oc3ByaXRlLCBhdmF0YXJVcmwsIGlzUm9ib3QpIHtcbiAgICAgICAgaWYgKCFzcHJpdGUpIHJldHVyblxuXG4gICAgICAgIC8vIOacuuWZqOS6uuS9v+eUqOm7mOiupOWktOWDj1xuICAgICAgICBpZiAoaXNSb2JvdCkge1xuICAgICAgICAgICAgdmFyIHJvYm90QXZhdGFySW5kZXggPSBNYXRoLmZsb29yKE1hdGgucmFuZG9tKCkgKiAzKSArIDFcbiAgICAgICAgICAgIHZhciBkZWZhdWx0UGF0aCA9IFwiVUkvaGVhZGltYWdlL2F2YXRhcl9cIiArIHJvYm90QXZhdGFySW5kZXhcbiAgICAgICAgICAgIGNjLnJlc291cmNlcy5sb2FkKGRlZmF1bHRQYXRoLCBjYy5TcHJpdGVGcmFtZSwgZnVuY3Rpb24oZXJyLCBzcHJpdGVGcmFtZSkge1xuICAgICAgICAgICAgICAgIGlmICghZXJyICYmIHNwcml0ZUZyYW1lKSB7XG4gICAgICAgICAgICAgICAgICAgIHNwcml0ZS5zcHJpdGVGcmFtZSA9IHNwcml0ZUZyYW1lXG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSlcbiAgICAgICAgICAgIHJldHVyblxuICAgICAgICB9XG5cbiAgICAgICAgLy8g56m65YC85aSE55CGXG4gICAgICAgIGlmICghYXZhdGFyVXJsIHx8IGF2YXRhclVybCA9PT0gXCJcIikge1xuICAgICAgICAgICAgY2MucmVzb3VyY2VzLmxvYWQoXCJVSS9oZWFkaW1hZ2UvYXZhdGFyXzFcIiwgY2MuU3ByaXRlRnJhbWUsIGZ1bmN0aW9uKGVyciwgc3ByaXRlRnJhbWUpIHtcbiAgICAgICAgICAgICAgICBpZiAoIWVyciAmJiBzcHJpdGVGcmFtZSkge1xuICAgICAgICAgICAgICAgICAgICBzcHJpdGUuc3ByaXRlRnJhbWUgPSBzcHJpdGVGcmFtZVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0pXG4gICAgICAgICAgICByZXR1cm5cbiAgICAgICAgfVxuXG4gICAgICAgIC8vIOi/nOeoi1VSTFxuICAgICAgICBpZiAoYXZhdGFyVXJsLmluZGV4T2YoXCJodHRwXCIpID09PSAwIHx8IGF2YXRhclVybC5pbmRleE9mKFwiLy9cIikgPT09IDApIHtcbiAgICAgICAgICAgIGNjLmFzc2V0TWFuYWdlci5sb2FkUmVtb3RlKGF2YXRhclVybCwgeyBleHQ6ICcucG5nJyB9LCBmdW5jdGlvbihlcnIsIHRleHR1cmUpIHtcbiAgICAgICAgICAgICAgICBpZiAoZXJyIHx8ICF0ZXh0dXJlKSB7XG4gICAgICAgICAgICAgICAgICAgIGNjLnJlc291cmNlcy5sb2FkKFwiVUkvaGVhZGltYWdlL2F2YXRhcl8xXCIsIGNjLlNwcml0ZUZyYW1lLCBmdW5jdGlvbihlcnIyLCBmYWxsYmFja1Nwcml0ZSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKCFlcnIyICYmIGZhbGxiYWNrU3ByaXRlKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgc3ByaXRlLnNwcml0ZUZyYW1lID0gZmFsbGJhY2tTcHJpdGVcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgfSlcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuXG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIHZhciBzcHJpdGVGcmFtZSA9IG5ldyBjYy5TcHJpdGVGcmFtZSh0ZXh0dXJlKVxuICAgICAgICAgICAgICAgIHNwcml0ZS5zcHJpdGVGcmFtZSA9IHNwcml0ZUZyYW1lXG4gICAgICAgICAgICB9KVxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgLy8g5pys5Zyw6LWE5rqQXG4gICAgICAgICAgICB2YXIgbG9jYWxQYXRoID0gXCJVSS9oZWFkaW1hZ2UvXCIgKyBhdmF0YXJVcmxcbiAgICAgICAgICAgIGNjLnJlc291cmNlcy5sb2FkKGxvY2FsUGF0aCwgY2MuU3ByaXRlRnJhbWUsIGZ1bmN0aW9uKGVyciwgc3ByaXRlRnJhbWUpIHtcbiAgICAgICAgICAgICAgICBpZiAoZXJyIHx8ICFzcHJpdGVGcmFtZSkge1xuICAgICAgICAgICAgICAgICAgICBjYy5yZXNvdXJjZXMubG9hZChcIlVJL2hlYWRpbWFnZS9hdmF0YXJfMVwiLCBjYy5TcHJpdGVGcmFtZSwgZnVuY3Rpb24oZXJyMiwgZmFsbGJhY2tTcHJpdGUpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmICghZXJyMiAmJiBmYWxsYmFja1Nwcml0ZSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHNwcml0ZS5zcHJpdGVGcmFtZSA9IGZhbGxiYWNrU3ByaXRlXG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH0pXG4gICAgICAgICAgICAgICAgICAgIHJldHVyblxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBzcHJpdGUuc3ByaXRlRnJhbWUgPSBzcHJpdGVGcmFtZVxuICAgICAgICAgICAgfSlcbiAgICAgICAgfVxuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiDwn5Sn44CQ5paw5aKe44CR5qC85byP5YyW6YeR5biB5pi+56S6XG4gICAgICovXG4gICAgX2Zvcm1hdENvaW46IGZ1bmN0aW9uKGNvaW4pIHtcbiAgICAgICAgaWYgKGNvaW4gPj0gMTAwMDApIHtcbiAgICAgICAgICAgIHJldHVybiAoY29pbiAvIDEwMDAwKS50b0ZpeGVkKDEpICsgXCLkuIdcIlxuICAgICAgICB9XG4gICAgICAgIHJldHVybiBjb2luLnRvU3RyaW5nKClcbiAgICB9LFxuXG4gICAgLy8gPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XG4gICAgLy8g5Yqo55S75pWI5p6cXG4gICAgLy8gPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XG5cbiAgICBfc3RhcnRDaGFtcGlvbkVmZmVjdHM6IGZ1bmN0aW9uKCkge1xuICAgICAgICAvLyDlpZbmna/lvLnot7PliqjnlLtcbiAgICAgICAgaWYgKHRoaXMudHJvcGh5Tm9kZSkge1xuICAgICAgICAgICAgdmFyIGp1bXBVcCA9IGNjLm1vdmVCeSgwLjUsIGNjLnYyKDAsIDEwKSlcbiAgICAgICAgICAgIHZhciBqdW1wRG93biA9IGNjLm1vdmVCeSgwLjUsIGNjLnYyKDAsIC0xMCkpXG4gICAgICAgICAgICB2YXIgc2VxdWVuY2UgPSBjYy5zZXF1ZW5jZShqdW1wVXAsIGp1bXBEb3duKVxuICAgICAgICAgICAgdmFyIHJlcGVhdCA9IGNjLnJlcGVhdEZvcmV2ZXIoc2VxdWVuY2UpXG4gICAgICAgICAgICB0aGlzLnRyb3BoeU5vZGUucnVuQWN0aW9uKHJlcGVhdClcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIOWPkeWFieaViOaenOmXqueDgVxuICAgICAgICBpZiAodGhpcy5jaGFtcGlvbkdsb3dOb2RlKSB7XG4gICAgICAgICAgICB2YXIgZmFkZUluID0gY2MuZmFkZUluKDAuNSlcbiAgICAgICAgICAgIHZhciBmYWRlT3V0ID0gY2MuZmFkZU91dCgwLjUpXG4gICAgICAgICAgICB2YXIgc2VxdWVuY2UgPSBjYy5zZXF1ZW5jZShmYWRlSW4sIGZhZGVPdXQpXG4gICAgICAgICAgICB2YXIgcmVwZWF0ID0gY2MucmVwZWF0Rm9yZXZlcihzZXF1ZW5jZSlcbiAgICAgICAgICAgIHRoaXMuY2hhbXBpb25HbG93Tm9kZS5ydW5BY3Rpb24ocmVwZWF0KVxuICAgICAgICB9XG5cbiAgICAgICAgLy8g5Yag5Yab6IqC54K557yp5pS+5ZG85ZC45pWI5p6cXG4gICAgICAgIGlmICh0aGlzLmNoYW1waW9uTm9kZSkge1xuICAgICAgICAgICAgdmFyIHNjYWxlVXAgPSBjYy5zY2FsZVRvKDAuOCwgMS4wNSlcbiAgICAgICAgICAgIHZhciBzY2FsZURvd24gPSBjYy5zY2FsZVRvKDAuOCwgMS4wKVxuICAgICAgICAgICAgdmFyIHNlcXVlbmNlID0gY2Muc2VxdWVuY2Uoc2NhbGVVcCwgc2NhbGVEb3duKVxuICAgICAgICAgICAgdmFyIHJlcGVhdCA9IGNjLnJlcGVhdEZvcmV2ZXIoc2VxdWVuY2UpXG4gICAgICAgICAgICB0aGlzLmNoYW1waW9uTm9kZS5ydW5BY3Rpb24ocmVwZWF0KVxuICAgICAgICB9XG4gICAgfSxcblxuICAgIF9zdG9wQ2hhbXBpb25FZmZlY3RzOiBmdW5jdGlvbigpIHtcbiAgICAgICAgaWYgKHRoaXMudHJvcGh5Tm9kZSkge1xuICAgICAgICAgICAgdGhpcy50cm9waHlOb2RlLnN0b3BBbGxBY3Rpb25zKClcbiAgICAgICAgfVxuICAgICAgICBpZiAodGhpcy5jaGFtcGlvbkdsb3dOb2RlKSB7XG4gICAgICAgICAgICB0aGlzLmNoYW1waW9uR2xvd05vZGUuc3RvcEFsbEFjdGlvbnMoKVxuICAgICAgICB9XG4gICAgICAgIGlmICh0aGlzLmNoYW1waW9uTm9kZSkge1xuICAgICAgICAgICAgdGhpcy5jaGFtcGlvbk5vZGUuc3RvcEFsbEFjdGlvbnMoKVxuICAgICAgICB9XG4gICAgfSxcblxuICAgIC8vID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxuICAgIC8vIOaMiemSruS6i+S7tlxuICAgIC8vID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxuXG4gICAgb25Db25maXJtQ2xpY2s6IGZ1bmN0aW9uKCkge1xuICAgICAgICBjb25zb2xlLmxvZyhcIvCfj4YgW1RvdXJuYW1lbnRGaW5hbFJhbmtdIOeCueWHu+ehruiupO+8jOi/lOWbnuWkp+WOhVwiKVxuXG4gICAgICAgIC8vIOWBnOatouWKqOeUu1xuICAgICAgICB0aGlzLl9zdG9wQ2hhbXBpb25FZmZlY3RzKClcblxuICAgICAgICAvLyDlhbPpl63lvLnnqpdcbiAgICAgICAgdGhpcy5ub2RlLmRlc3Ryb3koKVxuXG4gICAgICAgIC8vIOi/lOWbnuWkp+WOhVxuICAgICAgICBjYy5kaXJlY3Rvci5sb2FkU2NlbmUoXCJoYWxsU2NlbmVcIilcbiAgICB9LFxuXG4gICAgLy8gPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XG4gICAgLy8g6L6F5Yqp5pa55rOVXG4gICAgLy8gPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XG5cbiAgICBfZ2V0UmFua1RleHQ6IGZ1bmN0aW9uKHJhbmspIHtcbiAgICAgICAgc3dpdGNoIChyYW5rKSB7XG4gICAgICAgICAgICBjYXNlIDE6XG4gICAgICAgICAgICAgICAgcmV0dXJuIFwi8J+lhyDlhqDlhptcIlxuICAgICAgICAgICAgY2FzZSAyOlxuICAgICAgICAgICAgICAgIHJldHVybiBcIvCfpYgg5Lqa5YabXCJcbiAgICAgICAgICAgIGNhc2UgMzpcbiAgICAgICAgICAgICAgICByZXR1cm4gXCLwn6WJIOWto+WGm1wiXG4gICAgICAgICAgICBkZWZhdWx0OlxuICAgICAgICAgICAgICAgIHJldHVybiBcIuesrFwiICsgcmFuayArIFwi5ZCNXCJcbiAgICAgICAgfVxuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiDwn5Sn44CQ5paw5aKe44CR6I635Y+W5py65Zmo5Lq65pi+56S65ZCN56ewXG4gICAgICogQHBhcmFtIHtTdHJpbmd9IHBsYXllcklkIC0g546p5a62SURcbiAgICAgKiBAcGFyYW0ge1N0cmluZ30gb3JpZ2luYWxOYW1lIC0g5Y6f5aeL5pi156ewXG4gICAgICogQHJldHVybnMge1N0cmluZ30g5pi+56S65ZCN56ewXG4gICAgICovXG4gICAgX2dldFJvYm90RGlzcGxheU5hbWU6IGZ1bmN0aW9uKHBsYXllcklkLCBvcmlnaW5hbE5hbWUpIHtcbiAgICAgICAgLy8g5aaC5p6c5Y6f5aeL5ZCN56ew5bey57uP5pivXCLmmbrog73pmarnu4NY5Y+3XCLmoLzlvI/vvIznm7TmjqXov5Tlm55cbiAgICAgICAgaWYgKG9yaWdpbmFsTmFtZSAmJiBvcmlnaW5hbE5hbWUuaW5kZXhPZihcIuaZuuiDvemZque7g1wiKSA9PT0gMCkge1xuICAgICAgICAgICAgcmV0dXJuIG9yaWdpbmFsTmFtZVxuICAgICAgICB9XG4gICAgICAgIFxuICAgICAgICAvLyDlkKbliJnvvIznlJ/miJBcIuaZuuiDvemZque7g1jlj7dcIuagvOW8j+eahOWQjeensFxuICAgICAgICB2YXIgcm9ib3RJbmRleCA9IDFcbiAgICAgICAgaWYgKHBsYXllcklkKSB7XG4gICAgICAgICAgICB2YXIgbGFzdENoYXIgPSBwbGF5ZXJJZC50b1N0cmluZygpLnNsaWNlKC0xKVxuICAgICAgICAgICAgcm9ib3RJbmRleCA9IHBhcnNlSW50KGxhc3RDaGFyKSB8fCAxXG4gICAgICAgIH1cbiAgICAgICAgXG4gICAgICAgIHJldHVybiBcIuaZuuiDvemZque7g1wiICsgcm9ib3RJbmRleCArIFwi5Y+3XCJcbiAgICB9XG59KTtcbiJdfQ==
//------QC-SOURCE-SPLIT------
