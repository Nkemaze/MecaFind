const { Router } = require('express');

const controller = require('../controllers/mechanic.controller');
const { allowRoles, requireAuth } = require('../middleware/auth');
const { upload } = require('../middleware/upload');

const router = Router();

router.use(requireAuth);
router.get('/nearby', allowRoles('car_owner', 'admin'), controller.nearby);
router.get('/me', allowRoles('mechanic'), controller.ownProfile);
router.post('/', allowRoles('mechanic'), controller.createProfile);
router.patch('/me', allowRoles('mechanic'), controller.updateOwnProfile);
router.post('/me/photos', allowRoles('mechanic'), upload.array('photos', 8), controller.uploadPhotos);
router.delete('/me/photos/:photoId', allowRoles('mechanic'), controller.deletePhoto);
router.get('/:id', controller.getOne);

module.exports = router;
