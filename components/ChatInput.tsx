import React, { useState, useRef, KeyboardEvent, useEffect } from 'react';

interface ChatInputProps {
  onSendMessage: (message: string, files: File[]) => void;
  isLoading: boolean;
  isScreenSharing: boolean;
  onToggleScreenShare: () => void;
}

// Whitelist of MIME types supported by the Gemini API for multimodal input.
const SUPPORTED_MIME_TYPES = [
  // Images
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/heic',
  'image/heif',
  // Text
  'text/plain',
  'text/html',
  'text/css',
  'text/javascript',
  'application/x-javascript',
  'text/x-typescript',
  'application/x-typescript',
  'text/csv',
  'text/markdown',
  'text/x-python',
  'application/x-python-code',
  'application/json',
  'text/xml',
  'application/rtf',
  'text/rtf',
  // Audio
  'audio/mpeg',
  'audio/mp3',
  'audio/wav',
  'audio/aac',
  'audio/ogg',
  'audio/flac',
  // Video
  'video/mp4',
  'video/mpeg',
  'video/mov',
  'video/avi',
  'video/x-flv',
  'video/mpg',
  'video/webm',
  'video/wmv',
  'video/3gpp',
  // Documents
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
];


const SendIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}>
        <path d="M3.478 2.405a.75.75 0 00-.926.94l2.432 7.905H13.5a.75.75 0 010 1.5H4.984l-2.432 7.905a.75.75 0 00.926.94 60.519 60.519 0 0018.445-8.986.75.75 0 000-1.218A60.517 60.517 0 003.478 2.405z" />
    </svg>
);

const PaperclipIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}>
        <path fillRule="evenodd" d="M18.97 3.659a2.25 2.25 0 00-3.182 0l-10.12 10.12a2.25 2.25 0 000 3.182 2.25 2.25 0 003.182 0l7.258-7.257a.75.75 0 011.06 1.06l-7.258 7.257a3.75 3.75 0 11-5.303-5.303l10.12-10.12a3.75 3.75 0 115.303 5.303l-7.943 7.942a.75.75 0 11-1.06-1.06l7.943-7.942a2.25 2.25 0 00-3.182-3.182l-10.12 10.12a.75.75 0 000 1.06.75.75 0 001.06 0l10.12-10.12a.75.75 0 000-1.06l-2.08-2.08z" clipRule="evenodd" />
    </svg>
);

const XMarkIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}>
    <path d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z" />
  </svg>
);

const MicrophoneIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}>
        <path d="M8.25 4.5a3.75 3.75 0 117.5 0v8.25a3.75 3.75 0 11-7.5 0V4.5z" />
        <path d="M6 10.5a.75.75 0 01.75.75v1.5a5.25 5.25 0 1010.5 0v-1.5a.75.75 0 011.5 0v1.5a6.75 6.75 0 11-13.5 0v-1.5A.75.75 0 016 10.5z" />
    </svg>
);

const ScreenShareIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}>
        <path d="M2.25 5.25v13.5a.75.75 0 00.75.75h17.5a.75.75 0 00.75-.75V5.25a.75.75 0 00-.75-.75H3a.75.75 0 00-.75.75zM12 8.25a.75.75 0 01.75.75v3.25l1.22-1.22a.75.75 0 111.06 1.06l-2.5 2.5a.75.75 0 01-1.06 0l-2.5-2.5a.75.75 0 111.06-1.06l1.22 1.22V9a.75.75 0 01.75-.75z" />
    </svg>
);

const ChatInput: React.FC<ChatInputProps> = ({ onSendMessage, isLoading, isScreenSharing, onToggleScreenShare }) => {
  const [inputValue, setInputValue] = useState('');
  const [files, setFiles] = useState<File[]>([]);
  const [isRecording, setIsRecording] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const recognitionRef = useRef<any>(null); // SpeechRecognition instance

  const isSpeechRecognitionSupported = 'SpeechRecognition' in window || 'webkitSpeechRecognition' in window;

  useEffect(() => {
    if (!isSpeechRecognitionSupported) return;

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    recognitionRef.current = new SpeechRecognition();
    const recognition = recognitionRef.current;
    
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'en-US';

    recognition.onresult = (event: any) => {
        const transcript = Array.from(event.results)
            .map((result: any) => result[0])
            .map((result) => result.transcript)
            .join('');
        setInputValue(transcript);
    };

    recognition.onend = () => {
        setIsRecording(false);
    };

    recognition.onerror = (event: any) => {
        console.error('Speech recognition error:', event.error);
        setIsRecording(false);
    };

    return () => {
        if (recognitionRef.current) {
            recognitionRef.current.stop();
        }
    };
  }, [isSpeechRecognitionSupported]);

  const handleToggleRecording = () => {
    if (!recognitionRef.current) return;
    if (isRecording) {
        recognitionRef.current.stop();
    } else {
        setInputValue('');
        recognitionRef.current.start();
    }
    setIsRecording(!isRecording);
  };
  
  const handleInputChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInputValue(event.target.value);
  };

  useEffect(() => {
    if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
        textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [inputValue]);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      const allFiles = Array.from(event.target.files);
      const acceptedFiles: File[] = [];
      const rejectedFiles: File[] = [];

      allFiles.forEach((file: unknown) => {
        if (file instanceof File && SUPPORTED_MIME_TYPES.includes(file.type)) {
          acceptedFiles.push(file);
        } else {
          rejectedFiles.push(file as File);
        }
      });

      if (rejectedFiles.length > 0) {
        const rejectedFileNames = rejectedFiles.map(f => f.name).join(', ');
        alert(`Unsupported file type for: ${rejectedFileNames}.\n\nPlease upload supported image, video, audio, or text files.`);
      }
      
      if (acceptedFiles.length > 0) {
        setFiles(prev => [...prev, ...acceptedFiles]);
      }
    }
  };

  const removeFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = () => {
    if ((inputValue.trim() || files.length > 0 || isScreenSharing) && !isLoading) {
      onSendMessage(inputValue, files);
      setInputValue('');
      setFiles([]);
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
      }
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      handleSubmit();
    }
  };

  return (
    <div className="bg-gray-800 rounded-xl border border-gray-700 focus-within:ring-2 focus-within:ring-indigo-500 transition-shadow duration-200">
      {files.length > 0 && (
        <div className="p-2 border-b border-gray-700">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {files.map((file, index) => (
              <div key={index} className="flex items-center justify-between bg-gray-700 p-1.5 rounded-md text-sm">
                <span className="text-gray-300 truncate pl-1" title={file.name}>{file.name}</span>
                <button 
                  onClick={() => removeFile(index)} 
                  className="p-1 rounded-full hover:bg-gray-600 text-gray-400 hover:text-white transition-colors"
                  aria-label={`Remove ${file.name}`}
                >
                  <XMarkIcon className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
      <div className="flex items-end gap-2 p-2">
        <input 
          type="file" 
          multiple 
          ref={fileInputRef} 
          onChange={handleFileChange} 
          className="hidden" 
          disabled={isLoading}
          accept={SUPPORTED_MIME_TYPES.join(',')}
        />
        <button
          onClick={() => fileInputRef.current?.click()}
          disabled={isLoading}
          className="w-10 h-10 flex items-center justify-center rounded-full text-gray-400 disabled:text-gray-600 disabled:cursor-not-allowed hover:text-indigo-400 transition-colors duration-200 flex-shrink-0"
          aria-label="Attach files"
        >
          <PaperclipIcon className="w-5 h-5"/>
        </button>
        <textarea
          ref={textareaRef}
          value={inputValue}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          placeholder={isRecording ? "Listening..." : "Ask about your archive, or try /imagine..."}
          className="flex-1 bg-transparent border-none focus:ring-0 resize-none text-gray-200 placeholder-gray-500 max-h-40 p-2"
          rows={1}
          disabled={isLoading}
        />
        <button
          onClick={onToggleScreenShare}
          disabled={isLoading}
          className={`w-10 h-10 flex items-center justify-center rounded-full transition-colors duration-200 flex-shrink-0 ${
            isScreenSharing
              ? 'bg-red-600 text-white animate-pulse'
              : 'text-gray-400 disabled:text-gray-600 disabled:cursor-not-allowed hover:text-indigo-400'
          }`}
          aria-label={isScreenSharing ? 'Stop sharing screen' : 'Share screen'}
        >
          <ScreenShareIcon className="w-5 h-5" />
        </button>
        {isSpeechRecognitionSupported && (
            <button
              onClick={handleToggleRecording}
              disabled={isLoading}
              className={`w-10 h-10 flex items-center justify-center rounded-full transition-colors duration-200 flex-shrink-0 ${
                isRecording
                  ? 'bg-red-600 text-white animate-pulse'
                  : 'text-gray-400 disabled:text-gray-600 disabled:cursor-not-allowed hover:text-indigo-400'
              }`}
              aria-label={isRecording ? 'Stop recording' : 'Start recording'}
            >
              <MicrophoneIcon className="w-5 h-5" />
            </button>
        )}
        <button
          onClick={handleSubmit}
          disabled={isLoading || (!inputValue.trim() && files.length === 0 && !isScreenSharing)}
          className="w-10 h-10 flex items-center justify-center rounded-full bg-indigo-600 text-white disabled:bg-gray-600 disabled:cursor-not-allowed hover:bg-indigo-500 transition-colors duration-200 flex-shrink-0"
          aria-label="Send message"
        >
          <SendIcon className="w-5 h-5"/>
        </button>
      </div>
    </div>
  );
};

export default ChatInput;