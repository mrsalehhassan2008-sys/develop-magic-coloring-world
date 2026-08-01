"use client";

import { useEffect, useRef } from "react";

interface P {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  max: number;
  size: number;
  color: string;
  shape: "dot" | "square" | "star" | "ring";
  spin: number;
  rot: number;
  grav: number;
  text?: string;
}

const parts: P[] = [];
const state = { shake: 0, shakeMax: 0 };

const CANDY = ["#FF5C7A", "#FFB03A", "#FFD84D", "#7ED087", "#5AC8FA", "#8E7CFF", "#FF7FB6", "#38C6D9"];

function push(p: Partial<P> & { x: number; y: number }) {
  if (parts.length > 900) parts.splice(0, 200);
  parts.push({
    vx: 0,
    vy: 0,
    life: 1,
    max: 1,
    size: 8,
    color: CANDY[(Math.random() * CANDY.length) | 0],
    shape: "dot",
    spin: (Math.random() - 0.5) * 0.3,
    rot: Math.random() * 6.28,
    grav: 900,
    ...p,
  } as P);
}

export const fx = {
  /** small pop of particles at screen coords */
  burst(x: number, y: number, count = 18, colors?: string[], power = 340) {
    for (let i = 0; i < count; i++) {
      const a = Math.random() * Math.PI * 2;
      const sp = power * (0.35 + Math.random() * 0.75);
      push({
        x,
        y,
        vx: Math.cos(a) * sp,
        vy: Math.sin(a) * sp,
        size: 5 + Math.random() * 9,
        color: colors ? colors[(Math.random() * colors.length) | 0] : undefined,
        shape: Math.random() < 0.3 ? "star" : Math.random() < 0.5 ? "square" : "dot",
        max: 0.6 + Math.random() * 0.5,
        life: 0.6 + Math.random() * 0.5,
      });
    }
  },
  ring(x: number, y: number, color = "#FFFFFF") {
    push({ x, y, size: 10, color, shape: "ring", grav: 0, life: 0.45, max: 0.45, vx: 0, vy: 0 });
  },
  confetti(count = 120) {
    const w = typeof window !== "undefined" ? window.innerWidth : 800;
    for (let i = 0; i < count; i++) {
      push({
        x: Math.random() * w,
        y: -20 - Math.random() * 200,
        vx: (Math.random() - 0.5) * 160,
        vy: 120 + Math.random() * 260,
        size: 8 + Math.random() * 12,
        shape: Math.random() < 0.35 ? "star" : "square",
        grav: 260,
        life: 2.6 + Math.random() * 1.4,
        max: 4,
      });
    }
  },
  fireworks(x: number, y: number) {
    const c = CANDY[(Math.random() * CANDY.length) | 0];
    fx.ring(x, y, c);
    fx.burst(x, y, 46, [c, "#FFFFFF", "#FFD84D"], 520);
  },
  float(x: number, y: number, text: string, color = "#FFFFFF") {
    push({ x, y, vx: 0, vy: -120, grav: -40, size: 26, color, life: 0.95, max: 0.95, shape: "dot", text });
  },
  shake(amount = 10) {
    state.shake = Math.max(state.shake, amount);
    state.shakeMax = Math.max(state.shakeMax, amount);
  },
};

export default function FxLayer() {
  const ref = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    let raf = 0;
    let last = performance.now();
    const dpr = Math.min(2, window.devicePixelRatio || 1);

    const resize = () => {
      canvas.width = window.innerWidth * dpr;
      canvas.height = window.innerHeight * dpr;
      canvas.style.width = `${window.innerWidth}px`;
      canvas.style.height = `${window.innerHeight}px`;
    };
    resize();
    window.addEventListener("resize", resize);

    const shell = document.getElementById("shake-root");

    const drawStar = (x: number, y: number, r: number) => {
      ctx.beginPath();
      for (let i = 0; i < 10; i++) {
        const rr = i % 2 ? r * 0.45 : r;
        const a = (i / 10) * Math.PI * 2 - Math.PI / 2;
        const px = x + Math.cos(a) * rr;
        const py = y + Math.sin(a) * rr;
        if (i === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
      }
      ctx.closePath();
      ctx.fill();
    };

    const loop = (now: number) => {
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);

      for (let i = parts.length - 1; i >= 0; i--) {
        const p = parts[i];
        p.life -= dt;
        if (p.life <= 0) {
          parts.splice(i, 1);
          continue;
        }
        p.vy += p.grav * dt;
        p.vx *= 0.99;
        p.x += p.vx * dt;
        p.y += p.vy * dt;
        p.rot += p.spin;
        const a = Math.max(0, Math.min(1, p.life / p.max));
        ctx.globalAlpha = a;
        ctx.fillStyle = p.color;
        if (p.text) {
          ctx.font = `900 ${p.size}px system-ui, sans-serif`;
          ctx.textAlign = "center";
          ctx.lineWidth = 5;
          ctx.strokeStyle = "rgba(46,37,69,0.65)";
          ctx.strokeText(p.text, p.x, p.y);
          ctx.fillText(p.text, p.x, p.y);
        } else if (p.shape === "ring") {
          const r = (1 - a) * 90 + 10;
          ctx.strokeStyle = p.color;
          ctx.lineWidth = 7 * a + 1;
          ctx.beginPath();
          ctx.arc(p.x, p.y, r, 0, Math.PI * 2);
          ctx.stroke();
        } else if (p.shape === "star") {
          drawStar(p.x, p.y, p.size);
        } else if (p.shape === "square") {
          ctx.save();
          ctx.translate(p.x, p.y);
          ctx.rotate(p.rot);
          ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size * 0.7);
          ctx.restore();
        } else {
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size / 2, 0, Math.PI * 2);
          ctx.fill();
        }
      }
      ctx.globalAlpha = 1;

      if (shell) {
        if (state.shake > 0.2) {
          state.shake *= Math.pow(0.0016, dt);
          const s = state.shake;
          shell.style.transform = `translate3d(${(Math.random() - 0.5) * s}px, ${(Math.random() - 0.5) * s}px, 0) rotate(${(Math.random() - 0.5) * s * 0.06}deg)`;
        } else if (state.shake !== 0) {
          state.shake = 0;
          shell.style.transform = "";
        }
      }
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return <canvas ref={ref} className="pointer-events-none fixed inset-0 z-[80]" aria-hidden />;
}
