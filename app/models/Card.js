// GENERATED USING CLAUDE CODE OPUS 5.5 (to save time)
// BASED ON MONGODB SCHEMA

const mongoose = require('mongoose');

const NETWORKS = ['Visa', 'Mastercard', 'Amex', 'Discover'];
const STATUSES = ['active', 'frozen', 'closed'];

const cardSchema = new mongoose.Schema(
  {
    // Owner of the card. Matches the userId index created in mongo-init.js.
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'userId is required'],
      index: true
    },
    cardName: {
      type: String,
      required: [true, 'Card name is required'],
      trim: true,
      maxlength: [50, 'Card name must be 50 characters or fewer']
    },
    network: {
      type: String,
      required: [true, 'Network is required'],
      enum: { values: NETWORKS, message: 'Network must be one of: ' + NETWORKS.join(', ') }
    },
    // Only the last 4 digits are ever stored, never the full card number.
    last4: {
      type: String,
      required: [true, 'Last 4 digits are required'],
      match: [/^\d{4}$/, 'last4 must be exactly 4 digits']
    },
    creditLimit: {
      type: Number,
      required: [true, 'Credit limit is required'],
      min: [0, 'Credit limit cannot be negative']
    },
    // Can go negative if the cardholder overpays (a credit balance).
    currentBalance: {
      type: Number,
      default: 0
    },
    apr: {
      type: Number,
      required: [true, 'APR is required'],
      min: [0, 'APR cannot be negative'],
      max: [100, 'APR cannot exceed 100']
    },
    // Stored as "MM/YYYY", e.g. "09/2029".
    expirationDate: {
      type: String,
      required: [true, 'Expiration date is required'],
      match: [/^(0[1-9]|1[0-2])\/\d{4}$/, 'Expiration date must be in MM/YYYY format']
    },
    status: {
      type: String,
      enum: { values: STATUSES, message: 'Status must be one of: ' + STATUSES.join(', ') },
      default: 'active'
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  },
  {
    collection: 'cards',
    versionKey: false,
    id: false,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

// Remaining credit on the card, computed rather than stored so it can't
// drift out of sync with the balance.
cardSchema.virtual('availableCredit').get(function () {
  return Math.round((this.creditLimit - this.currentBalance) * 100) / 100;
});

// Display-friendly number, e.g. "•••• 4821".
cardSchema.virtual('maskedNumber').get(function () {
  return `•••• ${this.last4}`;
});

// True once the last day of the expiration month has passed.
cardSchema.virtual('isExpired').get(function () {
  if (!this.expirationDate) return false;
  const [month, year] = this.expirationDate.split('/').map(Number);
  // Day 0 of the next month = last day of the expiration month
  const endOfMonth = new Date(year, month, 0, 23, 59, 59);
  return endOfMonth < new Date();
});

module.exports = mongoose.model('Card', cardSchema);