const express = require('express');
const transactions = require('../controllers/transactionController');
const validateObjectId = require('../middleware/validateObjectId');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();

// Every card route requires a logged-in user
router.use(requireAuth('user'));

router.param('transId', validateObjectId);
router.param('cardId', validateObjectId);
router.param('userId', validateObjectId);

// POST /api/transactions/create     - Add a transaction
router.post('/',transactions.createTrans);

// GET  /api/transactions/getTrans         - Get all transactions for user
router.get('/', transactions.getTrans);

// GET  /api/transactions/:transId - one card, only if it belongs to the user
router.get('/:transId', transactions.getTransById);

// GET /api/transactions/analysis
router.get('/analysis', transactions.getTransAnalysis);

// DELETE /api/transactions/delete:transId
router.delete('/:transId', transactions.deleteTrans);
module.exports = router;