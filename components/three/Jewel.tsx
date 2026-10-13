"use client";

import { useEffect, useMemo, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { METALS, type Metal, type ModelKind } from "@/lib/data";
import { buildPiece, disposePiece, getStudio, glintTexture, metalMaterial } from "@/lib/jewelry";

type Props = { kind: ModelKind; metal: Metal; glints?: boolean };

/** A single piece of jewellery. Metal colour eases towards `metal` when it changes. */
export function Jewel({ kind, metal, glints = false }: Props) {
  const gl = useThree((s) => s.gl);
  const studio = useMemo(() => getStudio(gl), [gl]);
  const initialMetal = useRef(metal).current;
  const metalMat = useMemo(() => metalMaterial(studio.env, METALS[initialMetal].color), [studio, initialMetal]);
  const obj = useMemo(() => buildPiece(kind, { metal: metalMat, diamond: studio.diamond }), [kind, metalMat, studio]);
  const target = useMemo(() => new THREE.Color(), []);

  useEffect(() => () => disposePiece(obj), [obj]);
  useEffect(() => () => metalMat.dispose(), [metalMat]);

  // Sparkle sprites on the main stone.
  const sprites = useMemo(() => {
    const stone = obj.userData.stone as THREE.Object3D | undefined;
    if (!glints || !stone) return [];
    const tex = glintTexture();
    return [
      [0.2, 0.25, 0.25],
      [-0.25, 0.12, 0.2],
      [0.05, -0.1, 0.36],
      [-0.12, 0.3, -0.1],
    ].map(([x, y, z], i) => {
      const s = new THREE.Sprite(
        new THREE.SpriteMaterial({ map: tex, blending: THREE.AdditiveBlending, depthWrite: false, transparent: true, opacity: 0 })
      );
      s.position.set(stone.position.x + x, stone.position.y + y, stone.position.z + z);
      s.userData = { phase: i * 1.7, speed: 0.6 + i * 0.23 };
      return s;
    });
  }, [obj, glints]);

  useEffect(() => {
    sprites.forEach((s) => obj.add(s));
    return () => sprites.forEach((s) => { obj.remove(s); s.material.dispose(); });
  }, [obj, sprites]);

  useFrame((state, dt) => {
    target.set(METALS[metal].color);
    metalMat.color.lerp(target, 1 - Math.exp(-dt * 6));
    const t = state.clock.elapsedTime;
    for (const s of sprites) {
      const k = Math.pow(Math.max(0, Math.sin(t * s.userData.speed + s.userData.phase)), 18);
      s.material.opacity = k;
      s.scale.setScalar(0.15 + k * 0.55);
    }
  });

  return <primitive object={obj} />;
}
