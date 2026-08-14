#!/usr/bin/env node

import { copyFile, mkdir, readFile, readdir } from "node:fs/promises";
import { createHash } from "node:crypto";
import { basename, dirname, extname, join, relative, resolve } from "node:path";
import Database from "better-sqlite3";
import exifr from "exifr";
import sharp from "sharp";

const sizes = {
  thumb: { width: 480, quality: 52 },
  medium: { width: 1400, quality: 58 },
  large: { width: 2400, quality: 62 },
};
const supported = new Set([".jpg", ".jpeg", ".png", ".tif", ".tiff", ".webp"]);

const options = parseArgs(process.argv.slice(2));
if (!options.source) {
  console.error("Usage: node scripts/ingest-photos.mjs --source /path/to/photos [--media-root /srv/tyler-site/media] [--db /srv/tyler-site/data/site.db] [--copy-originals] [--dry-run]");
  process.exit(1);
}

const sourceRoot = resolve(options.source);
const mediaRoot = resolve(options.mediaRoot ?? process.env.MEDIA_ROOT ?? "./media");
const databasePath = resolve(options.db ?? process.env.SITE_DB_PATH ?? "./data/site.db");
const files = options.fileList
  ? (await readFile(resolve(options.fileList), "utf8")).split(/\r?\n/).map((file) => file.trim()).filter(Boolean)
  : await collectFiles(sourceRoot);
const db = options.dryRun ? null : new Database(databasePath);

if (db) {
  db.pragma("journal_mode = WAL");
  db.exec(`
    CREATE TABLE IF NOT EXISTS photos (
      id integer primary key autoincrement not null,
      slug text not null unique,
      filename text not null,
      original_filename text,
      original_path text,
      thumb_avif text,
      thumb_webp text,
      medium_avif text,
      medium_webp text,
      large_avif text,
      large_webp text,
      title text,
      caption text,
      date_taken text,
      camera text,
      lens text,
      width integer,
      height integer,
      orientation text,
      featured integer default false not null,
      created_at integer not null
    );
    CREATE UNIQUE INDEX IF NOT EXISTS photos_slug_unique ON photos(slug);
  `);
}

const upsert = db?.prepare(`
  INSERT INTO photos (
    slug, filename, original_filename, original_path,
    thumb_avif, thumb_webp, medium_avif, medium_webp, large_avif, large_webp,
    title, caption, date_taken, camera, lens, width, height, orientation, created_at
  ) VALUES (@slug, @filename, @originalFilename, @originalPath, @thumbAvif, @thumbWebp, @mediumAvif, @mediumWebp, @largeAvif, @largeWebp, @title, NULL, @dateTaken, @camera, @lens, @width, @height, @orientation, @createdAt)
  ON CONFLICT(slug) DO UPDATE SET
    filename = excluded.filename,
    original_filename = excluded.original_filename,
    original_path = excluded.original_path,
    thumb_avif = excluded.thumb_avif,
    thumb_webp = excluded.thumb_webp,
    medium_avif = excluded.medium_avif,
    medium_webp = excluded.medium_webp,
    large_avif = excluded.large_avif,
    large_webp = excluded.large_webp,
    title = COALESCE(photos.title, excluded.title),
    date_taken = COALESCE(photos.date_taken, excluded.date_taken),
    camera = COALESCE(photos.camera, excluded.camera),
    lens = COALESCE(photos.lens, excluded.lens),
    width = excluded.width,
    height = excluded.height,
    orientation = excluded.orientation
`);

let processed = 0;
let skipped = 0;
for (const file of files) {
  const extension = extname(file).toLowerCase();
  if (!supported.has(extension)) {
    skipped += 1;
    continue;
  }

  try {
    const relativePath = relative(sourceRoot, file);
    const slug = makeSlug(relativePath);
    const metadata = await sharp(file).metadata();
    const exif = await exifr.parse(file, { tiff: true, ifd0: true, exif: true, xmp: true }).catch(() => null);
    const derivativePaths = {};

    for (const [size, config] of Object.entries(sizes)) {
      for (const format of ["avif", "webp"]) {
        const outputRelative = `${size}/${slug}.${format}`;
        derivativePaths[`${size}${format[0].toUpperCase()}${format.slice(1)}`] = outputRelative;
        if (!options.dryRun) {
          await mkdir(dirname(join(mediaRoot, outputRelative)), { recursive: true });
          let pipeline = sharp(file).rotate().resize({ width: config.width, fit: "inside", withoutEnlargement: true });
          pipeline = format === "avif" ? pipeline.avif({ quality: config.quality, effort: 0 }) : pipeline.webp({ quality: 78, effort: 3 });
          await pipeline.toFile(join(mediaRoot, outputRelative));
        }
      }
    }

    let originalFilename = null;
    if (options.copyOriginals && !options.dryRun) {
      originalFilename = `originals/${relativePath.replaceAll("\\", "/")}`;
      await mkdir(dirname(join(mediaRoot, originalFilename)), { recursive: true });
      await copyFile(file, join(mediaRoot, originalFilename));
    }

    const record = {
      slug,
      filename: derivativePaths.largeAvif,
      originalFilename,
      originalPath: file,
      thumbAvif: derivativePaths.thumbAvif,
      thumbWebp: derivativePaths.thumbWebp,
      mediumAvif: derivativePaths.mediumAvif,
      mediumWebp: derivativePaths.mediumWebp,
      largeAvif: derivativePaths.largeAvif,
      largeWebp: derivativePaths.largeWebp,
      title: basename(file, extension),
      dateTaken: formatDate(exif?.DateTimeOriginal ?? exif?.CreateDate ?? exif?.ModifyDate),
      camera: [exif?.Make, exif?.Model].filter(Boolean).join(" ") || null,
      lens: exif?.LensModel ?? exif?.Lens ?? null,
      width: metadata.width ?? null,
      height: metadata.height ?? null,
      orientation: metadata.orientation ? String(metadata.orientation) : null,
      createdAt: Date.now(),
    };

    if (upsert) upsert.run(record);
    processed += 1;
    console.log(`${options.dryRun ? "would ingest" : "ingested"}: ${relativePath} -> ${record.largeAvif}`);
  } catch (error) {
    skipped += 1;
    console.error(`skipped: ${file}\n  ${error.message}`);
  }
}

db?.close();
console.log(`\n${options.dryRun ? "Dry run" : "Ingestion"} complete: ${processed} processed, ${skipped} skipped.`);

function parseArgs(args) {
  const result = {};
  for (let index = 0; index < args.length; index += 1) {
    const arg = args[index];
    const key = arg.slice(2).replace(/-([a-z])/g, (_, character) => character.toUpperCase());
    if (arg === "--dry-run" || arg === "--copy-originals") result[key] = true;
    else if (arg.startsWith("--")) result[key] = args[++index];
  }
  return result;
}

async function collectFiles(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    const path = join(directory, entry.name);
    if (entry.isDirectory()) files.push(...await collectFiles(path));
    else files.push(path);
  }
  return files.sort();
}

function makeSlug(relativePath) {
  const withoutExtension = relativePath.replace(extname(relativePath), "");
  const slug = withoutExtension.normalize("NFKD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
  return slug || `photo-${createHash("sha1").update(relativePath).digest("hex").slice(0, 10)}`;
}

function formatDate(value) {
  if (!value) return null;
  const date = value instanceof Date ? value : new Date(value);
  return Number.isNaN(date.valueOf()) ? null : date.toISOString().slice(0, 10);
}
