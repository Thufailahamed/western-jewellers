"use client";

import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger, useGSAP);
}

export { gsap, ScrollTrigger, useGSAP };

/** Images "develop" into view: a blurred, transparent frame sharpens in place. No directional wipe. */
export const DEVELOP = {
  from: { opacity: 0, filter: "blur(16px)" },
  to: { opacity: 1, filter: "blur(0px)", duration: 1.6, ease: "power2.out", clearProps: "filter" },
};
