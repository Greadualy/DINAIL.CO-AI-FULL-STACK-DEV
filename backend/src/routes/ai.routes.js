const express = require('express');
const { analyzePhoto, analyzeNails } = require('../controllers/ai.controller');
const { aiRateLimiter } = require('../middlewares/rateLimiter');

const router = express.Router();

router.post('/analyze-photo', aiRateLimiter, analyzePhoto);
router.post('/analyze-nails', aiRateLimiter, analyzeNails);

module.exports = router;
