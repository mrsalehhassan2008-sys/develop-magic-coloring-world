export interface Swatch {
  id: string;
  color: string;
  /** special paints render with an svg gradient/pattern */
  special?: "rainbow" | "glitter" | "metal" | "gradient";
}

const hex = (arr: string[]): Swatch[] => arr.map((c) => ({ id: c, color: c }));

export const CLASSIC = hex([
  "#FF3B30", "#FF5C5C", "#FF6B8B", "#FF4D6D", "#D94F8C", "#FF7FB6", "#FF9FC4", "#FFC2DE",
  "#FF8A5B", "#FF9F68", "#FFB03A", "#FFC94D", "#FFD84D", "#FFE066", "#FFF3B8", "#F7E7A1",
  "#B5E048", "#9CC96B", "#7ED087", "#4E9D5B", "#2F7D4F", "#1F6B4A", "#38C6D9", "#5AC8FA",
  "#4E7BE8", "#3457C4", "#2A3E9E", "#8E7CFF", "#B49BE0", "#6A4FBF", "#C98A5B", "#8A5A2B",
  "#5A3A2B", "#E8C08A", "#F0B77E", "#FFE0C4", "#FFF0D8", "#FFFFFF", "#E9ECFF", "#C7D3F5",
  "#9AA6C4", "#6D6A86", "#4C4667", "#2E2545", "#000000", "#7A4E2B", "#C24B2C", "#E24E1B",
  "#00A896", "#02C39A", "#84DCC6", "#B8F2E6", "#FFA69E", "#FF686B", "#84A59D", "#F28482",
  "#F5CAC3", "#F6BD60", "#A0C4FF", "#BDB2FF", "#FFC6FF", "#CAFFBF", "#9BF6FF", "#FDFFB6",
]);

export const PASTEL = hex([
  "#FFD9E8", "#FFE5D0", "#FFF6CC", "#E4F8D6", "#D6F5F0", "#D9E8FF", "#E6DBFF", "#F8DCF0",
  "#FFEFEF", "#EAF7FF", "#F3FFE3", "#FFF0F6", "#E8FFF6", "#FFF9E6", "#F0E6FF", "#DFF6FF",
]);

export const NEON = hex([
  "#FF073A", "#FF6EC7", "#FE01B1", "#BC13FE", "#7B2FFF", "#0FF0FC", "#00FFC6", "#39FF14",
  "#CCFF00", "#FFF700", "#FF9A00", "#FF3F00", "#00B3FF", "#4DFFFF", "#FF00A0", "#B0FF31",
]);

export const METAL: Swatch[] = [
  { id: "gold", color: "#E7B84B", special: "metal" },
  { id: "silver", color: "#C6CEDA", special: "metal" },
  { id: "bronze", color: "#C88450", special: "metal" },
  { id: "rose", color: "#E8A6A6", special: "metal" },
  { id: "steel", color: "#8FA0B8", special: "metal" },
  { id: "emerald", color: "#4CB77F", special: "metal" },
];

export const MAGIC: Swatch[] = [
  { id: "rainbow", color: "#FF5C7A", special: "rainbow" },
  { id: "glitter", color: "#FFD84D", special: "glitter" },
  { id: "sunset", color: "#FF8A5B", special: "gradient" },
  { id: "ocean", color: "#38C6D9", special: "gradient" },
  { id: "candy", color: "#FF7FB6", special: "gradient" },
  { id: "galaxy", color: "#8E7CFF", special: "gradient" },
];

export const PALETTES: { key: string; label: string; emoji: string; swatches: Swatch[] }[] = [
  { key: "classic", label: "Classic", emoji: "🎨", swatches: CLASSIC },
  { key: "pastel", label: "Pastel", emoji: "🍬", swatches: PASTEL },
  { key: "neon", label: "Neon", emoji: "⚡", swatches: NEON },
  { key: "metal", label: "Metallic", emoji: "🥇", swatches: METAL },
  { key: "magic", label: "Magic", emoji: "✨", swatches: MAGIC },
];

/* ---------------- Stickers: 500+ original emoji-styled decorations -------- */

const S = (s: string) => s.split(" ");

export const STICKER_PACKS: { key: string; label: string; items: string[] }[] = [
  { key: "stars", label: "Stars", items: S("⭐ 🌟 ✨ 💫 🌠 ☄️ 🔆 ❇️ ✳️ 🌞 🌝 🌛 🌜 🌙 ⚡ 🔥 💥 🌈 ☀️ 🌤️ ⛅ 🌥️ ☁️ 🌦️ 🌧️ ⛈️ 🌩️ 🌨️ ❄️ ☃️ ⛄ 💧 💦 🌊 🎇 🎆 🪐 🌌 🛸 🌍") },
  { key: "animals", label: "Animals", items: S("🐶 🐱 🐭 🐹 🐰 🦊 🐻 🐼 🐨 🐯 🦁 🐮 🐷 🐸 🐵 🙈 🙉 🙊 🐔 🐧 🐦 🐤 🐣 🐥 🦆 🦅 🦉 🦇 🐺 🐗 🐴 🦄 🐝 🐛 🦋 🐌 🐞 🐜 🦂 🐢 🐍 🦎 🦖 🦕 🐙 🦑 🦐 🦀 🐡 🐠 🐟 🐬 🐳 🐋 🦈 🐊 🐅 🐆 🦓 🦍 🐘 🦏 🐪 🦒 🐁 🐀 🐇 🐿️ 🦔 🐾") },
  { key: "flowers", label: "Flowers", items: S("🌸 💮 🏵️ 🌹 🥀 🌺 🌻 🌼 🌷 🌱 🌲 🌳 🌴 🌵 🌾 🌿 ☘️ 🍀 🍁 🍂 🍃 🪴 🎋 🎍 💐 🪷 🌳 🍄") },
  { key: "space", label: "Space", items: S("🚀 🛸 🛰️ 🌎 🌏 🪐 🌟 🌠 👽 👾 🤖 🌑 🌒 🌓 🌔 🌕 🌖 🌗 🌘 🔭 🧑‍🚀 ⭐ 💫 🌌") },
  { key: "princess", label: "Princess", items: S("👑 💎 💍 🪄 🧚 🧜 🦄 🏰 🌹 💖 💝 💞 💕 💗 💓 💌 🎀 👗 👠 💄 🪞 🕯️ 🫧 🦢") },
  { key: "dinos", label: "Dinosaurs", items: S("🦖 🦕 🥚 🌋 🦴 🌴 🪨 🐉 🐲 🦎 🐊 🦣 🦤") },
  { key: "cars", label: "Cars", items: S("🚗 🚕 🚙 🚌 🚎 🏎️ 🚓 🚑 🚒 🚐 🛻 🚚 🚛 🚜 🛵 🏍️ 🚲 🛴 🚂 🚆 🚊 🚝 🚄 ✈️ 🚁 ⛵ 🚤 🛳️ ⚓ 🚦 🚧 🛞") },
  { key: "food", label: "Food", items: S("🍏 🍎 🍐 🍊 🍋 🍌 🍉 🍇 🍓 🫐 🍈 🍒 🍑 🥭 🍍 🥥 🥝 🍅 🥑 🥦 🥕 🌽 🥔 🍠 🥐 🥖 🍞 🥨 🧀 🥚 🍳 🥞 🧇 🥓 🍔 🍟 🍕 🌭 🥪 🌮 🌯 🥗 🍣 🍤 🍦 🍧 🍨 🍩 🍪 🎂 🍰 🧁 🥧 🍫 🍬 🍭 🍮 🍯 🥤 🧃 🍼") },
  { key: "emoji", label: "Emoji", items: S("😀 😃 😄 😁 😆 😅 🤣 😂 🙂 😉 😊 😇 🥰 😍 🤩 😘 😋 😛 🤪 🤗 🤔 🤭 🥳 😎 🤓 🧐 😺 😸 😹 😻 😼 🙀 🐱‍👤 👍 👏 🙌 🤝 💪 ✌️ 🤟 👋 🫶 💛 💚 💙 💜 🖤 🤍 🤎 ❤️") },
  { key: "letters", label: "Letters", items: S("🅰️ 🅱️ 🆎 🆑 🅾️ 🆘 🆕 🆒 🔠 🔡 🔤 ✏️ 📝 📚 📖 🖍️ 🖌️ 🎨 🧩 🔤") },
  { key: "numbers", label: "Numbers", items: S("0️⃣ 1️⃣ 2️⃣ 3️⃣ 4️⃣ 5️⃣ 6️⃣ 7️⃣ 8️⃣ 9️⃣ 🔟 #️⃣ ➕ ➖ ✖️ ➗ 💯 🔢 🕐 🕑") },
  { key: "party", label: "Party", items: S("🎈 🎉 🎊 🎁 🎀 🍭 🧸 🪅 🪩 🎠 🎡 🎢 🎪 🎭 🎨 🎬 🎤 🎧 🎼 🎵 🎶 🥁 🎹 🎷 🎺 🎸 🪕 🏆 🥇 🥈 🥉 🏅 🎖️ 🔔 🪁 🧿 🎯 🎲 ♟️ 🃏") },
  { key: "frames", label: "Frames", items: S("🖼️ 🪟 🚪 🏠 🏡 🏰 ⛲ 🌁 🎑 🗺️ 📷 📸 🔍 🔎 💡 🕹️ 🎮 ⌛ ⏰ 🧭") },
];

export const ALL_STICKERS = STICKER_PACKS.flatMap((p) => p.items);
