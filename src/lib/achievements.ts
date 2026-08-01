import type { Progress } from "./progress";

export interface Achievement {
  id: string;
  emoji: string;
  title: string;
  desc: string;
  /** returns true when unlocked, given the current progress */
  test: (p: Progress) => boolean;
}

export const ACHIEVEMENTS: Achievement[] = [
  { id: "first-color", emoji: "🎨", title: "First Masterpiece", desc: "Finish your first picture", test: (p) => p.completed.length >= 1 },
  { id: "color-5", emoji: "🖌️", title: "Busy Brush", desc: "Finish 5 pictures", test: (p) => p.completed.length >= 5 },
  { id: "color-15", emoji: "🏅", title: "Little Artist", desc: "Finish 15 pictures", test: (p) => p.completed.length >= 15 },
  { id: "color-30", emoji: "👑", title: "Master Painter", desc: "Finish 30 pictures", test: (p) => p.completed.length >= 30 },
  { id: "stars-50", emoji: "⭐", title: "Star Collector", desc: "Collect 50 stars", test: (p) => p.stars >= 50 },
  { id: "stars-150", emoji: "🌟", title: "Star Champion", desc: "Collect 150 stars", test: (p) => p.stars >= 150 },
  { id: "coins-200", emoji: "🪙", title: "Coin Saver", desc: "Save 200 coins", test: (p) => p.coins >= 200 },
  { id: "streak-3", emoji: "🔥", title: "On a Roll", desc: "Play 3 days in a row", test: (p) => p.streak >= 3 },
  { id: "streak-7", emoji: "📅", title: "Week Wonder", desc: "Play 7 days in a row", test: (p) => p.streak >= 7 },
  { id: "balloon-1000", emoji: "🎈", title: "Balloon Buster", desc: "Score 1000 in Balloon Pop", test: (p) => p.bestBalloon >= 1000 },
  { id: "balloon-3000", emoji: "💥", title: "Pop Star", desc: "Score 3000 in Balloon Pop", test: (p) => p.bestBalloon >= 3000 },
  { id: "dots-10", emoji: "🔢", title: "Dot Detective", desc: "Reach dot puzzle 10", test: (p) => p.bestDots >= 10 },
  { id: "dots-30", emoji: "✏️", title: "Connect Champion", desc: "Reach dot puzzle 30", test: (p) => p.bestDots >= 30 },
  { id: "shadow-5", emoji: "🌑", title: "Shadow Seeker", desc: "Score 5 in Shadow Match", test: (p) => p.bestShadow >= 5 },
  { id: "shadow-12", emoji: "🕵️", title: "Shadow Master", desc: "Score 12 in Shadow Match", test: (p) => p.bestShadow >= 12 },
  { id: "chest", emoji: "🎁", title: "Treasure Hunter", desc: "Open a treasure chest", test: (p) => p.chestProgress > 0 || p.lastReward !== null },
];

/** returns the newly unlocked achievements given the previous unlocked ids */
export function newlyUnlocked(p: Progress): Achievement[] {
  return ACHIEVEMENTS.filter((a) => !p.achievements.includes(a.id) && a.test(p));
}
