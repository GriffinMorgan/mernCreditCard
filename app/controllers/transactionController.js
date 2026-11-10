const transaction = require('../models/Transaction');
const mongoose = require('mongoose');

// POST
// /api/transactions/create
exports.createTrans = async (req, res, next) => {
    try{
        const {merchant, category, amount, cardId,} = req.body || {};
        const card = await Card.findOne({ _id: req.params.cardId, userId: req.userId });

        // ADD check on merchant

        const rewardRate = card.cardProduct.get(category);

        const trans = await Transaction.create({
            cardId:     cardId,
            userId:     req.userId,
            merchant:   merchant,
            category:   category,
            amount:     amount,
            status:     "pending",
            rewardRate: rewardRate,
            rewardsEarned: amount * rewardRate,
        });

        res
            .status(201)
            .location(`/api/transactions/${trans.id}`)
            .json(trans);
    } catch (err){
        next(err);
    }
};

// GET
// Get all transactions for the user
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

// Get single transactions
// /api/transactions/getTrans
exports.getTrans = async (req, res, next) => {
  try {
    // returns 404, without revealing that it exists
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
            return res.status(404).json({ error: "Cant delete, card does not exist." });
        }
        res.status(200).json(deletedTrans);
    } catch (err) {
        next(err);
    }
};