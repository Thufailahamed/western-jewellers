"use client";

import { Fragment, useRef, useState } from "react";
import { DEVELOP, gsap, ScrollTrigger, useGSAP } from "@/lib/gsap";
import { Photo } from "./Photo";
import { IMG, type ImgKey } from "@/lib/images";
import { JewelView } from "./three/JewelView";
import { usePageTransition } from "./Transition";
import { SplitTitle } from "./anim";
import { useLenis } from "lenis/react";

/* ------------------------------------------------------------------ Hero: arch that opens to full-bleed */

export function MaisonHero() {
  const root = useRef<HTMLElement>(null);
  const { ready } = usePageTransition();

  useGSAP(
    () => {
      const q = gsap.utils.selector(root);
      const arch = () => {
        const vw = window.innerWidth;
        const vh = window.innerHeight;
        const w = Math.min(vw * (vw < 721 ? 0.62 : 0.28), vh * 0.48);
        const h = w * 1.32;
        const top = vw < 721 ? vh * 0.2 : Math.max((vh - h) / 2 + vh * 0.04, 0);
        const side = (vw - w) / 2;
        return `inset(${top}px ${side}px ${Math.max(vh - top - h, 0)}px ${side}px round ${w / 2}px ${w / 2}px 0px 0px)`;
      };
      gsap.set(q(".mhero__frame"), { clipPath: arch });

      const tl = gsap.timeline({
        scrollTrigger: { trigger: root.current, start: "top top", end: "bottom bottom", scrub: 1, invalidateOnRefresh: true },
      });
      tl.fromTo(q(".mhero__frame"), { clipPath: arch }, { clipPath: "inset(0px 0px 0px 0px round 0px 0px 0px 0px)", ease: "power1.inOut", duration: 1 }, 0)
        .fromTo(q(".mhero__frame .photo__inner"), { scale: 1.3 }, { scale: 1, ease: "none", duration: 1 }, 0)
        .to(q(".mhero__word--a"), { xPercent: -24, opacity: 0, ease: "power1.in", duration: 0.6 }, 0)
        .to(q(".mhero__word--b"), { xPercent: 24, opacity: 0, ease: "power1.in", duration: 0.6 }, 0)
        .to(q(".mhero__meta"), { opacity: 0, duration: 0.3 }, 0)
        .fromTo(q(".mhero__shade"), { opacity: 0 }, { opacity: 1, duration: 0.4 }, 0.6)
        .fromTo(q(".mhero__over > *"), { opacity: 0, y: 40 }, { opacity: 1, y: 0, stagger: 0.06, duration: 0.3 }, 0.72);

      if (!ready) return;
      gsap.fromTo(q(".mhero__word .ln > span"), { yPercent: 110, y: 0 }, { yPercent: 0, duration: 1.5, ease: "expo.out", stagger: 0.12, delay: 0.15 });
      gsap.fromTo(q(".mhero__reveal"), DEVELOP.from, DEVELOP.to);
      gsap.fromTo(q(".mhero__meta"), { opacity: 0, y: 14 }, { opacity: 1, y: 0, duration: 1, ease: "power2.out", stagger: 0.08, delay: 0.7 });
    },
    { scope: root, dependencies: [ready] }
  );

  return (
    <section ref={root} className="mhero">
      <div className="mhero__stage">
        <div className="mhero__frame">
          <div className="mhero__reveal">
            <Photo img={IMG.benchPortrait} sizes="100vw" reveal={false} parallax={0} priority />
          </div>
          <div className="mhero__shade" />
        </div>

        <h1 className="mhero__title">
          <span className="mhero__word mhero__word--a">
            <span className="ln">
              <span>Three generations,</span>
            </span>
          </span>
          <span className="mhero__word mhero__word--b">
            <span className="ln">
              <span>
                <em>one bench.</em>
              </span>
            </span>
          </span>
        </h1>

        <span className="mhero__meta mhero__meta--tl micro">
          <span className="micro--gold">The Maison</span>
          <i />
          <span>Our story</span>
        </span>
        <span className="mhero__meta mhero__meta--bl micro">Drawn, made &amp; finished by hand</span>
        <span className="mhero__meta mhero__meta--br micro">
          Scroll to enter <i />
        </span>

        <div className="mhero__over">
          <span className="micro">Since the first bench</span>
          <p>Western Jewellers began with a single workbench. It has grown since, but the work has not changed.</p>
          <span className="micro">Every piece is still drawn, made and finished by hand.</span>
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ Manifesto with inline photographs */

type Token = string | { img: ImgKey };
const MANIFESTO: Token[] = [
  "A jewel should hold",
  { img: "handSolitaire" },
  "a memory as well as the light. So we make things",
  { img: "makerSaw" },
  "slowly, choose every stone",
  { img: "haloRing" },
  "by eye, and stand behind our work for as long as it is",
  { img: "neckPendant" },
  "worn.",
];

export function Manifesto() {
  const root = useRef<HTMLElement>(null);
  useGSAP(
    () => {
      const q = gsap.utils.selector(root);
      const st = { trigger: q(".mani__text")[0], start: "top 78%", end: "bottom 50%", scrub: true };
      gsap.to(q(".mani__w"), { opacity: 1, ease: "none", stagger: 0.1, scrollTrigger: st });
      gsap.fromTo(q(".mani__pill"), { width: 0 }, { width: "2.3em", ease: "none", stagger: 0.25, scrollTrigger: st });
      gsap.fromTo(q(".mani__medal"), { yPercent: 30 }, { yPercent: -30, ease: "none", scrollTrigger: { trigger: root.current, start: "top bottom", end: "bottom top", scrub: true } });
    },
    { scope: root }
  );

  return (
    <section ref={root} className="mani">
      <div className="mani__head">
        <span className="eyebrow eyebrow--gold">Our belief</span>
        <span className="micro">N° 01 — Manifesto</span>
      </div>
      <div className="mani__text">
        {MANIFESTO.map((t, i) =>
          typeof t === "string" ? (
            <Fragment key={i}>
              {t.split(" ").map((w, j) => (
                <span key={j} className="mani__w">
                  {w}{" "}
                </span>
              ))}
            </Fragment>
          ) : (
            <Fragment key={i}>
              <span className="mani__pill" aria-hidden="true">
                <Photo img={IMG[t.img]} sizes="120px" reveal={false} parallax={0} />
              </span>{" "}
            </Fragment>
          )
        )}
      </div>
      <div className="mani__medal" style={{ ["--tint" as string]: "#e9dfcc" }}>
        <JewelView className="mani__view" kind="bangle" metal="yellow" />
        <span className="micro">Heritage bangle · Recycled gold</span>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ Chapters: sticky frame + scrolling story */

const CHAPTERS: { n: string; era: string; title: [string, string]; text: string; note: string; img: ImgKey }[] = [
  { n: "I", era: "The beginning", title: ["The first", "bench"], text: "A single workbench, a handful of tools, and a promise to make every piece by hand.", note: "One maker · One bench", img: "workshop" },
  { n: "II", era: "The atelier", title: ["A second", "generation"], text: "The workshop grows into an atelier, and bespoke engagement rings become the heart of the house.", note: "Bespoke at the heart", img: "makerLoupe" },
  { n: "III", era: "A signature", title: ["The", "Aurelia"], text: "Our six-claw cathedral solitaire is drawn for the first time. It is still our most requested ring.", note: "Six claws · Cathedral setting", img: "handRing" },
  { n: "IV", era: "Today", title: ["Three", "generations"], text: "Three generations of makers at the same bench, still drawing every commission by hand.", note: "Still drawn by hand", img: "benchWoman" },
];

export function Chapters() {
  const root = useRef<HTMLElement>(null);
  const [active, setActive] = useState(0);
  const lenis = useLenis();

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      // Desktop: the whole section pins and scroll progress picks the chapter.
      mm.add("(min-width: 1101px)", () => {
        const fill = root.current!.querySelector<HTMLElement>(".story__fill");
        ScrollTrigger.create({
          trigger: root.current,
          start: "top top",
          end: "bottom bottom",
          onUpdate: (s) => {
            gsap.set(fill, { scaleY: s.progress });
            setActive(Math.min(CHAPTERS.length - 1, Math.floor(s.progress * CHAPTERS.length)));
          },
        });
        gsap.fromTo(
          root.current!.querySelector(".story__ring"),
          { rotate: -40 },
          { rotate: 220, ease: "none", scrollTrigger: { trigger: root.current, start: "top top", end: "bottom bottom", scrub: 1 } }
        );
      });
      // Mobile: a plain stacked list that rises in as it arrives.
      mm.add("(max-width: 1100px)", () => {
        gsap.utils.toArray<HTMLElement>(".chap", root.current).forEach((el) => {
          gsap.fromTo(el.querySelectorAll(".chap__in"), { opacity: 0, y: 40 }, { opacity: 1, y: 0, duration: 1.2, ease: "expo.out", stagger: 0.08, scrollTrigger: { trigger: el, start: "top 80%" } });
        });
      });
    },
    { scope: root }
  );

  const goTo = (i: number) => {
    const el = root.current;
    if (!el) return;
    const top = el.getBoundingClientRect().top + window.scrollY;
    const y = top + ((i + 0.5) / CHAPTERS.length) * (el.offsetHeight - window.innerHeight);
    if (lenis) lenis.scrollTo(y, { duration: 1.6 });
    else window.scrollTo({ top: y, behavior: "smooth" });
  };

  const next = CHAPTERS[active + 1];

  return (
    <section ref={root} className="story" style={{ ["--count" as string]: CHAPTERS.length }}>
      <div className="story__stage">
        <div className="story__ghost" aria-hidden="true">
          {CHAPTERS.map((c, i) => (
            <span key={c.n} className={i === active ? "is-on" : i < active ? "is-past" : undefined}>
              {c.n}
            </span>
          ))}
        </div>

        <header className="story__head">
          <span className="eyebrow eyebrow--gold">History</span>
          <SplitTitle className="h2" lines={["Our", <em key="e">story.</em>]} />
        </header>

        <div className="story__count" aria-hidden="true">
          <span className="story__count-n">
            {CHAPTERS.map((c, i) => (
              <b key={c.n} className={i === active ? "is-on" : i < active ? "is-past" : undefined}>
                0{i + 1}
              </b>
            ))}
          </span>
          <i />
          <span className="micro">0{CHAPTERS.length}</span>
        </div>

        <figure className="story__visual" aria-hidden="true">
          <div className="story__art">
            <div className="story__frame">
              {CHAPTERS.map((c, i) => (
                <div key={c.n} className={`story__slide${i === active ? " is-on" : ""}${i < active ? " is-past" : ""}`}>
                  <Photo img={IMG[c.img]} sizes="(max-width: 1100px) 80vw, 34vw" reveal={false} parallax={0} />
                </div>
              ))}
              <span className="story__shade" />
            </div>
            <svg className="story__ring" viewBox="0 0 200 200">
              <defs>
                <path id="story-ring" d="M100,100 m-82,0 a82,82 0 1,1 164,0 a82,82 0 1,1 -164,0" />
              </defs>
              <text>
                <textPath href="#story-ring">Western Jewellers · Since the first bench · Made by hand · </textPath>
              </text>
            </svg>
            <span className="story__seal">
              {CHAPTERS.map((c, i) => (
                <em key={c.n} className={i === active ? "is-on" : i < active ? "is-past" : undefined}>
                  {c.n}
                </em>
              ))}
            </span>
          </div>
          <figcaption className="story__fig micro">
            Fig. {CHAPTERS[active].n} — {IMG[CHAPTERS[active].img].alt}
          </figcaption>
        </figure>

        <nav className="story__rail" aria-label="Chapters">
          <span className="story__track">
            <span className="story__fill" />
          </span>
          {CHAPTERS.map((c, i) => (
            <button
              key={c.n}
              type="button"
              className={i === active ? "is-on" : i < active ? "is-past" : undefined}
              onClick={() => goTo(i)}
              aria-current={i === active ? "step" : undefined}
            >
              <span className="story__dot" />
              <b>{c.n}</b>
              <span className="micro">{c.era}</span>
            </button>
          ))}
        </nav>

        <ol className="story__list">
          {CHAPTERS.map((c, i) => (
            <li key={c.n} className={`chap${i === active ? " is-on" : ""}${i < active ? " is-past" : ""}`}>
              <span className="chap__in chap__era micro">
                <b>Chapter {c.n}</b>
                <i />
                {c.era}
              </span>
              <h3 className="chap__in">
                <span className="chap__ln">
                  <span>{c.title[0]}</span>
                </span>
                <span className="chap__ln">
                  <em>{c.title[1]}</em>
                </span>
              </h3>
              <p className="chap__in">{c.text}</p>
              <span className="chap__in chap__note micro">{c.note}</span>
              <div className="chap__in chap__mobile">
                <Photo img={IMG[c.img]} sizes="80vw" reveal={false} parallax={0} />
                <span className="chap__mobile-n">{c.n}</span>
              </div>
            </li>
          ))}
        </ol>

        <button type="button" className="story__next" onClick={() => (next ? goTo(active + 1) : goTo(CHAPTERS.length - 1))} disabled={!next}>
          <span className="story__next-thumb">
            {CHAPTERS.map((c, i) => (
              <span key={c.n} className={i === active + 1 ? "is-on" : undefined}>
                <Photo img={IMG[c.img]} sizes="120px" reveal={false} parallax={0} />
              </span>
            ))}
          </span>
          <span className="story__next-txt">
            <span className="micro">{next ? `Next · Chapter ${next.n}` : "The story continues"}</span>
            <span className="story__next-era">{next ? next.era : "at the bench, today"}</span>
          </span>
          <span className="story__next-arrow" aria-hidden="true">↓</span>
        </button>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ Values: expanding arches */

const VALUES: { n: string; img: ImgKey; title: string; kicker: string; text: string }[] = [
  { n: "01", img: "haloRing", title: "Responsibly sourced", kicker: "Stones", text: "Every diamond is conflict-free and traceable, and comes with a grading report. We know where our stones come from." },
  { n: "02", img: "casting", title: "Recycled metal", kicker: "Gold & platinum", text: "All of our gold and platinum is recycled and refined to the same purity as newly mined metal, with a fraction of the impact." },
  { n: "03", img: "polishing", title: "Made to last", kicker: "Lifetime care", text: "We build every piece to be worn every day and repaired, not replaced. Lifetime care is included with everything we make." },
];

export function Values() {
  const [open, setOpen] = useState(0);
  return (
    <section className="mvalues">
      <div className="mvalues__head">
        <div>
          <span className="eyebrow eyebrow--gold">What we stand for</span>
          <SplitTitle className="h2" lines={["Three", <em key="e">promises.</em>]} />
        </div>
        <p>Not slogans — the way the bench has always worked. Hover each to read more.</p>
      </div>
      <div className="mvalues__row">
        {VALUES.map((v, i) => (
          <article
            key={v.n}
            className={`mval${i === open ? " is-open" : ""}`}
            tabIndex={0}
            onPointerEnter={() => setOpen(i)}
            onFocus={() => setOpen(i)}
          >
            <Photo img={IMG[v.img]} className="mval__photo" sizes="(max-width: 1100px) 100vw, 50vw" parallax={0.08} />
            <span className="mval__shade" />
            <span className="mval__n">{v.n}</span>
            <span className="mval__side micro">{v.title}</span>
            <div className="mval__body">
              <span className="micro">{v.kicker}</span>
              <h3>{v.title}</h3>
              <p>{v.text}</p>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
