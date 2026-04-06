import 'dotenv/config';
import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import authRoutes from './routes/auth.js';
import productRoutes from './routes/products.js';
import orderRoutes from './routes/orders.js';
import userRoutes from './routes/users.js';
import reviewRoutes from './routes/reviews.js';
import categoryRoutes from './routes/categories.js';
import adminRoutes from './routes/admin.js';
import qnaRoutes from './routes/qna.js';
import notificationRoutes from './routes/notifications.js';
import sellerRoutes from './routes/seller.js';
import User from './models/User.js';
import Product from './models/Product.js';
import { Category } from './models/Review.js';

const app = express();

const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:5174',
  'http://localhost:3000',
  'http://localhost:4173',
  'http://127.0.0.1:5173',
  'http://127.0.0.1:3000',
  process.env.CLIENT_URL,
  // add any extra Vercel preview URLs here if needed
].filter(Boolean);

app.use(cors({
  origin: (origin, cb) => {
    if (!origin || allowedOrigins.includes(origin)) cb(null, true);
    else cb(new Error('Not allowed by CORS'));
  },
  credentials: true,
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('✅ MongoDB Connected'))
  .catch(err => { console.error('❌ MongoDB Error:', err.message); process.exit(1); });

app.use('/api/auth',          authRoutes);
app.use('/api/products',      productRoutes);
app.use('/api/orders',        orderRoutes);
app.use('/api/users',         userRoutes);
app.use('/api/reviews',       reviewRoutes);
app.use('/api/categories',    categoryRoutes);
app.use('/api/admin',         adminRoutes);
app.use('/api/qna',           qnaRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/seller',        sellerRoutes);

app.get('/api/health', (_, res) => res.json({ status: 'OK', time: new Date().toISOString() }));

// ONE-TIME SEED ROUTE — remove after use
app.get('/api/seed-now', async (req, res) => {
  try {
    const { categories, products } = await import('./utils/seeder.js').then(m => ({ categories: m.categories, products: m.products })).catch(() => ({ categories: null, products: null }))
    if (!categories) return res.status(500).json({ message: 'Could not import seeder data' })
    await Promise.all([User.deleteMany(), Product.deleteMany(), Category.deleteMany()])
    await Category.insertMany(categories)
    await Product.insertMany(products)
    await User.create([
      { name: 'Gautam Admin', email: 'gautam2028@gmail.com', password: 'Admin@2028', role: 'admin', phone: '9999999999' },
      { name: 'Test User', email: 'user@flipkart.com', password: 'User@1234', role: 'user', phone: '8888888888' },
    ])
    res.json({ success: true, message: `Seeded ${products.length} products, ${categories.length} categories, 2 users` })
  } catch (err) {
    res.status(500).json({ success: false, message: err.message })
  }
})

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.statusCode || 500).json({ success: false, message: err.message || 'Internal Server Error' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running → http://localhost:${PORT}`);
  console.log(`📦 Environment: ${process.env.NODE_ENV}`);
  console.log(`💳 Razorpay: ${process.env.RAZORPAY_KEY_ID ? '✅ Configured' : '❌ Not configured'}`);
});
