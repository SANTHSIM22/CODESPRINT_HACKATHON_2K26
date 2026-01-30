const { ChatMistralAI } = require("@langchain/mistralai");
const { priceInsightsAgent, fetchMandiPrices } = require('./priceInsightsAgent');
const { getCropEconomyNews } = require('./cropNewsAgent');
const { getWeatherAnalysis } = require('./weatherAgent');
const { searchCropInfo } = require('./searchAgent');

/**
 * Master Orchestrator
 * 
 * Combines all agents and produces a comprehensive analysis for farmers.
 * 
 * Input Parameters:
 * - cropType: Type of crop (wheat, rice, etc.)
 * - location: State/Region (Punjab, Maharashtra, etc.)
 * - quantity: Amount in quintals
 * - quality: Quality grade (A, B, C)
 * - storageCapacity: Available storage in quintals
 * - financialUrgency: low, medium, high
 */

const mistral = new ChatMistralAI({
  model: "mistral-small-latest",
  apiKey: process.env.MISTRAL_API_KEY,
  temperature: 0.3,
});

/**
 * Run all agents in parallel and collect data
 */
async function runAllAgents(params) {
  const { cropType, location, quantity, quality, storageCapacity, financialUrgency } = params;
  
  console.log('\n' + '═'.repeat(60));
  console.log('🚀 MASTER ORCHESTRATOR - Starting Analysis');
  console.log(`📦 Crop: ${cropType} | 📍 Location: ${location}`);
  console.log(`📊 Qty: ${quantity}qtl | ⭐ Quality: ${quality}`);
  console.log(`🏠 Storage: ${storageCapacity}qtl | 💰 Urgency: ${financialUrgency}`);
  console.log('═'.repeat(60));

  const agentResults = {
    priceData: null,
    newsAnalysis: null,
    weatherAnalysis: null,
    searchInsights: null,
    errors: []
  };

  // Run agents in parallel
  const agentPromises = [
    // 1. Price Agent - Get mandi prices
    (async () => {
      try {
        console.log('\n[📊 Price Agent] Fetching mandi prices...');
        const result = await priceInsightsAgent({ cropType, location });
        agentResults.priceData = formatPriceData(result.priceInsights);
        console.log('[📊 Price Agent] ✅ Complete');
      } catch (error) {
        console.error('[📊 Price Agent] ❌ Error:', error.message);
        agentResults.errors.push({ agent: 'price', error: error.message });
      }
    })(),

    // 2. News Agent - Get crop news
    (async () => {
      try {
        console.log('\n[📰 News Agent] Fetching agricultural news...');
        const newsReport = await getCropEconomyNews();
        agentResults.newsAnalysis = formatNewsData(newsReport, cropType);
        console.log('[📰 News Agent] ✅ Complete');
      } catch (error) {
        console.error('[📰 News Agent] ❌ Error:', error.message);
        agentResults.errors.push({ agent: 'news', error: error.message });
      }
    })(),

    // 3. Weather Agent - Get weather analysis
    (async () => {
      try {
        console.log('\n[🌤️ Weather Agent] Analyzing weather conditions...');
        const weatherData = await getWeatherAnalysis(cropType, location);
        agentResults.weatherAnalysis = formatWeatherData(weatherData);
        console.log('[🌤️ Weather Agent] ✅ Complete');
      } catch (error) {
        console.error('[🌤️ Weather Agent] ❌ Error:', error.message);
        agentResults.errors.push({ agent: 'weather', error: error.message });
      }
    })(),

    // 4. Search Agent - Get market intelligence
    (async () => {
      try {
        console.log('\n[🔍 Search Agent] Gathering market intelligence...');
        const searchQuery = `${cropType} market trends price forecast ${location} India 2025`;
        const searchResult = await searchCropInfo(searchQuery);
        agentResults.searchInsights = formatSearchData(searchResult, cropType);
        console.log('[🔍 Search Agent] ✅ Complete');
      } catch (error) {
        console.error('[🔍 Search Agent] ❌ Error:', error.message);
        agentResults.errors.push({ agent: 'search', error: error.message });
      }
    })()
  ];

  await Promise.all(agentPromises);

  return agentResults;
}

/**
 * Format price data from price insights agent
 */
function formatPriceData(priceInsights) {
  if (!priceInsights) return null;

  // Check if this is AI-estimated data (no mandi data available)
  if (priceInsights.data_source === 'AI_ESTIMATE' || priceInsights.ai_price_estimate) {
    const aiEstimate = priceInsights.ai_price_estimate;
    const marketSummary = priceInsights.market_summary;
    
    return {
      data_source: 'AI_ESTIMATE',
      mandi_prices: [],
      ai_estimated_prices: {
        modal_price: aiEstimate?.modal_price || marketSummary?.your_location?.modal_price,
        min_price: aiEstimate?.min_price || marketSummary?.your_location?.min_price,
        max_price: aiEstimate?.max_price || marketSummary?.your_location?.max_price,
        price_trend: aiEstimate?.price_trend || 'stable',
        confidence: aiEstimate?.confidence || 'medium',
        rationale: aiEstimate?.rationale || priceInsights.selling_guidance?.best_market?.reason
      },
      price_analysis: {
        regional_comparison: {
          regional_average_modal: marketSummary?.regional_prices?.average_price,
          price_range: `₹${marketSummary?.regional_prices?.lowest_price?.price} - ₹${marketSummary?.regional_prices?.highest_price?.price}`
        }
      },
      insights: {
        best_market_to_sell: priceInsights.selling_guidance?.best_market?.recommendation,
        timing_advice: priceInsights.selling_guidance?.timing_advice,
        market_factors: priceInsights.market_intelligence?.market_factors || []
      },
      disclaimer: priceInsights.disclaimer,
      total_mandis_fetched: 0
    };
  }

  // Original mandi data format
  return {
    data_source: 'MANDI_API',
    mandi_prices: priceInsights.mandi_prices?.map(m => ({
      mandi_name: m.mandi_name || m.market,
      city: m.city || m.district,
      state: m.state,
      min_price: m.min_price || m.minPrice,
      modal_price: m.modal_price || m.modalPrice,
      max_price: m.max_price || m.maxPrice
    })) || priceInsights.markets?.map(m => ({
      mandi_name: m.market || m.mandi_name,
      city: m.district || m.city,
      state: m.state,
      min_price: m.minPrice || m.min_price,
      modal_price: m.modalPrice || m.modal_price,
      max_price: m.maxPrice || m.max_price
    })) || [],
    price_analysis: {
      regional_comparison: {
        regional_average_modal: priceInsights.market_summary?.regional_prices?.average_price || priceInsights.avgModalPrice || priceInsights.average_price,
        price_range: priceInsights.market_summary?.price_variation?.percentage || priceInsights.priceRange || `₹${priceInsights.minPrice} - ₹${priceInsights.maxPrice}`
      }
    },
    insights: {
      best_market_to_sell: priceInsights.selling_guidance?.best_market?.recommendation || priceInsights.bestMarket || priceInsights.markets?.[0]?.market,
      local_vs_best_market_difference: priceInsights.selling_guidance?.price_advantage?.extra_earning || priceInsights.priceDifference || 'N/A',
      timing_advice: priceInsights.selling_guidance?.timing_advice
    },
    total_mandis_fetched: priceInsights.total_mandis_fetched || priceInsights.recordCount || priceInsights.markets?.length || 0
  };
}

/**
 * Format news data
 */
function formatNewsData(newsReport, cropType) {
  if (!newsReport) return null;

  const articles = newsReport.articles || [];
  
  // Determine sentiment from analysis
  const analysis = newsReport.analysis || '';
  let sentiment = 'neutral';
  if (analysis.toLowerCase().includes('increase') || analysis.toLowerCase().includes('rise') || analysis.toLowerCase().includes('up')) {
    sentiment = 'bullish';
  } else if (analysis.toLowerCase().includes('decrease') || analysis.toLowerCase().includes('fall') || analysis.toLowerCase().includes('down')) {
    sentiment = 'bearish';
  }

  return {
    news_items: articles.slice(0, 5).map(article => ({
      headline: article.title,
      summary: article.description || 'No summary available',
      source: article.source,
      date: article.publishedAt ? new Date(article.publishedAt).toLocaleDateString() : 'Recent',
      impact: determineImpact(article.title, cropType),
      urgency: 'medium'
    })),
    overall_sentiment: sentiment,
    key_takeaway: extractKeyTakeaway(analysis)
  };
}

/**
 * Format weather data
 */
function formatWeatherData(weatherData) {
  if (!weatherData) return null;

  const weather = weatherData.weather || {};
  
  // Determine price pressure based on weather
  let pricePressure = 'Stable';
  if (weather.rainfall > 20 || weather.temperature > 35) {
    pricePressure = 'Upward (supply concerns)';
  } else if (weather.rainfall < 5 && weather.temperature < 15) {
    pricePressure = 'Downward (good harvest expected)';
  }

  return {
    current_conditions: {
      temperature: `${weather.temperature}°C`,
      humidity: `${weather.humidity}%`,
      precipitation: `${weather.rainfall}mm`,
      conditions_summary: weather.condition || 'Normal conditions'
    },
    forecast_7day: weatherData.analysis?.substring(0, 200) || 'Weather expected to remain stable for the next week.',
    price_pressure: pricePressure,
    harvest_impact: weatherData.optimalActions || 'Continue normal farming practices',
    risk_level: weatherData.riskLevel || 'medium',
    recommendations: weatherData.recommendations || []
  };
}

/**
 * Format search/market intelligence data
 */
function formatSearchData(searchResult, cropType) {
  if (!searchResult) return null;

  const answer = searchResult.answer || '';
  
  // Determine market sentiment from AI answer
  let sentiment = 'neutral';
  if (answer.toLowerCase().includes('increase') || answer.toLowerCase().includes('bullish') || answer.toLowerCase().includes('rise')) {
    sentiment = 'bullish';
  } else if (answer.toLowerCase().includes('decrease') || answer.toLowerCase().includes('bearish') || answer.toLowerCase().includes('fall')) {
    sentiment = 'bearish';
  }

  return {
    search_insights: [
      {
        topic: 'Market Trend',
        finding: answer.substring(0, 300),
        source: 'AI Analysis',
        relevance: 'high'
      }
    ],
    market_sentiment: sentiment,
    demand_signals: extractDemandSignals(answer),
    expert_forecasts: extractForecast(answer)
  };
}

/**
 * Helper functions
 */
function determineImpact(title, cropType) {
  const titleLower = title.toLowerCase();
  const cropLower = cropType.toLowerCase();
  
  if (titleLower.includes(cropLower)) return 'high';
  if (titleLower.includes('msp') || titleLower.includes('price')) return 'medium';
  return 'low';
}

function extractKeyTakeaway(analysis) {
  if (!analysis) return 'Monitor market conditions closely.';
  const sentences = analysis.split('.');
  return sentences[0]?.trim() || 'Market conditions are evolving.';
}

function extractDemandSignals(answer) {
  if (!answer) return 'Normal demand levels';
  if (answer.toLowerCase().includes('high demand')) return 'High demand observed';
  if (answer.toLowerCase().includes('low demand')) return 'Demand is subdued';
  return 'Moderate demand in market';
}

function extractForecast(answer) {
  if (!answer) return 'Prices expected to remain stable';
  const forecastKeywords = ['expect', 'forecast', 'predict', 'likely'];
  for (const keyword of forecastKeywords) {
    const idx = answer.toLowerCase().indexOf(keyword);
    if (idx !== -1) {
      return answer.substring(idx, idx + 150).split('.')[0] + '.';
    }
  }
  return 'Market conditions suggest stable prices in near term.';
}

/**
 * Analytics Agent - Generate final recommendation
 */
async function generateFinalRecommendation(params, agentOutputs) {
  const { cropType, location, quantity, quality, storageCapacity, financialUrgency } = params;

  console.log('\n[🤖 Analytics Agent] Generating final recommendation...');

  // Build context from all agents
  const priceContext = agentOutputs.priceData ? `
PRICE DATA:
- Mandis analyzed: ${agentOutputs.priceData.total_mandis_fetched}
- Average modal price: ₹${agentOutputs.priceData.price_analysis?.regional_comparison?.regional_average_modal}/qtl
- Best market: ${agentOutputs.priceData.insights?.best_market_to_sell}
- Top mandi prices: ${agentOutputs.priceData.mandi_prices?.slice(0, 3).map(m => `${m.mandi_name}: ₹${m.modal_price}`).join(', ')}
` : 'Price data not available.';

  const newsContext = agentOutputs.newsAnalysis ? `
NEWS ANALYSIS:
- Market sentiment: ${agentOutputs.newsAnalysis.overall_sentiment}
- Key takeaway: ${agentOutputs.newsAnalysis.key_takeaway}
- Recent headlines: ${agentOutputs.newsAnalysis.news_items?.slice(0, 2).map(n => n.headline).join('; ')}
` : 'News data not available.';

  const weatherContext = agentOutputs.weatherAnalysis ? `
WEATHER ANALYSIS:
- Current: ${agentOutputs.weatherAnalysis.current_conditions?.conditions_summary}
- Temperature: ${agentOutputs.weatherAnalysis.current_conditions?.temperature}
- Price pressure: ${agentOutputs.weatherAnalysis.price_pressure}
- Risk level: ${agentOutputs.weatherAnalysis.risk_level}
` : 'Weather data not available.';

  const searchContext = agentOutputs.searchInsights ? `
MARKET INTELLIGENCE:
- Market sentiment: ${agentOutputs.searchInsights.market_sentiment}
- Demand: ${agentOutputs.searchInsights.demand_signals}
- Forecast: ${agentOutputs.searchInsights.expert_forecasts}
` : 'Market intelligence not available.';

  const prompt = `You are an expert agricultural economist and advisor for Indian farmers.

FARMER'S SITUATION:
- Crop: ${cropType}
- Location: ${location}
- Quantity to sell: ${quantity} quintals
- Quality grade: ${quality}
- Storage capacity: ${storageCapacity} quintals
- Financial urgency: ${financialUrgency}

${priceContext}
${newsContext}
${weatherContext}
${searchContext}

Based on ALL the above data, provide a comprehensive recommendation in this EXACT JSON format:

{
  "crop": "${cropType}",
  "location": "${location}",
  "market_summary": {
    "current_modal_price": <number - best modal price from mandi data>,
    "mandi_name": "<best mandi name>",
    "city": "<city name>",
    "price_trend": "rising/stable/falling"
  },
  "recommendation": {
    "action": "SELL NOW / WAIT AND MONITOR / GRADUAL SELLING",
    "target_price": "₹X,XXX/qtl",
    "timing": "<when to act - specific timeframe>",
    "reasoning": "<2-3 sentence explanation of why this action>",
    "confidence": "high/medium/low"
  },
  "key_factors": [
    {
      "factor": "<factor name>",
      "impact": "positive/negative/neutral",
      "weight": "high/medium/low",
      "explanation": "<brief explanation>"
    }
  ],
  "scenarios": {
    "optimistic": {
      "probability": "X%",
      "potential_price": "₹X,XXX/qtl",
      "conditions": "<what needs to happen>"
    },
    "expected": {
      "probability": "X%",
      "potential_price": "₹X,XXX/qtl",
      "conditions": "<most likely scenario>"
    },
    "pessimistic": {
      "probability": "X%",
      "potential_price": "₹X,XXX/qtl",
      "conditions": "<downside risk>"
    }
  },
  "action_plan": {
    "immediate_steps": "<what to do right now>",
    "monitoring": "<what to watch for>",
    "triggers": "<when to change strategy>"
  },
  "risk_factors": [
    "<risk 1>",
    "<risk 2>",
    "<risk 3>"
  ],
  "farmer_friendly_summary": "<A simple 2-3 sentence summary in plain language that any farmer can understand. Be specific about what to do and when.>"
}

IMPORTANT:
- Use realistic prices based on the mandi data provided
- Consider financial urgency (${financialUrgency}) when recommending timing
- Account for storage capacity (${storageCapacity}qtl) vs quantity (${quantity}qtl)
- Quality grade (${quality}) affects price - A grade gets premium
- Return ONLY valid JSON, no other text`;

  try {
    const response = await mistral.invoke(prompt);
    
    // Parse JSON from response
    let recommendation;
    try {
      const jsonMatch = response.content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        recommendation = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error('No JSON found in response');
      }
    } catch (parseError) {
      console.error('JSON parse error, using default structure');
      recommendation = getDefaultRecommendation(params, agentOutputs);
    }

    console.log('[🤖 Analytics Agent] ✅ Recommendation generated');
    
    return recommendation;

  } catch (error) {
    console.error('[🤖 Analytics Agent] ❌ Error:', error.message);
    return getDefaultRecommendation(params, agentOutputs);
  }
}

/**
 * Default recommendation if AI fails
 */
function getDefaultRecommendation(params, agentOutputs) {
  const { cropType, location, quantity, quality, financialUrgency } = params;
  const avgPrice = agentOutputs.priceData?.price_analysis?.regional_comparison?.regional_average_modal || 2000;
  
  let action = 'WAIT AND MONITOR';
  if (financialUrgency === 'high') action = 'SELL NOW';
  if (financialUrgency === 'low') action = 'GRADUAL SELLING';

  return {
    crop: cropType,
    location: location,
    market_summary: {
      current_modal_price: avgPrice,
      mandi_name: agentOutputs.priceData?.insights?.best_market_to_sell || 'Local Mandi',
      city: location,
      price_trend: 'stable'
    },
    recommendation: {
      action: action,
      target_price: `₹${Math.round(avgPrice * 1.05)}/qtl`,
      timing: financialUrgency === 'high' ? 'Within this week' : 'Next 2-4 weeks',
      reasoning: `Based on current market conditions and your ${financialUrgency} financial urgency, this strategy balances immediate needs with market potential.`,
      confidence: 'medium'
    },
    key_factors: [
      { factor: 'Current Price', impact: 'neutral', weight: 'high', explanation: 'Prices are at normal levels' },
      { factor: 'Financial Urgency', impact: financialUrgency === 'high' ? 'negative' : 'positive', weight: 'high', explanation: `Your ${financialUrgency} urgency affects timing` },
      { factor: 'Quality', impact: quality === 'A' ? 'positive' : 'neutral', weight: 'medium', explanation: `${quality} grade quality` }
    ],
    scenarios: {
      optimistic: { probability: '25%', potential_price: `₹${Math.round(avgPrice * 1.15)}/qtl`, conditions: 'Strong demand increase' },
      expected: { probability: '50%', potential_price: `₹${avgPrice}/qtl`, conditions: 'Current conditions continue' },
      pessimistic: { probability: '25%', potential_price: `₹${Math.round(avgPrice * 0.9)}/qtl`, conditions: 'Supply glut or demand drop' }
    },
    action_plan: {
      immediate_steps: 'Check local mandi rates and prepare stock for transport',
      monitoring: 'Track daily prices and government announcements',
      triggers: 'Sell if price exceeds target or financial situation demands'
    },
    risk_factors: ['Price volatility', 'Weather changes', 'Policy changes'],
    farmer_friendly_summary: `For your ${quantity} quintals of ${quality}-grade ${cropType}, current prices around ₹${avgPrice}/qtl are reasonable. ${financialUrgency === 'high' ? 'Given your urgent need, consider selling soon at the nearest mandi.' : 'You can wait for better prices while monitoring the market.'}`
  };
}

/**
 * Main orchestration function
 */
async function analyzeMarket(params) {
  const startTime = Date.now();

  try {
    // Step 1: Run all agents
    const agentOutputs = await runAllAgents(params);

    // Step 2: Generate final recommendation using Analytics Agent
    const recommendation = await generateFinalRecommendation(params, agentOutputs);

    const processingTime = ((Date.now() - startTime) / 1000).toFixed(2);

    console.log('\n' + '═'.repeat(60));
    console.log(`✅ ANALYSIS COMPLETE in ${processingTime}s`);
    console.log(`📋 Recommendation: ${recommendation.recommendation?.action}`);
    console.log('═'.repeat(60) + '\n');

    return {
      success: true,
      data: {
        recommendation: recommendation,
        agentOutputs: agentOutputs
      },
      metadata: {
        processingTime: `${processingTime}s`,
        timestamp: new Date().toISOString(),
        agentsRun: ['price', 'news', 'weather', 'search', 'analytics'],
        errorsCount: agentOutputs.errors?.length || 0
      }
    };

  } catch (error) {
    console.error('Master Orchestrator Error:', error);
    return {
      success: false,
      error: error.message,
      data: null
    };
  }
}

module.exports = { analyzeMarket, runAllAgents, generateFinalRecommendation };
