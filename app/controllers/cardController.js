const Card = require('../models/Card');
// POST
// /api/cards/createCard
exports.createCard = async (req, res, next) => {
    try{
        const { cardName = '', network, last4, creditLimit, currentBalance = 0, apr, expirationDate, status} = req.body || {};

        // Frontend needs to have these fields + apr:
        if (!cardName || !network || !last4 || creditLimit == null || apr == null || !expirationDate){
            return res.status(400).json({error: 'cardName, network, last4, creditLimit, apr and expirationDate are required'}); 
        }      
        if (await Card.exists({ userId : req.userId, network: String(network), last4: String(last4)})){
            return res.status(409).json({ error: 'This card already exists' });
        }

        const card = await Card.create({
            userId:         req.userId,
            cardName:       String(cardName),
            network:        String(network),
            last4:          String(last4),
            creditLimit:    String(creditLimit),
            currentBalance: String(currentBalance),
            apr:            String(apr),
            expirationDate: String(expirationDate)
        });

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