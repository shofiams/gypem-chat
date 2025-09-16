import { useMemo } from 'react';
import { useRoomDetails } from './useRooms';

export const useChatHeader = (chatId, isGroupChat) => {
  const { roomDetails } = useRoomDetails(isGroupChat ? chatId : null);
  
  const headerData = useMemo(() => {
    if (isGroupChat && roomDetails) {
      return {
        name: roomDetails.room?.description?.name || 'Group Chat',
        avatar: roomDetails.room?.description?.url_photo,
        subtitle: roomDetails.members?.length > 3 
          ? `${roomDetails.members.slice(0, 3).map(m => m.nama).join(', ')}...`
          : roomDetails.members?.map(m => m.nama).join(', ') || '',
        isOnline: false,
        isGroup: true,
        memberCount: roomDetails.members?.length || 0
      };
    } else {
      // For one-to-one chat, we still need room details from API
      // because the API structure treats all chats as "rooms"
      if (roomDetails && roomDetails.room?.room_type === 'one_to_one') {
        const otherMember = roomDetails.members?.find(member => 
          member.member_type !== 'admin' // assuming current user is admin, adjust logic as needed
        );
        
        return {
          name: otherMember?.nama || roomDetails.room?.description?.name || 'Chat',
          avatar: roomDetails.room?.description?.url_photo,
          subtitle: 'Online', // TODO: implement online status from API
          isOnline: true, // TODO: get from API
          isGroup: false
        };
      }
      
      // Fallback if no data available yet
      return {
        name: 'Chat',
        avatar: null,
        subtitle: 'Loading...',
        isOnline: false,
        isGroup: false
      };
    }
  }, [isGroupChat, roomDetails, chatId]);

  return headerData;
};