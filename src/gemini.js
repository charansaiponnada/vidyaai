const DEFAULT_MODEL = 'gemini-2.5-flash'
const BASE_URL = 'https://generativelanguage.googleapis.com/v1beta/models/'

// Rate limiter: max 50 requests per 60s (under free tier 60 RPM limit)
const RATE_LIMIT_WINDOW = 60000
const MAX_REQUESTS = 50
const requestTimes = []

function wait(ms) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

async function acquireSlot() {
  const now = Date.now()
  while (requestTimes.length > 0 && requestTimes[0] < now - RATE_LIMIT_WINDOW) {
    requestTimes.shift()
  }
  if (requestTimes.length >= MAX_REQUESTS) {
    const oldest = requestTimes[0]
    const waitTime = oldest + RATE_LIMIT_WINDOW - now + 100
    console.log(`[VidyaAI] Rate limit: ${requestTimes.length} requests in window. Waiting ${Math.round(waitTime)}ms...`)
    await wait(waitTime)
  }
  requestTimes.push(Date.now())
}

async function callGemini(apiKey, prompt, systemInstruction = '', model = DEFAULT_MODEL, retries = 2) {
  const feature = new Error().stack.split('\n')[3]?.trim().split(' ')[1] || 'unknown'
  const promptPreview = prompt.substring(0, 60).replace(/\n/g, ' ')
  console.log(`[VidyaAI] >> ${model} | ${feature} | "${promptPreview}..."`)

  await acquireSlot()

  const url = `${BASE_URL}${model}:generateContent?key=${apiKey}`

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

  for (let attempt = 0; attempt <= retries; attempt++) {
    const start = Date.now()
    try {
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })

      const elapsed = Date.now() - start

      if (res.status === 429) {
        console.warn(`[VidyaAI] 429 Rate limited (${elapsed}ms). Attempt ${attempt + 1}/${retries + 1}`)
        if (attempt < retries) {
          const backoff = Math.min(1000 * Math.pow(2, attempt), 8000)
          console.log(`[VidyaAI] Retrying in ${backoff}ms...`)
          await wait(backoff)
          continue
        }
        throw new Error('Rate limit hit. Wait a moment and try again. The free Gemini tier allows ~60 requests per minute.')
      }

      if (!res.ok) {
        const err = await res.json()
        console.error(`[VidyaAI] API error ${res.status} (${elapsed}ms):`, err?.error?.message)
        throw new Error(err?.error?.message || `Gemini API error (${res.status})`)
      }

      const data = await res.json()
      const text = data.candidates?.[0]?.content?.parts?.[0]?.text || ''
      const tokens = data.usageMetadata?.totalTokenCount || '?'
      console.log(`[VidyaAI] << OK (${elapsed}ms, ~${tokens} tokens)`)
      return text
    } catch (error) {
      const elapsed = Date.now() - start
      if (error.message.includes('429') || error.message.includes('rate limit') || error.message.includes('RESOURCE_EXHAUSTED')) {
        if (attempt < retries) {
          const backoff = Math.min(1000 * Math.pow(2, attempt), 8000)
          console.warn(`[VidyaAI] Rate limited (${elapsed}ms). Retry ${attempt + 1}/${retries} in ${backoff}ms`)
          await wait(backoff)
          continue
        }
      }
      console.error(`[VidyaAI] FAILED (${elapsed}ms):`, error.message)
      if (attempt === retries) throw error
    }
  }
}

// FEATURE 0: Generate Roadmap from context
export async function generateRoadmap({ apiKey, context, language }) {
  const langMap = {
    english: 'English',
    telugu: 'Telugu',
    hindi: 'Hindi',
    tamil: 'Tamil',
  }

  const prompt = `You are an expert AI tutor. A student has provided the following learning context (it might be a syllabus, a textbook chapter, or just a subject name):

"${context}"

Create a highly structured visual learning roadmap for them.
Return ONLY valid JSON in this exact format, nothing else:
{
  "overview": "A brief, encouraging 2-sentence overview of what they will learn, written in ${langMap[language] || 'English'}.",
  "nodes": [
    {
      "id": "node-1",
      "label": "Short Topic Name in English",
      "description": "Brief 1-sentence description in English"
    }
  ]
}
Ensure there are between 5 to 8 sequential nodes that logically cover the context.`

  const raw = await callGemini(apiKey, prompt)
  const cleaned = raw.replace(/```json|```/g, '').trim()
  return JSON.parse(cleaned)
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
- End with one key takeaway line prefixed with "KEY INSIGHT:"
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
