
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
   * 报名竞技场（使用 WebSocket 指令）
   * @param {Number} roomId - 竞技场房间ID
   * @param {Function} callback - 回调函数 (err, result)
   */
  that.signup = function (roomId, callback) {
    // 🔧【修复】使用 myglobal.socket 获取已连接的实例，而不是每次创建新实例
    var socketCtrInstance = window.myglobal && window.myglobal.socket ? window.myglobal.socket : null;
    if (!socketCtrInstance) {
      callback && callback('WebSocket未初始化，请刷新页面重试', null);
      return;
    }

    // 检查 WebSocket 连接状态
    if (!socketCtrInstance.isConnected || typeof socketCtrInstance.isConnected !== 'function') {
      console.error("🏟️ [ArenaData] socketCtr.isConnected 不是函数");
      callback && callback('WebSocket连接状态异常，请刷新页面重试', null);
      return;
    }
    if (!socketCtrInstance.isConnected() || !socketCtrInstance.isWebSocketOpen()) {
      callback && callback('WebSocket未连接，请稍后重试', null);
      return;
    }
    console.log("🏟️ [ArenaData] 通过 WebSocket 发送报名请求, roomId:", roomId);

    // 标记是否已响应（防止重复回调）
    var responded = false;
    var timeoutId = null;

    // 清理函数（移除监听器和超时）
    var cleanup = function cleanup() {
      if (timeoutId) clearTimeout(timeoutId);
      // 移除监听器，防止内存泄漏
      socketCtrInstance.offArenaSignupSuccess(successHandler);
      socketCtrInstance.offArenaSignupFailed(failedHandler);
    };

    // 成功回调
    var successHandler = function successHandler(data) {
      if (responded) return;
      if (data.room_id !== roomId) return; // 不是当前房间的响应

      responded = true;
      cleanup();

      // 记录报名成功
      var arenaConfig = that._arenaDetails[roomId] || {};
      that._signedUpArenas[roomId] = {
        signupTime: data.signup_time || Date.now(),
        status: 'signed_up',
        arenaConfig: arenaConfig,
        periodNo: data.period_no,
        signupFee: data.signup_fee
      };

      // 保存到本地存储
      that.saveToLocal();

      // 更新玩家竞技币余额
      if (window.myglobal && window.myglobal.playerData && data.balance_after !== undefined) {
        window.myglobal.playerData.arena_coin = data.balance_after;
        window.myglobal.playerData.saveToLocal();

        // 🔧【新增】触发全局事件，通知大厅刷新UI
        if (window.myglobal.eventlister) {
          window.myglobal.eventlister.fire('arena_coin_updated', {
            arena_coin: data.balance_after
          });
        }
      }

      // 通知状态变更
      that._notifyStatusChange(roomId, 'signed_up');
      callback && callback(null, {
        success: true,
        message: '报名成功',
        period_no: data.period_no,
        signup_fee: data.signup_fee,
        balance_after: data.balance_after
      });
    };

    // 失败回调
    var failedHandler = function failedHandler(data) {
      if (responded) return;
      responded = true;
      cleanup();
      callback && callback(data.message || '报名失败', null);
    };

    // 注册监听
    socketCtrInstance.onArenaSignupSuccess(successHandler);
    socketCtrInstance.onArenaSignupFailed(failedHandler);

    // 设置超时（10秒）
    timeoutId = setTimeout(function () {
      if (responded) return;
      responded = true;
      callback && callback('报名请求超时，请重试', null);
    }, 10000);

    // 发送报名请求
    socketCtrInstance.sendArenaSignup({
      room_id: roomId
    });
  };

  /**
   * 取消报名（使用 WebSocket 指令）
   * @param {Number} roomId - 竞技场房间ID
   * @param {Function} callback - 回调函数 (err, result)
   */
  that.cancelSignup = function (roomId, callback) {
    // 🔧【修复】使用 myglobal.socket 获取已连接的实例，而不是每次创建新实例
    var socketCtrInstance = window.myglobal && window.myglobal.socket ? window.myglobal.socket : null;
    if (!socketCtrInstance) {
      callback && callback('WebSocket未初始化，请刷新页面重试', null);
      return;
    }

    // 检查 WebSocket 连接状态
    if (!socketCtrInstance.isConnected || typeof socketCtrInstance.isConnected !== 'function') {
      console.error("🏟️ [ArenaData] socketCtr.isConnected 不是函数");
      callback && callback('WebSocket连接状态异常，请刷新页面重试', null);
      return;
    }
    if (!socketCtrInstance.isConnected() || !socketCtrInstance.isWebSocketOpen()) {
      callback && callback('WebSocket未连接，请稍后重试', null);
      return;
    }
    console.log("🏟️ [ArenaData] 通过 WebSocket 发送取消报名请求, roomId:", roomId);

    // 标记是否已响应（防止重复回调）
    var responded = false;
    var timeoutId = null;

    // 清理函数（移除监听器和超时）
    var cleanup = function cleanup() {
      if (timeoutId) clearTimeout(timeoutId);
      // 移除监听器，防止内存泄漏
      socketCtrInstance.offArenaCancelSuccess(successHandler);
      socketCtrInstance.offArenaCancelFailed(failedHandler);
    };

    // 成功回调
    var successHandler = function successHandler(data) {
      if (responded) return;
      if (data.room_id !== roomId) return; // 不是当前房间的响应

      responded = true;
      cleanup();

      // 清除报名记录
      delete that._signedUpArenas[roomId];

      // 保存到本地存储
      that.saveToLocal();

      // 更新玩家竞技币余额
      if (window.myglobal && window.myglobal.playerData && data.balance_after !== undefined) {
        window.myglobal.playerData.arena_coin = data.balance_after;
        window.myglobal.playerData.saveToLocal();

        // 🔧【新增】触发全局事件，通知大厅刷新UI
        if (window.myglobal.eventlister) {
          window.myglobal.eventlister.fire('arena_coin_updated', {
            arena_coin: data.balance_after
          });
        }
      }

      // 清除倒计时定时器
      if (that._countdownTimers[roomId]) {
        clearInterval(that._countdownTimers[roomId]);
        delete that._countdownTimers[roomId];
      }

      // 通知状态变更
      that._notifyStatusChange(roomId, 'cancelled');
      callback && callback(null, {
        success: true,
        message: '取消报名成功',
        refund_amount: data.refund_amount,
        balance_after: data.balance_after
      });
    };

    // 失败回调
    var failedHandler = function failedHandler(data) {
      if (responded) return;
      responded = true;
      cleanup();
      callback && callback(data.message || '取消报名失败', null);
    };

    // 注册监听
    socketCtrInstance.onArenaCancelSuccess(successHandler);
    socketCtrInstance.onArenaCancelFailed(failedHandler);

    // 设置超时（10秒）
    timeoutId = setTimeout(function () {
      if (responded) return;
      responded = true;
      callback && callback('取消报名请求超时，请重试', null);
    }, 10000);

    // 发送取消报名请求
    socketCtrInstance.sendArenaCancelSignup({
      room_id: roomId
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImFzc2V0c1xcc2NyaXB0c1xcZGF0YVxcYXJlbmFEYXRhLmpzIl0sIm5hbWVzIjpbIndpbmRvdyIsImFyZW5hRGF0YSIsInRoYXQiLCJfc2lnbmVkVXBBcmVuYXMiLCJfYXJlbmFEZXRhaWxzIiwiX2NvdW50ZG93blRpbWVycyIsIl9zdGF0dXNMaXN0ZW5lcnMiLCJnZXRBcmVuYUxpc3QiLCJjYWxsYmFjayIsImFwaVVybCIsImRlZmluZXMiLCJjcnlwdG9LZXkiLCJIdHRwQVBJIiwiZ2V0IiwiZXJyIiwicmVzdWx0IiwiYXJlbmFMaXN0IiwiY29kZSIsImRhdGEiLCJBcnJheSIsImlzQXJyYXkiLCJpIiwibGVuZ3RoIiwiYXJlbmEiLCJpZCIsInNpZ251cCIsInJvb21JZCIsInNvY2tldEN0ckluc3RhbmNlIiwibXlnbG9iYWwiLCJzb2NrZXQiLCJpc0Nvbm5lY3RlZCIsImNvbnNvbGUiLCJlcnJvciIsImlzV2ViU29ja2V0T3BlbiIsImxvZyIsInJlc3BvbmRlZCIsInRpbWVvdXRJZCIsImNsZWFudXAiLCJjbGVhclRpbWVvdXQiLCJvZmZBcmVuYVNpZ251cFN1Y2Nlc3MiLCJzdWNjZXNzSGFuZGxlciIsIm9mZkFyZW5hU2lnbnVwRmFpbGVkIiwiZmFpbGVkSGFuZGxlciIsInJvb21faWQiLCJhcmVuYUNvbmZpZyIsInNpZ251cFRpbWUiLCJzaWdudXBfdGltZSIsIkRhdGUiLCJub3ciLCJzdGF0dXMiLCJwZXJpb2RObyIsInBlcmlvZF9ubyIsInNpZ251cEZlZSIsInNpZ251cF9mZWUiLCJzYXZlVG9Mb2NhbCIsInBsYXllckRhdGEiLCJiYWxhbmNlX2FmdGVyIiwidW5kZWZpbmVkIiwiYXJlbmFfY29pbiIsImV2ZW50bGlzdGVyIiwiZmlyZSIsIl9ub3RpZnlTdGF0dXNDaGFuZ2UiLCJzdWNjZXNzIiwibWVzc2FnZSIsIm9uQXJlbmFTaWdudXBTdWNjZXNzIiwib25BcmVuYVNpZ251cEZhaWxlZCIsInNldFRpbWVvdXQiLCJzZW5kQXJlbmFTaWdudXAiLCJjYW5jZWxTaWdudXAiLCJvZmZBcmVuYUNhbmNlbFN1Y2Nlc3MiLCJvZmZBcmVuYUNhbmNlbEZhaWxlZCIsImNsZWFySW50ZXJ2YWwiLCJyZWZ1bmRfYW1vdW50Iiwib25BcmVuYUNhbmNlbFN1Y2Nlc3MiLCJvbkFyZW5hQ2FuY2VsRmFpbGVkIiwic2VuZEFyZW5hQ2FuY2VsU2lnbnVwIiwiZ2V0U2lnbnVwU3RhdHVzIiwiaXNTaWduZWRVcCIsImdldENvdW50ZG93biIsImNvdW50ZG93bkVuZCIsInJlbWFpbmluZyIsIk1hdGgiLCJmbG9vciIsImZvcm1hdENvdW50ZG93biIsInNlY29uZHMiLCJob3VycyIsIm1pbnV0ZXMiLCJzZWNzIiwiZ2V0QXJlbmFDb25maWciLCJnZXRTaWdudXBGZWUiLCJyb29tQ29uZmlnIiwiZ2V0Q2hhbXBpb25SZXdhcmQiLCJjaGFtcGlvbl9yZXdhcmQiLCJjaGFtcGlvblJld2FyZCIsImNvaW5zIiwiaXRlbXMiLCJ3YXRjaEFkRm9yUmV3YXJkIiwidHlwZSIsInRva2VuIiwicmVxdWVzdERhdGEiLCJhZF90eXBlIiwicG9zdCIsImdvbGQiLCJnb2JhbF9jb3VudCIsInJld2FyZCIsInJlZnJlc2hCYWxhbmNlIiwiZW5jb2RlVVJJQ29tcG9uZW50IiwiYWRkU3RhdHVzTGlzdGVuZXIiLCJsaXN0ZW5lciIsInB1c2giLCJyZW1vdmVTdGF0dXNMaXN0ZW5lciIsImluZGV4IiwiaW5kZXhPZiIsInNwbGljZSIsImUiLCJzdGFydENvdW50ZG93biIsIm9uVXBkYXRlIiwic2V0SW50ZXJ2YWwiLCJzdG9wQ291bnRkb3duIiwiY2xlYXJBbGxDb3VudGRvd25zIiwic2lnbmVkVXBBcmVuYXMiLCJzYXZlZEF0IiwibG9jYWxTdG9yYWdlIiwic2V0SXRlbSIsIkpTT04iLCJzdHJpbmdpZnkiLCJsb2FkRnJvbUxvY2FsIiwiZGF0YVN0ciIsImdldEl0ZW0iLCJwYXJzZSIsImZldGNoU2lnbnVwU3RhdHVzRnJvbVNlcnZlciIsInNpZ25lZFVwUm9vbXMiLCJzaWduZWRfdXBfcm9v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Q0FBQ2tJLElBQUksQ0FBQzFGLE9BQU8sQ0FBQyxHQUFHO1lBQ2pDRSxVQUFVLEVBQUV3RixJQUFJLENBQUN2RixXQUFXO1lBQzVCRyxNQUFNLEVBQUUsV0FBVztZQUNuQkMsUUFBUSxFQUFFbUYsSUFBSSxDQUFDbEYsU0FBUztZQUN4QkMsU0FBUyxFQUFFaUYsSUFBSSxDQUFDaEY7VUFDcEIsQ0FBQztRQUNMOztRQUVBO1FBQ0FuRCxJQUFJLENBQUNvRCxXQUFXLEVBQUU7TUFDdEI7TUFFQTlDLFFBQVEsSUFBSUEsUUFBUSxDQUFDLElBQUksRUFBRTJILGFBQWEsQ0FBQztJQUM3QyxDQUFDLENBQ0o7RUFDTCxDQUFDOztFQUVEO0FBQ0o7QUFDQTtFQUNJakksSUFBSSxDQUFDb0ksb0JBQW9CLEdBQUcsWUFBVztJQUNuQ3BJLElBQUksQ0FBQ0MsZUFBZSxHQUFHLENBQUMsQ0FBQztJQUN6QkQsSUFBSSxDQUFDb0QsV0FBVyxFQUFFO0VBQ3RCLENBQUM7O0VBRUQ7RUFDQXBELElBQUksQ0FBQzRILGFBQWEsRUFBRTtFQUVwQixPQUFPNUgsSUFBSTtBQUNmLENBQUMsRUFBRSIsInNvdXJjZVJvb3QiOiIvIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiDnq57mioDlnLrmlbDmja7nrqHnkIbmqKHlnZdcbiAqIOeUqOS6jueuoeeQhuernuaKgOWcuuaKpeWQjeOAgeWAkuiuoeaXtuOAgeWlluWKseetieaVsOaNrlxuICogXG4gKiDlip/og73vvJpcbiAqIDEuIOiOt+WPluernuaKgOWcuuaIv+mXtOWIl+ihqFxuICogMi4g5oql5ZCNL+WPlua2iOaKpeWQjVxuICogMy4g6I635Y+W5byA6LWb5YCS6K6h5pe2XG4gKiA0LiDojrflj5blt7LmiqXlkI3nirbmgIFcbiAqL1xuXG53aW5kb3cuYXJlbmFEYXRhID0gZnVuY3Rpb24oKSB7XG4gICAgdmFyIHRoYXQgPSB7fTtcbiAgICBcbiAgICAvLyA9PT09PT09PT09PT09PT09PT09PSDnq57mioDlnLrnirbmgIHmlbDmja4gPT09PT09PT09PT09PT09PT09PT1cbiAgICBcbiAgICAvLyDlt7LmiqXlkI3nmoTnq57mioDlnLrliJfooaggeyByb29tSWQ6IHsgc2lnbnVwVGltZSwgc3RhdHVzLCBjb3VudGRvd25FbmQgfSB9XG4gICAgdGhhdC5fc2lnbmVkVXBBcmVuYXMgPSB7fTtcbiAgICBcbiAgICAvLyDnq57mioDlnLror6bmg4XnvJPlrZggeyByb29tSWQ6IGFyZW5hQ29uZmlnIH1cbiAgICB0aGF0Ll9hcmVuYURldGFpbHMgPSB7fTtcbiAgICBcbiAgICAvLyDlgJLorqHml7blrprml7blmahcbiAgICB0aGF0Ll9jb3VudGRvd25UaW1lcnMgPSB7fTtcbiAgICBcbiAgICAvLyDnirbmgIHlj5jmm7Tnm5HlkKzlmahcbiAgICB0aGF0Ll9zdGF0dXNMaXN0ZW5lcnMgPSBbXTtcbiAgICBcbiAgICAvLyA9PT09PT09PT09PT09PT09PT09PSBBUEkg5pa55rOVID09PT09PT09PT09PT09PT09PT09XG4gICAgXG4gICAgLyoqXG4gICAgICog6I635Y+W56ue5oqA5Zy65oi/6Ze05YiX6KGoXG4gICAgICogQHBhcmFtIHtGdW5jdGlvbn0gY2FsbGJhY2sgLSDlm57osIPlh73mlbAgKGVyciwgYXJlbmFMaXN0KVxuICAgICAqL1xuICAgIHRoYXQuZ2V0QXJlbmFMaXN0ID0gZnVuY3Rpb24oY2FsbGJhY2spIHtcbiAgICAgICAgdmFyIGFwaVVybCA9IHdpbmRvdy5kZWZpbmVzID8gd2luZG93LmRlZmluZXMuYXBpVXJsIDogJyc7XG4gICAgICAgIHZhciBjcnlwdG9LZXkgPSB3aW5kb3cuZGVmaW5lcyA/IHdpbmRvdy5kZWZpbmVzLmNyeXB0b0tleSA6ICcnO1xuICAgICAgICBcbiAgICAgICAgaWYgKCFhcGlVcmwgfHwgIXdpbmRvdy5IdHRwQVBJKSB7XG4gICAgICAgICAgICBjYWxsYmFjayAmJiBjYWxsYmFjaygnQVBJ5pyq6YWN572uJywgbnVsbCk7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgICAgXG4gICAgICAgIEh0dHBBUEkuZ2V0KFxuICAgICAgICAgICAgYXBpVXJsICsgJy9hcGkvdjEvYXJlbmEvbGlzdCcsXG4gICAgICAgICAgICBjcnlwdG9LZXksXG4gICAgICAgICAgICBmdW5jdGlvbihlcnIsIHJlc3VsdCkge1xuICAgICAgICAgICAgICAgIGlmIChlcnIpIHtcbiAgICAgICAgICAgICAgICAgICAgY2FsbGJhY2sgJiYgY2FsbGJhY2soZXJyLCBudWxsKTtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICB2YXIgYXJlbmFMaXN0ID0gbnVsbDtcbiAgICAgICAgICAgICAgICBpZiAocmVzdWx0ICYmIHJlc3VsdC5jb2RlID09PSAwICYmIHJlc3VsdC5kYXRhKSB7XG4gICAgICAgICAgICAgICAgICAgIGFyZW5hTGlzdCA9IHJlc3VsdC5kYXRhO1xuICAgICAgICAgICAgICAgIH0gZWxzZSBpZiAocmVzdWx0ICYmIEFycmF5LmlzQXJyYXkocmVzdWx0KSkge1xuICAgICAgICAgICAgICAgICAgICBhcmVuYUxpc3QgPSByZXN1bHQ7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgIGlmIChhcmVuYUxpc3QpIHtcbiAgICAgICAgICAgICAgICAgICAgLy8g57yT5a2Y56ue5oqA5Zy66K+m5oOFXG4gICAgICAgICAgICAgICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgYXJlbmFMaXN0Lmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICB2YXIgYXJlbmEgPSBhcmVuYUxpc3RbaV07XG4gICAgICAgICAgICAgICAgICAgICAgICB0aGF0Ll9hcmVuYURldGFpbHNbYXJlbmEuaWRdID0gYXJlbmE7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgY2FsbGJhY2sgJiYgY2FsbGJhY2sobnVsbCwgYXJlbmFMaXN0KTtcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICBjYWxsYmFjayAmJiBjYWxsYmFjaygn6I635Y+W56ue5oqA5Zy65YiX6KGo5aSx6LSlJywgbnVsbCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICApO1xuICAgIH07XG4gICAgXG4gICAgLyoqXG4gICAgICog5oql5ZCN56ue5oqA5Zy677yI5L2/55SoIFdlYlNvY2tldCDmjIfku6TvvIlcbiAgICAgKiBAcGFyYW0ge051bWJlcn0gcm9vbUlkIC0g56ue5oqA5Zy65oi/6Ze0SURcbiAgICAgKiBAcGFyYW0ge0Z1bmN0aW9ufSBjYWxsYmFjayAtIOWbnuiwg+WHveaVsCAoZXJyLCByZXN1bHQpXG4gICAgICovXG4gICAgdGhhdC5zaWdudXAgPSBmdW5jdGlvbihyb29tSWQsIGNhbGxiYWNrKSB7XG4gICAgICAgIC8vIPCflKfjgJDkv67lpI3jgJHkvb/nlKggbXlnbG9iYWwuc29ja2V0IOiOt+WPluW3sui/nuaOpeeahOWunuS+i++8jOiAjOS4jeaYr+avj+asoeWIm+W7uuaWsOWunuS+i1xuICAgICAgICB2YXIgc29ja2V0Q3RySW5zdGFuY2UgPSB3aW5kb3cubXlnbG9iYWwgJiYgd2luZG93Lm15Z2xvYmFsLnNvY2tldCA/IHdpbmRvdy5teWdsb2JhbC5zb2NrZXQgOiBudWxsO1xuICAgICAgICBpZiAoIXNvY2tldEN0ckluc3RhbmNlKSB7XG4gICAgICAgICAgICBjYWxsYmFjayAmJiBjYWxsYmFjaygnV2ViU29ja2V05pyq5Yid5aeL5YyW77yM6K+35Yi35paw6aG16Z2i6YeN6K+VJywgbnVsbCk7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgICAgXG4gICAgICAgIC8vIOajgOafpSBXZWJTb2NrZXQg6L+e5o6l54q25oCBXG4gICAgICAgIGlmICghc29ja2V0Q3RySW5zdGFuY2UuaXNDb25uZWN0ZWQgfHwgdHlwZW9mIHNvY2tldEN0ckluc3RhbmNlLmlzQ29ubmVjdGVkICE9PSAnZnVuY3Rpb24nKSB7XG4gICAgICAgICAgICBjb25zb2xlLmVycm9yKFwi8J+Pn++4jyBbQXJlbmFEYXRhXSBzb2NrZXRDdHIuaXNDb25uZWN0ZWQg5LiN5piv5Ye95pWwXCIpO1xuICAgICAgICAgICAgY2FsbGJhY2sgJiYgY2FsbGJhY2soJ1dlYlNvY2tldOi/nuaOpeeKtuaAgeW8guW4uO+8jOivt+WIt+aWsOmhtemdoumHjeivlScsIG51bGwpO1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIFxuICAgICAgICBpZiAoIXNvY2tldEN0ckluc3RhbmNlLmlzQ29ubmVjdGVkKCkgfHwgIXNvY2tldEN0ckluc3RhbmNlLmlzV2ViU29ja2V0T3BlbigpKSB7XG4gICAgICAgICAgICBjYWxsYmFjayAmJiBjYWxsYmFjaygnV2ViU29ja2V05pyq6L+e5o6l77yM6K+356iN5ZCO6YeN6K+VJywgbnVsbCk7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgICAgXG4gICAgICAgIGNvbnNvbGUubG9nKFwi8J+Pn++4jyBbQXJlbmFEYXRhXSDpgJrov4cgV2ViU29ja2V0IOWPkemAgeaKpeWQjeivt+axgiwgcm9vbUlkOlwiLCByb29tSWQpO1xuICAgICAgICBcbiAgICAgICAgLy8g5qCH6K6w5piv5ZCm5bey5ZON5bqU77yI6Ziy5q2i6YeN5aSN5Zue6LCD77yJXG4gICAgICAgIHZhciByZXNwb25kZWQgPSBmYWxzZTtcbiAgICAgICAgdmFyIHRpbWVvdXRJZCA9IG51bGw7XG4gICAgICAgIFxuICAgICAgICAvLyDmuIXnkIblh73mlbDvvIjnp7vpmaTnm5HlkKzlmajlkozotoXml7bvvIlcbiAgICAgICAgdmFyIGNsZWFudXAgPSBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIGlmICh0aW1lb3V0SWQpIGNsZWFyVGltZW91dCh0aW1lb3V0SWQpO1xuICAgICAgICAgICAgLy8g56e76Zmk55uR5ZCs5Zmo77yM6Ziy5q2i5YaF5a2Y5rOE5ryPXG4gICAgICAgICAgICBzb2NrZXRDdHJJbnN0YW5jZS5vZmZBcmVuYVNpZ251cFN1Y2Nlc3Moc3VjY2Vzc0hhbmRsZXIpO1xuICAgICAgICAgICAgc29ja2V0Q3RySW5zdGFuY2Uub2ZmQXJlbmFTaWdudXBGYWlsZWQoZmFpbGVkSGFuZGxlcik7XG4gICAgICAgIH07XG4gICAgICAgIFxuICAgICAgICAvLyDmiJDlip/lm57osINcbiAgICAgICAgdmFyIHN1Y2Nlc3NIYW5kbGVyID0gZnVuY3Rpb24oZGF0YSkge1xuICAgICAgICAgICAgaWYgKHJlc3BvbmRlZCkgcmV0dXJuO1xuICAgICAgICAgICAgaWYgKGRhdGEucm9vbV9pZCAhPT0gcm9vbUlkKSByZXR1cm47IC8vIOS4jeaYr+W9k+WJjeaIv+mXtOeahOWTjeW6lFxuICAgICAgICAgICAgXG4gICAgICAgICAgICByZXNwb25kZWQgPSB0cnVlO1xuICAgICAgICAgICAgY2xlYW51cCgpO1xuICAgICAgICAgICAgXG4gICAgICAgICAgICAvLyDorrDlvZXmiqXlkI3miJDlip9cbiAgICAgICAgICAgIHZhciBhcmVuYUNvbmZpZyA9IHRoYXQuX2FyZW5hRGV0YWlsc1tyb29tSWRdIHx8IHt9O1xuICAgICAgICAgICAgdGhhdC5fc2lnbmVkVXBBcmVuYXNbcm9vbUlkXSA9IHtcbiAgICAgICAgICAgICAgICBzaWdudXBUaW1lOiBkYXRhLnNpZ251cF90aW1lIHx8IERhdGUubm93KCksXG4gICAgICAgICAgICAgICAgc3RhdHVzOiAnc2lnbmVkX3VwJyxcbiAgICAgICAgICAgICAgICBhcmVuYUNvbmZpZzogYXJlbmFDb25maWcsXG4gICAgICAgICAgICAgICAgcGVyaW9kTm86IGRhdGEucGVyaW9kX25vLFxuICAgICAgICAgICAgICAgIHNpZ251cEZlZTogZGF0YS5zaWdudXBfZmVlXG4gICAgICAgICAgICB9O1xuICAgICAgICAgICAgXG4gICAgICAgICAgICAvLyDkv53lrZjliLDmnKzlnLDlrZjlgqhcbiAgICAgICAgICAgIHRoYXQuc2F2ZVRvTG9jYWwoKTtcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgLy8g5pu05paw546p5a6256ue5oqA5biB5L2Z6aKdXG4gICAgICAgICAgICBpZiAod2luZG93Lm15Z2xvYmFsICYmIHdpbmRvdy5teWdsb2JhbC5wbGF5ZXJEYXRhICYmIGRhdGEuYmFsYW5jZV9hZnRlciAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICAgICAgd2luZG93Lm15Z2xvYmFsLnBsYXllckRhdGEuYXJlbmFfY29pbiA9IGRhdGEuYmFsYW5jZV9hZnRlcjtcbiAgICAgICAgICAgICAgICB3aW5kb3cubXlnbG9iYWwucGxheWVyRGF0YS5zYXZlVG9Mb2NhbCgpO1xuICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgIC8vIPCflKfjgJDmlrDlop7jgJHop6blj5HlhajlsYDkuovku7bvvIzpgJrnn6XlpKfljoXliLfmlrBVSVxuICAgICAgICAgICAgICAgIGlmICh3aW5kb3cubXlnbG9iYWwuZXZlbnRsaXN0ZXIpIHtcbiAgICAgICAgICAgICAgICAgICAgd2luZG93Lm15Z2xvYmFsLmV2ZW50bGlzdGVyLmZpcmUoJ2FyZW5hX2NvaW5fdXBkYXRlZCcsIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGFyZW5hX2NvaW46IGRhdGEuYmFsYW5jZV9hZnRlclxuICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBcbiAgICAgICAgICAgIC8vIOmAmuefpeeKtuaAgeWPmOabtFxuICAgICAgICAgICAgdGhhdC5fbm90aWZ5U3RhdHVzQ2hhbmdlKHJvb21JZCwgJ3NpZ25lZF91cCcpO1xuICAgICAgICAgICAgXG4gICAgICAgICAgICBjYWxsYmFjayAmJiBjYWxsYmFjayhudWxsLCB7XG4gICAgICAgICAgICAgICAgc3VjY2VzczogdHJ1ZSxcbiAgICAgICAgICAgICAgICBtZXNzYWdlOiAn5oql5ZCN5oiQ5YqfJyxcbiAgICAgICAgICAgICAgICBwZXJpb2Rfbm86IGRhdGEucGVyaW9kX25vLFxuICAgICAgICAgICAgICAgIHNpZ251cF9mZWU6IGRhdGEuc2lnbnVwX2ZlZSxcbiAgICAgICAgICAgICAgICBiYWxhbmNlX2FmdGVyOiBkYXRhLmJhbGFuY2VfYWZ0ZXJcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9O1xuICAgICAgICBcbiAgICAgICAgLy8g5aSx6LSl5Zue6LCDXG4gICAgICAgIHZhciBmYWlsZWRIYW5kbGVyID0gZnVuY3Rpb24oZGF0YSkge1xuICAgICAgICAgICAgaWYgKHJlc3BvbmRlZCkgcmV0dXJuO1xuICAgICAgICAgICAgcmVzcG9uZGVkID0gdHJ1ZTtcbiAgICAgICAgICAgIGNsZWFudXAoKTtcbiAgICAgICAgICAgIGNhbGxiYWNrICYmIGNhbGxiYWNrKGRhdGEubWVzc2FnZSB8fCAn5oql5ZCN5aSx6LSlJywgbnVsbCk7XG4gICAgICAgIH07XG4gICAgICAgIFxuICAgICAgICAvLyDms6jlhoznm5HlkKxcbiAgICAgICAgc29ja2V0Q3RySW5zdGFuY2Uub25BcmVuYVNpZ251cFN1Y2Nlc3Moc3VjY2Vzc0hhbmRsZXIpO1xuICAgICAgICBzb2NrZXRDdHJJbnN0YW5jZS5vbkFyZW5hU2lnbnVwRmFpbGVkKGZhaWxlZEhhbmRsZXIpO1xuICAgICAgICBcbiAgICAgICAgLy8g6K6+572u6LaF5pe277yIMTDnp5LvvIlcbiAgICAgICAgdGltZW91dElkID0gc2V0VGltZW91dChmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIGlmIChyZXNwb25kZWQpIHJldHVybjtcbiAgICAgICAgICAgIHJlc3BvbmRlZCA9IHRydWU7XG4gICAgICAgICAgICBjYWxsYmFjayAmJiBjYWxsYmFjaygn5oql5ZCN6K+35rGC6LaF5pe277yM6K+36YeN6K+VJywgbnVsbCk7XG4gICAgICAgIH0sIDEwMDAwKTtcbiAgICAgICAgXG4gICAgICAgIC8vIOWPkemAgeaKpeWQjeivt+axglxuICAgICAgICBzb2NrZXRDdHJJbnN0YW5jZS5zZW5kQXJlbmFTaWdudXAoeyByb29tX2lkOiByb29tSWQgfSk7XG4gICAgfTtcbiAgICBcbiAgICAvKipcbiAgICAgKiDlj5bmtojmiqXlkI3vvIjkvb/nlKggV2ViU29ja2V0IOaMh+S7pO+8iVxuICAgICAqIEBwYXJhbSB7TnVtYmVyfSByb29tSWQgLSDnq57mioDlnLrmiL/pl7RJRFxuICAgICAqIEBwYXJhbSB7RnVuY3Rpb259IGNhbGxiYWNrIC0g5Zue6LCD5Ye95pWwIChlcnIsIHJlc3VsdClcbiAgICAgKi9cbiAgICB0aGF0LmNhbmNlbFNpZ251cCA9IGZ1bmN0aW9uKHJvb21JZCwgY2FsbGJhY2spIHtcbiAgICAgICAgLy8g8J+Up+OAkOS/ruWkjeOAkeS9v+eUqCBteWdsb2JhbC5zb2NrZXQg6I635Y+W5bey6L+e5o6l55qE5a6e5L6L77yM6ICM5LiN5piv5q+P5qyh5Yib5bu65paw5a6e5L6LXG4gICAgICAgIHZhciBzb2NrZXRDdHJJbnN0YW5jZSA9IHdpbmRvdy5teWdsb2JhbCAmJiB3aW5kb3cubXlnbG9iYWwuc29ja2V0ID8gd2luZG93Lm15Z2xvYmFsLnNvY2tldCA6IG51bGw7XG4gICAgICAgIGlmICghc29ja2V0Q3RySW5zdGFuY2UpIHtcbiAgICAgICAgICAgIGNhbGxiYWNrICYmIGNhbGxiYWNrKCdXZWJTb2NrZXTmnKrliJ3lp4vljJbvvIzor7fliLfmlrDpobXpnaLph43or5UnLCBudWxsKTtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgICBcbiAgICAgICAgLy8g5qOA5p+lIFdlYlNvY2tldCDov57mjqXnirbmgIFcbiAgICAgICAgaWYgKCFzb2NrZXRDdHJJbnN0YW5jZS5pc0Nvbm5lY3RlZCB8fCB0eXBlb2Ygc29ja2V0Q3RySW5zdGFuY2UuaXNDb25uZWN0ZWQgIT09ICdmdW5jdGlvbicpIHtcbiAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoXCLwn4+f77iPIFtBcmVuYURhdGFdIHNvY2tldEN0ci5pc0Nvbm5lY3RlZCDkuI3mmK/lh73mlbBcIik7XG4gICAgICAgICAgICBjYWxsYmFjayAmJiBjYWxsYmFjaygnV2ViU29ja2V06L+e5o6l54q25oCB5byC5bi477yM6K+35Yi35paw6aG16Z2i6YeN6K+VJywgbnVsbCk7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgICAgXG4gICAgICAgIGlmICghc29ja2V0Q3RySW5zdGFuY2UuaXNDb25uZWN0ZWQoKSB8fCAhc29ja2V0Q3RySW5zdGFuY2UuaXNXZWJTb2NrZXRPcGVuKCkpIHtcbiAgICAgICAgICAgIGNhbGxiYWNrICYmIGNhbGxiYWNrKCdXZWJTb2NrZXTmnKrov57mjqXvvIzor7fnqI3lkI7ph43or5UnLCBudWxsKTtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgICBcbiAgICAgICAgY29uc29sZS5sb2coXCLwn4+f77iPIFtBcmVuYURhdGFdIOmAmui/hyBXZWJTb2NrZXQg5Y+R6YCB5Y+W5raI5oql5ZCN6K+35rGCLCByb29tSWQ6XCIsIHJvb21JZCk7XG4gICAgICAgIFxuICAgICAgICAvLyDmoIforrDmmK/lkKblt7Llk43lupTvvIjpmLLmraLph43lpI3lm57osIPvvIlcbiAgICAgICAgdmFyIHJlc3BvbmRlZCA9IGZhbHNlO1xuICAgICAgICB2YXIgdGltZW91dElkID0gbnVsbDtcbiAgICAgICAgXG4gICAgICAgIC8vIOa4heeQhuWHveaVsO+8iOenu+mZpOebkeWQrOWZqOWSjOi2heaXtu+8iVxuICAgICAgICB2YXIgY2xlYW51cCA9IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgaWYgKHRpbWVvdXRJZCkgY2xlYXJUaW1lb3V0KHRpbWVvdXRJZCk7XG4gICAgICAgICAgICAvLyDnp7vpmaTnm5HlkKzlmajvvIzpmLLmraLlhoXlrZjms4TmvI9cbiAgICAgICAgICAgIHNvY2tldEN0ckluc3RhbmNlLm9mZkFyZW5hQ2FuY2VsU3VjY2VzcyhzdWNjZXNzSGFuZGxlcik7XG4gICAgICAgICAgICBzb2NrZXRDdHJJbnN0YW5jZS5vZmZBcmVuYUNhbmNlbEZhaWxlZChmYWlsZWRIYW5kbGVyKTtcbiAgICAgICAgfTtcbiAgICAgICAgXG4gICAgICAgIC8vIOaIkOWKn+Wbnuiwg1xuICAgICAgICB2YXIgc3VjY2Vzc0hhbmRsZXIgPSBmdW5jdGlvbihkYXRhKSB7XG4gICAgICAgICAgICBpZiAocmVzcG9uZGVkKSByZXR1cm47XG4gICAgICAgICAgICBpZiAoZGF0YS5yb29tX2lkICE9PSByb29tSWQpIHJldHVybjsgLy8g5LiN5piv5b2T5YmN5oi/6Ze055qE5ZON5bqUXG4gICAgICAgICAgICBcbiAgICAgICAgICAgIHJlc3BvbmRlZCA9IHRydWU7XG4gICAgICAgICAgICBjbGVhbnVwKCk7XG4gICAgICAgICAgICBcbiAgICAgICAgICAgIC8vIOa4hemZpOaKpeWQjeiusOW9lVxuICAgICAgICAgICAgZGVsZXRlIHRoYXQuX3NpZ25lZFVwQXJlbmFzW3Jvb21JZF07XG4gICAgICAgICAgICBcbiAgICAgICAgICAgIC8vIOS/neWtmOWIsOacrOWcsOWtmOWCqFxuICAgICAgICAgICAgdGhhdC5zYXZlVG9Mb2NhbCgpO1xuICAgICAgICAgICAgXG4gICAgICAgICAgICAvLyDmm7TmlrDnjqnlrrbnq57mioDluIHkvZnpop1cbiAgICAgICAgICAgIGlmICh3aW5kb3cubXlnbG9iYWwgJiYgd2luZG93Lm15Z2xvYmFsLnBsYXllckRhdGEgJiYgZGF0YS5iYWxhbmNlX2FmdGVyICE9PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICAgICAgICB3aW5kb3cubXlnbG9iYWwucGxheWVyRGF0YS5hcmVuYV9jb2luID0gZGF0YS5iYWxhbmNlX2FmdGVyO1xuICAgICAgICAgICAgICAgIHdpbmRvdy5teWdsb2JhbC5wbGF5ZXJEYXRhLnNhdmVUb0xvY2FsKCk7XG4gICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgLy8g8J+Up+OAkOaWsOWinuOAkeinpuWPkeWFqOWxgOS6i+S7tu+8jOmAmuefpeWkp+WOheWIt+aWsFVJXG4gICAgICAgICAgICAgICAgaWYgKHdpbmRvdy5teWdsb2JhbC5ldmVudGxpc3Rlcikge1xuICAgICAgICAgICAgICAgICAgICB3aW5kb3cubXlnbG9iYWwuZXZlbnRsaXN0ZXIuZmlyZSgnYXJlbmFfY29pbl91cGRhdGVkJywge1xuICAgICAgICAgICAgICAgICAgICAgICAgYXJlbmFfY29pbjogZGF0YS5iYWxhbmNlX2FmdGVyXG4gICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIFxuICAgICAgICAgICAgLy8g5riF6Zmk5YCS6K6h5pe25a6a5pe25ZmoXG4gICAgICAgICAgICBpZiAodGhhdC5fY291bnRkb3duVGltZXJzW3Jvb21JZF0pIHtcbiAgICAgICAgICAgICAgICBjbGVhckludGVydmFsKHRoYXQuX2NvdW50ZG93blRpbWVyc1tyb29tSWRdKTtcbiAgICAgICAgICAgICAgICBkZWxldGUgdGhhdC5fY291bnRkb3duVGltZXJzW3Jvb21JZF07XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBcbiAgICAgICAgICAgIC8vIOmAmuefpeeKtuaAgeWPmOabtFxuICAgICAgICAgICAgdGhhdC5fbm90aWZ5U3RhdHVzQ2hhbmdlKHJvb21JZCwgJ2NhbmNlbGxlZCcpO1xuICAgICAgICAgICAgXG4gICAgICAgICAgICBjYWxsYmFjayAmJiBjYWxsYmFjayhudWxsLCB7IFxuICAgICAgICAgICAgICAgIHN1Y2Nlc3M6IHRydWUsIFxuICAgICAgICAgICAgICAgIG1lc3NhZ2U6ICflj5bmtojmiqXlkI3miJDlip8nLFxuICAgICAgICAgICAgICAgIHJlZnVuZF9hbW91bnQ6IGRhdGEucmVmdW5kX2Ftb3VudCxcbiAgICAgICAgICAgICAgICBiYWxhbmNlX2FmdGVyOiBkYXRhLmJhbGFuY2VfYWZ0ZXJcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9O1xuICAgICAgICBcbiAgICAgICAgLy8g5aSx6LSl5Zue6LCDXG4gICAgICAgIHZhciBmYWlsZWRIYW5kbGVyID0gZnVuY3Rpb24oZGF0YSkge1xuICAgICAgICAgICAgaWYgKHJlc3BvbmRlZCkgcmV0dXJuO1xuICAgICAgICAgICAgcmVzcG9uZGVkID0gdHJ1ZTtcbiAgICAgICAgICAgIGNsZWFudXAoKTtcbiAgICAgICAgICAgIGNhbGxiYWNrICYmIGNhbGxiYWNrKGRhdGEubWVzc2FnZSB8fCAn5Y+W5raI5oql5ZCN5aSx6LSlJywgbnVsbCk7XG4gICAgICAgIH07XG4gICAgICAgIFxuICAgICAgICAvLyDms6jlhoznm5HlkKxcbiAgICAgICAgc29ja2V0Q3RySW5zdGFuY2Uub25BcmVuYUNhbmNlbFN1Y2Nlc3Moc3VjY2Vzc0hhbmRsZXIpO1xuICAgICAgICBzb2NrZXRDdHJJbnN0YW5jZS5vbkFyZW5hQ2FuY2VsRmFpbGVkKGZhaWxlZEhhbmRsZXIpO1xuICAgICAgICBcbiAgICAgICAgLy8g6K6+572u6LaF5pe277yIMTDnp5LvvIlcbiAgICAgICAgdGltZW91dElkID0gc2V0VGltZW91dChmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIGlmIChyZXNwb25kZWQpIHJldHVybjtcbiAgICAgICAgICAgIHJlc3BvbmRlZCA9IHRydWU7XG4gICAgICAgICAgICBjYWxsYmFjayAmJiBjYWxsYmFjaygn5Y+W5raI5oql5ZCN6K+35rGC6LaF5pe277yM6K+36YeN6K+VJywgbnVsbCk7XG4gICAgICAgIH0sIDEwMDAwKTtcbiAgICAgICAgXG4gICAgICAgIC8vIOWPkemAgeWPlua2iOaKpeWQjeivt+axglxuICAgICAgICBzb2NrZXRDdHJJbnN0YW5jZS5zZW5kQXJlbmFDYW5jZWxTaWdudXAoeyByb29tX2lkOiByb29tSWQgfSk7XG4gICAgfTtcbiAgICBcbiAgICAvKipcbiAgICAgKiDojrflj5blt7LmiqXlkI3nirbmgIFcbiAgICAgKiBAcGFyYW0ge051bWJlcn0gcm9vbUlkIC0g56ue5oqA5Zy65oi/6Ze0SURcbiAgICAgKiBAcmV0dXJucyB7T2JqZWN0fG51bGx9IOaKpeWQjeS/oeaBr+aIlm51bGxcbiAgICAgKi9cbiAgICB0aGF0LmdldFNpZ251cFN0YXR1cyA9IGZ1bmN0aW9uKHJvb21JZCkge1xuICAgICAgICByZXR1cm4gdGhhdC5fc2lnbmVkVXBBcmVuYXNbcm9vbUlkXSB8fCBudWxsO1xuICAgIH07XG4gICAgXG4gICAgLyoqXG4gICAgICog5qOA5p+l5piv5ZCm5bey5oql5ZCNXG4gICAgICogQHBhcmFtIHtOdW1iZXJ9IHJvb21JZCAtIOernuaKgOWcuuaIv+mXtElEXG4gICAgICogQHJldHVybnMge0Jvb2xlYW59XG4gICAgICovXG4gICAgdGhhdC5pc1NpZ25lZFVwID0gZnVuY3Rpb24ocm9vbUlkKSB7XG4gICAgICAgIHJldHVybiAhIXRoYXQuX3NpZ25lZFVwQXJlbmFzW3Jvb21JZF07XG4gICAgfTtcbiAgICBcbiAgICAvKipcbiAgICAgKiDojrflj5blvIDotZvlgJLorqHml7bvvIjnp5LvvIlcbiAgICAgKiBAcGFyYW0ge051bWJlcn0gcm9vbUlkIC0g56ue5oqA5Zy65oi/6Ze0SURcbiAgICAgKiBAcmV0dXJucyB7TnVtYmVyfSDlgJLorqHml7bnp5LmlbDvvIwtMeihqOekuuacquaKpeWQjeaIluaXoOWAkuiuoeaXtlxuICAgICAqL1xuICAgIHRoYXQuZ2V0Q291bnRkb3duID0gZnVuY3Rpb24ocm9vbUlkKSB7XG4gICAgICAgIHZhciBzaWdudXAgPSB0aGF0Ll9zaWduZWRVcEFyZW5hc1tyb29tSWRdO1xuICAgICAgICBpZiAoIXNpZ251cCB8fCAhc2lnbnVwLmNvdW50ZG93bkVuZCkge1xuICAgICAgICAgICAgcmV0dXJuIC0xO1xuICAgICAgICB9XG4gICAgICAgIFxuICAgICAgICB2YXIgbm93ID0gRGF0ZS5ub3coKTtcbiAgICAgICAgdmFyIHJlbWFpbmluZyA9IE1hdGguZmxvb3IoKHNpZ251cC5jb3VudGRvd25FbmQgLSBub3cpIC8gMTAwMCk7XG4gICAgICAgIHJldHVybiByZW1haW5pbmcgPiAwID8gcmVtYWluaW5nIDogMDtcbiAgICB9O1xuICAgIFxuICAgIC8qKlxuICAgICAqIOagvOW8j+WMluWAkuiuoeaXtuaYvuekulxuICAgICAqIEBwYXJhbSB7TnVtYmVyfSBzZWNvbmRzIC0g56eS5pWwXG4gICAgICogQHJldHVybnMge1N0cmluZ30g5qC85byP5YyW5ZCO55qE5pe26Ze05a2X56ym5LiyXG4gICAgICovXG4gICAgdGhhdC5mb3JtYXRDb3VudGRvd24gPSBmdW5jdGlvbihzZWNvbmRzKSB7XG4gICAgICAgIGlmIChzZWNvbmRzIDwgMCkgcmV0dXJuICcnO1xuICAgICAgICBpZiAoc2Vjb25kcyA9PT0gMCkgcmV0dXJuICfljbPlsIblvIDotZsnO1xuICAgICAgICBcbiAgICAgICAgdmFyIGhvdXJzID0gTWF0aC5mbG9vcihzZWNvbmRzIC8gMzYwMCk7XG4gICAgICAgIHZhciBtaW51dGVzID0gTWF0aC5mbG9vcigoc2Vjb25kcyAlIDM2MDApIC8gNjApO1xuICAgICAgICB2YXIgc2VjcyA9IHNlY29uZHMgJSA2MDtcbiAgICAgICAgXG4gICAgICAgIGlmIChob3VycyA+IDApIHtcbiAgICAgICAgICAgIHJldHVybiBob3VycyArICc6JyArIChtaW51dGVzIDwgMTAgPyAnMCcgOiAnJykgKyBtaW51dGVzICsgJzonICsgKHNlY3MgPCAxMCA/ICcwJyA6ICcnKSArIHNlY3M7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICByZXR1cm4gKG1pbnV0ZXMgPCAxMCA/ICcwJyA6ICcnKSArIG1pbnV0ZXMgKyAnOicgKyAoc2VjcyA8IDEwID8gJzAnIDogJycpICsgc2VjcztcbiAgICAgICAgfVxuICAgIH07XG4gICAgXG4gICAgLyoqXG4gICAgICog6I635Y+W56ue5oqA5Zy66YWN572uXG4gICAgICogQHBhcmFtIHtOdW1iZXJ9IHJvb21JZCAtIOernuaKgOWcuuaIv+mXtElEXG4gICAgICogQHJldHVybnMge09iamVjdHxudWxsfVxuICAgICAqL1xuICAgIHRoYXQuZ2V0QXJlbmFDb25maWcgPSBmdW5jdGlvbihyb29tSWQpIHtcbiAgICAgICAgcmV0dXJuIHRoYXQuX2FyZW5hRGV0YWlsc1tyb29tSWRdIHx8IG51bGw7XG4gICAgfTtcbiAgICBcbiAgICAvKipcbiAgICAgKiDojrflj5bmiqXlkI3otLlcbiAgICAgKiBAcGFyYW0ge09iamVjdH0gcm9vbUNvbmZpZyAtIOaIv+mXtOmFjee9rlxuICAgICAqIEByZXR1cm5zIHtOdW1iZXJ9IOaKpeWQjei0ue+8iOernuaKgOW4ge+8iVxuICAgICAqL1xuICAgIHRoYXQuZ2V0U2lnbnVwRmVlID0gZnVuY3Rpb24ocm9vbUNvbmZpZykge1xuICAgICAgICByZXR1cm4gcm9vbUNvbmZpZy5zaWdudXBfZmVlIHx8IHJvb21Db25maWcuc2lnbnVwRmVlIHx8IDA7XG4gICAgfTtcbiAgICBcbiAgICAvKipcbiAgICAgKiDojrflj5blhqDlhpvlpZblirHpooTop4hcbiAgICAgKiBAcGFyYW0ge09iamVjdH0gcm9vbUNvbmZpZyAtIOaIv+mXtOmFjee9rlxuICAgICAqIEByZXR1cm5zIHtPYmplY3R9IHsgY29pbnM6IE51bWJlciwgaXRlbXM6IEFycmF5IH1cbiAgICAgKi9cbiAgICB0aGF0LmdldENoYW1waW9uUmV3YXJkID0gZnVuY3Rpb24ocm9vbUNvbmZpZykge1xuICAgICAgICByZXR1cm4gcm9vbUNvbmZpZy5jaGFtcGlvbl9yZXdhcmQgfHwgcm9vbUNvbmZpZy5jaGFtcGlvblJld2FyZCB8fCB7IGNvaW5zOiAwLCBpdGVtczogW10gfTtcbiAgICB9O1xuICAgIFxuICAgIC8qKlxuICAgICAqIOingueci+W5v+WRiuiOt+WPluWlluWKsVxuICAgICAqIEBwYXJhbSB7U3RyaW5nfSB0eXBlIC0g5aWW5Yqx57G75Z6LICgnZ29sZCcg5oiWICdhcmVuYV9jb2luJylcbiAgICAgKiBAcGFyYW0ge0Z1bmN0aW9ufSBjYWxsYmFjayAtIOWbnuiwg+WHveaVsCAoZXJyLCByZXN1bHQpXG4gICAgICovXG4gICAgdGhhdC53YXRjaEFkRm9yUmV3YXJkID0gZnVuY3Rpb24odHlwZSwgY2FsbGJhY2spIHtcbiAgICAgICAgdmFyIGFwaVVybCA9IHdpbmRvdy5kZWZpbmVzID8gd2luZG93LmRlZmluZXMuYXBpVXJsIDogJyc7XG4gICAgICAgIHZhciBjcnlwdG9LZXkgPSB3aW5kb3cuZGVmaW5lcyA/IHdpbmRvdy5kZWZpbmVzLmNyeXB0b0tleSA6ICcnO1xuICAgICAgICB2YXIgdG9rZW4gPSB3aW5kb3cubXlnbG9iYWwgJiYgd2luZG93Lm15Z2xvYmFsLnBsYXllckRhdGEgPyB3aW5kb3cubXlnbG9iYWwucGxheWVyRGF0YS50b2tlbiA6ICcnO1xuICAgICAgICBcbiAgICAgICAgaWYgKCFhcGlVcmwgfHwgIXdpbmRvdy5IdHRwQVBJKSB7XG4gICAgICAgICAgICBjYWxsYmFjayAmJiBjYWxsYmFjaygnQVBJ5pyq6YWN572uJywgbnVsbCk7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgICAgXG4gICAgICAgIHZhciByZXF1ZXN0RGF0YSA9IHtcbiAgICAgICAgICAgIHRva2VuOiB0b2tlbixcbiAgICAgICAgICAgIHR5cGU6IHR5cGUsXG4gICAgICAgICAgICBhZF90eXBlOiAncmV3YXJkX3ZpZGVvJ1xuICAgICAgICB9O1xuICAgICAgICBcbiAgICAgICAgSHR0cEFQSS5wb3N0KFxuICAgICAgICAgICAgYXBpVXJsICsgJy9hcGkvYWQvcmV3YXJkJyxcbiAgICAgICAgICAgIHJlcXVlc3REYXRhLFxuICAgICAgICAgICAgY3J5cHRvS2V5LFxuICAgICAgICAgICAgZnVuY3Rpb24oZXJyLCByZXN1bHQpIHtcbiAgICAgICAgICAgICAgICBpZiAoZXJyKSB7XG4gICAgICAgICAgICAgICAgICAgIGNhbGxiYWNrICYmIGNhbGxiYWNrKGVyciwgbnVsbCk7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgaWYgKHJlc3VsdCAmJiAocmVzdWx0LmNvZGUgPT09IDAgfHwgcmVzdWx0LnN1Y2Nlc3MpKSB7XG4gICAgICAgICAgICAgICAgICAgIC8vIOabtOaWsOeOqeWutuaVsOaNrlxuICAgICAgICAgICAgICAgICAgICBpZiAod2luZG93Lm15Z2xvYmFsICYmIHdpbmRvdy5teWdsb2JhbC5wbGF5ZXJEYXRhKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAocmVzdWx0LmRhdGEpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAocmVzdWx0LmRhdGEuZ29sZCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB3aW5kb3cubXlnbG9iYWwucGxheWVyRGF0YS5nb2JhbF9jb3VudCA9IHJlc3VsdC5kYXRhLmdvbGQ7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChyZXN1bHQuZGF0YS5hcmVuYV9jb2luKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHdpbmRvdy5teWdsb2JhbC5wbGF5ZXJEYXRhLmFyZW5hX2NvaW4gPSByZXN1bHQuZGF0YS5hcmVuYV9jb2luO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB3aW5kb3cubXlnbG9iYWwucGxheWVyRGF0YS5zYXZlVG9Mb2NhbCgpO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgICAgICBjYWxsYmFjayAmJiBjYWxsYmFjayhudWxsLCB7XG4gICAgICAgICAgICAgICAgICAgICAgICBzdWNjZXNzOiB0cnVlLFxuICAgICAgICAgICAgICAgICAgICAgICAgcmV3YXJkOiByZXN1bHQuZGF0YSB8fCB7fVxuICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICBjYWxsYmFjayAmJiBjYWxsYmFjayhyZXN1bHQgPyByZXN1bHQubWVzc2FnZSA6ICfojrflj5blpZblirHlpLHotKUnLCBudWxsKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICk7XG4gICAgfTtcbiAgICBcbiAgICAvKipcbiAgICAgKiDliLfmlrDnjqnlrrbotKfluIHkvZnpop1cbiAgICAgKiBAcGFyYW0ge0Z1bmN0aW9ufSBjYWxsYmFjayAtIOWbnuiwg+WHveaVsCAoZXJyLCBkYXRhKVxuICAgICAqL1xuICAgIHRoYXQucmVmcmVzaEJhbGFuY2UgPSBmdW5jdGlvbihjYWxsYmFjaykge1xuICAgICAgICB2YXIgYXBpVXJsID0gd2luZG93LmRlZmluZXMgPyB3aW5kb3cuZGVmaW5lcy5hcGlVcmwgOiAnJztcbiAgICAgICAgdmFyIGNyeXB0b0tleSA9IHdpbmRvdy5kZWZpbmVzID8gd2luZG93LmRlZmluZXMuY3J5cHRvS2V5IDogJyc7XG4gICAgICAgIHZhciB0b2tlbiA9IHdpbmRvdy5teWdsb2JhbCAmJiB3aW5kb3cubXlnbG9iYWwucGxheWVyRGF0YSA/IHdpbmRvdy5teWdsb2JhbC5wbGF5ZXJEYXRhLnRva2VuIDogJyc7XG4gICAgICAgIFxuICAgICAgICBpZiAoIWFwaVVybCB8fCAhd2luZG93Lkh0dHBBUEkpIHtcbiAgICAgICAgICAgIGNhbGxiYWNrICYmIGNhbGxiYWNrKCdBUEnmnKrphY3nva4nLCBudWxsKTtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgICBcbiAgICAgICAgSHR0cEFQSS5nZXQoXG4gICAgICAgICAgICBhcGlVcmwgKyAnL2FwaS92MS9wbGF5ZXIvYmFsYW5jZT90b2tlbj0nICsgZW5jb2RlVVJJQ29tcG9uZW50KHRva2VuKSxcbiAgICAgICAgICAgIGNyeXB0b0tleSxcbiAgICAgICAgICAgIGZ1bmN0aW9uKGVyciwgcmVzdWx0KSB7XG4gICAgICAgICAgICAgICAgaWYgKGVycikge1xuICAgICAgICAgICAgICAgICAgICBjYWxsYmFjayAmJiBjYWxsYmFjayhlcnIsIG51bGwpO1xuICAgICAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgIGlmIChyZXN1bHQgJiYgKHJlc3VsdC5jb2RlID09PSAwIHx8IHJlc3VsdC5kYXRhKSkge1xuICAgICAgICAgICAgICAgICAgICB2YXIgZGF0YSA9IHJlc3VsdC5kYXRhIHx8IHJlc3VsdDtcbiAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgICAgIC8vIOabtOaWsOeOqeWutuaVsOaNrlxuICAgICAgICAgICAgICAgICAgICBpZiAod2luZG93Lm15Z2xvYmFsICYmIHdpbmRvdy5teWdsb2JhbC5wbGF5ZXJEYXRhKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoZGF0YS5nb2xkICE9PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB3aW5kb3cubXlnbG9iYWwucGxheWVyRGF0YS5nb2JhbF9jb3VudCA9IGRhdGEuZ29sZDtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChkYXRhLmFyZW5hX2NvaW4gIT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHdpbmRvdy5teWdsb2JhbC5wbGF5ZXJEYXRhLmFyZW5hX2NvaW4gPSBkYXRhLmFyZW5hX2NvaW47XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICB3aW5kb3cubXlnbG9iYWwucGxheWVyRGF0YS5zYXZlVG9Mb2NhbCgpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgICAgICBjYWxsYmFjayAmJiBjYWxsYmFjayhudWxsLCBkYXRhKTtcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICBjYWxsYmFjayAmJiBjYWxsYmFjayhyZXN1bHQgPyByZXN1bHQubWVzc2FnZSA6ICfojrflj5bkvZnpop3lpLHotKUnLCBudWxsKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICk7XG4gICAgfTtcbiAgICBcbiAgICAvLyA9PT09PT09PT09PT09PT09PT09PSDnirbmgIHnm5HlkKwgPT09PT09PT09PT09PT09PT09PT1cbiAgICBcbiAgICAvKipcbiAgICAgKiDmt7vliqDnirbmgIHlj5jmm7Tnm5HlkKzlmahcbiAgICAgKiBAcGFyYW0ge0Z1bmN0aW9ufSBsaXN0ZW5lciAtIOebkeWQrOWHveaVsCAocm9vbUlkLCBzdGF0dXMpXG4gICAgICovXG4gICAgdGhhdC5hZGRTdGF0dXNMaXN0ZW5lciA9IGZ1bmN0aW9uKGxpc3RlbmVyKSB7XG4gICAgICAgIHRoYXQuX3N0YXR1c0xpc3RlbmVycy5wdXNoKGxpc3RlbmVyKTtcbiAgICB9O1xuICAgIFxuICAgIC8qKlxuICAgICAqIOenu+mZpOeKtuaAgeWPmOabtOebkeWQrOWZqFxuICAgICAqIEBwYXJhbSB7RnVuY3Rpb259IGxpc3RlbmVyIC0g55uR5ZCs5Ye95pWwXG4gICAgICovXG4gICAgdGhhdC5yZW1vdmVTdGF0dXNMaXN0ZW5lciA9IGZ1bmN0aW9uKGxpc3RlbmVyKSB7XG4gICAgICAgIHZhciBpbmRleCA9IHRoYXQuX3N0YXR1c0xpc3RlbmVycy5pbmRleE9mKGxpc3RlbmVyKTtcbiAgICAgICAgaWYgKGluZGV4ID4gLTEpIHtcbiAgICAgICAgICAgIHRoYXQuX3N0YXR1c0xpc3RlbmVycy5zcGxpY2UoaW5kZXgsIDEpO1xuICAgICAgICB9XG4gICAgfTtcbiAgICBcbiAgICAvKipcbiAgICAgKiDpgJrnn6XnirbmgIHlj5jmm7RcbiAgICAgKiBAcGFyYW0ge051bWJlcn0gcm9vbUlkIC0g5oi/6Ze0SURcbiAgICAgKiBAcGFyYW0ge1N0cmluZ30gc3RhdHVzIC0g5paw54q25oCBXG4gICAgICovXG4gICAgdGhhdC5fbm90aWZ5U3RhdHVzQ2hhbmdlID0gZnVuY3Rpb24ocm9vbUlkLCBzdGF0dXMpIHtcbiAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCB0aGF0Ll9zdGF0dXNMaXN0ZW5lcnMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgICAgdGhhdC5fc3RhdHVzTGlzdGVuZXJzW2ldKHJvb21JZCwgc3RhdHVzKTtcbiAgICAgICAgICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgICAgICAgICAgICBjb25zb2xlLmVycm9yKCfnirbmgIHnm5HlkKzlmajmiafooYzplJnor686JywgZSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9O1xuICAgIFxuICAgIC8vID09PT09PT09PT09PT09PT09PT09IOWAkuiuoeaXtueuoeeQhiA9PT09PT09PT09PT09PT09PT09PVxuICAgIFxuICAgIC8qKlxuICAgICAqIOWQr+WKqOWAkuiuoeaXtuabtOaWsFxuICAgICAqIEBwYXJhbSB7TnVtYmVyfSByb29tSWQgLSDmiL/pl7RJRFxuICAgICAqIEBwYXJhbSB7RnVuY3Rpb259IG9uVXBkYXRlIC0g5pu05paw5Zue6LCDIChzZWNvbmRzKVxuICAgICAqL1xuICAgIHRoYXQuc3RhcnRDb3VudGRvd24gPSBmdW5jdGlvbihyb29tSWQsIG9uVXBkYXRlKSB7XG4gICAgICAgIC8vIOa4hemZpOaXp+eahOWumuaXtuWZqFxuICAgICAgICBpZiAodGhhdC5fY291bnRkb3duVGltZXJzW3Jvb21JZF0pIHtcbiAgICAgICAgICAgIGNsZWFySW50ZXJ2YWwodGhhdC5fY291bnRkb3duVGltZXJzW3Jvb21JZF0pO1xuICAgICAgICB9XG4gICAgICAgIFxuICAgICAgICB0aGF0Ll9jb3VudGRvd25UaW1lcnNbcm9vbUlkXSA9IHNldEludGVydmFsKGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgdmFyIHNlY29uZHMgPSB0aGF0LmdldENvdW50ZG93bihyb29tSWQpO1xuICAgICAgICAgICAgb25VcGRhdGUgJiYgb25VcGRhdGUoc2Vjb25kcyk7XG4gICAgICAgICAgICBcbiAgICAgICAgICAgIC8vIOWAkuiuoeaXtue7k+adn1xuICAgICAgICAgICAgaWYgKHNlY29uZHMgPD0gMCkge1xuICAgICAgICAgICAgICAgIGNsZWFySW50ZXJ2YWwodGhhdC5fY291bnRkb3duVGltZXJzW3Jvb21JZF0pO1xuICAgICAgICAgICAgICAgIGRlbGV0ZSB0aGF0Ll9jb3VudGRvd25UaW1lcnNbcm9vbUlkXTtcbiAgICAgICAgICAgICAgICB0aGF0Ll9ub3RpZnlTdGF0dXNDaGFuZ2Uocm9vbUlkLCAnc3RhcnRpbmcnKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSwgMTAwMCk7XG4gICAgfTtcbiAgICBcbiAgICAvKipcbiAgICAgKiDlgZzmraLlgJLorqHml7ZcbiAgICAgKiBAcGFyYW0ge051bWJlcn0gcm9vbUlkIC0g5oi/6Ze0SURcbiAgICAgKi9cbiAgICB0aGF0LnN0b3BDb3VudGRvd24gPSBmdW5jdGlvbihyb29tSWQpIHtcbiAgICAgICAgaWYgKHRoYXQuX2NvdW50ZG93blRpbWVyc1tyb29tSWRdKSB7XG4gICAgICAgICAgICBjbGVhckludGVydmFsKHRoYXQuX2NvdW50ZG93blRpbWVyc1tyb29tSWRdKTtcbiAgICAgICAgICAgIGRlbGV0ZSB0aGF0Ll9jb3VudGRvd25UaW1lcnNbcm9vbUlkXTtcbiAgICAgICAgfVxuICAgIH07XG4gICAgXG4gICAgLyoqXG4gICAgICog5riF6Zmk5omA5pyJ5YCS6K6h5pe2XG4gICAgICovXG4gICAgdGhhdC5jbGVhckFsbENvdW50ZG93bnMgPSBmdW5jdGlvbigpIHtcbiAgICAgICAgZm9yICh2YXIgcm9vbUlkIGluIHRoYXQuX2NvdW50ZG93blRpbWVycykge1xuICAgICAgICAgICAgY2xlYXJJbnRlcnZhbCh0aGF0Ll9jb3VudGRvd25UaW1lcnNbcm9vbUlkXSk7XG4gICAgICAgIH1cbiAgICAgICAgdGhhdC5fY291bnRkb3duVGltZXJzID0ge307XG4gICAgfTtcbiAgICBcbiAgICAvLyA9PT09PT09PT09PT09PT09PT09PSDmnKzlnLDlrZjlgqggPT09PT09PT09PT09PT09PT09PT1cbiAgICBcbiAgICAvKipcbiAgICAgKiDkv53lrZjmiqXlkI3nirbmgIHliLDmnKzlnLBcbiAgICAgKi9cbiAgICB0aGF0LnNhdmVUb0xvY2FsID0gZnVuY3Rpb24oKSB7XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgICB2YXIgZGF0YSA9IHtcbiAgICAgICAgICAgICAgICBzaWduZWRVcEFyZW5hczogdGhhdC5fc2lnbmVkVXBBcmVuYXMsXG4gICAgICAgICAgICAgICAgc2F2ZWRBdDogRGF0ZS5ub3coKVxuICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIGxvY2FsU3RvcmFnZS5zZXRJdGVtKCdhcmVuYV9kYXRhJywgSlNPTi5zdHJpbmdpZnkoZGF0YSkpO1xuICAgICAgICB9IGNhdGNoIChlKSB7XG4gICAgICAgICAgICBjb25zb2xlLmVycm9yKCfkv53lrZjnq57mioDlnLrmlbDmja7lpLHotKU6JywgZSk7XG4gICAgICAgIH1cbiAgICB9O1xuICAgIFxuICAgIC8qKlxuICAgICAqIOS7juacrOWcsOWKoOi9veaKpeWQjeeKtuaAgVxuICAgICAqL1xuICAgIHRoYXQubG9hZEZyb21Mb2NhbCA9IGZ1bmN0aW9uKCkge1xuICAgICAgICB0cnkge1xuICAgICAgICAgICAgdmFyIGRhdGFTdHIgPSBsb2NhbFN0b3JhZ2UuZ2V0SXRlbSgnYXJlbmFfZGF0YScpO1xuICAgICAgICAgICAgaWYgKGRhdGFTdHIpIHtcbiAgICAgICAgICAgICAgICB2YXIgZGF0YSA9IEpTT04ucGFyc2UoZGF0YVN0cik7XG4gICAgICAgICAgICAgICAgLy8g5qOA5p+l5pWw5o2u5piv5ZCm6L+H5pyf77yIMeWkqe+8iVxuICAgICAgICAgICAgICAgIGlmIChEYXRlLm5vdygpIC0gKGRhdGEuc2F2ZWRBdCB8fCAwKSA8IDI0ICogNjAgKiA2MCAqIDEwMDApIHtcbiAgICAgICAgICAgICAgICAgICAgdGhhdC5fc2lnbmVkVXBBcmVuYXMgPSBkYXRhLnNpZ25lZFVwQXJlbmFzIHx8IHt9O1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfSBjYXRjaCAoZSkge1xuICAgICAgICAgICAgY29uc29sZS5lcnJvcign5Yqg6L2956ue5oqA5Zy65pWw5o2u5aSx6LSlOicsIGUpO1xuICAgICAgICB9XG4gICAgfTtcbiAgICBcbiAgICAvKipcbiAgICAgKiDwn5Sn44CQ5paw5aKe44CR5LuO5pyN5Yqh56uv6I635Y+W5oql5ZCN54q25oCBXG4gICAgICogQHBhcmFtIHtGdW5jdGlvbn0gY2FsbGJhY2sgLSDlm57osIPlh73mlbAgKGVyciwgc2lnbmVkVXBSb29tcylcbiAgICAgKi9cbiAgICB0aGF0LmZldGNoU2lnbnVwU3RhdHVzRnJvbVNlcnZlciA9IGZ1bmN0aW9uKGNhbGxiYWNrKSB7XG4gICAgICAgIHZhciBhcGlVcmwgPSB3aW5kb3cuZGVmaW5lcyA/IHdpbmRvdy5kZWZpbmVzLmFwaVVybCA6ICcnO1xuICAgICAgICB2YXIgY3J5cHRvS2V5ID0gd2luZG93LmRlZmluZXMgPyB3aW5kb3cuZGVmaW5lcy5jcnlwdG9LZXkgOiAnJztcbiAgICAgICAgdmFyIHRva2VuID0gd2luZG93Lm15Z2xvYmFsICYmIHdpbmRvdy5teWdsb2JhbC5wbGF5ZXJEYXRhID8gd2luZG93Lm15Z2xvYmFsLnBsYXllckRhdGEudG9rZW4gOiAnJztcbiAgICAgICAgXG4gICAgICAgIGlmICghYXBpVXJsIHx8ICF3aW5kb3cuSHR0cEFQSSkge1xuICAgICAgICAgICAgY2FsbGJhY2sgJiYgY2FsbGJhY2soJ0FQSeacqumFjee9ricsIG51bGwpO1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIFxuICAgICAgICBIdHRwQVBJLmdldChcbiAgICAgICAgICAgIGFwaVVybCArICcvYXBpL3YxL2FyZW5hL3NpZ251cC1zdGF0dXM/dG9rZW49JyArIGVuY29kZVVSSUNvbXBvbmVudCh0b2tlbiksXG4gICAgICAgICAgICBjcnlwdG9LZXksXG4gICAgICAgICAgICBmdW5jdGlvbihlcnIsIHJlc3VsdCkge1xuICAgICAgICAgICAgICAgIGlmIChlcnIpIHtcbiAgICAgICAgICAgICAgICAgICAgY29uc29sZS5lcnJvcihcIvCfj5/vuI8gW2FyZW5hRGF0YV0g6I635Y+W5oql5ZCN54q25oCB5aSx6LSlOlwiLCBlcnIpO1xuICAgICAgICAgICAgICAgICAgICBjYWxsYmFjayAmJiBjYWxsYmFjayhlcnIsIG51bGwpO1xuICAgICAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgIHZhciBzaWduZWRVcFJvb21zID0gW107XG4gICAgICAgICAgICAgICAgaWYgKHJlc3VsdCAmJiAocmVzdWx0LmNvZGUgPT09IDAgfHwgcmVzdWx0LmRhdGEpKSB7XG4gICAgICAgICAgICAgICAgICAgIHZhciBkYXRhID0gcmVzdWx0LmRhdGEgfHwgcmVzdWx0O1xuICAgICAgICAgICAgICAgICAgICBzaWduZWRVcFJvb21zID0gZGF0YS5zaWduZWRfdXBfcm9vbXMgfHwgW107XG4gICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgICAgICAvLyDmm7TmlrDmnKzlnLDnvJPlrZhcbiAgICAgICAgICAgICAgICAgICAgdGhhdC5fc2lnbmVkVXBBcmVuYXMgPSB7fTtcbiAgICAgICAgICAgICAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBzaWduZWRVcFJvb21zLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICB2YXIgcm9vbSA9IHNpZ25lZFVwUm9vbXNbaV07XG4gICAgICAgICAgICAgICAgICAgICAgICB0aGF0Ll9zaWduZWRVcEFyZW5hc1tyb29tLnJvb21faWRdID0ge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHNpZ251cFRpbWU6IHJvb20uc2lnbnVwX3RpbWUsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgc3RhdHVzOiAnc2lnbmVkX3VwJyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBwZXJpb2RObzogcm9vbS5wZXJpb2Rfbm8sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgc2lnbnVwRmVlOiByb29tLnNpZ251cF9mZWVcbiAgICAgICAgICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgICAgIC8vIOS/neWtmOWIsOacrOWcsFxuICAgICAgICAgICAgICAgICAgICB0aGF0LnNhdmVUb0xvY2FsKCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgIGNhbGxiYWNrICYmIGNhbGxiYWNrKG51bGwsIHNpZ25lZFVwUm9vbXMpO1xuICAgICAgICAgICAgfVxuICAgICAgICApO1xuICAgIH07XG4gICAgXG4gICAgLyoqXG4gICAgICog5riF6Zmk5omA5pyJ5oql5ZCN54q25oCB77yI55So5LqO5rWL6K+V5oiW6YeN572u77yJXG4gICAgICovXG4gICAgdGhhdC5jbGVhckFsbFNpZ251cFN0YXR1cyA9IGZ1bmN0aW9uKCkge1xuICAgICAgICB0aGF0Ll9zaWduZWRVcEFyZW5hcyA9IHt9O1xuICAgICAgICB0aGF0LnNhdmVUb0xvY2FsKCk7XG4gICAgfTtcbiAgICBcbiAgICAvLyDliJ3lp4vljJbml7bliqDovb3mnKzlnLDmlbDmja5cbiAgICB0aGF0LmxvYWRGcm9tTG9jYWwoKTtcbiAgICBcbiAgICByZXR1cm4gdGhhdDtcbn0oKTtcbiJdfQ==