import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import SpendSignalLogo from '../components/SpendSignalLogo';
import { useAuth } from '../context/AuthContext';

export default function LandingPage() {
  const { isAuthenticated, user } = useAuth();
  const [previewTab, setPreviewTab] = useState('cardholder'); // 'cardholder' | 'company'

  return (
    <div className="max-w-[1400px] mx-auto px-8 py-12 space-y-16">
      {/* =====================================================================
          TOP EDITORIAL HEADER
      ===================================================================== */}
      <section className="grid grid-cols-12 gap-8 items-end border-b border-[#1A2540] pb-12">
        <div className="col-span-8 space-y-4">
          <div className="text-xs font-mono uppercase tracking-widest text-[#7E8EF7]">
            Credit Card Spend &amp; Portfolio Analytics
          </div>
          <h1 className="text-4xl xl:text-5xl font-bold tracking-tight text-white leading-[1.15]">
            Card reward optimization for consumers.
            <br />
            <span className="text-slate-400 font-semibold">
              Portfolio &amp; spend intelligence for credit card companies.
            </span>
          </h1>
          <p className="text-base text-slate-400 max-w-2xl leading-relaxed pt-1">
            SpendSignal connects everyday credit card users with the credit card companies that issue
            their cards. Cardholders track balances, log transactions, and uncover missed category
            rewards, while credit card companies analyze daily, weekly, and monthly spend trends and
            reward maximization across their card products.
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
          INTERACTIVE DESKTOP WORKSPACE PREVIEW (2 Portals)
      ===================================================================== */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1 border-b border-[#1E2B48]">
            {[
              {
                id: 'cardholder',
                label: 'Cardholder Workspace',
                tag: 'Consumers',
              },
              {
                id: 'company',
                label: 'Credit Card Company Portal',
                tag: 'Card Issuers',
              },
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
              portalBadge={
                previewTab === 'cardholder'
                  ? 'Cardholder Workspace'
                  : 'Credit Card Company Portal'
              }
            />
            <div className="text-xs text-slate-400">
              {previewTab === 'cardholder' &&
                'Connected Cards, Category Spend Breakdown & Reward Analysis'}
              {previewTab === 'company' &&
                'Daily, Weekly & Monthly Customer Spend & Reward Maximization'}
            </div>
          </div>

          {/* =================================================================
              TAB 1: CARDHOLDER WORKSPACE PREVIEW
          ================================================================= */}
          {previewTab === 'cardholder' && (
            <div className="p-6 grid grid-cols-3 gap-5">
              {/* Col 1: Total Balance & Connected Cards */}
              <div className="panel-inset p-5 flex flex-col justify-between space-y-5">
                <div className="space-y-4">
                  <div className="flex items-center justify-between border-b border-[#1A2540] pb-2.5">
                    <span className="text-sm font-bold text-white">Wallet &amp; Balance</span>
                    <span className="text-[11px] font-mono text-emerald-300 border border-emerald-400/40 px-2 py-0.5 rounded">
                      Active
                    </span>
                  </div>

                  <div className="p-3.5 rounded-md bg-[#16213B] border border-[#293B63] space-y-3">
                    <div className="text-xs text-slate-300">Connected Card Overview</div>
                    <div className="h-28 rounded bg-[#090E1A] border border-[#F85C70] p-3.5 flex flex-col justify-between">
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-mono text-[#7E8EF7]">Mastercard</span>
                        <span className="text-xs font-mono text-slate-400">•••• 9034</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold text-white">Travel Rewards</span>
                        <span className="text-[11px] font-mono text-emerald-400">
                          4% Travel · 3% Dining
                        </span>
                      </div>
                    </div>
                  </div>

                  <p className="text-xs text-slate-300 leading-snug">
                    Track current balances, available credit limits, and earned cash back across all
                    of your connected credit cards.
                  </p>
                </div>

                <div className="p-2.5 rounded bg-[#11192E] border border-[#1E2B48] flex items-center justify-between text-xs">
                  <span className="text-slate-400">Total Balance Spent</span>
                  <span className="font-mono font-bold text-white">$1,570.85</span>
                </div>
              </div>

              {/* Col 2: Category Spending Breakdown Circle */}
              <div className="panel-inset p-5 flex flex-col justify-between space-y-5">
                <div className="space-y-4">
                  <div className="border-b border-[#1A2540] pb-2.5">
                    <div className="text-sm font-bold text-white">Category Breakdown</div>
                    <div className="text-xs text-[#7E8EF7]">
                      Spending circle across 8 categories
                    </div>
                  </div>

                  <div className="flex items-center justify-center py-1">
                    <div className="relative w-28 h-28">
                      <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
                        <circle
                          cx="50"
                          cy="50"
                          r="38"
                          fill="none"
                          stroke="#1E2B48"
                          strokeWidth="12"
                        />
                        <circle
                          cx="50"
                          cy="50"
                          r="38"
                          fill="none"
                          stroke="#7E8EF7"
                          strokeWidth="12"
                          strokeDasharray="110 239"
                          strokeDashoffset="0"
                        />
                        <circle
                          cx="50"
                          cy="50"
                          r="38"
                          fill="none"
                          stroke="#F85C70"
                          strokeWidth="12"
                          strokeDasharray="70 239"
                          strokeDashoffset="-110"
                        />
                        <circle
                          cx="50"
                          cy="50"
                          r="38"
                          fill="none"
                          stroke="#34D399"
                          strokeWidth="12"
                          strokeDasharray="59 239"
                          strokeDashoffset="-180"
                        />
                      </svg>
                      <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                        <span className="text-[10px] text-slate-400">Tracked</span>
                        <span className="text-xs font-bold text-white tabular-nums">$1,683</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-1.5 text-xs">
                  <div className="flex justify-between text-slate-300">
                    <span className="flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-[#7E8EF7]" /> Travel
                    </span>
                    <span className="font-mono">$799.00 (47%)</span>
                  </div>
                  <div className="flex justify-between text-slate-300">
                    <span className="flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-[#F85C70]" /> Groceries
                    </span>
                    <span className="font-mono">$435.02 (26%)</span>
                  </div>
                  <div className="flex justify-between text-slate-300">
                    <span className="flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-emerald-400" /> Dining &amp; Gas
                    </span>
                    <span className="font-mono">$254.25 (15%)</span>
                  </div>
                </div>
              </div>

              {/* Col 3: Right-Card Analysis */}
              <div className="panel-inset p-5 flex flex-col justify-between space-y-5">
                <div className="space-y-4">
                  <div className="border-b border-[#1A2540] pb-2.5">
                    <div className="text-sm font-bold text-white">Right-Card Analysis</div>
                    <div className="text-xs text-slate-400">
                      Did you use the highest-earning card in your wallet?
                    </div>
                  </div>

                  <div className="p-3.5 rounded bg-[#11192E] border border-[#1E2B48] space-y-2.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-slate-200">Olive Garden (Dining)</span>
                      <span className="text-[#F85C70] font-mono font-semibold">1% vs 3%</span>
                    </div>
                    <p className="text-[11px] text-slate-400 leading-relaxed">
                      Used <strong className="text-slate-200">Everyday Cash</strong> (1% back) when{' '}
                      <strong className="text-emerald-300">Travel Rewards</strong> earns 3% on
                      Dining.
                    </p>
                  </div>

                  <div className="p-3.5 rounded bg-[#11192E] border border-[#1E2B48] space-y-2.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-slate-200">Whole Foods (Groceries)</span>
                      <span className="text-[#F85C70] font-mono font-semibold">1.5% vs 3%</span>
                    </div>
                    <p className="text-[11px] text-slate-400 leading-relaxed">
                      Used <strong className="text-slate-200">Travel Rewards</strong> (1.5% back)
                      when <strong className="text-emerald-300">Everyday Cash</strong> earns 3% on
                      Groceries.
                    </p>
                  </div>
                </div>

                <div className="px-3 py-2 rounded bg-[#182442] border border-[#2C3E6B] flex items-center justify-between text-xs text-slate-200">
                  <span>Reward Optimization</span>
                  <span className="font-mono font-semibold text-[#F85C70]">Real-Time Check</span>
                </div>
              </div>
            </div>
          )}

          {/* =================================================================
              TAB 2: CREDIT CARD COMPANY PORTAL PREVIEW
          ================================================================= */}
          {previewTab === 'company' && (
            <div className="p-6 space-y-6">
              <div className="grid grid-cols-4 gap-4">
                <div className="panel-inset p-4 space-y-1">
                  <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                    DAILY CUSTOMER SPEND
                  </div>
                  <div className="text-2xl font-bold text-white tabular-nums">$14,820</div>
                  <div className="text-xs text-slate-500">Across active cardholder accounts</div>
                </div>

                <div className="panel-inset p-4 space-y-1">
                  <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                    WEEKLY CUSTOMER SPEND
                  </div>
                  <div className="text-2xl font-bold text-[#7E8EF7] tabular-nums">$108,450</div>
                  <div className="text-xs text-slate-500">7-day posted &amp; pending volume</div>
                </div>

                <div className="panel-inset p-4 space-y-1">
                  <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                    MONTHLY CUSTOMER SPEND
                  </div>
                  <div className="text-2xl font-bold text-emerald-400 tabular-nums">$462,900</div>
                  <div className="text-xs text-slate-500">30-day portfolio spend volume</div>
                </div>

                <div className="panel-inset p-4 space-y-1">
                  <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                    REWARD MAXIMIZATION RATE
                  </div>
                  <div className="text-2xl font-bold text-[#F85C70] tabular-nums">68.4%</div>
                  <div className="text-xs text-slate-500">
                    31.6% of spend placed on suboptimal cards
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-12 gap-5">
                <div className="col-span-6 panel-inset p-5 space-y-4">
                  <div className="flex items-center justify-between border-b border-[#1A2540] pb-2.5">
                    <span className="text-sm font-bold text-white">
                      Issued Card Product Catalog &amp; Multiplier Structure
                    </span>
                    <span className="text-xs font-mono text-[#7E8EF7]">6 Active Products</span>
                  </div>

                  <div className="space-y-2.5 text-xs">
                    {[
                      {
                        name: 'Everyday Cash',
                        network: 'Visa',
                        fee: '$0',
                        rates: '3% Groceries, 3% Gas · 1% Base',
                      },
                      {
                        name: 'Travel Rewards',
                        network: 'Mastercard',
                        fee: '$95',
                        rates: '4% Travel, 3% Dining · 1.5% Base',
                      },
                      {
                        name: 'Student Starter',
                        network: 'Visa',
                        fee: '$0',
                        rates: '2% Dining, 2% Shopping · 1% Base',
                      },
                      {
                        name: 'Platinum',
                        network: 'Amex',
                        fee: '$695',
                        rates: '5% Travel, 2% Dining · 1% Base',
                      },
                      {
                        name: 'Dining Plus',
                        network: 'Visa',
                        fee: '$0',
                        rates: '5% Dining, 3% Entertainment · 1% Base',
                      },
                      {
                        name: 'Flat 2% Cash',
                        network: 'Mastercard',
                        fee: '$0',
                        rates: '2% Flat Rate on All Categories',
                      },
                    ].map((prod) => (
                      <div
                        key={prod.name}
                        className="p-2.5 rounded bg-[#11192E] border border-[#1E2B48] flex items-center justify-between"
                      >
                        <div>
                          <span className="font-semibold text-white">{prod.name}</span>{' '}
                          <span className="text-slate-400 font-mono">({prod.network})</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="text-slate-300">{prod.rates}</span>
                          <span className="font-mono text-emerald-400">{prod.fee}/yr</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="col-span-6 panel-inset p-5 flex flex-col justify-between space-y-4">
                  <div className="flex items-center justify-between border-b border-[#1A2540] pb-2.5">
                    <span className="text-sm font-bold text-white">
                      Customer Spend &amp; Reward Optimization Analysis
                    </span>
                    <span className="text-xs font-mono text-emerald-400">
                      Avg Effective Yield: 2.41%
                    </span>
                  </div>

                  <div className="space-y-3 text-xs">
                    {[
                      {
                        cat: 'Travel',
                        spend: '$1,759.00',
                        optimalPct: 92,
                        note: 'High utilization on Platinum (5%) & Travel Rewards (4%)',
                      },
                      {
                        cat: 'Groceries',
                        spend: '$553.69',
                        optimalPct: 74,
                        note: '26% of grocery spend placed on 1%–1.5% cards instead of 3%',
                      },
                      {
                        cat: 'Dining',
                        spend: '$339.45',
                        optimalPct: 61,
                        note: 'Strong utilization opportunity for 3%–5% dining tiers',
                      },
                      {
                        cat: 'Gas & Utilities',
                        spend: '$323.60',
                        optimalPct: 68,
                        note: 'Everyday Cash (3% Gas) & Flat 2% Cash adoption target',
                      },
                    ].map((row) => (
                      <div
                        key={row.cat}
                        className="p-3 rounded bg-[#11192E] border border-[#1E2B48] space-y-1.5"
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-semibold text-white">{row.cat}</span>
                          <span className="font-mono text-slate-300">
                            {row.spend} ·{' '}
                            <span className="text-[#7E8EF7]">{row.optimalPct}% optimal</span>
                          </span>
                        </div>
                        <div className="w-full h-1.5 bg-[#090E1A] rounded overflow-hidden">
                          <div
                            style={{ width: `${row.optimalPct}%` }}
                            className="h-full bg-[#7E8EF7]"
                          />
                        </div>
                        <div className="text-[11px] text-slate-400">{row.note}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* =====================================================================
          STRUCTURED ROLE SPECIFICATION MATRIX (2 Core Portals)
      ===================================================================== */}
      <section className="space-y-4">
        <div className="flex items-baseline justify-between">
          <h2 className="text-lg font-bold text-white">Platform Capabilities</h2>
          <span className="text-xs text-slate-500">
            Dedicated portals for cardholders and credit card companies
          </span>
        </div>

        <div className="panel grid grid-cols-2 divide-x divide-[#1E2B48]">
          <div className="p-6 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono uppercase tracking-wider text-[#7E8EF7]">
                Portal 01
              </span>
              <span className="text-xs text-slate-500">Cardholders</span>
            </div>
            <h3 className="text-base font-bold text-white">Cardholder Workspace</h3>
            <ul className="space-y-2.5 text-xs text-slate-300">
              <li className="flex justify-between py-1.5 border-b border-[#1A2540]">
                <span className="text-slate-400">Connected Credit Cards</span>
                <span className="text-slate-200">Balance, limit &amp; APR tracking</span>
              </li>
              <li className="flex justify-between py-1.5 border-b border-[#1A2540]">
                <span className="text-slate-400">Purchase Activity &amp; Cash Back</span>
                <span className="text-slate-200">Automatic category reward calculation</span>
              </li>
              <li className="flex justify-between py-1.5 border-b border-[#1A2540]">
                <span className="text-slate-400">Spending Breakdown Circle</span>
                <span className="text-emerald-400">Visual category distribution</span>
              </li>
              <li className="flex justify-between py-1.5">
                <span className="text-slate-400">Right-Card Spend Analysis</span>
                <span className="text-[#F85C70]">Missed wallet reward detection</span>
              </li>
            </ul>
          </div>

          <div className="p-6 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono uppercase tracking-wider text-[#F85C70]">
                Portal 02
              </span>
              <span className="text-xs text-slate-500">Credit Card Companies</span>
            </div>
            <h3 className="text-base font-bold text-white">Credit Card Company Portal</h3>
            <ul className="space-y-2.5 text-xs text-slate-300">
              <li className="flex justify-between py-1.5 border-b border-[#1A2540]">
                <span className="text-slate-400">Customer Spend Horizon</span>
                <span className="text-slate-200">Day, Week &amp; Month spend totals</span>
              </li>
              <li className="flex justify-between py-1.5 border-b border-[#1A2540]">
                <span className="text-slate-400">Reward Maximization Analysis</span>
                <span className="text-[#7E8EF7]">Optimal vs suboptimal card usage</span>
              </li>
              <li className="flex justify-between py-1.5 border-b border-[#1A2540]">
                <span className="text-slate-400">Card Product Catalog</span>
                <span className="text-emerald-400">Base rates, category rates &amp; fees</span>
              </li>
              <li className="flex justify-between py-1.5">
                <span className="text-slate-400">Category Volume Intelligence</span>
                <span className="text-slate-200">8-category portfolio breakdown</span>
              </li>
            </ul>
          </div>
        </div>
      </section>
    </div>
  );
}
