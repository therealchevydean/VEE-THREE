// Mirrors backend Job entity
export type PipelineType = 'SOCIAL_POST' | 'LISTING' | 'TOKIN_FRANKS_CARD' | 'EBOOK_SECTION';
export type JobStatus = 'INBOX' | 'DRAFT' | 'READY_FOR_REVIEW' | 'APPROVED' | 'ARCHIVED';

export interface Job {
    id: string;
    pipeline_type: PipelineType;
    source_asset_id?: string;
    input_summary: string;
    draft_output?: any; // JSON structure depends on pipeline
    status: JobStatus;
    created_at: string;
    updated_at: string;
}

// Mirrors backend Real World Task entity
export type TaskCategory = 'PACKAGING' | 'SHIPPING' | 'BURN_CYCLE' | 'PREP' | 'REMINDER';
export type TaskStatus = 'TODO' | 'IN_PROGRESS' | 'DONE';

export interface RealWorldTask {
    id: string;
    related_job_id?: string;
    description: string;
    category: TaskCategory;
    status: TaskStatus;
    created_at: string;
    updated_at: string;
}
