import type { APIRoute } from "astro";
import { sql } from "drizzle-orm";
import { db } from "../../db/client";

export const prerender = false;

export const GET: APIRoute = () => {
  db.get<{ ok: number }>(sql`select 1 as ok`);
  return Response.json({ ok: true });
};
