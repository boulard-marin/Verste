"use client";

import { useEffect, useRef, type ReactNode } from "react";

import { track, type AnalyticsEvent } from "@/lib/analytics";

/** Records an event the first time its content is at least 40 % visible. */
export function ViewTracker({ event, children }: { event: AnalyticsEvent; children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          track(event);
          observer.disconnect();
        }
      },
      { threshold: 0.4 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [event]);

  return <div ref={ref}>{children}</div>;
}
