# Ubuntu VPS 部署文档

## 1. 适用场景

本文档适用于以下场景：

- 服务器系统为 Ubuntu
- 项目代码已推送到远程 Git 仓库
- 你准备把博客部署到一台 VPS 上

本文同时覆盖两种部署方式：

- 方案 A：宿主机已经有 Nginx 在运行，推荐使用
- 方案 B：使用仓库自带的 Docker Nginx，一体化部署

如果你的 VPS 已经有宿主机 Nginx 在跑，优先使用方案 A。

## 2. 服务器最低建议

- `2 vCPU`
- `2 GB RAM`
- `20 GB` 以上磁盘
- Ubuntu `22.04` 或 `24.04`

## 3. 首次准备

登录服务器：

```bash
ssh root@你的VPSIP
```

安装基础工具：

```bash
apt update
apt install -y git curl ca-certificates
```

## 4. 拉取项目

```bash
mkdir -p /opt
cd /opt
git clone 你的仓库地址 neon-district
cd /opt/neon-district
```

执行初始化脚本：

```bash
bash ops/deploy/bootstrap-ubuntu.sh
```

这个脚本会安装：

- Docker
- Docker Compose Plugin
- Git

## 5. 配置生产环境变量

复制模板：

```bash
cp .env.production.example .env.production
```

编辑：

```bash
nano .env.production
```

建议内容：

```env
DATABASE_URL="postgresql://postgres:postgres@db:5432/neon_blog?schema=public"
AUTH_SECRET="替换成随机长字符串"
AUTH_URL="https://你的域名"
NEXT_PUBLIC_SITE_URL="https://你的域名"
ADMIN_EMAIL="admin@example.com"
ADMIN_PASSWORD="替换成你的后台密码"
```

如果暂时还没有域名，可以先用：

```env
AUTH_URL="http://你的VPSIP"
NEXT_PUBLIC_SITE_URL="http://你的VPSIP"
```

## 6. 必须持久化的目录

项目运行时有两个目录必须持久化：

- `content/`
- `public/uploads/`

作用如下：

- `content/posts/*.md` 保存文章正文
- `content/topics.json` 保存专题数据
- `public/uploads/` 保存封面图和正文上传图片

## 7. 方案 A：宿主机已有 Nginx

这是你当前服务器最适合的部署方式。

### 7.1 推荐 Compose 结构

在这种模式下，建议 Docker 只跑：

- `app`
- `db`

宿主机 Nginx 负责：

- 80/443 端口
- HTTPS
- 反向代理到 `127.0.0.1:3000`
- 直接暴露 `/uploads/`

### 7.2 建议的 docker-compose

你可以把 `docker-compose.yml` 调整为下面这种结构：

```yaml
services:
  app:
    build:
      context: .
      dockerfile: Dockerfile
    restart: unless-stopped
    env_file:
      - .env.production
    depends_on:
      db:
        condition: service_healthy
    ports:
      - "3000:3000"
    volumes:
      - ./content:/app/content
      - ./public/uploads:/app/public/uploads
    networks:
      - blog_net

  db:
    image: postgres:16
    restart: unless-stopped
    environment:
      POSTGRES_DB: neon_blog
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: postgres
    volumes:
      - postgres_data:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U postgres -d neon_blog"]
      interval: 10s
      timeout: 5s
      retries: 5
    networks:
      - blog_net

volumes:
  postgres_data:

networks:
  blog_net:
```

### 7.3 启动容器

```bash
cd /opt/neon-district
mkdir -p content/posts public/uploads
docker compose up -d --build
```

检查：

```bash
docker compose ps
curl http://127.0.0.1:3000/api/health
```

### 7.4 配置宿主机 Nginx

新建配置：

```bash
nano /etc/nginx/sites-available/personal-blog.conf
```

写入：

```nginx
server {
    listen 80;
    server_name 你的域名;

    client_max_body_size 20M;

    location /uploads/ {
        alias /opt/neon-district/public/uploads/;
        expires 30d;
        add_header Cache-Control "public, max-age=2592000, immutable";
    }

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

启用并重载：

```bash
ln -s /etc/nginx/sites-available/personal-blog.conf /etc/nginx/sites-enabled/personal-blog.conf
nginx -t
systemctl reload nginx
```

### 7.5 配置 HTTPS

确保域名已经解析到 VPS。

安装 Certbot：

```bash
apt update
apt install -y certbot python3-certbot-nginx
```

签发证书：

```bash
certbot --nginx -d 你的域名 -d www.你的域名
```

自动续签测试：

```bash
certbot renew --dry-run
```

## 8. 方案 B：Docker 内自带 Nginx

如果你的宿主机没有 Nginx，可以直接使用仓库当前自带的 `docker-compose.yml`。

启动：

```bash
cd /opt/neon-district
mkdir -p content/posts public/uploads
docker compose up -d --build
```

该模式下会启动：

- `app`
- `db`
- `nginx`

注意：

- 宿主机不能已有其他服务占用 `80` 端口
- 如果宿主机已有 Nginx，这种模式会报端口冲突

## 9. 防火墙与安全组

如果启用了 UFW：

```bash
ufw allow 22
ufw allow 80
ufw allow 443
ufw enable
ufw status
```

如果使用云厂商安全组，也要同时放行：

- TCP `22`
- TCP `80`
- TCP `443`

## 10. 部署后的检查

检查容器：

```bash
docker compose ps
```

查看应用日志：

```bash
docker compose logs -f app
```

检查健康接口：

```bash
curl http://127.0.0.1:3000/api/health
```

如果已经接了域名：

```bash
curl -I https://你的域名
curl https://你的域名/api/health
curl -I https://你的域名/rss.xml
curl -I https://你的域名/sitemap.xml
```

也可以用项目自带脚本：

```bash
bash ops/deploy/healthcheck.sh http://localhost
```

## 11. 后台访问

后台登录地址：

```text
/admin/login
```

登录密码来自：

```env
ADMIN_PASSWORD
```

## 12. 更新部署

以后更新代码的标准流程：

```bash
cd /opt/neon-district
git pull --ff-only
docker compose down
docker compose up -d --build
docker compose ps
```

也可以直接使用项目脚本：

```bash
bash ops/deploy/deploy.sh
```

## 13. 备份建议

必须备份：

- `/opt/neon-district/content/`
- `/opt/neon-district/public/uploads/`
- PostgreSQL 数据卷
- `.env.production`

最低限度你至少应该定期备份：

```text
content/
public/uploads/
.env.production
```

## 14. 常见问题

### 14.1 80 端口被占用

原因：

- 宿主机已有 Nginx
- 或已有其他 Web 服务

处理：

- 如果宿主机已有 Nginx，改用“方案 A”
- 不要再让 Docker 内的 Nginx 绑定 80 端口

### 14.2 图片上传后访问不到

检查：

- 文件是否落在 `public/uploads/`
- Nginx 是否正确配置了 `/uploads/` 的 `alias`
- 宿主机是否对该目录有读取权限

### 14.3 后台登录失败

检查：

- `.env.production` 里的 `ADMIN_PASSWORD`
- `AUTH_SECRET`
- 是否重启了容器使新环境变量生效

### 14.4 发布了文章但前台看不到

原因通常是：

- 文章还是 `draft`
- 没有点击“立即发布”

## 15. 推荐上线后检查清单

1. 首页可打开
2. 后台登录可用
3. 新建文章可保存
4. Markdown 导入可用
5. 图片上传可用
6. 发布文章后前台可见
7. `rss.xml` 可访问
8. `sitemap.xml` 可访问
9. `robots.txt` 可访问
10. HTTPS 证书正常
