"use client";

import "maplibre-gl/dist/maplibre-gl.css";

import type { GeoJSONSource, Map as MapLibreMap, Marker } from "maplibre-gl";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import type { MapCityView, MapData, MapGroup, MapJourney, MapPlace } from "@/lib/map/data";
import { loadMapLibre } from "@/lib/map/load";
import { applyPalette } from "@/lib/map/palettes";
import { buildNightStyle } from "@/lib/map/style";
import { prefersReducedMotion, RUSSIA_BOUNDS, supportsWebGL } from "@/lib/map/views";
import { formatKm } from "@/lib/format";
import { bearingDeg, formatDistance, haversineKm, pointAlong, sliceAlong } from "@/lib/travel/geo";
import type { CityId, LonLat } from "@/lib/travel/types";
import type { CityWeather } from "@/lib/weather";

import { CityPanel } from "./CityPanel";
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

const statusShort = { terrain: "vécu", destination: "destination", "a-venir": "à venir" } as const;

const lineFeature = (path: readonly LonLat[], props: Record<string, unknown>) => ({
  type: "Feature" as const,
  properties: props,
  geometry: { type: "LineString" as const, coordinates: path.map((p) => [p[0], p[1]]) },
});

const ease = (t: number) => 0.5 - 0.5 * Math.cos(Math.PI * Math.min(1, Math.max(0, t)));

/**
 * RUSSIA TRAVEL MAP. The whole country on a globe, then a destination: the
 * camera rises over Moscow, follows the line to the city, turns with it, and
 * lands in the city's own palette; then its districts and its places. What
 * was lived on the ground and what VERSTE prepares from sources are never
 * mixed up. The full list of places is rendered on the server below the map.
 */
export function RussiaTravelMap({ data }: { data: MapData }) {
  const container = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<MapLibreMap | null>(null);
  const placeMarkers = useRef<Map<string, { marker: Marker; place: MapPlace }>>(new Map());
  const cityEls = useRef<Map<string, HTMLElement>>(new Map());
  const token = useRef(0);
  const [status, setStatus] = useState<"loading" | "ready" | "failed">("loading");
  const [cityId, setCityId] = useState<CityId | null>(null);
  const [selected, setSelected] = useState<MapPlace | null>(null);
  const [active, setActive] = useState<Record<MapGroup, boolean>>({ culture: true, sport: true, nature: true, table: true, trajet: true });
  const [zoom, setZoom] = useState(3);
  const [travelling, setTravelling] = useState(false);
  const [weather, setWeather] = useState<CityWeather[]>([]);
  const [clock, setClock] = useState<string>();

  const city = data.cities.find((c) => c.id === cityId);
  const journeyOf = useCallback((c?: MapCityView): MapJourney | undefined => data.journeys.find((j) => j.id === c?.journey), [data.journeys]);
  const placesById = useMemo(() => new Map(data.places.map((p) => [p.id, p])), [data.places]);
  const moscow = data.cities.find((c) => c.id === "moscou")!;

  /**
   * Camera padding so targets land in the free part of the screen: beside the
   * panel on large screens; below the country panel, or above the city sheet
   * and the place sheet, on phones.
   */
  const framePadding = useCallback((mode: "overview" | "city" | "place") => {
    const h = container.current?.clientHeight ?? window.innerHeight;
    if (window.matchMedia("(min-width: 768px)").matches) {
      return { top: 24, bottom: 24, left: 440 + 40, right: mode === "place" ? 440 : 24 };
    }
    if (mode === "overview") return { top: Math.round((panelRef.current?.getBoundingClientRect().height ?? 120) + 24), left: 12, right: 12, bottom: 12 };
    return { top: 16, left: 12, right: 12, bottom: Math.round(h * (mode === "place" ? 0.62 : 0.5)) };
  }, []);

  const setUrl = useCallback((params: Record<string, string | null>) => {
    const url = new URL(window.location.href);
    for (const [k, v] of Object.entries(params)) {
      if (v) url.searchParams.set(k, v);
      else url.searchParams.delete(k);
    }
    window.history.replaceState(null, "", url);
  }, []);

  const drawJourney = useCallback((path: readonly LonLat[] | null) => {
    const src = mapRef.current?.getSource("journey-draw") as GeoJSONSource | undefined;
    src?.setData({ type: "FeatureCollection", features: path && path.length > 1 ? [lineFeature(path, {})] : [] });
  }, []);

  const overview = useCallback(() => {
    const map = mapRef.current;
    token.current++;
    setTravelling(false);
    setCityId(null);
    setSelected(null);
    setUrl({ ville: null, lieu: null });
    if (!map) return;
    drawJourney(null);
    applyPalette(map, "moscou");
    map.fitBounds(RUSSIA_BOUNDS as [[number, number], [number, number]], { padding: framePadding("overview"), pitch: 0, bearing: 0, duration: prefersReducedMotion() ? 0 : 2200 });
  }, [setUrl, framePadding, drawJourney]);

  /**
   * Enter a city. From Moscow, the journey is played: the camera rises, the
   * line draws and the camera follows it, turning with it, then the city
   * comes close and the palette changes.
   */
  const enterCity = useCallback(
    (c: MapCityView, travel = true) => {
      const map = mapRef.current;
      if (!map || c.status === "a-venir") return;
      const run = ++token.current;
      setSelected(null);
      setCityId(c.id);
      setUrl({ ville: c.id, lieu: null });
      const j = journeyOf(c);
      const land = () => {
        if (run !== token.current) return;
        setTravelling(false);
        drawJourney(j?.path ?? null);
        applyPalette(map, c.palette);
        const options = { center: [c.coords[0], c.coords[1]] as [number, number], zoom: c.view.zoom, pitch: c.view.pitch, bearing: c.view.bearing, padding: framePadding("city") };
        if (prefersReducedMotion()) map.jumpTo(options);
        else map.flyTo({ ...options, duration: 2600, curve: 1.3, essential: true });
      };
      if (!j || !travel || prefersReducedMotion()) return land();
      setTravelling(true);
      drawJourney(null);
      applyPalette(map, "moscou");
      map.flyTo({ center: [moscow.coords[0], moscow.coords[1]], zoom: 4.7, pitch: 38, bearing: 0, padding: framePadding("overview"), duration: 1500, essential: true });
      map.once("moveend", () => {
        if (run !== token.current) return;
        const start = performance.now();
        const D = 2800;
        const step = (now: number) => {
          if (run !== token.current) return;
          const t = Math.min(1, (now - start) / D);
          const e = ease(t);
          const tip = pointAlong(j.path, e);
          drawJourney(sliceAlong(j.path, e));
          const heading = bearingDeg(pointAlong(j.path, Math.max(0, e - 0.03)), pointAlong(j.path, Math.min(1, e + 0.03)));
          map.jumpTo({
            center: [tip[0], tip[1]],
            zoom: 4.7 + 0.5 * Math.sin(Math.PI * e) + 1.6 * e,
            pitch: 38 + 14 * e,
            // The camera turns partly with the line, then comes back before landing.
            bearing: (((heading + 540) % 360) - 180) * 0.35 * Math.sin(Math.PI * e),
            padding: framePadding("city"),
          });
          if (t < 1) requestAnimationFrame(step);
          else land();
        };
        requestAnimationFrame(step);
      });
    },
    [journeyOf, setUrl, drawJourney, framePadding, moscow.coords],
  );

  const selectPlace = useCallback(
    (place: MapPlace | null, move = true) => {
      setSelected(place);
      setUrl({ lieu: place?.id ?? null });
      const map = mapRef.current;
      const src = map?.getSource("selected") as GeoJSONSource | undefined;
      src?.setData({ type: "FeatureCollection", features: place ? [{ type: "Feature", properties: {}, geometry: { type: "Point", coordinates: [place.coords[0], place.coords[1]] } }] : [] });
      if (!place || !map) return;
      if (place.cityId !== cityId) {
        token.current++;
        setTravelling(false);
        setCityId(place.cityId);
        const c = data.cities.find((x) => x.id === place.cityId);
        if (c) applyPalette(map, c.palette);
      }
      if (move) {
        const options = { center: [place.coords[0], place.coords[1]] as [number, number], zoom: Math.max(map.getZoom(), 15.8), pitch: 55, bearing: map.getBearing() || -20, padding: framePadding("place") };
        if (prefersReducedMotion()) map.jumpTo(options);
        else map.flyTo({ ...options, duration: 2200, curve: 1.4, essential: true });
      }
    },
    [setUrl, framePadding, cityId, data.cities],
  );

  // Marker handlers always call the latest callbacks.
  const selectPlaceRef = useRef(selectPlace);
  const enterCityRef = useRef(enterCity);
  useEffect(() => {
    selectPlaceRef.current = selectPlace;
    enterCityRef.current = enterCity;
  }, [selectPlace, enterCity]);

  // The weather of the cities (our own cached route, never a third party from the browser).
  useEffect(() => {
    let cancelled = false;
    fetch("/api/meteo")
      .then((r) => (r.ok ? r.json() : { cities: [] }))
      .then((j: { cities: CityWeather[] }) => !cancelled && setWeather(j.cities ?? []))
      .catch(() => {});
    const tick = () => setClock(new Intl.DateTimeFormat("fr-FR", { timeZone: "Europe/Moscow", hour: "2-digit", minute: "2-digit" }).format(new Date()).replace(":", " h "));
    tick();
    const id = window.setInterval(tick, 30000);
    return () => {
      cancelled = true;
      window.clearInterval(id);
    };
  }, []);

  // Map creation, once.
  useEffect(() => {
    let cancelled = false;
    let map: MapLibreMap | undefined;
    const markers = placeMarkers.current;
    const cityMap = cityEls.current;
    const runs = token;
    (async () => {
      if (!container.current) return;
      if (!supportsWebGL()) {
        setStatus("failed");
        return;
      }
      const ml = await loadMapLibre();
      if (cancelled || !container.current) return;
      const style = buildNightStyle();
      style.transition = { duration: 1200, delay: 0 };
      map = new ml.Map({
        container: container.current,
        style,
        bounds: RUSSIA_BOUNDS as [[number, number], [number, number]],
        fitBoundsOptions: { padding: framePadding("overview") },
        maxPitch: 72,
        attributionControl: { compact: true },
        fadeDuration: 150,
      });
      mapRef.current = map;
      map.addControl(new ml.NavigationControl({ visualizePitch: true, showCompass: true }), window.matchMedia("(min-width: 768px)").matches ? "top-right" : "bottom-right");
      map.on("zoom", () => setZoom(map!.getZoom()));
      map.on("error", () => {
        if (!map?.isStyleLoaded()) setStatus((s) => (s === "loading" ? "failed" : s));
      });
      map.on("load", () => {
        if (!map) return;
        // Districts appear as you get closer: the map becomes a city.
        map.addLayer({
          id: "districts",
          type: "symbol",
          source: "openmaptiles",
          "source-layer": "place",
          minzoom: 11.2,
          maxzoom: 15.5,
          filter: ["match", ["get", "class"], ["suburb", "quarter", "neighbourhood"], true, false],
          layout: {
            "text-field": ["coalesce", ["get", "name:latin"], ["get", "name"]],
            "text-font": ["Noto Sans Regular"],
            "text-size": ["interpolate", ["linear"], ["zoom"], 11, 10, 15, 13],
            "text-transform": "uppercase",
            "text-letter-spacing": 0.18,
            "text-max-width": 8,
          },
          paint: { "text-color": "#8fa3bd", "text-halo-color": "#0c0f14", "text-halo-width": 1.2 },
        });
        map.addSource("journeys", {
          type: "geojson",
          data: { type: "FeatureCollection", features: data.journeys.map((j) => lineFeature(j.path, { mode: j.mode, schematic: j.schematic })) },
        });
        map.addLayer({ id: "journey-flight", type: "line", source: "journeys", filter: ["==", ["get", "mode"], "avion"], paint: { "line-color": FG2, "line-opacity": 0.35, "line-width": 1.1, "line-dasharray": [1, 3] } });
        map.addLayer({
          id: "journey-schematic",
          type: "line",
          source: "journeys",
          filter: ["all", ["==", ["get", "mode"], "train"], ["==", ["get", "schematic"], true]],
          layout: { "line-cap": "round" },
          paint: { "line-color": "#eef2f8", "line-opacity": 0.55, "line-width": ["interpolate", ["linear"], ["zoom"], 3, 1.2, 10, 2.4], "line-dasharray": [2, 2.5] },
        });
        map.addLayer({
          id: "journey-train",
          type: "line",
          source: "journeys",
          filter: ["all", ["==", ["get", "mode"], "train"], ["==", ["get", "schematic"], false]],
          layout: { "line-cap": "round", "line-join": "round" },
          paint: { "line-color": ROUTE, "line-width": ["interpolate", ["linear"], ["zoom"], 3, 1.8, 10, 3] },
        });
        map.addSource("journey-draw", { type: "geojson", data: { type: "FeatureCollection", features: [] } });
        map.addLayer({ id: "journey-draw-glow", type: "line", source: "journey-draw", layout: { "line-cap": "round" }, paint: { "line-color": ROUTE, "line-width": 10, "line-opacity": 0.22, "line-blur": 6 } });
        map.addLayer({ id: "journey-draw", type: "line", source: "journey-draw", layout: { "line-cap": "round", "line-join": "round" }, paint: { "line-color": ROUTE, "line-width": 3.2 } });
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
            selectPlaceRef.current(place);
          });
          const marker = new ml.Marker({ element: el, anchor: "left", offset: [-6, 0] }).setLngLat([place.coords[0], place.coords[1]]).addTo(map);
          markers.set(place.id, { marker, place });
        }
        // Cities: lived, prepared, to come.
        for (const c of data.cities) {
          const el = document.createElement("button");
          el.type = "button";
          el.className = "verste-city";
          el.dataset.status = c.status;
          el.disabled = c.status === "a-venir";
          el.setAttribute("aria-label", c.status === "a-venir" ? `${c.fr} : bientôt` : `${c.fr} : ${statusShort[c.status]}, explorer`);
          el.innerHTML = `<span class="verste-city-post"></span><span class="verste-city-names"><span lang="ru" class="verste-city-ru">${c.ru}</span><span class="verste-city-fr">${c.fr} · ${statusShort[c.status]}</span></span>`;
          el.addEventListener("click", (e) => {
            e.stopPropagation();
            enterCityRef.current(c);
          });
          new ml.Marker({ element: el, anchor: "left", offset: [-5, 0] }).setLngLat([c.coords[0], c.coords[1]]).addTo(map);
          cityMap.set(c.id, el);
        }
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
        const c = ville ? data.cities.find((x) => x.id === ville) : undefined;
        if (place) selectPlaceRef.current(place);
        else if (c) enterCityRef.current(c, false);
      });
    })();
    return () => {
      cancelled = true;
      runs.current++;
      markers.clear();
      cityMap.clear();
      map?.remove();
      mapRef.current = null;
    };
    // The map is created once; handlers read fresh callbacks through refs.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Visibility by zoom and filters.
  useEffect(() => {
    const cityZoom = zoom >= 10.5;
    for (const { marker, place } of placeMarkers.current.values()) {
      const el = marker.getElement();
      el.style.display = active[place.group] && cityZoom ? "" : "none";
      el.classList.toggle("is-selected", selected?.id === place.id);
      el.classList.toggle("show-label", zoom >= 14.2 || selected?.id === place.id);
    }
    for (const el of cityEls.current.values()) el.style.display = cityZoom ? "none" : "";
    for (const el of document.querySelectorAll<HTMLElement>(".verste-stop")) el.style.display = zoom >= 12.5 ? "" : "none";
  }, [active, zoom, selected, status]);

  const distanceLabel = useMemo(() => {
    if (!selected) return undefined;
    const c = data.cities.find((x) => x.id === selected.cityId);
    if (!c) return undefined;
    return `${formatDistance(haversineKm(selected.coords, c.coords))} du centre de ${c.fr}, à vol d'oiseau (calculé)`;
  }, [selected, data.cities]);

  const byStatus = (s: MapCityView["status"]) => data.cities.filter((c) => c.status === s);
  const journeyShort = (c: MapCityView) => {
    const j = journeyOf(c);
    return j?.service ? `${j.service} depuis Moscou` : c.id === "moscou" ? "Point de départ" : undefined;
  };

  return (
    <div data-surface="night" className="relative h-full w-full overflow-hidden bg-night text-fg">
      {/* MapLibre forces position: relative on its container: size it with h-full, not inset-0. */}
      <div ref={container} data-lenis-prevent className="h-full w-full" aria-label="Carte interactive de la Russie" role="region" />

      {status !== "ready" && (
        <div className="absolute inset-0 grid place-items-center bg-night" aria-live="polite">
          <p className="label text-fg-2">{status === "failed" ? "La carte ne peut pas s'afficher sur cet appareil. La liste des lieux est juste en dessous." : "La carte se charge…"}</p>
        </div>
      )}

      {/* Panel: the country, or a city */}
      <div
        ref={panelRef}
        className={`pointer-events-none absolute z-10 transition-opacity duration-base md:top-4 md:bottom-4 md:left-4 md:w-[440px] ${
          city ? "inset-x-2 bottom-2 max-h-[48svh] max-md:flex max-md:flex-col md:max-h-none" : "inset-x-2 top-2 md:inset-x-auto"
        } ${selected ? "max-md:hidden" : ""} ${travelling ? "opacity-0 max-md:opacity-100 md:opacity-40" : "opacity-100"}`}
      >
        {city ? (
          <CityPanel
            city={city}
            journey={journeyOf(city)}
            places={data.places.filter((p) => p.cityId === city.id)}
            weather={weather.find((w) => w.id === city.id)}
            clock={clock}
            onBack={overview}
            onPlace={(p) => selectPlace(p)}
          />
        ) : (
          <div className="pointer-events-auto rounded-[6px] border border-line bg-night/85 p-4 backdrop-blur-md md:p-5">
            <p className="label text-fg-2 max-md:hidden">La carte du voyage</p>
            <h1 className="font-display font-cond text-[1.5rem] leading-none font-bold tracking-[0.04em] uppercase md:mt-1 md:text-[clamp(1.8rem,3.4vw,2.6rem)]">Russia Travel Map</h1>
            <p className="mt-2 text-[0.88rem] text-fg-2 max-md:hidden">Choisissez une ville : le voyage part de Moscou.</p>
            <div className="-mx-1 mt-3 flex gap-2 overflow-x-auto px-1 pb-1 [scrollbar-width:none] md:mt-5 md:grid md:overflow-visible [&::-webkit-scrollbar]:hidden">
              {(["terrain", "destination", "a-venir"] as const).map((s) => (
                <div key={s} className="contents md:block">
                  <p className="label mt-1 hidden text-fg-2 md:mb-2 md:block">{s === "terrain" ? "Expérience terrain" : s === "destination" ? "Destinations VERSTE" : "À venir"}</p>
                  <ul className="contents md:grid md:gap-1.5">
                    {byStatus(s).map((c) => (
                      <li key={c.id} className="shrink-0">
                        <button
                          type="button"
                          disabled={s === "a-venir"}
                          onClick={() => enterCity(c)}
                          className="flex w-full items-center gap-3 rounded-[4px] border border-line px-3 py-2 text-left enabled:hover:border-fg/60 disabled:opacity-50 md:py-2.5"
                        >
                          <span aria-hidden="true" className={`size-2.5 shrink-0 rounded-full ${s === "terrain" ? "bg-fg" : s === "destination" ? "border-2 border-fg" : "border border-dashed border-fg-2"}`} />
                          <span className="min-w-0">
                            <span className="block text-[0.92rem] whitespace-nowrap text-fg">{c.fr}</span>
                            <span className="hidden text-[0.72rem] text-fg-2 md:block">
                              <span lang="ru">{c.ru}</span>
                              {journeyShort(c) ? ` · ${journeyShort(c)}` : ""}
                              {c.fromMoscowKm !== undefined && s !== "a-venir" ? ` · ${formatKm(c.fromMoscowKm)}` : ""}
                            </span>
                          </span>
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
            <p className="mt-4 hidden text-[0.72rem] leading-snug text-fg-2 md:block">
              Distances à vol d&apos;oiseau depuis Moscou, calculées. Lignes pointillées : tracés schématiques. Ligne rouge : Moscou → Nijni, par les gares principales.
            </p>
          </div>
        )}
      </div>

      {/* Filters, once in a city */}
      {city && zoom >= 10.5 && !selected && (
        <fieldset className="pointer-events-auto absolute top-3 right-14 left-3 z-10 flex gap-2 overflow-x-auto pb-1 [scrollbar-width:none] md:right-16 md:left-auto md:max-w-[520px] [&::-webkit-scrollbar]:hidden">
          <legend className="sr-only">Afficher</legend>
          {groups.map((g) => (
            <label key={g.id} className="label flex shrink-0 cursor-pointer items-center gap-2 rounded-full border border-line bg-night/80 px-3 py-2 text-fg-2 backdrop-blur has-checked:border-fg/50 has-checked:text-fg">
              <input type="checkbox" className="sr-only" checked={active[g.id]} onChange={(e) => setActive((a) => ({ ...a, [g.id]: e.target.checked }))} />
              <span aria-hidden="true" className={`size-2 bg-current ${groupShape[g.id]}`} />
              {g.label}
            </label>
          ))}
        </fieldset>
      )}

      {selected && <PlaceSheet place={selected} distanceLabel={distanceLabel} onClose={() => selectPlace(null, false)} />}
    </div>
  );
}
