import mongoose from 'mongoose';

const productSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, index: true },
    price: { type: Number, required: true, min: 0 },
    originalPrice: { type: Number, min: 0 },
    category: { type: String, required: true, enum: ['Medicine', 'Vitamins', 'Devices', 'Protection', 'Essentials'] },
    emoji: { type: String, required: true },
    desc: { type: String, required: true },
    rating: { type: Number, default: 4.5, min: 0, max: 5 },
    reviews: { type: Number, default: 0 },
    stock: { type: Number, default: 100 },
    isActive: { type: Boolean, default: true },
    legacyId: { type: Number },
  },
  { timestamps: true }
);

// Text index for efficient full-text search
productSchema.index({ name: 'text', desc: 'text', category: 'text' });

export default mongoose.model('Product', productSchema);
