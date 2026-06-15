import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { subscribeChats } from '../firebase/db';
import { Chat } from '../firebase/mockData';
import { useAuth } from '../context/AuthContext';
import { ChatWindow } from '../components/ChatWindow';
import { MessageSquare, Building2, ChevronRight } from 'lucide-react';

export const Inbox: React.FC<{ onOpenAuth: () => void }> = ({ onOpenAuth }) => {
  const { user } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const [chats, setChats] = useState<Chat[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeChatId, setActiveChatId] = useState<string | null>(() => searchParams.get('chat'));

  useEffect(() => {
    if (!user) return;
    const unsub = subscribeChats(user.uid, (list) => {
      setChats(list);
      setLoading(false);
      if (!activeChatId && list.length > 0) {
        setActiveChatId(list[0].id);
      }
    });
    return () => unsub();
  }, [user]);

  useEffect(() => {
    const cId = searchParams.get('chat');
    if (cId) setActiveChatId(cId);
  }, [searchParams]);

  if (!user) {
    return (
      <div className="bg-[var(--color-bg-secondary)] rounded-3xl p-16 text-center max-w-2xl mx-auto my-12 border border-[var(--color-border)] shadow-xl space-y-4">
        <div className="w-16 h-16 bg-indigo-50 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-400 rounded-3xl flex items-center justify-center font-black text-3xl mx-auto shadow-inner">💬</div>
        <h2 className="text-2xl font-black text-[var(--color-text-primary)] tracking-tight">Inbox Authentication Required</h2>
        <p className="text-xs text-[var(--color-text-secondary)] max-w-md mx-auto leading-relaxed">
          Please log in or select the <strong>Ramesh Sharma</strong> or <strong>Suresh Kumar</strong> demo persona to access verified real-time direct property chats.
        </p>
        <button onClick={onOpenAuth} className="px-6 py-3 rounded-2xl bg-indigo-600 text-white font-black text-xs shadow-md transition cursor-pointer">Sign In</button>
      </div>
    );
  }

  const selectedChat = chats.find(c => c.id === activeChatId) || chats[0] || null;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8 animate-fadeIn">
      
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-900 via-indigo-800 to-purple-900 dark:from-slate-950 dark:via-indigo-950 dark:to-slate-900 rounded-3xl p-8 text-white shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 relative overflow-hidden">
        <div className="absolute -left-10 -bottom-10 w-48 h-48 bg-purple-500/20 rounded-full blur-3xl pointer-events-none"></div>
        <div className="flex items-center gap-4 relative z-10">
          <div className="w-14 h-14 rounded-2xl bg-rose-500/20 text-rose-300 flex items-center justify-center font-black text-2xl backdrop-blur-md border border-rose-500/30 shadow">💬</div>
          <div>
            <span className="bg-amber-400 text-slate-950 font-black text-[10px] px-2.5 py-0.5 rounded uppercase tracking-wider">Real-time Direct Channel</span>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight mt-1">Unified Conversational Inbox</h1>
            <p className="text-xs text-indigo-100 mt-0.5">Instant encrypted messaging directly connecting room owners and confirmed tenants.</p>
          </div>
        </div>
      </div>

      {/* Main Split Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left: Chat Sessions */}
        <div className={`lg:col-span-5 bg-[var(--color-bg-secondary)] rounded-3xl p-4 border border-[var(--color-border)] shadow-xs h-[600px] overflow-y-auto ${selectedChat ? 'hidden lg:block' : 'block'}`}>
          <div className="p-3 pb-4 border-b border-[var(--color-border)] flex items-center justify-between">
            <h3 className="text-sm font-black text-[var(--color-text-primary)] uppercase tracking-wider flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-indigo-600 dark:text-indigo-400" /> All Active Chats ({chats.length})
            </h3>
          </div>

          {loading ? (
            <div className="py-20 text-center space-y-4">
              <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
              <div className="text-xs font-bold text-[var(--color-text-secondary)]">Connecting to real-time chat sync...</div>
            </div>
          ) : chats.length === 0 ? (
            <div className="py-20 text-center space-y-3 px-4">
              <div className="text-3xl">📭</div>
              <h4 className="text-sm font-bold text-[var(--color-text-primary)]">No Messages Found</h4>
              <p className="text-xs text-[var(--color-text-tertiary)] leading-relaxed">When you submit rental applications or approve incoming candidates, your real-time messaging channels appear right here.</p>
            </div>
          ) : (
            <div className="space-y-2 pt-2">
              {chats.map((chat) => {
                const isMeAsOwner = user.uid === chat.ownerId;
                const otherName = isMeAsOwner ? chat.seekerName : chat.ownerName;
                const otherPhoto = isMeAsOwner ? chat.seekerPhoto : chat.ownerPhoto;
                const unreadForMe = chat.unreadCount?.[user.uid] || 0;
                const isSelected = selectedChat?.id === chat.id;

                return (
                  <div
                    key={chat.id}
                    onClick={() => { setActiveChatId(chat.id); setSearchParams({ chat: chat.id }); }}
                    className={`p-4 rounded-2xl transition flex items-center justify-between gap-3 cursor-pointer border ${isSelected ? 'bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-900/40 dark:to-purple-900/30 border-indigo-300 dark:border-indigo-700 shadow-xs ring-2 ring-indigo-500/10' : unreadForMe > 0 ? 'bg-rose-50/50 dark:bg-rose-900/20 border-rose-200 dark:border-rose-800 hover:bg-slate-50 dark:hover:bg-slate-800' : 'bg-[var(--color-bg-secondary)] border-[var(--color-border)] hover:bg-[var(--color-bg-tertiary)]'}`}
                  >
                    <div className="flex items-center gap-3.5 overflow-hidden flex-1">
                      <div className="relative flex-shrink-0">
                        <img src={otherPhoto} alt={otherName} className="w-12 h-12 rounded-2xl object-cover ring-2 ring-emerald-400/40 shadow-2xs" />
                        <span className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-emerald-500 ring-2 ring-[var(--color-bg-secondary)]"></span>
                      </div>
                      <div className="space-y-1 overflow-hidden w-full text-left">
                        <div className="flex items-center justify-between gap-1">
                          <strong className="text-sm font-extrabold text-[var(--color-text-primary)] line-clamp-1">{otherName}</strong>
                          <span className="text-[10px] text-[var(--color-text-tertiary)] font-mono">{new Date(chat.lastMessageTime).toLocaleDateString([], { month: 'short', day: 'numeric' })}</span>
                        </div>
                        <div className="text-xs text-indigo-600 dark:text-indigo-400 font-bold line-clamp-1 flex items-center gap-1">
                          <Building2 className="w-3 h-3 flex-shrink-0" /><span>{chat.roomTitle}</span>
                        </div>
                        <p className={`text-xs line-clamp-1 ${unreadForMe > 0 ? 'font-black text-[var(--color-text-primary)]' : 'text-[var(--color-text-secondary)] font-medium'}`}>
                          {chat.lastMessage || 'Connected! Start chatting.'}
                        </p>
                      </div>
                    </div>
                    <div className="flex flex-col items-end justify-between h-full py-0.5 flex-shrink-0">
                      {unreadForMe > 0 ? (
                        <span className="bg-rose-500 text-white font-black px-2 py-0.5 rounded-full text-[10px] shadow animate-bounce">{unreadForMe}</span>
                      ) : (
                        <ChevronRight className="w-4 h-4 text-[var(--color-text-tertiary)]" />
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Right: Active Chat */}
        <div className={`lg:col-span-7 ${!selectedChat ? 'hidden lg:block' : 'block'}`}>
          {selectedChat ? (
            <ChatWindow chat={selectedChat} onBack={() => setActiveChatId(null)} />
          ) : (
            <div className="bg-[var(--color-bg-secondary)] rounded-3xl p-16 text-center border border-[var(--color-border)] shadow-xs h-[600px] flex flex-col items-center justify-center space-y-4">
              <div className="w-20 h-20 bg-indigo-50 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-400 rounded-3xl flex items-center justify-center font-black text-4xl shadow-inner">💬</div>
              <h3 className="text-xl font-bold text-[var(--color-text-primary)]">Select a Chat to Open Live Window</h3>
              <p className="text-xs text-[var(--color-text-secondary)] max-w-sm mx-auto leading-relaxed">Click on any participant from the left conversation tray to send instant automated replies and inspect rental milestones.</p>
            </div>
          )}
        </div>

      </div>

    </div>
  );
};