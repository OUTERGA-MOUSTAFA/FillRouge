import { useState, useCallback } from 'react';
import { messagesService } from '../services/messages';
import toast from 'react-hot-toast';

export function useMessages() {
  const [conversations, setConversations] = useState([]);
  const [currentConversation, setCurrentConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  
  const fetchConversations = useCallback(async () => {
    setLoading(true);
    try {
      const response = await messagesService.getConversations();
      setConversations(response.data);
    } catch (error) {
      toast.error('Erreur chargement conversations', error);
    } finally {
      setLoading(false);
    }
  }, []);
  
  const fetchConversation = useCallback(async (userId) => {
    setLoading(true);
    try {
      const response = await messagesService.getConversation(userId);
      setCurrentConversation(response.data.user);
      setMessages(response.data.messages);
    } catch (error) {
      toast.error('Erreur chargement conversation', error);
    } finally {
      setLoading(false);
    }
  }, []);
  
  const sendMessage = useCallback(async (userId, content, attachments = []) => {
    try {
      const response = await messagesService.send(userId, content, attachments);
      setMessages(prev => [...prev, response.data]);
      return response.data;
    } catch (error) {
      toast.error('Erreur envoi message');
      throw error;
    }
  }, []);
  
  return {
    conversations,
    currentConversation,
    messages,
    loading,
    fetchConversations,
    fetchConversation,
    sendMessage,
  };
}