import Link from "next/link";
export const metadata = { title: "Offline — Magic Coloring World" };

export default function OfflinePage() {
  return (
    <main className="grid min-h-[100dvh] place-items-center bg-[linear-gradient(160deg,#FFE8F4,#E7F3FF)] p-6 text-center">
      <div>
        <div className="text-7xl">🎨</div>
        <h1 className="mt-3 text-2xl font-black text-[#4B3B6E]">You&apos;re offline</h1>
        <p className="mt-2 font-bold text-[#7A6C99]">
          No internet right now — but your saved coloring pages still work!
        </p>
        <Link
          href="/"
          className="mt-6 inline-block rounded-full bg-gradient-to-r from-[#FF7FB6] to-[#FFB03A] px-8 py-4 text-lg font-black text-white shadow-lg"
        >
          ▶️ Keep Playing
        </Link>
      </div>
    </main>
  );
}
