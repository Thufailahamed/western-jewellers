import type { Metadata, Viewport } from "next";
import { Cormorant_Garamond, DM_Mono, Hanken_Grotesk } from "next/font/google";
import "lenis/dist/lenis.css";
import "./globals.css";
import SmoothScroll from "@/components/SmoothScroll";
import { TransitionProvider } from "@/components/Transition";
import { Cursor, Footer, Loader, Nav } from "@/components/Chrome";
import GLCanvas from "@/components/three/GLCanvas";

// A high-contrast Garamond for display, set against a clean neo-grotesk for reading.
const serif = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
  style: ["normal", "italic"],
  variable: "--font-serif",
  display: "swap",
});
const sans = Hanken_Grotesk({ subsets: ["latin"], variable: "--font-sans", display: "swap" });
// Product pages: a typewriter mono for labels.
const mono = DM_Mono({ subsets: ["latin"], weight: ["300", "400", "500"], variable: "--font-mono", display: "swap" });

export const metadata: Metadata = {
  title: { default: "Western Jewellers — Fine jewellery, made to outlast", template: "%s — Western Jewellers" },
  description: "Fine jewellery, bridal and bespoke pieces, drawn, cast, set and polished by hand in our atelier.",
};

export const viewport: Viewport = { themeColor: "#f6f1ea" };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${serif.variable} ${sans.variable} ${mono.variable}`}>
      <body>
        <SmoothScroll>
          <TransitionProvider>
            <Loader />
            <Cursor />
            <Nav />
            <main>{children}</main>
            <Footer />
            <GLCanvas />
          </TransitionProvider>
        </SmoothScroll>
        <div className="grain" aria-hidden="true" />
      </body>
    </html>
  );
}
