# Pre-Flight Launch Checklist (`LAUNCH.md`)

Execute every check before making the Instagram link live:

- [ ] **1. Form Endpoint Set**: `CONFIG.FORM_ENDPOINT` configured with Tally/Formspree/Getform POST endpoint URL.
- [ ] **2. Test Application**: Send one test submission, confirm delivery at endpoint dashboard.
- [ ] **3. Clean Test Data**: Delete test submission entry from response spreadsheet before going live.
- [ ] **4. Notifications Wired**: Email or Slack alerts active so team responds to campus submissions immediately.
- [ ] **5. Privacy Link Resolves**: Verify `https://programminghub.io/privacy` opens without 404.
- [ ] **6. Analytics Key Active**: `CONFIG.ANALYTICS_PROVIDER` set and test event verified in Plausible / GA4 dashboard.
- [ ] **7. Canonical URL**: Verify `https://programminghub.io/ambassador` is set in `index.html` head.
- [ ] **8. OG Social Card Test**: Paste link in WhatsApp & Instagram DM to verify `assets/og-share.jpg` preview renders cleanly.
- [ ] **9. Mobile Device Check**: Test site on a physical Android device over mobile data (Slow 4G).
- [ ] **10. Spots Count Verified**: `CONFIG.SPOTS_OPEN` set to `3` for launch day.
- [ ] **11. Applications Switch**: `CONFIG.APPLICATIONS_OPEN` set to `true`.
- [ ] **12. One-Command Deploy**: Deployed to Firebase Hosting / Netlify over HTTPS (`npx firebase-tools deploy --only hosting`).
- [ ] **13. Instagram Bio Link**: Updated Instagram bio link to point to live landing page.
