import mongoose from 'mongoose';

const answerSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  name: String,
  role: { type: String, default: 'user' },
  answer: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});

const qnaSchema = new mongoose.Schema({
  product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  name: String,
  question: { type: String, required: true },
  answers: [answerSchema],
}, { timestamps: true });

export default mongoose.model('QnA', qnaSchema);
