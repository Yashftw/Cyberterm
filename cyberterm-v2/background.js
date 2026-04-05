/* ================================================================
   CYBERTERM OS — background.js
   Service worker: keyboard shortcuts, install, messaging
   ================================================================ */

// ── INSTALL DEFAULTS ─────────────────────────────────────────
chrome.runtime.onInstalled.addListener(() => {
  chrome.storage.local.set({
    ct_enabled:    true,
    ct_theme:      'amber',
    ct_scanlines:  true,
    ct_flicker:    false,
    ct_glow:       'medium',
    ct_sidebar:    true,
    ct_todos:      [],
    ct_bookmarks:  [],
    ct_journal:    {},
  });
});

// ── KEYBOARD COMMANDS ────────────────────────────────────────
chrome.commands.onCommand.addListener(async (command) => {
  const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
  const tab = tabs[0];
  if (!tab) return;

  if (command === 'toggle-theme') {
    const data = await chrome.storage.local.get('ct_enabled');
    const newVal = !data.ct_enabled;
    await chrome.storage.local.set({ ct_enabled: newVal });
    notifyTab(tab.id, { action: 'toggle-theme', value: newVal });
  }

  if (command === 'open-journal') {
    notifyTab(tab.id, { action: 'open-panel', panel: 'journal' });
  }

  if (command === 'open-todo') {
    notifyTab(tab.id, { action: 'open-panel', panel: 'todo' });
  }
});

// ── TAB COUNT ────────────────────────────────────────────────
async function getTabCount() {
  const tabs = await chrome.tabs.query({});
  return tabs.length;
}

// ── MESSAGE HANDLER ──────────────────────────────────────────
chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  if (msg.action === 'get-tab-count') {
    getTabCount().then(count => sendResponse({ count }));
    return true; // async
  }

  if (msg.action === 'get-extensions') {
    chrome.management.getAll(exts => sendResponse({ exts }));
    return true;
  }
});

function notifyTab(tabId, msg) {
  chrome.tabs.sendMessage(tabId, msg).catch(() => {});
}
