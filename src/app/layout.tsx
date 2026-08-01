import type { Metadata, Viewport } from "next";
import FxLayer from "@/components/FxLayer";
import "./globals.css";

export const metadata: Metadata = {
  title: "Magic Coloring World — Kids Coloring & Learning Games",
  description:
    "A premium, ad-free coloring, drawing and learning playground for children 3–8: 110+ original coloring pages, 15 magic brushes, stickers, balloon pop, dot-to-dot and voice learning cards.",
  applicationName: "Magic Coloring World",
  manifest: "/manifest.webmanifest",
  appleWebApp: { capable: true, statusBarStyle: "default", title: "Magic Coloring World" },
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
        <div id="shake-root">{children}</div>
        <FxLayer />
      </body>
    </html>
  );
}
