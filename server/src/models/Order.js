const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema({
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  productName: {
    type: String,
    required: true
  },
  quantity: {
    type: Number,
    required: true,
    min: 1
  },
  unit: {
    type: String,
    required: true
  },
  price: {
    type: Number,
    required: true
  },
  farmerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  farmerName: {
    type: String,
    required: true
  },
  image: {
    type: String
  }
});

const orderSchema = new mongoose.Schema({
  buyerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  buyerName: {
    type: String,
    required: true
  },
  buyerEmail: {
    type: String,
    required: true
  },
  items: [orderItemSchema],
  totalAmount: {
    type: Number,
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'processing', 'shipped', 'ready_for_pickup', 'delivered', 'cancelled'],
    default: 'confirmed'
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'held', 'completed', 'released', 'failed'],
    default: 'pending'
  },
  paymentMethod: {
    type: String,
    default: 'QR Payment'
  },
  shippingAddress: {
    type: String,
    required: true
  },
  contactNumber: {
    type: String,
    required: true
  },
  notes: {
    type: String
  },
  // New fields for store-based delivery system
  orderType: {
    type: String,
    enum: ['direct', 'store_pickup', 'store_delivery'],
    default: 'store_pickup'
  },
  selectedStoreId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Store'
  },
  selectedStoreName: {
    type: String
  },
  // Quality check fields
  qualityCheckStatus: {
    type: String,
    enum: ['pending', 'passed', 'failed', 'not_required'],
    default: 'pending'
  },
  qualityCheckNotes: {
    type: String
  },
  qualityCheckedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Store'
  },
  qualityCheckedAt: {
    type: Date
  },
  // Pickup code for buyer to collect from store
  pickupCode: {
    type: String
  },
  // Track when order arrived at store
  arrivedAtStoreAt: {
    type: Date
  },
  // Track when buyer picked up
  pickedUpAt: {
    type: Date
  },
  deliveredAt: {
    type: Date
  },
  paidAt: {
    type: Date
  }
}, {
  timestamps: true
});

// Generate pickup code before saving
orderSchema.pre('save', function(next) {
  if (this.isNew && this.orderType === 'store_pickup' && !this.pickupCode) {
    this.pickupCode = Math.random().toString(36).substring(2, 8).toUpperCase();
  }
  next();
});

module.exports = mongoose.model('Order', orderSchema);
