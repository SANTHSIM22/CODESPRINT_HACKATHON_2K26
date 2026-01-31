const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

const authRoutes = require('./routes/auth');
const farmerRoutes = require('./routes/farmer');
const buyerRoutes = require('./routes/buyer');
const adminRoutes = require('./routes/admin');
const analyticsRoutes = require('./routes/analytics');
const agentsRoutes = require('./routes/agents');
const ordersRoutes = require('./routes/orders');
const storeRoutes = require('./routes/store');

const app = express();

// Environment
const isProduction = process.env.NODE_ENV === 'production';

// Security middleware
if (isProduction) {
  app.use(helmet());
}

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: isProduction ? 100 : 1000, // limit each IP
  message: { error: 'Too many requests, please try again later.' }
});
app.use('/api/', limiter);

// CORS configuration
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:3000',
  'https://codesprint-hackathon-2k26-4.onrender.com',
  process.env.CLIENT_URL,
  process.env.CORS_ORIGIN
].filter(Boolean);

const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (mobile apps, curl, etc.)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.includes(origin) || !isProduction) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  optionsSuccessStatus: 200
};
app.use(cors(corsOptions));

// Body parser middleware - Increase payload limit for base64 images
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// MongoDB Connection
const connectDB = async () => {
  try {
    const mongoOptions = {
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    };
    
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/codesprint_hackathon', mongoOptions);
    console.log(`MongoDB Connected Successfully (${isProduction ? 'Production' : 'Development'})`);
  } catch (error) {
    console.error('MongoDB Connection Error:', error.message);
    process.exit(1);
  }
};

// Handle MongoDB connection events
mongoose.connection.on('error', (err) => {
  console.error('MongoDB connection error:', err);
});

mongoose.connection.on('disconnected', () => {
  console.log('MongoDB disconnected. Attempting to reconnect...');
});

connectDB();

// Health check route
app.get('/health', (req, res) => {
  res.status(200).json({ 
    status: 'healthy', 
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// API info route
app.get('/', (req, res) => {
  res.json({ 
    message: 'Welcome to AuraFarm API',
    version: '1.0.0',
    environment: process.env.NODE_ENV || 'development'
  });
});

app.use('/api/auth', authRoutes);
app.use('/api/farmer', farmerRoutes);
app.use('/api/buyer', buyerRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/agents', agentsRoutes);
app.use('/api/orders', ordersRoutes);
app.use('/api/store', storeRoutes);

// Direct analyze route (matches your frontend)
const { analyzeMarket } = require('./agents/masterOrchestrator');
app.post('/api/analyze', async (req, res) => {
  try {
    const { cropType, location, quantity, quality, storageCapacity, financialUrgency } = req.body;

    if (!cropType || !location) {
      return res.status(400).json({
        success: false,
        error: 'cropType and location are required'
      });
    }

    const result = await analyzeMarket({
      cropType,
      location,
      quantity: quantity || '10',
      quality: quality || 'B',
      storageCapacity: storageCapacity || '20',
      financialUrgency: financialUrgency || 'medium'
    });

    res.json(result);
  } catch (error) {
    console.error('Analyze API Error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Analysis failed'
    });
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Server Error:', err.stack);
  
  // Don't leak error details in production
  const errorResponse = {
    error: isProduction ? 'Something went wrong!' : err.message,
    ...(isProduction ? {} : { stack: err.stack })
  };
  
  res.status(err.status || 500).json(errorResponse);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received. Shutting down gracefully...');
  mongoose.connection.close(false, () => {
    console.log('MongoDB connection closed.');
    process.exit(0);
  });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(` Server is running on port ${PORT}`);
  console.log(` Environment: ${process.env.NODE_ENV || 'development'}`);
});
