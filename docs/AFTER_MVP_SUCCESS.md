# VidyaAI — After MVP Success 🚀

> Built at ElevateX Hackathon 2026 | Track: Education & Learning + Social Impact

---

## 🏆 What the MVP covers

| Feature | Status |
|---|---|
| Adaptive explanation engine (adjusts style + difficulty) | ✅ Done |
| Adaptive quiz with auto difficulty scaling | ✅ Done |
| Multilingual output (Telugu, Hindi, Tamil, English) | ✅ Done |
| Knowledge gap heatmap with radar chart | ✅ Done |
| AI-powered learning insights (Gemini) | ✅ Done |
| Translate & Simplify any educational text | ✅ Done |

---

## 📈 Phase 2 — Immediate Next Steps (Week 1–2 after hackathon)

### 1. User Authentication
- Add Google OAuth so students can log in
- Save progress per user (topics learned, quiz history, heatmap)
- Tech: Firebase Auth or Supabase

### 2. Persistent Data Storage
- Right now all state is in-memory. Add a database.
- Store: quiz history, learned topics, language preference
- Tech: Supabase (PostgreSQL) or Firebase Firestore
- Schema:
  ```
  users(id, name, email, language, subject)
  quiz_attempts(id, user_id, topic, correct, difficulty, timestamp)
  learned_topics(id, user_id, topic, timestamp)
  ```

### 3. Better Gemini Prompts + Streaming
- Enable streaming API responses so explanation text appears word by word
- Add retry logic with exponential backoff for failed API calls
- Use Gemini 1.5 Pro for more nuanced explanations

### 4. Mobile Responsive Polish
- Test and fix UI on 375px mobile screens
- Add bottom tab navigation for mobile
- Use CSS media queries throughout

---

## 🌱 Phase 3 — Core Product Expansion (Month 1)

### 5. Syllabus PDF Upload
- Let students upload their syllabus PDF
- VidyaAI auto-extracts topics, generates a study plan
- Maps topics to quiz questions and knowledge heatmap
- Tech: PDF.js for parsing, Gemini for topic extraction

### 6. Spaced Repetition Engine
- Track when each topic was last quizzed
- Surface "due for review" topics using SM-2 algorithm
- Show a daily review queue on the dashboard

### 7. Voice Output (Text-to-Speech)
- Read explanations aloud in Telugu/Hindi/Tamil
- Critical for rural students with low literacy
- Tech: Web Speech API (free) or ElevenLabs for better voices
- Single button: 🔊 "Listen in Telugu"

### 8. Progress Dashboard
- Weekly/monthly view of topics learned
- Streak counter (days in a row studied)
- Comparison: this week vs last week
- Charts: Recharts LineChart for progress over time

---

## 🏗️ Phase 4 — Scale & Impact (Month 2–3)

### 9. Teacher / Mentor Dashboard
- Teachers create "classrooms" and assign topics
- See aggregate heatmap of all students' weak areas
- Export student performance as PDF report
- Role-based auth: student vs teacher

### 10. Offline Mode
- Cache last 5 explanations and quizzes in localStorage
- Allow quiz-taking without internet
- Sync results when reconnected
- Critical for rural areas with poor connectivity

### 11. Multi-Subject Support
- Currently single subject per session
- Add subject switcher in the nav
- Persist separate heatmaps per subject

### 12. Gamification Layer
- XP points for completing topics and quizzes
- Badges: "10 day streak", "Physics master", "Quiz champion"
- Leaderboard within a classroom
- Makes daily studying addictive

---

## 🛠️ Tech Stack Upgrades

| Current | Upgrade | Why |
|---|---|---|
| Gemini Flash | Gemini 1.5 Pro | Better reasoning for complex topics |
| In-memory state | Supabase | Persistent cross-session data |
| Vite + React | Next.js | SSR, better SEO, API routes |
| Web Speech API | ElevenLabs | Natural-sounding regional voices |
| No auth | Firebase Auth | Multi-user support |
| No backend | FastAPI (Python) | Custom quiz scoring, analytics |

---

## 💰 Monetisation Path (After validation)

1. **Freemium** — 10 free explanations/day, unlimited for ₹99/month
2. **School plans** — ₹500/school/month for teacher dashboard + classroom features
3. **Government partnerships** — Pitch to AP government's digital education initiatives
4. **NGO grants** — Apply to Google.org, Pratham, and Teach For India for funding

---

## 🎯 Impact Metrics to Track

- Number of students onboarded
- Topics explained in Telugu/Hindi/Tamil (language adoption)
- Average quiz accuracy improvement over time per student
- Retention rate (students returning after day 1)
- Geographic reach (tier 2/3 cities vs metros)

---

## 🗺️ Pitch Deck Narrative (for investors/grants)

> "60% of India's 250 million students learn in a language not their own. VidyaAI gives every student a personal tutor that speaks their language, adapts to their level, and never gives up on them. We are starting with Telugu-speaking students in Andhra Pradesh and expanding to all 22 scheduled languages of India."

---

## 📋 Immediate TODO after hackathon

- [ ] Push code to GitHub: `github.com/yourteam/vidyaai`
- [ ] Deploy free on Vercel: `vercel --prod`
- [ ] Get 10 real students to test (friends, juniors)
- [ ] Collect feedback via Google Form
- [ ] Apply to Google for Startups, Microsoft for Startups (free credits)
- [ ] Register on Devfolio and submit to more hackathons
- [ ] Write a LinkedIn post about what you built

---

*Built with ❤️ at ElevateX 2026 — Learn • Share • Uplift*
