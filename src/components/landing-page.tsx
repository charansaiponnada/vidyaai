"use client"

import { useState, useRef, useEffect } from "react"
import { motion, useScroll, useTransform, AnimatePresence } from "framer-motion"
import { Sparkles, BookOpen, Brain, Zap, BarChart3, ArrowRight, ChevronRight, Globe, MessageSquare, Target, Play, CheckCircle, GraduationCap, Layers } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface LandingPageProps {
  onGetStarted: () => void
}

const features = [
  {
    icon: BookOpen,
    title: "Adaptive Learning",
    desc: "AI generates personalized explanations that adapt to your pace and style",
    color: "from-indigo-500/20 to-indigo-500/5",
    border: "border-indigo-500/20",
    accent: "indigo",
  },
  {
    icon: Brain,
    title: "Smart Quizzes",
    desc: "Dynamic difficulty keeps you in flow — not too hard, not too easy",
    color: "from-violet-500/20 to-violet-500/5",
    border: "border-violet-500/20",
    accent: "violet",
  },
  {
    icon: BarChart3,
    title: "Knowledge Heatmap",
    desc: "See your strengths and gaps at a glance with interactive visualizations",
    color: "from-emerald-500/20 to-emerald-500/5",
    border: "border-emerald-500/20",
    accent: "emerald",
  },
  {
    icon: Globe,
    title: "Multi-Language",
    desc: "Learn in your native tongue. Translate any concept instantly.",
    color: "from-sky-500/20 to-sky-500/5",
    border: "border-sky-500/20",
    accent: "sky",
  },
  {
    icon: MessageSquare,
    title: "AI Simplifier",
    desc: "One click to get any concept explained in simpler terms, in your language",
    color: "from-amber-500/20 to-amber-500/5",
    border: "border-amber-500/20",
    accent: "amber",
  },
  {
    icon: Target,
    title: "Learning Insights",
    desc: "Deep analytics on your learning patterns to optimize study time",
    color: "from-rose-500/20 to-rose-500/5",
    border: "border-rose-500/20",
    accent: "rose",
  },
]

const stats = [
  { value: "10x", label: "Faster Learning", icon: Zap },
  { value: "99%", label: "Concept Retention", icon: CheckCircle },
  { value: "50+", label: "Languages", icon: Globe },
  { value: "∞", label: "Any Topic", icon: GraduationCap },
]

function useReducedMotion() {
  const [prefersReduced, setPrefersReduced] = useState(false)
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)")
    setPrefersReduced(mq.matches)
    const handler = (e: MediaQueryListEvent) => setPrefersReduced(e.matches)
    mq.addEventListener("change", handler)
    return () => mq.removeEventListener("change", handler)
  }, [])
  return prefersReduced
}

const fadeUp = { initial: { opacity: 0, y: 24 }, animate: { opacity: 1, y: 0 } }

function AnimatedCharacter({
  color,
  shape,
  index,
  mouseX,
  mouseY,
}: {
  color: string
  shape: "rect" | "semi"
  index: number
  mouseX: number
  mouseY: number
}) {
  const ref = useRef<HTMLDivElement>(null)
  const [pos, setPos] = useState({ x: 0, y: 0 })
  const reduced = useReducedMotion()

  useEffect(() => {
    if (reduced || !ref.current) return
    const rect = ref.current.getBoundingClientRect()
    const cx = rect.left + rect.width / 2
    const cy = rect.top + rect.height / 2
    const dx = mouseX - cx
    const dy = mouseY - cy
    setPos({
      x: Math.max(-8, Math.min(8, dx / 30)),
      y: Math.max(-6, Math.min(6, dy / 40)),
    })
  }, [mouseX, mouseY, reduced])

  const baseStyle = reduced ? {} : {
    transform: `translate(${pos.x}px, ${pos.y}px)`,
    transition: "transform 0.3s ease-out",
  }

  if (shape === "rect") {
    return (
      <motion.div
        ref={ref}
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ delay: 0.15 * index, duration: 0.5, ease: "easeOut" }}
        className="relative cursor-pointer"
        style={baseStyle}
      >
        <div
          className="rounded-t-xl"
          style={{
            width: `${80 + index * 20}px`,
            height: `${120 + index * 30}px`,
            backgroundColor: color,
          }}
        >
          <div className="flex gap-3 justify-center pt-6">
            <div className="size-2.5 rounded-full bg-white/90" />
            <div className="size-2.5 rounded-full bg-white/90" />
          </div>
        </div>
      </motion.div>
    )
  }
  if (shape === "semi") {
    return (
      <motion.div
        ref={ref}
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ delay: 0.15 * index, duration: 0.5, ease: "easeOut" }}
        style={baseStyle}
      >
        <div
          className="rounded-t-full cursor-pointer"
          style={{
            width: "160px",
            height: "100px",
            backgroundColor: color,
          }}
        >
          <div className="flex gap-4 justify-center pt-8">
            <div className="size-3 rounded-full bg-[#2D2D2D]" />
            <div className="size-3 rounded-full bg-[#2D2D2D]" />
          </div>
        </div>
      </motion.div>
    )
  }
  return null
}

const demos = [
  {
    title: "Adaptive Learning",
    desc: "Explanations that match your level",
    icon: BookOpen,
    accent: "indigo",
    lines: [
      { text: "What is a derivative?", width: "80%", variant: "question" as const },
      { text: "A derivative measures how a function changes as its input changes.", width: "100%", variant: "answer" as const },
      { text: "Think of it like a speedometer — it tells you how fast something is changing at any instant.", width: "95%", variant: "example" as const },
      { text: "Try it: What topic would you like to learn?", width: "70%", variant: "cta" as const },
    ],
  },
  {
    title: "Smart Quiz",
    desc: "Difficulty adapts to your skill",
    icon: Brain,
    accent: "violet",
    lines: [
      { text: "If f(x) = 3x² + 2x, what is f'(x)?", width: "85%", variant: "question" as const },
      { text: "A) 6x + 2", width: "50%", variant: "option" as const },
      { text: "Correct! You're ready for the next level.", width: "90%", variant: "correct" as const },
      { text: "Up next: Chain rule", width: "65%", variant: "cta" as const },
    ],
  },
  {
    title: "Knowledge Heatmap",
    desc: "Visualize what you've mastered",
    icon: BarChart3,
    accent: "emerald",
    lines: [
      { text: "Calculus I — Progress", width: "70%", variant: "question" as const },
      { text: "Limits & Continuity  ██████░░░░ 60%", width: "85%", variant: "progress" as const },
      { text: "Derivatives         ████████░░ 80%", width: "85%", variant: "progress" as const },
      { text: "Integration         ███░░░░░░░ 30%", width: "85%", variant: "progress" as const },
    ],
  },
]

const lineVariantStyles: Record<string, string> = {
  question: "bg-white/[0.03] text-white/70",
  answer: "bg-white/5 text-white/80",
  example: "bg-indigo-500/10 text-indigo-200",
  cta: "bg-gradient-to-r from-indigo-500/20 to-transparent text-indigo-300",
  option: "bg-white/5 text-white/60",
  correct: "bg-emerald-500/10 text-emerald-300",
  progress: "bg-white/[0.03] text-white/60 font-mono tracking-tight",
}

function DemoPreview() {
  const [activeDemo, setActiveDemo] = useState(0)

  return (
    <div className="relative" role="region" aria-label="Product demo preview">
      <div className="flex gap-2 mb-4 overflow-x-auto pb-2" role="tablist">
        {demos.map((d, i) => (
          <button
            key={i}
            role="tab"
            aria-selected={activeDemo === i}
            onClick={() => setActiveDemo(i)}
            className={cn(
              "shrink-0 px-4 py-2 rounded-full text-xs font-medium transition-all duration-200",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400 focus-visible:ring-offset-2 focus-visible:ring-offset-[#07070f]",
              activeDemo === i
                ? "bg-indigo-500/20 text-indigo-200 border border-indigo-500/30"
                : "bg-white/[0.04] text-white/40 border border-white/10 hover:bg-white/10 hover:text-white/60",
            )}
          >
            {d.title}
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        {(() => {
          const demo = demos[activeDemo]
          const Icon = demo.icon
          return (
            <motion.div
              key={activeDemo}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
              className="rounded-2xl border border-white/[0.06] bg-white/[0.02] backdrop-blur-xl p-6 overflow-hidden"
              role="tabpanel"
            >
              <div className="flex items-center gap-3 mb-5">
                <div className="p-2 rounded-lg bg-indigo-500/10">
                  <Icon className="size-4 text-indigo-400" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-white/90">{demo.title}</p>
                  <p className="text-xs text-white/40">{demo.desc}</p>
                </div>
              </div>
              <div className="space-y-2.5">
                {demo.lines.map((line, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -16 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.12, duration: 0.25, ease: "easeOut" }}
                    className={cn(
                      "min-h-[32px] rounded-lg flex items-center px-3 text-xs leading-relaxed",
                      "transition-colors duration-200",
                      lineVariantStyles[line.variant],
                    )}
                    style={{ width: line.width }}
                  >
                    {line.text}
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )
        })()}
      </AnimatePresence>
    </div>
  )
}

function FeatureCard({ feature, index }: { feature: typeof features[number]; index: number }) {
  const Icon = feature.icon
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ delay: index * 0.06, duration: 0.35, ease: "easeOut" }}
      whileHover={{ y: -3 }}
      className={cn(
        "group relative rounded-2xl border p-5 backdrop-blur-sm transition-all duration-200",
        "hover:shadow-lg hover:shadow-indigo-500/5",
        "cursor-pointer",
        feature.border,
        feature.color,
      )}
    >
      <div className="flex items-center gap-3 mb-3">
        <div className="p-2.5 rounded-xl bg-white/[0.04] border border-white/[0.06]">
          <Icon className="size-5 text-white/70" />
        </div>
        <p className="font-semibold text-sm text-white/90">{feature.title}</p>
      </div>
      <p className="text-sm text-white/40 leading-relaxed">{feature.desc}</p>
      <div className="mt-3 flex items-center gap-1 text-xs text-white/[0.15] group-hover:text-white/40 transition-colors duration-200">
        Learn more <ChevronRight className="size-3" />
      </div>
    </motion.div>
  )
}

export default function LandingPage({ onGetStarted }: LandingPageProps) {
  const [mouseX, setMouseX] = useState(0)
  const [mouseY, setMouseY] = useState(0)
  const heroRef = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll()
  const heroOpacity = useTransform(scrollYProgress, [0, 0.12], [1, 0])
  const heroScale = useTransform(scrollYProgress, [0, 0.12], [1, 0.97])
  const reduced = useReducedMotion()

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMouseX(e.clientX)
      setMouseY(e.clientY)
    }
    window.addEventListener("mousemove", handleMouseMove, { passive: true })
    return () => window.removeEventListener("mousemove", handleMouseMove)
  }, [])

  const characters = [
    { color: "#6366F1", shape: "rect" as const, index: 0 },
    { color: "#1E1B4B", shape: "rect" as const, index: 1 },
    { color: "#FB923C", shape: "semi" as const, index: 2 },
    { color: "#FBBF24", shape: "rect" as const, index: 3 },
  ]

  return (
    <div className="min-h-screen bg-[#07070f] text-white overflow-x-hidden">
      {/* Floating Nav */}
      <nav
        className="fixed top-4 left-4 right-4 z-50 mx-auto max-w-5xl rounded-2xl border border-white/[0.06] bg-[#07070f]/80 backdrop-blur-xl shadow-lg shadow-black/20"
      >
        <div className="flex items-center justify-between px-5 py-3">
          <div className="flex items-center gap-2.5">
            <div className="size-8 rounded-lg bg-indigo-500/20 flex items-center justify-center" aria-hidden="true">
              <Sparkles className="size-4 text-indigo-400" />
            </div>
            <span className="text-sm font-semibold text-white/90">VidyaAI</span>
          </div>
          <div className="flex items-center gap-3">
            <a href="#features" className="hidden sm:inline text-sm text-white/40 hover:text-white/70 transition-colors duration-200 px-3 py-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400 rounded-lg">
              Features
            </a>
            <a href="#demo" className="hidden sm:inline text-sm text-white/40 hover:text-white/70 transition-colors duration-200 px-3 py-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400 rounded-lg">
              Demo
            </a>
            <Button
              size="sm"
              onClick={onGetStarted}
              aria-label="Get started with VidyaAI"
              className="bg-indigo-500 hover:bg-indigo-400 text-white text-xs px-4 py-2 rounded-lg h-auto shadow-lg shadow-indigo-500/20"
            >
              Get Started
            </Button>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <motion.section
        ref={heroRef}
        style={reduced ? {} : { opacity: heroOpacity, scale: heroScale }}
        className="relative min-h-screen flex flex-col items-center justify-center px-6 pt-24 pb-32"
      >
        <div className="absolute inset-0 bg-gradient-to-b from-indigo-500/[0.08] via-transparent to-transparent pointer-events-none" />
        <div className="absolute top-1/4 left-1/3 size-[30rem] bg-indigo-500/[0.04] rounded-full blur-[160px] pointer-events-none" />
        <div className="absolute bottom-1/4 right-1/4 size-64 bg-indigo-400/[0.03] rounded-full blur-[120px] pointer-events-none" />

        <motion.div
          {...fadeUp}
          transition={{ duration: 0.7, ease: [0.23, 1, 0.32, 1] }}
          className="relative z-10 text-center max-w-4xl"
        >
          <motion.div
            initial={reduced ? { opacity: 1 } : { opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.15, duration: 0.4 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-sm text-indigo-300/80 mb-8"
          >
            <Sparkles className="size-3.5 text-indigo-400" />
            AI-Powered Adaptive Learning Platform
          </motion.div>

          <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold tracking-tight leading-[1.05] mb-6 text-balance">
            Learn Anything
            <br />
            <span className="bg-gradient-to-r from-indigo-400 via-indigo-300 to-emerald-300 bg-clip-text text-transparent">
              Smarter, Not Harder
            </span>
          </h1>

          <p className="text-lg md:text-xl text-white/40 max-w-2xl mx-auto mb-10 leading-relaxed text-balance">
            VidyaAI creates a personalized learning journey for you. AI-generated explanations,
            adaptive quizzes, and deep insights — all in your language.
          </p>

          <div className="flex items-center justify-center gap-4 flex-wrap">
            <Button
              size="lg"
              onClick={onGetStarted}
              aria-label="Get started free with VidyaAI"
              className="h-12 md:h-14 px-7 md:px-8 text-sm md:text-base font-semibold rounded-xl bg-indigo-500 hover:bg-indigo-400 text-white shadow-xl shadow-indigo-500/25 active:scale-[0.98] transition-all duration-150"
            >
              Get Started Free
              <ArrowRight className="ml-2 size-4 md:size-5" aria-hidden="true" />
            </Button>
            <a
              href="#demo"
              className="inline-flex items-center gap-2 h-12 md:h-14 px-7 md:px-8 text-sm md:text-base font-semibold rounded-xl border border-white/10 bg-white/[0.03] hover:bg-white/10 text-white/70 hover:text-white/90 transition-all duration-200 active:scale-[0.98]"
            >
              <Play className="size-4 md:size-5" aria-hidden="true" />
              Watch Demo
            </a>
          </div>
        </motion.div>

        {/* Animated Characters */}
        <motion.div
          initial={reduced ? { opacity: 1 } : { opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.6, ease: "easeOut" }}
          className="relative z-10 mt-16 md:mt-20 flex items-end gap-3 md:gap-4"
          aria-hidden="true"
        >
          {characters.map((char, i) => (
            <AnimatedCharacter
              key={i}
              color={char.color}
              shape={char.shape}
              index={char.index}
              mouseX={mouseX}
              mouseY={mouseY}
            />
          ))}
        </motion.div>

        {/* Scroll indicator */}
        {!reduced && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.5, duration: 0.5 }}
            className="absolute bottom-8 left-1/2 -translate-x-1/2"
          >
            <div className="w-5 h-8 rounded-full border-2 border-white/15 flex justify-center pt-2">
              <motion.div
                animate={{ y: [0, 6, 0] }}
                transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
                className="w-1 h-1.5 rounded-full bg-white/30"
              />
            </div>
          </motion.div>
        )}
      </motion.section>

      {/* Stats */}
      <section className="relative px-6 py-16 md:py-24">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8">
            {stats.map((stat, i) => {
              const Icon = stat.icon
              return (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-60px" }}
                  transition={{ delay: i * 0.08, duration: 0.4, ease: "easeOut" }}
                  className="text-center group cursor-pointer"
                >
                  <Icon className="size-5 text-indigo-400/40 mx-auto mb-3 group-hover:text-indigo-400/60 transition-colors duration-200" aria-hidden="true" />
                  <div className="text-3xl md:text-4xl font-bold bg-gradient-to-b from-white to-white/40 bg-clip-text text-transparent mb-1.5">
                    {stat.value}
                  </div>
                  <div className="text-sm text-white/30">{stat.label}</div>
                </motion.div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Interactive Demo */}
      <section id="demo" className="relative px-6 py-16 md:py-24 scroll-mt-24">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.4, ease: "easeOut" }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-5xl font-bold tracking-tight mb-4 text-balance">
              See It in Action
            </h2>
            <p className="text-white/40 text-base md:text-lg max-w-xl mx-auto">
              Click through the tabs to preview how VidyaAI transforms the way you learn
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ delay: 0.1, duration: 0.4, ease: "easeOut" }}
          >
            <DemoPreview />
          </motion.div>
        </div>
      </section>

      {/* Features Grid */}
      <section id="features" className="relative px-6 py-16 md:py-24 scroll-mt-24">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.4, ease: "easeOut" }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-5xl font-bold tracking-tight mb-4 text-balance">
              Everything You Need
            </h2>
            <p className="text-white/40 text-base md:text-lg max-w-xl mx-auto">
              Six powerful tools that work together to create your perfect learning experience
            </p>
          </motion.div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
            {features.map((feature, i) => (
              <FeatureCard key={i} feature={feature} index={i} />
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="relative px-6 py-24 md:py-32">
        <div className="absolute inset-0 bg-gradient-to-t from-indigo-500/[0.06] via-transparent to-transparent pointer-events-none" />
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="relative z-10 max-w-2xl mx-auto text-center"
        >
          <div className="size-12 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center mx-auto mb-6">
            <Layers className="size-6 text-indigo-400" aria-hidden="true" />
          </div>
          <h2 className="text-3xl md:text-5xl font-bold tracking-tight mb-4 text-balance">
            Ready to Transform Your Learning?
          </h2>
          <p className="text-white/40 text-base md:text-lg mb-8 max-w-lg mx-auto">
            Join the future of education. AI-powered, personalized, and completely free to start.
          </p>
          <Button
            size="lg"
            onClick={onGetStarted}
            aria-label="Start learning with VidyaAI"
            className="h-12 md:h-14 px-8 md:px-10 text-sm md:text-base font-semibold rounded-xl bg-indigo-500 hover:bg-indigo-400 text-white shadow-xl shadow-indigo-500/25 active:scale-[0.98] transition-all duration-150"
          >
            Start Learning Now
            <Zap className="ml-2 size-4 md:size-5" aria-hidden="true" />
          </Button>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="px-6 py-10 border-t border-white/[0.04]">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-sm text-white/25">
            <Sparkles className="size-4 text-indigo-400/60" aria-hidden="true" />
            VidyaAI — Built for the AI Hackathon
          </div>
          <div className="flex items-center gap-6 text-sm text-white/20">
            <a href="#" className="hover:text-white/40 transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400 rounded px-1">Privacy</a>
            <a href="#" className="hover:text-white/40 transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400 rounded px-1">Terms</a>
            <a href="#" className="hover:text-white/40 transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400 rounded px-1">GitHub</a>
          </div>
        </div>
      </footer>
    </div>
  )
}
