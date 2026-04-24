// 登录场景控制器
// 使用点击事件实现复选框功能（不依赖 Toggle 组件）

cc.Class({
    name: 'loginScene',
    extends: cc.Component,

    properties: {
        wait_node: {
            type: cc.Node,
            default: null
        },
        user_agreement_prefabs: {
            type: cc.Prefab,
            default: null
        },
        phone_login_prefab: {
            type: cc.Prefab,
            default: null
        }
    },

    onLoad () {
        console.log("loginScene onLoad 开始");

        this._isAgreementChecked = false;
        this._initWaitNode();
        
        // 初始化复选框（使用点击事件）
        this._initCheckbox();
        
        // 初始化登录按钮
        this._initLoginButtons();
        
        // 初始化用户协议链接点击事件
        this._initUserAgreementLink();

        if (typeof window.myglobal === 'undefined') {
            console.error("myglobal 未定义，尝试等待...");
            this._waitForMyglobal();
            return;
        }

        this._initAndStart();
    },

    _initWaitNode: function() {
        if (this.wait_node) {
            this._loadingImage = this.wait_node.getChildByName("loading_image");
            var lblNode = this.wait_node.getChildByName("lblcontent_Label");
            if (lblNode) {
                this._waitLabel = lblNode.getComponent(cc.Label);
            }
            this.wait_node.active = false;
        }
    },

    _initCheckbox: function() {
        console.log("=== 初始化复选框 ===");
        
        var self = this;
        
        var checkMarkNode = this.node.getChildByName("check_mark");
        if (!checkMarkNode) {
            console.error("check_mark 节点未找到");
            return;
        }
        
        this._checkMarkNode = checkMarkNode;
        
        var checkmark = checkMarkNode.getChildByName("checkmark");
        if (checkmark) {
            this._checkmarkIcon = checkmark;
            checkmark.active = false;
        }
        
        this._isAgreementChecked = false;
        
        var button = checkMarkNode.getComponent(cc.Button);
        if (button) {
            button.enabled = false;
        }
        
        checkMarkNode.off(cc.Node.EventType.TOUCH_END);
        checkMarkNode.on(cc.Node.EventType.TOUCH_END, function(event) {
            self._toggleCheckbox();
        }, self);
    },

    _toggleCheckbox: function() {
        this._isAgreementChecked = !this._isAgreementChecked;
        if (this._checkmarkIcon) {
            this._checkmarkIcon.active = this._isAgreementChecked;
        }
    },

    start () {
        console.log("loginScene start");
    },

    _initLoginButtons: function() {
        var self = this;

        var wxLoginNode = this.node.getChildByName("login_wx");
        if (wxLoginNode) {
            var button = wxLoginNode.getComponent(cc.Button);
            if (button) {
                button.interactable = true;
                button.clickEvents = [];

                var handler = new cc.Component.EventHandler();
                handler.target = this.node;
                handler.component = "loginScene";
                handler.handler = "_onWxLoginClick";
                handler.customEventData = "";
                button.clickEvents.push(handler);
            }
        }

        var phoneLoginNode = this.node.getChildByName("login_phone");
        if (phoneLoginNode) {
            var button = phoneLoginNode.getComponent(cc.Button);
            if (button) {
                button.interactable = true;
                button.clickEvents = [];

                var handler = new cc.Component.EventHandler();
                handler.target = this.node;
                handler.component = "loginScene";
                handler.handler = "_onPhoneLoginClick";
                handler.customEventData = "";
                button.clickEvents.push(handler);
            }
        }
    },

    _initUserAgreementLink: function() {
        var self = this;
        
        var linkNode = this.node.getChildByName("user_agreement_link");
        if (linkNode) {
            linkNode.active = true;

            var button = linkNode.getComponent(cc.Button);
            if (button) {
                button.interactable = true;
                button.clickEvents = [];

                var handler = new cc.Component.EventHandler();
                handler.target = this.node;
                handler.component = "loginScene";
                handler.handler = "_onUserAgreementLinkClick";
                handler.customEventData = "";
                button.clickEvents.push(handler);
            }
        }
    },

    _onWxLoginClick: function() {
        this._doWxLogin();
    },

    _onPhoneLoginClick: function() {
        this._doPhoneLogin();
    },

    _onUserAgreementLinkClick: function() {
        this._showUserAgreementPopup();
    },

    _checkAgreement: function() {
        return this._isAgreementChecked;
    },

    _waitForMyglobal: function() {
        var self = this;
        var attempts = 0;

        var check = function() {
            attempts++;
            if (typeof window.myglobal !== 'undefined') {
                self._initAndStart();
            } else if (attempts < 20) {
                setTimeout(check, 100);
            } else {
                self._showError("加载失败，请刷新页面重试");
            }
        };
        setTimeout(check, 100);
    },

    _initAndStart: function() {
        var myglobal = window.myglobal;

        if (!myglobal.socket && !myglobal.init()) {
            this._showError("初始化失败，请刷新页面重试");
            return;
        }

        if (window.isopen_sound) {
            cc.resources.load("sound/login_bg", cc.AudioClip, function(err, clip) {
                if (!err) {
                    try { cc.audioEngine.playMusic(clip, true); } catch(e) {}
                }
            });
        }

        if (myglobal.socket && myglobal.socket.initSocket) {
            myglobal.socket.initSocket();
        }
    },

    _showError: function(message) {
        this._showWaitNode(message);
        this.scheduleOnce(function() {
            this._hideWaitNode();
        }, 2);
    },

    _showLoading: function(show, message) {
        if (show) {
            this._showWaitNode(message || "正在处理...");
        } else {
            this._hideWaitNode();
        }
    },

    _showWaitNode: function(message) {
        if (this.wait_node) {
            this.wait_node.active = true;
            if (this._waitLabel) {
                this._waitLabel.string = message || "正在处理...";
            }
            if (this._loadingImage) {
                this._isAnimating = true;
            }
        }
    },

    _hideWaitNode: function() {
        if (this.wait_node) {
            this.wait_node.active = false;
            this._isAnimating = false;
        }
    },

    update: function(dt) {
        if (this._isAnimating && this._loadingImage) {
            this._loadingImage.rotation -= dt * 45;
        }
    },

    _doWxLogin: function() {
        var self = this;

        if (!this._checkAgreement()) {
            this._showError("请先同意用户协议");
            return;
        }

        var myglobal = window.myglobal;
        if (!myglobal || !myglobal.socket) {
            this._showError("网络未连接，请稍后重试");
            return;
        }

        this._showLoading(true, "正在登录...");

        myglobal.socket.request_wxLogin({
            uniqueID: myglobal.playerData.uniqueID,
            accountID: myglobal.playerData.accountID,
            nickName: myglobal.playerData.nickName,
            avatarUrl: myglobal.playerData.avatarUrl,
        }, function(err, result) {
            self._showLoading(false);

            if (err != 0) {
                self._showError("登录失败，请重试");
                return;
            }

            myglobal.playerData.gobal_count = result.goldcount || 0;
            cc.director.loadScene("hallScene");
        });
    },

    _doPhoneLogin: function() {
        if (!this._checkAgreement()) {
            this._showError("请先同意用户协议");
            return;
        }
        this._showPhoneLoginPopup();
    },

    _showPhoneLoginPopup: function() {
        var self = this;
        
        if (this.phone_login_prefab) {
            this._createPhoneLoginPopup(this.phone_login_prefab);
        } else {
            cc.resources.load("prefabs/phone_login", cc.Prefab, function(err, prefab) {
                if (err) {
                    self._showError("无法显示登录弹窗");
                    return;
                }
                self._createPhoneLoginPopup(prefab);
            });
        }
    },

    _createPhoneLoginPopup: function(prefab) {
        try {
            var popup = cc.instantiate(prefab);
            popup.parent = this.node;
            
            popup.on("wx-login-request", function() {
                this._doWxLogin();
            }, this);
            
            this._phoneLoginPopup = popup;
        } catch (e) {
            this._showError("无法显示登录弹窗");
        }
    },

    _showUserAgreementPopup: function() {
        console.log("=== 显示用户协议弹窗 ===");
        this._createAgreementPopup();
    },

    // 创建用户协议弹窗
    _createAgreementPopup: function() {
        var self = this;
        
        // ==================== 弹窗根节点 ====================
        var popup = new cc.Node("user_agreement_popup");
        popup.parent = this.node;
        popup.setContentSize(cc.size(1280, 720));
        popup.setPosition(0, 0);
        popup.zIndex = 1000;
        
        // ==================== 半透明黑色背景遮罩 ====================
        // ★ 不添加任何触摸事件，让它穿透
        var bgMask = new cc.Node("bg_mask");
        bgMask.parent = popup;
        bgMask.setContentSize(cc.size(1280, 720));
        bgMask.setPosition(0, 0);
        var bgMaskSprite = bgMask.addComponent(cc.Sprite);
        bgMaskSprite.sizeMode = cc.Sprite.SizeMode.CUSTOM;
        bgMask.color = new cc.Color(0, 0, 0);
        bgMask.opacity = 180;
        
        // ==================== 主面板（带背景图）====================
        var panel = new cc.Node("content_panel");
        panel.parent = popup;
        panel.setContentSize(cc.size(900, 520));
        panel.setPosition(0, 0);
        var panelSprite = panel.addComponent(cc.Sprite);
        panelSprite.sizeMode = cc.Sprite.SizeMode.CUSTOM;
        panel.color = new cc.Color(255, 250, 240);
        
        // ★ 加载背景图片
        cc.resources.load("images/user_agreement_bg", cc.SpriteFrame, function(err, spriteFrame) {
            if (!err && spriteFrame) {
                panelSprite.spriteFrame = spriteFrame;
            }
        });

        // ==================== 标题（黑色文字）====================
        var titleNode = new cc.Node("title_label");
        titleNode.parent = panel;
        titleNode.setContentSize(cc.size(300, 60));
        titleNode.setPosition(0, 230);
        var titleLabel = titleNode.addComponent(cc.Label);
        titleLabel.string = "用户协议";
        titleLabel.fontSize = 36;
        titleLabel.lineHeight = 60;
        titleLabel.horizontalAlign = cc.Label.HorizontalAlign.CENTER;
        titleNode.color = new cc.Color(30, 30, 30);

        // ==================== 右上角关闭按钮 ====================
        var closeBtn = new cc.Node("close_btn");
        closeBtn.parent = panel;
        closeBtn.setContentSize(cc.size(60, 60));
        closeBtn.setPosition(400, 230);
        
        // 关闭按钮背景
        var closeBtnBg = new cc.Node("bg");
        closeBtnBg.parent = closeBtn;
        closeBtnBg.setContentSize(cc.size(50, 50));
        closeBtnBg.setPosition(0, 0);
        var closeBgSprite = closeBtnBg.addComponent(cc.Sprite);
        closeBgSprite.sizeMode = cc.Sprite.SizeMode.CUSTOM;
        closeBtnBg.color = new cc.Color(255, 255, 255);
        
        // 关闭按钮 X
        var closeLabelNode = new cc.Node("x");
        closeLabelNode.parent = closeBtn;
        closeLabelNode.setPosition(0, 0);
        var closeLabel = closeLabelNode.addComponent(cc.Label);
        closeLabel.string = "×";
        closeLabel.fontSize = 40;
        closeLabel.lineHeight = 50;
        closeLabel.horizontalAlign = cc.Label.HorizontalAlign.CENTER;
        closeLabelNode.color = new cc.Color(80, 80, 80);
        
        // ★ 使用 Button 组件 + EventHandler 方式绑定点击事件
        var closeBtnComp = closeBtn.addComponent(cc.Button);
        closeBtnComp.transition = cc.Button.Transition.SCALE;
        closeBtnComp.zoomScale = 1.2;
        closeBtnComp.interactable = true;
        
        // ★ 使用 cc.Component.EventHandler 绑定事件
        var closeHandler = new cc.Component.EventHandler();
        closeHandler.target = this.node;
        closeHandler.component = "loginScene";
        closeHandler.handler = "_closeUserAgreementPopup";
        closeHandler.customEventData = "";
        closeBtnComp.clickEvents.push(closeHandler);

        // ==================== 分隔线 ====================
        var dividerLine = new cc.Node("divider");
        dividerLine.parent = panel;
        dividerLine.setContentSize(cc.size(850, 1));
        dividerLine.setPosition(0, 195);
        var dividerSprite = dividerLine.addComponent(cc.Sprite);
        dividerSprite.sizeMode = cc.Sprite.SizeMode.CUSTOM;
        dividerLine.color = new cc.Color(220, 220, 220);

        // ==================== 内容滚动区域 ====================
        // ★ 使用 RichText 代替 Label，避免纹理过大问题

        // 1. 创建 ScrollView 节点
        var scrollNode = new cc.Node("scroll_view");
        scrollNode.parent = panel;
        scrollNode.setContentSize(cc.size(850, 400));
        scrollNode.setPosition(0, -30);
        
        // 2. 创建 view 节点（ScrollView 的视口）
        var viewNode = new cc.Node("view");
        viewNode.parent = scrollNode;
        viewNode.setContentSize(cc.size(850, 400));
        viewNode.setPosition(0, 0);
        
        // 3. 添加 Mask 组件到 view（裁剪超出视口的内容）
        var mask = viewNode.addComponent(cc.Mask);
        mask.type = cc.Mask.Type.RECT;
        
        // 4. 创建 content 节点（ScrollView 的内容容器）
        var contentNode = new cc.Node("content");
        contentNode.parent = viewNode;
        // ★ content 锚点在左上角
        contentNode.anchorX = 0;
        contentNode.anchorY = 1;
        // ★ content 位置：view 的左上角
        contentNode.setPosition(-425, 200);
        // ★ 初始高度
        contentNode.setContentSize(cc.size(850, 600));
        
        // 5. 创建 RichText 节点（不会有纹理大小限制）
        var richTextNode = new cc.Node("rich_text");
        richTextNode.parent = contentNode;
        richTextNode.anchorX = 0;
        richTextNode.anchorY = 1;
        // ★ 增加左右两边的缩进，减少上边距
        richTextNode.setPosition(40, -10);
        // ★ 减小宽度以适应更大的边距
        richTextNode.setContentSize(cc.size(770, 500));
        
        var richText = richTextNode.addComponent(cc.RichText);
        richText.fontSize = 20;
        richText.lineHeight = 32;
        // ★ 相应减小maxWidth
        richText.maxWidth = 770;
        richText.handleTouchEvent = false;
        richTextNode.color = new cc.Color(50, 50, 50);
        
        // 初始显示加载提示
        richText.string = "<color=#333333>正在加载用户协议...</color>";
        
        // 6. 添加 ScrollView 组件
        var scrollView = scrollNode.addComponent(cc.ScrollView);
        scrollView.content = contentNode;
        scrollView.horizontal = false;
        scrollView.vertical = true;
        scrollView.inertia = true;
        scrollView.elastic = true;
        scrollView.brake = 0.5;
        
        // 7. 添加鼠标滚轮支持
        scrollNode.on(cc.Node.EventType.MOUSE_WHEEL, function(event) {
            var scrollY = event.getScrollY();
            var currentOffset = scrollView.getScrollOffset();
            var maxOffset = scrollView.getMaxScrollOffset();
            var newOffsetY = Math.max(0, Math.min(currentOffset.y + scrollY * 0.5, maxOffset.y));
            scrollView.scrollToOffset(cc.v2(currentOffset.x, newOffsetY), 0.1);
        }, self);
        
        // 保存引用
        this._agreementRichText = richText;
        this._agreementContentLabel = null;  // 不再使用 Label
        this._scrollView = scrollView;
        this._contentNode = contentNode;
        this._scrollNode = scrollNode;
        this._userAgreementPopup = popup;
        
        // 获取协议内容
        this._fetchAgreementContent();
        
        console.log("=== 弹窗创建完成 ===");
    },

    // ★ 关闭用户协议弹窗（公开方法，供 Button EventHandler 调用）
    _closeUserAgreementPopup: function() {
        console.log("=== _closeUserAgreementPopup 被调用 ===");
        
        if (this._userAgreementPopup) {
            // ★ 移除滚轮事件监听
            if (this._scrollNode) {
                this._scrollNode.off(cc.Node.EventType.MOUSE_WHEEL);
            }
            
            this._userAgreementPopup.destroy();
            this._userAgreementPopup = null;
            this._agreementRichText = null;
            this._agreementContentLabel = null;
            this._scrollView = null;
            this._contentNode = null;
            this._scrollNode = null;
            console.log("=== 弹窗已关闭 ===");
        }
    },

    // 从 API 获取协议内容
    _fetchAgreementContent: function() {
        var self = this;
        var defines = window.defines;
        var HttpAPI = window.HttpAPI;
        
        // 优先使用 HttpAPI（支持解密）
        if (defines && defines.apiUrl && HttpAPI) {
            HttpAPI.getUserAgreement(
                defines.apiUrl,
                defines.cryptoKey || '',
                function(err, data) {
                    if (err || !data || !data.content) {
                        console.log("API获取失败，使用默认内容:", err);
                        self._showDefaultAgreementContent();
                    } else {
                        self._updateAgreementContent(data.content);
                    }
                }
            );
        } else {
            // 直接请求 API
            if (!defines || !defines.apiUrl) {
                self._showDefaultAgreementContent();
                return;
            }
            
            var apiUrl = defines.apiUrl + '/api/v1/user-agreement/latest';
            
            var xhr = new XMLHttpRequest();
            xhr.open('GET', apiUrl, true);
            xhr.timeout = 10000;
            
            xhr.onload = function() {
                if (xhr.status >= 200 && xhr.status < 300) {
                    try {
                        var response = JSON.parse(xhr.responseText);
                        if (response && response.code === 0 && response.data && response.data.content) {
                            self._updateAgreementContent(response.data.content);
                        } else {
                            self._showDefaultAgreementContent();
                        }
                    } catch (e) {
                        self._showDefaultAgreementContent();
                    }
                } else {
                    self._showDefaultAgreementContent();
                }
            };
            
            xhr.onerror = function() {
                self._showDefaultAgreementContent();
            };
            
            xhr.ontimeout = function() {
                self._showDefaultAgreementContent();
            };
            
            xhr.send();
        }
    },

    // 更新协议内容
    _updateAgreementContent: function(content) {
        // 优先使用 RichText
        if (this._agreementRichText) {
            console.log("设置协议内容(RichText)，长度:", content ? content.length : 0);
            // 将普通文本转换为 RichText 格式
            var formattedContent = this._formatTextForRichText(content);
            this._agreementRichText.string = formattedContent;
            
            // 延迟更新 content 高度
            var self = this;
            this.scheduleOnce(function() {
                self._updateContentSize();
            }, 0.1);
            return;
        }
        
        // 兼容旧的 Label 方式
        if (!this._agreementContentLabel) {
            console.log("_updateAgreementContent: 组件不存在");
            return;
        }

        if (content) {
            console.log("设置协议内容，长度:", content.length);
            this._agreementContentLabel.string = content;
            
            // 延迟更新尺寸
            var self = this;
            this.scheduleOnce(function() {
                self._updateContentSize();
            }, 0.05);
        }
    },
    
    // 将文本转换为 RichText 支持的格式
    _formatTextForRichText: function(text) {
        if (!text) return "<color=#333333>暂无内容</color>";
        
        // 检测是否包含HTML标签（更全面的检测）
        var hasHtml = /<[a-zA-Z][^>]*>/.test(text);
        
        if (hasHtml) {
            console.log("检测到HTML格式内容，转换为RichText格式");
            return this._convertHtmlToRichText(text);
        }
        
        // 纯文本格式
        text = text.replace(/</g, '&lt;').replace(/>/g, '&gt;');
        text = text.replace(/\n/g, '<br/>');
        text = text.replace(/【([^】]+)】/g, '<b><color=#2d7a4e>【$1】</color></b>');
        return "<color=#333333>" + text + "</color>";
    },
    
    // 将HTML转换为RichText支持的格式
    _convertHtmlToRichText: function(html) {
        console.log("=== 开始转换HTML内容 ===");
        console.log("原内容前200字符:", html.substring(0, 200));
        var result = html;
        
        // 先清理标签内部的换行和多余空白（保留一个空格）
        result = result.replace(/>\s+</g, '><');
        
        // 移除 <!DOCTYPE...> 和 <html> 等外层标签
        result = result.replace(/<!DOCTYPE[^>]*>/gi, '');
        result = result.replace(/<html[^>]*>/gi, '');
        result = result.replace(/<\/html>/gi, '');
        result = result.replace(/<body[^>]*>/gi, '');
        result = result.replace(/<\/body>/gi, '');
        result = result.replace(/<head[\s\S]*?<\/head>/gi, '');
        
        // ★ 关键：先处理<br>标签，转换为特殊标记，避免被后续处理干扰
        result = result.replace(/<br\s*\/?>/gi, '[[BR]]');
        
        // 处理标题标签 - 转换为带颜色和加粗的格式（每个标题独立成行）
        result = result.replace(/<h1[^>]*>([\s\S]*?)<\/h1>/gi, '[[P]]<b><size=26><color=#1a6b3c>$1</color></size></b>[[P]][[P]]');
        result = result.replace(/<h2[^>]*>([\s\S]*?)<\/h2>/gi, '[[P]]<b><size=22><color=#2d7a4e>$1</color></size></b>[[P]][[P]]');
        result = result.replace(/<h3[^>]*>([\s\S]*?)<\/h3>/gi, '[[P]]<b><size=20><color=#2d7a4e>$1</color></size></b>[[P]]');
        result = result.replace(/<h4[^>]*>([\s\S]*?)<\/h4>/gi, '[[P]]<b>$1</b>[[P]]');
        
        // 处理段落标签 - 每个p标签独立成段
        result = result.replace(/<p[^>]*>([\s\S]*?)<\/p>/gi, '$1[[P]][[P]]');
        
        // 处理格式标签
        result = result.replace(/<strong[^>]*>([\s\S]*?)<\/strong>/gi, '<b>$1</b>');
        result = result.replace(/<b[^>]*>([\s\S]*?)<\/b>/gi, '<b>$1</b>');
        result = result.replace(/<i[^>]*>([\s\S]*?)<\/i>/gi, '<i>$1</i>');
        result = result.replace(/<u[^>]*>([\s\S]*?)<\/u>/gi, '<u>$1</u>');
        
        // 处理div和span标签
        result = result.replace(/<div[^>]*>([\s\S]*?)<\/div>/gi, '$1[[P]]');
        result = result.replace(/<span[^>]*>([\s\S]*?)<\/span>/gi, '$1');
        
        // 处理列表
        result = result.replace(/<li[^>]*>([\s\S]*?)<\/li>/gi, '• $1[[P]]');
        result = result.replace(/<[ou]l[^>]*>/gi, '');
        result = result.replace(/<\/[ou]l>/gi, '[[P]]');
        
        // 处理hr标签
        result = result.replace(/<hr\s*\/?>/gi, '[[P]]───────────[[P]]');
        
        // 移除所有其他不支持的HTML标签（但保留内容）
        result = result.replace(/<[a-zA-Z][^>]*>/g, '');
        result = result.replace(/<\/[a-zA-Z][^>]*>/g, '');
        
        // 将特殊标记转换回换行
        result = result.replace(/\[\[BR\]\]/g, '<br/>');
        result = result.replace(/\[\[P\]\]/g, '<br/>');
        
        // 转换普通换行符
        result = result.replace(/\n/g, '<br/>');
        
        // 清理多余的换行（超过2个连续换行变成2个）
        result = result.replace(/(<br\/>){3,}/gi, '<br/><br/>');
        result = result.replace(/^(<br\/>)+/, '');
        result = result.replace(/(<br\/>)+$/, '');
        
        // 解码HTML实体
        result = result.replace(/&nbsp;/g, ' ');
        result = result.replace(/&amp;/g, '&');
        result = result.replace(/&lt;/g, '<');
        result = result.replace(/&gt;/g, '>');
        result = result.replace(/&quot;/g, '"');
        
        // 清理标签内的多余空白
        result = result.replace(/<b>\s+/g, '<b>');
        result = result.replace(/\s+<\/b>/g, '</b>');
        
        console.log("转换后内容前200字符:", result.substring(0, 200));
        console.log("=== HTML转换完成 ===");
        
        // 包装默认颜色
        return "<color=#333333>" + result + "</color>";
    },

    // 更新 ScrollView 的 content 尺寸
    _updateContentSize: function() {
        if (!this._contentNode || !this._scrollView) {
            console.log("_updateContentSize: 组件不存在");
            return;
        }
        
        var viewHeight = 400;  // ScrollView 视口高度
        var contentHeight = 600;  // 默认高度
        
        // 如果有 RichText，获取其高度
        if (this._agreementRichText) {
            var richTextNode = this._agreementRichText.node;
            contentHeight = richTextNode.height + 160;  // 加上 padding（底部留更多空间避免被边框遮挡）
            console.log("RichText节点高度:", richTextNode.height);
        }
        // 如果有 Label，获取其高度
        else if (this._agreementContentLabel) {
            var labelNode = this._agreementContentLabel.node;
            contentHeight = labelNode.height + 80;
            console.log("Label节点高度:", labelNode.height);
        }
        
        // 确保高度大于视口高度，才能滚动
        if (contentHeight < viewHeight) {
            contentHeight = viewHeight + 50;
        }
        
        console.log("设置 Content 高度:", contentHeight);
        
        // 更新 content 尺寸
        this._contentNode.setContentSize(cc.size(850, contentHeight));
        
        // 强制更新 ScrollView
        this._scrollView.content = this._contentNode;
        
        // 滚动到顶部
        this._scrollView.scrollToTop(0);
    },

    // 显示默认协议内容
    _showDefaultAgreementContent: function() {
        var defaultContent = 
            "欢迎使用本游戏！\n\n" +
            "在使用本游戏前，请您仔细阅读并理解本用户协议的全部内容。\n\n" +
            "【服务条款】\n" +
            "本游戏提供的服务仅供个人娱乐使用，不得用于商业目的。\n\n" +
            "【用户行为规范】\n" +
            "用户应遵守相关法律法规，不得利用本游戏进行任何违法活动。\n\n" +
            "【知识产权】\n" +
            "本游戏的所有内容（包括但不限于文字、图片、音频、视频等）均受知识产权法律保护。\n\n" +
            "【免责声明】\n" +
            "本游戏不对因网络原因导致的服务中断承担责任。";

        console.log("显示默认协议内容");
        
        // 优先使用 RichText
        if (this._agreementRichText) {
            var formattedContent = this._formatTextForRichText(defaultContent);
            this._agreementRichText.string = formattedContent;
            
            var self = this;
            this.scheduleOnce(function() {
                self._updateContentSize();
            }, 0.1);
            return;
        }
        
        // 兼容旧的 Label 方式
        if (this._agreementContentLabel) {
            this._agreementContentLabel.string = defaultContent;
            
            var self = this;
            this.scheduleOnce(function() {
                self._updateContentSize();
            }, 0.05);
        }
    }
});
