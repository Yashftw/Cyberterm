# CyberTerm OS — Productivity Dashboard Extension v2.0

> A unified cyberpunk CRT-style productivity overlay injected into every browser tab.
> Sidebar with Feed, To-Do, Journal, Bookmarks, Comms, System Stats, and Extension Manager.

---

## Features

### Theme Engine
- **3 themes:** Amber (warm CRT), Green Terminal, Blue Neon
- **Live switching** — no reload required
- Stored in `chrome.storage.local`

### Visual Effects
- Scanlines CRT overlay
- CRT flicker animation (optional)
- Glow intensity: LOW / MED / HIGH
- Scrollbar restyle on all pages

### Sidebar (injected into every tab)
| Panel | Feature |
|-------|---------|
| **Feed** | Placeholder activity cards with retro styling |
| **To-Do** | Add/check/delete tasks, progress bar, badge count, persisted |
| **Journal** | Daily text editor, autosave, date nav, history log |
| **Bookmarks** | Save current URL, categorize, persist, open in tab |
| **Comms** | One-click launchers: Discord, WhatsApp, Gmail, Outlook, Telegram, Notion, GitHub, Linear |
| **System** | JS heap memory, tab count, connection type, hostname, live clock |
| **Extensions** | Lists all installed browser extensions with status |

### New Tab Page
- Full dashboard with search bar, feed, mini todo, mini bookmarks, system stats
- Theme switcher in topbar
- Full keyboard navigation (`↑↓` / `j k`, `/` for search)

### Keyboard Shortcuts
| Shortcut | Action |
|----------|--------|
| `Ctrl+Shift+Y` | Toggle extension on/off |
| `Ctrl+J` | Open Journal panel |
| `Ctrl+Shift+T` | Open To-Do panel |

---

## Installation in Brave

1. **Unzip** the `cyberterm-v2` folder somewhere permanent (e.g. `~/extensions/cyberterm-v2`)
2. Open Brave → go to `brave://extensions`
3. Enable **Developer mode** (toggle, top right)
4. Click **Load unpacked**
5. Select the `cyberterm-v2/` folder
6. Pin the CyberTerm icon from the extensions toolbar

---

## File Structure

```
cyberterm-v2/
├── manifest.json          ← MV3 config, permissions, shortcuts
├── background.js          ← Service worker: keyboard commands, tab count, extension list
├── content.js             ← Injected into all pages: applies theme + loads sidebar
├── sidebar.js             ← Full sidebar UI: all 7 panels, storage, events
├── popup.html / popup.js  ← Toolbar popup: settings, theme switcher, toggles
├── newtab.html            ← Custom new tab page dashboard
├── styles/
│   ├── theme.css          ← CSS variable themes (amber/green/blue)
│   ├── sidebar.css        ← Sidebar component styles (namespaced #ct-root)
│   └── overlay.css        ← Host page overlay: scrollbars, scanlines
└── icons/
    ├── icon16.png
    ├── icon48.png
    └── icon128.png
```

---

## Customization

### Add a theme
In `styles/theme.css`, add a new `[data-ct-theme="mytheme"]` block with the variables.
Then add the button in `popup.html` and `newtab.html`.

### Add a sidebar panel
1. Add entry to `PANELS` array in `sidebar.js`
2. Add `initMyPanel()` function
3. Call it in `init()`

### Change comms launchers
Edit the `COMMS` array in `sidebar.js`.

---

## Performance Notes

- Sidebar CSS is namespaced under `#ct-root` — zero bleed to host pages
- Theme CSS only touches `:root` variables and `[data-ct-active]` scoped rules
- Sidebar is lazy-loaded (injected once on first activation)
- Animations are CSS-only and togglable
- No heavy DOM manipulation on host page — only `margin-left` push

---

## Compatibility
- ✅ Brave Browser
- ✅ Google Chrome  
- ✅ Microsoft Edge
- ✅ Any Chromium MV3 browser
