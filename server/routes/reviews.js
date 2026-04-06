import express from 'express';
import { getProductReviews, addReview, deleteReview, markHelpful } from '../controllers/reviewController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.get('/:productId', getProductReviews);
router.post('/:productId', protect, addReview);
router.delete('/:id', protect, deleteReview);
router.put('/:id/helpful', markHelpful);

export default router;
