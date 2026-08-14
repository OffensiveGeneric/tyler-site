#!/usr/bin/env node

import { mkdir, writeFile } from "node:fs/promises";
import { basename, extname, join, resolve } from "node:path";
import { createInterface } from "node:readline/promises";
import sharp from "sharp";

let options = parseArgs(process.argv.slice(2));

if (options.help) {
  printHelp();
  process.exit(0);
}

if ((!options.input || !options.post || !options.alt) && process.stdin.isTTY) {
  options = await promptForOptions(options);
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
const manifest = {
  version: 1,
  variants,
  fallbackWidth: fallback.width,
  sizes: "(max-width: 650px) calc(100vw - 2rem), 720px",
};
await writeFile(join(outputDirectory, `${imageName}.json`), `${JSON.stringify(manifest, null, 2)}\n`);
const fallbackPath = `${publicDirectory}/${imageName}-${fallback.width}.webp`;
const alt = escapeMarkdown(options.alt);
const caption = options.caption ? ` "${escapeMarkdown(options.caption)}"` : "";

console.log(`\nGenerated ${variants.length * 2} image files and one manifest in ${outputDirectory}`);
console.log("\nPaste this line into the Markdown post:\n");
console.log(`![${alt}](${fallbackPath}${caption})`);

function parseArgs(args) {
  const parsed = {};
  for (let index = 0; index < args.length; index += 1) {
    const argument = args[index];
    if (argument === "--help" || argument === "-h") parsed.help = true;
    else if (argument.startsWith("--")) parsed[argument.slice(2).replace(/-([a-z])/g, (_, character) => character.toUpperCase())] = args[++index];
  }
  return parsed;
}

async function promptForOptions(existing) {
  const prompts = createInterface({ input: process.stdin, output: process.stdout });
  const ask = async (label, current = "") => {
    const answer = (await prompts.question(`${label}${current ? ` [${current}]` : ""}: `)).trim();
    return answer || current;
  };

  try {
    const input = cleanPath(await ask("Image file", existing.input));
    const post = await ask("Post slug (the Markdown filename without .md)", existing.post);
    const suggestedName = existing.name || (input ? basename(input, extname(input)) : "");
    const name = await ask("Short web filename", suggestedName);
    const alt = await ask("Alt text (describe what the image shows)", existing.alt);
    const caption = await ask("Visible caption (optional)", existing.caption);
    return { ...existing, input, post, name, alt, caption };
  } finally {
    prompts.close();
  }
}

function cleanPath(value) {
  const quote = value.at(0);
  return quote && quote === value.at(-1) && ['"', "'"].includes(quote) ? value.slice(1, -1) : value;
}

function slugify(value) {
  const slug = value.normalize("NFKD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
  if (!slug) throw new Error(`Could not make a safe filename from “${value}”`);
  return slug;
}

function escapeMarkdown(value) {
  return value.replaceAll("\\", "\\\\").replaceAll("]", "\\]").replaceAll('"', '\\"');
}

function printHelp() {
  console.log(`Prepare a responsive photograph for a blog post.

Usage:
  npm run blog:image

Or provide every value without prompts:
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
