import React, { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import SpendSignalLogo from '../components/SpendSignalLogo';
import { useAuth } from '../context/AuthContext';
import { fetchUserCards, fetchCardById, createUserCard } from '../services/api';

const SANDBOX_ENDPOINTS = {
  '/best-card': {
    request: `{
  "merchant": "bostontson",
  "amount": 100,
  "wallet": {
    "card_0": "01",
    "card_1": 300,
    "card_3": "16",
    "card_4": 200
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

  const assignedRole = user?.role || 'user';
  const [activeRoleView, setActiveRoleView] = useState(assignedRole);

  useEffect(() => {
    if (user?.role) {
      setActiveRoleView(user.role);
    }
  }, [user?.role]);

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
    <div className="max-w-[1400px] mx-auto px-8 py-8 space-y-6">
      {/* =====================================================================
          SUB-NAVIGATION & ROLE BAR
      ===================================================================== */}
      <div className="flex items-center justify-between border-b border-[#1E2B48] pb-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-xl font-bold text-white">
              {user.firstName ? `${user.firstName} ${user.lastName}` : user.username}
            </h1>
            <span className="text-xs font-mono text-slate-400">@{user.username}</span>
            <span className="px-2 py-0.5 rounded bg-[#16213B] border border-[#263659] text-[11px] text-slate-300">
              Role: {assignedRole}
            </span>
          </div>
        </div>

        {/* Role View Switcher */}
        <div className="flex items-center gap-1 bg-[#11192E] border border-[#1E2B48] p-1 rounded-md">
          {[
            { id: 'user', label: 'Cardholder Workspace' },
            { id: 'merchant', label: 'Merchant Portal' },
            { id: 'partner', label: 'Partner Portal' },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveRoleView(tab.id)}
              className={`px-3.5 py-1.5 rounded text-xs font-medium transition-colors ${
                activeRoleView === tab.id
                  ? 'bg-[#7E8EF7] text-[#090E1A] font-semibold'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* =====================================================================
          ROLE VIEW 1: CARDHOLDER WORKSPACE
      ===================================================================== */}
      {activeRoleView === 'user' && (
        <div className="space-y-6">
          {/* KPI Strip */}
          <div className="panel grid grid-cols-4 divide-x divide-[#1E2B48]">
            <div className="p-5">
              <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                Total Balance Spent
              </div>
              <div className="text-2xl font-bold text-white tabular-nums mt-1">
                ${totalBalance.toLocaleString(undefined, { minimumFractionDigits: 2 })}
              </div>
              <div className="text-xs text-slate-500 mt-1">{cards.length} active card(s)</div>
            </div>

            <div className="p-5">
              <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                Available Credit
              </div>
              <div className="text-2xl font-bold text-emerald-400 tabular-nums mt-1">
                $
                {Math.max(0, totalLimit - totalBalance).toLocaleString(undefined, {
                  minimumFractionDigits: 2,
                })}
              </div>
              <div className="text-xs text-slate-500 mt-1">
                Credit Limit: ${totalLimit.toLocaleString()}
              </div>
            </div>

            <div className="p-5">
              <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                Card ROI Net Value
              </div>
              <div className="text-2xl font-bold text-[#7E8EF7] tabular-nums mt-1">+$230.00</div>
              <div className="text-xs text-slate-500 mt-1">$780 return vs $550 fee</div>
            </div>

            <div className="p-5">
              <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                Wallet Score &amp; Leakage
              </div>
              <div className="text-2xl font-bold text-white tabular-nums mt-1">
                85 <span className="text-sm font-normal text-slate-400">/ 100</span>
              </div>
              <div className="text-xs text-[#F85C70] mt-1">$120/yr unused credits</div>
            </div>
          </div>

          {/* Connected Cards Table + Add Card */}
          <div className="panel overflow-hidden">
            <div className="px-6 py-4 bg-[#0D1426] border-b border-[#1E2B48] flex items-center justify-between">
              <div>
                <h2 className="text-sm font-bold text-white">Connected Credit Cards</h2>
                <p className="text-xs text-slate-400">
                  Synced with MongoDB <code>cards</code> collection (<code>GET /api/cards</code>)
                </p>
              </div>
              <div className="flex items-center gap-2.5">
                <button
                  type="button"
                  onClick={loadUserCards}
                  className="btn-secondary text-xs py-1.5 px-3"
                >
                  {loadingCards ? 'Loading...' : 'Refresh'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowAddCardModal((v) => !v)}
                  className="btn-primary text-xs py-1.5 px-3.5"
                >
                  + Add Card
                </button>
              </div>
            </div>

            {showAddCardModal && (
              <form
                onSubmit={handleCreateCard}
                className="p-6 bg-[#0B1120] border-b border-[#1E2B48] space-y-4"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-[#7E8EF7]">
                    New Card (POST /api/cards)
                  </span>
                  <button
                    type="button"
                    onClick={() => setShowAddCardModal(false)}
                    className="text-xs text-slate-400 hover:text-white"
                  >
                    Cancel
                  </button>
                </div>

                {cardError && (
                  <div className="p-3 rounded bg-[#F85C70]/10 border border-[#F85C70]/40 text-xs text-[#F85C70]">
                    {cardError}
                  </div>
                )}

                <div className="grid grid-cols-6 gap-3">
                  <div className="col-span-2">
                    <label className="block text-[11px] text-slate-400 mb-1">Card Name</label>
                    <input
                      type="text"
                      required
                      value={newCard.cardName}
                      onChange={(e) => setNewCard({ ...newCard, cardName: e.target.value })}
                      className="field-input py-1.5 text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] text-slate-400 mb-1">Network</label>
                    <select
                      value={newCard.network}
                      onChange={(e) => setNewCard({ ...newCard, network: e.target.value })}
                      className="field-input py-1.5 text-xs"
                    >
                      <option value="Visa">Visa</option>
                      <option value="Mastercard">Mastercard</option>
                      <option value="Amex">Amex</option>
                      <option value="Discover">Discover</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[11px] text-slate-400 mb-1">Last 4</label>
                    <input
                      type="text"
                      required
                      maxLength={4}
                      pattern="\d{4}"
                      value={newCard.last4}
                      onChange={(e) => setNewCard({ ...newCard, last4: e.target.value })}
                      className="field-input py-1.5 text-xs font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] text-slate-400 mb-1">Limit ($)</label>
                    <input
                      type="number"
                      required
                      value={newCard.creditLimit}
                      onChange={(e) => setNewCard({ ...newCard, creditLimit: e.target.value })}
                      className="field-input py-1.5 text-xs"
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
                      className="field-input py-1.5 text-xs font-mono"
                    />
                  </div>
                </div>

                <div className="flex justify-end">
                  <button type="submit" disabled={creatingCard} className="btn-primary text-xs">
                    {creatingCard ? 'Saving...' : 'Save Card'}
                  </button>
                </div>
              </form>
            )}

            {cards.length > 0 ? (
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-[#1E2B48] text-slate-400 bg-[#0B1120]/60">
                    <th className="py-3 px-6 font-medium">Card Name</th>
                    <th className="py-3 px-4 font-medium">Network &amp; Number</th>
                    <th className="py-3 px-4 font-medium">Status</th>
                    <th className="py-3 px-4 font-medium text-right">Current Balance</th>
                    <th className="py-3 px-4 font-medium text-right">Credit Limit</th>
                    <th className="py-3 px-4 font-medium text-right">Available</th>
                    <th className="py-3 px-6 font-medium text-right">APR / Exp</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#1A2540]">
                  {cards.map((card) => (
                    <tr
                      key={card._id}
                      onClick={() => handleInspectSingleCard(card._id)}
                      className="hover:bg-[#16213B]/60 cursor-pointer transition-colors"
                    >
                      <td className="py-3.5 px-6 font-semibold text-white">{card.cardName}</td>
                      <td className="py-3.5 px-4 font-mono text-slate-300">
                        {card.network} · {card.maskedNumber || `•••• ${card.last4}`}
                      </td>
                      <td className="py-3.5 px-4">
                        <span
                          className={`px-2 py-0.5 rounded text-[11px] font-medium ${
                            card.status === 'active'
                              ? 'bg-emerald-500/15 text-emerald-300'
                              : 'bg-[#F85C70]/15 text-[#F85C70]'
                          }`}
                        >
                          {card.status || 'active'}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right font-mono font-semibold text-white tabular-nums">
                        ${Number(card.currentBalance).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                      </td>
                      <td className="py-3.5 px-4 text-right font-mono text-slate-300 tabular-nums">
                        ${Number(card.creditLimit).toLocaleString()}
                      </td>
                      <td className="py-3.5 px-4 text-right font-mono text-emerald-400 tabular-nums">
                        ${Number(card.availableCredit ?? card.creditLimit - card.currentBalance).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                      </td>
                      <td className="py-3.5 px-6 text-right font-mono text-slate-400 tabular-nums">
                        {card.apr}% · {card.expirationDate}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="p-8 text-center text-xs text-slate-400">
                No credit cards found for @{user.username}. Click &quot;+ Add Card&quot; to add one.
              </div>
            )}

            {selectedCardDetail && (
              <div className="p-4 bg-[#070B14] border-t border-[#1E2B48] space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-mono text-[#7E8EF7]">
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

          {/* 3 Cardholder Optimization Panels */}
          <div className="grid grid-cols-3 gap-5">
            <div className="panel p-5 space-y-3">
              <div className="flex items-center justify-between border-b border-[#1E2B48] pb-2.5">
                <span className="text-sm font-bold text-white">Best Card Recommendation</span>
                <span className="text-xs font-mono text-[#F85C70]">3x Dining</span>
              </div>
              <div className="text-xs text-slate-300 leading-relaxed">
                Recommended for next purchase:{' '}
                <strong className="text-white">
                  {cards[0]?.cardName || 'Everyday Cash Visa'}
                </strong>
                . Earns 3x–6% category cashback vs 1% standard rate.
              </div>
            </div>

            <div className="panel p-5 space-y-3">
              <div className="flex items-center justify-between border-b border-[#1E2B48] pb-2.5">
                <span className="text-sm font-bold text-white">Category Leakage</span>
                <span className="text-xs font-mono text-[#F85C70]">Missed: $120/yr</span>
              </div>
              <div className="space-y-2 text-xs">
                {[
                  { label: 'Dining', pct: '65%' },
                  { label: 'Travel ($100 credit)', pct: '80%' },
                ].map((item) => (
                  <div key={item.label} className="flex items-center gap-3">
                    <span className="w-32 text-slate-400">{item.label}</span>
                    <div className="flex-1 h-2 bg-[#090E1A] rounded-xs overflow-hidden">
                      <div style={{ width: item.pct }} className="h-full bg-[#F85C70]" />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="panel p-5 space-y-3">
              <div className="flex items-center justify-between border-b border-[#1E2B48] pb-2.5">
                <span className="text-sm font-bold text-white">Next Spend Forecast</span>
                <span className="text-xs font-mono text-[#7E8EF7]">7-Day Window</span>
              </div>
              <div className="text-xs text-slate-300 leading-relaxed">
                Predicted grocery spend of <strong className="text-white">$120–$150</strong> next
                week. Route to your highest grocery multiplier card.
              </div>
            </div>
          </div>
        </div>
      )}

      {/* =====================================================================
          ROLE VIEW 2: MERCHANT PORTAL
      ===================================================================== */}
      {activeRoleView === 'merchant' && (
        <div className="panel overflow-hidden">
          <div className="px-6 py-4 bg-[#0D1426] border-b border-[#1E2B48] flex items-center justify-between">
            <SpendSignalLogo size="sm" portalBadge="Merchant Portal · Spend Opportunity Report" />
            <span className="text-xs text-slate-400 font-mono">
              Metro Atlanta Area · November 2026
            </span>
          </div>

          <div className="p-6 space-y-6">
            <div className="grid grid-cols-4 gap-4">
              <div className="panel-inset p-4">
                <div className="text-[11px] font-semibold uppercase text-slate-400">YOUR SHARE</div>
                <div className="text-2xl font-bold text-white tabular-nums mt-1">18.4%</div>
                <div className="text-xs text-slate-500 mt-0.5">of observed category spend</div>
              </div>
              <div className="panel-inset p-4">
                <div className="text-[11px] font-semibold uppercase text-slate-400">LEAKAGE</div>
                <div className="text-2xl font-bold text-[#F85C70] tabular-nums mt-1">
                  $245,000 / mo
                </div>
                <div className="text-xs text-slate-500 mt-0.5">to competitor groups</div>
              </div>
              <div className="panel-inset p-4">
                <div className="text-[11px] font-semibold uppercase text-slate-400">
                  CATEGORY SPEND
                </div>
                <div className="text-2xl font-bold text-[#7E8EF7] tabular-nums mt-1">
                  $1.33M / mo
                </div>
                <div className="text-xs text-slate-500 mt-0.5">Your metro, panel-observed</div>
              </div>
              <div className="panel-inset p-4">
                <div className="text-[11px] font-semibold uppercase text-slate-400">
                  READY TO BUY
                </div>
                <div className="text-2xl font-bold text-white tabular-nums mt-1">1,450</div>
                <div className="text-xs text-slate-500 mt-0.5">Households in purchase window</div>
              </div>
            </div>

            <div className="grid grid-cols-12 gap-5">
              <div className="col-span-6 space-y-5">
                <div className="panel-inset p-5 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-bold text-white">
                      Household Repurchase Timing
                    </span>
                    <span className="text-xs text-slate-400">Peak purchase window (Week 8)</span>
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
                    <circle cx="215" cy="35" r="4" fill="#F85C70" />
                  </svg>
                </div>

                <div className="panel-inset p-5 flex items-center justify-between border-l-2 border-l-[#F85C70]">
                  <div>
                    <span className="text-[10px] font-mono uppercase text-[#F85C70] block">
                      Recommended Offer
                    </span>
                    <div className="text-lg font-bold text-white">
                      $15 off $100 · 1,450 households in window
                    </div>
                  </div>
                  <button type="button" className="btn-primary text-xs">
                    Launch Campaign
                  </button>
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
                        <span style={{ height: `${bar.offer}%` }} className="w-2.5 bg-[#F85C70]" />
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
        </div>
      )}

      {/* =====================================================================
          ROLE VIEW 3: PARTNER PORTAL
      ===================================================================== */}
      {activeRoleView === 'partner' && (
        <div className="panel overflow-hidden">
          <div className="px-6 py-4 bg-[#0D1426] border-b border-[#1E2B48] flex items-center justify-between">
            <SpendSignalLogo size="sm" uppercase={true} portalBadge="Partner Portal" />
            <span className="text-xs text-slate-400 font-mono">
              API Sandbox · White-Label Builder · Cohort Analytics
            </span>
          </div>

          <div className="p-6 grid grid-cols-12 gap-5">
            <div className="col-span-4 panel-inset p-5 flex flex-col justify-between space-y-4">
              <div className="space-y-3">
                <div className="text-sm font-bold text-white">API Sandbox</div>
                <div className="grid grid-cols-12 gap-2 rounded bg-[#070B14] border border-[#1A2540] p-2">
                  <div className="col-span-5 space-y-1 border-r border-[#1A2540] pr-1">
                    {Object.keys(SANDBOX_ENDPOINTS).map((ep) => (
                      <button
                        key={ep}
                        type="button"
                        onClick={() => setSelectedEndpoint(ep)}
                        className={`w-full text-left px-2 py-1.5 rounded text-xs font-mono ${
                          selectedEndpoint === ep
                            ? 'bg-[#182442] text-white font-semibold'
                            : 'text-slate-400 hover:text-slate-200'
                        }`}
                      >
                        {ep}
                      </button>
                    ))}
                  </div>
                  <div className="col-span-7 pl-1 overflow-x-auto">
                    <pre className="text-[11px] font-mono text-slate-300">
                      {SANDBOX_ENDPOINTS[selectedEndpoint].request}
                    </pre>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setSandboxRunning(true);
                    setTimeout(() => setSandboxRunning(false), 250);
                  }}
                  className="btn-primary w-full text-xs py-2"
                >
                  {sandboxRunning ? 'Executing...' : 'Test Request'}
                </button>
              </div>

              <div className="space-y-1">
                <div className="text-xs text-slate-400">Response</div>
                <pre className="p-3 rounded bg-[#070B14] border border-[#1A2540] text-[11px] font-mono text-emerald-300 overflow-x-auto">
                  {SANDBOX_ENDPOINTS[selectedEndpoint].response}
                </pre>
              </div>
            </div>

            <div className="col-span-4 panel-inset p-5 flex flex-col justify-between space-y-4">
              <div className="space-y-3">
                <div className="text-sm font-bold text-white">White-Label Web Preview</div>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="flex items-center justify-between bg-[#11192E] px-2.5 py-1.5 rounded border border-[#1E2B48]">
                    <span className="text-slate-400">Branding</span>
                    <span className="font-mono text-slate-200">White-Label</span>
                  </div>
                  <div className="flex items-center justify-between bg-[#11192E] px-2.5 py-1.5 rounded border border-[#1E2B48]">
                    <span className="text-slate-400">Accent</span>
                    <button
                      type="button"
                      onClick={() => setWhiteLabelColorOn((v) => !v)}
                      className={`w-7 h-4 rounded-full px-0.5 flex items-center ${
                        whiteLabelColorOn ? 'bg-[#7E8EF7] justify-end' : 'bg-slate-700'
                      }`}
                    >
                      <span className="w-3 h-3 rounded-full bg-white" />
                    </button>
                  </div>
                </div>
              </div>

              <div className="p-4 rounded bg-[#11192E] border border-[#263659] space-y-3">
                <div className="flex items-center justify-between text-xs border-b border-[#1E2B48] pb-2">
                  <span className="font-semibold text-white">Apex Bank Web Checkout</span>
                  <span className="font-mono text-slate-200">$5.30</span>
                </div>
                <div className="p-3 rounded bg-[#16213B] border border-[#7E8EF7]/50 space-y-2">
                  <div className="text-xs font-bold text-white">Use your Blue Cash Preferred</div>
                  <div className="text-[11px] text-slate-300">
                    Earns <span className="text-[#7E8EF7] font-semibold">6% Cash Back</span> on
                    Groceries
                  </div>
                  <div className="flex items-center justify-between pt-1">
                    <button
                      type="button"
                      onClick={() => setQuickPayOn((v) => !v)}
                      className={`w-7 h-4 rounded-full px-0.5 flex items-center ${
                        quickPayOn ? 'bg-[#7E8EF7] justify-end' : 'bg-slate-700'
                      }`}
                    >
                      <span className="w-3 h-3 rounded-full bg-white" />
                    </button>
                    <span className="px-2 py-0.5 rounded bg-[#090E1A] border border-[#7E8EF7]/40 text-[10px] text-[#7E8EF7] font-mono">
                      Quick Pay
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="col-span-4 panel-inset p-5 flex flex-col justify-between space-y-4">
              <div>
                <div className="text-sm font-bold text-white">
                  Pilot Cohort vs Control Segment
                </div>
                <div className="text-xs text-slate-400">Engaged Users &amp; Top-of-Wallet Lift</div>
                <div className="grid grid-cols-2 gap-3 mt-4">
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
        </div>
      )}
    </div>
  );
}
