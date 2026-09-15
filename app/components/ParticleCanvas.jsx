import { Canvas, useFrame } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import * as THREE from "three";

const PARTICLE_COUNT = 1800;
const SPREAD = 26;
const BOND_THRESHOLD = 3.1;
const MAX_BONDS = 900;
const BOND_SAMPLE = 620; // keeps the O(n^2) neighbour pass cheap

const MATERIAL = {
  dark: {
    particle: "#38BDF8",
    bond: "#818CF8",
    opacity: 0.8,
    bondOpacity: 0.16,
    size: 0.16,
    blending: THREE.AdditiveBlending,
  },
  light: {
    particle: "#0284C7",
    bond: "#4F46E5",
    opacity: 0.45,
    bondOpacity: 0.12,
    size: 0.13,
    blending: THREE.NormalBlending,
  },
};

function useMolecule() {
  return useMemo(() => {
    const positions = new Float32Array(PARTICLE_COUNT * 3);

    for (let i = 0; i < PARTICLE_COUNT; i++) {
      // Shell distribution reads as molecular structure rather than a flat cube.
      const shell = SPREAD * (0.35 + 0.65 * Math.cbrt(Math.random()));
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      positions[i * 3] = shell * Math.sin(phi) * Math.cos(theta) * 1.25;
      positions[i * 3 + 1] = shell * Math.sin(phi) * Math.sin(theta) * 0.85;
      positions[i * 3 + 2] = shell * Math.cos(phi) * 0.7;
    }

    const bonds = [];
    outer: for (let i = 0; i < BOND_SAMPLE; i++) {
      for (let j = i + 1; j < BOND_SAMPLE; j++) {
        const dx = positions[i * 3] - positions[j * 3];
        const dy = positions[i * 3 + 1] - positions[j * 3 + 1];
        const dz = positions[i * 3 + 2] - positions[j * 3 + 2];
        if (dx * dx + dy * dy + dz * dz < BOND_THRESHOLD * BOND_THRESHOLD) {
          bonds.push(
            positions[i * 3], positions[i * 3 + 1], positions[i * 3 + 2],
            positions[j * 3], positions[j * 3 + 1], positions[j * 3 + 2]
          );
          if (bonds.length / 6 >= MAX_BONDS) break outer;
        }
      }
    }

    return { positions, bonds: new Float32Array(bonds) };
  }, []);
}

function ParticleField({ theme, reducedMotion }) {
  const group = useRef();
  const eased = useRef({ x: 0, y: 0 });
  const { positions, bonds } = useMolecule();
  const cfg = MATERIAL[theme] ?? MATERIAL.dark;

  useFrame((state, delta) => {
    const g = group.current;
    if (!g || reducedMotion) return;

    const t = state.clock.getElapsedTime();
    const lerp = Math.min(1, delta * 2.6) * 0.28;

    // Cursor tracking, smoothed.
    eased.current.x += (state.pointer.x - eased.current.x) * lerp;
    eased.current.y += (state.pointer.y - eased.current.y) * lerp;

    // Ambient drift + pointer tilt.
    g.rotation.y = t * 0.045 + eased.current.x * 0.35;
    g.rotation.x = Math.sin(t * 0.22) * 0.06 + eased.current.y * 0.22;
    g.position.x = eased.current.x * 1.9;
    g.position.y = eased.current.y * 1.3;
  });

  return (
    <group ref={group}>
      <points>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            array={positions}
            count={positions.length / 3}
            itemSize={3}
          />
        </bufferGeometry>
        <pointsMaterial
          color={cfg.particle}
          size={cfg.size}
          sizeAttenuation
          transparent
          opacity={cfg.opacity}
          blending={cfg.blending}
          depthWrite={false}
        />
      </points>

      <lineSegments>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            array={bonds}
            count={bonds.length / 3}
            itemSize={3}
          />
        </bufferGeometry>
        <lineBasicMaterial
          color={cfg.bond}
          transparent
          opacity={cfg.bondOpacity}
          blending={cfg.blending}
          depthWrite={false}
        />
      </lineSegments>
    </group>
  );
}

export default function ParticleCanvas({ theme, reducedMotion = false }) {
  return (
    <Canvas
      camera={{ position: [0, 0, 30], fov: 62 }}
      dpr={[1, 2]}
      gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
      frameloop={reducedMotion ? "demand" : "always"}
      style={{ width: "100%", height: "100%" }}
    >
      <ParticleField theme={theme} reducedMotion={reducedMotion} />
    </Canvas>
  );
}
