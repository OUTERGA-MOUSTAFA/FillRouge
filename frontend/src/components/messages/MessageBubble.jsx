import { useState } from 'react';
import { CheckIcon, ClockIcon } from '@heroicons/react/24/outline';

export default function MessageBubble({ message, isOwn }) {
  const [showTime, setShowTime] = useState(false);

  const formatTime = (date) => {
    return new Date(date).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
  };

  const isTemp = String(message.id).startsWith('temp-');

  return (
    <div className={`flex ${isOwn ? 'justify-end' : 'justify-start'} mb-1`}>
      <div className="max-w-[70%] group">
        <div
          className={`px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${
            isOwn
              ? 'bg-[#009966] text-white rounded-br-sm'
              : 'bg-gray-100 text-gray-900 rounded-bl-sm'
          }`}
          onMouseEnter={() => setShowTime(true)}
          onMouseLeave={() => setShowTime(false)}
        >
          <p className="break-words whitespace-pre-wrap">{message.content}</p>

          {/* Attachments */}
          {message.attachments?.length > 0 && (
            <div className="mt-2 space-y-1">
              {message.attachments.map((url, i) => (
                <a
                  key={i}
                  href={url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`block text-xs underline ${isOwn ? 'text-green-100' : 'text-blue-500'}`}
                >
                  📎 Attachment {i + 1}
                </a>
              ))}
            </div>
          )}

          {/* Time + status — inside the bubble, justify-between */}
          <div className="flex items-center justify-between gap-3 mt-1.5">
            <span
              className={`text-xs transition-opacity duration-150 ${
                isOwn ? 'text-green-200' : 'text-gray-400'
              } ${showTime || isTemp ? 'opacity-100' : 'opacity-0'}`}
            >
              {isTemp ? 'Sending...' : formatTime(message.created_at)}
            </span>

            {isOwn && !isTemp && (
              <span className={isOwn ? 'text-green-200' : 'text-gray-400'}>
                {message.is_read
                  ? <CheckIcon className="h-3 w-3 text-white" />
                  : <ClockIcon className="h-3 w-3" />
                }
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}