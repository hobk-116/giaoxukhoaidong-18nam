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
  const progress = Math.max(0, Math.min(1, scrollY / 125));
  const inkProgress = progress;
  header.style.setProperty('--header-progress', progress);
  header.style.setProperty('--header-ink-progress', inkProgress);
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

reducedMotion.addEventListener('change', () => {
  if (reducedMotion.matches) document.getAnimations().forEach(animation => animation.cancel());
});

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

// Teach the gesture on the most visible comparison until any comparison is used.
const comparisons = [...document.querySelectorAll('.cd-image-container')];
let hintsDismissed = false;
const cumulative = [0];
const heroCumulative = [0];
for (let i = 1; i <= 120; i++) {
  const x = -3 + (i - .5) / 20;
  cumulative.push(cumulative[i - 1] + Math.exp(-x * x / 2));
  // Move the Gaussian center from 50% to 60%, keeping its original spread.
  heroCumulative.push(heroCumulative[i - 1] + Math.exp(-((x - .6) ** 2) / 2));
}
function gaussianPosition(t, curve = cumulative) {
  const index = Math.max(0, Math.min(1, t)) * 120;
  const lower = Math.floor(index);
  return (curve[lower] + (curve[Math.min(lower + 1, 120)] - curve[lower]) * (index - lower)) / curve[120];
}

// Follow the hero's existing animation clock so zoom, reveal and scroll finish together.
if (innerWidth > 600 && hero.offsetHeight > innerHeight && scrollY === 0 && !location.hash && !reducedMotion.matches) {
  const heroZoom = hero.querySelector('.hero-images img').getAnimations()[0];
  if (heroZoom) {
    const target = Math.max(0, hero.offsetTop + hero.offsetHeight * .95 - innerHeight);
    const controls = new AbortController();
    let frame;
    function stopHeroScroll() {
      cancelAnimationFrame(frame);
      controls.abort();
    }
    function tickHeroScroll() {
      const progress = Math.min(1, (heroZoom.currentTime || 0) / 3370);
      window.scrollTo({ top: target * gaussianPosition(progress, heroCumulative), behavior: 'instant' });
      if (progress < 1) frame = requestAnimationFrame(tickHeroScroll);
      else stopHeroScroll();
    }
    for (const event of ['wheel', 'touchstart', 'pointerdown', 'resize', 'pagehide']) {
      window.addEventListener(event, stopHeroScroll, { passive: true, signal: controls.signal });
    }
    window.addEventListener('keydown', event => {
      if (['ArrowUp', 'ArrowDown', 'PageUp', 'PageDown', 'Home', 'End', ' '].includes(event.key)) stopHeroScroll();
    }, { signal: controls.signal });
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) stopHeroScroll();
    }, { signal: controls.signal });
    reducedMotion.addEventListener('change', stopHeroScroll, { signal: controls.signal });
    frame = requestAnimationFrame(tickHeroScroll);
  }
}
let activeHint;
let hintFrame;
let hintTimer;
let selectionFrame;
function stopHint() {
  cancelAnimationFrame(hintFrame);
  clearTimeout(hintTimer);
  if (!activeHint) return;
  activeHint.classList.remove('is-hinting');
  if (!hintsDismissed) {
    const range = activeHint.querySelector('.comparison-range');
    range.value = '50';
    range.dispatchEvent(new Event('input'));
  }
  activeHint = null;
}
function startHint(figure) {
  activeHint = figure;
  const range = figure.querySelector('.comparison-range');
  figure.classList.remove('hint-interrupted');
  figure.style.setProperty('--hint-opacity', 0);
  figure.classList.add('is-hinting');
  const start = performance.now();
  function tick(now) {
    if (activeHint !== figure || range.disabled) { selectHint(); return; }
    const elapsed = Math.min(2400, now - start);
    if (elapsed >= 1800) figure.classList.remove('is-hinting');
    let position;
    if (elapsed < 600) {
      // Integrate the full bell-shaped velocity curve, starting and ending gently.
      const progress = gaussianPosition(elapsed / 600);
      figure.style.setProperty('--hint-opacity', progress);
      position = 50 - 49 * progress;
    } else if (elapsed < 1800) {
      figure.style.setProperty('--hint-opacity', 1);
      position = 1 + 98 * gaussianPosition((elapsed - 600) / 1200);
    } else {
      position = 99 - 49 * gaussianPosition((elapsed - 1800) / 600);
    }
    range.value = String(position);
    range.dispatchEvent(new Event('input'));
    if (elapsed < 2400) hintFrame = requestAnimationFrame(tick);
    else hintTimer = setTimeout(() => {
      selectHint();
      if (activeHint === figure) startHint(figure);
    }, 2000);
  }
  hintFrame = requestAnimationFrame(tick);
}
function selectHint() {
  if (hintsDismissed || reducedMotion.matches || document.hidden) { stopHint(); return; }
  let best;
  let largestArea = 0;
  for (const figure of comparisons) {
    const range = figure.querySelector('.comparison-range');
    if (range.disabled || [...figure.querySelectorAll('img')].some(img => !img.complete || !img.naturalWidth)) continue;
    const rect = figure.getBoundingClientRect();
    const width = Math.max(0, Math.min(rect.right, innerWidth) - Math.max(rect.left, 0));
    const height = Math.max(0, Math.min(rect.bottom, innerHeight) - Math.max(rect.top, 0));
    const area = width * height;
    if (area > largestArea) { best = figure; largestArea = area; }
  }
  if (best === activeHint) return;
  stopHint();
  if (best) startHint(best);
}
function scheduleHint() {
  if (!selectionFrame) selectionFrame = requestAnimationFrame(() => {
    selectionFrame = null;
    selectHint();
  });
}
comparisons.forEach(figure => {
  const range = figure.querySelector('.comparison-range');
  function markUsed() {
    hintsDismissed = true;
    comparisons.forEach(item => item.classList.add('hint-interrupted'));
    stopHint();
  }
  figure.addEventListener('pointerdown', markUsed, { passive: true });
  range.addEventListener('keydown', markUsed);
  range.addEventListener('focus', markUsed);
  figure.querySelectorAll('img').forEach(img => img.addEventListener('load', scheduleHint));
});
window.addEventListener('scroll', scheduleHint, { passive: true });
window.addEventListener('resize', scheduleHint);
document.addEventListener('visibilitychange', scheduleHint);
reducedMotion.addEventListener('change', scheduleHint);
scheduleHint();

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
