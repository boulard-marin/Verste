// MapLibre 6 loads its web worker from `import.meta.url`, which the bundler
// cannot rewrite. We serve the worker (and the shared chunk it imports) from
// public/vendor, versioned, and point MapLibre to it with setWorkerUrl().
import fs from "node:fs";
import path from "node:path";

const root = path.resolve(import.meta.dirname, "..");
const { version } = JSON.parse(fs.readFileSync(path.join(root, "node_modules/maplibre-gl/package.json"), "utf8"));
const dist = path.join(root, "node_modules/maplibre-gl/dist");
const out = path.join(root, "public/vendor/maplibre", version);
fs.mkdirSync(out, { recursive: true });
for (const file of ["maplibre-gl-worker.mjs", "maplibre-gl-shared.mjs"]) {
  fs.copyFileSync(path.join(dist, file), path.join(out, file));
}
fs.writeFileSync(path.join(root, "lib/map/worker-url.ts"), `// Written by scripts/vendor-maplibre.mjs\nexport const MAPLIBRE_WORKER_URL = "/vendor/maplibre/${version}/maplibre-gl-worker.mjs";\n`);
console.log(`MapLibre ${version} worker → public/vendor/maplibre/${version}`);
