"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { say, sfx } from "@/lib/audio";
import { BuddyEvent, buddyLine } from "@/lib/buddy";
import { fx } from "@/components/FxLayer";
import { critter } from "@/lib/art/builders";
import { kidShapes } from "@/lib/art/kid";
import { ShapeEl } from "@/components/Studio";
import { accessoryShapes } from "@/components/AvatarDesigner";
import type { BuddyCustom } from "@/lib/progress";

interface BuddyState {
  name: string;
  lang: string;
  face: string;
  enabled: boolean;
  voice: boolean;
  custom?: BuddyCustom | null;
  pos?: { x: number; y: number } | null;
  onPos?: (p: { x: number; y: number }) => void;
}

type Speak = (event: BuddyEvent) => void;
type SpeakText = (text: string, spoken?: string) => void;

/** module-level bridge so any screen can make the buddy talk */
const bridge: { speak?: Speak; speakText?: SpeakText } = {};

export function buddySpeak(event: BuddyEvent) {
  bridge.speak?.(event);
}
export function buddySay(text: string, spoken?: string) {
  bridge.speakText?.(text, spoken);
}

export default function Buddy({ name, lang, face, enabled, voice, custom, pos, onPos }: BuddyState) {
  const [bubble, setBubble] = useState<string | null>(null);
  const [wave, setWave] = useState(false);
  const [talking, setTalking] = useState(false);
  const [p, setP] = useState<{ x: number; y: number }>(() =>
    pos ?? { x: 12, y: typeof window !== "undefined" ? window.innerHeight - 110 : 500 },
  );
  const [drag, setDrag] = useState<{ dx: number; dy: number; moved: boolean } | null>(null);
  const hideTimer = useRef<number | null>(null);
  const idleTimer = useRef<number | null>(null);
  const lastRef = useRef({ name, lang, face, voice });
  useEffect(() => {
    lastRef.current = { name, lang, face, voice };
  }, [name, lang, face, voice]);

  const show = useCallback((text: string, spoken?: string) => {
    if (hideTimer.current) window.clearTimeout(hideTimer.current);
    setBubble(text);
    setWave(true);
    setTalking(true);
    window.setTimeout(() => setWave(false), 900);
    if (lastRef.current.voice) say(spoken ?? text, lastRef.current.lang);
    const dur = Math.min(8000, 2600 + text.length * 55);
    window.setTimeout(() => setTalking(false), Math.min(dur, 2600));
    hideTimer.current = window.setTimeout(() => setBubble(null), dur);
  }, []);

  const speak: Speak = useCallback(
    (event) => {
      const line = buddyLine(event, lastRef.current.name, lastRef.current.lang);
      show(line);
    },
    [show],
  );

  const speakText: SpeakText = useCallback((text, spoken) => show(text, spoken), [show]);

  // register the bridge
  useEffect(() => {
    bridge.speak = speak;
    bridge.speakText = speakText;
    return () => {
      bridge.speak = undefined;
      bridge.speakText = undefined;
    };
  }, [speak, speakText]);

  // idle nudges: if the child is quiet, the buddy gently chats
  useEffect(() => {
    if (!enabled) return;
    const reset = () => {
      if (idleTimer.current) window.clearTimeout(idleTimer.current);
      idleTimer.current = window.setTimeout(() => {
        speak(Math.random() < 0.5 ? "idle" : "encourage");
      }, 22000);
    };
    const events: (keyof WindowEventMap)[] = ["pointerdown", "keydown"];
    events.forEach((e) => window.addEventListener(e, reset));
    reset();
    return () => {
      events.forEach((e) => window.removeEventListener(e, reset));
      if (idleTimer.current) window.clearTimeout(idleTimer.current);
    };
  }, [enabled, speak]);

  if (!enabled) return null;

  return (
    <div className="pointer-events-none fixed z-[70] flex items-end gap-2" style={{ left: p.x, top: p.y }}>
      <button
        aria-label="Talk to buddy (drag to move)"
        onPointerDown={(e) => {
          (e.currentTarget as Element).setPointerCapture?.(e.pointerId);
          setDrag({ dx: e.clientX - p.x, dy: e.clientY - p.y, moved: false });
        }}
        onPointerMove={(e) => {
          if (!drag) return;
          const nx = Math.max(4, Math.min(window.innerWidth - 76, e.clientX - drag.dx));
          const ny = Math.max(4, Math.min(window.innerHeight - 90, e.clientY - drag.dy));
          const moved = drag.moved || Math.hypot(nx - p.x, ny - p.y) > 4;
          setDrag({ ...drag, moved });
          setP({ x: nx, y: ny });
        }}
        onPointerUp={(e) => {
          const wasDrag = drag?.moved;
          setDrag(null);
          if (wasDrag) {
            onPos?.(p);
            return;
          }
          sfx.tap();
          fx.burst(e.clientX, e.clientY, 12, ["#FFD84D", "#FF7FB6", "#8E7CFF"], 220);
          speak(Math.random() < 0.5 ? "encourage" : "tapHint");
        }}
        className={`pointer-events-auto grid h-16 w-16 shrink-0 cursor-grab touch-none place-items-center rounded-full bg-gradient-to-b from-white to-[#FFE9F4] text-4xl shadow-[0_10px_24px_rgba(142,124,255,.4)] ring-4 ring-white transition active:scale-90 sm:h-20 sm:w-20 sm:text-5xl ${
          wave ? "animate-[buddyWave_.9s_ease-in-out]" : talking ? "animate-[buddyTalk_.5s_ease-in-out_infinite]" : "animate-[buddyIdle_3s_ease-in-out_infinite]"
        }`}
      >
        {custom ? (
          <svg viewBox="90 40 220 220" className="h-full w-full rounded-full">
            {(custom.kind === "boy" || custom.kind === "girl"
              ? [
                  ...kidShapes({ skin: custom.skin ?? "#FFE0C4", hair: custom.hair ?? "#5A3A2B", hairStyle: custom.hairStyle ?? "short", shirt: custom.shirt ?? "#FF5C7A", cheeks: custom.cheeks, kind: custom.kind }),
                  ...accessoryShapes(custom.accessory),
                ]
              : [
                  ...critter({ fur: custom.fur, belly: custom.belly, ear: custom.ear, snout: "oval", cheeks: custom.cheeks ? "#FFB4C6" : undefined }),
                  ...accessoryShapes(custom.accessory),
                ]
            ).map((s) => (
              <ShapeEl key={s.id} s={s} fill={s.c} />
            ))}
          </svg>
        ) : (
          <span>{face}</span>
        )}
      </button>

      {bubble && (
        <div className="pointer-events-none relative mb-4 max-w-[62vw] rounded-3xl rounded-bl-md bg-white px-4 py-2.5 text-sm font-black text-[#4B3B6E] shadow-xl sm:max-w-xs sm:text-base pop-in">
          {bubble}
          <span className="absolute -bottom-2 left-3 h-4 w-4 rotate-45 rounded-sm bg-white" />
        </div>
      )}
    </div>
  );
}
