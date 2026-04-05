/* ================================================================
   CYBERTERM OS — popup.js
   All settings wired to chrome.storage.local + live theme preview
   ================================================================ */

const $ = id => document.getElementById(id);

// ── LOAD ────────────────────────────────────────────────────
chrome.storage.local.get(
  ['ct_enabled','ct_theme','ct_scanlines','ct_flicker','ct_glow','ct_sidebar'],
  (d) => {
    $('togEnabled').checked   = d.ct_enabled  !== false;
    $('togScanlines').checked = d.ct_scanlines !== false;
    $('togFlicker').checked   = !!d.ct_flicker;
    $('togSidebar').checked   = d.ct_sidebar  !== false;

    setStatus(d.ct_enabled !== false);
    setActiveTheme(d.ct_theme  || 'amber');
    setActiveGlow(d.ct_glow    || 'medium');
    applyThemePreview(d.ct_theme || 'amber');
  }
);

// ── ENABLED ──────────────────────────────────────────────────
$('togEnabled').addEventListener('change', () => {
  const v = $('togEnabled').checked;
  chrome.storage.local.set({ ct_enabled: v });
  setStatus(v);
});

$('masterRow').addEventListener('click', e => {
  if (e.target.closest('.tog')) return;
  $('togEnabled').checked = !$('togEnabled').checked;
  $('togEnabled').dispatchEvent(new Event('change'));
});

function setStatus(on) {
  const el = $('statusText');
  el.textContent = on ? 'ENABLED' : 'DISABLED';
  el.style.color = on ? 'var(--acc)' : 'var(--dim)';
}

// ── TOGGLES ──────────────────────────────────────────────────
$('togScanlines').addEventListener('change', () => chrome.storage.local.set({ ct_scanlines: $('togScanlines').checked }));
$('togFlicker').addEventListener('change',   () => chrome.storage.local.set({ ct_flicker:   $('togFlicker').checked   }));
$('togSidebar').addEventListener('change',   () => chrome.storage.local.set({ ct_sidebar:   $('togSidebar').checked   }));

// ── THEMES ───────────────────────────────────────────────────
document.querySelectorAll('.th-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    const t = btn.dataset.theme;
    chrome.storage.local.set({ ct_theme: t });
    setActiveTheme(t);
    applyThemePreview(t);
  });
});

function setActiveTheme(t) {
  document.querySelectorAll('.th-btn').forEach(b => b.classList.toggle('active', b.dataset.theme === t));
}

function applyThemePreview(t) {
  document.body.setAttribute('data-theme', t);
}

// ── GLOW ─────────────────────────────────────────────────────
document.querySelectorAll('.gl-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    const g = btn.dataset.glow;
    chrome.storage.local.set({ ct_glow: g });
    setActiveGlow(g);
  });
});

function setActiveGlow(g) {
  document.querySelectorAll('.gl-btn').forEach(b => b.classList.toggle('active', b.dataset.glow === g));
}
