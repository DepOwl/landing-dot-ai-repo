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
