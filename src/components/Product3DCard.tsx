import { Suspense, useMemo, useRef, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float, OrbitControls, useGLTF } from '@react-three/drei';
import * as THREE from 'three';
import { RotateCw, ShoppingCart, Sparkles } from 'lucide-react';

export interface Product3DCardProps {
  id?: number | string;
  name?: string;
  category?: string;
  price?: number;
  unit?: string;
  badge?: string;
  modelUrl?: string;
  onAddToCart?: () => void;
  className?: string;
}

/**
 * 3D Avocado Mesh Fallback - Rendered with natural sunlight & farm fresh organic colors
 */
function ProceduralAvocado() {
  const groupRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.35) * 0.12;
    }
  });

  return (
    <group ref={groupRef} position={[0, -0.08, 0]} scale={1.22}>
      {/* Outer Skin (Rich Forest Organic Green) */}
      <mesh position={[0, 0, 0]} scale={[0.88, 1.25, 0.88]} castShadow receiveShadow>
        <sphereGeometry args={[0.95, 48, 48]} />
        <meshStandardMaterial
          color="#224426"
          roughness={0.65}
          metalness={0.08}
        />
      </mesh>

      {/* Creamy Avocado Flesh (Half Cut) */}
      <mesh position={[0, 0, 0.08]} scale={[0.82, 1.2, 0.78]}>
        <sphereGeometry args={[0.9, 48, 48, 0, Math.PI * 2, 0, Math.PI * 0.5]} />
        <meshStandardMaterial
          color="#bdd856"
          roughness={0.35}
          metalness={0.03}
        />
      </mesh>

      {/* Glossy Brown Pit / Seed */}
      <mesh position={[0, -0.15, 0.35]} scale={[0.42, 0.5, 0.42]} castShadow>
        <sphereGeometry args={[0.7, 32, 32]} />
        <meshStandardMaterial
          color="#663614"
          roughness={0.25}
          metalness={0.15}
        />
      </mesh>

      {/* Wooden Stem on Top */}
      <mesh position={[0, 1.15, 0]} rotation={[0.1, 0, 0.2]}>
        <cylinderGeometry args={[0.04, 0.05, 0.22, 16]} />
        <meshStandardMaterial color="#4a3319" roughness={0.9} />
      </mesh>

      {/* Fresh Green Leaf */}
      <mesh position={[0.1, 1.18, 0]} rotation={[0.4, 0.3, -0.6]} scale={[0.18, 0.35, 0.05]}>
        <sphereGeometry args={[0.8, 16, 16]} />
        <meshStandardMaterial color="#2d6a4f" roughness={0.35} metalness={0.05} />
      </mesh>
    </group>
  );
}

function ExternalModel({ url }: { url: string }) {
  const gltf = useGLTF(url);
  return <primitive object={gltf.scene} scale={1.5} position={[0, 0, 0]} />;
}

function Scene({ modelUrl }: { modelUrl?: string }) {
  return (
    <>
      {/* Warm natural daylight lighting matching AgriGo's sunny farm aesthetic */}
      <ambientLight intensity={1.2} />
      <directionalLight
        position={[4, 8, 4]}
        intensity={2.2}
        castShadow
        shadow-mapSize-width={1024}
        shadow-mapSize-height={1024}
      />
      {/* Soft warm bounce light */}
      <pointLight position={[-3, -2, -2]} intensity={0.6} color="#ffe8d6" />
      <pointLight position={[3, 2, -3]} intensity={0.4} color="#d8f3dc" />

      {/* Floating Gentle Bobbing Motion */}
      <Float
        speed={2}
        rotationIntensity={0.35}
        floatIntensity={0.7}
        floatingRange={[-0.1, 0.1]}
      >
        <Suspense fallback={<ProceduralAvocado />}>
          {modelUrl ? <ExternalModel url={modelUrl} /> : <ProceduralAvocado />}
        </Suspense>
      </Float>

      {/* 360° Drag & Auto-Rotate OrbitControls */}
      <OrbitControls
        enableZoom={false}
        enablePan={false}
        autoRotate={true}
        autoRotateSpeed={2.5}
        minPolarAngle={Math.PI / 4}
        maxPolarAngle={(Math.PI * 3) / 4}
        makeDefault
      />
    </>
  );
}

export function Product3DCard({
  name = 'Dak Lak Avocado 034',
  category = 'Organic Fruits',
  price = 85000,
  unit = 'kg',
  badge = 'Organic',
  modelUrl,
  onAddToCart,
  className = '',
}: Product3DCardProps) {
  const [isHovered, setIsHovered] = useState(false);

  const formattedPrice = useMemo(() => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
      maximumFractionDigits: 0,
    }).format(price);
  }, [price]);

  return (
    <article
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={`group relative flex flex-col rounded-3xl border border-emerald-900/10 bg-white p-5 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-emerald-600/30 hover:shadow-xl hover:shadow-emerald-900/10 ${className}`}
    >
      {/* 3D Canvas Podium Container (styled like an organic display pedestal) */}
      <div className="relative aspect-square w-full overflow-hidden rounded-2xl border border-emerald-900/5 bg-gradient-to-b from-emerald-50/70 via-[#f9f8f5] to-emerald-100/40 cursor-grab active:cursor-grabbing">
        {/* Badges on top */}
        <div className="absolute left-3 top-3 z-10 flex items-center gap-2">
          {badge && (
            <span className="rounded-lg bg-[#19342b] px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-[#f5f2ea] shadow-sm">
              {badge}
            </span>
          )}
          <span className="inline-flex items-center gap-1 rounded-lg border border-emerald-900/10 bg-white/90 px-2 py-1 text-[10px] font-semibold text-emerald-800 backdrop-blur-sm shadow-xs">
            <Sparkles size={11} className="text-emerald-600" /> 3D Live
          </span>
        </div>

        {/* 360 indicator at top right */}
        <div className="absolute right-3 top-3 z-10 flex items-center gap-1.5 rounded-full border border-emerald-900/10 bg-white/80 px-2.5 py-1 text-[10px] font-medium text-slate-600 backdrop-blur-sm shadow-xs">
          <RotateCw size={11} className="animate-spin text-emerald-700 [animation-duration:8s]" />
          <span>360°</span>
        </div>

        {/* 3D Interactive Canvas */}
        <Canvas
          camera={{ position: [0, 0, 3.8], fov: 45 }}
          dpr={[1, 2]}
          gl={{ antialias: true, alpha: true }}
          className="h-full w-full"
        >
          <Scene modelUrl={modelUrl} />
        </Canvas>

        {/* Subtle hint at bottom */}
        <div
          className={`pointer-events-none absolute bottom-2.5 left-1/2 -translate-x-1/2 rounded-full bg-emerald-950/75 px-3 py-1 text-[10px] font-medium text-emerald-50 backdrop-blur-md transition-opacity duration-300 ${
            isHovered ? 'opacity-0' : 'opacity-90'
          }`}
        >
          Drag to rotate 360°
        </div>
      </div>

      {/* Product Information Section matching website typography */}
      <div className="mt-4 flex flex-1 flex-col justify-between border-t border-[#19342b]/10 pt-3">
        <div>
          <p className="eyebrow">{category}</p>
          <h3 className="mt-1 line-clamp-1 text-lg font-bold text-[#19342b] transition-colors duration-200 group-hover:text-[#c46532]">
            {name}
          </h3>
        </div>

        <div className="mt-3">
          <div className="flex items-baseline justify-between">
            <span className="text-xl font-extrabold text-[#4D0E13]">
              {formattedPrice}{' '}
              <small className="text-xs font-normal text-[#19342b]/50">/{unit}</small>
            </span>
            <span className="text-[11px] font-medium text-emerald-700">Freshly harvested today</span>
          </div>

          {/* Add to basket button matching AgriGo style */}
          <button
            type="button"
            onClick={onAddToCart}
            className="mt-3.5 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-700 px-4 py-2.5 text-xs font-bold uppercase tracking-wider text-white shadow-md shadow-emerald-200 transition-all duration-300 hover:-translate-y-0.5 hover:bg-emerald-800 hover:shadow-lg hover:shadow-emerald-200 active:translate-y-0"
          >
            <ShoppingCart size={15} />
            <span>Add to Cart</span>
          </button>
        </div>
      </div>
    </article>
  );
}

export default Product3DCard;
