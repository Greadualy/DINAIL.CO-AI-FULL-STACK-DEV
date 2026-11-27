const express = require('express');
const {
  createConsultation,
  getMyConsultations,
  getAllConsultations,
  updateConsultation,
} = require('../controllers/consultation.controller');
const {
  verifyFirebaseToken,
  optionalFirebaseToken,
  requireAdmin,
} = require('../middlewares/auth.middleware');

const router = express.Router();

router.get('/', verifyFirebaseToken, requireAdmin, getAllConsultations);
router.get('/me', verifyFirebaseToken, getMyConsultations);
router.post('/', optionalFirebaseToken, createConsultation);
router.patch('/:id', verifyFirebaseToken, requireAdmin, updateConsultation);

module.exports = router;
