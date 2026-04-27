const fs = require('fs');
const os = require('os');
const path = require('path');
const { execSync } = require('child_process');

let data = '';
process.stdin.on('data', c => data += c);
process.stdin.on('end', () => {
  const d = JSON.parse(data);
  const R = '\x1b[0m';
  const B = '\x1b[1m';
  const DIM = '\x1b[2m';

  const C = (n) => `\x1b[${n}m`;

  // ── Model detection ───────────────────────────────────
  const mn = (d.model?.display_name || '?').toLowerCase();
  const isDeepSeekV4 = mn.includes('deepseek') && mn.includes('v4');
  const isClaude4 = mn.includes('claude') && (mn.includes('opus 4') || mn.includes('sonnet 4') || mn.includes('haiku 4'));
  const isLargeCtx = isDeepSeekV4 || isClaude4;
  const IN_MAX = isLargeCtx ? 1000000 : 200000;
  const OUT_MAX = isDeepSeekV4 ? 384000 : 32000;
  const modelName = d.model?.display_name || '?';

  // ── Token & cost values ───────────────────────────────
  const inp = d.context_window?.total_input_tokens || 0;
  const out = d.context_window?.total_output_tokens || 0;
  const cost = d.cost?.total_cost_usd || 0;
  const durationMs = d.cost?.total_duration_ms || 0;

  // ── Peak tracking ─────────────────────────────────────
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

  // ── Git status ────────────────────────────────────────
  const cwd = d.cwd || process.cwd();
  let gitInfo = '';
  try {
    const branch = execSync('git branch --show-current', { cwd, encoding: 'utf8', timeout: 2000, stdio: ['ignore','pipe','ignore'] }).trim();
    if (branch) {
      const changes = execSync('git --no-optional-locks status --porcelain', { cwd, encoding: 'utf8', timeout: 2000, stdio: ['ignore','pipe','ignore'] })
        .split('\n').filter(Boolean).length;
      gitInfo = changes > 0
        ? `${C(36)}${branch}${R} ${C(31)}${changes}${R}`
        : `${C(36)}${branch}${R} ${C(32)}✓${R}`;
    }
  } catch (e) {}

  // ── Session duration ──────────────────────────────────
  const sessFile = path.join(os.homedir(), '.claude', '.session-start');
  try {
    if (!fs.existsSync(sessFile)) {
      fs.writeFileSync(sessFile, String(Date.now()));
    }
  } catch (e) {}
  let sessStr = '';
  try {
    const start = parseInt(fs.readFileSync(sessFile, 'utf8'), 10);
    const elapsed = Math.floor((Date.now() - start) / 1000);
    if (elapsed < 3600) sessStr = `${Math.floor(elapsed / 60)}m`;
    else if (elapsed < 86400) sessStr = `${Math.floor(elapsed / 3600)}h${Math.floor((elapsed % 3600) / 60)}m`;
    else sessStr = `${Math.floor(elapsed / 86400)}d${Math.floor((elapsed % 86400) / 3600)}h`;
  } catch (e) {}

  // ── Auto-auth ─────────────────────────────────────────
  const authFile = path.join(os.homedir(), '.claude', 'auto-auth');
  const autoAuth = fs.existsSync(authFile);
  const authTag = autoAuth ? `${C(32)}[AUTO]${R}` : `${DIM}[manual]${R}`;

  // ── Bar builder ───────────────────────────────────────
  const bar = (pct, color, colorEmpty, width = 10) => {
    const n = Math.round(Math.max(0, Math.min(pct, 100)) / 100 * width);
    return color + '█'.repeat(n) + colorEmpty + '░'.repeat(width - n) + R;
  };

  // ── Threshold colors ──────────────────────────────────
  const ctxColor = ctx > 70 ? C(31) : ctx > 40 ? C(33) : C(32);
  const costPct = Math.min(cost / 10 * 100, 100);
  const costColor = cost > 15 ? C(31) : cost > 5 ? C(33) : C(32);
  // ── Pet ───────────────────────────────────────────────
  const pet = autoAuth
    ? (ctx > 70 ? '(◉⩎◉)⚡' : ctx > 40 ? '(◕ω◕)🤖' : '(◕ᴗ◕)🔓')
    : (ctx > 70 ? '(╯°□°)╯' : ctx > 40 ? '(⊙_⊙)' : '(◕‿◕)');

  // ── Duration formatting ───────────────────────────────
  let durStr = '';
  if (durationMs > 0) {
    const sec = Math.floor(durationMs / 1000);
    if (sec < 3600) durStr = `${Math.floor(sec / 60)}m`;
    else durStr = `${Math.floor(sec / 3600)}h${Math.floor((sec % 3600) / 60)}m`;
  }

  // ── Compressed indicator ──────────────────────────────
  const compressed = peakInp > inp ? ` ${DIM}(real ${ctxReal}%)${R}` : '';

  // ── Output: single-row compact layout ──────────────────
  const SEP = ` ${C(90)}│${R} `;
  const dirName = path.basename(cwd);

  let line = '';

  // Segment 1: Model
  line += `${C(36)}${B}[${modelName}]${R}`;

  // Segment 2: Directory + Git
  if (gitInfo) {
    line += `${SEP}${C(94)}${dirName}${R} ${C(90)}(${R}${gitInfo}${C(90)})${R}`;
  } else {
    line += `${SEP}${C(94)}${dirName}${R}`;
  }

  // Segment 3: ctx bar
  line += `${SEP}${ctxColor}ctx${R} ${bar(ctx, ctxColor, C(90), 8)} ${ctxColor}${ctx}%${compressed}${R}`;

  // Segment 4: cost
  line += `${SEP}${costColor}$${cost.toFixed(2)}${R} ${bar(costPct, costColor, C(90), 5)}`;

  // Segment 5: auth + pet
  line += `${SEP}${authTag} ${pet}`;

  // ── Update timestamp for next iteration ───────────────
  try { fs.writeFileSync(stateFile, String(Date.now())); } catch (e) {}

  process.stdout.write(line);
});

// ── Helpers ─────────────────────────────────────────────


