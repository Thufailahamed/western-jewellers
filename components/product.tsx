"use client";

import { useState, type ReactNode } from "react";
import { METALS, pieces, type Piece } from "@/lib/data";
import { IMG, type ImgKey } from "@/lib/images";
import { Photo } from "./Photo";
import { TLink } from "./Transition";
import { Accordion, PieceCard } from "./shared";
import { Reveal } from "./anim";

// Product page sections below the configurator. Copy lives here rather than in data.ts because it is the same for every piece.

/* ------------------------------------------------------------------ Ticker */

export function Ticker({ items, dark = false }: { items: string[]; dark?: boolean }) {
  const row = (
    <div className="ticker__row">
      {items.map((t) => (
        <span key={t}>
          {t}
          <i aria-hidden="true">●</i>
        </span>
      ))}
    </div>
  );
  return (
    <div className={`ticker mono${dark ? " ticker--dark" : ""}`}>
      <div className="ticker__track">
        {row}
        <div aria-hidden="true">{row}</div>
      </div>
    </div>
  );
}

export const TICKER = ["Clarity at every step", "Complimentary insured delivery", "Lifetime care, included", "Every piece made by hand"];

/* ------------------------------------------------------------------ Tabbed feature (standards, documentation) */

type Tab = { title: string; img: ImgKey; body: ReactNode };

function TabFeature({ label, tabs, href }: { label: string; tabs: Tab[]; href: string }) {
  const [i, setI] = useState(0);
  return (
    <section className="pfeat">
      <div className="pfeat__nav">
        <span className="mono pfeat__label">{label}</span>
        <ul role="tablist">
          {tabs.map((t, n) => (
            <li key={t.title}>
              <button type="button" role="tab" aria-selected={i === n} className={i === n ? "is-active" : ""} onClick={() => setI(n)}>
                {t.title}
              </button>
            </li>
          ))}
        </ul>
      </div>
      <div className="pfeat__body" key={i}>
        {tabs[i].body}
        <TLink href={href} className="pbtn">
          Learn more
        </TLink>
      </div>
      <div className="pfeat__media">
        {tabs.map((t, n) => (
          <div key={t.title} className={`pfeat__img${i === n ? " is-on" : ""}`}>
            <Photo img={IMG[t.img]} sizes="(max-width: 900px) 100vw, 30vw" reveal={false} parallax={0.08} />
          </div>
        ))}
      </div>
    </section>
  );
}

export function Standards() {
  return (
    <TabFeature
      label="Our standards"
      href="/maison"
      tabs={[
        { title: "Craft", img: "makerLoupe", body: <p>Every Western Jewellers piece is finished by hand: drawn, cast, set and polished at the bench by makers with decades of experience. Each claw is shaped under the microscope, a fraction of a millimetre at a time.</p> },
        { title: "Quality", img: "setting", body: <p>We hand-select every stone in daylight, matched for colour and brilliance rather than grade alone. Metal is recycled 9k, 14k and 18k gold or platinum, forged to make it denser and stronger.</p> },
        { title: "Delivery", img: "ringsDish", body: <p>Your piece is made to order over about three weeks, then travels to you fully insured, signed for and gift-wrapped. You are welcome to collect it from the atelier instead.</p> },
        { title: "Care", img: "polishing", body: <p>Every piece we make is covered for life. Bring it back once a year and we will check every claw, clean and re-polish it at no charge.</p> },
      ]}
    />
  );
}

const DOC_ITEMS = {
  grading: ["Unique report number, laser-inscribed on the girdle", "Shape and cutting style", "Measurements, in millimetres", "Carat weight", "Colour and clarity grade", "Cut, polish and symmetry grade", "Fluorescence", "A plotted diagram of the stone's inclusions"],
  maker: ["Metal, karat and hallmark", "Weight of the finished piece", "Every stone, its size and setting style", "The maker's name and bench mark", "Date of completion"],
  authenticity: ["Description and photograph of the piece", "Confirmation of materials and origin", "Your commission number", "Signed by the master jeweller"],
};

export function Documentation() {
  const doc = (when: string, what: string, items: string[]) => (
    <>
      <h4>When is it included:</h4>
      <p>{when}</p>
      <h4>What does it document:</h4>
      <p>{what}</p>
      <ul className="pfeat__list">
        {items.map((t) => (
          <li key={t}>{t}</li>
        ))}
      </ul>
    </>
  );
  return (
    <TabFeature
      label="Our documentation"
      href="/journal/how-to-choose-a-diamond"
      tabs={[
        { title: "Grading Report", img: "haloRing", body: doc("Every diamond of 0.30 ct or more is independently graded before we set it.", "The report grades the stone on its own, apart from the finished piece, and confirms it meets the specification it was chosen to.", DOC_ITEMS.grading) },
        { title: "Maker's Report", img: "benchExamine", body: doc("With every piece, from a plain band to a bespoke commission.", "A record of exactly how your piece was made and by whom, so it can be repaired or remade faithfully for generations.", DOC_ITEMS.maker) },
        { title: "Certificate", img: "drawing", body: doc("With every piece, for insurance and for the generations who will inherit it.", "Our certificate of authenticity confirms that the piece was made by Western Jewellers and records its materials.", DOC_ITEMS.authenticity) },
      ]}
    />
  );
}

/* ------------------------------------------------------------------ Worn by clients */

const WORN: { img: ImgKey; no: string; date: string; slug: string }[] = [
  { img: "handSolitaire", no: "0412", date: "20.07.26", slug: "aurelia" },
  { img: "neckPendant", no: "0398", date: "11.07.26", slug: "lumiere-drop" },
  { img: "handsBands", no: "0391", date: "04.07.26", slug: "perpetua" },
  { img: "portraitEarring", no: "0377", date: "28.06.26", slug: "rosee" },
  { img: "wristBangle", no: "0366", date: "19.06.26", slug: "heritage-bangle" },
  { img: "handsWhite", no: "0352", date: "07.06.26", slug: "celeste" },
  { img: "earDrop", no: "0349", date: "02.06.26", slug: "halo-hoops" },
];

export function Authored() {
  return (
    <section className="pworn">
      <Reveal as="h2" className="pworn__title">
        Time-honoured finery,
        <br />
        <em>made with you.</em>
      </Reveal>
      <div className="pworn__rail">
        {WORN.map((w) => {
          const p = pieces.find((x) => x.slug === w.slug)!;
          return (
            <TLink key={w.no} href={`/pieces/${p.slug}`} className="pworn__card" data-cursor="View">
              <Photo img={IMG[w.img]} className="pworn__img" sizes="(max-width: 720px) 72vw, 22vw" parallax={0} />
              <span className="pworn__cta mono">Shop this design</span>
              <div className="pworn__meta mono">
                <span>Commission</span>
                <span>{w.date}</span>
                <span>No. {w.no}</span>
                <span>
                  {p.name} / {METALS[p.metal].label} / Diamond
                </span>
              </div>
            </TLink>
          );
        })}
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ Reviews */

// Placeholder reviews. Replace with the house's own verified reviews.
const REVIEWS = [
  { title: "Engagement ring", body: "From the first sketch to the final fitting, every detail was considered. The stone they found for us is brighter than anything we saw elsewhere, and the setting is so fine you barely notice it.", name: "Francesca M.", date: "30-07-2026", piece: "Aurelia — 18K Yellow Gold" },
  { title: "Wedding bands", body: "We came in for two plain bands and left having designed them together at the bench. The quality is outstanding, and they sit perfectly next to my engagement ring.", name: "Claudia H.", date: "29-07-2026", piece: "Perpetua — 18K Yellow Gold" },
  { title: "Anniversary pendant", body: "Beautifully made and beautifully presented. It arrived a week earlier than promised and the certificate and maker's report make it feel like a real heirloom.", name: "Paige H.", date: "28-07-2026", piece: "Lumière Drop — 18K Yellow Gold" },
  { title: "Rose gold eternity band", body: "The team were patient with every question. The colour of the rose gold is exactly what I hoped for and the stones are perfectly matched all the way round.", name: "Beatrice L.", date: "19-05-2026", piece: "Vesper — 18K Rose Gold" },
  { title: "Bespoke bangle", body: "Seeing the drawings, then the wax, then the finished piece was a joy. It is heavier and more beautiful in person than I ever imagined.", name: "Amara O.", date: "02-05-2026", piece: "Heritage Bangle — 18K Yellow Gold" },
];

const Stars = () => (
  <span className="stars" aria-label="5 out of 5 stars">
    {"★★★★★"}
  </span>
);

export function Reviews() {
  const [page, setPage] = useState(0);
  const per = 3;
  const pages = Math.ceil(REVIEWS.length / per);
  return (
    <section className="previews">
      <div className="previews__sum">
        <h2>
          5.0 <em>stars</em>
        </h2>
        <p className="previews__count">
          <Stars /> <span className="mono">({REVIEWS.length} reviews)</span>
        </p>
        <p>Our clients return for the craftsmanship, the personal way we design together, and pieces made to be worn every day and handed down through life&apos;s biggest milestones.</p>
        <TLink href="/appointment" className="pbtn pbtn--wide">
          Write a review
        </TLink>
      </div>
      <div className="previews__img">
        <Photo img={IMG.handRing} sizes="(max-width: 900px) 100vw, 30vw" parallax={0.06} />
      </div>
      <div className="previews__list">
        {REVIEWS.slice(page * per, page * per + per).map((r) => (
          <article key={r.name} className="previews__item">
            <h3>{r.title}</h3>
            <p>{r.body}</p>
            <div className="previews__meta mono">
              <span>Author</span>
              <span>{r.date}</span>
              <span>{r.name}</span>
              <span>{r.piece}</span>
              <Stars />
            </div>
          </article>
        ))}
        <button type="button" className="previews__next mono" onClick={() => setPage((page + 1) % pages)}>
          {page + 1 < pages ? "Next" : "Back to start"} <span aria-hidden="true">→</span>
        </button>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ FAQ */

const FAQ = [
  ["How long after ordering will I receive my piece?", "Most pieces are made to order in about three weeks, then delivered by insured courier. Bespoke commissions take six to ten weeks depending on the design; we will give you a date at your first appointment."],
  ["What certification do my stones come with?", "Every diamond of 0.30 ct or more comes with an independent grading report. Every piece comes with our maker's report and a signed certificate of authenticity."],
  ["What does lifetime care include?", "Free annual cleaning, polishing and claw checks for everything we make, for as long as you own it. Manufacturing faults are repaired at no cost, forever."],
  ["Is my delivery insured?", "Yes. Every order is fully insured until it is signed for. You are also welcome to collect it in person from the atelier."],
  ["Can I change the design?", "Of course. Any piece can be adjusted — a different stone, metal or band width — or redrawn entirely. Book a private appointment and we will sketch it with you."],
  ["Are prices inclusive of VAT?", "Yes, all prices shown include VAT. Prices update as you configure metal, stone and shape."],
];

export function Faq() {
  return (
    <section className="pfaq">
      <div className="pfaq__head">
        <span className="mono pfeat__label">We&apos;re here to help</span>
        <h2>
          Frequently
          <br />
          <em>asked.</em>
        </h2>
      </div>
      <Accordion defaultOpen={null} items={FAQ.map(([title, body]) => ({ title, body: <p>{body}</p> }))} />
    </section>
  );
}

/* ------------------------------------------------------------------ Recommended */

export function Recommended({ related }: { related: Piece[] }) {
  return (
    <section className="prec">
      <span className="mono prec__label">You may also love</span>
      <Reveal className="pgrid" stagger={0.1}>
        {related.map((p) => (
          <PieceCard key={p.slug} piece={p} />
        ))}
      </Reveal>
    </section>
  );
}
