import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getCollection, getPiece, pieces } from "@/lib/data";
import { PieceDetail } from "@/components/PieceDetail";
import { Authored, Documentation, Faq, Recommended, Reviews, Standards, Ticker, TICKER } from "@/components/product";

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
    <div className="product">
      <PieceDetail piece={piece} collection={collection} />
      <Ticker items={TICKER} />
      <Standards />
      <Authored />
      <Documentation />
      <Reviews />
      <Faq />
      <Recommended related={related} />
      <Ticker items={TICKER} dark />
    </div>
  );
}
