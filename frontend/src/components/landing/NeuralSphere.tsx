"use client";

import React, { useRef, useMemo } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import * as THREE from "three";

function NeuralMesh() {
  const groupRef = useRef<THREE.Group>(null);
  const pointsRef = useRef<THREE.Points>(null);

  // Create icosahedron geometry + connection lines
  const { pointsGeo, linesGeo, baseSizes } = useMemo(() => {
    const ico = new THREE.IcosahedronGeometry(2.2, 2);
    const posArr = ico.attributes.position.array as Float32Array;
    const numVertices = posArr.length / 3;

    // Point sizes — varied for visual depth
    const sizes = new Float32Array(numVertices);
    for (let i = 0; i < numVertices; i++) {
      sizes[i] = 2.5 + Math.random() * 3;
    }

    // Create points geometry
    const pGeo = new THREE.BufferGeometry();
    pGeo.setAttribute("position", new THREE.BufferAttribute(posArr.slice(), 3));
    pGeo.setAttribute("size", new THREE.BufferAttribute(sizes.slice(), 1));

    // Create lines between nearby vertices
    const lineVerts: number[] = [];
    const threshold = 1.6;
    for (let i = 0; i < numVertices; i++) {
      for (let j = i + 1; j < numVertices; j++) {
        const dx = posArr[i * 3] - posArr[j * 3];
        const dy = posArr[i * 3 + 1] - posArr[j * 3 + 1];
        const dz = posArr[i * 3 + 2] - posArr[j * 3 + 2];
        const dist = Math.sqrt(dx * dx + dy * dy + dz * dz);
        if (dist < threshold) {
          lineVerts.push(
            posArr[i * 3], posArr[i * 3 + 1], posArr[i * 3 + 2],
            posArr[j * 3], posArr[j * 3 + 1], posArr[j * 3 + 2]
          );
        }
      }
    }

    const lGeo = new THREE.BufferGeometry();
    lGeo.setAttribute("position", new THREE.BufferAttribute(new Float32Array(lineVerts), 3));

    return { pointsGeo: pGeo, linesGeo: lGeo, baseSizes: sizes };
  }, []);

  useFrame(({ clock }) => {
    if (groupRef.current) {
      groupRef.current.rotation.y = clock.elapsedTime * 0.08;
      groupRef.current.rotation.x = Math.sin(clock.elapsedTime * 0.05) * 0.15;
    }

    // Subtle vertex pulsing
    if (pointsRef.current) {
      const sizeAttr = pointsRef.current.geometry.attributes.size;
      if (sizeAttr) {
        const arr = sizeAttr.array as Float32Array;
        for (let i = 0; i < arr.length; i++) {
          arr[i] = baseSizes[i] + Math.sin(clock.elapsedTime * 1.5 + i * 0.5) * 0.8;
        }
        sizeAttr.needsUpdate = true;
      }
    }
  });

  return (
    <group ref={groupRef}>
      {/* Vertex points */}
      <points ref={pointsRef} geometry={pointsGeo}>
        <pointsMaterial
          color="#4285F4"
          size={3}
          sizeAttenuation
          transparent
          opacity={0.9}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </points>

      {/* Connection lines */}
      <lineSegments geometry={linesGeo}>
        <lineBasicMaterial
          color="#4285F4"
          transparent
          opacity={0.15}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </lineSegments>

      {/* Inner glow sphere */}
      <mesh>
        <sphereGeometry args={[1.8, 32, 32]} />
        <meshBasicMaterial
          color="#4285F4"
          transparent
          opacity={0.03}
          depthWrite={false}
        />
      </mesh>
    </group>
  );
}

// Fallback for no WebGL
function StaticFallback() {
  return (
    <div
      className="w-full h-full flex items-center justify-center"
      aria-hidden="true"
    >
      <div
        className="rounded-full"
        style={{
          width: "280px",
          height: "280px",
          background: "radial-gradient(circle, rgba(66,133,244,0.12) 0%, transparent 70%)",
          border: "1px solid rgba(66,133,244,0.1)",
        }}
      />
    </div>
  );
}

const NeuralSphere: React.FC = () => {
  // Check WebGL support
  const hasWebGL = typeof window !== "undefined" &&
    (() => {
      try {
        const c = document.createElement("canvas");
        return !!(c.getContext("webgl2") || c.getContext("webgl"));
      } catch {
        return false;
      }
    })();

  if (!hasWebGL) return <StaticFallback />;

  return (
    <div className="w-full h-full" style={{ minHeight: "320px" }}>
      <Canvas
        camera={{ position: [0, 0, 6], fov: 45 }}
        dpr={[1, 1.5]}
        style={{ background: "transparent" }}
        gl={{
          alpha: true,
          antialias: true,
          powerPreference: "high-performance",
        }}
      >
        <ambientLight intensity={0.3} />
        <NeuralMesh />
      </Canvas>
    </div>
  );
};

export default NeuralSphere;
