// SVG artwork remains a static image without JavaScript or with reduced motion.
// Pausing swaps in the equivalent still; the illustration conveys no data.
const preference = window.matchMedia('(prefers-reduced-motion: reduce)');

for (const figure of document.querySelectorAll('[data-svg-hero]')) {
  const image = figure.querySelector('img');
  const button = figure.querySelector('button');
  if (!image || !button) continue;
  const still = image.getAttribute('src');
  const animated = image.dataset.animatedSrc;
  if (!still || !animated) continue;
  let paused = false;
  let inView = true;
  let printing = false;

  const render = () => {
    const running = !paused && !preference.matches && inView && !document.hidden && !printing;
    const source = running ? animated : still;
    if (image.getAttribute('src') !== source) image.setAttribute('src', source);
    button.hidden = preference.matches;
    button.textContent = paused ? 'Play animation' : 'Pause animation';
  };
  button.addEventListener('click', () => { paused = !paused; render(); });
  preference.addEventListener('change', render);
  document.addEventListener('visibilitychange', render);
  window.addEventListener('beforeprint', () => { printing = true; render(); });
  window.addEventListener('afterprint', () => { printing = false; render(); });
  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver(([entry]) => {
      inView = entry.isIntersecting;
      render();
    });
    observer.observe(figure);
  }
  render();
}
