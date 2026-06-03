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
   - 无常驻 daemon（watcher 是临时进程，随响应生随响应灭）
   - 状态用 JSON 文件传递（几十字节）
   - 每个 hook 脚本 < 20ms
   - 用户安装后什么都不需要管

---

## 情感弧线状态机

```
事件                    状态          音效特征
────────────────────────────────────────────────
UserPromptSubmit  →   start         轻柔单音，期待感    vol×0.5
PostToolUse #1-2  →   active        干净音符           vol×0.6
PostToolUse #3+   →   intense       更活跃的音符池      vol×0.8
（响应过程中）    →   watcher       BPM节拍持续播放
Stop              →   resolving     收尾音符，余韵感    vol×0.5
距上次事件 >60s   →   idle          视为新 session，重置
```

---

## 系统架构

```
Claude Code
  │
  ├─ UserPromptSubmit hook
  │       └── hook.js：记录 start 状态，spawn watcher（detached）
  │
  ├─ watcher.js（后台，临时）
  │       └── 按主题 BPM 节拍持续播放音符
  │           监听 signal 文件决定是否停止
  │
  ├─ PostToolUse hook
  │       └── hook.js：更新状态（active→intense），播放单音
  │
  ├─ Stop hook
  │       └── hook.js：写停止信号，watcher 收到后播放收尾音退出
  │
  └─ statusline（每 ~300ms）
          └── statusline.js：显示 ♪ lofi │ vol:70% │ ●，轻量无音频
```

### 关键文件

| 文件 | 职责 |
|------|------|
| `src/hook.ts` | Hook 入口：状态转移 + spawn/signal watcher |
| `src/watcher.ts` | 后台节拍器：BPM 驱动，响应期间持续播放 |
| `src/statusline.ts` | 状态栏显示，纯显示，无音频 |
| `src/state.ts` | 运行时状态读写（~/.claude/plugins/tokentone/state.json） |
| `src/config.ts` | 用户配置读写（~/.claude/plugins/tokentone/config.json） |
| `src/audio/sampler.ts` | 调用 afplay/aplay 播放音频，复用系统声音作为后备 |
| `src/audio/scheduler.ts` | BPM 节拍量化，让音符对齐节拍而非机械触发 |

### 进程通信方式

- **状态传递**：`state.json`（phase、callCount、lastNoteAt 等）
- **停止信号**：`watcher.signal` 文件（Stop hook 写入，watcher 轮询读取）
- **用户配置**：`config.json`（theme、volume、enabled、triggers）

---

## 音频系统

### 三个主题（macOS 系统声音后备）

| 主题 | BPM | 声音特征 | 系统声音 |
|------|-----|---------|---------|
| lofi | 85 | 柔和温暖 | Tink, Pop, Purr |
| ambient | 70 | 空灵大气 | Glass, Submarine, Purr |
| synthwave | 110 | 有力电子 | Funk, Hero, Ping |

### 音符选择规则

- `start` / `resolving`：最后一个音符（index = count-1，最柔/最有余韵感）
- `active`：从前两个音符随机选（index 0 或 1）
- `intense`：全音符池随机选（最大变化感）

### 音量体系

- 用户设置的 `volume`（0.0-1.0）是基准
- 各状态乘以对应系数（0.5/0.6/0.8）
- Sampler 内部再乘以 0.3（macOS afplay 音量校准）

---

## 插件系统

TokenTone 是一个标准 Claude Code 插件：
- `.claude-plugin/plugin.json` — 插件元数据
- `.claude-plugin/marketplace.json` — 市场入口
- `commands/setup.md` — `/tokentone:setup` 命令（给 Claude 的指令）
- `commands/configure.md` — `/tokentone:configure` 命令

**注意**：`dist/` 需要提交到 Git（不能在 .gitignore 里），插件系统通过 GitHub 下载整个 repo 后直接运行 `dist/hook.js`。

---

## 当前未解决的问题

- [ ] watcher.ts 尚未实现（是下一步要做的核心功能）
- [ ] dist/ 在 .gitignore 里，发布前需要移除
- [ ] assets/samples/ 目录为空，目前依赖 macOS 系统声音后备
- [ ] Linux 的 aplay 没有音量控制参数，音量体系在 Linux 上不生效
