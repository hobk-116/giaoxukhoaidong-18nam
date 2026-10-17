/* Image comparison adapted from CodyHouse:
 * https://github.com/CodyHouse/image-comparison-slider
 * Keeps the original figure / cd-resize-img / cd-handle structure.
 * Uses native range events for mouse, touch and keyboard instead of jQuery.
 */
const header = document.querySelector('.site-header');
const hero = document.querySelector('.hero');
const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
const timeline = document.querySelector('.history-timeline');
const nativeTimeline = CSS.supports('(animation-timeline: view()) and (timeline-scope: --history-line)');
const milestones = [...timeline.querySelectorAll('.timeline-entry')];
const menu = document.querySelector('.section-menu');
const sectionLinks = [...menu.querySelectorAll('a')];
const sections = sectionLinks.map(link => document.querySelector(link.hash));
new ResizeObserver(() => {
  document.documentElement.style.setProperty('--header-height', `${header.getBoundingClientRect().height}px`);
}).observe(header);
let headerFrame;
function updateHeader() {
  const bottom = hero.getBoundingClientRect().bottom;
  const progress = Math.max(0, Math.min(1, -bottom / 125));
  const inkProgress = Math.max(0, Math.min(1, (header.offsetHeight + 100 - bottom) / 100));
  header.style.setProperty('--header-progress', progress);
  header.style.setProperty('--header-ink-progress', inkProgress);
  const scrollLength = document.documentElement.scrollHeight - innerHeight;
  header.style.setProperty('--reading-progress', Math.max(0, Math.min(1, scrollY / Math.max(1, scrollLength))));
  const readingLine = innerHeight * .45;
  const timelineBox = timeline.getBoundingClientRect();
  if (!nativeTimeline) {
    const lineTop = parseFloat(getComputedStyle(timeline, '::after').top);
    timeline.style.setProperty('--timeline-fill', Math.max(0, Math.min(1, (readingLine - timelineBox.top - lineTop) / (timelineBox.height - lineTop))));
  }
  const currentMilestone = milestones.findLast(entry => entry.getBoundingClientRect().top <= readingLine);
  milestones.forEach(entry => entry.classList.toggle('is-current', entry === currentMilestone && timelineBox.bottom > readingLine));
  const currentSection = sections.findLast(section => section.getBoundingClientRect().top <= header.offsetHeight + 32);
  sectionLinks.forEach((link, index) => {
    if (sections[index] === currentSection) link.setAttribute('aria-current', 'location');
    else link.removeAttribute('aria-current');
  });
  headerFrame = null;
}
function scheduleHeader() {
  if (!headerFrame) headerFrame = requestAnimationFrame(updateHeader);
}
window.addEventListener('scroll', scheduleHeader, { passive: true });
window.addEventListener('resize', scheduleHeader);
new ResizeObserver(scheduleHeader).observe(hero);
new ResizeObserver(scheduleHeader).observe(document.body);
updateHeader();

sectionLinks.forEach(link => link.addEventListener('click', () => {
  menu.open = false;
  const section = document.querySelector(link.hash);
  section.tabIndex = -1;
  section.focus({ preventScroll: true });
}));
document.addEventListener('click', event => { if (!menu.contains(event.target)) menu.open = false; });
document.addEventListener('keydown', event => {
  if (event.key === 'Escape' && menu.open) {
    menu.open = false;
    menu.querySelector('summary').focus();
  }
});

const anniversary = document.querySelector('.milestones-overlay');
anniversary.classList.add('is-ready');

document.querySelectorAll('.cd-image-container').forEach((figure) => {
  const range = figure.querySelector('.comparison-range');

  function update() {
    const position = Number(range.value);
    figure.style.setProperty('--progress', position / 100);
    range.setAttribute('aria-valuetext', `Vị trí thanh chia ${Math.round(position)}%`);
  }

  range.addEventListener('input', update);
  range.addEventListener('keydown', event => {
    if (!['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'].includes(event.key)) return;
    event.preventDefault();
    const direction = ['ArrowRight', 'ArrowUp'].includes(event.key) ? 1 : -1;
    range.value = String(Math.max(0, Math.min(100, Number(range.value) + direction)));
    update();
  });
  update();

  figure.querySelectorAll('img').forEach((img) => {
    function reportError() {
      if (figure.querySelector('.comparison-error')) return;
      range.disabled = true;
      const message = document.createElement('p');
      message.className = 'comparison-error';
      message.setAttribute('role', 'status');
      message.textContent = 'Chưa tải được ảnh. Hãy tải lại trang để thử lại.';
      figure.append(message);
    }
    img.addEventListener('error', reportError);
    if (img.complete && img.naturalWidth === 0) reportError();
  });
});

// Content remains visible without JavaScript and after motion is disabled.
const reveals = new IntersectionObserver(entries => {
  entries.forEach(({ target, isIntersecting }) => {
    if (!isIntersecting) return;
    reveals.unobserve(target);
    if (reducedMotion.matches) return;
    target.animate([
      { opacity: .25, transform: 'translateY(16px)' },
      { opacity: 1, transform: 'translateY(0)' }
    ], { duration: 700, delay: Number(target.dataset.delay || 0), easing: 'cubic-bezier(.16,1,.3,1)', fill: 'backwards' });
  });
}, { threshold: .15 });
document.querySelectorAll('.introduction-photo, .person-card, .parish-stats li').forEach((element) => reveals.observe(element));
document.querySelectorAll('.parish-stats li').forEach((element, index) => { element.dataset.delay = index * 80; });
reducedMotion.addEventListener('change', () => {
  if (reducedMotion.matches) document.getAnimations().forEach(animation => animation.cancel());
});

const counters = new IntersectionObserver(entries => {
  entries.forEach(({ target, isIntersecting }) => {
    if (!isIntersecting) return;
    counters.unobserve(target);
    if (reducedMotion.matches) return;
    const label = target.textContent;
    const final = Number(label.replace('~', ''));
    const prefix = label.startsWith('~') ? '~' : '';
    const visible = document.createElement('span');
    visible.setAttribute('aria-hidden', 'true');
    const accessible = document.createElement('span');
    accessible.className = 'visually-hidden';
    accessible.textContent = label;
    target.replaceChildren(visible, accessible);
    const start = performance.now();
    function tick(now) {
      const progress = reducedMotion.matches ? 1 : Math.min(1, (now - start) / 800);
      visible.textContent = prefix + Math.round(final * (1 - (1 - progress) ** 3));
      if (progress < 1) requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  });
}, { threshold: .5 });
document.querySelectorAll('.parish-stats strong').forEach(element => counters.observe(element));

const portraits = document.querySelector('.personnel-grid');
portraits.addEventListener('keydown', event => {
  if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key) || portraits.scrollWidth <= portraits.clientWidth) return;
  event.preventDefault();
  const step = portraits.firstElementChild.getBoundingClientRect().width + 16;
  let left = portraits.scrollLeft + (event.key === 'ArrowRight' ? step : -step);
  if (event.key === 'Home') left = 0;
  if (event.key === 'End') left = portraits.scrollWidth;
  portraits.scrollTo({ left, behavior: reducedMotion.matches ? 'instant' : 'smooth' });
});

// Only the first comparison teaches the gesture, once; input always takes over.
const firstComparison = document.querySelector('.cd-image-container');
const firstRange = firstComparison.querySelector('input');
let hintFrame;
let hintUsed = false;
const hint = new IntersectionObserver(entries => {
  if (!entries[0].isIntersecting || hintUsed) return;
  hintUsed = true;
  hint.disconnect();
  if (reducedMotion.matches || firstRange.disabled) return;
  firstComparison.classList.add('is-hinting');
  // Integrate a Gaussian velocity curve over -3σ…3σ into position.
  const cumulative = [0];
  for (let i = 1; i <= 120; i++) {
    const x = -3 + (i - .5) / 20;
    cumulative.push(cumulative[i - 1] + Math.exp(-x * x / 2));
  }
  function gaussianPosition(t) {
    const index = Math.max(0, Math.min(1, t)) * 120;
    const lower = Math.floor(index);
    return (cumulative[lower] + (cumulative[Math.min(lower + 1, 120)] - cumulative[lower]) * (index - lower)) / cumulative[120];
  }
  const start = performance.now();
  function tick(now) {
    if (firstRange.disabled) { stopHint(); return; }
    const elapsed = reducedMotion.matches ? 2400 : now - start;
    if (elapsed >= 1800) firstComparison.classList.remove('is-hinting');
    let position;
    if (elapsed < 600) {
      const progress = 2 * gaussianPosition(.5 + elapsed / 1200) - 1;
      position = 50 - 49 * progress;
    } else if (elapsed < 1800) {
      position = 1 + 98 * gaussianPosition((elapsed - 600) / 1200);
    } else {
      position = 99 - 49 * gaussianPosition((elapsed - 1800) / 600);
    }
    firstRange.value = String(position);
    firstRange.dispatchEvent(new Event('input'));
    if (elapsed < 2400) hintFrame = requestAnimationFrame(tick);
  }
  hintFrame = requestAnimationFrame(tick);
}, { threshold: .3 });
hint.observe(firstComparison);
function stopHint() {
  firstComparison.classList.add('hint-interrupted');
  firstComparison.classList.remove('is-hinting');
  hintUsed = true;
  hint.disconnect();
  cancelAnimationFrame(hintFrame);
}
['pointerdown', 'touchstart', 'keydown', 'focus'].forEach(type => firstRange.addEventListener(type, stopHint, { passive: true }));

const photoDialog = document.querySelector('.photo-dialog');
const photoImage = photoDialog.querySelector('.photo-large');
const photoStatus = photoDialog.querySelector('.photo-status');
const photoButtons = [...photoDialog.querySelectorAll('[data-photo]')];
let photoCard;
let photoOpener;
function showPhoto(side) {
  const original = photoCard.querySelector(side === 'a' ? '.cd-resize-img img' : '.cd-base-img img');
  photoStatus.textContent = 'Đang tải ảnh…';
  photoImage.style.visibility = 'hidden';
  photoImage.alt = original.alt;
  photoImage.src = original.currentSrc || original.src;
  photoButtons.forEach(button => button.setAttribute('aria-pressed', String(button.dataset.photo === side)));
}
photoImage.addEventListener('load', () => {
  photoStatus.textContent = '';
  photoImage.style.visibility = '';
});
photoImage.addEventListener('error', () => { photoStatus.textContent = 'Chưa tải được ảnh. Hãy thử chọn ảnh còn lại hoặc mở lại.'; });
photoButtons.forEach(button => button.addEventListener('click', () => showPhoto(button.dataset.photo)));
document.querySelectorAll('.view-large').forEach(button => {
  button.hidden = true; // Temporarily unused; keep the viewer for later.
  button.addEventListener('click', () => {
    stopHint();
    photoOpener = button;
    photoCard = button.closest('.comparison-card');
    photoDialog.querySelector('h2').textContent = photoCard.querySelector('h3').textContent;
    showPhoto('a');
    document.documentElement.classList.add('photo-open');
    photoDialog.showModal();
  });
});
photoDialog.querySelector('.photo-close').addEventListener('click', () => photoDialog.close());
photoDialog.addEventListener('click', event => {
  const box = photoDialog.getBoundingClientRect();
  if (event.target === photoDialog && (event.clientX < box.left || event.clientX > box.right || event.clientY < box.top || event.clientY > box.bottom)) photoDialog.close();
});
photoDialog.addEventListener('close', () => {
  document.documentElement.classList.remove('photo-open');
  photoOpener?.focus({ preventScroll: true });
});
