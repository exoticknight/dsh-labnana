# dsh-labnana

<p align="center">
  <img src="images/logo.webp" width="200" alt="dsh-labnana logo" />
</p>

[![License](https://img.shields.io/github/license/exoticknight/dsh-labnana)](LICENSE)
[![dsh plugin](https://img.shields.io/badge/dsh%20plugin-v0.2.0-4b32c3)](https://github.com/exoticknight/dsh-labnana)
[![CI](https://img.shields.io/github/actions/workflow/status/exoticknight/dsh-labnana/ci.yml?branch=main)](https://github.com/exoticknight/dsh-labnana/actions)
[![TypeScript](https://img.shields.io/badge/TypeScript-strict-3178c6?logo=typescript&logoColor=white)](https://github.com/exoticknight/dsh-labnana)
[![status](https://img.shields.io/badge/status-active-brightgreen)](https://github.com/exoticknight/dsh-labnana)

DeepSeek Harness (dsh) 插件：在会话里直接生成图片 —— 集成 [Labnana](https://labnana.com) 图片生成 OpenAPI，文生图 / 图生图 / 精准编辑，生成结果直接在对话流显示，可一键保存到当前项目。

支持模型：**NanoBanana Pro（gemini-3-pro-image）、gemini-3.1-flash-image、GPT-Image-2、Wan2.7 Image/Pro、Seedream 5.0 Pro**（积分见[模型与积分](#模型与积分1k--2k--4k)）。

---

## 快速开始

```sh
# 1. 安装插件（GitHub 或本地源码）
dsh plugin --profile web add github:exoticknight/dsh-labnana
# dsh plugin --profile web add /path/to/dsh-labnana

# 2. 重启 dsh web
```

**3. 配置 API Key**（Key 在 https://labnana.com/api-keys 创建）：

打开 **设置 → 插件 → 可配置 → Labnana**，填入 API Key 并保存 —— 密钥写入凭据域 `~/.dsh/.credentials.yaml`，设置文件只存引用，界面只显示脱敏预览。

**4. 在对话里说：**

> 生成一张 16:9 的电影海报：玻璃材质的未来派耳机漂浮在深色背景中

图片会直接显示在对话流（默认不落盘），点卡片上的「保存到项目」即可写入当前项目 `labnana-images/`。

---

## 特性

- **4 个工具**（模型自动调用）：
  | 工具 | 作用 |
  |---|---|
  | `labnana_generate_image` | 文生图 / 图生图（参考图：远程 URL / 本地文件 / base64）/ Seedream 精准编辑；1K/2K 同步，4K 自动异步任务 + 轮询 |
  | `labnana_estimate_credits` | 预估积分（不扣费） |
  | `labnana_get_subscription` | 积分余额 / 免费额度 / 套餐 |
  | `labnana_get_task` | 按 taskId 查询异步任务（4K / 超时兜底） |
- **对话内图片卡片**：生成结果直接显示（网格 + 点击放大 + 「打开文件」+ 未落盘时「保存到项目」按钮），历史会话回放同样可见
- **网页设置**：官方 `settingsScope` 读写、凭据域存 Key、打开自动测试连接显示余额、默认模型/尺寸/比例/输出目录、「保存图片到磁盘」开关；文案中英跟随系统语言
- **系统提示注入**：模型知道工具用法、模型-积分表、尺寸/比例/参考图限制、免费额度规则、错误码与重试建议

## 配置

### API Key（凭据域）

三种方式，任选其一：

1. **设置页**：设置 → 插件 → 可配置 → Labnana → 填 Key → 保存
2. **环境变量**：`LABNANA_API_KEY=lh_xxxxx`（dsh 启动前设置；进程环境提供的凭据只读）
3. **直接写文件**：

```yaml
# ~/.dsh/.credentials.yaml —— 值只存在这里
version: 1
refs:
  LABNANA_API_KEY: lh_xxxxx
```

```yaml
# ~/.dsh/settings.yaml —— settings 只携带对机密的引用
labnana:
  apiKeyEnv: LABNANA_API_KEY
  saveToDisk: false            # 默认不保存图片；勾选后自动保存
  defaultModel: gemini-3-pro-image
  defaultImageSize: 2K
  defaultAspectRatio: 1:1
  outputDir: ""                # 留空 = 当前项目 labnana-images/
```

解析优先链：`apiKeyEnv` 引用（凭据域 > 进程环境）→ 默认引用 `LABNANA_API_KEY`（credentials > env）。

### 保存策略

| 场景 | 行为 |
|---|---|
| 默认（`saveToDisk: false`） | **不落盘**：图片驻留进程内存（零磁盘写入），对话卡片直接显示，「保存到项目」按钮才写入当前项目 `labnana-images/`；未保存的图重启后失效 |
| 勾选「保存图片到磁盘」或传 `saveDir` | 自动落盘，按 `saveDir` > 设置 `outputDir` > 当前项目 `<workspace>/labnana-images/` > 进程 cwd 兜底 |
| 已保存的图 | 由 `/api/dsh-labnana-images/<file>` 提供，跨会话/跨重启可查（含所有已注册 workspace） |

## 使用示例（对话）

> 「把这张图的背景改成内蒙古大草原」＋ 附上图片（或给本地路径）
> → 传 `referenceImages: [{ filePath: "..." }]`

> 「用 seedream 把图片左上 (376,363) 到右下 (701,638) 区域改成绿色」
> → 精准编辑：源图进 referenceImages，坐标写进 prompt

> 「换个赛博朋克风格再生成一次」
> → 基于上一张图迭代（images[].path 作为参考图）

## 模型与积分（1K / 2K / 4K）

| model | provider | 积分 | 参考图上限 | 4K |
|---|---|---|---|---|
| gemini-3-pro-image | google | 15 / 15 / 30 | 14 | ✅ |
| gemini-3.1-flash-image | google | 10 / 10 / 20 | 14 | ✅ |
| gpt-image-2 | openai | 4 / 6 / 10 | 4 | ✅ |
| wan2.7-image-pro | alibaba | 6 / 8 / 12 | 9 | 仅文生图 |
| wan2.7-image | alibaba | 4 / 6 / – | 9 | ❌ |
| seedream-5-0-pro | bytedance | 6 / 15 / – | 10 | ❌ |

免费额度：gemini-3-pro-image 的 1K/2K 可通过注册/邀请/签到领取（FREE_USAGE），优先消耗、不扣积分；4K 始终扣积分。

## 错误码

| code | 含义 | 处理 |
|---|---|---|
| 21007 | API Key 无效 | 检查配置 |
| 26004 | 积分不足 | 查余额 / 升级 |
| 29003 | 参数错误 | 核对模型限制 |
| 29998 | 限流 | 等待 20-30s 重试 |

---

## 开发者 / AI 参考（Developer / AI reference）

TypeScript + esbuild 构建链，无运行时编译依赖。

### 项目结构

```
dsh-labnana/
├── src/
│   ├── host/index.ts        # Host 端：API 客户端、4 个工具、settings namespace、HTTP 端点、系统提示
│   └── client/
│       ├── entry.ts         # client bundle 入口（lazy-CJS factory 包装）
│       └── index.tsx        # 设置卡片 + 对话图片卡片 + i18n 字典
├── scripts/build.mjs        # esbuild 构建脚本（host ESM + client factory bundle）
├── lib/                     # 构建产物（git 忽略，发布走 package.json files 白名单）
├── cordis.patch.yml         # dsh bundle patch（默认配置）
└── tsconfig.json            # strict 模式
```

### 构建与检查

```sh
npm install        # devDependencies：esbuild / typescript / 官方类型包（dsh-tools、dsh-settings、cordis、schemastery）
npm run typecheck  # tsc --noEmit（strict）
npm run build      # esbuild：
                   #   src/host/index.ts → lib/index.js    （Node ESM，@deepseek-ai/* external，走安装树唯一实例）
                   #   src/client/*.tsx  → lib/client.js   （lazy-CJS factory：window.__ModuleLoader__.load + 注入 require）
```

### 架构：dsh 插件双半侧

- **Host**（Node）：标准 cordis 插件 `export { name, inject, Config, apply }`；工具用官方 `defineTool`（类型化 schema + `execute` + `presentationMeta`）；settings 用 `installSettingsSection`；HTTP 端点用 `ctx.webServer`（loopback 保护）
- **Client**（浏览器）：`dsh.client` 声明 + `exports["./client"]` → dsh-client-modules 服务 `/plugins/<id>/client.js`；产物必须是 lazy-CJS factory（react / react/jsx-runtime 走注入 require）
- **官方扩展点使用清单**：`ctx.settingsScope`（设置读写，revision 栅）· `api.credentials`（密钥读写，`credentials/reference-updated` 事件）· `ctx.locale`（i18n 字典 + slot `locale` 席位）· `tool.call.toolview` keyed 槽（对话图片卡片）· `exec.agent.session.header.cwd`（保存目录基准）· `workspaceRegistry`（图片服务跨 workspace 查找）

### 工具定义（模型视角）

- `labnana_generate_image`：`prompt`（必填）+ `model` / `imageSize` / `aspectRatio` / `referenceImages` / `outputMode` / `saveDir` / `async` / `waitSeconds`；返回 `{ ok, saved, images: [{url, path?, mimeType, size}], model, imageSize, aspectRatio, taskId? }`
- `labnana_estimate_credits`：`prompt`（必填）+ `model` / `imageSize` / `aspectRatio`；返回 `{ ok, credits, canGenerate, requiresSubscription, warnings? }`
- `labnana_get_subscription`：无参数；返回余额/免费额度/套餐
- `labnana_get_task`：`taskId`（必填）；返回任务状态与图片 URL

## License

[Apache-2.0](LICENSE)
