import { MongoMemoryServer } from 'mongodb-memory-server';

let mongod;

export async function startMemoryDb() {
  mongod = await MongoMemoryServer.create();
  process.env.MONGO_URI = mongod.getUri();
  return mongod;
}

export async function stopMemoryDb() {
  await mongod?.stop();
}
