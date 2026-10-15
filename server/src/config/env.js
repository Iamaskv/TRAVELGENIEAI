import dotenv from 'dotenv';

dotenv.config();

export const ENV = {
  PORT: process.env.PORT ? parseInt(process.env.PORT, 10) : 5000,
  CLIENT_URL: process.env.CLIENT_URL || 'http://localhost:5173',
  MONGODB_URI: process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/travelgenie',
  JWT_SECRET: process.env.JWT_SECRET || 'travelgenie_secure_jwt_secret_dev_2026',
  GEMINI_API_KEY: process.env.GEMINI_API_KEY || '',
  NODE_ENV: process.env.NODE_ENV || 'development',
  IS_DEMO_MODE: process.env.IS_DEMO_MODE !== 'false',
};
