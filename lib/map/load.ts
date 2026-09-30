import { MAPLIBRE_WORKER_URL } from "./worker-url";

let loading: Promise<typeof import("maplibre-gl")> | null = null;

/** Loads MapLibre once, on demand, with its worker served from public/vendor. */
export function loadMapLibre() {
  loading ??= import("maplibre-gl").then((ml) => {
    ml.setWorkerUrl(new URL(MAPLIBRE_WORKER_URL, window.location.origin).href);
    return ml;
  });
  return loading;
}
