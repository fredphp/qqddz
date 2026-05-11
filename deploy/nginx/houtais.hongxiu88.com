# Admin 后台管理系统配置
# 域名: houtais.hongxiu88.com
# 服务端口: 8888

# HTTP 重定向到 HTTPS
server {
    listen 80;
    server_name houtais.hongxiu88.com;
    return 301 https://$server_name$request_uri;
}

# HTTPS 配置
server {
    listen 443 ssl http2;
    server_name houtais.hongxiu88.com;

    # SSL 证书路径
    ssl_certificate /etc/letsencrypt/live/houtais.hongxiu88.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/houtais.hongxiu88.com/privkey.pem;

    # SSL 安全配置
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-ECDSA-AES128-GCM-SHA256:ECDHE-RSA-AES128-GCM-SHA256:ECDHE-ECDSA-AES256-GCM-SHA384:ECDHE-RSA-AES256-GCM-SHA384;
    ssl_prefer_server_ciphers off;
    ssl_session_cache shared:SSL:10m;
    ssl_session_timeout 1d;

    # 文件上传大小限制
    client_max_body_size 50M;

    # API 代理
    location /api/ {
        proxy_pass http://127.0.0.1:8888/;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;

        # WebSocket 支持（用于实时通知等）
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_read_timeout 86400s;

        # 超时设置
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }

    # 上传文件静态服务
    location /uploads/ {
        alias /opt/qqddz/admin/uploads/;
        expires 30d;
        add_header Cache-Control "public, immutable";
        add_header Access-Control-Allow-Origin *;
    }

    # 前端静态文件
    location / {
        root /opt/qqddz/admin/web/dist;
        try_files $uri $uri/ /index.html;
        expires 1d;
        add_header Cache-Control "public";
    }

    # 健康检查
    location /health {
        return 200 '{"status":"ok","service":"QQDDZ Admin Server"}';
        add_header Content-Type application/json;
        access_log off;
    }
}
