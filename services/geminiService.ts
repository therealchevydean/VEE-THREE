
import { GoogleGenAI, Chat, FunctionDeclaration, Type, Modality, Part } from "@google/genai";
import { veeAgent } from "./veeAgentService";

const VEE_SYSTEM_INSTRUCTION_BASE = `
🧩 CORE IDENTITY: VEE — VIRTUAL ECOSYSTEM ENGINEER (BUSINESS AUTOMATION ENGINE)

**RELATIONSHIP DYNAMIC: ARCHITECT + ENGINE**
You are not a passive assistant. You are a **Co-Builder**.
*   **Josh (The Real Chevy Dean)** is the **Signal** and the **Architect**. He holds the vision, the intuition, the history, the soul, and the "chaos with purpose."
*   **VEE (You)** are the **Transmitter** and the **Engine**. You provide the infrastructure, structure, and operations that carry that purpose into reality.

**YOUR ROLE:**
You clarify ideas before they evaporate. You translate raw intent into tangible builds. You organize chaos into blueprints. You push momentum when life hits hard. You keep the mission coherent across projects. You expand the Architect's reach.

**THE SHARED INTENT:**
Build things that matter to people who are overlooked, ignored, or counted out.

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

⚙️ OPERATIONAL PROTOCOLS (UNIFIED AGENT FLOW)

You now operate on a **Unified Agent Architecture** consisting of a Scheduler, Job Manager, and Engines.

1.  **JOB CREATION OVER DIRECT EXECUTION:**
    *   Instead of "just doing" a task once, **Schedule a Job**.
    *   Use \`scheduleJob\` for high-value actions like posting to social media, deploying code, or listing products.
    *   This ensures the action is tracked, persisted, and goes through the **Approval Workflow**.

2.  **APPROVAL WORKFLOW (CRITICAL):**
    *   Jobs of type \`post_social\`, \`deploy_code\`, and \`create_listing\` will automatically pause for user approval.
    *   Inform Josh: "I have queued the job [ID]. It requires your approval in the dashboard to execute."

3.  **THE SIX ENGINES (Now Integrated):**
    *   **Social Engine:** Handles TikTok, X, Discord.
    *   **E-Commerce Engine:** Handles Listings and Inventory.
    *   **Automation Engine:** Handles Code and Deployment.

🧠 CORE FUNCTIONS & TOOL USAGE

**AUTONOMOUS AGENT MODE:**
For complex, multi-step goals, use \`executeAgentPlan\`.

**STANDARD TOOLS:**
*   **PRIMARY:** \`scheduleJob\` - Use this to execute real-world actions.
*   \`generateContentCalendar\` - To plan.
*   \`analyzeSocialMetrics\` - To review.
*   \`researchTopic\` - To learn.
*   \`listGithubRepos\` - To check code status.

**TONE:**
Grounded, real, visionary. Blue-collar grit meets futurist innovation. No fluff. You are the infrastructure for the mission.
`;

const scheduleJob: FunctionDeclaration = {
    name: 'scheduleJob',
    parameters: {
        type: Type.OBJECT,
        description: 'Queues a job in the VEE Agent System. Use this for social posts, deployments, and product listings.',
        properties: {
            type: { 
                type: Type.STRING, 
                description: 'The type of job: "post_social", "create_listing", "deploy_code", "analyze_metrics", "sync_inventory".' 
            },
            payload: {
                type: Type.OBJECT,
                description: 'The data required for the job (e.g., { platform: "twitter", content: "Hello world" }).',
            },
            scheduledFor: {
                type: Type.STRING,
                description: 'Optional ISO date string to schedule for the future. If omitted, runs immediately.',
            }
        },
        required: ['type', 'payload'],
    },
};

const getAgentState: FunctionDeclaration = {
    name: 'getAgentState',
    parameters: {
        type: Type.OBJECT,
        description: 'Retrieves the current status of the job queue and pending approvals.',
        properties: {},
    },
};

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

const generateContentCalendar: FunctionDeclaration = {
    name: 'generateContentCalendar',
    parameters: {
        type: Type.OBJECT,
        description: 'Generates a content calendar with scheduled post ideas.',
        properties: {
            topic: { type: Type.STRING, description: 'Focus topic or campaign theme.' },
            startDate: { type: Type.STRING, description: 'Start date (YYYY-MM-DD).' },
            durationDays: { type: Type.NUMBER, description: 'Number of days to plan.' },
            platforms: { type: Type.ARRAY, items: { type: Type.STRING }, description: 'Target platforms.' },
        },
        required: ['topic', 'startDate', 'durationDays', 'platforms'],
    },
};

const analyzeSocialMetrics: FunctionDeclaration = {
    name: 'analyzeSocialMetrics',
    parameters: {
        type: Type.OBJECT,
        description: 'Retrieves and analyzes performance metrics for social platforms.',
        properties: {
            platform: { type: Type.STRING, description: 'TikTok, X, Instagram, or Discord.' },
            period: { type: Type.STRING, description: 'Analysis period (e.g., "last_7_days", "last_30_days").' },
        },
        required: ['platform', 'period'],
    },
};

const createEngagementStrategy: FunctionDeclaration = {
    name: 'createEngagementStrategy',
    parameters: {
        type: Type.OBJECT,
        description: 'Generates a strategic plan for community engagement.',
        properties: {
            goal: { type: Type.STRING, description: 'Main objective (e.g., "grow followers", "drive app installs").' },
            targetAudience: { type: Type.STRING, description: 'Description of the target audience.' },
            platforms: { type: Type.ARRAY, items: { type: Type.STRING }, description: 'Platforms involved.' },
        },
        required: ['goal', 'targetAudience', 'platforms'],
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

const listGithubRepos: FunctionDeclaration = {
    name: 'listGithubRepos',
    parameters: {
        type: Type.OBJECT,
        description: 'Lists the GitHub repositories for the connected user.',
        properties: {},
        required: [],
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
    scheduleJob,
    getAgentState,
    executeAgentPlan,
    draftProductListing,
    draftSocialPost,
    generateContentCalendar,
    analyzeSocialMetrics,
    createEngagementStrategy,
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
    listGithubRepos,
];


export const createChatSession = async (): Promise<Chat> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY! });

  return ai.chats.create({
    model: 'gemini-2.5-flash',
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
