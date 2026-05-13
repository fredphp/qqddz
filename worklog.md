# Worklog - 帮助弹窗滚动功能修复

---
Task ID: 1
Agent: Main Agent
Task: 修复游戏大厅帮助弹窗内容超出未隐藏、无法滚动查看的问题

Work Log:
- 分析admin后台用户协议刷新缓存功能，确认Redis存储逻辑正确
- 分析server端帮助列表API，确认数据获取逻辑正确（优先从本地缓存->Redis->数据库）
- 发现nclient客户端帮助弹窗问题：_showHelpDialog方法没有使用cc.ScrollView组件
- 修改_showHelpDialog方法，添加cc.ScrollView和cc.Mask组件
- 修改_showHelpContentFromList方法适配ScrollView结构
- 修改_showHelpContent方法适配ScrollView结构
- 修改_relayoutHelpItems方法更新ScrollView的content高度
- 修改_showPlainText方法适配ScrollView结构
- 添加清理_helpScrollView引用的代码

Stage Summary:
- 核心问题：帮助弹窗使用普通cc.Node作为内容容器，没有滚动功能
- 解决方案：使用cc.ScrollView + cc.Mask实现滚动视图
- 修改文件：nclient/assets/scripts/hallscene/hallScene.js
- 主要修改点：
  1. _showHelpDialog：添加ScrollView结构
  2. _showHelpContentFromList：适配ScrollView
  3. _showHelpContent：适配ScrollView
  4. _relayoutHelpItems：更新content高度并滚动到顶部
  5. _showPlainText：适配ScrollView
  6. 销毁时清理引用

---
## 详细修改说明

### 1. _showHelpDialog 方法修改

原代码使用普通的cc.Node作为内容容器，修改后：
- 创建ScrollView节点
- 添加cc.ScrollView组件
- 创建view节点并添加cc.Mask组件隐藏超出内容
- 创建content节点作为滚动内容容器

### 2. 内容显示方法修改

_showHelpContentFromList、_showHelpContent、_showPlainText 方法：
- 调整锚点为顶部对齐（anchorY = 1）
- 内容节点的y坐标设为0（顶部对齐）
- 动态更新content高度

### 3. 布局更新修改

_relayoutHelpItems 方法：
- 更新content高度
- 调用scrollView.scrollToTop()滚动到顶部

### 4. 引用清理

在弹窗销毁时（关闭按钮、确定按钮、点击遮罩）清理_helpScrollView引用
