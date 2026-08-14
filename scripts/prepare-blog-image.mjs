#!/usr/bin/env node

import { mkdir } from "node:fs/promises";
import { basename, extname, join, resolve } from "node:path";
import sharp from "sharp";

const options = parseArgs(process.argv.slice(2));

if (options.help) {
  printHelp();
  process.exit(0);
}

if (!options.input || !options.post || !options.alt) {
  printHelp();
  console.error("\nError: --input, --post, and --alt are required.");
  process.exit(1);
}

const inputPath = resolve(options.input);
const postSlug = slugify(options.post);
const imageName = slugify(options.name ?? basename(inputPath, extname(inputPath)));
const outputRoot = resolve(options.outputRoot ?? "./public/images/blog");
const outputDirectory = join(outputRoot, postSlug);
const publicDirectory = `/images/blog/${postSlug}`;
const metadata = await sharp(inputPath).metadata();
const swapsAxes = [5, 6, 7, 8].includes(metadata.orientation ?? 1);
const sourceWidth = swapsAxes ? metadata.height : metadata.width;

if (!sourceWidth) throw new Error(`Could not determine the width of ${inputPath}`);

const targetWidths = [720, 1400, 2000].filter((width) => width < sourceWidth);
targetWidths.push(sourceWidth);
const widths = [...new Set(targetWidths)].sort((a, b) => a - b);

await mkdir(outputDirectory, { recursive: true });

const variants = [];
for (const width of widths) {
  const baseOutput = join(outputDirectory, `${imageName}-${width}`);
  const avifInfo = await sharp(inputPath)
    .rotate()
    .resize({ width, fit: "inside", withoutEnlargement: true })
    .avif({ quality: 58, effort: 4 })
    .toFile(`${baseOutput}.avif`);
  await sharp(inputPath)
    .rotate()
    .resize({ width, fit: "inside", withoutEnlargement: true })
    .webp({ quality: 80, effort: 4 })
    .toFile(`${baseOutput}.webp`);
  variants.push({ width: avifInfo.width, height: avifInfo.height });
}

const fallback = variants.find((variant) => variant.width >= 1400) ?? variants.at(-1);
const avifSourceSet = variants.map(({ width }) => `${publicDirectory}/${imageName}-${width}.avif ${width}w`).join(", ");
const webpSourceSet = variants.map(({ width }) => `${publicDirectory}/${imageName}-${width}.webp ${width}w`).join(", ");
const alt = escapeHtml(options.alt);
const caption = options.caption ? `\n  <figcaption>${escapeHtml(options.caption)}</figcaption>` : "";

console.log(`\nGenerated ${variants.length * 2} files in ${outputDirectory}`);
console.log("\nPaste this into the Markdown post:\n");
console.log(`<figure class="post-figure">
  <picture>
    <source type="image/avif" srcset="${avifSourceSet}" sizes="(max-width: 650px) calc(100vw - 2rem), 720px">
    <source type="image/webp" srcset="${webpSourceSet}" sizes="(max-width: 650px) calc(100vw - 2rem), 720px">
    <img src="${publicDirectory}/${imageName}-${fallback.width}.webp" width="${fallback.width}" height="${fallback.height}" loading="lazy" decoding="async" alt="${alt}">
  </picture>${caption}
</figure>`);

function parseArgs(args) {
  const parsed = {};
  for (let index = 0; index < args.length; index += 1) {
    const argument = args[index];
    if (argument === "--help" || argument === "-h") parsed.help = true;
    else if (argument.startsWith("--")) parsed[argument.slice(2).replace(/-([a-z])/g, (_, character) => character.toUpperCase())] = args[++index];
  }
  return parsed;
}

function slugify(value) {
  const slug = value.normalize("NFKD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
  if (!slug) throw new Error(`Could not make a safe filename from “${value}”`);
  return slug;
}

function escapeHtml(value) {
  return value.replaceAll("&", "&amp;").replaceAll('"', "&quot;").replaceAll("<", "&lt;").replaceAll(">", "&gt;");
}

function printHelp() {
  console.log(`Prepare a responsive photograph for a blog post.

Usage:
  npm run blog:image -- --input /path/to/photo.jpg --post post-slug --name image-name --alt "Description" [--caption "Caption"]

Options:
  --input        Source photograph; it remains untouched.
  --post         Blog post slug used for the output directory.
  --name         Optional web filename; defaults to the source filename.
  --alt          Required accessible image description.
  --caption      Optional visible caption.
  --output-root  Optional output directory, primarily for testing.
  --help         Show this help.`);
}
