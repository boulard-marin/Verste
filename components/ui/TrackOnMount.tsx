"use client";

import { useEffect } from "react";

import { track, type AnalyticsEvent, type AnalyticsProps } from "@/lib/analytics";

/** Records an event once, when the page that renders it is shown. */
export function TrackOnMount({ event, props }: { event: AnalyticsEvent; props?: AnalyticsProps }) {
  const key = JSON.stringify(props ?? {});
  useEffect(() => {
    track(event, JSON.parse(key) as AnalyticsProps);
  }, [event, key]);
  return null;
}
