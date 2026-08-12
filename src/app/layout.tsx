import type { Metadata, Viewport } from "next";
import FxLayer from "@/components/FxLayer";
import SwRegister from "@/components/SwRegister";
import LangEffect from "@/components/LangEffect";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://develop-magic-coloring-world.vercel.app"),
  title: "Magic Coloring World — Safe Coloring & Learning Games for Kids 3–8",
  description:
    "122+ original coloring pages, 6 educational games, 500+ stickers and a talking buddy. 100% ad-free, COPPA-safe and playable free in your browser. Coming soon to Google Play.",
  keywords: [
    "kids coloring game",
    "coloring app for toddlers",
    "educational games for kids",
    "safe kids app",
    "color by numbers",
    "drawing app for children",
    "preschool learning games",
    "لعبة تلوين للأطفال",
  ],
  applicationName: "Magic Coloring World",
  manifest: "/manifest.webmanifest",
  icons: { icon: "/icon.png", apple: "/icon.png" },
  appleWebApp: { capable: true, statusBarStyle: "default", title: "Magic Coloring World" },
  openGraph: {
    type: "website",
    siteName: "Magic Coloring World",
    title: "Magic Coloring World — Safe Coloring & Learning Games for Kids",
    description: "122+ original coloring pages, 6 learning games and a talking buddy. Ad-free, COPPA-safe, free to play.",
    images: [{ url: "/feature-graphic.png", width: 1024, height: 500, alt: "Magic Coloring World" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Magic Coloring World — Safe Coloring & Learning Games for Kids",
    description: "122+ original coloring pages, 6 learning games and a talking buddy. Ad-free & COPPA-safe.",
    images: ["/feature-graphic.png"],
  },
};

export const viewport: Viewport = {
  themeColor: "#FFE8F4",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "MobileApplication",
              name: "Magic Coloring World",
              operatingSystem: "ANDROID, WEB",
              applicationCategory: "GameApplication",
              contentRating: "Everyone",
              description:
                "Ad-free coloring, drawing and learning games for children 3-8 with 122+ original pages, 6 games and a talking buddy.",
              offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
              author: { "@type": "Organization", name: "Magic Coloring World" },
            }),
          }}
        />
        <div id="shake-root">{children}</div>
        <FxLayer />
        <SwRegister />
        <LangEffect />
      </body>
    </html>
  );
}
