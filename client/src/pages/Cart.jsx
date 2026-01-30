import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';

function Cart() {
  const [cart, setCart] = useState([]);
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const userData = JSON.parse(localStorage.getItem('user'));
    const token = localStorage.getItem('token');
    
    if (!userData || !token || userData.userType !== 'buyer') {
      navigate('/login');
      return;
    }
    
    setUser(userData);
    
    // Load cart from localStorage
    const savedCart = JSON.parse(localStorage.getItem('cart')) || [];
    setCart(savedCart);
  }, [navigate]);

  const updateQuantity = (productId, newQuantity) => {
    if (newQuantity < 1) return;
    
    const updatedCart = cart.map(item => 
      item._id === productId ? { ...item, cartQuantity: newQuantity } : item
    );
    setCart(updatedCart);
    localStorage.setItem('cart', JSON.stringify(updatedCart));
  };

  const removeFromCart = (productId) => {
    const updatedCart = cart.filter(item => item._id !== productId);
    setCart(updatedCart);
    localStorage.setItem('cart', JSON.stringify(updatedCart));
  };

  const clearCart = () => {
    setCart([]);
    localStorage.removeItem('cart');
  };

  const getTotalAmount = () => {
    return cart.reduce((total, item) => total + (item.price * item.cartQuantity), 0);
  };

  const handleCheckout = () => {
    if (cart.length === 0) return;
    navigate('/buyer/checkout');
  };

  if (!user) return <div>Loading...</div>;

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
              to="/buyer/dashboard"
              className="px-4 py-2 text-[#36656B] hover:bg-gray-100 rounded-lg transition-colors font-medium"
            >
              ← Back to Dashboard
            </Link>
            <div className="w-10 h-10 bg-gradient-to-br from-[#75B06F] to-[#36656B] rounded-full flex items-center justify-center text-white font-bold">
              {user.name.charAt(0).toUpperCase()}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-[#36656B] mb-2">Shopping Cart</h1>
          <p className="text-gray-600 text-lg">Review your items before checkout</p>
        </div>

        {cart.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-12 text-center">
            <svg className="w-24 h-24 mx-auto mb-6 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            <h2 className="text-2xl font-bold text-gray-700 mb-2">Your cart is empty</h2>
            <p className="text-gray-500 mb-6">Start shopping to add products to your cart</p>
            <Link 
              to="/buyer/dashboard"
              className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-[#75B06F] to-[#36656B] text-white rounded-xl font-bold hover:shadow-lg transition-all"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              Browse Products
            </Link>
          </div>
        ) : (
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Cart Items */}
            <div className="lg:col-span-2 space-y-4">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-[#36656B]">{cart.length} Items in Cart</h2>
                <button
                  onClick={clearCart}
                  className="text-red-500 hover:text-red-600 font-medium text-sm"
                >
                  Clear All
                </button>
              </div>

              {cart.map((item) => (
                <div key={item._id} className="bg-white rounded-2xl shadow-sm border border-gray-200 p-4 flex gap-4 hover:shadow-lg transition-all">
                  <div className="w-24 h-24 rounded-xl overflow-hidden bg-gray-100 flex-shrink-0">
                    {item.image ? (
                      <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <svg className="w-10 h-10 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                      </div>
                    )}
                  </div>

                  <div className="flex-1">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-bold text-[#36656B] text-lg">{item.name}</h3>
                        <p className="text-sm text-gray-500 capitalize">{item.category} • by {item.farmerName}</p>
                        <p className="text-sm text-gray-500">{item.location}</p>
                      </div>
                      <button
                        onClick={() => removeFromCart(item._id)}
                        className="p-2 hover:bg-red-50 rounded-lg text-gray-400 hover:text-red-500 transition-colors"
                      >
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>

                    <div className="mt-3 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => updateQuantity(item._id, item.cartQuantity - 1)}
                          className="w-8 h-8 rounded-lg bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-600 font-bold transition-colors"
                        >
                          -
                        </button>
                        <span className="w-12 text-center font-bold text-[#36656B]">{item.cartQuantity}</span>
                        <button
                          onClick={() => updateQuantity(item._id, item.cartQuantity + 1)}
                          className="w-8 h-8 rounded-lg bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-600 font-bold transition-colors"
                        >
                          +
                        </button>
                        <span className="text-sm text-gray-500">{item.unit}</span>
                      </div>
                      <div className="text-right">
                        <p className="text-xl font-bold text-[#75B06F]">₹{(item.price * item.cartQuantity).toLocaleString()}</p>
                        <p className="text-xs text-gray-500">₹{item.price}/{item.unit}</p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 sticky top-8">
                <h2 className="text-xl font-bold text-[#36656B] mb-6">Order Summary</h2>
                
                <div className="space-y-3 mb-6">
                  <div className="flex justify-between text-gray-600">
                    <span>Subtotal ({cart.length} items)</span>
                    <span className="font-medium">₹{getTotalAmount().toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-gray-600">
                    <span>Delivery</span>
                    <span className="font-medium text-green-600">Free</span>
                  </div>
                  <div className="border-t pt-3 flex justify-between text-lg font-bold text-[#36656B]">
                    <span>Total</span>
                    <span>₹{getTotalAmount().toLocaleString()}</span>
                  </div>
                </div>

                <button
                  onClick={handleCheckout}
                  className="w-full py-4 bg-gradient-to-r from-[#75B06F] to-[#36656B] text-white rounded-xl font-bold hover:shadow-lg hover:shadow-[#75B06F]/40 transition-all hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Proceed to Checkout
                </button>

                <Link 
                  to="/buyer/dashboard"
                  className="w-full mt-3 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-medium transition-all flex items-center justify-center gap-2"
                >
                  Continue Shopping
                </Link>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default Cart;
