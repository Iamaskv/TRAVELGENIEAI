import { createApp } from '../server/src/app.js';
import { connectDB } from '../server/src/config/db.js';

let cachedApp = null;

export default async function handler(req, res) {
  try {
    await connectDB();
  } catch (err) {
    console.warn('[Vercel Serverless] DB connection notice:', err);
  }

  if (!cachedApp) {
    cachedApp = createApp();
  }

  return cachedApp(req, res);
}
