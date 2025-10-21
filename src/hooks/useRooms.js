// src/hooks/useRooms.js
import { useState, useEffect, useCallback } from "react";
import { roomService } from "../api/roomService";
import { messageService } from "../api/messageService";
import { authService } from "../api/auth";

export const useRooms = () => {
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchRooms = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const result = await roomService.fetchRooms();

      if (result.success) {
        const currentUser = authService.getCurrentUser();
        // Null check for currentUser before accessing properties
        const currentUserId = currentUser?.user_id || null;

        const processedRooms = await Promise.all(
          (result.data || []).map(async (room) => { // Added null check for result.data
            // Ensure room_id is valid before fetching messages
            if (!room || typeof room.room_id === 'undefined') {
                 console.warn("Skipping room due to missing room_id:", room);
                 return { ...room, admin_id: null }; // Return basic room data
             }
            const messagesResult = await messageService.fetchMessagesByRoom(room.room_id);

            let lastMessageDetails = {};

            // Added null check for messagesResult.data
            if (messagesResult.success && messagesResult.data && Array.isArray(messagesResult.data) && messagesResult.data.length > 0) {
              // Ensure data is an array before flattening
               const allMessages = Array.isArray(messagesResult.data) ? messagesResult.data.flat() : [];
               if (allMessages.length > 0) {
                   const lastMessage = allMessages[allMessages.length - 1];

                   if (lastMessage) {
                     const isMine = lastMessage.sender_type === 'peserta';
                     lastMessageDetails = {
                       last_message: lastMessage.content,
                       last_message_type: lastMessage.attachment ? lastMessage.attachment.file_type : 'text',
                       last_time: lastMessage.created_at,
                       is_last_message_mine: isMine,
                       last_message_status: lastMessage.message_status?.status || 'sent',
                       last_message_updated_at: lastMessage.updated_at,
                       last_message_created_at: lastMessage.created_at,
                       last_message_is_starred: lastMessage.message_status?.is_starred || false,
                       last_message_is_pinned: lastMessage.message_status?.is_pinned || false,
                       last_message_is_deleted: lastMessage.message_status?.is_deleted_for_me || lastMessage.is_deleted_globally || false, // Added default false
                     };
                   }
               }
            }

            // Calculate admin_id safely
            let admin_id = null;
            if (room.room_type === 'one_to_one' && Array.isArray(room.members)) {
                const adminMember = room.members.find(m => m && m.member_type === 'admin'); // Added null check for m
                admin_id = adminMember?.member_id || null; // Use optional chaining
            }

            return {
              ...room,
              ...lastMessageDetails,
              admin_id: admin_id // Use calculated admin_id
            };
          })
        );

        console.log("Processed rooms (including empty):", processedRooms);
        setRooms(processedRooms);
        return processedRooms;

      } else {
        setError(result.message || "Failed to fetch rooms: Unknown error"); // Added default error message
        setRooms([]);
        return [];
      }
    } catch (err) {
       console.error("Error fetching rooms:", err); // Log the actual error
      setError(err.message || "Failed to fetch rooms");
      setRooms([]);
      return [];
    } finally {
      setLoading(false);
    }
  }, []); // Removed messageService from dependency array as it's stable

  const addOptimisticRoom = useCallback((optimisticRoom) => {
    setRooms(currentRooms => [optimisticRoom, ...currentRooms]);
  }, []);

  const updateOptimisticRoom = useCallback((optimisticId, serverData) => {
    setRooms(currentRooms =>
      currentRooms.map(room =>
        room.optimisticId === optimisticId
          ? { ...serverData, optimisticId: undefined }
          : room
      )
    );
  }, []);

  const removeOptimisticRoom = useCallback((optimisticId) => {
    setRooms(currentRooms =>
      currentRooms.filter(room => room.optimisticId !== optimisticId)
    );
  }, []);

  useEffect(() => {
    fetchRooms();
  }, [fetchRooms]);

  return {
    rooms,
    loading,
    error,
    refetch: fetchRooms,
    addOptimisticRoom,
    updateOptimisticRoom,
    removeOptimisticRoom,
  };
};

// ... (sisa kode useRoomDetails dan useRoomOperations tetap sama)
export const useRoomDetails = (roomId) => {
  const [roomDetails, setRoomDetails] = useState(null);
  const [loading, setLoading] = useState(!!roomId);
  const [error, setError] = useState(null);

  const fetchRoomDetails = useCallback(async () => {
    // Check if roomId is actually a valid ID (not null, undefined, or potentially an optimistic ID string)
    if (!roomId || typeof roomId !== 'number') {
        // console.warn(`fetchRoomDetails: Invalid or missing roomId: ${roomId}. Skipping fetch.`);
        setLoading(false);
        // Optionally clear details if the ID becomes invalid
        // setRoomDetails(null);
        // setError(null);
        return;
    }


    setLoading(true);
    setError(null);

    try {
      const result = await roomService.fetchRoomDetails(roomId);

      if (result.success) {
        setRoomDetails(result.data);
        return result.data;
      } else {
        setError(result.message);
        setRoomDetails(null);
        return null;
      }
    } catch (err) {
      // Log specific error for debugging
      console.error(`Failed to fetch room details for ID ${roomId}:`, err);
      setError(err.message || "Failed to fetch room details");
      setRoomDetails(null);
      return null;
    } finally {
      setLoading(false);
    }
  }, [roomId]); // Dependency is correct

  useEffect(() => {
    // This effect runs whenever roomId changes
     fetchRoomDetails();
  }, [fetchRoomDetails]); // fetchRoomDetails includes roomId dependency

  return {
    roomDetails,
    loading,
    error,
    refetch: fetchRoomDetails,
  };
};

export const useRoomOperations = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const createPrivateRoom = useCallback(async (targetAdminId) => {
    setLoading(true);
    setError(null);

    try {
      const result = await roomService.createPrivateRoom(targetAdminId);

      if (result.success) {
        return { success: true, data: result.data, message: result.message };
      } else {
        setError(result.message);
        return { success: false, error: result.message };
      }
    } catch (err) {
      const errorMsg = err.message || "Failed to create private room";
      setError(errorMsg);
      return { success: false, error: errorMsg };
    } finally {
      setLoading(false);
    }
  }, []);

  const leave = useCallback(async (roomMemberId) => {
    setLoading(true);
    setError(null);

    try {
      const result = await roomService.leaveRoom(roomMemberId);

      if (result.success) {
        return { success: true, message: result.message };
      } else {
        setError(result.message);
        return { success: false, error: result.message };
      }
    } catch (err) {
      const errorMsg = err.message || "Failed to leave room";
      setError(errorMsg);
      return { success: false, error: errorMsg };
    } finally {
      setLoading(false);
    }
  }, []);

  const deleteRooms = useCallback(async (roomMemberIds) => {
    setLoading(true);
    setError(null);

    try {
      const result = await roomService.deleteRooms(roomMemberIds);

      if (result.success) {
        return { success: true, message: result.message };
      } else {
        setError(result.message);
        return { success: false, error: result.message };
      }
    } catch (err) {
      const errorMsg = err.message || "Failed to delete rooms";
      setError(errorMsg);
      return { success: false, error: errorMsg };
    } finally {
      setLoading(false);
    }
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    createPrivateRoom,
    leave,
    deleteRooms,
    loading,
    error,
    clearError,
  };
};