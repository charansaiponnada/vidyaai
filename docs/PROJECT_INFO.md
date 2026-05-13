# VidyaAI — Complete Project Info & Setup Guide

> Adaptive AI Tutor | ElevateX Hackathon 2026
> "Learn anything, in your language."

---

## Project Summary

**Name:** VidyaAI
**Tagline:** Learn anything, in your language
**Track:** Education & Learning + Social Impact & Inclusion
**Built with:** React 18, Vite, Recharts, Google Gemini 2.0 Flash API
**Lines of code:** ~1,600
**Build time:** < 7 seconds (`npm run build`)

---

## File Structure (Complete)

```
vidyaai/
│
├── index.html                  ← HTML entry point (Vite root)
├── package.json                ← npm dependencies and scripts
├── vite.config.js              ← Vite + React plugin config
│
└── src/
    ├── main.jsx                ← ReactDOM.createRoot → mounts <App />
    ├── App.jsx                 ← Root: nav, tabs, shared state
    ├── gemini.js               ← All Gemini API call functions
    ├── index.css               ← CSS variables, animations, scrollbar
    │
    └── components/
        ├── SetupScreen.jsx     ← Onboarding screen
        ├── LearnTab.jsx        ← Feature 1: Adaptive explanation
        ├── QuizTab.jsx         ← Feature 2: Adaptive quiz engine
        ├── HeatmapTab.jsx      ← Feature 3: Knowledge gap heatmap
        ├── TranslateTab.jsx    ← Feature 4: Translate & simplify
        └── InsightsTab.jsx     ← Feature 5: Learning insights
```

---

## Setup Instructions

### Prerequisites
- Node.js v18 or higher
- npm v9 or higher
- A free Gemini API key (get at https://aistudio.google.com/apikey)

### Step 1 — Create the project folder

```bash
mkdir vidyaai
cd vidyaai
mkdir -p src/components
```

### Step 2 — Create each file

Copy the content of each file below into the correct path.

**Root files:**
- `index.html` → project root
- `package.json` → project root
- `vite.config.js` → project root

**Source files (inside `src/`):**
- `src/main.jsx`
- `src/App.jsx`
- `src/gemini.js`
- `src/index.css`

**Component files (inside `src/components/`):**
- `src/components/SetupScreen.jsx`
- `src/components/LearnTab.jsx`
- `src/components/QuizTab.jsx`
- `src/components/HeatmapTab.jsx`
- `src/components/TranslateTab.jsx`
- `src/components/InsightsTab.jsx`

### Step 3 — Install dependencies

```bash
npm install
```

This installs:
- `react` + `react-dom` — UI framework
- `recharts` — Radar chart in heatmap
- `axios` — (available, used optionally)
- `vite` + `@vitejs/plugin-react` — build tooling

### Step 4 — Run the dev server

```bash
npm run dev
```

Opens at: `http://localhost:5173`

### Step 5 — Build for production

```bash
npm run build
```

Output goes to `dist/` folder. Deploy this folder to Vercel, Netlify, or GitHub Pages.

---

## Deploying to Vercel (Free, 1 minute)

```bash
npm install -g vercel
vercel
# Follow the prompts — framework: Vite, output: dist
```

Or drag the `dist/` folder to https://vercel.com/new

---

## Deploying to Netlify (Free)

```bash
npm run build
# Drag and drop the dist/ folder to https://app.netlify.com/drop
```

---

## package.json

```json
{
  "name": "vidyaai",
  "version": "1.0.0",
  "private": true,
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "recharts": "^2.10.3",
    "axios": "^1.6.2"
  },
  "devDependencies": {
    "@vitejs/plugin-react": "^4.2.1",
    "vite": "^5.0.8"
  },
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview"
  }
}
```

---

## vite.config.js

```js
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
})
```

---

## index.html

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>VidyaAI — Adaptive Tutor</title>
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
    <link href="https://fonts.googleapis.com/css2?family=Sora:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;600&display=swap" rel="stylesheet" />
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.jsx"></script>
  </body>
</html>
```

---

## src/main.jsx

```jsx
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
)
```

---

## Gemini API — How it's used

All Gemini calls are in `src/gemini.js`.

**Endpoint:**
```
POST https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=API_KEY
```

**5 functions exported:**

| Function | Used in | What it does |
|---|---|---|
| `explainTopic()` | LearnTab | Explains a topic in chosen language + style |
| `generateQuizQuestion()` | QuizTab | Returns MCQ as JSON at given difficulty |
| `translateAndSimplify()` | TranslateTab | Translates + simplifies to regional language |
| `detectLearningInsight()` | InsightsTab | AI feedback based on quiz history |
| `getSuggestedTopics()` | LearnTab | Returns 8 subtopics for a subject as JSON array |

**Getting your API key:**
1. Go to https://aistudio.google.com/apikey
2. Sign in with Google
3. Click "Create API Key"
4. Copy the key starting with `AIza...`
5. Paste it in the VidyaAI setup screen

The key is stored only in React state (memory) — never saved to disk or localStorage.

---

## Features Explained

### 🧠 Feature 1 — Adaptive Explanation (LearnTab)
- Enter any topic → choose learning style → choose difficulty
- **5 learning styles:** Examples, Story, Steps, Simple, Visual
- **3 difficulty levels:** Beginner, Intermediate, Advanced
- AI responds in your language (English/Telugu/Hindi/Tamil)
- 8 suggested topics auto-loaded for your subject

### 🎯 Feature 2 — Adaptive Quiz (QuizTab)
- MCQ questions generated at current difficulty level
- **Adaptive logic:**
  - 2 correct answers in a row → difficulty increases
  - Wrong answer → difficulty decreases
- Shows correct answer + explanation after each question
- Tracks: questions count, accuracy %, streak, correct count

### 📊 Feature 3 — Knowledge Heatmap (HeatmapTab)
- Visual map of every topic you've touched
- **4 strength levels:** Strong (≥75%), Medium (45–74%), Weak (<45%), Not quizzed
- Radar chart (Recharts) shows your overall knowledge shape
- Updates live as you learn + quiz

### 🌐 Feature 4 — Translate & Simplify (TranslateTab)
- Paste any educational text in English
- Choose target language: Telugu / Hindi / Tamil / English
- AI translates naturally AND simplifies for rural comprehension
- 3 sample texts pre-loaded for quick demo

### ✨ Feature 5 — Learning Insights (InsightsTab)
- Inferred learning profile: Quick Learner / Steady / Needs Practice
- Topic-wise accuracy bar chart
- AI-generated personalised feedback in your language
- Encourages focus on weak topics

---

## State Management

All state lives in `App.jsx` and flows down as props:

```
App.jsx
├── config         { apiKey, name, subject, language }
├── learnedTopics  string[]   — topics explained in LearnTab
└── quizHistory    { topic, correct }[]  — all quiz answers
```

- `learnedTopics` feeds into HeatmapTab and InsightsTab
- `quizHistory` feeds into HeatmapTab, InsightsTab, QuizTab stats
- Both reset when user clicks "Exit" (back to setup screen)

---

## Design Decisions

| Decision | Reason |
|---|---|
| Dark theme (#07070f background) | Reduces eye strain for long study sessions |
| Sora font (body) | Clean, modern, readable at all sizes |
| JetBrains Mono (numbers) | Makes stats/scores feel precise and technical |
| CSS variables for all colors | Easy theme changes; consistent across 6 components |
| Inline React styles | No extra CSS file per component; easy to read |
| No Redux / Zustand | State is simple enough for prop drilling — keeps it lean |
| Native fetch() over Axios | Fewer bytes; Gemini API is simple REST |
| Recharts over D3 | Much faster to build for hackathon |

---

## Common Issues & Fixes

| Issue | Fix |
|---|---|
| "Gemini API error" on quiz | Check API key is valid. Make sure it's for Gemini, not Maps |
| JSON parse error on quiz | Gemini sometimes wraps in markdown — the code strips ```json already |
| Blank explanation | Topic may be too vague — try "Photosynthesis" or "Newton's first law" |
| Radar chart not showing | Need ≥3 topics in heatmap — learn and quiz a few topics first |
| CORS error | You're calling Gemini directly from browser — this is supported by Google for Gemini |
| Font not loading | Need internet connection — fonts load from Google Fonts CDN |

---

## GitHub Push Commands

```bash
cd vidyaai
git init
git add .
git commit -m "VidyaAI MVP — ElevateX Hackathon 2026"
git remote add origin https://github.com/YOUR_USERNAME/vidyaai.git
git push -u origin main
```

---

## Team Roles (Suggested split for hackathon day)

| Role | Member | Owns |
|---|---|---|
| Frontend Lead | Member 1 | App.jsx, SetupScreen, global CSS |
| AI Integration | Member 2 | gemini.js, LearnTab, TranslateTab |
| Quiz & Adaptive | Member 3 | QuizTab, InsightsTab |
| Data & Design | Member 4 | HeatmapTab, Recharts, UI polish |

---

## Presentation Checklist

- [ ] App is running on localhost OR deployed on Vercel
- [ ] Gemini API key is entered and tested
- [ ] Demo flow rehearsed: Learn → Quiz → Heatmap → Translate → Insights
- [ ] Telugu explanation screenshot ready as backup
- [ ] Projector/screen resolution tested (1920x1080 preferred)
- [ ] Problem statement slide ready
- [ ] Team introduction prepared (30 seconds each)

---

*VidyaAI — Built at ElevateX 2026 | Learn • Share • Uplift*
