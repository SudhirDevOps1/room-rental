import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Room } from '../firebase/mockData';
import { GeoCoords, calculateDistance } from '../hooks/useGeolocation';
import { 
  MapPin, ShieldCheck, IndianRupee, 
  ChevronLeft, ChevronRight, Eye, Send, Lock 
} from 'lucide-react';

interface RoomCardProps {
  room: Room;
  userCoords?: GeoCoords;
  onRequestRent: (room: Room) => void;
  viewMode?: 'grid' | 'list';
}

export const RoomCard: React.FC<RoomCardProps> = ({ room, userCoords, onRequestRent, viewMode = 'grid' }) => {
  const navigate = useNavigate();
  const [currentPhotoIdx, setCurrentPhotoIdx] = useState(0);

  // Calculate Haversine distance
  const distanceKm = userCoords ? calculateDistance(userCoords, room.coordinates) : null;

  const nextImg = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (room.photosURLs?.length) {
      setCurrentPhotoIdx((prev) => (prev + 1) % room.photosURLs.length);
    }
  };

  const prevImg = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (room.photosURLs?.length) {
      setCurrentPhotoIdx((prev) => (prev - 1 + room.photosURLs.length) % room.photosURLs.length);
    }
  };

  const hasMultiplePhotos = room.photosURLs?.length > 1;

  if (viewMode === 'list') {
    return (
      <div 
        onClick={() => navigate(`/room/${room.id}`)}
        className="bg-[var(--color-bg-secondary)] rounded-3xl border border-[var(--color-border)] hover:border-indigo-500/50 shadow-xs hover:shadow-xl transition-all duration-300 overflow-hidden flex flex-col sm:flex-row group cursor-pointer"
      >
        {/* Left Image Box */}
        <div className="sm:w-72 h-56 sm:h-auto relative flex-shrink-0 bg-slate-100 dark:bg-slate-800 overflow-hidden">
          <img
            src={room.photosURLs?.[currentPhotoIdx] || 'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?auto=format&fit=crop&w=600&q=80'}
            alt={room.title}
            className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20"></div>

          {/* Rented Out Overlay */}
          {!room.available && (
            <div className="absolute inset-0 bg-slate-900/80 backdrop-blur-xs flex flex-col items-center justify-center text-white p-4 text-center z-10">
              <div className="w-12 h-12 bg-rose-500 rounded-full flex items-center justify-center mb-2 shadow-lg">
                <Lock className="w-6 h-6" />
              </div>
              <span className="font-extrabold text-base tracking-wider uppercase">Rented Out</span>
              <span className="text-xs text-rose-200 mt-1">Not available for new requests</span>
            </div>
          )}

          {/* Type Badge */}
          <span className="absolute top-3 left-3 px-3 py-1 rounded-full bg-slate-900/80 backdrop-blur-md text-white text-xs font-extrabold shadow-sm flex items-center gap-1">
            {room.type}
          </span>

          {/* Gender Suitability Pill */}
          <span className={`absolute top-3 right-3 px-2.5 py-1 rounded-full text-[11px] font-extrabold shadow-sm ${
            room.genderPref === 'Girls Only' ? 'bg-pink-500 text-white' :
            room.genderPref === 'Boys Only' ? 'bg-blue-600 text-white' :
            room.genderPref === 'Family Only' ? 'bg-purple-600 text-white' :
            'bg-emerald-500 text-white'
          }`}>
            {room.genderPref}
          </span>

          {/* Distance Indicator Badge */}
          {distanceKm !== null && (
            <span className="absolute bottom-3 left-3 px-2.5 py-1 rounded-xl bg-indigo-600 text-white font-extrabold text-xs shadow flex items-center gap-1">
              📍 {distanceKm} km <span className="text-[10px] font-normal opacity-80">from you</span>
            </span>
          )}

          {/* Image Navigation Arrows */}
          {hasMultiplePhotos && (
            <>
              <button
                type="button"
                onClick={prevImg}
                className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/40 hover:bg-black/70 text-white flex items-center justify-center transition opacity-0 group-hover:opacity-100"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={nextImg}
                className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/40 hover:bg-black/70 text-white flex items-center justify-center transition opacity-0 group-hover:opacity-100"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
              <div className="absolute bottom-2 right-3 text-[10px] font-bold text-white bg-black/50 px-2 py-0.5 rounded-full">
                {currentPhotoIdx + 1} / {room.photosURLs.length}
              </div>
            </>
          )}
        </div>

        {/* Right Info Box */}
        <div className="p-6 flex-1 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between gap-2 flex-wrap">
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md bg-amber-100 dark:bg-amber-900/50 text-amber-900 dark:text-amber-300 font-extrabold text-xs">
                Ward No: {room.wardNo}
              </span>

              <span className="inline-flex items-center gap-1 text-xs text-emerald-600 dark:text-emerald-400 font-bold">
                <ShieldCheck className="w-4 h-4" /> Brokerage Free
              </span>
            </div>

            <h3 className="text-lg font-bold text-[var(--color-text-primary)] group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition duration-300 mt-2 line-clamp-1">
              {room.title}
            </h3>

            <p className="text-xs text-[var(--color-text-secondary)] flex items-center gap-1 mt-1 font-medium">
              <MapPin className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
              <span>{room.locationText}, {room.city}</span>
            </p>

            {/* Quick Amenities summary */}
            <div className="flex flex-wrap gap-1.5 mt-3">
              {room.amenities?.slice(0, 5).map(am => (
                <span key={am} className="px-2 py-1 bg-[var(--color-bg-tertiary)] rounded-lg text-[11px] font-medium text-[var(--color-text-secondary)] border border-[var(--color-border)]">
                  {am}
                </span>
              ))}
              {room.amenities?.length > 5 && (
                <span className="px-2 py-1 bg-indigo-50 dark:bg-indigo-900/30 rounded-lg text-[11px] font-bold text-indigo-600 dark:text-indigo-400">
                  +{room.amenities.length - 5} more
                </span>
              )}
            </div>
          </div>

          {/* Footer Action row */}
          <div className="pt-4 mt-4 border-t border-[var(--color-border)] flex items-center justify-between gap-3">
            <div>
              <div className="text-[10px] text-[var(--color-text-tertiary)] uppercase font-bold">Monthly Rent</div>
              <div className="text-2xl font-extrabold text-[var(--color-text-primary)] flex items-baseline gap-0.5">
                <IndianRupee className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                <span>{room.rent.toLocaleString('en-IN')}</span>
                <span className="text-xs font-normal text-[var(--color-text-tertiary)]">/{room.rentType}</span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); navigate(`/room/${room.id}`); }}
                className="px-3.5 py-2 rounded-xl bg-[var(--color-bg-tertiary)] hover:bg-[var(--color-border)] text-[var(--color-text-secondary)] font-bold text-xs flex items-center gap-1.5 transition"
              >
                <Eye className="w-3.5 h-3.5" /> Inspect
              </button>

              {room.available && (
                <button
                  type="button"
                  onClick={(e) => { e.stopPropagation(); onRequestRent(room); }}
                  className="px-4 py-2 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-md shadow-indigo-500/20 transition transform hover:scale-105"
                >
                  <Send className="w-3.5 h-3.5" /> Request Room
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Grid view
  return (
    <div 
      onClick={() => navigate(`/room/${room.id}`)}
      className="bg-[var(--color-bg-secondary)] rounded-3xl border border-[var(--color-border)] hover:border-indigo-500/50 shadow-xs hover:shadow-xl transition-all duration-300 overflow-hidden flex flex-col group cursor-pointer relative"
    >
      {/* Top Image gallery */}
      <div className="w-full h-56 relative bg-slate-100 dark:bg-slate-800 overflow-hidden">
        <img
          src={room.photosURLs?.[currentPhotoIdx] || 'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?auto=format&fit=crop&w=600&q=80'}
          alt={room.title}
          className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20"></div>

        {/* Rented Out Overlay */}
        {!room.available && (
          <div className="absolute inset-0 bg-slate-900/80 backdrop-blur-xs flex flex-col items-center justify-center text-white p-4 text-center z-10">
            <div className="w-12 h-12 bg-rose-500 rounded-full flex items-center justify-center mb-2 shadow-lg">
              <Lock className="w-6 h-6" />
            </div>
            <span className="font-extrabold text-lg tracking-wider uppercase">Rented Out</span>
            <span className="text-xs text-rose-200 mt-1">Currently booked by a tenant</span>
          </div>
        )}

        {/* Top Badges */}
        <div className="absolute top-3 inset-x-3 flex items-center justify-between gap-2 pointer-events-none">
          <span className="px-3 py-1 rounded-full bg-slate-900/80 backdrop-blur-md text-white text-xs font-extrabold shadow-sm">
            {room.type}
          </span>

          <span className={`px-2.5 py-1 rounded-full text-[11px] font-extrabold shadow-sm ${
            room.genderPref === 'Girls Only' ? 'bg-pink-500 text-white' :
            room.genderPref === 'Boys Only' ? 'bg-blue-600 text-white' :
            room.genderPref === 'Family Only' ? 'bg-purple-600 text-white' :
            'bg-emerald-500 text-white'
          }`}>
            {room.genderPref}
          </span>
        </div>

        {/* Distance Indicator Badge */}
        {distanceKm !== null && (
          <span className="absolute bottom-3 left-3 px-2.5 py-1 rounded-xl bg-indigo-600 text-white font-extrabold text-xs shadow flex items-center gap-1">
            📍 {distanceKm} km <span className="text-[10px] font-normal opacity-80">away</span>
          </span>
        )}

        {/* Image Navigation Arrows */}
        {hasMultiplePhotos && (
          <>
            <button
              type="button"
              onClick={prevImg}
              className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/40 hover:bg-black/70 text-white flex items-center justify-center transition opacity-0 group-hover:opacity-100"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={nextImg}
              className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/40 hover:bg-black/70 text-white flex items-center justify-center transition opacity-0 group-hover:opacity-100"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
            <div className="absolute bottom-2 right-3 text-[10px] font-bold text-white bg-black/50 px-2 py-0.5 rounded-full">
              {currentPhotoIdx + 1} / {room.photosURLs.length}
            </div>
          </>
        )}
      </div>

      {/* Body Section */}
      <div className="p-5 flex-1 flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between text-xs mb-1.5">
            <span className="font-extrabold text-amber-900 dark:text-amber-300 bg-amber-100 dark:bg-amber-900/30 px-2.5 py-0.5 rounded-md">
              Ward No: {room.wardNo}
            </span>

            <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5" /> Verified
            </span>
          </div>

          <h3 className="text-base font-bold text-[var(--color-text-primary)] group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition duration-300 line-clamp-1">
            {room.title}
          </h3>

          <p className="text-xs text-[var(--color-text-secondary)] flex items-center gap-1 mt-1">
            <MapPin className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
            <span className="line-clamp-1">{room.locationText}, {room.city}</span>
          </p>

          {/* Quick amenities pills */}
          <div className="flex flex-wrap gap-1 mt-3">
            {room.amenities?.slice(0, 4).map(am => (
              <span key={am} className="px-2 py-1 bg-[var(--color-bg-tertiary)] rounded-lg text-[10px] font-semibold text-[var(--color-text-secondary)] border border-[var(--color-border)]">
                {am}
              </span>
            ))}
            {room.amenities?.length > 4 && (
              <span className="px-2 py-1 bg-indigo-50 dark:bg-indigo-900/30 rounded-lg text-[10px] font-bold text-indigo-600 dark:text-indigo-400">
                +{room.amenities.length - 4}
              </span>
            )}
          </div>
        </div>

        {/* Footer info & Booking button */}
        <div className="pt-4 mt-4 border-t border-[var(--color-border)] flex items-center justify-between gap-2">
          <div>
            <div className="text-[10px] text-[var(--color-text-tertiary)] uppercase font-bold">Monthly Rent</div>
            <div className="text-xl font-extrabold text-[var(--color-text-primary)] flex items-baseline gap-0.5">
              <IndianRupee className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
              <span>{room.rent.toLocaleString('en-IN')}</span>
              <span className="text-[11px] font-normal text-[var(--color-text-tertiary)]">/{room.rentType}</span>
            </div>
          </div>

          {room.available ? (
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); onRequestRent(room); }}
              className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-md shadow-indigo-500/20 transition transform hover:scale-105"
            >
              <Send className="w-3.5 h-3.5" /> Request
            </button>
          ) : (
            <span className="px-3 py-1.5 rounded-xl bg-[var(--color-bg-tertiary)] text-[var(--color-text-tertiary)] font-bold text-xs flex items-center gap-1">
              <Lock className="w-3 h-3" /> Booked
            </span>
          )}
        </div>

      </div>

    </div>
  );
};