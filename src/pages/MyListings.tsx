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

  // Active filter tab
  const [activeTab, setActiveTab] = useState<'listings' | 'requests'>('listings');

  // Real-time tracking
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

    return () => {
      unsubRooms();
      unsubReqs();
    };
  }, [user]);

  if (!user) {
    return (
      <div className="bg-white rounded-3xl p-16 text-center max-w-2xl mx-auto my-12 border border-slate-200 shadow-xl space-y-4">
        <div className="w-16 h-16 bg-indigo-50 text-indigo-600 rounded-3xl flex items-center justify-center font-black text-3xl mx-auto shadow-inner">
          🔒
        </div>
        <h2 className="text-2xl font-black text-indigo-950 tracking-tight">Owner Authentication Required</h2>
        <p className="text-xs text-slate-500 max-w-md mx-auto leading-relaxed">
          Please log in or select the <strong>Ramesh Sharma</strong> demo account to view and manage your posted room listings.
        </p>
        <button
          onClick={onOpenAuth}
          className="px-6 py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-black text-xs shadow-md transition"
        >
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
    const chatId = await acceptRentalRequest(req);
    alert("✓ Rental application accepted! Your phone number has been unlocked for the tenant.");
    // optionally mark room rented
    if (confirm("Would you like to automatically mark this room as 'Rented Out' to stop new applications?")) {
      await updateRoomStatus(req.roomId, false);
    }
    navigate(`/inbox?chat=${chatId}`);
  };

  const handleRejectRequest = async (requestId: string) => {
    if (confirm("Are you sure you want to reject this applicant?")) {
      await rejectRentalRequest(requestId);
    }
  };

  const pendingRequestsCount = incomingRequests.filter(r => r.status === 'pending').length;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8 animate-fadeIn">
      
      {/* Top Owner Header & Dashboard statistics */}
      <div className="bg-gradient-to-r from-indigo-900 via-indigo-800 to-purple-900 rounded-3xl p-8 text-white shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative overflow-hidden">
        <div className="absolute -left-10 -top-10 w-48 h-48 bg-purple-500/20 rounded-full blur-3xl pointer-events-none"></div>

        <div className="flex items-center gap-4 relative z-10">
          <img
            src={user.photoURL}
            alt={user.name}
            className="w-16 h-16 rounded-2xl object-cover ring-2 ring-amber-400 shadow-lg"
          />
          <div>
            <span className="bg-amber-400 text-slate-950 font-black text-[10px] px-2.5 py-0.5 rounded uppercase tracking-wider">
              {user.city} Ward Owner
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight mt-1">
              Welcome, {user.name}
            </h1>
            <p className="text-xs text-indigo-100 mt-0.5">
              Manage your live property portfolio, incoming tenancy requests, and direct conversations.
            </p>
          </div>
        </div>

        {/* Action button post */}
        <button
          onClick={() => navigate('/register-room')}
          className="px-6 py-4 rounded-2xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs sm:text-sm shadow-xl transition transform hover:scale-105 active:scale-95 flex items-center gap-2 cursor-pointer flex-shrink-0"
        >
          <PlusCircle className="w-5 h-5" />
          <span>➕ Post Brand New Listing</span>
        </button>
      </div>

      {/* Toggles Tab Desk */}
      <div className="flex border-b border-slate-200 gap-4">
        <button
          onClick={() => setActiveTab('listings')}
          className={`py-3 px-4 font-extrabold text-sm border-b-4 transition flex items-center gap-2 ${
            activeTab === 'listings' 
              ? 'border-indigo-600 text-indigo-950 font-black' 
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Building2 className="w-4 h-4 text-indigo-600" />
          <span>My Posted Listings ({myRooms.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('requests')}
          className={`py-3 px-4 font-extrabold text-sm border-b-4 transition flex items-center gap-2 ${
            activeTab === 'requests' 
              ? 'border-indigo-600 text-indigo-950 font-black' 
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Users className="w-4 h-4 text-amber-500" />
          <span>Tenant Applicant Screen</span>
          {pendingRequestsCount > 0 && (
            <span className="bg-amber-500 text-slate-900 font-black px-2 py-0.5 rounded-full text-[10px] shadow animate-pulse">
              {pendingRequestsCount} new
            </span>
          )}
        </button>
      </div>

      {/* Content Body Tab 1: My Listings */}
      {activeTab === 'listings' && (
        <div className="space-y-6 animate-fadeIn">
          {loading ? (
            <div className="py-20 text-center space-y-4">
              <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
              <div className="text-sm font-bold text-slate-700">Syncing your property inventory...</div>
            </div>
          ) : myRooms.length === 0 ? (
            <div className="bg-white rounded-3xl p-16 text-center border border-slate-200 shadow-xs space-y-4">
              <div className="w-16 h-16 bg-amber-50 text-amber-600 rounded-3xl flex items-center justify-center font-black text-3xl mx-auto shadow-inner">
                🏠
              </div>
              <h3 className="text-xl font-bold text-indigo-950">No Properties Listed Yet</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto leading-relaxed">
                List your independent private bedroom, twin PG share, or family apartment for 100% free with instant geolocated map pins.
              </p>
              <button
                onClick={() => navigate('/register-room')}
                className="px-6 py-3 rounded-2xl bg-amber-400 text-slate-950 font-black text-xs shadow-md transition transform hover:scale-105"
              >
                Post Your First Property Now
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {myRooms.map((room) => {
                const reqsForThisRoom = incomingRequests.filter(r => r.roomId === room.id);
                const pendingForThisRoom = reqsForThisRoom.filter(r => r.status === 'pending');

                return (
                  <div key={room.id} className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden flex flex-col justify-between group hover:shadow-xl transition">
                    
                    {/* Top Image */}
                    <div className="h-48 relative bg-slate-100 overflow-hidden">
                      <img
                        src={room.photosURLs?.[0] || 'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?auto=format&fit=crop&w=600&q=80'}
                        alt={room.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent"></div>

                      {/* Top Badges */}
                      <span className="absolute top-3 left-3 px-3 py-1 rounded-full bg-slate-900/80 backdrop-blur-md text-white text-xs font-black shadow-sm">
                        {room.type}
                      </span>

                      <span className={`absolute top-3 right-3 px-3 py-1 rounded-full text-xs font-black shadow-sm ${
                        room.available ? 'bg-emerald-500 text-white' : 'bg-rose-600 text-white'
                      }`}>
                        {room.available ? '● Live Available' : '🔒 Rented Out'}
                      </span>

                      {/* Title Overlay */}
                      <div className="absolute bottom-3 left-4 right-4 text-white">
                        <span className="bg-amber-400 text-slate-950 font-black text-[10px] px-2 py-0.5 rounded inline-block mb-1">
                          {room.wardNo}
                        </span>
                        <h4 className="text-base font-black tracking-tight line-clamp-1">{room.title}</h4>
                      </div>
                    </div>

                    {/* Middle specs */}
                    <div className="p-5 space-y-3">
                      <div className="flex items-center justify-between text-xs text-slate-600 font-medium">
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5 text-indigo-600 flex-shrink-0" />
                          <span className="line-clamp-1">{room.locationText}</span>
                        </span>
                        <strong className="text-indigo-950 font-mono text-sm font-black">₹{room.rent}/mo</strong>
                      </div>

                      {/* Incoming applications notification banner */}
                      <div 
                        onClick={() => setActiveTab('requests')}
                        className={`p-3 rounded-2xl border text-xs flex items-center justify-between transition cursor-pointer ${
                          pendingForThisRoom.length > 0
                            ? 'bg-amber-50 border-amber-300 text-amber-950 font-extrabold hover:bg-amber-100 animate-pulse'
                            : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100 font-semibold'
                        }`}
                      >
                        <span className="flex items-center gap-1.5">
                          <Users className="w-4 h-4 text-amber-600" />
                          <span>{reqsForThisRoom.length} Applications</span>
                        </span>
                        {pendingForThisRoom.length > 0 ? (
                          <span className="bg-amber-500 text-slate-950 font-black px-2 py-0.5 rounded-full text-[10px]">
                            {pendingForThisRoom.length} Pending Actions →
                          </span>
                        ) : (
                          <span className="text-[10px] text-slate-400">View History →</span>
                        )}
                      </div>
                    </div>

                    {/* Owner Action buttons */}
                    <div className="p-4 bg-slate-50 border-t border-slate-100 grid grid-cols-2 gap-2 text-xs font-black">
                      <button
                        onClick={() => handleToggleAvailable(room.id, room.available)}
                        className={`py-2.5 px-3 rounded-xl transition flex items-center justify-center gap-1 border ${
                          room.available
                            ? 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100 shadow-2xs'
                            : 'bg-emerald-600 text-white border-emerald-500 hover:bg-emerald-700 shadow-sm'
                        }`}
                      >
                        {room.available ? (
                          <>
                            <Lock className="w-3.5 h-3.5 text-slate-500" /> Mark Rented
                          </>
                        ) : (
                          <>
                            <Check className="w-3.5 h-3.5" /> Set Available
                          </>
                        )}
                      </button>

                      <button
                        onClick={() => handleDeleteListing(room.id)}
                        className="py-2.5 px-3 rounded-xl bg-white hover:bg-rose-50 text-rose-600 border border-slate-200 hover:border-rose-300 transition flex items-center justify-center gap-1 shadow-2xs"
                      >
                        <Trash2 className="w-3.5 h-3.5" /> Delete Room
                      </button>
                    </div>

                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Content Body Tab 2: Incoming Requests */}
      {activeTab === 'requests' && (
        <div className="space-y-6 animate-fadeIn">
          {incomingRequests.length === 0 ? (
            <div className="bg-white rounded-3xl p-16 text-center border border-slate-200 shadow-xs space-y-4">
              <div className="w-16 h-16 bg-indigo-50 text-indigo-600 rounded-3xl flex items-center justify-center font-black text-3xl mx-auto shadow-inner">
                📥
              </div>
              <h3 className="text-xl font-bold text-indigo-950">No Tenancy Applications Received Yet</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto leading-relaxed">
                When room seekers click "Request Room" on any of your posted listings, their complete personal profiles and introductory notes will show up right here.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {incomingRequests.map((req) => (
                <div key={req.id} className={`p-6 rounded-3xl border transition shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-6 ${
                  req.status === 'pending'
                    ? 'bg-amber-50/40 border-amber-300 ring-2 ring-amber-300/20'
                    : req.status === 'accepted'
                    ? 'bg-white border-emerald-300 ring-1 ring-emerald-300/30'
                    : 'bg-slate-50 border-slate-200 opacity-70'
                }`}>
                  
                  {/* Left: Applicant details */}
                  <div className="flex items-start gap-4 flex-1">
                    <img
                      src={req.seekerPhoto || 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=250&q=80'}
                      alt={req.seekerName}
                      className="w-16 h-16 rounded-2xl object-cover ring-2 ring-indigo-500/30 shadow-md flex-shrink-0"
                    />

                    <div className="space-y-1.5">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="bg-indigo-600 text-white px-2.5 py-0.5 rounded font-black text-[10px]">
                          {req.roomWard}
                        </span>
                        <strong className="text-sm font-extrabold text-indigo-950 hover:underline cursor-pointer" onClick={() => navigate(`/room/${req.roomId}`)}>
                          {req.roomTitle}
                        </strong>
                      </div>

                      <h4 className="text-base font-black text-slate-900 flex items-center gap-2">
                        <span>Applicant: {req.seekerName}</span>
                        <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase ${
                          req.status === 'accepted' ? 'bg-emerald-100 text-emerald-800' :
                          req.status === 'rejected' ? 'bg-rose-100 text-rose-800' :
                          'bg-amber-100 text-amber-900'
                        }`}>
                          ● {req.status}
                        </span>
                      </h4>

                      <p className="text-xs text-slate-600 bg-white/80 p-3 rounded-2xl border border-slate-200/60 leading-relaxed font-medium italic">
                        "{req.message}"
                      </p>

                      {/* Display unmasked contact info if accepted */}
                      {req.status === 'accepted' && (
                        <div className="flex items-center gap-4 pt-1 font-mono text-xs font-bold text-indigo-700 bg-indigo-50/80 px-3 py-1.5 rounded-xl border border-indigo-100 w-fit">
                          <span>📞 {req.seekerPhone}</span>
                          <span>✉️ {req.seekerEmail}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Right Actions */}
                  <div className="flex items-center gap-2.5 flex-wrap w-full md:w-auto justify-end">
                    {req.status === 'pending' && (
                      <>
                        <button
                          onClick={() => handleRejectRequest(req.id)}
                          className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-rose-50 hover:text-rose-600 font-bold text-xs text-slate-700 border border-slate-200 transition flex items-center gap-1 active:scale-95 cursor-pointer"
                        >
                          <X className="w-4 h-4 text-rose-500" /> Reject
                        </button>

                        <button
                          onClick={() => handleAcceptRequest(req)}
                          className="px-6 py-3 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-slate-950 font-black text-xs shadow-lg shadow-emerald-500/25 transition transform hover:scale-105 active:scale-95 flex items-center gap-1.5 cursor-pointer"
                        >
                          <Check className="w-4 h-4 stroke-[3]" /> Accept & Unlock Chat
                        </button>
                      </>
                    )}

                    {req.status === 'accepted' && (
                      <button
                        onClick={() => navigate(`/inbox?chat=${req.chatId || `chat-${req.ownerId}-${req.seekerId}`}`)}
                        className="px-6 py-3 rounded-2xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-black text-xs shadow-lg shadow-indigo-500/25 transition transform hover:scale-105 flex items-center gap-2 cursor-pointer"
                      >
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