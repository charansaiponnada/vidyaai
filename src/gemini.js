const GEMINI_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent'

async function callGemini(apiKey, prompt, systemInstruction = '') {
  const body = {
    contents: [{ parts: [{ text: prompt }] }],
    generationConfig: {
      temperature: 0.7,
      maxOutputTokens: 1500,
    },
  }
  if (systemInstruction) {
    body.system_instruction = { parts: [{ text: systemInstruction }] }
  }

  const res = await fetch(`${GEMINI_URL}?key=${apiKey}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })

  if (!res.ok) {
    const err = await res.json()
    throw new Error(err?.error?.message || 'Gemini API error')
  }

  const data = await res.json()
  return data.candidates?.[0]?.content?.parts?.[0]?.text || ''
}

// FEATURE 1: Adaptive explanation - adjusts style + language
export async function explainTopic({ apiKey, topic, language, style, difficulty }) {
  const langMap = {
    english: 'English',
    telugu: 'Telugu (తెలుగు)',
    hindi: 'Hindi (हिंदी)',
    tamil: 'Tamil (தமிழ்)',
  }
  const styleMap = {
    examples: 'Use real-world examples and analogies to explain concepts.',
    story: 'Use a short narrative or story format to explain the concept.',
    steps: 'Break everything into numbered steps, very structured.',
    visual: 'Describe things as if painting a picture — vivid and spatial.',
    simple: 'Use extremely simple words, as if explaining to a 12-year-old.',
  }

  const prompt = `Explain the topic "${topic}" to a student.
Language: ${langMap[language] || 'English'}
Learning style: ${styleMap[style] || styleMap.examples}
Difficulty level: ${difficulty} (1=beginner, 3=advanced)

Instructions:
- Respond ONLY in ${langMap[language] || 'English'}
- Keep it educational, engaging, and clear
- Length: 3-4 short paragraphs
- End with one key takeaway line prefixed with "💡 Key insight:"
- Do NOT add markdown headers`

  return callGemini(apiKey, prompt)
}

// FEATURE 2: Adaptive quiz - generates question at right difficulty
export async function generateQuizQuestion({ apiKey, topic, language, difficulty }) {
  const langMap = {
    english: 'English',
    telugu: 'Telugu',
    hindi: 'Hindi',
    tamil: 'Tamil',
  }

  const diffLabel = difficulty === 1 ? 'easy (recall-level)' : difficulty === 2 ? 'medium (application-level)' : 'hard (analysis-level)'

  const prompt = `Generate a multiple-choice quiz question about "${topic}".
Difficulty: ${diffLabel}
Language for question and options: ${langMap[language] || 'English'}

Return ONLY valid JSON in this exact format, nothing else:
{
  "question": "the question text in ${langMap[language]}",
  "options": ["option A", "option B", "option C", "option D"],
  "correctIndex": 0,
  "explanation": "brief explanation of why the answer is correct, in ${langMap[language]}"
}`

  const raw = await callGemini(apiKey, prompt)
  const cleaned = raw.replace(/```json|```/g, '').trim()
  return JSON.parse(cleaned)
}

// FEATURE 3: Language translation + simplification
export async function translateAndSimplify({ apiKey, text, targetLanguage }) {
  const langMap = {
    telugu: 'Telugu (తెలుగు)',
    hindi: 'Hindi (हिंदी)',
    tamil: 'Tamil (தமிழ்)',
    english: 'English',
  }

  const prompt = `Translate and simplify the following educational text into ${langMap[targetLanguage]}.

Original text:
"${text}"

Instructions:
- Translate naturally, not word-for-word
- Simplify complex terms so a rural student can understand
- Keep it educational and clear
- Respond ONLY with the translated text, no preamble`

  return callGemini(apiKey, prompt)
}

// FEATURE 4: Learning style detection from quiz answers
export async function detectLearningInsight({ apiKey, language, history }) {
  const correct = history.filter(h => h.correct).length
  const total = history.length
  const topics = [...new Set(history.map(h => h.topic))]
  const wrongTopics = history.filter(h => !h.correct).map(h => h.topic)

  const langMap = { english: 'English', telugu: 'Telugu', hindi: 'Hindi', tamil: 'Tamil' }

  const prompt = `A student attempted ${total} quiz questions on topics: ${topics.join(', ')}.
They got ${correct}/${total} correct.
Weak topics: ${wrongTopics.join(', ') || 'none yet'}.

In ${langMap[language] || 'English'}, write:
1. A 2-sentence encouraging performance summary
2. Top 2 specific topics they should focus on next
3. One practical study tip

Keep it warm, motivating, and concise. No bullet points, just flowing sentences.`

  return callGemini(apiKey, prompt)
}

// FEATURE 4: Generate topic suggestions
export async function getSuggestedTopics({ apiKey, subject }) {
  const prompt = `List 8 important subtopics a student should learn for the subject "${subject}".
Return ONLY a JSON array of strings, no explanation:
["topic1", "topic2", ...]`

  const raw = await callGemini(apiKey, prompt)
  const cleaned = raw.replace(/```json|```/g, '').trim()
  return JSON.parse(cleaned)
}
