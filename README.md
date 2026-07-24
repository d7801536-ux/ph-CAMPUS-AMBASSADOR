# Programming Hub Campus Ambassador Landing Page — Production Launch Build

A mobile-first, high-conversion recruitment landing page built with pure standard web technologies (HTML5, Vanilla CSS3, JavaScript ES6+). Standalone, zero build steps, zero npm dependencies.

---

## 🚀 Complete Configuration Guide

All dynamic settings live in the `CONFIG` object at the top of `app.js`:

```javascript
const CONFIG = {
  // application
  FORM_ENDPOINT:      "",                                  // POST endpoint (Tally / Formspree / Getform)
  FORM_URL:           "",                                  // External fallback form URL
  // program state
  SPOTS_TOTAL:        3,
  SPOTS_OPEN:         3,
  APPLICATIONS_OPEN: true,                                 // Master switch (true = active, false = closed)
  // links
  INSTAGRAM_HANDLE:   "@programminghub",
  PRIVACY_URL:        "https://programminghub.io/privacy",
  SITE_URL:           "https://programminghub.io/ambassador",
  // analytics
  ANALYTICS_PROVIDER: "",                                  // "plausible" | "ga4" | "" (disabled)
  ANALYTICS_KEY:      ""                                   // Domain name or GA4 Measurement ID
};
```

### 1. Embedded Application Form Endpoint
Paste your POST endpoint URL into `CONFIG.FORM_ENDPOINT` (e.g. `https://formspree.io/f/xyz123` or `https://tally.so/r/abc`).
- When `FORM_ENDPOINT` is set: Clicking any Apply button opens the in-page bottom sheet (mobile) or modal (desktop) with client-side validation, honeypot anti-spam, and zero off-site redirects.
- Fallback: If `FORM_ENDPOINT` is empty, falls back to `FORM_URL` or displays an inline toast. Non-JS `<a href="...">` anchors function cleanly.

### 2. Applications-Closed Master Switch (`APPLICATIONS_OPEN: false`)
When all spots fill up, set `APPLICATIONS_OPEN: false`:
- All Apply buttons immediately switch to a disabled state ("Applications closed").
- The sticky bar switches to an Instagram follow CTA.
- Spot tiles display `✕ FILLED`.
- Terminal `apply` and `spots` commands report closed status honestly.

### 3. Funnel Analytics Integration
Set `ANALYTICS_PROVIDER` to `"plausible"` or `"ga4"` and supply `ANALYTICS_KEY`. Tracks 9 key funnel events (`hero_cta_click`, `terminal_command`, `quiz_start`, `quiz_complete`, `form_open`, `form_field_error`, `form_submit_success`, `form_submit_error`, `share_click`) with zero PII captured and automatic respect for `Do Not Track` signals.

---

## ⚡ Deployment Instructions

### One-Command Firebase Deployment
```bash
npx firebase-tools deploy --only hosting
```

### Local Preview
```bash
npx serve ./
```

---

## 🛡 39-Point Verification Matrix Summary

- **Carried Forward Regressions (1–18)**: Zero console errors/warnings, verified asset paths, zero horizontal overflow (360px–1440px), 44px touch targets, sticky bar clearance, single-invocation apply listener, non-JS fallback, zero emoji, Lighthouse score (Perf ≥ 90, A11y ≥ 95, Best Practices ≥ 95, SEO ≥ 95).
- **Form Modal (19–29)**: Opens on all 5 apply placements, closes on Esc/backdrop/[X], focus trapped & restored, background scroll locked & restored, blur/submit validation with `aria-describedby` & `aria-invalid`, honeypot silent rejection, 360px mobile virtual keyboard overlay test, 3-tier fallback chain.
- **Final Scope (30–39)**: Header logo layout, safe analytics (9 events, zero PII, DNT compliance), self-hosted fonts, OG preview tags (`1200x630`), `APPLICATIONS_OPEN: false` master switch verification, offline mid-submit error recovery, landscape 844x390 test, Lighthouse mobile final audit.
