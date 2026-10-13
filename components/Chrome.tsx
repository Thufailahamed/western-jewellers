"use client";

import { useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import { usePathname } from "next/navigation";
import { useLenis } from "lenis/react";
import { gsap, useGSAP } from "@/lib/gsap";
import { TLink, usePageTransition } from "./Transition";
import { articles, collections, formatPrice, pieces, piecesIn } from "@/lib/data";
import type { SwapItem } from "./three/SwapPieces";
import { Photo } from "./Photo";
import { IMG } from "@/lib/images";

/* ------------------------------------------------------------------ Loader */

export function Loader() {
  const { setReady } = usePageTransition();
  const lenis = useLenis();
  const root = useRef<HTMLDivElement>(null);
  const [done, setDone] = useState(false);
  const lenisRef = useRef(lenis);
  lenisRef.current = lenis;

  useEffect(() => {
    if (!done) lenis?.stop();
  }, [lenis, done]);

  useGSAP(
    () => {
      const count = root.current!.querySelector(".loader__count")!;
      const p = { v: 0 };
      const fonts = document.fonts?.ready ?? Promise.resolve();
      const tl = gsap.timeline({ paused: true });
      tl.fromTo(".loader__mark span", { yPercent: 110, y: 0 }, { yPercent: 0, duration: 1.2, ease: "expo.out", stagger: 0.08 }, 0.1).to(
        p,
        {
          v: 100,
          duration: 1.9,
          ease: "power3.inOut",
          onUpdate: () => {
            count.textContent = String(Math.round(p.v)).padStart(3, "0");
            gsap.set(".loader__bar span", { scaleX: p.v / 100 });
          },
        },
        0.2
      );
      tl.play();
      Promise.all([fonts, new Promise((r) => tl.eventCallback("onComplete", r))]).then(() => {
        gsap
          .timeline({ onComplete: () => setDone(true) })
          .to(".loader__mark span", { yPercent: -110, duration: 0.8, ease: "expo.in", stagger: 0.05 })
          .to(".loader__bar, .loader__meta", { opacity: 0, duration: 0.4 }, "<")
          .to(root.current, { clipPath: "inset(0 0 100% 0)", duration: 1.2, ease: "expo.inOut" }, "-=0.2")
          .add(() => {
            setReady(true);
            lenisRef.current?.start();
          }, "-=0.7");
      });
    },
    { scope: root }
  );

  if (done) return null;
  return (
    <div ref={root} className="loader" aria-hidden="true">
      <div className="loader__mark">
        <span>W</span>
        <span className="loader__j">J</span>
      </div>
      <div className="loader__bar">
        <span />
      </div>
      <div className="loader__meta">
        <span>Western Jewellers</span>
        <span className="loader__count">000</span>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ Cursor */

export function Cursor() {
  const el = useRef<HTMLDivElement>(null);
  const [label, setLabel] = useState("");

  useEffect(() => {
    if (window.matchMedia("(hover: none), (pointer: coarse)").matches) return;
    const c = el.current!;
    const xTo = gsap.quickTo(c, "x", { duration: 0.45, ease: "power3" });
    const yTo = gsap.quickTo(c, "y", { duration: 0.45, ease: "power3" });
    const move = (e: PointerEvent) => {
      xTo(e.clientX);
      yTo(e.clientY);
      c.classList.add("is-visible");
    };
    const over = (e: PointerEvent) => {
      const t = e.target as HTMLElement;
      const labelled = t.closest<HTMLElement>("[data-cursor]");
      const hov = t.closest("a, button, label, input, textarea, select, [data-hover]");
      c.classList.toggle("is-label", !!labelled);
      c.classList.toggle("is-hover", !labelled && !!hov);
      setLabel(labelled?.dataset.cursor ?? "");
    };
    const leave = () => c.classList.remove("is-visible");
    window.addEventListener("pointermove", move);
    document.addEventListener("pointerover", over);
    document.documentElement.addEventListener("pointerleave", leave);
    return () => {
      window.removeEventListener("pointermove", move);
      document.removeEventListener("pointerover", over);
      document.documentElement.removeEventListener("pointerleave", leave);
    };
  }, []);

  return (
    <div ref={el} className="cursor" aria-hidden="true">
      <span className="cursor__label">{label}</span>
    </div>
  );
}

/* ------------------------------------------------------------------ Magnetic */

export function Magnetic({ children, strength = 0.35 }: { children: React.ReactElement; strength?: number }) {
  const ref = useRef<HTMLSpanElement>(null);
  useEffect(() => {
    const host = ref.current;
    const target = host?.firstElementChild as HTMLElement | null;
    if (!host || !target || window.matchMedia("(hover: none)").matches) return;
    const xTo = gsap.quickTo(target, "x", { duration: 0.8, ease: "elastic.out(1, 0.4)" });
    const yTo = gsap.quickTo(target, "y", { duration: 0.8, ease: "elastic.out(1, 0.4)" });
    const move = (e: PointerEvent) => {
      const r = host.getBoundingClientRect();
      xTo((e.clientX - r.left - r.width / 2) * strength);
      yTo((e.clientY - r.top - r.height / 2) * strength * 1.2);
    };
    const leave = () => {
      xTo(0);
      yTo(0);
    };
    host.addEventListener("pointermove", move);
    host.addEventListener("pointerleave", leave);
    return () => {
      host.removeEventListener("pointermove", move);
      host.removeEventListener("pointerleave", leave);
    };
  }, [strength]);
  return (
    <span ref={ref} className="magnetic">
      {children}
    </span>
  );
}

/* ------------------------------------------------------------------ Text roll link */

export function Roll({ children }: { children: string }) {
  return (
    <span className="roll">
      <span data-text={children}>{children}</span>
    </span>
  );
}

/* ------------------------------------------------------------------ Nav */

const MenuCanvas = dynamic(() => import("./three/MenuCanvas"), { ssr: false });

type MenuItem = { href: string; label: string; kicker: string; title: string; note: string; piece: SwapItem; count?: number };

const MENU: MenuItem[] = [
  { href: "/", label: "Home", kicker: "The house", title: "Maison", note: "Fine jewellery, cut and set by hand, made to be handed down.", piece: { kind: "solitaire", metal: "yellow" } },
  { href: "/collections", label: "Collections", kicker: "Four houses", title: "Collections", note: "Solitaire, Eternity, Lumière and Heritage — four ways to carry the light.", piece: { kind: "halo", metal: "white" }, count: collections.length },
  { href: "/bespoke", label: "Bespoke", kicker: "Made for one", title: "Bespoke", note: "From a pencil sketch to the final polish, made for one person only.", piece: { kind: "trilogy", metal: "rose" } },
  { href: "/maison", label: "Maison", kicker: "Our story", title: "Our story", note: "Three generations at the same bench. Recycled gold, traceable stones.", piece: { kind: "bangle", metal: "yellow" } },
  { href: "/journal", label: "Journal", kicker: "Notes & guides", title: "Journal", note: "Guides to choosing stones, atelier stories and our makers' advice.", piece: { kind: "pendant", metal: "yellow" }, count: articles.length },
  { href: "/appointment", label: "Book a viewing", kicker: "By appointment", title: "Visit", note: "A private hour with a maker, a tray of stones and a sketch to take home.", piece: { kind: "eternity", metal: "white" } },
];
const pad = (n: number) => String(n).padStart(2, "0");
const MENU_PIECES = MENU.map((m) => m.piece);

export function Nav() {
  const pathname = usePathname();
  const [hidden, setHidden] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const [everOpened, setEverOpened] = useState(false);
  const [mega, setMega] = useState(false);
  const megaTimer = useRef<number | undefined>(undefined);
  const [hoverIdx, setHoverIdx] = useState(0);
  const [megaIdx, setMegaIdx] = useState(0);
  const lenis = useLenis(({ scroll, direction }) => {
    setHidden(scroll > 160 && direction === 1 && !open);
    setScrolled(scroll > 40);
    if (direction === 1 && scroll > 160) setMega(false);
  });

  const active = (href: string) => (href === "/" ? pathname === "/" : pathname === href || pathname.startsWith(href + "/"));
  const currentIdx = Math.max(0, MENU.findIndex((m) => active(m.href)));

  useEffect(() => {
    setOpen(false);
    setMega(false);
  }, [pathname]);
  const wasOpen = useRef(false);
  useEffect(() => {
    if (open) {
      lenis?.stop();
      // The 3D preview only shows beside the links on wide screens.
      if (window.matchMedia("(min-width: 1101px)").matches) setEverOpened(true);
      setMega(false);
      setHoverIdx(currentIdx);
    } else if (wasOpen.current) lenis?.start();
    wasOpen.current = open;
    document.body.classList.toggle("menu-open", open);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, lenis]);
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      setOpen(false);
      setMega(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const openMega = () => {
    window.clearTimeout(megaTimer.current);
    setMega(true);
  };
  const closeMega = (delay = 160) => {
    window.clearTimeout(megaTimer.current);
    megaTimer.current = window.setTimeout(() => setMega(false), delay);
  };

  useGSAP(
    () => {
      if (!open) return;
      gsap.fromTo(".menu__label", { yPercent: 110, y: 0 }, { yPercent: 0, duration: 1.2, ease: "expo.out", stagger: 0.05, delay: 0.35 });
      gsap.fromTo(".menu__arch", { clipPath: "inset(100% 0% 0% 0%)" }, { clipPath: "inset(0% 0% 0% 0%)", duration: 1.4, ease: "expo.inOut", delay: 0.25 });
      gsap.fromTo(".menu__line", { scaleX: 0 }, { scaleX: 1, duration: 1.4, ease: "expo.inOut", stagger: 0.05, delay: 0.3 });
      gsap.fromTo(
        ".menu__eyebrow, .menu__links small, .menu__kicker, .menu__stage-top, .menu__foot > *, .menu__caption",
        { opacity: 0, y: 12 },
        { opacity: 1, y: 0, duration: 1, ease: "power2.out", stagger: 0.03, delay: 0.55 }
      );
    },
    { dependencies: [open] }
  );

  const item = MENU[hoverIdx];

  return (
    <>
      <header
        className={`nav${hidden && !mega ? " is-hidden" : ""}${scrolled && !open ? " is-scrolled" : ""}${open ? " is-open" : ""}${mega ? " is-mega" : ""}`}
        onPointerLeave={() => closeMega()}
      >
        <div className="nav__start">
          <button className="nav__menu" aria-label={open ? "Close menu" : "Open menu"} aria-expanded={open} onClick={() => setOpen((o) => !o)}>
            <span className="nav__burger">
              <span />
              <span />
            </span>
            <span className="nav__menu-label">
              <span data-a="Menu" data-b="Close" className={open ? "is-b" : undefined} />
            </span>
          </button>
          <nav className="nav__links" aria-label="Primary">
            <TLink
              href="/collections"
              className={`nav__drop${active("/collections") ? " is-active" : ""}${mega ? " is-on" : ""}`}
              aria-haspopup="true"
              aria-expanded={mega}
              onPointerEnter={openMega}
              onFocus={openMega}
            >
              <Roll>Collections</Roll>
              <svg viewBox="0 0 10 6" aria-hidden="true"><path d="M1 1l4 4 4-4" /></svg>
            </TLink>
            <TLink href="/bespoke" className={active("/bespoke") ? "is-active" : undefined} onPointerEnter={() => closeMega(0)}>
              <Roll>Bespoke</Roll>
            </TLink>
          </nav>
        </div>

        <TLink href="/" className="nav__logo" aria-label="Western Jewellers, home" onPointerEnter={() => closeMega(0)}>
          <span className="nav__logo-main">Western</span>
          <span className="nav__logo-sub">
            <i /> Jewellers <i />
          </span>
        </TLink>

        <div className="nav__end" onPointerEnter={() => closeMega(0)}>
          <nav className="nav__links" aria-label="Secondary">
            <TLink href="/maison" className={active("/maison") ? "is-active" : undefined}>
              <Roll>Maison</Roll>
            </TLink>
            <TLink href="/journal" className={active("/journal") ? "is-active" : undefined}>
              <Roll>Journal</Roll>
            </TLink>
          </nav>
          <Magnetic>
            <TLink href="/appointment" className="btn btn--ghost nav__cta">
              <span>Book a viewing</span>
            </TLink>
          </Magnetic>
        </div>

        <div className={`mega${mega ? " is-open" : ""}`} onPointerEnter={openMega} aria-hidden={!mega}>
          <div className="mega__top">
            <span className="mega__eyebrow micro">
              <span className="micro--gold">The collections</span>
              <i />
              <span>Four houses, each piece made by hand in our atelier</span>
            </span>
            <TLink href="/collections" className="link-arrow" tabIndex={mega ? 0 : -1}>
              View all {pieces.length} pieces <span>→</span>
            </TLink>
          </div>

          <div className="mega__inner">
            <TLink href={`/collections/${collections[megaIdx].slug}`} className="mega__preview" tabIndex={-1} style={{ "--i": 0 } as React.CSSProperties}>
              <span className="mega__frame">
                {collections.map((c, i) => (
                  <span key={c.slug} className={`mega__slide${i === megaIdx ? " is-active" : ""}`}>
                    <Photo img={IMG[c.image]} sizes="240px" reveal={false} parallax={0} />
                  </span>
                ))}
                <span className="mega__badge micro">N° {collections[megaIdx].index}</span>
              </span>
              <span key={megaIdx} className="mega__preview-cap">
                <em>{collections[megaIdx].name}</em>
                <span className="micro">
                  {piecesIn(collections[megaIdx].slug).length} pieces · from{" "}
                  {formatPrice(Math.min(...piecesIn(collections[megaIdx].slug).map((p) => p.price ?? Infinity)))}
                </span>
              </span>
            </TLink>

            <div className="mega__cols">
              {collections.map((c, i) => (
                <div
                  key={c.slug}
                  className={`mega__col${i === megaIdx ? " is-on" : ""}`}
                  style={{ "--i": i + 1 } as React.CSSProperties}
                  onPointerEnter={() => setMegaIdx(i)}
                  onFocus={() => setMegaIdx(i)}
                >
                  <TLink href={`/collections/${c.slug}`} className="mega__head" tabIndex={mega ? 0 : -1}>
                    <span className="mega__index micro">N° {c.index}</span>
                    <span className="mega__name">
                      <span data-text={c.name}>{c.name}</span>
                    </span>
                    <span className="mega__kicker">{c.kicker}</span>
                  </TLink>
                  <ul>
                    {piecesIn(c.slug).map((p) => (
                      <li key={p.slug}>
                        <TLink href={`/pieces/${p.slug}`} tabIndex={mega ? 0 : -1}>
                          <span>{p.name}</span>
                          <i />
                          <small>{formatPrice(p.price)}</small>
                        </TLink>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>

            <TLink href="/bespoke" className="mega__feature" tabIndex={mega ? 0 : -1} style={{ "--i": collections.length + 1 } as React.CSSProperties}>
              <Photo img={IMG.drawing} className="mega__feature-photo" sizes="260px" reveal={false} parallax={0} />
              <span className="mega__feature-arrow" aria-hidden="true">
                <svg viewBox="0 0 12 12"><path d="M2 10L10 2M4 2h6v6" /></svg>
              </span>
              <span className="mega__feature-body">
                <span className="micro">Bespoke</span>
                <span className="mega__feature-title">
                  Begin a <em>commission</em>
                </span>
                <span className="micro">From a sketch at the bench to the final polish</span>
              </span>
            </TLink>
          </div>
        </div>
      </header>
      <div className={`mega-scrim${mega ? " is-on" : ""}`} onPointerEnter={() => closeMega(0)} aria-hidden="true" />

      <div className={`menu-scrim${open ? " is-on" : ""}`} onClick={() => setOpen(false)} aria-hidden="true" />
      <div className={`menu${open ? " is-open" : ""}`} aria-hidden={!open} data-lenis-prevent>
        <nav className="menu__links" onPointerLeave={() => setHoverIdx(currentIdx)}>
          <span className="menu__eyebrow micro">
            <span className="micro--gold">Index</span>
            <i />
            <span>{pad(MENU.length)} rooms of the house</span>
          </span>
          {MENU.map((l, i) => (
            <TLink
              key={l.href}
              href={l.href}
              tabIndex={open ? 0 : -1}
              className={`${i === currentIdx ? "is-active" : ""}${i === hoverIdx ? " is-hover" : ""}`}
              onPointerEnter={() => setHoverIdx(i)}
              onFocus={() => setHoverIdx(i)}
            >
              <small>N°&nbsp;{pad(i + 1)}</small>
              <span className="menu__mask">
                <span className="menu__label">
                  <span className="menu__word" data-text={l.label}>
                    {l.label}
                  </span>
                  {l.count ? <sup>{pad(l.count)}</sup> : null}
                </span>
              </span>
              <span className="menu__kicker micro">{l.kicker}</span>
              <span className="menu__go" aria-hidden="true">
                <svg viewBox="0 0 44 12"><path d="M0 6h42M37 1l5 5-5 5" /></svg>
              </span>
              <span className="menu__line" />
            </TLink>
          ))}
        </nav>

        <aside className="menu__stage" aria-hidden="true">
          <div className="menu__stage-top micro">
            <span key={hoverIdx} className="menu__count">
              <b>{pad(hoverIdx + 1)}</b>
            </span>
            <span className="menu__progress">
              <span style={{ transform: `scaleX(${(hoverIdx + 1) / MENU.length})` }} />
            </span>
            <span>{pad(MENU.length)}</span>
          </div>
          <div className="menu__arch">
            <svg className="menu__star" viewBox="0 0 20 20"><path d="M10 0l1.6 8.4L20 10l-8.4 1.6L10 20l-1.6-8.4L0 10l8.4-1.6z" /></svg>
            {everOpened && <MenuCanvas items={MENU_PIECES} active={hoverIdx} open={open} />}
          </div>
          <div className="menu__caption">
            <span key={item.title} className="menu__preview-word">
              {item.title}
            </span>
            <p key={item.note} className="menu__note">{item.note}</p>
          </div>
        </aside>

        <div className="menu__foot">
          <div>
            <span className="micro micro--gold">Atelier</span>
            <span className="micro">Tue – Sat, 10:00 – 18:00</span>
            <span className="micro">Private appointments only</span>
          </div>
          <div>
            <span className="micro micro--gold">Collections</span>
            <span className="menu__chips">
              {collections.map((c) => (
                <TLink key={c.slug} href={`/collections/${c.slug}`} tabIndex={open ? 0 : -1} className="micro">
                  {c.name}
                </TLink>
              ))}
            </span>
          </div>
          <div>
            <span className="micro micro--gold">Follow</span>
            <span className="menu__chips">
              <a href="#" aria-disabled="true" tabIndex={open ? 0 : -1} className="micro">Instagram</a>
              <a href="#" aria-disabled="true" tabIndex={open ? 0 : -1} className="micro">Pinterest</a>
            </span>
          </div>
          <div className="menu__foot-cta">
            <TLink href="/appointment" className="btn btn--dark" tabIndex={open ? 0 : -1}>
              <span>Book a private viewing</span>
            </TLink>
          </div>
        </div>
      </div>
    </>
  );
}

/* ------------------------------------------------------------------ Footer */

const PROMISES = ["Made to order in our atelier", "Conflict-free, traceable stones", "Recycled 18k gold & platinum", "Complimentary lifetime care"];

export function Footer() {
  const root = useRef<HTMLElement>(null);
  const spot = useRef<SVGRadialGradientElement>(null);
  const ring = useRef<SVGCircleElement>(null);
  const [status, setStatus] = useState<"idle" | "error" | "sent">("idle");
  const lenis = useLenis(({ progress }) => {
    // The back-to-top ring fills as the page is read.
    ring.current?.style.setProperty("stroke-dashoffset", String(163.4 * (1 - (progress || 0))));
  });

  useGSAP(
    () => {
      // The footer content rises out from under the page above.
      gsap.fromTo(".footer__inner", { yPercent: -18 }, { yPercent: 0, ease: "none", scrollTrigger: { trigger: root.current, start: "top bottom", end: "top 20%", scrub: true } });
      gsap.fromTo(
        ".footer__mark text",
        { y: 120, opacity: 0 },
        { y: 0, opacity: 1, duration: 1.8, ease: "expo.out", scrollTrigger: { trigger: ".footer__mark", start: "top 95%" } }
      );
      gsap.fromTo(
        ".footer__reveal",
        { y: 30, opacity: 0 },
        { y: 0, opacity: 1, duration: 1.2, ease: "expo.out", stagger: 0.06, scrollTrigger: { trigger: root.current, start: "top 75%" } }
      );
    },
    { scope: root }
  );

  // A soft gold light follows the pointer across the wordmark.
  const onMove = (e: React.PointerEvent<SVGSVGElement>) => {
    const r = e.currentTarget.getBoundingClientRect();
    const g = spot.current;
    if (!g) return;
    gsap.to(g, { attr: { cx: (e.clientX - r.left) / r.width, cy: (e.clientY - r.top) / r.height }, duration: 0.8, ease: "power3.out" });
  };

  return (
    <footer ref={root} className="footer">
      <div className="footer__inner">
        <div className="footer__letter">
          <div className="footer__reveal">
            <span className="micro footer__label">The Western Letter</span>
            <p className="footer__lede">
              Stories from the bench, <em>a few times a year.</em>
            </p>
          </div>
          <form
            className={`footer__news footer__reveal${status === "error" ? " is-error" : ""}`}
            onSubmit={(e) => {
              e.preventDefault();
              const input = e.currentTarget.elements.namedItem("email") as HTMLInputElement;
              if (!input.value || !input.checkValidity()) {
                setStatus("error");
                return input.focus();
              }
              setStatus("sent");
              input.value = "";
            }}
            noValidate
          >
            <div className="footer__field">
              <input name="email" type="email" placeholder="Your email address" aria-label="Email address" onInput={() => status !== "idle" && setStatus("idle")} />
              <button type="submit" className="footer__submit" aria-label="Subscribe">
                <span>Subscribe</span>
                <i>→</i>
              </button>
            </div>
            <span className="micro footer__note" aria-live="polite">
              {status === "sent"
                ? "Thank you — you're on the list."
                : status === "error"
                  ? "Please enter a valid email address."
                  : "New collections and atelier news. Unsubscribe at any time."}
            </span>
          </form>
        </div>

        <div className="footer__grid">
          <nav className="footer__col footer__reveal" aria-label="Footer">
            <span className="micro footer__label">Explore</span>
            {[
              ["/collections", "Collections"],
              ["/bespoke", "Bespoke"],
              ["/maison", "Maison"],
              ["/journal", "Journal"],
              ["/appointment", "Book a viewing"],
            ].map(([href, label]) => (
              <TLink key={href} href={href} className="footer__link">
                <span>{label}</span>
                <i>→</i>
              </TLink>
            ))}
          </nav>
          <div className="footer__col footer__reveal">
            <span className="micro footer__label">Collections</span>
            {collections.map((c) => (
              <TLink key={c.slug} href={`/collections/${c.slug}`} className="footer__link">
                <span>
                  {c.name}
                  <sup>{String(piecesIn(c.slug).length).padStart(2, "0")}</sup>
                </span>
                <i>→</i>
              </TLink>
            ))}
          </div>
          <div className="footer__col footer__reveal">
            <span className="micro footer__label">The atelier</span>
            <p className="footer__text">
              Tuesday – Saturday
              <br />
              10:00 – 18:00
            </p>
            <p className="footer__text footer__text--muted">
              Private viewings by appointment.
              <br />
              Evenings on request.
            </p>
            <TLink href="/appointment" className="footer__pill">
              <span>Book a viewing</span>
            </TLink>
          </div>
          <div className="footer__col footer__col--end footer__reveal">
            <span className="micro footer__label">Follow</span>
            <div className="footer__social">
              <a href="#" aria-disabled="true" aria-label="Instagram" className="footer__icon">
                <svg viewBox="0 0 24 24" aria-hidden="true">
                  <rect x="3.5" y="3.5" width="17" height="17" rx="5" />
                  <circle cx="12" cy="12" r="4" />
                  <circle cx="17.2" cy="6.8" r="0.9" className="dot" />
                </svg>
              </a>
              <a href="#" aria-disabled="true" aria-label="Pinterest" className="footer__icon">
                <svg viewBox="0 0 24 24" aria-hidden="true">
                  <circle cx="12" cy="12" r="8.5" />
                  <path d="M11.2 8.6c2.6-.6 4.4.9 4 3.2-.3 1.8-1.6 2.8-2.9 2.5-.9-.2-1.2-1-1.2-1l-1.3 4.6" />
                </svg>
              </a>
            </div>
            <button
              className="footer__top"
              onClick={() => (lenis ? lenis.scrollTo(0, { duration: 2.2 }) : window.scrollTo({ top: 0, behavior: "smooth" }))}
              aria-label="Back to top"
            >
              <svg viewBox="0 0 60 60" aria-hidden="true">
                <circle cx="30" cy="30" r="26" className="track" />
                <circle ref={ring} cx="30" cy="30" r="26" className="bar" />
              </svg>
              <i>↑</i>
              <span className="micro">Back to top</span>
            </button>
          </div>
        </div>

        <ul className="footer__promises footer__reveal">
          {PROMISES.map((p) => (
            <li key={p} className="micro">
              <svg viewBox="0 0 10 10" aria-hidden="true">
                <path d="M5 0 L9 5 L5 10 L1 5 Z" />
              </svg>
              {p}
            </li>
          ))}
        </ul>

        <svg className="footer__mark" viewBox="0 0 1000 170" onPointerMove={onMove} role="img" aria-label="Western Jewellers">
          <defs>
            <linearGradient id="wm-base" x1="0" x2="0" y1="0" y2="1">
              <stop offset="0%" stopColor="#eadcc4" stopOpacity="0.22" />
              <stop offset="100%" stopColor="#eadcc4" stopOpacity="0.06" />
            </linearGradient>
            <radialGradient ref={spot} id="wm-spot" cx="0.5" cy="0.5" r="0.32">
              <stop offset="0%" stopColor="#f3dfb2" stopOpacity="1" />
              <stop offset="45%" stopColor="#c9a66b" stopOpacity="0.75" />
              <stop offset="100%" stopColor="#c9a66b" stopOpacity="0" />
            </radialGradient>
          </defs>
          <text x="0" y="150" textLength="1000" lengthAdjust="spacingAndGlyphs" fill="url(#wm-base)">WESTERN</text>
          <text x="0" y="150" textLength="1000" lengthAdjust="spacingAndGlyphs" fill="url(#wm-spot)">WESTERN</text>
        </svg>

        <div className="footer__bottom">
          <span className="micro">© {new Date().getFullYear()} Western Jewellers</span>
          <span className="micro footer__sub">
            <i /> Maison de haute joaillerie <i />
          </span>
          <span className="micro">Ethically sourced · Made by hand</span>
        </div>
      </div>
    </footer>
  );
}
