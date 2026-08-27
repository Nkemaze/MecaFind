import { Link } from 'react-router-dom';
import Icon from '../components/Icon';

const steps = [
  { icon: 'my_location', title: 'Find Nearby', desc: 'Allow location access to instantly see verified workshops around your current position in Yaoundé.' },
  { icon: 'compare', title: 'Compare', desc: 'Review specialties, read customer feedback, and compare ratings to choose the best professional.' },
  { icon: 'directions_car', title: 'Get Directions', desc: 'Navigate seamlessly to their garage or call them directly for emergency roadside assistance.' },
];

const previewMechanics = [
  { name: 'AutoCare Garage', rating: 4.8, reviews: 124, distance: '2.5 km', area: 'Bastos', services: ['Diagnostics', 'Engine'], img: '/workshop-1.webp' },
  { name: 'ProTyre Fix', rating: 4.5, reviews: 89, distance: '4.1 km', area: 'Mvan', services: ['Tyres', 'Alignment'], img: '/workshop-2.webp' },
];

export default function Home() {
  return (
    <main className="pt-20">
      {/* Hero */}
      <section className="relative w-full overflow-hidden bg-[#0B1F3A] text-white">
        {/* Animated background */}
        <div className="absolute inset-0">
          <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(255,255,255,0.4) 1px, transparent 0)', backgroundSize: '32px 32px' }} />
          <div className="absolute top-[-20%] right-[-10%] w-[600px] h-[600px] bg-primary/20 rounded-full blur-[120px] animate-pulse" style={{ animationDuration: '4s' }} />
          <div className="absolute bottom-[-20%] left-[-10%] w-[500px] h-[500px] bg-tertiary/15 rounded-full blur-[100px] animate-pulse" style={{ animationDuration: '6s' }} />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary/10 rounded-full blur-[150px]" />
        </div>

        <div className="relative max-w-[1280px] mx-auto px-5 lg:px-16 pt-20 pb-8 lg:pt-28 lg:pb-12">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            {/* Left: Content */}
            <div className="flex flex-col gap-7 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md px-4 py-2 rounded-full text-xs font-semibold uppercase tracking-widest text-inverse-primary border border-white/15 w-fit mx-auto lg:mx-0">
                <span className="w-2 h-2 rounded-full bg-primary-fixed animate-pulse" />
                Yaoundé's #1 Mechanic Network
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-[56px] font-bold leading-[1.1] tracking-tight">
                Find a trusted mechanic{' '}
                <span className="relative inline-block">
                  <span className="text-inverse-primary">near you.</span>
                  <svg className="absolute -bottom-1 left-0 w-full h-3 text-primary" fill="none" viewBox="0 0 200 12" xmlns="http://www.w3.org/2000/svg">
                    <path d="M2 9.5C65.5 -1.5 136.5 0.5 198 9.5" stroke="currentColor" strokeLinecap="round" strokeWidth="3" className="opacity-80" />
                  </svg>
                </span>
              </h1>

              <p className="text-base lg:text-lg text-white/60 leading-relaxed max-w-lg mx-auto lg:mx-0">
                Discover verified mechanics around Yaoundé, compare their services, read reviews, and get instant directions to their workshops.
              </p>

              {/* Search bar */}
              <div className="flex flex-col sm:flex-row gap-3 w-full max-w-lg mx-auto lg:mx-0">
                <div className="relative flex-1">
                  <Icon name="search" className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30" size="text-[20px]" />
                  <input
                    type="text"
                    placeholder="Enter your location or workshop name..."
                    className="w-full h-14 pl-12 pr-4 bg-white/10 backdrop-blur-md border border-white/15 rounded-xl text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-primary focus:bg-white/15 transition-all"
                  />
                </div>
                <Link
                  to="/find"
                  className="h-14 px-8 bg-primary text-on-primary rounded-xl font-semibold text-sm hover:bg-primary-container hover:shadow-[0_8px_32px_-4px_rgba(0,71,193,0.5)] hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2 shrink-0"
                >
                  <Icon name="search" size="text-[18px]" /> Search
                </Link>
              </div>

              {/* Stats */}
              <div className="flex items-center gap-8 pt-4 justify-center lg:justify-start">
                <div>
                  <p className="text-2xl font-bold text-white">150+</p>
                  <p className="text-xs text-white/40 uppercase tracking-wider">Workshops</p>
                </div>
                <div className="w-px h-10 bg-white/15" />
                <div>
                  <p className="text-2xl font-bold text-white">4.8</p>
                  <p className="text-xs text-white/40 uppercase tracking-wider">Avg Rating</p>
                </div>
                <div className="w-px h-10 bg-white/15" />
                <div>
                  <p className="text-2xl font-bold text-white">5K+</p>
                  <p className="text-xs text-white/40 uppercase tracking-wider">Users</p>
                </div>
              </div>

              {/* CTAs */}
              <div className="flex flex-col sm:flex-row items-center gap-3 pt-2 justify-center lg:justify-start">
                <Link to="/find" className="w-full sm:w-auto bg-primary text-on-primary px-8 py-3.5 rounded-xl font-semibold text-sm hover:bg-primary-container hover:shadow-[0_8px_32px_-4px_rgba(0,71,193,0.5)] hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2">
                  <Icon name="my_location" size="text-[18px]" /> Find a Mechanic
                </Link>
                <Link to="/auth/register" className="w-full sm:w-auto bg-white/10 backdrop-blur-md text-white border border-white/20 px-8 py-3.5 rounded-xl font-semibold text-sm hover:bg-white/20 transition-all flex items-center justify-center gap-2">
                  Join as a Mechanic
                </Link>
              </div>
            </div>

            {/* Right: Visual */}
            <div className="relative hidden lg:block">
              {/* Main image */}
              <div className="relative rounded-2xl overflow-hidden shadow-2xl shadow-black/30 ring-1 ring-white/10 transform rotate-[-1deg] hover:rotate-0 transition-transform duration-500">
                <img src="/hero-map.webp" alt="MecaFind app interface" className="w-full aspect-[4/3] object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0B1F3A]/40 via-transparent to-transparent" />
              </div>

              {/* Floating card 1 - Workshop */}
              <div className="absolute -left-8 top-1/4 bg-white rounded-xl p-3 shadow-xl shadow-black/20 flex items-center gap-3 animate-[float_4s_ease-in-out_infinite]">
                <div className="w-10 h-10 rounded-lg bg-primary flex items-center justify-center shrink-0">
                  <Icon name="build" size="text-[18px]" className="text-white" />
                </div>
                <div>
                  <p className="text-xs font-semibold text-on-surface">AutoCare Garage</p>
                  <div className="flex items-center gap-1">
                    <Icon name="star" size="text-[12px]" className="text-tertiary" />
                    <span className="text-[11px] font-bold text-on-surface">4.8</span>
                    <span className="text-[10px] text-on-surface-variant">(124)</span>
                  </div>
                </div>
              </div>

              {/* Floating card 2 - Distance */}
              <div className="absolute -right-4 bottom-1/3 bg-white rounded-xl p-3 shadow-xl shadow-black/20 flex items-center gap-3 animate-[float_5s_ease-in-out_infinite_1s]">
                <div className="w-10 h-10 rounded-lg bg-[#E6F4EA] flex items-center justify-center shrink-0">
                  <Icon name="near_me" size="text-[18px]" className="text-[#1E7E34]" />
                </div>
                <div>
                  <p className="text-xs font-semibold text-on-surface">2.5 km away</p>
                  <p className="text-[10px] text-on-surface-variant">~8 min drive</p>
                </div>
              </div>

              {/* Floating card 3 - Verified */}
              <div className="absolute left-1/4 -bottom-4 bg-white rounded-xl px-3 py-2 shadow-xl shadow-black/20 flex items-center gap-2 animate-[float_4.5s_ease-in-out_infinite_0.5s]">
                <Icon name="verified" size="text-[16px]" className="text-[#1E7E34]" />
                <span className="text-[11px] font-semibold text-on-surface">Verified Workshop</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom wave separator */}
        <div className="relative h-16 lg:h-24">
          <svg className="absolute bottom-0 w-full h-full" viewBox="0 0 1440 96" fill="none" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M0 96L60 85.3C120 74.7 240 53.3 360 48C480 42.7 600 53.3 720 58.7C840 64 960 64 1080 58.7C1200 53.3 1320 42.7 1380 37.3L1440 32V96H1380C1320 96 1200 96 1080 96C960 96 840 96 720 96C600 96 480 96 360 96C240 96 120 96 60 96H0Z" fill="var(--color-background)" />
          </svg>
        </div>
      </section>

      {/* How It Works */}
      <section className="w-full py-24 bg-background">
        <div className="max-w-[1280px] mx-auto px-5 lg:px-16">
          <div className="text-center mb-16">
            <h2 className="text-2xl lg:text-3xl font-semibold text-on-background mb-2">How MecaFind Works</h2>
            <p className="text-lg text-on-surface-variant max-w-2xl mx-auto">Get your vehicle back on the road in three simple steps.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative">
            <div className="hidden md:block absolute top-1/2 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-primary/30 to-transparent -translate-y-1/2 z-0" />
            {steps.map((step, i) => (
              <div key={i} className={`relative z-10 flex flex-col items-center text-center p-8 bg-surface rounded-2xl shadow-sm hover:shadow-md transition-shadow group ${i === 1 ? 'md:-mt-8' : ''}`}>
                <div className="w-16 h-16 bg-surface-container-highest rounded-full flex items-center justify-center mb-4 relative overflow-hidden group-hover:bg-primary-fixed transition-colors">
                  <Icon name={step.icon} className="text-primary relative z-10" size="text-[32px]" />
                </div>
                <div className="text-xs font-semibold text-primary mb-2 uppercase tracking-widest">Step 0{i + 1}</div>
                <h3 className="text-xl font-semibold text-on-surface mb-2">{step.title}</h3>
                <p className="text-base text-on-surface-variant">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Top Rated Preview */}
      <section className="w-full py-24 bg-surface-container-low overflow-hidden">
        <div className="max-w-[1280px] mx-auto px-5 lg:px-16 flex flex-col lg:flex-row gap-6 items-center">
          <div className="lg:w-1/3 flex flex-col gap-8">
            <div>
              <h2 className="text-2xl lg:text-3xl font-semibold text-on-background mb-2">Top Rated Mechanics in Yaoundé</h2>
              <p className="text-lg text-on-surface-variant">Browse through our curated list of highly skilled professionals ready to assist you.</p>
            </div>
            <Link to="/find" className="self-start bg-transparent text-primary border border-primary px-4 py-2 rounded-lg text-sm font-semibold hover:bg-primary/5 transition-colors flex items-center gap-2">
              View Full Directory <Icon name="arrow_forward" size="text-[18px]" />
            </Link>
          </div>
          <div className="lg:w-2/3 w-full grid grid-cols-1 md:grid-cols-2 gap-4">
            {previewMechanics.map((m, i) => (
              <div key={i} className={`bg-surface rounded-2xl p-4 flex flex-col gap-4 shadow-sm hover:shadow-md transition-all hover:-translate-y-1 border border-outline-variant/30 ${i === 1 ? 'md:mt-12' : ''}`}>
                <div className="flex gap-4">
                  <div className="w-20 h-20 rounded-xl bg-surface-container-high flex items-center justify-center shrink-0 overflow-hidden">
                    {m.img ? (
                      <img src={m.img} alt={m.name} className="w-full h-full object-cover" />
                    ) : (
                      <Icon name="build" className="text-on-surface-variant opacity-50" size="text-[32px]" />
                    )}
                  </div>
                  <div className="flex-1 flex flex-col justify-center">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="text-base font-semibold text-on-surface">{m.name}</h3>
                      <span className="bg-[#E6F4EA] text-[#1E7E34] text-[10px] px-2 py-1 rounded-full font-semibold uppercase flex items-center gap-1">
                        <Icon name="verified" size="text-[12px]" /> Verified
                      </span>
                    </div>
                    <div className="flex items-center gap-1 text-tertiary-container mb-1">
                      <Icon name="star" size="text-[16px]" className="text-tertiary-container" />
                      <span className="text-sm font-semibold">{m.rating}</span>
                      <span className="text-on-surface-variant text-sm opacity-70 ml-1">({m.reviews} reviews)</span>
                    </div>
                    <p className="text-sm text-on-surface-variant flex items-center gap-1">
                      <Icon name="location_on" size="text-[14px]" /> {m.area}, {m.distance} away
                    </p>
                  </div>
                </div>
                <div className="flex gap-2">
                  {m.services.map((s) => (
                    <span key={s} className="bg-surface-container px-2 py-1 rounded text-xs text-on-surface-variant">{s}</span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="w-full py-24 bg-surface">
        <div className="max-w-[1280px] mx-auto px-5 lg:px-16">
          <div className="flex flex-col md:flex-row items-center bg-[#0B1F3A] rounded-3xl overflow-hidden shadow-xl">
            <div className="md:w-1/2 p-8 lg:p-16 text-white">
              <div className="inline-block bg-primary/20 px-3 py-1 rounded-full text-inverse-primary text-xs font-semibold uppercase tracking-wider mb-4 border border-primary/30">
                Simple Pricing
              </div>
              <h2 className="text-2xl lg:text-3xl font-semibold mb-4 text-white">Transparent &amp; Fair Access</h2>
              <p className="text-lg text-inverse-on-surface opacity-80 mb-8">
                We believe in providing value first. Try our discovery platform for free and pay a nominal fee only when you need continuous access.
              </p>
              <div className="flex flex-col gap-4">
                <div className="flex items-start gap-3">
                  <Icon name="check_circle" className="text-primary-fixed mt-1" />
                  <div>
                    <strong className="font-semibold text-base block text-white">First 3 Uses Free</strong>
                    <span className="text-sm text-inverse-on-surface opacity-70">Find a mechanic without spending a dime.</span>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Icon name="check_circle" className="text-primary-fixed mt-1" />
                  <div>
                    <strong className="font-semibold text-base block text-white">1,000 FCFA for 5 More Uses</strong>
                    <span className="text-sm text-inverse-on-surface opacity-70">Affordable top-ups via Mobile Money or Orange Money.</span>
                  </div>
                </div>
              </div>
              <Link to="/usage" className="mt-8 inline-block bg-primary text-on-primary px-4 py-2 rounded-lg text-sm font-semibold hover:bg-primary-container transition-all shadow-md">
                View Usage History
              </Link>
            </div>
            <div className="md:w-1/2 h-64 md:h-auto bg-surface-container-high flex items-center justify-center overflow-hidden">
              <img src="/payment-hero.webp" alt="Mobile Money payment integration" className="w-full h-full object-cover" />
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
