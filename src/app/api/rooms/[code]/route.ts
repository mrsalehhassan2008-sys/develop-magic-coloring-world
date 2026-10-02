import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { rooms } from "@/db/schema";

export const dynamic = "force-dynamic";

type Ctx = { params: Promise<{ code: string }> };

const STALE_MS = 2 * 60 * 60 * 1000; // 2 hours

export async function GET(_request: Request, ctx: Ctx) {
  const { code } = await ctx.params;
  const [row] = await db.select().from(rooms).where(eq(rooms.code, code.toUpperCase())).limit(1);
  if (!row) return NextResponse.json({ error: "not found" }, { status: 404 });
  return NextResponse.json({
    room: row,
    stale: Date.now() - new Date(row.updatedAt).getTime() > STALE_MS,
  });
}

/**
 * Push local fills/stickers into the room.
 * Fills are MERGED (not replaced) so concurrent colorers don't wipe each other.
 * Stickers are unioned by id. Names are additive up to 6 players.
 */
export async function POST(request: Request, ctx: Ctx) {
  const { code } = await ctx.params;
  const body = (await request.json()) as {
    fills?: Record<string, string>;
    stickers?: unknown[];
    name?: string;
  };
  const [row] = await db.select().from(rooms).where(eq(rooms.code, code.toUpperCase())).limit(1);
  if (!row) return NextResponse.json({ error: "not found" }, { status: 404 });

  const names = Array.isArray(row.names) ? (row.names as string[]) : [];
  const name = (body.name ?? "").slice(0, 14);
  const nextNames = name && !names.includes(name) && names.length < 6 ? [...names, name] : names;

  const prevFills = (row.fills ?? {}) as Record<string, string>;
  const incoming = body.fills ?? {};
  const mergedFills: Record<string, string> = { ...prevFills };
  for (const [id, color] of Object.entries(incoming)) {
    if (color === undefined || color === null) continue;
    if (color === "" || color === "#FFFFFF" || color === "#ffffff") {
      delete mergedFills[id];
    } else {
      mergedFills[id] = color;
    }
  }

  type StickerLike = { id?: string };
  const prevStickers = Array.isArray(row.stickers) ? (row.stickers as StickerLike[]) : [];
  const nextStickers = Array.isArray(body.stickers) ? (body.stickers as StickerLike[]) : prevStickers;
  const byId = new Map<string, StickerLike>();
  for (const s of prevStickers) if (s?.id) byId.set(s.id, s);
  for (const s of nextStickers) if (s?.id) byId.set(s.id, s);
  const mergedStickers = Array.from(byId.values());

  const [updated] = await db
    .update(rooms)
    .set({
      fills: mergedFills,
      stickers: mergedStickers,
      names: nextNames,
      updatedAt: new Date(),
    })
    .where(eq(rooms.code, code.toUpperCase()))
    .returning();

  return NextResponse.json({ room: updated });
}
