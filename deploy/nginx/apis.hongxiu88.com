# Game Server API 配置
# 域名: apis.hongxiu88.com
# WebSocket端口: 1780
# HTTP API端口: 1781

# HTTP 重定向到 HTTPS
server {
    listen 80;
    server_name apis.hongxiu88.com;
    return 301 https://$server_name$request_uri;
}

# HTTPS 配置
server {
    listen 443 ssl http2;
    server_name apis.hongxiu88.com;

    # SSL 证书路径
    ssl_certificate /etc/letsencrypt/live/apis.hongxiu88.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/apis.hongxiu88.com/privkey.pem;

    # SSL 安全配置
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-ECDSA-AES128-GCM-SHA256:ECDHE-RSA-AES128-GCM-SHA256:ECDHE-ECDSA-AES256-GCM-SHA384:ECDHE-RSA-AES256-GCM-SHA384;
    ssl_prefer_server_ciphers off;
    ssl_session_cache shared:SSL:10m;
    ssl_session_timeout 1d;

    # HTTP API 代理
    location /api/ {
        proxy_pass http://127.0.0.1:1781/;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;

        # 超时设置
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }

    # WebSocket 代理
    location /ws {
        proxy_pass http://127.0.0.1:1780;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;

        # WebSocket 长连接超时
        proxy_read_timeout 86400s;
        proxy_send_timeout 86400s;
    }

    # 根路径 - 服务状态
    location / {
        return 200 '{"status":"ok","service":"QQDDZ Game Server","version":"1.0.0"}';
        add_header Content-Type application/json;
    }

    # 健康检查
    location /health {
        proxy_pass http://127.0.0.1:1781/health;
        access_log off;
    }
}
