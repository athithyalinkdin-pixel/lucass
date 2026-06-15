const express = require('express');
const router = express.Router();
const { getActiveTestimonials } = require('../controllers/testimonialController');

router.get('/', getActiveTestimonials);

module.exports = router;
