import api from './api';

export const messagesService = {
  getConversations: async () => {
    const response = await api.get('/messages/conversations');
    return response.data;
  },
  
  getConversation: async (userId) => {
    const response = await api.get(`/messages/${userId}`);
    return response.data;
  },
  
  send: async (userId, content, attachments = []) => {
    const formData = new FormData();
    formData.append('content', content);
    attachments.forEach(file => formData.append('attachments[]', file));
    const response = await api.post(`/messages/${userId}`, formData);
    return response.data;
  },
  
  markAsRead: async (messageId) => {
    const response = await api.put(`/messages/${messageId}/read`);
    return response.data;
  },
  
  delete: async (messageId) => {
    const response = await api.delete(`/messages/${messageId}`);
    return response.data;
  },
  
  report: async (messageId, reason) => {
    const response = await api.post(`/messages/${messageId}/report`, { reason });
    return response.data;
  },
};