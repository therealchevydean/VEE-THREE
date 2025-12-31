import { query } from '../db';
import * as Pipelines from '../pipelines';
import * as TaskService from './taskService';

export interface Job {
    id: string;
    pipeline_type: 'SOCIAL_POST' | 'LISTING' | 'TOKIN_FRANKS_CARD' | 'EBOOK_SECTION';
    source_asset_id?: string;
    input_summary: string;
    draft_output?: any;
    status: 'INBOX' | 'DRAFT' | 'READY_FOR_REVIEW' | 'APPROVED' | 'ARCHIVED';
    created_at: Date;
    updated_at: Date;
}

export const createJob = async (type: string, summary: string, sourceId?: string) => {
    const res = await query(
        `INSERT INTO jobs (pipeline_type, input_summary, source_asset_id, status)
         VALUES ($1, $2, $3, 'INBOX')
         RETURNING *`,
        [type, summary, sourceId]
    );
    return res.rows[0];
};

export const getJobs = async (status?: string, type?: string) => {
    let q = 'SELECT * FROM jobs';
    const params: any[] = [];
    const conditions: string[] = [];

    if (status) {
        params.push(status);
        conditions.push(`status = $${params.length}`);
    }
    if (type) {
        params.push(type);
        conditions.push(`pipeline_type = $${params.length}`);
    }

    if (conditions.length > 0) {
        q += ' WHERE ' + conditions.join(' AND ');
    }

    q += ' ORDER BY created_at DESC';

    const res = await query(q, params);
    return res.rows;
};

export const generateJobDraft = async (id: string) => {
    // 1. Get Job
    const jobRes = await query('SELECT * FROM jobs WHERE id = $1', [id]);
    if (jobRes.rows.length === 0) throw new Error('Job not found');
    const job = jobRes.rows[0];

    // 2. Call Pipeline
    let draft = null;
    const input = { assetSummary: job.input_summary, ...job.draft_output }; // Merge existing draft inputs if any? Or just input_summary.
    // Actually, input_summary is text. The pipeline might need structured input.
    // For now, we assume simple string input parsing or just passing summary.

    // Simplification for prototype:
    // If input_summary is JSON string, parse it. Else use as string.
    let payload: any = { assetSummary: job.input_summary };
    try { payload = JSON.parse(job.input_summary); } catch (e) { }

    // Map types
    switch (job.pipeline_type) {
        case 'SOCIAL_POST':
            draft = await Pipelines.generateSocialPostDraft({
                assetSummary: typeof payload === 'string' ? payload : payload.summary
            });
            break;
        case 'LISTING':
            draft = await Pipelines.generateListingDraft({
                itemTitle: payload.title || 'Unknown Item',
                itemDetails: payload.details || job.input_summary,
                condition: payload.condition || 'Used'
            });
            break;
        case 'TOKIN_FRANKS_CARD':
            draft = await Pipelines.generateTokinFranksCardDraft({
                characterName: payload.name || 'Unknown',
                sceneDescription: payload.scene || job.input_summary
            });
            break;
        case 'EBOOK_SECTION':
            draft = await Pipelines.generateEbookSectionDraft({
                bookTitle: payload.bookTitle || 'VEE Book',
                sectionGoal: payload.goal || job.input_summary
            });
            break;
    }

    // 3. Update Job
    const updateRes = await query(
        `UPDATE jobs SET draft_output = $1, status = 'DRAFT', updated_at = NOW() WHERE id = $2 RETURNING *`,
        [draft, id]
    );
    return updateRes.rows[0];
};

export const updateJobStatus = async (id: string, status: string) => {
    const res = await query(
        `UPDATE jobs SET status = $1, updated_at = NOW() WHERE id = $2 RETURNING *`,
        [status, id]
    );
    const job = res.rows[0];

    // LOGIC HOOKS
    if (status === 'APPROVED') {
        if (job.pipeline_type === 'LISTING') {
            await TaskService.createTask(job.id, 'PACKAGING', 'Package item for shipping: ' + (job.draft_output?.title || 'Item'));
            await TaskService.createTask(job.id, 'SHIPPING', 'Generate shipping label');
        } else if (job.pipeline_type === 'EBOOK_SECTION') {
            await TaskService.createTask(job.id, 'PREP', 'Review and merge section into master manuscript');
        }
    }

    return job;
};
