const axios = require('axios');

const MANDI_API_BASE_URL = 'https://api.data.gov.in/resource/9ef84268-d588-465a-a308-a864a43d0070';
const API_KEY = process.env.MANDI_API_KEY || '579b464db66ec23bdd000001cdd3946e44ce4aad7209ff7b23ac571b';

// List of major Indian states with Mandi data
const INDIAN_STATES = [
  'Andhra Pradesh',
  'Arunachal Pradesh',
  'Assam',
  'Bihar',
  'Chhattisgarh',
  'Goa',
  'Gujarat',
  'Haryana',
  'Himachal Pradesh',
  'Jharkhand',
  'Karnataka',
  'Kerala',
  'Madhya Pradesh',
  'Maharashtra',
  'Manipur',
  'Meghalaya',
  'Mizoram',
  'Nagaland',
  'Odisha',
  'Punjab',
  'Rajasthan',
  'Sikkim',
  'Tamil Nadu',
  'Telangana',
  'Tripura',
  'Uttar Pradesh',
  'Uttarakhand',
  'West Bengal'
];

/**
 * Fetch current daily prices of commodities from various markets (Mandi)
 * @param {Object} filters - Query filters
 * @param {string} filters.state - State name (e.g., "Karnataka")
 * @param {string} filters.district - District name
 * @param {string} filters.commodity - Commodity name
 * @param {string} filters.market - Market name
 * @param {string} filters.variety - Variety name
 * @param {string} filters.grade - Grade
 * @param {number} filters.limit - Maximum number of records (default: 100)
 * @param {number} filters.offset - Number of records to skip (default: 0)
 * @returns {Promise<Object>} Mandi price data
 */
const getMandiPrices = async (filters = {}) => {
  try {
    const params = {
      'api-key': API_KEY,
      format: 'json',
      limit: filters.limit || 100,
      offset: filters.offset || 0
    };

    // Add filters if provided
    if (filters.state) {
      params['filters[state.keyword]'] = filters.state;
    }
    if (filters.district) {
      params['filters[district]'] = filters.district;
    }
    if (filters.commodity) {
      params['filters[commodity]'] = filters.commodity;
    }
    if (filters.market) {
      params['filters[market]'] = filters.market;
    }
    if (filters.variety) {
      params['filters[variety]'] = filters.variety;
    }
    if (filters.grade) {
      params['filters[grade]'] = filters.grade;
    }

    const response = await axios.get(MANDI_API_BASE_URL, { 
      params,
      timeout: 15000 // 15 second timeout
    });

    return {
      success: true,
      data: response.data
    };
  } catch (error) {
    console.error('Error fetching Mandi prices:', error.message);
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', error.response.data);
    }
    throw new Error('Failed to fetch Mandi prices: ' + error.message);
  }
};

/**
 * Fetch ALL records from Mandi API using pagination
 * @param {Object} filters - Query filters (same as getMandiPrices)
 * @param {number} recordsPerPage - Records per page (default: 10, max recommended: 100)
 * @returns {Promise<Object>} All Mandi price data
 */
const getAllMandiPrices = async (filters = {}, recordsPerPage = 100) => {
  try {
    let allRecords = [];
    let offset = 0;
    let totalRecords = 0;
    let hasMoreData = true;
    let pageCount = 0;
    const MAX_PAGES = 500; // Safety brake: prevent infinite loops (500 * 100 = 50,000 records max)

    console.log('Starting pagination fetch...');

    while (hasMoreData && pageCount < MAX_PAGES) {
      pageCount++;
      
      const params = {
        'api-key': API_KEY,
        format: 'json',
        limit: recordsPerPage, // Use a higher number here (e.g., 100) for faster fetching
        offset: offset
      };

      // Add filters dynamically
      const filterKeys = ['state', 'district', 'commodity', 'market', 'variety', 'grade'];
      filterKeys.forEach(key => {
        if (filters[key]) {
          // Note: Check if your API specifically needs 'state.keyword' or just 'state'
          const paramName = key === 'state' ? 'filters[state.keyword]' : `filters[${key}]`;
          params[paramName] = filters[key];
        }
      });

      console.log(`Fetching batch ${pageCount}: Offset ${offset} (Limit: ${recordsPerPage})...`);

      const response = await axios.get(MANDI_API_BASE_URL, {
        params,
        timeout: 30000 // Increased timeout for larger batches
      });

      const data = response.data;

      if (data) {
        // 1. Capture Total Records (only on first page)
        if (offset === 0 && data.total) {
          totalRecords = parseInt(data.total, 10);
          console.log(`--- Total records available on server: ${totalRecords} ---`);
        }

        // 2. Validate and Append Records
        const currentBatch = data.records || [];
        
        if (currentBatch.length > 0) {
          allRecords = allRecords.concat(currentBatch);
          
          // 3. Update Offset
          offset += recordsPerPage;

          console.log(`Progress: ${allRecords.length} / ${totalRecords} fetched.`);

          // 4. Check Exit Conditions
          // Stop if we have fetched equal to or more than the total reported by API
          // OR if the current batch is smaller than the limit (indicates last page)
          if (allRecords.length >= totalRecords || currentBatch.length < recordsPerPage) {
            hasMoreData = false;
          }
        } else {
          // Empty records array received
          hasMoreData = false;
        }
      } else {
        hasMoreData = false;
      }

      // Small delay to avoid 429 (Too Many Requests) errors
      if (hasMoreData) {
        await new Promise(resolve => setTimeout(resolve, 200)); 
      }
    }

    if (pageCount >= MAX_PAGES) {
      console.warn(`Warning: Reached maximum safety limit of ${MAX_PAGES} pages. Fetching stopped.`);
    }

    console.log(`Fetch Complete! Final count: ${allRecords.length}`);

    return {
      success: true,
      data: {
        total: totalRecords, // Total reported by API
        records: allRecords, // Actual records fetched
        count: allRecords.length
      }
    };

  } catch (error) {
    console.error('Error fetching Mandi prices:', error.message);
    if (error.response) {
      console.error('API Error Details:', error.response.status, error.response.data);
    }
    throw new Error('Failed to fetch all Mandi prices: ' + error.message);
  }
};

/**
 * Get unique states from Mandi data
 * @returns {Promise<Array>} List of states
 */
const getStates = async () => {
  try {
    // Return predefined list of Indian states
    return {
      success: true,
      states: INDIAN_STATES
    };
  } catch (error) {
    console.error('Error fetching states:', error.message);
    throw new Error('Failed to fetch states: ' + error.message);
  }
};

/**
 * Get districts for a specific state
 * @param {string} state - State name
 * @returns {Promise<Array>} List of districts
 */
const getDistricts = async (state) => {
  try {
    const response = await axios.get(MANDI_API_BASE_URL, {
      params: {
        'api-key': API_KEY,
        format: 'json',
        'filters[state.keyword]': state,
        limit: 500
      },
      timeout: 10000 // 10 second timeout
    });

    if (response.data && response.data.records) {
      const districts = [...new Set(response.data.records.map(record => record.district))];
      return {
        success: true,
        districts: districts.filter(d => d).sort() // Filter out null/undefined values
      };
    }

    return {
      success: true,
      districts: []
    };
  } catch (error) {
    console.error('Error fetching districts:', error.message);
    return {
      success: false,
      districts: [],
      error: error.message
    };
  }
};

/**
 * Get commodities for a specific state and district
 * @param {string} state - State name
 * @param {string} district - District name
 * @returns {Promise<Array>} List of commodities
 */
const getCommodities = async (state, district) => {
  try {
    const params = {
      'api-key': API_KEY,
      format: 'json',
      limit: 500
    };

    if (state) {
      params['filters[state.keyword]'] = state;
    }
    if (district) {
      params['filters[district]'] = district;
    }

    const response = await axios.get(MANDI_API_BASE_URL, { 
      params,
      timeout: 10000 // 10 second timeout
    });

    if (response.data && response.data.records) {
      const commodities = [...new Set(response.data.records.map(record => record.commodity))];
      return {
        success: true,
        commodities: commodities.filter(c => c).sort() // Filter out null/undefined values
      };
    }

    return {
      success: true,
      commodities: []
    };
  } catch (error) {
    console.error('Error fetching commodities:', error.message);
    return {
      success: false,
      commodities: [],
      error: error.message
    };
  }
};

module.exports = {
  getMandiPrices,
  getAllMandiPrices,
  getStates,
  getDistricts,
  getCommodities
};
