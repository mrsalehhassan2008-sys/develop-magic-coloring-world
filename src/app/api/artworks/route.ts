import { NextResponse } from "next/server";
import { desc, eq } from "drizzle-orm";
import { db } from "@/db";
import { artworks } from "@/db/schema";

export const dynamic = "force-dynamic";

export async function GET() {
  const rows = await db.select().from(artworks).orderBy(desc(artworks.createdAt)).limit(60);
  return NextResponse.json({ artworks: rows });
}

export async function POST(request: Request) {
  const body = (await request.json()) as {
    pageSlug?: string;
    title?: string;
    fills?: unknown;
    strokes?: unknown;
    stickers?: unknown;
    thumbnail?: string;
  };
  const [row] = await db
    .insert(artworks)
    .values({
      pageSlug: (body.pageSlug ?? "blank").slice(0, 80),
      title: (body.title ?? "My Artwork").slice(0, 60),
      fills: body.fills ?? {},
      strokes: body.strokes ?? [],
      stickers: body.stickers ?? [],
      thumbnail: (body.thumbnail ?? "").slice(0, 1_500_000) || null,
    })
    .returning();
  return NextResponse.json({ artwork: row });
}

export async function DELETE(request: Request) {
  const id = Number(new URL(request.url).searchParams.get("id"));
  if (!Number.isFinite(id)) return NextResponse.json({ error: "bad id" }, { status: 400 });
  await db.delete(artworks).where(eq(artworks.id, id));
  return NextResponse.json({ ok: true });
}
