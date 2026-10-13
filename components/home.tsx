"use client";

import { useRef, useState } from "react";
import { collections, getPiece, METALS, formatPrice, type Metal } from "@/lib/data";
import { gsap, ScrollTrigger, useGSAP } from "@/lib/gsap";
import { JewelView } from "./three/JewelView";
import { Photo } from "./Photo";
import { IMG, type ImgKey } from "@/lib/images";
import { TLink } from "./Transition";
import { Magnetic } from "./Chrome";
import { Counter, Reveal, SplitTitle, WordReveal } from "./anim";

/* ------------------------------------------------------------------ Manifesto */

export function Manifesto() {
  return (
    <section className="manifesto">
      <span className="eyebrow eyebrow--gold">The Maison</span>
      <WordReveal
        className="manifesto__text"
        text="We believe a jewel should hold a memory as well as the light. Every piece that leaves our atelier is drawn, cast, set and polished by the same few pairs of hands, slowly, and with the patience that rare things deserve."
      />
      <Reveal className="manifesto__sign">
        <span className="sig">Western</span>
        <TLink href="/maison" className="link-arrow">
          Our story <span>→</span>
        </TLink>
      </Reveal>
    </section>
  );
}

/* ------------------------------------------------------------------ Collections rail */

export function CollectionsRail() {
  const root = useRef<HTMLElement>(null);
  const [hover, setHover] = useState<string | null>(null);

  useGSAP(
    () => {
      const track = root.current!.querySelector<HTMLElement>(".rail__track")!;
      const dist = () => Math.max(0, track.scrollWidth - window.innerWidth);
      const tween = gsap.to(track, {
        x: () => -dist(),
        ease: "none",
        scrollTrigger: {
          trigger: ".rail__pin",
          start: "top top",
          end: () => "+=" + dist(),
          pin: true,
          scrub: 1,
          invalidateOnRefresh: true,
          anticipatePin: 1,
          onUpdate: (s) => gsap.set(".rail__progress span", { scaleX: s.progress }),
        },
      });
      gsap.utils.toArray<HTMLElement>(".ccard").forEach((card) => {
        gsap.fromTo(
          card.querySelector(".ccard__media"),
          { clipPath: "inset(16% 0 0 0)" },
          { clipPath: "inset(0% 0 0 0)", ease: "none", scrollTrigger: { trigger: card, containerAnimation: tween, start: "left right", end: "center center", scrub: true } }
        );
      });
    },
    { scope: root }
  );

  return (
    <section ref={root} className="rail">
      <div className="rail__pin">
        <div className="rail__head">
          <div>
            <span className="eyebrow">Collections</span>
            <SplitTitle className="h2" lines={["Four ways to", <em key="e">carry the light</em>]} />
          </div>
          <div className="rail__progress">
            <span />
          </div>
        </div>
        <div className="rail__track">
          {collections.map((c) => (
            <TLink
              key={c.slug}
              href={`/collections/${c.slug}`}
              className="ccard"
              data-cursor="Explore"
              onPointerEnter={() => setHover(c.slug)}
              onPointerLeave={() => setHover(null)}
            >
              <div className="ccard__media" style={{ ["--tint" as string]: c.tint }}>
                <JewelView className="ccard__view" kind={c.model} metal={c.metal} active={hover === c.slug} />
                <Photo img={IMG[c.image]} className="ccard__thumb" sizes="120px" reveal={false} parallax={0} />
              </div>
              <div className="ccard__body">
                <span className="ccard__num">{c.index}</span>
                <h3>{c.name}</h3>
                <p>{c.intro}</p>
              </div>
            </TLink>
          ))}
          <div className="rail__end">
            <p className="h3">
              Every piece can be
              <br />
              <em>made to measure.</em>
            </p>
            <Magnetic>
              <TLink href="/bespoke" className="btn btn--dark">
                <span>Start a commission</span>
              </TLink>
            </Magnetic>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ Signature */

export function Signature() {
  const piece = getPiece("aurelia")!;
  const [metal, setMetal] = useState<Metal>(piece.metal);
  return (
    <section className="signature">
      <div className="signature__copy">
        <span className="eyebrow eyebrow--gold">Signature piece</span>
        <SplitTitle className="display" lines={["The", <em key="a">Aurelia</em>]} />
        <Reveal as="p" className="signature__text">
          {piece.description}
        </Reveal>
        <Reveal className="signature__specs">
          <dl className="specs">
            {piece.specs.map(([k, v]) => (
              <div key={k}>
                <dt>{k}</dt>
                <dd>{v}</dd>
              </div>
            ))}
          </dl>
        </Reveal>
        <Reveal className="metals" delay={0.1}>
          <span className="eyebrow">Choose your metal</span>
          <div className="metals__row" role="radiogroup" aria-label="Metal">
            {(Object.keys(METALS) as Metal[]).map((m) => (
              <button key={m} role="radio" aria-checked={metal === m} className={`swatch${metal === m ? " is-active" : ""}`} onClick={() => setMetal(m)}>
                <i style={{ background: METALS[m].swatch }} />
                <span>{METALS[m].label}</span>
              </button>
            ))}
          </div>
        </Reveal>
        <Reveal className="signature__cta" delay={0.15}>
          <span className="signature__price">{formatPrice(piece.price)}</span>
          <Magnetic>
            <TLink href="/pieces/aurelia" className="btn btn--gold">
              <span>Discover the Aurelia</span>
            </TLink>
          </Magnetic>
        </Reveal>
      </div>
      <div className="signature__stage">
        <JewelView className="signature__view" kind="solitaire" metal={metal} glints zoom={1.05} />
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ Craft steps */

export type Step = { title: string; text: string; image?: ImgKey };

export function CraftSteps({ eyebrow, title, steps, link }: { eyebrow: string; title: [string, string, string?]; steps: Step[]; link?: { href: string; label: string } }) {
  const root = useRef<HTMLElement>(null);
  const [current, setCurrent] = useState(0);
  useGSAP(
    () => {
      gsap.utils.toArray<HTMLElement>(".step").forEach((step, i) => {
        ScrollTrigger.create({
          trigger: step,
          start: "top 60%",
          end: "bottom 60%",
          onToggle: (s) => {
            step.classList.toggle("is-active", s.isActive);
            if (s.isActive) setCurrent(i);
          },
        });
      });
    },
    { scope: root }
  );
  useGSAP(
    () => {
      gsap.fromTo(".craft__current", { yPercent: 50, opacity: 0 }, { yPercent: 0, opacity: 1, duration: 0.7, ease: "expo.out" });
    },
    { scope: root, dependencies: [current] }
  );
  return (
    <section ref={root} className="craft">
      <div className="craft__left">
        <span className="eyebrow eyebrow--gold">{eyebrow}</span>
        <SplitTitle className="h2" lines={[title[0], <em key="e">{title[1]}</em>, ...(title[2] ? [title[2]] : [])]} />
        {steps.some((s) => s.image) && (
          <div className="craft__media">
            {steps.map((s, i) =>
              s.image ? (
                <div key={s.title} className={`craft__shot${i === current ? " is-active" : ""}`}>
                  <Photo img={IMG[s.image]} sizes="(max-width: 1100px) 90vw, 30vw" reveal={i === 0} parallax={0.06} />
                </div>
              ) : null
            )}
          </div>
        )}
        <div className="craft__counter">
          <span className="craft__current">{String(current + 1).padStart(2, "0")}</span>
          <span className="craft__total">/{String(steps.length).padStart(2, "0")}</span>
        </div>
        {link && (
          <TLink href={link.href} className="link-arrow">
            {link.label} <span>→</span>
          </TLink>
        )}
      </div>
      <ol className="craft__steps">
        {steps.map((s, i) => (
          <li className="step" key={s.title}>
            <span className="step__num">{String(i + 1).padStart(2, "0")}</span>
            <h3>{s.title}</h3>
            <p>{s.text}</p>
          </li>
        ))}
      </ol>
    </section>
  );
}

/* ------------------------------------------------------------------ Numbers & quote */

const STATS: { n: number; s?: string; label: string; note: string; img?: ImgKey }[] = [
  { n: 60, s: "+", label: "Years at the bench", note: "The same workshop, the same promise: every piece made by hand." },
  { n: 12, s: "k", label: "Pieces made by hand", note: "Each one drawn, cast, set and polished in our atelier.", img: "setting" },
  { n: 100, s: "%", label: "Conflict-free stones", note: "Every diamond is traceable and comes with a grading report.", img: "haloRing" },
  { n: 3, label: "Generations of makers", note: "Skills handed down at the bench, from one maker to the next." },
];

export function Numbers() {
  const root = useRef<HTMLElement>(null);
  useGSAP(
    () => {
      gsap.fromTo(
        ".stat",
        { opacity: 0, y: 50 },
        { opacity: 1, y: 0, duration: 1.3, ease: "expo.out", stagger: 0.1, scrollTrigger: { trigger: ".numbers__grid", start: "top 80%" } }
      );
    },
    { scope: root }
  );
  return (
    <section ref={root} className="numbers">
      <div className="numbers__intro">
        <span className="micro micro--gold">The house, in numbers</span>
        <SplitTitle className="numbers__title" lines={["Sixty years", "of patience,", <em key="e">measured in pieces.</em>]} />
        <Photo img={IMG.makerLoupe} className="numbers__photo" sizes="(max-width: 1100px) 60vw, 26vw" parallax={0.12} />
      </div>
      <div className="numbers__grid">
        {STATS.map((st, i) => (
          <article key={st.label} className={`stat${st.img ? " stat--photo" : ""}`}>
            {st.img && <Photo img={IMG[st.img]} className="stat__bg" sizes="(max-width: 720px) 100vw, 28vw" reveal={false} parallax={0.1} />}
            <span className="stat__i micro">{String(i + 1).padStart(2, "0")}</span>
            <div className="stat__body">
              <Counter to={st.n} suffix={st.s} />
              <h3 className="stat__label">{st.label}</h3>
              <p>{st.note}</p>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

export function Quote({ text, by, images = ["portraitEarring", "handsBands"] }: { text: string; by: string; images?: [ImgKey, ImgKey] }) {
  return (
    <section className="quote">
      <Photo img={IMG[images[0]]} className="quote__img quote__img--l" sizes="20vw" parallax={0.14} />
      <Photo img={IMG[images[1]]} className="quote__img quote__img--r" sizes="20vw" parallax={0.2} />
      <blockquote>
        <WordReveal text={text} />
        <footer>
          <span className="eyebrow">{by}</span>
        </footer>
      </blockquote>
    </section>
  );
}
