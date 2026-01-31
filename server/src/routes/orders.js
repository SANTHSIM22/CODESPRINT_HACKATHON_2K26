const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth');
const Order = require('../models/Order');
const Product = require('../models/Product');
const StoreInventory = require('../models/StoreInventory');
const Store = require('../models/Store');

// Create a new order
router.post('/create', authMiddleware, async (req, res) => {
  try {
    if (req.user.userType !== 'buyer') {
      return res.status(403).json({ error: 'Access denied' });
    }

    const { items, shippingAddress, contactNumber, notes } = req.body;

    if (!items || items.length === 0) {
      return res.status(400).json({ error: 'No items in order' });
    }

    if (!shippingAddress || !contactNumber) {
      return res.status(400).json({ error: 'Shipping address and contact number are required' });
    }

    // Calculate total amount
    let totalAmount = 0;
    const orderItems = [];

    for (const item of items) {
      // Check if it's a store product
      if (item.isStoreProduct) {
        const inventoryItem = await StoreInventory.findById(item.productId);
        if (!inventoryItem) {
          return res.status(400).json({ error: `Store product not found: ${item.productId}` });
        }

        if (inventoryItem.saleQuantity < item.quantity) {
          return res.status(400).json({ error: `Insufficient quantity for ${inventoryItem.productName}` });
        }

        const store = await Store.findById(inventoryItem.storeId);
        const itemTotal = inventoryItem.salePrice * item.quantity;
        totalAmount += itemTotal;

        orderItems.push({
          productId: inventoryItem._id,
          productName: inventoryItem.productName,
          quantity: item.quantity,
          unit: inventoryItem.unit,
          price: inventoryItem.salePrice,
          farmerId: inventoryItem.storeId, // Store as the seller
          farmerName: store ? store.storeName : 'Store',
          image: inventoryItem.image,
          isStoreProduct: true
        });

        // Update store inventory
        inventoryItem.saleQuantity -= item.quantity;
        inventoryItem.availableQuantity -= item.quantity;
        if (inventoryItem.saleQuantity <= 0) {
          inventoryItem.isForSale = false;
          inventoryItem.saleQuantity = 0;
        }
        await inventoryItem.save();
      } else {
        // Regular farmer product
        const product = await Product.findById(item.productId);
        if (!product) {
          return res.status(400).json({ error: `Product not found: ${item.productId}` });
        }

        if (product.quantity < item.quantity) {
          return res.status(400).json({ error: `Insufficient quantity for ${product.name}` });
        }

        const itemTotal = product.price * item.quantity;
        totalAmount += itemTotal;

        orderItems.push({
          productId: product._id,
          productName: product.name,
          quantity: item.quantity,
          unit: product.unit,
          price: product.price,
          farmerId: product.farmerId,
          farmerName: product.farmerName,
          image: product.image
        });

        // Update product quantity
        product.quantity -= item.quantity;
        if (product.quantity <= 0) {
          product.status = 'sold';
        }
        await product.save();
      }
    }

    const order = new Order({
      buyerId: req.user.id,
      buyerName: req.user.name,
      buyerEmail: req.user.email,
      items: orderItems,
      totalAmount,
      shippingAddress,
      contactNumber,
      notes,
      status: 'confirmed',
      paymentStatus: 'completed'
    });

    await order.save();

    res.status(201).json({ 
      message: 'Order placed successfully', 
      order,
      orderId: order._id
    });
  } catch (error) {
    console.error('Error creating order:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get buyer's orders
router.get('/buyer', authMiddleware, async (req, res) => {
  try {
    if (req.user.userType !== 'buyer') {
      return res.status(403).json({ error: 'Access denied' });
    }

    const orders = await Order.find({ buyerId: req.user.id })
      .sort({ createdAt: -1 });

    res.json({ orders });
  } catch (error) {
    console.error('Error fetching buyer orders:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get farmer's orders (orders containing their products)
router.get('/farmer', authMiddleware, async (req, res) => {
  try {
    if (req.user.userType !== 'farmer') {
      return res.status(403).json({ error: 'Access denied' });
    }

    const orders = await Order.find({ 'items.farmerId': req.user.id })
      .sort({ createdAt: -1 });

    // Filter items to only show this farmer's products
    const farmerOrders = orders.map(order => {
      const farmerItems = order.items.filter(
        item => item.farmerId.toString() === req.user.id
      );
      const farmerTotal = farmerItems.reduce(
        (sum, item) => sum + (item.price * item.quantity), 0
      );
      
      return {
        _id: order._id,
        buyerName: order.buyerName,
        buyerEmail: order.buyerEmail,
        items: farmerItems,
        totalAmount: farmerTotal,
        status: order.status,
        paymentStatus: order.paymentStatus,
        shippingAddress: order.shippingAddress,
        contactNumber: order.contactNumber,
        createdAt: order.createdAt
      };
    });

    res.json({ orders: farmerOrders });
  } catch (error) {
    console.error('Error fetching farmer orders:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Update order status (for farmers)
router.put('/:orderId/status', authMiddleware, async (req, res) => {
  try {
    if (req.user.userType !== 'farmer') {
      return res.status(403).json({ error: 'Access denied' });
    }

    const { status } = req.body;
    const validStatuses = ['processing', 'shipped', 'delivered'];
    
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }

    const updateData = { status };
    if (status === 'delivered') {
      updateData.deliveredAt = new Date();
    }

    const order = await Order.findOneAndUpdate(
      { 
        _id: req.params.orderId,
        'items.farmerId': req.user.id
      },
      updateData,
      { new: true }
    );

    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    const message = status === 'delivered' 
      ? 'Order delivered - Awaiting buyer payment confirmation'
      : 'Order status updated';

    res.json({ message, order });
  } catch (error) {
    console.error('Error updating order status:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Buyer completes payment after delivery
router.put('/:orderId/pay', authMiddleware, async (req, res) => {
  try {
    if (req.user.userType !== 'buyer') {
      return res.status(403).json({ error: 'Access denied' });
    }

    const order = await Order.findOne({
      _id: req.params.orderId,
      buyerId: req.user.id
    });

    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    if (order.status !== 'delivered') {
      return res.status(400).json({ error: 'Order must be delivered before payment' });
    }

    if (order.paymentStatus === 'completed') {
      return res.status(400).json({ error: 'Payment already completed' });
    }

    order.paymentStatus = 'completed';
    order.paidAt = new Date();
    await order.save();

    res.json({ 
      message: 'Payment completed successfully. Amount sent to seller.',
      order 
    });
  } catch (error) {
    console.error('Error completing payment:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get single order details
router.get('/:orderId', authMiddleware, async (req, res) => {
  try {
    const order = await Order.findById(req.params.orderId);

    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    // Check if user has access to this order
    if (req.user.userType === 'buyer' && order.buyerId.toString() !== req.user.id) {
      return res.status(403).json({ error: 'Access denied' });
    }

    if (req.user.userType === 'farmer') {
      const hasAccess = order.items.some(item => item.farmerId.toString() === req.user.id);
      if (!hasAccess) {
        return res.status(403).json({ error: 'Access denied' });
      }
    }

    res.json({ order });
  } catch (error) {
    console.error('Error fetching order:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
