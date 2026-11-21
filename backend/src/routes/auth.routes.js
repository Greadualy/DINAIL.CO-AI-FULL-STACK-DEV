const express = require('express');
const router = express.Router();
const { verifyFirebaseToken } = require('../middlewares/auth.middleware');
const { syncUser, getMe } = require('../controllers/auth.controller');

router.post('/sync', verifyFirebaseToken, syncUser);
router.get('/me', verifyFirebaseToken, getMe);

module.exports = router;
