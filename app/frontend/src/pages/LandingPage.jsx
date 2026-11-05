import React from 'react';
import { Link } from 'react-router-dom';
import {
  LogIn,
  LayoutDashboard,
  Sparkles,
  CreditCard,
  TrendingUp,
  ShieldCheck,
  Code2,
  BarChart3,
  ArrowRight,
  Zap,
} from 'lucide-react';
import SpendSignalLogo from '../components/SpendSignalLogo';
import { useAuth } from '../context/AuthContext';

export default function LandingPage() {
  const { isAuthenticated, user } = useAuth();

  return (
    <div className="space-y-24 pb-24">
      {/* =====================================================================
          HERO SECTION (Pure Marketing / Product Overview)
      ===================================================================== */}
      <section className="relative pt-14 sm:pt-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="pointer-events-none absolute -top-10 left-1/4 w-96 h-96 bg-signal-indigo/10 rounded-full blur-3xl" />
        <div className="pointer-events-none absolute top-12 right-1/4 w-80 h-80 bg-signal-coral/10 rounded-full blur-3xl" />

        <div className="text-center max-w-4xl mx-auto space-y-6">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-navy-850 border border-slate-800 text-xs font-medium text-slate-300">
            <Sparkles className="w-3.5 h-3.5 text-signal-coral" />
            <span>SpendSignal — Credit Card Reward Optimization & Spend Intelligence</span>
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white leading-[1.12]">
            Use the Right Card on{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-signal-indigo via-indigo-300 to-signal-coral">
              Every Single Purchase
            </span>
          </h1>

          <p className="text-base sm:text-lg text-slate-400 max-w-2xl mx-auto leading-relaxed">
            SpendSignal analyzes your wallet in real time—routing every checkout to your highest
            earning card, tracking annual fee ROI, uncovering missed category credits, and powering
            consented merchant analytics.
          </p>

          {/* Primary Call-To-Action Buttons */}
          <div className="flex flex-wrap items-center justify-center gap-4 pt-3">
            {isAuthenticated ? (
              <Link to="/dashboard" className="signal-btn-primary text-sm px-7 py-3.5">
                <LayoutDashboard className="w-4 h-4" />
                <span>Open Your Dashboard (@{user.username})</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            ) : (
              <>
                <Link to="/login" className="signal-btn-primary text-sm px-7 py-3.5">
                  <LogIn className="w-4 h-4" />
                  <span>Sign In to Your Account</span>
                </Link>
                <Link
                  to="/login?mode=register"
                  className="signal-btn-coral text-sm px-7 py-3.5"
                >
                  <span>Create Free Account</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </>
            )}
          </div>

          {/* High-Level Platform Metrics Strip */}
          <div className="pt-10 grid grid-cols-2 sm:grid-cols-4 gap-4 max-w-3xl mx-auto">
            {[
              { value: '3x–6%', label: 'Cashback & Points Maximized', color: 'text-signal-indigo' },
              { value: '+$230', label: 'Avg Annual Fee Net ROI', color: 'text-emerald-400' },
              { value: '+14.8%', label: 'Partner Top-of-Wallet Lift', color: 'text-white' },
              { value: '+24.3%', label: 'Merchant Pilot Revenue Lift', color: 'text-signal-coral' },
            ].map((stat) => (
              <div
                key={stat.label}
                className="p-4 rounded-2xl bg-navy-900/80 border border-slate-800/90 text-center"
              >
                <div className={`text-2xl font-extrabold ${stat.color}`}>{stat.value}</div>
                <div className="text-xs text-slate-400 mt-1">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* =====================================================================
          CONSUMER MOBILE WALLET PREVIEW (Static Showcase from Mockup 2)
      ===================================================================== */}
      <section id="features" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <span className="text-xs font-bold uppercase tracking-widest text-signal-indigo">
            Cardholder Experience
          </span>
          <h2 className="text-2xl sm:text-3xl font-bold text-white mt-1">
            Built for Smarter Everyday Spending
          </h2>
          <p className="text-sm text-slate-400 mt-2">
            Log in as a cardholder to manage your cards, track total balances, see category
            breakdowns, and never miss a reward multiplier.
          </p>
        </div>

        {/* 4 Phone Mockup Visuals (Pure Showcase) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Phone 1: Pay */}
          <div className="rounded-[2.25rem] bg-navy-900 border-[3px] border-slate-700/80 p-5 shadow-2xl flex flex-col justify-between min-h-[460px]">
            <div className="w-20 h-3.5 bg-black rounded-full mx-auto mb-3" />
            <div className="space-y-4 flex-1">
              <SpendSignalLogo size="sm" />
              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <span className="text-lg font-bold text-white border-b-2 border-signal-indigo pb-1">
                  Pay
                </span>
                <span className="text-xs text-slate-400">Menu ☰</span>
              </div>
              <div className="p-3.5 rounded-2xl bg-signal-indigo/25 border border-signal-indigo/40 space-y-3">
                <div className="text-xs font-medium text-slate-200 text-center">
                  Best card for this purchase
                </div>
                <div className="h-28 rounded-xl bg-gradient-to-br from-navy-950 via-navy-850 to-indigo-950 border-2 border-signal-coral/80 p-3.5 flex flex-col justify-between">
                  <div className="w-7 h-5 rounded bg-slate-300/80" />
                  <div className="flex justify-end">
                    <span className="w-5 h-5 rounded-full bg-slate-400/80 -mr-1.5" />
                    <span className="w-5 h-5 rounded-full bg-slate-300/60" />
                  </div>
                </div>
              </div>
              <p className="text-sm font-medium text-slate-100">
                Use your Sapphire Reserve for{' '}
                <span className="text-signal-coral font-bold">3x</span> on dining.
              </p>
            </div>
            <div className="w-full py-2.5 rounded-full bg-signal-coral text-white font-bold text-xs text-center mt-4">
              Pay Now
            </div>
          </div>

          {/* Phone 2: Card ROI */}
          <div className="rounded-[2.25rem] bg-navy-900 border-[3px] border-slate-700/80 p-5 shadow-2xl flex flex-col justify-between min-h-[460px]">
            <div className="w-20 h-3.5 bg-black rounded-full mx-auto mb-3" />
            <div className="space-y-4 flex-1">
              <div>
                <h3 className="text-xl font-extrabold text-white">Card ROI</h3>
                <p className="text-xs text-signal-indigo font-medium">Value Tracker</p>
              </div>
              <p className="text-xs text-slate-300">What each card returned against its fee</p>
              <div className="rounded-2xl overflow-hidden border border-slate-700/70 grid grid-cols-2 relative">
                <div className="bg-signal-indigo/30 p-3 space-y-1">
                  <div className="text-[10px] text-slate-200">Annual Fee</div>
                  <div className="text-xl font-extrabold text-white">$550</div>
                </div>
                <div className="bg-signal-coral p-3 space-y-1 text-white">
                  <div className="text-[10px]">Real Return</div>
                  <div className="text-xl font-extrabold">$780</div>
                </div>
              </div>
              <div className="p-4 rounded-2xl bg-navy-850 border border-slate-800 text-center space-y-2">
                <div className="text-base font-bold text-slate-200">ROI Gauge</div>
                <div className="text-sm font-bold text-slate-200">
                  Net Value: <span className="text-emerald-400">+$230</span>
                </div>
              </div>
            </div>
          </div>

          {/* Phone 3: Leakage */}
          <div className="rounded-[2.25rem] bg-navy-900 border-[3px] border-slate-700/80 p-5 shadow-2xl flex flex-col justify-between min-h-[460px]">
            <div className="w-20 h-3.5 bg-black rounded-full mx-auto mb-3" />
            <div className="space-y-3.5 flex-1">
              <div>
                <h3 className="text-xl font-extrabold text-white">Leakage</h3>
                <p className="text-xs text-slate-300 mt-0.5">
                  Rewards and credits left on the table, by category
                </p>
              </div>
              <div className="p-3.5 rounded-2xl bg-navy-850 border border-slate-800 space-y-2.5">
                <div className="text-xs font-semibold text-white">• Unused Credits</div>
                <div className="text-base font-extrabold text-signal-coral">Missed: $120/yr</div>
                {['Dining', 'Travel', 'Groceries'].map((cat, i) => (
                  <div key={cat} className="flex items-center gap-2 text-[11px]">
                    <span className="w-16 text-slate-300">{cat}</span>
                    <div className="flex-1 h-2 rounded-full bg-navy-950 overflow-hidden">
                      <div
                        style={{ width: `${65 - i * 15}%` }}
                        className="h-full bg-signal-coral rounded-full"
                      />
                    </div>
                  </div>
                ))}
              </div>
              <div className="p-3 rounded-2xl bg-navy-850 border border-slate-800">
                <div className="text-xs font-semibold text-slate-300">• Forgotten Rewards</div>
                <div className="text-sm font-extrabold text-signal-coral mt-0.5">
                  Missed: $120/yr
                </div>
              </div>
            </div>
          </div>

          {/* Phone 4: Next Spend */}
          <div className="rounded-[2.25rem] bg-navy-900 border-[3px] border-slate-700/80 p-5 shadow-2xl flex flex-col justify-between min-h-[460px]">
            <div className="w-20 h-3.5 bg-black rounded-full mx-auto mb-3" />
            <div className="space-y-4 flex-1">
              <div>
                <h3 className="text-xl font-extrabold text-white">Next Spend</h3>
                <p className="text-xs text-signal-indigo font-medium">Predictions &amp; Wallet</p>
              </div>
              <div className="p-4 rounded-2xl bg-navy-850 border border-slate-800 text-center">
                <div className="text-xs text-slate-400">Wallet Score</div>
                <div className="text-3xl font-extrabold text-white mt-1">
                  85 <span className="text-sm text-signal-coral">/ 100</span>
                </div>
              </div>
              <div className="p-3.5 rounded-2xl bg-navy-850 border border-slate-800 text-xs text-slate-200">
                <span className="text-signal-indigo font-semibold">Predicted:</span> Grocery
                purchase ($120–150) next week.
              </div>
              <div className="p-3.5 rounded-2xl bg-navy-850 border border-slate-800 text-center">
                <div className="text-xs font-bold text-white mb-2">One-Tap Privacy Control</div>
                <span className="inline-block w-full py-1.5 rounded-full bg-signal-indigo/80 text-white font-semibold text-xs">
                  Revoke Access
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =====================================================================
          ROLE-BASED PORTAL OVERVIEW (#portals)
      ===================================================================== */}
      <section id="portals" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <span className="text-xs font-bold uppercase tracking-widest text-signal-coral">
            Role-Based Dashboards
          </span>
          <h2 className="text-2xl sm:text-3xl font-bold text-white mt-1">
            Tailored Workspaces When You Sign In
          </h2>
          <p className="text-sm text-slate-400 mt-2">
            Depending on your account role, signing in takes you directly to your dedicated
            SpendSignal workspace.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Card 1: Cardholder Role */}
          <div className="signal-card p-6 flex flex-col justify-between space-y-5">
            <div className="space-y-3">
              <div className="w-11 h-11 rounded-xl bg-signal-indigo/15 border border-signal-indigo/30 flex items-center justify-center text-signal-indigo">
                <CreditCard className="w-5 h-5" />
              </div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-signal-indigo">
                Role: Cardholder / User
              </span>
              <h3 className="text-xl font-bold text-white">Personal Card & Reward Wallet</h3>
              <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
                View your total balance spent, add &amp; manage credit cards, analyze category
                spending breakdowns, and get instant recommendations on which card earns 3x–6% back.
              </p>
            </div>
            <Link
              to="/login"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-signal-indigo hover:underline"
            >
              <span>Sign in to Cardholder Dashboard</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {/* Card 2: Merchant Role */}
          <div className="signal-card p-6 flex flex-col justify-between space-y-5">
            <div className="space-y-3">
              <div className="w-11 h-11 rounded-xl bg-signal-coral/15 border border-signal-coral/30 flex items-center justify-center text-signal-coral">
                <BarChart3 className="w-5 h-5" />
              </div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-signal-coral">
                Role: Merchant / Company
              </span>
              <h3 className="text-xl font-bold text-white">Spend Opportunity Report</h3>
              <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
                Track category spend share, measure competitor leakage ($245K/mo), identify
                households in their repurchase window, and launch targeted card-linked offers.
              </p>
            </div>
            <Link
              to="/login"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-signal-coral hover:underline"
            >
              <span>Sign in to Merchant Portal</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {/* Card 3: Partner Role */}
          <div className="signal-card p-6 flex flex-col justify-between space-y-5">
            <div className="space-y-3">
              <div className="w-11 h-11 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                <Code2 className="w-5 h-5" />
              </div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-400">
                Role: Issuer / Partner
              </span>
              <h3 className="text-xl font-bold text-white">API Sandbox &amp; Cohort Lift</h3>
              <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
                Test live recommendation endpoints (<code>/best-card</code>,{' '}
                <code>/wallet-value</code>), customize white-label checkout prompts, and measure
                top-of-wallet cohort lift.
              </p>
            </div>
            <Link
              to="/login"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-400 hover:underline"
            >
              <span>Sign in to Partner Portal</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </section>

      {/* =====================================================================
          HOW IT WORKS / CTA FOOTER BANNER (#how-it-works)
      ===================================================================== */}
      <section id="how-it-works" className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="signal-card p-8 sm:p-10 text-center space-y-5 bg-gradient-to-br from-navy-850 via-navy-900 to-indigo-950/40">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white">
            Ready to Test the SpendSignal Login &amp; Dashboards?
          </h2>
          <p className="text-sm text-slate-300 max-w-xl mx-auto">
            Sign in with one of the seeded demo accounts (<code>alice</code>, <code>brian</code>, or{' '}
            <code>carla</code>) or register a new account to be redirected to your role dashboard.
          </p>
          <div className="pt-2">
            <Link
              to={isAuthenticated ? '/dashboard' : '/login'}
              className="signal-btn-primary text-sm px-8 py-3.5"
            >
              <Zap className="w-4 h-4" />
              <span>{isAuthenticated ? 'Continue to Your Dashboard' : 'Go to Login Page'}</span>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
