const Transaction = require('../models/Transaction');
const Card = require('../models/Card');
const CardProduct = require('../models/CardProduct');

/*
 * Notes:
 *  - Rewards use the stored rewardsEarned (amount * rewardRate), in whatever unit
 *    your rates represent (points or dollars).
 *  - "Highest-earning card" compares CardProduct rates (rateFor) across the customer's
 *    active cards plus the card used. Ties count as using the best card.
 */

const COUNTED_STATUSES = ['pending', 'posted'];

// Must match the category enum in mongo-init.js (capitalized, e.g. "Groceries", "Gas").
// Categories found in the data but missing here are still returned, after these.
const CATEGORIES = ['Dining', 'Groceries', 'Gas', 'Travel', 'Entertainment', 'Shopping', 'Utilities', 'Other'];

// Rolling windows: last 24 hours, 7 days, 30 days
const DAY_MS = 24 * 60 * 60 * 1000;
const WINDOW_MS = { day: DAY_MS, week: 7 * DAY_MS, month: 30 * DAY_MS };
const WINDOWS = Object.keys(WINDOW_MS);

const windowStart = (window, now) => new Date(now.getTime() - WINDOW_MS[window]);
const round2 = (n) => Math.round((n || 0) * 100) / 100;
const pct = (part, whole) => (whole ? round2((part / whole) * 100) : 0);

const baseMatch = (start, now) => ({
  transactionDate: { $gte: start, $lte: now },
  status: { $in: COUNTED_STATUSES }
});

/*
 * Aggregation equivalent of CardProduct.rateFor(category): category rate if present,
 * otherwise baseRate. Case-insensitive, so a product key "dining" matches category "Dining".
 */
const rateFor = (product, category) => ({
  $let: {
    vars: {
      match: {
        $arrayElemAt: [
          {
            $filter: {
              input: { $objectToArray: { $ifNull: [`${product}.categoryRates`, {}] } },
              as: 'r',
              cond: { $eq: [{ $toLower: '$$r.k' }, { $toLower: category }] }
            }
          },
          0
        ]
      }
    },
    in: { $ifNull: ['$$match.v', `${product}.baseRate`] }
  }
});

/*
 * Adds to each transaction:
 *  - rateUsed:     product rate of the card used, for this category
 *  - bestRate:     best product rate the customer holds for this category
 *  - usedBestCard: true if rateUsed >= bestRate
 */
const enrichStages = () => [
  { $lookup: { from: Card.collection.name, localField: 'cardId', foreignField: '_id', as: 'card' } },
  { $unwind: '$card' },
  { $lookup: { from: CardProduct.collection.name, localField: 'card.cardProductId', foreignField: '_id', as: 'product' } },
  { $unwind: '$product' },
  { $addFields: { rateUsed: rateFor('$product', '$category') } },
  {
    $lookup: {
      from: Card.collection.name,
      let: { uid: '$userId', cat: '$category' },
      pipeline: [
        { $match: { $expr: { $eq: ['$userId', '$$uid'] }, status: 'active' } },
        { $lookup: { from: CardProduct.collection.name, localField: 'cardProductId', foreignField: '_id', as: 'p' } },
        { $unwind: '$p' },
        { $project: { _id: 0, rate: rateFor('$p', '$$cat') } }
      ],
      as: 'heldRates'
    }
  },
  { $addFields: { bestRate: { $max: ['$rateUsed', { $max: '$heldRates.rate' }] } } },
  { $addFields: { usedBestCard: { $gte: ['$rateUsed', '$bestRate'] } } },
  { $project: { card: 0, product: 0, heldRates: 0 } }
];

// GET /api/company/summary
// Access: company role
// Spending, rewards paid and best-card usage % for the last day, week and month
exports.getSummary = async (req, res, next) => {
  try {
    const now = new Date();
    const starts = Object.fromEntries(WINDOWS.map((w) => [w, windowStart(w, now)]));

    // One pass over the month; each window is a conditional sum
    const groupStage = { _id: null };
    for (const w of WINDOWS) {
      const inWindow = { $gte: ['$transactionDate', starts[w]] };
      groupStage[`${w}Spend`] = { $sum: { $cond: [inWindow, '$amount', 0] } };
      groupStage[`${w}Rewards`] = { $sum: { $cond: [inWindow, '$rewardsEarned', 0] } };
      groupStage[`${w}Count`] = { $sum: { $cond: [inWindow, 1, 0] } };
      groupStage[`${w}BestCard`] = { $sum: { $cond: [{ $and: [inWindow, '$usedBestCard'] }, 1, 0] } };
    }

    const [totals = {}] = await Transaction.aggregate([
      { $match: baseMatch(starts.month, now) },
      ...enrichStages(),
      { $group: groupStage }
    ]);

    const summary = Object.fromEntries(
      WINDOWS.map((w) => [
        w,
        {
          totalSpend: round2(totals[`${w}Spend`]),
          rewardsPaid: round2(totals[`${w}Rewards`]),
          transactions: totals[`${w}Count`] || 0,
          bestCardUsagePct: pct(totals[`${w}BestCard`], totals[`${w}Count`])
        }
      ])
    );

    res.status(200).json({ generatedAt: now, ...summary });
  } catch (err) {
    next(err);
  }
};

// GET /api/company/category-analysis?window=day|week|month
// Access: company role
// Per-category spend, average reward rate and % of customers maximizing rewards
exports.getCategoryAnalysis = async (req, res, next) => {
  try {
    const window = String(req.query.window || 'month').toLowerCase();
    if (!WINDOWS.includes(window)) {
      return res.status(400).json({ error: `window must be one of: ${WINDOWS.join(', ')}` });
    }

    const now = new Date();
    const start = windowStart(window, now);

    const rows = await Transaction.aggregate([
      { $match: baseMatch(start, now) },
      ...enrichStages(),
      // Per customer per category: did they use their best card on every transaction?
      {
        $group: {
          _id: { category: '$category', userId: '$userId' },
          spend: { $sum: '$amount' },
          rewards: { $sum: '$rewardsEarned' },
          transactions: { $sum: 1 },
          alwaysBestCard: { $min: '$usedBestCard' } // false if any transaction wasn't optimal
        }
      },
      // Roll up to category
      {
        $group: {
          _id: '$_id.category',
          totalSpend: { $sum: '$spend' },
          totalRewards: { $sum: '$rewards' },
          transactions: { $sum: '$transactions' },
          customers: { $sum: 1 },
          maximizingCustomers: { $sum: { $cond: ['$alwaysBestCard', 1, 0] } }
        }
      }
    ]);

    // Known categories first (zeros if no spend), then any unexpected ones from the data
    const byCategory = new Map(rows.map((r) => [r._id, r]));
    const extras = rows.map((r) => r._id).filter((c) => !CATEGORIES.includes(c)).sort();

    const categories = [...CATEGORIES, ...extras].map((category) => {
      const r = byCategory.get(category) || {};
      return {
        category,
        totalSpend: round2(r.totalSpend),
        totalRewards: round2(r.totalRewards),
        // Spend-weighted average of rewardRate (rewardsEarned = amount * rewardRate)
        avgRewardRate: r.totalSpend ? round2(r.totalRewards / r.totalSpend) : 0,
        transactions: r.transactions || 0,
        customers: r.customers || 0,
        pctCustomersMaximizing: pct(r.maximizingCustomers, r.customers)
      };
    });

    res.status(200).json({ window, from: start, to: now, categories });
  } catch (err) {
    next(err);
  }
};