import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';

function BuyerOrders() {
  const [orders, setOrders] = useState([]);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [payingOrderId, setPayingOrderId] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const userData = JSON.parse(localStorage.getItem('user'));
    const token = localStorage.getItem('token');
    
    if (!userData || !token || userData.userType !== 'buyer') {
      navigate('/login');
      return;
    }
    
    setUser(userData);
    fetchOrders(token);
  }, [navigate]);

  const fetchOrders = async (token) => {
    try {
      const response = await axios.get('http://localhost:5000/api/orders/buyer', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setOrders(response.data.orders || []);
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePayment = async (orderId) => {
    try {
      setPayingOrderId(orderId);
      const token = localStorage.getItem('token');
      const response = await axios.put(
        `http://localhost:5000/api/orders/${orderId}/pay`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      // Update the order in state
      setOrders(orders.map(order => 
        order._id === orderId 
          ? { ...order, paymentStatus: 'completed', paidAt: new Date().toISOString() }
          : order
      ));
      
      alert('Payment completed successfully! Amount sent to seller.');
    } catch (error) {
      console.error('Error completing payment:', error);
      alert(error.response?.data?.error || 'Failed to complete payment');
    } finally {
      setPayingOrderId(null);
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      pending: 'bg-amber-50 text-amber-700 border border-amber-200',
      confirmed: 'bg-blue-50 text-blue-700 border border-blue-200',
      processing: 'bg-purple-50 text-purple-700 border border-purple-200',
      shipped: 'bg-indigo-50 text-indigo-700 border border-indigo-200',
      delivered: 'bg-green-50 text-green-700 border border-green-200',
      cancelled: 'bg-red-50 text-red-700 border border-red-200'
    };
    return colors[status] || 'bg-gray-50 text-gray-700 border border-gray-200';
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
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
          <h1 className="text-4xl font-bold text-[#36656B] mb-2">My Orders</h1>
          <p className="text-gray-600 text-lg">Track and manage your orders</p>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-10 w-10 border-2 border-gray-300 border-t-[#36656B] mx-auto"></div>
            <p className="mt-4 text-sm text-gray-500">Loading orders...</p>
          </div>
        ) : orders.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
            <svg className="w-16 h-16 mx-auto mb-4 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
            <h2 className="text-xl font-semibold text-gray-700 mb-2">No orders yet</h2>
            <p className="text-gray-500 mb-6">Start shopping to place your first order</p>
            <Link 
              to="/buyer/dashboard"
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#36656B] text-white rounded-lg font-medium hover:bg-[#2a5055] transition-colors"
            >
              Browse Products
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => (
              <div key={order._id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:border-gray-300 transition-colors">
                {/* Order Header */}
                <div className="bg-gray-50 px-6 py-4 border-b border-gray-200 flex flex-wrap items-center justify-between gap-4">
                  <div className="flex items-center gap-6">
                    <div>
                      <p className="text-xs text-gray-500 uppercase tracking-wide">Order ID</p>
                      <p className="font-mono font-semibold text-gray-800">{order._id.slice(-8).toUpperCase()}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 uppercase tracking-wide">Placed on</p>
                      <p className="font-medium text-gray-700">{formatDate(order.createdAt)}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 uppercase tracking-wide">Total Amount</p>
                      <p className="font-semibold text-gray-800">₹{order.totalAmount.toLocaleString()}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`px-3 py-1 rounded-md font-medium text-xs uppercase tracking-wide ${getStatusColor(order.status)}`}>
                      {order.status}
                    </span>
                    <span className={`px-3 py-1 rounded-md font-medium text-xs uppercase tracking-wide ${order.paymentStatus === 'completed' ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-amber-50 text-amber-700 border border-amber-200'}`}>
                      {order.paymentStatus === 'completed' ? 'Paid' : 'Pending'}
                    </span>
                  </div>
                </div>
                
                {/* Order Items */}
                <div className="p-6">
                  <div className="grid gap-3">
                    {order.items.map((item, index) => (
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
                          <p className="text-sm text-gray-500">Sold by: {item.farmerName}</p>
                          <p className="text-sm text-gray-500">{item.quantity} {item.unit} × ₹{item.price}</p>
                        </div>
                        <p className="font-semibold text-gray-800">₹{(item.quantity * item.price).toLocaleString()}</p>
                      </div>
                    ))}
                  </div>
                  
                  {/* Shipping Details */}
                  <div className="mt-4 pt-4 border-t border-gray-200">
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

                  {/* Pay Now Button - Only shows for delivered orders with pending payment */}
                  {order.status === 'delivered' && order.paymentStatus !== 'completed' && (
                    <div className="mt-4 pt-4 border-t border-gray-200">
                      <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium text-amber-800">Order Delivered - Payment Required</p>
                            <p className="text-sm text-amber-600">Please complete payment to release funds to the seller</p>
                          </div>
                          <button
                            onClick={() => handlePayment(order._id)}
                            disabled={payingOrderId === order._id}
                            className="px-6 py-2.5 bg-[#36656B] text-white rounded-lg font-medium hover:bg-[#2a5055] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            {payingOrderId === order._id ? 'Processing...' : `Pay ₹${order.totalAmount.toLocaleString()}`}
                          </button>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Payment Completed Message */}
                  {order.paymentStatus === 'completed' && (
                    <div className="mt-4 pt-4 border-t border-gray-200">
                      <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                        <div className="flex items-center gap-2">
                          <svg className="w-5 h-5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          <p className="text-sm font-medium text-green-700">Payment completed - Funds released to seller</p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

export default BuyerOrders;
