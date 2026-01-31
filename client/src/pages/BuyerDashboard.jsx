import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { useLanguage } from '../context/LanguageContext';
import LanguageSwitcher from '../components/LanguageSwitcher';

function BuyerDashboard() {
  const { t } = useLanguage();
  const [user, setUser] = useState(null);
  const [stats, setStats] = useState({
    totalPurchases: 0,
    activeBids: 0,
    totalSpent: 0,
    savedListings: 0
  });
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [cart, setCart] = useState([]);
  const [addedToCart, setAddedToCart] = useState({});
  
  // Stores state
  const [nearbyStores, setNearbyStores] = useState([]);
  const [selectedStore, setSelectedStore] = useState(null);
  const [storeProducts, setStoreProducts] = useState([]);
  const [storesLoading, setStoresLoading] = useState(false);
  const [userCity, setUserCity] = useState('');
  const [activeView, setActiveView] = useState('farmers'); // 'farmers' or 'stores'
  
  const navigate = useNavigate();

  useEffect(() => {
    const userData = JSON.parse(localStorage.getItem('user'));
    const token = localStorage.getItem('token');
    
    if (!userData || !token || userData.userType !== 'buyer') {
      navigate('/login');
      return;
    }
    
    setUser(userData);
    fetchDashboardData(token);
    fetchProducts(token);
    fetchNearbyStores(token);
    
    // Load cart from localStorage
    const savedCart = JSON.parse(localStorage.getItem('cart')) || [];
    setCart(savedCart);
  }, [navigate]);

  // Live search and filter effect
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token && user) {
      if (activeView === 'farmers') {
        fetchProducts(token);
      } else if (selectedStore) {
        fetchStoreProducts(token, selectedStore._id);
      }
    }
  }, [searchTerm, selectedCategory, activeView]);

  const fetchNearbyStores = async (token) => {
    setStoresLoading(true);
    try {
      const response = await axios.get('http://localhost:5000/api/buyer/nearby-stores', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setNearbyStores(response.data.stores || []);
      setUserCity(response.data.userCity || '');
    } catch (error) {
      console.error('Error fetching nearby stores:', error);
    } finally {
      setStoresLoading(false);
    }
  };

  const fetchStoreProducts = async (token, storeId) => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (searchTerm) params.append('search', searchTerm);
      if (selectedCategory !== 'all') params.append('category', selectedCategory);
      
      const response = await axios.get(`http://localhost:5000/api/buyer/store/${storeId}/products?${params}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setStoreProducts(response.data.products || []);
    } catch (error) {
      console.error('Error fetching store products:', error);
      setStoreProducts([]);
    } finally {
      setLoading(false);
    }
  };

  const handleStoreClick = (store) => {
    setSelectedStore(store);
    setActiveView('stores');
    const token = localStorage.getItem('token');
    fetchStoreProducts(token, store._id);
  };

  const handleBackToStores = () => {
    setSelectedStore(null);
    setStoreProducts([]);
  };

  const fetchDashboardData = async (token) => {
    try {
      const response = await axios.get('http://localhost:5000/api/buyer/dashboard', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setStats(response.data.stats);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    }
  };

  const fetchProducts = async (token) => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (searchTerm) params.append('search', searchTerm);
      if (selectedCategory !== 'all') params.append('category', selectedCategory);
      
      const response = await axios.get(`http://localhost:5000/api/buyer/products?${params}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setProducts(response.data.products || []);
    } catch (error) {
      console.error('Error fetching products:', error);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    navigate('/login');
  };

  const clearFilters = () => {
    setSearchTerm('');
    setSelectedCategory('all');
  };

  const addToCart = (product) => {
    const existingItem = cart.find(item => item._id === product._id);
    let updatedCart;
    
    if (existingItem) {
      updatedCart = cart.map(item => 
        item._id === product._id 
          ? { ...item, cartQuantity: item.cartQuantity + 1 }
          : item
      );
    } else {
      updatedCart = [...cart, { ...product, cartQuantity: 1 }];
    }
    
    setCart(updatedCart);
    localStorage.setItem('cart', JSON.stringify(updatedCart));
    
    // Show feedback
    setAddedToCart({ ...addedToCart, [product._id]: true });
    setTimeout(() => {
      setAddedToCart(prev => ({ ...prev, [product._id]: false }));
    }, 2000);
  };

  const addStoreProductToCart = (item) => {
    // Convert store inventory item to cart item format
    const cartItem = {
      _id: item._id,
      name: item.productName,
      category: item.category,
      price: item.salePrice,
      quantity: item.saleQuantity,
      unit: item.unit,
      farmerName: selectedStore?.storeName || 'Store',
      image: item.image,
      isStoreProduct: true,
      storeId: item.storeId
    };
    
    const existingItem = cart.find(c => c._id === item._id);
    let updatedCart;
    
    if (existingItem) {
      updatedCart = cart.map(c => 
        c._id === item._id 
          ? { ...c, cartQuantity: c.cartQuantity + 1 }
          : c
      );
    } else {
      updatedCart = [...cart, { ...cartItem, cartQuantity: 1 }];
    }
    
    setCart(updatedCart);
    localStorage.setItem('cart', JSON.stringify(updatedCart));
    
    // Show feedback
    setAddedToCart({ ...addedToCart, [item._id]: true });
    setTimeout(() => {
      setAddedToCart(prev => ({ ...prev, [item._id]: false }));
    }, 2000);
  };

  const getCartCount = () => {
    return cart.reduce((total, item) => total + item.cartQuantity, 0);
  };

  if (!user) return <div>Loading...</div>;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="absolute inset-0 bg-[#75B06F] rounded-xl blur-lg opacity-30"></div>
              <svg className="w-10 h-10 relative" viewBox="0 0 24 24" fill="none">
                <path d="M12 2L13.09 8.26L19 6L14.74 10.91L21 12L14.74 13.09L19 18L13.09 15.74L12 22L10.91 15.74L5 18L9.26 13.09L3 12L9.26 10.91L5 6L10.91 8.26L12 2Z" fill="#75B06F"/>
              </svg>
            </div>
            <h1 className="text-2xl font-bold  bg-gradient-to-r from-[#36656B] to-[#75B06F] bg-clip-text text-transparent">AuraFarm</h1>
          </div>
          
          <div className="flex items-center gap-4">
            <Link 
              to="/buyer/orders"
              className="px-4 py-2 bg-[#F0F8A4] text-[#36656B] rounded-lg hover:bg-[#DAD887] transition-colors font-medium flex items-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
              {t('buyer.myOrders')}
            </Link>
            <Link 
              to="/buyer/cart"
              className="relative px-4 py-2 bg-gradient-to-r from-[#75B06F] to-[#36656B] text-white rounded-lg hover:shadow-lg transition-all font-medium flex items-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              {t('buyer.cart')}
              {getCartCount() > 0 && (
                <span className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-bold">
                  {getCartCount()}
                </span>
              )}
            </Link>
            <LanguageSwitcher variant="compact" />
            <div className="text-right">
              <p className="text-sm text-gray-500">{t('buyer.welcomeBack')}</p>
              <p className="font-bold text-[#36656B]">{user.name}</p>
            </div>
            <div className="w-12 h-12 bg-gradient-to-br from-[#75B06F] to-[#36656B] rounded-full flex items-center justify-center text-white font-bold text-lg shadow-lg">
              {user.name.charAt(0).toUpperCase()}
            </div>
            <button
              onClick={handleLogout}
              className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors font-medium"
            >
              {t('buyer.logout')}
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-[#36656B] mb-2">{t('buyer.dashboard')}</h1>
          <p className="text-gray-600 text-lg">{t('buyer.browseProducts')}</p>
        </div>

        {/* Stats Grid */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 hover:shadow-lg transition-all group">
            <div className="flex items-center justify-between mb-4">
              <div className="w-14 h-14 bg-[#36656B] rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
                <svg className="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                </svg>
              </div>
              <span className="text-[#36656B] text-sm font-semibold bg-[#F0F8A4] px-2 py-1 rounded-lg">+5%</span>
            </div>
            <h3 className="text-3xl font-bold text-[#36656B] mb-1">{stats.totalPurchases}</h3>
            <p className="text-gray-600 text-sm font-medium">{t('buyer.totalPurchases')}</p>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 hover:shadow-lg transition-all group">
            <div className="flex items-center justify-between mb-4">
              <div className="w-14 h-14 bg-[#36656B] rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
                <svg className="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
              <span className="text-[#36656B] text-sm font-semibold bg-[#F0F8A4] px-2 py-1 rounded-lg">+3</span>
            </div>
            <h3 className="text-3xl font-bold text-[#36656B] mb-1">{stats.activeBids}</h3>
            <p className="text-gray-600 text-sm font-medium">{t('buyer.activeBids')}</p>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 hover:shadow-lg transition-all group">
            <div className="flex items-center justify-between mb-4">
              <div className="w-14 h-14 bg-[#36656B] rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
                <svg className="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <span className="text-[#36656B] text-sm font-semibold bg-[#F0F8A4] px-2 py-1 rounded-lg">+12%</span>
            </div>
            <h3 className="text-3xl font-bold text-[#36656B] mb-1">₹{stats.totalSpent.toLocaleString()}</h3>
            <p className="text-gray-600 text-sm font-medium">{t('buyer.totalSpent')}</p>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 hover:shadow-lg transition-all group">
            <div className="flex items-center justify-between mb-4">
              <div className="w-14 h-14 bg-[#36656B] rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
                <svg className="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                </svg>
              </div>
            </div>
            <h3 className="text-3xl font-bold text-[#36656B] mb-1">{stats.savedListings}</h3>
            <p className="text-gray-600 text-sm font-medium">{t('buyer.savedListings')}</p>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 mb-8">
          <h2 className="text-2xl font-bold text-[#36656B] mb-6">{t('buyer.quickActions')}</h2>
          <div className="grid md:grid-cols-3 gap-4">
            <button className="flex items-center gap-3 p-5 bg-[#F0F8A4] rounded-xl transition-all shadow-sm hover:shadow-md border border-[#DAD887]">
              <div className="w-12 h-12 bg-[#36656B] rounded-xl flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <span className="font-bold text-gray-900">{t('buyer.browseProductsBtn')}</span>
            </button>
            
            <button className="flex items-center gap-3 p-5 bg-[#f0f8a4] rounded-xl transition-all shadow-sm hover:shadow-md border border-[#DAD887]">
              <div className="w-12 h-12 bg-[#36656B] rounded-xl flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <span className="font-bold text-gray-900">{t('buyer.marketInsights')}</span>
            </button>
            
            <button className="flex items-center gap-3 p-5 bg-[#f0f8a4] rounded-xl transition-all shadow-sm hover:shadow-md border border-[#DAD887]">
              <div className="w-12 h-12 bg-[#36656b] rounded-xl flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                </svg>
              </div>
              <span className="font-bold text-black">{t('buyer.contactFarmers')}</span>
            </button>
          </div>
        </div>

        {/* View Toggle */}
        <div className="flex gap-4 mb-6">
          <button
            onClick={() => { setActiveView('farmers'); setSelectedStore(null); }}
            className={`flex-1 py-4 px-6 rounded-2xl font-bold transition-all flex items-center justify-center gap-3 ${
              activeView === 'farmers'
                ? 'bg-gradient-to-r from-[#75B06F] to-[#36656B] text-white shadow-lg'
                : 'bg-white text-[#36656B] border border-gray-200 hover:border-[#75B06F]'
            }`}
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Buy from Farmers
          </button>
          <button
            onClick={() => setActiveView('stores')}
            className={`flex-1 py-4 px-6 rounded-2xl font-bold transition-all flex items-center justify-center gap-3 ${
              activeView === 'stores'
                ? 'bg-gradient-to-r from-[#75B06F] to-[#36656B] text-white shadow-lg'
                : 'bg-white text-[#36656B] border border-gray-200 hover:border-[#75B06F]'
            }`}
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
            Buy from Stores in {userCity || 'Your City'}
            {nearbyStores.length > 0 && (
              <span className="ml-2 px-2 py-1 bg-white/20 rounded-full text-sm">
                {nearbyStores.length}
              </span>
            )}
          </button>
        </div>

        {/* Stores View */}
        {activeView === 'stores' && (
          <div className="mb-8">
            {selectedStore ? (
              /* Selected Store Products */
              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-4">
                    <button
                      onClick={handleBackToStores}
                      className="p-2 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors"
                    >
                      <svg className="w-5 h-5 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                      </svg>
                    </button>
                    <div>
                      <h2 className="text-2xl font-bold text-[#36656B]">{selectedStore.storeName}</h2>
                      <p className="text-gray-500">{selectedStore.address}, {selectedStore.city}</p>
                    </div>
                  </div>
                  <span className="px-4 py-2 bg-[#F0F8A4] text-[#36656B] rounded-xl font-semibold">
                    {storeProducts.length} Products Available
                  </span>
                </div>

                {/* Search and Filter for Store Products */}
                <div className="flex gap-3 mb-6">
                  <div className="relative flex-1">
                    <input
                      type="text"
                      placeholder="Search products..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full px-4 py-2 pr-10 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#75B06F] focus:border-transparent"
                    />
                  </div>
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#75B06F]"
                  >
                    <option value="all">All Categories</option>
                    <option value="vegetables">Vegetables</option>
                    <option value="fruits">Fruits</option>
                    <option value="grains">Grains</option>
                    <option value="dairy">Dairy</option>
                    <option value="pulses">Pulses</option>
                  </select>
                </div>

                {loading ? (
                  <div className="text-center py-12">
                    <div className="animate-spin rounded-full h-12 w-12 border-4 border-[#75B06F] border-t-transparent mx-auto"></div>
                  </div>
                ) : storeProducts.length === 0 ? (
                  <div className="text-center py-12 text-gray-500">
                    <svg className="w-16 h-16 mx-auto mb-4 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                    </svg>
                    <p>No products available from this store</p>
                  </div>
                ) : (
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {storeProducts.map((item) => (
                      <div key={item._id} className="bg-white rounded-2xl overflow-hidden hover:shadow-xl transition-all duration-300 border border-gray-100 hover:border-[#75B06F]">
                        <div className="p-5">
                          <div className="flex items-start justify-between mb-3">
                            <div>
                              <h3 className="font-bold text-[#36656B] text-xl mb-1">{item.productName}</h3>
                              <span className="px-2 py-1 bg-[#F0F8A4] text-[#36656B] rounded-full text-xs font-medium">
                                {item.category}
                              </span>
                            </div>
                            <div className="text-right">
                              <div className="text-2xl font-bold text-[#75B06F]">₹{item.salePrice}</div>
                              <div className="text-xs text-gray-500">per {item.unit}</div>
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-4 text-sm text-gray-600 mb-4 pb-4 border-b border-gray-100">
                            <span className="flex items-center gap-1.5 bg-green-50 px-3 py-1.5 rounded-lg">
                              <svg className="w-4 h-4 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                              </svg>
                              <span className="font-semibold text-green-700">{item.saleQuantity} {item.unit} available</span>
                            </span>
                          </div>
                          
                          <button 
                            onClick={() => addStoreProductToCart(item)}
                            className={`w-full py-3 px-4 ${addedToCart[item._id] ? 'bg-green-500' : 'bg-gradient-to-r from-[#75B06F] to-[#36656B]'} text-white rounded-xl font-bold hover:shadow-lg transition-all flex items-center justify-center gap-2`}
                          >
                            {addedToCart[item._id] ? (
                              <>
                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                                Added!
                              </>
                            ) : (
                              <>
                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                                </svg>
                                Add to Cart
                              </>
                            )}
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              /* Stores List */
              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className="text-2xl font-bold text-[#36656B]">Stores in {userCity}</h2>
                    <p className="text-gray-500">Buy fresh products from local stores near you</p>
                  </div>
                </div>

                {storesLoading ? (
                  <div className="text-center py-12">
                    <div className="animate-spin rounded-full h-12 w-12 border-4 border-[#75B06F] border-t-transparent mx-auto"></div>
                  </div>
                ) : nearbyStores.length === 0 ? (
                  <div className="text-center py-12 text-gray-500">
                    <svg className="w-16 h-16 mx-auto mb-4 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                    </svg>
                    <p className="text-lg font-medium mb-2">No stores found in {userCity}</p>
                    <p className="text-sm">Check back later or browse products from farmers</p>
                  </div>
                ) : (
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {nearbyStores.map((store) => (
                      <div 
                        key={store._id} 
                        onClick={() => handleStoreClick(store)}
                        className="bg-gradient-to-br from-white to-gray-50 rounded-2xl p-6 border border-gray-200 hover:border-[#75B06F] hover:shadow-xl transition-all cursor-pointer group"
                      >
                        <div className="flex items-start gap-4 mb-4">
                          <div className="w-14 h-14 bg-gradient-to-br from-[#75B06F] to-[#36656B] rounded-2xl flex items-center justify-center text-white font-bold text-xl shadow-lg group-hover:scale-110 transition-transform">
                            {store.storeName.charAt(0).toUpperCase()}
                          </div>
                          <div className="flex-1">
                            <h3 className="font-bold text-[#36656B] text-lg group-hover:text-[#75B06F] transition-colors">
                              {store.storeName}
                            </h3>
                            <p className="text-sm text-gray-500">{store.storeType} Store</p>
                          </div>
                        </div>
                        
                        <div className="space-y-2 text-sm text-gray-600 mb-4">
                          <p className="flex items-center gap-2">
                            <svg className="w-4 h-4 text-[#75B06F]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                            </svg>
                            {store.address}
                          </p>
                          <p className="flex items-center gap-2">
                            <svg className="w-4 h-4 text-[#75B06F]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                            </svg>
                            {store.phone}
                          </p>
                        </div>
                        
                        <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                          <span className="px-3 py-1 bg-[#F0F8A4] text-[#36656B] rounded-full text-sm font-semibold">
                            {store.itemsForSale} Products
                          </span>
                          <span className="text-[#75B06F] font-semibold flex items-center gap-1 group-hover:gap-2 transition-all">
                            View Store
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Available Products (Farmers) - Only show when activeView is 'farmers' */}
        {activeView === 'farmers' && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
          <div className="mb-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold text-[#36656B]">{t('buyer.availableProducts')}</h2>
              {(searchTerm || selectedCategory !== 'all') && (
                <button
                  onClick={clearFilters}
                  className="flex items-center gap-2 px-4 py-2 bg-red-50 text-red-600 rounded-xl font-semibold hover:bg-red-100 transition-all border border-red-200"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                  {t('buyer.clearFilters')}
                </button>
              )}
            </div>
            <div className="flex gap-3">
              <div className="relative flex-1">
                <input
                  type="text"
                  placeholder={t('buyer.searchPlaceholder')}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full px-4 py-2 pr-10 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#75B06F] focus:border-transparent transition-all"
                />
                {searchTerm && (
                  <button
                    onClick={() => setSearchTerm('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                )}
              </div>
              <div className="relative">
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="px-4 py-2 pr-10 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#75B06F] focus:border-transparent transition-all appearance-none bg-white cursor-pointer"
                >
                  <option value="all">{t('buyer.allCategories')}</option>
                  <option value="vegetables">{t('farmer.vegetables')}</option>
                  <option value="fruits">{t('farmer.fruits')}</option>
                  <option value="grains">{t('farmer.grains')}</option>
                  <option value="dairy">{t('farmer.dairy')}</option>
                  <option value="pulses">{t('farmer.pulses')}</option>
                </select>
                <svg className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>
          </div>
          
          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-4 border-[#75B06F] border-t-transparent mx-auto"></div>
            </div>
          ) : products.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <svg className="w-16 h-16 mx-auto mb-4 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
              <p>{t('buyer.noProductsAvailable')}</p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {products.map((product) => (
                <div key={product._id} className="bg-white rounded-2xl overflow-hidden hover:shadow-2xl transition-all duration-500 group border border-gray-100 hover:border-[#DAD887] hover:-translate-y-2">
                  <div className="relative h-56 overflow-hidden bg-gradient-to-br from-gray-50 to-gray-100">
                    {product.image ? (
                      <img
                        src={product.image}
                        alt={product.name}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <svg className="w-16 h-16 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                      </div>
                    )}
                  </div>
                  
                  <div className="p-5">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <h3 className="font-bold text-[#36656B] text-xl mb-1 group-hover:text-[#75B06F] transition-colors">{product.name}</h3>
                        <p className="text-sm text-gray-500 capitalize font-medium">{product.category}</p>
                      </div>
                      <div className="text-right ml-3">
                        <div className="text-2xl font-bold text-[#75B06F]">₹{product.price}</div>
                        <div className="text-xs text-gray-500 font-medium">per {product.unit}</div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2 mb-3">
                      <div className="w-8 h-8 bg-gradient-to-br from-[#75B06F] to-[#36656B] rounded-full flex items-center justify-center text-white font-bold text-xs shadow-md">
                        {product.farmerName?.charAt(0).toUpperCase() || 'F'}
                      </div>
                      <span className="text-sm text-gray-600 font-medium">{t('buyer.soldBy')} <span className="text-[#36656B] font-semibold">{product.farmerName}</span></span>
                    </div>
                    
                    <div className="flex items-center gap-4 text-sm text-gray-600 mb-4 pb-4 border-b border-gray-100">
                      <span className="flex items-center gap-1.5 bg-[#F0F8A4] px-3 py-1.5 rounded-lg">
                        <svg className="w-4 h-4 text-[#75B06F]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3" />
                        </svg>
                        <span className="font-semibold text-gray-700">{product.quantity} {product.unit}</span>
                      </span>
                      <span className="flex items-center gap-1.5">
                        <svg className="w-4 h-4 text-[#75B06F]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        </svg>
                        <span className="font-medium text-gray-700">{product.location}</span>
                      </span>
                    </div>
                    
                    <div className="flex gap-3">
                      <button 
                        onClick={() => addToCart(product)}
                        className={`flex-1 py-3 px-4 ${addedToCart[product._id] ? 'bg-green-500' : 'bg-gradient-to-r from-[#75B06F] to-[#36656B]'} text-white rounded-xl font-bold hover:shadow-lg hover:shadow-[#75B06F]/40 transition-all hover:scale-105 active:scale-95 flex items-center justify-center gap-2`}
                      >
                        {addedToCart[product._id] ? (
                          <>
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                            {t('buyer.added')}
                          </>
                        ) : (
                          <>
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                            </svg>
                            {t('buyer.addToCart')}
                          </>
                        )}
                      </button>
                      <button className="py-3 px-4 bg-[#F0F8A4] hover:bg-[#DAD887] text-[#36656B] rounded-xl font-bold transition-all hover:scale-105 active:scale-95 border border-[#DAD887]">
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        )}
      </main>
    </div>
  );
}

export default BuyerDashboard;
