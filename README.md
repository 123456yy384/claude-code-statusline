# Claude Code Statusline

A colorful, feature-rich status line for Claude Code with real-time token usage, context window tracking, cost, and auto-auth integration.

## Features

- **Model auto-detection** — adjusts token caps for DeepSeek V4 (1M ctx / 384K out), Claude 4.x (1M / 32K), and others
- **Peak tracking** — ctx bar never drops within a session (survives compression); resets on restart
- **Auto-auth hook** — `PermissionRequest` hook for one-click toggle of auto-approval mode
- **Pet companion** — ASCII pet reacts to context level and auth state
- **Color-coded thresholds** — green → yellow → red as usage climbs

## Install

```bash
# Copy script and hook
cp statusline.js ~/.claude/
cp -r hooks/ ~/.claude/
cp toggle-auth.js ~/.claude/
cp settings.json ~/.claude/settings.json   # or merge with your existing settings
```

Restart Claude Code. Then toggle auto-auth anytime:

```bash
! toggle-auth
```

Or type `/auto-auth` in Claude Code (slower, goes through AI).

## Preview

```
[DeepSeek V4] │ ctx ██░░░░░░░░ 15.0% │ $0.7500 █░░░░░░░░░ │ in ██░░░░░░░░ 150000 │ out ░░░░░░░░░░ 5000 │ [AUTO] (◕ᴗ◕)🔓
```

| Segment | Meaning | Bar max |
|---------|---------|---------|
| ctx | Context window usage (peak-tracked) | 100% |
| $x.xxxx | Total API cost (USD) | $10.00 |
| in | Input tokens consumed | 1M or 200K (model-dependent) |
| out | Output tokens generated | 384K or 32K (model-dependent) |
| [AUTO]/[manual] | Auto-approval mode indicator | — |
| Pet | Reacts to ctx level + auth state | — |

### Pet states

| Auto-auth | Low ctx | Medium ctx | High ctx |
|-----------|---------|------------|----------|
| ON | (◕ᴗ◕)🔓 | (◕ω◕)🤖 | (◉⩎◉)⚡ |
| OFF | (◕‿◕) | (⊙_⊙) | (╯°□°)╯ |

## Auto-auth toggle

The `PermissionRequest` hook checks `~/.claude/auto-auth` marker file. When present, all tool calls are auto-approved. When absent, normal confirmation prompts appear.

Toggle via `! toggle-auth` command (instant, no AI round-trip).

> **Note**: Windows Terminal keybindings (`sendInput` action) were attempted for a shortcut key but did not work reliably in testing. Use `! toggle-auth` instead.

## License

MIT
