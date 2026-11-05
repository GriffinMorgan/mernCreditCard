const Card = require('../models/Card');
const mongoose = require('mongoose');
const { isValidExpirationFormat, isExpired } = require('../config/utils');
const CardProduct = require('../models/CardProduct');
// POST
// /api/cards/createCard
exports.createCard = async (req, res, next) => {
    try{
        const { cardName = '', cardProduct, last4, creditLimit, currentBalance = 0, apr, expirationDate} = req.body || {};
        
        
        // Frontend needs to have these fields + apr:
        if (!cardName || !cardProduct || !last4 || creditLimit == null || apr == null || !expirationDate){
            return res.status(400).json({error: 'cardName, network, last4, creditLimit, apr and expirationDate are required'}); 
        }
        if (!isValidExpirationFormat(expirationDate)){
            return res.status(400).json({error: 'Expiration date must be in MMMM/YY format'});
        }
        if (await Card.exists({ userId : req.userId, last4: String(last4)})){
            return res.status(409).json({ error: 'This card already exists' });
        }
        
        const product = await CardProduct.findById(cardProduct);
        if (!product) {
            return res.status(404).json({ error: 'Card product not found' });
        }

        if (await Card.exists({ userId: req.userId, network: product.network, last4: String(last4) })) {
            return res.status(409).json({ error: 'This card already exists' });
        }

        const card = await Card.create({
            userId:         req.userId,
            cardName:       String(cardName),
            cardProduct:    product._id,
            network:        product.network,
            last4:          String(last4),
            creditLimit:    String(creditLimit),
            currentBalance: String(currentBalance),
            apr:            String(apr),
            expirationDate: String(expirationDate),
            status:         isExpired(expirationDate) ? "closed" : "active"
        });
        
        await card.populate('cardProduct');
        res
            .status(201)
            .location(`/api/users/${card.id}`)
            .json(card);
    } catch(err){
        next(err);
    }
};

// GET
// /api/cards/getCards

/* 
FRONTEND GETS A DATA AND PAGINATION JSON so write -> const {data, pagination} = await res.json();
*/
exports.getCards = async (req, res, next) => {
    try{
        const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
        const limit = Math.min(Math.max(parseInt(req.query.limit, 10) || 10, 1), 50);
        const skip = (page - 1) * limit;
        const filter = {userId : req.userId}; // used to find only cards with our logged in userID

        const [cards, total] = await Promise.all([
            Card.find(filter)
            .sort({createdAt: -1, _id: -1})
            .skip(skip)
            .limit(limit),
            Card.countDocuments(filter)
        ]);

        const totalPages = Math.ceil(total / limit);

        res.status(200).json({
            data: cards,
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

// /api/cards/getCard
exports.getCard = async (req, res, next) => {
  try {
    // Filtering by both _id and userId means another user's card
    // returns 404, without revealing that it exists
    const card = await Card.findOne({ _id: req.params.cardId, userId: req.userId });
    if (!card) return res.status(404).json({ error: 'Card not found' });
    res.status(200).json(card);
  } catch (err) {
    next(err);
  }
};

// DELETE
// /api/cards/deleteCard

exports.deleteCard = async (req, res, next) => {
    try{
        // Deletes card using the cardID input parameter we want to delete
        const deletedCard = await Card.deleteOne({_id: req.params.cardId, userId: req.userId});
        if (deletedCard.deletedCount === 0) {
            return res.status(404).json({ error: "Cant delete, card does not exist." });
        }
        res.status(200).json(deletedCard);
    } catch (err) {
        next(err);
    }
};