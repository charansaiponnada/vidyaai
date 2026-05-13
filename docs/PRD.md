# VidyaAI — Product Requirements Document (PRD)

**Version:** 1.0 (MVP)
**Hackathon:** ElevateX 2026 — Season 2
**Date:** May 17, 2026
**Team Track:** Education & Learning + Social Impact & Inclusion

---

## 1. Problem Statement

> "Students from rural and regional backgrounds face difficulty learning effectively because educational content is only available in English and there is no personalized, adaptive feedback — leading to poor comprehension, low engagement, and unequal access to quality education."

### Root Causes
- All standard educational content is delivered in English
- One-size-fits-all teaching with no personalization
- No real-time feedback mechanism for individual students
- Rural/first-generation students lack access to private tutors
- No tool exists that combines language accessibility + adaptive learning

### Who is affected?
- College and school students from Tier 2/3 cities in AP, Telangana, TN, UP
- First-generation learners whose mother tongue is Telugu, Hindi, or Tamil
- Students who struggle with English-medium content

---

## 2. Solution Overview (The "Guided Journey" Flow)

VidyaAI is a browser-based AI tutoring platform that outclasses traditional tools by replacing intimidating, open-ended interfaces with a structured, grounded, and localized learning journey:

1.  **Context-Aware Roadmap:** Instead of a blank search bar, students provide their context (syllabus, textbook chapter, or exam name). VidyaAI instantly generates a **Visual Learning Roadmap** that breaks the subject into manageable nodes.
2.  **Native Bite-Sized Overview:** Generates a brief, encouraging overview of the roadmap in the student's mother tongue (Telugu/Hindi/Tamil) to build confidence before studying.
3.  **Adaptive Core Loop (Learn → Quiz → Map):**
    *   **Learn:** Students click a roadmap node to receive a grounded explanation adapted to their specific style and level.
    *   **Quiz:** An immediate, adaptive MCQ tests comprehension of that specific node.
    *   **Map:** Successful completion turns the roadmap node **Green (Strong)**, while failure turns it **Amber (Review)** or **Red (Weak)**, providing a clear visual sense of progress and gamification.
4.  **Ubiquitous Simplification:** A floating "Help" tool allows students to highlight any complex English text throughout the journey and receive an instant, simplified explanation in their native language.

---

## 3. Core Objectives (MVP)

| # | Objective | Feature | Status |
|---|---|---|---|
| 1 | Adaptive Learning | Explanation engine with style + difficulty | ✅ MVP |
| 2 | Adaptive Quiz | Auto difficulty scaling quiz engine | ✅ MVP |
| 3 | Knowledge Heatmap | Visual topic strength tracker | ✅ MVP |
| 4 | Language Accessibility | Translate & simplify to regional languages | ✅ MVP |
| 5 | Learning Insights | AI-generated profile + feedback | ✅ MVP |

---

## 4. User Personas

### Persona A — Ravi, 19, B.Tech student, Nellore
- Studies Physics and Maths in English
- Struggles to understand abstract concepts
- Prefers explanations in Telugu
- Needs quick quizzes to test himself before exams

### Persona B — Priya, 17, Class 12, rural Telangana
- First-generation learner
- No access to tuition or coaching
- English is a barrier to understanding NCERT content
- Needs simple, native-language explanations

### Persona C — Arjun, 21, CS student, preparing for placements
- Needs adaptive quizzes to identify weak topics
- Wants to track which DSA topics he knows vs doesn't
- Prefers English, advanced difficulty

---

## 5. Feature Specifications

### F1 — Visual Learning Roadmap & Explanation Engine (LearnTab)

**What it does:**
- **Roadmap Generation:** Student uploads context (syllabus, chapter text, or exam name). Gemini parses the source and generates an interactive, node-based **Learning Roadmap**.
- **Adaptive Explanation:** Student clicks a roadmap node to get a grounded explanation.
- Selects learning style: Examples / Story / Steps / Simple / Visual
- Selects difficulty: Beginner / Intermediate / Advanced
- Gemini generates a 3–4 paragraph explanation in chosen language using the grounded source material.

**Inputs:**
- Learning Context (PDF, Text, or Subject Name)
- Learning style (5 options)
- Difficulty (3 levels)
- Language (set at onboarding)

**Output:**
- Interactive Visual Roadmap
- Structured node-specific explanation in chosen language
- Ends with "💡 Key insight:" line

**Gemini prompt strategy:**
- System: respond only in target language
- Style-specific instruction injected into prompt
- Difficulty level passed as 1/2/3 with labels

---

### F2 — Adaptive Quiz Engine (QuizTab)

**What it does:**
- Generates MCQ questions at a given difficulty
- Auto-adjusts difficulty based on student answers:
  - 2 correct in a row → difficulty goes up
  - Wrong answer → difficulty goes down
- Shows correct answer + explanation after each question
- Tracks: total, correct, accuracy %, streak

**Inputs:**
- Topic (optional override; defaults to subject)
- Language (from config)

**Outputs:**
- MCQ with 4 options in chosen language
- Correct answer highlighted
- Explanation in chosen language
- Difficulty badge updates in real-time

**Adaptive logic:**
```
if streak >= 2 AND difficulty < 3 → difficulty++, reset streak
if wrong answer AND difficulty > 1 → difficulty--
streak resets on wrong answer
```

**Gemini response format (JSON):**
```json
{
  "question": "...",
  "options": ["A", "B", "C", "D"],
  "correctIndex": 0,
  "explanation": "..."
}
```

---

### F3 — Roadmap Integration & Knowledge Heatmap (HeatmapTab)

**What it does:**
- Aggregates all topics the student has learned + quizzed and displays them as nodes on the Visual Roadmap.
- **Node Gamification:** 
  - Accuracy ≥75% → **Green (Strong)**
  - Accuracy 45–74% → **Amber (Review)**
  - Accuracy <45% → **Red (Weak)**
- Renders a color-coded grid + radar chart to show the overall "knowledge shape."

**Data source:**
- `roadmapNodes[]` — generated at start
- `quizHistory[]` — updated on every quiz answer

**Recharts usage:**
- RadarChart with up to 8 topics
- PolarGrid, PolarAngleAxis, Radar, Tooltip

**Visual output:**
- Summary row: Topics / Strong / Needs Work / Weak counts
- Color legend
- Radar chart (if ≥3 topics)
- Topic grid cards with progress bar + strength label

---

### F4 — Ubiquitous Translate & Simplify (Floating Tool)

**What it does:**
- **Not a siloed tab, but a floating help tool accessible throughout the app.**
- Student can highlight any difficult English text within the app or paste external text.
- Gemini translates AND simplifies for rural comprehension.
- Not word-for-word — natural, simplified translation designed for first-generation learners.

**Sample texts pre-loaded:**
- Photosynthesis definition
- Newton's second law
- Mitochondria definition

**Gemini prompt strategy:**
- Explicit instruction to simplify, not just translate
- "as a rural student can understand" framing
- Returns only translated text, no preamble

---

### F5 — Learning Insights (InsightsTab)

**What it does:**
- Shows aggregated metrics: topics learned, quizzes taken, accuracy, correct count
- Infers learning profile from accuracy: Quick Learner / Steady / Needs Practice
- Topic-wise performance bar chart
- On-demand AI insight: Gemini generates personalized feedback in chosen language

**Gemini prompt strategy:**
- Sends: total, correct, topics, wrong topics
- Asks for: performance summary + focus topics + study tip
- Responds in chosen language

---

## 6. Tech Stack

| Layer | Technology | Purpose |
|---|---|---|
| Frontend Framework | React 18 + Vite | Component-based UI, fast dev server |
| UI | Inline React styles + CSS variables | Custom dark theme, no dependency |
| Charts | Recharts 2.x | Radar chart in heatmap |
| AI Engine | Google Gemini 2.0 Flash API | All explanation, quiz, translate, insight calls |
| HTTP | Native fetch() | Direct browser → Gemini API calls |
| Fonts | Google Fonts (Sora + JetBrains Mono) | Distinctive typography |
| Build | Vite 5 | Production bundle |
| Deployment | Vercel / Netlify (static) | Free hosting |

**No backend required.** All AI calls go directly from browser to Gemini API.

---

## 7. Architecture

```
Browser (React SPA)
│
├── SetupScreen         → Captures: name, subject, language, API key
│
└── App (state manager)
    ├── learnedTopics[]     (shared state)
    ├── quizHistory[]       (shared state)
    │
    ├── LearnTab  ──────────→ gemini.js → explainTopic()
    ├── QuizTab   ──────────→ gemini.js → generateQuizQuestion()
    ├── HeatmapTab ─────────→ reads learnedTopics + quizHistory (no API)
    ├── TranslateTab ───────→ gemini.js → translateAndSimplify()
    └── InsightsTab ────────→ gemini.js → detectLearningInsight()
                                        → getSuggestedTopics()

gemini.js
└── callGemini(apiKey, prompt) → fetch() → Gemini 2.0 Flash REST API
```

---

## 8. Design System

| Token | Value | Usage |
|---|---|---|
| `--bg` | `#07070f` | Page background |
| `--card` | `#111120` | Card backgrounds |
| `--border` | `#252538` | Borders |
| `--purple` | `#7c6ef7` | Primary CTA, active tabs |
| `--teal` | `#2dd4a0` | Success, strong topics |
| `--amber` | `#f5a623` | Medium / warning |
| `--coral` | `#ff6b6b` | Error, weak topics |
| `--text` | `#e4e4f0` | Primary text |
| `--text2` | `#8888a8` | Secondary text |
| Font | Sora (body) + JetBrains Mono (code/numbers) | |

---

## 9. Judging Criteria Alignment

| Criterion | How VidyaAI addresses it |
|---|---|
| Innovation & Originality | Combination of adaptive learning + regional language AI — no existing tool does both |
| Problem Understanding | Directly addresses India's language + personalization gap in education |
| Solution Effectiveness | Working demo: enter topic → get explanation → quiz → see heatmap, live on stage |
| Technical Feasibility | Fully built, 1,600+ lines, builds successfully with `npm run build` |
| Impact & Scalability | Targets 250M+ Indian students; works in any browser, no install needed |
| Presentation Quality | Dark UI, radar chart, real-time difficulty badge — visually striking demo |

---

## 10. Demo Script (5 minutes)

```
[0:00] Open app → enter name "Ravi", subject "Physics", language "Telugu"
[0:30] Source Injection → Paste Physics Syllabus/Chapter → "Generate Roadmap"
       → Show Visual Roadmap appearing with nodes (Mechanics, Optics, etc.)
[1:15] Native Overview → Show AI giving a quick Telugu overview of the journey.
[1:45] Learn Tab → Click "Mechanics" node → Style: Simple → Explain
       → Show Telugu explanation grounded in the uploaded syllabus.
[3:00] Quiz Tab → immediate adaptive MCQ for "Mechanics"
       → Pass quiz → show "Mechanics" node on Roadmap turning Green.
[3:45] Floating Simplifier → Highlight complex English term → instant Telugu tooltip.
[4:30] Heatmap/Insights → Generate insight → show AI feedback in Telugu
[5:00] Close: "Outclassing the open-ended AI with a guided, native-language journey."
```

---

## 11. Known Limitations (MVP)

- No user authentication — state resets on page refresh
- API key entered manually — not production-safe
- No offline support
- Recharts radar requires ≥3 topics to render
- Mobile layout not fully optimized

---

---

## 13. Free Tier Optimization Strategy

Since the project relies on the **Gemini 1.5 Flash Free Tier** (15 RPM / 1,500 RPD), the following engineering choices are mandatory to ensure stability during the hackathon:

1.  **Prompt Batching:** Instead of separate calls for Roadmap Generation and the Native Overview, we combine them into a single request. One call returns both the nodes and the Telugu/Hindi summary.
2.  **JSON-Only Responses:** All structural data (Roadmaps, Quizzes) will be requested as strict JSON. This minimizes "token noise" (conversational filler) and makes processing faster and cheaper.
3.  **Client-Side Intelligence:** The "Map" (Heatmap) and "Insights" calculations (like learning profile) are calculated locally in the browser based on quiz scores. We only call Gemini for the *nuanced text* part of the insight, not the raw data processing.
4.  **Caching:** During a single session, if a student regenerates an explanation for the same topic with the same settings, we will attempt to cache the previous response locally.
5.  **Graceful Degeneracy:** If a 429 (Rate Limit) error occurs, the app will show a helpful "AI is thinking, please wait 30s" message instead of crashing, preserving the user experience.

---

## 14. Success Metrics (Post-hackathon)

- 100 students onboarded in first week
- ≥3 topics explored per session on average
- ≥60% of users use a non-English language
- Quiz accuracy improves by ≥15% over 5 sessions per student
