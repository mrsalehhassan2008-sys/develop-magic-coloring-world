import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { rooms } from "@/db/schema";

export const dynamic = "force-dynamic";

type Ctx = { params: Promise<{ code: string }> };

export async function GET(_request: Request, ctx: Ctx) {
  const { code } = await ctx.params;
  const [row] = await db.select().from(rooms).where(eq(rooms.code, code.toUpperCase())).limit(1);
  if (!row) return NextResponse.json({ error: "not found" }, { status: 404 });
  return NextResponse.json({ room: row });
}

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

  const [updated] = await db
    .update(rooms)
    .set({
      fills: body.fills ?? row.fills,
      stickers: body.stickers ?? row.stickers,
      names: nextNames,
      updatedAt: new Date(),
    })
    .where(eq(rooms.code, code.toUpperCase()))
    .returning();

  return NextResponse.json({ room: updated });
}
