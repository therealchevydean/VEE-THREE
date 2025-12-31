import { query } from '../db';

export const createTask = async (jobId: string | null, category: string, description: string) => {
    const res = await query(
        `INSERT INTO real_world_tasks (related_job_id, category, description, status)
         VALUES ($1, $2, $3, 'TODO')
         RETURNING *`,
        [jobId, category, description]
    );
    return res.rows[0];
};

export const getTasks = async (jobId?: string, status?: string) => {
    let q = 'SELECT * FROM real_world_tasks';
    const params: any[] = [];
    const conditions: string[] = [];

    if (jobId) {
        params.push(jobId);
        conditions.push(`related_job_id = $${params.length}`);
    }
    if (status) {
        params.push(status);
        conditions.push(`status = $${params.length}`);
    }

    if (conditions.length > 0) {
        q += ' WHERE ' + conditions.join(' AND ');
    }

    q += ' ORDER BY created_at DESC';
    return (await query(q, params)).rows;
};

export const updateTaskStatus = async (id: string, status: string) => {
    const res = await query(
        `UPDATE real_world_tasks SET status = $1, updated_at = NOW() WHERE id = $2 RETURNING *`,
        [status, id]
    );
    return res.rows[0];
};
