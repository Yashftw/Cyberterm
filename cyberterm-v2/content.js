/* ================================================================
   CYBERTERM OS — content.js
   Injects theme stylesheets and bootstraps the sidebar
   Stability-first: uses shadow DOM isolation for sidebar,
   only touches host page for scrollbars + scanlines
   ================================================================ */

(function () {
  'use strict';
  if (window.__ctInjected) return;
  window.__ctInjected = true;

  // ── INJECT STYLESHEET LINKS ─────────────────────────────────
  function injectLink(href, id) {
    if (document.getElementById(id)) return;
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.type = 'text/css';
    link.href = href;
    link.id = id;
    (document.head || document.documentElement).appendChild(link);
  }

  let settings = {
    ct_enabled:   true,
    ct_theme:     'amber',
    ct_scanlines: true,
    ct_flicker:   false,
    ct_glow:      'medium',
    ct_sidebar:   true,
  };

  // ── APPLY HTML ATTRIBUTES & CLASSES ─────────────────────────
  function applyPageState() {
    const html = document.documentElement;

    if (!settings.ct_enabled) {
      html.removeAttribute('data-ct-active');
      html.removeAttribute('data-ct-theme');
      html.removeAttribute('data-ct-scanlines');
      document.body?.classList.remove('ct-pushed');
      hideSidebar();
      return;
    }

    // Theme variables injection
    injectLink(chrome.runtime.getURL('styles/theme.css'), 'ct-theme-css');
    injectLink(chrome.runtime.getURL('styles/overlay.css'), 'ct-overlay-css');

    html.setAttribute('data-ct-active', 'true');
    html.setAttribute('data-ct-theme', settings.ct_theme);
    html.setAttribute('data-ct-scanlines', String(settings.ct_scanlines));

    if (settings.ct_sidebar) {
      showSidebar();
    } else {
      hideSidebar();
    }
  }

  // ── SIDEBAR MANAGEMENT ──────────────────────────────────────
  let sidebarMounted = false;

  function showSidebar() {
    if (!sidebarMounted) {
      loadSidebar();
    } else {
      const root = document.getElementById('ct-root');
      if (root) {
        root.classList.remove('ct-hidden');
        document.body?.classList.add('ct-pushed');
        document.body?.classList.remove('ct-sidebar-hidden');
      }
    }
  }

  function hideSidebar() {
    const root = document.getElementById('ct-root');
    if (root) {
      root.classList.add('ct-hidden');
      document.body?.classList.add('ct-sidebar-hidden');
    }
    document.body?.classList.remove('ct-pushed');
  }

  function loadSidebar() {
    // Inject sidebar CSS
    injectLink(chrome.runtime.getURL('styles/sidebar.css'), 'ct-sidebar-css');

    const script = document.createElement('script');
    script.src = chrome.runtime.getURL('sidebar.js');
    script.onload = () => {
      sidebarMounted = true;
      document.body?.classList.add('ct-pushed');
    };
    (document.head || document.documentElement).appendChild(script);
  }

  // ── STORAGE LISTENER ────────────────────────────────────────
  chrome.storage.onChanged.addListener((changes) => {
    let changed = false;
    for (const key of Object.keys(changes)) {
      if (key in settings) {
        settings[key] = changes[key].newValue;
        changed = true;
      }
    }
    if (changed) applyPageState();

    // Forward to sidebar
    if (window.__ctSidebarLoaded) {
      window.dispatchEvent(new CustomEvent('ct-settings-changed', { detail: settings }));
    }
  });

  // ── BACKGROUND MESSAGES ─────────────────────────────────────
  chrome.runtime.onMessage.addListener((msg) => {
    if (msg.action === 'toggle-theme') {
      settings.ct_enabled = msg.value;
      applyPageState();
    }
    if (msg.action === 'open-panel' && window.__ctSidebarLoaded) {
      window.dispatchEvent(new CustomEvent('ct-open-panel', { detail: { panel: msg.panel } }));
    }
  });

  // ── INIT ────────────────────────────────────────────────────
  chrome.storage.local.get(
    ['ct_enabled', 'ct_theme', 'ct_scanlines', 'ct_flicker', 'ct_glow', 'ct_sidebar'],
    (data) => {
      Object.assign(settings, data);
      if (document.body) {
        applyPageState();
      } else {
        document.addEventListener('DOMContentLoaded', applyPageState);
      }
    }
  );

})();
