import { ChatBubbleLeftRightIcon } from '@heroicons/react/24/outline';
import { useTranslation } from 'react-i18next';

export default function NoConversation() {
  const { t } = useTranslation();
  return (
    <div className="flex-1 flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="h-16 w-16 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-4">
          <ChatBubbleLeftRightIcon className="h-8 w-8 text-gray-400" />
        </div>
        <h3 className="text-gray-700 font-medium">{t('messages.no_conv.title')}</h3>
        <p className="text-sm text-gray-400 mt-1">{t('messages.no_conv.subtitle')}</p>
      </div>
    </div>
  );
}