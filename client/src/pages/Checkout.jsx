import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api, { API_ENDPOINTS } from '../config/api';

function Checkout() {
  const [cart, setCart] = useState([]);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1); // 1: Store Selection, 2: Shipping Details, 3: Payment
  const [orderSuccess, setOrderSuccess] = useState(false);
  const [orderId, setOrderId] = useState(null);
  const [pickupCode, setPickupCode] = useState(null);
  const [selectedStoreDetails, setSelectedStoreDetails] = useState(null);
  
  // Store selection state
  const [stores, setStores] = useState([]);
  const [availableCities, setAvailableCities] = useState([]);
  const [selectedCity, setSelectedCity] = useState('');
  const [selectedStore, setSelectedStore] = useState(null);
  const [loadingStores, setLoadingStores] = useState(false);
  
  const [formData, setFormData] = useState({
    shippingAddress: '',
    contactNumber: '',
    notes: ''
  });
  const navigate = useNavigate();

  useEffect(() => {
    const userData = JSON.parse(localStorage.getItem('user'));
    const token = localStorage.getItem('token');
    
    if (!userData || !token || userData.userType !== 'buyer') {
      navigate('/login');
      return;
    }
    
    setUser(userData);
    
    const savedCart = JSON.parse(localStorage.getItem('cart')) || [];
    if (savedCart.length === 0) {
      navigate('/buyer/cart');
      return;
    }
    setCart(savedCart);
    
    // Fetch delivery stores
    fetchDeliveryStores();
  }, [navigate]);

  const fetchDeliveryStores = async (city = '') => {
    setLoadingStores(true);
    try {
      const response = await api.get(API_ENDPOINTS.BUYER.DELIVERY_STORES, {
        params: city ? { city } : {}
      });
      setStores(response.data.stores);
      setAvailableCities(response.data.availableCities || []);
      if (!selectedCity && response.data.userCity) {
        setSelectedCity(response.data.userCity);
      }
    } catch (error) {
      console.error('Error fetching stores:', error);
    } finally {
      setLoadingStores(false);
    }
  };

  const handleCityChange = (city) => {
    setSelectedCity(city);
    setSelectedStore(null);
    fetchDeliveryStores(city);
  };

  const getTotalAmount = () => {
    return cart.reduce((total, item) => total + (item.price * item.cartQuantity), 0);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSelectStore = (store) => {
    setSelectedStore(store);
  };

  const handleProceedToShipping = () => {
    if (!selectedStore) {
      alert('Please select a pickup store');
      return;
    }
    setStep(2);
  };

  const handleProceedToPayment = () => {
    if (!formData.shippingAddress || !formData.contactNumber) {
      alert('Please fill in shipping address and contact number');
      return;
    }
    setStep(3);
  };

  const handlePaymentDone = async () => {
    setLoading(true);
    try {
      const orderItems = cart.map(item => ({
        productId: item._id,
        quantity: item.cartQuantity,
        isStoreProduct: item.isStoreProduct || false
      }));

      const response = await api.post(
        API_ENDPOINTS.ORDERS.CREATE,
        {
          items: orderItems,
          shippingAddress: formData.shippingAddress,
          contactNumber: formData.contactNumber,
          notes: formData.notes,
          selectedStoreId: selectedStore._id,
          orderType: 'store_pickup'
        }
      );

      // Clear cart
      localStorage.removeItem('cart');
      
      setOrderId(response.data.orderId);
      setPickupCode(response.data.pickupCode);
      setSelectedStoreDetails(response.data.selectedStore);
      setOrderSuccess(true);
    } catch (error) {
      console.error('Error placing order:', error);
      alert('Failed to place order. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (!user) return <div>Loading...</div>;

  // Success Screen
  if (orderSuccess) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8 max-w-lg w-full text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-8 h-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          
          <h1 className="text-2xl font-bold text-[#36656B] mb-2">Order Confirmed!</h1>
          <p className="text-gray-600 mb-6">Your order will be delivered to the selected store for pickup.</p>
          
          <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 mb-4">
            <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Order Reference</p>
            <p className="font-mono font-semibold text-[#36656B]">{orderId}</p>
          </div>
          
          {/* Pickup Code - Important */}
          <div className="bg-[#F0F8A4] border-2 border-[#DAD887] rounded-xl p-4 mb-4">
            <p className="text-xs text-[#36656B] uppercase tracking-wide mb-1">Your Pickup Code</p>
            <p className="text-3xl font-mono font-bold text-[#36656B]">{pickupCode}</p>
            <p className="text-sm text-[#36656B]/70 mt-2">Show this code at the store to collect your order</p>
          </div>

          {/* Store Details */}
          {selectedStoreDetails && (
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-4 text-left">
              <h3 className="text-sm font-semibold text-blue-800 uppercase tracking-wide mb-2 flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
                Pickup Store
              </h3>
              <p className="font-medium text-blue-900">{selectedStoreDetails.name}</p>
              <p className="text-sm text-blue-700">{selectedStoreDetails.address}</p>
              <p className="text-sm text-blue-700">{selectedStoreDetails.city}</p>
              <p className="text-sm text-blue-700">Phone: {selectedStoreDetails.phone}</p>
            </div>
          )}

          {/* Order Flow Info */}
          <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 mb-6 text-left">
            <h3 className="text-sm font-semibold text-[#36656B] uppercase tracking-wide mb-3">What happens next?</h3>
            <div className="space-y-3 text-sm">
              <div className="flex items-start gap-3">
                <span className="w-6 h-6 bg-[#75B06F] text-white rounded-full flex items-center justify-center text-xs flex-shrink-0">1</span>
                <p className="text-gray-600">Farmer will ship your order to the store</p>
              </div>
              <div className="flex items-start gap-3">
                <span className="w-6 h-6 bg-[#75B06F] text-white rounded-full flex items-center justify-center text-xs flex-shrink-0">2</span>
                <p className="text-gray-600">Store will check quality of products</p>
              </div>
              <div className="flex items-start gap-3">
                <span className="w-6 h-6 bg-[#75B06F] text-white rounded-full flex items-center justify-center text-xs flex-shrink-0">3</span>
                <p className="text-gray-600">You'll be notified when ready for pickup</p>
              </div>
              <div className="flex items-start gap-3">
                <span className="w-6 h-6 bg-[#75B06F] text-white rounded-full flex items-center justify-center text-xs flex-shrink-0">4</span>
                <p className="text-gray-600">Show your pickup code at the store to collect</p>
              </div>
              <div className="flex items-start gap-3">
                <span className="w-6 h-6 bg-[#75B06F] text-white rounded-full flex items-center justify-center text-xs flex-shrink-0">5</span>
                <p className="text-gray-600">Payment is released to farmer after delivery</p>
              </div>
            </div>
          </div>
          
          <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 mb-6 text-left">
            <h3 className="text-sm font-semibold text-[#36656B] uppercase tracking-wide mb-3">Order Summary</h3>
            <div className="space-y-2 text-sm">
              {cart.map(item => (
                <div key={item._id} className="flex justify-between">
                  <span className="text-gray-600">{item.name} x{item.cartQuantity}</span>
                  <span className="font-medium">₹{(item.price * item.cartQuantity).toLocaleString()}</span>
                </div>
              ))}
              <div className="border-t pt-2 mt-2 flex justify-between font-bold">
                <span>Total (Payment Held)</span>
                <span className="text-[#75B06F]">₹{getTotalAmount().toLocaleString()}</span>
              </div>
            </div>
          </div>
          
          <div className="flex gap-3">
            <Link 
              to="/buyer/orders"
              className="flex-1 py-3 bg-[#36656B] text-white rounded-lg font-semibold hover:bg-[#2a5155] transition-all text-center"
            >
              View Orders
            </Link>
            <Link 
              to="/buyer/dashboard"
              className="flex-1 py-3 bg-white border border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition-all text-center"
            >
              Continue Shopping
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link to="/buyer/dashboard" className="flex items-center gap-3">
              <div className="relative">
                <div className="absolute inset-0 bg-[#75B06F] rounded-xl blur-lg opacity-30"></div>
                <svg className="w-10 h-10 relative" viewBox="0 0 24 24" fill="none">
                  <path d="M12 2L13.09 8.26L19 6L14.74 10.91L21 12L14.74 13.09L19 18L13.09 15.74L12 22L10.91 15.74L5 18L9.26 13.09L3 12L9.26 10.91L5 6L10.91 8.26L12 2Z" fill="#75B06F"/>
                </svg>
              </div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-[#36656B] to-[#75B06F] bg-clip-text text-transparent">AuraFarm</h1>
            </Link>
          </div>
          
          <div className="flex items-center gap-4">
            <Link 
              to="/buyer/cart"
              className="px-4 py-2 text-[#36656B] hover:bg-gray-100 rounded-lg transition-colors font-medium"
            >
              ← Back to Cart
            </Link>
          </div>
        </div>
      </header>

      {/* Progress Steps */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className={`flex items-center gap-2 ${step >= 1 ? 'text-[#75B06F]' : 'text-gray-400'}`}>
              <span className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${step >= 1 ? 'bg-[#75B06F] text-white' : 'bg-gray-200'}`}>1</span>
              <span className="font-medium">Select Store</span>
            </div>
            <div className={`flex-1 h-1 mx-4 ${step >= 2 ? 'bg-[#75B06F]' : 'bg-gray-200'}`}></div>
            <div className={`flex items-center gap-2 ${step >= 2 ? 'text-[#75B06F]' : 'text-gray-400'}`}>
              <span className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${step >= 2 ? 'bg-[#75B06F] text-white' : 'bg-gray-200'}`}>2</span>
              <span className="font-medium">Shipping</span>
            </div>
            <div className={`flex-1 h-1 mx-4 ${step >= 3 ? 'bg-[#75B06F]' : 'bg-gray-200'}`}></div>
            <div className={`flex items-center gap-2 ${step >= 3 ? 'text-[#75B06F]' : 'text-gray-400'}`}>
              <span className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${step >= 3 ? 'bg-[#75B06F] text-white' : 'bg-gray-200'}`}>3</span>
              <span className="font-medium">Payment</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-6 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-[#36656B] mb-2">Checkout</h1>
          <p className="text-gray-600 text-lg">
            {step === 1 && 'Select a nearby store for pickup'}
            {step === 2 && 'Enter your shipping details'}
            {step === 3 && 'Complete your payment'}
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Section */}
          <div className="lg:col-span-2">
            {/* Step 1: Store Selection */}
            {step === 1 && (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
                <h2 className="text-xl font-bold text-[#36656B] mb-2">Select Pickup Store</h2>
                <p className="text-gray-500 text-sm mb-6">
                  Your order will be delivered to the selected store. You can pick it up after the store verifies the quality.
                </p>

                {/* City Filter */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Filter by City</label>
                  <select
                    value={selectedCity}
                    onChange={(e) => handleCityChange(e.target.value)}
                    className="w-full md:w-64 px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#75B06F] focus:border-transparent"
                  >
                    <option value="">All Cities</option>
                    {availableCities.map(city => (
                      <option key={city} value={city}>{city}</option>
                    ))}
                  </select>
                </div>

                {/* Store List */}
                {loadingStores ? (
                  <div className="flex items-center justify-center py-12">
                    <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#75B06F]"></div>
                  </div>
                ) : stores.length === 0 ? (
                  <div className="text-center py-12 bg-gray-50 rounded-xl">
                    <svg className="w-16 h-16 mx-auto mb-4 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                    </svg>
                    <p className="text-gray-500">No stores available in this area</p>
                    <p className="text-sm text-gray-400 mt-2">Try selecting a different city</p>
                  </div>
                ) : (
                  <div className="space-y-4 max-h-[500px] overflow-y-auto">
                    {stores.map(store => (
                      <div
                        key={store._id}
                        onClick={() => handleSelectStore(store)}
                        className={`p-4 border-2 rounded-xl cursor-pointer transition-all hover:shadow-md ${
                          selectedStore?._id === store._id 
                            ? 'border-[#75B06F] bg-[#F0F8A4]/20' 
                            : 'border-gray-200 hover:border-[#75B06F]/50'
                        }`}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex items-start gap-4">
                            <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                              selectedStore?._id === store._id ? 'bg-[#75B06F]' : 'bg-gray-100'
                            }`}>
                              <svg className={`w-6 h-6 ${selectedStore?._id === store._id ? 'text-white' : 'text-gray-500'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                              </svg>
                            </div>
                            <div>
                              <h3 className="font-bold text-[#36656B]">{store.storeName}</h3>
                              <p className="text-sm text-gray-600">{store.address}</p>
                              <p className="text-sm text-gray-500">{store.city}, {store.state} - {store.pincode}</p>
                              <p className="text-sm text-gray-500 mt-1">📞 {store.phone}</p>
                            </div>
                          </div>
                          {selectedStore?._id === store._id && (
                            <div className="w-6 h-6 bg-[#75B06F] rounded-full flex items-center justify-center">
                              <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                              </svg>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                <button
                  onClick={handleProceedToShipping}
                  disabled={!selectedStore}
                  className="w-full mt-6 py-4 bg-gradient-to-r from-[#75B06F] to-[#36656B] text-white rounded-xl font-bold hover:shadow-lg hover:shadow-[#75B06F]/40 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Continue to Shipping Details
                </button>
              </div>
            )}

            {/* Step 2: Shipping Details */}
            {step === 2 && (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold text-[#36656B]">Shipping Details</h2>
                  <button
                    onClick={() => setStep(1)}
                    className="text-sm text-[#36656B] hover:text-[#75B06F]"
                  >
                    ← Change Store
                  </button>
                </div>

                {/* Selected Store Info */}
                <div className="bg-[#F0F8A4]/30 border border-[#DAD887] rounded-xl p-4 mb-6">
                  <p className="text-xs text-[#36656B] uppercase tracking-wide mb-1">Pickup Store</p>
                  <p className="font-bold text-[#36656B]">{selectedStore?.storeName}</p>
                  <p className="text-sm text-gray-600">{selectedStore?.address}, {selectedStore?.city}</p>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Your Address (for records) *</label>
                    <textarea
                      name="shippingAddress"
                      value={formData.shippingAddress}
                      onChange={handleInputChange}
                      rows={3}
                      placeholder="Enter your full address"
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#75B06F] focus:border-transparent transition-all resize-none"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Contact Number *</label>
                    <input
                      type="tel"
                      name="contactNumber"
                      value={formData.contactNumber}
                      onChange={handleInputChange}
                      placeholder="Enter your contact number"
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#75B06F] focus:border-transparent transition-all"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Notes (Optional)</label>
                    <textarea
                      name="notes"
                      value={formData.notes}
                      onChange={handleInputChange}
                      rows={2}
                      placeholder="Any special instructions"
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#75B06F] focus:border-transparent transition-all resize-none"
                    />
                  </div>
                </div>

                <button
                  onClick={handleProceedToPayment}
                  className="w-full mt-6 py-4 bg-gradient-to-r from-[#75B06F] to-[#36656B] text-white rounded-xl font-bold hover:shadow-lg hover:shadow-[#75B06F]/40 transition-all"
                >
                  Proceed to Payment
                </button>
              </div>
            )}

            {/* Step 3: Payment */}
            {step === 3 && (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold text-[#36656B]">Payment</h2>
                  <button
                    onClick={() => setStep(2)}
                    className="text-sm text-[#36656B] hover:text-[#75B06F]"
                  >
                    ← Edit Details
                  </button>
                </div>

                {/* Payment Info Notice */}
                <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6">
                  <div className="flex items-start gap-3">
                    <svg className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <div>
                      <p className="font-medium text-blue-800">Secure Payment</p>
                      <p className="text-sm text-blue-600">Your payment will be held securely until you receive the order. The amount will be released to the farmer only after the store confirms quality and delivery.</p>
                    </div>
                  </div>
                </div>

                {/* QR Code */}
                <div className="flex flex-col items-center">
                  <div className="bg-white p-4 rounded-2xl border-2 border-[#DAD887] mb-4">
                    <div className="w-48 h-48 bg-gradient-to-br from-gray-100 to-gray-200 rounded-xl flex flex-col items-center justify-center relative overflow-hidden">
                      <svg viewBox="0 0 100 100" className="w-full h-full p-2">
                        <rect x="0" y="0" width="100" height="100" fill="white"/>
                        <g fill="black">
                          <rect x="5" y="5" width="20" height="20"/>
                          <rect x="8" y="8" width="14" height="14" fill="white"/>
                          <rect x="11" y="11" width="8" height="8"/>
                          <rect x="75" y="5" width="20" height="20"/>
                          <rect x="78" y="8" width="14" height="14" fill="white"/>
                          <rect x="81" y="11" width="8" height="8"/>
                          <rect x="5" y="75" width="20" height="20"/>
                          <rect x="8" y="78" width="14" height="14" fill="white"/>
                          <rect x="11" y="81" width="8" height="8"/>
                          <rect x="30" y="5" width="5" height="5"/>
                          <rect x="40" y="5" width="5" height="5"/>
                          <rect x="55" y="5" width="5" height="5"/>
                          <rect x="65" y="5" width="5" height="5"/>
                          <rect x="30" y="15" width="5" height="5"/>
                          <rect x="45" y="15" width="5" height="5"/>
                          <rect x="60" y="15" width="5" height="5"/>
                          <rect x="5" y="30" width="5" height="5"/>
                          <rect x="15" y="30" width="5" height="5"/>
                          <rect x="30" y="30" width="5" height="5"/>
                          <rect x="45" y="30" width="10" height="10"/>
                          <rect x="65" y="30" width="5" height="5"/>
                          <rect x="80" y="30" width="5" height="5"/>
                          <rect x="30" y="45" width="5" height="5"/>
                          <rect x="60" y="45" width="10" height="10"/>
                          <rect x="80" y="45" width="5" height="5"/>
                          <rect x="90" y="45" width="5" height="5"/>
                          <rect x="5" y="55" width="5" height="5"/>
                          <rect x="20" y="55" width="5" height="5"/>
                          <rect x="35" y="55" width="5" height="5"/>
                          <rect x="50" y="55" width="5" height="5"/>
                          <rect x="75" y="55" width="5" height="5"/>
                          <rect x="30" y="65" width="5" height="5"/>
                          <rect x="40" y="65" width="5" height="5"/>
                          <rect x="55" y="65" width="5" height="5"/>
                          <rect x="70" y="65" width="5" height="5"/>
                          <rect x="85" y="65" width="5" height="5"/>
                          <rect x="30" y="80" width="5" height="5"/>
                          <rect x="45" y="75" width="5" height="5"/>
                          <rect x="55" y="85" width="5" height="5"/>
                          <rect x="70" y="80" width="5" height="5"/>
                          <rect x="85" y="75" width="5" height="5"/>
                          <rect x="90" y="85" width="5" height="5"/>
                        </g>
                      </svg>
                    </div>
                  </div>
                  
                  <div className="text-center mb-4">
                    <p className="text-2xl font-bold text-[#75B06F] mb-1">₹{getTotalAmount().toLocaleString()}</p>
                    <p className="text-sm text-gray-500">Scan QR code to pay (Amount will be held)</p>
                  </div>
                  
                  <div className="w-full bg-[#F0F8A4] rounded-xl p-4 mb-6 text-sm">
                    <p className="font-medium text-gray-700 mb-2">Payment Details:</p>
                    <p className="text-gray-600">Merchant: AuraFarm</p>
                    <p className="text-gray-600">Items: {cart.length} products</p>
                    <p className="text-gray-600">Pickup: {selectedStore?.storeName}</p>
                    <p className="text-gray-600">Buyer: {user?.name}</p>
                  </div>
                  
                  <button
                    onClick={handlePaymentDone}
                    disabled={loading}
                    className="w-full py-4 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-xl font-bold hover:shadow-lg transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {loading ? (
                      <>
                        <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
                        </svg>
                        Processing...
                      </>
                    ) : (
                      <>
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        Payment Done - Place Order
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Order Summary Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 sticky top-8">
              <h2 className="text-xl font-bold text-[#36656B] mb-4">Order Summary</h2>
              
              <div className="space-y-3 max-h-64 overflow-y-auto mb-4">
                {cart.map(item => (
                  <div key={item._id} className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                      {item.image ? (
                        <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-400">
                          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-[#36656B] text-sm truncate">{item.name}</p>
                      <p className="text-xs text-gray-500">x{item.cartQuantity} {item.unit}</p>
                    </div>
                    <p className="font-bold text-[#75B06F] text-sm">₹{(item.price * item.cartQuantity).toLocaleString()}</p>
                  </div>
                ))}
              </div>
              
              <div className="border-t pt-3 space-y-2">
                <div className="flex justify-between text-gray-600 text-sm">
                  <span>Subtotal</span>
                  <span>₹{getTotalAmount().toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-gray-600 text-sm">
                  <span>Delivery to Store</span>
                  <span className="text-green-600">Free</span>
                </div>
                <div className="flex justify-between text-lg font-bold text-[#36656B] pt-2 border-t">
                  <span>Total</span>
                  <span>₹{getTotalAmount().toLocaleString()}</span>
                </div>
              </div>

              {selectedStore && (
                <div className="mt-4 pt-4 border-t">
                  <p className="text-xs text-gray-500 uppercase tracking-wide mb-2">Pickup Location</p>
                  <p className="font-medium text-[#36656B] text-sm">{selectedStore.storeName}</p>
                  <p className="text-xs text-gray-500">{selectedStore.city}, {selectedStore.state}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default Checkout;
