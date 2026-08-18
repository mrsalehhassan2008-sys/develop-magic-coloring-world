"use client";

type Ctx = AudioContext & { __music?: boolean };

let ctx: Ctx | null = null;
let master: GainNode | null = null;
let musicGain: GainNode | null = null;
let musicTimer: number | null = null;

export const settings = {
  sound: true,
  music: true,
  voice: true,
  /** parent-controlled speech speed (0.6 very slow .. 1 normal) */
  voiceRate: 0.85,
};

export function setVoiceRate(r: number) {
  settings.voiceRate = Math.max(0.5, Math.min(1, r));
}

function ac(): Ctx | null {
  if (typeof window === "undefined") return null;
  if (!ctx) {
    const AC = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AC) return null;
    ctx = new AC() as Ctx;
    master = ctx.createGain();
    master.gain.value = 0.35;
    master.connect(ctx.destination);
    musicGain = ctx.createGain();
    musicGain.gain.value = 0.12;
    musicGain.connect(master);
  }
  if (ctx.state === "suspended") void ctx.resume();
  return ctx;
}

export function setAudioSetting(key: "sound" | "music" | "voice", value: boolean) {
  settings[key] = value;
}

export function unlockAudio() {
  ac();
}

type Wave = OscillatorType;

function blip(freq: number, dur: number, type: Wave = "sine", vol = 0.5, delay = 0, slideTo?: number) {
  if (!settings.sound) return;
  const c = ac();
  if (!c || !master) return;
  const t = c.currentTime + delay;
  const osc = c.createOscillator();
  const g = c.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, t);
  if (slideTo) osc.frequency.exponentialRampToValueAtTime(Math.max(40, slideTo), t + dur);
  g.gain.setValueAtTime(0.0001, t);
  g.gain.exponentialRampToValueAtTime(vol, t + 0.012);
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  osc.connect(g);
  g.connect(master);
  osc.start(t);
  osc.stop(t + dur + 0.05);
}

function noise(dur: number, vol = 0.3, hp = 800) {
  if (!settings.sound) return;
  const c = ac();
  if (!c || !master) return;
  const len = Math.floor(c.sampleRate * dur);
  const buf = c.createBuffer(1, len, c.sampleRate);
  const data = buf.getChannelData(0);
  for (let i = 0; i < len; i++) data[i] = (Math.random() * 2 - 1) * (1 - i / len);
  const src = c.createBufferSource();
  src.buffer = buf;
  const f = c.createBiquadFilter();
  f.type = "highpass";
  f.frequency.value = hp;
  const g = c.createGain();
  g.gain.value = vol;
  src.connect(f);
  f.connect(g);
  g.connect(master);
  src.start();
}

export const sfx = {
  tap: () => blip(660, 0.08, "triangle", 0.35),
  fill: () => {
    blip(520, 0.16, "sine", 0.4, 0, 880);
    blip(780, 0.14, "triangle", 0.2, 0.03);
  },
  brush: () => noise(0.06, 0.06, 2400),
  pop: (n = 0) => {
    blip(420 + n * 40, 0.12, "sine", 0.5, 0, 900 + n * 60);
    noise(0.08, 0.16, 1400);
  },
  wrong: () => blip(200, 0.22, "sawtooth", 0.25, 0, 110),
  star: () => [0, 0.07, 0.14].forEach((d, i) => blip(880 * Math.pow(1.26, i), 0.18, "triangle", 0.32, d)),
  reward: () => [523, 659, 784, 1046].forEach((f, i) => blip(f, 0.3, "triangle", 0.35, i * 0.09)),
  celebrate: () => {
    [523, 659, 784, 1046, 1318].forEach((f, i) => blip(f, 0.42, "sine", 0.32, i * 0.08));
    noise(0.5, 0.14, 900);
  },
  whoosh: () => noise(0.24, 0.12, 500),
  undo: () => blip(400, 0.1, "square", 0.2, 0, 260),
};

/** soft, non repetitive lullaby pad – random walk over a pentatonic scale */
export const MUSIC_TRACKS = [
  { key: "lullaby", label: "Lullaby", emoji: "🌙" },
  { key: "happy", label: "Happy", emoji: "☀️" },
  { key: "dreamy", label: "Dreamy", emoji: "✨" },
  { key: "waltz", label: "Waltz", emoji: "💃" },
  { key: "adventure", label: "Adventure", emoji: "🗺️" },
] as const;

const TRACK_SCALES: Record<string, { scale: number[]; interval: number; type: OscillatorType; vol: number }> = {
  lullaby: { scale: [261.63, 293.66, 329.63, 392.0, 440.0, 523.25, 587.33, 659.25], interval: 1900, type: "triangle", vol: 0.09 },
  happy: { scale: [329.63, 392.0, 440.0, 493.88, 587.33, 659.25, 783.99, 880.0], interval: 1300, type: "sine", vol: 0.08 },
  dreamy: { scale: [220.0, 261.63, 329.63, 349.23, 440.0, 523.25, 587.33, 698.46], interval: 2400, type: "sine", vol: 0.07 },
  waltz: { scale: [293.66, 349.23, 440.0, 523.25, 587.33, 698.46, 880.0, 1046.5], interval: 1600, type: "triangle", vol: 0.08 },
  adventure: { scale: [196.0, 246.94, 293.66, 392.0, 440.0, 493.88, 587.33, 783.99], interval: 1200, type: "sawtooth", vol: 0.05 },
};

let currentTrack = "lullaby";
export function setMusicTrack(key: string) {
  if (currentTrack === key) return;
  currentTrack = key;
  if (musicTimer !== null) {
    stopMusic();
    startMusic();
  }
}

export function startMusic() {
  if (musicTimer !== null) return;
  const c = ac();
  if (!c || !musicGain) return;
  const cfg = TRACK_SCALES[currentTrack] ?? TRACK_SCALES.lullaby;
  const scale = cfg.scale;
  let idx = 2;
  const step = () => {
    if (!settings.music) return;
    const cc = ac();
    const out = musicGain;
    if (!cc || !out) return;
    idx = Math.max(0, Math.min(scale.length - 1, idx + (Math.floor(Math.random() * 3) - 1)));
    const f = scale[idx];
    const t = cc.currentTime;
    [f, f * 1.5].forEach((freq, i) => {
      const osc = cc.createOscillator();
      const g = cc.createGain();
      osc.type = i ? "sine" : cfg.type;
      osc.frequency.value = freq;
      g.gain.setValueAtTime(0.0001, t);
      g.gain.exponentialRampToValueAtTime(i ? cfg.vol * 0.55 : cfg.vol, t + 0.5);
      g.gain.exponentialRampToValueAtTime(0.0001, t + 2.6);
      osc.connect(g);
      g.connect(out);
      osc.start(t);
      osc.stop(t + 2.8);
    });
  };
  step();
  musicTimer = window.setInterval(step, cfg.interval);
}

export function stopMusic() {
  if (musicTimer !== null) {
    window.clearInterval(musicTimer);
    musicTimer = null;
  }
}

/* ---------------------- Voice characters ------------------------------- */

export type VoiceId = "teacher_m" | "teacher_f" | "boy" | "girl";

export interface VoiceChar {
  id: VoiceId;
  label: string;
  emoji: string;
  /** slower for kids so they can follow every word */
  rate: number;
  pitch: number;
  gender: "male" | "female";
  /** prefer a young sounding voice when available */
  young: boolean;
}

export const VOICES: VoiceChar[] = [
  { id: "teacher_f", label: "Ms. Teacher", emoji: "👩‍🏫", rate: 0.72, pitch: 1.1, gender: "female", young: false },
  { id: "teacher_m", label: "Mr. Teacher", emoji: "👨‍🏫", rate: 0.68, pitch: 0.8, gender: "male", young: false },
  { id: "girl", label: "Girl", emoji: "👧", rate: 0.82, pitch: 1.8, gender: "female", young: true },
  { id: "boy", label: "Boy", emoji: "👦", rate: 0.8, pitch: 1.45, gender: "male", young: true },
];

export const voicePref = { id: "teacher_f" as VoiceId };
export function setVoiceCharacter(id: VoiceId) {
  voicePref.id = id;
}

let systemVoices: SpeechSynthesisVoice[] = [];
function loadSystemVoices() {
  if (typeof window === "undefined" || !window.speechSynthesis) return;
  systemVoices = window.speechSynthesis.getVoices();
}
if (typeof window !== "undefined" && window.speechSynthesis) {
  loadSystemVoices();
  window.speechSynthesis.onvoiceschanged = loadSystemVoices;
}

/** how many distinct system voices are installed – used to warn the parent */
export function availableVoiceCount(lang?: string) {
  if (!systemVoices.length) loadSystemVoices();
  if (!lang) return systemVoices.length;
  const base = lang.split("-")[0].toLowerCase();
  return systemVoices.filter((v) => v.lang.toLowerCase().startsWith(base)).length;
}

const FEMALE_HINTS = ["female", "woman", "girl", "samantha", "victoria", "zira", "hoda", "amelie", "amélie", "anna", "google uk english female", "karen", "tessa", "fiona", "moira", "paulina", "milena", "alice", "ellen", "luciana", "yelda"];
const MALE_HINTS = ["male", "man", "boy", "daniel", "david", "fred", "alex", "google uk english male", "rishi", "diego", "jorge", "juan", "thomas", "yannick", "maged", "carlos", "luca"];

/** score a voice for a given character so each character gets a DIFFERENT voice */
function pickSystemVoice(char: VoiceChar, lang: string, avoid?: SpeechSynthesisVoice): SpeechSynthesisVoice | undefined {
  if (!systemVoices.length) loadSystemVoices();
  if (!systemVoices.length) return undefined;
  const base = lang.split("-")[0].toLowerCase();
  const sameLang = systemVoices.filter((v) => v.lang.toLowerCase().startsWith(base));
  const pool = sameLang.length ? sameLang : systemVoices;
  const wanted = char.gender === "female" ? FEMALE_HINTS : MALE_HINTS;
  const wrong = char.gender === "female" ? MALE_HINTS : FEMALE_HINTS;

  const scored = pool
    .map((v) => {
      const name = v.name.toLowerCase();
      let score = 0;
      if (wanted.some((h) => name.includes(h))) score += 6;
      if (wrong.some((h) => name.includes(h))) score -= 5;
      if (v.lang.toLowerCase() === lang.toLowerCase()) score += 2;
      if (avoid && v.name === avoid.name) score -= 3; // prefer a distinct voice
      return { v, score };
    })
    .sort((a, b) => b.score - a.score);

  return scored[0]?.v;
}

/** distinct voice per character within the currently installed set */
function voiceForChar(char: VoiceChar, lang: string): SpeechSynthesisVoice | undefined {
  // give teacher/kid pairs a chance at different physical voices
  const primary = pickSystemVoice(char, lang);
  if (char.young && primary) {
    const alt = pickSystemVoice(char, lang, primary);
    return alt ?? primary;
  }
  return primary;
}

export function say(text: string, lang = "en-US", voiceId?: VoiceId) {
  if (!settings.voice || typeof window === "undefined" || !window.speechSynthesis) return;
  try {
    window.speechSynthesis.cancel();
    const char = VOICES.find((v) => v.id === (voiceId ?? voicePref.id)) ?? VOICES[0];
    const u = new SpeechSynthesisUtterance(text);
    u.lang = lang;
    u.rate = Math.min(1, char.rate * settings.voiceRate); // slow & clear for children
    u.pitch = char.pitch; // distinct pitch per character (works even with 1 system voice)
    u.volume = 1;
    const sysVoice = voiceForChar(char, lang);
    if (sysVoice) u.voice = sysVoice;
    window.speechSynthesis.speak(u);
  } catch {
    /* ignore */
  }
}

/** speak each word with a tiny gap so toddlers hear every syllable */
export function saySlow(text: string, lang = "en-US", voiceId?: VoiceId) {
  if (!settings.voice || typeof window === "undefined" || !window.speechSynthesis) return;
  const words = text.split(/\s+/).filter(Boolean);
  if (words.length <= 1) return say(text, lang, voiceId);
  window.speechSynthesis.cancel();
  const char = VOICES.find((v) => v.id === (voiceId ?? voicePref.id)) ?? VOICES[0];
  const sysVoice = voiceForChar(char, lang);
  words.forEach((w, i) => {
    const u = new SpeechSynthesisUtterance(w);
    u.lang = lang;
    u.rate = Math.min(1, char.rate * settings.voiceRate);
    u.pitch = char.pitch;
    if (sysVoice) u.voice = sysVoice;
    // small breathing gap between words
    window.setTimeout(() => window.speechSynthesis.speak(u), i * 60);
  });
}

/** localized praise – so language choice is audible even with one voice */
const PRAISE_L10N: Record<string, string[]> = {
  en: ["Great job!", "Wonderful!", "Amazing!", "So pretty!", "You did it!", "Fantastic!", "Beautiful!"],
  ar: ["أحسنت!", "رائع!", "مذهل!", "جميل جدا!", "لقد نجحت!", "ممتاز!", "عمل رائع!"],
  fr: ["Bravo!", "Magnifique!", "Incroyable!", "Très joli!", "Tu as réussi!", "Fantastique!", "Superbe!"],
  de: ["Gut gemacht!", "Wunderbar!", "Fantastisch!", "Sehr schön!", "Du hast es geschafft!", "Toll!", "Wunderschön!"],
  es: ["¡Buen trabajo!", "¡Maravilloso!", "¡Increíble!", "¡Muy bonito!", "¡Lo lograste!", "¡Fantástico!", "¡Precioso!"],
  it: ["Bravo!", "Meraviglioso!", "Incredibile!", "Molto bello!", "Ce l'hai fatta!", "Fantastico!", "Bellissimo!"],
  tr: ["Aferin!", "Harika!", "İnanılmaz!", "Çok güzel!", "Başardın!", "Muhteşem!", "Çok şık!"],
  ru: ["Молодец!", "Замечательно!", "Потрясающе!", "Очень красиво!", "У тебя получилось!", "Фантастика!", "Прекрасно!"],
  pt: ["Muito bem!", "Maravilhoso!", "Incrível!", "Muito bonito!", "Você conseguiu!", "Fantástico!", "Lindo!"],
};

export const PRAISE = PRAISE_L10N.en;

export function randomPraise(lang = "en-US") {
  const base = lang.split("-")[0].toLowerCase();
  const list = PRAISE_L10N[base] ?? PRAISE_L10N.en;
  return list[Math.floor(Math.random() * list.length)];
}

/** localized welcome/instructions */
const PHRASES: Record<string, Record<string, string>> = {
  welcome: {
    en: "Welcome to Magic Coloring World!",
    ar: "أهلا بك في عالم التلوين السحري!",
    fr: "Bienvenue dans le monde magique du coloriage!",
    de: "Willkommen in der magischen Malwelt!",
    es: "¡Bienvenido al mundo mágico para colorear!",
    it: "Benvenuto nel mondo magico dei colori!",
    tr: "Sihirli Boyama Dünyasına hoş geldin!",
    ru: "Добро пожаловать в волшебный мир раскрасок!",
    pt: "Bem-vindo ao mundo mágico de colorir!",
  },
  hello: {
    en: "Hello! Let us color together!",
    ar: "مرحبا! هيا نلون معا!",
    fr: "Bonjour! Colorions ensemble!",
    de: "Hallo! Lass uns zusammen malen!",
    es: "¡Hola! ¡Vamos a colorear juntos!",
    it: "Ciao! Coloriamo insieme!",
    tr: "Merhaba! Hadi birlikte boyayalım!",
    ru: "Привет! Давай раскрашивать вместе!",
    pt: "Olá! Vamos colorir juntos!",
  },
};

export function phrase(key: keyof typeof PHRASES, lang = "en-US") {
  const base = lang.split("-")[0].toLowerCase();
  return PHRASES[key][base] ?? PHRASES[key].en;
}
