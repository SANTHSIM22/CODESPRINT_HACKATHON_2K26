import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { Store, User, Mail, Lock, Phone, MapPin, Building, FileText, ArrowLeft, CheckCircle } from 'lucide-react';

function StoreSignup() {
  const [formData, setFormData] = useState({
    storeName: '',
    ownerName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    address: '',
    city: '',
    state: '',
    pincode: '',
    gstNumber: '',
    storeType: 'retail'
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setLoading(true);

    try {
      const response = await axios.post('http://localhost:5000/api/store/signup', {
        storeName: formData.storeName,
        ownerName: formData.ownerName,
        email: formData.email,
        phone: formData.phone,
        password: formData.password,
        address: formData.address,
        city: formData.city,
        state: formData.state,
        pincode: formData.pincode,
        gstNumber: formData.gstNumber,
        storeType: formData.storeType
      });
      
      localStorage.setItem('storeToken', response.data.token);
      localStorage.setItem('store', JSON.stringify(response.data.store));
      
      navigate('/store/dashboard');
    } catch (err) {
      setError(err.response?.data?.error || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F0F8A4]/30 via-white to-[#75B06F]/10 py-8 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Back Button */}
        <button
          onClick={() => navigate('/')}
          className="flex items-center gap-2 text-[#36656B] hover:text-[#75B06F] transition-colors mb-6"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Back to Home</span>
        </button>

        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="w-16 h-16 bg-gradient-to-br from-[#36656B] to-[#75B06F] rounded-2xl flex items-center justify-center shadow-lg">
              <Store className="w-8 h-8 text-white" />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-[#36656B] mb-2">Register Your Store</h1>
          <p className="text-[#36656B]/60">Join AuraFarm's network of trusted stores</p>
        </div>

        {/* Signup Card */}
        <div className="bg-white rounded-2xl shadow-xl p-8 border border-[#DAD887]/30">
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl">
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className="text-red-600 text-sm">{error}</p>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Store Information Section */}
            <div>
              <h3 className="text-lg font-semibold text-[#36656B] mb-4 flex items-center gap-2">
                <Building className="w-5 h-5" />
                Store Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-[#36656B] mb-2">Store Name *</label>
                  <div className="relative">
                    <Store className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#36656B]/50" />
                    <input
                      type="text"
                      name="storeName"
                      value={formData.storeName}
                      onChange={handleChange}
                      className="w-full pl-10 pr-4 py-3 bg-[#F0F8A4]/20 border border-[#DAD887]/50 rounded-xl text-[#36656B] placeholder-[#36656B]/40 focus:ring-2 focus:ring-[#75B06F] focus:border-transparent"
                      placeholder="Your store name"
                      required
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#36656B] mb-2">Owner Name *</label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#36656B]/50" />
                    <input
                      type="text"
                      name="ownerName"
                      value={formData.ownerName}
                      onChange={handleChange}
                      className="w-full pl-10 pr-4 py-3 bg-[#F0F8A4]/20 border border-[#DAD887]/50 rounded-xl text-[#36656B] placeholder-[#36656B]/40 focus:ring-2 focus:ring-[#75B06F] focus:border-transparent"
                      placeholder="Owner's full name"
                      required
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Contact Information */}
            <div>
              <h3 className="text-lg font-semibold text-[#36656B] mb-4 flex items-center gap-2">
                <Phone className="w-5 h-5" />
                Contact Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-[#36656B] mb-2">Email *</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#36656B]/50" />
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      className="w-full pl-10 pr-4 py-3 bg-[#F0F8A4]/20 border border-[#DAD887]/50 rounded-xl text-[#36656B] placeholder-[#36656B]/40 focus:ring-2 focus:ring-[#75B06F] focus:border-transparent"
                      placeholder="store@example.com"
                      required
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#36656B] mb-2">Phone *</label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#36656B]/50" />
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      className="w-full pl-10 pr-4 py-3 bg-[#F0F8A4]/20 border border-[#DAD887]/50 rounded-xl text-[#36656B] placeholder-[#36656B]/40 focus:ring-2 focus:ring-[#75B06F] focus:border-transparent"
                      placeholder="+91 XXXXX XXXXX"
                      required
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Address Information */}
            <div>
              <h3 className="text-lg font-semibold text-[#36656B] mb-4 flex items-center gap-2">
                <MapPin className="w-5 h-5" />
                Store Address
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-[#36656B] mb-2">Address *</label>
                  <input
                    type="text"
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    className="w-full px-4 py-3 bg-[#F0F8A4]/20 border border-[#DAD887]/50 rounded-xl text-[#36656B] placeholder-[#36656B]/40 focus:ring-2 focus:ring-[#75B06F] focus:border-transparent"
                    placeholder="Street address"
                    required
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-[#36656B] mb-2">City *</label>
                    <input
                      type="text"
                      name="city"
                      value={formData.city}
                      onChange={handleChange}
                      className="w-full px-4 py-3 bg-[#F0F8A4]/20 border border-[#DAD887]/50 rounded-xl text-[#36656B] placeholder-[#36656B]/40 focus:ring-2 focus:ring-[#75B06F] focus:border-transparent"
                      placeholder="City"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[#36656B] mb-2">State *</label>
                    <input
                      type="text"
                      name="state"
                      value={formData.state}
                      onChange={handleChange}
                      className="w-full px-4 py-3 bg-[#F0F8A4]/20 border border-[#DAD887]/50 rounded-xl text-[#36656B] placeholder-[#36656B]/40 focus:ring-2 focus:ring-[#75B06F] focus:border-transparent"
                      placeholder="State"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[#36656B] mb-2">Pincode *</label>
                    <input
                      type="text"
                      name="pincode"
                      value={formData.pincode}
                      onChange={handleChange}
                      className="w-full px-4 py-3 bg-[#F0F8A4]/20 border border-[#DAD887]/50 rounded-xl text-[#36656B] placeholder-[#36656B]/40 focus:ring-2 focus:ring-[#75B06F] focus:border-transparent"
                      placeholder="123456"
                      required
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Business Details */}
            <div>
              <h3 className="text-lg font-semibold text-[#36656B] mb-4 flex items-center gap-2">
                <FileText className="w-5 h-5" />
                Business Details
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-[#36656B] mb-2">GST Number (Optional)</label>
                  <input
                    type="text"
                    name="gstNumber"
                    value={formData.gstNumber}
                    onChange={handleChange}
                    className="w-full px-4 py-3 bg-[#F0F8A4]/20 border border-[#DAD887]/50 rounded-xl text-[#36656B] placeholder-[#36656B]/40 focus:ring-2 focus:ring-[#75B06F] focus:border-transparent"
                    placeholder="22AAAAA0000A1Z5"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#36656B] mb-2">Store Type *</label>
                  <select
                    name="storeType"
                    value={formData.storeType}
                    onChange={handleChange}
                    className="w-full px-4 py-3 bg-[#F0F8A4]/20 border border-[#DAD887]/50 rounded-xl text-[#36656B] focus:ring-2 focus:ring-[#75B06F] focus:border-transparent"
                    required
                  >
                    <option value="retail">Retail</option>
                    <option value="wholesale">Wholesale</option>
                    <option value="both">Both</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Password Section */}
            <div>
              <h3 className="text-lg font-semibold text-[#36656B] mb-4 flex items-center gap-2">
                <Lock className="w-5 h-5" />
                Security
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-[#36656B] mb-2">Password *</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#36656B]/50" />
                    <input
                      type="password"
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      className="w-full pl-10 pr-4 py-3 bg-[#F0F8A4]/20 border border-[#DAD887]/50 rounded-xl text-[#36656B] placeholder-[#36656B]/40 focus:ring-2 focus:ring-[#75B06F] focus:border-transparent"
                      placeholder="Min. 6 characters"
                      required
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#36656B] mb-2">Confirm Password *</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#36656B]/50" />
                    <input
                      type="password"
                      name="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      className="w-full pl-10 pr-4 py-3 bg-[#F0F8A4]/20 border border-[#DAD887]/50 rounded-xl text-[#36656B] placeholder-[#36656B]/40 focus:ring-2 focus:ring-[#75B06F] focus:border-transparent"
                      placeholder="Confirm your password"
                      required
                    />
                  </div>
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 bg-gradient-to-r from-[#36656B] to-[#75B06F] text-white font-semibold rounded-xl hover:opacity-90 transition-opacity flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loading ? (
                <>
                  <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <span>Registering...</span>
                </>
              ) : (
                <>
                  <CheckCircle className="w-5 h-5" />
                  <span>Register Store</span>
                </>
              )}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-[#36656B]/60">
              Already have an account?{' '}
              <Link to="/store/login" className="text-[#75B06F] font-semibold hover:underline">
                Sign In
              </Link>
            </p>
          </div>
        </div>

        {/* Footer */}
        <p className="text-center text-sm text-[#36656B]/50 mt-6">
          © 2026 AuraFarm. All rights reserved.
        </p>
      </div>
    </div>
  );
}

export default StoreSignup;
