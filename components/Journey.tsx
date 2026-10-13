"use client";

import { useMemo, useRef, useState } from "react";
import { useLenis } from "lenis/react";
import { collections, formatPrice, getPiece, METALS } from "@/lib/data";
import { gsap, ScrollTrigger, useGSAP } from "@/lib/gsap";
import { JourneyView, JOURNEY_START, journeyIndex } from "./three/JourneyView";
import { TLink, usePageTransition } from "./Transition";

const SLUGS = ["aurelia", "celeste", "trois", "perpetua", "lumiere-drop", "halo-hoops", "rosee", "heritage-bangle"];

/** Pinned, centred carousel: scrolling (or the arrows) carries the camera from one piece to the next. */
export function Journey() {
  const root = useRef<HTMLElement>(null);
  const progress = useRef(0);
  const intro = useRef({ v: 0 });
  const [active, setActive] = useState(0);
  const { navigate } = usePageTransition();
  const lenis = useLenis();

  const pieces = useMemo(() => SLUGS.map((s) => getPiece(s)!), []);
  const items = useMemo(() => pieces.map((p) => ({ kind: p.model, metal: p.metal })), [pieces]);
  const n = pieces.length;

  useGSAP(
    () => {
      ScrollTrigger.create({
        trigger: root.current,
        start: "top top",
        end: "bottom bottom",
        onUpdate: (s) => {
          progress.current = s.progress;
          const idx = Math.max(0, Math.min(n - 1, Math.round(journeyIndex(s.progress, n))));
          setActive((prev) => (prev === idx ? prev : idx));
          gsap.set(".carousel__bar span", { scaleX: s.progress });
        },
      });
      // The row glides in from the right the first time the section comes into view.
      ScrollTrigger.create({
        trigger: root.current,
        start: "top 85%",
        once: true,
        onEnter: () => gsap.to(intro.current, { v: 1, duration: 2.4, ease: "expo.out" }),
      });
    },
    { scope: root }
  );

  useGSAP(
    () => {
      gsap.fromTo(".carousel__ghost span", { yPercent: 40, opacity: 0 }, { yPercent: 0, opacity: 1, duration: 1.2, ease: "expo.out" });
      gsap.fromTo(".carousel__caption .cap", { yPercent: 100, opacity: 0 }, { yPercent: 0, opacity: 1, duration: 1, ease: "expo.out", stagger: 0.05 });
    },
    { scope: root, dependencies: [active] }
  );

  const goTo = (i: number) => {
    const el = root.current!;
    const target = Math.max(0, Math.min(n - 1, i));
    const p = (target - JOURNEY_START) / (n - 1 - JOURNEY_START);
    const y = el.offsetTop + p * (el.offsetHeight - window.innerHeight);
    if (lenis) lenis.scrollTo(y, { duration: 1.6 });
    else window.scrollTo({ top: y, behavior: "smooth" });
  };

  const piece = pieces[active];
  const col = collections.find((c) => c.slug === piece.collection);

  return (
    <section ref={root} className="carousel" style={{ height: `${100 + (n - 1) * 60}vh` }} aria-label="The collection">
      <div className="carousel__stage">
        <div className="carousel__head">
          <span className="micro">The collection</span>
          <span className="micro carousel__head-c">
            {String(active + 1).padStart(2, "0")} / {String(n).padStart(2, "0")}
          </span>
          <span className="micro carousel__head-r">Scroll, or use the arrows</span>
        </div>

        <div className="carousel__ghost" aria-hidden="true">
          <span key={piece.slug}>{piece.name}</span>
        </div>

        <JourneyView className="carousel__view" items={items} progress={progress} intro={intro} />

        <div
          className="carousel__hit"
          data-cursor="Discover"
          onClick={() => navigate(`/pieces/${piece.slug}`)}
          aria-hidden="true"
        />

        <button className="carousel__arrow carousel__arrow--l" onClick={() => goTo(active - 1)} disabled={active === 0} aria-label="Previous piece">
          ←
        </button>
        <button className="carousel__arrow carousel__arrow--r" onClick={() => goTo(active + 1)} disabled={active === n - 1} aria-label="Next piece">
          →
        </button>

        <div className="carousel__caption" aria-live="polite">
          <div className="cap-mask">
            <span className="cap micro micro--gold">{col?.name} · {METALS[piece.metal].label}</span>
          </div>
          <div className="cap-mask">
            <h2 className="cap carousel__name">{piece.name}</h2>
          </div>
          <div className="cap-mask">
            <div className="cap carousel__buy">
              <span>{piece.tagline}</span>
              <i />
              <span className="carousel__price">{formatPrice(piece.price)}</span>
              <TLink href={`/pieces/${piece.slug}`} className="link-arrow">
                Discover <span>→</span>
              </TLink>
            </div>
          </div>
        </div>

        <div className="carousel__foot">
          <div className="carousel__bar">
            <span />
          </div>
          <nav className="carousel__index" aria-label="Pieces">
            {pieces.map((p, i) => (
              <button key={p.slug} className={i === active ? "is-active" : undefined} onClick={() => goTo(i)}>
                {p.name}
              </button>
            ))}
          </nav>
        </div>
      </div>
    </section>
  );
}
