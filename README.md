# Claude Code Statusline

A colorful, feature-rich status line for Claude Code that shows real-time token usage, context window percentage, and cost — all with visual progress bars.

## Features

- **Model auto-detection** — adjusts in/out token caps for DeepSeek V4 (1M ctx / 384K out), Claude 4.x, and more
- **Four progress bars** — context %, cost, input tokens, output tokens
- **Color-coded thresholds** — green → yellow → red as usage climbs
- **Dark mode friendly** — bright ANSI colors tuned for dark terminal backgrounds

## Install

```bash
# Copy the script
cp statusline.js ~/.claude/statusline.js
```

Add to `~/.claude/settings.json`:

```json
{
  "statusLine": {
    "type": "command",
    "command": "node /Users/YOU/.claude/statusline.js"
  }
}
```

> Use absolute path — `~` expansion does not work in settings.json on Windows.

Restart Claude Code.

## Preview

```
[DeepSeek-V4-Pro] │ ctx ████░░░░░░ 42% │ $0.0234 ██░░░░░░░░ │ in █░░░░░░░░░ 38000 │ out ░░░░░░░░░░ 1200
```

| Segment | Meaning | Bar max |
|---------|---------|---------|
| ctx | Context window usage | 100% |
| $0.xxxx | Total API cost (USD) | $1.00 |
| in | Input tokens consumed | 1M or 200K (model-dependent) |
| out | Output tokens generated | 384K or 32K (model-dependent) |

## License

MIT
