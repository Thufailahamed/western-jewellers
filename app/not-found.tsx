import { TLink } from "@/components/Transition";
import { JewelView } from "@/components/three/JewelView";

export default function NotFound() {
  return (
    <section className="nf">
      <JewelView className="nf__view" kind="eternity" metal="yellow" />
      <span className="eyebrow eyebrow--gold">Error 404</span>
      <h1 className="display">
        Lost <em>stone</em>
      </h1>
      <p>We couldn't find the page you were looking for.</p>
      <TLink href="/" className="btn btn--gold">
        <span>Back to the atelier</span>
      </TLink>
    </section>
  );
}
