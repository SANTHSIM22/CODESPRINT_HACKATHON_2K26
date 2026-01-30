import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

function BuyerDashboard() {
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
  }, [navigate]);

  // Live search and filter effect
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token && user) {
      fetchProducts(token);
    }
  }, [searchTerm, selectedCategory]);

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
            <span className="text-2xl font-bold bg-gradient-to-r from-[#36656B] to-[#75B06F] bg-clip-text text-transparent">AuraFarm</span>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-sm text-gray-500">Welcome back,</p>
              <p className="font-bold text-[#36656B]">{user.name}</p>
            </div>
            <div className="w-12 h-12 bg-gradient-to-br from-[#75B06F] to-[#36656B] rounded-full flex items-center justify-center text-white font-bold text-lg shadow-lg">
              {user.name.charAt(0).toUpperCase()}
            </div>
            <button
              onClick={handleLogout}
              className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors font-medium"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-[#36656B] mb-2">Buyer Dashboard</h1>
          <p className="text-gray-600 text-lg">Browse fresh products and connect with farmers</p>
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
            <p className="text-gray-600 text-sm font-medium">Total Purchases</p>
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
            <p className="text-gray-600 text-sm font-medium">Active Bids</p>
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
            <p className="text-gray-600 text-sm font-medium">Total Spent</p>
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
            <p className="text-gray-600 text-sm font-medium">Saved Listings</p>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 mb-8">
          <h2 className="text-2xl font-bold text-[#36656B] mb-6">Quick Actions</h2>
          <div className="grid md:grid-cols-3 gap-4">
            <button className="flex items-center gap-3 p-5 bg-[#F0F8A4] rounded-xl transition-all shadow-sm hover:shadow-md border border-[#DAD887]">
              <div className="w-12 h-12 bg-[#36656B] rounded-xl flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <span className="font-bold text-gray-900">Browse Products</span>
            </button>
            
            <button className="flex items-center gap-3 p-5 bg-[#f0f8a4] rounded-xl transition-all shadow-sm hover:shadow-md border border-[#DAD887]">
              <div className="w-12 h-12 bg-[#36656B] rounded-xl flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <span className="font-bold text-gray-900">Market Insights</span>
            </button>
            
            <button className="flex items-center gap-3 p-5 bg-[#f0f8a4] rounded-xl transition-all shadow-sm hover:shadow-md border border-[#DAD887]">
              <div className="w-12 h-12 bg-[#36656b] rounded-xl flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                </svg>
              </div>
              <span className="font-bold text-black">Contact Farmers</span>
            </button>
          </div>
        </div>

        {/* Available Products */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
          <div className="mb-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold text-[#36656B]">Available Products</h2>
              {(searchTerm || selectedCategory !== 'all') && (
                <button
                  onClick={clearFilters}
                  className="flex items-center gap-2 px-4 py-2 bg-red-50 text-red-600 rounded-xl font-semibold hover:bg-red-100 transition-all border border-red-200"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                  Clear Filters
                </button>
              )}
            </div>
            <div className="flex gap-3">
              <div className="relative flex-1">
                <input
                  type="text"
                  placeholder="Search products, farmers, locations..."
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
                  <option value="all">All Categories</option>
                  <option value="vegetables">Vegetables</option>
                  <option value="fruits">Fruits</option>
                  <option value="grains">Grains</option>
                  <option value="dairy">Dairy</option>
                  <option value="pulses">Pulses</option>
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
              <p>No products available at the moment</p>
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
                      <span className="text-sm text-gray-600 font-medium">Sold by <span className="text-[#36656B] font-semibold">{product.farmerName}</span></span>
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
                      <button className="flex-1 py-3 px-4 bg-gradient-to-r from-[#75B06F] to-[#36656B] text-white rounded-xl font-bold hover:shadow-lg hover:shadow-[#75B06F]/40 transition-all hover:scale-105 active:scale-95 flex items-center justify-center gap-2">
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                        </svg>
                        Add to Cart
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
      </main>
    </div>
  );
}

export default BuyerDashboard;
