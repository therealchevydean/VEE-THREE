/**
 * AI JSON Helper
 * Provides reliable JSON responses from Gemini API with retry logic
 */

import axios from 'axios';
import { GEMINI_API_KEY, GEMINI_MODEL, GEMINI_API_URL } from '../config/ai';

export async function callGeminiJson<T = any>(
  prompt: string,
  options: {
    maxRetries?: number;
    temperature?: number;
  } = {}
): Promise<T> {
  const { maxRetries = 3, temperature = 0.7 } = options;

  if (!GEMINI_API_KEY) {
    throw new Error('GEMINI_API_KEY not configured');
  }

  const url = `${GEMINI_API_URL}/${GEMINI_MODEL}:generateContent?key=${GEMINI_API_KEY}`;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const res = await axios.post(url, {
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          temperature,
          topP: 0.95,
          topK: 40,
        },
      });

      const text = res.data?.candidates?.[0]?.content?.parts?.[0]?.text || '';
      
      // Try to extract JSON from markdown code blocks if present
      const jsonMatch = text.match(/```json\n?([\s\S]*?)\n?```/) || text.match(/```\n?([\s\S]*?)\n?```/);
      const jsonText = jsonMatch ? jsonMatch[1] : text;

      // Parse JSON
      const parsed = JSON.parse(jsonText.trim());
      return parsed as T;
    } catch (error) {
      console.warn(`[aiJson] Attempt ${attempt}/${maxRetries} failed:`, error);
      
      if (attempt === maxRetries) {
        throw new Error(
          `Failed to get valid JSON from Gemini after ${maxRetries} attempts: ${
            error instanceof Error ? error.message : String(error)
          }`
        );
      }

      // Wait before retry (exponential backoff)
      await new Promise((resolve) => setTimeout(resolve, 1000 * attempt));
    }
  }

  throw new Error('Unexpected: loop exited without return or throw');
}

export async function callGemini(prompt: string): Promise<string> {
  if (!GEMINI_API_KEY) {
    throw new Error('GEMINI_API_KEY not configured');
  }

  const url = `${GEMINI_API_URL}/${GEMINI_MODEL}:generateContent?key=${GEMINI_API_KEY}`;

  const res = await axios.post(url, {
    contents: [{ parts: [{ text: prompt }] }],
  });

  const text = res.data?.candidates?.[0]?.content?.parts?.[0]?.text || '';
  return text;
}
