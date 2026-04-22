// 简单的模拟API服务器 - 用于测试用户协议功能
const http = require('http');

const PORT = 1781;

const server = http.createServer((req, res) => {
    // CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        res.writeHead(200);
        res.end();
        return;
    }

    console.log(`📥 ${req.method} ${req.url}`);

    if (req.url === '/api/health') {
        res.writeHead(200, { 'Content-Type': 'text/plain' });
        res.end('OK');
        return;
    }

    if (req.url === '/api/v1/user-agreement/latest') {
        const response = {
            code: 0,
            message: 'success',
            data: {
                id: 1,
                title: '用户协议',
                content: `欢迎使用本游戏！

请在使用本游戏服务前，仔细阅读以下用户协议：

1. 服务条款
本游戏提供的服务仅供娱乐使用。用户应遵守相关法律法规，不得利用本游戏进行任何违法活动。

2. 用户账号
用户应妥善保管账号信息，因个人原因导致账号丢失或被盗，本平台不承担责任。

3. 虚拟货币
游戏内的虚拟货币仅限本游戏内使用，不得进行任何形式的交易或转让。

4. 行为规范
用户不得利用外挂、漏洞等方式破坏游戏公平性，一经发现将永久封禁账号。

5. 隐私保护
我们重视用户隐私，不会向第三方泄露用户个人信息。

6. 服务变更
本平台有权随时修改服务内容，恕不另行通知。

7. 免责声明
因不可抗力导致的服务中断，本平台不承担责任。

如有疑问，请联系客服。

更新日期：2024年1月1日`,
                version: 'v1.0.0'
            }
        };
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(response));
        return;
    }

    res.writeHead(404, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ code: 404, message: 'Not Found' }));
});

server.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 模拟API服务器启动，监听端口: ${PORT}`);
    console.log(`📝 用户协议API: http://localhost:${PORT}/api/v1/user-agreement/latest`);
});
