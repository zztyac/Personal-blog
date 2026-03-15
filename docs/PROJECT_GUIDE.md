# 项目说明

## 1. 项目定位

`Neon District` 是一个赛博朋克视觉风格的个人博客系统，目标是部署在 Ubuntu VPS 上，面向“个人写作 + 技术文章分享 + 后台在线管理”。

它当前已经具备完整的前台站点和后台 CMS 能力，适合个人长期维护。

## 2. 当前核心能力

- Markdown 文件导入创建文章
- 在线新建、编辑、保存草稿、发布文章
- 专题创建、修改、删除
- 文章删除
- 管理员登录保护后台
- 文章封面、专题封面、本地图片上传
- Markdown 内相对图片自动上传接管
- 前台归档搜索、标签筛选、分页、年份分组
- SEO：`rss.xml`、`sitemap.xml`、`robots.txt`

## 3. 技术栈

- `Next.js 15`
- `React 19`
- `TypeScript`
- `react-markdown + remark-gfm`
- `gray-matter`
- `zod`
- `Prisma`
- `PostgreSQL`
- `Docker Compose`

## 4. 当前真实数据架构

这一点需要特别说明。

虽然仓库里已经包含 `Prisma` 和 `PostgreSQL` 相关文件，但当前博客内容的真实读写链路是“文件仓储”，不是数据库仓储。

当前运行方式：

- 文章保存在 `content/posts/*.md`
- 专题保存在 `content/topics.json`
- 上传图片保存在 `public/uploads/`
- 后台编辑文章时，最终会把内容写回 Markdown 文件

相关核心文件：

- 内容仓储：[lib/content/repository.ts](/C:/Users/Administrator/Desktop/web/lib/content/repository.ts)
- Markdown 解析：[lib/markdown/import.ts](/C:/Users/Administrator/Desktop/web/lib/markdown/import.ts)
- 上传处理：[lib/uploads.ts](/C:/Users/Administrator/Desktop/web/lib/uploads.ts)

## 5. 目录结构

```text
app/
  (site)/                 前台页面
  admin/                  后台页面
  api/                    上传、导入、保存等接口
components/
  admin/                  后台组件
  site/                   前台组件
content/
  posts/                  Markdown 文章
  topics.json             专题数据
public/
  uploads/                上传资源
lib/
  auth/                   管理员鉴权
  content/                内容仓储
  markdown/               Markdown 解析
  uploads.ts              上传落盘与图片接管
ops/
  deploy/                 部署脚本
  nginx/                  Nginx 配置
prisma/
  schema.prisma           预留数据库模型
scripts/
  import-markdown.ts      导入脚本
  seed.ts                 种子脚本
```

## 6. 前台页面

- `/`
  首页，展示站点主视觉、精选内容和专题入口
- `/archive`
  文章归档，支持搜索、标签筛选、分页、年份分组
- `/topics/[topicSlug]`
  专题详情页
- `/posts/[postSlug]`
  文章详情页
- `/about`
  关于页

## 7. 后台页面

- `/admin/login`
  管理员登录
- `/admin`
  后台首页
- `/admin/posts`
  文章管理
- `/admin/posts/new`
  新建文章和导入 Markdown
- `/admin/posts/[id]/edit`
  编辑文章
- `/admin/topics`
  专题管理

## 8. 管理员鉴权

当前后台不是开放式后台，普通用户无法直接编辑内容。

机制如下：

- 登录密码来自环境变量 `ADMIN_PASSWORD`
- 会话签名由 `AUTH_SECRET + ADMIN_PASSWORD` 计算
- 登录成功后写入 HttpOnly Cookie
- 访问 `/admin` 及相关后台路由时必须通过校验

相关文件：

- 鉴权实现：[lib/auth/admin.ts](/C:/Users/Administrator/Desktop/web/lib/auth/admin.ts)
- 后台布局：[app/admin/layout.tsx](/C:/Users/Administrator/Desktop/web/app/admin/layout.tsx)

## 9. Markdown 导入规则

支持两种方式：

- 后台上传 `.md` 文件导入
- 直接粘贴 Markdown 文本导入

支持的能力：

- 可带 frontmatter
- frontmatter 不完整时自动补全
- 自动推导 `title`
- 自动生成安全 `slug`
- 自动提取 `summary`
- 缺少 `topic` 时使用后台默认专题
- 自动接管 Markdown 中的本地相对图片

推荐 frontmatter 示例：

```yaml
---
title: "文章标题"
slug: "post-slug"
summary: "文章摘要"
topic: "frontend-systems"
tags:
  - nextjs
  - react
coverImage: "/uploads/post-covers/2026/03/demo.jpg"
publishedAt: "2026-03-15T08:00:00.000Z"
status: "draft"
featured: false
---
```

## 10. 图片上传

支持三类图片：

- 文章封面
- 专题封面
- Markdown 正文图片

上传后统一落到：

```text
public/uploads/
```

URL 形式类似：

```text
/uploads/post-covers/2026/03/xxxxxxxx.jpg
```

## 11. SEO 能力

当前已经接入：

- RSS：[app/rss.xml/route.ts](/C:/Users/Administrator/Desktop/web/app/rss.xml/route.ts)
- Sitemap：[app/sitemap.ts](/C:/Users/Administrator/Desktop/web/app/sitemap.ts)
- Robots：[app/robots.ts](/C:/Users/Administrator/Desktop/web/app/robots.ts)

站点基本配置在：

- [lib/site-config.ts](/C:/Users/Administrator/Desktop/web/lib/site-config.ts)

## 12. 环境变量

生产环境至少需要这些变量：

```env
DATABASE_URL="postgresql://postgres:postgres@db:5432/neon_blog?schema=public"
AUTH_SECRET="replace-with-a-long-random-string"
AUTH_URL="https://your-domain.com"
NEXT_PUBLIC_SITE_URL="https://your-domain.com"
ADMIN_EMAIL="admin@example.com"
ADMIN_PASSWORD="change-me-now"
```

说明：

- `NEXT_PUBLIC_SITE_URL` 会影响 RSS、sitemap、SEO URL
- `ADMIN_PASSWORD` 是后台登录密码
- `AUTH_SECRET` 必须改成随机长字符串
- 当前内容主链路不依赖数据库，但环境变量模板仍保留了 PostgreSQL 配置

## 13. 本地开发

安装依赖：

```bash
npm install
```

生成 Prisma Client：

```bash
npm run prisma:generate
```

启动开发环境：

```bash
npm run dev
```

构建验证：

```bash
npm run build
```

## 14. 常用运维动作

新增文章：

- 后台进入 `/admin/posts/new`
- 手工填写或导入 Markdown
- 保存草稿或立即发布

修改文章：

- 后台文章列表进入编辑页
- 左侧实时编辑，右侧实时预览

删除文章：

- 后台文章管理页删除
- 或编辑页中删除

新增专题：

- 后台进入 `/admin/topics`

## 15. 当前已知技术边界

- 当前文章仓储是文件系统，不是数据库
- `Prisma` 主要用于后续扩展和保留模型
- 管理员系统当前是单管理员密码模式，不是多用户系统
- 若 Markdown 源文件编码不是 UTF-8，仍可能需要手工转码

## 16. 后续建议

如果后面继续升级，优先级建议如下：

1. 切换到数据库文章仓储
2. 支持多管理员账户
3. 支持 HTTPS 自动续签文档化
4. 增加评论或订阅功能
5. 引入对象存储替代本地上传目录
