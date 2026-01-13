import React, { useEffect, useState } from 'react';
import './EngineView.css';
import { Job, RealWorldTask, PipelineType } from '../src/types/engine';

// --- Icon Components ---
const XMarkIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}>
        <path fillRule="evenodd" d="M5.47 5.47a.75.75 0 011.06 0L12 10.94l5.47-5.47a.75.75 0 111.06 1.06L13.06 12l5.47 5.47a.75.75 0 11-1.06 1.06L12 13.06l-5.47 5.47a.75.75 0 01-1.06-1.06L10.94 12 5.47 6.53a.75.75 0 010-1.06z" clipRule="evenodd" />
    </svg>
);

interface EngineViewProps {
    isOpen: boolean;
    onClose: () => void;
}

const EngineView: React.FC<EngineViewProps> = ({ isOpen, onClose }) => {
    const [jobs, setJobs] = useState<Job[]>([]);
    const [tasks, setTasks] = useState<RealWorldTask[]>([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (isOpen) fetchData();
    }, [isOpen]);

    const fetchData = async () => {
        setLoading(true);
        try {
            const jobsRes = await fetch('/api/jobs');
            const tasksRes = await fetch('/api/tasks');

            if (jobsRes.ok) setJobs(await jobsRes.json());
            if (tasksRes.ok) setTasks(await tasksRes.json());
        } catch (error) {
            console.error('Error fetching engine data:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleCreateJob = async (type: PipelineType, summary: string) => {
        if (!summary) return;
        try {
            const res = await fetch('/api/jobs/create', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ pipeline_type: type, input_summary: summary })
            });
            if (res.ok) fetchData();
        } catch (error) {
            console.error('Error creating job:', error);
        }
    };

    const handleGenerate = async (id: string) => {
        try {
            setLoading(true); // crude global loading
            const res = await fetch(`/api/jobs/generate/${id}`, { method: 'POST' });
            if (res.ok) fetchData();
        } catch (error) {
            console.error('Error generating draft:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleApprove = async (id: string) => {
        try {
            const res = await fetch(`/api/jobs/approve/${id}`, { method: 'POST' });
            if (res.ok) fetchData();
        } catch (error) {
            console.error('Error approving job:', error);
        }
    };

    const handleTaskDone = async (id: string) => {
        try {
            const res = await fetch(`/api/tasks/${id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: 'DONE' })
            });
            if (res.ok) fetchData();
        } catch (error) {
            console.error('Error updating task:', error);
        }
    };

    if (!isOpen) return null;

    const inboxJobs = jobs.filter(j => j.status === 'INBOX');
    const draftJobs = jobs.filter(j => j.status === 'DRAFT' || j.status === 'READY_FOR_REVIEW');
    const activeTasks = tasks.filter(t => t.status !== 'DONE');

    return (
        <div className="engine-modal-overlay" onClick={onClose}>
            <div className="engine-view" onClick={e => e.stopPropagation()}>
                <header className="engine-header">
                    <div className="header-title">
                        <h1>VEE Execution Engine</h1>
                        <p className="text-xs text-gray-500">Pipeline Generation & Task Management</p>
                    </div>
                    <div className="actions">
                        <button onClick={() => handleCreateJob('LISTING', 'Demo Item from Engine UI')}>
                            + Demo Listing
                        </button>
                        <button onClick={() => handleCreateJob('SOCIAL_POST', 'V3 Launch Tweet')}>
                            + Demo Post
                        </button>
                        <button onClick={fetchData} className="refresh-btn">System Refresh</button>
                        <button onClick={onClose} className="p-2 ml-4 rounded-full text-gray-400 hover:bg-gray-700 hover:text-white transition-colors" aria-label="Close engine">
                            <XMarkIcon className="w-6 h-6" />
                        </button>
                    </div>
                </header>

                <div className="engine-grid">
                    {/* Column 1: INBOX */}
                    <section className="column inbox">
                        <h2>📥 Inbox <span className="count">{inboxJobs.length}</span></h2>
                        <div className="card-list">
                            {inboxJobs.length === 0 && <div className="empty-state">No pending jobs</div>}
                            {inboxJobs.map(job => (
                                <div key={job.id} className="card job-card">
                                    <span className="badge">{job.pipeline_type}</span>
                                    <p className="summary">{job.input_summary.substring(0, 100)}...</p>
                                    <div className="card-actions">
                                        <button onClick={() => handleGenerate(job.id)} disabled={loading}>
                                            {loading ? 'Thinking...' : '⚡ Generate Draft'}
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>

                    {/* Column 2: DRAFTS */}
                    <section className="column drafts">
                        <h2>📝 Drafts <span className="count">{draftJobs.length}</span></h2>
                        <div className="card-list">
                            {draftJobs.length === 0 && <div className="empty-state">No drafts finding review</div>}
                            {draftJobs.map(job => (
                                <div key={job.id} className="card draft-card">
                                    <span className="badge warning">{job.pipeline_type}</span>
                                    <h4>{job.draft_output?.title || 'Untitled Draft'}</h4>
                                    <div className="draft-preview">
                                        {/* Preview logic */}
                                        {job.pipeline_type === 'LISTING' && (
                                            <p>Price: ${job.draft_output?.suggested_price}</p>
                                        )}
                                        {job.pipeline_type === 'SOCIAL_POST' && (
                                            <p>"{job.draft_output?.body?.substring(0, 50)}..."</p>
                                        )}
                                    </div>
                                    <div className="card-actions">
                                        <button onClick={() => handleApprove(job.id)} className="primary-btn">
                                            ✅ Approve & Process
                                        </button>
                                        <button onClick={() => handleGenerate(job.id)} className="secondary-btn">
                                            🔄 Regenerate
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>

                    {/* Column 3: REAL WORLD */}
                    <section className="column real-world">
                        <h2>🌍 Real World <span className="count">{activeTasks.length}</span></h2>
                        <div className="card-list">
                            {activeTasks.length === 0 && <div className="empty-state">System operational. No tasks.</div>}
                            {activeTasks.map(task => (
                                <div key={task.id} className="card task-card">
                                    <div className="task-header">
                                        <span className={`badge task-${task.category.toLowerCase()}`}>{task.category}</span>
                                        <span className="job-ref">Job...{task.related_job_id?.substring(0, 4)}</span>
                                    </div>
                                    <p className="task-desc">{task.description}</p>
                                    <div className="card-actions">
                                        <button onClick={() => handleTaskDone(task.id)} className="done-btn">
                                            Mark Done
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>
                </div>
            </div>
        </div>
    );
};


export default EngineView;
