"use client";

import { domMin, LazyMotion } from "motion/react";
import type { ReactNode } from "react";

/**
 * Loads Motion's DOM renderer once for the whole app. The lightweight `m`
 * components used everywhere have no renderer of their own: without this
 * provider their motion values are never written to the page. `strict`
 * forbids the heavier `motion` components.
 */
export function MotionProvider({ children }: { children: ReactNode }) {
  return (
    <LazyMotion features={domMin} strict>
      {children}
    </LazyMotion>
  );
}
