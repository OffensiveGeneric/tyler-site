import type { APIRoute } from "astro";
import { getCollection } from "astro:content";
import { asc } from "drizzle-orm";
import { db } from "../db/client";
import { photos } from "../db/schema";

export const prerender = false;

const escapeXml = (value: string) => value.replace(/[<>&'\"]/g, (character) => ({
  "<": "&lt;",
  ">": "&gt;",
  "&": "&amp;",
  "'": "&apos;",
  '"': "&quot;",
})[character] ?? character);

export const GET: APIRoute = async ({ site }) => {
  const base = site ?? new URL("https://ooknulsus.com");
  const posts = await getCollection("blog", ({ data }) => !data.draft);
  const gallery = db.select({ slug: photos.slug }).from(photos).orderBy(asc(photos.createdAt), asc(photos.id)).all();
  const paths = [
    "/",
    "/cv",
    "/photography",
    "/blog",
    "/about",
    ...posts.map((post) => `/blog/${post.id}`),
    ...gallery.map((photo) => `/photography/${photo.slug}`),
  ];
  const body = paths.map((path) => `  <url><loc>${escapeXml(new URL(path, base).href)}</loc></url>`).join("\n");

  return new Response(`<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${body}\n</urlset>\n`, {
    headers: { "Content-Type": "application/xml; charset=utf-8" },
  });
};
