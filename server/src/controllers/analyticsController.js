const mandiService = require('../services/mandiService');

/**
 * Get Mandi prices based on filters
 */
const getMandiPrices = async (req, res) => {
  try {
    const { state, district, commodity, market, variety, grade, limit, offset } = req.query;

    const filters = {};
    if (state) filters.state = state;
    if (district) filters.district = district;
    if (commodity) filters.commodity = commodity;
    if (market) filters.market = market;
    if (variety) filters.variety = variety;
    if (grade) filters.grade = grade;
    if (limit) filters.limit = parseInt(limit);
    if (offset) filters.offset = parseInt(offset);

    const result = await mandiService.getMandiPrices(filters);

    res.status(200).json({
      success: true,
      message: 'Mandi prices fetched successfully',
      ...result.data
    });
  } catch (error) {
    console.error('Error in getMandiPrices controller:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to fetch Mandi prices'
    });
  }
};

/**
 * Get list of available states
 */
const getStates = async (req, res) => {
  try {
    const result = await mandiService.getStates();

    res.status(200).json({
      success: true,
      message: 'States fetched successfully',
      states: result.states
    });
  } catch (error) {
    console.error('Error in getStates controller:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to fetch states'
    });
  }
};

/**
 * Get list of districts for a state
 */
const getDistricts = async (req, res) => {
  try {
    const { state } = req.query;

    if (!state) {
      return res.status(400).json({
        success: false,
        message: 'State parameter is required'
      });
    }

    const result = await mandiService.getDistricts(state);

    res.status(200).json({
      success: true,
      message: 'Districts fetched successfully',
      districts: result.districts
    });
  } catch (error) {
    console.error('Error in getDistricts controller:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to fetch districts'
    });
  }
};

/**
 * Get list of commodities for a state and district
 */
const getCommodities = async (req, res) => {
  try {
    const { state, district } = req.query;

    const result = await mandiService.getCommodities(state, district);

    res.status(200).json({
      success: true,
      message: 'Commodities fetched successfully',
      commodities: result.commodities
    });
  } catch (error) {
    console.error('Error in getCommodities controller:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to fetch commodities'
    });
  }
};

module.exports = {
  getMandiPrices,
  getStates,
  getDistricts,
  getCommodities
};
