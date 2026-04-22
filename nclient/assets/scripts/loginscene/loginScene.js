/**
 * 登录场景控制器
 * 处理用户登录、用户协议等功能
 */

var LoginScene = cc.Class({
    extends: cc.Component,

    properties: {
        // 背景节点
        bgNode: {
            default: null,
            type: cc.Node
        },

        // 账号输入框
        accountInput: {
            default: null,
            type: cc.EditBox
        },

        // 密码输入框
        passwordInput: {
            default: null,
            type: cc.EditBox
        },

        // 登录按钮
        loginBtn: {
            default: null,
            type: cc.Node
        },

        // 游客登录按钮
        guestBtn: {
            default: null,
            type: cc.Node
        },

        // 注册按钮
        registerBtn: {
            default: null,
            type: cc.Node
        },

        // 用户协议复选框节点
        agreementCheckbox: {
            default: null,
            type: cc.Node
        },

        // 用户协议文字节点（只有"用户协议"四个字可点击）
        agreementText: {
            default: null,
            type: cc.Node
        },

        // 用户协议弹窗预制体
        agreementPrefab: {
            default: null,
            type: cc.Prefab
        },

        // 复选框选中状态图标
        checkMark: {
            default: null,
            type: cc.Node
        },

        // 复选框未选中状态图标
        uncheckMark: {
            default: null,
            type: cc.Node
        },

        // 加载节点
        loadingNode: {
            default: null,
            type: cc.Node
        }
    },

    // 是否同意用户协议
    _isAgreed: false,

    // 是否正在登录
    _isLogining: false,

    onLoad: function() {
        cc.log('[LoginScene] onLoad');
        
        // 初始化全局管理器
        if (typeof myglobal !== 'undefined') {
            myglobal.init();
        }

        // 初始化UI
        this.initUI();

        // 绑定事件
        this.bindEvents();

        // 检查是否已接受用户协议
        this.checkAgreementStatus();

        // 加载上次登录的账号
        this.loadLastAccount();
    },

    start: function() {
        cc.log('[LoginScene] start');
        
        // 播放背景音乐
        this.playBgMusic();
    },

    onDestroy: function() {
        cc.log('[LoginScene] onDestroy');
        
        // 停止背景音乐
        if (typeof cc.audioEngine !== 'undefined') {
            cc.audioEngine.stopMusic();
        }
    },

    /**
     * 初始化UI
     */
    initUI: function() {
        // 隐藏加载节点
        if (this.loadingNode) {
            this.loadingNode.active = false;
        }

        // 初始化复选框状态
        this.updateCheckboxUI();

        // 设置输入框属性
        if (this.accountInput) {
            this.accountInput.maxLength = 20;
            this.accountInput.placeholder = '请输入账号';
        }

        if (this.passwordInput) {
            this.passwordInput.maxLength = 20;
            this.passwordInput.placeholder = '请输入密码';
            this.passwordInput.inputFlag = cc.EditBox.InputFlag.PASSWORD;
        }
    },

    /**
     * 绑定事件
     */
    bindEvents: function() {
        var self = this;

        // 登录按钮点击
        if (this.loginBtn) {
            this.loginBtn.on(cc.Node.EventType.TOUCH_END, function() {
                self.onLoginClick();
            }, this);
        }

        // 游客登录按钮点击
        if (this.guestBtn) {
            this.guestBtn.on(cc.Node.EventType.TOUCH_END, function() {
                self.onGuestLoginClick();
            }, this);
        }

        // 注册按钮点击
        if (this.registerBtn) {
            this.registerBtn.on(cc.Node.EventType.TOUCH_END, function() {
                self.onRegisterClick();
            }, this);
        }

        // 复选框点击（整个复选框区域可点击切换状态）
        if (this.agreementCheckbox) {
            this.agreementCheckbox.on(cc.Node.EventType.TOUCH_END, function(event) {
                self.onCheckboxClick(event);
            }, this);
        }

        // 用户协议文字点击（只有"用户协议"四个字可点击弹窗）
        if (this.agreementText) {
            this.agreementText.on(cc.Node.EventType.TOUCH_END, function(event) {
                self.onAgreementTextClick(event);
            }, this);
        }
    },

    /**
     * 检查用户协议接受状态
     */
    checkAgreementStatus: function() {
        if (typeof myglobal !== 'undefined') {
            var accepted = myglobal.getLocalData(GameConfig.STORAGE_KEYS.AGREEMENT_ACCEPTED, false);
            this._isAgreed = accepted === true || accepted === 'true';
            this.updateCheckboxUI();
        }
    },

    /**
     * 加载上次登录的账号
     */
    loadLastAccount: function() {
        if (typeof myglobal !== 'undefined') {
            var lastAccount = myglobal.getLocalData(GameConfig.STORAGE_KEYS.LAST_ACCOUNT, '');
            if (lastAccount && this.accountInput) {
                this.accountInput.string = lastAccount;
            }
        }
    },

    /**
     * 播放背景音乐
     */
    playBgMusic: function() {
        // 暂时注释，需要音频资源
        // cc.audioEngine.playMusic('resources/sound/login_bg.ogg', true);
    },

    /**
     * 复选框点击事件
     * 确保复选框可以多次点击切换
     */
    onCheckboxClick: function(event) {
        event.stopPropagation();
        
        cc.log('[LoginScene] 复选框点击，当前状态:', this._isAgreed);
        
        // 切换状态
        this._isAgreed = !this._isAgreed;
        
        cc.log('[LoginScene] 复选框切换后状态:', this._isAgreed);
        
        // 更新UI
        this.updateCheckboxUI();
        
        // 播放音效
        this.playClickSound();
    },

    /**
     * 用户协议文字点击事件
     * 只有"用户协议"四个字可以点击弹窗
     */
    onAgreementTextClick: function(event) {
        event.stopPropagation();
        
        cc.log('[LoginScene] 用户协议文字点击');
        
        // 显示用户协议弹窗
        this.showAgreementDialog();
        
        // 播放音效
        this.playClickSound();
    },

    /**
     * 更新复选框UI状态
     */
    updateCheckboxUI: function() {
        if (this.checkMark) {
            this.checkMark.active = this._isAgreed;
        }
        
        if (this.uncheckMark) {
            this.uncheckMark.active = !this._isAgreed;
        }
        
        cc.log('[LoginScene] 更新复选框UI，同意状态:', this._isAgreed);
    },

    /**
     * 显示用户协议弹窗
     */
    showAgreementDialog: function() {
        cc.log('[LoginScene] 显示用户协议弹窗');
        
        if (this.agreementPrefab) {
            var dialog = cc.instantiate(this.agreementPrefab);
            this.node.addChild(dialog);
        } else {
            // 如果没有预制体，创建简单的弹窗
            this.createSimpleAgreementDialog();
        }
    },

    /**
     * 创建简单的用户协议弹窗
     */
    createSimpleAgreementDialog: function() {
        var self = this;
        
        // 创建遮罩层
        var mask = new cc.Node('Mask');
        mask.color = cc.color(0, 0, 0, 180);
        var maskSprite = mask.addComponent(cc.Sprite);
        maskSprite.type = cc.Sprite.Type.SLICED;
        mask.setContentSize(cc.winSize.width * 2, cc.winSize.height * 2);
        mask.opacity = 0;
        mask.runAction(cc.fadeIn(0.2));
        mask.zIndex = 100;
        
        // 点击遮罩关闭
        mask.on(cc.Node.EventType.TOUCH_END, function() {
            self.closeDialog(mask);
        });
        
        // 创建弹窗背景
        var dialog = new cc.Node('Dialog');
        dialog.color = cc.color(255, 255, 255, 255);
        var dialogSprite = dialog.addComponent(cc.Sprite);
        dialogSprite.type = cc.Sprite.Type.SLICED;
        dialog.setContentSize(600, 400);
        dialog.zIndex = 101;
        
        // 创建标题
        var title = new cc.Node('Title');
        var titleLabel = title.addComponent(cc.Label);
        titleLabel.string = '用户协议';
        titleLabel.fontSize = 32;
        titleLabel.lineHeight = 40;
        title.y = 150;
        dialog.addChild(title);
        
        // 创建协议内容
        var content = new cc.Node('Content');
        var contentLabel = content.addComponent(cc.Label);
        contentLabel.string = this.getAgreementContent();
        contentLabel.fontSize = 20;
        contentLabel.lineHeight = 28;
        contentLabel.overflow = cc.Label.Overflow.CLAMP;
        contentLabel.enableWrapText = true;
        content.setContentSize(550, 250);
        content.y = -10;
        dialog.addChild(content);
        
        // 创建关闭按钮
        var closeBtn = new cc.Node('CloseBtn');
        var closeLabel = closeBtn.addComponent(cc.Label);
        closeLabel.string = '关闭';
        closeLabel.fontSize = 24;
        closeBtn.y = -160;
        closeBtn.on(cc.Node.EventType.TOUCH_END, function() {
            self.closeDialog(mask);
        });
        dialog.addChild(closeBtn);
        
        // 添加到场景
        mask.addChild(dialog);
        this.node.addChild(mask);
    },

    /**
     * 关闭弹窗
     */
    closeDialog: function(mask) {
        var self = this;
        mask.runAction(cc.sequence(
            cc.fadeOut(0.2),
            cc.callFunc(function() {
                mask.removeFromParent(true);
            })
        ));
    },

    /**
     * 获取用户协议内容
     */
    getAgreementContent: function() {
        return '欢迎使用本游戏！\n\n' +
               '在使用本游戏前，请您仔细阅读以下协议：\n\n' +
               '1. 本游戏仅供娱乐目的，请合理安排游戏时间。\n\n' +
               '2. 禁止使用任何外挂、作弊工具或利用游戏漏洞。\n\n' +
               '3. 请勿在游戏中发布违法、不良信息。\n\n' +
               '4. 游戏账号仅限本人使用，请勿转借他人。\n\n' +
               '5. 如有任何问题，请联系客服。\n\n' +
               '点击"关闭"表示您已阅读并同意以上协议。';
    },

    /**
     * 登录按钮点击
     */
    onLoginClick: function() {
        cc.log('[LoginScene] 登录按钮点击');
        
        // 检查是否同意用户协议
        if (!this.checkAgreement()) {
            return;
        }

        // 获取输入
        var account = this.accountInput ? this.accountInput.string.trim() : '';
        var password = this.passwordInput ? this.passwordInput.string.trim() : '';

        // 验证输入
        if (!this.validateInput(account, password)) {
            return;
        }

        // 执行登录
        this.doLogin(account, password);
    },

    /**
     * 游客登录按钮点击
     */
    onGuestLoginClick: function() {
        cc.log('[LoginScene] 游客登录按钮点击');
        
        // 检查是否同意用户协议
        if (!this.checkAgreement()) {
            return;
        }

        // 生成游客账号
        var guestAccount = 'guest_' + Date.now();
        var guestPassword = 'guest_' + Math.random().toString(36).substr(2, 8);

        // 执行登录
        this.doLogin(guestAccount, guestPassword, true);
    },

    /**
     * 注册按钮点击
     */
    onRegisterClick: function() {
        cc.log('[LoginScene] 注册按钮点击');
        
        // 检查是否同意用户协议
        if (!this.checkAgreement()) {
            return;
        }

        // 获取输入
        var account = this.accountInput ? this.accountInput.string.trim() : '';
        var password = this.passwordInput ? this.passwordInput.string.trim() : '';

        // 验证输入
        if (!this.validateInput(account, password)) {
            return;
        }

        // 执行注册
        this.doRegister(account, password);
    },

    /**
     * 检查是否同意用户协议
     */
    checkAgreement: function() {
        if (!this._isAgreed) {
            this.showToast('请先阅读并同意用户协议');
            return false;
        }
        return true;
    },

    /**
     * 验证输入
     */
    validateInput: function(account, password) {
        if (!account || account.length === 0) {
            this.showToast('请输入账号');
            return false;
        }

        if (account.length < 3) {
            this.showToast('账号长度至少3位');
            return false;
        }

        if (!password || password.length === 0) {
            this.showToast('请输入密码');
            return false;
        }

        if (password.length < 6) {
            this.showToast('密码长度至少6位');
            return false;
        }

        return true;
    },

    /**
     * 执行登录
     */
    doLogin: function(account, password, isGuest) {
        var self = this;

        if (this._isLogining) {
            return;
        }

        this._isLogining = true;
        this.showLoading('登录中...');

        // 保存账号
        if (typeof myglobal !== 'undefined') {
            myglobal.setLocalData(GameConfig.STORAGE_KEYS.LAST_ACCOUNT, account);
        }

        // 模拟登录请求
        setTimeout(function() {
            self.hideLoading();
            self._isLogining = false;

            // 模拟登录成功
            var mockData = {
                id: 'user_' + Date.now(),
                name: isGuest ? '游客' + Math.floor(Math.random() * 10000) : account,
                token: 'token_' + Math.random().toString(36).substr(2, 32),
                coins: 10000,
                diamonds: 100,
                level: 1
            };

            // 更新玩家数据
            if (typeof myglobal !== 'undefined') {
                myglobal.updatePlayerData(mockData);
                myglobal.setLocalData(GameConfig.STORAGE_KEYS.AGREEMENT_ACCEPTED, true);
            }

            // 保存协议接受状态
            self._isAgreed = true;

            self.showToast('登录成功');

            // 延迟跳转到大厅
            setTimeout(function() {
                self.enterHall();
            }, 1000);

        }, 1500);
    },

    /**
     * 执行注册
     */
    doRegister: function(account, password) {
        var self = this;

        this.showLoading('注册中...');

        // 模拟注册请求
        setTimeout(function() {
            self.hideLoading();

            // 模拟注册成功，直接登录
            self.doLogin(account, password);

        }, 1500);
    },

    /**
     * 进入大厅场景
     */
    enterHall: function() {
        cc.log('[LoginScene] 进入大厅场景');
        cc.director.loadScene('hallScene');
    },

    /**
     * 显示提示
     */
    showToast: function(message) {
        if (typeof myglobal !== 'undefined' && myglobal.showToast) {
            myglobal.showToast(message);
        } else {
            cc.log('[LoginScene] Toast:', message);
        }
    },

    /**
     * 显示加载
     */
    showLoading: function(message) {
        if (this.loadingNode) {
            this.loadingNode.active = true;
        }
        
        if (typeof myglobal !== 'undefined' && myglobal.showLoading) {
            myglobal.showLoading(message);
        }
    },

    /**
     * 隐藏加载
     */
    hideLoading: function() {
        if (this.loadingNode) {
            this.loadingNode.active = false;
        }
        
        if (typeof myglobal !== 'undefined' && myglobal.hideLoading) {
            myglobal.hideLoading();
        }
    },

    /**
     * 播放点击音效
     */
    playClickSound: function() {
        // 暂时注释，需要音频资源
        // cc.audioEngine.playEffect('resources/sound/click.mp3', false);
    }
});

// 导出模块
if (typeof module !== 'undefined' && module.exports) {
    module.exports = LoginScene;
}
