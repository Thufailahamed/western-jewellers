import type { Metadata } from "next";
import { CtaBand } from "@/components/shared";
import { Quote } from "@/components/home";
import { FieldNotes, JournalCover, JournalIndex } from "@/components/journal";

export const metadata: Metadata = {
  title: "Journal",
  description: "Guides, atelier notes and advice on choosing and caring for fine jewellery.",
};

export default function JournalPage() {
  return (
    <>
      <JournalCover />
      <JournalIndex />
      <FieldNotes />
      <Quote
        text="A piece of jewellery should outlive the person who made it."
        by="— The makers, Western Jewellers"
        images={["makerLoupe", "drops"]}
      />
      <CtaBand />
    </>
  );
}
