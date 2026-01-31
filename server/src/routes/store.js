const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Store = require('../models/Store');
const StoreInventory = require('../models/StoreInventory');
const Product = require('../models/Product');
const Order = require('../models/Order');

// Store Signup
router.post('/signup', async (req, res) => {
  try {
    const { storeName, ownerName, email, phone, password, address, city, state, pincode, gstNumber, storeType } = req.body;

    // Check if store already exists
    const existingStore = await Store.findOne({ email });
    if (existingStore) {
      return res.status(400).json({ error: 'Email already registered' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create new store
    const store = new Store({
      storeName,
      ownerName,
      email,
      phone,
      password: hashedPassword,
      address,
      city,
      state,
      pincode,
      gstNumber,
      storeType
    });

    await store.save();

    // Generate JWT token
    const token = jwt.sign(
      { 
        storeId: store._id, 
        storeName: store.storeName,
        email: store.email,
        userType: 'store'
      },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '7d' }
    );

    res.status(201).json({
      message: 'Store registered successfully',
      token,
      store: {
        id: store._id,
        storeName: store.storeName,
        ownerName: store.ownerName,
        email: store.email,
        city: store.city,
        state: store.state,
        storeType: store.storeType
      }
    });
  } catch (error) {
    console.error('Store signup error:', error);
    res.status(500).json({ error: 'Server error during signup' });
  }
});

// Store Login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find store
    const store = await Store.findOne({ email });
    if (!store) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, store.password);
    if (!isPasswordValid) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    // Generate JWT token
    const token = jwt.sign(
      { 
        storeId: store._id, 
        storeName: store.storeName,
        email: store.email,
        userType: 'store'
      },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '7d' }
    );

    res.json({
      message: 'Login successful',
      token,
      store: {
        id: store._id,
        storeName: store.storeName,
        ownerName: store.ownerName,
        email: store.email,
        city: store.city,
        state: store.state,
        storeType: store.storeType
      }
    });
  } catch (error) {
    console.error('Store login error:', error);
    res.status(500).json({ error: 'Server error during login' });
  }
});

// Middleware to verify store token
const verifyStoreToken = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({ error: 'Access denied. No token provided.' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
    if (decoded.userType !== 'store') {
      return res.status(403).json({ error: 'Access denied. Not a store account.' });
    }
    req.store = decoded;
    next();
  } catch (error) {
    res.status(401).json({ error: 'Invalid token' });
  }
};

// Get all farmers' products (available for purchase)
router.get('/farmers-products', verifyStoreToken, async (req, res) => {
  try {
    const products = await Product.find({ status: 'active' })
      .sort({ createdAt: -1 });
    
    res.json({ products });
  } catch (error) {
    console.error('Error fetching farmers products:', error);
    res.status(500).json({ error: 'Failed to fetch products' });
  }
});

// Purchase product from farmer (add to inventory)
router.post('/purchase', verifyStoreToken, async (req, res) => {
  try {
    const { productId, quantity, sellingPrice } = req.body;
    const storeId = req.store.storeId;

    // Find the product
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    if (product.quantity < quantity) {
      return res.status(400).json({ error: 'Insufficient quantity available' });
    }

    // Always create a new inventory entry for each purchase (separate orders)
    const inventoryItem = new StoreInventory({
      storeId,
      productId: product._id,
      productName: product.name,
      category: product.category,
      purchasedQuantity: quantity,
      availableQuantity: 0, // Will be updated when farmer delivers
      unit: product.unit,
      purchasePrice: product.price,
      sellingPrice: sellingPrice || product.price * 1.2, // 20% markup default
      farmerId: product.farmerId,
      farmerName: product.farmerName,
      deliveryStatus: 'pending',
      expiryDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days default
    });

    await inventoryItem.save();

    // Update product quantity
    product.quantity -= quantity;
    if (product.quantity === 0) {
      product.status = 'sold';
    }
    await product.save();

    // Create order record
    const store = await Store.findById(storeId);
    const order = new Order({
      buyerId: storeId,
      buyerName: req.store.storeName,
      buyerEmail: store.email,
      items: [{
        productId: product._id,
        productName: product.name,
        quantity,
        unit: product.unit,
        price: product.price * quantity,
        farmerId: product.farmerId,
        farmerName: product.farmerName,
        image: product.image
      }],
      totalAmount: product.price * quantity,
      status: 'confirmed',
      paymentStatus: 'completed',
      paymentMethod: 'Store Purchase',
      shippingAddress: store.address + ', ' + store.city + ', ' + store.state + ' - ' + store.pincode,
      contactNumber: store.phone
    });

    await order.save();

    // Link order to inventory item
    inventoryItem.orderId = order._id;
    await inventoryItem.save();

    res.status(201).json({
      message: 'Product purchased successfully',
      inventoryItem,
      order
    });
  } catch (error) {
    console.error('Error purchasing product:', error);
    res.status(500).json({ error: 'Failed to purchase product' });
  }
});

// Get store inventory
router.get('/inventory', verifyStoreToken, async (req, res) => {
  try {
    const storeId = req.store.storeId;
    const inventory = await StoreInventory.find({ storeId })
      .sort({ createdAt: -1 });
    
    res.json({ inventory });
  } catch (error) {
    console.error('Error fetching inventory:', error);
    res.status(500).json({ error: 'Failed to fetch inventory' });
  }
});

// Update inventory item (only for pending items - can change quantity and selling price)
router.put('/inventory/:id', verifyStoreToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { purchasedQuantity, sellingPrice } = req.body;
    const storeId = req.store.storeId;

    const inventoryItem = await StoreInventory.findOne({ _id: id, storeId });
    if (!inventoryItem) {
      return res.status(404).json({ error: 'Inventory item not found' });
    }

    // Prevent editing received items
    if (inventoryItem.deliveryStatus === 'received') {
      return res.status(403).json({ error: 'Cannot edit received items' });
    }

    // Update purchased quantity (order quantity)
    if (purchasedQuantity !== undefined && purchasedQuantity > 0) {
      inventoryItem.purchasedQuantity = purchasedQuantity;
    }
    
    // Update selling price
    if (sellingPrice !== undefined && sellingPrice > 0) {
      inventoryItem.sellingPrice = sellingPrice;
    }

    await inventoryItem.save();

    // Also update the linked order if exists
    if (inventoryItem.orderId) {
      const order = await Order.findById(inventoryItem.orderId);
      if (order && order.items.length > 0) {
        order.items[0].quantity = purchasedQuantity || order.items[0].quantity;
        order.totalAmount = order.items[0].price * (purchasedQuantity || order.items[0].quantity) / order.items[0].quantity;
        await order.save();
      }
    }

    res.json({
      message: 'Inventory updated successfully',
      inventoryItem
    });
  } catch (error) {
    console.error('Error updating inventory:', error);
    res.status(500).json({ error: 'Failed to update inventory' });
  }
});

// Cancel/Delete inventory item (cancels order as well)
router.delete('/inventory/:id', verifyStoreToken, async (req, res) => {
  try {
    const { id } = req.params;
    const storeId = req.store.storeId;

    const inventoryItem = await StoreInventory.findOne({ _id: id, storeId });
    if (!inventoryItem) {
      return res.status(404).json({ error: 'Inventory item not found' });
    }

    // Prevent deleting/cancelling received items
    if (inventoryItem.deliveryStatus === 'received') {
      return res.status(403).json({ error: 'Cannot cancel received items' });
    }

    // Cancel the linked order if exists
    if (inventoryItem.orderId) {
      await Order.findByIdAndUpdate(inventoryItem.orderId, { 
        status: 'cancelled',
        paymentStatus: 'failed'
      });
    }

    // Restore product quantity back to farmer's inventory
    const product = await Product.findById(inventoryItem.productId);
    if (product) {
      product.quantity += inventoryItem.purchasedQuantity;
      if (product.status === 'sold') {
        product.status = 'active';
      }
      await product.save();
    }

    await StoreInventory.findOneAndDelete({ _id: id, storeId });

    res.json({ message: 'Inventory item deleted successfully' });
  } catch (error) {
    console.error('Error deleting inventory:', error);
    res.status(500).json({ error: 'Failed to delete inventory item' });
  }
});

// Get store dashboard stats
router.get('/dashboard-stats', verifyStoreToken, async (req, res) => {
  try {
    const storeId = req.store.storeId;

    const inventory = await StoreInventory.find({ storeId });
    
    const totalProducts = inventory.length;
    const totalValue = inventory.reduce((sum, item) => sum + (item.availableQuantity * item.sellingPrice), 0);
    const lowStockItems = inventory.filter(item => item.status === 'low-stock').length;
    const outOfStockItems = inventory.filter(item => item.status === 'out-of-stock').length;
    
    // Get unique farmers
    const uniqueFarmers = [...new Set(inventory.map(item => item.farmerId.toString()))].length;

    // Category breakdown
    const categoryBreakdown = inventory.reduce((acc, item) => {
      acc[item.category] = (acc[item.category] || 0) + 1;
      return acc;
    }, {});

    res.json({
      totalProducts,
      totalValue,
      lowStockItems,
      outOfStockItems,
      uniqueFarmers,
      categoryBreakdown
    });
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    res.status(500).json({ error: 'Failed to fetch dashboard stats' });
  }
});

// Get store profile
router.get('/profile', verifyStoreToken, async (req, res) => {
  try {
    const store = await Store.findById(req.store.storeId).select('-password');
    if (!store) {
      return res.status(404).json({ error: 'Store not found' });
    }
    res.json({ store });
  } catch (error) {
    console.error('Error fetching store profile:', error);
    res.status(500).json({ error: 'Failed to fetch profile' });
  }
});

// Update store profile
router.put('/profile', verifyStoreToken, async (req, res) => {
  try {
    const { storeName, ownerName, phone, address, city, state, pincode, gstNumber, storeType } = req.body;

    const store = await Store.findByIdAndUpdate(
      req.store.storeId,
      { storeName, ownerName, phone, address, city, state, pincode, gstNumber, storeType },
      { new: true }
    ).select('-password');

    res.json({
      message: 'Profile updated successfully',
      store
    });
  } catch (error) {
    console.error('Error updating store profile:', error);
    res.status(500).json({ error: 'Failed to update profile' });
  }
});

// Put inventory item for sale
router.put('/inventory/:id/sale', verifyStoreToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { isForSale, saleQuantity, salePrice } = req.body;
    const storeId = req.store.storeId;

    const inventoryItem = await StoreInventory.findOne({ _id: id, storeId });
    if (!inventoryItem) {
      return res.status(404).json({ error: 'Inventory item not found' });
    }

    // Only received items can be put for sale
    if (inventoryItem.deliveryStatus !== 'received') {
      return res.status(400).json({ error: 'Only received items can be put for sale' });
    }

    // Validate sale quantity
    if (saleQuantity > inventoryItem.availableQuantity) {
      return res.status(400).json({ error: 'Sale quantity cannot exceed available quantity' });
    }

    inventoryItem.isForSale = isForSale;
    inventoryItem.saleQuantity = saleQuantity || 0;
    inventoryItem.salePrice = salePrice || inventoryItem.sellingPrice;

    await inventoryItem.save();

    res.json({
      message: isForSale ? 'Item put for sale successfully' : 'Item removed from sale',
      inventoryItem
    });
  } catch (error) {
    console.error('Error updating sale status:', error);
    res.status(500).json({ error: 'Failed to update sale status' });
  }
});

// Get all products for sale from all stores (PUBLIC - for buyers)
router.get('/products-for-sale', async (req, res) => {
  try {
    const products = await StoreInventory.find({ 
      isForSale: true, 
      saleQuantity: { $gt: 0 },
      deliveryStatus: 'received'
    })
    .populate('storeId', 'storeName city state address')
    .sort({ createdAt: -1 });

    // Format response
    const formattedProducts = products.map(item => ({
      _id: item._id,
      productName: item.productName,
      category: item.category,
      quantity: item.saleQuantity,
      unit: item.unit,
      price: item.salePrice,
      originalPrice: item.purchasePrice,
      store: {
        id: item.storeId._id,
        name: item.storeId.storeName,
        city: item.storeId.city,
        state: item.storeId.state,
        address: item.storeId.address
      },
      farmerName: item.farmerName
    }));

    res.json({ products: formattedProducts });
  } catch (error) {
    console.error('Error fetching products for sale:', error);
    res.status(500).json({ error: 'Failed to fetch products' });
  }
});

// Purchase from store (for buyers)
router.post('/purchase-from-store', async (req, res) => {
  try {
    const { inventoryId, quantity, buyerId, buyerName, buyerEmail, shippingAddress, contactNumber } = req.body;

    const inventoryItem = await StoreInventory.findById(inventoryId).populate('storeId');
    if (!inventoryItem) {
      return res.status(404).json({ error: 'Product not found' });
    }

    if (!inventoryItem.isForSale) {
      return res.status(400).json({ error: 'This product is not for sale' });
    }

    if (quantity > inventoryItem.saleQuantity) {
      return res.status(400).json({ error: 'Requested quantity not available' });
    }

    // Update inventory
    inventoryItem.saleQuantity -= quantity;
    inventoryItem.availableQuantity -= quantity;
    
    if (inventoryItem.saleQuantity === 0) {
      inventoryItem.isForSale = false;
    }

    await inventoryItem.save();

    // Create order
    const order = new Order({
      buyerId,
      buyerName,
      buyerEmail,
      items: [{
        productId: inventoryItem.productId,
        productName: inventoryItem.productName,
        quantity,
        unit: inventoryItem.unit,
        price: inventoryItem.salePrice,
        farmerId: inventoryItem.farmerId,
        farmerName: inventoryItem.farmerName
      }],
      totalAmount: inventoryItem.salePrice * quantity,
      status: 'confirmed',
      paymentStatus: 'pending',
      paymentMethod: 'Store Purchase',
      shippingAddress,
      contactNumber,
      notes: `Purchased from ${inventoryItem.storeId.storeName}`
    });

    await order.save();

    res.status(201).json({
      message: 'Purchase successful',
      order
    });
  } catch (error) {
    console.error('Error purchasing from store:', error);
    res.status(500).json({ error: 'Failed to complete purchase' });
  }
});

// Get orders for store (buyer orders from store's inventory)
router.get('/orders', verifyStoreToken, async (req, res) => {
  try {
    const storeId = req.store.storeId;

    // Find orders where the farmerId (seller) matches the store ID
    // This includes orders where items were bought from this store
    const orders = await Order.find({
      'items.farmerId': storeId
    }).sort({ createdAt: -1 });

    // Filter items to only show this store's items
    const storeOrders = orders.map(order => {
      const storeItems = order.items.filter(
        item => item.farmerId.toString() === storeId
      );
      const storeTotal = storeItems.reduce(
        (sum, item) => sum + (item.price * item.quantity), 0
      );
      
      return {
        _id: order._id,
        buyerName: order.buyerName,
        buyerEmail: order.buyerEmail,
        items: storeItems,
        totalAmount: storeTotal,
        status: order.status,
        paymentStatus: order.paymentStatus,
        shippingAddress: order.shippingAddress,
        contactNumber: order.contactNumber,
        createdAt: order.createdAt,
        deliveredAt: order.deliveredAt
      };
    });

    res.json({ orders: storeOrders });
  } catch (error) {
    console.error('Error fetching store orders:', error);
    res.status(500).json({ error: 'Failed to fetch orders' });
  }
});

// Update order status (for store)
router.put('/orders/:orderId/status', verifyStoreToken, async (req, res) => {
  try {
    const { orderId } = req.params;
    const { status } = req.body;
    const storeId = req.store.storeId;

    const validStatuses = ['processing', 'shipped', 'delivered'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }

    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    // Check if this store has items in this order
    const hasStoreItems = order.items.some(
      item => item.farmerId.toString() === storeId
    );
    if (!hasStoreItems) {
      return res.status(403).json({ error: 'You do not have items in this order' });
    }

    order.status = status;
    if (status === 'delivered') {
      order.deliveredAt = new Date();
    }
    await order.save();

    res.json({
      message: 'Order status updated successfully',
      order
    });
  } catch (error) {
    console.error('Error updating order status:', error);
    res.status(500).json({ error: 'Failed to update order status' });
  }
});

module.exports = router;
