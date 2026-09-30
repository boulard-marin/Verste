"use client";

import { useSyncExternalStore } from "react";

/**
 * "Mon voyage": the places a visitor adds while exploring. A per-visitor
 * convenience kept in this browser only (nothing is sent anywhere); the
 * configurator receives it as a URL parameter when the visitor asks.
 */

const KEY = "verste:voyage";
const EVENT = "verste:voyage";
const EMPTY: string[] = [];
let cache: { raw: string | null; value: string[] } = { raw: null, value: EMPTY };

function read(): string[] {
  try {
    const raw = window.localStorage.getItem(KEY);
    if (raw === cache.raw) return cache.value;
    const parsed = raw ? JSON.parse(raw) : [];
    cache = { raw, value: Array.isArray(parsed) ? parsed.filter((x): x is string => typeof x === "string") : EMPTY };
    return cache.value;
  } catch {
    return EMPTY;
  }
}

function write(ids: string[]) {
  try {
    window.localStorage.setItem(KEY, JSON.stringify(ids));
  } catch {
    // Private mode or blocked storage: the list simply does not persist.
  }
  window.dispatchEvent(new Event(EVENT));
}

export function toggleTripPlace(id: string) {
  const ids = read();
  write(ids.includes(id) ? ids.filter((x) => x !== id) : [...ids, id]);
}

export function removeTripPlace(id: string) {
  write(read().filter((x) => x !== id));
}

function subscribe(callback: () => void) {
  window.addEventListener(EVENT, callback);
  window.addEventListener("storage", callback);
  return () => {
    window.removeEventListener(EVENT, callback);
    window.removeEventListener("storage", callback);
  };
}

export function useTrip(): string[] {
  return useSyncExternalStore(subscribe, read, () => EMPTY);
}
