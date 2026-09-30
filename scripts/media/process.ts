/**
 * Media pipeline: downloads the selected originals from the founder's Drive
 * folder into media-src/ (ignored by git), then writes web versions into
 * public/media/verste/ with every metadata field removed (the originals carry
 * the GPS of the founder's lodging).
 *
 *   node scripts/media/process.ts            process everything missing
 *   node scripts/media/process.ts --force    rebuild all outputs
 *
 * Requires media-src/drive.tsv (file name → Drive id), produced by the
 * inventory step and kept out of the repository.
 */
import { execFile } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { promisify } from "node:util";
import ffmpegPath from "ffmpeg-static";
import convertHeic from "heic-convert";
import sharp from "sharp";
import { selection, type Selection } from "./selection.ts";

const run = promisify(execFile);
const root = path.resolve(import.meta.dirname, "../..");
const srcDir = path.join(root, "media-src/originals");
const outDir = path.join(root, "public/media/verste");
const manifestPath = path.join(root, "data/generated/media-files.json");
const force = process.argv.includes("--force");
const only = process.argv.find((a) => a.startsWith("--only="))?.slice(7).split(",");

const driveIds = new Map(
  fs
    .readFileSync(path.join(root, "media-src/drive.tsv"), "utf8")
    .trim()
    .split(/\r?\n/)
    .map((l) => l.split("\t") as [string, string]),
);

export type MediaFile = {
  type: "photo" | "video";
  src: string;
  width: number;
  height: number;
  blurDataURL: string;
  wide?: { src: string; width: number; height: number };
  poster?: string;
  hd?: string;
  durationS?: number;
  sequence?: { pattern: string; count: number; width: number; height: number };
};

async function download(file: string) {
  const dest = path.join(srcDir, file);
  if (fs.existsSync(dest)) return dest;
  const id = driveIds.get(file);
  if (!id) throw new Error(`No Drive id for ${file}`);
  const url = `https://drive.usercontent.google.com/download?id=${id}&export=download&confirm=t`;
  const res = await fetch(url, { redirect: "follow" });
  const type = res.headers.get("content-type") ?? "";
  if (!res.ok || type.includes("text/html")) throw new Error(`Download failed for ${file} (${res.status} ${type})`);
  fs.writeFileSync(dest + ".part", Buffer.from(await res.arrayBuffer()));
  fs.renameSync(dest + ".part", dest);
  return dest;
}

async function blur(input: Buffer | string) {
  const b = await sharp(input).resize(16).webp({ quality: 40 }).toBuffer();
  return `data:image/webp;base64,${b.toString("base64")}`;
}

async function photo(s: Selection, original: string): Promise<MediaFile> {
  let input: Buffer = fs.readFileSync(original);
  if (/\.heic$/i.test(original)) {
    input = Buffer.from(await convertHeic({ buffer: input, format: "JPEG", quality: 0.95 }));
  }
  // rotate() applies any EXIF orientation; sharp drops all metadata by default.
  const base = sharp(input).rotate().toColorspace("srgb");
  const master = await base.clone().resize(2048, 2048, { fit: "inside", withoutEnlargement: true }).jpeg({ quality: 80, mozjpeg: true }).toBuffer({ resolveWithObject: true });
  const src = `/media/verste/${s.slug}.jpg`;
  fs.writeFileSync(path.join(outDir, `${s.slug}.jpg`), master.data);
  const file: MediaFile = {
    type: "photo",
    src,
    width: master.info.width,
    height: master.info.height,
    blurDataURL: await blur(master.data),
  };
  if (s.wide) {
    const full = await base.clone().toBuffer({ resolveWithObject: true });
    const { width, height } = full.info;
    const cropH = Math.min(height, Math.round((width * 9) / 16));
    const top = Math.max(0, Math.min(height - cropH, Math.round(height * s.wide.focusY - cropH / 2)));
    const wide = await sharp(full.data)
      .extract({ left: 0, top, width, height: cropH })
      .resize(2400, undefined, { withoutEnlargement: true })
      .jpeg({ quality: 78, mozjpeg: true })
      .toBuffer({ resolveWithObject: true });
    fs.writeFileSync(path.join(outDir, `${s.slug}-wide.jpg`), wide.data);
    file.wide = { src: `/media/verste/${s.slug}-wide.jpg`, width: wide.info.width, height: wide.info.height };
  }
  return file;
}

async function ffmpeg(args: string[]) {
  await run(ffmpegPath as unknown as string, ["-hide_banner", "-loglevel", "error", "-y", ...args], { maxBuffer: 1 << 26 });
}

async function probe(file: string) {
  // ffmpeg prints stream info on stderr when given no output.
  const out = await run(ffmpegPath as unknown as string, ["-hide_banner", "-i", file]).catch((e) => e);
  const text = String(out.stderr ?? "");
  const dur = text.match(/Duration: (\d+):(\d+):([\d.]+)/);
  const seconds = dur ? Number(dur[1]) * 3600 + Number(dur[2]) * 60 + Number(dur[3]) : 0;
  const rotate = /rotation of -?90|rotate\s*:\s*-?90|displaymatrix: rotation of -?90/i.test(text);
  const dims = text.match(/Video: .*?(\d{3,5})x(\d{3,5})/);
  let w = dims ? Number(dims[1]) : 0, h = dims ? Number(dims[2]) : 0;
  if (rotate) [w, h] = [h, w];
  return { seconds, width: w, height: h };
}

async function video(s: Selection, original: string): Promise<MediaFile> {
  const info = await probe(original);
  const start = s.video?.start ?? 0;
  // Loops stay short: 8 s unless the selection asks for more.
  const end = Math.min(info.seconds, s.video?.end ?? start + 8);
  const portrait = info.height >= info.width;
  const trim = ["-ss", String(start), "-to", String(end)];
  // Stripping: no metadata, no chapters, no audio, video stream only.
  const common = ["-map", "0:v:0", "-map_metadata", "-1", "-map_chapters", "-1", "-an", "-r", "30", "-c:v", "libx264", "-profile:v", "high", "-pix_fmt", "yuv420p", "-movflags", "+faststart", "-tag:v", "avc1", "-preset", "slow"];
  const scale = (long: number) => (portrait ? `scale=-2:${long}` : `scale=${long}:-2`);
  await ffmpeg([...trim, "-i", original, ...common, "-crf", "30", "-maxrate", "1500k", "-bufsize", "3000k", "-vf", scale(1280), path.join(outDir, `${s.slug}.mp4`)]);
  const file: MediaFile = {
    type: "video",
    src: `/media/verste/${s.slug}.mp4`,
    width: portrait ? 720 : 1280,
    height: portrait ? 1280 : 720,
    durationS: Math.round((end - start) * 10) / 10,
    blurDataURL: "",
  };
  if (s.video?.hd) {
    await ffmpeg([...trim, "-i", original, ...common, "-crf", "28", "-maxrate", "3000k", "-bufsize", "6000k", "-vf", scale(1920), path.join(outDir, `${s.slug}-1080.mp4`)]);
    file.hd = `/media/verste/${s.slug}-1080.mp4`;
  }
  const posterTmp = path.join(srcDir, `${s.slug}-poster.png`);
  await ffmpeg(["-ss", String(start + Math.min(0.5, (end - start) / 2)), "-i", original, "-frames:v", "1", "-map_metadata", "-1", "-vf", scale(1920), posterTmp]);
  const poster = await sharp(posterTmp).resize(1080, 1080, { fit: "inside" }).jpeg({ quality: 78, mozjpeg: true }).toBuffer();
  fs.writeFileSync(path.join(outDir, `${s.slug}-poster.jpg`), poster);
  file.poster = `/media/verste/${s.slug}-poster.jpg`;
  file.blurDataURL = await blur(poster);
  if (s.sequence) {
    const seqDir = path.join(outDir, s.slug);
    fs.mkdirSync(seqDir, { recursive: true });
    const fps = s.sequence.frames / (end - start);
    const tmp = path.join(srcDir, `${s.slug}-frames`);
    fs.mkdirSync(tmp, { recursive: true });
    await ffmpeg([...trim, "-i", original, "-map_metadata", "-1", "-vf", `fps=${fps},${portrait ? "scale=-2:960" : "scale=960:-2"}`, path.join(tmp, "%03d.png")]);
    const frames = fs.readdirSync(tmp).filter((f) => f.endsWith(".png")).sort().slice(0, s.sequence.frames);
    let meta = { width: 0, height: 0 };
    for (const [i, f] of frames.entries()) {
      const out = await sharp(path.join(tmp, f)).webp({ quality: 62 }).toBuffer({ resolveWithObject: true });
      fs.writeFileSync(path.join(seqDir, `${String(i + 1).padStart(3, "0")}.webp`), out.data);
      meta = { width: out.info.width, height: out.info.height };
    }
    file.sequence = { pattern: `/media/verste/${s.slug}/{i}.webp`, count: frames.length, ...meta };
  }
  return file;
}

async function main() {
  fs.mkdirSync(srcDir, { recursive: true });
  fs.mkdirSync(outDir, { recursive: true });
  fs.mkdirSync(path.dirname(manifestPath), { recursive: true });
  const manifest: Record<string, MediaFile> = fs.existsSync(manifestPath) ? JSON.parse(fs.readFileSync(manifestPath, "utf8")) : {};
  const videosOnly = process.argv.includes("--videos");
  const queue = selection.filter((s) => (only ? only.includes(s.slug) : videosOnly ? /\.mov$/i.test(s.file) : force || !manifest[s.slug]));
  let done = 0;
  const worker = async () => {
    for (let s = queue.shift(); s; s = queue.shift()) {
      const original = await download(s.file);
      manifest[s.slug] = /\.mov$/i.test(s.file) ? await video(s, original) : await photo(s, original);
      done++;
      process.stdout.write(`${s.slug} ✓ (${done})\n`);
    }
  };
  await Promise.all(Array.from({ length: 3 }, worker));
  const sorted = Object.fromEntries(Object.entries(manifest).sort(([a], [b]) => a.localeCompare(b)));
  fs.writeFileSync(manifestPath, JSON.stringify(sorted, null, 1) + "\n");
  console.log(`${Object.keys(sorted).length} médias dans ${path.relative(root, manifestPath)}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
