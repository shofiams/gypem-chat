import React, { useState, useCallback } from 'react';
import { INITIAL_CHATS, INITIAL_MESSAGES } from './chat_constant';
import { ChatContext } from './use_chat_context';

export const ChatProvider = ({ children }) => {
  const [chats, setChats] = useState(INITIAL_CHATS);
  const [chatMessages, setChatMessages] = useState(INITIAL_MESSAGES);
  const [activeChatId, setActiveChatId] = useState(null);

  // Get all chats
  const getAllChats = useCallback(() => {
    return chats;
  }, [chats]);

  // Get specific chat by ID
  const getChatById = useCallback((chatId) => {
    return chats.find(chat => chat.id === parseInt(chatId));
  }, [chats]);

  // Get messages for specific chat
  const getChatMessages = useCallback((chatId) => {
    return chatMessages[parseInt(chatId)] || [];
  }, [chatMessages]);

  // Add new message to specific chat
  const addMessage = useCallback((chatId, message) => {
    const id = parseInt(chatId);
    setChatMessages(prev => ({
      ...prev,
      [id]: [...(prev[id] || []), { ...message, id: Date.now() }]
    }));

    // Update last message in chat list
    setChats(prev => prev.map(chat => 
      chat.id === id 
        ? { 
            ...chat, 
            lastMessage: message.message || message.file?.name || "Media",
            time: message.time,
            unreadCount: message.type === 'receiver' ? chat.unreadCount + 1 : chat.unreadCount
          }
        : chat
    ));
  }, []);

  // Delete message from specific chat
  const deleteMessage = useCallback((chatId, messageId) => {
    const id = parseInt(chatId);
    setChatMessages(prev => ({
      ...prev,
      [id]: prev[id]?.filter(msg => msg.id !== messageId) || []
    }));
  }, []);

  // Update message in specific chat
  const updateMessage = useCallback((chatId, messageId, updates) => {
    const id = parseInt(chatId);
    setChatMessages(prev => ({
      ...prev,
      [id]: prev[id]?.map(msg => 
        msg.id === messageId ? { ...msg, ...updates } : msg
      ) || []
    }));
  }, []);

  // Delete entire chat
  const deleteChat = useCallback((chatId) => {
    const id = parseInt(chatId);
    setChats(prev => prev.filter(chat => chat.id !== id));
    setChatMessages(prev => {
      const newMessages = { ...prev };
      delete newMessages[id];
      return newMessages;
    });
  }, []);

  // Mark chat as read
  const markChatAsRead = useCallback((chatId) => {
    const id = parseInt(chatId);
    setChats(prev => prev.map(chat => 
      chat.id === id ? { ...chat, unreadCount: 0 } : chat
    ));
  }, []);

  // Update chat online status (for real-time updates)
  const updateChatOnlineStatus = useCallback((chatId, isOnline) => {
    const id = parseInt(chatId);
    setChats(prev => prev.map(chat => 
      chat.id === id ? { ...chat, isOnline } : chat
    ));
  }, []);

  // Set active chat
  const setActiveChat = useCallback((chatId) => {
    setActiveChatId(chatId);
  }, []);

  // Clear active chat
  const clearActiveChat = useCallback(() => {
    setActiveChatId(null);
  }, []);

  const value = {
    // Data
    chats,
    chatMessages,
    activeChatId,
    
    // Chat operations
    getAllChats,
    getChatById,
    deleteChat,
    markChatAsRead,
    updateChatOnlineStatus,
    setActiveChat,
    clearActiveChat,
    
    // Message operations
    getChatMessages,
    addMessage,
    deleteMessage,
    updateMessage,
  };

  return (
    <ChatContext.Provider value={value}>
      {children}
    </ChatContext.Provider>
  );
};