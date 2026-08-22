# dsh-labnana

[![License](https://img.shields.io/github/license/exoticknight/dsh-labnana)](LICENSE)
[![dsh plugin](https://img.shields.io/badge/dsh%20plugin-v0.2.0-4b32c3)](https://github.com/exoticknight/dsh-labnana)
[![TypeScript](https://img.shields.io/badge/TypeScript-strict-3178c6?logo=typescript&logoColor=white)](https://github.com/exoticknight/dsh-labnana)
[![status](https://img.shields.io/badge/status-active-brightgreen)](https://github.com/exoticknight/dsh-labnana)

DeepSeek Harness (dsh) 插件：集成 [Labnana](https://labnana.com) 图片生成 OpenAPI —— 文生图 / 图生图 / 精准编辑，模型含 **NanoBanana Pro (gemini-3-pro-image)、gemini-3.1-flash-image、GPT-Image-2、Wan2.7 Image/Pro、Seedream 5.0 Pro**。

## 功能

- **生图工具**（会话内直接调用，模型自动使用）：
  - `labnana_generate_image` — 文生图 / 图生图（参考图：远程 URL / 本地文件 / base64）/ Seedream 精准编辑；1K/2K 同步返回，4K 自动走异步任务 + 内部轮询；**默认不落盘**（图片驻留内存，对话卡片直接显示，可点「保存到项目」手动保存），也可 `outputMode=inline` 拿 base64
  - `labnana_estimate_credits` — 预估积分（不扣费）
  - `labnana_get_subscription` — 积分余额 / 免费额度 / 套餐
  - `labnana_get_task` — 按 taskId 查询异步任务（4K / 超时兜底）
- **对话内图片卡片**：生成结果直接在对话流显示（图片网格 + 点击放大 + 「打开文件」+ 未落盘时「保存到项目」按钮）；走官方 `tool.call.toolview` keyed 槽 + `presentationMeta` 回放
- **网页设置**（官方 `ctx.settingsScope` + 凭据域 + i18n，卡片默认收起）：API Key 存**凭据域**（settings 只存引用 `apiKeyEnv`），徽章显示 已配置·凭据域/环境变量/未配置（脱敏预览）+ 打开即自动测试连接显示余额（✓/✗ + 错误码）；「保存图片到磁盘」勾选（默认不勾）；默认模型/尺寸/宽高比/输出目录；界面文案中英跟随系统语言
- **系统提示注入**：模型知道工具用法、模型-积分表、尺寸/比例/参考图限制、免费额度规则、错误码

## 安装

```sh
# GitHub（本仓库）
dsh plugin --profile web add github:exoticknight/dsh-labnana

# 本地源码（插件所在目录）
dsh plugin --profile web add /path/to/dsh-labnana

# 或从 npm（发布后）
# dsh plugin --profile web add dsh-labnana
```

然后**重启 dsh web**。

## 配置 API Key（官方凭据域优先）

1. 设置页：设置 → 插件 → 可配置 → Labnana → 填 API Key → 保存（**密钥写入凭据域 `~/.dsh/.credentials.yaml`，不进入 settings 文件**；settings 只存引用 `apiKeyEnv: LABNANA_API_KEY`）
2. 环境变量：`LABNANA_API_KEY=lh_xxxxx`（dsh 启动前设置；进程环境提供的凭据只读）
3. 直接写 `~/.dsh/.credentials.yaml`：

```yaml
version: 1
refs:
  LABNANA_API_KEY: lh_xxxxx   # 值只存在这里
```

再在 `~/.dsh/settings.yaml` 写明引用：

```yaml
labnana:
  apiKeyEnv: LABNANA_API_KEY   # settings 只携带对机密的引用
  saveToDisk: false            # 默认不保存图片；勾选后自动保存到项目 labnana-images/
  defaultModel: gemini-3-pro-image
  defaultImageSize: 2K
  defaultAspectRatio: 1:1
  outputDir: ""   # 留空 = 当前项目（会话工作区）下的 labnana-images/
```

解析优先链：`apiKeyEnv` 引用（凭据域 > 进程环境）> 默认引用 `LABNANA_API_KEY`（credentials > env）。settings 只认引用，不再接受明文密钥。API Key 在 https://labnana.com/api-keys 创建。

**保存策略**：
- 默认（`saveToDisk: false`）：**不落盘** —— 图片驻留进程内存（零磁盘写入），对话卡片直接显示，点「保存到项目」按钮才写入当前项目 `labnana-images/`
- 勾选「保存图片到磁盘」或传 `saveDir`：按 `saveDir` > 设置 `outputDir` > 当前项目 `<workspace>/labnana-images/`（会话工作区根目录）> 进程 cwd 兜底，自动落盘
- 已保存的图由 `/api/dsh-labnana-images/<file>` 提供（跨会话/跨重启可查，含所有已注册 workspace）；未保存的图重启后失效（内存释放）

## 用法示例（对话）

> 「生成一张 16:9 的电影海报：玻璃材质的未来派耳机漂浮在深色背景中」
> → agent 调用 `labnana_generate_image`，图片直接显示在对话卡片（默认不落盘），需要保留时点「保存到项目」或勾选设置里的「保存图片到磁盘」

> 「把这张图的背景改成内蒙古大草原」＋ 附上图片（或给本地路径）
> → agent 传 `referenceImages: [{ filePath: "..." }]`

> 「用 seedream 把图片左上 (376,363) 到右下 (701,638) 区域改成绿色」
> → 精准编辑：源图进 referenceImages，坐标写进 prompt

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

## 开发（TypeScript + esbuild 构建链，v0.2.0）

```sh
npm install        # devDependencies：esbuild / typescript / 官方类型包
npm run typecheck  # tsc --noEmit（严格模式）
npm run build      # esbuild：
                   #   src/host/index.ts  → lib/index.js   （Node ESM，@deepseek-ai/* external）
                   #   src/client/*.tsx   → lib/client.js  （lazy-CJS factory：window.__ModuleLoader__.load + 注入 require）
```

- `src/host/index.ts` — Host 端（TS）：API 客户端、4 个工具（官方 `defineTool` 类型化 schema/execute）、settings namespace（apiKeyEnv/saveToDisk）、`/api/dsh-labnana-settings/test`、图片服务 + 手动保存端点、系统提示
- `src/client/` — Client 端（TSX）：`entry.ts`（factory 包装入口）+ `index.tsx`（设置卡片：官方 `settingsScope` + `credentials` 域 + i18n `locale` 席位；对话图片卡片：`tool.call.toolview` keyed 槽）
- 依赖：`@deepseek-ai/dsh-tools` / `dsh-settings` / `cordis` / `schemastery` 为 devDependencies（类型 + 构建解析），运行时走安装树唯一实例（peerDependencies）；官方依据：cookbook `adding-a-settings-card.zh.md`、`adding-a-tool.zh.md` + `packages/client/ui-settings/README.zh.md`
- client 产物格式与官方一致（lazy-CJS factory，react/react/jsx-runtime external → 注入 require）

## 路线图（未实现）

- **Labnana Studio 工作台**：`conversation.view` 标签页 —— prompt 编辑器 + 参数面板 + 生成历史画廊
- **快捷入口**：侧边栏浮层 / 输入区 dock 生图 chip（/imagine 式命令体验）
- **任务历史页**：`GET /tasks` 列表接入设置卡片"生成记录"
- **批量生成**：一次调用生成多张对比（需服务端确认）
- **上传中转**：大参考图先传对象存储再走 fileUri（当前 base64 上限 15MB）
- **TUI 适配**：终端 ASCII 预览 + `/labnana` 命令

方案与调研细节见 `docs/PLAN.md`（历史设计稿，已随 v0.2.0 落地归档删除）。
