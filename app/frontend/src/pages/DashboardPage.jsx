import React, { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import {
  CreditCard,
  Plus,
  RefreshCw,
  UserCheck,
  BarChart3,
  Code2,
  Bell,
  Sparkles,
  CheckCircle2,
  Shield,
} from 'lucide-react';
import SpendSignalLogo from '../components/SpendSignalLogo';
import { useAuth } from '../context/AuthContext';
import { fetchUserCards, fetchCardById, createUserCard } from '../services/api';

const SANDBOX_ENDPOINTS = {
  '/best-card': {
    request: `{
  // interactive variables
  "merchant": "bostontson",
  "amount": 100,
  "wallet": {
    "cards": [
      { "card_0": "01", "apr": 19.99 },
      { "card_1": 300,  "limit": 5000 },
      { "card_3": "16", "limit": 10000 }
    ]
  },
  "Recommendation": "SpendSignal"
}`,
    response: `{
  "recommended_card_id": "card_01",
  "explanation": "Earns 3x points on dining today",
  "estimated_value": 4.50
}`,
  },
  '/wallet-value': {
    request: `{
  "user_id": "usr_alice_01",
  "period": "12m",
  "include_annual_fees": true
}`,
    response: `{
  "annual_fees_total": 550.00,
  "real_spending_return": 780.00,
  "net_roi_value": 230.00,
  "wallet_score": 85
}`,
  },
  '/next-spend': {
    request: `{
  "user_id": "usr_alice_01",
  "lookahead_days": 7
}`,
    response: `{
  "predicted_category": "Groceries",
  "estimated_range": "$120-150",
  "recommended_card": "Blue Cash Preferred (6%)"
}`,
  },
  '/explain': {
    request: `{
  "transaction_id": "tx_90841",
  "merchant": "Publix",
  "amount": 86.42
}`,
    response: `{
  "optimal_card_used": true,
  "cashback_earned": 5.19,
  "leakage_prevented": 3.46
}`,
  },
};

export default function DashboardPage() {
  const { user, isAuthenticated, apiEnvKey } = useAuth();

  // Determine the user's assigned role from MongoDB (defaults to 'user' / Cardholder if not set on schema yet)
  const assignedRole = user?.role || 'user';
  const [activeRoleView, setActiveRoleView] = useState(assignedRole);

  useEffect(() => {
    if (user?.role) {
      setActiveRoleView(user.role);
    }
  }, [user?.role]);

  // Cardholder Wallet state (connected to GET /api/cards & POST /api/cards)
  const [cards, setCards] = useState([]);
  const [selectedCardDetail, setSelectedCardDetail] = useState(null);
  const [loadingCards, setLoadingCards] = useState(false);
  const [showAddCardModal, setShowAddCardModal] = useState(false);
  const [newCard, setNewCard] = useState({
    cardName: 'Sapphire Reserve',
    network: 'Visa',
    last4: '8842',
    creditLimit: '12000',
    currentBalance: '450',
    apr: '21.49',
    expirationDate: '08/2029',
  });
  const [cardError, setCardError] = useState(null);
  const [creatingCard, setCreatingCard] = useState(false);

  // Partner Sandbox state
  const [selectedEndpoint, setSelectedEndpoint] = useState('/best-card');
  const [sandboxRunning, setSandboxRunning] = useState(false);
  const [whiteLabelColorOn, setWhiteLabelColorOn] = useState(true);
  const [quickPayOn, setQuickPayOn] = useState(true);

  const loadUserCards = async () => {
    if (!isAuthenticated) return;
    setLoadingCards(true);
    try {
      const res = await fetchUserCards({ page: 1, limit: 10 });
      setCards(res.data?.data || []);
    } catch {
      setCards([]);
    } finally {
      setLoadingCards(false);
    }
  };

  useEffect(() => {
    loadUserCards();
  }, [isAuthenticated, apiEnvKey]);

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  const handleInspectSingleCard = async (cardId) => {
    try {
      const res = await fetchCardById(cardId);
      setSelectedCardDetail(res.data);
    } catch {
      // ignore
    }
  };

  const handleCreateCard = async (e) => {
    e.preventDefault();
    setCardError(null);
    setCreatingCard(true);
    try {
      await createUserCard({
        cardName: newCard.cardName,
        network: newCard.network,
        last4: newCard.last4,
        creditLimit: Number(newCard.creditLimit),
        currentBalance: Number(newCard.currentBalance || 0),
        apr: Number(newCard.apr),
        expirationDate: newCard.expirationDate,
      });
      setShowAddCardModal(false);
      await loadUserCards();
    } catch (err) {
      setCardError(err.message || 'Failed to create card');
    } finally {
      setCreatingCard(false);
    }
  };

  const totalBalance = cards.reduce((sum, c) => sum + Number(c.currentBalance || 0), 0);
  const totalLimit = cards.reduce((sum, c) => sum + Number(c.creditLimit || 0), 0);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* =====================================================================
          AUTHENTICATED USER & ROLE HEADER BAR
      ===================================================================== */}
      <div className="signal-card p-6 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-signal-indigo/15 border border-signal-indigo/40 flex items-center justify-center text-signal-indigo font-bold text-lg">
            {(user.firstName?.[0] || user.username?.[0] || 'U').toUpperCase()}
          </div>
          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="text-xl sm:text-2xl font-bold text-white">
                Welcome back, {user.firstName ? `${user.firstName} ${user.lastName}` : `@${user.username}`}
              </h1>
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                @{user.username}
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Account Role:{' '}
              <span className="text-slate-200 font-semibold uppercase">{assignedRole}</span>
              {!user.role && (
                <span className="text-slate-500 ml-1.5">
                  (No <code>role</code> field in MongoDB User document yet — preview any role
                  workspace on the right)
                </span>
              )}
            </p>
          </div>
        </div>

        {/* Role Workspace Switcher (so developer can preview User vs Merchant vs Partner dashboards) */}
        <div className="flex items-center gap-1.5 p-1 rounded-xl bg-navy-900 border border-slate-800">
          {[
            { id: 'user', label: 'Cardholder Dashboard', icon: CreditCard },
            { id: 'merchant', label: 'Merchant Portal', icon: BarChart3 },
            { id: 'partner', label: 'Partner Portal', icon: Code2 },
          ].map((tab) => {
            const Icon = tab.icon;
            const active = activeRoleView === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveRoleView(tab.id)}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  active
                    ? 'bg-signal-indigo text-navy-950 shadow'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* =====================================================================
          ROLE VIEW 1: CARDHOLDER / USER DASHBOARD (activeRoleView === 'user')
      ===================================================================== */}
      {activeRoleView === 'user' && (
        <div className="space-y-8">
          {/* Top KPI Summary Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="signal-card p-5">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                Total Balance Spent
              </span>
              <div className="text-3xl font-extrabold text-white mt-1.5">
                ${totalBalance.toLocaleString(undefined, { minimumFractionDigits: 2 })}
              </div>
              <span className="text-xs text-slate-400 mt-1 block">
                Across {cards.length} connected card(s)
              </span>
            </div>

            <div className="signal-card p-5">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                Available Credit
              </span>
              <div className="text-3xl font-extrabold text-emerald-400 mt-1.5">
                $
                {Math.max(0, totalLimit - totalBalance).toLocaleString(undefined, {
                  minimumFractionDigits: 2,
                })}
              </div>
              <span className="text-xs text-slate-400 mt-1 block">
                Total Limit: ${totalLimit.toLocaleString()}
              </span>
            </div>

            <div className="signal-card p-5">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                Card ROI Net Value
              </span>
              <div className="text-3xl font-extrabold text-signal-indigo mt-1.5">+$230</div>
              <span className="text-xs text-slate-400 mt-1 block">
                $780 return vs. $550 annual fees
              </span>
            </div>

            <div className="signal-card p-5">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                Wallet Score
              </span>
              <div className="flex items-baseline gap-2 mt-1.5">
                <span className="text-3xl font-extrabold text-white">85</span>
                <span className="text-sm font-bold text-signal-coral">/ 100</span>
              </div>
              <span className="text-xs text-signal-coral mt-1 block">
                $120/yr unused credits detected
              </span>
            </div>
          </div>

          {/* User's MongoDB Credit Cards Section */}
          <div className="signal-card p-6 sm:p-8">
            <div className="flex flex-wrap items-center justify-between gap-4 pb-6 border-b border-slate-800">
              <div>
                <span className="text-xs font-bold uppercase tracking-widest text-signal-indigo">
                  MongoDB Cards Collection
                </span>
                <h2 className="text-xl font-bold text-white mt-0.5">Your Connected Credit Cards</h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  Loaded from <code>GET /api/cards</code>. Click any card to inspect{' '}
                  <code>GET /api/cards/:cardId</code>.
                </p>
              </div>

              <div className="flex items-center gap-2.5">
                <button
                  type="button"
                  onClick={loadUserCards}
                  className="px-3.5 py-2 rounded-xl bg-navy-800 border border-slate-700 text-xs font-medium text-slate-200 hover:text-white inline-flex items-center gap-1.5"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${loadingCards ? 'animate-spin' : ''}`} />
                  <span>Refresh</span>
                </button>
                <button
                  type="button"
                  onClick={() => setShowAddCardModal((v) => !v)}
                  className="signal-btn-primary text-xs py-2 px-4"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add Card</span>
                </button>
              </div>
            </div>

            {/* Add Card Modal Form */}
            {showAddCardModal && (
              <form
                onSubmit={handleCreateCard}
                className="mt-6 p-5 rounded-2xl bg-navy-900 border border-signal-indigo/40 space-y-4"
              >
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-white">
                    Add New Credit Card (POST /api/cards)
                  </h3>
                  <button
                    type="button"
                    onClick={() => setShowAddCardModal(false)}
                    className="text-xs text-slate-400 hover:text-white"
                  >
                    Cancel
                  </button>
                </div>

                {cardError && (
                  <div className="p-3 rounded-xl bg-signal-coral/15 border border-signal-coral/40 text-xs text-signal-coral">
                    {cardError}
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-6 gap-3">
                  <div className="sm:col-span-2">
                    <label className="block text-[11px] text-slate-400 mb-1">Card Name</label>
                    <input
                      type="text"
                      required
                      value={newCard.cardName}
                      onChange={(e) => setNewCard({ ...newCard, cardName: e.target.value })}
                      className="signal-input py-2 text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] text-slate-400 mb-1">Network</label>
                    <select
                      value={newCard.network}
                      onChange={(e) => setNewCard({ ...newCard, network: e.target.value })}
                      className="signal-input py-2 text-xs"
                    >
                      <option value="Visa">Visa</option>
                      <option value="Mastercard">Mastercard</option>
                      <option value="Amex">Amex</option>
                      <option value="Discover">Discover</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[11px] text-slate-400 mb-1">Last 4 Digits</label>
                    <input
                      type="text"
                      required
                      maxLength={4}
                      pattern="\d{4}"
                      value={newCard.last4}
                      onChange={(e) => setNewCard({ ...newCard, last4: e.target.value })}
                      className="signal-input py-2 text-xs font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] text-slate-400 mb-1">Credit Limit ($)</label>
                    <input
                      type="number"
                      required
                      value={newCard.creditLimit}
                      onChange={(e) => setNewCard({ ...newCard, creditLimit: e.target.value })}
                      className="signal-input py-2 text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] text-slate-400 mb-1">Exp (MM/YYYY)</label>
                    <input
                      type="text"
                      required
                      placeholder="08/2029"
                      value={newCard.expirationDate}
                      onChange={(e) => setNewCard({ ...newCard, expirationDate: e.target.value })}
                      className="signal-input py-2 text-xs font-mono"
                    />
                  </div>
                </div>

                <div className="flex justify-end">
                  <button
                    type="submit"
                    disabled={creatingCard}
                    className="signal-btn-primary text-xs py-2 px-5"
                  >
                    {creatingCard ? 'Saving...' : 'Save Card'}
                  </button>
                </div>
              </form>
            )}

            {/* Cards Grid */}
            <div className="mt-6">
              {cards.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {cards.map((card) => (
                    <div
                      key={card._id}
                      onClick={() => handleInspectSingleCard(card._id)}
                      className="cursor-pointer p-5 rounded-2xl bg-gradient-to-br from-navy-800 via-navy-850 to-navy-900 border border-slate-700/80 hover:border-signal-indigo shadow-lg flex flex-col justify-between space-y-4 transition-all"
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <span className="text-[11px] font-semibold uppercase tracking-wider text-signal-indigo">
                            {card.network}
                          </span>
                          <h3 className="text-lg font-bold text-white">{card.cardName}</h3>
                        </div>
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                            card.status === 'active'
                              ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                              : 'bg-signal-coral/20 text-signal-coral border border-signal-coral/30'
                          }`}
                        >
                          {card.status || 'active'}
                        </span>
                      </div>

                      <div className="font-mono text-base tracking-widest text-slate-200">
                        {card.maskedNumber || `•••• ${card.last4}`}
                      </div>

                      <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-800 text-xs">
                        <div>
                          <span className="text-slate-400 block text-[10px]">Balance</span>
                          <span className="font-bold text-white">
                            ${Number(card.currentBalance).toLocaleString()}
                          </span>
                        </div>
                        <div>
                          <span className="text-slate-400 block text-[10px]">Limit</span>
                          <span className="font-semibold text-slate-200">
                            ${Number(card.creditLimit).toLocaleString()}
                          </span>
                        </div>
                        <div>
                          <span className="text-slate-400 block text-[10px]">APR / Exp</span>
                          <span className="font-semibold text-slate-300">
                            {card.apr}% · {card.expirationDate}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-6 rounded-xl bg-navy-900/70 border border-slate-800 text-center text-sm text-slate-400">
                  No cards found for @{user.username}. Click &quot;Add Card&quot; above to add one!
                </div>
              )}

              {selectedCardDetail && (
                <div className="mt-4 p-4 rounded-xl bg-navy-950 border border-signal-indigo/40 space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-mono text-signal-indigo font-semibold">
                      GET /api/cards/{selectedCardDetail._id}
                    </span>
                    <button
                      type="button"
                      onClick={() => setSelectedCardDetail(null)}
                      className="text-slate-400 hover:text-white"
                    >
                      Close
                    </button>
                  </div>
                  <pre className="text-[11px] font-mono text-emerald-300 overflow-x-auto">
                    {JSON.stringify(selectedCardDetail, null, 2)}
                  </pre>
                </div>
              )}
            </div>
          </div>

          {/* Cardholder SpendSignal Analytics Widgets (Best Card Recommendation, ROI, Leakage) */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Widget 1: Best Card Recommendation */}
            <div className="signal-card p-6 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-bold text-white">Best Card for Next Purchase</h3>
                <span className="px-2 py-0.5 rounded-full bg-signal-indigo/20 text-signal-indigo text-[10px] font-bold">
                  3x–6% Back
                </span>
              </div>
              <div className="p-4 rounded-xl bg-navy-900 border border-signal-indigo/40 space-y-2">
                <div className="text-xs text-slate-400">Recommended Card:</div>
                <div className="text-base font-bold text-white">
                  {cards[0]?.cardName || 'Everyday Cash Visa'}
                </div>
                <p className="text-xs text-slate-300">
                  Use this card at <span className="text-white font-semibold">Groceries & Dining</span>{' '}
                  to maximize your reward multiplier instead of earning 1% base points.
                </p>
              </div>
            </div>

            {/* Widget 2: Category Leakage Breakdown */}
            <div className="signal-card p-6 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-bold text-white">Category Reward Leakage</h3>
                <span className="text-xs font-bold text-signal-coral">Missed: $120/yr</span>
              </div>
              <div className="space-y-2.5 text-xs">
                {[
                  { label: 'Dining (3x eligible)', pct: '65%' },
                  { label: 'Travel ($100 credit unused)', pct: '80%' },
                  { label: 'Groceries (6% eligible)', pct: '40%' },
                ].map((item) => (
                  <div key={item.label} className="space-y-1">
                    <div className="flex justify-between text-slate-300">
                      <span>{item.label}</span>
                      <span>{item.pct}</span>
                    </div>
                    <div className="h-2 rounded-full bg-navy-900 overflow-hidden">
                      <div
                        style={{ width: item.pct }}
                        className="h-full bg-signal-coral rounded-full"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Widget 3: Next Spend Prediction */}
            <div className="signal-card p-6 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-bold text-white">Next Spend Prediction</h3>
                <span className="text-xs font-semibold text-signal-indigo">AI Forecast</span>
              </div>
              <div className="p-4 rounded-xl bg-navy-900 border border-slate-800 space-y-2">
                <div className="text-xs text-slate-400">Upcoming 7-Day Window</div>
                <div className="text-sm font-bold text-white">
                  Grocery purchase ($120–$150) predicted next week
                </div>
                <p className="text-xs text-slate-400">
                  Route to <span className="text-signal-indigo font-semibold">Everyday Cash</span>{' '}
                  for optimal cashback.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* =====================================================================
          ROLE VIEW 2: MERCHANT PORTAL (activeRoleView === 'merchant' — Mockup 3)
      ===================================================================== */}
      {activeRoleView === 'merchant' && (
        <div className="signal-card overflow-hidden">
          <div className="px-6 py-4 bg-navy-900/90 border-b border-slate-800 flex flex-wrap items-center justify-between gap-4">
            <SpendSignalLogo size="sm" portalBadge="Merchant Portal" />
            <div className="flex items-center gap-3">
              <span className="relative p-1.5 rounded-lg bg-navy-800 text-slate-300">
                <Bell className="w-4 h-4" />
                <span className="w-2 h-2 rounded-full bg-signal-coral absolute top-1 right-1" />
              </span>
              <span className="px-3 py-1 rounded-lg bg-navy-800 border border-slate-700 text-xs text-slate-200">
                November 2026 ▾
              </span>
            </div>
          </div>

          <div className="p-6 sm:p-8 space-y-6">
            <div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-white">
                Spend Opportunity Report
              </h2>
              <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
                Metro Atlanta Area • Consented Panel Data
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="p-5 rounded-2xl bg-navy-900/90 border border-slate-800 space-y-1.5">
                <div className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                  YOUR SHARE
                </div>
                <div className="text-3xl font-extrabold text-white">18.4%</div>
                <div className="text-xs text-slate-400">of observed category spend</div>
              </div>

              <div className="p-5 rounded-2xl bg-navy-900/90 border border-slate-800 space-y-1.5">
                <div className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                  LEAKAGE
                </div>
                <div className="text-3xl font-extrabold text-signal-coral">
                  $245,000 <span className="text-base font-semibold">/ mo</span>
                </div>
                <div className="text-xs text-slate-400">to competitor groups</div>
              </div>

              <div className="p-5 rounded-2xl bg-navy-900/90 border border-slate-800 space-y-1.5">
                <div className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                  CATEGORY SPEND
                </div>
                <div className="text-3xl font-extrabold text-signal-indigo">
                  $1.33M <span className="text-base font-semibold">/ mo</span>
                </div>
                <div className="text-xs text-slate-400">Your metro, panel-observed</div>
              </div>

              <div className="p-5 rounded-2xl bg-navy-900/90 border border-slate-800 space-y-1.5">
                <div className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                  READY TO BUY
                </div>
                <div className="text-3xl font-extrabold text-white">1,450</div>
                <div className="text-xs text-slate-400">Households in purchase window</div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              <div className="lg:col-span-6 space-y-6">
                <div className="p-5 rounded-2xl bg-navy-900/90 border border-slate-800 space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-base font-bold text-white">Household Repurchase Timing</h3>
                    <span className="px-2.5 py-1 rounded-md bg-navy-800 border border-slate-700 text-[11px] text-slate-300">
                      Peak purchase window
                    </span>
                  </div>
                  <svg viewBox="0 0 360 150" className="w-full h-40">
                    <path
                      d="M 20 130 C 60 30, 100 30, 145 95 C 190 120, 260 65, 340 120"
                      fill="none"
                      stroke="#7E8EF7"
                      strokeWidth="2.5"
                    />
                    <path
                      d="M 20 130 C 90 105, 160 120, 215 45 C 255 45, 290 95, 340 122"
                      fill="none"
                      stroke="#F85C70"
                      strokeWidth="2.5"
                    />
                    <circle cx="215" cy="45" r="5" fill="#F85C70" stroke="#fff" strokeWidth="2" />
                  </svg>
                  <div className="text-center text-xs text-slate-400">0 to 12 weeks</div>
                </div>

                <div className="p-5 rounded-2xl bg-navy-900/90 border border-slate-800 space-y-3">
                  <div className="text-sm font-bold text-white">Recommended Offer Card</div>
                  <div className="flex flex-wrap items-center justify-between gap-4 border-l-4 border-signal-coral pl-4">
                    <div>
                      <span className="inline-block px-2.5 py-0.5 rounded-full bg-signal-coral text-white text-[10px] font-bold uppercase mb-1">
                        RECOMMENDED OFFER
                      </span>
                      <div className="text-2xl font-extrabold text-white">$15 off $100</div>
                      <div className="text-xs text-slate-400">1,450 households in their window</div>
                    </div>
                    <button
                      type="button"
                      className="px-4 py-2.5 rounded-xl bg-signal-indigo hover:bg-signal-indigoHover text-navy-950 font-bold text-xs transition-all"
                    >
                      Launch Campaign
                    </button>
                  </div>
                </div>
              </div>

              <div className="lg:col-span-6 p-5 rounded-2xl bg-navy-900/90 border border-slate-800 flex flex-col justify-between space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <h3 className="text-base font-bold text-white">90-Day Pilot Lift</h3>
                  <span className="text-xs font-semibold text-slate-200">
                    Incremental Revenue Lift:{' '}
                    <span className="text-emerald-400 font-bold">+24.3%</span>
                  </span>
                </div>

                <div className="h-52 flex items-end justify-between gap-2 px-2 border-b border-slate-800 pb-2">
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
                      className="flex-1 flex flex-col items-center gap-1.5 h-full justify-end"
                    >
                      <div className="w-full flex items-end justify-center gap-1 h-full">
                        <span
                          style={{ height: `${bar.offer}%` }}
                          className="w-2.5 sm:w-3 rounded-t bg-signal-coral"
                        />
                        <span
                          style={{ height: `${bar.holdout}%` }}
                          className="w-2.5 sm:w-3 rounded-t bg-signal-indigo/80"
                        />
                      </div>
                      <span className="text-[10px] text-slate-400">{bar.day}</span>
                    </div>
                  ))}
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3.5 rounded-xl bg-navy-950 border border-slate-800">
                    <div className="text-xs text-slate-400">Offer Group Revenue</div>
                    <div className="text-xl font-extrabold text-white mt-0.5">$1.66M</div>
                  </div>
                  <div className="p-3.5 rounded-xl bg-navy-950 border border-slate-800">
                    <div className="text-xs text-slate-400">Holdout Group Revenue</div>
                    <div className="text-xl font-extrabold text-slate-300 mt-0.5">$1.33M</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* =====================================================================
          ROLE VIEW 3: PARTNER PORTAL (activeRoleView === 'partner' — Mockup 1)
      ===================================================================== */}
      {activeRoleView === 'partner' && (
        <div className="signal-card overflow-hidden">
          <div className="px-6 py-4 bg-navy-900/90 border-b border-slate-800 flex flex-wrap items-center justify-between gap-4">
            <SpendSignalLogo size="sm" uppercase={true} portalBadge="Partner Portal" />
            <div className="flex items-center gap-6 text-xs font-medium text-slate-400">
              <span className="text-white border-b-2 border-signal-indigo pb-1 font-semibold">
                API Sandbox
              </span>
              <span>White-Label Builder</span>
              <span>Cohort Analytics</span>
            </div>
          </div>

          <div className="p-6 grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* API Sandbox */}
            <div className="lg:col-span-4 rounded-2xl bg-navy-900/90 border border-slate-800 p-5 flex flex-col justify-between space-y-4">
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-bold text-white">API Sandbox</h3>
                  <p className="text-xs text-slate-400">Test endpoints console</p>
                </div>

                <div className="grid grid-cols-12 gap-2 rounded-xl bg-navy-950 border border-slate-800 p-2.5">
                  <div className="col-span-5 space-y-1 pr-1 border-r border-slate-800/80">
                    {Object.keys(SANDBOX_ENDPOINTS).map((ep) => (
                      <button
                        key={ep}
                        type="button"
                        onClick={() => setSelectedEndpoint(ep)}
                        className={`w-full text-left px-2.5 py-2 rounded-lg text-xs font-mono transition-colors ${
                          selectedEndpoint === ep
                            ? 'bg-signal-indigo/20 text-white font-semibold border-l-2 border-signal-indigo'
                            : 'text-slate-400 hover:text-slate-200'
                        }`}
                      >
                        {ep}
                      </button>
                    ))}
                  </div>
                  <div className="col-span-7 pl-1 overflow-x-auto">
                    <pre className="text-[11px] font-mono text-slate-200 leading-relaxed">
                      {SANDBOX_ENDPOINTS[selectedEndpoint].request}
                    </pre>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setSandboxRunning(true);
                    setTimeout(() => setSandboxRunning(false), 300);
                  }}
                  className="w-full py-2.5 rounded-xl bg-signal-indigo hover:bg-signal-indigoHover text-navy-950 font-bold text-sm transition-all shadow-glow"
                >
                  {sandboxRunning ? 'Running Request...' : 'Test Request'}
                </button>
              </div>

              <div className="rounded-xl bg-navy-950 border border-slate-800 p-3.5 space-y-1.5">
                <div className="text-xs font-semibold text-slate-300">Response</div>
                <pre className="text-[11px] font-mono text-emerald-300 overflow-x-auto">
                  {SANDBOX_ENDPOINTS[selectedEndpoint].response}
                </pre>
              </div>
            </div>

            {/* White-Label Preview */}
            <div className="lg:col-span-4 rounded-2xl bg-navy-900/90 border border-slate-800 p-5 space-y-4">
              <h3 className="text-lg font-bold text-white">White-Label Preview</h3>
              <div className="rounded-[2rem] bg-navy-950 border-2 border-slate-700 p-3.5 max-w-[270px] mx-auto space-y-3 shadow-xl">
                <div className="flex items-center justify-between text-[10px] text-slate-400 px-2">
                  <span>9:41</span>
                  <span className="font-semibold text-slate-300">Apex Bank</span>
                  <span>•••</span>
                </div>
                <div className="bg-slate-200 text-navy-950 rounded-xl p-3 space-y-1">
                  <div className="text-sm font-extrabold">Checkout</div>
                  <div className="flex items-center justify-between text-xs text-slate-700">
                    <span>Total amount</span>
                    <span className="font-bold">$5.30</span>
                  </div>
                </div>
                <div className="p-3 rounded-xl bg-navy-800 border border-signal-indigo/60 shadow-glow space-y-2.5">
                  <div className="text-[11px] leading-tight">
                    <div className="text-slate-300">SpendSignal Recommendation:</div>
                    <div className="font-bold text-white">Use your Blue Cash Preferred</div>
                    <div className="text-slate-300 text-[10px]">
                      Earns <span className="text-signal-indigo font-semibold">6% Cash Back</span>{' '}
                      on Groceries
                    </div>
                  </div>
                  <div className="flex items-center justify-between pt-1">
                    <button
                      type="button"
                      onClick={() => setQuickPayOn((v) => !v)}
                      className={`w-8 h-4 rounded-full px-0.5 flex items-center ${
                        quickPayOn ? 'bg-signal-indigo justify-end' : 'bg-slate-700'
                      }`}
                    >
                      <span className="w-3 h-3 rounded-full bg-white" />
                    </button>
                    <span className="px-2.5 py-0.5 rounded bg-navy-900 border border-signal-indigo/50 text-[10px] text-signal-indigo font-semibold">
                      Quick Pay
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Pilot Cohort vs Control Segment */}
            <div className="lg:col-span-4 rounded-2xl bg-navy-900/90 border border-slate-800 p-5 flex flex-col justify-between space-y-4">
              <div>
                <h3 className="text-lg font-bold text-white">Pilot Cohort vs Control Segment</h3>
                <p className="text-xs text-slate-400">Engaged Users &amp; Top-of-Wallet Lift</p>
                <div className="grid grid-cols-2 gap-3 mt-4">
                  <div>
                    <div className="text-[10px] uppercase text-slate-400">TOP-OF-WALLET LIFT:</div>
                    <div className="text-2xl font-extrabold text-signal-indigo mt-0.5">
                      +14.8% ↑
                    </div>
                  </div>
                  <div>
                    <div className="text-[10px] uppercase text-slate-400">DAILY ENGAGEMENT:</div>
                    <div className="text-xl font-extrabold text-signal-indigo mt-0.5">84.3%</div>
                    <div className="text-[11px] text-slate-400">vs. 41.5% (Control)</div>
                  </div>
                </div>
              </div>

              <svg viewBox="0 0 300 150" className="w-full h-36">
                <path
                  d="M 25 125 Q 65 105, 95 112 T 165 95 T 235 78 T 288 85"
                  fill="none"
                  stroke="#64748b"
                  strokeWidth="2"
                  strokeDasharray="4 4"
                />
                <path
                  d="M 25 122 Q 65 95, 95 100 T 165 55 T 235 32 T 288 22"
                  fill="none"
                  stroke="#7E8EF7"
                  strokeWidth="3"
                />
                <circle cx="288" cy="22" r="4" fill="#7E8EF7" />
              </svg>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

