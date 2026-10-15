import { fileURLToPath } from 'url';
import { createApp } from './app.js';
import { ENV } from './config/env.js';
import { connectDB } from './config/db.js';

async function startServer() {
  await connectDB();

  const app = createApp();

  const server = app.listen(ENV.PORT, () => {
    console.log(`=======================================================`);
    console.log(`🚀 TravelGenie AI Server running on http://localhost:${ENV.PORT}`);
    console.log(`🌍 Client URL: ${ENV.CLIENT_URL}`);
    console.log(`🤖 Gemini API Key configured: ${ENV.GEMINI_API_KEY ? 'Yes' : 'No (Using intelligent fallback generator)'}`);
    console.log(`📦 Demo Data Mode: ${ENV.IS_DEMO_MODE ? 'Enabled (Reliable verified fixtures)' : 'Live'}`);
    console.log(`=======================================================`);
  });

  return server;
}

const isDirectRun = process.argv[1] && (
  process.argv[1].endsWith('server.js') || 
  process.argv[1].endsWith('server.ts') || 
  (import.meta.url && fileURLToPath(import.meta.url) === process.argv[1])
);

if (isDirectRun) {
  startServer().catch((err) => {
    console.error('Fatal error starting server:', err);
    process.exit(1);
  });
}

export { startServer };
