# 模块设计说明书

## 1．模块1：音乐创作模块设计说明

### 1.1 模块描述
该模块负责处理用户的音乐生成请求。由于音乐生成依赖外部 AI 服务（天谌乐），耗时较长且需要扣减用户积分，因此该模块涉及事务控制、外部接口封装以及异步任务状态管理。

### 1.2 功能
- 校验用户输入（提示词、模型参数）
- 计算并扣减用户积分
- 调用第三方 API 提交生成任务
- 批量创建本地音乐记录（状态初始化）
- 加入 Redis 任务队列以便后续轮询状态

### 1.3 性能
无

### 1.4 输入项
prompt (提示词), musicType (歌曲/纯音乐), model (模型ID), lyrics (歌词, 可选)

### 1.5 输出项
成功：返回生成的音乐 ID 列表 (List<String>)
失败：抛出 BusinessException，返回错误信息（如"积分不足"、"服务繁忙"）

### 1.6 设计方法（算法）
本模块在 MusicCreationServiceImpl.createMusic 方法中实现，采用了 事务一致性 和 适配器模式 的设计思想。
1. 参数与权限校验：通过枚举 MusicTypeEnum 和 Redis 缓存的字典 (dictSubList) 校验模型是否存在。
2. 积分预扣减：查询该模型对应的积分消耗值。调用 UserIntegralRecordService 扣减积分，若余额不足直接抛出异常阻断流程。
3. 构建创作参数：如果是"高级模式"，利用反射机制 (PropertyDescriptor) 遍历 MusicSettingDto，将参数拼接到 prompt 中。
4. 外部接口调用：根据模型类型动态获取 API Code。通过 SpringContext.getBean(apiCode) 获取对应的实现类（如 MusicCreateApi4TianpuyueImpl），执行远程调用。
5. 数据持久化：主表 music_creation 插入一条记录。子表 music_info 根据返回的 taskIds 批量插入多条记录，初始状态设为 CREATING (生成中)。
6. 异步任务埋点：若配置了 autoCheckMusic，将任务信息写入 Redis 队列，供后台守护线程轮询检查生成结果。

### 1.7 流程逻辑
#### 1.7.1 音乐创建主流程
（见原文档）

#### 1.7.2 音乐状态转换图
（见原文档）

---

## 2．模块2：账号模块设计说明

### 2.1 模块描述
该模块负责处理用户账号相关的核心业务，包括用户注册、登录、登出、验证码获取、密码修改以及用户信息更新等功能。模块采用Token机制进行身份认证，并通过Redis缓存实现会话管理和验证码存储。

### 2.2 功能
- 获取验证码：生成算术验证码图片，存储到Redis并返回Base64编码
- 用户注册：校验验证码、邮箱唯一性，创建新用户账号
- 用户登录：校验验证码、邮箱密码，生成Token并缓存用户信息
- 获取登录用户信息：根据Token获取用户详细信息
- 用户登出：清除Redis中的Token缓存
- 修改密码：校验旧密码后更新为新密码（MD5加密存储）
- 修改用户信息：更新用户昵称和头像

### 2.3 性能
- 验证码存储于Redis，TTL 5分钟
- Token存储于Redis，TTL 7天
- 头像文件存储于本地文件系统

### 2.4 输入项
- checkCode: 验证码
- checkCodeKey: 验证码Key
- email: 邮箱地址
- password: 密码
- nickName: 昵称
- oldPassword: 旧密码
- newPassword: 新密码
- avatar: 头像文件（MultipartFile）

### 2.5 输出项
成功：返回对应业务数据（TokenUserInfoDto、CheckCodeVO等）或null
失败：抛出BusinessException，返回错误信息（如"图片验证码不正确"、"邮箱账号已经存在"等）

### 2.6 设计方法（算法）
本模块在 AccountController 和 UserInfoServiceImpl 中实现，采用以下设计思想：
1. 验证码生成：使用 ArithmeticCaptcha 生成算术验证码，存储到Redis并绑定唯一Key
2. 用户注册：先检查邮箱是否已存在，再创建用户记录，初始头像使用默认头像复制
3. 用户登录：验证邮箱和密码，生成MD5摘要的Token，缓存到Redis
4. 密码修改：验证旧密码MD5匹配后更新新密码
5. 用户信息更新：处理头像文件上传，更新昵称和头像路径

### 2.7 流程逻辑
#### 2.7.1 用户注册流程
获取验证码 -> 提交注册信息 -> 校验验证码 -> 校验邮箱唯一性 -> 创建用户 -> 返回成功

#### 2.7.2 用户登录流程
获取验证码 -> 提交登录信息 -> 校验验证码 -> 校验邮箱密码 -> 生成Token -> 缓存用户信息 -> 返回Token

---

## 3．模块3：智能体模块设计说明

### 3.1 模块描述
该模块负责处理AI智能体相关的业务，提供文生文智能对话、文本润色、歌词生成等功能。模块支持两种类型的智能体：
1. 流式对话智能体（BitAgent）：基于外部AI服务，支持流式输出
2. 知识库问答智能体（MusicAgent）：基于Spring AI框架，集成了RAG知识库检索能力

### 3.2 功能
- 智能文本处理：接收用户文本，根据类型调用对应的AI服务进行处理，流式返回结果
- 智能对话：基于知识库的AI客服对话，支持普通模式和流式模式
- 工具调用：集成音乐生成工具、音乐查询工具、套餐查询工具、用户音乐查询工具

### 3.3 性能
- 流式输出：支持Server-Sent Events（SSE）流式返回
- 知识库检索：基于Vector Store进行向量相似度检索
- RAG增强：集成QuestionAnswerAdvisor进行知识库问答

### 3.4 输入项
- type: 智能体类型（如歌词生成、文本润色）
- text: 用户输入的文本
- message: 对话消息

### 3.5 输出项
成功：返回AI处理结果（字符串或流）
失败：抛出BusinessException，返回错误信息

### 3.6 设计方法（算法）
本模块在 AgentController、MusicAgentController 和 BitAgentService 实现类中实现，采用以下设计思想：
1. 动态路由：根据type参数从AgentTypeEnum获取对应的Bean名称，通过SpringContext动态获取实现类
2. 流式处理：使用OutputStream进行流式输出，实现实时AI响应
3. 知识库集成：使用Spring AI的Vector Store进行向量存储和检索
4. RAG架构：集成QuestionAnswerAdvisor实现知识库增强问答
5. 工具集成：配置generateMusicTool、queryMusicTool等函数工具供AI调用

### 3.7 流程逻辑
#### 3.7.1 文本处理流程
提交文本 -> 获取智能体类型 -> 创建会话 -> 流式调用AI服务 -> 流式返回结果

#### 3.7.2 知识库问答流程
提交消息 -> 携带用户ID上下文 -> 调用ChatClient -> RAG检索知识库 -> 返回回答

---

## 4．模块4：文件模块设计说明

### 4.1 模块描述
该模块负责处理系统文件资源的存储和管理。采用策略模式设计，通过配置化方式支持多种存储后端：
1. 本地磁盘存储（LocalFileServiceImpl）：适用于单机部署场景
2. MinIO对象存储（MinioFileServiceImpl）：适用于分布式部署，支持S3兼容协议
3. 远程FTP存储（RemoteFileServiceImpl）：适用于已有FTP/SFTP服务器的场景

同时提供文件读取服务，支持图片、音频等资源的HTTP访问，并实现了断点续传功能。

### 4.2 功能
#### 4.2.1 文件存储服务（FileService）
- 文件上传：支持MultipartFile和InputStream两种方式上传
- 文件下载：从远程URL下载文件到存储后端
- 文件删除：删除指定路径的文件
- 存储后端切换：通过oss.type配置切换存储方式

#### 4.2.2 文件读取服务（FileController）
- 文件资源获取：根据文件路径获取服务器上的文件资源
- 路径安全校验：防止目录遍历攻击
- 断点续传支持：支持HTTP Range请求，实现大文件分段下载
- 缓存控制：图片类型资源设置30天缓存头
- MIME类型处理：根据文件后缀设置正确的Content-Type

### 4.3 性能
- 存储性能：本地磁盘 > MinIO > FTP（本地磁盘最快，FTP最慢）
- 图片资源：设置30天浏览器缓存（Cache-Control: max-age=2592000）
- 断点续传：减少重复下载，提升大文件传输效率

### 4.4 输入项
#### 4.4.1 文件存储
- file: MultipartFile文件对象
- folderName: 文件夹名称（如avatar、product）
- fileName: 指定文件名（可选，默认自动生成UUID）
- inputStream: 输入流（用于流式上传）
- originalFilename: 原始文件名
- contentType: 文件ContentType

#### 4.4.2 文件读取
- filePath: 文件路径（相对路径）
- range: HTTP Range请求头（可选）

### 4.5 输出项
#### 4.5.1 文件存储
成功：返回FileInfo对象（包含name原文件名、url访问URL）
失败：抛出RuntimeException

#### 4.5.2 文件读取
成功：返回文件内容（字节流）
失败：返回404或416状态码

### 4.6 设计方法（算法）
本模块采用策略模式和适配器模式设计，主要包含以下组件：

#### 4.6.1 FileService接口
定义统一的文件操作接口：
- uploadFile(MultipartFile, folderName, fileName)
- uploadFile(InputStream, folderName, fileName, originalFilename, contentType)
- downloadFile(URL, folderName, fileName, suffix)
- deleteFile(String filePath)

#### 4.6.2 本地磁盘存储（LocalFileServiceImpl）
配置项：oss.local.storagePath、oss.local.domain
- 使用Spring @ConditionalOnProperty根据配置加载
- 文件存储在本地文件系统
- 通过domain配置访问域名

#### 4.6.3 MinIO对象存储（MinioFileServiceImpl）
配置项：oss.minio.endpoint、accessKey、secretKey、bucketName、customDomain
- 使用MinIO Java SDK操作S3兼容存储
- 自动创建Bucket并设置公共读策略
- 支持自定义域名或MinIO内置URL
- 支持任意S3兼容对象存储（如MinIO、阿里云OSS、AWS S3）

#### 4.6.4 远程FTP存储（RemoteFileServiceImpl）
配置项：oss.remote.ftpHost、ftpPort、ftpUsername、ftpPassword、storagePath
- 使用Apache Commons Net FTPClient
- 支持被动模式传输
- 自动创建远程目录

#### 4.6.5 文件读取（FileController）
- 路径安全校验：使用 StringTools.pathIsOK() 校验路径合法性
- 缓存策略：图片类型设置长期缓存
- 断点续传：解析Range请求头，使用RandomAccessFile随机访问

### 4.7 流程逻辑
#### 4.7.1 文件存储流程
选择存储方式 -> 校验参数 -> 生成文件名 -> 执行上传 -> 返回文件URL

#### 4.7.2 存储后端选择
通过application.yml配置：
```yaml
oss:
  type: local  # 或 minio、remote
  local:
    storagePath: /path/to/storage
    domain: http://localhost:8080
  minio:
    endpoint: http://localhost:9000
    accessKey: minioadmin
    secretKey: minioadmin
    bucketName: yymusic
    customDomain: http://cdn.yymusic.com
  remote:
    ftpHost: ftp.yymusic.com
    ftpPort: 21
    ftpUsername: xxx
    ftpPassword: xxx
    storagePath: /var/ftp/yymusic
```

#### 4.7.3 文件读取流程
接收请求 -> 校验路径安全 -> 拼接文件路径 -> 检查文件存在性 -> 设置响应头 -> 读取文件返回

#### 4.7.4 断点续传流程
检测Range头 -> 解析起始结束位置 -> 校验范围有效性 -> 设置206状态 -> 返回指定区间数据

---

## 5．模块5：用户模块设计说明

### 5.1 模块描述
该模块负责处理用户信息查询和用户音乐管理的业务。提供获取用户详细信息、用户音乐统计、用户音乐列表分页查询等功能。

### 5.2 功能
- 获取用户信息：返回用户基本信息（昵称、头像、邮箱等）及统计数据
- 获取用户音乐列表：分页查询用户创建的音乐记录
- 音乐统计：统计用户创建的音乐数量和点赞数量

### 5.3 性能
- 分页查询：支持分页加载，默认页面大小15
- 关联查询：关联查询音乐信息和点赞信息

### 5.4 输入项
- userId: 用户ID
- pageNo: 页码

### 5.5 输出项
成功：返回用户信息（UserInfoVO含音乐数、点赞数）或分页音乐列表
失败：抛出BusinessException，返回错误信息

### 5.6 设计方法（算法）
本模块在 UserController 和 UserInfoServiceImpl、MusicInfoServiceImpl 中实现，采用以下设计思想：
1. 用户信息查询：根据userId查询用户基本信息
2. 统计数据聚合：分别查询音乐数量和点赞数量，填充到VO对象
3. 分页查询：使用MyBatis PageHelper或手写分页逻辑
4. 状态过滤：只查询状态为CREATED（已创建成功）的音乐记录
5. 排序：按创建时间倒序排列

### 5.7 流程逻辑
#### 5.7.1 获取用户信息流程
接收userId -> 查询用户基本信息 -> 查询音乐数量 -> 查询点赞数量 -> 组装VO -> 返回

#### 5.7.2 获取用户音乐列表流程
接收userId和pageNo -> 构建查询条件 -> 分页查询音乐列表 -> 返回分页结果
