"use client";

import { useRef, useState, type ReactNode } from "react";
import { collections, formatPrice, METALS, type Article, type Piece } from "@/lib/data";
import { gsap, useGSAP } from "@/lib/gsap";
import { Photo, PiecePhoto } from "./Photo";
import { IMG, type ImgKey } from "@/lib/images";
import { TLink } from "./Transition";
import { Magnetic } from "./Chrome";
import { Reveal, SplitTitle } from "./anim";

/* ------------------------------------------------------------------ Page hero */

export function PageHero({
  eyebrow,
  lines,
  intro,
  children,
  crumbs,
  images,
}: {
  eyebrow: string;
  lines: ReactNode[];
  intro?: string;
  children?: ReactNode;
  crumbs?: { href: string; label: string }[];
  /** A tall arched photograph with a smaller one overlapping it, beside the title. */
  images?: [ImgKey, ImgKey];
}) {
  return (
    <section className={`phero${images ? " phero--media" : ""}`}>
      {images && (
        <div className="phero__media">
          <Photo img={IMG[images[0]]} className="phero__img-a" sizes="(max-width: 720px) 70vw, 26vw" priority parallax={0.12} />
          <Photo img={IMG[images[1]]} className="phero__img-b" sizes="(max-width: 720px) 40vw, 13vw" parallax={0.22} />
        </div>
      )}
      {crumbs && <Crumbs items={crumbs} />}
      <Reveal mode="ready" className="phero__eyebrow">
        <span className="eyebrow eyebrow--gold">{eyebrow}</span>
      </Reveal>
      <SplitTitle as="h1" className="phero__title" lines={lines} mode="ready" />
      {(intro || children) && (
        <Reveal mode="ready" delay={0.25} className="phero__intro">
          {intro && <p>{intro}</p>}
          {children}
        </Reveal>
      )}
    </section>
  );
}

export function Crumbs({ items }: { items: { href: string; label: string }[] }) {
  return (
    <nav className="crumbs" aria-label="Breadcrumb">
      {items.map((c, i) => (
        <span key={c.href}>
          {i > 0 && <i>/</i>}
          {i < items.length - 1 ? <TLink href={c.href}>{c.label}</TLink> : <span aria-current="page">{c.label}</span>}
        </span>
      ))}
    </nav>
  );
}

/* ------------------------------------------------------------------ Piece card */

export function PieceCard({ piece }: { piece: Piece }) {
  const tint = collections.find((c) => c.slug === piece.collection)?.tint ?? "#ece2d2";
  return (
    <TLink href={`/pieces/${piece.slug}`} className="pcard has-worn" data-cursor="View">
      <div className="pcard__media" style={{ ["--tint" as string]: tint }}>
        <PiecePhoto image={IMG[piece.image]} worn={IMG[piece.worn]} className="pcard__view" sizes="(max-width: 720px) 90vw, 30vw" />
        <span className="pcard__metal">{METALS[piece.metal].label}</span>
      </div>
      <div className="pcard__body">
        <h3>{piece.name}</h3>
        <span className="pcard__price">{formatPrice(piece.price)}</span>
        <p>{piece.tagline}</p>
      </div>
    </TLink>
  );
}

/* ------------------------------------------------------------------ Article card */

export function ArticleCard({ article, large = false }: { article: Article; large?: boolean }) {
  const [hover, setHover] = useState(false);
  return (
    <TLink
      href={`/journal/${article.slug}`}
      className={`acard${large ? " acard--lg" : ""}`}
      data-cursor="Read"
      onPointerEnter={() => setHover(true)}
      onPointerLeave={() => setHover(false)}
    >
      <Photo img={IMG[article.image]} className={`acard__media${hover ? " is-hover" : ""}`} sizes={large ? "(max-width: 1100px) 100vw, 56vw" : "(max-width: 720px) 100vw, 33vw"} />
      <div className="acard__meta">
        <span className="eyebrow">{article.kicker}</span>
        <span className="eyebrow">{article.read} read</span>
      </div>
      <h3>{article.title}</h3>
      <p>{article.excerpt}</p>
    </TLink>
  );
}

/* ------------------------------------------------------------------ Accordion */

export function Accordion({ items, defaultOpen = 0 }: { items: { title: string; body: ReactNode }[]; defaultOpen?: number | null }) {
  const [open, setOpen] = useState<number | null>(defaultOpen);
  return (
    <div className="accordion">
      {items.map((it, i) => (
        <AccordionItem key={it.title} title={it.title} open={open === i} onToggle={() => setOpen(open === i ? null : i)}>
          {it.body}
        </AccordionItem>
      ))}
    </div>
  );
}

function AccordionItem({ title, open, onToggle, children }: { title: string; open: boolean; onToggle: () => void; children: ReactNode }) {
  const body = useRef<HTMLDivElement>(null);
  useGSAP(
    () => {
      gsap.to(body.current, { height: open ? "auto" : 0, duration: 0.8, ease: "expo.out" });
    },
    { dependencies: [open] }
  );
  return (
    <div className={`acc${open ? " is-open" : ""}`}>
      <button className="acc__head" onClick={onToggle} aria-expanded={open}>
        <span>{title}</span>
        <i aria-hidden="true" />
      </button>
      <div ref={body} className="acc__body" style={{ height: open ? "auto" : 0 }}>
        <div className="acc__inner">{children}</div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ CTA band */

const EXPECT = [
  ["A private hour", "With a maker, in a room of your own."],
  ["A tray of stones", "To hold and compare in daylight."],
  ["A sketch to keep", "Drawn with you at the bench."],
];

export function CtaBand({
  title = ["Come and see", "the atelier."],
  text,
  href = "/appointment",
  label = "Book a private viewing",
}: {
  title?: [string, string];
  text?: string;
  href?: string;
  label?: string;
}) {
  const root = useRef<HTMLElement>(null);
  useGSAP(
    () => {
      gsap.fromTo(".cta__photo", { clipPath: "inset(14% 14% 0% 14% round 999px 999px 0 0)" }, { clipPath: "inset(0% 0% 0% 0% round 999px 999px 0 0)", duration: 1.8, ease: "expo.out", scrollTrigger: { trigger: root.current, start: "top 75%" } });
      gsap.fromTo(".cta__expect li", { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 1.1, ease: "expo.out", stagger: 0.08, scrollTrigger: { trigger: ".cta__expect", start: "top 88%" } });
    },
    { scope: root }
  );
  return (
    <section ref={root} className="cta">
      <div className="cta__media">
        <Photo img={IMG.benchExamine} className="cta__photo" sizes="(max-width: 720px) 90vw, 40vw" reveal={false} parallax={0.08} />
      </div>

      <div className="cta__inner">
        <Reveal as="span" className="micro micro--gold">
          Private appointments
        </Reveal>
        <SplitTitle className="cta__title" lines={[title[0], <em key="e">{title[1]}</em>]} />
        <Reveal as="p" className="cta__text">
          {text ?? "Sit with one of our makers, hold the stones yourself and leave with a sketch. There is no obligation to buy."}
        </Reveal>
        <ol className="cta__expect">
          {EXPECT.map(([t, d]) => (
            <li key={t}>
              <span className="cta__t">{t}</span>
              <span className="cta__d">{d}</span>
            </li>
          ))}
        </ol>
        <Reveal className="cta__actions">
          <Magnetic>
            <TLink href={href} className="btn btn--dark">
              <span>{label}</span>
            </TLink>
          </Magnetic>
          <TLink href={href === "/bespoke" ? "/appointment" : "/bespoke"} className="link-arrow">
            {href === "/bespoke" ? "Or book a viewing" : "Or begin a commission"} <span>→</span>
          </TLink>
        </Reveal>
        <Reveal as="span" className="micro cta__hours">
          Tuesday – Saturday · 10:00 – 18:00
        </Reveal>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ Appointment form */

const INTERESTS = ["Engagement", "Wedding bands", "Bespoke", "Earrings & pendants", "Heritage gold", "Repairs & care"];
const SLOTS = ["Morning", "Afternoon", "Evening"];

export function AppointmentForm({ compact = false, defaultInterest }: { compact?: boolean; defaultInterest?: string }) {
  const [state, setState] = useState<"idle" | "error" | "sent">("idle");
  const [name, setName] = useState("");
  const today = new Date().toISOString().slice(0, 10);

  if (state === "sent") {
    return (
      <div className="form form--done" role="status">
        <span className="eyebrow eyebrow--gold">Request received</span>
        <p className="h3">
          Thank you, {name}. <em>We'll be in touch within one working day</em> to confirm your appointment.
        </p>
        <button className="btn btn--dark" onClick={() => setState("idle")}>
          <span>Make another request</span>
        </button>
      </div>
    );
  }

  return (
    <form
      className="form"
      noValidate
      onSubmit={(e) => {
        e.preventDefault();
        const f = e.currentTarget;
        let ok = true;
        f.querySelectorAll<HTMLInputElement>("input[required]").forEach((input) => {
          const valid = !!input.value.trim() && input.checkValidity();
          input.closest(".field")?.classList.toggle("is-error", !valid);
          if (!valid) ok = false;
        });
        if (!ok) return setState("error");
        setName(((f.elements.namedItem("name") as HTMLInputElement).value.trim().split(" ")[0]) || "");
        setState("sent");
      }}
    >
      <div className="form__row">
        <Field name="name" label="Your name" required autoComplete="name" />
        <Field name="email" type="email" label="Email address" required autoComplete="email" />
      </div>
      {!compact && <Field name="phone" type="tel" label="Phone (optional)" autoComplete="tel" />}
      <fieldset className="chips">
        <legend className="eyebrow">I'm interested in</legend>
        {INTERESTS.map((i) => (
          <label key={i}>
            <input type="checkbox" name="interest" value={i} defaultChecked={i === defaultInterest} />
            <span>{i}</span>
          </label>
        ))}
      </fieldset>
      {!compact && (
        <div className="form__row">
          <div className="field field--static">
            <label htmlFor="f-date">Preferred date</label>
            <input id="f-date" name="date" type="date" min={today} />
          </div>
          <fieldset className="chips chips--inline">
            <legend className="eyebrow">Time of day</legend>
            {SLOTS.map((s) => (
              <label key={s}>
                <input type="radio" name="slot" value={s} defaultChecked={s === "Afternoon"} />
                <span>{s}</span>
              </label>
            ))}
          </fieldset>
        </div>
      )}
      <Field name="message" label="Tell us about the piece (optional)" textarea />
      <button type="submit" className="btn btn--gold btn--full">
        <span>Request appointment</span>
      </button>
      <p className="form__note" role="status" aria-live="polite">
        {state === "error" ? "Please add your name and a valid email address." : "We reply within one working day. Your details are never shared."}
      </p>
    </form>
  );
}

export function Field({ name, label, type = "text", required, autoComplete, textarea }: { name: string; label: string; type?: string; required?: boolean; autoComplete?: string; textarea?: boolean }) {
  const id = `f-${name}`;
  return (
    <div className="field">
      {textarea ? (
        <textarea id={id} name={name} rows={3} placeholder=" " />
      ) : (
        <input id={id} name={name} type={type} placeholder=" " required={required} autoComplete={autoComplete} />
      )}
      <label htmlFor={id}>{label}</label>
    </div>
  );
}
