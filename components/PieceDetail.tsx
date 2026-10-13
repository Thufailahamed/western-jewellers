"use client";

import { useEffect, useRef, useState } from "react";
import { useLenis } from "lenis/react";
import { formatPrice, METALS, type Collection, type Metal, type Piece } from "@/lib/data";
import { IMG } from "@/lib/images";
import { gsap, useGSAP } from "@/lib/gsap";
import { JewelView } from "./three/JewelView";
import { TLink, usePageTransition } from "./Transition";
import { Magnetic } from "./Chrome";
import { Accordion, Crumbs } from "./shared";
import { Photo } from "./Photo";
import { STYLED } from "./gallery";

const CAPTIONS = ["As worn", "At the bench", "The finish"];
const PROMISES = ["Made to order in our atelier", "Conflict-free, traceable stones", "Complimentary lifetime care"];

export function PieceDetail({ piece, collection }: { piece: Piece; collection: Collection }) {
  const [metal, setMetal] = useState<Metal>(piece.metal);
  const [size, setSize] = useState<string | null>(null);
  const [zoom, setZoom] = useState(false);
  const [frame, setFrame] = useState(0);
  const [bar, setBar] = useState(false);
  const drag = useRef({ x: 0, y: 0 });
  const down = useRef<{ x: number; y: number } | null>(null);
  const root = useRef<HTMLElement>(null);
  const actions = useRef<HTMLDivElement>(null);
  const { ready } = usePageTransition();
  const lenis = useLenis();
  const photos = STYLED[collection.slug] ?? STYLED.solitaire;

  useGSAP(
    () => {
      if (!ready) return;
      gsap.fromTo(".pd__stage", { clipPath: "inset(10% 10% 10% 10% round 24px)" }, { clipPath: "inset(0% 0% 0% 0% round 0px)", duration: 1.6, ease: "expo.inOut" });
      gsap.fromTo(".pd__ghost", { yPercent: 30, opacity: 0 }, { yPercent: 0, opacity: 1, duration: 2, ease: "expo.out", delay: 0.4 });
      gsap.fromTo(".pd__title .ln > span", { yPercent: 110, y: 0 }, { yPercent: 0, duration: 1.4, ease: "expo.out", delay: 0.3 });
      gsap.fromTo(".pd__info > *:not(.pd__title)", { opacity: 0, y: 24 }, { opacity: 1, y: 0, duration: 1.2, ease: "expo.out", stagger: 0.05, delay: 0.45 });
      gsap.fromTo(".pd__rail > *", { opacity: 0, x: -12 }, { opacity: 1, x: 0, duration: 1, ease: "expo.out", stagger: 0.06, delay: 0.7 });
    },
    { scope: root, dependencies: [ready] }
  );

  // Keep the thumbnail rail in step with the frame in view.
  useEffect(() => {
    const frames = root.current?.querySelectorAll<HTMLElement>(".pd__frame");
    if (!frames) return;
    const io = new IntersectionObserver(
      (entries) => entries.forEach((e) => e.isIntersecting && setFrame(Number((e.target as HTMLElement).dataset.i))),
      { rootMargin: "-45% 0px -45% 0px" }
    );
    frames.forEach((f) => io.observe(f));
    return () => io.disconnect();
  }, []);

  // The slim buy bar appears once the main buttons have scrolled away.
  useEffect(() => {
    const el = actions.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => setBar(!e.isIntersecting && e.boundingClientRect.top < 0));
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const goTo = (i: number) => {
    const el = root.current?.querySelector<HTMLElement>(`.pd__frame[data-i="${i}"]`);
    if (!el) return;
    // On narrow screens the gallery is a horizontal strip.
    const strip = el.parentElement!;
    if (strip.scrollWidth > strip.clientWidth + 4) strip.scrollTo({ left: el.offsetLeft - strip.offsetLeft, behavior: "smooth" });
    else if (lenis) lenis.scrollTo(el, { offset: -90, duration: 1.4 });
    else el.scrollIntoView({ behavior: "smooth" });
  };

  const sizeLabel = piece.sizes ? (size ? `Size ${size}` : "Select a size") : null;

  return (
    <section ref={root} className={`pd pd--${metal}`}>
      <nav className="pd__rail" aria-label="Views">
        <button className={`pd__thumb pd__thumb--3d${frame === 0 ? " is-active" : ""}`} onClick={() => goTo(0)} aria-label="3D view">
          <span>3D</span>
        </button>
        {photos.map((p, i) => (
          <button key={p} className={`pd__thumb${frame === i + 1 ? " is-active" : ""}`} onClick={() => goTo(i + 1)} aria-label={CAPTIONS[i]}>
            <Photo img={IMG[p]} sizes="80px" reveal={false} parallax={0} />
          </button>
        ))}
        <span className="pd__rail-count micro">
          {String(frame + 1).padStart(2, "0")}
          <i />
          {String(photos.length + 1).padStart(2, "0")}
        </span>
      </nav>

      <div className="pd__gallery">
        <div
          className={`pd__frame pd__stage${zoom ? " is-zoom" : ""}`}
          data-i="0"
          data-cursor="Drag"
          onPointerDown={(e) => {
            down.current = { x: e.clientX, y: e.clientY };
            (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
          }}
          onPointerMove={(e) => {
            if (!down.current) return;
            drag.current.x += (e.clientX - down.current.x) * 0.01;
            drag.current.y = Math.max(-0.9, Math.min(0.9, drag.current.y + (e.clientY - down.current.y) * 0.006));
            down.current = { x: e.clientX, y: e.clientY };
          }}
          onPointerUp={() => (down.current = null)}
          onPointerCancel={() => (down.current = null)}
        >
          {(Object.keys(METALS) as Metal[]).map((m) => (
            <span key={m} className={`pd__tint pd__tint--${m}${metal === m ? " is-on" : ""}`} aria-hidden="true" />
          ))}
          <span className="pd__ghost" aria-hidden="true">{piece.name}</span>
          <JewelView className="pd__view" kind={piece.model} metal={metal} glints drag={drag} zoom={zoom ? 1.45 : 1} />
          <div className="pd__hint">
            <span className="micro pd__hint-l">
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path d="M4 12a8 8 0 0 1 14-5.3M20 12a8 8 0 0 1-14 5.3" />
                <path d="M18 3v4h-4M6 21v-4h4" />
              </svg>
              Drag to rotate · 360°
            </span>
            <button className="pd__zoom" onClick={() => setZoom((z) => !z)} onPointerDown={(e) => e.stopPropagation()} aria-pressed={zoom} aria-label={zoom ? "Zoom out" : "Zoom in"}>
              {zoom ? "−" : "+"}
            </button>
          </div>
        </div>
        {photos.map((p, i) => (
          <figure key={p} className="pd__frame pd__photo" data-i={i + 1}>
            <Photo img={IMG[p]} sizes="(max-width: 1100px) 90vw, 50vw" parallax={0.1} />
            <figcaption>
              <span className="micro">{String(i + 2).padStart(2, "0")}</span>
              <span>{CAPTIONS[i]}</span>
            </figcaption>
          </figure>
        ))}
      </div>

      <div className="pd__info">
        <Crumbs
          items={[
            { href: "/collections", label: "Collections" },
            { href: `/collections/${collection.slug}`, label: collection.name },
            { href: `/pieces/${piece.slug}`, label: piece.name },
          ]}
        />
        <div className="pd__kicker">
          <span className="micro micro--gold">{piece.tagline}</span>
          <span className="micro">{collection.index} — {collection.name}</span>
        </div>
        <h1 className="pd__title">
          <span className="ln">
            <span>{piece.name}</span>
          </span>
        </h1>
        <div className="pd__buy">
          <span className="pd__price">{formatPrice(piece.price)}</span>
          <span className="micro pd__lead">
            <i /> Made to order · 3–5 weeks
          </span>
        </div>

        <div className="pd__option">
          <div className="pd__option-head">
            <span className="micro">Metal</span>
            <span className="pd__option-val">{METALS[metal].label}</span>
          </div>
          <div className="pd__metals" role="radiogroup" aria-label="Metal">
            {(Object.keys(METALS) as Metal[]).map((m) => (
              <button key={m} role="radio" aria-checked={metal === m} className={`pd__metal${metal === m ? " is-active" : ""}`} onClick={() => setMetal(m)}>
                <i style={{ background: METALS[m].swatch }} />
                <span>{METALS[m].label.replace("18k ", "")}</span>
              </button>
            ))}
          </div>
        </div>

        {piece.sizes && (
          <div className="pd__option">
            <div className="pd__option-head">
              <span className="micro">Ring size</span>
              <TLink href="/appointment" className="pd__guide micro">Size guide &amp; fitting →</TLink>
            </div>
            <div className="sizes" role="radiogroup" aria-label="Ring size">
              {piece.sizes.map((s) => (
                <button key={s} role="radio" aria-checked={size === s} className={size === s ? "is-active" : ""} onClick={() => setSize(s)}>
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}

        <div ref={actions} className="pd__actions">
          <Magnetic strength={0.15}>
            <TLink href="/appointment" className="btn btn--dark btn--full">
              <span>Book a private viewing</span>
            </TLink>
          </Magnetic>
          <TLink href="/bespoke" className="btn btn--outline btn--full">
            <span>Make it bespoke</span>
          </TLink>
        </div>

        <ul className="pd__promises">
          {PROMISES.map((p) => (
            <li key={p} className="micro">
              <svg viewBox="0 0 10 10" aria-hidden="true">
                <path d="M5 0 L9 5 L5 10 L1 5 Z" />
              </svg>
              {p}
            </li>
          ))}
        </ul>

        <p className="pd__desc">{piece.description}</p>

        <Accordion
          items={[
            {
              title: "Specifications",
              body: (
                <dl className="pd__specs">
                  {piece.specs.map(([k, v]) => (
                    <div key={k}>
                      <dt>{k}</dt>
                      <dd>{v}</dd>
                    </div>
                  ))}
                  <div>
                    <dt>Metal</dt>
                    <dd>{METALS[metal].label}</dd>
                  </div>
                </dl>
              ),
            },
            { title: "Craftsmanship", body: <p>Made to order in our atelier over three to five weeks. Every stone is hand-selected and set under the microscope, and every piece comes with a grading report and a certificate of origin.</p> },
            { title: "Delivery & returns", body: <p>Complimentary insured delivery, or collect in person from the atelier. Ready-made pieces can be returned within 30 days; bespoke commissions are made just for you and can't be returned.</p> },
            { title: "Lifetime care", body: <p>Bring your piece back once a year and we will check every claw, clean and re-polish it at no charge.</p> },
          ]}
        />
      </div>

      <div className={`pd__bar${bar ? " is-on" : ""}`} aria-hidden={!bar}>
        <span className="pd__bar-swatch" style={{ background: METALS[metal].swatch }} />
        <span className="pd__bar-name">{piece.name}</span>
        <span className="micro pd__bar-meta">
          {METALS[metal].label}
          {sizeLabel ? ` · ${sizeLabel}` : ""}
        </span>
        <span className="pd__bar-price">{formatPrice(piece.price)}</span>
        <TLink href="/appointment" className="btn btn--dark pd__bar-btn" tabIndex={bar ? 0 : -1}>
          <span>Book a viewing</span>
        </TLink>
      </div>
    </section>
  );
}
