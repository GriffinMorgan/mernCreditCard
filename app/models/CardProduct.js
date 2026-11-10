// GENERATED USING CLAUDE CODE OPUS 5.5 (to save time)
// BASED ON MONGODB SCHEMA
const mongoose = require('mongoose');

const NETWORKS = ['Visa', 'Mastercard', 'Amex', 'Discover'];

const cardProductSchema = new mongoose.Schema(
  {
    // Product name, e.g. "Sapphire Preferred". Unique so two products can't share a name.
    userId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User',
          required: [true, 'userId is required'],
          index: true
    },
    name: {
      type: String,
      required: [true, 'Product name is required'],
      trim: true,
      unique: true,
      maxlength: [100, 'Product name must be 100 characters or fewer']
    },
    network: {
      type: String,
      required: [true, 'Network is required'],
      enum: { values: NETWORKS, message: 'Network must be one of: ' + NETWORKS.join(', ') }
    },
    annualFee: {
      type: Number,
      default: 0,
      min: [0, 'Annual fee cannot be negative']
    },
    // Reward rate on any purchase that has no category-specific rate, e.g. 1 for 1x / 1%.
    baseRate: {
      type: Number,
      required: [true, 'Base rate is required'],
      min: [0, 'Base rate cannot be negative']
    },
    // Category-specific reward rates, e.g. { dining: 3, travel: 2, groceries: 3 }.
    categoryRates: {
      type: Map,
      of: {
        type: Number,
        min: [0, 'Category rate cannot be negative']
      },
      default: {}
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  },
  {
    collection: 'cardProducts',
    versionKey: false,
    id: false,
    toJSON: { virtuals: true, flattenMaps: true },
    toObject: { virtuals: true, flattenMaps: true }
  }
);

// True if the product charges an annual fee.
cardProductSchema.virtual('hasAnnualFee').get(function () {
  return this.annualFee > 0;
});

// Reward rate for a purchase category, falling back to the base rate
// when the product has no special rate for that category.
cardProductSchema.methods.rateFor = function (category) {
  const rate = this.categoryRates?.get(category);
  return rate ?? this.baseRate;
};

module.exports = mongoose.model('CardProduct', cardProductSchema);