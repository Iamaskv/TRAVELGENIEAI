import React from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, Shield, Phone, Mail, ExternalLink } from 'lucide-react';

export const Footer = () => {
  return (
    <footer className="bg-slate-900 text-slate-400 pt-16 pb-12 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 pb-12 border-b border-slate-800">
          {/* Brand info */}
          <div className="md:col-span-1 space-y-4">
            <Link to="/" className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-emerald-500 text-slate-950 flex items-center justify-center font-bold">
                <Sparkles className="w-5 h-5" />
              </div>
              <span className="text-xl font-extrabold text-white tracking-tight">
                TravelGenie <span className="text-emerald-400">AI</span>
              </span>
            </Link>
            <p className="text-xs text-slate-400 leading-relaxed">
              Your intelligent AI travel companion. End-to-end trip planning with verified transport comparisons, affordable accommodation recommendations, and smart budget optimization.
            </p>
            <div className="flex items-center gap-2 text-xs text-emerald-400 font-medium">
              <Shield className="w-4 h-4" />
              <span>Verified Provider Search Connections</span>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">
              Explore & Plan
            </h4>
            <ul className="space-y-2.5 text-xs">
              <li>
                <Link to="/plan" className="hover:text-emerald-400 transition-colors">
                  Plan a Custom Trip
                </Link>
              </li>
              <li>
                <Link to="/my-trips" className="hover:text-emerald-400 transition-colors">
                  My Saved Itineraries
                </Link>
              </li>
              <li>
                <a href="#destinations" className="hover:text-emerald-400 transition-colors">
                  Popular Indian Destinations
                </a>
              </li>
              <li>
                <a href="#how-it-works" className="hover:text-emerald-400 transition-colors">
                  How AI Engine Works
                </a>
              </li>
            </ul>
          </div>

          {/* Booking Providers */}
          <div>
            <h4 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">
              Integrated Booking Partners
            </h4>
            <ul className="space-y-2.5 text-xs">
              <li>
                <a
                  href="https://www.irctc.co.in"
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 hover:text-emerald-400"
                >
                  <span>IRCTC Indian Railways</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </li>
              <li>
                <a
                  href="https://www.redbus.in"
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 hover:text-emerald-400"
                >
                  <span>RedBus Interstate Buses</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </li>
              <li>
                <a
                  href="https://www.makemytrip.com"
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 hover:text-emerald-400"
                >
                  <span>MakeMyTrip Flights & Stays</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </li>
              <li>
                <a
                  href="https://www.booking.com"
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 hover:text-emerald-400"
                >
                  <span>Booking.com Hotels</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </li>
              <li>
                <a
                  href="https://www.hostelworld.com"
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 hover:text-emerald-400"
                >
                  <span>Hostelworld Backpacker Hubs</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </li>
            </ul>
          </div>

          {/* Traveler Helplines & Support */}
          <div>
            <h4 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">
              Traveler Helplines & Tips
            </h4>
            <div className="space-y-3 text-xs">
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>National Emergency: 112 / Tourist Helpline: 1363</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>support@travelgenie.ai</span>
              </div>
              <p className="text-[11px] text-slate-500 pt-2 leading-relaxed">
                Notice: All transport schedules and accommodation tariffs are verified against provider inventory or clearly presented with demonstration tags.
              </p>
            </div>
          </div>
        </div>

        {/* Bottom copyright */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-4">
          <p>© {new Date().getFullYear()} TravelGenie AI. Engineered for smart explorers worldwide.</p>
          <div className="flex items-center gap-6">
            <span className="hover:text-slate-400 cursor-pointer">Privacy Policy</span>
            <span className="hover:text-slate-400 cursor-pointer">Terms of Service</span>
            <span className="hover:text-slate-400 cursor-pointer">Safety Guidelines</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
