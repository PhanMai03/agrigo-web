import { motion } from 'framer-motion';
import {
  ArrowRight,
  Award,
  CheckCircle2,
  Clock,
  Compass,
  HeartHandshake,
  Leaf,
  ShieldCheck,
  Sparkles,
  Sprout,
  Target,
  Truck,
  Users2,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { MainLayout } from '@/layouts/MainLayout';
import { Reveal } from '@/components/Reveal';

// Curated high quality organic agriculture imagery
const IMAGES = {
  hero: 'https://images.unsplash.com/photo-1500937386664-56d1dfef3854?auto=format&fit=crop&w=1600&q=85', // Sunrise organic farmland
  farmer: 'https://images.unsplash.com/photo-1605000797499-95a51c5269ae?auto=format&fit=crop&w=1000&q=85', // Farmer harvesting with care
  harvest: 'https://images.unsplash.com/photo-1610348725531-843dff563e2c?auto=format&fit=crop&w=1000&q=85', // Fresh vibrant vegetables crate
  greenhouse: 'https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?auto=format&fit=crop&w=1000&q=85', // Modern clean greenhouse
};

const STATS = [
  { value: '50+', label: 'Partner Cooperatives', sub: 'Da Lat, Dak Lak & Mekong Delta' },
  { value: '15,000+', label: 'Green Meals Monthly', sub: 'Trusted by thousands of families' },
  { value: '100%', label: 'Clean Cultivation Audited', sub: 'Zero toxic chemical pesticides' },
  { value: '< 24 Hours', label: 'From Farm to Table', sub: 'Cold-chain preservation of freshness' },
];

const VALUES = [
  {
    icon: ShieldCheck,
    title: 'Transparent Origin',
    desc: 'Every piece of fruit and vegetable has clear traceability, harvest date, and lab-verified certificates.',
  },
  {
    icon: Sprout,
    title: 'Nature-Aligned & Sustainable',
    desc: 'Protecting mother earth, nourishing soil microbiomes and groundwater without synthetic chemical abuse.',
  },
  {
    icon: HeartHandshake,
    title: 'Empowering Farmers',
    desc: 'Guaranteed fair-trade purchase prices, supporting organic transition under VietGAP & GlobalGAP standards.',
  },
  {
    icon: Award,
    title: '100% Quality Commitment',
    desc: 'Free 7-day hassle-free replacement or refund if produce does not meet optimal freshness and crispness.',
  },
];

const WHY_CHOOSE_US = [
  {
    icon: Leaf,
    title: 'Gold Standard Organic Farming',
    desc: '100% of produce strictly excludes synthetic pesticides, chemical fertilizers, and GMOs (Non-GMO).',
  },
  {
    icon: Truck,
    title: 'End-to-End Cold Chain',
    desc: 'From on-farm sorting to refrigerated storage and vans, greens retain their natural moisture and nutrients.',
  },
  {
    icon: Clock,
    title: 'Express 2-Hour Delivery',
    desc: 'Harvested early at dawn and delivered swiftly to your door so your meals are always prepared with peak freshness.',
  },
  {
    icon: Users2,
    title: 'Dedicated Nutritional Care',
    desc: 'Our nutrition experts are ready to suggest balanced, plant-rich menus tailored to your family needs.',
  },
];

const TIMELINE = [
  {
    year: '2021',
    title: 'Born from Deep Compassion',
    desc: 'Witnessing consumer anxiety over food safety while organic farmers struggled for fair distribution, Agri-Go was founded to bridge trust.',
  },
  {
    year: '2023',
    title: 'Expanded to 30 Cooperatives',
    desc: 'Established standardized partnerships from the Lam Dong highlands to the fertile Mekong Delta, backed by a 3-tier inspection protocol.',
  },
  {
    year: '2026',
    title: 'Smart Digital Agriculture Platform',
    desc: 'Pioneered interactive 3D discovery, transparent digital farming logs, serving over 15,000 wellness-minded families nationwide.',
  },
];

export function AboutPage() {
  return (
    <MainLayout>
      {/* 1. HERO SECTION */}
      <section id="about" className="relative overflow-hidden bg-gradient-to-b from-emerald-50/70 via-stone-50/40 to-white pt-12 pb-20 sm:pt-20 sm:pb-28">
        <div className="pointer-events-none absolute -right-40 top-0 h-[480px] w-[480px] rounded-full bg-emerald-200/30 blur-3xl" />
        <div className="pointer-events-none absolute -left-40 bottom-0 h-[400px] w-[400px] rounded-full bg-lime-100/40 blur-3xl" />

        <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid items-center gap-12 lg:grid-cols-12 lg:gap-16">
            <div className="lg:col-span-7">
              <Reveal>
                <span className="inline-flex items-center gap-2 rounded-full border border-emerald-900/10 bg-white/90 px-3.5 py-1.5 text-[11px] font-bold uppercase tracking-[0.2em] text-emerald-800 shadow-xs">
                  <Sparkles size={13} className="text-emerald-600" />
                  About Us &bull; Agri-Go Story
                </span>
              </Reveal>

              <Reveal delay={0.1}>
                <h1 className="mt-6 text-4xl font-extrabold tracking-tight text-[#19342b] sm:text-6xl sm:leading-[1.12]">
                  Connecting mother earth's bounty to{' '}
                  <span className="relative inline-block text-emerald-700">
                    every family table
                    <span className="absolute -bottom-2 left-0 h-1.5 w-full rounded-full bg-amber-400/80" />
                  </span>
                </h1>
              </Reveal>

              <Reveal delay={0.2}>
                <p className="mt-6 max-w-2xl text-base leading-relaxed text-[#19342b]/75 sm:text-lg">
                  Agri-Go is a premier platform distributing benchmark clean, organic produce. We bridge
                  the distance between ecological farms and your dining table, bringing absolute peace of
                  mind to every family meal while empowering local farmers.
                </p>
              </Reveal>

              <Reveal delay={0.3}>
                <div className="mt-8 flex flex-wrap items-center gap-4">
                  <Link to="/products" className="ink-button">
                    Explore Produce <ArrowRight size={16} />
                  </Link>
                  <Link
                    to="/contact"
                    className="inline-flex items-center gap-2 rounded-xl border border-emerald-900/20 bg-white px-6 py-3 text-sm font-bold text-[#19342b] transition hover:border-emerald-700 hover:bg-emerald-50"
                  >
                    Partner with Us
                  </Link>
                </div>
              </Reveal>
            </div>

            {/* Asymmetrical Visual with floating organic cards */}
            <div className="relative lg:col-span-5">
              <Reveal delay={0.2}>
                <div className="relative mx-auto max-w-md lg:max-w-none">
                  <div className="relative overflow-hidden rounded-[2.5rem] border-8 border-white bg-white shadow-2xl shadow-emerald-900/15">
                    <img
                      src={IMAGES.hero}
                      alt="Agri-Go lush ecological farm"
                      className="aspect-[4/5] w-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-emerald-950/60 via-transparent to-transparent" />
                    <div className="absolute bottom-6 left-6 right-6 text-white">
                      <p className="text-xs font-bold uppercase tracking-widest text-emerald-300">
                        Ecological Farm Estate
                      </p>
                      <p className="mt-1 text-lg font-bold">100% Natural &bull; Healthy soil nurtures sweet fruit</p>
                    </div>
                  </div>

                  {/* Floating Badges */}
                  <motion.div
                    animate={{ y: [0, -8, 0] }}
                    transition={{ duration: 4.5, repeat: Infinity, ease: 'easeInOut' }}
                    className="absolute -left-6 top-10 rounded-2xl border border-white/80 bg-white/95 p-4 shadow-xl shadow-emerald-950/10 backdrop-blur-md"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700">
                        <Leaf size={22} />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-[#19342b]">Certified Organic</p>
                        <p className="text-xs text-slate-500">VietGAP &bull; GlobalGAP</p>
                      </div>
                    </div>
                  </motion.div>

                  <motion.div
                    animate={{ y: [0, 8, 0] }}
                    transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut', delay: 0.5 }}
                    className="absolute -bottom-6 -right-4 rounded-2xl border border-white/80 bg-white/95 p-4 shadow-xl shadow-emerald-950/10 backdrop-blur-md"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-amber-100 text-amber-700">
                        <Truck size={22} />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-[#19342b]">2-Hour Cold Delivery</p>
                        <p className="text-xs text-slate-500">Locking in freshness & crunch</p>
                      </div>
                    </div>
                  </motion.div>
                </div>
              </Reveal>
            </div>
          </div>

          {/* Stats Metrics Grid */}
          <div className="mt-20 border-t border-emerald-900/10 pt-10">
            <div className="grid grid-cols-2 gap-6 lg:grid-cols-4">
              {STATS.map((stat, idx) => (
                <Reveal key={stat.label} delay={idx * 0.1}>
                  <div className="rounded-2xl border border-emerald-900/5 bg-white/70 p-6 backdrop-blur-xs transition hover:border-emerald-600/20 hover:bg-white hover:shadow-lg hover:shadow-emerald-900/5">
                    <p className="text-3xl font-extrabold tracking-tight text-emerald-700 sm:text-4xl">
                      {stat.value}
                    </p>
                    <p className="mt-2 text-sm font-bold text-[#19342b]">{stat.label}</p>
                    <p className="mt-1 text-xs text-slate-500">{stat.sub}</p>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* 2. OUR STORY */}
      <section id="story" className="bg-white py-20 sm:py-28">
        <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid items-center gap-12 lg:grid-cols-12 lg:gap-16">
            {/* Image Collage */}
            <div className="order-2 lg:order-1 lg:col-span-6">
              <Reveal>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-4">
                    <div className="overflow-hidden rounded-2xl shadow-md bg-emerald-50">
                      <img
                        src={IMAGES.farmer}
                        alt="Dedicated farmer harvesting produce"
                        className="aspect-[4/5] w-full object-cover transition duration-500 hover:scale-105"
                        onError={(e) => {
                          e.currentTarget.src = 'https://images.unsplash.com/photo-1595974482597-4b8da8879bc5?auto=format&fit=crop&w=1000&q=85';
                        }}
                      />
                    </div>
                    <div className="rounded-2xl border border-emerald-900/10 bg-emerald-50/60 p-6 text-center">
                      <p className="text-2xl font-black text-emerald-800">100%</p>
                      <p className="mt-1 text-xs font-semibold text-emerald-900/70">
                        Harvested fresh daily
                      </p>
                    </div>
                  </div>
                  <div className="space-y-4 pt-8">
                    <div className="rounded-2xl border border-amber-900/10 bg-amber-50/60 p-6 text-center">
                      <p className="text-2xl font-black text-amber-800">0%</p>
                      <p className="mt-1 text-xs font-semibold text-amber-900/70">
                        Harmful preservatives
                      </p>
                    </div>
                    <div className="overflow-hidden rounded-2xl shadow-md bg-emerald-50">
                      <img
                        src={IMAGES.harvest}
                        alt="Freshly harvested farm produce"
                        className="aspect-[4/5] w-full object-cover transition duration-500 hover:scale-105"
                        onError={(e) => {
                          e.currentTarget.src = 'https://images.unsplash.com/photo-1530836369250-ef72a3f5cda8?auto=format&fit=crop&w=1000&q=85';
                        }}
                      />
                    </div>
                  </div>
                </div>
              </Reveal>
            </div>

            {/* Story Content & Milestones */}
            <div className="order-1 lg:order-2 lg:col-span-6">
              <Reveal>
                <p className="eyebrow">Our Story</p>
                <h2 className="mt-3 text-3xl font-extrabold tracking-tight text-[#19342b] sm:text-4xl">
                  A journey from green fields to nourishing meals
                </h2>
                <p className="mt-5 text-base leading-relaxed text-[#19342b]/75">
                  Agri-Go did not start from a flashy corporate idea, but from grassroots field trips
                  to organic cultivation regions in Da Lat and the Central Highlands. We saw the hard
                  work of passionate farmers lacking transparent market channels, alongside families
                  anxious over pervasive pesticide residues.
                </p>
                <p className="mt-4 text-base leading-relaxed text-[#19342b]/75">
                  By building a direct supply chain, eliminating unnecessary middlemen, and applying
                  cold-chain freshness preservation tech, Agri-Go brings complete transparency: growers
                  earn what they truly deserve, and consumers enjoy pure, unadulterated nourishment.
                </p>

                {/* Timeline Cards */}
                <div className="mt-8 space-y-4 border-l-2 border-emerald-200 pl-5">
                  {TIMELINE.map((item) => (
                    <div key={item.year} className="relative">
                      <span className="absolute -left-[27px] top-1 flex h-3.5 w-3.5 rounded-full border-2 border-white bg-emerald-600 shadow-xs" />
                      <span className="text-xs font-extrabold text-emerald-700">{item.year}</span>
                      <h3 className="text-base font-bold text-[#19342b]">{item.title}</h3>
                      <p className="mt-1 text-xs text-slate-600 leading-relaxed">{item.desc}</p>
                    </div>
                  ))}
                </div>
              </Reveal>
            </div>
          </div>
        </div>
      </section>

      {/* 3. MISSION & VISION */}
      <section id="team" className="bg-gradient-to-b from-emerald-50/50 via-emerald-50/20 to-white py-20 sm:py-28">
        <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
          <Reveal>
            <div className="mx-auto max-w-2xl text-center">
              <p className="eyebrow">Mission &amp; Vision</p>
              <h2 className="mt-3 text-3xl font-extrabold text-[#19342b] sm:text-4xl">
                Guiding principles for every action
              </h2>
              <p className="mt-3 text-slate-600 text-sm sm:text-base">
                Every step at Agri-Go is guided by harmony between human wellness and ecological sustainability.
              </p>
            </div>
          </Reveal>

          <div className="mt-14 grid gap-8 md:grid-cols-2">
            {/* Mission Card */}
            <Reveal delay={0.1}>
              <div className="group relative flex h-full flex-col justify-between overflow-hidden rounded-3xl border border-emerald-900/10 bg-white p-8 sm:p-10 shadow-sm transition hover:border-emerald-600/30 hover:shadow-xl hover:shadow-emerald-900/10">
                <div className="pointer-events-none absolute right-0 top-0 h-40 w-40 rounded-full bg-emerald-100/50 blur-3xl transition group-hover:bg-emerald-200/50" />
                <div>
                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-700 text-white shadow-md shadow-emerald-700/25">
                    <Target size={28} />
                  </div>
                  <span className="mt-6 inline-block text-xs font-bold uppercase tracking-widest text-emerald-700">
                    Our Mission
                  </span>
                  <h3 className="mt-2 text-2xl font-extrabold text-[#19342b]">
                    Nourishing community health with unadulterated produce
                  </h3>
                  <p className="mt-4 text-base leading-relaxed text-[#19342b]/75">
                    Providing safe, nutrient-dense, and freshly picked food daily for millions of families.
                    Simultaneously building equitable partnerships that support local farmers transitioning
                    to sustainable organic practices with long-term financial security.
                  </p>
                </div>
                <div className="mt-8 flex items-center gap-2 border-t border-slate-100 pt-5 text-xs font-bold uppercase tracking-wider text-emerald-800">
                  <CheckCircle2 size={16} className="text-emerald-600" />
                  Health commitment &bull; Lifelong companionship
                </div>
              </div>
            </Reveal>

            {/* Vision Card */}
            <Reveal delay={0.2}>
              <div className="group relative flex h-full flex-col justify-between overflow-hidden rounded-3xl border border-emerald-900/10 bg-white p-8 sm:p-10 shadow-sm transition hover:border-emerald-600/30 hover:shadow-xl hover:shadow-emerald-900/10">
                <div className="pointer-events-none absolute right-0 top-0 h-40 w-40 rounded-full bg-amber-100/50 blur-3xl transition group-hover:bg-amber-200/50" />
                <div>
                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#c46532] text-white shadow-md shadow-amber-800/25">
                    <Compass size={28} />
                  </div>
                  <span className="mt-6 inline-block text-xs font-bold uppercase tracking-widest text-[#c46532]">
                    Strategic Vision
                  </span>
                  <h3 className="mt-2 text-2xl font-extrabold text-[#19342b]">
                    Leading transparent green agriculture ecosystem
                  </h3>
                  <p className="mt-4 text-base leading-relaxed text-[#19342b]/75">
                    To be the foremost trusted benchmark in Vietnam for digital agriculture value chains:
                    from seeds, living soil, and harvesting protocols right to the dining table. Pioneering
                    technologies that minimize carbon emissions and agricultural waste in transit.
                  </p>
                </div>
                <div className="mt-8 flex items-center gap-2 border-t border-slate-100 pt-5 text-xs font-bold uppercase tracking-wider text-[#c46532]">
                  <CheckCircle2 size={16} className="text-[#c46532]" />
                  Digital pioneer &bull; Toward a greener future
                </div>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* 4. OUR VALUES */}
      <section id="values" className="bg-white py-20 sm:py-28">
        <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
          <Reveal>
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
              <div>
                <p className="eyebrow">Core Values</p>
                <h2 className="mt-2 text-3xl font-extrabold text-[#19342b] sm:text-4xl">
                  Unwavering principles
                </h2>
              </div>
              <p className="max-w-md text-sm text-slate-600 leading-relaxed">
                Built upon the pillars of integrity, authenticity, and profound social responsibility
                to consumers and our land.
              </p>
            </div>
          </Reveal>

          <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {VALUES.map((item, idx) => {
              const Icon = item.icon;
              return (
                <Reveal key={item.title} delay={idx * 0.1}>
                  <div className="group flex h-full flex-col rounded-3xl border border-emerald-900/10 bg-[#fbfaf7] p-7 transition hover:-translate-y-1.5 hover:border-emerald-600/30 hover:bg-white hover:shadow-xl hover:shadow-emerald-900/10">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white border border-emerald-900/10 text-emerald-700 shadow-xs transition group-hover:bg-emerald-700 group-hover:text-white">
                      <Icon size={24} />
                    </div>
                    <h3 className="mt-5 text-lg font-bold text-[#19342b]">{item.title}</h3>
                    <p className="mt-2 flex-1 text-sm leading-relaxed text-slate-600">{item.desc}</p>
                  </div>
                </Reveal>
              );
            })}
          </div>
        </div>
      </section>

      {/* 5. WHY CHOOSE US */}
      <section className="bg-gradient-to-b from-stone-50/60 to-emerald-50/40 py-20 sm:py-28">
        <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid items-center gap-12 lg:grid-cols-12 lg:gap-16">
            <div className="lg:col-span-5">
              <Reveal>
                <p className="eyebrow">Distinct Advantages</p>
                <h2 className="mt-3 text-3xl font-extrabold tracking-tight text-[#19342b] sm:text-4xl">
                  Why thousands of families choose Agri-Go
                </h2>
                <p className="mt-4 text-base leading-relaxed text-[#19342b]/75">
                  We don't just supply vegetables; we deliver peace of mind. Every product on our shelves
                  passes through stringent safety audits so you can care for loved ones with confidence.
                </p>

                <div className="mt-8 rounded-2xl border border-emerald-900/10 bg-white p-6 shadow-sm">
                  <div className="flex items-center gap-4">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-800">
                      <CheckCircle2 size={24} />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-[#19342b]">7-Day Money-Back Guarantee</p>
                      <p className="text-xs text-slate-500">
                        In case of any transit bruising or dissatisfaction with produce quality.
                      </p>
                    </div>
                  </div>
                </div>
              </Reveal>
            </div>

            <div className="lg:col-span-7">
              <div className="grid gap-5 sm:grid-cols-2">
                {WHY_CHOOSE_US.map((item, idx) => {
                  const Icon = item.icon;
                  return (
                    <Reveal key={item.title} delay={idx * 0.1}>
                      <div className="rounded-3xl border border-emerald-900/10 bg-white p-6 shadow-xs transition hover:border-emerald-600/30 hover:shadow-lg hover:shadow-emerald-900/5">
                        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700">
                          <Icon size={20} />
                        </div>
                        <h3 className="mt-4 text-base font-bold text-[#19342b]">{item.title}</h3>
                        <p className="mt-2 text-xs leading-relaxed text-slate-600">{item.desc}</p>
                      </div>
                    </Reveal>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 6. CALL TO ACTION */}
      <section className="bg-white py-16 sm:py-24">
        <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
          <Reveal>
            <div className="relative overflow-hidden rounded-[2.5rem] bg-gradient-to-br from-emerald-900 via-emerald-950 to-green-950 p-10 text-white shadow-2xl sm:p-16 lg:p-20">
              <div className="pointer-events-none absolute -right-20 -top-20 h-80 w-80 rounded-full bg-emerald-500/20 blur-3xl" />
              <div className="pointer-events-none absolute -bottom-20 -left-20 h-80 w-80 rounded-full bg-lime-400/15 blur-3xl" />

              <div className="relative z-10 mx-auto max-w-3xl text-center">
                <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-400/30 bg-emerald-800/60 px-3.5 py-1.5 text-[11px] font-bold uppercase tracking-widest text-emerald-300">
                  <Sparkles size={13} />
                  Live healthy today
                </span>
                <h2 className="mt-6 text-3xl font-extrabold sm:text-5xl leading-tight">
                  Start your fresh organic meal journey with Agri-Go
                </h2>
                <p className="mt-5 text-base text-emerald-100/80 sm:text-lg">
                  Order quickly, trace produce journey transparently, and savor the natural sweetness
                  of our earth.
                </p>

                <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
                  <Link
                    to="/products"
                    className="inline-flex items-center gap-2 rounded-xl bg-amber-500 px-7 py-3.5 text-sm font-bold text-slate-950 shadow-lg shadow-amber-500/30 transition hover:-translate-y-0.5 hover:bg-amber-400"
                  >
                    View All Produce <ArrowRight size={17} />
                  </Link>
                  <Link
                    to="/contact"
                    className="inline-flex items-center gap-2 rounded-xl border border-white/25 bg-white/10 px-7 py-3.5 text-sm font-bold text-white backdrop-blur-md transition hover:bg-white/20"
                  >
                    Contact Us
                  </Link>
                </div>
              </div>
            </div>
          </Reveal>
        </div>
      </section>
    </MainLayout>
  );
}

export default AboutPage;
