import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Sparkles,
  ArrowRight,
  MapPin,
  CheckCircle2,
  Train,
  Building,
  ShieldCheck,
  Compass,
  Star,
  Clock,
  ChevronRight,
  Wallet,
} from 'lucide-react';

export const LandingPage = () => {
  const navigate = useNavigate();
  const [quickOrigin, setQuickOrigin] = useState('Bhubaneswar');
  const [quickDestination, setQuickDestination] = useState('Goa');

  const popularDestinations = [
    {
      name: 'Goa',
      state: 'Goa, India',
      tagline: 'Sun-kissed beaches, Portuguese villas & vibrant shacks',
      image: 'https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?w=800&auto=format&fit=crop&q=80',
      budgetFrom: '₹12,000',
      duration: '5-7 Days',
      vibe: 'Beaches & Nightlife',
      origin: 'Bhubaneswar',
    },
    {
      name: 'Jaipur',
      state: 'Rajasthan, India',
      tagline: 'Royal palaces, pink sandstone forts & culinary heritage',
      image: 'https://images.unsplash.com/photo-1599661046289-e31897846e41?w=800&auto=format&fit=crop&q=80',
      budgetFrom: '₹9,500',
      duration: '4-5 Days',
      vibe: 'Heritage & Culture',
      origin: 'Delhi',
    },
    {
      name: 'Manali',
      state: 'Himachal Pradesh, India',
      tagline: 'Majestic Himalayan snow peaks, Solang valley & pine forests',
      image: 'https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?w=800&auto=format&fit=crop&q=80',
      budgetFrom: '₹11,000',
      duration: '5-6 Days',
      vibe: 'Mountains & Adventure',
      origin: 'Delhi',
    },
    {
      name: 'Kerala Backwaters',
      state: 'Alleppey & Munnar',
      tagline: 'Serene palm-fringed lagoons, tea gardens & Ayurvedic bliss',
      image: 'https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?w=800&auto=format&fit=crop&q=80',
      budgetFrom: '₹14,500',
      duration: '6-8 Days',
      vibe: 'Nature & Relaxation',
      origin: 'Bangalore',
    },
    {
      name: 'Varanasi',
      state: 'Uttar Pradesh, India',
      tagline: 'Ancient spiritual Ganga ghats, evening aartis & silk alleys',
      image: 'https://images.unsplash.com/photo-1561361513-2d000a50f0dc?w=800&auto=format&fit=crop&q=80',
      budgetFrom: '₹7,500',
      duration: '3-4 Days',
      vibe: 'Spiritual & Historic',
      origin: 'Kolkata',
    },
    {
      name: 'Udaipur',
      state: 'Rajasthan, India',
      tagline: 'The City of Lakes with floating marble palaces & sunset boats',
      image: 'https://images.unsplash.com/photo-1615836245337-f5b9b2303f10?w=800&auto=format&fit=crop&q=80',
      budgetFrom: '₹10,500',
      duration: '4-5 Days',
      vibe: 'Romance & Lakes',
      origin: 'Mumbai',
    },
  ];

  const handleHeroSubmit = (e) => {
    e.preventDefault();
    navigate(`/plan?origin=${encodeURIComponent(quickOrigin)}&destination=${encodeURIComponent(quickDestination)}`);
  };

  const handlePresetClick = (dest) => {
    navigate(`/plan?origin=${encodeURIComponent(dest.origin)}&destination=${encodeURIComponent(dest.name)}`);
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* HERO SECTION */}
      <section className="relative overflow-hidden bg-gradient-to-b from-emerald-950 via-slate-900 to-slate-950 text-white pt-16 pb-24 lg:pt-24 lg:pb-32">
        {/* Subtle background glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-96 bg-gradient-to-tr from-emerald-500/10 via-sky-500/10 to-transparent blur-3xl pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="max-w-3xl mx-auto text-center space-y-6">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs font-semibold tracking-wide uppercase">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Next-Gen Travel Intelligence</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white leading-tight">
              Your Journey. Your Budget.{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-teal-300 to-sky-400">
                Your AI Travel Planner.
              </span>
            </h1>

            <p className="text-base sm:text-lg text-slate-300 leading-relaxed font-normal">
              Enter where you are and where you want to go. TravelGenie AI finds the cheapest and fastest trains, buses, and flights, recommends affordable top-rated stays, optimizes your budget, and creates a realistic day-by-day sightseeing itinerary.
            </p>

            {/* Quick Hero Search Box */}
            <form
              onSubmit={handleHeroSubmit}
              className="mt-8 p-3 sm:p-4 bg-white/10 backdrop-blur-md rounded-2xl border border-white/15 shadow-2xl flex flex-col md:flex-row items-center gap-3 text-left"
            >
              <div className="w-full md:w-1/2 px-3 py-2 bg-white/90 rounded-xl text-slate-900 flex items-center gap-3 focus-within:ring-2 focus-within:ring-emerald-500">
                <MapPin className="w-5 h-5 text-emerald-600 shrink-0" />
                <div className="w-full">
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Starting City</div>
                  <input
                    type="text"
                    value={quickOrigin}
                    onChange={(e) => setQuickOrigin(e.target.value)}
                    placeholder="e.g. Bhubaneswar"
                    className="w-full bg-transparent font-semibold text-sm text-slate-900 focus:outline-none placeholder:text-slate-400"
                  />
                </div>
              </div>

              <div className="w-full md:w-1/2 px-3 py-2 bg-white/90 rounded-xl text-slate-900 flex items-center gap-3 focus-within:ring-2 focus-within:ring-emerald-500">
                <Compass className="w-5 h-5 text-sky-600 shrink-0" />
                <div className="w-full">
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Destination</div>
                  <input
                    type="text"
                    value={quickDestination}
                    onChange={(e) => setQuickDestination(e.target.value)}
                    placeholder="e.g. Goa"
                    className="w-full bg-transparent font-semibold text-sm text-slate-900 focus:outline-none placeholder:text-slate-400"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full md:w-auto px-6 py-3.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-xl shadow-lg shadow-emerald-500/25 flex items-center justify-center gap-2 transition-all hover:scale-[1.02] shrink-0"
              >
                <span>Plan My Trip</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>

            {/* Quick Pill Highlights */}
            <div className="pt-2 flex flex-wrap items-center justify-center gap-4 sm:gap-8 text-xs text-slate-300">
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>Independent Outbound & Return Searches</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>Deterministic Budget Engine</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>Interactive Route Maps</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* POPULAR DESTINATIONS SECTION */}
      <section id="destinations" className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-10">
          <div>
            <div className="text-xs font-bold text-emerald-600 uppercase tracking-widest mb-1">
              Handcrafted Getaways
            </div>
            <h2 className="text-3xl font-bold text-slate-900 tracking-tight">
              Popular Indian Destinations
            </h2>
            <p className="text-sm text-slate-500 mt-1">
              Select an iconic destination to prefill your personalized AI trip planner.
            </p>
          </div>
          <button
            onClick={() => navigate('/plan')}
            className="mt-4 sm:mt-0 inline-flex items-center gap-1 text-sm font-semibold text-emerald-600 hover:text-emerald-700"
          >
            <span>Custom Destination</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {popularDestinations.map((dest, idx) => (
            <div
              key={idx}
              onClick={() => handlePresetClick(dest)}
              className="group cursor-pointer bg-white rounded-2xl overflow-hidden border border-slate-200/80 shadow-sm hover:shadow-xl hover:border-emerald-300 transition-all duration-300 flex flex-col"
            >
              <div className="relative h-52 overflow-hidden bg-slate-100">
                <img
                  src={dest.image}
                  alt={dest.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                <div className="absolute top-3 left-3 px-2.5 py-1 rounded-full bg-white/90 backdrop-blur-sm text-slate-800 text-[11px] font-bold">
                  {dest.vibe}
                </div>
                <div className="absolute top-3 right-3 px-2.5 py-1 rounded-full bg-emerald-600/90 backdrop-blur-sm text-white text-[11px] font-semibold">
                  From {dest.budgetFrom}
                </div>
                <div className="absolute bottom-3 left-3 text-white">
                  <div className="text-xl font-bold">{dest.name}</div>
                  <div className="text-xs text-white/80">{dest.state}</div>
                </div>
              </div>

              <div className="p-4 flex-1 flex flex-col justify-between">
                <p className="text-xs text-slate-600 leading-relaxed line-clamp-2">
                  {dest.tagline}
                </p>

                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-xs text-slate-500">
                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                    <span>{dest.duration}</span>
                  </div>
                  <span className="text-xs font-semibold text-emerald-600 group-hover:translate-x-1 transition-transform flex items-center gap-1">
                    Plan Trip <ArrowRight className="w-3 h-3" />
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* HOW IT WORKS SECTION */}
      <section id="how-it-works" className="py-20 bg-slate-100/70 border-y border-slate-200/70">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <div className="text-xs font-bold text-emerald-600 uppercase tracking-widest mb-1">
              Smart Methodology
            </div>
            <h2 className="text-3xl font-bold text-slate-900 tracking-tight">
              How TravelGenie AI Works
            </h2>
            <p className="text-sm text-slate-500 mt-2">
              From your initial budget to confirmed booking links and day-by-day maps in four steps.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm relative">
              <div className="w-12 h-12 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-extrabold text-lg mb-4">
                01
              </div>
              <h3 className="text-base font-bold text-slate-900 mb-2">Input Your Parameters</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Enter your starting location, destination, dates, traveler party, total budget, and travel interests.
              </p>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm relative">
              <div className="w-12 h-12 rounded-xl bg-sky-100 text-sky-700 flex items-center justify-center font-extrabold text-lg mb-4">
                02
              </div>
              <h3 className="text-base font-bold text-slate-900 mb-2">Dual Transport & Stays</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                The engine evaluates outbound and return journeys independently across trains, buses, and flights, pairing verified stays.
              </p>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm relative">
              <div className="w-12 h-12 rounded-xl bg-teal-100 text-teal-700 flex items-center justify-center font-extrabold text-lg mb-4">
                03
              </div>
              <h3 className="text-base font-bold text-slate-900 mb-2">Deterministic Budgeting</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Our backend mathematical engine calculates costs, food, transfers, reserves, and automatically alerts you if over budget.
              </p>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm relative">
              <div className="w-12 h-12 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center font-extrabold text-lg mb-4">
                04
              </div>
              <h3 className="text-base font-bold text-slate-900 mb-2">AI Itinerary & Maps</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Gemini crafts a chronologically sound schedule respecting your exact arrival & departure times, complete with maps and checklists.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CORE FEATURES GRID */}
      <section className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <div className="text-xs font-bold text-emerald-600 uppercase tracking-widest mb-1">
            Engineered For Travelers
          </div>
          <h2 className="text-3xl font-bold text-slate-900 tracking-tight">
            Key Application Capabilities
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <div className="p-6 bg-white rounded-2xl border border-slate-200 shadow-sm hover:border-emerald-300 transition-all">
            <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center mb-4">
              <Train className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-2">Outbound & Return Independence</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Travel outbound on an affordable scenic overnight train (e.g. 3A sleeper), and return swiftly via flight or bus without forced symmetric booking.
            </p>
          </div>

          <div className="p-6 bg-white rounded-2xl border border-slate-200 shadow-sm hover:border-emerald-300 transition-all">
            <div className="w-10 h-10 rounded-xl bg-sky-100 text-sky-600 flex items-center justify-center mb-4">
              <Wallet className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-2">Real-Time Budget Recalculation</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Swap any transport mode or hotel with a single click. The budget breakdown, emergency buffer, and daily allocations update instantaneously.
            </p>
          </div>

          <div className="p-6 bg-white rounded-2xl border border-slate-200 shadow-sm hover:border-emerald-300 transition-all">
            <div className="w-10 h-10 rounded-xl bg-teal-100 text-teal-600 flex items-center justify-center mb-4">
              <Building className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-2">Affordable Stays Comparison</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              From social backpacker hostels to cozy verified homestays and beach resorts, compare full-stay totals including all taxes and fees.
            </p>
          </div>

          <div className="p-6 bg-white rounded-2xl border border-slate-200 shadow-sm hover:border-emerald-300 transition-all">
            <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-600 flex items-center justify-center mb-4">
              <Sparkles className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-2">Contextual AI Travel Assistant</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Ask "Can you make this trip cheaper?" or "What should I pack?" Our assistant understands your live itinerary and executes modifications.
            </p>
          </div>

          <div className="p-6 bg-white rounded-2xl border border-slate-200 shadow-sm hover:border-emerald-300 transition-all">
            <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-600 flex items-center justify-center mb-4">
              <MapPin className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-2">Interactive OpenStreetMap</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Visualize your arrival airport, railway junction, accommodation, and day-wise attractions with turn-by-turn routing links to Google Maps.
            </p>
          </div>

          <div className="p-6 bg-white rounded-2xl border border-slate-200 shadow-sm hover:border-emerald-300 transition-all">
            <div className="w-10 h-10 rounded-xl bg-rose-100 text-rose-600 flex items-center justify-center mb-4">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-2">No Hallucinated Booking Data</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Clear distinction between verified provider fares and estimated expenses. Direct outbound search buttons to IRCTC, RedBus, and Booking.com.
            </p>
          </div>
        </div>
      </section>

      {/* DEMO TESTIMONIALS */}
      <section className="py-20 bg-white border-t border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <div className="text-xs font-bold text-emerald-600 uppercase tracking-widest mb-1">
              Demonstration Feedback
            </div>
            <h2 className="text-3xl font-bold text-slate-900 tracking-tight">
              What Travelers Are Saying
            </h2>
            <p className="text-xs text-slate-400 mt-1 italic">
              (Identified demonstration user experiences)
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-6 bg-slate-50 rounded-2xl border border-slate-200">
              <div className="flex items-center gap-1 text-amber-400 mb-3">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                ))}
              </div>
              <p className="text-xs text-slate-700 leading-relaxed mb-4">
                "Planned my 7-day Goa trip from Bhubaneswar on a strict ₹15,000 budget. The system selected an affordable 3A train and Zostel stay, leaving ₹3,500 emergency buffer. Absolutely spot on!"
              </p>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold text-xs">
                  AS
                </div>
                <div>
                  <div className="font-bold text-slate-900 text-xs">Abhishek S.</div>
                  <div className="text-[11px] text-slate-500">Solo Traveler • Bhubaneswar to Goa</div>
                </div>
              </div>
            </div>

            <div className="p-6 bg-slate-50 rounded-2xl border border-slate-200">
              <div className="flex items-center gap-1 text-amber-400 mb-3">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                ))}
              </div>
              <p className="text-xs text-slate-700 leading-relaxed mb-4">
                "The independent return journey feature is a game-changer. We took an overnight Volvo to Manali and flew back to Delhi from Kullu to save time on Monday morning."
              </p>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-sky-600 text-white flex items-center justify-center font-bold text-xs">
                  PK
                </div>
                <div>
                  <div className="font-bold text-slate-900 text-xs">Priya K.</div>
                  <div className="text-[11px] text-slate-500">Couple Trip • Delhi to Manali</div>
                </div>
              </div>
            </div>

            <div className="p-6 bg-slate-50 rounded-2xl border border-slate-200">
              <div className="flex items-center gap-1 text-amber-400 mb-3">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                ))}
              </div>
              <p className="text-xs text-slate-700 leading-relaxed mb-4">
                "The interactive map grouped our Jaipur sightseeing by neighborhood so we didn't waste hours in traffic. The PDF export had our complete budget ready for the trip."
              </p>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-teal-600 text-white flex items-center justify-center font-bold text-xs">
                  RM
                </div>
                <div>
                  <div className="font-bold text-slate-900 text-xs">Rohan M.</div>
                  <div className="text-[11px] text-slate-500">Family Group • Mumbai to Jaipur</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA FOOTER BANNER */}
      <section className="py-16 bg-gradient-to-r from-emerald-600 to-teal-700 text-white text-center">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-4">
          <h2 className="text-3xl font-extrabold tracking-tight">
            Ready to Plan Your Next Indian Adventure?
          </h2>
          <p className="text-sm text-emerald-100 max-w-xl mx-auto">
            Experience end-to-end travel planning with real schedules, verified stays, and smart AI itineraries.
          </p>
          <div className="pt-2">
            <button
              onClick={() => navigate('/plan')}
              className="px-8 py-3.5 bg-slate-950 hover:bg-slate-900 text-white font-bold rounded-xl shadow-xl transition-all hover:scale-105 inline-flex items-center gap-2"
            >
              <span>Launch Trip Planner</span>
              <ArrowRight className="w-4 h-4 text-emerald-400" />
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};
