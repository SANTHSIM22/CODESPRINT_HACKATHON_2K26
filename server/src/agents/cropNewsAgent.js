const { StateGraph, Annotation } = require("@langchain/langgraph");
const { ChatMistralAI } = require("@langchain/mistralai");
const axios = require("axios");

// Initialize Mistral AI
const llm = new ChatMistralAI({
  model: "mistral-small-latest",
  apiKey: process.env.MISTRAL_API_KEY,
  temperature: 0.3,
  timeout: 15000, // 15 second timeout for LLM
});

// State definition using Annotation (new LangGraph API)
const GraphState = Annotation.Root({
  query: Annotation({
    reducer: (_, y) => y,
    default: () => null,
  }),
  newsData: Annotation({
    reducer: (_, y) => y,
    default: () => null,
  }),
  analysis: Annotation({
    reducer: (_, y) => y,
    default: () => null,
  }),
  finalReport: Annotation({
    reducer: (_, y) => y,
    default: () => null,
  }),
});

// Node: Fetch crop economy news from NewsAPI
async function fetchNews(state) {
  try {
    // Check if NEWS_API_KEY is configured
    if (!process.env.NEWS_API_KEY) {
      console.log("NEWS_API_KEY not configured, using mock data");
      return { ...state, newsData: getMockNews() };
    }

    const keywords = "crop prices OR agriculture economy OR farming market OR commodity prices India";
    const response = await axios.get("https://newsapi.org/v2/everything", {
      params: {
        q: keywords,
        language: "en",
        sortBy: "publishedAt",
        pageSize: 10,
        apiKey: process.env.NEWS_API_KEY,
      },
      timeout: 10000, // 10 second timeout for news API
    });
    
    const articles = response.data.articles?.slice(0, 8) || [];
    return { ...state, newsData: articles };
  } catch (error) {
    console.error("News fetch error:", error.message);
    // Return mock data if API fails or times out
    return { 
      ...state, 
      newsData: getMockNews() 
    };
  }
}

// Node: Analyze news with LLM
async function analyzeNews(state) {
  const { newsData } = state;
  
  if (!newsData || newsData.length === 0) {
    return { ...state, analysis: "No news data available for analysis." };
  }

  const newsContext = newsData.map((article, i) => 
    `${i + 1}. ${article.title}\n   Source: ${article.source?.name || 'Unknown'}\n   Summary: ${article.description || 'No description'}`
  ).join("\n\n");

  try {
    const response = await llm.invoke(`
You are an agricultural economy analyst. Analyze these recent news articles about crop prices and agricultural economy.

NEWS ARTICLES:
${newsContext}

IMPORTANT: Return ONLY plain text, NO markdown formatting (no #, **, -, or bullet points).

Write 3 short paragraphs:
Paragraph 1 - Key Trends: What is affecting crop prices right now.
Paragraph 2 - Farmer Impact: How this affects farmer incomes and costs.
Paragraph 3 - Action Items: 2-3 practical tips for farmers.

Keep each paragraph to 2-3 sentences. Use simple language.
    `);
    
    return { ...state, analysis: response.content };
  } catch (error) {
    console.error("Analysis error:", error.message);
    return { 
      ...state, 
      analysis: "Analysis: Agricultural markets showing mixed trends. Monitor local mandi prices for best selling opportunities." 
    };
  }
}

// Node: Generate final report
async function generateReport(state) {
  const { newsData, analysis } = state;
  
  const report = {
    timestamp: new Date().toISOString(),
    totalArticles: newsData?.length || 0,
    analysis: analysis,
    articles: newsData?.map(article => ({
      title: article.title,
      source: article.source?.name || "Unknown",
      description: article.description,
      url: article.url,
      publishedAt: article.publishedAt,
      imageUrl: article.urlToImage,
    })) || [],
  };
  
  return { ...state, finalReport: report };
}

// Mock news data fallback
function getMockNews() {
  return [
    {
      title: "Wheat Prices Surge Amid Global Supply Concerns",
      source: { name: "Economic Times" },
      description: "Global wheat prices have increased by 15% due to supply chain disruptions affecting major exporting countries.",
      url: "#",
      publishedAt: new Date().toISOString(),
      urlToImage: null,
    },
    {
      title: "Government Announces MSP Hike for Kharif Crops",
      source: { name: "Business Standard" },
      description: "The central government has approved a 5-7% increase in minimum support prices for major kharif crops including paddy and cotton.",
      url: "#",
      publishedAt: new Date().toISOString(),
      urlToImage: null,
    },
    {
      title: "Onion Prices Drop as New Harvest Reaches Markets",
      source: { name: "India Today" },
      description: "Fresh arrivals of rabi onions have led to a 30% price drop in wholesale markets across Maharashtra and Karnataka.",
      url: "#",
      publishedAt: new Date().toISOString(),
      urlToImage: null,
    },
    {
      title: "Climate Change Impact on Indian Agriculture Sector",
      source: { name: "Hindustan Times" },
      description: "New study reveals shifting monsoon patterns could affect crop yields by up to 20% in the coming decade.",
      url: "#",
      publishedAt: new Date().toISOString(),
      urlToImage: null,
    },
    {
      title: "Pulses Export Ban Extended to Stabilize Domestic Prices",
      source: { name: "Mint" },
      description: "Government extends export restrictions on major pulses to ensure domestic availability and price stability.",
      url: "#",
      publishedAt: new Date().toISOString(),
      urlToImage: null,
    },
  ];
}

// Build the LangGraph workflow
function createCropNewsGraph() {
  const workflow = new StateGraph(GraphState);

  // Add nodes
  workflow.addNode("fetch_news", fetchNews);
  workflow.addNode("analyze_news", analyzeNews);
  workflow.addNode("generate_report", generateReport);

  // Define edges
  workflow.addEdge("__start__", "fetch_news");
  workflow.addEdge("fetch_news", "analyze_news");
  workflow.addEdge("analyze_news", "generate_report");
  workflow.addEdge("generate_report", "__end__");

  return workflow.compile();
}

// Main function to run the agent
async function getCropEconomyNews() {
  const graph = createCropNewsGraph();
  const result = await graph.invoke({ query: "crop economy news" });
  return result.finalReport;
}

module.exports = { getCropEconomyNews };
