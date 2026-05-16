# Design

## Theme
**Deep Space Dark Mode.** A high-contrast, low-strain interface designed for long study sessions. The atmosphere is technical yet welcoming, using deep purples and vibrant status colors.

## Color Palette

### Neutrals
- `Background`: `#07070f` (Deep space base)
- `Surface`: `#111120` (Card backgrounds)
- `Border`: `#252538` (Subtle definition)
- `Text Primary`: `#e4e4f0` (High legibility)
- `Text Secondary`: `#8888a8` (Metadata and labels)

### Accents
- `Primary`: `#7c6ef7` (Purple — CTAs, active states, brand energy)
- `Success`: `#2dd4a0` (Teal — Strong topics, correct answers)
- `Warning`: `#f5a623` (Amber — Review topics, medium difficulty)
- `Error`: `#ff6b6b` (Coral — Weak topics, incorrect answers)

## Typography
- **Body & Headings:** `Sora` — Modern, geometric, and friendly. Used for all prose and navigation.
- **Data & UI:** `JetBrains Mono` — Precise and technical. Used for stats, scores, badges, and difficulty indicators to give a sense of "accuracy."
- **Icons:** Use the huge-icons React
## Components

### Roadmap Nodes
- Circle or rounded hex nodes.
- Colored by strength: Teal (Strong), Amber (Review), Coral (Weak), Gray (Unseen).

### Cards
- Subtle borders (`--border`).
- No elevation shadows; hierarchy through color and spacing.

### Badges
- Using `JetBrains Mono` for a "pill" style status indicator.

## Layout
- **Rhythm:** Generous spacing to avoid the "crammed textbook" feel.
- **Focus:** Single-column focus for explanations; grid/radar for overview.

## Motion
- **Transitions:** Quick, exponential ease-out for tab switching.
- **Feedback:** Immediate color changes on quiz interactions.
