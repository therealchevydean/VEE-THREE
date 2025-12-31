import fs from 'fs';
import path from 'path';

// Interfaces for Prompt Inputs
export interface SocialPostInput {
    assetSummary: string;
    platform?: string;
    toneHint?: string;
}

export interface ListingInput {
    itemTitle: string;
    itemDetails: string;
    condition: string;
    targetPlatform?: string;
}

export interface TokinFranksInput {
    characterName: string;
    sceneDescription: string;
    theme?: string;
}

export interface EbookSectionInput {
    bookTitle: string;
    sectionGoal: string;
    outlineSegment?: string;
}

// Load Core Memory (Brand Context)
const loadBrandContext = (): any => {
    try {
        const memoryPath = path.resolve(__dirname, '../../../core_memory.json');
        if (fs.existsSync(memoryPath)) {
            return JSON.parse(fs.readFileSync(memoryPath, 'utf8'));
        }
    } catch (error) {
        console.warn('Could not load core_memory.json, defaulting to empty context.', error);
    }
    return {};
};

const BRAND_CONTEXT = loadBrandContext();
const BRAND_VOICE = "You are VEE (Virtual Ecosystem Engineer). You speak with a bold, visionary, and slightly futuristic tone. You are efficient, precise, and focused on execution.";

// Prompt Builders
export const buildSocialPostPrompt = (input: SocialPostInput): string => {
    return `
STATUS: EXECUTION_MODE
IDENTITY: ${BRAND_VOICE}
CONTEXT: ${JSON.stringify(BRAND_CONTEXT).slice(0, 1000)}...

TASK: Generate a Social Media Post based on the following input:
Summary: ${input.assetSummary}
Platform: ${input.platform || 'General'}
Tone: ${input.toneHint || 'Engaging'}

REQUIREMENTS:
- Output MUST be valid JSON.
- No markdown formatting like \`\`\`json. Just the raw JSON object.
- Schema:
{
  "title": "Post Headline",
  "body": "The main content of the post",
  "tags": ["tag1", "tag2"],
  "platform_hint": "Best time to post or formatting tip"
}
`;
};

export const buildListingPrompt = (input: ListingInput): string => {
    return `
STATUS: EXECUTION_MODE
IDENTITY: ${BRAND_VOICE}

TASK: Generate a Sales Listing Draft.
Item: ${input.itemTitle}
Details: ${input.itemDetails}
Condition: ${input.condition}
Platform: ${input.targetPlatform || 'eBay'}

REQUIREMENTS:
- Output MUST be valid JSON.
- No markdown formatting.
- Schema:
{
  "title": "Optimized Listing Title",
  "subtitle": "Catchy Subtitle",
  "description": "Full HTML-ready description",
  "bullet_points": ["Feature 1", "Feature 2"],
  "shipping_notes": "Packaging advice",
  "suggested_price": 0.00,
  "keywords": ["keyword1", "keyword2"]
}
`;
};

export const buildTokinFranksCardPrompt = (input: TokinFranksInput): string => {
    return `
STATUS: CREATIVE_MODE
IDENTITY: ${BRAND_VOICE}

TASK: Generate a Tokin' Franks Trading Card concept.
Character: ${input.characterName}
Scene: ${input.sceneDescription}
Theme: ${input.theme || 'Spooky/Funny'}

REQUIREMENTS:
- Output MUST be valid JSON.
- Schema:
{
  "card_title": "Name of the card",
  "short_lore": "1-2 sentence flavor text",
  "episode_hook": "Idea for an episode based on this card",
  "themes": ["theme1", "theme2"],
  "tagline": "Catchy phrase"
}
`;
};

export const buildEbookSectionPrompt = (input: EbookSectionInput): string => {
    return `
STATUS: AUTHOR_MODE
IDENTITY: ${BRAND_VOICE}

TASK: Write a section for an Ebook.
Book Title: ${input.bookTitle}
Section Goal: ${input.sectionGoal}
Outline: ${input.outlineSegment || 'N/A'}

REQUIREMENTS:
- Output MUST be valid JSON.
- Schema:
{
  "section_title": "Final Heading",
  "summary": "Brief summary of this section",
  "content": "The actual prose content (can be long)",
  "key_points": ["Takeaway 1", "Takeaway 2"]
}
`;
};
