# Neon District

赛博朋克风格的个人博客骨架，目标是部署在 Ubuntu VPS 上，支持：

- Markdown 文件导入
- 专题组织与独立文章链接
- 管理后台在线编辑
- PostgreSQL + Prisma 数据模型
- Docker Compose 部署

## 当前进度

当前仓库已完成：

- Next.js 15 + React 19 + TypeScript 项目骨架
- 前台首页、专题页、文章页
- 后台 Dashboard、文章管理、专题管理、编辑器骨架
- Markdown 解析工具与导入脚本
- Prisma schema 和种子脚本
- Dockerfile、docker-compose、Nginx 反向代理配置

当前后台编辑与登录仍是 UI 骨架，下一阶段接入：

- Auth.js Credentials 登录
- Prisma 真实读写
- 上传资源管理
- 在线保存与发布

## 本地运行

1. 安装依赖

```bash
npm install
```

2. 配置环境变量

```bash
cp .env.example .env
```

3. 生成 Prisma Client

```bash
npm run prisma:generate
```

4. 启动开发环境

```bash
npm run dev
```

## Markdown 导入验证

```bash
node --import tsx scripts/import-markdown.ts
```

导入目录为：

```text
content/imports
```

## 生产部署思路

在 Ubuntu VPS 上：

1. 准备 `.env.production`
2. 执行 `docker compose up -d --build`
3. 用 Nginx 暴露 80 端口
4. 后续接入 HTTPS 证书

当前部署文件已经考虑内容持久化：

- `content/` 会作为卷挂载，后台新增/编辑文章后不会因容器重建丢失
- `public/uploads/` 会作为卷挂载，本地上传的封面图和正文图片会保留

推荐部署脚本：

- `ops/deploy/bootstrap-ubuntu.sh`
- `ops/deploy/deploy.sh`
- `ops/deploy/healthcheck.sh`

## 下一步建议

下一阶段优先完成：

1. Auth.js 管理员登录
2. Post / Topic 的 Prisma 真实查询
3. 文章保存、发布和下线接口
4. 图片上传
5. VPS 部署联调
