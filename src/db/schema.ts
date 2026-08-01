import {
  pgTable,
  serial,
  text,
  integer,
  timestamp,
  jsonb,
  boolean,
  index,
  uniqueIndex,
} from "drizzle-orm/pg-core";

/**
 * Scalable catalog of coloring pages.
 * Artwork is stored as declarative shape JSON so the catalog can grow to
 * thousands of pages without any code change (just insert rows).
 */
export const coloringPages = pgTable(
  "coloring_pages",
  {
    id: serial("id").primaryKey(),
    slug: text("slug").notNull(),
    title: text("title").notNull(),
    category: text("category").notNull(),
    difficulty: integer("difficulty").notNull().default(1),
    premium: boolean("premium").notNull().default(false),
    orderIndex: integer("order_index").notNull().default(0),
    data: jsonb("data").notNull(),
    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
  (t) => [
    uniqueIndex("coloring_pages_slug_idx").on(t.slug),
    index("coloring_pages_category_idx").on(t.category),
  ],
);

/** Saved / exported children artwork (gallery). */
export const artworks = pgTable(
  "artworks",
  {
    id: serial("id").primaryKey(),
    pageSlug: text("page_slug").notNull(),
    title: text("title").notNull(),
    profile: text("profile").notNull().default("kid"),
    fills: jsonb("fills").notNull(),
    strokes: jsonb("strokes").notNull(),
    stickers: jsonb("stickers").notNull(),
    thumbnail: text("thumbnail"),
    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
  (t) => [index("artworks_created_idx").on(t.createdAt)],
);

/** Arcade high score table (balloon pop + connect the dots). */
export const highScores = pgTable(
  "high_scores",
  {
    id: serial("id").primaryKey(),
    mode: text("mode").notNull(),
    playerName: text("player_name").notNull(),
    score: integer("score").notNull(),
    combo: integer("combo").notNull().default(0),
    accuracy: integer("accuracy").notNull().default(0),
    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
  (t) => [index("high_scores_mode_score_idx").on(t.mode, t.score)],
);

/** Player progress: stars, coins, unlocks, daily rewards. */
export const progress = pgTable(
  "progress",
  {
    id: serial("id").primaryKey(),
    profile: text("profile").notNull().default("kid"),
    stars: integer("stars").notNull().default(0),
    coins: integer("coins").notNull().default(0),
    pagesCompleted: integer("pages_completed").notNull().default(0),
    unlocks: jsonb("unlocks").notNull().default([]),
    purchases: jsonb("purchases").notNull().default([]), // ['premium-animals', 'all-access']
    lastRewardDay: text("last_reward_day"),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
  },
  (t) => [uniqueIndex("progress_profile_idx").on(t.profile)],
);

/** In-app purchase products */
export const products = pgTable(
  "products",
  {
    id: serial("id").primaryKey(),
    productId: text("product_id").notNull().unique(),
    title: text("title").notNull(),
    description: text("description").notNull(),
    price: integer("price").notNull(), // in cents
    currency: text("currency").notNull().default("USD"),
    type: text("type").notNull(), // 'unlock_category' | 'unlock_all' | 'remove_ads'
    content: jsonb("content").notNull(), // { categories: ['dinosaurs', 'princesses'] }
    active: boolean("active").notNull().default(true),
    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
);

export type ColoringPageRow = typeof coloringPages.$inferSelect;
export type ArtworkRow = typeof artworks.$inferSelect;
export type HighScoreRow = typeof highScores.$inferSelect;
export type ProgressRow = typeof progress.$inferSelect;
