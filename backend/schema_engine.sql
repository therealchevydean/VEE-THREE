-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Create Jobs Table
CREATE TABLE IF NOT EXISTS jobs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    pipeline_type VARCHAR(50) NOT NULL, -- SOCIAL_POST, LISTING, TOKIN_FRANKS_CARD, EBOOK_SECTION
    source_asset_id VARCHAR(255),       -- Nullable (can start from scratch)
    input_summary TEXT,                 -- Context/Summary of what to generate
    draft_output JSONB,                 -- The AI generated content
    status VARCHAR(50) NOT NULL DEFAULT 'INBOX', -- INBOX, DRAFT, READY_FOR_REVIEW, APPROVED, ARCHIVED
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. Create Real World Tasks Table
CREATE TABLE IF NOT EXISTS real_world_tasks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    related_job_id UUID REFERENCES jobs(id) ON DELETE SET NULL, -- Link to job
    description TEXT NOT NULL,
    category VARCHAR(50) NOT NULL,      -- PACKAGING, SHIPPING, BURN_CYCLE, PREP, REMINDER
    status VARCHAR(50) NOT NULL DEFAULT 'TODO', -- TODO, IN_PROGRESS, DONE
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 3. Indexes for Performance
CREATE INDEX IF NOT EXISTS idx_jobs_status ON jobs(status);
CREATE INDEX IF NOT EXISTS idx_tasks_status ON real_world_tasks(status);
CREATE INDEX IF NOT EXISTS idx_tasks_job_id ON real_world_tasks(related_job_id);
