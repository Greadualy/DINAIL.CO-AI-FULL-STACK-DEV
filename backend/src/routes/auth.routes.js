const express = require('express');
const router = express.Router();
const { verifyFirebaseToken } = require('../middlewares/auth.middleware');
const { syncUser, getMe, saveNailSize } = require('../controllers/auth.controller');

router.post('/sync', verifyFirebaseToken, syncUser);
router.get('/me', verifyFirebaseToken, getMe);
router.put('/nail-size', verifyFirebaseToken, saveNailSize);

module.exports = router;
