import React, { useState, useCallback, useEffect } from 'react';
import { ChatContext } from './use_chat_context';
import { db } from '../utils/db';
import { messageService } from './messageService';
import { getSocket, disconnectSocket } from './socketService';

export const ChatProvider = ({ children }) => {
  const [activeChatId, setActiveChatId] = useState(null);
  const [socket, setSocket] = useState(null);
  const [onlineUsers, setOnlineUsers] = useState(new Map());
  const [typingUsers, setTypingUsers] = useState(new Map());
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  const connectSocket = useCallback(() => {
    const socketInstance = getSocket();
    setSocket(socketInstance);
  }, []);

  const retryFailedMessages = useCallback(async (currentChatId) => {
    const failedMessages = await db.messages.where('status').anyOf(['pending', 'failed']).toArray();
    if (failedMessages.length === 0) return;

    console.log(`NETWORK: Retrying ${failedMessages.length} failed messages...`);
    for (const msg of failedMessages) {
      try {
        await db.messages.where('temp_id').equals(msg.temp_id).modify({ status: 'pending' });
        const result = await messageService.sendMessage(msg.room_id, {
          content: msg.content,
          reply_to_message_id: msg.reply_to_message_id,
        });

        if (result.success) {
          await db.messages.delete(msg.local_id);
          await db.messages.add({ ...result.data, status: 'delivered' });
        } else {
          await db.messages.where('temp_id').equals(msg.temp_id).modify({ status: 'failed' });
        }
      } catch (error) {
        console.error('NETWORK: Retry failed for message:', msg.temp_id, error);
        await db.messages.where('temp_id').equals(msg.temp_id).modify({ status: 'failed' });
      }
    }
    window.dispatchEvent(new CustomEvent('messagesUpdated', { detail: { roomId: currentChatId } }));
    window.dispatchEvent(new CustomEvent('chatListRefresh'));
  }, []);
  
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      console.log('NETWORK: Connection restored.');
      connectSocket();
      retryFailedMessages(activeChatId);
    };
    const handleOffline = () => {
      setIsOnline(false);
      console.log('NETWORK: You are now offline.');
      disconnectSocket();
      setSocket(null);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [activeChatId, retryFailedMessages, connectSocket]);

  useEffect(() => {
    if (!socket) return;

    // === SOCKET EVENT HANDLER: UPDATE CACHE ===
    const handleNewMessage = async (message) => {
      console.log('SOCKET: newMessage received', message);
      
      // 1. Update IndexedDB cache
      const existing = await db.messages.get({ message_id: message.message_id });
      if (!existing) {
        await db.messages.add({ ...message, status: 'delivered' });
        console.log('✅ Cache updated: new message added');
      }

      // 2. Update room's last message in cache
      await db.rooms.where('room_id').equals(message.room_id).modify({
        last_message: message.content,
        last_message_at: message.created_at
      });

      // 3. Trigger UI updates
      window.dispatchEvent(new CustomEvent('messagesUpdated', { detail: { roomId: message.room_id } }));
      window.dispatchEvent(new CustomEvent('chatListRefresh'));
    };

    const handleMessageEdited = async (editedMessage) => {
      console.log('SOCKET: messageEdited received:', editedMessage);
      
      // Update cache
      const existing = await db.messages.get({ message_id: editedMessage.message_id });
      if (existing) {
        await db.messages.update(existing.local_id, {
          content: editedMessage.content,
          edited_at: editedMessage.edited_at
        });
        console.log('✅ Cache updated: message edited');
      }

      // Trigger UI updates
      window.dispatchEvent(new CustomEvent('chatListRefresh'));
      if (editedMessage.room_id === activeChatId) {
         window.dispatchEvent(new CustomEvent('messagesUpdated', { detail: { roomId: editedMessage.room_id } }));
      }
    };

    const handleMessageDeleted = async (deletedData) => {
      console.log('SOCKET: messageDeleted received:', deletedData);
      
      // Remove from cache
      const existing = await db.messages.get({ message_id: deletedData.message_id });
      if (existing) {
        await db.messages.delete(existing.local_id);
        console.log('✅ Cache updated: message deleted');
      }

      // Trigger UI updates
      window.dispatchEvent(new CustomEvent('chatListRefresh'));
      if (deletedData.room_id === activeChatId) {
        window.dispatchEvent(new CustomEvent('messagesUpdated', { detail: { roomId: deletedData.room_id } }));
      }
    };

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
      window.dispatchEvent(new CustomEvent('unreadCountUpdated', { detail: data }));
    };

    // Register all socket listeners
    socket.on('newMessage', handleNewMessage);
    socket.on('messageEdited', handleMessageEdited);
    socket.on('messageDeleted', handleMessageDeleted);
    socket.on('initialOnlineUsers', handleInitialOnlineUsers);
    socket.on('userStatusUpdate', handleUserStatusUpdate);
    socket.on('typingUpdate', handleTypingUpdate);
    socket.on('updateUnreadCount', handleUpdateUnreadCount);

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

  const setActiveChat = useCallback((chatId) => {
    setActiveChatId(chatId);
  }, []);

  const clearActiveChat = useCallback(() => {
    setActiveChatId(null);
  }, []);

  const value = {
    activeChatId,
    setActiveChat,
    clearActiveChat,
    socket,
    setSocket,
    onlineUsers,
    typingUsers,
    isOnline,
  };

  return (
    <ChatContext.Provider value={value}>
      {children}
    </ChatContext.Provider>
  );
};