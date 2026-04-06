import express from 'express';
import { getQnA, askQuestion, answerQuestion } from '../controllers/qnaController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.get('/:productId', getQnA);
router.post('/:productId', protect, askQuestion);
router.post('/:id/answer', protect, answerQuestion);

export default router;
