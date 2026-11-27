const express = require('express');
const { analyzePhoto, analyzeNails } = require('../controllers/ai.controller');

const router = express.Router();

router.post('/analyze-photo', analyzePhoto);
router.post('/analyze-nails', analyzeNails);

module.exports = router;
