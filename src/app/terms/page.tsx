import Link from "next/link";
export const metadata = {
  title: "Terms of Service — Magic Coloring World",
  description: "Terms of Service for Magic Coloring World kids coloring app.",
};

const UPDATED = "January 2026";

export default function TermsPage() {
  return (
    <main className="mx-auto max-w-3xl px-6 py-12 text-[#2E2545]">
      <Link href="/" className="text-sm font-black text-[#8E7CFF]">← Back to app</Link>
      <h1 className="mt-4 text-3xl font-black">Terms of Service</h1>
      <p className="mt-1 text-sm text-[#7A6C99]">Last updated: {UPDATED}</p>

      <Section title="1. Acceptance">
        Magic Coloring World is provided for entertainment and educational use by children with parental
        supervision. By using the app you agree to these terms.
      </Section>
      <Section title="2. Original content">
        All illustrations, characters, sounds and music are original works created for this product. No
        third-party or copyrighted characters, images or audio are included.
      </Section>
      <Section title="3. Your child's artwork">
        Artwork a child creates inside the app belongs to the child and their family. You may export and share
        it freely.
      </Section>
      <Section title="4. Acceptable use">
        Do not attempt to reverse engineer, tamper with, or misuse the app or its servers.
      </Section>
      <Section title="5. Purchases">
        In-app purchases, if enabled, are handled by the platform store and follow its refund rules, behind a
        parental gate.
      </Section>
      <Section title="6. Disclaimer">
        The service is provided “as is” without warranty of any kind. We are not liable for indirect or
        incidental damages arising from use of the app.
      </Section>
      <Section title="7. Contact">
        Questions? Email support@magiccoloringworld.example
      </Section>
    </main>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mt-6">
      <h2 className="text-lg font-black">{title}</h2>
      <div className="mt-1 text-sm leading-relaxed text-[#4B3B6E]">{children}</div>
    </section>
  );
}
