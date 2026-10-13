"use client";

import { useRef, type MutableRefObject } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { PerspectiveCamera, View } from "@react-three/drei";
import * as THREE from "three";
import { SwapPieces, type SwapItem } from "./SwapPieces";

/** Arch rectangle in px, relative to the hero (centre x/y, width, height) plus the hero size. */
export type HeroLayout = { cx: number; cy: number; w: number; h: number; W: number; H: number };

type Refs = {
  progress: MutableRefObject<number>;
  intro: MutableRefObject<{ v: number }>;
  layout: MutableRefObject<HeroLayout | null>;
};

const CAM_Z = 10;
const FOV = 30;

/** Converts a hero-relative pixel position to world units on the plane at depth z. */
function toWorld(px: number, py: number, L: HeroLayout, upp: number, z: number) {
  const k = (CAM_Z - z) / CAM_Z;
  return [(px - L.W / 2) * upp * k, -(py - L.H / 2) * upp * k] as const;
}

function upp(H: number) {
  return (2 * CAM_Z * Math.tan(THREE.MathUtils.degToRad(FOV / 2))) / Math.max(1, H);
}

function Main({ items, active, progress, intro, layout }: Refs & { items: SwapItem[]; active: number }) {
  const g = useRef<THREE.Group>(null);
  useFrame(() => {
    const L = layout.current, o = g.current;
    if (!L || !o) return;
    const u = upp(L.H);
    const [x, y] = toWorld(L.cx, L.cy, L, u, 0);
    const p = progress.current;
    // Ring diameter (at scale 1, incl. pose scale) is roughly 2.8 units; fill ~62% of the arch.
    const s = Math.min((L.w * 0.62 * u) / 2.8, (L.h * 0.5 * u) / 2.8);
    o.position.set(x, y + p * 1.4, p * 1.2);
    o.scale.setScalar(s * (1 + p * 0.15));
    o.rotation.y = p * 1.2;
  });
  return (
    <group ref={g}>
      <SwapPieces items={items} active={active} intro={intro} glints />
    </group>
  );
}

function Scene(props: Refs & { items: SwapItem[]; active: number }) {
  // Re-render on resize so the layout ref is read with the new size.
  useThree((s) => s.size);
  return (
    <>
      <Main {...props} />
    </>
  );
}

export function HeroStage({ className, ...props }: Refs & { className?: string; items: SwapItem[]; active: number }) {
  return (
    <View className={className}>
      <PerspectiveCamera makeDefault fov={FOV} position={[0, 0, CAM_Z]} />
      <Scene {...props} />
    </View>
  );
}
