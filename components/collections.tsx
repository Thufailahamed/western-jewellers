"use client";

import { useMemo, useRef, useState } from "react";
import { useLenis } from "lenis/react";
import { collections, pieces, piecesIn, formatPrice, METALS, type Collection, type Metal } from "@/lib/data";
import { gsap, useGSAP } from "@/lib/gsap";
import { Photo, PiecePhoto } from "./Photo";
import { IMG } from "@/lib/images";
import { TLink, usePageTransition } from "./Transition";
import { Reveal, SplitTitle } from "./anim";
import { CtaBand } from "./shared";

const pad = (n: number) => String(n).padStart(2, "0");
const METAL_KEYS = Object.keys(METALS) as Metal[];

function useScrollTo() {
  const lenis = useLenis();
  return (id: string) => {
    const el = document.getElementById(id);
    if (!el) return;
    if (lenis) lenis.scrollTo(el, { duration: 1.8 });
    else el.scrollIntoView({ behavior: "smooth" });
  };
}

/* ------------------------------------------------------------------ 1. Hero: four arched doorways */

export function CollectionsHero() {
  const root = useRef<HTMLElement>(null);
  const go = useScrollTo();
  const { ready } = usePageTransition();
  const [open, setOpen] = useState(0);

  useGSAP(
    () => {
      if (!ready) return;
      gsap.fromTo(
        ".cxh__arch",
        { clipPath: "inset(100% 0% 0% 0%)", y: 60 },
        { clipPath: "inset(0% 0% 0% 0%)", y: 0, duration: 1.6, ease: "expo.inOut", stagger: 0.09, delay: 0.2 }
      );
      gsap.fromTo(".cxh__arch img", { scale: 1.3 }, { scale: 1, duration: 2.2, ease: "expo.out", stagger: 0.09, delay: 0.35 });
    },
    { scope: root, dependencies: [ready] }
  );

  return (
    <section ref={root} className="cxh">
      <div className="cxh__top">
        <Reveal mode="ready" className="cxh__eyebrow">
          <span className="micro micro--gold">The collections</span>
          <i />
          <span className="micro">
            N° 01 — {pad(collections.length)} · {pieces.length} pieces
          </span>
        </Reveal>
        <SplitTitle as="h1" className="cxh__title" mode="ready" lines={["Four ways to", <em key="e">carry the light.</em>]} />
        <Reveal mode="ready" delay={0.3} className="cxh__aside">
          <p>Solitaire, Eternity, Lumière and Heritage. Four houses of fine jewellery, each piece made to order and finished by hand at our bench.</p>
          <button className="link-arrow" onClick={() => go("salon")}>
            Browse all {pieces.length} pieces <span>↓</span>
          </button>
        </Reveal>
      </div>

      <div className="cxh__arches" onPointerLeave={() => setOpen(0)}>
        {collections.map((c, i) => (
          <button
            key={c.slug}
            type="button"
            className={`cxh__arch${i === open ? " is-open" : ""}`}
            onPointerEnter={() => setOpen(i)}
            onFocus={() => setOpen(i)}
            onClick={() => go(`col-${c.slug}`)}
            data-cursor="Explore"
          >
            <Photo img={IMG[c.image]} className="cxh__photo" sizes="(max-width: 720px) 90vw, 40vw" reveal={false} parallax={0} priority={i < 2} />
            <span className="cxh__shade" />
            <span className="cxh__num micro">N° {c.index}</span>
            <span className="cxh__label">
              <span className="micro">{c.kicker}</span>
              <span className="cxh__name">{c.name}</span>
              <span className="cxh__intro">{c.intro}</span>
              <span className="cxh__more micro">
                {piecesIn(c.slug).length} pieces <i>→</i>
              </span>
            </span>
          </button>
        ))}
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ 2. Stacked chapters */

function Chapter({ c, i }: { c: Collection; i: number }) {
  const [metal, setMetal] = useState<Metal>(c.metal);
  const list = piecesIn(c.slug);
  // The arch shows the collection's piece in the chosen metal.
  const shown = list.find((p) => p.metal === metal) ?? list[0];

  return (
    <article id={`col-${c.slug}`} className="cst" style={{ ["--tint" as string]: c.tint, zIndex: i + 1 }}>
      <div className="cst__inner">
        <span className="cst__water" aria-hidden="true">
          {c.index}
        </span>

        <div className="cst__copy">
          <div className="cst__meta">
            <span className="micro micro--gold">N° {c.index}</span>
            <i />
            <span className="micro">{c.kicker}</span>
          </div>
          <h2 className="cst__title">
            {c.title[0]} <em>{c.title[1]}</em>
          </h2>
          <p className="cst__intro">{c.intro}</p>
          <p className="cst__desc">{c.description}</p>

          <ul className="cst__list">
            {list.map((p, k) => (
              <li key={p.slug}>
                <TLink href={`/pieces/${p.slug}`}>
                  <span className="cst__k micro">{pad(k + 1)}</span>
                  <span className="cst__pname">{p.name}</span>
                  <span className="cst__tag">{p.tagline}</span>
                  <span className="cst__price">{formatPrice(p.price)}</span>
                  <span className="cst__go" aria-hidden="true">→</span>
                </TLink>
              </li>
            ))}
          </ul>

          <TLink href={`/collections/${c.slug}`} className="link-arrow cst__cta">
            Explore {c.name} <span>→</span>
          </TLink>
        </div>

        <div className="cst__stage">
          <TLink href={`/pieces/${shown.slug}`} className="cst__arch" data-cursor="View">
            {list.map((p) => (
              <Photo
                key={p.slug}
                img={IMG[p.image]}
                className={`cst__view${p === shown ? " is-on" : ""}`}
                sizes="(max-width: 1100px) 80vw, 34vw"
                reveal={false}
                parallax={0.08}
              />
            ))}
            <span className="cst__ring" aria-hidden="true" />
            <span className="cst__metal micro">
              {shown.name} · {METALS[shown.metal].label}
            </span>
          </TLink>
          <Photo img={IMG[c.image]} className="cst__photo" sizes="(max-width: 1100px) 40vw, 14vw" parallax={0.15} />
          <div className="cst__swatches" role="radiogroup" aria-label={`${c.name} metal`}>
            {METAL_KEYS.map((m) => (
              <button
                key={m}
                type="button"
                role="radio"
                aria-checked={metal === m}
                aria-label={METALS[m].label}
                className={metal === m ? "is-on" : undefined}
                onClick={() => setMetal(m)}
              >
                <i style={{ background: METALS[m].swatch }} />
              </button>
            ))}
          </div>
        </div>
      </div>
    </article>
  );
}

export function CollectionsStack() {
  const root = useRef<HTMLElement>(null);
  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add("(min-width: 1101px)", () => {
        const cards = gsap.utils.toArray<HTMLElement>(".cst", root.current);
        cards.forEach((card, i) => {
          const next = cards[i + 1];
          if (!next) return;
          gsap.to(card.querySelector(".cst__inner"), {
            scale: 0.9,
            yPercent: -4,
            opacity: 0.35,
            ease: "none",
            scrollTrigger: { trigger: next, start: "top bottom", end: "top top", scrub: true },
          });
        });
      });
    },
    { scope: root }
  );

  return (
    <section ref={root} className="cstack" aria-label="The four collections">
      {collections.map((c, i) => (
        <Chapter key={c.slug} c={c} i={i} />
      ))}
    </section>
  );
}

/* ------------------------------------------------------------------ 3. Salon: every piece */

export function CollectionsSalon() {
  const [coll, setColl] = useState("all");
  const [metal, setMetal] = useState<"all" | Metal>("all");
  const shown = useMemo(
    () => pieces.filter((p) => (coll === "all" || p.collection === coll) && (metal === "all" || p.metal === metal)),
    [coll, metal]
  );

  return (
    <section className="cshop" id="salon">
      <div className="cshop__head">
        <div className="cshop__title">
          <span className="eyebrow eyebrow--gold">The salon</span>
          <SplitTitle className="h2" lines={["Every piece,", <em key="e">made to order.</em>]} />
        </div>
        <Reveal className="cshop__filters">
          <div className="cshop__tabs" role="tablist" aria-label="Collection">
            {[{ slug: "all", name: "All" }, ...collections].map((c) => (
              <button
                key={c.slug}
                type="button"
                role="tab"
                aria-selected={coll === c.slug}
                className={coll === c.slug ? "is-on" : undefined}
                onClick={() => setColl(c.slug)}
              >
                {c.name}
                <sup>{pad(c.slug === "all" ? pieces.length : piecesIn(c.slug).length)}</sup>
              </button>
            ))}
          </div>
          <div className="cshop__row">
            <div className="cshop__metals" role="radiogroup" aria-label="Metal">
              <button type="button" role="radio" aria-checked={metal === "all"} className={metal === "all" ? "is-on" : undefined} onClick={() => setMetal("all")}>
                All metals
              </button>
              {METAL_KEYS.map((m) => (
                <button key={m} type="button" role="radio" aria-checked={metal === m} className={metal === m ? "is-on" : undefined} onClick={() => setMetal(m)}>
                  <i style={{ background: METALS[m].swatch }} />
                  {METALS[m].label.replace("18k ", "")}
                </button>
              ))}
            </div>
            <span className="cshop__count micro" aria-live="polite">
              Showing <b>{pad(shown.length)}</b> / {pad(pieces.length)}
            </span>
          </div>
        </Reveal>
      </div>

      <div className="cshop__grid" key={`${coll}-${metal}`}>
        {shown.map((p, i) => {
          const c = collections.find((x) => x.slug === p.collection)!;
          return (
            <TLink
              key={p.slug}
              href={`/pieces/${p.slug}`}
              className="cpiece has-worn"
              style={{ ["--i" as string]: i, ["--tint" as string]: c.tint }}
              data-cursor="View"
            >
              <div className="cpiece__media">
                <PiecePhoto image={IMG[p.image]} worn={IMG[p.worn]} className="cpiece__view" sizes="(max-width: 720px) 90vw, (max-width: 1100px) 45vw, 30vw" />
                <span className="cpiece__coll micro">{c.name}</span>
                <span className="cpiece__dot" style={{ background: METALS[p.metal].swatch }} title={METALS[p.metal].label} />
                <span className="cpiece__go" aria-hidden="true">→</span>
              </div>
              <div className="cpiece__body">
                <h3>{p.name}</h3>
                <span className="cpiece__price">{formatPrice(p.price)}</span>
                <p>{p.tagline}</p>
                <span className="cpiece__metal micro">{METALS[p.metal].label}</span>
              </div>
            </TLink>
          );
        })}
      </div>

      {shown.length === 0 && (
        <div className="cshop__empty">
          <p className="h3">
            Nothing in that <em>combination</em> — yet.
          </p>
          <p>Any piece can be made in another metal. Ask us at your appointment.</p>
          <button
            type="button"
            className="link-arrow"
            onClick={() => {
              setColl("all");
              setMetal("all");
            }}
          >
            Show everything <span>→</span>
          </button>
        </div>
      )}
    </section>
  );
}

/* ------------------------------------------------------------------ 4. Standards */

const STANDARDS = [
  { title: "Recycled gold & platinum", text: "All of our gold and platinum is recycled and refined to the same purity as newly mined metal, with a fraction of the impact.", tag: "Recycled & refined" },
  { title: "Traceable diamonds", text: "Every diamond is conflict-free and traceable, and comes with a grading report. We know where our stones come from.", tag: "Grading report included" },
  { title: "Made by hand, to order", text: "Nothing waits on a shelf. Each piece is made for you at our bench, in your size and your choice of metal.", tag: "Made to order · 3–5 weeks" },
  { title: "Lifetime care", text: "We build every piece to be worn every day and repaired, not replaced. Lifetime care is included with everything we make.", tag: "Included with every piece" },
];

export function CollectionsStandards() {
  return (
    <section className="cprom">
      <div className="cprom__side">
        <span className="eyebrow eyebrow--gold">Our standards</span>
        <SplitTitle className="h2" lines={["Made the", <em key="e">slow way.</em>]} />
        <Photo img={IMG.setting} className="cprom__photo" sizes="(max-width: 1100px) 60vw, 26vw" parallax={0.12} />
      </div>
      <Reveal as="div" className="cprom__list" stagger={0.1}>
        {STANDARDS.map((s, i) => (
          <article key={s.title} className="cprom__item">
            <span className="cprom__n">{pad(i + 1)}</span>
            <div>
              <h3>{s.title}</h3>
              <p>{s.text}</p>
              <span className="micro micro--gold">{s.tag}</span>
            </div>
          </article>
        ))}
      </Reveal>
    </section>
  );
}

/* ------------------------------------------------------------------ Page */

export function CollectionsView() {
  return (
    <>
      <CollectionsHero />
      <CollectionsStack />
      <CollectionsSalon />
      <CollectionsStandards />
      <CtaBand
        title={["Don't see", "quite the one?"]}
        text="Any piece can be made in another metal, with a different band width or centre stone. Or start from a blank page with one of our makers."
        href="/bespoke"
        label="Start a bespoke commission"
      />
    </>
  );
}
