const { MistralService } = require('../services/mistralService');
const { parseLLMJson } = require('../utils/jsonParser');

/**
 * Weather Agent - Fetch and analyze weather data for crop-growing regions
 */

// Simulated weather data based on typical conditions for Indian states
function getSimulatedWeather(location) {
  const locationLower = location.toLowerCase();
  
  // Seasonal data (January - winter/rabi season)
  const weatherByRegion = {
    punjab: { temperature: 12, humidity: 65, rainfall: 15, condition: 'Cool and Clear' },
    haryana: { temperature: 14, humidity: 60, rainfall: 10, condition: 'Clear' },
    'uttar pradesh': { temperature: 16, humidity: 70, rainfall: 12, condition: 'Partly Cloudy' },
    maharashtra: { temperature: 26, humidity: 55, rainfall: 5, condition: 'Sunny' },
    'madhya pradesh': { temperature: 20, humidity: 50, rainfall: 8, condition: 'Clear' },
    karnataka: { temperature: 24, humidity: 60, rainfall: 10, condition: 'Partly Cloudy' },
    'tamil nadu': { temperature: 28, humidity: 75, rainfall: 20, condition: 'Humid' },
    'andhra pradesh': { temperature: 27, humidity: 65, rainfall: 15, condition: 'Clear' },
    telangana: { temperature: 25, humidity: 55, rainfall: 8, condition: 'Clear' },
    gujarat: { temperature: 22, humidity: 45, rainfall: 2, condition: 'Dry and Clear' },
    rajasthan: { temperature: 18, humidity: 35, rainfall: 0, condition: 'Dry' },
    'west bengal': { temperature: 20, humidity: 75, rainfall: 10, condition: 'Humid' },
    bihar: { temperature: 18, humidity: 70, rainfall: 8, condition: 'Cool' },
    odisha: { temperature: 24, humidity: 70, rainfall: 12, condition: 'Humid' },
    kerala: { temperature: 29, humidity: 80, rainfall: 25, condition: 'Humid and Rainy' },
    assam: { temperature: 18, humidity: 80, rainfall: 15, condition: 'Cool and Humid' },
    chhattisgarh: { temperature: 22, humidity: 55, rainfall: 5, condition: 'Clear' },
    jharkhand: { temperature: 19, humidity: 60, rainfall: 8, condition: 'Cool' }
  };

  // Find matching region
  for (const [region, data] of Object.entries(weatherByRegion)) {
    if (locationLower.includes(region)) {
      return data;
    }
  }

  // Default weather data
  return { temperature: 22, humidity: 60, rainfall: 10, condition: 'Moderate' };
}

async function weatherAnalysisAgent(state) {
  const mistral = new MistralService();
  const { cropType, location } = state;

  // Get simulated weather data
  const weather = getSimulatedWeather(location);

  const prompt = `You are an expert agricultural advisor. Analyze the weather impact on ${cropType} farming in ${location}.

CURRENT WEATHER CONDITIONS:
- Temperature: ${weather.temperature}°C
- Humidity: ${weather.humidity}%
- Recent Rainfall: ${weather.rainfall}mm
- Conditions: ${weather.condition}

Provide a detailed analysis in the following JSON format ONLY (no other text before or after):
{
  "analysis": "A 3-4 paragraph detailed analysis of how current weather affects ${cropType} cultivation. Include: 1) Current growing conditions assessment, 2) Impact on crop growth stage, 3) Potential risks or benefits, 4) Comparison with ideal conditions for ${cropType}.",
  "recommendations": [
    "First specific actionable recommendation for the farmer",
    "Second specific recommendation based on weather",
    "Third recommendation for crop management",
    "Fourth recommendation for timing decisions"
  ],
  "risk_level": "low/medium/high",
  "optimal_actions": "Summary of what farmer should do immediately"
}

Focus on practical, actionable advice specific to ${cropType} in ${location} given the current weather conditions.
Return ONLY valid JSON.`;

  try {
    const response = await mistral.generate(prompt, {
      temperature: 0.4,
      max_tokens: 1500
    });

    const analysisData = parseLLMJson(response);

    return {
      ...state,
      weatherData: {
        crop: cropType,
        location: location,
        weather: {
          temperature: weather.temperature,
          humidity: weather.humidity,
          rainfall: weather.rainfall,
          condition: weather.condition
        },
        analysis: analysisData.analysis || `Weather analysis for ${cropType} in ${location}: Current conditions are ${weather.condition} with temperature at ${weather.temperature}°C and humidity at ${weather.humidity}%. These conditions ${weather.temperature > 30 ? 'may cause heat stress' : weather.temperature < 10 ? 'may slow growth' : 'are generally favorable'} for crop development.`,
        recommendations: analysisData.recommendations || [
          `Monitor ${cropType} closely given current ${weather.condition.toLowerCase()} conditions`,
          `Adjust irrigation based on ${weather.humidity}% humidity levels`,
          `Plan field activities around the weather forecast`,
          `Ensure proper drainage if rainfall increases`
        ],
        riskLevel: analysisData.risk_level || 'medium',
        optimalActions: analysisData.optimal_actions || 'Continue regular farming practices with weather monitoring',
        timestamp: new Date().toISOString()
      }
    };
  } catch (error) {
    console.error('Weather Agent Error:', error.message);
    
    // Return meaningful default data even on error
    return {
      ...state,
      weatherData: {
        crop: cropType,
        location: location,
        weather: {
          temperature: weather.temperature,
          humidity: weather.humidity,
          rainfall: weather.rainfall,
          condition: weather.condition
        },
        analysis: `Current weather in ${location}: Temperature is ${weather.temperature}°C with ${weather.humidity}% humidity and ${weather.rainfall}mm rainfall. Conditions are ${weather.condition.toLowerCase()}. For ${cropType} cultivation, these conditions require standard farming practices with regular monitoring. Ensure adequate irrigation management based on humidity levels and plan field activities according to weather patterns.`,
        recommendations: [
          `Monitor ${cropType} crop health regularly`,
          `Maintain proper irrigation schedule based on ${weather.humidity}% humidity`,
          `Watch for pest and disease outbreaks common in ${weather.condition.toLowerCase()} weather`,
          `Plan harvesting and storage activities considering current conditions`
        ],
        riskLevel: 'medium',
        optimalActions: 'Continue standard farming practices with enhanced monitoring',
        timestamp: new Date().toISOString()
      },
      errors: [...(state.errors || []), { agent: "weatherAnalysis", error: error.message }]
    };
  }
}

/**
 * Standalone function to get weather analysis
 */
async function getWeatherAnalysis(cropType, location) {
  const result = await weatherAnalysisAgent({ cropType, location });
  return result.weatherData;
}

module.exports = { weatherAnalysisAgent, getWeatherAnalysis };
