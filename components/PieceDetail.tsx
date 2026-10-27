"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import {
  configure,
  CURRENCY,
  FINISHES,
  SHAPES,
  STONES,
  type Collection,
  type Piece,
  type ShapeId,
  type StoneId,
} from "@/lib/data";
import { IMG } from "@/lib/images";
import { gsap, useGSAP } from "@/lib/gsap";
import { TLink, usePageTransition } from "./Transition";
import { Photo } from "./Photo";
import { JewelView } from "./three/JewelView";

const money = (n: number) => n.toLocaleString("en-GB");

const GUIDES = {
  metal:
    "18k is 75% pure gold: the richest colour, and our house standard. 14k and 9k carry more alloy, so they are harder-wearing and kinder on price. Platinum is naturally white, dense and hypoallergenic.",
  stone:
    "Natural diamonds are hand-selected and graded F colour, VS clarity or better. Lab-grown stones are physically identical and graded to the same standard. Every stone comes with its own report.",
  size:
    "We size in UK letters. Not sure? Book a fitting at the atelier, or we will send you a ring sizer. Resizing within the first year is complimentary.",
};

const TRUST = [
  ["Lifetime care", "Bring your piece back every year and we will check each claw, clean and re-polish it at no charge, for life."],
  ["Complimentary delivery", "Every order travels fully insured, signed for and gift-wrapped, or collect it in person from the atelier."],
  ["Graded diamonds", "Every diamond over 0.30 ct comes with an independent grading report, and every piece with our certificate of authenticity."],
];

const SHAPE_PATHS: Record<ShapeId, ReactNode> = {
  round: <circle cx="12" cy="12" r="8.5" />,
  oval: <ellipse cx="12" cy="12" rx="6.5" ry="9" />,
  emerald: <path d="M8.5 3h7L19 6.5v11L15.5 21h-7L5 17.5v-11Z M8.5 6h7v12h-7Z" />,
  pear: <path d="M12 2.5c3 4.6 6.5 8.2 6.5 12a6.5 6.5 0 0 1-13 0c0-3.8 3.5-7.4 6.5-12Z" />,
  cushion: <rect x="4" y="4" width="16" height="16" rx="5" />,
};

function ShapeIcon({ id }: { id: ShapeId }) {
  return (
    <svg className="pdp__shape" viewBox="0 0 24 24" aria-hidden="true">
      {SHAPE_PATHS[id]}
    </svg>
  );
}

/** A collapsible option row: "Label: value · price" that opens to show its choices. */
function Option({
  label,
  value,
  price,
  icon,
  open,
  onToggle,
  children,
}: {
  label: string;
  value: ReactNode;
  price: string;
  icon?: ReactNode;
  open: boolean;
  onToggle: () => void;
  children: ReactNode;
}) {
  const body = useRef<HTMLDivElement>(null);
  useGSAP(() => {
    gsap.to(body.current, { height: open ? "auto" : 0, duration: 0.7, ease: "expo.out" });
  }, { dependencies: [open] });
  return (
    <div className={`pdp__opt${open ? " is-open" : ""}`}>
      <button type="button" className="pdp__opt-head" onClick={onToggle} aria-expanded={open}>
        {icon}
        <span className="pdp__opt-label">
          <b>{label}:</b> {value}
        </span>
        <span className="pdp__opt-price">{price}</span>
        <i className="pdp__caret" aria-hidden="true" />
      </button>
      <div ref={body} className="pdp__opt-body" style={{ height: open ? "auto" : 0 }}>
        <div className="pdp__opt-inner">{children}</div>
      </div>
    </div>
  );
}

function Group({ title, guide, children }: { title: string; guide: string; children: ReactNode }) {
  const [info, setInfo] = useState(false);
  return (
    <div className="pdp__group">
      <div className="pdp__group-head">
        <h3>{title}</h3>
        <button type="button" className={`pdp__info${info ? " is-on" : ""}`} onClick={() => setInfo(!info)} aria-expanded={info} aria-label={`About ${title.toLowerCase()}`}>
          i
        </button>
      </div>
      {info && <p className="pdp__guide">{guide}</p>}
      {children}
    </div>
  );
}

export function PieceDetail({ piece, collection }: { piece: Piece; collection: Collection }) {
  const [finish, setFinish] = useState(() => FINISHES.find((f) => f.metal === piece.metal && f.karat === "18k")!);
  const [stone, setStone] = useState<StoneId>("natural");
  const [shape, setShape] = useState<ShapeId>("round");
  const [size, setSize] = useState<string | null>(null);
  const [open, setOpen] = useState<string | null>("metal");
  const [view, setView] = useState(0);
  const [trust, setTrust] = useState<number | null>(null);
  const [saved, setSaved] = useState(false);
  const [shared, setShared] = useState(false);
  const [arrives, setArrives] = useState("");
  const drag = useRef({ x: 0, y: 0 });
  const down = useRef<{ x: number; y: number } | null>(null);
  const root = useRef<HTMLElement>(null);
  const { ready } = usePageTransition();

  const toggle = (id: string) => setOpen(open === id ? null : id);
  const cost = piece.price == null ? null : configure(piece.price, finish, stone, shape);
  const fmt = (n: number | undefined) => (n == null ? "—" : `${CURRENCY}${money(n)}`);
  const stoneDef = STONES.find((s) => s.id === stone)!;
  const tcw = piece.specs.map(([, v]) => v.match(/[\d.]+ ct/)?.[0]).find(Boolean);
  const views = [
    { id: "360", label: "360°" },
    { id: "still", label: "Still", img: IMG[piece.image] },
    { id: "worn", label: "Worn", img: IMG[piece.worn] },
  ];

  // Made to order in three weeks; computed on the client so the date is the visitor's today.
  useEffect(() => {
    const d = new Date(Date.now() + 21 * 864e5);
    const n = d.getDate();
    const th = n % 10 === 1 && n !== 11 ? "st" : n % 10 === 2 && n !== 12 ? "nd" : n % 10 === 3 && n !== 13 ? "rd" : "th";
    setArrives(`${d.toLocaleDateString("en-GB", { weekday: "short" })} ${n}${th} ${d.toLocaleDateString("en-GB", { month: "short" })}`);
  }, []);

  // Slow idle spin until the visitor takes hold of the piece.
  useEffect(() => {
    const tick = (_: number, dt: number) => {
      if (!down.current) drag.current.x += (dt / 1000) * 0.25;
    };
    gsap.ticker.add(tick);
    return () => gsap.ticker.remove(tick);
  }, []);

  useGSAP(
    () => {
      if (!ready) return;
      gsap.fromTo(".pdp__title .ln > span", { yPercent: 110, y: 0 }, { yPercent: 0, duration: 1.4, ease: "expo.out", stagger: 0.1, delay: 0.2 });
      gsap.fromTo(".pdp__arch", { clipPath: "inset(100% 0% 0% 0%)" }, { clipPath: "inset(0% 0% 0% 0%)", duration: 1.8, ease: "expo.inOut", clearProps: "clipPath" });
      gsap.fromTo(".pdp__trust, .pdp__views", { opacity: 0, y: 12 }, { opacity: 1, y: 0, duration: 1.1, ease: "expo.out", delay: 0.45 });
      gsap.fromTo(".pdp__scroll > *, .pdp__buy", { opacity: 0, y: 18 }, { opacity: 1, y: 0, duration: 1.1, ease: "expo.out", stagger: 0.06, delay: 0.3 });
    },
    { scope: root, dependencies: [ready] }
  );

  const share = async () => {
    const data = { title: piece.name, url: location.href };
    try {
      if (navigator.share) await navigator.share(data);
      else {
        await navigator.clipboard.writeText(location.href);
        setShared(true);
        setTimeout(() => setShared(false), 1800);
      }
    } catch {}
  };

  return (
    <section ref={root} className="pdp">
      <div className="pdp__stage">
        <div
          className={`pdp__canvas${view === 0 ? " is-3d" : ""}`}
          data-cursor={view === 0 ? "Drag" : undefined}
          onPointerDown={(e) => {
            if (view) return;
            down.current = { x: e.clientX, y: e.clientY };
            (e.target as HTMLElement).setPointerCapture?.(e.pointerId);
          }}
          onPointerMove={(e) => {
            if (!down.current) return;
            drag.current.x += (e.clientX - down.current.x) * 0.01;
            drag.current.y = Math.max(-0.8, Math.min(0.8, drag.current.y + (e.clientY - down.current.y) * 0.006));
            down.current = { x: e.clientX, y: e.clientY };
          }}
          onPointerUp={() => (down.current = null)}
          onPointerCancel={() => (down.current = null)}
        >
          <span className="pdp__water" aria-hidden="true">
            {piece.name}
          </span>
          <span className={`pdp__arch${view === 0 ? "" : " is-photo"}`} aria-hidden="true" />
          {view === 0 ? (
            <JewelView className="pdp__view" kind={piece.model} metal={finish.metal} glints drag={drag} zoom={1} />
          ) : (
            <Photo key={view} img={views[view].img!} className="pdp__photo" sizes="(max-width: 1000px) 100vw, 66vw" parallax={0} priority />
          )}
          {view === 0 && (
            <span className="pdp__hint mono">
              <i aria-hidden="true">↻</i> Drag to rotate
            </span>
          )}
        </div>

        <div className="pdp__views mono" role="tablist" aria-label="View">
          {views.map((v, i) => (
            <button key={v.id} type="button" role="tab" aria-selected={view === i} className={view === i ? "is-active" : ""} onClick={() => setView(i)}>
              {v.label}
            </button>
          ))}
        </div>

        <div className="pdp__head">
          <TLink href={`/collections/${collection.slug}`} className="pdp__crumb mono">
            <b>N° {collection.index}</b>
            <i aria-hidden="true" />
            {collection.name} collection
          </TLink>
          <h1 className="pdp__title">
            <span className="ln">
              <span>{piece.name}</span>
            </span>
            <span className="ln">
              <span>
                <em>{piece.tagline}</em>
              </span>
            </span>
          </h1>
          <ul className="pdp__trust mono">
            {TRUST.map(([t, d], i) => (
              <li key={t}>
                <button type="button" onClick={() => setTrust(trust === i ? null : i)} aria-expanded={trust === i}>
                  {t} <span aria-hidden="true">{trust === i ? "−" : "+"}</span>
                </button>
                {trust === i && <p className="pdp__pop">{d}</p>}
              </li>
            ))}
          </ul>
        </div>
      </div>

      <aside className="pdp__panel">
        <div className="pdp__scroll" data-lenis-prevent>
          <div className="pdp__intro">
            <p className="pdp__lede">{piece.tagline}.</p>
            <p>{piece.description}</p>
          </div>

          <Group title="Metal options" guide={GUIDES.metal}>
            <Option label="Metal" value={finish.label} price={fmt(cost?.metal)} open={open === "metal"} onToggle={() => toggle("metal")}>
              <div className="pdp__metals" role="radiogroup" aria-label="Metal">
                {FINISHES.map((f) => (
                  <button
                    key={f.id}
                    type="button"
                    role="radio"
                    aria-checked={finish.id === f.id}
                    aria-label={f.label}
                    title={f.label}
                    className={finish.id === f.id ? "is-active" : ""}
                    onClick={() => setFinish(f)}
                  >
                    <i className={`pdp__swatch pdp__swatch--${f.id === "platinum" ? "platinum" : f.metal}`} />
                    <span>{f.karat}</span>
                  </button>
                ))}
              </div>
            </Option>
          </Group>

          <Group title="Gemstone options" guide={GUIDES.stone}>
            <Option
              label="Stone"
              value={stoneDef.label}
              price={fmt(cost?.stone)}
              icon={<i className="pdp__gem" style={{ background: stoneDef.swatch }} />}
              open={open === "stone"}
              onToggle={() => toggle("stone")}
            >
              <ul className="pdp__list" role="radiogroup" aria-label="Stone">
                {STONES.map((s) => (
                  <li key={s.id}>
                    <button type="button" role="radio" aria-checked={stone === s.id} className={stone === s.id ? "is-active" : ""} onClick={() => setStone(s.id)}>
                      <i className="pdp__gem" style={{ background: s.swatch }} />
                      <span>{s.label}</span>
                      {piece.price != null && <em>{fmt(configure(piece.price, finish, s.id, shape).stone)}</em>}
                    </button>
                  </li>
                ))}
              </ul>
            </Option>
            <Option
              label="Shape"
              value={SHAPES.find((s) => s.id === shape)!.label}
              price={fmt(cost?.shape)}
              icon={<ShapeIcon id={shape} />}
              open={open === "shape"}
              onToggle={() => toggle("shape")}
            >
              <div className="pdp__shapes" role="radiogroup" aria-label="Shape">
                {SHAPES.map((s) => (
                  <button key={s.id} type="button" role="radio" aria-checked={shape === s.id} className={shape === s.id ? "is-active" : ""} onClick={() => setShape(s.id)}>
                    <ShapeIcon id={s.id} />
                    <span>{s.label}</span>
                  </button>
                ))}
              </div>
            </Option>
          </Group>

          {piece.sizes && (
            <Group title="Size options" guide={GUIDES.size}>
              <Option
                label="Size"
                value={size ?? "Select"}
                price={`${tcw ? `TCW: ${tcw} | ` : ""}${CURRENCY}0`}
                open={open === "size"}
                onToggle={() => toggle("size")}
              >
                <div className="pdp__sizes" role="radiogroup" aria-label="Ring size">
                  {piece.sizes.map((s) => (
                    <button key={s} type="button" role="radio" aria-checked={size === s} className={size === s ? "is-active" : ""} onClick={() => setSize(s)}>
                      {s}
                    </button>
                  ))}
                </div>
              </Option>
              <p className="pdp__note mono">
                Unsure of your size? <TLink href="/appointment">Book a fitting at the atelier</TLink>
              </p>
            </Group>
          )}

          <div className="pdp__included">
            <p>Included, with compliments:</p>
            <ul>
              <li>Western Jewellers Certificate of Authenticity</li>
              <li>Independent Diamond Grading Report</li>
              <li>Lifetime cleaning, polishing and claw checks</li>
            </ul>
          </div>

          <dl className="pdp__specs">
            {piece.specs.map(([k, v]) => (
              <div key={k}>
                <dt className="mono">{k}</dt>
                <dd>{v}</dd>
              </div>
            ))}
          </dl>
        </div>

        <div className="pdp__buy">
          <div className="pdp__total">
            <span className="pdp__eta">{arrives ? `Order today and receive by ${arrives}` : "Made to order in three weeks"}</span>
            <span className="pdp__price">
              {cost ? (
                <>
                  <small>{CURRENCY}</small>
                  {money(cost.total)}
                </>
              ) : (
                "Price on request"
              )}
            </span>
          </div>
          <div className="pdp__actions">
            <button type="button" className={`pdp__icon${saved ? " is-on" : ""}`} onClick={() => setSaved(!saved)} aria-pressed={saved} aria-label="Save to wishlist">
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path d="M6.5 3.5h11v17L12 16.3l-5.5 4.2Z" />
              </svg>
            </button>
            <button type="button" className="pdp__icon" onClick={share} aria-label="Share">
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path d="M14 5.5 20 11l-6 5.5M20 11h-8.5C7.5 11 4.5 13.5 4 18.5" />
              </svg>
              {shared && <span className="pdp__toast mono">Link copied</span>}
            </button>
            <TLink href="/appointment" className="pdp__cta">
              <span>Reserve this piece</span>
            </TLink>
          </div>
        </div>
      </aside>
    </section>
  );
}
