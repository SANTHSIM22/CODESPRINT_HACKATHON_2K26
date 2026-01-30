/**
 * Safely parse JSON from LLM response
 * Handles common LLM output issues like markdown code blocks, extra text, etc.
 */
function parseLLMJson(response) {
  if (!response) {
    throw new Error("Empty response from LLM");
  }

  // If already an object, return it
  if (typeof response === "object") {
    return response;
  }

  let jsonString = response;

  // Remove markdown code blocks
  jsonString = jsonString.replace(/```json\n?/gi, "");
  jsonString = jsonString.replace(/```\n?/gi, "");

  // Try to extract JSON object
  const jsonMatch = jsonString.match(/\{[\s\S]*\}/);
  if (jsonMatch) {
    jsonString = jsonMatch[0];
  }

  // Clean up common issues
  jsonString = jsonString
    .replace(/[\x00-\x1F\x7F]/g, "") // Remove control characters
    .replace(/,\s*}/g, "}") // Remove trailing commas
    .replace(/,\s*]/g, "]") // Remove trailing commas in arrays
    .trim();

  try {
    return JSON.parse(jsonString);
  } catch (error) {
    console.error("JSON Parse Error:", error.message);
    console.error("Attempted to parse:", jsonString.substring(0, 200));
    throw new Error(`Failed to parse LLM JSON response: ${error.message}`);
  }
}

/**
 * Validate that required fields exist in parsed JSON
 */
function validateJsonFields(data, requiredFields) {
  const missing = requiredFields.filter((field) => !(field in data));
  if (missing.length > 0) {
    throw new Error(`Missing required fields: ${missing.join(", ")}`);
  }
  return true;
}

module.exports = { parseLLMJson, validateJsonFields };
