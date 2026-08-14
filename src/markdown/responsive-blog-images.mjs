import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";

export default function responsiveBlogImages() {
  return {
    name: "responsive-blog-images",
    element: {
      filter: ["p"],
      visit(node, context) {
        const image = singleImage(node);
        if (!image) return;

        const figure = buildFigure(image);
        if (figure) {
          context.replaceNode(node, figure);
        }
      }
    },
  };
}

function singleImage(node) {
  if (node?.type !== "element" || node.tagName !== "p" || node.children?.length !== 1) return null;
  const image = node.children[0];
  return image?.type === "element" && image.tagName === "img" ? image : null;
}

function buildFigure(image) {
  const source = String(image.properties?.src ?? "");
  const match = source.match(/^\/images\/blog\/([a-z0-9-]+)\/([a-z0-9-]+)-(\d+)\.webp$/);
  if (!match) return null;

  const [, postSlug, imageName] = match;
  const manifestPath = resolve(`public/images/blog/${postSlug}/${imageName}.json`);
  if (!existsSync(manifestPath)) return null;

  const manifest = JSON.parse(readFileSync(manifestPath, "utf8"));
  if (!Array.isArray(manifest.variants) || manifest.variants.length === 0) return null;

  const publicDirectory = `/images/blog/${postSlug}`;
  const sourceSet = (format) => manifest.variants
    .map(({ width }) => `${publicDirectory}/${imageName}-${width}.${format} ${width}w`)
    .join(", ");
  const fallback = manifest.variants.find(({ width }) => width === manifest.fallbackWidth) ?? manifest.variants.at(-1);
  const caption = image.properties?.title;
  const figureChildren = [
    {
      type: "element",
      tagName: "picture",
      properties: {},
      children: [
        { type: "element", tagName: "source", properties: { type: "image/avif", srcSet: sourceSet("avif"), sizes: manifest.sizes }, children: [] },
        { type: "element", tagName: "source", properties: { type: "image/webp", srcSet: sourceSet("webp"), sizes: manifest.sizes }, children: [] },
        {
          type: "element",
          tagName: "img",
          properties: {
            src: `${publicDirectory}/${imageName}-${fallback.width}.webp`,
            width: fallback.width,
            height: fallback.height,
            loading: "lazy",
            decoding: "async",
            alt: image.properties?.alt ?? "",
          },
          children: [],
        },
      ],
    },
  ];

  if (caption) figureChildren.push({ type: "element", tagName: "figcaption", properties: {}, children: [{ type: "text", value: String(caption) }] });

  return { type: "element", tagName: "figure", properties: { className: ["post-figure"] }, children: figureChildren };
}
