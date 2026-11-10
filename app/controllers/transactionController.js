const Transaction = require('../models/Transaction');
const Card = require('../models/Card');
const mongoose = require('mongoose');

// This function was generated with Gemini to bugfix a population bug... it was incomprehensible
// POST /api/transactions/create
exports.createTrans = async (req, res, next) => {
  try {
    const { merchant, category, amount, cardId } = req.body || {};

    // 1. Basic validation
    if (!merchant || !category || amount == null || !cardId) {
      return res.status(400).json({ error: 'Missing required fields: merchant, category, amount, and cardId are required.' });
    }

    // 2. Format Category (Capitalize first letter to match DB Enum: "Groceries", "Gas", "Dining", etc.)
    const formattedCategory = category.charAt(0).toUpperCase() + category.slice(1).toLowerCase();

    // 3. Find card & populate product
    const card = await Card.findOne({ _id: cardId, userId: req.userId }).populate('cardProduct');
    if (!card) {
      return res.status(404).json({ error: 'Card not found or access denied' });
    }

    // 4. Determine reward rate (using formatted category)
    const rewardRate = card.cardProduct ? card.cardProduct.rateFor(formattedCategory) : 0;
    const numAmount = Number(amount);

    // 5. Create transaction matching MongoDB $jsonSchema requirements
    const trans = await Transaction.create({
      cardId: new mongoose.Types.ObjectId(cardId),
      userId: new mongoose.Types.ObjectId(req.userId),
      merchant: merchant.trim(),
      category: formattedCategory,
      amount: numAmount,
      transactionDate: new Date(), // Required by MongoDB schema
      status: "pending",
      rewardRate: rewardRate,
      rewardsEarned: Math.round(numAmount * rewardRate * 100) / 100,
    });

    res
      .status(201)
      .location(`/api/transactions/${trans._id}`)
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