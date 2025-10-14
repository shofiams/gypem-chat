// src/hooks/useRooms.js
import { useState, useEffect, useCallback } from "react";
import { roomService } from "../api/roomService";

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
        // --- PERBAIKAN DI SINI ---
        // Olah data untuk menambahkan 'admin_id' ke level atas
        const processedRooms = result.data.map(room => {
          if (room.room_type === 'one_to_one' && room.members) {
            const adminMember = room.members.find(member => member.member_type === 'admin');
            if (adminMember) {
              return { ...room, admin_id: adminMember.member_id };
            }
          }
          return room;
        });
        
        console.log("Processed rooms with admin_id:", processedRooms);
        setRooms(processedRooms);
        return processedRooms;
        // --- AKHIR PERBAIKAN ---

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