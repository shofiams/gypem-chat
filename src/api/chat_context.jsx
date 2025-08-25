import React, { useState, useCallback } from 'react';
import { INITIAL_CHATS, INITIAL_MESSAGES, STARRED_MESSAGES, PINNED_MESSAGES } from './chat_constant';
import { ChatContext } from './use_chat_context';

export const ChatProvider = ({ children }) => {
  const [chats, setChats] = useState(INITIAL_CHATS);
  const [chatMessages, setChatMessages] = useState(INITIAL_MESSAGES);
  const [starredMessages, setStarredMessages] = useState(STARRED_MESSAGES);
  const [pinnedMessages, setPinnedMessages] = useState(PINNED_MESSAGES);
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
    const messages = chatMessages[parseInt(chatId)] || [];

    return messages.map(msg => ({
      ...msg,
      isPinned: Object.values(pinnedMessages).some(pin => 
        pin.chatId === parseInt(chatId) && pin.messageId === msg.id
      )
    }));
  }, [chatMessages, pinnedMessages]);

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
            lastMessageType: message.type,
            unreadCount: message.type === 'receiver' ? chat.unreadCount + 1 : chat.unreadCount
          }
        : chat
    ));
  }, []);

  // Get all starred messages for star page
  const getStarredMessages = useCallback(() => {
    return Object.keys(starredMessages)
      .map((starredId) => {
        const { chatId, messageId } = starredMessages[starredId];
        const chat = chats.find((c) => c.id === chatId);
        const message = chatMessages[chatId]?.find((m) => m.id === messageId);

        if (!chat || !message) return null;

        return {
          id: parseInt(starredId),
          chatId,
          messageId,
          chatName: chat.name,
          message: message.message || message.file?.name || "Media",
          sender: message.sender,
          time: message.time,
          chatType: chat.type,
        };
      })
      .filter(Boolean);
  }, [starredMessages, chats, chatMessages]);

  // Add/remove starred message
  const toggleStarMessage = useCallback((chatId, messageId) => {
    const chatIdNum = parseInt(chatId);
    const isCurrentlyStarred = Object.values(starredMessages).some(star => 
      star.chatId === chatIdNum && star.messageId === messageId
    );

    setStarredMessages(prev => {
      const starKey = Object.keys(prev).find(key => 
        prev[key].chatId === chatIdNum && prev[key].messageId === messageId
      );
      
      if (starKey) {
        // Remove star
        const newStarred = { ...prev };
        delete newStarred[starKey];
        return newStarred;
      } else {
        // Add star
        const newId = Math.max(...Object.keys(prev).map(k => parseInt(k)), 0) + 1;
        return {
          ...prev,
          [newId]: { chatId: chatIdNum, messageId }
        };
      }
    });

    setChatMessages(prev => ({
      ...prev,
      [chatIdNum]: prev[chatIdNum]?.map(msg => 
        msg.id === messageId ? { ...msg, isStarred: !isCurrentlyStarred } : msg
      ) || []
    }));
  }, [starredMessages]);

  // Check if message is starred
  const isMessageStarred = useCallback((chatId, messageId) => {
    return Object.values(starredMessages).some(star => 
      star.chatId === parseInt(chatId) && star.messageId === messageId
    );
  }, [starredMessages]);

  // Get all pinned messages
  const getPinnedMessage = useCallback(() => {
    return Object.keys(pinnedMessages)
      .map((pinnedId) => {
        const { chatId, messageId } = pinnedMessages[pinnedId];
        const chat = chats.find((c) => c.id === chatId);
        const message = chatMessages[chatId]?.find((m) => m.id === messageId);

        if (!chat || !message) return null;

        return{
          id: parseInt(pinnedId),
          chatId,
          messageId,
          chatName: chat.name,
          message: message.message || message.file?.name,
          sender: message.sender,
          time: message.time,
          chatType: chat.type,
        }
      })
      .filter(Boolean);
  }, [pinnedMessages, chats, chatMessages]);

  // Check if message is pinned
  const isMessagePinned = useCallback((chatId, messageId) => {
    return Object.values(pinnedMessages).some(pin => 
      pin.chatId === parseInt(chatId) && pin.messageId === messageId
    );
  }, [pinnedMessages]);

  // Add/remove pinned message
  const togglePinMessage = useCallback((chatId, messageId) => {
    const chatIdNum = parseInt(chatId);
    const isCurrentlyPinned = Object.values(pinnedMessages).some(pin => 
      pin.chatId === chatIdNum && pin.messageId === messageId
    );

    setPinnedMessages(prev => {
      const pinKey = Object.keys(prev).find(key => 
        prev[key].chatId === chatIdNum && prev[key].messageId === messageId
      );
      
      if (pinKey) {
        // Remove pin
        const newPinned = { ...prev };
        delete newPinned[pinKey];
        return newPinned;
      } else {
        // Add pin
        const newId = Math.max(...Object.keys(prev).map(k => parseInt(k)), 0) + 1;
        return {
          ...prev,
          [newId]: { chatId: chatIdNum, messageId }
        };
      }
    });

    setChatMessages(prev => ({
      ...prev,
      [chatIdNum]: prev[chatIdNum]?.map(msg => 
        msg.id === messageId ? { ...msg, isPinned: !isCurrentlyPinned } : msg
      ) || []
    }));
  }, [pinnedMessages]);

  // Search All Messages in all chats/rooms
  const searchAllMessages = useCallback((query) => {
    if (!query.trim()) return { oneToOneChats: [], groupChats: [], messages: [] };
    
    const q = query.trim().toLowerCase();
    const tokens = q.split(/\s+/).filter(Boolean);
    
    const oneToOneChats = [];
    const groupChats = [];
    const messages = [];
    
    chats.forEach(chat => {
      const chatNameMatches = tokens.every(tok => chat.name.toLowerCase().includes(tok));
      
      if (chatNameMatches) {
        if (chat.type === 'group') {
          groupChats.push(chat);
        } else {
          oneToOneChats.push(chat);
        }
      }
      
      // Check ALL messages in this chat (including last message)
      const messagesInChat = chatMessages[chat.id] || [];
      messagesInChat.forEach(message => {
        const searchText = (message.message || message.file?.name || '').toLowerCase();
        
        const matches = tokens.every(token => searchText.includes(token));
        
        if (matches) {
          messages.push({
            id: `${chat.id}-${message.id}`,
            chatId: chat.id,
            messageId: message.id,
            chatName: chat.name,
            message: message.message || message.file?.name || 'Media',
            sender: message.sender,
            time: message.time,
            chatType: chat.type,
            type: 'message'
          });
        }
      });
    });
    
    return { oneToOneChats, groupChats, messages };
  }, [chats, chatMessages]);

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

  // add new chat
  const createNewChat = (chatData) => {
    const newChatId = Math.max(...chats.map(c => c.id), 0) + 1;
    
    const newChat = {
      id: newChatId, 
      lastMessage: "", 
      time: new Date().toLocaleTimeString('id-ID', { 
        hour: '2-digit', 
        minute: '2-digit',
        hour12: false 
      }).replace(':', '.'),
      unreadCount: 0,
      isOnline: false,
      showCentang: false,
      showCentangAbu: false,
      type: "one-to-one", 
      ...chatData, 
    };
    
    setChats(prevChats => [...prevChats, newChat]);
    
    // Initialize empty messages array for new chat
    setChatMessages(prev => ({
      ...prev,
      [newChatId]: []
    }));
    
    return newChatId;
  };

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
    createNewChat,
    deleteChat,
    markChatAsRead,
    updateChatOnlineStatus,
    setActiveChat,
    clearActiveChat,
    
    // Message operations
    searchAllMessages,
    getChatMessages,
    addMessage,
    deleteMessage,
    updateMessage,

    // Starred messages operations
    getStarredMessages,
    toggleStarMessage,
    isMessageStarred,

    // Pinned messages operations
    getPinnedMessage,
    togglePinMessage,
    isMessagePinned,
  };

  return (
    <ChatContext.Provider value={value}>
      {children}
    </ChatContext.Provider>
  );
};