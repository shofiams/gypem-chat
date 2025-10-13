// src/hooks/useChatHeader.js
import { useMemo } from 'react';
import { useRoomDetails, useRooms } from './useRooms';
import { useChatContext } from '../api/use_chat_context';

export const useChatHeader = (chatId, isGroupChat) => {
  const { rooms, loading: roomsLoading } = useRooms();
  const { roomDetails, loading: roomDetailsLoading, error } = useRoomDetails(chatId);
  const { onlineUsers } = useChatContext();

  const headerData = useMemo(() => {
    const API_BASE_URL = import.meta.env.VITE_API_UPLOAD_PHOTO;

    if (!isGroupChat) {
      if (roomsLoading) return { name: 'Loading...', subtitle: '', isGroup: false };

      const chatFromList = rooms.find(room => room.room_id == chatId);

      if (chatFromList) {
        const onlineUserKey = `admin-${chatFromList.admin_id}`;
        const isOnline = onlineUsers.has(onlineUserKey);

        return {
          name: chatFromList.name,
          avatar: chatFromList.url_photo ? `${API_BASE_URL}/uploads/${chatFromList.url_photo}` : null,
          subtitle: isOnline ? 'Online' : 'Offline',
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
        const mappedMembers = members?.map(member => ({
          name: member.name,
          isAdmin: member.member_type === 'admin'
        })) || [];
        const sortedMembers = mappedMembers.sort((a, b) => {
          if (a.isAdmin && !b.isAdmin) return -1;
          if (!a.isAdmin && b.isAdmin) return 1;
          return a.name.localeCompare(b.name, 'id', { sensitivity: 'base' });
        });
        const memberNames = sortedMembers.map(m => m.name);
        const totalMembers = memberNames.length;
        let subtitle = '';
        if (totalMembers > 0) {
            const namesToShow = memberNames.slice(0, 5);
            subtitle = namesToShow.join(', ');
            if (totalMembers > 5) {
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
  }, [chatId, isGroupChat, roomDetails, roomDetailsLoading, error, rooms, roomsLoading, onlineUsers]);

  return headerData;
};