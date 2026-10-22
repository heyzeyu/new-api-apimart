# new-api-apimart

面向 [new-api](https://github.com/QuantumNous/new-api) 的独立 APIMart 任务插件。显示名称为 **APIMart**，插件标识为 `apimart`。一个 JavaScript 文件即可安装，无需改动网关 Go 路由。

## 导入与安装

在「任务插件 → 插件市场」添加以下索引地址：

```text
https://raw.githubusercontent.com/heyzeyu/new-api-apimart/main/marketplace.json
```

也可以在「上传插件 → 从 URL 导入」粘贴固定版本源码：

```text
https://raw.githubusercontent.com/heyzeyu/new-api-apimart/v0.1.0/plugin.js
```

插件市场索引带有源码 SHA-256，并固定到版本标签。仓库根目录的 `plugin.js` 也可以直接上传。宿主须支持 Task Plugin API v1、usage profiles、`unitLabel`、原生任务路由以及对应的标准图片、视频或 Responses 协议。

安装后新建「任务插件」类型的渠道，选择 `APIMart`，填写 `https://api.apimart.ai` 和自己的 APIMart Key。只添加希望开放的模型及用户分组；安装插件本身不会自动创建渠道、开放全部模型或配置价格。

**仅接视频时**，渠道模型只填写下面五个 Kling 模型，绑定部署者的视频分组即可。图片功能仍保留在插件中，但没有渠道能力授权时不可调用。

## 支持的模型

| 模型名 | 已实现的范围 |
| --- | --- |
| `gpt-image-2`、兼容别名 `gpt-image-2-ext` | 文生图、图生图，1K / 2K / 4K，单次 1 张；不接受未经声明的 `quality` |
| `gpt-image-2-official` | 官方渠道图片接口，low / medium / high / auto，单次 1–4 张 |
| `gpt-image-2.5-flare`、`gpt-image-2.5-sunburst` | low / medium / high / xhigh / max / auto，编辑、蒙版与精确像素尺寸 |
| `gpt-image-2.5-ext` | version=flare / sunburst，1K / 2K / 4K，单次 1–4 张，不接受 `quality` |
| `kling-v2-6` | 文生/图生视频，std / pro，5 或 10 秒；音频和尾帧按模型约束校验 |
| `kling-v3` | std / pro / 4k，3–15 秒，音频、首尾帧与分镜 |
| `kling-3.0-turbo` | 720p / 1080p，3–15 秒，文生视频或首帧参考 |
| `kling-v3-omni` | std / pro / 4k，3–15 秒，图片角色、音频与分镜 |
| `kling-video-o1` | std / pro，5 或 10 秒，图片参考与首尾帧 |

这些是插件的接口实现范围。平台模型列表、账号权限、库存、实际画质与输出尺寸需要各自验证，不能仅凭模型名或参数被接受判断。已对 Image 2、Image 2.5 Flare low、Kling v3 标准 3 秒做过真实生成验证；其余声明模型有本地契约测试，未逐项付费实测。

## 标准视频接口

以下请求使用部署者网关的 Key，不要把上游 APIMart Key 发给客户端。

```bash
curl "$GATEWAY_URL/v1/videos" \
  -H "Authorization: Bearer $GATEWAY_API_KEY" \
  -H 'Content-Type: application/json' \
  -d '{"model":"kling-v3","prompt":"A red ball on a white table. Static camera.","seconds":3,"size":"1280x720","metadata":{"audio":false}}'
```

返回网关任务 ID，通过 `GET /v1/videos/{id}` 查询，完成后使用 `GET /v1/videos/{id}/content` 下载。`metadata` 可以传对应模型的原生参数。常用像素 `size` 会映射为宽高比与 std / pro / 4k 模式；与显式 mode / resolution 冲突时会在提交前报错。

## 图片与异步接口

- `POST /v1/images/generations` 和 `POST /v1/images/edits`：由宿主等待上游异步任务完成，再返回标准图片结果。
- `POST /v1/responses`：支持同步、流式进度及 `background: true`，图片或视频输出通过宿主的结果链接展示。
- `POST /apimart/v1/images/generations`：APIMart 原生异步图片提交。
- `POST /apimart/v1/videos/generations`：APIMart 原生异步视频提交。
- `GET /apimart/v1/tasks/{task_id}`：查询网关持久化的任务状态。

固定时长、模式、图片数量、精确尺寸、分镜总时长等参数会在提交前校验。自定义 `webhook` / `callback_url` 被拒绝，避免绕过网关任务标识与归属检查。转发到另一个 new-api 时，两端均需安装本插件；类型为「New API」的上游自动使用 `/apimart/...` 路径。

## 计费与边界

插件提供用量事实，不内置账号专属价格或折扣。视频按 `seconds`、`mode`、`audio` 或 Turbo 的 `resolution` 配置提供商表达式；普通图片按张数和分辨率；官方与 2.5 模型还提供输入、缓存和输出 token 用量。共享模型应使用 `apimart::<模型名>` 的提供商价格，避免继承其他渠道的计费方案。

提交时预留用量，完成后使用经过校验的上游事实结算。视频的处理耗时不会被当作生成时长。缺少输入/缓存模态明细时，对应 token 事实保留提交预估，不臆造拆分；这类请求的精确成本需要进一步核对。钱包扣费、失败退款和并发结算由宿主负责。

当前限制：

- 官方图片和 2.5 的参考图要求公网 URL，本地参考图需先走 APIMart 上传接口；支持内联的模型可使用 multipart 文件占位符。
- 参考视频编辑尚未接入，以免在没有可靠时长信息时按请求时长错误结算。
- 未声明模型、动作控制、素材管理和原生文件上传不在此版本范围。
- 接入已有 `gpt-image` 自动路由需要宿主另行支持任务插件渠道；安装本插件不会自动加入该路由。
- 图片比例和分辨率标签对应上游尺寸策略，不能保证上游返回任意请求的精确像素。

## 开发与验证

无 Node 依赖，Node.js 22+ 或 Bun：

```bash
npm run check
# 或 bun run check
```

CI 固定到公开 new-api 提交 `206e0fa5c600127a314a97f88592c067f784f4a6`，使用真实 JavaScript 引擎验证插件与内置路由共存，并回放可移植契约用例。测试数据使用合成任务 ID 和媒体地址，不含用户 Key、真实任务凭据或账户账单。

在本地 new-api 源码目录运行宿主校验：

```bash
go run /path/to/new-api-apimart/tools/contract/main.go \
  -plugin /path/to/new-api-apimart/plugin.js \
  -fixture /path/to/new-api-apimart/test/contract-fixture.json
```

更新版本时运行 `npm run marketplace`，将源码与索引提交后创建对应版本标签。索引校验失败会阻止 CI 通过。

## 来源与许可

- [APIMart 官方文档](https://docs.apimart.ai/cn)
- [任务状态接口](https://docs.apimart.ai/cn/api-reference/tasks/status)
- [new-api Task Plugin API v1](https://github.com/QuantumNous/new-api/blob/206e0fa5c600127a314a97f88592c067f784f4a6/docs/plugin-api/v1.md)

AGPL-3.0-only，见 `LICENSE` 与 `NOTICE`。本项目由社区维护，非 APIMart 或可灵官方 SDK；开发由 OpenAI Codex 辅助完成。
