/**
 * 登录场景辅助函数
 * 作为插件脚本加载，确保在引擎初始化前可用
 * 用于修复 Web 平台 EditBox 和输入框的问题
 */

(function() {
    'use strict';

    // 全局样式修复标记
    var _globalStyleFixApplied = false;

    /**
     * 修复Web平台EditBox的CSS样式（增强版）
     * @param {cc.Node} editBox - EditBox节点
     * @param {string} fontColor - 字体颜色
     * @param {string} bgColor - 背景颜色
     */
    window._fixEditBoxStyle = function(editBox, fontColor, bgColor) {
        if (!cc.sys.isBrowser) return;

        fontColor = fontColor || '#000000';
        bgColor = bgColor || '#ffffff';

        // 立即尝试修复
        _applyInputStyles(fontColor, bgColor);

        // 延迟修复（等待HTML input元素创建）
        setTimeout(function() { _applyInputStyles(fontColor, bgColor); }, 50);
        setTimeout(function() { _applyInputStyles(fontColor, bgColor); }, 100);
        setTimeout(function() { _applyInputStyles(fontColor, bgColor); }, 200);
        setTimeout(function() { _applyInputStyles(fontColor, bgColor); }, 500);

        // 注入全局CSS样式（最高优先级）
        if (!_globalStyleFixApplied) {
            _globalStyleFixApplied = true;
            _injectGlobalStyles(fontColor, bgColor);
        }
    };

    /**
     * 应用样式到所有input元素
     * @param {string} fontColor - 字体颜色
     * @param {string} bgColor - 背景颜色
     */
    function _applyInputStyles(fontColor, bgColor) {
        try {
            var inputs = document.querySelectorAll('input');
            for (var i = 0; i < inputs.length; i++) {
                var input = inputs[i];
                _styleSingleInput(input, fontColor, bgColor);
            }

            // 也处理 textarea（可能被用于 EditBox）
            var textareas = document.querySelectorAll('textarea');
            for (var j = 0; j < textareas.length; j++) {
                _styleSingleInput(textareas[j], fontColor, bgColor);
            }
        } catch (e) {
            console.error('修复EditBox样式失败:', e);
        }
    }

    /**
     * 样式化单个input元素
     * @param {HTMLElement} input - input元素
     * @param {string} fontColor - 字体颜色
     * @param {string} bgColor - 背景颜色
     */
    function _styleSingleInput(input, fontColor, bgColor) {
        // 跳过原生输入框，它们已经有正确的样式
        if (input.id === 'native-phone-input' || input.id === 'native-code-input') {
            return;
        }

        // 核心样式设置
        input.style.setProperty('color', fontColor, 'important');
        input.style.color = fontColor;

        // 透明背景
        input.style.setProperty('background-color', 'transparent', 'important');
        input.style.backgroundColor = 'transparent';

        // 文字垂直居中
        input.style.setProperty('display', 'flex', 'important');
        input.style.display = 'flex';
        input.style.setProperty('align-items', 'center', 'important');
        input.style.alignItems = 'center';
        input.style.setProperty('justify-content', 'flex-start', 'important');
        input.style.justifyContent = 'flex-start';

        // 盒模型设置
        input.style.setProperty('box-sizing', 'border-box', 'important');
        input.style.boxSizing = 'border-box';

        // 内边距
        input.style.setProperty('padding', '0 12px', 'important');
        input.style.padding = '0 12px';

        // 行高设置
        input.style.setProperty('line-height', '1', 'important');
        input.style.lineHeight = '1';

        // 高度
        input.style.setProperty('height', '100%', 'important');
        input.style.height = '100%';

        // 字体设置
        input.style.setProperty('font-size', '20px', 'important');
        input.style.fontSize = '20px';
        input.style.setProperty('font-family', 'Arial, "Microsoft YaHei", sans-serif', 'important');

        // WebKit 特殊修复
        input.style.setProperty('-webkit-text-fill-color', fontColor, 'important');
        input.style.webkitTextFillColor = fontColor;

        // 可见性确保
        input.style.setProperty('opacity', '1', 'important');
        input.style.opacity = '1';
        input.style.setProperty('visibility', 'visible', 'important');
        input.style.visibility = 'visible';

        // 光标颜色
        input.style.setProperty('caret-color', fontColor, 'important');
        input.style.caretColor = fontColor;

        // 移除干扰样式
        input.style.textShadow = 'none';
        input.style.setProperty('text-shadow', 'none', 'important');
        input.style.outline = 'none';
        input.style.setProperty('outline', 'none', 'important');
        input.style.border = 'none';
        input.style.setProperty('border', 'none', 'important');

        // 移除定位干扰
        input.style.removeProperty('top');
        input.style.removeProperty('margin-top');
        input.style.removeProperty('margin');

        // 聚焦时保持样式
        input.style.setProperty('outline-offset', '0', 'important');
    }

    /**
     * 注入全局CSS样式
     * @param {string} fontColor - 字体颜色
     * @param {string} bgColor - 背景颜色
     */
    function _injectGlobalStyles(fontColor, bgColor) {
        try {
            var styleId = 'cocos-editbox-fix-style';
            if (document.getElementById(styleId)) return;

            var css = `
                /* 输入框基础样式 - 透明背景 + 文字居中 */
                input:not(#native-phone-input):not(#native-code-input), 
                textarea:not(#native-phone-input):not(#native-code-input) {
                    color: ${fontColor} !important;
                    background-color: transparent !important;
                    opacity: 1 !important;
                    visibility: visible !important;
                    font-size: 20px !important;
                    -webkit-text-fill-color: ${fontColor} !important;
                    caret-color: ${fontColor} !important;
                    line-height: 1 !important;
                    border: none !important;
                    outline: none !important;
                }
                
                /* Placeholder 样式 */
                input::placeholder, textarea::placeholder {
                    color: #888888 !important;
                    opacity: 1 !important;
                }
                
                /* 聚焦状态 */
                input:focus:not(#native-phone-input):not(#native-code-input), 
                textarea:focus:not(#native-phone-input):not(#native-code-input) {
                    color: ${fontColor} !important;
                    outline: none !important;
                    background-color: transparent !important;
                }
                
                /* 文本类型输入框 - Flexbox 垂直居中 */
                input[type="text"]:not(#native-phone-input):not(#native-code-input), 
                input[type="number"]:not(#native-phone-input):not(#native-code-input), 
                input[type="tel"]:not(#native-phone-input):not(#native-code-input),
                input[type="password"]:not(#native-phone-input):not(#native-code-input) {
                    display: flex !important;
                    align-items: center !important;
                    justify-content: flex-start !important;
                    box-sizing: border-box !important;
                    padding: 0 12px !important;
                    height: 100% !important;
                    line-height: 1 !important;
                    border: none !important;
                }
                
                /* 移除浏览器默认样式 */
                input:focus,
                textarea:focus {
                    box-shadow: none !important;
                }
            `;

            var style = document.createElement('style');
            style.id = styleId;
            style.type = 'text/css';
            style.appendChild(document.createTextNode(css));
            document.head.appendChild(style);

        } catch (e) {
            console.error('注入全局样式失败:', e);
        }
    }

    /**
     * 创建原生 HTML input 元素（绕过 Cocos EditBox 的问题）
     * @param {cc.Node} panel - 弹窗面板节点
     * @param {cc.Node} phoneInputNode - 手机输入框节点
     * @param {cc.Node} codeInputNode - 验证码输入框节点
     * @param {number} inputWidth - 输入框宽度
     * @param {number} inputHeight - 输入框高度
     * @param {number} codeInputW - 验证码输入框宽度
     * @param {number} panelWidth - 面板宽度
     * @param {number} panelHeight - 面板高度
     */
    window._createNativeInputElements = function(panel, phoneInputNode, codeInputNode, inputWidth, inputHeight, codeInputW, panelWidth, panelHeight) {
        if (!cc.sys.isBrowser) return;

        try {
            // 获取 Canvas 元素
            var canvas = document.getElementById('GameCanvas') || document.querySelector('canvas');
            if (!canvas) {
                console.error('找不到 Canvas 元素');
                return;
            }

            var canvasRect = canvas.getBoundingClientRect();
            var winSize = cc.winSize;

            console.log('=== 创建原生输入框 ===');
            console.log('Canvas 尺寸:', canvasRect.width, 'x', canvasRect.height);
            console.log('游戏分辨率:', winSize.width, 'x', winSize.height);

            // 计算缩放比例
            var scaleX = canvasRect.width / winSize.width;
            var scaleY = canvasRect.height / winSize.height;

            // 获取输入框节点的世界坐标
            var phoneWorldPos = phoneInputNode.convertToWorldSpaceAR(cc.v2(0, 0));
            var codeWorldPos = codeInputNode.convertToWorldSpaceAR(cc.v2(0, 0));

            // 计算屏幕位置的函数
            var calcScreenPosFromWorld = function(worldPos, nodeWidth, nodeHeight, offsetX, offsetY) {
                var screenX = worldPos.x + offsetX;
                var screenY = worldPos.y + offsetY;

                var canvasX = screenX * scaleX;
                var canvasY = canvasRect.height - screenY * scaleY;  // Y 轴翻转

                var actualWidth = nodeWidth * scaleX;
                var actualHeight = nodeHeight * scaleY;

                return {
                    left: canvasRect.left + canvasX - actualWidth / 2,
                    top: canvasRect.top + canvasY - actualHeight / 2,
                    width: actualWidth,
                    height: actualHeight
                };
            };

            var phoneScreen = calcScreenPosFromWorld(phoneWorldPos, inputWidth, inputHeight, 0, 0);
            var codeScreen = calcScreenPosFromWorld(codeWorldPos, codeInputW, inputHeight, 0, 0);

            // 边界检查
            phoneScreen.left = Math.max(0, Math.min(canvasRect.width - phoneScreen.width, phoneScreen.left));
            phoneScreen.top = Math.max(0, Math.min(canvasRect.height - phoneScreen.height, phoneScreen.top));
            codeScreen.left = Math.max(0, Math.min(canvasRect.width - codeScreen.width, codeScreen.left));
            codeScreen.top = Math.max(0, Math.min(canvasRect.height - codeScreen.height, codeScreen.top));

            // 移除旧的容器和输入框
            var oldContainer = document.getElementById('native-input-container');
            if (oldContainer) {
                oldContainer.remove();
            }

            // 创建新的容器
            var container = document.createElement('div');
            container.id = 'native-input-container';
            container.style.cssText = [
                'position: fixed',
                'top: 0',
                'left: 0',
                'width: 100%',
                'height: 100%',
                'pointer-events: none',
                'z-index: 99999'
            ].join('; ');
            document.body.appendChild(container);

            // 创建手机号输入框
            var phoneInput = document.createElement('input');
            phoneInput.id = 'native-phone-input';
            phoneInput.type = 'tel';
            phoneInput.placeholder = '请输入手机号';
            phoneInput.maxLength = 11;
            phoneInput.style.cssText = [
                'position: absolute',
                'left: ' + phoneScreen.left + 'px',
                'top: ' + phoneScreen.top + 'px',
                'width: ' + phoneScreen.width + 'px',
                'height: ' + phoneScreen.height + 'px',
                'background: transparent',
                'border: none',
                'border-radius: 0',
                'font-size: 12px',
                'color: #333',
                'padding: 0 8px',
                'box-sizing: border-box',
                'outline: none',
                'pointer-events: auto',
                'z-index: 100000',
                'cursor: text',
                'font-family: Arial, "Microsoft YaHei", sans-serif',
                'line-height: ' + phoneScreen.height + 'px',
                'text-align: left'
            ].join('; ');
            container.appendChild(phoneInput);

            // 创建验证码输入框
            var codeInput = document.createElement('input');
            codeInput.id = 'native-code-input';
            codeInput.type = 'text';
            codeInput.placeholder = '验证码';
            codeInput.maxLength = 6;
            codeInput.style.cssText = [
                'position: absolute',
                'left: ' + codeScreen.left + 'px',
                'top: ' + codeScreen.top + 'px',
                'width: ' + codeScreen.width + 'px',
                'height: ' + codeScreen.height + 'px',
                'background: transparent',
                'border: none',
                'border-radius: 0',
                'font-size: 12px',
                'color: #333',
                'padding: 0 8px',
                'box-sizing: border-box',
                'outline: none',
                'pointer-events: auto',
                'z-index: 100000',
                'cursor: text',
                'font-family: Arial, "Microsoft YaHei", sans-serif',
                'line-height: ' + codeScreen.height + 'px',
                'text-align: left'
            ].join('; ');
            container.appendChild(codeInput);

            // 添加焦点事件调试
            phoneInput.addEventListener('focus', function() {
                console.log('手机输入框获得焦点');
            });
            codeInput.addEventListener('focus', function() {
                console.log('验证码输入框获得焦点');
            });

            console.log('原生输入框创建完成');

        } catch (e) {
            console.error('创建原生输入框失败:', e);
        }
    };

    /**
     * 移除原生 HTML 输入框元素
     */
    window._removeNativeInputElements = function() {
        if (!cc.sys.isBrowser) return;

        try {
            var container = document.getElementById('native-input-container');
            if (container) {
                container.remove();
                console.log('原生输入框已移除');
            }
        } catch (e) {
            console.error('移除原生输入框失败:', e);
        }
    };

    /**
     * MutationObserver 监听新创建的input元素
     */
    window._startInputObserver = function() {
        if (!cc.sys.isBrowser) return;

        try {
            var observer = new MutationObserver(function(mutations) {
                mutations.forEach(function(mutation) {
                    mutation.addedNodes.forEach(function(node) {
                        if (node.nodeName === 'INPUT' || node.nodeName === 'TEXTAREA') {
                            _styleSingleInput(node, '#000000', '#ffffff');
                        }
                        // 检查子节点
                        if (node.querySelectorAll) {
                            var inputs = node.querySelectorAll('input, textarea');
                            for (var i = 0; i < inputs.length; i++) {
                                _styleSingleInput(inputs[i], '#000000', '#ffffff');
                            }
                        }
                    });
                });
            });

            observer.observe(document.body, {
                childList: true,
                subtree: true
            });

        } catch (e) {
            console.warn('启动Input监听器失败:', e);
        }
    };

    // 将内部函数暴露到全局（供其他脚本使用）
    window._applyInputStyles = _applyInputStyles;
    window._styleSingleInput = _styleSingleInput;
    window._injectGlobalStyles = _injectGlobalStyles;

})();
