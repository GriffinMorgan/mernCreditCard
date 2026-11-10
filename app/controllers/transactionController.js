const Transaction = require('../models/Transaction');
const Card = require('../models/Card');
const mongoose = require('mongoose');

// This function was generated with Gemini to bugfix a population bug... it was incomprehensible
// POST /api/transactions/create
exports.createTrans = async (req, res, next) => {
  try {
    const { merchant, category, amount, cardId } = req.body || {};

    // 1. Find the card AND populate its linked CardProduct details
    const card = await Card.findOne({ _id: cardId, userId: req.userId }).populate('cardProduct');
    
    if (!card) {
      return res.status(404).json({ error: 'Card not found or access denied' });
    }

    // 2. Use the CardProduct model's built-in rateFor helper
    // (If populated, card.cardProduct.rateFor(category) checks categoryRates, then falls back to baseRate)
    const rewardRate = card.cardProduct ? card.cardProduct.rateFor(category) : 0;

    // 3. Create transaction
    const trans = await Transaction.create({
      cardId: cardId,
      userId: req.userId,
      merchant: merchant,
      category: category,
      amount: amount,
      status: "pending",
      rewardRate: rewardRate,
      rewardsEarned: amount * rewardRate,
    });

    res
      .status(201)
      .location(`/api/transactions/${trans.id}`)
      .json(trans);
  } catch (err) {
    next(err);
  }
};

// GET
// /api/transactions/getTrans
exports.getTrans = async (req,res, next) => {
    try{
        const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
        const limit = Math.min(Math.max(parseInt(req.query.limit, 10) || 10, 1), 50);
        const skip = (page - 1) * limit;
        const filter = {userId : req.userId}; // used to find only cards with our logged in userID

        const [transactions, total] = await Promise.all([
            Transaction.find(filter)
            .sort({createdAt: -1, _id: -1})
            .skip(skip)
            .limit(limit),
            Transaction.countDocuments(filter)
        ]);

        const totalPages = Math.ceil(total / limit);

        res.status(200).json({
            data: transactions,
            pagination: {
                page,
                limit,
                total,
                totalPages,
                hasNextPage: page < totalPages,
                hasPrevPage: page > 1
            }
        });
    } catch(err) {
        next(err);
    }
};

// Generated with Gemini 11/10/2026 to fix duplicate getTrans function
// GET /api/transactions/:transId
exports.getTransById = async (req, res, next) => {
  try {
    const trans = await Transaction.findOne({ _id: req.params.transId, userId: req.userId });
    if (!trans) return res.status(404).json({ error: 'Transaction not found' });
    res.status(200).json(trans);
  } catch (err) {
    next(err);
  }
};

// /api/transactions/deleteTrans
exports.deleteTrans = async (req, res, next) => {
    try{
        // Deletes card using the cardID input parameter we want to delete
        const deletedTrans = await Transaction.deleteOne({_id: req.params.transId, userId: req.userId});
        if (deletedTrans.deletedCount === 0) {
            return res.status(404).json({ error: "Can't delete, transaction does not exist." });
        }
        res.status(200).json(deletedTrans);
    } catch (err) {
        next(err);
    }
};