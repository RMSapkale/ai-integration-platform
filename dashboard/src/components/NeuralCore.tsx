"use client";

import { useRef, useMemo } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Points, PointMaterial, Line } from "@react-three/drei";
import * as THREE from "three";
import * as random from "maath/random/dist/maath-random.esm";

function NeuralNetwork(props: any) {
    const ref = useRef<any>(null);
    // Generate 400 particles in a sphere
    const sphere = useMemo(() => random.inSphere(new Float32Array(1200), { radius: 2.5 }), []);

    useFrame((state, delta) => {
        if (ref.current) {
            ref.current.rotation.x -= delta / 15;
            ref.current.rotation.y -= delta / 20;
        }
    });

    return (
        <group rotation={[0, 0, Math.PI / 4]}>
            <Points ref={ref} positions={sphere} stride={3} frustumCulled={false} {...props}>
                <PointMaterial
                    transparent
                    color="#0284c7"
                    size={0.015}
                    sizeAttenuation={true}
                    depthWrite={false}
                    blending={THREE.NormalBlending}
                />
            </Points>
        </group>
    );
}

function Connections() {
    const ref = useRef<any>(null);
    // Create some random connections
    const points = useMemo(() => {
        const pts = [];
        for (let i = 0; i < 50; i++) {
            const x1 = (Math.random() - 0.5) * 5;
            const y1 = (Math.random() - 0.5) * 5;
            const z1 = (Math.random() - 0.5) * 5;
            const x2 = (Math.random() - 0.5) * 5;
            const y2 = (Math.random() - 0.5) * 5;
            const z2 = (Math.random() - 0.5) * 5;
            pts.push(new THREE.Vector3(x1, y1, z1));
            pts.push(new THREE.Vector3(x2, y2, z2));
        }
        return pts;
    }, []);

    useFrame((state, delta) => {
        if (ref.current) {
            ref.current.rotation.y += delta / 10;
        }
    });

    return (
        <group ref={ref}>
            {/* We would ideally use Line segments here, but for simplicity in this POC using a simple mesh or just points is safer to avoid complex geometry construction issues in one go. 
                 However, to make it look like a "Core", let's add a central glowing sphere. */}
            <mesh>
                <sphereGeometry args={[1, 32, 32]} />
                <meshStandardMaterial
                    color="#e0f2fe"
                    emissive="#0ea5e9"
                    emissiveIntensity={0.2}
                    roughness={0.1}
                    metalness={0.1}
                    wireframe
                />
            </mesh>
            <mesh>
                <sphereGeometry args={[0.8, 32, 32]} />
                <meshBasicMaterial color="#38bdf8" transparent opacity={0.05} />
            </mesh>
        </group>
    )
}

export default function NeuralCore() {
    return (
        <div className="absolute inset-0 -z-10 bg-slate-50">
            <Canvas camera={{ position: [0, 0, 4] }}>
                <ambientLight intensity={0.8} />
                <pointLight position={[10, 10, 10]} color="#0284c7" intensity={1} />
                <NeuralNetwork />
                <Connections />
                <fog attach="fog" args={['#f8fafc', 3, 10]} />
            </Canvas>
        </div>
    );
}
