import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { subscribeRequests } from '../firebase/db';
import { RentalRequest } from '../firebase/mockData';
import { useAuth } from '../context/AuthContext';
import { 
  Clock, MessageSquare, Phone, Mail, Building2, ExternalLink, ShieldCheck 
} from 'lucide-react';

export const MyRequests: React.FC<{ onOpenAuth: () => void }> = ({ onOpenAuth }) => {
  const { user, activeRole } = useAuth();
  const navigate = useNavigate();

  const [myRequests, setMyRequests] = useState<RentalRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<'All' | 'pending' | 'accepted' | 'rejected'>('All');

  useEffect(() => {
    if (!user) return;
    const unsub = subscribeRequests(user.uid, activeRole, (reqs) => {
      setMyRequests(reqs);
      setLoading(false);
    });
    return () => unsub();
  }, [user, activeRole]);

  if (!user) {
    return (
      <div className="bg-white rounded-3xl p-16 text-center max-w-2xl mx-auto my-12 border border-slate-200 shadow-xl space-y-4">
        <div className="w-16 h-16 bg-indigo-50 text-indigo-600 rounded-3xl flex items-center justify-center font-black text-3xl mx-auto shadow-inner">
          📑
        </div>
        <h2 className="text-2xl font-black text-indigo-950 tracking-tight">Seeker Authentication Required</h2>
        <p className="text-xs text-slate-500 max-w-md mx-auto leading-relaxed">
          Please log in or select the <strong>Suresh Kumar</strong> demo account to track your pending, approved, and unlocked rental requests.
        </p>
        <button
          onClick={onOpenAuth}
          className="px-6 py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-black text-xs shadow-md transition"
        >
          Sign In to Access Requests Desk
        </button>
      </div>
    );
  }

  const filtered = statusFilter === 'All' ? myRequests : myRequests.filter(r => r.status === statusFilter);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8 animate-fadeIn">
      
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-900 via-indigo-800 to-purple-900 rounded-3xl p-8 text-white shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative overflow-hidden">
        <div className="absolute -right-10 -bottom-10 w-48 h-48 bg-purple-500/20 rounded-full blur-3xl pointer-events-none"></div>

        <div className="flex items-center gap-4 relative z-10">
          <div className="w-14 h-14 rounded-2xl bg-white/10 text-amber-300 flex items-center justify-center font-black text-2xl backdrop-blur-md border border-white/10 shadow">
            📑
          </div>
          <div>
            <span className="bg-amber-400 text-slate-950 font-black text-[10px] px-2.5 py-0.5 rounded uppercase tracking-wider">
              {activeRole === 'room_owner' ? 'Owner Inbox Portal' : 'Seeker Application Desk'}
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight mt-1">
              Rental Applications Log
            </h1>
            <p className="text-xs text-indigo-100 mt-0.5">
              {activeRole === 'room_owner' 
                ? 'Review applications received from prospective room seekers.' 
                : 'Track the live confirmation status of properties you wish to rent.'}
            </p>
          </div>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 bg-white/10 p-1.5 rounded-2xl backdrop-blur-md border border-white/10 w-full sm:w-auto overflow-x-auto">
          {(['All', 'pending', 'accepted', 'rejected'] as const).map(s => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-black uppercase tracking-wider transition ${
                statusFilter === s ? 'bg-white text-indigo-900 shadow' : 'text-indigo-200 hover:text-white'
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Main Listing */}
      {loading ? (
        <div className="py-20 text-center space-y-4">
          <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <div className="text-sm font-bold text-slate-700">Loading your applications tracking...</div>
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white rounded-3xl p-16 text-center border border-slate-200 shadow-xs space-y-4">
          <div className="w-16 h-16 bg-indigo-50 text-indigo-600 rounded-3xl flex items-center justify-center font-black text-3xl mx-auto shadow-inner">
            📭
          </div>
          <h3 className="text-xl font-bold text-indigo-950">No Requests Matched '{statusFilter}'</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto leading-relaxed">
            {activeRole === 'room_seeker' 
              ? 'You have not submitted any room applications in this status category yet. Start searching independent rooms and submit your interest.'
              : 'You have not received any requests matching this filter.'}
          </p>
          {activeRole === 'room_seeker' && (
            <button
              onClick={() => navigate('/search')}
              className="px-6 py-3 rounded-2xl bg-indigo-600 text-white font-black text-xs shadow-md transition transform hover:scale-105"
            >
              Search & Apply for Rooms
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map((req) => {
            const isAccepted = req.status === 'accepted';
            const isPending = req.status === 'pending';
            const isRejected = req.status === 'rejected';

            const targetName = activeRole === 'room_owner' ? req.seekerName : req.ownerName;
            const targetPhone = activeRole === 'room_owner' ? req.seekerPhone : req.ownerPhone;
            const targetEmail = activeRole === 'room_owner' ? req.seekerEmail : req.ownerEmail;

            return (
              <div 
                key={req.id} 
                className={`bg-white rounded-3xl p-6 border transition shadow-2xs hover:shadow-lg flex flex-col md:flex-row items-start md:items-center justify-between gap-6 ${
                  isAccepted ? 'border-emerald-300 ring-2 ring-emerald-300/20' :
                  isPending ? 'border-amber-300/80 hover:border-amber-400' :
                  'border-slate-200/80 bg-slate-50/50'
                }`}
              >
                
                {/* Left Info */}
                <div className="flex items-start gap-4 flex-1">
                  <div className="w-16 h-16 rounded-2xl overflow-hidden bg-slate-100 flex-shrink-0 relative border border-slate-200 shadow-xs">
                    <img src={req.roomPhoto || 'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?auto=format&fit=crop&w=600&q=80'} alt="Room" className="w-full h-full object-cover" />
                  </div>

                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="bg-amber-400 text-slate-950 px-2 py-0.5 rounded font-black text-[10px]">
                        {req.roomWard}
                      </span>
                      <span className={`px-2.5 py-0.5 rounded text-[10px] font-black uppercase flex items-center gap-1 ${
                        isAccepted ? 'bg-emerald-500 text-slate-950' :
                        isRejected ? 'bg-rose-500 text-white' :
                        'bg-amber-100 text-amber-900'
                      }`}>
                        {isAccepted ? <ShieldCheck className="w-3 h-3" /> : null}
                        {isPending ? <Clock className="w-3 h-3 animate-spin" /> : null}
                        <span>● Status: {req.status}</span>
                      </span>
                    </div>

                    <h3 
                      onClick={() => navigate(`/room/${req.roomId}`)}
                      className="text-base sm:text-lg font-extrabold text-indigo-950 hover:text-indigo-600 transition cursor-pointer flex items-center gap-2 line-clamp-1"
                    >
                      <span>{req.roomTitle}</span>
                      <ExternalLink className="w-4 h-4 text-slate-400 flex-shrink-0" />
                    </h3>

                    <div className="text-xs text-slate-600 flex items-center gap-2 font-medium">
                      <Building2 className="w-3.5 h-3.5 text-slate-400" />
                      <span>{activeRole === 'room_owner' ? 'Applicant Profile' : 'Verified Owner Desk'}: <strong>{targetName}</strong></span>
                      <span>•</span>
                      <strong className="text-indigo-900 font-mono">₹{req.roomRent}/mo</strong>
                    </div>

                    {/* Unlocked Verified Contact Panel */}
                    {isAccepted ? (
                      <div className="mt-2 p-3 bg-emerald-50 rounded-2xl border border-emerald-200 flex flex-wrap items-center gap-4 text-xs font-bold text-emerald-950 animate-fadeIn">
                        <span className="flex items-center gap-1 text-emerald-800">
                          <Phone className="w-3.5 h-3.5 text-emerald-600" />
                          <span>Direct Mobile: <strong>{targetPhone}</strong></span>
                        </span>
                        <span className="flex items-center gap-1 text-emerald-800">
                          <Mail className="w-3.5 h-3.5 text-emerald-600" />
                          <span>Email: <strong>{targetEmail}</strong></span>
                        </span>
                        <span className="bg-emerald-600 text-white px-2 py-0.5 rounded-md text-[10px] font-black">
                          Fully Verified ✓
                        </span>
                      </div>
                    ) : (
                      <p className="text-xs text-slate-500 italic pt-1">
                        Application Message: "{req.message}"
                      </p>
                    )}

                    <div className="text-[10px] text-slate-400 font-mono pt-1">
                      Applied on: {new Date(req.createdAt).toLocaleDateString()} at {new Date(req.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>
                </div>

                {/* Right Actions */}
                <div className="flex items-center gap-2 flex-wrap w-full md:w-auto justify-end flex-shrink-0">
                  <button
                    onClick={() => navigate(`/room/${req.roomId}`)}
                    className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs flex items-center gap-1.5 transition active:scale-95 cursor-pointer"
                  >
                    View Room Property
                  </button>

                  {isAccepted && (
                    <button
                      onClick={() => navigate(`/inbox?chat=${req.chatId || `chat-${req.ownerId}-${req.seekerId}`}`)}
                      className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-black text-xs shadow-md transition transform hover:scale-105 flex items-center gap-1.5 cursor-pointer"
                    >
                      <MessageSquare className="w-3.5 h-3.5" /> Launch In-App Chat
                    </button>
                  )}
                </div>

              </div>
            );
          })}
        </div>
      )}

    </div>
  );
};