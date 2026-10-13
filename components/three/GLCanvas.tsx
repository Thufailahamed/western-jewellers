"use client";

import { Canvas } from "@react-three/fiber";
import { View } from "@react-three/drei";

/** One fixed, transparent canvas for the whole site. Each <View> draws into its own DOM rectangle. */
export default function GLCanvas() {
  return (
    <Canvas
      className="gl"
      style={{ position: "fixed", inset: 0, width: "100vw", height: "100vh", pointerEvents: "none", zIndex: 20 }}
      dpr={[1, 2]}
      gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
    >
      <View.Port />
    </Canvas>
  );
}
