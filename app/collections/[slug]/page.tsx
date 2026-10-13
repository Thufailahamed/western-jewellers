import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { collections, getCollection, piecesIn } from "@/lib/data";
import { CtaBand, PageHero, PieceCard } from "@/components/shared";
import { Reveal } from "@/components/anim";
import { TLink } from "@/components/Transition";
import { Photo } from "@/components/Photo";
import { IMG } from "@/lib/images";

type Props = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return collections.map((c) => ({ slug: c.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const c = getCollection((await params).slug);
  return c ? { title: `${c.name} — ${c.kicker}`, description: c.intro } : {};
}

export default async function CollectionPage({ params }: Props) {
  const { slug } = await params;
  const c = getCollection(slug);
  if (!c) notFound();
  const items = piecesIn(slug);
  const others = collections.filter((o) => o.slug !== slug);

  return (
    <>
      <PageHero
        eyebrow={`${c.index} — ${c.kicker}`}
        lines={[c.title[0], <em key="e">{c.title[1]}</em>]}
        intro={c.description}
        crumbs={[
          { href: "/collections", label: "Collections" },
          { href: `/collections/${c.slug}`, label: c.name },
        ]}
      />
      <section className="banner">
        <Photo img={IMG[c.image]} className="banner__photo" sizes="100vw" parallax={0.16} priority>
          <span className="banner__cap micro">{c.name} — {c.intro}</span>
        </Photo>
      </section>
      <section className="grid-section">
        <div className="grid-section__bar">
          <span className="eyebrow">{items.length} pieces</span>
          <span className="eyebrow">Made to order · 3–5 weeks</span>
        </div>
        <Reveal className="pgrid" stagger={0.1}>
          {items.map((p) => (
            <PieceCard key={p.slug} piece={p} />
          ))}
        </Reveal>
      </section>
      <section className="others">
        <span className="eyebrow">More collections</span>
        <div className="others__list">
          {others.map((o) => (
            <TLink key={o.slug} href={`/collections/${o.slug}`} className="others__item" data-cursor="Explore">
              <span className="others__num">{o.index}</span>
              <span className="others__name">{o.name}</span>
              <span className="others__kicker">{o.kicker}</span>
              <span className="others__arrow">→</span>
            </TLink>
          ))}
        </div>
      </section>
      <CtaBand />
    </>
  );
}
