"use client";

import { useMemo, useRef, type MutableRefObject } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { PerspectiveCamera, View } from "@react-three/drei";
import * as THREE from "three";
import type { Metal, ModelKind } from "@/lib/data";
import { POSES } from "@/lib/jewelry";
import { Jewel } from "./Jewel";
import { pointer } from "./pointer";

export type JourneyItem = { kind: ModelKind; metal: Metal };

/** Where along the row of pieces the camera sits, in "piece index" units. Shared with the DOM captions. */
export const JOURNEY_START = 0;
const smoother = (t: number) => t * t * t * (t * (6 * t - 15) + 10);
/** Linear scroll → index, eased between whole numbers so the camera dwells on each piece. */
export const journeyIndex = (progress: number, count: number) => {
  const x = JOURNEY_START + Math.min(1, Math.max(0, progress)) * (count - 1 - JOURNEY_START);
  const base = Math.floor(x);
  return base + smoother(x - base);
};

// Gentle depth / height variation so the row reads as objects floating in space, not a carousel.
const OFFSETS: [number, number][] = [
  [0.1, 0],
  [-0.25, -1.4],
  [0.2, 0.4],
  [-0.1, -0.9],
  [0.3, 0.2],
  [-0.2, -1.2],
  [0.15, 0.3],
  [-0.15, -0.6],
];

type Refs = { progress: MutableRefObject<number>; intro: MutableRefObject<{ v: number }> };

function Piece({ item, index, spacing, scale, cam, lift }: { item: JourneyItem; index: number; spacing: number; scale: number; cam: MutableRefObject<number>; lift: () => number }) {
  const outer = useRef<THREE.Group>(null);
  const inner = useRef<THREE.Group>(null);
  const pose = POSES[item.kind];
  const [oy, oz] = OFFSETS[index % OFFSETS.length];
  const phase = index * 1.3;

  useFrame((state) => {
    const o = outer.current, n = inner.current;
    if (!o || !n) return;
    const t = state.clock.elapsedTime;
    const d = index - cam.current; // distance from centre, in pieces
    const focus = Math.max(0, 1 - Math.abs(d));
    const away = Math.abs(d); // neighbours recede into the distance on both sides
    o.position.set(index * spacing, lift() + oy * (1 - focus) + Math.sin(t * 0.7 + phase) * 0.08, oz * (1 - focus) + focus * 0.9 - Math.min(away, 2) * 1.6);
    o.scale.setScalar(scale * (0.8 + focus * 0.3) * (1 - Math.min(away, 1) * 0.2));
    // Pieces turn to face you as they pass, then turn away.
    n.rotation.set(
      pose.rotation[0] + pointer.y * 0.12 * focus,
      pose.rotation[1] - d * 0.55 + Math.sin(t * 0.4 + phase) * 0.25 + pointer.x * 0.35 * focus,
      pose.rotation[2] + d * 0.08
    );
  });

  return (
    <group ref={outer}>
      <group ref={inner} position={[0, pose.y ?? 0, 0]}>
        <Jewel kind={item.kind} metal={item.metal} glints={index < 4} />
      </group>
    </group>
  );
}

function Sparkles({ count = 140, width }: { count?: number; width: number }) {
  const ref = useRef<THREE.Points>(null);
  const geo = useMemo(() => {
    const g = new THREE.BufferGeometry();
    const pos = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      pos[i * 3] = (Math.random() - 0.1) * width;
      pos[i * 3 + 1] = (Math.random() - 0.5) * 7;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 6 - 2;
    }
    g.setAttribute("position", new THREE.BufferAttribute(pos, 3));
    return g;
  }, [count, width]);
  useFrame((s) => {
    if (ref.current) ref.current.position.y = Math.sin(s.clock.elapsedTime * 0.3) * 0.12;
  });
  return (
    <points ref={ref} geometry={geo}>
      <pointsMaterial color="#b28a4f" size={0.03} transparent opacity={0.55} depthWrite={false} />
    </points>
  );
}

function Rig({ items, progress, intro }: Refs & { items: JourneyItem[] }) {
  const camera = useThree((s) => s.camera);
  const rawViewport = useThree((s) => s.viewport);
  // The view can report a zero/NaN size before its DOM rect is measured.
  const viewport = {
    width: Number.isFinite(rawViewport.width) && rawViewport.width > 0 ? rawViewport.width : 8,
    height: Number.isFinite(rawViewport.height) && rawViewport.height > 0 ? rawViewport.height : 5,
  };
  const cam = useRef(JOURNEY_START - 2.5);
  const portrait = viewport.width < viewport.height;
  const spacing = portrait ? viewport.width * 0.9 : Math.max(3.6, viewport.width * 0.44);
  const scale = Math.min(0.85, viewport.height / 6.8, viewport.width / (portrait ? 3.6 : 4.4));
  // Leave room for the caption under the centred piece.
  const lift = () => viewport.height * (portrait ? 0.1 : 0.03);

  useFrame((_, dt) => {
    // Intro: the row slides in from the right; then scroll drives the camera along it.
    const target = journeyIndex(progress.current, items.length) - (1 - intro.current.v) * 2.5;
    cam.current += (target - cam.current) * (1 - Math.exp(-dt * 4));
    camera.position.x = cam.current * spacing;
    camera.position.y = pointer.y * -0.15;
    camera.lookAt(camera.position.x, 0, 0);
  });

  return (
    <>
      {items.map((it, i) => (
        <Piece key={i} item={it} index={i} spacing={spacing} scale={scale} cam={cam} lift={lift} />
      ))}
      <Sparkles width={spacing * (items.length + 2)} />
    </>
  );
}

export function JourneyView({ className, items, ...refs }: Refs & { className?: string; items: JourneyItem[] }) {
  return (
    <View className={className}>
      <PerspectiveCamera makeDefault fov={30} position={[0, 0, 10]} />
      <Rig items={items} {...refs} />
    </View>
  );
}
