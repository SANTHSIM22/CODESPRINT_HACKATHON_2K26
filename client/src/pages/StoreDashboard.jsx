import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api, { API_ENDPOINTS } from '../config/api';
import {
  Store,
  Package,
  ShoppingBag,
  LogOut,
  Menu,
  X,
  TrendingUp,
  AlertTriangle,
  Users,
  DollarSign,
  Search,
  Plus,
  Minus,
  Trash2,
  Edit2,
  Save,
  RefreshCw,
  ChevronRight,
  Leaf,
  BarChart3,
  Tag,
  ShoppingCart,
  ClipboardList,
  Truck,
  CheckCircle
} from 'lucide-react';

function StoreDashboard() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('inventory');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [store, setStore] = useState(null);
  const [inventory, setInventory] = useState([]);
  const [farmersProducts, setFarmersProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [stats, setStats] = useState({
    totalProducts: 0,
    totalValue: 0,
    lowStockItems: 0,
    outOfStockItems: 0,
    uniqueFarmers: 0,
    categoryBreakdown: {}
  });
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [editingItem, setEditingItem] = useState(null);
  const [purchaseModal, setPurchaseModal] = useState({ open: false, product: null });
  const [purchaseQuantity, setPurchaseQuantity] = useState(1);
  const [sellingPrice, setSellingPrice] = useState('');
  
  // Sale modal state
  const [saleModal, setSaleModal] = useState({ open: false, item: null });
  const [saleQuantity, setSaleQuantity] = useState(1);
  const [salePrice, setSalePrice] = useState('');

  const token = localStorage.getItem('storeToken');

  useEffect(() => {
    const storeData = localStorage.getItem('store');
    if (!storeData || !token) {
      navigate('/store/login');
      return;
    }
    setStore(JSON.parse(storeData));
    fetchData();
  }, [navigate, token]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [inventoryRes, productsRes, statsRes, ordersRes] = await Promise.all([
        api.get(API_ENDPOINTS.STORE.INVENTORY),
        api.get(API_ENDPOINTS.STORE.FARMERS_PRODUCTS),
        api.get(API_ENDPOINTS.STORE.DASHBOARD_STATS),
        api.get(API_ENDPOINTS.STORE.ORDERS)
      ]);
      
      setInventory(inventoryRes.data.inventory);
      setFarmersProducts(productsRes.data.products);
      setStats(statsRes.data);
      setOrders(ordersRes.data.orders || []);
    } catch (error) {
      console.error('Error fetching data:', error);
      if (error.response?.status === 401) {
        handleLogout();
      }
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('storeToken');
    localStorage.removeItem('store');
    navigate('/store/login');
  };

  const handlePurchase = async () => {
    if (!purchaseModal.product || purchaseQuantity <= 0) return;
    
    try {
      await api.post(API_ENDPOINTS.STORE.PURCHASE, {
        productId: purchaseModal.product._id,
        quantity: purchaseQuantity,
        sellingPrice: sellingPrice || purchaseModal.product.price * 1.2
      });
      
      setPurchaseModal({ open: false, product: null });
      setPurchaseQuantity(1);
      setSellingPrice('');
      fetchData();
    } catch (error) {
      console.error('Error purchasing product:', error);
      alert(error.response?.data?.error || 'Failed to purchase product');
    }
  };

  const handleUpdateInventory = async (id, data) => {
    try {
      await api.put(API_ENDPOINTS.STORE.INVENTORY_ITEM(id), data);
      setEditingItem(null);
      fetchData();
    } catch (error) {
      console.error('Error updating inventory:', error);
      alert('Failed to update inventory');
    }
  };

  const handleDeleteInventory = async (id) => {
    if (!window.confirm('Are you sure you want to cancel this order? This will restore the product quantity back to the farmer.')) return;
    
    try {
      await api.delete(API_ENDPOINTS.STORE.INVENTORY_ITEM(id));
      alert('Order cancelled successfully');
      fetchData();
    } catch (error) {
      console.error('Error cancelling order:', error);
      alert(error.response?.data?.error || 'Failed to cancel order');
    }
  };

  const handlePutForSale = async () => {
    if (!saleModal.item || saleQuantity <= 0 || !salePrice) return;
    
    try {
      await api.put(API_ENDPOINTS.STORE.INVENTORY_SALE(saleModal.item._id), {
        isForSale: true,
        saleQuantity: parseInt(saleQuantity),
        salePrice: parseFloat(salePrice)
      });
      
      setSaleModal({ open: false, item: null });
      setSaleQuantity(1);
      setSalePrice('');
      fetchData();
      alert('Item put for sale successfully!');
    } catch (error) {
      console.error('Error putting item for sale:', error);
      alert(error.response?.data?.error || 'Failed to put item for sale');
    }
  };

  const handleRemoveFromSale = async (id) => {
    if (!window.confirm('Are you sure you want to remove this item from sale?')) return;
    
    try {
      await api.put(API_ENDPOINTS.STORE.INVENTORY_SALE(id), {
        isForSale: false,
        saleQuantity: 0
      });
      fetchData();
      alert('Item removed from sale');
    } catch (error) {
      console.error('Error removing from sale:', error);
      alert(error.response?.data?.error || 'Failed to remove from sale');
    }
  };

  const handleUpdateOrderStatus = async (orderId, newStatus) => {
    try {
      await api.put(API_ENDPOINTS.STORE.ORDER_STATUS(orderId), {
        status: newStatus
      });
      fetchData();
      alert(`Order status updated to ${newStatus}`);
    } catch (error) {
      console.error('Error updating order status:', error);
      alert(error.response?.data?.error || 'Failed to update order status');
    }
  };

  const filteredInventory = inventory.filter(item =>
    item.productName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredProducts = farmersProducts.filter(product =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Items that are for sale
  const itemsForSale = inventory.filter(item => 
    item.isForSale && 
    (item.productName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.category.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const menuItems = [
    { id: 'inventory', label: 'Inventory', icon: Package },
    { id: 'my-sales', label: 'My Sales', icon: Tag },
    { id: 'orders', label: 'Orders', icon: ClipboardList },
    { id: 'farmers-products', label: 'Farmers Products', icon: Leaf }
  ];

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <div className={`${sidebarOpen ? 'w-64' : 'w-20'} bg-[#36656B] min-h-screen transition-all duration-300 flex flex-col`}>
        {/* Sidebar Header */}
        <div className="p-4 border-b border-[#75B06F]/30">
          <div className="flex items-center justify-between">
            {sidebarOpen && (
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-[#75B06F] rounded-xl flex items-center justify-center">
                  <Store className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h2 className="text-white font-bold text-sm truncate max-w-[140px]">
                    {store?.storeName || 'Store'}
                  </h2>
                  <p className="text-[#DAD887] text-xs">Management</p>
                </div>
              </div>
            )}
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-2 hover:bg-[#75B06F]/20 rounded-lg transition-colors"
            >
              {sidebarOpen ? (
                <X className="w-5 h-5 text-white" />
              ) : (
                <Menu className="w-5 h-5 text-white" />
              )}
            </button>
          </div>
        </div>

        {/* Menu Items */}
        <nav className="flex-1 p-4 space-y-2">
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                activeTab === item.id
                  ? 'bg-[#75B06F] text-white'
                  : 'text-white/70 hover:bg-white/10 hover:text-white'
              }`}
            >
              <item.icon className="w-5 h-5 flex-shrink-0" />
              {sidebarOpen && <span className="font-medium">{item.label}</span>}
            </button>
          ))}
        </nav>

        {/* Logout */}
        <div className="p-4 border-t border-[#75B06F]/30">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 text-white/70 hover:bg-red-500/20 hover:text-red-300 rounded-xl transition-all"
          >
            <LogOut className="w-5 h-5 flex-shrink-0" />
            {sidebarOpen && <span className="font-medium">Logout</span>}
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        {/* Top Bar */}
        <div className="bg-white shadow-sm sticky top-0 z-10">
          <div className="px-6 py-4 flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-[#36656B]">
                {activeTab === 'inventory' ? 'Inventory Management' : 
                 activeTab === 'my-sales' ? 'My Sales' : 
                 activeTab === 'orders' ? 'Customer Orders' : 'Farmers Products'}
              </h1>
              <p className="text-[#36656B]/60 text-sm">
                {activeTab === 'inventory' 
                  ? 'Manage your store inventory' 
                  : activeTab === 'my-sales'
                  ? 'Manage items you have put for sale'
                  : activeTab === 'orders'
                  ? 'Track and manage customer orders'
                  : 'Browse and purchase from farmers'}
              </p>
            </div>
            <div className="flex items-center gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#75B06F] focus:border-transparent w-64"
                />
              </div>
              <button
                onClick={fetchData}
                className="p-2 bg-[#F0F8A4]/50 hover:bg-[#F0F8A4] rounded-xl transition-colors"
              >
                <RefreshCw className={`w-5 h-5 text-[#36656B] ${loading ? 'animate-spin' : ''}`} />
              </button>
            </div>
          </div>
        </div>

        <div className="p-6">
          {/* Stats Cards */}
          {activeTab === 'inventory' && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-[#36656B]/60 text-sm">Total Products</p>
                    <p className="text-2xl font-bold text-[#36656B]">{stats.totalProducts}</p>
                  </div>
                  <div className="w-12 h-12 bg-[#75B06F]/20 rounded-xl flex items-center justify-center">
                    <Package className="w-6 h-6 text-[#75B06F]" />
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-[#36656B]/60 text-sm">Total Value</p>
                    <p className="text-2xl font-bold text-[#36656B]">₹{stats.totalValue?.toLocaleString()}</p>
                  </div>
                  <div className="w-12 h-12 bg-[#DAD887]/30 rounded-xl flex items-center justify-center">
                    <DollarSign className="w-6 h-6 text-[#36656B]" />
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-[#36656B]/60 text-sm">Low Stock Items</p>
                    <p className="text-2xl font-bold text-orange-500">{stats.lowStockItems}</p>
                  </div>
                  <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center">
                    <AlertTriangle className="w-6 h-6 text-orange-500" />
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-[#36656B]/60 text-sm">Partner Farmers</p>
                    <p className="text-2xl font-bold text-[#36656B]">{stats.uniqueFarmers}</p>
                  </div>
                  <div className="w-12 h-12 bg-[#36656B]/10 rounded-xl flex items-center justify-center">
                    <Users className="w-6 h-6 text-[#36656B]" />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Content */}
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#75B06F]"></div>
            </div>
          ) : activeTab === 'inventory' ? (
            /* Inventory Tab */
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100">
              <div className="p-4 border-b border-gray-100">
                <h3 className="font-semibold text-[#36656B]">Your Inventory ({filteredInventory.length} items)</h3>
              </div>
              {filteredInventory.length === 0 ? (
                <div className="p-12 text-center">
                  <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500 text-lg">No inventory items yet</p>
                  <p className="text-gray-400 text-sm mt-2">Purchase products from farmers to add to your inventory</p>
                  <button
                    onClick={() => setActiveTab('farmers-products')}
                    className="mt-4 px-6 py-2 bg-[#75B06F] text-white rounded-xl hover:bg-[#5a9a55] transition-colors"
                  >
                    Browse Farmers Products
                  </button>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-[#36656B] uppercase tracking-wider">Product</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-[#36656B] uppercase tracking-wider">Category</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-[#36656B] uppercase tracking-wider">Ordered</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-[#36656B] uppercase tracking-wider">Available</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-[#36656B] uppercase tracking-wider">Price</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-[#36656B] uppercase tracking-wider">Delivery</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-[#36656B] uppercase tracking-wider">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {filteredInventory.map((item) => (
                        <tr key={item._id} className="hover:bg-gray-50">
                          <td className="px-4 py-4">
                            <p className="font-medium text-[#36656B]">{item.productName}</p>
                            <p className="text-xs text-gray-400">From: {item.farmerName}</p>
                          </td>
                          <td className="px-4 py-4">
                            <span className="px-2 py-1 bg-[#F0F8A4]/50 text-[#36656B] rounded-full text-xs">
                              {item.category}
                            </span>
                          </td>
                          <td className="px-4 py-4">
                            <span className="text-[#36656B]">{item.purchasedQuantity} {item.unit}</span>
                          </td>
                          <td className="px-4 py-4">
                            <span className={`font-medium ${item.deliveryStatus === 'received' ? 'text-green-600' : 'text-gray-400'}`}>
                              {item.availableQuantity} {item.unit}
                            </span>
                          </td>
                          <td className="px-4 py-4">
                            <p className="text-xs text-gray-500">Buy: ₹{item.purchasePrice}/{item.unit}</p>
                            <p className="text-sm font-medium text-[#75B06F]">Sell: ₹{item.sellingPrice}/{item.unit}</p>
                          </td>
                          <td className="px-4 py-4">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                              item.deliveryStatus === 'received' 
                                ? 'bg-green-100 text-green-700' 
                                : 'bg-yellow-100 text-yellow-700'
                            }`}>
                              {item.deliveryStatus === 'received' ? '✓ Received' : '⏳ Pending'}
                            </span>
                          </td>
                          <td className="px-4 py-4">
                            {item.deliveryStatus === 'received' ? (
                              <div className="flex items-center gap-1">
                                {item.isForSale ? (
                                  <span className="px-2 py-1 bg-green-100 text-green-700 rounded-lg text-xs">
                                    ✓ Listed
                                  </span>
                                ) : (
                                  <button
                                    onClick={() => {
                                      setSaleModal({ open: true, item });
                                      setSaleQuantity(item.availableQuantity);
                                      setSalePrice(item.sellingPrice);
                                    }}
                                    className="px-2 py-1 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200 text-xs flex items-center gap-1"
                                    title="Put for sale"
                                  >
                                    <Tag className="w-3 h-3" />
                                    Put for Sale
                                  </button>
                                )}
                              </div>
                            ) : (
                              <div className="flex items-center gap-1">
                                {editingItem === item._id ? (
                                  <button
                                    onClick={() => {
                                      const qty = document.getElementById(`qty-${item._id}`).value;
                                      const price = document.getElementById(`price-${item._id}`).value;
                                      handleUpdateInventory(item._id, {
                                        purchasedQuantity: parseInt(qty),
                                        sellingPrice: parseFloat(price)
                                      });
                                    }}
                                    className="p-1.5 bg-green-100 text-green-600 rounded-lg hover:bg-green-200"
                                  >
                                    <Save className="w-3 h-3" />
                                  </button>
                                ) : (
                                  <button
                                    onClick={() => setEditingItem(item._id)}
                                    className="p-1.5 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200"
                                    title="Edit"
                                  >
                                    <Edit2 className="w-3 h-3" />
                                  </button>
                                )}
                                <button
                                  onClick={() => handleDeleteInventory(item._id)}
                                  className="p-1.5 bg-red-100 text-red-600 rounded-lg hover:bg-red-200"
                                  title="Cancel"
                                >
                                  <Trash2 className="w-3 h-3" />
                                </button>
                              </div>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          ) : activeTab === 'my-sales' ? (
            /* My Sales Tab */
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100">
              <div className="p-4 border-b border-gray-100">
                <h3 className="font-semibold text-[#36656B]">Items for Sale ({itemsForSale.length} items)</h3>
              </div>
              {itemsForSale.length === 0 ? (
                <div className="p-12 text-center">
                  <Tag className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500 text-lg">No items for sale yet</p>
                  <p className="text-gray-400 text-sm mt-2">Go to Inventory and put received items for sale</p>
                  <button
                    onClick={() => setActiveTab('inventory')}
                    className="mt-4 px-6 py-2 bg-[#75B06F] text-white rounded-xl hover:bg-[#5a9a55] transition-colors"
                  >
                    Go to Inventory
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-6">
                  {itemsForSale.map((item) => (
                    <div key={item._id} className="bg-gradient-to-br from-[#F0F8A4]/20 to-white rounded-2xl shadow-sm border border-[#75B06F]/20 overflow-hidden hover:shadow-md transition-shadow">
                      <div className="p-5">
                        <div className="flex items-center justify-between mb-3">
                          <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium flex items-center gap-1">
                            <Tag className="w-3 h-3" />
                            For Sale
                          </span>
                          <span className="text-xl font-bold text-[#75B06F]">₹{item.salePrice}/{item.unit}</span>
                        </div>
                        
                        <h3 className="font-semibold text-[#36656B] text-lg mb-2">{item.productName}</h3>
                        <span className="px-2 py-1 bg-[#F0F8A4]/50 text-[#36656B] rounded-full text-xs">
                          {item.category}
                        </span>
                        
                        <div className="space-y-2 text-sm text-[#36656B]/70 mt-4 mb-4">
                          <p>Quantity for Sale: <span className="font-medium text-[#36656B]">{item.saleQuantity} {item.unit}</span></p>
                          <p>Available Stock: <span className="font-medium text-[#36656B]">{item.availableQuantity} {item.unit}</span></p>
                          <p>Purchase Price: <span className="font-medium text-[#36656B]">₹{item.purchasePrice}/{item.unit}</span></p>
                          <p>Profit/unit: <span className="font-medium text-green-600">₹{(item.salePrice - item.purchasePrice).toFixed(2)}</span></p>
                        </div>
                        
                        <div className="flex gap-2">
                          <button
                            onClick={() => {
                              setSaleModal({ open: true, item });
                              setSaleQuantity(item.saleQuantity);
                              setSalePrice(item.salePrice);
                            }}
                            className="flex-1 py-2 bg-blue-100 text-blue-600 font-medium rounded-xl hover:bg-blue-200 transition-colors flex items-center justify-center gap-2"
                          >
                            <Edit2 className="w-4 h-4" />
                            Edit
                          </button>
                          <button
                            onClick={() => handleRemoveFromSale(item._id)}
                            className="flex-1 py-2 bg-red-100 text-red-600 font-medium rounded-xl hover:bg-red-200 transition-colors flex items-center justify-center gap-2"
                          >
                            <X className="w-4 h-4" />
                            Remove
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : activeTab === 'orders' ? (
            /* Orders Tab */
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100">
              <div className="p-4 border-b border-gray-100">
                <h3 className="font-semibold text-[#36656B]">Customer Orders ({orders.length} orders)</h3>
              </div>
              {orders.length === 0 ? (
                <div className="p-12 text-center">
                  <ClipboardList className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500 text-lg">No orders yet</p>
                  <p className="text-gray-400 text-sm mt-2">When customers buy your products, orders will appear here</p>
                </div>
              ) : (
                <div className="divide-y divide-gray-100">
                  {orders.map((order) => (
                    <div key={order._id} className="p-6 hover:bg-gray-50">
                      <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
                        {/* Order Info */}
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-3">
                            <span className="text-sm font-mono text-[#36656B]/60">#{order._id.slice(-8).toUpperCase()}</span>
                            <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                              order.status === 'delivered' 
                                ? 'bg-green-100 text-green-700' 
                                : order.status === 'shipped' 
                                  ? 'bg-blue-100 text-blue-700' 
                                  : order.status === 'processing'
                                    ? 'bg-yellow-100 text-yellow-700'
                                    : 'bg-gray-100 text-gray-700'
                            }`}>
                              {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                            </span>
                          </div>
                          
                          {/* Customer Info */}
                          <div className="mb-4">
                            <p className="text-sm text-[#36656B]/60">Customer</p>
                            <p className="font-medium text-[#36656B]">{order.buyerName || 'N/A'}</p>
                            <p className="text-sm text-[#36656B]/70">{order.buyerEmail}</p>
                          </div>
                          
                          {/* Shipping Address */}
                          {order.shippingAddress && (
                            <div className="mb-4">
                              <p className="text-sm text-[#36656B]/60">Shipping Address</p>
                              <p className="text-sm text-[#36656B]">
                                {order.shippingAddress.fullName}, {order.shippingAddress.address}, 
                                {order.shippingAddress.city}, {order.shippingAddress.state} - {order.shippingAddress.pincode}
                              </p>
                              <p className="text-sm text-[#36656B]/70">Phone: {order.shippingAddress.phone}</p>
                            </div>
                          )}
                          
                          {/* Items */}
                          <div>
                            <p className="text-sm text-[#36656B]/60 mb-2">Items Ordered</p>
                            <div className="space-y-2">
                              {order.items.map((item, idx) => (
                                <div key={idx} className="flex items-center justify-between bg-[#F0F8A4]/20 rounded-lg px-3 py-2">
                                  <div>
                                    <p className="font-medium text-[#36656B]">{item.productName}</p>
                                    <p className="text-xs text-[#36656B]/60">{item.quantity} {item.unit}</p>
                                  </div>
                                  <p className="font-medium text-[#75B06F]">₹{item.price * item.quantity}</p>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                        
                        {/* Right Side - Total & Actions */}
                        <div className="lg:w-64 bg-gray-50 rounded-xl p-4">
                          <div className="mb-4">
                            <p className="text-sm text-[#36656B]/60">Order Total</p>
                            <p className="text-2xl font-bold text-[#36656B]">₹{order.totalAmount}</p>
                            <p className="text-xs text-[#36656B]/60 mt-1">
                              {new Date(order.createdAt).toLocaleDateString('en-IN', {
                                day: 'numeric',
                                month: 'short',
                                year: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </p>
                          </div>
                          
                          {/* Status Update Buttons */}
                          <div className="space-y-2">
                            {order.status === 'pending' && (
                              <button
                                onClick={() => handleUpdateOrderStatus(order._id, 'processing')}
                                className="w-full py-2 bg-yellow-500 text-white font-medium rounded-lg hover:bg-yellow-600 transition-colors flex items-center justify-center gap-2"
                              >
                                <RefreshCw className="w-4 h-4" />
                                Start Processing
                              </button>
                            )}
                            {order.status === 'processing' && (
                              <button
                                onClick={() => handleUpdateOrderStatus(order._id, 'shipped')}
                                className="w-full py-2 bg-blue-500 text-white font-medium rounded-lg hover:bg-blue-600 transition-colors flex items-center justify-center gap-2"
                              >
                                <Truck className="w-4 h-4" />
                                Mark as Shipped
                              </button>
                            )}
                            {order.status === 'shipped' && (
                              <button
                                onClick={() => handleUpdateOrderStatus(order._id, 'delivered')}
                                className="w-full py-2 bg-green-500 text-white font-medium rounded-lg hover:bg-green-600 transition-colors flex items-center justify-center gap-2"
                              >
                                <CheckCircle className="w-4 h-4" />
                                Mark as Delivered
                              </button>
                            )}
                            {order.status === 'delivered' && (
                              <div className="flex items-center justify-center gap-2 py-2 bg-green-100 text-green-700 rounded-lg">
                                <CheckCircle className="w-4 h-4" />
                                <span className="font-medium">Completed</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : activeTab === 'farmers-products' ? (
            /* Farmers Products Tab */
            <div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredProducts.length === 0 ? (
                  <div className="col-span-full p-12 text-center bg-white rounded-2xl">
                    <Leaf className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500 text-lg">No products available</p>
                    <p className="text-gray-400 text-sm mt-2">Check back later for new products from farmers</p>
                  </div>
                ) : (
                  filteredProducts.map((product) => (
                    <div key={product._id} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow">
                      {product.image && (
                        <div className="h-48 overflow-hidden">
                          <img
                            src={product.image}
                            alt={product.name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      )}
                      <div className="p-5">
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <h3 className="font-semibold text-[#36656B] text-lg">{product.name}</h3>
                            <span className="px-2 py-1 bg-[#F0F8A4]/50 text-[#36656B] rounded-full text-xs">
                              {product.category}
                            </span>
                          </div>
                          <span className="text-xl font-bold text-[#75B06F]">₹{product.price}/{product.unit}</span>
                        </div>
                        
                        <div className="space-y-2 text-sm text-[#36656B]/70 mb-4">
                          <p>Available: <span className="font-medium text-[#36656B]">{product.quantity} {product.unit}</span></p>
                          <p>Farmer: <span className="font-medium text-[#36656B]">{product.farmerName}</span></p>
                          <p>Location: <span className="font-medium text-[#36656B]">{product.location}</span></p>
                        </div>
                        
                        <button
                          onClick={() => {
                            setPurchaseModal({ open: true, product });
                            setSellingPrice((product.price * 1.2).toFixed(2));
                          }}
                          className="w-full py-3 bg-gradient-to-r from-[#36656B] to-[#75B06F] text-white font-medium rounded-xl hover:opacity-90 transition-opacity flex items-center justify-center gap-2"
                        >
                          <ShoppingBag className="w-5 h-5" />
                          Purchase for Store
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          ) : null}
        </div>
      </div>

      {/* Purchase Modal */}
      {purchaseModal.open && purchaseModal.product && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-md p-6">
            <h3 className="text-xl font-bold text-[#36656B] mb-4">Purchase Product</h3>
            <div className="space-y-4">
              <div className="p-4 bg-[#F0F8A4]/30 rounded-xl">
                <p className="font-medium text-[#36656B]">{purchaseModal.product.name}</p>
                <p className="text-sm text-[#36656B]/70">₹{purchaseModal.product.price}/{purchaseModal.product.unit}</p>
                <p className="text-sm text-[#36656B]/70">Available: {purchaseModal.product.quantity} {purchaseModal.product.unit}</p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-[#36656B] mb-2">Quantity</label>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setPurchaseQuantity(Math.max(1, purchaseQuantity - 1))}
                    className="p-2 bg-gray-100 rounded-lg hover:bg-gray-200"
                  >
                    <Minus className="w-5 h-5" />
                  </button>
                  <input
                    type="number"
                    value={purchaseQuantity}
                    onChange={(e) => setPurchaseQuantity(Math.max(1, Math.min(purchaseModal.product.quantity, parseInt(e.target.value) || 1)))}
                    className="w-20 px-3 py-2 text-center border rounded-lg"
                  />
                  <button
                    onClick={() => setPurchaseQuantity(Math.min(purchaseModal.product.quantity, purchaseQuantity + 1))}
                    className="p-2 bg-gray-100 rounded-lg hover:bg-gray-200"
                  >
                    <Plus className="w-5 h-5" />
                  </button>
                  <span className="text-[#36656B]">{purchaseModal.product.unit}</span>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-[#36656B] mb-2">Your Selling Price (per {purchaseModal.product.unit})</label>
                <input
                  type="number"
                  value={sellingPrice}
                  onChange={(e) => setSellingPrice(e.target.value)}
                  className="w-full px-4 py-2 border rounded-lg"
                  placeholder="Enter selling price"
                />
              </div>
              
              <div className="p-4 bg-gray-50 rounded-xl">
                <div className="flex justify-between text-sm">
                  <span className="text-[#36656B]/70">Total Purchase Cost:</span>
                  <span className="font-bold text-[#36656B]">₹{(purchaseModal.product.price * purchaseQuantity).toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-sm mt-2">
                  <span className="text-[#36656B]/70">Expected Profit:</span>
                  <span className="font-bold text-[#75B06F]">
                    ₹{((parseFloat(sellingPrice) - purchaseModal.product.price) * purchaseQuantity).toLocaleString()}
                  </span>
                </div>
              </div>
              
              <div className="flex gap-3">
                <button
                  onClick={() => setPurchaseModal({ open: false, product: null })}
                  className="flex-1 py-3 border border-gray-300 text-[#36656B] rounded-xl hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handlePurchase}
                  className="flex-1 py-3 bg-gradient-to-r from-[#36656B] to-[#75B06F] text-white rounded-xl hover:opacity-90"
                >
                  Confirm Purchase
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Sale Modal */}
      {saleModal.open && saleModal.item && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-md p-6">
            <h3 className="text-xl font-bold text-[#36656B] mb-4">Put Item for Sale</h3>
            <div className="space-y-4">
              <div className="p-4 bg-[#F0F8A4]/30 rounded-xl">
                <p className="font-medium text-[#36656B]">{saleModal.item.productName}</p>
                <p className="text-sm text-[#36656B]/70">Category: {saleModal.item.category}</p>
                <p className="text-sm text-[#36656B]/70">Available: {saleModal.item.availableQuantity} {saleModal.item.unit}</p>
                <p className="text-sm text-[#36656B]/70">Purchase Price: ₹{saleModal.item.purchasePrice}/{saleModal.item.unit}</p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-[#36656B] mb-2">Quantity to Sell</label>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setSaleQuantity(Math.max(1, saleQuantity - 1))}
                    className="p-2 bg-gray-100 rounded-lg hover:bg-gray-200"
                  >
                    <Minus className="w-5 h-5" />
                  </button>
                  <input
                    type="number"
                    value={saleQuantity}
                    onChange={(e) => setSaleQuantity(Math.max(1, Math.min(saleModal.item.availableQuantity, parseInt(e.target.value) || 1)))}
                    className="w-20 px-3 py-2 text-center border rounded-lg"
                  />
                  <button
                    onClick={() => setSaleQuantity(Math.min(saleModal.item.availableQuantity, saleQuantity + 1))}
                    className="p-2 bg-gray-100 rounded-lg hover:bg-gray-200"
                  >
                    <Plus className="w-5 h-5" />
                  </button>
                  <span className="text-[#36656B]">{saleModal.item.unit}</span>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-[#36656B] mb-2">Sale Price (per {saleModal.item.unit})</label>
                <input
                  type="number"
                  value={salePrice}
                  onChange={(e) => setSalePrice(e.target.value)}
                  className="w-full px-4 py-2 border rounded-lg"
                  placeholder="Enter sale price"
                />
              </div>
              
              <div className="p-4 bg-gray-50 rounded-xl">
                <div className="flex justify-between text-sm">
                  <span className="text-[#36656B]/70">Total Sale Value:</span>
                  <span className="font-bold text-[#36656B]">₹{(parseFloat(salePrice || 0) * saleQuantity).toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-sm mt-2">
                  <span className="text-[#36656B]/70">Profit per {saleModal.item.unit}:</span>
                  <span className={`font-bold ${(parseFloat(salePrice || 0) - saleModal.item.purchasePrice) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    ₹{(parseFloat(salePrice || 0) - saleModal.item.purchasePrice).toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between text-sm mt-2">
                  <span className="text-[#36656B]/70">Total Profit:</span>
                  <span className={`font-bold ${(parseFloat(salePrice || 0) - saleModal.item.purchasePrice) * saleQuantity >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    ₹{((parseFloat(salePrice || 0) - saleModal.item.purchasePrice) * saleQuantity).toLocaleString()}
                  </span>
                </div>
              </div>
              
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setSaleModal({ open: false, item: null });
                    setSaleQuantity(1);
                    setSalePrice('');
                  }}
                  className="flex-1 py-3 border border-gray-300 text-[#36656B] rounded-xl hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handlePutForSale}
                  disabled={!salePrice || saleQuantity <= 0}
                  className="flex-1 py-3 bg-gradient-to-r from-[#36656B] to-[#75B06F] text-white rounded-xl hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  <Tag className="w-5 h-5" />
                  Put for Sale
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default StoreDashboard;
