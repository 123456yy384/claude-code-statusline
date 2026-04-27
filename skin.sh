#!/bin/bash
# Claude Code Statusline — Skin Selector
# Usage: /skin          -> show gallery
#        /skin <name>   -> apply theme

export PYTHONIOENCODING=utf-8

CONFIG="${HOME}/.claude/skin.json"
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# Convert to Windows path for Python (handles Git Bash / MSYS / WSL)
if command -v cygpath &>/dev/null; then
  THEMES_WIN="$(cygpath -w "${SCRIPT_DIR}/themes.json")"
  CONFIG_WIN="$(cygpath -w "$CONFIG")"
else
  THEMES_WIN="${SCRIPT_DIR}/themes.json"
  CONFIG_WIN="$CONFIG"
fi

[[ -f "${SCRIPT_DIR}/themes.json" ]] || { echo "themes.json not found"; exit 1; }
mkdir -p "${HOME}/.claude"

if [[ $# -eq 0 ]]; then
  python -c "
import json
with open(r'$THEMES_WIN', encoding='utf-8') as f: data = json.load(f)
RST = '\033[0m'; BLD = '\033[1m'; DIM = '\033[2m'
cur = 'kratos'
try:
    with open(r'$CONFIG_WIN', encoding='utf-8') as f: cur = json.load(f).get('skin','kratos')
except: pass
print()
print(f'{BLD}Available Skins:{RST}')
print()
for name, t in data.items():
    c = t['colors']; l = t['logo']
    marker = f' {BLD}*{RST}' if name == cur else '  '
    print(f'{marker} \033[{c[\"logo1\"][0]};5;{c[\"logo1\"][2]}m{l[0]}{RST}  \033[{c[\"logo2\"][0]};5;{c[\"logo2\"][2]}m{l[1]}{RST}  \033[{c[\"logo3\"][0]};5;{c[\"logo3\"][2]}m{l[2]}{RST}  {BLD}{name.upper():<12}{RST} {DIM}{t[\"desc\"]}{RST}')
    print()
if cur:
    print(f'Current: {BLD}{cur}{RST}')
print('Usage: /skin <name>')
print()
"
else
  name=$(echo "$1" | tr '[:upper:]' '[:lower:]')
  valid=$(python -c "import json;f=open(r'$THEMES_WIN', encoding='utf-8');t=json.load(f);print(1 if '$name' in t else 0)")
  if [[ "$valid" != "1" ]]; then
    echo "Unknown skin: $name"
    exit 1
  fi
  echo "{\"skin\":\"$name\"}" > "$CONFIG"
  echo "Skin applied: $name"
fi
