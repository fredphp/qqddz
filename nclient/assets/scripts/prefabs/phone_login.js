// 手机号登录弹窗控制器
// 用于处理手机号验证码登录功能

cc.Class({
    name: 'phone_login',
    extends: cc.Component,

    properties: {
        // 输入框
        phone_input: {
            type: cc.EditBox,
            default: null
        },
        code_input: {
            type: cc.EditBox,
            default: null
        },
        
        // 按钮
        send_code_btn: {
            type: cc.Button,
            default: null
        },
        login_btn: {
            type: cc.Button,
            default: null
        },
        close_btn: {
            type: cc.Button,
            default: null
        },
        wx_login_btn: {
            type: cc.Button,
            default: null
        },
        
        // 标签
        send_code_label: {
            type: cc.Label,
            default: null
        },
        message_label: {
            type: cc.Label,
            default: null
        },
        
        // 倒计时时间
        countdown_time: 60
    },

    onLoad: function() {
        console.log("PhoneLogin onLoad");
        
        this._countdown = 0;
        this._phone = "";
        this._code = "";
        
        this._initButtons();
        this._hideMessage();
    },

    _initButtons: function() {
        var self = this;
        
        // 关闭按钮
        if (this.close_btn) {
            this.close_btn.node.on(cc.Node.EventType.TOUCH_END, function() {
                self._onCloseClick();
            }, this);
        }
        
        // 发送验证码按钮
        if (this.send_code_btn) {
            this.send_code_btn.node.on(cc.Node.EventType.TOUCH_END, function() {
                self._onSendCodeClick();
            }, this);
        }
        
        // 登录按钮
        if (this.login_btn) {
            this.login_btn.node.on(cc.Node.EventType.TOUCH_END, function() {
                self._onLoginClick();
            }, this);
        }
        
        // 微信登录按钮
        if (this.wx_login_btn) {
            this.wx_login_btn.node.on(cc.Node.EventType.TOUCH_END, function() {
                self._onWxLoginClick();
            }, this);
        }
    },

    // 手机号输入变化
    onPhoneInputChanged: function(editbox, customEventData) {
        this._phone = editbox.string;
    },

    // 验证码输入变化
    onCodeInputChanged: function(editbox, customEventData) {
        this._code = editbox.string;
    },

    // 发送验证码
    _onSendCodeClick: function() {
        if (this._countdown > 0) {
            return;
        }
        
        // 验证手机号
        if (!this._validatePhone(this._phone)) {
            this._showMessage("请输入正确的手机号", true);
            return;
        }
        
        var self = this;
        
        // 调用发送验证码接口
        this._sendCodeRequest(this._phone, function(success, message) {
            if (success) {
                self._startCountdown();
                self._showMessage("验证码已发送", false);
            } else {
                self._showMessage(message || "发送失败，请重试", true);
            }
        });
    },

    // 登录
    _onLoginClick: function() {
        // 验证输入
        if (!this._validatePhone(this._phone)) {
            this._showMessage("请输入正确的手机号", true);
            return;
        }
        
        if (!this._validateCode(this._code)) {
            this._showMessage("请输入验证码", true);
            return;
        }
        
        var self = this;
        this._showMessage("正在登录...", false);
        this._setInteractable(false);
        
        // 调用登录接口
        this._phoneLoginRequest(this._phone, this._code, function(success, message, data) {
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
                }
                
                // 跳转到大厅场景
                self.scheduleOnce(function() {
                    self._onCloseClick();
                    cc.director.loadScene("hallScene");
                }, 0.5);
            } else {
                self._showMessage(message || "登录失败，请重试", true);
            }
        });
    },

    // 微信登录
    _onWxLoginClick: function() {
        this._onCloseClick();
        
        // 触发微信登录
        if (window.myglobal && window.myglobal.socket) {
            // 通过事件通知 loginScene 执行微信登录
            this.node.emit("wx-login-request");
        }
    },

    // 关闭弹窗
    _onCloseClick: function() {
        this.node.destroy();
    },

    // 验证手机号
    _validatePhone: function(phone) {
        if (!phone || phone.length !== 11) {
            return false;
        }
        // 简单验证：以1开头的11位数字
        var reg = /^1[3-9]\d{9}$/;
        return reg.test(phone);
    },

    // 验证验证码
    _validateCode: function(code) {
        return code && code.length >= 4 && code.length <= 6;
    },

    // 开始倒计时
    _startCountdown: function() {
        this._countdown = this.countdown_time;
        this._updateCountdownLabel();
        
        this.schedule(this._countdownTick, 1);
    },

    // 倒计时每秒回调
    _countdownTick: function() {
        this._countdown--;
        
        if (this._countdown <= 0) {
            this.unschedule(this._countdownTick);
            this._resetSendCodeBtn();
        } else {
            this._updateCountdownLabel();
        }
    },

    // 更新倒计时标签
    _updateCountdownLabel: function() {
        if (this.send_code_label) {
            this.send_code_label.string = this._countdown + "秒后重试";
        }
        
        if (this.send_code_btn) {
            this.send_code_btn.interactable = false;
        }
    },

    // 重置发送验证码按钮
    _resetSendCodeBtn: function() {
        if (this.send_code_label) {
            this.send_code_label.string = "发送验证码";
        }
        
        if (this.send_code_btn) {
            this.send_code_btn.interactable = true;
        }
    },

    // 显示消息
    _showMessage: function(message, isError) {
        if (this.message_label) {
            this.message_label.node.active = true;
            this.message_label.string = message;
            
            if (isError) {
                this.message_label.node.color = cc.Color.RED;
            } else {
                this.message_label.node.color = cc.Color.WHITE;
            }
        }
    },

    // 隐藏消息
    _hideMessage: function() {
        if (this.message_label) {
            this.message_label.node.active = false;
        }
    },

    // 设置按钮交互状态
    _setInteractable: function(interactable) {
        if (this.login_btn) {
            this.login_btn.interactable = interactable;
        }
        
        if (this.send_code_btn && this._countdown <= 0) {
            this.send_code_btn.interactable = interactable;
        }
    },

    // 发送验证码请求
    _sendCodeRequest: function(phone, callback) {
        // 模拟发送验证码（实际项目中应该调用后端API）
        console.log("发送验证码到手机:", phone);
        
        // 使用 HTTP API 发送请求
        if (typeof http_api !== 'undefined' && http_api.sendVerificationCode) {
            http_api.sendVerificationCode(phone, function(err, result) {
                if (err) {
                    callback(false, "发送失败");
                } else {
                    callback(true, "发送成功");
                }
            });
        } else {
            // 模拟发送成功（开发环境）
            console.log("模拟发送验证码成功");
            callback(true, "发送成功");
        }
    },

    // 手机号登录请求
    _phoneLoginRequest: function(phone, code, callback) {
        console.log("手机号登录:", phone, code);
        
        var myglobal = window.myglobal;
        if (!myglobal || !myglobal.socket) {
            callback(false, "网络未连接", null);
            return;
        }
        
        // 如果有手机号登录接口
        if (myglobal.socket.request_phoneLogin) {
            myglobal.socket.request_phoneLogin({
                phone: phone,
                code: code
            }, function(err, result) {
                if (err !== 0) {
                    callback(false, "登录失败", null);
                } else {
                    callback(true, "登录成功", result);
                }
            });
        } else {
            // 模拟登录成功（开发环境）
            console.log("模拟手机号登录成功");
            callback(true, "登录成功", {
                uniqueID: "phone_" + phone,
                accountID: "phone_" + phone,
                nickName: "玩家" + phone.substr(-4),
                avatarUrl: "",
                goldcount: 1000
            });
        }
    }
});
