// 手机号登录弹窗控制器
// 用于处理手机号验证码登录功能
// 设计风格：中国风商业棋牌（500x560弹窗）

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

        // 微信登录按钮
        wx_login_btn: {
            type: cc.Sprite,
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
        this._countdown = 0;
        this._phone = "";
        this._code = "";

        // 初始化弹窗尺寸适配（手机端缩放，不改宽高）
        this._initPanelScale();

        // 初始化弹窗动画
        this._initPanelAnimation();
        
        // 绘制圆角输入框边框
        this._drawInputBorders();
        
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

    // 初始化弹窗尺寸适配（缩放适配，不改宽高）
    _initPanelScale: function() {
        var contentPanel = this.node.getChildByName('content_panel');
        if (!contentPanel) return;

        var winSize = cc.winSize;
        var screenHeight = winSize.height;
        var screenWidth = winSize.width;

        // 根据屏幕高度计算缩放比例
        // 目标：弹窗在屏幕上看起来居中，不撑满
        var baseHeight = 720; // 设计基准高度
        var targetScale = 1;

        // 小屏幕手机（高度小于700）缩放到0.88
        if (screenHeight < 700) {
            targetScale = 0.88;
        } else if (screenHeight < 800) {
            // 中等屏幕适度缩放
            targetScale = 0.92;
        }

        // 宽度适配：如果屏幕宽度太小，也需要缩放
        var minRequiredWidth = 420; // 弹窗最小需要宽度
        if (screenWidth < minRequiredWidth * 1.1) {
            var widthScale = screenWidth / (minRequiredWidth * 1.2);
            targetScale = Math.min(targetScale, widthScale);
        }

        contentPanel.scale = targetScale;
        console.log('【登录弹窗】屏幕尺寸:', screenWidth, 'x', screenHeight, '缩放比例:', targetScale);
    },

    // 初始化弹窗进入动画
    _initPanelAnimation: function() {
        var contentPanel = this.node.getChildByName('content_panel');
        if (contentPanel) {
            // 保存目标缩放值（已由_initPanelScale设置）
            var targetScale = contentPanel.scale;
            
            // 从小尺寸开始动画
            contentPanel.scale = targetScale * 0.7;
            contentPanel.opacity = 0;
            
            cc.tween(contentPanel)
                .to(0.25, { scale: targetScale, opacity: 255 }, { easing: 'backOut' })
                .start();
        }
    },

    // 绘制输入框圆角边框
    _drawInputBorders: function() {
        var contentPanel = this.node.getChildByName('content_panel');
        if (!contentPanel) return;

        // 绘制手机号输入框边框
        var phoneBg = contentPanel.getChildByName('phone_bg');
        if (phoneBg) {
            var graphics = phoneBg.getComponent(cc.Graphics);
            if (graphics) {
                graphics.clear();
                graphics.strokeColor = new cc.Color(218, 165, 32, 255);
                graphics.lineWidth = 2;
                this._drawRoundRect(graphics, -200, -28, 400, 56, 18);
                graphics.stroke();
            }
        }

        // 绘制验证码输入框边框
        var codeRow = contentPanel.getChildByName('code_row');
        if (codeRow) {
            var codeBg = codeRow.getChildByName('code_bg');
            if (codeBg) {
                var graphics = codeBg.getComponent(cc.Graphics);
                if (graphics) {
                    graphics.clear();
                    graphics.strokeColor = new cc.Color(218, 165, 32, 255);
                    graphics.lineWidth = 2;
                    this._drawRoundRect(graphics, -120, -28, 240, 56, 18);
                    graphics.stroke();
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
                graphics.moveTo(-190, 0);
                graphics.lineTo(190, 0);
                graphics.stroke();
            }
        }
    },

    // 绘制圆角矩形
    _drawRoundRect: function(graphics, x, y, w, h, r) {
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
    _initWechatButton: function() {
        var contentPanel = this.node.getChildByName('content_panel');
        if (!contentPanel) return;

        var wxContainer = contentPanel.getChildByName('wx_login_container');
        if (wxContainer) {
            var wxBtn = wxContainer.getChildByName('wx_login_btn');
            if (wxBtn) {
                // 添加按钮点击效果
                wxBtn.on(cc.Node.EventType.TOUCH_START, function() {
                    wxBtn.scale = 0.95;
                }, this);
                
                wxBtn.on(cc.Node.EventType.TOUCH_END, function() {
                    wxBtn.scale = 1;
                    this._onWechatLoginClick();
                }, this);
                
                wxBtn.on(cc.Node.EventType.TOUCH_CANCEL, function() {
                    wxBtn.scale = 1;
                }, this);

                // 添加"微信登录"文字标签
                this._createWechatLabel(wxContainer);
            }
        }
    },

    // 创建微信登录文字标签
    _createWechatLabel: function(container) {
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
    },

    // 微信登录点击
    _onWechatLoginClick: function() {
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
                    window.myglobal.playerData.token = data.token || "";
                    // 保存到本地存储
                    window.myglobal.playerData.saveToLocal();
                    console.log("【手机登录】用户数据已保存, nickName =", window.myglobal.playerData.nickName);
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
            this.send_code_label.string = "获取验证码";
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
        } else {
            console.log(isError ? '[错误]' : '[信息]', message);
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

    // 发送验证码请求 - 使用HttpAPI支持加密解密
    _sendCodeRequest: function(phone, callback) {

        var defines = window.defines;
        if (!defines || !defines.apiUrl) {
            callback(true, "发送成功");
            return;
        }

        var url = defines.apiUrl + '/api/v1/auth/send-code';
        var cryptoKey = defines.cryptoKey || "";

        // 使用HttpAPI.post发送请求（支持加密解密）
        if (window.HttpAPI) {
            window.HttpAPI.post(url, { phone: phone }, cryptoKey, function(err, result) {
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

            xhr.onreadystatechange = function() {
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

            xhr.ontimeout = function() {
                callback(false, "请求超时");
            };

            xhr.onerror = function() {
                callback(false, "网络错误");
            };

            xhr.send(JSON.stringify({ phone: phone }));
        }
    },

    // 手机号登录请求 - 使用HttpAPI支持加密解密
    _phoneLoginRequest: function(phone, code, callback) {

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
            window.HttpAPI.post(url, requestData, cryptoKey, function(err, result) {
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

            xhr.onreadystatechange = function() {
                if (xhr.readyState === 4) {
                    if (xhr.status >= 200 && xhr.status < 300) {
                        try {
                            var response = JSON.parse(xhr.responseText);
                            
                            if (response.data && response.timestamp && typeof response.data === 'string') {
                                // 加密响应，需要解密
                                if (window.HttpAPI && window.HttpAPI.decryptAESGCM) {
                                    window.HttpAPI.decryptAESGCM(response.data, cryptoKey).then(function(decrypted) {
                                        if (decrypted && decrypted.code === 0 && decrypted.data) {
                                            callback(true, "登录成功", decrypted.data);
                                        } else {
                                            callback(false, decrypted ? decrypted.message : "登录失败", null);
                                        }
                                    }).catch(function(decryptErr) {
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

            xhr.ontimeout = function() {
                callback(false, "请求超时", null);
            };

            xhr.onerror = function() {
                callback(false, "网络错误", null);
            };

            xhr.send(JSON.stringify(requestData));
        }
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
        }

        // 如果不存在，生成新的设备ID
        if (!deviceId) {
            deviceId = this._generateUUID();
            try {
                cc.sys.localStorage.setItem(DEVICE_ID_KEY, deviceId);
            } catch (e) {
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
