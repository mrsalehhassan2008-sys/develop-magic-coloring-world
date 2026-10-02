import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { rooms } from "@/db/schema";

export const dynamic = "force-dynamic";

const LETTERS = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
function makeCode() {
  let c = "";
  for (let i = 0; i < 4; i++) c += LETTERS[(Math.random() * LETTERS.length) | 0];
  return c;
}

export async function POST(request: Request) {
  let body: {
    action?: "create" | "join";
    pageSlug?: string;
    code?: string;
    name?: string;
  };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "invalid json" }, { status: 400 });
  }

  const name = (body.name ?? "Artist").slice(0, 14) || "Artist";

  if (body.action === "create") {
    const pageSlug = (body.pageSlug ?? "").slice(0, 80);
    if (!pageSlug) return NextResponse.json({ error: "no page" }, { status: 400 });
    let code = makeCode();
    for (let tries = 0; tries < 8; tries++) {
      const [existing] = await db.select().from(rooms).where(eq(rooms.code, code)).limit(1);
      if (!existing) break;
      code = makeCode();
    }
    const [row] = await db
      .insert(rooms)
      .values({ code, pageSlug, fills: {}, stickers: [], names: [name] })
      .returning();
    return NextResponse.json({ code: row.code, pageSlug: row.pageSlug, state: row });
  }

  if (body.action === "join") {
    const code = (body.code ?? "").toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 6);
    if (code.length < 4) return NextResponse.json({ error: "bad code" }, { status: 400 });
    const [row] = await db.select().from(rooms).where(eq(rooms.code, code)).limit(1);
    if (!row) return NextResponse.json({ error: "not found" }, { status: 404 });
    const names = Array.isArray(row.names) ? (row.names as string[]) : [];
    let nextNames = names;
    if (!names.includes(name) && names.length < 6) {
      nextNames = [...names, name];
      await db.update(rooms).set({ names: nextNames, updatedAt: new Date() }).where(eq(rooms.code, code));
    }
    return NextResponse.json({
      code: row.code,
      pageSlug: row.pageSlug,
      state: { ...row, names: nextNames },
    });
  }

  return NextResponse.json({ error: "bad action" }, { status: 400 });
}
