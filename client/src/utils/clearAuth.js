// Utility to clear authentication data
// Run this in browser console if you need to clear old tokens:
// window.clearAuthData()

export const clearAuthData = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  console.log('Authentication data cleared. Please login again.');
};

// Make it available globally for debugging
if (typeof window !== 'undefined') {
  window.clearAuthData = clearAuthData;
}
