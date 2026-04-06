import express from 'express';
import {
  placeOrder, getMyOrders, getOrderById,
  cancelOrder, returnOrder, getAllOrders, updateOrderStatus,
  createRazorpayOrder, verifyRazorpayPayment,
} from '../controllers/orderController.js';
import { protect, admin } from '../middleware/auth.js';

const router = express.Router();

router.post('/', protect, placeOrder);
router.get('/my', protect, getMyOrders);
router.get('/all', protect, admin, getAllOrders);
router.get('/:id', protect, getOrderById);
router.put('/:id/cancel', protect, cancelOrder);
router.put('/:id/return', protect, returnOrder);
router.put('/:id/status', protect, admin, updateOrderStatus);
router.post('/razorpay/create', protect, createRazorpayOrder);
router.post('/razorpay/verify', protect, verifyRazorpayPayment);

export default router;
