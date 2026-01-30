import { useState } from 'react'
import './App.css'

function App() {
  return (
    <div className="landing-page">
      {/* Navigation */}
      <nav className="navbar">
        <div className="nav-container">
          <div className="logo">AuraFarm</div>
          <ul className="nav-links">
            <li><a href="#features">Features</a></li>
            <li><a href="#benefits">Benefits</a></li>
            <li><a href="#how-it-works">How It Works</a></li>
            <li><a href="#contact">Contact</a></li>
          </ul>
          <button className="cta-button">Get Started</button>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="hero">
        <div className="hero-content">
          <h1 className="hero-title">
            Empowering Farmers with <span className="highlight">Real-Time Market Intelligence</span>
          </h1>
          <p className="hero-subtitle">
            Connect directly with buyers, access live market prices, and maximize your profits with data-driven decisions
          </p>
          <div className="hero-buttons">
            <button className="primary-button">Start Trading</button>
            <button className="secondary-button">Learn More</button>
          </div>
        </div>
        <div className="hero-stats">
          <div className="stat-card">
            <h3>50,000+</h3>
            <p>Active Farmers</p>
          </div>
          <div className="stat-card">
            <h3>₹500Cr+</h3>
            <p>Transactions</p>
          </div>
          <div className="stat-card">
            <h3>98%</h3>
            <p>Satisfaction Rate</p>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="features" id="features">
        <h2 className="section-title">Powerful Features for Modern Farming</h2>
        <div className="features-grid">
          <div className="feature-card">
            <div className="feature-icon">graph_image</div>
            <h3>Live Market Prices</h3>
            <p>Get real-time price updates for all crops across multiple markets</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">handshake_image</div>
            <h3>Direct Market Access</h3>
            <p>Connect directly with buyers and eliminate middlemen</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">graph_image</div>
            <h3>Price Forecasting</h3>
            <p>AI-powered predictions to help you decide the best time to sell</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">crop_image</div>
            <h3>Crop Advisory</h3>
            <p>Expert recommendations on what to grow based on market demand</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">money_image</div>
            <h3>Secure Payments</h3>
            <p>Fast and secure payment processing with multiple options</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">mobile_image</div>
            <h3>Mobile First</h3>
            <p>Access everything from your smartphone, anytime, anywhere</p>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="benefits" id="benefits">
        <div className="benefits-content">
          <div className="benefits-text">
            <h2>Why Farmers Choose AuraFarm</h2>
            <div className="benefit-item">
              <div className="benefit-number">1</div>
              <div>
                <h4>Increase Your Profits</h4>
                <p>Get the best prices by comparing multiple buyers in real-time</p>
              </div>
            </div>
            <div className="benefit-item">
              <div className="benefit-number">2</div>
              <div>
                <h4>Reduce Waste</h4>
                <p>Sell your produce faster with direct market connections</p>
              </div>
            </div>
            <div className="benefit-item">
              <div className="benefit-number">3</div>
              <div>
                <h4>Make Informed Decisions</h4>
                <p>Access market trends and insights to plan your farming better</p>
              </div>
            </div>
            <div className="benefit-item">
              <div className="benefit-number">4</div>
              <div>
                <h4>Save Time</h4>
                <p>Handle everything from your phone without traveling to markets</p>
              </div>
            </div>
          </div>
          <div className="benefits-visual">
            <div className="visual-card">
              <h3>Average Profit Increase</h3>
              <div className="percentage">+35%</div>
              <p>Farmers using AuraFarm</p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="how-it-works" id="how-it-works">
        <h2 className="section-title">How It Works</h2>
        <div className="steps">
          <div className="step">
            <div className="step-number">1</div>
            <h3>Sign Up</h3>
            <p>Create your account in minutes with just your phone number</p>
          </div>
          <div className="step-connector"></div>
          <div className="step">
            <div className="step-number">2</div>
            <h3>List Your Produce</h3>
            <p>Add details about your crops, quantity, and location</p>
          </div>
          <div className="step-connector"></div>
          <div className="step">
            <div className="step-number">3</div>
            <h3>Connect with Buyers</h3>
            <p>Receive offers from verified buyers and choose the best one</p>
          </div>
          <div className="step-connector"></div>
          <div className="step">
            <div className="step-number">4</div>
            <h3>Get Paid</h3>
            <p>Complete the transaction and receive secure payment</p>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta-section">
        <h2>Ready to Transform Your Farming Business?</h2>
        <p>Join thousands of farmers already benefiting from real-time market intelligence</p>
        <button className="cta-large-button">Get Started Today</button>
      </section>

      {/* Footer */}
      <footer className="footer">
        <div className="footer-content">
          <div className="footer-column">
            <h4>AuraFarm</h4>
            <p>Empowering farmers with technology and market access</p>
          </div>
          <div className="footer-column">
            <h4>Quick Links</h4>
            <ul>
              <li><a href="#features">Features</a></li>
              <li><a href="#benefits">Benefits</a></li>
              <li><a href="#how-it-works">How It Works</a></li>
            </ul>
          </div>
          <div className="footer-column">
            <h4>Support</h4>
            <ul>
              <li><a href="#contact">Contact Us</a></li>
              <li><a href="#faq">FAQ</a></li>
              <li><a href="#help">Help Center</a></li>
            </ul>
          </div>
          <div className="footer-column">
            <h4>Legal</h4>
            <ul>
              <li><a href="#privacy">Privacy Policy</a></li>
              <li><a href="#terms">Terms of Service</a></li>
            </ul>
          </div>
        </div>
        <div className="footer-bottom">
          <p>&copy; 2026 AuraFarm. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}

export default App
