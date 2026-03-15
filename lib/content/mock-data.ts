import type { PostRecord, TopicRecord } from "@/lib/types";

export const mockTopics: TopicRecord[] = [
  {
    id: "topic-frontend-systems",
    name: "Frontend Systems",
    slug: "frontend-systems",
    description: "聚焦前端架构、渲染模型、组件系统与工程化基础设施。",
    accentColor: "#00f6ff",
    postCount: 2
  },
  {
    id: "topic-shipping-notes",
    name: "Shipping Notes",
    slug: "shipping-notes",
    description: "记录真实项目的上线过程、技术取舍、事故复盘与部署经验。",
    accentColor: "#ff2bd6",
    postCount: 1
  },
  {
    id: "topic-ai-lab",
    name: "AI Lab",
    slug: "ai-lab",
    description: "用于沉淀模型接入、Agent 工作流和多工具协作实验。",
    accentColor: "#ffe600",
    postCount: 1
  }
];

export const mockPosts: PostRecord[] = [
  {
    id: "post-react-compiler",
    title: "React Compiler 接入前需要先做哪些准备",
    slug: "react-compiler-readiness",
    summary: "从组件副作用、状态模型到 lint 规则，梳理团队在接入前必须补齐的工程前置条件。",
    topicSlug: "frontend-systems",
    topicName: "Frontend Systems",
    accentColor: "#00f6ff",
    tags: ["react", "compiler", "frontend"],
    publishedAt: "2026-03-14T08:00:00.000Z",
    readingTime: 8,
    isFeatured: true,
    status: "published",
    contentMarkdown: `## 为什么不是直接开启\n\n很多团队把 React Compiler 当成一个构建开关，但真实情况并不是这样。\n\n### 需要先处理的问题\n\n- 不稳定的副作用\n- 不可预测的 props 变更\n- 组件边界过大\n\n> 先清理组件模型，再接编译器，收益会高得多。\n\n\`\`\`tsx\nfunction Card({ title }: { title: string }) {\n  return <h2>{title}</h2>;\n}\n\`\`\`\n\n## 一个更稳妥的迁移节奏\n\n1. 先补 lint 和静态分析\n2. 再建立灰度开关\n3. 最后挑低风险页面试点`
  },
  {
    id: "post-vps-deploy",
    title: "在 Ubuntu VPS 上部署全栈博客的最短路径",
    slug: "ubuntu-vps-blog-deploy",
    summary: "从 Docker Compose、Nginx 到持久化卷，梳理个人博客在单机 VPS 上的可维护部署模式。",
    topicSlug: "shipping-notes",
    topicName: "Shipping Notes",
    accentColor: "#ff2bd6",
    tags: ["ubuntu", "docker", "nginx"],
    publishedAt: "2026-03-13T08:00:00.000Z",
    readingTime: 7,
    isFeatured: true,
    status: "published",
    contentMarkdown: `## 目标\n\n我们要的是一套可维护的部署方式，而不是一次性把服务跑起来。\n\n### 推荐组合\n\n- Next.js 应用容器\n- PostgreSQL 容器\n- Nginx 容器\n- 持久化卷\n\n## 关键原则\n\n- 应用无状态\n- 数据和上传资源持久化\n- 反向代理统一处理 HTTPS\n\n\`\`\`yaml\nservices:\n  app:\n    build: .\n  db:\n    image: postgres:16\n\`\`\``
  },
  {
    id: "post-markdown-pipeline",
    title: "Markdown 导入链路应该如何设计",
    slug: "markdown-import-pipeline",
    summary: "把 Markdown 当成内容源时，如何定义 frontmatter、slug 规则、专题映射与入库流程。",
    topicSlug: "frontend-systems",
    topicName: "Frontend Systems",
    accentColor: "#4b74ff",
    tags: ["markdown", "cms", "content"],
    publishedAt: "2026-03-12T08:00:00.000Z",
    readingTime: 6,
    isFeatured: false,
    status: "published",
    contentMarkdown: `## 内容模型先行\n\nMarkdown 导入不是“读取文件然后保存”这么简单，先定义约束才不会后期失控。\n\n### 推荐 frontmatter 字段\n\n- title\n- slug\n- summary\n- topic\n- tags\n- publishedAt\n\n## 导入步骤\n\n1. 解析 frontmatter\n2. 校验字段\n3. 规范化 slug\n4. upsert 到数据库\n5. 触发 revalidate`
  },
  {
    id: "post-agent-review",
    title: "多 Agent 审阅流程怎么设计才真正有效",
    slug: "multi-agent-review-playbook",
    summary: "如果你准备让多个 agent 为代码打分，关键不在数量，而在提交颗粒度、验证步骤和可审阅性。",
    topicSlug: "ai-lab",
    topicName: "AI Lab",
    accentColor: "#ffe600",
    tags: ["agent", "review", "workflow"],
    publishedAt: "2026-03-11T08:00:00.000Z",
    readingTime: 5,
    isFeatured: true,
    status: "draft",
    contentMarkdown: `## 评审的前提是可审阅\n\n多个 agent 并不会自动提高质量。只有当提交边界清晰、验证路径明确时，多 agent 审阅才有意义。\n\n### 建议做法\n\n- 按模块拆 commit\n- 每个 commit 有独立验证步骤\n- 保留架构文档和环境变量说明`
  }
];
