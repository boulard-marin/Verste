import type { CustomLayerInterface, Map as MapLibreMap, MercatorCoordinate as MercatorCoordinateType } from "maplibre-gl";
import {
  AmbientLight,
  CanvasTexture,
  DirectionalLight,
  EquirectangularReflectionMapping,
  Group,
  HemisphereLight,
  Matrix4,
  PerspectiveCamera,
  PMREMGenerator,
  Scene,
  SRGBColorSpace,
  Vector3,
  WebGLRenderer,
  type Texture,
} from "three";

import type { LonLat } from "@/lib/travel/types";

/**
 * The 3D objects of the world, in ONE three.js layer inside MapLibre: Saint
 * Basil, the Conquerors of Space, the golden spires and domes of Saint
 * Petersburg… Each object has its own anchor (its own Mercator origin, so
 * metres stay precise far from Moscow) and its own appearance (`animate`):
 * rising out of the ground, a rocket launching. One renderer for all.
 */

export type WorldObject = {
  id: string;
  /** Where the model's origin stands. */
  at: LonLat;
  /** The model, in metres: +x east, +y up, +z south. */
  build(): Group;
  /** The OSM parts the model replaces: within this radius (of `around`, default `at`), optionally only from a given height up. */
  replaces?: { radiusM: number; minFrom?: number; around?: LonLat };
  /** How the object appears, t from 0 (absent) to 1 (complete). Default: rises out of the ground. */
  animate?(model: Group, t: number): void;
  /** Rotation of the model around the vertical axis, degrees clockwise. */
  bearing?: number;
};

type Entry = { def: WorldObject; scene: Scene; model: Group; origin: MercatorCoordinateType; scale: number; t: number };

const rise = (model: Group, t: number) => model.scale.set(1, Math.max(0.001, t), 1);

/**
 * A twilight sky for the metals to reflect (gilded spires, titanium): a cool
 * zenith, a warm band at the horizon, a dark ground. Without it, metal
 * renders black.
 */
function twilight(renderer: WebGLRenderer): Texture {
  const c = document.createElement("canvas");
  c.width = 128;
  c.height = 64;
  const g = c.getContext("2d")!;
  const sky = g.createLinearGradient(0, 0, 0, 64);
  sky.addColorStop(0, "#4d6488");
  sky.addColorStop(0.4, "#a9b9d0");
  sky.addColorStop(0.49, "#f4d6b2");
  sky.addColorStop(0.53, "#5a5148");
  sky.addColorStop(1, "#16181d");
  g.fillStyle = sky;
  g.fillRect(0, 0, 128, 64);
  const texture = new CanvasTexture(c);
  texture.mapping = EquirectangularReflectionMapping;
  texture.colorSpace = SRGBColorSpace;
  const pmrem = new PMREMGenerator(renderer);
  const env = pmrem.fromEquirectangular(texture).texture;
  pmrem.dispose();
  texture.dispose();
  return env;
}

export function createObjectsLayer(MercatorCoordinate: typeof MercatorCoordinateType, objects: WorldObject[]) {
  const camera = new PerspectiveCamera();
  let renderer: WebGLRenderer | null = null;
  let environment: Texture | null = null;
  let map: MapLibreMap | null = null;
  const entries = new Map<string, Entry>();

  const lit = (scene: Scene) => {
    scene.add(new HemisphereLight("#e6eef8", "#3a3330", 0.9));
    scene.add(new AmbientLight("#ffffff", 0.18));
    const sun = new DirectionalLight("#ffe2bc", 2.1);
    sun.position.set(-80, 55, 40);
    scene.add(sun);
  };

  for (const def of objects) {
    const scene = new Scene();
    const model = def.build();
    if (def.bearing) model.rotation.y = (-def.bearing * Math.PI) / 180;
    scene.add(model);
    lit(scene);
    const origin = MercatorCoordinate.fromLngLat([def.at[0], def.at[1]], 0);
    entries.set(def.id, { def, scene, model, origin, scale: origin.meterInMercatorCoordinateUnits(), t: 1 });
    (def.animate ?? rise)(model, 1);
  }

  const layer: CustomLayerInterface = {
    id: "world-objects-3d",
    type: "custom",
    renderingMode: "3d",
    onAdd(m, gl) {
      map = m;
      renderer = new WebGLRenderer({ canvas: m.getCanvas(), context: gl, antialias: true });
      renderer.autoClear = false;
    },
    render(gl, args) {
      // Objects are drawn on the flat (Mercator) world only: on the curved globe they would be specks anyway.
      if (!renderer || args.defaultProjectionData.projectionTransition > 0.001) return;
      const main = new Matrix4().fromArray(args.defaultProjectionData.mainMatrix as unknown as number[]);
      renderer.resetState();
      if (!environment) {
        // Built on the first frame (MapLibre restores its own GL state after custom layers).
        environment = twilight(renderer);
        for (const e of entries.values()) {
          e.scene.environment = environment;
          e.scene.environmentIntensity = 0.85;
        }
        renderer.resetState();
      }
      // The map may have been resized since the renderer was created.
      renderer.setViewport(0, 0, gl.drawingBufferWidth, gl.drawingBufferHeight);
      for (const e of entries.values()) {
        if (e.t <= 0.001) continue;
        const l = new Matrix4()
          .makeTranslation(e.origin.x, e.origin.y, e.origin.z)
          .scale(new Vector3(e.scale, -e.scale, e.scale))
          .multiply(new Matrix4().makeRotationX(Math.PI / 2));
        camera.projectionMatrix = main.clone().multiply(l);
        renderer.render(e.scene, camera);
      }
    },
    onRemove() {
      environment?.dispose();
      environment = null;
      renderer?.dispose();
      renderer = null;
      map = null;
    },
  };

  return {
    layer,
    ids: [...entries.keys()],
    /** The OSM parts each object replaces, for the world to hide them while the object stands. */
    replaced: objects.flatMap((o) => (o.replaces ? [{ id: o.id, center: o.replaces.around ?? o.at, radiusM: o.replaces.radiusM, minFrom: o.replaces.minFrom }] : [])),
    /** Whether the object is (at least partly) there. */
    present: (id: string) => (entries.get(id)?.t ?? 0) > 0.001,
    setRise(id: string, t: number) {
      const e = entries.get(id);
      if (!e) return;
      const v = Math.min(1, Math.max(0, t));
      if (Math.abs(v - e.t) < 0.002) return;
      e.t = v;
      (e.def.animate ?? rise)(e.model, v);
      map?.triggerRepaint();
    },
  };
}
