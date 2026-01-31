const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth');
const Product = require('../models/Product');
const Store = require('../models/Store');
const StoreInventory = require('../models/StoreInventory');
const User = require('../models/User');

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

// Get stores in buyer's city (case-insensitive)
router.get('/nearby-stores', authMiddleware, async (req, res) => {
  try {
    if (req.user.userType !== 'buyer') {
      return res.status(403).json({ error: 'Access denied' });
    }

    // Get buyer's location
    const buyer = await User.findById(req.user.id);
    if (!buyer || !buyer.location) {
      return res.status(400).json({ error: 'Buyer location not found' });
    }

    // Find stores in the same city (case-insensitive)
    const stores = await Store.find({
      city: { $regex: new RegExp(`^${buyer.location}$`, 'i') }
    }).select('-password');

    // Get count of items for sale for each store
    const storesWithProducts = await Promise.all(
      stores.map(async (store) => {
        const itemsForSale = await StoreInventory.countDocuments({
          storeId: store._id,
          isForSale: true,
          saleQuantity: { $gt: 0 }
        });
        return {
          ...store.toObject(),
          itemsForSale
        };
      })
    );

    res.json({ 
      stores: storesWithProducts,
      userCity: buyer.location
    });
  } catch (error) {
    console.error('Error fetching nearby stores:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get products for sale from a specific store
router.get('/store/:storeId/products', authMiddleware, async (req, res) => {
  try {
    if (req.user.userType !== 'buyer') {
      return res.status(403).json({ error: 'Access denied' });
    }

    const { storeId } = req.params;
    const { search, category } = req.query;

    // Get store info
    const store = await Store.findById(storeId).select('-password');
    if (!store) {
      return res.status(404).json({ error: 'Store not found' });
    }

    // Build filter for inventory items
    let filter = {
      storeId,
      isForSale: true,
      saleQuantity: { $gt: 0 }
    };

    if (search) {
      filter.$or = [
        { productName: { $regex: search, $options: 'i' } },
        { category: { $regex: search, $options: 'i' } }
      ];
    }

    if (category && category !== 'all') {
      filter.category = category;
    }

    const products = await StoreInventory.find(filter).sort({ createdAt: -1 });

    res.json({ 
      store,
      products 
    });
  } catch (error) {
    console.error('Error fetching store products:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
