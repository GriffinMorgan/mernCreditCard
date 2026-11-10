// GENERATED USING GEMINI (to save time)
// BASED ON MONGODB SCHEMA
const mongoose = require('mongoose');

const NETWORKS = ['Visa', 'Mastercard', 'Amex', 'Discover'];
const STATUSES = ['active', 'frozen', 'closed'];

const cardSchema = new mongoose.Schema(
  {
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
    // Matched to MongoDB schema field name: cardProductId
    cardProductId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'CardProduct',
      required: [true, 'connected card product is required'],
      alias: 'cardProduct'
    },  
    network: {
      type: String,
      required: [true, 'Network is required'],
      enum: { values: NETWORKS, message: 'Network must be one of: ' + NETWORKS.join(', ') }
    },
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

cardSchema.virtual('availableCredit').get(function () {
  return Math.round((this.creditLimit - this.currentBalance) * 100) / 100;
});

cardSchema.virtual('maskedNumber').get(function () {
  return `•••• ${this.last4}`;
});

cardSchema.virtual('isExpired').get(function () {
  if (!this.expirationDate) return false;
  const [month, year] = this.expirationDate.split('/').map(Number);
  const endOfMonth = new Date(year, month, 0, 23, 59, 59);
  return endOfMonth < new Date();
});

module.exports = mongoose.model('Card', cardSchema);