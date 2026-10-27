"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { getPiece, formatPrice, METALS } from "@/lib/data";
import { DEVELOP, gsap, ScrollTrigger, useGSAP } from "@/lib/gsap";
import { HeroStage, type HeroLayout } from "./three/HeroStage";
import { JewelView } from "./three/JewelView";
import { TLink, usePageTransition } from "./Transition";
import { Magnetic } from "./Chrome";
import { Reveal } from "./anim";
import { Photo } from "./Photo";
import { IMG, type ImgKey } from "@/lib/images";

/* ------------------------------------------------------------------ Hero */

const FEATURED = ["aurelia", "celeste", "trois", "lumiere-drop"];
const CYCLE = 6; // seconds per featured piece
// The photograph beside the arch shows each featured piece as it is worn.
const WORN: Record<string, ImgKey> = { aurelia: "handRing", celeste: "haloRing", trois: "handsWhite", "lumiere-drop": "neckPendant" };

export function Hero() {
  const root = useRef<HTMLElement>(null);
  const arch = useRef<HTMLDivElement>(null);
  const progress = useRef(0);
  const intro = useRef({ v: 0 });
  const layout = useRef<HeroLayout | null>(null);
  const timer = useRef<gsap.core.Tween | null>(null);
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);
  const { ready } = usePageTransition();

  const pieces = useMemo(() => FEATURED.map((s) => getPiece(s)!), []);
  const items = useMemo(() => pieces.map((p) => ({ kind: p.model, metal: p.metal })), [pieces]);
  const piece = pieces[active];

  // Measure the arch (untransformed) so the 3D piece sits inside it.
  useEffect(() => {
    const measure = () => {
      const h = root.current, a = arch.current;
      if (!h || !a) return;
      layout.current = {
        cx: a.offsetLeft + a.offsetWidth / 2,
        cy: a.offsetTop + a.offsetHeight * 0.5,
        w: a.offsetWidth,
        h: a.offsetHeight,
        W: h.offsetWidth,
        H: h.offsetHeight,
      };
    };
    measure();
    const ro = new ResizeObserver(measure);
    if (root.current) ro.observe(root.current);
    if (arch.current) ro.observe(arch.current);
    return () => ro.disconnect();
  }, []);

  useGSAP(
    () => {
      ScrollTrigger.create({
        trigger: root.current,
        start: "top top",
        end: "bottom top",
        onUpdate: (s) => (progress.current = s.progress),
      });
      const st = { trigger: root.current, start: "top top", end: "bottom top", scrub: true };
      gsap.to(".hero__arch", { scale: 1.12, yPercent: -6, ease: "none", scrollTrigger: st });
      gsap.to(".hero__title", { yPercent: -40, ease: "none", scrollTrigger: st });
      // The photographs drift inside their panels, and the panels part slightly.
      gsap.to(".hero__panel-img", { yPercent: 12, ease: "none", scrollTrigger: st });
      gsap.to(".hero__panel--l", { xPercent: -8, ease: "none", scrollTrigger: st });
      gsap.to(".hero__panel--r", { xPercent: 8, ease: "none", scrollTrigger: st });
      gsap.to(".hero__side, .hero__card", { opacity: 0, y: -50, ease: "none", scrollTrigger: { trigger: root.current, start: "8% top", end: "55% top", scrub: true } });
    },
    { scope: root }
  );

  useGSAP(
    () => {
      if (!ready) return;
      const tl = gsap.timeline({ delay: 0.1 });
      tl.fromTo(".hero__arch-bg", DEVELOP.from, { ...DEVELOP.to, duration: 1.8 }, 0)
        .fromTo(intro.current, { v: 0 }, { v: 1, duration: 2.6, ease: "power2.out" }, 0.7)
        .fromTo(".hero__title .ln > span", { yPercent: 110, y: 0 }, { yPercent: 0, duration: 1.6, ease: "expo.out", stagger: 0.09 }, 0.5)
        .fromTo(".hero__fade", { opacity: 0, y: 16 }, { opacity: 1, y: 0, duration: 1.2, ease: "expo.out", stagger: 0.06 }, 0.9)
        .fromTo(".hero__panel", DEVELOP.from, { ...DEVELOP.to, duration: 1.7, stagger: 0.12 }, 0.15)
        .fromTo(".hero__panel-img", { scale: 1.3 }, { scale: 1.06, duration: 2.6, ease: "expo.out", stagger: 0.12 }, 0.4)
        .fromTo(".hero__badge", { opacity: 0, scale: 0.6, rotate: -90 }, { opacity: 1, scale: 1, rotate: 0, duration: 1.6, ease: "expo.out" }, 1.2);
    },
    { scope: root, dependencies: [ready] }
  );

  // Auto-advance through the featured pieces; each tab fills as its time runs.
  useGSAP(
    () => {
      if (!ready) return;
      timer.current?.kill();
      gsap.set(".hero__tab i", { scaleX: 0 });
      timer.current = gsap.fromTo(
        `.hero__tab:nth-child(${active + 1}) i`,
        { scaleX: 0 },
        { scaleX: 1, duration: CYCLE, ease: "none", delay: active === 0 ? 2.2 : 0, onComplete: () => setActive((a) => (a + 1) % FEATURED.length) }
      );
      if (paused) timer.current.pause();
      gsap.fromTo(".hero__card .cap", { yPercent: 100, opacity: 0 }, { yPercent: 0, opacity: 1, duration: 1, ease: "expo.out", stagger: 0.05, delay: 0.35 });
    },
    { scope: root, dependencies: [ready, active] }
  );
  // The photographs shift slightly with the pointer, in opposite directions.
  useEffect(() => {
    if (window.matchMedia("(hover: none)").matches) return;
    const l = root.current?.querySelector(".hero__panel--l .hero__panel-move");
    const r = root.current?.querySelector(".hero__panel--r .hero__panel-move");
    if (!l || !r) return;
    const lx = gsap.quickTo(l, "x", { duration: 1.2, ease: "power3" }), ly = gsap.quickTo(l, "y", { duration: 1.2, ease: "power3" });
    const rx = gsap.quickTo(r, "x", { duration: 1.4, ease: "power3" }), ry = gsap.quickTo(r, "y", { duration: 1.4, ease: "power3" });
    const move = (e: PointerEvent) => {
      const nx = e.clientX / window.innerWidth - 0.5, ny = e.clientY / window.innerHeight - 0.5;
      lx(nx * -18); ly(ny * -12);
      rx(nx * -24); ry(ny * -14);
    };
    window.addEventListener("pointermove", move);
    return () => window.removeEventListener("pointermove", move);
  }, []);

  useEffect(() => {
    if (paused) timer.current?.pause();
    else timer.current?.resume();
  }, [paused]);

  return (
    <section ref={root} className="hero">
      <div ref={arch} className="hero__arch" aria-hidden="true">
        <div className="hero__arch-bg">
          <span key={active} className="hero__arch-ghost">{String(active + 1).padStart(2, "0")}</span>
        </div>
        <svg className="hero__badge" viewBox="0 0 120 120">
          <defs>
            <path id="badge-circle" d="M60,60 m-46,0 a46,46 0 1,1 92,0 a46,46 0 1,1 -92,0" />
          </defs>
          <circle cx="60" cy="60" r="59" />
          <text>
            <textPath href="#badge-circle" textLength="286" lengthAdjust="spacing">Made by hand · Made to outlast · Western Jewellers ·</textPath>
          </text>
          <path d="M60 50 L66 60 L60 70 L54 60 Z" />
        </svg>
      </div>

      <div className="hero__panel hero__panel--l" aria-hidden="true">
        <div className="hero__panel-move">
          <div className="hero__panel-img">
            {pieces.map((p, i) => (
              <div key={p.slug} className={`hero__slide${i === active ? " is-active" : ""}`}>
                <Photo img={IMG[WORN[p.slug]]} sizes="(max-width: 720px) 100vw, 34vw" reveal={false} parallax={0} priority={i === 0} />
              </div>
            ))}
          </div>
        </div>
        <span className="micro hero__panel-cap hero__fade">
          <span>{piece.name}</span> — as worn
        </span>
      </div>
      <TLink href="/maison" className="hero__panel hero__panel--r" data-cursor="Atelier" aria-label="The atelier">
        <div className="hero__panel-move">
          <div className="hero__panel-img">
            <Photo img={IMG.benchExamine} sizes="34vw" reveal={false} parallax={0} priority />
          </div>
        </div>
        <span className="micro hero__panel-cap hero__fade">
          <span>The atelier</span> — made by hand
        </span>
      </TLink>

      <HeroStage className="hero__view" items={items} active={active} progress={progress} intro={intro} layout={layout} />

      <div className="hero__side">
        <h1 className="hero__title" aria-label="Made by hand, worn for life.">
          <span className="ln"><span>Made by hand,</span></span>
          <span className="ln"><span><em>worn for life.</em></span></span>
        </h1>
        <p className="hero__lede hero__fade">
          Engagement rings, eternity bands and heirloom gold, drawn, cast, set and polished by hand in our atelier.
        </p>
        <div className="hero__ctas hero__fade">
          <Magnetic>
            <TLink href="/collections" className="btn btn--light">
              <span>Explore the collections</span>
            </TLink>
          </Magnetic>
          <TLink href="/appointment" className="link-arrow">
            Book a viewing <span>→</span>
          </TLink>
        </div>
      </div>

      <aside
        className="hero__card"
        onPointerEnter={() => setPaused(true)}
        onPointerLeave={() => setPaused(false)}
        aria-label="Featured pieces"
      >
        <div className="hero__fade">
          <div className="cap-mask">
            <span className="cap micro micro--gold">
              Featured — {String(active + 1).padStart(2, "0")} / {String(FEATURED.length).padStart(2, "0")}
            </span>
          </div>
          <div className="cap-mask">
            <span className="cap hero__card-name">{piece.name}</span>
          </div>
          <div className="cap-mask">
            <span className="cap micro">
              {piece.tagline} · {METALS[piece.metal].label}
            </span>
          </div>
          <div className="cap-mask">
            <span className="cap hero__card-buy">
              <span>{formatPrice(piece.price)}</span>
              <TLink href={`/pieces/${piece.slug}`} className="link-arrow">
                Discover <span>→</span>
              </TLink>
            </span>
          </div>
        </div>
        <div className="hero__tabs hero__fade" role="tablist">
          {pieces.map((p, i) => (
            <button
              key={p.slug}
              role="tab"
              aria-selected={i === active}
              className={`hero__tab${i === active ? " is-active" : ""}`}
              onClick={() => setActive(i)}
            >
              <span>{p.name}</span>
              <i />
            </button>
          ))}
        </div>
      </aside>

      <span className="micro hero__scroll hero__fade">
        <i /> Scroll
      </span>
    </section>
  );
}

/* ------------------------------------------------------------------ Editorial statement */

export function Editorial() {
  const root = useRef<HTMLElement>(null);
  useGSAP(
    () => {
      gsap.fromTo(".editorial__l1", { xPercent: 6 }, { xPercent: -8, ease: "none", scrollTrigger: { trigger: root.current, start: "top bottom", end: "bottom top", scrub: true } });
      gsap.fromTo(".editorial__l2", { xPercent: -4 }, { xPercent: 10, ease: "none", scrollTrigger: { trigger: root.current, start: "top bottom", end: "bottom top", scrub: true } });
      // The inset photographs open up as the lines come into view.
      gsap.fromTo(".editorial__pill", { width: "0.2em" }, { width: (i) => (i === 0 ? "1.9em" : "1.1em"), ease: "none", scrollTrigger: { trigger: ".editorial__lines", start: "top 90%", end: "center 45%", scrub: true } });
    },
    { scope: root }
  );
  return (
    <section ref={root} className="editorial">
      <Reveal className="editorial__micro" stagger={0.08}>
        <p className="micro">
          A jewel should hold a memory as well as the light. We make fewer pieces, more slowly, and stand behind every one for as long as it is worn.
        </p>
        <p className="micro">
          Explore stones in daylight, sketch at the bench and follow your piece from wax to final polish.
        </p>
        <p className="micro">
          Recycled gold. Traceable, conflict-free diamonds. Lifetime care included.
        </p>
      </Reveal>
      <div className="editorial__lines" aria-label="Bespoke fine jewellery. Made by hand, to outlast.">
        <div className="editorial__l1">
          Bespoke <Photo img={IMG.handSolitaire} className="editorial__pill" sizes="240px" reveal={false} parallax={0} /> fine jewellery.
        </div>
        <div className="editorial__l2">
          <em>Made by hand,</em> <Photo img={IMG.setting} className="editorial__pill editorial__pill--arch" sizes="200px" reveal={false} parallax={0} /> <em>to outlast.</em>
        </div>
      </div>
      <div className="editorial__cta">
        <TLink href="/maison" className="link-arrow">
          Our story <span>→</span>
        </TLink>
        <TLink href="/bespoke" className="link-arrow">
          Begin a commission <span>→</span>
        </TLink>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ Diptych (colour block) */

const PAIR: { slug: string; img: ImgKey }[] = [
  { slug: "aurelia", img: "handRing" },
  { slug: "celeste", img: "haloRing" },
];

export function Diptych() {
  const root = useRef<HTMLElement>(null);
  const [hover, setHover] = useState<string | null>(null);
  const pieces = PAIR.map((p) => ({ ...p, piece: getPiece(p.slug)! }));
  useGSAP(
    () => {
      // The 3D medallions float a little against the photographs as the section scrolls.
      gsap.utils.toArray<HTMLElement>(".diptych__medal").forEach((el, i) => {
        gsap.fromTo(el, { yPercent: 18 + i * 6 }, { yPercent: -14, ease: "none", scrollTrigger: { trigger: el, start: "top bottom", end: "bottom top", scrub: true } });
      });
      gsap.fromTo(".diptych__line .ln > span", { yPercent: 110, y: 0 }, { yPercent: 0, duration: 1.5, ease: "expo.out", stagger: 0.08, scrollTrigger: { trigger: ".diptych__head", start: "top 80%" } });
    },
    { scope: root }
  );
  return (
    <section ref={root} className="diptych">
      <div className="diptych__head">
        <Reveal as="p" className="micro">
          Signature engagement rings
          <br />
          The house&apos;s most requested pieces
        </Reveal>
        <h2 className="diptych__line" aria-label="Two stones, two ways to say forever.">
          <span className="ln"><span>Two stones, two ways</span></span>
          <span className="ln"><span><em>to say forever.</em></span></span>
        </h2>
      </div>
      <div className="diptych__panels">
        {pieces.map(({ piece: p, img }, i) => (
          <TLink
            key={p.slug}
            href={`/pieces/${p.slug}`}
            className={`diptych__panel diptych__panel--${i}`}
            data-cursor="View"
            onPointerEnter={() => setHover(p.slug)}
            onPointerLeave={() => setHover(null)}
          >
            <div className="diptych__media">
              <Photo img={IMG[img]} className="diptych__photo" sizes="(max-width: 720px) 100vw, 42vw" parallax={0.12} />
              <div className={`diptych__medal diptych__medal--${i}`}>
                <JewelView className="diptych__view" kind={p.model} metal={p.metal} active={hover === p.slug} glints zoom={0.95} />
              </div>
            </div>
            <div className="diptych__cap">
              <span className="micro">{String(i + 1).padStart(2, "0")} — {p.tagline}</span>
              <span className="diptych__name">{p.name}</span>
              <span className="micro">
                {METALS[p.metal].label} · {formatPrice(p.price)}
              </span>
              <span className="link-arrow diptych__more">
                Discover <span>→</span>
              </span>
            </div>
          </TLink>
        ))}
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ Atelier (expanding photograph) */

export function AtelierReveal() {
  const root = useRef<HTMLElement>(null);
  useGSAP(
    () => {
      const tl = gsap.timeline({ scrollTrigger: { trigger: root.current, start: "top top", end: "bottom bottom", scrub: true } });
      const from = window.innerWidth < 720 ? "inset(12% 8% 12% 8% round 160px 160px 0px 0px)" : "inset(14% 26% 14% 26% round 240px 240px 0px 0px)";
      tl.fromTo(".atelier__frame", { clipPath: from }, { clipPath: "inset(0% 0% 0% 0% round 0px 0px 0px 0px)", ease: "none", duration: 1 }, 0)
        .fromTo(".atelier__frame img", { scale: 1.3 }, { scale: 1, ease: "none", duration: 1 }, 0)
        .fromTo(".atelier__side--l", { xPercent: 0, opacity: 1 }, { xPercent: -120, opacity: 0, ease: "none", duration: 0.6 }, 0)
        .fromTo(".atelier__side--r", { xPercent: 0, opacity: 1 }, { xPercent: 120, opacity: 0, ease: "none", duration: 0.6 }, 0)
        .fromTo(".atelier__copy > *", { opacity: 0, y: 40 }, { opacity: 1, y: 0, ease: "none", stagger: 0.05, duration: 0.3 }, 0.62);
    },
    { scope: root }
  );
  return (
    <section ref={root} className="atelier" aria-label="The atelier">
      <div className="atelier__stage">
        <Photo img={IMG.benchPortrait} className="atelier__side atelier__side--l" sizes="20vw" reveal={false} parallax={0} />
        <Photo img={IMG.drawing} className="atelier__side atelier__side--r" sizes="20vw" reveal={false} parallax={0} />
        <Photo img={IMG.benchWoman} className="atelier__frame" sizes="100vw" reveal={false} parallax={0}>
          <div className="atelier__shade" />
        </Photo>
        <div className="atelier__copy">
          <span className="micro">The atelier</span>
          <p className="atelier__line">
            Four pairs of hands.
            <br />
            <em>Forty hours. One ring.</em>
          </p>
          <TLink href="/maison" className="link-arrow">
            Meet the makers <span>→</span>
          </TLink>
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ Lookbook */

const LOOKS: { img: ImgKey; slug: string }[] = [
  { img: "handRing", slug: "aurelia" },
  { img: "earDrop", slug: "rosee" },
  { img: "neckPendant", slug: "lumiere-drop" },
  { img: "wristBangle", slug: "heritage-bangle" },
  { img: "handsBands", slug: "perpetua" },
  { img: "hoops", slug: "aurum-hoops" },
];
const KIND_LABEL: Record<string, string> = {
  solitaire: "Engagement ring",
  halo: "Engagement ring",
  trilogy: "Engagement ring",
  eternity: "Eternity band",
  pendant: "Pendant",
  bangle: "Bangle",
  hoops: "Hoop earrings",
  drops: "Drop earrings",
};
const LOOK_TIME = 5; // seconds per look while auto-playing

export function Lookbook() {
  const root = useRef<HTMLElement>(null);
  const [active, setActive] = useState(0);
  const [prev, setPrev] = useState<number | null>(null);
  const [hold, setHold] = useState(false);
  const [inView, setInView] = useState(false);
  const looks = useMemo(() => LOOKS.map((l) => ({ ...l, piece: getPiece(l.slug)! })), []);
  const look = looks[active];

  const show = (i: number) => {
    if (i === active) return;
    setPrev(active);
    setActive(i);
  };

  // Advance on its own while the section is on screen and the visitor isn't browsing the list.
  useEffect(() => {
    const io = new IntersectionObserver(([e]) => setInView(e.isIntersecting), { threshold: 0.35 });
    if (root.current) io.observe(root.current);
    return () => io.disconnect();
  }, []);
  useEffect(() => {
    if (!inView || hold) return;
    const t = window.setTimeout(() => show((active + 1) % looks.length), LOOK_TIME * 1000);
    return () => window.clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active, inView, hold]);

  useGSAP(
    () => {
      const st = { trigger: root.current, start: "top 72%" };
      gsap.fromTo(".lookbook__title .ln > span", { yPercent: 110, y: 0 }, { yPercent: 0, duration: 1.5, ease: "expo.out", scrollTrigger: st });
      gsap.fromTo(".lookbook__head .fade", { opacity: 0, y: 14 }, { opacity: 1, y: 0, duration: 1.2, ease: "expo.out", stagger: 0.08, delay: 0.2, scrollTrigger: st });
      gsap.fromTo(".lookbook__index li", { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 1.1, ease: "expo.out", stagger: 0.05, scrollTrigger: { trigger: ".lookbook__index", start: "top 85%" } });
      gsap.fromTo(".lookbook__frame", { clipPath: "inset(12% 12% 12% 12%)", opacity: 0 }, { clipPath: "inset(0% 0% 0% 0%)", opacity: 1, duration: 1.8, ease: "expo.out", scrollTrigger: { trigger: ".lookbook__stage", start: "top 85%" } });
    },
    { scope: root }
  );
  useGSAP(
    () => {
      gsap.fromTo(".lookbook__cap .cap", { yPercent: 100, opacity: 0 }, { yPercent: 0, opacity: 1, duration: 0.9, ease: "expo.out", stagger: 0.04, delay: 0.25 });
    },
    { scope: root, dependencies: [active] }
  );

  return (
    <section ref={root} className="lookbook">
      <header className="lookbook__head">
        <span className="micro micro--gold fade">The lookbook</span>
        <h2 className="lookbook__title" aria-label="Worn, not kept.">
          <span className="ln"><span>Worn, <em>not kept.</em></span></span>
        </h2>
        <p className="lookbook__note fade">Fine jewellery is made to be lived in. Every piece here is made to order in our atelier.</p>
      </header>

      <div className="lookbook__body">
        <ol className="lookbook__index" onPointerEnter={() => setHold(true)} onPointerLeave={() => setHold(false)}>
          {looks.map((l, i) => (
            <li key={l.slug}>
              <TLink
                href={`/pieces/${l.piece.slug}`}
                className={`look-row${i === active ? " is-active" : ""}`}
                onPointerEnter={() => show(i)}
                onFocus={() => show(i)}
              >
                <span className="look-row__n">{String(i + 1).padStart(2, "0")}</span>
                <span className="look-row__name">{l.piece.name}</span>
                <span className="look-row__price">{formatPrice(l.piece.price)}</span>
                {i === active && <i key={`${active}-${hold}-${inView}`} className={`look-row__bar${!hold && inView ? " is-running" : ""}`} style={{ animationDuration: `${LOOK_TIME}s` }} />}
              </TLink>
            </li>
          ))}
        </ol>

        <div className="lookbook__stage">
          <TLink href={`/pieces/${look.piece.slug}`} className="lookbook__frame" data-cursor="View" aria-label={`View ${look.piece.name}`}>
            {looks.map((l, i) => (
              <div key={l.slug} className={`lookbook__img${i === active ? " is-active" : ""}${i === prev ? " is-prev" : ""}`}>
                <Photo img={IMG[l.img]} sizes="(max-width: 720px) 100vw, 40vw" reveal={false} parallax={0} />
              </div>
            ))}
          </TLink>
          <div className="lookbook__cap">
            <div className="cap-mask"><span className="cap micro">{KIND_LABEL[look.piece.model]} · {METALS[look.piece.metal].label}</span></div>
            <div className="cap-mask">
              <TLink href={`/pieces/${look.piece.slug}`} className="cap link-arrow">View piece <span>→</span></TLink>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
