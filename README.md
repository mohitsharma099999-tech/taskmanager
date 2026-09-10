# ✅ Task Manager

A modern, responsive task-management web app built with **vanilla JavaScript (ES modules)**, **HTML5**, **CSS3**, and a **REST API** — with full local persistence, live filtering, and reusable UI components.

> 🔗 **Live Demo:** https://https://github.com/mohitsharma099999-tech/taskmanager/

---



## ✨ Features

### Core
- ➕ **Create tasks** with title, description, status, priority, and due date
- ✏️ **Edit** any task inline — form switches into edit mode
- 🗑️ **Delete** tasks with confirmation
- ✅ **Toggle status** quickly via checkbox (auto-marks as Done)

### Organization
- 🔍 **Live search** across title & description (debounced)
- 🎛️ **Filter** by status (To Do / In Progress / Done) and priority (Low / Medium / High)
- ↕️ **Sort** by newest, oldest, due date, or priority
- 📊 **Stats dashboard** — live counters for each status

### UX & Reliability
- ⏳ **Loading spinner** while fetching from the API
- ⚠️ **Error banner with Retry** button on network failure
- 💾 **localStorage persistence** — data survives refresh
- 📱 **Fully responsive** — works on mobile, tablet, desktop
- 🎨 **Overdue highlighting** on due dates
- 🛡️ **XSS-safe** — all user input is escaped before rendering
- 🌐 **Offline-friendly** — gracefully falls back to local storage

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| Markup | HTML5 (semantic) |
| Styling | CSS3 (Grid, Flexbox, custom properties, animations) |
| Logic | JavaScript ES2022+ (ES Modules, async/await) |
| API | [JSONPlaceholder](https://jsonplaceholder.typicode.com/) (demo REST endpoint) |
| Storage | `localStorage` |
| Deploy | GitHub Pages |

**No frameworks. No build step. No dependencies.** 🎉

---

## 📁 Project Structure

```
task-manager/
├── index.html              # App shell & markup
├── css/
│   └── style.css           # All styles, responsive, themable
├── js/
│   ├── api.js              # REST API layer (fetch + timeout + fallback)
│   ├── store.js            # State management + localStorage persistence
│   ├── ui.js               # Reusable UI components (TaskCard, stats, status)
│   ├── validation.js       # Form validation rules
│   └── app.js              # Main entry — wires everything together
├── .nojekyll               # Tells GitHub Pages to skip Jekyll processing
└── README.md
```

### Module responsibilities

| File | Responsibility |
|---|---|
| **`api.js`** | Network calls. Wraps `fetch` with timeout + abort. Maps API data → app model. |
| **`store.js`** | Single source of truth. Handles CRUD, filters, subscribe/emit, persistence. |
| **`ui.js`** | Pure render functions. `TaskCard()`, `renderTaskList()`, `renderStats()`, `setLoading()`, `showError()`. |
| **`validation.js`** | Validates task drafts. Returns `{ valid, errors }`. |
| **`app.js`** | Entry point. Binds DOM events, subscribes to store, orchestrates load/save. |

---

## 🚀 Getting Startedhttps://github.com/mohitsharma099999-tech

### Prerequisites
- A modern browser (Chrome, Firefox, Safari, Edge)
- **A local HTTP server** — ES modules **do not** work over `file://`

### Run locally

```bash
# Clone
git clone https://github.com/mohitsharma099999-tech/taskmanager.git
cd task-manager

# Serve (pick one)
python -m http.server 8080          # Python 3
npx serve .                         # Node
php -S localhost:8080               # PHP
```

Then open **http://localhost:8080**

> ⚠️ **Do not** double-click `index.html`. Modules need HTTP(S).

---

## 🌐 Deploy to GitHub Pages

1. Push this repo to GitHub (Public)
2. **Settings → Pages → Source:** `Deploy from a branch`
3. **Branch:** `main` · **Folder:** `/ (root)` → **Save**
4. Wait ~60 s → live at:

```
https://https://github.com/mohitsharma099999-tech/taskmanager/
```

### Optional: GitHub Actions auto-deploy

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy to GitHub Pages
on:
  push: { branches: [main] }
  workflow_dispatch:
permissions:
  contents: read
  pages: write
  id-token: write
concurrency:
  group: pages
  cancel-in-progress: true
jobs:
  deploy:
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/configure-pages@v4
      - uses: actions/upload-pages-artifact@v3
        with: { path: '.' }
      - id: deployment
        uses: actions/deploy-pages@v4
```

Then set **Settings → Pages → Source** to **GitHub Actions**.

---

## 📖 Usage

| Action | How |
|---|---|
| **Add a task** | Fill the form → click **Add Task** |
| **Edit a task** | Click ✏️ on the task card → form fills → **Save Changes** |
| **Delete a task** | Click 🗑️ → confirm |
| **Mark done** | Tick the checkbox |
| **Search** | Type in the 🔍 search box (150 ms debounce) |
| **Filter** | Use the status/priority dropdowns |
| **Sort** | Choose from the sort dropdown |
| **Clear filters** | Click **Clear** |
| **Retry API** | Click **Retry** in the error banner |

---

## 🧠 Architecture Overview

```
┌──────────────┐     events      ┌───────────────┐
│   app.js     │ ───────────────▶│   store.js    │
│  (wiring)    │                 │  (state)      │
└──────┬───────┘                 └───────┬───────┘
       │ calls                           │ notify
       ▼                                 ▼
┌──────────────┐                 ┌───────────────┐
│   api.js     │                 │    ui.js      │
│  (REST)      │                 │  (render)     │
└──────────────┘                 └───────────────┘
```

**Data flow:**
1. UI event → `app.js`
2. `app.js` calls `api.js` (async) → on success updates `store.js`
3. `store.emit()` → subscribers (`app.js` `render()`) → `ui.js` re-renders
4. `store.persist()` writes to `localStorage`

**Why this pattern?**
- Single source of truth (`store`)
- Async boundary isolated (`api`)
- Rendering is pure and reusable (`ui`)
- Entry point stays readable (`app`)

---

## 🎨 Customization

### Change the API endpoint
Edit `BASE_URL` in `js/api.js`:

```js
const BASE_URL = 'https://your-api.com';
```

### Change colors / theme
All colors live in CSS custom properties in `css/style.css`:

```css
:root {
  --primary: #4f46e5;
  --danger:  #ef4444;
  --success: #10b981;
  /* ... */
}
```

### Add a new status
1. Add `<option>` in `index.html` (both filters + form)
2. Add a CSS badge class `.badge.status-yourstatus`
3. Add label in `ui.js` → `statusLabel`

### Add a new priority
Same as above — add option + CSS + `priorityWeight` in `store.js`.

---

## 🧪 Testing Checklist

- [ ] Add a task → appears at top of list
- [ ] Refresh page → task still there (localStorage)
- [ ] Edit a task → form title changes to "Edit Task"
- [ ] Delete a task → confirm → removed
- [ ] Tick checkbox → status becomes "Done" with strikethrough
- [ ] Search narrows the list live
- [ ] Status + priority filters combine correctly
- [ ] Sort options reorder the list
- [ ] Disconnect network → refresh → error banner shows with Retry
- [ ] Resize browser → layout adapts on mobile

---

## 🐛 Troubleshooting

| Problem | Solution |
|---|---|
| Blank page | Open DevTools → Console → check for 404s |
| `CORS error` / module failed to load | You opened `file://`. Use a local server. |
| Changes don't save | Check localStorage isn't disabled (private mode) |
| Stale version showing | Hard refresh: `Ctrl+Shift+R` / `Cmd+Shift+R` |
| Styles missing | Confirm `css/style.css` path is lowercase |
| 404 on GitHub Pages | `index.html` must be at repo **root** |

---

## 🗺️ Roadmap

- [ ] 🌙 Dark mode toggle
- [ ] 🏷️ Tags & tag filtering
- [ ] 📌 Pin/favorite tasks
- [ ] 📅 Calendar view
- [ ] 📤 Export/import JSON
- [ ] 🔔 Due-date notifications
- [ ] 🔀 Drag & drop reordering
- [ ] ☁️ Supabase / Firebase backend for cross-device sync
- [ ] 📱 PWA (installable + offline)

---

## 🤝 Contributing

1. Fork the repo
2. Create a branch: `git checkout -b feature/my-feature`
3. Commit: `git commit -m "Add my feature"`
4. Push: `git push origin feature/my-feature`
5. Open a Pull Request

Please keep code modular and match existing style.

---

## 📄 License

This project is licensed under the **MIT License** — free to use, modify, and distribute.

```
MIT License

Copyright (c) 2025 YOUR-NAME

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```

---

## 🙏 Acknowledgements

- **[JSONPlaceholder](https://jsonplaceholder.typicode.com/)** — free fake REST API for prototyping
- **[GitHub Pages](https://pages.github.com/)** — free static hosting
- Icons via native emoji — no icon library needed

---

## 📬 Contact


🔗 GitHub: [@mohitsharma099999-tech](https://github.com/mohitsharma099999-tech)  
✉️ Email: mohitsharma099999@gmail.com

---

<p align="center">
  Built with ❤️ and vanilla JavaScript — no frameworks, no build step.
</p>
