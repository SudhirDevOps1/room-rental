import React from 'react';
import { NavLink } from 'react-router-dom';
import { MapPin, Heart, Shield, Award, PhoneCall, Sparkles } from 'lucide-react';
import { POPULAR_CITIES } from '../firebase/mockData';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-slate-900 text-slate-400 border-t border-slate-800 pt-12 pb-8 mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
          
          {/* Brand Col */}
          <div className="space-y-4 md:col-span-1">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center text-white shadow-md">
                <MapPin className="w-5 h-5" />
              </div>
              <span className="text-xl font-extrabold text-white tracking-tight">NestFinder</span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              India's premium live location-based Room & PG Rental Marketplace. Built with high-speed Geo-indexing, live availability trackers, and instant direct owner messaging.
            </p>
            <div className="flex items-center gap-2 pt-1 text-xs text-indigo-400 font-semibold">
              <Shield className="w-4 h-4 text-emerald-400" /> 100% Brokerage Free Options
            </div>
          </div>

          {/* Quick Hubs */}
          <div>
            <h4 className="text-sm font-bold text-white mb-4 uppercase tracking-wider flex items-center gap-1.5">
              <MapPin className="w-4 h-4 text-indigo-400" /> Popular Hubs
            </h4>
            <ul className="space-y-2 text-xs">
              {POPULAR_CITIES.map(c => (
                <li key={c.name}>
                  <NavLink to="/search" className="hover:text-white transition flex items-center justify-between">
                    <span>Rooms in {c.name}</span>
                    <span className="bg-slate-800 px-2 py-0.5 rounded text-[10px] text-slate-400">Ward Priority</span>
                  </NavLink>
                </li>
              ))}
            </ul>
          </div>

          {/* User Persona links */}
          <div>
            <h4 className="text-sm font-bold text-white mb-4 uppercase tracking-wider flex items-center gap-1.5">
              <Award className="w-4 h-4 text-amber-400" /> For Users
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <NavLink to="/search" className="hover:text-white transition">Room Seekers Portal</NavLink>
              </li>
              <li>
                <NavLink to="/register-room" className="hover:text-white transition flex items-center gap-1.5 text-amber-400">
                  <Sparkles className="w-3.5 h-3.5" /> Post Room Listing (Free)
                </NavLink>
              </li>
              <li>
                <NavLink to="/my-listings" className="hover:text-white transition">Owner Management Desk</NavLink>
              </li>
              <li>
                <NavLink to="/my-requests" className="hover:text-white transition">Rental Requests Tracker</NavLink>
              </li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h4 className="text-sm font-bold text-white mb-4 uppercase tracking-wider flex items-center gap-1.5">
              <PhoneCall className="w-4 h-4 text-emerald-400" /> Live Support
            </h4>
            <p className="text-xs text-slate-400 leading-relaxed mb-3">
              Have questions or need assistance finding an independent PG or family apartment?
            </p>
            <div className="bg-slate-800/80 p-3 rounded-2xl border border-slate-700/80 text-xs">
              <div className="text-white font-bold mb-1">Helpdesk Helpline</div>
              <div className="text-emerald-400 font-mono text-sm font-bold">+91 98110 00000</div>
              <div className="text-[10px] text-slate-500 mt-1">10:00 AM - 07:00 PM (IST)</div>
            </div>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="border-t border-slate-800/80 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <div>
            © {new Date().getFullYear()} NestFinder / Roomify Tech Inc. All rights reserved. Built for Location-based Room Rental.
          </div>
          <div className="flex items-center gap-1 text-slate-400">
            Made with <Heart className="w-3.5 h-3.5 text-rose-500 inline fill-rose-500" /> for aspirants and professionals.
          </div>
        </div>

      </div>
    </footer>
  );
};