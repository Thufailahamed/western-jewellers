"use client";

import { useRef } from "react";
import Image, { type ImageLoader } from "next/image";
import type { Img } from "@/lib/images";
import { DEVELOP, gsap, useGSAP } from "@/lib/gsap";

// Unsplash resizes on its own CDN, so we ask it for the width Next would have requested.
const unsplash: ImageLoader = ({ src, width, quality }) => `${src}?auto=format&fit=crop&w=${width}&q=${quality ?? 75}`;

type Props = {
  img: Img;
  className?: string;
  sizes?: string;
  /** Strength of the scroll parallax on the image inside its frame (0 disables it). */
  parallax?: number;
  /** Wipe the frame open the first time it scrolls into view. */
  reveal?: boolean;
  priority?: boolean;
  children?: React.ReactNode;
};

/** A framed photograph: develops into focus on first view and drifts slightly inside its frame while scrolling. */
export function Photo({ img, className, sizes = "100vw", parallax = 0.08, reveal = true, priority, children }: Props) {
  const root = useRef<HTMLDivElement>(null);
  useGSAP(
    () => {
      const el = root.current!;
      const inner = el.querySelector(".photo__inner");
      if (reveal) {
        const st = { trigger: el, start: "top 90%", once: true };
        gsap.fromTo(el, DEVELOP.from, { ...DEVELOP.to, scrollTrigger: st });
        gsap.fromTo(el.querySelector("img"), { scale: 1.12 }, { scale: 1, duration: 2.4, ease: "power3.out", scrollTrigger: st });
      }
      if (parallax && inner) {
        gsap.fromTo(
          inner,
          { yPercent: -parallax * 50 },
          { yPercent: parallax * 50, ease: "none", scrollTrigger: { trigger: el, start: "top bottom", end: "bottom top", scrub: true } }
        );
      }
    },
    { scope: root }
  );
  return (
    <div ref={root} className={`photo${reveal ? " photo--reveal" : ""}${className ? " " + className : ""}`}>
      <div className="photo__inner" style={{ inset: `${-parallax * 50}% 0` }}>
        <Image loader={unsplash} src={img.src} alt={img.alt} fill sizes={sizes} priority={priority} />
      </div>
      {children}
    </div>
  );
}

/** A piece's own photograph, with the same piece as worn fading in on hover of the nearest `.has-worn` ancestor. */
export function PiecePhoto({ image, worn, className, sizes }: { image: Img; worn: Img; className?: string; sizes?: string }) {
  return (
    <div className={`piece-photo${className ? " " + className : ""}`}>
      <Photo img={image} className="piece-photo__still" sizes={sizes} reveal={false} parallax={0.06} />
      <Photo img={worn} className="piece-photo__worn" sizes={sizes} reveal={false} parallax={0.06} />
    </div>
  );
}
