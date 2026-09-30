"use client";

import "maplibre-gl/dist/maplibre-gl.css";

import type { GeoJSONSource, Map as MapLibreMap, Marker } from "maplibre-gl";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import type { MapData, MapGroup, MapPlace } from "@/lib/map/data";
import { loadMapLibre } from "@/lib/map/load";
import { buildNightStyle } from "@/lib/map/style";
import { cityViews, prefersReducedMotion, RUSSIA_BOUNDS, supportsWebGL } from "@/lib/map/views";
import { formatDistance, haversineKm } from "@/lib/travel/geo";
import type { LonLat } from "@/lib/travel/types";

import { PlaceSheet } from "./PlaceSheet";

const ROUTE = "#e8485a";
const FG2 = "#a9b8cc";

const groups: { id: MapGroup; label: string }[] = [
  { id: "culture", label: "Culture" },
  { id: "sport", label: "Sport" },
  { id: "nature", label: "Nature" },
  { id: "table", label: "Tables" },
  { id: "trajet", label: "Gares" },
];

const groupShape: Record<MapGroup, string> = {
  culture: "rounded-full",
  sport: "rotate-45 rounded-[2px]",
  nature: "rounded-full ring-2 ring-inset ring-night/60",
  table: "rounded-[2px]",
  trajet: "rounded-full opacity-70",
};

const lineFeature = (path: LonLat[], props: Record<string, unknown>) => ({
  type: "Feature" as const,
  properties: props,
  geometry: { type: "LineString" as const, coordinates: path.map((p) => [p[0], p[1]]) },
});

/**
 * RUSSIA TRAVEL MAP — the explorable layer of VERSTE. MapLibre is loaded only
 * here, on demand; the page around it stays usable without it (the full list
 * of places is rendered on the server below the map).
 */
export function RussiaTravelMap({ data }: { data: MapData }) {
  const container = useRef<HTMLDivElement>(null);
  const mapRef = useRef<MapLibreMap | null>(null);
  const markersRef = useRef<Map<string, { marker: Marker; place: MapPlace }>>(new Map());
  const [status, setStatus] = useState<"loading" | "ready" | "failed">("loading");
  const [selected, setSelected] = useState<MapPlace | null>(null);
  const [active, setActive] = useState<Record<MapGroup, boolean>>({ culture: true, sport: true, nature: true, table: true, trajet: true });
  const [showWalk, setShowWalk] = useState(true);
  const [showJourneys, setShowJourneys] = useState(true);
  const [zoom, setZoom] = useState(4);

  const placesById = useMemo(() => new Map(data.places.map((p) => [p.id, p])), [data.places]);

  const panelRef = useRef<HTMLDivElement>(null);

  /** Camera padding so targets land beside the panel (desktop) or above the sheet (phone). */
  const framePadding = useCallback((sheetOpen: boolean) => {
    const el = container.current;
    const panel = panelRef.current?.getBoundingClientRect();
    const h = el?.clientHeight ?? window.innerHeight;
    if (window.matchMedia("(min-width: 768px)").matches) {
      return { top: 24, bottom: 24, left: panel ? panel.width + 32 : 24, right: sheetOpen ? 440 : 24 };
    }
    return { top: !sheetOpen && panel ? panel.height + 16 : 16, left: 12, right: 12, bottom: sheetOpen ? Math.round(h * 0.6) : 12 };
  }, []);

  const fly = useCallback(
    (view: { center: LonLat; zoom: number; pitch?: number; bearing?: number }, sheetOpen = false) => {
      const map = mapRef.current;
      if (!map) return;
      const options = {
        center: [view.center[0], view.center[1]] as [number, number],
        zoom: view.zoom,
        pitch: view.pitch ?? 0,
        bearing: view.bearing ?? 0,
        padding: framePadding(sheetOpen),
      };
      if (prefersReducedMotion()) map.jumpTo(options);
      else map.flyTo({ ...options, duration: 2600, curve: 1.5, essential: true });
    },
    [framePadding],
  );

  const setUrl = useCallback((params: Record<string, string | null>) => {
    const url = new URL(window.location.href);
    for (const [k, v] of Object.entries(params)) {
      if (v) url.searchParams.set(k, v);
      else url.searchParams.delete(k);
    }
    window.history.replaceState(null, "", url);
  }, []);

  const selectPlace = useCallback(
    (place: MapPlace | null, move = true) => {
      setSelected(place);
      setUrl({ lieu: place?.id ?? null });
      const map = mapRef.current;
      const src = map?.getSource("selected") as GeoJSONSource | undefined;
      src?.setData({ type: "FeatureCollection", features: place ? [{ type: "Feature", properties: {}, geometry: { type: "Point", coordinates: [place.coords[0], place.coords[1]] } }] : [] });
      if (place && move && map) {
        fly({ center: place.coords, zoom: Math.max(map.getZoom(), 15.8), pitch: 55, bearing: map.getBearing() || -20 }, true);
      }
    },
    [fly, setUrl],
  );

  const goCity = useCallback(
    (id: string) => {
      const view = cityViews[id];
      if (!view) return;
      setSelected(null);
      setUrl({ ville: id, lieu: null });
      fly(view);
    },
    [fly, setUrl],
  );

  const overview = useCallback(() => {
    const map = mapRef.current;
    if (!map) return;
    setSelected(null);
    setUrl({ ville: null, lieu: null });
    map.fitBounds(RUSSIA_BOUNDS as [[number, number], [number, number]], { padding: framePadding(false), pitch: 0, bearing: 0, duration: prefersReducedMotion() ? 0 : 2200 });
  }, [setUrl, framePadding]);

  // Map creation, once.
  useEffect(() => {
    let cancelled = false;
    let map: MapLibreMap | undefined;
    const markers = markersRef.current;
    (async () => {
      if (!container.current) return;
      if (!supportsWebGL()) {
        setStatus("failed");
        return;
      }
      const ml = await loadMapLibre();
      if (cancelled || !container.current) return;
      map = new ml.Map({
        container: container.current,
        style: buildNightStyle(),
        bounds: RUSSIA_BOUNDS as [[number, number], [number, number]],
        fitBoundsOptions: { padding: framePadding(false) },
        maxPitch: 70,
        attributionControl: { compact: true },
        fadeDuration: 150,
      });
      mapRef.current = map;
      map.addControl(new ml.NavigationControl({ visualizePitch: true, showCompass: true }), window.matchMedia("(min-width: 768px)").matches ? "top-right" : "bottom-right");
      map.on("zoom", () => setZoom(map!.getZoom()));
      map.on("error", () => {
        // Tile errors are transient; only a missing style is fatal.
        if (!map?.isStyleLoaded()) setStatus((s) => (s === "loading" ? "failed" : s));
      });
      map.on("load", () => {
        if (!map) return;
        map.addSource("journeys", {
          type: "geojson",
          data: { type: "FeatureCollection", features: data.journeys.map((j) => lineFeature(j.path, { mode: j.mode })) },
        });
        map.addLayer({ id: "journey-flight", type: "line", source: "journeys", filter: ["==", ["get", "mode"], "avion"], paint: { "line-color": FG2, "line-opacity": 0.55, "line-width": 1.2, "line-dasharray": [2, 3] } });
        map.addLayer({ id: "journey-train", type: "line", source: "journeys", filter: ["==", ["get", "mode"], "train"], layout: { "line-cap": "round", "line-join": "round" }, paint: { "line-color": ROUTE, "line-width": ["interpolate", ["linear"], ["zoom"], 4, 1.6, 10, 3] } });
        map.addSource("walks", { type: "geojson", data: { type: "FeatureCollection", features: data.walks.map((w) => lineFeature(w.geometry, { id: w.id })) } });
        map.addLayer({ id: "walk-casing", type: "line", source: "walks", minzoom: 11, layout: { "line-cap": "round", "line-join": "round" }, paint: { "line-color": "#0c0f14", "line-width": ["interpolate", ["linear"], ["zoom"], 11, 3, 17, 9], "line-opacity": 0.8 } });
        map.addLayer({ id: "walk-line", type: "line", source: "walks", minzoom: 11, layout: { "line-cap": "round", "line-join": "round" }, paint: { "line-color": ROUTE, "line-width": ["interpolate", ["linear"], ["zoom"], 11, 1.5, 17, 5] } });
        map.addSource("selected", { type: "geojson", data: { type: "FeatureCollection", features: [] } });
        map.addLayer({ id: "selected-halo", type: "circle", source: "selected", paint: { "circle-radius": 18, "circle-color": "rgba(0,0,0,0)", "circle-stroke-color": ROUTE, "circle-stroke-width": 2 } });

        // Places: real buttons, so keyboard and screen readers can use the map.
        for (const place of data.places) {
          const el = document.createElement("button");
          el.type = "button";
          el.className = "verste-place";
          el.dataset.group = place.group;
          el.setAttribute("aria-label", `${place.fr}, ${place.categoryLabel}`);
          el.innerHTML = `<span class="verste-place-dot ${groupShape[place.group]}"></span><span class="verste-place-label">${place.fr}</span>`;
          el.addEventListener("click", (e) => {
            e.stopPropagation();
            selectPlace(place);
          });
          const marker = new ml.Marker({ element: el, anchor: "left", offset: [-6, 0] }).setLngLat([place.coords[0], place.coords[1]]).addTo(map);
          markers.set(place.id, { marker, place });
        }
        // Cities.
        for (const city of data.cities) {
          const el = document.createElement("button");
          el.type = "button";
          el.className = `verste-city${city.ready ? "" : " is-soon"}`;
          el.setAttribute("aria-label", city.ready ? `${city.fr} : explorer` : `${city.fr} : bientôt`);
          el.innerHTML = `<span class="verste-city-post"></span><span class="verste-city-names"><span lang="ru" class="verste-city-ru">${city.ru}</span><span class="verste-city-fr">${city.fr}${city.ready ? "" : " · bientôt"}</span></span>`;
          el.addEventListener("click", (e) => {
            e.stopPropagation();
            if (city.ready) goCity(city.id);
          });
          new ml.Marker({ element: el, anchor: "left", offset: [-5, 0] }).setLngLat([city.coords[0], city.coords[1]]).addTo(map);
        }
        // Walk stops.
        for (const walk of data.walks) {
          for (const stop of walk.stops) {
            const el = document.createElement("span");
            el.className = "verste-stop";
            el.textContent = stop.letter;
            el.setAttribute("aria-hidden", "true");
            new ml.Marker({ element: el }).setLngLat([stop.coords[0], stop.coords[1]]).addTo(map);
          }
        }
        setStatus("ready");
        setZoom(map.getZoom());

        const params = new URLSearchParams(window.location.search);
        const lieu = params.get("lieu");
        const ville = params.get("ville");
        const place = lieu ? placesById.get(lieu) : undefined;
        if (place) selectPlace(place);
        else if (ville && cityViews[ville]) fly(cityViews[ville]!);
      });
    })();
    return () => {
      cancelled = true;
      markers.clear();
      map?.remove();
      mapRef.current = null;
    };
    // The map is created once; handlers read fresh data through refs and stable callbacks.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Filters and zoom-dependent visibility.
  useEffect(() => {
    for (const { marker, place } of markersRef.current.values()) {
      const visible = active[place.group] && zoom >= 9.5;
      marker.getElement().style.display = visible ? "" : "none";
      marker.getElement().classList.toggle("is-selected", selected?.id === place.id);
      marker.getElement().classList.toggle("show-label", zoom >= 14.2 || selected?.id === place.id);
    }
    const map = mapRef.current;
    if (map?.getLayer("walk-line")) {
      for (const id of ["walk-line", "walk-casing"]) map.setLayoutProperty(id, "visibility", showWalk ? "visible" : "none");
      for (const id of ["journey-train", "journey-flight"]) map.setLayoutProperty(id, "visibility", showJourneys ? "visible" : "none");
      for (const el of document.querySelectorAll<HTMLElement>(".verste-stop")) el.style.display = showWalk && zoom >= 12.5 ? "" : "none";
      for (const el of document.querySelectorAll<HTMLElement>(".verste-city")) el.style.display = zoom >= 11 ? "none" : "";
    }
  }, [active, zoom, selected, showWalk, showJourneys, status]);

  const distanceLabel = useMemo(() => {
    if (!selected) return undefined;
    const city = data.cities.find((c) => c.id === selected.cityId);
    if (!city) return undefined;
    return `${formatDistance(haversineKm(selected.coords, city.coords))} du centre de ${city.fr}, à vol d'oiseau (calculé)`;
  }, [selected, data.cities]);

  const walk = data.walks[0];

  return (
    <div data-surface="night" className="relative h-full w-full overflow-hidden bg-night text-fg">
      {/* MapLibre forces position: relative on its container: size it with h-full, not inset-0. */}
      <div ref={container} data-lenis-prevent className="h-full w-full" aria-label="Carte interactive de la Russie" role="region" />

      {status !== "ready" && (
        <div className="absolute inset-0 grid place-items-center bg-night" aria-live="polite">
          <p className="label text-fg-2">{status === "failed" ? "La carte ne peut pas s'afficher sur cet appareil. La liste des lieux est juste en dessous." : "La carte se charge…"}</p>
        </div>
      )}

      {/* Title and filters */}
      <div className={`pointer-events-none absolute inset-x-0 top-0 z-10 p-3 md:p-5 ${selected ? "max-md:hidden" : ""}`}>
        <div ref={panelRef} className="pointer-events-auto max-w-[520px] rounded-[6px] border border-line bg-night/80 p-3 backdrop-blur-md md:p-5">
          <p className="label text-fg-2 max-md:hidden">Carte du voyage</p>
          <h1 className="font-display font-cond text-[1.35rem] leading-none tracking-wide uppercase md:mt-1 md:text-[clamp(1.5rem,3.4vw,2.4rem)]">Russia Travel Map</h1>
          <div className="-mx-1 mt-3 flex gap-2 overflow-x-auto px-1 [scrollbar-width:none] md:flex-wrap [&::-webkit-scrollbar]:hidden">
            <button type="button" onClick={overview} className="label shrink-0 rounded-full border border-line px-3 py-2 text-fg-2 hover:text-fg">
              Vue d&apos;ensemble
            </button>
            {data.cities
              .filter((c) => c.ready)
              .map((c) => (
                <button key={c.id} type="button" onClick={() => goCity(c.id)} className="label shrink-0 rounded-full border border-line px-3 py-2 text-fg hover:border-fg/50">
                  {c.fr}
                </button>
              ))}
          </div>
          <fieldset className="-mx-1 mt-2 flex gap-2 md:mt-3 overflow-x-auto px-1 pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            <legend className="sr-only">Afficher</legend>
            {groups.map((g) => (
              <label key={g.id} className="label flex shrink-0 cursor-pointer items-center gap-2 rounded-full border border-line px-3 py-2 text-fg-2 has-checked:border-fg/50 has-checked:text-fg">
                <input
                  type="checkbox"
                  className="sr-only"
                  checked={active[g.id]}
                  onChange={(e) => setActive((a) => ({ ...a, [g.id]: e.target.checked }))}
                />
                <span aria-hidden="true" className={`size-2 bg-current ${groupShape[g.id]}`} />
                {g.label}
              </label>
            ))}
            <label className="label flex shrink-0 cursor-pointer items-center gap-2 rounded-full border border-line px-3 py-2 text-fg-2 has-checked:border-fg/50 has-checked:text-fg">
              <input type="checkbox" className="sr-only" checked={showJourneys} onChange={(e) => setShowJourneys(e.target.checked)} />
              <span aria-hidden="true" className="h-0.5 w-4 bg-route" />
              Trajets
            </label>
            {walk && (
              <label className="label flex shrink-0 cursor-pointer items-center gap-2 rounded-full border border-line px-3 py-2 text-fg-2 has-checked:border-fg/50 has-checked:text-fg">
                <input type="checkbox" className="sr-only" checked={showWalk} onChange={(e) => setShowWalk(e.target.checked)} />
                <span aria-hidden="true" className="h-0.5 w-4 border-t-2 border-dotted border-route" />
                {walk.name}
              </label>
            )}
          </fieldset>
        </div>
      </div>

      {/* Legend */}
      <div className="pointer-events-none absolute bottom-3 left-3 z-10 hidden max-w-[360px] rounded-[6px] border border-line bg-night/80 p-3 text-[0.78rem] text-fg-2 backdrop-blur-md md:block">
        <p className="flex items-center gap-2">
          <span aria-hidden="true" className="h-0.5 w-5 bg-route" /> Lastochka Moscou → Nijni · tracé indicatif par les gares
        </p>
        <p className="mt-1 flex items-center gap-2">
          <span aria-hidden="true" className="w-5 border-t border-dashed border-fg-2" /> Vol Paris → Istanbul → Moscou · grand cercle
        </p>
        {walk && (
          <p className="mt-1 flex items-center gap-2">
            <span aria-hidden="true" className="h-1 w-5 rounded bg-route" /> {walk.name} · {formatDistance(walk.km)}, itinéraire piéton calculé
          </p>
        )}
      </div>

      {selected && <PlaceSheet place={selected} distanceLabel={distanceLabel} onClose={() => selectPlace(null, false)} />}
    </div>
  );
}
