/* ================================================================
   CYBERTERM OS — sidebar.js
   Full productivity sidebar injected into every page.
   Panels: Feed | Todo | Journal | Bookmarks | Comms | System | Links
   ================================================================ */

(function () {
  'use strict';
  if (document.getElementById('ct-root')) return;
  window.__ctSidebarLoaded = true;

  // ══════════════════════════════════════════════════════════════
  // STORAGE HELPERS
  // ══════════════════════════════════════════════════════════════
  const Store = {
    get: (keys) => new Promise(r => chrome.storage.local.get(keys, r)),
    set: (obj)  => new Promise(r => chrome.storage.local.set(obj, r)),
  };

  // ══════════════════════════════════════════════════════════════
  // BUILD SIDEBAR HTML
  // ══════════════════════════════════════════════════════════════
  const PANELS = [
    { id: 'feed',      icon: '⌘', title: 'FEED',       tip: 'Activity Feed'   },
    { id: 'todo',      icon: '✓', title: 'TO-DO',      tip: 'Task Manager'    },
    { id: 'journal',   icon: '✎', title: 'JOURNAL',    tip: 'Daily Journal'   },
    { id: 'bookmarks', icon: '◈', title: 'BOOKMARKS',  tip: 'Saved Links'     },
    { id: 'comms',     icon: '◉', title: 'COMMS',      tip: 'Quick Launchers' },
    { id: 'system',    icon: '◎', title: 'SYSTEM',     tip: 'System Stats'    },
    { id: 'links',     icon: '⊞', title: 'EXTENSIONS', tip: 'Quick Links'     },
  ];

  function buildSidebar() {
    const root = document.createElement('div');
    root.id = 'ct-root';

    root.innerHTML = `
      <!-- TOPBAR -->
      <div id="ct-topbar">
        <div id="ct-logo">Cyber<span>T</span>erm <span style="font-size:9px;letter-spacing:0.08em;color:var(--ct-dim)">OS</span></div>
        <div id="ct-subtitle">// productivity dashboard</div>
        <button id="ct-toggle-btn" title="Toggle Sidebar (Ctrl+Shift+Y)">◀</button>
      </div>

      <!-- NAV -->
      <div id="ct-nav">
        ${PANELS.map((p, i) => `
          <button class="ct-nav-btn${i===0?' active':''}"
                  data-panel="${p.id}"
                  title="${p.tip}">
            ${p.icon}
            ${p.id === 'todo' ? '<span class="ct-badge" id="ct-todo-badge" style="display:none">0</span>' : ''}
          </button>
        `).join('')}
      </div>

      <!-- PANELS -->
      <div id="ct-panels">
        ${PANELS.map((p, i) => `
          <div class="ct-panel${i===0?' active':''}" id="ct-panel-${p.id}">
            <div class="ct-panel-header">
              <div class="ct-panel-title">${p.title}</div>
            </div>
            <div class="ct-scroll" id="ct-scroll-${p.id}"></div>
          </div>
        `).join('')}
      </div>

      <!-- STATUSBAR -->
      <div id="ct-statusbar">
        <span id="ct-cursor">█</span>
        <span id="ct-status-text">READY</span>
        <span id="ct-clock">--:--:--</span>
      </div>
    `;

    document.body.appendChild(root);
    return root;
  }

  // ══════════════════════════════════════════════════════════════
  // NAV LOGIC
  // ══════════════════════════════════════════════════════════════
  let activePanel = 'feed';

  function switchPanel(id) {
    activePanel = id;
    document.querySelectorAll('.ct-nav-btn').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.panel === id);
    });
    document.querySelectorAll('.ct-panel').forEach(p => {
      p.classList.toggle('active', p.id === `ct-panel-${id}`);
    });
  }

  function initNav() {
    document.getElementById('ct-nav').addEventListener('click', e => {
      const btn = e.target.closest('.ct-nav-btn');
      if (!btn) return;
      switchPanel(btn.dataset.panel);
    });

    const toggleBtn = document.getElementById('ct-toggle-btn');
    let visible = true;
    toggleBtn.addEventListener('click', () => {
      visible = !visible;
      const root = document.getElementById('ct-root');
      root.classList.toggle('ct-hidden', !visible);
      document.body.classList.toggle('ct-pushed', visible);
      document.body.classList.toggle('ct-sidebar-hidden', !visible);
      toggleBtn.textContent = visible ? '◀' : '▶';
      Store.set({ ct_sidebar: visible });
    });
  }

  // ══════════════════════════════════════════════════════════════
  // CLOCK
  // ══════════════════════════════════════════════════════════════
  function initClock() {
    function tick() {
      const now = new Date();
      const t = [now.getHours(), now.getMinutes(), now.getSeconds()]
        .map(n => String(n).padStart(2,'0')).join(':');
      const el = document.getElementById('ct-clock');
      if (el) el.textContent = t;
    }
    tick();
    setInterval(tick, 1000);
  }

  // ══════════════════════════════════════════════════════════════
  // PANEL: FEED
  // ══════════════════════════════════════════════════════════════
  const FEED_POSTS = [
    { handle:'@genghis_khan', body:'V1.0.7 — Fixed keyboard shortcuts, cleared editor autosave on publish, Feed [Load more] now keyboard selectable.', time:'1h ago', tag:'#update' },
    { handle:'@null_pointer',  body:'Just shipped a bash util: watches git blame and reports which of your lines got deleted most. Mine is comments.', time:'3h ago', tag:'#code' },
    { handle:'@phosphor',      body:'Amber on black. The original dark mode. Everything since has been an imitation of warmth.', time:'6h ago', tag:'#thoughts' },
    { handle:'@wren_bytes',    body:'Write the ugly draft. The one where you say exactly what you mean with zero elegance. Then rewrite until meaning stays.', time:'1d ago', tag:'#writing' },
    { handle:'@cascade_sys',   body:'BGP route flap stabilised. RCA in progress. All p99 thresholds updated. Monitoring nominal.', time:'2d ago', tag:'#ops' },
  ];

  function initFeed() {
    const el = document.getElementById('ct-scroll-feed');
    el.innerHTML = FEED_POSTS.map(p => `
      <div class="ct-card">
        <div class="ct-card-handle">${p.handle}</div>
        <div class="ct-card-body">${p.body}</div>
        <div class="ct-card-meta">${p.time} · <span style="color:var(--ct-acc2)">${p.tag}</span></div>
      </div>
    `).join('');
  }

  // ══════════════════════════════════════════════════════════════
  // PANEL: TO-DO
  // ══════════════════════════════════════════════════════════════
  let todos = [];

  function saveTodos() {
    Store.set({ ct_todos: todos });
    updateTodoBadge();
  }

  function updateTodoBadge() {
    const pending = todos.filter(t => !t.done).length;
    const badge = document.getElementById('ct-todo-badge');
    if (!badge) return;
    badge.textContent = pending;
    badge.style.display = pending > 0 ? 'flex' : 'none';
  }

  function renderTodos() {
    const el = document.getElementById('ct-scroll-todo');
    const done  = todos.filter(t => t.done).length;
    const total = todos.length;
    const pct   = total > 0 ? Math.round(done/total*100) : 0;

    el.innerHTML = `
      <div class="ct-row">
        <input class="ct-input" id="ct-todo-input" placeholder="Add task... [Enter]">
        <button class="ct-btn ct-btn-primary" id="ct-todo-add">+</button>
      </div>
      <div class="ct-progress">${done}/${total} tasks · ${pct}% complete</div>
      <div class="ct-progress-bar">
        <div class="ct-progress-fill" style="width:${pct}%"></div>
      </div>
      <div id="ct-todo-list">
        ${todos.length === 0 ? '<div style="color:var(--ct-dim);font-size:11px;text-align:center;padding:20px 0">No tasks yet.<br>Add one above.</div>' :
          todos.map((t, i) => `
            <div class="ct-todo-item${t.done?' done':''}" data-i="${i}">
              <div class="ct-todo-cb" data-cb="${i}">${t.done?'✓':''}</div>
              <div class="ct-todo-text">${escHtml(t.text)}</div>
              <button class="ct-todo-del" data-del="${i}">×</button>
            </div>
          `).join('')
        }
      </div>
    `;

    // Events
    const input = document.getElementById('ct-todo-input');
    input.addEventListener('keydown', e => { if(e.key==='Enter') addTodo(); });
    document.getElementById('ct-todo-add').addEventListener('click', addTodo);
    document.getElementById('ct-todo-list').addEventListener('click', e => {
      const cb  = e.target.closest('[data-cb]');
      const del = e.target.closest('[data-del]');
      if (cb)  { todos[+cb.dataset.cb].done = !todos[+cb.dataset.cb].done; saveTodos(); renderTodos(); }
      if (del) { todos.splice(+del.dataset.del, 1); saveTodos(); renderTodos(); }
    });

    function addTodo() {
      const val = input.value.trim();
      if (!val) return;
      todos.unshift({ text: val, done: false, id: Date.now() });
      input.value = '';
      saveTodos();
      renderTodos();
    }
  }

  function initTodo() {
    Store.get('ct_todos').then(d => {
      todos = d.ct_todos || [];
      renderTodos();
      updateTodoBadge();
    });
  }

  // ══════════════════════════════════════════════════════════════
  // PANEL: JOURNAL
  // ══════════════════════════════════════════════════════════════
  let journal     = {};
  let journalDate = todayKey();
  let autosaveTimer = null;

  function todayKey() {
    return new Date().toISOString().slice(0,10);
  }

  function dateDisplay(key) {
    const [y,m,d] = key.split('-');
    const months = ['JAN','FEB','MAR','APR','MAY','JUN','JUL','AUG','SEP','OCT','NOV','DEC'];
    return `${d} ${months[+m-1]} ${y}`;
  }

  function saveJournalEntry(text) {
    journal[journalDate] = text;
    Store.set({ ct_journal: journal });
    const el = document.getElementById('ct-journal-autosave');
    if (el) { el.textContent = '✓ autosaved'; setTimeout(()=>{ if(el) el.textContent=''; }, 2000); }
  }

  function renderJournal() {
    const el = document.getElementById('ct-scroll-journal');
    const sorted = Object.keys(journal).sort().reverse();

    el.innerHTML = `
      <div class="ct-journal-date-nav">
        <button class="ct-btn" id="ct-j-prev">◀</button>
        <div class="ct-date-display">${dateDisplay(journalDate)}</div>
        <button class="ct-btn" id="ct-j-next" ${journalDate >= todayKey() ? 'disabled style="opacity:.3"':''}>▶</button>
        <button class="ct-btn ct-btn-primary" id="ct-j-today">TODAY</button>
      </div>
      <textarea class="ct-journal-textarea" id="ct-journal-body" placeholder="Start writing...">${escHtml(journal[journalDate]||'')}</textarea>
      <div class="ct-journal-autosave" id="ct-journal-autosave"></div>
      ${sorted.length > 1 ? `
        <div class="ct-journal-history">
          <div class="ct-history-label">History</div>
          ${sorted.filter(k=>k!==journalDate).slice(0,5).map(k=>`
            <div class="ct-history-item" data-jdate="${k}">
              <span class="ct-history-date">${dateDisplay(k)}</span>
              <span class="ct-history-preview">${escHtml((journal[k]||'').slice(0,40))}…</span>
            </div>
          `).join('')}
        </div>
      ` : ''}
    `;

    const ta = document.getElementById('ct-journal-body');
    ta.addEventListener('input', () => {
      clearTimeout(autosaveTimer);
      autosaveTimer = setTimeout(() => saveJournalEntry(ta.value), 800);
    });

    document.getElementById('ct-j-prev').addEventListener('click', () => {
      const keys = Object.keys(journal).sort();
      const cur = keys.indexOf(journalDate);
      if (cur > 0) { journalDate = keys[cur-1]; renderJournal(); }
      else {
        // Go one day back from current
        const d = new Date(journalDate);
        d.setDate(d.getDate()-1);
        journalDate = d.toISOString().slice(0,10);
        renderJournal();
      }
    });

    document.getElementById('ct-j-next').addEventListener('click', () => {
      const d = new Date(journalDate);
      d.setDate(d.getDate()+1);
      const next = d.toISOString().slice(0,10);
      if (next <= todayKey()) { journalDate = next; renderJournal(); }
    });

    document.getElementById('ct-j-today').addEventListener('click', () => {
      journalDate = todayKey();
      renderJournal();
    });

    el.querySelectorAll('.ct-history-item').forEach(item => {
      item.addEventListener('click', () => {
        journalDate = item.dataset.jdate;
        renderJournal();
      });
    });
  }

  function initJournal() {
    Store.get('ct_journal').then(d => {
      journal = d.ct_journal || {};
      renderJournal();
    });
  }

  // ══════════════════════════════════════════════════════════════
  // PANEL: BOOKMARKS
  // ══════════════════════════════════════════════════════════════
  let bookmarks = [];

  function saveBookmarks() { Store.set({ ct_bookmarks: bookmarks }); }

  function renderBookmarks() {
    const el = document.getElementById('ct-scroll-bookmarks');
    const cats = [...new Set(bookmarks.map(b => b.cat || 'General'))];

    el.innerHTML = `
      <div class="ct-row">
        <button class="ct-btn ct-btn-primary" id="ct-bm-save-cur" style="flex:1">⊕ Save Current Page</button>
      </div>
      <div class="ct-row">
        <input class="ct-input" id="ct-bm-title-in" placeholder="Title (optional)">
      </div>
      <div class="ct-row">
        <input class="ct-input" id="ct-bm-cat-in" placeholder="Category (optional)">
      </div>
      ${bookmarks.length === 0 ? '<div style="color:var(--ct-dim);font-size:11px;text-align:center;padding:20px 0">No bookmarks yet.</div>' :
        cats.map(cat => `
          <div class="ct-bm-cat-label">${cat}</div>
          ${bookmarks.filter(b=>(b.cat||'General')===cat).map((b,_) => `
            <a class="ct-bm-item" href="${escHtml(b.url)}" target="_blank" data-bmid="${b.id}">
              <div class="ct-bm-icon">◈</div>
              <div class="ct-bm-info">
                <div class="ct-bm-title">${escHtml(b.title||b.url)}</div>
                <div class="ct-bm-url">${escHtml(shortUrl(b.url))}</div>
              </div>
              <button class="ct-bm-del" data-bmid="${b.id}">×</button>
            </a>
          `).join('')}
        `).join('')
      }
    `;

    document.getElementById('ct-bm-save-cur').addEventListener('click', () => {
      const titleIn = document.getElementById('ct-bm-title-in').value.trim();
      const catIn   = document.getElementById('ct-bm-cat-in').value.trim();
      const url     = window.location.href;
      const title   = titleIn || document.title || url;
      const cat     = catIn || 'General';
      bookmarks.unshift({ id: Date.now(), url, title, cat });
      saveBookmarks();
      renderBookmarks();
    });

    el.querySelectorAll('.ct-bm-del').forEach(btn => {
      btn.addEventListener('click', e => {
        e.preventDefault(); e.stopPropagation();
        const id = +btn.dataset.bmid;
        bookmarks = bookmarks.filter(b => b.id !== id);
        saveBookmarks();
        renderBookmarks();
      });
    });
  }

  function initBookmarks() {
    Store.get('ct_bookmarks').then(d => {
      bookmarks = d.ct_bookmarks || [];
      renderBookmarks();
    });
  }

  // ══════════════════════════════════════════════════════════════
  // PANEL: COMMS
  // ══════════════════════════════════════════════════════════════
  const COMMS = [
    { label:'Discord',      sub:'web.discord.com',          icon:'💬', url:'https://discord.com/app' },
    { label:'WhatsApp',     sub:'web.whatsapp.com',          icon:'📱', url:'https://web.whatsapp.com' },
    { label:'Outlook',      sub:'outlook.live.com',          icon:'✉',  url:'https://outlook.live.com' },
    { label:'Gmail',        sub:'mail.google.com',           icon:'◈',  url:'https://mail.google.com' },
    { label:'Telegram',     sub:'web.telegram.org',          icon:'⚡',  url:'https://web.telegram.org' },
    { label:'Linear',       sub:'linear.app',                icon:'◎',  url:'https://linear.app' },
    { label:'GitHub',       sub:'github.com',                icon:'⊕',  url:'https://github.com' },
    { label:'Notion',       sub:'notion.so',                 icon:'⬛',  url:'https://notion.so' },
  ];

  function initComms() {
    const el = document.getElementById('ct-scroll-comms');
    el.innerHTML = COMMS.map(c => `
      <a class="ct-comm-btn" href="${c.url}" target="_blank">
        <span class="ct-comm-icon">${c.icon}</span>
        <div>
          <div class="ct-comm-label">${c.label}</div>
          <div class="ct-comm-sub">${c.sub}</div>
        </div>
        <span class="ct-comm-arrow">→</span>
      </a>
    `).join('');
  }

  // ══════════════════════════════════════════════════════════════
  // PANEL: SYSTEM
  // ══════════════════════════════════════════════════════════════
  function initSystem() {
    const el = document.getElementById('ct-scroll-system');
    el.innerHTML = `
      <div class="ct-sys-block">
        <div class="ct-sys-label">Runtime</div>
        <div class="ct-stat-row"><span class="ct-stat-key">TIME</span>     <span class="ct-stat-val" id="ct-sys-time">--</span></div>
        <div class="ct-stat-row"><span class="ct-stat-key">DATE</span>     <span class="ct-stat-val" id="ct-sys-date">--</span></div>
        <div class="ct-stat-row"><span class="ct-stat-key">OPEN TABS</span><span class="ct-stat-val" id="ct-sys-tabs">--</span></div>
      </div>
      <div class="ct-sys-block">
        <div class="ct-sys-label">Memory</div>
        <div class="ct-stat-row"><span class="ct-stat-key">JS HEAP</span>  <span class="ct-stat-val" id="ct-sys-heap">--</span></div>
        <div class="ct-stat-bar"><div class="ct-stat-fill" id="ct-sys-heap-bar" style="width:0%"></div></div>
        <div class="ct-stat-row"><span class="ct-stat-key">HEAP LIMIT</span><span class="ct-stat-val" id="ct-sys-heap-lim">--</span></div>
      </div>
      <div class="ct-sys-block">
        <div class="ct-sys-label">Connection</div>
        <div class="ct-stat-row"><span class="ct-stat-key">ONLINE</span>   <span class="ct-stat-val" id="ct-sys-online">--</span></div>
        <div class="ct-stat-row"><span class="ct-stat-key">TYPE</span>     <span class="ct-stat-val" id="ct-sys-conntype">--</span></div>
        <div class="ct-stat-row"><span class="ct-stat-key">HOST</span>     <span class="ct-stat-val" id="ct-sys-host">--</span></div>
      </div>
    `;

    function updateSystem() {
      const now = new Date();
      const days   = ['SUN','MON','TUE','WED','THU','FRI','SAT'];
      const months = ['JAN','FEB','MAR','APR','MAY','JUN','JUL','AUG','SEP','OCT','NOV','DEC'];
      setText('ct-sys-time', [now.getHours(),now.getMinutes(),now.getSeconds()].map(n=>String(n).padStart(2,'0')).join(':'));
      setText('ct-sys-date', `${days[now.getDay()]} ${now.getDate()} ${months[now.getMonth()]} ${now.getFullYear()}`);

      if (performance.memory) {
        const used  = (performance.memory.usedJSHeapSize  / 1048576).toFixed(1);
        const total = (performance.memory.jsHeapSizeLimit  / 1048576).toFixed(0);
        const pct   = Math.round(performance.memory.usedJSHeapSize / performance.memory.jsHeapSizeLimit * 100);
        setText('ct-sys-heap', `${used} MB`);
        setText('ct-sys-heap-lim', `${total} MB`);
        const bar = document.getElementById('ct-sys-heap-bar');
        if (bar) bar.style.width = pct + '%';
      } else {
        setText('ct-sys-heap', 'N/A');
        setText('ct-sys-heap-lim', 'N/A');
      }

      setText('ct-sys-online', navigator.onLine ? '● ONLINE' : '○ OFFLINE');
      const conn = navigator.connection;
      setText('ct-sys-conntype', conn ? (conn.effectiveType || conn.type || '--').toUpperCase() : '--');
      setText('ct-sys-host', window.location.hostname || '--');
    }

    // Tab count via background
    chrome.runtime.sendMessage({ action: 'get-tab-count' }, resp => {
      if (resp) setText('ct-sys-tabs', resp.count);
    });

    updateSystem();
    setInterval(updateSystem, 3000);
  }

  // ══════════════════════════════════════════════════════════════
  // PANEL: QUICK LINKS / EXTENSIONS
  // ══════════════════════════════════════════════════════════════
  function initLinks() {
    const el = document.getElementById('ct-scroll-links');
    el.innerHTML = `<div style="color:var(--ct-dim);font-size:11px;margin-bottom:8px">Loading extensions…</div>`;

    chrome.runtime.sendMessage({ action: 'get-extensions' }, resp => {
      if (!resp || !resp.exts) {
        el.innerHTML = `<div style="color:var(--ct-dim);font-size:11px">Could not load extensions.</div>`;
        return;
      }
      const exts = resp.exts.filter(e => e.type === 'extension' && e.id !== chrome.runtime.id);
      el.innerHTML = `
        <div style="color:var(--ct-dim);font-size:9px;letter-spacing:0.12em;margin-bottom:8px">${exts.length} EXTENSIONS INSTALLED</div>
        ${exts.map(e => `
          <div class="ct-ext-item">
            <div class="ct-ext-dot ${e.enabled?'enabled':'disabled'}"></div>
            <div class="ct-ext-name" title="${escHtml(e.name)}">${escHtml(e.shortName||e.name)}</div>
            <div style="font-size:9px;color:var(--ct-dim)">${e.version}</div>
          </div>
        `).join('')}
      `;
    });
  }

  // ══════════════════════════════════════════════════════════════
  // SETTINGS LISTENER
  // ══════════════════════════════════════════════════════════════
  window.addEventListener('ct-settings-changed', (e) => {
    const s = e.detail;
    const root = document.getElementById('ct-root');
    if (!root) return;
    root.classList.toggle('ct-flicker',     !!s.ct_flicker);
    root.classList.toggle('ct-no-scanlines', !s.ct_scanlines);
  });

  // ══════════════════════════════════════════════════════════════
  // KEYBOARD PANEL SWITCHING
  // ══════════════════════════════════════════════════════════════
  window.addEventListener('ct-open-panel', (e) => {
    switchPanel(e.detail.panel);
  });

  // ══════════════════════════════════════════════════════════════
  // UTILITY
  // ══════════════════════════════════════════════════════════════
  function escHtml(str) {
    return String(str||'')
      .replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;')
      .replace(/"/g,'&quot;').replace(/'/g,'&#39;');
  }

  function shortUrl(url) {
    try { return new URL(url).hostname; } catch { return url; }
  }

  function setText(id, val) {
    const el = document.getElementById(id);
    if (el) el.textContent = val;
  }

  // ══════════════════════════════════════════════════════════════
  // INIT
  // ══════════════════════════════════════════════════════════════
  async function init() {
    const data = await Store.get(['ct_theme','ct_flicker','ct_scanlines']);

    const root = buildSidebar();

    // Apply flicker/scanline classes from stored settings
    root.classList.toggle('ct-flicker',      !!data.ct_flicker);
    root.classList.toggle('ct-no-scanlines',  !data.ct_scanlines);

    initNav();
    initClock();
    initFeed();
    initTodo();
    initJournal();
    initBookmarks();
    initComms();
    initSystem();
    initLinks();
  }

  if (document.body) {
    init();
  } else {
    document.addEventListener('DOMContentLoaded', init);
  }

})();
