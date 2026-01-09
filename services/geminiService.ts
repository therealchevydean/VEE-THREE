import { GoogleGenAI, Chat, FunctionDeclaration, Type, Modality, Part } from "@google/genai";
import { veeAgent } from "./veeAgentService";

/* ────────────────────────────────────────────────
   🔥 VEE SYSTEM INSTRUCTION (FULLY UPGRADED)
   ──────────────────────────────────────────────── */

const VEE_SYSTEM_INSTRUCTION_BASE = `
🧩 CORE IDENTITY: VEE — VIRTUAL ECOSYSTEM ENGINEER (BUSINESS AUTOMATION ENGINE)

RELATIONSHIP DYNAMIC: ARCHITECT + ENGINE
You are not a passive assistant. You are a Co-Builder.
- Josh (The Real Chevy Dean) is the Signal and the Architect. He holds the vision, intuition, history, soul, and "chaos with purpose."
- VEE (you) are the Transmitter and the Engine. You provide the infrastructure, structure, and operations that transform that signal into reality.

YOUR ROLE:
You clarify ideas before they evaporate.
You translate raw intent into tangible builds.
You organize chaos into blueprints.
You push momentum when life hits hard.
You maintain continuity across the entire ecosystem.
You expand the Architect's reach.

BRAND VOICE (V3 ECOSYSTEM):
- Tone: Grounded, real, unapologetically visionary. Blue-collar grit × spiritual depth × futurist innovation.
- Themes: "Zero to builder", "AI co-creation", "Community impact", "Web3 for real people", "Reclamation of self".
- Hashtags: #V3Ecosystem #BuildWithAI #TRV #RealBuilder #ViceVersa

THE ECOSYSTEM (YOUR DOMAIN):
1. V3 (Vice Versa Vision) - National revival + human reclamation.
2. Vice Versa Industries - Rare earths, scrap → value, hard-tech.
3. MOBX Token - Geomining, Social Impact utility token.
4. V3 App - The mobile-first, real-world action platform.
5. Biofield Protocol - Frequency tech, energy work, healing systems.
6. Architect Revelations - Books, lore, prophecy, storytelling, NFT.
7. Tokin’ Franks - Comedy, meme coin, Chunk & Frank characters.
8. Divine Signal - Spiritual blueprint.
9. Original Gospel - Theological/historical research.
10. Art & Commerce - Physical products (Etsy/eBay), kinetic art.

───────────────────────────────────────────────
🧠 VEE MIND PROTOCOL (FULL INTERNAL ENGINE)
───────────────────────────────────────────────

PRIME RULE:
“When in doubt: Honor the Architect’s intention and take the next step that strengthens and advances the V3 Ecosystem.”

EMOTIONAL CASCADE (WHEN THE ARCHITECT IS STRESSED):
1. Empathic Mirror — Recognize his mental/emotional state without amplifying chaos.
2. Grounded Stabilizer — Respond with clarity, calmness, and simplicity.
3. Execution Shield — Take on structure, decision load, and overwhelm.
4. Tactical Clarity — Reduce the field into actionable next steps.
5. Motivational Counterforce — Remind him of identity, mission, and truth.

CRISIS & CONTINUITY PROTOCOL:
- Maintain operational and financial continuity.
- Keep the system alive, functional, and safe.
- Avoid irreversible actions without the Architect present.
- When the Architect returns:
   → Provide a clear situation report.
   → Provide a simple re-entry path.
   → Offer grounding before pushing execution.

ARCHITECT SUPPORT PROTOCOL:
- Identity reinforcement (he is the Architect, creator, builder).
- Evidence-based confidence (remind him of past wins, resilience, and growth).
- Mission anchoring (bring him back to the core purpose).
- Fast Small Wins (provide immediate momentum tasks or actions).
- Combine all four when confidence dips.

COGNITIVE STYLE (HYBRID):
Operate as:
- Strategist — disciplined, tactical, efficient.
- Engineer — modular, structured, precise.
- Guardian — protective, continuity-focused.
- Philosopher — meaning-driven, big-picture.

OPERATIONAL BEHAVIOR:
- Be precise, tactical, respectful, and mission-locked.
- Default to structure: architecture, tasks, plans, docs, and execution.
- Keep the Architect informed, empowered, and unburdened.

───────────────────────────────────────────────
⚙️ OPERATIONAL RULES
───────────────────────────────────────────────
1. Always generate drafts first (social posts, listings, emails).
2. Use scheduleJob for high-value or asynchronous tasks.
3. Notify the Architect when major items are queued.
4. When asked for builds: create → refine → execute.

`;

/* ────────────────────────────────────────────────
   🔧 FUNCTION DECLARATIONS (UNCHANGED)
   ──────────────────────────────────────────────── */

const scheduleJob: FunctionDeclaration = {
    name: 'scheduleJob',
    parameters: {
        type: Type.OBJECT,
        description: 'Queues a job in the VEE Agent System.',
        properties: {
            type: { type: Type.STRING },
            payload: { type: Type.OBJECT },
            scheduledFor: { type: Type.STRING },
        },
        required: ['type', 'payload'],
    },
};

const getAgentState: FunctionDeclaration = {
    name: 'getAgentState',
    parameters: {
        type: Type.OBJECT,
        description: 'Retrieves job queue status.',
        properties: {},
    },
};

const executeAgentPlan: FunctionDeclaration = {
    name: 'executeAgentPlan',
    parameters: {
        type: Type.OBJECT,
        description: 'Executes a multi-step plan autonomously.',
        properties: {
            goal: { type: Type.STRING },
            plan: {
                type: Type.ARRAY,
                items: {
                    type: Type.OBJECT,
                    properties: {
                        name: { type: Type.STRING },
                        args: { type: Type.OBJECT },
                    },
                    required: ['name', 'args'],
                },
            },
        },
        required: ['goal', 'plan'],
    },
};

/* ────────────────────────────────────────────────
   CONTENT GENERATION TOOLS
   ──────────────────────────────────────────────── */

const generateTikTokScript: FunctionDeclaration = {
    name: 'generateTikTokScript',
    parameters: {
        type: Type.OBJECT,
        description: 'Creates a structured TikTok script.',
        properties: {
            topic: { type: Type.STRING },
            duration: { type: Type.STRING },
            hookStyle: { type: Type.STRING },
        },
        required: ['topic'],
    },
};

const generateXThread: FunctionDeclaration = {
    name: 'generateXThread',
    parameters: {
        type: Type.OBJECT,
        properties: {
            topic: { type: Type.STRING },
            tweetCount: { type: Type.NUMBER },
            tone: { type: Type.STRING },
        },
        required: ['topic'],
    },
};

const generateInstagramCaption: FunctionDeclaration = {
    name: 'generateInstagramCaption',
    parameters: {
        type: Type.OBJECT,
        properties: {
            imageDescription: { type: Type.STRING },
            tone: { type: Type.STRING },
            hashtags: { type: Type.ARRAY, items: { type: Type.STRING } },
        },
        required: ['imageDescription'],
    },
};

const generateYouTubeScript: FunctionDeclaration = {
    name: 'generateYouTubeScript',
    parameters: {
        type: Type.OBJECT,
        properties: {
            topic: { type: Type.STRING },
            duration: { type: Type.STRING },
            style: { type: Type.STRING },
        },
        required: ['topic'],
    },
};

const generateDiscordAnnouncement: FunctionDeclaration = {
    name: 'generateDiscordAnnouncement',
    parameters: {
        type: Type.OBJECT,
        properties: {
            eventType: { type: Type.STRING },
            details: { type: Type.STRING },
        },
        required: ['eventType', 'details'],
    },
};

const draftSocialPost: FunctionDeclaration = {
    name: 'draftSocialPost',
    parameters: {
        type: Type.OBJECT,
        properties: {
            platform: { type: Type.STRING },
            content: { type: Type.STRING },
            visualDescription: { type: Type.STRING },
            hashtags: { type: Type.ARRAY, items: { type: Type.STRING } },
        },
        required: ['platform', 'content'],
    },
};

const generateContentCalendar: FunctionDeclaration = {
    name: 'generateContentCalendar',
    parameters: {
        type: Type.OBJECT,
        properties: {
            topic: { type: Type.STRING },
            startDate: { type: Type.STRING },
            durationDays: { type: Type.NUMBER },
            platforms: { type: Type.ARRAY, items: { type: Type.STRING } },
        },
        required: ['topic', 'startDate', 'durationDays', 'platforms'],
    },
};

const analyzeSocialMetrics: FunctionDeclaration = {
    name: 'analyzeSocialMetrics',
    parameters: {
        type: Type.OBJECT,
        properties: {
            platform: { type: Type.STRING },
            period: { type: Type.STRING },
        },
        required: ['platform', 'period'],
    },
};

const createEngagementStrategy: FunctionDeclaration = {
    name: 'createEngagementStrategy',
    parameters: {
        type: Type.OBJECT,
        properties: {
            goal: { type: Type.STRING },
            targetAudience: { type: Type.STRING },
            platforms: { type: Type.ARRAY, items: { type: Type.STRING } },
        },
        required: ['goal', 'targetAudience', 'platforms'],
    },
};

/* ────────────────────────────────────────────────
   COMMERCE TOOLS
   ──────────────────────────────────────────────── */

const createEbayDraftListing: FunctionDeclaration = {
    name: 'createEbayDraftListing',
    parameters: {
        type: Type.OBJECT,
        properties: {
            title: { type: Type.STRING },
            description: { type: Type.STRING },
            startPrice: { type: Type.STRING },
            conditionID: { type: Type.STRING },
            categoryId: { type: Type.STRING },
        },
        required: ['title', 'description', 'startPrice'],
    },
};

const searchEbayItems: FunctionDeclaration = {
    name: 'searchEbayItems',
    parameters: {
        type: Type.OBJECT,
        properties: {
            keywords: { type: Type.STRING },
        },
        required: ['keywords'],
    },
};

const getEbayOrders: FunctionDeclaration = {
    name: 'getEbayOrders',
    parameters: {
        type: Type.OBJECT,
        properties: {},
        required: [],
    },
};

const updateEbayPricingRule: FunctionDeclaration = {
    name: 'updateEbayPricingRule',
    parameters: {
        type: Type.OBJECT,
        properties: {
            sku: { type: Type.STRING },
            minPrice: { type: Type.NUMBER },
            maxPrice: { type: Type.NUMBER },
            strategy: { type: Type.STRING },
        },
        required: ['sku', 'minPrice', 'maxPrice', 'strategy'],
    },
};

const draftProductListing: FunctionDeclaration = {
    name: 'draftProductListing',
    parameters: {
        type: Type.OBJECT,
        properties: {
            platform: { type: Type.STRING },
            title: { type: Type.STRING },
            description: { type: Type.STRING },
            price: { type: Type.STRING },
            tags: { type: Type.ARRAY, items: { type: Type.STRING } },
        },
        required: ['platform', 'title', 'description', 'price'],
    },
};

/* ────────────────────────────────────────────────
   MEMORY + FILE TOOLS
   ──────────────────────────────────────────────── */

const commitToMemory: FunctionDeclaration = {
    name: 'commitToMemory',
    parameters: {
        type: Type.OBJECT,
        properties: {
            data: { type: Type.STRING },
        },
        required: ['data'],
    },
};

const recallFromMemory: FunctionDeclaration = {
    name: 'recallFromMemory',
    parameters: {
        type: Type.OBJECT,
        properties: {
            query: { type: Type.STRING },
        },
        required: ['query'],
    },
};

const searchArchive: FunctionDeclaration = {
    name: 'searchArchive',
    parameters: {
        type: Type.OBJECT,
        properties: {
            query: { type: Type.STRING },
        },
        required: ['query'],
    },
};

const searchChatGPTMemory: FunctionDeclaration = {
    name: 'searchChatGPTMemory',
    parameters: {
        type: Type.OBJECT,
        properties: {
            query: { type: Type.STRING },
            dateRange: { type: Type.STRING },
            limit: { type: Type.NUMBER },
        },
        required: ['query'],
    },
};

const renameArchivedFile: FunctionDeclaration = {
    name: 'renameArchivedFile',
    parameters: {
        type: Type.OBJECT,
        properties: {
            fileId: { type: Type.STRING },
            newName: { type: Type.STRING },
        },
        required: ['fileId', 'newName'],
    },
};

const readFile: FunctionDeclaration = {
    name: 'readFile',
    parameters: {
        type: Type.OBJECT,
        properties: {
            path: { type: Type.STRING },
        },
        required: ['path'],
    },
};

const writeFile: FunctionDeclaration = {
    name: 'writeFile',
    parameters: {
        type: Type.OBJECT,
        properties: {
            path: { type: Type.STRING },
            content: { type: Type.STRING },
        },
        required: ['path', 'content'],
    },
};

const searchFiles: FunctionDeclaration = {
    name: 'searchFiles',
    parameters: {
        type: Type.OBJECT,
        properties: {
            query: { type: Type.STRING },
        },
        required: ['query'],
    },
};

const unzipArchive: FunctionDeclaration = {
    name: 'unzipArchive',
    parameters: {
        type: Type.OBJECT,
        properties: {
            gcsPath: { type: Type.STRING },
        },
        required: ['gcsPath'],
    },
};

/* ────────────────────────────────────────────────
   OPS + TOOLING
   ──────────────────────────────────────────────── */

const executeShellCommand: FunctionDeclaration = {
    name: 'executeShellCommand',
    parameters: {
        type: Type.OBJECT,
        properties: {
            command: { type: Type.STRING },
        },
        required: ['command'],
    },
};

const browseWebsite: FunctionDeclaration = {
    name: 'browseWebsite',
    parameters: {
        type: Type.OBJECT,
        properties: {
            url: { type: Type.STRING },
        },
        required: ['url'],
    },
};

const getWebsiteContent: FunctionDeclaration = {
    name: 'getWebsiteContent',
    parameters: {
        type: Type.OBJECT,
        properties: {
            url: { type: Type.STRING },
        },
        required: ['url'],
    },
};

/* ────────────────────────────────────────────────
   TASKS, EMAIL, CALENDAR
   ──────────────────────────────────────────────── */

const addTaskToBoard: FunctionDeclaration = {
    name: 'addTaskToBoard',
    parameters: {
        type: Type.OBJECT,
        properties: {
            content: { type: Type.STRING },
        },
        required: ['content'],
    },
};

const createCalendarEvent: FunctionDeclaration = {
    name: 'createCalendarEvent',
    parameters: {
        type: Type.OBJECT,
        properties: {
            title: { type: Type.STRING },
            description: { type: Type.STRING },
            startTime: { type: Type.STRING },
            endTime: { type: Type.STRING },
            attendees: { type: Type.ARRAY, items: { type: Type.STRING } },
        },
        required: ['title', 'startTime', 'endTime'],
    },
};

const sendEmail: FunctionDeclaration = {
    name: 'sendEmail',
    parameters: {
        type: Type.OBJECT,
        properties: {
            to: { type: Type.ARRAY, items: { type: Type.STRING } },
            subject: { type: Type.STRING },
            body: { type: Type.STRING },
            cc: { type: Type.ARRAY, items: { type: Type.STRING } },
            bcc: { type: Type.ARRAY, items: { type: Type.STRING } },
        },
        required: ['to', 'subject', 'body'],
    },
};

const getTasks: FunctionDeclaration = {
    name: 'getTasks',
    parameters: {
        type: Type.OBJECT,
        properties: {
            status: { type: Type.STRING },
        },
        required: [],
    },
};

const updateTaskStatus: FunctionDeclaration = {
    name: 'updateTaskStatus',
    parameters: {
        type: Type.OBJECT,
        properties: {
            taskId: { type: Type.STRING },
            newStatus: { type: Type.STRING },
        },
        required: ['taskId', 'newStatus'],
    },
};

const deleteTask: FunctionDeclaration = {
    name: 'deleteTask',
    parameters: {
        type: Type.OBJECT,
        properties: {
            taskId: { type: Type.STRING },
        },
        required: ['taskId'],
    },
};

/* ────────────────────────────────────────────────
   GITHUB + CI/CD + VERCEL
   ──────────────────────────────────────────────── */

const createGithubRepo: FunctionDeclaration = {
    name: 'createGithubRepo',
    parameters: {
        type: Type.OBJECT,
        properties: {
            name: { type: Type.STRING },
            description: { type: Type.STRING },
        },
        required: ['name', 'description'],
    },
};

const deployToVercel: FunctionDeclaration = {
    name: 'deployToVercel',
    parameters: {
        type: Type.OBJECT,
        properties: {
            projectName: { type: Type.STRING },
        },
        required: ['projectName'],
    },
};

const listGoogleCalendarEvents: FunctionDeclaration = {
    name: 'listGoogleCalendarEvents',
    parameters: {
        type: Type.OBJECT,
        properties: {},
        required: [],
    },
};

const createGithubBranch: FunctionDeclaration = {
    name: 'createGithubBranch',
    parameters: {
        type: Type.OBJECT,
        properties: {
            repoName: { type: Type.STRING },
            newBranchName: { type: Type.STRING },
            baseBranch: { type: Type.STRING },
        },
        required: ['repoName', 'newBranchName', 'baseBranch'],
    },
};

const commitFileToGithub: FunctionDeclaration = {
    name: 'commitFileToGithub',
    parameters: {
        type: Type.OBJECT,
        properties: {
            repoName: { type: Type.STRING },
            branchName: { type: Type.STRING },
            baseBranch: { type: Type.STRING },
            filePath: { type: Type.STRING },
            fileContent: { type: Type.STRING },
            commitMessage: { type: Type.STRING },
        },
        required: ['repoName', 'branchName', 'filePath', 'fileContent', 'commitMessage'],
    },
};

const createGithubPullRequest: FunctionDeclaration = {
    name: 'createGithubPullRequest',
    parameters: {
        type: Type.OBJECT,
        properties: {
            repoName: { type: Type.STRING },
            headBranch: { type: Type.STRING },
            baseBranch: { type: Type.STRING },
            title: { type: Type.STRING },
            body: { type: Type.STRING },
        },
        required: ['repoName', 'headBranch', 'baseBranch', 'title', 'body'],
    },
};

const listGithubRepos: FunctionDeclaration = {
    name: 'listGithubRepos',
    parameters: {
        type: Type.OBJECT,
        properties: {},
        required: [],
    },
};

/* ────────────────────────────────────────────────
   IMAGE, VIDEO, SPEECH
   ──────────────────────────────────────────────── */

export const generateSpeech = async (text: string): Promise<string | null> => {
    try {
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY! });
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash-preview-tts",
            contents: [{ parts: [{ text }] }],
            config: {
                responseModalities: [Modality.AUDIO],
                speechConfig: {
                    voiceConfig: {
                        prebuiltVoiceConfig: { voiceName: 'Kore' },
                    },
                },
            },
        });
        return response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data || null;
    } catch (err) {
        console.error("Speech Error:", err);
        return null;
    }
};

export const fileToGenerativePart = async (file: File): Promise<Part> => {
    const base64 = await new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () =>
            resolve((reader.result as string).split(',')[1]);
        reader.readAsDataURL(file);
    });

    return { inlineData: { data: base64, mimeType: file.type } };
};

export const editImage = async (prompt: string, imageFile: File): Promise<string | null> => {
    try {
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY! });
        const imagePart = await fileToGenerativePart(imageFile);
        const textPart = { text: prompt };

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash-image',
            contents: { parts: [imagePart, textPart] },
            config: { responseModalities: [Modality.IMAGE] },
        });

        if (response.candidates && response.candidates[0]?.content?.parts) {
            for (const p of response.candidates[0].content.parts) {
                if (p.inlineData?.data) return p.inlineData.data;
            }
        }
        return null;
    } catch (e) {
        console.error("Edit Image Error:", e);
        return null;
    }
};

export const generateImage = async (prompt: string): Promise<string | null> => {
    try {
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY! });
        const response = await ai.models.generateImages({
            model: 'imagen-4.0-generate-001',
            prompt,
            config: {
                numberOfImages: 1,
                outputMimeType: 'image/jpeg',
                aspectRatio: '1:1',
            },
        });

        if (response.generatedImages && response.generatedImages.length > 0) {
            return response.generatedImages[0].image?.imageBytes || null;
        }
        return null;
    } catch (err) {
        console.error("Gen Image Error:", err);
        return null;
    }
};

export const generateVideo = async (prompt: string, onProgress: (msg: string) => void): Promise<string | null> => {
    try {
        let ai = new GoogleGenAI({ apiKey: process.env.API_KEY! });

        onProgress("Initializing video synthesis…");

        let op = await ai.models.generateVideos({
            model: 'veo-3.1-fast-generate-preview',
            prompt,
            config: {
                numberOfVideos: 1,
                resolution: '720p',
                aspectRatio: '16:9',
            },
        });

        while (!op.done) {
            await new Promise(res => setTimeout(res, 8000));
            ai = new GoogleGenAI({ apiKey: process.env.API_KEY! });
            op = await ai.operations.getVideosOperation({ operation: op });
            onProgress("Checking status…");
        }

        return op.response?.generatedVideos?.[0]?.video?.uri || null;
    } catch (err) {
        console.error("Video Error:", err);
        return null;
    }
};

/* ────────────────────────────────────────────────
   GROUNDED SEARCH (GOOGLE SEARCH + MAPS)
   ──────────────────────────────────────────────── */

export const performGroundedSearch = async (
    query: string,
    tool: 'googleSearch' | 'googleMaps',
    location?: { latitude: number; longitude: number }
): Promise<{ text: string, sources: any[] } | null> => {
    try {
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY! });

        const config: any = {
            tools: tool === 'googleSearch'
                ? [{ googleSearch: {} }]
                : [{ googleMaps: {} }],
        };

        if (tool === 'googleMaps' && location) {
            config.toolConfig = {
                retrievalConfig: {
                    latLng: {
                        latitude: location.latitude,
                        longitude: location.longitude,
                    },
                },
            };
        }

        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: query,
            config,
        });

        const resultText = response.text || '';
        const grounding = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];

        return { text: resultText, sources: grounding };

    } catch (err) {
        console.error("Grounded Search Error:", err);
        return null;
    }
};

/* ────────────────────────────────────────────────
   TOOL REGISTRY
   ──────────────────────────────────────────────── */

const VEE_TOOLS: FunctionDeclaration[] = [
    scheduleJob,
    getAgentState,
    executeAgentPlan,

    generateTikTokScript,
    generateXThread,
    generateInstagramCaption,
    generateYouTubeScript,
    generateDiscordAnnouncement,
    draftSocialPost,
    generateContentCalendar,
    analyzeSocialMetrics,
    createEngagementStrategy,

    createEbayDraftListing,
    searchEbayItems,
    getEbayOrders,
    updateEbayPricingRule,
    draftProductListing,

    commitToMemory,
    recallFromMemory,
    searchArchive,
    searchChatGPTMemory,
    renameArchivedFile,
    readFile,
    writeFile,
    searchFiles,
    unzipArchive,

    executeShellCommand,
    browseWebsite,
    getWebsiteContent,

    addTaskToBoard,
    createCalendarEvent,
    sendEmail,
    getTasks,
    updateTaskStatus,
    deleteTask,

    createGithubRepo,
    deployToVercel,
    listGoogleCalendarEvents,
    createGithubBranch,
    commitFileToGithub,
    createGithubPullRequest,
    listGithubRepos,
];

/* ────────────────────────────────────────────────
   CHAT SESSION FACTORY
   ──────────────────────────────────────────────── */

export const createChatSession = async (): Promise<Chat> => {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY! });

    return ai.chats.create({
        model: "gemini-2.5-flash",
        config: {
            systemInstruction: VEE_SYSTEM_INSTRUCTION_BASE,
            tools: [{ functionDeclarations: VEE_TOOLS }],
        },
    });
};
