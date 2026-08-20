import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';

process.env.MONGOMS_VERSION = '7.0.14';

let mongod;

export async function startMemoryDb() {
  mongod = await MongoMemoryServer.create();
  process.env.MONGO_URI = mongod.getUri();
  await mongoose.connect(process.env.MONGO_URI);
  return mongod;
}

export async function stopMemoryDb() {
  await mongoose.disconnect();
  await mongod?.stop();
}
