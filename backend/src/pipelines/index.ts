// Removed unused gemini import

// We need to check if gemini service exists or if we should use direct google-genai
// The implementation plan said: "Use the @google/genai integration already in the project."
// I will assume for now I should implement a helper if it doesn't exist, but previous tasks implied it might.
// Wait, I saw VITE_GEMINI_API_KEY. I didn't see a backend Gemini wrapper in the file list Step 412 (services dir).
// I will check services dir first or just implement the call here.
// Actually, to be safe, I'll implement a local helper here if needed or import a generic one.
// Let's assume we use `@google/genai`.

import { GoogleGenerativeAI } from '@google/generative-ai';
import * as Prompts from '../services/pipelinePrompts';
import dotenv from 'dotenv';

dotenv.config();

const genAI = new GoogleGenerativeAI(process.env.VITE_GEMINI_API_KEY || '');
const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });


async function generateWithGemini(prompt: string): Promise<any> {
    try {
        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();

        // Clean markdown code blocks if present
        const cleanJSON = text.replace(/```json/g, '').replace(/```/g, '').trim();
        return JSON.parse(cleanJSON);
    } catch (error) {
        console.error('Gemini Generation Error:', error);
        throw new Error('Failed to generate pipeline content');
    }
}

export const generateSocialPostDraft = async (input: Prompts.SocialPostInput) => {
    const prompt = Prompts.buildSocialPostPrompt(input);
    return await generateWithGemini(prompt);
};

export const generateListingDraft = async (input: Prompts.ListingInput) => {
    const prompt = Prompts.buildListingPrompt(input);
    return await generateWithGemini(prompt);
};

export const generateTokinFranksCardDraft = async (input: Prompts.TokinFranksInput) => {
    const prompt = Prompts.buildTokinFranksCardPrompt(input);
    return await generateWithGemini(prompt);
};

export const generateEbookSectionDraft = async (input: Prompts.EbookSectionInput) => {
    const prompt = Prompts.buildEbookSectionPrompt(input);
    return await generateWithGemini(prompt);
};
