# Claude Code Statusline

A colorful, feature-rich 3-row status line for Claude Code with model detection, git status, rate limit tracking, theme system, and auto-auth integration.

## Features

- **3-row layout** — Model + git on row 1, context + cost on row 2, rate limits + auth on row 3
- **Model auto-detection** — adjusts token caps for DeepSeek V4 (1M ctx / 384K out), Claude 4.x (1M / 32K), and others
- **Git branch & changes** — shows current branch, clean (✓) or dirty (N changes)
- **Rate limit bars** — 5-hour and 7-day usage windows with reset countdown timers
- **8 color themes** — kratos, ocean, matrix, cyberpunk, vaporwave, sakura, shadow, inferno
- **`/skin` command** — switch themes or show gallery
- **Peak tracking** — ctx bar never drops within a session (survives compression); resets on restart
- **Session duration** — tracks total session time across statusline refreshes
- **Auto-auth toggle** — `PermissionRequest` hook with `! toggle-auth` command
- **Pet companion** — ASCII pet reacts to context level and auth state

## Preview

```
[Opus4.6] │ motor_pump_test │ master ✓
ctx ████░░░░░░ 42.3% │ $2.3456 ██░░░░░░░░ │ 15m [8m]
5h ██████░░ 63% (12:57) │ 7d ██░░░░░░ 24% (3d) │ [AUTO] (◕ω◕)🤖
```

## Install

```bash
# Copy to Claude Code config
cp statusline.js ~/.claude/
cp themes.json ~/.claude/
cp skin.sh ~/.claude/
cp toggle-auth.js ~/.claude/
cp -r hooks/ ~/.claude/

# Merge settings (or edit manually)
cat settings.json >> ~/.claude/settings.json
```

Restart Claude Code. Then:
```bash
# Toggle auto-auth
! toggle-auth

# Switch theme
/skin ocean
/skin              # show gallery
```

## Row layout

| Row | Content | Details |
|-----|---------|---------|
| 1 | Model + Dir + Git | Model name, directory, branch name, change count |
| 2 | ctx + Cost + Time | Context usage bar (peak-tracked), API cost, session/duration |
| 3 | Rate limits + Auth | 5h + 7d usage bars with reset timers, auth mode, pet |

## Themes

| Theme | Palette | Style |
|-------|---------|-------|
| kratos | Red + cream | Default, warm |
| ocean | Deep blue + cyan | Cool, calm |
| matrix | Green + black | Terminal aesthetic |
| cyberpunk | Purple + cyan | Neon future |
| vaporwave | Pink + cyan | Nostalgic synth |
| sakura | Pink + rose | Soft cherry blossom |
| shadow | Grayscale | Minimal monochrome |
| inferno | Orange + red | Intense heat |

## Rate limit cache

Rate limits are read from `~/.claude/usage_cache.json`. To populate:

```bash
# Example structure
{
  "5h": {"used_pct": 62.5, "resets_at": "2026-04-27T14:30:00Z"},
  "7d": {"used_pct": 24.3, "resets_at": "2026-05-01T00:00:00Z"}
}
```

Use the included `update-usage-cache.sh` to auto-populate from Anthropic API, or any tool that writes this JSON format.

## Pet states

| Auto-auth | Low ctx | Medium ctx | High ctx |
|-----------|---------|------------|----------|
| ON | (◕ᴗ◕)🔓 | (◕ω◕)🤖 | (◉⩎◉)⚡ |
| OFF | (◕‿◕) | (⊙_⊙) | (╯°□°)╯ |

## License

MIT
