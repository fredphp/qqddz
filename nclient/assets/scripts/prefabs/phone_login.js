// 手机号登录弹窗控制器
// 用于处理手机号验证码登录功能
// 设计风格：绿色主题 + 米色内容区

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

        // 获取输入框初始值
        if (this.phone_input) {
            this._phone = this.phone_input.string || "";
        }
        if (this.code_input) {
            this._code = this.code_input.string || "";
        }
    },

    _initButtons: function() {
        var self = this;

        // 关闭按钮
        if (this.close_btn) {
            this.close_btn.node.off(cc.Node.EventType.TOUCH_END);
            this.close_btn.node.on(cc.Node.EventType.TOUCH_END, function() {
                self._onCloseClick();
            }, this);
        }

        // 发送验证码按钮
        if (this.send_code_btn) {
            this.send_code_btn.node.off(cc.Node.EventType.TOUCH_END);
            this.send_code_btn.node.on(cc.Node.EventType.TOUCH_END, function() {
                self._onSendCodeClick();
            }, this);
        }

        // 登录按钮
        if (this.login_btn) {
            this.login_btn.node.off(cc.Node.EventType.TOUCH_END);
            this.login_btn.node.on(cc.Node.EventType.TOUCH_END, function() {
                self._onLoginClick();
            }, this);
        }

        // 微信登录按钮
        if (this.wx_login_btn) {
            this.wx_login_btn.node.off(cc.Node.EventType.TOUCH_END);
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
        this._sendCodeRequest(this._phone, function(success, message) {
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
    _onLoginClick: function() {
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
        var self = this;

        this._showMessage("正在唤起微信授权...", false);

        // 检查是否在微信环境
        if (typeof wx !== 'undefined' && wx.login) {
            // 微信小游戏环境
            wx.login({
                success: function(res) {
                    if (res.code) {
                        self._wxLoginRequest(res.code);
                    } else {
                        self._showMessage("微信授权失败", true);
                    }
                },
                fail: function() {
                    self._showMessage("微信授权失败", true);
                }
            });
        } else {
            // 模拟微信登录（开发环境）
            console.log("非微信环境，模拟微信登录");
            self._wxLoginRequest("mock_code_" + Date.now());
        }
    },

    // 关闭弹窗
    _onCloseClick: function() {
        if (this._countdown > 0) {
            this.unschedule(this._countdownTick);
        }
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
        // 保留非空检测，测试阶段不验证格式
        return code && code.length > 0;
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
                this.message_label.node.color = new cc.Color(255, 100, 100);
            } else {
                this.message_label.node.color = new cc.Color(100, 200, 100);
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
        console.log("发送验证码到手机:", phone);

        var defines = window.defines;
        if (!defines || !defines.apiUrl) {
            console.log("API未配置，模拟发送成功");
            callback(true, "发送成功");
            return;
        }

        var xhr = new XMLHttpRequest();
        var url = defines.apiUrl + '/api/v1/auth/send-code';

        xhr.open('POST', url, true);
        xhr.setRequestHeader('Content-Type', 'application/json');
        xhr.timeout = 10000;

        xhr.onreadystatechange = function() {
            if (xhr.readyState === 4) {
                if (xhr.status >= 200 && xhr.status < 300) {
                    try {
                        var response = JSON.parse(xhr.responseText);
                        if (response.code === 0) {
                            console.log("验证码发送成功:", response.data);
                            callback(true, response.data ? response.data.message : "发送成功");
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

        xhr.ontimeout = function() {
            callback(false, "请求超时");
        };

        xhr.onerror = function() {
            callback(false, "网络错误");
        };

        xhr.send(JSON.stringify({ phone: phone }));
    },

    // 手机号登录请求
    _phoneLoginRequest: function(phone, code, callback) {
        console.log("手机号登录:", phone, code);

        var defines = window.defines;
        if (!defines || !defines.apiUrl) {
            console.log("API未配置，模拟登录成功");
            callback(true, "登录成功", {
                uniqueID: "phone_" + phone,
                accountID: "phone_" + phone,
                nickName: "玩家" + phone.substr(-4),
                avatarUrl: "",
                goldcount: 1000
            });
            return;
        }

        var xhr = new XMLHttpRequest();
        var url = defines.apiUrl + '/api/v1/auth/phone-login';

        xhr.open('POST', url, true);
        xhr.setRequestHeader('Content-Type', 'application/json');
        // 添加设备信息头
        xhr.setRequestHeader('X-Device-ID', this._getDeviceID());
        xhr.setRequestHeader('X-Device-Type', this._getDeviceType());
        xhr.timeout = 10000;

        xhr.onreadystatechange = function() {
            if (xhr.readyState === 4) {
                if (xhr.status >= 200 && xhr.status < 300) {
                    try {
                        var response = JSON.parse(xhr.responseText);
                        if (response.code === 0 && response.data) {
                            console.log("登录成功:", response.data);
                            callback(true, "登录成功", response.data);
                        } else {
                            callback(false, response.message || "登录失败", null);
                        }
                    } catch (e) {
                        callback(false, "解析响应失败", null);
                    }
                } else {
                    callback(false, "网络请求失败", null);
                }
            }
        };

        xhr.ontimeout = function() {
            callback(false, "请求超时", null);
        };

        xhr.onerror = function() {
            callback(false, "网络错误", null);
        };

        xhr.send(JSON.stringify({ phone: phone, code: code }));
    },

    // 微信登录请求
    _wxLoginRequest: function(code) {
        var self = this;

        var defines = window.defines;
        if (!defines || !defines.apiUrl) {
            console.log("API未配置，模拟微信登录成功");
            self._onWxLoginSuccess({
                uniqueID: "wx_" + Date.now(),
                accountID: "wx_" + Date.now(),
                nickName: "微信用户",
                avatarUrl: "",
                goldcount: 1000
            });
            return;
        }

        var xhr = new XMLHttpRequest();
        var url = defines.apiUrl + '/api/v1/auth/wx-login';

        xhr.open('POST', url, true);
        xhr.setRequestHeader('Content-Type', 'application/json');
        // 添加设备信息头
        xhr.setRequestHeader('X-Device-ID', this._getDeviceID());
        xhr.setRequestHeader('X-Device-Type', this._getDeviceType());
        xhr.timeout = 10000;

        xhr.onreadystatechange = function() {
            if (xhr.readyState === 4) {
                if (xhr.status >= 200 && xhr.status < 300) {
                    try {
                        var response = JSON.parse(xhr.responseText);
                        if (response.code === 0 && response.data) {
                            console.log("微信登录成功:", response.data);
                            self._onWxLoginSuccess(response.data);
                        } else {
                            self._showMessage(response.message || "微信登录失败", true);
                        }
                    } catch (e) {
                        self._showMessage("解析响应失败", true);
                    }
                } else {
                    self._showMessage("网络请求失败", true);
                }
            }
        };

        xhr.ontimeout = function() {
            self._showMessage("请求超时", true);
        };

        xhr.onerror = function() {
            self._showMessage("网络错误", true);
        };

        xhr.send(JSON.stringify({ code: code }));
    },

    // 微信登录成功处理
    _onWxLoginSuccess: function(data) {
        this._showMessage("登录成功", false);

        // 保存用户数据
        if (window.myglobal && window.myglobal.playerData) {
            window.myglobal.playerData.uniqueID = data.uniqueID || "";
            window.myglobal.playerData.accountID = data.accountID || "";
            window.myglobal.playerData.nickName = data.nickName || "微信用户";
            window.myglobal.playerData.avatarUrl = data.avatarUrl || "";
            window.myglobal.playerData.gobal_count = data.goldcount || 0;
        }

        // 跳转到大厅场景
        var self = this;
        this.scheduleOnce(function() {
            self._onCloseClick();
            cc.director.loadScene("hallScene");
        }, 0.5);
    },

    // =============================================
    // 设备信息获取
    // =============================================

    // 获取设备唯一标识
    _getDeviceID: function() {
        var DEVICE_ID_KEY = "ddz_device_id";
        var deviceId = "";

        // 尝试从本地存储获取
        try {
            deviceId = cc.sys.localStorage.getItem(DEVICE_ID_KEY);
        } catch (e) {
            console.log("获取本地设备ID失败:", e);
        }

        // 如果不存在，生成新的设备ID
        if (!deviceId) {
            deviceId = this._generateUUID();
            try {
                cc.sys.localStorage.setItem(DEVICE_ID_KEY, deviceId);
            } catch (e) {
                console.log("保存设备ID失败:", e);
            }
        }

        return deviceId;
    },

    // 获取设备类型
    _getDeviceType: function() {
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
            // 移动浏览器，根据OS判断
            if (os === cc.sys.OS_IOS) {
                deviceType = "iOS Browser";
            } else if (os === cc.sys.OS_ANDROID) {
                deviceType = "Android Browser";
            } else {
                deviceType = "Mobile Browser";
            }
        } else if (platform === cc.sys.DESKTOP_BROWSER) {
            // 桌面浏览器，根据OS判断
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
    _generateUUID: function() {
        var d = new Date().getTime();
        var uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
            var r = (d + Math.random() * 16) % 16 | 0;
            d = Math.floor(d / 16);
            return (c === 'x' ? r : (r & 0x3 | 0x8)).toString(16);
        });
        return uuid;
    }
});
