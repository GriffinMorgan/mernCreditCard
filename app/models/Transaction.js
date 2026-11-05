// GENERATED USING CLAUDE CODE OPUS 5.5 (to save time)
// BASED ON MONGODB SCHEMA
const mongoose = require('mongoose');

const STATUSES = ['pending', 'posted', 'declined', 'refunded'];

// Statuses that never earn rewards.
const NO_REWARD_STATUSES = ['declined', 'refunded'];

const transactionSchema = new mongoose.Schema(
  {
    // Card the purchase was made on.
    cardId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Card',
      required: [true, 'cardId is required'],
      index: true
    },
    // Owner of the transaction. Stored directly so a user's transactions can be
    // queried without looking up their cards first.
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'userId is required'],
      index: true
    },
    merchant: {
      type: String,
      required: [true, 'Merchant is required'],
      trim: true,
      maxlength: [100, 'Merchant must be 100 characters or fewer']
    },
    // Lowercased so it matches the keys in CardProduct.categoryRates, e.g. "dining".
    category: {
      type: String,
      required: [true, 'Category is required'],
      trim: true,
      lowercase: true,
      maxlength: [50, 'Category must be 50 characters or fewer']
    },
    amount: {
      type: Number,
      required: [true, 'Amount is required'],
      min: [0.01, 'Amount must be greater than 0']
    },
    transactionDate: {
      type: Date,
      required: [true, 'Transaction date is required'],
      default: Date.now
    },
    status: {
      type: String,
      enum: { values: STATUSES, message: 'Status must be one of: ' + STATUSES.join(', ') },
      default: 'pending'
    },
    // Snapshot of the product's rate at purchase time, so later changes to the
    // CardProduct don't rewrite past rewards.
    rewardRate: {
      type: Number,
      required: [true, 'Reward rate is required'],
      min: [0, 'Reward rate cannot be negative']
    },
    // Calculated automatically from amount and rewardRate (see pre-validate hook).
    rewardsEarned: {
      type: Number,
      default: 0,
      min: [0, 'Rewards earned cannot be negative']
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  },
  {
    collection: 'transactions',
    versionKey: false,
    id: false,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

// Speeds up "most recent transactions for this user / card" queries.
transactionSchema.index({ userId: 1, transactionDate: -1 });
transactionSchema.index({ cardId: 1, transactionDate: -1 });

// Keep rewardsEarned in sync with amount, rate and status on every save.
// rewardRate is treated as a percentage: 3 means 3% back, so $50.00 earns $1.50.
transactionSchema.pre('validate', function () {
  if (NO_REWARD_STATUSES.includes(this.status) || this.amount == null || this.rewardRate == null) {
    this.rewardsEarned = 0;
    return;
  }
  this.rewardsEarned = Math.round(this.amount * this.rewardRate) / 100;
});

// Display-friendly amount, e.g. "$50.00".
transactionSchema.virtual('formattedAmount').get(function () {
  return this.amount == null ? null : `$${this.amount.toFixed(2)}`;
});

module.exports = mongoose.model('Transaction', transactionSchema);