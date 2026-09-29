"use client";

import type { ReactNode } from "react";

import { track, type AnalyticsEvent, type AnalyticsProps } from "@/lib/analytics";

/**
 * Wraps server-rendered links or buttons to record a funnel event on click,
 * without turning the wrapped element into a client component.
 */
export function Track({ event, props, children }: { event: AnalyticsEvent; props?: AnalyticsProps; children: ReactNode }) {
  return (
    <span className="contents" onClickCapture={() => track(event, props)}>
      {children}
    </span>
  );
}
