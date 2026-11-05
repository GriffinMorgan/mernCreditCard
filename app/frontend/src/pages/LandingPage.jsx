import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import SpendSignalLogo from '../components/SpendSignalLogo';
import { useAuth } from '../context/AuthContext';

export default function LandingPage() {
  const { isAuthenticated, user } = useAuth();
  const [previewTab, setPreviewTab] = useState('cardholder'); // 'cardholder' | 'merchant' | 'partner'

  return (
    <div className="max-w-[1400px] mx-auto px-8 py-12 space-y-16">
      {/* =====================================================================
          TOP EDITORIAL HEADER
      ===================================================================== */}
      <section className="grid grid-cols-12 gap-8 items-end border-b border-[#1A2540] pb-12">
        <div className="col-span-8 space-y-4">
          <div className="text-xs font-mono uppercase tracking-widest text-[#7E8EF7]">
            Credit Card Routing &amp; Panel Analytics
          </div>
          <h1 className="text-4xl xl:text-5xl font-bold tracking-tight text-white leading-[1.15]">
            Card reward optimization for consumers.
            <br />
            <span className="text-slate-400 font-semibold">
              Spend intelligence for merchants and issuers.
            </span>
          </h1>
          <p className="text-base text-slate-400 max-w-2xl leading-relaxed pt-1">
            SpendSignal connects cardholder wallets, merchant category reporting, and issuer routing
            APIs into a single platform. Sign in to access the workspace assigned to your account.
          </p>
        </div>

        <div className="col-span-4 flex flex-col items-end justify-end gap-3">
          {isAuthenticated ? (
            <Link to="/dashboard" className="btn-primary px-6 py-2.5">
              Open Workspace (@{user.username}) →
            </Link>
          ) : (
            <div className="flex items-center gap-3">
              <Link to="/login" className="btn-primary px-6 py-2.5">
                Sign in to account
              </Link>
              <Link to="/login?mode=register" className="btn-secondary px-5 py-2.5">
                Register
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* =====================================================================
          INTERACTIVE DESKTOP WORKSPACE PREVIEW (Switch between all 3 Roles)
      ===================================================================== */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1 border-b border-[#1E2B48]">
            {[
              { id: 'cardholder', label: 'Cardholder Workspace', tag: 'Consumer' },
              { id: 'merchant', label: 'Merchant Portal', tag: 'Spend Opportunity Report' },
              { id: 'partner', label: 'Partner Portal', tag: 'API Sandbox & Cohort Lift' },
            ].map((tab) => {
              const active = previewTab === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setPreviewTab(tab.id)}
                  className={`px-5 py-3 text-sm font-medium border-b-2 transition-colors flex items-center gap-2.5 ${
                    active
                      ? 'border-[#7E8EF7] text-white bg-[#11192E]/60'
                      : 'border-transparent text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <span>{tab.label}</span>
                  <span className="text-[11px] px-2 py-0.5 rounded bg-[#16213B] text-slate-400 font-normal">
                    {tab.tag}
                  </span>
                </button>
              );
            })}
          </div>

          <Link to="/login" className="text-xs font-medium text-[#7E8EF7] hover:underline">
            Sign in to use live workspace →
          </Link>
        </div>

        {/* APPLICATION FRAME */}
        <div className="panel overflow-hidden">
          {/* Frame Top Bar */}
          <div className="px-6 py-3.5 bg-[#0D1426] border-b border-[#1E2B48] flex items-center justify-between">
            <SpendSignalLogo
              size="sm"
              uppercase={previewTab === 'partner'}
              portalBadge={
                previewTab === 'cardholder'
                  ? 'Cardholder Wallet'
                  : previewTab === 'merchant'
                  ? 'Merchant Portal'
                  : 'Partner Portal'
              }
            />
            <div className="text-xs text-slate-400 font-mono">
              {previewTab === 'cardholder' && 'Role: Cardholder · Optimal Card Routing & ROI'}
              {previewTab === 'merchant' && 'Metro Atlanta Area · Consented Panel Data · Nov 2026'}
              {previewTab === 'partner' && 'Endpoints: /best-card · /wallet-value · /next-spend'}
            </div>
          </div>

          {/* =================================================================
              TAB 1: CARDHOLDER WORKSPACE PREVIEW
          ================================================================= */}
          {previewTab === 'cardholder' && (
            <div className="p-6 grid grid-cols-4 gap-5">
              {/* Col 1: Pay / Optimal Card Routing */}
              <div className="panel-inset p-5 flex flex-col justify-between space-y-5">
                <div className="space-y-4">
                  <div className="flex items-center justify-between border-b border-[#1A2540] pb-2.5">
                    <span className="text-sm font-bold text-white">Pay Routing</span>
                    <span className="text-[11px] font-mono text-amber-300 border border-amber-400/40 px-2 py-0.5 rounded">
                      Estimate
                    </span>
                  </div>

                  <div className="p-3.5 rounded-md bg-[#16213B] border border-[#293B63] space-y-3">
                    <div className="text-xs text-slate-300">Best card for this purchase</div>
                    <div className="h-28 rounded bg-[#090E1A] border border-[#F85C70] p-3.5 flex flex-col justify-between">
                      <div className="flex items-center justify-between">
                        <div className="w-7 h-5 rounded-xs bg-slate-400/70" />
                        <span className="text-xs font-mono text-slate-400">•••• 4821</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold text-white">Sapphire Reserve</span>
                        <div className="flex">
                          <span className="w-4 h-4 rounded-full bg-slate-400 -mr-1.5" />
                          <span className="w-4 h-4 rounded-full bg-slate-300/70" />
                        </div>
                      </div>
                    </div>
                  </div>

                  <p className="text-sm text-slate-200 leading-snug">
                    Use your Sapphire Reserve for{' '}
                    <span className="text-[#F85C70] font-semibold">3x</span> on dining.
                  </p>
                </div>

                <div className="w-full py-2 rounded bg-[#F85C70] text-white font-semibold text-xs text-center">
                  Pay Now
                </div>
              </div>

              {/* Col 2: Card ROI Value Tracker */}
              <div className="panel-inset p-5 flex flex-col justify-between space-y-5">
                <div className="space-y-4">
                  <div className="border-b border-[#1A2540] pb-2.5">
                    <div className="text-sm font-bold text-white">Card ROI</div>
                    <div className="text-xs text-[#7E8EF7]">
                      What each card returned against its fee
                    </div>
                  </div>

                  <div className="grid grid-cols-2 rounded overflow-hidden border border-[#243252]">
                    <div className="bg-[#182442] p-3 space-y-1">
                      <div className="text-[11px] text-slate-300">Annual Fee</div>
                      <div className="text-xl font-bold text-white tabular-nums">$550</div>
                      <div className="text-[10px] text-slate-400">Premium card</div>
                    </div>
                    <div className="bg-[#F85C70] p-3 space-y-1 text-white">
                      <div className="text-[11px]">Real Return</div>
                      <div className="text-xl font-bold tabular-nums">$780</div>
                      <div className="text-[10px] text-white/90">Points + credits</div>
                    </div>
                  </div>
                </div>

                <div className="p-4 rounded bg-[#11192E] border border-[#1E2B48] text-center space-y-2">
                  <div className="relative w-32 h-14 mx-auto overflow-hidden">
                    <svg viewBox="0 0 100 55" className="w-full h-full">
                      <path
                        d="M 10 50 A 40 40 0 0 1 90 50"
                        fill="none"
                        stroke="#1E2B48"
                        strokeWidth="8"
                        strokeLinecap="round"
                      />
                      <path
                        d="M 10 50 A 40 40 0 0 1 78 22"
                        fill="none"
                        stroke="#F85C70"
                        strokeWidth="8"
                        strokeLinecap="round"
                      />
                    </svg>
                    <div className="absolute inset-x-0 bottom-0 text-xs font-bold text-slate-300">
                      ROI
                    </div>
                  </div>
                  <div className="pt-2 border-t border-[#1E2B48] text-xs font-semibold text-slate-200 tabular-nums">
                    Net Value: <span className="text-emerald-400">+$230</span>
                  </div>
                </div>
              </div>

              {/* Col 3: Leakage */}
              <div className="panel-inset p-5 flex flex-col justify-between space-y-5">
                <div className="space-y-4">
                  <div className="border-b border-[#1A2540] pb-2.5">
                    <div className="text-sm font-bold text-white">Leakage</div>
                    <div className="text-xs text-slate-400">
                      Rewards and credits left on the table
                    </div>
                  </div>

                  <div className="p-3.5 rounded bg-[#11192E] border border-[#1E2B48] space-y-2.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-slate-200">Unused Credits</span>
                      <span className="text-[#F85C70] font-bold tabular-nums">Missed: $120/yr</span>
                    </div>

                    <div className="space-y-2 pt-1">
                      {[
                        { label: 'Dining', pct: '55%' },
                        { label: 'Travel', pct: '70%' },
                        { label: 'Groceries', pct: '38%' },
                        { label: 'Others', pct: '20%' },
                      ].map((row) => (
                        <div key={row.label} className="flex items-center gap-2 text-xs">
                          <span className="w-16 text-slate-400 text-[11px]">{row.label}</span>
                          <div className="flex-1 h-2 rounded-xs bg-[#090E1A] border border-[#1E2B48] overflow-hidden">
                            <div style={{ width: row.pct }} className="h-full bg-[#F85C70]" />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="px-3 py-2 rounded bg-[#182442] border border-[#2C3E6B] flex items-center justify-between text-xs text-slate-200">
                  <span>Travel Statement Credit</span>
                  <span className="font-mono font-semibold">$100 unused</span>
                </div>
              </div>

              {/* Col 4: Next Spend & Score */}
              <div className="panel-inset p-5 flex flex-col justify-between space-y-5">
                <div className="space-y-4">
                  <div className="border-b border-[#1A2540] pb-2.5">
                    <div className="text-sm font-bold text-white">Next Spend</div>
                    <div className="text-xs text-[#7E8EF7]">Predictions &amp; Wallet Score</div>
                  </div>

                  <div className="flex items-center gap-4 p-3.5 rounded bg-[#11192E] border border-[#1E2B48]">
                    <div className="relative w-16 h-16 shrink-0">
                      <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
                        <circle
                          cx="50"
                          cy="50"
                          r="40"
                          fill="none"
                          stroke="#1E2B48"
                          strokeWidth="10"
                        />
                        <circle
                          cx="50"
                          cy="50"
                          r="40"
                          fill="none"
                          stroke="#F85C70"
                          strokeWidth="10"
                          strokeDasharray="251.2"
                          strokeDashoffset="37.6"
                          strokeLinecap="round"
                        />
                      </svg>
                      <div className="absolute inset-0 flex items-center justify-center text-base font-bold text-white tabular-nums">
                        85
                      </div>
                    </div>
                    <div>
                      <div className="text-xs font-semibold text-white">Wallet Score: 85/100</div>
                      <div className="text-[11px] text-slate-400 mt-0.5">
                        Strong category coverage across dining &amp; groceries
                      </div>
                    </div>
                  </div>

                  <div className="p-3.5 rounded bg-[#11192E] border border-[#1E2B48] text-xs text-slate-300 leading-relaxed">
                    <span className="text-[#7E8EF7] font-semibold">Predicted:</span> Grocery
                    purchase ($120–$150) next week.
                  </div>
                </div>

                <div className="p-3 rounded bg-[#11192E] border border-[#1E2B48] flex items-center justify-between text-xs">
                  <span className="text-slate-300">One-Tap Revoke</span>
                  <span className="px-2.5 py-1 rounded bg-[#7E8EF7]/20 text-[#7E8EF7] font-medium">
                    Revoke Access
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* =================================================================
              TAB 2: MERCHANT PORTAL PREVIEW (Spend Opportunity Report)
          ================================================================= */}
          {previewTab === 'merchant' && (
            <div className="p-6 space-y-6">
              <div className="grid grid-cols-4 gap-4">
                <div className="panel-inset p-4 space-y-1">
                  <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                    YOUR SHARE
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-2xl font-bold text-white tabular-nums">18.4%</span>
                    <svg viewBox="0 0 80 24" className="w-16 h-6">
                      <path
                        d="M 2 20 Q 18 10, 32 16 T 58 8 T 76 6"
                        fill="none"
                        stroke="#7E8EF7"
                        strokeWidth="2"
                      />
                    </svg>
                  </div>
                  <div className="text-xs text-slate-500">of observed category spend</div>
                </div>

                <div className="panel-inset p-4 space-y-1">
                  <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                    LEAKAGE
                  </div>
                  <div className="text-2xl font-bold text-[#F85C70] tabular-nums">
                    $245,000 <span className="text-sm font-normal">/ mo</span>
                  </div>
                  <div className="text-xs text-slate-500">to competitor groups</div>
                </div>

                <div className="panel-inset p-4 space-y-1">
                  <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                    CATEGORY SPEND
                  </div>
                  <div className="text-2xl font-bold text-[#7E8EF7] tabular-nums">
                    $1.33M <span className="text-sm font-normal">/ mo</span>
                  </div>
                  <div className="text-xs text-slate-500">Your metro, panel-observed</div>
                </div>

                <div className="panel-inset p-4 space-y-1">
                  <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                    READY TO BUY
                  </div>
                  <div className="text-2xl font-bold text-white tabular-nums">1,450</div>
                  <div className="text-xs text-slate-500">Households in purchase window</div>
                </div>
              </div>

              <div className="grid grid-cols-12 gap-5">
                <div className="col-span-6 space-y-5">
                  <div className="panel-inset p-5 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-bold text-white">
                        Household Repurchase Timing
                      </span>
                      <span className="text-xs text-slate-400 font-mono">
                        Peak window: Week 8
                      </span>
                    </div>
                    <svg viewBox="0 0 360 130" className="w-full h-36">
                      <path
                        d="M 20 115 C 60 25, 100 25, 145 85 C 190 105, 260 55, 340 108"
                        fill="none"
                        stroke="#7E8EF7"
                        strokeWidth="2"
                      />
                      <path
                        d="M 20 115 C 90 92, 160 105, 215 35 C 255 35, 290 82, 340 110"
                        fill="none"
                        stroke="#F85C70"
                        strokeWidth="2"
                      />
                      <line
                        x1="215"
                        y1="35"
                        x2="215"
                        y2="115"
                        stroke="#475569"
                        strokeDasharray="3 3"
                      />
                      <circle cx="215" cy="35" r="4" fill="#F85C70" />
                    </svg>
                  </div>

                  <div className="panel-inset p-5 flex items-center justify-between border-l-2 border-l-[#F85C70]">
                    <div>
                      <span className="text-[10px] font-mono uppercase tracking-wider text-[#F85C70] block">
                        Recommended Offer
                      </span>
                      <div className="text-xl font-bold text-white mt-0.5">
                        $15 off $100 · 1,450 eligible households
                      </div>
                    </div>
                    <Link to="/login" className="btn-primary text-xs">
                      Launch Campaign
                    </Link>
                  </div>
                </div>

                <div className="col-span-6 panel-inset p-5 flex flex-col justify-between space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-bold text-white">90-Day Pilot Lift</span>
                    <span className="text-xs font-mono text-emerald-400">
                      Incremental Revenue Lift: +24.3%
                    </span>
                  </div>

                  <div className="h-44 flex items-end justify-between gap-2 px-2 border-b border-[#1A2540] pb-2">
                    {[
                      { day: '1', offer: 25, holdout: 42 },
                      { day: '10', offer: 30, holdout: 56 },
                      { day: '20', offer: 38, holdout: 56 },
                      { day: '30', offer: 48, holdout: 72 },
                      { day: '40', offer: 56, holdout: 82 },
                      { day: '50', offer: 68, holdout: 75 },
                      { day: '60', offer: 44, holdout: 68 },
                      { day: '70', offer: 48, holdout: 56 },
                      { day: '80', offer: 90, holdout: 60 },
                      { day: '90', offer: 92, holdout: 58 },
                    ].map((bar) => (
                      <div
                        key={bar.day}
                        className="flex-1 flex flex-col items-center gap-1 h-full justify-end"
                      >
                        <div className="w-full flex items-end justify-center gap-1 h-full">
                          <span
                            style={{ height: `${bar.offer}%` }}
                            className="w-2.5 bg-[#F85C70]"
                          />
                          <span
                            style={{ height: `${bar.holdout}%` }}
                            className="w-2.5 bg-[#7E8EF7]/80"
                          />
                        </div>
                        <span className="text-[10px] text-slate-500 tabular-nums">{bar.day}</span>
                      </div>
                    ))}
                  </div>

                  <div className="grid grid-cols-2 gap-4 text-xs">
                    <div className="p-3 rounded bg-[#11192E] border border-[#1E2B48] flex justify-between">
                      <span className="text-slate-400">Offer Group Revenue</span>
                      <strong className="text-white tabular-nums">$1.66M</strong>
                    </div>
                    <div className="p-3 rounded bg-[#11192E] border border-[#1E2B48] flex justify-between">
                      <span className="text-slate-400">Holdout Group Revenue</span>
                      <strong className="text-slate-300 tabular-nums">$1.33M</strong>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* =================================================================
              TAB 3: PARTNER PORTAL PREVIEW (API Sandbox & Cohort Lift)
          ================================================================= */}
          {previewTab === 'partner' && (
            <div className="p-6 grid grid-cols-12 gap-5">
              <div className="col-span-4 panel-inset p-5 flex flex-col justify-between space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between border-b border-[#1A2540] pb-2.5">
                    <span className="text-sm font-bold text-white">API Sandbox</span>
                    <code className="text-xs text-[#7E8EF7]">POST /best-card</code>
                  </div>
                  <pre className="p-3.5 rounded bg-[#070B14] border border-[#1A2540] text-[11px] font-mono text-slate-300 overflow-x-auto leading-relaxed">
{`{
  "merchant": "bostontson",
  "amount": 100,
  "wallet": {
    "card_0": "01",
    "card_1": 300
  }
}`}
                  </pre>
                </div>

                <div className="space-y-1.5">
                  <div className="text-xs font-medium text-slate-400">Response Payload</div>
                  <pre className="p-3.5 rounded bg-[#070B14] border border-[#1A2540] text-[11px] font-mono text-emerald-300 overflow-x-auto">
{`{
  "recommended_card_id": "card_01",
  "explanation": "Earns 3x points on dining today",
  "estimated_value": 4.50
}`}
                  </pre>
                </div>
              </div>

              <div className="col-span-4 panel-inset p-5 flex flex-col justify-between space-y-4">
                <div className="border-b border-[#1A2540] pb-2.5">
                  <div className="text-sm font-bold text-white">White-Label Checkout Prompt</div>
                  <div className="text-xs text-slate-400">
                    Embeddable UI component for issuer checkout flows
                  </div>
                </div>

                <div className="p-4 rounded bg-[#11192E] border border-[#263659] space-y-3">
                  <div className="flex items-center justify-between text-xs border-b border-[#1E2B48] pb-2">
                    <span className="text-slate-300 font-medium">Apex Bank Checkout</span>
                    <span className="font-mono text-white font-semibold">$5.30</span>
                  </div>
                  <div className="p-3 rounded bg-[#16213B] border border-[#7E8EF7]/50 space-y-1.5">
                    <div className="text-[10px] text-slate-400">
                      Powered by <strong className="text-white">SpendSignal</strong>
                    </div>
                    <div className="text-xs font-bold text-white">
                      Use your Blue Cash Preferred
                    </div>
                    <div className="text-[11px] text-slate-300">
                      Earns <span className="text-[#7E8EF7] font-semibold">6% Cash Back</span> on
                      Groceries
                    </div>
                  </div>
                  <div className="space-y-1 text-xs">
                    <div className="px-2.5 py-1.5 rounded bg-[#0B1120] border border-[#1A2540] flex justify-between text-slate-200">
                      <span>Wallet 01</span>
                      <span className="text-[#7E8EF7] font-mono">Optimal</span>
                    </div>
                    <div className="px-2.5 py-1.5 rounded bg-[#0B1120] border border-[#1A2540] flex justify-between text-slate-500">
                      <span>Wallet 02</span>
                      <span>Lower utility</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="col-span-4 panel-inset p-5 flex flex-col justify-between space-y-4">
                <div>
                  <div className="border-b border-[#1A2540] pb-2.5">
                    <div className="text-sm font-bold text-white">
                      Pilot Cohort vs Control Segment
                    </div>
                    <div className="text-xs text-slate-400">
                      Engaged Users &amp; Top-of-Wallet Lift
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 pt-4">
                    <div>
                      <div className="text-[10px] uppercase text-slate-400">TOP-OF-WALLET LIFT</div>
                      <div className="text-2xl font-bold text-[#7E8EF7] tabular-nums mt-0.5">
                        +14.8% ↑
                      </div>
                    </div>
                    <div>
                      <div className="text-[10px] uppercase text-slate-400">DAILY ENGAGEMENT</div>
                      <div className="text-2xl font-bold text-[#7E8EF7] tabular-nums mt-0.5">
                        84.3%
                      </div>
                      <div className="text-[11px] text-slate-500">vs. 41.5% Control</div>
                    </div>
                  </div>
                </div>

                <svg viewBox="0 0 300 130" className="w-full h-32">
                  <path
                    d="M 20 110 Q 65 95, 95 100 T 165 85 T 235 70 T 288 75"
                    fill="none"
                    stroke="#475569"
                    strokeWidth="1.75"
                    strokeDasharray="4 4"
                  />
                  <path
                    d="M 20 108 Q 65 85, 95 90 T 165 48 T 235 28 T 288 18"
                    fill="none"
                    stroke="#7E8EF7"
                    strokeWidth="2.5"
                  />
                  <circle cx="288" cy="18" r="3.5" fill="#7E8EF7" />
                </svg>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* =====================================================================
          STRUCTURED ROLE SPECIFICATION MATRIX
      ===================================================================== */}
      <section className="space-y-4">
        <div className="flex items-baseline justify-between">
          <h2 className="text-lg font-bold text-white">Platform Capabilities by Account Role</h2>
          <span className="text-xs text-slate-500">
            All views available in your dashboard after authentication
          </span>
        </div>

        <div className="panel grid grid-cols-3 divide-x divide-[#1E2B48]">
          <div className="p-6 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono uppercase tracking-wider text-[#7E8EF7]">
                Role 01
              </span>
              <span className="text-xs text-slate-500">Consumer</span>
            </div>
            <h3 className="text-base font-bold text-white">Cardholder Workspace</h3>
            <ul className="space-y-2.5 text-xs text-slate-300">
              <li className="flex justify-between py-1.5 border-b border-[#1A2540]">
                <span className="text-slate-400">Connected Cards</span>
                <span className="font-mono text-slate-200">GET / POST /api/cards</span>
              </li>
              <li className="flex justify-between py-1.5 border-b border-[#1A2540]">
                <span className="text-slate-400">Checkout Recommendation</span>
                <span className="text-slate-200">3x–6% category routing</span>
              </li>
              <li className="flex justify-between py-1.5 border-b border-[#1A2540]">
                <span className="text-slate-400">Annual Fee ROI</span>
                <span className="text-emerald-400 tabular-nums">+$230 net value tracking</span>
              </li>
              <li className="flex justify-between py-1.5">
                <span className="text-slate-400">Reward Leakage</span>
                <span className="text-[#F85C70] tabular-nums">Unused credit detection</span>
              </li>
            </ul>
          </div>

          <div className="p-6 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono uppercase tracking-wider text-[#F85C70]">
                Role 02
              </span>
              <span className="text-xs text-slate-500">Company / Retail</span>
            </div>
            <h3 className="text-base font-bold text-white">Merchant Opportunity Portal</h3>
            <ul className="space-y-2.5 text-xs text-slate-300">
              <li className="flex justify-between py-1.5 border-b border-[#1A2540]">
                <span className="text-slate-400">Observed Share</span>
                <span className="text-slate-200 tabular-nums">18.4% metro share</span>
              </li>
              <li className="flex justify-between py-1.5 border-b border-[#1A2540]">
                <span className="text-slate-400">Competitor Leakage</span>
                <span className="text-[#F85C70] tabular-nums">$245,000 / mo tracked</span>
              </li>
              <li className="flex justify-between py-1.5 border-b border-[#1A2540]">
                <span className="text-slate-400">Purchase Window</span>
                <span className="text-slate-200 tabular-nums">1,450 ready households</span>
              </li>
              <li className="flex justify-between py-1.5">
                <span className="text-slate-400">90-Day Pilot Lift</span>
                <span className="text-emerald-400 tabular-nums">+24.3% revenue lift</span>
              </li>
            </ul>
          </div>

          <div className="p-6 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono uppercase tracking-wider text-emerald-400">
                Role 03
              </span>
              <span className="text-xs text-slate-500">Issuer / Fintech</span>
            </div>
            <h3 className="text-base font-bold text-white">Partner API &amp; Cohort Portal</h3>
            <ul className="space-y-2.5 text-xs text-slate-300">
              <li className="flex justify-between py-1.5 border-b border-[#1A2540]">
                <span className="text-slate-400">Routing Endpoints</span>
                <span className="font-mono text-slate-200">/best-card, /explain</span>
              </li>
              <li className="flex justify-between py-1.5 border-b border-[#1A2540]">
                <span className="text-slate-400">White-Label UI</span>
                <span className="text-slate-200">Configurable checkout embed</span>
              </li>
              <li className="flex justify-between py-1.5 border-b border-[#1A2540]">
                <span className="text-slate-400">Top-of-Wallet Lift</span>
                <span className="text-[#7E8EF7] tabular-nums">+14.8% over control</span>
              </li>
              <li className="flex justify-between py-1.5">
                <span className="text-slate-400">Daily Engagement</span>
                <span className="text-slate-200 tabular-nums">84.3% active cohort</span>
              </li>
            </ul>
          </div>
        </div>
      </section>
    </div>
  );
}
