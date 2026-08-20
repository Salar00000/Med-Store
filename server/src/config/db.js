import mongoose from 'mongoose';

export async function connectDB(uri) {
  const target = uri || process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/med-store';
  mongoose.set('strictQuery', true);
  return mongoose.connect(target);
}
