const express = require('express');
const router = express.Router();
const { register, login, getMe, createUser } = require('../controllers/authController');
const { protect, authorize } = require('../middleware/auth');

router.post('/register', register);
router.post('/login', login);
router.get('/me', protect, getMe);
router.post('/create-user', protect, authorize('admin'), createUser);

module.exports = router;
