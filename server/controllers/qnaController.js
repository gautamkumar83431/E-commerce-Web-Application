import QnA from '../models/QnA.js';

export const getQnA = async (req, res) => {
  try {
    const qnas = await QnA.find({ product: req.params.productId }).sort({ createdAt: -1 });
    res.json({ success: true, qnas });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const askQuestion = async (req, res) => {
  try {
    const { question } = req.body;
    if (!question?.trim()) return res.status(400).json({ success: false, message: 'Question is required' });
    const qna = await QnA.create({
      product: req.params.productId,
      user: req.user._id,
      name: req.user.name,
      question,
    });
    res.status(201).json({ success: true, qna });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const answerQuestion = async (req, res) => {
  try {
    const { answer } = req.body;
    if (!answer?.trim()) return res.status(400).json({ success: false, message: 'Answer is required' });
    const qna = await QnA.findById(req.params.id);
    if (!qna) return res.status(404).json({ success: false, message: 'Question not found' });
    qna.answers.push({ user: req.user._id, name: req.user.name, role: req.user.role, answer });
    await qna.save();
    res.json({ success: true, qna });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
