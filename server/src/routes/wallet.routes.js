const { Router } = require('express');

const controller = require('../controllers/wallet.controller');
const { allowRoles, requireAuth } = require('../middleware/auth');

const router = Router();

router.use(requireAuth, allowRoles('car_owner'));
router.get('/me', controller.wallet);
router.get('/transactions', controller.transactions);
router.get('/payments', controller.payments);
router.post('/payments/checkout', controller.createCheckout);
router.post('/mechanics/:id/directions-use', controller.useDirections);

module.exports = router;
