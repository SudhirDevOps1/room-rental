import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { subscribeRooms, subscribeRequests, updateRoomStatus, deleteRoomDoc, acceptRentalRequest, rejectRentalRequest } from '../firebase/db';
import { Room, RentalRequest } from '../firebase/mockData';
import { useAuth } from '../context/AuthContext';
import { 
  Building2, PlusCircle, MapPin, Trash2, 
  MessageSquare, Lock, Check, X, Users 
} from 'lucide-react';

export const MyListings: React.FC<{ onOpenAuth: () => void }> = ({ onOpenAuth }) => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [myRooms, setMyRooms] = useState<Room[]>([]);
  const [incomingRequests, setIncomingRequests] = useState<RentalRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'listings' | 'requests'>('listings');

  useEffect(() => {
    if (!user) return;
    const unsubRooms = subscribeRooms((allRooms) => {
      const ownerRooms = allRooms.filter(r => r.ownerId === user.uid);
      setMyRooms(ownerRooms);
      setLoading(false);
    });
    const unsubReqs = subscribeRequests(user.uid, 'room_owner', (reqs) => {
      setIncomingRequests(reqs);
    });
    return () => { unsubRooms(); unsubReqs(); };
  }, [user]);

  if (!user) {
    return (
      <div className="bg-[var(--color-bg-secondary)] rounded-3xl p-16 text-center max-w-2xl mx-auto my-12 border border-[var(--color-border)] shadow-xl space-y-4">
        <div className="w-16 h-16 bg-indigo-50 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-400 rounded-3xl flex items-center justify-center font-black text-3xl mx-auto shadow-inner">🔒</div>
        <h2 className="text-2xl font-black text-[var(--color-text-primary)] tracking-tight">Owner Authentication Required</h2>
        <p className="text-xs text-[var(--color-text-secondary)] max-w-md mx-auto leading-relaxed">
          Please log in or select the <strong>Ramesh Sharma</strong> demo account to manage your room listings.
        </p>
        <button onClick={onOpenAuth} className="px-6 py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-black text-xs shadow-md transition cursor-pointer">
          Sign In to Access Management Desk
        </button>
      </div>
    );
  }

  const handleToggleAvailable = async (roomId: string, currentStatus: boolean) => {
    await updateRoomStatus(roomId, !currentStatus);
  };

  const handleDeleteListing = async (roomId: string) => {
    if (confirm("Are you 100% sure you want to permanently delete this room listing?")) {
      await deleteRoomDoc(roomId);
    }
  };

  const handleAcceptRequest = async (req: RentalRequest) => {
    await acceptRentalRequest(req);
    alert("✓ Rental application accepted! Your phone number has been unlocked for the tenant.");
    if (confirm("Would you like to automatically mark this room as 'Rented Out'?")) {
      await updateRoomStatus(req.roomId, false);
    }
    navigate(`/inbox?chat=${req.chatId || `chat-${req.ownerId}-${req.seekerId}`}`);
  };

  const handleRejectRequest = async (requestId: string) => {
    if (confirm("Are you sure you want to reject this applicant?")) {
      await rejectRentalRequest(requestId);
    }
  };

  const pendingRequestsCount = incomingRequests.filter(r => r.status === 'pending').length;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8 animate-fadeIn">
      
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-900 via-indigo-800 to-purple-900 dark:from-slate-950 dark:via-indigo-950 dark:to-slate-900 rounded-3xl p-8 text-white shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative overflow-hidden">
        <div className="absolute -left-10 -top-10 w-48 h-48 bg-purple-500/20 rounded-full blur-3xl pointer-events-none"></div>
        <div className="flex items-center gap-4 relative z-10">
          <img src={user.photoURL} alt={user.name} className="w-16 h-16 rounded-2xl object-cover ring-2 ring-amber-400 shadow-lg" />
          <div>
            <span className="bg-amber-400 text-slate-950 font-black text-[10px] px-2.5 py-0.5 rounded uppercase tracking-wider">{user.city} Ward Owner</span>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight mt-1">Welcome, {user.name}</h1>
            <p className="text-xs text-indigo-100 mt-0.5">Manage your live property portfolio, incoming tenancy requests, and direct conversations.</p>
          </div>
        </div>
        <button onClick={() => navigate('/register-room')} className="px-6 py-4 rounded-2xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs sm:text-sm shadow-xl transition transform hover:scale-105 active:scale-95 flex items-center gap-2 cursor-pointer flex-shrink-0">
          <PlusCircle className="w-5 h-5" />
          <span>➕ Post Brand New Listing</span>
        </button>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-[var(--color-border)] gap-4">
        <button onClick={() => setActiveTab('listings')} className={`py-3 px-4 font-extrabold text-sm border-b-4 transition flex items-center gap-2 ${activeTab === 'listings' ? 'border-indigo-600 text-[var(--color-text-primary)] font-black' : 'border-transparent text-[var(--color-text-tertiary)] hover:text-[var(--color-text-secondary)]'}`}>
          <Building2 className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
          <span>My Posted Listings ({myRooms.length})</span>
        </button>
        <button onClick={() => setActiveTab('requests')} className={`py-3 px-4 font-extrabold text-sm border-b-4 transition flex items-center gap-2 ${activeTab === 'requests' ? 'border-indigo-600 text-[var(--color-text-primary)] font-black' : 'border-transparent text-[var(--color-text-tertiary)] hover:text-[var(--color-text-secondary)]'}`}>
          <Users className="w-4 h-4 text-amber-500" />
          <span>Tenant Applications</span>
          {pendingRequestsCount > 0 && (
            <span className="bg-amber-500 text-slate-900 font-black px-2 py-0.5 rounded-full text-[10px] shadow animate-pulse">{pendingRequestsCount} new</span>
          )}
        </button>
      </div>

      {/* Tab 1: Listings */}
      {activeTab === 'listings' && (
        <div className="space-y-6 animate-fadeIn">
          {loading ? (
            <div className="py-20 text-center space-y-4">
              <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
              <div className="text-sm font-bold text-[var(--color-text-secondary)]">Syncing your property inventory...</div>
            </div>
          ) : myRooms.length === 0 ? (
            <div className="bg-[var(--color-bg-secondary)] rounded-3xl p-16 text-center border border-[var(--color-border)] shadow-xs space-y-4">
              <div className="w-16 h-16 bg-amber-50 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 rounded-3xl flex items-center justify-center font-black text-3xl mx-auto shadow-inner">🏠</div>
              <h3 className="text-xl font-bold text-[var(--color-text-primary)]">No Properties Listed Yet</h3>
              <p className="text-xs text-[var(--color-text-secondary)] max-w-sm mx-auto leading-relaxed">List your independent private bedroom, twin PG share, or family apartment for 100% free with instant geolocated map pins.</p>
              <button onClick={() => navigate('/register-room')} className="px-6 py-3 rounded-2xl bg-amber-400 text-slate-950 font-black text-xs shadow-md transition transform hover:scale-105 cursor-pointer">Post Your First Property Now</button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {myRooms.map((room) => {
                const reqsForRoom = incomingRequests.filter(r => r.roomId === room.id);
                const pendingForRoom = reqsForRoom.filter(r => r.status === 'pending');
                return (
                  <div key={room.id} className="bg-[var(--color-bg-secondary)] rounded-3xl border border-[var(--color-border)] shadow-xs overflow-hidden flex flex-col justify-between group hover:shadow-xl transition">
                    <div className="h-48 relative bg-slate-100 dark:bg-slate-800 overflow-hidden">
                      <img src={room.photosURLs?.[0] || 'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?auto=format&fit=crop&w=600&q=80'} alt={room.title} className="w-full h-full object-cover group-hover:scale-105 transition duration-500" />
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent"></div>
                      <span className="absolute top-3 left-3 px-3 py-1 rounded-full bg-slate-900/80 backdrop-blur-md text-white text-xs font-black shadow-sm">{room.type}</span>
                      <span className={`absolute top-3 right-3 px-3 py-1 rounded-full text-xs font-black shadow-sm ${room.available ? 'bg-emerald-500 text-white' : 'bg-rose-600 text-white'}`}>
                        {room.available ? '● Live Available' : '🔒 Rented Out'}
                      </span>
                      <div className="absolute bottom-3 left-4 right-4 text-white">
                        <span className="bg-amber-400 text-slate-950 font-black text-[10px] px-2 py-0.5 rounded inline-block mb-1">{room.wardNo}</span>
                        <h4 className="text-base font-black tracking-tight line-clamp-1">{room.title}</h4>
                      </div>
                    </div>
                    <div className="p-5 space-y-3">
                      <div className="flex items-center justify-between text-xs text-[var(--color-text-secondary)] font-medium">
                        <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400 flex-shrink-0" /><span className="line-clamp-1">{room.locationText}</span></span>
                        <strong className="text-[var(--color-text-primary)] font-mono text-sm font-black">₹{room.rent}/mo</strong>
                      </div>
                      <div onClick={() => setActiveTab('requests')} className={`p-3 rounded-2xl border text-xs flex items-center justify-between transition cursor-pointer ${pendingForRoom.length > 0 ? 'bg-amber-50 dark:bg-amber-900/30 border-amber-300 dark:border-amber-700 text-amber-950 dark:text-amber-300 font-extrabold hover:bg-amber-100 dark:hover:bg-amber-900/50 animate-pulse' : 'bg-[var(--color-bg-tertiary)] border-[var(--color-border)] text-[var(--color-text-secondary)] hover:bg-slate-100 dark:hover:bg-slate-700 font-semibold'}`}>
                        <span className="flex items-center gap-1.5"><Users className="w-4 h-4 text-amber-600 dark:text-amber-400" /><span>{reqsForRoom.length} Applications</span></span>
                        {pendingForRoom.length > 0 ? (
                          <span className="bg-amber-500 text-slate-950 font-black px-2 py-0.5 rounded-full text-[10px]">{pendingForRoom.length} Pending →</span>
                        ) : (
                          <span className="text-[10px] text-[var(--color-text-tertiary)]">View →</span>
                        )}
                      </div>
                    </div>
                    <div className="p-4 bg-[var(--color-bg-tertiary)] border-t border-[var(--color-border)] grid grid-cols-2 gap-2 text-xs font-black">
                      <button onClick={() => handleToggleAvailable(room.id, room.available)} className={`py-2.5 px-3 rounded-xl transition flex items-center justify-center gap-1 border ${room.available ? 'bg-[var(--color-bg-secondary)] text-[var(--color-text-secondary)] border-[var(--color-border)] hover:bg-slate-100 dark:hover:bg-slate-700 shadow-2xs' : 'bg-emerald-600 text-white border-emerald-500 hover:bg-emerald-700 shadow-sm'}`}>
                        {room.available ? <><Lock className="w-3.5 h-3.5 text-[var(--color-text-tertiary)]" /> Mark Rented</> : <><Check className="w-3.5 h-3.5" /> Set Available</>}
                      </button>
                      <button onClick={() => handleDeleteListing(room.id)} className="py-2.5 px-3 rounded-xl bg-[var(--color-bg-secondary)] hover:bg-rose-50 dark:hover:bg-rose-900/20 text-rose-600 border border-[var(--color-border)] hover:border-rose-300 dark:hover:border-rose-700 transition flex items-center justify-center gap-1 shadow-2xs cursor-pointer">
                        <Trash2 className="w-3.5 h-3.5" /> Delete
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Tab 2: Requests */}
      {activeTab === 'requests' && (
        <div className="space-y-6 animate-fadeIn">
          {incomingRequests.length === 0 ? (
            <div className="bg-[var(--color-bg-secondary)] rounded-3xl p-16 text-center border border-[var(--color-border)] shadow-xs space-y-4">
              <div className="w-16 h-16 bg-indigo-50 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-400 rounded-3xl flex items-center justify-center font-black text-3xl mx-auto shadow-inner">📥</div>
              <h3 className="text-xl font-bold text-[var(--color-text-primary)]">No Tenancy Applications Received Yet</h3>
              <p className="text-xs text-[var(--color-text-secondary)] max-w-sm mx-auto leading-relaxed">When room seekers click "Request Room" on any of your posted listings, their personal profiles and introductory notes will show up right here.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {incomingRequests.map((req) => (
                <div key={req.id} className={`p-6 rounded-3xl border transition shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-6 ${req.status === 'pending' ? 'bg-amber-50/40 dark:bg-amber-900/20 border-amber-300 dark:border-amber-700 ring-2 ring-amber-300/20' : req.status === 'accepted' ? 'bg-[var(--color-bg-secondary)] border-emerald-300 dark:border-emerald-700 ring-1 ring-emerald-300/30' : 'bg-[var(--color-bg-tertiary)] border-[var(--color-border)] opacity-70'}`}>
                  <div className="flex items-start gap-4 flex-1">
                    <img src={req.seekerPhoto || 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=250&q=80'} alt={req.seekerName} className="w-16 h-16 rounded-2xl object-cover ring-2 ring-indigo-500/30 shadow-md flex-shrink-0" />
                    <div className="space-y-1.5">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="bg-indigo-600 text-white px-2.5 py-0.5 rounded font-black text-[10px]">{req.roomWard}</span>
                        <strong className="text-sm font-extrabold text-[var(--color-text-primary)] hover:underline cursor-pointer" onClick={() => navigate(`/room/${req.roomId}`)}>{req.roomTitle}</strong>
                      </div>
                      <h4 className="text-base font-black text-[var(--color-text-primary)] flex items-center gap-2">
                        <span>Applicant: {req.seekerName}</span>
                        <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase ${req.status === 'accepted' ? 'bg-emerald-100 dark:bg-emerald-900/50 text-emerald-800 dark:text-emerald-300' : req.status === 'rejected' ? 'bg-rose-100 dark:bg-rose-900/50 text-rose-800 dark:text-rose-300' : 'bg-amber-100 dark:bg-amber-900/50 text-amber-900 dark:text-amber-300'}`}>
                          ● {req.status}
                        </span>
                      </h4>
                      <p className="text-xs text-[var(--color-text-secondary)] bg-[var(--color-bg-secondary)]/80 p-3 rounded-2xl border border-[var(--color-border)] leading-relaxed font-medium italic">"{req.message}"</p>
                      {req.status === 'accepted' && (
                        <div className="flex items-center gap-4 pt-1 font-mono text-xs font-bold text-indigo-700 dark:text-indigo-300 bg-indigo-50/80 dark:bg-indigo-900/40 px-3 py-1.5 rounded-xl border border-indigo-100 dark:border-indigo-800 w-fit">
                          <span>📞 {req.seekerPhone}</span>
                          <span>✉️ {req.seekerEmail}</span>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2.5 flex-wrap w-full md:w-auto justify-end">
                    {req.status === 'pending' && (
                      <>
                        <button onClick={() => handleRejectRequest(req.id)} className="px-4 py-2.5 rounded-xl bg-[var(--color-bg-tertiary)] hover:bg-rose-50 dark:hover:bg-rose-900/20 hover:text-rose-600 font-bold text-xs text-[var(--color-text-secondary)] border border-[var(--color-border)] transition flex items-center gap-1 active:scale-95 cursor-pointer">
                          <X className="w-4 h-4 text-rose-500" /> Reject
                        </button>
                        <button onClick={() => handleAcceptRequest(req)} className="px-6 py-3 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-black text-xs shadow-lg shadow-emerald-500/25 transition transform hover:scale-105 active:scale-95 flex items-center gap-1.5 cursor-pointer">
                          <Check className="w-4 h-4 stroke-[3]" /> Accept & Chat
                        </button>
                      </>
                    )}
                    {req.status === 'accepted' && (
                      <button onClick={() => navigate(`/inbox?chat=${req.chatId || `chat-${req.ownerId}-${req.seekerId}`}`)} className="px-6 py-3 rounded-2xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-black text-xs shadow-lg shadow-indigo-500/25 transition transform hover:scale-105 flex items-center gap-2 cursor-pointer">
                        <MessageSquare className="w-4 h-4" /> Go to Live Chat
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

    </div>
  );
};