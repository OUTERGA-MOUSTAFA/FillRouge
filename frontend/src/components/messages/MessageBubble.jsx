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
        </div>

        {/* Time + status */}
        <div className={`flex items-center gap-1 mt-0.5 px-1 ${isOwn ? 'justify-end' : 'justify-start'}`}>
          {(showTime || isTemp) && (
            <span className="text-xs text-gray-400">
              {isTemp ? 'Sending...' : formatTime(message.created_at)}
            </span>
          )}
          {isOwn && !isTemp && (
            <span className="text-gray-400">
              {message.is_read
                ? <CheckIcon className="h-3 w-3 text-[#009966]" />
                : <ClockIcon className="h-3 w-3" />
              }
            </span>
          )}
        </div>
      </div>
    </div>
  );
}