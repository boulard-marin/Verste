"use client";

import { useMotionValue, useMotionValueEvent, useReducedMotion, useScroll } from "motion/react";
import * as m from "motion/react-m";
import { useCallback, useEffect, useRef, useSyncExternalStore, type ReactNode } from "react";

const DESKTOP = "(min-width: 48rem)";

function subscribe(callback: () => void) {
  const query = window.matchMedia(DESKTOP);
  query.addEventListener("change", callback);
  return () => query.removeEventListener("change", callback);
}

/**
 * Looking out of the train window: on desktop the section is pinned and
 * vertical scrolling slides the destinations sideways. On touch screens it is
 * a native swipe (scroll-snap). With reduced motion, a plain horizontal list.
 */
export function DestinationsRail({ header, footer, children }: { header: ReactNode; footer: ReactNode; children: ReactNode }) {
  const sectionRef = useRef<HTMLElement>(null);
  const frameRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLOListElement>(null);

  const reduced = useReducedMotion();
  const desktop = useSyncExternalStore(subscribe, () => window.matchMedia(DESKTOP).matches, () => false);
  const pinned = desktop && !reduced;

  const { scrollYProgress } = useScroll({ target: sectionRef, offset: ["start start", "end end"] });
  const x = useMotionValue(0);
  const state = useRef({ distance: 0, pinned: false });

  // Set explicitly on every change (same pattern as the route scene): the
  // slide follows the scroll progress over the measured overflow.
  const slide = useCallback(() => {
    const { distance, pinned: on } = state.current;
    const t = Math.min(1, Math.max(0, (scrollYProgress.get() - 0.06) / 0.88));
    x.set(on ? -distance * t : 0);
  }, [scrollYProgress, x]);

  useMotionValueEvent(scrollYProgress, "change", slide);

  useEffect(() => {
    state.current.pinned = pinned;
    slide();
  }, [pinned, slide]);

  useEffect(() => {
    const track = trackRef.current;
    const frame = frameRef.current;
    if (!track || !frame) return;
    const observer = new ResizeObserver(() => {
      state.current.distance = Math.max(0, track.scrollWidth - frame.clientWidth);
      slide();
    });
    observer.observe(track);
    observer.observe(frame);
    return () => observer.disconnect();
  }, [slide]);

  return (
    <section
      ref={sectionRef}
      id="destinations"
      data-surface="russian"
      aria-labelledby="destinations-title"
      className="relative bg-surface text-fg md:h-[280vh] still:h-auto"
    >
      <div
        ref={frameRef}
        className="flex flex-col justify-center gap-12 overflow-hidden py-[clamp(5rem,12vh,9rem)] md:sticky md:top-0 md:h-[100svh] md:py-0 still:static still:h-auto still:py-[clamp(5rem,12vh,9rem)]"
      >
        {header}
        <div className="relative">
          {/* The verste line runs along the top of the stops */}
          <div aria-hidden="true" className="absolute inset-x-0 top-0 h-[2px] bg-route/80" />
          <m.div style={{ x }}>
            <ol
              ref={trackRef}
              className="gutter flex snap-x snap-mandatory scroll-px-4 gap-8 overflow-x-auto pb-4 [scrollbar-width:none] md:gap-12 md:overflow-x-visible md:pr-[20vw] still:overflow-x-auto"
            >
              {children}
            </ol>
          </m.div>
        </div>
        {footer}
      </div>
    </section>
  );
}
