---
name: qa-agent
description: Comprehensive ELO! QA automated testing runner and report analyzer for eloingles.com.br.
---

# ELO! Daily QA Robot & Automated Agent

This skill guides running, interpreting, and managing the automated end-to-end functional and UI/UX testing suite for `eloingles.com.br`.

## Quick Execution Commands

### Full Daily Functional QA (12 Sections)
```bash
npm run test:qa
```

### Dedicated UI/UX Design Quality & Ergonomics Audit (12 Sections)
```bash
npm run test:ui-ux
```

### Headed Visual Testing (Watch in browser)
```bash
npm run test:ui-ux:headed
```

### View Playwright HTML Diagnostic Traces
```bash
npm run test:qa:report
```

## Report Locations
Reports are generated in:
- `reports/QA_REPORT_YYYY-MM-DD.md` (Functional health & deltas)
- `reports/UI_UX_REPORT_YYYY-MM-DD.md` (UI/UX design health score, touch targets, layout responsiveness, contrast)

## The 12 UI/UX Audit Dimensions
1. **Responsive Layout & Mobile Viewports** (375px iPhone SE, 390px iPhone 14, 768px iPad, 1280px Desktop)
2. **Typography & Visual Hierarchy** (Headings, font weights, line heights, hierarchy)
3. **Theme & Dark Mode Consistency** (Obsidian dark slate aesthetic on `/classroom`)
4. **Visual Polish & Card Styling** (Card borders, aspect ratios, image fidelity)
5. **Interactive Feedback & Micro-Interactions** (Hover/active states, FAQ accordions)
6. **Forms, Inputs & Ergonomics** (Input font sizes preventing iOS auto-zoom)
7. **Navigation & Information Architecture** (Navbar, brand logo, footer columns)
8. **Conversion Funnels & CTA Clarity** (High-contrast primary CTAs, 1-click WhatsApp)
9. **Accessibility & Touch Targets** (44x44px minimum tap targets, image alts, SVG aria-labels)
10. **PWA Experience & Standalone UI** (Manifest, theme color status bar, standalone mode)
11. **Content Integrity & Formatting** (Token scanner, punctuation, diacritics)
12. **Perceived Speed, Stability & CLS** (Cumulative Layout Shift, layout stability)
