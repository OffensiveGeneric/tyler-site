import type { APIRoute } from "astro";
import { desc } from "drizzle-orm";
import { db } from "../../db/client";
import { photos } from "../../db/schema";

export const prerender = false;

export const GET: APIRoute = () => {
  const results = db.select().from(photos).orderBy(desc(photos.createdAt)).all();

  return new Response(JSON.stringify(results), {
    headers: { "content-type": "application/json; charset=utf-8" },
  });
};
