import mongoose from 'mongoose';

const orderItemSchema = new mongoose.Schema({
  product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  name: String, image: String, price: Number, qty: { type: Number, default: 1 },
});

const orderSchema = new mongoose.Schema({
  orderId: { type: String, unique: true },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  items: [orderItemSchema],
  shippingAddress: {
    fullName: String, phone: String, address: String,
    locality: String, city: String, state: String, pincode: String,
  },
  paymentMethod: { type: String, enum: ['COD', 'UPI', 'Card', 'NetBanking', 'Wallet'], default: 'COD' },
  paymentStatus: { type: String, enum: ['Pending', 'Paid', 'Failed', 'Refunded'], default: 'Pending' },
  itemsPrice: { type: Number, default: 0 },
  shippingPrice: { type: Number, default: 0 },
  taxPrice: { type: Number, default: 0 },
  totalPrice: { type: Number, default: 0 },
  status: {
    type: String,
    enum: ['Placed', 'Confirmed', 'Shipped', 'Out for Delivery', 'Delivered', 'Cancelled', 'Return Requested', 'Returned'],
    default: 'Placed',
  },
  statusHistory: [{
    status: String, message: String, date: { type: Date, default: Date.now },
  }],
  deliveryDate: Date,
  cancelReason: String,
  returnReason: String,
  razorpayPaymentId: String,
}, { timestamps: true });

orderSchema.pre('save', function (next) {
  if (!this.orderId) this.orderId = 'OD' + Date.now() + Math.floor(Math.random() * 9999);
  next();
});

export default mongoose.model('Order', orderSchema);
