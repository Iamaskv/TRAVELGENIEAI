import mongoose from 'mongoose';
import { ENV } from './env.js';

let isMongoConnected = false;

export async function connectDB() {
  if (mongoose.connection && mongoose.connection.readyState >= 1) {
    isMongoConnected = true;
    return true;
  }

  if (!ENV.MONGODB_URI) {
    console.log('[DB] No MONGODB_URI provided. Running in high-reliability Memory Store mode.');
    return false;
  }

  try {
    mongoose.set('strictQuery', false);
    // 3 second server selection timeout so startup isn't blocked if Mongo is offline
    await mongoose.connect(ENV.MONGODB_URI, {
      serverSelectionTimeoutMS: 3000,
    });
    isMongoConnected = true;
    console.log('[DB] Successfully connected to MongoDB database.');
    return true;
  } catch (error) {
    isMongoConnected = false;
    console.warn(`[DB] Could not connect to MongoDB (${error.message}). Gracefully falling back to in-memory persistent store.`);
    return false;
  }
}

export function getIsMongoConnected() {
  return isMongoConnected;
}
