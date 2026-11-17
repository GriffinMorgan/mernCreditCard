const express = require('express');
const company = require('../controllers/companyController');
const validateObjectId = require('../middleware/validateObjectId');
const { requireAuth, requireSelf } = require('../middleware/auth');

const router = express.Router();
router.use(requireAuth("company"));
router.param('userId', validateObjectId);

// Every company route requires a logged-in user with the company role

router.get('/summary', company.getSummary);
router.get('/category-analysis', company.getCategoryAnalysis);

module.exports = router;