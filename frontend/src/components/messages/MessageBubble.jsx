import { useState } from 'react';
import { CheckIcon, ClockIcon } from '@heroicons/react/24/outline';

export default function MessageBubble({ message, isOwn }) {
  const [showDetails, setShowDetails] = useState(false);

  const formatTime = (date) => {
    return new Date(date).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}>
      <div
        className={`max-w-[70%] ${isOwn ? 'bg-primary-500 text-white' : 'bg-gray-100 text-gray-900'} rounded-2xl px-4 py-2`}
        onMouseEnter={() => setShowDetails(true)}
        onMouseLeave={() => setShowDetails(false)}
      >
        <p className="break-words">{message.content}</p>
        
        {/* Attachments */}
        {message.attachments && message.attachments.length > 0 && (
          <div className="mt-2 flex gap-2">
            {message.attachments.map((attachment, index) => (
              <a
                key={index}
                href={attachment}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs underline opacity-80 hover:opacity-100"
              >
                📎 Pièce jointe {index + 1}
              </a>
            ))}
          </div>
        )}
        
        {/* Timestamp & status */}
        {showDetails && (
          <div className={`text-xs mt-1 flex items-center gap-1 ${isOwn ? 'text-primary-200' : 'text-gray-400'}`}>
            <span>{formatTime(message.created_at)}</span>
            {isOwn && (
              message.is_read ? (
                <CheckIcon className="h-3 w-3" />
              ) : (
                <ClockIcon className="h-3 w-3" />
              )
            )}
          </div>
        )}
      </div>
    </div>
  );
}