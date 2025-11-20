'use client';

import React, { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence, useSpring, useMotionValue } from 'framer-motion';
import {
  Terminal, Shield, Activity, Database, ArrowRight,
  Lock, ChevronDown, ChevronUp, Bot, CheckCircle, XCircle, Globe, Briefcase, Users,
  CreditCard, Wallet, Copy, Check, AlertTriangle, X, Flame, Zap, ShieldCheck, RefreshCw,
  Quote, HelpCircle, MessageCircle, Eye
} from 'lucide-react';

// --- DATA ---
const SCARCITY = {
  total_spots: 100,
  taken: 87,
  price: 99
};

const VALUE_STACK = [
  { name: "The Wolf Pack (4 Agents)", value: "$5,000/yr" },
  { name: "PnL Guardian Risk Engine", value: "$1,200/yr" },
  { name: "Automated Audit Reports", value: "$997/yr" },
  { name: "Founders' Circle Status", value: "Priceless" },
  { name: "Concierge 1-1 Support", value: "$497/yr" },
];

const TESTIMONIALS = [
  {
    id: 1,
    name: "Hùng (The Whale)",
    role: "Pro Trader ($5M Vol)",
    text: "I used to lose about $2k/month in hidden spread and fees. Apex paid for itself in the first 6 hours. The 'Guardian' agent saved me from a liquidation wick last week.",
    impact: "+$2,100 Saved/Mo"
  },
  {
    id: 2,
    name: "Linh (KOL)",
    role: "Community Leader",
    text: "Finally, a tool that proves I'm not dumping on my community. The transparency reports build massive trust. My ref volume doubled because people trust the data.",
    impact: "2x Referral Trust"
  },
  {
    id: 3,
    name: "Nam",
    role: "Boutique Fund Manager",
    text: "The automated audit is a game changer. I used to spend 4 hours a week on Excel. Now 'The Auditor' does it in 3 seconds. Institutional grade indeed.",
    impact: "16hrs Saved/Mo"
  }
];

const FAQS = [
  {
    q: "Is my API Key safe?",
    a: "Absolutely. We use AES-256 encryption (Bank Grade). We only require 'Read-Only' permissions. We cannot withdraw your funds. You remain in full custody."
  },
  {
    q: "Why is there a $99 fee?",
    a: "This is a commitment fee to filter out noise. We provide high-intensity server resources for the Agents (Wolf Pack). We only want serious traders in the Founders' Circle."
  },
  {
    q: "What if I don't make my money back?",
    a: "We offer a 30-Day 'Grand Slam' Guarantee. If Apex doesn't save you more than $99 in fees within 30 days, we will refund you 100%. No questions asked."
  },
  {
    q: "Does this work for Spot trading?",
    a: "Yes, but it is optimized for Futures/Derivatives where fee impact is highest. The Wolf Pack works best on Binance, Bybit, and OKX."
  }
];

// --- HELPERS ---

function AnimatedNumber({ value, prefix = '', suffix = '', className }: { value: number, prefix?: string, suffix?: string, className?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const motionValue = useMotionValue(0);
  const springValue = useSpring(motionValue, { damping: 30, stiffness: 100 });

  useEffect(() => {
    motionValue.set(value);
  }, [value, motionValue]);

  useEffect(() => {
    return springValue.on("change", (latest) => {
      if (ref.current) {
        ref.current.textContent = prefix + Math.round(latest).toLocaleString() + suffix;
      }
    });
  }, [springValue, prefix, suffix]);

  return <span className={className} ref={ref} />;
}

// --- COMPONENTS ---

const SavingsCalculator = () => {
  const [volume, setVolume] = useState(1000000); // Initial $1M

  // Logic: 0.05% Fee (Standard) -> Apex saves 40% of that (Rebate)
  // Annual = Monthly * 12
  const monthlyFees = volume * 0.0005;
  const monthlyRebate = monthlyFees * 0.40;
  const annualSavings = monthlyRebate * 12;

  // ROI Days = Investment ($99) / Daily Savings
  const dailySavings = monthlyRebate / 30;
  const roiDays = dailySavings > 0 ? (99 / dailySavings).toFixed(1) : '>90';

  return (
    <div className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-8 max-w-4xl mx-auto my-24 relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-red-500 to-emerald-500"></div>

      <div className="text-center mb-10">
        <h2 className="text-3xl font-bold text-zinc-100 mb-2">The Cost of Inaction</h2>
        <p className="text-zinc-400">How much are you donating to the exchange every year?</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
        <div className="space-y-6">
          <div>
            <label className="flex justify-between text-sm font-bold text-zinc-300 mb-2">
              <span>Monthly Trading Volume</span>
              <AnimatedNumber value={volume} prefix="$" className="text-emerald-400 font-mono text-lg" />
            </label>
            <input
              type="range"
              min="100000"
              max="20000000"
              step="100000"
              value={volume}
              onChange={(e) => setVolume(Number(e.target.value))}
              className="w-full h-3 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-emerald-500"
            />
            <div className="flex justify-between text-[10px] text-zinc-600 mt-1 font-mono">
              <span>$100k</span>
              <span>$20M+</span>
            </div>
          </div>

          <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl">
            <div className="text-xs text-red-400 uppercase tracking-wider font-bold mb-1">Fees Lost (Standard)</div>
            <AnimatedNumber value={monthlyFees * 12} prefix="$" suffix="/yr" className="text-xl font-mono text-zinc-300" />
          </div>
        </div>

        <div className="text-center md:text-left">
          <div className="text-sm text-zinc-500 uppercase tracking-widest mb-2">With Apex Financial OS</div>
          <div className="text-5xl md:text-6xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-500 mb-2">
            <AnimatedNumber value={annualSavings} prefix="$" />
          </div>
          <p className="text-emerald-500/80 font-medium">Recovered annually.</p>

          <div className="mt-6 p-4 bg-emerald-500/10 rounded-lg border border-emerald-500/20 text-sm text-emerald-200 inline-block">
            <span className="font-bold">ROI Alert:</span> Your $99 investment pays for itself in <span className="underline decoration-emerald-500 underline-offset-2 font-bold">{roiDays} days</span>.
          </div>
        </div>
      </div>
    </div>
  );
};

const WolfPackGrid = () => {
  return (
    <section className="py-24 px-6 bg-zinc-900/30 border-t border-zinc-800">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold text-white mb-4">Meet The Wolf Pack</h2>
          <p className="text-zinc-400 max-w-2xl mx-auto">
            Your personal army of autonomous agents working 24/7 to reclaim fees and protect your capital.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Agent 1: Collector */}
          <div className="bg-zinc-900/50 border border-zinc-800 p-8 rounded-2xl hover:border-blue-500/50 transition-all group">
            <div className="w-12 h-12 bg-blue-500/10 rounded-lg flex items-center justify-center mb-6 group-hover:bg-blue-500/20 transition-colors">
              <Database className="text-blue-400" size={24} />
            </div>
            <h3 className="text-xl font-bold text-zinc-100 mb-2">The Collector</h3>
            <p className="text-sm text-zinc-400 leading-relaxed mb-4">
              Connects to exchange Read-Only APIs via WebSocket. Ingests trade data in real-time with millisecond latency. Bypasses standard CSV export limits.
            </p>
            <div className="flex gap-2">
              <span className="text-[10px] bg-blue-500/10 text-blue-400 px-2 py-1 rounded font-mono border border-blue-500/20">Python</span>
              <span className="text-[10px] bg-blue-500/10 text-blue-400 px-2 py-1 rounded font-mono border border-blue-500/20">CCXT</span>
            </div>
          </div>

          {/* Agent 2: Auditor */}
          <div className="bg-zinc-900/50 border border-zinc-800 p-8 rounded-2xl hover:border-amber-500/50 transition-all group">
            <div className="w-12 h-12 bg-amber-500/10 rounded-lg flex items-center justify-center mb-6 group-hover:bg-amber-500/20 transition-colors">
              <Activity className="text-amber-400" size={24} />
            </div>
            <h3 className="text-xl font-bold text-zinc-100 mb-2">The Auditor</h3>
            <p className="text-sm text-zinc-400 leading-relaxed mb-4">
              Re-calculates every single fee charged against exchange rate cards. Identifies discrepancies and generates rebate claims automatically.
            </p>
            <div className="flex gap-2">
              <span className="text-[10px] bg-amber-500/10 text-amber-400 px-2 py-1 rounded font-mono border border-amber-500/20">Pandas</span>
              <span className="text-[10px] bg-amber-500/10 text-amber-400 px-2 py-1 rounded font-mono border border-amber-500/20">Gemini 1.5 Pro</span>
            </div>
          </div>

          {/* Agent 3: Guardian */}
          <div className="bg-zinc-900/50 border border-zinc-800 p-8 rounded-2xl hover:border-emerald-500/50 transition-all group">
            <div className="w-12 h-12 bg-emerald-500/10 rounded-lg flex items-center justify-center mb-6 group-hover:bg-emerald-500/20 transition-colors">
              <Shield className="text-emerald-400" size={24} />
            </div>
            <h3 className="text-xl font-bold text-zinc-100 mb-2">The Guardian</h3>
            <p className="text-sm text-zinc-400 leading-relaxed mb-4">
              Real-time risk sentinel. Monitors leverage, funding rates, and liquidation proximity. Sends urgent alerts before the market moves against you.
            </p>
            <div className="flex gap-2">
              <span className="text-[10px] bg-emerald-500/10 text-emerald-400 px-2 py-1 rounded font-mono border border-emerald-500/20">Gemini 3.0</span>
              <span className="text-[10px] bg-emerald-500/10 text-emerald-400 px-2 py-1 rounded font-mono border border-emerald-500/20">Thinking Config</span>
            </div>
          </div>

          {/* Agent 4: Concierge */}
          <div className="bg-zinc-900/50 border border-zinc-800 p-8 rounded-2xl hover:border-purple-500/50 transition-all group">
            <div className="w-12 h-12 bg-purple-500/10 rounded-lg flex items-center justify-center mb-6 group-hover:bg-purple-500/20 transition-colors">
              <Bot className="text-purple-400" size={24} />
            </div>
            <h3 className="text-xl font-bold text-zinc-100 mb-2">The Concierge</h3>
            <p className="text-sm text-zinc-400 leading-relaxed mb-4">
              Your interface to the system. Chat with your portfolio, request reports, and manage settings through a natural language interface.
            </p>
            <div className="flex gap-2">
              <span className="text-[10px] bg-purple-500/10 text-purple-400 px-2 py-1 rounded font-mono border border-purple-500/20">Next.js</span>
              <span className="text-[10px] bg-purple-500/10 text-purple-400 px-2 py-1 rounded font-mono border border-purple-500/20">Vercel AI SDK</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

const Testimonials = () => {
  return (
    <section className="py-12 border-t border-zinc-900">
      <div className="max-w-6xl mx-auto px-6">
        <h2 className="text-center text-2xl font-bold text-white mb-12 flex items-center justify-center">
          <MessageCircle className="mr-2 text-emerald-500" /> Trusted by the Hidden Whales
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {TESTIMONIALS.map((t) => (
            <div key={t.id} className="bg-zinc-900/50 border border-zinc-800 p-6 rounded-xl relative hover:border-zinc-700 transition-all">
              <Quote size={24} className="text-zinc-700 absolute top-4 left-4 opacity-50" />
              <div className="mt-4 mb-4 text-zinc-300 text-sm italic leading-relaxed relative z-10">"{t.text}"</div>
              <div className="flex items-center justify-between border-t border-zinc-800 pt-4">
                <div>
                  <div className="font-bold text-zinc-100 text-sm">{t.name}</div>
                  <div className="text-xs text-zinc-500">{t.role}</div>
                </div>
                <div className="text-xs font-bold text-emerald-400 bg-emerald-950/30 px-2 py-1 rounded">
                  {t.impact}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

const ValueStack = ({ onPurchase }: { onPurchase: () => void }) => {
  return (
    <section className="py-24 px-6 relative">
      <div className="max-w-lg mx-auto bg-zinc-900 border border-zinc-800 rounded-3xl overflow-hidden shadow-2xl relative">
        <div className="absolute top-0 right-0 bg-yellow-500 text-black text-xs font-bold px-3 py-1 rounded-bl-xl">FOUNDERS CIRCLE OFFER</div>

        <div className="p-8 bg-zinc-950">
          <h3 className="text-2xl font-bold text-center text-zinc-100 mb-6">The Grand Slam Stack</h3>
          <div className="space-y-4">
            {VALUE_STACK.map((item, i) => (
              <div key={i} className="flex justify-between items-center border-b border-zinc-900 pb-3 last:border-0">
                <span className="flex items-center text-zinc-300">
                  <CheckCircle size={16} className="text-emerald-500 mr-3" />
                  {item.name}
                </span>
                <span className="text-zinc-500 line-through text-sm">{item.value}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-zinc-900 p-8 text-center border-t border-zinc-800">
          <div className="text-sm text-zinc-500 mb-2">Total Value: <span className="line-through">$7,694+</span></div>
          <div className="flex items-center justify-center space-x-3 mb-6">
            <span className="text-6xl font-bold text-white">$99</span>
            <span className="text-left text-xs text-zinc-500 uppercase font-bold leading-tight">One-time<br />Payment</span>
          </div>

          <button
            onClick={onPurchase}
            className="w-full py-4 bg-yellow-500 hover:bg-yellow-400 text-black font-bold text-xl rounded-xl shadow-[0_0_30px_rgba(234,179,8,0.4)] transition-all hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center"
          >
            Secure My Spot <ArrowRight className="ml-2" strokeWidth={3} />
          </button>

          <div className="mt-4 flex items-center justify-center space-x-4 opacity-60 grayscale">
            <div className="flex items-center text-[10px] text-zinc-400"><ShieldCheck size={12} className="mr-1" /> 30-Day Money Back Guarantee</div>
            <div className="h-3 w-[1px] bg-zinc-700"></div>
            <div className="flex items-center text-[10px] text-zinc-400"><Lock size={12} className="mr-1" /> Secure Crypto/Fiat</div>
          </div>
        </div>
      </div>
    </section>
  );
};

const FAQ = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <section className="py-12 max-w-3xl mx-auto px-6">
      <h2 className="text-center text-xl font-bold text-zinc-200 mb-8 flex items-center justify-center">
        <HelpCircle className="mr-2 text-zinc-500" size={20} /> Frequently Asked Questions
      </h2>
      <div className="space-y-4">
        {FAQS.map((item, i) => (
          <div key={i} className="border border-zinc-800 rounded-lg bg-zinc-900/30 overflow-hidden">
            <button
              onClick={() => setOpenIndex(openIndex === i ? null : i)}
              className="w-full flex items-center justify-between p-4 text-left hover:bg-zinc-800/50 transition-colors"
            >
              <span className="font-bold text-sm text-zinc-300">{item.q}</span>
              {openIndex === i ? <ChevronUp size={16} className="text-zinc-500" /> : <ChevronDown size={16} className="text-zinc-500" />}
            </button>
            <AnimatePresence>
              {openIndex === i && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}
                  className="overflow-hidden"
                >
                  <div className="p-4 pt-0 text-sm text-zinc-400 leading-relaxed border-t border-zinc-800/50 mt-2">
                    {item.a}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        ))}
      </div>
    </section>
  );
};

const StickyFOMOBar = ({ spotsLeft, onPurchase }: { spotsLeft: number, onPurchase: () => void }) => {
  return (
    <motion.div
      initial={{ y: 100 }} animate={{ y: 0 }} transition={{ delay: 2 }}
      className="fixed bottom-0 left-0 right-0 bg-zinc-900/90 backdrop-blur border-t border-yellow-500/30 z-40 p-4 md:p-0"
    >
      <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center justify-between md:h-16">
        <div className="flex items-center space-x-3 mb-3 md:mb-0">
          <div className="relative">
            <div className="w-3 h-3 bg-red-500 rounded-full animate-ping absolute"></div>
            <div className="w-3 h-3 bg-red-500 rounded-full relative"></div>
          </div>
          <span className="text-sm font-bold text-zinc-200">
            <span className="text-red-500">{spotsLeft} spots</span> remaining in Founders' Circle
          </span>
          <span className="hidden md:inline text-xs text-zinc-500">|</span>
          <span className="hidden md:inline text-xs text-zinc-500 italic">User [0x39...a8] just joined 2m ago</span>
        </div>

        <button
          onClick={onPurchase}
          className="w-full md:w-auto px-6 py-2 bg-yellow-500 text-black font-bold rounded-lg text-sm shadow-lg hover:bg-yellow-400 transition-colors flex items-center justify-center"
        >
          Join for $99 <ArrowRight size={16} className="ml-2" />
        </button>
      </div>
    </motion.div>
  );
};

const PaymentModal = ({ isOpen, onClose }: { isOpen: boolean, onClose: () => void }) => {
  const [method, setMethod] = useState<'crypto' | 'fiat'>('crypto');
  const [txId, setTxId] = useState('');
  const [status, setStatus] = useState<'idle' | 'verifying' | 'success'>('idle');

  const handleVerify = () => {
    if (!txId) return;
    setStatus('verifying');
    setTimeout(() => setStatus('success'), 2000);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-sm">
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="bg-zinc-900 border border-zinc-800 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl"
      >
        {status === 'success' ? (
          <div className="p-8 text-center">
            <div className="w-20 h-20 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle size={40} className="text-emerald-500" />
            </div>
            <h3 className="text-2xl font-bold text-white mb-2">Welcome to the Circle.</h3>
            <p className="text-zinc-400 mb-6">Your transaction has been flagged for priority verification. An onboarding agent will contact you within 15 minutes.</p>
            <button onClick={onClose} className="w-full py-3 bg-zinc-800 hover:bg-zinc-700 rounded-lg font-bold text-zinc-200">Close Window</button>
          </div>
        ) : (
          <>
            <div className="p-6 border-b border-zinc-800 flex justify-between items-center bg-zinc-950">
              <h3 className="font-bold text-lg flex items-center"><Lock size={18} className="text-emerald-500 mr-2" /> Secure Payment Gateway</h3>
              <button onClick={onClose}><X size={20} className="text-zinc-500 hover:text-white" /></button>
            </div>

            <div className="p-6">
              <div className="flex space-x-2 mb-6 bg-zinc-950 p-1 rounded-lg">
                <button
                  onClick={() => setMethod('crypto')}
                  className={`flex-1 py-2 rounded-md text-sm font-bold transition-all ${method === 'crypto' ? 'bg-zinc-800 text-white shadow' : 'text-zinc-500 hover:text-zinc-300'}`}
                >
                  Crypto (USDT)
                </button>
                <button
                  onClick={() => setMethod('fiat')}
                  className={`flex-1 py-2 rounded-md text-sm font-bold transition-all ${method === 'fiat' ? 'bg-zinc-800 text-white shadow' : 'text-zinc-500 hover:text-zinc-300'}`}
                >
                  Bank Transfer
                </button>
              </div>

              <div className="space-y-4 mb-6">
                {method === 'crypto' ? (
                  <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-4">
                    <div className="flex justify-between mb-2">
                      <span className="text-xs text-zinc-500 font-bold">NETWORK</span>
                      <span className="text-xs text-emerald-500 font-bold">BEP20 (BSC) / TRC20</span>
                    </div>
                    <div className="flex justify-between mb-4">
                      <span className="text-xs text-zinc-500 font-bold">AMOUNT</span>
                      <span className="text-xl text-white font-bold font-mono">99.00 USDT</span>
                    </div>
                    <div className="bg-zinc-900 p-3 rounded border border-dashed border-zinc-700 flex items-center justify-between">
                      <code className="text-xs text-zinc-300 break-all">0x71C7656EC7ab88b098defB751B7401B5f6d8976F</code>
                      <button className="p-2 hover:bg-zinc-800 rounded"><Copy size={14} className="text-zinc-400" /></button>
                    </div>
                  </div>
                ) : (
                  <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-4">
                    <div className="text-center py-8 text-zinc-400 text-sm">
                      <Briefcase size={32} className="mx-auto mb-2 opacity-50" />
                      Direct Bank Transfer (VietQR) details would appear here.
                    </div>
                  </div>
                )}
              </div>

              <div className="space-y-3">
                <label className="text-xs font-bold text-zinc-500 ml-1">CONFIRMATION</label>
                <input
                  type="text"
                  placeholder={method === 'crypto' ? "Paste TxID / Hash here" : "Enter Banking Reference Code"}
                  value={txId}
                  onChange={(e) => setTxId(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-3 text-sm text-white focus:border-yellow-500 focus:outline-none"
                />
                <button
                  onClick={handleVerify}
                  disabled={!txId || status === 'verifying'}
                  className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold rounded-lg shadow-lg flex items-center justify-center"
                >
                  {status === 'verifying' ? <RefreshCw className="animate-spin mr-2" size={18} /> : <Check className="mr-2" size={18} />}
                  {status === 'verifying' ? 'Verifying on-chain...' : 'I Have Sent Payment'}
                </button>
              </div>
            </div>
          </>
        )}
      </motion.div>
    </div>
  );
};

const TransparencyModal = ({ isOpen, onClose }: { isOpen: boolean, onClose: () => void }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
        className="bg-zinc-900 border border-zinc-800 rounded-xl w-full max-w-2xl overflow-hidden shadow-2xl"
      >
        <div className="p-6 border-b border-zinc-800 flex justify-between items-center">
          <h3 className="font-bold text-zinc-100 flex items-center"><ShieldCheck size={18} className="text-emerald-500 mr-2" /> Apex Transparency Protocol</h3>
          <button onClick={onClose}><X size={20} className="text-zinc-500 hover:text-white" /></button>
        </div>
        <div className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-black/40 p-4 rounded border border-zinc-800 text-center">
              <div className="text-xs text-zinc-500 uppercase font-bold mb-1">Uptime (90d)</div>
              <div className="text-xl font-mono text-emerald-500">99.99%</div>
            </div>
            <div className="bg-black/40 p-4 rounded border border-zinc-800 text-center">
              <div className="text-xs text-zinc-500 uppercase font-bold mb-1">Total Rebates</div>
              <div className="text-xl font-mono text-white">$4.2M+</div>
            </div>
            <div className="bg-black/40 p-4 rounded border border-zinc-800 text-center">
              <div className="text-xs text-zinc-500 uppercase font-bold mb-1">Active Agents</div>
              <div className="text-xl font-mono text-white">1,240</div>
            </div>
          </div>
          <div>
            <h4 className="text-sm font-bold text-zinc-300 mb-2">Apex Cold Storage (Multi-sig)</h4>
            <div className="bg-zinc-950 p-3 rounded border border-dashed border-zinc-700 flex items-center justify-between">
              <code className="text-xs text-zinc-500 font-mono">0xApex...Vault7B (Gnosis Safe)</code>
              <span className="text-[10px] bg-emerald-500/10 text-emerald-500 px-2 py-1 rounded border border-emerald-500/20">Audited</span>
            </div>
          </div>
          <div className="text-xs text-zinc-500 leading-relaxed">
            <strong>Non-Custodial Promise:</strong> Apex Financial OS never holds user funds directly. All trading funds remain on your exchange (Binance/Bybit). We only access data via Read-Only APIs to calculate rebates and audit fees. API Keys are encrypted using AES-256 and stored in isolated containers.
          </div>
        </div>
      </motion.div>
    </div>
  )
}

// --- MAIN PAGE ---

export default function LandingPage() {
  const [paymentOpen, setPaymentOpen] = useState(false);
  const [transparencyOpen, setTransparencyOpen] = useState(false);

  return (
    <div className="bg-zinc-950 text-zinc-200 font-sans selection:bg-yellow-500/30 pb-20">

      {/* Navbar */}
      <nav className="fixed top-0 w-full z-30 bg-zinc-950/80 backdrop-blur border-b border-zinc-800/50 px-6 py-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center font-bold text-xl tracking-tighter">
            <Activity className="text-emerald-500 mr-2" size={24} />
            Apex<span className="text-zinc-500">.OS</span>
          </div>
          <div className="flex items-center space-x-4">
            <div className="hidden md:flex items-center px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-[10px] font-bold text-emerald-500 uppercase tracking-wider">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 mr-2 animate-pulse"></div> System Operational
            </div>
            <button
              onClick={() => window.location.href = '/dashboard'}
              className="px-4 py-2 bg-zinc-900 text-zinc-400 hover:text-white rounded-full font-bold text-xs border border-zinc-800 transition-all flex items-center"
            >
              Member Login
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <header className="pt-32 pb-20 px-6 text-center max-w-4xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-6 inline-flex items-center px-3 py-1 rounded-full border border-red-500/30 bg-red-500/10 text-red-400 text-xs font-bold uppercase tracking-wider">
          <Flame size={12} className="mr-2" /> Founders' Circle Closing Soon
        </motion.div>
        <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="text-5xl md:text-7xl font-bold text-white mb-6 tracking-tight">
          Stop donating 30% of your PnL to the exchange.
        </motion.h1>
        <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }} className="text-xl text-zinc-400 mb-10 max-w-2xl mx-auto">
          Institutional-grade fee rebates and automated audits. <br />
          The only tool that pays for itself in your first 5 trades.
        </motion.p>
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.3 }}>
          <button
            onClick={() => setPaymentOpen(true)}
            className="px-8 py-4 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xl rounded-full shadow-[0_0_50px_rgba(16,185,129,0.3)] transition-all hover:scale-105 flex items-center mx-auto"
          >
            Stop The Bleeding <ArrowRight className="ml-2" />
          </button>

          {/* The Escape Hatch: Link to basic dashboard for non-paying/existing users */}
          <button
            onClick={() => window.location.href = '/dashboard'}
            className="mt-6 text-xs text-zinc-500 hover:text-zinc-300 underline decoration-zinc-800 underline-offset-4 transition-all"
          >
            Skip offer & Access Basic Terminal
          </button>

          <p className="mt-4 text-xs text-zinc-600">100% Money-Back Guarantee. Cancel anytime.</p>
        </motion.div>
      </header>

      {/* Savings Logic */}
      <SavingsCalculator />

      {/* The Wolf Pack Tech Grid (Added) */}
      <WolfPackGrid />

      {/* Social Proof */}
      <Testimonials />

      {/* The Stack */}
      <div className="bg-zinc-950 py-12">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-white">Everything you need to trade like an institution.</h2>
        </div>
        <ValueStack onPurchase={() => setPaymentOpen(true)} />
      </div>

      {/* FAQ */}
      <FAQ />

      {/* Footer */}
      <footer className="bg-zinc-900 border-t border-zinc-800 py-12 text-center">
        <div className="flex items-center justify-center space-x-6 opacity-30 grayscale mb-8">
          <img src="https://upload.wikimedia.org/wikipedia/commons/5/5e/Visa_Inc._logo.svg" className="h-6" alt="Visa" />
          <img src="https://upload.wikimedia.org/wikipedia/commons/2/2a/Mastercard-logo.svg" className="h-6" alt="Mastercard" />
          <img src="https://cryptologos.cc/logos/tether-usdt-logo.png" className="h-6" alt="USDT" />
        </div>
        <div className="flex items-center justify-center space-x-6 mb-8 text-xs text-zinc-500">
          <button onClick={() => setTransparencyOpen(true)} className="hover:text-emerald-500 transition-colors flex items-center"><Eye size={12} className="mr-1" /> Transparency</button>
          <button className="hover:text-white transition-colors">Terms of Service</button>
          <button className="hover:text-white transition-colors">Privacy Policy</button>
        </div>
        <p className="text-zinc-600 text-xs">© 2024 Apex Financial Technologies. Singapore HoldCo.</p>
      </footer>

      {/* Sticky Bar & Modals */}
      <StickyFOMOBar spotsLeft={SCARCITY.total_spots - SCARCITY.taken} onPurchase={() => setPaymentOpen(true)} />
      <PaymentModal isOpen={paymentOpen} onClose={() => setPaymentOpen(false)} />
      <TransparencyModal isOpen={transparencyOpen} onClose={() => setTransparencyOpen(false)} />

    </div>
  );
}
