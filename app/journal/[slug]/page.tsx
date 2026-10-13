import { Fragment } from "react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { articles, getArticle } from "@/lib/data";
import { ArticleCard, CtaBand, Crumbs } from "@/components/shared";
import { Reveal, SplitTitle } from "@/components/anim";
import { Photo } from "@/components/Photo";
import { IMG, type ImgKey } from "@/lib/images";
import { ArticleFigure } from "@/components/gallery";

type Props = { params: Promise<{ slug: string }> };

const FIGURES: Record<string, { images: [ImgKey, ImgKey]; caption: string }> = {
  "how-to-choose-a-diamond": { images: ["setting", "handRing"], caption: "Every stone is checked under the loupe before it is set" },
  "the-life-of-a-ring": { images: ["drawing", "polishing"], caption: "From the first drawing to the final polish" },
  "caring-for-fine-jewellery": { images: ["bandsLinen", "handsWhite"], caption: "Worn every day, cared for over a lifetime" },
};

/** Split a title into two roughly equal lines. */
function splitInTwo(title: string) {
  const words = title.split(" ");
  const half = Math.ceil(words.length / 2);
  return [words.slice(0, half).join(" "), words.slice(half).join(" ")].filter(Boolean);
}

export function generateStaticParams() {
  return articles.map((a) => ({ slug: a.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const a = getArticle((await params).slug);
  return a ? { title: a.title, description: a.excerpt } : {};
}

export default async function ArticlePage({ params }: Props) {
  const { slug } = await params;
  const a = getArticle(slug);
  if (!a) notFound();
  const more = articles.filter((x) => x.slug !== slug);

  return (
    <>
      <article className="article">
        <header className="article__head">
          <Crumbs items={[{ href: "/journal", label: "Journal" }, { href: `/journal/${a.slug}`, label: a.title }]} />
          <Reveal mode="ready" className="article__meta">
            <span className="eyebrow eyebrow--gold">{a.kicker}</span>
            <span className="eyebrow">{a.date}</span>
            <span className="eyebrow">{a.read} read</span>
          </Reveal>
          <SplitTitle as="h1" className="article__title" lines={splitInTwo(a.title)} mode="ready" />
          <Reveal mode="ready" delay={0.2} as="p" className="article__lede">
            {a.excerpt}
          </Reveal>
        </header>
        <Photo img={IMG[a.image]} className="article__media" sizes="(max-width: 1400px) 100vw, 1400px" parallax={0.14} priority />
        <div className="article__body">
          {a.body.map((para, i) => (
            <Fragment key={i}>
              {i === 3 && <ArticleFigure images={FIGURES[a.slug]?.images ?? ["benchExamine", "ringsDish"]} caption={FIGURES[a.slug]?.caption ?? "At the atelier"} />}
              {para.startsWith("## ") ? (
                <Reveal as="h2">{para.slice(3)}</Reveal>
              ) : (
                <Reveal as="p" className={i === 0 ? "dropcap" : undefined}>
                  {para}
                </Reveal>
              )}
            </Fragment>
          ))}
        </div>
      </article>
      <section className="journal related">
        <span className="eyebrow">Keep reading</span>
        <Reveal className="acard-grid acard-grid--2" stagger={0.1}>
          {more.map((m) => (
            <ArticleCard key={m.slug} article={m} />
          ))}
        </Reveal>
      </section>
      <CtaBand />
    </>
  );
}
