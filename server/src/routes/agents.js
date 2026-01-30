const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth');
const { getCropEconomyNews } = require('../agents/cropNewsAgent');
const { searchCropInfo } = require('../agents/searchAgent');
const { getWeatherAnalysis } = require('../agents/weatherAgent');
const { priceInsightsAgent } = require('../agents/priceInsightsAgent');
const orchestrator = require('../agents/dataOrchestrator');

// Get crop economy news using LangGraph agent
router.get('/crop-news', authMiddleware, async (req, res) => {
  try {
    if (req.user.userType !== 'admin') {
      return res.status(403).json({ error: 'Access denied' });
    }

    const newsReport = await getCropEconomyNews();
    res.json({ success: true, data: newsReport });
  } catch (error) {
    console.error('Crop news agent error:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch crop news' });
  }
});

// Search crop info - for farmers to ask questions
router.post('/search', authMiddleware, async (req, res) => {
  try {
    const { query } = req.body;
    
    if (!query || query.trim().length < 3) {
      return res.status(400).json({ success: false, error: 'Please enter a valid question' });
    }

    const result = await searchCropInfo(query);
    res.json({ success: true, data: result });
  } catch (error) {
    console.error('Search agent error:', error);
    res.status(500).json({ success: false, error: 'Failed to process your question' });
  }
});

// Get commodity prices directly
router.get('/prices/:commodity', authMiddleware, async (req, res) => {
  try {
    const { commodity } = req.params;
    const { state } = req.query;
    
    const data = await orchestrator.getCommodityPrices(commodity, state);
    
    if (!data) {
      return res.status(404).json({ success: false, error: 'Commodity not found' });
    }
    
    res.json({ success: true, data });
  } catch (error) {
    console.error('Price fetch error:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch prices' });
  }
});

// Get available commodities
router.get('/commodities', authMiddleware, async (req, res) => {
  try {
    const { state } = req.query;
    const commodities = await orchestrator.getAvailableCommodities(state);
    res.json({ success: true, commodities });
  } catch (error) {
    console.error('Commodities fetch error:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch commodities' });
  }
});

// Weather analysis for crop and location
router.post('/weather', authMiddleware, async (req, res) => {
  try {
    const { cropType, location } = req.body;
    
    if (!cropType || !location) {
      return res.status(400).json({ 
        success: false, 
        error: 'Please provide cropType and location' 
      });
    }

    const weatherData = await getWeatherAnalysis(cropType, location);
    res.json({ success: true, data: weatherData });
  } catch (error) {
    console.error('Weather agent error:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch weather analysis' });
  }
});

// Price Insights - Get comprehensive market price analysis
router.post('/price-insights', authMiddleware, async (req, res) => {
  try {
    const { cropType, location } = req.body;
    
    if (!cropType || !location) {
      return res.status(400).json({ 
        success: false, 
        error: 'Please provide cropType and location' 
      });
    }

    // Initialize state for the agent
    const state = {
      cropType,
      location,
      errors: []
    };

    const result = await priceInsightsAgent(state);
    
    res.json({ 
      success: true, 
      data: result.priceInsights,
      errors: result.errors?.length > 0 ? result.errors : undefined
    });
  } catch (error) {
    console.error('Price Insights agent error:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch price insights' });
  }
});

module.exports = router;
