import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono, Noto_Serif_Display } from "next/font/google";

import { SiteFooter } from "@/components/layout/SiteFooter";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { SmoothScroll } from "@/components/layout/SmoothScroll";
import { site } from "@/data/site";

import "./globals.css";

// next/font self-hosts every subset (Latin and Cyrillic are always available);
// `subsets` only lists what is preloaded. We preload what the first screen
// paints: display Latin + Cyrillic (ВЕРСТА → VERSTE), italic Latin (hero
// line) and interface Latin. The italic never uses the width axis, so it is a
// separate, lighter instance.
const display = Noto_Serif_Display({
  variable: "--ff-display",
  subsets: ["latin", "cyrillic"],
  axes: ["wdth"],
  style: ["normal"],
  display: "swap",
});

const displayItalic = Noto_Serif_Display({
  variable: "--ff-display-italic",
  subsets: ["latin"],
  style: ["italic"],
  display: "swap",
});

const sans = Geist({
  variable: "--ff-sans",
  subsets: ["latin"],
  display: "swap",
});

const mono = Geist_Mono({
  variable: "--ff-mono",
  subsets: ["latin"],
  display: "swap",
  preload: false,
});

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: {
    default: `${site.name} · Travel planner Russie, voyages préparés sur mesure`,
    template: `%s · ${site.name}`,
  },
  description:
    "Préparer un voyage en Russie en 2026 : itinéraire sur mesure, visa, paiements, connexion, transports et langue. Nous préparons, vous voyagez.",
  applicationName: site.name,
  openGraph: {
    type: "website",
    locale: "fr_FR",
    siteName: site.name,
    title: `${site.name} · ${site.heroLine}`,
    description: site.signature,
  },
  robots: site.indexable ? { index: true, follow: true } : { index: false, follow: false },
};

export const viewport: Viewport = {
  themeColor: "#0c0f14",
  colorScheme: "dark light",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="fr" className={`${display.variable} ${displayItalic.variable} ${sans.variable} ${mono.variable}`}>
      <body className="min-h-dvh">
        <a
          href="#contenu"
          className="label sr-only fixed top-3 left-3 z-[60] bg-route px-4 py-3 text-on-route focus:not-sr-only"
        >
          Aller au contenu
        </a>
        <SmoothScroll />
        <SiteHeader />
        <main id="contenu">{children}</main>
        <SiteFooter />
      </body>
    </html>
  );
}
