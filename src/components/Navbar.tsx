import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  MapPin, Home, Search, PlusCircle, Building2, ClipboardList, MessageSquare, 
  LogOut, User as UserIcon, RefreshCw, ChevronDown, Menu, X 
} from 'lucide-react';

export const Navbar: React.FC<{ onOpenAuth: () => void }> = ({ onOpenAuth }) => {
  const { user, activeRole, switchRole, logout, unreadMessagesCount, pendingRequestsCount } = useAuth();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);

  const handleRoleToggle = () => {
    const nextRole = activeRole === 'room_owner' ? 'room_seeker' : 'room_owner';
    switchRole(nextRole);
    if (nextRole === 'room_owner') {
      navigate('/my-listings');
    } else {
      navigate('/search');
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/80 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Brand Logo */}
          <div className="flex items-center gap-3">
            <NavLink to="/" className="flex items-center gap-2.5 group">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-indigo-600 to-purple-600 flex items-center justify-center text-white shadow-md shadow-indigo-500/25 group-hover:scale-105 transition transform">
                <MapPin className="w-6 h-6 animate-bounce" />
              </div>
              <div className="flex flex-col">
                <span className="text-xl font-extrabold tracking-tight bg-gradient-to-r from-indigo-900 via-indigo-800 to-purple-900 bg-clip-text text-transparent">
                  NestFinder
                </span>
                <span className="text-[10px] font-bold text-indigo-600 tracking-widest uppercase flex items-center gap-1">
                  <span>Location Verified</span>
                </span>
              </div>
            </NavLink>

            {/* Active Role Indicator Pill */}
            {user && (
              <button
                onClick={handleRoleToggle}
                className={`hidden md:flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border transition transform active:scale-95 ${
                  activeRole === 'room_owner'
                    ? 'bg-amber-50 text-amber-900 border-amber-300 shadow-xs hover:bg-amber-100'
                    : 'bg-indigo-50 text-indigo-900 border-indigo-300 shadow-xs hover:bg-indigo-100'
                }`}
                title="Click to instantly switch between Room Owner & Room Seeker UI mode"
              >
                <RefreshCw className="w-3 h-3 text-slate-500 hover:rotate-180 transition duration-500" />
                <span>Mode:</span>
                <span className="flex items-center gap-1">
                  {activeRole === 'room_owner' ? (
                    <>
                      <Building2 className="w-3.5 h-3.5 text-amber-600" /> Owner Mode
                    </>
                  ) : (
                    <>
                      <Search className="w-3.5 h-3.5 text-indigo-600" /> Seeker Mode
                    </>
                  )}
                </span>
              </button>
            )}
          </div>

          {/* Desktop Navigation Link Tabs */}
          <nav className="hidden lg:flex items-center gap-1">
            <NavLink
              to="/"
              className={({ isActive }) => `px-3.5 py-2 rounded-xl text-sm font-bold flex items-center gap-2 transition ${
                isActive ? 'bg-indigo-50 text-indigo-700 shadow-xs' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
              }`}
            >
              <Home className="w-4 h-4" /> Home
            </NavLink>

            <NavLink
              to="/search"
              className={({ isActive }) => `px-3.5 py-2 rounded-xl text-sm font-bold flex items-center gap-2 transition ${
                isActive ? 'bg-indigo-50 text-indigo-700 shadow-xs' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
              }`}
            >
              <Search className="w-4 h-4" /> Find Rooms
            </NavLink>

            {/* Owner links or accessible to all with prompt */}
            <NavLink
              to="/register-room"
              className={({ isActive }) => `px-3.5 py-2 rounded-xl text-sm font-bold flex items-center gap-2 transition ${
                isActive ? 'bg-amber-50 text-amber-800 shadow-xs' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
              }`}
            >
              <PlusCircle className="w-4 h-4 text-amber-600" /> List Your Room
            </NavLink>

            {user && (
              <>
                {activeRole === 'room_owner' && (
                  <NavLink
                    to="/my-listings"
                    className={({ isActive }) => `px-3.5 py-2 rounded-xl text-sm font-bold flex items-center gap-2 transition ${
                      isActive ? 'bg-indigo-50 text-indigo-700 shadow-xs' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                    }`}
                  >
                    <Building2 className="w-4 h-4" /> My Listings
                  </NavLink>
                )}

                <NavLink
                  to="/my-requests"
                  className={({ isActive }) => `relative px-3.5 py-2 rounded-xl text-sm font-bold flex items-center gap-2 transition ${
                    isActive ? 'bg-indigo-50 text-indigo-700 shadow-xs' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                  }`}
                >
                  <ClipboardList className="w-4 h-4" /> Requests
                  {pendingRequestsCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-amber-500 text-slate-900 font-extrabold text-[10px] w-5 h-5 rounded-full flex items-center justify-center shadow animate-pulse">
                      {pendingRequestsCount}
                    </span>
                  )}
                </NavLink>

                <NavLink
                  to="/inbox"
                  className={({ isActive }) => `relative px-3.5 py-2 rounded-xl text-sm font-bold flex items-center gap-2 transition ${
                    isActive ? 'bg-indigo-50 text-indigo-700 shadow-xs' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                  }`}
                >
                  <MessageSquare className="w-4 h-4" /> Inbox
                  {unreadMessagesCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-rose-500 text-white font-extrabold text-[10px] w-5 h-5 rounded-full flex items-center justify-center shadow animate-bounce">
                      {unreadMessagesCount}
                    </span>
                  )}
                </NavLink>
              </>
            )}
          </nav>

          {/* Right End: Auth & User Profile Dropdown */}
          <div className="flex items-center gap-3">
            {user ? (
              <div className="relative">
                <button
                  onClick={() => setIsUserDropdownOpen(!isUserDropdownOpen)}
                  className="flex items-center gap-2.5 pl-2 pr-3 py-1.5 rounded-2xl hover:bg-slate-100 transition border border-slate-200 text-left"
                >
                  <img
                    src={user.photoURL}
                    alt={user.name}
                    className="w-8 h-8 rounded-xl object-cover ring-2 ring-indigo-500/30"
                  />
                  <div className="hidden sm:flex flex-col">
                    <span className="text-xs font-bold text-slate-800 leading-tight">
                      {user.name.split(' ')[0]}
                    </span>
                    <span className="text-[10px] text-slate-500 flex items-center gap-0.5">
                      <MapPin className="w-2.5 h-2.5 text-indigo-600" /> {user.city}
                    </span>
                  </div>
                  <ChevronDown className="w-4 h-4 text-slate-400" />
                </button>

                {/* User Dropdown Menu */}
                {isUserDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-64 bg-white rounded-3xl shadow-2xl border border-slate-100 p-3 z-50 animate-fadeIn">
                    <div className="p-3 bg-gradient-to-br from-indigo-50 to-purple-50 rounded-2xl mb-3 border border-indigo-100 flex items-center gap-3">
                      <img
                        src={user.photoURL}
                        alt={user.name}
                        className="w-12 h-12 rounded-xl object-cover shadow"
                      />
                      <div>
                        <div className="text-sm font-extrabold text-indigo-950">{user.name}</div>
                        <div className="text-xs font-medium text-slate-600">{user.phone}</div>
                        <span className="inline-flex mt-1 items-center gap-1 px-2 py-0.5 rounded-md bg-indigo-600 text-white font-bold text-[10px]">
                          {user.role === 'room_owner' ? '👑 Room Owner' : '🔍 Room Seeker'}
                        </span>
                      </div>
                    </div>

                    <div className="space-y-1">
                      <button
                        onClick={() => { handleRoleToggle(); setIsUserDropdownOpen(false); }}
                        className="w-full px-3 py-2 text-xs font-bold text-slate-700 hover:bg-indigo-50 hover:text-indigo-700 rounded-xl flex items-center justify-between transition"
                      >
                        <span className="flex items-center gap-2">
                          <RefreshCw className="w-4 h-4 text-indigo-600" /> Switch UI Mode
                        </span>
                        <span className="text-[10px] font-medium bg-slate-100 px-2 py-0.5 rounded text-slate-600">
                          {activeRole === 'room_owner' ? 'To Seeker' : 'To Owner'}
                        </span>
                      </button>

                      <div className="border-t border-slate-100 my-1"></div>

                      <button
                        onClick={() => { logout(); setIsUserDropdownOpen(false); navigate('/'); }}
                        className="w-full px-3 py-2 text-xs font-bold text-rose-600 hover:bg-rose-50 rounded-xl flex items-center gap-2 transition"
                      >
                        <LogOut className="w-4 h-4" /> Logout Account
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <button
                onClick={onOpenAuth}
                className="py-2.5 px-5 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 active:scale-95 text-white text-xs sm:text-sm font-bold rounded-2xl shadow-md shadow-indigo-500/25 flex items-center gap-2 transition cursor-pointer"
              >
                <UserIcon className="w-4 h-4" />
                <span>Sign In / Register</span>
              </button>
            )}

            {/* Mobile menu action toggle */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="lg:hidden p-2 rounded-2xl bg-slate-100 text-slate-700 hover:bg-slate-200 transition"
            >
              {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

        </div>
      </div>

      {/* Mobile Navigation Dropdown Tray */}
      {isMobileMenuOpen && (
        <div className="lg:hidden bg-white border-b border-slate-200 p-4 shadow-2xl space-y-2 animate-fadeIn">
          {user && (
            <div className="bg-indigo-50 p-3 rounded-2xl flex items-center justify-between mb-3">
              <span className="text-xs font-bold text-indigo-900">Active Mode:</span>
              <button
                onClick={() => { handleRoleToggle(); setIsMobileMenuOpen(false); }}
                className="bg-indigo-600 text-white px-3 py-1 rounded-xl text-xs font-bold flex items-center gap-1.5"
              >
                <RefreshCw className="w-3 h-3" />
                {activeRole === 'room_owner' ? 'Owner UI (Switch)' : 'Seeker UI (Switch)'}
              </button>
            </div>
          )}

          <div className="grid grid-cols-2 gap-2">
            <NavLink
              to="/"
              onClick={() => setIsMobileMenuOpen(false)}
              className={({ isActive }) => `p-3 rounded-2xl text-xs font-bold flex items-center gap-2 border ${
                isActive ? 'bg-indigo-50 border-indigo-200 text-indigo-700' : 'bg-slate-50 border-transparent text-slate-700'
              }`}
            >
              <Home className="w-4 h-4" /> Home
            </NavLink>

            <NavLink
              to="/search"
              onClick={() => setIsMobileMenuOpen(false)}
              className={({ isActive }) => `p-3 rounded-2xl text-xs font-bold flex items-center gap-2 border ${
                isActive ? 'bg-indigo-50 border-indigo-200 text-indigo-700' : 'bg-slate-50 border-transparent text-slate-700'
              }`}
            >
              <Search className="w-4 h-4" /> Find Rooms
            </NavLink>

            <NavLink
              to="/register-room"
              onClick={() => setIsMobileMenuOpen(false)}
              className={({ isActive }) => `p-3 rounded-2xl text-xs font-bold flex items-center gap-2 border col-span-2 ${
                isActive ? 'bg-amber-50 border-amber-200 text-amber-800' : 'bg-amber-500/10 border-transparent text-amber-900'
              }`}
            >
              <PlusCircle className="w-4 h-4 text-amber-600" /> List Your Room (Owner)
            </NavLink>

            {user && (
              <>
                {activeRole === 'room_owner' && (
                  <NavLink
                    to="/my-listings"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={({ isActive }) => `p-3 rounded-2xl text-xs font-bold flex items-center gap-2 border ${
                      isActive ? 'bg-indigo-50 border-indigo-200 text-indigo-700' : 'bg-slate-50 border-transparent text-slate-700'
                    }`}
                  >
                    <Building2 className="w-4 h-4" /> My Listings
                  </NavLink>
                )}

                <NavLink
                  to="/my-requests"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={({ isActive }) => `p-3 rounded-2xl text-xs font-bold flex items-center gap-2 border justify-between ${
                    isActive ? 'bg-indigo-50 border-indigo-200 text-indigo-700' : 'bg-slate-50 border-transparent text-slate-700'
                  }`}
                >
                  <span className="flex items-center gap-2">
                    <ClipboardList className="w-4 h-4" /> Requests
                  </span>
                  {pendingRequestsCount > 0 && (
                    <span className="bg-amber-500 text-slate-900 font-extrabold px-2 py-0.5 rounded-full text-[10px]">
                      {pendingRequestsCount}
                    </span>
                  )}
                </NavLink>

                <NavLink
                  to="/inbox"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={({ isActive }) => `p-3 rounded-2xl text-xs font-bold flex items-center gap-2 border justify-between col-span-2 ${
                    isActive ? 'bg-indigo-50 border-indigo-200 text-indigo-700' : 'bg-slate-50 border-transparent text-slate-700'
                  }`}
                >
                  <span className="flex items-center gap-2">
                    <MessageSquare className="w-4 h-4" /> Messages
                  </span>
                  {unreadMessagesCount > 0 && (
                    <span className="bg-rose-500 text-white font-extrabold px-2 py-0.5 rounded-full text-[10px]">
                      {unreadMessagesCount} unread
                    </span>
                  )}
                </NavLink>
              </>
            )}
          </div>
        </div>
      )}

    </header>
  );
};