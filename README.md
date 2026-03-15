# Neon District

赛博朋克风格个人博客，基于 `Next.js 15 + React 19 + TypeScript`，支持 Markdown 导入、专题管理、后台在线编辑、图片上传、RSS、sitemap 与 Ubuntu VPS 部署。

## 文档入口

- 项目说明：[docs/PROJECT_GUIDE.md](/C:/Users/Administrator/Desktop/web/docs/PROJECT_GUIDE.md)
- VPS 部署文档：[docs/VPS_DEPLOYMENT.md](/C:/Users/Administrator/Desktop/web/docs/VPS_DEPLOYMENT.md)
- 架构草案：[ARCHITECTURE.md](/C:/Users/Administrator/Desktop/web/ARCHITECTURE.md)

## 当前实现状态

- 前台站点已可用：首页、专题页、文章页、归档页
- 后台已可用：管理员登录、文章创建/编辑/发布/删除、专题管理
- 支持导入 Markdown 文件并接管本地图片
- 支持文章封面、专题封面和正文图片上传
- 支持 RSS、`sitemap.xml`、`robots.txt`
- 支持 Docker 部署

## 快速启动

```bash
npm install
npm run prisma:generate
npm run dev
```

浏览器访问：

- 前台：`http://localhost:3000`
- 后台：`http://localhost:3000/admin/login`

## 重要说明

- 当前线上内容存储采用文件仓储，文章保存在 `content/posts/*.md`，专题保存在 `content/topics.json`
- `prisma/schema.prisma` 和 PostgreSQL 已预留，当前主运行链路并不依赖数据库查询文章
- 管理员鉴权当前使用环境变量密码 + HttpOnly Cookie
