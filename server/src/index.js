import dotenv from 'dotenv';
import { app } from './app.js';
import { connectDB } from './config/db.js';

dotenv.config();

const PORT = process.env.PORT || 5000;

async function main() {
  await connectDB();
  app.listen(PORT, () => console.log(`[server] listening on http://localhost:${PORT}`));
}

main().catch((err) => {
  console.error('[server] failed to start:', err);
  process.exit(1);
});
