// capture React's first render output (no lifecycle effects, no motion layer) for wide=true and wide=false
const { chromium } = require('playwright'); const fs = require('fs');
const [base, out] = process.argv.slice(2);
(async () => { const b = await chromium.launch({ channel: 'chrome' });
  for (const wide of [true, false]) {
    const p = await b.newPage({ viewport: { width: wide ? 1440 : 390, height: 900 } });
    await p.route('**/r/app-tpl.js*', async r => { const res = await r.fetch(); let t = await res.text();
      t = t.replace('componentDidMount() {', 'componentDidMount() { if (window.__SNAP) return;'); if (!wide) t = t.replace('state = { wide: true', 'state = { wide: false');
      r.fulfill({ response: res, body: t }); });
    await p.addInitScript(() => { window.__SNAP = true; window.__DKM_OFF = true; });
    await p.goto(base, { waitUntil: 'load' }); await p.waitForFunction(() => document.querySelector('#dc-root .sc-host')); await p.waitForTimeout(500);
    const html = await p.evaluate(() => { const root = document.getElementById('dc-root'); let n = 0;
      // React's server renderer separates adjacent text nodes with <!-- --> so hydration sees the same text nodes
      const walk = el => { for (let c = el.firstChild; c; c = c.nextSibling) { if (c.nodeType === 3 && c.nextSibling && c.nextSibling.nodeType === 3) { c.after(document.createComment(' ')); n++; } else if (c.nodeType === 1 && c.tagName !== 'TEXTAREA' && c.tagName !== 'SCRIPT' && c.tagName !== 'STYLE') walk(c); } };
      walk(root); console.log('separators', n); return root.innerHTML; });
    fs.writeFileSync(`${out}/snap-${wide ? 'wide' : 'narrow'}.html`, html); console.log(wide ? 'wide' : 'narrow', html.length, 'chars');
    await p.close(); }
  await b.close(); })();
