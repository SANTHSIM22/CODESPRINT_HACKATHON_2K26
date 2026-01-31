const { MistralService } = require('../services/mistralService');
const { parseLLMJson } = require('../utils/jsonParser');

/**
 * Weather Agent - Fetch and analyze weather data for crop-growing regions
 */

// Fallback coordinates for Indian states (using capital cities)
const INDIAN_STATE_COORDINATES = {
  'andhra pradesh': { lat: 16.5062, lon: 80.6480, city: 'Vijayawada' },
  'arunachal pradesh': { lat: 27.0844, lon: 93.6053, city: 'Itanagar' },
  'assam': { lat: 26.1445, lon: 91.7362, city: 'Dispur' },
  'bihar': { lat: 25.6093, lon: 85.1376, city: 'Patna' },
  'chhattisgarh': { lat: 21.2514, lon: 81.6296, city: 'Raipur' },
  'goa': { lat: 15.4909, lon: 73.8278, city: 'Panaji' },
  'gujarat': { lat: 23.2156, lon: 72.6369, city: 'Gandhinagar' },
  'haryana': { lat: 30.7333, lon: 76.7794, city: 'Chandigarh' },
  'himachal pradesh': { lat: 31.1048, lon: 77.1734, city: 'Shimla' },
  'jharkhand': { lat: 23.3441, lon: 85.3096, city: 'Ranchi' },
  'karnataka': { lat: 12.9716, lon: 77.5946, city: 'Bangalore' },
  'kerala': { lat: 8.5241, lon: 76.9366, city: 'Thiruvananthapuram' },
  'madhya pradesh': { lat: 23.2599, lon: 77.4126, city: 'Bhopal' },
  'maharashtra': { lat: 19.0760, lon: 72.8777, city: 'Mumbai' },
  'manipur': { lat: 24.8170, lon: 93.9368, city: 'Imphal' },
  'meghalaya': { lat: 25.5788, lon: 91.8933, city: 'Shillong' },
  'mizoram': { lat: 23.7271, lon: 92.7176, city: 'Aizawl' },
  'nagaland': { lat: 25.6751, lon: 94.1086, city: 'Kohima' },
  'odisha': { lat: 20.2961, lon: 85.8245, city: 'Bhubaneswar' },
  'punjab': { lat: 30.7333, lon: 76.7794, city: 'Chandigarh' },
  'rajasthan': { lat: 26.9124, lon: 75.7873, city: 'Jaipur' },
  'sikkim': { lat: 27.3389, lon: 88.6065, city: 'Gangtok' },
  'tamil nadu': { lat: 13.0827, lon: 80.2707, city: 'Chennai' },
  'telangana': { lat: 17.3850, lon: 78.4867, city: 'Hyderabad' },
  'tripura': { lat: 23.8315, lon: 91.2868, city: 'Agartala' },
  'uttar pradesh': { lat: 26.8467, lon: 80.9462, city: 'Lucknow' },
  'uttarakhand': { lat: 30.3165, lon: 78.0322, city: 'Dehradun' },
  'west bengal': { lat: 22.5726, lon: 88.3639, city: 'Kolkata' },
  // Union Territories
  'delhi': { lat: 28.6139, lon: 77.2090, city: 'New Delhi' },
  'jammu and kashmir': { lat: 34.0837, lon: 74.7973, city: 'Srinagar' },
  'ladakh': { lat: 34.1526, lon: 77.5771, city: 'Leh' },
  'puducherry': { lat: 11.9416, lon: 79.8083, city: 'Puducherry' },
  'chandigarh': { lat: 30.7333, lon: 76.7794, city: 'Chandigarh' }
};

// Weather code to condition mapping for Open-Meteo API
const WEATHER_CODE_MAP = {
  0: 'Clear',
  1: 'Mainly Clear',
  2: 'Partly Cloudy',
  3: 'Overcast',
  45: 'Foggy',
  48: 'Foggy',
  51: 'Light Drizzle',
  53: 'Moderate Drizzle',
  55: 'Dense Drizzle',
  56: 'Light Freezing Drizzle',
  57: 'Dense Freezing Drizzle',
  61: 'Slight Rain',
  63: 'Moderate Rain',
  65: 'Heavy Rain',
  66: 'Light Freezing Rain',
  67: 'Heavy Freezing Rain',
  71: 'Slight Snow',
  73: 'Moderate Snow',
  75: 'Heavy Snow',
  77: 'Snow Grains',
  80: 'Slight Rain Showers',
  81: 'Moderate Rain Showers',
  82: 'Violent Rain Showers',
  85: 'Slight Snow Showers',
  86: 'Heavy Snow Showers',
  95: 'Thunderstorm',
  96: 'Thunderstorm with Slight Hail',
  99: 'Thunderstorm with Heavy Hail'
};

/**
 * WeatherService class for fetching real-time weather data from Open-Meteo API
 */
class WeatherService {
  constructor() {
    this.geocodeBaseUrl = 'https://geocoding-api.open-meteo.com/v1/search';
    this.weatherBaseUrl = 'https://api.open-meteo.com/v1/forecast';
  }

  /**
   * Find fallback coordinates for a location by matching against known Indian states
   */
  getFallbackCoordinates(location) {
    const locationLower = location.toLowerCase();
    
    // Direct match with state names
    for (const [state, coords] of Object.entries(INDIAN_STATE_COORDINATES)) {
      if (locationLower.includes(state) || state.includes(locationLower)) {
        return coords;
      }
    }
    
    // Check for common city names and map to states
    const cityToState = {
      'bangalore': 'karnataka',
      'bengaluru': 'karnataka',
      'mumbai': 'maharashtra',
      'pune': 'maharashtra',
      'chennai': 'tamil nadu',
      'hyderabad': 'telangana',
      'kolkata': 'west bengal',
      'lucknow': 'uttar pradesh',
      'jaipur': 'rajasthan',
      'ahmedabad': 'gujarat',
      'bhopal': 'madhya pradesh',
      'patna': 'bihar',
      'chandigarh': 'punjab',
      'bhubaneswar': 'odisha',
      'ranchi': 'jharkhand',
      'raipur': 'chhattisgarh',
      'thiruvananthapuram': 'kerala',
      'kochi': 'kerala',
      'coimbatore': 'tamil nadu',
      'nagpur': 'maharashtra',
      'indore': 'madhya pradesh',
      'visakhapatnam': 'andhra pradesh',
      'varanasi': 'uttar pradesh',
      'agra': 'uttar pradesh',
      'amritsar': 'punjab',
      'ludhiana': 'punjab',
      'guwahati': 'assam',
      'shimla': 'himachal pradesh',
      'dehradun': 'uttarakhand'
    };
    
    for (const [city, state] of Object.entries(cityToState)) {
      if (locationLower.includes(city)) {
        return INDIAN_STATE_COORDINATES[state];
      }
    }
    
    // Default to Delhi if no match found
    return INDIAN_STATE_COORDINATES['delhi'];
  }

  /**
   * Geocode a location name to get coordinates
   */
  async geocodeLocation(location) {
    try {
      // Append ", India" to improve geocoding results for Indian locations
      const searchQuery = `${location}, India`;
      const url = `${this.geocodeBaseUrl}?name=${encodeURIComponent(searchQuery)}&count=5&language=en&format=json`;
      
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`Geocoding API error: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data.results && data.results.length > 0) {
        // Filter for Indian results only
        const indianResult = data.results.find(
          result => result.country_code === 'IN' || result.country === 'India'
        );
        
        if (indianResult) {
          return {
            lat: indianResult.latitude,
            lon: indianResult.longitude,
            city: indianResult.name,
            state: indianResult.admin1 || location
          };
        }
      }
      
      // If no Indian result found, use fallback coordinates
      console.log(`Geocoding: No Indian result for "${location}", using fallback coordinates`);
      return this.getFallbackCoordinates(location);
      
    } catch (error) {
      console.error(`Geocoding error for "${location}":`, error.message);
      return this.getFallbackCoordinates(location);
    }
  }

  /**
   * Fetch current weather data using coordinates
   */
  async fetchWeatherData(lat, lon) {
    const url = `${this.weatherBaseUrl}?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,precipitation,weather_code&timezone=Asia/Kolkata`;
    
    console.log(`[WeatherService] Fetching weather data from: ${url}`);
    
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Weather API error: ${response.status}`);
    }
    
    const data = await response.json();
    console.log(`[WeatherService] Raw API response:`, JSON.stringify(data.current, null, 2));
    
    if (!data.current) {
      throw new Error('No current weather data available');
    }
    
    const current = data.current;
    const weatherCode = current.weather_code || 0;
    
    const weatherResult = {
      temperature: Math.round(current.temperature_2m),
      humidity: Math.round(current.relative_humidity_2m),
      rainfall: Math.round(current.precipitation || 0),
      condition: WEATHER_CODE_MAP[weatherCode] || 'Unknown'
    };
    
    console.log(`[WeatherService] Parsed weather data:`, weatherResult);
    
    return weatherResult;
  }

  /**
   * Get weather data for a location
   */
  async getWeather(location) {
    console.log(`[WeatherService] Getting weather for location: "${location}"`);
    
    // First, geocode the location
    const coordinates = await this.geocodeLocation(location);
    console.log(`[WeatherService] Resolved coordinates:`, coordinates);
    
    // Then fetch weather data
    const weather = await this.fetchWeatherData(coordinates.lat, coordinates.lon);
    
    return {
      ...weather,
      coordinates: {
        lat: coordinates.lat,
        lon: coordinates.lon
      },
      resolvedLocation: coordinates.city || location
    };
  }
}

// Simulated weather data based on typical conditions for Indian states (fallback)
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

// Language configuration for multilingual support
const languageConfig = {
  en: {
    name: 'English',
    instruction: 'Respond in English.'
  },
  hi: {
    name: 'Hindi',
    instruction: 'कृपया हिंदी में जवाब दें। सभी विश्लेषण और सिफारिशें हिंदी में लिखें।'
  },
  ta: {
    name: 'Tamil',
    instruction: 'தயவுசெய்து தமிழில் பதிலளிக்கவும். அனைத்து பகுப்பாய்வுகளும் பரிந்துரைகளும் தமிழில் இருக்க வேண்டும்।'
  },
  pa: {
    name: 'Punjabi',
    instruction: 'ਕਿਰਪਾ ਕਰਕੇ ਪੰਜਾਬੀ ਵਿੱਚ ਜਵਾਬ ਦਿਓ।'
  },
  mr: {
    name: 'Marathi',
    instruction: 'कृपया मराठीत उत्तर द्या।'
  }
};

async function weatherAnalysisAgent(state) {
  const mistral = new MistralService();
  const weatherService = new WeatherService();
  const { cropType, location, language = 'en' } = state;

  // Try to get real-time weather data, fall back to simulated data if API fails
  let weather;
  let isRealTimeData = false;
  
  try {
    weather = await weatherService.getWeather(location);
    isRealTimeData = true;
    console.log(`Weather Agent: Fetched real-time data for ${weather.resolvedLocation || location}`);
  } catch (apiError) {
    console.warn(`Weather Agent: API failed for "${location}", using simulated data:`, apiError.message);
    weather = getSimulatedWeather(location);
  }

  // Get language instruction
  const langConfig = languageConfig[language] || languageConfig.en;
  const langInstruction = language !== 'en' ? `\n\nIMPORTANT: ${langConfig.instruction} Write all text content in ${langConfig.name}.` : '';

  const prompt = `You are an expert agricultural advisor. Analyze the weather impact on ${cropType} farming in ${location}.${langInstruction}

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
Return ONLY valid JSON.${language !== 'en' ? ` All text values in the JSON must be in ${langConfig.name}.` : ''}`;

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
        resolvedLocation: weather.resolvedLocation || location,
        isRealTimeData: isRealTimeData,
        weather: {
          temperature: weather.temperature,
          humidity: weather.humidity,
          rainfall: weather.rainfall,
          condition: weather.condition,
          coordinates: weather.coordinates || null
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
        resolvedLocation: weather.resolvedLocation || location,
        isRealTimeData: isRealTimeData,
        weather: {
          temperature: weather.temperature,
          humidity: weather.humidity,
          rainfall: weather.rainfall,
          condition: weather.condition,
          coordinates: weather.coordinates || null
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
async function getWeatherAnalysis(cropType, location, language = 'en') {
  const result = await weatherAnalysisAgent({ cropType, location, language });
  return result.weatherData;
}

module.exports = { weatherAnalysisAgent, getWeatherAnalysis };
