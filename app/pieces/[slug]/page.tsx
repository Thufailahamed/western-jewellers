import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getCollection, getPiece, pieces } from "@/lib/data";
import { PieceDetail } from "@/components/PieceDetail";
import { CtaBand, PieceCard } from "@/components/shared";
import { Reveal, SplitTitle } from "@/components/anim";

type Props = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return pieces.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const p = getPiece((await params).slug);
  return p ? { title: `${p.name} — ${p.tagline}`, description: p.description } : {};
}

export default async function PiecePage({ params }: Props) {
  const { slug } = await params;
  const piece = getPiece(slug);
  if (!piece) notFound();
  const collection = getCollection(piece.collection)!;
  const related = [
    ...pieces.filter((p) => p.collection === piece.collection && p.slug !== slug),
    ...pieces.filter((p) => p.collection !== piece.collection),
  ].slice(0, 3);

  return (
    <>
      <PieceDetail piece={piece} collection={collection} />
      <section className="grid-section related">
        <div className="section-head">
          <SplitTitle className="h2" lines={["You may", <em key="e">also love</em>]} />
        </div>
        <Reveal className="pgrid" stagger={0.1}>
          {related.map((p) => (
            <PieceCard key={p.slug} piece={p} />
          ))}
        </Reveal>
      </section>
      <CtaBand />
    </>
  );
}
