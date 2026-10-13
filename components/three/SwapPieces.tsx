"use client";

import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import type { Metal, ModelKind } from "@/lib/data";
import { POSES } from "@/lib/jewelry";
import { Jewel } from "./Jewel";
import { pointer } from "./pointer";

export type SwapItem = { kind: ModelKind; metal: Metal };

type Props = {
  items: SwapItem[];
  active: number;
  /** 0..1 intro multiplier (pieces rise in as it reaches 1). Defaults to fully shown. */
  intro?: { current: { v: number } };
  glints?: boolean;
  pointerAmount?: number;
};

/**
 * Several pieces sharing one spot. The outgoing piece spins away and sinks;
 * the incoming one waits until the stage is nearly clear, then rises and settles.
 */
export function SwapPieces({ items, active, intro, glints, pointerAmount = 1 }: Props) {
  const weights = useRef(items.map((_, i) => (i === active ? 0.0001 : 0)));
  return (
    <>
      {items.map((it, i) => (
        <Slot key={i} item={it} index={i} active={active} weights={weights} intro={intro} glints={glints} pointerAmount={pointerAmount} />
      ))}
    </>
  );
}

function Slot({
  item,
  index,
  active,
  weights,
  intro,
  glints,
  pointerAmount,
}: {
  item: SwapItem;
  index: number;
  active: number;
  weights: React.MutableRefObject<number[]>;
  intro?: { current: { v: number } };
  glints?: boolean;
  pointerAmount: number;
}) {
  const outer = useRef<THREE.Group>(null);
  const inner = useRef<THREE.Group>(null);
  const pose = POSES[item.kind];

  useFrame((state, dt) => {
    const o = outer.current, n = inner.current;
    if (!o || !n) return;
    const w = weights.current;
    const on = index === active;
    // Incoming piece holds until everything else has mostly gone.
    const clear = w.every((v, j) => j === index || v < 0.25);
    const target = on && clear ? 1 : 0;
    const rate = target > w[index] ? 2.4 : 4.2;
    w[index] += (target - w[index]) * (1 - Math.exp(-dt * rate));
    const v = w[index];
    const i = intro ? Math.min(1, Math.max(0, intro.current.v)) : 1;
    o.visible = v > 0.002 && i > 0.001;
    if (!o.visible) return;

    const t = state.clock.elapsedTime;
    const e = v * (1 - Math.pow(1 - i, 3));
    const away = 1 - e;
    o.position.set(0, -away * 1.6 + Math.sin(t * 0.7 + index) * 0.06, -away * 1.5);
    o.scale.setScalar(Math.max(0.0001, 0.55 + 0.45 * e));
    n.rotation.set(
      pose.rotation[0] + pointer.y * 0.12 * pointerAmount,
      pose.rotation[1] + Math.sin(t * 0.32 + index) * 0.5 + away * (on ? -2.6 : 2.6) + pointer.x * 0.35 * pointerAmount,
      pose.rotation[2]
    );
  });

  return (
    <group ref={outer} visible={false}>
      <group ref={inner} position={[0, pose.y ?? 0, 0]} scale={pose.scale}>
        <Jewel kind={item.kind} metal={item.metal} glints={glints} />
      </group>
    </group>
  );
}
