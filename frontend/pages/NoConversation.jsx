import { ChatBubbleLeftRightIcon } from '@heroicons/react/24/outline';

export default function NoConversation() {
  return (
    <div className="flex-1 flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="h-16 w-16 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-4">
          <ChatBubbleLeftRightIcon className="h-8 w-8 text-gray-400" />
        </div>
        <h3 className="text-gray-700 font-medium">Your messages</h3>
        <p className="text-sm text-gray-400 mt-1">Select a conversation to start chatting</p>
      </div>
    </div>
  );
}