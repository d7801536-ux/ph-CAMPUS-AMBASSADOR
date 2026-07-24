/* Programming Hub Campus Ambassador Application Logic — Final Phase */

// Centralized Runtime Configuration
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

// Check prefers-reduced-motion
const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

// Anti-spam page load timestamp
const pageLoadTimestamp = Date.now();

// Saved scroll position for modal scroll restoration
let savedScrollPosition = 0;
let lastTriggeringElement = null;

document.addEventListener('DOMContentLoaded', () => {
  initApplyHandlers();
  initSpotsIndicator();
  initTerminalShell();
  initFitQuiz();
  initScrollIntelligence();
  initShareHandler();
  initFormModal();
  checkApplicationsOpenState();
});

/* Toast Notice System */
function showToast(message) {
  let toast = document.getElementById('toast-notice');
  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'toast-notice';
    toast.className = 'toast-notice';
    toast.setAttribute('role', 'status');
    toast.setAttribute('aria-live', 'polite');
    document.body.appendChild(toast);
  }
  toast.textContent = message;
  toast.classList.add('show');
  setTimeout(() => {
    toast.classList.remove('show');
  }, 3200);
}

/* 2C. Funnel Analytics Safe Tracker Wrapper */
function track(event, props = {}) {
  // Respect Do Not Track
  if (navigator.doNotTrack === "1" || window.doNotTrack === "1") return;
  if (!CONFIG.ANALYTICS_PROVIDER || CONFIG.ANALYTICS_PROVIDER === "") return;
  
  try {
    if (CONFIG.ANALYTICS_PROVIDER === "plausible" && window.plausible) {
      window.plausible(event, { props });
    } else if (CONFIG.ANALYTICS_PROVIDER === "ga4" && window.gtag) {
      window.gtag('event', event, props);
    }
  } catch (err) {
    // Silent failure — analytics script never breaks page runtime
  }
}

/* 2H. Applications-Closed Master Switch Handler */
function checkApplicationsOpenState() {
  if (CONFIG.APPLICATIONS_OPEN !== false) return;

  // Update header and sticky pills
  const countDisplay = document.getElementById('spots-count-display');
  if (countDisplay) {
    countDisplay.innerHTML = `<span class="dot" style="background-color:var(--muted); box-shadow:none;"></span> Applications closed`;
  }

  const mobilePill = document.getElementById('mobile-sticky-pill');
  if (mobilePill) {
    mobilePill.innerHTML = `<span style="color:var(--muted); font-weight:bold;">APPLICATIONS CLOSED</span>`;
  }

  // Disable all apply buttons
  const applyButtons = document.querySelectorAll('.js-apply-btn');
  applyButtons.forEach(btn => {
    btn.classList.add('is-disabled');
    btn.textContent = 'Applications closed';
    btn.setAttribute('aria-disabled', 'true');
    if (btn.tagName === 'A') btn.removeAttribute('href');
  });

  // Mark all spot tiles filled
  CONFIG.SPOTS_OPEN = 0;
  initSpotsIndicator();
}

/* 1. Apply Controls Interceptor (Rule 2: Single Delegated Listener on document) */
function syncApplyHrefs() {
  if (CONFIG.APPLICATIONS_OPEN === false) return;
  const applyElements = document.querySelectorAll('.js-apply-btn');
  const targetUrl = CONFIG.FORM_ENDPOINT || CONFIG.FORM_URL || "#";
  applyElements.forEach(el => {
    if (el.tagName === 'A') {
      el.setAttribute('href', targetUrl);
    }
  });
}

function initApplyHandlers() {
  syncApplyHrefs();

  if (window.__phApplyBound) return;
  window.__phApplyBound = true;

  document.addEventListener('click', (e) => {
    const btn = e.target.closest('.js-apply-btn');
    if (!btn) return;

    if (CONFIG.APPLICATIONS_OPEN === false) {
      e.preventDefault();
      showToast("Applications for this semester are currently closed.");
      return;
    }

    e.preventDefault();

    const placement = btn.getAttribute('data-placement') || 'general';
    track('hero_cta_click', { placement });

    if (CONFIG.FORM_ENDPOINT && CONFIG.FORM_ENDPOINT.trim() !== "") {
      openFormModal(btn, placement);
    } else if (CONFIG.FORM_URL && CONFIG.FORM_URL.trim() !== "") {
      window.open(CONFIG.FORM_URL, '_blank', 'noopener,noreferrer');
    } else {
      // Fallback: Open in-page modal for testing/preview
      openFormModal(btn, placement);
    }
  });
}

/* 2. Spots Indicator Component */
function initSpotsIndicator() {
  const container = document.getElementById('spots-tiles-container');
  const countDisplay = document.getElementById('spots-count-display');
  
  if (countDisplay && CONFIG.APPLICATIONS_OPEN !== false) {
    countDisplay.textContent = `${CONFIG.SPOTS_OPEN} of ${CONFIG.SPOTS_TOTAL} open`;
  }
  
  if (!container) return;
  container.innerHTML = '';
  
  for (let i = 1; i <= CONFIG.SPOTS_TOTAL; i++) {
    const tile = document.createElement('div');
    const isOpen = CONFIG.APPLICATIONS_OPEN !== false && i <= CONFIG.SPOTS_OPEN;
    
    tile.className = `spot-tile ${isOpen ? 'open' : 'filled'}`;
    tile.setAttribute('role', 'listitem');
    tile.innerHTML = `
      <span style="font-weight:700;">SPOT 0${i}</span>
      <span>${isOpen ? '● OPEN' : '✕ FILLED'}</span>
    `;
    container.appendChild(tile);
  }
}

/* 3. Hero Micro-Shell Engine */
function initTerminalShell() {
  const terminalBody = document.getElementById('terminal-body');
  const hiddenInput = document.getElementById('terminal-hidden-input');
  const promptInputDisplay = document.getElementById('terminal-input-display');
  const chips = document.querySelectorAll('.js-terminal-chip');
  
  if (!terminalBody) return;

  const bootLines = [
    { type: 'output', text: 'Programming Hub Ambassador OS v2.4' },
    { type: 'output', text: 'Initializing campus network connection...' },
    { type: 'success', text: '✓ Connected. 10M+ learners active.' },
    { type: 'warning', text: CONFIG.APPLICATIONS_OPEN ? `! Status: ${CONFIG.SPOTS_OPEN} spots open on campus.` : '! Status: Applications currently closed.' },
    { type: 'output', text: 'Type \'help\' to view available commands.' }
  ];

  let currentInput = "";

  function appendTerminalLine(type, text) {
    const line = document.createElement('div');
    line.className = `terminal-line ${type}`;
    line.textContent = text;
    terminalBody.appendChild(line);
    terminalBody.scrollTop = terminalBody.scrollHeight;
  }

  // Auto-type boot sequence
  if (prefersReducedMotion) {
    bootLines.forEach(l => appendTerminalLine(l.type, l.text));
  } else {
    let lineIdx = 0;
    function typeNextLine() {
      if (lineIdx < bootLines.length) {
        const lineData = bootLines[lineIdx];
        appendTerminalLine(lineData.type, lineData.text);
        lineIdx++;
        setTimeout(typeNextLine, 140);
      }
    }
    typeNextLine();
  }

  function executeCommand(cmdRaw) {
    const cmd = cmdRaw.trim().toLowerCase();
    if (!cmd) return;

    appendTerminalLine('command', `$ ${cmdRaw}`);
    track('terminal_command', { command: cmd });
    
    switch (cmd) {
      case 'help':
        appendTerminalLine('output', 'Available commands:\n  help    - Show this command list\n  whoami  - Current applicant role\n  perks   - View ambassador benefits\n  duties  - View key responsibilities\n  spots   - Check live slot status\n  apply   - Jump to application form\n  clear   - Clear terminal screen');
        break;

      case 'whoami':
        appendTerminalLine('output', 'campus_creator');
        break;

      case 'perks':
        appendTerminalLine('output', '● Pro Access, Free (Full Programming Hub Pro)\n● Certificate (Official proof of completion)\n● Internship Path (Direct future opportunity)\n● Community (Work with our team & creators)');
        break;

      case 'duties':
        appendTerminalLine('output', '1. Post 3x a week (Templates provided)\n2. 1 campus activity (One event per semester)\n3. Share real feedback (Tell us student needs)');
        break;

      case 'spots':
        if (CONFIG.APPLICATIONS_OPEN === false) {
          appendTerminalLine('warning', '0 of 3 slots open (Applications closed).');
        } else {
          appendTerminalLine('warning', `${CONFIG.SPOTS_OPEN} of ${CONFIG.SPOTS_TOTAL} slots currently open.`);
        }
        break;

      case 'apply':
        if (CONFIG.APPLICATIONS_OPEN === false) {
          appendTerminalLine('warning', 'Applications for this semester are currently closed.');
        } else {
          appendTerminalLine('success', 'Opening application form...');
          openFormModal(document.querySelector('.js-apply-btn'), 'terminal');
        }
        break;

      case 'clear':
        terminalBody.innerHTML = '';
        break;

      default:
        appendTerminalLine('warning', `command not found: ${cmdRaw}. Type 'help' for available options.`);
        break;
    }
  }

  terminalBody.addEventListener('click', () => {
    if (hiddenInput) hiddenInput.focus();
  });

  if (hiddenInput) {
    hiddenInput.addEventListener('input', (e) => {
      currentInput = e.target.value;
      if (promptInputDisplay) promptInputDisplay.textContent = currentInput;
    });

    hiddenInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        const cmdToExec = currentInput;
        currentInput = "";
        hiddenInput.value = "";
        if (promptInputDisplay) promptInputDisplay.textContent = "";
        executeCommand(cmdToExec);
      }
    });
  }

  chips.forEach(chip => {
    chip.addEventListener('click', () => {
      const command = chip.getAttribute('data-cmd');
      if (command) {
        executeCommand(command);
      }
    });
  });
}

/* 4. "Are You a Fit?" Quiz Engine */
function initFitQuiz() {
  const quizWrapper = document.getElementById('quiz-wrapper');
  if (!quizWrapper) return;

  const questions = [
    "You love fun, tech-based social media content",
    "You want to help grow an app used by millions",
    "You want to be part of a real creator community",
    "You want an internship shot down the line"
  ];

  let currentStep = 0;
  let answers = [null, null, null, null];

  try {
    const savedState = localStorage.getItem('ph_ambassador_quiz_state');
    if (savedState) {
      const parsed = JSON.parse(savedState);
      if (parsed && Array.isArray(parsed.answers)) {
        answers = parsed.answers;
        const firstUnanswered = answers.findIndex(a => a === null);
        currentStep = firstUnanswered === -1 ? questions.length : firstUnanswered;
      }
    }
  } catch (e) {}

  function saveQuizState() {
    try {
      localStorage.setItem('ph_ambassador_quiz_state', JSON.stringify({ answers }));
    } catch (e) {}
  }

  function renderQuiz() {
    quizWrapper.innerHTML = '';

    let liveRegion = document.getElementById('quiz-live-region');
    if (!liveRegion) {
      liveRegion = document.createElement('div');
      liveRegion.id = 'quiz-live-region';
      liveRegion.className = 'sr-only';
      liveRegion.setAttribute('aria-live', 'polite');
      document.body.appendChild(liveRegion);
    }

    if (currentStep < questions.length) {
      liveRegion.textContent = `Question ${currentStep + 1} of 4: ${questions[currentStep]}`;

      const header = document.createElement('div');
      header.className = 'quiz-header';
      
      const stepTag = document.createElement('span');
      stepTag.className = 'quiz-step-indicator';
      stepTag.textContent = `QUESTION 0${currentStep + 1} / 04`;
      
      const progressBar = document.createElement('div');
      progressBar.className = 'quiz-progress-bar';
      for (let i = 0; i < questions.length; i++) {
        const seg = document.createElement('div');
        seg.className = `quiz-progress-segment ${i <= currentStep ? 'active' : ''}`;
        progressBar.appendChild(seg);
      }
      header.appendChild(stepTag);
      header.appendChild(progressBar);

      const card = document.createElement('div');
      card.className = 'quiz-card';
      
      const qTitle = document.createElement('h3');
      qTitle.className = 'quiz-question-title';
      qTitle.textContent = questions[currentStep];

      const options = document.createElement('div');
      options.className = 'quiz-options';

      const yesBtn = document.createElement('button');
      yesBtn.className = 'quiz-btn quiz-btn-yes';
      yesBtn.innerHTML = '✓ Yes';
      yesBtn.onclick = () => recordAnswer(true);

      const noBtn = document.createElement('button');
      noBtn.className = 'quiz-btn quiz-btn-no';
      noBtn.innerHTML = '✕ Not really';
      noBtn.onclick = () => recordAnswer(false);

      options.appendChild(yesBtn);
      options.appendChild(noBtn);

      card.appendChild(qTitle);
      card.appendChild(options);

      const navRow = document.createElement('div');
      navRow.className = 'quiz-nav-row';

      if (currentStep > 0) {
        const backBtn = document.createElement('button');
        backBtn.className = 'quiz-back-btn';
        backBtn.innerHTML = '← Back';
        backBtn.onclick = () => {
          currentStep--;
          renderQuiz();
        };
        navRow.appendChild(backBtn);
      } else {
        const spacer = document.createElement('div');
        navRow.appendChild(spacer);
      }

      const hint = document.createElement('span');
      hint.className = 'quiz-hint';
      hint.textContent = 'Swipe or use ← → arrow keys';
      navRow.appendChild(hint);

      quizWrapper.appendChild(header);
      quizWrapper.appendChild(card);
      quizWrapper.appendChild(navRow);
    } else {
      const yesCount = answers.filter(a => a === true).length;
      track('quiz_complete', { score: yesCount });

      let title = "";
      let sub = "";

      if (yesCount === 4) {
        title = "You're exactly who we're looking for.";
        sub = "All 4 criteria matched. We'd love to have your energy on campus.";
      } else if (yesCount >= 2) {
        title = "You'd fit. The rest you'll pick up.";
        sub = "You've got the core traits. Our team will back you up on the rest.";
      } else {
        title = "Might not be your thing, and that's fine.";
        sub = "Follow our community for news and future role openings.";
      }

      liveRegion.textContent = `Quiz completed. Result: ${title}`;

      const panel = document.createElement('div');
      panel.className = 'quiz-result-panel';

      const tag = document.createElement('span');
      tag.className = 'quiz-result-tag';
      tag.textContent = `MATCH SCORE: ${yesCount}/4`;

      const resTitle = document.createElement('h3');
      resTitle.className = 'quiz-result-title';
      resTitle.textContent = title;

      const resSub = document.createElement('p');
      resSub.className = 'section-sub';
      resSub.style.marginBottom = '1rem';
      resSub.textContent = sub;

      const actionsRow = document.createElement('div');
      actionsRow.className = 'quiz-result-actions';

      const mainCta = document.createElement('a');
      mainCta.className = 'btn btn-primary js-apply-btn';
      mainCta.setAttribute('data-placement', 'quiz');
      mainCta.href = CONFIG.FORM_ENDPOINT || CONFIG.FORM_URL || "#";
      mainCta.textContent = CONFIG.APPLICATIONS_OPEN ? 'Start my application' : 'Applications closed';
      if (!CONFIG.APPLICATIONS_OPEN) mainCta.classList.add('is-disabled');

      actionsRow.appendChild(mainCta);

      if (yesCount <= 1 || !CONFIG.APPLICATIONS_OPEN) {
        const instaCta = document.createElement('a');
        instaCta.className = 'btn btn-secondary';
        instaCta.href = `https://instagram.com/${CONFIG.INSTAGRAM_HANDLE.replace('@', '')}`;
        instaCta.target = '_blank';
        instaCta.rel = 'noopener';
        instaCta.textContent = `Follow ${CONFIG.INSTAGRAM_HANDLE}`;
        actionsRow.appendChild(instaCta);
      }

      const resetBtn = document.createElement('button');
      resetBtn.className = 'quiz-back-btn';
      resetBtn.style.marginTop = '1rem';
      resetBtn.textContent = '↻ Retake quiz';
      resetBtn.onclick = () => {
        currentStep = 0;
        answers = [null, null, null, null];
        saveQuizState();
        renderQuiz();
      };

      panel.appendChild(tag);
      panel.appendChild(resTitle);
      panel.appendChild(resSub);
      panel.appendChild(actionsRow);
      panel.appendChild(resetBtn);

      quizWrapper.appendChild(panel);
      syncApplyHrefs();
    }
  }

  function recordAnswer(val) {
    if (currentStep === 0) {
      track('quiz_start');
    }
    answers[currentStep] = val;
    currentStep++;
    saveQuizState();
    renderQuiz();
  }

  document.addEventListener('keydown', (e) => {
    const rect = quizWrapper.getBoundingClientRect();
    if (rect.top >= 0 && rect.bottom <= window.innerHeight && currentStep < questions.length) {
      if (e.key === 'ArrowRight') {
        recordAnswer(true);
      } else if (e.key === 'ArrowLeft') {
        recordAnswer(false);
      }
    }
  });

  let touchStartX = 0;
  quizWrapper.addEventListener('touchstart', (e) => {
    touchStartX = e.changedTouches[0].screenX;
  }, { passive: true });

  quizWrapper.addEventListener('touchend', (e) => {
    if (currentStep >= questions.length) return;
    const touchEndX = e.changedTouches[0].screenX;
    const diff = touchEndX - touchStartX;
    if (diff > 50 && currentStep > 0) {
      currentStep--;
      renderQuiz();
    } else if (diff < -50) {
      recordAnswer(true);
    }
  }, { passive: true });

  renderQuiz();
}

/* 5. Scroll Intelligence & Sticky Bar */
function initScrollIntelligence() {
  const progressBar = document.getElementById('scroll-progress-bar');
  const stickyBar = document.getElementById('mobile-sticky-bar');
  const heroSection = document.getElementById('hero-section');
  
  let lastScrollY = window.scrollY;

  window.addEventListener('scroll', () => {
    const scrollTotal = document.documentElement.scrollHeight - window.innerHeight;
    if (scrollTotal > 0 && progressBar) {
      const progress = (window.scrollY / scrollTotal) * 100;
      progressBar.style.width = `${progress}%`;
    }

    const currentScrollY = window.scrollY;
    if (stickyBar && heroSection) {
      const heroBottom = heroSection.offsetTop + heroSection.offsetHeight;
      const isScrollingUp = currentScrollY < lastScrollY;
      const isInsideHero = currentScrollY < heroBottom;

      if (isScrollingUp && isInsideHero) {
        stickyBar.classList.add('is-hidden');
      } else {
        stickyBar.classList.remove('is-hidden');
      }
    }
    lastScrollY = currentScrollY;
  }, { passive: true });

  const reveals = document.querySelectorAll('.reveal-on-scroll');
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        const stats = entry.target.querySelectorAll('.js-countup');
        stats.forEach(animateCountUp);
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15 });

  reveals.forEach(el => observer.observe(el));
}

function animateCountUp(el) {
  if (el.dataset.animated === "true" || prefersReducedMotion) return;
  el.dataset.animated = "true";
  
  const targetStr = el.getAttribute('data-target');
  const numericVal = parseInt(targetStr.replace(/\D/g, ''), 10);
  const suffix = targetStr.replace(/[0-9]/g, '');

  if (isNaN(numericVal)) return;

  let current = 0;
  const duration = 1200;
  const steps = 30;
  const increment = numericVal / steps;
  const stepTime = duration / steps;

  const timer = setInterval(() => {
    current += increment;
    if (current >= numericVal) {
      el.textContent = `${numericVal}${suffix}`;
      clearInterval(timer);
    } else {
      el.textContent = `${Math.floor(current)}${suffix}`;
    }
  }, stepTime);
}

/* 6. Web Share API & Clipboard Fallback */
function initShareHandler() {
  const shareBtn = document.getElementById('share-btn');
  if (!shareBtn) return;

  shareBtn.addEventListener('click', async () => {
    const isNative = !!navigator.share;
    track('share_click', { method: isNative ? 'native' : 'clipboard' });

    const shareData = {
      title: 'Programming Hub Campus Ambassador',
      text: 'Rep one of the world\'s biggest coding apps right from your campus.',
      url: window.location.href
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch (err) {}
    } else {
      try {
        await navigator.clipboard.writeText(window.location.href);
        showToast("Link copied to clipboard");
      } catch (err) {
        showToast("Unable to copy link");
      }
    }
  });
}

/* 7. 2A. EMBEDDED FORM MODAL ENGINE */
function initFormModal() {
  const modalBackdrop = document.getElementById('apply-modal-backdrop');
  const modalCloseBtn = document.getElementById('modal-close-btn');
  const form = document.getElementById('ambassador-app-form');
  const textarea = document.getElementById('field-why-you');
  const charCounter = document.getElementById('why-you-char-counter');

  if (!modalBackdrop) return;

  modalCloseBtn?.addEventListener('click', closeFormModal);
  modalBackdrop.addEventListener('click', (e) => {
    if (e.target === modalBackdrop) closeFormModal();
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modalBackdrop.classList.contains('is-open')) {
      closeFormModal();
    }
  });

  modalBackdrop.addEventListener('keydown', (e) => {
    if (e.key !== 'Tab') return;
    const focusables = modalBackdrop.querySelectorAll('a[href], button:not([disabled]), input:not([type="hidden"]):not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])');
    if (focusables.length === 0) return;

    const first = focusables[0];
    const last = focusables[focusables.length - 1];

    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault();
      last.focus();
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault();
      first.focus();
    }
  });

  if (textarea && charCounter) {
    textarea.addEventListener('input', () => {
      const len = textarea.value.length;
      charCounter.textContent = `${len}/300`;
      if (len > 300) {
        textarea.value = textarea.value.slice(0, 300);
        charCounter.textContent = '300/300';
      }
    });
  }

  const inputs = form?.querySelectorAll('input, select, textarea');
  inputs?.forEach(input => {
    input.addEventListener('blur', () => validateField(input));
  });

  if (form) {
    form.addEventListener('submit', handleFormSubmit);
  }
}

function openFormModal(triggerEl, placement = 'general') {
  const modalBackdrop = document.getElementById('apply-modal-backdrop');
  if (!modalBackdrop) return;

  savedScrollPosition = window.scrollY;
  lastTriggeringElement = triggerEl || document.activeElement;

  modalBackdrop.classList.add('is-open');
  document.body.style.overflow = 'hidden';

  track('form_open', { placement });

  setTimeout(() => {
    const firstInput = document.getElementById('field-full-name');
    if (firstInput) firstInput.focus();
  }, 100);
}

function closeFormModal() {
  const modalBackdrop = document.getElementById('apply-modal-backdrop');
  if (!modalBackdrop) return;

  modalBackdrop.classList.remove('is-open');
  document.body.style.overflow = '';
  window.scrollTo(0, savedScrollPosition);

  if (lastTriggeringElement && typeof lastTriggeringElement.focus === 'function') {
    lastTriggeringElement.focus();
  }
}

function validateField(input) {
  const group = input.closest('.form-group');
  if (!group) return true;

  let isValid = true;
  const value = input.value.trim();

  if (input.hasAttribute('required') && !value) {
    isValid = false;
  } else if (input.type === 'email' && value) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    isValid = emailRegex.test(value);
  } else if (input.type === 'tel' && value) {
    const cleanTel = value.replace(/\s+/g, '').replace(/^\+91/, '');
    isValid = /^\d{10}$/.test(cleanTel);
  } else if (input.type === 'url' && value) {
    try {
      new URL(value);
      isValid = true;
    } catch (_) {
      isValid = false;
    }
  }

  if (!isValid) {
    group.classList.add('has-error');
    input.setAttribute('aria-invalid', 'true');
  } else {
    group.classList.remove('has-error');
    input.removeAttribute('aria-invalid');
  }
  return isValid;
}

async function handleFormSubmit(e) {
  e.preventDefault();
  const form = e.target;
  const submitBtn = form.querySelector('button[type="submit"]');

  // Anti-spam check 1: Honeypot field
  const hpField = form.querySelector('input[name="website_url_hp"]');
  if (hpField && hpField.value) {
    renderFormSuccess();
    return;
  }

  // Anti-spam check 2: Minimum time-to-submit (3s)
  if (Date.now() - pageLoadTimestamp < 3000) {
    showToast("Please review your responses before submitting.");
    return;
  }

  // Validate all fields
  const fields = form.querySelectorAll('input:not(.form-hp-field), select, textarea');
  let firstInvalid = null;

  fields.forEach(field => {
    const ok = validateField(field);
    if (!ok && !firstInvalid) {
      firstInvalid = field;
      track('form_field_error', { field: field.name });
    }
  });

  if (firstInvalid) {
    firstInvalid.focus();
    return;
  }

  // Clean WhatsApp and Instagram inputs
  const waField = document.getElementById('field-whatsapp');
  if (waField) {
    waField.value = waField.value.replace(/\s+/g, '').replace(/^\+91/, '');
  }

  const instaField = document.getElementById('field-instagram');
  if (instaField) {
    instaField.value = instaField.value.replace(/^@/, '');
  }

  // Disable form and show spinner state
  if (submitBtn) {
    submitBtn.disabled = true;
    submitBtn.textContent = 'Submitting...';
  }

  const formData = new FormData(form);

  if (CONFIG.FORM_ENDPOINT && CONFIG.FORM_ENDPOINT.trim() !== "") {
    try {
      const resp = await fetch(CONFIG.FORM_ENDPOINT, {
        method: 'POST',
        body: formData,
        headers: { 'Accept': 'application/json' }
      });

      if (resp.ok) {
        track('form_submit_success');
        renderFormSuccess();
      } else {
        throw new Error('Server returned response error');
      }
    } catch (err) {
      track('form_submit_error', { reason: err.message });
      showToast("Network error. Your responses are saved — please retry.");
      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.textContent = 'Retry Submission';
      }
    }
  } else {
    // Simulated mode when CONFIG.FORM_ENDPOINT is empty
    setTimeout(() => {
      track('form_submit_success');
      renderFormSuccess();
    }, 600);
  }
}

function renderFormSuccess() {
  const modalBody = document.getElementById('modal-body');
  if (!modalBody) return;

  modalBody.innerHTML = `
    <div class="form-success-panel">
      <div style="color:var(--green); font-size:1.1rem; font-weight:700;">$ application --received</div>
      <p style="color:var(--text); font-size:1.05rem;">Your campus application has been logged successfully.</p>
      <div style="border-top:1px solid var(--line); padding-top:1rem; color:var(--muted); font-size:0.9rem;">
        <strong>What happens next?</strong><br>
        1. Our team reviews your campus profile.<br>
        2. Selected applicants receive a small task via WhatsApp/Email.<br>
        3. The top 3 candidates get appointed as Campus Ambassadors.
      </div>
      <button class="btn btn-secondary" onclick="closeFormModal()" style="margin-top:0.5rem;">Close Window</button>
    </div>
  `;
}
