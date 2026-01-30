import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';

function Checkout() {
  const [cart, setCart] = useState([]);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showQR, setShowQR] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(false);
  const [orderId, setOrderId] = useState(null);
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
  }, [navigate]);

  const getTotalAmount = () => {
    return cart.reduce((total, item) => total + (item.price * item.cartQuantity), 0);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleProceedToPayment = () => {
    if (!formData.shippingAddress || !formData.contactNumber) {
      alert('Please fill in shipping address and contact number');
      return;
    }
    setShowQR(true);
  };

  const handlePaymentDone = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      
      const orderItems = cart.map(item => ({
        productId: item._id,
        quantity: item.cartQuantity
      }));

      const response = await axios.post(
        'http://localhost:5000/api/orders/create',
        {
          items: orderItems,
          shippingAddress: formData.shippingAddress,
          contactNumber: formData.contactNumber,
          notes: formData.notes
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // Clear cart
      localStorage.removeItem('cart');
      
      setOrderId(response.data.orderId);
      setOrderSuccess(true);
    } catch (error) {
      console.error('Error placing order:', error);
      alert('Failed to place order. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const generateQRData = () => {
    const data = {
      merchant: 'AuraFarm',
      amount: getTotalAmount(),
      items: cart.map(item => `${item.name} x${item.cartQuantity}`).join(', '),
      buyer: user?.name,
      timestamp: new Date().toISOString()
    };
    return JSON.stringify(data, null, 2);
  };

  if (!user) return <div>Loading...</div>;

  // Success Screen
  if (orderSuccess) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8 max-w-md w-full text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-8 h-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          
          <h1 className="text-2xl font-bold text-[#36656B] mb-2">Order Confirmed</h1>
          <p className="text-gray-600 mb-6">Your order has been placed successfully. You will receive a confirmation shortly.</p>
          
          <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 mb-6">
            <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Order Reference</p>
            <p className="font-mono font-semibold text-[#36656B]">{orderId}</p>
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
                <span>Total Paid</span>
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

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-6 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-[#36656B] mb-2">Checkout</h1>
          <p className="text-gray-600 text-lg">Complete your order</p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Shipping Details */}
          <div className={`bg-white rounded-2xl shadow-sm border border-gray-200 p-6 ${showQR ? 'opacity-50' : ''}`}>
            <h2 className="text-xl font-bold text-[#36656B] mb-6 flex items-center gap-2">
              <span className="w-8 h-8 bg-[#75B06F] text-white rounded-full flex items-center justify-center text-sm">1</span>
              Shipping Details
            </h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Shipping Address *</label>
                <textarea
                  name="shippingAddress"
                  value={formData.shippingAddress}
                  onChange={handleInputChange}
                  disabled={showQR}
                  rows={3}
                  placeholder="Enter your full shipping address"
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#75B06F] focus:border-transparent transition-all resize-none disabled:bg-gray-100"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Contact Number *</label>
                <input
                  type="tel"
                  name="contactNumber"
                  value={formData.contactNumber}
                  onChange={handleInputChange}
                  disabled={showQR}
                  placeholder="Enter your contact number"
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#75B06F] focus:border-transparent transition-all disabled:bg-gray-100"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Notes (Optional)</label>
                <textarea
                  name="notes"
                  value={formData.notes}
                  onChange={handleInputChange}
                  disabled={showQR}
                  rows={2}
                  placeholder="Any special instructions for delivery"
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#75B06F] focus:border-transparent transition-all resize-none disabled:bg-gray-100"
                />
              </div>
            </div>

            {!showQR && (
              <button
                onClick={handleProceedToPayment}
                className="w-full mt-6 py-4 bg-gradient-to-r from-[#75B06F] to-[#36656B] text-white rounded-xl font-bold hover:shadow-lg hover:shadow-[#75B06F]/40 transition-all"
              >
                Proceed to Payment
              </button>
            )}
          </div>

          {/* Payment Section */}
          <div className="space-y-6">
            {/* Order Summary */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-xl font-bold text-[#36656B] mb-4">Order Summary</h2>
              
              <div className="space-y-3 max-h-48 overflow-y-auto mb-4">
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
                    <div className="flex-1">
                      <p className="font-medium text-[#36656B]">{item.name}</p>
                      <p className="text-xs text-gray-500">x{item.cartQuantity} {item.unit}</p>
                    </div>
                    <p className="font-bold text-[#75B06F]">₹{(item.price * item.cartQuantity).toLocaleString()}</p>
                  </div>
                ))}
              </div>
              
              <div className="border-t pt-3 flex justify-between text-lg font-bold text-[#36656B]">
                <span>Total Amount</span>
                <span>₹{getTotalAmount().toLocaleString()}</span>
              </div>
            </div>

            {/* QR Code Section */}
            {showQR && (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
                <h2 className="text-xl font-bold text-[#36656B] mb-4 flex items-center gap-2">
                  <span className="w-8 h-8 bg-[#75B06F] text-white rounded-full flex items-center justify-center text-sm">2</span>
                  Scan & Pay
                </h2>
                
                <div className="flex flex-col items-center">
                  {/* QR Code Display */}
                  <div className="bg-white p-4 rounded-2xl border-2 border-[#DAD887] mb-4">
                    <div className="w-48 h-48 bg-gradient-to-br from-gray-100 to-gray-200 rounded-xl flex flex-col items-center justify-center relative overflow-hidden">
                      {/* Simulated QR Code Pattern */}
                      <svg viewBox="0 0 100 100" className="w-full h-full p-2">
                        <rect x="0" y="0" width="100" height="100" fill="white"/>
                        {/* QR Pattern simulation */}
                        <g fill="black">
                          {/* Corner squares */}
                          <rect x="5" y="5" width="20" height="20"/>
                          <rect x="8" y="8" width="14" height="14" fill="white"/>
                          <rect x="11" y="11" width="8" height="8"/>
                          
                          <rect x="75" y="5" width="20" height="20"/>
                          <rect x="78" y="8" width="14" height="14" fill="white"/>
                          <rect x="81" y="11" width="8" height="8"/>
                          
                          <rect x="5" y="75" width="20" height="20"/>
                          <rect x="8" y="78" width="14" height="14" fill="white"/>
                          <rect x="11" y="81" width="8" height="8"/>
                          
                          {/* Random pattern */}
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
                    <p className="text-sm text-gray-500">Scan QR code to pay</p>
                  </div>
                  
                  {/* Payment Details */}
                  <div className="w-full bg-[#F0F8A4] rounded-xl p-4 mb-4 text-sm">
                    <p className="font-medium text-gray-700 mb-2">Payment Details:</p>
                    <p className="text-gray-600">Merchant: AuraFarm</p>
                    <p className="text-gray-600">Items: {cart.length} products</p>
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
                        Payment Done
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

export default Checkout;
