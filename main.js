// ── Hamburger menu ───────────────────────────────────────────────
const hamburger = document.getElementById('hamburger');
const mobileMenu = document.getElementById('mobile-menu');

hamburger.addEventListener('click', () => {
  hamburger.classList.toggle('open');
  mobileMenu.classList.toggle('open');
});

mobileMenu.querySelectorAll('a').forEach(link => {
  link.addEventListener('click', () => {
    hamburger.classList.remove('open');
    mobileMenu.classList.remove('open');
  });
});

// ── Agent tabs ───────────────────────────────────────────────────
const tabs = document.querySelectorAll('.agent-tab');
const details = document.querySelectorAll('.agent-detail');

tabs.forEach(tab => {
  tab.addEventListener('click', () => {
    const idx = tab.dataset.tab;
    tabs.forEach(t => t.classList.remove('active'));
    details.forEach(d => d.classList.remove('active'));
    tab.classList.add('active');
    details[idx].classList.add('active');
  });
});

// ── FAQ accordion ────────────────────────────────────────────────
document.querySelectorAll('.faq-item').forEach(item => {
  item.querySelector('.faq-question').addEventListener('click', () => {
    const isOpen = item.classList.contains('open');
    document.querySelectorAll('.faq-item').forEach(i => {
      i.classList.remove('open');
      i.querySelector('.faq-answer').style.maxHeight = null;
    });
    if (!isOpen) {
      item.classList.add('open');
      const answer = item.querySelector('.faq-answer');
      answer.style.maxHeight = answer.scrollHeight + 'px';
    }
  });
});

// ── Scroll-triggered fade-in ─────────────────────────────────────
const observer = new IntersectionObserver(
  (entries) => entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      observer.unobserve(entry.target);
    }
  }),
  { threshold: 0.12 }
);

document.querySelectorAll('.fade-in').forEach(el => observer.observe(el));

// ── Categorized FAQ (two-level accordion) ────────────────────────
const faqCats = document.querySelectorAll('.faq-cat');

// A category's height depends on which question inside it is open, so it
// gets re-measured whenever anything below it changes. An answer that was
// just toggled is still animating, so measure against where each one is
// headed rather than the height it happens to have right now.
function sizeFaqCategory(cat) {
  const body = cat.querySelector('.faq-cat-body');
  const inner = cat.querySelector('.faq-cat-inner');
  if (!cat.classList.contains('open')) {
    body.style.maxHeight = null;
    return;
  }
  let height = inner.scrollHeight;
  cat.querySelectorAll('.faq-a').forEach(answer => {
    const target = answer.parentElement.classList.contains('open') ? answer.scrollHeight : 0;
    height += target - answer.clientHeight;
  });
  body.style.maxHeight = height + 'px';
}

function closeFaqQuestion(q) {
  q.classList.remove('open');
  q.querySelector('.faq-q-head').setAttribute('aria-expanded', 'false');
  q.querySelector('.faq-a').style.maxHeight = null;
}

function closeFaqCategory(cat) {
  cat.classList.remove('open');
  cat.querySelector('.faq-cat-head').setAttribute('aria-expanded', 'false');
  cat.querySelectorAll('.faq-q.open').forEach(closeFaqQuestion);
  cat.querySelector('.faq-cat-body').style.maxHeight = null;
}

faqCats.forEach(cat => {
  const head = cat.querySelector('.faq-cat-head');

  head.addEventListener('click', () => {
    const isOpen = cat.classList.contains('open');
    faqCats.forEach(closeFaqCategory);
    if (!isOpen) {
      cat.classList.add('open');
      head.setAttribute('aria-expanded', 'true');
      sizeFaqCategory(cat);
    }
  });

  cat.querySelectorAll('.faq-q').forEach(q => {
    q.querySelector('.faq-q-head').addEventListener('click', () => {
      const isOpen = q.classList.contains('open');
      cat.querySelectorAll('.faq-q.open').forEach(closeFaqQuestion);
      if (!isOpen) {
        const answer = q.querySelector('.faq-a');
        q.classList.add('open');
        q.querySelector('.faq-q-head').setAttribute('aria-expanded', 'true');
        answer.style.maxHeight = answer.scrollHeight + 'px';
      }
      sizeFaqCategory(cat);
    });
  });
});

// Give the category marked open in the markup its starting height, and
// re-measure once the display font lands — it changes the heading height.
faqCats.forEach(sizeFaqCategory);
if (document.fonts) document.fonts.ready.then(() => faqCats.forEach(sizeFaqCategory));

// Re-measure open panels when a resize reflows their text.
let faqResizeTimer;
window.addEventListener('resize', () => {
  clearTimeout(faqResizeTimer);
  faqResizeTimer = setTimeout(() => {
    document.querySelectorAll('.faq-q.open .faq-a').forEach(answer => {
      answer.style.maxHeight = answer.scrollHeight + 'px';
    });
    faqCats.forEach(sizeFaqCategory);
  }, 150);
});

// ── Demo request modal ─────────────────────────────────────────────
(function initDemoModal() {
  const modal = document.getElementById('demo-modal');
  const form = document.getElementById('demo-form');
  const success = document.getElementById('demo-form-success');
  const statusEl = document.getElementById('demo-form-status');
  const submitBtn = document.getElementById('demo-form-submit');
  const turnstileHost = document.getElementById('demo-turnstile');
  const config = window.DEPOWL_DEMO;

  if (!modal || !form || !config?.submitUrl) return;

  let renderedAt = 0;
  let turnstileWidgetId = null;
  let lastFocused = null;

  function renderTurnstile() {
    if (!turnstileHost || !config.turnstileSiteKey) return;
    if (typeof turnstile === 'undefined') return;
    turnstileHost.innerHTML = '';
    turnstileWidgetId = turnstile.render(turnstileHost, {
      sitekey: config.turnstileSiteKey,
      theme: 'light',
    });
  }

  function setStatus(message, isError) {
    if (!statusEl) return;
    statusEl.textContent = message;
    statusEl.classList.toggle('is-error', !!isError);
  }

  function resetFormView() {
    form.hidden = false;
    if (success) success.hidden = true;
    form.reset();
    setStatus('', false);
    renderedAt = Date.now();
    renderTurnstile();
  }

  function openModal() {
    lastFocused = document.activeElement;
    resetFormView();
    modal.hidden = false;
    modal.setAttribute('aria-hidden', 'false');
    document.body.classList.add('demo-modal-open');
    const firstInput = form.querySelector('input, select, textarea, button');
    if (firstInput instanceof HTMLElement) firstInput.focus();
  }

  function closeModal() {
    modal.hidden = true;
    modal.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('demo-modal-open');
    setStatus('', false);
    if (lastFocused instanceof HTMLElement) lastFocused.focus();
  }

  document.querySelectorAll('.demo-open').forEach((el) => {
    el.addEventListener('click', (e) => {
      e.preventDefault();
      openModal();
    });
  });

  modal.querySelectorAll('[data-demo-close]').forEach((el) => {
    el.addEventListener('click', closeModal);
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && !modal.hidden) closeModal();
  });

  if (typeof turnstile !== 'undefined') {
    renderTurnstile();
  } else {
    window.addEventListener('load', renderTurnstile);
  }

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    setStatus('', false);

    if (!form.reportValidity()) return;

    let turnstileToken = '';
    if (typeof turnstile !== 'undefined' && turnstileWidgetId != null) {
      turnstileToken = turnstile.getResponse(turnstileWidgetId) || '';
    }
    if (!turnstileToken) {
      setStatus('Please complete the verification check.', true);
      return;
    }

    const fd = new FormData(form);
    const payload = {
      first_name: String(fd.get('first_name') ?? '').trim(),
      last_name: String(fd.get('last_name') ?? '').trim(),
      email: String(fd.get('email') ?? '').trim(),
      organization: String(fd.get('organization') ?? '').trim(),
      litigation_role: String(fd.get('litigation_role') ?? '').trim(),
      message: String(fd.get('message') ?? '').trim(),
      company_website: String(fd.get('company_website') ?? '').trim(),
      rendered_at: renderedAt,
      turnstile_token: turnstileToken,
    };

    submitBtn.disabled = true;
    submitBtn.textContent = 'Sending…';

    try {
      const headers = { 'Content-Type': 'application/json' };
      if (config.supabaseAnonKey) {
        headers.apikey = config.supabaseAnonKey;
        headers.Authorization = `Bearer ${config.supabaseAnonKey}`;
      }

      const res = await fetch(config.submitUrl, {
        method: 'POST',
        headers,
        body: JSON.stringify(payload),
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok && !data.ok) {
        throw new Error(data.error || 'Something went wrong. Please try again.');
      }

      form.hidden = true;
      if (success) success.hidden = false;
    } catch (err) {
      setStatus(err.message || 'Could not send your request.', true);
      if (typeof turnstile !== 'undefined' && turnstileWidgetId != null) {
        turnstile.reset(turnstileWidgetId);
      }
    } finally {
      submitBtn.disabled = false;
      submitBtn.textContent = 'Send request';
    }
  });
})();
