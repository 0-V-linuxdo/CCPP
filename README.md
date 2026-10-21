# CC++

claude.ai 的插件化用户脚本：**一切皆插件**。内核只负责插件注册、依赖解析、生命周期与设置存储；网络钩子、路由、DOM 观察、样式注入、设置面板本身也都是插件。

[安装 / 更新](https://raw.githubusercontent.com/0-V-linuxdo/CCPP/main/userscript/CCPP.user.js)（Tampermonkey / Violentmonkey / ScriptCat 等）

打开设置：头像菜单里的「CC++ 设置」、脚本管理器菜单，或快捷键 `⌘/Ctrl + Shift + .`。

界面语言跟随 claude.ai 自身的语言设置（不是浏览器语言）：claude.ai 为中文时显示中文，其余一律英文；也可在 CC++ 设置里手动指定。

## 功能插件

| 插件 | 默认 | 作用 |
| --- | --- | --- |
| 用量显示 UsageDisplay | 开 | 输入框模型选择器旁显示 5 小时会话 / 每周用量双圆环，点开看重置时间 |
| 对话目录 ChatNavigator | 开 | 对话右侧刻度目录，悬停列出全部提问与回复（含长对话未渲染部分），点击跳转，Alt+↑/↓ 逐条 |
| 消息收藏 MessageStars | 开 | 操作栏 ☆ 收藏任意消息；标题栏列表跳回原处，跨对话汇总 |
| 项目运行状态 ProjectStatus | 开 | 侧栏所有 Claude Code 项目都显示运行中的呼吸点（官方只给当前选中项目显示），等你回复的显示黄点 |
| 输入历史 InputHistory | 开 | ↑/↓ 调出发送过的提问，Esc 恢复草稿；点输入框上方的计数浏览历史 |
| 提示词预设 PromptPresets | 关 | 输入框旁一键插入常用提示词 |
| 回复完成提醒 ReplyNotification | 开 | 后台回复完成时提示音 / 系统通知 / 页面提示条 |
| 标签页状态 TabStatus | 开 | 标题前缀 ⏳ 回复中、✅ 后台已完成 |
| 侧栏默认 Code SidebarDefaultCode | 开 | 打开首页时侧栏 Chat / Code 切换自动停在 Code，每次加载只切一次，打开具体对话时不切；可选只在 claude.ai/code 开头的页面切换 |
| 最近对话切换 RecentChats | 开 | Ctrl+` 弹出最近对话卡片 |
| 导出对话 ExportChat | 开 | 标题栏导出 Markdown / TXT / JSON，或复制为 Markdown |
| 界面清理 Cleaner | 开 | 隐藏升级推销、Claude Code 推广提示等 |
| 加宽对话 WiderChat | 关 | 调整对话与输入框最大宽度 |
| 输入框外观 ComposerLook | 关 | 输入框背景不透明度 / 毛玻璃 / 圆角 |
| 自定义问候语 CustomGreeting | 关 | 替换首页问候语，多条轮换；可改占位文字 |
| 消息时间 MessageTimestamps | 关 | 回复时间常显并显示具体时间 |
| 折叠长代码 CollapseCode | 关 | 长代码块折叠，按钮展开 |
| 裸域名可点击 BetterLinks | 关 | 回复里的 example.com 变成链接 |
| 隐藏分享按钮 NoShareLink | 关 | 隐藏对话右上角「分享」 |
| 隐藏语音按钮 NoDictation | 关 | 隐藏听写 / 语音模式按钮 |
| 直播模式 StreamerMode | 关 | 模糊名字、头像、侧栏标题 |
| 屏蔽遥测 NoTelemetry | 关 | 拦截分析 / 错误上报请求 |
| 控制台清净 ConsoleJanitor | 关 | 静音控制台噪音 |

核心插件：设置面板 Settings（分类 / 搜索 / 收藏 / 置顶 / 选项）、自定义 CSS QuickCss、备份与关于 Backup。
API 插件（被依赖时自动开启，设置里可显示）：DomApi、StylesApi、RouterApi、NetworkApi、ClaudeApi、ChatStateApi、NoticesApi、SlotsApi、ComposerApi、TranscriptApi、HotkeysApi、MenuApi。

## 隐私

- 只调用 claude.ai 同源接口（用量、对话内容、Claude Code 项目时间线），沿用浏览器登录态；不读取、不保存、不外传 Cookie 或 token。
- 不连接任何第三方服务器；设置与数据只存在 claude.ai 的 localStorage（`ccpp:` 前缀），可在「备份与关于」里导出 / 清空。

## 开发

```sh
bun install
bun run check   # tsc + 单元测试 + 构建
bun run build   # 生成 userscript/CCPP.user.js
```

- `src/kernel/`：插件注册与依赖、生命周期（Scope 自动清理）、设置存储、事件总线、i18n
- `src/plugins/_api/`：API 插件；`src/plugins/_core/`：核心插件；其余每个目录一个功能插件
- claude.ai 页面结构的选择器集中在 `src/plugins/_api/dom/selectors.ts`
- 功能规格与验收记录见 `docs/`

## 净室说明

CC++ 参照 void++（grok.com 的插件化脚本，GPL-3.0）的**功能与行为**写成规格（`docs/01-功能规格.md`），再针对 claude.ai 独立实现，未复制 void++ 代码。

## 许可

MIT
