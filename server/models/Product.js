import mongoose from 'mongoose';

const productSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  brand: { type: String, required: true, trim: true },
  category: { type: String, required: true },
  subcategory: { type: String, default: '' },
  description: { type: String, required: true },
  highlights: [{ type: String }],
  specifications: { type: Map, of: String, default: {} },
  price: { type: Number, required: true, min: 0 },
  originalPrice: { type: Number, required: true },
  discount: { type: Number, default: 0, min: 0, max: 100 },
  stock: { type: Number, required: true, default: 0, min: 0 },
  images: [{ type: String }],
  image: { type: String, required: true },
  rating: { type: Number, default: 0, min: 0, max: 5 },
  numReviews: { type: Number, default: 0 },
  badge: { type: String, default: '' },
  tags: [{ type: String }],
  isFeatured: { type: Boolean, default: false },
  isActive: { type: Boolean, default: true },
  seller: { type: String, default: 'Flipkart Retail' },
  deliveryDays: { type: Number, default: 5 },
  warranty: { type: String, default: '' },
}, { timestamps: true });

productSchema.index({ name: 'text', brand: 'text', description: 'text', tags: 'text' });

export default mongoose.model('Product', productSchema);
