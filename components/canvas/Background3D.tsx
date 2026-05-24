"use client";

import { useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Mesh } from "three";

function AnimatedMesh() {
  const meshRef = useRef<Mesh>(null);

  useFrame((_state, delta) => {
    if (!meshRef.current) return;
    meshRef.current.rotation.y += delta * 0.08;
    meshRef.current.rotation.x += delta * 0.03;
    meshRef.current.rotation.z += delta * 0.015;
  });

  return (
    <mesh ref={meshRef} scale={1.4}>
      <torusKnotGeometry args={[1, 0.32, 220, 40]} />
      <meshStandardMaterial
        color="#060606"
        metalness={0.95}
        roughness={0.04}
      />
    </mesh>
  );
}

export default function Background3D() {
  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 1,
        pointerEvents: "none",
      }}
    >
      <Canvas
        camera={{ position: [0, 0, 5], fov: 55 }}
        gl={{ antialias: true, alpha: true }}
        style={{ width: "100%", height: "100%" }}
      >
        {/* Very dim ambient */}
        <ambientLight intensity={0.03} />

        {/* Teal rim — front-right */}
        <directionalLight
          color="#14b8a6"
          position={[4, 2, 2]}
          intensity={2.2}
        />

        {/* Amber rim — back-left */}
        <directionalLight
          color="#f59e0b"
          position={[-4, -2, -2]}
          intensity={1.6}
        />

        {/* Subtle fill from above */}
        <directionalLight
          color="#ffffff"
          position={[0, 6, 0]}
          intensity={0.08}
        />

        <AnimatedMesh />
      </Canvas>
    </div>
  );
}
