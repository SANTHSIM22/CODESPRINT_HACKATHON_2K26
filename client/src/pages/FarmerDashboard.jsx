import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useLanguage } from '../context/LanguageContext';
import LanguageSwitcher from '../components/LanguageSwitcher';

function FarmerDashboard() {
  const { t, language } = useLanguage();
  const [user, setUser] = useState(null);
  const [activeTab, setActiveTab] = useState('add-product');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [stats, setStats] = useState({
    totalListings: 0,
    activeOffers: 0,
    totalRevenue: 0,
    monthlyGrowth: 0
  });
  
  const [productForm, setProductForm] = useState({
    name: '',
    category: '',
    quantity: '',
    unit: 'kg',
    price: '',
    description: '',
    harvestDate: '',
    location: '',
    imageUrl: '',
    imageFile: null
  });
  
  const [imagePreview, setImagePreview] = useState(null);
  const [uploadType, setUploadType] = useState('upload');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [products, setProducts] = useState([]);
  const [productsLoading, setProductsLoading] = useState(false);
  const [editingProductId, setEditingProductId] = useState(null);
  
  // AI Search States
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResult, setSearchResult] = useState(null);
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchError, setSearchError] = useState('');
  
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
  
  // Orders States
  const [orders, setOrders] = useState([]);
  const [ordersLoading, setOrdersLoading] = useState(false);
  
  const navigate = useNavigate();

  useEffect(() => {
    const userData = JSON.parse(localStorage.getItem('user'));
    const token = localStorage.getItem('token');
    
    if (!userData || !token || userData.userType !== 'farmer') {
      navigate('/login');
      return;
    }
    
    setUser(userData);
    fetchProducts(token);
    // Fetch orders first to calculate revenue, then dashboard data
    fetchOrdersAndStats(token);
  }, [navigate]);

  const fetchOrdersAndStats = async (token) => {
    // First fetch orders to calculate revenue
    setOrdersLoading(true);
    try {
      const ordersResponse = await axios.get('http://localhost:5000/api/orders/farmer', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const fetchedOrders = ordersResponse.data.orders || [];
      setOrders(fetchedOrders);
      
      // Calculate total revenue from paid orders
      const paidRevenue = fetchedOrders
        .filter(order => order.paymentStatus === 'completed')
        .reduce((sum, order) => sum + (order.totalAmount || 0), 0);
      
      // Then fetch dashboard stats and merge with revenue
      const dashboardResponse = await axios.get('http://localhost:5000/api/farmer/dashboard', {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setStats({
        ...dashboardResponse.data.stats,
        totalRevenue: paidRevenue
      });
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setOrdersLoading(false);
    }
  };

  const fetchDashboardData = async (token) => {
    try {
      const response = await axios.get('http://localhost:5000/api/farmer/dashboard', {
        headers: { Authorization: `Bearer ${token}` }
      });
      // Preserve revenue when updating stats
      setStats(prevStats => ({
        ...response.data.stats,
        totalRevenue: prevStats.totalRevenue
      }));
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    }
  };

  const fetchProducts = async (token) => {
    setProductsLoading(true);
    try {
      const response = await axios.get('http://localhost:5000/api/farmer/products', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setProducts(response.data.products || []);
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setProductsLoading(false);
    }
  };

  const fetchOrders = async (token) => {
    setOrdersLoading(true);
    try {
      const response = await axios.get('http://localhost:5000/api/orders/farmer', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const fetchedOrders = response.data.orders || [];
      setOrders(fetchedOrders);
      
      // Calculate total revenue from paid orders
      const paidRevenue = fetchedOrders
        .filter(order => order.paymentStatus === 'completed')
        .reduce((sum, order) => sum + (order.totalAmount || 0), 0);
      
      setStats(prevStats => ({
        ...prevStats,
        totalRevenue: paidRevenue
      }));
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      setOrdersLoading(false);
    }
  };

  const updateOrderStatus = async (orderId, newStatus) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.put(
        `http://localhost:5000/api/orders/${orderId}/status`,
        { status: newStatus },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      // Show payment message if order is delivered
      if (newStatus === 'delivered' && response.data.message) {
        alert(response.data.message);
      }
      
      fetchOrders(token);
    } catch (error) {
      console.error('Error updating order status:', error);
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    navigate('/login');
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setProductForm({ ...productForm, [name]: value || '' });
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setMessage({ type: 'error', text: 'Image size should be less than 5MB' });
        return;
      }
      
      setProductForm({ ...productForm, imageFile: file });
      
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleImageUrlChange = (e) => {
    const url = e.target.value;
    setProductForm({ ...productForm, imageUrl: url });
    if (url) {
      setImagePreview(url);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: '', text: '' });

    try {
      const token = localStorage.getItem('token');
      let imageData = productForm.imageUrl;

      if (uploadType === 'upload' && productForm.imageFile) {
        const reader = new FileReader();
        imageData = await new Promise((resolve) => {
          reader.onloadend = () => resolve(reader.result);
          reader.readAsDataURL(productForm.imageFile);
        });
      }

      const productData = {
        name: productForm.name,
        category: productForm.category,
        quantity: parseFloat(productForm.quantity),
        unit: productForm.unit,
        price: parseFloat(productForm.price),
        description: productForm.description,
        harvestDate: productForm.harvestDate,
        location: productForm.location,
        image: imageData
      };

      if (editingProductId) {
        await axios.put(
          `http://localhost:5000/api/farmer/products/${editingProductId}`,
          productData,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setMessage({ type: 'success', text: 'Product updated successfully!' });
        setEditingProductId(null);
      } else {
        await axios.post(
          'http://localhost:5000/api/farmer/products',
          productData,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setMessage({ type: 'success', text: 'Product added successfully!' });
      }
      
      setProductForm({
        name: '',
        category: '',
        quantity: '',
        unit: 'kg',
        price: '',
        description: '',
        harvestDate: '',
        location: '',
        imageUrl: '',
        imageFile: null
      });
      setImagePreview(null);
      
      fetchDashboardData(token);
      fetchProducts(token);
    } catch (error) {
      setMessage({ 
        type: 'error', 
        text: error.response?.data?.error || 'Failed to add product' 
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteProduct = async (productId) => {
    if (!window.confirm('Are you sure you want to delete this product?')) return;
    
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`http://localhost:5000/api/farmer/products/${productId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      fetchProducts(token);
      fetchDashboardData(token);
      setMessage({ type: 'success', text: 'Product deleted successfully!' });
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to delete product' });
    }
  };

  const handleEditProduct = (product) => {
    setProductForm({
      name: product.name,
      category: product.category,
      quantity: product.quantity.toString(),
      unit: product.unit,
      price: product.price.toString(),
      description: product.description || '',
      harvestDate: product.harvestDate ? product.harvestDate.split('T')[0] : '',
      location: product.location,
      imageUrl: product.image || '',
      imageFile: null
    });
    setImagePreview(product.image || null);
    setUploadType('url');
    setEditingProductId(product._id);
    setActiveTab('add-product');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCancelEdit = () => {
    setEditingProductId(null);
    setProductForm({
      name: '',
      category: '',
      quantity: '',
      unit: 'kg',
      price: '',
      description: '',
      harvestDate: '',
      location: '',
      imageUrl: '',
      imageFile: null
    });
    setImagePreview(null);
  };

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-[#75B06F] border-t-transparent mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <aside className={`fixed lg:static inset-y-0 left-0 z-50 w-72 bg-white border-r border-gray-200 transform transition-transform duration-300 ease-in-out ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}>
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="absolute inset-0 bg-[#75B06F] rounded-xl blur-lg opacity-30"></div>
                <svg className="w-10 h-10 relative" viewBox="0 0 24 24" fill="none">
                  <path d="M12 2L13.09 8.26L19 6L14.74 10.91L21 12L14.74 13.09L19 18L13.09 15.74L12 22L10.91 15.74L5 18L9.26 13.09L3 12L9.26 10.91L5 6L10.91 8.26L12 2Z" fill="#75B06F"/>
                </svg>
              </div>
              <span className="text-xl font-bold text-[#36656B]">AuraFarm</span>
            </div>
            <button 
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* User Profile */}
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-12 h-12 bg-[#36656B] rounded-full flex items-center justify-center text-white font-bold text-lg shadow-lg">
                {user.name.charAt(0).toUpperCase()}
              </div>
              <div>
                <p className="font-semibold text-gray-900">{user.name}</p>
                <p className="text-sm text-gray-500">Farmer Account</p>
              </div>
            </div>
            <div className="flex items-center gap-2 text-xs text-gray-500">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              {user.location || 'Location not set'}
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
            {[
              { id: 'add-product', label: t('farmer.addProduct'), icon: 'M12 4v16m8-8H4' },
              { id: 'my-products', label: t('farmer.myProducts'), icon: 'M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4' },
              { id: 'ask-ai', label: t('farmer.aiSearch'), icon: 'M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z' },
              { id: 'weather', label: t('farmer.weather'), icon: 'M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z' },
              { id: 'orders', label: t('farmer.orders'), icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2' },
              { id: 'price-insights', label: t('farmer.priceInsights'), icon: 'M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z' },
              { id: 'analysis-reports', label: t('farmer.marketAnalysis'), icon: 'M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z' },
              { id: 'messages', label: 'Messages', icon: 'M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z',  },
              { id: 'settings', label: 'Settings', icon: 'M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z M15 12a3 3 0 11-6 0 3 3 0 016 0z' }
            ].map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                  activeTab === item.id
                    ? 'bg-[#75B06F] text-white shadow-lg'
                    : 'text-[#36656B] hover:bg-[#F0F8A4]'
                }`}
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={item.icon} />
                </svg>
                <span className="font-semibold">{item.label}</span>
                {item.badge && (
                  <span className="ml-auto bg-red-500 text-white text-xs px-2 py-1 rounded-full">{item.badge}</span>
                )}
              </button>
            ))}
          </nav>

          {/* Logout */}
          <div className="p-4 border-t border-gray-200">
            <LanguageSwitcher />
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-red-600 hover:bg-red-50 transition-all mt-2"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              <span className="font-semibold">{t('farmer.logout')}</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Top Header */}
        <header className="bg-white border-b border-gray-200 px-6 py-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  {activeTab === 'add-product' && t('farmer.addNewProduct')}
                  {activeTab === 'my-products' && t('farmer.myProductsList')}
                  {activeTab === 'ask-ai' && t('farmer.aiSearchTitle')}
                  {activeTab === 'weather' && t('farmer.weatherTitle')}
                  {activeTab === 'orders' && t('farmer.ordersTitle')}
                  {activeTab === 'price-insights' && t('farmer.priceInsightsTitle')}
                  {activeTab === 'analysis-reports' && t('farmer.marketAnalysisTitle')}
                  {activeTab === 'messages' && 'Messages'}
                  {activeTab === 'settings' && 'Settings'}
                </h1>
                <p className="text-sm text-gray-500">Get comprehensive price recommendations using 5 AI agents analyzing prices, news, weather, and market trends</p>
              </div>
            </div>

            {/* Stats Summary */}
            <div className="hidden md:flex items-center gap-6">
              <div className="text-center px-4 py-2 bg-[#F0F8A4] rounded-xl">
                <p className="text-2xl font-bold text-[#36656B]">{stats.totalListings}</p>
                <p className="text-xs text-gray-600">{t('farmer.totalListings')}</p>
              </div>
              <div className="text-center px-4 py-2 bg-[#DAD887] rounded-xl">
                <p className="text-2xl font-bold text-[#36656B]">{stats.activeOffers}</p>
                <p className="text-xs text-gray-600">{t('farmer.activeOffers')}</p>
              </div>
              <div className="text-center px-4 py-2 bg-[#75B06F] rounded-xl">
                <p className="text-2xl font-bold text-white">₹{stats.totalRevenue.toLocaleString()}</p>
                <p className="text-xs text-white/90">{t('farmer.totalRevenue')}</p>
              </div>
            </div>
          </div>
        </header>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-6">
          {/* Message Alert */}
          {message.text && (
            <div className={`mb-6 p-4 rounded-xl flex items-center gap-3 animate-fade-in ${
              message.type === 'success' 
                ? 'bg-[#F0F8A4] text-[#36656B] border border-[#DAD887]' 
                : 'bg-red-50 text-red-800 border border-red-200'
            }`}>
              {message.type === 'success' ? (
                <svg className="w-5 h-5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              ) : (
                <svg className="w-5 h-5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              )}
              <span className="font-medium">{message.text}</span>
              <button 
                onClick={() => setMessage({ type: '', text: '' })}
                className="ml-auto p-1 hover:bg-black/10 rounded-lg transition-colors"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          )}

          {/* Add Product Tab */}
          {activeTab === 'add-product' && (
            <div className="max-w-5xl mx-auto">
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Product Image Upload */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
                  <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <svg className="w-5 h-5 text-[#75B06F]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    Product Image
                  </h3>
                  
                  {/* Upload Type Toggle */}
                  <div className="flex gap-2 mb-4">
                    <button
                      type="button"
                      onClick={() => setUploadType('upload')}
                      className={`flex-1 py-3 px-4 rounded-xl font-semibold transition-all ${
                        uploadType === 'upload'
                          ? 'bg-[#75B06F] text-white shadow-lg'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      <span className="flex items-center justify-center gap-2">
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                        </svg>
                        Upload Image
                      </span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setUploadType('url')}
                      className={`flex-1 py-3 px-4 rounded-xl font-semibold transition-all ${
                        uploadType === 'url'
                          ? 'bg-[#75B06F] text-white shadow-lg'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      <span className="flex items-center justify-center gap-2">
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                        </svg>
                        Image URL
                      </span>
                    </button>
                  </div>

                  {uploadType === 'upload' ? (
                    <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center hover:border-green-500 transition-colors cursor-pointer group">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="hidden"
                        id="image-upload"
                      />
                      <label htmlFor="image-upload" className="cursor-pointer block">
                        {imagePreview ? (
                          <div className="space-y-4">
                            <img
                              src={imagePreview}
                              alt="Preview"
                              className="max-h-64 mx-auto rounded-lg shadow-lg object-cover"
                            />
                            <p className="text-sm text-[#75B06F] font-semibold group-hover:underline">Click to change image</p>
                          </div>
                        ) : (
                          <div className="space-y-3">
                            <div className="w-20 h-20 mx-auto bg-[#F0F8A4] rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                              <svg className="w-10 h-10 text-[#75B06F]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                              </svg>
                            </div>
                            <div>
                              <p className="text-gray-700 font-semibold mb-1">Click to upload image</p>
                              <p className="text-sm text-gray-500">PNG, JPG, WEBP up to 5MB</p>
                            </div>
                          </div>
                        )}
                      </label>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <input
                        type="url"
                        placeholder="https://example.com/image.jpg"
                        value={productForm.imageUrl}
                        onChange={handleImageUrlChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#75B06F] focus:border-transparent transition-all"
                      />
                      {imagePreview && (
                        <div className="relative">
                          <img
                            src={imagePreview}
                            alt="Preview"
                            className="max-h-64 mx-auto rounded-lg shadow-lg object-cover"
                            onError={() => setImagePreview(null)}
                          />
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Product Details */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
                  <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <svg className="w-5 h-5 text-[#75B06F]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                    Product Details
                  </h3>
                  
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Product Name <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        name="name"
                        value={productForm.name}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#75B06F] focus:border-transparent transition-all"
                        placeholder="e.g., Organic Tomatoes"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Category <span className="text-red-500">*</span>
                      </label>
                      <select
                        name="category"
                        value={productForm.category}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#75B06F] focus:border-transparent transition-all appearance-none bg-white"
                        required
                      >
                        <option value="">Select category</option>
                        <option value="vegetables">Vegetables</option>
                        <option value="fruits">Fruits</option>
                        <option value="grains">Grains</option>
                        <option value="dairy">Dairy</option>
                        <option value="pulses">Pulses</option>
                        <option value="spices">Spices</option>
                        <option value="others">Others</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Quantity <span className="text-red-500">*</span>
                      </label>
                      <div className="flex gap-2">
                        <input
                          type="number"
                          name="quantity"
                          value={productForm.quantity}
                          onChange={handleInputChange}
                          className="flex-1 px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#75B06F] focus:border-transparent transition-all"
                          placeholder="100"
                          required
                          min="0"
                          step="0.01"
                        />
                        <select
                          name="unit"
                          value={productForm.unit}
                          onChange={handleInputChange}
                          className="w-28 px-3 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#75B06F] focus:border-transparent transition-all appearance-none bg-white"
                        >
                          <option value="kg">kg</option>
                          <option value="quintal">quintal</option>
                          <option value="ton">ton</option>
                          <option value="litre">litre</option>
                          <option value="piece">piece</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Price per Unit (₹) <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 font-medium">₹</span>
                        <input
                          type="number"
                          name="price"
                          value={productForm.price}
                          onChange={handleInputChange}
                          className="w-full pl-8 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#75B06F] focus:border-transparent transition-all"
                          placeholder="50"
                          required
                          min="0"
                          step="0.01"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Harvest Date <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="date"
                        name="harvestDate"
                        value={productForm.harvestDate}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Location <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        name="location"
                        value={productForm.location}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                        placeholder="City, State"
                        required
                      />
                    </div>
                  </div>

                  <div className="mt-4">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Description
                    </label>
                    <textarea
                      name="description"
                      value={productForm.description}
                      onChange={handleInputChange}
                      rows="4"
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#75B06F] focus:border-transparent resize-none transition-all"
                      placeholder="Describe your product quality, farming practices, certifications, etc."
                    ></textarea>
                  </div>
                </div>

                {/* Submit Button */}
                <div className="flex gap-4">
                  {editingProductId && (
                    <button
                      type="button"
                      onClick={handleCancelEdit}
                      className="px-6 bg-gray-200 text-gray-700 py-4 rounded-xl font-bold text-lg hover:bg-gray-300 transition-all"
                    >
                      Cancel
                    </button>
                  )}
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex-1 bg-[#75B06F] text-white py-4 rounded-xl font-bold text-lg hover:bg-[#36656B] hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {loading ? (
                      <>
                        <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        {editingProductId ? 'Updating Product...' : 'Adding Product...'}
                      </>
                    ) : (
                      <>
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={editingProductId ? "M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" : "M12 4v16m8-8H4"} />
                        </svg>
                        {editingProductId ? 'Update Product' : 'Add Product'}
                      </>
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setProductForm({
                        name: '',
                        category: '',
                        quantity: '',
                        unit: 'kg',
                        price: '',
                        description: '',
                        harvestDate: '',
                        location: '',
                        imageUrl: '',
                        imageFile: null
                      });
                      setImagePreview(null);
                      setMessage({ type: '', text: '' });
                    }}
                    className="px-8 py-4 border-2 border-gray-300 text-gray-700 rounded-xl font-bold hover:bg-gray-50 transition-all"
                  >
                    Reset
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* My Products Tab */}
          {activeTab === 'my-products' && (
            <div>
              {productsLoading ? (
                <div className="flex items-center justify-center py-20">
                  <div className="animate-spin rounded-full h-12 w-12 border-4 border-[#75B06F] border-t-transparent"></div>
                </div>
              ) : products.length === 0 ? (
                <div className="text-center py-20 bg-white rounded-2xl shadow-sm border border-gray-200">
                  <div className="w-24 h-24 mx-auto mb-6 bg-gray-100 rounded-full flex items-center justify-center">
                    <svg className="w-12 h-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">No Products Yet</h3>
                  <p className="text-gray-500 mb-6">Start by adding your first product listing</p>
                  <button
                    onClick={() => setActiveTab('add-product')}
                    className="inline-flex items-center gap-2 bg-[#75B06F] text-white px-6 py-3 rounded-xl font-semibold hover:bg-[#36656B] transition-all"
                  >
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    Add Your First Product
                  </button>
                </div>
              ) : (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {products.map((product) => (
                    <div key={product._id} className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-lg transition-all group">
                      <div className="relative h-48 bg-gray-100">
                        {product.image ? (
                          <img
                            src={product.image}
                            alt={product.name}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <svg className="w-16 h-16 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                          </div>
                        )}
                        <div className="absolute top-3 right-3">
                          <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                            product.status === 'active' 
                              ? 'bg-green-100 text-green-700' 
                              : 'bg-gray-100 text-gray-700'
                          }`}>
                            {product.status || 'Active'}
                          </span>
                        </div>
                      </div>
                      <div className="p-5">
                        <div className="flex items-start justify-between mb-2">
                          <h3 className="font-bold text-gray-900 text-lg">{product.name}</h3>
                          <span className="text-[#75B06F] font-bold">₹{product.price}/{product.unit}</span>
                        </div>
                        <p className="text-sm text-gray-500 mb-3 capitalize">{product.category}</p>
                        <div className="flex items-center gap-4 text-sm text-gray-600 mb-4">
                          <span className="flex items-center gap-1">
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3" />
                            </svg>
                            {product.quantity} {product.unit}
                          </span>
                          <span className="flex items-center gap-1">
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                            </svg>
                            {product.location}
                          </span>
                        </div>
                        <div className="flex gap-2">
                          <button 
                            onClick={() => handleEditProduct(product)}
                            className="flex-1 py-2 px-4 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition-colors"
                          >
                            Edit
                          </button>
                          <button 
                            onClick={() => handleDeleteProduct(product._id)}
                            className="py-2 px-4 bg-red-50 text-red-600 rounded-lg font-medium hover:bg-red-100 transition-colors"
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Orders Tab */}
          {activeTab === 'orders' && (
            <div className="space-y-6">
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-xl font-bold text-[#36656B]">Received Orders</h2>
                    <p className="text-gray-500 text-sm mt-1">Manage and track orders from buyers</p>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <span className="font-medium">{orders.length}</span> total orders
                  </div>
                </div>
              </div>

              {ordersLoading ? (
                <div className="text-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-4 border-[#75B06F] border-t-transparent mx-auto"></div>
                </div>
              ) : orders.length === 0 ? (
                <div className="text-center py-16 bg-white rounded-xl shadow-sm border border-gray-200">
                  <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                    <svg className="w-8 h-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-700 mb-1">No Orders Yet</h3>
                  <p className="text-gray-500 text-sm">Orders will appear here when buyers purchase your products</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {orders.map((order) => (
                    <div key={order._id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                      {/* Order Header */}
                      <div className="bg-gray-50 px-6 py-4 border-b border-gray-200 flex flex-wrap items-center justify-between gap-4">
                        <div className="flex items-center gap-6">
                          <div>
                            <p className="text-xs text-gray-500 uppercase tracking-wide">Order ID</p>
                            <p className="font-mono font-semibold text-[#36656B]">{order._id.slice(-8).toUpperCase()}</p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-500 uppercase tracking-wide">Buyer</p>
                            <p className="font-medium text-gray-700">{order.buyerName}</p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-500 uppercase tracking-wide">Amount</p>
                            <p className="font-semibold text-[#36656B]">₹{order.totalAmount?.toLocaleString()}</p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-500 uppercase tracking-wide">Date</p>
                            <p className="font-medium text-gray-700">{new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className={`px-3 py-1 rounded-md font-medium text-xs uppercase tracking-wide ${
                            order.status === 'delivered' ? 'bg-green-100 text-green-700' :
                            order.status === 'shipped' ? 'bg-indigo-100 text-indigo-700' :
                            order.status === 'processing' ? 'bg-purple-100 text-purple-700' :
                            order.status === 'confirmed' ? 'bg-blue-100 text-blue-700' :
                            'bg-yellow-100 text-yellow-700'
                          }`}>
                            {order.status}
                          </span>
                          {order.status === 'delivered' && (
                            <span className={`px-3 py-1 rounded-md font-medium text-xs uppercase tracking-wide ${
                              order.paymentStatus === 'completed' 
                                ? 'bg-green-50 text-green-700 border border-green-200' 
                                : 'bg-amber-50 text-amber-700 border border-amber-200'
                            }`}>
                              {order.paymentStatus === 'completed' ? 'Payment Received' : 'Awaiting Payment'}
                            </span>
                          )}
                        </div>
                      </div>
                      
                      {/* Payment Status Banner for Delivered Orders */}
                      {order.status === 'delivered' && (
                        <div className={`px-6 py-3 border-b ${
                          order.paymentStatus === 'completed' 
                            ? 'bg-green-50 border-green-200' 
                            : 'bg-amber-50 border-amber-200'
                        }`}>
                          <div className="flex items-center gap-2">
                            <svg className={`w-5 h-5 ${order.paymentStatus === 'completed' ? 'text-green-600' : 'text-amber-600'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              {order.paymentStatus === 'completed' ? (
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                              ) : (
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                              )}
                            </svg>
                            <p className={`text-sm font-medium ${order.paymentStatus === 'completed' ? 'text-green-700' : 'text-amber-700'}`}>
                              {order.paymentStatus === 'completed' 
                                ? `Payment of ₹${order.totalAmount?.toLocaleString()} has been released to your account`
                                : 'Awaiting buyer payment confirmation'
                              }
                            </p>
                          </div>
                        </div>
                      )}
                      
                      {/* Order Items */}
                      <div className="p-6">
                        <div className="grid gap-3 mb-4">
                          {order.items?.map((item, index) => (
                            <div key={index} className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg border border-gray-100">
                              <div className="w-14 h-14 rounded-lg overflow-hidden bg-gray-200 flex-shrink-0">
                                {item.image ? (
                                  <img src={item.image} alt={item.productName} className="w-full h-full object-cover" />
                                ) : (
                                  <div className="w-full h-full flex items-center justify-center text-gray-400">
                                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                    </svg>
                                  </div>
                                )}
                              </div>
                              <div className="flex-1">
                                <h4 className="font-semibold text-gray-800">{item.productName}</h4>
                                <p className="text-sm text-gray-500">{item.quantity} {item.unit} × ₹{item.price}</p>
                              </div>
                              <p className="font-semibold text-gray-800">₹{(item.quantity * item.price).toLocaleString()}</p>
                            </div>
                          ))}
                        </div>
                        
                        {/* Shipping Details */}
                        <div className="pt-4 border-t border-gray-200 mb-4">
                          <div className="flex items-start gap-2">
                            <svg className="w-5 h-5 text-gray-400 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                            <div>
                              <p className="text-sm font-medium text-gray-700">Shipping Address</p>
                              <p className="text-sm text-gray-500">{order.shippingAddress}</p>
                              <p className="text-sm text-gray-500">Contact: {order.contactNumber}</p>
                            </div>
                          </div>
                        </div>

                        {/* Action Buttons */}
                        {order.status !== 'delivered' && order.status !== 'cancelled' && (
                          <div className="flex gap-2 flex-wrap">
                            {order.status === 'confirmed' && (
                              <button
                                onClick={() => updateOrderStatus(order._id, 'processing')}
                                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md font-medium text-sm hover:bg-gray-200 transition-colors border border-gray-200"
                              >
                                Start Processing
                              </button>
                            )}
                            {order.status === 'processing' && (
                              <button
                                onClick={() => updateOrderStatus(order._id, 'shipped')}
                                className="px-4 py-2 bg-gray-800 text-white rounded-md font-medium text-sm hover:bg-gray-900 transition-colors"
                              >
                                Mark as Shipped
                              </button>
                            )}
                            {order.status === 'shipped' && (
                              <button
                                onClick={() => updateOrderStatus(order._id, 'delivered')}
                                className="px-4 py-2 bg-[#36656B] text-white rounded-md font-medium text-sm hover:bg-[#2a5055] transition-colors"
                              >
                                Mark as Delivered
                              </button>
                            )}
                          </div>
                        )}
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
              {/* <div className="bg-[#75B06F] rounded-2xl p-6 text-white">
                <div className="flex items-center gap-3 mb-2">
                  <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <h2 className="text-2xl font-bold">Price Insights</h2>
                </div>
                <p className="text-white/90">Get real-time mandi prices, market analysis and selling recommendations for </p>
              </div> */}

              {/* Search Form */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4">Find Best Prices for Your Crop</h3>
                <form onSubmit={async (e) => {
                  e.preventDefault();
                  if (!priceInsightsCrop.trim() || !priceInsightsLocation.trim()) return;
                  
                  setPriceInsightsLoading(true);
                  setPriceInsightsError('');
                  setPriceInsightsData(null);
                  
                  try {
                    const token = localStorage.getItem('token');
                    const response = await axios.post('http://localhost:5000/api/agents/price-insights', 
                      { cropType: priceInsightsCrop, location: priceInsightsLocation, language },
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
                      <label className="block text-sm font-medium text-gray-700 mb-2">{t('farmer.cropCommodity')}</label>
                      <input
                        type="text"
                        value={priceInsightsCrop}
                        onChange={(e) => setPriceInsightsCrop(e.target.value)}
                        placeholder={t('farmer.cropCommodityPlaceholder')}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">{t('farmer.yourLocation')}</label>
                      <input
                        type="text"
                        value={priceInsightsLocation}
                        onChange={(e) => setPriceInsightsLocation(e.target.value)}
                        placeholder={t('farmer.yourLocationPlaceholder')}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500"
                        required
                      />
                    </div>
                  </div>
                  <button
                    type="submit"
                    disabled={priceInsightsLoading || !priceInsightsCrop.trim() || !priceInsightsLocation.trim()}
                    className="w-full md:w-auto px-8 py-3 bg-[#75B06F] text-white font-semibold rounded-xl hover:bg-[#36656B] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {priceInsightsLoading ? (
                      <>
                        <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        {t('farmer.fetchingPrices')}
                      </>
                    ) : (
                      <>
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                        {t('farmer.getPriceInsights')}
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
                  <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
                    <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                      <svg className="w-6 h-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                      </svg>
                      Market Summary - {priceInsightsData.crop}
                    </h3>
                    
                    <div className="grid md:grid-cols-3 gap-4 mb-6">
                      {/* Your Location Price */}
                      <div className="bg-blue-50 rounded-xl p-4 border border-blue-100">
                        <p className="text-sm text-blue-600 font-medium mb-1">Your Nearest Mandi</p>
                        <p className="text-2xl font-bold text-blue-900">
                          {priceInsightsData.market_summary?.your_location?.price_display || 'N/A'}
                        </p>
                        <p className="text-sm text-blue-700">
                          {priceInsightsData.market_summary?.your_location?.nearest_mandi}, {priceInsightsData.market_summary?.your_location?.city}
                        </p>
                      </div>
                      
                      {/* Highest Price */}
                      <div className="bg-green-50 rounded-xl p-4 border border-green-100">
                        <p className="text-sm text-green-600 font-medium mb-1">Highest Price</p>
                        <p className="text-2xl font-bold text-green-900">
                          ₹{priceInsightsData.market_summary?.regional_prices?.highest_price?.price || 0}/quintal
                        </p>
                        <p className="text-sm text-green-700">
                          {priceInsightsData.market_summary?.regional_prices?.highest_price?.mandi}, {priceInsightsData.market_summary?.regional_prices?.highest_price?.city}
                        </p>
                      </div>
                      
                      {/* Average Price */}
                      <div className="bg-purple-50 rounded-xl p-4 border border-purple-100">
                        <p className="text-sm text-purple-600 font-medium mb-1">Regional Average</p>
                        <p className="text-2xl font-bold text-purple-900">
                          {priceInsightsData.market_summary?.regional_prices?.average_display || 'N/A'}
                        </p>
                        <p className="text-sm text-purple-700">
                          Variation: {priceInsightsData.market_summary?.price_variation?.percentage || '0%'}
                        </p>
                      </div>
                    </div>

                    {/* Price Variation Interpretation */}
                    <div className="bg-gray-50 rounded-xl p-4">
                      <p className="text-gray-700">
                        <span className="font-semibold">Market Status: </span>
                        {priceInsightsData.market_summary?.price_variation?.interpretation || 'No data available'}
                      </p>
                    </div>
                  </div>

                  {/* Selling Guidance */}
                  <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
                    <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                      <svg className="w-6 h-6 text-orange-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                      </svg>
                      Selling Guidance
                    </h3>
                    
                    <div className="grid md:grid-cols-2 gap-6">
                      {/* Best Market */}
                      <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-5 border border-green-100">
                        <div className="flex items-start gap-3">
                          <div className="w-10 h-10 bg-green-500 rounded-lg flex items-center justify-center flex-shrink-0">
                            <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                          </div>
                          <div>
                            <p className="font-bold text-green-900 mb-1">Best Market to Sell</p>
                            <p className="text-green-800">{priceInsightsData.selling_guidance?.best_market?.recommendation || 'N/A'}</p>
                            <p className="text-sm text-green-600 mt-2">
                              Expected: ₹{priceInsightsData.selling_guidance?.best_market?.expected_price || 0}/quintal
                            </p>
                          </div>
                        </div>
                      </div>
                      
                      {/* Price Advantage */}
                      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-5 border border-blue-100">
                        <div className="flex items-start gap-3">
                          <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center flex-shrink-0">
                            <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                          </div>
                          <div>
                            <p className="font-bold text-blue-900 mb-1">Extra Earning Potential</p>
                            <p className="text-2xl font-bold text-blue-800">
                              {priceInsightsData.selling_guidance?.price_advantage?.extra_earning || '₹0/quintal'}
                            </p>
                            <p className="text-sm text-blue-600">
                              {priceInsightsData.selling_guidance?.price_advantage?.percentage_gain || '0%'} more than local
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Timing & Quality Tips */}
                    <div className="grid md:grid-cols-2 gap-4 mt-4">
                      <div className="bg-yellow-50 rounded-xl p-4 border border-yellow-100">
                        <p className="font-semibold text-yellow-900 mb-1"> Timing Advice</p>
                        <p className="text-yellow-800">{priceInsightsData.selling_guidance?.timing_advice?.advice || 'N/A'}</p>
                        <p className="text-sm text-yellow-600 mt-1">{priceInsightsData.selling_guidance?.timing_advice?.reason || ''}</p>
                      </div>
                      <div className="bg-pink-50 rounded-xl p-4 border border-pink-100">
                        <p className="font-semibold text-pink-900 mb-1"> Quality Tips</p>
                        <p className="text-pink-800 text-sm">{priceInsightsData.selling_guidance?.quality_tips?.tip || 'N/A'}</p>
                        <p className="text-sm text-pink-600 mt-1">
                          Premium potential: {priceInsightsData.selling_guidance?.quality_tips?.premium_potential || 'N/A'}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Market Intelligence */}
                  <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
                    <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                      <svg className="w-6 h-6 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                      </svg>
                      Market Intelligence
                    </h3>
                    
                    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
                      {/* Market Condition */}
                      <div className="bg-gray-50 rounded-xl p-4">
                        <p className="text-sm text-gray-500 mb-1">Market Condition</p>
                        <p className={`font-bold text-lg ${
                          priceInsightsData.market_intelligence?.market_condition?.status === 'Stable' ? 'text-green-600' :
                          priceInsightsData.market_intelligence?.market_condition?.status === 'Volatile' ? 'text-red-600' : 'text-yellow-600'
                        }`}>
                          {priceInsightsData.market_intelligence?.market_condition?.status || 'Unknown'}
                        </p>
                      </div>
                      
                      {/* Trend */}
                      <div className="bg-gray-50 rounded-xl p-4">
                        <p className="text-sm text-gray-500 mb-1">Price Trend</p>
                        <p className={`font-bold text-lg flex items-center gap-1 ${
                          priceInsightsData.market_intelligence?.trend_indicator?.direction === 'rising' ? 'text-green-600' :
                          priceInsightsData.market_intelligence?.trend_indicator?.direction === 'falling' ? 'text-red-600' : 'text-gray-600'
                        }`}>
                          {priceInsightsData.market_intelligence?.trend_indicator?.direction === 'rising' && '↑'}
                          {priceInsightsData.market_intelligence?.trend_indicator?.direction === 'falling' && '↓'}
                          {priceInsightsData.market_intelligence?.trend_indicator?.direction === 'stable' && '→'}
                          {priceInsightsData.market_intelligence?.trend_indicator?.direction || 'Unknown'}
                        </p>
                      </div>
                      
                      {/* Arbitrage */}
                      <div className="bg-gray-50 rounded-xl p-4">
                        <p className="text-sm text-gray-500 mb-1">Arbitrage Opportunity</p>
                        <p className={`font-bold text-lg ${
                          priceInsightsData.market_intelligence?.arbitrage_opportunity?.exists ? 'text-green-600' : 'text-gray-600'
                        }`}>
                          {priceInsightsData.market_intelligence?.arbitrage_opportunity?.exists ? 'Yes' : 'No'}
                        </p>
                        <p className="text-xs text-gray-500">
                          {priceInsightsData.market_intelligence?.arbitrage_opportunity?.potential_gain || ''}
                        </p>
                      </div>
                      
                      {/* Market Efficiency */}
                      <div className="bg-gray-50 rounded-xl p-4">
                        <p className="text-sm text-gray-500 mb-1">Market Efficiency</p>
                        <p className="font-semibold text-gray-900 text-sm">
                          {priceInsightsData.market_intelligence?.market_efficiency || 'Unknown'}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Mandi Prices Table */}
                  {priceInsightsData.mandi_prices && priceInsightsData.mandi_prices.length > 0 && (
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
                      <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                        <svg className="w-6 h-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                        </svg>
                        Mandi Prices ({priceInsightsData.total_mandis_fetched} markets)
                      </h3>
                      
                      <div className="overflow-x-auto">
                        <table className="w-full">
                          <thead>
                            <tr className="bg-gray-50">
                              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">Mandi</th>
                              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">City</th>
                              <th className="px-4 py-3 text-right text-sm font-semibold text-gray-900">Min Price</th>
                              <th className="px-4 py-3 text-right text-sm font-semibold text-gray-900">Max Price</th>
                              <th className="px-4 py-3 text-right text-sm font-semibold text-gray-900">Modal Price</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-100">
                            {priceInsightsData.mandi_prices.slice(0, 10).map((mandi, index) => (
                              <tr key={index} className="hover:bg-gray-50">
                                <td className="px-4 py-3 text-sm text-gray-900">{mandi.mandi_name}</td>
                                <td className="px-4 py-3 text-sm text-gray-600">{mandi.city}</td>
                                <td className="px-4 py-3 text-sm text-gray-600 text-right">₹{mandi.min_price}</td>
                                <td className="px-4 py-3 text-sm text-gray-600 text-right">₹{mandi.max_price}</td>
                                <td className="px-4 py-3 text-sm font-semibold text-green-600 text-right">₹{mandi.modal_price}</td>
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
                <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-12 text-center">
                  <div className="w-20 h-20 mx-auto mb-6 bg-green-50 rounded-full flex items-center justify-center">
                    <svg className="w-10 h-10 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">Get Real-Time Price Insights</h3>
                  <p className="text-gray-500 mb-4">Enter your crop and location to see current mandi prices, best markets to sell, and smart recommendations</p>
                  <div className="flex flex-wrap justify-center gap-2 text-sm text-gray-400">
                    <span className="bg-gray-100 px-3 py-1 rounded-full">Wheat</span>
                    <span className="bg-gray-100 px-3 py-1 rounded-full">Rice</span>
                    <span className="bg-gray-100 px-3 py-1 rounded-full">Onion</span>
                    <span className="bg-gray-100 px-3 py-1 rounded-full">Tomato</span>
                    <span className="bg-gray-100 px-3 py-1 rounded-full">Potato</span>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Ask AI Tab */}
          {activeTab === 'ask-ai' && (
            <div className="max-w-4xl mx-auto space-y-6">
              {/* Header */}
              {/* <div className="bg-gradient-to-r bg-[#75B06F] rounded-2xl p-6 text-white">
                <div className="flex items-center gap-3 mb-2">
                  <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                  </svg>
                  <h2 className="text-2xl font-bold">AI Price Assistant</h2>
                </div>
                <p className="text-green-100">Ask about current crop prices, market trends, and get AI-powered insights</p>
              </div> */}

              {/* Search Box */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
                <form onSubmit={async (e) => {
                  e.preventDefault();
                  if (!searchQuery.trim()) return;
                  
                  setSearchLoading(true);
                  setSearchError('');
                  setSearchResult(null);
                  
                  try {
                    const token = localStorage.getItem('token');
                    const response = await axios.post('http://localhost:5000/api/agents/search', 
                      { query: searchQuery, language },
                      { headers: { Authorization: `Bearer ${token}` } }
                    );
                    if (response.data.success) {
                      setSearchResult(response.data.data);
                    }
                  } catch (error) {
                    setSearchError('Failed to get answer. Please try again.');
                  } finally {
                    setSearchLoading(false);
                  }
                }}>
                  <div className="flex gap-3">
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder={t('farmer.aiSearchPlaceholder')}
                      className="flex-1 px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#75B06F] focus:border-transparent"
                    />
                    <button
                      type="submit"
                      disabled={searchLoading || !searchQuery.trim()}
                      className="px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white font-semibold rounded-xl hover:from-green-700 hover:to-emerald-700 transition-all disabled:opacity-50 flex items-center gap-2"
                    >
                      {searchLoading ? (
                        <>
                          <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                          {t('farmer.searching')}
                        </>
                      ) : (
                        <>
                          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                          </svg>
                          {t('farmer.askAi')}
                        </>
                      )}
                    </button>
                  </div>
                </form>

                {/* Quick Questions */}
                <div className="mt-4 flex flex-wrap gap-2">
                  {['Wheat prices today', 'Rice in Karnataka', 'Onion market trend', 'Tomato prices'].map((q) => (
                    <button
                      key={q}
                      onClick={() => setSearchQuery(q)}
                      className="px-3 py-1.5 text-sm bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-full transition-colors"
                    >
                      {q}
                    </button>
                  ))}
                </div>
              </div>

              {/* Error */}
              {searchError && (
                <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-red-700">
                  {searchError}
                </div>
              )}

              {/* Result */}
              {searchResult && (
                <div className="space-y-4">
                  {/* AI Answer */}
                  <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
                    <div className="bg-gradient-to-r from-green-50 to-emerald-50 px-6 py-4 border-b border-gray-200">
                      <h3 className="font-bold text-gray-900 flex items-center gap-2">
                        <svg className="w-5 h-5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                        </svg>
                        AI Answer
                      </h3>
                    </div>
                    <div className="p-6">
                      <div className="text-gray-700 leading-relaxed whitespace-pre-line prose prose-sm max-w-none">
                        {searchResult.answer.split('\n').map((line, index) => {
                          // Handle bold text **text**
                          const formattedLine = line.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
                          
                          if (line.startsWith('- ')) {
                            return (
                              <div key={index} className="flex items-start gap-2 ml-4 my-1">
                                <span className="text-green-500 mt-1">•</span>
                                <span dangerouslySetInnerHTML={{ __html: formattedLine.substring(2) }} />
                              </div>
                            );
                          } else if (/^\d+\.\s/.test(line)) {
                            return (
                              <div key={index} className="flex items-start gap-2 ml-4 my-1">
                                <span className="text-green-600 font-semibold">{line.match(/^\d+/)[0]}.</span>
                                <span dangerouslySetInnerHTML={{ __html: formattedLine.replace(/^\d+\.\s*/, '') }} />
                              </div>
                            );
                          } else if (line.includes('**')) {
                            return <p key={index} className="my-2 font-medium" dangerouslySetInnerHTML={{ __html: formattedLine }} />;
                          } else if (line.startsWith('*') && line.endsWith('*')) {
                            return <p key={index} className="my-2 text-sm text-gray-500 italic">{line.replace(/^\*|\*$/g, '')}</p>;
                          } else if (line.trim() === '') {
                            return <div key={index} className="h-2" />;
                          } else {
                            return <p key={index} className="my-1">{line}</p>;
                          }
                        })}
                      </div>
                    </div>
                  </div>

                  {/* Mandi Price Data */}
                  {searchResult.mandiData && (
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
                      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 px-6 py-4 border-b border-gray-200">
                        <h3 className="font-bold text-gray-900 flex items-center gap-2">
                          <svg className="w-5 h-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                          </svg>
                          Mandi Prices - {searchResult.mandiData.commodity}
                        </h3>
                      </div>
                      <div className="p-6">
                        <div className="grid grid-cols-3 gap-4 mb-6">
                          <div className="text-center p-4 bg-green-50 rounded-xl">
                            <p className="text-2xl font-bold text-green-600">₹{searchResult.mandiData.avgModalPrice}</p>
                            <p className="text-xs text-gray-500">Avg Price/Quintal</p>
                          </div>
                          <div className="text-center p-4 bg-blue-50 rounded-xl">
                            <p className="text-2xl font-bold text-blue-600">₹{searchResult.mandiData.minPrice}</p>
                            <p className="text-xs text-gray-500">Min Price</p>
                          </div>
                          <div className="text-center p-4 bg-red-50 rounded-xl">
                            <p className="text-2xl font-bold text-red-600">₹{searchResult.mandiData.maxPrice}</p>
                            <p className="text-xs text-gray-500">Max Price</p>
                          </div>
                        </div>
                        
                        {searchResult.mandiData.markets?.length > 0 && (
                          <div>
                            <h4 className="font-semibold text-gray-900 mb-3">Top Markets</h4>
                            <div className="space-y-2">
                              {searchResult.mandiData.markets.slice(0, 5).map((m, i) => (
                                <div key={i} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                  <div>
                                    <p className="font-medium text-gray-900">{m.market}</p>
                                    <p className="text-xs text-gray-500">{m.district}, {m.state}</p>
                                  </div>
                                  <span className="font-bold text-green-600">₹{m.modalPrice}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Related News */}
                  {searchResult.news?.length > 0 && (
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
                      <div className="bg-gradient-to-r from-purple-50 to-pink-50 px-6 py-4 border-b border-gray-200">
                        <h3 className="font-bold text-gray-900">Related News</h3>
                      </div>
                      <div className="p-6 space-y-3">
                        {searchResult.news.map((n, i) => (
                          <a key={i} href={n.url} target="_blank" rel="noopener noreferrer" className="block p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                            <p className="font-medium text-gray-900 text-sm">{n.title}</p>
                            <p className="text-xs text-gray-500 mt-1">{n.source}</p>
                          </a>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Empty State */}
              {!searchResult && !searchLoading && !searchError && (
                <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-12 text-center">
                  <div className="w-20 h-20 mx-auto mb-4 bg-green-50 rounded-full flex items-center justify-center">
                    <svg className="w-10 h-10 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Ask About Crop Prices</h3>
                  <p className="text-gray-500 max-w-md mx-auto">
                    Get real-time mandi prices, market trends, and news for any crop. Try asking "What is the price of rice in Maharashtra?"
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Weather Tab */}
          {activeTab === 'weather' && (
            <div className="max-w-4xl mx-auto space-y-6">
              {/* Header */}
              {/* <div className="bg-gradient-to-r bg-[#36656B] rounded-2xl p-6 text-white">
                <div className="flex items-center gap-3 mb-2">
                  <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z" />
                  </svg>
                  <h2 className="text-2xl font-bold">Weather Analysis</h2>
                </div>
                <p className="text-blue-100">Get AI-powered weather insights for your crops and farming decisions</p>
              </div> */}

              {/* Input Form */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
                <form onSubmit={async (e) => {
                  e.preventDefault();
                  if (!weatherCrop.trim() || !weatherLocation.trim()) return;
                  
                  setWeatherLoading(true);
                  setWeatherError('');
                  setWeatherData(null);
                  
                  try {
                    const token = localStorage.getItem('token');
                    const response = await axios.post('http://localhost:5000/api/agents/weather', 
                      { cropType: weatherCrop, location: weatherLocation, language },
                      { headers: { Authorization: `Bearer ${token}` } }
                    );
                    if (response.data.success) {
                      setWeatherData(response.data.data);
                    }
                  } catch (error) {
                    setWeatherError('Failed to get weather analysis. Please try again.');
                  } finally {
                    setWeatherLoading(false);
                  }
                }}>
                  <div className="grid md:grid-cols-2 gap-4 mb-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">{t('farmer.cropType')}</label>
                      <input
                        type="text"
                        value={weatherCrop}
                        onChange={(e) => setWeatherCrop(e.target.value)}
                        placeholder={t('farmer.cropTypePlaceholder')}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">{t('farmer.locationLabel')}</label>
                      <input
                        type="text"
                        value={weatherLocation}
                        onChange={(e) => setWeatherLocation(e.target.value)}
                        placeholder={t('farmer.locationInputPlaceholder')}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#75B06F] focus:border-transparent"
                      />
                    </div>
                  </div>
                  <button
                    type="submit"
                    disabled={weatherLoading || !weatherCrop.trim() || !weatherLocation.trim()}
                    className="w-full px-6 py-3 bg-gradient-to-r from-[#36656B] to-[#75B06F] text-white font-semibold rounded-xl hover:from-[#36656B] hover:to-[#75B06F] transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {weatherLoading ? (
                      <>
                        <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                        {t('farmer.analyzingWeather')}
                      </>
                    ) : (
                      <>
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z" />
                        </svg>
                        {t('farmer.getAnalysis')}
                      </>
                    )}
                  </button>
                </form>

                {/* Quick Selections */}
                <div className="mt-4 flex flex-wrap gap-2">
                  <span className="text-sm text-gray-500">Quick select:</span>
                  {[
                    { crop: 'Wheat', location: 'Punjab' },
                    { crop: 'Rice', location: 'West Bengal' },
                    { crop: 'Cotton', location: 'Gujarat' },
                    { crop: 'Sugarcane', location: 'Maharashtra' }
                  ].map((item, i) => (
                    <button
                      key={i}
                      onClick={() => { setWeatherCrop(item.crop); setWeatherLocation(item.location); }}
                      className="px-3 py-1.5 text-sm bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-full transition-colors"
                    >
                      {item.crop} - {item.location}
                    </button>
                  ))}
                </div>
              </div>

              {/* Error */}
              {weatherError && (
                <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-red-700">
                  {weatherError}
                </div>
              )}

              {/* Weather Result */}
              {weatherData && (
                <div className="space-y-4">
                  {/* Current Conditions */}
                  <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
                    <div className="bg-gradient-to-r from-blue-50 to-cyan-50 px-6 py-4 border-b border-gray-200">
                      <h3 className="font-bold text-gray-900 flex items-center gap-2">
                        <svg className="w-5 h-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                        </svg>
                        Current Conditions - {weatherData.location}
                      </h3>
                    </div>
                    <div className="p-6">
                      <div className="grid grid-cols-4 gap-4 mb-4">
                        <div className="text-center p-4 bg-orange-50 rounded-xl">
                          <svg className="w-8 h-8 mx-auto mb-2 text-orange-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                          </svg>
                          <p className="text-lg font-bold text-orange-600">{weatherData.weather?.temperature}°C</p>
                          <p className="text-xs text-gray-500">Temperature</p>
                        </div>
                        <div className="text-center p-4 bg-blue-50 rounded-xl">
                          <svg className="w-8 h-8 mx-auto mb-2 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z" />
                          </svg>
                          <p className="text-lg font-bold text-blue-600">{weatherData.weather?.rainfall} mm</p>
                          <p className="text-xs text-gray-500">Rainfall</p>
                        </div>
                        <div className="text-center p-4 bg-teal-50 rounded-xl">
                          <svg className="w-8 h-8 mx-auto mb-2 text-teal-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                          </svg>
                          <p className="text-lg font-bold text-teal-600">{weatherData.weather?.humidity}%</p>
                          <p className="text-xs text-gray-500">Humidity</p>
                        </div>
                        <div className="text-center p-4 bg-purple-50 rounded-xl">
                          <svg className="w-8 h-8 mx-auto mb-2 text-purple-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                          </svg>
                          <p className="text-lg font-bold text-purple-600 capitalize">{weatherData.weather?.condition}</p>
                          <p className="text-xs text-gray-500">Condition</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Risk Level Badge */}
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-medium text-gray-700">Risk Level:</span>
                    <span className={`px-4 py-2 rounded-lg text-sm font-bold ${
                      weatherData.riskLevel === 'high' ? 'bg-red-100 text-red-700' :
                      weatherData.riskLevel === 'low' ? 'bg-green-100 text-green-700' :
                      'bg-yellow-100 text-yellow-700'
                    }`}>
                      {weatherData.riskLevel?.toUpperCase() || 'MEDIUM'}
                    </span>
                  </div>

                  {/* AI Analysis */}
                  <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
                    <div className="bg-gradient-to-r from-indigo-50 to-purple-50 px-6 py-4 border-b border-gray-200">
                      <h3 className="font-bold text-gray-900 flex items-center gap-2">
                        <svg className="w-5 h-5 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                        </svg>
                        AI Weather Analysis for {weatherData.crop}
                      </h3>
                    </div>
                    <div className="p-6">
                      <p className="text-gray-700 leading-relaxed whitespace-pre-line">{weatherData.analysis}</p>
                    </div>
                  </div>

                  {/* Recommendations */}
                  {weatherData.recommendations && weatherData.recommendations.length > 0 && (
                    <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl border border-green-200 p-6">
                      <h4 className="font-bold text-green-900 mb-4 flex items-center gap-2">
                        <svg className="w-5 h-5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        Recommendations
                      </h4>
                      <ul className="space-y-3">
                        {weatherData.recommendations.map((rec, idx) => (
                          <li key={idx} className="flex items-start gap-3">
                            <span className="flex-shrink-0 w-6 h-6 bg-green-200 text-green-800 rounded-full flex items-center justify-center text-sm font-bold">
                              {idx + 1}
                            </span>
                            <span className="text-green-800">{rec}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Optimal Actions */}
                  {weatherData.optimalActions && (
                    <div className="bg-gradient-to-r from-amber-50 to-yellow-50 rounded-2xl border border-amber-200 p-6">
                      <h4 className="font-bold text-amber-900 mb-3 flex items-center gap-2">
                        <svg className="w-5 h-5 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                        </svg>
                        Immediate Action Required
                      </h4>
                      <p className="text-amber-800">{weatherData.optimalActions}</p>
                    </div>
                  )}

                  {/* Timestamp */}
                  <div className="text-center text-sm text-gray-500">
                    Analysis generated at: {new Date(weatherData.timestamp).toLocaleString()}
                  </div>
                </div>
              )}

              {/* Empty State */}
              {!weatherData && !weatherLoading && !weatherError && (
                <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-12 text-center">
                  <div className="w-20 h-20 mx-auto mb-4 bg-blue-50 rounded-full flex items-center justify-center">
                    <svg className="w-10 h-10 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Get Weather Insights</h3>
                  <p className="text-gray-500 max-w-md mx-auto">
                    Enter your crop type and location to get AI-powered weather analysis and farming recommendations.
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Analysis & Reports Tab */}
          {activeTab === 'analysis-reports' && (
            <div className="space-y-6">
              {/* Header */}
              {/* <div className="bg-gradient-to-r bg-[#36656B] rounded-2xl p-6 text-white">
                <div className="flex items-center gap-3 mb-2">
                  <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <h2 className="text-2xl font-bold">AI-Powered Market Analysis</h2>
                </div>
                <p className="text-indigo-100">Get comprehensive price recommendations using 5 AI agents analyzing prices, news, weather, and market trends</p>
              </div> */}

              {/* Agent Status Indicators */}
              <div className="grid grid-cols-5 gap-2">
                {[
                  { id: 'price', name: 'Price Agent', icon: '' },
                  { id: 'news', name: 'News Agent', icon: '' },
                  { id: 'weather', name: 'Weather Agent', icon: '' },
                  { id: 'search', name: 'Search Agent', icon: '' },
                  { id: 'analytics', name: 'Analytics Agent', icon: '' }
                ].map((agent) => (
                  <div
                    key={agent.id}
                    className={`p-3 rounded-xl transition-all ${
                      activeAgents.includes(agent.id)
                        ? 'bg-green-100 border-2 border-green-500'
                        : 'bg-gray-100 border-2 border-gray-200'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      {activeAgents.includes(agent.id) && (
                        <div className="animate-spin rounded-full h-4 w-4 border-2 border-green-600 border-t-transparent flex-shrink-0"></div>
                      )}
                      <p className="text-xs font-medium">{agent.name}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Analysis Form */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <svg className="w-5 h-5 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                  Enter Your Details for AI Analysis
                </h3>
                
                <form onSubmit={async (e) => {
                  e.preventDefault();
                  setAnalysisLoading(true);
                  setAnalysisError('');
                  setAnalysisData(null);
                  setActiveAgents([]);
                  
                  const agents = ['price', 'news', 'weather', 'search', 'analytics'];
                  agents.forEach((agent, index) => {
                    setTimeout(() => {
                      setActiveAgents(prev => [...prev, agent]);
                    }, index * 800);
                  });
                  
                  try {
                    const response = await axios.post('http://localhost:5000/api/analyze', analysisForm);
                    if (response.data.success) {
                      setAnalysisData(response.data);
                      setActiveAgents([]);
                    } else {
                      setAnalysisError(response.data.error || 'Analysis failed');
                    }
                  } catch (error) {
                    setAnalysisError(error.response?.data?.error || 'Failed to analyze. Please try again.');
                  } finally {
                    setAnalysisLoading(false);
                  }
                }} className="space-y-4">
                  
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Crop Type *</label>
                      <input
                        type="text"
                        value={analysisForm.cropType}
                        onChange={(e) => setAnalysisForm({...analysisForm, cropType: e.target.value})}
                        placeholder="e.g., Wheat, Rice, Cotton"
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Location/State *</label>
                      <input
                        type="text"
                        value={analysisForm.location}
                        onChange={(e) => setAnalysisForm({...analysisForm, location: e.target.value})}
                        placeholder="e.g., Punjab, Maharashtra"
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                        required
                      />
                    </div>
                  </div>
                  
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Quantity (Quintals)</label>
                      <input
                        type="number"
                        value={analysisForm.quantity}
                        onChange={(e) => setAnalysisForm({...analysisForm, quantity: e.target.value})}
                        placeholder="e.g., 50"
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Quality Grade</label>
                      <select
                        value={analysisForm.quality}
                        onChange={(e) => setAnalysisForm({...analysisForm, quality: e.target.value})}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                      >
                        <option value="A">Grade A (Premium)</option>
                        <option value="B">Grade B (Standard)</option>
                        <option value="C">Grade C (Basic)</option>
                      </select>
                    </div>
                  </div>
                  
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Storage Capacity (Quintals)</label>
                      <input
                        type="number"
                        value={analysisForm.storageCapacity}
                        onChange={(e) => setAnalysisForm({...analysisForm, storageCapacity: e.target.value})}
                        placeholder="e.g., 100"
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Financial Urgency</label>
                      <select
                        value={analysisForm.financialUrgency}
                        onChange={(e) => setAnalysisForm({...analysisForm, financialUrgency: e.target.value})}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                      >
                        <option value="low">Low - Can wait for best price</option>
                        <option value="medium">Medium - Flexible timing</option>
                        <option value="high">High - Need to sell soon</option>
                      </select>
                    </div>
                  </div>
                  
                  <button
                    type="submit"
                    disabled={analysisLoading || !analysisForm.cropType || !analysisForm.location}
                    className="w-full py-4 bg-gradient-to-r bg-[#75B06F] text-white font-bold rounded-xl  transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
                  >
                    {analysisLoading ? (
                      <>
                        <svg className="animate-spin w-6 h-6" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Analyzing with 5 AI Agents...
                      </>
                    ) : (
                      <>
                        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                        </svg>
                        Get AI Price Recommendation
                      </>
                    )}
                  </button>
                </form>
              </div>

              {/* Error Display */}
              {analysisError && (
                <div className="bg-red-50 border border-red-200 rounded-xl p-4">
                  <p className="text-red-600 flex items-center gap-2">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    {analysisError}
                  </p>
                </div>
              )}

              {/* Analysis Results */}
              {analysisData && analysisData.data && (
                <div className="space-y-6">
                  {/* Main Recommendation Hero */}
                  <div className="bg-gradient-to-br from-white to-indigo-50 rounded-2xl shadow-lg border border-indigo-100 p-6">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
                      <div>
                        <h3 className="text-2xl font-bold text-gray-900">
                          {analysisData.data.recommendation?.crop} in {analysisData.data.recommendation?.location}
                        </h3>
                        <p className="text-gray-500">AI-Powered Market Analysis</p>
                      </div>
                      <div className={`px-6 py-3 rounded-full font-bold text-lg ${
                        analysisData.data.recommendation?.recommendation?.action?.includes('SELL NOW') 
                          ? 'bg-green-500 text-white' 
                          : analysisData.data.recommendation?.recommendation?.action?.includes('WAIT')
                          ? 'bg-yellow-500 text-white'
                          : 'bg-blue-500 text-white'
                      }`}>
                        {analysisData.data.recommendation?.recommendation?.action || 'ANALYZING'}
                      </div>
                    </div>
                    
                    <div className="grid md:grid-cols-2 gap-6 mb-6">
                      <div className="bg-white rounded-xl p-4 border border-gray-200">
                        <p className="text-sm text-gray-500 mb-1">Current Market Price</p>
                        <p className="text-3xl font-bold text-green-600">
                          ₹{analysisData.data.recommendation?.market_summary?.current_modal_price?.toLocaleString() || 'N/A'}/qtl
                        </p>
                        <p className="text-sm text-gray-600">
                          {analysisData.data.recommendation?.market_summary?.mandi_name}, {analysisData.data.recommendation?.market_summary?.city}
                        </p>
                      </div>
                      <div className="bg-white rounded-xl p-4 border border-gray-200">
                        <p className="text-sm text-gray-500 mb-1">Recommended Target Price</p>
                        <p className="text-3xl font-bold text-indigo-600">
                          {analysisData.data.recommendation?.recommendation?.target_price || 'N/A'}
                        </p>
                        <p className="text-sm text-gray-600">
                          {analysisData.data.recommendation?.recommendation?.timing || 'Based on market conditions'}
                        </p>
                      </div>
                    </div>
                    
                    <div className="bg-indigo-50 rounded-xl p-4 border border-indigo-200">
                      <p className="text-indigo-900 font-medium">
                         {analysisData.data.recommendation?.farmer_friendly_summary || analysisData.data.recommendation?.recommendation?.reasoning}
                      </p>
                    </div>
                    
                    <div className="mt-4">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm font-medium text-gray-600">Confidence Level</span>
                        <span className={`text-sm font-bold ${
                          analysisData.data.recommendation?.recommendation?.confidence === 'high' ? 'text-green-600' :
                          analysisData.data.recommendation?.recommendation?.confidence === 'medium' ? 'text-yellow-600' : 'text-red-600'
                        }`}>
                          {analysisData.data.recommendation?.recommendation?.confidence?.toUpperCase() || 'MEDIUM'}
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div className={`h-2 rounded-full ${
                          analysisData.data.recommendation?.recommendation?.confidence === 'high' ? 'bg-[#75B06F] w-4/5' :
                          analysisData.data.recommendation?.recommendation?.confidence === 'medium' ? 'bg-[#F0F804] w-3/5' : 'bg-red-500 w-2/5'
                        }`}></div>
                      </div>
                    </div>
                  </div>

                  {/* Agent Outputs Grid */}
                  <div className="grid md:grid-cols-2 gap-6">
                    {analysisData.data.agentOutputs?.priceData && (
                      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
                        <h4 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                          <span className="text-2xl"></span> 
                          {analysisData.data.agentOutputs.priceData.data_source === 'AI_ESTIMATE' ? 'AI Price Estimates' : 'Mandi Price Data'}
                          {analysisData.data.agentOutputs.priceData.data_source === 'AI_ESTIMATE' && (
                            <span className="ml-auto px-2 py-1 rounded text-xs font-bold bg-purple-100 text-purple-800">AI ESTIMATE</span>
                          )}
                        </h4>
                        
                        {/* Show AI Estimated Prices */}
                        {analysisData.data.agentOutputs.priceData.data_source === 'AI_ESTIMATE' && analysisData.data.agentOutputs.priceData.ai_estimated_prices && (
                          <div className="space-y-3">
                            <div className="grid grid-cols-3 gap-3">
                              <div className="text-center p-3 bg-red-50 rounded-lg">
                                <p className="text-xl font-bold text-red-600">₹{analysisData.data.agentOutputs.priceData.ai_estimated_prices.min_price?.toLocaleString()}</p>
                                <p className="text-xs text-gray-500">Min Price</p>
                              </div>
                              <div className="text-center p-3 bg-green-50 rounded-lg">
                                <p className="text-xl font-bold text-green-600">₹{analysisData.data.agentOutputs.priceData.ai_estimated_prices.modal_price?.toLocaleString()}</p>
                                <p className="text-xs text-gray-500">Modal Price</p>
                              </div>
                              <div className="text-center p-3 bg-blue-50 rounded-lg">
                                <p className="text-xl font-bold text-blue-600">₹{analysisData.data.agentOutputs.priceData.ai_estimated_prices.max_price?.toLocaleString()}</p>
                                <p className="text-xs text-gray-500">Max Price</p>
                              </div>
                            </div>
                            <div className="flex items-center gap-2 text-sm">
                              <span className="font-medium">Trend:</span>
                              <span className={`px-2 py-1 rounded ${
                                analysisData.data.agentOutputs.priceData.ai_estimated_prices.price_trend === 'rising' ? 'bg-green-100 text-green-700' :
                                analysisData.data.agentOutputs.priceData.ai_estimated_prices.price_trend === 'falling' ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-700'
                              }`}>
                                {analysisData.data.agentOutputs.priceData.ai_estimated_prices.price_trend === 'rising' ? ' Rising' :
                                 analysisData.data.agentOutputs.priceData.ai_estimated_prices.price_trend === 'falling' ? ' Falling' : ' Stable'}
                              </span>
                              <span className="ml-2 text-gray-500">Confidence: {analysisData.data.agentOutputs.priceData.ai_estimated_prices.confidence}</span>
                            </div>
                            {analysisData.data.agentOutputs.priceData.ai_estimated_prices.rationale && (
                              <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">
                                {analysisData.data.agentOutputs.priceData.ai_estimated_prices.rationale}
                              </p>
                            )}
                            {analysisData.data.agentOutputs.priceData.insights?.market_factors?.length > 0 && (
                              <div className="mt-2">
                                <p className="text-xs font-medium text-gray-500 mb-1">Key Factors:</p>
                                <div className="flex flex-wrap gap-1">
                                  {analysisData.data.agentOutputs.priceData.insights.market_factors.map((factor, i) => (
                                    <span key={i} className="text-xs bg-indigo-50 text-indigo-700 px-2 py-1 rounded">{factor}</span>
                                  ))}
                                </div>
                              </div>
                            )}
                            {analysisData.data.agentOutputs.priceData.disclaimer && (
                              <p className="text-xs text-amber-600 bg-amber-50 p-2 rounded mt-2">
                                ⚠️ {analysisData.data.agentOutputs.priceData.disclaimer}
                              </p>
                            )}
                          </div>
                        )}

                        {/* Show Mandi Prices */}
                        {analysisData.data.agentOutputs.priceData.data_source !== 'AI_ESTIMATE' && (
                          <div className="space-y-3">
                            {analysisData.data.agentOutputs.priceData.mandi_prices?.slice(0, 4).map((mandi, i) => (
                              <div key={i} className="flex justify-between items-center py-2 border-b border-gray-100">
                                <div>
                                  <p className="font-medium text-gray-900">{mandi.mandi_name}</p>
                                  <p className="text-sm text-gray-500">{mandi.city}</p>
                                </div>
                                <p className="font-bold text-green-600">₹{mandi.modal_price?.toLocaleString()}/qtl</p>
                              </div>
                            ))}
                            {analysisData.data.agentOutputs.priceData.insights?.best_market_to_sell && (
                              <div className="bg-green-50 rounded-lg p-3 mt-3">
                                <p className="text-sm text-green-800">
                                  <strong>Best Market:</strong> {analysisData.data.agentOutputs.priceData.insights.best_market_to_sell}
                                </p>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    )}

                    {analysisData.data.agentOutputs?.newsAnalysis && (
                      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
                        <h4 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                          News Analysis
                          <span className={`ml-auto px-2 py-1 rounded text-xs font-bold ${
                            analysisData.data.agentOutputs.newsAnalysis.overall_sentiment === 'bullish' ? 'bg-green-100 text-green-800' :
                            analysisData.data.agentOutputs.newsAnalysis.overall_sentiment === 'bearish' ? 'bg-red-100 text-red-800' : 'bg-gray-100 text-gray-800'
                          }`}>
                            {analysisData.data.agentOutputs.newsAnalysis.overall_sentiment?.toUpperCase()}
                          </span>
                        </h4>
                        {analysisData.data.agentOutputs.newsAnalysis.key_takeaway && (
                          <p className="text-gray-700 mb-3">{analysisData.data.agentOutputs.newsAnalysis.key_takeaway}</p>
                        )}
                        <div className="space-y-2">
                          {analysisData.data.agentOutputs.newsAnalysis.news_items?.slice(0, 3).map((news, i) => (
                            <div key={i} className="text-sm border-l-2 border-indigo-300 pl-3">
                              <p className="font-medium text-gray-800">{news.headline}</p>
                              <p className="text-gray-500 text-xs">{news.source} • {news.date}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {analysisData.data.agentOutputs?.weatherAnalysis && (
                      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
                        <h4 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                          <span className="text-2xl"></span> Weather Impact
                        </h4>
                        <div className="grid grid-cols-3 gap-3 mb-4">
                          <div className="text-center p-2 bg-blue-50 rounded-lg">
                            <p className="text-2xl font-bold text-blue-600">{analysisData.data.agentOutputs.weatherAnalysis.current_conditions?.temperature}</p>
                            <p className="text-xs text-gray-500">Temp</p>
                          </div>
                          <div className="text-center p-2 bg-cyan-50 rounded-lg">
                            <p className="text-2xl font-bold text-cyan-600">{analysisData.data.agentOutputs.weatherAnalysis.current_conditions?.humidity}</p>
                            <p className="text-xs text-gray-500">Humidity</p>
                          </div>
                          <div className="text-center p-2 bg-indigo-50 rounded-lg">
                            <p className="text-2xl font-bold text-indigo-600">{analysisData.data.agentOutputs.weatherAnalysis.current_conditions?.precipitation}</p>
                            <p className="text-xs text-gray-500">Rain</p>
                          </div>
                        </div>
                        <div className="bg-gray-50 rounded-lg p-3">
                          <p className="text-sm"><strong>Price Pressure:</strong> {analysisData.data.agentOutputs.weatherAnalysis.price_pressure}</p>
                          <p className="text-sm text-gray-600 mt-1">{analysisData.data.agentOutputs.weatherAnalysis.harvest_impact}</p>
                        </div>
                      </div>
                    )}

                    {analysisData.data.agentOutputs?.searchInsights && (
                      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
                        <h4 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                          <span className="text-2xl"></span> Market Intelligence
                          <span className={`ml-auto px-2 py-1 rounded text-xs font-bold ${
                            analysisData.data.agentOutputs.searchInsights.market_sentiment === 'bullish' ? 'bg-green-100 text-green-800' :
                            analysisData.data.agentOutputs.searchInsights.market_sentiment === 'bearish' ? 'bg-red-100 text-red-800' : 'bg-gray-100 text-gray-800'
                          }`}>
                            {analysisData.data.agentOutputs.searchInsights.market_sentiment?.toUpperCase()}
                          </span>
                        </h4>
                        <div className="space-y-3">
                          <div className="bg-indigo-50 rounded-lg p-3">
                            <p className="text-sm font-medium text-indigo-800">Demand: {analysisData.data.agentOutputs.searchInsights.demand_signals}</p>
                          </div>
                          {analysisData.data.agentOutputs.searchInsights.expert_forecasts && (
                            <p className="text-sm text-gray-700">
                              <strong>Forecast:</strong> {analysisData.data.agentOutputs.searchInsights.expert_forecasts}
                            </p>
                          )}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Key Factors & Scenarios */}
                  <div className="grid md:grid-cols-2 gap-6">
                    {analysisData.data.recommendation?.key_factors && (
                      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
                        <h4 className="font-bold text-gray-900 mb-4"> Key Factors</h4>
                        <div className="space-y-3">
                          {analysisData.data.recommendation.key_factors.map((factor, i) => (
                            <div key={i} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                              <span className={`px-2 py-1 rounded text-xs font-bold ${
                                factor.impact === 'positive' ? 'bg-green-100 text-green-800' :
                                factor.impact === 'negative' ? 'bg-red-100 text-red-800' : 'bg-gray-100 text-gray-800'
                              }`}>
                                {factor.impact === 'positive' ? '↑' : factor.impact === 'negative' ? '↓' : '→'}
                              </span>
                              <div>
                                <p className="font-medium text-gray-900">{factor.factor}</p>
                                <p className="text-sm text-gray-600">{factor.explanation}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {analysisData.data.recommendation?.scenarios && (
                      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
                        <h4 className="font-bold text-gray-900 mb-4"> Price Scenarios</h4>
                        <div className="space-y-3">
                          {analysisData.data.recommendation.scenarios.optimistic && (
                            <div className="p-3 bg-green-50 rounded-lg border border-green-200">
                              <div className="flex justify-between items-center mb-1">
                                <span className="font-medium text-green-800">Optimistic</span>
                                <span className="text-sm text-green-600">{analysisData.data.recommendation.scenarios.optimistic.probability}</span>
                              </div>
                              <p className="text-lg font-bold text-green-700">{analysisData.data.recommendation.scenarios.optimistic.potential_price}</p>
                              <p className="text-xs text-green-600">{analysisData.data.recommendation.scenarios.optimistic.conditions}</p>
                            </div>
                          )}
                          {analysisData.data.recommendation.scenarios.expected && (
                            <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                              <div className="flex justify-between items-center mb-1">
                                <span className="font-medium text-blue-800">Expected</span>
                                <span className="text-sm text-blue-600">{analysisData.data.recommendation.scenarios.expected.probability}</span>
                              </div>
                              <p className="text-lg font-bold text-blue-700">{analysisData.data.recommendation.scenarios.expected.potential_price}</p>
                              <p className="text-xs text-blue-600">{analysisData.data.recommendation.scenarios.expected.conditions}</p>
                            </div>
                          )}
                          {analysisData.data.recommendation.scenarios.pessimistic && (
                            <div className="p-3 bg-red-50 rounded-lg border border-red-200">
                              <div className="flex justify-between items-center mb-1">
                                <span className="font-medium text-red-800">Pessimistic</span>
                                <span className="text-sm text-red-600">{analysisData.data.recommendation.scenarios.pessimistic.probability}</span>
                              </div>
                              <p className="text-lg font-bold text-red-700">{analysisData.data.recommendation.scenarios.pessimistic.potential_price}</p>
                              <p className="text-xs text-red-600">{analysisData.data.recommendation.scenarios.pessimistic.conditions}</p>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Action Plan & Risks */}
                  <div className="grid md:grid-cols-2 gap-6">
                    {analysisData.data.recommendation?.action_plan && (
                      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
                        <h4 className="font-bold text-gray-900 mb-4"> Action Plan</h4>
                        <div className="space-y-3">
                          <div className="p-3 bg-yellow-50 rounded-lg">
                            <p className="text-sm font-medium text-yellow-800"> Immediate Steps</p>
                            <p className="text-sm text-yellow-700">{analysisData.data.recommendation.action_plan.immediate_steps}</p>
                          </div>
                          <div className="p-3 bg-blue-50 rounded-lg">
                            <p className="text-sm font-medium text-blue-800"> Monitor</p>
                            <p className="text-sm text-blue-700">{analysisData.data.recommendation.action_plan.monitoring}</p>
                          </div>
                          <div className="p-3 bg-purple-50 rounded-lg">
                            <p className="text-sm font-medium text-purple-800">Triggers</p>
                            <p className="text-sm text-purple-700">{analysisData.data.recommendation.action_plan.triggers}</p>
                          </div>
                        </div>
                      </div>
                    )}

                    {analysisData.data.recommendation?.risk_factors && (
                      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
                        <h4 className="font-bold text-gray-900 mb-4">Risk Factors</h4>
                        <ul className="space-y-2">
                          {analysisData.data.recommendation.risk_factors.map((risk, i) => (
                            <li key={i} className="flex items-start gap-2 text-sm text-gray-700">
                              <svg className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                              </svg>
                              {risk}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>

                  {analysisData.metadata && (
                    <div className="text-center text-sm text-gray-500 mt-4">
                      Analysis completed in {analysisData.metadata.processingTime} • 
                      {analysisData.metadata.agentsRun?.length} AI agents used • 
                      {new Date(analysisData.metadata.timestamp).toLocaleString()}
                    </div>
                  )}
                </div>
              )}

              {/* Empty State */}
              {!analysisData && !analysisLoading && !analysisError && (
                <div className="text-center py-16 bg-white rounded-2xl shadow-sm border border-gray-200">
                  <div className="w-24 h-24 mx-auto mb-6 bg-indigo-50 rounded-full flex items-center justify-center">
                    <svg className="w-12 h-12 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">Get AI-Powered Market Analysis</h3>
                  <p className="text-gray-500 max-w-lg mx-auto">
                    Enter your crop details above to receive comprehensive price recommendations from our 5 AI agents analyzing real-time mandi prices, news, weather, and market trends.
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Messages Tab */}
          {activeTab === 'messages' && (
            <div className="text-center py-20 bg-white rounded-2xl shadow-sm border border-gray-200">
              <div className="w-24 h-24 mx-auto mb-6 bg-purple-50 rounded-full flex items-center justify-center">
                <svg className="w-12 h-12 text-purple-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">No Messages Yet</h3>
              <p className="text-gray-500">Your conversations with buyers will appear here</p>
            </div>
          )}

          {/* Settings Tab */}
          {activeTab === 'settings' && (
            <div className="max-w-3xl mx-auto space-y-6">
              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-6">Profile Settings</h3>
                <div className="space-y-4">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Full Name</label>
                      <input
                        type="text"
                        defaultValue={user.name}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Email</label>
                      <input
                        type="email"
                        defaultValue={user.email}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Phone</label>
                      <input
                        type="tel"
                        defaultValue={user.phone || ''}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Location</label>
                      <input
                        type="text"
                        defaultValue={user.location || ''}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      />
                    </div>
                  </div>
                  <button className="mt-4 bg-gradient-to-r  bg-[#75B06F] text-white px-6 py-3 rounded-xl font-semibold hover:shadow-lg transition-all">
                    Save Changes
                  </button>
                </div>
              </div>

              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-6">Notification Preferences</h3>
                <div className="space-y-4">
                  {['Email notifications for new offers', 'SMS alerts for orders', 'Weekly market updates', 'Price drop alerts'].map((item, index) => (
                    <label key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl cursor-pointer hover:bg-gray-100 transition-colors">
                      <span className="font-medium text-gray-700">{item}</span>
                      <div className="relative">
                        <input type="checkbox" className="sr-only peer" defaultChecked={index < 2} />
                        <div className="w-11 h-6 bg-gray-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600"></div>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              <div className="bg-white rounded-2xl shadow-sm border border-red-200 p-6">
                <h3 className="text-lg font-bold text-red-600 mb-4">Danger Zone</h3>
                <p className="text-gray-600 mb-4">Once you delete your account, there is no going back. Please be certain.</p>
                <button className="bg-red-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-red-700 transition-colors">
                  Delete Account
                </button>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden backdrop-blur-sm"
          onClick={() => setSidebarOpen(false)}
        ></div>
      )}
    </div>
  );
}

export default FarmerDashboard;