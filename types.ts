
export enum Role {
  USER = 'user',
  MODEL = 'model',
  LOADING = 'loading',
}

export interface MessageFile {
  name: string;
  type: string;
}

export interface GroundingSource {
  uri: string;
  title: string;
}

export enum AgentStepStatus {
  PENDING = 'pending',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  FAILED = 'failed',
}

export interface AgentStep {
  id: string;
  name: string;
  args: any;
  status: AgentStepStatus;
  result?: any; // To store success/error messages
}

export interface AgentPlan {
  goal: string;
  steps: AgentStep[];
  status: 'running' | 'completed' | 'failed';
}

export interface Message {
  role: Role;
  content: string;
  files?: MessageFile[];
  imageUrl?: string;
  videoUrl?: string;
  groundingSources?: any[]; // Allow flexible source structure
  agentPlan?: AgentPlan;
}

export enum TaskStatus {
  TODO = 'To Do',
  IN_PROGRESS = 'In Progress',
  COMPLETED = 'Completed',
}

export interface Task {
  id: string;
  content: string;
  status: TaskStatus;
}

// --- GCS MEMORY SCHEMA TYPES ---

export type GCSFileType = 'chat_log' | 'upload' | 'zip' | 'extracted_asset' | 'generated_content';

export interface GCSMetadata {
    projectId: string; // e.g., 'v3_app', 'biofield'
    type: GCSFileType;
    description?: string;
    contentType: string;
    originalName: string;
    uploadedBy: 'user' | 'vee_agent';
}

export interface ArchivedFile {
  id: string; // Acts as the Generation ID
  gcsPath: string; // vee-memory/{projectId}/{type}/{filename}
  name: string;
  size: number;
  metadata: GCSMetadata;
  content: string | null; // Base64 or Text content
  updated: string; // ISO Date
}

// --- NEW AGENT ARCHITECTURE TYPES ---

export type JobType = 
  | 'post_social' 
  | 'create_listing' 
  | 'deploy_code' 
  | 'analyze_metrics' 
  | 'sync_inventory'
  | 'ebay_reprice'
  | 'ebay_sync_orders'
  | 'ebay_bulk_list';

export type JobStatus = 'pending' | 'processing' | 'awaiting_approval' | 'completed' | 'failed';

export interface Job {
  id: string;
  type: JobType;
  payload: any;
  status: JobStatus;
  createdAt: string;
  scheduledFor?: string; // ISO string for future execution
  requiresApproval: boolean;
  result?: any;
}

export interface AgentStateSnapshot {
    queue: Job[];
    pendingApprovals: Job[];
    history: Job[];
}

// --- EBAY SPECIFIC TYPES ---

export type PricingStrategy = 'match_lowest' | 'undercut_competitor' | 'fixed_margin';

export interface PricingRule {
    sku: string;
    minPrice: number;
    maxPrice: number;
    strategy: PricingStrategy;
    competitorUrl?: string;
}

export interface EbayItem {
    sku: string;
    title: string;
    currentPrice: number;
    quantity: number;
    status: 'Active' | 'Draft' | 'Ended';
    views: number;
    pricingRule?: PricingRule;
}

export interface EbayOrder {
    orderId: string;
    buyer: string;
    total: number;
    status: 'Paid' | 'Shipped' | 'Delivered' | 'Cancelled';
    items: { sku: string, title: string, qty: number }[];
    orderDate: string;
}
