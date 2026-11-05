const express = require('express');
const transactions = require('../controllers/transactionController');
const validateObjectId = require('../middleware/validateObjectId');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();

// Every card route requires a logged-in user
router.use(requireAuth);

router.param('transId', validateObjectId);
router.param('cardId', validateObjectId);
router.param('userId', validationObjectId);

// POST /api/transaction/create     - Add a transaction
router.post('/', transactions.createTrans);

// GET  /api/cards/getTrans         - Get all transactions for user
router.get('/', transactions.getTrans);

// GET  /api/cards/:transId - one card, only if it belongs to the user
router.get('/:transId', transactions.getTrans);

// DELETE /api/cards/delete
router.get('/', transaction.deleteTrans);
module.exports = router;