import React, { useState } from 'react';
import { 
  ArrowLeft, 
  Coins, 
  Copy, 
  Check, 
  Upload, 
  ShieldCheck, 
  Info, 
  ArrowRight, 
  Clock,
  Sparkles,
  FileText,
  Lock,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { QRCodeDisplay } from '../components/QRCodeDisplay';

export const DepositScreen: React.FC = () => {
  const { stats, submitDeposit, setActiveScreen, showToast } = useApp();

  const [network, setNetwork] = useState<'TRC20' | 'BSC'>('TRC20');
  const [usdtAmount, setUsdtAmount] = useState<string>('100');
  const [txHash, setTxHash] = useState<string>('');
  const [copiedAddress, setCopiedAddress] = useState(false);
  const [screenshotPreview, setScreenshotPreview] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);

  // Exact Addresses as requested
  const receivingAddress = network === 'TRC20' 
    ? 'TXrxPjQvzKef7P3W91Uc1yRoxwKbwQvHmp' 
    : '0x0A09a10A4026afd992b50C74afa8f73B4dF338b3';

  // Calculator logic
  const parsedUsdt = parseFloat(usdtAmount) || 0;
  const inrValue = Number((parsedUsdt * stats.realtime_exchange_rate).toFixed(2));
  const estimatedBonus = Number((inrValue * 0.02).toFixed(2)); // 2% deposit welcome booster
  const totalReceivable = Number((inrValue + estimatedBonus).toFixed(2));

  const handleCopyAddress = () => {
    navigator.clipboard.writeText(receivingAddress);
    setCopiedAddress(true);
    showToast('Official Reserve Address copied!');
    setTimeout(() => setCopiedAddress(false), 2000);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFileName(file.name);
      const reader = new FileReader();
      reader.onloadend = () => {
        setScreenshotPreview(reader.result as string);
        showToast('Payment receipt attached.');
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmitDeposit = (e: React.FormEvent) => {
    e.preventDefault();
    if (parsedUsdt <= 0) {
      showToast('Please enter a valid USDT deposit amount.');
      return;
    }

    const res = submitDeposit(
      parsedUsdt,
      network,
      txHash.trim() || undefined,
      screenshotPreview || undefined
    );

    if (res.success) {
      setActiveScreen('home');
    }
  };

  return (
    <div className="space-y-4 pb-24 animate-in fade-in duration-150">
      
      {/* Header */}
      <div className="flex items-center gap-3 px-1">
        <button
          onClick={() => setActiveScreen('home')}
          className="w-9 h-9 rounded-xl bg-white flex items-center justify-center text-slate-700 shadow-xs border border-slate-200 active:scale-95 transition-all cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
        </button>
        <div>
          <h2 className="text-base font-extrabold text-slate-900 flex items-center gap-1.5">
            <span>Institutional USDT Deposit</span>
          </h2>
          <p className="text-[11px] text-slate-500 font-medium">Guaranteed Conversion at 1 USDT = ₹{stats.realtime_exchange_rate} INR</p>
        </div>
      </div>

      {/* Security SLA Callout */}
      <div className="fintech-card-soft p-3 flex items-center gap-3 border-slate-200">
        <div className="w-8 h-8 rounded-lg bg-emerald-600 text-white flex items-center justify-center shrink-0">
          <ShieldCheck className="w-4 h-4" />
        </div>
        <div className="text-[11px] text-slate-600 leading-tight">
          <strong className="text-slate-900 block font-semibold">Multi-Sig Escrow Reserve Protection</strong>
          Funds are automatically verified and credited to your INR balance within 5–15 minutes.
        </div>
      </div>

      {/* 1. Network Selector */}
      <div className="fintech-card p-4 space-y-3">
        <label className="text-xs font-bold text-slate-800 flex items-center justify-between">
          <span>Select Transfer Blockchain Network</span>
          <span className="text-[10px] text-slate-500">TRC20 Recommended for low gas</span>
        </label>
        
        <div className="grid grid-cols-2 gap-2.5">
          <button
            type="button"
            onClick={() => setNetwork('TRC20')}
            className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
              network === 'TRC20'
                ? 'bg-emerald-50/70 border-emerald-500 text-emerald-950 ring-1 ring-emerald-500'
                : 'bg-white border-slate-200 text-slate-700 hover:border-slate-300'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="font-bold text-xs">TRON (TRC20)</span>
              {network === 'TRC20' && <CheckCircle2 className="w-4 h-4 text-emerald-600" />}
            </div>
            <span className="text-[10px] text-slate-500 mt-1">SLA: ~1-3 min confirmation</span>
          </button>

          <button
            type="button"
            onClick={() => setNetwork('BSC')}
            className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
              network === 'BSC'
                ? 'bg-emerald-50/70 border-emerald-500 text-emerald-950 ring-1 ring-emerald-500'
                : 'bg-white border-slate-200 text-slate-700 hover:border-slate-300'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="font-bold text-xs">BNB Smart Chain (BEP20)</span>
              {network === 'BSC' && <CheckCircle2 className="w-4 h-4 text-emerald-600" />}
            </div>
            <span className="text-[10px] text-slate-500 mt-1">SLA: ~2-4 min confirmation</span>
          </button>
        </div>
      </div>

      {/* 2. Official Receiving Address & QR Code */}
      <div className="fintech-card p-4 space-y-3.5">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-slate-800">Official Custodial Vault Address</span>
          <span className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded font-mono font-bold">
            {network}
          </span>
        </div>

        {/* QR Code Center Display */}
        <div className="flex justify-center py-2">
          <div className="p-3 bg-white rounded-xl border border-slate-200 shadow-xs">
            <QRCodeDisplay value={receivingAddress} size={150} network={network} />
          </div>
        </div>

        {/* Address Input + Copy */}
        <div className="flex items-center gap-2">
          <div className="flex-1 fintech-inset px-3 py-2 text-xs font-mono text-slate-800 truncate select-all">
            {receivingAddress}
          </div>
          <button
            type="button"
            onClick={handleCopyAddress}
            className={`px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center gap-1 transition-all cursor-pointer ${
              copiedAddress 
                ? 'bg-emerald-600 text-white' 
                : 'bg-slate-900 text-white hover:bg-slate-800'
            }`}
          >
            {copiedAddress ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copiedAddress ? 'Copied' : 'Copy'}</span>
          </button>
        </div>
      </div>

      {/* 3. Deposit Amount & Live Peg Calculator */}
      <div className="fintech-card p-4 space-y-3">
        <label className="text-xs font-bold text-slate-800 block">
          Deposit Amount (USDT)
        </label>
        
        <div className="relative">
          <input
            type="number"
            value={usdtAmount}
            onChange={(e) => setUsdtAmount(e.target.value)}
            placeholder="e.g. 100"
            min="10"
            step="1"
            className="w-full fintech-inset px-3.5 py-2.5 text-base font-bold font-mono text-slate-900 placeholder:text-slate-400 focus:outline-none"
          />
          <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-500 font-mono">
            USDT
          </span>
        </div>

        {/* Quick Amount Pills */}
        <div className="grid grid-cols-4 gap-1.5">
          {['50', '100', '500', '1000'].map((preset) => (
            <button
              key={preset}
              type="button"
              onClick={() => setUsdtAmount(preset)}
              className={`py-1.5 rounded-lg text-xs font-bold font-mono transition-all cursor-pointer ${
                usdtAmount === preset
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              {preset} USDT
            </button>
          ))}
        </div>

        {/* Breakdown Calculation */}
        <div className="bg-slate-50 rounded-xl p-3 border border-slate-200 space-y-1.5 text-xs text-slate-600">
          <div className="flex justify-between">
            <span>Guaranteed Conversion (1 USDT = ₹{stats.realtime_exchange_rate}):</span>
            <strong className="font-mono text-slate-900">₹{inrValue.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</strong>
          </div>
          <div className="flex justify-between text-emerald-700">
            <span>2% Welcome Liquidity Bonus:</span>
            <strong className="font-mono">+₹{estimatedBonus.toFixed(2)}</strong>
          </div>
          <div className="pt-1.5 border-t border-slate-200 flex justify-between font-bold text-slate-900 text-sm">
            <span>Total Credit to INR Balance:</span>
            <span className="font-mono text-emerald-700">₹{totalReceivable.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
          </div>
        </div>
      </div>

      {/* 4. Verification Form: Tx Hash & Proof Upload */}
      <form onSubmit={handleSubmitDeposit} className="fintech-card p-4 space-y-3.5">
        <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wide">
          Step 2: Submit Proof of Transfer
        </h3>

        <div>
          <label className="text-xs font-semibold text-slate-700 block mb-1">
            Blockchain Transaction ID / Hash (TxID)
          </label>
          <input
            type="text"
            value={txHash}
            onChange={(e) => setTxHash(e.target.value)}
            placeholder="Paste 64-character transaction hash here..."
            className="w-full fintech-inset px-3 py-2 text-xs font-mono text-slate-900 placeholder:text-slate-400 focus:outline-none"
          />
        </div>

        <div>
          <label className="text-xs font-semibold text-slate-700 block mb-1">
            Upload Transfer Screenshot / Receipt
          </label>
          <label className="fintech-inset p-3 flex flex-col items-center justify-center border-dashed border-slate-300 hover:border-slate-400 cursor-pointer transition-all">
            <Upload className="w-5 h-5 text-slate-500 mb-1" />
            <span className="text-xs font-semibold text-slate-700">
              {fileName || 'Tap to select image from device'}
            </span>
            <span className="text-[10px] text-slate-400">Supports JPG, PNG (Max 10MB)</span>
            <input
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="hidden"
            />
          </label>

          {screenshotPreview && (
            <div className="mt-2 p-1.5 bg-slate-100 rounded-lg border border-slate-200 flex items-center justify-between">
              <span className="text-xs text-slate-600 truncate">{fileName}</span>
              <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-1.5 py-0.5 rounded">
                Attached
              </span>
            </div>
          )}
        </div>

        <button
          type="submit"
          className="w-full fintech-btn-emerald py-3 rounded-xl text-white font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
        >
          <ShieldCheck className="w-4 h-4" />
          <span>Confirm & Submit Deposit for Verification</span>
        </button>

      </form>

    </div>
  );
};
