const { Router } = require('express');

const controller = require('../controllers/auth.controller');
const { requireAuth } = require('../middleware/auth');

const router = Router();

router.post('/register', controller.register);
router.post('/login', controller.login);
router.post('/forgot-password', controller.forgotPassword);
router.post('/reset-password', controller.resetPassword);
router.get('/me', requireAuth, controller.me);
router.post('/change-password', requireAuth, controller.changePassword);

module.exports = router;
