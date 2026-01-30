/**
 * Prompts for various analysis agents
 */

const weatherAnalysis = (cropType, location) => `
You are an agricultural weather analyst. Analyze weather conditions for farming decisions.

CROP: ${cropType}
LOCATION: ${location}

Provide weather analysis in the following JSON format ONLY (no other text):
{
  "location": "${location}",
  "current_conditions": {
    "temperature": "current temp in Celsius",
    "precipitation": "rainfall status",
    "humidity": "humidity percentage",
    "conditions_summary": "brief summary of current weather"
  },
  "forecast_7day": "summary of next 7 days weather outlook",
  "harvest_impact": "how weather affects harvest timing and crop quality",
  "regional_comparison": "weather comparison with other major growing regions",
  "price_pressure": "upward/downward/neutral - explain how weather affects prices",
  "recommendation": "actionable advice for the farmer based on weather"
}

Consider:
- Current season and typical weather patterns for the region
- Impact on crop growth, harvesting, and storage
- Weather events that could affect supply chain
- Comparison with competing regions

Return ONLY valid JSON, no additional text.
`;

const marketAnalysis = (cropType, location) => `
You are an agricultural market analyst. Analyze market conditions for ${cropType} in ${location}.

Provide market analysis in the following JSON format ONLY:
{
  "crop": "${cropType}",
  "location": "${location}",
  "current_price_range": "min - max price per quintal in INR",
  "price_trend": "increasing/decreasing/stable",
  "demand_status": "high/medium/low",
  "supply_status": "surplus/balanced/deficit",
  "market_sentiment": "bullish/bearish/neutral",
  "key_factors": ["factor1", "factor2", "factor3"],
  "price_forecast_30day": "expected price movement",
  "recommendation": "buy/sell/hold recommendation with reasoning"
}

Return ONLY valid JSON, no additional text.
`;

const demandSupplyAnalysis = (cropType, location) => `
You are an agricultural supply chain analyst. Analyze demand-supply dynamics for ${cropType}.

Location focus: ${location}

Provide analysis in the following JSON format ONLY:
{
  "crop": "${cropType}",
  "production_estimate": "estimated production in tonnes",
  "consumption_estimate": "estimated consumption/demand",
  "surplus_deficit": "surplus/balanced/deficit with quantity",
  "storage_status": "current storage and buffer stock levels",
  "import_export": "import/export trends affecting supply",
  "seasonal_factors": "seasonal demand patterns",
  "price_impact": "how supply-demand affects prices",
  "outlook": "short-term supply-demand outlook"
}

Return ONLY valid JSON, no additional text.
`;

const pricePrediction = (cropType, location, timeframe = "30 days") => `
You are an agricultural price forecasting expert. Predict prices for ${cropType} in ${location}.

Timeframe: ${timeframe}

Provide prediction in the following JSON format ONLY:
{
  "crop": "${cropType}",
  "location": "${location}",
  "current_price": "current average price in INR/quintal",
  "predicted_price": "predicted price after ${timeframe}",
  "confidence_level": "high/medium/low",
  "price_range": {
    "min": "minimum expected price",
    "max": "maximum expected price"
  },
  "key_drivers": ["driver1", "driver2", "driver3"],
  "risks": ["risk1", "risk2"],
  "best_selling_window": "recommended time period to sell",
  "recommendation": "actionable advice"
}

Return ONLY valid JSON, no additional text.
`;

module.exports = {
  weatherAnalysis,
  marketAnalysis,
  demandSupplyAnalysis,
  pricePrediction
};
