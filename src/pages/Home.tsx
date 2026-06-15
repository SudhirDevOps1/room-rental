import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LOCATION_SUGGESTIONS, useGeolocation } from '../hooks/useGeolocation';
import { POPULAR_CITIES, ALL_AMENITIES_LIST } from '../firebase/mockData';
import { 
  MapPin, Search, Navigation, Zap, Building2, 
  ArrowRight, Sparkles 
} from 'lucide-react';

export const Home: React.FC = () => {
  const navigate = useNavigate();
  const { switchRole, loginAsDemoUser } = useAuth();
  const { detectLocation, isDetecting } = useGeolocation();
  const [searchCity, setSearchCity] = React.useState('Delhi');
  const [searchWard, setSearchWard] = React.useState('');

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const queryParams = new URLSearchParams();
    if (searchCity) queryParams.set('city', searchCity);
    if (searchWard) queryParams.set('ward', searchWard);
    navigate(`/search?${queryParams.toString()}`);
  };

  const handleNearMeClick = () => {
    detectLocation();
    setTimeout(() => {
      navigate('/search?nearme=true');
    }, 600);
  };

  return (
    <div className="space-y-24 pb-12 animate-fadeIn">
      
      {/* Premium Hero Section */}
      <section className="relative pt-12 pb-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-indigo-900 via-indigo-800 to-purple-900 dark:from-slate-950 dark:via-indigo-950 dark:to-slate-900 rounded-3xl mx-2 sm:mx-6 lg:mx-8 mt-4 overflow-hidden shadow-2xl text-white">
        
        {/* Background decorative glow blobs */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute bottom-0 left-10 w-96 h-96 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none"></div>

        <div className="max-w-4xl mx-auto text-center space-y-6 relative z-10">
          
          {/* Top Live Badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/15 text-xs sm:text-sm font-bold text-amber-300 shadow-inner">
            <Zap className="w-4 h-4 fill-amber-300 animate-pulse" />
            <span>India's #1 Live Location-Based Room Rental Marketplace</span>
          </div>

          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight leading-tight">
            Find Your Perfect Space. <br className="hidden sm:inline" />
            <span className="bg-gradient-to-r from-amber-300 via-emerald-300 to-cyan-300 bg-clip-text text-transparent">
              Sorted by Ward & Distance.
            </span>
          </h1>

          <p className="text-sm sm:text-lg text-indigo-100 max-w-2xl mx-auto leading-relaxed">
            Whether you are a UPSC aspirant seeking a quiet study room in Mukherjee Nagar or an IT professional wanting a luxury PG in Koramangala. Connect directly with verified room owners—<strong className="text-emerald-300 font-extrabold">100% Brokerage Free</strong>.
          </p>

          {/* Search Card Wizard */}
          <div className="bg-white dark:bg-slate-800 p-3 sm:p-4 rounded-3xl shadow-2xl max-w-3xl mx-auto text-slate-800 dark:text-slate-200 border border-slate-100 dark:border-slate-700 transform hover:scale-[1.01] transition duration-300">
            <form onSubmit={handleSearchSubmit} className="flex flex-col sm:flex-row items-center gap-3">
              
              {/* Custom location input */}
              <div className="flex-1 w-full bg-slate-50 dark:bg-slate-700/50 hover:bg-slate-100 dark:hover:bg-slate-700 p-3 rounded-2xl border border-slate-200/80 dark:border-slate-600 transition flex items-center gap-2.5">
                <MapPin className="w-5 h-5 text-indigo-600 dark:text-indigo-400 flex-shrink-0" />
                <div className="flex flex-col text-left w-full">
                  <span className="text-[10px] font-bold uppercase text-slate-400 dark:text-slate-500">City, district, village or area</span>
                  <input
                    list="home-location-suggestions"
                    value={searchCity}
                    onChange={(e) => setSearchCity(e.target.value)}
                    placeholder="e.g. Bhabua, Kaimur, Bihar"
                    className="w-full bg-transparent font-extrabold text-sm text-indigo-950 dark:text-slate-100 focus:outline-none placeholder:text-slate-400 dark:placeholder:text-slate-500"
                  />
                  <datalist id="home-location-suggestions">
                    {LOCATION_SUGGESTIONS.map(place => <option key={place} value={place} />)}
                  </datalist>
                </div>
              </div>

              {/* Ward Input */}
              <div className="flex-1 w-full bg-slate-50 dark:bg-slate-700/50 hover:bg-slate-100 dark:hover:bg-slate-700 p-3 rounded-2xl border border-slate-200/80 dark:border-slate-600 transition flex items-center gap-2.5">
                <Building2 className="w-5 h-5 text-amber-500 dark:text-amber-400 flex-shrink-0" />
                <div className="flex flex-col text-left w-full">
                  <span className="text-[10px] font-bold uppercase text-slate-400 dark:text-slate-500">Ward No. or Landmark</span>
                  <input
                    type="text"
                    placeholder="e.g. Ward 12, Hudson Lane"
                    value={searchWard}
                    onChange={(e) => setSearchWard(e.target.value)}
                    className="w-full bg-transparent font-bold text-sm text-indigo-950 dark:text-slate-100 focus:outline-none placeholder:text-slate-400 dark:placeholder:text-slate-500"
                  />
                </div>
              </div>

              {/* Submit button */}
              <button
                type="submit"
                className="w-full sm:w-auto px-6 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-extrabold text-sm rounded-2xl shadow-lg shadow-indigo-500/30 transition transform hover:scale-105 flex items-center justify-center gap-2 active:scale-95 cursor-pointer"
              >
                <Search className="w-5 h-5" />
                <span>Explore</span>
              </button>

            </form>

            <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-700 flex items-center justify-between text-xs font-semibold px-2 flex-wrap gap-2">
              <span className="text-slate-500 dark:text-slate-400 flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5 text-amber-500" /> Proximity Geo-index enabled
              </span>

              {/* Find Near Me GPS Trigger */}
              <button
                type="button"
                onClick={handleNearMeClick}
                disabled={isDetecting}
                className="px-3.5 py-1.5 bg-indigo-50 dark:bg-indigo-900/40 hover:bg-indigo-100 dark:hover:bg-indigo-900/60 text-indigo-700 dark:text-indigo-300 rounded-xl font-extrabold flex items-center gap-1.5 transition active:scale-95 cursor-pointer"
              >
                <Navigation className={`w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400 ${isDetecting ? 'animate-spin' : 'animate-pulse'}`} />
                <span>{isDetecting ? 'Locating GPS...' : '📍 Find Rooms Near Me'}</span>
              </button>
            </div>
          </div>

          {/* Key Feature Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-6 max-w-3xl mx-auto text-center">
            <div className="bg-white/10 p-3.5 rounded-2xl backdrop-blur-xs border border-white/10">
              <div className="text-2xl font-black text-amber-300">500+</div>
              <div className="text-xs text-indigo-200 mt-0.5">Live Available Rooms</div>
            </div>
            <div className="bg-white/10 p-3.5 rounded-2xl backdrop-blur-xs border border-white/10">
              <div className="text-2xl font-black text-emerald-300">Ward Index</div>
              <div className="text-xs text-indigo-200 mt-0.5">High Speed Geohash</div>
            </div>
            <div className="bg-white/10 p-3.5 rounded-2xl backdrop-blur-xs border border-white/10">
              <div className="text-2xl font-black text-cyan-300">0%</div>
              <div className="text-xs text-indigo-200 mt-0.5">Hidden Brokerage</div>
            </div>
            <div className="bg-white/10 p-3.5 rounded-2xl backdrop-blur-xs border border-white/10">
              <div className="text-2xl font-black text-pink-300">Instant</div>
              <div className="text-xs text-indigo-200 mt-0.5">Real-time Owner Chat</div>
            </div>
          </div>

        </div>
      </section>

      {/* Featured Cities Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4">
          <div>
            <span className="text-xs font-black text-indigo-600 dark:text-indigo-400 tracking-widest uppercase">Location Priority</span>
            <h2 className="text-2xl sm:text-3xl font-black text-[var(--color-text-primary)] tracking-tight mt-1">
              Explore Popular Rental Hubs
            </h2>
          </div>
          <button
            onClick={() => navigate('/search')}
            className="text-xs font-extrabold text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 flex items-center gap-1 group"
          >
            <span>View All City Directories</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {POPULAR_CITIES.map((city) => (
            <div
              key={city.name}
              onClick={() => navigate(`/search?city=${city.name}`)}
              className="group relative h-64 rounded-3xl overflow-hidden shadow-md hover:shadow-2xl transition duration-500 cursor-pointer border border-[var(--color-border)]"
            >
              <img
                src={city.image}
                alt={city.name}
                className="w-full h-full object-cover group-hover:scale-110 transition duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/85 via-slate-950/30 to-transparent"></div>
              
              <div className="absolute bottom-6 left-6 right-6 flex items-end justify-between text-white z-10">
                <div>
                  <h3 className="text-2xl font-black tracking-tight group-hover:text-amber-300 transition">
                    {city.name}
                  </h3>
                  <p className="text-xs text-slate-300 font-semibold flex items-center gap-1 mt-1">
                    <MapPin className="w-3 h-3 text-indigo-400" />
                    <span>{city.states} • Ward Priority</span>
                  </p>
                </div>
                <span className="px-3 py-1.5 rounded-2xl bg-white/20 backdrop-blur-md text-xs font-extrabold border border-white/20 group-hover:bg-indigo-600 group-hover:border-indigo-500 transition">
                  {city.roomsCount}+ Rooms
                </span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Interactive Walkthrough Section */}
      <section className="bg-slate-100/80 dark:bg-slate-800/60 rounded-3xl p-8 sm:p-12 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 border border-slate-200/80 dark:border-slate-700">
        <div className="text-center max-w-3xl mx-auto space-y-3 mb-16">
          <span className="text-xs font-extrabold text-amber-600 dark:text-amber-400 uppercase tracking-widest bg-amber-100 dark:bg-amber-900/30 px-3 py-1 rounded-full">
            Dual Persona Modes
          </span>
          <h2 className="text-3xl font-black text-[var(--color-text-primary)] tracking-tight">
            Designed Tailor-Made for Both Owners & Seekers
          </h2>
          <p className="text-xs sm:text-sm text-[var(--color-text-secondary)]">
            Switch UI persona seamlessly with one click. Here is how our live workflow functions in complete harmony.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          
          {/* Seekers column */}
          <div className="bg-[var(--color-bg-secondary)] rounded-3xl p-8 shadow-lg border border-indigo-100 dark:border-indigo-800 relative overflow-hidden space-y-6">
            <div className="absolute top-0 right-0 bg-indigo-600 text-white text-[10px] font-black px-4 py-1.5 rounded-bl-2xl uppercase tracking-widest shadow">
              For Room Seekers
            </div>

            <div className="w-14 h-14 rounded-2xl bg-indigo-50 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-black text-xl shadow-inner">
              🔍
            </div>

            <h3 className="text-2xl font-black text-[var(--color-text-primary)] tracking-tight">
              Seeking Your Next Home?
            </h3>

            <div className="space-y-4 text-xs sm:text-sm text-[var(--color-text-secondary)]">
              <div className="flex items-start gap-3">
                <span className="w-6 h-6 rounded-full bg-indigo-100 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300 font-extrabold flex items-center justify-center flex-shrink-0 mt-0.5">1</span>
                <div>
                  <strong className="text-[var(--color-text-primary)] font-extrabold">Advanced Proximity Search:</strong> Enter your ward number or use "Find Near Me" to instantly compute exact crow-fly distances in kilometers.
                </div>
              </div>

              <div className="flex items-start gap-3">
                <span className="w-6 h-6 rounded-full bg-indigo-100 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300 font-extrabold flex items-center justify-center flex-shrink-0 mt-0.5">2</span>
                <div>
                  <strong className="text-[var(--color-text-primary)] font-extrabold">Send Verification Request:</strong> Click "Request Room" to notify the verified owner about your intended move-in date.
                </div>
              </div>

              <div className="flex items-start gap-3">
                <span className="w-6 h-6 rounded-full bg-indigo-100 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300 font-extrabold flex items-center justify-center flex-shrink-0 mt-0.5">3</span>
                <div>
                  <strong className="text-[var(--color-text-primary)] font-extrabold">Instant Contact Unlock:</strong> Once the owner accepts your application, their direct mobile number gets unlocked and real-time live chat begins!
                </div>
              </div>
            </div>

            <button
              onClick={() => { switchRole('room_seeker'); navigate('/search'); }}
              className="w-full py-3.5 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-black text-xs rounded-2xl shadow-lg shadow-indigo-500/25 transition transform hover:scale-[1.02]"
            >
              Start Searching Rooms Now
            </button>
          </div>

          {/* Owners column */}
          <div className="bg-[var(--color-bg-secondary)] rounded-3xl p-8 shadow-lg border border-amber-100 dark:border-amber-800 relative overflow-hidden space-y-6">
            <div className="absolute top-0 right-0 bg-amber-500 text-slate-950 text-[10px] font-black px-4 py-1.5 rounded-bl-2xl uppercase tracking-widest shadow">
              For Room Owners
            </div>

            <div className="w-14 h-14 rounded-2xl bg-amber-50 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 flex items-center justify-center font-black text-xl shadow-inner">
              🏠
            </div>

            <h3 className="text-2xl font-black text-[var(--color-text-primary)] tracking-tight">
              Have an Empty Room / PG?
            </h3>

            <div className="space-y-4 text-xs sm:text-sm text-[var(--color-text-secondary)]">
              <div className="flex items-start gap-3">
                <span className="w-6 h-6 rounded-full bg-amber-100 dark:bg-amber-900/30 text-amber-800 dark:text-amber-300 font-extrabold flex items-center justify-center flex-shrink-0 mt-0.5">1</span>
                <div>
                  <strong className="text-[var(--color-text-primary)] font-extrabold">Register Location Flawlessly:</strong> Let our browser map pin pick up your exact geocoordinates or enter your ward number and landmark.
                </div>
              </div>

              <div className="flex items-start gap-3">
                <span className="w-6 h-6 rounded-full bg-amber-100 dark:bg-amber-900/30 text-amber-800 dark:text-amber-300 font-extrabold flex items-center justify-center flex-shrink-0 mt-0.5">2</span>
                <div>
                  <strong className="text-[var(--color-text-primary)] font-extrabold">Manage Live Status:</strong> When your room gets booked, toggle your room availability instantly so you don't receive spam requests.
                </div>
              </div>

              <div className="flex items-start gap-3">
                <span className="w-6 h-6 rounded-full bg-amber-100 dark:bg-amber-900/30 text-amber-800 dark:text-amber-300 font-extrabold flex items-center justify-center flex-shrink-0 mt-0.5">3</span>
                <div>
                  <strong className="text-[var(--color-text-primary)] font-extrabold">Screen Renter Applicants:</strong> Review tenant profiles and messages in your "Requests Received" portal before accepting.
                </div>
              </div>
            </div>

            <button
              onClick={() => { switchRole('room_owner'); navigate('/register-room'); }}
              className="w-full py-3.5 px-4 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs rounded-2xl shadow-lg shadow-amber-500/25 transition transform hover:scale-[1.02]"
            >
              List Your Room For Free
            </button>
          </div>

        </div>
      </section>

      {/* Featured Premium Amenities Showcase */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <span className="text-xs font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-widest">Everything You Need</span>
          <h2 className="text-2xl sm:text-3xl font-black text-[var(--color-text-primary)] tracking-tight">
            Filter by Essential Living Amenities
          </h2>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-8 gap-4">
          {ALL_AMENITIES_LIST.map((am) => (
            <div
              key={am.id}
              onClick={() => navigate(`/search?amenity=${am.id}`)}
              className="bg-[var(--color-bg-secondary)] hover:bg-indigo-50 dark:hover:bg-indigo-900/30 p-4 rounded-2xl border border-[var(--color-border)] hover:border-indigo-300 dark:hover:border-indigo-700 text-center space-y-2 cursor-pointer transition shadow-2xs hover:shadow-md group"
            >
              <div className="text-2xl group-hover:scale-125 transition transform duration-300">{am.icon}</div>
              <div className="text-[11px] font-bold text-[var(--color-text-primary)] leading-tight">{am.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Evaluator Interactive Walkthrough Quick Try Box */}
      <section className="bg-gradient-to-r from-emerald-600 to-teal-700 dark:from-emerald-800 dark:to-teal-900 rounded-3xl p-8 sm:p-12 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 shadow-2xl text-white flex flex-col md:flex-row items-center justify-between gap-8">
        <div className="space-y-4 max-w-lg text-left">
          <span className="bg-white/20 text-emerald-100 text-xs font-extrabold px-3 py-1 rounded-full uppercase tracking-wider">
            Ready for live walkthrough?
          </span>
          <h3 className="text-2xl sm:text-3xl font-black tracking-tight leading-tight">
            Test as Ramesh or Suresh with One Click!
          </h3>
          <p className="text-xs sm:text-sm text-emerald-100 leading-relaxed">
            We have pre-configured <strong>Ramesh Sharma</strong> (Delhi Owner with active Ward 12 listings) and <strong>Suresh Kumar</strong> (Seeker Applicant). Click below to experience the workflow instantly.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
          <button
            onClick={() => { loginAsDemoUser('user-ramesh'); navigate('/my-listings'); }}
            className="px-6 py-4 rounded-2xl bg-white text-emerald-950 hover:bg-emerald-50 font-black text-xs sm:text-sm shadow-xl transition transform hover:scale-105 active:scale-95 flex items-center justify-center gap-2 cursor-pointer"
          >
            👨‍💼 Login as Ramesh (Owner)
          </button>
          
          <button
            onClick={() => { loginAsDemoUser('user-suresh'); navigate('/search'); }}
            className="px-6 py-4 rounded-2xl bg-emerald-900 dark:bg-emerald-950 hover:bg-emerald-800 text-white font-black text-xs sm:text-sm shadow-xl transition transform hover:scale-105 active:scale-95 flex items-center justify-center gap-2 border border-emerald-700 cursor-pointer"
          >
            👨‍🎓 Login as Suresh (Seeker)
          </button>
        </div>
      </section>

    </div>
  );
};