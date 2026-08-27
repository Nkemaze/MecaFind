const { Router } = require('express');

const controller = require('../controllers/admin.controller');
const { allowRoles, requireAuth } = require('../middleware/auth');

const router = Router();

router.use(requireAuth, allowRoles('admin'));
router.get('/mechanics', controller.mechanics);
router.patch('/mechanics/:id/status', controller.updateMechanicStatus);
router.get('/users', controller.users);
router.patch('/users/:id/status', controller.updateUserStatus);
router.get('/payments', controller.paymentRecords);
router.post('/payments/:id/confirm', controller.confirmPayment);

module.exports = router;
