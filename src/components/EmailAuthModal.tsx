import React, { useState, useEffect } from 'react';
import { Mail, Shield, CheckCircle, ArrowRight, RefreshCw, X, KeyRound } from 'lucide-react';
import { useApp } from '../context/AppContext';

interface EmailAuthModalProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export const EmailAuthModal: React.FC<EmailAuthModalProps> = ({ isOpen, onClose }) => {
  const { isAuthModalOpen, setIsAuthModalOpen, sendEmailOTP, verifyEmailOTP, pendingOTP, showToast } = useApp();
  const [step, setStep] = useState<'email' | 'otp'>('email');
  const [email, setEmail] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [countdown, setCountdown] = useState(60);
  const [isSending, setIsSending] = useState(false);
  const [simulatedCode, setSimulatedCode] = useState<string | null>(null);

  const showModal = isOpen !== undefined ? isOpen : isAuthModalOpen;
  const handleClose = onClose || (() => setIsAuthModalOpen(false));

  // Countdown timer for resend
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (step === 'otp' && countdown > 0) {
      timer = setInterval(() => {
        setCountdown(prev => prev - 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [step, countdown]);

  if (!showModal) return null;

  const handleSendOTP = async () => {
    if (!email || !email.includes('@')) {
      showToast('Please enter a valid email address.');
      return;
    }
    setIsSending(true);
    const res = await sendEmailOTP(email);
    setIsSending(false);

    if (res.success && res.code) {
      setSimulatedCode(res.code);
      setStep('otp');
      setCountdown(60);
      showToast(res.message);
    } else {
      showToast(res.message);
    }
  };

  const handleVerify = () => {
    if (otpCode.length !== 6) {
      showToast('Please enter all 6 digits of the OTP.');
      return;
    }
    const ok = verifyEmailOTP(email, otpCode);
    if (ok) {
      setStep('email');
      setEmail('');
      setOtpCode('');
      setSimulatedCode(null);
    }
  };

  const handleResend = async () => {
    if (countdown > 0) return;
    await handleSendOTP();
  };

  const quickFillUser = () => {
    setEmail('xmartinjoker@gmail.com');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="w-full max-w-sm clay-card p-6 shadow-2xl flex flex-col relative">
        
        {/* Close Button */}
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white hover:bg-[#FAF7F2] flex items-center justify-center text-[#7A6B5D] transition-colors border border-[#E8E0D5] cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Brand Icon */}
        <div className="clay-icon-box w-12 h-12 bg-linear-to-tr from-emerald-700 to-teal-800 text-white flex items-center justify-center mb-3">
          <Mail className="w-6 h-6" />
        </div>

        <h2 className="text-lg font-extrabold text-[#2D241E]">
          {step === 'email' ? 'Email OTP Authentication' : 'Verify One-Time Passcode'}
        </h2>
        <p className="text-xs text-[#7A6B5D] mt-1 leading-relaxed">
          {step === 'email'
            ? 'No passwords or SMS needed. Enter your email to receive an instant 6-digit passcode.'
            : `We sent a 6-digit code to ${email}. Valid for 10 minutes.`}
        </p>

        {/* Step 1: Email Input */}
        {step === 'email' && (
          <div className="mt-5 space-y-4">
            <div>
              <label className="block text-xs font-semibold text-[#4A3E35] mb-1">
                Email Address
              </label>
              <div className="relative">
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full clay-inset px-3.5 py-2.5 text-xs text-[#2D241E] focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </div>

            {/* Quick Demo Pre-fill */}
            <div>
              <button
                type="button"
                onClick={quickFillUser}
                className="w-full py-1.5 px-3 bg-white hover:bg-[#FAF7F2] text-[#4A3E35] hover:text-emerald-800 border border-[#E8E0D5] rounded-xl text-[11px] font-bold transition-colors flex items-center justify-center gap-1 cursor-pointer"
              >
                <span>Use current email ({'xmartinjoker@gmail.com'})</span>
              </button>
            </div>

            <button
              onClick={handleSendOTP}
              disabled={isSending}
              className="clay-btn-emerald w-full py-3 text-white font-bold text-xs rounded-full flex items-center justify-center gap-2 active:scale-98 transition-all cursor-pointer disabled:opacity-50"
            >
              {isSending ? (
                <RefreshCw className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  <span>Send 6-Digit OTP</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        )}

        {/* Step 2: 6-Digit OTP Verification */}
        {step === 'otp' && (
          <div className="mt-5 space-y-4">
            {/* Simulated Email Incoming Delivery Notification Toast in Modal */}
            {simulatedCode && (
              <div className="p-3 clay-card-emerald-soft border-emerald-300 rounded-2xl flex items-center justify-between">
                <div>
                  <span className="text-[10px] uppercase font-bold text-emerald-800 tracking-wider">Simulated Inbox</span>
                  <p className="text-xs text-[#2D241E] font-semibold">Your Passcode: <span className="font-mono text-emerald-800 text-sm font-extrabold">{simulatedCode}</span></p>
                </div>
                <button
                  onClick={() => setOtpCode(simulatedCode)}
                  className="px-2.5 py-1 clay-btn-emerald text-white text-[11px] font-bold rounded-lg shadow-xs cursor-pointer active:scale-95"
                >
                  Autofill
                </button>
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-[#4A3E35] mb-2">
                Enter 6-Digit Passcode
              </label>
              <input
                type="text"
                maxLength={6}
                value={otpCode}
                onChange={e => setOtpCode(e.target.value.replace(/\D/g, ''))}
                placeholder="• • • • • •"
                className="w-full text-center tracking-[12px] font-mono text-xl font-bold clay-inset py-3 text-[#2D241E] focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            {/* Resend & Timer */}
            <div className="flex items-center justify-between text-xs text-[#7A6B5D]">
              <button
                type="button"
                onClick={() => setStep('email')}
                className="text-[#7A6B5D] hover:text-[#2D241E] underline cursor-pointer"
              >
                Change Email
              </button>

              {countdown > 0 ? (
                <span className="text-[#8C7A6B] font-medium">
                  Resend in <strong className="text-[#2D241E] font-mono">{countdown}s</strong>
                </span>
              ) : (
                <button
                  type="button"
                  onClick={handleResend}
                  className="text-emerald-800 font-bold hover:underline cursor-pointer"
                >
                  Resend Code
                </button>
              )}
            </div>

            <button
              onClick={handleVerify}
              className="clay-btn-emerald w-full py-3 text-white font-bold text-xs rounded-full flex items-center justify-center gap-2 active:scale-98 transition-all cursor-pointer"
            >
              <CheckCircle className="w-4 h-4" />
              <span>Verify & Continue</span>
            </button>
          </div>
        )}

      </div>
    </div>
  );
};
