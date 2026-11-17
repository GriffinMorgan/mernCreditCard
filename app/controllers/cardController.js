const Card = require('../models/Card');
const mongoose = require('mongoose');
const { isValidExpirationFormat, isExpired } = require('../config/utils');
const CardProduct = require('../models/CardProduct');

// Moves the populated product's rates onto the card; cardProductId stays a plain ID.
// Expects a lean card with cardProductId populated.
const flattenCard = ({ cardProductId: product, ...card }) => ({
    ...card,
    cardProductId: product?._id ?? null,
    baseRate: product?.baseRate ?? null,
    categoryRates: product?.categoryRates ?? {}
});

// POST /api/cards
exports.createCard = async (req, res, next) => {
  try {
    const { cardName = '', cardProduct, last4, creditLimit, currentBalance = 0, apr, expirationDate } = req.body || {};

    if (!cardName || !cardProduct || !last4 || creditLimit == null || apr == null || !expirationDate) {
      return res.status(400).json({ error: 'cardName, cardProduct, last4, creditLimit, apr and expirationDate are required' });
    }

    if (!isValidExpirationFormat(expirationDate)) {
      return res.status(400).json({ error: 'Expiration date must be in MM/YYYY format' });
    }

    const product = await CardProduct.findById(cardProduct);
    if (!product) {
      return res.status(404).json({ error: 'Card product not found' });
    }

    if (await Card.exists({ userId: req.userId, network: product.network, last4: String(last4) })) {
      return res.status(409).json({ error: 'This card already exists for this network and last4 digits' });
    }

    // Pass ObjectIds and Numbers matching MongoDB schema requirements
    const card = await Card.create({
      userId: new mongoose.Types.ObjectId(req.userId),
      cardName: String(cardName).trim(),
      cardProductId: new mongoose.Types.ObjectId(product._id), // Matched to DB schema field name
      network: product.network,
      last4: String(last4),
      creditLimit: Number(creditLimit),
      currentBalance: Number(currentBalance),
      apr: Number(apr),
      expirationDate: String(expirationDate),
      status: isExpired(expirationDate) ? "closed" : "active"
    });

    await card.populate('cardProductId');

    res
      .status(201)
      .location(`/api/cards/${card._id}`)
      .json(card);
  } catch (err) {
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
                .limit(limit)
                .populate('cardProductId', 'baseRate categoryRates')
                .lean(),
            Card.countDocuments(filter)
        ]);

        const totalPages = Math.ceil(total / limit);

        res.status(200).json({
            data: cards.map(flattenCard),
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

// GET /api/cards/:cardId
exports.getCard = async (req, res, next) => {
  try {
    // Filtering by both _id and userId means another user's card
    // returns 404, without revealing that it exists
    const card = await Card.findOne({ _id: req.params.cardId, userId: req.userId })
      .populate('cardProductId', 'baseRate categoryRates')
      .lean();
    if (!card) return res.status(404).json({ error: 'Card not found' });
    res.status(200).json(flattenCard(card));
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

// GET /api/cards/products
// Access: any logged-in user
// Returns every card product (_id, name, network, annualFee, baseRate, categoryRates)
exports.getCardProducts = async (req, res, next) => {
  try {
    const products = await CardProduct.find({})
      .select('name network annualFee baseRate categoryRates')
      .sort({ name: 1 });

    res.status(200).json(products);
  } catch (err) {
    next(err);
  }
};

// POST /api/cards/products
// Access: company role
// Body: { name, network, annualFee?, baseRate, categoryRates? }
exports.createCardProduct = async (req, res, next) => {
  try {
    // Assumes auth middleware sets req.userRole alongside req.userId
    if (req.userRole !== 'company') {
      return res.status(403).json({ error: 'Only company accounts can create card products' });
    }

    const { name, network, annualFee = 0, baseRate, categoryRates = {} } = req.body || {};

    if (!name || !network || baseRate == null) {
      return res.status(400).json({ error: 'name, network and baseRate are required' });
    }

    if (typeof categoryRates !== 'object' || categoryRates === null || Array.isArray(categoryRates)) {
      return res.status(400).json({ error: 'categoryRates must be an object, e.g. { "dining": 3, "travel": 2 }' });
    }

    // Only whitelisted fields are passed, so clients can't set createdAt or _id
    const product = await CardProduct.create({
      name: String(name).trim(),
      network,
      annualFee: Number(annualFee),
      baseRate: Number(baseRate),
      categoryRates
    });

    res.status(201).json(product);
  } catch (err) {
    // Duplicate product name (unique index on name)
    if (err.code === 11000) {
      return res.status(409).json({ error: 'A card product with this name already exists' });
    }
    // Schema validation: bad network, negative rates/fees, non-numeric values, etc.
    if (err.name === 'ValidationError') {
      const messages = Object.values(err.errors).map(e => e.message);
      return res.status(400).json({ error: messages.join('; ') });
    }
    next(err);
  }
};