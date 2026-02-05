// apps/api/src/vercel.ts
// Vercel serverless entry point - exports app without listening
import { createApp } from './app.js';

const app = createApp();

export default app;
