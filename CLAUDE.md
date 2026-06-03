# TokenTone — 项目核心共识

## 这个项目是什么

TokenTone 是一个 Claude Code 插件，在你 vibe coding 的过程中提供实时环境音乐。
它通过 Claude Code 的 hook 系统感知 session 的情感节奏，用算法驱动的状态机生成动态音效。

---

## 核心设计哲学

**Vibe coding 需要有 vibe。**

音乐的作用不是"同步 token 输出"，而是**放大整个 coding session 的节奏感**。
就像电影配乐不是 frame-by-frame 同步画面，而是在正确的情感时刻响起正确的音符。

### 三个基本原则

1. **音乐跟随情感节奏，不跟随 token**
   - 逐 token 触发（20-50次/秒）会产生噪音，不是音乐
   - 我们感知的是 session 的"阶段"（期待 → 活跃 → 高潮 → 解决）
   - 音乐在这个弧线上呼吸，而不是机械对应每个字符

2. **零 LLM 调用，零 token 消耗**
   - 整个系统纯算法驱动：状态计数 + 事件类型 + 时间 → 选音符
   - 不需要任何语义理解，就像鼓手不需要看懂乐谱才能感受节拍
   - 所有逻辑本地运行，无网络请求

3. **轻便是第一优先级**
   - 无常驻 daemon、无后台进程：每个 hook 是一次性短命进程，播完音就退出
   - 状态用 JSON 文件传递（几十字节）
   - 每个 hook 脚本 < 20ms
   - 用户安装后什么都不需要管

---

## 情感弧线状态机

每个事件落到一个阶段，每个阶段对应主题里**固定指定**的一个系统声音（见下方音频系统）。
音符在下一个 BPM 节拍上播放（scheduler 量化），播完即退出——没有后台节拍器。

```
事件                    状态          播放的声音
────────────────────────────────────────────────
UserPromptSubmit  →   start         theme.sounds.submit
PostToolUse #1-2  →   active        theme.sounds.active
PostToolUse #3+   →   intense       theme.sounds.intense
Stop              →   resolving     theme.sounds.resolving
距上次事件 >60s   →   idle          视为新 session，callCount 重置
```

---

## 系统架构

```
Claude Code
  │
  ├─ UserPromptSubmit hook
  │       └── hook.js：phase=start，callCount 归零，播 submit 音
  │                    （并清理旧版本可能残留的 watcher 进程）
  │
  ├─ PostToolUse hook
  │       └── hook.js：callCount++，active(#1-2) / intense(#3+)，播对应音
  │
  ├─ Stop hook
  │       └── hook.js：phase=resolving，播收尾音
  │
  └─ statusline（每 ~300ms）
          └── statusline.js：显示 ♪ lofi │ vol:70% │ ●，轻量无音频
```

每个 hook 都是同一个 `hook.js`：读 stdin 里的事件 → 推进状态机 → 在下一个节拍播一个音 → 退出。
没有 watcher、没有后台进程。

### 关键文件

| 文件 | 职责 |
|------|------|
| `src/hook.ts` | Hook 入口:状态转移 + 在下一拍播放对应阶段的音 |
| `src/statusline.ts` | 状态栏显示，纯显示，无音频 |
| `src/state.ts` | 运行时状态读写（~/.claude/plugins/tokentone/state.json） |
| `src/config.ts` | 用户配置读写（~/.claude/plugins/tokentone/config.json） |
| `src/audio/sampler.ts` | `playSystemSound()`：用 afplay 播放 macOS 系统声音 |
| `src/audio/scheduler.ts` | BPM 节拍量化，让音符对齐节拍而非机械触发 |

### 进程通信方式

- **状态传递**：`state.json`（phase、callCount、lastEventAt、sessionStartedAt、lastNoteAt）
- **用户配置**：`config.json`（theme、volume、enabled、triggers）

> 注：`hook.ts` 仍保留 `killOldWatcher()`，仅用于在升级后清理旧版本残留的
> watcher 进程（读 `watcher.pid`、写 `watcher.signal`）。当前架构本身不再使用 watcher。

---

## 音频系统

### 三个主题（macOS 系统声音）

每个主题为四个阶段各指定一个 macOS 系统声音 + 一个音量系数，定义在 `src/themes/*.ts` 的 `sounds` 字段里。
不再有"音符池 + 随机选"——事件到声音是固定一对一映射。

| 主题 | BPM | submit | active | intense | resolving |
|------|-----|--------|--------|---------|-----------|
| lofi | 80 | Tink (0.50) | Bottle (0.45) | Ping (0.55) | Glass (0.62) |
| ambient | 65 | Glass (0.42) | Submarine (0.35) | Glass (0.50) | Submarine (0.58) |
| synthwave | 115 | Ping (0.55) | Funk (0.52) | Ping (0.65) | Basso (0.62) |

### 音量体系

最终播放音量 = `config.volume`（用户基准 0.0-1.0）× `theme.sounds.<event>.volume`（上表括号里的系数）× `0.3`（sampler 内部对 afplay 0-1 音阶的校准）。

每个阶段的相对响度由主题自己表达——通常 resolving 最突出，因为它在提示"结果出来了，看这里"。

### 平台

音频目前仅 macOS：`Sampler.playSystemSound()` 在非 darwin 平台直接返回。statusline 在所有平台都能用。

---

## 插件系统

TokenTone 是一个标准 Claude Code 插件：
- `.claude-plugin/plugin.json` — 插件元数据
- `.claude-plugin/marketplace.json` — 市场入口
- `commands/setup.md` — `/tokentone:setup` 命令（给 Claude 的指令）
- `commands/configure.md` — `/tokentone:configure` 命令

**注意**：`dist/` 已提交到 Git（不在 .gitignore 里）。插件系统通过 GitHub 下载整个 repo,
node 运行时直接跑 `dist/hook.js` / `dist/statusline.js`,bun 运行时直接跑 `src/*.ts`。
改完 `src/` 后记得 `npm run build` 重新生成 `dist/` 再提交。

---

## 当前状态 / 待办

- [x] dist/ 已移出 .gitignore 并提交
- [x] 移除了老的 `tokentone` CLI（index/pty/rhythm/engine），项目现为纯插件
- [ ] 音频仅 macOS：Linux/Windows 暂无声音（statusline 正常）。若要支持 Linux，
      需在 `sampler.ts` 加 aplay/paplay 分支（注意 aplay 无音量参数）
- [ ] `assets/samples/` 目前完全没用到——`sampler.ts` 只播 macOS 系统声音,
      不再加载本地采样。要么接回自定义采样,要么删掉该目录
