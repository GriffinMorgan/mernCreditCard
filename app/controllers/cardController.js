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
        const cards = await Card.find({userId: req.userId}).sort({createdAt: -1});
        res.status(200).json(cards);
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