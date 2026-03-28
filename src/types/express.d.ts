// Extends the Express Request type to carry videoId set by the upload middleware.
// Must be a .d.ts or exported module to be picked up by TypeScript.
export {};

declare global {
  namespace Express {
    interface Request {
      videoId?: string;
    }
  }
}
