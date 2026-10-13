import type { Metadata } from "next";
import { CtaBand } from "@/components/shared";
import { Numbers, Quote } from "@/components/home";
import { PhotoMarquee } from "@/components/gallery";
import { Chapters, MaisonHero, Manifesto, Values } from "@/components/maison";

export const metadata: Metadata = {
  title: "The Maison",
  description: "Three generations of jewellers, one bench. The story and values behind Western Jewellers.",
};

export default function MaisonPage() {
  return (
    <>
      <MaisonHero />
      <Manifesto />
      <Chapters />
      <Values />
      <Numbers />
      <PhotoMarquee title={["Inside", "the atelier"]} />
      <Quote images={["setting", "neckPendant"]} text="“A good setting is invisible. You should see the diamond, never the metal holding it.”" by="Head of the atelier" />
      <CtaBand />
    </>
  );
}
