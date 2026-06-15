import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { Chat, Message } from '../firebase/mockData';
import { subscribeMessages, sendMessageDoc, markChatReadLocal } from '../firebase/db';
import { Send, Phone, CheckCheck, ShieldCheck, Sparkles, Building2, Clock } from 'lucide-react';

interface ChatWindowProps {
  chat: Chat;
  onBack?: () => void;
}

export const ChatWindow: React.FC<ChatWindowProps> = ({ chat, onBack }) => {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [isSending, setIsSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  if (!user) return null;

  const isMyChatAsOwner = user.uid === chat.ownerId;
  const otherParticipantId = isMyChatAsOwner ? chat.seekerId : chat.ownerId;
  const otherParticipantName = isMyChatAsOwner ? chat.seekerName : chat.ownerName;
  const otherParticipantPhoto = isMyChatAsOwner ? chat.seekerPhoto : chat.ownerPhoto;

  // Real-time Messages subscription
  useEffect(() => {
    const unsub = subscribeMessages(chat.id, (msgs) => {
      setMessages(msgs);
    });

    // Mark messages read
    markChatReadLocal(chat.id, user.uid);

    return () => unsub();
  }, [chat.id, user.uid]);

  // Auto scroll to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || isSending) return;

    const textToSend = inputText;
    setInputText('');
    setIsSending(true);

    try {
      await sendMessageDoc(chat.id, user.uid, user.name, textToSend, otherParticipantId);
      
      // If evaluating in local demo mode and I am talking to Ramesh, simulate instant automated reply
      if (otherParticipantId === 'user-ramesh' && textToSend.includes('?')) {
        setTimeout(async () => {
          await sendMessageDoc(
            chat.id,
            'user-ramesh',
            'Ramesh Sharma',
            `Namaste! Thank you for the update. I have confirmed your slot and my DU campus room is completely clean and ready. Feel free to call me directly at +91 98110 12345 whenever you reach!`,
            user.uid
          );
        }, 1800);
      }
    } catch (err) {
      console.warn("Send message err:", err);
    } finally {
      setIsSending(false);
    }
  };

  const handleQuickReply = (template: string) => {
    setInputText(template);
  };

  return (
    <div className="flex flex-col h-[600px] bg-[var(--color-bg-secondary)] rounded-3xl border border-[var(--color-border)] shadow-2xl overflow-hidden animate-fadeIn">
      
      {/* Top Chat Header */}
      <div className="bg-gradient-to-r from-indigo-900 via-indigo-800 to-purple-900 dark:from-slate-950 dark:via-indigo-950 dark:to-slate-900 p-4 text-white flex items-center justify-between border-b border-indigo-700/50 shadow-md">
        <div className="flex items-center gap-3">
          {onBack && (
            <button
              onClick={onBack}
              className="md:hidden p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs"
            >
              ← Back
            </button>
          )}

          <div className="relative">
            <img
              src={otherParticipantPhoto}
              alt={otherParticipantName}
              className="w-12 h-12 rounded-2xl object-cover ring-2 ring-emerald-400 shadow"
            />
            <span className="absolute bottom-0 right-0 w-3.5 h-3.5 rounded-full bg-emerald-500 ring-2 ring-indigo-900"></span>
          </div>

          <div>
            <div className="text-sm sm:text-base font-extrabold flex items-center gap-1.5">
              <span>{otherParticipantName}</span>
              <span title="Verified Participant">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
              </span>
            </div>
            <div className="text-xs text-indigo-200 line-clamp-1 flex items-center gap-1">
              <Building2 className="w-3 h-3 text-amber-300 flex-shrink-0" />
              <span>{chat.roomTitle}</span>
            </div>
          </div>
        </div>

        {/* Contact info Box */}
        <div className="hidden sm:flex items-center gap-2 bg-white/10 p-2 rounded-2xl border border-white/10 backdrop-blur-md">
          <a
            href={`tel:${isMyChatAsOwner ? '+919876567890' : '+919811012345'}`}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-900 font-extrabold text-xs shadow-sm transition"
            title="Click to place direct verified phone call"
          >
            <Phone className="w-3.5 h-3.5" /> Call Direct
          </a>
        </div>
      </div>

      {/* Messages Scroll Body */}
      <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-gradient-to-b from-slate-50/50 to-indigo-50/30 dark:from-slate-900/50 dark:to-indigo-950/30">
        
        {/* Verification Alert Security Note */}
        <div className="bg-amber-50 dark:bg-amber-900/30 border border-amber-200/80 dark:border-amber-800/50 p-3 rounded-2xl text-xs text-amber-900 dark:text-amber-300 flex items-start gap-2.5 max-w-lg mx-auto">
          <Sparkles className="w-4 h-4 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
          <div>
            <strong className="font-extrabold">Contact Info Unlocked!</strong> This is an accepted rental chat. You can schedule your room visit and pay the security token directly or in person.
          </div>
        </div>

        {messages.length === 0 && (
          <div className="text-center py-12 text-[var(--color-text-tertiary)] text-xs">
            No messages yet. Send an introduction to start your conversation!
          </div>
        )}

        {messages.map((m) => {
          const isMe = m.senderId === user.uid;
          const timeFormatted = new Date(m.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

          return (
            <div
              key={m.id}
              className={`flex flex-col ${isMe ? 'items-end' : 'items-start'} animate-fadeIn`}
            >
              <div
                className={`max-w-[80%] sm:max-w-[70%] p-3.5 rounded-3xl text-sm shadow-xs relative ${
                  isMe
                    ? 'bg-gradient-to-br from-indigo-600 to-purple-600 text-white rounded-br-xs'
                    : 'bg-[var(--color-bg-secondary)] text-[var(--color-text-primary)] rounded-bl-xs border border-[var(--color-border)]'
                }`}
              >
                <div className="leading-relaxed font-medium">{m.text}</div>
                <div className={`text-[9px] mt-1.5 flex items-center justify-end gap-1 font-mono ${
                  isMe ? 'text-indigo-200' : 'text-[var(--color-text-tertiary)]'
                }`}>
                  <Clock className="w-2.5 h-2.5" />
                  <span>{timeFormatted}</span>
                  {isMe && <CheckCheck className="w-3 h-3 text-emerald-300" />}
                </div>
              </div>
            </div>
          );
        })}

        <div ref={messagesEndRef} />
      </div>

      {/* Quick Reply Presets Tray */}
      <div className="px-4 py-2 bg-[var(--color-bg-tertiary)] border-t border-[var(--color-border)] flex items-center gap-1.5 overflow-x-auto">
        <span className="text-[10px] font-extrabold text-[var(--color-text-tertiary)] uppercase tracking-wider flex-shrink-0 mr-1">Quick Reply:</span>
        {[
          "Hello! I am planning to visit tomorrow at 10 AM.",
          "Is the Wi-Fi 100Mbps fiber exactly?",
          "I will bring my Aadhar card for verification.",
          "What is the exact landmark near the gate?"
        ].map(phrase => (
          <button
            key={phrase}
            onClick={() => handleQuickReply(phrase)}
            className="px-2.5 py-1 bg-[var(--color-bg-secondary)] hover:bg-indigo-50 dark:hover:bg-indigo-900/30 border border-[var(--color-border)] hover:border-indigo-300 dark:hover:border-indigo-700 rounded-xl text-xs font-semibold text-[var(--color-text-secondary)] hover:text-indigo-700 dark:hover:text-indigo-300 transition flex-shrink-0 shadow-2xs"
          >
            {phrase.slice(0, 32)}...
          </button>
        ))}
      </div>

      {/* Input Submit form */}
      <form onSubmit={handleSend} className="p-3 bg-[var(--color-bg-secondary)] border-t border-[var(--color-border)] flex items-center gap-2">
        <input
          type="text"
          required
          placeholder="Type your message here..."
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          className="flex-1 bg-[var(--color-bg-tertiary)] pl-4 pr-4 py-3 rounded-2xl text-sm focus:outline-none focus:bg-[var(--color-bg-secondary)] focus:ring-2 focus:ring-indigo-600 border border-transparent focus:border-indigo-200 dark:focus:border-indigo-700 transition text-[var(--color-text-primary)] placeholder:text-[var(--color-text-tertiary)]"
        />

        <button
          type="submit"
          disabled={!inputText.trim() || isSending}
          className="p-3 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 active:scale-95 text-white rounded-2xl shadow-md shadow-indigo-500/25 flex items-center justify-center transition disabled:opacity-50 cursor-pointer"
          title="Send real-time message"
        >
          <Send className="w-5 h-5" />
        </button>
      </form>

    </div>
  );
};