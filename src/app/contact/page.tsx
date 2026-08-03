import Link from "next/link";

export const metadata = {
  title: "Contact — Magic Coloring World",
  description: "Contact the Magic Coloring World team for support, feedback or press enquiries.",
};

export default function ContactPage() {
  return (
    <main className="mx-auto max-w-2xl px-6 py-14 text-[#2D3748]">
      <Link href="/" className="text-sm font-black text-[#8E7CFF]">← Home</Link>
      <h1 className="mt-4 text-4xl font-black text-[#3B2E5A]">Contact us</h1>
      <p className="mt-3 font-bold text-[#6B5B8A]">
        Questions, ideas, or a drawing your child wants to show us? We read everything and reply within 48 hours.
      </p>

      <div className="mt-8 space-y-4">
        <a
          href="mailto:support@magiccoloringworld.example?subject=Magic%20Coloring%20World"
          className="block rounded-3xl bg-white p-6 shadow-sm ring-1 ring-[#FFE1EF] transition hover:-translate-y-1"
        >
          <div className="text-3xl">📧</div>
          <div className="mt-1 font-black text-[#3B2E5A]">support@magiccoloringworld.example</div>
          <div className="text-sm font-bold text-[#6B5B8A]">Support, feedback & feature requests</div>
        </a>
        <div className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-[#FFE1EF]">
          <div className="text-3xl">🔐</div>
          <div className="mt-1 font-black text-[#3B2E5A]">Privacy & data requests</div>
          <p className="mt-1 text-sm font-bold text-[#6B5B8A]">
            Want your child&apos;s saved data deleted? Email us with the child&apos;s 6-letter code and we will remove
            everything within 7 days. See our <Link href="/privacy" className="text-[#8E7CFF] underline">Privacy Policy</Link>.
          </p>
        </div>
        <div className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-[#FFE1EF]">
          <div className="text-3xl">🧒</div>
          <div className="mt-1 font-black text-[#3B2E5A]">A note for kids</div>
          <p className="mt-1 text-sm font-bold text-[#6B5B8A]">
            If you&apos;re a child, please ask a parent or grown-up to write to us with you. 💛
          </p>
        </div>
      </div>

      <p className="mt-8 text-center text-sm font-bold text-[#A99CC4]">
        Looking for answers? Check the <Link href="/faq" className="text-[#8E7CFF] underline">FAQ</Link>.
      </p>
    </main>
  );
}
