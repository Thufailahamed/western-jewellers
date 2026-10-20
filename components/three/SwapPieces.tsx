"use client";

import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import type { Metal, ModelKind } from "@/lib/data";
import { POSES, glintTexture } from "@/lib/jewelry";
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

const OUT_TIME = 0.6; // seconds for a piece to spin away
const IN_TIME = 1.35; // seconds for the next piece to unwind into place
const FLASH_TIME = 0.7;
const SPIN = Math.PI * 1.25; // extra turn spent leaving / arriving

const easeIn = (t: number) => t * t * t;
const easeOut = (t: number) => 1 - Math.pow(1 - t, 4);
const clamp01 = (t: number) => Math.min(1, Math.max(0, t));

type Stage = {
  /** Per piece: 0 (gone) .. 1 (settled). */
  v: number[];
  /** Per piece: true while arriving, false while leaving. */
  arriving: boolean[];
  /** Seconds since the last hand-off, drives the glint flash. */
  flash: number;
};

/**
 * Several pieces sharing one spot, swapped strictly one at a time: the outgoing piece
 * spins up and shrinks to nothing, a glint marks the hand-off, then the incoming piece
 * unwinds and grows into place. Two pieces are never on stage together.
 */
export function SwapPieces({ items, active, intro, glints, pointerAmount = 1 }: Props) {
  const stage = useRef<Stage>({
    v: items.map((_, i) => (i === active ? 1 : 0)),
    arriving: items.map((_, i) => i === active),
    flash: 99,
  });
  const flash = useMemo(
    () =>
      new THREE.Sprite(
        new THREE.SpriteMaterial({ map: glintTexture(), blending: THREE.AdditiveBlending, depthWrite: false, depthTest: false, transparent: true, opacity: 0 })
      ),
    []
  );

  // One controller advances every piece, so the sequencing can't drift between slots.
  useFrame((_, raw) => {
    const dt = Math.min(raw, 1 / 20);
    const s = stage.current;
    let clear = true;
    for (let j = 0; j < items.length; j++) {
      // A piece that was leaving finishes leaving, even if it has just been picked again.
      const leaving = j !== active || (!s.arriving[j] && s.v[j] > 0);
      if (!leaving || s.v[j] === 0) continue;
      if (s.arriving[j]) {
        // Cut short mid-arrival: re-map progress so its size carries on without a jump.
        s.v[j] = 1 - Math.pow(1 - s.v[j], 4 / 3);
        s.arriving[j] = false;
      }
      s.v[j] = Math.max(0, s.v[j] - dt / OUT_TIME);
      if (s.v[j] > 0) clear = false;
    }
    if (clear && s.v[active] < 1) {
      if (!s.arriving[active]) {
        s.arriving[active] = true;
        s.flash = 0;
      }
      s.v[active] = Math.min(1, s.v[active] + dt / IN_TIME);
    }
    s.flash += dt;

    const f = clamp01(s.flash / FLASH_TIME);
    const i = intro ? clamp01(intro.current.v) : 1;
    const k = glints && f < 1 ? Math.sin(f * Math.PI) * i : 0;
    flash.visible = k > 0.001;
    flash.material.opacity = k;
    flash.scale.setScalar(0.4 + Math.sin(f * Math.PI * 0.5) * 2.2);
    flash.material.rotation = f * 0.8;
  });

  return (
    <>
      {items.map((it, i) => (
        <Slot key={i} item={it} index={i} stage={stage} intro={intro} glints={glints} pointerAmount={pointerAmount} />
      ))}
      <primitive object={flash} position={[0, 0.15, 0.6]} />
    </>
  );
}

function Slot({
  item,
  index,
  stage,
  intro,
  glints,
  pointerAmount,
}: {
  item: SwapItem;
  index: number;
  stage: React.MutableRefObject<Stage>;
  intro?: { current: { v: number } };
  glints?: boolean;
  pointerAmount: number;
}) {
  const outer = useRef<THREE.Group>(null);
  const inner = useRef<THREE.Group>(null);
  const pose = POSES[item.kind];

  useFrame((state) => {
    const o = outer.current, n = inner.current;
    if (!o || !n) return;
    const v = stage.current.v[index];
    const arriving = stage.current.arriving[index];
    const i = intro ? clamp01(intro.current.v) : 1;
    // Arrivals decelerate into place; departures accelerate away.
    const e = (arriving ? easeOut(v) : 1 - easeIn(1 - v)) * easeOut(i);
    o.visible = e > 0.001;
    if (!o.visible) return;

    const t = state.clock.elapsedTime;
    const away = 1 - e;
    // Spin keeps one direction throughout: arrivals unwind towards rest, departures carry on past it.
    const spin = arriving ? -away * SPIN : away * SPIN;
    o.position.set(0, (arriving ? -0.35 : 0.3) * away + Math.sin(t * 0.7 + index) * 0.06, -away * 0.8);
    o.scale.setScalar(Math.max(0.0001, e));
    n.rotation.set(
      pose.rotation[0] + pointer.y * 0.12 * pointerAmount + away * (arriving ? 0.35 : -0.2),
      pose.rotation[1] + Math.sin(t * 0.32 + index) * 0.5 + spin + pointer.x * 0.35 * pointerAmount,
      pose.rotation[2] + away * (arriving ? -0.25 : 0.25)
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
