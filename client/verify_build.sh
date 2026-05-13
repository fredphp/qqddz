#!/bin/bash
# Cocos Creator 构建验证脚本

echo "======================================"
echo "Cocos Creator 项目构建验证"
echo "======================================"
echo ""

# 检查源代码修改时间
echo "1. 源代码修改时间:"
ls -la assets/scripts/loginscene/loginScene.js
ls -la assets/scripts/util/waitnode.js
ls -la assets/scripts/hallscene/hallScene.js
ls -la assets/scripts/gameScene/gameScene.js
echo ""

# 检查构建版本修改时间
echo "2. 构建版本修改时间:"
ls -la build/web-mobile/src/assets/scripts/loginscene/loginScene.js 2>/dev/null || echo "构建版本不存在!"
ls -la build/web-mobile/src/assets/scripts/util/waitnode.js 2>/dev/null || echo "构建版本不存在!"
echo ""

# 检查 isPlugin 设置
echo "3. isPlugin 设置检查:"
for f in assets/scripts/loginscene/loginScene.js.meta \
         assets/scripts/util/waitnode.js.meta \
         assets/scripts/hallscene/hallScene.js.meta \
         assets/scripts/gameScene/gameScene.js.meta; do
    if [ -f "$f" ]; then
        plugin=$(grep -o '"isPlugin": [^,}]*' "$f")
        echo "  $f: $plugin"
    fi
done
echo ""

# 检查源代码中的 name 属性
echo "4. 源代码 name 属性检查:"
for f in assets/scripts/loginscene/loginScene.js \
         assets/scripts/util/waitnode.js \
         assets/scripts/hallscene/hallScene.js \
         assets/scripts/gameScene/gameScene.js; do
    if [ -f "$f" ]; then
        name_count=$(grep -c "name:" "$f" | head -1)
        echo "  $f: $name_count 个 name 属性"
    fi
done
echo ""

echo "======================================"
echo "如果构建版本时间早于源代码，请重新构建!"
echo "======================================"
