import Link from "next/link";
export const metadata = {
  title: "Privacy Policy — Magic Coloring World",
  description: "How Magic Coloring World protects children's privacy (COPPA & Google Play Families compliant).",
};

const UPDATED = "January 2026";

export default function PrivacyPage() {
  return (
    <main className="mx-auto max-w-3xl px-6 py-12 text-[#2E2545]">
      <Link href="/" className="text-sm font-black text-[#8E7CFF]">← Back to app</Link>
      <h1 className="mt-4 text-3xl font-black">Privacy Policy</h1>
      <p className="mt-1 text-sm text-[#7A6C99]">Last updated: {UPDATED}</p>

      <Section title="Our promise to families">
        Magic Coloring World is designed for children aged 3–8 and complies with the Google Play Families
        Policy, the U.S. Children&apos;s Online Privacy Protection Act (COPPA) and the EU GDPR-K. We do not
        show behavioural advertising and we never knowingly collect personal information from children.
      </Section>

      <Section title="Information we do NOT collect">
        <ul className="list-disc pl-5">
          <li>No real name, email, phone number, or postal address.</li>
          <li>No precise location or GPS data.</li>
          <li>No advertising identifiers (AAID/IDFA) and no cross-app tracking.</li>
          <li>No photos, contacts, microphone or camera access.</li>
        </ul>
      </Section>

      <Section title="Information stored">
        <ul className="list-disc pl-5">
          <li>
            <b>On the device:</b> game progress, settings, stars/coins and unlocked items are stored locally
            in the browser/app storage. A child-chosen nickname and avatar are stored only to personalise the
            experience.
          </li>
          <li>
            <b>On our server (optional features):</b> if a child saves artwork to the gallery or a high score,
            we store the artwork image, the score and the chosen nickname. No advertising IDs or personal
            identifiers are attached, and this data cannot identify a real child.
          </li>
        </ul>
      </Section>

      <Section title="Parental controls">
        A parental gate (a maths challenge) protects all settings, external links and any purchase actions.
        Parents can, at any time, delete all saved artwork, reset progress, and remove child profiles from the
        Parent Area inside the app.
      </Section>

      <Section title="Advertising & purchases">
        This build contains no third-party advertising SDK and no behavioural ads. If advertising is ever
        enabled, it will be non-personalised and served only through a Google Play Families-certified partner.
        Any in-app purchases are handled by the platform store behind the parental gate.
      </Section>

      <Section title="Data security">
        Locally stored progress is obfuscated. Server communication uses HTTPS. We retain gallery/score data
        only as long as needed to provide the feature and delete it on request.
      </Section>

      <Section title="Your rights & contact">
        Parents may request deletion of any stored data by contacting us. We will respond promptly.
        <br />
        <b>Email:</b> support@magiccoloringworld.example
      </Section>

      <Section title="Changes">
        We may update this policy; the “Last updated” date will change accordingly. Continued use after an
        update constitutes acceptance.
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
