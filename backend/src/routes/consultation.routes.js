const express = require('express');
const {
  createConsultation,
  getMyConsultations,
  getAllConsultations,
  updateConsultation,
} = require('../controllers/consultation.controller');
const { optionalFirebaseToken } = require('../middlewares/auth.middleware');

const router = express.Router();

router.get('/', getAllConsultations);
router.get('/me', optionalFirebaseToken, getMyConsultations);
router.post('/', optionalFirebaseToken, createConsultation);
router.patch('/:id', updateConsultation);

module.exports = router;
