"use client";

import { Canvas, useThree } from "@react-three/fiber";
import { SwapPieces, type SwapItem } from "./SwapPieces";

const FOV = 26;
const Z = 10;

function Fit({ children }: { children: React.ReactNode }) {
  const size = useThree((s) => s.size);
  const h = 2 * Z * Math.tan(((FOV / 2) * Math.PI) / 180);
  const w = h * (size.width / Math.max(1, size.height));
  // Pieces are roughly 2.8 units across; keep them inside the arch.
  const s = Math.min(h * 0.5, w * 0.58) / 2.8;
  return (
    <group scale={s} position={[0, -h * 0.04, 0]}>
      {children}
    </group>
  );
}

/** Its own small canvas so the piece can draw above the full-screen menu. Only renders while the menu is open. */
export default function MenuCanvas({ items, active, open }: { items: SwapItem[]; active: number; open: boolean }) {
  return (
    <Canvas
      className="menu__canvas"
      dpr={[1, 2]}
      frameloop={open ? "always" : "never"}
      gl={{ antialias: true, alpha: true }}
      camera={{ fov: FOV, position: [0, 0, Z] }}
    >
      <Fit>
        <SwapPieces items={items} active={active} glints pointerAmount={0.6} />
      </Fit>
    </Canvas>
  );
}
