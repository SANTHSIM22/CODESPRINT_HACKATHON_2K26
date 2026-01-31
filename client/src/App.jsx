import './App.css'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { LanguageProvider } from './context/LanguageContext'
import LandingPage from './components/LandingPage'
import Login from './pages/Login'
import Signup from './pages/Signup'
import FarmerDashboard from './pages/FarmerDashboard'
import BuyerDashboard from './pages/BuyerDashboard'
import AdminLogin from './pages/AdminLogin'
import AdminDashboard from './pages/AdminDashboard'
import Cart from './pages/Cart'
import Checkout from './pages/Checkout'
import BuyerOrders from './pages/BuyerOrders'

function App() {
  return (
    <LanguageProvider>
      <Router>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/farmer/dashboard" element={<FarmerDashboard />} />
          <Route path="/buyer/dashboard" element={<BuyerDashboard />} />
          <Route path="/buyer/cart" element={<Cart />} />
          <Route path="/buyer/checkout" element={<Checkout />} />
          <Route path="/buyer/orders" element={<BuyerOrders />} />
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
        </Routes>
      </Router>
    </LanguageProvider>
  )
}

export default App
