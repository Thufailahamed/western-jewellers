import type { Metadata } from "next";
import { Accordion } from "@/components/shared";
import { SplitTitle } from "@/components/anim";
import { ApptHero, ApptQuote, Reserve, TheHour } from "@/components/appointment";

export const metadata: Metadata = {
  title: "Book a private viewing",
  description: "Book a private appointment at the Western Jewellers atelier. No obligation to buy.",
};

const FAQ = [
  { title: "Is there a charge for an appointment?", body: <p>No. Appointments are complimentary and there is no obligation to buy — many people visit two or three times before deciding.</p> },
  { title: "Can I bring someone with me?", body: <p>Of course. Bring a partner, a friend or a family member — whoever you'd like a second opinion from.</p> },
  { title: "What should I bring?", body: <p>Anything that helps: photographs, screenshots, a ring that fits, or an heirloom you'd like to re-set. If you're unsure of a ring size, we'll measure it for you.</p> },
  { title: "I can't come to the atelier.", body: <p>Choose a video call when you book. We can also post a tray of sample bands and stones to you, insured, to try at home.</p> },
  { title: "How long does a piece take?", body: <p>Pieces from the collections are made to order in three to five weeks. Bespoke commissions usually take six to eight weeks from the first appointment to collection.</p> },
];

export default function AppointmentPage() {
  return (
    <>
      <ApptHero />
      <TheHour />
      <ApptQuote />
      <Reserve />
      <section className="faq afaq">
        <div className="faq__head">
          <span className="eyebrow eyebrow--gold">Before you visit</span>
          <SplitTitle className="h2" lines={["Good to", <em key="e">know.</em>]} />
        </div>
        <Accordion items={FAQ} />
      </section>
    </>
  );
}
