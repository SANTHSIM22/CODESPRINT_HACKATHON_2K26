const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const authRoutes = require('./routes/auth');
const farmerRoutes = require('./routes/farmer');
const buyerRoutes = require('./routes/buyer');
const adminRoutes = require('./routes/admin');
const analyticsRoutes = require('./routes/analytics');
const agentsRoutes = require('./routes/agents');
const ordersRoutes = require('./routes/orders');

const app = express();

// Middleware - Increase payload limit for base64 images
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// MongoDB Connection
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/codesprint_hackathon');
    console.log('MongoDB Connected Successfully');
  } catch (error) {
    console.error('MongoDB Connection Error:', error.message);
    process.exit(1);
  }
};

connectDB();

// Routes
app.get('/', (req, res) => {
  res.json({ message: 'Welcome to AuraFarm API' });
});

app.use('/api/auth', authRoutes);
app.use('/api/farmer', farmerRoutes);
app.use('/api/buyer', buyerRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/agents', agentsRoutes);
app.use('/api/orders', ordersRoutes);

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
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
