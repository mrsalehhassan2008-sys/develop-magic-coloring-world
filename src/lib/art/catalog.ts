import { bird, car, critter, CritterOpts, dino, DinoOpts, flower, food, makePage, princess, sea, space } from "./builders";
import { PageArt, resetIds } from "./shapes";
import { buildScenes } from "./scenes";

export const CATEGORIES = [
  { key: "scenes", label: "Big Pictures", emoji: "🏞️", color: "#7ED087" },
  { key: "animals", label: "Animals", emoji: "🐻", color: "#FF9F68" },
  { key: "dinosaurs", label: "Dinosaurs", emoji: "🦕", color: "#7ED087" },
  { key: "cars", label: "Cars", emoji: "🚗", color: "#5AC8FA" },
  { key: "princesses", label: "Princesses", emoji: "👑", color: "#FF7FB6" },
  { key: "space", label: "Space", emoji: "🚀", color: "#8E7CFF" },
  { key: "sea", label: "Sea Animals", emoji: "🐬", color: "#38C6D9" },
  { key: "farm", label: "Farm Animals", emoji: "🐮", color: "#FFC94D" },
  { key: "birds", label: "Birds", emoji: "🦜", color: "#FF6B8B" },
  { key: "flowers", label: "Flowers", emoji: "🌸", color: "#FF97C9" },
  { key: "food", label: "Food", emoji: "🍩", color: "#FFB03A" },
] as const;

type Spec = [string, string, CritterOpts];

const ANIMALS: Spec[] = [
  ["bear", "Happy Bear", { fur: "#C98A5B", belly: "#F3D6B2", ear: "round", snout: "oval", cheeks: "#FFB4C6", tail: "puff" }],
  ["cat", "Cuddly Cat", { fur: "#FFB86B", belly: "#FFF0D8", ear: "pointy", snout: "none", whiskers: true, tail: "long", cheeks: "#FFB4C6" }],
  ["dog", "Playful Puppy", { fur: "#E8C08A", belly: "#FFF3DE", ear: "floppy", snout: "oval", tail: "curl" }],
  ["rabbit", "Bouncy Bunny", { fur: "#F2F0FF", belly: "#FFFFFF", ear: "long", snout: "oval", cheeks: "#FFB4C6", tail: "puff" }],
  ["fox", "Clever Fox", { fur: "#FF8A4C", belly: "#FFF1E2", ear: "pointy", snout: "long", tail: "long", tailColor: "#FFD9BC" }],
  ["panda", "Bamboo Panda", { fur: "#FFFFFF", belly: "#F4F4FF", ear: "round", earIn: "#3B3050", snout: "oval", spots: "#3B3050" }],
  ["koala", "Sleepy Koala", { fur: "#B9C3D6", belly: "#E8EEFA", ear: "round", earIn: "#DCE5F5", snout: "oval", snoutColor: "#6D6A86" }],
  ["lion", "Brave Lion", { fur: "#FFC55B", mane: "#F08A3C", ear: "round", snout: "oval", whiskers: true }],
  ["tiger", "Stripy Tiger", { fur: "#FFA43C", belly: "#FFF0D8", ear: "round", snout: "oval", stripes: 4, whiskers: true }],
  ["monkey", "Cheeky Monkey", { fur: "#B07C4F", belly: "#F6D9AE", ear: "round", earIn: "#F6D9AE", snout: "oval", snoutColor: "#F6D9AE", tail: "curl" }],
  ["elephant", "Gentle Elephant", { fur: "#A9B7D6", belly: "#D9E2F5", ear: "floppy", snout: "long", snoutColor: "#C3CFE8" }],
  ["mouse", "Tiny Mouse", { fur: "#C9C6E0", belly: "#F1EFFF", ear: "round", earIn: "#FFC2D4", snout: "long", whiskers: true, tail: "long" }],
  ["hippo", "Happy Hippo", { fur: "#B49BE0", belly: "#DCCFFA", ear: "round", snout: "pig", snoutColor: "#D3BFFF" }],
  ["zebra", "Zippy Zebra", { fur: "#FFFFFF", belly: "#F2F2FA", ear: "round", snout: "long", stripes: 4, mane: "#3B3050" }],
  ["giraffe", "Tall Giraffe", { fur: "#FFD166", belly: "#FFF0C4", ear: "round", snout: "long", spots: "#D98E2B", horns: true }],
  ["bear-polar", "Polar Bear", { fur: "#F4FAFF", belly: "#FFFFFF", ear: "round", snout: "oval", snoutColor: "#E5F1FF", cheeks: "#BFE6FF" }],
  ["squirrel", "Nutty Squirrel", { fur: "#D98E5B", belly: "#FFE9CC", ear: "tuft", snout: "oval", tail: "puff", tailColor: "#F0B77E" }],
  ["hedgehog", "Spiky Hedgehog", { fur: "#E0BE93", belly: "#FFEFD6", ear: "round", snout: "long", mane: "#9A7250" }],
  ["raccoon", "Masked Raccoon", { fur: "#A9A9C4", belly: "#E6E6F5", ear: "pointy", snout: "long", spots: "#5A5670", tail: "long", tailColor: "#8C8BA8" }],
  ["deer", "Forest Deer", { fur: "#D9A46B", belly: "#FFE7C8", ear: "pointy", snout: "oval", spots: "#FFF0D2", horns: true }],
];

const FARM: Spec[] = [
  ["cow", "Moo Cow", { fur: "#FFFFFF", belly: "#FFF4F6", ear: "floppy", snout: "pig", spots: "#3B3050", horns: true }],
  ["pig", "Pink Piglet", { fur: "#FFAFC8", belly: "#FFD8E4", ear: "pointy", snout: "pig", cheeks: "#FF89AC", tail: "curl" }],
  ["sheep", "Fluffy Sheep", { fur: "#F6F3FF", belly: "#FFFFFF", ear: "floppy", snout: "oval", fluff: true, mane: "#FFF9EC" }],
  ["horse", "Brown Horse", { fur: "#C98A5B", belly: "#F0CFA8", ear: "pointy", snout: "long", mane: "#7A4E2B", tail: "long" }],
  ["goat", "Little Goat", { fur: "#E9E4F5", belly: "#FFFFFF", ear: "floppy", snout: "long", horns: true }],
  ["donkey", "Sweet Donkey", { fur: "#B7B4CE", belly: "#E6E4F5", ear: "long", snout: "long", mane: "#6C6884" }],
  ["llama", "Curly Llama", { fur: "#FFE3B8", belly: "#FFF4DD", ear: "pointy", snout: "oval", fluff: true, mane: "#FFEFD0" }],
  ["duckling", "Farm Duckling", { fur: "#FFE066", belly: "#FFF3B8", ear: "none", snout: "beak", cheeks: "#FFB4C6" }],
  ["bunny-farm", "Barn Bunny", { fur: "#E4C7A8", belly: "#FBEAD6", ear: "long", snout: "oval", tail: "puff" }],
  ["cat-barn", "Barn Kitten", { fur: "#9AA6C4", belly: "#DDE5F7", ear: "pointy", snout: "none", whiskers: true, tail: "long", cheeks: "#FFB4C6" }],
];

const DINOS: [string, string, DinoOpts][] = [
  ["t-rex", "Mighty T-Rex", { body: "#7ED087", belly: "#D8F3DC", back: "spikes", horns: 1 }],
  ["stego", "Stego Buddy", { body: "#8E7CFF", belly: "#DDD6FF", back: "plates", backColor: "#FFB03A" }],
  ["bronto", "Long Neck", { body: "#5AC8FA", belly: "#CFEFFF", neck: "long", spots: "#2E9BD1" }],
  ["tricera", "Three Horns", { body: "#FF9F68", belly: "#FFE0C7", back: "frill", backColor: "#FFD166", horns: 2 }],
  ["ptero", "Sky Dino", { body: "#FF7FB6", belly: "#FFD6E7", wings: true, neck: "long" }],
  ["raptor", "Fast Raptor", { body: "#FFD166", belly: "#FFF1C4", back: "spikes", backColor: "#F08A3C" }],
  ["ankylo", "Club Tail", { body: "#9CC96B", belly: "#E4F5C9", back: "dome", backColor: "#7A9E4C", spots: "#6E8E44" }],
  ["diplo", "Tall Diplo", { body: "#B49BE0", belly: "#E7DBFF", neck: "long", back: "spikes", backColor: "#8E7CFF" }],
  ["spino", "Sail Dino", { body: "#38C6D9", belly: "#CFF3F8", back: "plates", backColor: "#FF7FB6" }],
  ["baby-dino", "Baby Dino", { body: "#FFB4C6", belly: "#FFE3EC", back: "spikes", backColor: "#FF7FB6", horns: 1, spots: "#FF89AC" }],
];

const CARS: [string, string, Parameters<typeof car>[0]][] = [
  ["red-racer", "Red Racer", { style: "race", body: "#FF5C7A", accent: "#FFD84D" }],
  ["blue-car", "Blue Car", { style: "sedan", body: "#5AC8FA" }],
  ["school-bus", "School Bus", { style: "bus", body: "#FFC94D" }],
  ["fire-truck", "Fire Truck", { style: "fire", body: "#FF5C5C", accent: "#FFE3E3" }],
  ["police-car", "Police Car", { style: "police", body: "#4E7BE8", accent: "#FF5C7A" }],
  ["taxi", "City Taxi", { style: "taxi", body: "#FFD84D" }],
  ["big-truck", "Big Truck", { style: "truck", body: "#7ED087", accent: "#FFB03A" }],
  ["tractor", "Farm Tractor", { style: "tractor", body: "#7ED087", accent: "#FF8A5B" }],
  ["digger", "Yellow Digger", { style: "digger", body: "#FFB03A", accent: "#FFD84D" }],
  ["monster-truck", "Monster Truck", { style: "monster", body: "#8E7CFF" }],
];

const PRINCESSES: [string, string, Parameters<typeof princess>[0]][] = [
  ["rose", "Rose Princess", { dress: "#FF7FB6", dress2: "#FFD1E6", hair: "#FFD166", crown: true, wand: true }],
  ["sky", "Sky Princess", { dress: "#5AC8FA", dress2: "#CFEFFF", hair: "#7A4E2B", style: "long", crown: true }],
  ["mint", "Mint Princess", { dress: "#7ED087", dress2: "#DFF6E1", hair: "#3B3050", style: "bun", crown: true }],
  ["lilac", "Lilac Princess", { dress: "#B49BE0", dress2: "#E7DBFF", hair: "#F0B77E", style: "braid", wand: true }],
  ["sunny", "Sunny Princess", { dress: "#FFD84D", dress2: "#FFF3B8", hair: "#C24B2C", style: "curly", crown: true }],
  ["coral", "Coral Princess", { dress: "#FF8A5B", dress2: "#FFDCCB", hair: "#2E2545", style: "ponytail", wand: true }],
  ["snow", "Snow Princess", { dress: "#EAF4FF", dress2: "#FFFFFF", hair: "#BFE6FF", style: "braid", crown: true }],
  ["berry", "Berry Princess", { dress: "#D94F8C", dress2: "#FFC2DE", hair: "#5A3A2B", style: "long", crown: true, wand: true }],
  ["aqua", "Aqua Princess", { dress: "#38C6D9", dress2: "#CFF3F8", hair: "#FFD166", style: "ponytail", crown: true }],
  ["star", "Star Princess", { dress: "#8E7CFF", dress2: "#DDD6FF", hair: "#FFE9A8", style: "curly", crown: true, wand: true }],
];

const SPACE: [string, string, string, string, string][] = [
  ["rocket", "Rocket Ship", "rocket", "#FF5C7A", "#5AC8FA"],
  ["planet", "Ring Planet", "planet", "#8E7CFF", "#B49BE0"],
  ["star-friend", "Star Friend", "star", "#FFD84D", "#FFB4C6"],
  ["astronaut", "Little Astronaut", "astronaut", "#FF9F68", "#5AC8FA"],
  ["ufo", "Friendly UFO", "ufo", "#7ED087", "#FFD84D"],
  ["moon", "Sleepy Moon", "moon", "#EAF0FF", "#C7D3F5"],
  ["comet", "Zoom Comet", "comet", "#38C6D9", "#FFD166"],
  ["satellite", "Space Robot", "satellite", "#B7C4E8", "#FFB03A"],
  ["sun", "Smiling Sun", "sun", "#FFC94D", "#FF9F68"],
  ["alien", "Green Alien", "alien", "#7ED087", "#FF7FB6"],
];

const SEA: [string, string, string, string, string][] = [
  ["fish", "Rainbow Fish", "fish", "#FF9F68", "#FFD166"],
  ["whale", "Blue Whale", "whale", "#5AC8FA", "#CFEFFF"],
  ["octopus", "Silly Octopus", "octopus", "#FF7FB6", "#FFD1E6"],
  ["crab", "Snappy Crab", "crab", "#FF5C5C", "#FFC2C2"],
  ["seahorse", "Sea Horse", "seahorse", "#FFD166", "#FF9F68"],
  ["turtle", "Sea Turtle", "turtle", "#7ED087", "#4E9D5B"],
  ["starfish", "Star Fish", "starfish", "#FFB03A", "#FFE9A8"],
  ["jellyfish", "Jelly Friend", "jellyfish", "#B49BE0", "#FFD1E6"],
  ["dolphin", "Happy Dolphin", "dolphin", "#38C6D9", "#CFF3F8"],
  ["shell", "Pretty Shell", "shell", "#FFC2DE", "#FFE9F2"],
];

const BIRDS: [string, string, Parameters<typeof bird>[0]][] = [
  ["parrot", "Party Parrot", { body: "#7ED087", wing: "#FFD84D", crest: true, tail: "long", beak: "#FF8A5B" }],
  ["owl", "Wise Owl", { body: "#C98A5B", wing: "#8A5A2B", tail: "short" }],
  ["penguin", "Tiny Penguin", { body: "#5B6180", wing: "#3B3050", tail: "short" }],
  ["duck", "Yellow Duck", { body: "#FFD84D", wing: "#FFB03A", tail: "short" }],
  ["flamingo", "Pink Flamingo", { body: "#FF9FC4", wing: "#FF7FB6", longNeck: true, longLegs: true }],
  ["peacock", "Proud Peacock", { body: "#38C6D9", wing: "#4E7BE8", crest: true, tail: "fan" }],
  ["chick", "Baby Chick", { body: "#FFE066", wing: "#FFD166", tail: "short" }],
  ["eagle", "Sky Eagle", { body: "#8A7A63", wing: "#5B4E3D", tail: "long" }],
  ["swan", "White Swan", { body: "#FFFFFF", wing: "#EDEFFA", longNeck: true, beak: "#FF8A5B" }],
  ["toucan", "Toco Toucan", { body: "#3B3050", wing: "#FFD84D", beak: "#FF8A5B", tail: "short" }],
];

const FLOWERS: [string, string, Parameters<typeof flower>[0]][] = [
  ["daisy", "Daisy", { petal: "#FFFFFF", center: "#FFD84D", count: 10, leaves: 2 }],
  ["sunflower", "Sunflower", { petal: "#FFD84D", center: "#B07C4F", count: 12, shape: "point", face: true }],
  ["tulip", "Tulip Pot", { petal: "#FF5C7A", center: "#FFD84D", count: 6, pot: "#FF9F68" }],
  ["rose-flower", "Rose", { petal: "#FF7FB6", petal2: "#FFC2DE", center: "#FFD1E6", count: 8 }],
  ["lily", "Lily", { petal: "#B49BE0", center: "#FFD84D", count: 6, shape: "point", leaves: 3 }],
  ["hearts-flower", "Heart Flower", { petal: "#FF9FC4", center: "#FFD84D", count: 6, shape: "heart", face: true }],
  ["blue-bell", "Blue Bell", { petal: "#5AC8FA", petal2: "#CFEFFF", center: "#FFFFFF", count: 8, pot: "#B49BE0" }],
  ["orange-bloom", "Orange Bloom", { petal: "#FF9F68", center: "#FFB03A", count: 9, shape: "point" }],
  ["mint-flower", "Mint Flower", { petal: "#7ED087", petal2: "#DFF6E1", center: "#FFD84D", count: 10, face: true }],
  ["rainbow-flower", "Rainbow Flower", { petal: "#FF7FB6", petal2: "#5AC8FA", center: "#FFD84D", count: 12, leaves: 3 }],
];

const FOODS: [string, string, string, string, string][] = [
  ["cupcake", "Sweet Cupcake", "cupcake", "#FFC2DE", "#FF9F68"],
  ["icecream", "Ice Cream", "icecream", "#FF9FC4", "#BFE6FF"],
  ["apple", "Red Apple", "apple", "#FF5C5C", "#7ED087"],
  ["donut", "Yummy Donut", "donut", "#FF7FB6", "#FFD84D"],
  ["pizza", "Pizza Slice", "pizza", "#FF8A5B", "#FF5C5C"],
  ["burger", "Big Burger", "burger", "#C98A5B", "#FFD84D"],
  ["watermelon", "Watermelon", "watermelon", "#FF6B8B", "#7ED087"],
  ["cherry", "Cherries", "cherry", "#FF4D6D", "#7ED087"],
  ["cake", "Birthday Cake", "cake", "#FFD1E6", "#FF9FC4"],
  ["candy", "Lolly Candy", "candy", "#FF7FB6", "#5AC8FA"],
];

let cache: PageArt[] | null = null;

/** Deterministic catalogue: swap for a DB query to scale to 5,000+ pages. */
export function buildCatalog(): PageArt[] {
  if (cache) return cache;
  resetIds();
  const pages: PageArt[] = [];
  buildScenes().forEach((p) => pages.push(p));
  ANIMALS.forEach(([slug, title, o], i) =>
    pages.push(makePage(`animals-${slug}`, title, "animals", "🐾", 1 + (i % 3), critter(o))),
  );
  FARM.forEach(([slug, title, o], i) =>
    pages.push(makePage(`farm-${slug}`, title, "farm", "🌾", 1 + (i % 3), critter(o))),
  );
  DINOS.forEach(([slug, title, o], i) =>
    pages.push(makePage(`dinosaurs-${slug}`, title, "dinosaurs", "🦖", 1 + (i % 3), dino(o))),
  );
  CARS.forEach(([slug, title, o], i) =>
    pages.push(makePage(`cars-${slug}`, title, "cars", "🚙", 1 + (i % 3), car(o))),
  );
  PRINCESSES.forEach(([slug, title, o], i) =>
    pages.push(makePage(`princesses-${slug}`, title, "princesses", "👑", 1 + (i % 3), princess(o))),
  );
  SPACE.forEach(([slug, title, kind, a, b], i) =>
    pages.push(makePage(`space-${slug}`, title, "space", "🌟", 1 + (i % 3), space(kind, a, b))),
  );
  SEA.forEach(([slug, title, kind, a, b], i) =>
    pages.push(makePage(`sea-${slug}`, title, "sea", "🌊", 1 + (i % 3), sea(kind, a, b))),
  );
  BIRDS.forEach(([slug, title, o], i) =>
    pages.push(makePage(`birds-${slug}`, title, "birds", "🕊️", 1 + (i % 3), bird(o))),
  );
  FLOWERS.forEach(([slug, title, o], i) =>
    pages.push(makePage(`flowers-${slug}`, title, "flowers", "🌷", 1 + (i % 3), flower(o))),
  );
  FOODS.forEach(([slug, title, kind, a, b], i) =>
    pages.push(makePage(`food-${slug}`, title, "food", "🍓", 1 + (i % 3), food(kind, a, b))),
  );

  // ---- Freemium: keep a generous free tier, lock the rest as Premium ----
  // Free = first N of each category (scenes get 2 free, others get 3 free).
  const seen: Record<string, number> = {};
  for (const p of pages) {
    const n = seen[p.category] ?? 0;
    const freeQuota = p.category === "scenes" ? 2 : 3;
    p.premium = n >= freeQuota;
    seen[p.category] = n + 1;
  }

  cache = pages;
  return pages;
}

/** true if a page requires the Premium unlock */
export function isPremiumPage(slug: string): boolean {
  return buildCatalog().find((p) => p.slug === slug)?.premium ?? false;
}
