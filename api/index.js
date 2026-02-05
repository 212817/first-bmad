// Vercel Serverless Function entry point
import { createApp } from '../apps/api/dist/app.js';

const app = createApp();

export default app;
