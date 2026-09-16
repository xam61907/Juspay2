import React from 'react';
import { Home, CreditCard, Wallet, BarChart3, User } from 'lucide-react';
import { useApp } from '../context/AppContext';

export const BottomNavigation: React.FC = () => {
  const { activeScreen, setActiveScreen } = useApp();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 px-3 pb-3 pt-1 pointer-events-none">
      <div className="max-w-md mx-auto pointer-events-auto">
        <div className="fintech-nav-bar px-2 py-1.5 flex items-center justify-around border border-slate-300 shadow-md">
          
          {/* 1. Home */}
          <button
            id="nav-home"
            onClick={() => setActiveScreen('home')}
            className={`flex flex-col items-center justify-center w-14 py-1 rounded-xl transition-all duration-150 cursor-pointer ${
              activeScreen === 'home'
                ? 'text-emerald-800 font-extrabold'
                : 'text-slate-700 hover:text-slate-950 font-semibold'
            }`}
          >
            <div className={`p-1 rounded-lg transition-all ${activeScreen === 'home' ? 'bg-emerald-100 text-emerald-800' : ''}`}>
              <Home className="w-5 h-5 stroke-[2.2]" />
            </div>
            <span className="text-[10px] mt-0.5 tracking-tight">Home</span>
          </button>

          {/* 2. Payment / Earn */}
          <button
            id="nav-payment"
            onClick={() => setActiveScreen('payment')}
            className={`flex flex-col items-center justify-center w-14 py-1 rounded-xl transition-all duration-150 cursor-pointer ${
              activeScreen === 'payment'
                ? 'text-emerald-800 font-extrabold'
                : 'text-slate-700 hover:text-slate-950 font-semibold'
            }`}
          >
            <div className={`p-1 rounded-lg transition-all ${activeScreen === 'payment' ? 'bg-emerald-100 text-emerald-800' : ''}`}>
              <CreditCard className="w-5 h-5 stroke-[2.2]" />
            </div>
            <span className="text-[10px] mt-0.5 tracking-tight">Earn</span>
          </button>

          {/* 3. Center Tool / Wallet */}
          <div className="relative -top-4 flex flex-col items-center">
            <button
              id="nav-center-wallet"
              onClick={() => setActiveScreen('tool')}
              className="w-12 h-12 rounded-xl bg-slate-900 text-white flex items-center justify-center border-2 border-white shadow-md transition-transform active:scale-95 hover:bg-slate-800 cursor-pointer"
              aria-label="Tool and Wallet Management"
            >
              <Wallet className="w-5 h-5 text-emerald-400 stroke-[2.2]" />
            </button>
            <span className="text-[10px] font-extrabold text-slate-900 mt-0.5 tracking-tight">Tools</span>
          </div>

          {/* 4. Statistics */}
          <button
            id="nav-statistics"
            onClick={() => setActiveScreen('statistics')}
            className={`flex flex-col items-center justify-center w-14 py-1 rounded-xl transition-all duration-150 cursor-pointer ${
              activeScreen === 'statistics'
                ? 'text-emerald-800 font-extrabold'
                : 'text-slate-700 hover:text-slate-950 font-semibold'
            }`}
          >
            <div className={`p-1 rounded-lg transition-all ${activeScreen === 'statistics' ? 'bg-emerald-100 text-emerald-800' : ''}`}>
              <BarChart3 className="w-5 h-5 stroke-[2.2]" />
            </div>
            <span className="text-[10px] mt-0.5 tracking-tight">Stats</span>
          </button>

          {/* 5. My Profile */}
          <button
            id="nav-profile"
            onClick={() => setActiveScreen('profile')}
            className={`flex flex-col items-center justify-center w-14 py-1 rounded-xl transition-all duration-150 cursor-pointer ${
              activeScreen === 'profile'
                ? 'text-emerald-800 font-extrabold'
                : 'text-slate-700 hover:text-slate-950 font-semibold'
            }`}
          >
            <div className={`p-1 rounded-lg transition-all ${activeScreen === 'profile' ? 'bg-emerald-100 text-emerald-800' : ''}`}>
              <User className="w-5 h-5 stroke-[2.2]" />
            </div>
            <span className="text-[10px] mt-0.5 tracking-tight">Profile</span>
          </button>

        </div>
      </div>
    </nav>
  );
};
