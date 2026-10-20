import { articles } from "@/lib/data";
import { CollectionsRail, Numbers, Quote } from "@/components/home";
import { AtelierReveal, Diptych, Editorial, Hero, Lookbook } from "@/components/editorial";
import { Journey } from "@/components/Journey";
import { PhotoMarquee } from "@/components/gallery";
import { Reveal, SplitTitle } from "@/components/anim";
import { ArticleCard, CtaBand } from "@/components/shared";
import { TLink } from "@/components/Transition";

export default function Home() {
  return (
    <>
      <Hero />
      <Journey />
      <Editorial />
      <AtelierReveal />
      <Diptych />
      <Lookbook />
      <CollectionsRail />
      <Numbers />
      <PhotoMarquee />
      <section className="journal-teaser">
        <div className="section-head">
          <div>
            <span className="eyebrow eyebrow--gold">The Journal</span>
            <SplitTitle className="h2" lines={["Notes from", <em key="e">the bench</em>]} />
          </div>
          <TLink href="/journal" className="link-arrow">
            All articles <span>→</span>
          </TLink>
        </div>
        <Reveal className="acard-grid" stagger={0.1}>
          {articles.map((a) => (
            <ArticleCard key={a.slug} article={a} />
          ))}
        </Reveal>
      </section>
      <Quote text="“They didn't sell us a ring. They helped us make one that was ours, and it was perfect.”" by="Amelia & James — Bespoke commission" />
      <CtaBand />
    </>
  );
}
