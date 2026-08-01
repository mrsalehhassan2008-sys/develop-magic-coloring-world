import { NextResponse } from "next/server";
import { asc, eq, sql } from "drizzle-orm";
import { db } from "@/db";
import { coloringPages } from "@/db/schema";
import { buildCatalog } from "@/lib/art/catalog";

export const dynamic = "force-dynamic";

let seeded = false;

/** Idempotent seed: the catalogue table is the single source of truth and can
 *  grow to thousands of rows without any code change. */
async function ensureSeed() {
  if (seeded) return;
  const rows = buildCatalog().map((p, i) => ({
    slug: p.slug,
    title: p.title,
    category: p.category,
    difficulty: p.difficulty,
    premium: false,
    orderIndex: i,
    data: { emoji: p.emoji, viewBox: p.viewBox, shapes: p.shapes },
  }));
  const chunk = 40;
  for (let i = 0; i < rows.length; i += chunk) {
    await db.insert(coloringPages).values(rows.slice(i, i + chunk)).onConflictDoNothing();
  }
  seeded = true;
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const category = url.searchParams.get("category");
  const slug = url.searchParams.get("slug");
  await ensureSeed();

  if (slug) {
    const [page] = await db.select().from(coloringPages).where(eq(coloringPages.slug, slug)).limit(1);
    if (!page) return NextResponse.json({ error: "not found" }, { status: 404 });
    return NextResponse.json({ page });
  }

  if (category) {
    const pages = await db
      .select()
      .from(coloringPages)
      .where(eq(coloringPages.category, category))
      .orderBy(asc(coloringPages.orderIndex));
    return NextResponse.json({ pages });
  }

  const counts = await db
    .select({ category: coloringPages.category, count: sql<number>`count(*)::int` })
    .from(coloringPages)
    .groupBy(coloringPages.category);
  const total = counts.reduce((a, c) => a + Number(c.count), 0);
  return NextResponse.json({ counts, total });
}
