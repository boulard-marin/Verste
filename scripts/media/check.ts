/**
 * Fails if any published media file still carries metadata that could locate
 * the founder (EXIF/XMP GPS in images, QuickTime location keys in videos), or
 * if a file is published without being declared in a manifest.
 *
 *   npm run media:check
 */
import { execFile } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { promisify } from "node:util";
import exifr from "exifr";
import ffmpegPath from "ffmpeg-static";

const run = promisify(execFile);
const root = path.resolve(import.meta.dirname, "../..");
const pub = path.join(root, "public/media");
const own = JSON.parse(fs.readFileSync(path.join(root, "data/generated/media-files.json"), "utf8"));
const ext = JSON.parse(fs.readFileSync(path.join(root, "data/generated/external-media.json"), "utf8"));

const declared = new Set<string>();
for (const f of Object.values(own) as Array<Record<string, unknown>>) {
  for (const k of ["src", "poster", "hd"]) if (typeof f[k] === "string") declared.add(f[k] as string);
  const wide = f.wide as { src: string } | undefined;
  if (wide) declared.add(wide.src);
  const seq = f.sequence as { pattern: string; count: number } | undefined;
  if (seq) for (let i = 1; i <= seq.count; i++) declared.add(seq.pattern.replace("{i}", String(i).padStart(3, "0")));
}
for (const f of Object.values(ext) as Array<{ src: string; license: string; author: string; source: string }>) {
  declared.add(f.src);
  if (!f.license || !f.source || !f.author) throw new Error(`Attribution incomplète : ${f.src}`);
}

function walk(dir: string): string[] {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((d) => (d.isDirectory() ? walk(path.join(dir, d.name)) : [path.join(dir, d.name)]));
}

const problems: string[] = [];
const files = walk(pub);
for (const file of files) {
  const url = "/" + path.relative(path.join(root, "public"), file).split(path.sep).join("/");
  if (!declared.has(url)) problems.push(`non déclaré : ${url}`);
  if (/\.(jpe?g|webp|png|avif)$/i.test(file)) {
    const meta = await exifr.parse(file, { gps: true, xmp: true, iptc: true }).catch(() => null);
    if (meta && (meta.latitude || meta.GPSLatitude || meta.GPSLongitude)) problems.push(`GPS présent : ${url}`);
  } else if (/\.mp4$/i.test(file)) {
    const out = await run(ffmpegPath as unknown as string, ["-hide_banner", "-i", file]).catch((e) => e);
    const text = String(out.stderr ?? "");
    if (/location|ISO6709|com\.apple\.quicktime/i.test(text)) problems.push(`métadonnées de lieu : ${url}`);
  }
}
if (problems.length) {
  console.error(problems.join("\n"));
  process.exit(1);
}
console.log(`${files.length} fichiers publiés, aucune métadonnée de lieu, tous déclarés.`);
