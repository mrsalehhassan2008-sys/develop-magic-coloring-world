import Link from "next/link";

export const metadata = {
  title: "FAQ — Magic Coloring World",
  description: "Frequently asked questions about Magic Coloring World: safety, pricing, offline play, cloud save and Google Play release.",
};

const GROUPS: [string, [string, string][]][] = [
  [
    "Getting started",
    [
      ["Is the game really free?", "Yes. The web version is completely free and includes dozens of coloring pages, all games and the buddy. A one-time Premium unlock (a few dollars) adds every page and magic brush — no subscription."],
      ["Do I need to install anything?", "No. Press “Play” and it runs in your browser on phones, tablets and computers. You can also add it to your home screen like an app."],
      ["When is the Google Play version?", "It is in the final review-preparation stage. The web version today has the exact same game."],
    ],
  ],
  [
    "Safety & privacy",
    [
      ["Is it safe for my 4-year-old?", "Yes. No ads, no chat, no external links reachable by children, large buttons, and a parental gate on every setting and purchase."],
      ["What data do you collect?", "Only what you choose to save: an optional nickname, your child's artwork and progress. No real names, location, contacts or advertising IDs. Details in our Privacy Policy."],
      ["How do I delete my child's data?", "From the Parent Area on the device (Reset), or email us the child's 6-letter code and we delete the cloud copy within 7 days."],
    ],
  ],
  [
    "Progress & devices",
    [
      ["My child changed tablet — how do we keep progress?", "Every child profile has a 6-letter cloud code in the Parent Area. On the new device: “Who is playing? → Restore” → type the code."],
      ["Does it work offline?", "Fully. After the first visit, pages, games and sounds work with no internet. Cloud sync resumes when online."],
      ["Can multiple kids share one device?", "Yes — up to 4 profiles, each with its own stars, gallery, buddy and settings."],
    ],
  ],
];

export default function FaqPage() {
  return (
    <main className="mx-auto max-w-3xl px-6 py-14 text-[#2D3748]">
      <Link href="/" className="text-sm font-black text-[#8E7CFF]">← Home</Link>
      <h1 className="mt-4 text-4xl font-black text-[#3B2E5A]">Frequently asked questions</h1>

      {GROUPS.map(([title, items]) => (
        <section key={title} className="mt-10">
          <h2 className="text-xl font-black text-[#FF4D94]">{title}</h2>
          <div className="mt-4 space-y-3">
            {items.map(([q, a]) => (
              <details key={q} className="group rounded-3xl bg-white p-5 shadow-sm ring-1 ring-[#FFE1EF]">
                <summary className="cursor-pointer list-none font-black text-[#3B2E5A]">
                  <span className="mr-2 inline-block text-[#FF4D94] transition group-open:rotate-90">▸</span>{q}
                </summary>
                <p className="mt-2 text-sm font-bold leading-relaxed text-[#6B5B8A]">{a}</p>
              </details>
            ))}
          </div>
        </section>
      ))}

      <div className="mt-12 rounded-3xl bg-gradient-to-r from-[#8E7CFF] to-[#5AC8FA] p-8 text-center text-white">
        <h3 className="text-2xl font-black">Still curious?</h3>
        <div className="mt-4 flex justify-center gap-3">
          <Link href="/contact" className="rounded-full bg-white px-6 py-3 font-black text-[#5A4FCF] active:scale-95">Contact us</Link>
          <Link href="/play" className="rounded-full bg-white/20 px-6 py-3 font-black active:scale-95">▶ Try the game</Link>
        </div>
      </div>
    </main>
  );
}
