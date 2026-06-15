import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Sparkles, Users, Key, CheckCircle2, ChevronDown, ChevronUp } from 'lucide-react';
import { firebaseConfigError, hasRealFirebase } from '../firebase/config';

export const QuickDemoBanner: React.FC<{ onOpenAuth: () => void }> = ({ onOpenAuth }) => {
  const { user, loginAsDemoUser } = useAuth();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="bg-gradient-to-r from-indigo-900 via-indigo-800 to-purple-900 dark:from-slate-950 dark:via-indigo-950 dark:to-slate-900 text-white border-b border-indigo-700/50 shadow-md transition-all duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2.5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          
          {/* Left info */}
          <div className="flex items-center gap-2.5">
            <span className="flex h-2.5 w-2.5 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
            </span>
            <div className="text-xs sm:text-sm font-medium flex items-center gap-2 flex-wrap">
              <span className="bg-white/10 px-2 py-0.5 rounded text-indigo-200 border border-white/10 font-bold flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-amber-300" /> Roomify Location Marketplace
              </span>
              <span>
                Engine: <strong className="text-emerald-300">{hasRealFirebase ? '🔥 Live Firebase' : '⚡ Local Hybrid Sync (100% Realtime)'}</strong>
              </span>
              {!hasRealFirebase && firebaseConfigError && (
                <span className="text-amber-200 bg-amber-500/10 border border-amber-300/20 px-2 py-0.5 rounded">
                  Production keys missing. Add env vars before deploy.
                </span>
              )}
            </div>
          </div>

          {/* Right Action Switchers */}
          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="bg-white/15 hover:bg-white/25 dark:bg-white/10 dark:hover:bg-white/20 active:scale-95 px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1.5 transition border border-white/20"
            >
              <Users className="w-3.5 h-3.5 text-amber-300" />
              <span>Test Accounts Menu</span>
              {isOpen ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </button>

            <button
              onClick={onOpenAuth}
              className="bg-amber-500 hover:bg-amber-400 text-slate-900 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1 shadow-sm transition transform hover:scale-105"
            >
              <Key className="w-3 h-3" /> Custom Login / OTP
            </button>
          </div>

        </div>

        {/* Expandable Demo Tray */}
        {isOpen && (
          <div className="mt-3 pt-3 border-t border-white/10 grid grid-cols-1 md:grid-cols-3 gap-3 animate-fadeIn pb-1">
            <div className="bg-white/5 p-3 rounded-xl border border-white/10">
              <div className="text-xs font-bold text-amber-300 mb-2 flex items-center gap-1.5">
                <span>👨‍💼 Owner Persona (Ramesh, Delhi)</span>
              </div>
              <p className="text-xs text-indigo-200 mb-2 leading-relaxed">
                Manages 3 premium Delhi listings in Ward 12. Incoming rental requests ready for approval/rejection.
              </p>
              <button
                onClick={() => { loginAsDemoUser('user-ramesh'); setIsOpen(false); }}
                className={`w-full py-1.5 px-3 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition ${
                  user?.uid === 'user-ramesh' 
                    ? 'bg-emerald-500 text-white shadow' 
                    : 'bg-white/10 hover:bg-white/20 text-white'
                }`}
              >
                {user?.uid === 'user-ramesh' ? <CheckCircle2 className="w-3.5 h-3.5" /> : null}
                Switch to Ramesh (Room Owner)
              </button>
            </div>

            <div className="bg-white/5 p-3 rounded-xl border border-white/10">
              <div className="text-xs font-bold text-cyan-300 mb-2 flex items-center gap-1.5">
                <span>👨‍🎓 Seeker Persona (Suresh, UPSC Aspirant)</span>
              </div>
              <p className="text-xs text-indigo-200 mb-2 leading-relaxed">
                Exploring rooms in Mukherjee Nagar & Koramangala. Active requests pending and accepted with unlocked phone.
              </p>
              <button
                onClick={() => { loginAsDemoUser('user-suresh'); setIsOpen(false); }}
                className={`w-full py-1.5 px-3 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition ${
                  user?.uid === 'user-suresh' 
                    ? 'bg-emerald-500 text-white shadow' 
                    : 'bg-white/10 hover:bg-white/20 text-white'
                }`}
              >
                {user?.uid === 'user-suresh' ? <CheckCircle2 className="w-3.5 h-3.5" /> : null}
                Switch to Suresh (Room Seeker)
              </button>
            </div>

            <div className="bg-white/5 p-3 rounded-xl border border-white/10">
              <div className="text-xs font-bold text-pink-300 mb-2 flex items-center gap-1.5">
                <span>👩‍💼 Tech Hub Owner (Ananya, Bengaluru)</span>
              </div>
              <p className="text-xs text-indigo-200 mb-2 leading-relaxed">
                Host of Luxury PG & Apartments in Koramangala Ward 152. Highly active listing showcase.
              </p>
              <button
                onClick={() => { loginAsDemoUser('user-ananya'); setIsOpen(false); }}
                className={`w-full py-1.5 px-3 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition ${
                  user?.uid === 'user-ananya' 
                    ? 'bg-emerald-500 text-white shadow' 
                    : 'bg-white/10 hover:bg-white/20 text-white'
                }`}
              >
                {user?.uid === 'user-ananya' ? <CheckCircle2 className="w-3.5 h-3.5" /> : null}
                Switch to Ananya (Bangalore Owner)
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};