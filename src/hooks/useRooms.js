// src/hooks/useRooms.js
import { useState, useEffect, useCallback } from "react";
import { roomService } from "../api/roomService";
// --- AWAL PERUBAHAN ---
// 1. Import service yang kita butuhkan
import { messageService } from "../api/messageService";
import { authService } from "../api/auth";
// --- AKHIR PERUBAHAN ---

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
        // --- AWAL PERUBAHAN ---
        // 2. Ambil data pengguna yang sedang login untuk perbandingan
        const currentUser = authService.getCurrentUser();
        const currentUserId = currentUser?.user_id || null;

        // 3. Proses setiap room untuk mendapatkan info pesan terakhir
        const processedRooms = await Promise.all(
          result.data.map(async (room) => {
            // Dapatkan detail pesan dari room ini
            const messagesResult = await messageService.fetchMessagesByRoom(room.room_id);
            
            let lastMessageDetails = {};

            // Jika pesan ada, ambil yang terakhir
            if (messagesResult.success && messagesResult.data && messagesResult.data.length > 0) {
              const allMessages = messagesResult.data.flat();
              const lastMessage = allMessages[allMessages.length - 1];
              
              if (lastMessage) {
                // Tentukan apakah pesan terakhir adalah milik kita
                const isMine = lastMessage.sender_type === 'peserta';
                
                // Kumpulkan semua properti detail pesan terakhir
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
                  last_message_is_deleted: lastMessage.message_status?.is_deleted_for_me || lastMessage.is_deleted_globally,
                };
              }
            }

            // Gabungkan data room asli dengan detail pesan terakhir
            return {
              ...room,
              ...lastMessageDetails,
              // Tambahkan 'admin_id' untuk status online (logika ini sudah ada sebelumnya)
              admin_id: room.room_type === 'one_to_one'
                ? room.members?.find(m => m.member_type === 'admin')?.member_id
                : null
            };
          })
        );
        
        console.log("Processed rooms with last message details:", processedRooms);
        setRooms(processedRooms);
        return processedRooms;
        // --- AKHIR PERUBAHAN ---

      } else {
        setError(result.message);
        setRooms([]);
        return [];
      }
    } catch (err) {
      setError(err.message || "Failed to fetch rooms");
      setRooms([]);
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

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

// ... (sisa kode di file ini tidak perlu diubah)
export const useRoomDetails = (roomId) => {
  const [roomDetails, setRoomDetails] = useState(null);
  const [loading, setLoading] = useState(!!roomId);
  const [error, setError] = useState(null);

  const fetchRoomDetails = useCallback(async () => {
    if (!roomId) {
      setLoading(false);
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
      setError(err.message || "Failed to fetch room details");
      setRoomDetails(null);
      return null;
    } finally {
      setLoading(false);
    }
  }, [roomId]);

  useEffect(() => {
    if (roomId) {
      fetchRoomDetails();
    }
  }, [roomId, fetchRoomDetails]);

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