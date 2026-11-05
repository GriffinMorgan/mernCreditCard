const transaction = require('..models/Transaction');
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
