import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, 
  Lock, 
  Mail, 
  KeyRound, 
  User as UserIcon, 
  Sparkles, 
  CheckCircle2, 
  Users, 
  HelpCircle,
  Copy,
  Zap
} from 'lucide-react';
import { useApp } from '../context/AppContext';

export const AuthScreen: React.FC = () => {
  const { 
    sendEmailOTP, 
    verifyEmailOTP, 
    signupUser, 
    loginWithPin, 
    pendingOTP, 
    showToast,
    stats,
    setIsChatOpen
  } = useApp();

  const [authMode, setAuthMode] = useState<'login' | 'signup'>('login');
  const [loginMethod, setLoginMethod] = useState<'otp' | 'pin'>('otp');

  // Login Form States
  const [loginEmail, setLoginEmail] = useState('');
  const [loginOtp, setLoginOtp] = useState('');
  const [loginPin, setLoginPin] = useState('');
  const [isSendingOtp, setIsSendingOtp] = useState(false);
  const [otpCountdown, setOtpCountdown] = useState(0);

  // Signup Form States
  const [signupName, setSignupName] = useState('');
  const [signupEmail, setSignupEmail] = useState('');
  const [signupPin, setSignupPin] = useState('');
  const [signupConfirmPin, setSignupConfirmPin] = useState('');
  const [signupReferral, setSignupReferral] = useState('JUS7789');
  const [signupOtp, setSignupOtp] = useState('');
  const [isSignupOtpSent, setIsSignupOtpSent] = useState(false);

  // OTP Countdown timer
  useEffect(() => {
    if (otpCountdown > 0) {
      const timer = setTimeout(() => setOtpCountdown(prev => prev - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [otpCountdown]);

  // Handle Send Login OTP
  const handleSendLoginOTP = async () => {
    if (!loginEmail.trim() || !loginEmail.includes('@')) {
      showToast('Please enter a valid email address.');
      return;
    }

    setIsSendingOtp(true);
    const res = await sendEmailOTP(loginEmail.trim());
    setIsSendingOtp(false);

    if (res.success) {
      setOtpCountdown(60);
      if (res.code) {
        setLoginOtp(res.code);
      }
    }
  };

  // Handle Login OTP Submit
  const handleLoginOtpSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!loginEmail.trim()) {
      showToast('Please enter your email.');
      return;
    }
    if (!loginOtp.trim()) {
      showToast('Please enter the 6-digit OTP.');
      return;
    }

    const success = verifyEmailOTP(loginEmail.trim(), loginOtp.trim());
    if (!success) {
      showToast('Invalid OTP. Please check the code.');
    }
  };

  // Handle Login PIN Submit
  const handleLoginPinSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!loginEmail.trim()) {
      showToast('Please enter your email.');
      return;
    }
    if (loginPin.length !== 6) {
      showToast('Security PIN must be exactly 6 digits.');
      return;
    }

    const res = loginWithPin(loginEmail.trim(), loginPin.trim());
    if (!res.success) {
      showToast(res.message);
    }
  };

  // Handle Signup OTP Send
  const handleSendSignupOTP = async () => {
    if (!signupName.trim()) {
      showToast('Please enter your full legal name.');
      return;
    }
    if (!signupEmail.trim() || !signupEmail.includes('@')) {
      showToast('Please enter a valid email address.');
      return;
    }
    if (signupPin.length !== 6 || !/^\d+$/.test(signupPin)) {
      showToast('Security PIN must be exactly 6 numeric digits.');
      return;
    }
    if (signupPin !== signupConfirmPin) {
      showToast('PIN confirmation does not match.');
      return;
    }

    setIsSendingOtp(true);
    const res = await sendEmailOTP(signupEmail.trim());
    setIsSendingOtp(false);

    if (res.success) {
      setIsSignupOtpSent(true);
      setOtpCountdown(60);
      if (res.code) {
        setSignupOtp(res.code);
      }
    }
  };

  // Handle Signup Final Submit
  const handleSignupSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!signupName.trim() || !signupEmail.trim() || !signupPin) {
      showToast('Please complete all required fields.');
      return;
    }
    if (!signupOtp.trim()) {
      showToast('Please enter the 6-digit verification code.');
      return;
    }

    const otpValid = verifyEmailOTP(signupEmail.trim(), signupOtp.trim());
    if (otpValid) {
      signupUser(signupName.trim(), signupEmail.trim(), signupPin.trim(), signupReferral.trim());
    }
  };

  return (
    <div className="min-h-screen py-6 px-4 flex flex-col justify-between max-w-md mx-auto animate-in fade-in duration-200">
      
      {/* Institutional Top Brand Header */}
      <div className="space-y-4">
        
        {/* SSL Badge & Live Peg */}
        <div className="flex items-center justify-between px-1">
          <div className="flex items-center gap-1.5 px-2.5 py-1 bg-slate-900 text-white rounded-lg text-[10px] font-mono font-bold tracking-wider">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>256-BIT SSL VAULT</span>
          </div>
          <div className="flex items-center gap-1 px-2.5 py-1 bg-emerald-50 text-emerald-800 rounded-lg text-[10px] font-bold border border-emerald-200">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse" />
            <span>1 USDT = ₹{stats.realtime_exchange_rate} Peg</span>
          </div>
        </div>

        {/* Brand Banner */}
        <div className="fintech-card-navy p-5 text-center relative overflow-hidden shadow-md">
          <div className="relative z-10 space-y-1.5">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-400 text-slate-950 font-black text-xl flex items-center justify-center mx-auto shadow-md">
              jp
            </div>
            <h1 className="text-xl font-black text-white tracking-tight">
              juspay
            </h1>
            <p className="text-xs text-slate-300 font-medium">
              Institutional Multi-Tier Settlement & Rewards Portal
            </p>
          </div>
          
          {/* Institutional Guarantee Bar */}
          <div className="mt-3 pt-3 border-t border-slate-700/60 flex items-center justify-around text-[10px] text-slate-400 font-medium">
            <span>• 100% Backed Reserve</span>
            <span>• Daily Audits</span>
            <span>• Instant IMPS / UPI</span>
          </div>
        </div>

        {/* Tab Switcher: Sign In vs Sign Up */}
        <div className="p-1 bg-slate-200/80 rounded-xl grid grid-cols-2 gap-1">
          <button
            type="button"
            onClick={() => setAuthMode('login')}
            className={`py-2.5 rounded-lg text-xs font-extrabold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              authMode === 'login'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Lock className="w-3.5 h-3.5" />
            <span>Sign In (Login)</span>
          </button>

          <button
            type="button"
            onClick={() => setAuthMode('signup')}
            className={`py-2.5 rounded-lg text-xs font-extrabold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              authMode === 'signup'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <UserIcon className="w-3.5 h-3.5" />
            <span>Sign Up (Register)</span>
            <span className="px-1.5 py-0.2 bg-amber-500 text-white text-[8px] font-black rounded">
              +₹100
            </span>
          </button>
        </div>

        {/* LOGIN VIEW */}
        {authMode === 'login' && (
          <div className="fintech-card p-5 space-y-4 animate-in zoom-in-98 duration-150">
            
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <div>
                <h3 className="text-sm font-extrabold text-slate-900">Access Your Vault Account</h3>
                <p className="text-[11px] text-slate-500">Sign in using verified email OTP or 6-digit PIN</p>
              </div>

              {/* Login Method Toggle */}
              <div className="flex bg-slate-100 p-0.5 rounded-lg text-[10px] font-bold">
                <button
                  type="button"
                  onClick={() => setLoginMethod('otp')}
                  className={`px-2 py-1 rounded-md transition-all cursor-pointer ${
                    loginMethod === 'otp' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500'
                  }`}
                >
                  Email OTP
                </button>
                <button
                  type="button"
                  onClick={() => setLoginMethod('pin')}
                  className={`px-2 py-1 rounded-md transition-all cursor-pointer ${
                    loginMethod === 'pin' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500'
                  }`}
                >
                  PIN Code
                </button>
              </div>
            </div>

            {/* OTP Login Form */}
            {loginMethod === 'otp' ? (
              <form onSubmit={handleLoginOtpSubmit} className="space-y-3.5">
                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1">
                    Registered Email Address
                  </label>
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="email"
                        value={loginEmail}
                        onChange={(e) => setLoginEmail(e.target.value)}
                        placeholder="e.g., trader@juspay.io"
                        className="w-full fintech-inset pl-9 pr-3 py-2 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={handleSendLoginOTP}
                      disabled={isSendingOtp || otpCountdown > 0}
                      className="fintech-btn-primary px-3 py-2 text-xs font-bold rounded-xl whitespace-nowrap disabled:opacity-50 cursor-pointer shadow-xs"
                    >
                      {otpCountdown > 0 ? `${otpCountdown}s` : 'Get OTP'}
                    </button>
                  </div>
                </div>

                {/* Display dispatched OTP code banner */}
                {pendingOTP && pendingOTP.email === loginEmail.toLowerCase().trim() && (
                  <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-900 flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <Zap className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span>OTP Dispatched: <strong className="font-mono text-sm tracking-wider text-slate-900">{pendingOTP.code}</strong></span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setLoginOtp(pendingOTP.code)}
                      className="text-[10px] font-bold text-emerald-700 hover:underline flex items-center gap-0.5 cursor-pointer"
                    >
                      <Copy className="w-3 h-3" />
                      <span>Auto-Fill</span>
                    </button>
                  </div>
                )}

                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1">
                    6-Digit Verification OTP
                  </label>
                  <div className="relative">
                    <KeyRound className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      maxLength={6}
                      value={loginOtp}
                      onChange={(e) => setLoginOtp(e.target.value.replace(/\D/g, ''))}
                      placeholder="Enter 6-digit OTP (e.g. 123456)"
                      className="w-full fintech-inset pl-9 pr-3 py-2.5 text-sm font-mono tracking-widest font-bold text-slate-900 placeholder:text-slate-400 placeholder:tracking-normal placeholder:font-normal focus:outline-none"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={!loginEmail || !loginOtp}
                  className="w-full py-3 fintech-btn-emerald text-white font-bold text-xs rounded-xl flex items-center justify-center gap-2 cursor-pointer shadow-xs disabled:opacity-50"
                >
                  <Lock className="w-4 h-4" />
                  <span>Verify & Sign In to Vault</span>
                </button>
              </form>
            ) : (
              /* PIN Login Form */
              <form onSubmit={handleLoginPinSubmit} className="space-y-3.5">
                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1">
                    Registered Email Address
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="email"
                      value={loginEmail}
                      onChange={(e) => setLoginEmail(e.target.value)}
                      placeholder="e.g., trader@juspay.io"
                      className="w-full fintech-inset pl-9 pr-3 py-2 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1">
                    6-Digit Security PIN
                  </label>
                  <div className="relative">
                    <KeyRound className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="password"
                      maxLength={6}
                      value={loginPin}
                      onChange={(e) => setLoginPin(e.target.value.replace(/\D/g, ''))}
                      placeholder="Enter 6-digit Security PIN"
                      className="w-full fintech-inset pl-9 pr-3 py-2 text-sm font-mono tracking-widest font-bold text-slate-900 placeholder:text-slate-400 placeholder:tracking-normal placeholder:font-normal focus:outline-none"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={!loginEmail || loginPin.length !== 6}
                  className="w-full py-3 fintech-btn-emerald text-white font-bold text-xs rounded-xl flex items-center justify-center gap-2 cursor-pointer shadow-xs disabled:opacity-50"
                >
                  <Lock className="w-4 h-4" />
                  <span>Authenticate With PIN</span>
                </button>
              </form>
            )}

          </div>
        )}

        {/* SIGNUP VIEW */}
        {authMode === 'signup' && (
          <div className="fintech-card p-5 space-y-4 animate-in zoom-in-98 duration-150">
            
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <div>
                <h3 className="text-sm font-extrabold text-slate-900">Create New Institutional Account</h3>
                <p className="text-[11px] text-slate-500">Includes ₹100 Welcome Bonus & 2-Tier Affiliate Rights</p>
              </div>
              <span className="px-2 py-0.5 bg-emerald-50 text-emerald-800 font-bold text-[10px] rounded border border-emerald-200">
                Instant KYC
              </span>
            </div>

            <form onSubmit={handleSignupSubmit} className="space-y-3">
              
              {/* Full Legal Name */}
              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1">
                  Full Legal Name
                </label>
                <div className="relative">
                  <UserIcon className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={signupName}
                    onChange={(e) => setSignupName(e.target.value)}
                    placeholder="e.g., Arjun Dev"
                    className="w-full fintech-inset pl-9 pr-3 py-2 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none"
                    required
                  />
                </div>
              </div>

              {/* Email Address + OTP trigger */}
              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1">
                  Email Address
                </label>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="email"
                      value={signupEmail}
                      onChange={(e) => setSignupEmail(e.target.value)}
                      placeholder="e.g., yourname@domain.com"
                      className="w-full fintech-inset pl-9 pr-3 py-2 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none"
                      required
                    />
                  </div>
                  <button
                    type="button"
                    onClick={handleSendSignupOTP}
                    disabled={isSendingOtp || otpCountdown > 0 || !signupEmail.includes('@')}
                    className="fintech-btn-primary px-3 py-2 text-xs font-bold rounded-xl whitespace-nowrap disabled:opacity-50 cursor-pointer shadow-xs"
                  >
                    {otpCountdown > 0 ? `${otpCountdown}s` : 'Send OTP'}
                  </button>
                </div>
              </div>

              {/* Security PIN + Confirm PIN */}
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1">
                    Create 6-Digit PIN
                  </label>
                  <input
                    type="password"
                    maxLength={6}
                    value={signupPin}
                    onChange={(e) => setSignupPin(e.target.value.replace(/\D/g, ''))}
                    placeholder="6 digits"
                    className="w-full fintech-inset px-3 py-2 text-xs font-mono font-bold text-slate-900 placeholder:text-slate-400 focus:outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1">
                    Confirm PIN
                  </label>
                  <input
                    type="password"
                    maxLength={6}
                    value={signupConfirmPin}
                    onChange={(e) => setSignupConfirmPin(e.target.value.replace(/\D/g, ''))}
                    placeholder="Repeat PIN"
                    className="w-full fintech-inset px-3 py-2 text-xs font-mono font-bold text-slate-900 placeholder:text-slate-400 focus:outline-none"
                    required
                  />
                </div>
              </div>

              {/* Sponsor Referral Code */}
              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1 flex items-center justify-between">
                  <span>Sponsor Referral Code (Optional)</span>
                  <span className="text-[10px] text-emerald-700 font-semibold">Tier 1: 5% | Tier 2: 2.5%</span>
                </label>
                <div className="relative">
                  <Users className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={signupReferral}
                    onChange={(e) => setSignupReferral(e.target.value.toUpperCase())}
                    placeholder="e.g., JUS7789 or ROHIT99"
                    className="w-full fintech-inset pl-9 pr-3 py-2 text-xs font-mono font-bold text-slate-900 placeholder:text-slate-400 focus:outline-none"
                  />
                </div>
              </div>

              {/* Dispatched OTP notification */}
              {pendingOTP && pendingOTP.email === signupEmail.toLowerCase().trim() && (
                <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-900 flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <Zap className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Signup OTP: <strong className="font-mono text-sm tracking-wider text-slate-900">{pendingOTP.code}</strong></span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setSignupOtp(pendingOTP.code)}
                    className="text-[10px] font-bold text-emerald-700 hover:underline flex items-center gap-0.5 cursor-pointer"
                  >
                    <Copy className="w-3 h-3" />
                    <span>Auto-Fill</span>
                  </button>
                </div>
              )}

              {/* OTP Input */}
              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1">
                  6-Digit Email Verification Code
                </label>
                <input
                  type="text"
                  maxLength={6}
                  value={signupOtp}
                  onChange={(e) => setSignupOtp(e.target.value.replace(/\D/g, ''))}
                  placeholder="Enter OTP received (or use 123456)"
                  className="w-full fintech-inset px-3 py-2.5 text-sm font-mono tracking-widest font-bold text-slate-900 placeholder:text-slate-400 placeholder:font-normal placeholder:tracking-normal focus:outline-none"
                  required
                />
              </div>

              {/* Bonus Announcement */}
              <div className="p-2.5 bg-amber-50 border border-amber-200 rounded-xl text-amber-950 flex items-center gap-2 text-xs">
                <Sparkles className="w-4 h-4 text-amber-600 shrink-0" />
                <span>
                  <strong>Welcome Benefit:</strong> ₹100 registration bonus will be instantly deposited into your available vault.
                </span>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={!signupName || !signupEmail || signupPin.length !== 6 || !signupOtp}
                className="w-full py-3 fintech-btn-emerald text-white font-bold text-xs rounded-xl flex items-center justify-center gap-2 cursor-pointer shadow-xs disabled:opacity-50"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Complete Registration & Claim ₹100</span>
              </button>

            </form>

          </div>
        )}

      </div>

      {/* Institutional Security Footer */}
      <div className="mt-6 pt-4 border-t border-slate-200/80 text-center space-y-2">
        <div className="flex items-center justify-center gap-4 text-xs text-slate-500">
          <button
            type="button"
            onClick={() => setIsChatOpen(true)}
            className="flex items-center gap-1 hover:text-slate-900 cursor-pointer font-medium"
          >
            <HelpCircle className="w-3.5 h-3.5 text-emerald-600" />
            <span>24/7 Priority Desk</span>
          </button>
          <span>•</span>
          <span className="flex items-center gap-1 font-medium">
            <Lock className="w-3.5 h-3.5 text-slate-400" />
            <span>ISO 27001 Certified</span>
          </span>
        </div>
        <p className="text-[10px] text-slate-400">
          © 2026 juspay. All settlements guaranteed under automated multi-tier smart contracts.
        </p>
      </div>

    </div>
  );
};
