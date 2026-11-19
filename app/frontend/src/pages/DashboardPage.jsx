import React, { useState, useEffect, useMemo } from 'react';
import { Navigate } from 'react-router-dom';
import SpendSignalLogo from '../components/SpendSignalLogo';
import { useAuth } from '../context/AuthContext';
import {
  fetchUserCards,
  fetchCardById,
  createUserCard,
  deleteUserCard,
  fetchCardProducts,
  createCardProduct,
  fetchUserTransactions,
  fetchTransactionById,
  createUserTransaction,
  deleteUserTransaction,
  fetchTransactionAnalysis,
  fetchCompanySummary,
  fetchCompanyCategoryAnalysis,
  fetchAdminUsers,
  createCompanyAccount,
  createAdminAccount,
  adminChangeUserPassword,
  TRANSACTION_CATEGORIES,
  DEFAULT_CARD_PRODUCTS,
} from '../services/api';

const CARD_NETWORKS = ['Visa', 'Mastercard', 'Amex', 'Discover'];

const CATEGORY_COLORS = {
  Travel: '#7E8EF7',
  Groceries: '#F85C70',
  Dining: '#34D399',
  Gas: '#FBBF24',
  Utilities: '#38BDF8',
  Shopping: '#A78BFA',
  Entertainment: '#F472B6',
  Other: '#94A3B8',
};

const PRODUCT_ID_CACHE_KEY = 'spendsignal_product_ids_production';

// Convert user-entered percentage (e.g. 1.5 -> 0.015) while preserving decimal rates (e.g. 0.015)
function normalizeRateInput(rawValue) {
  const num = Number(rawValue);
  if (Number.isNaN(num) || num < 0) return 0;
  return num > 1 ? Math.round((num / 100) * 10000) / 10000 : num;
}

// Helper to get the reward rate of a card (using flattened product rates) or fallback template
function getCardRateForCategory(cardOrName, category) {
  if (!cardOrName) return 0.01;
  if (typeof cardOrName === 'object') {
    const productObj =
      cardOrName.baseRate != null
        ? cardOrName
        : cardOrName.cardProductId && typeof cardOrName.cardProductId === 'object'
        ? cardOrName.cardProductId
        : null;

    if (productObj && productObj.baseRate != null) {
      const catRates = productObj.categoryRates || {};
      const targetKey = String(category || '').toLowerCase();
      for (const [k, v] of Object.entries(catRates)) {
        if (k.toLowerCase() === targetKey) return Number(v);
      }
      return Number(productObj.baseRate);
    }

    cardOrName = cardOrName.cardName;
  }

  const normalized = String(cardOrName || '').toLowerCase().trim();
  const match = DEFAULT_CARD_PRODUCTS.find(
    (p) =>
      normalized.includes(p.name.toLowerCase()) ||
      p.name.toLowerCase().includes(normalized)
  );
  if (!match) return 0.01;
  return match.categoryRates[category] ?? match.baseRate;
}

function formatCardRatesSummary(card) {
  if (!card || card.baseRate == null) return null;
  const baseStr = `${(Number(card.baseRate) * 100).toFixed(1)}% base`;
  const catEntries = Object.entries(card.categoryRates || {});
  if (catEntries.length === 0) return baseStr;
  const catStr = catEntries
    .map(([k, v]) => `${k} ${(Number(v) * 100).toFixed(0)}%`)
    .join(', ');
  return `${baseStr} · ${catStr}`;
}

export default function DashboardPage() {
  const { user, isAuthenticated } = useAuth();

  // Strictly lock the user to their assigned role portal
  const assignedRole = user?.role || 'user';

  // --- Cards state ---
  const [cards, setCards] = useState([]);
  const [cardsPagination, setCardsPagination] = useState(null);
  const [selectedCardDetail, setSelectedCardDetail] = useState(null);
  const [loadingCards, setLoadingCards] = useState(false);
  const [showAddCardModal, setShowAddCardModal] = useState(false);
  const [cardProducts, setCardProducts] = useState([]);
  const [newCard, setNewCard] = useState({
    cardName: 'Everyday Cash',
    cardProduct: '',
    last4: '8842',
    creditLimit: '5000',
    currentBalance: '0',
    apr: '19.99',
    expirationDate: '08/2029',
  });
  const [cardError, setCardError] = useState(null);
  const [creatingCard, setCreatingCard] = useState(false);
  const [deletingCardId, setDeletingCardId] = useState(null);

  // Cards table search & sorting
  const [searchQuery, setSearchQuery] = useState('');
  const [sortField, setSortField] = useState('cardName');
  const [sortDir, setSortDir] = useState('asc');

  // --- Transactions state ---
  const [transactions, setTransactions] = useState([]);
  const [selectedTransDetail, setSelectedTransDetail] = useState(null);
  const [loadingTrans, setLoadingTrans] = useState(false);
  const [showAddTransModal, setShowAddTransModal] = useState(false);
  const [newTrans, setNewTrans] = useState({
    merchant: '',
    category: 'Dining',
    amount: '',
    cardId: '',
  });
  const [transError, setTransError] = useState(null);
  const [creatingTrans, setCreatingTrans] = useState(false);
  const [deletingTransId, setDeletingTransId] = useState(null);

  // Transactions filter & sort
  const [transSearch, setTransSearch] = useState('');
  const [transCategoryFilter, setTransCategoryFilter] = useState('ALL');
  const [transSortField, setTransSortField] = useState('transactionDate');
  const [transSortDir, setTransSortDir] = useState('desc');

  // --- Consumer Analysis state ---
  const [transAnalysis, setTransAnalysis] = useState(null);

  // --- Credit Card Company Portal state ---
  const [companyHorizon, setCompanyHorizon] = useState('month'); // 'day' | 'week' | 'month'
  const [companySummary, setCompanySummary] = useState(null);
  const [companyCategoryData, setCompanyCategoryData] = useState(null);
  const [loadingCompanySummary, setLoadingCompanySummary] = useState(false);
  const [loadingCompanyCategories, setLoadingCompanyCategories] = useState(false);
  const [companyError, setCompanyError] = useState(null);
  const [showCreateProductModal, setShowCreateProductModal] = useState(false);
  const [newProduct, setNewProduct] = useState({
    name: '',
    network: 'Visa',
    annualFee: '0',
    baseRate: '1.5',
    categoryRates: {},
  });
  const [creatingProduct, setCreatingProduct] = useState(false);
  const [productFormError, setProductFormError] = useState(null);
  const [productFormSuccess, setProductFormSuccess] = useState(null);

  // --- Admin state ---
  const [adminUsers, setAdminUsers] = useState([]);
  const [loadingAdminUsers, setLoadingAdminUsers] = useState(false);
  const [adminError, setAdminError] = useState(null);
  const [adminSuccess, setAdminSuccess] = useState(null);
  const [newCompanyForm, setNewCompanyForm] = useState({
    firstName: '',
    lastName: '',
    username: '',
    email: '',
    companyName: '',
    password: '',
  });
  const [newAdminForm, setNewAdminForm] = useState({
    firstName: '',
    lastName: '',
    username: '',
    email: '',
    password: '',
  });
  const [passwordResetForm, setPasswordResetForm] = useState({
    userId: '',
    password: '',
  });

  // Merge CardProducts from backend with default metadata; prefer live DB products when present
  const mergedCardProducts = useMemo(() => {
    let cachedMap = {};
    try {
      cachedMap = JSON.parse(localStorage.getItem(PRODUCT_ID_CACHE_KEY) || '{}');
    } catch {
      cachedMap = {};
    }

    cards.forEach((c) => {
      const rawProd = c.cardProductId || c.cardProduct;
      const prodId = typeof rawProd === 'object' && rawProd !== null ? rawProd._id : rawProd;
      const prodName =
        typeof rawProd === 'object' && rawProd?.name ? rawProd.name : c.cardName;
      if (prodId && prodName) {
        cachedMap[prodName] = String(prodId);
      }
    });

    cardProducts.forEach((p) => {
      if (p?._id && p?.name) {
        cachedMap[p.name] = String(p._id);
      }
    });

    try {
      localStorage.setItem(PRODUCT_ID_CACHE_KEY, JSON.stringify(cachedMap));
    } catch {
      // ignore storage errors
    }

    if (cardProducts.length > 0) {
      return cardProducts.map((apiProd) => {
        const defaultMeta = DEFAULT_CARD_PRODUCTS.find(
          (d) => d.name.toLowerCase() === apiProd.name?.toLowerCase()
        );
        return {
          defaultApr: defaultMeta?.defaultApr ?? 19.99,
          defaultLimit: defaultMeta?.defaultLimit ?? 5000,
          ...apiProd,
          categoryRates: apiProd.categoryRates || {},
        };
      });
    }

    return DEFAULT_CARD_PRODUCTS.map((def) => ({
      ...def,
      _id: cachedMap[def.name] || '',
    }));
  }, [cardProducts, cards]);

  const loadCardProducts = async () => {
    if (!isAuthenticated) return;
    try {
      const res = await fetchCardProducts();
      if (Array.isArray(res.data)) {
        setCardProducts(res.data);
      }
    } catch {
      // Fallback gracefully if endpoint is not available
    }
  };

  const loadUserCards = async () => {
    if (!isAuthenticated || assignedRole !== 'user') return;
    setLoadingCards(true);
    try {
      const res = await fetchUserCards({ page: 1, limit: 50 });
      const fetchedCards = res.data?.data || [];
      setCards(fetchedCards);
      setCardsPagination(res.data?.pagination || null);
      if (fetchedCards.length > 0 && !newTrans.cardId) {
        setNewTrans((prev) => ({ ...prev, cardId: fetchedCards[0]._id }));
      }
    } catch {
      setCards([]);
    } finally {
      setLoadingCards(false);
    }
  };

  const loadUserTransactions = async () => {
    if (!isAuthenticated || assignedRole !== 'user') return;
    setLoadingTrans(true);
    try {
      const res = await fetchUserTransactions({ page: 1, limit: 50 });
      setTransactions(res.data?.data || []);
    } catch {
      setTransactions([]);
    } finally {
      setLoadingTrans(false);
    }
  };

  const loadTransactionAnalysis = async () => {
    if (!isAuthenticated || assignedRole !== 'user') return;
    try {
      const res = await fetchTransactionAnalysis();
      if (res.data && typeof res.data === 'object') {
        setTransAnalysis(res.data);
      }
    } catch {
      setTransAnalysis(null);
    }
  };

  const loadCompanySummary = async () => {
    if (!isAuthenticated || assignedRole !== 'company') return;
    setLoadingCompanySummary(true);
    setCompanyError(null);
    try {
      const res = await fetchCompanySummary();
      setCompanySummary(res.data || null);
    } catch (err) {
      setCompanyError(err.message || 'Could not load company summary analytics');
    } finally {
      setLoadingCompanySummary(false);
    }
  };

  const loadCompanyCategoryAnalysis = async (windowVal = companyHorizon) => {
    if (!isAuthenticated || assignedRole !== 'company') return;
    setLoadingCompanyCategories(true);
    setCompanyError(null);
    try {
      const res = await fetchCompanyCategoryAnalysis(windowVal);
      setCompanyCategoryData(res.data || null);
    } catch (err) {
      setCompanyError(err.message || 'Could not load category analysis');
    } finally {
      setLoadingCompanyCategories(false);
    }
  };

  const loadAdminAccounts = async () => {
    if (!isAuthenticated || assignedRole !== 'admin') return;
    setLoadingAdminUsers(true);
    setAdminError(null);
    try {
      const res = await fetchAdminUsers();
      setAdminUsers(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      setAdminError(err.message || 'Could not load accounts');
    } finally {
      setLoadingAdminUsers(false);
    }
  };

  useEffect(() => {
    if (!isAuthenticated) return;
    if (assignedRole === 'user') {
      loadCardProducts();
      loadUserCards();
      loadUserTransactions();
      loadTransactionAnalysis();
    } else if (assignedRole === 'company') {
      loadCardProducts();
      loadCompanySummary();
    } else if (assignedRole === 'admin') {
      loadAdminAccounts();
    }
  }, [isAuthenticated, assignedRole]);

  useEffect(() => {
    if (!isAuthenticated || assignedRole !== 'company') return;
    loadCompanyCategoryAnalysis(companyHorizon);
  }, [companyHorizon, isAuthenticated, assignedRole]);

  // Auto-select first known cardProduct _id when available
  useEffect(() => {
    if (!newCard.cardProduct) {
      const firstWithId = mergedCardProducts.find((p) => p._id);
      if (firstWithId) {
        setNewCard((prev) => ({
          ...prev,
          cardName: firstWithId.name,
          cardProduct: firstWithId._id,
          apr: String(firstWithId.defaultApr ?? 19.99),
          creditLimit: String(firstWithId.defaultLimit ?? 5000),
        }));
      }
    }
  }, [mergedCardProducts, newCard.cardProduct]);

  const handleSort = (field) => {
    if (sortField === field) {
      setSortDir((prev) => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortField(field);
      setSortDir('asc');
    }
  };

  const handleTransSort = (field) => {
    if (transSortField === field) {
      setTransSortDir((prev) => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setTransSortField(field);
      setTransSortDir('desc');
    }
  };

  const filteredAndSortedCards = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    const filtered = q
      ? cards.filter(
          (c) =>
            String(c.cardName || '')
              .toLowerCase()
              .includes(q) ||
            String(c.network || '')
              .toLowerCase()
              .includes(q) ||
            String(c.last4 || '').includes(q)
        )
      : [...cards];

    filtered.sort((a, b) => {
      let valA = a[sortField];
      let valB = b[sortField];
      if (['currentBalance', 'creditLimit', 'apr'].includes(sortField)) {
        valA = Number(valA || 0);
        valB = Number(valB || 0);
      } else {
        valA = String(valA || '').toLowerCase();
        valB = String(valB || '').toLowerCase();
      }
      if (valA < valB) return sortDir === 'asc' ? -1 : 1;
      if (valA > valB) return sortDir === 'asc' ? 1 : -1;
      return 0;
    });

    return filtered;
  }, [cards, searchQuery, sortField, sortDir]);

  const cardByIdMap = useMemo(() => {
    const map = {};
    cards.forEach((c) => {
      map[c._id] = c;
    });
    return map;
  }, [cards]);

  const filteredAndSortedTransactions = useMemo(() => {
    const q = transSearch.trim().toLowerCase();
    const filtered = transactions.filter((t) => {
      if (transCategoryFilter !== 'ALL' && t.category !== transCategoryFilter) {
        return false;
      }
      if (!q) return true;
      const card = cardByIdMap[t.cardId];
      return (
        String(t.merchant || '')
          .toLowerCase()
          .includes(q) ||
        String(t.category || '')
          .toLowerCase()
          .includes(q) ||
        String(t.status || '')
          .toLowerCase()
          .includes(q) ||
        String(card?.cardName || '')
          .toLowerCase()
          .includes(q)
      );
    });

    filtered.sort((a, b) => {
      let valA = a[transSortField];
      let valB = b[transSortField];
      if (['amount', 'rewardRate', 'rewardsEarned'].includes(transSortField)) {
        valA = Number(valA || 0);
        valB = Number(valB || 0);
      } else if (transSortField === 'transactionDate') {
        valA = new Date(valA || 0).getTime();
        valB = new Date(valB || 0).getTime();
      } else {
        valA = String(valA || '').toLowerCase();
        valB = String(valB || '').toLowerCase();
      }
      if (valA < valB) return transSortDir === 'asc' ? -1 : 1;
      if (valA > valB) return transSortDir === 'asc' ? 1 : -1;
      return 0;
    });

    return filtered;
  }, [transactions, transSearch, transCategoryFilter, transSortField, transSortDir, cardByIdMap]);

  // --- Consumer Analytics: Category Breakdown Circle & Right-Card Optimization ---
  const consumerAnalytics = useMemo(() => {
    const validTx = transactions.filter((t) => t.status !== 'declined');
    const totalRewardsEarned = validTx.reduce((sum, t) => sum + Number(t.rewardsEarned || 0), 0);

    // Prefer live server-side analysis from GET /api/transactions/analysis
    if (transAnalysis && Array.isArray(transAnalysis.categoryBreakdown)) {
      const categorySegments = transAnalysis.categoryBreakdown.map((c) => ({
        category: c.category,
        amount: Number(c.totalSpend || 0),
        pct: Number(c.percentOfSpend || 0),
        transactions: c.transactions || 0,
        color: CATEGORY_COLORS[c.category] || '#94A3B8',
      }));

      const wrongCardFindings = (transAnalysis.rightCardAnalysis?.transactions || []).map(
        (item) => ({
          _id: item.transactionId,
          merchant: item.merchant,
          category: item.category,
          amount: Number(item.amount || 0),
          usedCardName: item.cardUsed
            ? `${item.cardUsed.cardName} (•••• ${item.cardUsed.last4})`
            : 'Used Card',
          actualRate: Number(item.cardUsed?.rewardRate || 0),
          bestCardName: item.betterCard
            ? `${item.betterCard.cardName} (•••• ${item.betterCard.last4})`
            : 'Better Card',
          bestRate: Number(item.betterCard?.rewardRate || 0),
          missed: Number(item.missedRewards || 0),
        })
      );

      return {
        totalTrackedSpend: Number(transAnalysis.totalSpend || 0),
        totalRewardsEarned,
        categorySegments,
        wrongCardFindings,
        totalMissedRewardsInWallet: Number(
          transAnalysis.rightCardAnalysis?.totalMissedRewards || 0
        ),
      };
    }

    // Fallback computation using flattened card rates if analysis endpoint is unavailable
    const totalTrackedSpend = validTx.reduce((sum, t) => sum + Number(t.amount || 0), 0);
    const catTotals = {};
    TRANSACTION_CATEGORIES.forEach((cat) => {
      catTotals[cat] = 0;
    });
    validTx.forEach((t) => {
      const cat = t.category || 'Other';
      catTotals[cat] = (catTotals[cat] || 0) + Number(t.amount || 0);
    });

    const categorySegments = Object.entries(catTotals)
      .filter(([, amt]) => amt > 0)
      .sort((a, b) => b[1] - a[1])
      .map(([category, amount]) => ({
        category,
        amount,
        pct: totalTrackedSpend > 0 ? (amount / totalTrackedSpend) * 100 : 0,
        color: CATEGORY_COLORS[category] || '#94A3B8',
      }));

    const activeWalletCards = cards.filter((c) => c.status !== 'closed');
    const wrongCardFindings = [];
    let totalMissedRewardsInWallet = 0;

    validTx.forEach((t) => {
      const usedCard = cardByIdMap[t.cardId];
      const actualRate = Number(t.rewardRate || 0);
      let bestCard = usedCard;
      let bestRate = actualRate;

      activeWalletCards.forEach((candidateCard) => {
        const candidateRate = getCardRateForCategory(candidateCard, t.category);
        if (candidateRate > bestRate + 0.0001) {
          bestRate = candidateRate;
          bestCard = candidateCard;
        }
      });

      if (bestCard && bestRate > actualRate + 0.0001) {
        const potentialReward = Math.round(Number(t.amount) * bestRate * 100) / 100;
        const actualReward = Number(t.rewardsEarned || 0);
        const missed = Math.max(0, Math.round((potentialReward - actualReward) * 100) / 100);
        totalMissedRewardsInWallet += missed;
        wrongCardFindings.push({
          _id: t._id,
          merchant: t.merchant,
          category: t.category,
          amount: Number(t.amount),
          usedCardName: usedCard ? `${usedCard.cardName} (•••• ${usedCard.last4})` : 'Used Card',
          actualRate,
          bestCardName: `${bestCard.cardName} (•••• ${bestCard.last4})`,
          bestRate,
          missed,
        });
      }
    });

    return {
      totalTrackedSpend,
      totalRewardsEarned,
      categorySegments,
      wrongCardFindings,
      totalMissedRewardsInWallet: Math.round(totalMissedRewardsInWallet * 100) / 100,
    };
  }, [transAnalysis, transactions, cards, cardByIdMap]);

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

  const handleSelectProductPreset = (prod) => {
    setNewCard((prev) => ({
      ...prev,
      cardName: prod.name,
      cardProduct: prod._id || '',
      apr: String(prod.defaultApr ?? prev.apr),
      creditLimit: String(prod.defaultLimit ?? prev.creditLimit),
    }));
  };

  const handleCreateCard = async (e) => {
    e.preventDefault();
    setCardError(null);

    const normalizedName = newCard.cardName.trim().toLowerCase();
    const matchedProd = mergedCardProducts.find(
      (p) => p.name?.toLowerCase() === normalizedName
    );
    const matchedExistingCard = cards.find(
      (c) => c.cardName?.toLowerCase() === normalizedName
    );
    const existingCardProdId =
      typeof matchedExistingCard?.cardProductId === 'object'
        ? matchedExistingCard.cardProductId?._id
        : matchedExistingCard?.cardProductId;

    const resolvedCardProduct =
      newCard.cardProduct?.trim() ||
      matchedProd?._id ||
      existingCardProdId ||
      newCard.cardName.trim();

    setCreatingCard(true);
    try {
      await createUserCard({
        cardName: newCard.cardName.trim(),
        cardProduct: String(resolvedCardProduct),
        last4: newCard.last4.trim(),
        creditLimit: Number(newCard.creditLimit),
        currentBalance: Number(newCard.currentBalance || 0),
        apr: Number(newCard.apr),
        expirationDate: newCard.expirationDate.trim(),
      });
      setShowAddCardModal(false);
      await Promise.all([loadUserCards(), loadTransactionAnalysis()]);
    } catch (err) {
      setCardError(err.message || 'Failed to create card');
    } finally {
      setCreatingCard(false);
    }
  };

  const handleDeleteCard = async (e, cardId) => {
    e.stopPropagation();
    setCardError(null);
    setDeletingCardId(cardId);
    try {
      await deleteUserCard(cardId);
      if (selectedCardDetail?._id === cardId) {
        setSelectedCardDetail(null);
      }
      await Promise.all([loadUserCards(), loadTransactionAnalysis()]);
    } catch (err) {
      setCardError(err.message || 'Failed to delete card');
    } finally {
      setDeletingCardId(null);
    }
  };

  const handleInspectSingleTrans = async (transId) => {
    try {
      const res = await fetchTransactionById(transId);
      setSelectedTransDetail(res.data);
    } catch {
      // ignore
    }
  };

  const handleCreateTransaction = async (e) => {
    e.preventDefault();
    setTransError(null);

    const targetCardId = newTrans.cardId || cards[0]?._id;
    if (!targetCardId) {
      setTransError('Please add or select a credit card before logging a transaction.');
      return;
    }

    setCreatingTrans(true);
    try {
      await createUserTransaction({
        merchant: newTrans.merchant.trim(),
        category: newTrans.category,
        amount: Number(newTrans.amount),
        cardId: targetCardId,
      });
      setNewTrans((prev) => ({ ...prev, merchant: '', amount: '' }));
      setShowAddTransModal(false);
      await Promise.all([loadUserTransactions(), loadTransactionAnalysis()]);
    } catch (err) {
      setTransError(err.message || 'Failed to create transaction');
    } finally {
      setCreatingTrans(false);
    }
  };

  const handleDeleteTransaction = async (e, transId) => {
    e.stopPropagation();
    setTransError(null);
    setDeletingTransId(transId);
    try {
      await deleteUserTransaction(transId);
      if (selectedTransDetail?._id === transId) {
        setSelectedTransDetail(null);
      }
      await Promise.all([loadUserTransactions(), loadTransactionAnalysis()]);
    } catch (err) {
      setTransError(err.message || 'Failed to delete transaction');
    } finally {
      setDeletingTransId(null);
    }
  };

  const handleCreateCardProduct = async (e) => {
    e.preventDefault();
    setProductFormError(null);
    setProductFormSuccess(null);

    if (!newProduct.name.trim()) {
      setProductFormError('Product name is required.');
      return;
    }

    const parsedCategoryRates = {};
    Object.entries(newProduct.categoryRates || {}).forEach(([cat, rawVal]) => {
      if (rawVal !== '' && rawVal != null) {
        parsedCategoryRates[cat] = normalizeRateInput(rawVal);
      }
    });

    setCreatingProduct(true);
    try {
      const res = await createCardProduct({
        name: newProduct.name.trim(),
        network: newProduct.network,
        annualFee: Number(newProduct.annualFee || 0),
        baseRate: normalizeRateInput(newProduct.baseRate),
        categoryRates: parsedCategoryRates,
      });
      setProductFormSuccess(`Created card product "${res.data?.name || newProduct.name.trim()}".`);
      setNewProduct({
        name: '',
        network: 'Visa',
        annualFee: '0',
        baseRate: '1.5',
        categoryRates: {},
      });
      setShowCreateProductModal(false);
      await loadCardProducts();
    } catch (err) {
      setProductFormError(err.message || 'Failed to create card product');
    } finally {
      setCreatingProduct(false);
    }
  };

  const handleCreateCompanyUser = async (e) => {
    e.preventDefault();
    setAdminError(null);
    setAdminSuccess(null);
    try {
      const res = await createCompanyAccount(newCompanyForm);
      setAdminSuccess(res.data?.message || 'Credit Card Company account created.');
      setNewCompanyForm({
        firstName: '',
        lastName: '',
        username: '',
        email: '',
        companyName: '',
        password: '',
      });
      await loadAdminAccounts();
    } catch (err) {
      setAdminError(err.message || 'Failed to create company account');
    }
  };

  const handleCreateAdminUser = async (e) => {
    e.preventDefault();
    setAdminError(null);
    setAdminSuccess(null);
    try {
      const res = await createAdminAccount(newAdminForm);
      setAdminSuccess(res.data?.message || 'Admin account created.');
      setNewAdminForm({
        firstName: '',
        lastName: '',
        username: '',
        email: '',
        password: '',
      });
      await loadAdminAccounts();
    } catch (err) {
      setAdminError(err.message || 'Failed to create admin account');
    }
  };

  const handleAdminResetPassword = async (e) => {
    e.preventDefault();
    setAdminError(null);
    setAdminSuccess(null);
    try {
      const res = await adminChangeUserPassword(
        passwordResetForm.userId.trim(),
        passwordResetForm.password
      );
      setAdminSuccess(res.data?.message || 'Password updated successfully.');
      setPasswordResetForm({ userId: '', password: '' });
    } catch (err) {
      setAdminError(err.message || 'Failed to update password');
    }
  };

  const totalBalance = cards.reduce((sum, c) => sum + Number(c.currentBalance || 0), 0);
  const totalLimit = cards.reduce((sum, c) => sum + Number(c.creditLimit || 0), 0);

  const renderSortIndicator = (field) => {
    if (sortField !== field) return <span className="text-slate-600 ml-1">↕</span>;
    return <span className="text-[#7E8EF7] ml-1">{sortDir === 'asc' ? '↑' : '↓'}</span>;
  };

  const renderTransSortIndicator = (field) => {
    if (transSortField !== field) return <span className="text-slate-600 ml-1">↕</span>;
    return <span className="text-[#7E8EF7] ml-1">{transSortDir === 'asc' ? '↑' : '↓'}</span>;
  };

  // Build SVG Donut circle strokes for Category Breakdown
  const donutCircumference = 2 * Math.PI * 38;
  let cumulativeDash = 0;

  return (
    <div className="max-w-[1400px] mx-auto px-8 py-8 space-y-6">
      {/* =====================================================================
          USER HEADER BAR (Locked to the signed-in user's assigned portal)
      ===================================================================== */}
      <div className="flex items-center justify-between border-b border-[#1E2B48] pb-4">
        <div className="flex items-center gap-3">
          <h1 className="text-xl font-bold text-white">
            {user.firstName ? `${user.firstName} ${user.lastName}` : user.username}
          </h1>
          <span className="text-xs font-mono text-slate-400">@{user.username}</span>
        </div>

        <div className="text-xs text-slate-400">
          {assignedRole === 'company'
            ? 'Credit Card Company Portal'
            : assignedRole === 'admin'
            ? 'Administration Portal'
            : 'Cardholder Workspace'}
        </div>
      </div>

      {/* =====================================================================
          PORTAL 1: CONSUMER / CARDHOLDER WORKSPACE (Only accessible to role: 'user')
      ===================================================================== */}
      {assignedRole === 'user' && (
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
              <div className="text-xs text-slate-500 mt-1">
                {cards.length} connected card(s) ({cardsPagination?.total ?? cards.length} total)
              </div>
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
                Tracked Transaction Volume
              </div>
              <div className="text-2xl font-bold text-[#7E8EF7] tabular-nums mt-1">
                $
                {consumerAnalytics.totalTrackedSpend.toLocaleString(undefined, {
                  minimumFractionDigits: 2,
                })}
              </div>
              <div className="text-xs text-slate-500 mt-1">
                Across {transactions.length} recorded transaction(s)
              </div>
            </div>

            <div className="p-5">
              <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                Rewards Earned &amp; Missed
              </div>
              <div className="text-2xl font-bold text-emerald-400 tabular-nums mt-1">
                +${consumerAnalytics.totalRewardsEarned.toFixed(2)}
              </div>
              <div className="text-xs text-[#F85C70] mt-1">
                {consumerAnalytics.wrongCardFindings.length > 0
                  ? `$${consumerAnalytics.totalMissedRewardsInWallet.toFixed(2)} missed on ${
                      consumerAnalytics.wrongCardFindings.length
                    } suboptimal swipe(s)`
                  : '100% optimal card selection'}
              </div>
            </div>
          </div>

          {/* 2 Consumer Analytics Panels: Category Breakdown Circle + Right-Card Spend Analysis */}
          <div className="grid grid-cols-12 gap-5">
            {/* Panel 1: Spending Breakdown Circle */}
            <div className="col-span-5 panel p-5 flex flex-col justify-between space-y-4">
              <div className="flex items-center justify-between border-b border-[#1E2B48] pb-2.5">
                <div>
                  <h3 className="text-sm font-bold text-white">Spending Breakdown Circle</h3>
                  <p className="text-xs text-slate-400">By purchase category</p>
                </div>
                <span className="text-xs font-mono text-[#7E8EF7]">
                  {consumerAnalytics.categorySegments.length} Categories
                </span>
              </div>

              {consumerAnalytics.categorySegments.length > 0 ? (
                <div className="grid grid-cols-12 gap-4 items-center py-2">
                  <div className="col-span-5 flex items-center justify-center">
                    <div className="relative w-36 h-36">
                      <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
                        <circle
                          cx="50"
                          cy="50"
                          r="38"
                          fill="none"
                          stroke="#1E2B48"
                          strokeWidth="12"
                        />
                        {consumerAnalytics.categorySegments.map((seg) => {
                          const segLen = (seg.pct / 100) * donutCircumference;
                          const dashArray = `${segLen} ${donutCircumference}`;
                          const dashOffset = -cumulativeDash;
                          cumulativeDash += segLen;
                          return (
                            <circle
                              key={seg.category}
                              cx="50"
                              cy="50"
                              r="38"
                              fill="none"
                              stroke={seg.color}
                              strokeWidth="12"
                              strokeDasharray={dashArray}
                              strokeDashoffset={dashOffset}
                            />
                          );
                        })}
                      </svg>
                      <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                        <span className="text-[10px] uppercase text-slate-400">Total Spend</span>
                        <span className="text-sm font-bold text-white tabular-nums">
                          ${consumerAnalytics.totalTrackedSpend.toFixed(0)}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="col-span-7 space-y-2 text-xs max-h-44 overflow-y-auto pr-1">
                    {consumerAnalytics.categorySegments.map((seg) => (
                      <div key={seg.category} className="flex items-center justify-between">
                        <span className="flex items-center gap-2 text-slate-300">
                          <span
                            className="w-2.5 h-2.5 rounded-full inline-block"
                            style={{ backgroundColor: seg.color }}
                          />
                          {seg.category}
                        </span>
                        <span className="font-mono text-slate-200 tabular-nums">
                          ${seg.amount.toFixed(2)} ({seg.pct.toFixed(1)}%)
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="py-12 text-center text-xs text-slate-400">
                  Log transactions below to generate your category spending circle.
                </div>
              )}
            </div>

            {/* Panel 2: Right-Card Spending Analysis */}
            <div className="col-span-7 panel p-5 flex flex-col justify-between space-y-4">
              <div className="flex items-center justify-between border-b border-[#1E2B48] pb-2.5">
                <div>
                  <h3 className="text-sm font-bold text-white">Right-Card Spend Analysis</h3>
                  <p className="text-xs text-slate-400">
                    Checks whether you used the highest-earning card in your wallet for each
                    purchase
                  </p>
                </div>
                <span className="text-xs font-mono text-[#F85C70]">
                  {consumerAnalytics.wrongCardFindings.length} Flagged
                </span>
              </div>

              {consumerAnalytics.wrongCardFindings.length > 0 ? (
                <div className="grid grid-cols-2 gap-3 max-h-52 overflow-y-auto pr-1">
                  {consumerAnalytics.wrongCardFindings.map((item) => (
                    <div
                      key={item._id}
                      className="p-3 rounded bg-[#0B1120] border border-[#1E2B48] space-y-1.5 text-xs"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-white">
                          {item.merchant}{' '}
                          <span className="text-slate-400 font-normal">({item.category})</span>
                        </span>
                        <span className="font-mono text-[#F85C70]">
                          +${item.missed.toFixed(2)} missed
                        </span>
                      </div>
                      <div className="text-[11px] text-slate-400">
                        Paid <strong className="text-slate-200">${item.amount.toFixed(2)}</strong>{' '}
                        with <span className="text-slate-200">{item.usedCardName}</span> at{' '}
                        <span className="text-[#F85C70] font-mono">
                          {(item.actualRate * 100).toFixed(1)}%
                        </span>
                        .
                      </div>
                      <div className="text-[11px] text-emerald-300">
                        Use <strong>{item.bestCardName}</strong> instead for{' '}
                        <span className="font-mono font-semibold">
                          {(item.bestRate * 100).toFixed(1)}%
                        </span>{' '}
                        back!
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-12 text-center text-xs text-emerald-400">
                  Every recorded purchase used the highest-earning card in your wallet!
                </div>
              )}

              <div className="p-2.5 rounded bg-[#0B1120] border border-[#1E2B48] flex items-center justify-between text-xs">
                <span className="text-slate-400">Potential Extra Wallet Cash Back</span>
                <span className="font-mono font-bold text-[#F85C70]">
                  +${consumerAnalytics.totalMissedRewardsInWallet.toFixed(2)}
                </span>
              </div>
            </div>
          </div>

          {/* =================================================================
              CONNECTED CREDIT CARDS TABLE
          ================================================================= */}
          <div className="panel overflow-hidden">
            <div className="px-6 py-4 bg-[#0D1426] border-b border-[#1E2B48] flex items-center justify-between gap-4">
              <div>
                <h2 className="text-sm font-bold text-white">Connected Credit Cards</h2>
                <p className="text-xs text-slate-400">
                  Click any column header to sort, filter by keyword, or select a card to view
                  details
                </p>
              </div>
              <div className="flex items-center gap-2.5">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Filter cards (name, network, last 4)..."
                  className="field-input py-1.5 text-xs w-64"
                />
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

            {cardError && !showAddCardModal && (
              <div className="mx-6 mt-4 p-3 rounded bg-[#F85C70]/10 border border-[#F85C70]/40 text-xs text-[#F85C70]">
                {cardError}
              </div>
            )}

            {showAddCardModal && (
              <form
                onSubmit={handleCreateCard}
                className="p-6 bg-[#0B1120] border-b border-[#1E2B48] space-y-4"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-xs font-bold uppercase tracking-wider text-[#7E8EF7]">
                      Add a Credit Card
                    </span>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      Select your card product template and enter your card details below.
                    </p>
                  </div>
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

                {/* Quick-pick Card Product Templates */}
                <div className="space-y-1.5">
                  <div className="text-[11px] text-slate-400">
                    Choose a Card Product Template:
                  </div>
                  <div className="grid grid-cols-6 gap-2">
                    {mergedCardProducts.map((prod) => {
                      const isSelected =
                        newCard.cardName.toLowerCase() === prod.name.toLowerCase();
                      return (
                        <button
                          key={prod.name}
                          type="button"
                          onClick={() => handleSelectProductPreset(prod)}
                          className={`p-2 rounded border text-left text-xs transition-colors ${
                            isSelected
                              ? 'bg-[#182442] border-[#7E8EF7] text-white'
                              : 'bg-[#11192E] border-[#1E2B48] text-slate-300 hover:border-slate-500'
                          }`}
                        >
                          <div className="font-semibold truncate">{prod.name}</div>
                          <div className="text-[10px] font-mono text-slate-400">
                            {prod.network} · {(prod.baseRate * 100).toFixed(1)}% base
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="grid grid-cols-12 gap-3">
                  <div className="col-span-3">
                    <label className="block text-[11px] text-slate-400 mb-1">
                      Card Name <span className="text-[#F85C70]">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      maxLength={50}
                      value={newCard.cardName}
                      onChange={(e) => setNewCard({ ...newCard, cardName: e.target.value })}
                      className="field-input py-1.5 text-xs"
                    />
                  </div>

                  <div className="col-span-2">
                    <label className="block text-[11px] text-slate-400 mb-1">
                      Last 4 <span className="text-[#F85C70]">*</span>
                    </label>
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

                  <div className="col-span-2">
                    <label className="block text-[11px] text-slate-400 mb-1">
                      Limit ($) <span className="text-[#F85C70]">*</span>
                    </label>
                    <input
                      type="number"
                      required
                      min="0"
                      step="1"
                      value={newCard.creditLimit}
                      onChange={(e) => setNewCard({ ...newCard, creditLimit: e.target.value })}
                      className="field-input py-1.5 text-xs font-mono"
                    />
                  </div>

                  <div className="col-span-2">
                    <label className="block text-[11px] text-slate-400 mb-1">Balance ($)</label>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={newCard.currentBalance}
                      onChange={(e) => setNewCard({ ...newCard, currentBalance: e.target.value })}
                      className="field-input py-1.5 text-xs font-mono"
                    />
                  </div>

                  <div className="col-span-1">
                    <label className="block text-[11px] text-slate-400 mb-1">
                      APR (%) <span className="text-[#F85C70]">*</span>
                    </label>
                    <input
                      type="number"
                      required
                      min="0"
                      max="100"
                      step="0.01"
                      value={newCard.apr}
                      onChange={(e) => setNewCard({ ...newCard, apr: e.target.value })}
                      className="field-input py-1.5 text-xs font-mono"
                    />
                  </div>

                  <div className="col-span-2">
                    <label className="block text-[11px] text-slate-400 mb-1">
                      Exp (MM/YYYY) <span className="text-[#F85C70]">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="08/2029"
                      pattern="(0[1-9]|1[0-2])/\d{4}"
                      value={newCard.expirationDate}
                      onChange={(e) => setNewCard({ ...newCard, expirationDate: e.target.value })}
                      className="field-input py-1.5 text-xs font-mono"
                    />
                  </div>
                </div>

                <div className="flex justify-end pt-1">
                  <button type="submit" disabled={creatingCard} className="btn-primary text-xs">
                    {creatingCard ? 'Saving...' : 'Save Card'}
                  </button>
                </div>
              </form>
            )}

            {filteredAndSortedCards.length > 0 ? (
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-[#1E2B48] text-slate-400 bg-[#0B1120]/60 select-none">
                    <th
                      onClick={() => handleSort('cardName')}
                      className="py-3 px-6 font-medium cursor-pointer hover:text-white"
                    >
                      Card Name {renderSortIndicator('cardName')}
                    </th>
                    <th
                      onClick={() => handleSort('network')}
                      className="py-3 px-4 font-medium cursor-pointer hover:text-white"
                    >
                      Network &amp; Number {renderSortIndicator('network')}
                    </th>
                    <th className="py-3 px-4 font-medium">Status</th>
                    <th className="py-3 px-4 font-medium">Reward Rates</th>
                    <th
                      onClick={() => handleSort('currentBalance')}
                      className="py-3 px-4 font-medium text-right cursor-pointer hover:text-white"
                    >
                      Current Balance {renderSortIndicator('currentBalance')}
                    </th>
                    <th
                      onClick={() => handleSort('creditLimit')}
                      className="py-3 px-4 font-medium text-right cursor-pointer hover:text-white"
                    >
                      Credit Limit {renderSortIndicator('creditLimit')}
                    </th>
                    <th className="py-3 px-4 font-medium text-right">Available</th>
                    <th
                      onClick={() => handleSort('apr')}
                      className="py-3 px-4 font-medium text-right cursor-pointer hover:text-white"
                    >
                      APR / Exp {renderSortIndicator('apr')}
                    </th>
                    <th className="py-3 px-6 font-medium text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#1A2540]">
                  {filteredAndSortedCards.map((card) => {
                    const ratesSummary = formatCardRatesSummary(card);
                    return (
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
                        <td className="py-3.5 px-4 text-[11px] text-slate-300">
                          {ratesSummary || '—'}
                        </td>
                        <td className="py-3.5 px-4 text-right font-mono font-semibold text-white tabular-nums">
                          $
                          {Number(card.currentBalance).toLocaleString(undefined, {
                            minimumFractionDigits: 2,
                          })}
                        </td>
                        <td className="py-3.5 px-4 text-right font-mono text-slate-300 tabular-nums">
                          ${Number(card.creditLimit).toLocaleString()}
                        </td>
                        <td className="py-3.5 px-4 text-right font-mono text-emerald-400 tabular-nums">
                          $
                          {Number(
                            card.availableCredit ?? card.creditLimit - card.currentBalance
                          ).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                        </td>
                        <td className="py-3.5 px-4 text-right font-mono text-slate-400 tabular-nums">
                          {card.apr}% · {card.expirationDate}
                        </td>
                        <td className="py-3.5 px-6 text-right">
                          <button
                            type="button"
                            disabled={deletingCardId === card._id}
                            onClick={(e) => handleDeleteCard(e, card._id)}
                            className="px-2.5 py-1 rounded bg-[#F85C70]/15 hover:bg-[#F85C70]/30 text-[#F85C70] text-[11px] font-medium transition-colors"
                          >
                            {deletingCardId === card._id ? 'Removing...' : 'Remove'}
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            ) : (
              <div className="p-8 text-center text-xs text-slate-400">
                {searchQuery
                  ? `No cards matching "${searchQuery}".`
                  : `No credit cards found for @${user.username}. Click "+ Add Card" to add one.`}
              </div>
            )}

            {selectedCardDetail && (
              <div className="p-4 bg-[#070B14] border-t border-[#1E2B48] flex items-center justify-between gap-4 text-xs">
                <div className="flex flex-wrap items-center gap-6">
                  <div>
                    <span className="text-slate-400">Card: </span>
                    <strong className="text-white">{selectedCardDetail.cardName}</strong>
                  </div>
                  <div>
                    <span className="text-slate-400">Network: </span>
                    <span className="text-slate-200 font-mono">
                      {selectedCardDetail.network} •••• {selectedCardDetail.last4}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400">Available Credit: </span>
                    <span className="text-emerald-400 font-mono">
                      $
                      {Number(
                        selectedCardDetail.availableCredit ??
                          selectedCardDetail.creditLimit - selectedCardDetail.currentBalance
                      ).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400">APR: </span>
                    <span className="text-slate-200 font-mono">{selectedCardDetail.apr}%</span>
                  </div>
                  <div>
                    <span className="text-slate-400">Expires: </span>
                    <span className="text-slate-200 font-mono">
                      {selectedCardDetail.expirationDate}
                    </span>
                  </div>
                  {formatCardRatesSummary(selectedCardDetail) && (
                    <div>
                      <span className="text-slate-400">Rewards: </span>
                      <span className="text-[#7E8EF7]">
                        {formatCardRatesSummary(selectedCardDetail)}
                      </span>
                    </div>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedCardDetail(null)}
                  className="text-slate-400 hover:text-white shrink-0"
                >
                  Close
                </button>
              </div>
            )}
          </div>

          {/* =================================================================
              TRANSACTIONS TABLE
          ================================================================= */}
          <div className="panel overflow-hidden">
            <div className="px-6 py-4 bg-[#0D1426] border-b border-[#1E2B48] flex items-center justify-between gap-4">
              <div>
                <h2 className="text-sm font-bold text-white">Card Transactions &amp; Rewards</h2>
                <p className="text-xs text-slate-400">
                  Filter by category or merchant, click any column to sort, or log a new purchase
                </p>
              </div>

              <div className="flex items-center gap-2.5">
                <select
                  value={transCategoryFilter}
                  onChange={(e) => setTransCategoryFilter(e.target.value)}
                  className="field-input py-1.5 text-xs w-40"
                >
                  <option value="ALL">All Categories</option>
                  {TRANSACTION_CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
                <input
                  type="text"
                  value={transSearch}
                  onChange={(e) => setTransSearch(e.target.value)}
                  placeholder="Search merchant, card..."
                  className="field-input py-1.5 text-xs w-56"
                />
                <button
                  type="button"
                  onClick={loadUserTransactions}
                  className="btn-secondary text-xs py-1.5 px-3"
                >
                  {loadingTrans ? 'Loading...' : 'Refresh'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    if (!newTrans.cardId && cards[0]?._id) {
                      setNewTrans((prev) => ({ ...prev, cardId: cards[0]._id }));
                    }
                    setShowAddTransModal((v) => !v);
                  }}
                  className="btn-primary text-xs py-1.5 px-3.5"
                >
                  + Log Transaction
                </button>
              </div>
            </div>

            {transError && !showAddTransModal && (
              <div className="mx-6 mt-4 p-3 rounded bg-[#F85C70]/10 border border-[#F85C70]/40 text-xs text-[#F85C70]">
                {transError}
              </div>
            )}

            {showAddTransModal && (
              <form
                onSubmit={handleCreateTransaction}
                className="p-6 bg-[#0B1120] border-b border-[#1E2B48] space-y-4"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-xs font-bold uppercase tracking-wider text-[#7E8EF7]">
                      Log New Purchase
                    </span>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      Select the card used, merchant, category, and purchase amount. Reward rate and
                      cash back earned are calculated automatically.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowAddTransModal(false)}
                    className="text-xs text-slate-400 hover:text-white"
                  >
                    Cancel
                  </button>
                </div>

                {transError && (
                  <div className="p-3 rounded bg-[#F85C70]/10 border border-[#F85C70]/40 text-xs text-[#F85C70]">
                    {transError}
                  </div>
                )}

                <div className="grid grid-cols-12 gap-3">
                  <div className="col-span-4">
                    <label className="block text-[11px] text-slate-400 mb-1">
                      Credit Card Used <span className="text-[#F85C70]">*</span>
                    </label>
                    <select
                      required
                      value={newTrans.cardId}
                      onChange={(e) => setNewTrans({ ...newTrans, cardId: e.target.value })}
                      className="field-input py-1.5 text-xs"
                    >
                      <option value="" disabled>
                        Select a card...
                      </option>
                      {cards.map((c) => (
                        <option key={c._id} value={c._id}>
                          {c.cardName} ({c.network} •••• {c.last4})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="col-span-3">
                    <label className="block text-[11px] text-slate-400 mb-1">
                      Merchant <span className="text-[#F85C70]">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      maxLength={100}
                      placeholder="e.g. Publix, Olive Garden, Shell"
                      value={newTrans.merchant}
                      onChange={(e) => setNewTrans({ ...newTrans, merchant: e.target.value })}
                      className="field-input py-1.5 text-xs"
                    />
                  </div>

                  <div className="col-span-3">
                    <label className="block text-[11px] text-slate-400 mb-1">
                      Category <span className="text-[#F85C70]">*</span>
                    </label>
                    <select
                      required
                      value={newTrans.category}
                      onChange={(e) => setNewTrans({ ...newTrans, category: e.target.value })}
                      className="field-input py-1.5 text-xs"
                    >
                      {TRANSACTION_CATEGORIES.map((cat) => (
                        <option key={cat} value={cat}>
                          {cat}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="col-span-2">
                    <label className="block text-[11px] text-slate-400 mb-1">
                      Amount ($) <span className="text-[#F85C70]">*</span>
                    </label>
                    <input
                      type="number"
                      required
                      min="0.01"
                      step="0.01"
                      placeholder="45.00"
                      value={newTrans.amount}
                      onChange={(e) => setNewTrans({ ...newTrans, amount: e.target.value })}
                      className="field-input py-1.5 text-xs font-mono"
                    />
                  </div>
                </div>

                <div className="flex justify-end">
                  <button type="submit" disabled={creatingTrans} className="btn-primary text-xs">
                    {creatingTrans ? 'Recording...' : 'Record Transaction'}
                  </button>
                </div>
              </form>
            )}

            {filteredAndSortedTransactions.length > 0 ? (
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-[#1E2B48] text-slate-400 bg-[#0B1120]/60 select-none">
                    <th
                      onClick={() => handleTransSort('transactionDate')}
                      className="py-3 px-6 font-medium cursor-pointer hover:text-white"
                    >
                      Date {renderTransSortIndicator('transactionDate')}
                    </th>
                    <th
                      onClick={() => handleTransSort('merchant')}
                      className="py-3 px-4 font-medium cursor-pointer hover:text-white"
                    >
                      Merchant {renderTransSortIndicator('merchant')}
                    </th>
                    <th
                      onClick={() => handleTransSort('category')}
                      className="py-3 px-4 font-medium cursor-pointer hover:text-white"
                    >
                      Category {renderTransSortIndicator('category')}
                    </th>
                    <th className="py-3 px-4 font-medium">Card Used</th>
                    <th className="py-3 px-4 font-medium">Status</th>
                    <th
                      onClick={() => handleTransSort('amount')}
                      className="py-3 px-4 font-medium text-right cursor-pointer hover:text-white"
                    >
                      Amount {renderTransSortIndicator('amount')}
                    </th>
                    <th
                      onClick={() => handleTransSort('rewardRate')}
                      className="py-3 px-4 font-medium text-right cursor-pointer hover:text-white"
                    >
                      Rate {renderTransSortIndicator('rewardRate')}
                    </th>
                    <th
                      onClick={() => handleTransSort('rewardsEarned')}
                      className="py-3 px-4 font-medium text-right cursor-pointer hover:text-white"
                    >
                      Rewards {renderTransSortIndicator('rewardsEarned')}
                    </th>
                    <th className="py-3 px-6 font-medium text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#1A2540]">
                  {filteredAndSortedTransactions.map((tx) => {
                    const cardUsed = cardByIdMap[tx.cardId];
                    const dateStr = tx.transactionDate
                      ? new Date(tx.transactionDate).toLocaleDateString()
                      : '—';
                    return (
                      <tr
                        key={tx._id}
                        onClick={() => handleInspectSingleTrans(tx._id)}
                        className="hover:bg-[#16213B]/60 cursor-pointer transition-colors"
                      >
                        <td className="py-3 px-6 font-mono text-slate-400">{dateStr}</td>
                        <td className="py-3 px-4 font-semibold text-white">{tx.merchant}</td>
                        <td className="py-3 px-4">
                          <span className="px-2 py-0.5 rounded bg-[#16213B] border border-[#263659] text-[11px] text-slate-200">
                            {tx.category}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-slate-300 font-mono">
                          {cardUsed
                            ? `${cardUsed.cardName} (•••• ${cardUsed.last4})`
                            : 'Connected Card'}
                        </td>
                        <td className="py-3 px-4">
                          <span
                            className={`px-2 py-0.5 rounded text-[11px] font-medium ${
                              tx.status === 'posted'
                                ? 'bg-emerald-500/15 text-emerald-300'
                                : tx.status === 'pending'
                                ? 'bg-amber-500/15 text-amber-300'
                                : 'bg-[#F85C70]/15 text-[#F85C70]'
                            }`}
                          >
                            {tx.status}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-right font-mono font-semibold text-white tabular-nums">
                          {tx.formattedAmount || `$${Number(tx.amount || 0).toFixed(2)}`}
                        </td>
                        <td className="py-3 px-4 text-right font-mono text-[#7E8EF7] tabular-nums">
                          {(Number(tx.rewardRate || 0) * 100).toFixed(1)}%
                        </td>
                        <td className="py-3 px-4 text-right font-mono text-emerald-400 tabular-nums">
                          +${Number(tx.rewardsEarned || 0).toFixed(2)}
                        </td>
                        <td className="py-3 px-6 text-right">
                          <button
                            type="button"
                            disabled={deletingTransId === tx._id}
                            onClick={(e) => handleDeleteTransaction(e, tx._id)}
                            className="px-2.5 py-1 rounded bg-[#F85C70]/15 hover:bg-[#F85C70]/30 text-[#F85C70] text-[11px] font-medium transition-colors"
                          >
                            {deletingTransId === tx._id ? 'Removing...' : 'Remove'}
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            ) : (
              <div className="p-8 text-center text-xs text-slate-400">
                {transSearch || transCategoryFilter !== 'ALL'
                  ? 'No transactions match your current filter.'
                  : `No transactions recorded for @${user.username}. Click "+ Log Transaction" to create one.`}
              </div>
            )}

            {selectedTransDetail && (
              <div className="p-4 bg-[#070B14] border-t border-[#1E2B48] flex items-center justify-between text-xs">
                <div className="flex items-center gap-6">
                  <div>
                    <span className="text-slate-400">Merchant: </span>
                    <strong className="text-white">{selectedTransDetail.merchant}</strong>
                  </div>
                  <div>
                    <span className="text-slate-400">Category: </span>
                    <span className="text-slate-200">{selectedTransDetail.category}</span>
                  </div>
                  <div>
                    <span className="text-slate-400">Amount: </span>
                    <span className="text-white font-mono">
                      ${Number(selectedTransDetail.amount || 0).toFixed(2)}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400">Reward Rate: </span>
                    <span className="text-[#7E8EF7] font-mono">
                      {(Number(selectedTransDetail.rewardRate || 0) * 100).toFixed(1)}%
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400">Rewards Earned: </span>
                    <span className="text-emerald-400 font-mono">
                      +${Number(selectedTransDetail.rewardsEarned || 0).toFixed(2)}
                    </span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedTransDetail(null)}
                  className="text-slate-400 hover:text-white"
                >
                  Close
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* =====================================================================
          PORTAL 2: CREDIT CARD COMPANY PORTAL (Only accessible to role: 'company')
      ===================================================================== */}
      {assignedRole === 'company' && (() => {
        const dayStats = companySummary?.day || {
          totalSpend: 0,
          rewardsPaid: 0,
          transactions: 0,
          bestCardUsagePct: 0,
        };
        const weekStats = companySummary?.week || {
          totalSpend: 0,
          rewardsPaid: 0,
          transactions: 0,
          bestCardUsagePct: 0,
        };
        const monthStats = companySummary?.month || {
          totalSpend: 0,
          rewardsPaid: 0,
          transactions: 0,
          bestCardUsagePct: 0,
        };
        const activeStats = companySummary?.[companyHorizon] || monthStats;
        const categoryRows = companyCategoryData?.categories || [];

        return (
          <div className="space-y-6">
            <div className="panel overflow-hidden">
              <div className="px-6 py-4 bg-[#0D1426] border-b border-[#1E2B48] flex items-center justify-between gap-4">
                <SpendSignalLogo
                  size="sm"
                  portalBadge="Credit Card Company Portal · Customer Spend & Reward Analytics"
                />
                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-400 mr-1">Spend Window:</span>
                  {[
                    { id: 'day', label: 'Daily' },
                    { id: 'week', label: 'Weekly' },
                    { id: 'month', label: 'Monthly' },
                  ].map((h) => (
                    <button
                      key={h.id}
                      type="button"
                      onClick={() => setCompanyHorizon(h.id)}
                      className={`px-3 py-1 rounded text-xs font-medium transition-colors ${
                        companyHorizon === h.id
                          ? 'bg-[#7E8EF7] text-[#090E1A] font-semibold'
                          : 'bg-[#11192E] text-slate-400 hover:text-white border border-[#1E2B48]'
                      }`}
                    >
                      {h.label}
                    </button>
                  ))}
                  <button
                    type="button"
                    onClick={() => {
                      loadCompanySummary();
                      loadCompanyCategoryAnalysis(companyHorizon);
                      loadCardProducts();
                    }}
                    className="btn-secondary text-xs py-1 px-3 ml-2"
                  >
                    {loadingCompanySummary || loadingCompanyCategories ? 'Loading...' : 'Refresh'}
                  </button>
                </div>
              </div>

              <div className="p-6 space-y-6">
                {companyError && (
                  <div className="p-3 rounded bg-[#F85C70]/10 border border-[#F85C70]/40 text-xs text-[#F85C70]">
                    {companyError}
                  </div>
                )}

                {/* Day / Week / Month Customer Spending KPIs */}
                <div className="grid grid-cols-4 gap-4">
                  <div
                    onClick={() => setCompanyHorizon('day')}
                    className={`panel-inset p-4 cursor-pointer transition-colors ${
                      companyHorizon === 'day' ? 'border-[#7E8EF7]' : ''
                    }`}
                  >
                    <div className="text-[11px] font-semibold uppercase text-slate-400">
                      TOTAL CUSTOMER SPEND (DAY)
                    </div>
                    <div className="text-2xl font-bold text-white tabular-nums mt-1">
                      $
                      {Number(dayStats.totalSpend || 0).toLocaleString(undefined, {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
                    </div>
                    <div className="text-xs text-slate-500 mt-0.5">
                      {dayStats.transactions || 0} transaction(s) · Last 24 hours
                    </div>
                  </div>

                  <div
                    onClick={() => setCompanyHorizon('week')}
                    className={`panel-inset p-4 cursor-pointer transition-colors ${
                      companyHorizon === 'week' ? 'border-[#7E8EF7]' : ''
                    }`}
                  >
                    <div className="text-[11px] font-semibold uppercase text-slate-400">
                      TOTAL CUSTOMER SPEND (WEEK)
                    </div>
                    <div className="text-2xl font-bold text-[#7E8EF7] tabular-nums mt-1">
                      $
                      {Number(weekStats.totalSpend || 0).toLocaleString(undefined, {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
                    </div>
                    <div className="text-xs text-slate-500 mt-0.5">
                      {weekStats.transactions || 0} transaction(s) · Last 7 days
                    </div>
                  </div>

                  <div
                    onClick={() => setCompanyHorizon('month')}
                    className={`panel-inset p-4 cursor-pointer transition-colors ${
                      companyHorizon === 'month' ? 'border-[#7E8EF7]' : ''
                    }`}
                  >
                    <div className="text-[11px] font-semibold uppercase text-slate-400">
                      TOTAL CUSTOMER SPEND (MONTH)
                    </div>
                    <div className="text-2xl font-bold text-emerald-400 tabular-nums mt-1">
                      $
                      {Number(monthStats.totalSpend || 0).toLocaleString(undefined, {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
                    </div>
                    <div className="text-xs text-slate-500 mt-0.5">
                      {monthStats.transactions || 0} transaction(s) · Last 30 days
                    </div>
                  </div>

                  <div className="panel-inset p-4">
                    <div className="text-[11px] font-semibold uppercase text-slate-400">
                      REWARD MAXIMIZATION ({companyHorizon.toUpperCase()})
                    </div>
                    <div className="text-2xl font-bold text-[#F85C70] tabular-nums mt-1">
                      {Number(activeStats.bestCardUsagePct || 0).toFixed(1)}%
                    </div>
                    <div className="text-xs text-slate-500 mt-0.5">
                      Rewards paid: ${Number(activeStats.rewardsPaid || 0).toFixed(2)} (
                      {activeStats.transactions || 0} txns)
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-12 gap-5">
                  {/* Left: Customer Spending & Reward Maximization Analysis by Category */}
                  <div className="col-span-7 panel-inset p-5 space-y-4">
                    <div className="flex items-center justify-between border-b border-[#1A2540] pb-2.5">
                      <div>
                        <span className="text-sm font-bold text-white">
                          Customer Spending &amp; Reward Maximization Analysis (
                          {companyHorizon.toUpperCase()})
                        </span>
                        <p className="text-xs text-slate-400">
                          Tracks whether cardholders are using their highest-multiplier card per
                          category
                        </p>
                      </div>
                      <span className="text-xs font-mono text-emerald-400">
                        {categoryRows.length} Categories
                      </span>
                    </div>

                    {loadingCompanyCategories ? (
                      <div className="py-12 text-center text-xs text-slate-400">
                        Loading category analytics...
                      </div>
                    ) : categoryRows.length > 0 ? (
                      <div className="space-y-3 text-xs">
                        {categoryRows.map((row) => {
                          const hasTxns = (row.transactions || 0) > 0;
                          const maxPct = Math.min(
                            100,
                            Math.max(0, Number(row.pctCustomersMaximizing || 0))
                          );
                          return (
                            <div
                              key={row.category}
                              className="p-3 rounded bg-[#11192E] border border-[#1E2B48] space-y-1.5"
                            >
                              <div className="flex items-center justify-between gap-2">
                                <div>
                                  <span className="font-semibold text-white">{row.category}</span>
                                  <span className="text-slate-400 ml-2 text-[11px]">
                                    {row.transactions || 0} txns · {row.customers || 0} customer(s)
                                    {' · '}Avg rate:{' '}
                                    {(Number(row.avgRewardRate || 0) * 100).toFixed(2)}%
                                  </span>
                                </div>
                                <div className="font-mono text-slate-200 tabular-nums text-right">
                                  ${Number(row.totalSpend || 0).toFixed(2)}{' '}
                                  <span className="text-emerald-400 text-[11px]">
                                    (+${Number(row.totalRewards || 0).toFixed(2)})
                                  </span>
                                  {' · '}
                                  <span className="text-[#7E8EF7]">
                                    {hasTxns
                                      ? `${maxPct.toFixed(1)}% maximizing`
                                      : 'No activity'}
                                  </span>
                                </div>
                              </div>
                              <div className="w-full h-2 bg-[#090E1A] rounded overflow-hidden flex">
                                {hasTxns && (
                                  <>
                                    <div
                                      style={{ width: `${maxPct}%` }}
                                      className="h-full bg-[#7E8EF7]"
                                      title="Customers maximizing rewards"
                                    />
                                    <div
                                      style={{ width: `${100 - maxPct}%` }}
                                      className="h-full bg-[#F85C70]/70"
                                      title="Customers with suboptimal card usage"
                                    />
                                  </>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <div className="py-12 text-center text-xs text-slate-400">
                        No category spend data available for this window.
                      </div>
                    )}
                  </div>

                  {/* Right: Credit Card Company Product Portfolio + Create Product Form */}
                  <div className="col-span-5 panel-inset p-5 flex flex-col justify-between space-y-4">
                    <div className="space-y-3">
                      <div className="flex items-center justify-between border-b border-[#1A2540] pb-2.5 gap-2">
                        <div>
                          <span className="text-sm font-bold text-white">Issued Card Products</span>
                          <p className="text-xs text-slate-400">
                            {mergedCardProducts.length} credit card product(s) in catalog
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            setProductFormError(null);
                            setProductFormSuccess(null);
                            setShowCreateProductModal((v) => !v);
                          }}
                          className="btn-primary text-xs py-1.5 px-3 shrink-0"
                        >
                          {showCreateProductModal ? 'Cancel' : '+ Create Card Product'}
                        </button>
                      </div>

                      {productFormSuccess && (
                        <div className="p-2.5 rounded bg-emerald-500/10 border border-emerald-500/40 text-xs text-emerald-300">
                          {productFormSuccess}
                        </div>
                      )}

                      {showCreateProductModal && (
                        <form
                          onSubmit={handleCreateCardProduct}
                          className="p-4 rounded bg-[#11192E] border border-[#293B63] space-y-3 text-xs"
                        >
                          <div className="font-bold text-[#7E8EF7]">
                            New Card Product
                          </div>

                          {productFormError && (
                            <div className="p-2.5 rounded bg-[#F85C70]/10 border border-[#F85C70]/40 text-xs text-[#F85C70]">
                              {productFormError}
                            </div>
                          )}

                          <div className="grid grid-cols-2 gap-2.5">
                            <div className="col-span-2">
                              <label className="block text-[11px] text-slate-400 mb-1">
                                Product Name <span className="text-[#F85C70]">*</span>
                              </label>
                              <input
                                type="text"
                                required
                                maxLength={100}
                                placeholder="e.g. Sapphire Preferred"
                                value={newProduct.name}
                                onChange={(e) =>
                                  setNewProduct({ ...newProduct, name: e.target.value })
                                }
                                className="field-input py-1.5 text-xs"
                              />
                            </div>

                            <div>
                              <label className="block text-[11px] text-slate-400 mb-1">
                                Network <span className="text-[#F85C70]">*</span>
                              </label>
                              <select
                                value={newProduct.network}
                                onChange={(e) =>
                                  setNewProduct({ ...newProduct, network: e.target.value })
                                }
                                className="field-input py-1.5 text-xs"
                              >
                                {CARD_NETWORKS.map((net) => (
                                  <option key={net} value={net}>
                                    {net}
                                  </option>
                                ))}
                              </select>
                            </div>

                            <div>
                              <label className="block text-[11px] text-slate-400 mb-1">
                                Annual Fee ($)
                              </label>
                              <input
                                type="number"
                                min="0"
                                step="1"
                                value={newProduct.annualFee}
                                onChange={(e) =>
                                  setNewProduct({ ...newProduct, annualFee: e.target.value })
                                }
                                className="field-input py-1.5 text-xs font-mono"
                              />
                            </div>

                            <div className="col-span-2">
                              <label className="block text-[11px] text-slate-400 mb-1">
                                Base Reward Rate (%) <span className="text-[#F85C70]">*</span>
                              </label>
                              <input
                                type="number"
                                required
                                min="0"
                                step="0.01"
                                placeholder="e.g. 1.5 for 1.5%"
                                value={newProduct.baseRate}
                                onChange={(e) =>
                                  setNewProduct({ ...newProduct, baseRate: e.target.value })
                                }
                                className="field-input py-1.5 text-xs font-mono"
                              />
                              <p className="text-[10px] text-slate-500 mt-0.5">
                                Values above 1 convert from % to decimal (1.5 → 0.015). For 1% use
                                0.01 or 1.5 for 1.5%.
                              </p>
                            </div>
                          </div>

                          <div className="space-y-1.5">
                            <div className="text-[11px] text-slate-400">
                              Optional Category Bonus Rates (%):
                            </div>
                            <div className="grid grid-cols-2 gap-2">
                              {TRANSACTION_CATEGORIES.map((cat) => (
                                <div key={cat} className="flex items-center gap-1.5">
                                  <span className="text-[11px] text-slate-300 w-24 truncate">
                                    {cat}
                                  </span>
                                  <input
                                    type="number"
                                    min="0"
                                    step="0.01"
                                    placeholder="—"
                                    value={newProduct.categoryRates[cat] ?? ''}
                                    onChange={(e) =>
                                      setNewProduct({
                                        ...newProduct,
                                        categoryRates: {
                                          ...newProduct.categoryRates,
                                          [cat]: e.target.value,
                                        },
                                      })
                                    }
                                    className="field-input py-1 px-2 text-xs font-mono"
                                  />
                                </div>
                              ))}
                            </div>
                          </div>

                          <div className="flex justify-end pt-1">
                            <button
                              type="submit"
                              disabled={creatingProduct}
                              className="btn-primary text-xs py-1.5 px-4"
                            >
                              {creatingProduct ? 'Creating...' : 'Create Product'}
                            </button>
                          </div>
                        </form>
                      )}

                      <div className="space-y-2.5 text-xs max-h-[420px] overflow-y-auto pr-1">
                        {mergedCardProducts.map((prod) => (
                          <div
                            key={prod._id || prod.name}
                            className="p-3 rounded bg-[#11192E] border border-[#1E2B48] space-y-1"
                          >
                            <div className="flex items-center justify-between">
                              <span className="font-bold text-white">
                                {prod.name}{' '}
                                <span className="text-[#7E8EF7] font-mono font-normal">
                                  ({prod.network})
                                </span>
                              </span>
                              <span className="font-mono text-emerald-400">
                                ${Number(prod.annualFee || 0)}/yr fee
                              </span>
                            </div>
                            <div className="text-slate-300 text-[11px]">
                              Base: <strong>{(Number(prod.baseRate || 0) * 100).toFixed(1)}%</strong>
                              {Object.keys(prod.categoryRates || {}).length > 0 && (
                                <>
                                  {' · '}
                                  {Object.entries(prod.categoryRates)
                                    .map(([cat, r]) => `${cat}: ${(Number(r) * 100).toFixed(0)}%`)
                                    .join(' · ')}
                                </>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="p-3 rounded bg-[#11192E] border border-[#1E2B48] text-xs text-slate-300">
                      <strong className="text-white">Portfolio Insight:</strong>{' '}
                      {activeStats.transactions > 0 ? (
                        <>
                          In the {companyHorizon} window,{' '}
                          <strong className="text-[#7E8EF7]">
                            {Number(activeStats.bestCardUsagePct || 0).toFixed(1)}%
                          </strong>{' '}
                          of customer transactions used their highest-earning card, generating{' '}
                          <strong className="text-emerald-400">
                            ${Number(activeStats.rewardsPaid || 0).toFixed(2)}
                          </strong>{' '}
                          in total rewards across{' '}
                          <strong className="text-white">${Number(activeStats.totalSpend || 0).toFixed(2)}</strong>{' '}
                          in spend.
                        </>
                      ) : (
                        <>
                          No transactions recorded in the {companyHorizon} window yet. Try switching
                          to Monthly or refreshing once new cardholder transactions arrive.
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      })()}

      {/* =====================================================================
          PORTAL 3: ADMIN ACCOUNT MANAGEMENT (Only accessible to role: 'admin')
      ===================================================================== */}
      {assignedRole === 'admin' && (
        <div className="space-y-6">
          <div className="panel p-6 space-y-6">
            <div className="flex items-center justify-between border-b border-[#1E2B48] pb-4">
              <div>
                <h2 className="text-base font-bold text-white">Admin Account Management</h2>
                <p className="text-xs text-slate-400">
                  Manage Cardholder, Credit Card Company, and Admin accounts
                </p>
              </div>
              <button
                type="button"
                onClick={loadAdminAccounts}
                className="btn-secondary text-xs py-1.5 px-3"
              >
                {loadingAdminUsers ? 'Loading...' : 'Refresh Accounts'}
              </button>
            </div>

            {adminError && (
              <div className="p-3 rounded bg-[#F85C70]/10 border border-[#F85C70]/40 text-xs text-[#F85C70]">
                {adminError}
              </div>
            )}
            {adminSuccess && (
              <div className="p-3 rounded bg-emerald-500/10 border border-emerald-500/40 text-xs text-emerald-300">
                {adminSuccess}
              </div>
            )}

            <div className="grid grid-cols-3 gap-5">
              {/* Create Credit Card Company Account */}
              <form
                onSubmit={handleCreateCompanyUser}
                className="panel-inset p-4 space-y-3 text-xs"
              >
                <div className="font-bold text-white border-b border-[#1E2B48] pb-2">
                  Create Credit Card Company Account
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="text"
                    required
                    placeholder="First name"
                    value={newCompanyForm.firstName}
                    onChange={(e) =>
                      setNewCompanyForm({ ...newCompanyForm, firstName: e.target.value })
                    }
                    className="field-input py-1.5 text-xs"
                  />
                  <input
                    type="text"
                    required
                    placeholder="Last name"
                    value={newCompanyForm.lastName}
                    onChange={(e) =>
                      setNewCompanyForm({ ...newCompanyForm, lastName: e.target.value })
                    }
                    className="field-input py-1.5 text-xs"
                  />
                </div>
                <input
                  type="text"
                  required
                  placeholder="Company Name (e.g. Chase, Amex)"
                  value={newCompanyForm.companyName}
                  onChange={(e) =>
                    setNewCompanyForm({ ...newCompanyForm, companyName: e.target.value })
                  }
                  className="field-input py-1.5 text-xs"
                />
                <input
                  type="text"
                  required
                  placeholder="Username"
                  value={newCompanyForm.username}
                  onChange={(e) =>
                    setNewCompanyForm({ ...newCompanyForm, username: e.target.value })
                  }
                  className="field-input py-1.5 text-xs"
                />
                <input
                  type="email"
                  required
                  placeholder="Email"
                  value={newCompanyForm.email}
                  onChange={(e) => setNewCompanyForm({ ...newCompanyForm, email: e.target.value })}
                  className="field-input py-1.5 text-xs"
                />
                <input
                  type="password"
                  required
                  placeholder="Password (8+ chars & special char)"
                  value={newCompanyForm.password}
                  onChange={(e) =>
                    setNewCompanyForm({ ...newCompanyForm, password: e.target.value })
                  }
                  className="field-input py-1.5 text-xs font-mono"
                />
                <button type="submit" className="btn-primary w-full text-xs py-2">
                  Create Company Account
                </button>
              </form>

              {/* Create Admin Account */}
              <form onSubmit={handleCreateAdminUser} className="panel-inset p-4 space-y-3 text-xs">
                <div className="font-bold text-white border-b border-[#1E2B48] pb-2">
                  Create Admin Account
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="text"
                    required
                    placeholder="First name"
                    value={newAdminForm.firstName}
                    onChange={(e) =>
                      setNewAdminForm({ ...newAdminForm, firstName: e.target.value })
                    }
                    className="field-input py-1.5 text-xs"
                  />
                  <input
                    type="text"
                    required
                    placeholder="Last name"
                    value={newAdminForm.lastName}
                    onChange={(e) => setNewAdminForm({ ...newAdminForm, lastName: e.target.value })}
                    className="field-input py-1.5 text-xs"
                  />
                </div>
                <input
                  type="text"
                  required
                  placeholder="Username"
                  value={newAdminForm.username}
                  onChange={(e) => setNewAdminForm({ ...newAdminForm, username: e.target.value })}
                  className="field-input py-1.5 text-xs"
                />
                <input
                  type="email"
                  required
                  placeholder="Email"
                  value={newAdminForm.email}
                  onChange={(e) => setNewAdminForm({ ...newAdminForm, email: e.target.value })}
                  className="field-input py-1.5 text-xs"
                />
                <input
                  type="password"
                  required
                  placeholder="Password (8+ chars & special char)"
                  value={newAdminForm.password}
                  onChange={(e) => setNewAdminForm({ ...newAdminForm, password: e.target.value })}
                  className="field-input py-1.5 text-xs font-mono"
                />
                <button type="submit" className="btn-primary w-full text-xs py-2">
                  Create Admin Account
                </button>
              </form>

              {/* Reset User Password */}
              <form
                onSubmit={handleAdminResetPassword}
                className="panel-inset p-4 space-y-3 text-xs"
              >
                <div className="font-bold text-white border-b border-[#1E2B48] pb-2">
                  Reset User Password
                </div>
                <input
                  type="text"
                  required
                  placeholder="Select a user below or enter User ID"
                  value={passwordResetForm.userId}
                  onChange={(e) =>
                    setPasswordResetForm({ ...passwordResetForm, userId: e.target.value })
                  }
                  className="field-input py-1.5 text-xs font-mono"
                />
                <input
                  type="password"
                  required
                  placeholder="New Password (8+ chars & special char)"
                  value={passwordResetForm.password}
                  onChange={(e) =>
                    setPasswordResetForm({ ...passwordResetForm, password: e.target.value })
                  }
                  className="field-input py-1.5 text-xs font-mono"
                />
                <button type="submit" className="btn-primary w-full text-xs py-2">
                  Update Password
                </button>
              </form>
            </div>

            {/* Accounts Table */}
            {adminUsers.length > 0 && (
              <div className="border border-[#1E2B48] rounded overflow-hidden">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="border-b border-[#1E2B48] text-slate-400 bg-[#0B1120]/60">
                      <th className="py-2.5 px-4">Username</th>
                      <th className="py-2.5 px-4">Name</th>
                      <th className="py-2.5 px-4">Email</th>
                      <th className="py-2.5 px-4">Account Type</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#1A2540]">
                    {adminUsers.map((u) => (
                      <tr
                        key={u._id}
                        onClick={() =>
                          setPasswordResetForm((prev) => ({ ...prev, userId: u._id }))
                        }
                        className="hover:bg-[#16213B]/60 cursor-pointer"
                      >
                        <td className="py-2.5 px-4 font-mono text-white">@{u.username}</td>
                        <td className="py-2.5 px-4 text-slate-300">
                          {u.firstName} {u.lastName}
                        </td>
                        <td className="py-2.5 px-4 text-slate-400">{u.email}</td>
                        <td className="py-2.5 px-4 font-mono text-[#7E8EF7]">{u.role}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
