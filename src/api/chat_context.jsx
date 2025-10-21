// src/api/chat_context.jsx
import React, { useState, useCallback, useEffect } from 'react';
import { INITIAL_CHATS, INITIAL_MESSAGES, STARRED_MESSAGES, PINNED_MESSAGES } from './chat_constant';
import { ChatContext } from './use_chat_context';

export const ChatProvider = ({ children }) => {
  const [chats, setChats] = useState(INITIAL_CHATS);
  const [chatMessages, setChatMessages] = useState(INITIAL_MESSAGES);
  const [starredMessages, setStarredMessages] = useState(STARRED_MESSAGES);
  const [pinnedMessages, setPinnedMessages] = useState(PINNED_MESSAGES);
  const [activeChatId, setActiveChatId] = useState(null);
  const [socket, setSocket] = useState(null);
  const [onlineUsers, setOnlineUsers] = useState(new Map());
  const [typingUsers, setTypingUsers] = useState(new Map()); // <-- State baru untuk typing

  // EFEK UNTUK MENDENGARKAN SEMUA EVENT DARI SOCKET
  useEffect(() => {
    if (!socket) return;

    // --- EVENT UNTUK PESAN ---
    const handleNewMessage = (newMessage) => {
      console.log('Received newMessage event:', newMessage);
      window.dispatchEvent(new CustomEvent('chatListRefresh'));
      if (newMessage.room_id === activeChatId) {
         window.dispatchEvent(new CustomEvent('messagesUpdated', { detail: { roomId: newMessage.room_id } }));
      }
    };

    const handleMessageEdited = (editedMessage) => {
      console.log('Received messageEdited event:', editedMessage);
      window.dispatchEvent(new CustomEvent('chatListRefresh'));
      if (editedMessage.room_id === activeChatId) {
         window.dispatchEvent(new CustomEvent('messagesUpdated', { detail: { roomId: editedMessage.room_id } }));
      }
    };

    const handleMessageDeleted = (deletedData) => {
      console.log('Received messageDeleted event:', deletedData);
      window.dispatchEvent(new CustomEvent('chatListRefresh'));
      if (deletedData.room_id === activeChatId) {
        window.dispatchEvent(new CustomEvent('messagesUpdated', { detail: { roomId: deletedData.room_id } }));
      }
    };

    // --- EVENT UNTUK STATUS ONLINE ---
    const handleInitialOnlineUsers = (users) => {
        console.log('Received initialOnlineUsers:', users);
        setOnlineUsers(prev => {
            const newMap = new Map();
            users.forEach(user => {
                const key = `${user.type}-${user.id}`;
                newMap.set(key, user);
            });
            return newMap;
        });
    };

    const handleUserStatusUpdate = (user) => {
        console.log('Received userStatusUpdate:', user);
        setOnlineUsers(prev => {
            const newMap = new Map(prev);
            const key = `${user.type}-${user.id}`;
            if (user.is_online) {
                newMap.set(key, user);
            } else {
                newMap.delete(key);
            }
            return newMap;
        });
    };

    // --- EVENT UNTUK STATUS MENGETIK ---
    const handleTypingUpdate = (data) => {
      console.log('Received typingUpdate:', data);
      const { roomId, users } = data;
      setTypingUsers(prev => {
        const newMap = new Map(prev);
        newMap.set(roomId, users);
        return newMap;
      });
    };
    const handleUpdateUnreadCount = (data) => {
      console.log('Received updateUnreadCount event:', data);
      // Teruskan event ini ke komponen lain (seperti useRooms)
      window.dispatchEvent(new CustomEvent('unreadCountUpdated', { detail: data }));
    };

    // Mulai mendengarkan semua event
    socket.on('newMessage', handleNewMessage);
    socket.on('messageEdited', handleMessageEdited);
    socket.on('messageDeleted', handleMessageDeleted);
    socket.on('initialOnlineUsers', handleInitialOnlineUsers);
    socket.on('userStatusUpdate', handleUserStatusUpdate);
    socket.on('typingUpdate', handleTypingUpdate); // <-- Tambahkan listener baru
    socket.on('updateUnreadCount', handleUpdateUnreadCount);

    // Fungsi cleanup
    return () => {
      socket.off('newMessage', handleNewMessage);
      socket.off('messageEdited', handleMessageEdited);
      socket.off('messageDeleted', handleMessageDeleted);
      socket.off('initialOnlineUsers', handleInitialOnlineUsers);
      socket.off('userStatusUpdate', handleUserStatusUpdate);
      socket.off('typingUpdate', handleTypingUpdate);
      socket.off('updateUnreadCount', handleUpdateUnreadCount);
    };
  }, [socket, activeChatId]);


  const getAllChats = useCallback(() => {
    return chats;
  }, [chats]);

  const getChatById = useCallback((chatId) => {
    return chats.find(chat => chat.id === parseInt(chatId));
  }, [chats]);

  const getChatMessages = useCallback((chatId) => {
    const messages = chatMessages[parseInt(chatId)] || [];

    return messages.map(msg => ({
      ...msg,
      isPinned: Object.values(pinnedMessages).some(pin => 
        pin.chatId === parseInt(chatId) && pin.messageId === msg.id
      )
    }));
  }, [chatMessages, pinnedMessages]);

  const addMessage = useCallback((chatId, message) => {
    const id = parseInt(chatId);
    setChatMessages(prev => ({
      ...prev,
      [id]: [...(prev[id] || []), { ...message, id: Date.now() }]
    }));

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
        const newStarred = { ...prev };
        delete newStarred[starKey];
        return newStarred;
      } else {
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

  const isMessageStarred = useCallback((chatId, messageId) => {
    return Object.values(starredMessages).some(star => 
      star.chatId === parseInt(chatId) && star.messageId === messageId
    );
  }, [starredMessages]);

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

  const isMessagePinned = useCallback((chatId, messageId) => {
    return Object.values(pinnedMessages).some(pin => 
      pin.chatId === parseInt(chatId) && pin.messageId === messageId
    );
  }, [pinnedMessages]);

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
        const newPinned = { ...prev };
        delete newPinned[pinKey];
        return newPinned;
      } else {
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

  const deleteMessage = useCallback((chatId, messageId) => {
    const id = parseInt(chatId);
    setChatMessages(prev => ({
      ...prev,
      [id]: prev[id]?.filter(msg => msg.id !== messageId) || []
    }));
  }, []);

  const updateMessage = useCallback((chatId, messageId, updates) => {
    const id = parseInt(chatId);
    setChatMessages(prev => ({
      ...prev,
      [id]: prev[id]?.map(msg => 
        msg.id === messageId ? { ...msg, ...updates } : msg
      ) || []
    }));
  }, []);

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
      roomId: chatData.roomId,
      roomMemberId: chatData.roomMemberId,
      adminId: chatData.adminId
    };
    
    setChats(prevChats => [...prevChats, newChat]);
    
    setChatMessages(prev => ({
      ...prev,
      [newChatId]: []
    }));
    
    return newChatId;
  };

  const deleteChat = useCallback((chatId) => {
    const id = parseInt(chatId);
    setChats(prev => prev.filter(chat => chat.id !== id));
    setChatMessages(prev => {
      const newMessages = { ...prev };
      delete newMessages[id];
      return newMessages;
    });
  }, []);

  const markChatAsRead = useCallback((chatId) => {
    const id = parseInt(chatId);
    setChats(prev => prev.map(chat => 
      chat.id === id ? { ...chat, unreadCount: 0 } : chat
    ));
  }, []);

  const updateChatOnlineStatus = useCallback((chatId, isOnline) => {
    const id = parseInt(chatId);
    setChats(prev => prev.map(chat => 
      chat.id === id ? { ...chat, isOnline } : chat
    ));
  }, []);

  const setActiveChat = useCallback((chatId) => {
    setActiveChatId(chatId);
  }, []);

  const clearActiveChat = useCallback(() => {
    setActiveChatId(null);
  }, []);

  const getChatByAdminId = useCallback((adminId) => {
    return chats.find(chat => chat.adminId === adminId && chat.type !== 'group');
  }, [chats]);

  const updateChatWithRoomData = useCallback((chatId, roomData) => {
    const id = parseInt(chatId);
    setChats(prev => prev.map(chat => 
      chat.id === id ? { 
        ...chat, 
        roomId: roomData.room_id,
        roomMemberId: roomData.room_member_id,
      } : chat
    ));
  }, []);

  const value = {
    chats,
    chatMessages,
    activeChatId,
    socket,
    setSocket,
    onlineUsers,
    typingUsers, // <-- Sediakan state typing ke context
    getAllChats,
    getChatById,
    getChatByAdminId,
    createNewChat,
    deleteChat,
    markChatAsRead,
    updateChatOnlineStatus,
    updateChatWithRoomData,
    setActiveChat,
    clearActiveChat,
    searchAllMessages,
    getChatMessages,
    addMessage,
    deleteMessage,
    updateMessage,
    getStarredMessages,
    toggleStarMessage,
    isMessageStarred,
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