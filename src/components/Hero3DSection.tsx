import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import {
  ArrowRight,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Leaf,
  Scissors,
  Sparkles,
  Sprout,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { useHeroShowcaseStore } from '@/stores/heroShowcaseStore';

export function Hero3DSection() {
  const storeItems = useHeroShowcaseStore((state) => state.items);
  const activeItems = useMemo(
    () => storeItems.filter((i) => i.isActive !== false),
    [storeItems]
  );

  const [selectedProduceId, setSelectedProduceId] = useState<string>('dragonfruit');
  const [sliderPos, setSliderPos] = useState(50); // 0% (full whole) -> 100% (full sliced)
  const [isDragging, setIsDragging] = useState(false);
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();

  const currentProduce = useMemo(() => {
    const found = activeItems.find((p) => p.id === selectedProduceId);
    return found ?? activeItems[0] ?? storeItems[0];
  }, [activeItems, selectedProduceId, storeItems]);

  useEffect(() => {
    if (activeItems.length > 0 && !activeItems.some((i) => i.id === selectedProduceId)) {
      setSelectedProduceId(activeItems[0].id);
    }
  }, [activeItems, selectedProduceId]);

  // Smooth Dragging Mechanics
  const handleMove = useCallback((clientX: number) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = clientX - rect.left;
    const percent = Math.max(0, Math.min(100, (x / rect.width) * 100));
    setSliderPos(percent);
  }, []);

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    handleMove(e.clientX);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (e.touches[0]) {
      handleMove(e.touches[0].clientX);
    }
  };

  useEffect(() => {
    const handleGlobalMouseMove = (e: MouseEvent) => {
      if (isDragging) {
        handleMove(e.clientX);
      }
    };
    const handleGlobalMouseUp = () => {
      setIsDragging(false);
    };
    if (isDragging) {
      window.addEventListener('mousemove', handleGlobalMouseMove);
      window.addEventListener('mouseup', handleGlobalMouseUp);
      return () => {
        window.removeEventListener('mousemove', handleGlobalMouseMove);
        window.removeEventListener('mouseup', handleGlobalMouseUp);
      };
    }
  }, [isDragging, handleMove]);

  // Subtle 3D Mouse Parallax
  const handleMouseMoveParallax = (e: React.MouseEvent<HTMLDivElement>) => {
    if (reduced || !containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    setTilt({ x: -y * 6, y: x * 6 });
  };

  const handleMouseLeaveParallax = () => {
    setTilt({ x: 0, y: 0 });
    setIsDragging(false);
  };

  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-[#f7faf7] via-white to-emerald-50/40">
      {/* Background Soft Glow Orbs */}
      <div className="pointer-events-none absolute -right-32 -top-24 h-[500px] w-[500px] rounded-full bg-emerald-200/35 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-32 left-10 h-[420px] w-[420px] rounded-full bg-amber-100/40 blur-3xl" />

      <div className="relative w-full max-w-7xl mx-auto px-4 py-12 sm:px-6 sm:py-16 lg:px-8 lg:py-20">
        <div className="grid items-center gap-10 lg:grid-cols-2 lg:gap-14">
          
          {/* =========================================================
              LEFT COLUMN: Typography & Value Props
              ========================================================= */}
          <div className="relative z-10">
            {/* Top Category / Tagline Chip */}
            <motion.div
              initial={reduced ? false : { opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="inline-flex items-center gap-2.5 rounded-full border border-emerald-900/15 bg-emerald-100/70 px-4 py-2 text-xs font-extrabold uppercase tracking-wider text-emerald-900 shadow-sm backdrop-blur-md"
            >
              <span className="flex h-2 w-2 rounded-full bg-emerald-600 animate-pulse" />
              <Leaf size={14} className="text-emerald-700" />
              <span>Vietnam's #1 Organic Farm Produce</span>
              <span className="hidden sm:inline-block rounded-full bg-emerald-700 px-2 py-0.5 text-[10px] font-bold text-white">
                Fresh Harvest
              </span>
            </motion.div>

            {/* Main Headline */}
            <motion.h1
              initial={reduced ? false : { opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="mt-6 text-4xl font-extrabold leading-[1.08] tracking-[-0.05em] text-emerald-950 sm:text-5xl lg:text-6xl"
            >
              Pure Natural Produce,{' '}
              <span className="bg-gradient-to-r from-emerald-700 via-emerald-600 to-amber-600 bg-clip-text text-transparent">
                Wholesome Nutrition
              </span>{' '}
              For Your Whole Family
            </motion.h1>

            {/* Description */}
            <motion.p
              initial={reduced ? false : { opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="mt-6 max-w-xl text-base leading-relaxed text-slate-600 sm:text-lg sm:leading-8"
            >
              Agri-Go directly connects over <strong>50 certified organic cooperatives</strong> in Da Lat, Dak Lak, and the Mekong Delta to your home. Every fresh fruit and vegetable is harvested at dawn under cold-chain preservation and delivered within <strong>2 hours</strong>.
            </motion.p>

            {/* CTA Buttons */}
            <motion.div
              initial={reduced ? false : { opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="mt-8 flex flex-wrap items-center gap-4"
            >
              <Link
                to="/products"
                className="group inline-flex items-center gap-2.5 rounded-2xl bg-emerald-700 px-7 py-4 text-base font-bold text-white shadow-lg shadow-emerald-700/25 transition-all duration-300 hover:-translate-y-0.5 hover:bg-emerald-800 hover:shadow-xl hover:shadow-emerald-700/35 active:translate-y-0"
              >
                <span>Explore Farm Produce</span>
                <ArrowRight
                  size={18}
                  className="transition-transform duration-300 group-hover:translate-x-1"
                />
              </Link>
              <Link
                to="/about"
                className="inline-flex items-center gap-2 rounded-2xl border border-emerald-900/15 bg-white/80 px-6 py-4 text-base font-bold text-emerald-900 backdrop-blur-md transition-all hover:border-emerald-600 hover:bg-emerald-50/70"
              >
                <span>Our Farm Story</span>
              </Link>
            </motion.div>

            {/* Social Proof Row */}
            <motion.div
              initial={reduced ? false : { opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="mt-8 flex flex-wrap items-center gap-4 text-xs font-semibold text-slate-600"
            >
              <div className="flex -space-x-2">
                <img
                  src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=80&q=80"
                  alt="Customer"
                  className="h-8 w-8 rounded-full border-2 border-white object-cover"
                />
                <img
                  src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=80&q=80"
                  alt="Customer"
                  className="h-8 w-8 rounded-full border-2 border-white object-cover"
                />
                <img
                  src="https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=80&q=80"
                  alt="Customer"
                  className="h-8 w-8 rounded-full border-2 border-white object-cover"
                />
                <div className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-white bg-emerald-700 text-[10px] font-bold text-white">
                  +15k
                </div>
              </div>
              <div className="flex items-center gap-1.5 text-amber-500">
                {'★★★★★'}
                <span className="font-extrabold text-slate-800 ml-1">4.9/5.0</span>
                <span className="text-slate-400">trusted by 15,000+ happy families</span>
              </div>
            </motion.div>
          </div>

          {/* =========================================================
              RIGHT COLUMN: INTERACTIVE MAGIC SLICE SLIDER (PHƯƠNG ÁN 1)
              ========================================================= */}
          <div className="relative">
            {/* Top Toolbar: Switcher & Quick Controls */}
            <div className="mb-3.5 flex flex-wrap items-center justify-between gap-2.5">
              {/* Produce Switcher Tabs */}
              <div className="flex gap-1 rounded-2xl border border-emerald-900/10 bg-white/95 p-1 shadow-sm backdrop-blur-md">
                {activeItems.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => {
                      setSelectedProduceId(item.id);
                      setSliderPos(50);
                    }}
                    className={`rounded-xl px-3 py-1.5 text-xs font-bold transition-all ${
                      currentProduce?.id === item.id
                        ? 'bg-emerald-700 text-white shadow-sm'
                        : 'text-slate-600 hover:bg-emerald-50 hover:text-emerald-900'
                    }`}
                  >
                    {item.shortName}
                  </button>
                ))}
              </div>

              {/* Quick Slice Presets */}
              <div className="flex items-center gap-1.5 rounded-2xl border border-emerald-900/10 bg-white/90 p-1 text-xs font-bold shadow-sm">
                <button
                  type="button"
                  onClick={() => setSliderPos(0)}
                  className={`rounded-lg px-2.5 py-1 transition-all ${
                    sliderPos === 0
                      ? 'bg-emerald-900 text-white'
                      : 'text-slate-600 hover:bg-slate-100'
                  }`}
                  title="View full intact fruit"
                >
                  🟢 Whole Fruit
                </button>
                <button
                  type="button"
                  onClick={() => setSliderPos(50)}
                  className={`rounded-lg px-2.5 py-1 transition-all ${
                    sliderPos === 50
                      ? 'bg-emerald-700 text-white'
                      : 'text-slate-600 hover:bg-slate-100'
                  }`}
                  title="Slice 50 / 50"
                >
                  🔪 50 / 50
                </button>
                <button
                  type="button"
                  onClick={() => setSliderPos(100)}
                  className={`rounded-lg px-2.5 py-1 transition-all ${
                    sliderPos === 100
                      ? 'bg-amber-500 text-white'
                      : 'text-slate-600 hover:bg-slate-100'
                  }`}
                  title="View juicy fresh inside"
                >
                  🍉 Fresh Inside
                </button>
              </div>
            </div>

            {/* Interactive Slicing Stage Container */}
            <motion.div
              ref={containerRef}
              onMouseMove={handleMouseMoveParallax}
              onMouseLeave={handleMouseLeaveParallax}
              onMouseDown={handleMouseDown}
              onTouchMove={handleTouchMove}
              animate={{
                rotateX: tilt.x,
                rotateY: tilt.y,
              }}
              transition={{ type: 'spring', stiffness: 260, damping: 20 }}
              style={{ perspective: 1000 }}
              className={`relative h-[440px] sm:h-[490px] w-full select-none overflow-hidden rounded-[2.5rem] border-4 border-white/95 bg-gradient-to-br from-[#0c261b] via-[#071911] to-[#040e0a] shadow-2xl shadow-emerald-950/30 ${
                isDragging ? 'cursor-ew-resize' : 'cursor-grab'
              }`}
            >
              {/* Background Ambient Glow */}
              <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_40%,rgba(52,211,153,0.22),transparent_70%)]" />
              <div className="pointer-events-none absolute -bottom-10 -right-10 h-64 w-64 rounded-full bg-amber-500/10 blur-3xl" />

              {/* =======================================================
                  LAYER 1: Whole Fruit
                  ======================================================= */}
              <div className="absolute inset-0 flex items-center justify-center p-6 sm:p-8">
                <img
                  src={currentProduce.wholeImg}
                  alt={currentProduce.wholeDesc}
                  className="max-h-[360px] sm:max-h-[400px] w-auto max-w-full object-contain filter drop-shadow-[0_20px_35px_rgba(0,0,0,0.65)] transition-transform duration-300"
                />
              </div>

              {/* Whole Fruit Badge */}
              <div
                className={`pointer-events-none absolute right-4 top-4 max-w-[220px] rounded-2xl border border-white/15 bg-emerald-950/85 p-3 text-white shadow-lg backdrop-blur-md transition-opacity duration-300 text-right ${
                  sliderPos <= 80 ? 'opacity-100' : 'opacity-0'
                }`}
              >
                <div className="flex items-center justify-end gap-1.5 text-emerald-300 text-xs font-black">
                  <span className="flex h-2 w-2 rounded-full bg-emerald-400 animate-ping" />
                  <span>Whole Fruit</span>
                </div>
                <p className="mt-1 text-[11px] font-bold text-white line-clamp-1">
                  {currentProduce.name}
                </p>
                <p className="mt-0.5 text-[10px] text-slate-300 leading-tight">
                  {currentProduce.wholeDesc}
                </p>
              </div>

              {/* =======================================================
                  LAYER 2: Sliced Fruit
                  ======================================================= */}
              <div
                className="absolute inset-0 flex items-center justify-center p-6 sm:p-8"
                style={{
                  clipPath: `polygon(0 0, ${sliderPos}% 0, ${sliderPos}% 100%, 0 100%)`,
                }}
              >
                <img
                  src={currentProduce.slicedImg}
                  alt={currentProduce.splitDesc}
                  className="max-h-[360px] sm:max-h-[400px] w-auto max-w-full object-contain filter drop-shadow-[0_20px_35px_rgba(0,0,0,0.65)] transition-transform duration-300"
                />
              </div>

              {/* Sliced Badge */}
              <div
                className={`pointer-events-none absolute left-4 top-4 max-w-[220px] rounded-2xl border border-white/15 bg-emerald-950/85 p-3 text-white shadow-lg backdrop-blur-md transition-opacity duration-300 ${
                  sliderPos >= 20 ? 'opacity-100' : 'opacity-0'
                }`}
              >
                <div className="flex items-center gap-1.5 text-amber-400 text-xs font-black">
                  <Sparkles size={13} />
                  <span>Juicy Center</span>
                </div>
                <p className="mt-1 text-[11px] font-bold text-white line-clamp-1">
                  {currentProduce.tagline}
                </p>
                <p className="mt-0.5 text-[10px] text-slate-300 leading-tight">
                  {currentProduce.splitDesc}
                </p>
              </div>

              {/* =======================================================
                  INTERACTIVE SLICE HANDLE & NEON LASER LINE
                  ======================================================= */}
              <div
                className="pointer-events-none absolute inset-y-0"
                style={{ left: `${sliderPos}%` }}
              >
                {/* Glowing Laser Vertical Line */}
                <div className="absolute inset-y-0 -left-[1.5px] w-[3px] bg-gradient-to-b from-amber-400 via-white to-emerald-400 shadow-[0_0_16px_rgba(52,211,153,0.95)]" />

                {/* Tactile Circular Slicing Handle */}
                <div
                  onMouseDown={handleMouseDown}
                  className="pointer-events-auto absolute top-1/2 -left-6 sm:-left-7 -translate-y-1/2 flex h-12 w-12 sm:h-14 sm:w-14 items-center justify-center rounded-full border-2 border-emerald-500 bg-white text-emerald-950 shadow-2xl ring-4 ring-emerald-500/30 transition-transform hover:scale-110 active:scale-95 cursor-ew-resize"
                  title="Drag back and forth to slice"
                >
                  <div className="flex flex-col items-center justify-center text-center">
                    <div className="flex items-center gap-0.5 text-emerald-800">
                      <ChevronLeft size={11} className="stroke-[3]" />
                      <Scissors size={15} className="rotate-90 text-amber-500 animate-pulse" />
                      <ChevronRight size={11} className="stroke-[3]" />
                    </div>
                    <span className="text-[7.5px] font-black uppercase tracking-wider text-emerald-950">
                      SLICE
                    </span>
                  </div>
                </div>
              </div>

              {/* Bottom Drag Instruction Pill */}
              <div className="pointer-events-none absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2 rounded-full border border-white/20 bg-black/60 px-4 py-2 text-xs font-bold text-white shadow-xl backdrop-blur-md">
                <Scissors size={14} className="text-amber-400 animate-pulse" />
                <span>Drag slider or select presets above to inspect inside</span>
                <span className="text-emerald-300 font-extrabold text-[10px]">• 50/50</span>
              </div>
            </motion.div>

            {/* Bottom Floating Value Cards */}
            <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
              {/* Card 1: Produce Quality & Brix */}
              <div className="flex items-center gap-3 rounded-2xl border border-emerald-900/10 bg-white p-3 shadow-sm">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-800">
                  <Sprout size={20} />
                </div>
                <div>
                  <p className="text-xs font-black text-emerald-950">
                    {currentProduce.name} ({currentProduce.price})
                  </p>
                  <p className="text-[10px] text-slate-500">
                    {currentProduce.badge} &bull; Sweetness {currentProduce.brix}
                  </p>
                </div>
              </div>

              {/* Card 2: 7-day guarantee */}
              <div className="flex items-center gap-3 rounded-2xl border border-amber-500/20 bg-white p-3 shadow-sm">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-50 text-amber-800">
                  <CheckCircle2 size={20} />
                </div>
                <div>
                  <p className="text-xs font-black text-emerald-950">Freshness Guaranteed</p>
                  <p className="text-[10px] text-slate-500">Free 7-day easy returns & refunds</p>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
