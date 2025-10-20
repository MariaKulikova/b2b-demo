import { useEffect, useRef } from 'react';
import { X, Copy, Check } from 'lucide-react';
import { Button } from './ui/button';
import { useState } from 'react';

/**
 * Modal component for displaying full conversation transcript
 * @param {Object} props
 * @param {boolean} props.isOpen - Whether modal is open
 * @param {Function} props.onClose - Callback to close modal
 * @param {Array} props.messages - Array of message objects {role: 'user'|'ai', text: string, timestamp: Date}
 */
const TranscriptModal = ({ isOpen, onClose, messages }) => {
  const [copied, setCopied] = useState(false);
  const messagesEndRef = useRef(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (isOpen && messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen]);

  // Handle copy to clipboard
  const handleCopy = () => {
    const transcriptText = messages
      .map(msg => {
        const time = msg.timestamp.toLocaleTimeString();
        const role = msg.role === 'user' ? 'You' : 'AI Assistant';
        return `[${time}] ${role}: ${msg.text}`;
      })
      .join('\n\n');

    navigator.clipboard.writeText(transcriptText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Format timestamp
  const formatTime = (date) => {
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (!isOpen) return null;

  return (
    // Overlay
    <div className="fixed inset-0 bg-black/50 z-[100] flex items-center justify-center p-4">
      {/* Modal */}
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[80vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Conversation Transcript</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors p-1.5 hover:bg-gray-100 rounded-full"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Messages Content - Scrollable */}
        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
          {messages.length === 0 ? (
            <div className="text-center text-gray-500 py-8">
              <p>No messages yet. Start talking to see the transcript.</p>
            </div>
          ) : (
            messages.map((message, index) => (
              <div
                key={index}
                className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[80%] rounded-lg px-4 py-2 ${
                    message.role === 'user'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-900'
                  }`}
                >
                  {/* Role label */}
                  <div className={`text-xs font-semibold mb-1 ${
                    message.role === 'user' ? 'text-blue-100' : 'text-gray-600'
                  }`}>
                    {message.role === 'user' ? 'You' : 'AI Assistant'}
                  </div>

                  {/* Message text */}
                  <div className="text-sm whitespace-pre-wrap break-words">
                    {message.text}
                  </div>

                  {/* Timestamp */}
                  <div className={`text-xs mt-1 ${
                    message.role === 'user' ? 'text-blue-200' : 'text-gray-500'
                  }`}>
                    {formatTime(message.timestamp)}
                  </div>
                </div>
              </div>
            ))
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-gray-200 bg-gray-50">
          <div className="text-sm text-gray-600">
            {messages.length} {messages.length === 1 ? 'message' : 'messages'}
          </div>

          <div className="flex gap-2">
            <Button
              onClick={handleCopy}
              variant="outline"
              size="sm"
              disabled={messages.length === 0}
              className="gap-2"
            >
              {copied ? (
                <>
                  <Check className="h-4 w-4" />
                  Copied!
                </>
              ) : (
                <>
                  <Copy className="h-4 w-4" />
                  Copy Transcript
                </>
              )}
            </Button>

            <Button onClick={onClose} size="sm">
              Close
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TranscriptModal;
