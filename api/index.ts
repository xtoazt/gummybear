// Vercel serverless function entry point
// This imports the Express app from the source file
// Vercel will automatically compile this TypeScript file
import app from '../src/server.js';

// Export the Express app as the default handler
export default app;

