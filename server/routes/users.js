import express from 'express';
import {
  getProfile, updateProfile, changePassword,
  addAddress, updateAddress, deleteAddress,
  toggleWishlist, getAllUsers,
} from '../controllers/userController.js';
import { protect, admin } from '../middleware/auth.js';

const router = express.Router();

router.get('/profile', protect, getProfile);
router.put('/profile', protect, updateProfile);
router.put('/change-password', protect, changePassword);
router.post('/addresses', protect, addAddress);
router.put('/addresses/:id', protect, updateAddress);
router.delete('/addresses/:id', protect, deleteAddress);
router.post('/wishlist/:productId', protect, toggleWishlist);
router.get('/all', protect, admin, getAllUsers);

export default router;
