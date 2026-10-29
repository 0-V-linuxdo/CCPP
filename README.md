# CC++

claude.ai 的插件化用户脚本：**一切皆插件**。内核只负责插件注册、依赖解析、生命周期与设置存储；网络钩子、路由、DOM 观察、样式注入、设置面板本身也都是插件。

[安装 / 更新](https://raw.githubusercontent.com/0-V-linuxdo/CCPP/main/userscript/CCPP.user.js)（Tampermonkey / Violentmonkey / ScriptCat 等；桌面版见下文 AdGuard 用法）

打开设置：头像菜单里的「CC++ 设置」、脚本管理器菜单，或快捷键 `⌘/Ctrl + Shift + .`。

界面语言跟随 claude.ai 自身的语言设置（不是浏览器语言）：claude.ai 为中文时显示中文，其余一律英文；也可在 CC++ 设置里手动指定。

## 桌面版（配合 AdGuard）

Claude 桌面版（macOS / Windows）装不了浏览器扩展，可以借 AdGuard 桌面版的「用户脚本」功能注入 CC++：

1. AdGuard →「扩展」（用户脚本）→ 添加，填入上面的安装链接。
2. AdGuard →「过滤的应用」里加入 Claude 桌面版并开启过滤；「HTTPS 过滤」要打开，否则脚本注入不进 claude.ai。
   想在 Helium 等 Chromium 系浏览器里也走 AdGuard 注入，同样把浏览器加进去（Helium 还要连同 Helium Helper 一起加）。
3. **完全退出**后重新打开 Claude（关窗口不够，要从菜单栏 / 托盘退出），头像菜单里出现「CC++ 设置」即生效。

> [!IMPORTANT]
> **必须保留原始 User-Agent。** AdGuard「隐身模式」里的「隐藏 User-Agent」会把 UA 里的 `Claude/x.y` 去掉，claude.ai 于是把桌面版当成网页版渲染，左上角红绿灯按钮会压住标题栏、布局错乱。请关闭这一项，或在隐身模式里把 claude.ai / Claude 桌面版设为例外。

AdGuard 不支持 `GM_registerMenuCommand`，所以没有脚本管理器菜单；设置入口仍在头像菜单的「CC++ 设置」，快捷键照常可用。脚本更新后同样要完全重启 Claude 才会生效。

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
| 标签页图标状态 ChatFavicon | 开 | 标签页图标随对话状态变色：回复中蓝、完成绿、草稿待发送黄、出错红；5 种样式可选；Claude Code 项目页跟随项目主对话和所有线程（任一在跑蓝、等你回复黄） |
| 侧栏默认 Code SidebarDefaultCode | 开 | 打开首页时侧栏 Chat / Code 切换自动停在 Code，每次加载只切一次，打开具体对话时不切；可选只在 claude.ai/code 开头的页面切换 |
| 最近对话切换 RecentChats | 开 | Ctrl+` 弹出最近对话卡片 |
| 导出对话 ExportChat | 开 | 标题栏导出 Markdown / TXT / JSON，或复制为 Markdown |
| 界面清理 Cleaner | 开 | 隐藏升级推销、Claude Code 推广提示等 |
| 加宽对话 WiderChat | 关 | 调整对话与输入框最大宽度 |
| 输入框外观 ComposerLook | 关 | 输入框背景不透明度 / 毛玻璃 / 圆角 |
| 自定义问候语 CustomGreeting | 关 | 替换首页问候语（新版首页没有官方文字标记时靠 Claude 星标定位），多条轮换；不改输入框 |
| 消息时间 MessageTimestamps | 关 | 回复时间常显并显示具体时间 |
| 折叠长代码 CollapseCode | 关 | 长代码块折叠，按钮展开 |
| 裸域名可点击 BetterLinks | 关 | 回复里的 example.com 变成链接 |
| 隐藏分享按钮 NoShareLink | 关 | 隐藏对话右上角「分享」 |
| 隐藏语音按钮 NoDictation | 关 | 隐藏听写 / 语音模式按钮 |
| 直播模式 StreamerMode | 关 | 模糊名字、头像、侧栏标题 |
| 隐藏邮箱 / 用户名 HideIdentity | 开 | 隐藏头像弹出的账号菜单里的邮箱，可选隐藏用户名 |
| 自定义头像与用户名 CustomIdentity | 关 | 替换侧栏和账号菜单里的头像与显示名，头像可粘贴 / 拖入 / 裁切，可调侧栏头像大小 |
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
