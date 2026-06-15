import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createRoom } from '../firebase/db';
import { useAuth } from '../context/AuthContext';
import { useGeolocation, CITY_COORDINATES } from '../hooks/useGeolocation';
import { ROOM_TYPE_OPTIONS, GENDER_OPTIONS, ALL_AMENITIES_LIST, Room } from '../firebase/mockData';
import { PhotoUploader } from '../components/PhotoUploader';
import { 
  Building2, MapPin, IndianRupee, ArrowRight, Navigation 
} from 'lucide-react';

export const RegisterRoom: React.FC<{ onOpenAuth: () => void }> = ({ onOpenAuth }) => {
  const { user, switchRole } = useAuth();
  const navigate = useNavigate();
  const { detectLocation, isDetecting, coords, setCoords } = useGeolocation();

  // Wizard UI step
  const [step, setStep] = useState(1);

  // Form states
  const [title, setTitle] = useState('');
  const [locationText, setLocationText] = useState('');
  const [wardNo, setWardNo] = useState('Ward 1');
  const [city, setCity] = useState('Delhi');
  const [state, setState] = useState('Delhi NCT');
  const [pincode, setPincode] = useState('110009');
  const [landmark, setLandmark] = useState('');
  const [rent, setRent] = useState<number>(5000);
  const [rentType, setRentType] = useState<'month' | 'day'>('month');
  const [securityDeposit, setSecurityDeposit] = useState<number>(5000);
  const [type, setType] = useState<Room['type']>('Single Room');
  const [genderPref, setGenderPref] = useState<Room['genderPref']>('Anyone');
  const [amenities, setAmenities] = useState<string[]>(['WiFi', 'Attached Bath']);
  const [photosURLs, setPhotosURLs] = useState<string[]>([]);
  const [description, setDescription] = useState('');
  const [available, setAvailable] = useState(true);
  
  const [submitting, setSubmitting] = useState(false);
  const [successId, setSuccessId] = useState<string | null>(null);

  // When city changes, update state preset
  const handleCityChange = (cityName: string) => {
    setCity(cityName);
    if (cityName === 'Delhi') setState('Delhi NCT');
    else if (cityName === 'Bengaluru') setState('Karnataka');
    else if (cityName === 'Mumbai' || cityName === 'Pune') setState('Maharashtra');
    else if (cityName === 'Noida') setState('Uttar Pradesh');
    else if (cityName === 'Kota') setState('Rajasthan');

    if (CITY_COORDINATES[cityName]) {
      setCoords(CITY_COORDINATES[cityName]);
    }
  };

  const handleAutoGps = () => {
    detectLocation();
  };

  const toggleAmenity = (amId: string) => {
    setAmenities(prev => 
      prev.includes(amId) ? prev.filter(a => a !== amId) : [...prev, amId]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      onOpenAuth();
      return;
    }

    if (photosURLs.length === 0) {
      alert("Please upload or attach at least 1 photo for your listing.");
      return;
    }

    setSubmitting(true);

    try {
      // Ensure owner role
      if (user.role !== 'room_owner') {
        await switchRole('room_owner');
      }

      const newRoomId = await createRoom({
        ownerId: user.uid,
        ownerName: user.name,
        ownerPhone: user.phone,
        ownerEmail: user.email,
        ownerPhoto: user.photoURL,
        title: title.trim() || `${type} in ${wardNo}`,
        locationText: locationText.trim() || `${wardNo}, ${city}`,
        wardNo: wardNo.trim() || 'Ward 1',
        city,
        state,
        pincode: pincode.trim() || '110001',
        landmark: landmark.trim(),
        coordinates: coords,
        rent: Number(rent) || 3000,
        rentType,
        securityDeposit: Number(securityDeposit) || 3000,
        type,
        genderPref,
        amenities,
        photosURLs,
        available,
        description: description.trim() || `Excellent ${type} situated in a highly favorable environment. Includes ${amenities.slice(0, 4).join(', ')}.`,
        createdAt: new Date().toISOString()
      });

      setSuccessId(newRoomId);
      setTimeout(() => {
        setSubmitting(false);
        navigate('/my-listings');
      }, 1500);

    } catch (err) {
      console.error("Room Register err:", err);
      setSubmitting(false);
      alert("Could not register room. Please review your entries.");
    }
  };

  if (successId) {
    return (
      <div className="max-w-xl mx-auto px-4 py-20 text-center space-y-6 animate-fadeIn">
        <div className="w-20 h-20 bg-emerald-500 text-white rounded-3xl flex items-center justify-center font-black text-4xl mx-auto shadow-2xl animate-bounce">
          ✓
        </div>
        <h2 className="text-3xl font-black text-indigo-950 tracking-tight">Property Listed Successfully!</h2>
        <p className="text-sm text-slate-600 leading-relaxed max-w-md mx-auto">
          Your room has been accurately Geo-indexed by ward and city. It is now live on the global NestFinder search portal.
        </p>
        <div className="p-4 bg-indigo-50 rounded-2xl border border-indigo-100 font-mono text-xs font-bold text-indigo-900">
          Listing ID: {successId}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8 animate-fadeIn">
      
      {/* Wizard Header */}
      <div className="bg-gradient-to-r from-indigo-900 via-indigo-800 to-purple-900 rounded-3xl p-8 text-white shadow-xl relative overflow-hidden">
        <div className="absolute -right-10 -bottom-10 w-48 h-48 bg-purple-500/20 rounded-full blur-3xl pointer-events-none"></div>

        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 relative z-10">
          <div>
            <span className="bg-amber-400 text-slate-950 font-black text-[10px] px-2.5 py-1 rounded uppercase tracking-wider">
              100% Free Owner Listing
            </span>
            <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight mt-2">
              Post Your Room / PG Rental
            </h1>
            <p className="text-xs sm:text-sm text-indigo-100 mt-1">
              Complete our Ward Priority location wizard to instantly match with highly verified potential tenants.
            </p>
          </div>

          {/* Progress Multi-step indicator */}
          <div className="flex items-center gap-2 bg-white/10 p-2 rounded-2xl backdrop-blur-md border border-white/10">
            <button
              type="button"
              onClick={() => setStep(1)}
              className={`px-3 py-1.5 rounded-xl text-xs font-black transition ${
                step === 1 ? 'bg-white text-indigo-900 shadow' : 'text-indigo-200 hover:text-white'
              }`}
            >
              Step 1: Location
            </button>
            <button
              type="button"
              onClick={() => setStep(2)}
              className={`px-3 py-1.5 rounded-xl text-xs font-black transition ${
                step === 2 ? 'bg-white text-indigo-900 shadow' : 'text-indigo-200 hover:text-white'
              }`}
            >
              Step 2: Info & Photos
            </button>
          </div>
        </div>
      </div>

      {/* Main Wizard Form Body */}
      <form onSubmit={handleSubmit} className="bg-white rounded-3xl p-6 sm:p-10 border border-slate-200 shadow-xl space-y-8">
        
        {/* Step 1: Location & Coordinates */}
        {step === 1 && (
          <div className="space-y-6 animate-fadeIn">
            <div className="border-b border-slate-200/80 pb-4 flex items-center justify-between">
              <h3 className="text-lg font-black text-indigo-950 flex items-center gap-2">
                <MapPin className="w-5 h-5 text-indigo-600" /> Exact Property Address & Geo-Indexing
              </h3>
              <span className="text-xs text-slate-400 font-semibold">Step 1 of 2</span>
            </div>

            {/* GPS Auto trigger Banner */}
            <div className="bg-indigo-50/70 rounded-2xl p-4 border border-indigo-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <h4 className="text-xs font-extrabold text-indigo-950 flex items-center gap-1.5">
                  <Navigation className="w-4 h-4 text-indigo-600" />
                  <span>Auto-Compute Proximity GPS Coordinates</span>
                </h4>
                <p className="text-xs text-slate-600 mt-0.5">
                  Enable your browser's GPS so room seekers searching "Near Me" can calculate perfect distance to your gate.
                </p>
              </div>

              <button
                type="button"
                onClick={handleAutoGps}
                disabled={isDetecting}
                className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 active:scale-95 text-white font-extrabold text-xs shadow-md transition flex items-center gap-1.5 flex-shrink-0 cursor-pointer"
              >
                <span>{isDetecting ? 'Detecting...' : '📍 Auto Detect Geolocation'}</span>
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              
              {/* City selector */}
              <div>
                <label className="block text-xs font-black text-slate-700 mb-1.5">City / Urban Hub *</label>
                <select
                  required
                  value={city}
                  onChange={(e) => handleCityChange(e.target.value)}
                  className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-extrabold text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-600 cursor-pointer"
                >
                  {Object.keys(CITY_COORDINATES).map(c => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>

              {/* Ward No */}
              <div>
                <label className="block text-xs font-black text-slate-700 mb-1.5">Ward No. or Municipal Zone *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Ward 12, Sector 6"
                  value={wardNo}
                  onChange={(e) => setWardNo(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:bg-white"
                />
              </div>

              {/* Specific Street Address / Outram lines */}
              <div className="sm:col-span-2">
                <label className="block text-xs font-black text-slate-700 mb-1.5">Detailed Address or Colony Line *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Plot 42, Hudson Lane near Metro Gate 3"
                  value={locationText}
                  onChange={(e) => setLocationText(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:bg-white"
                />
              </div>

              {/* Landmark */}
              <div>
                <label className="block text-xs font-black text-slate-700 mb-1.5">Prominent Landmark</label>
                <input
                  type="text"
                  placeholder="e.g. Opposite DU Law Faculty Gate"
                  value={landmark}
                  onChange={(e) => setLandmark(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:bg-white"
                />
              </div>

              {/* Pincode */}
              <div>
                <label className="block text-xs font-black text-slate-700 mb-1.5">Postal Pincode *</label>
                <input
                  type="text"
                  required
                  maxLength={6}
                  placeholder="e.g. 110009"
                  value={pincode}
                  onChange={(e) => setPincode(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-mono font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:bg-white"
                />
              </div>

            </div>

            {/* Simulated Live GPS coordinate badge */}
            <div className="p-3 bg-slate-100 rounded-2xl text-[11px] font-mono text-slate-600 flex items-center justify-between">
              <span>Current Registered Geocode: <strong className="text-indigo-800">[{coords.lat}, {coords.lng}]</strong></span>
              <span className="text-emerald-600 font-extrabold">Geohash Encoded ✓</span>
            </div>

            {/* Next step button */}
            <div className="flex justify-end pt-4 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setStep(2)}
                className="px-8 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-black text-xs sm:text-sm rounded-2xl shadow-lg shadow-indigo-500/25 transition flex items-center gap-2 cursor-pointer active:scale-95"
              >
                <span>Continue to Room Info & Photos</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* Step 2: Details & Photos */}
        {step === 2 && (
          <div className="space-y-8 animate-fadeIn">
            <div className="border-b border-slate-200/80 pb-4 flex items-center justify-between">
              <h3 className="text-lg font-black text-indigo-950 flex items-center gap-2">
                <Building2 className="w-5 h-5 text-indigo-600" /> Property Spec, Financials & Image Gallery
              </h3>
              <button
                type="button"
                onClick={() => setStep(1)}
                className="text-xs font-bold text-indigo-600 hover:underline"
              >
                ← Back to Step 1 (Location)
              </button>
            </div>

            {/* Core Listing Title */}
            <div>
              <label className="block text-xs font-black text-slate-700 mb-1.5">Striking Catchy Title for Listing *</label>
              <input
                type="text"
                required
                placeholder="e.g. Spacious Air Conditioned Private Single Room for Students"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-extrabold text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:bg-white"
              />
            </div>

            {/* Type & Financials row */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              
              <div>
                <label className="block text-xs font-black text-slate-700 mb-1.5">Room Category *</label>
                <select
                  value={type}
                  onChange={(e: any) => setType(e.target.value)}
                  className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-extrabold text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-600 cursor-pointer"
                >
                  {ROOM_TYPE_OPTIONS.map(t => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-black text-slate-700 mb-1.5">Rent Amount *</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400">
                    <IndianRupee className="w-4 h-4" />
                  </span>
                  <input
                    type="number"
                    required
                    min={500}
                    max={100000}
                    value={rent}
                    onChange={(e) => setRent(Number(e.target.value))}
                    className="w-full pl-9 pr-14 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-black text-indigo-950 focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:bg-white font-mono"
                  />
                  <select
                    value={rentType}
                    onChange={(e: any) => setRentType(e.target.value)}
                    className="absolute inset-y-0 right-0 px-2 bg-transparent text-xs font-bold text-slate-600 focus:outline-none cursor-pointer border-l border-slate-200"
                  >
                    <option value="month">/mo</option>
                    <option value="day">/day</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-black text-slate-700 mb-1.5">Security Token (Deposit) *</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400">
                    <IndianRupee className="w-4 h-4" />
                  </span>
                  <input
                    type="number"
                    required
                    value={securityDeposit}
                    onChange={(e) => setSecurityDeposit(Number(e.target.value))}
                    className="w-full pl-9 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:bg-white font-mono"
                  />
                </div>
              </div>

            </div>

            {/* Gender Preferences */}
            <div>
              <label className="block text-xs font-black text-slate-700 mb-1.5">Gender Suitability & Restrictions *</label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {GENDER_OPTIONS.map(g => (
                  <button
                    type="button"
                    key={g}
                    onClick={() => setGenderPref(g)}
                    className={`py-3 px-3 rounded-2xl font-black text-xs border text-center transition cursor-pointer ${
                      genderPref === g
                        ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white border-indigo-600 shadow-md'
                        : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    {g}
                  </button>
                ))}
              </div>
            </div>

            {/* Included Amenities Checklist */}
            <div>
              <label className="block text-xs font-black text-slate-700 mb-1.5">Key Living Amenities (Select all available)</label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 p-3 bg-slate-50 rounded-3xl border border-slate-200/80">
                {ALL_AMENITIES_LIST.map(am => {
                  const isChecked = amenities.includes(am.id);
                  return (
                    <button
                      type="button"
                      key={am.id}
                      onClick={() => toggleAmenity(am.id)}
                      className={`p-2.5 rounded-2xl text-xs font-bold text-left flex items-center gap-2 border transition cursor-pointer ${
                        isChecked 
                          ? 'bg-indigo-600 text-white border-indigo-600 shadow-2xs' 
                          : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      <span>{am.icon}</span>
                      <span className="line-clamp-1">{am.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Photo Uploader Component */}
            <div>
              <label className="block text-xs font-black text-slate-700 mb-1.5">Room Images (Attach directly or use gallery presets) *</label>
              <PhotoUploader
                photos={photosURLs}
                onChange={(newPhotos) => setPhotosURLs(newPhotos)}
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-xs font-black text-slate-700 mb-1.5">Property Description & Move-in Guidelines</label>
              <textarea
                rows={4}
                placeholder="Mention internet speeds, water availability timings, cooking restrictions, distance to nearby bus/metro, and peaceful study atmosphere..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl text-xs sm:text-sm font-medium focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:bg-white leading-relaxed"
              ></textarea>
            </div>

            {/* Immediate Live toggle */}
            <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-200/80 flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-emerald-500 animate-ping"></span>
                <span className="font-extrabold text-emerald-950">Publish Immediately as Available</span>
              </div>
              <input
                type="checkbox"
                checked={available}
                onChange={(e) => setAvailable(e.target.checked)}
                className="w-4 h-4 text-emerald-600 rounded-md focus:ring-emerald-500 cursor-pointer"
              />
            </div>

            {/* Submit Action buttons */}
            <div className="pt-4 border-t border-slate-100 flex items-center justify-between gap-4">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="px-6 py-4 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition"
              >
                ← Prev (Location)
              </button>

              <button
                type="submit"
                disabled={submitting}
                className="flex-1 py-4 px-8 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-slate-950 font-black text-sm rounded-2xl shadow-xl shadow-emerald-500/25 transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {submitting ? (
                  <>
                    <span className="animate-spin h-4 w-4 border-2 border-slate-950 border-t-transparent rounded-full"></span>
                    <span>Saving to Database & Publishing...</span>
                  </>
                ) : (
                  <>
                    <span>🚀 Confirm Registration & List Property</span>
                  </>
                )}
              </button>
            </div>

          </div>
        )}

      </form>

    </div>
  );
};