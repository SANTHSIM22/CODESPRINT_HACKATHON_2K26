import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { 
  Search, 
  BarChart3, 
  TrendingUp, 
  MapPin, 
  Clock, 
  Gem, 
  Lightbulb, 
  CheckCircle2, 
  IndianRupee,
  ArrowUp,
  ArrowDown,
  ArrowRight,
  Table,
  CircleDollarSign,
  TrendingDown,
  ClipboardList,
  AlertTriangle,
  Newspaper,
  CloudSun,
  Bot,
  Thermometer,
  Droplets,
  CloudRain,
  Cloud,
  Sun,
  Gauge
} from 'lucide-react';

function AdminDashboard() {
  const [admin, setAdmin] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalFarmers: 0,
    totalBuyers: 0,
    totalProducts: 0,
    activeProducts: 0
  });
  const [users, setUsers] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Mandi Price States
  const [states, setStates] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [commodities, setCommodities] = useState([]);
  const [selectedState, setSelectedState] = useState('');
  const [selectedDistrict, setSelectedDistrict] = useState('');
  const [selectedCommodity, setSelectedCommodity] = useState('');
  const [mandiPrices, setMandiPrices] = useState([]);
  const [loadingMandi, setLoadingMandi] = useState(false);
  const [mandiError, setMandiError] = useState('');
  
  // Crop News States
  const [cropNews, setCropNews] = useState(null);
  const [loadingNews, setLoadingNews] = useState(false);
  const [newsError, setNewsError] = useState('');
  
  // Weather States
  const [weatherCrop, setWeatherCrop] = useState('');
  const [weatherLocation, setWeatherLocation] = useState('');
  const [weatherData, setWeatherData] = useState(null);
  const [weatherLoading, setWeatherLoading] = useState(false);
  const [weatherError, setWeatherError] = useState('');
  
  // Price Insights States
  const [priceInsightsCrop, setPriceInsightsCrop] = useState('');
  const [priceInsightsLocation, setPriceInsightsLocation] = useState('');
  const [priceInsightsData, setPriceInsightsData] = useState(null);
  const [priceInsightsLoading, setPriceInsightsLoading] = useState(false);
  const [priceInsightsError, setPriceInsightsError] = useState('');
  
  // Market Analysis States (Master Orchestrator)
  const [analysisForm, setAnalysisForm] = useState({
    cropType: '',
    location: '',
    quantity: '',
    quality: 'B',
    storageCapacity: '',
    financialUrgency: 'medium'
  });
  const [analysisData, setAnalysisData] = useState(null);
  const [analysisLoading, setAnalysisLoading] = useState(false);
  const [analysisError, setAnalysisError] = useState('');
  const [activeAgents, setActiveAgents] = useState([]);
  
  const navigate = useNavigate();

  useEffect(() => {
    const adminData = JSON.parse(localStorage.getItem('admin'));
    const token = localStorage.getItem('token');
    
    if (!adminData || !token || adminData.userType !== 'admin') {
      navigate('/admin/login');
      return;
    }
    
    setAdmin(adminData);
    fetchDashboardData(token);
  }, [navigate]);

  const fetchDashboardData = async (token) => {
    try {
      const response = await axios.get('http://localhost:5000/api/admin/dashboard', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setStats(response.data.stats);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      if (error.response?.status === 401 || error.response?.status === 403) {
        handleLogout();
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:5000/api/admin/users', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setUsers(response.data.users);
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  const fetchProducts = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:5000/api/admin/products', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setProducts(response.data.products);
    } catch (error) {
      console.error('Error fetching products:', error);
    }
  };

  const handleDeleteUser = async (userId) => {
    if (!window.confirm('Are you sure you want to delete this user?')) return;
    
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`http://localhost:5000/api/admin/users/${userId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchUsers();
      fetchDashboardData(token);
    } catch (error) {
      console.error('Error deleting user:', error);
    }
  };

  const handleDeleteProduct = async (productId) => {
    if (!window.confirm('Are you sure you want to delete this product?')) return;
    
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`http://localhost:5000/api/admin/products/${productId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchProducts();
      fetchDashboardData(token);
    } catch (error) {
      console.error('Error deleting product:', error);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('admin');
    navigate('/admin/login');
  };

  // Fetch states for Mandi
  const fetchStates = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:5000/api/analytics/mandi/states', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (response.data.success) {
        setStates(response.data.states);
      }
    } catch (error) {
      console.error('Error fetching states:', error);
    }
  };

  // Fetch districts based on state
  const fetchDistricts = async (state) => {
    if (!state) return;
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`http://localhost:5000/api/analytics/mandi/districts?state=${state}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (response.data.success) {
        setDistricts(response.data.districts);
      }
    } catch (error) {
      console.error('Error fetching districts:', error);
    }
  };

  // Fetch commodities based on state and district
  const fetchCommodities = async (state, district) => {
    try {
      const token = localStorage.getItem('token');
      let url = 'http://localhost:5000/api/analytics/mandi/commodities?';
      if (state) url += `state=${state}`;
      if (district) url += `&district=${district}`;
      
      const response = await axios.get(url, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (response.data.success) {
        setCommodities(response.data.commodities);
      }
    } catch (error) {
      console.error('Error fetching commodities:', error);
    }
  };

  // Fetch Mandi prices
  const fetchMandiPrices = async () => {
    if (!selectedState) {
      setMandiError('Please select a state');
      return;
    }

    setLoadingMandi(true);
    setMandiError('');
    try {
      const token = localStorage.getItem('token');
      let url = `http://localhost:5000/api/analytics/mandi/prices?state=${selectedState}`;
      if (selectedDistrict) url += `&district=${selectedDistrict}`;
      if (selectedCommodity) url += `&commodity=${selectedCommodity}`;
      
      const response = await axios.get(url, {
        headers: { Authorization: `Bearer ${token}` }
      });
      console.log(response.data.records.length);
      if (response.data.success) {
        setMandiPrices(response.data.records || []);
        if (response.data.records?.length === 0) {
          setMandiError('No data found for the selected filters');
        }
      }
    } catch (error) {
      console.error('Error fetching Mandi prices:', error);
      setMandiError('Failed to fetch Mandi prices. Please try again.');
    } finally {
      setLoadingMandi(false);
    }
  };

  // Handle state change
  const handleStateChange = (state) => {
    setSelectedState(state);
    setSelectedDistrict('');
    setSelectedCommodity('');
    setDistricts([]);
    setCommodities([]);
    setMandiPrices([]);
    if (state) {
      fetchDistricts(state);
      fetchCommodities(state, '');
    }
  };

  // Handle district change
  const handleDistrictChange = (district) => {
    setSelectedDistrict(district);
    setSelectedCommodity('');
    setMandiPrices([]);
    if (district) {
      fetchCommodities(selectedState, district);
    }
  };

  // Handle commodity change
  const handleCommodityChange = (commodity) => {
    setSelectedCommodity(commodity);
    setMandiPrices([]);
  };

  useEffect(() => {
    if (activeTab === 'users') {
      fetchUsers();
    } else if (activeTab === 'products') {
      fetchProducts();
    } else if (activeTab === 'price-insights') {
      fetchStates();
    } else if (activeTab === 'cropnews') {
      fetchCropNews();
    }
  }, [activeTab]);

  // Fetch Crop News from LangGraph Agent
  const fetchCropNews = async () => {
    setLoadingNews(true);
    setNewsError('');
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:5000/api/agents/crop-news', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (response.data.success) {
        setCropNews(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching crop news:', error);
      setNewsError('Failed to fetch crop news. Please try again.');
    } finally {
      setLoadingNews(false);
    }
  };

  // Fetch Weather Analysis from AI Agent
  const fetchWeatherAnalysis = async () => {
    if (!weatherCrop.trim() || !weatherLocation.trim()) {
      setWeatherError('Please enter both crop name and location');
      return;
    }
    
    setWeatherLoading(true);
    setWeatherError('');
    setWeatherData(null);
    
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(
        'http://localhost:5000/api/agents/weather',
        { cropType: weatherCrop.trim(), location: weatherLocation.trim() },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      if (response.data.success) {
        setWeatherData(response.data.data);
      } else {
        setWeatherError(response.data.message || 'Failed to get weather analysis');
      }
    } catch (error) {
      console.error('Error fetching weather analysis:', error);
      setWeatherError(error.response?.data?.message || 'Failed to get weather analysis. Please try again.');
    } finally {
      setWeatherLoading(false);
    }
  };

  if (!admin || loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#F0F8A4]/20">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-[#36656B] border-t-transparent mx-auto mb-4"></div>
          <p className="text-[#36656B] font-medium">Loading admin panel...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F0F8A4]/10 flex">
      {/* Sidebar */}
      <aside className={`fixed lg:static inset-y-0 left-0 z-50 w-72 bg-gradient-to-b from-[#36656B] to-[#2a4f54] border-r border-[#36656B]/30 transform transition-transform duration-300 ease-in-out ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}>
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="flex items-center justify-between p-6 border-b border-[#75B06F]/30">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="absolute inset-0 bg-[#75B06F] rounded-xl blur-lg opacity-40"></div>
                <svg className="w-10 h-10 relative" viewBox="0 0 24 24" fill="none">
                  <path d="M12 2L13.09 8.26L19 6L14.74 10.91L21 12L14.74 13.09L19 18L13.09 15.74L12 22L10.91 15.74L5 18L9.26 13.09L3 12L9.26 10.91L5 6L10.91 8.26L12 2Z" fill="#75B06F"/>
                </svg>
              </div>
              <div>
                <h1 className="text-xl letter-spacing-wide font-bold text-white">AuraFarm</h1>
                <p className="text-xs text-[#DAD887]">Admin Panel</p>
              </div>
            </div>
            <button 
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden p-2 rounded-lg hover:bg-[#75B06F]/20 transition-colors text-[#DAD887] hover:text-white"
            >
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Admin Profile */}
          <div className="p-6 border-b border-[#75B06F]/30">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-12 h-12 bg-gradient-to-br from-[#75B06F] to-[#36656B] rounded-full flex items-center justify-center text-white font-bold text-lg shadow-lg">
                {admin.username.charAt(0).toUpperCase()}
              </div>
              <div>
                <p className="font-semibold text-white">{admin.username}</p>
                <p className="text-sm text-[#DAD887]">Administrator</p>
              </div>
            </div>
            <div className="flex items-center gap-2 text-xs text-[#DAD887] bg-[#36656B]/50 px-3 py-2 rounded-lg">
              <svg className="w-4 h-4 text-[#75B06F]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
              Full System Access
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
            {[
              { id: 'overview', label: 'Dashboard Overview', icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6' },
              { id: 'users', label: 'User Management', icon: 'M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z' },
              { id: 'products', label: 'Product Management', icon: 'M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4' },
              { id: 'price-insights', label: 'Price Insights', icon: 'M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z' },
              { id: 'analysis-reports', label: 'Analysis & Reports', icon: 'M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z' },
              { id: 'cropnews', label: 'Crop Economy News', icon: 'M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z' },
              { id: 'weather', label: 'Weather Analysis', icon: 'M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z' },
              { id: 'settings', label: 'System Settings', icon: 'M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z M15 12a3 3 0 11-6 0 3 3 0 016 0z' }
            ].map((item) => (
              <button
                key={item.id}
                onClick={() => {
                  setActiveTab(item.id);
                  setSidebarOpen(false);
                }}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                  activeTab === item.id
                    ? 'bg-[#f0f8a4] text-black shadow-lg shadow-[#75B06F]/30'
                    : 'text-[#DAD887] hover:bg-[#75B06F]/20 hover:text-white'
                }`}
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={item.icon} />
                </svg>
                <span className="font-semibold text-sm">{item.label}</span>
              </button>
            ))}
          </nav>

          {/* Logout */}
          <div className="p-4 border-t border-[#75B06F]/30">
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-[#F0F8A4] hover:bg-red-500/20 hover:text-red-300 transition-all"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              <span className="font-semibold text-sm">Logout</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Top Header */}
        <header className="bg-white border-b border-[#DAD887]/50 px-6 py-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button 
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden p-2 rounded-lg hover:bg-[#F0F8A4]/30 transition-colors"
              >
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
              <div>
                <h1 className="text-2xl font-bold text-[#36656B]">
                  {activeTab === 'overview' && 'Dashboard Overview'}
                  {activeTab === 'users' && 'User Management'}
                  {activeTab === 'products' && 'Product Management'}
                  {activeTab === 'price-insights' && 'Price Insights'}
                  {activeTab === 'analysis-reports' && 'Analysis & Reports'}
                  {activeTab === 'cropnews' && 'Crop Economy News'}
                  {activeTab === 'weather' && 'Weather Analysis'}
                  {activeTab === 'settings' && 'System Settings'}
                </h1>
                <p className="text-sm text-[#36656B]/70">
                  {activeTab === 'overview' && 'Monitor system performance and statistics'}
                  {activeTab === 'users' && 'Manage all registered users'}
                  {activeTab === 'products' && 'Oversee all product listings'}
                  {activeTab === 'price-insights' && 'Real-time mandi prices and market insights'}
                  {activeTab === 'analysis-reports' && 'AI-powered comprehensive market analysis with 5 agents'}
                  {activeTab === 'cropnews' && 'AI-powered agricultural economy insights'}
                  {activeTab === 'weather' && 'AI-powered weather impact analysis for crops'}
                  {activeTab === 'settings' && 'Configure system settings'}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="hidden md:flex items-center gap-2 bg-[#F0F8A4]/50 px-4 py-2 rounded-lg">
                <svg className="w-5 h-5 text-[#36656B]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="text-sm font-medium text-[#36656B]">{new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
              </div>
            </div>
          </div>
        </header>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-6">
          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <div>
              {/* Stats Grid */}
              <div className="grid md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
                <div className="bg-white rounded-xl shadow-sm border border-[#DAD887]/30 p-6 hover:shadow-lg transition-all hover:border-[#75B06F]/50">
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 bg-[#36656B] rounded-xl flex items-center justify-center">
                      <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                      </svg>
                    </div>
                  </div>
                  <h3 className="text-3xl font-bold text-[#36656B] mb-1">{stats.totalUsers}</h3>
                  <p className="text-[#36656B]/70 text-sm font-medium">Total Users</p>
                  <div className="mt-3 pt-3 border-t border-[#DAD887]/30">
                    <span className="text-xs text-[#36656B]/60">All registered users</span>
                  </div>
                </div>

                <div className="bg-white rounded-xl shadow-sm border border-[#DAD887]/30 p-6 hover:shadow-lg transition-all hover:border-[#75B06F]/50">
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 bg-[#36656B]  rounded-xl flex items-center justify-center">
                      <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                      </svg>
                    </div>
                  </div>
                  <h3 className="text-3xl font-bold text-[#36656B] mb-1">{stats.totalFarmers}</h3>
                  <p className="text-[#36656B]/70 text-sm font-medium">Farmers</p>
                  <div className="mt-3 pt-3 border-t border-[#DAD887]/30">
                    <span className="text-xs text-[#36656B]/60">Product suppliers</span>
                  </div>
                </div>

                <div className="bg-white rounded-xl shadow-sm border border-[#DAD887]/30 p-6 hover:shadow-lg transition-all hover:border-[#75B06F]/50">
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 bg-[#36656B]  rounded-xl flex items-center justify-center">
                      <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                      </svg>
                    </div>
                  </div>
                  <h3 className="text-3xl font-bold text-[#36656B] mb-1">{stats.totalBuyers}</h3>
                  <p className="text-[#36656B]/70 text-sm font-medium">Buyers</p>
                  <div className="mt-3 pt-3 border-t border-[#DAD887]/30">
                    <span className="text-xs text-[#36656B]/60">Active customers</span>
                  </div>
                </div>

                <div className="bg-white rounded-xl shadow-sm border border-[#DAD887]/30 p-6 hover:shadow-lg transition-all hover:border-[#75B06F]/50">
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 bg-[#36656B]  rounded-xl flex items-center justify-center">
                      <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                      </svg>
                    </div>
                  </div>
                  <h3 className="text-3xl font-bold text-[#36656B] mb-1">{stats.totalProducts}</h3>
                  <p className="text-[#36656B]/70 text-sm font-medium">Total Products</p>
                  <div className="mt-3 pt-3 border-t border-[#DAD887]/30">
                    <span className="text-xs text-[#36656B]/60">All listings</span>
                  </div>
                </div>

                <div className="bg-white rounded-xl shadow-sm border border-[#DAD887]/30 p-6 hover:shadow-lg transition-all hover:border-[#75B06F]/50">
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 bg-[#36656B] rounded-xl flex items-center justify-center">
                      <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                  </div>
                  <h3 className="text-3xl font-bold text-[#36656B] mb-1">{stats.activeProducts}</h3>
                  <p className="text-[#36656B]/70 text-sm font-medium">Active Products</p>
                  <div className="mt-3 pt-3 border-t border-[#DAD887]/30">
                    <span className="text-xs text-[#36656B]/60">Currently available</span>
                  </div>
                </div>
              </div>

              {/* System Status */}
              <div className="bg-white rounded-xl shadow-sm border border-[#DAD887]/30 p-6">
                <h2 className="text-lg font-bold text-[#36656B] mb-4">System Status</h2>
                <div className="grid md:grid-cols-3 gap-4">
                  <div className="flex items-center gap-3 p-4 bg-[#75B06F]/10 rounded-lg border border-[#75B06F]/30">
                    <div className="w-10 h-10 bg-[#75B06F] rounded-full flex items-center justify-center">
                      <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-[#36656B]">Server Status</p>
                      <p className="text-xs text-[#75B06F] font-medium">Operational</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-4 bg-[#75B06F]/10 rounded-lg border border-[#75B06F]/30">
                    <div className="w-10 h-10 bg-[#75B06F] rounded-full flex items-center justify-center">
                      <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-[#36656B]">Database</p>
                      <p className="text-xs text-[#75B06F] font-medium">Connected</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-4 bg-[#75B06F]/10 rounded-lg border border-[#75B06F]/30">
                    <div className="w-10 h-10 bg-[#75B06F] rounded-full flex items-center justify-center">
                      <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-[#36656B]">Security</p>
                      <p className="text-xs text-[#75B06F] font-medium">All systems secure</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Users Tab */}
          {activeTab === 'users' && (
            <div>
              {users.length === 0 ? (
                <div className="bg-white rounded-xl shadow-sm border border-[#DAD887]/30 p-12 text-center">
                  <svg className="w-16 h-16 mx-auto mb-4 text-[#DAD887]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                  <p className="text-[#36656B]/70">No users found</p>
                </div>
              ) : (
                <div className="bg-white rounded-xl shadow-sm border border-[#DAD887]/30 overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-[#F0F8A4]/30 border-b border-[#DAD887]/30">
                        <tr>
                          <th className="px-6 py-4 text-left text-xs font-semibold text-[#36656B] uppercase tracking-wider">Name</th>
                          <th className="px-6 py-4 text-left text-xs font-semibold text-[#36656B] uppercase tracking-wider">Email</th>
                          <th className="px-6 py-4 text-left text-xs font-semibold text-[#36656B] uppercase tracking-wider">Type</th>
                          <th className="px-6 py-4 text-left text-xs font-semibold text-[#36656B] uppercase tracking-wider">Phone</th>
                          <th className="px-6 py-4 text-left text-xs font-semibold text-[#36656B] uppercase tracking-wider">Location</th>
                          <th className="px-6 py-4 text-left text-xs font-semibold text-[#36656B] uppercase tracking-wider">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#DAD887]/20">
                        {users.map((user) => (
                          <tr key={user._id} className="hover:bg-[#F0F8A4]/10 transition-colors">
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-gradient-to-br from-[#75B06F] to-[#36656B] rounded-full flex items-center justify-center text-white font-bold text-sm">
                                  {user.name.charAt(0).toUpperCase()}
                                </div>
                                <span className="text-sm font-medium text-[#36656B]">{user.name}</span>
                              </div>
                            </td>
                            <td className="px-6 py-4 text-sm text-[#36656B]/70">{user.email}</td>
                            <td className="px-6 py-4">
                              <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                                user.userType === 'farmer' 
                                  ? 'bg-[#75B06F]/20 text-[#75B06F]' 
                                  : 'bg-[#36656B]/20 text-[#36656B]'
                              }`}>
                                {user.userType}
                              </span>
                            </td>
                            <td className="px-6 py-4 text-sm text-[#36656B]/70">{user.phone}</td>
                            <td className="px-6 py-4 text-sm text-[#36656B]/70">{user.location || 'N/A'}</td>
                            <td className="px-6 py-4">
                              <button
                                onClick={() => handleDeleteUser(user._id)}
                                className="px-4 py-2 bg-red-50 text-red-600 rounded-lg text-sm font-semibold hover:bg-red-100 transition-colors"
                              >
                                Delete
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Products Tab */}
          {activeTab === 'products' && (
            <div>
              {products.length === 0 ? (
                <div className="bg-white rounded-xl shadow-sm border border-[#DAD887]/30 p-12 text-center">
                  <svg className="w-16 h-16 mx-auto mb-4 text-[#DAD887]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                  </svg>
                  <p className="text-[#36656B]/70">No products found</p>
                </div>
              ) : (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {products.map((product) => (
                    <div key={product._id} className="bg-white rounded-xl shadow-sm border border-[#DAD887]/30 overflow-hidden hover:shadow-lg hover:border-[#75B06F]/50 transition-all">
                      <div className="relative h-48 bg-[#F0F8A4]/20">
                        {product.image ? (
                          <img
                            src={product.image}
                            alt={product.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <svg className="w-16 h-16 text-[#DAD887]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                          </div>
                        )}
                        <div className="absolute top-3 right-3">
                          <span className="px-3 py-1 bg-[#75B06F]/20 text-[#75B06F] rounded-full text-xs font-semibold">
                            {product.status || 'active'}
                          </span>
                        </div>
                      </div>
                      <div className="p-5">
                        <h3 className="font-bold text-[#36656B] mb-1 text-lg">{product.name}</h3>
                        <p className="text-sm text-[#36656B]/60 mb-3 capitalize">{product.category}</p>
                        <div className="flex items-center justify-between mb-3 pb-3 border-b border-[#DAD887]/30">
                          <span className="text-[#75B06F] font-bold text-lg">₹{product.price}/{product.unit}</span>
                          <span className="text-sm text-[#36656B]/70 font-medium">{product.quantity} {product.unit}</span>
                        </div>
                        <div className="flex items-center gap-2 mb-4 text-xs text-[#36656B]/60">
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                          </svg>
                          <span>By: {product.farmerName}</span>
                        </div>
                        <button
                          onClick={() => handleDeleteProduct(product._id)}
                          className="w-full py-2.5 bg-red-50 text-red-600 rounded-lg font-semibold hover:bg-red-100 transition-colors flex items-center justify-center gap-2"
                        >
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                          Delete Product
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Price Insights Tab */}
          {activeTab === 'price-insights' && (
            <div className="space-y-6">
              {/* Header */}
             

              {/* Search Form */}
              <div className="bg-white rounded-xl shadow-sm border border-[#DAD887]/30 p-6">
                <h3 className="text-xl font-bold text-[#36656B] mb-4">Find Best Prices for Any Crop</h3>
                <form onSubmit={async (e) => {
                  e.preventDefault();
                  if (!priceInsightsCrop.trim() || !priceInsightsLocation.trim()) return;
                  
                  setPriceInsightsLoading(true);
                  setPriceInsightsError('');
                  setPriceInsightsData(null);
                  
                  try {
                    const token = localStorage.getItem('token');
                    const response = await axios.post('http://localhost:5000/api/agents/price-insights', 
                      { cropType: priceInsightsCrop, location: priceInsightsLocation },
                      { headers: { Authorization: `Bearer ${token}` } }
                    );
                    
                    if (response.data.success) {
                      setPriceInsightsData(response.data.data);
                    } else {
                      setPriceInsightsError(response.data.error || 'Failed to fetch price insights');
                    }
                  } catch (error) {
                    setPriceInsightsError(error.response?.data?.error || 'Failed to fetch price insights');
                  } finally {
                    setPriceInsightsLoading(false);
                  }
                }} className="space-y-4">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-[#36656B] mb-2">Crop/Commodity</label>
                      <input
                        type="text"
                        value={priceInsightsCrop}
                        onChange={(e) => setPriceInsightsCrop(e.target.value)}
                        placeholder="e.g., Wheat, Rice, Onion, Tomato"
                        className="w-full px-4 py-3 border border-[#DAD887]/50 rounded-xl focus:ring-2 focus:ring-[#75B06F] focus:border-[#75B06F]"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-[#36656B] mb-2">Location/State</label>
                      <input
                        type="text"
                        value={priceInsightsLocation}
                        onChange={(e) => setPriceInsightsLocation(e.target.value)}
                        placeholder="e.g., Punjab, Maharashtra, Uttar Pradesh"
                        className="w-full px-4 py-3 border border-[#DAD887]/50 rounded-xl focus:ring-2 focus:ring-[#75B06F] focus:border-[#75B06F]"
                        required
                      />
                    </div>
                  </div>
                  <button
                    type="submit"
                    disabled={priceInsightsLoading || !priceInsightsCrop.trim() || !priceInsightsLocation.trim()}
                    className="w-full md:w-auto px-8 py-3 bg-[#36656B] text-white font-semibold rounded-xl hover:bg-[#2a5055] hover:shadow-lg active:scale-[0.98] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:shadow-none disabled:hover:bg-[#36656B] flex items-center justify-center gap-2"
                  >
                    {priceInsightsLoading ? (
                      <>
                        <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Analyzing...
                      </>
                    ) : (
                      <>
                        <Search className="w-5 h-5" />
                        Get Price Insights
                      </>
                    )}
                  </button>
                </form>
              </div>

              {/* Error Display */}
              {priceInsightsError && (
                <div className="bg-red-50 border border-red-200 rounded-xl p-4">
                  <p className="text-red-600">{priceInsightsError}</p>
                </div>
              )}

              {/* Price Insights Results */}
              {priceInsightsData && (
                <div className="space-y-6">
                  {/* Market Summary */}
                  <div className="bg-white rounded-xl shadow-sm border border-[#DAD887]/30 p-6">
                    <h3 className="text-xl font-bold text-[#36656B] mb-4 flex items-center gap-2">
                      <BarChart3 className="w-6 h-6 text-[#75B06F]" />
                      Market Summary - {priceInsightsData.crop}
                    </h3>
                    
                    <div className="grid md:grid-cols-3 gap-4 mb-6">
                      {/* Your Location Price */}
                      <div className="bg-[#F0F8A4]/20 rounded-xl p-4 border border-[#DAD887]/30 hover:border-[#DAD887]/60 hover:shadow-md transition-all duration-200">
                        <p className="text-sm text-[#36656B] font-medium mb-1 flex items-center gap-1.5">
                          <MapPin className="w-3.5 h-3.5" />
                          Nearest Mandi
                        </p>
                        <p className="text-2xl font-bold text-[#36656B]">
                          {priceInsightsData.market_summary?.your_location?.price_display || 'N/A'}
                        </p>
                        <p className="text-sm text-[#36656B]/70">
                          {priceInsightsData.market_summary?.your_location?.nearest_mandi}, {priceInsightsData.market_summary?.your_location?.city}
                        </p>
                      </div>
                      
                      {/* Highest Price */}
                      <div className="bg-[#F0F8A4]/20 rounded-xl p-4 border border-[#DAD887]/30 hover:border-[#DAD887]/60 hover:shadow-md transition-all duration-200">
                        <p className="text-sm text-[#36656B] font-medium mb-1 flex items-center gap-1.5">
                          <TrendingUp className="w-3.5 h-3.5" />
                          Highest Price
                        </p>
                        <p className="text-2xl font-bold text-[#36656B] flex items-center gap-2">
                          ₹{priceInsightsData.market_summary?.regional_prices?.highest_price?.price || 0}/quintal
                          <ArrowUp className="w-5 h-5 text-[#75B06F]" />
                        </p>
                        <p className="text-sm text-[#36656B]/70">
                          {priceInsightsData.market_summary?.regional_prices?.highest_price?.mandi}, {priceInsightsData.market_summary?.regional_prices?.highest_price?.city}
                        </p>
                      </div>
                      
                      {/* Average Price */}
                      <div className="bg-[#F0F8A4]/20 rounded-xl p-4 border border-[#DAD887]/30 hover:border-[#DAD887]/60 hover:shadow-md transition-all duration-200">
                        <p className="text-sm text-[#36656B] font-medium mb-1 flex items-center gap-1.5">
                          <BarChart3 className="w-3.5 h-3.5" />
                          Regional Average
                        </p>
                        <p className="text-2xl font-bold text-[#36656B]">
                          {priceInsightsData.market_summary?.regional_prices?.average_display || 'N/A'}
                        </p>
                        <p className="text-sm text-[#36656B]/70">
                          Variation: {priceInsightsData.market_summary?.price_variation?.percentage || '0%'}
                        </p>
                      </div>
                    </div>

                    {/* Price Variation Interpretation */}
                    <div className="bg-[#F0F8A4]/30 rounded-xl p-4">
                      <p className="text-[#36656B]">
                        <span className="font-semibold">Market Status: </span>
                        {priceInsightsData.market_summary?.price_variation?.interpretation || 'No data available'}
                      </p>
                    </div>
                  </div>

                  {/* Selling Guidance */}
                  <div className="bg-white rounded-xl shadow-sm border border-[#DAD887]/30 p-6">
                    <h3 className="text-xl font-bold text-[#36656B] mb-4 flex items-center gap-2">
                      <TrendingUp className="w-6 h-6 text-[#75B06F]" />
                      Selling Guidance
                    </h3>
                    
                    <div className="grid md:grid-cols-2 gap-4">
                      {/* Best Market */}
                      <div className="bg-[#F0F8A4]/20 rounded-xl p-5 border border-[#DAD887]/30 hover:border-[#DAD887]/60 hover:shadow-md transition-all duration-200">
                        <div className="flex items-start gap-3">
                          <div className="w-10 h-10 bg-[#75B06F] rounded-xl flex items-center justify-center shrink-0">
                            <CheckCircle2 className="w-5 h-5 text-white" />
                          </div>
                          <div className="flex-1">
                            <p className="font-bold text-[#36656B] mb-1">Best Market to Sell</p>
                            <p className="text-[#36656B]/80">{priceInsightsData.selling_guidance?.best_market?.recommendation || 'N/A'}</p>
                            <p className="text-sm text-[#36656B]/70 mt-2 flex items-center gap-1">
                              Expected: ₹{priceInsightsData.selling_guidance?.best_market?.expected_price || 0}/quintal
                              <ArrowUp className="w-4 h-4 text-[#75B06F]" />
                            </p>
                          </div>
                        </div>
                      </div>
                      
                      {/* Price Advantage */}
                      <div className="bg-[#F0F8A4]/20 rounded-xl p-5 border border-[#DAD887]/30 hover:border-[#DAD887]/60 hover:shadow-md transition-all duration-200">
                        <div className="flex items-start gap-3">
                          <div className="w-10 h-10 bg-[#36656B] rounded-xl flex items-center justify-center shrink-0">
                            <IndianRupee className="w-5 h-5 text-white" />
                          </div>
                          <div className="flex-1">
                            <p className="font-bold text-[#36656B] mb-1">Extra Earning Potential</p>
                            <p className="text-[#36656B]/80">
                              {priceInsightsData.selling_guidance?.price_advantage?.extra_earning || '₹0/quintal'}
                            </p>
                            <p className="text-sm text-[#36656B]/70 mt-2">
                              {priceInsightsData.selling_guidance?.price_advantage?.percentage_gain || '0%'} more than local
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Timing Advice */}
                      <div className="bg-[#F0F8A4]/20 rounded-xl p-5 border border-[#DAD887]/30 hover:border-[#DAD887]/60 hover:shadow-md transition-all duration-200">
                        <div className="flex items-start gap-3">
                          <div className="w-10 h-10 bg-[#36656B] rounded-xl flex items-center justify-center shrink-0">
                            <Clock className="w-5 h-5 text-white" />
                          </div>
                          <div className="flex-1">
                            <p className="font-bold text-[#36656B] mb-1">Timing Advice</p>
                            <p className="text-[#36656B]/80">{priceInsightsData.selling_guidance?.timing_advice?.advice || 'N/A'}</p>
                            <p className="text-sm text-[#36656B]/70 mt-2">{priceInsightsData.selling_guidance?.timing_advice?.reason || ''}</p>
                          </div>
                        </div>
                      </div>

                      {/* Quality Tips */}
                      <div className="bg-[#F0F8A4]/20 rounded-xl p-5 border border-[#DAD887]/30 hover:border-[#DAD887]/60 hover:shadow-md transition-all duration-200">
                        <div className="flex items-start gap-3">
                          <div className="w-10 h-10 bg-[#75B06F] rounded-xl flex items-center justify-center shrink-0">
                            <Gem className="w-5 h-5 text-white" />
                          </div>
                          <div className="flex-1">
                            <p className="font-bold text-[#36656B] mb-1">Quality Tips</p>
                            <p className="text-[#36656B]/80">{priceInsightsData.selling_guidance?.quality_tips?.tip || 'N/A'}</p>
                            <p className="text-sm text-[#36656B]/70 mt-2">
                              Premium potential: {priceInsightsData.selling_guidance?.quality_tips?.premium_potential || 'N/A'}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Market Intelligence */}
                  <div className="bg-white rounded-xl shadow-sm border border-[#DAD887]/30 p-6">
                    <h3 className="text-xl font-bold text-[#36656B] mb-4 flex items-center gap-2">
                      <Lightbulb className="w-6 h-6 text-[#36656B]" />
                      Market Intelligence
                    </h3>
                    
                    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
                      {/* Market Condition */}
                      <div className="bg-[#F0F8A4]/20 rounded-xl p-4 border border-[#DAD887]/30 hover:border-[#DAD887]/60 hover:shadow-sm transition-all duration-200">
                        <p className="text-sm text-[#36656B]/70 mb-1">Market Condition</p>
                        <p className="font-bold text-lg text-[#36656B] flex items-center gap-2">
                          {priceInsightsData.market_intelligence?.market_condition?.status || 'Unknown'}
                          <span className={`w-2.5 h-2.5 rounded-full ${
                            priceInsightsData.market_intelligence?.market_condition?.status === 'Stable' ? 'bg-[#75B06F]' :
                            priceInsightsData.market_intelligence?.market_condition?.status === 'Volatile' ? 'bg-red-500' : 'bg-[#DAD887]'
                          }`}></span>
                        </p>
                      </div>
                      
                      {/* Trend */}
                      <div className="bg-[#F0F8A4]/20 rounded-xl p-4 border border-[#DAD887]/30 hover:border-[#DAD887]/60 hover:shadow-sm transition-all duration-200">
                        <p className="text-sm text-[#36656B]/70 mb-1">Price Trend</p>
                        <p className="font-bold text-lg text-[#36656B] flex items-center gap-1">
                          {priceInsightsData.market_intelligence?.trend_indicator?.direction || 'Unknown'}
                          {priceInsightsData.market_intelligence?.trend_indicator?.direction === 'rising' && <ArrowUp className="w-5 h-5 text-[#75B06F]" />}
                          {priceInsightsData.market_intelligence?.trend_indicator?.direction === 'falling' && <ArrowDown className="w-5 h-5 text-red-500" />}
                          {priceInsightsData.market_intelligence?.trend_indicator?.direction === 'stable' && <ArrowRight className="w-5 h-5 text-[#36656B]" />}
                        </p>
                      </div>
                      
                      {/* Arbitrage */}
                      <div className="bg-[#F0F8A4]/20 rounded-xl p-4 border border-[#DAD887]/30 hover:border-[#DAD887]/60 hover:shadow-sm transition-all duration-200">
                        <p className="text-sm text-[#36656B]/70 mb-1">Arbitrage Opportunity</p>
                        <p className="font-bold text-lg text-[#36656B] flex items-center gap-1">
                          {priceInsightsData.market_intelligence?.arbitrage_opportunity?.exists ? 'Yes' : 'No'}
                          {priceInsightsData.market_intelligence?.arbitrage_opportunity?.exists && <CheckCircle2 className="w-5 h-5 text-[#75B06F]" />}
                        </p>
                        <p className="text-xs text-[#36656B]/60">
                          {priceInsightsData.market_intelligence?.arbitrage_opportunity?.potential_gain || ''}
                        </p>
                      </div>
                      
                      {/* Market Efficiency */}
                      <div className="bg-[#F0F8A4]/20 rounded-xl p-4 border border-[#DAD887]/30 hover:border-[#DAD887]/60 hover:shadow-sm transition-all duration-200">
                        <p className="text-sm text-[#36656B]/70 mb-1">Market Efficiency</p>
                        <p className="font-semibold text-[#36656B] text-sm">
                          {priceInsightsData.market_intelligence?.market_efficiency || 'Unknown'}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Mandi Prices Table */}
                  {priceInsightsData.mandi_prices && priceInsightsData.mandi_prices.length > 0 && (
                    <div className="bg-white rounded-xl shadow-sm border border-[#DAD887]/30 p-6">
                      <h3 className="text-xl font-bold text-[#36656B] mb-4 flex items-center gap-2">
                        <Table className="w-6 h-6 text-[#75B06F]" />
                        Mandi Prices ({priceInsightsData.total_mandis_fetched} markets)
                      </h3>
                      
                      <div className="overflow-x-auto">
                        <table className="w-full">
                          <thead>
                            <tr className="bg-[#F0F8A4]/30">
                              <th className="px-4 py-3 text-left text-sm font-semibold text-[#36656B]">Mandi</th>
                              <th className="px-4 py-3 text-left text-sm font-semibold text-[#36656B]">City</th>
                              <th className="px-4 py-3 text-right text-sm font-semibold text-[#36656B]">Min Price</th>
                              <th className="px-4 py-3 text-right text-sm font-semibold text-[#36656B]">Max Price</th>
                              <th className="px-4 py-3 text-right text-sm font-semibold text-[#36656B]">Modal Price</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-[#DAD887]/20">
                            {priceInsightsData.mandi_prices.slice(0, 10).map((mandi, index) => (
                              <tr key={index} className="hover:bg-[#F0F8A4]/10">
                                <td className="px-4 py-3 text-sm text-[#36656B]">{mandi.mandi_name}</td>
                                <td className="px-4 py-3 text-sm text-[#36656B]/70">{mandi.city}</td>
                                <td className="px-4 py-3 text-sm text-[#36656B]/70 text-right">₹{mandi.min_price}</td>
                                <td className="px-4 py-3 text-sm text-[#36656B]/70 text-right">₹{mandi.max_price}</td>
                                <td className="px-4 py-3 text-sm font-semibold text-[#75B06F] text-right">₹{mandi.modal_price}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Empty State */}
              {!priceInsightsData && !priceInsightsLoading && !priceInsightsError && (
                <div className="bg-white rounded-xl shadow-sm border border-[#DAD887]/30 p-12 text-center">
                  <div className="w-20 h-20 mx-auto mb-6 bg-[#75B06F]/10 rounded-full flex items-center justify-center">
                    <CircleDollarSign className="w-10 h-10 text-[#75B06F]" />
                  </div>
                  <h3 className="text-xl font-bold text-[#36656B] mb-2">Get Real-Time Price Insights</h3>
                  <p className="text-[#36656B]/70 mb-4">Enter a crop and location to see current mandi prices, best markets, and smart recommendations</p>
                  <div className="flex flex-wrap justify-center gap-2 text-sm text-[#36656B]/60">
                    <span className="bg-[#F0F8A4]/50 px-3 py-1 rounded-full">Wheat</span>
                    <span className="bg-[#F0F8A4]/50 px-3 py-1 rounded-full">Rice</span>
                    <span className="bg-[#F0F8A4]/50 px-3 py-1 rounded-full">Onion</span>
                    <span className="bg-[#F0F8A4]/50 px-3 py-1 rounded-full">Tomato</span>
                    <span className="bg-[#F0F8A4]/50 px-3 py-1 rounded-full">Potato</span>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Crop News Tab */}
          {activeTab === 'cropnews' && (
            <div className="space-y-6">
              {/* Loading State */}
              {loadingNews && (
                <div className="bg-white rounded-xl shadow-sm border border-[#DAD887]/30 p-12 text-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-4 border-[#36656B] border-t-transparent mx-auto mb-4"></div>
                  <p className="text-[#36656B] font-medium">AI Agent analyzing crop economy news...</p>
                  <p className="text-sm text-[#36656B]/60 mt-2">This may take a few seconds</p>
                </div>
              )}

              {/* Error State */}
              {newsError && !loadingNews && (
                <div className="bg-red-50 border border-red-200 rounded-xl p-6 flex items-center gap-4">
                  <svg className="w-8 h-8 text-red-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <div>
                    <p className="text-red-700 font-medium">{newsError}</p>
                    <button onClick={fetchCropNews} className="mt-2 text-sm text-red-600 underline hover:no-underline">
                      Try again
                    </button>
                  </div>
                </div>
              )}

              {/* News Content */}
              {cropNews && !loadingNews && (
                <>
                  {/* AI Analysis Card */}
                  <div className="bg-white rounded-xl shadow-sm border border-[#DAD887]/30 overflow-hidden">
                    <div className="bg-[#F0F8A4]/20 px-6 py-4 border-b border-[#DAD887]/30 flex items-center justify-between">
                      <h3 className="text-lg font-bold text-[#36656B] flex items-center gap-2">
                        <svg className="w-5 h-5 text-[#75B06F]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                        </svg>
                        AI Market Analysis
                      </h3>
                      <div className="flex items-center gap-2 text-xs bg-[#36656B]/10 text-[#36656B] px-3 py-1.5 rounded-full">
                        <div className="w-2 h-2 bg-[#75B06F] rounded-full animate-pulse"></div>
                        Powered by LangGraph AI Agent
                      </div>
                    </div>
                    <div className="p-6">
                      <div className="prose prose-sm max-w-none">
                        {cropNews.analysis?.split('\n\n').map((paragraph, idx) => (
                          paragraph.trim() && (
                            <p key={idx} className="text-[#36656B]/80 leading-relaxed mb-4 last:mb-0">
                              {paragraph.replace(/[#*_`]/g, '').trim()}
                            </p>
                          )
                        ))}
                      </div>
                      <div className="mt-4 pt-4 border-t border-[#DAD887]/30 flex items-center justify-between text-xs text-[#36656B]/60">
                        <span>Generated at: {new Date(cropNews.timestamp).toLocaleString()}</span>
                        <span className="px-2 py-1 bg-[#75B06F]/20 text-[#75B06F] rounded-full">{cropNews.totalArticles} articles analyzed</span>
                      </div>
                    </div>
                  </div>

                  {/* News Articles Grid */}
                  <div className="grid md:grid-cols-2 gap-6">
                    {cropNews.articles?.map((article, index) => (
                      <div key={index} className="bg-white rounded-xl shadow-sm border border-[#DAD887]/30 overflow-hidden hover:shadow-lg hover:border-[#75B06F]/50 transition-all">
                        {article.imageUrl && (
                          <img src={article.imageUrl} alt={article.title} className="w-full h-40 object-cover" />
                        )}
                        <div className="p-5">
                          <div className="flex items-center gap-2 mb-2">
                            <span className="px-2 py-1 bg-[#75B06F]/20 text-[#75B06F] rounded text-xs font-medium">{article.source}</span>
                            <span className="text-xs text-[#36656B]/50">{new Date(article.publishedAt).toLocaleDateString()}</span>
                          </div>
                          <h4 className="font-bold text-[#36656B] mb-2 line-clamp-2">{article.title}</h4>
                          <p className="text-sm text-[#36656B]/70 line-clamp-3">{article.description}</p>
                          {article.url && article.url !== '#' && (
                            <a href={article.url} target="_blank" rel="noopener noreferrer" className="mt-4 inline-flex items-center gap-1 text-[#75B06F] text-sm font-medium hover:underline">
                              Read more
                              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                              </svg>
                            </a>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Refresh Button */}
                  <div className="text-center">
                    <button
                      onClick={fetchCropNews}
                      className="px-8 py-3 bg-[#36656B] text-white font-semibold rounded-xl hover:bg-[#2a5055] hover:shadow-lg active:scale-[0.98] transition-all duration-200 flex items-center gap-2 mx-auto"
                    >
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                      </svg>
                      Refresh News
                    </button>
                  </div>
                </>
              )}

              {/* Initial State */}
              {!cropNews && !loadingNews && !newsError && (
                <div className="bg-white rounded-xl shadow-sm border border-[#DAD887]/30 p-12 text-center">
                  <div className="w-20 h-20 bg-[#75B06F]/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-10 h-10 text-[#75B06F]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-semibold text-[#36656B] mb-2">Loading Crop Economy News</h3>
                  <p className="text-[#36656B]/60">Fetching latest agricultural market insights...</p>
                </div>
              )}
            </div>
          )}

          {/* Weather Analysis Tab */}
          {activeTab === 'weather' && (
            <div className="space-y-6">
              {/* Search Form */}
              <div className="bg-white rounded-xl shadow-sm border border-[#DAD887]/30 p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-[#36656B]">Enter Crop & Location</h3>
                  <div className="flex items-center gap-2 text-xs bg-[#36656B]/10 text-[#36656B] px-3 py-1.5 rounded-full">
                    <Bot className="w-3.5 h-3.5" />
                    Powered by Mistral AI Agent
                  </div>
                </div>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-[#36656B] mb-1">Crop Name</label>
                    <input
                      type="text"
                      value={weatherCrop}
                      onChange={(e) => setWeatherCrop(e.target.value)}
                      placeholder="e.g., Rice, Wheat, Cotton"
                      className="w-full px-4 py-2 border border-[#DAD887]/50 rounded-lg focus:ring-2 focus:ring-[#75B06F] focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[#36656B] mb-1">Location</label>
                    <input
                      type="text"
                      value={weatherLocation}
                      onChange={(e) => setWeatherLocation(e.target.value)}
                      placeholder="e.g., Punjab, Maharashtra"
                      className="w-full px-4 py-2 border border-[#DAD887]/50 rounded-lg focus:ring-2 focus:ring-[#75B06F] focus:border-transparent"
                    />
                  </div>
                </div>
                <button
                  onClick={fetchWeatherAnalysis}
                  disabled={weatherLoading}
                  className="mt-4 w-full md:w-auto px-8 py-3 bg-[#36656B] text-white font-semibold rounded-xl hover:bg-[#2a5055] hover:shadow-lg active:scale-[0.98] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {weatherLoading ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Analyzing...
                    </>
                  ) : (
                    <>
                      <CloudSun className="w-5 h-5" />
                      Analyze Weather Impact
                    </>
                  )}
                </button>
              </div>

              {/* Error State */}
              {weatherError && (
                <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-center gap-3">
                  <svg className="w-6 h-6 text-red-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <p className="text-red-700">{weatherError}</p>
                </div>
              )}

              {/* Weather Results */}
              {weatherData && (
                <div className="space-y-6">
                  {/* Weather Overview */}
                  <div className="bg-white rounded-xl shadow-sm border border-[#DAD887]/30 overflow-hidden">
                    <div className="bg-gradient-to-r from-[#F0F8A4]/30 to-[#DAD887]/30 px-6 py-4 border-b border-[#DAD887]/30">
                      <h3 className="text-lg font-bold text-[#36656B] flex items-center gap-2">
                        <svg className="w-5 h-5 text-[#36656B]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z" />
                        </svg>
                        Current Weather for {weatherData.location}
                      </h3>
                    </div>
                    <div className="p-6">
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="bg-[#F0F8A4]/20 border border-[#DAD887]/30 rounded-xl p-4 text-center hover:border-[#DAD887]/60 hover:shadow-md transition-all">
                          <div className="w-10 h-10 bg-[#75B06F]/20 rounded-lg flex items-center justify-center mx-auto mb-2">
                            <Thermometer className="w-5 h-5 text-[#75B06F]" />
                          </div>
                          <p className="text-3xl font-bold text-[#36656B]">{weatherData.weather?.temperature || 'N/A'}°C</p>
                          <p className="text-sm text-[#36656B]/70">Temperature</p>
                        </div>
                        <div className="bg-[#F0F8A4]/20 border border-[#DAD887]/30 rounded-xl p-4 text-center hover:border-[#DAD887]/60 hover:shadow-md transition-all">
                          <div className="w-10 h-10 bg-[#75B06F]/20 rounded-lg flex items-center justify-center mx-auto mb-2">
                            <Droplets className="w-5 h-5 text-[#75B06F]" />
                          </div>
                          <p className="text-3xl font-bold text-[#36656B]">{weatherData.weather?.humidity || 'N/A'}%</p>
                          <p className="text-sm text-[#36656B]/70">Humidity</p>
                        </div>
                        <div className="bg-[#F0F8A4]/20 border border-[#DAD887]/30 rounded-xl p-4 text-center hover:border-[#DAD887]/60 hover:shadow-md transition-all">
                          <div className="w-10 h-10 bg-[#75B06F]/20 rounded-lg flex items-center justify-center mx-auto mb-2">
                            <CloudRain className="w-5 h-5 text-[#75B06F]" />
                          </div>
                          <p className="text-3xl font-bold text-[#36656B]">{weatherData.weather?.rainfall || '0'} mm</p>
                          <p className="text-sm text-[#36656B]/70">Rainfall</p>
                        </div>
                        <div className="bg-[#F0F8A4]/20 border border-[#DAD887]/30 rounded-xl p-4 text-center hover:border-[#DAD887]/60 hover:shadow-md transition-all">
                          <div className="w-10 h-10 bg-[#75B06F]/20 rounded-lg flex items-center justify-center mx-auto mb-2">
                            <Gauge className="w-5 h-5 text-[#75B06F]" />
                          </div>
                          <p className="text-3xl font-bold text-[#36656B] capitalize">{weatherData.weather?.condition || 'N/A'}</p>
                          <p className="text-sm text-[#36656B]/70">Condition</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* AI Analysis */}
                  <div className="bg-white rounded-xl shadow-sm border border-[#DAD887]/30 overflow-hidden">
                    <div className="bg-gradient-to-r from-[#75B06F]/10 to-[#36656B]/10 px-6 py-4 border-b border-[#DAD887]/30">
                      <h3 className="text-lg font-bold text-[#36656B] flex items-center gap-2">
                        <svg className="w-5 h-5 text-[#75B06F]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                        </svg>
                        AI Analysis for {weatherData.crop}
                      </h3>
                    </div>
                    <div className="p-6">
                      <div className="prose prose-sm max-w-none">
                        {weatherData.analysis?.split('\n\n').map((paragraph, idx) => (
                          paragraph.trim() && (
                            <p key={idx} className="text-[#36656B]/80 leading-relaxed mb-4 last:mb-0">
                              {paragraph.replace(/[#*_`]/g, '').trim()}
                            </p>
                          )
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Recommendations */}
                  {weatherData.recommendations && weatherData.recommendations.length > 0 && (
                    <div className="bg-white rounded-xl shadow-sm border border-[#DAD887]/30 overflow-hidden">
                      <div className="bg-gradient-to-r from-[#DAD887]/30 to-[#F0F8A4]/30 px-6 py-4 border-b border-[#DAD887]/30">
                        <h3 className="text-lg font-bold text-[#36656B] flex items-center gap-2">
                          <svg className="w-5 h-5 text-[#75B06F]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                          </svg>
                          Recommendations
                        </h3>
                      </div>
                      <div className="p-6">
                        <ul className="space-y-3">
                          {weatherData.recommendations.map((rec, idx) => (
                            <li key={idx} className="flex items-start gap-3">
                              <span className="flex-shrink-0 w-6 h-6 bg-[#75B06F]/20 text-[#75B06F] rounded-full flex items-center justify-center text-sm font-semibold">
                                {idx + 1}
                              </span>
                              <span className="text-[#36656B]/80">{rec}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  )}

                  {/* Timestamp */}
                  <div className="text-center text-sm text-[#36656B]/60">
                    Analysis generated at: {new Date(weatherData.timestamp).toLocaleString()}
                  </div>
                </div>
              )}

              {/* Initial State */}
              {!weatherData && !weatherLoading && !weatherError && (
                <div className="bg-white rounded-xl shadow-sm border border-[#DAD887]/30 p-12 text-center">
                  <div className="w-20 h-20 bg-[#36656B]/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-10 h-10 text-[#36656B]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-semibold text-[#36656B] mb-2">Weather Impact Analysis</h3>
                  <p className="text-[#36656B]/60">Enter a crop name and location to get AI-powered weather analysis and farming recommendations</p>
                </div>
              )}
            </div>
          )}

          {/* Analysis & Reports Tab */}
          {activeTab === 'analysis-reports' && (
            <div className="space-y-6">
              {/* Header */}


              {/* Agent Status Indicators */}
              {analysisLoading && (
                <div className="bg-white rounded-xl shadow-sm border border-[#DAD887]/30 p-6">
                  <h3 className="text-lg font-semibold text-[#36656B] mb-4">Agent Processing Status</h3>
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                    {['price', 'news', 'weather', 'search', 'analytics'].map((agent) => (
                      <div key={agent} className={`p-4 rounded-lg border-2 transition-all ${
                        activeAgents.includes(agent) 
                          ? 'border-[#75B06F] bg-[#75B06F]/10' 
                          : 'border-[#DAD887]/30 bg-[#F0F8A4]/10'
                      }`}>
                        <div className="flex items-center gap-2">
                          {activeAgents.includes(agent) ? (
                            <div className="w-4 h-4 border-2 border-[#75B06F] border-t-transparent rounded-full animate-spin"></div>
                          ) : (
                            <div className="w-4 h-4 rounded-full bg-[#DAD887]"></div>
                          )}
                          <span className="capitalize font-medium text-sm text-[#36656B]">{agent}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Analysis Form */}
              <div className="bg-white rounded-xl shadow-sm border border-[#DAD887]/30 p-6">
                <h3 className="text-lg font-semibold text-[#36656B] mb-4">Enter Analysis Parameters</h3>
                <div className="grid md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-[#36656B] mb-1">Crop Type *</label>
                    <input
                      type="text"
                      value={analysisForm.cropType}
                      onChange={(e) => setAnalysisForm({...analysisForm, cropType: e.target.value})}
                      placeholder="e.g., Wheat, Rice, Cotton"
                      className="w-full px-4 py-2 border border-[#DAD887]/50 rounded-lg focus:ring-2 focus:ring-[#75B06F] focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[#36656B] mb-1">Location *</label>
                    <input
                      type="text"
                      value={analysisForm.location}
                      onChange={(e) => setAnalysisForm({...analysisForm, location: e.target.value})}
                      placeholder="e.g., Punjab, Maharashtra"
                      className="w-full px-4 py-2 border border-[#DAD887]/50 rounded-lg focus:ring-2 focus:ring-[#75B06F] focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[#36656B] mb-1">Quantity (Quintals)</label>
                    <input
                      type="number"
                      value={analysisForm.quantity}
                      onChange={(e) => setAnalysisForm({...analysisForm, quantity: e.target.value})}
                      placeholder="e.g., 50"
                      className="w-full px-4 py-2 border border-[#DAD887]/50 rounded-lg focus:ring-2 focus:ring-[#75B06F] focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[#36656B] mb-1">Quality Grade</label>
                    <select
                      value={analysisForm.quality}
                      onChange={(e) => setAnalysisForm({...analysisForm, quality: e.target.value})}
                      className="w-full px-4 py-2 border border-[#DAD887]/50 rounded-lg focus:ring-2 focus:ring-[#75B06F] focus:border-transparent"
                    >
                      <option value="">Select Grade</option>
                      <option value="A">Grade A (Premium)</option>
                      <option value="B">Grade B (Standard)</option>
                      <option value="C">Grade C (Economy)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[#36656B] mb-1">Storage Capacity (Days)</label>
                    <input
                      type="number"
                      value={analysisForm.storageCapacity}
                      onChange={(e) => setAnalysisForm({...analysisForm, storageCapacity: e.target.value})}
                      placeholder="e.g., 30"
                      className="w-full px-4 py-2 border border-[#DAD887]/50 rounded-lg focus:ring-2 focus:ring-[#75B06F] focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[#36656B] mb-1">Financial Urgency</label>
                    <select
                      value={analysisForm.financialUrgency}
                      onChange={(e) => setAnalysisForm({...analysisForm, financialUrgency: e.target.value})}
                      className="w-full px-4 py-2 border border-[#DAD887]/50 rounded-lg focus:ring-2 focus:ring-[#75B06F] focus:border-transparent"
                    >
                      <option value="">Select Urgency</option>
                      <option value="low">Low - Can wait for best price</option>
                      <option value="medium">Medium - Need to sell within 2 weeks</option>
                      <option value="high">High - Need to sell immediately</option>
                    </select>
                  </div>
                </div>
                <button
                  onClick={async () => {
                    if (!analysisForm.cropType || !analysisForm.location) {
                      setAnalysisError('Please enter crop type and location');
                      return;
                    }
                    setAnalysisLoading(true);
                    setAnalysisError(null);
                    setAnalysisData(null);
                    setActiveAgents([]);
                    
                    // Simulate agent activation
                    const agents = ['price', 'news', 'weather', 'search', 'analytics'];
                    for (const agent of agents) {
                      await new Promise(r => setTimeout(r, 800));
                      setActiveAgents(prev => [...prev, agent]);
                    }
                    
                    try {
                      const response = await fetch('http://localhost:5000/api/analyze', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(analysisForm)
                      });
                      const data = await response.json();
                      if (data.success) {
                        setAnalysisData(data.data);
                      } else {
                        setAnalysisError(data.message || 'Analysis failed');
                      }
                    } catch (err) {
                      setAnalysisError('Failed to run analysis: ' + err.message);
                    } finally {
                      setAnalysisLoading(false);
                    }
                  }}
                  disabled={analysisLoading}
                  className="mt-4 w-full md:w-auto px-8 py-3 bg-[#36656B] text-white font-semibold rounded-xl hover:bg-[#2a5055] hover:shadow-lg active:scale-[0.98] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:shadow-none disabled:hover:bg-[#36656B] flex items-center justify-center gap-2"
                >
                  {analysisLoading ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Running Analysis...
                    </>
                  ) : (
                    <>
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                      </svg>
                      Run Comprehensive Analysis
                    </>
                  )}
                </button>
              </div>

              {/* Error State */}
              {analysisError && (
                <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-center gap-3">
                  <svg className="w-6 h-6 text-red-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <p className="text-red-700">{analysisError}</p>
                </div>
              )}

              {/* Analysis Results */}
              {analysisData && (
                <div className="space-y-6">
                  {/* Main Recommendation Hero */}
                  <div className="bg-gradient-to-br from-white to-[#F0F8A4]/30 rounded-2xl shadow-lg border border-[#DAD887]/30 p-6">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
                      <div>
                        <h3 className="text-2xl font-bold text-[#36656B]">
                          {analysisData.recommendation?.crop} in {analysisData.recommendation?.location}
                        </h3>
                        <p className="text-[#36656B]/60">AI-Powered Market Analysis</p>
                      </div>
                      <div className={`px-6 py-3 rounded-full font-bold text-lg ${
                        analysisData.recommendation?.recommendation?.action?.includes('SELL NOW') 
                          ? 'bg-[#75B06F] text-white' 
                          : analysisData.recommendation?.recommendation?.action?.includes('WAIT')
                          ? 'bg-[#DAD887] text-[#36656B]'
                          : 'bg-[#36656B] text-white'
                      }`}>
                        {analysisData.recommendation?.recommendation?.action || 'ANALYZING'}
                      </div>
                    </div>
                    
                    <div className="grid md:grid-cols-2 gap-6 mb-6">
                      <div className="bg-white rounded-xl p-4 border border-[#DAD887]/50">
                        <p className="text-sm text-[#36656B]/70 mb-1">Current Market Price</p>
                        <p className="text-3xl font-bold text-[#75B06F]">
                          ₹{analysisData.recommendation?.market_summary?.current_modal_price?.toLocaleString() || 'N/A'}/qtl
                        </p>
                        <p className="text-sm text-[#36656B]/80">
                          {analysisData.recommendation?.market_summary?.mandi_name}, {analysisData.recommendation?.market_summary?.city}
                        </p>
                      </div>
                      <div className="bg-white rounded-xl p-4 border border-[#DAD887]/50">
                        <p className="text-sm text-[#36656B]/70 mb-1">Recommended Target Price</p>
                        <p className="text-3xl font-bold text-[#36656B]">
                          {analysisData.recommendation?.recommendation?.target_price || 'N/A'}
                        </p>
                        <p className="text-sm text-[#36656B]/80">
                          {analysisData.recommendation?.recommendation?.timing || 'Based on market conditions'}
                        </p>
                      </div>
                    </div>
                    
                    <div className="bg-[#F0F8A4]/30 rounded-xl p-4 border border-[#DAD887]/50">
                      <p className="text-[#36656B] font-medium flex items-start gap-2">
                        <Lightbulb className="w-5 h-5 text-[#75B06F] shrink-0 mt-0.5" />
                        {analysisData.recommendation?.farmer_friendly_summary || analysisData.recommendation?.recommendation?.reasoning}
                      </p>
                    </div>
                    
                    <div className="mt-4">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm font-medium text-[#36656B]/80">Confidence Level</span>
                        <span className={`text-sm font-bold ${
                          analysisData.recommendation?.recommendation?.confidence === 'high' ? 'text-[#75B06F]' :
                          analysisData.recommendation?.recommendation?.confidence === 'medium' ? 'text-[#DAD887]' : 'text-red-600'
                        }`}>
                          {analysisData.recommendation?.recommendation?.confidence?.toUpperCase() || 'MEDIUM'}
                        </span>
                      </div>
                      <div className="w-full bg-[#DAD887]/30 rounded-full h-2">
                        <div className={`h-2 rounded-full ${
                          analysisData.recommendation?.recommendation?.confidence === 'high' ? 'bg-[#75B06F] w-4/5' :
                          analysisData.recommendation?.recommendation?.confidence === 'medium' ? 'bg-[#DAD887] w-3/5' : 'bg-red-500 w-2/5'
                        }`}></div>
                      </div>
                    </div>
                  </div>

                  {/* Agent Outputs Grid */}
                  <div className="grid md:grid-cols-2 gap-6">
                    {/* Price Agent Output */}
                    {analysisData.agentOutputs?.priceData && (
                      <div className="bg-white rounded-xl shadow-sm border border-[#DAD887]/30 overflow-hidden">
                        <div className="bg-gradient-to-r from-[#75B06F]/20 to-[#F0F8A4]/30 px-6 py-4 border-b border-[#DAD887]/30">
                          <h3 className="text-lg font-bold text-[#36656B] flex items-center gap-2">
                            <span className="w-3 h-3 bg-[#75B06F] rounded-full"></span>
                            {analysisData.agentOutputs.priceData.data_source === 'AI_ESTIMATE' ? 'AI Price Estimates' : 'Mandi Price Data'}
                            {analysisData.agentOutputs.priceData.data_source === 'AI_ESTIMATE' && (
                              <span className="ml-auto px-2 py-1 rounded text-xs font-bold bg-[#F0F8A4] text-[#36656B]">AI</span>
                            )}
                          </h3>
                        </div>
                        <div className="p-6">
                          {analysisData.agentOutputs.priceData.data_source === 'AI_ESTIMATE' && analysisData.agentOutputs.priceData.ai_estimated_prices && (
                            <div className="space-y-3">
                              <div className="grid grid-cols-3 gap-2">
                                <div className="text-center p-2 bg-red-50 rounded-lg">
                                  <p className="text-lg font-bold text-red-600">₹{analysisData.agentOutputs.priceData.ai_estimated_prices.min_price?.toLocaleString()}</p>
                                  <p className="text-xs text-[#36656B]/60">Min</p>
                                </div>
                                <div className="text-center p-2 bg-[#F0F8A4]/40 rounded-lg">
                                  <p className="text-lg font-bold text-[#75B06F]">₹{analysisData.agentOutputs.priceData.ai_estimated_prices.modal_price?.toLocaleString()}</p>
                                  <p className="text-xs text-[#36656B]/60">Modal</p>
                                </div>
                                <div className="text-center p-2 bg-[#36656B]/10 rounded-lg">
                                  <p className="text-lg font-bold text-[#36656B]">₹{analysisData.agentOutputs.priceData.ai_estimated_prices.max_price?.toLocaleString()}</p>
                                  <p className="text-xs text-[#36656B]/60">Max</p>
                                </div>
                              </div>
                              {analysisData.agentOutputs.priceData.ai_estimated_prices.rationale && (
                                <p className="text-sm text-[#36656B]/80">{analysisData.agentOutputs.priceData.ai_estimated_prices.rationale}</p>
                              )}
                            </div>
                          )}
                          {analysisData.agentOutputs.priceData.data_source !== 'AI_ESTIMATE' && analysisData.agentOutputs.priceData.mandi_prices?.length > 0 && (
                            <div className="space-y-3">
                              {analysisData.agentOutputs.priceData.mandi_prices.slice(0, 3).map((m, i) => (
                                <div key={i} className="flex justify-between border-b border-[#DAD887]/30 pb-2">
                                  <span>{m.mandi_name}, {m.city}</span>
                                  <span className="font-bold text-[#75B06F]">₹{m.modal_price?.toLocaleString()}/qtl</span>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {/* News Agent Output */}
                    {analysisData.agentOutputs?.newsAnalysis && (
                      <div className="bg-white rounded-xl shadow-sm border border-[#DAD887]/30 overflow-hidden">
                        <div className="bg-gradient-to-r from-[#36656B]/10 to-[#F0F8A4]/30 px-6 py-4 border-b border-[#DAD887]/30">
                          <h3 className="text-lg font-bold text-[#36656B] flex items-center gap-2">
                            <span className="w-3 h-3 bg-[#36656B] rounded-full"></span>
                            News Analysis
                            <span className={`ml-auto px-2 py-1 rounded text-xs font-bold ${
                              analysisData.agentOutputs.newsAnalysis.overall_sentiment === 'bullish' ? 'bg-[#F0F8A4] text-[#75B06F]' :
                              analysisData.agentOutputs.newsAnalysis.overall_sentiment === 'bearish' ? 'bg-red-100 text-red-800' : 'bg-[#DAD887]/30 text-[#36656B]'
                            }`}>
                              {analysisData.agentOutputs.newsAnalysis.overall_sentiment?.toUpperCase() || 'NEUTRAL'}
                            </span>
                          </h3>
                        </div>
                        <div className="p-6">
                          {analysisData.agentOutputs.newsAnalysis.key_takeaway && (
                            <p className="text-[#36656B] mb-3">{analysisData.agentOutputs.newsAnalysis.key_takeaway}</p>
                          )}
                          <div className="space-y-2">
                            {analysisData.agentOutputs.newsAnalysis.news_items?.slice(0, 3).map((news, i) => (
                              <div key={i} className="text-sm border-l-2 border-[#75B06F] pl-3">
                                <p className="font-medium text-[#36656B]">{news.headline}</p>
                                <p className="text-[#36656B]/60 text-xs">{news.source} • {news.date}</p>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Weather Agent Output */}
                    {analysisData.agentOutputs?.weatherAnalysis && (
                      <div className="bg-white rounded-xl shadow-sm border border-[#DAD887]/30 overflow-hidden">
                        <div className="bg-gradient-to-r from-[#36656B]/10 to-[#75B06F]/20 px-6 py-4 border-b border-[#DAD887]/30">
                          <h3 className="text-lg font-bold text-[#36656B] flex items-center gap-2">
                            <span className="w-3 h-3 bg-[#36656B] rounded-full"></span>
                            Weather Impact
                          </h3>
                        </div>
                        <div className="p-6">
                          <div className="grid grid-cols-3 gap-3 mb-4">
                            <div className="text-center p-2 bg-[#DAD887]/30 rounded-lg">
                              <p className="text-xl font-bold text-[#36656B]">{analysisData.agentOutputs.weatherAnalysis.current_conditions?.temperature}</p>
                              <p className="text-xs text-[#36656B]/60">Temp</p>
                            </div>
                            <div className="text-center p-2 bg-[#F0F8A4]/40 rounded-lg">
                              <p className="text-xl font-bold text-[#75B06F]">{analysisData.agentOutputs.weatherAnalysis.current_conditions?.humidity}</p>
                              <p className="text-xs text-[#36656B]/60">Humidity</p>
                            </div>
                            <div className="text-center p-2 bg-[#36656B]/10 rounded-lg">
                              <p className="text-xl font-bold text-[#36656B]">{analysisData.agentOutputs.weatherAnalysis.current_conditions?.precipitation}</p>
                              <p className="text-xs text-[#36656B]/60">Rain</p>
                            </div>
                          </div>
                          <p className="text-sm text-[#36656B]/80">{analysisData.agentOutputs.weatherAnalysis.harvest_impact}</p>
                        </div>
                      </div>
                    )}

                    {/* Search Agent Output */}
                    {analysisData.agentOutputs?.searchInsights && (
                      <div className="bg-white rounded-xl shadow-sm border border-[#DAD887]/30 overflow-hidden">
                        <div className="bg-gradient-to-r from-[#DAD887]/30 to-[#F0F8A4]/40 px-6 py-4 border-b border-[#DAD887]/30">
                          <h3 className="text-lg font-bold text-[#36656B] flex items-center gap-2">
                            <span className="w-3 h-3 bg-[#DAD887] rounded-full"></span>
                            Market Intelligence
                          </h3>
                        </div>
                        <div className="p-6">
                          {analysisData.agentOutputs.searchInsights.demand_signals && (
                            <p className="text-sm text-[#36656B]/80 mb-2"><strong>Demand:</strong> {analysisData.agentOutputs.searchInsights.demand_signals}</p>
                          )}
                          {analysisData.agentOutputs.searchInsights.expert_forecasts && (
                            <p className="text-sm text-[#36656B]/80"><strong>Forecast:</strong> {analysisData.agentOutputs.searchInsights.expert_forecasts}</p>
                          )}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Key Factors */}
                  {analysisData.recommendation?.key_factors && Array.isArray(analysisData.recommendation.key_factors) && (
                    <div className="bg-white rounded-xl shadow-sm border border-[#DAD887]/30 overflow-hidden">
                      <div className="bg-gradient-to-r from-[#36656B]/10 to-[#75B06F]/20 px-6 py-4 border-b border-[#DAD887]/30">
                        <h3 className="text-lg font-bold text-[#36656B]">Key Decision Factors</h3>
                      </div>
                      <div className="p-6">
                        <div className="grid md:grid-cols-2 gap-4">
                          {analysisData.recommendation.key_factors.map((factor, idx) => (
                            <div key={idx} className="flex items-start gap-3 p-3 bg-[#F0F8A4]/20 rounded-lg">
                              <span className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold ${
                                factor.impact === 'positive' ? 'bg-[#F0F8A4] text-[#75B06F]' :
                                factor.impact === 'negative' ? 'bg-red-100 text-red-700' : 'bg-[#DAD887]/30 text-[#36656B]'
                              }`}>
                                {factor.impact === 'positive' ? '↑' : factor.impact === 'negative' ? '↓' : '→'}
                              </span>
                              <div>
                                <p className="font-semibold text-[#36656B]">{factor.factor}</p>
                                <p className="text-sm text-[#36656B]/70">{factor.explanation}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Scenarios */}
                  {analysisData.recommendation?.scenarios && (
                    <div className="bg-white rounded-xl shadow-sm border border-[#DAD887]/30 overflow-hidden">
                      <div className="bg-gradient-to-r from-[#36656B]/10 to-[#F0F8A4]/30 px-6 py-4 border-b border-[#DAD887]/30">
                        <h3 className="text-lg font-bold text-[#36656B]">Price Scenarios</h3>
                      </div>
                      <div className="p-6">
                        <div className="grid md:grid-cols-3 gap-4">
                          <div className="p-4 rounded-lg border-2 border-[#75B06F]/50 bg-[#F0F8A4]/30">
                            <div className="flex items-center gap-2 mb-2">
                              <TrendingUp className="w-5 h-5 text-[#75B06F]" />
                              <h4 className="font-semibold text-[#36656B]">Optimistic</h4>
                            </div>
                            <p className="text-2xl font-bold text-[#75B06F]">{analysisData.recommendation.scenarios.optimistic?.potential_price}</p>
                            <p className="text-sm text-[#36656B]/70">{analysisData.recommendation.scenarios.optimistic?.probability} probability</p>
                          </div>
                          <div className="p-4 rounded-lg border-2 border-[#36656B]/50 bg-[#36656B]/10">
                            <div className="flex items-center gap-2 mb-2">
                              <BarChart3 className="w-5 h-5 text-[#36656B]" />
                              <h4 className="font-semibold text-[#36656B]">Expected</h4>
                              <span className="text-xs bg-[#36656B] text-white px-2 py-0.5 rounded-full ml-auto">Most Likely</span>
                            </div>
                            <p className="text-2xl font-bold text-[#36656B]">{analysisData.recommendation.scenarios.expected?.potential_price}</p>
                            <p className="text-sm text-[#36656B]/70">{analysisData.recommendation.scenarios.expected?.probability} probability</p>
                          </div>
                          <div className="p-4 rounded-lg border-2 border-red-200 bg-red-50">
                            <div className="flex items-center gap-2 mb-2">
                              <TrendingDown className="w-5 h-5 text-red-600" />
                              <h4 className="font-semibold text-[#36656B]">Pessimistic</h4>
                            </div>
                            <p className="text-2xl font-bold text-red-600">{analysisData.recommendation.scenarios.pessimistic?.potential_price}</p>
                            <p className="text-sm text-[#36656B]/70">{analysisData.recommendation.scenarios.pessimistic?.probability} probability</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Action Plan */}
                  {analysisData.recommendation?.action_plan && (
                    <div className="bg-white rounded-xl shadow-sm border border-[#DAD887]/30 overflow-hidden">
                      <div className="bg-gradient-to-r from-[#75B06F]/20 to-[#F0F8A4]/30 px-6 py-4 border-b border-[#DAD887]/30">
                        <h3 className="text-lg font-bold text-[#36656B] flex items-center gap-2">
                          <ClipboardList className="w-5 h-5 text-[#75B06F]" />
                          Action Plan
                        </h3>
                      </div>
                      <div className="p-6 space-y-4">
                        <div className="flex items-start gap-3">
                          <span className="flex-shrink-0 w-8 h-8 bg-[#F0F8A4] text-[#75B06F] rounded-full flex items-center justify-center font-semibold">1</span>
                          <div>
                            <p className="font-semibold text-[#36656B]">Immediate Steps</p>
                            <p className="text-[#36656B]/70">{analysisData.recommendation.action_plan.immediate_steps}</p>
                          </div>
                        </div>
                        <div className="flex items-start gap-3">
                          <span className="flex-shrink-0 w-8 h-8 bg-[#36656B]/20 text-[#36656B] rounded-full flex items-center justify-center font-semibold">2</span>
                          <div>
                            <p className="font-semibold text-[#36656B]">What to Monitor</p>
                            <p className="text-[#36656B]/70">{analysisData.recommendation.action_plan.monitoring}</p>
                          </div>
                        </div>
                        <div className="flex items-start gap-3">
                          <span className="flex-shrink-0 w-8 h-8 bg-[#DAD887]/50 text-[#36656B] rounded-full flex items-center justify-center font-semibold">3</span>
                          <div>
                            <p className="font-semibold text-[#36656B]">Trigger Points</p>
                            <p className="text-[#36656B]/70">{analysisData.recommendation.action_plan.triggers}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Risk Factors */}
                  {analysisData.recommendation?.risk_factors && Array.isArray(analysisData.recommendation.risk_factors) && (
                    <div className="bg-white rounded-xl shadow-sm border border-[#DAD887]/30 overflow-hidden">
                      <div className="bg-gradient-to-r from-red-50 to-[#DAD887]/30 px-6 py-4 border-b border-[#DAD887]/30">
                        <h3 className="text-lg font-bold text-[#36656B] flex items-center gap-2">
                          <AlertTriangle className="w-5 h-5 text-red-500" />
                          Risk Factors
                        </h3>
                      </div>
                      <div className="p-6">
                        <ul className="space-y-2">
                          {analysisData.recommendation.risk_factors.map((risk, idx) => (
                            <li key={idx} className="flex items-start gap-2 text-[#36656B]/80">
                              <span className="text-[#DAD887]">•</span>
                              {risk}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  )}

                  {/* Timestamp */}
                  <div className="text-center text-sm text-[#36656B]/60">
                    Analysis completed at: {new Date().toLocaleString()}
                  </div>
                </div>
              )}

              {/* Initial State */}
              {!analysisData && !analysisLoading && !analysisError && (
                <div className="bg-white rounded-xl shadow-sm border border-[#DAD887]/30 p-12 text-center">
                  <div className="w-20 h-20 bg-[#F0F8A4]/50 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-10 h-10 text-[#36656B]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-semibold text-[#36656B] mb-2">Comprehensive Market Analysis</h3>
                  <p className="text-[#36656B]/70 mb-4">Get AI-powered recommendations by combining insights from 5 specialized agents</p>
                  <div className="flex flex-wrap justify-center gap-2 text-xs">
                    <span className="bg-[#F0F8A4]/50 text-[#75B06F] px-3 py-1 rounded-full flex items-center gap-1"><TrendingUp className="w-3 h-3" /> Price Analysis</span>
                    <span className="bg-[#36656B]/10 text-[#36656B] px-3 py-1 rounded-full flex items-center gap-1"><Newspaper className="w-3 h-3" /> News Impact</span>
                    <span className="bg-[#75B06F]/20 text-[#36656B] px-3 py-1 rounded-full flex items-center gap-1"><CloudSun className="w-3 h-3" /> Weather Analysis</span>
                    <span className="bg-[#DAD887]/40 text-[#36656B] px-3 py-1 rounded-full flex items-center gap-1"><Search className="w-3 h-3" /> Market Research</span>
                    <span className="bg-[#F0F8A4] text-[#36656B] px-3 py-1 rounded-full flex items-center gap-1"><Bot className="w-3 h-3" /> AI Synthesis</span>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Settings Tab (Placeholder) */}
          {activeTab === 'settings' && (
            <div className="bg-white rounded-xl shadow-sm border border-[#DAD887]/30 p-12 text-center">
              <svg className="w-16 h-16 mx-auto mb-4 text-[#DAD887]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <h3 className="text-lg font-semibold text-[#36656B] mb-2">System Settings</h3>
              <p className="text-[#36656B]/60">Configuration options will be available here</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

export default AdminDashboard;
