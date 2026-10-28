// collect the <style>/<link> elements the dc runtime's helmet adds to <head> (the page's own CSS + fonts)
const { chromium } = require('playwright'); const fs = require('fs');
(async () => { const b = await chromium.launch({ channel: 'chrome' }); const p = await b.newPage({ viewport: { width: 1440, height: 900 } });
  await p.addInitScript(() => { window.__DKM_OFF = true; document.addEventListener('readystatechange', () => { if (document.readyState === 'interactive') window.__initialHead = [...document.head.children]; }); });
  await p.goto(process.argv[2], { waitUntil: 'load' }); await p.waitForFunction(() => document.querySelector('#dc-root .sc-host')); await p.waitForTimeout(300);
  const r = await p.evaluate(() => { const init = new Set(window.__initialHead || []); return [...document.head.children].filter(e => !init.has(e)).map(e => ({ tag: e.tagName, id: e.id, attrs: [...e.attributes].map(a => a.name + '=' + a.value).join(' '), len: (e.textContent || '').length, text: e.tagName === 'STYLE' ? e.textContent : '' })); });
  r.forEach(x => console.log(x.tag, x.id, x.attrs.slice(0, 80), x.len)); fs.writeFileSync(process.argv[3], JSON.stringify(r)); await b.close(); })();
