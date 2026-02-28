# Notion Headless CMS 接入指南

## 一、安装依赖

在项目根目录执行：

```bash
npm install
```

主要依赖包括：
- `react-notion-x`：渲染 Notion 内容
- `notion-client`：获取 Notion 页面数据（作为 react-notion-x 的 peer 使用）
- `prismjs`、`katex`：代码高亮与数学公式（可选）

## 二、所需凭证

### 方案 A：公开页面（推荐起步）

**无需任何凭证**。只要你的 Notion 页面已设为「公开分享」：

1. 在 Notion 中打开目标页面
2. 右上角点击 **分享** → **发布** → 开启 **公开分享**
3. 复制链接中的 Page ID，例如：
   - 链接：`https://www.notion.so/My-Page-067dd719a912471ea9a3ac10710e7fdf`
   - Page ID：`067dd719a912471ea9a3ac10710e7fdf`（通常是 32 位十六进制）

访问 `http://localhost:3000/post/067dd719a912471ea9a3ac10710e7fdf` 即可查看渲染结果。

### 方案 B：私有页面

需要从浏览器 Cookie 中获取：

| 环境变量 | 说明 | 获取方式 |
|---------|------|----------|
| `NOTION_TOKEN_V2` | 认证令牌 | F12 → Application → Cookies → 复制 `token_v2` 的值 |
| `NOTION_ACTIVE_USER` | 用户 ID | 同上，复制 `notion_user_id` 的值 |

1. 复制 `.env.example` 为 `.env.local`
2. 填入上述两个值
3. 重启 `npm run dev`

> ⚠️ 注意：`notion-client` 使用的是**非官方 Notion API**，不是 Notion 官方开发者平台提供的 Integration Token。私有页面的 Cookie 会过期，需定期更新。

## 三、项目结构

```
├── app/
│   ├── post/[id]/page.tsx    # 动态文章页
│   ├── layout.tsx
│   ├── globals.css
│   └── notion-overrides.css  # Notion 极简样式覆盖
├── lib/
│   └── notion.ts             # getNotionPage() 示例函数
└── .env.local                # 凭证（私有页面时使用）
```

## 四、使用示例

```ts
import { getNotionPage } from "@/lib/notion";

const recordMap = await getNotionPage("067dd719a912471ea9a3ac10710e7fdf");
// 将 recordMap 传给 NotionRenderer 即可渲染
```

## 五、启动项目

```bash
npm run dev
```

访问 http://localhost:3000 查看首页，点击「查看示例文章」可预览 Notion 官方测试页面。
