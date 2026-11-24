/**
 * Eased, interruptible page scroll — no dependency.
 *
 * Native `behavior: 'smooth'` has no control over duration or curve; scroll
 * libraries (Lenis & co.) take over all wheel scrolling. This animates only
 * when asked, yields immediately to the user (wheel / touch / keys), and
 * jumps instantly under prefers-reduced-motion.
 */
const easeInOutCubic = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);

let cancelActive: (() => void) | null = null;

export function smoothScrollTo(targetY: number): Promise<void> {
  cancelActive?.();
  const maxY = document.documentElement.scrollHeight - window.innerHeight;
  const to = Math.max(0, Math.min(targetY, maxY));
  const from = window.scrollY;
  const distance = to - from;

  if (Math.abs(distance) < 2 || window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    window.scrollTo(0, to);
    return Promise.resolve();
  }

  // Longer trips take a little longer, but never feel sluggish.
  const duration = Math.min(1100, Math.max(450, 350 + Math.abs(distance) * 0.25));

  return new Promise((resolve) => {
    let frame = 0;
    const start = performance.now();
    const stop = () => {
      cancelAnimationFrame(frame);
      window.removeEventListener('wheel', stop);
      window.removeEventListener('touchstart', stop);
      window.removeEventListener('keydown', stop);
      cancelActive = null;
      resolve();
    };
    const step = (now: number) => {
      const t = Math.min(1, (now - start) / duration);
      window.scrollTo(0, from + distance * easeInOutCubic(t));
      if (t < 1) frame = requestAnimationFrame(step);
      else stop();
    };
    window.addEventListener('wheel', stop, { passive: true });
    window.addEventListener('touchstart', stop, { passive: true });
    window.addEventListener('keydown', stop);
    cancelActive = stop;
    frame = requestAnimationFrame(step);
  });
}

/** Scrolls a section below the sticky header, then moves focus there and flashes it. */
export async function scrollToSection(el: HTMLElement) {
  const header = document.querySelector<HTMLElement>('.app-header');
  const offset = (header?.getBoundingClientRect().height ?? 0) + 16;
  await smoothScrollTo(el.getBoundingClientRect().top + window.scrollY - offset);

  // Keyboard & screen-reader users land where they asked to go.
  if (!el.hasAttribute('tabindex')) el.setAttribute('tabindex', '-1');
  el.focus({ preventScroll: true });

  el.classList.remove('is-target');
  void el.offsetWidth; // restart the highlight animation if picked twice
  el.classList.add('is-target');
  window.setTimeout(() => el.classList.remove('is-target'), 1400);
}
