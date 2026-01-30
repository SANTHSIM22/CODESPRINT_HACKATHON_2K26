const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth');
const Product = require('../models/Product');

// Get farmer dashboard data
router.get('/dashboard', authMiddleware, async (req, res) => {
  try {
    if (req.user.userType !== 'farmer') {
      return res.status(403).json({ error: 'Access denied' });
    }

    // Get actual product count for the farmer
    const totalListings = await Product.countDocuments({ farmerId: req.user.id, status: 'active' });
    
    const stats = {
      totalListings,
      activeOffers: 0, // Can be implemented later
      totalRevenue: 0, // Can be calculated from sales
      monthlyGrowth: 0 // Can be calculated from historical data
    };

    res.json({ stats });
  } catch (error) {
    console.error('Dashboard error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get all products for the authenticated farmer
router.get('/products', authMiddleware, async (req, res) => {
  try {
    console.log('GET /products - User ID:', req.user.id, 'UserType:', req.user.userType);
    
    if (req.user.userType !== 'farmer') {
      return res.status(403).json({ error: 'Access denied' });
    }

    const products = await Product.find({ farmerId: req.user.id })
      .sort({ createdAt: -1 });
    
    console.log(`Found ${products.length} products for farmer ${req.user.id}`);
    res.json({ products });
  } catch (error) {
    console.error('Error fetching products:', error.message);
    console.error('Stack:', error.stack);
    res.status(500).json({ error: 'Server error', details: error.message });
  }
});

// Add a new product
router.post('/products', authMiddleware, async (req, res) => {
  try {
    console.log('POST /products - User:', req.user.id, req.user.name);
    console.log('Request body:', JSON.stringify(req.body, null, 2));
    
    if (req.user.userType !== 'farmer') {
      return res.status(403).json({ error: 'Access denied' });
    }

    const { name, category, quantity, unit, price, description, harvestDate, location, image } = req.body;

    // Validation
    if (!name || !category || !quantity || !price || !harvestDate || !location) {
      console.log('Validation failed - missing fields');
      return res.status(400).json({ error: 'Please fill all required fields' });
    }

    const product = new Product({
      name,
      category,
      quantity,
      unit: unit || 'kg',
      price,
      description,
      harvestDate,
      location,
      image,
      farmerId: req.user.id,
      farmerName: req.user.name || req.user.email
    });

    console.log('Attempting to save product...');
    await product.save();
    console.log('Product saved successfully:', product._id);

    res.status(201).json({ message: 'Product added successfully', product });
  } catch (error) {
    console.error('Error adding product:', error.message);
    console.error('Stack:', error.stack);
    res.status(500).json({ error: 'Server error', details: error.message });
  }
});

// Delete a product
router.delete('/products/:id', authMiddleware, async (req, res) => {
  try {
    if (req.user.userType !== 'farmer') {
      return res.status(403).json({ error: 'Access denied' });
    }

    const product = await Product.findOne({ _id: req.params.id, farmerId: req.user.id });

    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    await Product.deleteOne({ _id: req.params.id });

    res.json({ message: 'Product deleted successfully' });
  } catch (error) {
    console.error('Error deleting product:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
