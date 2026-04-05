# CyberSpace Browser Layer

CyberSpace is a Brave extension that transforms your browser into a focused, terminal-style workspace. It replaces passive browsing with an interactive system built for productivity.

---

## What It Does

CyberSpace turns your browser into a control center.

You work inside a single interface. No tab chaos. No context switching.

You get:

- A unified dashboard
- Built-in productivity tools
- Persistent state across sessions
- A fast workflow
- A terminal-inspired UI

---



## Core Features

### Search Engine Override
- Type queries directly
- Results render inside the interface
- No tab switching

### Navigation System
- Sidebar-based layout
- Instant panel switching
- No reloads

### To-Do Manager
- Add, complete, delete tasks
- Stored with local storage
- Persists after restart

### Journal
- Auto-save notes
- Daily logging

### AI Hub
- ChatGPT
- Claude
- Gemini
- Custom tools

### System Monitor
- Active tab count
- Approx memory usage
- Live date and time

### Quick Access
- Frequently visited sites
- Chrome top sites integration

---

## UI System


[ Sidebar ] | [ Main Panel ]
| -------------------------------
| Dynamic Content Rendering Area
| (Search, Tasks, Journal, etc.)


- Full-width layout
- No wasted space
- Fast switching

---

## Theme Engine

- Terminal-inspired design
- CSS variable system
- Dynamic theme switching

Themes:
- Amber
- Green
- Blue

---

## Tech Stack

- Manifest V3
- JavaScript
- Chrome APIs:
  - storage
  - tabs
  - topSites
  - management

---

## Data Flow


User Action
|
v
UI Component
|
v
State Update
|
v
chrome.storage.local
|
v
Persistent Data


---

## Installation

1. Open Brave  
2. Go to brave://extensions  
3. Enable Developer Mode  
4. Click Load unpacked  
5. Select project folder  

---

## Why This Exists

Modern browsing breaks focus.

CyberSpace turns your browser into a workspace.
