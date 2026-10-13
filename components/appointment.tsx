"use client";

import { useEffect, useRef, useState } from "react";
import { useLenis } from "lenis/react";
import { gsap, useGSAP } from "@/lib/gsap";
import { Photo } from "./Photo";
import { IMG, type ImgKey } from "@/lib/images";
import { Magnetic } from "./Chrome";
import { Reveal, SplitTitle, WordReveal } from "./anim";
import { Field } from "./shared";

const pad = (n: number) => String(n).padStart(2, "0");

function useScrollTo() {
  const lenis = useLenis();
  return (id: string) => {
    const el = document.getElementById(id);
    if (!el) return;
    if (lenis) lenis.scrollTo(el, { offset: -40, duration: 1.8 });
    else el.scrollIntoView({ behavior: "smooth" });
  };
}

/* ------------------------------------------------------------------ Hero */

export function ApptHero() {
  const go = useScrollTo();
  return (
    <section className="ahero">
      <div className="ahero__copy">
        <Reveal mode="ready" className="ahero__eyebrow">
          <span className="micro micro--gold">Private appointments</span>
          <i />
          <span className="micro">By invitation of the bench</span>
        </Reveal>
        <SplitTitle as="h1" className="ahero__title" mode="ready" lines={["Come and see", <em key="e">the atelier.</em>]} />
        <Reveal mode="ready" delay={0.3} className="ahero__intro">
          <p>
            Sit with one of our makers, hold the stones yourself and leave with a sketch. An unhurried hour, completely private, with no
            obligation to buy.
          </p>
          <div className="ahero__ctas">
            <Magnetic>
              <button className="btn btn--dark" onClick={() => go("reserve")}>
                <span>Reserve your hour</span>
              </button>
            </Magnetic>
            <button className="link-arrow" onClick={() => go("hour")}>
              What to expect <span>↓</span>
            </button>
          </div>
        </Reveal>
        <Reveal mode="ready" delay={0.5} stagger={0.08} className="ahero__facts">
          <div>
            <span className="micro">Duration</span>
            <b>
              60<small>min</small>
            </b>
          </div>
          <div>
            <span className="micro">Your maker</span>
            <b>1:1</b>
          </div>
          <div>
            <span className="micro">Obligation</span>
            <b>
              <em>None</em>
            </b>
          </div>
        </Reveal>
      </div>

      <div className="ahero__media">
        <Photo img={IMG.makerLoupe} className="ahero__img" sizes="(max-width: 720px) 84vw, 34vw" priority parallax={0.1} />
        <Photo img={IMG.bandsWhite} className="ahero__img-sm" sizes="(max-width: 720px) 36vw, 14vw" parallax={0.18} />
        <div className="ahero__seal" aria-hidden="true">
          <svg viewBox="0 0 120 120">
            <defs>
              <path id="ahero-seal" d="M60,60 m-47,0 a47,47 0 1,1 94,0 a47,47 0 1,1 -94,0" />
            </defs>
            <text>
              <textPath href="#ahero-seal" textLength="292" lengthAdjust="spacing">
                Private viewing · By appointment · Made by hand ·
              </textPath>
            </text>
          </svg>
          <span>✦</span>
        </div>
        <span className="ahero__caption micro">
          <span>The bench</span>
          <span>Tue – Sat · 10:00 – 18:00</span>
        </span>
      </div>

      <button className="ahero__scroll micro" onClick={() => go("hour")} aria-label="Scroll to what to expect">
        <span>Scroll</span>
        <i />
      </button>
    </section>
  );
}

/* ------------------------------------------------------------------ The hour (pinned horizontal timeline) */

const HOUR: { min: number; title: string; em: string; text: string; img: ImgKey }[] = [
  { min: 0, title: "A quiet", em: "welcome", text: "You'll be met at the door and shown to a private room. Tea, coffee or a glass of something — whatever suits the hour.", img: "benchPortrait" },
  { min: 10, title: "The", em: "conversation", text: "Tell us about the person, the occasion, the piece you've been imagining. Bring photographs, heirlooms, half-formed ideas.", img: "handsWhite" },
  { min: 25, title: "Stones in", em: "daylight", text: "A tray of diamonds and coloured stones, compared side by side under a north-facing window, with a loupe in your hand.", img: "haloRing" },
  { min: 40, title: "At the", em: "bench", text: "See how a setting is raised and a band is shaped. Try on metals and profiles until the proportions feel right.", img: "setting" },
  { min: 55, title: "A sketch to", em: "take home", text: "Your maker draws the piece in front of you. Take the sketch and a written estimate home — and take your time deciding.", img: "drawing" },
];

export function TheHour() {
  const root = useRef<HTMLElement>(null);
  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add("(min-width: 1101px)", () => {
        const track = root.current!.querySelector<HTMLElement>(".hour__track")!;
        const clock = root.current!.querySelector<HTMLElement>(".hour__clock b")!;
        const last = track.lastElementChild as HTMLElement;
        const gutter = () => parseFloat(getComputedStyle(document.documentElement).getPropertyValue("--gutter")) || 48;
        const dist = () => Math.max(0, last.offsetLeft + last.offsetWidth - track.clientWidth + gutter());
        const tween = gsap.to(track, {
          x: () => -dist(),
          ease: "none",
          scrollTrigger: {
            trigger: ".hour__pin",
            start: "top top",
            end: () => "+=" + dist(),
            pin: true,
            scrub: 1,
            invalidateOnRefresh: true,
            anticipatePin: 1,
            onUpdate: (s) => {
              gsap.set(".hour__bar span", { scaleX: s.progress });
              clock.textContent = `00:${pad(Math.round(s.progress * 59))}`;
            },
          },
        });
        gsap.utils.toArray<HTMLElement>(".hstep").forEach((card) => {
          gsap.fromTo(
            card.querySelector(".hstep__media"),
            { clipPath: "inset(18% 8% 0% 8% round 999px 999px 0 0)" },
            {
              clipPath: "inset(0% 0% 0% 0% round 999px 999px 0 0)",
              ease: "none",
              scrollTrigger: { trigger: card, containerAnimation: tween, start: "left right", end: "center 60%", scrub: true },
            }
          );
        });
      });
    },
    { scope: root }
  );

  return (
    <section ref={root} className="hour" id="hour">
      <div className="hour__pin">
        <div className="hour__head">
          <span className="eyebrow eyebrow--gold">The hour</span>
          <SplitTitle className="h2" lines={["Sixty minutes,", <em key="e">at your pace.</em>]} />
          <p>No sales floor, no counter. Just you, a maker and the stones — here is how the hour usually unfolds.</p>
          <div className="hour__clock" aria-hidden="true">
            <b>00:00</b>
            <span className="hour__bar">
              <span />
            </span>
            <span className="micro">01:00</span>
          </div>
        </div>
        <div className="hour__viewport">
        <ol className="hour__track">
          {HOUR.map((s, i) => (
            <li key={s.min} className="hstep">
              <div className="hstep__media">
                <Photo img={IMG[s.img]} sizes="(max-width: 1100px) 80vw, 24vw" reveal={false} parallax={0} />
                <span className="hstep__time micro">00:{pad(s.min)}</span>
              </div>
              <div className="hstep__body">
                <span className="hstep__num">{pad(i + 1)}</span>
                <h3>
                  {s.title} <em>{s.em}</em>
                </h3>
                <p>{s.text}</p>
              </div>
            </li>
          ))}
          <li className="hstep hstep--end">
            <span className="micro micro--gold">And afterwards</span>
            <p className="h3">
              Nothing, unless <em>you</em> decide.
            </p>
            <span className="micro">No follow-up calls, no pressure.</span>
          </li>
        </ol>
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ Quote band */

export function ApptQuote() {
  return (
    <section className="aquote">
      <Photo img={IMG.benchExamine} className="aquote__photo" sizes="(max-width: 720px) 40vw, 18vw" parallax={0.14} />
      <div className="aquote__body">
        <span className="aquote__mark" aria-hidden="true">
          “
        </span>
        <WordReveal className="aquote__text" text="We would rather you leave with a sketch and a good feeling than with a receipt. The right piece is worth waiting for." />
        <Reveal className="aquote__by">
          <span className="micro micro--gold">The atelier</span>
          <span className="micro">Three generations at the same bench</span>
        </Reveal>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ Reserve: multi-step booking */

const OCCASIONS = [
  { label: "Engagement", note: "Solitaires & halos" },
  { label: "Wedding bands", note: "Matching or made to fit" },
  { label: "Bespoke", note: "A commission from scratch" },
  { label: "Earrings & pendants", note: "Drops, hoops, lockets" },
  { label: "Heritage gold", note: "Bangles & signets" },
  { label: "Repairs & care", note: "Resizing, re-setting" },
];
const VISITS = [
  { id: "atelier", label: "At the atelier", note: "In person, in a private room" },
  { id: "video", label: "Video call", note: "From wherever you are" },
];
const SLOTS = ["10:00", "11:30", "13:00", "14:30", "16:00", "17:30"];
const STEPS = ["Occasion", "Date & time", "Your details"];

type Day = { iso: string; dow: string; d: number; mon: string };

function openDays(count: number): Day[] {
  const out: Day[] = [];
  const d = new Date();
  d.setDate(d.getDate() + 1);
  while (out.length < count) {
    const wd = d.getDay();
    if (wd >= 2 && wd <= 6) {
      out.push({
        iso: `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`,
        dow: d.toLocaleDateString("en-GB", { weekday: "short" }),
        d: d.getDate(),
        mon: d.toLocaleDateString("en-GB", { month: "short" }),
      });
    }
    d.setDate(d.getDate() + 1);
  }
  return out;
}

export function Reserve() {
  return (
    <section className="reserve" id="reserve">
      <div className="reserve__side">
        <span className="eyebrow eyebrow--gold">Reserve</span>
        <SplitTitle className="h2" lines={["Reserve", <em key="e">your hour.</em>]} />
        <p className="reserve__lede">Three short steps. We'll confirm by email within one working day and send the address and directions with it.</p>
        <Reveal className="reserve__info" stagger={0.08}>
          <div>
            <span className="micro micro--gold">Opening hours</span>
            <p>
              Tuesday – Saturday
              <br />
              10:00 – 18:00
            </p>
            <span className="micro">Evenings on request</span>
          </div>
          <div>
            <span className="micro micro--gold">The atelier</span>
            <p>By appointment only. The address is shared on confirmation.</p>
          </div>
          <div>
            <span className="micro micro--gold">Can't visit?</span>
            <p>We hold video consultations and can post a tray of samples to you.</p>
          </div>
        </Reveal>
        <Photo img={IMG.ringsDish} className="reserve__photo" sizes="(max-width: 1100px) 60vw, 22vw" parallax={0.12} />
      </div>
      <BookingForm />
    </section>
  );
}

function BookingForm() {
  const [step, setStep] = useState(0);
  const [occasion, setOccasion] = useState<string | null>(null);
  const [visit, setVisit] = useState("atelier");
  const [days, setDays] = useState<Day[]>([]);
  const [day, setDay] = useState<string | null>(null);
  const [slot, setSlot] = useState<string | null>(null);
  const [error, setError] = useState(false);
  const [sent, setSent] = useState<string | null>(null);
  const daysRef = useRef<HTMLDivElement>(null);

  useEffect(() => setDays(openDays(14)), []);

  const dayObj = days.find((x) => x.iso === day);
  const can = [!!occasion, !!day && !!slot, true][step];
  const summary = [
    occasion ?? "Occasion",
    VISITS.find((v) => v.id === visit)!.label,
    dayObj ? `${dayObj.dow} ${dayObj.d} ${dayObj.mon}` : "Date",
    slot ?? "Time",
  ];

  const scrollDays = (dir: number) => daysRef.current?.scrollBy({ left: dir * 280, behavior: "smooth" });

  if (sent) {
    return (
      <div className="bform bform--done" role="status">
        <span className="bform__seal" aria-hidden="true">✦</span>
        <span className="micro micro--gold">Request received</span>
        <p className="h3">
          Thank you, {sent}. <em>We'll be in touch within one working day</em> to confirm your visit.
        </p>
        <ul className="bform__recap">
          {summary.map((s, i) => (
            <li key={i}>
              <span className="micro">{["Occasion", "Visit", "Date", "Time"][i]}</span>
              <b>{s}</b>
            </li>
          ))}
        </ul>
        <button
          className="link-arrow"
          onClick={() => {
            setSent(null);
            setStep(0);
          }}
        >
          Make another request <span>→</span>
        </button>
      </div>
    );
  }

  return (
    <form
      className="bform"
      noValidate
      onSubmit={(e) => {
        e.preventDefault();
        if (step < 2) {
          if (can) setStep(step + 1);
          return;
        }
        const f = e.currentTarget;
        let ok = true;
        f.querySelectorAll<HTMLInputElement>("input[required]").forEach((input) => {
          const valid = !!input.value.trim() && input.checkValidity();
          input.closest(".field")?.classList.toggle("is-error", !valid);
          if (!valid) ok = false;
        });
        setError(!ok);
        if (ok) setSent((f.elements.namedItem("name") as HTMLInputElement).value.trim().split(" ")[0]);
      }}
    >
      <ol className="bform__steps">
        {STEPS.map((s, i) => (
          <li key={s} className={`${i === step ? "is-on" : ""}${i < step ? " is-done" : ""}`}>
            <button type="button" disabled={i > step} onClick={() => setStep(i)}>
              <span className="bform__dot">{i < step ? "✓" : pad(i + 1)}</span>
              <span className="micro">{s}</span>
            </button>
          </li>
        ))}
        <span className="bform__track" aria-hidden="true">
          <span style={{ transform: `scaleX(${step / (STEPS.length - 1)})` }} />
        </span>
      </ol>

      <div key={step} className="bform__panel">
        {step === 0 && (
          <>
            <fieldset className="bform__group">
              <legend className="bform__q">
                What brings you <em>in?</em>
              </legend>
              <div className="occ">
                {OCCASIONS.map((o, i) => (
                  <label key={o.label} className="occ__item">
                    <input type="radio" name="occasion" value={o.label} checked={occasion === o.label} onChange={() => setOccasion(o.label)} />
                    <span className="occ__card">
                      <span className="micro">N° {pad(i + 1)}</span>
                      <span className="occ__name">{o.label}</span>
                      <span className="occ__note">{o.note}</span>
                      <span className="occ__tick" aria-hidden="true" />
                    </span>
                  </label>
                ))}
              </div>
            </fieldset>
            <fieldset className="bform__group">
              <legend className="micro">How would you like to meet?</legend>
              <div className="seg">
                {VISITS.map((v) => (
                  <label key={v.id}>
                    <input type="radio" name="visit" value={v.id} checked={visit === v.id} onChange={() => setVisit(v.id)} />
                    <span>
                      <b>{v.label}</b>
                      <small>{v.note}</small>
                    </span>
                  </label>
                ))}
              </div>
            </fieldset>
          </>
        )}

        {step === 1 && (
          <>
            <fieldset className="bform__group">
              <div className="bform__qrow">
                <legend className="bform__q">
                  Choose a <em>day</em>
                </legend>
                <span className="bform__arrows">
                  <button type="button" aria-label="Earlier dates" onClick={() => scrollDays(-1)}>←</button>
                  <button type="button" aria-label="Later dates" onClick={() => scrollDays(1)}>→</button>
                </span>
              </div>
              <div className="days" ref={daysRef} data-lenis-prevent>
                {days.map((d) => (
                  <label key={d.iso} className="days__item">
                    <input type="radio" name="date" value={d.iso} checked={day === d.iso} onChange={() => setDay(d.iso)} />
                    <span>
                      <small>{d.dow}</small>
                      <b>{d.d}</b>
                      <small>{d.mon}</small>
                    </span>
                  </label>
                ))}
              </div>
            </fieldset>
            <fieldset className="bform__group">
              <legend className="bform__q">
                And a <em>time</em>
              </legend>
              <div className="slots">
                {SLOTS.map((s) => (
                  <label key={s}>
                    <input type="radio" name="slot" value={s} checked={slot === s} onChange={() => setSlot(s)} />
                    <span>{s}</span>
                  </label>
                ))}
                <label className="slots__wide">
                  <input type="radio" name="slot" value="Evening" checked={slot === "Evening"} onChange={() => setSlot("Evening")} />
                  <span>Evening, on request</span>
                </label>
              </div>
            </fieldset>
          </>
        )}

        {step === 2 && (
          <div className="bform__group">
            <p className="bform__q">
              Lastly, <em>about you</em>
            </p>
            <div className="form__row">
              <Field name="name" label="Your name" required autoComplete="name" />
              <Field name="email" type="email" label="Email address" required autoComplete="email" />
            </div>
            <Field name="phone" type="tel" label="Phone (optional)" autoComplete="tel" />
            <Field name="message" label="Tell us about the piece (optional)" textarea />
            <p className="bform__note" role="status" aria-live="polite">
              {error ? "Please add your name and a valid email address." : "Your details are only used to arrange your visit. Never shared."}
            </p>
          </div>
        )}
      </div>

      <div className="bform__bar">
        <div className="bform__summary">
          <span className="micro micro--gold">Your visit</span>
          <span className="bform__chips">
            {summary.map((s, i) => (
              <span key={i} className={s === ["Occasion", "", "Date", "Time"][i] ? "is-empty" : undefined}>
                {s}
              </span>
            ))}
          </span>
        </div>
        <div className="bform__nav">
          {step > 0 && (
            <button type="button" className="bform__back micro" onClick={() => setStep(step - 1)}>
              ← Back
            </button>
          )}
          <button type="submit" className="btn btn--dark" disabled={!can}>
            <span>{step < 2 ? "Continue" : "Request appointment"}</span>
          </button>
        </div>
      </div>
    </form>
  );
}
