"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useLenis } from "lenis/react";
import { collections, pieces, piecesIn, formatPrice, METALS, type Collection, type Metal, type Piece } from "@/lib/data";
import { gsap, ScrollTrigger, useGSAP } from "@/lib/gsap";
import { Photo, PiecePhoto } from "./Photo";
import { IMG, type ImgKey } from "@/lib/images";
import { TLink, usePageTransition } from "./Transition";
import { Marquee, Reveal, SplitTitle } from "./anim";
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

/** Scrolls to chapter `i`. On desktop the chapters sit along a pinned track, so each one is a point along the pin's scroll distance. */
function useChapterScroll() {
  const lenis = useLenis();
  const scrollTo = useScrollTo();
  return (i: number) => {
    const pin = ScrollTrigger.getById("cstack");
    if (!pin) return scrollTo(`col-${collections[i].slug}`);
    const y = pin.start + (pin.end - pin.start) * (i / (collections.length - 1));
    if (lenis) lenis.scrollTo(y, { duration: 1.8 });
    else window.scrollTo({ top: y, behavior: "smooth" });
  };
}

/* ------------------------------------------------------------------ 1. Hero: the vitrine */

/** How long each collection holds the window before the next one is drawn up. */
const HOLD = 6;

/** A collection's name as a row of letters that rise in (or lift out) one after another. */
function Word({ text, state }: { text: string; state: "in" | "out" }) {
  return (
    <span className={`cvx__word is-${state}`} aria-hidden="true">
      {[...text].map((ch, i) => (
        <span key={i} style={{ ["--d" as string]: i }}>
          {ch}
        </span>
      ))}
    </span>
  );
}

export function CollectionsHero() {
  const root = useRef<HTMLElement>(null);
  const front = useRef<HTMLDivElement>(null);
  const arch = useRef<HTMLButtonElement>(null);
  const go = useScrollTo();
  const goChapter = useChapterScroll();
  const { ready } = usePageTransition();
  const [{ active, prev }, setShown] = useState({ active: 0, prev: -1 });
  const [paused, setPaused] = useState(false);
  const c = collections[active];
  const list = piecesIn(c.slug);
  const from = Math.min(...list.map((p) => p.price ?? Infinity));

  const show = (i: number) => setShown((s) => (i === s.active ? s : { active: i, prev: s.active }));
  const next = () => show((active + 1) % collections.length);

  // The front copy of the name is clipped to the arch, so the letters turn to paper where they cross the photograph.
  useEffect(() => {
    const s = front.current!;
    const a = arch.current!;
    const fit = () => {
      const S = s.getBoundingClientRect();
      const A = a.getBoundingClientRect();
      const r = A.width / 2;
      s.style.setProperty(
        "--clip",
        `inset(${A.top - S.top}px ${S.right - A.right}px ${S.bottom - A.bottom}px ${A.left - S.left}px round ${r}px ${r}px 0 0)`
      );
    };
    fit();
    const ro = new ResizeObserver(fit);
    ro.observe(s);
    ro.observe(a);
    return () => ro.disconnect();
  }, []);

  useGSAP(
    () => {
      if (!ready) return;
      const tl = gsap.timeline({ delay: 0.15 });
      tl.fromTo(".cvx__arch", { clipPath: "inset(100% 0% 0% 0%)" }, { clipPath: "inset(0% 0% 0% 0%)", duration: 1.8, ease: "expo.inOut", clearProps: "clipPath" })
        .fromTo(".cvx__arch .is-on img", { scale: 1.35 }, { scale: 1, duration: 2.4, ease: "expo.out" }, 0.5)
        .fromTo(".cvx__slide", { yPercent: 40, opacity: 0 }, { yPercent: 0, opacity: 1, duration: 1.6, ease: "expo.out" }, 1)
        .fromTo(".cvx__in", { opacity: 0, y: 24 }, { opacity: 1, y: 0, duration: 1.2, ease: "expo.out", stagger: 0.08 }, 1.1);

      // On the way out the name slides sideways and the window lifts, so the page seems to move past it.
      const st = { trigger: root.current, start: "top top", end: "bottom top", scrub: true };
      gsap.to(".cvx__type .cvx__slide", { xPercent: -12, ease: "none", scrollTrigger: st });
      gsap.to(".cvx__aside, .cvx__index", { y: -80, opacity: 0, ease: "none", scrollTrigger: { ...st, end: "60% top" } });
    },
    { scope: root, dependencies: [ready] }
  );

  return (
    <section ref={root} className="cvx">
      <div className="cvx__bar cvx__in">
        <span className="micro micro--gold">The collections</span>
        <i />
        <span className="micro">{pieces.length} pieces · made to order</span>
        <span className="cvx__count micro" aria-live="polite">
          <b key={active}>{c.index}</b> / {pad(collections.length)}
        </span>
      </div>

      <div className="cvx__stage">
        <h1 className="cvx__sr">Four ways to carry the light: the Western Jewellers collections</h1>

        {/* Behind the arch */}
        <div className="cvx__type">
          <span className="cvx__slide">
            {prev >= 0 && <Word key={`o${prev}-${active}`} text={collections[prev].name} state="out" />}
            <Word key={`i${active}`} text={c.name} state="in" />
          </span>
        </div>

        <button
          ref={arch}
          type="button"
          className="cvx__arch"
          onPointerEnter={() => setPaused(true)}
          onPointerLeave={() => setPaused(false)}
          onClick={() => goChapter(active)}
          data-cursor="Explore"
          aria-label={`Explore ${c.name}`}
        >
          {collections.map((x, i) => (
            <Photo
              key={x.slug}
              img={IMG[x.image]}
              className={`cvx__photo${i === active ? " is-on" : i === prev ? " is-prev" : ""}`}
              sizes="(max-width: 720px) 80vw, 32vw"
              reveal={false}
              parallax={0.12}
              priority={i === 0}
            />
          ))}
          <span className="cvx__shade" />
          <span className="cvx__ring" />
          <span className="cvx__num micro">N° {c.index}</span>
        </button>

        {/* In front of the arch, clipped to it */}
        <div ref={front} className="cvx__type cvx__type--front" aria-hidden="true">
          <span className="cvx__slide">
            {prev >= 0 && <Word key={`o${prev}-${active}`} text={collections[prev].name} state="out" />}
            <Word key={`i${active}`} text={c.name} state="in" />
          </span>
        </div>

        <ol className="cvx__index" aria-label="Collections" onPointerEnter={() => setPaused(true)} onPointerLeave={() => setPaused(false)}>
          {collections.map((x, i) => (
            <li key={x.slug} className="cvx__in">
              <button
                type="button"
                className={i === active ? "is-on" : undefined}
                aria-current={i === active}
                onPointerEnter={() => show(i)}
                onFocus={() => show(i)}
                onClick={() => goChapter(i)}
              >
                <span className="micro">{x.index}</span>
                <span className="cvx__iname">{x.name}</span>
                <span className="cvx__track">
                  {i === active && (
                    <i key={active} className="cvx__prog" style={{ animationDuration: `${HOLD}s`, animationPlayState: paused ? "paused" : "running" }} onAnimationEnd={next} />
                  )}
                </span>
              </button>
            </li>
          ))}
        </ol>

        <div className="cvx__aside">
          <div key={active} className="cvx__meta cvx__in">
            <span className="micro micro--gold">{c.kicker}</span>
            <p className="cvx__intro">{c.intro}</p>
            <span className="micro">
              {pad(list.length)} pieces{Number.isFinite(from) && <> · from {formatPrice(from)}</>}
            </span>
          </div>
          <button type="button" className="link-arrow cvx__in" onClick={() => goChapter(active)}>
            Explore {c.name} <span>→</span>
          </button>
        </div>

        <svg className="cvx__seal" viewBox="0 0 120 120" aria-hidden="true">
          <defs>
            <path id="cvx-seal" d="M60 60 m-47 0 a47 47 0 1 1 94 0 a47 47 0 1 1 -94 0" />
          </defs>
          <text>
            <textPath href="#cvx-seal">Made by hand · Made to order · Made for life ·</textPath>
          </text>
          <path d="M60 46 L66 60 L60 74 L54 60 Z" />
        </svg>
      </div>

      <div className="cvx__foot cvx__in">
        <button type="button" className="cvx__scroll" onClick={() => go("salon")}>
          <i />
          <span className="micro">Browse all {pieces.length} pieces</span>
        </button>
        <ul className="cvx__facts">
          {FACTS.map(([n, l]) => (
            <li key={l}>
              <b>{n}</b>
              <span className="micro">{l}</span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

const FACTS = [
  [pad(collections.length), "Houses"],
  ["3–5", "Weeks at the bench"],
  ["18k", "Recycled gold"],
  ["∞", "Lifetime care"],
] as const;

/* ------------------------------------------------------------------ Manifesto */

// Small photographs are set into the sentence between the words, like stones in a band.
const MANIFESTO: (string | ImgKey)[] = [
  "Nothing here waited on a shelf.",
  "benchExamine",
  "Every ring, band, pendant and bangle is cut, set",
  "setting",
  "and polished by hand once you choose it, so that it fits one person",
  "handsBands",
  "and no one else.",
];

export function CollectionsManifesto() {
  const ref = useRef<HTMLDivElement>(null);
  useGSAP(
    () => {
      const st = { trigger: ref.current, start: "top 80%", end: "bottom 45%", scrub: true };
      gsap.to(ref.current!.querySelectorAll(".w"), { opacity: 1, ease: "none", stagger: 0.1, scrollTrigger: st });
      gsap.fromTo(".cman__pill", { width: 0 }, { width: "2.3em", ease: "none", stagger: 0.3, scrollTrigger: { ...st, end: "bottom 60%" } });
    },
    { scope: ref }
  );
  return (
    <section className="cman">
      <div className="cman__side">
        <span className="eyebrow eyebrow--gold">The house</span>
        <span className="cman__rule" aria-hidden="true" />
      </div>
      <div className="cman__body">
        <div ref={ref} className="words cman__text">
          {MANIFESTO.map((t, k) =>
            t in IMG ? (
              <span key={k} className="cman__pill" aria-hidden="true">
                <Photo img={IMG[t as ImgKey]} sizes="140px" reveal={false} parallax={0} />
              </span>
            ) : (
              t.split(" ").map((w, i) => (
                <span className="w" key={`${k}-${i}`}>
                  {w}{" "}
                </span>
              ))
            )
          )}
        </div>
        <TLink href="/maison" className="link-arrow">
          Meet the makers <span>→</span>
        </TLink>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ 2. Stacked chapters */

function Chapter({ c }: { c: Collection }) {
  const [metal, setMetal] = useState<Metal>(c.metal);
  const list = piecesIn(c.slug);
  // The arch shows the collection's piece in the chosen metal.
  const shown = list.find((p) => p.metal === metal) ?? list[0];

  return (
    <article id={`col-${c.slug}`} className="cst" style={{ ["--tint" as string]: c.tint }}>
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
  const goChapter = useChapterScroll();

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      // Desktop: the four chapters are laid out side by side and the section pins while they slide past.
      mm.add("(min-width: 1101px)", () => {
        const track = root.current!.querySelector<HTMLElement>(".cstack__track")!;
        const dist = () => Math.max(0, track.scrollWidth - window.innerWidth);
        const tween = gsap.to(track, {
          x: () => -dist(),
          ease: "none",
          scrollTrigger: {
            id: "cstack",
            trigger: ".cstack__pin",
            start: "top top",
            end: () => "+=" + dist(),
            pin: true,
            scrub: 1,
            invalidateOnRefresh: true,
            anticipatePin: 1,
            onUpdate: (s) => {
              gsap.set(".cstack__bar span", { scaleX: s.progress });
              root.current!.dataset.active = String(Math.round(s.progress * (collections.length - 1)));
            },
          },
        });
        // Each arch settles into place as its chapter arrives. The first is already in view, so it stays put.
        gsap.utils.toArray<HTMLElement>(".cst__arch", root.current).forEach((arch, i) => {
          if (i === 0) return;
          gsap.fromTo(
            arch,
            { yPercent: 12, scale: 0.92, opacity: 0.4 },
            {
              yPercent: 0,
              scale: 1,
              opacity: 1,
              ease: "none",
              scrollTrigger: { trigger: arch, containerAnimation: tween, start: "left 85%", end: "center center", scrub: true },
            }
          );
        });
      });
    },
    { scope: root }
  );

  return (
    <section ref={root} className="cstack" aria-label="The four collections" data-active="0">
      <div className="cstack__pin">
        <div className="cstack__track">
          {collections.map((c) => (
            <Chapter key={c.slug} c={c} />
          ))}
        </div>

        <div className="cstack__rail">
          <div className="cstack__ticks">
            {collections.map((c, i) => (
              <button key={c.slug} type="button" className="cstack__tick" onClick={() => goChapter(i)}>
                <span className="micro">N° {c.index}</span>
                <span className="cstack__tick-name">{c.name}</span>
              </button>
            ))}
          </div>
          <div className="cstack__bar" aria-hidden="true">
            <span />
          </div>
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ 3. Salon: every piece */

/** The salon as a typeset list. A photograph of the piece under the pointer trails after it. */
function SalonIndex({ list }: { list: Piece[] }) {
  const root = useRef<HTMLDivElement>(null);
  const [on, setOn] = useState(-1);
  const follow = useRef<((x: number, y: number) => void) | null>(null);

  useGSAP(
    () => {
      const f = root.current!.querySelector(".cidx__float");
      const x = gsap.quickTo(f, "x", { duration: 0.8, ease: "power3" });
      const y = gsap.quickTo(f, "y", { duration: 0.8, ease: "power3" });
      const r = gsap.quickTo(f, "rotation", { duration: 0.9, ease: "power3" });
      let last = 0;
      follow.current = (px, py) => {
        x(px);
        y(py);
        // Leans into the direction of travel, then rights itself.
        r(gsap.utils.clamp(-8, 8, (px - last) * 0.4));
        last = px;
      };
    },
    { scope: root }
  );

  return (
    <div
      ref={root}
      className={`cidx${on >= 0 ? " is-hovering" : ""}`}
      onPointerMove={(e) => {
        const b = root.current!.getBoundingClientRect();
        follow.current?.(e.clientX - b.left, e.clientY - b.top);
      }}
      onPointerLeave={() => setOn(-1)}
    >
      <div className="cidx__head micro" aria-hidden="true">
        <span>N°</span>
        <span>Piece</span>
        <span>Collection</span>
        <span>Metal</span>
        <span>Price</span>
      </div>
      {list.map((p, i) => {
        const c = collections.find((x) => x.slug === p.collection)!;
        return (
          <TLink
            key={p.slug}
            href={`/pieces/${p.slug}`}
            className={`cidx__row${i === on ? " is-on" : ""}`}
            style={{ ["--i" as string]: i }}
            onPointerEnter={() => setOn(i)}
            onFocus={() => setOn(i)}
            data-cursor="View"
          >
            <span className="cidx__n micro">{pad(i + 1)}</span>
            <span className="cidx__thumb">
              <Photo img={IMG[p.image]} sizes="96px" reveal={false} parallax={0} />
            </span>
            <span className="cidx__name">{p.name}</span>
            <span className="cidx__coll">
              <em>{c.name}</em>
              <span>{p.tagline}</span>
            </span>
            <span className="cidx__metal micro">
              <i style={{ background: METALS[p.metal].swatch }} />
              {METALS[p.metal].label.replace("18k ", "")}
            </span>
            <span className="cidx__price">{formatPrice(p.price)}</span>
            <span className="cidx__go" aria-hidden="true">→</span>
          </TLink>
        );
      })}
      <div className="cidx__float" aria-hidden="true">
        <div className="cidx__card">
          {list.map((p, i) => (
            <Photo key={p.slug} img={IMG[p.image]} className={i === on ? "is-on" : undefined} sizes="22vw" reveal={false} parallax={0} />
          ))}
        </div>
      </div>
    </div>
  );
}

export function CollectionsSalon() {
  const [coll, setColl] = useState("all");
  const [metal, setMetal] = useState<"all" | Metal>("all");
  const [view, setView] = useState<"grid" | "index">("grid");
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
            <div className="cshop__view">
              <span className="cshop__count micro" aria-live="polite">
                Showing <b>{pad(shown.length)}</b> / {pad(pieces.length)}
              </span>
              <div className="cshop__toggle" role="radiogroup" aria-label="View">
                {(["grid", "index"] as const).map((v) => (
                  <button key={v} type="button" role="radio" aria-checked={view === v} className={view === v ? "is-on" : undefined} onClick={() => setView(v)}>
                    {v}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </Reveal>
      </div>

      {view === "index" && shown.length > 0 && <SalonIndex key={`${coll}-${metal}`} list={shown} />}

      {view === "grid" && (
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
                <div className="cpiece__top micro">
                  <span>N° {pad(i + 1)}</span>
                  <span>{c.name}</span>
                </div>
                <div className="cpiece__media">
                  <PiecePhoto image={IMG[p.image]} worn={IMG[p.worn]} className="cpiece__view" sizes="(max-width: 720px) 90vw, (max-width: 1100px) 45vw, 30vw" />
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
      )}

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
      <Marquee label="The collections" items={collections.map((c) => <em key={c.slug}>{c.name}</em>)} />
      <CollectionsManifesto />
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
