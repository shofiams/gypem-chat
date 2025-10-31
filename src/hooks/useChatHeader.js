// src/hooks/useChatHeader.js
import { useMemo } from 'react';
import { useRoomDetails, useRooms } from './useRooms';
import { useChatContext } from '../api/use_chat_context';

export const useChatHeader = (chatId, isGroupChat) => {
  const { rooms, loading: roomsLoading } = useRooms();
  const { roomDetails, loading: roomDetailsLoading, error } = useRoomDetails(chatId);
  const { onlineUsers, typingUsers } = useChatContext();

  const headerData = useMemo(() => {
    const API_BASE_URL = import.meta.env.VITE_API_UPLOAD_PHOTO;
    
    const usersTypingInRoom = typingUsers.get(parseInt(chatId));

    if (!isGroupChat) {
      if (roomsLoading) return { name: 'Loading...', subtitle: '', isGroup: false };

      const chatFromList = rooms.find(room => room.room_id == chatId);

      if (chatFromList) {
        const onlineUserKey = `admin-${chatFromList.admin_id}`;
        const isOnline = onlineUsers.has(onlineUserKey);

        let subtitle = isOnline ? 'Online' : 'Offline';
        if (usersTypingInRoom && usersTypingInRoom.length > 0) {
          subtitle = 'mengetik...';
        }

        return {
          name: chatFromList.name,
          avatar: chatFromList.url_photo ? `${API_BASE_URL}/uploads/${chatFromList.url_photo}` : null,
          subtitle: subtitle,
          isOnline: isOnline,
          isGroup: false,
        };
      }
    }

    if (isGroupChat) {
      if (roomDetailsLoading) return { name: 'Loading...', subtitle: '', isGroup: true };
      if (error) return { name: 'Error', subtitle: 'Gagal memuat detail', isGroup: true };

      if (roomDetails) {
        const { room, members } = roomDetails;
        let subtitle;
        
        if (usersTypingInRoom && usersTypingInRoom.length > 0) {
          const names = usersTypingInRoom.map(u => u.name).join(', ');
          subtitle = `${names} sedang mengetik...`;
        } else {
          const memberNames = (members?.map(m => m.name) || []).slice(0, 5);
          subtitle = memberNames.join(', ');
          if (members?.length > 5) {
            subtitle += ', ...';
          }
        }

        return {
          name: room?.description?.name || 'Group Chat',
          avatar: room?.description?.url_photo ? `${API_BASE_URL}/uploads/${room.description.url_photo}` : null,
          subtitle: subtitle,
          isOnline: false,
          isGroup: true,
          memberCount: members?.length || 0,
        };
      }
    }

    return {
      name: 'Chat',
      avatar: null,
      subtitle: '',
      isOnline: false,
      isGroup: isGroupChat
    };
  }, [chatId, isGroupChat, roomDetails, roomDetailsLoading, error, rooms, roomsLoading, onlineUsers, typingUsers]);

  return headerData;
};