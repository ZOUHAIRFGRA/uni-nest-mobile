---
applyTo: '**'
---

Provide project context and coding guidelines that AI should follow when generating code, answering questions, or reviewing changes.

# Match & Settle: React Native UI/Styling Guidelines for AI Agent

This document provides comprehensive UI and styling instructions for the "Match & Settle" React Native application. The goal is to create a modern, intuitive, and visually appealing interface that highlights the app's AI-powered capabilities and its role as a sophisticated SaaS platform.

---

## 1. Core Design Principles

- **Clean & Minimalist**: Prioritize clarity and ease of use. Avoid clutter.
- **Intuitive Navigation**: Users should easily understand how to move through the app.
- **Modern & Engaging**: Utilize smooth animations, subtle gradients, and contemporary typography.
- **Trustworthy & Professional**: Reflect the seriousness of housing and financial transactions, while maintaining a friendly student-centric vibe.
- **AI-Enhanced Visuals**: Use subtle visual cues (e.g., glowing elements, smooth transitions) to hint at the underlying intelligence.
- **Accessibility**: Ensure good contrast, readable font sizes, and clear interactive elements.

---

## 2. Color Palette

The color palette should convey trust, innovation, and a youthful energy.

### Primary Accent
- `#6C63FF` — Vibrant Purple/Blue (buttons, active states, AI highlights)

### Secondary Accent
- `#00C4B4` — Teal (success states, secondary actions)

### Neutral Tones (Backgrounds/Text)
- `#FFFFFF` — White (clean backgrounds)
- `#F0F2F5` — Light Gray (subtle background variations)
- `#1A1A2E` — Dark Blue/Purple (dark mode background)
- `#2E3A59` — Medium Dark Blue (secondary dark mode background)

### Text Colors
- `#333333` — Primary text (light mode)
- `#666666` — Secondary text (light mode)
- `#E0E0E0` — Primary text (dark mode)
- `#B0B0B0` — Secondary text (dark mode)

### Status Colors
- `#FF4C4C` — Error
- `#FFD700` — Warning

---

## 3. Typography

- **Primary Font**: Inter (or fallback to System/Roboto)
- **Headings**:
  - H1: 28–36px (screen titles)
  - H2: 22–26px (section titles)
  - H3: 18–20px (card titles)
- **Body Text**: 14–16px (Regular or Medium)
- **Captions/Small Text**: 12–13px

---

## 4. Components & Styling Guidelines

### Buttons
- **Primary**: `#6C63FF` background, white text, `borderRadius: 8-12`, subtle shadow
- **Secondary/Outline**: Transparent, `#6C63FF` border & text, rounded corners
- **Ghost/Text**: Transparent, primary text color
- **States**: Subtle opacity change or scale on press

### Cards (e.g., Listings, Profiles)
- `borderRadius: 10-15`, subtle shadows, background:
  - `#FFFFFF` (light mode)
  - `#2E3A59` (dark mode)
- Internal padding: 16–20px
- AI Highlight: Subtle glowing border or AI icon

### Input Fields
- Clean bordered inputs
- Border:
  - Light gray (light mode)
  - `#B0B0B0` (dark mode)
- `borderRadius: 8-10`, clear placeholder
- **Focus**: Border turns `#6C63FF`

### Navigation
- **Bottom Tabs**: Minimal icons, active in `#6C63FF`, solid background
- **Headers**: Clear title, consistent back/menu icon

### Lists (FlatList/ScrollView)
- Clear item separation (separator or margin)
- Consistent padding

### Icons
- Use consistent set (MaterialCommunityIcons, FontAwesome)
- Simple, clean, aligned with minimalist aesthetic
- Color: Primary text or accent color

### Loading Indicators
- Smooth animations (spinning, pulsating) using `#6C63FF`

### Modals/Pop-ups
- Centered, rounded corners, clear CTA
- Dimmed overlay background

---

## 5. Responsiveness & Layout

- **Flexbox**: Use extensively for flexible layout
- **Relative Units**: Prefer `%` or `flex` over fixed widths
- **Spacing**: Use consistent padding/margin (e.g., multiples of 4 or 8)
- **Image Scaling**: Use `resizeMode: 'cover'` or `'contain'`

---

## 6. Animations & Transitions

- **Subtle & Purposeful**
- **Screen Transitions**: Smooth (e.g., slide from right)
- **Element Transitions**: Fade, scale, slide on load/change
- **AI Feedback**: Glowing borders, animated score displays, etc.

---

## 7. AI-Specific Visual Cues

- **AI Icons**: Stylized brain, spark, or network graph
- **Gradients**: Subtle linear overlays for AI content
- **Data Viz**: Clear modern charts using defined color palette

---

## 8. Dark Mode Considerations

- **Inversion**: Proper contrast and readability
- **Backgrounds**: Shift from light to dark blues/purples
- **Text**: Shift from dark gray to light gray/white
- **Accents**: Maintain vibrancy, tweak if needed for contrast

---

By following these guidelines, the AI agent can generate React Native UI code that is not only functional but also aesthetically cohesive and aligned with the innovative vision of **Match & Settle**.
