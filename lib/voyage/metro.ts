import {
  AmbientLight,
  BoxGeometry,
  CanvasTexture,
  Color,
  CylinderGeometry,
  DoubleSide,
  Fog,
  Group,
  HemisphereLight,
  InstancedMesh,
  Mesh,
  MeshBasicMaterial,
  MeshStandardMaterial,
  Object3D,
  PerspectiveCamera,
  PlaneGeometry,
  PointLight,
  RepeatWrapping,
  Scene,
  SphereGeometry,
  SRGBColorSpace,
  TorusGeometry,
  Vector3,
  WebGLRenderer,
} from "three";

/**
 * A Moscow metro station, stylised (not a replica of a specific station):
 * vaulted hall, arcades on pylons, chandeliers, polished granite, a train that
 * arrives, doors that open, a tunnel that streams by. Everything is a pure
 * function of `p` (0–1), so scrolling backwards replays the scene backwards.
 *
 * Phases of p:
 *   0.00–0.30  the hall reveals itself (camera glides down the nave)
 *   0.30–0.42  the camera turns to the platform
 *   0.42–0.58  the train arrives and stops
 *   0.58–0.66  doors open, the camera steps in
 *   0.66–0.94  the ride: tunnel lights streaming, speed up then slow down
 *   0.94–1.00  arrival in daylight (Vorobiovy Gory is a station on a bridge)
 */

export const METRO_PHASES = { platform: 0.3, train: 0.42, board: 0.58, ride: 0.66, arrive: 0.94 } as const;

const HALL = 128; // metres
const BAY = 8;

function canvasTexture(w: number, h: number, draw: (g: CanvasRenderingContext2D) => void, repeat: [number, number]): CanvasTexture {
  const c = document.createElement("canvas");
  c.width = w;
  c.height = h;
  draw(c.getContext("2d")!);
  const t = new CanvasTexture(c);
  t.colorSpace = SRGBColorSpace;
  t.wrapS = t.wrapT = RepeatWrapping;
  t.repeat.set(repeat[0], repeat[1]);
  t.anisotropy = 4;
  return t;
}

const granite = () =>
  canvasTexture(
    256,
    256,
    (g) => {
      g.fillStyle = "#3a3534";
      g.fillRect(0, 0, 256, 256);
      g.fillStyle = "#8e8173";
      g.fillRect(0, 0, 128, 128);
      g.fillRect(128, 128, 128, 128);
      for (let i = 0; i < 900; i++) {
        g.fillStyle = `rgba(255,255,255,${Math.random() * 0.05})`;
        g.fillRect(Math.random() * 256, Math.random() * 256, 2, 2);
      }
    },
    [6, 36],
  );

const marble = () =>
  canvasTexture(
    128,
    256,
    (g) => {
      const grad = g.createLinearGradient(0, 0, 128, 256);
      grad.addColorStop(0, "#d9cbb4");
      grad.addColorStop(1, "#c4b196");
      g.fillStyle = grad;
      g.fillRect(0, 0, 128, 256);
      g.strokeStyle = "rgba(90,70,50,0.25)";
      for (let i = 0; i < 7; i++) {
        g.beginPath();
        g.moveTo(Math.random() * 128, 0);
        g.bezierCurveTo(Math.random() * 128, 80, Math.random() * 128, 170, Math.random() * 128, 256);
        g.stroke();
      }
    },
    [1, 1],
  );

const vault = () =>
  canvasTexture(
    256,
    256,
    (g) => {
      g.fillStyle = "#ece5d8";
      g.fillRect(0, 0, 256, 256);
      g.strokeStyle = "rgba(160,130,90,0.35)";
      g.lineWidth = 3;
      g.strokeRect(12, 12, 232, 232);
      g.strokeRect(40, 40, 176, 176);
      g.fillStyle = "rgba(190,150,80,0.45)";
      g.beginPath();
      for (let i = 0; i < 10; i++) {
        const a = (i / 10) * Math.PI * 2 - Math.PI / 2;
        const r = i % 2 === 0 ? 34 : 14;
        g.lineTo(128 + Math.cos(a) * r, 128 + Math.sin(a) * r);
      }
      g.fill();
    },
    [4, HALL / BAY],
  );

/** Abstract oval mosaic niche: deep sky, gold rays. Stylised, not a copy of any artwork. */
const mosaic = () =>
  canvasTexture(
    256,
    192,
    (g) => {
      g.fillStyle = "#ece5d8";
      g.fillRect(0, 0, 256, 192);
      g.save();
      g.beginPath();
      g.ellipse(128, 96, 116, 84, 0, 0, Math.PI * 2);
      g.clip();
      const sky = g.createRadialGradient(128, 110, 10, 128, 96, 130);
      sky.addColorStop(0, "#f0c870");
      sky.addColorStop(0.35, "#5c7fb8");
      sky.addColorStop(1, "#15284d");
      g.fillStyle = sky;
      g.fillRect(0, 0, 256, 192);
      g.strokeStyle = "rgba(240,200,112,0.55)";
      g.lineWidth = 2;
      for (let i = 0; i < 16; i++) {
        const a = (i / 16) * Math.PI * 2;
        g.beginPath();
        g.moveTo(128, 110);
        g.lineTo(128 + Math.cos(a) * 160, 110 + Math.sin(a) * 160);
        g.stroke();
      }
      for (let i = 0; i < 600; i++) {
        g.fillStyle = `rgba(255,255,255,${Math.random() * 0.12})`;
        g.fillRect(Math.random() * 256, Math.random() * 192, 3, 3);
      }
      g.restore();
      g.strokeStyle = "#b9954f";
      g.lineWidth = 6;
      g.beginPath();
      g.ellipse(128, 96, 116, 84, 0, 0, Math.PI * 2);
      g.stroke();
    },
    [1, 1],
  );

const smooth = (t: number) => t * t * (3 - 2 * t);
const clamp01 = (t: number) => Math.min(1, Math.max(0, t));
const phase = (p: number, a: number, b: number) => clamp01((p - a) / (b - a));
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

export type Metro = { render(p: number): void; resize(): void; dispose(): void };

export function createMetro(canvas: HTMLCanvasElement): Metro {
  const renderer = new WebGLRenderer({ canvas, antialias: true, powerPreference: "high-performance" });
  renderer.setPixelRatio(Math.min(2, window.devicePixelRatio));
  renderer.outputColorSpace = SRGBColorSpace;
  const scene = new Scene();
  scene.background = new Color("#0c0a09");
  scene.fog = new Fog("#1a1410", 30, 115);
  const camera = new PerspectiveCamera(62, 1, 0.1, 400);

  scene.add(new HemisphereLight("#fff1dc", "#3a2c22", 1.4));
  scene.add(new AmbientLight("#ffe6c4", 0.35));
  const lamps = [-40, 0, 40].map((z) => {
    const l = new PointLight("#ffd9a0", 60, 45, 1.6);
    l.position.set(0, 7, z);
    scene.add(l);
    return l;
  });

  // ── The hall ────────────────────────────────────────────────────────────
  const hall = new Group();
  scene.add(hall);
  const floorMat = new MeshStandardMaterial({ map: granite(), roughness: 0.32, metalness: 0.08 });
  const floor = new Mesh(new PlaneGeometry(30, HALL + 20), floorMat);
  floor.rotation.x = -Math.PI / 2;
  hall.add(floor);

  const vaultMat = new MeshStandardMaterial({ map: vault(), roughness: 0.85, side: DoubleSide });
  const nave = new Mesh(new CylinderGeometry(6.4, 6.4, HALL + 16, 40, 1, true, -Math.PI / 2, Math.PI), vaultMat);
  nave.rotation.x = Math.PI / 2;
  nave.rotation.y = Math.PI;
  nave.position.set(0, 4.8, 0);
  hall.add(nave);
  for (const side of [-1, 1]) {
    const aisle = new Mesh(new CylinderGeometry(4.2, 4.2, HALL + 16, 28, 1, true, -Math.PI / 2, Math.PI), vaultMat);
    aisle.rotation.x = Math.PI / 2;
    aisle.rotation.y = Math.PI;
    aisle.position.set(side * 11, 3.6, 0);
    hall.add(aisle);
    const wall = new Mesh(new PlaneGeometry(HALL + 16, 3.6), new MeshStandardMaterial({ map: marble(), roughness: 0.5 }));
    wall.position.set(side * 15.2, 1.8, 0);
    wall.rotation.y = -side * (Math.PI / 2);
    hall.add(wall);
    const band = new Mesh(new PlaneGeometry(HALL + 16, 0.25), new MeshStandardMaterial({ color: "#b9954f", metalness: 0.6, roughness: 0.35 }));
    band.position.set(side * 15.18, 3.2, 0);
    band.rotation.y = -side * (Math.PI / 2);
    hall.add(band);
  }

  // Pylons and arches (instanced: one draw call each).
  const bays = Math.floor(HALL / BAY);
  const dummy = new Object3D();
  const pylonMat = new MeshStandardMaterial({ map: marble(), roughness: 0.4, metalness: 0.05 });
  const pylons = new InstancedMesh(new BoxGeometry(2.2, 5.2, 3.2), pylonMat, (bays + 1) * 2);
  const arches = new InstancedMesh(new TorusGeometry(2.4, 0.32, 10, 24, Math.PI), new MeshStandardMaterial({ color: "#e6dccb", roughness: 0.6 }), bays * 2);
  let pi = 0, ai = 0;
  for (let b = 0; b <= bays; b++) {
    const z = -HALL / 2 + b * BAY;
    for (const side of [-1, 1]) {
      dummy.position.set(side * 6.6, 2.6, z);
      dummy.rotation.set(0, 0, 0);
      dummy.updateMatrix();
      pylons.setMatrixAt(pi++, dummy.matrix);
      if (b < bays) {
        dummy.position.set(side * 6.6, 5.2, z + BAY / 2);
        dummy.rotation.set(0, Math.PI / 2, 0);
        dummy.updateMatrix();
        arches.setMatrixAt(ai++, dummy.matrix);
      }
    }
  }
  hall.add(pylons, arches);

  // Chandeliers: a glowing core and a ring of bulbs.
  const bulbMat = new MeshBasicMaterial({ color: "#ffe2a8" });
  const bulbs = new InstancedMesh(new SphereGeometry(0.16, 10, 8), bulbMat, bays * 9);
  let bi = 0;
  for (let b = 0; b < bays; b++) {
    const z = -HALL / 2 + b * BAY + BAY / 2;
    dummy.rotation.set(0, 0, 0);
    dummy.scale.set(2.2, 2.2, 2.2);
    dummy.position.set(0, 7.6, z);
    dummy.updateMatrix();
    bulbs.setMatrixAt(bi++, dummy.matrix);
    dummy.scale.set(1, 1, 1);
    for (let k = 0; k < 8; k++) {
      const a = (k / 8) * Math.PI * 2;
      dummy.position.set(Math.cos(a) * 0.9, 7.2, z + Math.sin(a) * 0.9);
      dummy.updateMatrix();
      bulbs.setMatrixAt(bi++, dummy.matrix);
    }
  }
  hall.add(bulbs);
  const stems = new InstancedMesh(new CylinderGeometry(0.03, 0.03, 3, 6), new MeshStandardMaterial({ color: "#b9954f", metalness: 0.8, roughness: 0.3 }), bays);
  for (let b = 0; b < bays; b++) {
    dummy.position.set(0, 9.2, -HALL / 2 + b * BAY + BAY / 2);
    dummy.updateMatrix();
    stems.setMatrixAt(b, dummy.matrix);
  }
  hall.add(stems);

  // Mosaic niches in the vault.
  const mosaicMat = new MeshStandardMaterial({ map: mosaic(), roughness: 0.7, emissive: new Color("#1a1206"), side: DoubleSide });
  for (let b = 0; b < bays; b += 2) {
    const m = new Mesh(new PlaneGeometry(3.4, 2.5), mosaicMat);
    m.position.set(0, 11.15, -HALL / 2 + b * BAY + BAY / 2);
    m.rotation.x = Math.PI / 2;
    hall.add(m);
  }

  // Tracks: bed and rails on both sides, tunnel mouths at both ends.
  for (const side of [-1, 1]) {
    const bed = new Mesh(new BoxGeometry(3.4, 1.2, HALL + 20), new MeshStandardMaterial({ color: "#15110e", roughness: 1 }));
    bed.position.set(side * 12.8, -0.6, 0);
    hall.add(bed);
    for (const dx of [-0.75, 0.75]) {
      const rail = new Mesh(new BoxGeometry(0.1, 0.12, HALL + 20), new MeshStandardMaterial({ color: "#9aa3ad", metalness: 0.9, roughness: 0.25 }));
      rail.position.set(side * 12.8 + dx, 0.06 - 1.1, 0);
      hall.add(rail);
    }
    const edge = new Mesh(new BoxGeometry(0.3, 0.02, HALL), new MeshStandardMaterial({ color: "#c7b28a", roughness: 0.6 }));
    edge.position.set(side * 10.95, 0.01, 0);
    hall.add(edge);
  }

  // ── The train ─────────────────────────────────────────────────────────────
  const train = new Group();
  const bodyMat = new MeshStandardMaterial({ color: "#2f4f82", roughness: 0.45, metalness: 0.3 });
  const stripeMat = new MeshStandardMaterial({ color: "#dfe6ee", roughness: 0.5 });
  const windowMat = new MeshBasicMaterial({ color: "#fff3d6" });
  const doorMat = new MeshStandardMaterial({ color: "#25406b", roughness: 0.4, metalness: 0.3 });
  const doors: Mesh[] = [];
  const CAR = 19.5;
  for (let c = 0; c < 5; c++) {
    const car = new Group();
    const body = new Mesh(new BoxGeometry(2.7, 3.2, CAR - 0.6), bodyMat);
    body.position.y = 1.6;
    const stripe = new Mesh(new BoxGeometry(2.72, 0.35, CAR - 0.6), stripeMat);
    stripe.position.y = 0.9;
    const win = new Mesh(new BoxGeometry(2.74, 0.8, CAR - 3), windowMat);
    win.position.y = 2.1;
    car.add(body, stripe, win);
    for (let d = 0; d < 4; d++) {
      for (const half of [-1, 1]) {
        const door = new Mesh(new BoxGeometry(0.06, 2.3, 0.7), doorMat);
        door.position.set(1.39, 1.3, -CAR / 2 + 2.6 + d * 4.6 + half * 0.36);
        door.userData = { z0: door.position.z, half };
        car.add(door);
        doors.push(door);
      }
    }
    car.position.z = c * CAR;
    train.add(car);
  }
  const head = new Mesh(new BoxGeometry(2.7, 3.2, 0.6), bodyMat);
  head.position.set(0, 1.6, -CAR / 2 - 0.2);
  train.add(head);
  for (const dx of [-0.8, 0.8]) {
    const lamp = new Mesh(new SphereGeometry(0.16, 12, 8), new MeshBasicMaterial({ color: "#ffffff" }));
    lamp.position.set(dx, 0.9, -CAR / 2 - 0.55);
    train.add(lamp);
  }
  // Turned around: the cab leads as the train comes out of the tunnel ahead
  // of the camera, and the doors face the platform.
  train.rotation.y = Math.PI;
  train.position.set(12.8, 0, 0);
  scene.add(train);
  const TRAIN_STOP = CAR * 2; // the five cars centred on the platform

  // ── The tunnel (ride) ─────────────────────────────────────────────────────
  const tunnel = new Group();
  tunnel.visible = false;
  const tube = new Mesh(new CylinderGeometry(3.2, 3.2, 400, 24, 1, true), new MeshStandardMaterial({ color: "#1b1714", roughness: 1, side: DoubleSide }));
  tube.rotation.x = Math.PI / 2;
  tunnel.add(tube);
  const lightStrip = new InstancedMesh(new BoxGeometry(0.12, 0.12, 1.4), new MeshBasicMaterial({ color: "#ffd9a0" }), 40);
  for (let i = 0; i < 40; i++) {
    dummy.position.set(2.8, 1.2, -200 + i * 10);
    dummy.rotation.set(0, 0, 0);
    dummy.scale.set(1, 1, 1);
    dummy.updateMatrix();
    lightStrip.setMatrixAt(i, dummy.matrix);
  }
  const cables = new InstancedMesh(new CylinderGeometry(0.03, 0.03, 400, 5), new MeshBasicMaterial({ color: "#3a3430" }), 4);
  for (let i = 0; i < 4; i++) {
    dummy.position.set(3, -0.4 + i * 0.25, 0);
    dummy.rotation.set(Math.PI / 2, 0, 0);
    dummy.updateMatrix();
    cables.setMatrixAt(i, dummy.matrix);
  }
  tunnel.add(lightStrip, cables);
  tunnel.position.set(0, 1.2, 0);
  scene.add(tunnel);

  const target = new Vector3();
  let width = 1, height = 1;

  function resize() {
    width = canvas.clientWidth || 1;
    height = canvas.clientHeight || 1;
    renderer.setSize(width, height, false);
    camera.aspect = width / height;
    camera.fov = width < height ? 75 : 60;
    camera.updateProjectionMatrix();
  }
  resize();

  function render(p: number) {
    const riding = p >= METRO_PHASES.ride;
    hall.visible = !riding || p >= METRO_PHASES.arrive;
    tunnel.visible = riding && p < METRO_PHASES.arrive;
    for (const l of lamps) l.visible = hall.visible;

    // Train position: far away, arriving, stopped, then gone with us.
    const arrival = smooth(phase(p, METRO_PHASES.train, METRO_PHASES.board));
    train.visible = p < METRO_PHASES.ride;
    train.position.z = lerp(TRAIN_STOP - 190, TRAIN_STOP, 1 - Math.pow(1 - arrival, 3));
    const open = smooth(phase(p, METRO_PHASES.board, METRO_PHASES.board + 0.04));
    for (const d of doors) d.position.z = (d.userData.z0 as number) + (d.userData.half as number) * 0.62 * open;

    if (p < METRO_PHASES.platform) {
      // Glide down the nave.
      const t = smooth(p / METRO_PHASES.platform);
      camera.position.set(0, lerp(7.5, 1.7, t), lerp(58, 14, t));
      target.set(0, lerp(3.5, 2.2, t), lerp(10, -40, t));
    } else if (p < METRO_PHASES.board) {
      // Turn to the platform and wait for the train.
      const t = smooth(phase(p, METRO_PHASES.platform, METRO_PHASES.train));
      camera.position.set(lerp(0, 8.4, t), 1.7, lerp(14, 4, t));
      // Look down the platform, towards the tunnel the train comes from.
      const k = smooth(phase(p, METRO_PHASES.train + 0.08, METRO_PHASES.board));
      target.set(lerp(0, lerp(13, 15, k), t), lerp(2.2, 1.7, t), lerp(-40, lerp(-34, 1, k), t));
    } else if (p < METRO_PHASES.ride) {
      // Walk to the open door; the doors close in a fade (see MetroUI).
      const t = smooth(phase(p, METRO_PHASES.board, METRO_PHASES.ride));
      camera.position.set(lerp(8.4, 10.4, t), 1.7, lerp(4, 2.55, t));
      target.set(15, 1.6, lerp(1, 2.55, t));
    } else if (p < METRO_PHASES.arrive) {
      // The ride: we sit by the window, the tunnel lights stream by.
      const t = phase(p, METRO_PHASES.ride, METRO_PHASES.arrive);
      const speed = Math.sin(t * Math.PI); // accelerate, cruise, brake
      const travelled = (t - Math.sin(t * Math.PI * 2) / (Math.PI * 2)) * 2400;
      camera.position.set(0.6, 1.5, 0);
      target.set(4, 1.3, -0.4 - speed * 1.5);
      lightStrip.position.z = travelled % 10;
      lightStrip.scale.z = 1 + speed * 7;
      camera.fov = (width < height ? 75 : 60) + speed * 8;
      camera.updateProjectionMatrix();
    } else {
      // Daylight: out on the bridge.
      const t = smooth(phase(p, METRO_PHASES.arrive, 1));
      camera.position.set(8.4, 1.7, lerp(0, -6, t));
      target.set(14, 2, -30);
    }
    camera.lookAt(target);
    renderer.toneMappingExposure = 1;
    renderer.render(scene, camera);
  }

  return {
    render,
    resize,
    dispose() {
      renderer.dispose();
      scene.traverse((o) => {
        const m = o as Mesh;
        m.geometry?.dispose();
        const mat = m.material as MeshStandardMaterial | MeshStandardMaterial[] | undefined;
        for (const x of Array.isArray(mat) ? mat : mat ? [mat] : []) {
          x.map?.dispose();
          x.dispose();
        }
      });
    },
  };
}
