import type { Metadata } from "next";
import { CollectionsView } from "@/components/collections";

export const metadata: Metadata = {
  title: "Haute Joaillerie Collections | Western Jewellers",
  description:
    "Solitaire, Eternity, Lumière and Heritage: four distinct collections of fine jewellery, hand-forged in 100% recycled 18k gold and certified gems.",
};

export default function CollectionsPage() {
  return <CollectionsView />;
}
