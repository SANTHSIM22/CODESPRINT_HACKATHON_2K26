const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth');
const Product = require('../models/Product');
const Order = require('../models/Order');
const StoreInventory = require('../models/StoreInventory');

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

// Update a product
router.put('/products/:id', authMiddleware, async (req, res) => {
  try {
    console.log('PUT /products/:id - User:', req.user.id, 'Product ID:', req.params.id);
    
    if (req.user.userType !== 'farmer') {
      return res.status(403).json({ error: 'Access denied' });
    }

    const { name, category, quantity, unit, price, description, harvestDate, location, image } = req.body;

    // Find the product and verify ownership
    const product = await Product.findOne({ _id: req.params.id, farmerId: req.user.id });

    if (!product) {
      return res.status(404).json({ error: 'Product not found or you do not have permission to edit it' });
    }

    // Update the product
    product.name = name || product.name;
    product.category = category || product.category;
    product.quantity = quantity || product.quantity;
    product.unit = unit || product.unit;
    product.price = price || product.price;
    product.description = description || product.description;
    product.harvestDate = harvestDate || product.harvestDate;
    product.location = location || product.location;
    if (image) {
      product.image = image;
    }

    await product.save();
    console.log('Product updated successfully:', product._id);

    res.json({ message: 'Product updated successfully', product });
  } catch (error) {
    console.error('Error updating product:', error.message);
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

// Get orders for farmer (from stores)
router.get('/orders', authMiddleware, async (req, res) => {
  try {
    if (req.user.userType !== 'farmer') {
      return res.status(403).json({ error: 'Access denied' });
    }

    // Find all orders that contain items from this farmer
    const orders = await Order.find({
      'items.farmerId': req.user.id
    }).sort({ createdAt: -1 });

    // Filter items to only show this farmer's items
    const farmerOrders = orders.map(order => ({
      _id: order._id,
      buyerName: order.buyerName,
      buyerEmail: order.buyerEmail,
      shippingAddress: order.shippingAddress,
      contactNumber: order.contactNumber,
      status: order.status,
      paymentStatus: order.paymentStatus,
      paymentMethod: order.paymentMethod,
      createdAt: order.createdAt,
      items: order.items.filter(item => item.farmerId.toString() === req.user.id),
      totalAmount: order.items
        .filter(item => item.farmerId.toString() === req.user.id)
        .reduce((sum, item) => sum + item.price, 0)
    }));

    res.json({ orders: farmerOrders });
  } catch (error) {
    console.error('Error fetching farmer orders:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Mark order as delivered and update store inventory
router.put('/orders/:id/deliver', authMiddleware, async (req, res) => {
  try {
    if (req.user.userType !== 'farmer') {
      return res.status(403).json({ error: 'Access denied' });
    }

    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    // Check if this farmer has items in this order
    const farmerItems = order.items.filter(item => item.farmerId.toString() === req.user.id);
    if (farmerItems.length === 0) {
      return res.status(403).json({ error: 'You do not have items in this order' });
    }

    // Update order status to delivered
    order.status = 'delivered';
    order.deliveredAt = new Date();
    await order.save();

    // Update store inventory - mark as received and add quantity
    const storeId = order.buyerId;
    
    for (const item of farmerItems) {
      // Find the inventory item linked to this order
      let inventoryItem = await StoreInventory.findOne({
        storeId,
        orderId: order._id,
        productId: item.productId
      });

      if (inventoryItem) {
        inventoryItem.deliveryStatus = 'received';
        inventoryItem.receivedAt = new Date();
        inventoryItem.availableQuantity = inventoryItem.purchasedQuantity;
        await inventoryItem.save();
      } else {
        // Fallback: find by product and update
        inventoryItem = await StoreInventory.findOne({
          storeId,
          productId: item.productId,
          farmerId: req.user.id,
          deliveryStatus: 'pending'
        });
        
        if (inventoryItem) {
          inventoryItem.deliveryStatus = 'received';
          inventoryItem.receivedAt = new Date();
          inventoryItem.availableQuantity += item.quantity;
          inventoryItem.orderId = order._id;
          await inventoryItem.save();
        }
      }
    }

    res.json({ 
      message: 'Order marked as delivered. Store inventory updated.',
      order 
    });
  } catch (error) {
    console.error('Error marking order as delivered:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
