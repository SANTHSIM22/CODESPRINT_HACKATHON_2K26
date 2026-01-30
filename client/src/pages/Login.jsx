import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';

function Login() {
  const [userType, setUserType] = useState('farmer'); // farmer or buyer
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await axios.post('http://localhost:5000/api/auth/login', {
        ...formData,
        userType
      });

      // Store token and user info
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
      localStorage.setItem('userType', response.data.user.userType);

      // Redirect based on user type
      if (response.data.user.userType === 'farmer') {
        navigate('/farmer/dashboard');
      } else {
        navigate('/buyer/dashboard');
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const userImages = {
    farmer: 'https://img.freepik.com/premium-photo/young-indian-farmer-green-agriculture-field_75648-6244.jpg?semt=ais_hybrid&w=740&q=80',
    buyer: 'https://media.istockphoto.com/id/1328853722/photo/over-the-shoulder-view-of-young-asian-woman-doing-home-delivery-grocery-shopping-online-with.jpg?s=612x612&w=0&k=20&c=OXmKDgC3g3nb8mcG1bxP4WLqyjHvdZ9yWfY1gO9jAYA='
  };

  return (
    <div className="h-screen flex overflow-hidden">
      {/* Left Side - Form */}
      <div className="w-full lg:w-1/2 bg-gradient-to-br from-green-50 via-white to-emerald-50 flex items-center justify-center px-6 py-6">
      <div className="max-w-md w-full">
        {/* Logo */}
        <div className="text-center mb-6">
          <Link to="/" className="inline-flex items-center gap-3 group">
            <svg className="w-12 h-12" viewBox="0 0 24 24" fill="none">
              <path d="M12 2L13.09 8.26L19 6L14.74 10.91L21 12L14.74 13.09L19 18L13.09 15.74L12 22L10.91 15.74L5 18L9.26 13.09L3 12L9.26 10.91L5 6L10.91 8.26L12 2Z" fill="#16A34A"/>
            </svg>
            <span className="text-3xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">AuraFarm</span>
          </Link>
        </div>

        <div className="bg-white rounded-2xl shadow-xl p-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Welcome Back</h2>
          <p className="text-gray-600 mb-4">Sign in to continue to your dashboard</p>

          {/* User Type Toggle */}
          <div className="flex gap-2 mb-4 bg-gray-100 p-1 rounded-xl">
            <button
              type="button"
              onClick={() => setUserType('farmer')}
              className={`flex-1 py-3 px-4 rounded-lg font-semibold transition-all ${
                userType === 'farmer'
                  ? 'bg-[#DAD877] text-gray-900 shadow-md'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Farmer
            </button>
            <button
              type="button"
              onClick={() => setUserType('buyer')}
              className={`flex-1 py-3 px-4 rounded-lg font-semibold transition-all ${
                userType === 'buyer'
                  ? 'bg-[#DAD877] text-gray-900 shadow-md'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Buyer
            </button>
          </div>

          {error && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 text-red-600 rounded-lg">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-3">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">
                Email Address
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                placeholder="you@example.com"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">
                Password
              </label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                placeholder="••••••••"
                required
              />
            </div>

            <div className="flex items-center justify-between">
              <label className="flex items-center">
                <input type="checkbox" className="w-4 h-4 text-[#DAD877] border-gray-300 rounded focus:ring-[#DAD877]" />
                <span className="ml-2 text-sm text-gray-600">Remember me</span>
              </label>
              <a href="#" className="text-sm text-[#36656B] hover:text-[#75B06F] font-semibold">
                Forgot password?
              </a>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-green-600 to-emerald-600 text-white py-4 rounded-xl font-bold text-lg hover:shadow-xl hover:shadow-green-500/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          <div className="mt-4 text-center">
            <p className="text-gray-600">
              Don't have an account?{' '}
              <Link to="/signup" className="text-[#36656B] hover:text-[#75B06F] font-semibold">
                Sign up
              </Link>
            </p>
          </div>
        </div>

        <p className="text-center text-gray-500 text-sm mt-4">
          By signing in, you agree to our Terms of Service and Privacy Policy
        </p>
      </div>
      </div>

      {/* Right Side - Dynamic Image */}
      <div className="hidden lg:block lg:w-1/2 relative overflow-hidden">
        <img 
          src={userImages[userType]} 
          alt={`${userType} working`}
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent"></div>
        <div className="absolute bottom-0 left-0 right-0 p-12 z-10">
          <h3 className="text-4xl font-bold text-white mb-4">
            {userType === 'farmer' ? 'Empowering Farmers' : 'Connecting Buyers'}
          </h3>
          <p className="text-white/90 text-lg">
            {userType === 'farmer' 
              ? 'Join thousands of farmers maximizing their profits with AuraFarm'
              : 'Access quality produce directly from verified farmers'}
          </p>
        </div>
      </div>
    </div>
  );
}

export default Login;
