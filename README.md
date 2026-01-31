# AuraFarm - An AI-Powered Agricultural Market Intelligence Platform

## Project Information

**Project Name:** AuraFarm

**Problem Statement ID:** CS03AE

**Team Name:** Boss Bandits

**College Name:** St. Joseph Engineering College, Mangaluru.

---

## Problem Statement

Creating a system for real-time market intelligence and direct market access for farmers.

Key challenges include:

- Lack of transparent pricing mechanisms
- Limited access to real-time market intelligence
- Dependency on middlemen reducing profit margins
- Absence of AI-powered analytical tools for informed decision-making
- Difficulty in understanding complex market dynamics and weather impacts
- No centralized platform connecting farmers directly with buyers

---

## Proposed Solution

***AuraFarm*** is a comprehensive AI-powered agricultural marketplace that empowers farmers with market intelligence and direct buyer access. The platform leverages a multi-agent AI system to provide actionable insights and facilitates transparent transactions.

### Core Features

**1. AI-Powered Market Analysis**

- Five specialized AI agents working in coordination:
  - Price Agent: Analyzes current and historical pricing data
  - News Agent: Monitors agricultural news and market sentiment
  - Weather Agent: Provides weather forecasts and crop impact analysis
  - Search Agent: Gathers real-time market information
  - Analytics Agent: Delivers comprehensive market intelligence reports
- Master Orchestrator coordinates all agents for holistic recommendations

**2. Product Management System**

- Farmers can list products with images, pricing, and details
- Full CRUD operations (Create, Read, Update, Delete)
- Real-time inventory tracking
- Image upload with preview functionality

**3. Price Insights Dashboard**

- Real-time mandi price data integration
- Arbitrage opportunity detection
- Regional price comparisons

**4. Direct Buyer Connection**

- Buyers can browse available products
- Direct communication channels
- Order management system
- Transparent pricing without middlemen

**5. Weather Analysis**

- Crop-specific weather forecasting
- Impact assessment on harvest and pricing
- Regional weather patterns

**6. Admin Panel**

- Platform monitoring and management
- User verification system
- Analytics dashboard
- Content moderation

---

## Innovation & Creativity

### Unique Differentiators

**1. Multi-Agent AI Architecture**

- First agricultural platform using coordinated AI agents
- LangGraph-based orchestration for complex decision-making
- Real-time data synthesis from multiple sources
- Mistral AI integration for advanced language processing

**2. Holistic Decision Support**

- Combines pricing, weather, news, and market trends
- Provides actionable recommendations with risk factors
- Financial urgency-aware selling strategies
- Quality-based pricing optimization

**3. Visual Intelligence**

- Sequential agent activation with loader animations
- Real-time processing status indicators
- Interactive data visualization using Recharts
- Intuitive color-coded insights

**4. Seamless User Experience**

- Role-based dashboards (Farmer, Buyer, Admin)
- Progressive form completion
- Dynamic content updates
- Mobile-responsive design

**5. Data-Driven Insights**

- Historical price pattern analysis
- Sentiment analysis from agricultural news
- Arbitrage opportunity identification
- Market intelligence reporting

---

## Technical Complexity & Stack

### Frontend Technologies

- **Framework:** React 19.2.0
- **Build Tool:** Vite 7.2.4
- **Styling:** Tailwind CSS 4.1.18
- **Routing:** React Router DOM 7.13.0
- **HTTP Client:** Axios 1.13.4
- **Charts & Visualization:** Recharts 3.7.0
- **Animations:** GSAP 3.14.2, Motion 12.29.2
- **Date Handling:** date-fns 4.1.0

### Backend Technologies

- **Runtime:** Node.js
- **Framework:** Express.js 4.18.2
- **Database:** MongoDB with Mongoose 8.0.0
- **Authentication:** JWT (jsonwebtoken 9.0.3) + bcryptjs 3.0.3
- **CORS:** cors 2.8.5
- **Environment Management:** dotenv 16.3.1
- **Task Scheduling:** node-cron 4.2.1

### AI & Machine Learning

- **LangChain Core:** 1.1.17
- **LangChain Community:** 1.1.9
- **LangGraph:** 1.1.2
- **Mistral AI:** 1.0.3
- **Web Scraping:** Cheerio 1.2.0

### Development Tools

- **Package Manager:** npm
- **Code Quality:** ESLint 9.39.1
- **Hot Reload:** Vite HMR, Nodemon 3.0.1
- **Version Control:** Git

### Architecture Patterns

- **Multi-Agent System:** Coordinated AI agents with master orchestrator
- **RESTful API:** Express routes with middleware authentication
- **MVC Pattern:** Separation of models, controllers, and routes
- **State Management:** React hooks (useState, useEffect)
- **Authentication Flow:** JWT-based role authentication
- **Database Schema:** Mongoose models for Users and Products

### Key Technical Implementations

- **Base64 Image Handling:** Up to 50MB payload support
- **Real-time Price Updates:** Mandi service integration
- **Dynamic Agent Activation:** Sequential AI agent processing
- **Responsive Design:** Tailwind utility-first CSS
- **Error Handling:** Comprehensive try-catch blocks with user feedback
- **Data Validation:** Input sanitization and required field checks

---

## Usability & Impact

### Target Users

**1. Farmers (Primary Users)**

- Small to large-scale farmers
- Agricultural cooperatives
- Contract farming entities

**2. Buyers**

- Wholesale buyers
- Retail chains
- Food processing companies
- Export businesses

**3. Authorized Resellers**

- Act as hubs to deliver products
- Part of system and also help in managing the quality of the goods

**4. Administrators**

- Platform managers
- Market regulators
- Support staff

### User Interaction Flow

**Farmer Journey:**

1. Sign up and create farmer profile
2. Add products with images and pricing
3. Access AI-powered market analysis
4. View price insights and recommendations
5. Edit or remove product listings
6. Receive direct buyer inquiries
7. Track orders and revenue

**Buyer Journey:**

1. Create buyer account
2. Browse available products
3. Filter by crop type and location
4. View detailed product information
5. Contact farmers directly
6. Place orders and track deliveries

**Authorized Reseller Journey:**
1. Create a Authorized reseller account
2. Manage the retail customer orders to be picked from the retail outlet
3. Maintain the quality of the products and facilitate the escrow payments
4. Gets paid a fixed amount for a goods per unit


**Admin Journey:**

1. Monitor platform activity
2. Verify user registrations
3. Manage content and listings
4. Generate analytics reports
5. Handle disputes and support

### Real-World Impact

**Economic Impact:**

- Eliminates middlemen, increasing farmer income by 15-25%
- Reduces price volatility through transparent market access
- Creates direct value chains connecting farmers to buyers
- Enables better price negotiation with data-backed insights

**Social Impact:**

- Empowers farmers with technology and knowledge
- Reduces information asymmetry in rural areas
- Provides digital literacy through intuitive interfaces
- Creates trust through transparent transactions

**Agricultural Impact:**

- Optimizes selling decisions based on AI recommendations
- Reduces post-harvest losses with timely market information
- Improves crop planning using historical data
- Enhances food security through efficient supply chains

**Scalability:**

- Cloud-ready architecture for nationwide deployment
- Supports multiple languages (future enhancement)
- Integration capabilities with government systems
- Mobile-first design for rural connectivity

---

## Setup Instructions

### Prerequisites

- Node.js (v16 or higher)
- MongoDB (v4.4 or higher)
- npm or yarn package manager
- Git

### Environment Configuration

**Server Environment Variables**

Create a `.env` file in the `server` directory:

```
PORT=5000
MONGODB_URI=mongodb://localhost:27017/codesprint_hackathon
JWT_SECRET=your_jwt_secret_key_here
MISTRAL_API_KEY=your_mistral_api_key_here
```

### Installation Steps

**1. Clone the Repository**

```bash
git clone <repository-url>
cd CODESPRINT_HACKATHON_2K26
```

**2. Install Server Dependencies**

```bash
cd server
npm install
```

**3. Install Client Dependencies**

```bash
cd ../client
npm install
```

**4. Start MongoDB**

Make sure MongoDB is running on your system:

```bash
# Windows
net start MongoDB

# macOS/Linux
sudo systemctl start mongodb
```

**5. Start the Backend Server**

Open a terminal in the `server` directory:

```bash
npm run dev
```

The server will start on `http://localhost:5000`

**6. Start the Frontend Development Server**

Open another terminal in the `client` directory:

```bash
npm run dev
```

The client will start on `http://localhost:5173`

### Accessing the Application

- **Landing Page:** http://localhost:5173
- **Farmer Dashboard:** Login as farmer after signup
- **Buyer Dashboard:** Login as buyer after signup
- **Admin Dashboard:** Access via /admin/login
- **API Endpoint:** http://localhost:5000/api

### Default Admin Credentials

Create an admin user through MongoDB or use the admin registration feature.

### Testing the AI Agents

1. Navigate to the Farmer Dashboard
2. Click on "Analysis & Reports" tab
3. Fill in crop details (e.g., Crop Type: Wheat, Location: Punjab)
4. Submit the form
5. Watch the AI agents activate sequentially
6. Review the comprehensive market analysis report

### Common Issues & Solutions

**Issue: MongoDB Connection Error**

- Solution: Ensure MongoDB is running and the connection string in `.env` is correct

**Issue: Port Already in Use**

- Solution: Change the PORT in server `.env` or kill the process using the port

**Issue: AI Agent Timeout**

- Solution: Check Mistral API key validity and internet connection

**Issue: Image Upload Fails**

- Solution: Ensure payload limit is set to 50MB in server configuration
---

## Presentation / Demo Link
[Deployment Link](https://codesprint-hackathon-2k26-4.onrender.com/)

[View Slides](https://docs.google.com/presentation/d/1jEa4dHcNuA6f7UTjFjgM8cqmnwUoK13MvZsmAwOnRrE/edit?usp=sharing)

---

## Project Structure

```
CODESPRINT_HACKATHON_2K26/
├── client/                     # Frontend React application
│   ├── src/
│   │   ├── components/        # Reusable UI components
│   │   ├── pages/             # Page components
│   │   │   ├── FarmerDashboard.jsx
│   │   │   ├── BuyerDashboard.jsx
│   │   │   └── AdminDashboard.jsx
│   │   ├── App.jsx            # Main app component
│   │   └── main.jsx           # Entry point
│   ├── public/                # Static assets
│   ├── package.json
│   └── vite.config.js
│
├── server/                    # Backend Node.js application
│   ├── src/
│   │   ├── agents/           # AI agent implementations
│   │   │   ├── masterOrchestrator.js
│   │   │   ├── priceInsightsAgent.js
│   │   │   ├── cropNewsAgent.js
│   │   │   ├── weatherAgent.js
│   │   │   └── searchAgent.js
│   │   ├── controllers/      # Request handlers
│   │   ├── middleware/       # Authentication middleware
│   │   ├── models/           # Mongoose schemas
│   │   │   ├── User.js
│   │   │   └── Product.js
│   │   ├── routes/           # API routes
│   │   ├── services/         # Business logic
│   │   │   ├── mistralService.js
│   │   │   └── mandiService.js
│   │   ├── utils/            # Helper functions
│   │   └── index.js          # Server entry point
│   └── package.json
│
└── README.md                 # Project documentation
```

---

## Future Enhancements

- Multi-language support for regional accessibility
- Mobile application (iOS & Android)
- Payment gateway integration
- Blockchain-based transaction verification
- IoT sensor integration for real-time crop monitoring
- Machine learning model training on historical data
- WhatsApp bot for notifications
- Government scheme integration
- Crop insurance recommendations
- Community forum for farmer discussions

---

## Contributing

This project was developed for CodeSprint Hackathon 2026. For any queries or contributions, please contact the team members.

---

## License

This project is developed for educational and hackathon purposes.

---

## Acknowledgments

- Mistral AI for language model integration
- Agricultural data sources and APIs
- Open-source community for tools and frameworks
- Farmers and buyers who inspired this solution