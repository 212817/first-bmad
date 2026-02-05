// Vercel Serverless Function entry point
// Re-exports the Express app from apps/api for Vercel deployment
import { createApp } from '../apps/api/dist/app.js';

const app = createApp();

export default app;
