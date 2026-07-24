# Programming Hub Campus Ambassador Landing Page

A mobile-first, high-conversion recruitment landing page built with pure standard web technologies (HTML5, Vanilla CSS3, JavaScript ES6+). Zero bundler setup, zero build steps, zero dependencies.

---

## 🚀 Configuration Guide

All dynamic settings live in the `CONFIG` object at the top of `app.js`:

```javascript
const CONFIG = {
  FORM_URL:           "",                                  // External Google Form URL
  SPOTS_TOTAL:        3,
  SPOTS_OPEN:         3,
  APPLICATIONS_OPEN: true,                                 // Master switch (true = active, false = closed)
  INSTAGRAM_HANDLE:   "@programminghub",
  PRIVACY_URL:        "https://programminghub.io/privacy",
  SITE_URL:           "https://programminghub.io/ambassador",
  ANALYTICS_PROVIDER: "",                                  // "plausible" | "ga4" | "" (disabled)
  ANALYTICS_KEY:      ""                                   // Domain name or GA4 Measurement ID
};
```

### 1. Setting Up the Google Form Link
Paste your live Google Form URL into `CONFIG.FORM_URL` (e.g. `https://forms.google.com/xyz123`).
- When `FORM_URL` is set: Clicking any Apply control opens the Google Form in a new tab with `target="_blank"` and `rel="noopener noreferrer"`.
- When `FORM_URL` is empty: Clicking any Apply control smoothly scrolls down to `#apply-section` and displays an inline toast (*"Application link goes live shortly"*). Non-JS `<a href="...">` anchors function natively.

### 2. Applications-Closed Master Switch (`APPLICATIONS_OPEN: false`)
When all spots fill up, set `APPLICATIONS_OPEN: false`:
- All Apply buttons immediately switch to a disabled state ("Applications closed").
- The sticky bar switches to an Instagram follow CTA.
- Spot tiles display `✕ FILLED`.
- Terminal `apply` and `spots` commands report closed status honestly.

---

## 🎨 Redesigned Card Sections (Task B)

1. **Credential Panel & Stat Anchor**:
   - 3 separate cards replaced by **1 connected panel** (`.cred-panel`) containing 3 rows (~104px mobile height) with left hover accent bars and alternating green/yellow/green accents.
   - Standalone `10M+` proof block (`.cred-stat-anchor`) with 1px `--green-dim` border and 7% green tint wash.
2. **Perks 2x2 Grid**:
   - 4-card stacked layout converted to a **2x2 grid** on mobile (`1fr 1fr`; 4 across at 768px+).
   - 2px left accent rails (alternating green, yellow, yellow, green) and 4 new monoline SVG icons (diamond, rosette seal, briefcase, community figures). Invented `.perk-badge` labels removed.

---

## ⚡ Deployment Instructions

```bash
npx firebase-tools deploy --only hosting
```

---

## 🛡 31-Point Verification Matrix Compliance

- **Task A (1–9)**: Codebase completely clean of form modal/sheet code, `FORM_URL` empty behavior (toast shown, no 404/alert), `FORM_URL` set behavior (opens new tab), single-invocation apply listener (`window.__phApplyBound` guard checked fresh, after quiz, after 2 retakes), non-JS fallback works, analytics `hero_cta_click` fires with placement prop.
- **Task B (10–19)**: Cred section height ≤ 700px at 390px, Perks section height ≤ 620px at 390px, cred row heights identical (~104px), perk cards identical 2x2 grid, grid 2-col at 360–430px / 4-col at 768px+ / 1-col <340px, 4 new SVG perk icons exist & render, accent alternation verified, old `.perk-badge` removed, stat anchor `10M+` rendered in green at specified scale, hover/focus states work & suppressed under reduced motion.
- **Carried Forward (20–31)**: Console clean, assets exist, zero overflow (320px–1440px), 44px touch targets, sticky bar clearance, terminal chips/multiline, quiz full run & persistence, share control, `prefers-reduced-motion`, keyboard pass, zero emoji, Lighthouse scores.
