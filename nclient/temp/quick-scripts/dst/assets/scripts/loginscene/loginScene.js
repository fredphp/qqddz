
                (function() {
                    var nodeEnv = typeof require !== 'undefined' && typeof process !== 'undefined';
                    var __module = nodeEnv ? module : {exports:{}};
                    var __filename = 'preview-scripts/assets/scripts/loginscene/loginScene.js';
                    var __require = nodeEnv ? function (request) {
                        return cc.require(request);
                    } : function (request) {
                        return __quick_compile_project__.require(request, __filename);
                    };
                    function __define (exports, require, module) {
                        if (!nodeEnv) {__quick_compile_project__.registerModule(__filename, module);}"use strict";
cc._RF.push(module, 'b05a68gSOpBWr8ddvT03Jpj', 'loginScene');
// scripts/loginscene/loginScene.js

"use strict";

// 登录场景控制器
// 使用点击事件实现复选框功能（不依赖 Toggle 组件）

// 全局样式修复函数 - 更强大的版本
var _globalStyleFixApplied = false;

// 辅助函数：修复Web平台EditBox的CSS样式（增强版）
var _fixEditBoxStyle = function _fixEditBoxStyle(editBox, fontColor, bgColor) {
  if (!cc.sys.isBrowser) return;
  fontColor = fontColor || '#000000';
  bgColor = bgColor || '#ffffff';

  // 立即尝试修复
  _applyInputStyles(fontColor, bgColor);

  // 延迟修复（等待HTML input元素创建）
  setTimeout(function () {
    _applyInputStyles(fontColor, bgColor);
  }, 50);
  setTimeout(function () {
    _applyInputStyles(fontColor, bgColor);
  }, 100);
  setTimeout(function () {
    _applyInputStyles(fontColor, bgColor);
  }, 200);
  setTimeout(function () {
    _applyInputStyles(fontColor, bgColor);
  }, 500);

  // 注入全局CSS样式（最高优先级）
  if (!_globalStyleFixApplied) {
    _globalStyleFixApplied = true;
    _injectGlobalStyles(fontColor, bgColor);
  }
};

// 应用样式到所有input元素
var _applyInputStyles = function _applyInputStyles(fontColor, bgColor) {
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
};

// 样式化单个input元素 - 修复版：文字垂直居中 + 透明背景不遮挡边框
// 注意：跳过原生输入框（native-phone-input, native-code-input），因为它们有精确的位置设置
var _styleSingleInput = function _styleSingleInput(input, fontColor, bgColor) {
  // ★ 跳过原生输入框，它们已经有正确的样式
  if (input.id === 'native-phone-input' || input.id === 'native-code-input') {
    return;
  }

  // ==================== 核心样式设置 ====================

  // 1. 文字颜色
  input.style.setProperty('color', fontColor, 'important');
  input.style.color = fontColor;

  // 2. 关键：设置透明背景，让 Cocos 绘制的边框可见
  input.style.setProperty('background-color', 'transparent', 'important');
  input.style.backgroundColor = 'transparent';

  // 3. 文字垂直居中 - 使用 Flexbox 方案（最可靠）
  input.style.setProperty('display', 'flex', 'important');
  input.style.display = 'flex';
  input.style.setProperty('align-items', 'center', 'important');
  input.style.alignItems = 'center';
  input.style.setProperty('justify-content', 'flex-start', 'important');
  input.style.justifyContent = 'flex-start';

  // 4. 盒模型设置
  input.style.setProperty('box-sizing', 'border-box', 'important');
  input.style.boxSizing = 'border-box';

  // 5. 内边距 - 给文字留出空间，避免贴边
  input.style.setProperty('padding', '0 12px', 'important');
  input.style.padding = '0 12px';

  // 6. 行高设置 - 与字体大小匹配，确保垂直居中
  input.style.setProperty('line-height', '1', 'important');
  input.style.lineHeight = '1';

  // 7. 高度自适应内容
  input.style.setProperty('height', '100%', 'important');
  input.style.height = '100%';

  // ==================== 字体设置 ====================
  input.style.setProperty('font-size', '20px', 'important');
  input.style.fontSize = '20px';
  input.style.setProperty('font-family', 'Arial, "Microsoft YaHei", sans-serif', 'important');

  // ==================== WebKit 特殊修复 ====================
  input.style.setProperty('-webkit-text-fill-color', fontColor, 'important');
  input.style.webkitTextFillColor = fontColor;

  // ==================== 可见性确保 ====================
  input.style.setProperty('opacity', '1', 'important');
  input.style.opacity = '1';
  input.style.setProperty('visibility', 'visible', 'important');
  input.style.visibility = 'visible';

  // ==================== 光标颜色 ====================
  input.style.setProperty('caret-color', fontColor, 'important');
  input.style.caretColor = fontColor;

  // ==================== 移除干扰样式 ====================
  input.style.textShadow = 'none';
  input.style.setProperty('text-shadow', 'none', 'important');
  input.style.outline = 'none';
  input.style.setProperty('outline', 'none', 'important');
  input.style.border = 'none';
  input.style.setProperty('border', 'none', 'important');

  // ==================== 移除定位干扰 ====================
  input.style.removeProperty('top');
  input.style.removeProperty('margin-top');
  input.style.removeProperty('margin');

  // ==================== 聚焦时保持样式 ====================
  input.style.setProperty('outline-offset', '0', 'important');
};

// 注入全局CSS样式 - 修复版（排除原生输入框）
var _injectGlobalStyles = function _injectGlobalStyles(fontColor, bgColor) {
  try {
    var styleId = 'cocos-editbox-fix-style';
    if (document.getElementById(styleId)) return;
    var css = "\n            /* \u8F93\u5165\u6846\u57FA\u7840\u6837\u5F0F - \u900F\u660E\u80CC\u666F + \u6587\u5B57\u5C45\u4E2D */\n            /* \u6CE8\u610F\uFF1A\u6392\u9664\u539F\u751F\u8F93\u5165\u6846 #native-phone-input, #native-code-input */\n            input:not(#native-phone-input):not(#native-code-input), \n            textarea:not(#native-phone-input):not(#native-code-input) {\n                color: " + fontColor + " !important;\n                background-color: transparent !important;\n                opacity: 1 !important;\n                visibility: visible !important;\n                font-size: 20px !important;\n                -webkit-text-fill-color: " + fontColor + " !important;\n                caret-color: " + fontColor + " !important;\n                line-height: 1 !important;\n                border: none !important;\n                outline: none !important;\n            }\n            \n            /* Placeholder \u6837\u5F0F */\n            input::placeholder, textarea::placeholder {\n                color: #888888 !important;\n                opacity: 1 !important;\n            }\n            \n            /* \u805A\u7126\u72B6\u6001 */\n            input:focus:not(#native-phone-input):not(#native-code-input), \n            textarea:focus:not(#native-phone-input):not(#native-code-input) {\n                color: " + fontColor + " !important;\n                outline: none !important;\n                background-color: transparent !important;\n            }\n            \n            /* \u6587\u672C\u7C7B\u578B\u8F93\u5165\u6846 - Flexbox \u5782\u76F4\u5C45\u4E2D\uFF08\u6392\u9664\u539F\u751F\u8F93\u5165\u6846\uFF09*/\n            input[type=\"text\"]:not(#native-phone-input):not(#native-code-input), \n            input[type=\"number\"]:not(#native-phone-input):not(#native-code-input), \n            input[type=\"tel\"]:not(#native-phone-input):not(#native-code-input),\n            input[type=\"password\"]:not(#native-phone-input):not(#native-code-input) {\n                display: flex !important;\n                align-items: center !important;\n                justify-content: flex-start !important;\n                box-sizing: border-box !important;\n                padding: 0 12px !important;\n                height: 100% !important;\n                line-height: 1 !important;\n                border: none !important;\n            }\n            \n            /* \u79FB\u9664\u6D4F\u89C8\u5668\u9ED8\u8BA4\u6837\u5F0F */\n            input:focus,\n            textarea:focus {\n                box-shadow: none !important;\n            }\n        ";
    var style = document.createElement('style');
    style.id = styleId;
    style.type = 'text/css';
    style.appendChild(document.createTextNode(css));
    document.head.appendChild(style);
  } catch (e) {
    console.error('注入全局样式失败:', e);
  }
};

// 创建原生 HTML input 元素（绕过 Cocos EditBox 的问题）
// 改进版 v4：使用节点世界坐标精确定位
var _createNativeInputElements = function _createNativeInputElements(panel, phoneInputNode, codeInputNode, inputWidth, inputHeight, codeInputW, panelWidth, panelHeight) {
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
    console.log('=== 创建原生输入框（v4 - 使用节点世界坐标）===');
    console.log('Canvas 位置:', canvasRect.left, canvasRect.top);
    console.log('Canvas 尺寸:', canvasRect.width, 'x', canvasRect.height);
    console.log('游戏分辨率:', winSize.width, 'x', winSize.height);

    // 计算缩放比例（Canvas 实际尺寸 / 游戏设计分辨率）
    var scaleX = canvasRect.width / winSize.width;
    var scaleY = canvasRect.height / winSize.height;
    console.log('缩放比例:', scaleX.toFixed(3), scaleY.toFixed(3));

    // ==================== 关键改进：使用节点世界坐标 ====================
    // 直接使用 Cocos 节点的世界坐标，而不是手动计算偏移

    // 获取输入框节点的世界坐标
    var phoneWorldPos = phoneInputNode.convertToWorldSpaceAR(cc.v2(0, 0));
    var codeWorldPos = codeInputNode.convertToWorldSpaceAR(cc.v2(0, 0));
    console.log('手机输入框世界坐标:', phoneWorldPos.x.toFixed(1), phoneWorldPos.y.toFixed(1));
    console.log('验证码输入框世界坐标:', codeWorldPos.x.toFixed(1), codeWorldPos.y.toFixed(1));

    // ★★★ 位置微调参数（如果需要微调，修改这里）★★★
    var phoneOffsetX = 0; // 手机输入框 X 偏移
    var phoneOffsetY = 0; // 手机输入框 Y 偏移
    var codeOffsetX = 0; // 验证码输入框 X 偏移
    var codeOffsetY = 0; // 验证码输入框 Y 偏移

    // ★★★ 尺寸参数 ★★★
    var actualInputWidth = inputWidth; // 使用传入的输入框宽度
    var actualInputHeight = inputHeight; // 使用传入的输入框高度
    var actualCodeInputWidth = codeInputW; // 使用传入的验证码输入框宽度

    console.log('=== 输入框尺寸 ===');
    console.log('手机输入框:', actualInputWidth, 'x', actualInputHeight);
    console.log('验证码输入框:', actualCodeInputWidth, 'x', actualInputHeight);

    // 计算屏幕位置（世界坐标 -> 屏幕坐标）
    // Cocos 坐标系：原点左下角，Y 向上
    // HTML 坐标系：原点左上角，Y 向下
    var calcScreenPosFromWorld = function calcScreenPosFromWorld(worldPos, nodeWidth, nodeHeight, offsetX, offsetY) {
      // 世界坐标转换为屏幕坐标
      var screenX = worldPos.x + offsetX;
      var screenY = worldPos.y + offsetY;

      // 转换为 Canvas 坐标
      var canvasX = screenX * scaleX;
      var canvasY = canvasRect.height - screenY * scaleY; // Y 轴翻转

      // 计算实际尺寸
      var actualWidth = nodeWidth * scaleX;
      var actualHeight = nodeHeight * scaleY;
      return {
        left: canvasRect.left + canvasX - actualWidth / 2,
        top: canvasRect.top + canvasY - actualHeight / 2,
        width: actualWidth,
        height: actualHeight
      };
    };
    var phoneScreen = calcScreenPosFromWorld(phoneWorldPos, actualInputWidth, actualInputHeight, phoneOffsetX, phoneOffsetY);
    var codeScreen = calcScreenPosFromWorld(codeWorldPos, actualCodeInputWidth, actualInputHeight, codeOffsetX, codeOffsetY);
    console.log('手机输入框屏幕位置:', phoneScreen);
    console.log('验证码输入框屏幕位置:', codeScreen);

    // 边界检查：确保输入框在屏幕可见区域内
    phoneScreen.left = Math.max(0, Math.min(canvasRect.width - phoneScreen.width, phoneScreen.left));
    phoneScreen.top = Math.max(0, Math.min(canvasRect.height - phoneScreen.height, phoneScreen.top));
    codeScreen.left = Math.max(0, Math.min(canvasRect.width - codeScreen.width, codeScreen.left));
    codeScreen.top = Math.max(0, Math.min(canvasRect.height - codeScreen.height, codeScreen.top));
    console.log('边界检查后位置:');
    console.log('  手机输入框:', phoneScreen.left.toFixed(1), phoneScreen.top.toFixed(1));
    console.log('  验证码输入框:', codeScreen.left.toFixed(1), codeScreen.top.toFixed(1));

    // 移除旧的容器和输入框
    var oldContainer = document.getElementById('native-input-container');
    if (oldContainer) {
      oldContainer.remove();
    }

    // 创建新的容器（直接放在 body 下，确保不被遮挡）
    var container = document.createElement('div');
    container.id = 'native-input-container';
    container.style.cssText = ['position: fixed', 'top: 0', 'left: 0', 'width: 100%', 'height: 100%', 'pointer-events: none', 'z-index: 99999'].join('; ');
    document.body.appendChild(container);

    // 创建手机号输入框
    var phoneInput = document.createElement('input');
    phoneInput.id = 'native-phone-input';
    phoneInput.type = 'tel';
    phoneInput.placeholder = '请输入手机号';
    phoneInput.maxLength = 11;
    phoneInput.style.cssText = ['position: absolute', 'left: ' + phoneScreen.left + 'px', 'top: ' + phoneScreen.top + 'px', 'width: ' + phoneScreen.width + 'px', 'height: ' + phoneScreen.height + 'px', 'background: transparent', 'border: none', 'border-radius: 0', 'font-size: 12px', 'color: #333', 'padding: 0 8px', 'box-sizing: border-box', 'outline: none', 'pointer-events: auto', 'z-index: 100000', 'cursor: text', 'font-family: Arial, "Microsoft YaHei", sans-serif', 'line-height: ' + phoneScreen.height + 'px', 'text-align: left'].join('; ');
    container.appendChild(phoneInput);

    // 创建验证码输入框
    var codeInput = document.createElement('input');
    codeInput.id = 'native-code-input';
    codeInput.type = 'text';
    codeInput.placeholder = '验证码';
    codeInput.maxLength = 6;
    codeInput.style.cssText = ['position: absolute', 'left: ' + codeScreen.left + 'px', 'top: ' + codeScreen.top + 'px', 'width: ' + codeScreen.width + 'px', 'height: ' + codeScreen.height + 'px', 'background: transparent', 'border: none', 'border-radius: 0', 'font-size: 12px', 'color: #333', 'padding: 0 8px', 'box-sizing: border-box', 'outline: none', 'pointer-events: auto', 'z-index: 100000', 'cursor: text', 'font-family: Arial, "Microsoft YaHei", sans-serif', 'line-height: ' + codeScreen.height + 'px', 'text-align: left'].join('; ');
    container.appendChild(codeInput);

    // 添加焦点事件调试
    phoneInput.addEventListener('focus', function () {
      console.log('手机输入框获得焦点');
    });
    phoneInput.addEventListener('click', function () {
      console.log('手机输入框被点击');
    });
    codeInput.addEventListener('focus', function () {
      console.log('验证码输入框获得焦点');
    });
    codeInput.addEventListener('click', function () {
      console.log('验证码输入框被点击');
    });
    console.log('原生输入框创建完成');

    // 延迟检查输入框是否正确创建
    setTimeout(function () {
      var phoneCheck = document.getElementById('native-phone-input');
      var codeCheck = document.getElementById('native-code-input');
      console.log('输入框检查:');
      console.log('  手机输入框:', phoneCheck ? '存在' : '不存在');
      console.log('  验证码输入框:', codeCheck ? '存在' : '不存在');
      if (phoneCheck) {
        var rect = phoneCheck.getBoundingClientRect();
        console.log('  手机输入框位置:', rect.left, rect.top, rect.width, 'x', rect.height);
      }
    }, 100);
  } catch (e) {
    console.error('创建原生输入框失败:', e);
  }
};

// 移除原生 HTML 输入框元素（登录成功或关闭弹窗时调用）
var _removeNativeInputElements = function _removeNativeInputElements() {
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

// 修复 EditBox 的 HTML input 元素位置和尺寸
var _fixEditBoxInputElements = function _fixEditBoxInputElements(panel, phoneInputNode, codeInputNode, inputWidth, inputHeight, codeInputW, phoneEditBox, codeEditBox) {
  if (!cc.sys.isBrowser) return;
  try {
    // 获取 Canvas 元素
    var canvas = document.getElementById('GameCanvas') || document.querySelector('canvas');
    if (!canvas) {
      console.error('找不到 Canvas 元素');
      return;
    }
    var canvasRect = canvas.getBoundingClientRect();
    console.log('Canvas 尺寸:', canvasRect.width, 'x', canvasRect.height);

    // 获取游戏设计的分辨率
    var winSize = cc.winSize;
    console.log('游戏分辨率:', winSize.width, 'x', winSize.height);

    // 计算缩放比例
    var scaleX = canvasRect.width / winSize.width;
    var scaleY = canvasRect.height / winSize.height;
    console.log('缩放比例:', scaleX, scaleY);

    // 辅助函数：将 Cocos 世界坐标转换为 HTML 屏幕坐标
    var worldToScreen = function worldToScreen(worldPos, nodeWidth, nodeHeight) {
      // Cocos 坐标系：原点在左下角，Y轴向上
      // HTML 坐标系：原点在左上角，Y轴向下

      // 世界坐标转换为相对于设计分辨率的位置（0 到 winSize）
      // 然后缩放到 Canvas 尺寸

      var screenX = (worldPos.x - nodeWidth / 2) * scaleX;
      var screenY = canvasRect.height - (worldPos.y + nodeHeight / 2) * scaleY;
      return {
        x: screenX,
        y: screenY
      };
    };

    // 计算手机输入框的世界坐标
    var phoneWorldPos = phoneInputNode.convertToWorldSpaceAR(cc.v2(0, 0));
    console.log('手机输入框世界坐标:', phoneWorldPos.x, phoneWorldPos.y);
    var phoneScreenPos = worldToScreen(phoneWorldPos, inputWidth, inputHeight);
    console.log('手机输入框屏幕位置:', phoneScreenPos.x, phoneScreenPos.y);

    // 查找 HTML input 元素
    var inputs = document.querySelectorAll('input');
    console.log('找到 ' + inputs.length + ' 个 input 元素');

    // 如果只有一个 input，需要手动创建第二个
    if (inputs.length === 1) {
      var phoneInput = inputs[0];

      // 设置样式
      phoneInput.style.position = 'absolute';
      phoneInput.style.left = Math.max(0, phoneScreenPos.x) + 'px';
      phoneInput.style.top = Math.max(0, phoneScreenPos.y) + 'px';
      phoneInput.style.width = inputWidth * scaleX + 'px';
      phoneInput.style.height = inputHeight * scaleY + 'px';
      phoneInput.style.zIndex = '9999';
      phoneInput.style.opacity = '1';
      phoneInput.style.visibility = 'visible';
      phoneInput.style.display = 'block';
      phoneInput.style.pointerEvents = 'auto';
      phoneInput.style.cursor = 'text';
      phoneInput.style.background = 'rgba(255,255,255,0.5)';
      phoneInput.style.border = '2px solid gold';
      phoneInput.style.outline = 'none';
      phoneInput.style.fontSize = '16px';
      phoneInput.style.color = '#333333';
      phoneInput.style.padding = '5px';
      phoneInput.style.boxSizing = 'border-box';
      phoneInput.style.borderRadius = '5px';
      console.log('手机输入框样式已修复，位置:', phoneInput.style.left, phoneInput.style.top);
    }

    // 验证码输入框
    var codeWorldPos = codeInputNode.convertToWorldSpaceAR(cc.v2(0, 0));
    console.log('验证码输入框世界坐标:', codeWorldPos.x, codeWorldPos.y);
    var codeScreenPos = worldToScreen(codeWorldPos, codeInputW, inputHeight);
    console.log('验证码输入框屏幕位置:', codeScreenPos.x, codeScreenPos.y);
    if (inputs.length >= 2) {
      var codeInput = inputs[1];
      codeInput.style.position = 'absolute';
      codeInput.style.left = Math.max(0, codeScreenPos.x) + 'px';
      codeInput.style.top = Math.max(0, codeScreenPos.y) + 'px';
      codeInput.style.width = codeInputW * scaleX + 'px';
      codeInput.style.height = inputHeight * scaleY + 'px';
      codeInput.style.zIndex = '9999';
      codeInput.style.opacity = '1';
      codeInput.style.visibility = 'visible';
      codeInput.style.display = 'block';
      codeInput.style.pointerEvents = 'auto';
      codeInput.style.cursor = 'text';
      codeInput.style.background = 'rgba(255,255,255,0.5)';
      codeInput.style.border = '2px solid gold';
      codeInput.style.outline = 'none';
      codeInput.style.fontSize = '16px';
      codeInput.style.color = '#333333';
      codeInput.style.padding = '5px';
      codeInput.style.boxSizing = 'border-box';
      codeInput.style.borderRadius = '5px';
      console.log('验证码输入框样式已修复');
    }

    // 调试：显示输入框的实际位置
    console.log('=== 调试信息 ===');
    console.log('Canvas 位置:', canvasRect.left, canvasRect.top);
    console.log('设计分辨率:', winSize.width, 'x', winSize.height);
    console.log('输入框节点尺寸:', inputWidth, 'x', inputHeight);
    console.log('验证码输入框尺寸:', codeInputW, 'x', inputHeight);
  } catch (e) {
    console.error('修复 EditBox 样式失败:', e);
  }
};

// MutationObserver 监听新创建的input元素
var _startInputObserver = function _startInputObserver() {
  if (!cc.sys.isBrowser) return;
  try {
    var observer = new MutationObserver(function (mutations) {
      mutations.forEach(function (mutation) {
        mutation.addedNodes.forEach(function (node) {
          if (node.nodeName === 'INPUT' || node.nodeName === 'TEXTAREA') {
            _styleSingleInput(node, '#000000', '#ffffff');
          }
          // 检查子节点
          if (node.querySelectorAll) {
            var inputs = node.querySelectorAll('input, textarea');
            inputs.forEach(function (inp) {
              _styleSingleInput(inp, '#000000', '#ffffff');
            });
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
cc.Class({
  name: 'loginScene',
  "extends": cc.Component,
  properties: {
    wait_node: {
      type: cc.Node,
      "default": null
    },
    user_agreement_prefabs: {
      type: cc.Prefab,
      "default": null
    },
    phone_login_prefab: {
      type: cc.Prefab,
      "default": null
    }
  },
  onLoad: function onLoad() {
    var self = this;
    console.log("========================================");
    console.log("loginScene onLoad 开始执行");
    console.log("========================================");
    try {
      // 🔧 修复：禁用自动全屏功能（双重保险，移除 isMobile 检查）
      // 即使 main.js 中的设置没有生效，这里也会再次禁用
      if (cc.view && cc.view.enableAutoFullScreen) {
        cc.view.enableAutoFullScreen(false);
        console.log("loginScene: 已禁用自动全屏功能");
      }

      // 🔧 额外保险：禁用 screen 的自动全屏触摸监听器
      if (cc.screen && cc.screen.disableAutoFullScreen) {
        cc.screen.disableAutoFullScreen();
        console.log("loginScene: 已禁用 screen 自动全屏触摸监听器");
      }
    } catch (e) {
      console.error("禁用自动全屏时出错:", e);
    }
    try {
      // 启动Web平台Input样式监听器
      _startInputObserver();
      _injectGlobalStyles('#000000', '#ffffff');
    } catch (e) {
      console.error("初始化样式监听器时出错:", e);
    }
    this._isAgreementChecked = false;
    this._phoneLoginPopupShowing = false; // 初始化弹窗标志位

    try {
      this._initWaitNode();
    } catch (e) {
      console.error("初始化等待节点时出错:", e);
    }
    try {
      // 初始化复选框（使用点击事件）
      this._initCheckbox();
    } catch (e) {
      console.error("初始化复选框时出错:", e);
    }
    try {
      // 初始化登录按钮
      this._initLoginButtons();
    } catch (e) {
      console.error("初始化登录按钮时出错:", e);
    }
    try {
      // 初始化用户协议链接点击事件
      this._initUserAgreementLink();
    } catch (e) {
      console.error("初始化用户协议链接时出错:", e);
    }
    try {
      // 🚀【性能优化】预加载大厅场景和游戏场景
      this._preloadScenes();
    } catch (e) {
      console.error("预加载场景时出错:", e);
    }
    try {
      // 检查是否有本地登录会话，尝试自动登录
      this._checkAutoLogin();
    } catch (e) {
      console.error("检查自动登录时出错:", e);
    }
    if (typeof window.myglobal === 'undefined') {
      console.error("myglobal 未定义，尝试等待...");
      this._waitForMyglobal();
      return;
    }
    this._initAndStart();
    console.log("========================================");
    console.log("loginScene onLoad 执行完成");
    console.log("========================================");
  },
  // 检查自动登录
  _checkAutoLogin: function _checkAutoLogin() {
    var myglobal = window.myglobal;
    if (!myglobal) {
      return;
    }

    // 检查是否被强制下线
    if (myglobal.wasForceLoggedOut()) {
      this._showError(myglobal.getForceLogoutReason());
      return;
    }

    // 检查是否有本地会话
    if (myglobal.hasLocalSession()) {
      var self = this;
      myglobal.verifyToken(function (valid, message) {
        if (valid) {
          self._showError("自动登录中...");

          // 检查是否有保存的房间信息（刷新页面后恢复到游戏场景）
          var reconnectInfo = myglobal.socket && myglobal.socket.loadReconnectInfo ? myglobal.socket.loadReconnectInfo() : {
            token: '',
            playerId: '',
            roomCode: ''
          };

          // 如果有房间号，说明之前在游戏中，需要恢复到游戏场景
          if (reconnectInfo.roomCode) {
            self.scheduleOnce(function () {
              if (myglobal.socket && myglobal.socket.initSocket) {
                myglobal.socket.initSocket();
              }

              // 监听房间恢复事件
              myglobal.socket.onRoomRestored(function (data) {
                cc.director.loadScene("gameScene");
              });

              // 监听普通连接成功（不在房间中）
              var evt = window.eventLister ? window.eventLister({}) : null;
              if (evt) {
                evt.on("connection_success", function (data) {
                  cc.director.loadScene("gameScene");
                });
              }
            }, 0.5);
          } else {
            // 没有房间信息，正常跳转到大厅
            self.scheduleOnce(function () {
              if (myglobal.socket && myglobal.socket.initSocket) {
                myglobal.socket.initSocket();
              }
              cc.director.loadScene("hallScene");
            }, 0.5);
          }
        } else {
          // Token无效，显示错误信息并停留在登录页面
          self._showError(message || "登录已过期，请重新登录");
          // myglobal.verifyToken 已经清除了本地状态，这里不需要再次清除
        }
      });
    } else {}
  },
  _initWaitNode: function _initWaitNode() {
    if (this.wait_node) {
      this._loadingImage = this.wait_node.getChildByName("loading_image");
      var lblNode = this.wait_node.getChildByName("lblcontent_Label");
      if (lblNode) {
        this._waitLabel = lblNode.getComponent(cc.Label);
      }
      this.wait_node.active = false;
    }
  },
  _initCheckbox: function _initCheckbox() {
    var self = this;

    // loginScene 脚本挂载在 ROOT_UI 节点上，所以 this.node 就是 ROOT_UI
    var checkMarkNode = this.node.getChildByName("check_mark");
    if (!checkMarkNode) {
      console.error("check_mark 节点未找到");
      return;
    }
    this._checkMarkNode = checkMarkNode;
    var checkmark = checkMarkNode.getChildByName("checkmark");
    if (checkmark) {
      this._checkmarkIcon = checkmark;
      checkmark.active = true; // 默认选中
    }

    this._isAgreementChecked = true; // 默认已同意协议

    var button = checkMarkNode.getComponent(cc.Button);
    if (button) {
      button.enabled = false;
    }
    checkMarkNode.off(cc.Node.EventType.TOUCH_END);
    checkMarkNode.on(cc.Node.EventType.TOUCH_END, function (event) {
      self._toggleCheckbox();
    }, self);
  },
  _toggleCheckbox: function _toggleCheckbox() {
    this._isAgreementChecked = !this._isAgreementChecked;
    if (this._checkmarkIcon) {
      this._checkmarkIcon.active = this._isAgreementChecked;
    }
  },
  start: function start() {
    console.log("========================================");
    console.log("loginScene start 方法执行");
    console.log("========================================");

    // 备用方案：在 start 中再次检查按钮是否正确初始化
    var self = this;
    this.scheduleOnce(function () {
      console.log(">>> 延迟检查按钮状态...");
      var phoneLoginNode = self.node.getChildByName("login_phone");
      if (phoneLoginNode) {
        console.log(">>> login_phone 节点存在");
        var hasTouchListeners = phoneLoginNode.getComponent(cc.Button) !== null;
        console.log(">>> 是否有 Button 组件:", hasTouchListeners);

        // 再次确保事件绑定
        phoneLoginNode.off(cc.Node.EventType.TOUCH_END);
        phoneLoginNode.on(cc.Node.EventType.TOUCH_END, function (event) {
          console.log(">>> [start备用] 手机登录按钮 TOUCH_END 事件触发");
          event.stopPropagation();
          self._doPhoneLogin();
        }, self);
        console.log(">>> 已重新绑定手机登录按钮事件");
      } else {
        console.error(">>> login_phone 节点不存在！");
      }
      var wxLoginNode = self.node.getChildByName("login_wx");
      if (wxLoginNode) {
        console.log(">>> login_wx 节点存在");
        wxLoginNode.off(cc.Node.EventType.TOUCH_END);
        wxLoginNode.on(cc.Node.EventType.TOUCH_END, function (event) {
          console.log(">>> [start备用] 微信登录按钮 TOUCH_END 事件触发");
          self._doWxLogin();
        }, self);
        console.log(">>> 已重新绑定微信登录按钮事件");
      }
    }, 0.5);
  },
  _initLoginButtons: function _initLoginButtons() {
    var self = this;
    console.log("=== 初始化登录按钮 ===");
    console.log("当前节点:", this.node ? this.node.name : "null");

    // 打印所有子节点名称
    var children = this.node.children;
    console.log("子节点数量:", children.length);
    for (var i = 0; i < children.length; i++) {
      console.log("  子节点[" + i + "]:", children[i].name);
    }

    // loginScene 脚本挂载在 ROOT_UI 节点上，所以 this.node 就是 ROOT_UI
    var wxLoginNode = this.node.getChildByName("login_wx");
    console.log("wxLoginNode:", wxLoginNode ? "找到" : "未找到");
    if (wxLoginNode) {
      var button = wxLoginNode.getComponent(cc.Button);
      console.log("wxLoginNode Button:", button ? "存在" : "不存在");
      if (button) {
        button.interactable = true;
        button.clickEvents = [];
        var handler = new cc.Component.EventHandler();
        handler.target = this.node;
        handler.component = "loginScene";
        handler.handler = "_onWxLoginClick";
        handler.customEventData = "";
        button.clickEvents.push(handler);
        console.log("微信登录按钮初始化完成");
      }

      // 添加备用的触摸事件监听（确保点击事件一定能触发）
      wxLoginNode.off(cc.Node.EventType.TOUCH_END);
      wxLoginNode.on(cc.Node.EventType.TOUCH_END, function (event) {
        console.log(">>> 微信登录按钮 TOUCH_END 事件触发");
        self._doWxLogin();
      }, self);
    } else {
      console.error("未找到 login_wx 节点！");
    }
    var phoneLoginNode = this.node.getChildByName("login_phone");
    console.log("phoneLoginNode:", phoneLoginNode ? "找到" : "未找到");
    if (phoneLoginNode) {
      var button = phoneLoginNode.getComponent(cc.Button);
      console.log("phoneLoginNode Button:", button ? "存在" : "不存在");
      if (button) {
        button.interactable = true;
        button.clickEvents = [];
        var handler = new cc.Component.EventHandler();
        handler.target = this.node;
        handler.component = "loginScene";
        handler.handler = "_onPhoneLoginClick";
        handler.customEventData = "";
        button.clickEvents.push(handler);
        console.log("手机登录按钮初始化完成");
      }

      // 添加备用的触摸事件监听（确保点击事件一定能触发）
      phoneLoginNode.off(cc.Node.EventType.TOUCH_END);
      phoneLoginNode.on(cc.Node.EventType.TOUCH_END, function (event) {
        console.log(">>> 手机登录按钮 TOUCH_END 事件触发");
        event.stopPropagation(); // 阻止事件冒泡
        self._doPhoneLogin();
      }, self);
    } else {
      console.error("未找到 login_phone 节点！");
    }
    console.log("=== 登录按钮初始化结束 ===");
  },
  _initUserAgreementLink: function _initUserAgreementLink() {
    var self = this;

    // loginScene 脚本挂载在 ROOT_UI 节点上，所以 this.node 就是 ROOT_UI
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
  _onWxLoginClick: function _onWxLoginClick() {
    console.log("=== 微信登录按钮被点击 ===");
    this._doWxLogin();
  },
  _onPhoneLoginClick: function _onPhoneLoginClick() {
    console.log("=== 手机登录按钮被点击 ===");
    this._doPhoneLogin();
  },
  _onUserAgreementLinkClick: function _onUserAgreementLinkClick() {
    this._showUserAgreementPopup();
  },
  _checkAgreement: function _checkAgreement() {
    return this._isAgreementChecked;
  },
  // 🚀【性能优化】预加载场景
  _preloadScenes: function _preloadScenes() {
    // 预加载大厅场景
    cc.director.preloadScene("hallScene", function (err) {
      if (err) {
        console.error("🚀 [预加载] 大厅场景预加载失败:", err);
        return;
      }
    });

    // 预加载游戏场景
    cc.director.preloadScene("gameScene", function (err) {
      if (err) {
        console.error("🚀 [预加载] 游戏场景预加载失败:", err);
        return;
      }
    });
  },
  _waitForMyglobal: function _waitForMyglobal() {
    var self = this;
    var attempts = 0;
    var check = function check() {
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
  _initAndStart: function _initAndStart() {
    var myglobal = window.myglobal;
    if (!myglobal.socket && !myglobal.init()) {
      this._showError("初始化失败，请刷新页面重试");
      return;
    }

    // 检查是否有保存的重连信息（刷新页面后恢复）
    if (myglobal.socket && myglobal.socket.loadReconnectInfo) {
      var reconnectInfo = myglobal.socket.loadReconnectInfo();
      if (reconnectInfo.token && reconnectInfo.playerId) {
        this._showLoading(true, "正在恢复登录状态...");

        // 初始化 WebSocket 连接
        if (myglobal.socket.initSocket) {
          myglobal.socket.initSocket();
        }
        var self = this;

        // 监听房间恢复事件
        myglobal.socket.onRoomRestored(function (data) {
          self._showLoading(false);

          // 恢复玩家数据
          myglobal.playerData.playerId = data.player_id;
          myglobal.playerData.nickName = data.player_name;
          myglobal.playerData.saveToLocal();

          // 跳转到游戏场景
          cc.director.loadScene("gameScene");
        });

        // 监听普通连接成功（不在房间中）
        var evt = window.eventLister ? window.eventLister({}) : null;
        if (evt) {
          evt.on("connection_success", function (data) {
            self._showLoading(false);
            myglobal.playerData.playerId = data.player_id;
            myglobal.playerData.nickName = data.player_name;
            myglobal.playerData.gobal_count = data.gold || 0;
            myglobal.playerData.saveToLocal();
            cc.director.loadScene("hallScene");
          });
        }
        return;
      }
    }

    // 初始化背景音乐 - 处理浏览器自动播放策略
    this._initBackgroundMusic();
    if (myglobal.socket && myglobal.socket.initSocket) {
      myglobal.socket.initSocket();
    }
  },
  // 初始化背景音乐 - 处理浏览器自动播放策略
  _initBackgroundMusic: function _initBackgroundMusic() {
    var self = this;

    // 音效开关检查
    var isopen_sound = typeof window.isopen_sound !== 'undefined' ? window.isopen_sound : 1;
    if (!isopen_sound) {
      return;
    }

    // 初始化状态
    this._musicPlaying = false;
    this._touchListenerAdded = false;

    // 使用 cc.resources.load 加载音频
    cc.resources.load("sound/login_bg", cc.AudioClip, function (err, clip) {
      if (err) {
        self._setupGlobalTouchForMusic();
        return;
      }

      // 保存音频剪辑
      self._bgMusicClip = clip;
      try {
        // 使用 playMusic 播放背景音乐（统一的背景音乐管理）
        cc.audioEngine.playMusic(clip, true);
        self._musicPlaying = true;
        // 成功播放，确保监听器被移除
        self._removeGlobalTouchForMusic();
      } catch (e) {
        self._setupGlobalTouchForMusic();
      }
    });
  },
  // 通过触摸播放音乐
  _playMusicOnTouch: function _playMusicOnTouch() {
    var self = this;

    // 首先检查是否有正在播放的音乐
    if (cc.audioEngine.isMusicPlaying()) {
      this._removeGlobalTouchForMusic();
      return;
    }

    // 如果已经有音频剪辑，直接播放
    if (this._bgMusicClip) {
      try {
        cc.audioEngine.playMusic(this._bgMusicClip, true);
        this._musicPlaying = true;
        this._removeGlobalTouchForMusic();
      } catch (e) {}
      return;
    }

    // 没有音频剪辑，需要加载
    cc.resources.load("sound/login_bg", cc.AudioClip, function (err, clip) {
      if (err) {
        return;
      }
      self._bgMusicClip = clip;
      try {
        cc.audioEngine.playMusic(clip, true);
        self._musicPlaying = true;
        self._removeGlobalTouchForMusic();
      } catch (e) {}
    });
  },
  // 设置全局触摸监听 - 用户点击任意位置触发音乐
  _setupGlobalTouchForMusic: function _setupGlobalTouchForMusic() {
    // 防止重复添加监听器
    if (this._touchListenerAdded) {
      return;
    }
    var self = this;
    this._touchListenerAdded = true;

    // Cocos Creator 层面的监听
    this._cocosTouchHandler = function () {
      self._playMusicOnTouch();
    };
    this.node.on(cc.Node.EventType.TOUCH_START, this._cocosTouchHandler, this);

    // Web 浏览器层面的监听
    if (cc.sys.isBrowser) {
      this._browserTouchHandler = function () {
        self._playMusicOnTouch();
      };
      document.addEventListener('touchstart', this._browserTouchHandler, true);
      document.addEventListener('mousedown', this._browserTouchHandler, true);
      document.addEventListener('click', this._browserTouchHandler, true);
    }
  },
  // 移除全局触摸监听
  _removeGlobalTouchForMusic: function _removeGlobalTouchForMusic() {
    // 移除 Cocos Creator 层面的监听
    if (this._cocosTouchHandler) {
      this.node.off(cc.Node.EventType.TOUCH_START, this._cocosTouchHandler, this);
      this._cocosTouchHandler = null;
    }

    // 移除浏览器层面的监听
    if (cc.sys.isBrowser && this._browserTouchHandler) {
      document.removeEventListener('touchstart', this._browserTouchHandler, true);
      document.removeEventListener('mousedown', this._browserTouchHandler, true);
      document.removeEventListener('click', this._browserTouchHandler, true);
      this._browserTouchHandler = null;
    }
    this._touchListenerAdded = false;
  },
  _showError: function _showError(message) {
    this._showWaitNode(message);
    this.scheduleOnce(function () {
      this._hideWaitNode();
    }, 2);
  },
  _showLoading: function _showLoading(show, message) {
    if (show) {
      this._showWaitNode(message || "正在处理...");
    } else {
      this._hideWaitNode();
    }
  },
  _showWaitNode: function _showWaitNode(message) {
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
  _hideWaitNode: function _hideWaitNode() {
    if (this.wait_node) {
      this.wait_node.active = false;
      this._isAnimating = false;
    }
  },
  // 绘制圆角矩形输入框背景（辅助方法）
  // 注意：Cocos Creator Graphics 组件没有 arcTo 方法，使用 roundRect 代替
  _drawInputBg: function _drawInputBg(graphics, width, height, radius) {
    var x = -width / 2;
    var y = -height / 2;
    // 使用 Cocos Creator Graphics 的 roundRect 方法
    graphics.roundRect(x, y, width, height, radius);
  },
  update: function update(dt) {
    if (this._isAnimating && this._loadingImage) {
      // 使用 angle 替代已废弃的 rotation 属性
      this._loadingImage.angle += dt * 45;
    }
  },
  _doWxLogin: function _doWxLogin() {
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
      avatarUrl: myglobal.playerData.avatarUrl
    }, function (err, result) {
      self._showLoading(false);
      if (err != 0) {
        self._showError("登录失败，请重试");
        return;
      }
      myglobal.playerData.gobal_count = result.goldcount || 0;
      cc.director.loadScene("hallScene");
    });
  },
  _doPhoneLogin: function _doPhoneLogin() {
    console.log(">>> _doPhoneLogin 被调用");

    // 🔧 修复：防止重复点击导致多个弹窗
    if (this._phoneLoginPopupShowing) {
      console.log(">>> 登录弹窗正在显示中，忽略重复调用");
      return;
    }
    if (!this._checkAgreement()) {
      console.log(">>> 用户未同意协议");
      this._showError("请先同意用户协议");
      return;
    }

    // 设置标志位，防止重复弹窗
    this._phoneLoginPopupShowing = true;
    console.log(">>> 准备显示手机登录弹窗");
    this._showPhoneLoginPopup();
  },
  _showPhoneLoginPopup: function _showPhoneLoginPopup() {
    var self = this;
    console.log(">>> _showPhoneLoginPopup 被调用");
    console.log(">>> phone_login_prefab:", this.phone_login_prefab ? "存在" : "不存在");
    if (this.phone_login_prefab) {
      this._createPhoneLoginPopup(this.phone_login_prefab);
    } else {
      console.log(">>> 动态加载 prefabs/phone_login");
      cc.resources.load("prefabs/phone_login", cc.Prefab, function (err, prefab) {
        if (err) {
          console.error("加载 phone_login prefab 失败:", err);
          self._showError("无法显示登录弹窗");
          return;
        }
        console.log(">>> phone_login prefab 加载成功");
        self._createPhoneLoginPopup(prefab);
      });
    }
  },
  _createPhoneLoginPopup: function _createPhoneLoginPopup(prefab) {
    console.log(">>> _createPhoneLoginPopup 被调用");

    // 动态创建弹窗（使用正确的背景图和尺寸）
    try {
      console.log(">>> 开始动态创建登录弹窗");
      var popup = this._createPhoneLoginDynamic();
      console.log(">>> 登录弹窗创建完成:", popup ? popup.name : "null");
      this._phoneLoginPopup = popup;
    } catch (e) {
      console.error("创建手机登录弹窗失败:", e);
      this._showError("无法显示登录弹窗: " + e.message);
      // 🔧 修复：创建失败时重置标志位，允许下次点击重试
      this._phoneLoginPopupShowing = false;
    }
  },
  // 动态创建手机登录弹窗 - 使用正确的背景图和尺寸
  _createPhoneLoginDynamic: function _createPhoneLoginDynamic() {
    var self = this;

    // ==================== 弹窗尺寸（固定尺寸，与图片匹配）====================
    // 使用固定尺寸：宽度520px，高度680px（与login_bg.png图片尺寸一致）
    // 在小屏幕上自动缩放
    var winW = cc.winSize.width;
    var winH = cc.winSize.height;

    // 图片原始尺寸 - 调宽弹窗
    var imgWidth = 580; // 原来是520，增加到580
    var imgHeight = 680;

    // 如果屏幕太小，按比例缩小
    var scale = 1.0;
    if (winW < imgWidth + 40) {
      scale = (winW - 40) / imgWidth;
    }
    var panelWidth = imgWidth * scale;
    var panelHeight = imgHeight * scale;
    console.log("登录弹窗尺寸: " + panelWidth + " x " + panelHeight + ", 缩放比例: " + scale);

    // ==================== 弹窗根节点 ====================
    var popup = new cc.Node("LoginDialog");
    popup.parent = this.node;
    popup.setContentSize(cc.size(winW, winH));
    popup.setPosition(0, 0);
    popup.zIndex = 1000;

    // 添加 BlockInputEvents 组件阻止底层点击
    popup.addComponent(cc.BlockInputEvents);

    // ==================== 半透明背景遮罩 ====================
    var mask = new cc.Node("Mask");
    mask.parent = popup;
    mask.setContentSize(cc.size(winW, winH));
    mask.setPosition(0, 0);
    var maskSprite = mask.addComponent(cc.Sprite);
    maskSprite.sizeMode = cc.Sprite.SizeMode.CUSTOM;
    mask.color = new cc.Color(0, 0, 0);
    mask.opacity = 150;

    // 🔧 修复：点击遮罩层关闭弹窗
    mask.on(cc.Node.EventType.TOUCH_END, function () {
      console.log(">>> 点击遮罩层关闭弹窗");
      // 重置标志位
      self._phoneLoginPopupShowing = false;

      // 清理原生 HTML input 元素
      if (cc.sys.isBrowser) {
        var container = document.getElementById('native-input-container');
        if (container) {
          container.remove();
        }
      }
      // 关闭动画
      cc.tween(panel).to(0.15, {
        scale: 0.8,
        opacity: 0
      }, {
        easing: 'backIn'
      }).call(function () {
        popup.destroy();
      }).start();
    }, this);

    // ==================== 弹窗面板 ====================
    var panel = new cc.Node("Panel");
    panel.parent = popup;
    panel.setContentSize(cc.size(panelWidth, panelHeight));
    panel.setPosition(0, 0);
    panel.scale = 0.7;
    panel.opacity = 0;

    // ==================== 弹窗背景（使用正确的 login_bg 图片）====================
    var bg = new cc.Node("Bg");
    bg.parent = panel;
    // 先设置一个临时尺寸
    bg.setContentSize(cc.size(panelWidth, panelHeight));
    bg.setPosition(0, 0);
    bg.zIndex = 0; // 背景在最底层

    // 先添加Sprite组件并设置sizeMode
    var bgSprite = bg.addComponent(cc.Sprite);
    bgSprite.sizeMode = cc.Sprite.SizeMode.CUSTOM; // 使用自定义尺寸，不跟随图片
    bgSprite.srcBlendFactor = cc.macro.BlendFactor.SRC_ALPHA;
    bgSprite.dstBlendFactor = cc.macro.BlendFactor.ONE_MINUS_SRC_ALPHA;

    // 加载背景图（使用 UI/login/login_bg.png）
    cc.resources.load("UI/login/login_bg", cc.SpriteFrame, function (err, spriteFrame) {
      if (err) {
        console.warn("加载 login_bg 失败，使用默认背景:", err);
        // 降级：使用渐变背景
        bg.removeComponent(cc.Sprite);
        var bgGfx = bg.addComponent(cc.Graphics);
        bgGfx.fillColor = new cc.Color(45, 35, 25);
        bgGfx.roundRect(-panelWidth / 2, -panelHeight / 2, panelWidth, panelHeight, 20);
        bgGfx.fill();
        return;
      }

      // 设置spriteFrame
      bgSprite.spriteFrame = spriteFrame;

      // 关键：再次确保尺寸正确（防止被图片尺寸覆盖）
      bg.setContentSize(cc.size(panelWidth, panelHeight));
      console.log("背景图加载成功，显示尺寸: " + bg.width + " x " + bg.height);
    });

    // ==================== 标题文字（欢乐登录）====================
    // 金色描边，白色主体，居中，顶部距边40px
    var titleNode = new cc.Node("Title");
    titleNode.parent = panel;
    titleNode.setPosition(0, panelHeight / 2 - 60);
    var titleLabel = titleNode.addComponent(cc.Label);
    titleLabel.string = "欢乐登录";
    titleLabel.fontSize = 36;
    titleLabel.lineHeight = 44;
    titleLabel.horizontalAlign = cc.Label.HorizontalAlign.CENTER;
    titleNode.color = new cc.Color(255, 255, 255);

    // 金色描边
    var titleOutline = titleNode.addComponent(cc.LabelOutline);
    titleOutline.color = new cc.Color(218, 165, 32); // 金色
    titleOutline.width = 3;

    // ==================== 关闭按钮（右上角圆形，红金色，46x46）====================
    var closeBtn = new cc.Node("BtnClose");
    closeBtn.parent = panel;
    closeBtn.setContentSize(cc.size(46, 46));
    closeBtn.setPosition(panelWidth / 2 - 35, panelHeight / 2 - 35);

    // 红金色圆形背景
    var closeGfx = closeBtn.addComponent(cc.Graphics);
    closeGfx.fillColor = new cc.Color(200, 60, 60); // 红色
    closeGfx.circle(0, 0, 23);
    closeGfx.fill();
    closeGfx.strokeColor = new cc.Color(218, 165, 32); // 金色边框
    closeGfx.lineWidth = 2;
    closeGfx.circle(0, 0, 22);
    closeGfx.stroke();

    // X 符号
    var closeX = new cc.Node("X");
    closeX.parent = closeBtn;
    var closeXLabel = closeX.addComponent(cc.Label);
    closeXLabel.string = "×";
    closeXLabel.fontSize = 28;
    closeXLabel.lineHeight = 32;
    closeXLabel.horizontalAlign = cc.Label.HorizontalAlign.CENTER;
    closeX.color = new cc.Color(255, 255, 255);
    closeBtn.on(cc.Node.EventType.TOUCH_END, function () {
      console.log(">>> 点击关闭按钮");
      // 🔧 修复：重置弹窗显示标志位
      self._phoneLoginPopupShowing = false;
      console.log(">>> 已重置 _phoneLoginPopupShowing 为 false");

      // 清理原生 HTML input 元素
      if (cc.sys.isBrowser) {
        var container = document.getElementById('native-input-container');
        if (container) {
          container.remove();
        }
      }
      // 关闭动画
      cc.tween(panel).to(0.15, {
        scale: 0.8,
        opacity: 0
      }, {
        easing: 'backIn'
      }).call(function () {
        popup.destroy();
      }).start();
    }, this);

    // ==================== 表单布局参数 ====================
    // 根据背景图login_bg.png(520x680)的精确预留位置设置元素
    // 使用项目现有的UI资源：
    //   icon_phone.png - 手机图标
    //   icon_shield.png - 验证码图标
    //   get_mobile_code.png - 获取验证码按钮

    // 计算缩放比例（小屏幕适配）
    var scaleRatio = panelWidth / 520;

    // 输入框尺寸
    var inputWidth = 220 * scaleRatio; // 输入框宽度
    var inputHeight = 45 * scaleRatio; // 输入框高度（减小）
    var iconSize = 25 * scaleRatio; // 图标大小
    var formY1 = 130 * scaleRatio; // 第一个输入框Y坐标（向下移动）
    var formY2 = 50 * scaleRatio; // 第二个输入框Y坐标
    var getCodeBtnWidth = 90 * scaleRatio; // 获取验证码按钮宽度
    var btnHeight = 45 * scaleRatio; // 统一按钮高度

    console.log("布局参数: scaleRatio=" + scaleRatio.toFixed(2));

    // ==================== 手机号输入行 ====================
    // 布局：[图标] [输入框] 整体居中
    var phoneRowWidth = iconSize + 15 + inputWidth; // 总宽度
    var phoneRowX = 0; // 整体居中

    // 手机图标 - 放在输入框左边
    var phoneIconNode = new cc.Node("PhoneIcon");
    phoneIconNode.parent = panel;
    phoneIconNode.setPosition(-phoneRowWidth / 2 + iconSize / 2 + 10, formY1);
    phoneIconNode.setContentSize(cc.size(iconSize, iconSize));
    cc.resources.load("UI/login/icon_phone", cc.SpriteFrame, function (err, spriteFrame) {
      if (!err) {
        var iconSprite = phoneIconNode.addComponent(cc.Sprite);
        iconSprite.spriteFrame = spriteFrame;
        iconSprite.sizeMode = cc.Sprite.SizeMode.CUSTOM;
      }
    });

    // ==================== 手机号输入框 ====================
    // login_bg.png 中已包含输入框背景，只需放置透明的 EditBox
    // 注意：由于 panel 有缩放动画，EditBox 需要在动画完成后创建，否则点击区域位置不对
    var phoneInputNode = new cc.Node("PhoneInput");
    phoneInputNode.parent = panel;
    phoneInputNode.setContentSize(cc.size(inputWidth, inputHeight));
    phoneInputNode.setPosition(-phoneRowWidth / 2 + iconSize + 15 + inputWidth / 2, formY1);
    phoneInputNode.zIndex = 100;
    var phoneEditBox = null; // 延迟创建

    // ==================== 验证码输入行 ====================
    // 布局：[图标] [输入框] [获取验证码按钮] 整体居中
    var codeInputW = inputWidth - getCodeBtnWidth - 10; // 验证码输入框宽度
    var codeRowWidth = iconSize + 5 + codeInputW + 5 + getCodeBtnWidth; // 总宽度

    // 验证码图标
    var codeIconNode = new cc.Node("CodeIcon");
    codeIconNode.parent = panel;
    codeIconNode.setPosition(-codeRowWidth / 2 + iconSize / 2 + 10, formY2);
    codeIconNode.setContentSize(cc.size(iconSize, iconSize));
    cc.resources.load("UI/login/icon_shield", cc.SpriteFrame, function (err, spriteFrame) {
      if (!err) {
        var iconSprite = codeIconNode.addComponent(cc.Sprite);
        iconSprite.spriteFrame = spriteFrame;
        iconSprite.sizeMode = cc.Sprite.SizeMode.CUSTOM;
      }
    });

    // ==================== 验证码输入框 ====================
    // login_bg.png 中已包含输入框背景，只需放置透明的 EditBox
    // 注意：由于 panel 有缩放动画，EditBox 需要在动画完成后创建，否则点击区域位置不对
    var codeInputNode = new cc.Node("CodeInput");
    codeInputNode.parent = panel;
    codeInputNode.setContentSize(cc.size(codeInputW, inputHeight));
    codeInputNode.setPosition(-codeRowWidth / 2 + iconSize + 5 + codeInputW / 2, formY2);
    codeInputNode.zIndex = 100;
    var codeEditBox = null; // 延迟创建

    // 获取验证码按钮
    var getCodeBtn = new cc.Node("BtnGetCode");
    getCodeBtn.parent = panel;
    getCodeBtn.setContentSize(cc.size(getCodeBtnWidth, btnHeight));
    getCodeBtn.setPosition(codeRowWidth / 2 - getCodeBtnWidth / 2, formY2);
    var getCodeBtnComp = getCodeBtn.addComponent(cc.Button);
    getCodeBtnComp.transition = cc.Button.Transition.SCALE;
    getCodeBtnComp.zoomScale = 0.95;
    cc.resources.load("UI/login/get_mobile_code", cc.SpriteFrame, function (err, spriteFrame) {
      if (err) {
        console.warn("加载获取验证码按钮图片失败:", err);
        // 降级：使用纯色按钮
        var btnGfx = getCodeBtn.addComponent(cc.Graphics);
        btnGfx.fillColor = new cc.Color(255, 165, 0);
        btnGfx.roundRect(-getCodeBtnWidth / 2, -inputHeight / 2, getCodeBtnWidth, inputHeight, 5);
        btnGfx.fill();
        var btnLabel = new cc.Node("Label");
        btnLabel.parent = getCodeBtn;
        var labelComp = btnLabel.addComponent(cc.Label);
        labelComp.string = "获取验证码";
        labelComp.fontSize = 12 * scaleRatio;
        labelComp.horizontalAlign = cc.Label.HorizontalAlign.CENTER;
        btnLabel.color = new cc.Color(255, 255, 255);
        return;
      }
      var btnSprite = getCodeBtn.addComponent(cc.Sprite);
      btnSprite.spriteFrame = spriteFrame;
      btnSprite.sizeMode = cc.Sprite.SizeMode.CUSTOM;
      getCodeBtn.setContentSize(cc.size(getCodeBtnWidth, btnHeight));
    });

    // 倒计时状态
    var countdown = 0;
    var countdownLabel = null;

    // 开始倒计时
    var startCountdown = function startCountdown() {
      countdown = 60;
      getCodeBtnComp.interactable = false;
      getCodeBtn.opacity = 150;
      var tick = function tick() {
        countdown--;
        if (countdown <= 0) {
          getCodeBtnComp.interactable = true;
          getCodeBtn.opacity = 255;
          if (countdownLabel) {
            countdownLabel.string = "";
          }
        } else {
          if (!countdownLabel) {
            countdownLabel = new cc.Node("Countdown");
            countdownLabel.parent = getCodeBtn;
            countdownLabel.color = new cc.Color(255, 255, 255);
            var labelComp = countdownLabel.addComponent(cc.Label);
            labelComp.fontSize = 14 * scaleRatio;
            labelComp.horizontalAlign = cc.Label.HorizontalAlign.CENTER;
          }
          countdownLabel.getComponent(cc.Label).string = countdown + "s";
          self.scheduleOnce(tick, 1);
        }
      };
      self.scheduleOnce(tick, 1);
    };

    // ==================== 手机登录按钮 ====================
    // btn_mobile_login.png 原始尺寸: 340 x 50，宽高比 6.8:1
    var loginBtnY = formY2 - 70 * scaleRatio;
    var loginBtnHeight = 50 * scaleRatio; // 按钮高度
    var loginBtnWidth = loginBtnHeight * 6.8; // 按图片原始比例计算宽度 (340/50=6.8)

    var loginBtn = new cc.Node("BtnLogin");
    loginBtn.parent = panel;
    loginBtn.setContentSize(cc.size(loginBtnWidth, loginBtnHeight));
    loginBtn.setPosition(0, loginBtnY);

    // 尝试加载按钮图片
    cc.resources.load("UI/login/btn_mobile_login", cc.SpriteFrame, function (err, spriteFrame) {
      if (err) {
        // 降级：使用纯色按钮
        var loginGfx = loginBtn.addComponent(cc.Graphics);
        loginGfx.fillColor = new cc.Color(255, 140, 0);
        loginGfx.roundRect(-loginBtnWidth / 2, -loginBtnHeight / 2, loginBtnWidth, loginBtnHeight, 8 * scaleRatio);
        loginGfx.fill();
        return;
      }
      var loginSprite = loginBtn.addComponent(cc.Sprite);
      loginSprite.spriteFrame = spriteFrame;
      loginSprite.sizeMode = cc.Sprite.SizeMode.CUSTOM;
      loginBtn.setContentSize(cc.size(loginBtnWidth, loginBtnHeight));
    });
    var loginBtnComp = loginBtn.addComponent(cc.Button);
    loginBtnComp.transition = cc.Button.Transition.SCALE;
    loginBtnComp.zoomScale = 0.95;

    // ==================== 微信登录按钮 ====================
    // icon_wechat.png 原始尺寸: 48 x 48（正方形）
    var wxBtnY = loginBtnY - 155 * scaleRatio; // 往下移动更多
    var wxBtnSize = 48 * scaleRatio; // 使用图片原始尺寸 48

    var wxBtn = new cc.Node("BtnWechat");
    wxBtn.parent = panel;
    wxBtn.setContentSize(cc.size(wxBtnSize, wxBtnSize));
    wxBtn.setPosition(0, wxBtnY);

    // 尝试加载微信图标
    cc.resources.load("UI/login/icon_wechat", cc.SpriteFrame, function (err, spriteFrame) {
      if (err) {
        // 降级：使用绿色圆形背景
        var wxBgGfx = wxBtn.addComponent(cc.Graphics);
        wxBgGfx.fillColor = new cc.Color(7, 193, 96);
        wxBgGfx.circle(0, 0, wxBtnSize / 2);
        wxBgGfx.fill();
        return;
      }
      var wxSprite = wxBtn.addComponent(cc.Sprite);
      wxSprite.spriteFrame = spriteFrame;
      wxSprite.sizeMode = cc.Sprite.SizeMode.CUSTOM;
      wxBtn.setContentSize(cc.size(wxBtnSize, wxBtnSize));
    });
    var wxBtnComp = wxBtn.addComponent(cc.Button);
    wxBtnComp.transition = cc.Button.Transition.SCALE;
    wxBtnComp.zoomScale = 0.95;

    // 微信登录文字 - 隐藏
    // var wxLabel = new cc.Node("LabelWechat");
    // wxLabel.parent = panel;
    // wxLabel.setPosition(0, wxBtnY - 35 * scaleRatio);
    // var wxLabelComp = wxLabel.addComponent(cc.Label);
    // wxLabelComp.string = "微信登录";
    // wxLabelComp.fontSize = 12 * scaleRatio;
    // wxLabelComp.horizontalAlign = cc.Label.HorizontalAlign.CENTER;
    // wxLabel.color = new cc.Color(100, 80, 60);

    console.log("按钮位置: loginBtnY=" + loginBtnY.toFixed(0) + ", wxBtnY=" + wxBtnY.toFixed(0));

    // ==================== 消息提示（隐藏）====================
    var messageLabel = new cc.Node("MessageLabel");
    messageLabel.parent = panel;
    messageLabel.setPosition(0, -panelHeight / 2 + 50);
    var messageLabelComp = messageLabel.addComponent(cc.Label);
    messageLabelComp.string = "";
    messageLabelComp.fontSize = 14;
    messageLabelComp.horizontalAlign = cc.Label.HorizontalAlign.CENTER;
    messageLabel.active = false;

    // ==================== 弹窗进入动画 ====================
    cc.tween(panel).to(0.25, {
      scale: 1,
      opacity: 255
    }, {
      easing: 'backOut'
    }).call(function () {
      // Web 平台：直接创建原生 HTML input 元素
      if (cc.sys.isBrowser) {
        _createNativeInputElements(panel, phoneInputNode, codeInputNode, inputWidth, inputHeight, codeInputW, panelWidth, panelHeight);
      } else {
        // 非 Web 平台：使用 Cocos EditBox
        phoneEditBox = phoneInputNode.addComponent(cc.EditBox);
        phoneEditBox.placeholder = "请输入手机号";
        phoneEditBox.fontSize = 18;
        phoneEditBox.placeholderFontSize = 14;
        phoneEditBox.fontColor = new cc.Color(50, 50, 50, 255);
        phoneEditBox.placeholderFontColor = new cc.Color(150, 150, 150, 255);
        phoneEditBox.inputFlag = cc.EditBox.InputFlag.SENSITIVE;
        phoneEditBox.inputMode = cc.EditBox.InputMode.NUMERIC;
        phoneEditBox.maxLength = 11;
        phoneEditBox.backgroundColor = new cc.Color(0, 0, 0, 0);
        codeEditBox = codeInputNode.addComponent(cc.EditBox);
        codeEditBox.placeholder = "验证码";
        codeEditBox.fontSize = 18;
        codeEditBox.placeholderFontSize = 14;
        codeEditBox.fontColor = new cc.Color(50, 50, 50, 255);
        codeEditBox.placeholderFontColor = new cc.Color(150, 150, 150, 255);
        codeEditBox.inputFlag = cc.EditBox.InputFlag.SENSITIVE;
        codeEditBox.inputMode = cc.EditBox.InputMode.NUMERIC;
        codeEditBox.maxLength = 6;
        codeEditBox.backgroundColor = new cc.Color(0, 0, 0, 0);
      }
      console.log("输入框创建完成");
    }).start();

    // ==================== 功能逻辑 ====================
    var phone = "";
    var code = "";

    // 获取输入值的辅助函数（支持原生 HTML input）
    var getInputValue = function getInputValue(inputId) {
      if (cc.sys.isBrowser) {
        var input = document.getElementById(inputId);
        return input ? input.value : "";
      }
      return "";
    };

    // 验证手机号
    var validatePhone = function validatePhone(phone) {
      if (!phone || phone.length !== 11) return false;
      return /^1[3-9]\d{9}$/.test(phone);
    };

    // 显示消息
    var showMessage = function showMessage(msg, isError) {
      messageLabel.active = true;
      messageLabelComp.string = msg;
      messageLabel.color = isError ? new cc.Color(255, 80, 80) : new cc.Color(100, 200, 100);
    };

    // 获取验证码 - onGetCode()
    getCodeBtn.on(cc.Node.EventType.TOUCH_END, function () {
      // 支持原生 HTML input 或 Cocos EditBox
      if (cc.sys.isBrowser) {
        phone = getInputValue('native-phone-input');
      } else if (phoneEditBox) {
        phone = phoneEditBox.string || "";
      }
      if (!validatePhone(phone)) {
        showMessage("请输入正确的手机号", true);
        return;
      }
      var defines = window.defines;
      if (!defines || !defines.apiUrl) {
        showMessage("验证码已发送(测试)", false);
        startCountdown();
        return;
      }

      // 使用加密请求发送验证码
      var HttpAPI = window.HttpAPI;
      if (HttpAPI && defines.cryptoKey) {
        HttpAPI.postEncrypted(defines.apiUrl + '/api/v1/auth/send-code', 'send_code', {
          phone: phone
        }, defines.cryptoKey, function (err, resp) {
          if (err) {
            showMessage(err || "发送失败", true);
            return;
          }
          if (resp && resp.code === 0) {
            showMessage("验证码已发送", false);
            startCountdown();
          } else {
            showMessage(resp.message || "发送失败", true);
          }
        });
      } else {
        // 降级：使用明文请求
        var xhr = new XMLHttpRequest();
        xhr.open('POST', defines.apiUrl + '/api/v1/auth/send-code', true);
        xhr.setRequestHeader('Content-Type', 'application/json');
        xhr.timeout = 10000;
        xhr.onreadystatechange = function () {
          if (xhr.readyState === 4) {
            if (xhr.status >= 200 && xhr.status < 300) {
              try {
                var resp = JSON.parse(xhr.responseText);
                if (resp.code === 0) {
                  showMessage("验证码已发送", false);
                  startCountdown();
                } else {
                  showMessage(resp.message || "发送失败", true);
                }
              } catch (e) {
                showMessage("解析响应失败", true);
              }
            } else {
              showMessage("网络请求失败", true);
            }
          }
        };
        xhr.send(JSON.stringify({
          phone: phone
        }));
      }
    });

    // 手机登录 - onPhoneLogin()
    loginBtn.on(cc.Node.EventType.TOUCH_END, function () {
      // 支持原生 HTML input 或 Cocos EditBox
      if (cc.sys.isBrowser) {
        phone = getInputValue('native-phone-input');
        code = getInputValue('native-code-input');
      } else {
        if (phoneEditBox) phone = phoneEditBox.string || "";
        if (codeEditBox) code = codeEditBox.string || "";
      }
      if (!validatePhone(phone)) {
        showMessage("请输入正确的手机号", true);
        return;
      }
      showMessage("正在登录...", false);
      var defines = window.defines;
      if (!defines || !defines.apiUrl) {
        // 无API配置，模拟登录成功
        if (window.myglobal) {
          var loginData = {
            uniqueID: "phone_" + phone,
            accountID: "phone_" + phone,
            nickName: "玩家" + phone.substr(-4),
            avatarUrl: "",
            goldCount: 1000,
            token: "test_token_" + Date.now(),
            phone: phone,
            loginType: 1
          };
          window.myglobal.onLoginSuccess(loginData);
        }
        showMessage("登录成功", false);
        self.scheduleOnce(function () {
          _removeNativeInputElements();
          popup.destroy();
          cc.director.loadScene("hallScene");
        }, 0.5);
        return;
      }

      // 使用加密请求登录
      var HttpAPI = window.HttpAPI;
      if (HttpAPI && defines.cryptoKey) {
        HttpAPI.postEncrypted(defines.apiUrl + '/api/v1/auth/phone-login', 'phone_login', {
          phone: phone,
          code: code
        }, defines.cryptoKey, function (err, resp) {
          if (err) {
            showMessage(err || "登录失败", true);
            return;
          }
          if (resp && resp.code === 0 && resp.data) {
            showMessage("登录成功", false);
            // 使用 myglobal.onLoginSuccess 保存登录状态
            if (window.myglobal) {
              var loginData = {
                uniqueID: resp.data.uniqueID || "",
                accountID: resp.data.accountID || "",
                nickName: resp.data.nickName || "玩家",
                avatarUrl: resp.data.avatarUrl || "",
                goldCount: resp.data.goldcount || 0,
                token: resp.data.token || "",
                phone: phone,
                loginType: 1
              };
              window.myglobal.onLoginSuccess(loginData);
            }
            self.scheduleOnce(function () {
              _removeNativeInputElements();
              popup.destroy();
              cc.director.loadScene("hallScene");
            }, 0.5);
          } else {
            showMessage(resp.message || "登录失败", true);
          }
        });
      } else {
        // 降级：使用明文请求
        var xhr = new XMLHttpRequest();
        xhr.open('POST', defines.apiUrl + '/api/v1/auth/phone-login', true);
        xhr.setRequestHeader('Content-Type', 'application/json');
        xhr.setRequestHeader('X-Device-ID', 'web_' + Date.now());
        xhr.setRequestHeader('X-Device-Type', 'Web Browser');
        xhr.timeout = 10000;
        xhr.onreadystatechange = function () {
          if (xhr.readyState === 4) {
            if (xhr.status >= 200 && xhr.status < 300) {
              try {
                var resp = JSON.parse(xhr.responseText);
                if (resp.code === 0 && resp.data) {
                  showMessage("登录成功", false);
                  // 使用 myglobal.onLoginSuccess 保存登录状态
                  if (window.myglobal) {
                    var loginData = {
                      uniqueID: resp.data.uniqueID || resp.data.player_id || "",
                      accountID: resp.data.accountID || resp.data.account_id || "",
                      nickName: resp.data.nickName || resp.data.nickname || "玩家",
                      avatarUrl: resp.data.avatarUrl || resp.data.avatar || "",
                      goldCount: resp.data.goldcount || resp.data.gold || 0,
                      token: resp.data.token || "",
                      phone: phone,
                      loginType: 1
                    };
                    window.myglobal.onLoginSuccess(loginData);
                  }
                  self.scheduleOnce(function () {
                    _removeNativeInputElements();
                    popup.destroy();
                    cc.director.loadScene("hallScene");
                  }, 0.5);
                } else {
                  showMessage(resp.message || "登录失败", true);
                }
              } catch (e) {
                showMessage("解析响应失败", true);
              }
            } else {
              showMessage("网络请求失败", true);
            }
          }
        };
        xhr.send(JSON.stringify({
          phone: phone,
          code: code
        }));
      }
    });

    // 微信登录 - onWechatLogin()
    wxBtn.on(cc.Node.EventType.TOUCH_END, function () {
      showMessage("正在登录...", false);
      var defines = window.defines;
      if (!defines || !defines.apiUrl) {
        // 无API配置，模拟登录成功
        if (window.myglobal) {
          var loginData = {
            uniqueID: "wx_" + Date.now(),
            accountID: "wx_" + Date.now(),
            nickName: "微信用户",
            avatarUrl: "",
            goldCount: 1000,
            token: "test_wx_token_" + Date.now(),
            loginType: 2
          };
          window.myglobal.onLoginSuccess(loginData);
        }
        showMessage("登录成功", false);
        self.scheduleOnce(function () {
          _removeNativeInputElements();
          popup.destroy();
          cc.director.loadScene("hallScene");
        }, 0.5);
        return;
      }

      // 使用加密请求微信登录
      var HttpAPI = window.HttpAPI;
      if (HttpAPI && defines.cryptoKey) {
        HttpAPI.postEncrypted(defines.apiUrl + '/api/v1/auth/wx-login', 'wx_login', {
          code: "test_code_" + Date.now()
        }, defines.cryptoKey, function (err, resp) {
          if (err) {
            showMessage(err || "登录失败", true);
            return;
          }
          if (resp && resp.code === 0 && resp.data) {
            showMessage("登录成功", false);
            if (window.myglobal && window.myglobal.playerData) {
              window.myglobal.playerData.uniqueID = resp.data.uniqueID || "";
              window.myglobal.playerData.accountID = resp.data.accountID || "";
              window.myglobal.playerData.nickName = resp.data.nickName || "微信用户";
              window.myglobal.playerData.userName = resp.data.username || "";
              window.myglobal.playerData.avatar = resp.data.avatarUrl || "";
              window.myglobal.playerData.gobal_count = resp.data.goldCount || 0;
              window.myglobal.playerData.token = resp.data.token || "";
              // 保存到本地存储
              window.myglobal.playerData.saveToLocal();
              console.log("【微信登录】用户数据已保存, nickName =", window.myglobal.playerData.nickName);
            }
            self.scheduleOnce(function () {
              _removeNativeInputElements();
              popup.destroy();
              cc.director.loadScene("hallScene");
            }, 0.5);
          } else {
            showMessage(resp.message || "登录失败", true);
          }
        });
      } else {
        // 降级：使用明文请求
        var xhr = new XMLHttpRequest();
        xhr.open('POST', defines.apiUrl + '/api/v1/auth/wx-login', true);
        xhr.setRequestHeader('Content-Type', 'application/json');
        xhr.timeout = 10000;
        xhr.onreadystatechange = function () {
          if (xhr.readyState === 4) {
            if (xhr.status >= 200 && xhr.status < 300) {
              try {
                var resp = JSON.parse(xhr.responseText);
                if (resp.code === 0 && resp.data) {
                  showMessage("登录成功", false);
                  if (window.myglobal && window.myglobal.playerData) {
                    window.myglobal.playerData.uniqueID = resp.data.player_id || "";
                    window.myglobal.playerData.accountID = resp.data.account_id || "";
                    window.myglobal.playerData.nickName = resp.data.nickname || "微信用户";
                    window.myglobal.playerData.userName = resp.data.username || "";
                    window.myglobal.playerData.avatar = resp.data.avatar || "";
                    window.myglobal.playerData.gobal_count = resp.data.gold || 0;
                    window.myglobal.playerData.token = resp.data.token || "";
                    // 保存到本地存储
                    window.myglobal.playerData.saveToLocal();
                    console.log("【微信登录XHR】用户数据已保存, nickName =", window.myglobal.playerData.nickName);
                  }
                  self.scheduleOnce(function () {
                    _removeNativeInputElements();
                    popup.destroy();
                    cc.director.loadScene("hallScene");
                  }, 0.5);
                } else {
                  showMessage(resp.message || "登录失败", true);
                }
              } catch (e) {
                showMessage("解析响应失败", true);
              }
            } else {
              showMessage("网络请求失败", true);
            }
          }
        };
        xhr.send(JSON.stringify({
          code: "test_code_" + Date.now()
        }));
      }
    });
    return popup;
  },
  _showUserAgreementPopup: function _showUserAgreementPopup() {
    this._createAgreementPopup();
  },
  // 创建用户协议弹窗
  _createAgreementPopup: function _createAgreementPopup() {
    var self = this;

    // ==================== 弹窗根节点 ====================
    var popup = new cc.Node("user_agreement_popup");
    popup.parent = this.node;
    popup.setContentSize(cc.size(1280, 720));
    popup.setPosition(0, 0);
    popup.zIndex = 1000;

    // ==================== 半透明黑色背景遮罩 ====================
    var bgMask = new cc.Node("bg_mask");
    bgMask.parent = popup;
    bgMask.setContentSize(cc.size(1280, 720));
    bgMask.setPosition(0, 0);
    var bgMaskSprite = bgMask.addComponent(cc.Sprite);
    bgMaskSprite.sizeMode = cc.Sprite.SizeMode.CUSTOM;
    bgMask.color = new cc.Color(0, 0, 0);
    bgMask.opacity = 180;

    // ==================== 主面板 ====================
    var panel = new cc.Node("content_panel");
    panel.parent = popup;
    panel.setContentSize(cc.size(900, 520));
    panel.setPosition(0, 0);
    var panelSprite = panel.addComponent(cc.Sprite);
    panelSprite.sizeMode = cc.Sprite.SizeMode.CUSTOM;
    panel.color = new cc.Color(255, 250, 240);

    // 加载背景图片
    cc.resources.load("images/user_agreement_bg", cc.SpriteFrame, function (err, spriteFrame) {
      if (!err && spriteFrame) {
        panelSprite.spriteFrame = spriteFrame;
      }
    });

    // ==================== 标题 ====================
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

    // ==================== 关闭按钮 ====================
    var closeBtn = new cc.Node("close_btn");
    closeBtn.parent = panel;
    closeBtn.setContentSize(cc.size(60, 60));
    closeBtn.setPosition(400, 230);
    var closeBtnBg = new cc.Node("bg");
    closeBtnBg.parent = closeBtn;
    closeBtnBg.setContentSize(cc.size(50, 50));
    closeBtnBg.setPosition(0, 0);
    var closeBgSprite = closeBtnBg.addComponent(cc.Sprite);
    closeBgSprite.sizeMode = cc.Sprite.SizeMode.CUSTOM;
    closeBtnBg.color = new cc.Color(255, 255, 255);
    var closeLabelNode = new cc.Node("x");
    closeLabelNode.parent = closeBtn;
    closeLabelNode.setPosition(0, 0);
    var closeLabel = closeLabelNode.addComponent(cc.Label);
    closeLabel.string = "×";
    closeLabel.fontSize = 40;
    closeLabel.lineHeight = 50;
    closeLabel.horizontalAlign = cc.Label.HorizontalAlign.CENTER;
    closeLabelNode.color = new cc.Color(80, 80, 80);
    var closeBtnComp = closeBtn.addComponent(cc.Button);
    closeBtnComp.transition = cc.Button.Transition.SCALE;
    closeBtnComp.zoomScale = 1.2;
    closeBtnComp.interactable = true;
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
    // 整体上移，增加底部空间，添加滚动功能
    var scrollNode = new cc.Node("scroll_view");
    scrollNode.parent = panel;
    scrollNode.setContentSize(cc.size(820, 380)); // 调整宽度
    scrollNode.setPosition(0, 0); // 上移

    // 添加 ScrollView 组件实现滚动功能
    var scrollView = scrollNode.addComponent(cc.ScrollView);
    scrollView.horizontal = false; // 禁用水平滚动
    scrollView.vertical = true; // 启用垂直滚动
    scrollView.inertia = true; // 滚动惯性
    scrollView.elastic = true; // 弹性效果

    var viewNode = new cc.Node("view");
    viewNode.parent = scrollNode;
    viewNode.setContentSize(cc.size(820, 380)); // 调整宽度
    viewNode.setPosition(0, 0);
    var mask = viewNode.addComponent(cc.Mask);
    mask.type = cc.Mask.Type.RECT;
    var contentNode = new cc.Node("content");
    contentNode.parent = viewNode;
    contentNode.anchorX = 0.5;
    contentNode.anchorY = 1;
    contentNode.setPosition(0, 190); // 居中对齐
    contentNode.setContentSize(cc.size(820, 800)); // 增加高度以容纳所有内容

    // 设置 ScrollView 的 content 属性
    scrollView.content = contentNode;
    var richTextNode = new cc.Node("rich_text");
    richTextNode.parent = contentNode;
    richTextNode.anchorX = 0;
    richTextNode.anchorY = 1;
    richTextNode.setPosition(-385, -15); // 增加左边距，文字整体上移

    var richText = richTextNode.addComponent(cc.RichText);
    richText.fontSize = 16; // 字号加大：14 -> 16
    richText.lineHeight = 26; // 行高加大：24 -> 26
    richText.maxWidth = 760; // 调整宽度，确保左右边距

    // 设置文字颜色为黑色
    var agreementText = "<b><color=#000000>用户协议</color></b>\n\n" + "<color=#000000>欢迎使用本游戏！在使用前，请仔细阅读以下协议：</color>\n\n" + "<b><color=#000000>一、服务条款</color></b>\n" + "<color=#000000>1. 用户应遵守国家法律法规，文明游戏。</color>\n" + "<color=#000000>2. 禁止使用外挂、作弊软件等破坏游戏公平性的行为。</color>\n" + "<color=#000000>3. 用户账号安全由用户自行负责，请妥善保管账号密码。</color>\n\n" + "<b><color=#000000>二、隐私政策</color></b>\n" + "<color=#000000>1. 我们会收集必要的用户信息用于提供服务。</color>\n" + "<color=#000000>2. 我们承诺保护用户隐私，不会向第三方泄露用户信息。</color>\n" + "<color=#000000>3. 用户有权要求删除个人数据。</color>\n\n" + "<b><color=#000000>三、免责声明</color></b>\n" + "<color=#000000>1. 因不可抗力导致的服务中断，我们不承担责任。</color>\n" + "<color=#000000>2. 用户因违规操作造成的损失，由用户自行承担。</color>\n\n" + "<color=#000000>如有疑问，请联系客服。</color>";
    richText.string = agreementText;

    // 滚动到顶部
    scrollView.scrollToTop(0);
    this._userAgreementPopup = popup;
  },
  _closeUserAgreementPopup: function _closeUserAgreementPopup() {
    if (this._userAgreementPopup) {
      this._userAgreementPopup.destroy();
      this._userAgreementPopup = null;
    }
  },
  // 销毁时清理
  onDestroy: function onDestroy() {
    this._removeGlobalTouchForMusic();
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImFzc2V0c1xcc2NyaXB0c1xcbG9naW5zY2VuZVxcbG9naW5TY2VuZS5qcyJdLCJuYW1lcyI6WyJfZ2xvYmFsU3R5bGVGaXhBcHBsaWVkIiwiX2ZpeEVkaXRCb3hTdHlsZSIsImVkaXRCb3giLCJmb250Q29sb3IiLCJiZ0NvbG9yIiwiY2MiLCJzeXMiLCJpc0Jyb3dzZXIiLCJfYXBwbHlJbnB1dFN0eWxlcyIsInNldFRpbWVvdXQiLCJfaW5qZWN0R2xvYmFsU3R5bGVzIiwiaW5wdXRzIiwiZG9jdW1lbnQiLCJxdWVyeVNlbGVjdG9yQWxsIiwiaSIsImxlbmd0aCIsImlucHV0IiwiX3N0eWxlU2luZ2xlSW5wdXQiLCJ0ZXh0YXJlYXMiLCJqIiwiZSIsImNvbnNvbGUiLCJlcnJvciIsImlkIiwic3R5bGUiLCJzZXRQcm9wZXJ0eSIsImNvbG9yIiwiYmFja2dyb3VuZENvbG9yIiwiZGlzcGxheSIsImFsaWduSXRlbXMiLCJqdXN0aWZ5Q29udGVudCIsImJveFNpemluZyIsInBhZGRpbmciLCJsaW5lSGVpZ2h0IiwiaGVpZ2h0IiwiZm9udFNpemUiLCJ3ZWJraXRUZXh0RmlsbENvbG9yIiwib3BhY2l0eSIsInZpc2liaWxpdHkiLCJjYXJldENvbG9yIiwidGV4dFNoYWRvdyIsIm91dGxpbmUiLCJib3JkZXIiLCJyZW1vdmVQcm9wZXJ0eSIsInN0eWxlSWQiLCJnZXRFbGVtZW50QnlJZCIsImNzcyIsImNyZWF0ZUVsZW1lbnQiLCJ0eXBlIiwiYXBwZW5kQ2hpbGQiLCJjcmVhdGVUZXh0Tm9kZSIsImhlYWQiLCJfY3JlYXRlTmF0aXZlSW5wdXRFbGVtZW50cyIsInBhbmVsIiwicGhvbmVJbnB1dE5vZGUiLCJjb2RlSW5wdXROb2RlIiwiaW5wdXRXaWR0aCIsImlucHV0SGVpZ2h0IiwiY29kZUlucHV0VyIsInBhbmVsV2lkdGgiLCJwYW5lbEhlaWdodCIsImNhbnZhcyIsInF1ZXJ5U2VsZWN0b3IiLCJjYW52YXNSZWN0IiwiZ2V0Qm91bmRpbmdDbGllbnRSZWN0Iiwid2luU2l6ZSIsImxvZyIsImxlZnQiLCJ0b3AiLCJ3aWR0aCIsInNjYWxlWCIsInNjYWxlWSIsInRvRml4ZWQiLCJwaG9uZVdvcmxkUG9zIiwiY29udmVydFRvV29ybGRTcGFjZUFSIiwidjIiLCJjb2RlV29ybGRQb3MiLCJ4IiwieSIsInBob25lT2Zmc2V0WCIsInBob25lT2Zmc2V0WSIsImNvZGVPZmZzZXRYIiwiY29kZU9mZnNldFkiLCJhY3R1YWxJbnB1dFdpZHRoIiwiYWN0dWFsSW5wdXRIZWlnaHQiLCJhY3R1YWxDb2RlSW5wdXRXaWR0aCIsImNhbGNTY3JlZW5Qb3NGcm9tV29ybGQiLCJ3b3JsZFBvcyIsIm5vZGVXaWR0aCIsIm5vZGVIZWlnaHQiLCJvZmZzZXRYIiwib2Zmc2V0WSIsInNjcmVlblgiLCJzY3JlZW5ZIiwiY2FudmFzWCIsImNhbnZhc1kiLCJhY3R1YWxXaWR0aCIsImFjdHVhbEhlaWdodCIsInBob25lU2NyZWVuIiwiY29kZVNjcmVlbiIsIk1hdGgiLCJtYXgiLCJtaW4iLCJvbGRDb250YWluZXIiLCJyZW1vdmUiLCJjb250YWluZXIiLCJjc3NUZXh0Iiwiam9pbiIsImJvZHkiLCJwaG9uZUlucHV0IiwicGxhY2Vob2xkZXIiLCJtYXhMZW5ndGgiLCJjb2RlSW5wdXQiLCJhZGRFdmVudExpc3RlbmVyIiwicGhvbmVDaGVjayIsImNvZGVDaGVjayIsInJlY3QiLCJfcmVtb3ZlTmF0aXZlSW5wdXRFbGVtZW50cyIsIl9maXhFZGl0Qm94SW5wdXRFbGVtZW50cyIsInBob25lRWRpdEJveCIsImNvZGVFZGl0Qm94Iiwid29ybGRUb1NjcmVlbiIsInBob25lU2NyZWVuUG9zIiwicG9zaXRpb24iLCJ6SW5kZXgiLCJwb2ludGVyRXZlbnRzIiwiY3Vyc29yIiwiYmFja2dyb3VuZCIsImJvcmRlclJhZGl1cyIsImNvZGVTY3JlZW5Qb3MiLCJfc3RhcnRJbnB1dE9ic2VydmVyIiwib2JzZXJ2ZXIiLCJNdXRhdGlvbk9ic2VydmVyIiwibXV0YXRpb25zIiwiZm9yRWFjaCIsIm11dGF0aW9uIiwiYWRkZWROb2RlcyIsIm5vZGUiLCJub2RlTmFtZSIsImlucCIsIm9ic2VydmUiLCJjaGlsZExpc3QiLCJzdWJ0cmVlIiwid2FybiIsIkNsYXNzIiwibmFtZSIsIkNvbXBvbmVudCIsInByb3BlcnRpZXMiLCJ3YWl0X25vZGUiLCJOb2RlIiwidXNlcl9hZ3JlZW1lbnRfcHJlZmFicyIsIlByZWZhYiIsInBob25lX2xvZ2luX3ByZWZhYiIsIm9uTG9hZCIsInNlbGYiLCJ2aWV3IiwiZW5hYmxlQXV0b0Z1bGxTY3JlZW4iLCJzY3JlZW4iLCJkaXNhYmxlQXV0b0Z1bGxTY3JlZW4iLCJfaXNBZ3JlZW1lbnRDaGVja2VkIiwiX3Bob25lTG9naW5Qb3B1cFNob3dpbmciLCJfaW5pdFdhaXROb2RlIiwiX2luaXRDaGVja2JveCIsIl9pbml0TG9naW5CdXR0b25zIiwiX2luaXRVc2VyQWdyZWVtZW50TGluayIsIl9wcmVsb2FkU2NlbmVzIiwiX2NoZWNrQXV0b0xvZ2luIiwid2luZG93IiwibXlnbG9iYWwiLCJfd2FpdEZvck15Z2xvYmFsIiwiX2luaXRBbmRTdGFydCIsIndhc0ZvcmNlTG9nZ2VkT3V0IiwiX3Nob3dFcnJvciIsImdldEZvcmNlTG9nb3V0UmVhc29uIiwiaGFzTG9jYWxTZXNzaW9uIiwidmVyaWZ5VG9rZW4iLCJ2YWxpZCIsIm1lc3NhZ2UiLCJyZWNvbm5lY3RJbmZvIiwic29ja2V0IiwibG9hZFJlY29ubmVjdEluZm8iLCJ0b2tlbiIsInBsYXllcklkIiwicm9vbUNvZGUiLCJzY2hlZHVsZU9uY2UiLCJpbml0U29ja2V0Iiwib25Sb29tUmVzdG9yZWQiLCJkYXRhIiwiZGlyZWN0b3IiLCJsb2FkU2NlbmUiLCJldnQiLCJldmVudExpc3RlciIsIm9uIiwiX2xvYWRpbmdJbWFnZSIsImdldENoaWxkQnlOYW1lIiwibGJsTm9kZSIsIl93YWl0TGFiZWwiLCJnZXRDb21wb25lbnQiLCJMYWJlbCIsImFjdGl2ZSIsImNoZWNrTWFya05vZGUiLCJfY2hlY2tNYXJrTm9kZSIsImNoZWNrbWFyayIsIl9jaGVja21hcmtJY29uIiwiYnV0dG9uIiwiQnV0dG9uIiwiZW5hYmxlZCIsIm9mZiIsIkV2ZW50VHlwZSIsIlRPVUNIX0VORCIsImV2ZW50IiwiX3RvZ2dsZUNoZWNrYm94Iiwic3RhcnQiLCJwaG9uZUxvZ2luTm9kZSIsImhhc1RvdWNoTGlzdGVuZXJzIiwic3RvcFByb3BhZ2F0aW9uIiwiX2RvUGhvbmVMb2dpbiIsInd4TG9naW5Ob2RlIiwiX2RvV3hMb2dpbiIsImNoaWxkcmVuIiwiaW50ZXJhY3RhYmxlIiwiY2xpY2tFdmVudHMiLCJoYW5kbGVyIiwiRXZlbnRIYW5kbGVyIiwidGFyZ2V0IiwiY29tcG9uZW50IiwiY3VzdG9tRXZlbnREYXRhIiwicHVzaCIsImxpbmtOb2RlIiwiX29uV3hMb2dpbkNsaWNrIiwiX29uUGhvbmVMb2dpbkNsaWNrIiwiX29uVXNlckFncmVlbWVudExpbmtDbGljayIsIl9zaG93VXNlckFncmVlbWVudFBvcHVwIiwiX2NoZWNrQWdyZWVtZW50IiwicHJlbG9hZFNjZW5lIiwiZXJyIiwiYXR0ZW1wdHMiLCJjaGVjayIsImluaXQiLCJfc2hvd0xvYWRpbmciLCJwbGF5ZXJEYXRhIiwicGxheWVyX2lkIiwibmlja05hbWUiLCJwbGF5ZXJfbmFtZSIsInNhdmVUb0xvY2FsIiwiZ29iYWxfY291bnQiLCJnb2xkIiwiX2luaXRCYWNrZ3JvdW5kTXVzaWMiLCJpc29wZW5fc291bmQiLCJfbXVzaWNQbGF5aW5nIiwiX3RvdWNoTGlzdGVuZXJBZGRlZCIsInJlc291cmNlcyIsImxvYWQiLCJBdWRpb0NsaXAiLCJjbGlwIiwiX3NldHVwR2xvYmFsVG91Y2hGb3JNdXNpYyIsIl9iZ011c2ljQ2xpcCIsImF1ZGlvRW5naW5lIiwicGxheU11c2ljIiwiX3JlbW92ZUdsb2JhbFRvdWNoRm9yTXVzaWMiLCJfcGxheU11c2ljT25Ub3VjaCIsImlzTXVzaWNQbGF5aW5nIiwiX2NvY29zVG91Y2hIYW5kbGVyIiwiVE9VQ0hfU1RBUlQiLCJfYnJvd3NlclRvdWNoSGFuZGxlciIsInJlbW92ZUV2ZW50TGlzdGVuZXIiLCJfc2hvd1dhaXROb2RlIiwiX2hpZGVXYWl0Tm9kZSIsInNob3ciLCJzdHJpbmciLCJfaXNBbmltYXRpbmciLCJfZHJhd0lucHV0QmciLCJncmFwaGljcyIsInJhZGl1cyIsInJvdW5kUmVjdCIsInVwZGF0ZSIsImR0IiwiYW5nbGUiLCJyZXF1ZXN0X3d4TG9naW4iLCJ1bmlxdWVJRCIsImFjY291bnRJRCIsImF2YXRhclVybCIsInJlc3VsdCIsImdvbGRjb3VudCIsIl9zaG93UGhvbmVMb2dpblBvcHVwIiwiX2NyZWF0ZVBob25lTG9naW5Qb3B1cCIsInByZWZhYiIsInBvcHVwIiwiX2NyZWF0ZVBob25lTG9naW5EeW5hbWljIiwiX3Bob25lTG9naW5Qb3B1cCIsIndpblciLCJ3aW5IIiwiaW1nV2lkdGgiLCJpbWdIZWlnaHQiLCJzY2FsZSIsInBhcmVudCIsInNldENvbnRlbnRTaXplIiwic2l6ZSIsInNldFBvc2l0aW9uIiwiYWRkQ29tcG9uZW50IiwiQmxvY2tJbnB1dEV2ZW50cyIsIm1hc2siLCJtYXNrU3ByaXRlIiwiU3ByaXRlIiwic2l6ZU1vZGUiLCJTaXplTW9kZSIsIkNVU1RPTSIsIkNvbG9yIiwidHdlZW4iLCJ0byIsImVhc2luZyIsImNhbGwiLCJkZXN0cm95IiwiYmciLCJiZ1Nwcml0ZSIsInNyY0JsZW5kRmFjdG9yIiwibWFjcm8iLCJCbGVuZEZhY3RvciIsIlNSQ19BTFBIQSIsImRzdEJsZW5kRmFjdG9yIiwiT05FX01JTlVTX1NSQ19BTFBIQSIsIlNwcml0ZUZyYW1lIiwic3ByaXRlRnJhbWUiLCJyZW1vdmVDb21wb25lbnQiLCJiZ0dmeCIsIkdyYXBoaWNzIiwiZmlsbENvbG9yIiwiZmlsbCIsInRpdGxlTm9kZSIsInRpdGxlTGFiZWwiLCJob3Jpem9udGFsQWxpZ24iLCJIb3Jpem9udGFsQWxpZ24iLCJDRU5URVIiLCJ0aXRsZU91dGxpbmUiLCJMYWJlbE91dGxpbmUiLCJjbG9zZUJ0biIsImNsb3NlR2Z4IiwiY2lyY2xlIiwic3Ryb2tlQ29sb3IiLCJsaW5lV2lkdGgiLCJzdHJva2UiLCJjbG9zZVgiLCJjbG9zZVhMYWJlbCIsInNjYWxlUmF0aW8iLCJpY29uU2l6ZSIsImZvcm1ZMSIsImZvcm1ZMiIsImdldENvZGVCdG5XaWR0aCIsImJ0bkhlaWdodCIsInBob25lUm93V2lkdGgiLCJwaG9uZVJvd1giLCJwaG9uZUljb25Ob2RlIiwiaWNvblNwcml0ZSIsImNvZGVSb3dXaWR0aCIsImNvZGVJY29uTm9kZSIsImdldENvZGVCdG4iLCJnZXRDb2RlQnRuQ29tcCIsInRyYW5zaXRpb24iLCJUcmFuc2l0aW9uIiwiU0NBTEUiLCJ6b29tU2NhbGUiLCJidG5HZngiLCJidG5MYWJlbCIsImxhYmVsQ29tcCIsImJ0blNwcml0ZSIsImNvdW50ZG93biIsImNvdW50ZG93bkxhYmVsIiwic3RhcnRDb3VudGRvd24iLCJ0aWNrIiwibG9naW5CdG5ZIiwibG9naW5CdG5IZWlnaHQiLCJsb2dpbkJ0bldpZHRoIiwibG9naW5CdG4iLCJsb2dpbkdmeCIsImxvZ2luU3ByaXRlIiwibG9naW5CdG5Db21wIiwid3hCdG5ZIiwid3hCdG5TaXplIiwid3hCdG4iLCJ3eEJnR2Z4Iiwid3hTcHJpdGUiLCJ3eEJ0bkNvbXAiLCJtZXNzYWdlTGFiZWwiLCJtZXNzYWdlTGFiZWxDb21wIiwiRWRpdEJveCIsInBsYWNlaG9sZGVyRm9udFNpemUiLCJwbGFjZWhvbGRlckZvbnRDb2xvciIsImlucHV0RmxhZyIsIklucHV0RmxhZyIsIlNFTlNJVElWRSIsImlucHV0TW9kZSIsIklucHV0TW9kZSIsIk5VTUVSSUMiLCJwaG9uZSIsImNvZGUiLCJnZXRJbnB1dFZhbHVlIiwiaW5wdXRJZCIsInZhbHVlIiwidmFsaWRhdGVQaG9uZSIsInRlc3QiLCJzaG93TWVzc2FnZSIsIm1zZyIsImlzRXJyb3IiLCJkZWZpbmVzIiwiYXBpVXJsIiwiSHR0cEFQSSIsImNyeXB0b0tleSIsInBvc3RFbmNyeXB0ZWQiLCJyZXNwIiwieGhyIiwiWE1MSHR0cFJlcXVlc3QiLCJvcGVuIiwic2V0UmVxdWVzdEhlYWRlciIsInRpbWVvdXQiLCJvbnJlYWR5c3RhdGVjaGFuZ2UiLCJyZWFkeVN0YXRlIiwic3RhdHVzIiwiSlNPTiIsInBhcnNlIiwicmVzcG9uc2VUZXh0Iiwic2VuZCIsInN0cmluZ2lmeSIsImxvZ2luRGF0YSIsInN1YnN0ciIsImdvbGRDb3VudCIsIkRhdGUiLCJub3ciLCJsb2dpblR5cGUiLCJvbkxvZ2luU3VjY2VzcyIsImFjY291bnRfaWQiLCJuaWNrbmFtZSIsImF2YXRhciIsInVzZXJOYW1lIiwidXNlcm5hbWUiLCJfY3JlYXRlQWdyZWVtZW50UG9wdXAiLCJiZ01hc2siLCJiZ01hc2tTcHJpdGUiLCJwYW5lbFNwcml0ZSIsImNsb3NlQnRuQmciLCJjbG9zZUJnU3ByaXRlIiwiY2xvc2VMYWJlbE5vZGUiLCJjbG9zZUxhYmVsIiwiY2xvc2VCdG5Db21wIiwiY2xvc2VIYW5kbGVyIiwiZGl2aWRlckxpbmUiLCJkaXZpZGVyU3ByaXRlIiwic2Nyb2xsTm9kZSIsInNjcm9sbFZpZXciLCJTY3JvbGxWaWV3IiwiaG9yaXpvbnRhbCIsInZlcnRpY2FsIiwiaW5lcnRpYSIsImVsYXN0aWMiLCJ2aWV3Tm9kZSIsIk1hc2siLCJUeXBlIiwiUkVDVCIsImNvbnRlbnROb2RlIiwiYW5jaG9yWCIsImFuY2hvclkiLCJjb250ZW50IiwicmljaFRleHROb2RlIiwicmljaFRleHQiLCJSaWNoVGV4dCIsIm1heFdpZHRoIiwiYWdyZWVtZW50VGV4dCIsInNjcm9sbFRvVG9wIiwiX3VzZXJBZ3JlZW1lbnRQb3B1cCIsIl9jbG9zZVVzZXJBZ3JlZW1lbnRQb3B1cCIsIm9uRGVzdHJveSJdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFBQTtBQUNBOztBQUVBO0FBQ0EsSUFBSUEsc0JBQXNCLEdBQUcsS0FBSzs7QUFFbEM7QUFDQSxJQUFJQyxnQkFBZ0IsR0FBRyxTQUFuQkEsZ0JBQWdCQSxDQUFZQyxPQUFPLEVBQUVDLFNBQVMsRUFBRUMsT0FBTyxFQUFFO0VBQ3pELElBQUksQ0FBQ0MsRUFBRSxD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TCxLQUFLO0VBQ3BDLENBQUM7RUFFRHFMLHdCQUF3QixFQUFFLFNBQUFBLHlCQUFBLEVBQVc7SUFDakMsSUFBSSxJQUFJLENBQUNELG1CQUFtQixFQUFFO01BQzFCLElBQUksQ0FBQ0EsbUJBQW1CLENBQUMzSixPQUFPLEVBQUU7TUFDbEMsSUFBSSxDQUFDMkosbUJBQW1CLEdBQUcsSUFBSTtJQUNuQztFQUNKLENBQUM7RUFFRDtFQUNBRSxTQUFTLFdBQUFBLFVBQUEsRUFBSTtJQUNULElBQUksQ0FBQ2xOLDBCQUEwQixFQUFFO0VBQ3JDO0FBQ0osQ0FBQyxDQUFDIiwic291cmNlUm9vdCI6Ii8iLCJzb3VyY2VzQ29udGVudCI6WyIvLyDnmbvlvZXlnLrmma/mjqfliLblmahcbi8vIOS9v+eUqOeCueWHu+S6i+S7tuWunueOsOWkjemAieahhuWKn+iDve+8iOS4jeS+nei1liBUb2dnbGUg57uE5Lu277yJXG5cbi8vIOWFqOWxgOagt+W8j+S/ruWkjeWHveaVsCAtIOabtOW8uuWkp+eahOeJiOacrFxudmFyIF9nbG9iYWxTdHlsZUZpeEFwcGxpZWQgPSBmYWxzZTtcblxuLy8g6L6F5Yqp5Ye95pWw77ya5L+u5aSNV2Vi5bmz5Y+wRWRpdEJveOeahENTU+agt+W8j++8iOWinuW8uueJiO+8iVxudmFyIF9maXhFZGl0Qm94U3R5bGUgPSBmdW5jdGlvbihlZGl0Qm94LCBmb250Q29sb3IsIGJnQ29sb3IpIHtcbiAgICBpZiAoIWNjLnN5cy5pc0Jyb3dzZXIpIHJldHVybjtcblxuICAgIGZvbnRDb2xvciA9IGZvbnRDb2xvciB8fCAnIzAwMDAwMCc7XG4gICAgYmdDb2xvciA9IGJnQ29sb3IgfHwgJyNmZmZmZmYnO1xuXG5cbiAgICAvLyDnq4vljbPlsJ3or5Xkv67lpI1cbiAgICBfYXBwbHlJbnB1dFN0eWxlcyhmb250Q29sb3IsIGJnQ29sb3IpO1xuXG4gICAgLy8g5bu26L+f5L+u5aSN77yI562J5b6FSFRNTCBpbnB1dOWFg+e0oOWIm+W7uu+8iVxuICAgIHNldFRpbWVvdXQoZnVuY3Rpb24oKSB7IF9hcHBseUlucHV0U3R5bGVzKGZvbnRDb2xvciwgYmdDb2xvcik7IH0sIDUwKTtcbiAgICBzZXRUaW1lb3V0KGZ1bmN0aW9uKCkgeyBfYXBwbHlJbnB1dFN0eWxlcyhmb250Q29sb3IsIGJnQ29sb3IpOyB9LCAxMDApO1xuICAgIHNldFRpbWVvdXQoZnVuY3Rpb24oKSB7IF9hcHBseUlucHV0U3R5bGVzKGZvbnRDb2xvciwgYmdDb2xvcik7IH0sIDIwMCk7XG4gICAgc2V0VGltZW91dChmdW5jdGlvbigpIHsgX2FwcGx5SW5wdXRTdHlsZXMoZm9udENvbG9yLCBiZ0NvbG9yKTsgfSwgNTAwKTtcblxuICAgIC8vIOazqOWFpeWFqOWxgENTU+agt+W8j++8iOacgOmrmOS8mOWFiOe6p++8iVxuICAgIGlmICghX2dsb2JhbFN0eWxlRml4QXBwbGllZCkge1xuICAgICAgICBfZ2xvYmFsU3R5bGVGaXhBcHBsaWVkID0gdHJ1ZTtcbiAgICAgICAgX2luamVjdEdsb2JhbFN0eWxlcyhmb250Q29sb3IsIGJnQ29sb3IpO1xuICAgIH1cbn07XG5cbi8vIOW6lOeUqOagt+W8j+WIsOaJgOaciWlucHV05YWD57SgXG52YXIgX2FwcGx5SW5wdXRTdHlsZXMgPSBmdW5jdGlvbihmb250Q29sb3IsIGJnQ29sb3IpIHtcbiAgICB0cnkge1xuICAgICAgICB2YXIgaW5wdXRzID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbCgnaW5wdXQnKTtcblxuICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IGlucHV0cy5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgdmFyIGlucHV0ID0gaW5wdXRzW2ldO1xuICAgICAgICAgICAgX3N0eWxlU2luZ2xlSW5wdXQoaW5wdXQsIGZvbnRDb2xvciwgYmdDb2xvcik7XG4gICAgICAgIH1cblxuICAgICAgICAvLyDkuZ/lpITnkIYgdGV4dGFyZWHvvIjlj6/og73ooqvnlKjkuo4gRWRpdEJveO+8iVxuICAgICAgICB2YXIgdGV4dGFyZWFzID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbCgndGV4dGFyZWEnKTtcbiAgICAgICAgZm9yICh2YXIgaiA9IDA7IGogPCB0ZXh0YXJlYXMubGVuZ3RoOyBqKyspIHtcbiAgICAgICAgICAgIF9zdHlsZVNpbmdsZUlucHV0KHRleHRhcmVhc1tqXSwgZm9udENvbG9yLCBiZ0NvbG9yKTtcbiAgICAgICAgfVxuICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgICAgY29uc29sZS5lcnJvcign5L+u5aSNRWRpdEJveOagt+W8j+Wksei0pTonLCBlKTtcbiAgICB9XG59O1xuXG4vLyDmoLflvI/ljJbljZXkuKppbnB1dOWFg+e0oCAtIOS/ruWkjeeJiO+8muaWh+Wtl+WeguebtOWxheS4rSArIOmAj+aYjuiDjOaZr+S4jemBruaMoei+ueahhlxuLy8g5rOo5oSP77ya6Lez6L+H5Y6f55Sf6L6T5YWl5qGG77yIbmF0aXZlLXBob25lLWlucHV0LCBuYXRpdmUtY29kZS1pbnB1dO+8ie+8jOWboOS4uuWug+S7rOacieeyvuehrueahOS9jee9ruiuvue9rlxudmFyIF9zdHlsZVNpbmdsZUlucHV0ID0gZnVuY3Rpb24oaW5wdXQsIGZvbnRDb2xvciwgYmdDb2xvcikge1xuICAgIC8vIOKYhSDot7Pov4fljp/nlJ/ovpPlhaXmoYbvvIzlroPku6zlt7Lnu4/mnInmraPnoa7nmoTmoLflvI9cbiAgICBpZiAoaW5wdXQuaWQgPT09ICduYXRpdmUtcGhvbmUtaW5wdXQnIHx8IGlucHV0LmlkID09PSAnbmF0aXZlLWNvZGUtaW5wdXQnKSB7XG4gICAgICAgIHJldHVybjtcbiAgICB9XG4gICAgXG4gICAgLy8gPT09PT09PT09PT09PT09PT09PT0g5qC45b+D5qC35byP6K6+572uID09PT09PT09PT09PT09PT09PT09XG4gICAgXG4gICAgLy8gMS4g5paH5a2X6aKc6ImyXG4gICAgaW5wdXQuc3R5bGUuc2V0UHJvcGVydHkoJ2NvbG9yJywgZm9udENvbG9yLCAnaW1wb3J0YW50Jyk7XG4gICAgaW5wdXQuc3R5bGUuY29sb3IgPSBmb250Q29sb3I7XG4gICAgXG4gICAgLy8gMi4g5YWz6ZSu77ya6K6+572u6YCP5piO6IOM5pmv77yM6K6pIENvY29zIOe7mOWItueahOi+ueahhuWPr+ingVxuICAgIGlucHV0LnN0eWxlLnNldFByb3BlcnR5KCdiYWNrZ3JvdW5kLWNvbG9yJywgJ3RyYW5zcGFyZW50JywgJ2ltcG9ydGFudCcpO1xuICAgIGlucHV0LnN0eWxlLmJhY2tncm91bmRDb2xvciA9ICd0cmFuc3BhcmVudCc7XG4gICAgXG4gICAgLy8gMy4g5paH5a2X5Z6C55u05bGF5LitIC0g5L2/55SoIEZsZXhib3gg5pa55qGI77yI5pyA5Y+v6Z2g77yJXG4gICAgaW5wdXQuc3R5bGUuc2V0UHJvcGVydHkoJ2Rpc3BsYXknLCAnZmxleCcsICdpbXBvcnRhbnQnKTtcbiAgICBpbnB1dC5zdHlsZS5kaXNwbGF5ID0gJ2ZsZXgnO1xuICAgIGlucHV0LnN0eWxlLnNldFByb3BlcnR5KCdhbGlnbi1pdGVtcycsICdjZW50ZXInLCAnaW1wb3J0YW50Jyk7XG4gICAgaW5wdXQuc3R5bGUuYWxpZ25JdGVtcyA9ICdjZW50ZXInO1xuICAgIGlucHV0LnN0eWxlLnNldFByb3BlcnR5KCdqdXN0aWZ5LWNvbnRlbnQnLCAnZmxleC1zdGFydCcsICdpbXBvcnRhbnQnKTtcbiAgICBpbnB1dC5zdHlsZS5qdXN0aWZ5Q29udGVudCA9ICdmbGV4LXN0YXJ0JztcbiAgICBcbiAgICAvLyA0LiDnm5LmqKHlnovorr7nva5cbiAgICBpbnB1dC5zdHlsZS5zZXRQcm9wZXJ0eSgnYm94LXNpemluZycsICdib3JkZXItYm94JywgJ2ltcG9ydGFudCcpO1xuICAgIGlucHV0LnN0eWxlLmJveFNpemluZyA9ICdib3JkZXItYm94JztcbiAgICBcbiAgICAvLyA1LiDlhoXovrnot50gLSDnu5nmloflrZfnlZnlh7rnqbrpl7TvvIzpgb/lhY3otLTovrlcbiAgICBpbnB1dC5zdHlsZS5zZXRQcm9wZXJ0eSgncGFkZGluZycsICcwIDEycHgnLCAnaW1wb3J0YW50Jyk7XG4gICAgaW5wdXQuc3R5bGUucGFkZGluZyA9ICcwIDEycHgnO1xuICAgIFxuICAgIC8vIDYuIOihjOmrmOiuvue9riAtIOS4juWtl+S9k+Wkp+Wwj+WMuemFje+8jOehruS/neWeguebtOWxheS4rVxuICAgIGlucHV0LnN0eWxlLnNldFByb3BlcnR5KCdsaW5lLWhlaWdodCcsICcxJywgJ2ltcG9ydGFudCcpO1xuICAgIGlucHV0LnN0eWxlLmxpbmVIZWlnaHQgPSAnMSc7XG4gICAgXG4gICAgLy8gNy4g6auY5bqm6Ieq6YCC5bqU5YaF5a65XG4gICAgaW5wdXQuc3R5bGUuc2V0UHJvcGVydHkoJ2hlaWdodCcsICcxMDAlJywgJ2ltcG9ydGFudCcpO1xuICAgIGlucHV0LnN0eWxlLmhlaWdodCA9ICcxMDAlJztcbiAgICBcbiAgICAvLyA9PT09PT09PT09PT09PT09PT09PSDlrZfkvZPorr7nva4gPT09PT09PT09PT09PT09PT09PT1cbiAgICBpbnB1dC5zdHlsZS5zZXRQcm9wZXJ0eSgnZm9udC1zaXplJywgJzIwcHgnLCAnaW1wb3J0YW50Jyk7XG4gICAgaW5wdXQuc3R5bGUuZm9udFNpemUgPSAnMjBweCc7XG4gICAgaW5wdXQuc3R5bGUuc2V0UHJvcGVydHkoJ2ZvbnQtZmFtaWx5JywgJ0FyaWFsLCBcIk1pY3Jvc29mdCBZYUhlaVwiLCBzYW5zLXNlcmlmJywgJ2ltcG9ydGFudCcpO1xuICAgIFxuICAgIC8vID09PT09PT09PT09PT09PT09PT09IFdlYktpdCDnibnmrorkv67lpI0gPT09PT09PT09PT09PT09PT09PT1cbiAgICBpbnB1dC5zdHlsZS5zZXRQcm9wZXJ0eSgnLXdlYmtpdC10ZXh0LWZpbGwtY29sb3InLCBmb250Q29sb3IsICdpbXBvcnRhbnQnKTtcbiAgICBpbnB1dC5zdHlsZS53ZWJraXRUZXh0RmlsbENvbG9yID0gZm9udENvbG9yO1xuICAgIFxuICAgIC8vID09PT09PT09PT09PT09PT09PT09IOWPr+ingeaAp+ehruS/nSA9PT09PT09PT09PT09PT09PT09PVxuICAgIGlucHV0LnN0eWxlLnNldFByb3BlcnR5KCdvcGFjaXR5JywgJzEnLCAnaW1wb3J0YW50Jyk7XG4gICAgaW5wdXQuc3R5bGUub3BhY2l0eSA9ICcxJztcbiAgICBpbnB1dC5zdHlsZS5zZXRQcm9wZXJ0eSgndmlzaWJpbGl0eScsICd2aXNpYmxlJywgJ2ltcG9ydGFudCcpO1xuICAgIGlucHV0LnN0eWxlLnZpc2liaWxpdHkgPSAndmlzaWJsZSc7XG4gICAgXG4gICAgLy8gPT09PT09PT09PT09PT09PT09PT0g5YWJ5qCH6aKc6ImyID09PT09PT09PT09PT09PT09PT09XG4gICAgaW5wdXQuc3R5bGUuc2V0UHJvcGVydHkoJ2NhcmV0LWNvbG9yJywgZm9udENvbG9yLCAnaW1wb3J0YW50Jyk7XG4gICAgaW5wdXQuc3R5bGUuY2FyZXRDb2xvciA9IGZvbnRDb2xvcjtcbiAgICBcbiAgICAvLyA9PT09PT09PT09PT09PT09PT09PSDnp7vpmaTlubLmibDmoLflvI8gPT09PT09PT09PT09PT09PT09PT1cbiAgICBpbnB1dC5zdHlsZS50ZXh0U2hhZG93ID0gJ25vbmUnO1xuICAgIGlucHV0LnN0eWxlLnNldFByb3BlcnR5KCd0ZXh0LXNoYWRvdycsICdub25lJywgJ2ltcG9ydGFudCcpO1xuICAgIGlucHV0LnN0eWxlLm91dGxpbmUgPSAnbm9uZSc7XG4gICAgaW5wdXQuc3R5bGUuc2V0UHJvcGVydHkoJ291dGxpbmUnLCAnbm9uZScsICdpbXBvcnRhbnQnKTtcbiAgICBpbnB1dC5zdHlsZS5ib3JkZXIgPSAnbm9uZSc7XG4gICAgaW5wdXQuc3R5bGUuc2V0UHJvcGVydHkoJ2JvcmRlcicsICdub25lJywgJ2ltcG9ydGFudCcpO1xuICAgIFxuICAgIC8vID09PT09PT09PT09PT09PT09PT09IOenu+mZpOWumuS9jeW5suaJsCA9PT09PT09PT09PT09PT09PT09PVxuICAgIGlucHV0LnN0eWxlLnJlbW92ZVByb3BlcnR5KCd0b3AnKTtcbiAgICBpbnB1dC5zdHlsZS5yZW1vdmVQcm9wZXJ0eSgnbWFyZ2luLXRvcCcpO1xuICAgIGlucHV0LnN0eWxlLnJlbW92ZVByb3BlcnR5KCdtYXJnaW4nKTtcbiAgICBcbiAgICAvLyA9PT09PT09PT09PT09PT09PT09PSDogZrnhKbml7bkv53mjIHmoLflvI8gPT09PT09PT09PT09PT09PT09PT1cbiAgICBpbnB1dC5zdHlsZS5zZXRQcm9wZXJ0eSgnb3V0bGluZS1vZmZzZXQnLCAnMCcsICdpbXBvcnRhbnQnKTtcbn07XG5cbi8vIOazqOWFpeWFqOWxgENTU+agt+W8jyAtIOS/ruWkjeeJiO+8iOaOkumZpOWOn+eUn+i+k+WFpeahhu+8iVxudmFyIF9pbmplY3RHbG9iYWxTdHlsZXMgPSBmdW5jdGlvbihmb250Q29sb3IsIGJnQ29sb3IpIHtcbiAgICB0cnkge1xuICAgICAgICB2YXIgc3R5bGVJZCA9ICdjb2Nvcy1lZGl0Ym94LWZpeC1zdHlsZSc7XG4gICAgICAgIGlmIChkb2N1bWVudC5nZXRFbGVtZW50QnlJZChzdHlsZUlkKSkgcmV0dXJuO1xuXG4gICAgICAgIHZhciBjc3MgPSBgXG4gICAgICAgICAgICAvKiDovpPlhaXmoYbln7rnoYDmoLflvI8gLSDpgI/mmI7og4zmma8gKyDmloflrZflsYXkuK0gKi9cbiAgICAgICAgICAgIC8qIOazqOaEj++8muaOkumZpOWOn+eUn+i+k+WFpeahhiAjbmF0aXZlLXBob25lLWlucHV0LCAjbmF0aXZlLWNvZGUtaW5wdXQgKi9cbiAgICAgICAgICAgIGlucHV0Om5vdCgjbmF0aXZlLXBob25lLWlucHV0KTpub3QoI25hdGl2ZS1jb2RlLWlucHV0KSwgXG4gICAgICAgICAgICB0ZXh0YXJlYTpub3QoI25hdGl2ZS1waG9uZS1pbnB1dCk6bm90KCNuYXRpdmUtY29kZS1pbnB1dCkge1xuICAgICAgICAgICAgICAgIGNvbG9yOiAke2ZvbnRDb2xvcn0gIWltcG9ydGFudDtcbiAgICAgICAgICAgICAgICBiYWNrZ3JvdW5kLWNvbG9yOiB0cmFuc3BhcmVudCAhaW1wb3J0YW50O1xuICAgICAgICAgICAgICAgIG9wYWNpdHk6IDEgIWltcG9ydGFudDtcbiAgICAgICAgICAgICAgICB2aXNpYmlsaXR5OiB2aXNpYmxlICFpbXBvcnRhbnQ7XG4gICAgICAgICAgICAgICAgZm9udC1zaXplOiAyMHB4ICFpbXBvcnRhbnQ7XG4gICAgICAgICAgICAgICAgLXdlYmtpdC10ZXh0LWZpbGwtY29sb3I6ICR7Zm9udENvbG9yfSAhaW1wb3J0YW50O1xuICAgICAgICAgICAgICAgIGNhcmV0LWNvbG9yOiAke2ZvbnRDb2xvcn0gIWltcG9ydGFudDtcbiAgICAgICAgICAgICAgICBsaW5lLWhlaWdodDogMSAhaW1wb3J0YW50O1xuICAgICAgICAgICAgICAgIGJvcmRlcjogbm9uZSAhaW1wb3J0YW50O1xuICAgICAgICAgICAgICAgIG91dGxpbmU6IG5vbmUgIWltcG9ydGFudDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIFxuICAgICAgICAgICAgLyogUGxhY2Vob2xkZXIg5qC35byPICovXG4gICAgICAgICAgICBpbnB1dDo6cGxhY2Vob2xkZXIsIHRleHRhcmVhOjpwbGFjZWhvbGRlciB7XG4gICAgICAgICAgICAgICAgY29sb3I6ICM4ODg4ODggIWltcG9ydGFudDtcbiAgICAgICAgICAgICAgICBvcGFjaXR5OiAxICFpbXBvcnRhbnQ7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBcbiAgICAgICAgICAgIC8qIOiBmueEpueKtuaAgSAqL1xuICAgICAgICAgICAgaW5wdXQ6Zm9jdXM6bm90KCNuYXRpdmUtcGhvbmUtaW5wdXQpOm5vdCgjbmF0aXZlLWNvZGUtaW5wdXQpLCBcbiAgICAgICAgICAgIHRleHRhcmVhOmZvY3VzOm5vdCgjbmF0aXZlLXBob25lLWlucHV0KTpub3QoI25hdGl2ZS1jb2RlLWlucHV0KSB7XG4gICAgICAgICAgICAgICAgY29sb3I6ICR7Zm9udENvbG9yfSAhaW1wb3J0YW50O1xuICAgICAgICAgICAgICAgIG91dGxpbmU6IG5vbmUgIWltcG9ydGFudDtcbiAgICAgICAgICAgICAgICBiYWNrZ3JvdW5kLWNvbG9yOiB0cmFuc3BhcmVudCAhaW1wb3J0YW50O1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgXG4gICAgICAgICAgICAvKiDmlofmnKznsbvlnovovpPlhaXmoYYgLSBGbGV4Ym94IOWeguebtOWxheS4re+8iOaOkumZpOWOn+eUn+i+k+WFpeahhu+8iSovXG4gICAgICAgICAgICBpbnB1dFt0eXBlPVwidGV4dFwiXTpub3QoI25hdGl2ZS1waG9uZS1pbnB1dCk6bm90KCNuYXRpdmUtY29kZS1pbnB1dCksIFxuICAgICAgICAgICAgaW5wdXRbdHlwZT1cIm51bWJlclwiXTpub3QoI25hdGl2ZS1waG9uZS1pbnB1dCk6bm90KCNuYXRpdmUtY29kZS1pbnB1dCksIFxuICAgICAgICAgICAgaW5wdXRbdHlwZT1cInRlbFwiXTpub3QoI25hdGl2ZS1waG9uZS1pbnB1dCk6bm90KCNuYXRpdmUtY29kZS1pbnB1dCksXG4gICAgICAgICAgICBpbnB1dFt0eXBlPVwicGFzc3dvcmRcIl06bm90KCNuYXRpdmUtcGhvbmUtaW5wdXQpOm5vdCgjbmF0aXZlLWNvZGUtaW5wdXQpIHtcbiAgICAgICAgICAgICAgICBkaXNwbGF5OiBmbGV4ICFpbXBvcnRhbnQ7XG4gICAgICAgICAgICAgICAgYWxpZ24taXRlbXM6IGNlbnRlciAhaW1wb3J0YW50O1xuICAgICAgICAgICAgICAgIGp1c3RpZnktY29udGVudDogZmxleC1zdGFydCAhaW1wb3J0YW50O1xuICAgICAgICAgICAgICAgIGJveC1zaXppbmc6IGJvcmRlci1ib3ggIWltcG9ydGFudDtcbiAgICAgICAgICAgICAgICBwYWRkaW5nOiAwIDEycHggIWltcG9ydGFudDtcbiAgICAgICAgICAgICAgICBoZWlnaHQ6IDEwMCUgIWltcG9ydGFudDtcbiAgICAgICAgICAgICAgICBsaW5lLWhlaWdodDogMSAhaW1wb3J0YW50O1xuICAgICAgICAgICAgICAgIGJvcmRlcjogbm9uZSAhaW1wb3J0YW50O1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgXG4gICAgICAgICAgICAvKiDnp7vpmaTmtY/op4jlmajpu5jorqTmoLflvI8gKi9cbiAgICAgICAgICAgIGlucHV0OmZvY3VzLFxuICAgICAgICAgICAgdGV4dGFyZWE6Zm9jdXMge1xuICAgICAgICAgICAgICAgIGJveC1zaGFkb3c6IG5vbmUgIWltcG9ydGFudDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgYDtcblxuICAgICAgICB2YXIgc3R5bGUgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdzdHlsZScpO1xuICAgICAgICBzdHlsZS5pZCA9IHN0eWxlSWQ7XG4gICAgICAgIHN0eWxlLnR5cGUgPSAndGV4dC9jc3MnO1xuICAgICAgICBzdHlsZS5hcHBlbmRDaGlsZChkb2N1bWVudC5jcmVhdGVUZXh0Tm9kZShjc3MpKTtcbiAgICAgICAgZG9jdW1lbnQuaGVhZC5hcHBlbmRDaGlsZChzdHlsZSk7XG5cbiAgICB9IGNhdGNoIChlKSB7XG4gICAgICAgIGNvbnNvbGUuZXJyb3IoJ+azqOWFpeWFqOWxgOagt+W8j+Wksei0pTonLCBlKTtcbiAgICB9XG59O1xuXG4vLyDliJvlu7rljp/nlJ8gSFRNTCBpbnB1dCDlhYPntKDvvIjnu5Xov4cgQ29jb3MgRWRpdEJveCDnmoTpl67popjvvIlcbi8vIOaUuei/m+eJiCB2NO+8muS9v+eUqOiKgueCueS4lueVjOWdkOagh+eyvuehruWumuS9jVxudmFyIF9jcmVhdGVOYXRpdmVJbnB1dEVsZW1lbnRzID0gZnVuY3Rpb24ocGFuZWwsIHBob25lSW5wdXROb2RlLCBjb2RlSW5wdXROb2RlLCBpbnB1dFdpZHRoLCBpbnB1dEhlaWdodCwgY29kZUlucHV0VywgcGFuZWxXaWR0aCwgcGFuZWxIZWlnaHQpIHtcbiAgICBpZiAoIWNjLnN5cy5pc0Jyb3dzZXIpIHJldHVybjtcbiAgICBcbiAgICB0cnkge1xuICAgICAgICAvLyDojrflj5YgQ2FudmFzIOWFg+e0oFxuICAgICAgICB2YXIgY2FudmFzID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ0dhbWVDYW52YXMnKSB8fCBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCdjYW52YXMnKTtcbiAgICAgICAgaWYgKCFjYW52YXMpIHtcbiAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoJ+aJvuS4jeWIsCBDYW52YXMg5YWD57SgJyk7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgICAgXG4gICAgICAgIHZhciBjYW52YXNSZWN0ID0gY2FudmFzLmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpO1xuICAgICAgICB2YXIgd2luU2l6ZSA9IGNjLndpblNpemU7XG4gICAgICAgIFxuICAgICAgICBjb25zb2xlLmxvZygnPT09IOWIm+W7uuWOn+eUn+i+k+WFpeahhu+8iHY0IC0g5L2/55So6IqC54K55LiW55WM5Z2Q5qCH77yJPT09Jyk7XG4gICAgICAgIGNvbnNvbGUubG9nKCdDYW52YXMg5L2N572uOicsIGNhbnZhc1JlY3QubGVmdCwgY2FudmFzUmVjdC50b3ApO1xuICAgICAgICBjb25zb2xlLmxvZygnQ2FudmFzIOWwuuWvuDonLCBjYW52YXNSZWN0LndpZHRoLCAneCcsIGNhbnZhc1JlY3QuaGVpZ2h0KTtcbiAgICAgICAgY29uc29sZS5sb2coJ+a4uOaIj+WIhui+qOeOhzonLCB3aW5TaXplLndpZHRoLCAneCcsIHdpblNpemUuaGVpZ2h0KTtcbiAgICAgICAgXG4gICAgICAgIC8vIOiuoeeul+e8qeaUvuavlOS+i++8iENhbnZhcyDlrp7pmYXlsLrlr7ggLyDmuLjmiI/orr7orqHliIbovqjnjofvvIlcbiAgICAgICAgdmFyIHNjYWxlWCA9IGNhbnZhc1JlY3Qud2lkdGggLyB3aW5TaXplLndpZHRoO1xuICAgICAgICB2YXIgc2NhbGVZID0gY2FudmFzUmVjdC5oZWlnaHQgLyB3aW5TaXplLmhlaWdodDtcbiAgICAgICAgY29uc29sZS5sb2coJ+e8qeaUvuavlOS+izonLCBzY2FsZVgudG9GaXhlZCgzKSwgc2NhbGVZLnRvRml4ZWQoMykpO1xuICAgICAgICBcbiAgICAgICAgLy8gPT09PT09PT09PT09PT09PT09PT0g5YWz6ZSu5pS56L+b77ya5L2/55So6IqC54K55LiW55WM5Z2Q5qCHID09PT09PT09PT09PT09PT09PT09XG4gICAgICAgIC8vIOebtOaOpeS9v+eUqCBDb2NvcyDoioLngrnnmoTkuJbnlYzlnZDmoIfvvIzogIzkuI3mmK/miYvliqjorqHnrpflgY/np7tcbiAgICAgICAgXG4gICAgICAgIC8vIOiOt+WPlui+k+WFpeahhuiKgueCueeahOS4lueVjOWdkOagh1xuICAgICAgICB2YXIgcGhvbmVXb3JsZFBvcyA9IHBob25lSW5wdXROb2RlLmNvbnZlcnRUb1dvcmxkU3BhY2VBUihjYy52MigwLCAwKSk7XG4gICAgICAgIHZhciBjb2RlV29ybGRQb3MgPSBjb2RlSW5wdXROb2RlLmNvbnZlcnRUb1dvcmxkU3BhY2VBUihjYy52MigwLCAwKSk7XG4gICAgICAgIFxuICAgICAgICBjb25zb2xlLmxvZygn5omL5py66L6T5YWl5qGG5LiW55WM5Z2Q5qCHOicsIHBob25lV29ybGRQb3MueC50b0ZpeGVkKDEpLCBwaG9uZVdvcmxkUG9zLnkudG9GaXhlZCgxKSk7XG4gICAgICAgIGNvbnNvbGUubG9nKCfpqozor4HnoIHovpPlhaXmoYbkuJbnlYzlnZDmoIc6JywgY29kZVdvcmxkUG9zLngudG9GaXhlZCgxKSwgY29kZVdvcmxkUG9zLnkudG9GaXhlZCgxKSk7XG4gICAgICAgIFxuICAgICAgICAvLyDimIXimIXimIUg5L2N572u5b6u6LCD5Y+C5pWw77yI5aaC5p6c6ZyA6KaB5b6u6LCD77yM5L+u5pS56L+Z6YeM77yJ4piF4piF4piFXG4gICAgICAgIHZhciBwaG9uZU9mZnNldFggPSAwOyAgICAvLyDmiYvmnLrovpPlhaXmoYYgWCDlgY/np7tcbiAgICAgICAgdmFyIHBob25lT2Zmc2V0WSA9IDA7ICAgIC8vIOaJi+acuui+k+WFpeahhiBZIOWBj+enu1xuICAgICAgICB2YXIgY29kZU9mZnNldFggPSAwOyAgICAgLy8g6aqM6K+B56CB6L6T5YWl5qGGIFgg5YGP56e7XG4gICAgICAgIHZhciBjb2RlT2Zmc2V0WSA9IDA7ICAgICAvLyDpqozor4HnoIHovpPlhaXmoYYgWSDlgY/np7tcbiAgICAgICAgXG4gICAgICAgIC8vIOKYheKYheKYhSDlsLrlr7jlj4LmlbAg4piF4piF4piFXG4gICAgICAgIHZhciBhY3R1YWxJbnB1dFdpZHRoID0gaW5wdXRXaWR0aDsgICAgICAvLyDkvb/nlKjkvKDlhaXnmoTovpPlhaXmoYblrr3luqZcbiAgICAgICAgdmFyIGFjdHVhbElucHV0SGVpZ2h0ID0gaW5wdXRIZWlnaHQ7ICAgIC8vIOS9v+eUqOS8oOWFpeeahOi+k+WFpeahhumrmOW6plxuICAgICAgICB2YXIgYWN0dWFsQ29kZUlucHV0V2lkdGggPSBjb2RlSW5wdXRXOyAgLy8g5L2/55So5Lyg5YWl55qE6aqM6K+B56CB6L6T5YWl5qGG5a695bqmXG4gICAgICAgIFxuICAgICAgICBjb25zb2xlLmxvZygnPT09IOi+k+WFpeahhuWwuuWvuCA9PT0nKTtcbiAgICAgICAgY29uc29sZS5sb2coJ+aJi+acuui+k+WFpeahhjonLCBhY3R1YWxJbnB1dFdpZHRoLCAneCcsIGFjdHVhbElucHV0SGVpZ2h0KTtcbiAgICAgICAgY29uc29sZS5sb2coJ+mqjOivgeeggei+k+WFpeahhjonLCBhY3R1YWxDb2RlSW5wdXRXaWR0aCwgJ3gnLCBhY3R1YWxJbnB1dEhlaWdodCk7XG4gICAgICAgIFxuICAgICAgICAvLyDorqHnrpflsY/luZXkvY3nva7vvIjkuJbnlYzlnZDmoIcgLT4g5bGP5bmV5Z2Q5qCH77yJXG4gICAgICAgIC8vIENvY29zIOWdkOagh+ezu++8muWOn+eCueW3puS4i+inku+8jFkg5ZCR5LiKXG4gICAgICAgIC8vIEhUTUwg5Z2Q5qCH57O777ya5Y6f54K55bem5LiK6KeS77yMWSDlkJHkuItcbiAgICAgICAgdmFyIGNhbGNTY3JlZW5Qb3NGcm9tV29ybGQgPSBmdW5jdGlvbih3b3JsZFBvcywgbm9kZVdpZHRoLCBub2RlSGVpZ2h0LCBvZmZzZXRYLCBvZmZzZXRZKSB7XG4gICAgICAgICAgICAvLyDkuJbnlYzlnZDmoIfovazmjaLkuLrlsY/luZXlnZDmoIdcbiAgICAgICAgICAgIHZhciBzY3JlZW5YID0gd29ybGRQb3MueCArIG9mZnNldFg7XG4gICAgICAgICAgICB2YXIgc2NyZWVuWSA9IHdvcmxkUG9zLnkgKyBvZmZzZXRZO1xuICAgICAgICAgICAgXG4gICAgICAgICAgICAvLyDovazmjaLkuLogQ2FudmFzIOWdkOagh1xuICAgICAgICAgICAgdmFyIGNhbnZhc1ggPSBzY3JlZW5YICogc2NhbGVYO1xuICAgICAgICAgICAgdmFyIGNhbnZhc1kgPSBjYW52YXNSZWN0LmhlaWdodCAtIHNjcmVlblkgKiBzY2FsZVk7ICAvLyBZIOi9tOe/u+i9rFxuICAgICAgICAgICAgXG4gICAgICAgICAgICAvLyDorqHnrpflrp7pmYXlsLrlr7hcbiAgICAgICAgICAgIHZhciBhY3R1YWxXaWR0aCA9IG5vZGVXaWR0aCAqIHNjYWxlWDtcbiAgICAgICAgICAgIHZhciBhY3R1YWxIZWlnaHQgPSBub2RlSGVpZ2h0ICogc2NhbGVZO1xuICAgICAgICAgICAgXG4gICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgIGxlZnQ6IGNhbnZhc1JlY3QubGVmdCArIGNhbnZhc1ggLSBhY3R1YWxXaWR0aCAvIDIsXG4gICAgICAgICAgICAgICAgdG9wOiBjYW52YXNSZWN0LnRvcCArIGNhbnZhc1kgLSBhY3R1YWxIZWlnaHQgLyAyLFxuICAgICAgICAgICAgICAgIHdpZHRoOiBhY3R1YWxXaWR0aCxcbiAgICAgICAgICAgICAgICBoZWlnaHQ6IGFjdHVhbEhlaWdodFxuICAgICAgICAgICAgfTtcbiAgICAgICAgfTtcbiAgICAgICAgXG4gICAgICAgIHZhciBwaG9uZVNjcmVlbiA9IGNhbGNTY3JlZW5Qb3NGcm9tV29ybGQocGhvbmVXb3JsZFBvcywgYWN0dWFsSW5wdXRXaWR0aCwgYWN0dWFsSW5wdXRIZWlnaHQsIHBob25lT2Zmc2V0WCwgcGhvbmVPZmZzZXRZKTtcbiAgICAgICAgdmFyIGNvZGVTY3JlZW4gPSBjYWxjU2NyZWVuUG9zRnJvbVdvcmxkKGNvZGVXb3JsZFBvcywgYWN0dWFsQ29kZUlucHV0V2lkdGgsIGFjdHVhbElucHV0SGVpZ2h0LCBjb2RlT2Zmc2V0WCwgY29kZU9mZnNldFkpO1xuICAgICAgICBcbiAgICAgICAgY29uc29sZS5sb2coJ+aJi+acuui+k+WFpeahhuWxj+W5leS9jee9rjonLCBwaG9uZVNjcmVlbik7XG4gICAgICAgIGNvbnNvbGUubG9nKCfpqozor4HnoIHovpPlhaXmoYblsY/luZXkvY3nva46JywgY29kZVNjcmVlbik7XG4gICAgICAgIFxuICAgICAgICAvLyDovrnnlYzmo4Dmn6XvvJrnoa7kv53ovpPlhaXmoYblnKjlsY/luZXlj6/op4HljLrln5/lhoVcbiAgICAgICAgcGhvbmVTY3JlZW4ubGVmdCA9IE1hdGgubWF4KDAsIE1hdGgubWluKGNhbnZhc1JlY3Qud2lkdGggLSBwaG9uZVNjcmVlbi53aWR0aCwgcGhvbmVTY3JlZW4ubGVmdCkpO1xuICAgICAgICBwaG9uZVNjcmVlbi50b3AgPSBNYXRoLm1heCgwLCBNYXRoLm1pbihjYW52YXNSZWN0LmhlaWdodCAtIHBob25lU2NyZWVuLmhlaWdodCwgcGhvbmVTY3JlZW4udG9wKSk7XG4gICAgICAgIGNvZGVTY3JlZW4ubGVmdCA9IE1hdGgubWF4KDAsIE1hdGgubWluKGNhbnZhc1JlY3Qud2lkdGggLSBjb2RlU2NyZWVuLndpZHRoLCBjb2RlU2NyZWVuLmxlZnQpKTtcbiAgICAgICAgY29kZVNjcmVlbi50b3AgPSBNYXRoLm1heCgwLCBNYXRoLm1pbihjYW52YXNSZWN0LmhlaWdodCAtIGNvZGVTY3JlZW4uaGVpZ2h0LCBjb2RlU2NyZWVuLnRvcCkpO1xuICAgICAgICBcbiAgICAgICAgY29uc29sZS5sb2coJ+i+ueeVjOajgOafpeWQjuS9jee9rjonKTtcbiAgICAgICAgY29uc29sZS5sb2coJyAg5omL5py66L6T5YWl5qGGOicsIHBob25lU2NyZWVuLmxlZnQudG9GaXhlZCgxKSwgcGhvbmVTY3JlZW4udG9wLnRvRml4ZWQoMSkpO1xuICAgICAgICBjb25zb2xlLmxvZygnICDpqozor4HnoIHovpPlhaXmoYY6JywgY29kZVNjcmVlbi5sZWZ0LnRvRml4ZWQoMSksIGNvZGVTY3JlZW4udG9wLnRvRml4ZWQoMSkpO1xuICAgICAgICBcbiAgICAgICAgLy8g56e76Zmk5pen55qE5a655Zmo5ZKM6L6T5YWl5qGGXG4gICAgICAgIHZhciBvbGRDb250YWluZXIgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnbmF0aXZlLWlucHV0LWNvbnRhaW5lcicpO1xuICAgICAgICBpZiAob2xkQ29udGFpbmVyKSB7XG4gICAgICAgICAgICBvbGRDb250YWluZXIucmVtb3ZlKCk7XG4gICAgICAgIH1cbiAgICAgICAgXG4gICAgICAgIC8vIOWIm+W7uuaWsOeahOWuueWZqO+8iOebtOaOpeaUvuWcqCBib2R5IOS4i++8jOehruS/neS4jeiiq+mBruaMoe+8iVxuICAgICAgICB2YXIgY29udGFpbmVyID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2Jyk7XG4gICAgICAgIGNvbnRhaW5lci5pZCA9ICduYXRpdmUtaW5wdXQtY29udGFpbmVyJztcbiAgICAgICAgY29udGFpbmVyLnN0eWxlLmNzc1RleHQgPSBbXG4gICAgICAgICAgICAncG9zaXRpb246IGZpeGVkJyxcbiAgICAgICAgICAgICd0b3A6IDAnLFxuICAgICAgICAgICAgJ2xlZnQ6IDAnLFxuICAgICAgICAgICAgJ3dpZHRoOiAxMDAlJyxcbiAgICAgICAgICAgICdoZWlnaHQ6IDEwMCUnLFxuICAgICAgICAgICAgJ3BvaW50ZXItZXZlbnRzOiBub25lJyxcbiAgICAgICAgICAgICd6LWluZGV4OiA5OTk5OSdcbiAgICAgICAgXS5qb2luKCc7ICcpO1xuICAgICAgICBkb2N1bWVudC5ib2R5LmFwcGVuZENoaWxkKGNvbnRhaW5lcik7XG4gICAgICAgIFxuICAgICAgICAvLyDliJvlu7rmiYvmnLrlj7fovpPlhaXmoYZcbiAgICAgICAgdmFyIHBob25lSW5wdXQgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdpbnB1dCcpO1xuICAgICAgICBwaG9uZUlucHV0LmlkID0gJ25hdGl2ZS1waG9uZS1pbnB1dCc7XG4gICAgICAgIHBob25lSW5wdXQudHlwZSA9ICd0ZWwnO1xuICAgICAgICBwaG9uZUlucHV0LnBsYWNlaG9sZGVyID0gJ+ivt+i+k+WFpeaJi+acuuWPtyc7XG4gICAgICAgIHBob25lSW5wdXQubWF4TGVuZ3RoID0gMTE7XG4gICAgICAgIHBob25lSW5wdXQuc3R5bGUuY3NzVGV4dCA9IFtcbiAgICAgICAgICAgICdwb3NpdGlvbjogYWJzb2x1dGUnLFxuICAgICAgICAgICAgJ2xlZnQ6ICcgKyBwaG9uZVNjcmVlbi5sZWZ0ICsgJ3B4JyxcbiAgICAgICAgICAgICd0b3A6ICcgKyBwaG9uZVNjcmVlbi50b3AgKyAncHgnLFxuICAgICAgICAgICAgJ3dpZHRoOiAnICsgcGhvbmVTY3JlZW4ud2lkdGggKyAncHgnLFxuICAgICAgICAgICAgJ2hlaWdodDogJyArIHBob25lU2NyZWVuLmhlaWdodCArICdweCcsXG4gICAgICAgICAgICAnYmFja2dyb3VuZDogdHJhbnNwYXJlbnQnLFxuICAgICAgICAgICAgJ2JvcmRlcjogbm9uZScsXG4gICAgICAgICAgICAnYm9yZGVyLXJhZGl1czogMCcsXG4gICAgICAgICAgICAnZm9udC1zaXplOiAxMnB4JyxcbiAgICAgICAgICAgICdjb2xvcjogIzMzMycsXG4gICAgICAgICAgICAncGFkZGluZzogMCA4cHgnLFxuICAgICAgICAgICAgJ2JveC1zaXppbmc6IGJvcmRlci1ib3gnLFxuICAgICAgICAgICAgJ291dGxpbmU6IG5vbmUnLFxuICAgICAgICAgICAgJ3BvaW50ZXItZXZlbnRzOiBhdXRvJyxcbiAgICAgICAgICAgICd6LWluZGV4OiAxMDAwMDAnLFxuICAgICAgICAgICAgJ2N1cnNvcjogdGV4dCcsXG4gICAgICAgICAgICAnZm9udC1mYW1pbHk6IEFyaWFsLCBcIk1pY3Jvc29mdCBZYUhlaVwiLCBzYW5zLXNlcmlmJyxcbiAgICAgICAgICAgICdsaW5lLWhlaWdodDogJyArIHBob25lU2NyZWVuLmhlaWdodCArICdweCcsXG4gICAgICAgICAgICAndGV4dC1hbGlnbjogbGVmdCdcbiAgICAgICAgXS5qb2luKCc7ICcpO1xuICAgICAgICBjb250YWluZXIuYXBwZW5kQ2hpbGQocGhvbmVJbnB1dCk7XG4gICAgICAgIFxuICAgICAgICAvLyDliJvlu7rpqozor4HnoIHovpPlhaXmoYZcbiAgICAgICAgdmFyIGNvZGVJbnB1dCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2lucHV0Jyk7XG4gICAgICAgIGNvZGVJbnB1dC5pZCA9ICduYXRpdmUtY29kZS1pbnB1dCc7XG4gICAgICAgIGNvZGVJbnB1dC50eXBlID0gJ3RleHQnO1xuICAgICAgICBjb2RlSW5wdXQucGxhY2Vob2xkZXIgPSAn6aqM6K+B56CBJztcbiAgICAgICAgY29kZUlucHV0Lm1heExlbmd0aCA9IDY7XG4gICAgICAgIGNvZGVJbnB1dC5zdHlsZS5jc3NUZXh0ID0gW1xuICAgICAgICAgICAgJ3Bvc2l0aW9uOiBhYnNvbHV0ZScsXG4gICAgICAgICAgICAnbGVmdDogJyArIGNvZGVTY3JlZW4ubGVmdCArICdweCcsXG4gICAgICAgICAgICAndG9wOiAnICsgY29kZVNjcmVlbi50b3AgKyAncHgnLFxuICAgICAgICAgICAgJ3dpZHRoOiAnICsgY29kZVNjcmVlbi53aWR0aCArICdweCcsXG4gICAgICAgICAgICAnaGVpZ2h0OiAnICsgY29kZVNjcmVlbi5oZWlnaHQgKyAncHgnLFxuICAgICAgICAgICAgJ2JhY2tncm91bmQ6IHRyYW5zcGFyZW50JyxcbiAgICAgICAgICAgICdib3JkZXI6IG5vbmUnLFxuICAgICAgICAgICAgJ2JvcmRlci1yYWRpdXM6IDAnLFxuICAgICAgICAgICAgJ2ZvbnQtc2l6ZTogMTJweCcsXG4gICAgICAgICAgICAnY29sb3I6ICMzMzMnLFxuICAgICAgICAgICAgJ3BhZGRpbmc6IDAgOHB4JyxcbiAgICAgICAgICAgICdib3gtc2l6aW5nOiBib3JkZXItYm94JyxcbiAgICAgICAgICAgICdvdXRsaW5lOiBub25lJyxcbiAgICAgICAgICAgICdwb2ludGVyLWV2ZW50czogYXV0bycsXG4gICAgICAgICAgICAnei1pbmRleDogMTAwMDAwJyxcbiAgICAgICAgICAgICdjdXJzb3I6IHRleHQnLFxuICAgICAgICAgICAgJ2ZvbnQtZmFtaWx5OiBBcmlhbCwgXCJNaWNyb3NvZnQgWWFIZWlcIiwgc2Fucy1zZXJpZicsXG4gICAgICAgICAgICAnbGluZS1oZWlnaHQ6ICcgKyBjb2RlU2NyZWVuLmhlaWdodCArICdweCcsXG4gICAgICAgICAgICAndGV4dC1hbGlnbjogbGVmdCdcbiAgICAgICAgXS5qb2luKCc7ICcpO1xuICAgICAgICBjb250YWluZXIuYXBwZW5kQ2hpbGQoY29kZUlucHV0KTtcbiAgICAgICAgXG4gICAgICAgIC8vIOa3u+WKoOeEpueCueS6i+S7tuiwg+ivlVxuICAgICAgICBwaG9uZUlucHV0LmFkZEV2ZW50TGlzdGVuZXIoJ2ZvY3VzJywgZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICBjb25zb2xlLmxvZygn5omL5py66L6T5YWl5qGG6I635b6X54Sm54K5Jyk7XG4gICAgICAgIH0pO1xuICAgICAgICBwaG9uZUlucHV0LmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICBjb25zb2xlLmxvZygn5omL5py66L6T5YWl5qGG6KKr54K55Ye7Jyk7XG4gICAgICAgIH0pO1xuICAgICAgICBjb2RlSW5wdXQuYWRkRXZlbnRMaXN0ZW5lcignZm9jdXMnLCBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKCfpqozor4HnoIHovpPlhaXmoYbojrflvpfnhKbngrknKTtcbiAgICAgICAgfSk7XG4gICAgICAgIGNvZGVJbnB1dC5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgY29uc29sZS5sb2coJ+mqjOivgeeggei+k+WFpeahhuiiq+eCueWHuycpO1xuICAgICAgICB9KTtcbiAgICAgICAgXG4gICAgICAgIGNvbnNvbGUubG9nKCfljp/nlJ/ovpPlhaXmoYbliJvlu7rlrozmiJAnKTtcbiAgICAgICAgXG4gICAgICAgIC8vIOW7tui/n+ajgOafpei+k+WFpeahhuaYr+WQpuato+ehruWIm+W7ulxuICAgICAgICBzZXRUaW1lb3V0KGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgdmFyIHBob25lQ2hlY2sgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnbmF0aXZlLXBob25lLWlucHV0Jyk7XG4gICAgICAgICAgICB2YXIgY29kZUNoZWNrID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ25hdGl2ZS1jb2RlLWlucHV0Jyk7XG4gICAgICAgICAgICBjb25zb2xlLmxvZygn6L6T5YWl5qGG5qOA5p+lOicpO1xuICAgICAgICAgICAgY29uc29sZS5sb2coJyAg5omL5py66L6T5YWl5qGGOicsIHBob25lQ2hlY2sgPyAn5a2Y5ZyoJyA6ICfkuI3lrZjlnKgnKTtcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKCcgIOmqjOivgeeggei+k+WFpeahhjonLCBjb2RlQ2hlY2sgPyAn5a2Y5ZyoJyA6ICfkuI3lrZjlnKgnKTtcbiAgICAgICAgICAgIGlmIChwaG9uZUNoZWNrKSB7XG4gICAgICAgICAgICAgICAgdmFyIHJlY3QgPSBwaG9uZUNoZWNrLmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpO1xuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKCcgIOaJi+acuui+k+WFpeahhuS9jee9rjonLCByZWN0LmxlZnQsIHJlY3QudG9wLCByZWN0LndpZHRoLCAneCcsIHJlY3QuaGVpZ2h0KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSwgMTAwKTtcbiAgICAgICAgXG4gICAgfSBjYXRjaCAoZSkge1xuICAgICAgICBjb25zb2xlLmVycm9yKCfliJvlu7rljp/nlJ/ovpPlhaXmoYblpLHotKU6JywgZSk7XG4gICAgfVxufTtcblxuLy8g56e76Zmk5Y6f55SfIEhUTUwg6L6T5YWl5qGG5YWD57Sg77yI55m75b2V5oiQ5Yqf5oiW5YWz6Zet5by556qX5pe26LCD55So77yJXG52YXIgX3JlbW92ZU5hdGl2ZUlucHV0RWxlbWVudHMgPSBmdW5jdGlvbigpIHtcbiAgICBpZiAoIWNjLnN5cy5pc0Jyb3dzZXIpIHJldHVybjtcbiAgICBcbiAgICB0cnkge1xuICAgICAgICB2YXIgY29udGFpbmVyID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ25hdGl2ZS1pbnB1dC1jb250YWluZXInKTtcbiAgICAgICAgaWYgKGNvbnRhaW5lcikge1xuICAgICAgICAgICAgY29udGFpbmVyLnJlbW92ZSgpO1xuICAgICAgICAgICAgY29uc29sZS5sb2coJ+WOn+eUn+i+k+WFpeahhuW3suenu+mZpCcpO1xuICAgICAgICB9XG4gICAgfSBjYXRjaCAoZSkge1xuICAgICAgICBjb25zb2xlLmVycm9yKCfnp7vpmaTljp/nlJ/ovpPlhaXmoYblpLHotKU6JywgZSk7XG4gICAgfVxufTtcblxuLy8g5L+u5aSNIEVkaXRCb3gg55qEIEhUTUwgaW5wdXQg5YWD57Sg5L2N572u5ZKM5bC65a+4XG52YXIgX2ZpeEVkaXRCb3hJbnB1dEVsZW1lbnRzID0gZnVuY3Rpb24ocGFuZWwsIHBob25lSW5wdXROb2RlLCBjb2RlSW5wdXROb2RlLCBpbnB1dFdpZHRoLCBpbnB1dEhlaWdodCwgY29kZUlucHV0VywgcGhvbmVFZGl0Qm94LCBjb2RlRWRpdEJveCkge1xuICAgIGlmICghY2Muc3lzLmlzQnJvd3NlcikgcmV0dXJuO1xuICAgIFxuICAgIHRyeSB7XG4gICAgICAgIC8vIOiOt+WPliBDYW52YXMg5YWD57SgXG4gICAgICAgIHZhciBjYW52YXMgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnR2FtZUNhbnZhcycpIHx8IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJ2NhbnZhcycpO1xuICAgICAgICBpZiAoIWNhbnZhcykge1xuICAgICAgICAgICAgY29uc29sZS5lcnJvcign5om+5LiN5YiwIENhbnZhcyDlhYPntKAnKTtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgICBcbiAgICAgICAgdmFyIGNhbnZhc1JlY3QgPSBjYW52YXMuZ2V0Qm91bmRpbmdDbGllbnRSZWN0KCk7XG4gICAgICAgIGNvbnNvbGUubG9nKCdDYW52YXMg5bC65a+4OicsIGNhbnZhc1JlY3Qud2lkdGgsICd4JywgY2FudmFzUmVjdC5oZWlnaHQpO1xuICAgICAgICBcbiAgICAgICAgLy8g6I635Y+W5ri45oiP6K6+6K6h55qE5YiG6L6o546HXG4gICAgICAgIHZhciB3aW5TaXplID0gY2Mud2luU2l6ZTtcbiAgICAgICAgY29uc29sZS5sb2coJ+a4uOaIj+WIhui+qOeOhzonLCB3aW5TaXplLndpZHRoLCAneCcsIHdpblNpemUuaGVpZ2h0KTtcbiAgICAgICAgXG4gICAgICAgIC8vIOiuoeeul+e8qeaUvuavlOS+i1xuICAgICAgICB2YXIgc2NhbGVYID0gY2FudmFzUmVjdC53aWR0aCAvIHdpblNpemUud2lkdGg7XG4gICAgICAgIHZhciBzY2FsZVkgPSBjYW52YXNSZWN0LmhlaWdodCAvIHdpblNpemUuaGVpZ2h0O1xuICAgICAgICBjb25zb2xlLmxvZygn57yp5pS+5q+U5L6LOicsIHNjYWxlWCwgc2NhbGVZKTtcbiAgICAgICAgXG4gICAgICAgIC8vIOi+heWKqeWHveaVsO+8muWwhiBDb2NvcyDkuJbnlYzlnZDmoIfovazmjaLkuLogSFRNTCDlsY/luZXlnZDmoIdcbiAgICAgICAgdmFyIHdvcmxkVG9TY3JlZW4gPSBmdW5jdGlvbih3b3JsZFBvcywgbm9kZVdpZHRoLCBub2RlSGVpZ2h0KSB7XG4gICAgICAgICAgICAvLyBDb2NvcyDlnZDmoIfns7vvvJrljp/ngrnlnKjlt6bkuIvop5LvvIxZ6L205ZCR5LiKXG4gICAgICAgICAgICAvLyBIVE1MIOWdkOagh+ezu++8muWOn+eCueWcqOW3puS4iuinku+8jFnovbTlkJHkuItcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgLy8g5LiW55WM5Z2Q5qCH6L2s5o2i5Li655u45a+55LqO6K6+6K6h5YiG6L6o546H55qE5L2N572u77yIMCDliLAgd2luU2l6Ze+8iVxuICAgICAgICAgICAgLy8g54S25ZCO57yp5pS+5YiwIENhbnZhcyDlsLrlr7hcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgdmFyIHNjcmVlblggPSAod29ybGRQb3MueCAtIG5vZGVXaWR0aCAvIDIpICogc2NhbGVYO1xuICAgICAgICAgICAgdmFyIHNjcmVlblkgPSBjYW52YXNSZWN0LmhlaWdodCAtICh3b3JsZFBvcy55ICsgbm9kZUhlaWdodCAvIDIpICogc2NhbGVZO1xuICAgICAgICAgICAgXG4gICAgICAgICAgICByZXR1cm4geyB4OiBzY3JlZW5YLCB5OiBzY3JlZW5ZIH07XG4gICAgICAgIH07XG4gICAgICAgIFxuICAgICAgICAvLyDorqHnrpfmiYvmnLrovpPlhaXmoYbnmoTkuJbnlYzlnZDmoIdcbiAgICAgICAgdmFyIHBob25lV29ybGRQb3MgPSBwaG9uZUlucHV0Tm9kZS5jb252ZXJ0VG9Xb3JsZFNwYWNlQVIoY2MudjIoMCwgMCkpO1xuICAgICAgICBjb25zb2xlLmxvZygn5omL5py66L6T5YWl5qGG5LiW55WM5Z2Q5qCHOicsIHBob25lV29ybGRQb3MueCwgcGhvbmVXb3JsZFBvcy55KTtcbiAgICAgICAgXG4gICAgICAgIHZhciBwaG9uZVNjcmVlblBvcyA9IHdvcmxkVG9TY3JlZW4ocGhvbmVXb3JsZFBvcywgaW5wdXRXaWR0aCwgaW5wdXRIZWlnaHQpO1xuICAgICAgICBjb25zb2xlLmxvZygn5omL5py66L6T5YWl5qGG5bGP5bmV5L2N572uOicsIHBob25lU2NyZWVuUG9zLngsIHBob25lU2NyZWVuUG9zLnkpO1xuICAgICAgICBcbiAgICAgICAgLy8g5p+l5om+IEhUTUwgaW5wdXQg5YWD57SgXG4gICAgICAgIHZhciBpbnB1dHMgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yQWxsKCdpbnB1dCcpO1xuICAgICAgICBjb25zb2xlLmxvZygn5om+5YiwICcgKyBpbnB1dHMubGVuZ3RoICsgJyDkuKogaW5wdXQg5YWD57SgJyk7XG4gICAgICAgIFxuICAgICAgICAvLyDlpoLmnpzlj6rmnInkuIDkuKogaW5wdXTvvIzpnIDopoHmiYvliqjliJvlu7rnrKzkuozkuKpcbiAgICAgICAgaWYgKGlucHV0cy5sZW5ndGggPT09IDEpIHtcbiAgICAgICAgICAgIHZhciBwaG9uZUlucHV0ID0gaW5wdXRzWzBdO1xuICAgICAgICAgICAgXG4gICAgICAgICAgICAvLyDorr7nva7moLflvI9cbiAgICAgICAgICAgIHBob25lSW5wdXQuc3R5bGUucG9zaXRpb24gPSAnYWJzb2x1dGUnO1xuICAgICAgICAgICAgcGhvbmVJbnB1dC5zdHlsZS5sZWZ0ID0gTWF0aC5tYXgoMCwgcGhvbmVTY3JlZW5Qb3MueCkgKyAncHgnO1xuICAgICAgICAgICAgcGhvbmVJbnB1dC5zdHlsZS50b3AgPSBNYXRoLm1heCgwLCBwaG9uZVNjcmVlblBvcy55KSArICdweCc7XG4gICAgICAgICAgICBwaG9uZUlucHV0LnN0eWxlLndpZHRoID0gKGlucHV0V2lkdGggKiBzY2FsZVgpICsgJ3B4JztcbiAgICAgICAgICAgIHBob25lSW5wdXQuc3R5bGUuaGVpZ2h0ID0gKGlucHV0SGVpZ2h0ICogc2NhbGVZKSArICdweCc7XG4gICAgICAgICAgICBwaG9uZUlucHV0LnN0eWxlLnpJbmRleCA9ICc5OTk5JztcbiAgICAgICAgICAgIHBob25lSW5wdXQuc3R5bGUub3BhY2l0eSA9ICcxJztcbiAgICAgICAgICAgIHBob25lSW5wdXQuc3R5bGUudmlzaWJpbGl0eSA9ICd2aXNpYmxlJztcbiAgICAgICAgICAgIHBob25lSW5wdXQuc3R5bGUuZGlzcGxheSA9ICdibG9jayc7XG4gICAgICAgICAgICBwaG9uZUlucHV0LnN0eWxlLnBvaW50ZXJFdmVudHMgPSAnYXV0byc7XG4gICAgICAgICAgICBwaG9uZUlucHV0LnN0eWxlLmN1cnNvciA9ICd0ZXh0JztcbiAgICAgICAgICAgIHBob25lSW5wdXQuc3R5bGUuYmFja2dyb3VuZCA9ICdyZ2JhKDI1NSwyNTUsMjU1LDAuNSknO1xuICAgICAgICAgICAgcGhvbmVJbnB1dC5zdHlsZS5ib3JkZXIgPSAnMnB4IHNvbGlkIGdvbGQnO1xuICAgICAgICAgICAgcGhvbmVJbnB1dC5zdHlsZS5vdXRsaW5lID0gJ25vbmUnO1xuICAgICAgICAgICAgcGhvbmVJbnB1dC5zdHlsZS5mb250U2l6ZSA9ICcxNnB4JztcbiAgICAgICAgICAgIHBob25lSW5wdXQuc3R5bGUuY29sb3IgPSAnIzMzMzMzMyc7XG4gICAgICAgICAgICBwaG9uZUlucHV0LnN0eWxlLnBhZGRpbmcgPSAnNXB4JztcbiAgICAgICAgICAgIHBob25lSW5wdXQuc3R5bGUuYm94U2l6aW5nID0gJ2JvcmRlci1ib3gnO1xuICAgICAgICAgICAgcGhvbmVJbnB1dC5zdHlsZS5ib3JkZXJSYWRpdXMgPSAnNXB4JztcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgY29uc29sZS5sb2coJ+aJi+acuui+k+WFpeahhuagt+W8j+W3suS/ruWkje+8jOS9jee9rjonLCBwaG9uZUlucHV0LnN0eWxlLmxlZnQsIHBob25lSW5wdXQuc3R5bGUudG9wKTtcbiAgICAgICAgfVxuICAgICAgICBcbiAgICAgICAgLy8g6aqM6K+B56CB6L6T5YWl5qGGXG4gICAgICAgIHZhciBjb2RlV29ybGRQb3MgPSBjb2RlSW5wdXROb2RlLmNvbnZlcnRUb1dvcmxkU3BhY2VBUihjYy52MigwLCAwKSk7XG4gICAgICAgIGNvbnNvbGUubG9nKCfpqozor4HnoIHovpPlhaXmoYbkuJbnlYzlnZDmoIc6JywgY29kZVdvcmxkUG9zLngsIGNvZGVXb3JsZFBvcy55KTtcbiAgICAgICAgXG4gICAgICAgIHZhciBjb2RlU2NyZWVuUG9zID0gd29ybGRUb1NjcmVlbihjb2RlV29ybGRQb3MsIGNvZGVJbnB1dFcsIGlucHV0SGVpZ2h0KTtcbiAgICAgICAgY29uc29sZS5sb2coJ+mqjOivgeeggei+k+WFpeahhuWxj+W5leS9jee9rjonLCBjb2RlU2NyZWVuUG9zLngsIGNvZGVTY3JlZW5Qb3MueSk7XG4gICAgICAgIFxuICAgICAgICBpZiAoaW5wdXRzLmxlbmd0aCA+PSAyKSB7XG4gICAgICAgICAgICB2YXIgY29kZUlucHV0ID0gaW5wdXRzWzFdO1xuICAgICAgICAgICAgY29kZUlucHV0LnN0eWxlLnBvc2l0aW9uID0gJ2Fic29sdXRlJztcbiAgICAgICAgICAgIGNvZGVJbnB1dC5zdHlsZS5sZWZ0ID0gTWF0aC5tYXgoMCwgY29kZVNjcmVlblBvcy54KSArICdweCc7XG4gICAgICAgICAgICBjb2RlSW5wdXQuc3R5bGUudG9wID0gTWF0aC5tYXgoMCwgY29kZVNjcmVlblBvcy55KSArICdweCc7XG4gICAgICAgICAgICBjb2RlSW5wdXQuc3R5bGUud2lkdGggPSAoY29kZUlucHV0VyAqIHNjYWxlWCkgKyAncHgnO1xuICAgICAgICAgICAgY29kZUlucHV0LnN0eWxlLmhlaWdodCA9IChpbnB1dEhlaWdodCAqIHNjYWxlWSkgKyAncHgnO1xuICAgICAgICAgICAgY29kZUlucHV0LnN0eWxlLnpJbmRleCA9ICc5OTk5JztcbiAgICAgICAgICAgIGNvZGVJbnB1dC5zdHlsZS5vcGFjaXR5ID0gJzEnO1xuICAgICAgICAgICAgY29kZUlucHV0LnN0eWxlLnZpc2liaWxpdHkgPSAndmlzaWJsZSc7XG4gICAgICAgICAgICBjb2RlSW5wdXQuc3R5bGUuZGlzcGxheSA9ICdibG9jayc7XG4gICAgICAgICAgICBjb2RlSW5wdXQuc3R5bGUucG9pbnRlckV2ZW50cyA9ICdhdXRvJztcbiAgICAgICAgICAgIGNvZGVJbnB1dC5zdHlsZS5jdXJzb3IgPSAndGV4dCc7XG4gICAgICAgICAgICBjb2RlSW5wdXQuc3R5bGUuYmFja2dyb3VuZCA9ICdyZ2JhKDI1NSwyNTUsMjU1LDAuNSknO1xuICAgICAgICAgICAgY29kZUlucHV0LnN0eWxlLmJvcmRlciA9ICcycHggc29saWQgZ29sZCc7XG4gICAgICAgICAgICBjb2RlSW5wdXQuc3R5bGUub3V0bGluZSA9ICdub25lJztcbiAgICAgICAgICAgIGNvZGVJbnB1dC5zdHlsZS5mb250U2l6ZSA9ICcxNnB4JztcbiAgICAgICAgICAgIGNvZGVJbnB1dC5zdHlsZS5jb2xvciA9ICcjMzMzMzMzJztcbiAgICAgICAgICAgIGNvZGVJbnB1dC5zdHlsZS5wYWRkaW5nID0gJzVweCc7XG4gICAgICAgICAgICBjb2RlSW5wdXQuc3R5bGUuYm94U2l6aW5nID0gJ2JvcmRlci1ib3gnO1xuICAgICAgICAgICAgY29kZUlucHV0LnN0eWxlLmJvcmRlclJhZGl1cyA9ICc1cHgnO1xuICAgICAgICAgICAgXG4gICAgICAgICAgICBjb25zb2xlLmxvZygn6aqM6K+B56CB6L6T5YWl5qGG5qC35byP5bey5L+u5aSNJyk7XG4gICAgICAgIH1cbiAgICAgICAgXG4gICAgICAgIC8vIOiwg+ivle+8muaYvuekuui+k+WFpeahhueahOWunumZheS9jee9rlxuICAgICAgICBjb25zb2xlLmxvZygnPT09IOiwg+ivleS/oeaBryA9PT0nKTtcbiAgICAgICAgY29uc29sZS5sb2coJ0NhbnZhcyDkvY3nva46JywgY2FudmFzUmVjdC5sZWZ0LCBjYW52YXNSZWN0LnRvcCk7XG4gICAgICAgIGNvbnNvbGUubG9nKCforr7orqHliIbovqjnjoc6Jywgd2luU2l6ZS53aWR0aCwgJ3gnLCB3aW5TaXplLmhlaWdodCk7XG4gICAgICAgIGNvbnNvbGUubG9nKCfovpPlhaXmoYboioLngrnlsLrlr7g6JywgaW5wdXRXaWR0aCwgJ3gnLCBpbnB1dEhlaWdodCk7XG4gICAgICAgIGNvbnNvbGUubG9nKCfpqozor4HnoIHovpPlhaXmoYblsLrlr7g6JywgY29kZUlucHV0VywgJ3gnLCBpbnB1dEhlaWdodCk7XG4gICAgICAgIFxuICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgICAgY29uc29sZS5lcnJvcign5L+u5aSNIEVkaXRCb3gg5qC35byP5aSx6LSlOicsIGUpO1xuICAgIH1cbn07XG5cbi8vIE11dGF0aW9uT2JzZXJ2ZXIg55uR5ZCs5paw5Yib5bu655qEaW5wdXTlhYPntKBcbnZhciBfc3RhcnRJbnB1dE9ic2VydmVyID0gZnVuY3Rpb24oKSB7XG4gICAgaWYgKCFjYy5zeXMuaXNCcm93c2VyKSByZXR1cm47XG5cbiAgICB0cnkge1xuICAgICAgICB2YXIgb2JzZXJ2ZXIgPSBuZXcgTXV0YXRpb25PYnNlcnZlcihmdW5jdGlvbihtdXRhdGlvbnMpIHtcbiAgICAgICAgICAgIG11dGF0aW9ucy5mb3JFYWNoKGZ1bmN0aW9uKG11dGF0aW9uKSB7XG4gICAgICAgICAgICAgICAgbXV0YXRpb24uYWRkZWROb2Rlcy5mb3JFYWNoKGZ1bmN0aW9uKG5vZGUpIHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKG5vZGUubm9kZU5hbWUgPT09ICdJTlBVVCcgfHwgbm9kZS5ub2RlTmFtZSA9PT0gJ1RFWFRBUkVBJykge1xuICAgICAgICAgICAgICAgICAgICAgICAgX3N0eWxlU2luZ2xlSW5wdXQobm9kZSwgJyMwMDAwMDAnLCAnI2ZmZmZmZicpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIC8vIOajgOafpeWtkOiKgueCuVxuICAgICAgICAgICAgICAgICAgICBpZiAobm9kZS5xdWVyeVNlbGVjdG9yQWxsKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICB2YXIgaW5wdXRzID0gbm9kZS5xdWVyeVNlbGVjdG9yQWxsKCdpbnB1dCwgdGV4dGFyZWEnKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlucHV0cy5mb3JFYWNoKGZ1bmN0aW9uKGlucCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIF9zdHlsZVNpbmdsZUlucHV0KGlucCwgJyMwMDAwMDAnLCAnI2ZmZmZmZicpO1xuICAgICAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9KTtcblxuICAgICAgICBvYnNlcnZlci5vYnNlcnZlKGRvY3VtZW50LmJvZHksIHtcbiAgICAgICAgICAgIGNoaWxkTGlzdDogdHJ1ZSxcbiAgICAgICAgICAgIHN1YnRyZWU6IHRydWVcbiAgICAgICAgfSk7XG5cbiAgICB9IGNhdGNoIChlKSB7XG4gICAgICAgIGNvbnNvbGUud2Fybign5ZCv5YqoSW5wdXTnm5HlkKzlmajlpLHotKU6JywgZSk7XG4gICAgfVxufTtcblxuY2MuQ2xhc3Moe1xuICAgIG5hbWU6ICdsb2dpblNjZW5lJyxcbiAgICBleHRlbmRzOiBjYy5Db21wb25lbnQsXG5cbiAgICBwcm9wZXJ0aWVzOiB7XG4gICAgICAgIHdhaXRfbm9kZToge1xuICAgICAgICAgICAgdHlwZTogY2MuTm9kZSxcbiAgICAgICAgICAgIGRlZmF1bHQ6IG51bGxcbiAgICAgICAgfSxcbiAgICAgICAgdXNlcl9hZ3JlZW1lbnRfcHJlZmFiczoge1xuICAgICAgICAgICAgdHlwZTogY2MuUHJlZmFiLFxuICAgICAgICAgICAgZGVmYXVsdDogbnVsbFxuICAgICAgICB9LFxuICAgICAgICBwaG9uZV9sb2dpbl9wcmVmYWI6IHtcbiAgICAgICAgICAgIHR5cGU6IGNjLlByZWZhYixcbiAgICAgICAgICAgIGRlZmF1bHQ6IG51bGxcbiAgICAgICAgfVxuICAgIH0sXG5cbiAgICBvbkxvYWQgKCkge1xuICAgICAgICB2YXIgc2VsZiA9IHRoaXM7XG4gICAgICAgIFxuICAgICAgICBjb25zb2xlLmxvZyhcIj09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cIik7XG4gICAgICAgIGNvbnNvbGUubG9nKFwibG9naW5TY2VuZSBvbkxvYWQg5byA5aeL5omn6KGMXCIpO1xuICAgICAgICBjb25zb2xlLmxvZyhcIj09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cIik7XG5cbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIC8vIPCflKcg5L+u5aSN77ya56aB55So6Ieq5Yqo5YWo5bGP5Yqf6IO977yI5Y+M6YeN5L+d6Zmp77yM56e76ZmkIGlzTW9iaWxlIOajgOafpe+8iVxuICAgICAgICAgICAgLy8g5Y2z5L2/IG1haW4uanMg5Lit55qE6K6+572u5rKh5pyJ55Sf5pWI77yM6L+Z6YeM5Lmf5Lya5YaN5qyh56aB55SoXG4gICAgICAgICAgICBpZiAoY2MudmlldyAmJiBjYy52aWV3LmVuYWJsZUF1dG9GdWxsU2NyZWVuKSB7XG4gICAgICAgICAgICAgICAgY2Mudmlldy5lbmFibGVBdXRvRnVsbFNjcmVlbihmYWxzZSk7XG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2coXCJsb2dpblNjZW5lOiDlt7LnpoHnlKjoh6rliqjlhajlsY/lip/og71cIik7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIC8vIPCflKcg6aKd5aSW5L+d6Zmp77ya56aB55SoIHNjcmVlbiDnmoToh6rliqjlhajlsY/op6bmkbjnm5HlkKzlmahcbiAgICAgICAgICAgIGlmIChjYy5zY3JlZW4gJiYgY2Muc2NyZWVuLmRpc2FibGVBdXRvRnVsbFNjcmVlbikge1xuICAgICAgICAgICAgICAgIGNjLnNjcmVlbi5kaXNhYmxlQXV0b0Z1bGxTY3JlZW4oKTtcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhcImxvZ2luU2NlbmU6IOW3suemgeeUqCBzY3JlZW4g6Ieq5Yqo5YWo5bGP6Kem5pG455uR5ZCs5ZmoXCIpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9IGNhdGNoIChlKSB7XG4gICAgICAgICAgICBjb25zb2xlLmVycm9yKFwi56aB55So6Ieq5Yqo5YWo5bGP5pe25Ye66ZSZOlwiLCBlKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgICAvLyDlkK/liqhXZWLlubPlj7BJbnB1dOagt+W8j+ebkeWQrOWZqFxuICAgICAgICAgICAgX3N0YXJ0SW5wdXRPYnNlcnZlcigpO1xuICAgICAgICAgICAgX2luamVjdEdsb2JhbFN0eWxlcygnIzAwMDAwMCcsICcjZmZmZmZmJyk7XG4gICAgICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoXCLliJ3lp4vljJbmoLflvI/nm5HlkKzlmajml7blh7rplJk6XCIsIGUpO1xuICAgICAgICB9XG5cbiAgICAgICAgdGhpcy5faXNBZ3JlZW1lbnRDaGVja2VkID0gZmFsc2U7XG4gICAgICAgIHRoaXMuX3Bob25lTG9naW5Qb3B1cFNob3dpbmcgPSBmYWxzZTsgIC8vIOWIneWni+WMluW8ueeql+agh+W/l+S9jVxuICAgICAgICBcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIHRoaXMuX2luaXRXYWl0Tm9kZSgpO1xuICAgICAgICB9IGNhdGNoIChlKSB7XG4gICAgICAgICAgICBjb25zb2xlLmVycm9yKFwi5Yid5aeL5YyW562J5b6F6IqC54K55pe25Ye66ZSZOlwiLCBlKTtcbiAgICAgICAgfVxuICAgICAgICBcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIC8vIOWIneWni+WMluWkjemAieahhu+8iOS9v+eUqOeCueWHu+S6i+S7tu+8iVxuICAgICAgICAgICAgdGhpcy5faW5pdENoZWNrYm94KCk7XG4gICAgICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoXCLliJ3lp4vljJblpI3pgInmoYbml7blh7rplJk6XCIsIGUpO1xuICAgICAgICB9XG4gICAgICAgIFxuICAgICAgICB0cnkge1xuICAgICAgICAgICAgLy8g5Yid5aeL5YyW55m75b2V5oyJ6ZKuXG4gICAgICAgICAgICB0aGlzLl9pbml0TG9naW5CdXR0b25zKCk7XG4gICAgICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoXCLliJ3lp4vljJbnmbvlvZXmjInpkq7ml7blh7rplJk6XCIsIGUpO1xuICAgICAgICB9XG4gICAgICAgIFxuICAgICAgICB0cnkge1xuICAgICAgICAgICAgLy8g5Yid5aeL5YyW55So5oi35Y2P6K6u6ZO+5o6l54K55Ye75LqL5Lu2XG4gICAgICAgICAgICB0aGlzLl9pbml0VXNlckFncmVlbWVudExpbmsoKTtcbiAgICAgICAgfSBjYXRjaCAoZSkge1xuICAgICAgICAgICAgY29uc29sZS5lcnJvcihcIuWIneWni+WMlueUqOaIt+WNj+iurumTvuaOpeaXtuWHuumUmTpcIiwgZSk7XG4gICAgICAgIH1cblxuICAgICAgICB0cnkge1xuICAgICAgICAgICAgLy8g8J+agOOAkOaAp+iDveS8mOWMluOAkemihOWKoOi9veWkp+WOheWcuuaZr+WSjOa4uOaIj+WcuuaZr1xuICAgICAgICAgICAgdGhpcy5fcHJlbG9hZFNjZW5lcygpO1xuICAgICAgICB9IGNhdGNoIChlKSB7XG4gICAgICAgICAgICBjb25zb2xlLmVycm9yKFwi6aKE5Yqg6L295Zy65pmv5pe25Ye66ZSZOlwiLCBlKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgICAvLyDmo4Dmn6XmmK/lkKbmnInmnKzlnLDnmbvlvZXkvJror53vvIzlsJ3or5Xoh6rliqjnmbvlvZVcbiAgICAgICAgICAgIHRoaXMuX2NoZWNrQXV0b0xvZ2luKCk7XG4gICAgICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoXCLmo4Dmn6Xoh6rliqjnmbvlvZXml7blh7rplJk6XCIsIGUpO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKHR5cGVvZiB3aW5kb3cubXlnbG9iYWwgPT09ICd1bmRlZmluZWQnKSB7XG4gICAgICAgICAgICBjb25zb2xlLmVycm9yKFwibXlnbG9iYWwg5pyq5a6a5LmJ77yM5bCd6K+V562J5b6FLi4uXCIpO1xuICAgICAgICAgICAgdGhpcy5fd2FpdEZvck15Z2xvYmFsKCk7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICB0aGlzLl9pbml0QW5kU3RhcnQoKTtcbiAgICAgICAgXG4gICAgICAgIGNvbnNvbGUubG9nKFwiPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVwiKTtcbiAgICAgICAgY29uc29sZS5sb2coXCJsb2dpblNjZW5lIG9uTG9hZCDmiafooYzlrozmiJBcIik7XG4gICAgICAgIGNvbnNvbGUubG9nKFwiPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVwiKTtcbiAgICB9LFxuXG4gICAgLy8g5qOA5p+l6Ieq5Yqo55m75b2VXG4gICAgX2NoZWNrQXV0b0xvZ2luOiBmdW5jdGlvbigpIHtcbiAgICAgICAgXG4gICAgICAgIHZhciBteWdsb2JhbCA9IHdpbmRvdy5teWdsb2JhbDtcbiAgICAgICAgaWYgKCFteWdsb2JhbCkge1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8g5qOA5p+l5piv5ZCm6KKr5by65Yi25LiL57q/XG4gICAgICAgIGlmIChteWdsb2JhbC53YXNGb3JjZUxvZ2dlZE91dCgpKSB7XG4gICAgICAgICAgICB0aGlzLl9zaG93RXJyb3IobXlnbG9iYWwuZ2V0Rm9yY2VMb2dvdXRSZWFzb24oKSk7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICAvLyDmo4Dmn6XmmK/lkKbmnInmnKzlnLDkvJror51cbiAgICAgICAgaWYgKG15Z2xvYmFsLmhhc0xvY2FsU2Vzc2lvbigpKSB7XG4gICAgICAgICAgICBcbiAgICAgICAgICAgIHZhciBzZWxmID0gdGhpcztcbiAgICAgICAgICAgIG15Z2xvYmFsLnZlcmlmeVRva2VuKGZ1bmN0aW9uKHZhbGlkLCBtZXNzYWdlKSB7XG4gICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgaWYgKHZhbGlkKSB7XG4gICAgICAgICAgICAgICAgICAgIHNlbGYuX3Nob3dFcnJvcihcIuiHquWKqOeZu+W9leS4rS4uLlwiKTtcbiAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgICAgIC8vIOajgOafpeaYr+WQpuacieS/neWtmOeahOaIv+mXtOS/oeaBr++8iOWIt+aWsOmhtemdouWQjuaBouWkjeWIsOa4uOaIj+WcuuaZr++8iVxuICAgICAgICAgICAgICAgICAgICB2YXIgcmVjb25uZWN0SW5mbyA9IG15Z2xvYmFsLnNvY2tldCAmJiBteWdsb2JhbC5zb2NrZXQubG9hZFJlY29ubmVjdEluZm8gPyBcbiAgICAgICAgICAgICAgICAgICAgICAgIG15Z2xvYmFsLnNvY2tldC5sb2FkUmVjb25uZWN0SW5mbygpIDogeyB0b2tlbjogJycsIHBsYXllcklkOiAnJywgcm9vbUNvZGU6ICcnIH07XG4gICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICAgICAgLy8g5aaC5p6c5pyJ5oi/6Ze05Y+377yM6K+05piO5LmL5YmN5Zyo5ri45oiP5Lit77yM6ZyA6KaB5oGi5aSN5Yiw5ri45oiP5Zy65pmvXG4gICAgICAgICAgICAgICAgICAgIGlmIChyZWNvbm5lY3RJbmZvLnJvb21Db2RlKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICAgICAgICAgIHNlbGYuc2NoZWR1bGVPbmNlKGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChteWdsb2JhbC5zb2NrZXQgJiYgbXlnbG9iYWwuc29ja2V0LmluaXRTb2NrZXQpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbXlnbG9iYWwuc29ja2V0LmluaXRTb2NrZXQoKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8g55uR5ZCs5oi/6Ze05oGi5aSN5LqL5Lu2XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbXlnbG9iYWwuc29ja2V0Lm9uUm9vbVJlc3RvcmVkKGZ1bmN0aW9uKGRhdGEpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY2MuZGlyZWN0b3IubG9hZFNjZW5lKFwiZ2FtZVNjZW5lXCIpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIOebkeWQrOaZrumAmui/nuaOpeaIkOWKn++8iOS4jeWcqOaIv+mXtOS4re+8iVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHZhciBldnQgPSB3aW5kb3cuZXZlbnRMaXN0ZXIgPyB3aW5kb3cuZXZlbnRMaXN0ZXIoe30pIDogbnVsbDtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAoZXZ0KSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGV2dC5vbihcImNvbm5lY3Rpb25fc3VjY2Vzc1wiLCBmdW5jdGlvbihkYXRhKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjYy5kaXJlY3Rvci5sb2FkU2NlbmUoXCJnYW1lU2NlbmVcIik7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIH0sIDAuNSk7XG4gICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAvLyDmsqHmnInmiL/pl7Tkv6Hmga/vvIzmraPluLjot7PovazliLDlpKfljoVcbiAgICAgICAgICAgICAgICAgICAgICAgIHNlbGYuc2NoZWR1bGVPbmNlKGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChteWdsb2JhbC5zb2NrZXQgJiYgbXlnbG9iYWwuc29ja2V0LmluaXRTb2NrZXQpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbXlnbG9iYWwuc29ja2V0LmluaXRTb2NrZXQoKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY2MuZGlyZWN0b3IubG9hZFNjZW5lKFwiaGFsbFNjZW5lXCIpO1xuICAgICAgICAgICAgICAgICAgICAgICAgfSwgMC41KTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIC8vIFRva2Vu5peg5pWI77yM5pi+56S66ZSZ6K+v5L+h5oGv5bm25YGc55WZ5Zyo55m75b2V6aG16Z2iXG4gICAgICAgICAgICAgICAgICAgIHNlbGYuX3Nob3dFcnJvcihtZXNzYWdlIHx8IFwi55m75b2V5bey6L+H5pyf77yM6K+36YeN5paw55m75b2VXCIpO1xuICAgICAgICAgICAgICAgICAgICAvLyBteWdsb2JhbC52ZXJpZnlUb2tlbiDlt7Lnu4/muIXpmaTkuobmnKzlnLDnirbmgIHvvIzov5nph4zkuI3pnIDopoHlho3mrKHmuIXpmaRcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgfVxuICAgIH0sXG5cbiAgICBfaW5pdFdhaXROb2RlOiBmdW5jdGlvbigpIHtcbiAgICAgICAgaWYgKHRoaXMud2FpdF9ub2RlKSB7XG4gICAgICAgICAgICB0aGlzLl9sb2FkaW5nSW1hZ2UgPSB0aGlzLndhaXRfbm9kZS5nZXRDaGlsZEJ5TmFtZShcImxvYWRpbmdfaW1hZ2VcIik7XG4gICAgICAgICAgICB2YXIgbGJsTm9kZSA9IHRoaXMud2FpdF9ub2RlLmdldENoaWxkQnlOYW1lKFwibGJsY29udGVudF9MYWJlbFwiKTtcbiAgICAgICAgICAgIGlmIChsYmxOb2RlKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5fd2FpdExhYmVsID0gbGJsTm9kZS5nZXRDb21wb25lbnQoY2MuTGFiZWwpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgdGhpcy53YWl0X25vZGUuYWN0aXZlID0gZmFsc2U7XG4gICAgICAgIH1cbiAgICB9LFxuXG4gICAgX2luaXRDaGVja2JveDogZnVuY3Rpb24oKSB7XG4gICAgICAgIFxuICAgICAgICB2YXIgc2VsZiA9IHRoaXM7XG4gICAgICAgIFxuICAgICAgICAvLyBsb2dpblNjZW5lIOiEmuacrOaMgui9veWcqCBST09UX1VJIOiKgueCueS4iu+8jOaJgOS7pSB0aGlzLm5vZGUg5bCx5pivIFJPT1RfVUlcbiAgICAgICAgdmFyIGNoZWNrTWFya05vZGUgPSB0aGlzLm5vZGUuZ2V0Q2hpbGRCeU5hbWUoXCJjaGVja19tYXJrXCIpO1xuICAgICAgICBpZiAoIWNoZWNrTWFya05vZGUpIHtcbiAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoXCJjaGVja19tYXJrIOiKgueCueacquaJvuWIsFwiKTtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgICBcbiAgICAgICAgdGhpcy5fY2hlY2tNYXJrTm9kZSA9IGNoZWNrTWFya05vZGU7XG4gICAgICAgIFxuICAgICAgICB2YXIgY2hlY2ttYXJrID0gY2hlY2tNYXJrTm9kZS5nZXRDaGlsZEJ5TmFtZShcImNoZWNrbWFya1wiKTtcbiAgICAgICAgaWYgKGNoZWNrbWFyaykge1xuICAgICAgICAgICAgdGhpcy5fY2hlY2ttYXJrSWNvbiA9IGNoZWNrbWFyaztcbiAgICAgICAgICAgIGNoZWNrbWFyay5hY3RpdmUgPSB0cnVlOyAgLy8g6buY6K6k6YCJ5LitXG4gICAgICAgIH1cbiAgICAgICAgXG4gICAgICAgIHRoaXMuX2lzQWdyZWVtZW50Q2hlY2tlZCA9IHRydWU7ICAvLyDpu5jorqTlt7LlkIzmhI/ljY/orq5cbiAgICAgICAgXG4gICAgICAgIHZhciBidXR0b24gPSBjaGVja01hcmtOb2RlLmdldENvbXBvbmVudChjYy5CdXR0b24pO1xuICAgICAgICBpZiAoYnV0dG9uKSB7XG4gICAgICAgICAgICBidXR0b24uZW5hYmxlZCA9IGZhbHNlO1xuICAgICAgICB9XG4gICAgICAgIFxuICAgICAgICBjaGVja01hcmtOb2RlLm9mZihjYy5Ob2RlLkV2ZW50VHlwZS5UT1VDSF9FTkQpO1xuICAgICAgICBjaGVja01hcmtOb2RlLm9uKGNjLk5vZGUuRXZlbnRUeXBlLlRPVUNIX0VORCwgZnVuY3Rpb24oZXZlbnQpIHtcbiAgICAgICAgICAgIHNlbGYuX3RvZ2dsZUNoZWNrYm94KCk7XG4gICAgICAgIH0sIHNlbGYpO1xuICAgIH0sXG5cbiAgICBfdG9nZ2xlQ2hlY2tib3g6IGZ1bmN0aW9uKCkge1xuICAgICAgICB0aGlzLl9pc0FncmVlbWVudENoZWNrZWQgPSAhdGhpcy5faXNBZ3JlZW1lbnRDaGVja2VkO1xuICAgICAgICBpZiAodGhpcy5fY2hlY2ttYXJrSWNvbikge1xuICAgICAgICAgICAgdGhpcy5fY2hlY2ttYXJrSWNvbi5hY3RpdmUgPSB0aGlzLl9pc0FncmVlbWVudENoZWNrZWQ7XG4gICAgICAgIH1cbiAgICB9LFxuXG4gICAgc3RhcnQgKCkge1xuICAgICAgICBjb25zb2xlLmxvZyhcIj09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cIik7XG4gICAgICAgIGNvbnNvbGUubG9nKFwibG9naW5TY2VuZSBzdGFydCDmlrnms5XmiafooYxcIik7XG4gICAgICAgIGNvbnNvbGUubG9nKFwiPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVwiKTtcbiAgICAgICAgXG4gICAgICAgIC8vIOWkh+eUqOaWueahiO+8muWcqCBzdGFydCDkuK3lho3mrKHmo4Dmn6XmjInpkq7mmK/lkKbmraPnoa7liJ3lp4vljJZcbiAgICAgICAgdmFyIHNlbGYgPSB0aGlzO1xuICAgICAgICB0aGlzLnNjaGVkdWxlT25jZShmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKFwiPj4+IOW7tui/n+ajgOafpeaMiemSrueKtuaAgS4uLlwiKTtcbiAgICAgICAgICAgIHZhciBwaG9uZUxvZ2luTm9kZSA9IHNlbGYubm9kZS5nZXRDaGlsZEJ5TmFtZShcImxvZ2luX3Bob25lXCIpO1xuICAgICAgICAgICAgaWYgKHBob25lTG9naW5Ob2RlKSB7XG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2coXCI+Pj4gbG9naW5fcGhvbmUg6IqC54K55a2Y5ZyoXCIpO1xuICAgICAgICAgICAgICAgIHZhciBoYXNUb3VjaExpc3RlbmVycyA9IHBob25lTG9naW5Ob2RlLmdldENvbXBvbmVudChjYy5CdXR0b24pICE9PSBudWxsO1xuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKFwiPj4+IOaYr+WQpuaciSBCdXR0b24g57uE5Lu2OlwiLCBoYXNUb3VjaExpc3RlbmVycyk7XG4gICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgLy8g5YaN5qyh56Gu5L+d5LqL5Lu257uR5a6aXG4gICAgICAgICAgICAgICAgcGhvbmVMb2dpbk5vZGUub2ZmKGNjLk5vZGUuRXZlbnRUeXBlLlRPVUNIX0VORCk7XG4gICAgICAgICAgICAgICAgcGhvbmVMb2dpbk5vZGUub24oY2MuTm9kZS5FdmVudFR5cGUuVE9VQ0hfRU5ELCBmdW5jdGlvbihldmVudCkge1xuICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhcIj4+PiBbc3RhcnTlpIfnlKhdIOaJi+acuueZu+W9leaMiemSriBUT1VDSF9FTkQg5LqL5Lu26Kem5Y+RXCIpO1xuICAgICAgICAgICAgICAgICAgICBldmVudC5zdG9wUHJvcGFnYXRpb24oKTtcbiAgICAgICAgICAgICAgICAgICAgc2VsZi5fZG9QaG9uZUxvZ2luKCk7XG4gICAgICAgICAgICAgICAgfSwgc2VsZik7XG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2coXCI+Pj4g5bey6YeN5paw57uR5a6a5omL5py655m75b2V5oyJ6ZKu5LqL5Lu2XCIpO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBjb25zb2xlLmVycm9yKFwiPj4+IGxvZ2luX3Bob25lIOiKgueCueS4jeWtmOWcqO+8gVwiKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIFxuICAgICAgICAgICAgdmFyIHd4TG9naW5Ob2RlID0gc2VsZi5ub2RlLmdldENoaWxkQnlOYW1lKFwibG9naW5fd3hcIik7XG4gICAgICAgICAgICBpZiAod3hMb2dpbk5vZGUpIHtcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhcIj4+PiBsb2dpbl93eCDoioLngrnlrZjlnKhcIik7XG4gICAgICAgICAgICAgICAgd3hMb2dpbk5vZGUub2ZmKGNjLk5vZGUuRXZlbnRUeXBlLlRPVUNIX0VORCk7XG4gICAgICAgICAgICAgICAgd3hMb2dpbk5vZGUub24oY2MuTm9kZS5FdmVudFR5cGUuVE9VQ0hfRU5ELCBmdW5jdGlvbihldmVudCkge1xuICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhcIj4+PiBbc3RhcnTlpIfnlKhdIOW+ruS/oeeZu+W9leaMiemSriBUT1VDSF9FTkQg5LqL5Lu26Kem5Y+RXCIpO1xuICAgICAgICAgICAgICAgICAgICBzZWxmLl9kb1d4TG9naW4oKTtcbiAgICAgICAgICAgICAgICB9LCBzZWxmKTtcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhcIj4+PiDlt7Lph43mlrDnu5Hlrprlvq7kv6HnmbvlvZXmjInpkq7kuovku7ZcIik7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0sIDAuNSk7XG4gICAgfSxcblxuICAgIF9pbml0TG9naW5CdXR0b25zOiBmdW5jdGlvbigpIHtcbiAgICAgICAgdmFyIHNlbGYgPSB0aGlzO1xuICAgICAgICBcbiAgICAgICAgY29uc29sZS5sb2coXCI9PT0g5Yid5aeL5YyW55m75b2V5oyJ6ZKuID09PVwiKTtcbiAgICAgICAgY29uc29sZS5sb2coXCLlvZPliY3oioLngrk6XCIsIHRoaXMubm9kZSA/IHRoaXMubm9kZS5uYW1lIDogXCJudWxsXCIpO1xuICAgICAgICBcbiAgICAgICAgLy8g5omT5Y2w5omA5pyJ5a2Q6IqC54K55ZCN56ewXG4gICAgICAgIHZhciBjaGlsZHJlbiA9IHRoaXMubm9kZS5jaGlsZHJlbjtcbiAgICAgICAgY29uc29sZS5sb2coXCLlrZDoioLngrnmlbDph486XCIsIGNoaWxkcmVuLmxlbmd0aCk7XG4gICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgY2hpbGRyZW4ubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKFwiICDlrZDoioLngrlbXCIgKyBpICsgXCJdOlwiLCBjaGlsZHJlbltpXS5uYW1lKTtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIGxvZ2luU2NlbmUg6ISa5pys5oyC6L295ZyoIFJPT1RfVUkg6IqC54K55LiK77yM5omA5LulIHRoaXMubm9kZSDlsLHmmK8gUk9PVF9VSVxuICAgICAgICB2YXIgd3hMb2dpbk5vZGUgPSB0aGlzLm5vZGUuZ2V0Q2hpbGRCeU5hbWUoXCJsb2dpbl93eFwiKTtcbiAgICAgICAgY29uc29sZS5sb2coXCJ3eExvZ2luTm9kZTpcIiwgd3hMb2dpbk5vZGUgPyBcIuaJvuWIsFwiIDogXCLmnKrmib7liLBcIik7XG4gICAgICAgIGlmICh3eExvZ2luTm9kZSkge1xuICAgICAgICAgICAgdmFyIGJ1dHRvbiA9IHd4TG9naW5Ob2RlLmdldENvbXBvbmVudChjYy5CdXR0b24pO1xuICAgICAgICAgICAgY29uc29sZS5sb2coXCJ3eExvZ2luTm9kZSBCdXR0b246XCIsIGJ1dHRvbiA/IFwi5a2Y5ZyoXCIgOiBcIuS4jeWtmOWcqFwiKTtcbiAgICAgICAgICAgIGlmIChidXR0b24pIHtcbiAgICAgICAgICAgICAgICBidXR0b24uaW50ZXJhY3RhYmxlID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICBidXR0b24uY2xpY2tFdmVudHMgPSBbXTtcblxuICAgICAgICAgICAgICAgIHZhciBoYW5kbGVyID0gbmV3IGNjLkNvbXBvbmVudC5FdmVudEhhbmRsZXIoKTtcbiAgICAgICAgICAgICAgICBoYW5kbGVyLnRhcmdldCA9IHRoaXMubm9kZTtcbiAgICAgICAgICAgICAgICBoYW5kbGVyLmNvbXBvbmVudCA9IFwibG9naW5TY2VuZVwiO1xuICAgICAgICAgICAgICAgIGhhbmRsZXIuaGFuZGxlciA9IFwiX29uV3hMb2dpbkNsaWNrXCI7XG4gICAgICAgICAgICAgICAgaGFuZGxlci5jdXN0b21FdmVudERhdGEgPSBcIlwiO1xuICAgICAgICAgICAgICAgIGJ1dHRvbi5jbGlja0V2ZW50cy5wdXNoKGhhbmRsZXIpO1xuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKFwi5b6u5L+h55m75b2V5oyJ6ZKu5Yid5aeL5YyW5a6M5oiQXCIpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgXG4gICAgICAgICAgICAvLyDmt7vliqDlpIfnlKjnmoTop6bmkbjkuovku7bnm5HlkKzvvIjnoa7kv53ngrnlh7vkuovku7bkuIDlrprog73op6blj5HvvIlcbiAgICAgICAgICAgIHd4TG9naW5Ob2RlLm9mZihjYy5Ob2RlLkV2ZW50VHlwZS5UT1VDSF9FTkQpO1xuICAgICAgICAgICAgd3hMb2dpbk5vZGUub24oY2MuTm9kZS5FdmVudFR5cGUuVE9VQ0hfRU5ELCBmdW5jdGlvbihldmVudCkge1xuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKFwiPj4+IOW+ruS/oeeZu+W9leaMiemSriBUT1VDSF9FTkQg5LqL5Lu26Kem5Y+RXCIpO1xuICAgICAgICAgICAgICAgIHNlbGYuX2RvV3hMb2dpbigpO1xuICAgICAgICAgICAgfSwgc2VsZik7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBjb25zb2xlLmVycm9yKFwi5pyq5om+5YiwIGxvZ2luX3d4IOiKgueCue+8gVwiKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHZhciBwaG9uZUxvZ2luTm9kZSA9IHRoaXMubm9kZS5nZXRDaGlsZEJ5TmFtZShcImxvZ2luX3Bob25lXCIpO1xuICAgICAgICBjb25zb2xlLmxvZyhcInBob25lTG9naW5Ob2RlOlwiLCBwaG9uZUxvZ2luTm9kZSA/IFwi5om+5YiwXCIgOiBcIuacquaJvuWIsFwiKTtcbiAgICAgICAgaWYgKHBob25lTG9naW5Ob2RlKSB7XG4gICAgICAgICAgICB2YXIgYnV0dG9uID0gcGhvbmVMb2dpbk5vZGUuZ2V0Q29tcG9uZW50KGNjLkJ1dHRvbik7XG4gICAgICAgICAgICBjb25zb2xlLmxvZyhcInBob25lTG9naW5Ob2RlIEJ1dHRvbjpcIiwgYnV0dG9uID8gXCLlrZjlnKhcIiA6IFwi5LiN5a2Y5ZyoXCIpO1xuICAgICAgICAgICAgaWYgKGJ1dHRvbikge1xuICAgICAgICAgICAgICAgIGJ1dHRvbi5pbnRlcmFjdGFibGUgPSB0cnVlO1xuICAgICAgICAgICAgICAgIGJ1dHRvbi5jbGlja0V2ZW50cyA9IFtdO1xuXG4gICAgICAgICAgICAgICAgdmFyIGhhbmRsZXIgPSBuZXcgY2MuQ29tcG9uZW50LkV2ZW50SGFuZGxlcigpO1xuICAgICAgICAgICAgICAgIGhhbmRsZXIudGFyZ2V0ID0gdGhpcy5ub2RlO1xuICAgICAgICAgICAgICAgIGhhbmRsZXIuY29tcG9uZW50ID0gXCJsb2dpblNjZW5lXCI7XG4gICAgICAgICAgICAgICAgaGFuZGxlci5oYW5kbGVyID0gXCJfb25QaG9uZUxvZ2luQ2xpY2tcIjtcbiAgICAgICAgICAgICAgICBoYW5kbGVyLmN1c3RvbUV2ZW50RGF0YSA9IFwiXCI7XG4gICAgICAgICAgICAgICAgYnV0dG9uLmNsaWNrRXZlbnRzLnB1c2goaGFuZGxlcik7XG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2coXCLmiYvmnLrnmbvlvZXmjInpkq7liJ3lp4vljJblrozmiJBcIik7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBcbiAgICAgICAgICAgIC8vIOa3u+WKoOWkh+eUqOeahOinpuaRuOS6i+S7tuebkeWQrO+8iOehruS/neeCueWHu+S6i+S7tuS4gOWumuiDveinpuWPke+8iVxuICAgICAgICAgICAgcGhvbmVMb2dpbk5vZGUub2ZmKGNjLk5vZGUuRXZlbnRUeXBlLlRPVUNIX0VORCk7XG4gICAgICAgICAgICBwaG9uZUxvZ2luTm9kZS5vbihjYy5Ob2RlLkV2ZW50VHlwZS5UT1VDSF9FTkQsIGZ1bmN0aW9uKGV2ZW50KSB7XG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2coXCI+Pj4g5omL5py655m75b2V5oyJ6ZKuIFRPVUNIX0VORCDkuovku7bop6blj5FcIik7XG4gICAgICAgICAgICAgICAgZXZlbnQuc3RvcFByb3BhZ2F0aW9uKCk7ICAvLyDpmLvmraLkuovku7blhpLms6FcbiAgICAgICAgICAgICAgICBzZWxmLl9kb1Bob25lTG9naW4oKTtcbiAgICAgICAgICAgIH0sIHNlbGYpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgY29uc29sZS5lcnJvcihcIuacquaJvuWIsCBsb2dpbl9waG9uZSDoioLngrnvvIFcIik7XG4gICAgICAgIH1cbiAgICAgICAgXG4gICAgICAgIGNvbnNvbGUubG9nKFwiPT09IOeZu+W9leaMiemSruWIneWni+WMlue7k+adnyA9PT1cIik7XG4gICAgfSxcblxuICAgIF9pbml0VXNlckFncmVlbWVudExpbms6IGZ1bmN0aW9uKCkge1xuICAgICAgICB2YXIgc2VsZiA9IHRoaXM7XG4gICAgICAgIFxuICAgICAgICAvLyBsb2dpblNjZW5lIOiEmuacrOaMgui9veWcqCBST09UX1VJIOiKgueCueS4iu+8jOaJgOS7pSB0aGlzLm5vZGUg5bCx5pivIFJPT1RfVUlcbiAgICAgICAgdmFyIGxpbmtOb2RlID0gdGhpcy5ub2RlLmdldENoaWxkQnlOYW1lKFwidXNlcl9hZ3JlZW1lbnRfbGlua1wiKTtcbiAgICAgICAgaWYgKGxpbmtOb2RlKSB7XG4gICAgICAgICAgICBsaW5rTm9kZS5hY3RpdmUgPSB0cnVlO1xuXG4gICAgICAgICAgICB2YXIgYnV0dG9uID0gbGlua05vZGUuZ2V0Q29tcG9uZW50KGNjLkJ1dHRvbik7XG4gICAgICAgICAgICBpZiAoYnV0dG9uKSB7XG4gICAgICAgICAgICAgICAgYnV0dG9uLmludGVyYWN0YWJsZSA9IHRydWU7XG4gICAgICAgICAgICAgICAgYnV0dG9uLmNsaWNrRXZlbnRzID0gW107XG5cbiAgICAgICAgICAgICAgICB2YXIgaGFuZGxlciA9IG5ldyBjYy5Db21wb25lbnQuRXZlbnRIYW5kbGVyKCk7XG4gICAgICAgICAgICAgICAgaGFuZGxlci50YXJnZXQgPSB0aGlzLm5vZGU7XG4gICAgICAgICAgICAgICAgaGFuZGxlci5jb21wb25lbnQgPSBcImxvZ2luU2NlbmVcIjtcbiAgICAgICAgICAgICAgICBoYW5kbGVyLmhhbmRsZXIgPSBcIl9vblVzZXJBZ3JlZW1lbnRMaW5rQ2xpY2tcIjtcbiAgICAgICAgICAgICAgICBoYW5kbGVyLmN1c3RvbUV2ZW50RGF0YSA9IFwiXCI7XG4gICAgICAgICAgICAgICAgYnV0dG9uLmNsaWNrRXZlbnRzLnB1c2goaGFuZGxlcik7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9LFxuXG4gICAgX29uV3hMb2dpbkNsaWNrOiBmdW5jdGlvbigpIHtcbiAgICAgICAgY29uc29sZS5sb2coXCI9PT0g5b6u5L+h55m75b2V5oyJ6ZKu6KKr54K55Ye7ID09PVwiKTtcbiAgICAgICAgdGhpcy5fZG9XeExvZ2luKCk7XG4gICAgfSxcblxuICAgIF9vblBob25lTG9naW5DbGljazogZnVuY3Rpb24oKSB7XG4gICAgICAgIGNvbnNvbGUubG9nKFwiPT09IOaJi+acuueZu+W9leaMiemSruiiq+eCueWHuyA9PT1cIik7XG4gICAgICAgIHRoaXMuX2RvUGhvbmVMb2dpbigpO1xuICAgIH0sXG5cbiAgICBfb25Vc2VyQWdyZWVtZW50TGlua0NsaWNrOiBmdW5jdGlvbigpIHtcbiAgICAgICAgdGhpcy5fc2hvd1VzZXJBZ3JlZW1lbnRQb3B1cCgpO1xuICAgIH0sXG5cbiAgICBfY2hlY2tBZ3JlZW1lbnQ6IGZ1bmN0aW9uKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5faXNBZ3JlZW1lbnRDaGVja2VkO1xuICAgIH0sXG5cbiAgICAvLyDwn5qA44CQ5oCn6IO95LyY5YyW44CR6aKE5Yqg6L295Zy65pmvXG4gICAgX3ByZWxvYWRTY2VuZXM6IGZ1bmN0aW9uKCkge1xuICAgICAgICBcbiAgICAgICAgLy8g6aKE5Yqg6L295aSn5Y6F5Zy65pmvXG4gICAgICAgIGNjLmRpcmVjdG9yLnByZWxvYWRTY2VuZShcImhhbGxTY2VuZVwiLCBmdW5jdGlvbihlcnIpIHtcbiAgICAgICAgICAgIGlmIChlcnIpIHtcbiAgICAgICAgICAgICAgICBjb25zb2xlLmVycm9yKFwi8J+agCBb6aKE5Yqg6L29XSDlpKfljoXlnLrmma/pooTliqDovb3lpLHotKU6XCIsIGVycik7XG4gICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICAgICAgXG4gICAgICAgIC8vIOmihOWKoOi9vea4uOaIj+WcuuaZr1xuICAgICAgICBjYy5kaXJlY3Rvci5wcmVsb2FkU2NlbmUoXCJnYW1lU2NlbmVcIiwgZnVuY3Rpb24oZXJyKSB7XG4gICAgICAgICAgICBpZiAoZXJyKSB7XG4gICAgICAgICAgICAgICAgY29uc29sZS5lcnJvcihcIvCfmoAgW+mihOWKoOi9vV0g5ri45oiP5Zy65pmv6aKE5Yqg6L295aSx6LSlOlwiLCBlcnIpO1xuICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgfSxcblxuICAgIF93YWl0Rm9yTXlnbG9iYWw6IGZ1bmN0aW9uKCkge1xuICAgICAgICB2YXIgc2VsZiA9IHRoaXM7XG4gICAgICAgIHZhciBhdHRlbXB0cyA9IDA7XG5cbiAgICAgICAgdmFyIGNoZWNrID0gZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICBhdHRlbXB0cysrO1xuICAgICAgICAgICAgaWYgKHR5cGVvZiB3aW5kb3cubXlnbG9iYWwgIT09ICd1bmRlZmluZWQnKSB7XG4gICAgICAgICAgICAgICAgc2VsZi5faW5pdEFuZFN0YXJ0KCk7XG4gICAgICAgICAgICB9IGVsc2UgaWYgKGF0dGVtcHRzIDwgMjApIHtcbiAgICAgICAgICAgICAgICBzZXRUaW1lb3V0KGNoZWNrLCAxMDApO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBzZWxmLl9zaG93RXJyb3IoXCLliqDovb3lpLHotKXvvIzor7fliLfmlrDpobXpnaLph43or5VcIik7XG4gICAgICAgICAgICB9XG4gICAgICAgIH07XG4gICAgICAgIHNldFRpbWVvdXQoY2hlY2ssIDEwMCk7XG4gICAgfSxcblxuICAgIF9pbml0QW5kU3RhcnQ6IGZ1bmN0aW9uKCkge1xuICAgICAgICB2YXIgbXlnbG9iYWwgPSB3aW5kb3cubXlnbG9iYWw7XG5cbiAgICAgICAgaWYgKCFteWdsb2JhbC5zb2NrZXQgJiYgIW15Z2xvYmFsLmluaXQoKSkge1xuICAgICAgICAgICAgdGhpcy5fc2hvd0Vycm9yKFwi5Yid5aeL5YyW5aSx6LSl77yM6K+35Yi35paw6aG16Z2i6YeN6K+VXCIpO1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8g5qOA5p+l5piv5ZCm5pyJ5L+d5a2Y55qE6YeN6L+e5L+h5oGv77yI5Yi35paw6aG16Z2i5ZCO5oGi5aSN77yJXG4gICAgICAgIGlmIChteWdsb2JhbC5zb2NrZXQgJiYgbXlnbG9iYWwuc29ja2V0LmxvYWRSZWNvbm5lY3RJbmZvKSB7XG4gICAgICAgICAgICB2YXIgcmVjb25uZWN0SW5mbyA9IG15Z2xvYmFsLnNvY2tldC5sb2FkUmVjb25uZWN0SW5mbygpXG4gICAgICAgICAgICBcbiAgICAgICAgICAgIGlmIChyZWNvbm5lY3RJbmZvLnRva2VuICYmIHJlY29ubmVjdEluZm8ucGxheWVySWQpIHtcbiAgICAgICAgICAgICAgICB0aGlzLl9zaG93TG9hZGluZyh0cnVlLCBcIuato+WcqOaBouWkjeeZu+W9leeKtuaAgS4uLlwiKVxuICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgIC8vIOWIneWni+WMliBXZWJTb2NrZXQg6L+e5o6lXG4gICAgICAgICAgICAgICAgaWYgKG15Z2xvYmFsLnNvY2tldC5pbml0U29ja2V0KSB7XG4gICAgICAgICAgICAgICAgICAgIG15Z2xvYmFsLnNvY2tldC5pbml0U29ja2V0KClcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgdmFyIHNlbGYgPSB0aGlzXG4gICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgLy8g55uR5ZCs5oi/6Ze05oGi5aSN5LqL5Lu2XG4gICAgICAgICAgICAgICAgbXlnbG9iYWwuc29ja2V0Lm9uUm9vbVJlc3RvcmVkKGZ1bmN0aW9uKGRhdGEpIHtcbiAgICAgICAgICAgICAgICAgICAgc2VsZi5fc2hvd0xvYWRpbmcoZmFsc2UpXG4gICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgICAgICAvLyDmgaLlpI3njqnlrrbmlbDmja5cbiAgICAgICAgICAgICAgICAgICAgbXlnbG9iYWwucGxheWVyRGF0YS5wbGF5ZXJJZCA9IGRhdGEucGxheWVyX2lkXG4gICAgICAgICAgICAgICAgICAgIG15Z2xvYmFsLnBsYXllckRhdGEubmlja05hbWUgPSBkYXRhLnBsYXllcl9uYW1lXG4gICAgICAgICAgICAgICAgICAgIG15Z2xvYmFsLnBsYXllckRhdGEuc2F2ZVRvTG9jYWwoKVxuICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICAgICAgLy8g6Lez6L2s5Yiw5ri45oiP5Zy65pmvXG4gICAgICAgICAgICAgICAgICAgIGNjLmRpcmVjdG9yLmxvYWRTY2VuZShcImdhbWVTY2VuZVwiKVxuICAgICAgICAgICAgICAgIH0pXG4gICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgLy8g55uR5ZCs5pmu6YCa6L+e5o6l5oiQ5Yqf77yI5LiN5Zyo5oi/6Ze05Lit77yJXG4gICAgICAgICAgICAgICAgdmFyIGV2dCA9IHdpbmRvdy5ldmVudExpc3RlciA/IHdpbmRvdy5ldmVudExpc3Rlcih7fSkgOiBudWxsXG4gICAgICAgICAgICAgICAgaWYgKGV2dCkge1xuICAgICAgICAgICAgICAgICAgICBldnQub24oXCJjb25uZWN0aW9uX3N1Y2Nlc3NcIiwgZnVuY3Rpb24oZGF0YSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgc2VsZi5fc2hvd0xvYWRpbmcoZmFsc2UpXG4gICAgICAgICAgICAgICAgICAgICAgICBteWdsb2JhbC5wbGF5ZXJEYXRhLnBsYXllcklkID0gZGF0YS5wbGF5ZXJfaWRcbiAgICAgICAgICAgICAgICAgICAgICAgIG15Z2xvYmFsLnBsYXllckRhdGEubmlja05hbWUgPSBkYXRhLnBsYXllcl9uYW1lXG4gICAgICAgICAgICAgICAgICAgICAgICBteWdsb2JhbC5wbGF5ZXJEYXRhLmdvYmFsX2NvdW50ID0gZGF0YS5nb2xkIHx8IDBcbiAgICAgICAgICAgICAgICAgICAgICAgIG15Z2xvYmFsLnBsYXllckRhdGEuc2F2ZVRvTG9jYWwoKVxuICAgICAgICAgICAgICAgICAgICAgICAgY2MuZGlyZWN0b3IubG9hZFNjZW5lKFwiaGFsbFNjZW5lXCIpXG4gICAgICAgICAgICAgICAgICAgIH0pXG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgIHJldHVyblxuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgLy8g5Yid5aeL5YyW6IOM5pmv6Z+z5LmQIC0g5aSE55CG5rWP6KeI5Zmo6Ieq5Yqo5pKt5pS+562W55WlXG4gICAgICAgIHRoaXMuX2luaXRCYWNrZ3JvdW5kTXVzaWMoKTtcblxuICAgICAgICBpZiAobXlnbG9iYWwuc29ja2V0ICYmIG15Z2xvYmFsLnNvY2tldC5pbml0U29ja2V0KSB7XG4gICAgICAgICAgICBteWdsb2JhbC5zb2NrZXQuaW5pdFNvY2tldCgpO1xuICAgICAgICB9XG4gICAgfSxcblxuICAgIC8vIOWIneWni+WMluiDjOaZr+mfs+S5kCAtIOWkhOeQhua1j+iniOWZqOiHquWKqOaSreaUvuetlueVpVxuICAgIF9pbml0QmFja2dyb3VuZE11c2ljOiBmdW5jdGlvbigpIHtcbiAgICAgICAgdmFyIHNlbGYgPSB0aGlzO1xuICAgICAgICBcbiAgICAgICAgLy8g6Z+z5pWI5byA5YWz5qOA5p+lXG4gICAgICAgIHZhciBpc29wZW5fc291bmQgPSAodHlwZW9mIHdpbmRvdy5pc29wZW5fc291bmQgIT09ICd1bmRlZmluZWQnKSA/IHdpbmRvdy5pc29wZW5fc291bmQgOiAxO1xuICAgICAgICBpZiAoIWlzb3Blbl9zb3VuZCkge1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIFxuICAgICAgICAvLyDliJ3lp4vljJbnirbmgIFcbiAgICAgICAgdGhpcy5fbXVzaWNQbGF5aW5nID0gZmFsc2U7XG4gICAgICAgIHRoaXMuX3RvdWNoTGlzdGVuZXJBZGRlZCA9IGZhbHNlO1xuICAgICAgICBcbiAgICAgICAgLy8g5L2/55SoIGNjLnJlc291cmNlcy5sb2FkIOWKoOi9vemfs+mikVxuICAgICAgICBjYy5yZXNvdXJjZXMubG9hZChcInNvdW5kL2xvZ2luX2JnXCIsIGNjLkF1ZGlvQ2xpcCwgZnVuY3Rpb24oZXJyLCBjbGlwKSB7XG4gICAgICAgICAgICBpZiAoZXJyKSB7XG4gICAgICAgICAgICAgICAgc2VsZi5fc2V0dXBHbG9iYWxUb3VjaEZvck11c2ljKCk7XG4gICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgXG4gICAgICAgICAgICAvLyDkv53lrZjpn7PpopHliarovpFcbiAgICAgICAgICAgIHNlbGYuX2JnTXVzaWNDbGlwID0gY2xpcDtcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgICAvLyDkvb/nlKggcGxheU11c2ljIOaSreaUvuiDjOaZr+mfs+S5kO+8iOe7n+S4gOeahOiDjOaZr+mfs+S5kOeuoeeQhu+8iVxuICAgICAgICAgICAgICAgIGNjLmF1ZGlvRW5naW5lLnBsYXlNdXNpYyhjbGlwLCB0cnVlKTtcbiAgICAgICAgICAgICAgICBzZWxmLl9tdXNpY1BsYXlpbmcgPSB0cnVlO1xuICAgICAgICAgICAgICAgIC8vIOaIkOWKn+aSreaUvu+8jOehruS/neebkeWQrOWZqOiiq+enu+mZpFxuICAgICAgICAgICAgICAgIHNlbGYuX3JlbW92ZUdsb2JhbFRvdWNoRm9yTXVzaWMoKTtcbiAgICAgICAgICAgIH0gY2F0Y2goZSkge1xuICAgICAgICAgICAgICAgIHNlbGYuX3NldHVwR2xvYmFsVG91Y2hGb3JNdXNpYygpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICB9LFxuICAgIFxuICAgIC8vIOmAmui/h+inpuaRuOaSreaUvumfs+S5kFxuICAgIF9wbGF5TXVzaWNPblRvdWNoOiBmdW5jdGlvbigpIHtcbiAgICAgICAgdmFyIHNlbGYgPSB0aGlzO1xuICAgICAgICBcbiAgICAgICAgLy8g6aaW5YWI5qOA5p+l5piv5ZCm5pyJ5q2j5Zyo5pKt5pS+55qE6Z+z5LmQXG4gICAgICAgIGlmIChjYy5hdWRpb0VuZ2luZS5pc011c2ljUGxheWluZygpKSB7XG4gICAgICAgICAgICB0aGlzLl9yZW1vdmVHbG9iYWxUb3VjaEZvck11c2ljKCk7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgICAgXG4gICAgICAgIC8vIOWmguaenOW3sue7j+aciemfs+mikeWJqui+ke+8jOebtOaOpeaSreaUvlxuICAgICAgICBpZiAodGhpcy5fYmdNdXNpY0NsaXApIHtcbiAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgICAgY2MuYXVkaW9FbmdpbmUucGxheU11c2ljKHRoaXMuX2JnTXVzaWNDbGlwLCB0cnVlKTtcbiAgICAgICAgICAgICAgICB0aGlzLl9tdXNpY1BsYXlpbmcgPSB0cnVlO1xuICAgICAgICAgICAgICAgIHRoaXMuX3JlbW92ZUdsb2JhbFRvdWNoRm9yTXVzaWMoKTtcbiAgICAgICAgICAgIH0gY2F0Y2goZSkge1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIFxuICAgICAgICAvLyDmsqHmnInpn7PpopHliarovpHvvIzpnIDopoHliqDovb1cbiAgICAgICAgY2MucmVzb3VyY2VzLmxvYWQoXCJzb3VuZC9sb2dpbl9iZ1wiLCBjYy5BdWRpb0NsaXAsIGZ1bmN0aW9uKGVyciwgY2xpcCkge1xuICAgICAgICAgICAgaWYgKGVycikge1xuICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIFxuICAgICAgICAgICAgc2VsZi5fYmdNdXNpY0NsaXAgPSBjbGlwO1xuICAgICAgICAgICAgXG4gICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICAgIGNjLmF1ZGlvRW5naW5lLnBsYXlNdXNpYyhjbGlwLCB0cnVlKTtcbiAgICAgICAgICAgICAgICBzZWxmLl9tdXNpY1BsYXlpbmcgPSB0cnVlO1xuICAgICAgICAgICAgICAgIHNlbGYuX3JlbW92ZUdsb2JhbFRvdWNoRm9yTXVzaWMoKTtcbiAgICAgICAgICAgIH0gY2F0Y2goZSkge1xuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICB9LFxuICAgIFxuICAgIC8vIOiuvue9ruWFqOWxgOinpuaRuOebkeWQrCAtIOeUqOaIt+eCueWHu+S7u+aEj+S9jee9ruinpuWPkemfs+S5kFxuICAgIF9zZXR1cEdsb2JhbFRvdWNoRm9yTXVzaWM6IGZ1bmN0aW9uKCkge1xuICAgICAgICAvLyDpmLLmraLph43lpI3mt7vliqDnm5HlkKzlmahcbiAgICAgICAgaWYgKHRoaXMuX3RvdWNoTGlzdGVuZXJBZGRlZCkge1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIFxuICAgICAgICB2YXIgc2VsZiA9IHRoaXM7XG4gICAgICAgIHRoaXMuX3RvdWNoTGlzdGVuZXJBZGRlZCA9IHRydWU7XG4gICAgICAgIFxuICAgICAgICAvLyBDb2NvcyBDcmVhdG9yIOWxgumdoueahOebkeWQrFxuICAgICAgICB0aGlzLl9jb2Nvc1RvdWNoSGFuZGxlciA9IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgc2VsZi5fcGxheU11c2ljT25Ub3VjaCgpO1xuICAgICAgICB9O1xuICAgICAgICB0aGlzLm5vZGUub24oY2MuTm9kZS5FdmVudFR5cGUuVE9VQ0hfU1RBUlQsIHRoaXMuX2NvY29zVG91Y2hIYW5kbGVyLCB0aGlzKTtcbiAgICAgICAgXG4gICAgICAgIC8vIFdlYiDmtY/op4jlmajlsYLpnaLnmoTnm5HlkKxcbiAgICAgICAgaWYgKGNjLnN5cy5pc0Jyb3dzZXIpIHtcbiAgICAgICAgICAgIHRoaXMuX2Jyb3dzZXJUb3VjaEhhbmRsZXIgPSBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgICBzZWxmLl9wbGF5TXVzaWNPblRvdWNoKCk7XG4gICAgICAgICAgICB9O1xuICAgICAgICAgICAgXG4gICAgICAgICAgICBkb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKCd0b3VjaHN0YXJ0JywgdGhpcy5fYnJvd3NlclRvdWNoSGFuZGxlciwgdHJ1ZSk7XG4gICAgICAgICAgICBkb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKCdtb3VzZWRvd24nLCB0aGlzLl9icm93c2VyVG91Y2hIYW5kbGVyLCB0cnVlKTtcbiAgICAgICAgICAgIGRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgdGhpcy5fYnJvd3NlclRvdWNoSGFuZGxlciwgdHJ1ZSk7XG4gICAgICAgICAgICBcbiAgICAgICAgfVxuICAgIH0sXG4gICAgXG4gICAgLy8g56e76Zmk5YWo5bGA6Kem5pG455uR5ZCsXG4gICAgX3JlbW92ZUdsb2JhbFRvdWNoRm9yTXVzaWM6IGZ1bmN0aW9uKCkge1xuICAgICAgICAvLyDnp7vpmaQgQ29jb3MgQ3JlYXRvciDlsYLpnaLnmoTnm5HlkKxcbiAgICAgICAgaWYgKHRoaXMuX2NvY29zVG91Y2hIYW5kbGVyKSB7XG4gICAgICAgICAgICB0aGlzLm5vZGUub2ZmKGNjLk5vZGUuRXZlbnRUeXBlLlRPVUNIX1NUQVJULCB0aGlzLl9jb2Nvc1RvdWNoSGFuZGxlciwgdGhpcyk7XG4gICAgICAgICAgICB0aGlzLl9jb2Nvc1RvdWNoSGFuZGxlciA9IG51bGw7XG4gICAgICAgIH1cbiAgICAgICAgXG4gICAgICAgIC8vIOenu+mZpOa1j+iniOWZqOWxgumdoueahOebkeWQrFxuICAgICAgICBpZiAoY2Muc3lzLmlzQnJvd3NlciAmJiB0aGlzLl9icm93c2VyVG91Y2hIYW5kbGVyKSB7XG4gICAgICAgICAgICBkb2N1bWVudC5yZW1vdmVFdmVudExpc3RlbmVyKCd0b3VjaHN0YXJ0JywgdGhpcy5fYnJvd3NlclRvdWNoSGFuZGxlciwgdHJ1ZSk7XG4gICAgICAgICAgICBkb2N1bWVudC5yZW1vdmVFdmVudExpc3RlbmVyKCdtb3VzZWRvd24nLCB0aGlzLl9icm93c2VyVG91Y2hIYW5kbGVyLCB0cnVlKTtcbiAgICAgICAgICAgIGRvY3VtZW50LnJlbW92ZUV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgdGhpcy5fYnJvd3NlclRvdWNoSGFuZGxlciwgdHJ1ZSk7XG4gICAgICAgICAgICB0aGlzLl9icm93c2VyVG91Y2hIYW5kbGVyID0gbnVsbDtcbiAgICAgICAgfVxuICAgICAgICBcbiAgICAgICAgdGhpcy5fdG91Y2hMaXN0ZW5lckFkZGVkID0gZmFsc2U7XG4gICAgfSxcblxuICAgIF9zaG93RXJyb3I6IGZ1bmN0aW9uKG1lc3NhZ2UpIHtcbiAgICAgICAgdGhpcy5fc2hvd1dhaXROb2RlKG1lc3NhZ2UpO1xuICAgICAgICB0aGlzLnNjaGVkdWxlT25jZShmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIHRoaXMuX2hpZGVXYWl0Tm9kZSgpO1xuICAgICAgICB9LCAyKTtcbiAgICB9LFxuXG4gICAgX3Nob3dMb2FkaW5nOiBmdW5jdGlvbihzaG93LCBtZXNzYWdlKSB7XG4gICAgICAgIGlmIChzaG93KSB7XG4gICAgICAgICAgICB0aGlzLl9zaG93V2FpdE5vZGUobWVzc2FnZSB8fCBcIuato+WcqOWkhOeQhi4uLlwiKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHRoaXMuX2hpZGVXYWl0Tm9kZSgpO1xuICAgICAgICB9XG4gICAgfSxcblxuICAgIF9zaG93V2FpdE5vZGU6IGZ1bmN0aW9uKG1lc3NhZ2UpIHtcbiAgICAgICAgaWYgKHRoaXMud2FpdF9ub2RlKSB7XG4gICAgICAgICAgICB0aGlzLndhaXRfbm9kZS5hY3RpdmUgPSB0cnVlO1xuICAgICAgICAgICAgaWYgKHRoaXMuX3dhaXRMYWJlbCkge1xuICAgICAgICAgICAgICAgIHRoaXMuX3dhaXRMYWJlbC5zdHJpbmcgPSBtZXNzYWdlIHx8IFwi5q2j5Zyo5aSE55CGLi4uXCI7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAodGhpcy5fbG9hZGluZ0ltYWdlKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5faXNBbmltYXRpbmcgPSB0cnVlO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfSxcblxuICAgIF9oaWRlV2FpdE5vZGU6IGZ1bmN0aW9uKCkge1xuICAgICAgICBpZiAodGhpcy53YWl0X25vZGUpIHtcbiAgICAgICAgICAgIHRoaXMud2FpdF9ub2RlLmFjdGl2ZSA9IGZhbHNlO1xuICAgICAgICAgICAgdGhpcy5faXNBbmltYXRpbmcgPSBmYWxzZTtcbiAgICAgICAgfVxuICAgIH0sXG5cbiAgICAvLyDnu5jliLblnIbop5Lnn6nlvaLovpPlhaXmoYbog4zmma/vvIjovoXliqnmlrnms5XvvIlcbiAgICAvLyDms6jmhI/vvJpDb2NvcyBDcmVhdG9yIEdyYXBoaWNzIOe7hOS7tuayoeaciSBhcmNUbyDmlrnms5XvvIzkvb/nlKggcm91bmRSZWN0IOS7o+abv1xuICAgIF9kcmF3SW5wdXRCZzogZnVuY3Rpb24oZ3JhcGhpY3MsIHdpZHRoLCBoZWlnaHQsIHJhZGl1cykge1xuICAgICAgICB2YXIgeCA9IC13aWR0aCAvIDI7XG4gICAgICAgIHZhciB5ID0gLWhlaWdodCAvIDI7XG4gICAgICAgIC8vIOS9v+eUqCBDb2NvcyBDcmVhdG9yIEdyYXBoaWNzIOeahCByb3VuZFJlY3Qg5pa55rOVXG4gICAgICAgIGdyYXBoaWNzLnJvdW5kUmVjdCh4LCB5LCB3aWR0aCwgaGVpZ2h0LCByYWRpdXMpO1xuICAgIH0sXG5cbiAgICB1cGRhdGU6IGZ1bmN0aW9uKGR0KSB7XG4gICAgICAgIGlmICh0aGlzLl9pc0FuaW1hdGluZyAmJiB0aGlzLl9sb2FkaW5nSW1hZ2UpIHtcbiAgICAgICAgICAgIC8vIOS9v+eUqCBhbmdsZSDmm7/ku6Plt7Llup/lvIPnmoQgcm90YXRpb24g5bGe5oCnXG4gICAgICAgICAgICB0aGlzLl9sb2FkaW5nSW1hZ2UuYW5nbGUgKz0gZHQgKiA0NTtcbiAgICAgICAgfVxuICAgIH0sXG5cbiAgICBfZG9XeExvZ2luOiBmdW5jdGlvbigpIHtcbiAgICAgICAgdmFyIHNlbGYgPSB0aGlzO1xuXG4gICAgICAgIGlmICghdGhpcy5fY2hlY2tBZ3JlZW1lbnQoKSkge1xuICAgICAgICAgICAgdGhpcy5fc2hvd0Vycm9yKFwi6K+35YWI5ZCM5oSP55So5oi35Y2P6K6uXCIpO1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgICAgdmFyIG15Z2xvYmFsID0gd2luZG93Lm15Z2xvYmFsO1xuICAgICAgICBpZiAoIW15Z2xvYmFsIHx8ICFteWdsb2JhbC5zb2NrZXQpIHtcbiAgICAgICAgICAgIHRoaXMuX3Nob3dFcnJvcihcIue9kee7nOacqui/nuaOpe+8jOivt+eojeWQjumHjeivlVwiKTtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIHRoaXMuX3Nob3dMb2FkaW5nKHRydWUsIFwi5q2j5Zyo55m75b2VLi4uXCIpO1xuXG4gICAgICAgIG15Z2xvYmFsLnNvY2tldC5yZXF1ZXN0X3d4TG9naW4oe1xuICAgICAgICAgICAgdW5pcXVlSUQ6IG15Z2xvYmFsLnBsYXllckRhdGEudW5pcXVlSUQsXG4gICAgICAgICAgICBhY2NvdW50SUQ6IG15Z2xvYmFsLnBsYXllckRhdGEuYWNjb3VudElELFxuICAgICAgICAgICAgbmlja05hbWU6IG15Z2xvYmFsLnBsYXllckRhdGEubmlja05hbWUsXG4gICAgICAgICAgICBhdmF0YXJVcmw6IG15Z2xvYmFsLnBsYXllckRhdGEuYXZhdGFyVXJsLFxuICAgICAgICB9LCBmdW5jdGlvbihlcnIsIHJlc3VsdCkge1xuICAgICAgICAgICAgc2VsZi5fc2hvd0xvYWRpbmcoZmFsc2UpO1xuXG4gICAgICAgICAgICBpZiAoZXJyICE9IDApIHtcbiAgICAgICAgICAgICAgICBzZWxmLl9zaG93RXJyb3IoXCLnmbvlvZXlpLHotKXvvIzor7fph43or5VcIik7XG4gICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBteWdsb2JhbC5wbGF5ZXJEYXRhLmdvYmFsX2NvdW50ID0gcmVzdWx0LmdvbGRjb3VudCB8fCAwO1xuICAgICAgICAgICAgY2MuZGlyZWN0b3IubG9hZFNjZW5lKFwiaGFsbFNjZW5lXCIpO1xuICAgICAgICB9KTtcbiAgICB9LFxuXG4gICAgX2RvUGhvbmVMb2dpbjogZnVuY3Rpb24oKSB7XG4gICAgICAgIGNvbnNvbGUubG9nKFwiPj4+IF9kb1Bob25lTG9naW4g6KKr6LCD55SoXCIpO1xuXG4gICAgICAgIC8vIPCflKcg5L+u5aSN77ya6Ziy5q2i6YeN5aSN54K55Ye75a+86Ie05aSa5Liq5by556qXXG4gICAgICAgIGlmICh0aGlzLl9waG9uZUxvZ2luUG9wdXBTaG93aW5nKSB7XG4gICAgICAgICAgICBjb25zb2xlLmxvZyhcIj4+PiDnmbvlvZXlvLnnqpfmraPlnKjmmL7npLrkuK3vvIzlv73nlaXph43lpI3osIPnlKhcIik7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoIXRoaXMuX2NoZWNrQWdyZWVtZW50KCkpIHtcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKFwiPj4+IOeUqOaIt+acquWQjOaEj+WNj+iurlwiKTtcbiAgICAgICAgICAgIHRoaXMuX3Nob3dFcnJvcihcIuivt+WFiOWQjOaEj+eUqOaIt+WNj+iurlwiKTtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIOiuvue9ruagh+W/l+S9je+8jOmYsuatoumHjeWkjeW8ueeql1xuICAgICAgICB0aGlzLl9waG9uZUxvZ2luUG9wdXBTaG93aW5nID0gdHJ1ZTtcblxuICAgICAgICBjb25zb2xlLmxvZyhcIj4+PiDlh4blpIfmmL7npLrmiYvmnLrnmbvlvZXlvLnnqpdcIik7XG4gICAgICAgIHRoaXMuX3Nob3dQaG9uZUxvZ2luUG9wdXAoKTtcbiAgICB9LFxuXG4gICAgX3Nob3dQaG9uZUxvZ2luUG9wdXA6IGZ1bmN0aW9uKCkge1xuICAgICAgICB2YXIgc2VsZiA9IHRoaXM7XG4gICAgICAgIFxuICAgICAgICBjb25zb2xlLmxvZyhcIj4+PiBfc2hvd1Bob25lTG9naW5Qb3B1cCDooqvosIPnlKhcIik7XG4gICAgICAgIGNvbnNvbGUubG9nKFwiPj4+IHBob25lX2xvZ2luX3ByZWZhYjpcIiwgdGhpcy5waG9uZV9sb2dpbl9wcmVmYWIgPyBcIuWtmOWcqFwiIDogXCLkuI3lrZjlnKhcIik7XG4gICAgICAgIFxuICAgICAgICBpZiAodGhpcy5waG9uZV9sb2dpbl9wcmVmYWIpIHtcbiAgICAgICAgICAgIHRoaXMuX2NyZWF0ZVBob25lTG9naW5Qb3B1cCh0aGlzLnBob25lX2xvZ2luX3ByZWZhYik7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBjb25zb2xlLmxvZyhcIj4+PiDliqjmgIHliqDovb0gcHJlZmFicy9waG9uZV9sb2dpblwiKTtcbiAgICAgICAgICAgIGNjLnJlc291cmNlcy5sb2FkKFwicHJlZmFicy9waG9uZV9sb2dpblwiLCBjYy5QcmVmYWIsIGZ1bmN0aW9uKGVyciwgcHJlZmFiKSB7XG4gICAgICAgICAgICAgICAgaWYgKGVycikge1xuICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmVycm9yKFwi5Yqg6L29IHBob25lX2xvZ2luIHByZWZhYiDlpLHotKU6XCIsIGVycik7XG4gICAgICAgICAgICAgICAgICAgIHNlbGYuX3Nob3dFcnJvcihcIuaXoOazleaYvuekuueZu+W9leW8ueeql1wiKTtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhcIj4+PiBwaG9uZV9sb2dpbiBwcmVmYWIg5Yqg6L295oiQ5YqfXCIpO1xuICAgICAgICAgICAgICAgIHNlbGYuX2NyZWF0ZVBob25lTG9naW5Qb3B1cChwcmVmYWIpO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICB9LFxuXG4gICAgX2NyZWF0ZVBob25lTG9naW5Qb3B1cDogZnVuY3Rpb24ocHJlZmFiKSB7XG4gICAgICAgIGNvbnNvbGUubG9nKFwiPj4+IF9jcmVhdGVQaG9uZUxvZ2luUG9wdXAg6KKr6LCD55SoXCIpO1xuICAgICAgICBcbiAgICAgICAgLy8g5Yqo5oCB5Yib5bu65by556qX77yI5L2/55So5q2j56Gu55qE6IOM5pmv5Zu+5ZKM5bC65a+477yJXG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgICBjb25zb2xlLmxvZyhcIj4+PiDlvIDlp4vliqjmgIHliJvlu7rnmbvlvZXlvLnnqpdcIik7XG4gICAgICAgICAgICB2YXIgcG9wdXAgPSB0aGlzLl9jcmVhdGVQaG9uZUxvZ2luRHluYW1pYygpO1xuICAgICAgICAgICAgY29uc29sZS5sb2coXCI+Pj4g55m75b2V5by556qX5Yib5bu65a6M5oiQOlwiLCBwb3B1cCA/IHBvcHVwLm5hbWUgOiBcIm51bGxcIik7XG4gICAgICAgICAgICB0aGlzLl9waG9uZUxvZ2luUG9wdXAgPSBwb3B1cDtcbiAgICAgICAgfSBjYXRjaCAoZSkge1xuICAgICAgICAgICAgY29uc29sZS5lcnJvcihcIuWIm+W7uuaJi+acuueZu+W9leW8ueeql+Wksei0pTpcIiwgZSk7XG4gICAgICAgICAgICB0aGlzLl9zaG93RXJyb3IoXCLml6Dms5XmmL7npLrnmbvlvZXlvLnnqpc6IFwiICsgZS5tZXNzYWdlKTtcbiAgICAgICAgICAgIC8vIPCflKcg5L+u5aSN77ya5Yib5bu65aSx6LSl5pe26YeN572u5qCH5b+X5L2N77yM5YWB6K645LiL5qyh54K55Ye76YeN6K+VXG4gICAgICAgICAgICB0aGlzLl9waG9uZUxvZ2luUG9wdXBTaG93aW5nID0gZmFsc2U7XG4gICAgICAgIH1cbiAgICB9LFxuXG4gICAgLy8g5Yqo5oCB5Yib5bu65omL5py655m75b2V5by556qXIC0g5L2/55So5q2j56Gu55qE6IOM5pmv5Zu+5ZKM5bC65a+4XG4gICAgX2NyZWF0ZVBob25lTG9naW5EeW5hbWljOiBmdW5jdGlvbigpIHtcbiAgICAgICAgdmFyIHNlbGYgPSB0aGlzO1xuXG4gICAgICAgIC8vID09PT09PT09PT09PT09PT09PT09IOW8ueeql+WwuuWvuO+8iOWbuuWumuWwuuWvuO+8jOS4juWbvueJh+WMuemFje+8iT09PT09PT09PT09PT09PT09PT09XG4gICAgICAgIC8vIOS9v+eUqOWbuuWumuWwuuWvuO+8muWuveW6pjUyMHB477yM6auY5bqmNjgwcHjvvIjkuI5sb2dpbl9iZy5wbmflm77niYflsLrlr7jkuIDoh7TvvIlcbiAgICAgICAgLy8g5Zyo5bCP5bGP5bmV5LiK6Ieq5Yqo57yp5pS+XG4gICAgICAgIHZhciB3aW5XID0gY2Mud2luU2l6ZS53aWR0aDtcbiAgICAgICAgdmFyIHdpbkggPSBjYy53aW5TaXplLmhlaWdodDtcblxuICAgICAgICAvLyDlm77niYfljp/lp4vlsLrlr7ggLSDosIPlrr3lvLnnqpdcbiAgICAgICAgdmFyIGltZ1dpZHRoID0gNTgwOyAgLy8g5Y6f5p2l5pivNTIw77yM5aKe5Yqg5YiwNTgwXG4gICAgICAgIHZhciBpbWdIZWlnaHQgPSA2ODA7XG5cbiAgICAgICAgLy8g5aaC5p6c5bGP5bmV5aSq5bCP77yM5oyJ5q+U5L6L57yp5bCPXG4gICAgICAgIHZhciBzY2FsZSA9IDEuMDtcbiAgICAgICAgaWYgKHdpblcgPCBpbWdXaWR0aCArIDQwKSB7XG4gICAgICAgICAgICBzY2FsZSA9ICh3aW5XIC0gNDApIC8gaW1nV2lkdGg7XG4gICAgICAgIH1cbiAgICAgICAgdmFyIHBhbmVsV2lkdGggPSBpbWdXaWR0aCAqIHNjYWxlO1xuICAgICAgICB2YXIgcGFuZWxIZWlnaHQgPSBpbWdIZWlnaHQgKiBzY2FsZTtcblxuICAgICAgICBjb25zb2xlLmxvZyhcIueZu+W9leW8ueeql+WwuuWvuDogXCIgKyBwYW5lbFdpZHRoICsgXCIgeCBcIiArIHBhbmVsSGVpZ2h0ICsgXCIsIOe8qeaUvuavlOS+izogXCIgKyBzY2FsZSk7XG5cbiAgICAgICAgLy8gPT09PT09PT09PT09PT09PT09PT0g5by556qX5qC56IqC54K5ID09PT09PT09PT09PT09PT09PT09XG4gICAgICAgIHZhciBwb3B1cCA9IG5ldyBjYy5Ob2RlKFwiTG9naW5EaWFsb2dcIik7XG4gICAgICAgIHBvcHVwLnBhcmVudCA9IHRoaXMubm9kZTtcbiAgICAgICAgcG9wdXAuc2V0Q29udGVudFNpemUoY2Muc2l6ZSh3aW5XLCB3aW5IKSk7XG4gICAgICAgIHBvcHVwLnNldFBvc2l0aW9uKDAsIDApO1xuICAgICAgICBwb3B1cC56SW5kZXggPSAxMDAwO1xuXG4gICAgICAgIC8vIOa3u+WKoCBCbG9ja0lucHV0RXZlbnRzIOe7hOS7tumYu+atouW6leWxgueCueWHu1xuICAgICAgICBwb3B1cC5hZGRDb21wb25lbnQoY2MuQmxvY2tJbnB1dEV2ZW50cyk7XG5cbiAgICAgICAgLy8gPT09PT09PT09PT09PT09PT09PT0g5Y2K6YCP5piO6IOM5pmv6YGu572pID09PT09PT09PT09PT09PT09PT09XG4gICAgICAgIHZhciBtYXNrID0gbmV3IGNjLk5vZGUoXCJNYXNrXCIpO1xuICAgICAgICBtYXNrLnBhcmVudCA9IHBvcHVwO1xuICAgICAgICBtYXNrLnNldENvbnRlbnRTaXplKGNjLnNpemUod2luVywgd2luSCkpO1xuICAgICAgICBtYXNrLnNldFBvc2l0aW9uKDAsIDApO1xuICAgICAgICB2YXIgbWFza1Nwcml0ZSA9IG1hc2suYWRkQ29tcG9uZW50KGNjLlNwcml0ZSk7XG4gICAgICAgIG1hc2tTcHJpdGUuc2l6ZU1vZGUgPSBjYy5TcHJpdGUuU2l6ZU1vZGUuQ1VTVE9NO1xuICAgICAgICBtYXNrLmNvbG9yID0gbmV3IGNjLkNvbG9yKDAsIDAsIDApO1xuICAgICAgICBtYXNrLm9wYWNpdHkgPSAxNTA7XG5cbiAgICAgICAgLy8g8J+UpyDkv67lpI3vvJrngrnlh7vpga7nvanlsYLlhbPpl63lvLnnqpdcbiAgICAgICAgbWFzay5vbihjYy5Ob2RlLkV2ZW50VHlwZS5UT1VDSF9FTkQsIGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgY29uc29sZS5sb2coXCI+Pj4g54K55Ye76YGu572p5bGC5YWz6Zet5by556qXXCIpO1xuICAgICAgICAgICAgLy8g6YeN572u5qCH5b+X5L2NXG4gICAgICAgICAgICBzZWxmLl9waG9uZUxvZ2luUG9wdXBTaG93aW5nID0gZmFsc2U7XG5cbiAgICAgICAgICAgIC8vIOa4heeQhuWOn+eUnyBIVE1MIGlucHV0IOWFg+e0oFxuICAgICAgICAgICAgaWYgKGNjLnN5cy5pc0Jyb3dzZXIpIHtcbiAgICAgICAgICAgICAgICB2YXIgY29udGFpbmVyID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ25hdGl2ZS1pbnB1dC1jb250YWluZXInKTtcbiAgICAgICAgICAgICAgICBpZiAoY29udGFpbmVyKSB7XG4gICAgICAgICAgICAgICAgICAgIGNvbnRhaW5lci5yZW1vdmUoKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICAvLyDlhbPpl63liqjnlLtcbiAgICAgICAgICAgIGNjLnR3ZWVuKHBhbmVsKVxuICAgICAgICAgICAgICAgIC50bygwLjE1LCB7IHNjYWxlOiAwLjgsIG9wYWNpdHk6IDAgfSwgeyBlYXNpbmc6ICdiYWNrSW4nIH0pXG4gICAgICAgICAgICAgICAgLmNhbGwoZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgICAgICAgIHBvcHVwLmRlc3Ryb3koKTtcbiAgICAgICAgICAgICAgICB9KVxuICAgICAgICAgICAgICAgIC5zdGFydCgpO1xuICAgICAgICB9LCB0aGlzKTtcblxuICAgICAgICAvLyA9PT09PT09PT09PT09PT09PT09PSDlvLnnqpfpnaLmnb8gPT09PT09PT09PT09PT09PT09PT1cbiAgICAgICAgdmFyIHBhbmVsID0gbmV3IGNjLk5vZGUoXCJQYW5lbFwiKTtcbiAgICAgICAgcGFuZWwucGFyZW50ID0gcG9wdXA7XG4gICAgICAgIHBhbmVsLnNldENvbnRlbnRTaXplKGNjLnNpemUocGFuZWxXaWR0aCwgcGFuZWxIZWlnaHQpKTtcbiAgICAgICAgcGFuZWwuc2V0UG9zaXRpb24oMCwgMCk7XG4gICAgICAgIHBhbmVsLnNjYWxlID0gMC43O1xuICAgICAgICBwYW5lbC5vcGFjaXR5ID0gMDtcblxuICAgICAgICAvLyA9PT09PT09PT09PT09PT09PT09PSDlvLnnqpfog4zmma/vvIjkvb/nlKjmraPnoa7nmoQgbG9naW5fYmcg5Zu+54mH77yJPT09PT09PT09PT09PT09PT09PT1cbiAgICAgICAgdmFyIGJnID0gbmV3IGNjLk5vZGUoXCJCZ1wiKTtcbiAgICAgICAgYmcucGFyZW50ID0gcGFuZWw7XG4gICAgICAgIC8vIOWFiOiuvue9ruS4gOS4quS4tOaXtuWwuuWvuFxuICAgICAgICBiZy5zZXRDb250ZW50U2l6ZShjYy5zaXplKHBhbmVsV2lkdGgsIHBhbmVsSGVpZ2h0KSk7XG4gICAgICAgIGJnLnNldFBvc2l0aW9uKDAsIDApO1xuICAgICAgICBiZy56SW5kZXggPSAwOyAgLy8g6IOM5pmv5Zyo5pyA5bqV5bGCXG5cbiAgICAgICAgLy8g5YWI5re75YqgU3ByaXRl57uE5Lu25bm26K6+572uc2l6ZU1vZGVcbiAgICAgICAgdmFyIGJnU3ByaXRlID0gYmcuYWRkQ29tcG9uZW50KGNjLlNwcml0ZSk7XG4gICAgICAgIGJnU3ByaXRlLnNpemVNb2RlID0gY2MuU3ByaXRlLlNpemVNb2RlLkNVU1RPTTsgIC8vIOS9v+eUqOiHquWumuS5ieWwuuWvuO+8jOS4jei3n+maj+WbvueJh1xuICAgICAgICBiZ1Nwcml0ZS5zcmNCbGVuZEZhY3RvciA9IGNjLm1hY3JvLkJsZW5kRmFjdG9yLlNSQ19BTFBIQTtcbiAgICAgICAgYmdTcHJpdGUuZHN0QmxlbmRGYWN0b3IgPSBjYy5tYWNyby5CbGVuZEZhY3Rvci5PTkVfTUlOVVNfU1JDX0FMUEhBO1xuXG4gICAgICAgIC8vIOWKoOi9veiDjOaZr+Wbvu+8iOS9v+eUqCBVSS9sb2dpbi9sb2dpbl9iZy5wbmfvvIlcbiAgICAgICAgY2MucmVzb3VyY2VzLmxvYWQoXCJVSS9sb2dpbi9sb2dpbl9iZ1wiLCBjYy5TcHJpdGVGcmFtZSwgZnVuY3Rpb24oZXJyLCBzcHJpdGVGcmFtZSkge1xuICAgICAgICAgICAgaWYgKGVycikge1xuICAgICAgICAgICAgICAgIGNvbnNvbGUud2FybihcIuWKoOi9vSBsb2dpbl9iZyDlpLHotKXvvIzkvb/nlKjpu5jorqTog4zmma86XCIsIGVycik7XG4gICAgICAgICAgICAgICAgLy8g6ZmN57qn77ya5L2/55So5riQ5Y+Y6IOM5pmvXG4gICAgICAgICAgICAgICAgYmcucmVtb3ZlQ29tcG9uZW50KGNjLlNwcml0ZSk7XG4gICAgICAgICAgICAgICAgdmFyIGJnR2Z4ID0gYmcuYWRkQ29tcG9uZW50KGNjLkdyYXBoaWNzKTtcbiAgICAgICAgICAgICAgICBiZ0dmeC5maWxsQ29sb3IgPSBuZXcgY2MuQ29sb3IoNDUsIDM1LCAyNSk7XG4gICAgICAgICAgICAgICAgYmdHZngucm91bmRSZWN0KC1wYW5lbFdpZHRoLzIsIC1wYW5lbEhlaWdodC8yLCBwYW5lbFdpZHRoLCBwYW5lbEhlaWdodCwgMjApO1xuICAgICAgICAgICAgICAgIGJnR2Z4LmZpbGwoKTtcbiAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIC8vIOiuvue9rnNwcml0ZUZyYW1lXG4gICAgICAgICAgICBiZ1Nwcml0ZS5zcHJpdGVGcmFtZSA9IHNwcml0ZUZyYW1lO1xuXG4gICAgICAgICAgICAvLyDlhbPplK7vvJrlho3mrKHnoa7kv53lsLrlr7jmraPnoa7vvIjpmLLmraLooqvlm77niYflsLrlr7jopobnm5bvvIlcbiAgICAgICAgICAgIGJnLnNldENvbnRlbnRTaXplKGNjLnNpemUocGFuZWxXaWR0aCwgcGFuZWxIZWlnaHQpKTtcblxuICAgICAgICAgICAgY29uc29sZS5sb2coXCLog4zmma/lm77liqDovb3miJDlip/vvIzmmL7npLrlsLrlr7g6IFwiICsgYmcud2lkdGggKyBcIiB4IFwiICsgYmcuaGVpZ2h0KTtcbiAgICAgICAgfSk7XG5cbiAgICAgICAgLy8gPT09PT09PT09PT09PT09PT09PT0g5qCH6aKY5paH5a2X77yI5qyi5LmQ55m75b2V77yJPT09PT09PT09PT09PT09PT09PT1cbiAgICAgICAgLy8g6YeR6Imy5o+P6L6577yM55m96Imy5Li75L2T77yM5bGF5Lit77yM6aG26YOo6Led6L65NDBweFxuICAgICAgICB2YXIgdGl0bGVOb2RlID0gbmV3IGNjLk5vZGUoXCJUaXRsZVwiKTtcbiAgICAgICAgdGl0bGVOb2RlLnBhcmVudCA9IHBhbmVsO1xuICAgICAgICB0aXRsZU5vZGUuc2V0UG9zaXRpb24oMCwgcGFuZWxIZWlnaHQvMiAtIDYwKTtcbiAgICAgICAgXG4gICAgICAgIHZhciB0aXRsZUxhYmVsID0gdGl0bGVOb2RlLmFkZENvbXBvbmVudChjYy5MYWJlbCk7XG4gICAgICAgIHRpdGxlTGFiZWwuc3RyaW5nID0gXCLmrKLkuZDnmbvlvZVcIjtcbiAgICAgICAgdGl0bGVMYWJlbC5mb250U2l6ZSA9IDM2O1xuICAgICAgICB0aXRsZUxhYmVsLmxpbmVIZWlnaHQgPSA0NDtcbiAgICAgICAgdGl0bGVMYWJlbC5ob3Jpem9udGFsQWxpZ24gPSBjYy5MYWJlbC5Ib3Jpem9udGFsQWxpZ24uQ0VOVEVSO1xuICAgICAgICB0aXRsZU5vZGUuY29sb3IgPSBuZXcgY2MuQ29sb3IoMjU1LCAyNTUsIDI1NSk7XG4gICAgICAgIFxuICAgICAgICAvLyDph5HoibLmj4/ovrlcbiAgICAgICAgdmFyIHRpdGxlT3V0bGluZSA9IHRpdGxlTm9kZS5hZGRDb21wb25lbnQoY2MuTGFiZWxPdXRsaW5lKTtcbiAgICAgICAgdGl0bGVPdXRsaW5lLmNvbG9yID0gbmV3IGNjLkNvbG9yKDIxOCwgMTY1LCAzMik7IC8vIOmHkeiJslxuICAgICAgICB0aXRsZU91dGxpbmUud2lkdGggPSAzO1xuXG4gICAgICAgIC8vID09PT09PT09PT09PT09PT09PT09IOWFs+mXreaMiemSru+8iOWPs+S4iuinkuWchuW9ou+8jOe6oumHkeiJsu+8jDQ2eDQ277yJPT09PT09PT09PT09PT09PT09PT1cbiAgICAgICAgdmFyIGNsb3NlQnRuID0gbmV3IGNjLk5vZGUoXCJCdG5DbG9zZVwiKTtcbiAgICAgICAgY2xvc2VCdG4ucGFyZW50ID0gcGFuZWw7XG4gICAgICAgIGNsb3NlQnRuLnNldENvbnRlbnRTaXplKGNjLnNpemUoNDYsIDQ2KSk7XG4gICAgICAgIGNsb3NlQnRuLnNldFBvc2l0aW9uKHBhbmVsV2lkdGgvMiAtIDM1LCBwYW5lbEhlaWdodC8yIC0gMzUpO1xuICAgICAgICBcbiAgICAgICAgLy8g57qi6YeR6Imy5ZyG5b2i6IOM5pmvXG4gICAgICAgIHZhciBjbG9zZUdmeCA9IGNsb3NlQnRuLmFkZENvbXBvbmVudChjYy5HcmFwaGljcyk7XG4gICAgICAgIGNsb3NlR2Z4LmZpbGxDb2xvciA9IG5ldyBjYy5Db2xvcigyMDAsIDYwLCA2MCk7IC8vIOe6ouiJslxuICAgICAgICBjbG9zZUdmeC5jaXJjbGUoMCwgMCwgMjMpO1xuICAgICAgICBjbG9zZUdmeC5maWxsKCk7XG4gICAgICAgIGNsb3NlR2Z4LnN0cm9rZUNvbG9yID0gbmV3IGNjLkNvbG9yKDIxOCwgMTY1LCAzMik7IC8vIOmHkeiJsui+ueahhlxuICAgICAgICBjbG9zZUdmeC5saW5lV2lkdGggPSAyO1xuICAgICAgICBjbG9zZUdmeC5jaXJjbGUoMCwgMCwgMjIpO1xuICAgICAgICBjbG9zZUdmeC5zdHJva2UoKTtcbiAgICAgICAgXG4gICAgICAgIC8vIFgg56ym5Y+3XG4gICAgICAgIHZhciBjbG9zZVggPSBuZXcgY2MuTm9kZShcIlhcIik7XG4gICAgICAgIGNsb3NlWC5wYXJlbnQgPSBjbG9zZUJ0bjtcbiAgICAgICAgdmFyIGNsb3NlWExhYmVsID0gY2xvc2VYLmFkZENvbXBvbmVudChjYy5MYWJlbCk7XG4gICAgICAgIGNsb3NlWExhYmVsLnN0cmluZyA9IFwiw5dcIjtcbiAgICAgICAgY2xvc2VYTGFiZWwuZm9udFNpemUgPSAyODtcbiAgICAgICAgY2xvc2VYTGFiZWwubGluZUhlaWdodCA9IDMyO1xuICAgICAgICBjbG9zZVhMYWJlbC5ob3Jpem9udGFsQWxpZ24gPSBjYy5MYWJlbC5Ib3Jpem9udGFsQWxpZ24uQ0VOVEVSO1xuICAgICAgICBjbG9zZVguY29sb3IgPSBuZXcgY2MuQ29sb3IoMjU1LCAyNTUsIDI1NSk7XG5cbiAgICAgICAgY2xvc2VCdG4ub24oY2MuTm9kZS5FdmVudFR5cGUuVE9VQ0hfRU5ELCBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKFwiPj4+IOeCueWHu+WFs+mXreaMiemSrlwiKTtcbiAgICAgICAgICAgIC8vIPCflKcg5L+u5aSN77ya6YeN572u5by556qX5pi+56S65qCH5b+X5L2NXG4gICAgICAgICAgICBzZWxmLl9waG9uZUxvZ2luUG9wdXBTaG93aW5nID0gZmFsc2U7XG4gICAgICAgICAgICBjb25zb2xlLmxvZyhcIj4+PiDlt7Lph43nva4gX3Bob25lTG9naW5Qb3B1cFNob3dpbmcg5Li6IGZhbHNlXCIpO1xuXG4gICAgICAgICAgICAvLyDmuIXnkIbljp/nlJ8gSFRNTCBpbnB1dCDlhYPntKBcbiAgICAgICAgICAgIGlmIChjYy5zeXMuaXNCcm93c2VyKSB7XG4gICAgICAgICAgICAgICAgdmFyIGNvbnRhaW5lciA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCduYXRpdmUtaW5wdXQtY29udGFpbmVyJyk7XG4gICAgICAgICAgICAgICAgaWYgKGNvbnRhaW5lcikge1xuICAgICAgICAgICAgICAgICAgICBjb250YWluZXIucmVtb3ZlKCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgLy8g5YWz6Zet5Yqo55S7XG4gICAgICAgICAgICBjYy50d2VlbihwYW5lbClcbiAgICAgICAgICAgICAgICAudG8oMC4xNSwgeyBzY2FsZTogMC44LCBvcGFjaXR5OiAwIH0sIHsgZWFzaW5nOiAnYmFja0luJyB9KVxuICAgICAgICAgICAgICAgIC5jYWxsKGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICAgICAgICBwb3B1cC5kZXN0cm95KCk7XG4gICAgICAgICAgICAgICAgfSlcbiAgICAgICAgICAgICAgICAuc3RhcnQoKTtcbiAgICAgICAgfSwgdGhpcyk7XG5cbiAgICAgICAgLy8gPT09PT09PT09PT09PT09PT09PT0g6KGo5Y2V5biD5bGA5Y+C5pWwID09PT09PT09PT09PT09PT09PT09XG4gICAgICAgIC8vIOagueaNruiDjOaZr+WbvmxvZ2luX2JnLnBuZyg1MjB4NjgwKeeahOeyvuehrumihOeVmeS9jee9ruiuvue9ruWFg+e0oFxuICAgICAgICAvLyDkvb/nlKjpobnnm67njrDmnInnmoRVSei1hOa6kO+8mlxuICAgICAgICAvLyAgIGljb25fcGhvbmUucG5nIC0g5omL5py65Zu+5qCHXG4gICAgICAgIC8vICAgaWNvbl9zaGllbGQucG5nIC0g6aqM6K+B56CB5Zu+5qCHXG4gICAgICAgIC8vICAgZ2V0X21vYmlsZV9jb2RlLnBuZyAtIOiOt+WPlumqjOivgeeggeaMiemSrlxuXG4gICAgICAgIC8vIOiuoeeul+e8qeaUvuavlOS+i++8iOWwj+Wxj+W5lemAgumFje+8iVxuICAgICAgICB2YXIgc2NhbGVSYXRpbyA9IHBhbmVsV2lkdGggLyA1MjA7XG5cbiAgICAgICAgLy8g6L6T5YWl5qGG5bC65a+4XG4gICAgICAgIHZhciBpbnB1dFdpZHRoID0gMjIwICogc2NhbGVSYXRpbzsgICAvLyDovpPlhaXmoYblrr3luqZcbiAgICAgICAgdmFyIGlucHV0SGVpZ2h0ID0gNDUgKiBzY2FsZVJhdGlvOyAgIC8vIOi+k+WFpeahhumrmOW6pu+8iOWHj+Wwj++8iVxuICAgICAgICB2YXIgaWNvblNpemUgPSAyNSAqIHNjYWxlUmF0aW87ICAgICAgLy8g5Zu+5qCH5aSn5bCPXG4gICAgICAgIHZhciBmb3JtWTEgPSAxMzAgKiBzY2FsZVJhdGlvOyAgICAgICAgLy8g56ys5LiA5Liq6L6T5YWl5qGGWeWdkOagh++8iOWQkeS4i+enu+WKqO+8iVxuICAgICAgICB2YXIgZm9ybVkyID0gNTAgKiBzY2FsZVJhdGlvOyAgICAgICAvLyDnrKzkuozkuKrovpPlhaXmoYZZ5Z2Q5qCHXG4gICAgICAgIHZhciBnZXRDb2RlQnRuV2lkdGggPSA5MCAqIHNjYWxlUmF0aW87ICAvLyDojrflj5bpqozor4HnoIHmjInpkq7lrr3luqZcbiAgICAgICAgdmFyIGJ0bkhlaWdodCA9IDQ1ICogc2NhbGVSYXRpbzsgICAgIC8vIOe7n+S4gOaMiemSrumrmOW6plxuXG4gICAgICAgIGNvbnNvbGUubG9nKFwi5biD5bGA5Y+C5pWwOiBzY2FsZVJhdGlvPVwiICsgc2NhbGVSYXRpby50b0ZpeGVkKDIpKTtcblxuICAgICAgICAvLyA9PT09PT09PT09PT09PT09PT09PSDmiYvmnLrlj7fovpPlhaXooYwgPT09PT09PT09PT09PT09PT09PT1cbiAgICAgICAgLy8g5biD5bGA77yaW+Wbvuagh10gW+i+k+WFpeahhl0g5pW05L2T5bGF5LitXG4gICAgICAgIHZhciBwaG9uZVJvd1dpZHRoID0gaWNvblNpemUgKyAxNSArIGlucHV0V2lkdGg7ICAvLyDmgLvlrr3luqZcbiAgICAgICAgdmFyIHBob25lUm93WCA9IDA7ICAvLyDmlbTkvZPlsYXkuK1cblxuICAgICAgICAvLyDmiYvmnLrlm77moIcgLSDmlL7lnKjovpPlhaXmoYblt6bovrlcbiAgICAgICAgdmFyIHBob25lSWNvbk5vZGUgPSBuZXcgY2MuTm9kZShcIlBob25lSWNvblwiKTtcbiAgICAgICAgcGhvbmVJY29uTm9kZS5wYXJlbnQgPSBwYW5lbDtcbiAgICAgICAgcGhvbmVJY29uTm9kZS5zZXRQb3NpdGlvbigtcGhvbmVSb3dXaWR0aC8yICsgaWNvblNpemUvMiArIDEwLCBmb3JtWTEpO1xuICAgICAgICBwaG9uZUljb25Ob2RlLnNldENvbnRlbnRTaXplKGNjLnNpemUoaWNvblNpemUsIGljb25TaXplKSk7XG5cbiAgICAgICAgY2MucmVzb3VyY2VzLmxvYWQoXCJVSS9sb2dpbi9pY29uX3Bob25lXCIsIGNjLlNwcml0ZUZyYW1lLCBmdW5jdGlvbihlcnIsIHNwcml0ZUZyYW1lKSB7XG4gICAgICAgICAgICBpZiAoIWVycikge1xuICAgICAgICAgICAgICAgIHZhciBpY29uU3ByaXRlID0gcGhvbmVJY29uTm9kZS5hZGRDb21wb25lbnQoY2MuU3ByaXRlKTtcbiAgICAgICAgICAgICAgICBpY29uU3ByaXRlLnNwcml0ZUZyYW1lID0gc3ByaXRlRnJhbWU7XG4gICAgICAgICAgICAgICAgaWNvblNwcml0ZS5zaXplTW9kZSA9IGNjLlNwcml0ZS5TaXplTW9kZS5DVVNUT007XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuXG4gICAgICAgIC8vID09PT09PT09PT09PT09PT09PT09IOaJi+acuuWPt+i+k+WFpeahhiA9PT09PT09PT09PT09PT09PT09PVxuICAgICAgICAvLyBsb2dpbl9iZy5wbmcg5Lit5bey5YyF5ZCr6L6T5YWl5qGG6IOM5pmv77yM5Y+q6ZyA5pS+572u6YCP5piO55qEIEVkaXRCb3hcbiAgICAgICAgLy8g5rOo5oSP77ya55Sx5LqOIHBhbmVsIOaciee8qeaUvuWKqOeUu++8jEVkaXRCb3gg6ZyA6KaB5Zyo5Yqo55S75a6M5oiQ5ZCO5Yib5bu677yM5ZCm5YiZ54K55Ye75Yy65Z+f5L2N572u5LiN5a+5XG4gICAgICAgIHZhciBwaG9uZUlucHV0Tm9kZSA9IG5ldyBjYy5Ob2RlKFwiUGhvbmVJbnB1dFwiKTtcbiAgICAgICAgcGhvbmVJbnB1dE5vZGUucGFyZW50ID0gcGFuZWw7XG4gICAgICAgIHBob25lSW5wdXROb2RlLnNldENvbnRlbnRTaXplKGNjLnNpemUoaW5wdXRXaWR0aCwgaW5wdXRIZWlnaHQpKTtcbiAgICAgICAgcGhvbmVJbnB1dE5vZGUuc2V0UG9zaXRpb24oLXBob25lUm93V2lkdGgvMiArIGljb25TaXplICsgMTUgKyBpbnB1dFdpZHRoLzIsIGZvcm1ZMSk7XG4gICAgICAgIHBob25lSW5wdXROb2RlLnpJbmRleCA9IDEwMDtcblxuICAgICAgICB2YXIgcGhvbmVFZGl0Qm94ID0gbnVsbDsgIC8vIOW7tui/n+WIm+W7ulxuXG4gICAgICAgIC8vID09PT09PT09PT09PT09PT09PT09IOmqjOivgeeggei+k+WFpeihjCA9PT09PT09PT09PT09PT09PT09PVxuICAgICAgICAvLyDluIPlsYDvvJpb5Zu+5qCHXSBb6L6T5YWl5qGGXSBb6I635Y+W6aqM6K+B56CB5oyJ6ZKuXSDmlbTkvZPlsYXkuK1cbiAgICAgICAgdmFyIGNvZGVJbnB1dFcgPSBpbnB1dFdpZHRoIC0gZ2V0Q29kZUJ0bldpZHRoIC0gMTA7ICAvLyDpqozor4HnoIHovpPlhaXmoYblrr3luqZcbiAgICAgICAgdmFyIGNvZGVSb3dXaWR0aCA9IGljb25TaXplICsgNSArIGNvZGVJbnB1dFcgKyA1ICsgZ2V0Q29kZUJ0bldpZHRoOyAgLy8g5oC75a695bqmXG5cbiAgICAgICAgLy8g6aqM6K+B56CB5Zu+5qCHXG4gICAgICAgIHZhciBjb2RlSWNvbk5vZGUgPSBuZXcgY2MuTm9kZShcIkNvZGVJY29uXCIpO1xuICAgICAgICBjb2RlSWNvbk5vZGUucGFyZW50ID0gcGFuZWw7XG4gICAgICAgIGNvZGVJY29uTm9kZS5zZXRQb3NpdGlvbigtY29kZVJvd1dpZHRoLzIgKyBpY29uU2l6ZS8yICsgMTAsIGZvcm1ZMik7XG4gICAgICAgIGNvZGVJY29uTm9kZS5zZXRDb250ZW50U2l6ZShjYy5zaXplKGljb25TaXplLCBpY29uU2l6ZSkpO1xuXG4gICAgICAgIGNjLnJlc291cmNlcy5sb2FkKFwiVUkvbG9naW4vaWNvbl9zaGllbGRcIiwgY2MuU3ByaXRlRnJhbWUsIGZ1bmN0aW9uKGVyciwgc3ByaXRlRnJhbWUpIHtcbiAgICAgICAgICAgIGlmICghZXJyKSB7XG4gICAgICAgICAgICAgICAgdmFyIGljb25TcHJpdGUgPSBjb2RlSWNvbk5vZGUuYWRkQ29tcG9uZW50KGNjLlNwcml0ZSk7XG4gICAgICAgICAgICAgICAgaWNvblNwcml0ZS5zcHJpdGVGcmFtZSA9IHNwcml0ZUZyYW1lO1xuICAgICAgICAgICAgICAgIGljb25TcHJpdGUuc2l6ZU1vZGUgPSBjYy5TcHJpdGUuU2l6ZU1vZGUuQ1VTVE9NO1xuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcblxuICAgICAgICAvLyA9PT09PT09PT09PT09PT09PT09PSDpqozor4HnoIHovpPlhaXmoYYgPT09PT09PT09PT09PT09PT09PT1cbiAgICAgICAgLy8gbG9naW5fYmcucG5nIOS4reW3suWMheWQq+i+k+WFpeahhuiDjOaZr++8jOWPqumcgOaUvue9rumAj+aYjueahCBFZGl0Qm94XG4gICAgICAgIC8vIOazqOaEj++8mueUseS6jiBwYW5lbCDmnInnvKnmlL7liqjnlLvvvIxFZGl0Qm94IOmcgOimgeWcqOWKqOeUu+WujOaIkOWQjuWIm+W7uu+8jOWQpuWImeeCueWHu+WMuuWfn+S9jee9ruS4jeWvuVxuICAgICAgICB2YXIgY29kZUlucHV0Tm9kZSA9IG5ldyBjYy5Ob2RlKFwiQ29kZUlucHV0XCIpO1xuICAgICAgICBjb2RlSW5wdXROb2RlLnBhcmVudCA9IHBhbmVsO1xuICAgICAgICBjb2RlSW5wdXROb2RlLnNldENvbnRlbnRTaXplKGNjLnNpemUoY29kZUlucHV0VywgaW5wdXRIZWlnaHQpKTtcbiAgICAgICAgY29kZUlucHV0Tm9kZS5zZXRQb3NpdGlvbigtY29kZVJvd1dpZHRoLzIgKyBpY29uU2l6ZSArIDUgKyBjb2RlSW5wdXRXLzIsIGZvcm1ZMik7XG4gICAgICAgIGNvZGVJbnB1dE5vZGUuekluZGV4ID0gMTAwO1xuXG4gICAgICAgIHZhciBjb2RlRWRpdEJveCA9IG51bGw7ICAvLyDlu7bov5/liJvlu7pcblxuICAgICAgICAvLyDojrflj5bpqozor4HnoIHmjInpkq5cbiAgICAgICAgdmFyIGdldENvZGVCdG4gPSBuZXcgY2MuTm9kZShcIkJ0bkdldENvZGVcIik7XG4gICAgICAgIGdldENvZGVCdG4ucGFyZW50ID0gcGFuZWw7XG4gICAgICAgIGdldENvZGVCdG4uc2V0Q29udGVudFNpemUoY2Muc2l6ZShnZXRDb2RlQnRuV2lkdGgsIGJ0bkhlaWdodCkpO1xuICAgICAgICBnZXRDb2RlQnRuLnNldFBvc2l0aW9uKGNvZGVSb3dXaWR0aC8yIC0gZ2V0Q29kZUJ0bldpZHRoLzIsIGZvcm1ZMik7XG5cbiAgICAgICAgdmFyIGdldENvZGVCdG5Db21wID0gZ2V0Q29kZUJ0bi5hZGRDb21wb25lbnQoY2MuQnV0dG9uKTtcbiAgICAgICAgZ2V0Q29kZUJ0bkNvbXAudHJhbnNpdGlvbiA9IGNjLkJ1dHRvbi5UcmFuc2l0aW9uLlNDQUxFO1xuICAgICAgICBnZXRDb2RlQnRuQ29tcC56b29tU2NhbGUgPSAwLjk1O1xuXG4gICAgICAgIGNjLnJlc291cmNlcy5sb2FkKFwiVUkvbG9naW4vZ2V0X21vYmlsZV9jb2RlXCIsIGNjLlNwcml0ZUZyYW1lLCBmdW5jdGlvbihlcnIsIHNwcml0ZUZyYW1lKSB7XG4gICAgICAgICAgICBpZiAoZXJyKSB7XG4gICAgICAgICAgICAgICAgY29uc29sZS53YXJuKFwi5Yqg6L296I635Y+W6aqM6K+B56CB5oyJ6ZKu5Zu+54mH5aSx6LSlOlwiLCBlcnIpO1xuICAgICAgICAgICAgICAgIC8vIOmZjee6p++8muS9v+eUqOe6r+iJsuaMiemSrlxuICAgICAgICAgICAgICAgIHZhciBidG5HZnggPSBnZXRDb2RlQnRuLmFkZENvbXBvbmVudChjYy5HcmFwaGljcyk7XG4gICAgICAgICAgICAgICAgYnRuR2Z4LmZpbGxDb2xvciA9IG5ldyBjYy5Db2xvcigyNTUsIDE2NSwgMCk7XG4gICAgICAgICAgICAgICAgYnRuR2Z4LnJvdW5kUmVjdCgtZ2V0Q29kZUJ0bldpZHRoLzIsIC1pbnB1dEhlaWdodC8yLCBnZXRDb2RlQnRuV2lkdGgsIGlucHV0SGVpZ2h0LCA1KTtcbiAgICAgICAgICAgICAgICBidG5HZnguZmlsbCgpO1xuXG4gICAgICAgICAgICAgICAgdmFyIGJ0bkxhYmVsID0gbmV3IGNjLk5vZGUoXCJMYWJlbFwiKTtcbiAgICAgICAgICAgICAgICBidG5MYWJlbC5wYXJlbnQgPSBnZXRDb2RlQnRuO1xuICAgICAgICAgICAgICAgIHZhciBsYWJlbENvbXAgPSBidG5MYWJlbC5hZGRDb21wb25lbnQoY2MuTGFiZWwpO1xuICAgICAgICAgICAgICAgIGxhYmVsQ29tcC5zdHJpbmcgPSBcIuiOt+WPlumqjOivgeeggVwiO1xuICAgICAgICAgICAgICAgIGxhYmVsQ29tcC5mb250U2l6ZSA9IDEyICogc2NhbGVSYXRpbztcbiAgICAgICAgICAgICAgICBsYWJlbENvbXAuaG9yaXpvbnRhbEFsaWduID0gY2MuTGFiZWwuSG9yaXpvbnRhbEFsaWduLkNFTlRFUjtcbiAgICAgICAgICAgICAgICBidG5MYWJlbC5jb2xvciA9IG5ldyBjYy5Db2xvcigyNTUsIDI1NSwgMjU1KTtcbiAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICB2YXIgYnRuU3ByaXRlID0gZ2V0Q29kZUJ0bi5hZGRDb21wb25lbnQoY2MuU3ByaXRlKTtcbiAgICAgICAgICAgIGJ0blNwcml0ZS5zcHJpdGVGcmFtZSA9IHNwcml0ZUZyYW1lO1xuICAgICAgICAgICAgYnRuU3ByaXRlLnNpemVNb2RlID0gY2MuU3ByaXRlLlNpemVNb2RlLkNVU1RPTTtcbiAgICAgICAgICAgIGdldENvZGVCdG4uc2V0Q29udGVudFNpemUoY2Muc2l6ZShnZXRDb2RlQnRuV2lkdGgsIGJ0bkhlaWdodCkpO1xuICAgICAgICB9KTtcblxuICAgICAgICAvLyDlgJLorqHml7bnirbmgIFcbiAgICAgICAgdmFyIGNvdW50ZG93biA9IDA7XG4gICAgICAgIHZhciBjb3VudGRvd25MYWJlbCA9IG51bGw7XG5cbiAgICAgICAgLy8g5byA5aeL5YCS6K6h5pe2XG4gICAgICAgIHZhciBzdGFydENvdW50ZG93biA9IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgY291bnRkb3duID0gNjA7XG4gICAgICAgICAgICBnZXRDb2RlQnRuQ29tcC5pbnRlcmFjdGFibGUgPSBmYWxzZTtcbiAgICAgICAgICAgIGdldENvZGVCdG4ub3BhY2l0eSA9IDE1MDtcblxuICAgICAgICAgICAgdmFyIHRpY2sgPSBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgICBjb3VudGRvd24tLTtcbiAgICAgICAgICAgICAgICBpZiAoY291bnRkb3duIDw9IDApIHtcbiAgICAgICAgICAgICAgICAgICAgZ2V0Q29kZUJ0bkNvbXAuaW50ZXJhY3RhYmxlID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICAgICAgZ2V0Q29kZUJ0bi5vcGFjaXR5ID0gMjU1O1xuICAgICAgICAgICAgICAgICAgICBpZiAoY291bnRkb3duTGFiZWwpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvdW50ZG93bkxhYmVsLnN0cmluZyA9IFwiXCI7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICBpZiAoIWNvdW50ZG93bkxhYmVsKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBjb3VudGRvd25MYWJlbCA9IG5ldyBjYy5Ob2RlKFwiQ291bnRkb3duXCIpO1xuICAgICAgICAgICAgICAgICAgICAgICAgY291bnRkb3duTGFiZWwucGFyZW50ID0gZ2V0Q29kZUJ0bjtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvdW50ZG93bkxhYmVsLmNvbG9yID0gbmV3IGNjLkNvbG9yKDI1NSwgMjU1LCAyNTUpO1xuICAgICAgICAgICAgICAgICAgICAgICAgdmFyIGxhYmVsQ29tcCA9IGNvdW50ZG93bkxhYmVsLmFkZENvbXBvbmVudChjYy5MYWJlbCk7XG4gICAgICAgICAgICAgICAgICAgICAgICBsYWJlbENvbXAuZm9udFNpemUgPSAxNCAqIHNjYWxlUmF0aW87XG4gICAgICAgICAgICAgICAgICAgICAgICBsYWJlbENvbXAuaG9yaXpvbnRhbEFsaWduID0gY2MuTGFiZWwuSG9yaXpvbnRhbEFsaWduLkNFTlRFUjtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBjb3VudGRvd25MYWJlbC5nZXRDb21wb25lbnQoY2MuTGFiZWwpLnN0cmluZyA9IGNvdW50ZG93biArIFwic1wiO1xuICAgICAgICAgICAgICAgICAgICBzZWxmLnNjaGVkdWxlT25jZSh0aWNrLCAxKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9O1xuICAgICAgICAgICAgc2VsZi5zY2hlZHVsZU9uY2UodGljaywgMSk7XG4gICAgICAgIH07XG5cbiAgICAgICAgLy8gPT09PT09PT09PT09PT09PT09PT0g5omL5py655m75b2V5oyJ6ZKuID09PT09PT09PT09PT09PT09PT09XG4gICAgICAgIC8vIGJ0bl9tb2JpbGVfbG9naW4ucG5nIOWOn+Wni+WwuuWvuDogMzQwIHggNTDvvIzlrr3pq5jmr5QgNi44OjFcbiAgICAgICAgdmFyIGxvZ2luQnRuWSA9IGZvcm1ZMiAtIDcwICogc2NhbGVSYXRpbztcbiAgICAgICAgdmFyIGxvZ2luQnRuSGVpZ2h0ID0gNTAgKiBzY2FsZVJhdGlvOyAgLy8g5oyJ6ZKu6auY5bqmXG4gICAgICAgIHZhciBsb2dpbkJ0bldpZHRoID0gbG9naW5CdG5IZWlnaHQgKiA2Ljg7ICAvLyDmjInlm77niYfljp/lp4vmr5TkvovorqHnrpflrr3luqYgKDM0MC81MD02LjgpXG5cbiAgICAgICAgdmFyIGxvZ2luQnRuID0gbmV3IGNjLk5vZGUoXCJCdG5Mb2dpblwiKTtcbiAgICAgICAgbG9naW5CdG4ucGFyZW50ID0gcGFuZWw7XG4gICAgICAgIGxvZ2luQnRuLnNldENvbnRlbnRTaXplKGNjLnNpemUobG9naW5CdG5XaWR0aCwgbG9naW5CdG5IZWlnaHQpKTtcbiAgICAgICAgbG9naW5CdG4uc2V0UG9zaXRpb24oMCwgbG9naW5CdG5ZKTtcblxuICAgICAgICAvLyDlsJ3or5XliqDovb3mjInpkq7lm77niYdcbiAgICAgICAgY2MucmVzb3VyY2VzLmxvYWQoXCJVSS9sb2dpbi9idG5fbW9iaWxlX2xvZ2luXCIsIGNjLlNwcml0ZUZyYW1lLCBmdW5jdGlvbihlcnIsIHNwcml0ZUZyYW1lKSB7XG4gICAgICAgICAgICBpZiAoZXJyKSB7XG4gICAgICAgICAgICAgICAgLy8g6ZmN57qn77ya5L2/55So57qv6Imy5oyJ6ZKuXG4gICAgICAgICAgICAgICAgdmFyIGxvZ2luR2Z4ID0gbG9naW5CdG4uYWRkQ29tcG9uZW50KGNjLkdyYXBoaWNzKTtcbiAgICAgICAgICAgICAgICBsb2dpbkdmeC5maWxsQ29sb3IgPSBuZXcgY2MuQ29sb3IoMjU1LCAxNDAsIDApO1xuICAgICAgICAgICAgICAgIGxvZ2luR2Z4LnJvdW5kUmVjdCgtbG9naW5CdG5XaWR0aC8yLCAtbG9naW5CdG5IZWlnaHQvMiwgbG9naW5CdG5XaWR0aCwgbG9naW5CdG5IZWlnaHQsIDggKiBzY2FsZVJhdGlvKTtcbiAgICAgICAgICAgICAgICBsb2dpbkdmeC5maWxsKCk7XG4gICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgdmFyIGxvZ2luU3ByaXRlID0gbG9naW5CdG4uYWRkQ29tcG9uZW50KGNjLlNwcml0ZSk7XG4gICAgICAgICAgICBsb2dpblNwcml0ZS5zcHJpdGVGcmFtZSA9IHNwcml0ZUZyYW1lO1xuICAgICAgICAgICAgbG9naW5TcHJpdGUuc2l6ZU1vZGUgPSBjYy5TcHJpdGUuU2l6ZU1vZGUuQ1VTVE9NO1xuICAgICAgICAgICAgbG9naW5CdG4uc2V0Q29udGVudFNpemUoY2Muc2l6ZShsb2dpbkJ0bldpZHRoLCBsb2dpbkJ0bkhlaWdodCkpO1xuICAgICAgICB9KTtcblxuICAgICAgICB2YXIgbG9naW5CdG5Db21wID0gbG9naW5CdG4uYWRkQ29tcG9uZW50KGNjLkJ1dHRvbik7XG4gICAgICAgIGxvZ2luQnRuQ29tcC50cmFuc2l0aW9uID0gY2MuQnV0dG9uLlRyYW5zaXRpb24uU0NBTEU7XG4gICAgICAgIGxvZ2luQnRuQ29tcC56b29tU2NhbGUgPSAwLjk1O1xuXG4gICAgICAgIC8vID09PT09PT09PT09PT09PT09PT09IOW+ruS/oeeZu+W9leaMiemSriA9PT09PT09PT09PT09PT09PT09PVxuICAgICAgICAvLyBpY29uX3dlY2hhdC5wbmcg5Y6f5aeL5bC65a+4OiA0OCB4IDQ477yI5q2j5pa55b2i77yJXG4gICAgICAgIHZhciB3eEJ0blkgPSBsb2dpbkJ0blkgLSAxNTUgKiBzY2FsZVJhdGlvOyAgLy8g5b6A5LiL56e75Yqo5pu05aSaXG4gICAgICAgIHZhciB3eEJ0blNpemUgPSA0OCAqIHNjYWxlUmF0aW87ICAvLyDkvb/nlKjlm77niYfljp/lp4vlsLrlr7ggNDhcblxuICAgICAgICB2YXIgd3hCdG4gPSBuZXcgY2MuTm9kZShcIkJ0bldlY2hhdFwiKTtcbiAgICAgICAgd3hCdG4ucGFyZW50ID0gcGFuZWw7XG4gICAgICAgIHd4QnRuLnNldENvbnRlbnRTaXplKGNjLnNpemUod3hCdG5TaXplLCB3eEJ0blNpemUpKTtcbiAgICAgICAgd3hCdG4uc2V0UG9zaXRpb24oMCwgd3hCdG5ZKTtcblxuICAgICAgICAvLyDlsJ3or5XliqDovb3lvq7kv6Hlm77moIdcbiAgICAgICAgY2MucmVzb3VyY2VzLmxvYWQoXCJVSS9sb2dpbi9pY29uX3dlY2hhdFwiLCBjYy5TcHJpdGVGcmFtZSwgZnVuY3Rpb24oZXJyLCBzcHJpdGVGcmFtZSkge1xuICAgICAgICAgICAgaWYgKGVycikge1xuICAgICAgICAgICAgICAgIC8vIOmZjee6p++8muS9v+eUqOe7v+iJsuWchuW9ouiDjOaZr1xuICAgICAgICAgICAgICAgIHZhciB3eEJnR2Z4ID0gd3hCdG4uYWRkQ29tcG9uZW50KGNjLkdyYXBoaWNzKTtcbiAgICAgICAgICAgICAgICB3eEJnR2Z4LmZpbGxDb2xvciA9IG5ldyBjYy5Db2xvcig3LCAxOTMsIDk2KTtcbiAgICAgICAgICAgICAgICB3eEJnR2Z4LmNpcmNsZSgwLCAwLCB3eEJ0blNpemUvMik7XG4gICAgICAgICAgICAgICAgd3hCZ0dmeC5maWxsKCk7XG4gICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgdmFyIHd4U3ByaXRlID0gd3hCdG4uYWRkQ29tcG9uZW50KGNjLlNwcml0ZSk7XG4gICAgICAgICAgICB3eFNwcml0ZS5zcHJpdGVGcmFtZSA9IHNwcml0ZUZyYW1lO1xuICAgICAgICAgICAgd3hTcHJpdGUuc2l6ZU1vZGUgPSBjYy5TcHJpdGUuU2l6ZU1vZGUuQ1VTVE9NO1xuICAgICAgICAgICAgd3hCdG4uc2V0Q29udGVudFNpemUoY2Muc2l6ZSh3eEJ0blNpemUsIHd4QnRuU2l6ZSkpO1xuICAgICAgICB9KTtcblxuICAgICAgICB2YXIgd3hCdG5Db21wID0gd3hCdG4uYWRkQ29tcG9uZW50KGNjLkJ1dHRvbik7XG4gICAgICAgIHd4QnRuQ29tcC50cmFuc2l0aW9uID0gY2MuQnV0dG9uLlRyYW5zaXRpb24uU0NBTEU7XG4gICAgICAgIHd4QnRuQ29tcC56b29tU2NhbGUgPSAwLjk1O1xuXG4gICAgICAgIC8vIOW+ruS/oeeZu+W9leaWh+WtlyAtIOmakOiXj1xuICAgICAgICAvLyB2YXIgd3hMYWJlbCA9IG5ldyBjYy5Ob2RlKFwiTGFiZWxXZWNoYXRcIik7XG4gICAgICAgIC8vIHd4TGFiZWwucGFyZW50ID0gcGFuZWw7XG4gICAgICAgIC8vIHd4TGFiZWwuc2V0UG9zaXRpb24oMCwgd3hCdG5ZIC0gMzUgKiBzY2FsZVJhdGlvKTtcbiAgICAgICAgLy8gdmFyIHd4TGFiZWxDb21wID0gd3hMYWJlbC5hZGRDb21wb25lbnQoY2MuTGFiZWwpO1xuICAgICAgICAvLyB3eExhYmVsQ29tcC5zdHJpbmcgPSBcIuW+ruS/oeeZu+W9lVwiO1xuICAgICAgICAvLyB3eExhYmVsQ29tcC5mb250U2l6ZSA9IDEyICogc2NhbGVSYXRpbztcbiAgICAgICAgLy8gd3hMYWJlbENvbXAuaG9yaXpvbnRhbEFsaWduID0gY2MuTGFiZWwuSG9yaXpvbnRhbEFsaWduLkNFTlRFUjtcbiAgICAgICAgLy8gd3hMYWJlbC5jb2xvciA9IG5ldyBjYy5Db2xvcigxMDAsIDgwLCA2MCk7XG5cbiAgICAgICAgY29uc29sZS5sb2coXCLmjInpkq7kvY3nva46IGxvZ2luQnRuWT1cIiArIGxvZ2luQnRuWS50b0ZpeGVkKDApICsgXCIsIHd4QnRuWT1cIiArIHd4QnRuWS50b0ZpeGVkKDApKTtcblxuICAgICAgICAvLyA9PT09PT09PT09PT09PT09PT09PSDmtojmga/mj5DnpLrvvIjpmpDol4/vvIk9PT09PT09PT09PT09PT09PT09PVxuICAgICAgICB2YXIgbWVzc2FnZUxhYmVsID0gbmV3IGNjLk5vZGUoXCJNZXNzYWdlTGFiZWxcIik7XG4gICAgICAgIG1lc3NhZ2VMYWJlbC5wYXJlbnQgPSBwYW5lbDtcbiAgICAgICAgbWVzc2FnZUxhYmVsLnNldFBvc2l0aW9uKDAsIC1wYW5lbEhlaWdodC8yICsgNTApO1xuICAgICAgICB2YXIgbWVzc2FnZUxhYmVsQ29tcCA9IG1lc3NhZ2VMYWJlbC5hZGRDb21wb25lbnQoY2MuTGFiZWwpO1xuICAgICAgICBtZXNzYWdlTGFiZWxDb21wLnN0cmluZyA9IFwiXCI7XG4gICAgICAgIG1lc3NhZ2VMYWJlbENvbXAuZm9udFNpemUgPSAxNDtcbiAgICAgICAgbWVzc2FnZUxhYmVsQ29tcC5ob3Jpem9udGFsQWxpZ24gPSBjYy5MYWJlbC5Ib3Jpem9udGFsQWxpZ24uQ0VOVEVSO1xuICAgICAgICBtZXNzYWdlTGFiZWwuYWN0aXZlID0gZmFsc2U7XG5cbiAgICAgICAgLy8gPT09PT09PT09PT09PT09PT09PT0g5by556qX6L+b5YWl5Yqo55S7ID09PT09PT09PT09PT09PT09PT09XG4gICAgICAgIGNjLnR3ZWVuKHBhbmVsKVxuICAgICAgICAgICAgLnRvKDAuMjUsIHsgc2NhbGU6IDEsIG9wYWNpdHk6IDI1NSB9LCB7IGVhc2luZzogJ2JhY2tPdXQnIH0pXG4gICAgICAgICAgICAuY2FsbChmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgICAvLyBXZWIg5bmz5Y+w77ya55u05o6l5Yib5bu65Y6f55SfIEhUTUwgaW5wdXQg5YWD57SgXG4gICAgICAgICAgICAgICAgaWYgKGNjLnN5cy5pc0Jyb3dzZXIpIHtcbiAgICAgICAgICAgICAgICAgICAgX2NyZWF0ZU5hdGl2ZUlucHV0RWxlbWVudHMocGFuZWwsIHBob25lSW5wdXROb2RlLCBjb2RlSW5wdXROb2RlLCBpbnB1dFdpZHRoLCBpbnB1dEhlaWdodCwgY29kZUlucHV0VywgcGFuZWxXaWR0aCwgcGFuZWxIZWlnaHQpO1xuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIC8vIOmdniBXZWIg5bmz5Y+w77ya5L2/55SoIENvY29zIEVkaXRCb3hcbiAgICAgICAgICAgICAgICAgICAgcGhvbmVFZGl0Qm94ID0gcGhvbmVJbnB1dE5vZGUuYWRkQ29tcG9uZW50KGNjLkVkaXRCb3gpO1xuICAgICAgICAgICAgICAgICAgICBwaG9uZUVkaXRCb3gucGxhY2Vob2xkZXIgPSBcIuivt+i+k+WFpeaJi+acuuWPt1wiO1xuICAgICAgICAgICAgICAgICAgICBwaG9uZUVkaXRCb3guZm9udFNpemUgPSAxODtcbiAgICAgICAgICAgICAgICAgICAgcGhvbmVFZGl0Qm94LnBsYWNlaG9sZGVyRm9udFNpemUgPSAxNDtcbiAgICAgICAgICAgICAgICAgICAgcGhvbmVFZGl0Qm94LmZvbnRDb2xvciA9IG5ldyBjYy5Db2xvcig1MCwgNTAsIDUwLCAyNTUpO1xuICAgICAgICAgICAgICAgICAgICBwaG9uZUVkaXRCb3gucGxhY2Vob2xkZXJGb250Q29sb3IgPSBuZXcgY2MuQ29sb3IoMTUwLCAxNTAsIDE1MCwgMjU1KTtcbiAgICAgICAgICAgICAgICAgICAgcGhvbmVFZGl0Qm94LmlucHV0RmxhZyA9IGNjLkVkaXRCb3guSW5wdXRGbGFnLlNFTlNJVElWRTtcbiAgICAgICAgICAgICAgICAgICAgcGhvbmVFZGl0Qm94LmlucHV0TW9kZSA9IGNjLkVkaXRCb3guSW5wdXRNb2RlLk5VTUVSSUM7XG4gICAgICAgICAgICAgICAgICAgIHBob25lRWRpdEJveC5tYXhMZW5ndGggPSAxMTtcbiAgICAgICAgICAgICAgICAgICAgcGhvbmVFZGl0Qm94LmJhY2tncm91bmRDb2xvciA9IG5ldyBjYy5Db2xvcigwLCAwLCAwLCAwKTtcbiAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgICAgIGNvZGVFZGl0Qm94ID0gY29kZUlucHV0Tm9kZS5hZGRDb21wb25lbnQoY2MuRWRpdEJveCk7XG4gICAgICAgICAgICAgICAgICAgIGNvZGVFZGl0Qm94LnBsYWNlaG9sZGVyID0gXCLpqozor4HnoIFcIjtcbiAgICAgICAgICAgICAgICAgICAgY29kZUVkaXRCb3guZm9udFNpemUgPSAxODtcbiAgICAgICAgICAgICAgICAgICAgY29kZUVkaXRCb3gucGxhY2Vob2xkZXJGb250U2l6ZSA9IDE0O1xuICAgICAgICAgICAgICAgICAgICBjb2RlRWRpdEJveC5mb250Q29sb3IgPSBuZXcgY2MuQ29sb3IoNTAsIDUwLCA1MCwgMjU1KTtcbiAgICAgICAgICAgICAgICAgICAgY29kZUVkaXRCb3gucGxhY2Vob2xkZXJGb250Q29sb3IgPSBuZXcgY2MuQ29sb3IoMTUwLCAxNTAsIDE1MCwgMjU1KTtcbiAgICAgICAgICAgICAgICAgICAgY29kZUVkaXRCb3guaW5wdXRGbGFnID0gY2MuRWRpdEJveC5JbnB1dEZsYWcuU0VOU0lUSVZFO1xuICAgICAgICAgICAgICAgICAgICBjb2RlRWRpdEJveC5pbnB1dE1vZGUgPSBjYy5FZGl0Qm94LklucHV0TW9kZS5OVU1FUklDO1xuICAgICAgICAgICAgICAgICAgICBjb2RlRWRpdEJveC5tYXhMZW5ndGggPSA2O1xuICAgICAgICAgICAgICAgICAgICBjb2RlRWRpdEJveC5iYWNrZ3JvdW5kQ29sb3IgPSBuZXcgY2MuQ29sb3IoMCwgMCwgMCwgMCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKFwi6L6T5YWl5qGG5Yib5bu65a6M5oiQXCIpO1xuICAgICAgICAgICAgfSlcbiAgICAgICAgICAgIC5zdGFydCgpO1xuXG4gICAgICAgIC8vID09PT09PT09PT09PT09PT09PT09IOWKn+iDvemAu+i+kSA9PT09PT09PT09PT09PT09PT09PVxuICAgICAgICB2YXIgcGhvbmUgPSBcIlwiO1xuICAgICAgICB2YXIgY29kZSA9IFwiXCI7XG5cbiAgICAgICAgLy8g6I635Y+W6L6T5YWl5YC855qE6L6F5Yqp5Ye95pWw77yI5pSv5oyB5Y6f55SfIEhUTUwgaW5wdXTvvIlcbiAgICAgICAgdmFyIGdldElucHV0VmFsdWUgPSBmdW5jdGlvbihpbnB1dElkKSB7XG4gICAgICAgICAgICBpZiAoY2Muc3lzLmlzQnJvd3Nlcikge1xuICAgICAgICAgICAgICAgIHZhciBpbnB1dCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKGlucHV0SWQpO1xuICAgICAgICAgICAgICAgIHJldHVybiBpbnB1dCA/IGlucHV0LnZhbHVlIDogXCJcIjtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiBcIlwiO1xuICAgICAgICB9O1xuXG4gICAgICAgIC8vIOmqjOivgeaJi+acuuWPt1xuICAgICAgICB2YXIgdmFsaWRhdGVQaG9uZSA9IGZ1bmN0aW9uKHBob25lKSB7XG4gICAgICAgICAgICBpZiAoIXBob25lIHx8IHBob25lLmxlbmd0aCAhPT0gMTEpIHJldHVybiBmYWxzZTtcbiAgICAgICAgICAgIHJldHVybiAvXjFbMy05XVxcZHs5fSQvLnRlc3QocGhvbmUpO1xuICAgICAgICB9O1xuXG4gICAgICAgIC8vIOaYvuekuua2iOaBr1xuICAgICAgICB2YXIgc2hvd01lc3NhZ2UgPSBmdW5jdGlvbihtc2csIGlzRXJyb3IpIHtcbiAgICAgICAgICAgIG1lc3NhZ2VMYWJlbC5hY3RpdmUgPSB0cnVlO1xuICAgICAgICAgICAgbWVzc2FnZUxhYmVsQ29tcC5zdHJpbmcgPSBtc2c7XG4gICAgICAgICAgICBtZXNzYWdlTGFiZWwuY29sb3IgPSBpc0Vycm9yID8gbmV3IGNjLkNvbG9yKDI1NSwgODAsIDgwKSA6IG5ldyBjYy5Db2xvcigxMDAsIDIwMCwgMTAwKTtcbiAgICAgICAgfTtcblxuICAgICAgICAvLyDojrflj5bpqozor4HnoIEgLSBvbkdldENvZGUoKVxuICAgICAgICBnZXRDb2RlQnRuLm9uKGNjLk5vZGUuRXZlbnRUeXBlLlRPVUNIX0VORCwgZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAvLyDmlK/mjIHljp/nlJ8gSFRNTCBpbnB1dCDmiJYgQ29jb3MgRWRpdEJveFxuICAgICAgICAgICAgaWYgKGNjLnN5cy5pc0Jyb3dzZXIpIHtcbiAgICAgICAgICAgICAgICBwaG9uZSA9IGdldElucHV0VmFsdWUoJ25hdGl2ZS1waG9uZS1pbnB1dCcpO1xuICAgICAgICAgICAgfSBlbHNlIGlmIChwaG9uZUVkaXRCb3gpIHtcbiAgICAgICAgICAgICAgICBwaG9uZSA9IHBob25lRWRpdEJveC5zdHJpbmcgfHwgXCJcIjtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIFxuICAgICAgICAgICAgaWYgKCF2YWxpZGF0ZVBob25lKHBob25lKSkge1xuICAgICAgICAgICAgICAgIHNob3dNZXNzYWdlKFwi6K+36L6T5YWl5q2j56Gu55qE5omL5py65Y+3XCIsIHRydWUpO1xuICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgdmFyIGRlZmluZXMgPSB3aW5kb3cuZGVmaW5lcztcbiAgICAgICAgICAgIGlmICghZGVmaW5lcyB8fCAhZGVmaW5lcy5hcGlVcmwpIHtcbiAgICAgICAgICAgICAgICBzaG93TWVzc2FnZShcIumqjOivgeeggeW3suWPkemAgSjmtYvor5UpXCIsIGZhbHNlKTtcbiAgICAgICAgICAgICAgICBzdGFydENvdW50ZG93bigpO1xuICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgLy8g5L2/55So5Yqg5a+G6K+35rGC5Y+R6YCB6aqM6K+B56CBXG4gICAgICAgICAgICB2YXIgSHR0cEFQSSA9IHdpbmRvdy5IdHRwQVBJO1xuICAgICAgICAgICAgaWYgKEh0dHBBUEkgJiYgZGVmaW5lcy5jcnlwdG9LZXkpIHtcbiAgICAgICAgICAgICAgICBIdHRwQVBJLnBvc3RFbmNyeXB0ZWQoXG4gICAgICAgICAgICAgICAgICAgIGRlZmluZXMuYXBpVXJsICsgJy9hcGkvdjEvYXV0aC9zZW5kLWNvZGUnLFxuICAgICAgICAgICAgICAgICAgICAnc2VuZF9jb2RlJyxcbiAgICAgICAgICAgICAgICAgICAgeyBwaG9uZTogcGhvbmUgfSxcbiAgICAgICAgICAgICAgICAgICAgZGVmaW5lcy5jcnlwdG9LZXksXG4gICAgICAgICAgICAgICAgICAgIGZ1bmN0aW9uKGVyciwgcmVzcCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGVycikge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHNob3dNZXNzYWdlKGVyciB8fCBcIuWPkemAgeWksei0pVwiLCB0cnVlKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAocmVzcCAmJiByZXNwLmNvZGUgPT09IDApIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBzaG93TWVzc2FnZShcIumqjOivgeeggeW3suWPkemAgVwiLCBmYWxzZSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgc3RhcnRDb3VudGRvd24oKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgc2hvd01lc3NhZ2UocmVzcC5tZXNzYWdlIHx8IFwi5Y+R6YCB5aSx6LSlXCIsIHRydWUpO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgKTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgLy8g6ZmN57qn77ya5L2/55So5piO5paH6K+35rGCXG4gICAgICAgICAgICAgICAgdmFyIHhociA9IG5ldyBYTUxIdHRwUmVxdWVzdCgpO1xuICAgICAgICAgICAgICAgIHhoci5vcGVuKCdQT1NUJywgZGVmaW5lcy5hcGlVcmwgKyAnL2FwaS92MS9hdXRoL3NlbmQtY29kZScsIHRydWUpO1xuICAgICAgICAgICAgICAgIHhoci5zZXRSZXF1ZXN0SGVhZGVyKCdDb250ZW50LVR5cGUnLCAnYXBwbGljYXRpb24vanNvbicpO1xuICAgICAgICAgICAgICAgIHhoci50aW1lb3V0ID0gMTAwMDA7XG4gICAgICAgICAgICAgICAgeGhyLm9ucmVhZHlzdGF0ZWNoYW5nZSA9IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICAgICAgICBpZiAoeGhyLnJlYWR5U3RhdGUgPT09IDQpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmICh4aHIuc3RhdHVzID49IDIwMCAmJiB4aHIuc3RhdHVzIDwgMzAwKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdmFyIHJlc3AgPSBKU09OLnBhcnNlKHhoci5yZXNwb25zZVRleHQpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAocmVzcC5jb2RlID09PSAwKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBzaG93TWVzc2FnZShcIumqjOivgeeggeW3suWPkemAgVwiLCBmYWxzZSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBzdGFydENvdW50ZG93bigpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgc2hvd01lc3NhZ2UocmVzcC5tZXNzYWdlIHx8IFwi5Y+R6YCB5aSx6LSlXCIsIHRydWUpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSBjYXRjaChlKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHNob3dNZXNzYWdlKFwi6Kej5p6Q5ZON5bqU5aSx6LSlXCIsIHRydWUpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgc2hvd01lc3NhZ2UoXCLnvZHnu5zor7fmsYLlpLHotKVcIiwgdHJ1ZSk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgICAgIHhoci5zZW5kKEpTT04uc3RyaW5naWZ5KHsgcGhvbmU6IHBob25lIH0pKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG5cbiAgICAgICAgLy8g5omL5py655m75b2VIC0gb25QaG9uZUxvZ2luKClcbiAgICAgICAgbG9naW5CdG4ub24oY2MuTm9kZS5FdmVudFR5cGUuVE9VQ0hfRU5ELCBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIC8vIOaUr+aMgeWOn+eUnyBIVE1MIGlucHV0IOaIliBDb2NvcyBFZGl0Qm94XG4gICAgICAgICAgICBpZiAoY2Muc3lzLmlzQnJvd3Nlcikge1xuICAgICAgICAgICAgICAgIHBob25lID0gZ2V0SW5wdXRWYWx1ZSgnbmF0aXZlLXBob25lLWlucHV0Jyk7XG4gICAgICAgICAgICAgICAgY29kZSA9IGdldElucHV0VmFsdWUoJ25hdGl2ZS1jb2RlLWlucHV0Jyk7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIGlmIChwaG9uZUVkaXRCb3gpIHBob25lID0gcGhvbmVFZGl0Qm94LnN0cmluZyB8fCBcIlwiO1xuICAgICAgICAgICAgICAgIGlmIChjb2RlRWRpdEJveCkgY29kZSA9IGNvZGVFZGl0Qm94LnN0cmluZyB8fCBcIlwiO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBpZiAoIXZhbGlkYXRlUGhvbmUocGhvbmUpKSB7XG4gICAgICAgICAgICAgICAgc2hvd01lc3NhZ2UoXCLor7fovpPlhaXmraPnoa7nmoTmiYvmnLrlj7dcIiwgdHJ1ZSk7XG4gICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBzaG93TWVzc2FnZShcIuato+WcqOeZu+W9lS4uLlwiLCBmYWxzZSk7XG5cbiAgICAgICAgICAgIHZhciBkZWZpbmVzID0gd2luZG93LmRlZmluZXM7XG4gICAgICAgICAgICBpZiAoIWRlZmluZXMgfHwgIWRlZmluZXMuYXBpVXJsKSB7XG4gICAgICAgICAgICAgICAgLy8g5pegQVBJ6YWN572u77yM5qih5ouf55m75b2V5oiQ5YqfXG4gICAgICAgICAgICAgICAgaWYgKHdpbmRvdy5teWdsb2JhbCkge1xuICAgICAgICAgICAgICAgICAgICB2YXIgbG9naW5EYXRhID0ge1xuICAgICAgICAgICAgICAgICAgICAgICAgdW5pcXVlSUQ6IFwicGhvbmVfXCIgKyBwaG9uZSxcbiAgICAgICAgICAgICAgICAgICAgICAgIGFjY291bnRJRDogXCJwaG9uZV9cIiArIHBob25lLFxuICAgICAgICAgICAgICAgICAgICAgICAgbmlja05hbWU6IFwi546p5a62XCIgKyBwaG9uZS5zdWJzdHIoLTQpLFxuICAgICAgICAgICAgICAgICAgICAgICAgYXZhdGFyVXJsOiBcIlwiLFxuICAgICAgICAgICAgICAgICAgICAgICAgZ29sZENvdW50OiAxMDAwLFxuICAgICAgICAgICAgICAgICAgICAgICAgdG9rZW46IFwidGVzdF90b2tlbl9cIiArIERhdGUubm93KCksXG4gICAgICAgICAgICAgICAgICAgICAgICBwaG9uZTogcGhvbmUsXG4gICAgICAgICAgICAgICAgICAgICAgICBsb2dpblR5cGU6IDFcbiAgICAgICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgICAgICAgICAgd2luZG93Lm15Z2xvYmFsLm9uTG9naW5TdWNjZXNzKGxvZ2luRGF0YSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIHNob3dNZXNzYWdlKFwi55m75b2V5oiQ5YqfXCIsIGZhbHNlKTtcbiAgICAgICAgICAgICAgICBzZWxmLnNjaGVkdWxlT25jZShmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgICAgICAgX3JlbW92ZU5hdGl2ZUlucHV0RWxlbWVudHMoKTtcbiAgICAgICAgICAgICAgICAgICAgcG9wdXAuZGVzdHJveSgpO1xuICAgICAgICAgICAgICAgICAgICBjYy5kaXJlY3Rvci5sb2FkU2NlbmUoXCJoYWxsU2NlbmVcIik7XG4gICAgICAgICAgICAgICAgfSwgMC41KTtcbiAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIC8vIOS9v+eUqOWKoOWvhuivt+axgueZu+W9lVxuICAgICAgICAgICAgdmFyIEh0dHBBUEkgPSB3aW5kb3cuSHR0cEFQSTtcbiAgICAgICAgICAgIGlmIChIdHRwQVBJICYmIGRlZmluZXMuY3J5cHRvS2V5KSB7XG4gICAgICAgICAgICAgICAgSHR0cEFQSS5wb3N0RW5jcnlwdGVkKFxuICAgICAgICAgICAgICAgICAgICBkZWZpbmVzLmFwaVVybCArICcvYXBpL3YxL2F1dGgvcGhvbmUtbG9naW4nLFxuICAgICAgICAgICAgICAgICAgICAncGhvbmVfbG9naW4nLFxuICAgICAgICAgICAgICAgICAgICB7IHBob25lOiBwaG9uZSwgY29kZTogY29kZSB9LFxuICAgICAgICAgICAgICAgICAgICBkZWZpbmVzLmNyeXB0b0tleSxcbiAgICAgICAgICAgICAgICAgICAgZnVuY3Rpb24oZXJyLCByZXNwKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoZXJyKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgc2hvd01lc3NhZ2UoZXJyIHx8IFwi55m75b2V5aSx6LSlXCIsIHRydWUpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChyZXNwICYmIHJlc3AuY29kZSA9PT0gMCAmJiByZXNwLmRhdGEpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBzaG93TWVzc2FnZShcIueZu+W9leaIkOWKn1wiLCBmYWxzZSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8g5L2/55SoIG15Z2xvYmFsLm9uTG9naW5TdWNjZXNzIOS/neWtmOeZu+W9leeKtuaAgVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmICh3aW5kb3cubXlnbG9iYWwpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdmFyIGxvZ2luRGF0YSA9IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHVuaXF1ZUlEOiByZXNwLmRhdGEudW5pcXVlSUQgfHwgXCJcIixcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGFjY291bnRJRDogcmVzcC5kYXRhLmFjY291bnRJRCB8fCBcIlwiLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbmlja05hbWU6IHJlc3AuZGF0YS5uaWNrTmFtZSB8fCBcIueOqeWutlwiLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYXZhdGFyVXJsOiByZXNwLmRhdGEuYXZhdGFyVXJsIHx8IFwiXCIsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBnb2xkQ291bnQ6IHJlc3AuZGF0YS5nb2xkY291bnQgfHwgMCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRva2VuOiByZXNwLmRhdGEudG9rZW4gfHwgXCJcIixcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHBob25lOiBwaG9uZSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGxvZ2luVHlwZTogMVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB3aW5kb3cubXlnbG9iYWwub25Mb2dpblN1Y2Nlc3MobG9naW5EYXRhKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgc2VsZi5zY2hlZHVsZU9uY2UoZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIF9yZW1vdmVOYXRpdmVJbnB1dEVsZW1lbnRzKCk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHBvcHVwLmRlc3Ryb3koKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY2MuZGlyZWN0b3IubG9hZFNjZW5lKFwiaGFsbFNjZW5lXCIpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0sIDAuNSk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHNob3dNZXNzYWdlKHJlc3AubWVzc2FnZSB8fCBcIueZu+W9leWksei0pVwiLCB0cnVlKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICk7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIC8vIOmZjee6p++8muS9v+eUqOaYjuaWh+ivt+axglxuICAgICAgICAgICAgICAgIHZhciB4aHIgPSBuZXcgWE1MSHR0cFJlcXVlc3QoKTtcbiAgICAgICAgICAgICAgICB4aHIub3BlbignUE9TVCcsIGRlZmluZXMuYXBpVXJsICsgJy9hcGkvdjEvYXV0aC9waG9uZS1sb2dpbicsIHRydWUpO1xuICAgICAgICAgICAgICAgIHhoci5zZXRSZXF1ZXN0SGVhZGVyKCdDb250ZW50LVR5cGUnLCAnYXBwbGljYXRpb24vanNvbicpO1xuICAgICAgICAgICAgICAgIHhoci5zZXRSZXF1ZXN0SGVhZGVyKCdYLURldmljZS1JRCcsICd3ZWJfJyArIERhdGUubm93KCkpO1xuICAgICAgICAgICAgICAgIHhoci5zZXRSZXF1ZXN0SGVhZGVyKCdYLURldmljZS1UeXBlJywgJ1dlYiBCcm93c2VyJyk7XG4gICAgICAgICAgICAgICAgeGhyLnRpbWVvdXQgPSAxMDAwMDtcbiAgICAgICAgICAgICAgICB4aHIub25yZWFkeXN0YXRlY2hhbmdlID0gZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgICAgICAgIGlmICh4aHIucmVhZHlTdGF0ZSA9PT0gNCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHhoci5zdGF0dXMgPj0gMjAwICYmIHhoci5zdGF0dXMgPCAzMDApIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB2YXIgcmVzcCA9IEpTT04ucGFyc2UoeGhyLnJlc3BvbnNlVGV4dCk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChyZXNwLmNvZGUgPT09IDAgJiYgcmVzcC5kYXRhKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBzaG93TWVzc2FnZShcIueZu+W9leaIkOWKn1wiLCBmYWxzZSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyDkvb/nlKggbXlnbG9iYWwub25Mb2dpblN1Y2Nlc3Mg5L+d5a2Y55m75b2V54q25oCBXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAod2luZG93Lm15Z2xvYmFsKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdmFyIGxvZ2luRGF0YSA9IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdW5pcXVlSUQ6IHJlc3AuZGF0YS51bmlxdWVJRCB8fCByZXNwLmRhdGEucGxheWVyX2lkIHx8IFwiXCIsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGFjY291bnRJRDogcmVzcC5kYXRhLmFjY291bnRJRCB8fCByZXNwLmRhdGEuYWNjb3VudF9pZCB8fCBcIlwiLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBuaWNrTmFtZTogcmVzcC5kYXRhLm5pY2tOYW1lIHx8IHJlc3AuZGF0YS5uaWNrbmFtZSB8fCBcIueOqeWutlwiLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBhdmF0YXJVcmw6IHJlc3AuZGF0YS5hdmF0YXJVcmwgfHwgcmVzcC5kYXRhLmF2YXRhciB8fCBcIlwiLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBnb2xkQ291bnQ6IHJlc3AuZGF0YS5nb2xkY291bnQgfHwgcmVzcC5kYXRhLmdvbGQgfHwgMCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdG9rZW46IHJlc3AuZGF0YS50b2tlbiB8fCBcIlwiLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBwaG9uZTogcGhvbmUsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGxvZ2luVHlwZTogMVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgd2luZG93Lm15Z2xvYmFsLm9uTG9naW5TdWNjZXNzKGxvZ2luRGF0YSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBzZWxmLnNjaGVkdWxlT25jZShmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBfcmVtb3ZlTmF0aXZlSW5wdXRFbGVtZW50cygpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHBvcHVwLmRlc3Ryb3koKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjYy5kaXJlY3Rvci5sb2FkU2NlbmUoXCJoYWxsU2NlbmVcIik7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9LCAwLjUpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgc2hvd01lc3NhZ2UocmVzcC5tZXNzYWdlIHx8IFwi55m75b2V5aSx6LSlXCIsIHRydWUpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSBjYXRjaChlKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHNob3dNZXNzYWdlKFwi6Kej5p6Q5ZON5bqU5aSx6LSlXCIsIHRydWUpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgc2hvd01lc3NhZ2UoXCLnvZHnu5zor7fmsYLlpLHotKVcIiwgdHJ1ZSk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgICAgIHhoci5zZW5kKEpTT04uc3RyaW5naWZ5KHsgcGhvbmU6IHBob25lLCBjb2RlOiBjb2RlIH0pKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG5cbiAgICAgICAgLy8g5b6u5L+h55m75b2VIC0gb25XZWNoYXRMb2dpbigpXG4gICAgICAgIHd4QnRuLm9uKGNjLk5vZGUuRXZlbnRUeXBlLlRPVUNIX0VORCwgZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICBzaG93TWVzc2FnZShcIuato+WcqOeZu+W9lS4uLlwiLCBmYWxzZSk7XG5cbiAgICAgICAgICAgIHZhciBkZWZpbmVzID0gd2luZG93LmRlZmluZXM7XG5cbiAgICAgICAgICAgIGlmICghZGVmaW5lcyB8fCAhZGVmaW5lcy5hcGlVcmwpIHtcbiAgICAgICAgICAgICAgICAvLyDml6BBUEnphY3nva7vvIzmqKHmi5/nmbvlvZXmiJDlip9cbiAgICAgICAgICAgICAgICBpZiAod2luZG93Lm15Z2xvYmFsKSB7XG4gICAgICAgICAgICAgICAgICAgIHZhciBsb2dpbkRhdGEgPSB7XG4gICAgICAgICAgICAgICAgICAgICAgICB1bmlxdWVJRDogXCJ3eF9cIiArIERhdGUubm93KCksXG4gICAgICAgICAgICAgICAgICAgICAgICBhY2NvdW50SUQ6IFwid3hfXCIgKyBEYXRlLm5vdygpLFxuICAgICAgICAgICAgICAgICAgICAgICAgbmlja05hbWU6IFwi5b6u5L+h55So5oi3XCIsXG4gICAgICAgICAgICAgICAgICAgICAgICBhdmF0YXJVcmw6IFwiXCIsXG4gICAgICAgICAgICAgICAgICAgICAgICBnb2xkQ291bnQ6IDEwMDAsXG4gICAgICAgICAgICAgICAgICAgICAgICB0b2tlbjogXCJ0ZXN0X3d4X3Rva2VuX1wiICsgRGF0ZS5ub3coKSxcbiAgICAgICAgICAgICAgICAgICAgICAgIGxvZ2luVHlwZTogMlxuICAgICAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgICAgICAgICB3aW5kb3cubXlnbG9iYWwub25Mb2dpblN1Y2Nlc3MobG9naW5EYXRhKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgc2hvd01lc3NhZ2UoXCLnmbvlvZXmiJDlip9cIiwgZmFsc2UpO1xuICAgICAgICAgICAgICAgIHNlbGYuc2NoZWR1bGVPbmNlKGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICAgICAgICBfcmVtb3ZlTmF0aXZlSW5wdXRFbGVtZW50cygpO1xuICAgICAgICAgICAgICAgICAgICBwb3B1cC5kZXN0cm95KCk7XG4gICAgICAgICAgICAgICAgICAgIGNjLmRpcmVjdG9yLmxvYWRTY2VuZShcImhhbGxTY2VuZVwiKTtcbiAgICAgICAgICAgICAgICB9LCAwLjUpO1xuICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgLy8g5L2/55So5Yqg5a+G6K+35rGC5b6u5L+h55m75b2VXG4gICAgICAgICAgICB2YXIgSHR0cEFQSSA9IHdpbmRvdy5IdHRwQVBJO1xuICAgICAgICAgICAgaWYgKEh0dHBBUEkgJiYgZGVmaW5lcy5jcnlwdG9LZXkpIHtcbiAgICAgICAgICAgICAgICBIdHRwQVBJLnBvc3RFbmNyeXB0ZWQoXG4gICAgICAgICAgICAgICAgICAgIGRlZmluZXMuYXBpVXJsICsgJy9hcGkvdjEvYXV0aC93eC1sb2dpbicsXG4gICAgICAgICAgICAgICAgICAgICd3eF9sb2dpbicsXG4gICAgICAgICAgICAgICAgICAgIHsgY29kZTogXCJ0ZXN0X2NvZGVfXCIgKyBEYXRlLm5vdygpIH0sXG4gICAgICAgICAgICAgICAgICAgIGRlZmluZXMuY3J5cHRvS2V5LFxuICAgICAgICAgICAgICAgICAgICBmdW5jdGlvbihlcnIsIHJlc3ApIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChlcnIpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBzaG93TWVzc2FnZShlcnIgfHwgXCLnmbvlvZXlpLHotKVcIiwgdHJ1ZSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHJlc3AgJiYgcmVzcC5jb2RlID09PSAwICYmIHJlc3AuZGF0YSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHNob3dNZXNzYWdlKFwi55m75b2V5oiQ5YqfXCIsIGZhbHNlKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAod2luZG93Lm15Z2xvYmFsICYmIHdpbmRvdy5teWdsb2JhbC5wbGF5ZXJEYXRhKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHdpbmRvdy5teWdsb2JhbC5wbGF5ZXJEYXRhLnVuaXF1ZUlEID0gcmVzcC5kYXRhLnVuaXF1ZUlEIHx8IFwiXCI7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHdpbmRvdy5teWdsb2JhbC5wbGF5ZXJEYXRhLmFjY291bnRJRCA9IHJlc3AuZGF0YS5hY2NvdW50SUQgfHwgXCJcIjtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgd2luZG93Lm15Z2xvYmFsLnBsYXllckRhdGEubmlja05hbWUgPSByZXNwLmRhdGEubmlja05hbWUgfHwgXCLlvq7kv6HnlKjmiLdcIjtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgd2luZG93Lm15Z2xvYmFsLnBsYXllckRhdGEudXNlck5hbWUgPSByZXNwLmRhdGEudXNlcm5hbWUgfHwgXCJcIjtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgd2luZG93Lm15Z2xvYmFsLnBsYXllckRhdGEuYXZhdGFyID0gcmVzcC5kYXRhLmF2YXRhclVybCB8fCBcIlwiO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB3aW5kb3cubXlnbG9iYWwucGxheWVyRGF0YS5nb2JhbF9jb3VudCA9IHJlc3AuZGF0YS5nb2xkQ291bnQgfHwgMDtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgd2luZG93Lm15Z2xvYmFsLnBsYXllckRhdGEudG9rZW4gPSByZXNwLmRhdGEudG9rZW4gfHwgXCJcIjtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8g5L+d5a2Y5Yiw5pys5Zyw5a2Y5YKoXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHdpbmRvdy5teWdsb2JhbC5wbGF5ZXJEYXRhLnNhdmVUb0xvY2FsKCk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKFwi44CQ5b6u5L+h55m75b2V44CR55So5oi35pWw5o2u5bey5L+d5a2YLCBuaWNrTmFtZSA9XCIsIHdpbmRvdy5teWdsb2JhbC5wbGF5ZXJEYXRhLm5pY2tOYW1lKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgc2VsZi5zY2hlZHVsZU9uY2UoZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIF9yZW1vdmVOYXRpdmVJbnB1dEVsZW1lbnRzKCk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHBvcHVwLmRlc3Ryb3koKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY2MuZGlyZWN0b3IubG9hZFNjZW5lKFwiaGFsbFNjZW5lXCIpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0sIDAuNSk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHNob3dNZXNzYWdlKHJlc3AubWVzc2FnZSB8fCBcIueZu+W9leWksei0pVwiLCB0cnVlKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICk7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIC8vIOmZjee6p++8muS9v+eUqOaYjuaWh+ivt+axglxuICAgICAgICAgICAgICAgIHZhciB4aHIgPSBuZXcgWE1MSHR0cFJlcXVlc3QoKTtcbiAgICAgICAgICAgICAgICB4aHIub3BlbignUE9TVCcsIGRlZmluZXMuYXBpVXJsICsgJy9hcGkvdjEvYXV0aC93eC1sb2dpbicsIHRydWUpO1xuICAgICAgICAgICAgICAgIHhoci5zZXRSZXF1ZXN0SGVhZGVyKCdDb250ZW50LVR5cGUnLCAnYXBwbGljYXRpb24vanNvbicpO1xuICAgICAgICAgICAgICAgIHhoci50aW1lb3V0ID0gMTAwMDA7XG4gICAgICAgICAgICAgICAgeGhyLm9ucmVhZHlzdGF0ZWNoYW5nZSA9IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICAgICAgICBpZiAoeGhyLnJlYWR5U3RhdGUgPT09IDQpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmICh4aHIuc3RhdHVzID49IDIwMCAmJiB4aHIuc3RhdHVzIDwgMzAwKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdmFyIHJlc3AgPSBKU09OLnBhcnNlKHhoci5yZXNwb25zZVRleHQpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAocmVzcC5jb2RlID09PSAwICYmIHJlc3AuZGF0YSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgc2hvd01lc3NhZ2UoXCLnmbvlvZXmiJDlip9cIiwgZmFsc2UpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHdpbmRvdy5teWdsb2JhbCAmJiB3aW5kb3cubXlnbG9iYWwucGxheWVyRGF0YSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHdpbmRvdy5teWdsb2JhbC5wbGF5ZXJEYXRhLnVuaXF1ZUlEID0gcmVzcC5kYXRhLnBsYXllcl9pZCB8fCBcIlwiO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHdpbmRvdy5teWdsb2JhbC5wbGF5ZXJEYXRhLmFjY291bnRJRCA9IHJlc3AuZGF0YS5hY2NvdW50X2lkIHx8IFwiXCI7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgd2luZG93Lm15Z2xvYmFsLnBsYXllckRhdGEubmlja05hbWUgPSByZXNwLmRhdGEubmlja25hbWUgfHwgXCLlvq7kv6HnlKjmiLdcIjtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB3aW5kb3cubXlnbG9iYWwucGxheWVyRGF0YS51c2VyTmFtZSA9IHJlc3AuZGF0YS51c2VybmFtZSB8fCBcIlwiO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHdpbmRvdy5teWdsb2JhbC5wbGF5ZXJEYXRhLmF2YXRhciA9IHJlc3AuZGF0YS5hdmF0YXIgfHwgXCJcIjtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB3aW5kb3cubXlnbG9iYWwucGxheWVyRGF0YS5nb2JhbF9jb3VudCA9IHJlc3AuZGF0YS5nb2xkIHx8IDA7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgd2luZG93Lm15Z2xvYmFsLnBsYXllckRhdGEudG9rZW4gPSByZXNwLmRhdGEudG9rZW4gfHwgXCJcIjtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyDkv53lrZjliLDmnKzlnLDlrZjlgqhcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB3aW5kb3cubXlnbG9iYWwucGxheWVyRGF0YS5zYXZlVG9Mb2NhbCgpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKFwi44CQ5b6u5L+h55m75b2VWEhS44CR55So5oi35pWw5o2u5bey5L+d5a2YLCBuaWNrTmFtZSA9XCIsIHdpbmRvdy5teWdsb2JhbC5wbGF5ZXJEYXRhLm5pY2tOYW1lKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHNlbGYuc2NoZWR1bGVPbmNlKGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIF9yZW1vdmVOYXRpdmVJbnB1dEVsZW1lbnRzKCk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcG9wdXAuZGVzdHJveSgpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNjLmRpcmVjdG9yLmxvYWRTY2VuZShcImhhbGxTY2VuZVwiKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0sIDAuNSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBzaG93TWVzc2FnZShyZXNwLm1lc3NhZ2UgfHwgXCLnmbvlvZXlpLHotKVcIiwgdHJ1ZSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9IGNhdGNoKGUpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgc2hvd01lc3NhZ2UoXCLop6PmnpDlk43lupTlpLHotKVcIiwgdHJ1ZSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBzaG93TWVzc2FnZShcIue9kee7nOivt+axguWksei0pVwiLCB0cnVlKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICAgICAgeGhyLnNlbmQoSlNPTi5zdHJpbmdpZnkoeyBjb2RlOiBcInRlc3RfY29kZV9cIiArIERhdGUubm93KCkgfSkpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICAgICAgXG4gICAgICAgIHJldHVybiBwb3B1cDtcbiAgICB9LFxuXG4gICAgX3Nob3dVc2VyQWdyZWVtZW50UG9wdXA6IGZ1bmN0aW9uKCkge1xuICAgICAgICB0aGlzLl9jcmVhdGVBZ3JlZW1lbnRQb3B1cCgpO1xuICAgIH0sXG5cbiAgICAvLyDliJvlu7rnlKjmiLfljY/orq7lvLnnqpdcbiAgICBfY3JlYXRlQWdyZWVtZW50UG9wdXA6IGZ1bmN0aW9uKCkge1xuICAgICAgICB2YXIgc2VsZiA9IHRoaXM7XG4gICAgICAgIFxuICAgICAgICAvLyA9PT09PT09PT09PT09PT09PT09PSDlvLnnqpfmoLnoioLngrkgPT09PT09PT09PT09PT09PT09PT1cbiAgICAgICAgdmFyIHBvcHVwID0gbmV3IGNjLk5vZGUoXCJ1c2VyX2FncmVlbWVudF9wb3B1cFwiKTtcbiAgICAgICAgcG9wdXAucGFyZW50ID0gdGhpcy5ub2RlO1xuICAgICAgICBwb3B1cC5zZXRDb250ZW50U2l6ZShjYy5zaXplKDEyODAsIDcyMCkpO1xuICAgICAgICBwb3B1cC5zZXRQb3NpdGlvbigwLCAwKTtcbiAgICAgICAgcG9wdXAuekluZGV4ID0gMTAwMDtcbiAgICAgICAgXG4gICAgICAgIC8vID09PT09PT09PT09PT09PT09PT09IOWNiumAj+aYjum7keiJsuiDjOaZr+mBrue9qSA9PT09PT09PT09PT09PT09PT09PVxuICAgICAgICB2YXIgYmdNYXNrID0gbmV3IGNjLk5vZGUoXCJiZ19tYXNrXCIpO1xuICAgICAgICBiZ01hc2sucGFyZW50ID0gcG9wdXA7XG4gICAgICAgIGJnTWFzay5zZXRDb250ZW50U2l6ZShjYy5zaXplKDEyODAsIDcyMCkpO1xuICAgICAgICBiZ01hc2suc2V0UG9zaXRpb24oMCwgMCk7XG4gICAgICAgIHZhciBiZ01hc2tTcHJpdGUgPSBiZ01hc2suYWRkQ29tcG9uZW50KGNjLlNwcml0ZSk7XG4gICAgICAgIGJnTWFza1Nwcml0ZS5zaXplTW9kZSA9IGNjLlNwcml0ZS5TaXplTW9kZS5DVVNUT007XG4gICAgICAgIGJnTWFzay5jb2xvciA9IG5ldyBjYy5Db2xvcigwLCAwLCAwKTtcbiAgICAgICAgYmdNYXNrLm9wYWNpdHkgPSAxODA7XG4gICAgICAgIFxuICAgICAgICAvLyA9PT09PT09PT09PT09PT09PT09PSDkuLvpnaLmnb8gPT09PT09PT09PT09PT09PT09PT1cbiAgICAgICAgdmFyIHBhbmVsID0gbmV3IGNjLk5vZGUoXCJjb250ZW50X3BhbmVsXCIpO1xuICAgICAgICBwYW5lbC5wYXJlbnQgPSBwb3B1cDtcbiAgICAgICAgcGFuZWwuc2V0Q29udGVudFNpemUoY2Muc2l6ZSg5MDAsIDUyMCkpO1xuICAgICAgICBwYW5lbC5zZXRQb3NpdGlvbigwLCAwKTtcbiAgICAgICAgdmFyIHBhbmVsU3ByaXRlID0gcGFuZWwuYWRkQ29tcG9uZW50KGNjLlNwcml0ZSk7XG4gICAgICAgIHBhbmVsU3ByaXRlLnNpemVNb2RlID0gY2MuU3ByaXRlLlNpemVNb2RlLkNVU1RPTTtcbiAgICAgICAgcGFuZWwuY29sb3IgPSBuZXcgY2MuQ29sb3IoMjU1LCAyNTAsIDI0MCk7XG4gICAgICAgIFxuICAgICAgICAvLyDliqDovb3og4zmma/lm77niYdcbiAgICAgICAgY2MucmVzb3VyY2VzLmxvYWQoXCJpbWFnZXMvdXNlcl9hZ3JlZW1lbnRfYmdcIiwgY2MuU3ByaXRlRnJhbWUsIGZ1bmN0aW9uKGVyciwgc3ByaXRlRnJhbWUpIHtcbiAgICAgICAgICAgIGlmICghZXJyICYmIHNwcml0ZUZyYW1lKSB7XG4gICAgICAgICAgICAgICAgcGFuZWxTcHJpdGUuc3ByaXRlRnJhbWUgPSBzcHJpdGVGcmFtZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG5cbiAgICAgICAgLy8gPT09PT09PT09PT09PT09PT09PT0g5qCH6aKYID09PT09PT09PT09PT09PT09PT09XG4gICAgICAgIHZhciB0aXRsZU5vZGUgPSBuZXcgY2MuTm9kZShcInRpdGxlX2xhYmVsXCIpO1xuICAgICAgICB0aXRsZU5vZGUucGFyZW50ID0gcGFuZWw7XG4gICAgICAgIHRpdGxlTm9kZS5zZXRDb250ZW50U2l6ZShjYy5zaXplKDMwMCwgNjApKTtcbiAgICAgICAgdGl0bGVOb2RlLnNldFBvc2l0aW9uKDAsIDIzMCk7XG4gICAgICAgIHZhciB0aXRsZUxhYmVsID0gdGl0bGVOb2RlLmFkZENvbXBvbmVudChjYy5MYWJlbCk7XG4gICAgICAgIHRpdGxlTGFiZWwuc3RyaW5nID0gXCLnlKjmiLfljY/orq5cIjtcbiAgICAgICAgdGl0bGVMYWJlbC5mb250U2l6ZSA9IDM2O1xuICAgICAgICB0aXRsZUxhYmVsLmxpbmVIZWlnaHQgPSA2MDtcbiAgICAgICAgdGl0bGVMYWJlbC5ob3Jpem9udGFsQWxpZ24gPSBjYy5MYWJlbC5Ib3Jpem9udGFsQWxpZ24uQ0VOVEVSO1xuICAgICAgICB0aXRsZU5vZGUuY29sb3IgPSBuZXcgY2MuQ29sb3IoMzAsIDMwLCAzMCk7XG5cbiAgICAgICAgLy8gPT09PT09PT09PT09PT09PT09PT0g5YWz6Zet5oyJ6ZKuID09PT09PT09PT09PT09PT09PT09XG4gICAgICAgIHZhciBjbG9zZUJ0biA9IG5ldyBjYy5Ob2RlKFwiY2xvc2VfYnRuXCIpO1xuICAgICAgICBjbG9zZUJ0bi5wYXJlbnQgPSBwYW5lbDtcbiAgICAgICAgY2xvc2VCdG4uc2V0Q29udGVudFNpemUoY2Muc2l6ZSg2MCwgNjApKTtcbiAgICAgICAgY2xvc2VCdG4uc2V0UG9zaXRpb24oNDAwLCAyMzApO1xuICAgICAgICBcbiAgICAgICAgdmFyIGNsb3NlQnRuQmcgPSBuZXcgY2MuTm9kZShcImJnXCIpO1xuICAgICAgICBjbG9zZUJ0bkJnLnBhcmVudCA9IGNsb3NlQnRuO1xuICAgICAgICBjbG9zZUJ0bkJnLnNldENvbnRlbnRTaXplKGNjLnNpemUoNTAsIDUwKSk7XG4gICAgICAgIGNsb3NlQnRuQmcuc2V0UG9zaXRpb24oMCwgMCk7XG4gICAgICAgIHZhciBjbG9zZUJnU3ByaXRlID0gY2xvc2VCdG5CZy5hZGRDb21wb25lbnQoY2MuU3ByaXRlKTtcbiAgICAgICAgY2xvc2VCZ1Nwcml0ZS5zaXplTW9kZSA9IGNjLlNwcml0ZS5TaXplTW9kZS5DVVNUT007XG4gICAgICAgIGNsb3NlQnRuQmcuY29sb3IgPSBuZXcgY2MuQ29sb3IoMjU1LCAyNTUsIDI1NSk7XG4gICAgICAgIFxuICAgICAgICB2YXIgY2xvc2VMYWJlbE5vZGUgPSBuZXcgY2MuTm9kZShcInhcIik7XG4gICAgICAgIGNsb3NlTGFiZWxOb2RlLnBhcmVudCA9IGNsb3NlQnRuO1xuICAgICAgICBjbG9zZUxhYmVsTm9kZS5zZXRQb3NpdGlvbigwLCAwKTtcbiAgICAgICAgdmFyIGNsb3NlTGFiZWwgPSBjbG9zZUxhYmVsTm9kZS5hZGRDb21wb25lbnQoY2MuTGFiZWwpO1xuICAgICAgICBjbG9zZUxhYmVsLnN0cmluZyA9IFwiw5dcIjtcbiAgICAgICAgY2xvc2VMYWJlbC5mb250U2l6ZSA9IDQwO1xuICAgICAgICBjbG9zZUxhYmVsLmxpbmVIZWlnaHQgPSA1MDtcbiAgICAgICAgY2xvc2VMYWJlbC5ob3Jpem9udGFsQWxpZ24gPSBjYy5MYWJlbC5Ib3Jpem9udGFsQWxpZ24uQ0VOVEVSO1xuICAgICAgICBjbG9zZUxhYmVsTm9kZS5jb2xvciA9IG5ldyBjYy5Db2xvcig4MCwgODAsIDgwKTtcbiAgICAgICAgXG4gICAgICAgIHZhciBjbG9zZUJ0bkNvbXAgPSBjbG9zZUJ0bi5hZGRDb21wb25lbnQoY2MuQnV0dG9uKTtcbiAgICAgICAgY2xvc2VCdG5Db21wLnRyYW5zaXRpb24gPSBjYy5CdXR0b24uVHJhbnNpdGlvbi5TQ0FMRTtcbiAgICAgICAgY2xvc2VCdG5Db21wLnpvb21TY2FsZSA9IDEuMjtcbiAgICAgICAgY2xvc2VCdG5Db21wLmludGVyYWN0YWJsZSA9IHRydWU7XG4gICAgICAgIFxuICAgICAgICB2YXIgY2xvc2VIYW5kbGVyID0gbmV3IGNjLkNvbXBvbmVudC5FdmVudEhhbmRsZXIoKTtcbiAgICAgICAgY2xvc2VIYW5kbGVyLnRhcmdldCA9IHRoaXMubm9kZTtcbiAgICAgICAgY2xvc2VIYW5kbGVyLmNvbXBvbmVudCA9IFwibG9naW5TY2VuZVwiO1xuICAgICAgICBjbG9zZUhhbmRsZXIuaGFuZGxlciA9IFwiX2Nsb3NlVXNlckFncmVlbWVudFBvcHVwXCI7XG4gICAgICAgIGNsb3NlSGFuZGxlci5jdXN0b21FdmVudERhdGEgPSBcIlwiO1xuICAgICAgICBjbG9zZUJ0bkNvbXAuY2xpY2tFdmVudHMucHVzaChjbG9zZUhhbmRsZXIpO1xuXG4gICAgICAgIC8vID09PT09PT09PT09PT09PT09PT09IOWIhumalOe6vyA9PT09PT09PT09PT09PT09PT09PVxuICAgICAgICB2YXIgZGl2aWRlckxpbmUgPSBuZXcgY2MuTm9kZShcImRpdmlkZXJcIik7XG4gICAgICAgIGRpdmlkZXJMaW5lLnBhcmVudCA9IHBhbmVsO1xuICAgICAgICBkaXZpZGVyTGluZS5zZXRDb250ZW50U2l6ZShjYy5zaXplKDg1MCwgMSkpO1xuICAgICAgICBkaXZpZGVyTGluZS5zZXRQb3NpdGlvbigwLCAxOTUpO1xuICAgICAgICB2YXIgZGl2aWRlclNwcml0ZSA9IGRpdmlkZXJMaW5lLmFkZENvbXBvbmVudChjYy5TcHJpdGUpO1xuICAgICAgICBkaXZpZGVyU3ByaXRlLnNpemVNb2RlID0gY2MuU3ByaXRlLlNpemVNb2RlLkNVU1RPTTtcbiAgICAgICAgZGl2aWRlckxpbmUuY29sb3IgPSBuZXcgY2MuQ29sb3IoMjIwLCAyMjAsIDIyMCk7XG5cbiAgICAgICAgLy8gPT09PT09PT09PT09PT09PT09PT0g5YaF5a655rua5Yqo5Yy65Z+fID09PT09PT09PT09PT09PT09PT09XG4gICAgICAgIC8vIOaVtOS9k+S4iuenu++8jOWinuWKoOW6lemDqOepuumXtO+8jOa3u+WKoOa7muWKqOWKn+iDvVxuICAgICAgICB2YXIgc2Nyb2xsTm9kZSA9IG5ldyBjYy5Ob2RlKFwic2Nyb2xsX3ZpZXdcIik7XG4gICAgICAgIHNjcm9sbE5vZGUucGFyZW50ID0gcGFuZWw7XG4gICAgICAgIHNjcm9sbE5vZGUuc2V0Q29udGVudFNpemUoY2Muc2l6ZSg4MjAsIDM4MCkpOyAgLy8g6LCD5pW05a695bqmXG4gICAgICAgIHNjcm9sbE5vZGUuc2V0UG9zaXRpb24oMCwgMCk7ICAvLyDkuIrnp7tcbiAgICAgICAgXG4gICAgICAgIC8vIOa3u+WKoCBTY3JvbGxWaWV3IOe7hOS7tuWunueOsOa7muWKqOWKn+iDvVxuICAgICAgICB2YXIgc2Nyb2xsVmlldyA9IHNjcm9sbE5vZGUuYWRkQ29tcG9uZW50KGNjLlNjcm9sbFZpZXcpO1xuICAgICAgICBzY3JvbGxWaWV3Lmhvcml6b250YWwgPSBmYWxzZTsgIC8vIOemgeeUqOawtOW5s+a7muWKqFxuICAgICAgICBzY3JvbGxWaWV3LnZlcnRpY2FsID0gdHJ1ZTsgICAgIC8vIOWQr+eUqOWeguebtOa7muWKqFxuICAgICAgICBzY3JvbGxWaWV3LmluZXJ0aWEgPSB0cnVlOyAgICAgIC8vIOa7muWKqOaDr+aAp1xuICAgICAgICBzY3JvbGxWaWV3LmVsYXN0aWMgPSB0cnVlOyAgICAgIC8vIOW8ueaAp+aViOaenFxuICAgICAgICBcbiAgICAgICAgdmFyIHZpZXdOb2RlID0gbmV3IGNjLk5vZGUoXCJ2aWV3XCIpO1xuICAgICAgICB2aWV3Tm9kZS5wYXJlbnQgPSBzY3JvbGxOb2RlO1xuICAgICAgICB2aWV3Tm9kZS5zZXRDb250ZW50U2l6ZShjYy5zaXplKDgyMCwgMzgwKSk7ICAvLyDosIPmlbTlrr3luqZcbiAgICAgICAgdmlld05vZGUuc2V0UG9zaXRpb24oMCwgMCk7XG4gICAgICAgIFxuICAgICAgICB2YXIgbWFzayA9IHZpZXdOb2RlLmFkZENvbXBvbmVudChjYy5NYXNrKTtcbiAgICAgICAgbWFzay50eXBlID0gY2MuTWFzay5UeXBlLlJFQ1Q7XG4gICAgICAgIFxuICAgICAgICB2YXIgY29udGVudE5vZGUgPSBuZXcgY2MuTm9kZShcImNvbnRlbnRcIik7XG4gICAgICAgIGNvbnRlbnROb2RlLnBhcmVudCA9IHZpZXdOb2RlO1xuICAgICAgICBjb250ZW50Tm9kZS5hbmNob3JYID0gMC41O1xuICAgICAgICBjb250ZW50Tm9kZS5hbmNob3JZID0gMTtcbiAgICAgICAgY29udGVudE5vZGUuc2V0UG9zaXRpb24oMCwgMTkwKTsgIC8vIOWxheS4reWvuem9kFxuICAgICAgICBjb250ZW50Tm9kZS5zZXRDb250ZW50U2l6ZShjYy5zaXplKDgyMCwgODAwKSk7ICAvLyDlop7liqDpq5jluqbku6XlrrnnurPmiYDmnInlhoXlrrlcbiAgICAgICAgXG4gICAgICAgIC8vIOiuvue9riBTY3JvbGxWaWV3IOeahCBjb250ZW50IOWxnuaAp1xuICAgICAgICBzY3JvbGxWaWV3LmNvbnRlbnQgPSBjb250ZW50Tm9kZTtcbiAgICAgICAgXG4gICAgICAgIHZhciByaWNoVGV4dE5vZGUgPSBuZXcgY2MuTm9kZShcInJpY2hfdGV4dFwiKTtcbiAgICAgICAgcmljaFRleHROb2RlLnBhcmVudCA9IGNvbnRlbnROb2RlO1xuICAgICAgICByaWNoVGV4dE5vZGUuYW5jaG9yWCA9IDA7XG4gICAgICAgIHJpY2hUZXh0Tm9kZS5hbmNob3JZID0gMTtcbiAgICAgICAgcmljaFRleHROb2RlLnNldFBvc2l0aW9uKC0zODUsIC0xNSk7ICAvLyDlop7liqDlt6bovrnot53vvIzmloflrZfmlbTkvZPkuIrnp7tcbiAgICAgICAgXG4gICAgICAgIHZhciByaWNoVGV4dCA9IHJpY2hUZXh0Tm9kZS5hZGRDb21wb25lbnQoY2MuUmljaFRleHQpO1xuICAgICAgICByaWNoVGV4dC5mb250U2l6ZSA9IDE2OyAgLy8g5a2X5Y+35Yqg5aSn77yaMTQgLT4gMTZcbiAgICAgICAgcmljaFRleHQubGluZUhlaWdodCA9IDI2OyAgLy8g6KGM6auY5Yqg5aSn77yaMjQgLT4gMjZcbiAgICAgICAgcmljaFRleHQubWF4V2lkdGggPSA3NjA7ICAvLyDosIPmlbTlrr3luqbvvIznoa7kv53lt6blj7Povrnot51cbiAgICAgICAgXG4gICAgICAgIC8vIOiuvue9ruaWh+Wtl+minOiJsuS4uum7keiJslxuICAgICAgICB2YXIgYWdyZWVtZW50VGV4dCA9IFwiPGI+PGNvbG9yPSMwMDAwMDA+55So5oi35Y2P6K6uPC9jb2xvcj48L2I+XFxuXFxuXCIgK1xuICAgICAgICAgICAgXCI8Y29sb3I9IzAwMDAwMD7mrKLov47kvb/nlKjmnKzmuLjmiI/vvIHlnKjkvb/nlKjliY3vvIzor7fku5Tnu4bpmIXor7vku6XkuIvljY/orq7vvJo8L2NvbG9yPlxcblxcblwiICtcbiAgICAgICAgICAgIFwiPGI+PGNvbG9yPSMwMDAwMDA+5LiA44CB5pyN5Yqh5p2h5qy+PC9jb2xvcj48L2I+XFxuXCIgK1xuICAgICAgICAgICAgXCI8Y29sb3I9IzAwMDAwMD4xLiDnlKjmiLflupTpgbXlrojlm73lrrbms5Xlvovms5Xop4TvvIzmlofmmI7muLjmiI/jgII8L2NvbG9yPlxcblwiICtcbiAgICAgICAgICAgIFwiPGNvbG9yPSMwMDAwMDA+Mi4g56aB5q2i5L2/55So5aSW5oyC44CB5L2c5byK6L2v5Lu2562J56C05Z2P5ri45oiP5YWs5bmz5oCn55qE6KGM5Li644CCPC9jb2xvcj5cXG5cIiArXG4gICAgICAgICAgICBcIjxjb2xvcj0jMDAwMDAwPjMuIOeUqOaIt+i0puWPt+WuieWFqOeUseeUqOaIt+iHquihjOi0n+i0o++8jOivt+WmpeWWhOS/neeuoei0puWPt+WvhueggeOAgjwvY29sb3I+XFxuXFxuXCIgK1xuICAgICAgICAgICAgXCI8Yj48Y29sb3I9IzAwMDAwMD7kuozjgIHpmpDnp4HmlL/nrZY8L2NvbG9yPjwvYj5cXG5cIiArXG4gICAgICAgICAgICBcIjxjb2xvcj0jMDAwMDAwPjEuIOaIkeS7rOS8muaUtumbhuW/heimgeeahOeUqOaIt+S/oeaBr+eUqOS6juaPkOS+m+acjeWKoeOAgjwvY29sb3I+XFxuXCIgK1xuICAgICAgICAgICAgXCI8Y29sb3I9IzAwMDAwMD4yLiDmiJHku6zmib/or7rkv53miqTnlKjmiLfpmpDnp4HvvIzkuI3kvJrlkJHnrKzkuInmlrnms4TpnLLnlKjmiLfkv6Hmga/jgII8L2NvbG9yPlxcblwiICtcbiAgICAgICAgICAgIFwiPGNvbG9yPSMwMDAwMDA+My4g55So5oi35pyJ5p2D6KaB5rGC5Yig6Zmk5Liq5Lq65pWw5o2u44CCPC9jb2xvcj5cXG5cXG5cIiArXG4gICAgICAgICAgICBcIjxiPjxjb2xvcj0jMDAwMDAwPuS4ieOAgeWFjei0o+WjsOaYjjwvY29sb3I+PC9iPlxcblwiICtcbiAgICAgICAgICAgIFwiPGNvbG9yPSMwMDAwMDA+MS4g5Zug5LiN5Y+v5oqX5Yqb5a+86Ie055qE5pyN5Yqh5Lit5pat77yM5oiR5Lus5LiN5om/5ouF6LSj5Lu744CCPC9jb2xvcj5cXG5cIiArXG4gICAgICAgICAgICBcIjxjb2xvcj0jMDAwMDAwPjIuIOeUqOaIt+WboOi/neinhOaTjeS9nOmAoOaIkOeahOaNn+Wkse+8jOeUseeUqOaIt+iHquihjOaJv+aLheOAgjwvY29sb3I+XFxuXFxuXCIgK1xuICAgICAgICAgICAgXCI8Y29sb3I9IzAwMDAwMD7lpoLmnInnlpHpl67vvIzor7fogZTns7vlrqLmnI3jgII8L2NvbG9yPlwiO1xuICAgICAgICBcbiAgICAgICAgcmljaFRleHQuc3RyaW5nID0gYWdyZWVtZW50VGV4dDtcbiAgICAgICAgXG4gICAgICAgIC8vIOa7muWKqOWIsOmhtumDqFxuICAgICAgICBzY3JvbGxWaWV3LnNjcm9sbFRvVG9wKDApO1xuXG4gICAgICAgIHRoaXMuX3VzZXJBZ3JlZW1lbnRQb3B1cCA9IHBvcHVwO1xuICAgIH0sXG5cbiAgICBfY2xvc2VVc2VyQWdyZWVtZW50UG9wdXA6IGZ1bmN0aW9uKCkge1xuICAgICAgICBpZiAodGhpcy5fdXNlckFncmVlbWVudFBvcHVwKSB7XG4gICAgICAgICAgICB0aGlzLl91c2VyQWdyZWVtZW50UG9wdXAuZGVzdHJveSgpO1xuICAgICAgICAgICAgdGhpcy5fdXNlckFncmVlbWVudFBvcHVwID0gbnVsbDtcbiAgICAgICAgfVxuICAgIH0sXG4gICAgXG4gICAgLy8g6ZSA5q+B5pe25riF55CGXG4gICAgb25EZXN0cm95ICgpIHtcbiAgICAgICAgdGhpcy5fcmVtb3ZlR2xvYmFsVG91Y2hGb3JNdXNpYygpO1xuICAgIH1cbn0pO1xuIl19