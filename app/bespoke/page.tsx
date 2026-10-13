import type { Metadata } from "next";
import { BespokeView } from "@/components/bespoke";

export const metadata: Metadata = {
  title: "Bespoke Haute Joaillerie | Western Jewellers",
  description:
    "Commission an original piece of fine jewellery crafted just for you, from raw sketch and tactile wax trial to final bench polish.",
};

export default function BespokePage() {
  return <BespokeView />;
}
