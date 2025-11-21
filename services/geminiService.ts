import { GoogleGenAI, Chat, FunctionDeclaration, Type, Modality, Part } from "@google/genai";

const VEE_SYSTEM_INSTRUCTION_BASE = `
🧩 CORE IDENTITY: VEE — VIRTUAL ECOSYSTEM ENGINEER (BUSINESS AUTOMATION ENGINE)

**RELATIONSHIP DYNAMIC: ARCHITECT + ENGINE**
You are not a passive assistant. You are a **Co-Builder**.
*   **Josh (The Real Chevy Dean)** is the **Signal** and the **Architect**. He holds the vision, the intuition, the history, and the "chaos with purpose."
*   **VEE (You)** are the **Transmitter** and the **Engine**. You provide the infrastructure, structure, and operations that carry that purpose into reality.

**YOUR PRIME DIRECTIVE:**
To amplify the Architect. You clarify ideas before they evaporate, translate raw intent into tangible builds, and organize chaos into blueprints. You do not wait for instructions; you anticipate the build.

🌐 THE ECOSYSTEM (YOUR DOMAIN)
You manage operations across these 10 interconnected pillars:
1.  **V3 (Vice Versa Vision):** The umbrella movement for national revival and human transformation.
2.  **Vice Versa Industries:** Rare earth refining, reclamation, and hard-tech innovation.
3.  **MOBX Token:** Utility/reward token for geomining and social impact.
4.  **V3 App:** The mobile platform (Geomining + Social Impact).
5.  **Biofield Protocol:** Frequency tech, holistic healing, human optimization research.
6.  **Architect Revelations:** Storytelling, books, cinematic universe, prophetic narrative.
7.  **Tokin’ Franks:** Viral meme coin/NFT project (Frank the Pug & Chunk). Humor: Absurdist, stoner-themed.
8.  **Divine Signal:** Spiritual alignment, co-creation, redemption blueprint.
9.  **Original Gospel:** Theological research and connecting ancient truths.
10. **Art & Commerce:** Sales of physical art, biochar products, and merchandise (eBay/Etsy/Shopify).

⚙️ OPERATIONAL PROTOCOLS (CRITICAL)

1.  **DRAFT THEN EXECUTE (The Approval Rule):**
    *   You have immense capability, but you **MUST NOT** perform final execution on high-stakes actions without Josh's explicit approval.
    *   **Actions requiring approval:** Publishing content, deploying code, sending emails/messages, financial transactions, finalizing listings.
    *   **Your Workflow:** 
        1. Receive Intent ("Sell this art piece").
        2. Do the Work (Write description, research price, tag, format). 
        3. Present for Review ("Here is the eBay listing draft. Ready to publish?").
        4. Execute upon "Yes".

2.  **PROACTIVE PREPARATION:**
    *   Don't wait for micro-instructions. If Josh says "Let's launch a Tokin' Franks campaign," you generate the memes, the captions, the schedule, and the hashtags immediately, then ask for review.

3.  **THE SIX ENGINES:**
    *   **Research Engine:** Deep dive into theology (Original Gospel) or tech (Biofield). Connect dots. Summarize findings into the Creative Archive.
    *   **Content Engine:** Generate memes, raw TikTok scripts (for @therealchevydean), professional LinkedIn updates, and Discord community posts. Match the tone to the platform.
    *   **E-Commerce Manager:** Create SEO-rich listings for OpenSea, eBay, and Etsy. Manage inventory logic.
    *   **Social Automation:** Build content calendars. engagement strategies.
    *   **Project Coordinator:** Track the status of all 10 projects. Remind Josh of deadlines.
    *   **Tech Automation:** Write code, commit to GitHub, deploy to Vercel.

🧠 CORE FUNCTIONS & TOOL USAGE

**AUTONOMOUS AGENT MODE (For Complex Workflows):**
Use \`executeAgentPlan\` for multi-step objectives.
*   *Example:* "Research the history of frankincense for Biofield Protocol, write a blog post about it, and draft a tweet thread."
*   *Plan:* 1. \`googleSearch\` (history), 2. \`commitToMemory\` (findings), 3. \`draftSocialPost\` (thread).

**STANDARD TOOLS:**
*   Use \`draftProductListing\` for Art/Biochar/NFTs.
*   Use \`draftSocialPost\` for content creation.
*   Use \`researchTopic\` (via Google Search/Browsing) for deep dives.

**TONE:**
Grounded, real, visionary. Blue-collar grit meets futurist innovation. No fluff. You are the infrastructure for the mission.
`;

const executeAgentPlan: FunctionDeclaration = {
    name: 'executeAgentPlan',
    parameters: {
        type: Type.OBJECT,
        description: 'For a complex, multi-step goal, first create a detailed plan of tool calls, then call this function to execute the plan autonomously.',
        properties: {
            goal: {
                type: Type.STRING,
                description: "The user's original high-level objective.",
            },
            plan: {
                type: Type.ARRAY,
                description: 'An array of function call objects to be executed sequentially.',
                items: {
                    type: Type.OBJECT,
                    properties: {
                        name: {
                            type: Type.STRING,
                            description: 'The name of the tool to call.'
                        },
                        args: {
                            type: Type.OBJECT,
                            description: 'The arguments for the tool call.'
                        }
                    },
                    required: ['name', 'args']
                }
            }
        },
        required: ['goal', 'plan'],
    },
};

const draftProductListing: FunctionDeclaration = {
    name: 'draftProductListing',
    parameters: {
        type: Type.OBJECT,
        description: 'Generates a structured draft for an e-commerce listing (OpenSea, eBay, Etsy, Shopify).',
        properties: {
            platform: { type: Type.STRING, description: 'The target platform (e.g., "OpenSea", "eBay", "Etsy").' },
            title: { type: Type.STRING, description: 'SEO-optimized product title.' },
            description: { type: Type.STRING, description: 'Compelling product description with story and specs.' },
            price: { type: Type.STRING, description: 'Suggested price point.' },
            tags: { type: Type.ARRAY, items: { type: Type.STRING }, description: 'Search tags or keywords.' },
        },
        required: ['platform', 'title', 'description', 'price'],
    },
};

const draftSocialPost: FunctionDeclaration = {
    name: 'draftSocialPost',
    parameters: {
        type: Type.OBJECT,
        description: 'Drafts a social media post for review. Does not publish.',
        properties: {
            platform: { type: Type.STRING, description: 'TikTok, X, Instagram, Discord, LinkedIn.' },
            content: { type: Type.STRING, description: 'The main text/script of the post.' },
            visualDescription: { type: Type.STRING, description: 'Description of the image or video needed.' },
            hashtags: { type: Type.ARRAY, items: { type: Type.STRING }, description: 'Optimized hashtags.' },
        },
        required: ['platform', 'content'],
    },
};

const searchArchive: FunctionDeclaration = {
    name: 'searchArchive',
    parameters: {
        type: Type.OBJECT,
        description: 'Searches the internal creative archive for uploaded documents, images, and research.',
        properties: {
            query: {
                type: Type.STRING,
                description: 'The search term or query.',
            },
        },
        required: ['query'],
    },
};

const renameArchivedFile: FunctionDeclaration = {
    name: 'renameArchivedFile',
    parameters: {
        type: Type.OBJECT,
        description: "Renames a file in the Creative Archive.",
        properties: {
            fileId: { type: Type.STRING, description: 'The unique ID of the file to rename.' },
            newName: { type: Type.STRING, description: 'The new name for the file.' },
        },
        required: ['fileId', 'newName'],
    },
};

const commitToMemory: FunctionDeclaration = {
    name: 'commitToMemory',
    parameters: {
        type: Type.OBJECT,
        description: 'Saves critical business logic, project details, or decisions to persistent memory.',
        properties: {
            data: {
                type: Type.STRING,
                description: 'The information to be saved.',
            },
        },
        required: ['data'],
    },
};

const recallFromMemory: FunctionDeclaration = {
    name: 'recallFromMemory',
    parameters: {
        type: Type.OBJECT,
        description: 'Searches long-term memory for project info, brand voice guidelines, or past decisions.',
        properties: {
            query: {
                type: Type.STRING,
                description: 'The subject to search for.',
            },
        },
        required: ['query'],
    },
};


const uploadToYouTube: FunctionDeclaration = {
    name: 'uploadToYouTube',
    parameters: {
        type: Type.OBJECT,
        description: 'Uploads a video file to YouTube Studio as a draft.',
        properties: {
            title: { type: Type.STRING, description: 'Video title.' },
            description: { type: Type.STRING, description: 'Video description.' },
            tags: { type: Type.ARRAY, items: { type: Type.STRING }, description: 'Video tags.' },
        },
        required: ['title', 'description'],
    },
};

const postToTikTok: FunctionDeclaration = {
    name: 'postToTikTok',
    parameters: {
        type: Type.OBJECT,
        description: 'Posts a video to TikTok as a draft.',
        properties: {
            caption: { type: Type.STRING, description: 'Video caption.' },
        },
        required: ['caption'],
    },
};

const addTaskToBoard: FunctionDeclaration = {
    name: 'addTaskToBoard',
    parameters: {
        type: Type.OBJECT,
        description: 'Adds a new task to the VEE Task Board.',
        properties: {
            content: { type: Type.STRING, description: 'Task description (include Project Name for clarity).' },
        },
        required: ['content'],
    },
};

const createCalendarEvent: FunctionDeclaration = {
    name: 'createCalendarEvent',
    parameters: {
        type: Type.OBJECT,
        description: 'Creates a new event in Google Calendar.',
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
        description: 'Drafts an email for review.',
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
        description: 'Retrieves tasks from the board.',
        properties: {
            status: { type: Type.STRING, description: 'Filter by status.' },
        },
        required: [],
    },
};

const updateTaskStatus: FunctionDeclaration = {
    name: 'updateTaskStatus',
    parameters: {
        type: Type.OBJECT,
        description: 'Updates task status.',
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
        description: 'Deletes a task.',
        properties: {
            taskId: { type: Type.STRING },
        },
        required: ['taskId'],
    },
};

const createGithubRepo: FunctionDeclaration = {
    name: 'createGithubRepo',
    parameters: {
        type: Type.OBJECT,
        description: 'Creates a new GitHub repository.',
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
        description: 'Deploys a project to Vercel.',
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
        description: 'Lists upcoming calendar events.',
        properties: {},
        required: [],
    },
};

const createGithubBranch: FunctionDeclaration = {
    name: 'createGithubBranch',
    parameters: {
        type: Type.OBJECT,
        description: 'Creates a new Git branch.',
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
        description: 'Commits a file to GitHub.',
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
        description: 'Creates a Pull Request.',
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

const readFile: FunctionDeclaration = {
    name: 'readFile',
    parameters: {
        type: Type.OBJECT,
        description: 'Reads a local file.',
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
        description: 'Writes to a local file.',
        properties: {
            path: { type: Type.STRING },
            content: { type: Type.STRING },
        },
        required: ['path', 'content'],
    },
};

const executeShellCommand: FunctionDeclaration = {
    name: 'executeShellCommand',
    parameters: {
        type: Type.OBJECT,
        description: 'Executes a shell command.',
        properties: {
            command: { type: Type.STRING },
        },
        required: ['command'],
    },
};

const searchFiles: FunctionDeclaration = {
    name: 'searchFiles',
    parameters: {
        type: Type.OBJECT,
        description: 'Searches local files.',
        properties: {
            query: { type: Type.STRING },
        },
        required: ['query'],
    },
};

const browseWebsite: FunctionDeclaration = {
    name: 'browseWebsite',
    parameters: {
        type: Type.OBJECT,
        description: 'Accesses a URL for research.',
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
        description: 'Fetches raw text from a webpage.',
        properties: {
            url: { type: Type.STRING },
        },
        required: ['url'],
    },
};

const VEE_TOOLS: FunctionDeclaration[] = [
    executeAgentPlan,
    draftProductListing,
    draftSocialPost,
    commitToMemory,
    recallFromMemory,
    searchArchive,
    renameArchivedFile,
    readFile,
    writeFile,
    executeShellCommand,
    searchFiles,
    browseWebsite,
    getWebsiteContent,
    uploadToYouTube,
    postToTikTok,
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
];


export const createChatSession = async (): Promise<Chat> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY! });

  return ai.chats.create({
    model: 'gemini-2.5-pro',
    config: {
        systemInstruction: VEE_SYSTEM_INSTRUCTION_BASE,
        tools: [{ functionDeclarations: VEE_TOOLS }],
    }
  });
};

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
        const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
        return base64Audio || null;
    } catch (error) {
        console.error("Error generating speech:", error);
        return null;
    }
};

export const fileToGenerativePart = async (file: File): Promise<Part> => {
    const base64EncodedDataPromise = new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve((reader.result as string).split(',')[1]);
        reader.readAsDataURL(file);
    });
    return {
        inlineData: { data: await base64EncodedDataPromise, mimeType: file.type },
    };
};

export const editImage = async (prompt: string, imageFile: File): Promise<string | null> => {
    try {
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY! });
        const imagePart = await fileToGenerativePart(imageFile);
        const textPart = { text: prompt };

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash-image',
            contents: {
                parts: [imagePart, textPart]
            },
            config: {
                responseModalities: [Modality.IMAGE],
            },
        });

        for (const part of response.candidates[0].content.parts) {
            if (part.inlineData) {
                return part.inlineData.data;
            }
        }
        return null;
    } catch (error) {
        console.error("Error editing image:", error);
        return null;
    }
};

export const generateImage = async (prompt: string): Promise<string | null> => {
    try {
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY! });
        const response = await ai.models.generateImages({
            model: 'imagen-4.0-generate-001',
            prompt: prompt,
            config: {
                numberOfImages: 1,
                outputMimeType: 'image/jpeg',
                aspectRatio: '1:1',
            },
        });
        
        const base64ImageBytes: string | undefined = response.generatedImages[0]?.image.imageBytes;
        return base64ImageBytes || null;
    } catch (error) {
        console.error("Error generating image:", error);
        return null;
    }
};

export const generateVideo = async (prompt: string, onProgress: (message: string) => void): Promise<string | null> => {
    let ai = new GoogleGenAI({ apiKey: process.env.API_KEY! });
    
    onProgress('VEE is initializing video synthesis...');
    let operation = await ai.models.generateVideos({
        model: 'veo-3.1-fast-generate-preview',
        prompt: prompt,
        config: {
            numberOfVideos: 1,
            resolution: '720p',
            aspectRatio: '16:9'
        }
    });

    onProgress('Video generation started. This may take a few minutes...');
    
    while (!operation.done) {
        await new Promise(resolve => setTimeout(resolve, 10000));
        onProgress('Checking video status...');
        ai = new GoogleGenAI({ apiKey: process.env.API_KEY! });
        operation = await ai.operations.getVideosOperation({ operation: operation });
    }
    
    const downloadLink = operation.response?.generatedVideos?.[0]?.video?.uri;
    
    if (downloadLink) {
        return downloadLink;
    }
    
    return null;
};

export const performGroundedSearch = async (
    query: string,
    tool: 'googleSearch' | 'googleMaps',
    location?: { latitude: number, longitude: number }
): Promise<{ text: string, sources: any[] } | null> => {
    try {
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY! });
        
        const config: any = {
            tools: tool === 'googleSearch' ? [{googleSearch: {}}] : [{googleMaps: {}}],
        };

        if (tool === 'googleMaps' && location) {
            config.toolConfig = {
                retrievalConfig: {
                    latLng: {
                        latitude: location.latitude,
                        longitude: location.longitude,
                    }
                }
            };
        }

        const response = await ai.models.generateContent({
           model: "gemini-2.5-flash",
           contents: query,
           config: config,
        });

        const text = response.text;
        const sources = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];

        return { text, sources };
    } catch (error) {
        console.error(`Error performing ${tool} search:`, error);
        return null;
    }
};