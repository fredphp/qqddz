
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

    // 注册按钮事件
    if (this.confirmBtn) {
      this.confirmBtn.node.on('click', this.onConfirmClick, this);
    }
  },
  start: function start() {
    // 启动冠军特效动画
    this._startChampionEffects();
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

    // 更新TOP20列表
    this._updateTop20List();

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
      this.myCoinLabel.string = "最终金币：" + this._myMatchCoin;
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
      rankLabel.getComponent(cc.Label).string = this._getRankText(rank);
    }

    // 🔧【修复】处理机器人昵称显示
    var displayName = data.player_name || "玩家";
    if (data.is_robot) {
      // 机器人显示为“智能陪练X号”
      displayName = this._getRobotDisplayName(data.player_id, data.player_name);
    }

    // 昵称标签
    var nameLabel = node.getChildByName("NameLabel");
    if (nameLabel) {
      nameLabel.getComponent(cc.Label).string = displayName;
    }

    // 金币标签
    var coinLabel = node.getChildByName("CoinLabel");
    if (coinLabel) {
      coinLabel.getComponent(cc.Label).string = data.match_coin || 0;
    }

    // 头像（如果有）
    var avatarSprite = node.getChildByName("AvatarSprite");
    if (avatarSprite) {
      // 🔧【修复】机器人使用默认头像
      if (data.is_robot) {
        // 机器人使用特定头像（如果有的话）
        // cc.resources.load("textures/robot_avatar", ...)
      }
    }

    // 🔧【修复】机器人标识 - 确保显示
    var robotTag = node.getChildByName("RobotTag");
    if (data.is_robot) {
      if (!robotTag) {
        // 创建机器人标签
        robotTag = new cc.Node("RobotTag");
        var label = robotTag.addComponent(cc.Label);
        label.string = "🤖";
        label.fontSize = 20;
        robotTag.setPosition(50, 20);
        node.addChild(robotTag);
      } else {
        robotTag.active = true;
      }
    } else if (robotTag) {
      robotTag.active = false;
    }
    console.log("🏆 [_updatePodiumNode] 排名#" + rank + ": " + displayName + ", 金币=" + data.match_coin + ", 机器人=" + data.is_robot);
  },
  _updateTop20List: function _updateTop20List() {
    if (!this.top20ScrollView || !this.rankItemPrefab) return;
    var content = this.top20ScrollView.content;
    content.removeAllChildren();
    for (var i = 0; i < this._top20.length; i++) {
      var itemData = this._top20[i];
      var item = cc.instantiate(this.rankItemPrefab);

      // 设置item数据
      this._updateRankItem(item, itemData, i + 1);
      content.addChild(item);
    }
  },
  /**
   * 更新排行榜item
   * @param {cc.Node} item - item节点
   * @param {Object} data - 玩家数据
   * @param {number} rank - 排名
   */
  _updateRankItem: function _updateRankItem(item, data, rank) {
    // 排名
    var rankLabel = item.getChildByName("RankLabel");
    if (rankLabel) {
      rankLabel.getComponent(cc.Label).string = this._getRankText(rank);
    }

    // 🔧【修复】处理机器人昵称显示
    var displayName = data.player_name || "玩家";
    if (data.is_robot) {
      displayName = this._getRobotDisplayName(data.player_id, data.player_name);
    }

    // 昵称
    var nameLabel = item.getChildByName("NameLabel");
    if (nameLabel) {
      nameLabel.getComponent(cc.Label).string = displayName;
    }

    // 金币
    var coinLabel = item.getChildByName("CoinLabel");
    if (coinLabel) {
      coinLabel.getComponent(cc.Label).string = data.match_coin || 0;
    }

    // 🔧【修复】机器人标识
    var robotTag = item.getChildByName("RobotTag");
    if (robotTag) {
      robotTag.active = data.is_robot || false;
    }
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
    // 如果原始名称已经是“智能陪练X号”格式，直接返回
    if (originalName && originalName.indexOf("智能陪练") === 0) {
      return originalName;
    }

    // 否则，生成“智能陪练X号”格式的名称
    // 基于playerID生成编号
    var robotIndex = 1;
    if (playerId) {
      // 使用playerID最后一位数字作为编号
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImFzc2V0c1xcc2NyaXB0c1xcZGR6XFx0b3VybmFtZW50XFxUb3VybmFtZW50RmluYWxSYW5rRGlhbG9nLmpzIl0sIm5hbWVzIjpbImNjIiwiQ2xhc3MiLCJDb21wb25lbnQiLCJwcm9wZXJ0aWVzIiwicGVyaW9kTm9MYWJlbCIsInR5cGUiLCJMYWJlbCIsInRvdGFsUGxheWVyc0xhYmVsIiwiY2hhbXBpb25Ob2RlIiwiTm9kZSIsInJ1bm5lclVwTm9kZSIsInRoaXJkUGxhY2VOb2RlIiwidG9wMjBTY3JvbGxWaWV3IiwiU2Nyb2xsVmlldyIsInJhbmtJdGVtUHJlZmFiIiwiUHJlZmFiIiwibXlSYW5rTGFiZWwiLCJteUNvaW5MYWJlbCIsImNvbmZpcm1CdG4iLCJCdXR0b24iLCJ0cm9waHlOb2RlIiwiY2hhbXBpb25HbG93Tm9kZSIsIm9uTG9hZCIsIl9kYXRhIiwiX3RvcDMiLCJfdG9wMjAiLCJfbXlSYW5rIiwiX215TWF0Y2hDb2luIiwibm9kZSIsIm9uIiwib25Db25maXJtQ2xpY2siLCJzdGFydCIsIl9zdGFydENoYW1waW9uRWZmZWN0cyIsInNldERhdGEiLCJkYXRhIiwiY29uc29sZSIsImxvZyIsIkpTT04iLCJzdHJpbmdpZnkiLCJfcGVyaW9kTm8iLCJwZXJpb2Rfbm8iLCJfdG90YWxQbGF5ZXJzIiwidG90YWxfcGxheWVycyIsInRvcDMiLCJ0b3AyMCIsIm15X3JhbmsiLCJteV9tYXRjaF9jb2luIiwiaSIsImxlbmd0aCIsInBsYXllcl9uYW1lIiwibWF0Y2hfY29pbiIsImlzX3JvYm90IiwiX3VwZGF0ZVVJIiwic3RyaW5nIiwiX3VwZGF0ZVRvcDMiLCJfdXBkYXRlVG9wMjBMaXN0IiwiX3VwZGF0ZVBvZGl1bU5vZGUiLCJyYW5rIiwicmFua0xhYmVsIiwiZ2V0Q2hpbGRCeU5hbWUiLCJnZXRDb21wb25lbnQiLCJfZ2V0UmFua1RleHQiLCJkaXNwbGF5TmFtZSIsIl9nZXRSb2JvdERpc3BsYXlOYW1lIiwicGxheWVyX2lkIiwibmFtZUxhYmVsIiwiY29pbkxhYmVsIiwiYXZhdGFyU3ByaXRlIiwicm9ib3RUYWciLCJsYWJlbCIsImFkZENvbXBvbmVudCIsImZvbnRTaXplIiwic2V0UG9zaXRpb24iLCJhZGRDaGlsZCIsImFjdGl2ZSIsImNvbnRlbnQiLCJyZW1vdmVBbGxDaGlsZHJlbiIsIml0ZW1EYXRhIiwiaXRlbSIsImluc3RhbnRpYXRlIiwiX3VwZGF0ZVJhbmtJdGVtIiwianVtcFVwIiwibW92ZUJ5IiwidjIiLCJqdW1wRG93biIsInNlcXVlbmNlIiwicmVwZWF0IiwicmVwZWF0Rm9yZXZlciIsInJ1bkFjdGlvbiIsImZhZGVJbiIsImZhZGVPdXQiLCJzY2FsZVVwIiwic2NhbGVUbyIsInNjYWxlRG93biIsIl9zdG9wQ2hhbXBpb25FZmZlY3RzIiwic3RvcEFsbEFjdGlvbnMiLCJkZXN0cm95IiwiZGlyZWN0b3IiLCJsb2FkU2NlbmUiLCJwbGF5ZXJJZCIsIm9yaWdpbmFsTmFtZSIsImluZGV4T2YiLCJyb2JvdEluZGV4IiwibGFzdENoYXIiLCJ0b1N0cmluZyIsInNsaWNlIiwicGFyc2VJbnQiXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUFBLEVBQUUsQ0FBQ0MsS0FBSyxDQUFDO0VBQ0wsV0FBU0QsRUFBRSxDQUFDRSxTQUFTO0VBRXJCQyxVQUFVLEVBQUU7SUFDUjtJQUNBQyxhQUFhLEVBQUU7TUFDWEMsSUFBSSxFQUFFTCxFQUFFLENBQUNNLEtBQUs7TUFDZCxXQUFTO0lBQ2IsQ0FBQztJQUNEO0lBQ0FDLGlCQUFpQixFQUFFO01BQ2ZGLElBQUksRUFBRUwsRUFBRSxDQUFDTSxLQUFLO01BQ2QsV0FBUztJQUNiLENBQUM7SUFDRDtJQUNBRSxZQUFZLEVBQUU7TUFDVkgsSUFBSSxFQUFFTCxFQUFFLENBQUNTLElBQUk7TUFDYixXQUFTO0lBQ2IsQ0FBQztJQUNEO0lBQ0FDLFlBQVksRUFBRTtNQUNW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RW5CO0lBQ0FoRyxFQUFFLENBQUNpRyxRQUFRLENBQUNDLFNBQVMsQ0FBQyxXQUFXLENBQUM7RUFDdEMsQ0FBQztFQUVEO0VBQ0E7RUFDQTs7RUFFQXJDLFlBQVksRUFBRSxTQUFBQSxhQUFTSixJQUFJLEVBQUU7SUFDekIsUUFBUUEsSUFBSTtNQUNSLEtBQUssQ0FBQztRQUNGLE9BQU8sT0FBTztNQUNsQixLQUFLLENBQUM7UUFDRixPQUFPLE9BQU87TUFDbEIsS0FBSyxDQUFDO1FBQ0YsT0FBTyxPQUFPO01BQ2xCO1FBQ0ksT0FBTyxHQUFHLEdBQUdBLElBQUksR0FBRyxHQUFHO0lBQUE7RUFFbkMsQ0FBQztFQUVEO0FBQ0o7QUFDQTtBQUNBO0FBQ0E7QUFDQTtFQUNJTSxvQkFBb0IsRUFBRSxTQUFBQSxxQkFBU29DLFFBQVEsRUFBRUMsWUFBWSxFQUFFO0lBQ25EO0lBQ0EsSUFBSUEsWUFBWSxJQUFJQSxZQUFZLENBQUNDLE9BQU8sQ0FBQyxNQUFNLENBQUMsS0FBSyxDQUFDLEVBQUU7TUFDcEQsT0FBT0QsWUFBWTtJQUN2Qjs7SUFFQTtJQUNBO0lBQ0EsSUFBSUUsVUFBVSxHQUFHLENBQUM7SUFDbEIsSUFBSUgsUUFBUSxFQUFFO01BQ1Y7TUFDQSxJQUFJSSxRQUFRLEdBQUdKLFFBQVEsQ0FBQ0ssUUFBUSxFQUFFLENBQUNDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQztNQUM1Q0gsVUFBVSxHQUFHSSxRQUFRLENBQUNILFFBQVEsQ0FBQyxJQUFJLENBQUM7SUFDeEM7SUFFQSxPQUFPLE1BQU0sR0FBR0QsVUFBVSxHQUFHLEdBQUc7RUFDcEM7QUFDSixDQUFDLENBQUMiLCJzb3VyY2VSb290IjoiLyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogVG91cm5hbWVudEZpbmFsUmFua0RpYWxvZyAtIOernuaKgOWcuuWGs+i1m+WGoOWGm+aOkuihjOamnOW8ueeql1xuICogXG4gKiDlip/og73vvJpcbiAqIDEuIOaYvuekuuacn+WPt+WSjOavlOi1m+e7k+adn+agh+mimFxuICogMi4g5YmN5LiJ5ZCN6aKG5aWW5Y+w5bGV56S677yI5Yag5Yab5pyA5aSn77yM5bGF5Lit6auY5Lqu77yJXG4gKiAzLiBUT1AyMCBTY3JvbGxWaWV35YiX6KGoXG4gKiA0LiDmmL7npLrmjpLlkI3jgIHlpLTlg4/jgIHmmLXnp7DjgIHmnIDnu4jph5HluIFcbiAqIDUuIOehruiupOaMiemSrui/lOWbnuWkp+WOhVxuICogXG4gKiDorr7orqHpo47moLzvvJrkuK3lm73po47mlpflnLDkuLvnq57mioDlnLogLSDph5HoibIgKyDnuqLoibJcbiAqIOWGoOWGm+eJueaViO+8muWPkeWFieOAgeeykuWtkOOAgeWlluadr+WKqOeUu1xuICovXG5cbmNjLkNsYXNzKHtcbiAgICBleHRlbmRzOiBjYy5Db21wb25lbnQsXG5cbiAgICBwcm9wZXJ0aWVzOiB7XG4gICAgICAgIC8vIOacn+WPt+agh+etvlxuICAgICAgICBwZXJpb2ROb0xhYmVsOiB7XG4gICAgICAgICAgICB0eXBlOiBjYy5MYWJlbCxcbiAgICAgICAgICAgIGRlZmF1bHQ6IG51bGxcbiAgICAgICAgfSxcbiAgICAgICAgLy8g5oC75Y+C6LWb5Lq65pWw5qCH562+XG4gICAgICAgIHRvdGFsUGxheWVyc0xhYmVsOiB7XG4gICAgICAgICAgICB0eXBlOiBjYy5MYWJlbCxcbiAgICAgICAgICAgIGRlZmF1bHQ6IG51bGxcbiAgICAgICAgfSxcbiAgICAgICAgLy8g5Yag5Yab6IqC54K5XG4gICAgICAgIGNoYW1waW9uTm9kZToge1xuICAgICAgICAgICAgdHlwZTogY2MuTm9kZSxcbiAgICAgICAgICAgIGRlZmF1bHQ6IG51bGxcbiAgICAgICAgfSxcbiAgICAgICAgLy8g5Lqa5Yab6IqC54K5XG4gICAgICAgIHJ1bm5lclVwTm9kZToge1xuICAgICAgICAgICAgdHlwZTogY2MuTm9kZSxcbiAgICAgICAgICAgIGRlZmF1bHQ6IG51bGxcbiAgICAgICAgfSxcbiAgICAgICAgLy8g5a2j5Yab6IqC54K5XG4gICAgICAgIHRoaXJkUGxhY2VOb2RlOiB7XG4gICAgICAgICAgICB0eXBlOiBjYy5Ob2RlLFxuICAgICAgICAgICAgZGVmYXVsdDogbnVsbFxuICAgICAgICB9LFxuICAgICAgICAvLyBUT1AyMCBTY3JvbGxWaWV3XG4gICAgICAgIHRvcDIwU2Nyb2xsVmlldzoge1xuICAgICAgICAgICAgdHlwZTogY2MuU2Nyb2xsVmlldyxcbiAgICAgICAgICAgIGRlZmF1bHQ6IG51bGxcbiAgICAgICAgfSxcbiAgICAgICAgLy8g5o6S6KGM5qacaXRlbeaooeadv1xuICAgICAgICByYW5rSXRlbVByZWZhYjoge1xuICAgICAgICAgICAgdHlwZTogY2MuUHJlZmFiLFxuICAgICAgICAgICAgZGVmYXVsdDogbnVsbFxuICAgICAgICB9LFxuICAgICAgICAvLyDmiJHnmoTmjpLlkI3moIfnrb5cbiAgICAgICAgbXlSYW5rTGFiZWw6IHtcbiAgICAgICAgICAgIHR5cGU6IGNjLkxhYmVsLFxuICAgICAgICAgICAgZGVmYXVsdDogbnVsbFxuICAgICAgICB9LFxuICAgICAgICAvLyDmiJHnmoTph5HluIHmoIfnrb5cbiAgICAgICAgbXlDb2luTGFiZWw6IHtcbiAgICAgICAgICAgIHR5cGU6IGNjLkxhYmVsLFxuICAgICAgICAgICAgZGVmYXVsdDogbnVsbFxuICAgICAgICB9LFxuICAgICAgICAvLyDnoa7orqTmjInpkq5cbiAgICAgICAgY29uZmlybUJ0bjoge1xuICAgICAgICAgICAgdHlwZTogY2MuQnV0dG9uLFxuICAgICAgICAgICAgZGVmYXVsdDogbnVsbFxuICAgICAgICB9LFxuICAgICAgICAvLyDlhqDlhpvlpZbmna/oioLngrlcbiAgICAgICAgdHJvcGh5Tm9kZToge1xuICAgICAgICAgICAgdHlwZTogY2MuTm9kZSxcbiAgICAgICAgICAgIGRlZmF1bHQ6IG51bGxcbiAgICAgICAgfSxcbiAgICAgICAgLy8g5Yag5Yab5Y+R5YWJ5pWI5p6c6IqC54K5XG4gICAgICAgIGNoYW1waW9uR2xvd05vZGU6IHtcbiAgICAgICAgICAgIHR5cGU6IGNjLk5vZGUsXG4gICAgICAgICAgICBkZWZhdWx0OiBudWxsXG4gICAgICAgIH1cbiAgICB9LFxuXG4gICAgLy8gTElGRS1DWUNMRSBDQUxMQkFDS1M6XG5cbiAgICBvbkxvYWQgKCkge1xuICAgICAgICAvLyDliJ3lp4vljJbmlbDmja5cbiAgICAgICAgdGhpcy5fZGF0YSA9IG51bGxcbiAgICAgICAgdGhpcy5fdG9wMyA9IFtdXG4gICAgICAgIHRoaXMuX3RvcDIwID0gW11cbiAgICAgICAgdGhpcy5fbXlSYW5rID0gMFxuICAgICAgICB0aGlzLl9teU1hdGNoQ29pbiA9IDBcblxuICAgICAgICAvLyDms6jlhozmjInpkq7kuovku7ZcbiAgICAgICAgaWYgKHRoaXMuY29uZmlybUJ0bikge1xuICAgICAgICAgICAgdGhpcy5jb25maXJtQnRuLm5vZGUub24oJ2NsaWNrJywgdGhpcy5vbkNvbmZpcm1DbGljaywgdGhpcylcbiAgICAgICAgfVxuICAgIH0sXG5cbiAgICBzdGFydCAoKSB7XG4gICAgICAgIC8vIOWQr+WKqOWGoOWGm+eJueaViOWKqOeUu1xuICAgICAgICB0aGlzLl9zdGFydENoYW1waW9uRWZmZWN0cygpXG4gICAgfSxcblxuICAgIC8vID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxuICAgIC8vIOWFrOWFseaWueazlVxuICAgIC8vID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxuXG4gICAgLyoqXG4gICAgICog6K6+572u5pWw5o2uXG4gICAgICogQHBhcmFtIHtPYmplY3R9IGRhdGEgLSB7IHBlcmlvZF9ubywgdG90YWxfcGxheWVycywgdG9wMywgdG9wMjAsIG15X3JhbmssIG15X21hdGNoX2NvaW4gfVxuICAgICAqL1xuICAgIHNldERhdGE6IGZ1bmN0aW9uKGRhdGEpIHtcbiAgICAgICAgY29uc29sZS5sb2coXCLwn4+GIFtUb3VybmFtZW50RmluYWxSYW5rRGlhbG9nXSDmlLbliLDmlbDmja46XCIsIEpTT04uc3RyaW5naWZ5KGRhdGEpKVxuICAgICAgICBcbiAgICAgICAgdGhpcy5fZGF0YSA9IGRhdGFcbiAgICAgICAgdGhpcy5fcGVyaW9kTm8gPSBkYXRhLnBlcmlvZF9ubyB8fCBcIlwiXG4gICAgICAgIHRoaXMuX3RvdGFsUGxheWVycyA9IGRhdGEudG90YWxfcGxheWVycyB8fCAwXG4gICAgICAgIHRoaXMuX3RvcDMgPSBkYXRhLnRvcDMgfHwgW11cbiAgICAgICAgdGhpcy5fdG9wMjAgPSBkYXRhLnRvcDIwIHx8IFtdXG4gICAgICAgIHRoaXMuX215UmFuayA9IGRhdGEubXlfcmFuayB8fCAwXG4gICAgICAgIHRoaXMuX215TWF0Y2hDb2luID0gZGF0YS5teV9tYXRjaF9jb2luIHx8IDBcblxuICAgICAgICAvLyDwn5Sn44CQ6LCD6K+V44CR5omT5Y2wVE9QM+aVsOaNrlxuICAgICAgICBjb25zb2xlLmxvZyhcIvCfj4YgW1RvdXJuYW1lbnRGaW5hbFJhbmtEaWFsb2ddIFRPUDPmlbDmja46XCIpXG4gICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgdGhpcy5fdG9wMy5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgY29uc29sZS5sb2coXCIgICNcIiArIChpKzEpICsgXCI6XCIsIHRoaXMuX3RvcDNbaV0ucGxheWVyX25hbWUsIFwi6YeR5biBOlwiLCB0aGlzLl90b3AzW2ldLm1hdGNoX2NvaW4sIFwi5py65Zmo5Lq6OlwiLCB0aGlzLl90b3AzW2ldLmlzX3JvYm90KVxuICAgICAgICB9XG5cbiAgICAgICAgdGhpcy5fdXBkYXRlVUkoKVxuICAgIH0sXG5cbiAgICAvLyA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cbiAgICAvLyBVSeabtOaWsFxuICAgIC8vID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxuXG4gICAgX3VwZGF0ZVVJOiBmdW5jdGlvbigpIHtcbiAgICAgICAgLy8g5pu05paw5pyf5Y+3XG4gICAgICAgIGlmICh0aGlzLnBlcmlvZE5vTGFiZWwpIHtcbiAgICAgICAgICAgIHRoaXMucGVyaW9kTm9MYWJlbC5zdHJpbmcgPSBcIuesrFwiICsgdGhpcy5fcGVyaW9kTm8gKyBcIuacn+i1m+S6i+e7k+adn1wiXG4gICAgICAgIH1cblxuICAgICAgICAvLyDmm7TmlrDmgLvlj4LotZvkurrmlbBcbiAgICAgICAgaWYgKHRoaXMudG90YWxQbGF5ZXJzTGFiZWwpIHtcbiAgICAgICAgICAgIHRoaXMudG90YWxQbGF5ZXJzTGFiZWwuc3RyaW5nID0gXCLlhbFcIiArIHRoaXMuX3RvdGFsUGxheWVycyArIFwi5Lq65Y+C6LWbXCJcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIOabtOaWsOWJjeS4ieWQjVxuICAgICAgICB0aGlzLl91cGRhdGVUb3AzKClcblxuICAgICAgICAvLyDmm7TmlrBUT1AyMOWIl+ihqFxuICAgICAgICB0aGlzLl91cGRhdGVUb3AyMExpc3QoKVxuXG4gICAgICAgIC8vIOabtOaWsOaIkeeahOaOkuWQjVxuICAgICAgICBpZiAodGhpcy5teVJhbmtMYWJlbCkge1xuICAgICAgICAgICAgaWYgKHRoaXMuX215UmFuayA+IDApIHtcbiAgICAgICAgICAgICAgICB0aGlzLm15UmFua0xhYmVsLnN0cmluZyA9IFwi5oiR55qE5o6S5ZCN77ya56ysXCIgKyB0aGlzLl9teVJhbmsgKyBcIuWQjVwiXG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIHRoaXMubXlSYW5rTGFiZWwuc3RyaW5nID0gXCLmiJHnmoTmjpLlkI3vvJrmnKrkuIrmppxcIlxuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgLy8g5pu05paw5oiR55qE6YeR5biBXG4gICAgICAgIGlmICh0aGlzLm15Q29pbkxhYmVsKSB7XG4gICAgICAgICAgICB0aGlzLm15Q29pbkxhYmVsLnN0cmluZyA9IFwi5pyA57uI6YeR5biB77yaXCIgKyB0aGlzLl9teU1hdGNoQ29pblxuICAgICAgICB9XG4gICAgfSxcblxuICAgIF91cGRhdGVUb3AzOiBmdW5jdGlvbigpIHtcbiAgICAgICAgLy8g5pu05paw5Yag5YabXG4gICAgICAgIGlmICh0aGlzLl90b3AzLmxlbmd0aCA+PSAxICYmIHRoaXMuY2hhbXBpb25Ob2RlKSB7XG4gICAgICAgICAgICB0aGlzLl91cGRhdGVQb2RpdW1Ob2RlKHRoaXMuY2hhbXBpb25Ob2RlLCB0aGlzLl90b3AzWzBdLCAxKVxuICAgICAgICB9XG5cbiAgICAgICAgLy8g5pu05paw5Lqa5YabXG4gICAgICAgIGlmICh0aGlzLl90b3AzLmxlbmd0aCA+PSAyICYmIHRoaXMucnVubmVyVXBOb2RlKSB7XG4gICAgICAgICAgICB0aGlzLl91cGRhdGVQb2RpdW1Ob2RlKHRoaXMucnVubmVyVXBOb2RlLCB0aGlzLl90b3AzWzFdLCAyKVxuICAgICAgICB9XG5cbiAgICAgICAgLy8g5pu05paw5a2j5YabXG4gICAgICAgIGlmICh0aGlzLl90b3AzLmxlbmd0aCA+PSAzICYmIHRoaXMudGhpcmRQbGFjZU5vZGUpIHtcbiAgICAgICAgICAgIHRoaXMuX3VwZGF0ZVBvZGl1bU5vZGUodGhpcy50aGlyZFBsYWNlTm9kZSwgdGhpcy5fdG9wM1syXSwgMylcbiAgICAgICAgfVxuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiDmm7TmlrDpooblpZblj7DoioLngrlcbiAgICAgKiBAcGFyYW0ge2NjLk5vZGV9IG5vZGUgLSDpooblpZblj7DoioLngrlcbiAgICAgKiBAcGFyYW0ge09iamVjdH0gZGF0YSAtIOeOqeWutuaVsOaNriB7IHBsYXllcl9uYW1lLCBtYXRjaF9jb2luLCBhdmF0YXIsIGlzX3JvYm90LCBwbGF5ZXJfaWQgfVxuICAgICAqIEBwYXJhbSB7bnVtYmVyfSByYW5rIC0g5o6S5ZCNXG4gICAgICovXG4gICAgX3VwZGF0ZVBvZGl1bU5vZGU6IGZ1bmN0aW9uKG5vZGUsIGRhdGEsIHJhbmspIHtcbiAgICAgICAgLy8g5ZCN5qyh5qCH562+XG4gICAgICAgIHZhciByYW5rTGFiZWwgPSBub2RlLmdldENoaWxkQnlOYW1lKFwiUmFua0xhYmVsXCIpXG4gICAgICAgIGlmIChyYW5rTGFiZWwpIHtcbiAgICAgICAgICAgIHJhbmtMYWJlbC5nZXRDb21wb25lbnQoY2MuTGFiZWwpLnN0cmluZyA9IHRoaXMuX2dldFJhbmtUZXh0KHJhbmspXG4gICAgICAgIH1cblxuICAgICAgICAvLyDwn5Sn44CQ5L+u5aSN44CR5aSE55CG5py65Zmo5Lq65pi156ew5pi+56S6XG4gICAgICAgIHZhciBkaXNwbGF5TmFtZSA9IGRhdGEucGxheWVyX25hbWUgfHwgXCLnjqnlrrZcIlxuICAgICAgICBpZiAoZGF0YS5pc19yb2JvdCkge1xuICAgICAgICAgICAgLy8g5py65Zmo5Lq65pi+56S65Li64oCc5pm66IO96Zmq57uDWOWPt+KAnVxuICAgICAgICAgICAgZGlzcGxheU5hbWUgPSB0aGlzLl9nZXRSb2JvdERpc3BsYXlOYW1lKGRhdGEucGxheWVyX2lkLCBkYXRhLnBsYXllcl9uYW1lKVxuICAgICAgICB9XG5cbiAgICAgICAgLy8g5pi156ew5qCH562+XG4gICAgICAgIHZhciBuYW1lTGFiZWwgPSBub2RlLmdldENoaWxkQnlOYW1lKFwiTmFtZUxhYmVsXCIpXG4gICAgICAgIGlmIChuYW1lTGFiZWwpIHtcbiAgICAgICAgICAgIG5hbWVMYWJlbC5nZXRDb21wb25lbnQoY2MuTGFiZWwpLnN0cmluZyA9IGRpc3BsYXlOYW1lXG4gICAgICAgIH1cblxuICAgICAgICAvLyDph5HluIHmoIfnrb5cbiAgICAgICAgdmFyIGNvaW5MYWJlbCA9IG5vZGUuZ2V0Q2hpbGRCeU5hbWUoXCJDb2luTGFiZWxcIilcbiAgICAgICAgaWYgKGNvaW5MYWJlbCkge1xuICAgICAgICAgICAgY29pbkxhYmVsLmdldENvbXBvbmVudChjYy5MYWJlbCkuc3RyaW5nID0gZGF0YS5tYXRjaF9jb2luIHx8IDBcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIOWktOWDj++8iOWmguaenOacie+8iVxuICAgICAgICB2YXIgYXZhdGFyU3ByaXRlID0gbm9kZS5nZXRDaGlsZEJ5TmFtZShcIkF2YXRhclNwcml0ZVwiKVxuICAgICAgICBpZiAoYXZhdGFyU3ByaXRlKSB7XG4gICAgICAgICAgICAvLyDwn5Sn44CQ5L+u5aSN44CR5py65Zmo5Lq65L2/55So6buY6K6k5aS05YOPXG4gICAgICAgICAgICBpZiAoZGF0YS5pc19yb2JvdCkge1xuICAgICAgICAgICAgICAgIC8vIOacuuWZqOS6uuS9v+eUqOeJueWumuWktOWDj++8iOWmguaenOacieeahOivne+8iVxuICAgICAgICAgICAgICAgIC8vIGNjLnJlc291cmNlcy5sb2FkKFwidGV4dHVyZXMvcm9ib3RfYXZhdGFyXCIsIC4uLilcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIC8vIPCflKfjgJDkv67lpI3jgJHmnLrlmajkurrmoIfor4YgLSDnoa7kv53mmL7npLpcbiAgICAgICAgdmFyIHJvYm90VGFnID0gbm9kZS5nZXRDaGlsZEJ5TmFtZShcIlJvYm90VGFnXCIpXG4gICAgICAgIGlmIChkYXRhLmlzX3JvYm90KSB7XG4gICAgICAgICAgICBpZiAoIXJvYm90VGFnKSB7XG4gICAgICAgICAgICAgICAgLy8g5Yib5bu65py65Zmo5Lq65qCH562+XG4gICAgICAgICAgICAgICAgcm9ib3RUYWcgPSBuZXcgY2MuTm9kZShcIlJvYm90VGFnXCIpXG4gICAgICAgICAgICAgICAgdmFyIGxhYmVsID0gcm9ib3RUYWcuYWRkQ29tcG9uZW50KGNjLkxhYmVsKVxuICAgICAgICAgICAgICAgIGxhYmVsLnN0cmluZyA9IFwi8J+kllwiXG4gICAgICAgICAgICAgICAgbGFiZWwuZm9udFNpemUgPSAyMFxuICAgICAgICAgICAgICAgIHJvYm90VGFnLnNldFBvc2l0aW9uKDUwLCAyMClcbiAgICAgICAgICAgICAgICBub2RlLmFkZENoaWxkKHJvYm90VGFnKVxuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICByb2JvdFRhZy5hY3RpdmUgPSB0cnVlXG4gICAgICAgICAgICB9XG4gICAgICAgIH0gZWxzZSBpZiAocm9ib3RUYWcpIHtcbiAgICAgICAgICAgIHJvYm90VGFnLmFjdGl2ZSA9IGZhbHNlXG4gICAgICAgIH1cbiAgICAgICAgXG4gICAgICAgIGNvbnNvbGUubG9nKFwi8J+PhiBbX3VwZGF0ZVBvZGl1bU5vZGVdIOaOkuWQjSNcIiArIHJhbmsgKyBcIjogXCIgKyBkaXNwbGF5TmFtZSArIFwiLCDph5HluIE9XCIgKyBkYXRhLm1hdGNoX2NvaW4gKyBcIiwg5py65Zmo5Lq6PVwiICsgZGF0YS5pc19yb2JvdClcbiAgICB9LFxuXG4gICAgX3VwZGF0ZVRvcDIwTGlzdDogZnVuY3Rpb24oKSB7XG4gICAgICAgIGlmICghdGhpcy50b3AyMFNjcm9sbFZpZXcgfHwgIXRoaXMucmFua0l0ZW1QcmVmYWIpIHJldHVyblxuXG4gICAgICAgIHZhciBjb250ZW50ID0gdGhpcy50b3AyMFNjcm9sbFZpZXcuY29udGVudFxuICAgICAgICBjb250ZW50LnJlbW92ZUFsbENoaWxkcmVuKClcblxuICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IHRoaXMuX3RvcDIwLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICB2YXIgaXRlbURhdGEgPSB0aGlzLl90b3AyMFtpXVxuICAgICAgICAgICAgdmFyIGl0ZW0gPSBjYy5pbnN0YW50aWF0ZSh0aGlzLnJhbmtJdGVtUHJlZmFiKVxuICAgICAgICAgICAgXG4gICAgICAgICAgICAvLyDorr7nva5pdGVt5pWw5o2uXG4gICAgICAgICAgICB0aGlzLl91cGRhdGVSYW5rSXRlbShpdGVtLCBpdGVtRGF0YSwgaSArIDEpXG4gICAgICAgICAgICBcbiAgICAgICAgICAgIGNvbnRlbnQuYWRkQ2hpbGQoaXRlbSlcbiAgICAgICAgfVxuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiDmm7TmlrDmjpLooYzmppxpdGVtXG4gICAgICogQHBhcmFtIHtjYy5Ob2RlfSBpdGVtIC0gaXRlbeiKgueCuVxuICAgICAqIEBwYXJhbSB7T2JqZWN0fSBkYXRhIC0g546p5a625pWw5o2uXG4gICAgICogQHBhcmFtIHtudW1iZXJ9IHJhbmsgLSDmjpLlkI1cbiAgICAgKi9cbiAgICBfdXBkYXRlUmFua0l0ZW06IGZ1bmN0aW9uKGl0ZW0sIGRhdGEsIHJhbmspIHtcbiAgICAgICAgLy8g5o6S5ZCNXG4gICAgICAgIHZhciByYW5rTGFiZWwgPSBpdGVtLmdldENoaWxkQnlOYW1lKFwiUmFua0xhYmVsXCIpXG4gICAgICAgIGlmIChyYW5rTGFiZWwpIHtcbiAgICAgICAgICAgIHJhbmtMYWJlbC5nZXRDb21wb25lbnQoY2MuTGFiZWwpLnN0cmluZyA9IHRoaXMuX2dldFJhbmtUZXh0KHJhbmspXG4gICAgICAgIH1cblxuICAgICAgICAvLyDwn5Sn44CQ5L+u5aSN44CR5aSE55CG5py65Zmo5Lq65pi156ew5pi+56S6XG4gICAgICAgIHZhciBkaXNwbGF5TmFtZSA9IGRhdGEucGxheWVyX25hbWUgfHwgXCLnjqnlrrZcIlxuICAgICAgICBpZiAoZGF0YS5pc19yb2JvdCkge1xuICAgICAgICAgICAgZGlzcGxheU5hbWUgPSB0aGlzLl9nZXRSb2JvdERpc3BsYXlOYW1lKGRhdGEucGxheWVyX2lkLCBkYXRhLnBsYXllcl9uYW1lKVxuICAgICAgICB9XG5cbiAgICAgICAgLy8g5pi156ewXG4gICAgICAgIHZhciBuYW1lTGFiZWwgPSBpdGVtLmdldENoaWxkQnlOYW1lKFwiTmFtZUxhYmVsXCIpXG4gICAgICAgIGlmIChuYW1lTGFiZWwpIHtcbiAgICAgICAgICAgIG5hbWVMYWJlbC5nZXRDb21wb25lbnQoY2MuTGFiZWwpLnN0cmluZyA9IGRpc3BsYXlOYW1lXG4gICAgICAgIH1cblxuICAgICAgICAvLyDph5HluIFcbiAgICAgICAgdmFyIGNvaW5MYWJlbCA9IGl0ZW0uZ2V0Q2hpbGRCeU5hbWUoXCJDb2luTGFiZWxcIilcbiAgICAgICAgaWYgKGNvaW5MYWJlbCkge1xuICAgICAgICAgICAgY29pbkxhYmVsLmdldENvbXBvbmVudChjYy5MYWJlbCkuc3RyaW5nID0gZGF0YS5tYXRjaF9jb2luIHx8IDBcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIPCflKfjgJDkv67lpI3jgJHmnLrlmajkurrmoIfor4ZcbiAgICAgICAgdmFyIHJvYm90VGFnID0gaXRlbS5nZXRDaGlsZEJ5TmFtZShcIlJvYm90VGFnXCIpXG4gICAgICAgIGlmIChyb2JvdFRhZykge1xuICAgICAgICAgICAgcm9ib3RUYWcuYWN0aXZlID0gZGF0YS5pc19yb2JvdCB8fCBmYWxzZVxuICAgICAgICB9XG4gICAgfSxcblxuICAgIC8vID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxuICAgIC8vIOWKqOeUu+aViOaenFxuICAgIC8vID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxuXG4gICAgX3N0YXJ0Q2hhbXBpb25FZmZlY3RzOiBmdW5jdGlvbigpIHtcbiAgICAgICAgLy8g5aWW5p2v5by56Lez5Yqo55S7XG4gICAgICAgIGlmICh0aGlzLnRyb3BoeU5vZGUpIHtcbiAgICAgICAgICAgIHZhciBqdW1wVXAgPSBjYy5tb3ZlQnkoMC41LCBjYy52MigwLCAxMCkpXG4gICAgICAgICAgICB2YXIganVtcERvd24gPSBjYy5tb3ZlQnkoMC41LCBjYy52MigwLCAtMTApKVxuICAgICAgICAgICAgdmFyIHNlcXVlbmNlID0gY2Muc2VxdWVuY2UoanVtcFVwLCBqdW1wRG93bilcbiAgICAgICAgICAgIHZhciByZXBlYXQgPSBjYy5yZXBlYXRGb3JldmVyKHNlcXVlbmNlKVxuICAgICAgICAgICAgdGhpcy50cm9waHlOb2RlLnJ1bkFjdGlvbihyZXBlYXQpXG4gICAgICAgIH1cblxuICAgICAgICAvLyDlj5HlhYnmlYjmnpzpl6rng4FcbiAgICAgICAgaWYgKHRoaXMuY2hhbXBpb25HbG93Tm9kZSkge1xuICAgICAgICAgICAgdmFyIGZhZGVJbiA9IGNjLmZhZGVJbigwLjUpXG4gICAgICAgICAgICB2YXIgZmFkZU91dCA9IGNjLmZhZGVPdXQoMC41KVxuICAgICAgICAgICAgdmFyIHNlcXVlbmNlID0gY2Muc2VxdWVuY2UoZmFkZUluLCBmYWRlT3V0KVxuICAgICAgICAgICAgdmFyIHJlcGVhdCA9IGNjLnJlcGVhdEZvcmV2ZXIoc2VxdWVuY2UpXG4gICAgICAgICAgICB0aGlzLmNoYW1waW9uR2xvd05vZGUucnVuQWN0aW9uKHJlcGVhdClcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIOWGoOWGm+iKgueCuee8qeaUvuWRvOWQuOaViOaenFxuICAgICAgICBpZiAodGhpcy5jaGFtcGlvbk5vZGUpIHtcbiAgICAgICAgICAgIHZhciBzY2FsZVVwID0gY2Muc2NhbGVUbygwLjgsIDEuMDUpXG4gICAgICAgICAgICB2YXIgc2NhbGVEb3duID0gY2Muc2NhbGVUbygwLjgsIDEuMClcbiAgICAgICAgICAgIHZhciBzZXF1ZW5jZSA9IGNjLnNlcXVlbmNlKHNjYWxlVXAsIHNjYWxlRG93bilcbiAgICAgICAgICAgIHZhciByZXBlYXQgPSBjYy5yZXBlYXRGb3JldmVyKHNlcXVlbmNlKVxuICAgICAgICAgICAgdGhpcy5jaGFtcGlvbk5vZGUucnVuQWN0aW9uKHJlcGVhdClcbiAgICAgICAgfVxuICAgIH0sXG5cbiAgICBfc3RvcENoYW1waW9uRWZmZWN0czogZnVuY3Rpb24oKSB7XG4gICAgICAgIGlmICh0aGlzLnRyb3BoeU5vZGUpIHtcbiAgICAgICAgICAgIHRoaXMudHJvcGh5Tm9kZS5zdG9wQWxsQWN0aW9ucygpXG4gICAgICAgIH1cbiAgICAgICAgaWYgKHRoaXMuY2hhbXBpb25HbG93Tm9kZSkge1xuICAgICAgICAgICAgdGhpcy5jaGFtcGlvbkdsb3dOb2RlLnN0b3BBbGxBY3Rpb25zKClcbiAgICAgICAgfVxuICAgICAgICBpZiAodGhpcy5jaGFtcGlvbk5vZGUpIHtcbiAgICAgICAgICAgIHRoaXMuY2hhbXBpb25Ob2RlLnN0b3BBbGxBY3Rpb25zKClcbiAgICAgICAgfVxuICAgIH0sXG5cbiAgICAvLyA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cbiAgICAvLyDmjInpkq7kuovku7ZcbiAgICAvLyA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cblxuICAgIG9uQ29uZmlybUNsaWNrOiBmdW5jdGlvbigpIHtcbiAgICAgICAgY29uc29sZS5sb2coXCLwn4+GIFtUb3VybmFtZW50RmluYWxSYW5rXSDngrnlh7vnoa7orqTvvIzov5Tlm57lpKfljoVcIilcblxuICAgICAgICAvLyDlgZzmraLliqjnlLtcbiAgICAgICAgdGhpcy5fc3RvcENoYW1waW9uRWZmZWN0cygpXG5cbiAgICAgICAgLy8g5YWz6Zet5by556qXXG4gICAgICAgIHRoaXMubm9kZS5kZXN0cm95KClcblxuICAgICAgICAvLyDov5Tlm57lpKfljoVcbiAgICAgICAgY2MuZGlyZWN0b3IubG9hZFNjZW5lKFwiaGFsbFNjZW5lXCIpXG4gICAgfSxcblxuICAgIC8vID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxuICAgIC8vIOi+heWKqeaWueazlVxuICAgIC8vID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxuXG4gICAgX2dldFJhbmtUZXh0OiBmdW5jdGlvbihyYW5rKSB7XG4gICAgICAgIHN3aXRjaCAocmFuaykge1xuICAgICAgICAgICAgY2FzZSAxOlxuICAgICAgICAgICAgICAgIHJldHVybiBcIvCfpYcg5Yag5YabXCJcbiAgICAgICAgICAgIGNhc2UgMjpcbiAgICAgICAgICAgICAgICByZXR1cm4gXCLwn6WIIOS6muWGm1wiXG4gICAgICAgICAgICBjYXNlIDM6XG4gICAgICAgICAgICAgICAgcmV0dXJuIFwi8J+liSDlraPlhptcIlxuICAgICAgICAgICAgZGVmYXVsdDpcbiAgICAgICAgICAgICAgICByZXR1cm4gXCLnrKxcIiArIHJhbmsgKyBcIuWQjVwiXG4gICAgICAgIH1cbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICog8J+Up+OAkOaWsOWinuOAkeiOt+WPluacuuWZqOS6uuaYvuekuuWQjeensFxuICAgICAqIEBwYXJhbSB7U3RyaW5nfSBwbGF5ZXJJZCAtIOeOqeWutklEXG4gICAgICogQHBhcmFtIHtTdHJpbmd9IG9yaWdpbmFsTmFtZSAtIOWOn+Wni+aYteensFxuICAgICAqIEByZXR1cm5zIHtTdHJpbmd9IOaYvuekuuWQjeensFxuICAgICAqL1xuICAgIF9nZXRSb2JvdERpc3BsYXlOYW1lOiBmdW5jdGlvbihwbGF5ZXJJZCwgb3JpZ2luYWxOYW1lKSB7XG4gICAgICAgIC8vIOWmguaenOWOn+Wni+WQjeensOW3sue7j+aYr+KAnOaZuuiDvemZque7g1jlj7figJ3moLzlvI/vvIznm7TmjqXov5Tlm55cbiAgICAgICAgaWYgKG9yaWdpbmFsTmFtZSAmJiBvcmlnaW5hbE5hbWUuaW5kZXhPZihcIuaZuuiDvemZque7g1wiKSA9PT0gMCkge1xuICAgICAgICAgICAgcmV0dXJuIG9yaWdpbmFsTmFtZVxuICAgICAgICB9XG4gICAgICAgIFxuICAgICAgICAvLyDlkKbliJnvvIznlJ/miJDigJzmmbrog73pmarnu4NY5Y+34oCd5qC85byP55qE5ZCN56ewXG4gICAgICAgIC8vIOWfuuS6jnBsYXllcklE55Sf5oiQ57yW5Y+3XG4gICAgICAgIHZhciByb2JvdEluZGV4ID0gMVxuICAgICAgICBpZiAocGxheWVySWQpIHtcbiAgICAgICAgICAgIC8vIOS9v+eUqHBsYXllcklE5pyA5ZCO5LiA5L2N5pWw5a2X5L2c5Li657yW5Y+3XG4gICAgICAgICAgICB2YXIgbGFzdENoYXIgPSBwbGF5ZXJJZC50b1N0cmluZygpLnNsaWNlKC0xKVxuICAgICAgICAgICAgcm9ib3RJbmRleCA9IHBhcnNlSW50KGxhc3RDaGFyKSB8fCAxXG4gICAgICAgIH1cbiAgICAgICAgXG4gICAgICAgIHJldHVybiBcIuaZuuiDvemZque7g1wiICsgcm9ib3RJbmRleCArIFwi5Y+3XCJcbiAgICB9XG59KTtcbiJdfQ==
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

    // 加载并显示最终榜单弹窗
    var self = this;
    cc.resources.load("prefabs/tournament/TournamentFinalRankDialog", function (err, prefab) {
      if (err) {
        console.error("加载最终榜单弹窗失败:", err);
        return;
      }
      var dialog = cc.instantiate(prefab);
      self.node.addChild(dialog);

      // 设置数据
      var dialogComp = dialog.getComponent("TournamentFinalRankDialog");
      if (dialogComp) {
        dialogComp.setData(data);
      }
    });
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImFzc2V0c1xcc2NyaXB0c1xcZGR6XFx0b3VybmFtZW50XFxUb3VybmFtZW50V2FpdGluZ1NjZW5lLmpzIl0sIm5hbWVzIjpbIlRvdXJuYW1lbnRTdGF0dXMiLCJXQUlUSU5HIiwiQ0FMQ1VMQVRJTkciLCJNQVRDSElORyIsImNjIiwiQ2xhc3MiLCJDb21wb25lbnQiLCJwcm9wZXJ0aWVzIiwicGVyaW9kTm9MYWJlbCIsInR5cGUiLCJMYWJlbCIsInJvdW5kTGFiZWwiLCJwcm9ncmVzc0xhYmVsIiwicHJvZ3Jlc3NCYXIiLCJQcm9ncmVzc0JhciIsInRpcExhYmVsIiwic3RhdHVzTGFiZWwiLCJsb2FkaW5nTm9kZSIsIk5vZGUiLCJwb2tlclNwcml0ZSIsIlNwcml0ZSIsIm9uTG9hZCIsIl9wZXJpb2RObyIsIl9yb3VuZCIsIl90b3RhbFJvdW5kcyIsIl9maW5pc2hlZFRhYmxlcyIsIl90b3RhbFRhYmxlcyIsIl9pc1dhaXRpbmciLCJfc3RhdHVzIiwiX3JlZ2lzdGVyRXZlbnRzIiwic3RhcnQiLCJfc3RhcnRMb2FkaW5nQW5pbWF0aW9uIiwib25EZXN0cm95IiwiX3VucmVnaXN0ZXJFdmVudHMiLCJzZWxmIiwid2luZG93Iiwic29ja2V0Q3RyIiwib25Ub3VybmFtZW50V2FpdFByb2dyZXNzIiwiZGF0YSIsIl9vbldhaXRQcm9ncmVzcyIsIm9uVG91cm5hbWVudFJvdW5kQWR2YW5jZSIsIl9vblJvdW5kQWR2YW5jZSIsIm9uVG91cm5hbWVudEZpbmFsUmFuayIsIl9vbkZpbmFsUmFuayIsInNldERhdGEiLCJwZXJpb2Rfbm8iLCJyb3VuZCIsInRvdGFsX3JvdW5kcyIsImZpbmlzaGVkX3RhYmxlcyIsInRvdGFsX3RhYmxlcyIsInN0YXR1cyIsIl91cGRhdGVVSSIsInVwZGF0ZVByb2dyZXNzIiwiZmluaXNoZWRUYWJsZXMiLCJfdXBkYXRlUHJvZ3Jlc3NVSSIsImNvbnNvbGUiLCJsb2ciLCJKU09OIiwic3RyaW5naWZ5IiwibmV3X3JvdW5kIiwic3RyaW5nIiwibWVzc2FnZSIsIl9wbGF5Um91bmRDaGFuZ2VBbmltYXRpb24iLCJfc2hvd0ZpbmFsUmFua0RpYWxvZyIsIl91cGRhdGVTdGF0dXNVSSIsInByb2dyZXNzIiwiTWF0aCIsIm1pbiIsInJlbWFpbmluZyIsIm5vZGUiLCJjb2xvciIsIkNvbG9yIiwicm90YXRlQWN0aW9uIiwicm90YXRlQnkiLCJyZXBlYXRBY3Rpb24iLCJyZXBlYXRGb3JldmVyIiwicnVuQWN0aW9uIiwiX3N0b3BMb2FkaW5nQW5pbWF0aW9uIiwic3RvcEFsbEFjdGlvbnMiLCJzY2FsZVVwIiwic2NhbGVUbyIsInNjYWxlRG93biIsInNlcXVlbmNlIiwicmVzb3VyY2VzIiwibG9hZCIsImVyciIsInByZWZhYiIsImVycm9yIiwiZGlhbG9nIiwiaW5zdGFudGlhdGUiLCJhZGRDaGlsZCIsImRpYWxvZ0NvbXAiLCJnZXRDb21wb25lbnQiLCJvbkJhY2tUb0hhbGxDbGljayIsImRpcmVjdG9yIiwibG9hZFNjZW5lIl0sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7OztBQUFBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBLElBQU1BLGdCQUFnQixHQUFHO0VBQ3JCQyxPQUFPLEVBQUUsU0FBUztFQUNsQkMsV0FBVyxFQUFFLGFBQWE7RUFDMUJDLFFBQVEsRUFBRTtBQUNkLENBQUM7QUFFREMsRUFBRSxDQUFDQyxLQUFLLENBQUM7RUFDTCxXQUFTRCxFQUFFLENBQUNFLFNBQVM7RUFFckJDLFVBQVUsRUFBRTtJQUNSO0lBQ0FDLGFBQWEsRUFBRTtNQUNYQyxJQUFJLEVBQUVMLEVBQUUsQ0FBQ00sS0FBSztNQUNkLFdBQVM7SUFDYixDQUFDO0lBQ0Q7SUFDQUMsVUFBVSxFQUFFO01BQ1JGLElBQUksRUFBRUwsRUFBRSxDQUFDTSxLQUFLO01BQ2QsV0FBUztJQUNiLENBQUM7SUFDRDtJQUNBRSxhQUFhLEVBQUU7TUFDWEgsSUFBSSxFQUFFTCxFQUFFLENBQUNNLEtB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QTs7RUFFQXVELGlCQUFpQixFQUFFLFNBQUFBLGtCQUFBLEVBQVc7SUFDMUI7SUFDQXpGLEVBQUUsQ0FBQzBGLFFBQVEsQ0FBQ0MsU0FBUyxDQUFDLFdBQVcsQ0FBQztFQUN0QztBQUNKLENBQUMsQ0FBQyIsInNvdXJjZVJvb3QiOiIvIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBUb3VybmFtZW50V2FpdGluZ1NjZW5lIC0g56ue5oqA5Zy65aSa5qGM562J5b6F6aG1XG4gKiBcbiAqIOWKn+iDve+8mlxuICogMS4g5pi+56S65pyf5Y+344CB6L2u5qyh5L+h5oGvXG4gKiAyLiDlrp7ml7bmmL7npLrlrozmiJDov5vluqbvvIjlt7LlrozmiJDmoYzmlbAv5oC75qGM5pWw77yJXG4gKiAzLiDmiZHlhYvniYxsb2FkaW5n5Yqo55S7XG4gKiA0LiDmjqXmlLbmnI3liqHnq6/ov5vluqbmm7TmlrBcbiAqIDUuIOS4ieenjeeKtuaAgeaPkOekuu+8mldBSVRJTkcgLyBDQUxDVUxBVElORyAvIE1BVENISU5HXG4gKiBcbiAqIOiuvuiuoemjjuagvO+8muS4reWbvemjjuaWl+WcsOS4u+ernuaKgOWcuiAtIOiTnemHkeiJslxuICovXG5cbi8vIOeKtuaAgeW4uOmHj1xuY29uc3QgVG91cm5hbWVudFN0YXR1cyA9IHtcbiAgICBXQUlUSU5HOiBcIldBSVRJTkdcIixcbiAgICBDQUxDVUxBVElORzogXCJDQUxDVUxBVElOR1wiLCBcbiAgICBNQVRDSElORzogXCJNQVRDSElOR1wiXG59O1xuXG5jYy5DbGFzcyh7XG4gICAgZXh0ZW5kczogY2MuQ29tcG9uZW50LFxuXG4gICAgcHJvcGVydGllczoge1xuICAgICAgICAvLyDmnJ/lj7fmoIfnrb5cbiAgICAgICAgcGVyaW9kTm9MYWJlbDoge1xuICAgICAgICAgICAgdHlwZTogY2MuTGFiZWwsXG4gICAgICAgICAgICBkZWZhdWx0OiBudWxsXG4gICAgICAgIH0sXG4gICAgICAgIC8vIOi9ruasoeagh+etvlxuICAgICAgICByb3VuZExhYmVsOiB7XG4gICAgICAgICAgICB0eXBlOiBjYy5MYWJlbCxcbiAgICAgICAgICAgIGRlZmF1bHQ6IG51bGxcbiAgICAgICAgfSxcbiAgICAgICAgLy8g6L+b5bqm5qCH562+77yI5bey5a6M5oiQL+aAu+aVsO+8iVxuICAgICAgICBwcm9ncmVzc0xhYmVsOiB7XG4gICAgICAgICAgICB0eXBlOiBjYy5MYWJlbCxcbiAgICAgICAgICAgIGRlZmF1bHQ6IG51bGxcbiAgICAgICAgfSxcbiAgICAgICAgLy8g6L+b5bqm5p2hXG4gICAgICAgIHByb2dyZXNzQmFyOiB7XG4gICAgICAgICAgICB0eXBlOiBjYy5Qcm9ncmVzc0JhcixcbiAgICAgICAgICAgIGRlZmF1bHQ6IG51bGxcbiAgICAgICAgfSxcbiAgICAgICAgLy8g5o+Q56S65paH5a2XXG4gICAgICAgIHRpcExhYmVsOiB7XG4gICAgICAgICAgICB0eXBlOiBjYy5MYWJlbCxcbiAgICAgICAgICAgIGRlZmF1bHQ6IG51bGxcbiAgICAgICAgfSxcbiAgICAgICAgLy8g54q25oCB5qCH562+XG4gICAgICAgIHN0YXR1c0xhYmVsOiB7XG4gICAgICAgICAgICB0eXBlOiBjYy5MYWJlbCxcbiAgICAgICAgICAgIGRlZmF1bHQ6IG51bGxcbiAgICAgICAgfSxcbiAgICAgICAgLy8gbG9hZGluZ+WKqOeUu+iKgueCuVxuICAgICAgICBsb2FkaW5nTm9kZToge1xuICAgICAgICAgICAgdHlwZTogY2MuTm9kZSxcbiAgICAgICAgICAgIGRlZmF1bHQ6IG51bGxcbiAgICAgICAgfSxcbiAgICAgICAgLy8g5omR5YWL54mMc3ByaXRl77yI55So5LqObG9hZGluZ+WKqOeUu++8iVxuICAgICAgICBwb2tlclNwcml0ZToge1xuICAgICAgICAgICAgdHlwZTogY2MuU3ByaXRlLFxuICAgICAgICAgICAgZGVmYXVsdDogbnVsbFxuICAgICAgICB9XG4gICAgfSxcblxuICAgIC8vIExJRkUtQ1lDTEUgQ0FMTEJBQ0tTOlxuXG4gICAgb25Mb2FkICgpIHtcbiAgICAgICAgLy8g5Yid5aeL5YyW5pWw5o2uXG4gICAgICAgIHRoaXMuX3BlcmlvZE5vID0gXCJcIlxuICAgICAgICB0aGlzLl9yb3VuZCA9IDFcbiAgICAgICAgdGhpcy5fdG90YWxSb3VuZHMgPSAxXG4gICAgICAgIHRoaXMuX2ZpbmlzaGVkVGFibGVzID0gMFxuICAgICAgICB0aGlzLl90b3RhbFRhYmxlcyA9IDBcbiAgICAgICAgdGhpcy5faXNXYWl0aW5nID0gZmFsc2VcbiAgICAgICAgdGhpcy5fc3RhdHVzID0gVG91cm5hbWVudFN0YXR1cy5XQUlUSU5HXG5cbiAgICAgICAgLy8g5rOo5YaM5LqL5Lu255uR5ZCsXG4gICAgICAgIHRoaXMuX3JlZ2lzdGVyRXZlbnRzKClcbiAgICB9LFxuXG4gICAgc3RhcnQgKCkge1xuICAgICAgICAvLyDlkK/liqhsb2FkaW5n5Yqo55S7XG4gICAgICAgIHRoaXMuX3N0YXJ0TG9hZGluZ0FuaW1hdGlvbigpXG4gICAgfSxcblxuICAgIG9uRGVzdHJveSAoKSB7XG4gICAgICAgIC8vIOWPlua2iOS6i+S7tuebkeWQrFxuICAgICAgICB0aGlzLl91bnJlZ2lzdGVyRXZlbnRzKClcbiAgICB9LFxuXG4gICAgLy8gPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XG4gICAgLy8g5LqL5Lu255uR5ZCsXG4gICAgLy8gPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XG5cbiAgICBfcmVnaXN0ZXJFdmVudHM6IGZ1bmN0aW9uKCkge1xuICAgICAgICB2YXIgc2VsZiA9IHRoaXNcblxuICAgICAgICAvLyDnm5HlkKznrYnlvoXov5vluqbmm7TmlrBcbiAgICAgICAgaWYgKHdpbmRvdy5zb2NrZXRDdHIpIHtcbiAgICAgICAgICAgIHdpbmRvdy5zb2NrZXRDdHIoKS5vblRvdXJuYW1lbnRXYWl0UHJvZ3Jlc3MoZnVuY3Rpb24oZGF0YSkge1xuICAgICAgICAgICAgICAgIHNlbGYuX29uV2FpdFByb2dyZXNzKGRhdGEpXG4gICAgICAgICAgICB9KVxuXG4gICAgICAgICAgICB3aW5kb3cuc29ja2V0Q3RyKCkub25Ub3VybmFtZW50Um91bmRBZHZhbmNlKGZ1bmN0aW9uKGRhdGEpIHtcbiAgICAgICAgICAgICAgICBzZWxmLl9vblJvdW5kQWR2YW5jZShkYXRhKVxuICAgICAgICAgICAgfSlcblxuICAgICAgICAgICAgd2luZG93LnNvY2tldEN0cigpLm9uVG91cm5hbWVudEZpbmFsUmFuayhmdW5jdGlvbihkYXRhKSB7XG4gICAgICAgICAgICAgICAgc2VsZi5fb25GaW5hbFJhbmsoZGF0YSlcbiAgICAgICAgICAgIH0pXG4gICAgICAgIH1cbiAgICB9LFxuXG4gICAgX3VucmVnaXN0ZXJFdmVudHM6IGZ1bmN0aW9uKCkge1xuICAgICAgICAvLyDkuovku7bkvJrpmo/oioLngrnplIDmr4Hoh6rliqjlj5bmtohcbiAgICB9LFxuXG4gICAgLy8gPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XG4gICAgLy8g5YWs5YWx5pa55rOVXG4gICAgLy8gPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XG5cbiAgICAvKipcbiAgICAgKiDorr7nva7nrYnlvoXpobXmlbDmja5cbiAgICAgKiBAcGFyYW0ge09iamVjdH0gZGF0YSAtIHsgcGVyaW9kX25vLCByb3VuZCwgdG90YWxfcm91bmRzLCBmaW5pc2hlZF90YWJsZXMsIHRvdGFsX3RhYmxlcyB9XG4gICAgICovXG4gICAgc2V0RGF0YTogZnVuY3Rpb24oZGF0YSkge1xuICAgICAgICB0aGlzLl9wZXJpb2RObyA9IGRhdGEucGVyaW9kX25vIHx8IFwiXCJcbiAgICAgICAgdGhpcy5fcm91bmQgPSBkYXRhLnJvdW5kIHx8IDFcbiAgICAgICAgdGhpcy5fdG90YWxSb3VuZHMgPSBkYXRhLnRvdGFsX3JvdW5kcyB8fCAxXG4gICAgICAgIHRoaXMuX2ZpbmlzaGVkVGFibGVzID0gZGF0YS5maW5pc2hlZF90YWJsZXMgfHwgMFxuICAgICAgICB0aGlzLl90b3RhbFRhYmxlcyA9IGRhdGEudG90YWxfdGFibGVzIHx8IDBcbiAgICAgICAgdGhpcy5fc3RhdHVzID0gZGF0YS5zdGF0dXMgfHwgVG91cm5hbWVudFN0YXR1cy5XQUlUSU5HXG5cbiAgICAgICAgdGhpcy5fdXBkYXRlVUkoKVxuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiDmm7TmlrDov5vluqZcbiAgICAgKiBAcGFyYW0ge251bWJlcn0gZmluaXNoZWRUYWJsZXMgLSDlt7LlrozmiJDmoYzmlbBcbiAgICAgKi9cbiAgICB1cGRhdGVQcm9ncmVzczogZnVuY3Rpb24oZmluaXNoZWRUYWJsZXMpIHtcbiAgICAgICAgdGhpcy5fZmluaXNoZWRUYWJsZXMgPSBmaW5pc2hlZFRhYmxlc1xuICAgICAgICB0aGlzLl91cGRhdGVQcm9ncmVzc1VJKClcbiAgICB9LFxuXG4gICAgLy8gPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XG4gICAgLy8g5LqL5Lu25aSE55CGXG4gICAgLy8gPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XG5cbiAgICBfb25XYWl0UHJvZ3Jlc3M6IGZ1bmN0aW9uKGRhdGEpIHtcbiAgICAgICAgY29uc29sZS5sb2coXCLwn4+GIFtUb3VybmFtZW50V2FpdGluZ10g5pS25Yiw6L+b5bqm5pu05pawOlwiLCBKU09OLnN0cmluZ2lmeShkYXRhKSlcbiAgICAgICAgXG4gICAgICAgIC8vIOajgOafpeacn+WPt+aYr+WQpuWMuemFjVxuICAgICAgICBpZiAodGhpcy5fcGVyaW9kTm8gJiYgZGF0YS5wZXJpb2Rfbm8gIT09IHRoaXMuX3BlcmlvZE5vKSB7XG4gICAgICAgICAgICByZXR1cm5cbiAgICAgICAgfVxuXG4gICAgICAgIHRoaXMuX3BlcmlvZE5vID0gZGF0YS5wZXJpb2Rfbm9cbiAgICAgICAgdGhpcy5fcm91bmQgPSBkYXRhLnJvdW5kXG4gICAgICAgIHRoaXMuX3RvdGFsUm91bmRzID0gZGF0YS50b3RhbF9yb3VuZHNcbiAgICAgICAgdGhpcy5fZmluaXNoZWRUYWJsZXMgPSBkYXRhLmZpbmlzaGVkX3RhYmxlc1xuICAgICAgICB0aGlzLl90b3RhbFRhYmxlcyA9IGRhdGEudG90YWxfdGFibGVzXG4gICAgICAgIHRoaXMuX3N0YXR1cyA9IGRhdGEuc3RhdHVzIHx8IFRvdXJuYW1lbnRTdGF0dXMuV0FJVElOR1xuXG4gICAgICAgIHRoaXMuX3VwZGF0ZVVJKClcbiAgICB9LFxuXG4gICAgX29uUm91bmRBZHZhbmNlOiBmdW5jdGlvbihkYXRhKSB7XG4gICAgICAgIGNvbnNvbGUubG9nKFwi8J+PhiBbVG91cm5hbWVudFdhaXRpbmddIOi/m+WFpeS4i+S4gOi9rjpcIiwgSlNPTi5zdHJpbmdpZnkoZGF0YSkpXG4gICAgICAgIFxuICAgICAgICAvLyDmo4Dmn6XmnJ/lj7fmmK/lkKbljLnphY1cbiAgICAgICAgaWYgKHRoaXMuX3BlcmlvZE5vICYmIGRhdGEucGVyaW9kX25vICE9PSB0aGlzLl9wZXJpb2RObykge1xuICAgICAgICAgICAgcmV0dXJuXG4gICAgICAgIH1cblxuICAgICAgICAvLyDmm7TmlrDova7mrKFcbiAgICAgICAgdGhpcy5fcm91bmQgPSBkYXRhLm5ld19yb3VuZFxuICAgICAgICB0aGlzLl90b3RhbFJvdW5kcyA9IGRhdGEudG90YWxfcm91bmRzXG5cbiAgICAgICAgLy8g6YeN572u6L+b5bqmXG4gICAgICAgIHRoaXMuX2ZpbmlzaGVkVGFibGVzID0gMFxuICAgICAgICB0aGlzLl9zdGF0dXMgPSBUb3VybmFtZW50U3RhdHVzLk1BVENISU5HXG4gICAgICAgIFxuICAgICAgICAvLyDmm7TmlrDmj5DnpLrmloflrZdcbiAgICAgICAgaWYgKHRoaXMudGlwTGFiZWwpIHtcbiAgICAgICAgICAgIHRoaXMudGlwTGFiZWwuc3RyaW5nID0gZGF0YS5tZXNzYWdlIHx8IFwi6L+b5YWl5LiL5LiA6L2uLi4uXCJcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIOWPr+S7pea3u+WKoOi9ruasoeWIh+aNouWKqOeUu1xuICAgICAgICB0aGlzLl9wbGF5Um91bmRDaGFuZ2VBbmltYXRpb24oKVxuICAgIH0sXG5cbiAgICBfb25GaW5hbFJhbms6IGZ1bmN0aW9uKGRhdGEpIHtcbiAgICAgICAgY29uc29sZS5sb2coXCLwn4+GIFtUb3VybmFtZW50V2FpdGluZ10g5q+U6LWb57uT5p2f77yM5pi+56S65pyA57uI5qac5Y2VOlwiLCBKU09OLnN0cmluZ2lmeShkYXRhKSlcbiAgICAgICAgXG4gICAgICAgIC8vIOajgOafpeacn+WPt+aYr+WQpuWMuemFjVxuICAgICAgICBpZiAodGhpcy5fcGVyaW9kTm8gJiYgZGF0YS5wZXJpb2Rfbm8gIT09IHRoaXMuX3BlcmlvZE5vKSB7XG4gICAgICAgICAgICByZXR1cm5cbiAgICAgICAgfVxuXG4gICAgICAgIC8vIOWFs+mXreetieW+hemhte+8jOaYvuekuuacgOe7iOamnOWNlVxuICAgICAgICB0aGlzLl9zaG93RmluYWxSYW5rRGlhbG9nKGRhdGEpXG4gICAgfSxcblxuICAgIC8vID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxuICAgIC8vIFVJ5pu05pawXG4gICAgLy8gPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XG5cbiAgICBfdXBkYXRlVUk6IGZ1bmN0aW9uKCkge1xuICAgICAgICAvLyDmm7TmlrDmnJ/lj7dcbiAgICAgICAgaWYgKHRoaXMucGVyaW9kTm9MYWJlbCkge1xuICAgICAgICAgICAgdGhpcy5wZXJpb2ROb0xhYmVsLnN0cmluZyA9IFwi56ysXCIgKyB0aGlzLl9wZXJpb2RObyArIFwi5pyfXCJcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIOabtOaWsOi9ruasoVxuICAgICAgICBpZiAodGhpcy5yb3VuZExhYmVsKSB7XG4gICAgICAgICAgICB0aGlzLnJvdW5kTGFiZWwuc3RyaW5nID0gXCLnrKxcIiArIHRoaXMuX3JvdW5kICsgXCLova4gLyDlhbFcIiArIHRoaXMuX3RvdGFsUm91bmRzICsgXCLova5cIlxuICAgICAgICB9XG5cbiAgICAgICAgLy8g5pu05paw6L+b5bqmXG4gICAgICAgIHRoaXMuX3VwZGF0ZVByb2dyZXNzVUkoKVxuICAgICAgICBcbiAgICAgICAgLy8g5pu05paw54q25oCB5pi+56S6XG4gICAgICAgIHRoaXMuX3VwZGF0ZVN0YXR1c1VJKClcbiAgICB9LFxuXG4gICAgX3VwZGF0ZVByb2dyZXNzVUk6IGZ1bmN0aW9uKCkge1xuICAgICAgICAvLyDmm7TmlrDov5vluqbmloflrZdcbiAgICAgICAgaWYgKHRoaXMucHJvZ3Jlc3NMYWJlbCkge1xuICAgICAgICAgICAgdGhpcy5wcm9ncmVzc0xhYmVsLnN0cmluZyA9IHRoaXMuX2ZpbmlzaGVkVGFibGVzICsgXCIgLyBcIiArIHRoaXMuX3RvdGFsVGFibGVzXG4gICAgICAgIH1cblxuICAgICAgICAvLyDmm7TmlrDov5vluqbmnaFcbiAgICAgICAgaWYgKHRoaXMucHJvZ3Jlc3NCYXIgJiYgdGhpcy5fdG90YWxUYWJsZXMgPiAwKSB7XG4gICAgICAgICAgICB2YXIgcHJvZ3Jlc3MgPSB0aGlzLl9maW5pc2hlZFRhYmxlcyAvIHRoaXMuX3RvdGFsVGFibGVzXG4gICAgICAgICAgICB0aGlzLnByb2dyZXNzQmFyLnByb2dyZXNzID0gTWF0aC5taW4ocHJvZ3Jlc3MsIDEuMClcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIOabtOaWsOaPkOekuuaWh+Wtl1xuICAgICAgICBpZiAodGhpcy50aXBMYWJlbCkge1xuICAgICAgICAgICAgaWYgKHRoaXMuX2ZpbmlzaGVkVGFibGVzID49IHRoaXMuX3RvdGFsVGFibGVzKSB7XG4gICAgICAgICAgICAgICAgdGhpcy50aXBMYWJlbC5zdHJpbmcgPSBcIuWFqOmDqOWujOaIkO+8jOWNs+Wwhui/m+WFpeS4i+S4gOi9ri4uLlwiXG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIHZhciByZW1haW5pbmcgPSB0aGlzLl90b3RhbFRhYmxlcyAtIHRoaXMuX2ZpbmlzaGVkVGFibGVzXG4gICAgICAgICAgICAgICAgdGhpcy50aXBMYWJlbC5zdHJpbmcgPSBcIuato+WcqOetieW+heWFtuS7lueOqeWutuWujOaIkC4uLiAo5Ymp5L2ZXCIgKyByZW1haW5pbmcgKyBcIuahjClcIlxuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfSxcbiAgICBcbiAgICAvKipcbiAgICAgKiDmm7TmlrDnirbmgIHmmL7npLpcbiAgICAgKi9cbiAgICBfdXBkYXRlU3RhdHVzVUk6IGZ1bmN0aW9uKCkge1xuICAgICAgICBpZiAodGhpcy5zdGF0dXNMYWJlbCkge1xuICAgICAgICAgICAgc3dpdGNoICh0aGlzLl9zdGF0dXMpIHtcbiAgICAgICAgICAgICAgICBjYXNlIFRvdXJuYW1lbnRTdGF0dXMuQ0FMQ1VMQVRJTkc6XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuc3RhdHVzTGFiZWwuc3RyaW5nID0gXCLmraPlnKjnu5/orqHlhajlnLrmjpLlkI0uLi5cIlxuICAgICAgICAgICAgICAgICAgICB0aGlzLnN0YXR1c0xhYmVsLm5vZGUuY29sb3IgPSBuZXcgY2MuQ29sb3IoMjU1LCAyMDAsIDEwMClcbiAgICAgICAgICAgICAgICAgICAgYnJlYWtcbiAgICAgICAgICAgICAgICBjYXNlIFRvdXJuYW1lbnRTdGF0dXMuTUFUQ0hJTkc6XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuc3RhdHVzTGFiZWwuc3RyaW5nID0gXCLmmYvnuqfmiJDlip/vvIHmraPlnKjljLnphY3kuIvkuIDova4uLi5cIlxuICAgICAgICAgICAgICAgICAgICB0aGlzLnN0YXR1c0xhYmVsLm5vZGUuY29sb3IgPSBuZXcgY2MuQ29sb3IoMTAwLCAyNTUsIDEwMClcbiAgICAgICAgICAgICAgICAgICAgYnJlYWtcbiAgICAgICAgICAgICAgICBkZWZhdWx0OlxuICAgICAgICAgICAgICAgICAgICBpZiAodGhpcy5fZmluaXNoZWRUYWJsZXMgPj0gdGhpcy5fdG90YWxUYWJsZXMpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuc3RhdHVzTGFiZWwuc3RyaW5nID0gXCLmnKzova7nu5PmnZ/vvIzor7fnqI3lgJkuLi5cIlxuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5zdGF0dXNMYWJlbC5ub2RlLmNvbG9yID0gbmV3IGNjLkNvbG9yKDI1NSwgMjIwLCAxNTApXG4gICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLnN0YXR1c0xhYmVsLnN0cmluZyA9IFwi5q2j5Zyo562J5b6F5YW25LuW546p5a625a6M5oiQLi4uXCJcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuc3RhdHVzTGFiZWwubm9kZS5jb2xvciA9IG5ldyBjYy5Db2xvcigyMDAsIDIwMCwgMjIwKVxuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgXG4gICAgICAgIC8vIOagueaNrueKtuaAgeabtOaWsOaPkOekuuaWh+Wtl1xuICAgICAgICBpZiAodGhpcy50aXBMYWJlbCkge1xuICAgICAgICAgICAgc3dpdGNoICh0aGlzLl9zdGF0dXMpIHtcbiAgICAgICAgICAgICAgICBjYXNlIFRvdXJuYW1lbnRTdGF0dXMuQ0FMQ1VMQVRJTkc6XG4gICAgICAgICAgICAgICAgICAgIHRoaXMudGlwTGFiZWwuc3RyaW5nID0gXCLmraPlnKjnu5/orqHlhajlnLrmjpLlkI0uLi5cIlxuICAgICAgICAgICAgICAgICAgICBicmVha1xuICAgICAgICAgICAgICAgIGNhc2UgVG91cm5hbWVudFN0YXR1cy5NQVRDSElORzpcbiAgICAgICAgICAgICAgICAgICAgdGhpcy50aXBMYWJlbC5zdHJpbmcgPSBcIuaZi+e6p+aIkOWKn++8geato+WcqOWMuemFjeS4i+S4gOi9ri4uLlwiXG4gICAgICAgICAgICAgICAgICAgIGJyZWFrXG4gICAgICAgICAgICAgICAgZGVmYXVsdDpcbiAgICAgICAgICAgICAgICAgICAgaWYgKHRoaXMuX2ZpbmlzaGVkVGFibGVzID49IHRoaXMuX3RvdGFsVGFibGVzKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLnRpcExhYmVsLnN0cmluZyA9IFwi5YWo6YOo5a6M5oiQ77yM5Y2z5bCG6L+b5YWl5LiL5LiA6L2uLi4uXCJcbiAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhciByZW1haW5pbmcgPSB0aGlzLl90b3RhbFRhYmxlcyAtIHRoaXMuX2ZpbmlzaGVkVGFibGVzXG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLnRpcExhYmVsLnN0cmluZyA9IFwi5q2j5Zyo562J5b6F5YW25LuW546p5a625a6M5oiQLi4uICjliankvZlcIiArIHJlbWFpbmluZyArIFwi5qGMKVwiXG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH0sXG5cbiAgICAvLyA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cbiAgICAvLyDliqjnlLtcbiAgICAvLyA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cblxuICAgIF9zdGFydExvYWRpbmdBbmltYXRpb246IGZ1bmN0aW9uKCkge1xuICAgICAgICBpZiAoIXRoaXMucG9rZXJTcHJpdGUpIHJldHVyblxuXG4gICAgICAgIHZhciBzZWxmID0gdGhpc1xuICAgICAgICB2YXIgcm90YXRlQWN0aW9uID0gY2Mucm90YXRlQnkoMiwgMzYwKVxuICAgICAgICB2YXIgcmVwZWF0QWN0aW9uID0gY2MucmVwZWF0Rm9yZXZlcihyb3RhdGVBY3Rpb24pXG4gICAgICAgIHRoaXMucG9rZXJTcHJpdGUubm9kZS5ydW5BY3Rpb24ocmVwZWF0QWN0aW9uKVxuICAgIH0sXG5cbiAgICBfc3RvcExvYWRpbmdBbmltYXRpb246IGZ1bmN0aW9uKCkge1xuICAgICAgICBpZiAodGhpcy5wb2tlclNwcml0ZSkge1xuICAgICAgICAgICAgdGhpcy5wb2tlclNwcml0ZS5ub2RlLnN0b3BBbGxBY3Rpb25zKClcbiAgICAgICAgfVxuICAgIH0sXG5cbiAgICBfcGxheVJvdW5kQ2hhbmdlQW5pbWF0aW9uOiBmdW5jdGlvbigpIHtcbiAgICAgICAgLy8g6L2u5qyh5YiH5o2i5Yqo55S777ya5pS+5aSnLee8qeWwj1xuICAgICAgICBpZiAodGhpcy5yb3VuZExhYmVsKSB7XG4gICAgICAgICAgICB2YXIgc2NhbGVVcCA9IGNjLnNjYWxlVG8oMC4zLCAxLjIpXG4gICAgICAgICAgICB2YXIgc2NhbGVEb3duID0gY2Muc2NhbGVUbygwLjMsIDEuMClcbiAgICAgICAgICAgIHZhciBzZXF1ZW5jZSA9IGNjLnNlcXVlbmNlKHNjYWxlVXAsIHNjYWxlRG93bilcbiAgICAgICAgICAgIHRoaXMucm91bmRMYWJlbC5ub2RlLnJ1bkFjdGlvbihzZXF1ZW5jZSlcbiAgICAgICAgfVxuICAgIH0sXG5cbiAgICAvLyA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cbiAgICAvLyDmmL7npLrmnIDnu4jmppzljZVcbiAgICAvLyA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cblxuICAgIF9zaG93RmluYWxSYW5rRGlhbG9nOiBmdW5jdGlvbihkYXRhKSB7XG4gICAgICAgIC8vIOWBnOatomxvYWRpbmfliqjnlLtcbiAgICAgICAgdGhpcy5fc3RvcExvYWRpbmdBbmltYXRpb24oKVxuXG4gICAgICAgIC8vIOWKoOi9veW5tuaYvuekuuacgOe7iOamnOWNleW8ueeql1xuICAgICAgICB2YXIgc2VsZiA9IHRoaXNcbiAgICAgICAgY2MucmVzb3VyY2VzLmxvYWQoXCJwcmVmYWJzL3RvdXJuYW1lbnQvVG91cm5hbWVudEZpbmFsUmFua0RpYWxvZ1wiLCBmdW5jdGlvbihlcnIsIHByZWZhYikge1xuICAgICAgICAgICAgaWYgKGVycikge1xuICAgICAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoXCLliqDovb3mnIDnu4jmppzljZXlvLnnqpflpLHotKU6XCIsIGVycilcbiAgICAgICAgICAgICAgICByZXR1cm5cbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgdmFyIGRpYWxvZyA9IGNjLmluc3RhbnRpYXRlKHByZWZhYilcbiAgICAgICAgICAgIHNlbGYubm9kZS5hZGRDaGlsZChkaWFsb2cpXG5cbiAgICAgICAgICAgIC8vIOiuvue9ruaVsOaNrlxuICAgICAgICAgICAgdmFyIGRpYWxvZ0NvbXAgPSBkaWFsb2cuZ2V0Q29tcG9uZW50KFwiVG91cm5hbWVudEZpbmFsUmFua0RpYWxvZ1wiKVxuICAgICAgICAgICAgaWYgKGRpYWxvZ0NvbXApIHtcbiAgICAgICAgICAgICAgICBkaWFsb2dDb21wLnNldERhdGEoZGF0YSlcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSlcbiAgICB9LFxuXG4gICAgLy8gPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XG4gICAgLy8g6L+U5Zue5aSn5Y6FXG4gICAgLy8gPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XG5cbiAgICBvbkJhY2tUb0hhbGxDbGljazogZnVuY3Rpb24oKSB7XG4gICAgICAgIC8vIOi/lOWbnuWkp+WOheWcuuaZr1xuICAgICAgICBjYy5kaXJlY3Rvci5sb2FkU2NlbmUoXCJoYWxsU2NlbmVcIilcbiAgICB9XG59KTtcbiJdfQ==
//------QC-SOURCE-SPLIT------
