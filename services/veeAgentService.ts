
import { Job, JobType, JobStatus, AgentStateSnapshot } from '../types';
import { commit } from './memoryService';
import { ebayService } from './ebayService';
import { socialMediaService } from './socialMediaService';

/**
 * =================================================================
 * VEE AGENT SERVICE — UNIFIED OPERATIONAL BACKBONE
 * =================================================================
 * 
 * Implements the architecture defined in "Unified Agent Flow for VEE":
 * 1. Scheduler (Cron-like)
 * 2. Job Manager (Queue & Approvals)
 * 3. Engines (Social, E-Com, Automation, eBay)
 */

// --- 1. THE ENGINES ---

class SocialMediaEngine {
    async publishPost(platform: string, content: string): Promise<string> {
        console.log(`[SocialEngine] Publishing to ${platform}...`);
        // Use the new service
        return await socialMediaService.publishPost(platform, content);
    }

    async fetchMetrics(platform: string): Promise<any> {
        console.log(`[SocialEngine] Fetching metrics for ${platform}`);
        // Use the new service
        return await socialMediaService.getAnalytics(platform, 'last_7_days');
    }
}

class EcommerceEngine {
    async createListing(platform: string, product: any): Promise<string> {
        console.log(`[EcomEngine] Creating listing on ${platform}: ${product.title}`);
        await new Promise(resolve => setTimeout(resolve, 1500));
        return `Success: Listing live on ${platform} (ID: ${crypto.randomUUID()})`;
    }

    async updateInventory(productId: string, qty: number): Promise<string> {
        console.log(`[EcomEngine] Updating inventory for ${productId} to ${qty}`);
        return 'Inventory Synced';
    }
}

class AutomationEngine {
    async deployCode(project: string): Promise<string> {
        console.log(`[AutoEngine] Deploying ${project} to Vercel...`);
        await new Promise(resolve => setTimeout(resolve, 3000));
        return `Success: ${project} deployed successfully.`;
    }
}

class EbayEngine {
    // Job: "Reprice Nightly"
    async executeRepricing(): Promise<string> {
        console.log(`[EbayEngine] Starting Repricing Run...`);
        const inventory = await ebayService.getInventory();
        let updates = 0;

        for (const item of inventory) {
            if (item.pricingRule) {
                // LOGIC: VEE Brain would determine this, but here is a simple algorithm
                // In production, call eBay Browse API to find competitor price
                const simulatedCompetitorPrice = item.currentPrice - (Math.random() > 0.5 ? 2 : -2); 
                
                let newPrice = item.currentPrice;

                if (item.pricingRule.strategy === 'undercut_competitor') {
                    newPrice = simulatedCompetitorPrice - 0.50;
                } else if (item.pricingRule.strategy === 'match_lowest') {
                    newPrice = simulatedCompetitorPrice;
                }

                // Enforce Floor/Ceiling
                if (newPrice < item.pricingRule.minPrice) newPrice = item.pricingRule.minPrice;
                if (newPrice > item.pricingRule.maxPrice) newPrice = item.pricingRule.maxPrice;

                if (newPrice !== item.currentPrice) {
                    await ebayService.updatePrice(item.sku, Number(newPrice.toFixed(2)));
                    updates++;
                }
            }
        }
        return `Repricing Complete. Updated ${updates} SKUs.`;
    }

    // Job: "Sync Orders Hourly"
    async syncOrders(): Promise<string> {
        console.log(`[EbayEngine] Syncing Orders...`);
        const orders = await ebayService.getOrders();
        // In production, we would save these to a database
        return `Sync Complete. Processed ${orders.length} orders.`;
    }

    async createBulkListings(items: any[]): Promise<string> {
        console.log(`[EbayEngine] Bulk creating ${items.length} drafts...`);
        for (const item of items) {
            await ebayService.createDraft(item);
        }
        return `Bulk List Complete. Created ${items.length} drafts.`;
    }
}

// --- 2. THE JOB MANAGER ---

class JobManager {
    private queue: Job[] = [];
    private history: Job[] = [];
    private socialEngine = new SocialMediaEngine();
    private ecomEngine = new EcommerceEngine();
    private autoEngine = new AutomationEngine();
    private ebayEngine = new EbayEngine();
    private isProcessing = false;

    constructor() {
        this.loadState();
    }

    private loadState() {
        try {
            const stored = localStorage.getItem('vee_agent_state');
            if (stored) {
                const parsed = JSON.parse(stored);
                this.queue = parsed.queue || [];
                this.history = parsed.history || [];
            }
        } catch (e) {
            console.error("Failed to load agent state", e);
        }
    }

    private saveState() {
        try {
            localStorage.setItem('vee_agent_state', JSON.stringify({
                queue: this.queue,
                history: this.history
            }));
        } catch (e) {
            console.error("Failed to save agent state", e);
        }
    }

    public enqueue(type: JobType, payload: any, scheduledFor?: string): Job {
        const job: Job = {
            id: crypto.randomUUID(),
            type,
            payload,
            status: 'pending',
            createdAt: new Date().toISOString(),
            scheduledFor,
            requiresApproval: this.checkApprovalRequirement(type)
        };
        
        this.queue.push(job);
        this.saveState();
        console.log(`[JobManager] Enqueued job ${job.id} (${job.type})`);
        this.process(); // Trigger processing loop
        return job;
    }

    private checkApprovalRequirement(type: JobType): boolean {
        // Critical actions require manual approval as per Protocol 1
        const HIGH_STAKES: JobType[] = ['post_social', 'deploy_code', 'create_listing', 'ebay_bulk_list'];
        return HIGH_STAKES.includes(type);
    }

    public getPendingApprovals(): Job[] {
        return this.queue.filter(j => j.status === 'awaiting_approval');
    }

    public async approveJob(jobId: string): Promise<void> {
        const job = this.queue.find(j => j.id === jobId);
        if (job && job.status === 'awaiting_approval') {
            job.status = 'pending'; // Reset to pending so processor picks it up
            job.requiresApproval = false; // Approval granted
            this.saveState();
            this.process();
        }
    }

    public async process() {
        if (this.isProcessing) return;
        this.isProcessing = true;

        try {
            // Find next executable job
            const now = new Date();
            const nextJobIndex = this.queue.findIndex(j => {
                if (j.status !== 'pending') return false;
                if (j.scheduledFor && new Date(j.scheduledFor) > now) return false; // Not time yet
                return true;
            });

            if (nextJobIndex === -1) {
                this.isProcessing = false;
                return;
            }

            const job = this.queue[nextJobIndex];

            // Check for Approval Flag
            if (job.requiresApproval) {
                job.status = 'awaiting_approval';
                console.log(`[JobManager] Job ${job.id} paused for approval.`);
                this.saveState();
                this.isProcessing = false;
                return; // Stop processing this specific thread until approved
            }

            // Execute
            job.status = 'processing';
            this.saveState();

            try {
                const result = await this.executeJob(job);
                job.status = 'completed';
                job.result = result;
                // Archive to history
                this.history.push(job);
                this.queue.splice(nextJobIndex, 1); // Remove from queue
                
                // Log to memory
                await commit(`[Job Completed] ${job.type}: ${JSON.stringify(job.result)}`);

            } catch (error: any) {
                console.error(`[JobManager] Job ${job.id} failed:`, error);
                job.status = 'failed';
                job.result = error.message;
                // Keep in queue for inspection or retry logic (simplified here)
            }

            this.saveState();
            
            // Continue processing
            this.isProcessing = false;
            this.process();

        } catch (e) {
            this.isProcessing = false;
            console.error("Error in job processing loop", e);
        }
    }

    private async executeJob(job: Job): Promise<any> {
        switch (job.type) {
            case 'post_social':
                return this.socialEngine.publishPost(job.payload.platform, job.payload.content);
            case 'create_listing':
                return this.ecomEngine.createListing(job.payload.platform, job.payload.product);
            case 'deploy_code':
                return this.autoEngine.deployCode(job.payload.projectName);
            case 'analyze_metrics':
                return this.socialEngine.fetchMetrics(job.payload.platform);
            case 'sync_inventory':
                return this.ecomEngine.updateInventory(job.payload.productId, job.payload.qty);
            case 'ebay_reprice':
                return this.ebayEngine.executeRepricing();
            case 'ebay_sync_orders':
                return this.ebayEngine.syncOrders();
            case 'ebay_bulk_list':
                return this.ebayEngine.createBulkListings(job.payload.items);
            default:
                throw new Error(`Unknown job type: ${job.type}`);
        }
    }

    public getSnapshot(): AgentStateSnapshot {
        return {
            queue: this.queue,
            pendingApprovals: this.getPendingApprovals(),
            history: this.history
        };
    }
}

// --- 3. THE SCHEDULER ---

class Scheduler {
    private jobManager: JobManager;
    private timer: ReturnType<typeof setInterval> | null = null;

    constructor(manager: JobManager) {
        this.jobManager = manager;
    }

    public start() {
        if (this.timer) return;
        console.log("[Scheduler] Started. Checking for triggers every 60s.");
        
        // Check immediately
        this.checkTriggers();

        // Loop
        this.timer = setInterval(() => {
            this.checkTriggers();
        }, 60000);
    }

    public stop() {
        if (this.timer) {
            clearInterval(this.timer);
            this.timer = null;
        }
    }

    private checkTriggers() {
        // 1. Check for timed jobs in the queue
        this.jobManager.process();

        // 2. Cron: Hourly Order Sync
        // In a real implementation, check current time against last run time
    }
}

// --- EXPORT SINGLETON INSTANCE ---

export const veeAgent = new JobManager();
export const veeScheduler = new Scheduler(veeAgent);

export const initializeAgent = () => {
    veeScheduler.start();
};
