import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Phone, Mail, User as UserIcon, MapPin, Sparkles, X, Check, Shield, ArrowRight, Building2, Search } from 'lucide-react';
import { LOCATION_SUGGESTIONS } from '../hooks/useGeolocation';

export const AuthModal: React.FC<{ isOpen: boolean; onClose: () => void }> = ({ isOpen, onClose }) => {
  const { customLoginOrSignup } = useAuth();
  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [authType, setAuthType] = useState<'phone' | 'email'>('phone');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [role, setRole] = useState<'room_owner' | 'room_seeker'>('room_seeker');
  const [city, setCity] = useState('Delhi');
  
  // OTP simulation states
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  if (!isOpen) return null;

  const handleSendOtp = (e: React.FormEvent) => {
    e.preventDefault();
    if (!phone || phone.length < 9) {
      setError('Please enter a valid 10-digit mobile number');
      return;
    }
    setError(null);
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setOtpSent(true);
    }, 700);
  };

  const handleVerifyOtpOrSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (authType === 'phone' && otpSent && otp !== '123456') {
        throw new Error('Invalid OTP. Please enter 123456 for demo verification.');
      }

      const identifier = authType === 'phone' ? phone : email;
      if (!identifier) throw new Error('Please fill in your credentials');

      await customLoginOrSignup(identifier, name || (mode === 'signin' ? 'Welcome User' : ''), role, city);
      
      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
        setLoading(false);
        onClose();
      }, 700);
    } catch (err: any) {
      setError(err.message || 'Authentication failed');
      setLoading(false);
    }
  };

  const resetForm = () => {
    setOtpSent(false);
    setError(null);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/80 dark:bg-slate-950/90 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-2xl max-w-md w-full overflow-hidden border border-slate-100 dark:border-slate-700 relative">
        
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 p-2 rounded-full bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-600 dark:text-slate-300 transition"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="bg-gradient-to-br from-indigo-600 via-indigo-700 to-purple-800 p-6 text-white text-center relative overflow-hidden">
          <div className="absolute -right-10 -bottom-10 w-32 h-32 bg-white/10 rounded-full blur-xl"></div>
          <div className="absolute -left-10 -top-10 w-32 h-32 bg-purple-400/20 rounded-full blur-xl"></div>
          
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-white/15 backdrop-blur-md mb-3 text-amber-300 shadow-inner">
            <Shield className="w-6 h-6" />
          </div>
          
          <h3 className="text-xl font-bold tracking-tight">
            {mode === 'signin' ? 'Welcome Back to Roomify' : 'Join Roomify Community'}
          </h3>
          <p className="text-xs text-indigo-100 mt-1">
            {mode === 'signin' ? 'Login with verified Phone OTP or Email' : 'List your rooms or find your perfect space in seconds'}
          </p>

          {/* Type Tab toggle */}
          <div className="flex bg-white/10 p-1 rounded-xl mt-4 max-w-xs mx-auto backdrop-blur-sm">
            <button
              onClick={() => { setAuthType('phone'); resetForm(); }}
              className={`flex-1 py-1.5 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition ${
                authType === 'phone' ? 'bg-white text-indigo-700 shadow-sm font-bold' : 'text-indigo-100 hover:text-white'
              }`}
            >
              <Phone className="w-3.5 h-3.5" /> Phone OTP
            </button>
            <button
              onClick={() => { setAuthType('email'); resetForm(); }}
              className={`flex-1 py-1.5 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition ${
                authType === 'email' ? 'bg-white text-indigo-700 shadow-sm font-bold' : 'text-indigo-100 hover:text-white'
              }`}
            >
              <Mail className="w-3.5 h-3.5" /> Email
            </button>
          </div>
        </div>

        {/* Form Body */}
        <div className="p-6 dark:text-slate-200">
          
          {success && (
            <div className="bg-emerald-50 dark:bg-emerald-900/40 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 p-4 rounded-2xl flex items-center gap-3 animate-bounce mb-4">
              <div className="w-8 h-8 bg-emerald-500 text-white rounded-full flex items-center justify-center flex-shrink-0">
                <Check className="w-5 h-5" />
              </div>
              <div className="text-sm font-semibold">Authentication Successful! Welcome on board.</div>
            </div>
          )}

          {error && (
            <div className="bg-rose-50 dark:bg-rose-900/30 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 p-3 rounded-xl text-xs font-medium mb-4 flex items-center gap-2">
              <span className="font-bold flex-shrink-0">⚠️ Error:</span> {error}
            </div>
          )}

          <form onSubmit={authType === 'phone' && !otpSent ? handleSendOtp : handleVerifyOtpOrSubmit} className="space-y-4">
            
            {/* Mode specific fields for Signup */}
            {mode === 'signup' && (
              <>
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Your Full Name</label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400">
                      <UserIcon className="w-4 h-4" />
                    </span>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Ramesh Sharma"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-700/50 border border-slate-200 dark:border-slate-600 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white dark:focus:bg-slate-700 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">I am a...</label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setRole('room_seeker')}
                      className={`p-3 rounded-xl border text-left flex flex-col justify-between transition cursor-pointer ${
                        role === 'room_seeker' 
                          ? 'border-indigo-600 bg-indigo-50/70 dark:bg-indigo-900/40 text-indigo-900 dark:text-indigo-200 shadow-sm ring-2 ring-indigo-600/20' 
                          : 'border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700/50 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-400'
                      }`}
                    >
                      <div className="flex items-center justify-between w-full mb-1">
                        <Search className={`w-4 h-4 ${role === 'room_seeker' ? 'text-indigo-600' : 'text-slate-400'}`} />
                        {role === 'room_seeker' && <span className="w-2 h-2 rounded-full bg-indigo-600"></span>}
                      </div>
                      <span className="text-xs font-bold">Room Seeker</span>
                      <span className="text-[10px] text-slate-500 dark:text-slate-400">Looking to rent</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setRole('room_owner')}
                      className={`p-3 rounded-xl border text-left flex flex-col justify-between transition cursor-pointer ${
                        role === 'room_owner' 
                          ? 'border-amber-600 bg-amber-50/70 dark:bg-amber-900/30 text-amber-900 dark:text-amber-200 shadow-sm ring-2 ring-amber-600/20' 
                          : 'border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700/50 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-400'
                      }`}
                    >
                      <div className="flex items-center justify-between w-full mb-1">
                        <Building2 className={`w-4 h-4 ${role === 'room_owner' ? 'text-amber-600' : 'text-slate-400'}`} />
                        {role === 'room_owner' && <span className="w-2 h-2 rounded-full bg-amber-600"></span>}
                      </div>
                      <span className="text-xs font-bold">Room Owner</span>
                      <span className="text-[10px] text-slate-500 dark:text-slate-400">List my rooms</span>
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Select Base City</label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400 pointer-events-none">
                      <MapPin className="w-4 h-4" />
                    </span>
                    <input
                      list="auth-location-suggestions"
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      placeholder="e.g. Bhabua, Kaimur, Bihar"
                      className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-700/50 border border-slate-200 dark:border-slate-600 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium text-slate-900 dark:text-slate-100"
                    />
                    <datalist id="auth-location-suggestions">
                      {LOCATION_SUGGESTIONS.map(place => <option key={place} value={place} />)}
                    </datalist>
                  </div>
                </div>
              </>
            )}

            {/* Credential inputs */}
            {authType === 'phone' ? (
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Mobile Number</label>
                <div className="flex rounded-xl overflow-hidden border border-slate-200 dark:border-slate-600 focus-within:ring-2 focus-within:ring-indigo-500">
                  <span className="bg-slate-100 dark:bg-slate-700 px-3 py-2.5 text-xs font-bold text-slate-600 dark:text-slate-300 flex items-center border-r border-slate-200 dark:border-slate-600">
                    🇮🇳 +91
                  </span>
                  <input
                    type="tel"
                    disabled={otpSent}
                    required
                    placeholder="98765 43210"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-700/50 text-sm focus:outline-none focus:bg-white dark:focus:bg-slate-700 font-bold tracking-wide disabled:bg-slate-100 dark:disabled:bg-slate-700 disabled:text-slate-500 dark:disabled:text-slate-400 text-slate-900 dark:text-slate-100"
                  />
                </div>
                {!otpSent && (
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 flex items-center gap-1">
                    <Sparkles className="w-3 h-3 text-amber-500" /> Enter any number to receive simulated OTP
                  </p>
                )}
              </div>
            ) : (
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Email Address</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400">
                    <Mail className="w-4 h-4" />
                  </span>
                  <input
                    type="email"
                    required
                    placeholder="yourname@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-700/50 border border-slate-200 dark:border-slate-600 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white dark:focus:bg-slate-700 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500"
                  />
                </div>
              </div>
            )}

            {/* OTP Verification step */}
            {authType === 'phone' && otpSent && (
              <div className="p-4 bg-indigo-50/60 dark:bg-indigo-900/30 rounded-2xl border border-indigo-100 dark:border-indigo-800 animate-fadeIn space-y-2">
                <div className="flex justify-between items-center">
                  <label className="block text-xs font-bold text-indigo-950 dark:text-indigo-200">Enter 6-digit OTP</label>
                  <button
                    type="button"
                    onClick={() => { setOtpSent(false); setOtp(''); }}
                    className="text-[11px] font-bold text-indigo-600 dark:text-indigo-400 hover:underline"
                  >
                    Change phone
                  </button>
                </div>
                <input
                  type="text"
                  maxLength={6}
                  required
                  autoFocus
                  placeholder="123456"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  className="w-full text-center tracking-widest font-mono text-xl py-2.5 bg-white dark:bg-slate-700 border border-indigo-200 dark:border-indigo-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-600 shadow-inner font-bold text-indigo-900 dark:text-indigo-200"
                />
                <div className="text-[11px] text-slate-600 dark:text-slate-400 flex items-center justify-between pt-1">
                  <span>Demo Tip: Enter <strong className="text-indigo-700 dark:text-indigo-300 font-mono bg-indigo-100 dark:bg-indigo-800 px-1 py-0.5 rounded">123456</strong></span>
                  <span className="text-emerald-600 dark:text-emerald-400 font-medium">✓ Auto-filled</span>
                </div>
              </div>
            )}

            {/* Submit button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 active:scale-[0.99] text-white font-bold text-sm rounded-xl shadow-lg shadow-indigo-500/25 flex items-center justify-center gap-2 transition disabled:opacity-70 cursor-pointer"
            >
              {loading ? (
                <>
                  <span className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></span>
                  <span>Verifying Credentials...</span>
                </>
              ) : authType === 'phone' && !otpSent ? (
                <>
                  <span>Send OTP via Firebase OTP</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              ) : (
                <>
                  <span>{mode === 'signin' ? 'Verify & Sign In' : 'Create Account & Continue'}</span>
                  <Sparkles className="w-4 h-4" />
                </>
              )}
            </button>

          </form>

          {/* Switch Modes Link */}
          <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-700 text-center">
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {mode === 'signin' ? "Don't have an account?" : "Already registered?"}
              <button
                type="button"
                onClick={() => { setMode(mode === 'signin' ? 'signup' : 'signin'); resetForm(); }}
                className="font-bold text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 ml-1.5 focus:outline-none hover:underline"
              >
                {mode === 'signin' ? 'Create new account' : 'Sign in to existing'}
              </button>
            </p>
          </div>

        </div>

      </div>
    </div>
  );
};