"use client";

import { useEffect, useRef, useState } from "react";
import { formatPrice, METALS, type Collection, type Metal, type Piece } from "@/lib/data";
import { IMG, type ImgKey } from "@/lib/images";
import { gsap, useGSAP } from "@/lib/gsap";
import { TLink, usePageTransition } from "./Transition";
import { Accordion, Crumbs } from "./shared";
import { Photo } from "./Photo";
import { STYLED } from "./gallery";

const METAL_KEYS = Object.keys(METALS) as Metal[];
const SERVICES = [
  ["Insured delivery", "Complimentary"],
  ["Lifetime care", "Included"],
  ["Grading report", "With every stone"],
];

export function PieceDetail({ piece, collection }: { piece: Piece; collection: Collection }) {
  const [metal, setMetal] = useState<Metal>(piece.metal);
  const [size, setSize] = useState<string | null>(null);
  const [frame, setFrame] = useState(0);
  const [bar, setBar] = useState(false);
  const root = useRef<HTMLElement>(null);
  const actions = useRef<HTMLDivElement>(null);
  const { ready } = usePageTransition();

  // The piece, the piece worn, then the collection's bench and still-life shots.
  const [, made, still] = STYLED[collection.slug] ?? STYLED.solitaire;
  const shots: { img: ImgKey; cap: string }[] = [
    { img: piece.image, cap: piece.name },
    { img: piece.worn, cap: "As worn" },
    { img: made, cap: "At the bench" },
    { img: still, cap: "The finish" },
  ].filter((s, i, all) => all.findIndex((o) => o.img === s.img) === i);

  useGSAP(
    () => {
      if (!ready) return;
      gsap.fromTo(".pd__shot:first-child", { clipPath: "inset(8% 8% 8% 8%)" }, { clipPath: "inset(0% 0% 0% 0%)", duration: 1.6, ease: "expo.out" });
      gsap.fromTo(".pd__shot:first-child img", { scale: 1.15 }, { scale: 1, duration: 2.2, ease: "expo.out" });
      gsap.fromTo(".pd__title .ln > span", { yPercent: 110, y: 0 }, { yPercent: 0, duration: 1.4, ease: "expo.out", delay: 0.25 });
      gsap.fromTo(".pd__info > *:not(.pd__title)", { opacity: 0, y: 16 }, { opacity: 1, y: 0, duration: 1.1, ease: "expo.out", stagger: 0.05, delay: 0.4 });
    },
    { scope: root, dependencies: [ready] }
  );

  // Counter for the swipeable gallery on small screens.
  useEffect(() => {
    const items = root.current?.querySelectorAll<HTMLElement>(".pd__shot");
    if (!items) return;
    const io = new IntersectionObserver(
      (entries) => entries.forEach((e) => e.isIntersecting && setFrame(Number((e.target as HTMLElement).dataset.i))),
      { threshold: 0.6 }
    );
    items.forEach((f) => io.observe(f));
    return () => io.disconnect();
  }, []);

  // When the info column is taller than the screen, pin it by its bottom edge instead so all of it stays reachable.
  useEffect(() => {
    const el = root.current?.querySelector<HTMLElement>(".pd__info");
    if (!el) return;
    const fit = () => {
      el.style.top = "";
      if (getComputedStyle(el).position !== "sticky") return;
      const top = parseFloat(getComputedStyle(el).top) || 0;
      const over = el.offsetHeight + top + 24 - window.innerHeight;
      if (over > 0) el.style.top = `${top - over}px`;
    };
    fit();
    const ro = new ResizeObserver(fit);
    ro.observe(el);
    window.addEventListener("resize", fit);
    return () => {
      ro.disconnect();
      window.removeEventListener("resize", fit);
    };
  }, []);

  // The slim buy bar appears once the main button has scrolled away.
  useEffect(() => {
    const el = actions.current;
    if (!el) return;
    // ...and steps aside again once the footer comes into view.
    let past = false, footer = false;
    const io = new IntersectionObserver((entries) =>
      entries.forEach((e) => {
        if (e.target === el) past = !e.isIntersecting && e.boundingClientRect.top < 0;
        else footer = e.isIntersecting;
        setBar(past && !footer);
      })
    );
    io.observe(el);
    const foot = document.querySelector(".footer");
    if (foot) io.observe(foot);
    return () => io.disconnect();
  }, []);

  const sizeLabel = piece.sizes ? (size ? `Size ${size}` : "Select a size") : null;

  return (
    <section ref={root} className="pd">
      <div className="pd__gallery">
        {shots.map((s, i) => (
          <figure key={s.img} className="pd__shot" data-i={i}>
            <Photo img={IMG[s.img]} sizes={i === 0 || i === 3 ? "(max-width: 1100px) 90vw, 58vw" : "(max-width: 1100px) 90vw, 29vw"} reveal={i > 0} parallax={0} priority={i === 0} />
            {i > 0 && <figcaption className="micro">{s.cap}</figcaption>}
          </figure>
        ))}
        <span className="pd__count micro" aria-hidden="true">
          {frame + 1} / {shots.length}
        </span>
      </div>

      <div className="pd__info">
        <Crumbs
          items={[
            { href: "/collections", label: "Collections" },
            { href: `/collections/${collection.slug}`, label: collection.name },
            { href: `/pieces/${piece.slug}`, label: piece.name },
          ]}
        />
        <h1 className="pd__title">
          <span className="ln">
            <span>{piece.name}</span>
          </span>
        </h1>
        <p className="pd__tagline">{piece.tagline}</p>
        <div className="pd__buy">
          <span className="pd__price">{formatPrice(piece.price)}</span>
          <span className="micro pd__lead">Made to order · 3–5 weeks</span>
        </div>

        <div className="pd__option">
          <div className="pd__option-head">
            <span className="micro">Metal</span>
            <span className="pd__option-val">{METALS[metal].label}</span>
          </div>
          <div className="pd__metals" role="radiogroup" aria-label="Metal">
            {METAL_KEYS.map((m) => (
              <button key={m} type="button" role="radio" aria-checked={metal === m} className={`pd__metal${metal === m ? " is-active" : ""}`} onClick={() => setMetal(m)}>
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
              <TLink href="/appointment" className="pd__guide micro">Size guide</TLink>
            </div>
            <div className="sizes" role="radiogroup" aria-label="Ring size">
              {piece.sizes.map((s) => (
                <button key={s} type="button" role="radio" aria-checked={size === s} className={size === s ? "is-active" : ""} onClick={() => setSize(s)}>
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}

        <div ref={actions} className="pd__actions">
          <TLink href="/appointment" className="btn btn--dark btn--full">
            <span>Book a private viewing</span>
          </TLink>
          <TLink href="/bespoke" className="btn btn--outline btn--full">
            <span>Make it bespoke</span>
          </TLink>
        </div>

        <ul className="pd__services">
          {SERVICES.map(([t, d]) => (
            <li key={t}>
              <span className="pd__services-t">{t}</span>
              <span className="pd__services-d">{d}</span>
            </li>
          ))}
        </ul>

        <p className="pd__desc">{piece.description}</p>

        <Accordion
          defaultOpen={null}
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
