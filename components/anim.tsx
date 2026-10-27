"use client";

import { useRef, type ReactNode } from "react";

type Tag = "h1" | "h2" | "h3" | "p" | "div" | "li" | "span";
import { useLenis } from "lenis/react";
import { gsap, useGSAP } from "@/lib/gsap";
import { usePageTransition } from "./Transition";

/** Masked line-by-line title reveal. `mode="ready"` plays when the page is uncovered; "scroll" when it enters view. */
export function SplitTitle({
  lines,
  as = "h2",
  className,
  mode = "scroll",
  delay = 0,
}: {
  lines: ReactNode[];
  as?: Tag;
  className?: string;
  mode?: "ready" | "scroll";
  delay?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const Tag = as as "div";
  const { ready } = usePageTransition();
  useGSAP(
    () => {
      if (!ready) return;
      const spans = ref.current!.querySelectorAll(".ln > span");
      gsap.fromTo(
        spans,
        { yPercent: 110, y: 0 },
        {
          yPercent: 0,
          duration: 1.4,
          ease: "expo.out",
          stagger: 0.1,
          delay,
          scrollTrigger: mode === "scroll" ? { trigger: ref.current, start: "top 88%" } : undefined,
        }
      );
    },
    { scope: ref, dependencies: [ready, mode] }
  );
  return (
    <Tag ref={ref} className={`split ${className ?? ""}`}>
      {lines.map((l, i) => (
        <span className="ln" key={i}>
          <span>{l}</span>
        </span>
      ))}
    </Tag>
  );
}

/** Soft fade-and-focus for any block. */
export function Reveal({
  children,
  as = "div",
  className,
  delay = 0,
  stagger = 0,
  mode = "scroll",
}: {
  children: ReactNode;
  as?: Tag;
  className?: string;
  delay?: number;
  stagger?: number;
  mode?: "ready" | "scroll";
}) {
  const ref = useRef<HTMLDivElement>(null);
  const Tag = as as "div";
  const { ready } = usePageTransition();
  useGSAP(
    () => {
      if (!ready) return;
      const targets = stagger ? ref.current!.children : ref.current;
      gsap.fromTo(
        targets,
        { opacity: 0, filter: "blur(8px)" },
        {
          opacity: 1,
          filter: "blur(0px)",
          duration: 1.4,
          ease: "power2.out",
          clearProps: "filter",
          delay,
          stagger,
          scrollTrigger: mode === "scroll" ? { trigger: ref.current, start: "top 90%" } : undefined,
        }
      );
    },
    { scope: ref, dependencies: [ready] }
  );
  return (
    <Tag ref={ref} className={`${stagger ? "rv-kids" : "rv"} ${className ?? ""}`}>
      {children}
    </Tag>
  );
}

/** Words light up one by one as the paragraph scrolls through the viewport. */
export function WordReveal({ text, className, as = "p" }: { text: string; className?: string; as?: Tag }) {
  const ref = useRef<HTMLDivElement>(null);
  const Tag = as as "div";
  useGSAP(
    () => {
      gsap.to(ref.current!.querySelectorAll(".w"), {
        opacity: 1,
        ease: "none",
        stagger: 0.1,
        scrollTrigger: { trigger: ref.current, start: "top 80%", end: "bottom 45%", scrub: true },
      });
    },
    { scope: ref }
  );
  const words = text.trim().split(/\s+/);
  return (
    <Tag ref={ref} className={`words ${className ?? ""}`}>
      {words.map((w, i) => (
        <span className="w" key={i}>
          {w}{" "}
        </span>
      ))}
    </Tag>
  );
}

/** Counts up to `to` when scrolled into view. */
export function Counter({ to, suffix }: { to: number; suffix?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  useGSAP(() => {
    const o = { v: 0 };
    gsap.to(o, {
      v: to,
      duration: 2.2,
      ease: "power3.out",
      scrollTrigger: { trigger: ref.current, start: "top 88%" },
      onUpdate: () => {
        if (ref.current) ref.current.textContent = String(Math.round(o.v));
      },
    });
  });
  return (
    <span className="stat__num">
      <span ref={ref}>0</span>
      {suffix && <span className="stat__suffix">{suffix}</span>}
    </span>
  );
}

/** Endless marquee that speeds up with scroll velocity. */
export function Marquee({ items, label = "Disciplines" }: { items: ReactNode[]; label?: string }) {
  const track = useRef<HTMLDivElement>(null);
  const loop = useRef<gsap.core.Tween | null>(null);
  useGSAP(() => {
    loop.current = gsap.to(track.current, { xPercent: -50, duration: 36, ease: "none", repeat: -1 });
  });
  useLenis(({ velocity }) => {
    if (!loop.current) return;
    const v = Math.min(6, Math.abs(velocity) / 6);
    gsap.to(loop.current, { timeScale: 1 + v * 1.6, duration: 0.2, overwrite: true });
    gsap.to(loop.current, { timeScale: 1, duration: 1.2, delay: 0.25 });
  });
  const row = items.map((it, i) => (
    <span key={i} className="marquee__item">
      {it}
      <b>✦</b>
    </span>
  ));
  return (
    <section className="marquee" aria-label={label}>
      <div ref={track} className="marquee__track">
        <div className="marquee__row">{row}</div>
        <div className="marquee__row" aria-hidden="true">{row}</div>
      </div>
    </section>
  );
}
