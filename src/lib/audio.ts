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
};

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
export function startMusic() {
  if (musicTimer !== null) return;
  const c = ac();
  if (!c || !musicGain) return;
  const scale = [261.63, 293.66, 329.63, 392.0, 440.0, 523.25, 587.33, 659.25];
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
      osc.type = i ? "sine" : "triangle";
      osc.frequency.value = freq;
      g.gain.setValueAtTime(0.0001, t);
      g.gain.exponentialRampToValueAtTime(i ? 0.05 : 0.09, t + 0.5);
      g.gain.exponentialRampToValueAtTime(0.0001, t + 2.6);
      osc.connect(g);
      g.connect(out);
      osc.start(t);
      osc.stop(t + 2.8);
    });
  };
  step();
  musicTimer = window.setInterval(step, 1900);
}

export function stopMusic() {
  if (musicTimer !== null) {
    window.clearInterval(musicTimer);
    musicTimer = null;
  }
}

export type VoiceType = "teacher-male" | "teacher-female" | "kid-boy" | "kid-girl" | "friendly";

let selectedVoiceType: VoiceType = "friendly";
let selectedVoice: SpeechSynthesisVoice | null = null;

export function setVoiceType(type: VoiceType) {
  selectedVoiceType = type;
  // Try to find a matching voice
  if (typeof window !== "undefined" && window.speechSynthesis) {
    const voices = window.speechSynthesis.getVoices();
    // Try to match by name/type
    if (type === "teacher-female" || type === "kid-girl") {
      selectedVoice = voices.find((v) => v.name.includes("Female") || v.name.includes("Girl") || v.name.includes("Zira") || v.name.includes("Google")) || null;
    } else if (type === "teacher-male" || type === "kid-boy") {
      selectedVoice = voices.find((v) => v.name.includes("Male") || v.name.includes("Boy") || v.name.includes("David") || v.name.includes("Google")) || null;
    } else {
      selectedVoice = voices.find((v) => v.name.includes("Friendly") || v.name.includes("Google")) || null;
    }
  }
}

export function getVoiceType(): VoiceType {
  return selectedVoiceType;
}

export function say(text: string, lang = "en-US") {
  if (!settings.voice || typeof window === "undefined" || !window.speechSynthesis) return;
  try {
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text);
    u.lang = lang;
    
    // Set voice if available
    if (selectedVoice) {
      u.voice = selectedVoice;
    }
    
    // Slower rate for children to comprehend - vary by language
    const isArabic = lang.startsWith("ar");
    const isFrench = lang.startsWith("fr");
    const isSpanish = lang.startsWith("es");
    
    // Base rate - slower for better comprehension
    u.rate = isArabic ? 0.55 : 0.60;
    
    // Adjust pitch and rate based on voice type
    switch (selectedVoiceType) {
      case "teacher-male":
        u.pitch = isArabic ? 0.75 : 0.85;
        u.rate = isArabic ? 0.60 : 0.70;
        break;
      case "teacher-female":
        u.pitch = isArabic ? 1.05 : 1.15;
        u.rate = isArabic ? 0.65 : 0.68;
        break;
      case "kid-boy":
        u.pitch = isArabic ? 1.35 : 1.45;
        u.rate = isArabic ? 0.70 : 0.75;
        break;
      case "kid-girl":
        u.pitch = isArabic ? 1.45 : 1.55;
        u.rate = isArabic ? 0.70 : 0.75;
        break;
      case "friendly":
      default:
        u.pitch = isArabic ? 1.15 : 1.25;
        u.rate = isArabic ? 0.60 : 0.65;
        break;
    }
    
    // Language-specific adjustments
    if (isFrench) u.rate *= 0.95;
    if (isSpanish) u.rate *= 0.95;
    
    window.speechSynthesis.speak(u);
  } catch {
    /* ignore */
  }
}

// Load voices when available
if (typeof window !== "undefined" && window.speechSynthesis) {
  window.speechSynthesis.onvoiceschanged = () => {
    if (selectedVoiceType) setVoiceType(selectedVoiceType);
  };
}

export const PRAISE = ["Great job!", "Wonderful!", "Amazing!", "So pretty!", "You did it!", "Fantastic!", "Beautiful!"];
export const randomPraise = () => PRAISE[Math.floor(Math.random() * PRAISE.length)];

// Interactive companion phrases
export const COMPANION_PHRASES = {
  greeting: [
    "Hi {name}! Ready to create something beautiful?",
    "Hello {name}! I'm so happy to see you!",
    "Welcome back {name}! Let's have fun!",
    "Hey {name}! What shall we color today?",
  ],
  encouragement: [
    "You're doing great {name}!",
    "I love how you're coloring {name}!",
    "Keep going {name}, it looks amazing!",
    "Wow {name}, you're so creative!",
    "Beautiful choices {name}!",
  ],
  completion: [
    "You finished {name}! I'm so proud of you!",
    "Look at your masterpiece {name}!",
    "Amazing work {name}! You're an artist!",
    "Yay {name}! That's absolutely beautiful!",
  ],
  reminder: [
    "Remember to take breaks {name}!",
    "Stretch your fingers {name}!",
    "Blink your eyes {name}!",
  ],
  question: [
    "What's your favorite color {name}?",
    "Do you like drawing animals {name}?",
    "Should we try a new picture {name}?",
    "Are you having fun {name}?",
  ],
  morning: [
    "Good morning {name}! Ready for a colorful day?",
    "Morning {name}! Let's start with some art!",
  ],
  evening: [
    "Good evening {name}! Time for some relaxing coloring!",
    "Hi {name}! Ready to unwind with art?",
  ],
};

export function getCompanionPhrase(
  type: keyof typeof COMPANION_PHRASES,
  name: string,
  lang: string
): string {
  const phrases = COMPANION_PHRASES[type];
  const phrase = phrases[Math.floor(Math.random() * phrases.length)];
  return phrase.replace(/{name}/g, name);
}

let lastSpokeAt = 0;
const SPEAK_COOLDOWN = 8000; // Minimum 8 seconds between auto-phrases

export function canCompanionSpeak(): boolean {
  return Date.now() - lastSpokeAt > SPEAK_COOLDOWN;
}

export function companionSpeak(
  type: keyof typeof COMPANION_PHRASES,
  name: string,
  lang: string,
  force: boolean = false
) {
  if (!canCompanionSpeak() && !force) return false;
  const phrase = getCompanionPhrase(type, name, lang);
  say(phrase, lang);
  lastSpokeAt = Date.now();
  return true;
}

export function resetCompanionCooldown() {
  lastSpokeAt = 0;
}
