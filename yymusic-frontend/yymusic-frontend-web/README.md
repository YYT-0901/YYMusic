# yy音乐前端项目

[![React](https://img.shields.io/badge/React-18.2.0-61dafb?style=flat-square&logo=react)](https://reactjs.org/)
[![Vite](https://img.shields.io/badge/Vite-5.0.8-646cff?style=flat-square&logo=vite)](https://vitejs.dev/)
[![Redux Toolkit](https img.shields.io/badge/Redux_Toolkit-2.0.1-764abc?style=flat-square&logo=redux)](https://redux-toolkit.js.org/)

> yy音乐前端项目 - 符合市场规范的React工程化项目

## 📋 目录

- [项目介绍](#项目介绍)
- [技术栈](#技术栈)
- [项目结构](#项目结构)
- [快速开始](#快速开始)
- [常用命令](#常用命令)
- [代码规范](#代码规范)
- [API文档](#api文档)
- [贡献指南](#贡献指南)

## 项目介绍

这是一个基于 React 18 + Vite 构建的现代化前端项目，采用模块化架构设计，严格遵循团队代码规范。

**主要特性：**
- ⚡ 极速的开发体验 (Vite + HMR)
- 📦 完善的状态管理 (Redux Toolkit)
- 🛣️ 声明式路由 (React Router v6)
- 🎨 CSS 模块化支持 (Sass)
- 🔧 完整的工具函数库
- ✅ 单元测试支持 (Vitest)
- 📝 Git 提交规范 (Commitlint)

## 技术栈

| 分类 | 技术 |
|------|------|
| 构建工具 | Vite 5.0 |
| 框架 | React 18 |
| 状态管理 | Redux Toolkit |
| 路由 | React Router DOM v6 |
| 网络请求 | Axios |
| 样式方案 | Sass + CSS Modules |
| 代码规范 | ESLint + Prettier |
| 测试框架 | Vitest |
| 日期处理 | Day.js |
| 代码质量 | Husky + Commitlint |

## 项目结构

```
yymusic-frontend/
├── public/                  # 静态资源
├── src/
│   ├── assets/             # 资源文件
│   ├── components/         # 公共组件
│   │   ├── Button/
│   │   ├── Modal/
│   │   └── ...
│   ├── hooks/              # 自定义 Hooks
│   ├── pages/              # 页面组件
│   │   ├── Home/
│   │   ├── Login/
│   │   └── ...
│   ├── services/           # API 服务层
│   │   ├── request.js      # Axios 封装
│   │   ├── user.js         # 用户相关接口
│   │   └── music.js        # 音乐相关接口
│   ├── store/              # Redux 状态管理
│   │   ├── index.js        # Store 配置
│   │   ├── slices/         # Reducer slices
│   │   └── hooks/          # Redux hooks
│   ├── styles/             # 全局样式
│   │   ├── index.css
│   │   └── variables.scss
│   ├── utils/              # 工具函数
│   │   ├── format.js       # 格式化工具
│   │   ├── validate.js     # 校验工具
│   │   └── cache.js        # 缓存工具
│   ├── router/             # 路由配置
│   ├── App.jsx             # 根组件
│   └── main.jsx            # 入口文件
├── tests/                  # 测试文件
├── .eslintrc.cjs           # ESLint 配置
├── .prettierrc.cjs         # Prettier 配置
├── vite.config.js          # Vite 配置
├── commitlint.config.js    # Git 提交规范配置
└── package.json
```

## 快速开始

### 环境要求

- Node.js >= 18.0.0
- npm >= 9.0.0 或 yarn >= 1.22.0 或 pnpm >= 8.0.0

### 安装依赖

```bash
# 使用 npm
npm install

# 使用 yarn
yarn install

# 使用 pnpm (推荐)
pnpm install
```

### 启动开发服务器

```bash
# 开发模式
npm run dev

# 开发模式 (带 API 代理)
npm run dev
```

### 构建生产版本

```bash
# 构建生产版本
npm run build

# 预览生产版本
npm run preview
```

### 代码检查

```bash
# ESLint 检查
npm run lint

# 代码格式化
npm run format
```

### 运行测试

```bash
# 运行测试
npm run test

# 运行测试 (带 UI)
npm run test:ui
```

## 常用命令

| 命令 | 描述 |
|------|------|
| `npm run dev` | 启动开发服务器 |
| `npm run build` | 构建生产版本 |
| `npm run preview` | 预览生产构建 |
| `npm run lint` | ESLint 检查 |
| `npm run format` | 代码格式化 |
| `npm run test` | 运行单元测试 |
| `npm run test:ui` | 运行测试 (带 UI) |

## 代码规范

### 命名规范

- **组件文件**: PascalCase (如 `UserProfile.jsx`)
- **普通文件**: camelCase (如 `formatTime.js`)
- **样式文件**: 与组件同名 (如 `UserProfile.css`)
- **常量**: UPPER_SNAKE_CASE (如 `MAX_FILE_SIZE`)

### 代码风格

- 使用 Prettier 自动格式化
- 使用 ESLint 进行代码检查
- 遵循 React Hooks 规则
- 优先使用函数式组件和 Hooks

### Git 提交规范

```
<type>(<scope>): <subject>

feat: 新功能
fix: Bug 修复
docs: 文档更新
style: 代码格式调整
refactor: 重构
perf: 性能优化
test: 测试相关
build: 构建相关
ci: CI 配置相关
chore: 其他杂项更改
```

**提交示例：**
```bash
feat(user): 添加用户登录功能
fix(player): 修复播放暂停时状态异常
docs: 更新项目 README
```

## API文档

### 基础配置

```javascript
// API 基础地址
VITE_API_BASE_URL = '/api'

// 超时时间
TIMEOUT = 10000
```

### 响应格式

```javascript
{
  code: 200,      // 状态码
  data: {...},    // 数据
  message: 'OK'   // 消息
}
```

## 贡献指南

1. Fork 本仓库
2. 创建特性分支 (`git checkout -b feature/amazing-feature`)
3. 提交更改 (`git commit -m 'feat: add amazing feature'`)
4. 推送到分支 (`git push origin feature/amazing-feature`)
5. 创建 Pull Request

## 许可证

本项目基于 MIT 许可证开源。

---

**Happy Coding! 🎵**
