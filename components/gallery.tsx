"use client";

import { useRef } from "react";
import { useLenis } from "lenis/react";
import { gsap, useGSAP } from "@/lib/gsap";
import { IMG, type ImgKey } from "@/lib/images";
import type { Collection, Piece } from "@/lib/data";
import { Photo } from "./Photo";
import { Reveal, SplitTitle } from "./anim";
import { TLink } from "./Transition";

/* ------------------------------------------------------------------ Photo marquee */

const STRIP: { img: ImgKey; shape: "tall" | "wide" | "square" | "arch" }[] = [
  { img: "benchWoman", shape: "wide" },
  { img: "earDrop", shape: "tall" },
  { img: "bandsGold", shape: "square" },
  { img: "setting", shape: "arch" },
  { img: "neckPendant", shape: "tall" },
  { img: "drawing", shape: "wide" },
  { img: "hoops", shape: "square" },
  { img: "handSolitaire", shape: "arch" },
  { img: "polishing", shape: "tall" },
  { img: "bangleSilk", shape: "wide" },
];

/** An endless, slowly drifting strip of photographs that speeds up with the scroll. */
export function PhotoMarquee({ title = ["Moments from", "the atelier"] }: { title?: [string, string] }) {
  const track = useRef<HTMLDivElement>(null);
  const loop = useRef<gsap.core.Tween | null>(null);
  useGSAP(() => {
    loop.current = gsap.to(track.current, { xPercent: -50, duration: 70, ease: "none", repeat: -1 });
  });
  useLenis(({ velocity }) => {
    if (!loop.current) return;
    const v = Math.min(5, Math.abs(velocity) / 8);
    gsap.to(loop.current, { timeScale: 1 + v * 1.4, duration: 0.2, overwrite: true });
    gsap.to(loop.current, { timeScale: 1, duration: 1.4, delay: 0.25 });
  });
  const row = STRIP.map((s, i) => (
    <figure key={i} className={`pstrip__item pstrip__item--${s.shape}`}>
      <Photo img={IMG[s.img]} sizes="(max-width: 720px) 60vw, 26vw" reveal={false} parallax={0} />
    </figure>
  ));
  return (
    <section
      className="pstrip"
      aria-label="Photographs from the atelier"
      onPointerEnter={() => loop.current && gsap.to(loop.current, { timeScale: 0.25, duration: 0.8 })}
      onPointerLeave={() => loop.current && gsap.to(loop.current, { timeScale: 1, duration: 0.8 })}
    >
      <div className="pstrip__head">
        <span className="micro">The atelier, in pictures</span>
        <SplitTitle className="h2" lines={[title[0], <em key="e">{title[1]}</em>]} />
        <TLink href="/appointment" className="link-arrow">
          Visit us <span>→</span>
        </TLink>
      </div>
      <div className="pstrip__viewport">
        <div ref={track} className="pstrip__track">
          <div className="pstrip__row">{row}</div>
          <div className="pstrip__row" aria-hidden="true">{row}</div>
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ Styled (piece page) */

export const STYLED: Record<string, [ImgKey, ImgKey, ImgKey]> = {
  solitaire: ["handRing", "setting", "haloRing"],
  eternity: ["handsBands", "polishing", "bandsGold"],
  lumiere: ["neckPendant", "benchExamine", "drops"],
  heritage: ["wristBangle", "makerSaw", "bangleSilk"],
};

export function Styled({ piece, collection }: { piece: Piece; collection: Collection }) {
  const [worn, made, still] = STYLED[collection.slug] ?? STYLED.solitaire;
  return (
    <section className="styled">
      <div className="styled__head">
        <span className="micro micro--gold">{piece.name} — styled</span>
        <SplitTitle className="h2" lines={["Made to be", <em key="e">worn every day</em>]} />
        <Reveal as="p" className="styled__note">
          Every {collection.name.toLowerCase()} piece is made to order at our bench, then finished by hand so it is comfortable to wear from the first day.
        </Reveal>
      </div>
      <div className="styled__grid">
        <figure className="styled__a">
          <Photo img={IMG[worn]} sizes="(max-width: 720px) 100vw, 44vw" />
          <figcaption className="micro">As worn</figcaption>
        </figure>
        <figure className="styled__b">
          <Photo img={IMG[made]} sizes="(max-width: 720px) 60vw, 26vw" parallax={0.14} />
          <figcaption className="micro">At the bench</figcaption>
        </figure>
        <figure className="styled__c">
          <Photo img={IMG[still]} sizes="(max-width: 720px) 60vw, 22vw" parallax={0.2} />
          <figcaption className="micro">The finish</figcaption>
        </figure>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ Article figure */

export function ArticleFigure({ images, caption }: { images: [ImgKey, ImgKey]; caption: string }) {
  return (
    <figure className="afigure">
      <div className="afigure__grid">
        <Photo img={IMG[images[0]]} className="afigure__a" sizes="(max-width: 720px) 100vw, 560px" />
        <Photo img={IMG[images[1]]} className="afigure__b" sizes="(max-width: 720px) 60vw, 360px" parallax={0.16} />
      </div>
      <figcaption className="micro">{caption}</figcaption>
    </figure>
  );
}
