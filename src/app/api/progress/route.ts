import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { progress } from "@/db/schema";

export const dynamic = "force-dynamic";

/** GET /api/progress?code=XXXX  → restore a child profile on any device */
export async function GET(request: Request) {
  const code = new URL(request.url).searchParams.get("code")?.toUpperCase().trim() ?? "";
  if (!code) return NextResponse.json({ error: "no code" }, { status: 400 });
  const [row] = await db.select().from(progress).where(eq(progress.profile, code)).limit(1);
  if (!row || !row.data) return NextResponse.json({ error: "not found" }, { status: 404 });
  return NextResponse.json({ data: row.data });
}

/** POST {code, data} → cloud-save a child profile (upsert) */
export async function POST(request: Request) {
  const body = (await request.json()) as { code?: string; data?: unknown };
  const code = (body.code ?? "").toUpperCase().trim();
  if (!code || !body.data) return NextResponse.json({ error: "bad payload" }, { status: 400 });
  const [row] = await db.select().from(progress).where(eq(progress.profile, code)).limit(1);
  if (row) {
    await db.update(progress).set({ data: body.data, updatedAt: new Date() }).where(eq(progress.profile, code));
  } else {
    await db.insert(progress).values({ profile: code, data: body.data });
  }
  return NextResponse.json({ ok: true });
}
