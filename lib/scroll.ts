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
