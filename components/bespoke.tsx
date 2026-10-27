"use client";

import { useEffect, useRef, useState } from "react";
import { useLenis } from "lenis/react";
import { METALS, type Metal, type ModelKind } from "@/lib/data";
import { DEVELOP, gsap, useGSAP } from "@/lib/gsap";
import { JewelView } from "./three/JewelView";
import { Photo } from "./Photo";
import { IMG, type ImgKey } from "@/lib/images";
import { Magnetic } from "./Chrome";
import { usePageTransition } from "./Transition";
import { Reveal, SplitTitle } from "./anim";
import { Accordion } from "./shared";

/* ------------------------------------------------------------------ Helper: smooth scroll */
function useSmoothScroll() {
  const lenis = useLenis();
  return (id: string) => {
    const el = document.getElementById(id);
    if (!el) return;
    if (lenis) lenis.scrollTo(el, { offset: -60, duration: 1.6 });
    else el.scrollIntoView({ behavior: "smooth" });
  };
}

/* ------------------------------------------------------------------ 1. Hero */
const HERO_FACTS = [
  { num: "1:1", title: "With the maker", text: "You work directly with the artisan at the bench" },
  { num: "0", title: "Catalogues", text: "Every line drawn for your hand and your stone" },
  { num: "8", title: "Weeks, sketch to case", text: "Including a wax try-on before anything is cast" },
];

export function BespokeHero() {
  const scroll = useSmoothScroll();
  const root = useRef<HTMLElement>(null);
  const { ready } = usePageTransition();

  useGSAP(
    () => {
      if (!ready) return;
      gsap.to(".bhero__seal-svg", { rotate: 360, duration: 30, ease: "none", repeat: -1 });
      gsap.fromTo(".bhero__img-a", DEVELOP.from, { ...DEVELOP.to, duration: 1.8, delay: 0.2 });
      gsap.fromTo([".bhero__img-b", ".bhero__seal", ".bhero__card"], { opacity: 0, y: 40 }, { opacity: 1, y: 0, duration: 1.4, ease: "expo.out", stagger: 0.12, delay: 1 });

      const st = { trigger: root.current, start: "top top", end: "bottom top", scrub: true };
      gsap.to(".bhero__card", { yPercent: -60, ease: "none", scrollTrigger: st });
      gsap.to(".bhero__img-b", { yPercent: -30, ease: "none", scrollTrigger: st });
      gsap.to(".bhero__ghost", { yPercent: 30, ease: "none", scrollTrigger: st });
    },
    { scope: root, dependencies: [ready] }
  );

  return (
    <section ref={root} className="bhero">
      <div className="bhero__ribbon">
        <span className="micro micro--gold">
          <i className="bhero__dot" /> Haute Joaillerie Atelier · Archive No. 01 / 01
        </span>
        <span className="micro bhero__ribbon-center">51.5138° N, 0.1082° W · The London Bench</span>
        <span className="micro">By private appointment only</span>
      </div>

      <div className="bhero__main">
        <div className="bhero__copy">
          <Reveal mode="ready" className="bhero__eyebrow">
            <span className="eyebrow eyebrow--gold">Bespoke commission ✦</span>
          </Reveal>

          <SplitTitle as="h1" className="bhero__title" lines={["Made for", <em key="e">one person</em>, "only."]} mode="ready" />

          <Reveal mode="ready" delay={0.25} className="bhero__intro">
            <p>
              A bespoke piece starts with an unhurried conversation and ends with something that exists nowhere else. You sit with the
              maker who will carve the wax, cast the metal and set the stones by hand.
            </p>
          </Reveal>

          <Reveal mode="ready" delay={0.4} className="bhero__actions">
            <Magnetic>
              <button className="btn btn--dark" onClick={() => scroll("studio")}>
                <span>Design it in 3D</span>
              </button>
            </Magnetic>
            <button className="link-arrow" onClick={() => scroll("enquire")}>
              Reserve a consultation <span>→</span>
            </button>
          </Reveal>
        </div>

        <div className="bhero__media">
          <span className="bhero__ghost" aria-hidden="true">
            Nº 418
          </span>
          <div className="bhero__arch-wrap">
            <Photo img={IMG.handsWhite} className="bhero__img-a" sizes="(max-width: 1100px) 80vw, 36vw" priority reveal={false} parallax={0.12} />
            <Photo img={IMG.drawing} className="bhero__img-b" sizes="(max-width: 1100px) 40vw, 16vw" reveal={false} parallax={0.18} />

            <div className="bhero__seal" aria-hidden="true">
              <svg viewBox="0 0 140 140" className="bhero__seal-svg">
                <defs>
                  <path id="bhero-seal-path" d="M70,70 m-54,0 a54,54 0 1,1 108,0 a54,54 0 1,1 -108,0" />
                </defs>
                <text>
                  <textPath href="#bhero-seal-path" textLength="338" lengthAdjust="spacing">
                    WESTERN JEWELLERS · BESPOKE HAUTE JOAILLERIE · LONDON ·
                  </textPath>
                </text>
              </svg>
              <span className="bhero__seal-star">✦</span>
            </div>

            <div className="bhero__card">
              <span className="micro micro--gold">Bench archive #418</span>
              <strong>18k Yellow Gold · Oval Diamond</strong>
              <span className="bhero__card-note">Carved wax trial · Hand-forged</span>
            </div>
          </div>
        </div>
      </div>

      <Reveal mode="ready" delay={0.6} stagger={0.08} className="bhero__facts">
        {HERO_FACTS.map((f) => (
          <div key={f.title} className="bhero__fact">
            <span className="bhero__fact-num">{f.num}</span>
            <div>
              <strong>{f.title}</strong>
              <span>{f.text}</span>
            </div>
          </div>
        ))}
        <button className="bhero__scroll" onClick={() => scroll("studio")} aria-label="Scroll to the 3D studio">
          <span className="micro">Scroll</span>
          <i />
        </button>
      </Reveal>

      <div className="bhero__ticker" aria-hidden="true">
        <div className="bhero__ticker-track">
          {[...Array(2)].map((_, idx) => (
            <span key={idx} className="bhero__ticker-text">
              <span>✦ GIA &amp; IGI certified diamonds</span>
              <span>✦ 100% recycled 18k gold &amp; 950 platinum</span>
              <span>✦ A carved wax try-on before casting</span>
              <span>✦ Direct 1:1 access to the bench</span>
              <span>✦ Complimentary lifetime care</span>
              <span>✦ Heirloom stones &amp; gold remade</span>
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ 2. 3D Studio Configurator */
type StudioCut = { name: string; tag: string; facets: number; desc: string; shape: "round" | "emerald" | "oval" | "cushion" };
const CUTS: StudioCut[] = [
  { name: "Round Brilliant", tag: "58 facets", facets: 58, shape: "round", desc: "Cut for the most fire and the brightest return of light." },
  { name: "Emerald Cut", tag: "Step cut", facets: 57, shape: "emerald", desc: "Long mirror-like steps with a calm, architectural clarity." },
  { name: "Oval Cut", tag: "56 facets", facets: 56, shape: "oval", desc: "Lengthens the finger, with a generous spread and bright sparkle." },
  { name: "Cushion Cut", tag: "64 facets", facets: 64, shape: "cushion", desc: "Soft pillow corners with an antique feel and modern fire." },
];

const SILHOUETTES: { kind: ModelKind; name: string; note: string; basePrice: string; time: string }[] = [
  { kind: "solitaire", name: "Solitaire", note: "A single stone, nothing to distract from it", basePrice: "£4,200", time: "5–6 weeks" },
  { kind: "trilogy", name: "Trilogy", note: "Past, present and future, with two shoulder stones", basePrice: "£5,400", time: "6–7 weeks" },
  { kind: "halo", name: "Aureole Halo", note: "A crown of pavé diamonds around the centre stone", basePrice: "£4,900", time: "6–8 weeks" },
  { kind: "eternity", name: "Eternity Band", note: "Diamonds set all the way around the band", basePrice: "£3,800", time: "4–6 weeks" },
  { kind: "pendant", name: "Lumière Pendant", note: "A single collet that sits close to the collarbone", basePrice: "£3,200", time: "4–5 weeks" },
];

function CutIcon({ shape }: { shape: StudioCut["shape"] }) {
  return (
    <svg viewBox="0 0 40 40" aria-hidden="true" className="bstudio__cut-icon">
      {shape === "round" && (
        <>
          <circle cx="20" cy="20" r="15" />
          <circle cx="20" cy="20" r="7" />
          <path d="M20 5v8M20 27v8M5 20h8M27 20h8M9.4 9.4l5.6 5.6M25 25l5.6 5.6M30.6 9.4L25 15M15 25l-5.6 5.6" />
        </>
      )}
      {shape === "emerald" && (
        <>
          <path d="M13 4h14l6 6v20l-6 6H13l-6-6V10z" />
          <path d="M15 9h10l3 3v16l-3 3H15l-3-3V12z" />
          <path d="M17 14h6v12h-6z" />
        </>
      )}
      {shape === "oval" && (
        <>
          <ellipse cx="20" cy="20" rx="11" ry="16" />
          <ellipse cx="20" cy="20" rx="5" ry="8" />
          <path d="M20 4v8M20 28v8M9 20h6M25 20h6" />
        </>
      )}
      {shape === "cushion" && (
        <>
          <rect x="5" y="5" width="30" height="30" rx="9" />
          <rect x="13" y="13" width="14" height="14" rx="3" />
          <path d="M8 8l5 5M32 8l-5 5M8 32l5-5M32 32l-5-5" />
        </>
      )}
    </svg>
  );
}

const DIAL_TICKS = Array.from({ length: 120 }, (_, i) => i);

export function BespokeStudio({ onApplyToBooking }: { onApplyToBooking?: (spec: string) => void }) {
  const [kind, setKind] = useState<ModelKind>("trilogy");
  const [metal, setMetal] = useState<Metal>("yellow");
  const [cut, setCut] = useState<StudioCut>(CUTS[0]);
  const [zoom, setZoom] = useState(false);
  const drag = useRef({ x: 0, y: 0 });
  const down = useRef<{ x: number; y: number } | null>(null);
  const dial = useRef<SVGGElement>(null);
  const deg = useRef<HTMLSpanElement>(null);
  const root = useRef<HTMLElement>(null);
  const scroll = useSmoothScroll();

  const silIndex = SILHOUETTES.findIndex((s) => s.kind === kind);
  const currentSil = SILHOUETTES[silIndex] ?? SILHOUETTES[0];
  const change = `${kind}-${metal}-${cut.shape}`;

  // The piece turns slowly on its own; the dial and the degree readout follow it.
  useEffect(() => {
    let raf = 0;
    let last = performance.now();
    let visible = false;
    const io = new IntersectionObserver(([e]) => (visible = e.isIntersecting));
    if (root.current) io.observe(root.current);
    const tick = (now: number) => {
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      if (visible) {
        if (!down.current) drag.current.x += dt * 0.35;
        const d = (drag.current.x * 180) / Math.PI;
        dial.current?.setAttribute("transform", `rotate(${-d} 300 300)`);
        if (deg.current) deg.current.textContent = String(Math.round(((d % 360) + 360) % 360)).padStart(3, "0");
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(raf);
      io.disconnect();
    };
  }, []);

  const handleCarrySpec = () => {
    onApplyToBooking?.(`Bespoke ${currentSil.name} in ${METALS[metal].label} with a ${cut.name} centre stone`);
    scroll("enquire");
  };

  return (
    <section ref={root} className={`bstudio bstudio--${metal}`} id="studio">
      <div className="bstudio__bg-word" aria-hidden="true">
        Atelier
      </div>

      <div className="bstudio__layout">
        {/* Left: title + silhouette */}
        <div className="bstudio__col bstudio__col--l">
          <div className="bstudio__intro">
            <span className="eyebrow eyebrow--gold">The commission workbench</span>
            <SplitTitle className="h2" lines={["Design your", <em key="e">own piece</em>]} />
            <p className="bstudio__subtitle">Try proportions in 3D, then bring your choices to the bench.</p>
          </div>

          <div className="bstudio__block">
            <span className="bstudio__label micro">
              <b>I.</b> Silhouette
            </span>
            <div className="bstudio__list" role="radiogroup" aria-label="Silhouette">
              {SILHOUETTES.map((s, i) => (
                <button
                  key={s.kind}
                  type="button"
                  role="radio"
                  aria-checked={kind === s.kind}
                  className={`bstudio__sil${kind === s.kind ? " is-active" : ""}`}
                  onClick={() => setKind(s.kind)}
                >
                  <span className="bstudio__sil-num">{String(i + 1).padStart(2, "0")}</span>
                  <span className="bstudio__sil-name">{s.name}</span>
                  <span className="bstudio__sil-line" aria-hidden="true" />
                </button>
              ))}
            </div>
            <p key={kind} className="bstudio__note">
              {currentSil.note}.
            </p>
          </div>
        </div>

        {/* Centre: the loupe */}
        <div className="bstudio__col bstudio__col--c">
          <div
            className={`bstudio__loupe${zoom ? " is-zoom" : ""}`}
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
            <div className="bstudio__lens" />
            <svg className="bstudio__dial" viewBox="0 0 600 600" aria-hidden="true">
              <defs>
                <path id="bstudio-arc" d="M300,300 m-226,0 a226,226 0 1,1 452,0 a226,226 0 1,1 -452,0" />
              </defs>
              <circle className="bstudio__dial-ring" cx="300" cy="300" r="292" />
              <circle className="bstudio__dial-ring bstudio__dial-ring--in" cx="300" cy="300" r="250" />
              <g ref={dial}>
                {DIAL_TICKS.map((i) => (
                  <line
                    key={i}
                    className={i % 10 === 0 ? "is-major" : i % 5 === 0 ? "is-mid" : ""}
                    x1="300"
                    y1={i % 10 === 0 ? 8 : 8}
                    x2="300"
                    y2={i % 10 === 0 ? 30 : i % 5 === 0 ? 22 : 16}
                    transform={`rotate(${i * 3} 300 300)`}
                  />
                ))}
                {Array.from({ length: 12 }, (_, i) => (
                  <text key={i} className="bstudio__dial-num" x="300" y="46" transform={`rotate(${i * 30} 300 300)`}>
                    {String(i * 30).padStart(3, "0")}
                  </text>
                ))}
              </g>
              <text className="bstudio__dial-script">
                <textPath href="#bstudio-arc" startOffset="0" textLength="1410" lengthAdjust="spacing">
                  WESTERN JEWELLERS · BESPOKE COMMISSION · CARVED IN WAX · CAST IN GOLD · SET BY HAND ·
                </textPath>
              </text>
              <path className="bstudio__dial-cross" d="M300 70V530M70 300H530" />
            </svg>
            <span key={change} className="bstudio__sweep" aria-hidden="true" />

            <JewelView className="bstudio__view" kind={kind} metal={metal} glints drag={drag} zoom={zoom ? 1.35 : 0.92} />

            <span className="bstudio__marker" aria-hidden="true" />
            <span className="bstudio__deg micro" aria-hidden="true">
              <span ref={deg}>000</span>°
            </span>
          </div>

          <div className="bstudio__under">
            <span className="micro">
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path d="M4 12a8 8 0 0 1 14-5.3M20 12a8 8 0 0 1-14 5.3" />
                <path d="M18 3v4h-4M6 21v-4h4" />
              </svg>
              Drag to turn
            </span>
            <span key={change} className="bstudio__spec">
              {currentSil.name} <i>·</i> {METALS[metal].label.replace("18k ", "")} <i>·</i> {cut.name}
            </span>
            <button
              type="button"
              className="bstudio__zoom-btn"
              onClick={() => setZoom((z) => !z)}
              aria-pressed={zoom}
              aria-label={zoom ? "Zoom out" : "Zoom in"}
            >
              {zoom ? "−" : "+"}
            </button>
          </div>
        </div>

        {/* Right: metal, stone, estimate */}
        <div className="bstudio__col bstudio__col--r">
          <div className="bstudio__block">
            <span className="bstudio__label micro">
              <b>II.</b> Metal <em>{METALS[metal].label.replace("18k ", "18k · ")}</em>
            </span>
            <div className="bstudio__metals" role="radiogroup" aria-label="Metal">
              {(Object.keys(METALS) as Metal[]).map((m) => (
                <button
                  key={m}
                  type="button"
                  role="radio"
                  aria-checked={metal === m}
                  aria-label={METALS[m].label}
                  className={`bstudio__metal${metal === m ? " is-active" : ""}`}
                  onClick={() => setMetal(m)}
                >
                  <i style={{ background: METALS[m].swatch }} />
                  <span>{METALS[m].label.replace("18k ", "").replace(" Gold", "")}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="bstudio__block">
            <span className="bstudio__label micro">
              <b>III.</b> Centre stone <em>{cut.tag}</em>
            </span>
            <div className="bstudio__cuts" role="radiogroup" aria-label="Centre stone cut">
              {CUTS.map((c) => (
                <button
                  key={c.name}
                  type="button"
                  role="radio"
                  aria-checked={cut.name === c.name}
                  className={`bstudio__cut-btn${cut.name === c.name ? " is-active" : ""}`}
                  onClick={() => setCut(c)}
                >
                  <CutIcon shape={c.shape} />
                  <b>{c.name.replace(" Cut", "").replace("Round ", "")}</b>
                </button>
              ))}
            </div>
          </div>

          <div className="bstudio__ticket">
            <div className="bstudio__ticket-row">
              <div>
                <span className="micro">Starting from</span>
                <b key={currentSil.basePrice}>{currentSil.basePrice}</b>
              </div>
              <div>
                <span className="micro">At the bench</span>
                <b key={currentSil.time}>{currentSil.time}</b>
              </div>
            </div>
            <Magnetic strength={0.15}>
              <button className="btn btn--gold btn--full" onClick={handleCarrySpec}>
                <span>Bring this to a consultation</span>
              </button>
            </Magnetic>
            <span className="micro bstudio__ticket-note">Fixed quote after your first sketch</span>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ 3. Master Pillars */
const PILLARS: { num: string; title: string; text: string; tag: string; img: ImgKey }[] = [
  {
    num: "I",
    title: "At the bench, not a sales counter.",
    text: "You speak with the jeweller who cuts the metal and shapes the claws. No catalogues and no middlemen — only drawings, real stones and raw precious metal.",
    tag: "Direct with the maker",
    img: "makerLoupe",
  },
  {
    num: "II",
    title: "Stones seen in honest daylight.",
    text: "Shop spotlights flatter every stone. We show ours beside north-facing windows, so you see their true colour, fire and clarity.",
    tag: "True colour",
    img: "ringsDish",
  },
  {
    num: "III",
    title: "A wax try-on before casting.",
    text: "Before any gold or platinum is poured, we hand-carve a wax model for you to try on. You check the height, proportion and comfort first.",
    tag: "Certain before metal",
    img: "handRing",
  },
];

export function BespokePillars() {
  return (
    <section className="bpillars">
      <div className="bpillars__head">
        <div>
          <span className="eyebrow eyebrow--gold">The Western standard</span>
          <SplitTitle className="h2" lines={["Made with", <em key="e">conviction</em>]} />
        </div>
        <Reveal as="p" className="bpillars__intro">
          Three promises that make a bespoke commission here different from choosing a ring from a tray.
        </Reveal>
      </div>

      <div className="bpillars__grid">
        {PILLARS.map((p) => (
          <article key={p.num} className="bpillars__card">
            <div className="bpillars__media">
              <Photo img={IMG[p.img]} sizes="(max-width: 1100px) 90vw, 30vw" parallax={0.12} />
              <span className="bpillars__num">{p.num}</span>
            </div>
            <span className="micro micro--gold">{p.tag}</span>
            <h3>{p.title}</h3>
            <p>{p.text}</p>
          </article>
        ))}
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ 4. Gemological Vault & Anatomy */
const ANATOMY: { num: string; title: string; text: string; img: ImgKey; caption: string }[] = [
  {
    num: "01",
    title: "Eagle-claw prongs",
    text: "Filed by hand to fine points, so the stone is held securely while light reaches it from every side.",
    img: "setting",
    caption: "Claws cut and set under a 20x microscope",
  },
  {
    num: "02",
    title: "The open under-bezel",
    text: "Pierced to the exact angles of your stone, letting light in from beneath and keeping dirt from collecting.",
    img: "haloRing",
    caption: "Light enters the stone from below",
  },
  {
    num: "03",
    title: "A forged, solid shank",
    text: "Hammered and work-hardened rather than hollow-cast, for a dense, durable band with a soft comfort-fit inside.",
    img: "makerSaw",
    caption: "Each band is forged, then shaped by hand",
  },
  {
    num: "04",
    title: "Hidden signatures",
    text: "A secret birthstone beneath the bridge, or a date engraved by hand inside the band — seen only by the wearer.",
    img: "drawing",
    caption: "Engraving planned on the first drawing",
  },
];

export function BespokeVault() {
  const [active, setActive] = useState(0);
  const item = ANATOMY[active];

  return (
    <section className="bvault">
      <div className="bvault__grid">
        <div className="bvault__left">
          <span className="eyebrow eyebrow--gold">Anatomy of a ring</span>
          <SplitTitle className="h2" lines={["The anatomy of", <em key="e">a masterpiece</em>]} />
          <p className="bvault__intro">
            A bespoke ring is not assembled from factory parts. Every angle is worked out for your hand and for the way your stone
            takes the light.
          </p>

          <div className="bvault__list">
            {ANATOMY.map((a, idx) => (
              <button
                key={a.num}
                type="button"
                className={`bvault__item${active === idx ? " is-active" : ""}`}
                onClick={() => setActive(idx)}
                onPointerEnter={(e) => e.pointerType === "mouse" && setActive(idx)}
                aria-expanded={active === idx}
              >
                <span className="bvault__item-head">
                  <span className="bvault__item-num">{a.num}</span>
                  <span className="bvault__item-title">{a.title}</span>
                  <span className="bvault__item-plus" aria-hidden="true" />
                </span>
                <span className="bvault__item-body">
                  <span>{a.text}</span>
                </span>
              </button>
            ))}
          </div>
        </div>

        <div className="bvault__right">
          <div className="bvault__frame">
            {ANATOMY.map((a, idx) => (
              <div key={a.num} className={`bvault__slide${active === idx ? " is-active" : ""}`}>
                <Photo img={IMG[a.img]} className="bvault__photo" sizes="(max-width: 1100px) 90vw, 40vw" reveal={false} parallax={0.08} />
              </div>
            ))}
            <span className="bvault__big" aria-hidden="true">
              {item.num}
            </span>
            <div className="bvault__overlay">
              <span className="micro micro--gold">
                Detail {item.num} / {String(ANATOMY.length).padStart(2, "0")}
              </span>
              <p>{item.caption}</p>
              <span className="bvault__bar" aria-hidden="true">
                <i style={{ transform: `scaleX(${(active + 1) / ANATOMY.length})` }} />
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ 5. Heirlooms Reimagined */
const HEIRLOOMS = [
  {
    title: "The 1928 Art Deco brooch",
    meta: "Family diamond reset",
    text: "An unworn platinum brooch was carefully taken apart. Its 1.85ct Old European-cut diamond now sits in a sharp, architectural 18k yellow gold signet ring.",
    img: "benchExamine" as ImgKey,
  },
  {
    title: "Grandmother's Ceylon sapphire",
    meta: "Trilogy commission",
    text: "A family cushion sapphire was re-polished to bring back its deep blue, then paired with tapered baguette diamonds on a knife-edge rose gold band.",
    img: "haloRing" as ImgKey,
  },
  {
    title: "Three generations of gold",
    meta: "Gold remade",
    text: "Three worn family wedding bands were refined and melted down, then made into a matching pair of wedding rings that carry their history.",
    img: "bandsLinen" as ImgKey,
  },
];

export function BespokeHeirlooms() {
  return (
    <section className="bheir">
      <div className="bheir__head">
        <div>
          <span className="eyebrow eyebrow--gold">Heirlooms reimagined</span>
          <SplitTitle className="h2" lines={["Old stones,", <em key="e">new history.</em>]} />
        </div>
        <Reveal as="p" className="bheir__copy">
          Inherited stones or unworn gold? We can test, unset and reuse them in a new design. Nothing is melted until you have approved
          the carved wax model.
        </Reveal>
      </div>

      <div className="bheir__cards">
        {HEIRLOOMS.map((h, i) => (
          <article key={h.title} className="bheir__card">
            <div className="bheir__media">
              <Photo img={IMG[h.img]} sizes="(max-width: 1100px) 90vw, 30vw" parallax={0.1} />
              <span className="bheir__badge micro">{h.meta}</span>
            </div>
            <div className="bheir__body">
              <span className="bheir__index">{String(i + 1).padStart(2, "0")}</span>
              <div>
                <h3>{h.title}</h3>
                <p>{h.text}</p>
              </div>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ 6. The 6-Step Master Process */
type ProcessStep = {
  num: string;
  stage: string;
  title: string;
  em: string;
  time: string;
  text: string;
  photo: ImgKey;
  artisanNote: string;
};

const PROCESS_STEPS: ProcessStep[] = [
  {
    num: "01",
    stage: "Consultation",
    title: "A private hour",
    em: "at the bench",
    time: "Week 1 · 60 minutes",
    text: "We sit with you in a private room over tea or champagne. Bring photographs, heirlooms or half-formed ideas, and we sketch the first silhouettes together.",
    photo: "benchWoman",
    artisanNote: "No obligation and no sales talk — just an honest look at what is possible.",
  },
  {
    num: "02",
    stage: "Stone sourcing",
    title: "Stones compared in",
    em: "true daylight",
    time: "Week 2 · 3 to 5 stones",
    text: "We source a private shortlist of conflict-free certified diamonds or unheated gemstones, and you compare them in natural daylight under a loupe.",
    photo: "haloRing",
    artisanNote: "A stone has to sing in everyday light, not only under shop lamps.",
  },
  {
    num: "03",
    stage: "Drawing",
    title: "A hand-drawn",
    em: "scale design",
    time: "Week 3 · Fixed quote",
    text: "We draw your piece to scale and paint it in gouache, with a fixed written quote — all before any metal is touched.",
    photo: "drawing",
    artisanNote: "Every claw and collet is measured to a tenth of a millimetre.",
  },
  {
    num: "04",
    stage: "Wax model",
    title: "The",
    em: "wax try-on",
    time: "Week 4 · Fitting",
    text: "Before casting, the maker hand-carves your piece in wax. You try it on to feel its size, height and presence on your hand.",
    photo: "setting",
    artisanNote: "Trying the wax in person means total certainty before casting.",
  },
  {
    num: "05",
    stage: "Casting & setting",
    title: "Cast, forged",
    em: "& set",
    time: "Weeks 5–7 · At the bench",
    text: "Cast in recycled 18k gold or platinum, the band is hammered to harden it, the seats are cut by hand, and every stone is set under the microscope.",
    photo: "polishing",
    artisanNote: "Between forty and sixty hours at the bench go into each piece.",
  },
  {
    num: "06",
    stage: "Presentation",
    title: "The reveal,",
    em: "and a lifetime of care",
    time: "Week 8 · The atelier",
    text: "Presented in a hand-stitched leather case with the stone's grading report, your original sketch and a certificate for lifetime care.",
    photo: "handSolitaire",
    artisanNote: "The beginning of an heirloom that will be loved for generations.",
  },
];

export function BespokeProcess() {
  const root = useRef<HTMLElement>(null);
  const track = useRef<HTMLDivElement>(null);
  const bar = useRef<HTMLSpanElement>(null);
  const [current, setCurrent] = useState(0);
  const currentRef = useRef(0);
  const tween = useRef<gsap.core.Tween | null>(null);
  const lenis = useLenis();

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add("(min-width: 1101px)", () => {
        const el = track.current!;
        const dist = () => el.scrollWidth - window.innerWidth;
        tween.current = gsap.to(el, {
          x: () => -dist(),
          ease: "none",
          scrollTrigger: {
            trigger: root.current,
            start: "top top",
            end: () => "+=" + dist(),
            pin: true,
            scrub: 0.8,
            invalidateOnRefresh: true,
            onUpdate: (self) => {
              bar.current?.style.setProperty("transform", `scaleX(${self.progress})`);
              const i = Math.min(PROCESS_STEPS.length - 1, Math.round(self.progress * (PROCESS_STEPS.length - 1)));
              if (i !== currentRef.current) {
                currentRef.current = i;
                setCurrent(i);
              }
            },
          },
        });
        // Each panel's photo drifts a little against the horizontal motion.
        gsap.utils.toArray<HTMLElement>(".bproc__panel .bproc__media").forEach((m) => {
          gsap.fromTo(
            m.querySelector(".photo__inner"),
            { xPercent: -6 },
            { xPercent: 6, ease: "none", scrollTrigger: { trigger: m, containerAnimation: tween.current!, start: "left right", end: "right left", scrub: true } }
          );
        });
        return () => {
          tween.current = null;
        };
      });
    },
    { scope: root }
  );

  const goTo = (i: number) => {
    const st = tween.current?.scrollTrigger;
    if (st) {
      const y = st.start + (st.end - st.start) * (i / (PROCESS_STEPS.length - 1));
      if (lenis) lenis.scrollTo(y, { duration: 1.4 });
      else window.scrollTo({ top: y, behavior: "smooth" });
    } else {
      root.current?.querySelector<HTMLElement>(`.bproc__panel[data-i="${i}"]`)?.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  };

  return (
    <section ref={root} className="bproc" id="process">
      <div className="bproc__top">
        <div className="bproc__head">
          <span className="eyebrow eyebrow--gold">Six stages · eight weeks</span>
          <SplitTitle className="h2" lines={["From sketch", <em key="e">to heirloom.</em>]} />
        </div>
        <nav className="bproc__nav" aria-label="Stages">
          {PROCESS_STEPS.map((s, idx) => (
            <button key={s.num} type="button" className={`bproc__tab${current === idx ? " is-active" : ""}`} onClick={() => goTo(idx)}>
              <span className="bproc__tab-num">{s.num}</span>
              <span className="bproc__tab-name">{s.stage}</span>
            </button>
          ))}
          <span className="bproc__progress" aria-hidden="true">
            <span ref={bar} />
          </span>
        </nav>
      </div>

      <div className="bproc__viewport">
        <div ref={track} className="bproc__track">
          {PROCESS_STEPS.map((s, i) => (
            <article key={s.num} className="bproc__panel" data-i={i}>
              <div className="bproc__media">
                <Photo img={IMG[s.photo]} className="bproc__photo" sizes="(max-width: 1100px) 90vw, 30vw" parallax={0} reveal={false} />
                <span className="bproc__badge micro">{s.time}</span>
              </div>
              <div className="bproc__info">
                <span className="bproc__big-num" aria-hidden="true">
                  {s.num}
                </span>
                <span className="micro micro--gold">
                  Stage {s.num} — {s.stage}
                </span>
                <h3 className="bproc__title">
                  {s.title} <em>{s.em}</em>
                </h3>
                <p className="bproc__text">{s.text}</p>
                <blockquote className="bproc__quote">
                  <p>“{s.artisanNote}”</p>
                  <cite className="micro">— Master jeweller</cite>
                </blockquote>
              </div>
            </article>
          ))}
          <div className="bproc__end">
            <span className="micro micro--gold">Week 8</span>
            <p>
              Yours, <em>for life.</em>
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ 7. Client Commission Stories */
const STORIES = [
  {
    quote: "They didn't sell us a ring. They helped us make an heirloom that feels truly ours. Trying the wax model on my hand made all the difference.",
    author: "Amelia & James",
    piece: "2.10ct oval solitaire · 18k yellow gold",
    photo: "handSolitaire" as ImgKey,
  },
  {
    quote: "We brought in my grandmother's broken Art Deco brooch. They treated the stones with real respect and made a trilogy ring that takes our breath away.",
    author: "Marcus & Elena",
    piece: "Heirloom trilogy · 950 platinum",
    photo: "bandsLinen" as ImgKey,
  },
  {
    quote: "Seeing the diamonds beside the atelier window, in plain daylight, gave me complete confidence I was choosing the right stone.",
    author: "David L.",
    piece: "Emerald-cut engagement ring",
    photo: "ringsDish" as ImgKey,
  },
];

const STORY_MS = 7000;

export function BespokeStories() {
  const [active, setActive] = useState(0);
  const [hold, setHold] = useState(false);
  const [seen, setSeen] = useState(false);
  const root = useRef<HTMLElement>(null);

  useEffect(() => {
    const io = new IntersectionObserver(([e]) => setSeen(e.isIntersecting), { threshold: 0.3 });
    if (root.current) io.observe(root.current);
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    if (!seen || hold) return;
    const t = setTimeout(() => setActive((a) => (a + 1) % STORIES.length), STORY_MS);
    return () => clearTimeout(t);
  }, [active, seen, hold]);

  const go = (d: number) => setActive((a) => (a + d + STORIES.length) % STORIES.length);

  return (
    <section
      ref={root}
      className={`bstories${seen && !hold ? " is-running" : ""}`}
      style={{ "--story-ms": `${STORY_MS}ms` } as React.CSSProperties}
      onPointerEnter={() => setHold(true)}
      onPointerLeave={() => setHold(false)}
    >
      <div className="bstories__media">
        {STORIES.map((s, i) => (
          <div key={s.author} className={`bstories__slide${active === i ? " is-active" : ""}`}>
            <Photo img={IMG[s.photo]} className="bstories__photo" sizes="(max-width: 1100px) 90vw, 40vw" reveal={false} parallax={0.1} />
          </div>
        ))}
        <span className="bstories__count micro">
          {String(active + 1).padStart(2, "0")} / {String(STORIES.length).padStart(2, "0")}
        </span>
      </div>

      <div className="bstories__copy">
        <span className="eyebrow eyebrow--gold">From the archive · client stories</span>
        <div className="bstories__quotes">
          {STORIES.map((s, i) => (
            <figure key={s.author} className={`bstories__quote${active === i ? " is-active" : ""}`} aria-hidden={active !== i}>
              <blockquote className="bstories__text">
                <span className="bstories__mark" aria-hidden="true">
                  “
                </span>
                {s.quote}
              </blockquote>
              <figcaption className="bstories__by">
                <strong>{s.author}</strong>
                <span className="micro micro--gold">{s.piece}</span>
              </figcaption>
            </figure>
          ))}
        </div>

        <div className="bstories__nav">
          <div className="bstories__dots">
            {STORIES.map((s, i) => (
              <button
                key={s.author}
                type="button"
                className={`bstories__dot${active === i ? " is-active" : ""}`}
                onClick={() => setActive(i)}
                aria-label={`Story ${i + 1}: ${s.author}`}
              >
                <i key={active === i ? `on-${active}` : "off"} />
              </button>
            ))}
          </div>
          <div className="bstories__arrows">
            <button type="button" onClick={() => go(-1)} aria-label="Previous story">
              ←
            </button>
            <button type="button" onClick={() => go(1)} aria-label="Next story">
              →
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ 8. Bespoke FAQs */
const BESPOKE_FAQS = [
  {
    title: "How long does a bespoke commission take?",
    body: (
      <p>
        Most commissions take six to eight weeks from the first appointment to collection. This ensures ample time for loose stone sourcing,
        hand-carving your wax prototype, casting, setting under microscope, and London hallmark assay. If you have a specific date (such as a planned proposal),
        please let us know early and we will schedule around it.
      </p>
    ),
  },
  {
    title: "What does bespoke cost, and how is payment structured?",
    body: (
      <p>
        Bespoke commissions typically start from £4,200, dictated primarily by stone specifications and metal choice.
        We provide a transparent, fixed written quotation following the design sketch—there are zero hidden extras.
        Payment is split: a 50% deposit upon design and stone sign-off, with the remaining 50% upon final presentation at the atelier.
        The initial one-hour consultation is completely complimentary.
      </p>
    ),
  },
  {
    title: "Can you reuse my inherited gold or family gemstones?",
    body: (
      <p>
        Yes, remodelling is a core speciality of our atelier. We can safely unset family diamonds or coloured gemstones, clean and inspect them under 20x magnification,
        and re-refine your old gold into fresh alloys. If certain stones are too delicate to reset safely, we will advise you honestly.
      </p>
    ),
  },
  {
    title: "I am planning a surprise proposal—how do we handle sizing and design?",
    body: (
      <p>
        We guide secret proposals frequently. We can advise on discreet ways to determine their finger size, or craft the piece to standard size with one
        complimentary post-proposal resize included. Alternatively, many clients commission a loose diamond presented in our atelier gem box,
        bringing their partner back to design the setting together!
      </p>
    ),
  },
  {
    title: "How are your diamonds and precious metals certified?",
    body: (
      <p>
        All diamonds above 0.50 carats are accompanied by independent laboratory certificates from the GIA or IGI, verifying cut, colour, clarity, and carat weight.
        We work strictly with Kimberley Process certified partners and use 100% recycled 18k gold and 950 platinum, stamped with the official London Assay Office hallmark.
      </p>
    ),
  },
  {
    title: "What lifetime aftercare is included with the commission?",
    body: (
      <p>
        Every bespoke jewel leaves our atelier registered in our permanent archive. You receive lifetime complimentary annual ultrasonic cleaning,
        claw and setting integrity checks, and light re-polishing to keep your piece radiant for decades to come.
      </p>
    ),
  },
];

export function BespokeFAQ() {
  return (
    <section className="bfaq">
      <div className="bfaq__head">
        <span className="eyebrow eyebrow--gold">Frequently Asked</span>
        <SplitTitle className="h2" lines={["Questions &", <em key="e">transparency</em>]} />
        <p className="bfaq__head-desc">
          Everything you need to know about commissioning an original piece with Western Jewellers.
        </p>
      </div>
      <div className="bfaq__content">
        <Accordion items={BESPOKE_FAQS} />
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ 9. Bespoke Booking Section */
export function BespokeBooking({ defaultNote }: { defaultNote?: string }) {
  const [meetingType, setMeetingType] = useState<"atelier" | "video">("atelier");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [budget, setBudget] = useState("£4,500 – £8,000");
  const [notes, setNotes] = useState(defaultNote ?? "");
  const [submitted, setSubmitted] = useState(false);

  // A design carried over from the 3D studio fills in the notes.
  useEffect(() => {
    if (defaultNote) setNotes(defaultNote);
  }, [defaultNote]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim()) return;
    setSubmitted(true);
  };

  return (
    <section className="bbook" id="enquire">
      <div className="bbook__copy">
        <span className="eyebrow eyebrow--gold">Start Your Journey</span>
        <SplitTitle className="h2" lines={["Reserve your", <em key="e">private hour</em>]} />
        <p>
          Sit directly with one of our master makers. An unhurried, private hour at our London bench or via high-definition video call.
          Completely free, with zero obligation.
        </p>

        <div className="bbook__promises">
          <div>
            <span className="micro micro--gold">✦ Complimentary Hour</span>
            <p>60 minutes dedicated purely to your idea</p>
          </div>
          <div>
            <span className="micro micro--gold">✦ Hold Real Stones</span>
            <p>Inspect loose gems under daylight lamps</p>
          </div>
          <div>
            <span className="micro micro--gold">✦ Leave With a Sketch</span>
            <p>Take home original drawings and a fixed quote</p>
          </div>
        </div>

        <Photo
          img={IMG.benchPortrait}
          className="bbook__photo"
          sizes="(max-width: 900px) 100vw, 36vw"
          parallax={0.08}
        />
      </div>

      <div className="bbook__form-container">
        {submitted ? (
          <div className="bbook__success" role="status">
            <span className="bbook__success-icon">✦</span>
            <span className="eyebrow eyebrow--gold">Commission Request Logged</span>
            <h3>Thank you, {name}.</h3>
            <p>
              Your bespoke commission enquiry has been delivered directly to our master jeweller. We will contact you within one business day
              to confirm your consultation time and prepare relevant stones for your viewing.
            </p>
            <div className="bbook__success-details">
              <span className="micro">Meeting: {meetingType === "atelier" ? "London Atelier Visit" : "Private Video Call"}</span>
              <span className="micro">Budget Guideline: {budget}</span>
              {notes && <span className="micro">Concept: {notes}</span>}
            </div>
            <button className="btn btn--dark" onClick={() => setSubmitted(false)}>
              <span>Submit Another Request</span>
            </button>
          </div>
        ) : (
          <form className="bbook__form" onSubmit={handleSubmit} noValidate>
            <div className="bbook__form-head">
              <span className="micro micro--gold">Consultation Request</span>
              <span className="micro">Tue – Sat · 10:00 – 18:00</span>
            </div>

            {/* Meeting Type Selection */}
            <div className="bbook__field-group">
              <label className="micro">How would you prefer to meet?</label>
              <div className="bbook__seg">
                <button
                  type="button"
                  className={`bbook__seg-btn${meetingType === "atelier" ? " is-active" : ""}`}
                  onClick={() => setMeetingType("atelier")}
                >
                  <b>At the Atelier</b>
                  <small>Private room in London</small>
                </button>
                <button
                  type="button"
                  className={`bbook__seg-btn${meetingType === "video" ? " is-active" : ""}`}
                  onClick={() => setMeetingType("video")}
                >
                  <b>Video Consultation</b>
                  <small>Worldwide in HD</small>
                </button>
              </div>
            </div>

            {/* Contact details */}
            <div className="bbook__row">
              <div className="bbook__field">
                <label className="micro">Your Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Eleanor Vance"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>
              <div className="bbook__field">
                <label className="micro">Email Address *</label>
                <input
                  type="email"
                  required
                  placeholder="eleanor@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>

            <div className="bbook__row">
              <div className="bbook__field">
                <label className="micro">Phone (Optional)</label>
                <input
                  type="tel"
                  placeholder="+44 7..."
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                />
              </div>
              <div className="bbook__field">
                <label className="micro">Indicative Budget Bracket</label>
                <select value={budget} onChange={(e) => setBudget(e.target.value)}>
                  <option value="Under £4,500">Under £4,500</option>
                  <option value="£4,500 – £8,000">£4,500 – £8,000</option>
                  <option value="£8,000 – £15,000">£8,000 – £15,000</option>
                  <option value="£15,000+">£15,000+ (High Haute Joaillerie)</option>
                  <option value="Heirloom Reset Only">Heirloom Reset (Using own stones)</option>
                </select>
              </div>
            </div>

            {/* Notes / Concept specifications */}
            <div className="bbook__field">
              <label className="micro">Tell us about what you have in mind (Optional)</label>
              <textarea
                rows={3}
                placeholder="Preferred ring silhouette, gemstones, target dates, or heirloom details..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
            </div>

            <p className="bbook__privacy micro">
              Your details are used solely to schedule your appointment. We never share your data.
            </p>

            <Magnetic>
              <button type="submit" className="btn btn--dark btn--full">
                <span>Request Your Private Consultation</span>
              </button>
            </Magnetic>
          </form>
        )}
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ 10. Complete Page View */
export function BespokeView() {
  const [bookingNote, setBookingNote] = useState("");

  return (
    <>
      <BespokeHero />
      <BespokeStudio onApplyToBooking={setBookingNote} />
      <BespokePillars />
      <BespokeVault />
      <BespokeProcess />
      <BespokeHeirlooms />
      <BespokeStories />
      <BespokeFAQ />
      <BespokeBooking defaultNote={bookingNote} />
    </>
  );
}
