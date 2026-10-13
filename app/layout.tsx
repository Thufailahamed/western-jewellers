import type { Metadata, Viewport } from "next";
import { Bodoni_Moda, Jost } from "next/font/google";
import "lenis/dist/lenis.css";
import "./globals.css";
import SmoothScroll from "@/components/SmoothScroll";
import { TransitionProvider } from "@/components/Transition";
import { Cursor, Footer, Loader, Nav } from "@/components/Chrome";
import GLCanvas from "@/components/three/GLCanvas";

// Didone display serif (in the Didot / Bodoni tradition of fashion houses) + geometric sans (Futura-like).
const serif = Bodoni_Moda({
  subsets: ["latin"],
  style: ["normal", "italic"],
  axes: ["opsz"],
  variable: "--font-serif",
  display: "swap",
});
const sans = Jost({ subsets: ["latin"], variable: "--font-sans", display: "swap" });

export const metadata: Metadata = {
  title: { default: "Western Jewellers — Fine jewellery, made to outlast", template: "%s — Western Jewellers" },
  description: "Fine jewellery, bridal and bespoke pieces, drawn, cast, set and polished by hand in our atelier.",
};

export const viewport: Viewport = { themeColor: "#f6f1ea" };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${serif.variable} ${sans.variable}`}>
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
