import Link from "next/link";

export const metadata = {
  title: "About — Magic Coloring World",
  description: "The story behind Magic Coloring World: a safe, original, ad-free creative playground for children aged 3–8.",
};

export default function AboutPage() {
  return (
    <main className="mx-auto max-w-3xl px-6 py-14 text-[#2D3748]">
      <Link href="/" className="text-sm font-black text-[#8E7CFF]">← Home</Link>
      <h1 className="mt-4 text-4xl font-black text-[#3B2E5A]">About Magic Coloring World</h1>

      <section className="mt-8 space-y-4 text-base font-medium leading-relaxed text-[#4B3B6E]">
        <p>
          Magic Coloring World began with a simple frustration: most kids&apos; coloring apps are full of ads,
          pop-ups and recycled copyrighted characters. We wanted to build the app we would give our own children —
          beautiful, calm, original and genuinely educational.
        </p>
        <p>
          Every single picture, sound and character in the game is <b>original</b>. The artwork is drawn by a
          parametric vector engine built for this project, the music is generated live, and the voices use the
          device&apos;s own speech system. Nothing is copied from anyone.
        </p>
      </section>

      <h2 className="mt-10 text-2xl font-black text-[#3B2E5A]">Our principles</h2>
      <ul className="mt-4 grid gap-3 text-sm font-bold text-[#4B3B6E] sm:grid-cols-2">
        {[
          ["🎨", "Creativity first — no wrong answers, no pressure, no timers."],
          ["🔒", "Privacy by design — we collect no personal data from children."],
          ["🚫", "No ads, no dark patterns, no nagging to buy."],
          ["👨👩‍", "Parents stay in control with a real parental gate."],
          ["🌍", "For every family — 9 languages and accessible design."],
          ["📴", "Works offline, gentle on battery and old devices."],
        ].map(([e, t]) => (
          <li key={t} className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-[#FFE1EF]">{e} {t}</li>
        ))}
      </ul>

      <div className="mt-10 rounded-3xl bg-gradient-to-r from-[#FF6B9D] to-[#FFB03A] p-8 text-center text-white">
        <h3 className="text-2xl font-black">See it for yourself</h3>
        <Link href="/play" className="mt-4 inline-block rounded-full bg-white px-8 py-3 font-black text-[#FF4D94] active:scale-95">▶ Play free</Link>
      </div>
    </main>
  );
}
