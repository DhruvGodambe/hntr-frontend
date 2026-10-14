(function () {
  if (window.AU_I18N) return; // script may be injected twice; keep one instance
  const LANGS = [
    ['en', 'English'], ['es', 'Español'], ['pt', 'Português'], ['it', 'Italiano'], ['fr', 'Français'],
    ['ru', 'Русский'], ['tr', 'Türkçe'], ['hi', 'हिन्दी'], ['ar', 'العربية'],
    ['de', 'Deutsch'], ['vi', 'Tiếng Việt'], ['zh', '中文'], ['ko', '한국어'], ['ja', '日本語']
  ];
  const KEY = 'hntr-about-lang';
  const cache = {};
  const revAll = {};
  let active = 'en';
  let host = null;

  function label(code) { return (LANGS.find(l => l[0] === code) || LANGS[0])[1]; }

  function nodes() {
    const out = [];
    const w = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, {
      acceptNode(n) {
        if (!n.nodeValue || !n.nodeValue.trim()) return NodeFilter.FILTER_REJECT;
        const p = n.parentElement;
        if (!p || p.closest('[data-no-i18n]')) return NodeFilter.FILTER_REJECT;
        const t = p.tagName;
        if (t === 'SCRIPT' || t === 'STYLE') return NodeFilter.FILTER_REJECT;
        return NodeFilter.FILTER_ACCEPT;
      }
    });
    let n;
    while ((n = w.nextNode())) out.push(n);
    return out;
  }

  // Resolve any rendered string back to its English source (merged index over all dictionaries).
  function toEnglish(s) { return revAll[s] || s; }

  function setBidi(on) {
    let el = document.getElementById('au-bidi');
    if (!on) { if (el) el.remove(); return; }
    if (!el) {
      el = document.createElement('style');
      el.id = 'au-bidi';
      el.textContent = '#au-scroll h1,#au-scroll h2,#au-scroll h3,#au-scroll h4,#au-scroll p,#au-scroll span,#au-scroll li,#au-scroll div{unicode-bidi:plaintext}';
      document.head.appendChild(el);
    }
  }

  function syncLabel() {
    if (!host) return;
    const sp = host.querySelector('button span');
    if (sp) sp.textContent = label(active);
  }

  function apply(dict) {
    nodes().forEach(n => {
      const raw = n.nodeValue;
      const shown = raw.trim();
      const en = toEnglish(shown);
      const next = dict ? (dict[en] || en) : en;
      if (next !== shown) n.nodeValue = raw.replace(shown, next);
    });
  }

  async function load(lang) {
    if (cache[lang]) return cache[lang];
    try {
      if (!window.__auKeys) {
        window.__auKeys = (window.__AU_DICTS && window.__AU_DICTS.__keys) || [];
      }
      let d = (window.__AU_DICTS && window.__AU_DICTS[lang]) || {};
      if (Array.isArray(d)) {
        const o = {};
        window.__auKeys.forEach((k, i) => { if (d[i]) o[k] = d[i]; });
        d = o;
      }
      cache[lang] = d;
      Object.keys(d).forEach(k => { if (!revAll[d[k]]) revAll[d[k]] = k; });
    } catch (e) { cache[lang] = {}; }
    return cache[lang];
  }

  async function set(lang) {
    try { localStorage.setItem(KEY, lang); } catch (e) {}
    await Promise.all(LANGS.filter(l => l[0] !== 'en').map(l => load(l[0])));
    const d = lang === 'en' ? null : cache[lang];
    busy = true;
    apply(d);
    active = lang;
    setBidi(lang === 'ar');
    if (pending) { clearTimeout(pending); pending = null; }
    setTimeout(() => { busy = false; }, 200);
    syncLabel();
  }

  // Re-apply after React re-renders swap in fresh English text nodes.
  let pending = null;
  let busy = false;
  function watch() {
    const mo = new MutationObserver(() => {
      if (busy || active === 'en' || pending) return;
      pending = setTimeout(() => { pending = null; apply(cache[active]); }, 120);
    });
    mo.observe(document.body, { childList: true, subtree: true, characterData: true });
  }

  window.AU_I18N = {
    langs: LANGS,
    set,
    current() { try { return localStorage.getItem(KEY) || 'en'; } catch (e) { return 'en'; } },
    mount(h) {
      if (!h || h.dataset.ready) return;
      host = h;
      host.dataset.ready = '1';
      host.setAttribute('data-no-i18n', '');
      const cur = window.AU_I18N.current();
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.style.cssText = 'display:inline-flex;align-items:center;gap:7px;height:36px;padding:0 14px;border:none;border-radius:18px;background:#fff;box-shadow:0 1px 2px rgba(0,0,0,.06),0 6px 18px rgba(0,0,0,.06);font:inherit;font-size:15px;font-weight:500;color:#1d1d1f;cursor:pointer';
      btn.innerHTML = '<svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="#1d1d1f" stroke-width="1.3"><circle cx="8" cy="8" r="6.4"/><path d="M1.6 8h12.8M8 1.6c3.2 3.6 3.2 9.2 0 12.8M8 1.6c-3.2 3.6-3.2 9.2 0 12.8"/></svg><span></span>';
      btn.lastChild.textContent = label(cur);
      active = 'en';

      const menu = document.createElement('div');
      menu.style.cssText = 'position:absolute;top:44px;right:0;max-height:min(60vh,420px);overflow:auto;background:rgba(255,255,255,.96);backdrop-filter:blur(20px);border-radius:16px;box-shadow:0 1px 2px rgba(0,0,0,.06),0 18px 50px rgba(0,0,0,.14);padding:8px;display:none;flex-direction:column;gap:2px;min-width:180px;z-index:80';
      LANGS.forEach(([code, name]) => {
        const item = document.createElement('button');
        item.type = 'button';
        item.style.cssText = 'display:flex;align-items:center;justify-content:space-between;gap:12px;width:100%;height:36px;padding:0 12px;border:none;border-radius:11px;background:transparent;font:inherit;font-size:15px;color:#1d1d1f;cursor:pointer;text-align:left';
        item.textContent = name;
        if ((window.AU_VOICED || ['en']).indexOf(code) >= 0) {
          const spk = document.createElement('span');
          spk.setAttribute('aria-label', 'narrated');
          spk.title = 'Narrated presentation available';
          spk.style.cssText = 'display:inline-flex;flex:0 0 auto;color:#86868b';
          spk.innerHTML = '<svg width="15" height="15" viewBox="0 0 18 18" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" aria-hidden="true"><path d="M3 6.6h2.4L9 3.6v10.8L5.4 11.4H3V6.6Z"/><path d="M12 6.4a3.6 3.6 0 0 1 0 5.2"/><path d="M14.2 4.4a6.6 6.6 0 0 1 0 9.2"/></svg>';
          item.appendChild(spk);
        }
        item.onmouseenter = () => { item.style.background = '#f5f5f7'; };
        item.onmouseleave = () => { item.style.background = 'transparent'; };
        item.onclick = () => { set(code); menu.style.display = 'none'; };
        menu.appendChild(item);
      });

      host.style.position = 'relative';
      btn.onclick = (e) => {
        e.stopPropagation();
        menu.style.display = menu.style.display === 'flex' ? 'none' : 'flex';
      };
      document.addEventListener('click', () => { menu.style.display = 'none'; });
      host.appendChild(btn);
      host.appendChild(menu);
      watch();
      setInterval(syncLabel, 600);
      if (cur !== 'en') set(cur); else active = 'en';
    }
  };
})();
