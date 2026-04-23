// 用户协议弹窗控制器
// 用于显示用户协议内容

cc.Class({
    extends: cc.Component,

    properties: {
        // 标题标签
        title_label: {
            type: cc.Label,
            default: null
        },
        // 内容标签
        content_label: {
            type: cc.Label,
            default: null
        },
        // 版本标签
        version_label: {
            type: cc.Label,
            default: null
        },
        // 加载节点
        loading_node: {
            type: cc.Node,
            default: null
        },
        // 滚动视图
        scroll_view: {
            type: cc.ScrollView,
            default: null
        }
    },

    onLoad: function() {
        console.log("UserAgreement onLoad");
        this._initCloseButton();
        this._loadAgreementContent();
    },

    // 初始化关闭按钮
    _initCloseButton: function() {
        // 关闭按钮在预制体中已经设置了点击事件
    },

    // 按钮点击事件处理
    onButtonClick: function(event, customEventData) {
        console.log("UserAgreement button click:", customEventData);
        
        if (customEventData === "close") {
            this._onCloseClick();
        }
    },

    // 关闭弹窗
    _onCloseClick: function() {
        this.node.destroy();
    },

    // 加载协议内容
    _loadAgreementContent: function() {
        var self = this;
        
        // 隐藏加载提示
        if (this.loading_node) {
            this.loading_node.active = false;
        }
        
        // 设置版本号
        if (this.version_label) {
            this.version_label.string = "版本: v1.0.0";
        }
        
        // 设置协议内容
        if (this.content_label) {
            var agreementText = this._getDefaultAgreementText();
            this.content_label.string = agreementText;
        }
        
        // 更新滚动视图
        if (this.scroll_view && this.content_label) {
            this.scheduleOnce(function() {
                self.scroll_view.scrollToTop(0.1);
            }, 0.1);
        }
    },

    // 获取默认协议文本
    _getDefaultAgreementText: function() {
        return "用户协议\n\n" +
            "欢迎使用本游戏！\n\n" +
            "在使用本游戏前，请仔细阅读以下协议内容：\n\n" +
            "1. 服务条款\n" +
            "本游戏提供的服务仅供个人非商业用途使用。用户不得复制、修改、发布、出售本游戏的任何部分。\n\n" +
            "2. 用户账号\n" +
            "用户需注册账号才能使用本游戏的完整功能。用户应妥善保管账号信息，对账号下的所有活动负责。\n\n" +
            "3. 用户行为规范\n" +
            "用户不得利用本游戏进行任何违法或不当活动，包括但不限于：\n" +
            "- 发布违法、有害、威胁、侮辱性内容\n" +
            "- 侵犯他人知识产权或其他权利\n" +
            "- 传播病毒或恶意代码\n" +
            "- 干扰或破坏游戏服务\n\n" +
            "4. 虚拟物品\n" +
            "游戏内的虚拟物品归本游戏所有，用户仅享有使用权。用户不得私自买卖、转让虚拟物品。\n\n" +
            "5. 隐私保护\n" +
            "我们重视用户隐私，将按照隐私政策保护用户个人信息。\n\n" +
            "6. 免责声明\n" +
            "本游戏不保证服务不会中断，对服务的及时性、安全性不作担保。\n\n" +
            "7. 协议修改\n" +
            "本游戏有权随时修改本协议，修改后的协议将在游戏内公布。\n\n" +
            "8. 法律适用\n" +
            "本协议适用中华人民共和国法律。\n\n" +
            "如有疑问，请联系客服。\n\n" +
            "感谢您的支持！";
    }
});
