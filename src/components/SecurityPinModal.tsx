import React, { useState } from 'react';
import { ShieldCheck, X, Delete } from 'lucide-react';
import { useApp } from '../context/AppContext';

interface SecurityPinModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (pin: string) => void;
  title?: string;
  description?: string;
}

export const SecurityPinModal: React.FC<SecurityPinModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  title = 'Enter Security PIN',
  description = 'Confirm your 6-digit Security PIN for this sensitive wallet operation.',
}) => {
  const { verifyPin, currentUser, showToast } = useApp();
  const [pin, setPin] = useState<string>('');
  const [error, setError] = useState<boolean>(false);

  if (!isOpen) return null;

  const handleKeyPress = (num: string) => {
    if (pin.length < 6) {
      const nextPin = pin + num;
      setPin(nextPin);
      setError(false);

      if (nextPin.length === 6) {
        // Validate immediately
        if (verifyPin(nextPin)) {
          onSuccess(nextPin);
          setPin('');
          onClose();
        } else {
          setError(true);
          showToast('Incorrect PIN. Try again or check default demo PIN.');
          setTimeout(() => {
            setPin('');
            setError(false);
          }, 800);
        }
      }
    }
  };

  const handleDelete = () => {
    setPin(prev => prev.slice(0, -1));
    setError(false);
  };

  const handleQuickDemoPin = () => {
    const demoPin = currentUser.security_pin || '889900';
    setPin(demoPin);
    if (verifyPin(demoPin)) {
      setTimeout(() => {
        onSuccess(demoPin);
        setPin('');
        onClose();
      }, 300);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="w-full max-w-xs clay-card p-5 shadow-2xl flex flex-col items-center">
        
        {/* Top Icon & Close */}
        <div className="w-full flex items-center justify-between mb-2">
          <div className="clay-icon-box w-8 h-8 bg-emerald-100 flex items-center justify-center text-emerald-800 border border-emerald-300">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <button
            onClick={() => {
              setPin('');
              onClose();
            }}
            className="w-7 h-7 rounded-full bg-white hover:bg-[#FAF7F2] flex items-center justify-center text-[#7A6B5D] border border-[#E8E0D5] cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <h3 className="font-extrabold text-[#2D241E] text-base text-center mt-1">{title}</h3>
        <p className="text-[11px] text-[#7A6B5D] text-center mt-1 max-w-[240px] leading-relaxed font-medium">
          {description}
        </p>

        {/* 6 PIN Indicator Dots */}
        <div className="flex items-center gap-3 my-5">
          {[0, 1, 2, 3, 4, 5].map(idx => (
            <div
              key={idx}
              className={`w-3.5 h-3.5 rounded-full transition-all duration-200 ${
                error
                  ? 'bg-rose-500 scale-110 animate-bounce'
                  : pin.length > idx
                  ? 'bg-emerald-700 shadow-[0_0_8px_rgba(20,83,45,0.4)] scale-110'
                  : 'bg-[#E8E0D5]'
              }`}
            />
          ))}
        </div>

        {/* Quick Demo PIN Helper Badge */}
        <button
          onClick={handleQuickDemoPin}
          className="mb-4 text-[10px] text-emerald-900 bg-emerald-100 hover:bg-emerald-200 px-3 py-1 rounded-full border border-emerald-300 font-extrabold cursor-pointer clay-badge"
        >
          Autofill Demo PIN: <strong className="font-mono">{currentUser.security_pin || '889900'}</strong>
        </button>

        {/* Tactile Keypad */}
        <div className="w-full grid grid-cols-3 gap-2">
          {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map(n => (
            <button
              key={n}
              onClick={() => handleKeyPress(n)}
              className="h-12 rounded-2xl bg-white hover:bg-[#FAF7F2] text-[#2D241E] font-extrabold text-lg shadow-xs border border-[#E8E0D5] active:scale-95 transition-all flex items-center justify-center cursor-pointer"
            >
              {n}
            </button>
          ))}
          <div className="h-12" />
          <button
            onClick={() => handleKeyPress('0')}
            className="h-12 rounded-2xl bg-white hover:bg-[#FAF7F2] text-[#2D241E] font-extrabold text-lg shadow-xs border border-[#E8E0D5] active:scale-95 transition-all flex items-center justify-center cursor-pointer"
          >
            0
          </button>
          <button
            onClick={handleDelete}
            className="h-12 rounded-2xl bg-white hover:bg-rose-50 text-[#7A6B5D] hover:text-rose-700 shadow-xs border border-[#E8E0D5] active:scale-95 transition-all flex items-center justify-center cursor-pointer"
          >
            <Delete className="w-5 h-5" />
          </button>
        </div>

      </div>
    </div>
  );
};
