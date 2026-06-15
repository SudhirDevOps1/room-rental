import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Room, RentalRequest } from '../firebase/mockData';
import { subscribeRooms, submitRentalRequest, subscribeRequests } from '../firebase/db';
import { useAuth } from '../context/AuthContext';
import { useGeolocation, calculateDistance } from '../hooks/useGeolocation';
import { MapView } from '../components/MapView';
import { 
  MapPin, ShieldCheck, IndianRupee, Sparkles, Building2, 
  Send, ChevronLeft, ChevronRight, Share2, 
  Lock, Clock 
} from 'lucide-react';

export const RoomDetail: React.FC<{ onOpenAuth: () => void }> = ({ onOpenAuth }) => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { coords } = useGeolocation();
  
  const [room, setRoom] = useState<Room | null>(null);
  const [allRooms, setAllRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeImgIdx, setActiveImgIdx] = useState(0);

  // Rental Application modal states
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [applicationNote, setApplicationNote] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [existingRequest, setExistingRequest] = useState<RentalRequest | null>(null);

  // Subscribe all rooms to find current
  useEffect(() => {
    const unsub = subscribeRooms((list) => {
      setAllRooms(list);
      const matched = list.find(r => r.id === id);
      if (matched) {
        setRoom(matched);
        setApplicationNote(`Hello ${matched.ownerName}! I am completely ready to rent your ${matched.title} starting from the upcoming month. I am willing to provide my identity verification and security deposit token.`);
      }
      setLoading(false);
    });
    return () => unsub();
  }, [id]);

  // Check if I have already applied
  useEffect(() => {
    if (!user || !room) return;
    const unsubReq = subscribeRequests(user.uid, 'room_seeker', (myReqs) => {
      const match = myReqs.find(r => r.roomId === room.id);
      setExistingRequest(match || null);
    });
    return () => unsubReq();
  }, [user, room]);

  if (loading) {
    return (
      <div className="bg-[var(--color-bg-secondary)] rounded-3xl p-20 text-center max-w-4xl mx-auto my-12 border border-[var(--color-border)] shadow-xl space-y-4">
        <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
        <div className="text-base font-extrabold text-[var(--color-text-primary)]">Loading Room Details & Interactive Pin...</div>
      </div>
    );
  }

  if (!room) {
    return (
      <div className="bg-[var(--color-bg-secondary)] rounded-3xl p-16 text-center max-w-3xl mx-auto my-12 border border-[var(--color-border)] shadow-xl space-y-4">
        <div className="w-16 h-16 bg-rose-50 dark:bg-rose-900/30 text-rose-600 dark:text-rose-400 rounded-3xl flex items-center justify-center font-black text-3xl mx-auto shadow-inner">
          ❌
        </div>
        <h2 className="text-2xl font-black text-[var(--color-text-primary)] tracking-tight">Room Not Found or Deleted</h2>
        <p className="text-xs text-slate-500 max-w-md mx-auto leading-relaxed">
          The requested rental listing is no longer active or has been fully removed by the room owner.
        </p>
        <button
          onClick={() => navigate('/search')}
          className="px-6 py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-black text-xs shadow-md transition cursor-pointer"
        >
          Explore Available Listings
        </button>
      </div>
    );
  }

  const distanceKm = coords ? calculateDistance(coords, room.coordinates) : null;
  const similarRooms = allRooms.filter(r => r.id !== room.id && r.available && r.city === room.city).slice(0, 3);

  const handleSubmitApplication = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      onOpenAuth();
      return;
    }

    setSubmitting(true);

    try {
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
        message: applicationNote
      });

      if (res) {
        setSuccess(true);
        setTimeout(() => {
          setSuccess(false);
          setSubmitting(false);
          setShowRequestModal(false);
        }, 1500);
      } else {
        alert("You have already submitted an application for this property.");
        setSubmitting(false);
      }
    } catch (err) {
      console.warn("Application submit err:", err);
      setSubmitting(false);
    }
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: room.title,
        text: `Check out this premium ${room.type} in ${room.wardNo}, ${room.city} on NestFinder!`,
        url: window.location.href
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert("✓ Direct link copied to your clipboard!");
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10 animate-fadeIn">
      
      {/* Back & Share bar */}
      <div className="flex items-center justify-between gap-4">
        <button
          onClick={() => navigate('/search')}
          className="px-4 py-2 rounded-2xl bg-[var(--color-bg-secondary)] hover:bg-[var(--color-bg-tertiary)] text-[var(--color-text-secondary)] font-extrabold text-xs flex items-center gap-2 border border-[var(--color-border)] shadow-2xs transition active:scale-95 cursor-pointer"
        >
          ← Back to Search Hub
        </button>

        <div className="flex items-center gap-2">
          <button
            onClick={handleShare}
            className="p-2.5 rounded-2xl bg-[var(--color-bg-secondary)] hover:bg-[var(--color-bg-tertiary)] text-[var(--color-text-secondary)] font-bold text-xs flex items-center gap-1.5 border border-[var(--color-border)] shadow-2xs transition active:scale-95 cursor-pointer"
            title="Share Room link"
          >
            <Share2 className="w-4 h-4 text-indigo-600" />
            <span className="hidden sm:inline">Share Listing</span>
          </button>
        </div>
      </div>

      {/* Main Grid: Details Header + Booking Action Sticky Box */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        
        {/* Left Column (2 Cols): Photos + Summary + Amenities + Map */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* Main Photo Gallery Box */}
          <div className="bg-[var(--color-bg-secondary)] rounded-3xl border border-[var(--color-border)] shadow-lg overflow-hidden space-y-3 p-3">
            {/* Active Highlight Image */}
            <div className="w-full h-72 sm:h-96 rounded-2xl overflow-hidden bg-slate-900 relative group">
              <img
                src={room.photosURLs?.[activeImgIdx] || 'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?auto=format&fit=crop&w=1000&q=80'}
                alt={room.title}
                className="w-full h-full object-cover group-hover:scale-[1.02] transition duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-transparent to-slate-950/20 pointer-events-none"></div>

              {/* Rented Out Alert Overlay */}
              {!room.available && (
                <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-xs flex flex-col items-center justify-center text-white p-6 text-center z-10">
                  <div className="w-16 h-16 bg-rose-500 rounded-full flex items-center justify-center mb-3 shadow-2xl animate-pulse">
                    <Lock className="w-8 h-8" />
                  </div>
                  <span className="font-black text-2xl tracking-widest uppercase">Property Rented Out</span>
                  <span className="text-xs text-rose-200 mt-1">This space is fully occupied by a confirmed tenant</span>
                </div>
              )}

              {/* Top Priority Pill Badges */}
              <div className="absolute top-4 left-4 right-4 flex items-center justify-between gap-2 z-10 pointer-events-none">
                <span className="px-3.5 py-1.5 rounded-full bg-amber-500 text-slate-950 font-black text-xs shadow-md uppercase tracking-wider">
                  {room.wardNo} • {room.pincode}
                </span>

                <span className={`px-3 py-1 rounded-full text-xs font-black shadow-md ${
                  room.genderPref === 'Girls Only' ? 'bg-pink-500 text-white' :
                  room.genderPref === 'Boys Only' ? 'bg-blue-600 text-white' :
                  room.genderPref === 'Family Only' ? 'bg-purple-600 text-white' :
                  'bg-emerald-500 text-white'
                }`}>
                  {room.genderPref} Suitability
                </span>
              </div>

              {/* Image Navigation Arrows */}
              {room.photosURLs?.length > 1 && (
                <>
                  <button
                    onClick={() => setActiveImgIdx(prev => (prev - 1 + room.photosURLs.length) % room.photosURLs.length)}
                    className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-2xl bg-black/50 hover:bg-black/80 text-white flex items-center justify-center transition shadow-lg backdrop-blur-xs"
                  >
                    <ChevronLeft className="w-6 h-6" />
                  </button>
                  <button
                    onClick={() => setActiveImgIdx(prev => (prev + 1) % room.photosURLs.length)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-2xl bg-black/50 hover:bg-black/80 text-white flex items-center justify-center transition shadow-lg backdrop-blur-xs"
                  >
                    <ChevronRight className="w-6 h-6" />
                  </button>
                  <span className="absolute bottom-4 right-4 bg-black/60 backdrop-blur-md px-3 py-1 rounded-full text-white text-xs font-bold font-mono shadow">
                    {activeImgIdx + 1} / {room.photosURLs.length}
                  </span>
                </>
              )}
            </div>

            {/* Thumbnails row */}
            {room.photosURLs?.length > 1 && (
              <div className="grid grid-cols-4 sm:grid-cols-6 gap-2 pt-1">
                {room.photosURLs.map((url, i) => (
                  <button
                    key={url + i}
                    onClick={() => setActiveImgIdx(i)}
                    className={`h-16 rounded-xl overflow-hidden border-2 transition relative ${
                      activeImgIdx === i ? 'border-indigo-600 ring-2 ring-indigo-600/30' : 'border-slate-200 hover:opacity-80'
                    }`}
                  >
                    <img src={url} alt={`Thumb ${i}`} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Core Title & Information Card */}
          <div className="bg-[var(--color-bg-secondary)] rounded-3xl p-8 border border-[var(--color-border)] shadow-xs space-y-4">
            <div className="flex items-center justify-between gap-3 flex-wrap">
              <span className="bg-indigo-50 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300 font-extrabold text-xs px-3 py-1 rounded-xl">
                {room.type}
              </span>

              <span className="text-xs text-emerald-600 dark:text-emerald-400 font-extrabold flex items-center gap-1 bg-emerald-50 dark:bg-emerald-900/30 px-3 py-1 rounded-xl border border-emerald-200/80 dark:border-emerald-800">
                <ShieldCheck className="w-4 h-4 text-emerald-500 dark:text-emerald-400" />
                <span>Brokerage Free Verified</span>
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-black text-[var(--color-text-primary)] tracking-tight leading-tight">
              {room.title}
            </h1>

            <p className="text-sm text-[var(--color-text-secondary)] flex items-center gap-2 font-medium">
              <MapPin className="w-4 h-4 text-indigo-600 dark:text-indigo-400 flex-shrink-0" />
              <span>{room.locationText}, {room.landmark ? `Opposite ${room.landmark}, ` : ''}{room.city}, {room.state} - {room.pincode}</span>
            </p>

            {distanceKm !== null && (
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-xl bg-gradient-to-r from-indigo-50 to-purple-50 text-indigo-900 font-extrabold text-xs border border-indigo-100">
                <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                <span>Exactly <strong>{distanceKm} km</strong> from your detected GPS coordinate</span>
              </div>
            )}
          </div>

          {/* Complete Description & Living Rules */}
          <div className="bg-[var(--color-bg-secondary)] rounded-3xl p-8 border border-[var(--color-border)] shadow-xs space-y-4">
            <h3 className="text-lg font-black text-[var(--color-text-primary)] tracking-tight flex items-center gap-2">
              <Building2 className="w-5 h-5 text-indigo-600 dark:text-indigo-400" /> Property Overview & Living Environment
            </h3>
            <p className="text-sm text-[var(--color-text-secondary)] leading-relaxed font-medium whitespace-pre-line">
              {room.description || "A wonderful independent residential property equipped with super quiet study/living facilities, dedicated lighting, secure multi-point entry, and robust nearby public connectivity."}
            </p>
          </div>

          {/* Living Amenities Array */}
          <div className="bg-[var(--color-bg-secondary)] rounded-3xl p-8 border border-[var(--color-border)] shadow-xs space-y-4">
            <h3 className="text-lg font-black text-[var(--color-text-primary)] tracking-tight">
              Included Amenities & Furnishings
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {room.amenities.map(am => (
                <div key={am} className="p-3 rounded-2xl bg-[var(--color-bg-tertiary)] border border-[var(--color-border)] flex items-center gap-3 text-xs font-extrabold text-[var(--color-text-primary)]">
                  <div className="w-8 h-8 rounded-xl bg-[var(--color-bg-secondary)] text-indigo-600 dark:text-indigo-400 shadow-2xs flex items-center justify-center text-base">
                    ✓
                  </div>
                  <span>{am}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Interactive Live Pin Map section */}
          <div className="bg-[var(--color-bg-secondary)] rounded-3xl p-8 border border-[var(--color-border)] shadow-xs space-y-4">
            <h3 className="text-lg font-black text-[var(--color-text-primary)] tracking-tight flex items-center justify-between">
              <span>📍 Location Pin & Proximity Map</span>
              <span className="text-xs font-bold text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/30 px-3 py-1 rounded-xl border border-amber-200/80 dark:border-amber-800">
                {room.wardNo}
              </span>
            </h3>
            <MapView
              rooms={[room]}
              userCoords={coords}
              selectedRoomId={room.id}
              height="400px"
            />
          </div>

        </div>

        {/* Right Column: Sticky Request Card + Owner Verification Verification Desk */}
        <div className="lg:col-span-1 space-y-6 sticky top-24">
          
          {/* Main Price & Request Card */}
          <div className="bg-gradient-to-br from-indigo-900 via-indigo-800 to-purple-900 text-white rounded-3xl p-8 shadow-2xl border border-indigo-700/60 space-y-6 relative overflow-hidden">
            <div className="absolute -right-10 -bottom-10 w-32 h-32 bg-purple-500/20 rounded-full blur-2xl pointer-events-none"></div>

            <div className="border-b border-white/10 pb-6">
              <span className="text-[10px] font-extrabold text-indigo-300 uppercase tracking-widest">Monthly Rental Expense</span>
              <div className="text-4xl font-extrabold flex items-baseline gap-1 mt-1 text-amber-300 font-mono">
                <IndianRupee className="w-8 h-8 text-amber-300" />
                <span>{room.rent.toLocaleString('en-IN')}</span>
                <span className="text-xs font-medium text-indigo-100 font-sans">/{room.rentType}</span>
              </div>
              <div className="text-xs text-indigo-200 mt-2 flex items-center justify-between">
                <span>Security Deposit:</span>
                <strong className="text-white font-mono">₹{room.securityDeposit.toLocaleString('en-IN')}</strong>
              </div>
            </div>

            {/* Application status tracker / action button */}
            <div className="space-y-3">
              {existingRequest ? (
                <div className="bg-white/15 backdrop-blur-md p-4 rounded-2xl border border-white/20 text-center space-y-2">
                  <div className="inline-flex items-center gap-1.5 text-amber-300 text-xs font-bold">
                    <Clock className="w-4 h-4 animate-spin" /> Application Status: <strong>{existingRequest.status.toUpperCase()}</strong>
                  </div>
                  <p className="text-[11px] text-indigo-100 leading-relaxed">
                    {existingRequest.status === 'accepted' ? (
                      <>
                        ✓ The owner accepted! You can now <strong className="underline font-bold text-white">Call / Chat</strong> with them instantly.
                      </>
                    ) : existingRequest.status === 'rejected' ? (
                      <>
                        ⚠️ Unfortunately the owner declined this application. Please try other active rooms.
                      </>
                    ) : (
                      <>
                        Your application is under review by {room.ownerName}. You will be notified instantly when approved.
                      </>
                    )}
                  </p>
                  <button
                    onClick={() => navigate('/my-requests')}
                    className="w-full mt-2 py-2 px-3 rounded-xl bg-white text-indigo-950 font-black text-xs hover:bg-slate-100 transition shadow"
                  >
                    Go to My Requests Desk
                  </button>
                </div>
              ) : room.available ? (
                <button
                  onClick={() => setShowRequestModal(true)}
                  className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-amber-400 to-orange-400 hover:from-amber-500 hover:to-orange-500 text-slate-950 font-black text-sm shadow-xl transition transform hover:scale-105 active:scale-95 flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Send className="w-4 h-4" />
                  <span>⚡ Submit Request to Rent</span>
                </button>
              ) : (
                <div className="bg-rose-500/20 backdrop-blur-md border border-rose-500/30 p-4 rounded-2xl text-center text-xs font-bold text-rose-200 flex items-center justify-center gap-2">
                  <Lock className="w-4 h-4 text-rose-400" />
                  <span>Property Booked & Rented Out</span>
                </div>
              )}

              <p className="text-[11px] text-indigo-200 text-center leading-relaxed pt-2 flex items-center justify-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" /> Verified Secure Booking Platform
              </p>
            </div>
          </div>

          {/* Verified Owner Persona Profile Card */}
          <div className="bg-[var(--color-bg-secondary)] rounded-3xl p-6 border border-[var(--color-border)] shadow-xs space-y-4">
            <span className="text-[10px] font-black text-indigo-600 dark:text-indigo-400 tracking-widest uppercase">Verified Room Owner</span>
            
            <div className="flex items-center gap-4">
              <img
                src={room.ownerPhoto || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=250&q=80'}
                alt={room.ownerName}
                className="w-16 h-16 rounded-2xl object-cover ring-2 ring-indigo-600/30 shadow-md"
              />
              <div>
                <h4 className="text-base font-extrabold text-[var(--color-text-primary)]">{room.ownerName}</h4>
                <div className="text-xs text-[var(--color-text-tertiary)] flex items-center gap-1 mt-0.5 font-semibold">
                  <MapPin className="w-3 h-3 text-emerald-600" /> {room.city} • Ward Host
                </div>
                {existingRequest?.status === 'accepted' && (
                  <div className="text-xs font-mono font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded mt-1 inline-block">
                    📞 {room.ownerPhone}
                  </div>
                )}
              </div>
            </div>

            <div className="border-t border-[var(--color-border)] pt-3 text-xs text-[var(--color-text-secondary)] leading-relaxed font-medium">
              Ramesh/Owner accepts online applications only. Upon confirmation, their full verified contact info and direct real-time chat gets completely unlocked for free.
            </div>
          </div>

          {/* Quick Hub Similar exploration */}
          {similarRooms.length > 0 && (
            <div className="bg-indigo-50/60 dark:bg-indigo-900/20 rounded-3xl p-6 border border-indigo-100 dark:border-indigo-800 space-y-3">
              <h4 className="text-xs font-black text-[var(--color-text-primary)] uppercase tracking-widest">Other Options in {room.city}</h4>
              <div className="space-y-2">
                {similarRooms.map(sim => (
                  <div
                    key={sim.id}
                    onClick={() => navigate(`/room/${sim.id}`)}
                    className="p-3 bg-[var(--color-bg-secondary)] rounded-2xl border border-indigo-200/60 dark:border-indigo-800 hover:border-indigo-500 cursor-pointer shadow-2xs hover:shadow transition flex items-center justify-between group"
                  >
                    <div>
                      <div className="text-xs font-bold text-[var(--color-text-primary)] group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition line-clamp-1">{sim.title}</div>
                      <div className="text-[10px] text-[var(--color-text-tertiary)]">{sim.wardNo} • ₹{sim.rent}/mo</div>
                    </div>
                    <span className="text-xs font-extrabold text-indigo-600 group-hover:translate-x-0.5 transition">→</span>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>

      </div>

      {/* Renter Request Custom Application Note Modal */}
      {showRequestModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 dark:bg-slate-950/90 backdrop-blur-sm animate-fadeIn">
          <div className="bg-[var(--color-bg-secondary)] rounded-3xl shadow-2xl max-w-lg w-full p-8 border border-[var(--color-border)] space-y-6 relative overflow-hidden animate-slideUp">
            
            {success ? (
              <div className="py-12 text-center space-y-4 animate-bounce">
                <div className="w-16 h-16 bg-emerald-500 text-white rounded-full flex items-center justify-center font-black text-3xl mx-auto shadow-xl">
                  ✓
                </div>
                <h3 className="text-xl font-black text-indigo-950 tracking-tight">Application Sent Flawlessly!</h3>
                <p className="text-xs text-slate-600 max-w-sm mx-auto">
                  {room.ownerName} will review your application message. Go to your My Requests Tracker to see when approved.
                </p>
              </div>
            ) : (
              <>
                <div className="flex items-center justify-between pb-4 border-b border-[var(--color-border)]">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-amber-50 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 flex items-center justify-center font-black">
                      ⚡
                    </div>
                    <div>
                      <h3 className="text-lg font-black text-[var(--color-text-primary)]">Confirm Rental Application</h3>
                      <p className="text-xs text-[var(--color-text-secondary)]">To {room.ownerName} for {room.title}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setShowRequestModal(false)}
                    className="p-2 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 transition"
                  >
                    ❌
                  </button>
                </div>

                <form onSubmit={handleSubmitApplication} className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-[var(--color-text-secondary)] mb-1">Your Application Note to Owner</label>
                    <textarea
                      required
                      rows={5}
                      value={applicationNote}
                      onChange={(e) => setApplicationNote(e.target.value)}
                      className="w-full p-4 bg-[var(--color-bg-tertiary)] border border-[var(--color-border)] rounded-2xl text-xs sm:text-sm font-medium focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:bg-[var(--color-bg-secondary)] leading-relaxed text-[var(--color-text-primary)] placeholder:text-[var(--color-text-tertiary)]"
                    ></textarea>
                    <span className="text-[10px] text-[var(--color-text-tertiary)] mt-1 block">
                      Tip: Express your professional/student status and move-in readiness to increase your acceptance chances.
                    </span>
                  </div>

                  <div className="bg-indigo-50 dark:bg-indigo-900/30 p-4 rounded-2xl border border-indigo-100 dark:border-indigo-800 flex items-center justify-between text-xs">
                    <div>
                      <span className="text-indigo-950 dark:text-indigo-200 font-bold block">Monthly Token Commitment</span>
                      <span className="text-indigo-600 dark:text-indigo-400 font-mono font-bold text-sm">₹{room.rent.toLocaleString('en-IN')}</span>
                    </div>
                    <span className="bg-indigo-600 text-white font-extrabold px-2.5 py-1 rounded-lg text-[10px]">
                      Brokerage Free ✓
                    </span>
                  </div>

                  <div className="pt-2 flex gap-3">
                    <button
                      type="button"
                      onClick={() => setShowRequestModal(false)}
                      className="flex-1 py-3.5 bg-[var(--color-bg-tertiary)] hover:bg-[var(--color-border)] text-[var(--color-text-secondary)] font-bold text-xs rounded-xl transition cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={submitting}
                      className="flex-1 py-3.5 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-black text-xs rounded-xl shadow-lg shadow-indigo-500/25 transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                    >
                      {submitting ? 'Transmitting Request...' : 'Submit Application Now 🚀'}
                    </button>
                  </div>
                </form>
              </>
            )}

          </div>
        </div>
      )}

    </div>
  );
};