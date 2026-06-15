import React, { useState, useEffect, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { subscribeRooms, submitRentalRequest } from '../firebase/db';
import { Room, ROOM_TYPE_OPTIONS, GENDER_OPTIONS, ALL_AMENITIES_LIST } from '../firebase/mockData';
import { useGeolocation, LOCATION_SUGGESTIONS } from '../hooks/useGeolocation';
import { useAuth } from '../context/AuthContext';
import { RoomCard } from '../components/RoomCard';
import { MapView } from '../components/MapView';
import { 
  Filter, Map, Grid, List, SlidersHorizontal, 
  RotateCcw, Building2, ArrowUpDown, X, Zap 
} from 'lucide-react';
import { toast } from 'sonner';

export const SearchRooms: React.FC<{ onOpenAuth: () => void }> = ({ onOpenAuth }) => {
  const { user } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const [allRooms, setAllRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);

  // Geo states
  const { coords, detectLocation, setCityLocation, resolveLocationName, locationName } = useGeolocation();

  // Filters state
  const [cityFilter, setCityFilter] = useState<string>(() => searchParams.get('city') || 'All');
  const [wardFilter, setWardFilter] = useState<string>(() => searchParams.get('ward') || '');
  const [maxRent, setMaxRent] = useState<number>(25000);
  const [typeFilters, setTypeFilters] = useState<string[]>([]);
  const [genderFilter, setGenderFilter] = useState<string>('All');
  const [availableOnly, setAvailableOnly] = useState<boolean>(true);
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>(() => {
    const am = searchParams.get('amenity');
    return am ? [am] : [];
  });

  // Display mode state
  const [viewMode, setViewMode] = useState<'map' | 'grid' | 'list'>('grid');
  const [sortBy, setSortBy] = useState<'newest' | 'price_low' | 'price_high' | 'distance'>('newest');
  const [selectedRoomOnMap, setSelectedRoomOnMap] = useState<Room | null>(null);
  const [showMobileFilterModal, setShowMobileFilterModal] = useState(false);
  const [requestSuccessRoom, setRequestSuccessRoom] = useState<string | null>(null);

  // Real-time Rooms subscriber
  useEffect(() => {
    const unsub = subscribeRooms((liveRooms) => {
      setAllRooms(liveRooms);
      setLoading(false);
    });
    return () => unsub();
  }, []);

  // Handle URL changes & Near me
  useEffect(() => {
    const c = searchParams.get('city');
    const w = searchParams.get('ward');
    const am = searchParams.get('amenity');
    const near = searchParams.get('nearme');

    if (c) {
      setCityFilter(c);
      setCityLocation(c);
    }
    if (w) setWardFilter(w);
    if (am && !selectedAmenities.includes(am)) setSelectedAmenities([am]);
    
    if (near === 'true') {
      detectLocation();
      setSortBy('distance');
    }
  }, [searchParams]);

  // Haversine distance helper for inline sorting
  const getDist = (r: Room) => {
    const R = 6371;
    const dLat = (r.coordinates.lat - coords.lat) * (Math.PI / 180);
    const dLon = (r.coordinates.lng - coords.lng) * (Math.PI / 180);
    const lat1 = coords.lat * (Math.PI / 180);
    const lat2 = r.coordinates.lat * (Math.PI / 180);

    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.sin(dLon/2) * Math.sin(dLon/2) * Math.cos(lat1) * Math.cos(lat2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return Number((R * c).toFixed(1));
  };

  // Filtered & Sorted computation
  const filteredRooms = useMemo(() => {
    return allRooms.filter(r => {
      if (availableOnly && !r.available) return false;
      if (cityFilter.trim() && cityFilter !== 'All') {
        const c = cityFilter.toLowerCase().trim();
        const cityMatch = r.city.toLowerCase().includes(c);
        const locMatch = r.locationText.toLowerCase().includes(c);
        const landmarkMatch = r.landmark.toLowerCase().includes(c);
        const stateMatch = r.state.toLowerCase().includes(c);
        const pinMatch = r.pincode.includes(c);
        if (!cityMatch && !locMatch && !landmarkMatch && !stateMatch && !pinMatch) return false;
      }
      if (wardFilter.trim()) {
        const q = wardFilter.toLowerCase().trim();
        const wardMatch = r.wardNo.toLowerCase().includes(q);
        const locMatch = r.locationText.toLowerCase().includes(q);
        const titleMatch = r.title.toLowerCase().includes(q);
        if (!wardMatch && !locMatch && !titleMatch) return false;
      }
      if (r.rent > maxRent) return false;
      if (typeFilters.length > 0 && !typeFilters.includes(r.type)) return false;
      if (genderFilter !== 'All' && r.genderPref !== 'Anyone' && r.genderPref !== genderFilter) return false;
      if (selectedAmenities.length > 0) {
        const hasAll = selectedAmenities.every(am => r.amenities.includes(am));
        if (!hasAll) return false;
      }
      return true;
    }).sort((a, b) => {
      if (sortBy === 'price_low') return a.rent - b.rent;
      if (sortBy === 'price_high') return b.rent - a.rent;
      if (sortBy === 'distance') return getDist(a) - getDist(b);
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
  }, [allRooms, availableOnly, cityFilter, wardFilter, maxRent, typeFilters, genderFilter, selectedAmenities, sortBy, coords]);

  const toggleRoomType = (type: string) => {
    setTypeFilters(prev => 
      prev.includes(type) ? prev.filter(t => t !== type) : [...prev, type]
    );
  };

  const toggleAmenity = (am: string) => {
    setSelectedAmenities(prev =>
      prev.includes(am) ? prev.filter(a => a !== am) : [...prev, am]
    );
  };

  const resetAllFilters = () => {
    setCityFilter('All');
    setWardFilter('');
    setMaxRent(25000);
    setTypeFilters([]);
    setGenderFilter('All');
    setAvailableOnly(true);
    setSelectedAmenities([]);
    setSearchParams({});
  };

  const handleRequestRent = async (room: Room) => {
    if (!user) {
      onOpenAuth();
      return;
    }

    const res = await submitRentalRequest({
      roomId: room.id,
      roomTitle: room.title,
      roomCity: room.city,
      roomWard: room.wardNo,
      roomRent: room.rent,
      roomPhoto: room.photosURLs?.[0] || '',
      ownerId: room.ownerId,
      ownerName: room.ownerName,
      ownerPhone: room.ownerPhone,
      ownerEmail: room.ownerEmail,
      seekerId: user.uid,
      seekerName: user.name,
      seekerPhone: user.phone,
      seekerEmail: user.email,
      seekerPhoto: user.photoURL,
      message: `Hello ${room.ownerName}! I am extremely interested in renting your ${room.title} in ${room.wardNo}. Please review my profile and accept my application.`
    });

    if (res) {
      toast.success('Rental application sent to owner');
      setRequestSuccessRoom(room.id);
      setTimeout(() => setRequestSuccessRoom(null), 4000);
    } else {
      toast.info('You already requested this room. Check My Requests.');
    }
  };

  const renderSidebarFilters = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between pb-4 border-b border-[var(--color-border)]">
        <h3 className="text-sm font-black text-[var(--color-text-primary)] uppercase tracking-wider flex items-center gap-2">
          <SlidersHorizontal className="w-4 h-4 text-indigo-600 dark:text-indigo-400" /> Advanced Filters
        </h3>
        <button
          onClick={resetAllFilters}
          className="text-xs font-bold text-[var(--color-text-tertiary)] hover:text-indigo-700 dark:hover:text-indigo-400 flex items-center gap-1 transition"
        >
          <RotateCcw className="w-3 h-3" /> Reset
        </button>
      </div>

      <div className="bg-indigo-50/60 dark:bg-indigo-900/30 p-3 rounded-2xl border border-indigo-100 dark:border-indigo-800 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse"></span>
          <span className="text-xs font-bold text-indigo-950 dark:text-indigo-200">Live Available Only</span>
        </div>
        <input
          type="checkbox"
          checked={availableOnly}
          onChange={(e) => setAvailableOnly(e.target.checked)}
          className="w-4 h-4 text-indigo-600 rounded-md focus:ring-indigo-500 cursor-pointer"
        />
      </div>

      <div>
        <label className="block text-xs font-bold text-[var(--color-text-secondary)] mb-2">Any Location in India</label>
        <input
          list="search-location-suggestions"
          value={cityFilter}
          onChange={(e) => {
            setCityFilter(e.target.value);
            if (e.target.value !== 'All') setCityLocation(e.target.value);
          }}
          onBlur={() => cityFilter && cityFilter !== 'All' ? resolveLocationName(cityFilter) : undefined}
          placeholder="All India, Bhabua Bihar, Patna, village, ward..."
          className="w-full p-3 bg-slate-50 dark:bg-slate-700/50 border border-slate-200 dark:border-slate-600 rounded-xl text-xs font-extrabold text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-600"
        />
        <datalist id="search-location-suggestions">
          <option value="All" />
          {LOCATION_SUGGESTIONS.map(place => <option key={place} value={place} />)}
        </datalist>
        <p className="mt-1 text-[10px] text-[var(--color-text-tertiary)]">Type any city, district, village or locality. Example: Bhabua, Kaimur, Bihar.</p>
      </div>

      <div>
        <label className="block text-xs font-bold text-[var(--color-text-secondary)] mb-2">Ward No. or Keyword</label>
        <div className="relative">
          <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400">
            <Building2 className="w-3.5 h-3.5" />
          </span>
          <input
            type="text"
            placeholder="e.g. Ward 12, Mukherjee"
            value={wardFilter}
            onChange={(e) => setWardFilter(e.target.value)}
            className="w-full pl-9 pr-3 py-2.5 bg-slate-50 dark:bg-slate-700/50 border border-slate-200 dark:border-slate-600 rounded-xl text-xs font-semibold focus:outline-none focus:bg-white dark:focus:bg-slate-700 focus:ring-2 focus:ring-indigo-600 text-[var(--color-text-primary)] placeholder:text-slate-400 dark:placeholder:text-slate-500"
          />
        </div>
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs">
          <label className="font-bold text-[var(--color-text-secondary)]">Max Monthly Rent</label>
          <span className="font-black text-indigo-700 dark:text-indigo-400 font-mono bg-indigo-50 dark:bg-indigo-900/50 px-2 py-0.5 rounded-md">
            ₹{maxRent.toLocaleString('en-IN')}
          </span>
        </div>
        <input
          type="range"
          min={2000}
          max={30000}
          step={1000}
          value={maxRent}
          onChange={(e) => setMaxRent(Number(e.target.value))}
          className="w-full accent-indigo-600 cursor-pointer h-2 bg-slate-200 dark:bg-slate-600 rounded-lg"
        />
        <div className="flex justify-between text-[10px] text-[var(--color-text-tertiary)] font-mono">
          <span>₹2,000</span>
          <span>₹15,000</span>
          <span>₹30,000</span>
        </div>
      </div>

      <div>
        <label className="block text-xs font-bold text-[var(--color-text-secondary)] mb-2">Room Categories</label>
        <div className="space-y-1.5">
          {ROOM_TYPE_OPTIONS.map(type => (
            <label key={type} className="flex items-center gap-2.5 p-2 rounded-xl hover:bg-[var(--color-bg-tertiary)] transition cursor-pointer text-xs font-medium text-[var(--color-text-secondary)] select-none">
              <input
                type="checkbox"
                checked={typeFilters.includes(type)}
                onChange={() => toggleRoomType(type)}
                className="w-4 h-4 text-indigo-600 rounded-md border-slate-300 dark:border-slate-600 focus:ring-indigo-500 cursor-pointer"
              />
              <span>{type}</span>
            </label>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-xs font-bold text-[var(--color-text-secondary)] mb-2">Gender Suitability</label>
        <div className="grid grid-cols-2 gap-1.5">
          {['All', ...GENDER_OPTIONS].map(g => (
            <button
              key={g}
              type="button"
              onClick={() => setGenderFilter(g)}
              className={`py-2 px-2.5 rounded-xl text-xs font-bold border text-center transition ${
                genderFilter === g 
                  ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs' 
                  : 'bg-[var(--color-bg-tertiary)] text-[var(--color-text-secondary)] border-[var(--color-border)] hover:bg-slate-100 dark:hover:bg-slate-700'
              }`}
            >
              {g}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-xs font-bold text-[var(--color-text-secondary)] mb-2">Included Amenities</label>
        <div className="flex flex-wrap gap-1.5 max-h-48 overflow-y-auto p-1 bg-[var(--color-bg-tertiary)] rounded-2xl border border-[var(--color-border)]">
          {ALL_AMENITIES_LIST.map(am => {
            const isChecked = selectedAmenities.includes(am.id);
            return (
              <button
                key={am.id}
                type="button"
                onClick={() => toggleAmenity(am.id)}
                className={`px-2.5 py-1.5 rounded-xl text-[11px] font-semibold flex items-center gap-1 transition ${
                  isChecked 
                    ? 'bg-indigo-600 text-white font-bold shadow-2xs' 
                    : 'bg-[var(--color-bg-secondary)] text-[var(--color-text-secondary)] border border-[var(--color-border)] hover:bg-slate-100 dark:hover:bg-slate-700'
                }`}
              >
                <span>{am.icon}</span>
                <span>{am.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fadeIn">
      
      {requestSuccessRoom && (
        <div className="bg-gradient-to-r from-emerald-600 to-teal-600 dark:from-emerald-800 dark:to-teal-900 text-white p-4 rounded-3xl shadow-xl flex items-center justify-between gap-4 mb-8 animate-bounce">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white text-emerald-600 rounded-2xl flex items-center justify-center font-black text-xl shadow">✓</div>
            <div>
              <h4 className="text-base font-extrabold">Rental Application Sent Successfully!</h4>
              <p className="text-xs text-emerald-100">
                The room owner has been notified instantly. Track your approval status in <strong className="underline">Requests</strong> tab.
              </p>
            </div>
          </div>
          <button onClick={() => setRequestSuccessRoom(null)} className="p-2 bg-white/20 hover:bg-white/30 rounded-full transition">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      <div className="bg-[var(--color-bg-secondary)] rounded-3xl p-6 border border-[var(--color-border)] shadow-xs mb-8 flex flex-col md:flex-row items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-black text-indigo-600 dark:text-indigo-400 tracking-widest uppercase">Ward Marketplace</span>
            <span className="bg-indigo-50 dark:bg-indigo-900/40 text-indigo-800 dark:text-indigo-300 text-[10px] font-extrabold px-2.5 py-0.5 rounded-full flex items-center gap-1">
              <Zap className="w-3 h-3 text-amber-500" /> Auto-Synced
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[var(--color-text-primary)] tracking-tight mt-1">
            Search Rooms & PG Listings
          </h1>
          <p className="text-xs text-[var(--color-text-tertiary)] mt-1 flex items-center gap-1.5 flex-wrap">
            <span>Location engine active for: <strong className="text-[var(--color-text-primary)]">{locationName}</strong></span>
            <span>•</span>
            <span>Showing <strong className="text-indigo-600 dark:text-indigo-400">{filteredRooms.length}</strong> available results</span>
          </p>
        </div>

        <div className="flex items-center gap-3 flex-wrap w-full md:w-auto justify-between md:justify-end">
          <button
            onClick={() => setShowMobileFilterModal(true)}
            className="lg:hidden px-4 py-2.5 rounded-2xl bg-indigo-50 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300 font-extrabold text-xs flex items-center gap-2 border border-indigo-200 dark:border-indigo-700 active:scale-95 cursor-pointer"
          >
            <Filter className="w-4 h-4" />
            <span>Filters</span>
            {(typeFilters.length > 0 || selectedAmenities.length > 0 || cityFilter !== 'All') && (
              <span className="w-2 h-2 rounded-full bg-indigo-600"></span>
            )}
          </button>

          <div className="flex items-center gap-1.5 bg-[var(--color-bg-tertiary)] p-1.5 rounded-2xl border border-[var(--color-border)]">
            <ArrowUpDown className="w-4 h-4 text-[var(--color-text-tertiary)] pl-1" />
            <select
              value={sortBy}
              onChange={(e: any) => setSortBy(e.target.value)}
              className="bg-transparent text-xs font-extrabold text-[var(--color-text-primary)] focus:outline-none cursor-pointer pr-2"
            >
              <option value="newest">Sort: Newly Listed</option>
              <option value="price_low">Price: Low to High</option>
              <option value="price_high">Price: High to Low</option>
              <option value="distance">📍 Distance: Nearest First</option>
            </select>
          </div>

          <div className="flex bg-[var(--color-bg-tertiary)] p-1 rounded-2xl border border-[var(--color-border)]">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded-xl text-xs font-bold flex items-center gap-1 transition ${
                viewMode === 'grid' ? 'bg-[var(--color-bg-secondary)] text-indigo-700 dark:text-indigo-300 shadow-xs' : 'text-[var(--color-text-tertiary)] hover:text-[var(--color-text-primary)]'
              }`}
              title="Grid Layout"
            >
              <Grid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded-xl text-xs font-bold flex items-center gap-1 transition ${
                viewMode === 'list' ? 'bg-[var(--color-bg-secondary)] text-indigo-700 dark:text-indigo-300 shadow-xs' : 'text-[var(--color-text-tertiary)] hover:text-[var(--color-text-primary)]'
              }`}
              title="List Layout"
            >
              <List className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('map')}
              className={`p-2 rounded-xl text-xs font-bold flex items-center gap-1 transition ${
                viewMode === 'map' ? 'bg-[var(--color-bg-secondary)] text-indigo-700 dark:text-indigo-300 shadow-xs' : 'text-[var(--color-text-tertiary)] hover:text-[var(--color-text-primary)]'
              }`}
              title="Interactive Map Layout"
            >
              <Map className="w-4 h-4" />
              <span className="hidden sm:inline">Map</span>
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        <div className="hidden lg:block lg:col-span-1 bg-[var(--color-bg-secondary)] rounded-3xl p-6 border border-[var(--color-border)] shadow-xs sticky top-24 h-fit">
          {renderSidebarFilters()}
        </div>

        <div className="lg:col-span-3 space-y-6">
          {loading ? (
            <div className="bg-[var(--color-bg-secondary)] rounded-3xl p-16 text-center border border-[var(--color-border)] space-y-4">
              <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
              <div className="text-sm font-extrabold text-[var(--color-text-primary)]">Fetching Ward Data & Syncing Rooms...</div>
            </div>
          ) : filteredRooms.length === 0 ? (
            <div className="bg-[var(--color-bg-secondary)] rounded-3xl p-12 text-center border border-[var(--color-border)] space-y-4 shadow-xs">
              <div className="w-16 h-16 bg-indigo-50 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-400 rounded-3xl flex items-center justify-center text-3xl mx-auto shadow-inner">🏜️</div>
              <h3 className="text-lg font-bold text-[var(--color-text-primary)]">No Room Listings Matched Your Filter</h3>
              <p className="text-xs text-[var(--color-text-tertiary)] max-w-md mx-auto leading-relaxed">
                Try widening your search area, choosing "All Cities", increasing your max monthly rent, or resetting your amenity requirements.
              </p>
              <button onClick={resetAllFilters} className="px-6 py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-black text-xs shadow-md transition">
                Reset All Filters
              </button>
            </div>
          ) : viewMode === 'map' ? (
            <div className="space-y-6 animate-fadeIn">
              <MapView
                rooms={filteredRooms}
                userCoords={coords}
                selectedRoomId={selectedRoomOnMap?.id}
                onSelectRoom={(r) => setSelectedRoomOnMap(r)}
                height="600px"
              />
              {selectedRoomOnMap && (
                <div className="bg-gradient-to-r from-indigo-900 to-purple-900 dark:from-slate-950 dark:via-indigo-950 dark:to-slate-900 text-white p-6 rounded-3xl shadow-xl flex flex-col sm:flex-row items-center justify-between gap-4 animate-fadeIn">
                  <div className="flex items-center gap-4">
                    <img src={selectedRoomOnMap.photosURLs?.[0]} alt={selectedRoomOnMap.title} className="w-20 h-20 rounded-2xl object-cover shadow-lg border-2 border-white/20" />
                    <div>
                      <span className="bg-amber-400 text-slate-950 px-2.5 py-0.5 rounded font-extrabold text-[10px]">{selectedRoomOnMap.wardNo}</span>
                      <h4 className="text-lg font-black tracking-tight mt-1">{selectedRoomOnMap.title}</h4>
                      <div className="text-xs text-indigo-200 mt-0.5">{selectedRoomOnMap.locationText}, {selectedRoomOnMap.city}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 w-full sm:w-auto">
                    <div className="text-right hidden sm:block">
                      <div className="text-[10px] text-indigo-300 uppercase font-bold">Rent</div>
                      <div className="text-xl font-black text-amber-300">₹{selectedRoomOnMap.rent}/mo</div>
                    </div>
                    <button onClick={() => handleRequestRent(selectedRoomOnMap)} className="w-full sm:w-auto px-5 py-3 rounded-2xl bg-gradient-to-r from-amber-400 to-orange-400 hover:from-amber-500 hover:to-orange-500 text-slate-950 font-black text-xs shadow-lg transition transform hover:scale-105 active:scale-95 cursor-pointer">
                      ⚡ Request to Rent
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : viewMode === 'list' ? (
            <div className="space-y-4 animate-fadeIn">
              {filteredRooms.map(room => (
                <RoomCard key={room.id} room={room} userCoords={coords} onRequestRent={handleRequestRent} viewMode="list" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-fadeIn">
              {filteredRooms.map(room => (
                <RoomCard key={room.id} room={room} userCoords={coords} onRequestRent={handleRequestRent} viewMode="grid" />
              ))}
            </div>
          )}
        </div>
      </div>

      {showMobileFilterModal && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-slate-900/80 dark:bg-slate-950/90 backdrop-blur-sm animate-fadeIn p-0 sm:p-4">
          <div className="bg-[var(--color-bg-secondary)] rounded-t-3xl sm:rounded-3xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto p-6 space-y-4 animate-slideUp">
            <div className="flex items-center justify-between pb-3 border-b border-[var(--color-border)]">
              <h3 className="text-base font-extrabold text-[var(--color-text-primary)] flex items-center gap-2">
                <Filter className="w-5 h-5 text-indigo-600 dark:text-indigo-400" /> Filter Marketplace
              </h3>
              <button onClick={() => setShowMobileFilterModal(false)} className="p-2 rounded-full bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-600 dark:text-slate-300 transition">
                <X className="w-5 h-5" />
              </button>
            </div>
            {renderSidebarFilters()}
            <div className="pt-4 border-t border-[var(--color-border)] flex gap-3 sticky bottom-0 bg-[var(--color-bg-secondary)] py-3">
              <button onClick={resetAllFilters} className="flex-1 py-3 rounded-2xl bg-[var(--color-bg-tertiary)] hover:bg-[var(--color-border)] text-[var(--color-text-secondary)] font-bold text-xs transition">
                Reset All
              </button>
              <button onClick={() => setShowMobileFilterModal(false)} className="flex-1 py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-black text-xs shadow-lg shadow-indigo-500/25 transition">
                Apply ({filteredRooms.length} matches)
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};