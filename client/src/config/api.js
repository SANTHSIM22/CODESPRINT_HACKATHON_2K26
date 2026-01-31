import axios from 'axios';

// API Base URL from environment variables
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Create axios instance with default config
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    // Check for store token first, then regular token
    const storeToken = localStorage.getItem('storeToken');
    const userToken = localStorage.getItem('token');
    
    // Use store token for store routes, otherwise use user token
    if (config.url?.includes('/store') && storeToken) {
      config.headers.Authorization = `Bearer ${storeToken}`;
    } else if (userToken) {
      config.headers.Authorization = `Bearer ${userToken}`;
    }

    // Increase timeout for AI agent endpoints (they involve LLM processing)
    if (config.url?.includes('/agents') || config.url?.includes('/analyze')) {
      config.timeout = 60000; // 60 seconds for AI endpoints
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Handle 401 Unauthorized
    if (error.response?.status === 401) {
      // Clear auth data and redirect to login
      const isStoreRoute = window.location.pathname.includes('/store');
      if (isStoreRoute) {
        localStorage.removeItem('storeToken');
        localStorage.removeItem('store');
        window.location.href = '/store/login';
      } else {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

// API endpoints
export const API_ENDPOINTS = {
  // Auth
  AUTH: {
    LOGIN: '/auth/login',
    SIGNUP: '/auth/signup',
  },
  
  // Admin
  ADMIN: {
    LOGIN: '/admin/login',
    DASHBOARD: '/admin/dashboard',
    USERS: '/admin/users',
    PRODUCTS: '/admin/products',
    ORDERS: '/admin/orders',
    ORDER_STATUS: (orderId) => `/admin/orders/${orderId}/status`,
    DELETE_USER: (userId) => `/admin/users/${userId}`,
    DELETE_PRODUCT: (productId) => `/admin/products/${productId}`,
    UPDATE_PRODUCT: (productId) => `/admin/products/${productId}`,
  },
  
  // Farmer
  FARMER: {
    DASHBOARD: '/farmer/dashboard',
    PRODUCTS: '/farmer/products',
    PRODUCT: (productId) => `/farmer/products/${productId}`,
    DELIVER_ORDER: (orderId) => `/farmer/orders/${orderId}/deliver`,
  },
  
  // Buyer
  BUYER: {
    DASHBOARD: '/buyer/dashboard',
    PRODUCTS: '/buyer/products',
    NEARBY_STORES: '/buyer/nearby-stores',
    STORE_PRODUCTS: (storeId) => `/buyer/store/${storeId}/products`,
  },
  
  // Store
  STORE: {
    LOGIN: '/store/login',
    SIGNUP: '/store/signup',
    INVENTORY: '/store/inventory',
    INVENTORY_ITEM: (id) => `/store/inventory/${id}`,
    INVENTORY_SALE: (id) => `/store/inventory/${id}/sale`,
    FARMERS_PRODUCTS: '/store/farmers-products',
    DASHBOARD_STATS: '/store/dashboard-stats',
    PURCHASE: '/store/purchase',
    ORDERS: '/store/orders',
    ORDER_STATUS: (orderId) => `/store/orders/${orderId}/status`,
  },
  
  // Orders
  ORDERS: {
    CREATE: '/orders/create',
    FARMER: '/orders/farmer',
    BUYER: '/orders/buyer',
    STATUS: (orderId) => `/orders/${orderId}/status`,
    PAY: (orderId) => `/orders/${orderId}/pay`,
  },
  
  // Analytics
  ANALYTICS: {
    MANDI_STATES: '/analytics/mandi/states',
    MANDI_DISTRICTS: '/analytics/mandi/districts',
    MANDI_COMMODITIES: '/analytics/mandi/commodities',
    MANDI_PRICES: '/analytics/mandi/prices',
  },
  
  // Agents
  AGENTS: {
    PRICE_INSIGHTS: '/agents/price-insights',
    SEARCH: '/agents/search',
    WEATHER: '/agents/weather',
    CROP_NEWS: '/agents/crop-news',
  },
  
  // Analyze
  ANALYZE: '/analyze',
};

export { API_BASE_URL };
export default api;
