// GENERATED USING GEMINI
// BASED ON MONGODB SCHEMA
const mongoose = require('mongoose');

// Must match the exact enum allowed in mongo-init.js
const STATUSES = ['pending', 'posted', 'declined'];

// Statuses that never earn rewards.
const NO_REWARD_STATUSES = ['declined'];

const transactionSchema = new mongoose.Schema(
  {
    cardId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Card',
      required: [true, 'cardId is required'],
      index: true
    },
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
    // MUST NOT use lowercase: true so it matches MongoDB's capitalized enum ("Groceries", "Gas", etc.)
    category: {
      type: String,
      required: [true, 'Category is required'],
      trim: true,
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
    rewardRate: {
      type: Number,
      required: [true, 'Reward rate is required'],
      min: [0, 'Reward rate cannot be negative']
    },
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

transactionSchema.index({ userId: 1, transactionDate: -1 });
transactionSchema.index({ cardId: 1, transactionDate: -1 });

transactionSchema.pre('validate', function () {
  if (NO_REWARD_STATUSES.includes(this.status) || this.amount == null || this.rewardRate == null) {
    this.rewardsEarned = 0;
    return;
  }
  this.rewardsEarned = Math.round(this.amount * this.rewardRate * 100) / 100;
});

transactionSchema.virtual('formattedAmount').get(function () {
  return this.amount == null ? null : `$${this.amount.toFixed(2)}`;
});

module.exports = mongoose.model('Transaction', transactionSchema);