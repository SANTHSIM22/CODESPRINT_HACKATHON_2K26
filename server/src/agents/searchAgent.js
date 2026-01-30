const { ChatMistralAI } = require("@langchain/mistralai");

/**
 * AI Crop Price Assistant
 * Uses Mistral AI to answer farmer queries with well-formatted responses
 */

const mistral = new ChatMistralAI({
  model: "mistral-small-latest",
  apiKey: process.env.MISTRAL_API_KEY,
  temperature: 0.3,
});

/**
 * Format the AI response for proper display
 */
function formatResponse(content) {
  // Ensure proper line breaks for display
  let formatted = content
    .replace(/- \*\*/g, '\n- **')
    .replace(/\*\*Factors/g, '\n**Factors')
    .replace(/\*\*Advice/g, '\n**Advice')
    .replace(/\*Stay/g, '\n\n*Stay')
    .replace(/(\d)\. /g, '\n$1. ')
    .replace(/\n\n\n+/g, '\n\n')
    .trim();
  
  return formatted;
}

/**
 * Main function - Ask Mistral about crop prices
 */
async function searchCropInfo(query) {
  console.log(`\n🤖 AI Assistant: "${query}"`);
  
  try {
    const response = await mistral.invoke(`
You are an expert agricultural advisor for Indian farmers.

Question: "${query}"

Provide information in this structure:

TITLE: **[Crop] Prices in [Location] (Current Trends)**

PRICE RANGE: State the current market price range in ₹ per quintal

MSP: State the MSP (Minimum Support Price) for 2024-25 if applicable

FACTORS: List 4 key factors affecting the price

ADVICE: Give 4 practical tips for farmers

END: Add a note about checking local mandi rates

IMPORTANT FORMATTING RULES:
- Put each section on a new line
- Use ** for bold text
- Use - for bullet points  
- Use numbers (1. 2. 3. 4.) for advice
- Keep it clean and readable
- Use realistic Indian market prices
`);

    // Format the response for proper display
    const formattedAnswer = formatResponse(response.content);
    
    console.log(`✅ Done\n`);
    
    return {
      answer: formattedAnswer,
      searchResults: [],
      news: []
    };
    
  } catch (error) {
    console.error("Error:", error.message);
    return {
      answer: "Sorry, I couldn't process your question. Please try again.",
      searchResults: [],
      news: []
    };
  }
}

module.exports = { searchCropInfo };
