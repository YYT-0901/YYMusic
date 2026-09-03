
[封面图](yymusic-backend/img/1.png)

# YYMusic

一个音乐管理与展示平台，包含后端服务、前端管理与展示界面，以及音乐生成功能组件。
生成式人工智能也就是AIGC技术发展很快，它在音乐内容创作这块已经展现出很大的应用潜力，不光能降低普通人的创作门槛，还能提高内容生产的效率，但是，现在已有的AIGC音乐平台大多存在不少问题：创作流程不连贯，缺少面向普通用户的智能辅助创作功能，比如提示词优化、歌词生成都做不到，另外积分消费、订单支付这些商业化闭环也不够完整。针对这些问题，本文设计并做出了一个由AIGC驱动的、包含音乐生成和商业化功能的Web平台，目的是给用户搭建出一套覆盖AI创作、作品管理还有积分支付的一站式服务体系。

## 项目简介

本仓库是 YYMusic 的代码集合，包含：
- `yymusic-backend`：后端（Spring Boot + Maven）源码与 SQL 数据库脚本。
- `yymusic-frontend`：前端项目，包含管理后台和对外网站（基于 Vite + React）。
- `music-gen-server`：音乐生成相关的说明与辅助脚本（ComfyUI 相关文档）。

## 仓库结构（概要）

- `yymusic-backend/`：后端多模块工程（`yymusic-admin`、`yymusic-web`、`yymusic-common` 等），以及数据库脚本 `yymusic.sql`、文件存储目录 `file/` 和日志目录 `logs/`。
- `yymusic-frontend/`：前端源码，包含 `yymusic-frontend-admin`（管理端）和 `yymusic-frontend-web`（用户端）。
- `music-gen-server/`：ComfyUI 与音乐生成的文档和说明。

## 快速开始

先决条件：

- JDK 11 或更高版本
- Maven 3.6+
- Node.js 16+ 和 npm/yarn
- MySQL 5.7+ 或兼容的数据库

1. 导入数据库（示例）

```bash
mysql -u root -p < yymusic-backend/yymusic.sql
```

2. 构建并启动后端

在仓库根目录或 `yymusic-backend` 目录下执行：

```bash
cd yymusic-backend
mvn clean package -DskipTests
# 启动 Admin 服务（示例 jar 名称可能根据版本而变）
java -jar yymusic-admin/target/yymusic-admin-1.0.0.jar
# 启动 Web 服务
java -jar yymusic-web/target/yymusic-web-1.0.0.jar
```

3. 启动前端（开发模式）

管理后台：

```bash
cd yymusic-frontend/yymusic-frontend-admin
npm install
npm run dev
```

网站前端：

```bash
cd yymusic-frontend/yymusic-frontend-web
npm install
npm run dev
```

## 配置说明

- 数据库连接等配置请在后端项目的 `application.yml` / `application.properties` 中设置（或使用环境变量覆盖）。
- 文件存储目录：`yymusic-backend/file/`（可在配置中更改）。
- 日志目录：`yymusic-backend/logs/`。

常见配置项（示例）：

- `spring.datasource.url`、`spring.datasource.username`、`spring.datasource.password`
- `file.storage.path`（自定义）

## 开发与贡献

- 需要新增功能或修复 bug，请在本地创建分支，完成后发起 Pull Request。
- 保持提交信息简洁明确，必要时附上复现步骤与截图/日志。

## 目录与文件说明

- `yymusic-backend/yymusic.sql`：数据库初始化脚本。
- `yymusic-backend/file/`：默认存储上传文件的目录（可包含子目录按日期组织）。
- `yymusic-backend/logs/`：运行日志（滚动保留历史）。

## 联系与授权

如需联系项目维护者或了解更多部署细节，请在仓库中打开 Issue 或联系负责人。

许可证：请根据实际项目情况添加 LICENSE 文件并在此处说明。

