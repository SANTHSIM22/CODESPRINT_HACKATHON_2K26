const express = require('express');
const router = express.Router();
const analyticsController = require('../controllers/analyticsController');
const authMiddleware = require('../middleware/auth');

// Analyze endpoint - NO AUTH required for public access
router.post('/analyze', analyticsController.analyze);

// Protected routes require authentication
router.use(authMiddleware);

// Get Mandi prices with filters
router.get('/mandi/prices', analyticsController.getMandiPrices);

// Get available states
router.get('/mandi/states', analyticsController.getStates);

// Get districts for a state
router.get('/mandi/districts', analyticsController.getDistricts);

// Get commodities for a state and district
router.get('/mandi/commodities', analyticsController.getCommodities);

module.exports = router;
