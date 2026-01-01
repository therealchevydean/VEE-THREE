/**
 * AI Configuration
 * Centralizes Gemini API configuration for VEE execution engine
 */

export const GEMINI_API_KEY =
  process.env.GEMINI_API_KEY || process.env.VITE_GEMINI_API_KEY || '';

export const GEMINI_MODEL = 'gemini-1.5-pro-latest';

export const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models';

if (!GEMINI_API_KEY) {
  console.warn(
    '[AI Config] GEMINI_API_KEY is not set. Draft generation will fail.'
  );
}

// Helper to check if AI is configured
export function isAIConfigured(): boolean {
  return Boolean(GEMINI_API_KEY);
}
