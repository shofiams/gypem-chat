import { useMemo } from 'react';
import { useRoomDetails, useRooms } from './useRooms';

export const useChatHeader = (chatId, isGroupChat) => {
  // =================================================================
  // PERBAIKAN: Panggil semua hooks di level atas tanpa kondisi.
  // =================================================================
  const { rooms, loading: roomsLoading } = useRooms();
  const { roomDetails, loading: roomDetailsLoading, error } = useRoomDetails(chatId);

  const headerData = useMemo(() => {
    const API_BASE_URL = import.meta.env.VITE_API_UPLOAD_PHOTO;

    // === LOGIKA UNTUK CHAT PERSONAL (ONE-TO-ONE) ===
    // Gunakan data dari `useRooms`
    if (!isGroupChat) {
      if (roomsLoading) return { name: 'Loading...', subtitle: '', isGroup: false };

      const chatFromList = rooms.find(room => room.room_id == chatId);

      if (chatFromList) {
        return {
          name: chatFromList.name,
          avatar: chatFromList.url_photo ? `${API_BASE_URL}/uploads/${chatFromList.url_photo}` : null,
          subtitle: 'Offline',
          isOnline: false,
          isGroup: false,
        };
      }
    }

    // === LOGIKA UNTUK GROUP CHAT ===
    // Gunakan data dari `useRoomDetails`
    if (isGroupChat) {
      if (roomDetailsLoading) return { name: 'Loading...', subtitle: '', isGroup: true };
      if (error) return { name: 'Error', subtitle: 'Gagal memuat detail', isGroup: true };

      if (roomDetails) {
        const { room, members } = roomDetails;
        
        const memberNames = members?.map(member => member.nama || `Peserta #${member.member_id}`) || [];

        return {
          name: room?.description?.name || 'Group Chat',
          avatar: room?.description?.url_photo ? `${API_BASE_URL}/uploads/${room.description.url_photo}` : null,
          subtitle: memberNames.length > 0
            ? memberNames.slice(0, 3).join(', ') + (memberNames.length > 3 ? '...' : '')
            : '',
          isOnline: false,
          isGroup: true,
          memberCount: members?.length || 0,
        };
      }
    }

    // Fallback jika data belum ada
    return {
      name: 'Chat',
      avatar: null,
      subtitle: '',
      isOnline: false,
      isGroup: isGroupChat
    };
  }, [chatId, isGroupChat, roomDetails, roomDetailsLoading, error, rooms, roomsLoading]);

  return headerData;
};