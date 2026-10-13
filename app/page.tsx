import { articles } from "@/lib/data";
import { CollectionsRail, CraftSteps, Numbers, Quote } from "@/components/home";
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
      <CraftSteps
        eyebrow="The craft"
        title={["Four hands.", "Forty hours.", "One ring."]}
        link={{ href: "/bespoke", label: "Commission a piece" }}
        steps={[
          { title: "Drawn", image: "drawing", text: "Every commission starts as a pencil sketch at the bench, drawn with you and changed until it is right." },
          { title: "Cast", image: "casting", text: "Recycled gold and platinum, cast in-house and then hand-forged so the metal is dense and strong." },
          { title: "Set", image: "setting", text: "Each stone is set under the microscope. Claws are shaped one by one to hold it tightly and let in as much light as possible." },
          { title: "Finished", image: "polishing", text: "Seven stages of polishing, then a final check under daylight lamps. Then it is boxed and ready for you." },
        ]}
      />
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
