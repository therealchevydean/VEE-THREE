
import React from 'react';
import { AgentPlan, AgentStep, AgentStepStatus } from '../types';

// --- Icon Components ---
const CheckCircleIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}>
        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z" clipRule="evenodd" />
    </svg>
);

const XCircleIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}>
        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.28 7.22a.75.75 0 00-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 101.06 1.06L10 11.06l1.72 1.72a.75.75 0 101.06-1.06L11.06 10l1.72-1.72a.75.75 0 00-1.06-1.06L10 8.94 8.28 7.22z" clipRule="evenodd" />
    </svg>
);

const PendingIcon: React.FC<{ className?: string }> = ({ className }) => (
    <div className={`w-5 h-5 flex items-center justify-center ${className}`}>
        <div className="w-2.5 h-2.5 bg-gray-500 rounded-full"></div>
    </div>
);

const InProgressIcon: React.FC<{ className?: string }> = ({ className }) => (
     <svg className={`animate-spin w-5 h-5 ${className}`} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
    </svg>
);

const statusIcons: Record<AgentStepStatus, React.FC<{ className?: string }>> = {
    [AgentStepStatus.PENDING]: PendingIcon,
    [AgentStepStatus.IN_PROGRESS]: InProgressIcon,
    [AgentStepStatus.COMPLETED]: CheckCircleIcon,
    [AgentStepStatus.FAILED]: XCircleIcon,
};

const statusColors: Record<AgentStepStatus, string> = {
    [AgentStepStatus.PENDING]: 'text-gray-500',
    [AgentStepStatus.IN_PROGRESS]: 'text-cyan-400',
    [AgentStepStatus.COMPLETED]: 'text-green-500',
    [AgentStepStatus.FAILED]: 'text-red-500',
};

const StepResult: React.FC<{ result: any }> = ({ result }) => {
    if (!result) return null;

    let parsedResult = result;
    if (typeof result === 'string') {
        try { parsedResult = JSON.parse(result); } catch (e) { /* Not JSON */ }
    }

    if (parsedResult.status === 'success' && parsedResult.message) {
        return <p className="text-xs text-gray-400">{parsedResult.message}</p>;
    }
    if (parsedResult.error) {
         return <p className="text-xs text-red-400">{parsedResult.error}</p>;
    }
    if (parsedResult.status === 'error' && parsedResult.message) {
        return <p className="text-xs text-red-400">{parsedResult.message}</p>;
    }

    if (typeof parsedResult === 'object' && parsedResult !== null) {
        const content = JSON.stringify(parsedResult, null, 2);
        return <pre className="text-xs text-gray-400 mt-1 bg-gray-900 p-1.5 rounded-md overflow-x-auto"><code>{content}</code></pre>;
    }
    
    if (typeof result === 'string') {
        return <p className="text-xs text-gray-400">{result}</p>;
    }

    return null;
}

const formatArgs = (args: any) => {
    if (!args || Object.keys(args).length === 0) return null;
    
    const formattedArgs = Object.entries(args)
        .map(([key, value]) => {
            const valStr = String(value);
            const truncatedValue = valStr.substring(0, 40) + (valStr.length > 40 ? '...' : '');
            return `${key}: "${truncatedValue}"`;
        })
        .join(', ');
        
    return `(${formattedArgs})`;
};

interface AgentStepDisplayProps {
    step: AgentStep;
    isLast: boolean;
}

const AgentStepDisplay: React.FC<AgentStepDisplayProps> = ({ step, isLast }) => {
    const Icon = statusIcons[step.status];
    const argsFormatted = formatArgs(step.args);

    return (
        <div className="flex gap-3">
            <div className="flex flex-col items-center flex-shrink-0">
                <Icon className={`w-5 h-5 ${statusColors[step.status]}`} />
                {!isLast && <div className="w-px flex-1 bg-gray-700 my-1.5"></div>}
            </div>
            <div className={`flex-1 flex flex-col ${!isLast ? 'pb-4' : ''}`}>
                <div className="flex-1 text-sm -mt-0.5">
                    <span className="font-medium text-gray-300">{step.name}</span>
                    {argsFormatted &&
                        <span className="text-gray-400 ml-1.5 text-xs">
                           {argsFormatted}
                        </span>
                    }
                </div>
                {step.result && <div className="mt-1.5"><StepResult result={step.result} /></div>}
            </div>
        </div>
    );
};


const AgentState: React.FC<{ plan: AgentPlan }> = ({ plan }) => {
    const getHeader = () => {
        switch (plan.status) {
            case 'running':
                return { text: 'Executing Plan...', color: 'text-cyan-400', icon: InProgressIcon };
            case 'completed':
                 return { text: 'Plan Executed Successfully', color: 'text-green-500', icon: CheckCircleIcon };
            case 'failed':
                 return { text: 'Execution Failed', color: 'text-red-500', icon: XCircleIcon };
        }
    };
    const header = getHeader();

    return (
        <div className="w-full">
            <div className="border-b border-gray-700 pb-2 mb-3">
                <p className="text-xs text-gray-400">VEE is working on:</p>
                <h3 className="font-semibold text-gray-100">{plan.goal}</h3>
            </div>
            
            <div className="flex flex-col">
                {plan.steps.map((step, index) => (
                    <AgentStepDisplay key={step.id} step={step} isLast={index === plan.steps.length - 1}/>
                ))}
            </div>

            <div className={`flex items-center gap-2 mt-4 pt-3 border-t border-gray-700 text-sm font-medium ${header.color}`}>
                <header.icon className="w-5 h-5" />
                <span>{header.text}</span>
            </div>
        </div>
    );
};

export default AgentState;
