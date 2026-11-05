const express = require('express');
const admins = require('../controllers/adminController');
const validateObjectId = require('../middleware/validateObjectId');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();

// Every card route requires a logged-in user
router.use(requireAuth('admin'));

router.param('userId', validateObjectId);

// GET /admin/      - list out all accounts
router.get('/', admins.list);

// POST /admin/createAdmin       - create a an admin user
router.post('/createAdmin', admins.createAdmin);

// POST /admin/createCompany       - create a company user
router.post('/createCompany', admins.createCompany);

// POST /admin/users/:userId/password - change password for a specific user
router.post('/users/:userId/password', admins.changePassword);

// PATCH /admin/users/:userId/disable - Toggle or set user account to disabled
//router.patch('/users/:userId/disable', admins.disableAccount);

module.exports = router;