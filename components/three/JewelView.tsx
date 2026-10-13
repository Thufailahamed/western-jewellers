"use client";

import { useRef, type MutableRefObject } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { PerspectiveCamera, View } from "@react-three/drei";
import * as THREE from "three";
import type { Metal, ModelKind } from "@/lib/data";
import { POSES } from "@/lib/jewelry";
import { Jewel } from "./Jewel";
import { pointer } from "./pointer";

type ShowcaseProps = {
  kind: ModelKind;
  metal: Metal;
  active?: boolean;
  glints?: boolean;
  zoom?: number;
  /** Optional externally-driven rotation offset (drag-to-rotate viewers). */
  drag?: MutableRefObject<{ x: number; y: number }>;
};

function Showcase({ kind, metal, active, glints, zoom = 1, drag }: ShowcaseProps) {
  const ref = useRef<THREE.Group>(null);
  const size = useThree((s) => s.size);
  const spin = useRef(0);
  const phase = useRef(Math.random() * Math.PI * 2);
  const pose = POSES[kind];
  // Keep pieces inside narrow (portrait) rectangles.
  const fit = Math.min(1, size.width / size.height / 0.8) * zoom;

  useFrame((state, dt) => {
    const g = ref.current;
    if (!g) return;
    const t = state.clock.elapsedTime;
    spin.current += dt * (active ? 1.6 : 0);
    const dx = drag?.current.x ?? 0;
    const dy = drag?.current.y ?? 0;
    const sway = drag ? 0 : Math.sin(t * 0.45 + phase.current) * 0.45;
    const ty = pose.rotation[1] + sway + spin.current + dx + pointer.x * 0.15;
    const tx = pose.rotation[0] + dy + pointer.y * 0.08;
    const k = 1 - Math.exp(-dt * 5);
    g.rotation.y += (ty - g.rotation.y) * k;
    g.rotation.x += (tx - g.rotation.x) * k;
    g.position.y = (pose.y ?? 0) + Math.sin(t * 0.8 + phase.current) * 0.05;
  });

  return (
    <group ref={ref} rotation={pose.rotation} scale={pose.scale * fit}>
      <Jewel kind={kind} metal={metal} glints={glints} />
    </group>
  );
}

type Props = ShowcaseProps & { className?: string; style?: React.CSSProperties };

/** A DOM-positioned window onto the shared canvas, showing one piece. */
export function JewelView({ className, style, ...rest }: Props) {
  return (
    <View className={className} style={style}>
      <PerspectiveCamera makeDefault fov={26} position={[0, 0, 10]} />
      <Showcase {...rest} />
    </View>
  );
}
