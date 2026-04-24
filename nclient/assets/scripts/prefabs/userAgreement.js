// 用户协议弹窗控制器

cc.Class({
    name: 'userAgreement',
    extends: cc.Component,

    properties: {
        title_label: {
            type: cc.Label,
            default: null
        },
        content_label: {
            type: cc.Label,
            default: null
        },
        version_label: {
            type: cc.Label,
            default: null
        },
        loading_node: {
            type: cc.Node,
            default: null
        },
        scroll_view: {
            type: cc.ScrollView,
            default: null
        }
    },

    onLoad: function() {
        console.log("UserAgreement onLoad");
        this._loadUserAgreement();
    },

    onButtonClick: function(event, customEventData) {
        if (customEventData === "close") {
            this._onCloseClick();
        }
    },

    _onCloseClick: function() {
        this.node.destroy();
    },

    _loadUserAgreement: function() {
        var self = this;
        
        // 隐藏加载状态
        if (this.loading_node) {
            this.loading_node.active = false;
        }
        
        // 设置用户协议内容
        if (this.content_label) {
            this.content_label.string = this._getDefaultAgreement();
        }
        
        // 设置版本号
        if (this.version_label) {
            this.version_label.string = "版本: v1.0.0";
        }
    },

    _getDefaultAgreement: function() {
        return `用户协议

欢迎使用本游戏！

在使用本游戏前，请仔细阅读以下用户协议：

1. 服务说明
本游戏提供的网络服务仅供个人非商业用途使用。

2. 用户注册
用户需要使用手机号或微信账号进行注册登录。

3. 用户行为规范
用户不得利用本游戏进行任何违法违规活动。

4. 知识产权
本游戏的所有内容均受知识产权法律保护。

5. 免责声明
在法律允许的范围内，游戏运营商对因使用本游戏而产生的任何损失不承担责任。

6. 协议修改
运营商有权随时修改本协议，修改后的协议将在游戏中公布。

如有任何问题，请联系客服。

感谢您的支持！`;
    }
});
