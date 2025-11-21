
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
  // FIX: Corrected typo from `Agent-step[]` to `AgentStep[]`.
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

export interface ArchivedFile {
  id: string;
  name: string;
  type: string;
  size: number;
  content: string | null; // Store content for text-based files
  uploadedAt: string;
}

// --- NEW AGENT ARCHITECTURE TYPES ---

export type JobType = 
  | 'post_social' 
  | 'create_listing' 
  | 'deploy_code' 
  | 'analyze_metrics' 
  | 'sync_inventory';

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
