const fs = require('fs');
const os = require('os');
const path = require('path');

let data = '';
process.stdin.on('data', c => data += c);
process.stdin.on('end', () => {
  const d = JSON.parse(data);
  const m = d.model?.display_name || '?';
  const inp = d.context_window?.total_input_tokens || 0;
  const out = d.context_window?.total_output_tokens || 0;
  const cost = d.cost?.total_cost_usd || 0;

  const authFile = path.join(os.homedir(), '.claude', 'auto-auth');
  const autoAuth = fs.existsSync(authFile);

  const C = (n) => `\x1b[${n}m`;
  const R = C(0);
  const B = C(1);
  const DIM = C(2);
  const CYAN = C(36);
  const GREEN = C(32);
  const YELLOW = C(33);
  const RED = C(31);
  const MAGENTA = C(35);

  const mn = (d.model?.display_name || '').toLowerCase();
  const isDeepSeekV4 = mn.includes('deepseek') && mn.includes('v4');
  const isClaude4 = mn.includes('claude') && (mn.includes('opus 4') || mn.includes('sonnet 4') || mn.includes('haiku 4'));
  const isLargeCtx = isDeepSeekV4 || isClaude4;
  const IN_MAX = isLargeCtx ? 1000000 : 200000;
  const OUT_MAX = isDeepSeekV4 ? 384000 : 32000;

  // Peak tracking: resets on restart, never drops within a session
  const peakFile = path.join(os.homedir(), '.claude', '.ctx-peak');
  const stateFile = path.join(os.homedir(), '.claude', '.last-prompt-ts');
  let peakInp = inp;
  try {
    let isRestart = false;
    if (fs.existsSync(stateFile)) {
      const prev = parseInt(fs.readFileSync(stateFile, 'utf8'), 10);
      if (Date.now() - prev > 30000) isRestart = true;
    }
    if (!isRestart && fs.existsSync(peakFile)) {
      const saved = parseInt(fs.readFileSync(peakFile, 'utf8'), 10);
      if (saved > peakInp) peakInp = saved;
    }
    fs.writeFileSync(peakFile, String(peakInp));
  } catch (e) {}

  const ctx = (peakInp / IN_MAX * 100).toFixed(1);
  const ctxReal = (inp / IN_MAX * 100).toFixed(1);

  const bar = (pct, color) => {
    const w = 10;
    const n = Math.round(pct / 100 * w);
    return color + '█'.repeat(n) + C(90) + '░'.repeat(w - n) + R;
  };

  const ctxColor = ctx > 70 ? RED : ctx > 40 ? YELLOW : GREEN;
  const costPct = Math.min(cost / 10 * 100, 100);
  const costColor = cost > 15 ? RED : cost > 5 ? YELLOW : GREEN;

  const pet = autoAuth
    ? (ctx > 70 ? '(◉⩎◉)⚡' : ctx > 40 ? '(◕ω◕)🤖' : '(◕ᴗ◕)🔓')
    : (ctx > 70 ? '(╯\xB0□\xB0)╯' : ctx > 40 ? '(⊙_⊙)' : '(◕‿◕)');

  const authTag = autoAuth ? `${GREEN}[AUTO]${R}` : `${DIM}[manual]${R}`;

  // Update timestamp for peak tracking restart detection
  const now = Date.now();
  try { fs.writeFileSync(stateFile, String(now)); } catch (e) {}

  const compressed = peakInp > inp ? ` ${DIM}(real ${ctxReal}%)${R}` : '';

  process.stdout.write(
    `${CYAN}${B}[${m}]${R}` +
    ` ${DIM}│${R}` +
    ` ${ctxColor}ctx ${bar(ctx, ctxColor)} ${ctx}%${compressed}${R}` +
    ` ${DIM}│${R}` +
    ` ${costColor}$${cost.toFixed(4)} ${bar(costPct, costColor)}${R}` +
    ` ${DIM}│${R}` +
    ` ${C(94)}in ${bar(Math.min(inp / IN_MAX * 100, 100), C(94))} ${inp}${R}` +
    ` ${C(95)}out ${bar(Math.min(out / OUT_MAX * 100, 100), C(95))} ${out}${R}` +
    ` ${DIM}│${R} ${authTag} ${ctxColor}${pet}${R}`
  );
});
