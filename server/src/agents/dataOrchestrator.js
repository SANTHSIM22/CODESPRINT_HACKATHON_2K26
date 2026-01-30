const mandiService = require('../services/mandiService');

/**
 * Shared Data Orchestrator
 * Provides centralized data access for all agents
 */

// Cache for mandi data (refresh every 30 minutes)
let mandiCache = {
  data: null,
  timestamp: null,
  ttl: 30 * 60 * 1000 // 30 minutes
};

/**
 * Get Mandi prices with caching
 */
async function getMandiData(filters = {}) {
  try {
    const result = await mandiService.getMandiPrices(filters);
    return result.data?.records || [];
  } catch (error) {
    console.error('Orchestrator: Mandi data fetch error:', error.message);
    return [];
  }
}

/**
 * Get prices for a specific commodity across states
 */
async function getCommodityPrices(commodity, state = null) {
  const filters = { commodity, limit: 50 };
  if (state) filters.state = state;
  
  const records = await getMandiData(filters);
  
  if (records.length === 0) return null;
  
  const prices = records.map(r => ({
    market: r.market,
    district: r.district,
    state: r.state,
    minPrice: parseFloat(r.min_price) || 0,
    maxPrice: parseFloat(r.max_price) || 0,
    modalPrice: parseFloat(r.modal_price) || 0,
    date: r.arrival_date
  }));
  
  const avgPrice = prices.reduce((sum, p) => sum + p.modalPrice, 0) / prices.length;
  const minPrice = Math.min(...prices.map(p => p.minPrice));
  const maxPrice = Math.max(...prices.map(p => p.maxPrice));
  
  return {
    commodity,
    state: state || 'All India',
    recordCount: prices.length,
    avgModalPrice: Math.round(avgPrice),
    minPrice,
    maxPrice,
    priceRange: `₹${minPrice} - ₹${maxPrice}`,
    markets: prices.slice(0, 10) // Top 10 markets
  };
}

/**
 * Get available commodities list
 */
async function getAvailableCommodities(state = null) {
  try {
    const result = await mandiService.getCommodities(state);
    return result.commodities || [];
  } catch (error) {
    return [];
  }
}

/**
 * Get states list
 */
async function getStates() {
  try {
    const result = await mandiService.getStates();
    return result.states || [];
  } catch (error) {
    return [];
  }
}

/**
 * Search commodities by keyword
 */
async function searchCommodity(keyword, state = null) {
  const commodities = await getAvailableCommodities(state);
  const matches = commodities.filter(c => 
    c.toLowerCase().includes(keyword.toLowerCase())
  );
  return matches;
}

/**
 * Get market summary for a state
 */
async function getStateSummary(state) {
  const records = await getMandiData({ state, limit: 100 });
  
  if (records.length === 0) return null;
  
  const commodities = [...new Set(records.map(r => r.commodity))];
  const districts = [...new Set(records.map(r => r.district))];
  
  return {
    state,
    totalRecords: records.length,
    commoditiesCount: commodities.length,
    districtsCount: districts.length,
    topCommodities: commodities.slice(0, 10),
    districts: districts.slice(0, 10)
  };
}

module.exports = {
  getMandiData,
  getCommodityPrices,
  getAvailableCommodities,
  getStates,
  searchCommodity,
  getStateSummary
};
