const { MistralService } = require('../services/mistralService');
const prompts = require('../utils/prompts');
const { parseLLMJson } = require('../utils/jsonParser');
const { getCommodityPrices, getMandiData } = require('./dataOrchestrator');
const mandiService = require('../services/mandiService');
const { ChatMistralAI } = require("@langchain/mistralai");

// Mistral instance for price estimation fallback
const mistral = new ChatMistralAI({
  model: "mistral-small-latest",
  apiKey: process.env.MISTRAL_API_KEY,
  temperature: 0.3,
});

/**
 * Price Insights Agent
 * 
 * Role: Analyze market prices and provide actionable insights for farmers
 * Data Sources: Real-time mandi prices, historical trends, regional comparisons
 * 
 * Focus Areas:
 * - Fetch mandi-level pricing data for specific crops
 * - Collect min, max, and modal (most common) prices
 * - Gather data from multiple mandis for comparison
 * - Track the same crop across different cities/regions
 * - Identify price variations and arbitrage opportunities
 * - Provide selling recommendations based on market conditions
 */

// Common commodity name mappings (user input -> API names)
const COMMODITY_ALIASES = {
    'wheat': 'Wheat',
    'rice': 'Rice',
    'paddy': 'Paddy(Dhan)(Common)',
    'onion': 'Onion',
    'potato': 'Potato',
    'tomato': 'Tomato',
    'cotton': 'Cotton',
    'soybean': 'Soyabean',
    'soya': 'Soyabean',
    'maize': 'Maize',
    'corn': 'Maize',
    'sugarcane': 'Sugarcane',
    'groundnut': 'Groundnut',
    'peanut': 'Groundnut',
    'mustard': 'Mustard',
    'chana': 'Bengal Gram(Gram)(Whole)',
    'chickpea': 'Bengal Gram(Gram)(Whole)',
    'gram': 'Bengal Gram(Gram)(Whole)',
    'arhar': 'Arhar (Tur/Red Gram)(Whole)',
    'tur': 'Arhar (Tur/Red Gram)(Whole)',
    'toor': 'Arhar (Tur/Red Gram)(Whole)',
    'dal': 'Arhar (Tur/Red Gram)(Whole)',
    'moong': 'Green Gram (Moong)(Whole)',
    'mung': 'Green Gram (Moong)(Whole)',
    'urad': 'Black Gram (Urd Beans)(Whole)',
    'black gram': 'Black Gram (Urd Beans)(Whole)',
    'bajra': 'Bajra(Pearl Millet/Cumbu)',
    'pearl millet': 'Bajra(Pearl Millet/Cumbu)',
    'jowar': 'Jowar(Sorghum)',
    'sorghum': 'Jowar(Sorghum)',
    'ragi': 'Ragi (Finger Millet)',
    'finger millet': 'Ragi (Finger Millet)',
    'banana': 'Banana',
    'apple': 'Apple',
    'mango': 'Mango',
    'orange': 'Orange',
    'grapes': 'Grapes',
    'papaya': 'Papaya',
    'watermelon': 'Watermelon',
    'pomegranate': 'Pomegranate',
    'coconut': 'Coconut',
    'garlic': 'Garlic',
    'ginger': 'Ginger(Green)',
    'green chilli': 'Green Chilli',
    'chilli': 'Dry Chillies',
    'red chilli': 'Dry Chillies',
    'turmeric': 'Turmeric',
    'coriander': 'Coriander(Leaves)',
    'cabbage': 'Cabbage',
    'cauliflower': 'Cauliflower',
    'brinjal': 'Brinjal',
    'eggplant': 'Brinjal',
    'ladies finger': 'Ladies Finger',
    'okra': 'Ladies Finger',
    'bhindi': 'Ladies Finger',
    'carrot': 'Carrot',
    'beetroot': 'Beetroot',
    'beans': 'Beans',
    'peas': 'Peas(Green)',
    'capsicum': 'Capsicum',
    'lemon': 'Lemon',
    'lime': 'Lime',
    'cucumber': 'Cucumber(Kheera)',
    'bitter gourd': 'Bitter gourd',
    'bottle gourd': 'Bottle gourd',
    'ridge gourd': 'Ridge gourd(Tori)',
    'pumpkin': 'Pumpkin',
    'spinach': 'Spinach',
    'methi': 'Methi(Leaves)',
    'fenugreek': 'Methi(Leaves)',
    'coriander seeds': 'Corriander seed',
    'cumin': 'Cummin Seed(Jeera)',
    'jeera': 'Cummin Seed(Jeera)',
    'black pepper': 'Black pepper',
    'pepper': 'Black pepper',
    'cardamom': 'Cardamom',
    'cloves': 'Cloves',
    'castor': 'Castor Seed',
    'sesame': 'Sesamum(Sesame,Gingelly,Til)',
    'til': 'Sesamum(Sesame,Gingelly,Til)',
    'sunflower': 'Sunflower',
    'safflower': 'Safflower',
    'linseed': 'Linseed',
    'copra': 'Copra',
    'arecanut': 'Arecanut(Betelnut/Supari)',
    'supari': 'Arecanut(Betelnut/Supari)',
    'cashew': 'Cashewnuts',
    'sweet potato': 'Sweet Potato',
    'tapioca': 'Tapioca',
    'drumstick': 'Drumstick',
    'mushroom': 'Mushrooms',
    'dry chillies': 'Dry Chillies'
};

// Language configuration for multilingual support
const languageConfig = {
    en: {
        name: 'English',
        instruction: ''
    },
    hi: {
        name: 'Hindi',
        instruction: 'कृपया सभी टेक्स्ट फ़ील्ड्स (rationale, best_time_to_sell, market_factors) को हिंदी में लिखें।'
    },
    ta: {
        name: 'Tamil',
        instruction: 'தயவுசெய்து அனைத்து உரை புலங்களையும் (rationale, best_time_to_sell, market_factors) தமிழில் எழுதவும்.'
    },
    pa: {
        name: 'Punjabi',
        instruction: 'ਕਿਰਪਾ ਕਰਕੇ ਸਾਰੇ ਟੈਕਸਟ ਫੀਲਡਾਂ ਨੂੰ ਪੰਜਾਬੀ ਵਿੱਚ ਲਿਖੋ।'
    },
    mr: {
        name: 'Marathi',
        instruction: 'कृपया सर्व मजकूर फील्ड मराठीत लिहा.'
    }
};

async function priceInsightsAgent(state) {
    const { cropType, location, language = 'en' } = state;
    
    try {
        // Fetch real mandi data
        const mandiRecords = await fetchMandiPrices(cropType, location);
        
        // If no mandi data found, fallback to Mistral LLM estimation
        if (!mandiRecords || mandiRecords.length === 0) {
            console.log(`[Price Agent] No mandi data for ${cropType} in ${location}, using Mistral LLM fallback...`);
            const llmPriceData = await getLLMPriceEstimate(cropType, location, language);
            return {
                ...state,
                priceInsights: llmPriceData
            };
        }
        
        // Validate and structure the data
        const validatedData = validatePriceData(mandiRecords, cropType, location);
        
        // Enrich with analytics and insights (pass language for translations)
        const priceInsights = enrichPriceData(validatedData, language);

        return {
            ...state,
            priceInsights: priceInsights
        };
    } catch (error) {
        console.error('Price Insights Agent Error:', error.message);
        // Try LLM fallback on error as well
        try {
            console.log(`[Price Agent] Error occurred, trying Mistral LLM fallback...`);
            const llmPriceData = await getLLMPriceEstimate(cropType, location);
            return {
                ...state,
                priceInsights: llmPriceData
            };
        } catch (llmError) {
            console.error('LLM Price Fallback Error:', llmError.message);
            return {
                ...state,
                priceInsights: getDefaultPriceInsights(cropType, location),
                errors: [...(state.errors || []), { agent: "priceInsightsAgent", error: error.message }]
            };
        }
    }
}

/**
 * Get price estimates from Mistral LLM when mandi data is unavailable
 */
async function getLLMPriceEstimate(cropType, location, language = 'en') {
    // Get language instruction
    const langConfig = languageConfig[language] || languageConfig.en;
    const langInstruction = language !== 'en' 
        ? `\n\nIMPORTANT LANGUAGE REQUIREMENT: ${langConfig.instruction} All text fields (best_time_to_sell, market_factors array, price_rationale) must be written in ${langConfig.name}.`
        : '';

    const prompt = `You are an expert agricultural price analyst for Indian markets.${langInstruction}

Provide realistic current market price estimates for ${cropType} in ${location}, India.

Based on your knowledge of Indian agricultural markets, MSP (Minimum Support Price), seasonal trends, and regional factors, provide:

1. Estimated current modal price (most common trading price) in ₹/quintal
2. Estimated minimum price in ₹/quintal  
3. Estimated maximum price in ₹/quintal
4. Price trend (rising/stable/falling)
5. Best time to sell${language !== 'en' ? ` (in ${langConfig.name})` : ''}
6. Key market factors affecting price${language !== 'en' ? ` (in ${langConfig.name})` : ''}

IMPORTANT: Return ONLY a valid JSON object in this exact format:
{
  "estimated_modal_price": <number>,
  "estimated_min_price": <number>,
  "estimated_max_price": <number>,
  "price_trend": "<rising|stable|falling>",
  "confidence": "<high|medium|low>",
  "best_time_to_sell": "<string${language !== 'en' ? ` in ${langConfig.name}` : ''}>",
  "market_factors": ["<factor1${language !== 'en' ? ` in ${langConfig.name}` : ''}>", "<factor2>", "<factor3>"],
  "msp_reference": <number or null>,
  "price_rationale": "<brief explanation${language !== 'en' ? ` in ${langConfig.name}` : ''}>"
}

Provide realistic prices based on actual Indian market conditions for ${new Date().toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })}.`;
  "price_rationale": "<brief explanation>"
}

Provide realistic prices based on actual Indian market conditions for ${new Date().toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })}.`;

    try {
        const response = await mistral.invoke(prompt);
        const content = response.content || '';
        
        // Extract JSON from response
        let jsonMatch = content.match(/\{[\s\S]*\}/);
        if (!jsonMatch) {
            throw new Error('No JSON found in LLM response');
        }
        
        const llmData = JSON.parse(jsonMatch[0]);
        
        console.log(`[Price Agent] LLM estimated prices for ${cropType}: ₹${llmData.estimated_modal_price}/quintal`);
        
        // Build price insights structure from LLM data
        return {
            crop: cropType,
            location: location,
            data_collection_date: new Date().toISOString(),
            data_source: 'AI_ESTIMATE',
            total_mandis_fetched: 0,
            mandi_prices: [],
            
            // AI-generated price estimates
            ai_price_estimate: {
                modal_price: llmData.estimated_modal_price,
                min_price: llmData.estimated_min_price,
                max_price: llmData.estimated_max_price,
                price_trend: llmData.price_trend,
                confidence: llmData.confidence,
                msp_reference: llmData.msp_reference,
                rationale: llmData.price_rationale
            },
            
            market_summary: {
                your_location: {
                    nearest_mandi: `${location} (AI Estimate)`,
                    city: location,
                    modal_price: llmData.estimated_modal_price,
                    min_price: llmData.estimated_min_price,
                    max_price: llmData.estimated_max_price,
                    price_display: `₹${llmData.estimated_modal_price}/quintal (AI Estimate)`
                },
                regional_prices: {
                    highest_price: {
                        price: llmData.estimated_max_price,
                        mandi: 'Premium Markets',
                        city: location,
                        display: `₹${llmData.estimated_max_price}/quintal (AI Estimate)`
                    },
                    lowest_price: {
                        price: llmData.estimated_min_price,
                        mandi: 'Local Markets',
                        city: location,
                        display: `₹${llmData.estimated_min_price}/quintal (AI Estimate)`
                    },
                    average_price: llmData.estimated_modal_price,
                    average_display: `₹${llmData.estimated_modal_price}/quintal`
                },
                price_variation: {
                    percentage: `${(((llmData.estimated_max_price - llmData.estimated_min_price) / llmData.estimated_modal_price) * 100).toFixed(1)}%`,
                    interpretation: 'Based on AI market analysis',
                    level: 'moderate'
                }
            },
            
            selling_guidance: {
                best_market: {
                    recommendation: `Check nearby mandis in ${location}`,
                    expected_price: llmData.estimated_modal_price,
                    reason: llmData.price_rationale
                },
                price_advantage: {
                    extra_earning: `₹${llmData.estimated_max_price - llmData.estimated_modal_price}/quintal potential`,
                    percentage_gain: `${(((llmData.estimated_max_price - llmData.estimated_modal_price) / llmData.estimated_modal_price) * 100).toFixed(1)}%`,
                    worth_traveling: llmData.estimated_max_price - llmData.estimated_modal_price > 100
                },
                timing_advice: llmData.best_time_to_sell,
                quality_tips: 'Ensure proper grading and moisture content for best prices'
            },
            
            market_intelligence: {
                market_condition: `Price trend: ${llmData.price_trend}`,
                trend_indicator: llmData.price_trend,
                market_factors: llmData.market_factors,
                arbitrage_opportunity: {
                    exists: false,
                    potential_gain: 'Check multiple mandis for opportunities',
                    recommendation: 'Compare prices at nearby markets before selling'
                },
                spread_analysis: {
                    average_spread: llmData.estimated_max_price - llmData.estimated_min_price,
                    interpretation: `Price range of ₹${llmData.estimated_max_price - llmData.estimated_min_price}/quintal`
                },
                market_efficiency: `Confidence: ${llmData.confidence}`
            },
            
            disclaimer: 'Prices are AI-estimated based on historical data and market knowledge. Actual mandi prices may vary. Please verify with local mandis before selling.'
        };
    } catch (error) {
        console.error('LLM Price Estimation Error:', error.message);
        throw error;
    }
}

/**
 * Fetch mandi prices from data orchestrator
 */
async function fetchMandiPrices(cropType, location) {
    try {
        // Try to get state from location
        const state = extractState(location);
        
        // Normalize crop type - check aliases first
        const normalizedCrop = COMMODITY_ALIASES[cropType.toLowerCase()] || cropType;
        
        console.log(`Searching for: ${normalizedCrop} (original: ${cropType}) in ${state || 'all India'}`);
        
        // Build filter with state filter
        const filters = { 
            commodity: normalizedCrop, 
            limit: 100 
        };
        
        // Add state filter if we found a valid state
        if (state) {
            filters.state = state;
        }
        
        // Fetch from orchestrator with commodity + state filter
        let records = await getMandiData(filters);
        console.log(`Found ${records.length} records with exact commodity match in ${state || 'all India'}`);
        
        // If no records with exact commodity match, try partial search
        if (records.length === 0) {
            console.log(`Trying broad search for state: ${state}...`);
            const broadFilters = { limit: 500 };
            if (state) {
                broadFilters.state = state;
            }
            
            const allRecords = await getMandiData(broadFilters);
            console.log(`Got ${allRecords.length} total records from ${state || 'all India'}`);
            
            // Filter by partial commodity match (case-insensitive)
            const searchTerm = cropType.toLowerCase();
            records = allRecords.filter(r => 
                r.commodity && r.commodity.toLowerCase().includes(searchTerm)
            );
            
            console.log(`Found ${records.length} records with partial match for "${cropType}" in ${state || 'all India'}`);
        }
        
        // If STILL no records found for the state, inform user but DON'T fallback to nationwide
        // This ensures we only show state-specific data
        if (records.length === 0 && state) {
            console.log(`No data available for ${cropType} in ${state}. Commodity might not be traded in this state today.`);
            // Return empty - don't pollute with other states' data
            return [];
        }

        // IMPORTANT: Double-check state filter - only return records matching the requested state
        if (state) {
            const stateFiltered = records.filter(r => 
                r.state && r.state.toLowerCase() === state.toLowerCase()
            );
            console.log(`After state verification: ${stateFiltered.length} records from ${state}`);
            records = stateFiltered;
        }

        return records.map(record => ({
            produce: record.commodity || cropType,
            mandi_name: record.market || 'Unknown Mandi',
            city: record.district || 'Unknown City',
            state: record.state || state || location,
            min_price: parseFloat(record.min_price) || 0,
            max_price: parseFloat(record.max_price) || 0,
            modal_price: parseFloat(record.modal_price) || 0,
            arrival_date: record.arrival_date || new Date().toISOString(),
            unit: 'quintal'
        }));
    } catch (error) {
        console.error('Error fetching mandi prices:', error.message);
        return [];
    }
}

/**
 * Validate and structure price data
 */
function validatePriceData(records, cropType, location) {
    const mandiPrices = records.map(mandi => ({
        produce: mandi.produce || cropType,
        mandi_name: mandi.mandi_name || 'Unknown Mandi',
        city: mandi.city || 'Unknown City',
        state: mandi.state || extractState(location),
        min_price: parsePrice(mandi.min_price),
        max_price: parsePrice(mandi.max_price),
        modal_price: parsePrice(mandi.modal_price),
        price_spread: 0,
        unit: mandi.unit || 'quintal'
    }));

    // Calculate price spreads
    mandiPrices.forEach(mandi => {
        mandi.price_spread = mandi.max_price - mandi.min_price;
    });

    return {
        crop: cropType,
        location: location,
        data_collection_date: new Date().toISOString(),
        total_mandis_fetched: mandiPrices.length,
        mandi_prices: mandiPrices
    };
}

/**
 * Enrich price data with calculated analytics and insights
 */
function enrichPriceData(data) {
    if (data.mandi_prices.length === 0) {
        return {
            ...data,
            market_summary: getEmptyMarketSummary(),
            selling_guidance: getEmptySelllingGuidance(),
            market_intelligence: getEmptyMarketIntelligence()
        };
    }

    const modalPrices = data.mandi_prices.map(m => m.modal_price).filter(p => p > 0);
    const allMinPrices = data.mandi_prices.map(m => m.min_price).filter(p => p > 0);
    const allMaxPrices = data.mandi_prices.map(m => m.max_price).filter(p => p > 0);

    // Find best and worst prices
    const sortedByModal = [...data.mandi_prices].sort((a, b) => b.modal_price - a.modal_price);
    const highestModal = sortedByModal[0];
    const lowestModal = sortedByModal[sortedByModal.length - 1];

    // Calculate averages
    const avgModal = modalPrices.length > 0 
        ? Math.round(modalPrices.reduce((a, b) => a + b, 0) / modalPrices.length) 
        : 0;
    
    // Price variation calculation
    const priceVariation = modalPrices.length > 1
        ? ((Math.max(...modalPrices) - Math.min(...modalPrices)) / avgModal * 100).toFixed(2)
        : 0;

    // Find nearest mandi (first one or one matching location)
    const nearestMandi = data.mandi_prices[0];

    // Price difference calculations
    const priceDifference = highestModal && nearestMandi 
        ? highestModal.modal_price - nearestMandi.modal_price 
        : 0;
    const priceDifferencePercent = nearestMandi?.modal_price > 0
        ? ((priceDifference / nearestMandi.modal_price) * 100).toFixed(2)
        : 0;

    // Build enriched data structure
    return {
        ...data,
        
        // Market Summary Section
        market_summary: {
            your_location: {
                nearest_mandi: nearestMandi?.mandi_name || 'Unknown',
                city: nearestMandi?.city || 'Unknown',
                modal_price: nearestMandi?.modal_price || 0,
                min_price: nearestMandi?.min_price || 0,
                max_price: nearestMandi?.max_price || 0,
                price_display: nearestMandi ? `₹${nearestMandi.modal_price}/quintal` : 'N/A'
            },
            regional_prices: {
                highest_price: {
                    price: highestModal?.modal_price || 0,
                    mandi: highestModal?.mandi_name || 'Unknown',
                    city: highestModal?.city || 'Unknown',
                    display: highestModal ? `₹${highestModal.modal_price}/quintal at ${highestModal.mandi_name}` : 'N/A'
                },
                lowest_price: {
                    price: lowestModal?.modal_price || 0,
                    mandi: lowestModal?.mandi_name || 'Unknown',
                    city: lowestModal?.city || 'Unknown',
                    display: lowestModal ? `₹${lowestModal.modal_price}/quintal at ${lowestModal.mandi_name}` : 'N/A'
                },
                average_price: avgModal,
                average_display: `₹${avgModal}/quintal`
            },
            price_variation: {
                percentage: `${priceVariation}%`,
                interpretation: getPriceVariationInterpretation(parseFloat(priceVariation)),
                level: getVariationLevel(parseFloat(priceVariation))
            }
        },

        // Selling Guidance Section
        selling_guidance: {
            best_market: {
                recommendation: highestModal 
                    ? `Sell at ${highestModal.mandi_name}, ${highestModal.city}`
                    : 'Unable to determine',
                expected_price: highestModal?.modal_price || 0,
                reason: highestModal 
                    ? `Highest modal price at ₹${highestModal.modal_price}/quintal`
                    : 'No data available'
            },
            price_advantage: {
                extra_earning: `₹${priceDifference}/quintal`,
                percentage_gain: `${priceDifferencePercent}%`,
                worth_traveling: priceDifference > 100
            },
            timing_advice: getTimingAdvice(data.mandi_prices),
            quality_tips: getQualityTips(nearestMandi)
        },

        // Market Intelligence Section
        market_intelligence: {
            market_condition: getMarketCondition(parseFloat(priceVariation), avgModal),
            trend_indicator: inferPriceTrend(data.mandi_prices),
            arbitrage_opportunity: {
                exists: priceDifference > 100,
                potential_gain: `₹${priceDifference}/quintal`,
                recommendation: priceDifference > 100 
                    ? 'Yes - Consider selling at higher-priced market'
                    : 'No - Prices are relatively uniform'
            },
            spread_analysis: {
                average_spread: Math.round(data.mandi_prices.reduce((a, m) => a + m.price_spread, 0) / data.mandi_prices.length),
                interpretation: getPriceSpreadAnalysis(data.mandi_prices)
            },
            market_efficiency: getMarketEfficiency(parseFloat(priceVariation))
        }
    };
}

// ========== Helper Functions ==========

function parsePrice(price) {
    if (typeof price === 'number') return price;
    if (typeof price === 'string') {
        const parsed = parseFloat(price.replace(/[₹,]/g, ''));
        return isNaN(parsed) ? 0 : parsed;
    }
    return 0;
}

function extractState(location) {
    // Complete list of Indian states matching the Mandi API
    const states = [
        'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh',
        'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand',
        'Karnataka', 'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur',
        'Meghalaya', 'Mizoram', 'Nagaland', 'Odisha', 'Punjab',
        'Rajasthan', 'Sikkim', 'Tamil Nadu', 'Telangana', 'Tripura',
        'Uttar Pradesh', 'Uttarakhand', 'West Bengal',
        // Union Territories
        'Delhi', 'Chandigarh', 'Puducherry', 'Jammu and Kashmir', 'Ladakh'
    ];
    
    // Also check common abbreviations and alternate names
    const stateAliases = {
        'up': 'Uttar Pradesh',
        'mp': 'Madhya Pradesh',
        'hp': 'Himachal Pradesh',
        'ap': 'Andhra Pradesh',
        'wb': 'West Bengal',
        'tn': 'Tamil Nadu',
        'jk': 'Jammu and Kashmir',
        'uk': 'Uttarakhand',
        'bengal': 'West Bengal',
        'bengaluru': 'Karnataka',
        'bangalore': 'Karnataka',
        'mumbai': 'Maharashtra',
        'chennai': 'Tamil Nadu',
        'kolkata': 'West Bengal',
        'hyderabad': 'Telangana',
        'delhi': 'Delhi',
        'pune': 'Maharashtra',
        'ahmedabad': 'Gujarat',
        'jaipur': 'Rajasthan',
        'lucknow': 'Uttar Pradesh',
        'patna': 'Bihar',
        'bhopal': 'Madhya Pradesh',
        'indore': 'Madhya Pradesh',
        'nagpur': 'Maharashtra',
        'nashik': 'Maharashtra',
        'coimbatore': 'Tamil Nadu',
        'kochi': 'Kerala',
        'cochin': 'Kerala',
        'thiruvananthapuram': 'Kerala',
        'trivandrum': 'Kerala',
        'chandigarh': 'Chandigarh',
        'amritsar': 'Punjab',
        'ludhiana': 'Punjab',
        'surat': 'Gujarat',
        'vadodara': 'Gujarat',
        'rajkot': 'Gujarat',
        'visakhapatnam': 'Andhra Pradesh',
        'vizag': 'Andhra Pradesh',
        'vijayawada': 'Andhra Pradesh'
    };
    
    const locationLower = location.toLowerCase().trim();
    
    // Check aliases first (for city names)
    for (const [alias, state] of Object.entries(stateAliases)) {
        if (locationLower.includes(alias)) {
            return state;
        }
    }
    
    // Check full state names
    for (const state of states) {
        if (locationLower.includes(state.toLowerCase())) {
            return state;
        }
    }
    
    // Return null if no state found (will search nationwide)
    return null;
}

function getVariationLevel(variation) {
    if (variation < 5) return 'low';
    if (variation < 10) return 'medium';
    return 'high';
}

function getPriceVariationInterpretation(variation) {
    if (variation < 5) return 'Prices are stable and consistent across markets';
    if (variation < 10) return 'Moderate price differences exist - worth comparing markets';
    return 'Significant price differences - strong opportunity to find better deals';
}

function getPriceSpreadAnalysis(mandiPrices) {
    if (mandiPrices.length === 0) return 'No data available';
    
    const avgSpread = mandiPrices.reduce((a, m) => a + m.price_spread, 0) / mandiPrices.length;
    const avgModal = mandiPrices.reduce((a, m) => a + m.modal_price, 0) / mandiPrices.length;
    const spreadPercent = avgModal > 0 ? (avgSpread / avgModal * 100).toFixed(2) : 0;

    if (parseFloat(spreadPercent) < 5) {
        return 'Tight price spreads - stable demand, clear quality expectations';
    }
    if (parseFloat(spreadPercent) < 15) {
        return 'Moderate spreads - normal market conditions';
    }
    return 'Wide spreads - volatile market, quality significantly affects pricing';
}

function getMarketEfficiency(variation) {
    if (variation < 5) return 'Highly efficient - well-integrated market with similar prices';
    if (variation < 10) return 'Moderately efficient - some price discovery differences';
    return 'Inefficient market - large price differences, shop around for better deals';
}

function getMarketCondition(variation, avgPrice) {
    if (variation < 5 && avgPrice > 0) {
        return { status: 'Stable', description: 'Market is stable with consistent pricing' };
    }
    if (variation < 10) {
        return { status: 'Normal', description: 'Normal market conditions with typical variations' };
    }
    return { status: 'Volatile', description: 'Market is volatile - prices vary significantly' };
}

function inferPriceTrend(mandiPrices) {
    if (mandiPrices.length === 0) return { direction: 'unknown', description: 'Insufficient data' };
    
    const validPrices = mandiPrices.filter(m => m.max_price > m.min_price);
    if (validPrices.length === 0) return { direction: 'stable', description: 'Prices appear stable' };
    
    // Calculate position of modal price within min-max range
    const modalToMaxRatio = validPrices.reduce((a, m) => {
        const range = m.max_price - m.min_price;
        return a + ((m.modal_price - m.min_price) / range);
    }, 0) / validPrices.length;

    if (modalToMaxRatio > 0.6) {
        return { direction: 'rising', description: 'Prices trending upward - modal prices near maximum' };
    }
    if (modalToMaxRatio < 0.4) {
        return { direction: 'falling', description: 'Prices trending downward - modal prices near minimum' };
    }
    return { direction: 'stable', description: 'Prices stable - modal prices centered in range' };
}

function getTimingAdvice(mandiPrices) {
    const trend = inferPriceTrend(mandiPrices);
    
    if (trend.direction === 'rising') {
        return {
            advice: 'Consider holding if possible',
            reason: 'Prices appear to be rising'
        };
    }
    if (trend.direction === 'falling') {
        return {
            advice: 'Consider selling soon',
            reason: 'Prices appear to be declining'
        };
    }
    return {
        advice: 'Sell when convenient',
        reason: 'Prices are stable - no urgent timing pressure'
    };
}

function getQualityTips(mandi) {
    if (!mandi || mandi.max_price === 0) {
        return { tip: 'Ensure produce is clean and properly graded', premium_potential: 'Unknown' };
    }
    
    const range = mandi.max_price - mandi.min_price;
    const premiumPotential = range > 0 ? `₹${range}/quintal` : 'Minimal';
    
    return {
        tip: 'Higher quality produce can fetch premium prices. Ensure proper cleaning, sorting, and grading.',
        premium_potential: premiumPotential,
        max_achievable: `₹${mandi.max_price}/quintal`
    };
}

// ========== Empty/Default Data Structures ==========

function getEmptyMarketSummary() {
    return {
        your_location: {
            nearest_mandi: 'Unknown',
            city: 'Unknown',
            modal_price: 0,
            min_price: 0,
            max_price: 0,
            price_display: 'N/A'
        },
        regional_prices: {
            highest_price: { price: 0, mandi: 'Unknown', city: 'Unknown', display: 'N/A' },
            lowest_price: { price: 0, mandi: 'Unknown', city: 'Unknown', display: 'N/A' },
            average_price: 0,
            average_display: 'N/A'
        },
        price_variation: {
            percentage: '0%',
            interpretation: 'No data available',
            level: 'unknown'
        }
    };
}

function getEmptySelllingGuidance() {
    return {
        best_market: {
            recommendation: 'Unable to determine - no price data',
            expected_price: 0,
            reason: 'No market data available'
        },
        price_advantage: {
            extra_earning: '₹0/quintal',
            percentage_gain: '0%',
            worth_traveling: false
        },
        timing_advice: {
            advice: 'Check back later for updated prices',
            reason: 'Insufficient data for timing recommendation'
        },
        quality_tips: {
            tip: 'Ensure produce is clean and properly graded',
            premium_potential: 'Unknown'
        }
    };
}

function getEmptyMarketIntelligence() {
    return {
        market_condition: { status: 'Unknown', description: 'No data available' },
        trend_indicator: { direction: 'unknown', description: 'Insufficient data' },
        arbitrage_opportunity: {
            exists: false,
            potential_gain: '₹0/quintal',
            recommendation: 'Unable to assess - no data'
        },
        spread_analysis: {
            average_spread: 0,
            interpretation: 'No data available'
        },
        market_efficiency: 'Unable to assess'
    };
}

/**
 * Default price insights when data fetch fails
 */
function getDefaultPriceInsights(cropType, location) {
    return {
        crop: cropType,
        location: location,
        data_collection_date: new Date().toISOString(),
        total_mandis_fetched: 0,
        mandi_prices: [],
        market_summary: getEmptyMarketSummary(),
        selling_guidance: getEmptySelllingGuidance(),
        market_intelligence: getEmptyMarketIntelligence()
    };
}

module.exports = { priceInsightsAgent, fetchMandiPrices };
