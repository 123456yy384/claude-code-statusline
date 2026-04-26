let data = '';
process.stdin.on('data', c => data += c);
process.stdin.on('end', () => {
  const d = JSON.parse(data);
  const m = d.model?.display_name || '?';
  const ctx = d.context_window?.used_percentage || 0;
  const cost = d.cost?.total_cost_usd || 0;
  const inp = d.context_window?.total_input_tokens || 0;
  const out = d.context_window?.total_output_tokens || 0;

  const C = (n) => `\x1b[${n}m`;
  const R = C(0);
  const B = C(1);
  const DIM = C(2);
  const CYAN = C(36);
  const GREEN = C(32);
  const YELLOW = C(33);
  const RED = C(31);

  // 根据模型名匹配真实上下文上限
  // DeepSeek V4: 1M context, 384K output
  // Claude 4.x: 1M context, 32K output
  const mn = (d.model?.display_name || '').toLowerCase();
  const isDeepSeekV4 = mn.includes('deepseek') && mn.includes('v4');
  const isClaude4 = mn.includes('claude') && (mn.includes('opus 4') || mn.includes('sonnet 4') || mn.includes('haiku 4'));
  const isLargeCtx = isDeepSeekV4 || isClaude4;
  const IN_MAX = isLargeCtx ? 1000000 : 200000;
  const OUT_MAX = isDeepSeekV4 ? 384000 : 32000;

  const bar = (pct, color) => {
    const w = 10;
    const n = Math.round(pct / 100 * w);
    return color + '█'.repeat(n) + C(90) + '░'.repeat(w - n) + R;
  };

  const ctxColor = ctx > 70 ? RED : ctx > 40 ? YELLOW : GREEN;
  const costPct = Math.min(cost / 1.0 * 100, 100);
  const costColor = cost > 1.0 ? RED : cost > 0.5 ? YELLOW : GREEN;

  process.stdout.write(
    `${CYAN}${B}[${m}]${R}` +
    ` ${DIM}│${R}` +
    ` ${ctxColor}ctx ${bar(ctx, ctxColor)} ${ctx}%${R}` +
    ` ${DIM}│${R}` +
    ` ${costColor}$${cost.toFixed(4)} ${bar(costPct, costColor)}${R}` +
    ` ${DIM}│${R}` +
    ` ${C(94)}in ${bar(Math.min(inp / IN_MAX * 100, 100), C(94))} ${inp}${R}` +
    ` ${C(95)}out ${bar(Math.min(out / OUT_MAX * 100, 100), C(95))} ${out}${R}`
  );
});
