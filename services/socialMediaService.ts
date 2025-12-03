
import { Job } from '../types';

/**
 * =================================================================
 * VEE SOCIAL MEDIA SERVICE — SIMULATION
 * =================================================================
 * 
 * Handles platform-specific logic for TikTok, X (Twitter), Instagram,
 * YouTube, and Discord. 
 * 
 * Capabilities:
 * - Mock API calls for posting (Draft vs Publish)
 * - Analytics Aggregation
 * - Content Calendar Management
 */

export interface SocialPostDraft {
    id: string;
    platform: 'tiktok' | 'x' | 'instagram' | 'youtube' | 'discord';
    content: string;
    mediaUrl?: string;
    scheduledFor?: string;
    status: 'draft' | 'scheduled' | 'published';
    analytics?: {
        views: number;
        likes: number;
        shares: number;
    }
}

// In-memory store
let postsDatabase: SocialPostDraft[] = [];

// Mock Analytics Data
const MOCK_ANALYTICS = {
    tiktok: { views: 15400, likes: 3200, shares: 450, growth: '+12%' },
    x: { views: 8500, likes: 120, shares: 45, growth: '+5%' },
    instagram: { views: 4200, likes: 800, shares: 120, growth: '+8%' },
    youtube: { views: 2100, likes: 350, shares: 20, growth: '+15%' },
    discord: { views: 450, likes: 0, shares: 0, growth: '+2%' }, // Views = Active Members
};

export const socialMediaService = {
    
    /**
     * Simulates fetching platform analytics.
     */
    async getAnalytics(platform: string, period: string) {
        console.log(`[SocialService] Fetching ${period} analytics for ${platform}...`);
        await new Promise(resolve => setTimeout(resolve, 800));
        
        const base = MOCK_ANALYTICS[platform as keyof typeof MOCK_ANALYTICS] || { views: 0, likes: 0, shares: 0, growth: '0%' };
        
        // Add some randomness
        return {
            views: Math.floor(base.views * (0.8 + Math.random() * 0.4)),
            likes: Math.floor(base.likes * (0.8 + Math.random() * 0.4)),
            shares: Math.floor(base.shares * (0.8 + Math.random() * 0.4)),
            growth: base.growth,
            topPost: "V3 Ecosystem Launch Teaser"
        };
    },

    /**
     * Saves a post as a draft or scheduled item.
     */
    async createDraft(platform: string, content: string, scheduledFor?: string): Promise<SocialPostDraft> {
        const draft: SocialPostDraft = {
            id: crypto.randomUUID(),
            platform: platform as any,
            content,
            scheduledFor,
            status: scheduledFor ? 'scheduled' : 'draft',
            analytics: { views: 0, likes: 0, shares: 0 }
        };
        postsDatabase.push(draft);
        console.log(`[SocialService] Draft created for ${platform}: ${draft.id}`);
        return draft;
    },

    /**
     * "Publishes" a post immediately.
     */
    async publishPost(platform: string, content: string): Promise<string> {
        console.log(`[SocialService] PUBLISHING to ${platform}:`);
        console.log(content);
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        const post: SocialPostDraft = {
            id: crypto.randomUUID(),
            platform: platform as any,
            content,
            status: 'published',
            analytics: { views: 0, likes: 0, shares: 0 }
        };
        postsDatabase.push(post);
        
        return `https://${platform}.com/post/${post.id}`;
    },

    /**
     * Retrieves the content calendar (all scheduled/draft posts).
     */
    async getContentCalendar(): Promise<SocialPostDraft[]> {
        return postsDatabase.sort((a, b) => {
            const dateA = a.scheduledFor ? new Date(a.scheduledFor).getTime() : 0;
            const dateB = b.scheduledFor ? new Date(b.scheduledFor).getTime() : 0;
            return dateB - dateA;
        });
    }
};
