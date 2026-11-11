const express = require('express');
const cards = require('../controllers/cardController');
const validateObjectId = require('../middleware/validateObjectId');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();

// Every card route requires a logged-in user
router.use(requireAuth());

router.param('cardId', validateObjectId);
router.param('userId', validateObjectId);

// POST /api/cards       - add a card to the logged-in user's account
router.post('/', cards.createCard);

// GET  /api/cards/products - list available card products
router.get('/products', cards.getCardProducts);

// GET  /api/cards       - list the logged-in user's cards
router.get('/', cards.getCards);

// GET  /api/cards/:cardId - one card, only if it belongs to the user
router.get('/:cardId', cards.getCard);

// DELETE /api/cards/:cardId - delete a specific card
router.delete('/:cardId', cards.deleteCard);
module.exports = router;