import type Lenis from "lenis";

/**
 * Shared handle on the smooth-scroll instance, so overlays (mobile menu) can
 * pause it. Null on touch devices and with reduced motion: native scroll.
 */
let instance: Lenis | null = null;

export function setLenis(lenis: Lenis | null): void {
  instance = lenis;
}

export function pauseScroll(): void {
  instance?.stop();
  document.documentElement.style.overflow = "hidden";
}

export function resumeScroll(): void {
  instance?.start();
  document.documentElement.style.overflow = "";
}

/**
 * Scrolls to an absolute position: through Lenis when it runs (desktop), with
 * the native smooth behaviour otherwise, instantly with reduced motion.
 * `duration` in seconds scales with the distance so long journeys feel travelled.
 */
export function scrollToY(y: number, opts: { immediate?: boolean } = {}): void {
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const distance = Math.abs(y - window.scrollY);
  const duration = Math.min(4.5, 1.2 + distance / 4000);
  if (instance) {
    instance.scrollTo(y, { immediate: reduced || opts.immediate, duration, easing: (t) => 1 - Math.pow(1 - t, 3) });
    return;
  }
  window.scrollTo({ top: y, behavior: reduced || opts.immediate ? "auto" : "smooth" });
}
