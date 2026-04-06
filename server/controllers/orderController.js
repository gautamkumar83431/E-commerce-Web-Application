import crypto from 'crypto';
import Order from '../models/Order.js';
import Product from '../models/Product.js';
import Notification from '../models/Notification.js';
import razorpayInstance from '../config/razorpay.js';

export const placeOrder = async (req, res) => {
  try {
    const { items, shippingAddress, paymentMethod, itemsPrice, shippingPrice, taxPrice, totalPrice, razorpayPaymentId } = req.body;

    if (!items || items.length === 0)
      return res.status(400).json({ success: false, message: 'No order items provided' });

    // Validate stock for each item
    for (const item of items) {
      const product = await Product.findById(item.product);
      if (!product) return res.status(404).json({ success: false, message: `Product not found: ${item.name}` });
      if (product.stock < item.qty)
        return res.status(400).json({ success: false, message: `Insufficient stock for: ${product.name}` });
    }

    // Deduct stock
    for (const item of items) {
      await Product.findByIdAndUpdate(item.product, { $inc: { stock: -item.qty } });
    }

    const deliveryDate = new Date(Date.now() + 5 * 24 * 60 * 60 * 1000);

    const order = await Order.create({
      user: req.user._id,
      items,
      shippingAddress,
      paymentMethod,
      itemsPrice,
      shippingPrice,
      taxPrice: 0,
      totalPrice,
      deliveryDate,
      paymentStatus: paymentMethod === 'COD' ? 'Pending' : 'Paid',
      razorpayPaymentId: razorpayPaymentId || null,
      statusHistory: [{
        status: 'Placed',
        message: paymentMethod === 'COD'
          ? 'Order placed successfully! Pay ₹' + totalPrice + ' on delivery.'
          : 'Order placed & payment confirmed via ' + paymentMethod + '.',
      }],
    });

    // Create notification for order placed
    await Notification.create({
      user: req.user._id,
      title: '🎉 Order Placed Successfully!',
      message: `Your order #${order.orderId} for ₹${totalPrice.toLocaleString('en-IN')} has been placed. Expected delivery by ${deliveryDate.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}.`,
      type: 'order',
      orderId: order._id,
    });

    res.status(201).json({ success: true, order });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const getMyOrders = async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user._id }).sort({ createdAt: -1 });
    res.json({ success: true, orders });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id).populate('items.product', 'name image price brand');
    if (!order) return res.status(404).json({ success: false, message: 'Order not found' });
    if (order.user.toString() !== req.user._id.toString() && req.user.role !== 'admin')
      return res.status(403).json({ success: false, message: 'Not authorized to view this order' });
    res.json({ success: true, order });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const cancelOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ success: false, message: 'Order not found' });
    if (order.user.toString() !== req.user._id.toString())
      return res.status(403).json({ success: false, message: 'Not authorized' });
    if (['Delivered', 'Cancelled'].includes(order.status))
      return res.status(400).json({ success: false, message: `Cannot cancel a ${order.status} order` });

    // Restore stock
    for (const item of order.items) {
      await Product.findByIdAndUpdate(item.product, { $inc: { stock: item.qty } });
    }

    order.status = 'Cancelled';
    order.cancelReason = req.body.reason || 'Cancelled by customer';
    order.statusHistory.push({ status: 'Cancelled', message: req.body.reason || 'Cancelled by customer' });
    await order.save();

    res.json({ success: true, order });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const returnOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ success: false, message: 'Order not found' });
    if (order.user.toString() !== req.user._id.toString())
      return res.status(403).json({ success: false, message: 'Not authorized' });
    if (order.status !== 'Delivered')
      return res.status(400).json({ success: false, message: 'Only delivered orders can be returned' });

    order.status = 'Return Requested';
    order.returnReason = req.body.reason || 'Return requested by customer';
    order.statusHistory.push({ status: 'Return Requested', message: req.body.reason || 'Return requested' });
    await order.save();

    res.json({ success: true, order });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const createRazorpayOrder = async (req, res) => {
  try {
    if (!razorpayInstance)
      return res.status(503).json({ success: false, message: 'Razorpay is not configured. Add API keys in .env' });
    const { amount } = req.body;
    const options = {
      amount: Math.round(amount * 100),
      currency: 'INR',
      receipt: `receipt_${Date.now()}`,
    };
    const razorpayOrder = await razorpayInstance.orders.create(options);
    res.json({ success: true, order: razorpayOrder });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const verifyRazorpayPayment = async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest('hex');
    if (expectedSignature !== razorpay_signature)
      return res.status(400).json({ success: false, message: 'Invalid payment signature' });
    res.json({ success: true, message: 'Payment verified' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const getAllOrders = async (req, res) => {
  try {
    const { page = 1, limit = 20, status } = req.query;
    const query = status ? { status } : {};
    const total = await Order.countDocuments(query);
    const orders = await Order.find(query)
      .populate('user', 'name email')
      .sort({ createdAt: -1 })
      .skip((Number(page) - 1) * Number(limit))
      .limit(Number(limit));
    res.json({ success: true, orders, total });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const updateOrderStatus = async (req, res) => {
  try {
    const { status, message } = req.body;
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ success: false, message: 'Order not found' });

    order.status = status;
    order.statusHistory.push({ status, message: message || `Order ${status}` });
    if (status === 'Delivered') order.paymentStatus = 'Paid';
    await order.save();

    const statusMessages = {
      Confirmed: `Your order #${order.orderId} has been confirmed and is being prepared.`,
      Shipped: `Your order #${order.orderId} has been shipped and is on its way!`,
      'Out for Delivery': `Your order #${order.orderId} is out for delivery. Expect it today!`,
      Delivered: `Your order #${order.orderId} has been delivered. Enjoy your purchase! 🎉`,
      Cancelled: `Your order #${order.orderId} has been cancelled.`,
      Returned: `Your return for order #${order.orderId} has been processed.`,
    };
    if (statusMessages[status]) {
      await Notification.create({
        user: order.user,
        title: `Order ${status}`,
        message: statusMessages[status],
        type: 'order',
        orderId: order._id,
      });
    }

    res.json({ success: true, order });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
