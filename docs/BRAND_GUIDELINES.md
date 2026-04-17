# Elo! Brand Guidelines

## 🎯 Brand Essence

**Modern • Human • Calm but Confident**

Every design decision must reinforce clarity, consistency, and recognition.

---

## 🧩 Logo System

### Primary Logo (Wordmark)

**File:** `icon-wordmark.svg`  
**Content:** "Elo!"  
**Usage:** Landing pages, headers, marketing, PWA icons  
**Characteristics:** Clean, modern, slightly friendly

### Secondary Logo (Mark)

**File:** `icon-mark.svg`  
**Content:** "E!"  
**Usage:** Favicon, compact UI, mobile contexts  
**Characteristics:** Punchy, expressive, exclamation-forward

---

## 📐 Logo Usage Rules

### ✅ Do

- Maintain consistent padding (safe area = 1x height of "E" stroke)
- Center logos inside containers (icons, buttons)
- Use approved colors only
- Maintain minimum size for readability

### ❌ Don't

- Stretch or distort logos
- Change aspect ratios
- Add shadows or effects
- Use unapproved colors

### Spacing Guidelines

- **Padding:** Minimum 1x height of "E" stroke
- **Minimum Size:** 16px for E! mark, 32px for Elo! wordmark
- **Alignment:** Always center horizontally and vertically

---

## ✍️ Typography System

### Headings

**Font:** Plus Jakarta Sans  
**Weights:** 700 (Bold), 800 (Extra Bold)  
**Usage:** H1-H4, page titles, section headers  
**Characteristics:** Clean, modern, slightly friendly

### Body Text

**Font:** DM Sans  
**Weights:** 400 (Regular), 500 (Medium)  
**Usage:** Paragraphs, descriptions, content  
**Characteristics:** Highly readable, comfortable for long reading

### UI Labels & Buttons

**Font:** DM Sans Medium (500)  
**Letter Spacing:** 0.025em for clarity  
**Usage:** Button text, form labels, navigation items  
**Characteristics:** Clear, scannable, accessible

---

## 🎨 Color System

### Primary Colors

```css
--elo-black: #111111;     /* Background, deep contrast */
--elo-blue: #5BA4F5;      /* Identity, trust, primary actions */
```

### Secondary Colors

```css
--elo-green: #22C55E;     /* Progress, success states */
--elo-yellow: #FACC15;    /* Interaction, CTAs (sparingly) */
```

### Neutral Colors

```css
--elo-white: #FFFFFF;       /* Text on dark, highlights */
--elo-gray-50: #F8F9FA;   /* Light backgrounds */
--elo-gray-100: #E5E7EB;  /* Borders, dividers */
--elo-gray-200: #D1D5DB;  /* Disabled states */
--elo-gray-300: #9CA3AF;  /* Secondary text */
--elo-gray-400: #6B7280;  /* Tertiary text */
--elo-gray-500: #374151;  /* Primary text on light */
```

---

## 🎯 Color Usage Rules

### Blue (#5BA4F5)
- **Identity:** Logo, brand elements
- **Trust:** Primary buttons, links
- **Primary Actions:** Main CTAs, navigation

### Green (#22C55E)
- **Progress:** Loading states, success messages
- **Success:** Completed actions, confirmations
- **Positive:** Achievement indicators

### Yellow (#FACC15)
- **Interaction:** Hover states (sparingly)
- **CTAs:** Secondary actions only
- **Attention:** Important notifications

### ⚠️ Color Restrictions

- **Don't overuse yellow** - reserve for key interactions
- **Don't mix meanings** - keep color semantics consistent
- **Don't use blue for error states** - use red from system colors

---

## 🧱 Component Consistency

### Buttons

```css
.elo-button {
  border-radius: 8px;
  padding: 12px 24px;
  font-family: 'DM Sans', sans-serif;
  font-weight: 500;
  letter-spacing: 0.025em;
  transition: all 0.2s ease;
}
```

### Cards

```css
.elo-card {
  border-radius: 12px;
  padding: 24px;
  background: var(--elo-gray-50);
  border: 1px solid var(--elo-gray-100);
}
```

### Inputs

```css
.elo-input {
  border-radius: 6px;
  padding: 12px 16px;
  border: 1px solid var(--elo-gray-100);
  font-family: 'DM Sans', sans-serif;
  font-size: 16px;
}
```

---

## 📏 Spacing System

**Base Unit:** 4px

```css
--space-1: 4px;    /* xs */
--space-2: 8px;    /* sm */
--space-3: 12px;   /* md */
--space-4: 16px;   /* lg */
--space-5: 20px;   /* xl */
--space-6: 24px;   /* 2xl */
--space-7: 28px;   /* 3xl */
--space-8: 32px;   /* 4xl */
```

### Usage Guidelines

- **Component padding:** Multiples of 4px (8, 12, 16, 24, 32)
- **Margins:** Use consistent spacing scale
- **Gutters:** 16px-24px for optimal readability
- **Section spacing:** 32px-48px for clear hierarchy

---

## 🎭 Icon System Integration

### Usage Contexts

**Wordmark ("Elo!")**
- PWA app icons (180px, 192px, 512px)
- Splash screens
- Social previews (Open Graph)
- Marketing materials
- Large brand surfaces

**Mark ("E!")**
- Favicon (16px, 32px)
- Browser tabs
- Small UI elements
- Compact navigation
- Mobile contexts

### Consistency Rules

- Same font family (Plus Jakarta Sans)
- Consistent stroke weight
- Same color palette
- Balanced visual weight
- Maintain readability at all sizes

---

## 📱 Implementation Examples

### Primary Button

```html
<button class="elo-button elo-button--primary">
  Get Started
</button>
```

### Secondary Button

```html
<button class="elo-button elo-button--secondary">
  Learn More
</button>
```

### Card Component

```html
<div class="elo-card">
  <h3>Course Title</h3>
  <p>Course description here...</p>
</div>
```

---

## 🧠 Design Principles

### 1. Clarity First
- Every element should be immediately understandable
- Remove unnecessary decoration
- Focus on content and functionality

### 2. Consistency Always
- Use the same styles for similar elements
- Follow spacing and color rules strictly
- Maintain visual harmony

### 3. Recognition at Scale
- Logos must work at 16px and 512px
- Colors should be distinct and meaningful
- Typography must be readable at all sizes

---

## 🚀 Quick Reference

| Element | Usage | Color | Font | Size |
|---------|--------|--------|-------|------|
| Primary Heading | H1 | --elo-gray-500 | Plus Jakarta Sans 800 |
| Secondary Heading | H2-H4 | --elo-gray-400 | Plus Jakarta Sans 700 |
| Body Text | Paragraphs | --elo-gray-500 | DM Sans 400 |
| UI Labels | Buttons, inputs | --elo-gray-400 | DM Sans 500 |
| Primary CTA | Main actions | --elo-blue | DM Sans 500 |
| Success State | Progress | --elo-green | - |
| Hover State | Interaction | --elo-yellow | - |

---

## 📋 Checklist Before Implementation

- [ ] Logo usage follows spacing rules
- [ ] Typography hierarchy is consistent
- [ ] Colors follow semantic meaning
- [ ] Components use consistent spacing
- [ ] Icons are appropriate for context
- [ ] Accessibility standards met
- [ ] Responsive behavior tested

---

*This is a living system. Update as the brand evolves, but maintain consistency.*
