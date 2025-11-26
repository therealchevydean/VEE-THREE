
import React from 'react';
import { Message, Role } from '../types';
import AgentState from './AgentState';

interface ChatMessageProps {
  message: Message;
}

const UserIcon: React.FC = () => (
  <div className="w-8 h-8 rounded-full bg-indigo-500 flex items-center justify-center font-bold text-white text-sm flex-shrink-0">
    JE
  </div>
);

const VeeIcon: React.FC = () => (
    <div className="w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center flex-shrink-0 border border-gray-600">
     <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 text-cyan-400">
       <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 14.5V15c0-.55.45-1 1-1s1 .45 1 1v1.5c0 .28-.22.5-.5.5s-.5-.22-.5-.5V15h-1v1.5c0 .83-.67 1.5-1.5 1.5S9 17.33 9 16.5v-3c0-.83.67-1.5 1.5-1.5s1.5.67 1.5 1.5V15h-1v-1.5c0-.28.22-.5.5-.5s.5.22.5.5V15c0 .55-.45 1-1 1s-1-.45-1-1v-1.5c0-1.38 1.12-2.5 2.5-2.5s2.5 1.12 2.5 2.5v3c0 1.38-1.12 2.5-2.5 2.5S11 17.88 11 16.5z"/>
     </svg>
    </div>
);

const LoadingIndicator: React.FC = () => (
    <div className="flex items-center space-x-2">
        <div className="w-2 h-2 bg-cyan-400 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
        <div className="w-2 h-2 bg-cyan-400 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
        <div className="w-2 h-2 bg-cyan-400 rounded-full animate-bounce"></div>
    </div>
);

const DocumentIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}>
        <path fillRule="evenodd" d="M3.75 3A2.25 2.25 0 001.5 5.25v13.5A2.25 2.25 0 003.75 21h16.5A2.25 2.25 0 0022.5 18.75V8.25A2.25 2.25 0 0020.25 6H12A2.25 2.25 0 019.75 3.75V3H3.75zm6 0v3.75c0 .621.504 1.125 1.125 1.125h6.75v1.5h-6.75A2.625 2.625 0 019.75 8.25V4.5h-3.375A.375.375 0 016 4.125V3h3.75z" clipRule="evenodd" />
    </svg>
);

const SaveIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}>
      <path d="M5 4.5A2.5 2.5 0 017.5 2h5A2.5 2.5 0 0115 4.5v11a.5.5 0 01-.854.354L10 11.707l-4.146 4.147A.5.5 0 015 15.5v-11z" />
    </svg>
);

const GroundingSources: React.FC<{ sources: any[] }> = ({ sources }) => {
    if (!sources || sources.length === 0) return null;

    const parsedSources = sources.map((chunk) => {
        const source = chunk.web || chunk.maps;
        if (source && source.uri) {
            return {
                uri: source.uri,
                title: source.title || new URL(source.uri).hostname,
            };
        }
        return null;
    }).filter(Boolean);

    if (parsedSources.length === 0) return null;

    return (
        <div className="mt-3 border-t border-gray-500 pt-3">
            <h4 className="text-xs font-semibold text-gray-300 mb-2">Sources:</h4>
            <ul className="space-y-1.5 list-none p-0">
                {parsedSources.map((source, index) => (
                    <li key={index} className="text-sm">
                        <a href={source.uri} target="_blank" rel="noopener noreferrer" className="text-cyan-300 hover:underline flex items-center gap-2">
                           <span className="truncate">{source.title}</span>
                        </a>
                    </li>
                ))}
            </ul>
        </div>
    );
};

const ChatMessage: React.FC<ChatMessageProps> = ({ message }) => {
  const isUser = message.role === Role.USER;
  const isLoading = message.role === Role.LOADING;

  const wrapperClasses = `group flex items-start gap-3 w-full ${isUser ? 'flex-row-reverse' : 'flex-row'}`;
  
  // High contrast for VEE: Lighter gray background, white text, and a border to separate from the main background.
  const messageClasses = `max-w-xl p-4 rounded-2xl flex flex-col relative shadow-sm ${
    isUser
      ? 'bg-indigo-600 text-white rounded-br-none shadow-md'
      : 'bg-gray-700 text-white border border-gray-600 rounded-bl-none shadow-md' 
  }`;

  return (
    <div className={wrapperClasses}>
      {!isUser && <VeeIcon />}
      <div className={messageClasses}>
        {isLoading ? (
          <div className="flex items-center gap-3">
            <LoadingIndicator />
            {message.content && <p className="text-gray-300 italic text-sm">{message.content}</p>}
          </div>
        ) : (
          <>
            {message.agentPlan ? (
              <AgentState plan={message.agentPlan} />
            ) : (
              <>
                {message.imageUrl && (
                  <img 
                    src={message.imageUrl} 
                    alt="Generated content" 
                    className="rounded-lg mb-2 max-w-full h-auto border border-gray-500" 
                  />
                )}
                {message.videoUrl && (
                  <video 
                      src={message.videoUrl} 
                      controls 
                      className="rounded-lg mb-2 max-w-full h-auto border border-gray-500"
                  >
                      Your browser does not support the video tag.
                  </video>
                )}
                {message.content && (
                  <div className="prose prose-invert prose-sm max-w-none text-gray-50" dangerouslySetInnerHTML={{ __html: formatContent(message.content) }}></div>
                )}
                {message.groundingSources && <GroundingSources sources={message.groundingSources} />}
              </>
            )}
          </>
        )}
        {message.files && message.files.length > 0 && (
            <div className="mt-3 border-t border-indigo-400/50 pt-3 space-y-2">
                {message.files.map((file, index) => (
                    <div key={index} className="flex items-center gap-2 text-xs text-indigo-100 bg-indigo-500/50 p-2 rounded-md">
                        <DocumentIcon className="w-4 h-4 flex-shrink-0" />
                        <span className="truncate" title={file.name}>{file.name}</span>
                    </div>
                ))}
            </div>
        )}
      </div>
      {isUser && <UserIcon />}
    </div>
  );
};

// Basic markdown-like formatting for code blocks and lists
const formatContent = (content: string) => {
    // Escape HTML to prevent XSS
    const escapeHtml = (unsafe: string) => {
        return unsafe
             .replace(/&/g, "&amp;")
             .replace(/</g, "&lt;")
             .replace(/>/g, "&gt;")
             .replace(/"/g, "&quot;")
             .replace(/'/g, "&#039;");
    };

    let formatted = escapeHtml(content);

    // Code blocks
    formatted = formatted.replace(/```([\s\S]*?)```/g, (match, code) => {
        const lines = code.split('\n');
        const language = lines[0].trim();
        const codeContent = lines.slice(1).join('\n').trim();
        return `<pre class="bg-gray-900 border border-gray-600 rounded-lg p-4 my-2 overflow-x-auto"><code class="language-${language} text-gray-200">${codeContent}</code></pre>`;
    });

    // Inline code
    formatted = formatted.replace(/`([^`]+)`/g, '<code class="bg-gray-800 border border-gray-600 text-cyan-300 rounded px-1.5 py-0.5">$1</code>');
    
    // Bold
    formatted = formatted.replace(/\*\*(.*?)\*\*/g, '<strong class="text-white font-bold">$1</strong>');
    
    // Hyperlinks
    formatted = formatted.replace(/\[([^\]]+)\]\(([^)]+)\)/g, (match, text, url) => {
        // Whitelist protocols to prevent XSS. `text` is already escaped by `escapeHtml`.
        if (url.startsWith('https://') || url.startsWith('http://') || url.startsWith('mailto:')) {
            const attributes = url.startsWith('mailto:')
                ? `href="${url}"`
                : `href="${url}" target="_blank" rel="noopener noreferrer"`;
            
            return `<a ${attributes} class="text-cyan-400 hover:text-cyan-300 hover:underline font-medium">${text}</a>`;
        }
        return match; 
    });

    // Lists
    formatted = formatted.replace(/^\s*[-*]\s+(.*)/gm, '<li class="ml-4 list-disc text-gray-100">$1</li>');
    formatted = formatted.replace(/(<li>.*<\/li>)/gs, '<ul class="my-2">$1</ul>');

    // Newlines
    formatted = formatted.replace(/\n/g, '<br />');

    return formatted;
}

export default ChatMessage;
