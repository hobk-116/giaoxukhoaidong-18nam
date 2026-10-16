/* Image comparison adapted from CodyHouse:
 * https://github.com/CodyHouse/image-comparison-slider
 * Keeps the original figure / cd-resize-img / cd-handle structure.
 * Uses native range events for mouse, touch and keyboard instead of jQuery.
 */
const header = document.querySelector('.site-header');
const hero = document.querySelector('.hero');
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
  headerFrame = null;
}
function scheduleHeader() {
  if (!headerFrame) headerFrame = requestAnimationFrame(updateHeader);
}
window.addEventListener('scroll', scheduleHeader, { passive: true });
window.addEventListener('resize', scheduleHeader);
new ResizeObserver(scheduleHeader).observe(hero);
updateHeader();

const anniversary = document.querySelector('.milestones-overlay');
anniversary.classList.add('is-ready');

document.querySelectorAll('.cd-image-container').forEach((figure) => {
  const range = figure.querySelector('.comparison-range');

  function update() {
    const position = Number(range.value);
    figure.style.setProperty('--progress', position / 100);
    range.setAttribute('aria-valuetext', `Vị trí thanh chia ${position}%`);
  }

  range.addEventListener('input', update);
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
