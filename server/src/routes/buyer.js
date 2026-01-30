const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth');
const Product = require('../models/Product');

// Get buyer dashboard data
router.get('/dashboard', authMiddleware, async (req, res) => {
  try {
    if (req.user.userType !== 'buyer') {
      return res.status(403).json({ error: 'Access denied' });
    }

    // Mock data - replace with actual database queries
    const stats = {
      totalPurchases: 8,
      activeBids: 3,
      totalSpent: 85000,
      savedListings: 15
    };

    res.json({ stats });
  } catch (error) {
    console.error('Dashboard error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get all available products (marketplace)
router.get('/products', authMiddleware, async (req, res) => {
  try {
    if (req.user.userType !== 'buyer') {
      return res.status(403).json({ error: 'Access denied' });
    }

    const { category, search, minPrice, maxPrice } = req.query;
    
    let filter = { status: 'active' };
    
    if (category && category !== 'all') {
      filter.category = category;
    }
    
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { location: { $regex: search, $options: 'i' } }
      ];
    }
    
    if (minPrice || maxPrice) {
      filter.price = {};
      if (minPrice) filter.price.$gte = parseFloat(minPrice);
      if (maxPrice) filter.price.$lte = parseFloat(maxPrice);
    }

    const products = await Product.find(filter)
      .sort({ createdAt: -1 })
      .limit(100);

    res.json({ products });
  } catch (error) {
    console.error('Error fetching products:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
