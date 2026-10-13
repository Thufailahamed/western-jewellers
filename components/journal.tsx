"use client";

import { useMemo, useRef, useState } from "react";
import { articles, type Article } from "@/lib/data";
import { IMG } from "@/lib/images";
import { gsap, useGSAP } from "@/lib/gsap";
import { Photo } from "./Photo";
import { TLink, usePageTransition } from "./Transition";
import { Reveal, SplitTitle } from "./anim";

const minutes = (a: Article) => parseInt(a.read, 10) || 0;

/* ------------------------------------------------------------------ Cover */

export function JournalCover() {
  const [lead, ...also] = articles;
  const root = useRef<HTMLElement>(null);
  const { ready } = usePageTransition();
  const total = articles.reduce((n, a) => n + minutes(a), 0);

  useGSAP(
    () => {
      if (!ready) return;
      gsap.fromTo(".jcover__word .ch", { yPercent: 105 }, { yPercent: 0, duration: 1.5, ease: "expo.out", stagger: 0.05, delay: 0.1 });
      gsap.fromTo(".jcover__the", { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 1.2, ease: "expo.out", delay: 0.6 });
      gsap.fromTo(".jcover__mast > *", { opacity: 0, y: 12 }, { opacity: 1, y: 0, duration: 1, ease: "expo.out", stagger: 0.08, delay: 0.3 });
      gsap.fromTo(".jcover__lead .photo", { clipPath: "inset(100% 0% 0% 0%)" }, { clipPath: "inset(0% 0% 0% 0%)", duration: 1.6, ease: "expo.inOut", delay: 0.5 });
      gsap.fromTo(".jcover__side > *", { opacity: 0, y: 28 }, { opacity: 1, y: 0, duration: 1.2, ease: "expo.out", stagger: 0.07, delay: 0.9 });
      // The masthead drifts up and fades as the cover story takes over.
      gsap.to(".jcover__word", { yPercent: -18, opacity: 0.25, ease: "none", scrollTrigger: { trigger: root.current, start: "top top", end: "60% top", scrub: true } });
    },
    { scope: root, dependencies: [ready] }
  );

  return (
    <section ref={root} className="jcover">
      <div className="jcover__mast">
        <span className="micro micro--gold">Vol. III — Autumn 2026</span>
        <span className="micro jcover__mast-mid">Notes from the bench · Western Jewellers, London</span>
        <span className="micro">
          {articles.length} stories · {total} min of reading
        </span>
      </div>

      <h1 className="jcover__word" aria-label="The Journal">
        <span className="jcover__the" aria-hidden="true">
          The
        </span>
        <span className="jcover__letters" aria-hidden="true">
          {"Journal".split("").map((c, i) => (
            <span key={i} className="ch-mask">
              <span className="ch">{c}</span>
            </span>
          ))}
        </span>
      </h1>

      <div className="jcover__grid">
        <TLink href={`/journal/${lead.slug}`} className="jcover__lead" data-cursor="Read">
          <Photo img={IMG[lead.image]} sizes="(max-width: 1100px) 100vw, 60vw" reveal={false} parallax={0.14} priority />
          <span className="jcover__badge micro">Cover story</span>
          <span className="jcover__no" aria-hidden="true">
            Nº 01
          </span>
        </TLink>

        <div className="jcover__side">
          <div className="jcover__kicker">
            <span className="micro micro--gold">{lead.kicker}</span>
            <span className="micro">
              {lead.date} · {lead.read} read
            </span>
          </div>
          <TLink href={`/journal/${lead.slug}`} className="jcover__title">
            {lead.title}
          </TLink>
          <p className="jcover__excerpt">{lead.excerpt}</p>
          <TLink href={`/journal/${lead.slug}`} className="link-arrow">
            Read the story <span>→</span>
          </TLink>

          <div className="jcover__also">
            <span className="micro">Also in this issue</span>
            {also.map((a, i) => (
              <TLink key={a.slug} href={`/journal/${a.slug}`} className="jcover__also-row">
                <Photo img={IMG[a.image]} className="jcover__also-img" sizes="120px" reveal={false} parallax={0} />
                <span className="jcover__also-body">
                  <span className="micro micro--gold">
                    Nº {String(i + 2).padStart(2, "0")} · {a.kicker}
                  </span>
                  <span className="jcover__also-title">{a.title}</span>
                </span>
                <span className="jcover__also-arrow" aria-hidden="true">
                  →
                </span>
              </TLink>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ Index (hover preview list) */

export function JournalIndex() {
  const kinds = useMemo(() => ["All", ...Array.from(new Set(articles.map((a) => a.kicker)))], []);
  const [filter, setFilter] = useState("All");
  const [hover, setHover] = useState<number | null>(null);
  const list = useRef<HTMLDivElement>(null);
  const preview = useRef<HTMLDivElement>(null);
  const move = useRef<{ x: gsap.QuickToFunc; y: gsap.QuickToFunc } | null>(null);

  useGSAP(
    () => {
      move.current = {
        x: gsap.quickTo(preview.current, "x", { duration: 0.7, ease: "power3" }),
        y: gsap.quickTo(preview.current, "y", { duration: 0.7, ease: "power3" }),
      };
    },
    { scope: list }
  );

  const shown = articles.map((a, i) => ({ a, i, on: filter === "All" || a.kicker === filter }));

  return (
    <section className="jindex">
      <div className="jindex__head">
        <div>
          <span className="eyebrow eyebrow--gold">The index</span>
          <SplitTitle className="h2" lines={["Every story,", <em key="e">in one place</em>]} />
        </div>
        <div className="jindex__filters" role="tablist" aria-label="Filter stories">
          {kinds.map((k) => {
            const n = k === "All" ? articles.length : articles.filter((a) => a.kicker === k).length;
            return (
              <button key={k} role="tab" aria-selected={filter === k} className={`jindex__filter${filter === k ? " is-active" : ""}`} onClick={() => setFilter(k)}>
                {k}
                <sup>{n}</sup>
              </button>
            );
          })}
        </div>
      </div>

      <div
        ref={list}
        className={`jindex__list${hover !== null ? " is-hovering" : ""}`}
        onPointerMove={(e) => {
          if (e.pointerType !== "mouse" || !move.current || !list.current) return;
          const r = list.current.getBoundingClientRect();
          move.current.x(e.clientX - r.left);
          move.current.y(e.clientY - r.top);
        }}
        onPointerLeave={() => setHover(null)}
      >
        <div ref={preview} className="jindex__preview" aria-hidden="true">
          {articles.map((a, i) => (
            <div key={a.slug} className={`jindex__preview-img${hover === i ? " is-on" : ""}`}>
              <Photo img={IMG[a.image]} sizes="340px" reveal={false} parallax={0} />
            </div>
          ))}
        </div>

        {shown.map(({ a, i, on }) => (
          <TLink
            key={a.slug}
            href={`/journal/${a.slug}`}
            className={`jindex__row${on ? "" : " is-off"}${hover === i ? " is-hover" : ""}`}
            onPointerEnter={(e) => e.pointerType === "mouse" && setHover(i)}
            tabIndex={on ? 0 : -1}
            aria-hidden={!on}
          >
            <span className="jindex__num">{String(i + 1).padStart(2, "0")}</span>
            <Photo img={IMG[a.image]} className="jindex__thumb" sizes="120px" reveal={false} parallax={0} />
            <span className="jindex__title">
              <span className="jindex__title-a">{a.title}</span>
              <span className="jindex__title-b" aria-hidden="true">
                {a.title}
              </span>
            </span>
            <span className="jindex__kicker micro micro--gold">{a.kicker}</span>
            <span className="jindex__date micro">{a.date}</span>
            <span className="jindex__read micro">{a.read}</span>
            <span className="jindex__arrow" aria-hidden="true">
              →
            </span>
          </TLink>
        ))}
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ Field notes (draggable strip) */

const NOTES = [
  { t: "Warm water, mild soap", d: "A soft brush, warm water and a drop of washing-up liquid is all most gold and diamond pieces need." },
  { t: "Last on, first off", d: "Put jewellery on after perfume and creams, and take it off before the gym, the pool or the garden." },
  { t: "One piece, one pouch", d: "Diamonds scratch gold and each other. Store each piece on its own, in a soft pouch or lined box." },
  { t: "Check the claws", d: "If a stone rattles or a claw catches on your sweater, stop wearing it and bring it to us straight away." },
  { t: "Sizes change", d: "Fingers swell in summer and in the evening. Size a ring in the afternoon, when it's neither too warm nor cold." },
  { t: "An annual visit", d: "Once a year we clean, check and re-polish every piece we've made, at no charge. Just bring it in." },
];

export function FieldNotes() {
  const track = useRef<HTMLDivElement>(null);
  const bar = useRef<HTMLSpanElement>(null);
  const drag = useRef<{ x: number; left: number } | null>(null);

  const onScroll = () => {
    const el = track.current!;
    const p = el.scrollLeft / Math.max(1, el.scrollWidth - el.clientWidth);
    bar.current?.style.setProperty("transform", `scaleX(${0.15 + p * 0.85})`);
  };
  const nudge = (d: number) => track.current?.scrollBy({ left: d * track.current.clientWidth * 0.6, behavior: "smooth" });

  return (
    <section className="jnotes">
      <div className="jnotes__head">
        <div>
          <span className="eyebrow eyebrow--gold">Field notes</span>
          <SplitTitle className="h2" lines={["Small habits,", <em key="e">long lives</em>]} />
        </div>
        <Reveal as="p" className="jnotes__intro">
          Six things our makers tell everyone who takes a piece home. Drag to read them all.
        </Reveal>
      </div>

      <div
        ref={track}
        className="jnotes__track"
        data-cursor="Drag"
        onScroll={onScroll}
        onPointerDown={(e) => {
          if (e.pointerType !== "mouse") return;
          drag.current = { x: e.clientX, left: track.current!.scrollLeft };
          track.current!.classList.add("is-drag");
        }}
        onPointerMove={(e) => {
          if (!drag.current) return;
          track.current!.scrollLeft = drag.current.left - (e.clientX - drag.current.x);
        }}
        onPointerUp={() => {
          drag.current = null;
          track.current!.classList.remove("is-drag");
        }}
        onPointerLeave={() => {
          drag.current = null;
          track.current?.classList.remove("is-drag");
        }}
      >
        {NOTES.slice(0, 3).map((n, i) => (
          <Note key={n.t} n={n} i={i} />
        ))}
        <figure className="jnotes__photo">
          <Photo img={IMG.polishing} sizes="(max-width: 720px) 80vw, 30vw" reveal={false} parallax={0} />
          <figcaption className="micro">The annual polish, at the bench</figcaption>
        </figure>
        {NOTES.slice(3).map((n, i) => (
          <Note key={n.t} n={n} i={i + 3} />
        ))}
      </div>

      <div className="jnotes__foot">
        <span className="jnotes__bar" aria-hidden="true">
          <span ref={bar} />
        </span>
        <div className="jnotes__arrows">
          <button type="button" onClick={() => nudge(-1)} aria-label="Previous notes">
            ←
          </button>
          <button type="button" onClick={() => nudge(1)} aria-label="More notes">
            →
          </button>
        </div>
      </div>
    </section>
  );
}

function Note({ n, i }: { n: { t: string; d: string }; i: number }) {
  return (
    <article className="jnote">
      <span className="jnote__num">{String(i + 1).padStart(2, "0")}</span>
      <h3>{n.t}</h3>
      <p>{n.d}</p>
      <span className="micro micro--gold">Note {String(i + 1).padStart(2, "0")} / 06</span>
    </article>
  );
}
