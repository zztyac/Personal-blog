# Personal Cyberpunk Blog Architecture

## 1. 项目目标

构建一个部署在 Ubuntu VPS 上的个人博客系统，核心目标如下：

- 支持通过 Markdown 文件批量导入和管理文章
- 支持专题分类，每篇文章拥有独立可分享链接
- 管理员可在线创建、编辑、发布、下线文章
- 视觉风格突出“赛博朋克”，具备较强设计感
- 兼顾 SEO、性能、可维护性与后续扩展能力

## 2. 推荐技术栈

### 前端

- Next.js 15
- React 19
- TypeScript
- Tailwind CSS 4 或 Tailwind CSS 3 + CSS Variables
- MDX / Markdown 渲染链
- Framer Motion 用于必要的页面动效

### 后端

- Next.js App Router Route Handlers
- tRPC 或 REST API
- Prisma ORM
- PostgreSQL
- NextAuth/Auth.js 或 Lucia 用于管理员登录

### 内容处理

- `remark` / `rehype`
- `gray-matter` 解析 Markdown Frontmatter
- `shiki` 或 `rehype-pretty-code` 做代码高亮
- `reading-time` 计算阅读时长
- slug 生成与唯一性校验

### 编辑器

- 基于 Tiptap 的富文本 Markdown 编辑
- 或使用 Milkdown / Toast UI Editor
- 推荐保留“源码模式 + 预览模式”

### 部署与运维

- Ubuntu VPS
- Docker Compose
- Nginx
- PostgreSQL
- 可选对象存储：S3 / Cloudflare R2，用于图片资源
- PM2 可作为非 Docker 备用方案，但不作为首选

## 3. 系统总体架构

采用单仓库全栈方案，优先控制复杂度：

- `web`: Next.js 前台站点 + 管理后台 + API
- `db`: PostgreSQL
- `nginx`: HTTPS 反向代理与缓存控制
- `storage`: 本地 uploads 或对象存储

建议架构：

1. 用户访问公开博客页面
2. Next.js 服务端渲染专题页、文章页、首页
3. 文章内容来自 PostgreSQL，正文以 Markdown 原文保存
4. 页面渲染时将 Markdown 转为 HTML/React 内容
5. 管理员登录后台后在线编辑文章
6. Markdown 文件导入脚本负责批量导入本地内容
7. 发布后触发缓存失效或页面重新生成

## 4. 目录结构建议

```text
web/
  app/
    (site)/
      page.tsx
      topics/[topicSlug]/page.tsx
      posts/[postSlug]/page.tsx
      archive/page.tsx
      about/page.tsx
    admin/
      login/page.tsx
      dashboard/page.tsx
      posts/page.tsx
      posts/new/page.tsx
      posts/[id]/edit/page.tsx
      topics/page.tsx
      media/page.tsx
      settings/page.tsx
    api/
      auth/[...nextauth]/route.ts
      posts/route.ts
      posts/[id]/route.ts
      posts/import/route.ts
      topics/route.ts
      upload/route.ts
  components/
    site/
    admin/
    editor/
    ui/
  lib/
    auth/
    db/
    markdown/
    seo/
    theme/
    validation/
  scripts/
    import-markdown.ts
    seed.ts
  prisma/
    schema.prisma
  public/
    images/
  docs/
```

## 5. 核心功能设计

### 5.1 Markdown 导入

支持两种导入方式：

- 离线导入：管理员将 Markdown 文件放入指定目录，通过脚本批量导入
- 在线导入：后台上传 `.md` 文件并即时解析入库

推荐 Frontmatter 规范：

```yaml
title: "React Fiber 架构导读"
slug: "react-fiber-architecture"
summary: "从调度模型到渲染机制的完整拆解"
topic: "react-internals"
tags:
  - react
  - fiber
  - frontend
coverImage: "/images/react-fiber-cover.jpg"
publishedAt: "2026-03-15T08:00:00Z"
status: "published"
featured: true
```

正文部分保留原始 Markdown，数据库中至少保存：

- `contentMarkdown`
- `contentHtml` 或渲染缓存

导入流程：

1. 读取 Markdown 文件
2. 解析 Frontmatter
3. 校验 slug、topic、标题、摘要等字段
4. 入库文章主记录
5. 建立与专题、标签的关联
6. 可选生成目录、阅读时长、摘要

### 5.2 专题系统

专题是站点一级内容组织方式，不只是简单分类。

建议专题字段：

- `name`
- `slug`
- `description`
- `coverStyle`
- `accentColor`
- `icon`
- `sortOrder`

专题页面能力：

- 独立 URL，例如 `/topics/react-internals`
- 专题简介、视觉头图、文章列表
- 支持排序、分页、精选文章展示
- 后续可扩展专题专属布局或主题色

### 5.3 文章独立分享链接

每篇文章使用稳定 slug 路由：

- `/posts/react-fiber-architecture`

如果未来有多语言或需要专题层级，也可扩展为：

- `/topics/react-internals/react-fiber-architecture`

推荐实际实现：

- 数据库中同时保存全局唯一 `slug`
- URL 使用 `/posts/[slug]`
- 页面中展示所属专题并提供专题跳转

原因：

- 路由更稳定
- 重命名专题时不会影响文章 URL
- 分享链接更短

### 5.4 在线编辑后台

后台最少应覆盖：

- 登录页
- 仪表盘
- 文章列表
- 新建文章
- 编辑文章
- 专题管理
- 媒体资源管理
- 站点设置

文章编辑页建议能力：

- 标题、slug、摘要、封面图
- 专题选择
- 标签管理
- Markdown 源码编辑
- 实时预览
- 自动保存草稿
- 发布/下线
- SEO 字段编辑

推荐编辑体验：

- 左侧源码，右侧预览
- 支持代码块、表格、引用、任务列表
- 支持文章封面、内嵌图片和视频链接

## 6. 数据模型设计

建议核心表如下：

### User

- `id`
- `email`
- `passwordHash`
- `role`
- `displayName`
- `createdAt`

### Topic

- `id`
- `name`
- `slug`
- `description`
- `coverImage`
- `accentColor`
- `isVisible`
- `sortOrder`
- `createdAt`
- `updatedAt`

### Post

- `id`
- `title`
- `slug`
- `summary`
- `coverImage`
- `contentMarkdown`
- `contentHtml`
- `tocJson`
- `status` (`draft`, `published`, `archived`)
- `publishedAt`
- `readingTime`
- `isFeatured`
- `seoTitle`
- `seoDescription`
- `canonicalUrl`
- `topicId`
- `authorId`
- `createdAt`
- `updatedAt`

### Tag

- `id`
- `name`
- `slug`

### PostTag

- `postId`
- `tagId`

### MediaAsset

- `id`
- `filename`
- `mimeType`
- `url`
- `size`
- `width`
- `height`
- `uploadedAt`

### SiteSetting

- `id`
- `siteName`
- `siteDescription`
- `siteUrl`
- `heroTitle`
- `heroSubtitle`
- `socialLinksJson`
- `analyticsCode`

## 7. 页面设计规划

### 首页

首页不是普通博客列表，应突出赛博朋克氛围：

- 动态霓虹网格背景
- 大字号 Hero 标题
- 精选专题入口
- 最新文章 / 精选文章 / 热门标签
- 滚动渐变与故障风动效

### 专题页

- 专题封面区
- 专题描述
- 文章时间线或卡片流布局
- 专题色彩强化

### 文章页

- 沉浸式排版
- 左侧目录 / 右侧分享栏（桌面端）
- 阅读进度条
- 代码块高亮与复制
- 相关文章推荐

### 后台

后台风格仍可延续站点视觉，但要优先可用性：

- 深色基底 + 高对比荧光强调色
- 清晰的数据表格
- 明确的草稿/发布状态

## 8. 赛博朋克视觉方向

设计原则：

- 主色不走常见紫黑模板，建议采用青绿、电蓝、洋红、酸性黄的有限组合
- 使用发光描边、栅格背景、数字噪点、扫描线和半透明面板
- 控制炫技强度，避免影响可读性

建议视觉变量：

- `--bg-base: #060816`
- `--bg-panel: rgba(10, 18, 40, 0.72)`
- `--line-neon: #00f6ff`
- `--accent-hot: #ff2bd6`
- `--accent-warning: #ffe600`
- `--text-main: #eaf7ff`
- `--text-dim: #8aa6c1`

可实现的设计细节：

- Hero 标题使用科技感字体
- 标题悬停轻微 glitch 效果
- 卡片边缘发光
- 页面 section 切换使用扫描动画
- 背景加入非常轻量的网格和 noise 纹理

## 9. 渲染与性能策略

推荐混合渲染：

- 首页、专题页、文章页使用静态生成 + 增量再生成
- 后台页面走动态渲染
- 发布文章后对对应路径执行 revalidate

原因：

- 公开页面访问快，利于 SEO
- 后台管理逻辑简单
- Ubuntu 单机 VPS 足够承载中小规模个人博客

## 10. SEO 与分享优化

必须支持：

- 自定义页面 title / description
- Open Graph
- Twitter Cards
- sitemap.xml
- robots.txt
- RSS Feed
- canonical URL
- 文章发布日期与更新时间结构化数据

每篇文章分享卡片包含：

- 标题
- 摘要
- 封面图
- 专题信息

## 11. 管理权限与安全

管理员后台至少需要：

- 账号密码登录
- HttpOnly Cookie Session
- CSRF 防护
- 表单校验
- Markdown 内容清洗，防止 XSS
- 上传文件类型与大小限制
- 登录失败限流
- 管理后台路径保护

如果只有单管理员，可先采用：

- 单用户管理模型
- 预留多用户字段，不立即开放

## 12. 图片与媒体策略

初期可行方案：

- 本地 `public/uploads` 存储

更稳妥的线上方案：

- 使用 S3 或 R2 存储
- 数据库存储文件元数据

推荐原因：

- VPS 重装迁移更容易
- 图片访问更快
- 便于后续接 CDN

## 13. Ubuntu VPS 部署方案

推荐部署形态：

- Docker Compose 管理 `nextjs + postgres + nginx`
- HTTPS 由 Nginx + Let's Encrypt 处理
- 使用 `.env.production` 管理密钥
- 通过 `docker compose up -d --build` 发布

服务组成：

- `app`: Next.js 生产服务
- `db`: PostgreSQL
- `nginx`: 80/443 入口

部署后需要的基础能力：

- 自动重启
- 日志查看
- 数据库定时备份
- 静态资源目录持久化

## 14. 推荐开发分期

### Phase 1: 最小可上线版本

- 博客首页
- 专题列表/专题页
- 文章详情页
- Markdown 导入
- 管理员登录
- 在线编辑文章
- 发布/草稿状态
- Ubuntu 部署

### Phase 2: 体验增强

- 文章全文搜索
- 标签页
- RSS
- sitemap
- SEO 优化
- 图片上传管理
- 自动保存

### Phase 3: 内容增长能力

- 评论系统
- 点赞/阅读量
- 系列文章导航
- 相关文章推荐
- 多作者支持
- Newsletter 订阅

## 15. 我建议的最终实现方案

如果目标是“设计感强、能长期维护、后面能快速上线”，建议采用以下组合：

- Next.js 15 + TypeScript
- PostgreSQL + Prisma
- NextAuth/Auth.js
- Markdown 原文入库
- 管理后台在线编辑
- `remark/rehype` 渲染链
- Docker Compose 部署到 Ubuntu VPS
- 首期本地上传，二期切换 R2/S3

这是当前约束下性价比最高的方案，原因是：

- 单仓库开发与部署简单
- 支持你要求的 Markdown 导入和在线编辑
- 公开页性能和 SEO 都足够好
- 后续扩展评论、搜索、订阅不需要推倒重来

## 16. 建议优先实现的可行功能

除你明确要求的 3 项外，我建议首批增加这些功能：

- 草稿/发布双状态
- 文章封面与摘要
- SEO 字段
- 代码高亮
- 自动生成文章目录
- 阅读时长
- 精选文章推荐
- RSS
- sitemap
- 后台自动保存

这些功能开发成本不高，但会明显提升博客的完整度。

## 17. 后续实施建议

下一阶段直接进入项目初始化与编码时，建议执行顺序如下：

1. 初始化 Next.js 全栈项目
2. 搭建 Prisma 与 PostgreSQL
3. 建立文章、专题、标签数据模型
4. 完成公开博客页面
5. 完成后台登录与文章管理
6. 完成 Markdown 导入链路
7. 完成 Docker Compose 与 Nginx 部署文件
8. 联调生产环境发布流程

## 18. 对“多 Agent 审阅”的建议

你后续要求 Claude Code、OpenCode 等其他 agent 评审代码，这对项目是有利的。为了让评审更有效，建议在实现阶段保持以下标准：

- 每个阶段单独提交 commit
- 文档、数据模型、页面、后台、部署拆分提交
- 每次提交都附带可运行验证步骤
- 保持明确的目录结构和环境变量说明

这样其他 agent 评审时，问题定位会更快，评分也更客观。
