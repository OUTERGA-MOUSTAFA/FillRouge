import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../src/store/authStore';
import { messagesService } from '../src/services/messages';
import ChatWindow from '../src/components/messages/ChatWindow';
import toast from 'react-hot-toast';

export default function Conversation() {
    const { userId } = useParams();
    const navigate = useNavigate();
    const { user } = useAuthStore();
    const [messages, setMessages] = useState([]);
    const [otherUser, setOtherUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [sending, setSending] = useState(false);

    const fetchConversation = useCallback(async () => {
        setLoading(true);
        try {
            const response = await messagesService.getConversation(userId);
            setOtherUser(response.data.user);
            setMessages(response.data.messages);
        } catch (error) {
            const message = error.response?.data?.message || 'Erreur chargement de la conversation';
            toast.error(message);
            navigate('/messages');
        } finally {
            setLoading(false);
        }
    }, [userId, navigate]);

    useEffect(() => {
        if (userId) {
            fetchConversation();
        }
    }, [userId, fetchConversation]);

    const handleSendMessage = async (content) => {
        setSending(true);
        try {
            const response = await messagesService.send(userId, content);
            setMessages(prev => [...prev, response.data]);
        } catch (error) {
            const message = error.response?.data?.message || 'Erreur envoi du message';
            toast.error(message);
        } finally {
            setSending(false);
        }
    };

    const handleSendAttachment = async (file) => {
        setSending(true);
        try {
            const response = await messagesService.send(userId, '', [file]);
            setMessages(prev => [...prev, response.data]);
        } catch (error) {
            const message = error.response?.data?.message || 'Erreur envoi de la pièce jointe';
            toast.error(message);
        } finally {
            setSending(false);
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500"></div>
            </div>
        );
    }

    if (!otherUser) {
        return (
            <div className="bg-white rounded-xl p-8 text-center">
                <p className="text-gray-500">Sélectionnez une conversation</p>
            </div>
        );
    }

    return (
        <ChatWindow
            messages={messages}
            currentUserId={user?.id}
            otherUser={otherUser}
            onSendMessage={handleSendMessage}
            onSendAttachment={handleSendAttachment}
            sending={sending}
        />
    );
}