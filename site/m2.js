/* DAEKON lead measurement (cookieless, first-party).
 * - Nothing is stored in the browser (no cookies, no web storage) and no personal data is sent. One request per event
 *   to /e.gif (a tiny image); the web server's existing access log is the only record. Honours Global Privacy Control.
 * - The source channel is derived from this page load's referrer / utm_source; when the visitor came from another
 *   daekon.hu page (e.g. a service page), that page is reported.
 * Events: cta_click, form_open, lead_ok, lead_fail, mail_click, tel_click, ref_open, case_open, svc_cta (CTA on a service page),
 *         js_error (own scripts only, max 3 per page).
 */
(function () {
  'use strict';
  // no measurement with Global Privacy Control, and none in automated browsers (QA runs, headless bots: navigator.webdriver)
  var off = navigator.globalPrivacyControl === true || navigator.webdriver === true;
  var AI = [[/(^|\.)chatgpt\.com$|(^|\.)chat\.openai\.com$/, 'chatgpt'], [/(^|\.)perplexity\.ai$/, 'perplexity'], [/(^|\.)copilot\.microsoft\.com$/, 'copilot'],
    [/(^|\.)gemini\.google\.com$/, 'gemini'], [/(^|\.)claude\.ai$/, 'claude'], [/(^|\.)you\.com$/, 'you'], [/(^|\.)phind\.com$/, 'phind']];
  function host(u) { try { return new URL(u).hostname.replace(/^www\./, ''); } catch (e) { return ''; } }
  function channel(ref, utm) {
    var h = host(ref), u = (utm || '').toLowerCase();
    for (var i = 0; i < AI.length; i++) if (AI[i][0].test(h) || (u && AI[i][0].test(u)) || u === AI[i][1]) return 'ai:' + AI[i][1];
    if (h === 'daekon.hu') { try { return 'internal:' + new URL(ref).pathname; } catch (e) { return 'internal:/'; } }
    if (!h) return u ? 'utm:' + u.slice(0, 40) : 'direct';
    if (/(^|\.)google\./.test(h)) return 'search:google';
    if (/(^|\.)bing\.com$/.test(h)) return 'search:bing';
    if (/(^|\.)duckduckgo\.com$/.test(h)) return 'search:duckduckgo';
    if (/facebook\.com$|instagram\.com$|linkedin\.com$|tiktok\.com$/.test(h)) return 'social:' + h.split('.').slice(-2)[0];
    return 'ref:' + h.slice(0, 60);
  }
  var utm = ''; try { utm = new URLSearchParams(location.search).get('utm_source') || ''; } catch (e) {}
  var ch = channel(document.referrer, utm);
  function send(ev, extra) {
    if (off) return;
    var q = 'e=' + encodeURIComponent(ev) + '&p=' + encodeURIComponent(location.pathname) + '&ch=' + encodeURIComponent(ch) + (extra ? '&x=' + encodeURIComponent(String(extra).slice(0, 60)) : '') + '&n=' + Date.now().toString(36);
    try { fetch('/e.gif?' + q, { method: 'GET', keepalive: true, cache: 'no-store', credentials: 'omit' }).catch(function () {}); } catch (e) { (new Image()).src = '/e.gif?' + q; }
  }
  // the lead mail carries the same, non-personal attribution (read by the quote form right before sending)
  window.daekonAttribution = function () { return 'Forrás: ' + ch + ' · Ajánlatkérés innen: ' + location.pathname; };
  window.daekonTrack = send;
  var svcPage = /^\/(weboldalkeszites|ettermi-rendelesi-rendszer|idopontfoglalo-rendszer|webshop-keszites|egyedi-webalkalmazas|vallalkozasi-automatizalas|weboldal-karbantartas)\//.test(location.pathname);
  document.addEventListener('click', function (e) {
    var a = e.target && e.target.closest ? e.target.closest('a,button') : null; if (!a) return;
    var href = a.getAttribute('href') || '';
    if (/^mailto:/.test(href)) return send('mail_click');
    if (/^tel:/.test(href)) return send('tel_click');
    if (a.hasAttribute('data-ai-toggle')) { if (a.getAttribute('aria-expanded') !== 'true') send('form_open'); return; }
    if (/(^|\/)#ai$/.test(href)) return send(svcPage ? 'svc_cta' : 'cta_click');
    if (/\/referenciak\//.test(href)) return send('case_open');
    if (/^https?:\/\//.test(href) && host(href) !== 'daekon.hu' && a.closest('#work, .refs')) return send('ref_open', host(href));
  }, true);
  document.addEventListener('daekon:lead', function (e) { var d = e.detail || {}; send(d.ok ? 'lead_ok' : 'lead_fail', d.ok ? (d.kind || '') : (d.error || '')); });
  // critical JS errors of our own scripts (message head only, at most 3 per page; no stack, no user data)
  var errs = 0;
  window.addEventListener('error', function (e) { if (errs >= 3 || !e || !e.filename || host(e.filename) !== 'daekon.hu') return; errs++; send('js_error', (e.message || '').slice(0, 50)); });
})();
