# RSS 阅读器

基于 Miniflux API 的 Web 版 RSS 阅读器，支持分类管理、文章搜索、收藏等功能。

## 功能特性

- **认证系统**：基于 Miniflux Token 的用户认证
- **分类管理**：创建、编辑、删除文章分类
- **RSS 源管理**：添加、编辑、删除、刷新 RSS 源
- **文章阅读**：
  - 列表视图 / 阅读器视图
  - 已读 / 未读 / 收藏 状态管理
  - 上一篇 / 篇导航
- **搜索功能**：全文搜索（中文需配置 PostgreSQL pg_trgm 扩展）
- **OPML 导入/导出**：批量导入/导出订阅源
- **主题切换**：支持浅色/深色/自动模式
- **响应式设计**：适配桌面和移动设备

## 技术栈

### 后端
- Miniflux (Go) - RSS 聚合服务
- PostgreSQL 15 - 数据库

### 前端
- Vue 3 - 框架
- Vite - 构建工具
- TypeScript - 类型系统
- Element Plus - UI 组件库
- Pinia - 状态管理
- Vue Router - 路由
- Axios - HTTP 客户端

## 快速开始

### 开发环境

1. **启动后端服务**

```bash
docker-compose up -d
```

服务启动后：
- Miniflux API: http://localhost:8080
- 默认账号: `admin` / `admin123`

2. **启动前端开发服务器**

```bash
cd frontend
npm install
npm run dev
```

前端地址: http://localhost:5173

### 生产部署

1. **构建前端**

```bash
cd frontend
npm run build
```

2. **启动服务**

```bash
docker-compose -f docker-compose.prod.yml up -d
```

访问: http://localhost

## 项目结构

```
RSS-reader/
├── frontend/                 # 前端项目
│   ├── src/
│   │   ├── api/             # API 调用
│   │   ├── assets/          # 静态资源
│   │   ├── components/      # Vue 组件
│   │   ├── router/          # 路由配置
│   │   ├── stores/          # Pinia 状态管理
│   │   ├── types/           # TypeScript 类型
│   │   └── views/           # 页面视图
│   ├── package.json
│   └── vite.config.ts
├── nginx/                   # Nginx 配置
│   ├── nginx.conf           # 反向代理配置
│   └── Dockerfile
├── docker-compose.yml       # 开发环境
├── docker-compose.prod.yml  # 生产环境
└── README.md
```

## 配置说明

### CORS 配置

开发环境通过 Vite proxy 解决跨域问题。生产环境在 Nginx 层配置了 CORS 头部。

### 中文搜索支持

Miniflux 的全文搜索依赖 PostgreSQL。对于中文内容，需要手动配置 `pg_trgm` 扩展：

```sql
-- 连接到数据库
docker exec -it rss-postgres psql -U miniflux -d miniflux

-- 创建扩展
CREATE EXTENSION IF NOT EXISTS pg_trgm;
```

### 主题系统

主题使用 CSS 变量 + `prefers-color-scheme` 实现：
- 跟随系统：自动适配系统设置
- 浅色/深色：强制使用指定模式
- Element Plus 暗黑模式自动同步

## API 文档

Miniflux API 文档: http://localhost:8080/swagger.json

主要端点：

| 方法 | 路径 | 说明 |
|------|------|------|
| POST | `/api/v1/login` | 用户登录 |
| GET | `/api/v1/me` | 获取当前用户 |
| GET | `/api/v1/feeds` | 获取 RSS 源列表 |
| POST | `/api/v1/feeds` | 添加 RSS 源 |
| GET | `/api/v1/entries` | 获取文章列表 |
| PUT | `/api/v1/entries/{id}` | 更新文章状态 |

## 开发指南

### 添加新页面

1. 在 `frontend/src/views/` 创建组件
2. 在 `frontend/src/router/index.ts` 添加路由
3. 更新导航菜单

### API 调用

```typescript
import apiClient from '@/api/client'
import type { Entry } from '@/types'

export const myApi = {
  list() {
    return apiClient.get<Entry[]>('/endpoint')
  }
}
```

### 状态管理

```typescript
import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useMyStore = defineStore('my', () => {
  const data = ref([])
  // ...
  return { data }
})
```

## 常见问题

**Q: 登录后提示 401 错误？**

A: 检查 Miniflux 服务是否正常启动，确认账号密码正确。


**Q: 添加 RSS 源失败？**

A: 确认 RSS 地址有效，部分网站可能有反爬限制。

**Q: 中文搜索无结果？**

A: 参考"中文搜索支持"章节配置 PostgreSQL 扩展。

## 许可证

MIT License
