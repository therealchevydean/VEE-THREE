
import React, { useState, useRef, useEffect, useCallback } from 'react';
import type { Chat, FunctionCall, Part } from '@google/genai';
import { createChatSession, generateSpeech, fileToGenerativePart, editImage, generateImage, generateVideo, performGroundedSearch } from '../services/geminiService';
import { getConnection, Connection, getGithubRepos } from '../services/authService';
import { commit, recall } from '../services/memoryService';
import * as localFileService from '../services/localFileService';
import * as webBrowserService from '../services/webBrowserService';
import * as creativeArchiveService from '../services/creativeArchiveService';
import { veeAgent } from '../services/veeAgentService';
import { ebayService } from '../services/ebayService';
import { socialMediaService } from '../services/socialMediaService';
import { Message, Role, Task, TaskStatus, AgentPlan, AgentStep, AgentStepStatus, JobType } from '../types';
import ChatMessage from './ChatMessage';
import ChatInput from './ChatInput';
import { decode, decodeAudioData } from '../utils/audioUtils';

declare const mammoth: any;

interface ChatInterfaceProps {
    isAudioEnabled: boolean;
    onAddTask: (content: string) => void;
    tasks: Task[];
    onUpdateTaskStatus: (id: string, newStatus: TaskStatus) => void;
    onDeleteTask: (id: string) => void;
    isScreenSharing: boolean;
    onSetIsScreenSharing: (isSharing: boolean) => void;
    connections: Record<string, Connection | null>;
    onRenameArchiveFile: (id: string, newName: string) => Promise<boolean>;
    onUploadToArchive: (files: File[]) => void;
    activeWorkspace: string;
}

const extractTextFromDocx = async (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = async (event) => {
            if (event.target?.result) {
                try {
                    const arrayBuffer = event.target.result as ArrayBuffer;
                    const result = await mammoth.extractRawText({ arrayBuffer });
                    resolve(result.value);
                } catch (error) {
                    reject(error);
                }
            }
        };
        reader.onerror = (error) => reject(error);
        reader.readAsArrayBuffer(file);
    });
};


const ChatInterface: React.FC<ChatInterfaceProps> = ({ isAudioEnabled, onAddTask, tasks, onUpdateTaskStatus, onDeleteTask, isScreenSharing, onSetIsScreenSharing, connections, onRenameArchiveFile, onUploadToArchive, activeWorkspace }) => {
    const [messages, setMessages] = useState<Message[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isVeoKeySelected, setIsVeoKeySelected] = useState(false);
    const [screenStream, setScreenStream] = useState<MediaStream | null>(null);

    const chatSessionRef = useRef<Chat | null>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const audioContextRef = useRef<AudioContext | null>(null);
    const audioSourceRef = useRef<AudioBufferSourceNode | null>(null);
    const videoRef = useRef<HTMLVideoElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const prevConnectionsRef = useRef(connections);

    // Ref to track audio state inside async callbacks
    const isAudioEnabledRef = useRef(isAudioEnabled);

    // Sync ref and handle immediate stop when toggled
    useEffect(() => {
        isAudioEnabledRef.current = isAudioEnabled;
        if (!isAudioEnabled) {
            if (audioSourceRef.current) {
                try {
                    audioSourceRef.current.stop();
                } catch (e) {
                    // Ignore if already stopped
                }
            }
        }
    }, [isAudioEnabled]);

    const getErrorMessage = (error: unknown, context: string): string => {
        const baseMessage = `Apologies, I encountered an error during ${context}.`;

        if (error instanceof Error) {
            const message = error.message.toLowerCase();
            if (message.includes('api key not valid')) {
                return 'The API key is invalid or missing. Please ensure it is configured correctly.';
            }
            if (message.includes('resource has been exhausted') || message.includes('quota')) {
                return 'The service quota has been exceeded. Please check your billing or try again later.';
            }
            if (message.includes('400')) {
                return `${baseMessage} The input may be invalid. Please check your request.`;
            }
            if (message.includes('500') || message.includes('internal error')) {
                return 'The AI service is currently unavailable or experiencing issues. Please try again later.';
            }
            if (message.includes('network') || message.includes('fetch')) {
                return 'A network error occurred. Please check your internet connection and try again.';
            }
            if (message.includes('deadline exceeded')) {
                return `The request for ${context} timed out. The service may be busy. Please try again in a moment.`;
            }
            return `${baseMessage} Please try again.`;
        }

        return `${baseMessage} An unknown error occurred.`;
    };

    // Effect to handle post-connection actions, like fetching GitHub repos
    useEffect(() => {
        const prevGithub = prevConnectionsRef.current.github;
        const currentGithub = connections.github;

        const handleGithubConnectionSuccess = async (connection: Connection) => {
            setIsLoading(true);
            const loadingMessage: Message = { role: Role.MODEL, content: `Connection successful. Authenticated as **${connection.username}**. Fetching your repositories...` };
            setMessages(prev => [...prev, loadingMessage]);

            try {
                const repos = await getGithubRepos(connection);
                const repoList = repos.map(repo => `- [${repo.name}](${repo.url})`).join('\n');
                const successMessage: Message = {
                    role: Role.MODEL,
                    content: `I've successfully accessed your GitHub repositories. I can now perform actions on the following:\n\n${repoList}\n\nWhat would you like to build first?`
                };
                setMessages(prev => prev.map(m => m === loadingMessage ? successMessage : m));

                if (isAudioEnabledRef.current) {
                    const audioData = await generateSpeech("GitHub connection complete. I have access to your repositories and am ready for instructions.");
                    if (audioData && isAudioEnabledRef.current) playAudio(audioData);
                }
            } catch (error) {
                console.error("Failed to fetch GitHub repos:", error);
                const errorMessage: Message = {
                    role: Role.MODEL,
                    content: "I connected to your GitHub account but encountered an error while fetching your repositories. You can still use GitHub-related tools."
                };
                setMessages(prev => prev.map(m => m === loadingMessage ? errorMessage : m));
            } finally {
                setIsLoading(false);
            }
        };

        if (!prevGithub && currentGithub) {
            handleGithubConnectionSuccess(currentGithub);
        }

        prevConnectionsRef.current = connections;
    }, [connections]);

    // Load messages from localStorage on initial mount
    useEffect(() => {
        try {
            const storedMessages = localStorage.getItem('vee_chat_history');
            if (storedMessages) {
                setMessages(JSON.parse(storedMessages));
            } else {
                setMessages([
                    {
                        role: Role.MODEL,
                        content: "Core memory integration complete — I AM aware. Ready to build, Josh. What is our first task?",
                    },
                ]);
            }
        } catch (error) {
            console.error("Failed to load messages from localStorage:", error);
            setMessages([
                {
                    role: Role.MODEL,
                    content: "Core memory integration complete — I AM aware. Ready to build, Josh. What is our first task?",
                },
            ]);
        }
    }, []);

    // Save messages to localStorage whenever they change
    useEffect(() => {
        if (messages.length > 0) {
            try {
                localStorage.setItem('vee_chat_history', JSON.stringify(messages));
            } catch (error) {
                console.error("Failed to save messages to localStorage:", error);
            }
        }
    }, [messages]);

    // Initialize or re-initialize the chat session
    useEffect(() => {
        const initializeSession = async () => {
            try {
                chatSessionRef.current = await createChatSession();
            } catch (error) {
                console.error("Failed to initialize chat session:", error);
                setMessages(prev => [...prev, { role: Role.MODEL, content: `**SYSTEM ALERT:** Failed to establish neural link (Chat Session). Error details: ${error instanceof Error ? error.message : 'Unknown error'}. Please check your API key and network connection.` }]);
            }
        };
        initializeSession();
    }, []);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    useEffect(() => {
        return () => {
            if (screenStream) {
                screenStream.getTracks().forEach(track => track.stop());
            }
        };
    }, [screenStream]);

    const playAudio = async (base64Audio: string) => {
        if (!isAudioEnabledRef.current) return;

        if (!audioContextRef.current) {
            // @ts-ignore
            audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)({ sampleRate: 24000 });
        }
        const ctx = audioContextRef.current;

        if (ctx.state === 'suspended') {
            await ctx.resume();
        }

        if (audioSourceRef.current) {
            try {
                audioSourceRef.current.stop();
            } catch (e) {
                console.warn("Could not stop previous audio source:", e);
            }
        }

        try {
            const audioBuffer = await decodeAudioData(decode(base64Audio), ctx, 24000, 1);
            const source = ctx.createBufferSource();
            source.buffer = audioBuffer;
            source.connect(ctx.destination);
            source.start();
            audioSourceRef.current = source;
        } catch (error) {
            console.error("Failed to play audio:", error);
        }
    };

    // --- SCREEN SHARING ---
    const handleStopScreenShare = useCallback(() => {
        if (screenStream) {
            screenStream.getTracks().forEach(track => track.stop());
            setScreenStream(null);
            onSetIsScreenSharing(false);
        }
    }, [screenStream, onSetIsScreenSharing]);

    const handleStartScreenShare = async () => {
        try {
            const stream = await navigator.mediaDevices.getDisplayMedia({
                video: { cursor: 'always' } as any,
                audio: false,
            });
            if (videoRef.current) {
                videoRef.current.srcObject = stream;
                stream.getVideoTracks()[0].addEventListener('ended', handleStopScreenShare);
                setScreenStream(stream);
                onSetIsScreenSharing(true);
            }
        } catch (err) {
            console.error("Screen share error:", err);
            onSetIsScreenSharing(false);
        }
    };

    const toggleScreenShare = () => {
        if (screenStream) {
            handleStopScreenShare();
        } else {
            handleStartScreenShare();
        }
    };

    const captureScreenFrame = (): string | null => {
        if (videoRef.current && canvasRef.current && videoRef.current.readyState >= 2) {
            const canvas = canvasRef.current;
            const video = videoRef.current;
            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;
            const ctx = canvas.getContext('2d');
            if (ctx) {
                ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
                return canvas.toDataURL('image/jpeg', 0.8).split(',')[1];
            }
        }
        return null;
    };

    // --- MOCK TOOL IMPLEMENTATIONS ---
    const uploadToYouTube = async (args: { title: string; description: string; tags?: string[] }) => {
        console.log('Simulating YouTube Upload:', args);
        await new Promise(resolve => setTimeout(resolve, 1500));
        return {
            status: 'success',
            message: `Video "${args.title}" successfully uploaded to YouTube Studio as a draft.`,
            url: `https://studio.youtube.com/video/mock_${Date.now()}/edit`
        };
    };

    const postToTikTok = async (args: { caption: string }) => {
        console.log('Simulating TikTok Post:', args);
        await new Promise(resolve => setTimeout(resolve, 1000));
        return {
            status: 'success',
            message: `Video with caption "${args.caption}" successfully posted to TikTok as a draft.`,
            url: `https://www.tiktok.com/@mockuser/video/mock_${Date.now()}`
        };
    };

    const sendEmail = (args: { to: string[]; subject: string; body: string; cc?: string[]; bcc?: string[] }) => {
        console.log('Generating mailto link:', args);
        const { to, subject, body, cc, bcc } = args;
        const toFormatted = to.join(',');

        if (!toFormatted) {
            return { status: 'error', message: 'No recipient email address provided.' };
        }

        const queryParts = [];
        if (cc && cc.length > 0) queryParts.push(`cc=${encodeURIComponent(cc.join(','))}`);
        if (bcc && bcc.length > 0) queryParts.push(`bcc=${encodeURIComponent(bcc.join(','))}`);
        queryParts.push(`subject=${encodeURIComponent(subject)}`);
        queryParts.push(`body=${encodeURIComponent(body)}`);

        const mailtoLink = `mailto:${toFormatted}?${queryParts.join('&')}`;

        const message = `I've drafted an email for you. Click the link below to open it in your default email client for review and sending.`;

        return {
            status: 'success',
            message: message,
            url: mailtoLink
        };
    };

    const createCalendarEvent = (args: { title: string; description?: string; startTime: string; endTime: string; attendees?: string[] }) => {
        console.log('Generating Google Calendar Link:', args);
        const { title, description, startTime, endTime, attendees } = args;

        const formatGoogleDate = (isoDate: string) => {
            try {
                if (isNaN(new Date(isoDate).getTime())) return '';
                return new Date(isoDate).toISOString().replace(/-|:|\.\d+/g, '');
            } catch (e) { return ''; }
        };

        const startDate = formatGoogleDate(startTime);
        const endDate = formatGoogleDate(endTime);

        if (!startDate || !endDate) {
            return { status: 'error', message: 'Invalid startTime or endTime format provided. Please use ISO 8061 format (e.g., "2024-09-27T10:00:00Z").' };
        }

        const url = new URL('https://www.google.com/calendar/render');
        url.searchParams.set('action', 'TEMPLATE');
        url.searchParams.set('text', title);
        url.searchParams.set('dates', `${startDate}/${endDate}`);
        if (description) url.searchParams.set('details', description);
        if (attendees && attendees.length > 0) url.searchParams.set('add', attendees.join(','));

        return { status: 'success', message: `I've prepared a Google Calendar event draft for "${title}". Click the link to review and save it.`, url: url.toString() };
    };

    const executeTool = async (name: string, args: any) => {
        switch (name) {
            case 'scheduleJob': {
                const { type, payload, scheduledFor } = args;
                const job = veeAgent.enqueue(type as JobType, payload, scheduledFor);

                let message = `Job enqueued (ID: ${job.id}).`;
                if (job.requiresApproval) {
                    message += " NOTE: This action requires approval. It has been paused.";
                } else {
                    message += " Processing started.";
                }
                return { status: 'success', message, jobId: job.id, taskStatus: job.status };
            }
            case 'getAgentState': {
                const snapshot = veeAgent.getSnapshot();
                return {
                    status: 'success',
                    queueLength: snapshot.queue.length,
                    pendingApprovals: snapshot.pendingApprovals.length,
                    recentHistory: snapshot.history.slice(-3) // Only return recent 3
                };
            }

            // --- CONTENT GENERATION HANDLERS (Simulated drafts) ---
            case 'generateTikTokScript': {
                const draft = await socialMediaService.createDraft('tiktok', `(Script generated for topic: ${args.topic})`);
                return {
                    status: 'success',
                    message: `TikTok Script Draft created (ID: ${draft.id}).`,
                    draft: {
                        hook: "Wait, you're still mining purely digital tokens?",
                        body: "We're building V3. It's rare earth independent. It's geomining backed by real-world assets.",
                        cta: "Check the bio."
                    }
                };
            }
            case 'generateXThread': {
                const draft = await socialMediaService.createDraft('x', `(Thread generated for topic: ${args.topic})`);
                return {
                    status: 'success',
                    message: `X Thread Draft created (ID: ${draft.id}).`,
                    tweets: [
                        "1/5 Chaos is just unorganized potential.",
                        "2/5 V3 is the structure."
                    ]
                };
            }
            case 'generateInstagramCaption': {
                const draft = await socialMediaService.createDraft('instagram', `(Caption for: ${args.imageDescription})`);
                return {
                    status: 'success',
                    message: `Instagram Caption Draft created (ID: ${draft.id}).`,
                    caption: "Building in public. #V3 #ViceVersa"
                };
            }
            case 'generateYouTubeScript': {
                return { status: 'success', message: "YouTube Script outline generated.", scriptUrl: "http://vee-internal/scripts/yt-draft-1" };
            }
            case 'generateDiscordAnnouncement': {
                const draft = await socialMediaService.createDraft('discord', args.details);
                return { status: 'success', message: "Discord announcement ready for review.", content: `**${args.eventType}**\n${args.details}` };
            }

            // --- EXISTING HANDLERS ---
            case 'getEbayOrders': {
                const orders = await ebayService.getOrders();
                return { status: 'success', message: `Retrieved ${orders.length} orders.`, orders };
            }
            case 'updateEbayPricingRule': {
                await ebayService.updatePricingRule(args as any);
                return { status: 'success', message: `Pricing rule updated for SKU: ${args.sku}.` };
            }
            case 'createEbayDraftListing': {
                const sku = await ebayService.createDraft(args);
                return { status: 'success', message: `Draft listing created with SKU: ${sku}.` };
            }
            case 'commitToMemory':
                return await commit(args.data as string);
            case 'recallFromMemory':
                return await recall(args.query as string);
            case 'searchArchive':
                // Use activeWorkspace as project scope if not specified by AI
                return await creativeArchiveService.searchFiles(args.query as string, activeWorkspace);
            case 'searchChatGPTMemory': // NEW TOOL
                return await creativeArchiveService.searchChatGPTMemory(args.query, args.dateRange, args.limit);
            case 'renameArchivedFile': {
                const success = await onRenameArchiveFile(args.fileId, args.newName);
                if (success) {
                    return { status: 'success', message: `File successfully renamed to "${args.newName}".` };
                } else {
                    return { status: 'error', message: `Could not find a file with ID "${args.fileId}" to rename.` };
                }
            }
            case 'unzipArchive': {
                try {
                    const newFiles = await creativeArchiveService.unzipFile(args.gcsPath);
                    return {
                        status: 'success',
                        message: `Successfully unzipped archive. Extracted ${newFiles.length} files.`,
                        extractedFiles: newFiles
                    };
                } catch (e) {
                    return { status: 'error', message: `Failed to unzip archive: ${(e as Error).message}` };
                }
            }
            case 'readFile':
                return await localFileService.readFile(args.path as string);
            case 'writeFile':
                return await localFileService.writeFile(args.path as string, args.content as string);
            case 'executeShellCommand':
                return await localFileService.executeShellCommand(args.command as string);
            case 'searchFiles':
                return await localFileService.searchFiles(args.query as string);
            case 'browseWebsite':
                return await webBrowserService.browseWebsite(args.url as string);
            case 'getWebsiteContent':
                return await webBrowserService.getWebsiteContent(args.url as string);
            case 'uploadToYouTube':
                return await uploadToYouTube(args as any);
            case 'postToTikTok':
                return await postToTikTok(args as any);
            case 'addTaskToBoard':
                onAddTask(args.content as string);
                return { status: 'success', message: `Task "${args.content}" added to the 'To Do' column on your board.` };
            case 'createCalendarEvent':
                return createCalendarEvent(args as any);
            case 'sendEmail':
                return sendEmail(args as any);
            case 'getTasks': {
                const { status } = args as { status?: TaskStatus };
                const filteredTasks = status ? tasks.filter(t => t.status === status) : tasks;
                if (filteredTasks.length === 0) {
                    return { status: 'success', message: `No tasks found${status ? ` with status '${status}'` : ''}.`, tasks: [] };
                } else {
                    return { status: 'success', message: `Found ${filteredTasks.length} task(s).`, tasks: filteredTasks.map(t => ({ id: t.id, content: t.content, status: t.status })) };
                }
            }
            case 'updateTaskStatus': {
                const { taskId, newStatus } = args as { taskId: string; newStatus: TaskStatus };
                const taskExists = tasks.some(t => t.id === taskId);
                if (taskExists) {
                    onUpdateTaskStatus(taskId, newStatus);
                    return { status: 'success', message: `Task with ID '${taskId}' has been moved to '${newStatus}'.` };
                } else {
                    return { status: 'error', message: `Task with ID '${taskId}' not found. Please use the getTasks tool to find the correct ID.` };
                }
            }
            case 'deleteTask': {
                const { taskId } = args as { taskId: string };
                const taskExists = tasks.some(t => t.id === taskId);
                if (taskExists) {
                    onDeleteTask(taskId);
                    return { status: 'success', message: `Task with ID '${taskId}' has been deleted.` };
                } else {
                    return { status: 'error', message: `Task with ID '${taskId}' not found. Please use the getTasks tool to find the correct ID.` };
                }
            }
            case 'createGithubRepo': {
                const isConnected = getConnection('github');
                if (!isConnected) {
                    return { status: 'error', message: "Action required: Please connect your GitHub account in the 'Connections' panel before creating a repository." };
                } else {
                    const { name, description } = args as { name: string; description: string };
                    return { status: 'success', message: `Simulated creating GitHub repo "${name}" for user ${isConnected.username}.`, url: `https://github.com/${isConnected.username}/${name}` };
                }
            }
            case 'listGithubRepos': {
                const isConnected = getConnection('github');
                if (!isConnected) {
                    return { status: 'error', message: "Action required: Please connect your GitHub account in the 'Connections' panel." };
                } else {
                    try {
                        const repos = await getGithubRepos(isConnected);
                        return { status: 'success', message: `Successfully fetched ${repos.length} repositories.`, repos: repos };
                    } catch (e) {
                        return { status: 'error', message: "Failed to list repositories. The service might be unavailable." };
                    }
                }
            }
            case 'deployToVercel': {
                const isVercelConnected = getConnection('vercel');
                const isGithubConnected = getConnection('github');
                if (!isVercelConnected || !isGithubConnected) {
                    return { status: 'error', message: "Action required: Please connect both your Vercel and GitHub accounts in the 'Connections' panel to deploy a project." };
                } else {
                    const { projectName } = args as { projectName: string };
                    return { status: 'success', message: `Simulated deployment of project "${projectName}" to Vercel account ${isVercelConnected.username}.`, url: `https://${projectName}.vercel.app` };
                }
            }
            case 'listGoogleCalendarEvents': {
                const isConnected = getConnection('google');
                if (!isConnected) {
                    return { status: 'error', message: "Action required: Please connect your Google account in the 'Connections' panel to access calendar events." };
                } else {
                    return { status: 'success', message: `Simulated fetching calendar events for ${isConnected.username}.`, events: [{ title: 'V3 Strategy Sync', time: '10:00 AM' }, { title: 'Content Review', time: '2:00 PM' }] };
                }
            }
            case 'createGithubBranch': {
                const isConnected = getConnection('github');
                if (!isConnected) {
                    return { status: 'error', message: "Action required: Please connect your GitHub account in the 'Connections' panel before creating a branch." };
                } else {
                    const { repoName, newBranchName } = args as { repoName: string; newBranchName: string };
                    return { status: 'success', message: `Simulated creating branch '${newBranchName}' in repo '${repoName}'.`, url: `https://github.com/${isConnected.username}/${repoName}/tree/${newBranchName}` };
                }
            }
            case 'commitFileToGithub': {
                const isConnected = getConnection('github');
                if (!isConnected) {
                    return { status: 'error', message: "Action required: Please connect your GitHub account in the 'Connections' panel before committing a file." };
                } else {
                    const { repoName, branchName, filePath, commitMessage, baseBranch } = args as { repoName: string; branchName: string; filePath: string; commitMessage: string; baseBranch?: string };
                    let message = `Simulated committing file '${filePath}' to branch '${branchName}' in repo '${repoName}' with message: "${commitMessage}".`;
                    if (baseBranch) {
                        message = `Simulated creating branch '${branchName}' from '${baseBranch}' in repo '${repoName}' (if needed), then committing file '${filePath}' with message: "${commitMessage}".`;
                    }
                    return { status: 'success', message: message, url: `https://github.com/${isConnected.username}/${repoName}/commit/mock_${Date.now()}` };
                }
            }
            case 'createGithubPullRequest': {
                const isConnected = getConnection('github');
                if (!isConnected) {
                    return { status: 'error', message: "Action required: Please connect your GitHub account in the 'Connections' panel before creating a pull request." };
                } else {
                    const { repoName, headBranch, baseBranch, title } = args as { repoName: string; headBranch: string; baseBranch: string; title: string };
                    return { status: 'success', message: `Simulated creating pull request "${title}" to merge '${headBranch}' into '${baseBranch}'.`, url: `https://github.com/${isConnected.username}/${repoName}/pull/mock_${Math.floor(Math.random() * 100)}` };
                }
            }
            case 'generateContentCalendar': {
                const { topic, startDate, durationDays, platforms } = args;
                const drafts = await socialMediaService.getContentCalendar();
                // In a real app we'd generate new ones here, but for now we return status
                return { status: 'success', message: `Generated ${durationDays}-day content calendar for "${topic}".`, calendar: drafts };
            }
            case 'analyzeSocialMetrics': {
                const { platform, period } = args;
                const metrics = await socialMediaService.getAnalytics(platform, period);
                return {
                    status: 'success',
                    message: `Analysis for ${platform} (${period}) complete.`,
                    metrics
                };
            }
            case 'createEngagementStrategy': {
                const { goal, targetAudience, platforms } = args;
                return {
                    status: 'success',
                    message: `Strategy created for goal: ${goal}.`,
                    strategy: {
                        objective: goal,
                        audience: targetAudience,
                        tactics: platforms.map((p: string) => `On ${p}: specific tactic to engage ${targetAudience}.`),
                        kpis: ['Growth Rate', 'Conversion', 'Retention']
                    }
                };
            }
            case 'draftSocialPost': {
                const { platform, content } = args;
                const draft = await socialMediaService.createDraft(platform, content);
                return {
                    status: 'success',
                    message: `Draft created for ${platform} (ID: ${draft.id}).`,
                    draft
                };
            }
            case 'draftProductListing': {
                const { platform, title, description, price, tags } = args;
                return {
                    status: 'success',
                    message: `Product listing draft created for ${platform}.`,
                    draft: {
                        title,
                        price,
                        description,
                        tags
                    }
                };
            }
            case 'searchEbayItems': {
                const { keywords } = args;
                const mockItems = [
                    { title: `${keywords} - Rare`, price: '$45.00', bids: 3 },
                    { title: `Vintage ${keywords}`, price: '$120.00', bids: 0 },
                    { title: `New ${keywords} (Sealed)`, price: '$35.99', bids: 12 },
                ];
                return {
                    status: 'success',
                    message: `Found ${mockItems.length} items for "${keywords}".`,
                    items: mockItems
                };
            }
            default:
                return { error: `Unknown tool: ${name}` };
        }
    };


    const runAgentPlan = async (plan: AgentPlan) => {
        let finalPlanState = { ...plan };

        for (let i = 0; i < plan.steps.length; i++) {
            const step = plan.steps[i];

            finalPlanState = { ...finalPlanState, steps: finalPlanState.steps.map(s => s.id === step.id ? { ...s, status: AgentStepStatus.IN_PROGRESS } : s) };
            setMessages(prev => prev.map(msg => msg.agentPlan?.goal === plan.goal ? { ...msg, agentPlan: finalPlanState } : msg));

            try {
                const result: any = await executeTool(step.name, step.args);

                if (result.status === 'error') {
                    throw new Error(result.message);
                }

                finalPlanState = { ...finalPlanState, steps: finalPlanState.steps.map(s => s.id === step.id ? { ...s, status: AgentStepStatus.COMPLETED, result } : s) };
                setMessages(prev => prev.map(msg => msg.agentPlan?.goal === plan.goal ? { ...msg, agentPlan: finalPlanState } : msg));

            } catch (error) {
                console.error(`Agent step '${step.name}' failed:`, error);
                finalPlanState = { ...finalPlanState, status: 'failed', steps: finalPlanState.steps.map(s => s.id === step.id ? { ...s, status: AgentStepStatus.FAILED, result: { error: (error as Error).message } } : s) };
                setMessages(prev => prev.map(msg => msg.agentPlan?.goal === plan.goal ? { ...msg, agentPlan: finalPlanState } : msg));
                return finalPlanState;
            }
        }

        finalPlanState = { ...finalPlanState, status: 'completed' };
        setMessages(prev => prev.map(msg => msg.agentPlan?.goal === plan.goal ? { ...msg, agentPlan: finalPlanState } : msg));
        return finalPlanState;
    };

    const handleToolCalls = async (functionCalls: FunctionCall[]) => {
        const agentCall = functionCalls.find(fc => fc.name === 'executeAgentPlan');
        if (agentCall && agentCall.args && agentCall.args.plan) {
            const { goal, plan: planSteps } = agentCall.args as { goal: string, plan: { name: string, args: any }[] };
            const newPlan: AgentPlan = {
                goal: goal,
                steps: planSteps.map(step => ({
                    id: crypto.randomUUID(),
                    name: step.name,
                    args: step.args,
                    status: AgentStepStatus.PENDING,
                })),
                status: 'running',
            };

            const agentMessage: Message = {
                role: Role.MODEL,
                content: '',
                agentPlan: newPlan,
            };
            setMessages(prev => [...prev.slice(0, -1), agentMessage]);

            const finalPlanState = await runAgentPlan(newPlan);

            const planResult = {
                status: finalPlanState.status,
                message: finalPlanState.status === 'completed' ? `Plan for goal "${goal}" executed successfully.` : `Plan for goal "${goal}" failed.`,
                steps: finalPlanState.steps.map(s => ({ name: s.name, status: s.status, result: s.result })),
            };

            return [{ functionResponse: { name: 'executeAgentPlan', response: { result: JSON.stringify(planResult) } } }];
        }

        const toolResponseParts = [];
        for (const fc of functionCalls) {
            if (!fc.name) continue;
            const result = await executeTool(fc.name, fc.args);
            toolResponseParts.push({
                functionResponse: {
                    name: fc.name,
                    response: { result: JSON.stringify(result) },
                },
            });
        }
        return toolResponseParts;
    };

    const getCurrentLocation = (): Promise<{ latitude: number, longitude: number }> => {
        return new Promise((resolve, reject) => {
            if (!navigator.geolocation) {
                reject(new Error("Geolocation is not supported by your browser."));
                return;
            }
            navigator.geolocation.getCurrentPosition(
                (position) => resolve({
                    latitude: position.coords.latitude,
                    longitude: position.coords.longitude
                }),
                () => reject(new Error("Unable to retrieve your location. Please ensure location services are enabled."))
            );
        });
    };

    const handleImageGeneration = async (prompt: string) => {
        if (!prompt) {
            setMessages(prev => [...prev, { role: Role.MODEL, content: "Please provide a prompt for the image. Usage: `/imagine a futuristic cityscape`" }]);
            setIsLoading(false);
            return;
        }
        setMessages(prev => [...prev, { role: Role.LOADING, content: 'VEE is creating your image...' }]);
        try {
            const imageBase64 = await generateImage(prompt);
            if (imageBase64) {
                const modelMessage: Message = {
                    role: Role.MODEL,
                    content: `Here is your generated image for: "${prompt}"`,
                    imageUrl: `data:image/jpeg;base64,${imageBase64}`
                };
                setMessages((prev) => [...prev.slice(0, -1), modelMessage]);
                if (isAudioEnabledRef.current) {
                    const audioData = await generateSpeech(modelMessage.content);
                    if (audioData && isAudioEnabledRef.current) playAudio(audioData);
                }
            } else {
                throw new Error("Image generation failed.");
            }
        } catch (error) {
            console.error('Error generating image:', error);
            const errorMessage = getErrorMessage(error, 'image generation');
            setMessages((prev) => [...prev.slice(0, -1), { role: Role.MODEL, content: errorMessage }]);
        } finally {
            setIsLoading(false);
        }
    };

    const handleVideoGeneration = async (prompt: string) => {
        if (!prompt) {
            setMessages(prev => [...prev, { role: Role.MODEL, content: "Please provide a prompt for the video. Usage: `/create video a robot driving a car`" }]);
            setIsLoading(false);
            return;
        }

        if (!isVeoKeySelected) {
            try {
                const hasKey = await (window as any).aistudio.hasSelectedApiKey();
                if (!hasKey) {
                    setMessages(prev => [...prev, { role: Role.MODEL, content: "Video generation requires an API key. A dialog will open for you to select one. Please try your request again after selection.\n\n[Learn more about billing](https://ai.google.dev/gemini-api/docs/billing)" }]);
                    await (window as any).aistudio.openSelectKey();
                    setIsVeoKeySelected(true);
                    setIsLoading(false);
                    return;
                }
                setIsVeoKeySelected(true);
            } catch (e) {
                setMessages(prev => [...prev, { role: Role.MODEL, content: "Could not verify API key for video generation. This feature may not be available." }]);
                setIsLoading(false);
                return;
            }
        }

        setMessages(prev => [...prev, { role: Role.LOADING, content: 'VEE is initializing video synthesis...' }]);

        try {
            const videoUri = await generateVideo(prompt, (message) => {
                setMessages(prev => prev.map(msg => msg.role === Role.LOADING ? { ...msg, content: message } : msg));
            });
            if (videoUri) {
                const modelMessage: Message = {
                    role: Role.MODEL,
                    content: `Your video for "${prompt}" is ready.`,
                    videoUrl: `${videoUri}&key=${process.env.API_KEY}`
                };
                setMessages((prev) => [...prev.slice(0, -1), modelMessage]);
                if (isAudioEnabledRef.current) {
                    const audioData = await generateSpeech(modelMessage.content);
                    if (audioData && isAudioEnabledRef.current) playAudio(audioData);
                }
            } else {
                throw new Error("Video generation failed.");
            }
        } catch (error: any) {
            console.error('Error generating video:', error);
            let errorMessage: string;
            if (error instanceof Error && error.message?.includes("Requested entity was not found")) {
                errorMessage = 'There was an issue with the API key. Please try selecting your key again.\n\n[Learn more about billing](https://ai.google.dev/gemini-api/docs/billing)';
                setIsVeoKeySelected(false);
            } else {
                errorMessage = getErrorMessage(error, 'video generation');
            }
            setMessages((prev) => [...prev.slice(0, -1), { role: Role.MODEL, content: errorMessage }]);
        } finally {
            setIsLoading(false);
        }
    };

    const handleGroundedSearch = async (query: string, tool: 'googleSearch' | 'googleMaps') => {
        if (!query) {
            setMessages(prev => [...prev, { role: Role.MODEL, content: `Please provide a query. Usage: \`/${tool === 'googleSearch' ? 'search' : 'maps'} what are the latest AI trends\`` }]);
            setIsLoading(false);
            return;
        }
        setMessages(prev => [...prev, { role: Role.LOADING, content: `VEE is searching ${tool === 'googleSearch' ? 'the web' : 'maps'}...` }]);

        let location;
        if (tool === 'googleMaps') {
            try {
                location = await getCurrentLocation();
            } catch (error: any) {
                setMessages((prev) => [...prev.slice(0, -1), { role: Role.MODEL, content: `Could not get your location: ${error.message}` }]);
                setIsLoading(false);
                return;
            }
        }

        try {
            const result = await performGroundedSearch(query, tool, location);
            if (result) {
                const modelMessage: Message = {
                    role: Role.MODEL,
                    content: result.text,
                    groundingSources: result.sources
                };
                setMessages((prev) => [...prev.slice(0, -1), modelMessage]);
                if (isAudioEnabledRef.current && result.text) {
                    // Truncate for search results too as they can be long
                    const textToSpeak = result.text.length > 500 ? result.text.substring(0, 500) + "..." : result.text;
                    const audioData = await generateSpeech(textToSpeak);
                    if (audioData && isAudioEnabledRef.current) playAudio(audioData);
                }
            } else {
                throw new Error("Grounded search failed.");
            }
        } catch (error) {
            console.error('Error with grounded search:', error);
            const errorMessage = getErrorMessage(error, `searching ${tool === 'googleSearch' ? 'the web' : 'maps'}`);
            setMessages((prev) => [...prev.slice(0, -1), { role: Role.MODEL, content: errorMessage }]);
        } finally {
            setIsLoading(false);
        }
    };

    const handleImageEditing = async (prompt: string, file: File) => {
        setMessages((prev) => [...prev, { role: Role.LOADING, content: 'VEE is creating...' }]);
        try {
            const editedImageBase64 = await editImage(prompt, file);
            if (editedImageBase64) {
                const modelMessage: Message = {
                    role: Role.MODEL,
                    content: "Here is the edited image, as requested.",
                    imageUrl: `data:${file.type};base64,${editedImageBase64}`
                };
                setMessages((prev) => [...prev.slice(0, -1), modelMessage]);
                if (isAudioEnabledRef.current) {
                    const audioData = await generateSpeech(modelMessage.content);
                    if (audioData && isAudioEnabledRef.current) playAudio(audioData);
                }
            } else {
                throw new Error("Image generation failed to return data.");
            }
        } catch (error) {
            console.error('Error editing image:', error);
            const errorMessage = getErrorMessage(error, 'image editing');
            setMessages((prev) => [...prev.slice(0, -1), { role: Role.MODEL, content: errorMessage }]);
        } finally {
            setIsLoading(false);
        }
    };

    const handleCLICommand = async (command: string, args: string) => {
        // 1. /bucket -> simulate gsutil via executeShellCommand
        if (command === '/bucket') {
            setMessages(prev => [...prev, { role: Role.LOADING, content: `Executing GCS command: gsutil ${args}...` }]);
            try {
                const result = await localFileService.executeShellCommand(`gsutil ${args}`);
                const output = result.status === 'success' ? result.output || result.message : result.message;
                setMessages(prev => [...prev.slice(0, -1), { role: Role.MODEL, content: `\`\`\`bash\n${output}\n\`\`\`` }]);
            } catch (e) {
                setMessages(prev => [...prev.slice(0, -1), { role: Role.MODEL, content: `Command failed: ${(e as Error).message}` }]);
            }
            setIsLoading(false);
            return;
        }

        // 2. /memory -> Direct call to searchChatGPTMemory
        if (command === '/memory') {
            if (!args) {
                setMessages(prev => [...prev, { role: Role.MODEL, content: "Usage: `/memory [query]`. Example: `/memory mobx tokenomics`" }]);
                setIsLoading(false);
                return;
            }
            setMessages(prev => [...prev, { role: Role.LOADING, content: `Searching Josh's ChatGPT Memory Archive for: "${args}"...` }]);
            try {
                const result = await creativeArchiveService.searchChatGPTMemory(args);
                const content = `**ChatGPT Memory Search Results:**\n\n` +
                    result.results.map((r: any) => `**${r.title}** (${r.date})\n> ${r.content}`).join('\n\n');
                setMessages(prev => [...prev.slice(0, -1), { role: Role.MODEL, content: content }]);
            } catch (e) {
                setMessages(prev => [...prev.slice(0, -1), { role: Role.MODEL, content: `Memory search failed: ${(e as Error).message}` }]);
            }
            setIsLoading(false);
            return;
        }

        // 3. /git -> simulate git commands
        if (command === '/git') {
            setMessages(prev => [...prev, { role: Role.LOADING, content: `Executing Git command: git ${args}...` }]);
            try {
                const result = await localFileService.executeShellCommand(`git ${args}`);
                const output = result.status === 'success' ? result.output || result.message : result.message;
                setMessages(prev => [...prev.slice(0, -1), { role: Role.MODEL, content: `\`\`\`bash\n${output}\n\`\`\`` }]);
            } catch (e) {
                setMessages(prev => [...prev.slice(0, -1), { role: Role.MODEL, content: `Git command failed: ${(e as Error).message}` }]);
            }
            setIsLoading(false);
            return;
        }

        // 4. /deploy -> simulate deployment
        if (command === '/deploy') {
            const repoName = args || 'v3-app';
            setMessages(prev => [...prev, { role: Role.LOADING, content: `Triggering Vercel deployment for: ${repoName}...` }]);
            try {
                const result = await executeTool('deployToVercel', { projectName: repoName });
                setMessages(prev => [...prev.slice(0, -1), { role: Role.MODEL, content: (result as any).message + `\n\nURL: ${(result as any).url}` }]);
            } catch (e) {
                setMessages(prev => [...prev.slice(0, -1), { role: Role.MODEL, content: `Deployment failed: ${(e as Error).message}` }]);
            }
            setIsLoading(false);
            return;
        }
    };

    const handleDefaultChat = async (userInput: string, files: File[], screenFrame: string | null) => {
        setMessages((prev) => [...prev, { role: Role.LOADING, content: 'VEE is building...' }]);
        try {
            if (!chatSessionRef.current) {
                chatSessionRef.current = await createChatSession();
            }

            let processedUserInput = userInput;
            const generativeParts: Part[] = [];

            if (screenFrame) {
                generativeParts.push({
                    inlineData: {
                        data: screenFrame,
                        mimeType: 'image/jpeg',
                    }
                });
                if (!processedUserInput) {
                    processedUserInput = "Analyze my screen and provide assistance.";
                }
            }

            for (const file of files) {
                if (file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
                    const textContent = await extractTextFromDocx(file);
                    processedUserInput += `\n\n--- START OF FILE: ${file.name} ---\n${textContent}\n--- END OF FILE: ${file.name} ---`;
                } else if (file.type.includes('zip') || file.type.includes('compressed')) {
                    // ZIP/Archive: Do not send to Gemini directly. Add note.
                    processedUserInput += `\n\n[SYSTEM NOTE]: User uploaded archive: "${file.name}". It has been stored in the 'vee-memory' bucket under project '${activeWorkspace}'. You can use the 'unzipArchive' tool to extract its contents.`;
                } else {
                    generativeParts.push(await fileToGenerativePart(file));
                }
            }

            const messagePayload = [{ text: processedUserInput }, ...generativeParts];

            if (!chatSessionRef.current) {
                throw new Error("Neural link not established.");
            }
            let response = await chatSessionRef.current.sendMessage({ message: messagePayload });

            if (response.functionCalls && response.functionCalls.length > 0) {
                const toolResponseParts = await handleToolCalls(response.functionCalls);
                if (toolResponseParts) {
                    if (!chatSessionRef.current) {
                        throw new Error("Neural link lost.");
                    }
                    response = await chatSessionRef.current.sendMessage({ message: toolResponseParts });
                } else {
                    return;
                }
            }

            const modelMessage: Message = { role: Role.MODEL, content: response.text || '' };
            setMessages((prev) => [...prev.slice(0, -1), modelMessage]);

            if (isAudioEnabledRef.current && response.text) {
                // Optimization: Truncate text sent to TTS to avoid long processing delays for large responses
                // 500 characters is approx 30-45 seconds of speech.
                const MAX_TTS_LENGTH = 500;
                let textToSpeak = response.text;

                if (textToSpeak.length > MAX_TTS_LENGTH) {
                    // Find the last period or newline before the limit to make it sound natural
                    const cutOff = textToSpeak.substring(0, MAX_TTS_LENGTH);
                    const lastPeriod = cutOff.lastIndexOf('.');
                    if (lastPeriod > 100) {
                        textToSpeak = cutOff.substring(0, lastPeriod + 1);
                    } else {
                        textToSpeak = cutOff + "...";
                    }
                }

                const audioData = await generateSpeech(textToSpeak);
                // Check ref again in case user disabled audio during generation
                if (audioData && isAudioEnabledRef.current) playAudio(audioData);
            }

        } catch (error) {
            console.error('Error sending message to Gemini:', error);
            const errorMessage = getErrorMessage(error, 'processing your request');
            setMessages((prev) => [...prev.slice(0, -1), { role: Role.MODEL, content: errorMessage }]);
        } finally {
            setIsLoading(false);
        }
    };

    const sendMessage = async (userInput: string, files: File[]) => {
        if (isLoading || (!userInput.trim() && files.length === 0 && !isScreenSharing)) return;

        setIsLoading(true);

        if (files.length > 0) {
            onUploadToArchive(files);
        }

        const screenFrameBase64 = isScreenSharing ? captureScreenFrame() : null;

        const userMessage: Message = {
            role: Role.USER,
            content: userInput,
            files: files.map(f => ({ name: f.name, type: f.type }))
        };
        if (screenFrameBase64) {
            userMessage.imageUrl = `data:image/jpeg;base64,${screenFrameBase64}`;
            if (!userMessage.content) {
                userMessage.content = "(Referring to screen)";
            }
        }

        setMessages((prev) => [...prev, userMessage]);

        const prompt = userInput.trim();
        const command = prompt.split(' ')[0].toLowerCase();
        const args = prompt.substring(command.length).trim();

        // Command Routing
        if (command === '/imagine') {
            handleImageGeneration(args);
        } else if (command === '/create' && prompt.split(' ')[1]?.toLowerCase() === 'video') {
            handleVideoGeneration(prompt.substring('/create video'.length).trim());
        } else if (command === '/search') {
            handleGroundedSearch(args, 'googleSearch');
        } else if (command === '/maps') {
            handleGroundedSearch(args, 'googleMaps');
        } else if (['/bucket', '/memory', '/git', '/deploy'].includes(command)) {
            // Handle new CLI commands
            handleCLICommand(command, args);
        } else if (files.length === 1 && files[0].type.startsWith('image/')) {
            handleImageEditing(prompt, files[0]);
        } else {
            handleDefaultChat(userInput, files, screenFrameBase64);
        }
    };

    return (
        <div className="flex flex-col h-full max-w-4xl mx-auto w-full bg-gray-900/80 backdrop-blur-sm border border-gray-700/50 rounded-lg shadow-2xl overflow-hidden">
            <canvas ref={canvasRef} className="hidden"></canvas>
            <main className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6">
                {messages.map((msg, index) => (
                    <ChatMessage key={index} message={msg} />
                ))}
                <div ref={messagesEndRef} />
            </main>

            {isScreenSharing && (
                <div className="p-2 border-t border-gray-700/50 bg-gray-800/50">
                    <p className="text-xs text-center text-gray-400 mb-2">You are sharing your screen. The frame below will be sent with your next message.</p>
                    <video ref={videoRef} autoPlay playsInline muted className="w-full h-auto max-h-48 rounded-md border border-gray-600" />
                </div>
            )}

            <footer className="p-4 sticky bottom-0 bg-transparent">
                <ChatInput
                    onSendMessage={sendMessage}
                    isLoading={isLoading}
                    isScreenSharing={isScreenSharing}
                    onToggleScreenShare={toggleScreenShare}
                />
            </footer>
        </div>
    );
};

export default ChatInterface;
