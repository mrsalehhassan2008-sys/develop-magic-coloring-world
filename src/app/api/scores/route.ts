import { NextResponse } from "next/server";
import { and, desc, eq } from "drizzle-orm";
import { db } from "@/db";
import { highScores } from "@/db/schema";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const mode = new URL(request.url).searchParams.get("mode") ?? "balloon";
  const rows = await db
    .select()
    .from(highScores)
    .where(eq(highScores.mode, mode))
    .orderBy(desc(highScores.score), desc(highScores.createdAt))
    .limit(10);
  return NextResponse.json({ scores: rows });
}

export async function POST(request: Request) {
  const body = (await request.json()) as {
    mode?: string;
    playerName?: string;
    score?: number;
    combo?: number;
    accuracy?: number;
  };
  const mode = (body.mode ?? "balloon").slice(0, 32);
  const playerName = (body.playerName ?? "Artist").slice(0, 18) || "Artist";
  const score = Math.max(0, Math.min(9_999_999, Math.round(Number(body.score) || 0)));

  const [row] = await db
    .insert(highScores)
    .values({
      mode,
      playerName,
      score,
      combo: Math.max(0, Math.round(Number(body.combo) || 0)),
      accuracy: Math.max(0, Math.min(100, Math.round(Number(body.accuracy) || 0))),
    })
    .returning();

  const top = await db
    .select()
    .from(highScores)
    .where(and(eq(highScores.mode, mode)))
    .orderBy(desc(highScores.score), desc(highScores.createdAt))
    .limit(10);

  return NextResponse.json({ saved: row, scores: top });
}
