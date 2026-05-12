
                (function() {
                    var nodeEnv = typeof require !== 'undefined' && typeof process !== 'undefined';
                    var __module = nodeEnv ? module : {exports:{}};
                    var __filename = 'preview-scripts/assets/scripts/prefabs/phone_login.js';
                    var __require = nodeEnv ? function (request) {
                        return cc.require(request);
                    } : function (request) {
                        return __quick_compile_project__.require(request, __filename);
                    };
                    function __define (exports, require, module) {
                        if (!nodeEnv) {__quick_compile_project__.registerModule(__filename, module);}"use strict";
cc._RF.push(module, 'd8d26bcwexC2ICpbya9WK0B', 'phone_login');
// scripts/prefabs/phone_login.js

"use strict";

// 手机号登录弹窗控制器
// 用于处理手机号验证码登录功能
// 设计风格：中国风商业棋牌（响应式适配：宽度60%，高度自适应）

cc.Class({
  name: 'phone_login',
  "extends": cc.Component,
  properties: {
    // 输入框
    phone_input: {
      type: cc.EditBox,
      "default": null
    },
    code_input: {
      type: cc.EditBox,
      "default": null
    },
    // 按钮
    send_code_btn: {
      type: cc.Button,
      "default": null
    },
    login_btn: {
      type: cc.Button,
      "default": null
    },
    close_btn: {
      type: cc.Button,
      "default": null
    },
    // 微信登录按钮
    wx_login_btn: {
      type: cc.Sprite,
      "default": null
    },
    // 标签
    send_code_label: {
      type: cc.Label,
      "default": null
    },
    message_label: {
      type: cc.Label,
      "default": null
    },
    // 倒计时时间
    countdown_time: 60,
    // 基准设计尺寸（用于计算scale）
    BASE_WIDTH: 400,
    BASE_HEIGHT: 520
  },
  onLoad: function onLoad() {
    this._countdown = 0;
    this._phone = "";
    this._code = "";

    // 立即执行弹窗尺寸适配
    this.adaptDialog();

    // 监听屏幕尺寸变化
    var self = this;
    cc.view.setResizeCallback(function () {
      self.adaptDialog();
    });

    // 初始化弹窗动画
    this._initPanelAnimation();

    // 绘制圆角输入框边框
    this._drawInputBorders();

    // ==================== 初始化 EditBox 样式和事件 ====================
    this._initEditBoxes();

    // 初始化按钮事件
    this._initButtons();

    // 初始化微信登录按钮
    this._initWechatButton();
    this._hideMessage();

    // 获取输入框初始值
    if (this.phone_input) {
      this._phone = this.phone_input.string || "";
    }
    if (this.code_input) {
      this._code = this.code_input.string || "";
    }
  },
  // ==================== 初始化 EditBox ====================
  _initEditBoxes: function _initEditBoxes() {
    var self = this;

    // 手机号输入框初始化
    if (this.phone_input) {
      // 设置 stayOnTop 为 true，确保文字始终可见
      this.phone_input.stayOnTop = true;

      // 设置字体样式
      this.phone_input.fontSize = 20;
      this.phone_input.lineHeight = 40;
      this.phone_input.fontColor = new cc.Color(50, 50, 50, 255);
      this.phone_input.placeholderFontColor = new cc.Color(150, 150, 150, 255);

      // 监听输入事件
      this.phone_input.node.on('editing-did-began', function () {
        self._onPhoneInputFocus();
      }, this);
      this.phone_input.node.on('editing-did-ended', function () {
        self._onPhoneInputBlur();
      }, this);
      this.phone_input.node.on('text-changed', function (editbox) {
        self._phone = editbox.string;
      }, this);
    }

    // 验证码输入框初始化
    if (this.code_input) {
      // 设置 stayOnTop 为 true，确保文字始终可见
      this.code_input.stayOnTop = true;

      // 设置字体样式
      this.code_input.fontSize = 20;
      this.code_input.lineHeight = 40;
      this.code_input.fontColor = new cc.Color(50, 50, 50, 255);
      this.code_input.placeholderFontColor = new cc.Color(150, 150, 150, 255);

      // 监听输入事件
      this.code_input.node.on('editing-did-began', function () {
        self._onCodeInputFocus();
      }, this);
      this.code_input.node.on('editing-did-ended', function () {
        self._onCodeInputBlur();
      }, this);
      this.code_input.node.on('text-changed', function (editbox) {
        self._code = editbox.string;
      }, this);
    }
  },
  // 手机号输入框获得焦点
  _onPhoneInputFocus: function _onPhoneInputFocus() {
    // 可以添加焦点效果
  },
  // 手机号输入框失去焦点
  _onPhoneInputBlur: function _onPhoneInputBlur() {
    // 确保文字显示
    if (this.phone_input && this.phone_input.string) {
      this._phone = this.phone_input.string;
    }
  },
  // 验证码输入框获得焦点
  _onCodeInputFocus: function _onCodeInputFocus() {
    // 可以添加焦点效果
  },
  // 验证码输入框失去焦点
  _onCodeInputBlur: function _onCodeInputBlur() {
    // 确保文字显示
    if (this.code_input && this.code_input.string) {
      this._code = this.code_input.string;
    }
  },
  // =============================================
  // 响应式适配：宽度=屏幕60%，最小300，高度按比例
  // =============================================
  adaptDialog: function adaptDialog() {
    var panel = this.node.getChildByName('content_panel');
    if (!panel) return;
    var winW = cc.winSize.width;
    var winH = cc.winSize.height;

    // 目标宽度 = 屏幕宽度 * 60%
    var targetWidth = winW * 0.6;

    // 最小宽度300，最大宽度不超过屏幕80%
    targetWidth = Math.max(300, Math.min(targetWidth, winW * 0.8));

    // 计算缩放比例
    var scale = targetWidth / this.BASE_WIDTH;

    // 确保高度不超出屏幕（留出10%边距）
    var maxScaleY = winH * 0.8 / this.BASE_HEIGHT;
    scale = Math.min(scale, maxScaleY);

    // 限制缩放范围 [0.7, 1.3]
    scale = Math.max(0.7, Math.min(scale, 1.3));

    // 应用缩放
    panel.scale = scale;
    console.log('【登录弹窗】屏幕:', winW, 'x', winH, '目标宽度:', Math.round(targetWidth), '缩放:', scale.toFixed(2), '实际尺寸:', Math.round(this.BASE_WIDTH * scale), 'x', Math.round(this.BASE_HEIGHT * scale));
  },
  // 初始化弹窗进入动画
  _initPanelAnimation: function _initPanelAnimation() {
    var contentPanel = this.node.getChildByName('content_panel');
    if (contentPanel) {
      // 保存目标缩放值（已由_initPanelScale设置）
      var targetScale = contentPanel.scale;

      // 从小尺寸开始动画
      contentPanel.scale = targetScale * 0.7;
      contentPanel.opacity = 0;
      cc.tween(contentPanel).to(0.25, {
        scale: targetScale,
        opacity: 255
      }, {
        easing: 'backOut'
      }).start();
    }
  },
  // 绘制输入框圆角边框 - 修复版：绘制背景 + 边框
  _drawInputBorders: function _drawInputBorders() {
    var contentPanel = this.node.getChildByName('content_panel');
    if (!contentPanel) return;

    // 绘制手机号输入框背景和边框 (320x50)
    var phoneBg = contentPanel.getChildByName('phone_bg');
    if (phoneBg) {
      var graphics = phoneBg.getComponent(cc.Graphics);
      if (graphics) {
        graphics.clear();
        // 先绘制填充背景（半透明白色）
        graphics.fillColor = new cc.Color(255, 252, 240, 230);
        this._drawRoundRect(graphics, -160, -25, 320, 50, 14);
        graphics.fill();
        // 再绘制边框（金色）
        graphics.strokeColor = new cc.Color(218, 165, 32, 255);
        graphics.lineWidth = 2;
        this._drawRoundRect(graphics, -160, -25, 320, 50, 14);
        graphics.stroke();
      }

      // 确保 phone_bg 节点在 input 节点下方
      var phoneInput = phoneBg.getChildByName('phone_input');
      if (phoneInput) {
        phoneInput.zIndex = 10;
        phoneBg.zIndex = 5;
      }
    }

    // 绘制验证码输入框背景和边框 (190x50)
    var codeRow = contentPanel.getChildByName('code_row');
    if (codeRow) {
      var codeBg = codeRow.getChildByName('code_bg');
      if (codeBg) {
        var graphics = codeBg.getComponent(cc.Graphics);
        if (graphics) {
          graphics.clear();
          // 先绘制填充背景（半透明白色）
          graphics.fillColor = new cc.Color(255, 252, 240, 230);
          this._drawRoundRect(graphics, -95, -25, 190, 50, 14);
          graphics.fill();
          // 再绘制边框（金色）
          graphics.strokeColor = new cc.Color(218, 165, 32, 255);
          graphics.lineWidth = 2;
          this._drawRoundRect(graphics, -95, -25, 190, 50, 14);
          graphics.stroke();
        }

        // 确保 code_bg 节点在 input 节点下方
        var codeInput = codeBg.getChildByName('code_input');
        if (codeInput) {
          codeInput.zIndex = 10;
          codeBg.zIndex = 5;
        }
      }
    }

    // 绘制分割线
    var divider = contentPanel.getChildByName('divider');
    if (divider) {
      var graphics = divider.getComponent(cc.Graphics);
      if (graphics) {
        graphics.clear();
        graphics.strokeColor = new cc.Color(200, 180, 140, 180);
        graphics.lineWidth = 1;
        graphics.moveTo(-170, 0);
        graphics.lineTo(170, 0);
        graphics.stroke();
      }
    }
  },
  // 绘制圆角矩形
  _drawRoundRect: function _drawRoundRect(graphics, x, y, w, h, r) {
    graphics.moveTo(x + r, y);
    graphics.lineTo(x + w - r, y);
    graphics.arcTo(x + w, y, x + w, y + r, r);
    graphics.lineTo(x + w, y + h - r);
    graphics.arcTo(x + w, y + h, x + w - r, y + h, r);
    graphics.lineTo(x + r, y + h);
    graphics.arcTo(x, y + h, x, y + h - r, r);
    graphics.lineTo(x, y + r);
    graphics.arcTo(x, y, x + r, y, r);
  },
  // 初始化微信登录按钮
  _initWechatButton: function _initWechatButton() {
    var contentPanel = this.node.getChildByName('content_panel');
    if (!contentPanel) return;
    var wxContainer = contentPanel.getChildByName('wx_login_container');
    if (wxContainer) {
      var wxBtn = wxContainer.getChildByName('wx_login_btn');
      if (wxBtn) {
        // 添加按钮点击效果
        wxBtn.on(cc.Node.EventType.TOUCH_START, function () {
          wxBtn.scale = 0.95;
        }, this);
        wxBtn.on(cc.Node.EventType.TOUCH_END, function () {
          wxBtn.scale = 1;
          this._onWechatLoginClick();
        }, this);
        wxBtn.on(cc.Node.EventType.TOUCH_CANCEL, function () {
          wxBtn.scale = 1;
        }, this);

        // 添加"微信登录"文字标签
        this._createWechatLabel(wxContainer);
      }
    }
  },
  // 创建微信登录文字标签
  _createWechatLabel: function _createWechatLabel(container) {
    // 检查是否已存在标签
    var existLabel = container.getChildByName('wx_login_label');
    if (existLabel) return;
    var labelNode = new cc.Node('wx_login_label');
    labelNode.parent = container;
    labelNode.y = -35;
    var label = labelNode.addComponent(cc.Label);
    label.string = '微信登录';
    label.fontSize = 18;
    label.lineHeight = 22;
    label.fontFamily = 'Arial';
    label.fontColor = new cc.Color(120, 100, 80, 255);
    label.horizontalAlign = cc.Label.HorizontalAlign.CENTER;
  },
  _initButtons: function _initButtons() {
    var self = this;

    // 关闭按钮
    if (this.close_btn) {
      this.close_btn.node.off(cc.Node.EventType.TOUCH_END);
      this.close_btn.node.on(cc.Node.EventType.TOUCH_END, function () {
        self._onCloseClick();
      }, this);
    }

    // 发送验证码按钮
    if (this.send_code_btn) {
      this.send_code_btn.node.off(cc.Node.EventType.TOUCH_END);
      this.send_code_btn.node.on(cc.Node.EventType.TOUCH_END, function () {
        self._onSendCodeClick();
      }, this);
    }

    // 登录按钮
    if (this.login_btn) {
      this.login_btn.node.off(cc.Node.EventType.TOUCH_END);
      this.login_btn.node.on(cc.Node.EventType.TOUCH_END, function () {
        self._onLoginClick();
      }, this);
    }
  },
  // 微信登录点击
  _onWechatLoginClick: function _onWechatLoginClick() {
    console.log('【微信登录】点击微信登录按钮');

    // 检查是否有全局的微信登录方法
    if (window.myglobal && window.myglobal.wechatLogin) {
      window.myglobal.wechatLogin();
    } else {
      // 降级：提示用户
      this._showMessage('微信登录功能暂未开放', true);
    }
  },
  // 手机号输入变化
  onPhoneInputChanged: function onPhoneInputChanged(editbox, customEventData) {
    this._phone = editbox.string;
  },
  // 验证码输入变化
  onCodeInputChanged: function onCodeInputChanged(editbox, customEventData) {
    this._code = editbox.string;
  },
  // 发送验证码
  _onSendCodeClick: function _onSendCodeClick() {
    var self = this;
    if (this._countdown > 0) {
      return;
    }

    // 从输入框获取手机号
    if (this.phone_input) {
      this._phone = this.phone_input.string || "";
    }

    // 验证手机号
    if (!this._validatePhone(this._phone)) {
      this._showMessage("请输入正确的手机号", true);
      return;
    }
    this._showMessage("正在发送...", false);
    this._setInteractable(false);

    // 调用发送验证码接口
    this._sendCodeRequest(this._phone, function (success, message) {
      self._setInteractable(true);
      if (success) {
        self._startCountdown();
        self._showMessage("验证码已发送", false);
      } else {
        self._showMessage(message || "发送失败，请重试", true);
      }
    });
  },
  // 登录
  _onLoginClick: function _onLoginClick() {
    var self = this;

    // 从输入框获取值
    if (this.phone_input) {
      this._phone = this.phone_input.string || "";
    }
    if (this.code_input) {
      this._code = this.code_input.string || "";
    }

    // 验证输入
    if (!this._validatePhone(this._phone)) {
      this._showMessage("请输入正确的手机号", true);
      return;
    }
    if (!this._validateCode(this._code)) {
      this._showMessage("请输入验证码", true);
      return;
    }
    this._showMessage("正在登录...", false);
    this._setInteractable(false);

    // 调用登录接口
    this._phoneLoginRequest(this._phone, this._code, function (success, message, data) {
      self._setInteractable(true);
      if (success) {
        self._showMessage("登录成功", false);

        // 保存用户数据
        if (window.myglobal && window.myglobal.playerData && data) {
          window.myglobal.playerData.uniqueID = data.uniqueID || "";
          window.myglobal.playerData.accountID = data.accountID || "";
          window.myglobal.playerData.nickName = data.nickName || "玩家";
          window.myglobal.playerData.avatarUrl = data.avatarUrl || "";
          window.myglobal.playerData.gobal_count = data.goldcount || 0;
          window.myglobal.playerData.token = data.token || "";
          // 保存到本地存储
          window.myglobal.playerData.saveToLocal();
          console.log("【手机登录】用户数据已保存, nickName =", window.myglobal.playerData.nickName);
        }

        // 跳转到大厅场景
        self.scheduleOnce(function () {
          self._onCloseClick();
          cc.director.loadScene("hallScene");
        }, 0.5);
      } else {
        self._showMessage(message || "登录失败，请重试", true);
      }
    });
  },
  // 关闭弹窗
  _onCloseClick: function _onCloseClick() {
    if (this._countdown > 0) {
      this.unschedule(this._countdownTick);
    }
    this.node.destroy();
  },
  // 验证手机号
  _validatePhone: function _validatePhone(phone) {
    if (!phone || phone.length !== 11) {
      return false;
    }
    // 简单验证：以1开头的11位数字
    var reg = /^1[3-9]\d{9}$/;
    return reg.test(phone);
  },
  // 验证验证码
  _validateCode: function _validateCode(code) {
    // 保留非空检测，测试阶段不验证格式
    return code && code.length > 0;
  },
  // 开始倒计时
  _startCountdown: function _startCountdown() {
    this._countdown = this.countdown_time;
    this._updateCountdownLabel();
    this.schedule(this._countdownTick, 1);
  },
  // 倒计时每秒回调
  _countdownTick: function _countdownTick() {
    this._countdown--;
    if (this._countdown <= 0) {
      this.unschedule(this._countdownTick);
      this._resetSendCodeBtn();
    } else {
      this._updateCountdownLabel();
    }
  },
  // 更新倒计时标签
  _updateCountdownLabel: function _updateCountdownLabel() {
    if (this.send_code_label) {
      this.send_code_label.string = this._countdown + "秒后重试";
    }
    if (this.send_code_btn) {
      this.send_code_btn.interactable = false;
    }
  },
  // 重置发送验证码按钮
  _resetSendCodeBtn: function _resetSendCodeBtn() {
    if (this.send_code_label) {
      this.send_code_label.string = "获取验证码";
    }
    if (this.send_code_btn) {
      this.send_code_btn.interactable = true;
    }
  },
  // 显示消息
  _showMessage: function _showMessage(message, isError) {
    if (this.message_label) {
      this.message_label.node.active = true;
      this.message_label.string = message;
      if (isError) {
        this.message_label.node.color = new cc.Color(255, 100, 100);
      } else {
        this.message_label.node.color = new cc.Color(100, 200, 100);
      }
    } else {
      console.log(isError ? '[错误]' : '[信息]', message);
    }
  },
  // 隐藏消息
  _hideMessage: function _hideMessage() {
    if (this.message_label) {
      this.message_label.node.active = false;
    }
  },
  // 设置按钮交互状态
  _setInteractable: function _setInteractable(interactable) {
    if (this.login_btn) {
      this.login_btn.interactable = interactable;
    }
    if (this.send_code_btn && this._countdown <= 0) {
      this.send_code_btn.interactable = interactable;
    }
  },
  // 发送验证码请求 - 使用HttpAPI支持加密解密
  _sendCodeRequest: function _sendCodeRequest(phone, callback) {
    var defines = window.defines;
    if (!defines || !defines.apiUrl) {
      callback(true, "发送成功");
      return;
    }
    var url = defines.apiUrl + '/api/v1/auth/send-code';
    var cryptoKey = defines.cryptoKey || "";

    // 使用HttpAPI.post发送请求（支持加密解密）
    if (window.HttpAPI) {
      window.HttpAPI.post(url, {
        phone: phone
      }, cryptoKey, function (err, result) {
        if (err) {
          console.error("发送验证码失败:", err);
          callback(false, err);
          return;
        }
        if (result && result.code === 0) {
          var msg = "验证码已发送";
          // 开发环境：显示验证码
          if (result.data && result.data.code) {
            msg = "验证码: " + result.data.code;
          }
          callback(true, msg);
        } else {
          callback(false, result ? result.message : "发送失败");
        }
      });
    } else {
      // 降级：直接发送请求（不支持解密）
      console.warn("HttpAPI未加载，使用原始请求");
      var xhr = new XMLHttpRequest();
      xhr.open('POST', url, true);
      xhr.setRequestHeader('Content-Type', 'application/json');
      xhr.timeout = 10000;
      xhr.onreadystatechange = function () {
        if (xhr.readyState === 4) {
          if (xhr.status >= 200 && xhr.status < 300) {
            try {
              var response = JSON.parse(xhr.responseText);
              // 检查是否是加密响应
              if (response.data && response.timestamp && typeof response.data === 'string') {
                callback(false, "服务器返回加密数据，请刷新页面重试");
              } else if (response.code === 0) {
                callback(true, "验证码已发送");
              } else {
                callback(false, response.message || "发送失败");
              }
            } catch (e) {
              callback(false, "解析响应失败");
            }
          } else {
            callback(false, "网络请求失败");
          }
        }
      };
      xhr.ontimeout = function () {
        callback(false, "请求超时");
      };
      xhr.onerror = function () {
        callback(false, "网络错误");
      };
      xhr.send(JSON.stringify({
        phone: phone
      }));
    }
  },
  // 手机号登录请求 - 使用HttpAPI支持加密解密
  _phoneLoginRequest: function _phoneLoginRequest(phone, code, callback) {
    var defines = window.defines;
    if (!defines || !defines.apiUrl) {
      callback(true, "登录成功", {
        uniqueID: "phone_" + phone,
        accountID: "phone_" + phone,
        nickName: "玩家" + phone.substr(-4),
        avatarUrl: "",
        goldcount: 1000,
        token: "mock_token_" + Date.now()
      });
      return;
    }
    var url = defines.apiUrl + '/api/v1/auth/phone-login';
    var cryptoKey = defines.cryptoKey || "";

    // 准备请求数据
    var requestData = {
      phone: phone,
      code: code
    };

    // 使用HttpAPI.post发送请求（支持加密解密）
    if (window.HttpAPI && window.HttpAPI.post) {
      window.HttpAPI.post(url, requestData, cryptoKey, function (err, result) {
        if (err) {
          console.error("登录请求失败:", err);
          callback(false, err, null);
          return;
        }
        if (result && result.code === 0 && result.data) {
          callback(true, "登录成功", result.data);
        } else {
          callback(false, result ? result.message : "登录失败", null);
        }
      });
    } else {
      // 降级：直接发送请求
      console.warn("HttpAPI未加载，使用原始请求");
      var self = this;
      var xhr = new XMLHttpRequest();
      xhr.open('POST', url, true);
      xhr.setRequestHeader('Content-Type', 'application/json');
      xhr.setRequestHeader('X-Device-ID', this._getDeviceID());
      xhr.setRequestHeader('X-Device-Type', this._getDeviceType());
      xhr.timeout = 10000;
      xhr.onreadystatechange = function () {
        if (xhr.readyState === 4) {
          if (xhr.status >= 200 && xhr.status < 300) {
            try {
              var response = JSON.parse(xhr.responseText);
              if (response.data && response.timestamp && typeof response.data === 'string') {
                // 加密响应，需要解密
                if (window.HttpAPI && window.HttpAPI.decryptAESGCM) {
                  window.HttpAPI.decryptAESGCM(response.data, cryptoKey).then(function (decrypted) {
                    if (decrypted && decrypted.code === 0 && decrypted.data) {
                      callback(true, "登录成功", decrypted.data);
                    } else {
                      callback(false, decrypted ? decrypted.message : "登录失败", null);
                    }
                  })["catch"](function (decryptErr) {
                    console.error("解密失败:", decryptErr);
                    callback(false, "解密响应失败", null);
                  });
                } else {
                  callback(false, "服务器返回加密数据，请刷新页面重试", null);
                }
              } else if (response.code === 0 && response.data) {
                callback(true, "登录成功", response.data);
              } else {
                callback(false, response.message || "登录失败", null);
              }
            } catch (e) {
              console.error("解析响应失败:", e);
              callback(false, "解析响应失败", null);
            }
          } else {
            callback(false, "网络请求失败: HTTP " + xhr.status, null);
          }
        }
      };
      xhr.ontimeout = function () {
        callback(false, "请求超时", null);
      };
      xhr.onerror = function () {
        callback(false, "网络错误", null);
      };
      xhr.send(JSON.stringify(requestData));
    }
  },
  // =============================================
  // 设备信息获取
  // =============================================

  // 获取设备唯一标识
  _getDeviceID: function _getDeviceID() {
    var DEVICE_ID_KEY = "ddz_device_id";
    var deviceId = "";

    // 尝试从本地存储获取
    try {
      deviceId = cc.sys.localStorage.getItem(DEVICE_ID_KEY);
    } catch (e) {}

    // 如果不存在，生成新的设备ID
    if (!deviceId) {
      deviceId = this._generateUUID();
      try {
        cc.sys.localStorage.setItem(DEVICE_ID_KEY, deviceId);
      } catch (e) {}
    }
    return deviceId;
  },
  // 获取设备类型
  _getDeviceType: function _getDeviceType() {
    var platform = cc.sys.platform;
    var os = cc.sys.os;
    var deviceType = "Unknown";

    // 根据平台判断
    if (platform === cc.sys.WECHAT_GAME) {
      deviceType = "WeChat";
    } else if (platform === cc.sys.ANDROID) {
      deviceType = "Android";
    } else if (platform === cc.sys.IPHONE) {
      deviceType = "iPhone";
    } else if (platform === cc.sys.IPAD) {
      deviceType = "iPad";
    } else if (platform === cc.sys.MAC_OS) {
      deviceType = "Mac";
    } else if (platform === cc.sys.WINDOWS) {
      deviceType = "Windows";
    } else if (platform === cc.sys.LINUX) {
      deviceType = "Linux";
    } else if (platform === cc.sys.MOBILE_BROWSER) {
      if (os === cc.sys.OS_IOS) {
        deviceType = "iOS Browser";
      } else if (os === cc.sys.OS_ANDROID) {
        deviceType = "Android Browser";
      } else {
        deviceType = "Mobile Browser";
      }
    } else if (platform === cc.sys.DESKTOP_BROWSER) {
      if (os === cc.sys.OS_WINDOWS) {
        deviceType = "Windows Browser";
      } else if (os === cc.sys.OS_OSX) {
        deviceType = "Mac Browser";
      } else if (os === cc.sys.OS_LINUX) {
        deviceType = "Linux Browser";
      } else {
        deviceType = "Desktop Browser";
      }
    }

    // 添加浏览器信息
    var browserType = cc.sys.browserType;
    if (browserType) {
      deviceType += " (" + browserType + ")";
    }
    return deviceType;
  },
  // 生成UUID
  _generateUUID: function _generateUUID() {
    var d = new Date().getTime();
    var uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
      var r = (d + Math.random() * 16) % 16 | 0;
      d = Math.floor(d / 16);
      return (c === 'x' ? r : r & 0x3 | 0x8).toString(16);
    });
    return uuid;
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImFzc2V0c1xcc2NyaXB0c1xccHJlZmFic1xccGhvbmVfbG9naW4uanMiXSwibmFtZXMiOlsiY2MiLCJDbGFzcyIsIm5hbWUiLCJDb21wb25lbnQiLCJwcm9wZXJ0aWVzIiwicGhvbmVfaW5wdXQiLCJ0eXBlIiwiRWRpdEJveCIsImNvZGVfaW5wdXQiLCJzZW5kX2NvZGVfYnRuIiwiQnV0dG9uIiwibG9naW5fYnRuIiwiY2xvc2VfYnRuIiwid3hfbG9naW5fYnRuIiwiU3ByaXRlIiwic2VuZF9jb2RlX2xhYmVsIiwiTGFiZWwiLCJtZXNzYWdlX2xhYmVsIiwiY291bnRkb3duX3RpbWUiLCJCQVNFX1dJRFRIIiwiQkFTRV9IRUlHSFQiLCJvbkxvYWQiLCJfY291bnRkb3duIiwiX3Bob25lIiwiX2NvZGUiLCJhZGFwdERpYWxvZyIsInNlbGYiLCJ2aWV3Iiwic2V0UmVzaXplQ2FsbGJhY2siLCJfaW5pdFBhbmVsQW5pbWF0aW9uIiwiX2RyYXdJbnB1dEJvcmRlcnMiLCJfaW5pdEVkaXRCb3hlcyIsIl9pbml0QnV0dG9ucyIsIl9pbml0V2VjaGF0QnV0dG9uIiwiX2hpZGVNZXNzYWdlIiwic3RyaW5nIiwic3RheU9uVG9wIiwiZm9udFNpemUiLCJsaW5lSGVpZ2h0IiwiZm9udENvbG9yIiwiQ29sb3IiLCJwbGFjZWhvbGRlckZvbnRDb2xvciIsIm5vZGUiLCJvbiIsIl9vblBob25lSW5wdXRGb2N1cyIsIl9vblBob25lSW5wdXRCbHVyIiwiZWRpdGJveCIsIl9vbkNvZGVJbnB1dEZvY3VzIiwiX29uQ29kZUlucHV0Qmx1ciIsInBhbmVsIiwiZ2V0Q2hpbGRCeU5hbWUiLCJ3aW5XIiwid2luU2l6ZSIsIndpZHRoIiwid2luSCIsImhlaWdodCIsInRhcmdldFdpZHRoIiwiTWF0aCIsIm1heCIsIm1pbiIsInNjYWxlIiwibWF4U2NhbGVZIiwiY29uc29sZSIsImxvZyIsInJvdW5kIiwidG9GaXhlZCIsImNvbnRlbnRQYW5lbCIsInRhcmdldFNjYWxlIiwib3BhY2l0eSIsInR3ZWVuIiwidG8iLCJlYXNpbmciLCJzdGFydCIsInBob25lQmciLCJncmFwaGljcyIsImdldENvbXBvbmVudCIsIkdyYXBoaWNzIiwiY2xlYXIiLCJmaWxsQ29sb3IiLCJfZHJhd1JvdW5kUmVjdCIsImZpbGwiLCJzdHJva2VDb2xvciIsImxpbmVXaWR0aCIsInN0cm9rZSIsInBob25lSW5wdXQiLCJ6SW5kZXgiLCJjb2RlUm93IiwiY29kZUJnIiwiY29kZUlucHV0IiwiZGl2aWRlciIsIm1vdmVUbyIsImxpbmVUbyIsIngiLCJ5IiwidyIsImgiLCJyIiwiYXJjVG8iLCJ3eENvbnRhaW5lciIsInd4QnRuIiwiTm9kZSIsIkV2ZW50VHlwZSIsIlRPVUNIX1NUQVJUIiwiVE9VQ0hfRU5EIiwiX29uV2VjaGF0TG9naW5DbGljayIsIlRPVUNIX0NBTkNFTCIsIl9jcmVhdGVXZWNoYXRMYWJlbCIsImNvbnRhaW5lciIsImV4aXN0TGFiZWwiLCJsYWJlbE5vZGUiLCJwYXJlbnQiLCJsYWJlbCIsImFkZENvbXBvbmVudCIsImZvbnRGYW1pbHkiLCJob3Jpem9udGFsQWxpZ24iLCJIb3Jpem9udGFsQWxpZ24iLCJDRU5URVIiLCJvZmYiLCJfb25DbG9zZUNsaWNrIiwiX29uU2VuZENvZGVDbGljayIsIl9vbkxvZ2luQ2xpY2siLCJ3aW5kb3ciLCJteWdsb2JhbCIsIndlY2hhdExvZ2luIiwiX3Nob3dNZXNzYWdlIiwib25QaG9uZUlucHV0Q2hhbmdlZCIsImN1c3RvbUV2ZW50RGF0YSIsIm9uQ29kZUlucHV0Q2hhbmdlZCIsIl92YWxpZGF0ZVBob25lIiwiX3NldEludGVyYWN0YWJsZSIsIl9zZW5kQ29kZVJlcXVlc3QiLCJzdWNjZXNzIiwibWVzc2FnZSIsIl9zdGFydENvdW50ZG93biIsIl92YWxpZGF0ZUNvZGUiLCJfcGhvbmVMb2dpblJlcXVlc3QiLCJkYXRhIiwicGxheWVyRGF0YSIsInVuaXF1ZUlEIiwiYWNjb3VudElEIiwibmlja05hbWUiLCJhdmF0YXJVcmwiLCJnb2JhbF9jb3VudCIsImdvbGRjb3VudCIsInRva2VuIiwic2F2ZVRvTG9jYWwiLCJzY2hlZHVsZU9uY2UiLCJkaXJlY3RvciIsImxvYWRTY2VuZSIsInVuc2NoZWR1bGUiLCJfY291bnRkb3duVGljayIsImRlc3Ryb3kiLCJwaG9uZSIsImxlbmd0aCIsInJlZyIsInRlc3QiLCJjb2RlIiwiX3VwZGF0ZUNvdW50ZG93bkxhYmVsIiwic2NoZWR1bGUiLCJfcmVzZXRTZW5kQ29kZUJ0biIsImludGVyYWN0YWJsZSIsImlzRXJyb3IiLCJhY3RpdmUiLCJjb2xvciIsImNhbGxiYWNrIiwiZGVmaW5lcyIsImFwaVVybCIsInVybCIsImNyeXB0b0tleSIsIkh0dHBBUEkiLCJwb3N0IiwiZXJyIiwicmVzdWx0IiwiZXJyb3IiLCJtc2ciLCJ3YXJuIiwieGhyIiwiWE1MSHR0cFJlcXVlc3QiLCJvcGVuIiwic2V0UmVxdWVzdEhlYWRlciIsInRpbWVvdXQiLCJvbnJlYWR5c3RhdGVjaGFuZ2UiLCJyZWFkeVN0YXRlIiwic3RhdHVzIiwicmVzcG9uc2UiLCJKU09OIiwicGFyc2UiLCJyZXNwb25zZVRleHQiLCJ0aW1lc3RhbXAiLCJlIiwib250aW1lb3V0Iiwib25lcnJvciIsInNlbmQiLCJzdHJpbmdpZnkiLCJzdWJzdHIiLCJEYXRlIiwibm93IiwicmVxdWVzdERhdGEiLCJfZ2V0RGV2aWNlSUQiLCJfZ2V0RGV2aWNlVHlwZSIsImRlY3J5cHRBRVNHQ00iLCJ0aGVuIiwiZGVjcnlwdGVkIiwiZGVjcnlwdEVyciIsIkRFVklDRV9JRF9LRVkiLCJkZXZpY2VJZCIsInN5cyIsImxvY2FsU3RvcmFnZSIsImdldEl0ZW0iLCJfZ2VuZXJhdGVVVUlEIiwic2V0SXRlbSIsInBsYXRmb3JtIiwib3MiLCJkZXZpY2VUeXBlIiwiV0VDSEFUX0dBTUUiLCJBTkRST0lEIiwiSVBIT05FIiwiSVBBRCIsIk1BQ19PUyIsIldJTkRPV1MiLCJMSU5VWCIsIk1PQklMRV9CUk9XU0VSIiwiT1NfSU9TIiwiT1NfQU5EUk9JRCIsIkRFU0tUT1BfQlJPV1NFUiIsIk9TX1dJTkRPV1MiLCJPU19PU1giLCJPU19MSU5VWCIsImJyb3dzZXJUeXBlIiwiZCIsImdldFRpbWUiLCJ1dWlkIiwicmVwbGFjZSIsImMiLCJyYW5kb20iLCJmbG9vciIsInRvU3RyaW5nIl0sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7OztBQUFBO0FBQ0E7QUFDQTs7QUFFQUEsRUFBRSxDQUFDQyxLQUFLLENBQUM7RUFDTEMsSUFBSSxFQUFFLGFBQWE7RUFDbkIsV0FBU0YsRUFBRSxDQUFDRyxTQUFTO0VBRXJCQyxVQUFVLEVBQUU7SUFDUjtJQUNBQyxXQUFXLEVBQUU7TUFDVEMsSUFBSSxFQUFFTixFQUFFLENBQUNPLE9BQU87TUFDaEIsV0FBUztJQUNiLENBQUM7SUFDREMsVUFBVSxFQUFFO01BQ1JGLElBQUksRUFBRU4sRUFBRSxDQUFDTyxPQUFPO01BQ2hCLFdBQVM7SUFDYixDQUFDO0lBRUQ7SUFDQUUsYUFBYSxFQUFFO01BQ1hILElBQUksRUFBRU4sRUFBRSxDQUFDVSxNQUFNO01BQ2YsV0FBUztJQUNiLENBQUM7SUFDREMsU0FBUyxFQUFFO01BQ1BMLElBQUksRUFBRU4sRUFBRSxDQUFDVSxNQUFNO01BQ2YsV0FBUztJQUNiLENBQUM7SUFDREUsU0FBUyxFQUFFO01BQ1BOLElBQUksRUFBRU4sRUFBRSxDQUFDVSxNQUFNO01BQ2YsV0FBUztJQUNiLENBQUM7SUFFRDtJQUNBRyxZQUFZLEVBQUU7TUFDVlAsSUFBSSxFQUFFTixFQUFFLENBQUNjLE1BQU07TUFDZixXQUFTO0lBQ2IsQ0FBQztJQUVEO0lBQ0FDLGVBQWUsRUFBRTtNQUNiVCxJQUFJLEVBQUVOLEVBQUUsQ0FBQ2dCLEtBQUs7TUFDZCxXQUFTO0lBQ2IsQ0FBQztJQUNEQyxhQUFhLEVBQUU7TUFDWFgsSUFBSSxFQUFFTixFQUFFLENBQUNnQixLQUFLO01BQ2QsV0FBUztJQUNiLENBQUM7SUFFRDtJQUNBRSxjQUFjLEVBQUUsRUFBRTtJQUVsQjtJQUNBQyxVQUFVLEVBQUUsR0FBRztJQUNmQyxXQUFXLEVBQUU7RUFDakIsQ0FB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R0FBRyxDQUFDO01BQ3pDTCxDQUFDLEdBQUc1SyxJQUFJLENBQUNrTCxLQUFLLENBQUNOLENBQUMsR0FBRyxFQUFFLENBQUM7TUFDdEIsT0FBTyxDQUFDSSxDQUFDLEtBQUssR0FBRyxHQUFHekksQ0FBQyxHQUFJQSxDQUFDLEdBQUcsR0FBRyxHQUFHLEdBQUksRUFBRTRJLFFBQVEsQ0FBQyxFQUFFLENBQUM7SUFDekQsQ0FBQyxDQUFDO0lBQ0YsT0FBT0wsSUFBSTtFQUNmO0FBQ0osQ0FBQyxDQUFDIiwic291cmNlUm9vdCI6Ii8iLCJzb3VyY2VzQ29udGVudCI6WyIvLyDmiYvmnLrlj7fnmbvlvZXlvLnnqpfmjqfliLblmahcbi8vIOeUqOS6juWkhOeQhuaJi+acuuWPt+mqjOivgeeggeeZu+W9leWKn+iDvVxuLy8g6K6+6K6h6aOO5qC877ya5Lit5Zu96aOO5ZWG5Lia5qOL54mM77yI5ZON5bqU5byP6YCC6YWN77ya5a695bqmNjAl77yM6auY5bqm6Ieq6YCC5bqU77yJXG5cbmNjLkNsYXNzKHtcbiAgICBuYW1lOiAncGhvbmVfbG9naW4nLFxuICAgIGV4dGVuZHM6IGNjLkNvbXBvbmVudCxcblxuICAgIHByb3BlcnRpZXM6IHtcbiAgICAgICAgLy8g6L6T5YWl5qGGXG4gICAgICAgIHBob25lX2lucHV0OiB7XG4gICAgICAgICAgICB0eXBlOiBjYy5FZGl0Qm94LFxuICAgICAgICAgICAgZGVmYXVsdDogbnVsbFxuICAgICAgICB9LFxuICAgICAgICBjb2RlX2lucHV0OiB7XG4gICAgICAgICAgICB0eXBlOiBjYy5FZGl0Qm94LFxuICAgICAgICAgICAgZGVmYXVsdDogbnVsbFxuICAgICAgICB9LFxuXG4gICAgICAgIC8vIOaMiemSrlxuICAgICAgICBzZW5kX2NvZGVfYnRuOiB7XG4gICAgICAgICAgICB0eXBlOiBjYy5CdXR0b24sXG4gICAgICAgICAgICBkZWZhdWx0OiBudWxsXG4gICAgICAgIH0sXG4gICAgICAgIGxvZ2luX2J0bjoge1xuICAgICAgICAgICAgdHlwZTogY2MuQnV0dG9uLFxuICAgICAgICAgICAgZGVmYXVsdDogbnVsbFxuICAgICAgICB9LFxuICAgICAgICBjbG9zZV9idG46IHtcbiAgICAgICAgICAgIHR5cGU6IGNjLkJ1dHRvbixcbiAgICAgICAgICAgIGRlZmF1bHQ6IG51bGxcbiAgICAgICAgfSxcblxuICAgICAgICAvLyDlvq7kv6HnmbvlvZXmjInpkq5cbiAgICAgICAgd3hfbG9naW5fYnRuOiB7XG4gICAgICAgICAgICB0eXBlOiBjYy5TcHJpdGUsXG4gICAgICAgICAgICBkZWZhdWx0OiBudWxsXG4gICAgICAgIH0sXG5cbiAgICAgICAgLy8g5qCH562+XG4gICAgICAgIHNlbmRfY29kZV9sYWJlbDoge1xuICAgICAgICAgICAgdHlwZTogY2MuTGFiZWwsXG4gICAgICAgICAgICBkZWZhdWx0OiBudWxsXG4gICAgICAgIH0sXG4gICAgICAgIG1lc3NhZ2VfbGFiZWw6IHtcbiAgICAgICAgICAgIHR5cGU6IGNjLkxhYmVsLFxuICAgICAgICAgICAgZGVmYXVsdDogbnVsbFxuICAgICAgICB9LFxuXG4gICAgICAgIC8vIOWAkuiuoeaXtuaXtumXtFxuICAgICAgICBjb3VudGRvd25fdGltZTogNjAsXG5cbiAgICAgICAgLy8g5Z+65YeG6K6+6K6h5bC65a+477yI55So5LqO6K6h566Xc2NhbGXvvIlcbiAgICAgICAgQkFTRV9XSURUSDogNDAwLFxuICAgICAgICBCQVNFX0hFSUdIVDogNTIwXG4gICAgfSxcblxuICAgIG9uTG9hZDogZnVuY3Rpb24oKSB7XG4gICAgICAgIHRoaXMuX2NvdW50ZG93biA9IDA7XG4gICAgICAgIHRoaXMuX3Bob25lID0gXCJcIjtcbiAgICAgICAgdGhpcy5fY29kZSA9IFwiXCI7XG5cbiAgICAgICAgLy8g56uL5Y2z5omn6KGM5by556qX5bC65a+46YCC6YWNXG4gICAgICAgIHRoaXMuYWRhcHREaWFsb2coKTtcblxuICAgICAgICAvLyDnm5HlkKzlsY/luZXlsLrlr7jlj5jljJZcbiAgICAgICAgdmFyIHNlbGYgPSB0aGlzO1xuICAgICAgICBjYy52aWV3LnNldFJlc2l6ZUNhbGxiYWNrKGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgc2VsZi5hZGFwdERpYWxvZygpO1xuICAgICAgICB9KTtcblxuICAgICAgICAvLyDliJ3lp4vljJblvLnnqpfliqjnlLtcbiAgICAgICAgdGhpcy5faW5pdFBhbmVsQW5pbWF0aW9uKCk7XG4gICAgICAgIFxuICAgICAgICAvLyDnu5jliLblnIbop5LovpPlhaXmoYbovrnmoYZcbiAgICAgICAgdGhpcy5fZHJhd0lucHV0Qm9yZGVycygpO1xuICAgICAgICBcbiAgICAgICAgLy8gPT09PT09PT09PT09PT09PT09PT0g5Yid5aeL5YyWIEVkaXRCb3gg5qC35byP5ZKM5LqL5Lu2ID09PT09PT09PT09PT09PT09PT09XG4gICAgICAgIHRoaXMuX2luaXRFZGl0Qm94ZXMoKTtcbiAgICAgICAgXG4gICAgICAgIC8vIOWIneWni+WMluaMiemSruS6i+S7tlxuICAgICAgICB0aGlzLl9pbml0QnV0dG9ucygpO1xuICAgICAgICBcbiAgICAgICAgLy8g5Yid5aeL5YyW5b6u5L+h55m75b2V5oyJ6ZKuXG4gICAgICAgIHRoaXMuX2luaXRXZWNoYXRCdXR0b24oKTtcbiAgICAgICAgXG4gICAgICAgIHRoaXMuX2hpZGVNZXNzYWdlKCk7XG5cbiAgICAgICAgLy8g6I635Y+W6L6T5YWl5qGG5Yid5aeL5YC8XG4gICAgICAgIGlmICh0aGlzLnBob25lX2lucHV0KSB7XG4gICAgICAgICAgICB0aGlzLl9waG9uZSA9IHRoaXMucGhvbmVfaW5wdXQuc3RyaW5nIHx8IFwiXCI7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKHRoaXMuY29kZV9pbnB1dCkge1xuICAgICAgICAgICAgdGhpcy5fY29kZSA9IHRoaXMuY29kZV9pbnB1dC5zdHJpbmcgfHwgXCJcIjtcbiAgICAgICAgfVxuICAgIH0sXG5cbiAgICAvLyA9PT09PT09PT09PT09PT09PT09PSDliJ3lp4vljJYgRWRpdEJveCA9PT09PT09PT09PT09PT09PT09PVxuICAgIF9pbml0RWRpdEJveGVzOiBmdW5jdGlvbigpIHtcbiAgICAgICAgdmFyIHNlbGYgPSB0aGlzO1xuICAgICAgICBcbiAgICAgICAgLy8g5omL5py65Y+36L6T5YWl5qGG5Yid5aeL5YyWXG4gICAgICAgIGlmICh0aGlzLnBob25lX2lucHV0KSB7XG4gICAgICAgICAgICAvLyDorr7nva4gc3RheU9uVG9wIOS4uiB0cnVl77yM56Gu5L+d5paH5a2X5aeL57uI5Y+v6KeBXG4gICAgICAgICAgICB0aGlzLnBob25lX2lucHV0LnN0YXlPblRvcCA9IHRydWU7XG4gICAgICAgICAgICBcbiAgICAgICAgICAgIC8vIOiuvue9ruWtl+S9k+agt+W8j1xuICAgICAgICAgICAgdGhpcy5waG9uZV9pbnB1dC5mb250U2l6ZSA9IDIwO1xuICAgICAgICAgICAgdGhpcy5waG9uZV9pbnB1dC5saW5lSGVpZ2h0ID0gNDA7XG4gICAgICAgICAgICB0aGlzLnBob25lX2lucHV0LmZvbnRDb2xvciA9IG5ldyBjYy5Db2xvcig1MCwgNTAsIDUwLCAyNTUpO1xuICAgICAgICAgICAgdGhpcy5waG9uZV9pbnB1dC5wbGFjZWhvbGRlckZvbnRDb2xvciA9IG5ldyBjYy5Db2xvcigxNTAsIDE1MCwgMTUwLCAyNTUpO1xuICAgICAgICAgICAgXG4gICAgICAgICAgICAvLyDnm5HlkKzovpPlhaXkuovku7ZcbiAgICAgICAgICAgIHRoaXMucGhvbmVfaW5wdXQubm9kZS5vbignZWRpdGluZy1kaWQtYmVnYW4nLCBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgICBzZWxmLl9vblBob25lSW5wdXRGb2N1cygpO1xuICAgICAgICAgICAgfSwgdGhpcyk7XG4gICAgICAgICAgICBcbiAgICAgICAgICAgIHRoaXMucGhvbmVfaW5wdXQubm9kZS5vbignZWRpdGluZy1kaWQtZW5kZWQnLCBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgICBzZWxmLl9vblBob25lSW5wdXRCbHVyKCk7XG4gICAgICAgICAgICB9LCB0aGlzKTtcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgdGhpcy5waG9uZV9pbnB1dC5ub2RlLm9uKCd0ZXh0LWNoYW5nZWQnLCBmdW5jdGlvbihlZGl0Ym94KSB7XG4gICAgICAgICAgICAgICAgc2VsZi5fcGhvbmUgPSBlZGl0Ym94LnN0cmluZztcbiAgICAgICAgICAgIH0sIHRoaXMpO1xuICAgICAgICB9XG4gICAgICAgIFxuICAgICAgICAvLyDpqozor4HnoIHovpPlhaXmoYbliJ3lp4vljJZcbiAgICAgICAgaWYgKHRoaXMuY29kZV9pbnB1dCkge1xuICAgICAgICAgICAgLy8g6K6+572uIHN0YXlPblRvcCDkuLogdHJ1Ze+8jOehruS/neaWh+Wtl+Wni+e7iOWPr+ingVxuICAgICAgICAgICAgdGhpcy5jb2RlX2lucHV0LnN0YXlPblRvcCA9IHRydWU7XG4gICAgICAgICAgICBcbiAgICAgICAgICAgIC8vIOiuvue9ruWtl+S9k+agt+W8j1xuICAgICAgICAgICAgdGhpcy5jb2RlX2lucHV0LmZvbnRTaXplID0gMjA7XG4gICAgICAgICAgICB0aGlzLmNvZGVfaW5wdXQubGluZUhlaWdodCA9IDQwO1xuICAgICAgICAgICAgdGhpcy5jb2RlX2lucHV0LmZvbnRDb2xvciA9IG5ldyBjYy5Db2xvcig1MCwgNTAsIDUwLCAyNTUpO1xuICAgICAgICAgICAgdGhpcy5jb2RlX2lucHV0LnBsYWNlaG9sZGVyRm9udENvbG9yID0gbmV3IGNjLkNvbG9yKDE1MCwgMTUwLCAxNTAsIDI1NSk7XG4gICAgICAgICAgICBcbiAgICAgICAgICAgIC8vIOebkeWQrOi+k+WFpeS6i+S7tlxuICAgICAgICAgICAgdGhpcy5jb2RlX2lucHV0Lm5vZGUub24oJ2VkaXRpbmctZGlkLWJlZ2FuJywgZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgICAgc2VsZi5fb25Db2RlSW5wdXRGb2N1cygpO1xuICAgICAgICAgICAgfSwgdGhpcyk7XG4gICAgICAgICAgICBcbiAgICAgICAgICAgIHRoaXMuY29kZV9pbnB1dC5ub2RlLm9uKCdlZGl0aW5nLWRpZC1lbmRlZCcsIGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICAgIHNlbGYuX29uQ29kZUlucHV0Qmx1cigpO1xuICAgICAgICAgICAgfSwgdGhpcyk7XG4gICAgICAgICAgICBcbiAgICAgICAgICAgIHRoaXMuY29kZV9pbnB1dC5ub2RlLm9uKCd0ZXh0LWNoYW5nZWQnLCBmdW5jdGlvbihlZGl0Ym94KSB7XG4gICAgICAgICAgICAgICAgc2VsZi5fY29kZSA9IGVkaXRib3guc3RyaW5nO1xuICAgICAgICAgICAgfSwgdGhpcyk7XG4gICAgICAgIH1cbiAgICB9LFxuICAgIFxuICAgIC8vIOaJi+acuuWPt+i+k+WFpeahhuiOt+W+l+eEpueCuVxuICAgIF9vblBob25lSW5wdXRGb2N1czogZnVuY3Rpb24oKSB7XG4gICAgICAgIC8vIOWPr+S7pea3u+WKoOeEpueCueaViOaenFxuICAgIH0sXG4gICAgXG4gICAgLy8g5omL5py65Y+36L6T5YWl5qGG5aSx5Y6754Sm54K5XG4gICAgX29uUGhvbmVJbnB1dEJsdXI6IGZ1bmN0aW9uKCkge1xuICAgICAgICAvLyDnoa7kv53mloflrZfmmL7npLpcbiAgICAgICAgaWYgKHRoaXMucGhvbmVfaW5wdXQgJiYgdGhpcy5waG9uZV9pbnB1dC5zdHJpbmcpIHtcbiAgICAgICAgICAgIHRoaXMuX3Bob25lID0gdGhpcy5waG9uZV9pbnB1dC5zdHJpbmc7XG4gICAgICAgIH1cbiAgICB9LFxuICAgIFxuICAgIC8vIOmqjOivgeeggei+k+WFpeahhuiOt+W+l+eEpueCuVxuICAgIF9vbkNvZGVJbnB1dEZvY3VzOiBmdW5jdGlvbigpIHtcbiAgICAgICAgLy8g5Y+v5Lul5re75Yqg54Sm54K55pWI5p6cXG4gICAgfSxcbiAgICBcbiAgICAvLyDpqozor4HnoIHovpPlhaXmoYblpLHljrvnhKbngrlcbiAgICBfb25Db2RlSW5wdXRCbHVyOiBmdW5jdGlvbigpIHtcbiAgICAgICAgLy8g56Gu5L+d5paH5a2X5pi+56S6XG4gICAgICAgIGlmICh0aGlzLmNvZGVfaW5wdXQgJiYgdGhpcy5jb2RlX2lucHV0LnN0cmluZykge1xuICAgICAgICAgICAgdGhpcy5fY29kZSA9IHRoaXMuY29kZV9pbnB1dC5zdHJpbmc7XG4gICAgICAgIH1cbiAgICB9LFxuXG4gICAgLy8gPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XG4gICAgLy8g5ZON5bqU5byP6YCC6YWN77ya5a695bqmPeWxj+W5lTYwJe+8jOacgOWwjzMwMO+8jOmrmOW6puaMieavlOS+i1xuICAgIC8vID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxuICAgIGFkYXB0RGlhbG9nOiBmdW5jdGlvbigpIHtcbiAgICAgICAgdmFyIHBhbmVsID0gdGhpcy5ub2RlLmdldENoaWxkQnlOYW1lKCdjb250ZW50X3BhbmVsJyk7XG4gICAgICAgIGlmICghcGFuZWwpIHJldHVybjtcblxuICAgICAgICB2YXIgd2luVyA9IGNjLndpblNpemUud2lkdGg7XG4gICAgICAgIHZhciB3aW5IID0gY2Mud2luU2l6ZS5oZWlnaHQ7XG5cbiAgICAgICAgLy8g55uu5qCH5a695bqmID0g5bGP5bmV5a695bqmICogNjAlXG4gICAgICAgIHZhciB0YXJnZXRXaWR0aCA9IHdpblcgKiAwLjY7XG4gICAgICAgIFxuICAgICAgICAvLyDmnIDlsI/lrr3luqYzMDDvvIzmnIDlpKflrr3luqbkuI3otoXov4flsY/luZU4MCVcbiAgICAgICAgdGFyZ2V0V2lkdGggPSBNYXRoLm1heCgzMDAsIE1hdGgubWluKHRhcmdldFdpZHRoLCB3aW5XICogMC44KSk7XG4gICAgICAgIFxuICAgICAgICAvLyDorqHnrpfnvKnmlL7mr5TkvotcbiAgICAgICAgdmFyIHNjYWxlID0gdGFyZ2V0V2lkdGggLyB0aGlzLkJBU0VfV0lEVEg7XG4gICAgICAgIFxuICAgICAgICAvLyDnoa7kv53pq5jluqbkuI3otoXlh7rlsY/luZXvvIjnlZnlh7oxMCXovrnot53vvIlcbiAgICAgICAgdmFyIG1heFNjYWxlWSA9ICh3aW5IICogMC44KSAvIHRoaXMuQkFTRV9IRUlHSFQ7XG4gICAgICAgIHNjYWxlID0gTWF0aC5taW4oc2NhbGUsIG1heFNjYWxlWSk7XG4gICAgICAgIFxuICAgICAgICAvLyDpmZDliLbnvKnmlL7ojIPlm7QgWzAuNywgMS4zXVxuICAgICAgICBzY2FsZSA9IE1hdGgubWF4KDAuNywgTWF0aC5taW4oc2NhbGUsIDEuMykpO1xuXG4gICAgICAgIC8vIOW6lOeUqOe8qeaUvlxuICAgICAgICBwYW5lbC5zY2FsZSA9IHNjYWxlO1xuXG4gICAgICAgIGNvbnNvbGUubG9nKCfjgJDnmbvlvZXlvLnnqpfjgJHlsY/luZU6Jywgd2luVywgJ3gnLCB3aW5ILCBcbiAgICAgICAgICAgICAgICAgICAgJ+ebruagh+WuveW6pjonLCBNYXRoLnJvdW5kKHRhcmdldFdpZHRoKSwgXG4gICAgICAgICAgICAgICAgICAgICfnvKnmlL46Jywgc2NhbGUudG9GaXhlZCgyKSxcbiAgICAgICAgICAgICAgICAgICAgJ+WunumZheWwuuWvuDonLCBNYXRoLnJvdW5kKHRoaXMuQkFTRV9XSURUSCAqIHNjYWxlKSwgJ3gnLCBNYXRoLnJvdW5kKHRoaXMuQkFTRV9IRUlHSFQgKiBzY2FsZSkpO1xuICAgIH0sXG5cbiAgICAvLyDliJ3lp4vljJblvLnnqpfov5vlhaXliqjnlLtcbiAgICBfaW5pdFBhbmVsQW5pbWF0aW9uOiBmdW5jdGlvbigpIHtcbiAgICAgICAgdmFyIGNvbnRlbnRQYW5lbCA9IHRoaXMubm9kZS5nZXRDaGlsZEJ5TmFtZSgnY29udGVudF9wYW5lbCcpO1xuICAgICAgICBpZiAoY29udGVudFBhbmVsKSB7XG4gICAgICAgICAgICAvLyDkv53lrZjnm67moIfnvKnmlL7lgLzvvIjlt7LnlLFfaW5pdFBhbmVsU2NhbGXorr7nva7vvIlcbiAgICAgICAgICAgIHZhciB0YXJnZXRTY2FsZSA9IGNvbnRlbnRQYW5lbC5zY2FsZTtcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgLy8g5LuO5bCP5bC65a+45byA5aeL5Yqo55S7XG4gICAgICAgICAgICBjb250ZW50UGFuZWwuc2NhbGUgPSB0YXJnZXRTY2FsZSAqIDAuNztcbiAgICAgICAgICAgIGNvbnRlbnRQYW5lbC5vcGFjaXR5ID0gMDtcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgY2MudHdlZW4oY29udGVudFBhbmVsKVxuICAgICAgICAgICAgICAgIC50bygwLjI1LCB7IHNjYWxlOiB0YXJnZXRTY2FsZSwgb3BhY2l0eTogMjU1IH0sIHsgZWFzaW5nOiAnYmFja091dCcgfSlcbiAgICAgICAgICAgICAgICAuc3RhcnQoKTtcbiAgICAgICAgfVxuICAgIH0sXG5cbiAgICAvLyDnu5jliLbovpPlhaXmoYblnIbop5LovrnmoYYgLSDkv67lpI3niYjvvJrnu5jliLbog4zmma8gKyDovrnmoYZcbiAgICBfZHJhd0lucHV0Qm9yZGVyczogZnVuY3Rpb24oKSB7XG4gICAgICAgIHZhciBjb250ZW50UGFuZWwgPSB0aGlzLm5vZGUuZ2V0Q2hpbGRCeU5hbWUoJ2NvbnRlbnRfcGFuZWwnKTtcbiAgICAgICAgaWYgKCFjb250ZW50UGFuZWwpIHJldHVybjtcblxuICAgICAgICAvLyDnu5jliLbmiYvmnLrlj7fovpPlhaXmoYbog4zmma/lkozovrnmoYYgKDMyMHg1MClcbiAgICAgICAgdmFyIHBob25lQmcgPSBjb250ZW50UGFuZWwuZ2V0Q2hpbGRCeU5hbWUoJ3Bob25lX2JnJyk7XG4gICAgICAgIGlmIChwaG9uZUJnKSB7XG4gICAgICAgICAgICB2YXIgZ3JhcGhpY3MgPSBwaG9uZUJnLmdldENvbXBvbmVudChjYy5HcmFwaGljcyk7XG4gICAgICAgICAgICBpZiAoZ3JhcGhpY3MpIHtcbiAgICAgICAgICAgICAgICBncmFwaGljcy5jbGVhcigpO1xuICAgICAgICAgICAgICAgIC8vIOWFiOe7mOWItuWhq+WFheiDjOaZr++8iOWNiumAj+aYjueZveiJsu+8iVxuICAgICAgICAgICAgICAgIGdyYXBoaWNzLmZpbGxDb2xvciA9IG5ldyBjYy5Db2xvcigyNTUsIDI1MiwgMjQwLCAyMzApO1xuICAgICAgICAgICAgICAgIHRoaXMuX2RyYXdSb3VuZFJlY3QoZ3JhcGhpY3MsIC0xNjAsIC0yNSwgMzIwLCA1MCwgMTQpO1xuICAgICAgICAgICAgICAgIGdyYXBoaWNzLmZpbGwoKTtcbiAgICAgICAgICAgICAgICAvLyDlho3nu5jliLbovrnmoYbvvIjph5HoibLvvIlcbiAgICAgICAgICAgICAgICBncmFwaGljcy5zdHJva2VDb2xvciA9IG5ldyBjYy5Db2xvcigyMTgsIDE2NSwgMzIsIDI1NSk7XG4gICAgICAgICAgICAgICAgZ3JhcGhpY3MubGluZVdpZHRoID0gMjtcbiAgICAgICAgICAgICAgICB0aGlzLl9kcmF3Um91bmRSZWN0KGdyYXBoaWNzLCAtMTYwLCAtMjUsIDMyMCwgNTAsIDE0KTtcbiAgICAgICAgICAgICAgICBncmFwaGljcy5zdHJva2UoKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIFxuICAgICAgICAgICAgLy8g56Gu5L+dIHBob25lX2JnIOiKgueCueWcqCBpbnB1dCDoioLngrnkuIvmlrlcbiAgICAgICAgICAgIHZhciBwaG9uZUlucHV0ID0gcGhvbmVCZy5nZXRDaGlsZEJ5TmFtZSgncGhvbmVfaW5wdXQnKTtcbiAgICAgICAgICAgIGlmIChwaG9uZUlucHV0KSB7XG4gICAgICAgICAgICAgICAgcGhvbmVJbnB1dC56SW5kZXggPSAxMDtcbiAgICAgICAgICAgICAgICBwaG9uZUJnLnpJbmRleCA9IDU7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICAvLyDnu5jliLbpqozor4HnoIHovpPlhaXmoYbog4zmma/lkozovrnmoYYgKDE5MHg1MClcbiAgICAgICAgdmFyIGNvZGVSb3cgPSBjb250ZW50UGFuZWwuZ2V0Q2hpbGRCeU5hbWUoJ2NvZGVfcm93Jyk7XG4gICAgICAgIGlmIChjb2RlUm93KSB7XG4gICAgICAgICAgICB2YXIgY29kZUJnID0gY29kZVJvdy5nZXRDaGlsZEJ5TmFtZSgnY29kZV9iZycpO1xuICAgICAgICAgICAgaWYgKGNvZGVCZykge1xuICAgICAgICAgICAgICAgIHZhciBncmFwaGljcyA9IGNvZGVCZy5nZXRDb21wb25lbnQoY2MuR3JhcGhpY3MpO1xuICAgICAgICAgICAgICAgIGlmIChncmFwaGljcykge1xuICAgICAgICAgICAgICAgICAgICBncmFwaGljcy5jbGVhcigpO1xuICAgICAgICAgICAgICAgICAgICAvLyDlhYjnu5jliLbloavlhYXog4zmma/vvIjljYrpgI/mmI7nmb3oibLvvIlcbiAgICAgICAgICAgICAgICAgICAgZ3JhcGhpY3MuZmlsbENvbG9yID0gbmV3IGNjLkNvbG9yKDI1NSwgMjUyLCAyNDAsIDIzMCk7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuX2RyYXdSb3VuZFJlY3QoZ3JhcGhpY3MsIC05NSwgLTI1LCAxOTAsIDUwLCAxNCk7XG4gICAgICAgICAgICAgICAgICAgIGdyYXBoaWNzLmZpbGwoKTtcbiAgICAgICAgICAgICAgICAgICAgLy8g5YaN57uY5Yi26L655qGG77yI6YeR6Imy77yJXG4gICAgICAgICAgICAgICAgICAgIGdyYXBoaWNzLnN0cm9rZUNvbG9yID0gbmV3IGNjLkNvbG9yKDIxOCwgMTY1LCAzMiwgMjU1KTtcbiAgICAgICAgICAgICAgICAgICAgZ3JhcGhpY3MubGluZVdpZHRoID0gMjtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5fZHJhd1JvdW5kUmVjdChncmFwaGljcywgLTk1LCAtMjUsIDE5MCwgNTAsIDE0KTtcbiAgICAgICAgICAgICAgICAgICAgZ3JhcGhpY3Muc3Ryb2tlKCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgIC8vIOehruS/nSBjb2RlX2JnIOiKgueCueWcqCBpbnB1dCDoioLngrnkuIvmlrlcbiAgICAgICAgICAgICAgICB2YXIgY29kZUlucHV0ID0gY29kZUJnLmdldENoaWxkQnlOYW1lKCdjb2RlX2lucHV0Jyk7XG4gICAgICAgICAgICAgICAgaWYgKGNvZGVJbnB1dCkge1xuICAgICAgICAgICAgICAgICAgICBjb2RlSW5wdXQuekluZGV4ID0gMTA7XG4gICAgICAgICAgICAgICAgICAgIGNvZGVCZy56SW5kZXggPSA1O1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIC8vIOe7mOWItuWIhuWJsue6v1xuICAgICAgICB2YXIgZGl2aWRlciA9IGNvbnRlbnRQYW5lbC5nZXRDaGlsZEJ5TmFtZSgnZGl2aWRlcicpO1xuICAgICAgICBpZiAoZGl2aWRlcikge1xuICAgICAgICAgICAgdmFyIGdyYXBoaWNzID0gZGl2aWRlci5nZXRDb21wb25lbnQoY2MuR3JhcGhpY3MpO1xuICAgICAgICAgICAgaWYgKGdyYXBoaWNzKSB7XG4gICAgICAgICAgICAgICAgZ3JhcGhpY3MuY2xlYXIoKTtcbiAgICAgICAgICAgICAgICBncmFwaGljcy5zdHJva2VDb2xvciA9IG5ldyBjYy5Db2xvcigyMDAsIDE4MCwgMTQwLCAxODApO1xuICAgICAgICAgICAgICAgIGdyYXBoaWNzLmxpbmVXaWR0aCA9IDE7XG4gICAgICAgICAgICAgICAgZ3JhcGhpY3MubW92ZVRvKC0xNzAsIDApO1xuICAgICAgICAgICAgICAgIGdyYXBoaWNzLmxpbmVUbygxNzAsIDApO1xuICAgICAgICAgICAgICAgIGdyYXBoaWNzLnN0cm9rZSgpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfSxcblxuICAgIC8vIOe7mOWItuWchuinkuefqeW9olxuICAgIF9kcmF3Um91bmRSZWN0OiBmdW5jdGlvbihncmFwaGljcywgeCwgeSwgdywgaCwgcikge1xuICAgICAgICBncmFwaGljcy5tb3ZlVG8oeCArIHIsIHkpO1xuICAgICAgICBncmFwaGljcy5saW5lVG8oeCArIHcgLSByLCB5KTtcbiAgICAgICAgZ3JhcGhpY3MuYXJjVG8oeCArIHcsIHksIHggKyB3LCB5ICsgciwgcik7XG4gICAgICAgIGdyYXBoaWNzLmxpbmVUbyh4ICsgdywgeSArIGggLSByKTtcbiAgICAgICAgZ3JhcGhpY3MuYXJjVG8oeCArIHcsIHkgKyBoLCB4ICsgdyAtIHIsIHkgKyBoLCByKTtcbiAgICAgICAgZ3JhcGhpY3MubGluZVRvKHggKyByLCB5ICsgaCk7XG4gICAgICAgIGdyYXBoaWNzLmFyY1RvKHgsIHkgKyBoLCB4LCB5ICsgaCAtIHIsIHIpO1xuICAgICAgICBncmFwaGljcy5saW5lVG8oeCwgeSArIHIpO1xuICAgICAgICBncmFwaGljcy5hcmNUbyh4LCB5LCB4ICsgciwgeSwgcik7XG4gICAgfSxcblxuICAgIC8vIOWIneWni+WMluW+ruS/oeeZu+W9leaMiemSrlxuICAgIF9pbml0V2VjaGF0QnV0dG9uOiBmdW5jdGlvbigpIHtcbiAgICAgICAgdmFyIGNvbnRlbnRQYW5lbCA9IHRoaXMubm9kZS5nZXRDaGlsZEJ5TmFtZSgnY29udGVudF9wYW5lbCcpO1xuICAgICAgICBpZiAoIWNvbnRlbnRQYW5lbCkgcmV0dXJuO1xuXG4gICAgICAgIHZhciB3eENvbnRhaW5lciA9IGNvbnRlbnRQYW5lbC5nZXRDaGlsZEJ5TmFtZSgnd3hfbG9naW5fY29udGFpbmVyJyk7XG4gICAgICAgIGlmICh3eENvbnRhaW5lcikge1xuICAgICAgICAgICAgdmFyIHd4QnRuID0gd3hDb250YWluZXIuZ2V0Q2hpbGRCeU5hbWUoJ3d4X2xvZ2luX2J0bicpO1xuICAgICAgICAgICAgaWYgKHd4QnRuKSB7XG4gICAgICAgICAgICAgICAgLy8g5re75Yqg5oyJ6ZKu54K55Ye75pWI5p6cXG4gICAgICAgICAgICAgICAgd3hCdG4ub24oY2MuTm9kZS5FdmVudFR5cGUuVE9VQ0hfU1RBUlQsIGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICAgICAgICB3eEJ0bi5zY2FsZSA9IDAuOTU7XG4gICAgICAgICAgICAgICAgfSwgdGhpcyk7XG4gICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgd3hCdG4ub24oY2MuTm9kZS5FdmVudFR5cGUuVE9VQ0hfRU5ELCBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgICAgICAgd3hCdG4uc2NhbGUgPSAxO1xuICAgICAgICAgICAgICAgICAgICB0aGlzLl9vbldlY2hhdExvZ2luQ2xpY2soKTtcbiAgICAgICAgICAgICAgICB9LCB0aGlzKTtcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICB3eEJ0bi5vbihjYy5Ob2RlLkV2ZW50VHlwZS5UT1VDSF9DQU5DRUwsIGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICAgICAgICB3eEJ0bi5zY2FsZSA9IDE7XG4gICAgICAgICAgICAgICAgfSwgdGhpcyk7XG5cbiAgICAgICAgICAgICAgICAvLyDmt7vliqBcIuW+ruS/oeeZu+W9lVwi5paH5a2X5qCH562+XG4gICAgICAgICAgICAgICAgdGhpcy5fY3JlYXRlV2VjaGF0TGFiZWwod3hDb250YWluZXIpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfSxcblxuICAgIC8vIOWIm+W7uuW+ruS/oeeZu+W9leaWh+Wtl+agh+etvlxuICAgIF9jcmVhdGVXZWNoYXRMYWJlbDogZnVuY3Rpb24oY29udGFpbmVyKSB7XG4gICAgICAgIC8vIOajgOafpeaYr+WQpuW3suWtmOWcqOagh+etvlxuICAgICAgICB2YXIgZXhpc3RMYWJlbCA9IGNvbnRhaW5lci5nZXRDaGlsZEJ5TmFtZSgnd3hfbG9naW5fbGFiZWwnKTtcbiAgICAgICAgaWYgKGV4aXN0TGFiZWwpIHJldHVybjtcblxuICAgICAgICB2YXIgbGFiZWxOb2RlID0gbmV3IGNjLk5vZGUoJ3d4X2xvZ2luX2xhYmVsJyk7XG4gICAgICAgIGxhYmVsTm9kZS5wYXJlbnQgPSBjb250YWluZXI7XG4gICAgICAgIGxhYmVsTm9kZS55ID0gLTM1O1xuXG4gICAgICAgIHZhciBsYWJlbCA9IGxhYmVsTm9kZS5hZGRDb21wb25lbnQoY2MuTGFiZWwpO1xuICAgICAgICBsYWJlbC5zdHJpbmcgPSAn5b6u5L+h55m75b2VJztcbiAgICAgICAgbGFiZWwuZm9udFNpemUgPSAxODtcbiAgICAgICAgbGFiZWwubGluZUhlaWdodCA9IDIyO1xuICAgICAgICBsYWJlbC5mb250RmFtaWx5ID0gJ0FyaWFsJztcbiAgICAgICAgbGFiZWwuZm9udENvbG9yID0gbmV3IGNjLkNvbG9yKDEyMCwgMTAwLCA4MCwgMjU1KTtcbiAgICAgICAgbGFiZWwuaG9yaXpvbnRhbEFsaWduID0gY2MuTGFiZWwuSG9yaXpvbnRhbEFsaWduLkNFTlRFUjtcbiAgICB9LFxuXG4gICAgX2luaXRCdXR0b25zOiBmdW5jdGlvbigpIHtcbiAgICAgICAgdmFyIHNlbGYgPSB0aGlzO1xuXG4gICAgICAgIC8vIOWFs+mXreaMiemSrlxuICAgICAgICBpZiAodGhpcy5jbG9zZV9idG4pIHtcbiAgICAgICAgICAgIHRoaXMuY2xvc2VfYnRuLm5vZGUub2ZmKGNjLk5vZGUuRXZlbnRUeXBlLlRPVUNIX0VORCk7XG4gICAgICAgICAgICB0aGlzLmNsb3NlX2J0bi5ub2RlLm9uKGNjLk5vZGUuRXZlbnRUeXBlLlRPVUNIX0VORCwgZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgICAgc2VsZi5fb25DbG9zZUNsaWNrKCk7XG4gICAgICAgICAgICB9LCB0aGlzKTtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIOWPkemAgemqjOivgeeggeaMiemSrlxuICAgICAgICBpZiAodGhpcy5zZW5kX2NvZGVfYnRuKSB7XG4gICAgICAgICAgICB0aGlzLnNlbmRfY29kZV9idG4ubm9kZS5vZmYoY2MuTm9kZS5FdmVudFR5cGUuVE9VQ0hfRU5EKTtcbiAgICAgICAgICAgIHRoaXMuc2VuZF9jb2RlX2J0bi5ub2RlLm9uKGNjLk5vZGUuRXZlbnRUeXBlLlRPVUNIX0VORCwgZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgICAgc2VsZi5fb25TZW5kQ29kZUNsaWNrKCk7XG4gICAgICAgICAgICB9LCB0aGlzKTtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIOeZu+W9leaMiemSrlxuICAgICAgICBpZiAodGhpcy5sb2dpbl9idG4pIHtcbiAgICAgICAgICAgIHRoaXMubG9naW5fYnRuLm5vZGUub2ZmKGNjLk5vZGUuRXZlbnRUeXBlLlRPVUNIX0VORCk7XG4gICAgICAgICAgICB0aGlzLmxvZ2luX2J0bi5ub2RlLm9uKGNjLk5vZGUuRXZlbnRUeXBlLlRPVUNIX0VORCwgZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgICAgc2VsZi5fb25Mb2dpbkNsaWNrKCk7XG4gICAgICAgICAgICB9LCB0aGlzKTtcbiAgICAgICAgfVxuICAgIH0sXG5cbiAgICAvLyDlvq7kv6HnmbvlvZXngrnlh7tcbiAgICBfb25XZWNoYXRMb2dpbkNsaWNrOiBmdW5jdGlvbigpIHtcbiAgICAgICAgY29uc29sZS5sb2coJ+OAkOW+ruS/oeeZu+W9leOAkeeCueWHu+W+ruS/oeeZu+W9leaMiemSricpO1xuICAgICAgICBcbiAgICAgICAgLy8g5qOA5p+l5piv5ZCm5pyJ5YWo5bGA55qE5b6u5L+h55m75b2V5pa55rOVXG4gICAgICAgIGlmICh3aW5kb3cubXlnbG9iYWwgJiYgd2luZG93Lm15Z2xvYmFsLndlY2hhdExvZ2luKSB7XG4gICAgICAgICAgICB3aW5kb3cubXlnbG9iYWwud2VjaGF0TG9naW4oKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIC8vIOmZjee6p++8muaPkOekuueUqOaIt1xuICAgICAgICAgICAgdGhpcy5fc2hvd01lc3NhZ2UoJ+W+ruS/oeeZu+W9leWKn+iDveaaguacquW8gOaUvicsIHRydWUpO1xuICAgICAgICB9XG4gICAgfSxcblxuICAgIC8vIOaJi+acuuWPt+i+k+WFpeWPmOWMllxuICAgIG9uUGhvbmVJbnB1dENoYW5nZWQ6IGZ1bmN0aW9uKGVkaXRib3gsIGN1c3RvbUV2ZW50RGF0YSkge1xuICAgICAgICB0aGlzLl9waG9uZSA9IGVkaXRib3guc3RyaW5nO1xuICAgIH0sXG5cbiAgICAvLyDpqozor4HnoIHovpPlhaXlj5jljJZcbiAgICBvbkNvZGVJbnB1dENoYW5nZWQ6IGZ1bmN0aW9uKGVkaXRib3gsIGN1c3RvbUV2ZW50RGF0YSkge1xuICAgICAgICB0aGlzLl9jb2RlID0gZWRpdGJveC5zdHJpbmc7XG4gICAgfSxcblxuICAgIC8vIOWPkemAgemqjOivgeeggVxuICAgIF9vblNlbmRDb2RlQ2xpY2s6IGZ1bmN0aW9uKCkge1xuICAgICAgICB2YXIgc2VsZiA9IHRoaXM7XG5cbiAgICAgICAgaWYgKHRoaXMuX2NvdW50ZG93biA+IDApIHtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIOS7jui+k+WFpeahhuiOt+WPluaJi+acuuWPt1xuICAgICAgICBpZiAodGhpcy5waG9uZV9pbnB1dCkge1xuICAgICAgICAgICAgdGhpcy5fcGhvbmUgPSB0aGlzLnBob25lX2lucHV0LnN0cmluZyB8fCBcIlwiO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8g6aqM6K+B5omL5py65Y+3XG4gICAgICAgIGlmICghdGhpcy5fdmFsaWRhdGVQaG9uZSh0aGlzLl9waG9uZSkpIHtcbiAgICAgICAgICAgIHRoaXMuX3Nob3dNZXNzYWdlKFwi6K+36L6T5YWl5q2j56Gu55qE5omL5py65Y+3XCIsIHRydWUpO1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgICAgdGhpcy5fc2hvd01lc3NhZ2UoXCLmraPlnKjlj5HpgIEuLi5cIiwgZmFsc2UpO1xuICAgICAgICB0aGlzLl9zZXRJbnRlcmFjdGFibGUoZmFsc2UpO1xuXG4gICAgICAgIC8vIOiwg+eUqOWPkemAgemqjOivgeeggeaOpeWPo1xuICAgICAgICB0aGlzLl9zZW5kQ29kZVJlcXVlc3QodGhpcy5fcGhvbmUsIGZ1bmN0aW9uKHN1Y2Nlc3MsIG1lc3NhZ2UpIHtcbiAgICAgICAgICAgIHNlbGYuX3NldEludGVyYWN0YWJsZSh0cnVlKTtcblxuICAgICAgICAgICAgaWYgKHN1Y2Nlc3MpIHtcbiAgICAgICAgICAgICAgICBzZWxmLl9zdGFydENvdW50ZG93bigpO1xuICAgICAgICAgICAgICAgIHNlbGYuX3Nob3dNZXNzYWdlKFwi6aqM6K+B56CB5bey5Y+R6YCBXCIsIGZhbHNlKTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgc2VsZi5fc2hvd01lc3NhZ2UobWVzc2FnZSB8fCBcIuWPkemAgeWksei0pe+8jOivt+mHjeivlVwiLCB0cnVlKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgfSxcblxuICAgIC8vIOeZu+W9lVxuICAgIF9vbkxvZ2luQ2xpY2s6IGZ1bmN0aW9uKCkge1xuICAgICAgICB2YXIgc2VsZiA9IHRoaXM7XG5cbiAgICAgICAgLy8g5LuO6L6T5YWl5qGG6I635Y+W5YC8XG4gICAgICAgIGlmICh0aGlzLnBob25lX2lucHV0KSB7XG4gICAgICAgICAgICB0aGlzLl9waG9uZSA9IHRoaXMucGhvbmVfaW5wdXQuc3RyaW5nIHx8IFwiXCI7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKHRoaXMuY29kZV9pbnB1dCkge1xuICAgICAgICAgICAgdGhpcy5fY29kZSA9IHRoaXMuY29kZV9pbnB1dC5zdHJpbmcgfHwgXCJcIjtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIOmqjOivgei+k+WFpVxuICAgICAgICBpZiAoIXRoaXMuX3ZhbGlkYXRlUGhvbmUodGhpcy5fcGhvbmUpKSB7XG4gICAgICAgICAgICB0aGlzLl9zaG93TWVzc2FnZShcIuivt+i+k+WFpeato+ehrueahOaJi+acuuWPt1wiLCB0cnVlKTtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmICghdGhpcy5fdmFsaWRhdGVDb2RlKHRoaXMuX2NvZGUpKSB7XG4gICAgICAgICAgICB0aGlzLl9zaG93TWVzc2FnZShcIuivt+i+k+WFpemqjOivgeeggVwiLCB0cnVlKTtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIHRoaXMuX3Nob3dNZXNzYWdlKFwi5q2j5Zyo55m75b2VLi4uXCIsIGZhbHNlKTtcbiAgICAgICAgdGhpcy5fc2V0SW50ZXJhY3RhYmxlKGZhbHNlKTtcblxuICAgICAgICAvLyDosIPnlKjnmbvlvZXmjqXlj6NcbiAgICAgICAgdGhpcy5fcGhvbmVMb2dpblJlcXVlc3QodGhpcy5fcGhvbmUsIHRoaXMuX2NvZGUsIGZ1bmN0aW9uKHN1Y2Nlc3MsIG1lc3NhZ2UsIGRhdGEpIHtcbiAgICAgICAgICAgIHNlbGYuX3NldEludGVyYWN0YWJsZSh0cnVlKTtcblxuICAgICAgICAgICAgaWYgKHN1Y2Nlc3MpIHtcbiAgICAgICAgICAgICAgICBzZWxmLl9zaG93TWVzc2FnZShcIueZu+W9leaIkOWKn1wiLCBmYWxzZSk7XG5cbiAgICAgICAgICAgICAgICAvLyDkv53lrZjnlKjmiLfmlbDmja5cbiAgICAgICAgICAgICAgICBpZiAod2luZG93Lm15Z2xvYmFsICYmIHdpbmRvdy5teWdsb2JhbC5wbGF5ZXJEYXRhICYmIGRhdGEpIHtcbiAgICAgICAgICAgICAgICAgICAgd2luZG93Lm15Z2xvYmFsLnBsYXllckRhdGEudW5pcXVlSUQgPSBkYXRhLnVuaXF1ZUlEIHx8IFwiXCI7XG4gICAgICAgICAgICAgICAgICAgIHdpbmRvdy5teWdsb2JhbC5wbGF5ZXJEYXRhLmFjY291bnRJRCA9IGRhdGEuYWNjb3VudElEIHx8IFwiXCI7XG4gICAgICAgICAgICAgICAgICAgIHdpbmRvdy5teWdsb2JhbC5wbGF5ZXJEYXRhLm5pY2tOYW1lID0gZGF0YS5uaWNrTmFtZSB8fCBcIueOqeWutlwiO1xuICAgICAgICAgICAgICAgICAgICB3aW5kb3cubXlnbG9iYWwucGxheWVyRGF0YS5hdmF0YXJVcmwgPSBkYXRhLmF2YXRhclVybCB8fCBcIlwiO1xuICAgICAgICAgICAgICAgICAgICB3aW5kb3cubXlnbG9iYWwucGxheWVyRGF0YS5nb2JhbF9jb3VudCA9IGRhdGEuZ29sZGNvdW50IHx8IDA7XG4gICAgICAgICAgICAgICAgICAgIHdpbmRvdy5teWdsb2JhbC5wbGF5ZXJEYXRhLnRva2VuID0gZGF0YS50b2tlbiB8fCBcIlwiO1xuICAgICAgICAgICAgICAgICAgICAvLyDkv53lrZjliLDmnKzlnLDlrZjlgqhcbiAgICAgICAgICAgICAgICAgICAgd2luZG93Lm15Z2xvYmFsLnBsYXllckRhdGEuc2F2ZVRvTG9jYWwoKTtcbiAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2coXCLjgJDmiYvmnLrnmbvlvZXjgJHnlKjmiLfmlbDmja7lt7Lkv53lrZgsIG5pY2tOYW1lID1cIiwgd2luZG93Lm15Z2xvYmFsLnBsYXllckRhdGEubmlja05hbWUpO1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIC8vIOi3s+i9rOWIsOWkp+WOheWcuuaZr1xuICAgICAgICAgICAgICAgIHNlbGYuc2NoZWR1bGVPbmNlKGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICAgICAgICBzZWxmLl9vbkNsb3NlQ2xpY2soKTtcbiAgICAgICAgICAgICAgICAgICAgY2MuZGlyZWN0b3IubG9hZFNjZW5lKFwiaGFsbFNjZW5lXCIpO1xuICAgICAgICAgICAgICAgIH0sIDAuNSk7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIHNlbGYuX3Nob3dNZXNzYWdlKG1lc3NhZ2UgfHwgXCLnmbvlvZXlpLHotKXvvIzor7fph43or5VcIiwgdHJ1ZSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgIH0sXG5cbiAgICAvLyDlhbPpl63lvLnnqpdcbiAgICBfb25DbG9zZUNsaWNrOiBmdW5jdGlvbigpIHtcbiAgICAgICAgaWYgKHRoaXMuX2NvdW50ZG93biA+IDApIHtcbiAgICAgICAgICAgIHRoaXMudW5zY2hlZHVsZSh0aGlzLl9jb3VudGRvd25UaWNrKTtcbiAgICAgICAgfVxuICAgICAgICB0aGlzLm5vZGUuZGVzdHJveSgpO1xuICAgIH0sXG5cbiAgICAvLyDpqozor4HmiYvmnLrlj7dcbiAgICBfdmFsaWRhdGVQaG9uZTogZnVuY3Rpb24ocGhvbmUpIHtcbiAgICAgICAgaWYgKCFwaG9uZSB8fCBwaG9uZS5sZW5ndGggIT09IDExKSB7XG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgIH1cbiAgICAgICAgLy8g566A5Y2V6aqM6K+B77ya5LulMeW8gOWktOeahDEx5L2N5pWw5a2XXG4gICAgICAgIHZhciByZWcgPSAvXjFbMy05XVxcZHs5fSQvO1xuICAgICAgICByZXR1cm4gcmVnLnRlc3QocGhvbmUpO1xuICAgIH0sXG5cbiAgICAvLyDpqozor4Hpqozor4HnoIFcbiAgICBfdmFsaWRhdGVDb2RlOiBmdW5jdGlvbihjb2RlKSB7XG4gICAgICAgIC8vIOS/neeVmemdnuepuuajgOa1i++8jOa1i+ivlemYtuauteS4jemqjOivgeagvOW8j1xuICAgICAgICByZXR1cm4gY29kZSAmJiBjb2RlLmxlbmd0aCA+IDA7XG4gICAgfSxcblxuICAgIC8vIOW8gOWni+WAkuiuoeaXtlxuICAgIF9zdGFydENvdW50ZG93bjogZnVuY3Rpb24oKSB7XG4gICAgICAgIHRoaXMuX2NvdW50ZG93biA9IHRoaXMuY291bnRkb3duX3RpbWU7XG4gICAgICAgIHRoaXMuX3VwZGF0ZUNvdW50ZG93bkxhYmVsKCk7XG5cbiAgICAgICAgdGhpcy5zY2hlZHVsZSh0aGlzLl9jb3VudGRvd25UaWNrLCAxKTtcbiAgICB9LFxuXG4gICAgLy8g5YCS6K6h5pe25q+P56eS5Zue6LCDXG4gICAgX2NvdW50ZG93blRpY2s6IGZ1bmN0aW9uKCkge1xuICAgICAgICB0aGlzLl9jb3VudGRvd24tLTtcblxuICAgICAgICBpZiAodGhpcy5fY291bnRkb3duIDw9IDApIHtcbiAgICAgICAgICAgIHRoaXMudW5zY2hlZHVsZSh0aGlzLl9jb3VudGRvd25UaWNrKTtcbiAgICAgICAgICAgIHRoaXMuX3Jlc2V0U2VuZENvZGVCdG4oKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHRoaXMuX3VwZGF0ZUNvdW50ZG93bkxhYmVsKCk7XG4gICAgICAgIH1cbiAgICB9LFxuXG4gICAgLy8g5pu05paw5YCS6K6h5pe25qCH562+XG4gICAgX3VwZGF0ZUNvdW50ZG93bkxhYmVsOiBmdW5jdGlvbigpIHtcbiAgICAgICAgaWYgKHRoaXMuc2VuZF9jb2RlX2xhYmVsKSB7XG4gICAgICAgICAgICB0aGlzLnNlbmRfY29kZV9sYWJlbC5zdHJpbmcgPSB0aGlzLl9jb3VudGRvd24gKyBcIuenkuWQjumHjeivlVwiO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKHRoaXMuc2VuZF9jb2RlX2J0bikge1xuICAgICAgICAgICAgdGhpcy5zZW5kX2NvZGVfYnRuLmludGVyYWN0YWJsZSA9IGZhbHNlO1xuICAgICAgICB9XG4gICAgfSxcblxuICAgIC8vIOmHjee9ruWPkemAgemqjOivgeeggeaMiemSrlxuICAgIF9yZXNldFNlbmRDb2RlQnRuOiBmdW5jdGlvbigpIHtcbiAgICAgICAgaWYgKHRoaXMuc2VuZF9jb2RlX2xhYmVsKSB7XG4gICAgICAgICAgICB0aGlzLnNlbmRfY29kZV9sYWJlbC5zdHJpbmcgPSBcIuiOt+WPlumqjOivgeeggVwiO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKHRoaXMuc2VuZF9jb2RlX2J0bikge1xuICAgICAgICAgICAgdGhpcy5zZW5kX2NvZGVfYnRuLmludGVyYWN0YWJsZSA9IHRydWU7XG4gICAgICAgIH1cbiAgICB9LFxuXG4gICAgLy8g5pi+56S65raI5oGvXG4gICAgX3Nob3dNZXNzYWdlOiBmdW5jdGlvbihtZXNzYWdlLCBpc0Vycm9yKSB7XG4gICAgICAgIGlmICh0aGlzLm1lc3NhZ2VfbGFiZWwpIHtcbiAgICAgICAgICAgIHRoaXMubWVzc2FnZV9sYWJlbC5ub2RlLmFjdGl2ZSA9IHRydWU7XG4gICAgICAgICAgICB0aGlzLm1lc3NhZ2VfbGFiZWwuc3RyaW5nID0gbWVzc2FnZTtcblxuICAgICAgICAgICAgaWYgKGlzRXJyb3IpIHtcbiAgICAgICAgICAgICAgICB0aGlzLm1lc3NhZ2VfbGFiZWwubm9kZS5jb2xvciA9IG5ldyBjYy5Db2xvcigyNTUsIDEwMCwgMTAwKTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgdGhpcy5tZXNzYWdlX2xhYmVsLm5vZGUuY29sb3IgPSBuZXcgY2MuQ29sb3IoMTAwLCAyMDAsIDEwMCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBjb25zb2xlLmxvZyhpc0Vycm9yID8gJ1vplJnor69dJyA6ICdb5L+h5oGvXScsIG1lc3NhZ2UpO1xuICAgICAgICB9XG4gICAgfSxcblxuICAgIC8vIOmakOiXj+a2iOaBr1xuICAgIF9oaWRlTWVzc2FnZTogZnVuY3Rpb24oKSB7XG4gICAgICAgIGlmICh0aGlzLm1lc3NhZ2VfbGFiZWwpIHtcbiAgICAgICAgICAgIHRoaXMubWVzc2FnZV9sYWJlbC5ub2RlLmFjdGl2ZSA9IGZhbHNlO1xuICAgICAgICB9XG4gICAgfSxcblxuICAgIC8vIOiuvue9ruaMiemSruS6pOS6kueKtuaAgVxuICAgIF9zZXRJbnRlcmFjdGFibGU6IGZ1bmN0aW9uKGludGVyYWN0YWJsZSkge1xuICAgICAgICBpZiAodGhpcy5sb2dpbl9idG4pIHtcbiAgICAgICAgICAgIHRoaXMubG9naW5fYnRuLmludGVyYWN0YWJsZSA9IGludGVyYWN0YWJsZTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmICh0aGlzLnNlbmRfY29kZV9idG4gJiYgdGhpcy5fY291bnRkb3duIDw9IDApIHtcbiAgICAgICAgICAgIHRoaXMuc2VuZF9jb2RlX2J0bi5pbnRlcmFjdGFibGUgPSBpbnRlcmFjdGFibGU7XG4gICAgICAgIH1cbiAgICB9LFxuXG4gICAgLy8g5Y+R6YCB6aqM6K+B56CB6K+35rGCIC0g5L2/55SoSHR0cEFQSeaUr+aMgeWKoOWvhuino+WvhlxuICAgIF9zZW5kQ29kZVJlcXVlc3Q6IGZ1bmN0aW9uKHBob25lLCBjYWxsYmFjaykge1xuXG4gICAgICAgIHZhciBkZWZpbmVzID0gd2luZG93LmRlZmluZXM7XG4gICAgICAgIGlmICghZGVmaW5lcyB8fCAhZGVmaW5lcy5hcGlVcmwpIHtcbiAgICAgICAgICAgIGNhbGxiYWNrKHRydWUsIFwi5Y+R6YCB5oiQ5YqfXCIpO1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgICAgdmFyIHVybCA9IGRlZmluZXMuYXBpVXJsICsgJy9hcGkvdjEvYXV0aC9zZW5kLWNvZGUnO1xuICAgICAgICB2YXIgY3J5cHRvS2V5ID0gZGVmaW5lcy5jcnlwdG9LZXkgfHwgXCJcIjtcblxuICAgICAgICAvLyDkvb/nlKhIdHRwQVBJLnBvc3Tlj5HpgIHor7fmsYLvvIjmlK/mjIHliqDlr4bop6Plr4bvvIlcbiAgICAgICAgaWYgKHdpbmRvdy5IdHRwQVBJKSB7XG4gICAgICAgICAgICB3aW5kb3cuSHR0cEFQSS5wb3N0KHVybCwgeyBwaG9uZTogcGhvbmUgfSwgY3J5cHRvS2V5LCBmdW5jdGlvbihlcnIsIHJlc3VsdCkge1xuICAgICAgICAgICAgICAgIGlmIChlcnIpIHtcbiAgICAgICAgICAgICAgICAgICAgY29uc29sZS5lcnJvcihcIuWPkemAgemqjOivgeeggeWksei0pTpcIiwgZXJyKTtcbiAgICAgICAgICAgICAgICAgICAgY2FsbGJhY2soZmFsc2UsIGVycik7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICBpZiAocmVzdWx0ICYmIHJlc3VsdC5jb2RlID09PSAwKSB7XG4gICAgICAgICAgICAgICAgICAgIHZhciBtc2cgPSBcIumqjOivgeeggeW3suWPkemAgVwiO1xuICAgICAgICAgICAgICAgICAgICAvLyDlvIDlj5Hnjq/looPvvJrmmL7npLrpqozor4HnoIFcbiAgICAgICAgICAgICAgICAgICAgaWYgKHJlc3VsdC5kYXRhICYmIHJlc3VsdC5kYXRhLmNvZGUpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIG1zZyA9IFwi6aqM6K+B56CBOiBcIiArIHJlc3VsdC5kYXRhLmNvZGU7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgY2FsbGJhY2sodHJ1ZSwgbXNnKTtcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICBjYWxsYmFjayhmYWxzZSwgcmVzdWx0ID8gcmVzdWx0Lm1lc3NhZ2UgOiBcIuWPkemAgeWksei0pVwiKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIC8vIOmZjee6p++8muebtOaOpeWPkemAgeivt+axgu+8iOS4jeaUr+aMgeino+Wvhu+8iVxuICAgICAgICAgICAgY29uc29sZS53YXJuKFwiSHR0cEFQSeacquWKoOi9ve+8jOS9v+eUqOWOn+Wni+ivt+axglwiKTtcbiAgICAgICAgICAgIHZhciB4aHIgPSBuZXcgWE1MSHR0cFJlcXVlc3QoKTtcbiAgICAgICAgICAgIHhoci5vcGVuKCdQT1NUJywgdXJsLCB0cnVlKTtcbiAgICAgICAgICAgIHhoci5zZXRSZXF1ZXN0SGVhZGVyKCdDb250ZW50LVR5cGUnLCAnYXBwbGljYXRpb24vanNvbicpO1xuICAgICAgICAgICAgeGhyLnRpbWVvdXQgPSAxMDAwMDtcblxuICAgICAgICAgICAgeGhyLm9ucmVhZHlzdGF0ZWNoYW5nZSA9IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICAgIGlmICh4aHIucmVhZHlTdGF0ZSA9PT0gNCkge1xuICAgICAgICAgICAgICAgICAgICBpZiAoeGhyLnN0YXR1cyA+PSAyMDAgJiYgeGhyLnN0YXR1cyA8IDMwMCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB2YXIgcmVzcG9uc2UgPSBKU09OLnBhcnNlKHhoci5yZXNwb25zZVRleHQpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIOajgOafpeaYr+WQpuaYr+WKoOWvhuWTjeW6lFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChyZXNwb25zZS5kYXRhICYmIHJlc3BvbnNlLnRpbWVzdGFtcCAmJiB0eXBlb2YgcmVzcG9uc2UuZGF0YSA9PT0gJ3N0cmluZycpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY2FsbGJhY2soZmFsc2UsIFwi5pyN5Yqh5Zmo6L+U5Zue5Yqg5a+G5pWw5o2u77yM6K+35Yi35paw6aG16Z2i6YeN6K+VXCIpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0gZWxzZSBpZiAocmVzcG9uc2UuY29kZSA9PT0gMCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjYWxsYmFjayh0cnVlLCBcIumqjOivgeeggeW3suWPkemAgVwiKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjYWxsYmFjayhmYWxzZSwgcmVzcG9uc2UubWVzc2FnZSB8fCBcIuWPkemAgeWksei0pVwiKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICB9IGNhdGNoIChlKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY2FsbGJhY2soZmFsc2UsIFwi6Kej5p6Q5ZON5bqU5aSx6LSlXCIpO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgY2FsbGJhY2soZmFsc2UsIFwi572R57uc6K+35rGC5aSx6LSlXCIpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfTtcblxuICAgICAgICAgICAgeGhyLm9udGltZW91dCA9IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICAgIGNhbGxiYWNrKGZhbHNlLCBcIuivt+axgui2heaXtlwiKTtcbiAgICAgICAgICAgIH07XG5cbiAgICAgICAgICAgIHhoci5vbmVycm9yID0gZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgICAgY2FsbGJhY2soZmFsc2UsIFwi572R57uc6ZSZ6K+vXCIpO1xuICAgICAgICAgICAgfTtcblxuICAgICAgICAgICAgeGhyLnNlbmQoSlNPTi5zdHJpbmdpZnkoeyBwaG9uZTogcGhvbmUgfSkpO1xuICAgICAgICB9XG4gICAgfSxcblxuICAgIC8vIOaJi+acuuWPt+eZu+W9leivt+axgiAtIOS9v+eUqEh0dHBBUEnmlK/mjIHliqDlr4bop6Plr4ZcbiAgICBfcGhvbmVMb2dpblJlcXVlc3Q6IGZ1bmN0aW9uKHBob25lLCBjb2RlLCBjYWxsYmFjaykge1xuXG4gICAgICAgIHZhciBkZWZpbmVzID0gd2luZG93LmRlZmluZXM7XG4gICAgICAgIGlmICghZGVmaW5lcyB8fCAhZGVmaW5lcy5hcGlVcmwpIHtcbiAgICAgICAgICAgIGNhbGxiYWNrKHRydWUsIFwi55m75b2V5oiQ5YqfXCIsIHtcbiAgICAgICAgICAgICAgICB1bmlxdWVJRDogXCJwaG9uZV9cIiArIHBob25lLFxuICAgICAgICAgICAgICAgIGFjY291bnRJRDogXCJwaG9uZV9cIiArIHBob25lLFxuICAgICAgICAgICAgICAgIG5pY2tOYW1lOiBcIueOqeWutlwiICsgcGhvbmUuc3Vic3RyKC00KSxcbiAgICAgICAgICAgICAgICBhdmF0YXJVcmw6IFwiXCIsXG4gICAgICAgICAgICAgICAgZ29sZGNvdW50OiAxMDAwLFxuICAgICAgICAgICAgICAgIHRva2VuOiBcIm1vY2tfdG9rZW5fXCIgKyBEYXRlLm5vdygpXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIHZhciB1cmwgPSBkZWZpbmVzLmFwaVVybCArICcvYXBpL3YxL2F1dGgvcGhvbmUtbG9naW4nO1xuICAgICAgICB2YXIgY3J5cHRvS2V5ID0gZGVmaW5lcy5jcnlwdG9LZXkgfHwgXCJcIjtcblxuICAgICAgICAvLyDlh4blpIfor7fmsYLmlbDmja5cbiAgICAgICAgdmFyIHJlcXVlc3REYXRhID0ge1xuICAgICAgICAgICAgcGhvbmU6IHBob25lLFxuICAgICAgICAgICAgY29kZTogY29kZVxuICAgICAgICB9O1xuXG5cbiAgICAgICAgLy8g5L2/55SoSHR0cEFQSS5wb3N05Y+R6YCB6K+35rGC77yI5pSv5oyB5Yqg5a+G6Kej5a+G77yJXG4gICAgICAgIGlmICh3aW5kb3cuSHR0cEFQSSAmJiB3aW5kb3cuSHR0cEFQSS5wb3N0KSB7XG4gICAgICAgICAgICB3aW5kb3cuSHR0cEFQSS5wb3N0KHVybCwgcmVxdWVzdERhdGEsIGNyeXB0b0tleSwgZnVuY3Rpb24oZXJyLCByZXN1bHQpIHtcbiAgICAgICAgICAgICAgICBpZiAoZXJyKSB7XG4gICAgICAgICAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoXCLnmbvlvZXor7fmsYLlpLHotKU6XCIsIGVycik7XG4gICAgICAgICAgICAgICAgICAgIGNhbGxiYWNrKGZhbHNlLCBlcnIsIG51bGwpO1xuICAgICAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgaWYgKHJlc3VsdCAmJiByZXN1bHQuY29kZSA9PT0gMCAmJiByZXN1bHQuZGF0YSkge1xuICAgICAgICAgICAgICAgICAgICBjYWxsYmFjayh0cnVlLCBcIueZu+W9leaIkOWKn1wiLCByZXN1bHQuZGF0YSk7XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgY2FsbGJhY2soZmFsc2UsIHJlc3VsdCA/IHJlc3VsdC5tZXNzYWdlIDogXCLnmbvlvZXlpLHotKVcIiwgbnVsbCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAvLyDpmY3nuqfvvJrnm7TmjqXlj5HpgIHor7fmsYJcbiAgICAgICAgICAgIGNvbnNvbGUud2FybihcIkh0dHBBUEnmnKrliqDovb3vvIzkvb/nlKjljp/lp4vor7fmsYJcIik7XG4gICAgICAgICAgICB2YXIgc2VsZiA9IHRoaXM7XG4gICAgICAgICAgICB2YXIgeGhyID0gbmV3IFhNTEh0dHBSZXF1ZXN0KCk7XG4gICAgICAgICAgICB4aHIub3BlbignUE9TVCcsIHVybCwgdHJ1ZSk7XG4gICAgICAgICAgICB4aHIuc2V0UmVxdWVzdEhlYWRlcignQ29udGVudC1UeXBlJywgJ2FwcGxpY2F0aW9uL2pzb24nKTtcbiAgICAgICAgICAgIHhoci5zZXRSZXF1ZXN0SGVhZGVyKCdYLURldmljZS1JRCcsIHRoaXMuX2dldERldmljZUlEKCkpO1xuICAgICAgICAgICAgeGhyLnNldFJlcXVlc3RIZWFkZXIoJ1gtRGV2aWNlLVR5cGUnLCB0aGlzLl9nZXREZXZpY2VUeXBlKCkpO1xuICAgICAgICAgICAgeGhyLnRpbWVvdXQgPSAxMDAwMDtcblxuICAgICAgICAgICAgeGhyLm9ucmVhZHlzdGF0ZWNoYW5nZSA9IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICAgIGlmICh4aHIucmVhZHlTdGF0ZSA9PT0gNCkge1xuICAgICAgICAgICAgICAgICAgICBpZiAoeGhyLnN0YXR1cyA+PSAyMDAgJiYgeGhyLnN0YXR1cyA8IDMwMCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB2YXIgcmVzcG9uc2UgPSBKU09OLnBhcnNlKHhoci5yZXNwb25zZVRleHQpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChyZXNwb25zZS5kYXRhICYmIHJlc3BvbnNlLnRpbWVzdGFtcCAmJiB0eXBlb2YgcmVzcG9uc2UuZGF0YSA9PT0gJ3N0cmluZycpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8g5Yqg5a+G5ZON5bqU77yM6ZyA6KaB6Kej5a+GXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmICh3aW5kb3cuSHR0cEFQSSAmJiB3aW5kb3cuSHR0cEFQSS5kZWNyeXB0QUVTR0NNKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB3aW5kb3cuSHR0cEFQSS5kZWNyeXB0QUVTR0NNKHJlc3BvbnNlLmRhdGEsIGNyeXB0b0tleSkudGhlbihmdW5jdGlvbihkZWNyeXB0ZWQpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAoZGVjcnlwdGVkICYmIGRlY3J5cHRlZC5jb2RlID09PSAwICYmIGRlY3J5cHRlZC5kYXRhKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNhbGxiYWNrKHRydWUsIFwi55m75b2V5oiQ5YqfXCIsIGRlY3J5cHRlZC5kYXRhKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjYWxsYmFjayhmYWxzZSwgZGVjcnlwdGVkID8gZGVjcnlwdGVkLm1lc3NhZ2UgOiBcIueZu+W9leWksei0pVwiLCBudWxsKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9KS5jYXRjaChmdW5jdGlvbihkZWNyeXB0RXJyKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY29uc29sZS5lcnJvcihcIuino+WvhuWksei0pTpcIiwgZGVjcnlwdEVycik7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY2FsbGJhY2soZmFsc2UsIFwi6Kej5a+G5ZON5bqU5aSx6LSlXCIsIG51bGwpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjYWxsYmFjayhmYWxzZSwgXCLmnI3liqHlmajov5Tlm57liqDlr4bmlbDmja7vvIzor7fliLfmlrDpobXpnaLph43or5VcIiwgbnVsbCk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9IGVsc2UgaWYgKHJlc3BvbnNlLmNvZGUgPT09IDAgJiYgcmVzcG9uc2UuZGF0YSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjYWxsYmFjayh0cnVlLCBcIueZu+W9leaIkOWKn1wiLCByZXNwb25zZS5kYXRhKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjYWxsYmFjayhmYWxzZSwgcmVzcG9uc2UubWVzc2FnZSB8fCBcIueZu+W9leWksei0pVwiLCBudWxsKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICB9IGNhdGNoIChlKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY29uc29sZS5lcnJvcihcIuino+aekOWTjeW6lOWksei0pTpcIiwgZSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY2FsbGJhY2soZmFsc2UsIFwi6Kej5p6Q5ZON5bqU5aSx6LSlXCIsIG51bGwpO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgY2FsbGJhY2soZmFsc2UsIFwi572R57uc6K+35rGC5aSx6LSlOiBIVFRQIFwiICsgeGhyLnN0YXR1cywgbnVsbCk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9O1xuXG4gICAgICAgICAgICB4aHIub250aW1lb3V0ID0gZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgICAgY2FsbGJhY2soZmFsc2UsIFwi6K+35rGC6LaF5pe2XCIsIG51bGwpO1xuICAgICAgICAgICAgfTtcblxuICAgICAgICAgICAgeGhyLm9uZXJyb3IgPSBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgICBjYWxsYmFjayhmYWxzZSwgXCLnvZHnu5zplJnor69cIiwgbnVsbCk7XG4gICAgICAgICAgICB9O1xuXG4gICAgICAgICAgICB4aHIuc2VuZChKU09OLnN0cmluZ2lmeShyZXF1ZXN0RGF0YSkpO1xuICAgICAgICB9XG4gICAgfSxcblxuICAgIC8vID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxuICAgIC8vIOiuvuWkh+S/oeaBr+iOt+WPllxuICAgIC8vID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxuXG4gICAgLy8g6I635Y+W6K6+5aSH5ZSv5LiA5qCH6K+GXG4gICAgX2dldERldmljZUlEOiBmdW5jdGlvbigpIHtcbiAgICAgICAgdmFyIERFVklDRV9JRF9LRVkgPSBcImRkel9kZXZpY2VfaWRcIjtcbiAgICAgICAgdmFyIGRldmljZUlkID0gXCJcIjtcblxuICAgICAgICAvLyDlsJ3or5Xku47mnKzlnLDlrZjlgqjojrflj5ZcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIGRldmljZUlkID0gY2Muc3lzLmxvY2FsU3RvcmFnZS5nZXRJdGVtKERFVklDRV9JRF9LRVkpO1xuICAgICAgICB9IGNhdGNoIChlKSB7XG4gICAgICAgIH1cblxuICAgICAgICAvLyDlpoLmnpzkuI3lrZjlnKjvvIznlJ/miJDmlrDnmoTorr7lpIdJRFxuICAgICAgICBpZiAoIWRldmljZUlkKSB7XG4gICAgICAgICAgICBkZXZpY2VJZCA9IHRoaXMuX2dlbmVyYXRlVVVJRCgpO1xuICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgICBjYy5zeXMubG9jYWxTdG9yYWdlLnNldEl0ZW0oREVWSUNFX0lEX0tFWSwgZGV2aWNlSWQpO1xuICAgICAgICAgICAgfSBjYXRjaCAoZSkge1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIGRldmljZUlkO1xuICAgIH0sXG5cbiAgICAvLyDojrflj5borr7lpIfnsbvlnotcbiAgICBfZ2V0RGV2aWNlVHlwZTogZnVuY3Rpb24oKSB7XG4gICAgICAgIHZhciBwbGF0Zm9ybSA9IGNjLnN5cy5wbGF0Zm9ybTtcbiAgICAgICAgdmFyIG9zID0gY2Muc3lzLm9zO1xuICAgICAgICB2YXIgZGV2aWNlVHlwZSA9IFwiVW5rbm93blwiO1xuXG4gICAgICAgIC8vIOagueaNruW5s+WPsOWIpOaWrVxuICAgICAgICBpZiAocGxhdGZvcm0gPT09IGNjLnN5cy5XRUNIQVRfR0FNRSkge1xuICAgICAgICAgICAgZGV2aWNlVHlwZSA9IFwiV2VDaGF0XCI7XG4gICAgICAgIH0gZWxzZSBpZiAocGxhdGZvcm0gPT09IGNjLnN5cy5BTkRST0lEKSB7XG4gICAgICAgICAgICBkZXZpY2VUeXBlID0gXCJBbmRyb2lkXCI7XG4gICAgICAgIH0gZWxzZSBpZiAocGxhdGZvcm0gPT09IGNjLnN5cy5JUEhPTkUpIHtcbiAgICAgICAgICAgIGRldmljZVR5cGUgPSBcImlQaG9uZVwiO1xuICAgICAgICB9IGVsc2UgaWYgKHBsYXRmb3JtID09PSBjYy5zeXMuSVBBRCkge1xuICAgICAgICAgICAgZGV2aWNlVHlwZSA9IFwiaVBhZFwiO1xuICAgICAgICB9IGVsc2UgaWYgKHBsYXRmb3JtID09PSBjYy5zeXMuTUFDX09TKSB7XG4gICAgICAgICAgICBkZXZpY2VUeXBlID0gXCJNYWNcIjtcbiAgICAgICAgfSBlbHNlIGlmIChwbGF0Zm9ybSA9PT0gY2Muc3lzLldJTkRPV1MpIHtcbiAgICAgICAgICAgIGRldmljZVR5cGUgPSBcIldpbmRvd3NcIjtcbiAgICAgICAgfSBlbHNlIGlmIChwbGF0Zm9ybSA9PT0gY2Muc3lzLkxJTlVYKSB7XG4gICAgICAgICAgICBkZXZpY2VUeXBlID0gXCJMaW51eFwiO1xuICAgICAgICB9IGVsc2UgaWYgKHBsYXRmb3JtID09PSBjYy5zeXMuTU9CSUxFX0JST1dTRVIpIHtcbiAgICAgICAgICAgIGlmIChvcyA9PT0gY2Muc3lzLk9TX0lPUykge1xuICAgICAgICAgICAgICAgIGRldmljZVR5cGUgPSBcImlPUyBCcm93c2VyXCI7XG4gICAgICAgICAgICB9IGVsc2UgaWYgKG9zID09PSBjYy5zeXMuT1NfQU5EUk9JRCkge1xuICAgICAgICAgICAgICAgIGRldmljZVR5cGUgPSBcIkFuZHJvaWQgQnJvd3NlclwiO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBkZXZpY2VUeXBlID0gXCJNb2JpbGUgQnJvd3NlclwiO1xuICAgICAgICAgICAgfVxuICAgICAgICB9IGVsc2UgaWYgKHBsYXRmb3JtID09PSBjYy5zeXMuREVTS1RPUF9CUk9XU0VSKSB7XG4gICAgICAgICAgICBpZiAob3MgPT09IGNjLnN5cy5PU19XSU5ET1dTKSB7XG4gICAgICAgICAgICAgICAgZGV2aWNlVHlwZSA9IFwiV2luZG93cyBCcm93c2VyXCI7XG4gICAgICAgICAgICB9IGVsc2UgaWYgKG9zID09PSBjYy5zeXMuT1NfT1NYKSB7XG4gICAgICAgICAgICAgICAgZGV2aWNlVHlwZSA9IFwiTWFjIEJyb3dzZXJcIjtcbiAgICAgICAgICAgIH0gZWxzZSBpZiAob3MgPT09IGNjLnN5cy5PU19MSU5VWCkge1xuICAgICAgICAgICAgICAgIGRldmljZVR5cGUgPSBcIkxpbnV4IEJyb3dzZXJcIjtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgZGV2aWNlVHlwZSA9IFwiRGVza3RvcCBCcm93c2VyXCI7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICAvLyDmt7vliqDmtY/op4jlmajkv6Hmga9cbiAgICAgICAgdmFyIGJyb3dzZXJUeXBlID0gY2Muc3lzLmJyb3dzZXJUeXBlO1xuICAgICAgICBpZiAoYnJvd3NlclR5cGUpIHtcbiAgICAgICAgICAgIGRldmljZVR5cGUgKz0gXCIgKFwiICsgYnJvd3NlclR5cGUgKyBcIilcIjtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiBkZXZpY2VUeXBlO1xuICAgIH0sXG5cbiAgICAvLyDnlJ/miJBVVUlEXG4gICAgX2dlbmVyYXRlVVVJRDogZnVuY3Rpb24oKSB7XG4gICAgICAgIHZhciBkID0gbmV3IERhdGUoKS5nZXRUaW1lKCk7XG4gICAgICAgIHZhciB1dWlkID0gJ3h4eHh4eHh4LXh4eHgtNHh4eC15eHh4LXh4eHh4eHh4eHh4eCcucmVwbGFjZSgvW3h5XS9nLCBmdW5jdGlvbihjKSB7XG4gICAgICAgICAgICB2YXIgciA9IChkICsgTWF0aC5yYW5kb20oKSAqIDE2KSAlIDE2IHwgMDtcbiAgICAgICAgICAgIGQgPSBNYXRoLmZsb29yKGQgLyAxNik7XG4gICAgICAgICAgICByZXR1cm4gKGMgPT09ICd4JyA/IHIgOiAociAmIDB4MyB8IDB4OCkpLnRvU3RyaW5nKDE2KTtcbiAgICAgICAgfSk7XG4gICAgICAgIHJldHVybiB1dWlkO1xuICAgIH1cbn0pO1xuIl19