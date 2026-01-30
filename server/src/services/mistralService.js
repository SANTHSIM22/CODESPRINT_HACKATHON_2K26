const { ChatMistralAI } = require("@langchain/mistralai");

/**
 * Mistral AI Service - Centralized LLM service for all agents
 */
class MistralService {
  constructor() {
    this.model = new ChatMistralAI({
      model: "mistral-small-latest",
      apiKey: process.env.MISTRAL_API_KEY,
      temperature: 0.3,
    });
  }

  /**
   * Generate response from Mistral AI
   * @param {string} prompt - The prompt to send
   * @param {Object} options - Generation options
   * @returns {Promise<string>} - Generated response
   */
  async generate(prompt, options = {}) {
    try {
      const response = await this.model.invoke(prompt, {
        temperature: options.temperature || 0.3,
        maxTokens: options.max_tokens || 1500,
      });
      return response.content;
    } catch (error) {
      console.error("Mistral Service Error:", error.message);
      throw error;
    }
  }

  /**
   * Generate JSON response from Mistral AI
   * @param {string} prompt - The prompt to send
   * @param {Object} options - Generation options
   * @returns {Promise<Object>} - Parsed JSON response
   */
  async generateJSON(prompt, options = {}) {
    const response = await this.generate(prompt, options);
    try {
      // Extract JSON from response
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
      throw new Error("No JSON found in response");
    } catch (error) {
      console.error("JSON Parse Error:", error.message);
      throw error;
    }
  }
}

module.exports = { MistralService };
